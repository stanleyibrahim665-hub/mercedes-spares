const firebaseConfig = {
  apiKey: "AIzaSyB0jwVp8pyF_hW9NqkmZQt6RidrRW3y8Zg",
  authDomain: "mercedes-spares-admin.firebaseapp.com",
  projectId: "mercedes-spares-admin"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

let editingId = null;

auth.onAuthStateChanged(user => {
  if (!user) location.href = "login.html";
});

function logout() {
  auth.signOut();
}

async function addProduct() {
  const data = {
    name: name.value,
    price: price.value,
    partNumber: partNumber.value,
    category: category.value,
    condition: condition.value,
    compatibility: compatibility.value,
    inStock: inStock.checked,
    images: images.value.split(",").map(i => i.trim()),
    updatedAt: new Date()
  };

  if (editingId) {
    await db.collection("products").doc(editingId).update(data);
    editingId = null;
    alert("Product updated");
  } else {
    data.createdAt = new Date();
    await db.collection("products").add(data);
    alert("Product added");
  }

  clearForm();
  loadProducts();
}

function clearForm() {
  name.value = "";
  price.value = "";
  partNumber.value = "";
  compatibility.value = "";
  images.value = "";
  inStock.checked = true;
}

async function loadProducts() {
  const snap = await db.collection("products").orderBy("updatedAt","desc").get();
  productList.innerHTML = "";

  snap.forEach(doc => {
    const p = doc.data();
    productList.innerHTML += `
      <div style="border-bottom:1px solid #ddd;padding:10px">
        <b>${p.name}</b> — KES ${p.price}<br>
        ${p.partNumber || ""} · ${p.category} · ${p.inStock ? "In stock" : "Out"}<br>
        <button onclick="editProduct('${doc.id}')">Edit</button>
        <button onclick="deleteProduct('${doc.id}')">Delete</button>
      </div>
    `;
  });
}

async function editProduct(id) {
  const docSnap = await db.collection("products").doc(id).get();
  const p = docSnap.data();

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

async function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;
  await db.collection("products").doc(id).delete();
  loadProducts();
}

loadProducts();
