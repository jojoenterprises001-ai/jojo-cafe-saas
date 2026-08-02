// ===== ADD TO CART (shared data function) =====
function addToCartData(id, name, price, photoUrl) {
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, price, photoUrl, qty: 1 });
  }
  updateCartCount();
}

// ===== ADD TO CART via "Add +" button (with fly animation from button position) =====
function addToCart(id, name, price, photoUrl, event) {
  addToCartData(id, name, price, photoUrl);
  flyToCart(event, photoUrl);
}

function updateCartCount() {
  const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);
  document.getElementById('cartCount').innerText = totalQty;
}

// ===== 3D FLY ANIMATION (from Add+ button click) =====
function flyToCart(event, photoUrl) {
  if (!event) return;
  const btn = event.target;
  const btnRect = btn.getBoundingClientRect();
  flyAnimation(btnRect.left, btnRect.top, photoUrl);
}

// ===== 3D FLY ANIMATION (from center popup) =====
function flyToCartFromCenter(photoUrl) {
  const centerX = window.innerWidth / 2 - 30;
  const centerY = window.innerHeight / 2 - 30;
  flyAnimation(centerX, centerY, photoUrl);
}

function flyAnimation(startX, startY, photoUrl) {
  const cartBtn = document.querySelectorAll('.topbar-right .icon-btn')[2]; // cart is 3rd icon
  if (!cartBtn) return;
  const cartRect = cartBtn.getBoundingClientRect();

  const flyEl = document.createElement('img');
  flyEl.className = 'flying-photo';
  flyEl.src = photoUrl;
  flyEl.style.left = startX + 'px';
  flyEl.style.top = startY + 'px';
  flyEl.style.transform = 'scale(1) rotate(0deg)';
  document.getElementById('flyLayer').appendChild(flyEl);

  requestAnimationFrame(() => {
    flyEl.style.left = cartRect.left + 'px';
    flyEl.style.top = cartRect.top + 'px';
    flyEl.style.transform = 'scale(0.2) rotate(360deg)';
    flyEl.style.opacity = '0.3';
  });

  setTimeout(() => flyEl.remove(), 750);
}

// ===== RENDER CART MODAL =====
function renderCart() {
  const list = document.getElementById('cartItemsList');
  if (cart.length === 0) {
    list.innerHTML = '<p style="text-align:center; color:#999; padding:20px 0;">Your cart is empty</p>';
    document.getElementById('cartTotal').innerText = '₹0';
    return;
  }
  list.innerHTML = '';
  let total = 0;
  cart.forEach((item, index) => {
    total += item.price * item.qty;
    const row = document.createElement('div');
    row.className = 'cart-row';
    row.innerHTML = `
      <div class="item-info"><img src="${item.photoUrl}">${item.name}<br><small>₹${item.price} each</small></div>
      <div class="qty-controls">
        <button onclick="changeQty(${index}, -1)">−</button>
        <span>${item.qty}</span>
        <button onclick="changeQty(${index}, 1)">+</button>
      </div>
    `;
    list.appendChild(row);
  });
  document.getElementById('cartTotal').innerText = '₹' + total;
}

function changeQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }
  updateCartCount();
  renderCart();
}
