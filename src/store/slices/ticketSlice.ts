import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { TICKET_ENDPOINTS } from "../../api/endpoints";
import type { ApiResponse, Ticket } from "../../types";

interface TicketState {
  tickets: Ticket[];
  currentTicket: Ticket | null;
  isLoading: boolean;
  error: string | null;
  totalPages: number;
  totalRecords: number;
}
interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  priority?: string;
  category?: string;
}
// interface CreateTicketPayload {
//   name: string;
//   description: string;
//   category: string;
//   priority: "low" | "medium" | "high";
//   attachments?: File[];
// }

interface UpdateTicketPayload {
  id: string;
  commentText: string;
}

export const createTicket = createAsyncThunk(
  "ticket/create",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<ApiResponse<Ticket>>(
        TICKET_ENDPOINTS.CREATE,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create ticket"
      );
    }
  }
);

export const getAllTickets = createAsyncThunk(
  "ticket/getAll",
  async (params: PaginationParams, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("page", params.page.toString());
      queryParams.append("limit", params.limit.toString());

      if (params.search && params.search.trim()) {
        queryParams.append("search", params.search.trim());
      }

      if (params.status && params.status.trim()) {
        queryParams.append("status", params.status.trim());
      }

      if (params.priority && params.priority.trim()) {
        queryParams.append("priority", params.priority.trim());
      }

      if (params.category && params.category.trim()) {
        queryParams.append("category", params.category.trim());
      }

      const response = await axiosInstance.get(
        `${TICKET_ENDPOINTS.GET_ALL}?${queryParams.toString()}`
      );

      return {
        tickets: response.data.data?.tickets || response.data.data || [],
        totalPages: response.data.data?.totalPages || 1,
        totalCount:
          response.data.data?.totalRecords || response.data.data?.total || 0,
        currentPage: response.data.data?.currentPage || params.page,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch tickets"
      );
    }
  }
);
export const getTicketsByUser = createAsyncThunk(
  "ticket/getByUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<
        ApiResponse<{ tickets: Ticket[] }>
      >(TICKET_ENDPOINTS.GET_BY_USER);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user's tickets"
      );
    }
  }
);

export const getTicketById = createAsyncThunk(
  "ticket/getById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<ApiResponse<Ticket>>(
        TICKET_ENDPOINTS.GET_BY_ID(id)
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch ticket"
      );
    }
  }
);

export const updateTicket = createAsyncThunk(
  "ticket/update",
  async (payload: UpdateTicketPayload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put<ApiResponse<{ ticket: Ticket }>>(
        TICKET_ENDPOINTS.UPDATE(payload.id),
        { commentText: payload.commentText }
      );
      return response.data.data?.ticket;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update comment"
      );
    }
  }
);

export const addAgentComment = createAsyncThunk(
  "ticket/addComment",
  async (
    payload: { id: string; commentText: string; status: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post<ApiResponse<Ticket>>(
        TICKET_ENDPOINTS.ADD_COMMENT(payload.id),
        {
          commentText: payload.commentText,
          status: payload.status,
        }
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add comment"
      );
    }
  }
);

const initialState: TicketState = {
  tickets: [],
  currentTicket: null,
  isLoading: false,
  error: null,
  totalPages: 1,
  totalRecords: 0,
};

const ticketSlice = createSlice({
  name: "ticket",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTicket.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tickets.push(action.payload!);
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(getTicketsByUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTicketsByUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tickets = action.payload?.tickets || [];
      })
      .addCase(getTicketsByUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(getAllTickets.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllTickets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tickets = action.payload.tickets;
        state.totalPages = action.payload.totalPages;
        state.totalRecords = action.payload.totalCount;
      })
      .addCase(getAllTickets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(getTicketById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTicketById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTicket = action.payload!;
      })
      .addCase(getTicketById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(updateTicket.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateTicket.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.tickets.findIndex(
          (t) => t._id === action.payload!._id
        );
        if (index !== -1) {
          state.tickets[index] = action.payload!;
        }
        state.currentTicket = action.payload!;
      })
      .addCase(updateTicket.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(addAgentComment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addAgentComment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTicket = action.payload!;
        const index = state.tickets.findIndex(
          (t) => t._id === action.payload!._id
        );
        if (index !== -1) {
          state.tickets[index] = action.payload!;
        }
      })
      .addCase(addAgentComment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = ticketSlice.actions;
export default ticketSlice.reducer;
