
// ===== Get cafe ID and Table from URL =====
const urlParams = new URLSearchParams(window.location.search);
const cafeIdFromUrl = urlParams.get('cafe');
const tableFromUrl = urlParams.get('table');

if (cafeIdFromUrl) {
    localStorage.setItem('cafeId', cafeIdFromUrl);
}
if (tableFromUrl) {
    localStorage.setItem('tableNumber', tableFromUrl);
}

// Auto-redirect if already logged in for this cafe
window.onload = function () {
    const savedMobile = localStorage.getItem('customerMobile');
    const savedCafe = localStorage.getItem('cafeId');
    if (savedMobile && savedCafe) {
        window.location.href = 'customer-dashboard.html';
    }
};

function showError(msg) {
    const el = document.getElementById('errorMsg');
    if(el) {
        el.innerText = msg;
        el.style.display = 'block';
    } else {
        alert(msg);
    }
}

function handleLogin() {
    const name = document.getElementById('custName').value.trim();
    const mobile = document.getElementById('custMobile').value.trim();
    const cafeId = localStorage.getItem('cafeId');
    const tableNumber = localStorage.getItem('tableNumber') || 'Unknown'; // यहाँ टेबल नंबर ऐड किया गया है

    if (!name) return showError('Please enter your name');
    if (!/^[0-9]{10}$/.test(mobile)) return showError('Enter a valid 10-digit number');
    if (!cafeId) return showError('Cafe not found. Please scan the QR code again.');

    const errorMsgEl = document.getElementById('errorMsg');
    if(errorMsgEl) errorMsgEl.style.display = "none";

    // Save locally
    localStorage.setItem('customerName', name);
    localStorage.setItem('customerMobile', mobile);

    // Create or update customer doc in Firestore
    const customerRef = db.collection('Customers').doc(mobile);
    customerRef.get().then((doc) => {
        if (!doc.exists) {
            customerRef.set({
                name: name,
                mobile: mobile,
                cafeId: cafeId,
                tableNumber: tableNumber, // Firebase में अब टेबल नंबर भी सेव होगा
                ticks: 0,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                window.location.href = 'customer-dashboard.html';
            });
        } else {
            // Existing customer, just update details
            customerRef.update({ 
                name: name,
                cafeId: cafeId,
                tableNumber: tableNumber 
            }).then(() => {
                window.location.href = 'customer-dashboard.html';
            });
        }
    }).catch((err) => {
        showError('Error: ' + err.message);
    });
}
