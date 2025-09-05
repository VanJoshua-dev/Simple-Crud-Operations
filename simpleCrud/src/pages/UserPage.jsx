import React, { useState, useEffect } from "react";
import EditModal from "../modals/EditModal";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../AuthContext";
import { TypingDotsLoader } from "react-loaderkit";
function UserPage() {
  const {auth} = useAuth();
  const {setAuth} = useAuth();
  const [users, setUsers] = useState([]);
  const [reload, setReload] = useState(false);
  const [fetchStatus, setFetchStatus] = useState(null);
  const [isLogOut, setLogout] = useState(false);
  const navigate = useNavigate();
  //Refresh data every 30 seconds
  const [seconds, setSeconds] = useState(30);
  useEffect(() => {
    if (seconds === 0) {
      console.log("Refreshing data...");
      setSeconds(30); // reset timer
      setReload((prev) => !prev);
      return;
    }
    let interval;
    if (fetchStatus != "fetching" || fetchStatus === "fetchFailed") {
      interval = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else {
      setSeconds(30);
    }

    return () => clearInterval(interval);
  }, [seconds, fetchStatus]);

  //handle fetch
  useEffect(() => {
    setFetchStatus("fetching");
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/getUsers");

        if (!res.ok) {
          setFetchStatus("fetchFailed");
          return;
        }

        const data = await res.json();
        console.log("Server response:", data);

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

    fetchUser();
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
  
          // Redirect to login
          navigate("/", { replace: true });
        }
      } catch (error) {
        console.error(error);
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
          handleLogout();
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
      <div className="w-full flex justify-between items-center px-10">
        <span className="text-2xl font-bold">User: {" "} {auth.userName}</span>
        {fetchStatus === "fetching" ? (
          <span className="flex justify-center items-center gap-2">
            Refreshing <TypingDotsLoader size={30} color="black" />
          </span>
        ) : fetchStatus === "fetchFailed" ? (
          <span className="flex justify-center items-center gap-2">
            Fetch failed, retrying in{" "}
            <span
              className={`font-bold ${
                seconds <= 10 ? "text-red-500" : "text-black"
              }`}
            >
              {seconds}
            </span>
            .
          </span>
        ) : fetchStatus === null ? (
          <span>
            Refreshing data in{" "}
            <span
              className={`font-bold ${
                seconds <= 10 ? "text-red-500" : "text-black"
              }`}
            >
              {seconds}
            </span>
            .
          </span>
        ) : null}
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
