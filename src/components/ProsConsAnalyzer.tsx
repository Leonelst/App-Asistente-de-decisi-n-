import React, { useState } from "react";
import { ProConFactor } from "../types";
import { ThumbsUp, ThumbsDown, Trash, Plus, Sparkles, Check, Edit2, Scale } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Props {
  factors: ProConFactor[];
  summary: string;
  recommendation: string;
  onUpdateFactors: (factors: ProConFactor[]) => void;
  onUpdateSummary: (summary: string) => void;
  onUpdateRecommendation: (rec: string) => void;
}

export default function ProsConsAnalyzer({
  factors,
  summary,
  recommendation,
  onUpdateFactors,
  onUpdateSummary,
  onUpdateRecommendation,
}: Props) {
  const [newText, setNewText] = useState("");
  const [newType, setNewType] = useState<"pro" | "con">("pro");
  const [newDesc, setNewDesc] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const pros = factors.filter((f) => f.type === "pro");
  const cons = factors.filter((f) => f.type === "con");

  // Calculations (Unweighted - counting pros vs cons)
  const netScore = pros.length - cons.length;
  const maxPossible = Math.max(pros.length + cons.length, 1);
  const percentagePros = Math.round((pros.length / maxPossible) * 100);

  const handleAddFactor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const newFactor: ProConFactor = {
      id: `custom_${Date.now()}`,
      text: newText.trim(),
      type: newType,
      importance: 3, // default static value to satisfy types
      description: newDesc.trim() || "Factor agregado manualmente.",
    };

    onUpdateFactors([...factors, newFactor]);
    setNewText("");
    setNewDesc("");
  };

  const handleDeleteFactor = (id: string) => {
    onUpdateFactors(factors.filter((f) => f.id !== id));
  };

  const startEditing = (f: ProConFactor) => {
    setEditingId(f.id);
    setEditText(f.text);
    setEditDesc(f.description);
  };

  const saveEdit = (id: string) => {
    onUpdateFactors(
      factors.map((f) =>
        f.id === id ? { ...f, text: editText.trim(), description: editDesc.trim() } : f
      )
    );
    setEditingId(null);
  };

  // Score description color & text
  let scoreVerdict = "Neutral";
  let verdictColor = "text-amber-600 bg-amber-50 border-amber-200";
  let barColor = "bg-amber-500";
  
  if (netScore > 2) {
    scoreVerdict = "Altamente Recomendable (Pros dominantes)";
    verdictColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
    barColor = "bg-emerald-600";
  } else if (netScore > 0) {
    scoreVerdict = "Favorable (Inclinación hacia Pros)";
    verdictColor = "text-teal-700 bg-teal-50 border-teal-200";
    barColor = "bg-teal-500";
  } else if (netScore < -2) {
    scoreVerdict = "Altamente Desaconsejable (Contras dominantes)";
    verdictColor = "text-rose-700 bg-rose-50 border-rose-200";
    barColor = "bg-rose-600";
  } else if (netScore < 0) {
    scoreVerdict = "Poco Favorable (Inclinación hacia Contras)";
    verdictColor = "text-orange-700 bg-orange-50 border-orange-200";
    barColor = "bg-orange-500";
  }

  return (
    <div className="space-y-8" id="pros-cons-analyzer">
      {/* Dynamic Weighting Meter */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-50 rounded-lg text-blue-600">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base uppercase tracking-wide flex items-center">
                <span className="w-1 h-4 bg-blue-500 mr-2 rounded-full inline-block"></span> Balance de Pros y Contras
              </h3>
              <p className="text-xs text-slate-500">
                Comparación simple entre la cantidad de factores a favor y en contra.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-md border border-slate-200">
            Diferencia Neta: {netScore > 0 ? `+${netScore}` : netScore}
          </span>
        </div>

        {/* Visual progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span className="flex items-center text-emerald-600 font-bold">
              <ThumbsUp className="w-3.5 h-3.5 mr-1" /> PROS ({percentagePros}%)
            </span>
            <span className="flex items-center text-rose-600 font-bold">
              CONTRAS ({100 - percentagePros}%) <ThumbsDown className="w-3.5 h-3.5 ml-1" />
            </span>
          </div>
          <div className="w-full h-3 bg-rose-100 rounded-full overflow-hidden flex">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentagePros}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="bg-emerald-500 h-full"
            />
          </div>
        </div>

        {/* Verdict Badge */}
        <div className={`p-4 rounded-xl border flex items-center justify-between flex-wrap gap-4 ${verdictColor}`}>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75 font-mono">Veredicto Dinámico</span>
            <span className="font-bold text-base">{scoreVerdict}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75 font-mono">Conteo de Factores</span>
            <span className="font-mono font-bold text-sm">
              {pros.length} Pros / {cons.length} Contras
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Pros & Cons Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pros Column */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wide">
              <ThumbsUp className="w-4 h-4 text-emerald-600" /> Pros ({pros.length})
            </h4>
          </div>

          <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {pros.map((factor) => (
                <motion.div
                  key={factor.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-4 bg-slate-50/50 rounded-xl border border-slate-200 space-y-3 relative group hover:bg-slate-50 transition-colors"
                >
                  <div className="flex justify-between items-start gap-2">
                    {editingId === factor.id ? (
                      <div className="w-full space-y-2">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full text-sm font-semibold border border-slate-200 rounded p-2 focus:outline-none focus:border-blue-500 bg-white"
                        />
                        <textarea
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          className="w-full text-xs border border-slate-200 rounded p-2 focus:outline-none focus:border-blue-500 bg-white h-16 resize-none"
                        />
                        <button
                          onClick={() => saveEdit(factor.id)}
                          className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Check className="w-3 h-3" /> Guardar
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1 pr-6">
                        <h5 className="font-bold text-slate-900 text-sm">{factor.text}</h5>
                        <p className="text-xs text-slate-600 leading-relaxed">{factor.description}</p>
                      </div>
                    )}

                    <div className="absolute right-3 top-3 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {editingId !== factor.id && (
                        <button
                          onClick={() => startEditing(factor)}
                          className="p-1 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteFactor(factor.id)}
                        className="p-1 hover:bg-rose-100 text-rose-600 rounded transition-colors"
                        title="Eliminar"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
              {pros.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs font-medium">
                  No hay pros. ¡Agrega uno abajo!
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Cons Column */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wide">
              <ThumbsDown className="w-4 h-4 text-rose-600" /> Contras ({cons.length})
            </h4>
          </div>

          <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {cons.map((factor) => (
                <motion.div
                  key={factor.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-4 bg-slate-50/50 rounded-xl border border-slate-200 space-y-3 relative group hover:bg-slate-50 transition-colors"
                >
                  <div className="flex justify-between items-start gap-2">
                    {editingId === factor.id ? (
                      <div className="w-full space-y-2">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full text-sm font-semibold border border-slate-200 rounded p-2 focus:outline-none focus:border-blue-500 bg-white"
                        />
                        <textarea
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          className="w-full text-xs border border-slate-200 rounded p-2 focus:outline-none focus:border-blue-500 bg-white h-16 resize-none"
                        />
                        <button
                          onClick={() => saveEdit(factor.id)}
                          className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Check className="w-3 h-3" /> Guardar
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1 pr-6">
                        <h5 className="font-bold text-slate-900 text-sm">{factor.text}</h5>
                        <p className="text-xs text-slate-600 leading-relaxed">{factor.description}</p>
                      </div>
                    )}

                    <div className="absolute right-3 top-3 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {editingId !== factor.id && (
                        <button
                          onClick={() => startEditing(factor)}
                          className="p-1 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteFactor(factor.id)}
                        className="p-1 hover:bg-rose-100 text-rose-600 rounded transition-colors"
                        title="Eliminar"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
              {cons.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs font-medium">
                  No hay contras. ¡Agrega uno abajo!
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Manual Input Addition Form */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <h4 className="font-bold text-slate-900 text-sm mb-4 flex items-center uppercase tracking-wide">
          <span className="w-1 h-3.5 bg-blue-500 mr-2 rounded-full inline-block"></span> Agregar un Factor Personalizado
        </h4>
        <form onSubmit={handleAddFactor} className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-6">
            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">Nombre del Factor</label>
            <input
              type="text"
              required
              placeholder="Ej: Aumentará mi productividad"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-slate-900"
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">Tipo</label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as "pro" | "con")}
              className="w-full px-3 py-2 text-sm bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-slate-900 font-medium"
            >
              <option value="pro">Pro (Ventaja)</option>
              <option value="con">Contra (Desventaja)</option>
            </select>
          </div>
          <div className="md:col-span-3 flex items-end">
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4" /> Agregar
            </button>
          </div>
          <div className="md:col-span-12">
            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">Descripción / Notas</label>
            <input
              type="text"
              placeholder="Ej: Esto me permitirá terminar mis tareas un 20% más rápido según los datos..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-slate-900"
            />
          </div>
        </form>
      </div>

      {/* AI Summary and Action Plan - Premium High Fidelity Styling */}
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
            <Scale className="w-32 h-32 text-slate-300" />
          </div>
          <h4 className="font-bold text-white text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-400" /> Plan de Acción Recomendado
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
