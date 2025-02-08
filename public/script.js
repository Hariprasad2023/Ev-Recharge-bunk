import { auth, db, storage } from './firebase.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// Form submission handler
document.querySelector('form').addEventListener('submit', async (e) => {
  e.preventDefault();

  // Get form values
  const email = document.getElementById('inputEmail3').value;
  const password = document.getElementById('inputPassword3').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const username = document.getElementById('username').value;
  const fullName = document.getElementById('name').value;
  const avatarFile = document.getElementById('exampleInputFile').files[0];

  // Validation
  if (password !== confirmPassword) {
    alert('Passwords do not match!');
    return;
  }

  try {
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;  
    console.log("User created:", user);

    // Upload avatar if exists
    let avatarURL = '';
    if (avatarFile) {
      const storageRef = ref(storage, `avatars/${user.uid}/${avatarFile.name}`);
      await uploadBytes(storageRef, avatarFile);
      avatarURL = await getDownloadURL(storageRef);
    }

    // Save additional user data to Firestore
    await setDoc(doc(db, "users", user.uid), {
      username: username,
      fullName: fullName,
      email: email,
      avatarURL: avatarURL,
      createdAt: serverTimestamp()
    });

    alert('User registered successfully!');
    window.location.href = 'login.html';
  } catch (error) {
    alert('Error: ' + error.message);
    console.error("Firebase Error:", error);
  }
});
