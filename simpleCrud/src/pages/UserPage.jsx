import React, { useState, useEffect } from "react";
import EditModal from "../modals/EditModal";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../AuthContext";
import { TypingDotsLoader } from "react-loaderkit";
function UserPage() {
  const { auth } = useAuth();
  const { setAuth } = useAuth();
  const [users, setUsers] = useState([]);
  const [reload, setReload] = useState(false);
  const [fetchStatus, setFetchStatus] = useState(null);
  const [isLogOut, setLogout] = useState(false);
  const navigate = useNavigate();

  //handle fetch
  useEffect(() => {
    let ws;

    const fetchUser = async () => {
      setFetchStatus("fetching");
      try {
        const res = await fetch("http://localhost:5000/api/getUsers");
        if (!res.ok) {
          setFetchStatus("fetchFailed");
          return;
        }

        const data = await res.json();
        if (!data.results || data.results.length === 0) {
          setFetchStatus("empty");
        } else {
          setUsers(data.results);
          setFetchStatus(null);
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setFetchStatus("fetchFailed");
      }
    };

    // Initial fetch
    fetchUser();

    // Establish websocket connection
    ws = new WebSocket("ws://localhost:5000");

    ws.onopen = () => console.log("✅ WebSocket connected");

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "fetchUsers") {
        setUsers(msg.users);
        setFetchStatus(null);
      }

      if (
        msg.type === "userAdded" ||
        msg.type === "userUpdated" ||
        msg.type === "userDeleted"
      ) {
        fetchUser(); // Update data list
      }
    };

    ws.onclose = () => console.log(" WebSocket disconnected");

    return () => {
      if (ws) ws.close();
    };
  }, [reload]);

  const handleLogout = async () => {
    try {
      // Call backend to clear refresh token cookie
      const result = await fetch("http://localhost:5001/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // important if cookie is httpOnly
      });

      if (result.ok) {
        // Clear auth context / local state
        setAuth({ accessToken: null, role: null, user: null });
        setLogout(false);

        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error(error);
      return false; 
    }
  };

  useEffect(() => {
    if (!isLogOut) return;

    const showAlert = async () => {
      const result = await Swal.fire({
        icon: "question",
        title: "Are you sure you want to logout?",
        confirmButtonText: "Logout",
        showCancelButton: true,
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        // Show loading
        Swal.fire({
          title: "Logging out...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        try {
          const success = await handleLogout();

          Swal.close();

          if (success) {
            Swal.fire({
              icon: "success",
              title: "Logged out successfully",
              timer: 1500,
              showConfirmButton: false,
            });

            setTimeout(() => {
              navigate("/", { replace: true });
            }, 1500);
          } else {
            Swal.fire({
              icon: "error",
              title: "Logout failed",
              text: "Could not log you out. Please try again.",
            });
            setLogout(false);
          }
        } catch (error) {
          Swal.close(); // close loading
          Swal.fire({
            icon: "error",
            title: "Logout failed",
            text: error.message || "Something went wrong. Please try again.",
          });
          setLogout(false); // reset logout state if error happens
        }
      } else {
        setLogout(false); // reset if canceled
      }
    };

    showAlert();
  }, [isLogOut]);

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10; // show 5 users per page

  // Calculate indexes
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  //Calvulate total pages
  const totalPages = Math.ceil(users.length / usersPerPage);
  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center gap-5">
      <div className=" w-full bg-blue-400 flex flex-row px-10">
        <h1 className="w-full text-3xl text-center py-2 font-semibold text-white">
          User Page
        </h1>
        <button
          className="text-xl text-white hover:underline "
          onClick={() => setLogout(true)}
        >
          Logout
        </button>
      </div>
      <div className="w-full flex justify-start items-center px-10">
        <span className="text-2xl font-bold">User: {auth.userName}</span>
      </div>
      {/* fetch data */}
      <div className="p-2 w-full h-full bg-gray-200 flex items-center flex-col shadow-gray-600 shadow-2xl rounded-sm">
        <table className="min-w-full h-full  divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Firstname
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                lastName
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                isAdmin
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {fetchStatus === "empty" ? (
              <tr>
                <td colSpan={4} className="w-full text-center text-2xl">
                  No data yet.
                </td>
              </tr>
            ) : fetchStatus === "fetchFailed" ? (
              <tr>
                <td colSpan={4} className="w-full text-center">
                  <p className="text-3xl font-semibold">Failed to fetch 😕</p>
                  <p className="text-xl">Network error or server is down.</p>
                  <button
                    className="py-1 px-4 mt-6 rounded-sm bg-red-500 border-gray-900 border-2 hover:bg-red-700 text-white text-lg"
                    onClick={() => setReload(!reload)}
                  >
                    Retry
                  </button>
                </td>
              </tr>
            ) : fetchStatus === "fetching" ? (
              <tr>
                <td colSpan={4} className="text-2xl">
                  <div className="w-full flex justify-center items-center gap-2">
                    Fetching Data
                    <TypingDotsLoader size={40} color="#111825" speed={1} />
                  </div>
                </td>
              </tr>
            ) : fetchStatus === null ? (
              currentUsers.map((user, index) => (
                <tr key={index} className="hover:bg-gray-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.userName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.isAdmin ? (
                        <p className="text-green-500">Admin</p>
                      ) : (
                        <p className="text-red-500">Not admin</p>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : null}
          </tbody>
        </table>
        {/* pagination */}

        <div className="w-full bg-white p-2 flex justify-center items-center gap-2 mt-2">
          {fetchStatus === null && (
            <>
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="hover:underline disabled:opacity-50"
              >
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  style={{
                    padding: "5px 10px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    background: currentPage === i + 1 ? "blue" : "lightgray",
                    color: currentPage === i + 1 ? "white" : "black",
                    cursor: "pointer",
                  }}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="hover:underline disabled:opacity-50"
              >
                Next
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserPage;
