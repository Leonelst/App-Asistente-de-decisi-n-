import React, { useState } from "react";
import { ComparisonCriterion, OptionScore } from "../types";
import { Plus, Trash, Edit2, Check, Sparkles, Award, Scale, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Props {
  options: string[];
  criteria: ComparisonCriterion[];
  summary: string;
  recommendation: string;
  onUpdateOptions: (options: string[]) => void;
  onUpdateCriteria: (criteria: ComparisonCriterion[]) => void;
  onUpdateSummary: (summary: string) => void;
  onUpdateRecommendation: (rec: string) => void;
}

export default function ComparisonAnalyzer({
  options,
  criteria,
  summary,
  recommendation,
  onUpdateOptions,
  onUpdateCriteria,
  onUpdateSummary,
  onUpdateRecommendation,
}: Props) {
  const [newCriterionName, setNewCriterionName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  
  const [newOptionName, setNewOptionName] = useState("");
  const [showAddOption, setShowAddOption] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  // Leaderboard / calculations (Unweighted - scoring options on criteria)
  const calculateScores = () => {
    const maxPotential = criteria.length * 10 || 1;

    return options.map((option) => {
      let sum = 0;
      criteria.forEach((criterion) => {
        const optScoreObj = criterion.optionScores.find((os) => os.option === option);
        const score = optScoreObj ? optScoreObj.score : 5; // default to 5 if not found
        sum += score;
      });

      const percentage = Math.round((sum / maxPotential) * 100);
      return {
        name: option,
        weightedScore: sum, // we keep the property name as weightedScore to avoid modifying JSX keys
        percentage: Math.min(percentage, 100),
      };
    }).sort((a, b) => b.weightedScore - a.weightedScore);
  };

  const leaderboard = calculateScores();
  const topOptionName = leaderboard.length > 0 ? leaderboard[0].name : null;

  const handleScoreChange = (criterionId: string, option: string, newScore: number) => {
    const updated = criteria.map((c) => {
      if (c.id !== criterionId) return c;
      const updatedScores = c.optionScores.map((os) =>
        os.option === option ? { ...os, score: newScore } : os
      );
      // Ensure if option didn't exist, we add it
      if (!updatedScores.some((os) => os.option === option)) {
        updatedScores.push({ option, score: newScore });
      }
      return { ...c, optionScores: updatedScores };
    });
    onUpdateCriteria(updated);
  };

  const handleDeleteCriterion = (id: string) => {
    onUpdateCriteria(criteria.filter((c) => c.id !== id));
  };

  const handleAddCriterion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCriterionName.trim()) return;

    // Build default scores of 5 for each active option
    const initialScores: OptionScore[] = options.map((opt) => ({
      option: opt,
      score: 5,
    }));

    const newCrit: ComparisonCriterion = {
      id: `criterion_${Date.now()}`,
      name: newCriterionName.trim(),
      importance: 3, // default static value to satisfy types
      optionScores: initialScores,
      description: newDesc.trim() || "Criterio de comparación personalizado.",
    };

    onUpdateCriteria([...criteria, newCrit]);
    setNewCriterionName("");
    setNewDesc("");
  };

  const handleAddOption = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newOptionName.trim();
    if (!name || options.includes(name)) return;

    const updatedOptions = [...options, name];
    onUpdateOptions(updatedOptions);

    // Update criteria to include scores for this new option
    const updatedCriteria = criteria.map((c) => {
      const optionScores = [...c.optionScores, { option: name, score: 5 }];
      return { ...c, optionScores };
    });
    onUpdateCriteria(updatedCriteria);

    setNewOptionName("");
    setShowAddOption(false);
  };

  const handleDeleteOption = (optionToDelete: string) => {
    if (options.length <= 1) return; // Must have at least one option
    const updatedOptions = options.filter((o) => o !== optionToDelete);
    onUpdateOptions(updatedOptions);

    const updatedCriteria = criteria.map((c) => {
      const optionScores = c.optionScores.filter((os) => os.option !== optionToDelete);
      return { ...c, optionScores };
    });
    onUpdateCriteria(updatedCriteria);
  };

  const startEditing = (c: ComparisonCriterion) => {
    setEditingId(c.id);
    setEditName(c.name);
    setEditDesc(c.description);
  };

  const saveEdit = (id: string) => {
    onUpdateCriteria(
      criteria.map((c) =>
        c.id === id ? { ...c, name: editName.trim(), description: editDesc.trim() } : c
      )
    );
    setEditingId(null);
  };

  return (
    <div className="space-y-8" id="comparison-analyzer">
      {/* Live Leaderboard Card */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-50 rounded-lg text-blue-600">
              <Award className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base uppercase tracking-wide flex items-center">
                <span className="w-1 h-4 bg-blue-500 mr-2 rounded-full inline-block"></span> Puntuación de Opciones en Tiempo Real
              </h3>
              <p className="text-xs text-slate-500">
                La opción recomendada cambia dinámicamente según ajustas las valoraciones de cada criterio.
              </p>
            </div>
          </div>
          {topOptionName && (
            <div className="bg-emerald-50 text-emerald-700 font-bold px-3 py-1.5 rounded-lg border border-emerald-200 text-xs flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-600 animate-bounce" />
              Ganadora: <span className="underline decoration-wavy font-bold">{topOptionName}</span>
            </div>
          )}
        </div>

        {/* Dynamic score leaderboard bars */}
        <div className="space-y-4">
          {leaderboard.map((item, index) => {
            const isWinner = item.name === topOptionName;
            return (
              <div key={item.name} className="space-y-1.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold font-mono ${isWinner ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                      {index + 1}
                    </span>
                    {item.name}
                    {isWinner && <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase border border-emerald-200">Mejor Opción</span>}
                  </span>
                  <span className="font-mono font-bold text-slate-900 text-xs bg-slate-100 px-2 py-1 rounded border border-slate-200">
                    {item.percentage}% ({item.weightedScore} pts)
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex border border-slate-200/55">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className={`h-full ${isWinner ? "bg-emerald-500" : "bg-blue-500"}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Option Manager Panel */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2 flex-wrap gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Alternativas comparadas:</span>
          <div className="flex flex-wrap gap-1.5">
            {options.map((opt) => (
              <span
                key={opt}
                className="inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-800 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-xs"
              >
                {opt}
                {options.length > 1 && (
                  <button
                    onClick={() => handleDeleteOption(opt)}
                    className="text-slate-400 hover:text-rose-600 font-bold ml-1.5 text-xs cursor-pointer focus:outline-none"
                    title={`Eliminar ${opt}`}
                  >
                    &times;
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>

        {showAddOption ? (
          <form onSubmit={handleAddOption} className="flex items-center gap-2">
            <input
              type="text"
              required
              placeholder="Nueva Opción..."
              value={newOptionName}
              onChange={(e) => setNewOptionName(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 cursor-pointer transition-colors"
            >
              Añadir
            </button>
            <button
              type="button"
              onClick={() => setShowAddOption(false)}
              className="text-slate-500 hover:text-slate-800 text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
          </form>
        ) : (
          <button
            onClick={() => setShowAddOption(true)}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Agregar Otra Opción
          </button>
        )}
      </div>

      {/* Comparison Grid & Interactive Score Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h4 className="font-bold text-slate-950 text-sm flex items-center uppercase tracking-wide">
            <Scale className="w-5 h-5 text-blue-600 mr-2" /> Matriz Comparativa de Criterios
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Califica cada opción de 1 a 10 para ver la recalculación automática de las puntuaciones.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase tracking-wider text-left border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 min-w-[200px]">Criterio</th>
                {options.map((opt) => (
                  <th key={opt} className="px-6 py-4 w-[200px] text-center bg-blue-50/20 border-l border-slate-200/50">
                    Calificación de: <span className="font-bold text-blue-900 block font-mono text-[10px] uppercase mt-0.5">{opt}</span>
                  </th>
                ))}
                <th className="px-4 py-4 w-[80px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              <AnimatePresence initial={false}>
                {criteria.map((crit) => (
                  <motion.tr
                    key={crit.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    {/* Criterion Title & Info */}
                    <td className="px-6 py-4">
                      {editingId === crit.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="text-xs font-bold border border-slate-200 rounded p-1.5 focus:outline-none w-full bg-white"
                          />
                          <input
                            type="text"
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            className="text-xs border border-slate-200 rounded p-1.5 focus:outline-none w-full bg-white"
                          />
                          <button
                            onClick={() => saveEdit(crit.id)}
                            className="px-2.5 py-1 bg-blue-600 text-white text-xs font-semibold rounded cursor-pointer hover:bg-blue-700 transition-colors"
                          >
                            Ok
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 text-sm">{crit.name}</span>
                            <button
                              onClick={() => startEditing(crit)}
                              className="text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed max-w-xs">{crit.description}</p>
                        </div>
                      )}
                    </td>



                    {/* Option Scores sliders */}
                    {options.map((opt) => {
                      const scoreObj = crit.optionScores.find((os) => os.option === opt) || { option: opt, score: 5 };
                      return (
                        <td key={opt} className="px-6 py-4 bg-slate-50/30 text-center border-l border-slate-200/40">
                          <div className="space-y-1.5 max-w-[160px] mx-auto">
                            <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                              <span className="font-mono text-[10px] text-slate-400">Nota:</span>
                              <span className="text-blue-700 font-bold bg-white border border-blue-100 px-2 py-0.5 rounded font-mono text-xs shadow-xs">
                                {scoreObj.score} / 10
                              </span>
                            </div>
                            <input
                              type="range"
                              min="1"
                              max="10"
                              value={scoreObj.score}
                              onChange={(e) => handleScoreChange(crit.id, opt, parseInt(e.target.value))}
                              className="w-full h-1 accent-blue-500 bg-slate-200 rounded appearance-none cursor-pointer"
                            />
                          </div>
                        </td>
                      );
                    })}

                    {/* Action buttons */}
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => handleDeleteCriterion(crit.id)}
                        className="p-1.5 hover:bg-rose-50 text-rose-500 hover:text-rose-700 rounded transition-colors cursor-pointer"
                        title="Eliminar criterio"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Criterion Input Form */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <h4 className="font-bold text-slate-900 text-sm mb-4 flex items-center uppercase tracking-wide">
          <span className="w-1 h-3.5 bg-blue-500 mr-2 rounded-full inline-block"></span> Agregar un Nuevo Criterio de Comparación
        </h4>
        <form onSubmit={handleAddCriterion} className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8">
            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">Criterio</label>
            <input
              type="text"
              required
              placeholder="Ej: Curva de Aprendizaje, Costo Mensual..."
              value={newCriterionName}
              onChange={(e) => setNewCriterionName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-slate-900"
            />
          </div>
          <div className="md:col-span-4 flex items-end">
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4" /> Agregar Criterio
            </button>
          </div>
          <div className="md:col-span-12">
            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">Descripción corta</label>
            <input
              type="text"
              placeholder="Ej: Cuánto tiempo nos tomará dominar esta herramienta..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-slate-900"
            />
          </div>
        </form>
      </div>

      {/* Comparison AI Summaries - High Fidelity Style Matching */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-indigo-900 text-indigo-100 border border-indigo-950 rounded-xl p-6 shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-5">
            <Sparkles className="w-32 h-32 text-indigo-200" />
          </div>
          <h4 className="font-bold text-white text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-300 animate-pulse" /> Síntesis de Inteligencia Artificial
          </h4>
          <textarea
            value={summary}
            onChange={(e) => onUpdateSummary(e.target.value)}
            className="w-full text-sm text-indigo-100 bg-indigo-950/40 border border-indigo-800/60 rounded-lg p-3.5 focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:bg-indigo-950/60 resize-none h-36 leading-relaxed"
          />
        </div>

        <div className="bg-slate-900 text-slate-100 border border-slate-950 rounded-xl p-6 shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-5">
            <TrendingUp className="w-32 h-32 text-slate-300" />
          </div>
          <h4 className="font-bold text-white text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" /> Veredicto & Elección Ganadora
          </h4>
          <textarea
            value={recommendation}
            onChange={(e) => onUpdateRecommendation(e.target.value)}
            className="w-full text-sm text-slate-200 bg-slate-950/40 border border-slate-800 rounded-lg p-3.5 focus:outline-none focus:ring-1 focus:ring-slate-700 focus:bg-slate-950/60 resize-none h-36 leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
