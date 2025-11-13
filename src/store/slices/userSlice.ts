import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { ApiResponse } from "../../types";
import axiosInstance from "../../api/axiosInstance";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "agent" | "customer";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserState {
  users: User[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalRecords: number;
}

const initialState: UserState = {
  users: [],
  isLoading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalRecords: 0,
};

// API Endpoints
const USER_ENDPOINTS = {
  GET_ALL: "/users",
  TOGGLE_STATUS: (id: string) => `/users/${id}/status`,
  UPDATE: (id: string) => `/users/${id}`,
};

export const getAllUsers = createAsyncThunk(
  "users/getAll",
  async (page: number = 1, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<ApiResponse<{ data: User[] }>>(
        `${USER_ENDPOINTS.GET_ALL}?page=${page}&limit=10`
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch users"
      );
    }
  }
);

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async (
    { id, userData }: { id: string; userData: Partial<User> },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.put<ApiResponse<User>>(
        USER_ENDPOINTS.UPDATE(id),
        userData
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update user"
      );
    }
  }
);

export const toggleUserStatus = createAsyncThunk(
  "users/toggleStatus",
  async (
    { id, isActive }: { id: string; isActive: boolean },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.patch<ApiResponse<User>>(
        USER_ENDPOINTS.TOGGLE_STATUS(id),
        { isActive }
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to toggle user status"
      );
    }
  }
);

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get All Users
      .addCase(getAllUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload?.data || [];
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Toggle User Status
      .addCase(toggleUserStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedUser = action.payload;
        const index = state.users.findIndex(
          (user) => user._id === updatedUser?._id
        );
        if (index !== -1) {
          state.users[index] = updatedUser!;
        }
      })
      .addCase(toggleUserStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update User
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedUser = action.payload;
        const index = state.users.findIndex(
          (user) => user._id === updatedUser?._id
        );
        if (index !== -1) {
          state.users[index] = updatedUser!;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setUsers } = userSlice.actions;
export default userSlice.reducer;
