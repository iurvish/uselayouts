"use client";

import type { ReactNode } from "react";
import React, {
  createContext,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import confetti from "canvas-confetti";
import type {
  GlobalOptions as ConfettiGlobalOptions,
  CreateTypes as ConfettiInstance,
  Options as ConfettiOptions,
} from "canvas-confetti";

type Api = {
  fire: (options?: ConfettiOptions) => void;
};

type Props = React.ComponentPropsWithRef<"canvas"> & {
  options?: ConfettiOptions;
  globalOptions?: ConfettiGlobalOptions;
  manualstart?: boolean;
  children?: ReactNode;
};

export type ConfettiRef = Api | null;

const ConfettiContext = createContext({} as Api);

const DEFAULT_GLOBAL: ConfettiGlobalOptions = { resize: true, useWorker: true };

const Confetti = forwardRef<ConfettiRef, Props>((props, ref) => {
  const {
    options,
    globalOptions = DEFAULT_GLOBAL,
    manualstart = false,
    children,
    ...rest
  } = props;
  const instanceRef = useRef<ConfettiInstance | null>(null);
  // Keep create opts stable across renders — inline default {} remounted the
  // canvas via callback-ref deps and reset() mid-burst (flaky confetti).
  const globalOptionsRef = useRef(globalOptions);
  globalOptionsRef.current = globalOptions;

  const canvasRef = useCallback((node: HTMLCanvasElement | null) => {
    if (node !== null) {
      if (instanceRef.current) return;
      instanceRef.current = confetti.create(node, {
        ...globalOptionsRef.current,
        resize: true,
      });
    } else {
      if (instanceRef.current) {
        instanceRef.current.reset();
        instanceRef.current = null;
      }
    }
  }, []);

  const fire = useCallback(
    (opts: ConfettiOptions = {}) => {
      instanceRef.current?.({ ...options, ...opts });
    },
    [options],
  );

  const api = useMemo(() => ({ fire }), [fire]);

  useImperativeHandle(ref, () => api, [api]);

  useEffect(() => {
    if (!manualstart) fire();
  }, [manualstart, fire]);

  return (
    <ConfettiContext.Provider value={api}>
      <canvas ref={canvasRef} {...rest} />
      {children}
    </ConfettiContext.Provider>
  );
});

Confetti.displayName = "Confetti";

export { Confetti };
