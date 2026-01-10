// ====== SELECT FORM ======
const forgotForm = document.querySelector("form");

forgotForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // prevent normal form submission

  const emailInput = forgotForm.querySelector('input[type="email"]');
  const email = emailInput.value.trim();

  if (!email) {
    alert("Please enter your email");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const data = await res.json();

    if (res.ok) {
      alert("If your email exists, a reset link has been sent!");
      // Redirect to your HTML page for next step if needed
      // e.g., forgot-success.html or back to login
    } else {
      alert(data.msg || "Something went wrong");
    }
  } catch (err) {
    alert("Error connecting to server");
    console.error(err);
  }
});