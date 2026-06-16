import type { Step } from "./types";
import { CheckIcon } from "./icons";

export function StepIndicator({ steps, current }: { steps: Step[]; current: Step }) {
  const idx = steps.indexOf(current);
  if (idx < 0) return null;

  return (
    <nav className="flex items-center justify-center gap-0 mb-10" aria-label="Progress">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all duration-500 ${
              i < idx
                ? "bg-primary text-black"
                : i === idx
                  ? "ring-2 ring-primary bg-primary/20 text-primary"
                  : "bg-zinc-800 text-zinc-500"
            }`}
          >
            {i < idx ? <CheckIcon /> : i + 1}
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-10 sm:w-16 h-0.5 mx-1 transition-colors duration-500 ${
                i < idx ? "bg-primary" : "bg-zinc-800"
              }`}
            />
          )}
        </div>
      ))}
    </nav>
  );
}
