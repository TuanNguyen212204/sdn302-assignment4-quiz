import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import quizReducer from "./quizSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    quizzes: quizReducer,
  },
});

// Keep persistence outside reducers: reducers only update Redux state.
store.subscribe(function () {
  const token = store.getState().auth.token;
  if (token) {
    localStorage.setItem("quizToken", token);
  } else {
    localStorage.removeItem("quizToken");
  }
});
