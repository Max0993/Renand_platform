const API_BASE_URL = "http://localhost:5500/api";

document.getElementById("dataForm").addEventListener("submit", async function (e) {
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

  try {
    const response = await fetch(`${API_BASE_URL}/records`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry)
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Unable to save data");
    }

    window.location.href = "check.html";
  } catch (err) {
    alert(err.message || "Backend not running");
  }
});
