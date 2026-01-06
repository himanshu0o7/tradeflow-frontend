export type Signal = {
  action: "BUY_CE" | "BUY_PE" | "HOLD";
  strike: number;
  confidence: number;
  reason: string;
};