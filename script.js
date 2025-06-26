// Place this <script> at the end of your <body> or in a separate JS file

// --- GLOBALS ---
let gadgetToken = null;
let gadgetUsername = null;

// --- LOGIN/REGISTER/VERIFY LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
  // Show login modal on load
  document.getElementById('login-modal').style.display = 'flex';
  document.getElementById('main-content').style.display = 'none';

  // Switch to register
  document.getElementById('switch-to-register').onclick = showRegister;
  document.getElementById('switch-to-login').onclick = showLogin;

  // Register modal buttons
  document.querySelector('#register-form-modal button:nth-of-type(1)').onclick = register;
  document.querySelector('#register-form-modal button:nth-of-type(2)').onclick = closeRegisterForm;

  // Login button
  document.getElementById('login-btn').onclick = login;

  // Accept/Decline verification
  document.querySelector('#verify-modal button:nth-of-type(1)').onclick = acceptVerification;
  document.querySelector('#verify-modal button:nth-of-type(2)').onclick = declineVerification;

  // Hide register modal on load
  document.getElementById('register-form-modal').style.display = 'none';
  document.getElementById('verify-modal').style.display = 'none';

  // Customer care chat
  document.getElementById('care-chat-btn').onclick = () => {
    document.getElementById('care-chat-modal').style.display = 'flex';
  };
  document.querySelector('#care-chat-modal button').onclick = () => {
    document.getElementById('care-chat-modal').style.display = 'none';
  };
  document.getElementById('care-chat-form').onsubmit = (e) => {
    e.preventDefault();
    sendCareMessage();
  };

  // Notification modal
  document.querySelector('#notif-modal .close-btn').onclick = () => {
    document.getElementById('notif-modal').style.display = 'none';
  };

  // Search
  document.getElementById('search-btn').onclick = searchGadgets;
  document.getElementById('search-input').onkeydown = (e) => {
    if (e.key === 'Enter') searchGadgets();
  };

  // Hide loading after 2s
  setTimeout(() => {
    document.getElementById('loading-screen').style.display = 'none';
  }, 2000);

  // Fetch gadgets if already logged in (for demo, not persistent)
  // fetchGadgets();
});

function showRegister() {
  document.getElementById('login-box').style.display = 'none';
  document.getElementById('register-form-modal').style.display = 'flex';
  document.getElementById('verify-modal').style.display = 'none';
}
function showLogin() {
  document.getElementById('login-box').style.display = 'block';
  document.getElementById('register-form-modal').style.display = 'none';
  document.getElementById('verify-modal').style.display = 'none';
}
function closeRegisterForm() {
  document.getElementById('register-form-modal').style.display = 'none';
  document.getElementById('login-box').style.display = 'block';
}
function showRegisterForm() {
  document.getElementById('register-form-modal').style.display = 'flex';
  document.getElementById('login-box').style.display = 'none';
}
function login() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  document.getElementById('login-error').textContent = '';
  if (!email || !password) {
    document.getElementById('login-error').textContent = 'Please fill all fields.';
    return;
  }
  // Use correct backend endpoint
  fetch('https://ongod-phone-gadget-1.onrender.com/api/users/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({email, password})
  })
    .then(res => res.json())
    .then(data => {
      if (data.token) {
        gadgetToken = data.token;
        gadgetUsername = data.username;
        document.getElementById('login-modal').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        fetchProducts();
        fetchNotifications();
      } else if (data.verify) {
        document.getElementById('login-box').style.display = 'none';
        document.getElementById('verify-modal').style.display = 'flex';
      } else {
        document.getElementById('login-error').textContent = data.error || 'Login failed.';
      }
    })
    .catch(() => {
      document.getElementById('login-error').textContent = 'Network error.';
    });
}
function register() {
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('reg-phone').value.trim();
  const username = document.getElementById('reg-username').value.trim();
  const password = document.getElementById('reg-password').value;
  const state = document.getElementById('reg-state').value;
  const area = document.getElementById('reg-area').value;
  const street = document.getElementById('reg-street').value.trim();
  const address = document.getElementById('reg-address').value.trim();
  document.getElementById('reg-error').textContent = '';
  if (!email || !phone || !username || !password || !state || !area || !street || !address) {
    document.getElementById('reg-error').textContent = 'Please fill all fields.';
    return;
  }
  // Use correct backend endpoint
  fetch('https://ongod-phone-gadget-1.onrender.com/api/users/register', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({email, phone, username, password, state, area, street, address})
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        document.getElementById('register-form-modal').style.display = 'none';
        document.getElementById('verify-modal').style.display = 'flex';
      } else {
        document.getElementById('reg-error').textContent = data.error || 'Registration failed.';
      }
    })
    .catch(() => {
      document.getElementById('reg-error').textContent = 'Network error.';
    });
}
function acceptVerification() {
  const code = document.getElementById('verify-code').value.trim();
  const email = document.getElementById('email').value.trim();
  if (!code) {
    document.getElementById('verify-error').textContent = 'Enter the code.';
    return;
  }
  // Use correct backend endpoint and send email with code
  fetch('https://ongod-phone-gadget-1.onrender.com/api/users/verify', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({email, code})
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        document.getElementById('verify-modal').style.display = 'none';
        document.getElementById('login-box').style.display = 'block';
        document.getElementById('login-error').textContent = 'Verification successful! Please login.';
      } else {
        document.getElementById('verify-error').textContent = data.error || 'Verification failed.';
      }
    })
    .catch(() => {
      document.getElementById('verify-error').textContent = 'Network error.';
    });
}
function declineVerification() {
  document.getElementById('verify-modal').style.display = 'none';
  document.getElementById('login-box').style.display = 'block';
}

