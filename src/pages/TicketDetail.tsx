import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import type React from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import { clearError, getTicketById } from "../store/slices/ticketSlice";

const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { currentTicket, isLoading, error } = useAppSelector(
    (state) => state.ticket
  );
  // const { user } = useAppSelector((state) => state.auth);
  // const [comment, setComment] = useState("");

  useEffect(() => {
    if (id) {
      dispatch(getTicketById(id));
    }
  }, [dispatch, id]);

  // const handleAddComment = async () => {
  //   if (comment.trim() && id) {
  //     const result = await dispatch(
  //       addAgentComment({ id, commentText: comment })
  //     );
  //     if (addAgentComment.fulfilled.match(result)) {
  //       setComment("");
  //     }
  //   }
  // };

  if (isLoading && !currentTicket) {
    return (
      <Container
        maxWidth="lg"
        sx={{ display: "flex", justifyContent: "center", py: 4 }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (!currentTicket) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Ticket not found</Alert>
        <Button onClick={() => window.history.back()} sx={{ mt: 2 }}>
          Back to Tickets
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button onClick={() => window.history.back()} sx={{ mb: 2 }}>
        Back to Tickets
      </Button>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => dispatch(clearError())}
        >
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
                {currentTicket.name}
              </Typography>

              <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <Chip
                  label={currentTicket.priority}
                  color={
                    currentTicket.priority === "high" ? "error" : "default"
                  }
                  size="small"
                />
                <Chip
                  label={currentTicket.status}
                  color={
                    currentTicket.status === "open" ? "warning" : "success"
                  }
                  size="small"
                />
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold" }}>
                Description
              </Typography>
              <Typography
                variant="body2"
                sx={{ mb: 3, whiteSpace: "pre-wrap" }}
              >
                {currentTicket.description}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                User Comment
              </Typography>
              {!currentTicket.commentText ||
              currentTicket.commentText.trim() === "" ? (
                <Typography variant="body2" sx={{ color: "gray", mb: 2 }}>
                  No user comments yet
                </Typography>
              ) : (
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="body2">
                    {currentTicket.commentText}
                  </Typography>
                </Paper>
              )}
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                Agent Comments
              </Typography>
              {currentTicket.agentComments.length === 0 ? (
                <Typography variant="body2" sx={{ color: "gray", mb: 2 }}>
                  No agent comments yet
                </Typography>
              ) : (
                currentTicket.agentComments.map((comment: any, index: any) => (
                  <Paper
                    key={index}
                    sx={{ p: 2, mb: 2, backgroundColor: "#f5f5f5" }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: "bold", mb: 1 }}
                    >
                      Agent • {new Date(comment.commentedAt).toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      {comment.commentText}
                    </Typography>
                  </Paper>
                ))
              )}

              {/* {user.user?.role === "agent" && (
                <Box sx={{ mt: 3 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Add a comment as agent..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddComment}
                    disabled={!comment.trim() || isLoading}
                  >
                    {isLoading ? (
                      <CircularProgress size={24} />
                    ) : (
                      "Add Comment as Agent"
                    )}
                  </Button>
                </Box>
              )} */}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                Details
              </Typography>

              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Category:</strong>{" "}
                {typeof currentTicket.category === "string"
                  ? currentTicket.category
                  : currentTicket.category?.name}
              </Typography>

              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Created:</strong>{" "}
                {new Date(currentTicket.createdAt).toLocaleString()}
              </Typography>

              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Updated:</strong>{" "}
                {new Date(currentTicket.updatedAt).toLocaleString()}
              </Typography>

              {currentTicket.attachments.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: "bold", mb: 1 }}
                  >
                    Attachments ({currentTicket.attachments.length})
                  </Typography>
                  {currentTicket.attachments.map(
                    (attachment: any, index: any) => (
                      <Typography
                        key={index}
                        variant="body2"
                        sx={{ mb: 0.5, color: "#1976d2" }}
                      >
                        📎 {attachment.filename}
                      </Typography>
                    )
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TicketDetail;
