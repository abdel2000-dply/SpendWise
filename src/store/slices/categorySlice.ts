import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DEFAULT_CATEGORIES } from "../../constants/categories";
import { Category } from "../../types";

interface CategoryState {
  categories: Category[];
}

const initialState: CategoryState = {
  categories: DEFAULT_CATEGORIES,
};

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    addCategory: (state, action: PayloadAction<Category>) => {
      state.categories.push(action.payload);
    },
    updateCategory: (state, action: PayloadAction<Category>) => {
      const index = state.categories.findIndex(
        (c) => c.id === action.payload.id
      );
      if (index !== -1) {
        state.categories[index] = action.payload;
      }
    },
    deleteCategory: (state, action: PayloadAction<string>) => {
      state.categories = state.categories.filter(
        (c) => c.id !== action.payload
      );
    },
  },
});

export const { addCategory, updateCategory, deleteCategory } =
  categorySlice.actions;

export default categorySlice.reducer;