// --- AREA OPTIONS FOR REGISTRATION ---
const areaOptions = {
  Lagos: ['Ikeja', 'Lekki', 'Yaba', 'Surulere', 'Ajah'],
  Ogun: ['Abeokuta', 'Sango', 'Ijebu Ode', 'Sagamu'],
  Oyo: ['Ibadan', 'Ogbomosho', 'Oyo Town'],
  Osun: ['Osogbo', 'Ile-Ife', 'Ilesa'],
  Ondo: ['Akure', 'Ondo Town', 'Owo'],
  Ekiti: ['Ado-Ekiti', 'Ikere', 'Ilawe']
};
document.getElementById('reg-state').onchange = updateAreaOptions;
function updateAreaOptions() {
  const state = document.getElementById('reg-state').value;
  const areaSelect = document.getElementById('reg-area');
  areaSelect.innerHTML = '<option value="">Select Area</option>';
  if (areaOptions[state]) {
    areaOptions[state].forEach(area => {
      const opt = document.createElement('option');
      opt.value = area;
      opt.textContent = area;
      areaSelect.appendChild(opt);
    });
  }
}

// --- PRODUCTS FETCH & RENDER ---
function fetchProducts() {
  fetch('https://ongod-phone-gadget-1.onrender.com/api/products')
    .then(res => res.json())
    .then(data => {
      // Split products by category
      const phones = data.filter(p => p.category === 'phones');
      const laptops = data.filter(p => p.category === 'laptops');
      const accessories = data.filter(p => p.category === 'accessories');
      renderGadgets('phones-list', phones);
      renderGadgets('laptops-list', laptops);
      renderGadgets('accessories-list', accessories);
    });
}
function renderGadgets(listId, gadgets) {
  const list = document.getElementById(listId);
  list.innerHTML = '';
  if (!gadgets || !gadgets.length) {
    list.innerHTML = '<div style="color:#888;">No items found.</div>';
    return;
  }
  gadgets.forEach(gadget => {
    const div = document.createElement('div');
    div.className = 'Gadget-item';
    div.innerHTML = `
      <img src="https://ongod-phone-gadget-1.onrender.com/images/${gadget.image}" alt="${gadget.name}">
      <h2>${gadget.name}</h2>
      <p>₦${gadget.price}</p>
      <div class="button-group">
        <button onclick="showOrderModal('${gadget.id}','${gadget.name}','${gadget.price}','https://ongod-phone-gadget-1.onrender.com/images/${gadget.image}')">Buy Now</button>
        <button onclick="showDetails('${gadget.id}')">Details</button>
      </div>
    `;
    list.appendChild(div);
  });
}

