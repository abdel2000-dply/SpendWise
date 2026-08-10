import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CURRENCY_SYMBOLS } from "../src/constants/categories";
import { useAppDispatch } from "../src/hooks/useRedux";
import { useThemeColors } from "../src/hooks/useThemeColors";
import {
    completeOnboarding,
    setCurrency,
    setUserName,
} from "../src/store/slices/settingsSlice";
import { spacing, typography } from "../src/theme/theme";

const { width } = Dimensions.get("window");

interface OnboardingPage {
  key: string;
  icon: string;
  title: string;
  subtitle: string;
}

const PAGES: OnboardingPage[] = [
  {
    key: "welcome",
    icon: "wallet",
    title: "Welcome to SpendWise",
    subtitle:
      "Your personal AI-powered finance coach. Track spending, save smarter, and reach your goals.",
  },
  {
    key: "name",
    icon: "person",
    title: "What should we call you?",
    subtitle: "Personalize your experience",
  },
  {
    key: "currency",
    icon: "cash",
    title: "Choose your currency",
    subtitle: "You can change this anytime in settings",
  },
  {
    key: "ready",
    icon: "rocket",
    title: "You're all set!",
    subtitle: "Start tracking your finances and let AI help you save smarter.",
  },
];

const CURRENCIES = Object.entries(CURRENCY_SYMBOLS);

export default function OnboardingScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const flatListRef = useRef<FlatList>(null);
  const nameInputRef = useRef<TextInput>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const [currentPage, setCurrentPage] = useState(0);
  const [name, setName] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("MAD");

  const goNext = () => {
    if (currentPage < PAGES.length - 1) {
      const nextPage = currentPage + 1;
      flatListRef.current?.scrollToIndex({ index: nextPage, animated: true });
      setCurrentPage(nextPage);
      // Delay focus until after slide animation completes (~350ms)
      if (PAGES[nextPage].key === "name") {
        setTimeout(() => nameInputRef.current?.focus(), 400);
      }
    } else {
      // Complete onboarding
      if (name.trim()) dispatch(setUserName(name.trim()));
      dispatch(setCurrency(selectedCurrency));
      dispatch(completeOnboarding());
      router.replace("/(tabs)");
    }
  };

  const goBack = () => {
    if (currentPage > 0) {
      flatListRef.current?.scrollToIndex({
        index: currentPage - 1,
        animated: true,
      });
      setCurrentPage(currentPage - 1);
    }
  };

  const renderPage = ({ item }: { item: OnboardingPage }) => (
    <View style={[styles.page, { width }]}>
      <View
        style={[styles.iconCircle, { backgroundColor: colors.primary + "15" }]}
      >
        <Ionicons name={item.icon as any} size={64} color={colors.primary} />
      </View>
      <Text style={[styles.pageTitle, { color: colors.text }]}>
        {item.title}
      </Text>
      <Text style={[styles.pageSubtitle, { color: colors.textLight }]}>
        {item.subtitle}
      </Text>

      {item.key === "name" && (
        <View style={styles.inputSection}>
          <TextInput
            ref={nameInputRef}
            style={[
              styles.nameInput,
              {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.card,
              },
            ]}
            placeholder="Your name"
            placeholderTextColor={colors.textLight}
            value={name}
            onChangeText={setName}
            autoFocus={false}
          />
        </View>
      )}

      {item.key === "currency" && (
        <View style={styles.currencyGrid}>
          {CURRENCIES.map(([code, symbol]) => (
            <TouchableOpacity
              key={code}
              style={[
                styles.currencyItem,
                {
                  backgroundColor:
                    selectedCurrency === code ? colors.primary : colors.card,
                  borderColor:
                    selectedCurrency === code ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setSelectedCurrency(code)}
            >
              <Text
                style={[
                  styles.currencySymbol,
                  { color: selectedCurrency === code ? "#FFF" : colors.text },
                ]}
              >
                {symbol}
              </Text>
              <Text
                style={[
                  styles.currencyCode,
                  {
                    color:
                      selectedCurrency === code ? "#FFF" : colors.textLight,
                  },
                ]}
              >
                {code}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <FlatList
        ref={flatListRef}
        data={PAGES}
        renderItem={renderPage}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          {
            useNativeDriver: false,
          },
        )}
      />

      {/* Dots */}
      <View style={styles.dotsContainer}>
        {PAGES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor:
                  i === currentPage ? colors.primary : colors.border,
                width: i === currentPage ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>

      {/* Navigation */}
      <View style={styles.navRow}>
        {currentPage > 0 ? (
          <TouchableOpacity onPress={goBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.textLight} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backBtn} />
        )}

        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: colors.primary }]}
          onPress={goNext}
        >
          <Text style={styles.nextText}>
            {currentPage === PAGES.length - 1 ? "Get Started" : "Next"}
          </Text>
          <Ionicons
            name={
              currentPage === PAGES.length - 1 ? "checkmark" : "arrow-forward"
            }
            size={20}
            color="#FFF"
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  page: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  pageTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  pageSubtitle: {
    fontSize: typography.fontSize.md,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },
  inputSection: {
    width: "100%",
    marginTop: spacing.xl,
  },
  nameInput: {
    fontSize: typography.fontSize.xl,
    textAlign: "center",
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
  },
  currencyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  currencyItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    minWidth: 72,
  },
  currencySymbol: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  currencyCode: {
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 16,
    gap: spacing.sm,
  },
  nextText: {
    color: "#FFF",
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
});
