import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Button,
  CircularProgress,
  Box,
  Alert,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  DialogTitle,
  Dialog,
  Stack,
  TextField,
  DialogContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  clearError,
  createTicket,
  getAllTickets,
  getTicketsByUser,
} from "../store/slices/ticketSlice";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Delete, AttachFile } from "@mui/icons-material";

// File validation constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
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
  const [attachments, setAttachments] = useState<File[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    if (user.role === "Customer") {
      dispatch(getTicketsByUser());
    } else {
      dispatch(getAllTickets());
    }
  }, [dispatch, user]);

  // Yup Validation Schema
  const validationSchema = Yup.object({
    name: Yup.string()
      .required("Title is required")
      .min(5, "Title must be at least 5 characters")
      .max(100, "Title must not exceed 100 characters"),
    description: Yup.string()
      .required("Description is required")
      .min(10, "Description must be at least 10 characters")
      .max(1000, "Description must not exceed 1000 characters"),
    category: Yup.string().required("Category is required"),
    priority: Yup.string()
      .oneOf(["low", "medium", "high"], "Invalid priority level")
      .required("Priority is required"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      category: "",
      priority: "medium" as "low" | "medium" | "high",
    },
    validationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const payload = {
          name: values.name,
          description: values.description,
          category: values.category,
          priority: values.priority,
          attachments: attachments.length > 0 ? attachments : undefined,
        };

        const result = await dispatch(createTicket(payload));

        if (createTicket.fulfilled.match(result)) {
          resetForm();
          setAttachments([]);
          setFileErrors([]);
          handleClose();

          if (user?.role === "Customer") {
            dispatch(getTicketsByUser());
          } else {
            dispatch(getAllTickets());
          }
        }
      } catch (error) {
        console.error("Error creating ticket:", error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    formik.resetForm();
    setAttachments([]);
    setFileErrors([]);
  };

  // File handling functions
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
        {user?.role === "Customer" && (
          <Button variant="contained" onClick={handleOpen}>
            Create Ticket
          </Button>
        )}
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
              <TableCell>Title</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: "center", py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: "center", py: 4 }}>
                  No tickets found
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((ticket: any) => (
                <TableRow key={ticket._id} hover>
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
                    <Button
                      size="small"
                      onClick={() => navigate(`/tickets/${ticket._id}`)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* CREATE TICKET DIALOG */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Create New Ticket</DialogTitle>
        <DialogContent>
          <form onSubmit={formik.handleSubmit}>
            <Stack spacing={3} sx={{ mt: 1 }}>
              {/* Title Field */}
              <TextField
                fullWidth
                label="Title *"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />

              {/* Description Field */}
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
              />

              {/* Category Field */}
              <FormControl
                fullWidth
                error={
                  formik.touched.category && Boolean(formik.errors.category)
                }
              >
                <InputLabel>Category *</InputLabel>
                <Select
                  name="category"
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Category *"
                >
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

              {/* Priority Field */}
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

              {/* FILE UPLOAD SECTION - SIMPLIFIED AND GUARANTEED TO SHOW */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Attachments
                </Typography>

                {/* File Error Alert */}
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

                {/* File Upload Button */}
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

                {/* File List - Always visible section */}
                <Box
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 1,
                    p: 2,
                    minHeight: 100,
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    Selected Files ({attachments.length})
                  </Typography>

                  {attachments.length === 0 ? (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontStyle: "italic" }}
                    >
                      No files selected. Click "Select Files" to add
                      attachments.
                    </Typography>
                  ) : (
                    <List dense>
                      {attachments.map((file, index) => (
                        <ListItem
                          key={index}
                          secondaryAction={
                            <IconButton
                              edge="end"
                              onClick={() => handleRemoveFile(index)}
                              size="small"
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
                  )}
                </Box>
              </Box>

              {/* Action Buttons */}
              <Stack
                direction="row"
                spacing={1}
                sx={{ justifyContent: "flex-end", pt: 2 }}
              >
                <Button onClick={handleClose}>Cancel</Button>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={isLoading || !formik.isValid}
                >
                  {isLoading ? <CircularProgress size={24} /> : "Create Ticket"}
                </Button>
              </Stack>
            </Stack>
          </form>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Dashboard;
