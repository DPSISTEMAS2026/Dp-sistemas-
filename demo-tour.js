// ============================================
// DEMO TOUR - Sistema de tour interactivo
// ============================================

let tourActive = false;
let currentStepIndex = 0;
let tourOverlay = null;

// Definición de pasos del tour
const TOUR_STEPS = [
    {
        id: 'intro',
        title: '¡Bienvenido al Tour! 🎉',
        description: 'Te mostraremos todas las funcionalidades de este sistema completo de gestión para restaurantes. Haz clic en "Siguiente" para comenzar.',
        target: '[data-tour="intro"]',
        position: 'bottom'
    },
    {
        id: 'ecommerce',
        title: 'E-commerce Web 🛍️',
        description: 'Tienda online completa con catálogo de productos, carrito de compras, checkout y personalización de pedidos. Los clientes pueden ordenar desde cualquier dispositivo.',
        target: '[data-tour="ecommerce"]',
        position: 'top',
        highlight: true
    },
    {
        id: 'auth',
        title: 'Login Social 🔐',
        description: 'Autenticación rápida con Google y Facebook OAuth 2.0. Sistema de afiliados VIP con puntos y descuentos automáticos.',
        target: '[data-tour="auth"]',
        position: 'top',
        highlight: true
    },
    {
        id: 'pos',
        title: 'Sistema POS 💰',
        description: 'Point of Sale optimizado para ventas en local. Interfaz táctil, gestión de mesas, múltiples métodos de pago e impresión de tickets.',
        target: '[data-tour="pos"]',
        position: 'top',
        highlight: true
    },
    {
        id: 'kitchen',
        title: 'Panel de Cocina 👨‍🍳',
        description: 'Display en tiempo real de órdenes para el equipo de cocina. WebSockets para actualizaciones instantáneas y gestión de estados de preparación.',
        target: '[data-tour="kitchen"]',
        position: 'top',
        highlight: true
    },
    {
        id: 'admin',
        title: 'Panel Administrativo ⚙️',
        description: 'Control total de productos, categorías, precios e inventario. Activación/desactivación de productos en tiempo real.',
        target: '[data-tour="admin"]',
        position: 'top',
        highlight: true
    },
    {
        id: 'owner',
        title: 'Panel de Propietario 📈',
        description: 'Dashboard con KPIs, análisis de rentabilidad, gestión de recetas y costos. Alertas inteligentes de inventario bajo.',
        target: '[data-tour="owner"]',
        position: 'top',
        highlight: true
    },
    {
        id: 'payments',
        title: 'Pasarelas de Pago 💳',
        description: 'Integración con múltiples pasarelas de pago para transacciones online seguras. Confirmación automática de órdenes y soporte para tarjetas, billeteras digitales y más.',
        target: '[data-tour="payments"]',
        position: 'top',
        highlight: true
    },
    {
        id: 'delivery',
        title: 'Delivery Integrado 🚚',
        description: 'Cálculo automático de costos de delivery, validación de direcciones y tracking en tiempo real. Sistema flexible que se adapta a diferentes proveedores de delivery.',
        target: '[data-tour="delivery"]',
        position: 'top',
        highlight: true
    }
];

// Iniciar tour
function startTour() {
    tourActive = true;
    currentStepIndex = 0;

    // Crear overlay
    createTourOverlay();

    // Actualizar UI del panel de control
    document.getElementById('tour-status').textContent = 'Tour Activo';
    document.getElementById('tour-nav').style.display = 'flex';
    document.getElementById('tour-toggle').style.background = '#ef4444';

    // Scroll to features
    scrollToFeatures();

    // Mostrar primer paso después de scroll
    setTimeout(() => {
        showStep(0);
    }, 800);
}

// Detener tour
function stopTour() {
    tourActive = false;

    // Remover overlay y tooltip
    if (tourOverlay) {
        tourOverlay.remove();
        tourOverlay = null;
    }

    const tooltip = document.getElementById('tour-tooltip');
    if (tooltip) {
        tooltip.style.display = 'none';
    }

    // Remover highlights
    document.querySelectorAll('.tour-highlight').forEach(el => {
        el.classList.remove('tour-highlight');
    });

    // Actualizar UI
    document.getElementById('tour-status').textContent = 'Iniciar Tour';
    document.getElementById('tour-nav').style.display = 'none';
    document.getElementById('tour-toggle').style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    updateProgress();
}

