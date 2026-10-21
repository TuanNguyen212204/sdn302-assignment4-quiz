import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiRequest } from "../services/api";

const savedToken = localStorage.getItem("quizToken") || "";

export const loginUser = createAsyncThunk(
  "auth/login",
  async function (credentials, thunkAPI) {
    try {
      return await apiRequest("/users/login", {
        method: "POST",
        body: credentials,
      });
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async function (credentials, thunkAPI) {
    try {
      return await apiRequest("/users/register", {
        method: "POST",
        body: credentials,
      });
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

export const restoreUser = createAsyncThunk(
  "auth/restore",
  async function (_, thunkAPI) {
    const token = thunkAPI.getState().auth.token;
    try {
      return await apiRequest("/users/me", { token: token });
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: savedToken,
    user: null,
    status: "idle",
    error: "",
    checkingSession: Boolean(savedToken),
  },
  reducers: {
    logout: function (state) {
      state.token = "";
      state.user = null;
      state.error = "";
      state.status = "idle";
      state.checkingSession = false;
    },
    clearAuthError: function (state) {
      state.error = "";
    },
  },
  extraReducers: function (builder) {
    builder.addCase(loginUser.pending, function (state) {
      state.status = "loading";
      state.error = "";
    });
    builder.addCase(loginUser.fulfilled, function (state, action) {
      state.status = "succeeded";
      state.token = action.payload.token;
      state.user = action.payload.user;
    });
    builder.addCase(loginUser.rejected, function (state, action) {
      state.status = "failed";
      state.error = action.payload;
      state.token = "";
      state.user = null;
    });
    builder.addCase(registerUser.pending, function (state) {
      state.status = "loading";
      state.error = "";
    });
    builder.addCase(registerUser.fulfilled, function (state) {
      state.status = "idle";
    });
    builder.addCase(registerUser.rejected, function (state, action) {
      state.status = "failed";
      state.error = action.payload;
    });
    builder.addCase(restoreUser.fulfilled, function (state, action) {
      state.user = action.payload.user;
      state.checkingSession = false;
    });
    builder.addCase(restoreUser.rejected, function (state, action) {
      state.token = "";
      state.user = null;
      state.error = action.payload;
      state.checkingSession = false;
    });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
