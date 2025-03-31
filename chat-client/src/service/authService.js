const url = import.meta.env.VITE_BACKEND_URL;
console.log("Backend URL:", url);

export const authService = {
  async login(email, password) {
    try {
      console.log("Logging in:", email, password);

      const response = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Login Response:", data);

      // Store token in localStorage
      if (data.token) {
        localStorage.setItem("authToken", data.token);
      }

      return data;
    } catch (e) {
      console.error("Login Error:", e);
      return { error: e.message };
    }
  },

  async getCurrent() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch("http://127.0.0.1:8000/api/user", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Current User:", data);
      return data;
    } catch (e) {
      console.error("Get Current User Error:", e);
      return { error: e.message };
    }
  },
};
