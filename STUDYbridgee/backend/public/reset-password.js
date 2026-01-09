// ====== SELECT FORM ======
const resetForm = document.querySelector("form");

resetForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // prevent default form submission

  const newPasswordInput = document.getElementById("newPassword");
  const confirmPasswordInput = document.getElementById("confirmPassword");

  const newPassword = newPasswordInput.value.trim();
  const confirmPassword = confirmPasswordInput.value.trim();

  if (!newPassword || !confirmPassword) {
    alert("Please fill in both password fields");
    return;
  }

  if (newPassword !== confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  // ====== GET TOKEN FROM URL ======
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  if (!token) {
    alert("Invalid or missing token");
    return;
  }

  try {
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: newPassword })
    });

    const data = await res.json();

    if (res.ok) {
      alert("Password updated successfully! Please login with your new password.");
      window.location.href = "account.html"; // redirect to login/register page
    } else {
      alert(data.msg || "Failed to reset password");
    }
  } catch (err) {
    alert("Error connecting to server");
    console.error(err);
  }
});
