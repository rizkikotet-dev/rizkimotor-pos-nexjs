"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, RotateCcw, AlertCircle, Store, Receipt, Check } from "lucide-react";
import { updateSettingsBulk, resetSettings } from "./actions";
import type { Settings } from "@/lib/settings";

interface SettingsFormProps {
  settings: Settings;
  grouped: {
    store: Array<{ key: keyof Settings; label: string; type: string; placeholder?: string; hint?: string; options?: string[] }>;
    receipt: Array<{ key: keyof Settings; label: string; type: string; placeholder?: string; hint?: string; options?: string[] }>;
  };
}

export function SettingsForm({ settings, grouped }: SettingsFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);
  const [resetPending, setResetPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setPending(true);
    try {
      const formData = new FormData(e.currentTarget);
      await updateSettingsBulk(formData);
      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError((e as Error).message || "Gagal menyimpan");
    } finally {
      setPending(false);
    }
  }

  async function handleReset() {
    if (!confirm("Reset semua pengaturan ke default? Tindakan ini tidak dapat dibatalkan.")) return;
    setResetPending(true);
    setError("");
    try {
      await resetSettings();
      router.refresh();
    } catch (e) {
      setError((e as Error).message || "Gagal reset");
    } finally {
      setResetPending(false);
    }
  }

  function renderField(field: {
    key: keyof Settings;
    label: string;
    type: string;
    placeholder?: string;
    hint?: string;
    options?: string[];
  }) {
    const value = settings[field.key];
    const id = `field-${field.key}`;

    if (field.type === "boolean") {
      return (
        <label key={field.key} htmlFor={id} className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name={field.key}
            id={id}
            defaultChecked={value === "true"}
            className="mt-0.5 h-4 w-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500"
          />
          <input type="hidden" name={`__bool_${field.key}`} value="true" />
          <div>
            <span className="text-sm font-medium text-surface-700 block">{field.label}</span>
            {field.hint && <span className="text-xs text-surface-500">{field.hint}</span>}
          </div>
        </label>
      );
    }

    if (field.type === "textarea") {
      return (
        <div key={field.key}>
          <label htmlFor={id} className="block text-xs font-semibold text-surface-600 uppercase tracking-wider mb-1.5">
            {field.label}
          </label>
          <textarea
            name={field.key}
            id={id}
            defaultValue={value}
            placeholder={field.placeholder}
            rows={2}
            className="input resize-none min-h-[80px]"
          />
          {field.hint && <p className="text-[11px] text-surface-500 mt-1">{field.hint}</p>}
        </div>
      );
    }

    if (field.type === "select") {
      return (
        <div key={field.key}>
          <label htmlFor={id} className="block text-xs font-semibold text-surface-600 uppercase tracking-wider mb-1.5">
            {field.label}
          </label>
          <select
            name={field.key}
            id={id}
            defaultValue={value}
            className="input bg-white min-h-[44px]"
          >
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {field.hint && <p className="text-[11px] text-surface-500 mt-1">{field.hint}</p>}
        </div>
      );
    }

    return (
      <div key={field.key}>
        <label htmlFor={id} className="block text-xs font-semibold text-surface-600 uppercase tracking-wider mb-1.5">
          {field.label}
        </label>
        <input
          type="text"
          name={field.key}
          id={id}
          defaultValue={value}
          placeholder={field.placeholder}
          className="input min-h-[44px]"
        />
        {field.hint && <p className="text-[11px] text-surface-500 mt-1">{field.hint}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Toko */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-100 bg-surface-50/50 flex items-center gap-2">
          <Store className="h-4 w-4 text-brand-600" aria-hidden="true" />
          <h2 className="font-semibold text-surface-900">Informasi Toko</h2>
        </div>
        <div className="p-5 space-y-4">{grouped.store.map(renderField)}</div>
      </div>

      {/* Struk */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-100 bg-surface-50/50 flex items-center gap-2">
          <Receipt className="h-4 w-4 text-brand-600" aria-hidden="true" />
          <h2 className="font-semibold text-surface-900">Struk / Printer Thermal</h2>
        </div>
        <div className="p-5 space-y-4">{grouped.receipt.map(renderField)}</div>
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-2.5 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div role="status" className="flex items-center gap-2.5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
          <Check className="h-4 w-4" aria-hidden="true" />
          <span className="font-medium">Pengaturan berhasil disimpan.</span>
        </div>
      )}

      <div className="flex items-center justify-between card p-4 sticky bottom-4 lg:static">
        <button
          type="button"
          onClick={handleReset}
          disabled={resetPending || pending}
          className="btn-ghost text-sm text-red-600 hover:text-red-700 hover:bg-red-50 min-h-[44px] min-w-[56px] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
          aria-label="Reset semua pengaturan ke default"
        >
          {resetPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <RotateCcw className="h-4 w-4" aria-hidden="true" />}
          Reset ke Default
        </button>

        <button type="submit" disabled={pending} className="btn-primary text-sm min-h-[44px] min-w-[56px] focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1" aria-label={pending ? "Menyimpan pengaturan" : "Simpan pengaturan"}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
          Simpan Pengaturan
        </button>
      </div>
    </form>
  );
}
