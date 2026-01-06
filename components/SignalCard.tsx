type Signal = {
  action: "BUY_CE" | "BUY_PE" | "NO_TRADE";
  strike?: number;
  confidence: number;
  reason: string;
};

type Props = {
  signal: Signal;
};

export default function SignalCard({ signal }: Props) {
  if (!signal) {
    return null;
  }

  const color =
    signal.action === "BUY_CE"
      ? "bg-green-600"
      : signal.action === "BUY_PE"
      ? "bg-red-600"
      : "bg-gray-600";

  return (
    <div
      className={`p-4 rounded-lg text-white ${color} shadow-md`}
    >
      <h2 className="text-xl font-bold tracking-wide">
        {signal.action === "NO_TRADE" ? "NO TRADE" : signal.action}
      </h2>

      {signal.strike !== undefined && (
        <p className="mt-1">
          <span className="opacity-80">Strike:</span>{" "}
          <b>{signal.strike}</b>
        </p>
      )}

      <p className="mt-1">
        <span className="opacity-80">Confidence:</span>{" "}
        <b>{Math.round(signal.confidence * 100)}%</b>
      </p>

      <p className="mt-2 text-sm opacity-90">
        {signal.reason}
      </p>
    </div>
  );
}