// Toggle tour
function toggleTour() {
    if (tourActive) {
        stopTour();
    } else {
        startTour();
    }
}

// Crear overlay del tour
function createTourOverlay() {
    if (tourOverlay) return;

    tourOverlay = document.createElement('div');
    tourOverlay.className = 'tour-overlay';
    tourOverlay.onclick = () => {
        // Click en overlay no hace nada, usuario debe usar botones
    };
    document.body.appendChild(tourOverlay);
}

// Mostrar paso específico
function showStep(index) {
    if (index < 0 || index >= TOUR_STEPS.length) {
        completeTour();
        return;
    }

    currentStepIndex = index;
    const step = TOUR_STEPS[index];

    // Remover highlights anteriores
    document.querySelectorAll('.tour-highlight').forEach(el => {
        el.classList.remove('tour-highlight');
    });

    // Encontrar elemento target
    const targetElement = document.querySelector(step.target);
    if (!targetElement) {
        console.warn(`Target not found: ${step.target}`);
        nextStep();
        return;
    }

    // Scroll al elemento
    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Agregar highlight si es necesario
    if (step.highlight) {
        setTimeout(() => {
            targetElement.classList.add('tour-highlight');
        }, 300);
    }

    // Mostrar tooltip
    setTimeout(() => {
        showTooltip(step, targetElement);
    }, 500);

    // Actualizar progreso
    updateProgress();
}

// Mostrar tooltip
function showTooltip(step, targetElement) {
    const tooltip = document.getElementById('tour-tooltip');
    const title = document.getElementById('tooltip-title');
    const description = document.getElementById('tooltip-description');

    title.textContent = step.title;
    description.textContent = step.description;

    // Posicionar tooltip
    const rect = targetElement.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    let top, left;

    switch (step.position) {
        case 'top':
            top = rect.top - tooltipRect.height - 20;
            left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
            break;
        case 'bottom':
            top = rect.bottom + 20;
            left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
            break;
        case 'left':
            top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
            left = rect.left - tooltipRect.width - 20;
            break;
        case 'right':
            top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
            left = rect.right + 20;
            break;
        default:
            top = rect.bottom + 20;
            left = rect.left;
    }

    // Ajustar si se sale de la pantalla
    if (left < 10) left = 10;
    if (left + tooltipRect.width > window.innerWidth - 10) {
        left = window.innerWidth - tooltipRect.width - 10;
    }
    if (top < 10) top = rect.bottom + 20;

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
    tooltip.style.display = 'block';
}

// Siguiente paso
function nextStep() {
    showStep(currentStepIndex + 1);
}

// Paso anterior
function previousStep() {
    if (currentStepIndex > 0) {
        showStep(currentStepIndex - 1);
    }
}

// Saltar tour
function skipTour() {
    if (confirm('¿Estás seguro de que quieres saltar el tour?')) {
        stopTour();
    }
}

// Actualizar barra de progreso
function updateProgress() {
    const progressFill = document.getElementById('progress-fill');
    const currentStepEl = document.getElementById('current-step');
    const totalStepsEl = document.getElementById('total-steps');

    const progress = tourActive ? ((currentStepIndex + 1) / TOUR_STEPS.length) * 100 : 0;

    progressFill.style.width = `${progress}%`;
    currentStepEl.textContent = tourActive ? currentStepIndex + 1 : 0;
    totalStepsEl.textContent = TOUR_STEPS.length;

    // Actualizar botones
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');

    if (btnPrev) {
        btnPrev.disabled = currentStepIndex === 0;
        btnPrev.style.opacity = currentStepIndex === 0 ? '0.5' : '1';
    }

    if (btnNext) {
        btnNext.textContent = currentStepIndex === TOUR_STEPS.length - 1 ? 'Finalizar →' : 'Siguiente →';
    }
}

