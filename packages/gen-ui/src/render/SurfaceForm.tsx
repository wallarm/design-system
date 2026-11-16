import {
  createContext,
  type FC,
  type ReactNode,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

interface SurfaceFormValue {
  /** A submit was tried: every field shows its error from now on. */
  submitted: boolean;
  /** Keeps a field's current error (undefined clears it). */
  report: (key: string, error: string | undefined) => void;
  /** Shows every error and says whether there are none. */
  check: () => boolean;
}

const SurfaceFormContext = createContext<SurfaceFormValue | null>(null);

/**
 * The fields of one rendered surface, whatever the format: validation is gen-ui's, so it works
 * the same in A2UI, json-render and OpenUI (OpenUI has no checks; A2UI's need a function catalog).
 */
export const SurfaceForm: FC<{ children: ReactNode }> = ({ children }) => {
  const errors = useRef(new Map<string, string>());
  const [submitted, setSubmitted] = useState(false);
  const value: SurfaceFormValue = {
    submitted,
    report: (key, error) => {
      if (error === undefined) errors.current.delete(key);
      else errors.current.set(key, error);
    },
    check: () => {
      setSubmitted(true);
      return errors.current.size === 0;
    },
  };
  return <SurfaceFormContext value={value}>{children}</SurfaceFormContext>;
};

/**
 * Registers a field's error with its surface. Returns the error to show (once `touched` or after
 * a submit) and the surface's check; outside a surface every check passes.
 */
export const useSurfaceForm = (error: string | undefined, touched: boolean) => {
  const form = useContext(SurfaceFormContext);
  const key = useId();
  useEffect(() => {
    form?.report(key, error);
    return () => form?.report(key, undefined);
  }, [form, key, error]);
  return {
    shown: touched || form?.submitted ? error : undefined,
    check: () => form?.check() ?? true,
  };
};
