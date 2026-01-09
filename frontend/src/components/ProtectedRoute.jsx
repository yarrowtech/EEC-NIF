import React from "react";
import { Navigate } from "react-router-dom";

const roleHome = {
  Student: "/dashboard",
  Teacher: "/teachers",
  Parent: "/parents",
  Admin: "/admin/dashboard",
};

const ProtectedRoute = ({ allowedRoles, children }) => {
  const token = localStorage.getItem("token");
  const userType = localStorage.getItem("userType");

  if (!token || !userType) {
    return <Navigate to="/" replace />;
  }

  if (userType === "Admin") {
    return children;
  }

  if (Array.isArray(allowedRoles) && !allowedRoles.includes(userType)) {
    return <Navigate to={roleHome[userType] || "/"} replace />;
  }

  return children;
};

export default ProtectedRoute;
