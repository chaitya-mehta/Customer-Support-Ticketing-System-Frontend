import {
  Add as AddIcon,
  Edit as EditIcon,
  ToggleOff as ToggleOffIcon,
  ToggleOn as ToggleOnIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  clearError,
  getAllUsers,
  toggleUserStatus,
} from "../store/slices/userSlice";
import { useDebounce } from "../utils/useDebounce";
import AddEditUserDialog from "./AddEditUserDialog";
import Pagination from "./Pagination";
import { ROLES } from "../types";

const Users: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    users,
    isLoading,
    error,
    totalPages,
    pageSize = 5,
    totalRecords,
  } = useAppSelector((state) => state.user);
  const { user: currentUser } = useAppSelector((state) => state.auth);

  const [userModalOpen, setUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<boolean | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    handleFetchUsers(1);
  }, [debouncedSearchQuery, roleFilter, statusFilter]);

  const handleFetchUsers = (pageNumber: number) => {
    setPage(pageNumber);
    dispatch(
      getAllUsers({
        page: pageNumber,
        limit: pageSize,
        search: debouncedSearchQuery,
        role: roleFilter,
        isActive: statusFilter,
      })
    );
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setPage(1);
  };

  const handleRoleFilterChange = (e: any) => {
    const value = e.target.value;
    setRoleFilter(value);
    setPage(1);
  };
  const handlePageChange = (pageNumber: number) => {
    handleFetchUsers(pageNumber);
  };
  const handleStatusFilterChange = (e: any) => {
    const value = e.target.value;
    const filterValue = value === "" ? null : value === "true";
    setStatusFilter(filterValue);
    setPage(1);
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    const result = await dispatch(
      toggleUserStatus({
        id: userId,
        isActive: !currentStatus,
      })
    );

    if (toggleUserStatus.fulfilled.match(result)) {
      toast.success(
        `User has been ${
          !currentStatus ? "activated" : "deactivated"
        } successfully`
      );
      handleFetchUsers(page);
    }
  };

  const handleAddClick = () => {
    setSelectedUser(null);
    setUserModalOpen(true);
  };

  const handleEditClick = (user: any) => {
    setSelectedUser(user);
    setUserModalOpen(true);
  };

  const handleModalClose = () => {
    setUserModalOpen(false);
    setSelectedUser(null);
  };

  const handleUserUpdated = () => {
    handleFetchUsers(page);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case ROLES.ADMIN:
        return "error";
      case ROLES.AGENT:
        return "warning";
      case ROLES.CUSTOMER:
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
        <Tooltip title="Add New User">
          <IconButton
            color="primary"
            onClick={handleAddClick}
            disabled={isLoading}
            sx={{
              backgroundColor: "primary.main",
              color: "white",
              "&:hover": {
                backgroundColor: "primary.dark",
              },
              "&:disabled": {
                backgroundColor: "action.disabled",
              },
            }}
          >
            <AddIcon />
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
      <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <TextField
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={handleSearchChange}
          disabled={isLoading}
          size="small"
          sx={{ minWidth: 250 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Role</InputLabel>
          <Select
            value={roleFilter}
            onChange={handleRoleFilterChange}
            label="Role"
            disabled={isLoading}
          >
            <MenuItem value="">All Roles</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="agent">Agent</MenuItem>
            <MenuItem value="customer">Customer</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter === null ? "" : statusFilter.toString()}
            onChange={handleStatusFilterChange}
            label="Status"
            disabled={isLoading}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="true">Active</MenuItem>
            <MenuItem value="false">Inactive</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell width={200} sx={{ fontWeight: "bold" }}>
                Name
              </TableCell>
              <TableCell width={300} sx={{ fontWeight: "bold" }}>
                Email
              </TableCell>
              <TableCell width={250} sx={{ fontWeight: "bold" }}>
                Role
              </TableCell>
              <TableCell width={200} sx={{ fontWeight: "bold" }}>
                Status
              </TableCell>
              <TableCell width={200} sx={{ fontWeight: "bold" }}>
                Created
              </TableCell>
              <TableCell width={150} sx={{ fontWeight: "bold" }}>
                Actions
              </TableCell>
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
      <AddEditUserDialog
        open={userModalOpen}
        onClose={handleModalClose}
        user={selectedUser}
        onUserUpdated={handleUserUpdated}
      />
    </Container>
  );
};

export default Users;
