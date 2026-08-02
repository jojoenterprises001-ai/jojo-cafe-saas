// admin-logic.js - Part 11

// Dropdown change hone par Custom Date box show karne ke liye
document.addEventListener('change', function(e) {
    if(e.target.id.startsWith('validity-')) {
        const cafeId = e.target.id.split('-')[1];
        const dateInput = document.getElementById(`custom-date-${cafeId}`);
        if(e.target.value === 'custom') {
            dateInput.style.display = 'block';
        } else {
            dateInput.style.display = 'none';
        }
    }
});

// Cafe Approve aur Auto-Expiry set karne ka function
function approveCafe(cafeId) {
    const validitySelect = document.getElementById(`validity-${cafeId}`).value;
    let expiryDate = new Date();

    if (validitySelect === '7') {
        expiryDate.setDate(expiryDate.getDate() + 7);
    } else if (validitySelect === '30') {
        expiryDate.setDate(expiryDate.getDate() + 30);
    } else if (validitySelect === 'custom') {
        const customDate = document.getElementById(`custom-date-${cafeId}`).value;
        if(!customDate) {
            alert("Please select a valid custom date!");
            return;
        }
        expiryDate = new Date(customDate);
    }

    // Yeh message Super Admin ko dikhega
    alert(`Success! Cafe Approved.\nAuto-Deactivate Date Set For: ${expiryDate.toDateString()}`);
    
    // Future (Part 13) mein hum yeh date Firebase database mein save karenge.
    // Database check karega ki agar aaj ki date Expiry Date se badi hai, toh account lock ho jayega.
}

// Manual Deactivate function
function deactivateCafe(cafeId) {
    const confirmDeactivate = confirm("Are you sure you want to deactivate this cafe immediately?");
    if(confirmDeactivate) {
        alert("Cafe Deactivated! They can no longer login.");
    }
}

