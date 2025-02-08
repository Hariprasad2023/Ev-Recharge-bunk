// login.js
import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

// Handle login form submission
document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.querySelector("form");
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get input values
    const email = document.getElementById("exampleEmail").value;
    const password = document.getElementById("examplePassword").value;

    try {
      // Firebase sign-in
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      
      window.location.href = "./user/dashboard.html"; // Redirect after login
    } catch (error) {
      alert("Error: " + error.message);
    }
  });
});
