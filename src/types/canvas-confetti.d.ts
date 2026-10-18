declare module 'canvas-confetti' {
  interface ConfettiOptions {
    particleCount?: number;
    angle?: number;
    spread?: number;
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    drift?: number;
    ticks?: number;
    origin?: { x?: number; y?: number };
    colors?: string[];
    shapes?: string[];
    scalar?: number;
    zIndex?: number;
    disableForReducedMotion?: boolean;
    resize?: boolean;
    useWorker?: boolean;
  }

  interface CreateTypes {
    (options?: ConfettiOptions): Promise<void> | null;
    (canvas: HTMLCanvasElement, options?: ConfettiOptions): Promise<void> | null;
  }

  const confetti: CreateTypes & {
    create: (canvas: HTMLCanvasElement, options?: ConfettiOptions) => CreateTypes;
  };

  export = confetti;
}
