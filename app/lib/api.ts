import api from "./axios";

export async function fetchSignal(symbol: string, expiry: string) {
  const res = await api.get("/signal", {
    params: { symbol, expiry },
  });
  return res.data;
}