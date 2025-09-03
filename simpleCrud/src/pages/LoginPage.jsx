import React, { useState, useEffect } from "react";
import EditModal from "../modals/EditModal";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [lastname, setLastname] = useState("");
  const [users, setUsers] = useState([]);
  const [reload, setReload] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editID, setEditId] = useState("");
  // handle on que
  const [onQueUser, setOnQueUser] = useState("");
  const [onQueLastName, setOnQueLastName] = useState("");
  //handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await fetch("http://localhost:5000/api/addUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userName: username, lastName: lastname }),
      });

      alert(username + " " + lastname + " has been added to database.");
      setReload(prev => !prev);
      setUsername("");
      setLastname("");
    } catch (error) {
      console.error("Something went wrong...", error);
    }
  };

  //handle fetch
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/getUsers");
        const data = await res.json();
        console.log("Server response:", data);
        setUsers(data.results);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchUser();
  }, [reload]);

  //handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await fetch("http://localhost:5000/api/deleteUser", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userID: id }),
      });
      setReload(prev => !prev)
    } catch (error) {
      console.error("Something went wrong.", error);
    }
  };

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
        <h1 className="text-3xl w-full bg-gray-400 text-center py-2 font-semibold text-white">Simple Crud</h1>
      <div className="p-2 bg-gray-200 flex justify-center items-center flex-col shadow-gray-600 shadow-2xl rounded-sm">
        <h1 className="bg-gray-500 w-full text-center text-white text-2xl">Add User</h1>
        <form onSubmit={handleLogin} className="w-full flex flex-col gap-3">
          <div className="flex flex-col">
            <label htmlFor="username">Username</label>
            <input
              className="border-gray-500 border-2 px-1 py-1 rounded-sm"
              type="text"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 w-full rounded-sm py-2 text-white hover:bg-blue-700"
          >
            Submit
          </button>
        </form>
      </div>
      {/* fetch data */}
      <div className="p-2 bg-gray-200 flex justify-center items-center flex-col shadow-gray-600 shadow-2xl rounded-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Username
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
                colSpan={2}
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentUsers.map((user, index) => (
              <tr key={index}>
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
                <td>
                  <button
                    onClick={() => {
                      setEditId(user.useID);
                      setShowEdit(true);
                      setOnQueUser(user.userName);
                      setOnQueLastName(user.lastName);
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
            ))}
          </tbody>
        </table>
        {/* pagination */}
        <div style={{ marginTop: "10px", display: "flex", gap: "5px" }}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
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
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
      {showEdit && (
        <EditModal
          editId={editID}
          onClose={() => setShowEdit(false)}
          onReload={() => setReload(prev => !prev)}
          onqueuser={onQueUser}
          onquelastname={onQueLastName}
        />
      )}
    </div>
  );
}

export default LoginPage;
