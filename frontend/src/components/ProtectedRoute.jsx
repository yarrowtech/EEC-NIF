import React from "react";
import { Navigate } from "react-router-dom";

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

  if (Array.isArray(allowedRoles) && !allowedRoles.includes(userType)) {
    return <Navigate to={roleHome[userType] || "/"} replace />;
  }

  return children;
};

export default ProtectedRoute;
