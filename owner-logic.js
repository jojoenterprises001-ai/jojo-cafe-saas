// ===== OWNER LOGIN CHECK =====
// Owner logs in via prompt on first load, stored in localStorage
let ownerMobile = localStorage.getItem('ownerMobile');

if (!ownerMobile) {
  ownerMobile = prompt('Enter your registered mobile number:');
  if (ownerMobile && /^[0-9]{10}$/.test(ownerMobile.trim())) {
    ownerMobile = ownerMobile.trim();
    localStorage.setItem('ownerMobile', ownerMobile);
  } else {
    alert('Invalid mobile number. Redirecting to registration.');
    window.location.href = 'owner-register.html';
  }
}

let cafeData = null;

// ===== LOAD CAFE INFO (real-time so approval reflects instantly) =====
db.collection('Cafes').doc(ownerMobile).onSnapshot((doc) => {
  if (!doc.exists) {
    alert('Cafe not found. Please register first.');
    window.location.href = 'owner-register.html';
    return;
  }
  cafeData = doc.data();
  document.getElementById('cafeNameTitle').innerText = cafeData.cafeName;
  document.getElementById('ownerNameText').innerText = cafeData.ownerName + ' • ' + cafeData.address;

  const badge = document.getElementById('statusBadge');
  if (cafeData.status === 'approved') {
    badge.innerText = '✓ Approved' + (cafeData.plan ? ' • ' + cafeData.plan : '');
    badge.className = 'status-badge status-approved';
    document.getElementById('dashboardContent').style.display = 'block';
    document.getElementById('lockedContent').style.display = 'none';
    generateQR();
    loadMenuList();
  } else {
    badge.innerText = '⏳ Pending Approval';
    badge.className = 'status-badge status-pending';
    document.getElementById('dashboardContent').style.display = 'none';
    document.getElementById('lockedContent').style.display = 'block';
  }
});

// ===== GIVE LOYALTY TICK =====
function giveTick() {
  const mobile = document.getElementById('tickMobile').value.trim();
  const msg = document.getElementById('tickMsg');

  if (!/^[0-9]{10}$/.test(mobile)) {
    msg.style.color = 'red';
    msg.innerText = 'Enter a valid 10-digit number';
    return;
  }

  const custRef = db.collection('Customers').doc(mobile);
  custRef.get().then((doc) => {
    if (!doc.exists) {
      msg.style.color = 'red';
      msg.innerText = 'Customer not found. They must login first.';
      return;
    }
    const currentTicks = doc.data().ticks || 0;
    const newTicks = Math.min(currentTicks + 1, 7);
    custRef.update({ ticks: newTicks }).then(() => {
      msg.style.color = 'green';
      msg.innerText = `✅ Tick added! Now at ${newTicks}/7`;
      document.getElementById('tickMobile').value = '';
    });
  });
}

// ===== REDEEM COUPON =====
function redeemCoupon() {
  const mobile = document.getElementById('redeemMobile').value.trim();
  const msg = document.getElementById('redeemMsg');

  if (!/^[0-9]{10}$/.test(mobile)) {
    msg.style.color = 'red';
    msg.innerText = 'Enter a valid 10-digit number';
    return;
  }

  const custRef = db.collection('Customers').doc(mobile);
  custRef.get().then((doc) => {
    if (!doc.exists) {
      msg.style.color = 'red';
      msg.innerText = 'Customer not found';
      return;
    }
    const ticks = doc.data().ticks || 0;
    if (ticks < 7) {
      msg.style.color = 'red';
      msg.innerText = `Only ${ticks}/7 ticks. Not eligible yet.`;
      return;
    }
    custRef.update({ ticks: 0 }).then(() => {
      msg.style.color = 'green';
      msg.innerText = '🎉 Coupon redeemed! Ticks reset to 0.';
      document.getElementById('redeemMobile').value = '';
    });
  });
}

// ===== MENU MANAGER =====
function addMenuItem() {
  const name = document.getElementById('itemName').value.trim();
  const price = document.getElementById('itemPrice').value.trim();
  const emoji = document.getElementById('itemEmoji').value.trim() || '🍽️';
  const msg = document.getElementById('menuMsg');

  if (!name || !price) {
    msg.style.color = 'red';
    msg.innerText = 'Enter item name and price';
    return;
  }

  db.collection('Menu').add({
    cafeId: ownerMobile,
    name: name,
    price: Number(price),
    emoji: emoji,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    msg.style.color = 'green';
    msg.innerText = '✅ Item added to menu!';
    document.getElementById('itemName').value = '';
    document.getElementById('itemPrice').value = '';
    document.getElementById('itemEmoji').value = '';
  });
}

function loadMenuList() {
  db.collection('Menu').where('cafeId', '==', ownerMobile).onSnapshot((snapshot) => {
    const list = document.getElementById('menuList');
    if (snapshot.empty) {
      list.innerHTML = '<p style="color:#999; font-size:13px;">No items yet.</p>';
      return;
    }
    list.innerHTML = '';
    snapshot.forEach((doc) => {
      const item = doc.data();
      const row = document.createElement('div');
      row.className = 'menu-list-item';
      row.innerHTML = `
        <span>${item.emoji} ${item.name} — ₹${item.price}</span>
        <button class="del-btn" onclick="deleteMenuItem('${doc.id}')">Delete</button>
      `;
      list.appendChild(row);
    });
  });
}

function deleteMenuItem(itemId) {
  if (confirm('Delete this item?')) {
    db.collection('Menu').doc(itemId).delete();
  }
}

// ===== QR CODE GENERATOR =====
function generateQR() {
  const qrContainer = document.getElementById('qrcode');
  qrContainer.innerHTML = '';
  const menuUrl = window.location.origin + window.location.pathname.replace('owner-dashboard.html', 'customer-login.html') + '?cafe=' + ownerMobile;
  new QRCode(qrContainer, {
    text: menuUrl,
    width: 180,
    height: 180,
    colorDark: '#667eea',
    colorLight: '#ffffff'
  });
}

function downloadQR() {
  const canvas = document.querySelector('#qrcode canvas');
  if (!canvas) return;
  const link = document.createElement('a');
  link.download = cafeData.cafeName + '-QR.png';
  link.href = canvas.toDataURL();
  link.click();
}
