// --- AREA, STATE, STREET LOGIC ---
const AVAILABLE_AREAS = {
    "Lagos": {
        "Ikeja": ["Allen Avenue", "Opebi", "Alausa", "Oba Akran"],
        "Yaba": ["Herbert Macaulay", "Commercial Ave", "Tejuosho", "Sabo"],
        "Lekki": ["Admiralty Way", "Lekki Phase 1", "Chevron", "VGC"],
        "Surulere": ["Bode Thomas", "Adeniran Ogunsanya", "Aguda", "Ijesha"],
        "Ikorodu": ["Ijede Road", "Ebute", "Agbede", "Igbogbo"],
        "Ajah": ["Abraham Adesanya", "Sangotedo", "Badore", "Ilaje"],
        "Victoria Island": ["Ozumba Mbadiwe", "Akin Adesola", "Ahmadu Bello", "Adeola Odeku"],
        "Agege": ["Dopemu", "Oko Oba", "Pen Cinema", "Capitol Road"],
        "Oshodi": ["Oshodi Road", "Bolade", "Mafoluku", "Shogunle"],
        "Badagry": ["Ajara", "Ibereko", "Topo", "Gbaji"]
    },
    "Ogun": {
        "Abeokuta": ["Isale Igbein", "Kuto", "Oke Ilewo", "Obantoko"],
        "Ijebu Ode": ["Odo Ere", "Ilese", "Oru Ijebu", "Ijebu Ife"],
        "Sagamu": ["Akarigbo", "Iperu Road", "Ogunmakin", "Ilishan"],
        "Ijebu Igbo": ["Oke Agbo", "Igbeba", "Oke Aje", "Igbokofi"]
    },
    // ... Add other states as needed
};

document.addEventListener('DOMContentLoaded', function() {
    // Populate state select
    const stateSelect = document.getElementById('regState');
    stateSelect.innerHTML = '<option value="">Select State</option>';
    Object.keys(AVAILABLE_AREAS).forEach(state => {
        const opt = document.createElement('option');
        opt.value = state;
        opt.textContent = state;
        stateSelect.appendChild(opt);
    });

    // Notification icon click
    document.getElementById('notificationIcon').onclick = showNotifMessages;
    document.getElementById('notification').onclick = showNotifMessages;

    // Sound logic
    document.body.addEventListener('click', function(e) {
        if (
            e.target.tagName === "BUTTON" ||
            e.target.classList.contains('gadget-item') ||
            e.target.id === "notificationIcon"
        ) {
            playClick();
        }
    });
    document.body.addEventListener('touchstart', function(e) {
        if (
            e.target.tagName === "BUTTON" ||
            e.target.classList.contains('gadget-item') ||
            e.target.id === "notificationIcon"
        ) {
            playClick();
        }
    });

    // Show correct page on load
    getCurrentUser() ? (showMain(), onMainLoad()) : showLogin();
});

function populateAreas(stateId, areaId) {
    const state = document.getElementById(stateId).value;
    const areaSelect = document.getElementById(areaId);
    areaSelect.innerHTML = '<option value="">Select Area</option>';
    document.getElementById('regStreet').innerHTML = '<option value="">Select Street</option>';
    if (AVAILABLE_AREAS[state]) {
        Object.keys(AVAILABLE_AREAS[state]).forEach(area => {
            const opt = document.createElement('option');
            opt.value = area;
            opt.textContent = area;
            areaSelect.appendChild(opt);
        });
    }
}
function populateStreets(stateId, areaId, streetId) {
    const state = document.getElementById(stateId).value;
    const area = document.getElementById(areaId).value;
    const streetSelect = document.getElementById(streetId);
    streetSelect.innerHTML = '<option value="">Select Street</option>';
    if (AVAILABLE_AREAS[state] && AVAILABLE_AREAS[state][area]) {
        AVAILABLE_AREAS[state][area].forEach(street => {
            const opt = document.createElement('option');
            opt.value = street;
            opt.textContent = street;
            streetSelect.appendChild(opt);
        });
    }
}

