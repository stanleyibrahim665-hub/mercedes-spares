// Firebase configuration (COMPAT)
const firebaseConfig = {
  apiKey: "AIzaSyB0jwVp8pyF_hW9NqkmZQt6RidrRW3y8Zg",
  authDomain: "mercedes-spares-admin.firebaseapp.com",
  projectId: "mercedes-spares-admin",
  storageBucket: "mercedes-spares-admin.firebasestorage.app",
  messagingSenderId: "174618017514",
  appId: "1:174618017514:web:622eda306b309d18bc6193"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firebase Auth
const auth = firebase.auth();

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById("status").innerText = "Login successful!";
    })
    .catch((error) => {
      document.getElementById("status").innerText = error.message;
    });
}
