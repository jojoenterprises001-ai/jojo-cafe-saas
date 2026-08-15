import { db, auth } from './firebase-config.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Jab page load ho jaye
document.addEventListener('DOMContentLoaded', () => {
    const cafeForm = document.getElementById('cafeForm');
    
    if(cafeForm) {
        cafeForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Page refresh hone se rokna

            const cafeName = document.getElementById('cafeName').value;
            const ownerName = document.getElementById('ownerName').value;
            const mobile = document.getElementById('mobile').value;
            const password = document.getElementById('password').value;
            const submitBtn = cafeForm.querySelector('button[type="submit"]');

            // Button ko 'Loading' state mein daalna
            submitBtn.innerText = "Registering...";
            submitBtn.disabled = true;

            try {
                // Smart Trick: Mobile ko dummy email mein badalna free Auth ke liye
                const dummyEmail = mobile + "@jojocafe.com";

                // 1. Firebase Auth mein secure account banana
                const userCredential = await createUserWithEmailAndPassword(auth, dummyEmail, password);
                const user = userCredential.user;

                // 2. Firestore Database mein Cafe ki details save karna
                await setDoc(doc(db, "Cafes", user.uid), {
                    CafeID: user.uid,
                    Name: cafeName,
                    OwnerName: ownerName,
                    OwnerPhone: mobile,
                    PlanExpiry: "Pending", // Super Admin baad mein active karega
                    StaffPIN: "1234", // Default PIN
                    IsActive: false,
                    CreatedAt: new Date().toISOString()
                });

                // 3. UI Update: Form chupao aur Success message dikhao
                document.getElementById('formSection').classList.add('hidden');
                document.getElementById('successSection').classList.remove('hidden');

            } catch (error) {
                alert("Error: " + error.message);
                // Agar error aaye toh button wapas theek kar do
                submitBtn.innerText = "Submit Details";
                submitBtn.disabled = false;
            }
        });
    }
});
