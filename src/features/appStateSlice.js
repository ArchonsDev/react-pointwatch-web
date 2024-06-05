import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoading: false,
}

const appStateSlice = createSlice({
  name: 'appState',
  initialState,
  reducers: {
    startLoading: (state) => {
      state.isLoading = true;
    },
    endLoading: (state) => {
      state.isLoading = false;
    },
  },
});

export const {login, logout} = appStateSlice.actions;

export default appStateSlice.reducer;