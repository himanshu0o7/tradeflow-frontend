export default function SignalCard({ signal }: any) {
  const color =
    signal.action === "BUY_CE"
      ? "bg-green-600"
      : signal.action === "BUY_PE"
      ? "bg-red-600"
      : "bg-gray-600";

  return (
    <div className={`p-4 rounded text-white ${color}`}>
      <h2 className="text-xl font-bold">{signal.action}</h2>
      <p>Strike: {signal.strike}</p>
      <p>Confidence: {(signal.confidence * 100).toFixed(0)}%</p>
      <p className="text-sm opacity-80">{signal.reason}</p>
    </div>
  );
}