import { useState } from "react";
import type { CooldownData, ResolvedLine } from "../types";

const STAGES = ["RT", "50K", "4K", "Still", "CP", "MXC"] as const;

const STAGE_STYLES: Record<string, string> = {
  RT:    "bg-red-500/15 text-red-400 border-red-500/30",
  "50K": "bg-orange-500/15 text-orange-400 border-orange-500/30",
  "4K":  "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
  Still: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  CP:    "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  MXC:   "bg-blue-500/15 text-blue-400 border-blue-500/30",
};

type Props = {
  data: CooldownData;
};

export function LineDetail({ data }: Props) {
  const [selectedSection, setSelectedSection] = useState<string>("control");
  const [selectedLine, setSelectedLine] = useState<ResolvedLine | null>(null);

  const sections: { key: string; label: string; lines: ResolvedLine[] }[] = [
    { key: "control", label: "Control", lines: data.control.lines },
    { key: "readout_send", label: "Readout Send", lines: data.readout_send.lines },
    { key: "readout_return", label: "Readout Return", lines: data.readout_return.lines },
  ];

  const currentSection = sections.find((s) => s.key === selectedSection)!;

  return (
    <div className="card mb-6 overflow-hidden">
      <div className="px-5 py-3 border-b border-cryo-500/40 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-cryo-100 tracking-wide">Line Detail</h3>
        <div className="flex gap-0.5 bg-cryo-900/50 rounded-lg p-0.5 border border-cryo-500/30">
          {sections.map((s) => (
            <button
              key={s.key}
              onClick={() => { setSelectedSection(s.key); setSelectedLine(null); }}
              className={`px-3 py-1.5 text-xs rounded-md transition-all ${
                selectedSection === s.key
                  ? "bg-accent/15 text-accent font-medium border border-accent/20"
                  : "text-cryo-300 hover:text-cryo-100 border border-transparent"
              }`}
            >
              {s.label}
              <span className={`ml-1 ${selectedSection === s.key ? "text-accent/60" : "text-cryo-400"}`}>
                {s.lines.length}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex">
        {/* Line list */}
        <div className="w-52 border-r border-cryo-500/30 max-h-96 overflow-y-auto">
          {currentSection.lines.map((line) => (
            <button
              key={line.line_id}
              onClick={() => setSelectedLine(line)}
              className={`w-full text-left px-4 py-2.5 text-xs border-b border-cryo-500/15 last:border-0 transition-colors ${
                selectedLine?.line_id === line.line_id
                  ? "bg-accent/10 border-l-2 border-l-accent"
                  : "hover:bg-cryo-600/50 border-l-2 border-l-transparent"
              }`}
            >
              <span className={`font-mono font-semibold ${selectedLine?.line_id === line.line_id ? "text-accent" : "text-cryo-100"}`}>
                {line.line_id}
              </span>
              <span className="text-cryo-400 ml-2">
                {line.qubit ?? line.qubits?.join(", ")}
              </span>
            </button>
          ))}
        </div>

        {/* Detail pane */}
        <div className="flex-1 p-5">
          {selectedLine ? (
            <div className="space-y-4" style={{ animation: "fadeIn 150ms ease-out" }}>
              <div className="flex items-baseline gap-3">
                <span className="font-mono font-bold text-base text-cryo-50">{selectedLine.line_id}</span>
                <span className="text-xs text-cryo-300">
                  {selectedLine.qubit ?? selectedLine.qubits?.join(", ")}
                </span>
              </div>
              {STAGES.map((stage) => {
                const comps = selectedLine.stages[stage] ?? [];
                if (comps.length === 0) return null;
                return (
                  <div key={stage}>
                    <span className={`stage-badge ${STAGE_STYLES[stage]} mb-2`}>
                      {stage}
                    </span>
                    <div className="space-y-1.5 ml-3 mt-1.5">
                      {comps.map((c, i) => (
                        <div key={i} className="flex items-center gap-2.5 text-xs">
                          <span className="font-medium text-cryo-100">
                            {c.summary_label || c.model}
                          </span>
                          <span className="text-cryo-400">
                            {c.manufacturer} {c.model}
                          </span>
                          {c.serial && (
                            <span className="text-cryo-500 font-mono text-[10px]">#{c.serial}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-xs text-cryo-400">
              Select a line to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