// Completar tour
function completeTour() {
    stopTour();
    showSuccessMessage();
    createConfetti();
}

// Mostrar mensaje de éxito
function showSuccessMessage() {
    const successDiv = document.createElement('div');
    successDiv.className = 'tour-success';
    successDiv.innerHTML = `
        <div style="font-size: 4rem; margin-bottom: 1rem;">🎉</div>
        <h2>¡Tour Completado!</h2>
        <p>Has explorado todas las funcionalidades del sistema.<br>Ahora puedes hacer clic en cualquier tarjeta para ver demos detallados.</p>
        <button onclick="this.parentElement.remove()">Entendido</button>
    `;

    document.body.appendChild(successDiv);

    setTimeout(() => {
        successDiv.remove();
    }, 5000);
}

// Crear efecto confetti
function createConfetti() {
    const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];

    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            document.body.appendChild(confetti);

            setTimeout(() => confetti.remove(), 3000);
        }, i * 30);
    }
}

// Scroll a features
function scrollToFeatures() {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Abrir demo de funcionalidad
function openFeatureDemo(featureId) {
    // Mapeo de features a páginas demo
    const demoPages = {
        'ecommerce': {
            url: './panels/index.html',
            title: '🛍️ E-commerce Web - Demo Interactivo',
            description: 'Explora el catálogo de productos, carrito de compras y proceso de checkout completo.'
        },
        'auth': {
            url: './panels/afiliados.html',
            title: '🔐 Sistema de Afiliados VIP - Demo',
            description: 'Sistema de puntos, niveles VIP y beneficios para clientes frecuentes.'
        },
        'pos': {
            url: './panels/meson.html',
            title: '💰 Sistema POS - Demo Interactivo',
            description: 'Point of Sale completo con gestión de mesas, productos y métodos de pago.'
        },
        'kitchen': {
            url: './panels/kitchen.html',
            title: '👨‍🍳 Panel de Cocina - Demo en Tiempo Real',
            description: 'Visualización de órdenes en tiempo real para el equipo de cocina.'
        },
        'admin': {
            url: './panels/admin.html',
            title: '⚙️ Panel Administrativo - Demo Completo',
            description: 'Gestión de productos, categorías, inventario y configuración del sistema.'
        },
        'owner': {
            url: './panels/owner.html',
            title: '📈 Panel de Propietario - Dashboard Ejecutivo',
            description: 'KPIs, análisis de rentabilidad, reportes financieros y gestión de costos.'
        },
        'payments': null,
        'delivery': null
    };

    const demoConfig = demoPages[featureId];

    // Si no hay configuración o es payments/delivery, mostrar modal de info
    if (!demoConfig) {
        const modal = document.getElementById('demo-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');

        const demoContent = getDemoContent(featureId);

        modalTitle.textContent = demoContent.title;
        modalBody.innerHTML = demoContent.content;

        modal.classList.add('active');
        return;
    }

    // Crear modal fullscreen con iframe
    openPanelModal(demoConfig);
}

// Abrir modal con panel en iframe
function openPanelModal(config) {
    // Crear modal si no existe
    let panelModal = document.getElementById('panel-modal');

    if (!panelModal) {
        panelModal = document.createElement('div');
        panelModal.id = 'panel-modal';
        panelModal.className = 'panel-modal-overlay';
        panelModal.innerHTML = `
            <div class="panel-modal-content">
                <div class="panel-modal-header">
                    <div class="panel-modal-info">
                        <h2 id="panel-modal-title"></h2>
                        <p id="panel-modal-description"></p>
                    </div>
                    <button class="panel-modal-close" onclick="closePanelModal()">
                        <span>✕</span>
                    </button>
                </div>
                <div class="panel-modal-body">
                    <div class="panel-iframe-container">
                        <iframe id="panel-iframe" frameborder="0"></iframe>
                    </div>
                    <div class="panel-tour-controls">
                        <button class="panel-tour-btn" onclick="startPanelTour()">
                            <span>🎯</span> Iniciar Tour del Panel
                        </button>
                        <button class="panel-tour-btn secondary" onclick="closePanelModal()">
                            <span>←</span> Volver al Showcase
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(panelModal);
    }

    // Actualizar contenido
    document.getElementById('panel-modal-title').textContent = config.title;
    document.getElementById('panel-modal-description').textContent = config.description;

    // Cargar iframe
    const iframe = document.getElementById('panel-iframe');
    iframe.src = config.url;

    // Mostrar modal
    panelModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Cerrar modal de panel
function closePanelModal() {
    const panelModal = document.getElementById('panel-modal');
    if (panelModal) {
        panelModal.classList.remove('active');
        document.body.style.overflow = '';

        // Limpiar iframe
        const iframe = document.getElementById('panel-iframe');
        iframe.src = 'about:blank';
    }
}

// Iniciar tour dentro del panel
function startPanelTour() {
    alert('🎯 Tour del Panel\n\nEsta funcionalidad mostrará puntos clave del panel actual.\n\n(En desarrollo: Se implementará un tour interactivo específico para cada panel)');
}

// Cerrar demo
function closeFeatureDemo() {
    const modal = document.getElementById('demo-modal');
    modal.classList.remove('active');
}

// Obtener contenido del demo
function getDemoContent(featureId) {
    const demos = {
        ecommerce: {
            title: '🛍️ E-commerce Web',
            content: `
                <div style="padding: 1rem;">
                    <h3 style="margin-bottom: 1rem; color: #1f2937;">Características Principales</h3>
                    <ul style="list-style: none; padding: 0; margin-bottom: 2rem;">
                        <li style="padding: 0.75rem; background: #f9fafb; margin-bottom: 0.5rem; border-radius: 0.5rem;">
                            ✅ <strong>Catálogo Dinámico:</strong> Productos organizados por categorías con filtros
                        </li>
                        <li style="padding: 0.75rem; background: #f9fafb; margin-bottom: 0.5rem; border-radius: 0.5rem;">
                            ✅ <strong>Carrito en Tiempo Real:</strong> Actualización instantánea del carrito
                        </li>
                        <li style="padding: 0.75rem; background: #f9fafb; margin-bottom: 0.5rem; border-radius: 0.5rem;">
                            ✅ <strong>Personalización:</strong> Opciones y agregados para cada producto
                        </li>
                        <li style="padding: 0.75rem; background: #f9fafb; margin-bottom: 0.5rem; border-radius: 0.5rem;">
                            ✅ <strong>Checkout Completo:</strong> Formulario con validación y confirmación
                        </li>
                    </ul>
                    
                    <h3 style="margin-bottom: 1rem; color: #1f2937;">Productos de Ejemplo</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                        ${DEMO_DATA.products.slice(0, 4).map(product => `
                            <div style="border: 2px solid #e5e7eb; border-radius: 0.75rem; padding: 1rem; text-align: center;">
                                <div style="font-size: 3rem; margin-bottom: 0.5rem;">🐟</div>
                                <h4 style="font-size: 1rem; margin-bottom: 0.5rem;">${product.name}</h4>
                                <p style="color: #6366f1; font-weight: 700; font-size: 1.25rem;">${formatCurrency(product.price)}</p>
                                <p style="font-size: 0.875rem; color: #6b7280;">Stock: ${product.stock}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `
        },
        auth: {
            title: '🔐 Autenticación Social',
            content: `
                <div style="padding: 1rem;">
                    <h3 style="margin-bottom: 1rem; color: #1f2937;">Login con OAuth 2.0</h3>
                    <div style="display: grid; gap: 1rem; margin-bottom: 2rem;">
                        <div style="border: 2px solid #e5e7eb; border-radius: 0.75rem; padding: 1.5rem; display: flex; align-items: center; gap: 1rem;">
                            <div style="font-size: 3rem;">🔵</div>
                            <div>
                                <h4 style="margin-bottom: 0.25rem;">Google OAuth</h4>
                                <p style="color: #6b7280; font-size: 0.875rem;">Login rápido con cuenta de Google</p>
                            </div>
                        </div>
                        <div style="border: 2px solid #e5e7eb; border-radius: 0.75rem; padding: 1.5rem; display: flex; align-items: center; gap: 1rem;">
                            <div style="font-size: 3rem;">🔷</div>
                            <div>
                                <h4 style="margin-bottom: 0.25rem;">Facebook OAuth</h4>
                                <p style="color: #6b7280; font-size: 0.875rem;">Autenticación con Facebook</p>
                            </div>
                        </div>
                    </div>
                    
                    <h3 style="margin-bottom: 1rem; color: #1f2937;">Sistema VIP</h3>
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1.5rem; border-radius: 0.75rem;">
                        <h4 style="margin-bottom: 1rem;">Niveles de Afiliación</h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem; text-align: center;">
                            <div>
                                <div style="font-size: 2rem;">🥉</div>
                                <div style="font-weight: 600;">Bronce</div>
                                <div style="font-size: 0.875rem; opacity: 0.9;">0-500 pts</div>
                            </div>
                            <div>
                                <div style="font-size: 2rem;">🥈</div>
                                <div style="font-weight: 600;">Plata</div>
                                <div style="font-size: 0.875rem; opacity: 0.9;">501-1000 pts</div>
                            </div>
                            <div>
                                <div style="font-size: 2rem;">🥇</div>
                                <div style="font-weight: 600;">Oro</div>
                                <div style="font-size: 0.875rem; opacity: 0.9;">1001+ pts</div>
                            </div>
                        </div>
                    </div>
                </div>
            `
        },
        pos: {
            title: '💰 Sistema POS',
            content: `
                <div style="padding: 1rem;">
                    <h3 style="margin-bottom: 1rem; color: #1f2937;">Point of Sale Profesional</h3>
                    <div style="background: #f9fafb; padding: 1.5rem; border-radius: 0.75rem; margin-bottom: 2rem;">
                        <h4 style="margin-bottom: 1rem;">Características</h4>
                        <ul style="list-style: none; padding: 0;">
                            <li style="padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb;">⚡ Interfaz táctil optimizada</li>
                            <li style="padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb;">💳 Múltiples métodos de pago</li>
                            <li style="padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb;">🍽️ Gestión de mesas</li>
                            <li style="padding: 0.5rem 0;">🖨️ Impresión de tickets</li>
                        </ul>
                    </div>
                    
                    <h3 style="margin-bottom: 1rem; color: #1f2937;">Métodos de Pago</h3>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                        ${DEMO_DATA.paymentMethods.map(method => `
                            <div style="border: 2px solid #e5e7eb; border-radius: 0.5rem; padding: 1rem; text-align: center;">
                                <div style="font-size: 2rem; margin-bottom: 0.5rem;">${method.icon}</div>
                                <div style="font-weight: 600; font-size: 0.875rem;">${method.name}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `
        },
        kitchen: {
            title: '👨‍🍳 Panel de Cocina',
            content: `
                <div style="padding: 1rem;">
                    <h3 style="margin-bottom: 1rem; color: #1f2937;">Órdenes en Tiempo Real</h3>
                    <div style="display: grid; gap: 1rem; margin-bottom: 2rem;">
                        ${DEMO_DATA.orders.map(order => {
                const badge = getStatusBadge(order.status);
                return `
                                <div style="border: 2px solid #e5e7eb; border-radius: 0.75rem; padding: 1rem;">
                                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.75rem;">
                                        <div>
                                            <h4 style="margin-bottom: 0.25rem;">${order.id}</h4>
                                            <p style="color: #6b7280; font-size: 0.875rem;">${order.customer}</p>
                                        </div>
                                        <span style="background: ${badge.color}; color: white; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 600;">
                                            ${badge.icon} ${badge.text}
                                        </span>
                                    </div>
                                    <div style="background: #f9fafb; padding: 0.75rem; border-radius: 0.5rem;">
                                        ${order.items.map(item => `
                                            <div style="display: flex; justify-content: space-between; padding: 0.25rem 0;">
                                                <span>${item.quantity}x ${item.name}</span>
                                                <span style="font-weight: 600;">${formatCurrency(item.price)}</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                    <div style="margin-top: 0.75rem; text-align: right; font-weight: 700; color: #6366f1; font-size: 1.125rem;">
                                        Total: ${formatCurrency(order.total)}
                                    </div>
                                </div>
                            `;
            }).join('')}
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 1.5rem; border-radius: 0.75rem; text-align: center;">
                        <h4 style="margin-bottom: 0.5rem;">🔌 WebSocket Conectado</h4>
                        <p style="opacity: 0.9; font-size: 0.875rem;">Actualizaciones en tiempo real</p>
                    </div>
                </div>
            `
        },
        admin: {
            title: '⚙️ Panel Administrativo',
            content: `
                <div style="padding: 1rem;">
                    <h3 style="margin-bottom: 1rem; color: #1f2937;">Gestión de Productos</h3>
                    <div style="background: #f9fafb; padding: 1rem; border-radius: 0.75rem; margin-bottom: 2rem;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="border-bottom: 2px solid #e5e7eb;">
                                    <th style="text-align: left; padding: 0.75rem; font-size: 0.875rem;">Producto</th>
                                    <th style="text-align: left; padding: 0.75rem; font-size: 0.875rem;">Precio</th>
                                    <th style="text-align: center; padding: 0.75rem; font-size: 0.875rem;">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${DEMO_DATA.products.slice(0, 5).map(product => `
                                    <tr style="border-bottom: 1px solid #e5e7eb;">
                                        <td style="padding: 0.75rem;">
                                            <div style="font-weight: 600;">${product.name}</div>
                                            <div style="font-size: 0.75rem; color: #6b7280;">${product.category}</div>
                                        </td>
                                        <td style="padding: 0.75rem; font-weight: 600; color: #6366f1;">
                                            ${formatCurrency(product.price)}
                                        </td>
                                        <td style="padding: 0.75rem; text-align: center;">
                                            <span style="background: ${product.active ? '#10b981' : '#ef4444'}; color: white; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem;">
                                                ${product.active ? '✓ Activo' : '✕ Inactivo'}
                                            </span>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
                        <div style="background: white; border: 2px solid #e5e7eb; padding: 1rem; border-radius: 0.75rem; text-align: center;">
                            <div style="font-size: 2rem; margin-bottom: 0.5rem;">📦</div>
                            <div style="font-size: 1.5rem; font-weight: 700; color: #6366f1;">${DEMO_DATA.products.length}</div>
                            <div style="font-size: 0.875rem; color: #6b7280;">Productos</div>
                        </div>
                        <div style="background: white; border: 2px solid #e5e7eb; padding: 1rem; border-radius: 0.75rem; text-align: center;">
                            <div style="font-size: 2rem; margin-bottom: 0.5rem;">✅</div>
                            <div style="font-size: 1.5rem; font-weight: 700; color: #10b981;">${DEMO_DATA.products.filter(p => p.active).length}</div>
                            <div style="font-size: 0.875rem; color: #6b7280;">Activos</div>
                        </div>
                        <div style="background: white; border: 2px solid #e5e7eb; padding: 1rem; border-radius: 0.75rem; text-align: center;">
                            <div style="font-size: 2rem; margin-bottom: 0.5rem;">🏷️</div>
                            <div style="font-size: 1.5rem; font-weight: 700; color: #f59e0b;">8</div>
                            <div style="font-size: 0.875rem; color: #6b7280;">Categorías</div>
                        </div>
                    </div>
                </div>
            `
        },
        owner: {
            title: '📈 Panel de Propietario',
            content: `
                <div style="padding: 1rem;">
                    <h3 style="margin-bottom: 1rem; color: #1f2937;">KPIs del Negocio</h3>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 2rem;">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1.5rem; border-radius: 0.75rem;">
                            <div style="font-size: 0.875rem; opacity: 0.9; margin-bottom: 0.5rem;">Ventas Hoy</div>
                            <div style="font-size: 2rem; font-weight: 700;">${formatCurrency(DEMO_DATA.kpis.today.sales)}</div>
                        </div>
                        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 1.5rem; border-radius: 0.75rem;">
                            <div style="font-size: 0.875rem; opacity: 0.9; margin-bottom: 0.5rem;">Pedidos Hoy</div>
                            <div style="font-size: 2rem; font-weight: 700;">${DEMO_DATA.kpis.today.orders}</div>
                        </div>
                        <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 1.5rem; border-radius: 0.75rem;">
                            <div style="font-size: 0.875rem; opacity: 0.9; margin-bottom: 0.5rem;">Ticket Promedio</div>
                            <div style="font-size: 2rem; font-weight: 700;">${formatCurrency(DEMO_DATA.kpis.today.avgTicket)}</div>
                        </div>
                        <div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; padding: 1.5rem; border-radius: 0.75rem;">
                            <div style="font-size: 0.875rem; opacity: 0.9; margin-bottom: 0.5rem;">Margen Promedio</div>
                            <div style="font-size: 2rem; font-weight: 700;">${DEMO_DATA.kpis.today.margin}%</div>
                        </div>
                    </div>
                    
                    <h3 style="margin-bottom: 1rem; color: #1f2937;">Análisis de Rentabilidad</h3>
                    <div style="background: #f9fafb; padding: 1rem; border-radius: 0.75rem;">
                        ${DEMO_DATA.products.slice(0, 3).map(product => {
                const analysis = calculateMargin(product.id);
                return `
                                <div style="padding: 1rem; background: white; border-radius: 0.5rem; margin-bottom: 0.75rem;">
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <div>
                                            <div style="font-weight: 600; margin-bottom: 0.25rem;">${product.name}</div>
                                            <div style="font-size: 0.875rem; color: #6b7280;">
                                                Precio: ${formatCurrency(product.price)} | Costo: ${formatCurrency(analysis.cost)}
                                            </div>
                                        </div>
                                        <div style="text-align: right;">
                                            <div style="font-weight: 700; color: #10b981; font-size: 1.125rem;">
                                                ${formatCurrency(analysis.margin)}
                                            </div>
                                            <div style="font-size: 0.875rem; color: #6b7280;">
                                                ${analysis.percentage}% margen
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `;
            }).join('')}
                    </div>
                </div>
            `
        },
        payments: {
            title: '💳 Pasarelas de Pago',
            content: `
                <div style="padding: 1rem;">
                    <h3 style="margin-bottom: 1rem; color: #1f2937;">Integraciones de Pago</h3>
                    <div style="display: grid; gap: 1.5rem; margin-bottom: 2rem;">
                        <div style="border: 2px solid #e5e7eb; border-radius: 0.75rem; padding: 1.5rem;">
                            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                                <div style="font-size: 3rem;">💳</div>
                                <div>
                                    <h4 style="margin-bottom: 0.25rem;">Tarjetas de Crédito/Débito</h4>
                                    <p style="color: #6b7280; font-size: 0.875rem;">Procesamiento seguro de tarjetas</p>
                                </div>
                            </div>
                            <ul style="list-style: none; padding: 0; margin: 0;">
                                <li style="padding: 0.5rem 0; border-top: 1px solid #e5e7eb;">✓ Visa, Mastercard, American Express</li>
                                <li style="padding: 0.5rem 0; border-top: 1px solid #e5e7eb;">✓ Pagos seguros 3D Secure</li>
                                <li style="padding: 0.5rem 0; border-top: 1px solid #e5e7eb;">✓ Confirmación instantánea</li>
                            </ul>
                        </div>
                        
                        <div style="border: 2px solid #e5e7eb; border-radius: 0.75rem; padding: 1.5rem;">
                            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                                <div style="font-size: 3rem;">📱</div>
                                <div>
                                    <h4 style="margin-bottom: 0.25rem;">Billeteras Digitales</h4>
                                    <p style="color: #6b7280; font-size: 0.875rem;">Pagos móviles y digitales</p>
                                </div>
                            </div>
                            <ul style="list-style: none; padding: 0; margin: 0;">
                                <li style="padding: 0.5rem 0; border-top: 1px solid #e5e7eb;">✓ Apple Pay, Google Pay</li>
                                <li style="padding: 0.5rem 0; border-top: 1px solid #e5e7eb;">✓ PayPal y otras billeteras</li>
                                <li style="padding: 0.5rem 0; border-top: 1px solid #e5e7eb;">✓ Checkout rápido</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1.5rem; border-radius: 0.75rem; text-align: center;">
                        <h4 style="margin-bottom: 0.5rem;">🔒 Seguridad Garantizada</h4>
                        <p style="opacity: 0.9; font-size: 0.875rem;">Todas las transacciones están encriptadas con SSL/TLS y cumplen con PCI DSS</p>
                    </div>
                </div>
            `
        },
        delivery: {
            title: '🚚 Delivery Integrado',
            content: `
                <div style="padding: 1rem;">
                    <h3 style="margin-bottom: 1rem; color: #1f2937;">Sistema de Delivery</h3>
                    <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; padding: 2rem; border-radius: 0.75rem; text-align: center; margin-bottom: 2rem;">
                        <div style="font-size: 4rem; margin-bottom: 1rem;">🚚</div>
                        <h4 style="margin-bottom: 0.5rem; font-size: 1.5rem;">Delivery API</h4>
                        <p style="opacity: 0.9;">Sistema flexible de entregas</p>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem;">
                        <div style="background: #f9fafb; padding: 1rem; border-radius: 0.75rem; text-align: center;">
                            <div style="font-size: 2rem; margin-bottom: 0.5rem;">⏱️</div>
                            <div style="font-weight: 700; font-size: 1.25rem; color: #6366f1;">${DEMO_DATA.delivery.avgTime} min</div>
                            <div style="font-size: 0.875rem; color: #6b7280;">Tiempo promedio</div>
                        </div>
                        <div style="background: #f9fafb; padding: 1rem; border-radius: 0.75rem; text-align: center;">
                            <div style="font-size: 2rem; margin-bottom: 0.5rem;">💵</div>
                            <div style="font-weight: 700; font-size: 1.25rem; color: #6366f1;">${formatCurrency(DEMO_DATA.delivery.avgCost)}</div>
                            <div style="font-size: 0.875rem; color: #6b7280;">Costo promedio</div>
                        </div>
                        <div style="background: #f9fafb; padding: 1rem; border-radius: 0.75rem; text-align: center;">
                            <div style="font-size: 2rem; margin-bottom: 0.5rem;">📍</div>
                            <div style="font-weight: 700; font-size: 1.25rem; color: #6366f1;">${DEMO_DATA.delivery.activeOrders}</div>
                            <div style="font-size: 0.875rem; color: #6b7280;">Pedidos activos</div>
                        </div>
                    </div>
                    
                    <h3 style="margin-bottom: 1rem; color: #1f2937;">Funcionalidades</h3>
                    <div style="background: #f9fafb; padding: 1.5rem; border-radius: 0.75rem;">
                        <ul style="list-style: none; padding: 0; margin: 0;">
                            <li style="padding: 0.75rem 0; border-bottom: 1px solid #e5e7eb;">
                                <strong>✓ Cálculo Automático:</strong> Costo de delivery según distancia
                            </li>
                            <li style="padding: 0.75rem 0; border-bottom: 1px solid #e5e7eb;">
                                <strong>✓ Validación de Direcciones:</strong> Verificación en tiempo real
                            </li>
                            <li style="padding: 0.75rem 0; border-bottom: 1px solid #e5e7eb;">
                                <strong>✓ Tracking:</strong> Seguimiento del pedido en vivo
                            </li>
                            <li style="padding: 0.75rem 0;">
                                <strong>✓ Cobertura:</strong> ${DEMO_DATA.delivery.coverage}
                            </li>
                        </ul>
                    </div>
                </div>
            `
        }
    };

    return demos[featureId] || { title: 'Demo', content: '<p>Contenido no disponible</p>' };
}

// Cerrar modal al hacer clic fuera
document.addEventListener('click', (e) => {
    const modal = document.getElementById('demo-modal');
    if (e.target === modal) {
        closeFeatureDemo();
    }
});

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    updateProgress();
    console.log('🎬 Demo Tour System Ready!');
});
