// customer-login.js - Updated to remember user
document.getElementById('customerLoginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('custName').value;
    const mobile = document.getElementById('custMobile').value;
    const btn = document.getElementById('cust-login-btn');

    btn.innerText = "Loading... ⏳";
    btn.disabled = true;

    db.collection("Customers").doc(mobile).set({
        name: name,
        mobile: mobile,
        ticks: firebase.firestore.FieldValue.increment(0), // Ticks ko safe rakhne ke liye
        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true })
    .then(() => {
        // JADOO YAHAN HAI: Mobile number browser mein save kar liya
        localStorage.setItem("loggedInMobile", mobile);
        window.location.href = "customer-dashboard.html";
    })
    .catch((error) => {
        console.error("Error: ", error);
        alert("Login failed! Please try again.");
        btn.innerText = "Enter Dashboard 🚀";
        btn.disabled = false;
    });
});
                             
