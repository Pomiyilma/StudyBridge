import { useState, useEffect } from "react";
import axios from "axios";

function ProfileDashboard() {
    const [user, setUser] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        grade: "",
        avatar: "",
        bio: "",
        password: "",
    });

    const token = localStorage.getItem("token");

    // Fetch user profile on mount
    useEffect(() => {
        if (!token) {
            console.log("No token found");
            return;
        }

        console.log("Fetching profile with token:", token);
        axios
            .get("http://localhost:5000/api/profile", { // Explicit URL to avoid proxy issues
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                console.log("Profile response:", res.data);
                if (res.data) {
                    setUser(res.data);
                    setFormData({
                        name: res.data.name || "",
                        email: res.data.email || "",
                        grade: res.data.grade || "",
                        avatar: res.data.avatar || "",
                        bio: res.data.bio || "",
                        password: "",
                    });
                } else {
                    console.error("Profile data is empty");
                }
            })
            .catch((err) => {
                console.error("Failed to fetch profile:", err);
                if (err.response) {
                    console.error("Error response:", err.response.status, err.response.data);
                }
            });
    }, [token]);

    // Handle input changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Update profile
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put("/api/profile", formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUser(res.data);
            setEditMode(false);
            alert("Profile updated successfully!");
        } catch (err) {
            console.error("Failed to update profile:", err);
            alert("Error updating profile.");
        }
    };

    if (!user) return <p>Loading profile...</p>;

    return (
        <div style={styles.page}>
            <h1>👤 My Profile</h1>

            {editMode ? (
                <form onSubmit={handleSubmit} style={styles.form}>
                    <label>
                        Name:
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </label>
                    <label>
                        Email:
                        <input
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </label>
                    <label>
                        Grade:
                        <input
                            name="grade"
                            value={formData.grade}
                            onChange={handleChange}
                        />
                    </label>
                    <label>
                        Avatar URL:
                        <input
                            name="avatar"
                            value={formData.avatar}
                            onChange={handleChange}
                        />
                    </label>
                    <label>
                        Bio:
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                        />
                    </label>
                    <label>
                        New Password:
                        <input
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Leave blank to keep current"
                        />
                    </label>

                    <button type="submit" style={styles.saveBtn}>
                        💾 Save
                    </button>
                    <button
                        type="button"
                        onClick={() => setEditMode(false)}
                        style={styles.cancelBtn}
                    >
                        ❌ Cancel
                    </button>
                </form>
            ) : (
                <div style={styles.card}>
                    {user.avatar && <img src={user.avatar} alt="Avatar" style={styles.avatar} />}
                    <h2>{user.name}</h2>
                    <p>Email: {user.email}</p>
                    <p>Grade: {user.grade}</p>
                    <p>Bio: {user.bio}</p>

                    <button onClick={() => setEditMode(true)} style={styles.editBtn}>
                        ✏️ Edit Profile
                    </button>
                </div>
            )}
        </div>
    );
}

const styles = {
    page: { padding: "20px", fontFamily: "Arial" },
    card: {
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        maxWidth: "400px",
    },
    avatar: { width: "100px", borderRadius: "50%", marginBottom: "10px" },
    editBtn: {
        padding: "10px 15px",
        background: "#4A90E2",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
    },
    form: { display: "flex", flexDirection: "column", gap: "10px", maxWidth: "400px" },
    saveBtn: {
        padding: "10px",
        background: "#2ECC71",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
    },
    cancelBtn: {
        padding: "10px",
        background: "#E74C3C",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
    },
};

export default ProfileDashboard;
