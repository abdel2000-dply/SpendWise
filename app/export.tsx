import { Ionicons } from "@expo/vector-icons";
import { File, Paths } from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import React, { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { format } from "date-fns";
import { Card } from "../src/components/atoms/Card";
import { useAppSelector } from "../src/hooks/useRedux";
import { useThemeColors } from "../src/hooks/useThemeColors";
import { spacing, typography } from "../src/theme/theme";

type ExportType = "expenses" | "income" | "all";

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export default function ExportScreen() {
  const colors = useThemeColors();
  const expenses = useAppSelector((state) => state.expenses.expenses);
  const incomes = useAppSelector((state) => state.incomes.incomes);
  const currency = useAppSelector((state) => state.settings.currency);

  const [exporting, setExporting] = useState(false);

  const generateCSV = (type: ExportType): string => {
    const headers = [
      "Date",
      "Type",
      "Category/Source",
      "Amount",
      "Currency",
      "Note",
      "Tags",
    ];
    const rows: string[][] = [];

    if (type !== "income") {
      expenses.forEach((e) => {
        rows.push([
          format(new Date(e.date), "yyyy-MM-dd HH:mm"),
          "Expense",
          escapeCSV(e.category.name),
          e.amount.toFixed(2),
          e.currency,
          escapeCSV(e.note || ""),
          escapeCSV((e.tags || []).join("; ")),
        ]);
      });
    }

    if (type !== "expenses") {
      incomes.forEach((i) => {
        rows.push([
          format(new Date(i.date), "yyyy-MM-dd HH:mm"),
          "Income",
          escapeCSV(i.source.name),
          i.amount.toFixed(2),
          i.currency,
          escapeCSV(i.note || ""),
          escapeCSV((i.tags || []).join("; ")),
        ]);
      });
    }

    // Sort by date descending
    rows.sort((a, b) => b[0].localeCompare(a[0]));

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    return csvContent;
  };

  const handleExport = async (type: ExportType) => {
    const count =
      type === "expenses"
        ? expenses.length
        : type === "income"
          ? incomes.length
          : expenses.length + incomes.length;

    if (count === 0) {
      Alert.alert("No Data", "There's no data to export.");
      return;
    }

    Alert.alert("Export Options", "How would you like to export your data?", [
      {
        text: "Share",
        onPress: () => doExport(type, "share"),
      },
      {
        text: "Save to Downloads",
        onPress: () => doExport(type, "save"),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const doExport = async (type: ExportType, mode: "share" | "save") => {
    setExporting(true);
    try {
      const csv = generateCSV(type);
      const fileName = `spendwise_${type}_${format(new Date(), "yyyy-MM-dd")}.csv`;
      const file = new File(Paths.cache, fileName);
      file.write(csv);

      if (mode === "save") {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Denied",
            "Storage permission is required to save the file.",
          );
          return;
        }
        await MediaLibrary.createAssetAsync(file.uri);
        Alert.alert("Saved", `${fileName} saved to your Downloads folder.`);
      } else {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(file.uri, {
            mimeType: "text/csv",
            dialogTitle: "Export SpendWise Data",
            UTI: "public.comma-separated-values-text",
          });
        } else {
          Alert.alert(
            "Sharing not available",
            "Sharing is not supported on this device.",
          );
        }
      }
    } catch (error: any) {
      Alert.alert("Export Failed", error.message || "Something went wrong.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary */}
        <Card style={styles.card}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: colors.error }]}>
                {expenses.length}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.textLight }]}>
                Expenses
              </Text>
            </View>
            <View
              style={[styles.divider, { backgroundColor: colors.border }]}
            />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: colors.success }]}>
                {incomes.length}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.textLight }]}>
                Incomes
              </Text>
            </View>
            <View
              style={[styles.divider, { backgroundColor: colors.border }]}
            />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: colors.primary }]}>
                {expenses.length + incomes.length}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.textLight }]}>
                Total
              </Text>
            </View>
          </View>
        </Card>

        {/* Export Options */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Export as CSV
        </Text>

        <ExportOption
          icon="remove-circle"
          iconColor={colors.error}
          title="Expenses Only"
          description={`${expenses.length} transactions`}
          colors={colors}
          onPress={() => handleExport("expenses")}
          disabled={exporting}
        />

        <ExportOption
          icon="add-circle"
          iconColor={colors.success}
          title="Income Only"
          description={`${incomes.length} transactions`}
          colors={colors}
          onPress={() => handleExport("income")}
          disabled={exporting}
        />

        <ExportOption
          icon="swap-horizontal"
          iconColor={colors.primary}
          title="All Transactions"
          description={`${expenses.length + incomes.length} transactions`}
          colors={colors}
          onPress={() => handleExport("all")}
          disabled={exporting}
        />

        {/* Info */}
        <View style={styles.infoBox}>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={colors.textLight}
          />
          <Text style={[styles.infoText, { color: colors.textLight }]}>
            CSV files can be opened in Excel, Google Sheets, or any spreadsheet
            app. Your data stays on your device until you choose to share it.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ExportOption({
  icon,
  iconColor,
  title,
  description,
  colors,
  onPress,
  disabled,
}: {
  icon: string;
  iconColor: string;
  title: string;
  description: string;
  colors: any;
  onPress: () => void;
  disabled: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <Card style={styles.optionCard}>
        <View style={styles.optionRow}>
          <View
            style={[styles.optionIcon, { backgroundColor: iconColor + "15" }]}
          >
            <Ionicons name={icon as any} size={24} color={iconColor} />
          </View>
          <View style={styles.optionInfo}>
            <Text style={[styles.optionTitle, { color: colors.text }]}>
              {title}
            </Text>
            <Text style={[styles.optionDesc, { color: colors.textLight }]}>
              {description}
            </Text>
          </View>
          <Ionicons name="download-outline" size={22} color={colors.primary} />
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  card: {
    marginBottom: spacing.lg,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    padding: spacing.lg,
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
  },
  summaryLabel: {
    fontSize: typography.fontSize.xs,
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 40,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
  },
  optionCard: {
    marginBottom: spacing.sm,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.md,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  optionDesc: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  infoBox: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
});
