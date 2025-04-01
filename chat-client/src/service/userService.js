export const userService={
    async getAllUsers(){
     try {
       const token = localStorage.getItem("token");
       if (!token) {
         throw new Error("No authentication token found");
       }

       const response = await fetch("http://127.0.0.1:8000/api/users", {
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
    }
}