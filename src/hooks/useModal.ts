// useModal — deduplicate modal open/close state pattern.

import { useState, useCallback } from "react";

export function useModal<T = true>() {
  const [data, setData] = useState<T | null>(null);

  const open = useCallback((value?: T) => {
    setData(value ?? (true as T));
  }, []);

  const close = useCallback(() => {
    setData(null);
  }, []);

  return {
    isOpen: data !== null,
    data,
    open,
    close,
  };
}
