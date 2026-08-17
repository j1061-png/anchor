"use client";

// BlockFit player. Mirrors the generator's placement semantics exactly:
// rotation = quarter turns clockwise with re-normalization, placement puts
// the rotated shape's bounding-box top-left at (row, col). No mid-placement
// clears — lines are counted on the accumulated end state, same as grade().
//
// Performance contract (this is a drag surface, so it matters):
//   * the board rect is measured once per drag, never per pointermove;
//   * the floating piece is moved by writing `transform` on a ref inside a
//     requestAnimationFrame — it never passes through React state;
//   * `setSnap` bails out unless the snapped anchor or its validity changed,
//     so a pointermove inside one cell costs nothing;
//   * every board cell is a `memo` component taking only primitive props, so
//     a snap change re-renders the handful of cells that actually differ;
//   * board cells transition `box-shadow` only. Nothing transitions on the
//     drag ghost — that is what made the old build feel rubbery.

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ProgressBar } from "@/components/ui/progress";
import { WhyThis } from "@/components/ui/why-this";
import type {
  BlockFitData,
  BlockFitPlacement,
  PuzzleProps,
} from "@/lib/types";

type Cell = [number, number];

/** Bumped when the coach mark's wording or target changes. */
const COACH_KEY = "anchor-blockfit-coach-v1";
/** A press shorter than this and steadier than TAP_PX counts as a tap. */
const TAP_MS = 250;
const TAP_PX = 6;
/** Board gap in px. Kept in JS because pointer→cell maths needs the pitch. */
const GAP = 4;
/** Cell size of the piece that follows the pointer. */
const OVERLAY_UNIT = 22;

function normalize(cells: Cell[]): Cell[] {
  const minR = Math.min(...cells.map(([r]) => r));
  const minC = Math.min(...cells.map(([, c]) => c));
  return cells
    .map(([r, c]): Cell => [r - minR, c - minC])
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
}

function rotateN(cells: Cell[], quarters: number): Cell[] {
  let out = normalize(cells);
  for (let i = 0; i < ((quarters % 4) + 4) % 4; i++) {
    out = normalize(out.map(([r, c]): Cell => [c, -r]));
  }
  return out;
}

const keyOf = (r: number, c: number) => r * 64 + c;
const extent = (shape: Cell[]) => ({
  rows: Math.max(...shape.map(([r]) => r)) + 1,
  cols: Math.max(...shape.map(([, c]) => c)) + 1,
});
const sameCell = (a: Cell | null, b: Cell | null) =>
  a === b || (!!a && !!b && a[0] === b[0] && a[1] === b[1]);
const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

interface Dragging {
  pieceId: number;
  rotation: 0 | 1 | 2 | 3;
  pointerType: string;
  /** Where the piece came from, so a cancelled drag knows where to put it. */
  origin: "tray" | "board";
  /** Pointer position at drag start — seeds the overlay's first transform. */
  x0: number;
  y0: number;
}

interface Snap {
  anchor: Cell | null;
  valid: boolean;
}

interface KeyboardCarry {
  pieceId: number;
  rotation: 0 | 1 | 2 | 3;
  anchor: Cell;
}

// ---------------------------------------------------------------------------
// One board cell. Primitive props only, so `memo` actually holds.
// ---------------------------------------------------------------------------

const RING = {
  0: "inset 0 0 0 1px var(--line)",
  1: "inset 0 0 0 2px color-mix(in srgb, var(--gold) 70%, transparent)",
  2: "inset 0 0 0 2px color-mix(in srgb, var(--gold) 90%, transparent)",
} as const;

const BoardCell = memo(function BoardCell({
  r,
  c,
  bg,
  ring,
  anim,
  delay,
  label,
  grabbable,
}: {
  r: number;
  c: number;
  bg: string;
  ring: 0 | 1 | 2;
  anim: "" | "pop" | "clear";
  delay: number;
  label: string;
  grabbable: boolean;
}) {
  return (
    <div
      role="gridcell"
      aria-label={label}
      data-r={r}
      data-c={c}
      className={`aspect-square rounded-[3px] ${
        grabbable ? "cursor-grab active:cursor-grabbing" : ""
      } ${
        anim === "clear"
          ? "animate-[line-clear_0.45s_var(--ease-out)_forwards]"
          : anim === "pop"
            ? "animate-[block-pop_0.18s_var(--ease-out)]"
            : ""
      }`}
      style={{
        background: bg,
        boxShadow: RING[ring],
        // Only the ring animates, and only when the goal state changes.
        transition: "box-shadow var(--t-fast) var(--ease-out)",
        animationDelay: anim === "clear" ? `${delay}ms` : undefined,
      }}
    />
  );
});

// ---------------------------------------------------------------------------
// The piece that follows the pointer. Positioned imperatively; `memo` keeps
// React out of the way entirely for the duration of a drag.
// ---------------------------------------------------------------------------

