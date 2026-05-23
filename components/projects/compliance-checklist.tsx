import { CheckCircle2, ClipboardCheck } from "lucide-react";

type ComplianceChecklistProps = {
  checklist: string[];
};

export function ComplianceChecklist({ checklist }: ComplianceChecklistProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50">
          <ClipboardCheck className="h-5 w-5 text-emerald-600" />
        </div>

        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Compliance Checklist
          </h2>
          <p className="text-sm text-slate-500">
            Actionable next steps generated from the design change review.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {checklist.map((item, index) => (
          <label
            key={`${item}-${index}`}
            className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50"
          >
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              defaultChecked={index < 2}
            />

            <span className="text-sm leading-6 text-slate-700">{item}</span>
          </label>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
        <p>
          This checklist now updates based on the design change input. The next
          step is to replace this mock logic with the OpenAI API route.
        </p>
      </div>
    </div>
  );
}