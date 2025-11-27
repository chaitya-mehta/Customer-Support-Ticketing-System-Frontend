import React from "react";
import { Navigate } from "react-router-dom";
import { getUserRole } from "../utils/authHelpers";
import { STORAGE_KEYS } from "../constants";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  const role = getUserRole();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role ?? "")) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
