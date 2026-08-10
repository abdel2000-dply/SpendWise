import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useRef, useState } from "react";
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppDispatch, useAppSelector } from "../src/hooks/useRedux";
import { useThemeColors } from "../src/hooks/useThemeColors";
import {
    getApiKey,
    getFinancialContext,
    sendMessage,
    SUGGESTED_QUESTIONS,
} from "../src/services/groqService";
import { loadGroqApiKey } from "../src/services/secureStorage";
import {
    addMessage,
    clearChat,
    setLoading,
} from "../src/store/slices/aiCoachSlice";
import { spacing, typography } from "../src/theme/theme";
import { ChatMessage } from "../src/types";
import { generateId } from "../src/utils/generateId";

export default function AiCoachScreen() {
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const flatListRef = useRef<FlatList>(null);

  const messages = useAppSelector((state) => state.aiCoach.messages);
  const isLoading = useAppSelector((state) => state.aiCoach.isLoading);
  const expenses = useAppSelector((state) => state.expenses.expenses);
  const incomes = useAppSelector((state) => state.incomes.incomes);
  const budgets = useAppSelector((state) => state.budgets.budgets);
  const categories = useAppSelector((state) => state.categories.categories);
  const savingsGoals = useAppSelector((state) => state.savings.goals);
  const currency = useAppSelector((state) => state.settings.currency);

  const [input, setInput] = useState("");
  const [resolvedKey, setResolvedKey] = useState<string | null>(null);

  React.useEffect(() => {
    loadGroqApiKey().then((stored) => {
      setResolvedKey(getApiKey(stored ?? undefined));
    });
  }, []);

  const handleSend = useCallback(
    async (text?: string) => {
      const messageText = (text || input).trim();
      if (!messageText) return;

      if (!resolvedKey) {
        Alert.alert(
          "API Key Required",
          "Please add your Groq API key in Settings → AI Coach, or set EXPO_PUBLIC_GROQ_API_KEY in your .env file.",
        );
        return;
      }

      // Add user message
      const userMsg: ChatMessage = {
        id: generateId(),
        role: "user",
        content: messageText,
        timestamp: new Date().toISOString(),
      };
      dispatch(addMessage(userMsg));
      setInput("");
      dispatch(setLoading(true));

      try {
        const context = getFinancialContext(
          expenses,
          incomes,
          budgets,
          categories,
          savingsGoals,
          currency,
        );

        const history = messages.map((m) => ({
          role: m.role as "user" | "assistant" | "system",
          content: m.content,
        }));

        const response = await sendMessage(
          resolvedKey,
          messageText,
          history,
          context,
        );

        const assistantMsg: ChatMessage = {
          id: generateId(),
          role: "assistant",
          content: response,
          timestamp: new Date().toISOString(),
        };
        dispatch(addMessage(assistantMsg));
      } catch (error: any) {
        const errorMsg: ChatMessage = {
          id: generateId(),
          role: "assistant",
          content: `Sorry, I encountered an error: ${error.message}`,
          timestamp: new Date().toISOString(),
        };
        dispatch(addMessage(errorMsg));
      } finally {
        dispatch(setLoading(false));
      }
    },
    [
      input,
      resolvedKey,
      expenses,
      incomes,
      budgets,
      categories,
      savingsGoals,
      currency,
      messages,
      dispatch,
    ],
  );

  const handleClear = () => {
    Alert.alert("Clear Chat", "Delete all chat history?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => dispatch(clearChat()),
      },
    ]);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === "user";
    return (
      <View
        style={[
          styles.messageBubble,
          isUser
            ? [styles.userBubble, { backgroundColor: colors.primary }]
            : [styles.assistantBubble, { backgroundColor: colors.card }],
        ]}
      >
        {!isUser && (
          <View style={styles.avatarRow}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: colors.primary + "20" },
              ]}
            >
              <Ionicons name="sparkles" size={14} color={colors.primary} />
            </View>
            <Text style={[styles.avatarLabel, { color: colors.textLight }]}>
              AI Coach
            </Text>
          </View>
        )}
        <Text
          style={[
            styles.messageText,
            { color: isUser ? "#FFFFFF" : colors.text },
          ]}
        >
          {item.content}
        </Text>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View
        style={[styles.emptyIcon, { backgroundColor: colors.primary + "15" }]}
      >
        <Ionicons name="sparkles" size={48} color={colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        SpendWise AI Coach
      </Text>
      <Text style={[styles.emptySubtext, { color: colors.textLight }]}>
        Ask me anything about your finances. I can analyze your spending,
        suggest budgets, and help you save more.
      </Text>

      <View style={styles.suggestionsContainer}>
        <Text style={[styles.suggestionsLabel, { color: colors.textLight }]}>
          Try asking:
        </Text>
        {SUGGESTED_QUESTIONS.map((q) => (
          <TouchableOpacity
            key={q}
            style={[
              styles.suggestionChip,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() => handleSend(q)}
          >
            <Text style={[styles.suggestionText, { color: colors.primary }]}>
              {q}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={90}
      >
        {/* Header actions */}
        {messages.length > 0 && (
          <View
            style={[styles.headerActions, { borderBottomColor: colors.border }]}
          >
            <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
              <Ionicons name="trash-outline" size={18} color={colors.error} />
              <Text style={[styles.clearText, { color: colors.error }]}>
                Clear Chat
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={[
            styles.messagesList,
            messages.length === 0 && styles.emptyList,
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
          onContentSizeChange={() =>
            messages.length > 0 &&
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />

        {/* Loading indicator */}
        {isLoading && (
          <View
            style={[styles.loadingContainer, { backgroundColor: colors.card }]}
          >
            <Ionicons name="sparkles" size={16} color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textLight }]}>
              Thinking...
            </Text>
          </View>
        )}

        {/* Input */}
        <View
          style={[
            styles.inputContainer,
            { backgroundColor: colors.card, borderTopColor: colors.border },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              { color: colors.text, backgroundColor: colors.background },
            ]}
            placeholder="Ask about your finances..."
            placeholderTextColor={colors.textLight}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor:
                  input.trim() && !isLoading ? colors.primary : colors.border,
              },
            ]}
            onPress={() => handleSend()}
            disabled={!input.trim() || isLoading}
          >
            <Ionicons
              name="send"
              size={18}
              color={input.trim() && !isLoading ? "#FFFFFF" : colors.textLight}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  headerActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  clearText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  messagesList: {
    padding: spacing.md,
    gap: spacing.md,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
  },
  messageBubble: {
    maxWidth: "85%",
    borderRadius: 16,
    padding: spacing.md,
  },
  userBubble: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  messageText: {
    fontSize: typography.fontSize.md,
    lineHeight: 22,
  },
  emptyContainer: {
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  emptySubtext: {
    fontSize: typography.fontSize.md,
    textAlign: "center",
    lineHeight: 22,
  },
  suggestionsContainer: {
    width: "100%",
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  suggestionsLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: 4,
  },
  suggestionChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  loadingText: {
    fontSize: typography.fontSize.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: spacing.sm,
    gap: spacing.sm,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: typography.fontSize.md,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