// --- SEARCH ---
function searchGadgets() {
  const q = document.getElementById('search-input').value.trim().toLowerCase();
  if (!q) {
    fetchProducts();
    return;
  }
  fetch(`https://ongod-phone-gadget-1.onrender.com/api/products?search=${encodeURIComponent(q)}`)
    .then(res => res.json())
    .then(data => {
      const phones = data.filter(p => p.category === 'phones');
      const laptops = data.filter(p => p.category === 'laptops');
      const accessories = data.filter(p => p.category === 'accessories');
      renderGadgets('phones-list', phones);
      renderGadgets('laptops-list', laptops);
      renderGadgets('accessories-list', accessories);
    });
}

// --- BUY NOW MODAL WITH ADDRESS & MAP ---
function showOrderModal(id, name, price, imgUrl) {
  if (!gadgetToken) {
    alert("Please login first.");
    return;
  }
  const modalBg = document.getElementById('modal-bg');
  const modalContent = document.getElementById('modal-content');
  modalContent.innerHTML = `
    <button class="close-btn" onclick="document.getElementById('modal-bg').style.display='none'">&times;</button>
    <img src="${imgUrl}" alt="${name}">
    <h2>${name}</h2>
    <p>₦${price}</p>
    <div id="user-address-section" style="margin-bottom:12px;">
      <b>Your Registered Address:</b>
      <div id="user-address" style="margin:6px 0 10px 0;color:#3949ab;"></div>
      <div id="user-map" style="width:100%;height:180px;border-radius:10px;overflow:hidden;"></div>
    </div>
    <label style="font-weight:600;">Order Type:</label>
    <select id="order-type" style="width:90%;padding:8px;margin-bottom:12px;border-radius:6px;border:1px solid #b3b8e0;" onchange="toggleAddressField()">
      <option value="delivery">Delivery</option>
      <option value="pickup">Pick Up</option>
    </select>
    <div id="address-field">
      <input type="text" id="order-address" placeholder="Delivery Address" style="width:90%;padding:8px;margin-bottom:12px;border-radius:6px;border:1px solid #b3b8e0;">
    </div>
    <label style="font-weight:600;">Payment Method:</label>
    <select id="payment-method" style="width:90%;padding:8px;margin-bottom:12px;border-radius:6px;border:1px solid #b3b8e0;">
      <option value="Pay on Delivery">Pay on Delivery</option>
      <option value="Bank Transfer">Bank Transfer</option>
    </select>
    <button onclick="placeOrder('${name}','${price}','${imgUrl}')">Place Order</button>
  `;
  modalBg.style.display = 'flex';
  setTimeout(toggleAddressField, 10);
  fetchUserAddressAndMap();
}
function fetchUserAddressAndMap() {
  if (!gadgetUsername) return;
  fetch(`https://ongod-phone-gadget-1.onrender.com/api/users/${gadgetUsername}/address`)
    .then(res => res.json())
    .then(data => {
      const addressDiv = document.getElementById('user-address');
      const mapDiv = document.getElementById('user-map');
      if (data.address) {
        addressDiv.textContent = data.address;
        const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(data.address)}&output=embed`;
        mapDiv.innerHTML = `<iframe width="100%" height="180" frameborder="0" style="border:0" src="${mapUrl}" allowfullscreen></iframe>`;
        const addrInput = document.getElementById('order-address');
        if (addrInput) addrInput.value = data.address;
      } else {
        addressDiv.textContent = "No address found.";
        mapDiv.innerHTML = "";
      }
    });
}
function toggleAddressField() {
  const type = document.getElementById('order-type').value;
  const addressDiv = document.getElementById('address-field');
  const userAddressSection = document.getElementById('user-address-section');
  if (type === 'pickup') {
    addressDiv.style.display = 'none';
    if (userAddressSection) userAddressSection.style.display = 'none';
  } else {
    addressDiv.style.display = 'block';
    if (userAddressSection) userAddressSection.style.display = 'block';
    fetchUserAddressAndMap();
  }
}
function placeOrder(name, price, imgUrl) {
  const orderType = document.getElementById('order-type').value;
  const address = orderType === 'delivery'
    ? document.getElementById('order-address').value.trim()
    : 'Pick Up';
  const payment_method = document.getElementById('payment-method').value;
  if (orderType === 'delivery' && !address) {
    alert('Please enter your delivery address.');
    return;
  }
  fetch('https://ongod-phone-gadget-1.onrender.com/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: gadgetUsername,
      product: name,
      price: Number(price),
      status: 'pending',
      payment_method,
      order_type: orderType,
      address,
      image: imgUrl,
      date: new Date().toISOString()
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        document.getElementById('modal-bg').style.display = 'none';
        alert('Order placed successfully!');
        fetchNotifications();
      } else {
        alert(data.error || 'Order failed.');
      }
    });
}

// --- DETAILS MODAL ---
function showDetails(id) {
  fetch(`https://ongod-phone-gadget-1.onrender.com/api/products`)
    .then(res => res.json())
    .then(products => {
      const gadget = products.find(p => p.id == id);
      if (!gadget) return;
      const modalBg = document.getElementById('modal-bg');
      const modalContent = document.getElementById('modal-content');
      modalContent.innerHTML = `
        <button class="close-btn" onclick="document.getElementById('modal-bg').style.display='none'">&times;</button>
        <img src="https://ongod-phone-gadget-1.onrender.com/images/${gadget.image}" alt="${gadget.name}">
        <h2>${gadget.name}</h2>
        <p>₦${gadget.price}</p>
        <div style="color:#3949ab;margin-bottom:10px;">${gadget.description || ''}</div>
        <button onclick="showOrderModal('${gadget.id}','${gadget.name}','${gadget.price}','https://ongod-phone-gadget-1.onrender.com/images/${gadget.image}')">Buy Now</button>
      `;
      modalBg.style.display = 'flex';
    });
}

// --- NOTIFICATIONS ---
function showNotifications() {
  document.getElementById('notif-modal').style.display = 'flex';
  fetchNotifications();
}
function fetchNotifications() {
  if (!gadgetUsername) return;
  fetch(`https://ongod-phone-gadget-1.onrender.com/api/notifications?user=${encodeURIComponent(gadgetUsername)}`)
    .then(res => res.json())
    .then(data => {
      const notifDiv = document.getElementById('notif-messages');
      notifDiv.innerHTML = '';
      if (!data.length) {
        notifDiv.innerHTML = '<div style="color:#888;">No notifications yet.</div>';
        return;
      }
      data.forEach(msg => {
        const div = document.createElement('div');
        div.style.marginBottom = '10px';
        div.innerHTML = `<b>${msg.title || 'Notification'}</b><br><span style="color:#3949ab;">${msg.body || ''}</span><br><span style="font-size:0.9em;color:#888;">${msg.date ? new Date(msg.date).toLocaleString() : ''}</span>`;
        notifDiv.appendChild(div);
      });
    });
}

// --- CUSTOMER CARE CHAT ---
function sendCareMessage() {
  const input = document.getElementById('care-chat-input');
  const msg = input.value.trim();
  if (!msg) return;
  const messagesDiv = document.getElementById('care-chat-messages');
  const userMsg = document.createElement('div');
  userMsg.style.textAlign = 'right';
  userMsg.style.marginBottom = '8px';
  userMsg.innerHTML = `<span style="background:#e3e8ff;padding:6px 12px;border-radius:8px;display:inline-block;">${msg}</span>`;
  messagesDiv.appendChild(userMsg);
  input.value = '';
  // Send to backend
  fetch('https://ongod-phone-gadget-1.onrender.com/api/customer-care', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      text: msg,
      username: gadgetUsername || '',
      email: ''
    })
  });
  // Simulate bot reply
  setTimeout(() => {
    const botMsg = document.createElement('div');
    botMsg.style.textAlign = 'left';
    botMsg.style.marginBottom = '8px';
    botMsg.innerHTML = `<span style="background:#2ecc71;color:#fff;padding:6px 12px;border-radius:8px;display:inline-block;">Thank you for contacting customer care. We'll get back to you soon.</span>`;
    messagesDiv.appendChild(botMsg);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }, 1000);
}