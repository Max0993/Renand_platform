const API_BASE_URL = "https://renand-platform.onrender.com/api";

document.getElementById("registerForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const email = (formData.get("email") || "").trim().toLowerCase();
  const password = (formData.get("password") || "").trim();

  if (!email || !password) {
    alert("Please fill in all fields.");
    return;
  }

  try {
    const otpResponse = await fetch(`${API_BASE_URL}/auth/request-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const otpData = await otpResponse.json().catch(() => ({}));

    if (!otpResponse.ok) {
      throw new Error(otpData.message || otpData.error || "Failed to send OTP");
    }

    const otp = prompt("Enter the OTP code sent to your email:");

    if (!otp) {
      throw new Error("OTP is required to create an account");
    }

    const verifyResponse = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp })
    });

    const verifyData = await verifyResponse.json().catch(() => ({}));

    if (!verifyResponse.ok || !verifyData.registrationToken) {
      throw new Error(verifyData.message || verifyData.error || "Invalid OTP");
    }

    const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        username: email,
        password,
        registrationToken: verifyData.registrationToken
      })
    });

    const registerData = await registerResponse.json().catch(() => ({}));

    if (!registerResponse.ok) {
      throw new Error(registerData.message || registerData.error || "Registration failed");
    }

    alert("Registration successful!");
    window.location.href = "login.html";
  } catch (err) {
    alert(err.message || "Backend not running");
  }
});
