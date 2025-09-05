import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../AuthContext";

function PageNotFound() {
  const { auth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const showAlert = async () => {
      const result = await Swal.fire({
        icon: "question",
        title: "Oops...",
        text: "It seems like you're lost.",
        confirmButtonText: "Return to previous page",
        allowOutsideClick: false
      });

      if (result.isConfirmed) {
        if (!auth.accessToken) {
          await navigate("/", { replace: true });
        } else if (auth.role === "user") {
          await navigate("/userPage", { replace: true });
        } else if (auth.role === "admin") {
          await navigate("/adminPage", { replace: true });
        }
      }
    };

    showAlert();
  }, [auth, navigate]);

  return <div></div>;
}

export default PageNotFound;
