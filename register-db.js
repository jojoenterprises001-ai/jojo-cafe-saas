function showError(msg) {
  const el = document.getElementById('errorMsg');
  el.innerText = msg;
  el.style.display = 'block';
}

function handleRegister() {
  const cafeName = document.getElementById('cafeName').value.trim();
  const ownerName = document.getElementById('ownerName').value.trim();
  const ownerMobile = document.getElementById('ownerMobile').value.trim();
  const whatsappNumber = document.getElementById('whatsappNumber').value.trim();
  const cafeAddress = document.getElementById('cafeAddress').value.trim();
  const ownerPassword = document.getElementById('ownerPassword').value;

  if (!cafeName) return showError('Please enter cafe name');
  if (!ownerName) return showError('Please enter owner name');
  if (!/^[0-9]{10}$/.test(ownerMobile)) return showError('Enter a valid 10-digit login mobile number');
  if (!/^[0-9]{10}$/.test(whatsappNumber)) return showError('Enter a valid 10-digit WhatsApp number');
  if (!cafeAddress) return showError('Please enter cafe address');
  if (!ownerPassword || ownerPassword.length < 6) return showError('Password must be at least 6 characters');

  const cafeRef = db.collection('Cafes').doc(ownerMobile);

  cafeRef.get().then((doc) => {
    if (doc.exists) {
      return showError('This mobile number is already registered.');
    }

    // Create a Firebase Auth account using a fake email based on mobile number
    const fakeEmail = ownerMobile + '@jojocafe.app';
    const auth = firebase.auth();

    auth.createUserWithEmailAndPassword(fakeEmail, ownerPassword)
      .then(() => {
        // Auth account created, now save cafe data in Firestore
        return cafeRef.set({
          cafeName: cafeName,
          ownerName: ownerName,
          ownerMobile: ownerMobile,
          whatsappNumber: whatsappNumber,
          address: cafeAddress,
          status: 'pending',
          plan: null,
          expiryDate: null,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      })
      .then(() => {
        document.getElementById('errorMsg').style.display = 'none';
        auth.signOut(); // sign out so they must login properly
        showSuccessPopup(cafeName, ownerName, ownerMobile);
      })
      .catch((err) => {
        if (err.code === 'auth/email-already-in-use') {
          showError('This mobile number is already registered.');
        } else {
          showError('Error: ' + err.message);
        }
      });
  });
}

function showSuccessPopup(cafeName, ownerName, ownerMobile) {
  const adminNumber = '917689874945';
  const message = `Hi, I registered a new cafe.\n\nCafe Name: ${cafeName}\nOwner: ${ownerName}\nMobile ID: ${ownerMobile}\n\nPlease activate my 7-day free trial.`;
  const encodedMsg = encodeURIComponent(message);
  document.getElementById('waActivateBtn').href = `https://wa.me/${adminNumber}?text=${encodedMsg}`;
  document.getElementById('successOverlay').classList.add('active');
}
