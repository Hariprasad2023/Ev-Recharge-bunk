// script.js

import { auth, db, storage } from './firebase.js';

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
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Upload avatar if exists
    let avatarURL = '';
    if (avatarFile) {
      const storageRef = storage.ref(`avatars/${user.uid}/${avatarFile.name}`);
      const snapshot = await storageRef.put(avatarFile);
      avatarURL = await snapshot.ref.getDownloadURL();
    }

    // Update user profile
    await user.updateProfile({
      displayName: fullName,
      photoURL: avatarURL
    });

    // Save additional user data to Firestore
    await db.collection('users').doc(user.uid).set({
      username: username,
      fullName: fullName,
      email: email,
      avatarURL: avatarURL,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

   
    window.location.href = 'login.html';
  } catch (error) {
    alert('Error: ' + error.message);
  }
});
