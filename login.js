document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const username = formData.get("username");
  const password = formData.get("password");

  const users = JSON.parse(localStorage.getItem("users") || "[]");

  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    // Login success
    localStorage.setItem("loggedInUser", JSON.stringify(user));
    window.location.href = "getdata.html"; // Replace with your page
  } else {
    alert("Modpas la oswa non itilizatè a pa kòrèk!");
  }
});

