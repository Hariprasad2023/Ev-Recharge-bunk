// Import Firebase authentication module from Firebase.js
import { auth } from "../firebase.js"; 
import { signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

// ✅ Handle Login
document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get input values
    const email = document.querySelector("input[type='email']").value;
    const password = document.querySelector("input[type='password']").value;

    try {
        // Authenticate user
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // ✅ Check if the email is "evadmin@gmail.com"
        if (user.email === "evadmin@gmail.com") {
            alert("Login successful! Redirecting to dashboard...");
            window.location.href = "dashboard.html"; // Redirect to admin dashboard
        } else {
            alert("Access denied! Only admins can log in.");
            await signOut(auth); // Logout the non-admin user
        }
    } catch (error) {
        alert("Error: " + error.message);
    }
});
