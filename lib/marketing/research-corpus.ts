/** Verified research used on the marketing site. Do not add claims without a source here. */

export type ResearchSource = {
  id: string;
  topic: string;
  authors: string;
  year: number;
  publication?: string;
  detail: string;
  relevance: string;
  url?: string;
  caveat?: string;
};

export const DECK_URL = "/research/Cognitive_Offloading_Deck.html";

export function getSource(id: string): ResearchSource {
  const s = SOURCES.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown source: ${id}`);
  return s;
}

export const SOURCES: ResearchSource[] = [
  {
    id: "sparrow-2011",
    topic: "Cognitive offloading / memory",
    authors: "Sparrow, Liu & Wegner",
    year: 2011,
    publication: "Science",
    detail:
      "If you expect to look something up later, you remember the information less and where to find it more — the Google effect.",
    relevance:
      "Offloading storage changes what gets encoded. Generative AI extends that pattern to reasoning and production.",
  },
  {
    id: "risko-gilbert-2016",
    topic: "Cognitive offloading",
    authors: "Risko & Gilbert",
    year: 2016,
    detail:
      "Cognitive offloading is using an external tool to cut the mental effort a task demands — thinking moved outside the head.",
    relevance: "Anchor treats offloading as a design variable, not a moral failure.",
  },
  {
    id: "clark-chalmers-1998",
    topic: "Extended mind",
    authors: "Clark & Chalmers",
    year: 1998,
    detail:
      "Cognition can legitimately reach into tools; offloading is normal rather than pathology.",
    relevance:
      "The argument is not anti-tool. It is about what you still need to be able to do alone.",
  },
  {
    id: "csm-2026",
    topic: "Adoption",
    authors: "Common Sense Media",
    year: 2026,
    publication: "n=1,204, U.S. children 9–17",
    detail: "86% now use AI; 85% apply it to schoolwork (48% weekly, 21% daily).",
    relevance:
      "Adoption ran ahead of instruction. The product question is design, not access.",
    caveat: "Self-reported; Western sample. Treat as a floor, not a ceiling.",
  },
  {
    id: "hepi-2026",
    topic: "Adoption",
    authors: "HEPI",
    year: 2026,
    publication: "UK undergraduates",
    detail: "94% use AI for assessed work, up from 53% in 2024.",
    relevance: "Assessed work is where unaided skill must still exist.",
    caveat: "Self-reported; one country.",
  },
  {
    id: "bastani-2025",
    topic: "Unguarded AI and learning",
    authors: "Bastani et al.",
    year: 2025,
    publication: "PNAS 122(26)",
    detail:
      "~1,000 Turkish high-school maths students randomised to unguarded GPT-4, a guardrailed tutor, or no AI. +48% while using AI in practice; −17% on a later exam with AI removed.",
    relevance:
      "The flagship RCT behind attempt-first design and answer-withholding hints.",
    caveat: "One country, one subject, one age group. Not yet replicated elsewhere.",
  },
  {
    id: "budzyn-2025",
    topic: "Deskilling",
    authors: "Budzyń et al.",
    year: 2025,
    publication: "The Lancet Gastroenterology & Hepatology 10(10)",
    detail:
      "After 12 weeks of AI-assisted colonoscopy (>23,000 procedures), experienced endoscopists' unaided polyp detection fell from 28.4 to 22.4 (−6.0 points, p=0.0089).",
    relevance:
      "Deskilling is measured in the real world, not only in classrooms. Motivates scheduled unaided practice.",
    caveat: "Adults maintaining an existing skill; inference to adolescents building skills.",
  },
  {
    id: "gu-yan-2025",
    topic: "Human in the loop",
    authors: "Gu & Yan",
    year: 2025,
    publication: "Meta-analysis of 19 studies",
    detail:
      "Mean learning gain 0.077 when students used AI alone vs 1.426 when a teacher stayed in the student–AI interaction.",
    relevance: "Supervision and structure change outcomes, not the model alone.",
    caveat: "Between-study comparison, not a head-to-head trial.",
  },
  {
    id: "kestin-2025",
    topic: "Scaffolded tutoring",
    authors: "Kestin et al.",
    year: 2025,
    publication: "Scientific Reports 15:17458",
    detail: "Crossover RCT, N=194. Gains of roughly 0.6–1.3 SD with a scaffolded tutor.",
    relevance: "Brevity, attempt-first, and stepwise hints — the tutor panel in Anchor.",
    caveat: "Single institution.",
  },
  {
    id: "kapur-2008",
    topic: "Productive failure",
    authors: "Kapur",
    year: 2008,
    detail: "Attempt before instruction — struggle that is later resolved builds understanding.",
    relevance: "The attempt gate: no hint until you submit.",
  },
  {
    id: "sinha-kapur-2021",
    topic: "Productive failure",
    authors: "Sinha & Kapur",
    year: 2021,
    detail: "Mean effect g≈0.36, rising to 0.58 at high fidelity.",
    relevance: "Quantifies why the attempt comes before help.",
  },
  {
    id: "sweller-clt",
    topic: "Cognitive load",
    authors: "Sweller",
    year: 0,
    publication: "Cognitive load theory",
    detail:
      "Extraneous load is wasted effort — offload it freely. Germane load builds understanding. Tools cannot always tell them apart.",
    relevance: "Why a finished AI answer feels like mastery when it is not.",
  },
  {
    id: "bjork-desirable",
    topic: "Desirable difficulties",
    authors: "Bjork",
    year: 0,
    detail: "Conditions that slow performance now strengthen learning later. Struggle is the mechanism.",
    relevance: "What instant AI answers remove.",
  },
  {
    id: "skulmowski-liu",
    topic: "Illusion of mastery",
    authors: "Skulmowski (2023); Liu et al. (2026)",
    year: 2023,
    detail:
      "A calculator returns a number you still interpret. AI returns the finished thought — fluent enough that checking it feels optional.",
    relevance: "Why Anchor withholds full solutions on demand.",
  },
  {
    id: "engeler-gilbert-2020",
    topic: "Interventions",
    authors: "Engeler & Gilbert",
    year: 2020,
    detail: "Metacognitive training fixed miscalibration but did not change offloading behaviour.",
    relevance: "Awareness alone is not the fix. Payoffs for unaided work are.",
  },
  {
    id: "sachdeva-gilbert-2020",
    topic: "Interventions",
    authors: "Sachdeva & Gilbert",
    year: 2020,
    detail: "Rewarding performance without the tool reduced excessive offloading.",
    relevance: "XP for independence, brain-only sessions, grading the process.",
  },
  {
    id: "baker-2004",
    topic: "Guardrails",
    authors: "Baker et al.",
    year: 2004,
    detail: "Students clicked through hints until tutors surrendered answers — guardrails get gamed.",
    relevance: "Hints must withhold answers, not just delay them.",
  },
  {
    id: "bansal-2021",
    topic: "AI explanations",
    authors: "Bansal et al.",
    year: 2021,
    detail: "Showing AI reasoning increased acceptance of suggestions — right or wrong.",
    relevance: "Anchor grounds feedback in verified keys, not persuasive prose.",
  },
  {
    id: "faa-2013",
    topic: "Scheduled unaided practice",
    authors: "FAA",
    year: 2013,
    detail: "Aviation mandates hand-flying to counter automation deskilling.",
    relevance: "Brain-only mode: scheduled sessions with no AI by design.",
  },
  {
    id: "adesope-2017",
    topic: "Retrieval practice",
    authors: "Adesope et al.",
    year: 2017,
    detail: "g≈0.61 across 217 studies; g≈0.83 for secondary students on curriculum-linked recall.",
    relevance: "Daily retrieval items and spaced review in Anchor.",
  },
  {
    id: "gerlich-2025",
    topic: "AI dependence (correlational)",
    authors: "Gerlich",
    year: 2025,
    detail: "n=666. Youngest cohort (17–25) showed highest AI dependence and lowest critical-thinking scores.",
    relevance: "Motivating context for adolescent-focused design.",
    caveat: "Correlational. Cannot prove causation.",
  },
];

export const RESEARCH_THEMES = [
  {
    id: "attention",
    title: "Attention",
    hook: "Interruptions do not need your hands.",
    body: "Each ping pulls working memory off the task you were actually doing. Recovery is rarely instant.",
    sourceIds: ["sweller-clt", "skulmowski-liu"],
  },
  {
    id: "offloading",
    title: "Cognitive offloading",
    hook: "Thinking moved outside your head.",
    body: "Lists, calculators, sat-nav — all useful. Generative AI is the first tool that can offload framing, reasoning, judgement, and production in one step.",
    sourceIds: ["sparrow-2011", "risko-gilbert-2016", "clark-chalmers-1998"],
  },
  {
    id: "memory",
    title: "Memory",
    hook: "You remember where, not what.",
    body: "Expect to look it up later and encoding shifts. The Google effect predates ChatGPT by a decade.",
    sourceIds: ["sparrow-2011"],
  },
  {
    id: "interruption",
    title: "Interruption",
    hook: "The tool does not have to be open.",
    body: "Adoption outran supervision: most schools have discussed AI rules, fewer taught safe use, and many parents do not know their teen uses chatbots at all.",
    sourceIds: ["csm-2026"],
    qualitative: true,
  },
  {
    id: "availability",
    title: "Constant availability",
    hook: "Not one app. Everything.",
    body: "Messages, search, AI tutors, feeds — each competes for the same working memory. Extraneous load is free to offload; germane load is not.",
    sourceIds: ["sweller-clt", "csm-2026", "hepi-2026"],
  },
  {
    id: "habit",
    title: "Habit & adolescence",
    hook: "The shortcut is the default.",
    body: "Reward systems mature before control systems. Daily AI reliance climbs through adolescence — 12% of 9–12s to 30% of 16–17s in survey data.",
    sourceIds: ["csm-2026", "gerlich-2025"],
    caveat: "Mechanistic inference from neuroscience plus cross-sectional surveys — not longitudinal proof.",
  },
  {
    id: "design",
    title: "Design beats sermon",
    hook: "Change the payoff, not the lecture.",
    body: "Training beliefs about offloading fixed miscalibration but not behaviour. Rewarding unaided work did.",
    sourceIds: ["engeler-gilbert-2020", "sachdeva-gilbert-2020", "bastani-2025"],
  },
] as const;
