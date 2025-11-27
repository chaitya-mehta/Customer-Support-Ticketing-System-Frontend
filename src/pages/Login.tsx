import {
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
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
import { login } from "../store/slices/authSlice";
import { ROLES } from "../types";

const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading } = useAppSelector((state) => state.auth);

  const validationSchema = Yup.object({
    email: Yup.string()
      .email(VALIDATION_MESSAGES.EMAIL.VALID)
      .required(VALIDATION_MESSAGES.EMAIL.REQUIRED),
    password: Yup.string()
      .min(6, VALIDATION_MESSAGES.PASSWORD.MIN_LENGTH)
      .required(VALIDATION_MESSAGES.PASSWORD.REQUIRED),
  });

  const getRedirectPath = (role: string) => {
    switch (role) {
      case ROLES.CUSTOMER:
        return "/dashboard";
      case ROLES.AGENT:
        return "/tickets";
      case ROLES.ADMIN:
        return "/admin-dashboard";
      default:
        return "/login";
    }
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      const result = await dispatch(login(values));

      if (login.fulfilled.match(result)) {
        toast.success(TOAST_MESSAGES.AUTH.LOGIN_SUCCESS);
        resetForm();

        const userRole = result.payload.user.role;

        const redirectPath = getRedirectPath(userRole);
        navigate(redirectPath);
      } else if (login.rejected.match(result)) {
        toast.error(result.payload as string);
      }
    },
  });

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
            Support Ticket System
          </Typography>

          <Typography
            variant="subtitle1"
            sx={{ mb: 3, textAlign: "center", color: "gray" }}
          >
            Login to your account
          </Typography>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              formik.handleSubmit();
            }}
          >
            <Stack spacing={2}>
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
                {isLoading ? <CircularProgress size={24} /> : "Login"}
              </Button>
            </Stack>
          </form>

          <Typography sx={{ mt: 2, textAlign: "center" }}>
            Don't have an account?{" "}
            <Link
              to="/register"
              style={{ textDecoration: "none", color: "#1976d2" }}
            >
              Register
            </Link>
          </Typography>
        </Card>
      </Box>
    </Container>
  );
};

export default Login;
