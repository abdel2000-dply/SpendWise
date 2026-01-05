import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Budget } from "../../types";

interface BudgetState {
  budgets: Budget[];
}

const initialState: BudgetState = {
  budgets: [],
};

const budgetSlice = createSlice({
  name: "budgets",
  initialState,
  reducers: {
    addBudget: (state, action: PayloadAction<Budget>) => {
      state.budgets.push(action.payload);
    },
    updateBudget: (state, action: PayloadAction<Budget>) => {
      const index = state.budgets.findIndex((b) => b.id === action.payload.id);
      if (index !== -1) {
        state.budgets[index] = action.payload;
      }
    },
    deleteBudget: (state, action: PayloadAction<string>) => {
      state.budgets = state.budgets.filter((b) => b.id !== action.payload);
    },
  },
});

export const { addBudget, updateBudget, deleteBudget } = budgetSlice.actions;

export default budgetSlice.reducer;
