// ===== OWNER LOGIN CHECK =====
let ownerMobile = localStorage.getItem('ownerMobile');

if (!ownerMobile) {
  window.location.href = 'owner-login.html';
}

let cafeData = null;
let selectedPhotoUrl = '';
let selectedPhotoName = '';

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
  const now = new Date();
  const isExpired = cafeData.expiryDate && new Date(cafeData.expiryDate) < now;

  if (cafeData.status === 'approved' && !isExpired) {
    badge.innerText = '✓ Approved' + (cafeData.plan ? ' • ' + cafeData.plan : '');
    badge.className = 'status-badge status-approved';
    document.getElementById('dashboardContent').style.display = 'block';
    document.getElementById('lockedContent').style.display = 'none';
    
    loadMenuList();
  } else if (cafeData.status === 'approved' && isExpired) {
    badge.innerText = '⚠ Expired';
    badge.className = 'status-badge status-expired';
    document.getElementById('dashboardContent').style.display = 'none';
    document.getElementById('lockedContent').style.display = 'block';
    document.getElementById('lockedTitle').innerText = '⚠ Plan Expired';
    document.getElementById('lockedMsg').innerText = 'Your validity period has ended. Message us on WhatsApp to renew.';
    setupWhatsAppButton('renew');
  } else {
    badge.innerText = '⏳ Pending Approval';
    badge.className = 'status-badge status-pending';
    document.getElementById('dashboardContent').style.display = 'none';
    document.getElementById('lockedContent').style.display = 'block';
    document.getElementById('lockedTitle').innerText = '⏳ Activation Pending';
    document.getElementById('lockedMsg').innerText = 'Your cafe is registered but not active yet. Send us a WhatsApp message to activate your account.';
    setupWhatsAppButton('activate');
  }
});

// ===== WHATSAPP BUTTON =====
function setupWhatsAppButton(type) {
  const adminNumber = '917689874945';
  let message;
  if (type === 'renew') {
    message = `Hi, my cafe plan has expired.\n\nCafe Name: ${cafeData.cafeName}\nMobile ID: ${ownerMobile}\n\nPlease renew my plan.`;
  } else {
    message = `Hi, please activate my cafe.\n\nCafe Name: ${cafeData.cafeName}\nOwner: ${cafeData.ownerName}\nMobile ID: ${ownerMobile}\n\nPlease start my 7-day free trial.`;
  }
  const encodedMsg = encodeURIComponent(message);
  const waLink = `https://wa.me/${adminNumber}?text=${encodedMsg}`;
  document.getElementById('whatsappBtn').href = waLink;
}

// ===== GIVE LOYALTY TICK (with ₹299 minimum bill check) =====
function giveTick() {
  const mobile = document.getElementById('tickMobile').value.trim();
  const billAmount = Number(document.getElementById('tickBillAmount').value.trim());
  const msg = document.getElementById('tickMsg');

  if (!/^[0-9]{10}$/.test(mobile)) {
    msg.style.color = 'red';
    msg.innerText = 'Enter a valid 10-digit number';
    return;
  }
  if (!billAmount || billAmount < 299) {
    msg.style.color = 'red';
    msg.innerText = 'Bill must be ₹299 or more to give a tick';
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
    const updateData = { ticks: newTicks };

    // Generate coupon code if reaching 7 ticks
    if (newTicks === 7) {
      updateData.couponCode = generateCouponCode();
      updateData.couponActive = true;
    }

    custRef.update(updateData).then(() => {
      msg.style.color = 'green';
      msg.innerText = `✅ Tick added! Now at ${newTicks}/7`;
      document.getElementById('tickMobile').value = '';
      document.getElementById('tickBillAmount').value = '';
    });
  });
}

