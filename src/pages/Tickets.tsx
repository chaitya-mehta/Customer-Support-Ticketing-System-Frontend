import { Edit, Visibility } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import type React from "react";
import { useEffect, useState } from "react";

import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "../hooks";
import { getActiveCategories } from "../store/slices/categorySlice";
import {
  addAgentComment,
  clearError,
  createTicket,
  getAllTickets,
} from "../store/slices/ticketSlice";
import { useDebounce } from "../utils/useDebounce";
import Pagination from "./Pagination";

const Tickets: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    tickets,
    isLoading,
    error,
    totalPages,
    pageSize = 2,
    totalRecords,
  } = useAppSelector((state) => state.ticket);
  const { activeCategories } = useAppSelector((state) => state.category);
  const { user } = useAppSelector((state) => state.auth);

  const [open, setOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTicket, setEditingTicket] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    handleFetchTickets(1);
    dispatch(getActiveCategories());
  }, [dispatch]);

  useEffect(() => {
    handleFetchTickets(1);
  }, [debouncedSearchQuery, statusFilter, priorityFilter, categoryFilter]);
  const handleFetchTickets = (pageNumber: number) => {
    setPage(pageNumber);
    dispatch(
      getAllTickets({
        page: pageNumber,
        limit: pageSize,
        search: debouncedSearchQuery,
        status: statusFilter,
        priority: priorityFilter,
        category: categoryFilter,
      })
    );
  };
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setPage(1);
  };
  const handleStatusFilterChange = (e: any) => {
    const value = e.target.value;
    setStatusFilter(value);
    setPage(1);
  };
  const handlePriorityFilterChange = (e: any) => {
    const value = e.target.value;
    setPriorityFilter(value);
    setPage(1);
  };
  const handleCategoryFilterChange = (e: any) => {
    const value = e.target.value;
    setCategoryFilter(value);
    setPage(1);
  };
  const handlePageChange = (pageNumber: number) => {
    handleFetchTickets(pageNumber);
  };

  const isAgentOrAdmin =
    user.user?.role === "agent" || user.user?.role === "admin";
  const editValidationSchema = Yup.object({
    commentText: Yup.string()
      .trim()
      .required("Comment is required")
      .min(3, "Comment must be at least 3 characters")
      .max(500, "Comment must not exceed 500 characters"),
    status: Yup.string()
      .oneOf(["open", "in progress", "resolved", "closed"], "Invalid status")
      .required("Status is required"),
  });
  const createValidationSchema = Yup.object({
    name: Yup.string()
      .trim()
      .required("Title is required")
      .min(5, "Title must be at least 5 characters")
      .max(100, "Title must not exceed 100 characters"),
    description: Yup.string()
      .trim()
      .required("Description is required")
      .min(10, "Description must be at least 10 characters")
      .max(1000, "Description must not exceed 1000 characters"),
    category: Yup.string().required("Category is required"),
    priority: Yup.string()
      .oneOf(["low", "medium", "high"], "Invalid priority level")
      .required("Priority is required"),
  });
  const validationSchema = isEditMode
    ? editValidationSchema
    : createValidationSchema;
  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      category: "",
      priority: "medium" as "low" | "medium" | "high",
      commentText: "",
      status: "open" as "open" | "in progress" | "resolved" | "closed",
    },
    validationSchema: validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        if (isEditMode && editingTicket) {
          const result = await dispatch(
            addAgentComment({
              id: editingTicket._id,
              commentText: values.commentText.trim(),
              status: values.status,
            })
          );

          if (addAgentComment.fulfilled.match(result)) {
            resetForm();
            handleClose();
            handleFetchTickets(page);
          }
        } else {
          const formData = new FormData();
          formData.append("name", values.name.trim());
          formData.append("description", values.description.trim());
          formData.append("category", values.category);
          formData.append("priority", values.priority);

          const result = await dispatch(createTicket(formData));

          if (createTicket.fulfilled.match(result)) {
            resetForm();
            handleClose();
            handleFetchTickets(1);
          }
        }
      } catch (error) {
        console.error("Error in ticket operation:", error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleOpen = () => {
    setIsEditMode(false);
    setEditingTicket(null);
    setOpen(true);
  };

  const handleEdit = (ticket: any) => {
    setIsEditMode(true);
    setEditingTicket(ticket);
    formik.setValues({
      name: ticket.name,
      description: ticket.description,
      category:
        typeof ticket.category === "string"
          ? ticket.category
          : ticket.category?._id,
      priority: ticket.priority,
      commentText: "",
      status: ticket.status,
    });

    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setIsEditMode(false);
    setEditingTicket(null);
    formik.resetForm();
    dispatch(clearError());
  };

  const getStatusColor = (
    status: string
  ):
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning" => {
    switch (status) {
      case "open":
        return "warning";
      case "in progress":
        return "info";
      case "resolved":
        return "success";
      case "closed":
        return "default";
      default:
        return "default";
    }
  };

  const getPriorityColor = (
    priority: string
  ):
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning" => {
    switch (priority) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5">Tickets</Typography>
        <Button variant="contained" onClick={handleOpen} disabled={isLoading}>
          Create Ticket
        </Button>
      </Box>
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => dispatch(clearError())}
        >
          {error}
        </Alert>
      )}
      <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <TextField
          placeholder="Search by title or description..."
          value={searchQuery}
          onChange={handleSearchChange}
          disabled={isLoading}
          size="small"
          sx={{ minWidth: 250 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            label="Status"
            disabled={isLoading}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="open">Open</MenuItem>
            <MenuItem value="in progress">In Progress</MenuItem>
            <MenuItem value="resolved">Resolved</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Priority</InputLabel>
          <Select
            value={priorityFilter}
            onChange={handlePriorityFilterChange}
            label="Priority"
            disabled={isLoading}
          >
            <MenuItem value="">All Priority</MenuItem>
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={categoryFilter}
            onChange={handleCategoryFilterChange}
            label="Category"
            disabled={isLoading}
          >
            <MenuItem value="">All Categories</MenuItem>
            {activeCategories.map((category: any) => (
              <MenuItem key={category._id} value={category._id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>TicketId</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Createdby</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Title</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Category</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Priority</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Created</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: "center", py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: "center", py: 4 }}>
                  No tickets found
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((ticket: any) => (
                <TableRow key={ticket._id} hover>
                  <TableCell>#{ticket._id.slice(-8)}</TableCell>
                  <TableCell>{ticket.createdBy?.name || "N/A"}</TableCell>
                  <TableCell>{ticket.name}</TableCell>
                  <TableCell>
                    {typeof ticket.category === "string"
                      ? ticket.category
                      : ticket.category?.name}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={ticket.priority}
                      color={getPriorityColor(ticket.priority)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={ticket.status}
                      color={getStatusColor(ticket.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View Ticket">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/tickets/${ticket._id}`)}
                          color="primary"
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      {isAgentOrAdmin && (
                        <Tooltip title="Update Ticket">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(ticket)}
                            color="secondary"
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalCount={totalRecords}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        showRecordsInfo={true}
        showPageInfo={true}
      />

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ pb: 0 }}>
          {isEditMode ? "Update Ticket" : "Create New Ticket"}
        </DialogTitle>
        <Box sx={{ px: 3, pt: 0, pb: 1 }}>
          {isEditMode && editingTicket && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              #{editingTicket._id.slice(-8)} - {editingTicket.name}
            </Typography>
          )}
        </Box>
        <DialogContent sx={{ pt: 0 }}>
          <Box component="form" onSubmit={formik.handleSubmit} noValidate>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Title *"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                placeholder="Enter a descriptive title for your issue"
                disabled={isEditMode}
              />
              <TextField
                fullWidth
                label="Description *"
                name="description"
                multiline
                rows={4}
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.description &&
                  Boolean(formik.errors.description)
                }
                helperText={
                  formik.touched.description && formik.errors.description
                }
                placeholder="Please provide detailed information about your issue..."
                disabled={isEditMode}
              />
              <FormControl fullWidth disabled={isEditMode}>
                <InputLabel>Category *</InputLabel>
                <Select
                  name="category"
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Category *"
                  error={
                    formik.touched.category && Boolean(formik.errors.category)
                  }
                >
                  <MenuItem value="">
                    <em>Select a category</em>
                  </MenuItem>
                  {activeCategories.map((cat: any) => (
                    <MenuItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.category && formik.errors.category && (
                  <Typography variant="caption" color="error">
                    {formik.errors.category}
                  </Typography>
                )}
              </FormControl>
              <FormControl
                fullWidth
                error={
                  formik.touched.priority && Boolean(formik.errors.priority)
                }
                disabled={isEditMode}
              >
                <InputLabel>Priority *</InputLabel>
                <Select
                  name="priority"
                  value={formik.values.priority}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Priority *"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
                {formik.touched.priority && formik.errors.priority && (
                  <Typography variant="caption" color="error">
                    {formik.errors.priority}
                  </Typography>
                )}
              </FormControl>
              {isEditMode && (
                <FormControl fullWidth>
                  <InputLabel>Update Status *</InputLabel>
                  <Select
                    name="status"
                    value={formik.values.status}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="Update Status *"
                    error={
                      formik.touched.status && Boolean(formik.errors.status)
                    }
                  >
                    <MenuItem value="open">Open</MenuItem>
                    <MenuItem value="in progress">In Progress</MenuItem>
                    <MenuItem value="resolved">Resolved</MenuItem>
                    {user.user?.role === "admin" && (
                      <MenuItem value="closed">Closed</MenuItem>
                    )}
                  </Select>
                  {formik.touched.status && formik.errors.status && (
                    <Typography variant="caption" color="error">
                      {formik.errors.status}
                    </Typography>
                  )}
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    {user.user?.role === "agent"
                      ? "Agents can update to Resolved. Only admins can close tickets."
                      : "Admins can update any status including closing tickets."}
                  </Typography>
                </FormControl>
              )}
              <TextField
                fullWidth
                label={
                  isEditMode
                    ? "Add Comment *"
                    : "Additional Comments (Optional)"
                }
                name="commentText"
                multiline
                rows={4}
                value={formik.values.commentText}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.commentText &&
                  Boolean(formik.errors.commentText)
                }
                helperText={
                  formik.touched.commentText && formik.errors.commentText
                }
                placeholder={
                  isEditMode
                    ? "Enter your comments about this ticket and status update..."
                    : "Any additional comments or information..."
                }
              />
              {isEditMode &&
                editingTicket?.agentComments &&
                editingTicket.agentComments.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Previous Comments ({editingTicket.agentComments.length})
                    </Typography>
                    <Box
                      sx={{
                        maxHeight: 150,
                        overflow: "auto",
                        border: "1px solid #e0e0e0",
                        borderRadius: 1,
                        p: 1,
                        backgroundColor: "#fafafa",
                      }}
                    >
                      {editingTicket.agentComments
                        .slice(-3)
                        .map((comment: any, index: number) => (
                          <Box
                            key={index}
                            sx={{
                              mb: 1,
                              pb: 1,
                              borderBottom:
                                index <
                                editingTicket.agentComments.slice(-3).length - 1
                                  ? "1px solid #f0f0f0"
                                  : "none",
                            }}
                          >
                            <Typography variant="body2" fontWeight="medium">
                              {typeof comment.agentId === "object"
                                ? comment.agentId.name
                                : "Agent"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {comment.commentText}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {new Date(
                                comment.commentedAt
                              ).toLocaleDateString()}{" "}
                              •
                              {comment.statusChange &&
                                ` Status: ${comment.statusChange.from} → ${comment.statusChange.to}`}
                            </Typography>
                          </Box>
                        ))}
                    </Box>
                  </Box>
                )}
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            type="submit"
            onClick={() => formik.handleSubmit()}
            disabled={isLoading || !formik.isValid || formik.isSubmitting}
            startIcon={isLoading ? <CircularProgress size={16} /> : null}
          >
            {isLoading
              ? isEditMode
                ? "Updating Ticket..."
                : "Creating..."
              : isEditMode
              ? "Update Ticket"
              : "Create Ticket"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Tickets;
