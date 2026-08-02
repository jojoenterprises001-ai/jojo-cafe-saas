// owner-logic.js - Updated with Real Firebase Logic

// 1. Asli Tick Dene ka function
function giveTick() {
    const phone = document.getElementById('customer-phone-tick').value;
    const btn = document.getElementById('tick-btn');

    if(phone.length < 10) {
        alert("Please enter a valid 10-digit mobile number!");
        return;
    }

    btn.innerText = "Adding... ⏳";
    btn.disabled = true;

    // Database mein customer ko dhundhna aur tick badhana
    const customerRef = db.collection("Customers").doc(phone);

    customerRef.get().then((doc) => {
        if (doc.exists) {
            // Agar customer pehle se hai, toh uske tick 1 se badha do
            let currentTicks = doc.data().ticks || 0;
            if(currentTicks >= 7) {
                alert("This customer already has 7 ticks! Time to redeem coupon.");
            } else {
                customerRef.update({ ticks: currentTicks + 1 }).then(() => {
                    alert(`Success! Tick added. Total Ticks: ${currentTicks + 1}`);
                });
            }
        } else {
            // Agar naya customer hai (login nahi kiya pehle), toh naya account bana do
            customerRef.set({
                mobile: phone,
                ticks: 1,
                lastAdded: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                alert("New Customer Created & 1 Tick Added!");
            });
        }
        
        // Form theek karna
        document.getElementById('customer-phone-tick').value = '';
        btn.innerText = "Add 1 Tick ➔";
        btn.disabled = false;
        
    }).catch((error) => {
        console.error("Error: ", error);
        alert("Kuch gadbad hui, wapas try karein!");
        btn.innerText = "Add 1 Tick ➔";
        btn.disabled = false;
    });
}

// 2. Redeem Coupon (Ticks ko wapas 0 karna)
function redeemCoupon() {
    const phone = document.getElementById('coupon-phone').value;
    if(phone.length < 10) {
        alert("Valid number daaliye!");
        return;
    }

    const customerRef = db.collection("Customers").doc(phone);
    customerRef.get().then((doc) => {
        if (doc.exists && doc.data().ticks >= 7) {
            customerRef.update({ ticks: 0 }).then(() => {
                alert("🎉 Coupon Verified & Applied! Ticks reset to 0.");
                document.getElementById('coupon-phone').value = '';
            });
        } else {
            alert("Customer ke paas abhi 7 ticks nahi hain!");
        }
    });
}
