document.getElementById("dataForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const entry = {
    name: formData.get("name"),
    phone: formData.get("phone"),
    transfercode: formData.get("transfercode"),
    opinion: formData.get("opinion"),
    montan: formData.get("montan"),
    company: formData.get("company")
  };

  // Get existing data from localStorage
  const existing = JSON.parse(localStorage.getItem("clientData") || "[]");
  existing.push(entry);

  // Save updated data
  localStorage.setItem("clientData", JSON.stringify(existing));

  // Redirect like PHP did
  window.location.href = "check.html";
});
