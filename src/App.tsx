import React, { useState, useEffect } from "react";
import { SavedDecision, AnalysisType, ProConFactor, SwotFactor, ComparisonCriterion } from "./types";
import ProsConsAnalyzer from "./components/ProsConsAnalyzer";
import SwotAnalyzer from "./components/SwotAnalyzer";
import ComparisonAnalyzer from "./components/ComparisonAnalyzer";
import DecisionHistory from "./components/DecisionHistory";
import {
  Sparkles,
  Scale,
  Compass,
  ThumbsUp,
  BrainCircuit,
  PlusCircle,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Layers,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [methodology, setMethodology] = useState<AnalysisType>("pros_cons");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [currentDecision, setCurrentDecision] = useState<SavedDecision | null>(null);
  const [savedDecisions, setSavedDecisions] = useState<SavedDecision[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock Effect
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load Saved Decisions from Local Storage on Mount
  useEffect(() => {
    const stored = localStorage.getItem("asistente_decisiones_data");
    if (stored) {
      try {
        setSavedDecisions(JSON.parse(stored));
      } catch (e) {
        console.error("Error reading localStorage", e);
      }
    }
  }, []);

  // Helper to persist saved decisions list
  const persistDecisions = (updated: SavedDecision[]) => {
    setSavedDecisions(updated);
    localStorage.setItem("asistente_decisiones_data", JSON.stringify(updated));
  };

  // Preset Dilemmas
  const presets = [
    {
      title: "¿Debería aceptar un trabajo 100% remoto en una empresa internacional?",
      context: "Me pagan más pero tendré que trabajar con husos horarios diferentes y sin oficina física.",
      type: "pros_cons" as AnalysisType,
    },
    {
      title: "¿Debería mudarme a vivir al extranjero el próximo año?",
      context: "Aprender un nuevo idioma y expandir mis oportunidades, pero estaré lejos de la familia.",
      type: "swot" as AnalysisType,
    },
    {
      title: "¿Comprar un coche eléctrico nuevo frente a un híbrido usado?",
      context: "Uso diario principalmente urbano, presupuesto moderado, buscando ahorrar a largo plazo.",
      type: "comparison" as AnalysisType,
    },
  ];

  const handleApplyPreset = (preset: typeof presets[0]) => {
    setTitle(preset.title);
    setContext(preset.context);
    setMethodology(preset.type);
  };

  // AI Generator Request
  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Por favor, introduce la decisión que quieres tomar.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/generate-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision: title,
          context: context,
          type: methodology,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ocurrió un error inesperado al analizar.");
      }

      // Structure decision data
      const newDecision: SavedDecision = {
        id: `decision_${Date.now()}`,
        title: title.trim(),
        context: context.trim(),
        type: methodology,
        createdAt: new Date().toISOString(),
      };

      if (methodology === "pros_cons") {
        newDecision.prosConsData = {
          factors: data.factors,
          summary: data.summary,
          recommendation: data.recommendation,
        };
      } else if (methodology === "swot") {
        newDecision.swotData = {
          factors: data.factors,
          summary: data.summary,
          recommendation: data.recommendation,
        };
      } else if (methodology === "comparison") {
        newDecision.comparisonData = {
          options: data.options,
          criteria: data.criteria,
          summary: data.summary,
          recommendation: data.recommendation,
        };
      }

      setCurrentDecision(newDecision);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  // Save/Update current active decision into LocalStorage List
  const handleSaveToHistory = () => {
    if (!currentDecision) return;

    const exists = savedDecisions.some((d) => d.id === currentDecision.id);
    let updated: SavedDecision[] = [];

    if (exists) {
      updated = savedDecisions.map((d) => (d.id === currentDecision.id ? currentDecision : d));
    } else {
      updated = [currentDecision, ...savedDecisions];
    }

    persistDecisions(updated);
  };

  // Load from history
  const handleSelectDecision = (id: string) => {
    const found = savedDecisions.find((d) => d.id === id);
    if (found) {
      setCurrentDecision(found);
      setTitle(found.title);
      setContext(found.context);
      setMethodology(found.type);
      setErrorMsg(null);
    }
  };

  // Delete from history
  const handleDeleteDecision = (id: string) => {
    const updated = savedDecisions.filter((d) => d.id !== id);
    persistDecisions(updated);
    if (currentDecision?.id === id) {
      setCurrentDecision(null);
    }
  };

  const handleReset = () => {
    setCurrentDecision(null);
    setTitle("");
    setContext("");
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased pb-12">
      {/* Main Header / Navigation */}
      <nav className="h-16 bg-slate-900 text-white flex items-center justify-between px-6 sm:px-8 shrink-0 shadow-lg" id="app-nav">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold text-xl text-white">D</div>
          <span className="font-semibold tracking-tight text-base sm:text-lg">
            Asistente de Decisión <span className="text-blue-400 text-xs uppercase tracking-widest ml-2 font-mono">AI Powered</span>
          </span>
        </div>
        <div className="flex items-center space-x-4 sm:space-x-6 text-sm font-medium">
          <span className="text-blue-400 border-b-2 border-blue-400 pb-4 pt-4 px-1 text-xs sm:text-sm">Análisis Activo</span>
          <span className="opacity-70 hover:opacity-100 cursor-pointer text-xs sm:text-sm transition-opacity hidden sm:inline" onClick={() => {
            const el = document.getElementById("decision-history");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}>Historial</span>
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600 text-xs text-slate-200 font-bold font-mono">
            AD
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT SIDE: Inputs and Current Active Decision Analyzer */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Input Form Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-sm font-bold text-slate-900 flex items-center uppercase tracking-wide">
                  <span className="w-1 h-4 bg-blue-500 mr-2 rounded-full inline-block"></span> Plantear un Nuevo Dilema
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Escribe la decisión que debes tomar y escoge el tipo de análisis que prefieres para ponderar tus opciones.
                </p>
              </div>

              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    ¿Qué decisión necesitas tomar?
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: ¿Debería mudarme de oficina o seguir en la actual?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-900 placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Contexto o alternativas adicionales (Opcional)
                  </label>
                  <textarea
                    placeholder="Añade más detalles sobre tu presupuesto, plazos, temores o las opciones que estás barajando."
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-900 resize-none placeholder:text-slate-400"
                  />
                </div>

                {/* Methodology Selection */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Metodología de Análisis Deseada
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Pros y contras */}
                    <button
                      type="button"
                      onClick={() => setMethodology("pros_cons")}
                      className={`p-3.5 rounded-lg border text-left flex flex-col space-y-1 cursor-pointer transition-all ${
                        methodology === "pros_cons"
                          ? "bg-blue-50/70 border-blue-200 ring-1 ring-blue-200 text-blue-900"
                          : "bg-white border-slate-200 hover:border-slate-300 text-slate-800"
                      }`}
                    >
                      <span className="text-xs font-bold flex items-center gap-1">
                        <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" /> Pros y Contras
                      </span>
                      <span className="text-[10px] text-slate-500 leading-normal">Lista balanceada con cálculo de peso neto.</span>
                    </button>

                    {/* FODA / SWOT */}
                    <button
                      type="button"
                      onClick={() => setMethodology("swot")}
                      className={`p-3.5 rounded-lg border text-left flex flex-col space-y-1 cursor-pointer transition-all ${
                        methodology === "swot"
                          ? "bg-blue-50/70 border-blue-200 ring-1 ring-blue-200 text-blue-900"
                          : "bg-white border-slate-200 hover:border-slate-300 text-slate-800"
                      }`}
                    >
                      <span className="text-xs font-bold flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 text-sky-600" /> Matriz FODA (SWOT)
                      </span>
                      <span className="text-[10px] text-slate-500 leading-normal">Fortalezas, Oportunidades, Debilidades y Amenazas.</span>
                    </button>

                    {/* Comparison Table */}
                    <button
                      type="button"
                      onClick={() => setMethodology("comparison")}
                      className={`p-3.5 rounded-lg border text-left flex flex-col space-y-1 cursor-pointer transition-all ${
                        methodology === "comparison"
                          ? "bg-blue-50/70 border-blue-200 ring-1 ring-blue-200 text-blue-900"
                          : "bg-white border-slate-200 hover:border-slate-300 text-slate-800"
                      }`}
                    >
                      <span className="text-xs font-bold flex items-center gap-1">
                        <Scale className="w-3.5 h-3.5 text-blue-600" /> Tabla Comparativa
                      </span>
                      <span className="text-[10px] text-slate-500 leading-normal">Puntúa múltiples opciones bajo varios criterios.</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  {/* Preset Suggestions */}
                  <div className="hidden md:flex items-center space-x-2 text-xs">
                    <span className="text-slate-400 font-medium">Ejemplos rápidos:</span>
                    <div className="flex gap-1.5">
                      {presets.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleApplyPreset(p)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 rounded-md cursor-pointer transition-colors font-medium border border-slate-200"
                        >
                          Caso {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm shadow-sm hover:shadow transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Analizando con IA...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generar Análisis Inteligente
                      </>
                    )}
                  </button>
                </div>
              </form>

              {errorMsg && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-lg flex items-start gap-2 text-xs text-rose-700">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Error:</span> {errorMsg}
                  </div>
                </div>
              )}
            </div>

            {/* Main Interactive Work Area */}
            <div className="space-y-6">
              {currentDecision ? (
                <div className="space-y-6">
                  {/* Active Decision Context Banner */}
                  <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1.5 max-w-xl">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded font-mono">Dilema Activo</span>
                      <h3 className="text-lg font-bold text-slate-900 leading-snug">{currentDecision.title}</h3>
                      {currentDecision.context && (
                        <p className="text-xs text-slate-600 leading-normal italic bg-slate-50/50 border border-slate-100 p-2 rounded-lg">"{currentDecision.context}"</p>
                      )}
                    </div>
                    
                    {/* Management Actions */}
                    <div className="flex gap-2 w-full md:w-auto shrink-0">
                      <button
                        onClick={handleSaveToHistory}
                        className="flex-1 md:flex-none px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm hover:shadow transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        title="Persistir esta decisión en tu historial local"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Guardar Cambios
                      </button>
                      <button
                        onClick={handleReset}
                        className="flex-1 md:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg cursor-pointer flex items-center justify-center transition-colors"
                      >
                        Limpiar / Nuevo
                      </button>
                    </div>
                  </div>

                  {/* Render Custom Analyzer Based on Selection */}
                  {currentDecision.type === "pros_cons" && currentDecision.prosConsData && (
                    <ProsConsAnalyzer
                      factors={currentDecision.prosConsData.factors}
                      summary={currentDecision.prosConsData.summary}
                      recommendation={currentDecision.prosConsData.recommendation}
                      onUpdateFactors={(factors: ProConFactor[]) => {
                        setCurrentDecision({
                          ...currentDecision,
                          prosConsData: {
                            ...currentDecision.prosConsData!,
                            factors,
                          },
                        });
                      }}
                      onUpdateSummary={(summary: string) => {
                        setCurrentDecision({
                          ...currentDecision,
                          prosConsData: {
                            ...currentDecision.prosConsData!,
                            summary,
                          },
                        });
                      }}
                      onUpdateRecommendation={(recommendation: string) => {
                        setCurrentDecision({
                          ...currentDecision,
                          prosConsData: {
                            ...currentDecision.prosConsData!,
                            recommendation,
                          },
                        });
                      }}
                    />
                  )}

                  {currentDecision.type === "swot" && currentDecision.swotData && (
                    <SwotAnalyzer
                      factors={currentDecision.swotData.factors}
                      summary={currentDecision.swotData.summary}
                      recommendation={currentDecision.swotData.recommendation}
                      onUpdateFactors={(factors: SwotFactor[]) => {
                        setCurrentDecision({
                          ...currentDecision,
                          swotData: {
                            ...currentDecision.swotData!,
                            factors,
                          },
                        });
                      }}
                      onUpdateSummary={(summary: string) => {
                        setCurrentDecision({
                          ...currentDecision,
                          swotData: {
                            ...currentDecision.swotData!,
                            summary,
                          },
                        });
                      }}
                      onUpdateRecommendation={(recommendation: string) => {
                        setCurrentDecision({
                          ...currentDecision,
                          swotData: {
                            ...currentDecision.swotData!,
                            recommendation,
                          },
                        });
                      }}
                    />
                  )}

                  {currentDecision.type === "comparison" && currentDecision.comparisonData && (
                    <ComparisonAnalyzer
                      options={currentDecision.comparisonData.options}
                      criteria={currentDecision.comparisonData.criteria}
                      summary={currentDecision.comparisonData.summary}
                      recommendation={currentDecision.comparisonData.recommendation}
                      onUpdateOptions={(options: string[]) => {
                        setCurrentDecision({
                          ...currentDecision,
                          comparisonData: {
                            ...currentDecision.comparisonData!,
                            options,
                          },
                        });
                      }}
                      onUpdateCriteria={(criteria: ComparisonCriterion[]) => {
                        setCurrentDecision({
                          ...currentDecision,
                          comparisonData: {
                            ...currentDecision.comparisonData!,
                            criteria,
                          },
                        });
                      }}
                      onUpdateSummary={(summary: string) => {
                        setCurrentDecision({
                          ...currentDecision,
                          comparisonData: {
                            ...currentDecision.comparisonData!,
                            summary,
                          },
                        });
                      }}
                      onUpdateRecommendation={(recommendation: string) => {
                        setCurrentDecision({
                          ...currentDecision,
                          comparisonData: {
                            ...currentDecision.comparisonData!,
                            recommendation,
                          },
                        });
                      }}
                    />
                  )}
                </div>
              ) : (
                /* Empty state greeting */
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto">
                    <BrainCircuit className="w-8 h-8" />
                  </div>
                  <div className="max-w-md mx-auto space-y-2">
                    <h3 className="text-lg font-bold text-slate-900">Tu Espacio de Decisión</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Escribe un dilema arriba o aplica uno de los ejemplos para empezar. La inteligencia artificial te ayudará a desglosar los factores críticos de forma clara y objetiva.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE: Historical log, tutorials, weighting guide */}
          <div className="lg:col-span-4 space-y-8">
            {/* Saved Decisions List */}
            <DecisionHistory
              decisions={savedDecisions}
              currentId={currentDecision ? currentDecision.id : null}
              onSelectDecision={handleSelectDecision}
              onDeleteDecision={handleDeleteDecision}
            />

            {/* Tutorial/Guide Box */}
            <div className="bg-slate-900 border border-slate-950 rounded-xl p-6 text-white shadow-md relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10">
                <BrainCircuit className="w-40 h-40 text-blue-500" />
              </div>

              <h4 className="font-semibold text-sm mb-3 flex items-center gap-1.5 text-blue-400">
                <HelpCircle className="w-4 h-4" /> Guía de Metodologías
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Elige la herramienta adecuada según la naturaleza del dilema que necesitas resolver:
              </p>

              <ul className="space-y-3.5 text-xs text-slate-200">
                <li className="space-y-1">
                  <div className="font-bold text-blue-300">1. Pros y Contras:</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">Ideal para decisiones binarias (¿Sí o No?) que requieren una lista ágil y equilibrada de argumentos opuestos.</p>
                </li>
                <li className="space-y-1">
                  <div className="font-bold text-emerald-300">2. Análisis FODA:</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">Perfecto para evaluar situaciones complejas a nivel estratégico, considerando el contexto interno (F/D) y externo (O/A).</p>
                </li>
                <li className="space-y-1">
                  <div className="font-bold text-amber-300">3. Matriz Comparativa:</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">La mejor opción si necesitas comparar múltiples alternativas (como ofertas de empleo o herramientas) usando los mismos criterios comunes.</p>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
