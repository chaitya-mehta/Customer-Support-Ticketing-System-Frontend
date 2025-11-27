import {
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useFormik } from "formik";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { TOAST_MESSAGES, VALIDATION_MESSAGES } from "../constants";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  clearError,
  register,
  type RegisterPayload,
} from "../store/slices/authSlice";

const Register: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const validationSchema = Yup.object({
    name: Yup.string()
      .trim()
      .min(3, VALIDATION_MESSAGES.NAME.MIN_LENGTH)
      .required(VALIDATION_MESSAGES.NAME.REQUIRED),
    email: Yup.string()
      .email(VALIDATION_MESSAGES.EMAIL.INVALID)
      .required(VALIDATION_MESSAGES.EMAIL.REQUIRED),
    role: Yup.string().required(VALIDATION_MESSAGES.ROLE.REQUIRED),
    password: Yup.string()
      .min(8, VALIDATION_MESSAGES.PASSWORD.MIN_LENGTH_8)
      .matches(/[A-Z]/, VALIDATION_MESSAGES.PASSWORD.UPPERCASE)
      .matches(/[a-z]/, VALIDATION_MESSAGES.PASSWORD.LOWERCASE)
      .matches(/[0-9]/, VALIDATION_MESSAGES.PASSWORD.NUMBER)
      .matches(
        /[@$!%*?&#]/,
        VALIDATION_MESSAGES.PASSWORD.SPECIAL_CHAR
      )
      .required(VALIDATION_MESSAGES.PASSWORD.REQUIRED),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      role: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      const payload: RegisterPayload = {
        ...values,
        role: values.role as RegisterPayload["role"],
      };
      const result = await dispatch(register(payload));

      if (register.fulfilled.match(result)) {
        toast.success(TOAST_MESSAGES.AUTH.REGISTER_SUCCESS);
        resetForm();
        setTimeout(() => navigate("/dashboard"), 1500);
      } else if (register.rejected.match(result)) {
        toast.error(result.payload as string);
      }
    },
  });

  React.useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Card sx={{ p: 4, width: "100%" }}>
          <Typography
            variant="h4"
            sx={{ mb: 3, textAlign: "center", fontWeight: "bold" }}
          >
            Create Account
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ mb: 3, textAlign: "center", color: "gray" }}
          >
            Join our support system
          </Typography>

          <form onSubmit={formik.handleSubmit} noValidate>
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
                disabled={isLoading}
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
                disabled={isLoading}
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
                disabled={isLoading}
              >
                <MenuItem value="">Select Role</MenuItem>
                <MenuItem value="customer">Customer</MenuItem>
                <MenuItem value="agent">Support Agent</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </TextField>
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
                disabled={isLoading}
              />
              <Button
                fullWidth
                variant="contained"
                size="large"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : "Register"}
              </Button>
            </Stack>
          </form>

          <Typography sx={{ mt: 2, textAlign: "center" }}>
            Already have an account?{" "}
            <Link
              to="/login"
              style={{ textDecoration: "none", color: "#1976d2" }}
            >
              Login
            </Link>
          </Typography>
        </Card>
      </Box>
    </Container>
  );
};

export default Register;