// --- NOTIFICATION LOGIC ---
function saveNotification(msg) {
    let messages = JSON.parse(localStorage.getItem('user_messages') || '[]');
    messages.unshift({ msg, time: new Date().toLocaleString() });
    localStorage.setItem('user_messages', JSON.stringify(messages.slice(0, 50)));
}
function showNotification(msg, color = "#333") {
    const n = document.getElementById('notification');
    const dot = document.getElementById('notifDot');
    n.textContent = msg;
    n.style.background = color;
    n.style.display = 'block';
    dot.style.display = 'block';
    saveNotification(msg);
    clearTimeout(window._notifTimeout);
    window._notifTimeout = setTimeout(() => {
        n.style.display = 'none';
        dot.style.display = 'none';
    }, 3000);
}
function showNotifMessages() {
    const modal = document.getElementById('notifMessagesModal');
    const list = document.getElementById('notifMessagesList');
    let messages = JSON.parse(localStorage.getItem('user_messages') || '[]');
    if (messages.length === 0) {
        list.innerHTML = "<li>No messages yet.</li>";
    } else {
        list.innerHTML = messages.map(m => `<li>${m.msg}<br><small style="color:#888;">${m.time}</small></li>`).join('');
    }
    modal.style.display = 'block';
}
function closeNotifMessages() {
    document.getElementById('notifMessagesModal').style.display = 'none';
}

// --- SOUND LOGIC ---
function playClick() {
    const audio = document.getElementById('clickSound');
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(()=>{});
    }
}
function enableSoundOnMobile() {
    const audio = document.getElementById('clickSound');
    const unlock = () => {
        audio.play().then(()=>{audio.pause();audio.currentTime=0;});
        document.removeEventListener('touchstart', unlock, true);
        document.removeEventListener('click', unlock, true);
    };
    document.addEventListener('touchstart', unlock, true);
    document.addEventListener('click', unlock, true);
}
enableSoundOnMobile();

// --- LOGIN/REGISTER LOGIC ---
function showLogin() {
    document.getElementById('loginPage').classList.remove('hidden');
    document.getElementById('registerPage').classList.add('hidden');
    document.getElementById('mainPage').classList.add('hidden');
}
function showRegister() {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('registerPage').classList.remove('hidden');
    document.getElementById('mainPage').classList.add('hidden');
}
function showMain() {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('registerPage').classList.add('hidden');
    document.getElementById('mainPage').classList.remove('hidden');
}
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
}
function setCurrentUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}
function login() {
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;
    const user = JSON.parse(localStorage.getItem('user_' + email));
    if (!user || user.password !== password) {
        document.getElementById('loginError').textContent = 'Invalid email or password.';
        showNotification("Invalid email or password!", "#dc3545");
        return;
    }
    setCurrentUser(user);
    showMain();
    onMainLoad();
}
function register() {
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim().toLowerCase();
    const password = document.getElementById('regPassword').value;
    const phone = document.getElementById('regPhone').value.trim();
    const state = document.getElementById('regState').value;
    const area = document.getElementById('regArea').value;
    const street = document.getElementById('regStreet').value;
    if (!name || !email || !password || !phone || !state || !area || !street) {
        document.getElementById('registerError').textContent = 'Please fill all fields.';
        showNotification("Please fill all fields.", "#dc3545");
        return;
    }
    if (phone.length < 10) {
        document.getElementById('registerError').textContent = 'Please enter a valid phone number.';
        showNotification("Please enter a valid phone number.", "#dc3545");
        return;
    }
    if (localStorage.getItem('user_' + email)) {
        document.getElementById('registerError').textContent = 'Email already registered.';
        showNotification("Email already registered.", "#dc3545");
        return;
    }
    const user = { name, email, password, phone, state, area, street };
    localStorage.setItem('user_' + email, JSON.stringify(user));
    setCurrentUser(user);
    showMain();
    onMainLoad();
    showNotification("Registration successful!", "#28a745");
}

