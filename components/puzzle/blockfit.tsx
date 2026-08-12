"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type {
  BlockFitData,
  BlockFitPlacement,
  PuzzleProps,
} from "@/lib/types";

type Cell = [number, number];

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

interface Drag {
  pieceId: number;
  rotation: 0 | 1 | 2 | 3;
  x: number;
  y: number;
  pointerType: string;
  anchor: Cell | null;
  valid: boolean;
}

interface KeyboardCarry {
  pieceId: number;
  rotation: 0 | 1 | 2 | 3;
  anchor: Cell;
}

interface GridCellProps {
  r: number;
  c: number;
  color: number | undefined;
  inGhost: boolean;
  ghostValid: boolean;
  ghostColor: number;
  inClearedLine: boolean;
  inCompleteLine: boolean;
}

const GridCell = memo(function GridCell({
  color,
  inGhost,
  ghostValid,
  ghostColor,
  inClearedLine,
  inCompleteLine,
}: GridCellProps) {
  return (
    <div
      role="gridcell"
      aria-label={color === 0 ? "filled" : color ? "your block" : "empty"}
      className={`aspect-square rounded-[2px] border transition-colors duration-75 ${
        inGhost
          ? ghostValid ? "border-accent" : "border-slate/40"
          : "border-ink/10"
      } ${inClearedLine ? "animate-[line-clear_0.4s_forwards]" : ""}`}
      style={{
        background: inGhost
          ? ghostValid
            ? `color-mix(in srgb, var(--block-${ghostColor}) 55%, var(--chalk))`
            : "var(--paper)"
          : color === 0
            ? "color-mix(in srgb, var(--ink) 65%, var(--chalk))"
            : color
              ? `var(--block-${color})`
              : inCompleteLine
                ? "color-mix(in srgb, var(--gold) 30%, var(--chalk))"
                : "var(--chalk)",
      }}
    />
  );
});

