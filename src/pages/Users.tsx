import React, { useEffect, useState } from "react";
import {
  Container,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Box,
  Typography,
  Tooltip,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  getAllUsers,
  clearError,
  toggleUserStatus,
} from "../store/slices/userSlice";
import {
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import EditUserDialog from "./EditUserDialog";

const Users: React.FC = () => {
  const dispatch = useAppDispatch();
  const { users, isLoading, error } = useAppSelector((state) => state.user);
  const { user: currentUser } = useAppSelector((state) => state.auth);

  // State for edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  useEffect(() => {
    dispatch(getAllUsers(1));
  }, [dispatch]);

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    const result = await dispatch(
      toggleUserStatus({
        id: userId,
        isActive: !currentStatus,
      })
    );

    if (toggleUserStatus.fulfilled.match(result)) {
      dispatch(getAllUsers(1));
    }
  };

  // Edit user handlers
  const handleEditClick = (user: any) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setSelectedUser(null);
  };

  const handleUserUpdated = () => {
    // Refresh the users list after update
    dispatch(getAllUsers(1));
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "error";
      case "agent":
        return "warning";
      case "customer":
        return "success";
      default:
        return "default";
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "success" : "default";
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
        <Typography variant="h5">Users Management</Typography>
        <Typography variant="body2" color="text.secondary">
          Total Users: {users.length}
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Role</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Created</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: "center", py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No users found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user: any) => (
                <TableRow key={user._id} hover>
                  <TableCell>
                    <Typography variant="body2">{user.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{user.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.role.toUpperCase()}
                      color={getRoleColor(user.role)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive ? "Active" : "Inactive"}
                      color={getStatusColor(user.isActive)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {/* Edit Button */}
                      <Tooltip title="Edit user">
                        <IconButton
                          size="small"
                          onClick={() => handleEditClick(user)}
                          disabled={isLoading}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>

                      {/* Toggle Status Button */}
                      <Tooltip
                        title={
                          user.isActive ? "Deactivate user" : "Activate user"
                        }
                      >
                        <span>
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleToggleStatus(user._id, user.isActive)
                            }
                            disabled={
                              isLoading || user._id === currentUser?._id
                            }
                            color={user.isActive ? "success" : "default"}
                          >
                            {user.isActive ? (
                              <ToggleOnIcon
                                sx={{ fontSize: 32, color: "success.main" }}
                              />
                            ) : (
                              <ToggleOffIcon
                                sx={{ fontSize: 32, color: "text.disabled" }}
                              />
                            )}
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>

                    {user._id === currentUser?._id && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        Cannot deactivate yourself
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit User Dialog */}
      <EditUserDialog
        open={editDialogOpen}
        onClose={handleEditClose}
        user={selectedUser}
        onUserUpdated={handleUserUpdated}
      />
    </Container>
  );
};

export default Users;
