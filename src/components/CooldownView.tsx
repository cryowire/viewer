import type { CooldownData } from "../types";
import { SummaryTable } from "./SummaryTable";
import { LineDetail } from "./LineDetail";

type Props = {
  data: CooldownData;
};

export function CooldownView({ data }: Props) {
  const m = data.metadata;

  const metaTags = [
    m.fridge && { label: "Fridge", value: m.fridge },
    data.chip && { label: "Chip", value: `${data.chip.name} (${data.chip.num_qubits}Q)` },
    m.operator && { label: "Operator", value: m.operator },
    m.purpose && { label: "Purpose", value: m.purpose },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div style={{ animation: "slideUp 250ms ease-out" }}>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-cryo-50 font-mono">
          {m.cooldown_id}
          {m.date && (
            <span className="text-cryo-300/60 font-normal text-sm ml-3 font-sans">{m.date}</span>
          )}
        </h2>
        {metaTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {metaTags.map((tag) => (
              <span
                key={tag.label}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cryo-600/60 border border-cryo-500/40 text-xs text-cryo-200"
              >
                <span className="font-medium text-cryo-100">{tag.label}</span>
                <span className="text-cryo-300">{tag.value}</span>
              </span>
            ))}
          </div>
        )}
        {m.notes && (
          <div className="mt-4 flex items-start gap-2.5 text-sm text-cryo-200 bg-amber-500/5 rounded-xl px-4 py-3 border border-amber-500/20">
            <svg className="w-4 h-4 text-amber-400/70 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <span className="whitespace-pre-wrap text-amber-200/80">{m.notes}</span>
          </div>
        )}
      </div>

      {/* Summary tables */}
      {data.summary.sections.map((section, i) => (
        <div key={section.label} style={{ animation: `slideUp 250ms ease-out ${100 + i * 60}ms both` }}>
          <SummaryTable section={section} />
        </div>
      ))}

      {/* Line detail browser */}
      <div style={{ animation: `slideUp 250ms ease-out ${100 + data.summary.sections.length * 60}ms both` }}>
        <LineDetail data={data} />
      </div>
    </div>
  );
}