export function BlockFitPuzzle({ puzzle, onSolve, onGrade }: PuzzleProps) {
  const data = puzzle.data as BlockFitData;
  const size = data.gridSize;

  const [placements, setPlacements] = useState<Map<number, BlockFitPlacement>>(new Map());
  const [trayRotations, setTrayRotations] = useState<Record<number, 0 | 1 | 2 | 3>>({});
  const [drag, setDrag] = useState<Drag | null>(null);
  const [carry, setCarry] = useState<KeyboardCarry | null>(null);
  const [attempts, setAttempts] = useState(1);
  const [announce, setAnnounce] = useState("");
  const [phase, setPhase] = useState<"play" | "grading" | "done">("play");
  const [flash, setFlash] = useState<"correct" | "wrong" | null>(null);
  const [clearedLines, setClearedLines] = useState<Set<string>>(new Set());
  const [showIntro, setShowIntro] = useState(true);

  const boardRef = useRef<HTMLDivElement>(null);
  const startRef = useRef(performance.now());
  const dragRef = useRef<Drag | null>(null);
  const rafRef = useRef<number | null>(null);

  const filledSet = useMemo(
    () => new Set(data.filled.map(([r, c]) => keyOf(r, c))),
    [data.filled],
  );

  const occupied = useMemo(() => {
    const occ = new Map<number, number>();
    for (const k of filledSet) occ.set(k, 0);
    for (const [, p] of placements) {
      const piece = data.pieces.find((pc) => pc.id === p.pieceId)!;
      for (const [dr, dc] of rotateN(piece.cells, p.rotation)) {
        occ.set(keyOf(p.row + dr, p.col + dc), piece.color);
      }
    }
    return occ;
  }, [filledSet, placements, data.pieces]);

  const completeLines = useMemo(() => {
    const lines: string[] = [];
    for (let i = 0; i < size; i++) {
      let rowFull = true;
      let colFull = true;
      for (let j = 0; j < size; j++) {
        if (!occupied.has(keyOf(i, j))) rowFull = false;
        if (!occupied.has(keyOf(j, i))) colFull = false;
      }
      if (rowFull) lines.push(`r${i}`);
      if (colFull) lines.push(`c${i}`);
    }
    return lines;
  }, [occupied, size]);

  const canPlaceAt = useCallback(
    (pieceId: number, rotation: number, anchor: Cell): boolean => {
      const piece = data.pieces.find((pc) => pc.id === pieceId);
      if (!piece) return false;
      for (const [dr, dc] of rotateN(piece.cells, rotation)) {
        const r = anchor[0] + dr;
        const c = anchor[1] + dc;
        if (r < 0 || r >= size || c < 0 || c >= size) return false;
        if (occupied.has(keyOf(r, c))) return false;
      }
      return true;
    },
    [data.pieces, occupied, size],
  );

  const place = useCallback(
    (pieceId: number, rotation: 0 | 1 | 2 | 3, anchor: Cell) => {
      setPlacements((prev) => {
        const next = new Map(prev);
        next.set(pieceId, { pieceId, rotation, row: anchor[0], col: anchor[1] });
        return next;
      });
      setAnnounce(`Piece placed at row ${anchor[0] + 1}, column ${anchor[1] + 1}.`);
    },
    [],
  );

  const pickBackUp = useCallback((pieceId: number) => {
    setPlacements((prev) => {
      if (!prev.has(pieceId)) return prev;
      const next = new Map(prev);
      next.delete(pieceId);
      return next;
    });
    setAnnounce("Piece returned to the tray.");
  }, []);

  const anchorFromPointer = useCallback(
    (x: number, y: number, pieceId: number, rotation: number, pointerType: string): Cell | null => {
      const board = boardRef.current;
      if (!board) return null;
      const rect = board.getBoundingClientRect();
      const cell = rect.width / size;
      const piece = data.pieces.find((pc) => pc.id === pieceId)!;
      const shape = rotateN(piece.cells, rotation);
      const rows = Math.max(...shape.map(([r]) => r)) + 1;
      const cols = Math.max(...shape.map(([, c]) => c)) + 1;
      const lift = pointerType === "touch" ? 1.6 : 0;
      const row = Math.round((y - rect.top) / cell - lift - (rows - 1) / 2 - 0.5);
      const col = Math.round((x - rect.left) / cell - (cols - 1) / 2 - 0.5);
      if (row < -rows || row > size + rows || col < -cols || col > size + cols) {
        return null;
      }
      return [row, col];
    },
    [data.pieces, size],
  );

  const onPiecePointerDown = (pieceId: number) => (e: React.PointerEvent) => {
    if (phase !== "play") return;
    const rotation = placements.get(pieceId)?.rotation ?? trayRotations[pieceId] ?? 0;
    if (placements.has(pieceId)) pickBackUp(pieceId);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const d: Drag = {
      pieceId,
      rotation,
      x: e.clientX,
      y: e.clientY,
      pointerType: e.pointerType,
      anchor: null,
      valid: false,
    };
    dragRef.current = d;
    setDrag(d);
  };

  const updateDragFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const d = dragRef.current;
      if (!d) return;
      const anchor = anchorFromPointer(clientX, clientY, d.pieceId, d.rotation, d.pointerType);
      const inBounds =
        anchor !== null &&
        anchor[0] >= 0 && anchor[1] >= 0 &&
        anchor[0] < size && anchor[1] < size;
      const next: Drag = {
        ...d,
        x: clientX,
        y: clientY,
        anchor,
        valid: inBounds ? canPlaceAt(d.pieceId, d.rotation, anchor) : false,
      };
      dragRef.current = next;
      setDrag(next);
    },
    [anchorFromPointer, canPlaceAt, size],
  );

  const onPointerMove = (e: React.PointerEvent) => {
    if (e.buttons === 0 || !dragRef.current) return;
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      updateDragFromPointer(e.clientX, e.clientY);
    });
  };

  const onPointerUp = () => {
    const d = dragRef.current;
    dragRef.current = null;
    if (!d) {
      setDrag(null);
      return;
    }
    const moved = d.anchor !== null;
    if (moved && d.anchor && d.valid) {
      place(d.pieceId, d.rotation, d.anchor);
    } else if (!moved && data.rotatable) {
      setTrayRotations((prev) => ({
        ...prev,
        [d.pieceId]: (((prev[d.pieceId] ?? 0) + 1) % 4) as 0 | 1 | 2 | 3,
      }));
      setAnnounce("Piece rotated.");
    }
    setDrag(null);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (phase !== "play" || !carry) return;
    const { pieceId, rotation, anchor } = carry;
    const move = (dr: number, dc: number) => {
      e.preventDefault();
      const next: Cell = [
        Math.max(0, Math.min(size - 1, anchor[0] + dr)),
        Math.max(0, Math.min(size - 1, anchor[1] + dc)),
      ];
      setCarry({ pieceId, rotation, anchor: next });
    };
    switch (e.key) {
      case "ArrowUp": return move(-1, 0);
      case "ArrowDown": return move(1, 0);
      case "ArrowLeft": return move(0, -1);
      case "ArrowRight": return move(0, 1);
      case "r":
      case "R":
        if (data.rotatable) {
          e.preventDefault();
          setCarry({ pieceId, rotation: ((rotation + 1) % 4) as 0 | 1 | 2 | 3, anchor });
        }
        return;
      case " ":
      case "Enter":
        e.preventDefault();
        if (canPlaceAt(pieceId, rotation, anchor)) {
          place(pieceId, rotation, anchor);
          setCarry(null);
        }
        return;
      case "Escape":
        e.preventDefault();
        setCarry(null);
        return;
    }
  };

  const pickUpWithKeyboard = (pieceId: number) => {
    if (phase !== "play") return;
    const rotation = trayRotations[pieceId] ?? 0;
    if (placements.has(pieceId)) pickBackUp(pieceId);
    setCarry({ pieceId, rotation, anchor: [0, 0] });
  };

  const allPlaced = placements.size === data.pieces.length;
  const targetReached = completeLines.length >= data.targetLines;

  const submit = async () => {
    if (phase !== "play") return;
    setPhase("grading");
    const answer = { placements: [...placements.values()] };
    try {
      const result = await onGrade(answer);
      setFlash(result.correct ? "correct" : "wrong");
      if (result.correct) setClearedLines(new Set(completeLines));
      setPhase("done");
      const timeMs = Math.round(performance.now() - startRef.current);
      setTimeout(() => {
        onSolve({
          correct: result.correct,
          timeMs,
          hintsUsed: 0,
          attempts,
          answer,
        });
      }, 600);
    } catch {
      setPhase("play");
      setAnnounce("That didn't save. Check your connection and try again.");
    }
  };

  const reset = () => {
    if (phase !== "play") return;
    setPlacements(new Map());
    setCarry(null);
    setAttempts((a) => a + 1);
    setAnnounce("Board reset.");
  };

  const ghost = useMemo(() => {
    const active = drag?.anchor
      ? { pieceId: drag.pieceId, rotation: drag.rotation, anchor: drag.anchor, valid: drag.valid }
      : carry
        ? {
            pieceId: carry.pieceId,
            rotation: carry.rotation,
            anchor: carry.anchor,
            valid: canPlaceAt(carry.pieceId, carry.rotation, carry.anchor),
          }
        : null;
    if (!active) return null;
    const piece = data.pieces.find((pc) => pc.id === active.pieceId)!;
    const cells = new Set(
      rotateN(piece.cells, active.rotation)
        .map(([dr, dc]): Cell => [active.anchor[0] + dr, active.anchor[1] + dc])
        .filter(([r, c]) => r >= 0 && r < size && c >= 0 && c < size)
        .map(([r, c]) => keyOf(r, c)),
    );
    return { cells, valid: active.valid, color: piece.color };
  }, [drag, carry, canPlaceAt, data.pieces, size]);

  const trayPieces = data.pieces.filter(
    (p) => !placements.has(p.id) && carry?.pieceId !== p.id,
  );

  useEffect(() => {
    if (drag) {
      const prevent = (e: TouchEvent) => e.preventDefault();
      document.addEventListener("touchmove", prevent, { passive: false });
      return () => document.removeEventListener("touchmove", prevent);
    }
  }, [drag]);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      className="flex flex-col gap-5"
      onKeyDown={onKeyDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* Self-explanatory intro — dismissible */}
      {showIntro && (
        <section className="deal-in rounded-(--radius-card) border border-accent/20 bg-accent-soft/40 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="principle-tag">Spatial reasoning</span>
              <h2 className="mt-2 font-display text-lg font-extrabold">Block Blast</h2>
              <p className="mt-1 text-sm leading-relaxed text-slate">
                Drag the <strong className="text-ink">3 coloured pieces</strong> onto the
                grid. Fill complete rows or columns to clear them. You need{" "}
                <span className="num font-semibold text-ink">{data.targetLines}</span>{" "}
                {data.targetLines === 1 ? "line" : "lines"} to win.
              </p>
              <ol className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                <li className="flex items-center gap-2 rounded-(--radius-ctl) bg-chalk/80 px-3 py-2">
                  <span className="num flex size-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-chalk">1</span>
                  Pick a piece
                </li>
                <li className="flex items-center gap-2 rounded-(--radius-ctl) bg-chalk/80 px-3 py-2">
                  <span className="num flex size-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-chalk">2</span>
                  {data.rotatable ? "Tap to rotate" : "Place on grid"}
                </li>
                <li className="flex items-center gap-2 rounded-(--radius-ctl) bg-chalk/80 px-3 py-2">
                  <span className="num flex size-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-chalk">3</span>
                  Clear {data.targetLines} {data.targetLines === 1 ? "line" : "lines"}
                </li>
              </ol>
            </div>
            <button
              type="button"
              onClick={() => setShowIntro(false)}
              className="shrink-0 rounded-(--radius-ctl) px-2 py-1 text-xs font-semibold text-slate hover:bg-chalk/80"
            >
              Got it
            </button>
          </div>
        </section>
      )}

      {/* Goal tracker */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {Array.from({ length: data.targetLines }, (_, i) => (
              <div
                key={i}
                className={`h-2 w-8 rounded-full transition-colors duration-200 ${
                  i < completeLines.length ? "bg-success" : "bg-mist"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-slate">
            {completeLines.length >= data.targetLines
              ? "Target reached — submit!"
              : `${data.targetLines - completeLines.length} more ${data.targetLines - completeLines.length === 1 ? "line" : "lines"} to clear`}
          </p>
        </div>
        <p className="num text-sm font-semibold">
          {completeLines.length}/{data.targetLines}
        </p>
      </div>

      <div
        ref={boardRef}
        role="grid"
        aria-label={`${size} by ${size} Block Blast board`}
        className={`mx-auto grid w-full max-w-[480px] touch-none gap-0.5 ${
          flash === "correct" ? "animate-[flash-correct_0.5s]" : flash === "wrong" ? "animate-[flash-wrong_0.5s]" : ""
        }`}
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: size * size }, (_, i) => {
          const r = Math.floor(i / size);
          const c = i % size;
          const k = keyOf(r, c);
          return (
            <GridCell
              key={k}
              r={r}
              c={c}
              color={occupied.get(k)}
              inGhost={ghost?.cells.has(k) ?? false}
              ghostValid={ghost?.valid ?? false}
              ghostColor={ghost?.color ?? 1}
              inClearedLine={clearedLines.has(`r${r}`) || clearedLines.has(`c${c}`)}
              inCompleteLine={completeLines.includes(`r${r}`) || completeLines.includes(`c${c}`)}
            />
          );
        })}
      </div>

      <div role="toolbar" aria-label="pieces" className="flex min-h-20 items-center justify-center gap-8">
        {trayPieces.length === 0 && (
          <p className="text-sm text-slate">All pieces placed — hit submit!</p>
        )}
        {trayPieces.map((piece) => {
          const rotation = trayRotations[piece.id] ?? 0;
          const shape = rotateN(piece.cells, rotation);
          const rows = Math.max(...shape.map(([r]) => r)) + 1;
          const cols = Math.max(...shape.map(([, c]) => c)) + 1;
          const cellSet = new Set(shape.map(([r, c]) => keyOf(r, c)));
          return (
            <button
              key={piece.id}
              type="button"
              aria-label={`Piece ${piece.id + 1}, ${piece.cells.length} blocks`}
              onPointerDown={onPiecePointerDown(piece.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  pickUpWithKeyboard(piece.id);
                }
              }}
              className="grid min-h-12 min-w-12 cursor-grab touch-none place-content-center rounded-(--radius-ctl) p-2 transition-opacity hover:bg-mist/60 active:cursor-grabbing"
              style={{ opacity: drag?.pieceId === piece.id ? 0.35 : 1 }}
            >
              <span
                className="grid gap-0.5"
                style={{ gridTemplateColumns: `repeat(${cols}, 20px)` }}
              >
                {Array.from({ length: rows * cols }, (_, idx) => {
                  const pr = Math.floor(idx / cols);
                  const pc = idx % cols;
                  return (
                    <span
                      key={idx}
                      className="block size-5 rounded-[2px]"
                      style={{
                        background: cellSet.has(keyOf(pr, pc))
                          ? `var(--block-${piece.color})`
                          : "transparent",
                      }}
                    />
                  );
                })}
              </span>
            </button>
          );
        })}
      </div>

      {drag && drag.anchor === null && (
        <DragOverlay drag={drag} pieces={data.pieces} />
      )}

      <div className="flex items-center gap-3">
        <Button
          onClick={submit}
          disabled={phase !== "play" || (!allPlaced && !targetReached)}
        >
          {targetReached ? "Submit solution" : "Place all pieces"}
        </Button>
        <Button variant="quiet" onClick={reset} disabled={phase !== "play"}>
          Reset
        </Button>
      </div>

      <p aria-live="polite" className="sr-only">{announce}</p>
    </div>
  );
}

function DragOverlay({
  drag,
  pieces,
}: {
  drag: Drag;
  pieces: BlockFitData["pieces"];
}) {
  const piece = pieces.find((p) => p.id === drag.pieceId);
  if (!piece) return null;
  const shape = rotateN(piece.cells, drag.rotation);
  const cols = Math.max(...shape.map(([, c]) => c)) + 1;
  const rows = Math.max(...shape.map(([r]) => r)) + 1;
  const cellSet = new Set(shape.map(([r, c]) => keyOf(r, c)));
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed z-50 grid gap-0.5"
      style={{
        left: drag.x - (cols * 22) / 2,
        top: drag.y - rows * 22 - (drag.pointerType === "touch" ? 36 : 12),
        gridTemplateColumns: `repeat(${cols}, 22px)`,
      }}
    >
      {Array.from({ length: rows * cols }, (_, i) => {
        const r = Math.floor(i / cols);
        const c = i % cols;
        return (
          <span
            key={i}
            className="block size-[22px] rounded-[2px] shadow-md"
            style={{
              background: cellSet.has(keyOf(r, c))
                ? `var(--block-${piece.color})`
                : "transparent",
            }}
          />
        );
      })}
    </div>
  );
}
