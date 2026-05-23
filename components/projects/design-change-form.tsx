import { Loader2, PencilLine, Sparkles } from "lucide-react";

type DesignChangeFormProps = {
  value: string;
  onChange: (value: string) => void;
  onRunAnalysis: () => void;
  isAnalyzing: boolean;
};

export function DesignChangeForm({
  value,
  onChange,
  onRunAnalysis,
  isAnalyzing,
}: DesignChangeFormProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50">
          <PencilLine className="h-5 w-5 text-violet-600" />
        </div>

        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Design Change Input
          </h2>
          <p className="text-sm text-slate-500">
            Describe the proposed design revision in natural language.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <label className="text-sm font-semibold text-slate-700">
          Design Change Description
        </label>

        <textarea
          className="mt-3 min-h-[180px] w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Example: We are relocating the restroom, moving interior walls, and adding one exterior door."
        />
      </div>

      <div className="mt-5 rounded-2xl bg-violet-50 p-4 text-sm leading-6 text-violet-900">
        <strong>Try examples:</strong> restroom relocation, structural beam
        change, exterior door addition, electrical panel change, HVAC duct
        routing change.
      </div>

      <button
        type="button"
        onClick={onRunAnalysis}
        disabled={isAnalyzing || value.trim().length < 10}
        className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing Design Change...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Run AI Impact Analysis
          </>
        )}
      </button>
    </div>
  );
}