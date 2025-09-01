import { useEffect, useMemo, useState } from "react";

export function usePersistState<T>(
  name: string,
  defaultValue: T = null as T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const persist = useMemo(() => window.sessionStorage.getItem(name), []);

  const [state, setState] = useState<T>(
    (persist ? JSON.parse(persist) : defaultValue) as T
  );

  useEffect(() => {
    if (state) window.sessionStorage.setItem(name, JSON.stringify(state));
    else window.sessionStorage.removeItem(name);
  }, [state]);

  return [state, setState];
}

export function usePersistString(
  name: string,
  defaultValue: string | null = null
): [string, React.Dispatch<React.SetStateAction<string>>] {
  const persist = useMemo(() => window.sessionStorage.getItem(name), []);

  const [state, setState] = useState<string>(
    (persist ? persist : defaultValue) as string
  );

  useEffect(() => {
    if (state) window.sessionStorage.setItem(name, state);
    else window.sessionStorage.removeItem(name);
  }, [state]);

  return [state, setState];
}
