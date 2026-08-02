// ===== SETUP =====
const cafeId = localStorage.getItem('cafeId');
const customerName = localStorage.getItem('customerName');
const customerMobile = localStorage.getItem('customerMobile');

if (!cafeId || !customerMobile) {
  window.location.href = 'customer-login.html';
}

document.getElementById('welcomeText').innerText = 'Hi, ' + customerName + '!';

let cart = []; // { id, name, price, emoji, qty }

// ===== LOAD LIVE MENU =====
db.collection('Menu').where('cafeId', '==', cafeId).onSnapshot((snapshot) => {
  const container = document.getElementById('menuContainer');
  if (snapshot.empty) {
    container.innerHTML = '<p style="text-align:center; width:100%; color:#999;">Menu coming soon...</p>';
    return;
  }
  container.innerHTML = '';
  snapshot.forEach((doc) => {
    const item = doc.data();
    const itemId = doc.id;
    const div = document.createElement('div');
    div.className = 'menu-item';
    div.innerHTML = `
      <div class="emoji">${item.emoji || '🍽️'}</div>
      <div class="name">${item.name}</div>
      <div class="price">₹${item.price}</div>
      <button class="add-btn" onclick="addToCart('${itemId}', '${item.name.replace(/'/g,"\\'")}', ${item.price}, '${item.emoji || '🍽️'}', event)">Add +</button>
    `;
    container.appendChild(div);
  });
}, (err) => {
  console.error(err);
  document.getElementById('menuContainer').innerHTML = '<p style="text-align:center; color:red;">Error loading menu</p>';
});

// ===== LOYALTY TICKS (Real-time) =====
db.collection('Customers').doc(customerMobile).onSnapshot((doc) => {
  if (!doc.exists) return;
  const data = doc.data();
  const ticks = data.ticks || 0;
  renderTicks(ticks);
});

function renderTicks(ticks) {
  const grid = document.getElementById('ticksGrid');
  grid.innerHTML = '';
  for (let i = 1; i <= 7; i++) {
    const box = document.createElement('div');
    box.className = 'tick-box' + (i <= ticks ? ' filled' : '');
    box.innerText = i <= ticks ? '✓' : i;
    grid.appendChild(box);
  }
  const couponMsg = document.getElementById('couponMsg');
  couponMsg.style.display = ticks >= 7 ? 'block' : 'none';
}

// ===== MODALS =====
function openLoyalty() {
  document.getElementById('loyaltyModal').classList.add('active');
}
function closeLoyalty() {
  document.getElementById('loyaltyModal').classList.remove('active');
}
function openCart() {
  renderCart();
  document.getElementById('cartModal').classList.add('active');
}
function closeCart() {
  document.getElementById('cartModal').classList.remove('active');
}

// ===== TOAST =====
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.innerText = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// ===== PLACE ORDER =====
function placeOrder() {
  if (cart.length === 0) {
    showToast('Cart is empty!');
    return;
  }
  const total = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);

  db.collection('Orders').add({
    cafeId: cafeId,
    customerName: customerName,
    customerMobile: customerMobile,
    items: cart,
    total: total,
    status: 'placed',
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    cart = [];
    updateCartCount();
    closeCart();
    showToast('✅ Order placed successfully!');
  }).catch((err) => {
    showToast('Error placing order: ' + err.message);
  });
      }
