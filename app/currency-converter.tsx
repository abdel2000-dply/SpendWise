import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "../src/components/atoms/Card";
import { CURRENCY_SYMBOLS } from "../src/constants/categories";
import { useAppSelector } from "../src/hooks/useRedux";
import { useThemeColors } from "../src/hooks/useThemeColors";
import {
    convertAmount,
    fetchExchangeRates,
} from "../src/services/currencyService";
import { spacing, typography } from "../src/theme/theme";

const CURRENCIES = Object.keys(CURRENCY_SYMBOLS);

export default function CurrencyConverterScreen() {
  const colors = useThemeColors();
  const userCurrency = useAppSelector((state) => state.settings.currency);

  const [amount, setAmount] = useState("100");
  const [fromCurrency, setFromCurrency] = useState(userCurrency);
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadRates = useCallback(async () => {
    setLoading(true);
    setError(false);
    const result = await fetchExchangeRates(fromCurrency);
    if (result) {
      setRates(result);
      setLastUpdated(new Date());
    } else {
      setError(true);
    }
    setLoading(false);
  }, [fromCurrency]);

  useEffect(() => {
    loadRates();
  }, [loadRates]);

  const parsedAmount = parseFloat(amount) || 0;
  const fromSymbol = CURRENCY_SYMBOLS[fromCurrency] || fromCurrency;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Amount Input */}
        <Card style={styles.inputCard}>
          <Text style={[styles.label, { color: colors.textLight }]}>
            Amount
          </Text>
          <View style={styles.amountRow}>
            <Text style={[styles.currencySymbol, { color: colors.primary }]}>
              {fromSymbol}
            </Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              style={[styles.amountInput, { color: colors.text }]}
              placeholder="0.00"
              placeholderTextColor={colors.textLight}
            />
          </View>
        </Card>

        {/* From Currency Selector */}
        <Card style={styles.selectorCard}>
          <Text style={[styles.label, { color: colors.textLight }]}>
            Base Currency
          </Text>
          <View style={styles.currencyChips}>
            {CURRENCIES.map((curr) => (
              <TouchableOpacity
                key={curr}
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      fromCurrency === curr
                        ? colors.primary
                        : colors.background,
                    borderColor:
                      fromCurrency === curr ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setFromCurrency(curr)}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: fromCurrency === curr ? "#FFF" : colors.text,
                    },
                  ]}
                >
                  {CURRENCY_SYMBOLS[curr]} {curr}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Results */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textLight }]}>
              Fetching exchange rates...
            </Text>
          </View>
        )}

        {error && !loading && (
          <Card style={styles.errorCard}>
            <Ionicons name="cloud-offline" size={32} color={colors.textLight} />
            <Text style={[styles.errorText, { color: colors.text }]}>
              Could not fetch exchange rates
            </Text>
            <Text style={[styles.errorSubtext, { color: colors.textLight }]}>
              Check your internet connection
            </Text>
            <TouchableOpacity
              style={[styles.retryBtn, { backgroundColor: colors.primary }]}
              onPress={loadRates}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </Card>
        )}

        {rates && !loading && (
          <>
            {lastUpdated && (
              <Text style={[styles.updatedText, { color: colors.textLight }]}>
                Rates updated {lastUpdated.toLocaleTimeString()}
              </Text>
            )}

            {CURRENCIES.filter((c) => c !== fromCurrency).map((toCurr) => {
              const converted = convertAmount(
                parsedAmount,
                fromCurrency,
                toCurr,
                rates,
              );
              const rate = rates[toCurr];
              const toSymbol = CURRENCY_SYMBOLS[toCurr] || toCurr;

              return (
                <Card key={toCurr} style={styles.rateCard}>
                  <View style={styles.rateRow}>
                    <View style={styles.rateInfo}>
                      <Text
                        style={[styles.rateCurrency, { color: colors.text }]}
                      >
                        {toCurr}
                      </Text>
                      <Text
                        style={[styles.rateValue, { color: colors.textLight }]}
                      >
                        1 {fromCurrency} = {rate?.toFixed(4)} {toCurr}
                      </Text>
                    </View>
                    <View style={styles.convertedBox}>
                      <Text
                        style={[
                          styles.convertedAmount,
                          { color: colors.primary },
                        ]}
                      >
                        {toSymbol}{" "}
                        {converted != null
                          ? converted.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : "—"}
                      </Text>
                    </View>
                  </View>
                </Card>
              );
            })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: spacing.md,
    paddingBottom: 40,
  },
  inputCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.xs,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: "700",
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: "700",
  },
  selectorCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  currencyChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  chipText: {
    fontSize: typography.fontSize.sm,
    fontWeight: "600",
  },
  loadingContainer: {
    alignItems: "center",
    paddingTop: 40,
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: typography.fontSize.sm,
  },
  errorCard: {
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.sm,
  },
  errorText: {
    fontSize: typography.fontSize.md,
    fontWeight: "600",
  },
  errorSubtext: {
    fontSize: typography.fontSize.sm,
  },
  retryBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: spacing.sm,
  },
  retryText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: typography.fontSize.sm,
  },
  updatedText: {
    fontSize: typography.fontSize.xs,
    textAlign: "right",
    marginBottom: spacing.sm,
  },
  rateCard: {
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  rateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rateInfo: {
    gap: 2,
  },
  rateCurrency: {
    fontSize: typography.fontSize.md,
    fontWeight: "700",
  },
  rateValue: {
    fontSize: typography.fontSize.xs,
  },
  convertedBox: {
    alignItems: "flex-end",
  },
  convertedAmount: {
    fontSize: typography.fontSize.lg,
    fontWeight: "700",
  },
});