// --- MAP LOGIC ---
let map, mapMarker, mapCheckout;
function showMapModal() {
    document.getElementById('mapModal').style.display = 'block';
    document.getElementById('placeImage').style.display = 'none';
    const user = getCurrentUser();
    const address = `${user.street}, ${user.area}, ${user.state}, Nigeria`;
    setTimeout(() => {
        if (map) map.remove();
        map = L.map('map').setView([9.082, 8.6753], 6);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`)
        .then(r=>r.json())
        .then(res=>{
            if(res && res[0]) {
                let lat = parseFloat(res[0].lat), lng = parseFloat(res[0].lon);
                map.setView([lat, lng], 16);
                mapMarker = L.marker([lat, lng]).addTo(map)
                    .bindPopup(address).openPopup();
                let img = document.getElementById('placeImage');
                img.src = `https://source.unsplash.com/350x120/?${encodeURIComponent(user.street + " " + user.area + " " + user.state + ", Nigeria")}`;
                img.onerror = function() {
                    img.src = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?fit=crop&w=350&q=80";
                };
                img.style.display = 'block';
            } else {
                map.setView([9.082, 8.6753], 6);
                mapMarker = L.marker([9.082, 8.6753]).addTo(map)
                    .bindPopup("Address not found").openPopup();
                let img = document.getElementById('placeImage');
                img.src = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?fit=crop&w=350&q=80";
                img.style.display = 'block';
            }
            document.getElementById('checkoutModal').style.display = 'none';
            document.getElementById('checkoutMapContainer').style.display = 'block';
            document.getElementById('checkoutPlaceImage').style.display = 'block';
            document.getElementById('checkoutPlaceImage').src = img.src;
        });
        document.getElementById('checkoutPlaceImage').src = `https://source.unsplash.com/350x120/?${encodeURIComponent(user.street + " " + user.area + " " + user.state + ", Nigeria")}`;
    }, 100);
    document.getElementById('checkoutMapContainer').style.display = 'none';
    document.getElementById('checkoutPlaceImage').style.display = 'none';
    if (mapCheckout) mapCheckout.remove();
    mapCheckout = L.map('checkoutMapContainer').setView([9.082, 8.6753], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapCheckout);
}
function closeMapModal() {
    document.getElementById('mapModal').style.display = 'none';
    showPaymentModal();
}

// --- CART, GADGETS, CHECKOUT, PAYMENT LOGIC ---
let orderStatusInterval = null;
let pendingOrder = null;
function startOrderStatusPolling() {
    if (orderStatusInterval) clearInterval(orderStatusInterval);
    checkOrderStatusAndNotify();
    orderStatusInterval = setInterval(checkOrderStatusAndNotify, 10000);
}
function logout() {
    localStorage.removeItem('user');
    if (orderStatusInterval) clearInterval(orderStatusInterval);
    showLogin();
    showNotification("Logged out.", "#333");
}
function addToCart(name, price) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push({ name, price });
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
    showNotification("Added to cart!", "#28a745");
}
function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
    showNotification("Removed from cart.", "#333");
}
function clearCart() {
    localStorage.removeItem('cart');
    renderCart();
    showNotification("Cart cleared.", "#333");
}
function renderCart() {
    const cartList = document.getElementById('cart-items');
    cartList.innerHTML = '';
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.forEach((item, i) => {
        const li = document.createElement('li');
        li.textContent = item.name + ' - #' + item.price.toLocaleString();
        const btn = document.createElement('button');
        btn.textContent = 'Remove';
        btn.style.marginLeft = '10px';
        btn.onclick = () => removeFromCart(i);
        li.appendChild(btn);
        cartList.appendChild(li);
    });
}
function checkoutCart(name, pickup, delivery) {
    const user = getCurrentUser();
    if (!user) {
        showNotification('Please login first.', "#dc3545");
        return;
    }
    let choice = prompt('Do you want to pick up or have it delivered?\n1. Pick up\n2. Delivery:');
    if (choice === '1') {
        pendingOrder = {
            date: new Date().toISOString(),
            type: 'Pickup',
            name: user.name,
            phone: user.phone,
            email: user.email,
            items: name,
            details:  `${user.street}, ${user.area}, ${user.state}, Nigeria`,
            total: pickup,
            status: "pending"
        };
        showPaymentModal();
    } else if (choice === '2') {
        pendingOrder = {
            date: new Date().toISOString(),
            type: 'Delivery',
            name: user.name,
            phone: user.phone,
            email: user.email,
            items: name,
            details: `${user.street}, ${user.area}, ${user.state}, Nigeria`,
            total: delivery,
            status: "pending"
        };
        showMapModal();
    } else {
        showNotification('Invalid choice. Please try again.', "#dc3545");
    }
}

function continueCheckout() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let user = getCurrentUser();
    if (!user) {
        showNotification('Please login first.', "#dc3545");
        return;
    }
    let total = cart.reduce((sum, item) => sum + item.price, 0);
    let order = {
        date: new Date().toISOString(),
        type: selectedCheckoutType,
        name: user.name,
        phone: user.phone,
        email: user.email,
        items: cart.map(i => i.name).join(', '),
        details: selectedCheckoutType === "Pickup" ? "Ongod Gadget Store, Ikeja, Lagos" : `${user.street}, ${user.area}, ${user.state}, Nigeria`,
        total: total,
        status: "pending"
    };
    pendingOrder = order;
    closeCheckoutModal();
    showPaymentModal();
    clearCart();
}
function closeCheckoutModal() {
    document.getElementById('checkoutModal').style.display = 'none';
    document.getElementById('checkoutMapContainer').style.display = 'none';
    document.getElementById('checkoutPlaceImage').style.display = 'none';
    if (mapCheckout) mapCheckout.remove();
}

