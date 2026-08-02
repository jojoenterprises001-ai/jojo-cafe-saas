// customer-login.js

document.getElementById('customerLoginForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Page ko reload hone se rokna

    const name = document.getElementById('custName').value;
    const mobile = document.getElementById('custMobile').value;
    const btn = document.getElementById('cust-login-btn');

    // Button ko loading state mein daalna
    btn.innerText = "Loading... ⏳";
    btn.disabled = true;

    // Database mein Customer ko save karna
    db.collection("Customers").doc(mobile).set({
        name: name,
        mobile: mobile,
        ticks: 0, // Shuru mein 0 tick rahenge
        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true }) // merge: true se purane customer ke ticks delete nahi honge
    .then(() => {
        // Data save hone ke baad seedha Dashboard par bhej dena
        window.location.href = "customer-dashboard.html";
    })
    .catch((error) => {
        console.error("Error: ", error);
        alert("Login failed! Please try again.");
        btn.innerText = "Enter Dashboard 🚀";
        btn.disabled = false;
    });
});
      
