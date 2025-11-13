import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  Alert,
  Typography,
} from "@mui/material";
import { useAppDispatch } from "../hooks";
import { updateUser, type User } from "../store/slices/userSlice";
import * as yup from "yup";

interface EditUserDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onUserUpdated: () => void;
}

// Yup validation schema
const userValidationSchema = yup.object({
  name: yup
    .string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must not exceed 50 characters")
    .matches(/^[a-zA-Z\s]*$/, "Name can only contain letters and spaces")
    .trim(),
});

const EditUserDialog: React.FC<EditUserDialogProps> = ({
  open,
  onClose,
  user,
  onUserUpdated,
}) => {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "customer" as User["role"],
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "customer",
        isActive: user.isActive !== undefined ? user.isActive : true,
      });
    }
    // Clear validation errors when user changes
    setValidationErrors({});
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const validateForm = async (): Promise<boolean> => {
    try {
      await userValidationSchema.validate(formData, { abortEarly: false });
      setValidationErrors({});
      return true;
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const errors: { [key: string]: string } = {};
        error.inner.forEach((err) => {
          if (err.path) {
            errors[err.path] = err.message;
          }
        });
        setValidationErrors(errors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const isValid = await validateForm();
    if (!isValid) return;

    setLoading(true);
    setError("");

    try {
      const result = await dispatch(
        updateUser({
          id: user._id,
          userData: {
            name: formData.name.trim(),
          },
        })
      );

      if (updateUser.fulfilled.match(result)) {
        onUserUpdated();
        onClose();
      } else if (updateUser.rejected.match(result)) {
        setError((result.payload as string) || "Failed to update user");
      }
    } catch (err) {
      setError("An error occurred while updating user");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    setValidationErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit User - {user?.name}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              fullWidth
              error={!!validationErrors.name}
              helperText={validationErrors.name || "Enter the user's full name"}
              disabled={loading}
            />

            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              disabled
              fullWidth
              helperText="Email cannot be changed"
            />

            <FormControl fullWidth disabled>
              <InputLabel>Role</InputLabel>
              <Select name="role" value={formData.role} label="Role">
                <MenuItem value="customer">Customer</MenuItem>
                <MenuItem value="agent">Agent</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ ml: 2 }}
              >
                Role cannot be changed
              </Typography>
            </FormControl>

            {/* <FormControlLabel
              control={
                <Switch
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleSwitchChange}
                  color="primary"
                  disabled={loading}
                />
              }
              label="Active User"
            /> */}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Updating..." : "Update User"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditUserDialog;
