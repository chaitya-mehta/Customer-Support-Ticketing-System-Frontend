import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { TICKET_ENDPOINTS } from "../../api/endpoints";
import type { Ticket, ApiResponse } from "../../types";

interface TicketState {
  tickets: Ticket[];
  currentTicket: Ticket | null;
  isLoading: boolean;
  error: string | null;
}

interface CreateTicketPayload {
  name: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high";
  attachments?: File[];
}

interface UpdateTicketPayload {
  id: string;
  data: {
    status?: string;
    priority?: string;
    assignedAgent?: string;
  };
}

export const createTicket = createAsyncThunk(
  "ticket/create",
  async (payload: CreateTicketPayload, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("name", payload.name);
      formData.append("description", payload.description);
      formData.append("category", payload.category);
      formData.append("priority", payload.priority);

      if (payload.attachments) {
        payload.attachments.forEach((file) => {
          formData.append("attachments", file);
        });
      }

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
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<
        ApiResponse<{ tickets: Ticket[] }>
      >(TICKET_ENDPOINTS.GET_ALL);
      return response.data.data;
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
      >(TICKET_ENDPOINTS.GET_BY_USER); // 👈 this endpoint must exist in backend
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
      const response = await axiosInstance.put<ApiResponse<Ticket>>(
        TICKET_ENDPOINTS.UPDATE(payload.id),
        payload.data
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update ticket"
      );
    }
  }
);

export const addAgentComment = createAsyncThunk(
  "ticket/addComment",
  async (payload: { id: string; commentText: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<ApiResponse<Ticket>>(
        TICKET_ENDPOINTS.ADD_COMMENT(payload.id),
        {
          commentText: payload.commentText,
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
        state.tickets = action.payload?.tickets || [];
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
