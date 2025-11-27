import {
  Add as AddIcon,
  Edit as EditIcon,
  ToggleOff,
  ToggleOn,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useFormik } from "formik";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  clearError,
  createCategory,
  getAllCategories,
  toggleCategoryStatus,
  updateCategory,
} from "../store/slices/categorySlice";
import { useDebounce } from "../utils/useDebounce";
import Pagination from "./Pagination";
import { DataTable, type Column } from "../components/DataTable";
import type { Category } from "../types";

const Categories: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    categories,
    isLoading,
    error,
    totalPages,
    totalRecords,
    pageSize = 2,
  } = useAppSelector((state) => state.category);

  const [page, setPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<boolean | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const categoryValidationSchema = Yup.object({
    name: Yup.string()
      .trim()
      .min(3, "Category name must be at least 3 characters")
      .required("Category name is required"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
    },
    validationSchema: categoryValidationSchema,
    onSubmit: async (values) => {
      if (modalMode === "add") {
        const result = await dispatch(
          createCategory({ name: values.name.trim() })
        );
        if (createCategory.fulfilled.match(result)) {
          toast.success("Category Added successfully!");
          handleCloseModal();
          handleFetchCategories(1);
        }
      } else if (modalMode === "edit" && editingCategory) {
        const result = await dispatch(
          updateCategory({
            id: editingCategory._id,
            name: values.name.trim(),
          })
        );
        if (updateCategory.fulfilled.match(result)) {
          toast.success("Category Updated successfully!");
          handleCloseModal();
        }
      }
    },
  });

  useEffect(() => {
    dispatch(
      getAllCategories({
        page: 1,
        limit: pageSize,
        search: debouncedSearchQuery,
        isActive: statusFilter,
      })
    );
  }, [debouncedSearchQuery, dispatch, pageSize, statusFilter]);

  const handleFetchCategories = (pageNumber: number) => {
    setPage(pageNumber);
    dispatch(
      getAllCategories({
        page: pageNumber,
        limit: pageSize,
        search: searchQuery,
        isActive: statusFilter,
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
    const filterValue = value === "" ? null : value === "true";
    setStatusFilter(filterValue);
    setPage(1);
    dispatch(
      getAllCategories({
        page: 1,
        limit: pageSize,
        search: searchQuery,
        isActive: filterValue,
      })
    );
  };

  const handleOpenAddModal = () => {
    setModalMode("add");
    setEditingCategory(null);
    formik.resetForm();
    setModalOpen(true);
  };

  const handleOpenEditModal = (category: any) => {
    setModalMode("edit");
    setEditingCategory(category);
    formik.setValues({ name: category.name });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingCategory(null);
    formik.resetForm();
  };
  const handlePageChange = (pageNumber: number) => {
    handleFetchCategories(pageNumber);
  };
  const handleToggleStatus = (categoryId: string, currentStatus: boolean) => {
    dispatch(
      toggleCategoryStatus({
        id: categoryId,
        isActive: !currentStatus,
      })
    );
    toast.success(
      !currentStatus
        ? "Category Activated Successfully!"
        : "Category Deactivated Successfully!"
    );
  };

  const getModalTitle = () => {
    return modalMode === "add" ? "Add New Category" : "Edit Category";
  };

  const getSubmitButtonText = () => {
    return isLoading ? (
      <CircularProgress size={24} />
    ) : modalMode === "add" ? (
      "Add Category"
    ) : (
      "Update Category"
    );
  };

  const isSubmitDisabled = () => {
    if (isLoading || !formik.values.name.trim()) return true;
    if (modalMode === "edit" && editingCategory) {
      return formik.values.name === editingCategory.name;
    }
    return false;
  };

  const categoryColumns: Column<Category>[] = [
    {
      id: "name",
      label: "Name",
      width: 300,
      render: (category) => (
        <Typography variant="body1" fontWeight="medium">
          {category.name}
        </Typography>
      ),
    },
    {
      id: "status",
      label: "Status",
      width: 200,
      render: (category) => (
        <Chip
          label={category.isActive ? "Active" : "Inactive"}
          color={category.isActive ? "success" : "error"}
          size="small"
        />
      ),
    },
    {
      id: "createdAt",
      label: "Created",
      width: 250,
      render: (category) => new Date(category.createdAt).toLocaleDateString(),
    },
    {
      id: "actions",
      label: "Actions",
      width: 250,
      render: (category) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip
            title={
              !category.isActive
                ? "Cannot edit inactive category"
                : "Edit category name"
            }
          >
            <span>
              <IconButton
                size="small"
                onClick={() => handleOpenEditModal(category)}
                disabled={!category.isActive || isLoading}
                color="primary"
              >
                <EditIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Button
            size="small"
            onClick={() => handleToggleStatus(category._id, category.isActive)}
            disabled={isLoading}
            color={category.isActive ? "warning" : "success"}
          >
            {category.isActive ? (
              <ToggleOn sx={{ fontSize: 32, color: "success.main" }} />
            ) : (
              <ToggleOff sx={{ fontSize: 32, color: "text.disabled" }} />
            )}
          </Button>
        </Stack>
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
        <Typography variant="h5">Categories</Typography>
        <Tooltip title="Add Category">
          <IconButton
            color="primary"
            onClick={handleOpenAddModal}
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
          placeholder="Search by name..."
          value={searchQuery}
          onChange={handleSearchChange}
          disabled={isLoading}
          size="small"
          sx={{ minWidth: 250 }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter === null ? "" : statusFilter.toString()}
            onChange={handleStatusFilterChange}
            label="Status"
            disabled={isLoading}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="true">Active</MenuItem>
            <MenuItem value="false">Inactive</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <DataTable
        columns={categoryColumns}
        data={categories}
        isLoading={isLoading}
        emptyMessage="No categories found"
        getRowKey={(category) => category._id}
        colSpan={4}
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

      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 0 }}>{getModalTitle()}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={formik.handleSubmit} noValidate>
            <TextField
              fullWidth
              label="Category Name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              required
              disabled={isLoading}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              margin="normal"
              sx={{ mb: 1 }}
            />

            {modalMode === "edit" &&
              editingCategory &&
              !editingCategory.isActive && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  This category is currently inactive. You can edit the name,
                  but it will remain inactive.
                </Alert>
              )}

            <Stack
              direction="row"
              spacing={2}
              sx={{ justifyContent: "flex-end", mt: 3 }}
            >
              <Button
                onClick={handleCloseModal}
                disabled={isLoading}
                variant="outlined"
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                type="submit"
                disabled={isSubmitDisabled() || !formik.isValid}
              >
                {getSubmitButtonText()}
              </Button>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Categories;
