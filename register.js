document.getElementById("registerForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const username = formData.get("username").trim();
  const password = formData.get("password").trim();

  if (!username || !password) {
    alert("Please fill in all fields.");
    return;
  }

  let users = JSON.parse(localStorage.getItem("users") || "[]");

  const userExists = users.some(user => user.username === username);
  if (userExists) {
    alert("Username already exists. Choose another.");
    return;
  }

  users.push({ username, password });
  localStorage.setItem("users", JSON.stringify(users));

  alert("Registration successful!");
  window.location.href = "login.html"; // Redirect to login
});
