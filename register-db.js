// register-db.js - Part 15

// Form submit hone par function chalega
document.getElementById('cafe-register-form').addEventListener('submit', function(e) {
    e.preventDefault(); // Page reload hone se rokna

    const cafeName = document.getElementById('cafe-name-input').value;
    const mobile = document.getElementById('mobile-input').value;

    // Button ko loading state mein daalna
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.innerText = "Registering... ⏳";
    submitBtn.disabled = true;

    // Firebase (Firestore) mein data save karna
    db.collection("Cafes").add({
        cafeName: cafeName,
        mobileNumber: mobile,
        status: "pending",       // Default status pending hoga
        registeredAt: firebase.firestore.FieldValue.serverTimestamp() // Time of registration
    })
    .then((docRef) => {
        console.log("Cafe Registered with ID: ", docRef.id);
        // Successful hone par WhatsApp wale page par bhej dena
        window.location.href = "whatsapp-trial.html";
    })
    .catch((error) => {
        console.error("Error adding document: ", error);
        alert("Kuch gadbad hui! Please try again.");
        submitBtn.innerText = "Register Cafe 🚀";
        submitBtn.disabled = false;
    });
});

