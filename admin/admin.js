const firebaseConfig = {
  apiKey: "AIzaSyB0jwVp8pyF_hW9NqkmZQt6RidrRW3y8Zg",
  authDomain: "mercedes-spares-admin.firebaseapp.com",
  projectId: "mercedes-spares-admin"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

let editingId = null;
let allProducts = [];

// Auth check
auth.onAuthStateChanged(user => {
  if (!user) location.href = "login.html";
});

function logout() {
  auth.signOut();
}

// ADD / UPDATE PRODUCT
async function addProduct() {
  const data = {
    name: name.value.trim(),
    price: price.value.trim(),
    partNumber: partNumber.value.trim(),
    category: category.value,
    condition: condition.value,
    compatibility: compatibility.value.trim(),
    inStock: inStock.checked,
    images: images.value.split(",").map(i => i.trim()).filter(Boolean),
    updatedAt: new Date()
  };

  if (!data.name || !data.price) {
    alert("Name and price required");
    return;
  }

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

// CLEAR FORM
function clearForm() {
  name.value = "";
  price.value = "";
  partNumber.value = "";
  compatibility.value = "";
  images.value = "";
  inStock.checked = true;
}

// LOAD PRODUCTS (IMPORTANT)
async function loadProducts() {
  const snap = await db.collection("products").orderBy("updatedAt", "desc").get();
  allProducts = [];

  snap.forEach(doc => {
    allProducts.push({ id: doc.id, ...doc.data() });
  });

  renderProducts(allProducts);
}

// RENDER PRODUCTS
function renderProducts(list) {
  productList.innerHTML = "";

  if (list.length === 0) {
    productList.innerHTML = "<p>No products found</p>";
    return;
  }

  list.forEach(p => {
    productList.innerHTML += `
      <div class="product">
        <b>${p.name}</b> — KES ${p.price}<br>
        ${p.partNumber || ""} · ${p.category} · ${p.inStock ? "In stock" : "Out of stock"}<br>
        <button onclick="editProduct('${p.id}')">Edit</button>
        <button onclick="deleteProduct('${p.id}')">Delete</button>
      </div>
    `;
  });
}

// QUICK SEARCH (THIS WAS MISSING)
const adminSearch = document.getElementById("adminSearch");

adminSearch.addEventListener("input", () => {
  const q = adminSearch.value.toLowerCase();

  const filtered = allProducts.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (p.partNumber && p.partNumber.toLowerCase().includes(q))
  );

  renderProducts(filtered);
});

// EDIT
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

// DELETE
async function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;
  await db.collection("products").doc(id).delete();
  loadProducts();
}

// INIT
loadProducts();
