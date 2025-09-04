import React, { useState } from "react";
import Swal from "sweetalert2";
import { TypingDotsLoader } from "react-loaderkit";
function EditModal({
  editId,
  onClose,
  onReload,
  onqueuser,
  onquelastname,
  onComplete,
}) {
  const [username, setUsername] = useState(onqueuser);
  const [lastname, setLastname] = useState(onquelastname);
  const [isLoading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
   

    try {
      const result = await Swal.fire({
        title: "Do you want to save the changes?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Save",
        denyButtonText: `Don't save`,
      });
      setLoading(true);
      if (result.isConfirmed) {
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
        
        if (!res.ok) {
          await Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Something went wrong!",
          });
        } else {
          const data = await res.json();
          console.log("Edit response:", data);

          onClose();
          onReload();
          onComplete();
          setUsername("");
          setLastname("");

          await Swal.fire("Saved!", "", "success");
        }
      } else if (result.isDenied) {
        await Swal.fire("Changes are not saved", "", "info");
      }
    } catch (error) {
      console.error("Error while editing user:", error);
      await Swal.fire("Error!", "Something went wrong while saving.", "error");
      onReload();
      onClose();
    } finally {
      setLoading(false);
      
    }
  };

  return (
    <div className="absolute z-100 backdrop-blur-2xl h-screen w-screen flex flex-col justify-center items-center gap-5">
      <div className="p-2 bg-gray-200 min-w-90 flex justify-center items-center flex-col shadow-gray-600 shadow-2xl rounded-sm">
        <h1 className="bg-gray-500 w-full text-center text-white text-2xl">
          Update User
        </h1>
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
            {isLoading ? (
              <span className="flex justify-center items-center gap-2">
                Saving
                <TypingDotsLoader size={40} color="white" speed={1} />
              </span>
              
            ) : (
              "Save"
            )}
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
