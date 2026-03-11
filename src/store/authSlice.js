import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user:    JSON.parse(localStorage.getItem("user")) || null,
  token:   localStorage.getItem("accessToken") || null,
  loading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload;
      state.user  = user;
      state.token = accessToken;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(user));
    },
    clearCredentials: (state) => {
      state.user  = null;
      state.token = null;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setCredentials, clearCredentials, setLoading } = authSlice.actions;
export default authSlice.reducer;

// Selectors — components use these to read state
export const selectUser     = (state) => state.auth.user;
export const selectToken    = (state) => state.auth.token;
export const selectLoading  = (state) => state.auth.loading;