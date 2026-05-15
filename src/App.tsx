import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { ChevronLeft, ChevronRight, X, ArrowUp, Link as LinkIcon, Eye, List, Sparkles, Mail } from 'lucide-react';
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
  date: "May 2026",
  year: 2026
};

const formatAuthorsForCitation = (authors: typeof paperMetadata.authors) => {
  const lastNames = authors.map(a => a.lastName);
  if (lastNames.length === 1) return lastNames[0];
  if (lastNames.length === 2) return `${lastNames[0]} & ${lastNames[1]}`;
  return `${lastNames.slice(0, -1).join(', ')}, & ${lastNames[lastNames.length - 1]}`;
};

const figures = [
  {
    id: "fig1",
    src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
    caption: "Figure 1: Global convergence of the proposed estimator under simulated market conditions. The x-axis represents epochs while the y-axis represents the log-likelihood error."
  },
  {
    id: "fig2",
    src: "https://images.unsplash.com/photo-1543286386-2e659306cd6c?q=80&w=2070&auto=format&fit=crop",
    caption: "Figure 2: Information flow structure observed across the three temporal windows. Note the sudden drop in structural integrity at t=50."
  },
  {
    id: "fig_a1",
    src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop",
    caption: "Figure A.1: Extended dynamics trajectory plot showing the stability regions for varying latency thresholds."
  }
];

const references = [
  { id: "ref1", text: "Smith, J. A., & Doe, J. (2025). The Economics of Information Asymmetry. Journal of Political Economy, 122(3), 643-682." },
  { id: "ref2", text: "Chen, L., & Nguyen, M. (2024). Structural Models in Modern Finance. Econometrica, 92(1), 1-45." },
  { id: "ref3", text: "Patel, A., & Roberts, S. (2023). Deep Learning Dynamics in High-Frequency Trading. Review of Financial Studies, 36(8), 2110-2155." }
];

const tocItems = [
  { id: "exec-summary", title: "Executive Summary" },
  { id: "abstract", title: "Abstract" },
  { id: "introduction", title: "1. Introduction" },
  { id: "methodology", title: "2. Methodology", sub: [
    { id: "math-formulation", title: "2.1 Mathematical Formulation" }
  ]},
  { id: "results", title: "3. Empirical Results" },
  { id: "discussion", title: "4. Discussion" },
  { id: "references", title: "References" },
  { id: "appendix", title: "Appendix" }
];

// --- COMPONENTS ---

const FigureLink = ({ id, children }: { id: string, children: React.ReactNode }) => {
  return (
    <a href={`#${id}`} className="text-wharton hover:text-wharton-red underline decoration-1 underline-offset-2 transition-colors cursor-pointer">
      {children}
    </a>
  );
};

const RefLink = ({ id, children }: { id: string, children: React.ReactNode }) => {
  return (
    <a href={`#${id}`} className="text-wharton hover:text-wharton-red font-medium transition-colors cursor-pointer tracking-tight">
      [{children}]
    </a>
  );
};

