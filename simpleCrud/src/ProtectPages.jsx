import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Swal from "sweetalert2";
const ProtectedRoute = ({ children, role }) => {
  const { auth } = useAuth();

  // Redirect to login page if not login
  if (!auth.accessToken) {
    return <Navigate to="/" replace />;
  }
  // Redirect to their respective page
  if (role && auth.role !== role) {
    Swal.fire({
      icon: "warning",
      title: "Oops...",
      text: "You don't have access there.",
    });
    if (auth.role === "admin") {
      return <Navigate to="/adminPage" replace />;
    }
    if (auth.role === "user") {
      return <Navigate to="/userPage" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