function generateCouponCode() {
  return 'JOJO' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ===== REDEEM COUPON (with unique code verification) =====
function redeemCoupon() {
  const mobile = document.getElementById('redeemMobile').value.trim();
  const code = document.getElementById('redeemCode').value.trim().toUpperCase();
  const msg = document.getElementById('redeemMsg');

  if (!/^[0-9]{10}$/.test(mobile)) {
    msg.style.color = 'red';
    msg.innerText = 'Enter a valid 10-digit number';
    return;
  }
  if (!code) {
    msg.style.color = 'red';
    msg.innerText = 'Enter the coupon code';
    return;
  }

  const custRef = db.collection('Customers').doc(mobile);
  custRef.get().then((doc) => {
    if (!doc.exists) {
      msg.style.color = 'red';
      msg.innerText = 'Customer not found';
      return;
    }
    const data = doc.data();
    if (!data.couponActive || data.couponCode !== code) {
      msg.style.color = 'red';
      msg.innerText = 'Invalid or already used coupon code';
      return;
    }
    custRef.update({
      ticks: 0,
      couponActive: false,
      couponCode: firebase.firestore.FieldValue.delete()
    }).then(() => {
      msg.style.color = 'green';
      msg.innerText = '🎉 ₹150 Discount Applied! Coupon redeemed & ticks reset.';
      document.getElementById('redeemMobile').value = '';
      document.getElementById('redeemCode').value = '';
    });
  });
                     }
// ===== PHOTO PICKER =====
function openPhotoPicker() {
  renderPhotoGrid();
  document.getElementById('photoModal').classList.add('active');
}

function closePhotoPicker() {
  document.getElementById('photoModal').classList.remove('active');
}

function renderPhotoGrid() {
  const container = document.getElementById('photoGridContainer');
  container.innerHTML = '';

  // Group by category
  const categories = {};
  PHOTO_LIBRARY.forEach((item) => {
    if (!categories[item.category]) categories[item.category] = [];
    categories[item.category].push(item);
  });

  Object.keys(categories).forEach((catName) => {
    const catTitle = document.createElement('div');
    catTitle.className = 'category-title';
    catTitle.innerText = catName;
    container.appendChild(catTitle);

    const grid = document.createElement('div');
    grid.className = 'photo-grid';

    categories[catName].forEach((item) => {
      const gridItem = document.createElement('div');
      gridItem.className = 'photo-grid-item';
      gridItem.innerHTML = `
        <img src="${item.url}" onclick="selectPhoto('${item.url}', '${item.name.replace(/'/g,"\\'")}')">
        <p>${item.name}</p>
      `;
      grid.appendChild(gridItem);
    });

    container.appendChild(grid);
  });
}

function selectPhoto(url, name) {
  selectedPhotoUrl = url;
  selectedPhotoName = name;

  document.getElementById('previewImg').src = url;
  document.getElementById('previewName').innerText = name;
  document.getElementById('selectedPhotoPreview').style.display = 'flex';

  closePhotoPicker();
}

// ===== MENU MANAGER =====
function addMenuItem() {
  const name = document.getElementById('itemName').value.trim();
  const price = document.getElementById('itemPrice').value.trim();
  const msg = document.getElementById('menuMsg');

  if (!name || !price) {
    msg.style.color = 'red';
    msg.innerText = 'Enter item name and price';
    return;
  }
  if (!selectedPhotoUrl) {
    msg.style.color = 'red';
    msg.innerText = 'Please choose a photo for this item';
    return;
  }

  db.collection('Menu').add({
    cafeId: ownerMobile,
    name: name,
    price: Number(price),
    photoUrl: selectedPhotoUrl,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    msg.style.color = 'green';
    msg.innerText = '✅ Item added to menu!';
    document.getElementById('itemName').value = '';
    document.getElementById('itemPrice').value = '';
    document.getElementById('selectedPhotoPreview').style.display = 'none';
    selectedPhotoUrl = '';
    selectedPhotoName = '';
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
        <img src="${item.photoUrl}">
        <div class="item-details">${item.name} — ₹${item.price}</div>
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

// ===== TABLE-WISE QR CODE GENERATOR =====
let currentTableNumber = null;

function generateTableQR() {
  const tableNum = document.getElementById('tableNumberInput').value.trim();
  if (!tableNum || tableNum < 1) {
    alert('Enter a valid table number');
    return;
  }
  currentTableNumber = tableNum;

  const qrContainer = document.getElementById('qrcode');
  qrContainer.innerHTML = '';

  const baseUrl = window.location.origin + window.location.pathname.replace('owner-dashboard.html', 'customer-login.html');
  const menuUrl = baseUrl + '?cafe=' + ownerMobile + '&table=' + tableNum;
alert(menuUrl);
  new QRCode(qrContainer, {
    text: menuUrl,
    width: 180,
    height: 180,
    colorDark: '#667eea',
    colorLight: '#ffffff'
  });

  document.getElementById('qrTableLabel').innerText = 'Table ' + tableNum;
  document.getElementById('qrResultBox').style.display = 'block';
}

function downloadQR() {
  const canvas = document.querySelector('#qrcode canvas');
  if (!canvas) return;
  const link = document.createElement('a');
  link.download = cafeData.cafeName + '-Table' + currentTableNumber + '-QR.png';
  link.href = canvas.toDataURL();
  link.click();
}

// ===== LOGOUT =====
function ownerLogout() {
  localStorage.removeItem('ownerMobile');
  window.location.href = 'owner-login.html';
}
