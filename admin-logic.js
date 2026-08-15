import { db, auth } from './firebase-config.js';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const adminLoginForm = document.getElementById('adminLoginForm');
const logoutBtn = document.getElementById('logoutBtn');
const cafesList = document.getElementById('cafesList');

// 1. Check karna ki Admin Login hai ya nahi
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');
        loadCafes(); 
    } else {
        loginSection.classList.remove('hidden');
        dashboardSection.classList.add('hidden');
    }
});

// 2. Admin Login Process
adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        alert("Login Failed: Galat Email ya Password!");
    }
});

// 3. Logout
logoutBtn.addEventListener('click', async () => {
    await signOut(auth);
});

// 4. Database se Cafes ki details lana (Updated with 7, 30, 90 Days)
async function loadCafes() {
    cafesList.innerHTML = "<p class='text-blue-500 font-bold'>Data Load ho raha hai...</p>";
    try {
        const querySnapshot = await getDocs(collection(db, "Cafes"));
        cafesList.innerHTML = ""; 

        if(querySnapshot.empty) {
            cafesList.innerHTML = "<p class='text-gray-500'>Koi cafe register nahi hua hai abhi tak.</p>";
            return;
        }

        querySnapshot.forEach((document) => {
            const cafe = document.data();
            const cafeId = document.id;
            
            const statusColor = cafe.IsActive ? "text-green-600" : "text-red-500";
            const statusText = cafe.IsActive ? "🟢 Active" : "🔴 Pending";

            const cafeCard = document.createElement('div');
            cafeCard.className = "border-2 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 gap-4";
            
            // Yahan 7, 30, aur 90 din ke alag-alag buttons add kiye gaye hain
            cafeCard.innerHTML = `
                <div>
                    <h4 class="font-extrabold text-xl text-blue-700">${cafe.Name}</h4>
                    <p class="text-sm text-gray-700 font-medium mt-1">👤 Owner: ${cafe.OwnerName} | 📞 ${cafe.OwnerPhone}</p>
                    <p class="text-sm font-bold mt-1 ${statusColor}">Status: ${statusText} <span class="text-gray-500 ml-2">| Plan Expiry: ${cafe.PlanExpiry}</span></p>
                </div>
                <div class="flex flex-wrap gap-2 w-full md:w-auto mt-2 md:mt-0">
                    ${!cafe.IsActive 
                        ? `
                           <button onclick="activateCafe('${cafeId}', 7)" class="bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-bold px-3 py-2 rounded-lg shadow transition">Trial (7 Days)</button>
                           <button onclick="activateCafe('${cafeId}', 30)" class="bg-green-500 hover:bg-green-600 text-white text-sm font-bold px-3 py-2 rounded-lg shadow transition">Monthly (30 Days)</button>
                           <button onclick="activateCafe('${cafeId}', 90)" class="bg-purple-500 hover:bg-purple-600 text-white text-sm font-bold px-3 py-2 rounded-lg shadow transition">Pro (90 Days)</button>
                          ` 
                        : `<button onclick="deactivateCafe('${cafeId}')" class="w-full md:w-auto bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-lg shadow transition">Deactivate Panel</button>`}
                </div>
            `;
            cafesList.appendChild(cafeCard);
        });
    } catch (error) {
        console.error(error);
        cafesList.innerHTML = "<p class='text-red-500'>Data load karne mein error aayi.</p>";
    }
}

// 5. Cafe ko chune hue din ke hisaab se Activate karna
window.activateCafe = async function(cafeId, days) {
    const confirmAction = confirm(`Kya aap is cafe ko ${days} din ke liye Active karna chahte hain?`);
    if(confirmAction) {
        try {
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + days); // Aaj ki date mein 7/30/90 din jodne ka formula
            
            await updateDoc(doc(db, "Cafes", cafeId), {
                IsActive: true,
                PlanExpiry: expiryDate.toLocaleDateString('en-IN') 
            });
            alert(`✅ Cafe Successfully Activated for ${days} Days!`);
            loadCafes(); 
        } catch(error) {
            alert("Error: " + error.message);
        }
    }
}

// 6. Cafe ko Deactivate (Band) karna
window.deactivateCafe = async function(cafeId) {
    const confirmAction = confirm("🚨 Kya aap sure hain ki is cafe ka system band karna hai?");
    if(confirmAction) {
        try {
            await updateDoc(doc(db, "Cafes", cafeId), {
                IsActive: false,
                PlanExpiry: "Expired"
            });
            alert("Cafe Deactivated!");
            loadCafes(); 
        } catch(error) {
            alert("Error: " + error.message);
        }
    }
}

