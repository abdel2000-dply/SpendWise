import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DEFAULT_INCOME_SOURCES } from "../../constants/incomeSources";
import { IncomeSource } from "../../types";

interface IncomeSourcesState {
  sources: IncomeSource[];
}

const initialState: IncomeSourcesState = {
  sources: DEFAULT_INCOME_SOURCES,
};

const incomeSourcesSlice = createSlice({
  name: "incomeSources",
  initialState,
  reducers: {
    addIncomeSource: (state, action: PayloadAction<IncomeSource>) => {
      state.sources.push(action.payload);
    },
    updateIncomeSource: (state, action: PayloadAction<IncomeSource>) => {
      const index = state.sources.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) {
        state.sources[index] = action.payload;
      }
    },
    deleteIncomeSource: (state, action: PayloadAction<string>) => {
      state.sources = state.sources.filter((s) => s.id !== action.payload);
    },
  },
});

export const { addIncomeSource, updateIncomeSource, deleteIncomeSource } =
  incomeSourcesSlice.actions;

export default incomeSourcesSlice.reducer;
