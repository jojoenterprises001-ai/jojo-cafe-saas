// admin-logic.js - Part 18 (Updated with Firebase)

// Jaise hi page load hoga, pending cafes database se aayenge
window.onload = function() {
    const listDiv = document.getElementById('pending-cafes-list');
    
    // Database se "pending" status wale cafes check karna
    db.collection("Cafes").where("status", "==", "pending").onSnapshot((querySnapshot) => {
        listDiv.innerHTML = ''; // Loading text hata dena
        
        if (querySnapshot.empty) {
            listDiv.innerHTML = '<p style="color: #25D366; text-align: center;">Koi nayi request nahi hai! 🎉</p>';
            return;
        }

        // Har ek naye cafe ke liye ek Card banana
        querySnapshot.forEach((doc) => {
            const cafe = doc.data();
            const cafeId = doc.id;
            
            const cardHtml = `
            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; margin-bottom: 15px;">
                <h4 style="color: #fff; font-size: 18px;">${cafe.cafeName}</h4>
                <p style="color: #ddd; font-size: 14px; margin-bottom: 10px;">Mobile: ${cafe.mobileNumber}</p>
                
                <select id="validity-${cafeId}" class="input-field" style="width: 100%; margin-bottom: 10px;">
                    <option value="7">7 Days Free Trial</option>
                    <option value="30">30 Days Paid Plan</option>
                </select>
                
                <button class="btn-3d" onclick="approveCafe('${cafeId}')" style="background: linear-gradient(145deg, #00b4d8, #0077b6); box-shadow: 0 4px 0 #023e8a;">
                    Approve & Activate ✅
                </button>
            </div>
            `;
            listDiv.innerHTML += cardHtml;
        });
    });
};

// Cafe Approve aur Database mein Expiry Date save karne ka function
function approveCafe(cafeId) {
    const days = parseInt(document.getElementById(`validity-${cafeId}`).value);
    
    let expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days); // Aaj se utne din aage ki date

    // Firebase mein document update karna
    db.collection("Cafes").doc(cafeId).update({
        status: "active",
        expiryDate: firebase.firestore.Timestamp.fromDate(expiryDate)
    })
    .then(() => {
        alert(`Success! Cafe Approved.\nValid till: ${expiryDate.toDateString()}`);
    })
    .catch((error) => {
        console.error("Error updating: ", error);
        alert("Kuch gadbad hui, wapas try karein.");
    });
}