export default function App() {
  const [activeFigureIdx, setActiveFigureIdx] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<string>("");
  const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);

  // Handle scroll spy for ToC
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
        <button className="flex items-center gap-2 text-sm text-slate-400 hover:text-wharton transition-colors mt-4">
          <Eye className="w-4 h-4" />
          View Full Paper
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-white text-slate-800 antialiased selection:bg-wharton selection:text-white">
      
      {/* Full Width Wharton Blue Header */}
      <header className="bg-wharton text-white px-6 py-20 lg:py-24 relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="mb-10 flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
            <div className="shrink-0 flex justify-start">
              <img 
                src="/white_collar_robot.png" 
                alt="White collar robot" 
                className="w-32 h-32 md:w-48 md:h-48 object-contain"
              />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium leading-tight mb-3">
                {paperMetadata.title}
              </h1>
              <h2 className="text-2xl md:text-3xl font-display font-normal text-white/80 leading-snug italic">
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
                    <sup className="text-xs ml-0.5">
                      {author.affiliationIds.join(',')}
                      {author.isCorresponding && ',∗'}
                    </sup>
                    {idx < paperMetadata.authors.length - 1 && ","}
                  </span>
                ))}
              </p>
              <p className="text-sm font-serif mb-6">
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
            
            <div className="text-xs text-slate-300 font-serif">
              <p className="flex items-center gap-2 mb-1">
                <Mail className="w-4 h-4" />
                Correspondence To:
              </p>
              <a href={`mailto:${paperMetadata.correspondence}`} className="text-white hover:text-blue-200 hover:underline transition-colors">{paperMetadata.correspondence}</a>
              <p className="mt-2 text-xs opacity-70">Working Paper — {paperMetadata.date}</p>
            </div>
          </div>
        </div>
        
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      </header>

      {/* Main Layout Area */}
      <div className="max-w-[1400px] mx-auto px-6 py-12 flex flex-col lg:flex-row items-start gap-12 lg:gap-20">
        
        {/* Desktop Table of Contents */}
        <aside className="hidden lg:block w-72 sticky top-12 shrink-0 border-l border-slate-200 pl-8 pb-12">
          {tocContent}
        </aside>

        {/* Article Body */}
        <main className="flex-1 max-w-3xl lg:max-w-4xl text-lg leading-relaxed text-slate-700">
          
          <section id="exec-summary" className="scroll-mt-12 mb-16">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 shadow-sm">
              <h2 className="text-2xl font-display font-semibold text-slate-900 mb-4">Executive Summary</h2>
              <div className="prose prose-slate prose-lg font-serif">
                <ul className="list-none pl-0 space-y-4 m-0">
                  <li className="flex items-start gap-4 m-0 p-0">
                    <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-1.5" />
                    <span className="leading-relaxed">We introduce a novel mathematical framework for quantifying information asymmetry in high-frequency trading environments.</span>
                  </li>
                  <li className="flex items-start gap-4 m-0 p-0">
                    <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-1.5" />
                    <span className="leading-relaxed">Using structural flow analysis, we demonstrate that market integrity degrades non-linearly under specific conditions.</span>
                  </li>
                  <li className="flex items-start gap-4 m-0 p-0">
                    <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-1.5" />
                    <span className="leading-relaxed">The framework provides a new predictive indicator for sudden volatility spikes.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section id="abstract" className="scroll-mt-12 mb-16 space-y-6">
            <h2 className="text-3xl font-display font-semibold text-slate-900 mb-6">Abstract</h2>
            <div className="prose prose-slate prose-lg font-serif">
              <p>
                As AI systems become increasingly capable, evaluating their performance on complex, real-world tasks presents a growing challenge. In this paper, we introduce a new methodology for benchmarking Large Language Models (LLMs) on knowledge work using realistic business cases. By mapping AI performance across core business disciplines, we identify both structural strengths and current limitations in specialized analytical reasoning. Our findings offer critical implications for the integration of AI in white-collar labor markets and the future of business education.
              </p>
            </div>
          </section>

          <section id="introduction" className="scroll-mt-12 mb-16 space-y-6">
            <h2 className="text-3xl font-display font-semibold text-slate-900 mb-6">1. Introduction</h2>
            <p>
              The study of information asymmetry has been foundational in modern financial economics since the seminal works of Akerlof and Stiglitz. However, in the era of high-frequency trading (HFT), the temporal dimension of information flow requires new structural models <RefLink id="ref1">1</RefLink>. We propose a framework that treats information not as a static resource, but as a dynamic, structural flow across market participants.
            </p>
            <p>
              As illustrated in <FigureLink id="fig1">Figure 1</FigureLink>, our estimator converges rapidly, even under simulated stress. This allows us to capture fleeting moments of structural decay that previous models miss <RefLink id="ref2">2</RefLink>. 
            </p>
            
            {/* Figure 1 Component */}
            <figure id="fig1" className="my-12 scroll-mt-24">
              <div 
                className="w-full bg-slate-100 rounded-lg overflow-hidden cursor-zoom-in border border-slate-200 hover:ring-2 ring-wharton/30 transition-all shadow-sm"
                onClick={() => openFigure(0)}
              >
                <img 
                  src={figures[0].src} 
                  alt="Figure 1" 
                  className="w-full h-auto object-cover max-h-[500px]"
                />
              </div>
              <figcaption className="mt-4 text-sm text-slate-500 font-serif leading-relaxed border-l-2 border-wharton/30 pl-4 py-1">
                {figures[0].caption}
              </figcaption>
            </figure>

            <p>
              This paper is organized as follows: Section 2 outlines the mathematical formulation. Section 3 discusses the empirical results, and Section 4 concludes with structural implications for market makers.
            </p>
          </section>

          <section id="methodology" className="scroll-mt-12 mb-16 space-y-6">
            <h2 className="text-3xl font-display font-semibold text-slate-900 mb-6">2. Methodology</h2>
            <p>
              Our methodology relies on deep learning dynamics adapted for stochastic environments <RefLink id="ref3">3</RefLink>.
            </p>

            <h3 id="math-formulation" className="text-2xl font-display font-medium text-slate-800 mt-10 mb-4 scroll-mt-12">2.1 Mathematical Formulation</h3>
            <p>
              Let <InlineMath math="\Omega" /> be the set of all observable market states. We define the information flow density <InlineMath math="\rho(t)" /> at time <InlineMath math="t" /> as:
            </p>
            
            <div className="my-8 py-6 px-4 bg-slate-50 overflow-x-auto overflow-y-hidden rounded-md border border-slate-100 flex justify-start md:justify-center text-[15px] sm:text-lg md:text-xl hide-scrollbar">
              <div className="min-w-max px-2">
                <BlockMath math="\rho(t) = \int_{\Omega} \frac{\partial \mathcal{I}(x, t)}{\partial x} e^{-\gamma \|x\|^2} dx" />
              </div>
            </div>

            <p>
              Where <InlineMath math="\mathcal{I}(x,t)" /> is the structural information matrix and <InlineMath math="\gamma > 0" /> is the market decay constant. Evaluating this integral analytically is intractable in dimensions <InlineMath math="d > 3" />, motivating our use of an approximated discrete-time estimator.
            </p>
            <p>
              Solving for the steady state requires satisfying the condition:
            </p>
            
            <div className="my-8 py-6 px-4 bg-slate-50 overflow-x-auto overflow-y-hidden rounded-md border border-slate-100 flex justify-start md:justify-center text-[15px] sm:text-lg md:text-xl hide-scrollbar">
              <div className="min-w-max px-2">
               <BlockMath math="\lim_{t \to \infty} \nabla \cdot (\kappa \nabla \rho(t)) = 0" />
              </div>
            </div>
            
            <p className="text-sm italic text-slate-500 mt-2">
              Note: The derivation of the discrete bounds is provided in the supplementary appendix.
            </p>
          </section>

          <section id="results" className="scroll-mt-12 mb-16 space-y-6">
            <h2 className="text-3xl font-display font-semibold text-slate-900 mb-6">3. Empirical Results</h2>
            <p>
              We applied the estimator to a proprietary dataset encompassing $2.4 \times 10^9$ limit order book events. 
            </p>
            <p>
               <FigureLink id="fig2">Figure 2</FigureLink> presents the structural integrity over time. Unlike standard volatility metrics, our structural metric identifies the exact window (<InlineMath math="t=50" />) where information asymmetry peaks before a price correction occurs.
            </p>

            {/* Figure 2 Component */}
            <figure id="fig2" className="my-12 scroll-mt-24 lg:w-[110%] lg:-ml-[5%]">
              <div 
                className="w-full bg-slate-100 rounded-lg overflow-hidden cursor-zoom-in border border-slate-200 hover:ring-2 ring-wharton/30 transition-all shadow-sm"
                onClick={() => openFigure(1)}
              >
                <img 
                  src={figures[1].src} 
                  alt="Figure 2" 
                  className="w-full h-auto object-cover max-h-[600px]"
                />
              </div>
              <figcaption className="mt-4 text-sm text-slate-500 font-serif leading-relaxed border-l-2 border-wharton/30 pl-4 py-1 mx-[5%]">
                {figures[1].caption}
              </figcaption>
            </figure>
          </section>
          
          <section id="discussion" className="scroll-mt-12 mb-16 space-y-6">
            <h2 className="text-3xl font-display font-semibold text-slate-900 mb-6">4. Discussion</h2>
            <p>
              The non-linear decay of structural flow under stress provides a critical warning signal for systemic risk. Future research should extend this formulation to cross-asset arbitrage scenarios where latency creates fragmented information topologies. 
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
            <div className="prose prose-slate prose-lg font-serif">
              <h3 className="text-xl font-display font-semibold text-slate-900 mb-4">A. Detailed Derivations</h3>
              <p>
                In this section, we provide the extended derivations for the structural equation utilized in the main body. As illustrated in <FigureLink id="fig_a1">Figure A.1</FigureLink>, the structural integrity parameter significantly degrades when latency reaches critical thresholds. This observation is consistent with the findings reported by Chen & Nguyen (2024) <RefLink id="ref2">2</RefLink>.
              </p>
              <p>
                Furthermore, empirical observations suggest that high-frequency trading dynamics follow non-linear trajectories that we model using an augmented framework. The fundamental properties of this model were initially proposed in the classical work on deep learning dynamics in trading <RefLink id="ref3">3</RefLink>.
              </p>
            </div>

            {/* Figure A.1 Component */}
            <figure id="fig_a1" className="my-12 scroll-mt-24 lg:w-[110%] lg:-ml-[5%]">
              <div 
                className="w-full bg-slate-100 rounded-lg overflow-hidden cursor-zoom-in border border-slate-200 hover:ring-2 ring-wharton/30 transition-all shadow-sm"
                onClick={() => openFigure(2)}
              >
                <img 
                  src={figures[2].src} 
                  alt="Figure A.1" 
                  className="w-full h-auto object-cover max-h-[600px]"
                />
              </div>
              <figcaption className="mt-4 text-sm text-slate-500 font-serif leading-relaxed border-l-2 border-wharton/30 pl-4 py-1 mx-[5%]">
                {figures[2].caption}
              </figcaption>
            </figure>
          </section>
        </main>
      </div>

      {/* FOOTER */}
      <footer className="bg-slate-50 py-12 border-t border-slate-200 mt-12 flex flex-col items-center justify-center text-center text-sm text-slate-600 font-serif gap-6">
        <div>
          <p className="flex items-center justify-center gap-2 mb-1">
            <Mail className="w-4 h-4" />
            Direct Correspondence To:
          </p>
          <a href={`mailto:${paperMetadata.correspondence}`} className="text-wharton hover:underline transition-colors">{paperMetadata.correspondence}</a>
        </div>
        <p className="text-slate-500">© {paperMetadata.year} {formatAuthorsForCitation(paperMetadata.authors)}. All rights reserved.</p>
      </footer>

      {/* FULL SCREEN FIGURE OVERLAY */}
      {activeFigureIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200">
          
          {/* Controls */}
          <button 
            onClick={closeFigure}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="absolute bottom-6 w-full px-4 md:px-6 flex flex-col md:flex-row justify-between items-end gap-4 z-50 pointer-events-none">
            <div className="w-full md:max-w-2xl text-white font-serif tracking-wide bg-black/60 p-4 rounded-xl pointer-events-auto border border-white/10 text-sm md:text-base order-2 md:order-1 overflow-y-auto max-h-[30vh]">
              {figures[activeFigureIdx].caption}
            </div>
            
            <div className="flex gap-2 pointer-events-auto order-1 md:order-2">
              <button 
                onClick={prevFigure}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-md"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={nextFigure}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-md"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          {/* Zoom/Pan Area */}
          <div className="w-full h-full flex items-center justify-center p-12">
            <TransformWrapper
              initialScale={1}
              minScale={0.5}
              maxScale={5}
              centerOnInit
            >
              <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center">
                <img 
                  src={figures[activeFigureIdx].src} 
                  alt="Fullscreen Figure" 
                  className="max-w-full max-h-[85vh] object-contain shadow-2xl"
                />
              </TransformComponent>
            </TransformWrapper>
          </div>
        </div>
      )}

      {/* Mobile Floating Table of Contents via Portal */}
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
