import {
  Add as AddIcon,
  Edit as EditIcon,
  ToggleOff,
  ToggleOn,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Chip,
  Container,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
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
import { ROLES, type User } from "../types";
import DataTable, { type Column } from "../components/DataTable";

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

  const [userModalOpen, setUserModalOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [page, setPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
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

  const userColumns: Column<User>[] = [
    {
      id: "name",
      label: "Name",
      width: 200,
      render: (user) => <Typography variant="body2">{user.name}</Typography>,
    },
    {
      id: "email",
      label: "Email",
      width: 300,
      render: (user) => <Typography variant="body2">{user.email}</Typography>,
    },
    {
      id: "role",
      label: "Role",
      width: 250,
      render: (user) => (
        <Chip
          label={user.role.toUpperCase()}
          color={getRoleColor(user.role)}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      id: "status",
      label: "Status",
      width: 200,
      render: (user) => (
        <Chip
          label={user.isActive ? "Active" : "Inactive"}
          color={user.isActive ? "success" : "default"}
          size="small"
        />
      ),
    },
    {
      id: "createdAt",
      label: "Created",
      width: 200,
      render: (user) => (
        <Typography variant="body2">
          {new Date(user.createdAt).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      id: "actions",
      label: "Actions",
      width: 150,
      render: (user: User) => (
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
          <Tooltip title={user.isActive ? "Deactivate user" : "Activate user"}>
            <span>
              <IconButton
                size="small"
                onClick={() => handleToggleStatus(user._id, user.isActive)}
                disabled={isLoading || user._id === currentUser?._id}
                color={user.isActive ? "success" : "default"}
              >
                {user.isActive ? (
                  <ToggleOn sx={{ fontSize: 32, color: "success.main" }} />
                ) : (
                  <ToggleOff sx={{ fontSize: 32, color: "text.disabled" }} />
                )}
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      ),
    },
  ];

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
      <DataTable
        columns={userColumns}
        data={users}
        isLoading={isLoading}
        emptyMessage="No users found"
        getRowKey={(user) => user._id}
        colSpan={6}
      />
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
