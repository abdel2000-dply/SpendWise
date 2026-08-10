import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SpendingChallenge } from "../../types";

interface ChallengeState {
  challenges: SpendingChallenge[];
}

const initialState: ChallengeState = {
  challenges: [],
};

const challengeSlice = createSlice({
  name: "challenges",
  initialState,
  reducers: {
    addChallenge: (state, action: PayloadAction<SpendingChallenge>) => {
      state.challenges.push(action.payload);
    },
    removeChallenge: (state, action: PayloadAction<string>) => {
      state.challenges = state.challenges.filter(
        (c) => c.id !== action.payload,
      );
    },
    completeChallenge: (state, action: PayloadAction<string>) => {
      const c = state.challenges.find((c) => c.id === action.payload);
      if (c) {
        c.isCompleted = true;
        c.isActive = false;
      }
    },
    toggleChallengeActive: (state, action: PayloadAction<string>) => {
      const c = state.challenges.find((c) => c.id === action.payload);
      if (c) c.isActive = !c.isActive;
    },
    setChallenges: (state, action: PayloadAction<SpendingChallenge[]>) => {
      state.challenges = action.payload;
    },
  },
});

export const {
  addChallenge,
  removeChallenge,
  completeChallenge,
  toggleChallengeActive,
  setChallenges,
} = challengeSlice.actions;

export default challengeSlice.reducer;
