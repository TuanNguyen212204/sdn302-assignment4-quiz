import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiRequest } from "../services/api";

export const fetchQuizzes = createAsyncThunk(
  "quizzes/fetch",
  async function (_, thunkAPI) {
    try {
      const token = thunkAPI.getState().auth.token;
      return await apiRequest("/quizzes", { token: token });
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

export const fetchQuiz = createAsyncThunk(
  "quizzes/details",
  async function (quizId, thunkAPI) {
    try {
      const token = thunkAPI.getState().auth.token;
      return await apiRequest("/quizzes/" + quizId, { token: token });
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

export const submitQuiz = createAsyncThunk(
  "quizzes/submit",
  async function (_, thunkAPI) {
    const state = thunkAPI.getState();
    try {
      return await apiRequest(
        "/quizzes/" + state.quizzes.currentQuiz._id + "/submit",
        {
          method: "POST",
          token: state.auth.token,
          body: { answers: state.quizzes.answers },
        },
      );
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

const initialState = {
  items: [],
  currentQuiz: null,
  questionIndex: 0,
  answers: [],
  result: null,
  status: "idle",
  submitting: false,
  error: "",
};

const quizSlice = createSlice({
  name: "quizzes",
  initialState: initialState,
  reducers: {
    selectAnswer: function (state, action) {
      state.answers[state.questionIndex] = action.payload;
    },
    nextQuestion: function (state) {
      state.questionIndex += 1;
    },
    restartQuiz: function (state) {
      state.questionIndex = 0;
      state.answers = [];
      state.result = null;
      state.error = "";
    },
    clearQuizzes: function () {
      return initialState;
    },
  },
  extraReducers: function (builder) {
    builder.addCase(fetchQuizzes.pending, function (state) {
      state.status = "loading";
      state.error = "";
    });
    builder.addCase(fetchQuizzes.fulfilled, function (state, action) {
      state.items = action.payload;
      state.status = "succeeded";
    });
    builder.addCase(fetchQuizzes.rejected, function (state, action) {
      state.status = "failed";
      state.error = action.payload;
    });
    builder.addCase(fetchQuiz.pending, function (state) {
      state.status = "loading";
      state.currentQuiz = null;
      state.error = "";
      state.result = null;
      state.questionIndex = 0;
      state.answers = [];
    });
    builder.addCase(fetchQuiz.fulfilled, function (state, action) {
      state.currentQuiz = action.payload;
      state.status = "succeeded";
    });
    builder.addCase(fetchQuiz.rejected, function (state, action) {
      state.status = "failed";
      state.error = action.payload;
    });
    builder.addCase(submitQuiz.pending, function (state) {
      state.submitting = true;
      state.error = "";
    });
    builder.addCase(submitQuiz.fulfilled, function (state, action) {
      state.result = action.payload;
      state.submitting = false;
    });
    builder.addCase(submitQuiz.rejected, function (state, action) {
      state.error = action.payload;
      state.submitting = false;
    });
  },
});

export const { selectAnswer, nextQuestion, restartQuiz, clearQuizzes } =
  quizSlice.actions;
export default quizSlice.reducer;