const DragPiece = memo(function DragPiece({
  innerRef,
  shape,
  color,
  pointerType,
  x0,
  y0,
}: {
  innerRef: React.RefObject<HTMLDivElement | null>;
  shape: Cell[];
  color: number;
  pointerType: string;
  x0: number;
  y0: number;
}) {
  const { rows, cols } = extent(shape);
  const filled = new Set(shape.map(([r, c]) => keyOf(r, c)));
  const ox = (cols * OVERLAY_UNIT) / 2;
  const oy =
    pointerType === "touch"
      ? rows * OVERLAY_UNIT + 28
      : (rows * OVERLAY_UNIT) / 2 + 6;
  return (
    <div
      ref={innerRef}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-50 grid"
      style={{
        gap: 2,
        gridTemplateColumns: `repeat(${cols}, ${OVERLAY_UNIT}px)`,
        transform: `translate3d(${Math.round(x0 - ox)}px, ${Math.round(y0 - oy)}px, 0)`,
        willChange: "transform",
        filter: "drop-shadow(var(--shadow-md))",
      }}
    >
      {Array.from({ length: rows * cols }, (_, i) => {
        const r = Math.floor(i / cols);
        const c = i % cols;
        const on = filled.has(keyOf(r, c));
        return (
          <span
            key={i}
            className="block rounded-[3px]"
            style={{
              width: OVERLAY_UNIT,
              height: OVERLAY_UNIT,
              background: on ? `var(--block-${color})` : "transparent",
            }}
          />
        );
      })}
    </div>
  );
});

// ---------------------------------------------------------------------------

