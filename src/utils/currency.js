// FCFA (XOF) is pegged to EUR at a fixed rate since 1999 — no API needed
export const EUR_RATE = 655.957;

const USD_CACHE_KEY = 'jf_usd_rate_v1';
const USD_CACHE_TTL = 6 * 60 * 60 * 1000; // 6h

export async function fetchUsdRate() {
  try {
    const cached = localStorage.getItem(USD_CACHE_KEY);
    if (cached) {
      const { rate, ts } = JSON.parse(cached);
      if (Date.now() - ts < USD_CACHE_TTL) return rate;
    }
    const res = await fetch('https://open.er-api.com/v6/latest/XOF');
    const data = await res.json();
    const rate = data?.rates?.USD;
    if (rate) {
      localStorage.setItem(USD_CACHE_KEY, JSON.stringify({ rate, ts: Date.now() }));
      return rate;
    }
  } catch {}
  return null;
}

export function fcfaToEur(fcfa) {
  return Math.round(fcfa / EUR_RATE);
}

export function fcfaToUsd(fcfa, usdRate) {
  if (!usdRate) return null;
  return Math.round(fcfa * usdRate);
}

// Returns a short "≈ 76 €" or "≈ €76 / $83" string, or "" for tiny amounts
export function formatConversion(fcfa, lang, usdRate) {
  if (!fcfa || fcfa < 500) return '';
  const eur = fcfaToEur(fcfa);
  const usd = fcfaToUsd(fcfa, usdRate);
  if (lang === 'en') {
    return usd
      ? `≈ €${eur.toLocaleString('en-US')} / $${usd.toLocaleString('en-US')}`
      : `≈ €${eur.toLocaleString('en-US')}`;
  }
  return `≈ ${eur.toLocaleString('fr-FR')} €`;
}
