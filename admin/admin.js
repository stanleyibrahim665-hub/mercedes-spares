// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB0jwVp8pyF_hW9NqkmZQt6RidrRW3y8Zg",
  authDomain: "mercedes-spares-admin.firebaseapp.com",
  projectId: "mercedes-spares-admin",
  storageBucket: "mercedes-spares-admin.firebasestorage.app",
  messagingSenderId: "174618017514",
  appId: "1:174618017514:web:622eda306b309d18bc6193"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// 🔐 LOGIN
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      window.location.href = "dashboard.html";
    })
    .catch(error => {
      document.getElementById("status").innerText = error.message;
    });
}

// 🔓 LOGOUT
function logout() {
  auth.signOut().then(() => {
    window.location.href = "index.html";
  });
}

// ➕ ADD PRODUCT
function addProduct() {
  const name = document.getElementById("name").value;
  const price = document.getElementById("price").value;
  const image = document.getElementById("image").value;

  db.collection("products").add({
    name,
    price,
    image,
    created: new Date()
  }).then(() => {
    loadProducts();
  });
}

// 📦 LOAD PRODUCTS
function loadProducts() {
  const list = document.getElementById("productList");
  list.innerHTML = "";

  db.collection("products").get().then(snapshot => {
    snapshot.forEach(doc => {
      const p = doc.data();
      list.innerHTML += `
        <div style="border:1px solid #ccc; padding:10px; margin:10px 0;">
          <strong>${p.name}</strong><br>
          KES ${p.price}<br>
          <img src="${p.image}" width="120"><br>
          <button onclick="deleteProduct('${doc.id}')">Delete</button>
        </div>
      `;
    });
  });
}

// ❌ DELETE PRODUCT
function deleteProduct(id) {
  db.collection("products").doc(id).delete().then(loadProducts);
}

// Auto load products on dashboard
if (window.location.href.includes("dashboard.html")) {
  loadProducts();
}
