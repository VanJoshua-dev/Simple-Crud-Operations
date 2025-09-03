import React, { useState } from "react";

function EditModal({ editId, onClose, onReload, onqueuser, onquelastname }) {
  const [username, setUsername] = useState(onqueuser);
  const [lastname, setLastname] = useState(onquelastname);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/editUser", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newUserName: username,
          newLastName: lastname,
          userID: editId,
        }),
      });

      const data = await res.json(); // optional: log the response
      console.log("Edit response:", data);

      if (res.ok) {
        onClose(); // ✅ close modal
        onReload(); // ✅ refresh parent data
        setUsername("");
        setLastname("");
      } else {
        alert("Failed to update: " + (data.error || data.message));
      }
    } catch (error) {
      console.error("Error while editing user:", error);
    }
  };
  return (
    <div className="absolute z-100 bg-gray-500 h-screen w-screen flex flex-col justify-center items-center gap-5">
      <div className="p-2 bg-gray-200 flex justify-center items-center flex-col shadow-gray-600 shadow-2xl rounded-sm">
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
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
            Save
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-500 w-full rounded-sm py-2 text-white hover:bg-gray-700"
          >
            Close
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditModal;
