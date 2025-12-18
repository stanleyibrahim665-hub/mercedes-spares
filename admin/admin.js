const firebaseConfig = {
  apiKey: "AIzaSyB0jwVp8pyF_hW9NqkmZQt6RidrRW3y8Zg",
  authDomain: "mercedes-spares-admin.firebaseapp.com",
  projectId: "mercedes-spares-admin"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

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
    createdAt: new Date()
  };

  await db.collection("products").add(data);
  alert("Product saved");
  loadProducts();
}

async function loadProducts() {
  const snap = await db.collection("products").orderBy("createdAt","desc").get();
  productList.innerHTML = "";

  snap.forEach(doc => {
    const p = doc.data();
    productList.innerHTML += `
      <div class="product">
        <strong>${p.name}</strong><br>
        ${p.partNumber || ""} · ${p.category} · ${p.inStock ? "In stock" : "Out"}
      </div>
    `;
  });
}

adminSearch.addEventListener("input", async () => {
  const q = adminSearch.value.toLowerCase();
  const snap = await db.collection("products").get();

  productList.innerHTML = "";
  snap.forEach(doc => {
    const p = doc.data();
    if (
      p.name.toLowerCase().includes(q) ||
      (p.partNumber && p.partNumber.toLowerCase().includes(q))
    ) {
      productList.innerHTML += `
        <div class="product">
          <strong>${p.name}</strong><br>
          ${p.partNumber || ""}
        </div>
      `;
    }
  });
});

loadProducts();
