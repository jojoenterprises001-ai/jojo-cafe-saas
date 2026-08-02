function showError(msg) {
  const el = document.getElementById('errorMsg');
  el.innerText = msg;
  el.style.display = 'block';
  document.getElementById('successMsg').style.display = 'none';
}

function showSuccess(msg) {
  const el = document.getElementById('successMsg');
  el.innerText = msg;
  el.style.display = 'block';
  document.getElementById('errorMsg').style.display = 'none';
}

function handleRegister() {
  const cafeName = document.getElementById('cafeName').value.trim();
  const ownerName = document.getElementById('ownerName').value.trim();
  const ownerMobile = document.getElementById('ownerMobile').value.trim();
  const cafeAddress = document.getElementById('cafeAddress').value.trim();

  if (!cafeName) return showError('Please enter cafe name');
  if (!ownerName) return showError('Please enter owner name');
  if (!/^[0-9]{10}$/.test(ownerMobile)) return showError('Enter a valid 10-digit mobile number');
  if (!cafeAddress) return showError('Please enter cafe address');

  // Use mobile number as the Cafe document ID for easy login lookup
  const cafeRef = db.collection('Cafes').doc(ownerMobile);

  cafeRef.get().then((doc) => {
    if (doc.exists) {
      return showError('This mobile number is already registered.');
    }

    cafeRef.set({
      cafeName: cafeName,
      ownerName: ownerName,
      ownerMobile: ownerMobile,
      address: cafeAddress,
      status: 'pending',       // pending -> approved by Super Admin
      plan: null,              // '7days' or '30days' set on approval
      expiryDate: null,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
      showSuccess('✅ Registered! Wait for admin approval, then login using your mobile number.');
      document.getElementById('cafeName').value = '';
      document.getElementById('ownerName').value = '';
      document.getElementById('ownerMobile').value = '';
      document.getElementById('cafeAddress').value = '';
    }).catch((err) => {
      showError('Error: ' + err.message);
    });
  });
            }
