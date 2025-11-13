import type React from "react";
import { useEffect, useState } from "react";
import {
  Container,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Stack,
  CircularProgress,
  Alert,
  Box,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Edit as EditIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  getAllCategories,
  createCategory,
  toggleCategoryStatus,
  clearError,
  updateCategory,
} from "../store/slices/categorySlice";

const Categories: React.FC = () => {
  const dispatch = useAppDispatch();
  const { categories, isLoading, error } = useAppSelector(
    (state) => state.category
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [name, setName] = useState("");
  const [editingCategory, setEditingCategory] = useState<any>(null);

  useEffect(() => {
    dispatch(getAllCategories());
  }, [dispatch]);

  const handleOpenAddModal = () => {
    setModalMode("add");
    setName("");
    setEditingCategory(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (category: any) => {
    setModalMode("edit");
    setEditingCategory(category);
    setName(category.name);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setName("");
    setEditingCategory(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (modalMode === "add") {
      const result = await dispatch(createCategory({ name }));
      if (createCategory.fulfilled.match(result)) {
        handleCloseModal();
      }
    } else if (modalMode === "edit" && editingCategory) {
      const result = await dispatch(
        updateCategory({
          id: editingCategory._id,
          name: name,
        })
      );

      if (updateCategory.fulfilled.match(result)) {
        handleCloseModal();
      }
    }
  };

  const handleToggleStatus = (categoryId: string, currentStatus: boolean) => {
    dispatch(
      toggleCategoryStatus({
        id: categoryId,
        isActive: !currentStatus,
      })
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
    if (isLoading || !name.trim()) return true;
    if (modalMode === "edit" && editingCategory) {
      return name === editingCategory.name;
    }
    return false;
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
        <Typography variant="h5">Categories</Typography>
        <Button variant="contained" onClick={handleOpenAddModal}>
          Add Category
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Created</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  sx={{ textAlign: "center", py: 4, height: 100 }}
                >
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} sx={{ textAlign: "center", py: 4 }}>
                  No categories found
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category: any) => (
                <TableRow key={category._id} hover>
                  <TableCell>
                    <Typography variant="body1" fontWeight="medium">
                      {category.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={category.isActive ? "Active" : "Inactive"}
                      color={category.isActive ? "success" : "error"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(category.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
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
                        onClick={() =>
                          handleToggleStatus(category._id, category.isActive)
                        }
                        disabled={isLoading}
                        color={category.isActive ? "warning" : "success"}
                      >
                        {category.isActive ? (
                          <ToggleOnIcon
                            sx={{ fontSize: 32, color: "success.main" }}
                          />
                        ) : (
                          <ToggleOffIcon
                            sx={{ fontSize: 32, color: "text.disabled" }}
                          />
                        )}
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 0 }}>{getModalTitle()}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Category Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
              error={!name.trim() && name.length > 0}
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
                disabled={isSubmitDisabled()}
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
