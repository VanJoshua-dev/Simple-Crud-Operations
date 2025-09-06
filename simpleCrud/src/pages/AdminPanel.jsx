import React, { useState, useEffect } from "react";
import EditModal from "../modals/EditModal";
import Swal from "sweetalert2";
import {useNavigate} from "react-router-dom"
import { TypingDotsLoader } from "react-loaderkit";
import { useAuth } from "../AuthContext";
function AdminPanel() {
  const [username, setUsername] = useState("");
  const [lastname, setLastname] = useState("");
  const [users, setUsers] = useState([]);
  const [reload, setReload] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editID, setEditId] = useState("");
  // handle on que
  const [onQueUser, setOnQueUser] = useState("");
  const [onQueLastName, setOnQueLastName] = useState("");
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(null);
  const [fetchStatus, setFetchStatus] = useState(null);
  const [isLogout, setLogout] = useState(false);

  const {setAuth} = useAuth();
  const navigate = useNavigate();
  //handle login
  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading("add");

    try {
      const res = await fetch("http://localhost:5000/api/addUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userName: username, lastName: lastname }),
      });

      if (res.ok) {
        Swal.fire({
          title: `${username} ${lastname} has been added to the database.`,
          icon: "success",
          draggable: false,
        });

        setUsername("");
        setLastname("");
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Something went wrong!",
        });
      }
    } catch (error) {
      console.error("Something went wrong...", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Network error or server is down!",
      });
    } finally {
      setLoading(null);
      setReload((prev) => !prev);
    }
  };

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
          fetchUser(); // update data list
        }
      };
  
      ws.onclose = () => console.log(" WebSocket disconnected");
  
      return () => {
        if (ws) ws.close();
      };
    }, [reload]);

  //handle Delete
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),
      preConfirm: async () => {
        try {
          const response = await fetch("http://localhost:5000/api/deleteUser", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userID: id }),
          });

          if (!response.ok) {
            throw new Error("Delete failed");
          }

          return true; // success
        } catch (error) {
          Swal.showValidationMessage(`Request failed: ${error}`);
          setReload((prev) => !prev);
          return false;
        }
      },
    });

    if (result.isConfirmed) {
      await Swal.fire({
        title: "Deleted!",
        text: "Your file has been deleted.",
        icon: "success",
      });
      setReload((prev) => !prev);
    }
  };

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
    if (!isLogout) return;

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
  }, [isLogout]);

  useEffect(() => {
    if (complete) {
      Swal.fire({
        title: onQueUser + " " + onQueLastName + " has been updated.",
        icon: "success",
        draggable: false,
      });
    }
    setComplete(false);
  }, [complete]);
  //handle pagination
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5; // show 5 users per page

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
          Sample Crud
        </h1>
        <button
          className="text-xl text-white hover:underline "
          onClick={() => setLogout(true)}
        >
          Logout
        </button>
      </div>
      <div className="p-2 min-w-90 bg-gray-200 flex justify-center items-center flex-col shadow-gray-600 shadow-lg rounded-sm">
        <h1 className="bg-gray-500 w-full text-center text-white text-2xl">
          Add User
        </h1>
        <form onSubmit={handleAdd} className="w-full flex flex-col gap-3">
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
            {loading === "add" ? (
              <span className="flex justify-center items-center gap-2">
                Adding
                <TypingDotsLoader size={40} color="white" speed={1} />
              </span>
            ) : (
              "Add"
            )}
          </button>
        </form>
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
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                colSpan={2}
              >
                Action
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
                  <td>
                    <button
                      onClick={() => {
                        setEditId(user.useID);
                        setShowEdit(true);
                        setOnQueUser(user.userName);
                        setOnQueLastName(user.lastName);
                        setLoading("update");
                      }}
                      className="text-green-500 hover:underline"
                    >
                      Edit
                    </button>
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(user.useID)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
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
      {showEdit && (
        <EditModal
          editId={editID}
          onClose={() => setShowEdit(false)}
          onReload={() => setReload((prev) => !prev)}
          onqueuser={onQueUser}
          onquelastname={onQueLastName}
          onComplete={() => setComplete(true)}
        />
      )}
    </div>
  );
}

export default AdminPanel;
