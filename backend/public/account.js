/* ==========================
   TOGGLE LOGIN / REGISTER UI
========================== */
const container = document.getElementById("container");
const registerBtn = document.getElementById("register-id");
const loginBtn = document.getElementById("login-id");

registerBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  registerBtn.disabled = true; // 🔥 IMPORTANT

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();

  const res = await fetch("http://localhost:5000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email }),
  });

  const data = await res.json();

  alert(data.msg);

  if (res.ok) {
    window.location.href = "verify.html";
  } else {
    registerBtn.disabled = false;
  }
});

loginBtn.addEventListener("click", () => {
  container.classList.remove("active");
});

/* ==========================
   REGISTER FORM SUBMIT
========================== */
const registerForm = document.querySelector(".register form");

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = registerForm
    .querySelector("input[placeholder='Name']")
    .value.trim();

  const email = registerForm
    .querySelector("input[placeholder='Email']")
    .value.trim();

  if (!name || !email) {
    alert("Please fill all fields");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.msg || "Registration failed");
      return;
    }

    alert("Verification code sent to your email");

    // 🔑 REDIRECT TO VERIFY PAGE
    window.location.href = "verify.html?email=" + encodeURIComponent(email);
  } catch (err) {
    console.error(err);
    alert("Server error. Try again.");
  }
});

/* ==========================
   LOGIN FORM (OPTIONAL)
========================== */
/* ==========================
   LOGIN FORM
========================== */
const loginForm = document.querySelector(".log-in form");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = loginForm.querySelector("input[type='email']").value.trim();
  const password = loginForm
    .querySelector("input[type='password']")
    .value.trim();

  if (!email || !password) {
    alert("Email and password required");
    return;
  }

  try {
    // 🔑 Call the login API
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.msg || "Login failed");
      return;
    }

    // ✅ Save JWT token in localStorage
    localStorage.setItem("token", data.token);

    // ✅ Optional: save user info
    localStorage.setItem("user", JSON.stringify(data.user));

    alert("Login successful! Redirecting to dashboard...");

    // 🔁 Redirect to your frontend dashboard (React app on localhost:3000)
    window.location.href = "http://localhost:3000";
  } catch (err) {
    console.error(err);
    alert("Server error. Try again.");
  }
});
