// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB0jwVp8pyF_hW9NqkmZQt6RidrRW3y8Zg",
  authDomain: "mercedes-spares-admin.firebaseapp.com",
  projectId: "mercedes-spares-admin"
};

// Init Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// Require login
auth.onAuthStateChanged(user => {
  if (!user) {
    location.href = "index.html";
  } else {
    loadProducts();
    loadCompany();
  }
});

// LOGOUT
function logout() {
  auth.signOut();
}

// ADD / UPDATE PRODUCT
let editingId = null;

async function addProduct() {
  const data = {
    name: document.getElementById("name").value,
    price: Number(document.getElementById("price").value),
    partNumber: document.getElementById("partNumber").value,
    category: document.getElementById("category").value,
    condition: document.getElementById("condition").value,
    compatibility: document.getElementById("compatibility").value,
    inStock: document.getElementById("inStock").checked,
    images: document.getElementById("images").value
      .split(",")
      .map(i => i.trim())
      .filter(i => i),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  try {
    if (editingId) {
      await db.collection("products").doc(editingId).update(data);
      editingId = null;
      alert("Product updated");
    } else {
      data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection("products").add(data);
      alert("Product added");
    }

    clearForm();
    loadProducts();

  } catch (err) {
    alert("ERROR: " + err.message);
  }
}

// CLEAR FORM
function clearForm() {
  ["name","price","partNumber","compatibility","images"]
    .forEach(id => document.getElementById(id).value = "");
  document.getElementById("inStock").checked = true;
}

// LOAD PRODUCTS + QUICK SEARCH
async function loadProducts() {
  const list = document.getElementById("productList");
  const snap = await db.collection("products").orderBy("updatedAt","desc").get();
  list.innerHTML = "";

  snap.forEach(doc => {
    const p = doc.data();
    list.innerHTML += `
      <div class="product">
        <b>${p.name}</b> — KES ${p.price}<br>
        ${p.partNumber || ""} · ${p.category} · ${p.inStock ? "In stock" : "Out"}<br>
        <button onclick="editProduct('${doc.id}')">Edit</button>
        <button onclick="deleteProduct('${doc.id}')">Delete</button>
      </div>
    `;
  });
}

// EDIT PRODUCT
async function editProduct(id) {
  const snap = await db.collection("products").doc(id).get();
  const p = snap.data();

  editingId = id;
  name.value = p.name;
  price.value = p.price;
  partNumber.value = p.partNumber || "";
  category.value = p.category;
  condition.value = p.condition;
  compatibility.value = p.compatibility || "";
  images.value = (p.images || []).join(", ");
  inStock.checked = p.inStock !== false;
}

// DELETE PRODUCT
async function deleteProduct(id) {
  if (!confirm("Delete product?")) return;
  await db.collection("products").doc(id).delete();
  loadProducts();
}

// COMPANY INFO
async function saveCompany() {
  const data = {
    name: companyName.value,
    phone: companyPhone.value,
    email: companyEmail.value,
    address: companyAddress.value
  };

  await db.collection("settings").doc("company").set(data);
  alert("Company info saved");
}

async function loadCompany() {
  const snap = await db.collection("settings").doc("company").get();
  if (!snap.exists()) return;

  const c = snap.data();
  companyName.value = c.name || "";
  companyPhone.value = c.phone || "";
  companyEmail.value = c.email || "";
  companyAddress.value = c.address || "";
}
