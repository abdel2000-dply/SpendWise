import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChatMessage } from "../../types";

interface AiCoachState {
  messages: ChatMessage[];
  isLoading: boolean;
  lastDigestDate: string | null;
}

const initialState: AiCoachState = {
  messages: [],
  isLoading: false,
  lastDigestDate: null,
};

const aiCoachSlice = createSlice({
  name: "aiCoach",
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
      if (state.messages.length > 100) {
        state.messages = state.messages.slice(-100);
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    clearChat: (state) => {
      state.messages = [];
    },
    setLastDigestDate: (state, action: PayloadAction<string>) => {
      state.lastDigestDate = action.payload;
    },
  },
});

export const { addMessage, setLoading, clearChat, setLastDigestDate } =
  aiCoachSlice.actions;

export default aiCoachSlice.reducer;
