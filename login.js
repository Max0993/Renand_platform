const API_BASE_URL = "https://renand-platform.onrender.com/api";

document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const username = formData.get("username");
  const password = formData.get("password");

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Invalid username or password");
    }

    window.location.href = "getdata.html";
  } catch (err) {
    alert(err.message || "Backend not running");
  }
});