// --- PAYMENT LOGIC ---
function showPaymentModal() {
    document.getElementById('paymentModal').style.display = 'block';
}
const SHEETBEST_URL = 'https://api.sheetbest.com/sheets/4115eaae-b505-4191-83bf-a0d58cec1644';
function finishOrder() {
    document.getElementById('paymentModal').style.display = 'none';
    let user = getCurrentUser();
    let order = pendingOrder;
    if (!order) return;
    order.status = document.getElementById('paymentMethod').value;
    fetch(SHEETBEST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
    }).then(() => {
        showNotification("Order sent to admin!", "#28a745");
    }).catch(() => {
        showNotification("Order failed to send to admin!", "#dc3545");
    });
    pendingOrder = null;
}

// --- BROADCAST NOTIFICATION SYSTEM ---
const BROADCAST_URL = 'https://api.sheetbest.com/sheets/0a535d55-d56d-4461-9b17-e214d30e9772';

// Admin send broadcast
document.getElementById('broadcastForm').onsubmit = function(e) {
    e.preventDefault();
    const msg = document.getElementById('broadcastMsg').value.trim();
    if (!msg) return;
    sendBroadcast(msg);
    alert('Message sent!');
    document.getElementById('broadcastMsg').value = '';
};

function sendBroadcast(msg) {
    const id = Date.now().toString() + Math.random().toString(36).substr(2,5);
    fetch(BROADCAST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, msg, time: new Date().toLocaleString() })
    });
}

// User receive broadcast
function getShownBroadcastIds() {
    return JSON.parse(localStorage.getItem('shown_broadcast_ids') || '[]');
}
function addShownBroadcastId(id) {
    let ids = getShownBroadcastIds();
    ids.push(id);
    localStorage.setItem('shown_broadcast_ids', JSON.stringify(ids));
}
function showBroadcastNotification(msg) {
    const n = document.getElementById('notification');
    const dot = document.getElementById('notifDot');
    n.textContent = msg;
    n.style.background = "#007bff";
    n.style.display = 'block';
    dot.style.display = 'block';
    saveNotification(msg);
    clearTimeout(window._broadcastNotifTimeout);
    window._broadcastNotifTimeout = setTimeout(() => {
        n.style.display = 'none';
        dot.style.display = 'none';
    }, 4000);
}
function showBroadcastOnce(msg, id) {
    let ids = getShownBroadcastIds();
    if (ids.includes(id)) return;
    addShownBroadcastId(id);
    showBroadcastNotification(msg);
}
// Poll for new broadcast messages every 5 seconds
function pollBroadcasts() {
    fetch(BROADCAST_URL)
        .then(res => res.json())
        .then(data => {
            data.forEach(m => {
                if (m.id && m.msg) {
                    showBroadcastOnce(m.msg, m.id);
                }
            });
        });
}
setInterval(pollBroadcasts, 5000);
pollBroadcasts();

