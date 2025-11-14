import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { CATEGORY_ENDPOINTS } from "../../api/endpoints";
import type { ApiResponse, Category } from "../../types";

interface CategoryState {
  categories: Category[];
  activeCategories: Category[];
  isLoading: boolean;
  error: string | null;
  totalRecords: number;
  totalPages: number;
}
export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean | null;
}
interface CreateCategoryPayload {
  name: string;
}

interface UpdateCategoryPayload {
  id: string;
  name: string;
}

export const createCategory = createAsyncThunk(
  "category/create",
  async (payload: CreateCategoryPayload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<ApiResponse<Category>>(
        CATEGORY_ENDPOINTS.CREATE,
        payload
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create category"
      );
    }
  }
);

export const getAllCategories = createAsyncThunk(
  "category/getAll",
  async (params: PaginationParams, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("page", params.page.toString());
      queryParams.append("limit", params.limit.toString());

      if (params.search && params.search.trim()) {
        queryParams.append("search", params.search.trim());
      }

      if (params.isActive !== null && params.isActive !== undefined) {
        queryParams.append("isActive", params.isActive.toString());
      }

      const response = await axiosInstance.get<
        ApiResponse<{
          currentPage: number;
          data: Category[];
          totalPages: number;
          totalRecords: number;
        }>
      >(`${CATEGORY_ENDPOINTS.GET_ALL}?${queryParams.toString()}`);
      return {
        categories: response.data.data?.data || [],
        totalPages: response.data.data?.totalPages || 1,
        totalRecords: response.data.data?.totalRecords || 0,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch categories"
      );
    }
  }
);

export const getActiveCategories = createAsyncThunk(
  "category/getActive",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<ApiResponse<Category[]>>(
        CATEGORY_ENDPOINTS.GET_ACTIVE
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch active categories"
      );
    }
  }
);

export const updateCategory = createAsyncThunk(
  "category/update",
  async (payload: UpdateCategoryPayload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put<ApiResponse<Category>>(
        CATEGORY_ENDPOINTS.UPDATE(payload.id),
        {
          name: payload.name,
        }
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update category"
      );
    }
  }
);

export const toggleCategoryStatus = createAsyncThunk(
  "category/toggleStatus",
  async (
    { id, isActive }: { id: string; isActive: boolean },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.patch<ApiResponse<Category>>(
        `/category/${id}/status`,
        { isActive }
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to toggle category status"
      );
    }
  }
);

const initialState: CategoryState = {
  categories: [],
  activeCategories: [],
  isLoading: false,
  totalRecords: 0,
  totalPages: 0,
  error: null,
};

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Get All Categories
    builder
      .addCase(getAllCategories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload?.categories || [];
        state.totalPages = action.payload?.totalPages || 0;
        state.totalRecords = action.payload?.totalRecords || 0;
      })
      .addCase(getAllCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get Active Categories
    builder
      .addCase(getActiveCategories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getActiveCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeCategories = action.payload || [];
      })
      .addCase(getActiveCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Category
    builder
      .addCase(createCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories.push(action.payload!);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Category
    builder
      .addCase(updateCategory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.categories.findIndex(
          (c) => c._id === action.payload!._id
        );
        if (index !== -1) {
          state.categories[index] = action.payload!;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Toggle Category Status
    builder
      .addCase(toggleCategoryStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(toggleCategoryStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.categories.findIndex(
          (c) => c._id === action.payload!._id
        );
        if (index !== -1) {
          state.categories[index].isActive = action.payload!.isActive;
        }
      })
      .addCase(toggleCategoryStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = categorySlice.actions;
export default categorySlice.reducer;
