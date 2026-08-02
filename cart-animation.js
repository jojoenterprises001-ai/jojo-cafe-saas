let cartCount = 0;
let cartTotal = 0;
let cartItems = []; // Asli items yahan store honge

// Animation and Add to Cart Logic
function flyToCart(event, itemEmoji, itemName, itemPrice) {
    const button = event.target;
    const rect = button.getBoundingClientRect();
    
    const flyingElement = document.createElement('div');
    flyingElement.classList.add('flying-item');
    flyingElement.innerText = itemEmoji;
    flyingElement.style.left = rect.left + 'px';
    flyingElement.style.top = rect.top + 'px';
    document.body.appendChild(flyingElement);
    
    const cart = document.getElementById('cart-icon');
    const cartRect = cart.getBoundingClientRect();
    
    setTimeout(() => {
        flyingElement.style.left = (cartRect.left + 15) + 'px';
        flyingElement.style.top = (cartRect.top + 10) + 'px';
        flyingElement.style.transform = 'scale(0.2) rotate(360deg)';
        flyingElement.style.opacity = '0.5';
    }, 50);
    
    setTimeout(() => {
        flyingElement.remove();
        cart.style.transform = 'scale(1.2)';
        setTimeout(() => cart.style.transform = 'scale(1)', 200);
        
        // 1. Navbar mein number badhana
        cartCount++;
        document.getElementById('cart-count').innerText = cartCount;

        // 2. Asli Bill ke liye data save karna
        cartTotal += itemPrice;
        cartItems.push({ name: itemName, price: itemPrice, emoji: itemEmoji });
        
    }, 850); 
}

// CART Kholne ka Logic (Jab Cart Icon par click ho)
document.getElementById('cart-icon').addEventListener('click', function() {
    if (cartCount === 0) {
        alert("Your cart is empty! Please add some items.");
        return;
    }

    const modal = document.getElementById('cart-modal');
    const list = document.getElementById('cart-items-list');
    
    // Purani list saaf karna aur nayi dikhana
    list.innerHTML = '';
    cartItems.forEach(item => {
        list.innerHTML += `
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding: 8px 0;">
            <span style="color: #fff;">${item.emoji} ${item.name}</span>
            <span style="font-weight: bold;">₹${item.price}</span>
        </div>`;
    });
    
    // Total price set karna
    document.getElementById('cart-total').innerText = cartTotal;
    
    // Popup dikhana
    modal.style.display = 'block';
});

// CART Band Karne Ka Logic
function closeCart() {
    document.getElementById('cart-modal').style.display = 'none';
}

// Order Place Karne ka Logic
function placeOrder() {
    alert(`🎉 Order Placed Successfully!\nTotal Bill: ₹${cartTotal}\nPlease show this to the counter.`);
    
    // Order hone ke baad Cart khali kar dena
    cartItems = [];
    cartTotal = 0;
    cartCount = 0;
    document.getElementById('cart-count').innerText = 0;
    closeCart();
}
