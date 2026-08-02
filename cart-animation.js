// ===== ADD TO CART with flying animation =====
function addToCart(id, name, price, emoji, event) {
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, price, emoji, qty: 1 });
  }
  updateCartCount();
  flyToCart(event, emoji);
}

function updateCartCount() {
  const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);
  document.getElementById('cartCount').innerText = totalQty;
}

function flyToCart(event, emoji) {
  if (!event) return;
  const btn = event.target;
  const btnRect = btn.getBoundingClientRect();
  const cartBtn = document.querySelector('.topbar-right .icon-btn:nth-child(2)');
  const cartRect = cartBtn.getBoundingClientRect();

  const flyEl = document.createElement('div');
  flyEl.className = 'flying-emoji';
  flyEl.innerText = emoji;
  flyEl.style.left = btnRect.left + 'px';
  flyEl.style.top = btnRect.top + 'px';
  document.body.appendChild(flyEl);

  requestAnimationFrame(() => {
    flyEl.style.left = cartRect.left + 'px';
    flyEl.style.top = cartRect.top + 'px';
    flyEl.style.opacity = '0.3';
    flyEl.style.transform = 'scale(0.3)';
  });

  setTimeout(() => flyEl.remove(), 650);
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
      <div class="item-info">${item.emoji} ${item.name}<br><small>₹${item.price} each</small></div>
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
