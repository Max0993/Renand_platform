const API_BASE_URL = "https://renand-platform.onrender.com";

document.getElementById("registerForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const username = (formData.get("username") || "").trim();
  const password = (formData.get("password") || "").trim();

  if (!username || !password) {
    alert("Please fill in all fields.");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }

    alert("Registration successful!");
    window.location.href = "login.html";
  } catch (err) {
    alert(err.message || "Backend not running");
  }
});
