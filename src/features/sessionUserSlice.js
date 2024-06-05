import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,
  isLoggedIn: false
};

const sessionUserSlice = createSlice({
  name: 'sessionUser',
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.access_token;
      state.isLoggedIn = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isLoggedIn = false
    },
  },
});

export const {login, logout} = sessionUserSlice.actions;

export default sessionUserSlice.reducer;