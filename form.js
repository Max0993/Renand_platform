document.getElementById("dataForm").addEventListener("submit", function (e) {
    e.preventDefault();
  
    const formData = new FormData(this);
    const entry = {
      id: Date.now(), // unique id
      name: formData.get("name"),
      phone: formData.get("phone"),
      transfercode: formData.get("transfercode"),
      opinion: formData.get("opinion"),
      montan: formData.get("montan"),
      company: formData.get("company"),
    };
  
    const records = JSON.parse(localStorage.getItem("records") || "[]");
    records.push(entry);
    localStorage.setItem("records", JSON.stringify(records));
  
    alert("Data saved!");
    this.reset(); // clear form
  });
  