import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { QuickTemplate } from "../../types";

interface TemplateState {
  templates: QuickTemplate[];
}

const initialState: TemplateState = {
  templates: [],
};

const templateSlice = createSlice({
  name: "templates",
  initialState,
  reducers: {
    addTemplate: (state, action: PayloadAction<QuickTemplate>) => {
      state.templates.push(action.payload);
    },
    deleteTemplate: (state, action: PayloadAction<string>) => {
      state.templates = state.templates.filter((t) => t.id !== action.payload);
    },
    incrementUsage: (state, action: PayloadAction<string>) => {
      const t = state.templates.find((t) => t.id === action.payload);
      if (t) t.usageCount += 1;
    },
    setTemplates: (state, action: PayloadAction<QuickTemplate[]>) => {
      state.templates = action.payload;
    },
  },
});

export const { addTemplate, deleteTemplate, incrementUsage, setTemplates } =
  templateSlice.actions;

export default templateSlice.reducer;
