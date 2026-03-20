// ===============================================
// LoMas Rico - Frontend con Backend API
// ===============================================

// Configuración
const API_URL = window.location.origin;
const WS_URL = API_URL.replace('http', 'ws');
const WHATSAPP_NUMBER = '56965787208'; // Cambiar por el número real

// Estado del carrito (local)
let cart = [];

// Helper: normalize string (remove diacritics and lower-case)
function normalizeString(s) {
    if (!s) return '';
    return s.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

// Elementos del DOM
const cartBtn = document.getElementById('cart-btn');
const cartCount = document.getElementById('cart-count');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const cartClose = document.getElementById('cart-close');
const cartItems = document.getElementById('cart-items');
const cartEmpty = document.getElementById('cart-empty');
const cartFooter = document.getElementById('cart-footer');
const cartTotalPrice = document.getElementById('cart-total-price');
const btnCheckout = document.getElementById('btn-checkout');
const checkoutModal = document.getElementById('checkout-modal');
const checkoutForm = document.getElementById('checkout-form');
const modalClose = document.getElementById('modal-close');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    initAccordions();
    initDesktopNav();
    initQuantityControls();
    initAddToCartButtons();
    initCartControls();
    initCheckout();
    loadCartFromStorage();
    initCustomerHelpers();
    initChatbox();

    // Cargar productos dinámicamente
    loadProductsFromAPI();
});

// ===============================================
// Acordeones (Mobile)
// ===============================================
function initAccordions() {
    const headers = document.querySelectorAll('.accordion-header');

    headers.forEach(header => {
        header.addEventListener('click', () => {
            if (window.innerWidth >= 768) return;

            const content = header.nextElementSibling;
            const isOpen = content.classList.contains('open');

            document.querySelectorAll('.accordion-content').forEach(c => {
                c.classList.remove('open');
            });
            document.querySelectorAll('.accordion-header').forEach(h => {
                h.classList.remove('active');
            });

            if (!isOpen) {
                content.classList.add('open');
                header.classList.add('active');

                setTimeout(() => {
                    header.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        });
    });
}

// ===============================================
// Navegación Desktop
// ===============================================
function initDesktopNav() {
    const desktopBtns = document.querySelectorAll('.desktop-cat-btn');

    desktopBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            const targetSection = document.getElementById(`cat-${category}`);

            if (targetSection) {
                desktopBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    if (window.innerWidth >= 768) {
        initScrollSpy();
    }
}

function initScrollSpy() {
    const sections = document.querySelectorAll('.menu-accordion');
    const navBtns = document.querySelectorAll('.desktop-cat-btn');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                const category = id.replace('cat-', '');

                navBtns.forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.category === category);
                });
            }
        });
    }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });

    sections.forEach(section => observer.observe(section));
}

// ===============================================
// Control de cantidad
// ===============================================
function initQuantityControls() {
    document.querySelectorAll('.product-card').forEach(card => {
        const minusBtn = card.querySelector('.qty-btn.minus');
        const plusBtn = card.querySelector('.qty-btn.plus');
        const qtyDisplay = card.querySelector('.qty-number');

        let qty = 1;

        minusBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (qty > 1) {
                qty--;
                qtyDisplay.textContent = qty;
            }
        });

        plusBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (qty < 99) {
                qty++;
                qtyDisplay.textContent = qty;
            }
        });
    });
}

// ===============================================
// Agregar al carrito
// ===============================================
function initAddToCartButtons() {
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = e.target.closest('.product-card');
            const name = card.dataset.name;
            const price = parseInt(card.dataset.price);
            const img = card.dataset.img;
            const qty = parseInt(card.querySelector('.qty-number').textContent);

            addToCart(name, price, img, qty);

            card.querySelector('.qty-number').textContent = '1';

            btn.style.transform = 'scale(0.9)';
            btn.textContent = '✓ Agregado';
            setTimeout(() => {
                btn.style.transform = '';
                btn.textContent = 'Agregar';
            }, 800);
        });
    });
}

