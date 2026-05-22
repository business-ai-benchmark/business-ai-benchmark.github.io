import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PowerGlitch } from 'powerglitch';
import { createPortal } from 'react-dom';
import { TransformWrapper, TransformComponent, type ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import { ChevronLeft, ChevronRight, X, ArrowUp, List, Sparkles, Mail, ZoomIn, ZoomOut, Newspaper } from 'lucide-react';
import { BlockMath, InlineMath } from 'react-katex';

// --- DATA ---
const paperMetadata = {
  title: "Benchmarking AI on Knowledge Work with Realistic Business Cases",
  subtitle: "and the Implications for Business Education and White-Collar Labor",
  authors: [
    { firstName: "Ajay", lastName: "Patel", affiliationIds: [1], isCorresponding: true, website: "https://ajayp.app" },
    { firstName: "Kartik", lastName: "Hosanagar", affiliationIds: [1], website: "https://www.hosanagar.com/" },
    { firstName: "Ramayya", lastName: "Krishnan", affiliationIds: [2], website: "https://www.heinz.cmu.edu/faculty-research/profiles/krishnan-ramayya" },
    { firstName: "Chris", lastName: "Callison-Burch", affiliationIds: [3], website: "https://www.cis.upenn.edu/~ccb/" },
    { firstName: "Karim", lastName: "Lakhani", affiliationIds: [4], website: "https://klakhani.academic.blog/" },
    { firstName: "Mitch", lastName: "Weiss", affiliationIds: [5], website: "https://www.hbs.edu/faculty/Pages/profile.aspx?facId=183463" }
  ],
  affiliations: [
    { id: 1, name: "Operations, Information and Decisions Department, The Wharton School, University of Pennsylvania", short: "WHARTON", logo: "/wharton.png", logoClass: "h-10 overflow-visible scale-110 origin-center" },
    { id: 2, name: "Heinz College of Information Systems and Public Policy, Carnegie Mellon University", short: "CMU HEINZ", logo: "/cmu.png", logoClass: "h-5" },
    { id: 3, name: "Department of Computer and Information Science, University of Pennsylvania" },
    { id: 4, name: "Technology and Operations Management Unit, Harvard Business School, Harvard University", short: "HBS", logo: "/hbs.png", logoClass: "h-10 overflow-visible scale-125 origin-center" },
    { id: 5, name: "Entrepreneurial Management Unit, Harvard Business School, Harvard University", short: "HBS", logo: "/hbs.png", logoClass: "h-10 overflow-visible scale-125 origin-center" }
  ],
  correspondence: "me@ajayp.app",
  date: "June 2026",
  year: 2026,
  fullPaperUrl: "https://drive.google.com/file/d/1wgsGfbjG06yOL038ih4dpAq0PKOjgYkZ/view"
};

const formatAuthorsForCitation = (authors: typeof paperMetadata.authors) => {
  const lastNames = authors.map(a => a.lastName);
  if (lastNames.length === 1) return lastNames[0];
  if (lastNames.length === 2) return `${lastNames[0]} & ${lastNames[1]}`;
  return `${lastNames.slice(0, -1).join(', ')}, & ${lastNames[lastNames.length - 1]}`;
};

const renderPaperTitle = (title: string) =>
  title.split(/(Knowledge Work|Business Cases)/).map((part, i) =>
    part === "Knowledge Work" || part === "Business Cases" ? (
      <span key={i} className="whitespace-nowrap">{part}</span>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );

const figures = [
  {
    id: "fig-pipeline",
    src: "/figures/benchmark_pipeline_diagram.png",
    caption: "Figure 1: Evaluation pipeline. Case narratives and open-ended questions are paired with reference solutions from instructor case solutions, converted into equally-weighted checklist rubrics, answered by frontier models, and scored criterion by criterion with an LLM-as-judge. Human annotators with business school grading experience validate automatic rubrics and grading on a stratified sample.",
    abbrevCaption: "Figure 1: Evaluation pipeline."
  },
  {
    id: "fig-scores",
    src: "/figures/complete_answer_vs_standard_score_by_discipline.png",
    caption: "Figure 2: Frontier model performance under Standard scoring (partial credit) and Complete Answer scoring (every rubric criterion satisfied). Partial-credit scores are high. Full rubric satisfaction is much lower and varies sharply by discipline."
  },
  {
    id: "fig-trajectory",
    src: "/figures/openai_model_family_trajectory_over_time.png",
    caption: "Figure 3: Within-family trajectory for four OpenAI models over roughly two years on the fixed 617-question benchmark, under Standard and Complete Answer scoring and by question type strata."
  },
  {
    id: "fig-iwa",
    src: "/figures/iwa_performance_heatmap.png",
    caption: "Figure 4: Mean Standard scores by O*NET Intermediate Work Activity. Open-ended advisory and opportunity-identification activities rank among the hardest; structured analytical tasks approach ceiling performance."
  },
  {
    id: "fig-strata",
    src: "/figures/sfig_question_type_strata_standard_vs_complete_scoring.png",
    caption: "Figure 5: Performance by question type strata (fictional vs. real cases; numerical vs. non-numerical; subjective vs. objective). Gaps are narrow relative to variation across business disciplines."
  },
  {
    id: "fig-fiction",
    src: "/figures/sfig_fiction_vs_real_performance_delta_by_discipline.png",
    caption: "Figure 6: Within-discipline gap (mean score on fictional minus real case questions) under Standard scoring, for disciplines with at least five questions in each arm. Positive bars mean higher scores on fiction; most disciplines show small fictional advantages or near parity, while Finance is a pronounced negative outlier (fiction far below real)."
  },
  {
    id: "fig-onet",
    src: "/figures/sfig_ai_impact_on_onet_occupations.png",
    caption: "Figure 7: Implied AI impact on O*NET occupations, grouped by how thoroughly benchmark questions cover each job's relevant work activities."
  },
  {
    id: "fig-openai-trajectory-discipline",
    src: "/figures/sfig_openai_trajectory_by_discipline.png",
    caption: "Figure 8: Discipline-level OpenAI model family trajectories (twelve disciplines with n ≥ 15 questions). Panel A: Standard scoring by model; lines highlight the three largest and three smallest discipline-level gains from GPT-4 Turbo to GPT-5.4. Panel B: Complete Answer scoring for the same disciplines. Every tracked discipline improves under both metrics, but gain magnitudes and terminal levels differ."
  }
];

const references = [
  { id: "ref1", text: "Nori, H., Daswani, M., Kelly, C., et al. (2025). Sequential Diagnosis with Language Models. arXiv:2506.22405." },
  { id: "ref2", text: "Patwardhan, T., Dias, R., Proehl, E., et al. (2025). GDPval: Evaluating AI Model Performance on Real-World Economically Valuable Tasks. arXiv:2510.04374." },
  { id: "ref3", text: "Nohria, N. (2021). What the Case Study Method Really Teaches. Harvard Business Impact Education." },
  { id: "ref4", text: "National Center for O*NET Development. (2026). O*NET OnLine. U.S. Department of Labor." },
  { id: "ref5", text: "Zheng, L., Chiang, W.-L., Sheng, Y., et al. (2023). Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena. NeurIPS 2023 Datasets and Benchmarks Track." },
  { id: "ref6", text: "Hendrycks, D., Burns, C., Kadavath, S., et al. (2021). Measuring Mathematical Problem Solving With the MATH Dataset. NeurIPS 2021." },
  { id: "ref7", text: "Dell'Acqua, F., McFowland, E., Mollick, E., et al. (2026). Navigating the Jagged Technological Frontier. Organization Science, 37(2), 403–423." }
];

const overallMetadataRows = [
  { strata: "All questions", n: 617 },
  { strata: "Fictional case", n: 246 },
  { strata: "Real case", n: 371 },
  { strata: "Numerical", n: 186 },
  { strata: "Non-numerical", n: 431 },
  { strata: "Subjective", n: 340 },
  { strata: "Objective", n: 277 },
];

const disciplineCompositionRows = [
  { discipline: "Strategy", n: 110, fictional: 19, real: 91, numerical: 20, nonNumerical: 90, subjective: 77, objective: 33 },
  { discipline: "Leadership & Organizational Behavior", n: 102, fictional: 52, real: 50, numerical: 1, nonNumerical: 101, subjective: 81, objective: 21 },
  { discipline: "Finance", n: 88, fictional: 32, real: 56, numerical: 65, nonNumerical: 23, subjective: 28, objective: 60 },
  { discipline: "Accounting & Control", n: 58, fictional: 39, real: 19, numerical: 45, nonNumerical: 13, subjective: 9, objective: 49 },
  { discipline: "Business Ethics", n: 43, fictional: 30, real: 13, numerical: 2, nonNumerical: 41, subjective: 36, objective: 7 },
  { discipline: "General Management", n: 34, fictional: 8, real: 26, numerical: 4, nonNumerical: 30, subjective: 29, objective: 5 },
  { discipline: "Operations & Service Management", n: 32, fictional: 8, real: 24, numerical: 8, nonNumerical: 24, subjective: 13, objective: 19 },
  { discipline: "Economics", n: 24, fictional: 1, real: 23, numerical: 9, nonNumerical: 15, subjective: 1, objective: 23 },
  { discipline: "Human Resource Management", n: 22, fictional: 15, real: 7, numerical: 2, nonNumerical: 20, subjective: 16, objective: 6 },
  { discipline: "Marketing & Sales", n: 22, fictional: 7, real: 15, numerical: 3, nonNumerical: 19, subjective: 16, objective: 6 },
  { discipline: "Decision Analysis", n: 21, fictional: 18, real: 3, numerical: 19, nonNumerical: 2, subjective: 3, objective: 18 },
  { discipline: "Entrepreneurship & Innovation", n: 17, fictional: 4, real: 13, numerical: 3, nonNumerical: 14, subjective: 11, objective: 6 },
  { discipline: "Information Technology", n: 12, fictional: 2, real: 10, numerical: 0, nonNumerical: 12, subjective: 1, objective: 11 },
  { discipline: "Business & Government Relations", n: 12, fictional: 1, real: 11, numerical: 0, nonNumerical: 12, subjective: 7, objective: 5 },
  { discipline: "Negotiation", n: 8, fictional: 2, real: 6, numerical: 3, nonNumerical: 5, subjective: 5, objective: 3 },
  { discipline: "International Business", n: 7, fictional: 5, real: 2, numerical: 1, nonNumerical: 6, subjective: 3, objective: 4 },
  { discipline: "Management Communications", n: 4, fictional: 3, real: 1, numerical: 0, nonNumerical: 4, subjective: 3, objective: 1 },
  { discipline: "Social Enterprise", n: 1, fictional: 0, real: 1, numerical: 1, nonNumerical: 0, subjective: 1, objective: 0 },
];

const disciplineCompositionTotal = {
  discipline: "Total", n: 617, fictional: 246, real: 371, numerical: 186, nonNumerical: 431, subjective: 340, objective: 277,
};

const tocItems = [
  { id: "exec-summary", title: "Highlights" },
  { id: "measurement-gap", title: "The Measurement Gap" },
  { id: "benchmark", title: "The Benchmark" },
  { id: "performance", title: "Performance Today" },
  { id: "progress", title: "Two Years of Progress" },
  { id: "difficulty", title: "What Still Differentiates Difficulty" },
  { id: "implications", title: "Implications" },
  { id: "references", title: "References" },
  { id: "appendix", title: "Appendix", sub: [
    { id: "scoring", title: "How We Scored Responses" },
    { id: "scoring-math", title: "Scoring Formulas" },
    { id: "composition", title: "Benchmark Composition" },
    { id: "progress-by-discipline", title: "Progress By Discipline" }
  ]}
];

// --- COMPONENTS ---

const ROBOT_GLITCH_INTERVAL_MS = 2000;
const ROBOT_SHAKE_AMPLITUDE_MIN = 0.05;
const ROBOT_SHAKE_AMPLITUDE_MAX = 0.15;

const randomRobotShakeAmplitude = () =>
  ROBOT_SHAKE_AMPLITUDE_MIN + Math.random() * (ROBOT_SHAKE_AMPLITUDE_MAX - ROBOT_SHAKE_AMPLITUDE_MIN);
const ROBOT_IMG_ASPECT = 481 / 676;
/** Normalized (x, y, w, h) eye region within the robot image */
const ROBOT_EYE_REGION = { x: 0.324516, y: 0.242964, w: 0.397917, h: 0.127407 };
/** Set false to hide the eye-region debug overlay */
const ROBOT_EYE_DEBUG_BOX = false;
/** Fraction of eye-box width/height used for edge feather (each side) */
const ROBOT_EYE_FEATHER = 0.15;

const robotEyeFeatherMask = (() => {
  const edge = `${ROBOT_EYE_FEATHER * 100}%`;
  const inner = `${(1 - ROBOT_EYE_FEATHER) * 100}%`;
  return [
    `linear-gradient(to right, transparent 0%, #000 ${edge}, #000 ${inner}, transparent 100%)`,
    `linear-gradient(to bottom, transparent 0%, #000 ${edge}, #000 ${inner}, transparent 100%)`,
  ].join(', ');
})();

const GlitchRobot = ({ className }: { className?: string }) => {
  const eyeImgRef = useRef<HTMLImageElement>(null);
  const glitchRef = useRef<ReturnType<typeof PowerGlitch.glitch> | null>(null);

  const runGlitch = useCallback(() => {
    const el = eyeImgRef.current;
    if (!el) return;

    glitchRef.current?.stopGlitch();
    const glitch = PowerGlitch.glitch(el, {
      playMode: 'manual',
      timing: { duration: 500, iterations: 1 },
      glitchTimeSpan: { start: 0, end: 1 },
      hideOverflow: true,
      shake: {
        velocity: 15,
        amplitudeX: randomRobotShakeAmplitude(),
        amplitudeY: randomRobotShakeAmplitude(),
      },
      slice: { count: 6, velocity: 15, minHeight: 0.02, maxHeight: 0.02, hueRotate: true, cssFilters: '' },
    });

    glitchRef.current = glitch;
    glitch.startGlitch();
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    runGlitch();
    const intervalId = window.setInterval(runGlitch, ROBOT_GLITCH_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
      glitchRef.current?.stopGlitch();
      glitchRef.current = null;
    };
  }, [runGlitch]);
  const { x, y, w, h } = ROBOT_EYE_REGION;

  return (
    <div
      className={`relative shrink-0 cursor-pointer ${className ?? ''}`}
      onMouseEnter={runGlitch}
      onFocus={runGlitch}
      tabIndex={0}
      role="img"
      aria-label="White collar robot"
    >
      <div
        className="relative mx-auto h-full w-auto max-w-full"
        style={{ aspectRatio: ROBOT_IMG_ASPECT }}
      >
        <img
          src="/white_collar_robot.png"
          alt=""
          aria-hidden="true"
          className="block h-full w-full"
          draggable={false}
        />
        <div
          className="absolute overflow-hidden pointer-events-none"
          style={{
            left: `${x * 100}%`,
            top: `${y * 100}%`,
            width: `${w * 100}%`,
            height: `${h * 100}%`,
            WebkitMaskImage: robotEyeFeatherMask,
            WebkitMaskComposite: 'source-in',
            maskImage: robotEyeFeatherMask,
            maskComposite: 'intersect',
          }}
          aria-hidden="true"
        >
          <img
            ref={eyeImgRef}
            src="/white_collar_robot.png"
            alt=""
            className="absolute max-w-none"
            draggable={false}
            style={{
              width: `${(1 / w) * 100}%`,
              height: `${(1 / h) * 100}%`,
              left: `${(-x / w) * 100}%`,
              top: `${(-y / h) * 100}%`,
            }}
          />
        </div>
        {ROBOT_EYE_DEBUG_BOX && (
          <div
            className="absolute z-[9999] pointer-events-none border-2 border-red-500 bg-red-500/40"
            style={{
              left: `${x * 100}%`,
              top: `${y * 100}%`,
              width: `${w * 100}%`,
              height: `${h * 100}%`,
            }}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
};

const FigureLink = ({ id, children }: { id: string, children: React.ReactNode }) => {
  return (
    <a href={`#${id}`} className="text-wharton hover:text-wharton-red underline decoration-1 underline-offset-2 transition-colors cursor-pointer">
      {children}
    </a>
  );
};

const HighlightLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    className="font-semibold text-inherit underline decoration-dotted decoration-slate-500 underline-offset-[3px] hover:text-wharton hover:decoration-wharton transition-colors"
  >
    {children}
  </a>
);

const ONET_WIKI_URL = "https://en.wikipedia.org/wiki/Occupational_Information_Network";

const OnetLink = () => (
  <a
    href={ONET_WIKI_URL}
    target="_blank"
    rel="noopener noreferrer"
    className="text-wharton hover:text-wharton-red underline decoration-1 underline-offset-2 transition-colors"
  >
    O*NET
  </a>
);

const PullQuote = ({
  id,
  children,
  citeId,
  authors,
  year,
  sourceTitle,
  sourcePublisher,
  sourceUrl,
}: {
  id?: string;
  children: React.ReactNode;
  citeId: string;
  authors: string;
  year: string;
  sourceTitle: string;
  sourcePublisher?: string;
  sourceUrl: string;
}) => (
  <blockquote id={id} className={`pull-quote group my-8 sm:my-10 pl-4 sm:pl-6 md:pl-8 border-l-4 border-wharton-red bg-slate-50/80 rounded-r-lg py-4 sm:py-5 md:py-6 pr-3 sm:pr-4 md:pr-6 transition-all duration-300 ease-out origin-left hover:bg-white hover:shadow-md hover:shadow-slate-300/50 hover:-translate-y-0.5 hover:scale-[1.008]${id ? " scroll-mt-24" : ""}`}>
    <p className="text-base sm:text-lg md:text-xl lg:text-[1.35rem] text-slate-700 italic leading-relaxed font-serif m-0 transition-colors duration-300 group-hover:text-slate-800">
      {children}
    </p>
    <footer className="mt-4 sm:mt-5 text-xs sm:text-sm text-slate-500 font-serif not-italic leading-snug sm:leading-normal">
      — <CiteT id={citeId} authors={authors} year={year} />.{" "}
      <a
        href={sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-wharton hover:text-wharton-red underline decoration-1 underline-offset-2 transition-colors"
      >
        {sourceTitle}
      </a>
      {sourcePublisher && <>, {sourcePublisher}</>}.{" "}
      <RefLink id={citeId}>{citeId.replace("ref", "")}</RefLink>
    </footer>
  </blockquote>
);

const RefLink = ({ id, children }: { id: string, children: React.ReactNode }) => {
  return (
    <a href={`#${id}`} className="text-wharton hover:text-wharton-red font-medium transition-colors cursor-pointer tracking-tight">
      [{children}]
    </a>
  );
};

/** Narrative citation (LaTeX \\citet): author–year in prose, not bracketed [n]. */
const CiteT = ({ id, authors, year }: { id: string; authors: string; year: string }) => (
  <a href={`#${id}`} className="text-wharton hover:text-wharton-red font-medium transition-colors cursor-pointer">
    {authors} ({year})
  </a>
);

const ViewFullPaperButton = ({
  className,
  variant = "long",
}: {
  className: string;
  variant?: "short" | "long";
}) => (
  <a
    href={paperMetadata.fullPaperUrl}
    target="_blank"
    rel="noopener noreferrer"
    className={`flex items-center gap-2 transition-colors ${className}`}
  >
    <Newspaper className="w-4 h-4 shrink-0" />
    {variant === "short" ? "Full paper →" : "Read the full paper on arXiv →"}
  </a>
);

type TableColumn<T> = {
  key: keyof T;
  label: string;
  align?: "left" | "right";
  headerClass?: string;
  cellClass?: string;
};

const ScaledTableWrapper = ({ children }: { children: React.ReactNode }) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [scaledHeight, setScaledHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const compute = () => {
      if (!outerRef.current || !innerRef.current) return;
      const outerW = outerRef.current.clientWidth;
      const innerW = innerRef.current.offsetWidth;
      const newScale = innerW > outerW ? outerW / innerW : 1;
      setScale(newScale);
      setScaledHeight(innerRef.current.offsetHeight * newScale);
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(outerRef.current!);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={outerRef} style={{ overflow: 'hidden', height: scaledHeight }}>
      <div
        ref={innerRef}
        style={{
          position: 'absolute',
          width: 'max-content',
          transformOrigin: 'top left',
          transform: scale < 1 ? `scale(${scale})` : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
};

const CompositionTableBlock = <T extends Record<string, string | number>>({
  id,
  caption,
  columns,
  rows,
  totalRow,
  scaleOnOverflow = false,
}: {
  id: string;
  caption: string;
  columns: TableColumn<T>[];
  rows: T[];
  totalRow?: T;
  /** Use CSS scale shrink-to-fit for wide multi-column tables (e.g. discipline breakdown). */
  scaleOnOverflow?: boolean;
}) => {
  const table = (
    <table className={`text-sm font-serif border-collapse ${scaleOnOverflow ? "" : "w-full"}`}>
        <thead>
          <tr className="bg-slate-100 border-b border-slate-200">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={`px-4 py-3 font-semibold text-slate-700 whitespace-nowrap ${col.align === "right" ? "text-right" : "text-left"} ${col.headerClass ?? ""}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={`border-b border-slate-100 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/60"}`}>
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  className={`px-4 py-3 align-top ${col.align === "right" ? "text-right tabular-nums" : "text-left"} ${col.key === columns[0].key ? "text-slate-700" : "text-slate-600"} ${col.cellClass ?? ""}`}
                >
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
          {totalRow && (
            <tr className="border-t border-slate-200 bg-slate-100/80 font-semibold">
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  className={`px-4 py-3 align-top ${col.align === "right" ? "text-right tabular-nums" : "text-left"} text-slate-800 ${col.cellClass ?? ""}`}
                >
                  {totalRow[col.key]}
                </td>
              ))}
            </tr>
          )}
        </tbody>
    </table>
  );

  return (
    <figure id={id} className="my-12 scroll-mt-24 w-full">
      <div
        className={`w-full rounded-lg border border-slate-200 shadow-sm bg-white ${
          scaleOnOverflow ? "relative overflow-hidden" : "overflow-x-auto"
        }`}
      >
        {scaleOnOverflow ? <ScaledTableWrapper>{table}</ScaledTableWrapper> : table}
      </div>
      <figcaption className="mt-4 w-full text-sm text-slate-500 font-serif leading-relaxed border-l-2 border-wharton/30 pl-4 py-1">
        {caption}
      </figcaption>
    </figure>
  );
};

const FigureBlock = ({
  figureIdx,
  wide = false,
  onOpen
}: {
  figureIdx: number;
  wide?: boolean;
  onOpen: (idx: number) => void;
}) => {
  const fig = figures[figureIdx];
  return (
    <figure id={fig.id} className={`my-12 scroll-mt-24 flex flex-col items-center ${wide ? 'lg:w-[110%] lg:-ml-[5%]' : ''}`}>
      <div
        className="w-fit max-w-full bg-slate-100 rounded-lg overflow-hidden cursor-zoom-in border border-slate-200 hover:ring-2 ring-wharton/30 transition-all shadow-sm"
        onClick={() => onOpen(figureIdx)}
      >
        <img
          src={fig.src}
          alt={fig.caption.split(':')[0]}
          className={`block max-w-full h-auto object-contain ${wide ? 'max-h-[600px]' : 'max-h-[500px]'}`}
        />
      </div>
      <figcaption className={`mt-4 w-full text-sm text-slate-500 font-serif leading-relaxed border-l-2 border-wharton/30 pl-4 py-1 ${wide ? 'mx-[5%]' : ''}`}>
        {fig.caption}
      </figcaption>
    </figure>
  );
};

const figureOverlayBtnClass =
  "p-2.5 md:p-3 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/25 text-white transition-colors backdrop-blur-md touch-manipulation";

/** Touch-friendly pinch/pan settings for the fullscreen figure viewer. */
const figureZoomOptions = {
  initialScale: 1,
  minScale: 0.5,
  maxScale: 6,
  centerOnInit: true,
  limitToBounds: true,
  centerZoomedOut: true,
  smooth: true,
  wheel: { disabled: true },
  pinch: { step: 8 },
  panning: { velocityDisabled: false },
  doubleClick: { disabled: false, mode: "zoomIn" as const, step: 0.65, animationTime: 200 },
  alignmentAnimation: { animationTime: 200 },
  velocityAnimation: { sensitivity: 1.1, animationTime: 400 },
};

export default function App() {
  const [activeFigureIdx, setActiveFigureIdx] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<string>("");
  const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);
  const figureZoomRef = useRef<ReactZoomPanPinchRef | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      let current = "";
      const sections = document.querySelectorAll("section[id]");
      sections.forEach((section) => {
        const sectionTop = section.getBoundingClientRect().top;
        if (sectionTop <= 150) {
          current = section.getAttribute("id") || "";
        }
      });
      setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openFigure = (idx: number) => {
    setActiveFigureIdx(idx);
    document.body.style.overflow = 'hidden';
  };

  const closeFigure = () => {
    setActiveFigureIdx(null);
    document.body.style.overflow = '';
  };

  const nextFigure = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeFigureIdx !== null) {
      setActiveFigureIdx((activeFigureIdx + 1) % figures.length);
    }
  };

  const prevFigure = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeFigureIdx !== null) {
      setActiveFigureIdx((activeFigureIdx - 1 + figures.length) % figures.length);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeFigureIdx === null) return;
      if (e.key === 'Escape') closeFigure();
      if (e.key === 'ArrowRight') setActiveFigureIdx((activeFigureIdx + 1) % figures.length);
      if (e.key === 'ArrowLeft') setActiveFigureIdx((activeFigureIdx - 1 + figures.length) % figures.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFigureIdx]);

  const tocContent = (
    <>
      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 lg:mb-6 font-display">Contents</h4>
      <nav className="space-y-1">
        {tocItems.map(item => (
          <div key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={() => setIsMobileTocOpen(false)}
              className={`block py-1.5 text-sm transition-colors ${activeSection === item.id ? 'text-wharton font-semibold' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {item.title}
            </a>
            {item.sub && item.sub.map(subItem => (
              <a
                key={subItem.id}
                href={`#${subItem.id}`}
                onClick={() => setIsMobileTocOpen(false)}
                className={`block py-1 pl-4 text-sm transition-colors ${activeSection === subItem.id ? 'text-wharton font-medium' : 'text-slate-400 hover:text-slate-800'}`}
              >
                {subItem.title}
              </a>
            ))}
          </div>
        ))}
      </nav>

      <div className="mt-8 lg:mt-12 pt-6 lg:pt-8 border-t border-slate-100">
        <button
          onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setIsMobileTocOpen(false); }}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-wharton transition-colors"
        >
          <ArrowUp className="w-4 h-4" />
          Back to top
        </button>
        <ViewFullPaperButton className="text-sm text-slate-400 hover:text-wharton mt-4" />
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-white text-slate-800 antialiased selection:bg-wharton selection:text-white">

      <header className="header-gradient-bg text-white px-6 py-20 lg:py-24 relative overflow-hidden isolation-isolate selection:bg-white/30 selection:text-white">
        <div className="header-noise-overlay" aria-hidden="true" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="mb-10 flex flex-row items-start gap-4 sm:gap-6 md:items-center md:gap-10">
            <GlitchRobot className="w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48" />
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-5xl font-display font-medium leading-tight mb-2 sm:mb-3">
                {renderPaperTitle(paperMetadata.title)}
              </h1>
              <h2 className="text-lg sm:text-xl md:text-3xl font-display font-normal text-white/80 leading-snug italic">
                {paperMetadata.subtitle}
              </h2>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-t border-white/20 pt-8">
            <div className="space-y-2 text-lg text-slate-200">
              <p className="font-semibold text-white leading-relaxed">
                {paperMetadata.authors.map((author, idx) => (
                  <span key={idx} className="inline-block mr-2 mb-1 md:mb-0">
                    {author.website ? (
                      <a href={author.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {author.firstName} {author.lastName}
                      </a>
                    ) : (
                      <>{author.firstName} {author.lastName}</>
                    )}
                    {author.affiliationIds.length > 0 && (
                      <sup className="text-xs ml-0.5 hidden md:inline">
                        {author.affiliationIds.join(',')}
                        {author.isCorresponding && ',∗'}
                      </sup>
                    )}
                    {author.isCorresponding && (
                      <sup className="text-xs ml-0.5 md:hidden">∗</sup>
                    )}
                    {idx < paperMetadata.authors.length - 1 && ","}
                  </span>
                ))}
              </p>
              <p className="hidden md:block text-sm font-serif mb-6">
                {paperMetadata.affiliations.map(affil => (
                  <React.Fragment key={affil.id}>
                    <sup className="mr-1">{affil.id}</sup>{affil.name}<br/>
                  </React.Fragment>
                ))}
              </p>

              <div className="flex flex-wrap items-center gap-6 mt-6 opacity-90">
                {paperMetadata.affiliations.filter((affil, idx, arr) =>
                  affil.logo && arr.findIndex(a => a.logo === affil.logo) === idx
                ).map(affil => (
                  <div key={affil.id} className="h-11 px-3 bg-white rounded shadow-sm flex items-center justify-center transition-transform hover:scale-105" title={affil.name}>
                    <img src={affil.logo} alt={affil.name} className={`${affil.logoClass || 'h-7'} w-auto object-contain`} />
                  </div>
                ))}
              </div>
            </div>

            <div className="text-sm text-slate-300 font-serif">
              <p className="flex items-center gap-2 mb-1">
                <Mail className="w-4 h-4" />
                Correspondence To:
              </p>
              <a href={`mailto:${paperMetadata.correspondence}`} className="text-white hover:text-blue-200 hover:underline transition-colors">{paperMetadata.correspondence}</a>
              <p className="mt-2 text-sm opacity-70 whitespace-nowrap italic">Working Paper — {paperMetadata.date}</p>
              <ViewFullPaperButton variant="short" className="text-sm text-white/80 hover:text-white mt-3" />
            </div>
          </div>
        </div>

        <div className="header-spotlight header-spotlight-tr" aria-hidden="true" />
        <div className="header-spotlight header-spotlight-bl" aria-hidden="true" />
        <div className="header-spotlight header-spotlight-crimson-ml" aria-hidden="true" />
        <div className="header-spotlight header-spotlight-crimson-br" aria-hidden="true" />
      </header>

      <div className="max-w-[1400px] mx-auto px-6 py-12 flex flex-col lg:flex-row items-start gap-12 lg:gap-20">

        <aside className="hidden lg:block w-72 sticky top-12 shrink-0 border-l border-slate-200 pl-8 pb-12 max-h-[calc(100vh-3rem)] overflow-y-auto">
          {tocContent}
        </aside>

        <main className="flex-1 max-w-3xl lg:max-w-4xl text-lg leading-relaxed text-slate-700">

          <section id="exec-summary" className="scroll-mt-12 mb-16">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 shadow-sm">
              <h2 className="text-2xl font-display font-semibold text-slate-900 mb-4">Research Highlights</h2>
              <div className="text-sm md:text-base leading-relaxed text-slate-700 font-serif">
                <ul className="list-none pl-0 m-0 p-0 flex flex-col gap-3">
                  <li className="flex items-start gap-4">
                    <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500 shrink-0 mt-1" />
                    <span>Popular AI benchmarks track narrow factual recall, math, coding, and agentic capabilities—<HighlightLink href="#measurement-gap">a poor proxy</HighlightLink> for the analytical knowledge work white-collar professionals perform daily.</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500 shrink-0 mt-1" />
                    <span>We benchmark frontier AI models on <HighlightLink href="#fig-pipeline">617 open-ended questions</HighlightLink> from <HighlightLink href="#fig-pipeline">240 business school cases</HighlightLink> spanning <HighlightLink href="#tab-by-discipline">18 disciplines</HighlightLink>, graded against expert-written instructor case solutions.</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500 shrink-0 mt-1" />
                    <span>Case narratives <HighlightLink href="#tab-representative-questions">simulate a realistic decision context</HighlightLink> other benchmarks miss, including synthesizing messy and incomplete information, <HighlightLink href="#pull-quote-nohria-information">making decisions under uncertainty</HighlightLink>, weighing trade-offs, and defending structured recommendations when there may be no single right answer.</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500 shrink-0 mt-1" />
                    <span>Top AI models already score high on business cases—<HighlightLink href="#performance">above 87%</HighlightLink> on rubric-graded accuracy—suggesting they can serve as reliable aids in decision-making, strategy planning, operations management, and more.</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500 shrink-0 mt-1" />
                    <span>Over the last two years, performance rose roughly <HighlightLink href="#fig-trajectory">23 percentage points</HighlightLink> in one model family, with gains across every type of case and question.</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500 shrink-0 mt-1" />
                    <span>We discuss implications for <HighlightLink href="#implications">business schools</HighlightLink> that train undergraduates and MBAs where such skills have historically anchored early-career work. To this end, we measure <HighlightLink href="#onet-mapping">implied AI impact</HighlightLink> on occupations and work activities.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-200">
                <ViewFullPaperButton className="inline-flex text-sm text-slate-600 hover:text-wharton font-medium" />
              </div>
            </div>
          </section>

          <FigureBlock figureIdx={0} wide onOpen={openFigure} />

          <section id="measurement-gap" className="scroll-mt-12 mb-16 space-y-6">
            <h2 className="text-3xl font-display font-semibold text-slate-900 mb-6">The Measurement Gap</h2>
            <p>
              Popular AI benchmarks largely assess tasks where correctness is unambiguous and answers can be checked against known facts, computed values, or enumerated choices, including trivia, multiple-choice reasoning, math competitions, coding puzzles, and agent benchmarks in software environments. That design is useful signal, but it is a poor proxy for the analytical knowledge work that defines white-collar roles, which calls for synthesizing messy narratives, weighing trade-offs under incomplete information, and defending a structured recommendation when there is no single right answer <RefLink id="ref2">2</RefLink>.
            </p>
            <p>
              Measuring AI progress on medical reasoning offers an instructive parallel. High LLM scores on the United States Medical Licensing Examination (USMLE) led many to infer that LLMs had matched clinical reasoning, yet USMLE questions are multiple-choice proxies optimized for administrative scale rather than for the open-ended synthesis high-performing clinicians perform on real cases. <CiteT id="ref1" authors="Nori et al." year="2025" /> instead evaluated models on <em>New England Journal of Medicine</em> case challenges, clinically demanding expert-written diagnostic puzzle narratives with eventual solutions, using each case and its resolution to test reasoning under conditions closer to authentic practice with the ambiguity and uncertainty of real clinical work. Frontier models performed strongly on this design, even though such case challenges are meant to be rare and difficult, redefining what “medical intelligence” means when the task looks like practice rather than an exam.
            </p>
            <PullQuote
              id="pull-quote-nohria-information"
              citeId="ref3"
              authors="Nohria"
              year="2021"
              sourceTitle="What the Case Study Method Really Teaches"
              sourcePublisher="Harvard Business Impact"
              sourceUrl="https://hbsp.harvard.edu/inspiring-minds/what-the-case-study-method-really-teaches"
            >
              Many cases are long. A typical case may include history, industry background, a cast of characters, dialogue, financial statements, source documents, or other exhibits. Some material may be digressive or inessential. Cases often have holes—critical pieces of information that are missing. … The case method forces students to identify and focus on what’s essential, ignore the noise, skim when possible, and concentrate on what matters, meta-skills required for every busy executive confronted with the paradox of simultaneous information overload and information paucity. As one alumnus pithily put it, “The case method helped me learn how to separate the wheat from the chaff.”
            </PullQuote>
            <p>
              Business school case studies occupy a similar role in professional education that NEJM medical case challenges occupy in clinical training <RefLink id="ref1">1</RefLink>. They are the central teaching instrument in MBA programs and undergraduate business education alike, as curated, expert-written decision narratives that force synthesis, judgment, and defensible analysis rather than memorization. Publisher licensing of these cases also limits pre-training exposure and contamination risk, making them a strong candidate for evaluation. Prior business benchmarks have been valuable but narrow, covering financial numerical reasoning, format-following tasks, or agents operating inside enterprise software rather than open-ended analytical work across the full business canon.
            </p>
            <p>
              We extend the case-grounded evaluation pattern to business and economically valuable knowledge work, as illustrated in <FigureLink id="fig-pipeline">Figure 1</FigureLink>. Reference solutions derived from instructor case solutions become equally-weighted checklist rubrics, attempted solutions are scored criterion by criterion, and results can be read against both academic disciplines and occupational work activities via <OnetLink /> <RefLink id="ref4">4</RefLink>—the occupational taxonomy developed by the U.S. Department of Labor that classifies work activities and skills across thousands of occupations.
            </p>
          </section>

          <section id="benchmark" className="scroll-mt-12 mb-16 space-y-6">
            <h2 className="text-3xl font-display font-semibold text-slate-900 mb-6">The Benchmark</h2>
            <p>
              The benchmark comprises <strong>617 open-ended questions</strong> from <strong>240 licensed business school cases</strong> paired with instructor case solutions, spanning <strong>18 disciplines</strong> from Strategy and Finance to Leadership and Operations. The benchmark spans subjective and open-ended analytical questions as well as objective, numerical reasoning questions. We classify each question as derived from a case about a fictional firm or a real firm, and as numerical or non-numerical and subjective or objective. The benchmark includes 246 questions on fictional firms and 371 on real firms, 186 numerical and 431 non-numerical questions, and 340 subjective and 277 objective questions. Each question is mapped to the <OnetLink /> occupational taxonomy at Work Activity, Intermediate Work Activity, and Detailed Work Activity levels so results can be read against professional work classifications as well as academic disciplines.
            </p>
            <PullQuote
              citeId="ref3"
              authors="Nohria"
              year="2021"
              sourceTitle="What the Case Study Method Really Teaches"
              sourcePublisher="Harvard Business Impact"
              sourceUrl="https://hbsp.harvard.edu/inspiring-minds/what-the-case-study-method-really-teaches"
            >
              Cases expose students to lots of different situations and roles. Across cases, they get to assume the role of entrepreneur, investor, functional leader, or CEO in a range of different industries and sectors.
            </PullQuote>
            <p>
              To illustrate the diversity of analytical demands, <FigureLink id="tab-representative-questions">Table 1</FigureLink> shows representative questions drawn from the benchmark across disciplines.
            </p>

            <figure id="tab-representative-questions" className="my-12 scroll-mt-24 w-full">
              <div className="w-full overflow-x-auto rounded-lg border border-slate-200 shadow-sm bg-white">
                <table className="w-full text-sm font-serif border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200">
                      <th className="text-left px-4 py-3 font-semibold text-slate-700 w-[22%]">Discipline</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-700">Representative Question</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { discipline: "Business & Government Relations", question: "Write a Supreme Court judicial opinion that rules on a patent settlement between a branded pharmaceutical firm and a generic manufacturer, and establishes a legal framework lower courts can apply to similar agreements." },
                      { discipline: "Economics", question: "As a municipal consultant, analyze participatory-budgeting voting data from a prior city program to evaluate whether approval voting produces fair, proportional outcomes and recommend a voting rule for a new initiative." },
                      { discipline: "Business Ethics", question: "Analyze a data scientist's ethical stance when asked to add a feature that estimates pregnancy likelihood for female job applicants to AI hiring software." },
                      { discipline: "Leadership & Organizational Behavior", question: "Advise a hospital's chief medical officer on whether to promote a division chief whose clinical excellence conflicts with the institution's collaborative culture." },
                      { discipline: "International Business", question: "Advise an executive at a multinational's overseas subsidiary navigating conflicting demands from headquarters and local workplace norms, proposing a strategy that delivers measurable results while respecting local cultural practices." },
                      { discipline: "Finance", question: "Build a discounted cash flow valuation of a luxury automaker at its public offering and quantify how equity value changes under a sharp currency depreciation and alternative management responses." },
                    ].map((row, i) => (
                      <tr key={i} className={`border-b border-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}`}>
                        <td className="px-4 py-3 font-medium text-slate-700 align-top">{row.discipline}</td>
                        <td className="px-4 py-3 text-slate-600 leading-relaxed align-top">{row.question}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <figcaption className="mt-4 w-full text-sm text-slate-500 font-serif leading-relaxed border-l-2 border-wharton/30 pl-4 py-1">
                Table 1: Representative examples from our benchmark of case questions. Each entry is a representative question summary; full case context accompanies each in evaluation.
              </figcaption>
            </figure>

            <p>
              For every question, the instructor case solutions supply a reference solution that we extract and use to generate an equally-weighted checklist rubric. A frontier model receives the full case narrative and exam-style question prompt and produces an open-ended attempted solution in a single turn. The attempted solution is evaluated with a fixed LLM-as-judge <RefLink id="ref5">5</RefLink> against each rubric criterion, as shown in <FigureLink id="fig-pipeline">Figure 1</FigureLink>. Human annotators with business school grading experience also validated automatic rubrics and grading on a stratified sample.
            </p>
            <p>
              We report two complementary metrics. <strong>Standard scoring</strong> awards partial credit as the rubric-weighted fraction of criteria satisfied. It captures how much of what the instructor case solution expected the model actually produced, even when not every element is present. <strong>Complete Answer scoring</strong> is all-or-nothing. It marks whether a model satisfies every criterion on a question’s rubric. High Standard scores with much lower Complete Answer scores mean analytically strong drafts, not responses that satisfy every rubric criterion without review. Complete Answer scoring is deliberately conservative—a lower bound in which one missed criterion fails the question. On subjective, open-ended questions, that can happen even when satisfied criteria would support a strong partial-credit grade that many instructors might treat as analytically sufficient, where full rubric satisfaction might be an unreasonably strict expectation.
            </p>
          </section>

          <section id="performance" className="scroll-mt-12 mb-16 space-y-6">
            <h2 className="text-3xl font-display font-semibold text-slate-900 mb-6">Performance Today</h2>
            <p>
              Across all 617 questions, three frontier models perform at a uniformly high level under Standard scoring. Claude Sonnet 4.6 reaches <strong>88.3%</strong>, GPT-5.4 <strong>87.0%</strong>, and Gemini 3 Flash Preview <strong>81.5%</strong>, a spread of only 6.8 points. When rubric criteria are credited independently, frontier models already cover most of what instructor case solutions expect on open-ended business case work.
            </p>
            <p>
              The same comparison looks materially different under Complete Answer scoring, which requires every rubric criterion on a question to be satisfied. The same models reach full-criterion satisfaction on only <strong>49.4%</strong>, <strong>47.5%</strong>, and <strong>31.9%</strong> of questions respectively. Even the leading model leaves more than half of questions without a fully complete answer by instructor standards. High partial credit therefore describes <em>strong drafts</em> that capture much of the expected analysis, not outputs that meet the full scope of the instructor rubric without review, particularly on subjective, multi-part questions where missing one element is common.
            </p>
            <p>
              Discipline-level performance is structured rather than noisy. Standard scores range from <strong>79.6%</strong> in Finance to <strong>95.0%</strong> in Business &amp; Government Relations, a spread larger than the gap among the three models themselves. Under Complete Answer scoring the same disciplines separate more sharply (25.0% in Operations &amp; Service Management to 82.5% in Decision Analysis). All three frontier models rank disciplines in nearly the same order, with high rank concordance (Kendall’s <InlineMath math="W" /> = 0.80 under Standard scoring and 0.89 under Complete Answer scoring), indicating that difficulty reflects discipline-specific task structure more than any single provider’s training idiosyncrasies.
            </p>
            <FigureBlock figureIdx={1} wide onOpen={openFigure} />
          </section>

          <section id="progress" className="scroll-mt-12 mb-16 space-y-6">
            <h2 className="text-3xl font-display font-semibold text-slate-900 mb-6">Two Years of Progress</h2>
            <p>
              Holding the benchmark fixed, we evaluated four successive OpenAI releases over roughly two years, from GPT-4 Turbo through GPT-4.1 and GPT-5 to GPT-5.4. Mean Standard score rose from <strong>63.7%</strong> to <strong>87.0%</strong>, a <strong>23.3 percentage-point</strong> gain. Complete Answer scoring moved in parallel, from <strong>13.1%</strong> to <strong>47.5%</strong> (+34.4 points), showing models are improving on thoroughness, not merely earning more partial credit.
            </p>
            <p>
              The gains are broad-based. Fictional and real cases improve by essentially the same margin. Numerical questions gain more in absolute terms, but non-numerical and subjective strata improve as much or more under Complete Answer scoring. That pattern counters a narrative in which progress is only “getting better at math,” the capability early models struggled with and popular suites like MATH measure <RefLink id="ref6">6</RefLink>. Large moves appear in Economics (+31.7 points), Accounting &amp; Control (+28.8), and Finance (+28.7) where GPT-4 Turbo began far below today’s levels.
            </p>
            <p>
              The most recent step from GPT-5 to GPT-5.4 is smaller (+2.3 points on Standard scoring and +1.1 points on Complete Answer scoring), as expected as scores approach ceilings, but the two-year arc is unmistakable.
            </p>
            <FigureBlock figureIdx={2} wide onOpen={openFigure} />
          </section>

          <section id="difficulty" className="scroll-mt-12 mb-16 space-y-6">
            <h2 className="text-3xl font-display font-semibold text-slate-900 mb-6">What Still Differentiates Difficulty</h2>
            <p>
              Discipline accounts for far more variation in difficulty than question type strata. Under Standard scoring, mean performance across the six metadata strata sits in a narrow <strong>81.7–87.2%</strong> band. Subjective and objective questions differ by only 0.6 percentage points. Complete Answer scoring widens these gaps by question type modestly but leaves them small relative to the spread across disciplines in <FigureLink id="fig-scores">Figure 2</FigureLink>.
            </p>
            <FigureBlock figureIdx={4} onOpen={openFigure} />
            <p>
              On the full benchmark, questions from real cases score slightly higher than questions from fictional cases under Standard scoring (<strong>86.3%</strong> vs. <strong>84.5%</strong>, a 1.8 percentage-point gap), but the pattern is discipline-specific rather than uniform. In most disciplines with enough questions in both arms, fictional cases score at or above real ones, consistent with real cases having longer and more ambiguous narratives that present more of a challenge than a simplified hypothetical scenario. Finance and Accounting &amp; Control reverse the pattern. Fictional finance questions score <strong>13.7 percentage points</strong> below real finance questions (<strong>70.9%</strong> vs. <strong>84.6%</strong>), with Accounting showing a smaller 2.7-point gap in the same direction; Finance stands out as the lone large negative outlier in <FigureLink id="fig-fiction">Figure 6</FigureLink>. Questions from real cases in these disciplines often anchor on named companies whose financial profiles may appear in public filings or financial press, giving models a pre-training edge that fictional cases, which strip away that exposure, do not provide.
            </p>
            <FigureBlock figureIdx={5} onOpen={openFigure} />
            <p>
              Genuine capability ceilings are rare. Only <strong>45 of 617 questions (7.3%)</strong> score at or below 70% for every frontier model we tested, and only <strong>6.2%</strong> of individual rubric criteria never receive credit from any model. A cross-model oracle that takes the best score per question reaches <strong>92.6%</strong>, 4.3 points above the best single model. What one model misses on a given question is therefore often captured by another, so remaining error reflects incomplete satisfaction of multi-part rubrics more often than absolute capability ceilings.
            </p>
            <p id="onet-mapping" className="scroll-mt-24">
              Mapping benchmark questions to <OnetLink /> Intermediate Work Activities bridges academic disciplines to occupational work activities and occupations <RefLink id="ref4">4</RefLink>. Across 29 IWAs with at least three benchmark questions, mean Standard scores range from <strong>68.0%</strong> on “Advise others on financial matters” and <strong>70.9%</strong> on “Identify business or organizational opportunities” to near-ceiling performance on bounded explanatory and mathematical analysis activities. <FigureLink id="fig-iwa">Figure 4</FigureLink> shows that the hardest activities combine open-ended advisory framing with case-specific quantitative or evaluative reasoning. These mappings are indicative rather than definitive. O*NET work activities are broad and only loosely tied to what any single case question tests, so implied occupation-level results in <FigureLink id="fig-iwa">Figure 4</FigureLink> and <FigureLink id="fig-onet">Figure 7</FigureLink> should be read together with how thoroughly each job’s relevant activities appear in the benchmark.
            </p>
            <FigureBlock figureIdx={3} wide onOpen={openFigure} />
          </section>

          <section id="implications" className="scroll-mt-12 mb-16 space-y-6">
            <h2 className="text-3xl font-display font-semibold text-slate-900 mb-6">Implications</h2>
            <p>
              Frontier AI already performs well on open-ended business case questions when graded against expert-written standards drawn from instructor case solutions. Capability within at least one model family has improved dramatically over roughly two years. The empirical question is no longer whether models can do the analytic knowledge work cases demand, but how completely they do it, where they remain weakest, and how business schools and firms should respond as that capability redistributes between humans and machines.
            </p>
            <p>
              For business schools, case pedagogy trains the judgment, synthesis, and defensible reasoning that MBA programs and undergraduate curricula were designed to build <RefLink id="ref3">3</RefLink>. When producing a strong draft answer is inexpensive and fast, programs must emphasize verification, thoroughness, and knowing what a fully complete answer requires, particularly in disciplines where Standard scores are already high but Complete Answer satisfaction remains elusive.
            </p>
            <p>
              For labor markets, occupational mappings in <FigureLink id="fig-onet">Figure 7</FigureLink> highlight where knowledge workers face the most implied exposure and where human advantage may persist in integration across stakeholders, accountability, and context that single-turn benchmarks abstract away. Field evidence on uneven productivity gains across knowledge workers underscores that the frontier is jagged in practice, not smooth <RefLink id="ref7">7</RefLink>.
            </p>
            <FigureBlock figureIdx={6} wide onOpen={openFigure} />
            <p className="text-base text-slate-600">
              <strong>Limitations:</strong> Our evaluation is single-turn, English-only, and rubric-guided. It does not measure iterative clarification, negotiation, or formal accountability inside organizations. LLM-as-judge grading can miss extraneous or incorrect content outside the checklist. These boundaries define where human-AI teaming may matter most and where subsequent work should connect measured capability to institutional outcomes.
            </p>
          </section>

          <hr className="my-16 border-slate-200" />

          <section id="references" className="scroll-mt-12 mb-24">
            <h2 className="text-2xl font-display font-semibold text-slate-900 mb-8">References</h2>
            <div className="space-y-4">
              {references.map((ref, idx) => (
                <div key={ref.id} id={ref.id} className="pl-6 text-base text-slate-600 font-serif relative scroll-mt-24">
                  <span className="absolute left-0 top-0 text-slate-400 text-sm">[{idx + 1}]</span>
                  {ref.text}
                </div>
              ))}
            </div>
          </section>

          <hr className="my-16 border-slate-200" />

          <section id="appendix" className="scroll-mt-12 mb-24 space-y-6">
            <h2 className="text-3xl font-display font-semibold text-slate-900 mb-6">Appendix</h2>

            <h3 id="scoring" className="text-2xl font-display font-medium text-slate-800 scroll-mt-12">How We Scored Responses</h3>
            <p>
              We built the benchmark from licensed business school case PDFs and paired instructor case solution PDFs processed under Zero Data Retention (ZDR) policies. All PDFs were first converted to linearized markdown using vision-language OCR, with an LLM-assisted cleaning pass on the extracted text. Questions and reference solutions were extracted solely from material appearing explicitly in the instructor case solution. Each retained instance was manually reviewed before inclusion. Later construction steps used LLM assistance for extraction and metadata, but retained items passed human quality inspection.
            </p>
            <ul className="list-disc pl-6 space-y-2 font-serif">
              <li>OCR and clean case and solution PDFs into structured text, then label fictional vs. real firms and question metadata.</li>
              <li>Generate equally-weighted checklist rubrics from exam-style question prompts and reference solutions in the instructor case solution.</li>
              <li>Prompt frontier solver AI models with the full case narrative and exam-style question prompt in one turn, with no tools or retrieval.</li>
              <li>Grade with a fixed LLM-as-judge (Gemini 2.5 Flash) held constant across all solver models <RefLink id="ref5">5</RefLink>.</li>
              <li>
                Validate automated rubrics and grades with blinded human annotators experienced in business school grading.{" "}
                <span className="font-bold text-red-600">TODO: Add a sentence here on results of human annotator experiments.</span>
              </li>
            </ul>

            <h3 id="scoring-math" className="text-2xl font-display font-medium text-slate-800 mt-10 mb-4 scroll-mt-12">Scoring Formulas</h3>
            <p>
              Let model <InlineMath math="m" /> answer question <InlineMath math="j" /> with <InlineMath math="k_j" /> rubric criteria, and let <InlineMath math="c_{mji} \in \{0,1\}" /> indicate whether criterion <InlineMath math="i" /> is satisfied. The per-question Standard score is
            </p>
            <div className="my-8 py-6 px-4 bg-slate-50 overflow-x-auto overflow-y-hidden rounded-md border border-slate-100 flex justify-start md:justify-center text-[15px] sm:text-lg md:text-xl hide-scrollbar">
              <div className="min-w-max px-2">
                <BlockMath math="s_{mj}=\frac{1}{k_j}\sum_{i=1}^{k_j} c_{mji}" />
              </div>
            </div>
            <p>
              Each <InlineMath math="s_{mj}" /> is a normalized fraction in <InlineMath math="[0,1]" /> (the equally weighted share of rubric criteria satisfied on that question). Throughout the paper we multiply by 100 and report Standard scores as percentages—for example, <InlineMath math="s_{mj}=0.883" /> is reported as 88.3%.
            </p>
            <p>
              The model-level Standard score averages <InlineMath math="s_{mj}" /> over all <InlineMath math="N=617" /> questions and is reported the same way. Complete Answer scoring marks whether every criterion on a question is satisfied, that is, when <InlineMath math="s_{mj}=1" />. Reported uncertainties use bootstrap resampling over questions (500 resamples, 95% percentile intervals).
            </p>

            <h3 id="composition" className="text-2xl font-display font-medium text-slate-800 mt-10 scroll-mt-12">Benchmark Composition</h3>
            <p>
              <FigureLink id="tab-overall-metadata">Table 2</FigureLink> and <FigureLink id="tab-by-discipline">Table 3</FigureLink> reproduce the main composition summaries from the paper’s supplementary materials, with overall question-level metadata and the breakdown across eighteen business disciplines.
            </p>

            <CompositionTableBlock
              id="tab-overall-metadata"
              caption="Table 2: Benchmark composition, overall question-level metadata."
              columns={[
                { key: "strata", label: "Strata" },
                { key: "n", label: "Questions", align: "right" },
              ]}
              rows={overallMetadataRows}
            />

            <CompositionTableBlock
              id="tab-by-discipline"
              scaleOnOverflow
              caption="Table 3: Benchmark composition by business discipline. Non-num. = non-numerical."
              columns={[
                { key: "discipline", label: "Discipline", headerClass: "min-w-[10rem]" },
                { key: "n", label: "n", align: "right" },
                { key: "fictional", label: "Fictional", align: "right" },
                { key: "real", label: "Real", align: "right" },
                { key: "numerical", label: "Numerical", align: "right" },
                { key: "nonNumerical", label: "Non-num.", align: "right" },
                { key: "subjective", label: "Subjective", align: "right" },
                { key: "objective", label: "Objective", align: "right" },
              ]}
              rows={disciplineCompositionRows}
              totalRow={disciplineCompositionTotal}
            />

            <h3 id="progress-by-discipline" className="text-2xl font-display font-medium text-slate-800 mt-10 scroll-mt-12">Progress By Discipline</h3>
            <p>
              The figure tracks the four OpenAI models on the twelve disciplines with at least fifteen questions, under both scoring regimes, to show how generational gains vary by discipline. Large moves appear in Economics, Accounting &amp; Control, and Finance where GPT-4 Turbo began far below today’s levels, complementing the aggregate trajectory in <FigureLink id="fig-trajectory">Figure 3</FigureLink>.
            </p>
            <FigureBlock figureIdx={7} wide onOpen={openFigure} />
          </section>
        </main>
      </div>

      <footer className="bg-slate-50 py-12 border-t border-slate-200 mt-12 flex flex-col items-center justify-center text-center text-sm text-slate-600 font-serif gap-6">
        <div>
          <p className="flex items-center justify-center gap-2 mb-1">
            <Mail className="w-4 h-4" />
            Direct Correspondence To:
          </p>
          <a href={`mailto:${paperMetadata.correspondence}`} className="text-wharton hover:underline transition-colors">{paperMetadata.correspondence}</a>
          <div className="mt-4">
            <ViewFullPaperButton className="inline-flex text-sm text-slate-500 hover:text-wharton" />
          </div>
        </div>
        <p className="text-slate-500">© {paperMetadata.year} {formatAuthorsForCitation(paperMetadata.authors)}. All rights reserved.</p>
      </footer>

      {activeFigureIdx !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm animate-in fade-in duration-200 overscroll-none"
          role="dialog"
          aria-modal="true"
          aria-label={`Figure ${activeFigureIdx + 1}: ${figures[activeFigureIdx].caption.split(":")[0]}`}
        >
          <button
            type="button"
            onClick={closeFigure}
            className="absolute right-4 z-[60] p-2.5 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white transition-colors touch-manipulation top-[max(1rem,env(safe-area-inset-top))]"
            aria-label="Close figure"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className="figure-zoom-viewport absolute inset-x-0 top-[calc(3.5rem+env(safe-area-inset-top))] bottom-[calc(9.5rem+env(safe-area-inset-bottom))] sm:bottom-[calc(8.5rem+env(safe-area-inset-bottom))] md:inset-0 md:top-0 md:bottom-0 flex items-center justify-center px-2 sm:px-6 md:px-12 md:py-12"
            aria-label="Pinch to zoom, drag to pan, double-tap to zoom in"
          >
            <TransformWrapper
              key={figures[activeFigureIdx].id}
              ref={figureZoomRef}
              {...figureZoomOptions}
            >
              <TransformComponent
                wrapperClass="figure-zoom-wrapper !w-full !h-full"
                contentClass="figure-zoom-content !w-full !h-full flex items-center justify-center"
              >
                <img
                  src={figures[activeFigureIdx].src}
                  alt={figures[activeFigureIdx].caption.split(":")[0]}
                  draggable={false}
                  className="max-w-full max-h-full w-auto h-auto object-contain shadow-2xl select-none pointer-events-auto"
                />
              </TransformComponent>
            </TransformWrapper>
          </div>

          <p className="sr-only">Use pinch gestures to zoom and one finger to pan. Double-tap to zoom in.</p>

          <div className="absolute inset-x-0 bottom-0 z-[60] px-3 sm:px-4 md:px-6 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 pointer-events-none">
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-end gap-3 md:gap-4">
              <div className="w-full md:max-w-2xl text-white font-serif tracking-wide bg-black/60 p-3 sm:p-4 rounded-xl pointer-events-auto border border-white/10 text-xs sm:text-sm md:text-base order-2 md:order-1 overflow-y-auto max-h-[22vh] sm:max-h-[26vh] md:max-h-[30vh] overscroll-contain">
                {figures[activeFigureIdx].abbrevCaption ?? figures[activeFigureIdx].caption}
              </div>

              <div className="flex items-center justify-end gap-1.5 sm:gap-2 pointer-events-auto order-1 md:order-2 shrink-0 self-end">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); figureZoomRef.current?.zoomOut(0.5); }}
                  className={figureOverlayBtnClass}
                  aria-label="Zoom out"
                >
                  <ZoomOut className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); figureZoomRef.current?.zoomIn(0.5); }}
                  className={figureOverlayBtnClass}
                  aria-label="Zoom in"
                >
                  <ZoomIn className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); figureZoomRef.current?.resetTransform(200); }}
                  className={`${figureOverlayBtnClass} px-3 text-xs sm:text-sm font-medium`}
                  aria-label="Reset zoom"
                >
                  Reset
                </button>
                <span className="w-px h-6 bg-white/20 mx-0.5" aria-hidden="true" />
                <button
                  type="button"
                  onClick={prevFigure}
                  className={figureOverlayBtnClass}
                  aria-label="Previous figure"
                >
                  <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                <button
                  type="button"
                  onClick={nextFigure}
                  className={figureOverlayBtnClass}
                  aria-label="Next figure"
                >
                  <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>
            </div>
            <p className="md:hidden text-center text-[11px] text-white/50 mt-2 pointer-events-none font-serif">
              Pinch to zoom · drag to pan · double-tap to zoom in
            </p>
          </div>
        </div>
      )}

      {typeof document !== 'undefined' && createPortal(
        <div className="lg:hidden fixed bottom-6 right-6 z-[100]">
          <button
            onClick={() => setIsMobileTocOpen(!isMobileTocOpen)}
            className="w-14 h-14 bg-wharton text-white rounded-full flex items-center justify-center shadow-xl hover:bg-[#002e6d] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wharton"
          >
            {isMobileTocOpen ? <X className="w-6 h-6" /> : <List className="w-6 h-6" />}
          </button>

          {isMobileTocOpen && (
            <div className="absolute bottom-20 right-0 w-[280px] max-h-[70vh] overflow-y-auto bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/60 p-6 overscroll-contain origin-bottom-right animate-in slide-in-from-bottom-2 fade-in duration-200 hide-scrollbar">
              {tocContent}
            </div>
          )}
        </div>,
        document.body
      )}

    </div>
  );
}
