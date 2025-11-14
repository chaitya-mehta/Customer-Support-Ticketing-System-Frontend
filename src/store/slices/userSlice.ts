import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import type { ApiResponse } from "../../types";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "agent" | "customer";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  role?: string;
  isActive?: boolean | null;
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
  async (params: PaginationParams, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("page", params.page.toString());
      queryParams.append("limit", params.limit.toString());

      if (params.search && params.search.trim()) {
        queryParams.append("search", params.search.trim());
      }

      if (params.role && params.role.trim()) {
        queryParams.append("role", params.role.trim());
      }

      if (params.isActive !== null && params.isActive !== undefined) {
        queryParams.append("isActive", params.isActive.toString());
      }

      const response = await axiosInstance.get(
        `${USER_ENDPOINTS.GET_ALL}?${queryParams.toString()}`
      );

      return {
        users: response.data.data?.data || response.data.data || [],
        totalPages: response.data.data?.totalPages || 1,
        totalCount:
          response.data.data?.totalRecords || response.data.data?.total || 0,
        currentPage: response.data.data?.currentPage || params.page,
      };
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
        // state.users = action.payload?.data || [];
        state.users = action.payload.users;
        state.totalPages = action.payload.totalPages;
        state.totalRecords = action.payload.totalCount;
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
