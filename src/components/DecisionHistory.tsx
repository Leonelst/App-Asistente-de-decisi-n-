import React from "react";
import { SavedDecision } from "../types";
import { History, Trash, ArrowRight, FolderKanban, Calendar, ThumbsUp, Scale, Compass } from "lucide-react";

interface Props {
  decisions: SavedDecision[];
  currentId: string | null;
  onSelectDecision: (id: string) => void;
  onDeleteDecision: (id: string) => void;
}

export default function DecisionHistory({
  decisions,
  currentId,
  onSelectDecision,
  onDeleteDecision,
}: Props) {
  const getBadge = (type: string) => {
    switch (type) {
      case "pros_cons":
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-100">
            <ThumbsUp className="w-2.5 h-2.5" /> Pros/Contras
          </span>
        );
      case "swot":
        return (
          <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 text-[10px] font-bold px-2 py-0.5 rounded border border-sky-100">
            <Compass className="w-2.5 h-2.5" /> FODA (SWOT)
          </span>
        );
      case "comparison":
        return (
          <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-100">
            <Scale className="w-2.5 h-2.5" /> Comparativo
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4" id="decision-history">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide flex items-center gap-2">
          <History className="w-4 h-4 text-blue-600" /> Historial de Decisiones
        </h3>
        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-mono font-bold border border-slate-200">
          {decisions.length}
        </span>
      </div>

      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
        {decisions.map((dec) => {
          const isSelected = dec.id === currentId;
          const formattedDate = new Date(dec.createdAt).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
          });

          return (
            <div
              key={dec.id}
              className={`p-3.5 rounded-xl border transition-all flex flex-col space-y-2 relative group ${
                isSelected
                  ? "bg-blue-50/50 border-blue-200 ring-1 ring-blue-200"
                  : "bg-slate-50/50 border-slate-200/50 hover:border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="pr-8 space-y-0.5">
                <h4 className="font-bold text-slate-800 text-xs line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {dec.title}
                </h4>
                {dec.context && (
                  <p className="text-[11px] text-slate-500 line-clamp-1">{dec.context}</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-2">
                  {getBadge(dec.type)}
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3" /> {formattedDate}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => onSelectDecision(dec.id)}
                    className="p-1 hover:bg-blue-100/80 rounded text-blue-600 transition-colors cursor-pointer"
                    title="Cargar decisión"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteDecision(dec.id)}
                    className="p-1 hover:bg-rose-100/80 rounded text-rose-600 transition-colors cursor-pointer"
                    title="Eliminar del historial"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {decisions.length === 0 && (
          <div className="text-center py-8 text-slate-400 space-y-2">
            <FolderKanban className="w-8 h-8 mx-auto text-slate-300 stroke-1" />
            <p className="text-xs font-semibold">No hay decisiones guardadas aún.</p>
            <p className="text-[10px] leading-relaxed px-4 text-slate-500">
              Plantea un dilema arriba y pídele ayuda a la IA para comenzar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
