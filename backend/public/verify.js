const message = document.getElementById("message");
const passwordStep = document.getElementById("password-step");

document.getElementById("verify-btn").onclick = async () => {
  const email = document.getElementById("email").value.trim();
  const code = document.getElementById("code").value.trim();

  const res = await fetch("http://localhost:5000/api/auth/verify-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });

  const data = await res.json();

  if (!res.ok) {
    message.textContent = data.msg;
    message.style.color = "red";
    return;
  }

  message.textContent = "Code verified. Create your password.";
  message.style.color = "green";
  passwordStep.style.display = "block";
};

document.getElementById("complete-btn").onclick = async () => {
  const email = document.getElementById("email").value.trim();
  const code = document.getElementById("code").value.trim();
  const password = document.getElementById("password").value;
  const confirm = document.getElementById("confirm").value;

  if (password !== confirm) {
    alert("Passwords do not match");
    return;
  }

  const res = await fetch("http://localhost:5000/api/auth/register-complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.msg);
    return;
  }

  alert("Registration complete! Please log in.");
  window.location.href = "account.html";
};
