import AsyncStorage from "@react-native-async-storage/async-storage";

const CACHE_KEY = "currency_rates";
const CACHE_TTL = 4 * 60 * 60 * 1000; // 4 hours

// Free API — no key needed, 1500 requests/month
const API_URL =
  "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies";

interface CachedRates {
  base: string;
  rates: Record<string, number>;
  timestamp: number;
}

// Supported currencies
const SUPPORTED_CURRENCIES = [
  "mad",
  "usd",
  "eur",
  "gbp",
  "jpy",
  "inr",
  "cny",
  "aud",
  "cad",
  "chf",
  "nzd",
];

export const fetchExchangeRates = async (
  baseCurrency: string,
): Promise<Record<string, number> | null> => {
  // Check cache first
  const cached = await getCachedRates(baseCurrency);
  if (cached) return cached;

  try {
    const base = baseCurrency.toLowerCase();
    const response = await fetch(`${API_URL}/${base}.json`);

    if (!response.ok) return null;

    const data = await response.json();
    const allRates = data[base] as Record<string, number>;
    if (!allRates) return null;

    // Filter to only our supported currencies
    const rates: Record<string, number> = {};
    for (const curr of SUPPORTED_CURRENCIES) {
      if (allRates[curr] && curr !== base) {
        rates[curr.toUpperCase()] = allRates[curr];
      }
    }

    // Cache the rates
    await cacheRates(baseCurrency, rates);

    return rates;
  } catch {
    // Return cached rates even if expired as fallback
    return getCachedRates(baseCurrency, true);
  }
};

export const convertAmount = (
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: Record<string, number>,
): number | null => {
  if (fromCurrency === toCurrency) return amount;

  const rate = rates[toCurrency.toUpperCase()];
  if (!rate) return null;

  return amount * rate;
};

const getCachedRates = async (
  baseCurrency: string,
  ignoreExpiry = false,
): Promise<Record<string, number> | null> => {
  try {
    const raw = await AsyncStorage.getItem(`${CACHE_KEY}_${baseCurrency}`);
    if (!raw) return null;

    const data: CachedRates = JSON.parse(raw);
    const isExpired = Date.now() - data.timestamp > CACHE_TTL;

    if (!ignoreExpiry && isExpired) return null;

    return data.rates;
  } catch {
    return null;
  }
};

const cacheRates = async (
  baseCurrency: string,
  rates: Record<string, number>,
): Promise<void> => {
  const data: CachedRates = {
    base: baseCurrency,
    rates,
    timestamp: Date.now(),
  };
  await AsyncStorage.setItem(
    `${CACHE_KEY}_${baseCurrency}`,
    JSON.stringify(data),
  );
};
