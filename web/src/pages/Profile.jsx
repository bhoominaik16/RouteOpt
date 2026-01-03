// --- Helper Functions ---
const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onloadend = () => {
    const base64Image = reader.result;
    const updatedUser = { ...user, profileImage: base64Image };

    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));

    // 🔔 notify other components (Navbar, etc.)
    window.dispatchEvent(new Event("userUpdated"));
  };

  reader.readAsDataURL(file);
};
