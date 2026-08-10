import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SavingsContribution, SavingsGoal } from "../../types";

interface SavingsState {
  goals: SavingsGoal[];
}

const initialState: SavingsState = {
  goals: [],
};

const savingsSlice = createSlice({
  name: "savings",
  initialState,
  reducers: {
    addGoal: (state, action: PayloadAction<SavingsGoal>) => {
      state.goals.push(action.payload);
    },
    updateGoal: (state, action: PayloadAction<SavingsGoal>) => {
      const index = state.goals.findIndex((g) => g.id === action.payload.id);
      if (index !== -1) {
        state.goals[index] = action.payload;
      }
    },
    deleteGoal: (state, action: PayloadAction<string>) => {
      state.goals = state.goals.filter((g) => g.id !== action.payload);
    },
    addContribution: (
      state,
      action: PayloadAction<{
        goalId: string;
        contribution: SavingsContribution;
      }>,
    ) => {
      const goal = state.goals.find((g) => g.id === action.payload.goalId);
      if (goal) {
        goal.contributions.push(action.payload.contribution);
        goal.currentAmount += action.payload.contribution.amount;
      }
    },
    removeContribution: (
      state,
      action: PayloadAction<{ goalId: string; contributionId: string }>,
    ) => {
      const goal = state.goals.find((g) => g.id === action.payload.goalId);
      if (goal) {
        const contribution = goal.contributions.find(
          (c) => c.id === action.payload.contributionId,
        );
        if (contribution) {
          goal.currentAmount -= contribution.amount;
          goal.contributions = goal.contributions.filter(
            (c) => c.id !== action.payload.contributionId,
          );
        }
      }
    },
    setGoals: (state, action: PayloadAction<SavingsGoal[]>) => {
      state.goals = action.payload;
    },
  },
});

export const {
  addGoal,
  updateGoal,
  deleteGoal,
  addContribution,
  removeContribution,
  setGoals,
} = savingsSlice.actions;

export default savingsSlice.reducer;
