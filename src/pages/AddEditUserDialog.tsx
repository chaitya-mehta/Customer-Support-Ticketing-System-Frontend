import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { useAppDispatch } from "../hooks";
import { register, type RegisterPayload } from "../store/slices/authSlice";
import { updateUser, type User } from "../store/slices/userSlice";

interface AddEditUserDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onUserUpdated: () => void;
}

const AddEditUserDialog: React.FC<AddEditUserDialogProps> = ({
  open,
  onClose,
  user,
  onUserUpdated,
}) => {
  const dispatch = useAppDispatch();
  const isEditMode = Boolean(user);
  const [error, setError] = useState<string>("");

  const addUserValidationSchema = Yup.object({
    name: Yup.string()
      .trim()
      .min(3, "Full Name must be at least 3 characters")
      .required("Full Name is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    role: Yup.string().required("Role is required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(/[0-9]/, "Password must contain at least one number")
      .matches(
        /[@$!%*?&#]/,
        "Password must contain at least one special character"
      )
      .required("Password is required"),
    isActive: Yup.boolean(),
  });

  const editUserValidationSchema = Yup.object({
    name: Yup.string()
      .trim()
      .min(3, "Full Name must be at least 3 characters")
      .required("Full Name is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    role: Yup.string().required("Role is required"),
    password: Yup.string().notRequired(),
    isActive: Yup.boolean(),
  });

  const validationSchema = isEditMode
    ? editUserValidationSchema
    : addUserValidationSchema;

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      role: "",
      password: "",
      isActive: true,
    },
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setError("");

      try {
        if (isEditMode && user) {
          const result = await dispatch(
            updateUser({
              id: user._id,
              userData: {
                name: values.name.trim(),
              },
            })
          );

          if (updateUser.fulfilled.match(result)) {
            toast.success("User Updated successfully!");
            onUserUpdated();
            onClose();
          } else if (updateUser.rejected.match(result)) {
            setError((result.payload as string) || "Failed to update user");
          }
        } else {
          const payload: RegisterPayload = {
            name: values.name.trim(),
            email: values.email.trim(),
            password: values.password,
            role: values.role as RegisterPayload["role"],
          };

          const result = await dispatch(register(payload));

          if (register.fulfilled.match(result)) {
            toast.success("New User Added successfully!");
            onUserUpdated();
            onClose();
          } else if (register.rejected.match(result)) {
            setError((result.payload as string) || "Failed to create user");
          }
        }
      } catch (err) {
        setError("An error occurred while processing your request");
      }
    },
  });

  useEffect(() => {
    if (open) {
      if (user) {
        formik.setValues({
          name: user.name || "",
          email: user.email || "",
          role: user.role || "",
          password: "",
          isActive: user.isActive !== undefined ? user.isActive : true,
        });
      } else {
        formik.resetForm();
        formik.setValues({
          name: "",
          email: "",
          role: "",
          password: "",
          isActive: true,
        });
      }
      setError("");
    }
  }, [open, user]);

  const handleClose = () => {
    setError("");
    formik.resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 0 }}>
        {isEditMode ? `Edit User - ${user?.name}` : "Add New User"}
      </DialogTitle>
      <form onSubmit={formik.handleSubmit} noValidate>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              disabled={formik.isSubmitting}
            />

            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              disabled={formik.isSubmitting || isEditMode}
              InputProps={{
                readOnly: isEditMode,
              }}
            />

            <TextField
              select
              fullWidth
              label="Role"
              name="role"
              value={formik.values.role}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.role && Boolean(formik.errors.role)}
              helperText={formik.touched.role && formik.errors.role}
              disabled={formik.isSubmitting || isEditMode}
            >
              <MenuItem value="">Select Role</MenuItem>
              <MenuItem value="customer">Customer</MenuItem>
              <MenuItem value="agent">Support Agent</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>

            {!isEditMode && (
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.password && Boolean(formik.errors.password)
                }
                helperText={formik.touched.password && formik.errors.password}
                disabled={formik.isSubmitting}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={formik.isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? (
              <CircularProgress size={24} />
            ) : isEditMode ? (
              "Update User"
            ) : (
              "Create User"
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddEditUserDialog;
