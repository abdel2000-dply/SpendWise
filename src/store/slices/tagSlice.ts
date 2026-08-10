import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Tag } from "../../types";

interface TagState {
  tags: Tag[];
}

const DEFAULT_TAGS: Tag[] = [
  { id: "1", name: "Essential", color: "#4CAF50" },
  { id: "2", name: "Impulse", color: "#FF5722" },
  { id: "3", name: "Business", color: "#2196F3" },
  { id: "4", name: "Personal", color: "#9C27B0" },
  { id: "5", name: "Recurring", color: "#FF9800" },
];

const initialState: TagState = {
  tags: DEFAULT_TAGS,
};

const tagSlice = createSlice({
  name: "tags",
  initialState,
  reducers: {
    addTag: (state, action: PayloadAction<Tag>) => {
      state.tags.push(action.payload);
    },
    updateTag: (state, action: PayloadAction<Tag>) => {
      const index = state.tags.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.tags[index] = action.payload;
      }
    },
    deleteTag: (state, action: PayloadAction<string>) => {
      state.tags = state.tags.filter((t) => t.id !== action.payload);
    },
    setTags: (state, action: PayloadAction<Tag[]>) => {
      state.tags = action.payload;
    },
  },
});

export const { addTag, updateTag, deleteTag, setTags } = tagSlice.actions;
export default tagSlice.reducer;
