// ===== SETUP =====
const cafeId = localStorage.getItem('cafeId');
const customerName = localStorage.getItem('customerName');
const customerMobile = localStorage.getItem('customerMobile');

if (!cafeId || !customerMobile) {
  window.location.href = 'customer-login.html';
}

document.getElementById('welcomeText').innerText = 'Hi, ' + customerName + '!';

let cart = []; // { id, name, price, photoUrl, qty }
let cafeInfo = null;

// ===== LOAD CAFE NAME =====
db.collection('Cafes').doc(cafeId).get().then((doc) => {
  if (doc.exists) {
    cafeInfo = doc.data();
    document.getElementById('cafeNameTop').innerText = '☕ ' + cafeInfo.cafeName;
  }
});

// ===== TAB SWITCHING (Menu / Games) =====
function switchView(view) {
  document.getElementById('menuView').style.display = view === 'menu' ? 'block' : 'none';
  document.getElementById('gamesView').style.display = view === 'games' ? 'block' : 'none';
  document.querySelectorAll('.tab-chip').forEach(chip => chip.classList.remove('active'));
  event.target.classList.add('active');
}

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
    const safeName = item.name.replace(/'/g, "\\'");
    const div = document.createElement('div');
    div.className = 'menu-item';
    div.innerHTML = `
      <img class="item-photo" src="${item.photoUrl}" onclick="show3DPopup('${itemId}', '${safeName}', ${item.price}, '${item.photoUrl}')">
      <div class="name">${item.name}</div>
      <div class="price">₹${item.price}</div>
      <button class="add-btn" onclick="addToCart('${itemId}', '${safeName}', ${item.price}, '${item.photoUrl}', event)">Add +</button>
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
  renderTicks(ticks, data.couponActive, data.couponCode);
});

function renderTicks(ticks, couponActive, couponCode) {
  const grid = document.getElementById('ticksGrid');
  grid.innerHTML = '';
  for (let i = 1; i <= 7; i++) {
    const box = document.createElement('div');
    box.className = 'tick-box' + (i <= ticks ? ' filled' : '');
    box.innerText = i <= ticks ? '✓' : i;
    grid.appendChild(box);
  }
  const couponBox = document.getElementById('couponBox');
  if (couponActive && couponCode) {
    couponBox.style.display = 'block';
    document.getElementById('couponCodeText').innerText = couponCode;
  } else {
    couponBox.style.display = 'none';
  }
}

// ===== LEADERBOARD =====
function openLeaderboard() {
  loadLeaderboard();
  document.getElementById('leaderboardModal').classList.add('active');
}
function closeLeaderboard() {
  document.getElementById('leaderboardModal').classList.remove('active');
}

function loadLeaderboard() {
  db.collection('Customers')
    .where('cafeId', '==', cafeId)
    .orderBy('gamePoints', 'desc')
    .limit(10)
    .get()
    .then((snapshot) => {
      const list = document.getElementById('leaderboardList');
      if (snapshot.empty) {
        list.innerHTML = '<p style="text-align:center; color:#999; padding:20px 0;">No scores yet. Play games to top the board!</p>';
        return;
      }
      list.innerHTML = '';
      let rank = 1;
      snapshot.forEach((doc) => {
        const data = doc.data();
        const row = document.createElement('div');
        row.className = 'leaderboard-row';
        row.innerHTML = `
          <span class="leaderboard-rank">#${rank}</span>
          <span class="leaderboard-name">${data.name || 'Player'}</span>
          <span class="leaderboard-points">${data.gamePoints || 0} pts</span>
        `;
        list.appendChild(row);
        rank++;
      });
    })
    .catch((err) => {
      document.getElementById('leaderboardList').innerHTML = '<p style="text-align:center; color:#999;">Leaderboard loading...</p>';
    });
                   }
// ===== 3D POPUP ON ITEM CLICK =====
function show3DPopup(id, name, price, photoUrl) {
  const overlay = document.getElementById('photo3DOverlay');
  if (!overlay) return;
  document.getElementById('popup3DImg').src = photoUrl;
  document.getElementById('popup3DName').innerText = name;
  document.getElementById('popup3DPrice').innerText = '₹' + price;
  overlay.classList.add('active');
  overlay.dataset.itemId = id;
  overlay.dataset.itemName = name;
  overlay.dataset.itemPrice = price;
  overlay.dataset.itemPhoto = photoUrl;
}

function close3DPopup() {
  document.getElementById('photo3DOverlay').classList.remove('active');
}

function addFromPopup() {
  const overlay = document.getElementById('photo3DOverlay');
  const id = overlay.dataset.itemId;
  const name = overlay.dataset.itemName;
  const price = Number(overlay.dataset.itemPrice);
  const photoUrl = overlay.dataset.itemPhoto;

  addToCartData(id, name, price, photoUrl);
  flyToCartFromCenter(photoUrl);
  close3DPopup();
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
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== PLACE ORDER (WhatsApp) =====
function placeOrder() {
  if (cart.length === 0) {
    showToast('Cart is empty!');
    return;
  }
  if (!cafeInfo || !cafeInfo.whatsappNumber) {
    showToast('Cafe WhatsApp number not set. Please contact staff.');
    return;
  }

  const total = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);

  // Save order in Firestore too (for record keeping)
  db.collection('Orders').add({
    cafeId: cafeId,
    customerName: customerName,
    customerMobile: customerMobile,
    items: cart,
    total: total,
    status: 'placed',
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  // Build WhatsApp message
  let itemsList = cart.map(i => `${i.qty}x ${i.name}`).join(', ');
  let message = `🛒 *New Order - Jojo Cafe*\n\n`;
  message += `Customer Name: ${customerName}\n`;
  message += `Mobile: ${customerMobile}\n`;
  message += `Order Details: ${itemsList}\n`;
  message += `Total Price: ₹${total}`;

  const encodedMsg = encodeURIComponent(message);
  const cafeWaNumber = '91' + cafeInfo.whatsappNumber;
  const waLink = `https://wa.me/${cafeWaNumber}?text=${encodedMsg}`;

  window.open(waLink, '_blank');

  cart = [];
  updateCartCount();
  closeCart();
  showToast('✅ Order sent via WhatsApp!');
}

// ===== GAME POINTS UPDATE (called from games.html) =====
// This function is exposed globally so games.js can call it if needed
window.addGamePoints = function(points) {
  const custRef = db.collection('Customers').doc(customerMobile);
  custRef.get().then((doc) => {
    if (!doc.exists) return;
    const currentPoints = doc.data().gamePoints || 0;
    custRef.update({
      gamePoints: currentPoints + points,
      cafeId: cafeId,
      name: customerName
    });
  });
};
