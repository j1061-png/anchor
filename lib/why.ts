/**
 * Why each feature exists.
 *
 * Every mechanic in Anchor comes from the cognitive-offloading literature.
 * Keeping the explanations in one registry means a student gets the same
 * answer to "why am I being made to do this?" wherever they ask, and the
 * citations stay honest — including where the evidence is thin.
 */

export type WhyKey =
  | "attemptFirst"
  | "hintLadder"
  | "brainOnly"
  | "spacedReview"
  | "processNotProduct"
  | "unaidedXp"
  | "independence"
  | "errorJournal"
  | "tutorRefuses"
  | "desirableDifficulty"
  | "confidenceRating"
  | "explainBack"
  | "sharing";

export type Why = {
  /** One line a student reads without expanding anything. */
  short: string;
  /** The mechanism, in plain language. */
  body: string;
  /** Where it comes from. */
  source: string;
};

export const WHY: Record<WhyKey, Why> = {
  attemptFirst: {
    short: "Help stays locked until you have tried.",
    body: "In a trial of about 1,000 students, those who practised with an AI that answered on demand scored 17% worse than students who never used AI once it was taken away — and they could not tell. Attempting first is what protects the learning.",
    source: "Bastani et al., PNAS (2025)",
  },
  hintLadder: {
    short: "Hints arrive one step at a time, never the answer.",
    body: "A tutor that releases graded hints and requires an attempt first produced far larger gains than the same technology answering freely. The step you work out yourself is the step you keep.",
    source: "Gu & Yan (2025) meta-analysis; Kestin et al., Scientific Reports (2025)",
  },
  brainOnly: {
    short: "Regular sessions with no help at all.",
    body: "Aviation mandates hand-flying practice so pilots do not lose the skill the autopilot performs. Doctors using AI for colonoscopy lost 6 percentage points of unaided detection in twelve weeks. Scheduled unaided practice is the countermeasure with the best track record.",
    source: "Budzyń et al., Lancet Gastro & Hep (2025); FAA (2013)",
  },
  spacedReview: {
    short: "Things come back just as they start to fade.",
    body: "Recalling something after it has begun to fade is what makes it stick. Reviewing while it is still fresh feels better and teaches you less.",
    source: "Bjork, desirable difficulties",
  },
  processNotProduct: {
    short: "You are scored on how you worked, not just the answer.",
    body: "Forty years of countermeasures point one way: changing the payoff for unaided work beats telling people offloading is bad. Grading the process is the intervention that changes behaviour.",
    source: "Sachdeva & Gilbert (2020); Engeler & Gilbert (2020)",
  },
  unaidedXp: {
    short: "Solving it yourself is worth the most XP.",
    body: "Rewards for unaided work reliably reduce excessive offloading, where awareness training does not. That is why finishing is worth nothing here and doing it yourself is worth the most.",
    source: "Sachdeva & Gilbert (2020)",
  },
  independence: {
    short: "One number Anchor refuses to average away.",
    body: "Accuracy with help and accuracy alone are different abilities. Blending them into a single score hides the thing you actually want to know: what can you still do when the help is gone.",
    source: "Risko & Gilbert (2016)",
  },
  errorJournal: {
    short: "Your mistakes become your syllabus.",
    body: "Getting it wrong and then working out why produces stronger learning than being shown the right answer — provided the struggle comes first.",
    source: "Kapur (2008), productive failure",
  },
  tutorRefuses: {
    short: "The coach asks questions and will not hand over answers.",
    body: "Showing an AI's reasoning made people accept its suggestions more, whether or not they were correct. A coach that questions you keeps the judgement yours.",
    source: "Bansal et al. (2021)",
  },
  desirableDifficulty: {
    short: "The struggle is the mechanism, not a bug.",
    body: "Conditions that slow you down now and strengthen learning later are called desirable difficulties. They are the first thing an answer engine removes.",
    source: "Bjork",
  },
  confidenceRating: {
    short: "Rate your confidence before you answer.",
    body: "Fluent AI output makes people feel they have understood something they have not. Committing to a confidence first, then seeing what happened, is how that illusion gets corrected.",
    source: "Skulmowski (2023); Liu et al. (2026)",
  },
  explainBack: {
    short: "Say it back in your own words.",
    body: "Reproducing an explanation yourself is a test of whether the understanding is yours or the tool's. Recognising a correct answer is not the same as being able to produce one.",
    source: "Sparrow, Liu & Wegner (2011)",
  },
  sharing: {
    short: "Share the effort, not the score.",
    body: "Anchor's share cards lead with unaided solves, recall days and brain-only sessions, because those are the numbers that mean you are learning. A high score with help is not an achievement.",
    source: "Anchor design principle, following Sachdeva & Gilbert (2020)",
  },
};
