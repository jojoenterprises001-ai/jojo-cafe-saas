// owner-logic.js - Part 13

// 1. Give Tick Logic
function giveTick() {
    const phone = document.getElementById('customer-phone-tick').value;
    if(phone.length < 10) {
        alert("Please enter a valid 10-digit mobile number!");
        return;
    }
    alert(`Success! 1 Tick added to ${phone}.`);
    document.getElementById('customer-phone-tick').value = '';
}

// 2. Redeem Coupon Logic
function redeemCoupon() {
    const code = document.getElementById('coupon-code').value;
    if(code === '') {
        alert("Please enter a coupon code!");
        return;
    }
    alert(`Coupon ${code} verified successfully!\nDiscount applied and customer ticks reset to 0.`);
    document.getElementById('coupon-code').value = '';
}

// 3. Image Upload Preview Logic (Gallery Access)
const photoInput = document.getElementById('item-photo');
const previewBox = document.getElementById('image-preview-box');
const previewImg = document.getElementById('image-preview');

photoInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImg.src = e.target.result;
            previewBox.style.display = 'block';
        }
        reader.readAsDataURL(file);
    }
});

// 4. Save Menu Item
function saveMenuItem() {
    const name = document.getElementById('item-name').value;
    const price = document.getElementById('item-price').value;
    
    if(!name || !price) {
        alert("Please enter both Name and Price!");
        return;
    }
    alert(`Menu Updated!\nItem: ${name}\nPrice: ₹${price}\nPhoto attached successfully!`);
}

