import Link from "next/link";
import "./research.css";

export default function ResearchPage() {
  return (
    <div className="research-page">
      <Link href="/" className="research-exit">
        ← Anchor
      </Link>
      <iframe
        src="/research/Cognitive_Offloading_Deck.html"
        title="Cognitive Offloading — Your Brain on Autopilot"
        className="research-frame"
        allowFullScreen
      />
    </div>
  );
}
