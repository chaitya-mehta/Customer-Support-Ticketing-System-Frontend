import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import categoryReducer from "./slices/categorySlice";
import ticketReducer from "./slices/ticketSlice";
import userReducer from "./slices/userSlice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    ticket: ticketReducer,
    category: categoryReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
