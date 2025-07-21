import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type User = {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
};

type UserState = {
  token: string | null;
  user: User | null;
};

const initialState: UserState = {
  token: null,
  user: null,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ token: string; user: User }>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    clearCredentials: (state) => {
      state.token = null;
      state.user = null;
    },
  },
});

export const { setCredentials, clearCredentials } = userSlice.actions;
export default userSlice.reducer;
