// Get cafe ID from URL (?cafe=CAFEID) e.g. via QR code
const urlParams = new URLSearchParams(window.location.search);
const cafeIdFromUrl = urlParams.get('cafe');

if (cafeIdFromUrl) {
  localStorage.setItem('cafeId', cafeIdFromUrl);
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
  el.innerText = msg;
  el.style.display = 'block';
}

function handleLogin() {
  const name = document.getElementById('custName').value.trim();
  const mobile = document.getElementById('custMobile').value.trim();
  const cafeId = localStorage.getItem('cafeId');

  if (!name) return showError('Please enter your name');
  if (!/^[0-9]{10}$/.test(mobile)) return showError('Enter a valid 10-digit mobile number');
  if (!cafeId) return showError('Cafe not found. Please scan the QR code again.');

  document.getElementById('errorMsg').style.display = 'none';

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
        ticks: 0,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }).then(() => {
        window.location.href = 'customer-dashboard.html';
      });
    } else {
      // Existing customer, just update name if changed
      customerRef.update({ name: name }).then(() => {
        window.location.href = 'customer-dashboard.html';
      });
    }
  }).catch((err) => {
    showError('Error: ' + err.message);
  });
        }
