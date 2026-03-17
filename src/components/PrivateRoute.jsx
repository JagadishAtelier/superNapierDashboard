import { Navigate, Outlet } from "react-router-dom";
import {jwtDecode} from "jwt-decode"; // npm install jwt-decode

export default function PrivateRoute() {
  const token = localStorage.getItem("token");

  if (!token) {
    // No token → redirect to login
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    // 1️⃣ Check expiry
    if (decoded.exp && decoded.exp < currentTime) {
      localStorage.removeItem("token");
      return <Navigate to="/login" replace />;
    }

    // 2️⃣ Check role
    if (!decoded.role || decoded.role !== "admin") {
      // Not an admin → send to login or "access denied" page
      return <Navigate to="/login" replace />;
      // or <Navigate to="/not-authorized" replace />;
    }

    // ✅ Valid token & admin role → allow access
    return <Outlet />;

  } catch (error) {
    console.error("Invalid token:", error);
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }
}
