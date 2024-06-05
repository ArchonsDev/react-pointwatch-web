import { configureStore } from '@reduxjs/toolkit';
import appStateReducer from "./features/appStateSlice.js";
import sessionUserReducer from "./features/sessionUserSlice.js";

export const store = configureStore({
    reducer: {
        appState: appStateReducer,
        sessionUser: sessionUserReducer
    },
});

export default store;