// ===== OWNER LOGIN CHECK =====
let ownerMobile = localStorage.getItem('ownerMobile');

if (!ownerMobile) {
  window.location.href = 'owner-login.html';
}

let cafeData = null;

// ===== LOAD CAFE INFO (real-time so approval reflects instantly) =====
db.collection('Cafes').doc(ownerMobile).onSnapshot((doc) => {
  if (!doc.exists) {
    alert('Cafe not found. Please register first.');
    localStorage.removeItem('ownerMobile');
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
    setupWhatsAppButton();
  }
});

// ===== WHATSAPP ACTIVATION REQUEST =====
function setupWhatsAppButton() {
  const adminNumber = '917689874945'; // your WhatsApp number with country code
  const message = `Hi, please activate my cafe.\n\nCafe Name: ${cafeData.cafeName}\nOwner: ${cafeData.ownerName}\nMobile ID: ${ownerMobile}\n\nPlease start my 7-day free trial.`;
  const encodedMsg = encodeURIComponent(message);
  const waLink = `https://wa.me/${adminNumber}?text=${encodedMsg}`;
  document.getElementById('whatsappBtn').href = waLink;
}

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

// ===== GENERATE DYNAMIC QR CODE =====
function generateQR() {
    const tableInput = document.getElementById('tableNumberInput');
    const qrContainer = document.getElementById('qrcode');
    
    // अगर इनपुट बॉक्स नहीं मिला (HTML अपडेट नहीं हुआ है)
    if (!tableInput) {
        alert("Please update HTML file first to add table input!");
        return;
    }

    const tableNumber = tableInput.value.trim();

    if (!tableNumber) {
        alert("Please enter a table number first! (e.g., 1, 2, 3)");
        return;
    }

    const ownerMobile = localStorage.getItem('ownerMobile');
    
    // असली लिंक बनाना (जिसमें कैफे का नंबर और टेबल का नंबर दोनों होंगे)
    const baseUrl = window.location.origin + window.location.pathname.replace('owner-dashboard.html', 'customer-login.html');
    const dynamicUrl = `${baseUrl}?cafe=${encodeURIComponent(ownerMobile)}&table=${encodeURIComponent(tableNumber)}`;

    qrContainer.innerHTML = ""; // पुराना QR साफ करें

    // API से नया QR कोड जनरेट करना
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(dynamicUrl)}`;
    
    const img = document.createElement("img");
    img.src = qrImageUrl;
    img.id = "qrImage"; 
    img.style.borderRadius = "8px";
    
    qrContainer.appendChild(img);
}

// ===== DOWNLOAD QR CODE =====
function downloadQR() {
    const img = document.getElementById('qrImage');
    const tableInput = document.getElementById('tableNumberInput');
    const tableNumber = tableInput ? tableInput.value.trim() : 'Unknown';

    if (!img) {
        alert("Please generate a QR code first!");
        return;
    }

    // QR कोड इमेज को डाउनलोड करना
    fetch(img.src)
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `Table_${tableNumber}_QRCode.png`; // फाइल का नाम टेबल नंबर के साथ सेव होगा
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(() => alert("Error downloading QR code. Please try again."));
      }


// ===== LOGOUT =====
function ownerLogout() {
  localStorage.removeItem('ownerMobile');
  window.location.href = 'owner-login.html';
}