export function BlockFitPuzzle({ puzzle, onSolve, onGrade }: PuzzleProps) {
  const data = puzzle.data as BlockFitData;
  const size = data.gridSize;
  const pieceCount = data.pieces.length;
  const target = data.targetLines;

  const [placements, setPlacements] = useState<Map<number, BlockFitPlacement>>(
    new Map(),
  );
  const [trayRotations, setTrayRotations] = useState<
    Record<number, 0 | 1 | 2 | 3>
  >({});
  const [dragging, setDragging] = useState<Dragging | null>(null);
  const [snap, setSnap] = useState<Snap>({ anchor: null, valid: false });
  const [carry, setCarry] = useState<KeyboardCarry | null>(null);
  const [attempts, setAttempts] = useState(1);
  const [announce, setAnnounce] = useState("");
  const [phase, setPhase] = useState<"play" | "grading" | "done">("play");
  const [outcome, setOutcome] = useState<{
    correct: boolean;
    timeMs: number;
  } | null>(null);
  const [clearedLines, setClearedLines] = useState<Set<string>>(new Set());
  const [lastPlaced, setLastPlaced] = useState<number | null>(null);
  const [showCoach, setShowCoach] = useState(false);

  const boardRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const pointRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef<number | null>(null);
  const dragRef = useRef<Dragging | null>(null);
  const snapRef = useRef<Snap>({ anchor: null, valid: false });
  const downRef = useRef<{ x: number; y: number; t: number; moved: number } | null>(
    null,
  );
  const startRef = useRef(performance.now());
  const answerRef = useRef<{ placements: BlockFitPlacement[] }>({
    placements: [],
  });

  // -------------------------------------------------------------------------
  // Derived board state
  // -------------------------------------------------------------------------

  const byId = useMemo(
    () => new Map(data.pieces.map((p) => [p.id, p])),
    [data.pieces],
  );

  // Every rotation of every piece, precomputed once.
  const shapeTable = useMemo(() => {
    const m = new Map<number, Cell[][]>();
    for (const p of data.pieces) {
      m.set(p.id, [0, 1, 2, 3].map((q) => rotateN(p.cells, q)));
    }
    return m;
  }, [data.pieces]);

  const shapeFor = useCallback(
    (pieceId: number, rotation: number) =>
      shapeTable.get(pieceId)?.[((rotation % 4) + 4) % 4] ?? [],
    [shapeTable],
  );

  const filledSet = useMemo(
    () => new Set(data.filled.map(([r, c]) => keyOf(r, c))),
    [data.filled],
  );

  // colour: cellKey -> 0 for a pre-filled block, 1..6 for a player's piece.
  // owner:  cellKey -> pieceId, so a placed piece can be picked back up.
  const board = useMemo(() => {
    const colour = new Map<number, number>();
    const owner = new Map<number, number>();
    for (const k of filledSet) colour.set(k, 0);
    for (const [pieceId, p] of placements) {
      const piece = byId.get(pieceId);
      if (!piece) continue;
      for (const [dr, dc] of shapeFor(pieceId, p.rotation)) {
        const k = keyOf(p.row + dr, p.col + dc);
        colour.set(k, piece.color);
        owner.set(k, pieceId);
      }
    }
    return { colour, owner };
  }, [filledSet, placements, byId, shapeFor]);

  // Complete lines, plus the single missing cell of any line that is one
  // block from complete — that highlight is what makes the goal legible.
  const lines = useMemo(() => {
    const complete: string[] = [];
    const completeCells = new Set<number>();
    const nearCells = new Set<number>();
    for (let i = 0; i < size; i++) {
      const rowGaps: number[] = [];
      const colGaps: number[] = [];
      for (let j = 0; j < size; j++) {
        if (!board.colour.has(keyOf(i, j))) rowGaps.push(j);
        if (!board.colour.has(keyOf(j, i))) colGaps.push(j);
      }
      if (rowGaps.length === 0) {
        complete.push(`r${i}`);
        for (let j = 0; j < size; j++) completeCells.add(keyOf(i, j));
      } else if (rowGaps.length === 1) {
        nearCells.add(keyOf(i, rowGaps[0]));
      }
      if (colGaps.length === 0) {
        complete.push(`c${i}`);
        for (let j = 0; j < size; j++) completeCells.add(keyOf(j, i));
      } else if (colGaps.length === 1) {
        nearCells.add(keyOf(colGaps[0], i));
      }
    }
    return { complete, completeCells, nearCells };
  }, [board.colour, size]);

  const canPlaceAt = useCallback(
    (pieceId: number, rotation: number, anchor: Cell): boolean => {
      const shape = shapeFor(pieceId, rotation);
      if (shape.length === 0) return false;
      for (const [dr, dc] of shape) {
        const r = anchor[0] + dr;
        const c = anchor[1] + dc;
        if (r < 0 || r >= size || c < 0 || c >= size) return false;
        if (board.colour.has(keyOf(r, c))) return false;
      }
      return true;
    },
    [shapeFor, board.colour, size],
  );

  // Latest derived helpers, readable from the rAF loop without re-binding it.
  const liveRef = useRef({ canPlaceAt, shapeFor });
  useEffect(() => {
    liveRef.current = { canPlaceAt, shapeFor };
  }, [canPlaceAt, shapeFor]);

  // -------------------------------------------------------------------------
  // Placement mutations
  // -------------------------------------------------------------------------

  const dismissCoach = useCallback(() => {
    setShowCoach(false);
    try {
      window.localStorage.setItem(COACH_KEY, "done");
    } catch {
      // A private-mode failure just means the mark returns next session.
    }
  }, []);

  const place = useCallback(
    (pieceId: number, rotation: 0 | 1 | 2 | 3, anchor: Cell) => {
      setPlacements((prev) => {
        const next = new Map(prev);
        next.set(pieceId, { pieceId, rotation, row: anchor[0], col: anchor[1] });
        return next;
      });
      setLastPlaced(pieceId);
      setAnnounce(
        `Placed at row ${anchor[0] + 1}, column ${anchor[1] + 1}.`,
      );
      dismissCoach();
    },
    [dismissCoach],
  );

  const removePlacement = useCallback((pieceId: number) => {
    setPlacements((prev) => {
      if (!prev.has(pieceId)) return prev;
      const next = new Map(prev);
      next.delete(pieceId);
      return next;
    });
  }, []);

  const returnToTray = useCallback(
    (pieceId: number, rotation: 0 | 1 | 2 | 3, quiet = false) => {
      removePlacement(pieceId);
      setTrayRotations((prev) =>
        prev[pieceId] === rotation ? prev : { ...prev, [pieceId]: rotation },
      );
      if (!quiet) setAnnounce("Piece is back in the tray.");
    },
    [removePlacement],
  );

  // -------------------------------------------------------------------------
  // Pointer dragging
  // -------------------------------------------------------------------------

  // Pointer position -> snapped anchor, clamped so the piece always sits fully
  // on the grid, and null once the pointer leaves the board by ~a cell.
  const anchorFromPointer = useCallback(
    (
      x: number,
      y: number,
      pieceId: number,
      rotation: number,
      pointerType: string,
    ): Cell | null => {
      const rect = rectRef.current;
      if (!rect || rect.width <= 0) return null;
      const cellW = (rect.width - (size - 1) * GAP) / size;
      const cellH = (rect.height - (size - 1) * GAP) / size;
      if (cellW <= 0 || cellH <= 0) return null;
      const pitchX = cellW + GAP;
      const pitchY = cellH + GAP;
      const pad = Math.max(pitchX, pitchY);
      if (
        x < rect.left - pad ||
        x > rect.right + pad ||
        y < rect.top - pad ||
        y > rect.bottom + pad
      ) {
        return null;
      }
      const shape = liveRef.current.shapeFor(pieceId, rotation);
      if (shape.length === 0) return null;
      const { rows, cols } = extent(shape);
      // Touch holds the piece above the finger so it stays visible.
      const lift = pointerType === "touch" ? 1.4 : 0;
      const rowF = (y - rect.top - cellH / 2) / pitchY - lift;
      const colF = (x - rect.left - cellW / 2) / pitchX;
      return [
        clamp(Math.round(rowF - (rows - 1) / 2), 0, Math.max(0, size - rows)),
        clamp(Math.round(colF - (cols - 1) / 2), 0, Math.max(0, size - cols)),
      ];
    },
    [size],
  );

  const tick = useCallback(() => {
    frameRef.current = null;
    const d = dragRef.current;
    if (!d) return;
    const { x, y } = pointRef.current;

    const anchor = anchorFromPointer(x, y, d.pieceId, d.rotation, d.pointerType);
    const valid = anchor
      ? liveRef.current.canPlaceAt(d.pieceId, d.rotation, anchor)
      : false;

    // The floating piece never goes through React state.
    const el = overlayRef.current;
    if (el) {
      const shape = liveRef.current.shapeFor(d.pieceId, d.rotation);
      const { rows, cols } = extent(shape);
      const ox = (cols * OVERLAY_UNIT) / 2;
      const oy =
        d.pointerType === "touch"
          ? rows * OVERLAY_UNIT + 28
          : (rows * OVERLAY_UNIT) / 2 + 6;
      el.style.transform = `translate3d(${Math.round(x - ox)}px, ${Math.round(y - oy)}px, 0)`;
      // Over the board, the on-grid ghost is the preview; hide the duplicate.
      el.style.opacity = anchor ? "0" : "1";
    }

    const prev = snapRef.current;
    if (sameCell(prev.anchor, anchor) && prev.valid === valid) return;
    snapRef.current = { anchor, valid };
    setSnap({ anchor, valid });
  }, [anchorFromPointer]);

  const beginDrag = useCallback(
    (
      e: React.PointerEvent,
      pieceId: number,
      rotation: 0 | 1 | 2 | 3,
      origin: "tray" | "board",
    ) => {
      // Stops the browser turning the drag into a text selection / native
      // image drag, which would swallow the pointermove stream.
      e.preventDefault();
      const el = e.currentTarget as HTMLElement;
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        // Capture is a nicety; the window-level handlers still finish the drag.
      }
      // Measured once. Refreshed only on resize/scroll, never per move.
      rectRef.current = boardRef.current?.getBoundingClientRect() ?? null;
      pointRef.current = { x: e.clientX, y: e.clientY };
      downRef.current = {
        x: e.clientX,
        y: e.clientY,
        t: performance.now(),
        moved: 0,
      };
      snapRef.current = { anchor: null, valid: false };
      setSnap({ anchor: null, valid: false });
      setCarry(null);
      const next: Dragging = {
        pieceId,
        rotation,
        pointerType: e.pointerType,
        origin,
        x0: e.clientX,
        y0: e.clientY,
      };
      dragRef.current = next;
      setDragging(next);
    },
    [],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return;
      pointRef.current = { x: e.clientX, y: e.clientY };
      const down = downRef.current;
      if (down) {
        down.moved = Math.max(
          down.moved,
          Math.hypot(e.clientX - down.x, e.clientY - down.y),
        );
      }
      if (frameRef.current === null) {
        frameRef.current = requestAnimationFrame(tick);
      }
    },
    [tick],
  );

  const endDrag = useCallback(
    (commit: boolean) => {
      const d = dragRef.current;
      if (!d) return;
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      dragRef.current = null;
      const down = downRef.current;
      downRef.current = null;
      snapRef.current = { anchor: null, valid: false };
      setDragging(null);
      setSnap({ anchor: null, valid: false });

      // Resolve the drop from the final pointer position rather than the last
      // rendered snap: a flick can be released before the next frame runs.
      const { x, y } = pointRef.current;
      const anchor = anchorFromPointer(
        x,
        y,
        d.pieceId,
        d.rotation,
        d.pointerType,
      );
      const valid = anchor
        ? liveRef.current.canPlaceAt(d.pieceId, d.rotation, anchor)
        : false;

      // A tap is short AND steady. Anything else is a drag, so 1px of jitter
      // can no longer eat a rotation.
      const tap =
        !!down &&
        down.moved < TAP_PX &&
        performance.now() - down.t < TAP_MS;

      if (!commit) {
        returnToTray(d.pieceId, d.rotation, true);
        return;
      }

      if (tap) {
        if (d.origin === "board") {
          returnToTray(d.pieceId, d.rotation);
        } else if (data.rotatable) {
          setTrayRotations((prev) => ({
            ...prev,
            [d.pieceId]: (((prev[d.pieceId] ?? 0) + 1) % 4) as 0 | 1 | 2 | 3,
          }));
          setAnnounce("Piece turned a quarter turn.");
        } else {
          setAnnounce("Drag this piece onto the grid.");
        }
        return;
      }

      if (anchor && valid) place(d.pieceId, d.rotation, anchor);
      else returnToTray(d.pieceId, d.rotation);
    },
    [anchorFromPointer, data.rotatable, place, returnToTray],
  );

  const onTrayPointerDown = (pieceId: number) => (e: React.PointerEvent) => {
    if (phase !== "play" || dragRef.current) return;
    if (carry?.pieceId === pieceId) return;
    const placed = placements.get(pieceId);
    if (placed) {
      removePlacement(pieceId);
      beginDrag(e, pieceId, placed.rotation, "board");
    } else {
      beginDrag(e, pieceId, trayRotations[pieceId] ?? 0, "tray");
    }
  };

  // Delegated: one handler for the whole board instead of 100 cell handlers.
  const onBoardPointerDown = (e: React.PointerEvent) => {
    if (phase !== "play" || dragRef.current) return;
    const el = e.target as HTMLElement;
    const rs = el.dataset?.r;
    const cs = el.dataset?.c;
    if (rs === undefined || cs === undefined) return;
    const pieceId = board.owner.get(keyOf(Number(rs), Number(cs)));
    if (pieceId === undefined) return;
    const placed = placements.get(pieceId);
    if (!placed) return;
    removePlacement(pieceId);
    beginDrag(e, pieceId, placed.rotation, "board");
  };

  // Keep the cached rect honest for the length of a drag.
  useEffect(() => {
    if (!dragging) return;
    const refresh = () => {
      rectRef.current = boardRef.current?.getBoundingClientRect() ?? null;
    };
    window.addEventListener("resize", refresh);
    window.addEventListener("scroll", refresh, true);
    const prevent = (e: TouchEvent) => e.preventDefault();
    document.addEventListener("touchmove", prevent, { passive: false });
    return () => {
      window.removeEventListener("resize", refresh);
      window.removeEventListener("scroll", refresh, true);
      document.removeEventListener("touchmove", prevent);
    };
  }, [dragging]);

  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  // -------------------------------------------------------------------------
  // Keyboard carrying. The tray button stays mounted while a piece is in hand,
  // so focus is never lost; the listener sits on the document as a belt.
  // -------------------------------------------------------------------------

  const pickUpWithKeyboard = (pieceId: number) => {
    if (phase !== "play") return;
    const placed = placements.get(pieceId);
    const rotation = placed?.rotation ?? trayRotations[pieceId] ?? 0;
    const anchor: Cell = placed ? [placed.row, placed.col] : [0, 0];
    if (placed) removePlacement(pieceId);
    setCarry({ pieceId, rotation, anchor });
    setAnnounce(
      `Piece in hand at row ${anchor[0] + 1}, column ${anchor[1] + 1}. Arrow keys move it${
        data.rotatable ? ", R turns it" : ""
      }, Enter drops it, Escape puts it back.`,
    );
  };

  useEffect(() => {
    if (!carry || phase !== "play") return;
    const onKey = (e: KeyboardEvent) => {
      const { pieceId, rotation, anchor } = carry;
      const shape = shapeFor(pieceId, rotation);
      const { rows, cols } = extent(shape);
      const move = (dr: number, dc: number) => {
        e.preventDefault();
        const next: Cell = [
          clamp(anchor[0] + dr, 0, Math.max(0, size - rows)),
          clamp(anchor[1] + dc, 0, Math.max(0, size - cols)),
        ];
        setCarry({ pieceId, rotation, anchor: next });
        setAnnounce(
          `Row ${next[0] + 1}, column ${next[1] + 1}${
            canPlaceAt(pieceId, rotation, next) ? "" : ", blocked"
          }.`,
        );
      };
      switch (e.key) {
        case "ArrowUp":
          return move(-1, 0);
        case "ArrowDown":
          return move(1, 0);
        case "ArrowLeft":
          return move(0, -1);
        case "ArrowRight":
          return move(0, 1);
        case "r":
        case "R": {
          if (!data.rotatable) return;
          e.preventDefault();
          const rot = ((rotation + 1) % 4) as 0 | 1 | 2 | 3;
          const turned = extent(shapeFor(pieceId, rot));
          setCarry({
            pieceId,
            rotation: rot,
            anchor: [
              clamp(anchor[0], 0, Math.max(0, size - turned.rows)),
              clamp(anchor[1], 0, Math.max(0, size - turned.cols)),
            ],
          });
          setAnnounce("Turned a quarter turn.");
          return;
        }
        case " ":
        case "Enter":
          e.preventDefault();
          if (canPlaceAt(pieceId, rotation, anchor)) {
            place(pieceId, rotation, anchor);
            setCarry(null);
          } else {
            setAnnounce("That spot is blocked. Move it somewhere empty.");
          }
          return;
        case "Escape":
          e.preventDefault();
          setCarry(null);
          returnToTray(pieceId, rotation);
          return;
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [
    carry,
    phase,
    size,
    data.rotatable,
    shapeFor,
    canPlaceAt,
    place,
    returnToTray,
  ]);

  // -------------------------------------------------------------------------
  // Coach mark
  // -------------------------------------------------------------------------

  useEffect(() => {
    try {
      setShowCoach(window.localStorage.getItem(COACH_KEY) !== "done");
    } catch {
      setShowCoach(false);
    }
  }, []);

  // -------------------------------------------------------------------------
  // Submit / reset
  // -------------------------------------------------------------------------

  const placedCount = placements.size;
  const linesDone = lines.complete.length;
  const allPlaced = placedCount === pieceCount;
  const targetReached = linesDone >= target;
  const canCheck = allPlaced || targetReached;

  const blockedReason = canCheck
    ? null
    : placedCount === 0
      ? `Drag all ${pieceCount} pieces onto the grid, then check.`
      : `${pieceCount - placedCount} ${
          pieceCount - placedCount === 1 ? "piece" : "pieces"
        } still in the tray. Place ${
          pieceCount - placedCount === 1 ? "it" : "them"
        }, or finish ${target - linesDone} more ${
          target - linesDone === 1 ? "line" : "lines"
        }, to check.`;

  const submit = async () => {
    if (phase !== "play") return;
    setPhase("grading");
    const answer = { placements: [...placements.values()] };
    answerRef.current = answer;
    try {
      const result = await onGrade(answer);
      const timeMs = Math.round(performance.now() - startRef.current);
      if (result.correct) setClearedLines(new Set(lines.complete));
      setOutcome({ correct: result.correct, timeMs });
      setPhase("done");
      setAnnounce(
        result.correct
          ? `Solved. ${linesDone} ${linesDone === 1 ? "line" : "lines"} cleared.`
          : "Not this time. The worked solution is below.",
      );
    } catch {
      setPhase("play");
      setAnnounce("That didn't save. Check your connection and try again.");
    }
  };

  const reset = () => {
    if (phase !== "play") return;
    setPlacements(new Map());
    setCarry(null);
    setLastPlaced(null);
    setAttempts((a) => a + 1);
    setAnnounce("Board cleared. Every piece is back in the tray.");
  };

  const advance = () => {
    if (!outcome) return;
    onSolve({
      correct: outcome.correct,
      timeMs: outcome.timeMs,
      hintsUsed: 0,
      attempts,
      answer: answerRef.current,
    });
  };

  // -------------------------------------------------------------------------
  // Ghost preview (pointer drag or keyboard carry)
  // -------------------------------------------------------------------------

  const ghost = useMemo(() => {
    const active =
      dragging && snap.anchor
        ? {
            pieceId: dragging.pieceId,
            rotation: dragging.rotation,
            anchor: snap.anchor,
            valid: snap.valid,
          }
        : carry
          ? {
              pieceId: carry.pieceId,
              rotation: carry.rotation,
              anchor: carry.anchor,
              valid: canPlaceAt(carry.pieceId, carry.rotation, carry.anchor),
            }
          : null;
    if (!active) return null;
    const piece = byId.get(active.pieceId);
    if (!piece) return null;
    const cells = new Set(
      shapeFor(active.pieceId, active.rotation)
        .map(([dr, dc]): Cell => [active.anchor[0] + dr, active.anchor[1] + dc])
        .filter(([r, c]) => r >= 0 && r < size && c >= 0 && c < size)
        .map(([r, c]) => keyOf(r, c)),
    );
    return { cells, valid: active.valid, color: piece.color };
  }, [dragging, snap, carry, canPlaceAt, byId, shapeFor, size]);

  const lineWord = target === 1 ? "line" : "lines";
  const sampleColor = data.pieces[0]?.color ?? 1;

  return (
    <div
      className={`flex flex-col gap-4 ${dragging ? "select-none" : ""}`}
      onPointerMove={onPointerMove}
      onPointerUp={() => endDrag(true)}
      onPointerCancel={() => endDrag(false)}
    >
      {/* ---- What this is and what to do ---------------------------------- */}
      <div className="well flex flex-col gap-2.5 p-3.5">
        <p className="text-[0.9375rem] leading-snug font-semibold">
          Fill <span className="num">{target}</span> complete {lineWord}.
        </p>
        <p className="text-[0.8125rem] leading-relaxed text-text-2">
          A line is one whole row or one whole column with no gaps left in it.
          Drag the {pieceCount} pieces from the tray onto the grid — they cannot
          overlap the dark blocks or each other.
          {data.rotatable ? " Tap a piece to turn it a quarter turn." : ""}
        </p>

        <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-[0.75rem] text-text-2">
          <Legend
            swatch="color-mix(in srgb, var(--text) 66%, var(--surface))"
            label="Already filled"
          />
          <Legend swatch={`var(--block-${sampleColor})`} label="Your pieces" />
          <Legend
            swatch="color-mix(in srgb, var(--gold) 20%, var(--sunken))"
            ring={1}
            label="One block from a line"
          />
          <Legend
            swatch="color-mix(in srgb, var(--text) 66%, var(--surface))"
            ring={2}
            label="Line complete"
          />
        </ul>
      </div>

      {/* ---- Live progress ------------------------------------------------ */}
      <div className="flex items-center gap-3">
        <p className="t-eyebrow shrink-0">Lines complete</p>
        <ProgressBar
          value={Math.min(1, linesDone / Math.max(1, target))}
          color="var(--gold)"
          className="flex-1"
          label={`${linesDone} of ${target} lines complete`}
        />
        <p className="num shrink-0 text-sm" aria-hidden>
          {linesDone}/{target}
        </p>
      </div>

      {/* ---- Board -------------------------------------------------------- */}
      <div
        className={`mx-auto w-full max-w-[420px] rounded-[var(--r-md)] ${
          phase === "done" && outcome
            ? outcome.correct
              ? "animate-[flash-correct_0.6s]"
              : "animate-[flash-wrong_0.6s]"
            : ""
        }`}
      >
        <div
          ref={boardRef}
          role="grid"
          aria-label={`${size} by ${size} board`}
          className="flex touch-none flex-col select-none"
          style={{ gap: GAP }}
          onPointerDown={onBoardPointerDown}
        >
          {Array.from({ length: size }, (_, r) => (
            <div
              key={r}
              role="row"
              className="grid"
              style={{
                gap: GAP,
                gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: size }, (__, c) => {
                const k = keyOf(r, c);
                const fill = board.colour.get(k);
                const inGhost = ghost?.cells.has(k) ?? false;
                const near = lines.nearCells.has(k);
                const complete = lines.completeCells.has(k);
                const owner = board.owner.get(k);

                let bg: string;
                if (inGhost) {
                  bg = ghost!.valid
                    ? `color-mix(in srgb, var(--block-${ghost!.color}) 62%, var(--surface))`
                    : "color-mix(in srgb, var(--brand) 30%, var(--surface))";
                } else if (fill === 0) {
                  bg = "color-mix(in srgb, var(--text) 66%, var(--surface))";
                } else if (fill) {
                  bg = `var(--block-${fill})`;
                } else if (near) {
                  bg = "color-mix(in srgb, var(--gold) 20%, var(--sunken))";
                } else {
                  bg = "var(--sunken)";
                }

                const clearing =
                  clearedLines.has(`r${r}`) || clearedLines.has(`c${c}`);
                const anim: "" | "pop" | "clear" = clearing
                  ? "clear"
                  : owner !== undefined && owner === lastPlaced
                    ? "pop"
                    : "";

                const state =
                  fill === 0
                    ? "filled block"
                    : fill
                      ? "your block"
                      : near
                        ? "empty, one block from a full line"
                        : "empty";

                return (
                  <BoardCell
                    key={c}
                    r={r}
                    c={c}
                    bg={bg}
                    ring={complete ? 2 : near ? 1 : 0}
                    anim={anim}
                    delay={(r + c) * 25}
                    grabbable={owner !== undefined && phase === "play"}
                    label={`Row ${r + 1} column ${c + 1}, ${state}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ---- First-run coach mark ----------------------------------------- */}
      {showCoach && phase === "play" && (
        <div className="fade-in mx-auto flex w-full max-w-[420px] items-start gap-2.5 rounded-[var(--r-md)] border border-brand/25 bg-[var(--brand-soft)] p-3">
          <Icon
            name="arrowRight"
            size={16}
            className="mt-0.5 shrink-0 -rotate-90 text-brand"
          />
          <p className="flex-1 text-[0.8125rem] leading-relaxed text-text">
            Drag a piece up from the tray onto the grid. Fill a whole row or
            column and that line counts.
          </p>
          <button
            type="button"
            onClick={dismissCoach}
            className="-my-1 -mr-1 shrink-0 cursor-pointer rounded-[var(--r-xs)] px-2 py-1 text-xs font-semibold text-brand hover:bg-brand/10"
          >
            Got it
          </button>
        </div>
      )}

      {/* ---- Tray. All pieces stay mounted, so focus is never lost. -------- */}
      <div
        role="toolbar"
        aria-label="your pieces"
        aria-orientation="horizontal"
        className="flex min-h-28 flex-wrap items-stretch justify-center gap-3"
      >
        {data.pieces.map((piece, i) => {
          const placed = placements.get(piece.id);
          const carrying = carry?.pieceId === piece.id;
          const isDragging = dragging?.pieceId === piece.id;
          const rotation = carrying
            ? carry!.rotation
            : (placed?.rotation ?? trayRotations[piece.id] ?? 0);
          const shape = shapeFor(piece.id, rotation);
          const { rows, cols } = extent(shape);
          const cellSet = new Set(shape.map(([r, c]) => keyOf(r, c)));

          const status = isDragging
            ? "moving"
            : carrying
              ? "in hand"
              : placed
                ? "on the board"
                : "in the tray";

          const label = placed
            ? `Piece ${i + 1}, ${piece.cells.length} blocks, on the board at row ${
                placed.row + 1
              }, column ${placed.col + 1}. Press Enter to pick it back up.`
            : carrying
              ? `Piece ${i + 1} in hand at row ${carry!.anchor[0] + 1}, column ${
                  carry!.anchor[1] + 1
                }. Arrow keys move it${data.rotatable ? ", R turns it" : ""}, Enter drops it, Escape puts it back.`
              : `Piece ${i + 1}, ${piece.cells.length} blocks, in the tray. Press Enter to pick it up with the keyboard${
                  data.rotatable ? ", or tap it to turn it" : ""
                }.`;

          return (
            <button
              key={piece.id}
              type="button"
              aria-label={label}
              aria-pressed={carrying || undefined}
              disabled={phase !== "play"}
              onPointerDown={onTrayPointerDown(piece.id)}
              onKeyDown={(e) => {
                if (carry) return; // the document handler owns the carry keys
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  pickUpWithKeyboard(piece.id);
                }
              }}
              className={`flex min-h-24 min-w-24 cursor-grab touch-none flex-col items-center justify-between gap-1.5 rounded-[var(--r-md)] border p-2 active:cursor-grabbing disabled:cursor-default ${
                carrying
                  ? "border-brand bg-[var(--brand-soft)]"
                  : "border-[var(--line)] bg-raised"
              }`}
              style={{ opacity: isDragging ? 0.25 : placed ? 0.45 : 1 }}
            >
              <span
                className="grid flex-1 place-content-center"
                style={{
                  gap: 2,
                  gridTemplateColumns: `repeat(${cols}, 16px)`,
                }}
              >
                {Array.from({ length: rows * cols }, (_, n) => {
                  const r = Math.floor(n / cols);
                  const c = n % cols;
                  return (
                    <span
                      key={n}
                      className="block size-4 rounded-[2px]"
                      style={{
                        background: cellSet.has(keyOf(r, c))
                          ? `var(--block-${piece.color})`
                          : "transparent",
                      }}
                    />
                  );
                })}
              </span>
              <span className="text-[0.6875rem] font-medium text-text-3">
                {status}
              </span>
            </button>
          );
        })}
      </div>

      {data.rotatable && phase === "play" && (
        <p className="flex items-center justify-center gap-1.5 text-[0.75rem] text-text-3">
          <Icon name="rotate" size={13} />
          Tap a piece to turn it. With the keyboard: Enter to pick up, arrows to
          move, R to turn.
        </p>
      )}

      {/* ---- The piece that follows the pointer ---------------------------- */}
      {dragging && (
        <DragPiece
          innerRef={overlayRef}
          shape={shapeFor(dragging.pieceId, dragging.rotation)}
          color={byId.get(dragging.pieceId)?.color ?? 1}
          pointerType={dragging.pointerType}
          x0={dragging.x0}
          y0={dragging.y0}
        />
      )}

      {/* ---- Controls ------------------------------------------------------ */}
      {phase === "done" && outcome ? (
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={advance}>
            Next puzzle
            <Icon name="arrowRight" size={16} />
          </Button>
          <p className="text-sm text-text-2">
            {outcome.correct
              ? `${linesDone} ${linesDone === 1 ? "line" : "lines"} cleared. Read the note below first — it is not going anywhere.`
              : "The worked solution is below. Read it, then carry on."}
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <Button
            onClick={submit}
            loading={phase === "grading"}
            disabled={!canCheck || phase !== "play"}
          >
            Check my placement
          </Button>
          <Button
            variant="secondary"
            onClick={reset}
            disabled={phase !== "play" || placedCount === 0}
          >
            Take it all back
          </Button>
          {blockedReason && (
            <p className="w-full text-sm text-text-2 sm:w-auto sm:flex-1">
              {blockedReason}
            </p>
          )}
        </div>
      )}

      <WhyThis k="desirableDifficulty" />

      <p aria-live="polite" className="sr-only">
        {announce}
      </p>
    </div>
  );
}

function Legend({
  swatch,
  ring = 0,
  label,
}: {
  swatch: string;
  ring?: 0 | 1 | 2;
  label: string;
}) {
  return (
    <li className="flex items-center gap-1.5">
      <span
        aria-hidden
        className="block size-3.5 shrink-0 rounded-[3px]"
        style={{ background: swatch, boxShadow: RING[ring] }}
      />
      {label}
    </li>
  );
}