function addToCart(name, price, img, qty = 1) {
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.qty += qty;
    } else {
        cart.push({ name, price, img, qty });
    }

    updateCart();
    showToast(`${qty}x ${name} agregado`);
    saveCartToStorage();

    cartBtn.style.transform = 'scale(1.2)';
    setTimeout(() => { cartBtn.style.transform = ''; }, 200);
}

function removeFromCart(name) {
    cart = cart.filter(item => item.name !== name);
    updateCart();
    saveCartToStorage();
}

function updateCartItemQty(name, delta) {
    const item = cart.find(item => item.name === name);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) {
            removeFromCart(name);
        } else {
            updateCart();
            saveCartToStorage();
        }
    }
}

function updateCart() {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCount.textContent = totalItems;

    if (cart.length === 0) {
        cartItems.innerHTML = '';
        cartEmpty.classList.add('show');
        cartFooter.classList.remove('show');
    } else {
        cartEmpty.classList.remove('show');
        cartFooter.classList.add('show');

        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item" data-name="${item.name}">
                <div class="cart-item-img">
                    <img src="${item.img}" alt="${item.name}">
                </div>
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p class="cart-item-price">$${(item.price * item.qty).toLocaleString('es-CL')}</p>
                    <div class="cart-item-controls">
                        <div class="cart-item-qty">
                            <button class="cart-qty-minus">-</button>
                            <span>${item.qty}</span>
                            <button class="cart-qty-plus">+</button>
                        </div>
                        <button class="cart-item-remove">✕</button>
                    </div>
                </div>
            </div>
        `).join('');

        cartItems.querySelectorAll('.cart-item').forEach(itemEl => {
            const name = itemEl.dataset.name;

            itemEl.querySelector('.cart-qty-minus').addEventListener('click', () => updateCartItemQty(name, -1));
            itemEl.querySelector('.cart-qty-plus').addEventListener('click', () => updateCartItemQty(name, 1));
            itemEl.querySelector('.cart-item-remove').addEventListener('click', () => removeFromCart(name));
        });
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    cartTotalPrice.textContent = `$${total.toLocaleString('es-CL')}`;
}

// ===============================================
// Controles del carrito
// ===============================================
function initCartControls() {
    cartBtn.addEventListener('click', openCart);
    cartClose.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    // Cambiar a redirección a checkout.html
    btnCheckout.addEventListener('click', () => {
        if (cart.length === 0) {
            showToast('Tu carrito está vacío');
            return;
        }

        // Guardar carrito en localStorage con el formato correcto
        const checkoutCart = cart.map(item => ({
            name: item.name,
            price: item.price,
            img: item.img,
            quantity: item.qty
        }));

        localStorage.setItem('cart', JSON.stringify(checkoutCart));

        // Redirigir a checkout
        window.location.href = '/checkout.html';
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCart();
            closeCheckoutModal();
        }
    });
}

function openCart() {
    cartSidebar.classList.add('active');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    cartSidebar.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// ===============================================
// Modal de Checkout
// ===============================================
function initCheckout() {
    modalClose.addEventListener('click', closeCheckoutModal);
    checkoutModal.addEventListener('click', (e) => {
        if (e.target === checkoutModal) closeCheckoutModal();
    });

    checkoutForm.addEventListener('submit', handleCheckout);
}

function openCheckoutModal() {
    if (cart.length === 0) return;

    closeCart();

    const checkoutItems = document.getElementById('checkout-items');
    const checkoutTotal = document.getElementById('checkout-total');

    checkoutItems.innerHTML = cart.map(item => `
        <div class="checkout-item">
            <span>${item.qty}x ${item.name}</span>
            <span>$${(item.price * item.qty).toLocaleString('es-CL')}</span>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    checkoutTotal.textContent = `$${total.toLocaleString('es-CL')}`;

    checkoutModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCheckoutModal() {
    checkoutModal.classList.remove('active');
    document.body.style.overflow = '';
}

async function handleCheckout(e) {
    e.preventDefault();

    const clientName = document.getElementById('client-name').value.trim();
    const clientPhone = document.getElementById('client-phone').value.trim();
    const clientEmail = document.getElementById('client-email')?.value.trim();
    const clientAddress = document.getElementById('client-address').value.trim();
    const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value;
    const clientNotes = document.getElementById('client-notes').value.trim();

    if (!paymentMethod) {
        showToast('Selecciona un método de pago');
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    // Crear objeto del pedido
    const orderData = {
        source: new URLSearchParams(window.location.search).get('source') || 'web',
        timestamp: new Date().toISOString(),
        client: {
            name: clientName,
            phone: clientPhone,
            email: clientEmail,
            address: clientAddress
        },
        items: cart.map(item => ({
            name: item.name,
            quantity: item.qty,
            unitPrice: item.price,
            totalPrice: item.price * item.qty
        })),
        subtotal: total,
        total: total,
        paymentMethod: paymentMethod,
        paymentStatus: 'pendiente',
        orderStatus: 'nuevo',
        notes: clientNotes
    };

    try {
        // Enviar al backend
        const response = await fetch(`${API_URL}/api/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) throw new Error('Error al crear pedido');

        const result = await response.json();

        // Crear mensaje de WhatsApp
        const paymentLabels = {
            'efectivo': '💵 Efectivo',
            'transferencia': '🏦 Transferencia',
            'tarjeta': '💳 Tarjeta'
        };

        let message = `🐟 *NUEVO PEDIDO #${result.orderNumber}*\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
        message += `👤 *Cliente:* ${clientName}\n`;
        message += `📞 *Teléfono:* ${clientPhone}\n`;
        message += `📍 *Dirección:* ${clientAddress}\n\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━\n`;
        message += `📋 *PRODUCTOS:*\n\n`;

        cart.forEach((item, index) => {
            message += `${index + 1}. *${item.name}*\n`;
            message += `   Cant: ${item.qty} x $${item.price.toLocaleString('es-CL')} = $${(item.price * item.qty).toLocaleString('es-CL')}\n\n`;
        });

        message += `━━━━━━━━━━━━━━━━━━━━━\n`;
        message += `💰 *TOTAL: $${total.toLocaleString('es-CL')}*\n`;
        message += `💳 *Pago:* ${paymentLabels[paymentMethod]}\n\n`;

        if (clientNotes) {
            message += `📝 *Notas:* ${clientNotes}\n\n`;
        }

        message += `¡Gracias por tu pedido! 🙏`;

        // Abrir WhatsApp
        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');

        // Limpiar carrito
        cart = [];
        updateCart();
        saveCartToStorage();

        // Guardar cliente en backend y localStorage
        try {
            await fetch(`${API_URL}/api/customers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: clientName, phone: clientPhone, email: clientEmail, address: clientAddress })
            });
        } catch (e) { console.warn('No se pudo guardar cliente:', e); }

        try {
            localStorage.setItem('lomasrico_customer', JSON.stringify({ name: clientName, phone: clientPhone, email: clientEmail, address: clientAddress }));
        } catch (e) { }

        closeCheckoutModal();
        checkoutForm.reset();

        showToast(`¡Pedido #${result.orderNumber} enviado!`);

    } catch (error) {
        console.error('Error:', error);
        showToast('Error al enviar pedido. Intenta de nuevo.');
    }
}

// ===============================================
// Toast
// ===============================================
function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

// ===============================================
// Local Storage - Carrito
// ===============================================
function saveCartToStorage() {
    localStorage.setItem('lomasrico_cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const saved = localStorage.getItem('lomasrico_cart');
    if (saved) {
        cart = JSON.parse(saved);
        updateCart();
    }
}

// ===============================================
// Customer helpers: prefill fields and fetch saved addresses
// ===============================================
function initCustomerHelpers() {
    const phoneInput = document.getElementById('client-phone');
    const emailInput = document.getElementById('client-email');

    // Pre-fill from localStorage
    try {
        const saved = JSON.parse(localStorage.getItem('lomasrico_customer') || 'null');
        if (saved) {
            document.getElementById('client-name').value = saved.name || '';
            if (saved.phone) document.getElementById('client-phone').value = saved.phone;
            if (saved.email) document.getElementById('client-email').value = saved.email;
            if (saved.address) document.getElementById('client-address').value = saved.address;
        }
    } catch (e) { }

    // When phone loses focus, try to fetch customer from backend
    phoneInput?.addEventListener('blur', async () => {
        const phone = phoneInput.value.trim();
        if (!phone) return;
        try {
            const res = await fetch(`${API_URL}/api/customers/${encodeURIComponent(phone)}`);
            if (res.ok) {
                const customer = await res.json();
                if (customer.name) document.getElementById('client-name').value = customer.name;
                if (customer.email) document.getElementById('client-email').value = customer.email;
                if (customer.address) document.getElementById('client-address').value = customer.address;
                try { localStorage.setItem('lomasrico_customer', JSON.stringify(customer)); } catch (e) { }
            }
        } catch (e) {
            // ignore
        }
    });
}

// ===============================================
// Simple chatbox that forwards messages to n8n via /api/chat or directly to n8n webhook
// ===============================================
function initChatbox() {
    const N8N_CHAT_WEBHOOK = 'https://n8n-production-607c.up.railway.app/webhook/pedido-restaurante';
    const USE_DIRECT_N8N = true; // set to false to use server proxy (`/api/chat`)

    const chatBtn = document.getElementById('chat-btn');
    const chatPanel = document.getElementById('chat-panel');
    const chatClose = document.getElementById('chat-close');
    const chatSend = document.getElementById('chat-send');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');

    // local cache of products to allow message parsing by number/name
    let productsCache = [];

    // fetch product list for local parsing
    async function loadProductsCache() {
        try {
            const r = await fetch(`${API_URL}/api/products`);
            if (!r.ok) return;
            productsCache = await r.json();
        } catch (e) { console.warn('Failed to load products', e); }
    }
    loadProductsCache();

    const INSTANT_OPEN = true; // set true to open/close instantly (no animation)

    chatBtn?.addEventListener('click', () => {
        // show panel and open instantly if requested
        chatPanel.style.display = 'flex';
        if (INSTANT_OPEN) {
            // temporarily disable transition to make it appear instantly
            chatPanel.style.transition = 'none';
            chatPanel.classList.add('open');
            // force reflow then restore transitions
            chatPanel.getBoundingClientRect();
            setTimeout(() => { chatPanel.style.transition = ''; }, 20);
        } else {
            setTimeout(() => chatPanel.classList.add('open'), 20);
        }
        chatInput.focus();
    });

    chatClose?.addEventListener('click', () => {
        if (INSTANT_OPEN) {
            // hide instantly
            chatPanel.classList.remove('open');
            chatPanel.style.display = 'none';
        } else {
            // animate close then hide
            chatPanel.classList.remove('open');
            setTimeout(() => { chatPanel.style.display = 'none'; }, 260);
        }
    });

    function appendMessage(text, from = 'user') {
        const wrapper = document.createElement('div');
        wrapper.className = `message ${from === 'user' ? 'user' : 'bot'} new`;
        if (from === 'bot') {
            wrapper.innerHTML = `<img class="avatar" src="../logo-dp.svg" alt="LoMas Rico"><div class="bubble">${text}</div>`;
        } else {
            wrapper.innerHTML = `<div class="bubble">${text}</div>`;
        }
        chatMessages.appendChild(wrapper);

        // Force layout so the animation runs reliably
        wrapper.getBoundingClientRect();

        // Smooth scroll to bottom so new messages push older ones up
        chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });

        // Remove the 'new' class after animation completes
        wrapper.addEventListener('animationend', () => wrapper.classList.remove('new'));
    }

    // Send on click
    chatSend?.addEventListener('click', async () => { await sendChat(); });

    // Send on Enter (no Shift)
    chatInput?.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            await sendChat();
        }
    });

    // Extract customer info from message
    function extractCustomerInfo(msg) {
        const info = {};
        const normalized = msg.toLowerCase();

        // Name
        const nameMatch = normalized.match(/(?:mi nombre es|soy|me llamo)\s+([a-záéíóúñ\s]+?)(?:,|$|\.|\sy\s)/i);
        if (nameMatch) info.name = nameMatch[1].trim().replace(/\b\w/g, l => l.toUpperCase());

        // Address
        const addressMatch = normalized.match(/(?:mi direcci[oó]n es|vivo en|calle|domicilio es)\s+([a-záéíóúñ0-9\s#,\.]+?)(?:,|$|\.|\sy\s)/i);
        if (addressMatch) info.address = addressMatch[1].trim();

        // Payment Method
        if (normalized.includes('transferencia')) info.paymentMethod = 'transferencia';
        else if (normalized.includes('efectivo')) info.paymentMethod = 'efectivo';
        else if (normalized.includes('tarjeta') || normalized.includes('debito') || normalized.includes('credito')) info.paymentMethod = 'tarjeta';

        return info;
    }

    // simple parser to detect items by product number or name
    function parseItemsFromMessage(msg) {
        let normalized = (msg || '').toLowerCase()
            .replace(/[áäà]/g, 'a')
            .replace(/[éëè]/g, 'e')
            .replace(/[íïì]/g, 'i')
            .replace(/[óöò]/g, 'o')
            .replace(/[úüù]/g, 'u')
            .replace(/ñ/g, 'n');

        const items = [];

        // 1. Sort products by name length (longest first)
        // This ensures specific names (e.g. "Promo 1") are matched before parts of them
        const relevantProducts = productsCache.filter(p => p && p.name).sort((a, b) => b.name.length - a.name.length);

        // 2. Detection by Name (Priority)
        relevantProducts.forEach(prod => {
            let name = prod.name.toLowerCase()
                .replace(/[áäà]/g, 'a')
                .replace(/[éëè]/g, 'e')
                .replace(/[íïì]/g, 'i')
                .replace(/[óöò]/g, 'o')
                .replace(/[úüù]/g, 'u')
                .replace(/ñ/g, 'n');

            // Clean logic: remove special chars for check
            const safeName = name.replace(/[^a-z0-9\s]/g, '');
            const safeMsg = normalized.replace(/[^a-z0-9\s]/g, '');

            // Only attempt strict match if it has at least 3 chars to avoid noise
            if (safeName.length > 2 && safeMsg.includes(safeName)) {
                // Find index in original normalized string (approximate)
                const idx = normalized.indexOf(name);
                if (idx !== -1) {
                    // Check quantity prefix looking backwards
                    const prefix = normalized.substring(Math.max(0, idx - 10), idx);
                    const qtyMatch = prefix.match(/(\d+)\s*(?:x|por|de)?\s*$/);
                    const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;

                    items.push({ number: prod.number, name: prod.name, quantity: qty });

                    // Erase matched segment from normalized string to prevent re-matching
                    // We replace with spaces of same length
                    const len = name.length;
                    normalized = normalized.substring(0, idx) + ' '.repeat(len) + normalized.substring(idx + len);
                }
            }
        });

        // 3. Detection by Number (Residual)
        relevantProducts.forEach(prod => {
            const number = String(prod.number);
            // Strong regex: must have keyword or explicit #
            // Matches: "la 1", "combo 5", "#10", "menu 3"
            const numRegex = new RegExp(`(?:(\\d+)\\s*(?:x|por|de\\s*los|de\\s*las|de\\s*la|del|de)?\\s*)?(?:el|la|los|las|num|numero|#|combo|promo|menu)\\s*\\b${number}\\b`, 'i');

            const match = normalized.match(numRegex);
            if (match) {
                const qty = match[1] ? parseInt(match[1], 10) : 1;
                const existing = items.find(i => i.number === prod.number);
                if (existing) {
                    existing.quantity += qty;
                } else {
                    items.push({ number: prod.number, name: prod.name, quantity: qty });
                }
            }
        });

        return items;
    }

    function escapeRegex(s) { return (s || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

    async function sendChat() {
        const msg = chatInput.value.trim();
        if (!msg) return;
        appendMessage(msg, 'user');
        chatInput.value = '';

        // include phone/email from inputs if present
        let phone = document.getElementById('client-phone')?.value.trim();
        let email = document.getElementById('client-email')?.value.trim();

        // extract extra info from message
        const extracted = extractCustomerInfo(msg);

        // try to parse items
        const items = parseItemsFromMessage(msg);

        // choose endpoint: direct to n8n webhook OR server proxy
        const endpoint = USE_DIRECT_N8N ? N8N_CHAT_WEBHOOK : `${API_URL}/api/chat`;

        const payload = {
            phone,
            email,
            message: msg,
            ...extracted // merge extracted name, address, paymentMethod
        };

        if (items && items.length) payload.items = items;

        // Add store location for delivery calc context
        payload.storeLocation = { lat: -36.82154715639318, lon: -73.06089257581762 };

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            let text;
            try {
                text = await res.text();
                try { const j = JSON.parse(text); text = j && (j.orderNumber || j.message || JSON.stringify(j)) } catch (e) { }
            } catch (e) { text = null; }

            appendMessage(text || 'Respuesta recibida', 'bot');

            // If phone/email was extracted and inputs were empty, fill them
            if (extracted.name && !document.getElementById('client-name').value) {
                document.getElementById('client-name').value = extracted.name;
            }
        } catch (e) {
            if (USE_DIRECT_N8N) {
                try {
                    const res2 = await fetch(`${API_URL}/api/chat`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    const text2 = await res2.text();
                    appendMessage(text2 || 'Respuesta recibida', 'bot');
                    return;
                } catch (e2) { }
            }
            appendMessage('Error enviando mensaje', 'bot');
        }
    }
}

// ===============================================
// Add numeric badge to each product card
// ===============================================
// ===============================================
// Carga Dinámica de Productos desde API
// ===============================================
function mapCategoryToGridId(product) {
    const cat = (product.category || '').toUpperCase();
    const grp = (product.group || '').toUpperCase();

    // Mapeo adaptado a index.html
    if (cat === 'PROMOS') return 'grid-promos';

    if (cat.includes('PERUANO') || cat.includes('LOMASRICO') || cat.includes('SIN VERDE') || cat.includes('VEG')) return 'grid-ceviches';

    if (cat.includes('TROPICAL') || cat.includes('BOWLS') || cat.includes('PLATOS')) return 'grid-tropical';

    if (cat.includes('CRUDOS') || cat.includes('ROLLS') || cat.includes('HAND')) return 'grid-crudos';

    if (cat.includes('EMPANADAS')) return 'grid-empanadas';

    if (cat.includes('AGREGADOS') || cat.includes('PAPAS') || cat.includes('FRITOS') || cat.includes('PANCITOS')) return 'grid-agregados';

    if (cat.includes('BEBIDAS') || cat.includes('BARRA') || grp === 'BEBIDAS') return 'grid-bebidas';

    if (['PARA COMPARTIR', 'COMPARTIR'].some(k => cat.includes(k))) return 'grid-compartir';

    // Fallback por nombre
    if (product.name && product.name.includes('Bowl')) return 'grid-tropical';

    return 'grid-agregados'; // Default
}

// === LOAD PRODUCTS & OPTIONS LOGIC ===
let modalProduct = null;
let modalQty = 1;

async function loadProductsFromAPI() {
    try {
        const response = await fetch(`${API_URL}/api/products`);
        if (!response.ok) return;
        const products = await response.json();

        // 1. Limpiar grids (quitar loaders)
        document.querySelectorAll('.products-grid').forEach(grid => grid.innerHTML = '');

        const counts = {};

        // 2. Renderizar productos
        products.forEach(p => {
            // Verificar activo
            if (p.hasOwnProperty('active') && !p.active) return;

            const gridId = mapCategoryToGridId(p);
            const grid = document.getElementById(gridId);

            if (grid) {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.dataset.name = p.name;
                card.dataset.price = p.price;
                card.dataset.img = p.img || '';
                card.dataset.number = p.number;

                // Lógica de Badges
                let badgeHTML = '';
                const nameLower = p.name.toLowerCase();
                if (nameLower.includes('nuevo')) badgeHTML = '<span class="product-badge new">✨ Nuevo</span>';
                else if (p.price >= 16900 || nameLower.includes('popular')) badgeHTML = '<span class="product-badge popular">⭐ Popular</span>';
                else if (nameLower.includes('veg')) badgeHTML = '<span class="product-badge vegan">🌱</span>';

                // Imagen fallback
                const imgUrl = p.img || '../logo-dp.svg';

                card.innerHTML = `
                    <div class="product-img">
                        <img src="${imgUrl}" alt="${p.name}" loading="lazy" onerror="this.src='../logo-dp.svg'">
                        ${badgeHTML}
                        <div class="product-number">${p.number}</div>
                    </div>
                    <div class="product-info">
                        <h3>${p.name}</h3>
                        <p class="product-price">$${p.price.toLocaleString('es-CL')}</p>
                        <p class="product-desc">${p.description || ''}</p>
                        <div class="product-actions">
                            <div class="quantity-control">
                                <button class="qty-btn minus">-</button>
                                <span class="qty-number">1</span>
                                <button class="qty-btn plus">+</button>
                            </div>
                            <button class="add-to-cart-btn">Agregar</button>
                        </div>
                    </div>
                `;

                // === LISTENER DE AGREGAR (CON OPCIONES) ===
                const btnAdd = card.querySelector('.add-to-cart-btn');
                btnAdd.className = 'add-to-cart'; // Estilo original

                btnAdd.onclick = (e) => {
                    e.stopPropagation();
                    const qtySpan = card.querySelector('.qty-number');
                    const qty = qtySpan ? parseInt(qtySpan.textContent) : 1;

                    if (p.options && p.options.length > 0) {
                        openOptionsModal(p, qty);
                    } else {
                        addToCart(p.name, p.price, imgUrl, qty);
                        showToast(`Agregado: ${p.name}`);
                    }
                };

                grid.appendChild(card);

                // Contar
                const catKey = gridId.replace('grid-', '');
                counts[catKey] = (counts[catKey] || 0) + 1;
            }
        });

        // 3. Actualizar contadores
        ['promos', 'ceviches', 'tropical', 'crudos', 'empanadas', 'agregados', 'bebidas', 'compartir'].forEach(cat => {
            const count = counts[cat] || 0;
            const btn = document.querySelector(`.accordion-header[data-category="${cat}"]`);
            if (btn) {
                const countSpan = btn.querySelector('.accordion-count');
                if (countSpan) countSpan.textContent = `${count} productos`;

                const accordion = document.getElementById(`cat-${cat}`);
                if (accordion) accordion.style.display = count === 0 ? 'none' : '';
            }
        });

        // 4. Reinicializar controles de cantidad (botones +/-)
        initQuantityControls();
        // initAddToCartButtons(); // YA NO SE USA, listeners directos

    } catch (error) {
        console.error('Error cargando productos:', error);
        showToast('Error al cargar el menú');
    }
}

// === FUNCIONES MODAL OPCIONES ===
function openOptionsModal(product, qty) {
    modalProduct = product;
    modalQty = qty;

    // UI Setup
    const nameEl = document.getElementById('options-product-name');
    const descEl = document.getElementById('options-product-desc');
    if (nameEl) nameEl.textContent = product.name;
    if (descEl) descEl.textContent = product.description || 'Elige tus opciones';

    const container = document.getElementById('options-container');
    if (!container) return;
    container.innerHTML = '';

    // Agrupar opciones
    const typeTitles = {
        'protein': 'Elige tu Proteína',
        'addon': 'Agregados',
        'drink': 'Elige tu Bebida',
        'side': 'Acompañamiento'
    };

    const groups = {};
    product.options.forEach(opt => {
        const t = opt.option_type;
        if (!groups[t]) groups[t] = [];
        groups[t].push(opt);
    });

    // Render
    Object.keys(groups).forEach(type => {
        const opts = groups[type];
        // Heurística rápida de requerimiento (si hay opciones required en el grupo)
        // O asumimos protein/drink/side siempre required y radio.
        // Mejor ver is_required del primer item (asumimos consistencia)
        const isRequired = opts.some(o => o.is_required);
        const inputType = (type === 'addon' || !isRequired) ? 'checkbox' : 'radio';

        const groupDiv = document.createElement('div');
        groupDiv.className = 'options-group'; // Estilo definido en CSS inline
        groupDiv.style.marginBottom = '15px';

        const title = typeTitles[type] || type.toUpperCase();
        groupDiv.innerHTML = `<div class="options-group-title">${title} ${isRequired ? '<span class=required-badge>*Requerido</span>' : ''}</div>`;

        opts.forEach(opt => {
            const row = document.createElement('div');
            row.className = 'option-row';
            const priceText = opt.price_modifier > 0 ? `+ $${opt.price_modifier}` : '';

            row.innerHTML = `
                <input type="${inputType}" name="opt-${type}" value="${opt.id}" data-price="${opt.price_modifier}" data-name="${opt.option_name}">
                <label>${opt.option_name}</label>
                <span class="option-price">${priceText}</span>
            `;

            // UX: Click en fila selecciona el input
            row.onclick = (e) => {
                if (e.target.tagName !== 'INPUT') {
                    const inp = row.querySelector('input');
                    if (inputType === 'radio') {
                        inp.checked = true;
                        // Desmarcar otros radios del mismo name manualmente si es necesario (el browser lo hace si tienen name igual, que lo tienen)
                    } else {
                        inp.checked = !inp.checked;
                    }
                    updateModalPrice();
                }
            };
            row.querySelector('input').onchange = updateModalPrice;

            groupDiv.appendChild(row);
        });
        container.appendChild(groupDiv);
    });

    updateModalPrice();
    const modal = document.getElementById('options-modal');
    if (modal) modal.style.display = 'block';
}

function updateModalPrice() {
    let extra = 0;
    document.querySelectorAll('#options-container input:checked').forEach(inp => {
        extra += parseInt(inp.dataset.price || 0);
    });
    const subtotal = (modalProduct.price + extra) * modalQty;
    const priceEl = document.getElementById('options-total-price');
    if (priceEl) priceEl.textContent = `$${subtotal.toLocaleString('es-CL')}`;
}

// Listeners globales para el modal
const closeBtn = document.getElementById('options-close');
if (closeBtn) closeBtn.onclick = () => { document.getElementById('options-modal').style.display = 'none'; };

const confirmBtn = document.getElementById('confirm-options-btn');
if (confirmBtn) confirmBtn.onclick = () => {
    // Collect data
    const selectedNames = [];
    let totalPriceMod = 0;

    document.querySelectorAll('#options-container input:checked').forEach(inp => {
        selectedNames.push(inp.dataset.name);
        totalPriceMod += parseInt(inp.dataset.price || 0);
    });

    const finalPrice = modalProduct.price + totalPriceMod;
    let finalName = modalProduct.name;
    if (selectedNames.length > 0) {
        finalName += ` (${selectedNames.join(', ')})`;
    }

    const imgUrl = modalProduct.img || '../logo-dp.svg';

    addToCart(finalName, finalPrice, imgUrl, modalQty);
    showToast(`Agregado: ${finalName}`);
    document.getElementById('options-modal').style.display = 'none';
};

// Cerrar click afuera
window.onclick = (e) => {
    const modal = document.getElementById('options-modal');
    if (e.target == modal) {
        modal.style.display = 'none';
    }
    // Mantener lógica checkout modal si existe
    const checkoutModal = document.getElementById('checkout-modal');
    if (e.target == checkoutModal) checkoutModal.style.display = 'none';
}


// ===============================================
// Scroll suave
// ===============================================
document.querySelector('.btn-banner-primary')?.addEventListener('click', (e) => {
    e.preventDefault();
    const menu = document.getElementById('menu');
    if (menu) menu.scrollIntoView({ behavior: 'smooth' });
});
