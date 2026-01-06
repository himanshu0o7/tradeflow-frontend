import api from "./axios";

export async function fetchSignal(symbol: string, expiry: string) {
  const res = await api.get("/signal", {
    params: { symbol, expiry },
  });

  if (!res.data?.signal) {
    throw new Error("Invalid API response");
  }

  return res.data;
}