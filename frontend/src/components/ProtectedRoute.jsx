import React from "react";
import { Navigate } from "react-router-dom";
import { AUTH_NOTICE, clearAuthData, getTokenExpiryMs } from "../utils/authSession";

const roleHome = {
  Student: "/student",
  Teacher: "/teacher",
  Parent: "/parent",
  Principal: "/principal",
  Admin: "/admin/dashboard",
  SuperAdmin: "/super-admin/overview",
};

const ProtectedRoute = ({ allowedRoles, children }) => {
  const token = localStorage.getItem("token");
  const userType = localStorage.getItem("userType");

  if (!token || !userType) {
    return <Navigate to="/" replace />;
  }

  const expiryMs = getTokenExpiryMs(token);
  if (!expiryMs || expiryMs <= Date.now()) {
    clearAuthData({ clearAllLocalStorage: true });
    return <Navigate to="/" replace state={{ authNotice: AUTH_NOTICE.EXPIRED }} />;
  }

  if (Array.isArray(allowedRoles) && !allowedRoles.includes(userType)) {
    return <Navigate to={roleHome[userType] || "/"} replace />;
  }

  return children;
};

export default ProtectedRoute;
