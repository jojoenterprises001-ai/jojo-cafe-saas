// dashboard-logic.js - Part 23

// Browser se logged-in customer ka number nikalna
const userMobile = localStorage.getItem("loggedInMobile");

if (!userMobile) {
    // Agar number nahi mila toh wapas login page par bhej do
    alert("Please login first!");
    window.location.href = "index.html";
} else {
    // Firebase se Ticks live check karna
    db.collection("Customers").doc(userMobile).onSnapshot((doc) => {
        if (doc.exists) {
            const customerData = doc.data();
            const totalTicks = customerData.ticks || 0;
            
            // Saare 7 dabbo ko pehle reset karna
            for(let i=1; i<=7; i++) {
                let box = document.getElementById(`tick-${i}`);
                if (box) {
                    box.style.background = "rgba(0, 0, 0, 0.3)";
                    box.innerHTML = "";
                    box.style.boxShadow = "none";
                }
            }

            // Jitne ticks hain, utne dabbo ko Green aur Checkmark (✔) karna
            for(let i=1; i<=totalTicks; i++) {
                if(i > 7) break; // 7 se zyada dabbo par nahi jana
                let box = document.getElementById(`tick-${i}`);
                if (box) {
                    box.style.background = "#25D366";
                    box.innerHTML = "✔";
                    box.style.color = "white";
                    box.style.boxShadow = "0 0 10px #25D366";
                }
            }
        }
    });
}

