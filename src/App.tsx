import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { useAppDispatch, useAppSelector } from "./hooks";
import { getCurrentUser } from "./store/slices/authSlice";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Tickets from "./pages/Tickets";
import TicketDetail from "./pages/TicketDetail";
import Categories from "./pages/Categories";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import { ROLES } from "./types";
import Users from "./pages/Users";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function AppContent() {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, token]);

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* <Route path="/unauthorized" element={<Unauthorized />} /> */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={[ROLES.ADMIN, ROLES.AGENT, ROLES.CUSTOMER]}
            >
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Common routes (Dashboard, Tickets) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.AGENT]}>
                <Tickets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets/:id"
            element={
              <ProtectedRoute
                allowedRoles={[ROLES.ADMIN, ROLES.AGENT, ROLES.CUSTOMER]}
              >
                <TicketDetail />
              </ProtectedRoute>
            }
          />

          {/* Active categories accessible to all */}
          {/* <Route
            path="/active-categories"
            element={
              <ProtectedRoute
                allowedRoles={[ROLES.ADMIN, ROLES.AGENT, ROLES.CUSTOMER]}
              >
                <ActiveCategories />
              </ProtectedRoute>
            }
          /> */}

          {/* Admin-only routes */}
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <Categories />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <AppContent />
        </Router>
      </ThemeProvider>
    </Provider>
  );
}