// --- ADMIN PANEL LOGIC (SHOW ORDERS FROM SHEET) ---
function showAdminPanel() {
    document.getElementById('adminPanel').style.display = 'block';
    document.getElementById('adminOrders').innerHTML = 'Loading...';
    fetch(SHEETBEST_URL)
        .then(res => res.json())
        .then(data => {
            if (!data.length) {
                document.getElementById('adminOrders').innerHTML = '<p>No orders yet.</p>';
                return;
            }
            let html = `<table>
              <tr>
                <th>Date</th>
                <th>Order Type</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Items</th>
                <th>Address/Details</th>
                <th>Total (₦)</th>
                <th>Status</th>
                <th>Action</th>
                <th>Message</th>
              </tr>`;
            data.reverse().forEach(order => {
              html += `<tr>
                <td>${order.date ? order.date.replace('T', ' ').slice(0, 16) : ''}</td>
                <td>${order.type || ''}</td>
                <td>${order.name || ''}</td>
                <td>${order.phone || ''}</td>
                <td>${order.email || ''}</td>
                <td>${order.items || ''}</td>
                <td>${order.details || ''}</td>
                <td>${order.total ? Number(order.total).toLocaleString() : ''}</td>
                <td>${order.status || ''}</td>
                <td>
                    <button onclick="markConfirmed('${order.date}', '${order.email}', '${order.items}')">Confirm</button>
                    <button onclick="markRejected('${order.date}', '${order.email}', '${order.items}')">Reject</button>
                    <button onclick="markDeleted('${order.date}', '${order.email}', '${order.items}')">Delete</button>
                </td>
                <td>${order.message || ''}</td>
              </tr>`;
            });
            html += `</table>`;
            document.getElementById('adminOrders').innerHTML = html;
        })
        .catch(() => {
            document.getElementById('adminOrders').innerHTML = '<p style="color:#d00;">Failed to load orders.</p>';
        });
}
function closeAdminPanel() {
    document.getElementById('adminPanel').style.display = 'none';
}
function markConfirmed(date, email, items) {
    const msg = `Order for ${items} has been CONFIRMED! (${new Date().toLocaleString()})`;
    sendBroadcast(msg);
}
function markRejected(date, email, items) {
    const msg = `Order for ${items} has been REJECTED. (${new Date().toLocaleString()})`;
    sendBroadcast(msg);
}
function markDeleted(date, email, items) {
    const msg = `Order for ${items} has been DELETED. (${new Date().toLocaleString()})`;
    sendBroadcast(msg);
}

// --- SHOW-ONCE PER MESSAGE LOGIC ---
function getShownMessageIds() {
    return JSON.parse(localStorage.getItem('shown_message_ids') || '[]');
}
function addShownMessageId(id) {
    let ids = getShownMessageIds();
    ids.push(id);
    localStorage.setItem('shown_message_ids', JSON.stringify(ids));
}
function showNotificationOnce(msg, color = "#333", id = null) {
    if (id) {
        let ids = getShownMessageIds();
        if (ids.includes(id)) return; // Already shown, skip
        addShownMessageId(id);
    }
    showNotification(msg, color);
}
function checkOrderStatusAndNotify() {
    const user = getCurrentUser();
    if (!user) return;
    fetch(SHEETBEST_URL)
        .then(res => res.json())
        .then(data => {
            const orders = data.filter(o => o.email && o.email.toLowerCase() === user.email.toLowerCase());
            orders.forEach(order => {
                if (order.message && order.status === "Confirmed") {
                    showNotificationOnce(order.message, "#28a745", order.date);
                }
            });
        });
}

function onMainLoad() {
    const user = getCurrentUser();
    if (!user) {
        showLogin();
        return;
    }
    document.getElementById('userName').textContent = user.name;
    renderCart();
    renderGadgets();
    startOrderStatusPolling();
}
function renderGadgets() {
    const phones = [
        { img: "phone1.webp", name: "Redmi Note 14", pickup: 262983, delivery: 306813 },
        { img: "phone2.jpeg", name: "iPhone 14", pickup: 278279, delivery: 324659 }
        // ... Add more gadgets as needed
    ];
    const laptops = [
        { img: "laptop1.jpeg", name: "Dell Inspiron 15", pickup: 180000, delivery: 210000 }
        // ... Add more laptops as needed
    ];
    const accessories = [
        { img: "airpod.jpeg", name: "Apple AirPods Pro", pickup: 85000, delivery: 95000 }
        // ... Add more accessories as needed
    ];
    const phoneList = document.getElementById('phone-list');
    const laptopList = document.getElementById('laptop-list');
    const accessoryList = document.getElementById('accessory-list');
    phoneList.innerHTML = '';
    laptopList.innerHTML = '';
    accessoryList.innerHTML = '';
    phones.forEach(phone => {
        phoneList.innerHTML += `
            <div class="gadget-item">
                <img src="${phone.img}" alt="${phone.name}" onerror="this.onerror=null;this.src='https://source.unsplash.com/200x110/?phone,${encodeURIComponent(phone.name)}';">
                <h3>${phone.name}</h3>
                <div class="prices">
                    <span>Pickup Total: #${phone.pickup.toLocaleString()}</span><br>
                    <span>Delivery Total: #${phone.delivery.toLocaleString()}</span>
                </div>
                <div class="action-buttons">
                    <button onclick="buyNow('${phone.name}', ${phone.pickup}, ${phone.delivery})">Buy Now</button>
                    <button onclick="addToCart('${phone.name}', ${phone.pickup})">Add to Cart</button>
                </div>
            </div>
        `;
    });
    laptops.forEach(laptop => {
        laptopList.innerHTML += `
            <div class="gadget-item">
                <img src="${laptop.img}" alt="${laptop.name}" onerror="this.onerror=null;this.src='https://source.unsplash.com/200x110/?laptop,${encodeURIComponent(laptop.name)}';">
                <h3>${laptop.name}</h3>
                <div class="prices">
                    <span>Pickup Total: #${laptop.pickup.toLocaleString()}</span><br>
                    <span>Delivery Total: #${laptop.delivery.toLocaleString()}</span>
                </div>
                <div class="action-buttons">
                    <button onclick="buyNow('${laptop.name}', ${laptop.pickup}, ${laptop.delivery})">Buy Now</button>
                    <button onclick="addToCart('${laptop.name}', ${laptop.pickup})">Add to Cart</button>
                </div>
            </div>
        `;
    });
    accessories.forEach(acc => {
        accessoryList.innerHTML += `
            <div class="gadget-item">
                <img src="${acc.img}" alt="${acc.name}" onerror="this.onerror=null;this.src='https://source.unsplash.com/200x110/?accessory,${encodeURIComponent(acc.name)}';">
                <h3>${acc.name}</h3>
                <div class="prices">
                    <span>Pickup Total: #${acc.pickup.toLocaleString()}</span><br>
                    <span>Delivery Total: #${acc.delivery.toLocaleString()}</span>
                </div>
                <div class="action-buttons">
                    <button onclick="buyNow('${acc.name}', ${acc.pickup}, ${acc.delivery})">Buy Now</button>
                    <button onclick="addToCart('${acc.name}', ${acc.pickup})">Add to Cart</button>
                </div>
            </div>
        `;
    });
}

