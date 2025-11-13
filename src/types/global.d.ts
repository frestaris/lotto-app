type GtagCommand = "config" | "event" | "set" | "js";

type Gtag = (
  command: GtagCommand,
  targetIdOrParams: string | Record<string, unknown>,
  params?: Record<string, unknown>
) => void;

declare global {
  interface Window {
    gtag: Gtag;
    dataLayer: unknown[];
  }
}

export {};
