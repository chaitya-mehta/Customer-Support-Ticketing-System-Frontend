import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { addAgentComment, clearError, updateTicket } from "../store/slices/ticketSlice";

interface EditTicketModalProps {
  open: boolean;
  onClose: () => void;
  ticket: any;
  onSuccess: () => void;
}

const EditTicketModal: React.FC<EditTicketModalProps> = ({
  open,
  onClose,
  ticket,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.ticket);
  const { user } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    commentText: "",
    status: "",
  });

  useEffect(() => {
    if (ticket) {
      setFormData({
        commentText: "",
        status: ticket.status || "open",
      });
    }
  }, [ticket]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.commentText.trim()) {
      return;
    }

    const result = await dispatch(
      addAgentComment({
        id: ticket._id,
        commentText: formData.commentText.trim(),
        status: formData.status,
      })
    );

    if (updateTicket.fulfilled.match(result)) {
      onSuccess();
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      commentText: "",
      status: ticket?.status || "open",
    });
    dispatch(clearError());
    onClose();
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

  if (!ticket) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Update Ticket
        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 0.5 }}>
          #{ticket._id.slice(-8)}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3, p: 2, backgroundColor: "#f8f9fa", borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            {ticket.name}
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            sx={{ mb: 1 }}
            flexWrap="wrap"
            gap={1}
          >
            <Chip
              label={ticket.priority}
              color={getPriorityColor(ticket.priority)}
              size="small"
            />
            <Chip
              label={`Current: ${ticket.status}`}
              color={getStatusColor(ticket.status)}
              size="small"
              variant="outlined"
            />
            <Typography variant="body2" color="text.secondary">
              Category:{" "}
              {typeof ticket.category === "string"
                ? ticket.category
                : ticket.category?.name}
            </Typography>
          </Stack>

          <Typography variant="body2" sx={{ mt: 1 }}>
            {ticket.description}
          </Typography>
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

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <FormControl fullWidth>
              <InputLabel>Update Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                label="Update Status"
              >
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="in progress">In Progress</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
                {user.user?.role === "admin" && (
                  <MenuItem value="closed">Closed</MenuItem>
                )}
              </Select>
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

            <TextField
              fullWidth
              label="Add Comment *"
              name="commentText"
              multiline
              rows={4}
              value={formData.commentText}
              onChange={(e) =>
                setFormData({ ...formData, commentText: e.target.value })
              }
              required
              placeholder={
                user?.role === "agent"
                  ? "Add your comments about this ticket. You can mark it as resolved if the issue is fixed."
                  : "Add your comments and update the ticket status as needed."
              }
              error={formData.commentText.trim() === ""}
              helperText={
                formData.commentText.trim() === ""
                  ? "Comment is required"
                  : `${formData.commentText.length}/500 characters`
              }
              inputProps={{ maxLength: 500 }}
            />

            {ticket.agentComments && ticket.agentComments.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Previous Comments ({ticket.agentComments.length})
                </Typography>
                <Box
                  sx={{
                    maxHeight: 150,
                    overflow: "auto",
                    border: "1px solid #e0e0e0",
                    borderRadius: 1,
                    p: 1,
                  }}
                >
                  {ticket.agentComments
                    .slice(-3)
                    .map((comment: any, index: number) => (
                      <Box
                        key={index}
                        sx={{
                          mb: 1,
                          pb: 1,
                          borderBottom:
                            index < ticket.agentComments.slice(-3).length - 1
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
                        <Typography variant="caption" color="text.secondary">
                          {new Date(comment.commentedAt).toLocaleDateString()} •
                          {comment.statusChange &&
                            ` Status: ${comment.statusChange.from} → ${comment.statusChange.to}`}
                        </Typography>
                      </Box>
                    ))}
                </Box>
              </Box>
            )}
          </Stack>
        </form>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isLoading || !formData.commentText.trim()}
          startIcon={isLoading ? <CircularProgress size={16} /> : null}
        >
          {isLoading ? "Updating..." : "Update Ticket"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditTicketModal;