// --- BUY NOW LOGIC ---
function buyNow(name, pickup, delivery) {
    const user = getCurrentUser();
    if (!user) {
        showNotification('Please login first.', "#dc3545");
        return;
    }
    let choice = prompt('Do you want to pick up or have it delivered?\n1. Pick up\n2. Delivery:');
    if (choice === '1') {
        pendingOrder = {
            date: new Date().toISOString(),
            type: 'Pickup',
            name: user.name,
            phone: user.phone,
            email: user.email,
            items: name,
            details:  `${user.street}, ${user.area}, ${user.state}, Nigeria`,
            total: pickup,
            status: "pending"
        };
        showPaymentModal();
    } else if (choice === '2') {
        pendingOrder = {
            date: new Date().toISOString(),
            type: 'Delivery',
            name: user.name,
            phone: user.phone,
            email: user.email,
            items: name,
            details: `${user.street}, ${user.area}, ${user.state}, Nigeria`,
            total: delivery,
            status: "pending"
        };
        showMapModal();
    } else {
        showNotification('Invalid choice. Please try again.', "#dc3545");
    }
}

// --- CHAT LOGIC ---
function openChatModal() {
    document.getElementById('chatModal').style.display = 'block';
    document.getElementById('openChatBtn').style.display = 'none';
    loadChatMessages();
}
function closeChatModal() {
    document.getElementById('chatModal').style.display = 'none';
    document.getElementById('openChatBtn').style.display = 'block';
}
function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if (!msg) return;
    let messages = JSON.parse(localStorage.getItem('chat_messages') || '[]');
    messages.push({from: 'You', text: msg, time: new Date().toLocaleTimeString()});
    localStorage.setItem('chat_messages', JSON.stringify(messages));
    input.value = '';
    loadChatMessages();
    setTimeout(() => {
        messages.push({from: 'Admin', text: `Reply to: ${msg}`, time: new Date().toLocaleTimeString()});
        localStorage.setItem('chat_messages', JSON.stringify(messages));
        loadChatMessages();
    }, 1000);
}
function loadChatMessages() {
    const chatBox = document.getElementById('chatMessages');
    let messages = JSON.parse(localStorage.getItem('chat_messages') || '[]');
    chatBox.innerHTML = messages.map(m =>
        `<div style="margin-bottom:6px;"><b style="color:${m.from==='You'?'#007bff':'#28a745'}">${m.from}:</b> ${m.text}<br><small style="color:#888;">${m.time}</small></div>`
    ).join('');
    chatBox.scrollTop = chatBox.scrollHeight;
}