import { differenceInDays, format } from "date-fns";
import { SavingsGoal } from "../types";
import { calculateSavingsProgress } from "./calculations";

export interface CoachingTip {
  id: string;
  icon: string;
  color: string;
  text: string;
  type: "savings" | "budget" | "general";
}

export const generateGoalCoachingTips = (
  goals: SavingsGoal[],
  monthlyBalance: number,
  currency: string,
): CoachingTip[] => {
  const tips: CoachingTip[] = [];

  const activeGoals = goals.filter((g) => g.currentAmount < g.targetAmount);

  for (const goal of activeGoals) {
    const progress = calculateSavingsProgress(goal);

    if (goal.deadline) {
      const daysLeft = differenceInDays(new Date(goal.deadline), new Date());

      if (daysLeft <= 0) {
        tips.push({
          id: `${goal.id}-overdue`,
          icon: "alert-circle",
          color: "#E74C3C",
          text: `"${goal.name}" deadline has passed. You still need ${Math.round(progress.remaining)} more. Consider extending your goal.`,
          type: "savings",
        });
      } else if (daysLeft <= 7 && progress.remaining > 0) {
        tips.push({
          id: `${goal.id}-urgent`,
          icon: "time",
          color: "#F39C12",
          text: `Only ${daysLeft} day${daysLeft !== 1 ? "s" : ""} left for "${goal.name}". You need ${Math.round(progress.remaining)} more — save ${Math.round(progress.remaining / Math.max(1, daysLeft))}/day to make it!`,
          type: "savings",
        });
      } else if (daysLeft > 0 && !progress.onTrack) {
        const dailyNeeded = progress.remaining / daysLeft;
        tips.push({
          id: `${goal.id}-behind`,
          icon: "trending-up",
          color: "#3498DB",
          text: `You're behind on "${goal.name}". Save ${Math.round(dailyNeeded)}/day to reach your goal by ${format(new Date(goal.deadline), "MMM d")}.`,
          type: "savings",
        });
      } else if (progress.percentage >= 75 && progress.percentage < 100) {
        tips.push({
          id: `${goal.id}-almost`,
          icon: "star",
          color: "#2ECC71",
          text: `Almost there! "${goal.name}" is ${Math.round(progress.percentage)}% funded. Just ${Math.round(progress.remaining)} more to go!`,
          type: "savings",
        });
      }
    } else {
      // No deadline — suggest daily target based on monthly balance
      if (monthlyBalance > 0 && progress.remaining > 0) {
        const monthsNeeded = progress.remaining / monthlyBalance;
        if (monthsNeeded <= 1) {
          tips.push({
            id: `${goal.id}-reachable`,
            icon: "rocket",
            color: "#9B59B6",
            text: `At your current savings rate, you could reach "${goal.name}" this month!`,
            type: "savings",
          });
        } else if (monthsNeeded <= 3) {
          tips.push({
            id: `${goal.id}-pace`,
            icon: "speedometer",
            color: "#3498DB",
            text: `"${goal.name}" is about ${Math.ceil(monthsNeeded)} months away at your current pace. Keep it up!`,
            type: "savings",
          });
        }
      }
    }
  }

  // General tips
  if (activeGoals.length === 0 && goals.length === 0) {
    tips.push({
      id: "no-goals",
      icon: "flag",
      color: "#F39C12",
      text: "Set a savings goal to start building toward something! Even small goals help.",
      type: "general",
    });
  }

  if (monthlyBalance < 0) {
    tips.push({
      id: "overspend",
      icon: "warning",
      color: "#E74C3C",
      text: "You're spending more than you earn this month. Try cutting one non-essential expense.",
      type: "budget",
    });
  } else if (monthlyBalance > 0 && activeGoals.length > 0) {
    const topGoal = activeGoals[0];
    const skipSuggestion = Math.min(monthlyBalance * 0.1, 50);
    if (skipSuggestion >= 1) {
      tips.push({
        id: "micro-action",
        icon: "bulb",
        color: "#F39C12",
        text: `Skip one small purchase today and put ${Math.round(skipSuggestion)} toward "${topGoal.name}".`,
        type: "general",
      });
    }
  }

  return tips.slice(0, 3); // Max 3 tips
};
