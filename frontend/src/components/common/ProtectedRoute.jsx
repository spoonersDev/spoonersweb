import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { hasActiveSubscription, isAdmin, isAuthenticated } from "../../utils/auth";

export default function ProtectedRoute({ requirePaid = false, requireAdmin = false, loginPath = "/login" }) {
	if (!isAuthenticated()) {
		return <Navigate to={loginPath} replace />;
	}

	if (requireAdmin && !isAdmin()) {
		return <Navigate to="/" replace />;
	}

	if (requirePaid && !hasActiveSubscription()) {
		return <Navigate to="/" replace />;
	}

	return <Outlet />;
}
