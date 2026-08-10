import { differenceInDays, format } from "date-fns";
import * as Notifications from "expo-notifications";
import { RecurringTransaction } from "../types";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const requestNotificationPermissions = async (): Promise<boolean> => {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
};

export const scheduleBillReminder = async (
  bill: RecurringTransaction,
  currency: string,
): Promise<string | null> => {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return null;

  const dueDate = new Date(bill.nextDueDate);
  const now = new Date();
  const daysUntil = differenceInDays(dueDate, now);

  // Only schedule if bill is within the next 7 days
  if (daysUntil < 0 || daysUntil > 7) return null;

  // Schedule for the day before at 9 AM, or immediately if due today/tomorrow
  let triggerDate: Date;
  if (daysUntil <= 1) {
    // Due today or tomorrow — notify in 1 minute
    triggerDate = new Date(now.getTime() + 60 * 1000);
  } else {
    // Day before at 9 AM
    triggerDate = new Date(dueDate);
    triggerDate.setDate(triggerDate.getDate() - 1);
    triggerDate.setHours(9, 0, 0, 0);
    if (triggerDate <= now) {
      triggerDate = new Date(now.getTime() + 60 * 1000);
    }
  }

  const billName = bill.note || bill.category?.name || "Bill";

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "💰 Bill Reminder",
      body:
        daysUntil === 0
          ? `${billName} (${bill.amount} ${currency}) is due today!`
          : `${billName} (${bill.amount} ${currency}) is due ${format(dueDate, "MMM d")}`,
      data: { billId: bill.id, type: "bill-reminder" },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  });

  return id;
};

export const scheduleAllBillReminders = async (
  recurringTransactions: RecurringTransaction[],
  currency: string,
): Promise<void> => {
  // Cancel all existing bill reminders first
  await cancelAllBillReminders();

  const activeBills = recurringTransactions.filter(
    (tx) => tx.isActive && tx.type === "expense",
  );

  for (const bill of activeBills) {
    await scheduleBillReminder(bill, currency);
  }
};

export const cancelAllBillReminders = async (): Promise<void> => {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of scheduled) {
    if (notif.content.data?.type === "bill-reminder") {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }
};
