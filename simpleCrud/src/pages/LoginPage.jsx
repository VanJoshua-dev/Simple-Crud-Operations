import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { TypingDotsLoader } from "react-loaderkit";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
function LoginPage() {
  const [username, setUsername] = useState("");
  const [lastname, setLastname] = useState("");
  const [loading, setLoading] = useState(null);
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  //handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading("login");

    try {
      const res = await fetch("http://localhost:5001/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, lastname }),
        credentials: "include",
      });

      const data = await res.json(); 

      if (res.ok) {
        await Swal.fire({
          title: "Login Successfully.",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
          didClose: () => {
            setAuth({ accessToken: data.accessToken, role: data.role, userName: data.user.userName });
            if (data.role === "admin") {
              navigate("/adminPage");
            } else {
              navigate("/userPage");
            }
          },
        });

        setUsername("");
        setLastname("");
      } else {
        await Swal.fire({
          icon: "error",
          title: "Opss..",
          text: data.error || "Something went wrong!",
        });
      }
    } catch (error) {
      console.error("Something went wrong...", error);
      await Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Network error or server is down!",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col  items-center gap-5">
      <h1 className="text-3xl w-full bg-blue-400 text-center py-2 font-semibold text-white">
        Welcome to Simple Crud
      </h1>
      <div className="p-2 min-w-90 bg-gray-200 flex justify-center items-center flex-col shadow-gray-600 shadow-lg rounded-sm">
        <h1 className="bg-gray-500 w-full text-center text-white text-2xl">
          Login Here
        </h1>
        <form onSubmit={handleLogin} className="w-full flex flex-col gap-3">
          <div className="flex flex-col">
            <label htmlFor="username">Username</label>
            <input
              className="border-gray-500 border-2 px-1 py-1 rounded-sm"
              type="text"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="lastname">Lastname</label>
            <input
              className="border-gray-500 border-2 px-1 py-1 rounded-sm"
              type="text"
              name="lastame"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 w-full rounded-sm py-2 text-white hover:bg-blue-700"
          >
            {loading === "login" ? (
              <span className="flex justify-center items-center gap-2">
                Logging in
                <TypingDotsLoader size={40} color="white" speed={1} />
              </span>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
