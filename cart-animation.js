// cart-animation.js - Part 7
let cartCount = 0;

function flyToCart(event, itemEmoji) {
    // 1. Button ki position pata karna
    const button = event.target;
    const rect = button.getBoundingClientRect();
    
    // 2. Udne wala naya element (emoji) banana
    const flyingElement = document.createElement('div');
    flyingElement.classList.add('flying-item');
    flyingElement.innerText = itemEmoji;
    
    // Usko theek wahi rakhna jahan click hua hai
    flyingElement.style.left = rect.left + 'px';
    flyingElement.style.top = rect.top + 'px';
    
    document.body.appendChild(flyingElement);
    
    // 3. Cart Icon ki position pata karna
    const cart = document.getElementById('cart-icon');
    const cartRect = cart.getBoundingClientRect();
    
    // 4. Animation chalana (Cart ki taraf bhejna)
    setTimeout(() => {
        flyingElement.style.left = (cartRect.left + 15) + 'px';
        flyingElement.style.top = (cartRect.top + 10) + 'px';
        flyingElement.style.transform = 'scale(0.2) rotate(360deg)';
        flyingElement.style.opacity = '0.5';
    }, 50);
    
    // 5. Element ko delete karna aur number badhana
    setTimeout(() => {
        flyingElement.remove();
        
        // Cart ko thoda sa bounce karwana
        cart.style.transform = 'scale(1.2)';
        setTimeout(() => cart.style.transform = 'scale(1)', 200);
        
        // Number update karna
        cartCount++;
        document.getElementById('cart-count').innerText = cartCount;
    }, 850); // CSS transition ke time (0.8s) se match karta hua
}

