// ===== SIMPLE ADMIN PASSWORD LOGIN =====
const ADMIN_PASSWORD = 'jojo2026'; // change this to your own secret password

function checkAdminLogin() {
  const pass = document.getElementById('adminPassword').value;
  const errorEl = document.getElementById('loginError');

  if (pass === ADMIN_PASSWORD) {
    sessionStorage.setItem('isAdmin', 'true');
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    loadCafes('pending');
  } else {
    errorEl.innerText = 'Wrong password';
    errorEl.style.display = 'block';
  }
}

if (sessionStorage.getItem('isAdmin') === 'true') {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('adminPanel').style.display = 'block';
  loadCafes('pending');
}

function adminLogout() {
  sessionStorage.removeItem('isAdmin');
  window.location.reload();
}

// ===== TABS =====
let currentTab = 'pending';
function switchTab(tab) {
  currentTab = tab;
  document.getElementById('tabPending').classList.toggle('active', tab === 'pending');
  document.getElementById('tabApproved').classList.toggle('active', tab === 'approved');
  loadCafes(tab);
}

// ===== LOAD CAFES (real-time) =====
function loadCafes(filterStatus) {
  db.collection('Cafes').onSnapshot((snapshot) => {
    const container = document.getElementById('cafeList');
    let cafes = [];
    snapshot.forEach((doc) => {
      cafes.push({ id: doc.id, ...doc.data() });
    });

    if (filterStatus === 'pending') {
      cafes = cafes.filter(c => c.status !== 'approved');
    } else {
      cafes = cafes.filter(c => c.status === 'approved');
    }

    if (cafes.length === 0) {
      container.innerHTML = `<p class="empty-msg">No ${filterStatus} cafes</p>`;
      return;
    }

    container.innerHTML = '';
    cafes.forEach((cafe) => {
      const card = document.createElement('div');
      card.className = 'cafe-card';

      let statusHtml = '';
      if (cafe.status === 'approved') {
        const isExpired = cafe.expiryDate && new Date(cafe.expiryDate) < new Date();
        statusHtml = `<span class="status-tag ${isExpired ? 'tag-expired' : 'tag-approved'}">
          ${isExpired ? 'EXPIRED' : cafe.plan?.toUpperCase() || 'ACTIVE'}
        </span>`;
        if (cafe.expiryDate) {
          statusHtml += `<p style="margin-top:6px;">Expires: ${new Date(cafe.expiryDate).toLocaleDateString()}</p>`;
        }
      }

      card.innerHTML = `
        <h3>${cafe.cafeName}</h3>
        <p>Owner: ${cafe.ownerName}</p>
        <p class="mobile-id">ID: ${cafe.ownerMobile}</p>
        <p>${cafe.address || ''}</p>
        ${statusHtml}
        ${cafe.status !== 'approved' || (cafe.expiryDate && new Date(cafe.expiryDate) < new Date()) ? `
        <div class="plan-row">
          <button class="plan-btn plan-trial" onclick="approveCafe('${cafe.id}', '7days')">7 Days Trial</button>
          <button class="plan-btn plan-paid" onclick="approveCafe('${cafe.id}', '30days')">30 Days Paid</button>
        </div>
        <button class="plan-btn plan-reject" style="margin-top:8px; width:100%;" onclick="deleteCafe('${cafe.id}')">Reject / Delete</button>
        ` : `
        <button class="action-btn" onclick="approveCafe('${cafe.id}', '30days')">Renew 30 Days</button>
        `}
      `;
      container.appendChild(card);
    });
  });
}

// ===== APPROVE CAFE =====
function approveCafe(cafeId, plan) {
  const days = plan === '7days' ? 7 : 30;
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + days);

  db.collection('Cafes').doc(cafeId).update({
    status: 'approved',
    plan: plan,
    expiryDate: expiry.toISOString()
  }).then(() => {
    alert(`✅ Approved with ${plan === '7days' ? '7-Day Trial' : '30-Day Paid Plan'}`);
  }).catch((err) => {
    alert('Error: ' + err.message);
  });
}

// ===== REJECT / DELETE CAFE =====
function deleteCafe(cafeId) {
  if (confirm('Are you sure you want to reject/delete this cafe registration?')) {
    db.collection('Cafes').doc(cafeId).delete();
  }
}
