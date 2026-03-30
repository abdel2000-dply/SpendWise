import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SavingsGoal } from "../../types";

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
      action: PayloadAction<{ goalId: string; amount: number }>
    ) => {
      const goal = state.goals.find((g) => g.id === action.payload.goalId);
      if (goal) {
        goal.currentAmount = Math.min(
          goal.currentAmount + action.payload.amount,
          goal.targetAmount
        );
        goal.updatedAt = new Date();
      }
    },
  },
});

export const { addGoal, updateGoal, deleteGoal, addContribution } =
  savingsSlice.actions;

export default savingsSlice.reducer;
