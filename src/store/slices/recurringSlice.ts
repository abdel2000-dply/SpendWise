import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RecurringTransaction } from "../../types";

interface RecurringState {
  transactions: RecurringTransaction[];
}

const initialState: RecurringState = {
  transactions: [],
};

const recurringSlice = createSlice({
  name: "recurring",
  initialState,
  reducers: {
    addRecurring: (state, action: PayloadAction<RecurringTransaction>) => {
      state.transactions.push(action.payload);
    },
    updateRecurring: (state, action: PayloadAction<RecurringTransaction>) => {
      const idx = state.transactions.findIndex(
        (t) => t.id === action.payload.id,
      );
      if (idx !== -1) state.transactions[idx] = action.payload;
    },
    deleteRecurring: (state, action: PayloadAction<string>) => {
      state.transactions = state.transactions.filter(
        (t) => t.id !== action.payload,
      );
    },
    toggleRecurringActive: (state, action: PayloadAction<string>) => {
      const tx = state.transactions.find((t) => t.id === action.payload);
      if (tx) tx.isActive = !tx.isActive;
    },
    markProcessed: (
      state,
      action: PayloadAction<{ id: string; nextDueDate: Date }>,
    ) => {
      const tx = state.transactions.find((t) => t.id === action.payload.id);
      if (tx) {
        tx.lastProcessedDate = new Date();
        tx.nextDueDate = action.payload.nextDueDate;
      }
    },
    setTransactions: (state, action: PayloadAction<RecurringTransaction[]>) => {
      state.transactions = action.payload;
    },
  },
});

export const {
  addRecurring,
  updateRecurring,
  deleteRecurring,
  toggleRecurringActive,
  markProcessed,
  setTransactions,
} = recurringSlice.actions;

export default recurringSlice.reducer;
