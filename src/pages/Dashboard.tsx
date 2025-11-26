import {
  Add,
  AttachFile,
  Comment,
  Delete,
  Visibility,
} from "@mui/icons-material";
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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
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
  Typography,
} from "@mui/material";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "../hooks";
import { getActiveCategories } from "../store/slices/categorySlice";
import {
  clearError,
  createTicket,
  getTicketsByUser,
  updateTicket,
} from "../store/slices/ticketSlice";
import { getAgents } from "../store/slices/userSlice";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { tickets, isLoading, error } = useAppSelector((state) => state.ticket);
  const { activeCategories } = useAppSelector((state) => state.category);
  const { user } = useAppSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTicket, setEditingTicket] = useState<any>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const activeAgents = useAppSelector((state) => state.user.agents);

  useEffect(() => {
    dispatch(getTicketsByUser());
    dispatch(getActiveCategories());
    dispatch(getAgents());
  }, [dispatch]);

  const isCustomer = user.user?.role === "customer";

  const createValidationSchema = Yup.object({
    name: Yup.string()
      .trim()
      .required("Title is required")
      .min(5, "Title must be at least 5 characters")
      .max(100, "Title must not exceed 100 characters"),
    assignedAgent: Yup.string().required("Please assign an agent"),
    description: Yup.string()
      .trim()
      .required("Description is required")
      .min(10, "Description must be at least 10 characters")
      .max(1000, "Description must not exceed 1000 characters"),
    category: Yup.string().required("Category is required"),
    priority: Yup.string()
      .oneOf(["low", "medium", "high"], "Invalid priority level")
      .required("Priority is required"),
    commentText: Yup.string()
      .trim()
      .max(500, "Comment must not exceed 500 characters")
      .notRequired(),
  });

  const editValidationSchema = Yup.object({
    name: Yup.string(),
    description: Yup.string(),
    category: Yup.string(),
    priority: Yup.string(),
    commentText: Yup.string()
      .trim()
      .required("Comment is required")
      .min(3, "Comment must be at least 3 characters")
      .max(500, "Comment must not exceed 500 characters"),
  });

  const validationSchema =
    isEditMode && isCustomer ? editValidationSchema : createValidationSchema;

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      category: "",
      priority: "medium" as "low" | "medium" | "high",
      commentText: "",
      assignedAgent: "",
    },
    validationSchema: validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        if (isEditMode && editingTicket && isCustomer) {
          const result = await dispatch(
            updateTicket({
              id: editingTicket._id,
              commentText: values.commentText.trim(),
            })
          );
          if (updateTicket.fulfilled.match(result)) {
            resetForm();
            handleClose();
            dispatch(getTicketsByUser());
          }
        } else {
          const formData = new FormData();
          formData.append("name", values.name.trim());
          formData.append("description", values.description.trim());
          formData.append("category", values.category);
          formData.append("priority", values.priority);
          formData.append("assignedAgent", values.assignedAgent);

          if (values.commentText.trim()) {
            formData.append("commentText", values.commentText.trim());
          }

          attachments.forEach((file) => {
            formData.append("attachments", file);
          });

          const result = await dispatch(createTicket(formData));

          if (createTicket.fulfilled.match(result)) {
            resetForm();
            setAttachments([]);
            setFileErrors([]);
            handleClose();
            dispatch(getTicketsByUser());
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
      commentText: ticket.commentText || "",
      assignedAgent: ticket?.assignedAgent?._id || "",
    });

    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setIsEditMode(false);
    setEditingTicket(null);
    formik.resetForm();
    setAttachments([]);
    setFileErrors([]);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    newFiles.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: File size exceeds 5MB limit`);
        return;
      }

      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        errors.push(`${file.name}: File type not allowed`);
        return;
      }

      if (
        attachments.some(
          (existingFile) =>
            existingFile.name === file.name &&
            existingFile.size === file.size &&
            existingFile.lastModified === file.lastModified
        )
      ) {
        errors.push(`${file.name}: File already added`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      setFileErrors(errors);
    } else {
      setFileErrors([]);
    }

    if (validFiles.length > 0) {
      setAttachments((prev) => [...prev, ...validFiles]);
    }

    event.target.value = "";
  };

  const handleRemoveFile = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const clearFileErrors = () => {
    setFileErrors([]);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatusColor = (status: string) => {
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

  const getPriorityColor = (priority: string) => {
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
        <Tooltip title="Create New Ticket">
          <IconButton
            color="primary"
            onClick={handleOpen}
            sx={{
              backgroundColor: "primary.main",
              color: "white",
              "&:hover": {
                backgroundColor: "primary.dark",
              },
            }}
          >
            <Add />
          </IconButton>
        </Tooltip>
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell width={100} sx={{ fontWeight: "bold" }}>
                TicketId
              </TableCell>
              <TableCell width={250} sx={{ fontWeight: "bold" }}>
                Title
              </TableCell>
              <TableCell width={250} sx={{ fontWeight: "bold" }}>
                Category
              </TableCell>
              <TableCell width={150} sx={{ fontWeight: "bold" }}>
                Priority
              </TableCell>
              <TableCell width={300} sx={{ fontWeight: "bold" }}>
                Assigned Agent
              </TableCell>
              <TableCell width={150} sx={{ fontWeight: "bold" }}>
                Status
              </TableCell>
              <TableCell width={150} sx={{ fontWeight: "bold" }}>
                Created
              </TableCell>
              <TableCell width={100} sx={{ fontWeight: "bold" }}>
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: "center", py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : tickets.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  sx={{ textAlign: "center", py: 4, fontWeight: "bold" }}
                >
                  No tickets found
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((ticket: any) => (
                <TableRow key={ticket._id} hover>
                  <TableCell>
                    #{String(ticket._id).slice(-8).toUpperCase()}
                  </TableCell>
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
                    {ticket.assignedAgent ? (
                      <Typography>
                        {typeof ticket.assignedAgent === "string"
                          ? ticket.assignedAgent
                          : ticket.assignedAgent.name}
                      </Typography>
                    ) : (
                      <Typography sx={{ color: "red" }}>
                        Not Assigned Yet
                      </Typography>
                    )}
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
                      {isCustomer && (
                        <Tooltip title="Add Comment">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(ticket)}
                            color="secondary"
                          >
                            <Comment />
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

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ pb: 0 }}>
          {isEditMode && isCustomer
            ? "Add Comment to Ticket"
            : "Create New Ticket"}
        </DialogTitle>
        <DialogContent sx={{ pb: 0 }}>
          <Box component="form" onSubmit={formik.handleSubmit} noValidate>
            <Stack spacing={3} sx={{ mt: 1 }}>
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
                disabled={isEditMode && isCustomer}
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
                disabled={isEditMode && isCustomer}
              />

              <TextField
                select
                fullWidth
                label="Category *"
                name="category"
                value={formik.values.category}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.category && Boolean(formik.errors.category)
                }
                helperText={formik.touched.category && formik.errors.category}
                disabled={isEditMode && isCustomer}
              >
                <MenuItem value="">
                  <em>Select a category</em>
                </MenuItem>
                {activeCategories && activeCategories.length > 0 ? (
                  activeCategories.map((cat: any) => (
                    <MenuItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="" disabled>
                    No categories available
                  </MenuItem>
                )}
              </TextField>

              <FormControl
                fullWidth
                error={
                  formik.touched.priority && Boolean(formik.errors.priority)
                }
              >
                <InputLabel>Priority *</InputLabel>
                <Select
                  name="priority"
                  value={formik.values.priority}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Priority *"
                  disabled={isEditMode && isCustomer}
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
              <FormControl
                fullWidth
                error={
                  formik.touched.assignedAgent &&
                  Boolean(formik.errors.assignedAgent)
                }
              >
                <InputLabel>Assign Agent *</InputLabel>
                <Select
                  name="assignedAgent"
                  value={formik.values.assignedAgent}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Assign Agent *"
                  disabled={isEditMode && isCustomer}
                >
                  <MenuItem value="">
                    <em>Select an agent</em>
                  </MenuItem>

                  {activeAgents && activeAgents.length > 0 ? (
                    activeAgents.map((agent: any) => (
                      <MenuItem key={agent._id} value={agent._id}>
                        {agent.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value="" disabled>
                      No agents available
                    </MenuItem>
                  )}
                </Select>

                {formik.touched.assignedAgent &&
                  formik.errors.assignedAgent && (
                    <Typography variant="caption" color="error">
                      {formik.errors.assignedAgent}
                    </Typography>
                  )}
              </FormControl>

              <TextField
                fullWidth
                label={
                  isEditMode && isCustomer
                    ? "Your Comment *"
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
                  isEditMode && isCustomer
                    ? "Enter your comments or updates about this ticket (minimum 3 characters)..."
                    : "Any additional comments or information..."
                }
              />

              {!(isEditMode && isCustomer) && (
                <Box>
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    fontWeight="medium"
                  >
                    Attachments (Optional)
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Maximum file size: 5MB. Allowed types: Images, PDF, Word,
                    Excel, Text files
                  </Typography>

                  {fileErrors.length > 0 && (
                    <Alert
                      severity="error"
                      sx={{ mb: 2 }}
                      onClose={clearFileErrors}
                    >
                      {fileErrors.map((error, index) => (
                        <div key={index}>{error}</div>
                      ))}
                    </Alert>
                  )}

                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<AttachFile />}
                    sx={{ mb: 2 }}
                  >
                    Select Files
                    <input
                      type="file"
                      hidden
                      multiple
                      onChange={handleFileSelect}
                      accept={ALLOWED_FILE_TYPES.join(",")}
                    />
                  </Button>

                  {attachments.length > 0 && (
                    <Box
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                        p: 2,
                      }}
                    >
                      <Typography variant="subtitle2" gutterBottom>
                        Selected Files ({attachments.length})
                      </Typography>
                      <List dense>
                        {attachments.map((file, index) => (
                          <ListItem
                            key={index}
                            secondaryAction={
                              <IconButton
                                edge="end"
                                onClick={() => handleRemoveFile(index)}
                                size="small"
                                color="error"
                              >
                                <Delete />
                              </IconButton>
                            }
                          >
                            <ListItemIcon>
                              <AttachFile />
                            </ListItemIcon>
                            <ListItemText
                              primary={file.name}
                              secondary={formatFileSize(file.size)}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
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
                ? "Updating Comment..."
                : "Creating..."
              : isEditMode
              ? "Update Comment"
              : "Create Ticket"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;
