import SignalLive from "./components/SignalLive";

export default function HomePage() {
  return (
    <main className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">
        TradeFlow – Live Signals
      </h1>
      <SignalLive />
    </main>
  );
}