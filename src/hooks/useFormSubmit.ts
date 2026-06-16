// useFormSubmit — deduplicate loading/error pattern across forms.

import { useState, useCallback } from "react";

interface UseFormSubmitOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useFormSubmit<T>(
  submitFn: () => Promise<T>,
  options?: UseFormSubmitOptions
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      await submitFn();
      options?.onSuccess?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setError(msg);
      options?.onError?.(msg);
    } finally {
      setLoading(false);
    }
  }, [submitFn, options]);

  const clearError = useCallback(() => setError(""), []);

  return { loading, error, handleSubmit, clearError, setError };
}
