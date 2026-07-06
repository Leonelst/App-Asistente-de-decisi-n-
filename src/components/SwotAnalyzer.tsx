import React, { useState } from "react";
import { SwotFactor } from "../types";
import { Plus, Trash, Edit2, Check, Sparkles, Shield, AlertTriangle, Lightbulb, Compass } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Props {
  factors: SwotFactor[];
  summary: string;
  recommendation: string;
  onUpdateFactors: (factors: SwotFactor[]) => void;
  onUpdateSummary: (summary: string) => void;
  onUpdateRecommendation: (rec: string) => void;
}

export default function SwotAnalyzer({
  factors,
  summary,
  recommendation,
  onUpdateFactors,
  onUpdateSummary,
  onUpdateRecommendation,
}: Props) {
  const [newText, setNewText] = useState("");
  const [newType, setNewType] = useState<"strength" | "weakness" | "opportunity" | "threat">("strength");
  const [newDesc, setNewDesc] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const strengths = factors.filter((f) => f.type === "strength");
  const weaknesses = factors.filter((f) => f.type === "weakness");
  const opportunities = factors.filter((f) => f.type === "opportunity");
  const threats = factors.filter((f) => f.type === "threat");

  // Strategic Scores (Unweighted - counting favorable vs unfavorable factors)
  const positiveForces = strengths.length + opportunities.length;
  const negativeForces = weaknesses.length + threats.length;

  const totalForces = Math.max(positiveForces + negativeForces, 1);
  const positiveRatio = Math.round((positiveForces / totalForces) * 100);

  const handleDeleteFactor = (id: string) => {
    onUpdateFactors(factors.filter((f) => f.id !== id));
  };

  const handleAddFactor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const newFactor: SwotFactor = {
      id: `custom_${Date.now()}`,
      text: newText.trim(),
      type: newType,
      importance: 3, // default static value to satisfy types
      description: newDesc.trim() || "Factor de FODA personalizado.",
    };

    onUpdateFactors([...factors, newFactor]);
    setNewText("");
    setNewDesc("");
  };

  const startEditing = (f: SwotFactor) => {
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

  return (
    <div className="space-y-8" id="swot-analyzer">
      {/* Strategic Balance Meter */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-50 rounded-lg text-blue-600">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base uppercase tracking-wide flex items-center">
                <span className="w-1 h-4 bg-blue-500 mr-2 rounded-full inline-block"></span> Balance Estratégico FODA
              </h3>
              <p className="text-xs text-slate-500">
                Comparación de Fuerzas Favorables (Fortalezas + Oportunidades) vs Desfavorables (Debilidades + Amenazas).
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-md border border-slate-200">
            {positiveRatio >= 50 ? "Estrategia Ofensiva / Crecimiento" : "Estrategia Defensiva / Mitigación"}
          </span>
        </div>

        {/* Visual progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span className="flex items-center text-emerald-600 font-bold">
              Fuerzas Positivas (F + O): {positiveRatio}%
            </span>
            <span className="flex items-center text-orange-600 font-bold">
              Fuerzas de Riesgo (D + A): {100 - positiveRatio}%
            </span>
          </div>
          <div className="w-full h-3 bg-orange-100 rounded-full overflow-hidden flex">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${positiveRatio}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="bg-emerald-500 h-full"
            />
          </div>
        </div>
      </div>

      {/* FODA 2x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* FORTALEZAS (Strengths) */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wide">
              <Shield className="w-4 h-4 text-emerald-600" /> Fortalezas (F)
            </h4>
            <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full border border-emerald-100 font-mono">
              Interno / Positivo
            </span>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {strengths.map((f) => (
                <div key={f.id} className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-200 space-y-2.5 relative group hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start gap-2">
                    {editingId === f.id ? (
                      <div className="w-full space-y-2">
                        <input type="text" value={editText} onChange={(e) => setEditText(e.target.value)} className="w-full text-xs font-semibold bg-white p-2 rounded border border-slate-200 focus:outline-none focus:border-blue-500" />
                        <input type="text" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="w-full text-xs bg-white p-2 rounded border border-slate-200 focus:outline-none focus:border-blue-500" />
                        <button onClick={() => saveEdit(f.id)} className="px-2.5 py-1 bg-blue-600 text-white text-xs font-semibold rounded cursor-pointer hover:bg-blue-700 transition-colors">Guardar</button>
                      </div>
                    ) : (
                      <div className="pr-6">
                        <h5 className="font-bold text-slate-900 text-xs">{f.text}</h5>
                        <p className="text-xs text-slate-600 mt-0.5">{f.description}</p>
                      </div>
                    )}
                    <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEditing(f)} className="p-1 hover:bg-slate-200 rounded text-slate-700 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDeleteFactor(f.id)} className="p-1 hover:bg-rose-100 rounded text-rose-600 transition-colors"><Trash className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              ))}
              {strengths.length === 0 && <p className="text-center py-4 text-slate-400 text-xs font-medium">No hay fortalezas listadas.</p>}
            </AnimatePresence>
          </div>
        </div>

        {/* DEBILIDADES (Weaknesses) */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wide">
              <AlertTriangle className="w-4 h-4 text-rose-600" /> Debilidades (D)
            </h4>
            <span className="text-xs bg-rose-50 text-rose-700 font-bold px-2.5 py-0.5 rounded-full border border-rose-100 font-mono">
              Interno / Riesgo
            </span>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {weaknesses.map((f) => (
                <div key={f.id} className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-200 space-y-2.5 relative group hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start gap-2">
                    {editingId === f.id ? (
                      <div className="w-full space-y-2">
                        <input type="text" value={editText} onChange={(e) => setEditText(e.target.value)} className="w-full text-xs font-semibold bg-white p-2 rounded border border-slate-200 focus:outline-none focus:border-blue-500" />
                        <input type="text" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="w-full text-xs bg-white p-2 rounded border border-slate-200 focus:outline-none focus:border-blue-500" />
                        <button onClick={() => saveEdit(f.id)} className="px-2.5 py-1 bg-blue-600 text-white text-xs font-semibold rounded cursor-pointer hover:bg-blue-700 transition-colors">Guardar</button>
                      </div>
                    ) : (
                      <div className="pr-6">
                        <h5 className="font-bold text-slate-900 text-xs">{f.text}</h5>
                        <p className="text-xs text-slate-600 mt-0.5">{f.description}</p>
                      </div>
                    )}
                    <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEditing(f)} className="p-1 hover:bg-slate-200 rounded text-slate-700 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDeleteFactor(f.id)} className="p-1 hover:bg-rose-100 rounded text-rose-600 transition-colors"><Trash className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              ))}
              {weaknesses.length === 0 && <p className="text-center py-4 text-slate-400 text-xs font-medium">No hay debilidades listadas.</p>}
            </AnimatePresence>
          </div>
        </div>

        {/* OPORTUNIDADES (Opportunities) */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wide">
              <Lightbulb className="w-4 h-4 text-sky-600" /> Oportunidades (O)
            </h4>
            <span className="text-xs bg-sky-50 text-sky-700 font-bold px-2.5 py-0.5 rounded-full border border-sky-100 font-mono">
              Externo / Positivo
            </span>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {opportunities.map((f) => (
                <div key={f.id} className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-200 space-y-2.5 relative group hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start gap-2">
                    {editingId === f.id ? (
                      <div className="w-full space-y-2">
                        <input type="text" value={editText} onChange={(e) => setEditText(e.target.value)} className="w-full text-xs font-semibold bg-white p-2 rounded border border-slate-200 focus:outline-none focus:border-blue-500" />
                        <input type="text" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="w-full text-xs bg-white p-2 rounded border border-slate-200 focus:outline-none focus:border-blue-500" />
                        <button onClick={() => saveEdit(f.id)} className="px-2.5 py-1 bg-blue-600 text-white text-xs font-semibold rounded cursor-pointer hover:bg-blue-700 transition-colors">Guardar</button>
                      </div>
                    ) : (
                      <div className="pr-6">
                        <h5 className="font-bold text-slate-900 text-xs">{f.text}</h5>
                        <p className="text-xs text-slate-600 mt-0.5">{f.description}</p>
                      </div>
                    )}
                    <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEditing(f)} className="p-1 hover:bg-slate-200 rounded text-slate-700 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDeleteFactor(f.id)} className="p-1 hover:bg-rose-100 rounded text-rose-600 transition-colors"><Trash className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              ))}
              {opportunities.length === 0 && <p className="text-center py-4 text-slate-400 text-xs font-medium">No hay oportunidades listadas.</p>}
            </AnimatePresence>
          </div>
        </div>

        {/* AMENAZAS (Threats) */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wide">
              <Compass className="w-4 h-4 text-amber-600" /> Amenazas (A)
            </h4>
            <span className="text-xs bg-amber-50 text-amber-700 font-bold px-2.5 py-0.5 rounded-full border border-amber-100 font-mono">
              Externo / Riesgo
            </span>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {threats.map((f) => (
                <div key={f.id} className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-200 space-y-2.5 relative group hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start gap-2">
                    {editingId === f.id ? (
                      <div className="w-full space-y-2">
                        <input type="text" value={editText} onChange={(e) => setEditText(e.target.value)} className="w-full text-xs font-semibold bg-white p-2 rounded border border-slate-200 focus:outline-none focus:border-blue-500" />
                        <input type="text" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="w-full text-xs bg-white p-2 rounded border border-slate-200 focus:outline-none focus:border-blue-500" />
                        <button onClick={() => saveEdit(f.id)} className="px-2.5 py-1 bg-blue-600 text-white text-xs font-semibold rounded cursor-pointer hover:bg-blue-700 transition-colors">Guardar</button>
                      </div>
                    ) : (
                      <div className="pr-6">
                        <h5 className="font-bold text-slate-900 text-xs">{f.text}</h5>
                        <p className="text-xs text-slate-600 mt-0.5">{f.description}</p>
                      </div>
                    )}
                    <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEditing(f)} className="p-1 hover:bg-slate-200 rounded text-slate-700 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDeleteFactor(f.id)} className="p-1 hover:bg-rose-100 rounded text-rose-600 transition-colors"><Trash className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              ))}
              {threats.length === 0 && <p className="text-center py-4 text-slate-400 text-xs font-medium">No hay amenazas listadas.</p>}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Manual SWOT Input Form */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <h4 className="font-bold text-slate-900 text-sm mb-4 flex items-center uppercase tracking-wide">
          <span className="w-1 h-3.5 bg-blue-500 mr-2 rounded-full inline-block"></span> Agregar Factor FODA Personalizado
        </h4>
        <form onSubmit={handleAddFactor} className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-6">
            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">Factor / Descripción</label>
            <input
              type="text"
              required
              placeholder="Ej: Acceso a financiamiento subsidiado"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-slate-900"
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">Categoría FODA</label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as any)}
              className="w-full px-3 py-2 text-sm bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-slate-900 font-medium"
            >
              <option value="strength">Fortaleza (Interna)</option>
              <option value="weakness">Debilidad (Interna)</option>
              <option value="opportunity">Oportunidad (Externa)</option>
              <option value="threat">Amenaza (Externa)</option>
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
            <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">Notas adicionales (Opcional)</label>
            <input
              type="text"
              placeholder="Explica más de su relevancia..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-slate-900"
            />
          </div>
        </form>
      </div>

      {/* SWOT AI Summaries - High Fidelity Style Matching */}
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
            <Compass className="w-32 h-32 text-slate-300" />
          </div>
          <h4 className="font-bold text-white text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
            <Compass className="w-5 h-5 text-blue-400" /> Recomendaciones del Plan FODA
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
