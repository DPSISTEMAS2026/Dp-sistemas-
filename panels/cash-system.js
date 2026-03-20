// ===============================================
// SISTEMA DE CAJA - FRONTEND COMPONENTS
// Login de Cajera, Popup de Proteínas, Calculadora de Vuelto
// ===============================================

// ===============================================
// 1. MODAL DE LOGIN DE CAJERA
// ===============================================

function showCashierLoginModal() {
    const modal = document.createElement('div');
    modal.id = 'cashier-login-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeCashierLogin()">
            <div class="modal-content" onclick="event.stopPropagation()" style="max-width: 400px;">
                <div class="modal-header">
                    <h2>🔐 Ingreso de Cajera</h2>
                    <button onclick="closeCashierLogin()" class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <p style="text-align: center; color: #666; margin-bottom: 20px;">
                        Ingresa tu PIN de 4 dígitos
                    </p>
                    <div class="pin-display" id="pin-display">
                        <span class="pin-dot"></span>
                        <span class="pin-dot"></span>
                        <span class="pin-dot"></span>
                        <span class="pin-dot"></span>
                    </div>
                    <div class="pin-keyboard">
                        <button onclick="addPinDigit('1')">1</button>
                        <button onclick="addPinDigit('2')">2</button>
                        <button onclick="addPinDigit('3')">3</button>
                        <button onclick="addPinDigit('4')">4</button>
                        <button onclick="addPinDigit('5')">5</button>
                        <button onclick="addPinDigit('6')">6</button>
                        <button onclick="addPinDigit('7')">7</button>
                        <button onclick="addPinDigit('8')">8</button>
                        <button onclick="addPinDigit('9')">9</button>
                        <button onclick="clearPin()" class="clear-btn">⌫</button>
                        <button onclick="addPinDigit('0')">0</button>
                        <button onclick="submitPin()" class="submit-btn">✓</button>
                    </div>
                    <div id="pin-error" style="color: red; text-align: center; margin-top: 10px; display: none;"></div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    window.currentPin = '';
}

function closeCashierLogin() {
    const modal = document.getElementById('cashier-login-modal');
    if (modal) modal.remove();
    window.currentPin = '';
}

function addPinDigit(digit) {
    if (window.currentPin.length < 4) {
        window.currentPin += digit;
        updatePinDisplay();

        // Auto-submit cuando se completan 4 dígitos
        if (window.currentPin.length === 4) {
            setTimeout(submitPin, 300);
        }
    }
}

function clearPin() {
    window.currentPin = window.currentPin.slice(0, -1);
    updatePinDisplay();
}

function updatePinDisplay() {
    const dots = document.querySelectorAll('.pin-dot');
    dots.forEach((dot, index) => {
        if (index < window.currentPin.length) {
            dot.classList.add('filled');
        } else {
            dot.classList.remove('filled');
        }
    });
}

async function submitPin() {
    if (window.currentPin.length !== 4) {
        showPinError('PIN debe tener 4 dígitos');
        return;
    }

    try {
        const res = await fetch('/api/cashier/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pin: window.currentPin })
        });

        const data = await res.json();

        if (data.success) {
            // Guardar cajera en sesión
            sessionStorage.setItem('cashier', JSON.stringify(data.cashier));
            closeCashierLogin();

            // Abrir caja automáticamente
            openCashSession(data.cashier);
        } else {
            showPinError(data.message || 'PIN incorrecto');
            window.currentPin = '';
            updatePinDisplay();
        }
    } catch (error) {
        console.error('Error login cajera:', error);
        showPinError('Error de conexión');
    }
}

function showPinError(message) {
    const errorDiv = document.getElementById('pin-error');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 3000);
    }
}

// ===============================================
// 2. APERTURA DE CAJA
// ===============================================

function openCashSession(cashier) {
    const modal = document.createElement('div');
    modal.id = 'open-cash-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h2>💰 Abrir Caja</h2>
                </div>
                <div class="modal-body">
                    <p style="margin-bottom: 20px;">
                        <strong>Cajera:</strong> ${cashier.name}<br>
                        <strong>Turno:</strong> ${cashier.shift === 'morning' ? 'Mañana' : 'Tarde'}
                    </p>
                    <div class="form-group">
                        <label>Efectivo Inicial:</label>
                        <input type="number" id="initial-cash" value="50000" step="1000" 
                               style="width: 100%; padding: 12px; font-size: 1.2rem; border: 2px solid #ddd; border-radius: 8px;">
                    </div>
                </div>
                <div class="modal-footer">
                    <button onclick="confirmOpenCash('${cashier.id}', '${cashier.name}')" class="btn btn-primary">
                        Abrir Caja
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

async function confirmOpenCash(cashierId, cashierName) {
    const initialCash = parseInt(document.getElementById('initial-cash').value) || 0;

    try {
        const res = await fetch('/api/cash-session/open', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cashierId,
                cashierName,
                initialCash
            })
        });

        const data = await res.json();

        if (data.success) {
            sessionStorage.setItem('cashSession', JSON.stringify(data.session));
            document.getElementById('open-cash-modal').remove();

            alert(`✅ Caja abierta\nEfectivo inicial: $${initialCash.toLocaleString('es-CL')}`);

            // Actualizar UI
            updateCashSessionUI(data.session);
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error abriendo caja:', error);
        alert('Error de conexión');
    }
}

function updateCashSessionUI(session) {
    // Actualizar banner de caja
    const shiftStatus = document.getElementById('shift-status');
    if (shiftStatus) {
        shiftStatus.textContent = `Abierta - ${session.cashier_name}`;
        shiftStatus.style.color = '#4CAF50';
    }

    const toggleBtn = document.getElementById('btn-shift-toggle');
    if (toggleBtn) {
        toggleBtn.innerHTML = '<i data-lucide="lock"></i> Cerrar Caja';
        toggleBtn.onclick = showCloseCashModal;
    }
}

// ===============================================
// CIERRE DE CAJA
// ===============================================

function showCloseCashModal() {
    const session = JSON.parse(sessionStorage.getItem('cashSession'));
    if (!session) {
        alert('No hay sesión activa');
        return;
    }

    const modal = document.createElement('div');
    modal.id = 'close-cash-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h2>🔒 Cerrar Caja</h2>
                </div>
                <div class="modal-body">
                    <div class="session-summary" style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <h3 style="margin-top: 0;">Resumen del Turno</h3>
                        <p><strong>Cajera:</strong> ${session.cashier_name}</p>
                        <p><strong>Apertura:</strong> ${new Date(session.opened_at).toLocaleString('es-CL')}</p>
                        <p><strong>Efectivo Inicial:</strong> $${(session.initial_cash || 0).toLocaleString('es-CL')}</p>
                        <p><strong>Ventas Realizadas:</strong> ${session.sales_count || 0}</p>
                    </div>
                    
                    <div class="form-group" style="margin-top: 20px;">
                        <label><strong>Efectivo Final (Contado en Caja):</strong></label>
                        <input type="number" id="final-cash" step="1000" 
                               style="width: 100%; padding: 12px; font-size: 1.2rem; border: 2px solid #ddd; border-radius: 8px;"
                               placeholder="Ingresa el efectivo contado">
                    </div>
                    
                    <div id="difference-display" style="margin-top: 20px; padding: 15px; background: #f0f0f0; border-radius: 8px; display: none;">
                        <p style="margin: 0; font-size: 1.1rem;"><strong>Diferencia:</strong> <span id="diff-amount"></span></p>
                    </div>
                    
                    <div class="form-group" style="margin-top: 15px;">
                        <label>Notas del Cierre (Opcional):</label>
                        <textarea id="close-notes" rows="3" 
                                  style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 8px;"
                                  placeholder="Ej: Faltaron $500, se encontró billete falso, etc."></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button onclick="closeCloseCashModal()" class="btn">Cancelar</button>
                    <button onclick="confirmCloseCash()" class="btn btn-primary" id="btn-confirm-close">Cerrar Caja</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Calcular diferencia al escribir
    document.getElementById('final-cash').addEventListener('input', function () {
        const finalCash = parseInt(this.value) || 0;
        const expected = session.expected_cash || session.initial_cash || 0;
        const diff = finalCash - expected;

        const diffDisplay = document.getElementById('difference-display');
        const diffAmount = document.getElementById('diff-amount');

        if (this.value) {
            diffDisplay.style.display = 'block';
            diffAmount.textContent = `$${Math.abs(diff).toLocaleString('es-CL')}`;

            if (diff > 0) {
                diffAmount.textContent = '+$' + Math.abs(diff).toLocaleString('es-CL') + ' (Sobrante)';
                diffAmount.style.color = '#2196F3';
            } else if (diff < 0) {
                diffAmount.textContent = '-$' + Math.abs(diff).toLocaleString('es-CL') + ' (Faltante)';
                diffAmount.style.color = '#F44336';
            } else {
                diffAmount.textContent = '$0 (Cuadrado ✓)';
                diffAmount.style.color = '#4CAF50';
            }
        } else {
            diffDisplay.style.display = 'none';
        }
    });
}

function closeCloseCashModal() {
    const modal = document.getElementById('close-cash-modal');
    if (modal) modal.remove();
}

async function confirmCloseCash() {
    const session = JSON.parse(sessionStorage.getItem('cashSession'));
    const finalCash = parseInt(document.getElementById('final-cash').value);
    const notes = document.getElementById('close-notes').value;

    if (!finalCash && finalCash !== 0) {
        alert('⚠️ Debes ingresar el efectivo final contado en caja');
        return;
    }

    const confirmBtn = document.getElementById('btn-confirm-close');
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Cerrando...';

    try {
        const res = await fetch('/api/cash-session/close', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: session.id,
                finalCash,
                notes
            })
        });

        const data = await res.json();

        if (data.success) {
            // Limpiar sesión
            sessionStorage.removeItem('cashSession');
            sessionStorage.removeItem('cashier');

            closeCloseCashModal();

            // Mostrar resumen
            const summary = data.summary;
            const diff = summary.difference || 0;
            const diffText = diff > 0 ? `+$${diff.toLocaleString('es-CL')} (Sobrante)` :
                diff < 0 ? `-$${Math.abs(diff).toLocaleString('es-CL')} (Faltante)` :
                    '$0 (Cuadrado)';

            alert(`✅ Caja Cerrada Exitosamente\n\n` +
                `━━━━━━━━━━━━━━━━━━━━━\n` +
                `Ventas Totales: $${summary.totalSales.toLocaleString('es-CL')}\n` +
                `Cantidad de Ventas: ${summary.salesCount}\n\n` +
                `Efectivo Esperado: $${summary.expectedCash.toLocaleString('es-CL')}\n` +
                `Efectivo Contado: $${summary.finalCash.toLocaleString('es-CL')}\n` +
                `Diferencia: ${diffText}\n` +
                `━━━━━━━━━━━━━━━━━━━━━`);

            // Actualizar UI
            const shiftStatus = document.getElementById('shift-status');
            if (shiftStatus) {
                shiftStatus.textContent = 'Cerrada';
                shiftStatus.style.color = '#999';
            }

            const toggleBtn = document.getElementById('btn-shift-toggle');
            if (toggleBtn) {
                toggleBtn.innerHTML = '<i data-lucide="key"></i> Abrir Caja';
                toggleBtn.onclick = showCashierLoginModal;
                if (window.lucide) lucide.createIcons();
            }
        } else {
            alert('Error: ' + data.message);
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Cerrar Caja';
        }
    } catch (error) {
        console.error('Error cerrando caja:', error);
        alert('Error de conexión al cerrar caja');
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Cerrar Caja';
    }
}


// ===============================================
// 3. POPUP DE SELECCIÓN DE PROTEÍNAS
// ===============================================

// ===============================================
// 3. SELECCIÓN DE OPCIONES (MODAL GENÉRICO)
// ===============================================

async function showProteinSelector(productName, basePrice, callback, options = []) {
    // Si no hay opciones, callback inmediato
    if (!options || options.length === 0) {
        callback(productName, basePrice, []);
        return;
    }

    const modal = document.createElement('div');
    modal.id = 'protein-selector-modal';

    // Group options by type
    const groups = {};
    const typeTitles = {
        'protein': 'Selecciona Proteína',
        'addon': 'Agregados',
        'drink': 'Elige Bebida',
        'side': 'Acompañamiento'
    };

    // Sort by order manually if needed, usually db order is fine
    options.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

    options.forEach(opt => {
        if (!groups[opt.option_type]) groups[opt.option_type] = [];
        groups[opt.option_type].push(opt);
    });

    // Consultar inventario de bebidas si hay opciones de tipo 'drink'
    let drinkInventory = {};
    if (groups['drink']) {
        try {
            const response = await fetch('/api/ingredients');
            if (response.ok) {
                const ingredients = await response.json();
                // Filtrar solo bebidas/refrescos
                ingredients.forEach(ing => {
                    if (ing.category && ing.category.toLowerCase().includes('bebida')) {
                        drinkInventory[ing.name.toLowerCase()] = ing.current_stock || 0;
                    }
                });
            }
        } catch (error) {
            console.error('Error consultando inventario:', error);
        }
    }

    let groupsHtml = '';
    const requiredGroups = []; // Track which groups are required

    Object.keys(groups).forEach(type => {
        const typeOpts = groups[type];
        // Check requirement heuristic
        const isRequired = typeOpts.some(o => o.is_required);
        if (isRequired) {
            requiredGroups.push(type);
        }
        const inputType = (type === 'addon' || !isRequired) ? 'checkbox' : 'radio';
        const title = typeTitles[type] || type.toUpperCase();

        groupsHtml += `
            <div class="option-group" data-group-type="${type}" data-required="${isRequired}" style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border: 2px solid ${isRequired ? '#FF6B35' : '#e0e0e0'};">
                <h3 style="font-size: 1.1rem; color: #333; margin: 0 0 15px 0; padding-bottom: 12px; border-bottom: 2px solid ${isRequired ? '#FF6B35' : '#e0e0e0'}; font-weight: 700; display: flex; align-items: center; justify-content: space-between;">
                    <span>${title}</span>
                    ${isRequired ? '<span style="background: #FF6B35; color: white; font-size: 0.7rem; padding: 4px 10px; border-radius: 20px; font-weight: 600;">REQUERIDO</span>' : ''}
                </h3>
                <div class="options-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px;">
                    ${typeOpts.map((opt, index) => {
            // Verificar stock si es bebida
            let stockInfo = '';
            let isOutOfStock = false;
            if (type === 'drink') {
                const optNameLower = opt.option_name.toLowerCase();
                const stock = drinkInventory[optNameLower] || 0;
                if (stock === 0) {
                    isOutOfStock = true;
                    stockInfo = '<div style="font-size:0.7rem; color:#F44336; margin-top:4px; font-weight: 600;">❌ Sin stock</div>';
                } else if (stock < 5) {
                    stockInfo = `<div style="font-size:0.7rem; color:#FF9800; margin-top:4px; font-weight: 600;">⚠️ Quedan ${stock}</div>`;
                }
            }

            return `
                        <label class="option-item" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 12px 8px; border: 2px solid ${isOutOfStock ? '#ccc' : '#ddd'}; border-radius: 10px; cursor: ${isOutOfStock ? 'not-allowed' : 'pointer'}; background: ${isOutOfStock ? '#f9f9f9' : 'white'}; transition: all 0.3s; opacity: ${isOutOfStock ? '0.5' : '1'}; min-height: 100px;">
                            <input type="${inputType}" name="opt-${type}" value="${opt.id}" 
                                   data-name="${opt.option_name}" 
                                   data-price="${opt.price_modifier}" 
                                   data-type="${type}"
                                   data-required="${isRequired}"
                                   ${inputType === 'radio' && index === 0 && !isOutOfStock ? 'checked' : ''} 
                                   ${isOutOfStock ? 'disabled' : ''}
                                   onchange="updateOptionPrice(); validateRequiredSelections();"
                                   style="margin-bottom: 8px; width: 18px; height: 18px; cursor: ${isOutOfStock ? 'not-allowed' : 'pointer'};">
                            <span style="font-weight: 600; text-align: center; font-size: 0.9rem; line-height: 1.3; color: #333; margin-bottom: 4px;">${opt.option_name}</span>
                            <span style="font-size: 0.85rem; color: ${opt.price_modifier > 0 ? '#4CAF50' : opt.price_modifier < 0 ? '#F44336' : '#999'}; font-weight: 600;">
                                ${opt.price_modifier > 0 ? '+$' + opt.price_modifier.toLocaleString('es-CL') : opt.price_modifier < 0 ? '-$' + Math.abs(opt.price_modifier).toLocaleString('es-CL') : 'Incluido'}
                            </span>
                            ${stockInfo}
                        </label>
                    `}).join('')}
                </div>
            </div>
        `;
    });

    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content" style="max-width: 1200px; width: 90vw; max-height: 80vh; overflow: hidden; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                <div class="modal-header" style="background: linear-gradient(135deg, #FF6B35 0%, #E8943D 100%); color: white; padding: 20px 30px; border-radius: 16px 16px 0 0;">
                    <h2 style="font-size: 1.4rem; margin: 0; font-weight: 600; display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.6rem;">⚒️</span>
                        Personalizar: ${productName}
                    </h2>
                </div>
                <div class="modal-body" style="padding: 30px; background: #fafafa; overflow-y: auto; max-height: calc(80vh - 180px);">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 25px;">
                        ${groupsHtml}
                    </div>
                    <div style="margin-top: 30px; display: flex; justify-content: space-between; align-items: center; padding: 20px 30px; background: linear-gradient(135deg, #fff 0%, #f5f5f5 100%); border-radius: 12px; border: 2px solid #E8943D; box-shadow: 0 4px 12px rgba(232, 148, 61, 0.15);">
                        <span style="font-size: 1.2rem; color: #666; font-weight: 500;">Total a pagar:</span>
                        <span id="modal-total-price" style="font-size: 2rem; font-weight: 700; color: #FF6B35;">$${basePrice.toLocaleString('es-CL')}</span>
                    </div>
                </div>
                <div class="modal-footer" style="padding: 20px 30px; background: white; border-top: 2px solid #eee; display: flex; gap: 15px; justify-content: flex-end;">
                    <button onclick="closeProteinSelector()" class="btn" style="background:#f5f5f5; color:#666; padding: 12px 30px; font-size: 1rem; border: 2px solid #ddd; transition: all 0.3s;">Cancelar</button>
                    <button onclick="confirmOptionsSelection()" class="btn btn-primary" id="confirm-options-btn" disabled style="opacity: 0.5; padding: 12px 40px; font-size: 1.1rem; font-weight: 600; background: linear-gradient(135deg, #FF6B35 0%, #E8943D 100%); border: none; transition: all 0.3s;">
                        ✓ Confirmar Pedido
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Globals for confirmation logic
    window.currentOptionCallback = callback;
    window.currentOptionBasePrice = basePrice;
    window.currentOptionProductName = productName;
    window.requiredOptionGroups = requiredGroups;

    // Init Visual Feedback & Price Check
    const inputs = modal.querySelectorAll('input');
    inputs.forEach(inp => {
        inp.addEventListener('change', () => {
            // Reset style for radios in same group
            if (inp.type === 'radio') {
                document.querySelectorAll(`input[name="${inp.name}"]`).forEach(r => {
                    r.closest('.option-item').style.borderColor = '#ddd';
                    r.closest('.option-item').style.background = '#fff';
                });
            }
            const parent = inp.closest('.option-item');
            if (inp.checked) {
                parent.style.borderColor = 'var(--orange)';
                parent.style.background = '#fff3e0';
                parent.style.transform = 'scale(1.05)';
                parent.style.boxShadow = '0 4px 12px rgba(232, 148, 61, 0.3)';
            } else {
                parent.style.borderColor = '#ddd';
                parent.style.background = '#fff';
                parent.style.transform = 'scale(1)';
                parent.style.boxShadow = 'none';
            }
        });
        // Init state visual
        if (inp.checked) {
            const parent = inp.closest('.option-item');
            parent.style.borderColor = 'var(--orange)';
            parent.style.background = '#fff3e0';
            parent.style.transform = 'scale(1.05)';
            parent.style.boxShadow = '0 4px 12px rgba(232, 148, 61, 0.3)';
        }
    });

    window.validateRequiredSelections = () => {
        const confirmBtn = document.getElementById('confirm-options-btn');
        if (!confirmBtn) return;

        let allRequiredSelected = true;

        // Verificar cada grupo requerido
        window.requiredOptionGroups.forEach(groupType => {
            const groupInputs = document.querySelectorAll(`#protein-selector-modal input[name="opt-${groupType}"]`);
            const hasSelection = Array.from(groupInputs).some(inp => inp.checked);

            if (!hasSelection) {
                allRequiredSelected = false;
            }
        });

        // Habilitar/deshabilitar botón
        if (allRequiredSelected) {
            confirmBtn.disabled = false;
            confirmBtn.style.opacity = '1';
            confirmBtn.style.cursor = 'pointer';
        } else {
            confirmBtn.disabled = true;
            confirmBtn.style.opacity = '0.5';
            confirmBtn.style.cursor = 'not-allowed';
        }
    };

    window.updateOptionPrice = () => {
        let total = window.currentOptionBasePrice; // Use stored base
        document.querySelectorAll('#protein-selector-modal input:checked').forEach(inp => {
            total += parseInt(inp.dataset.price || 0);
        });
        const el = document.getElementById('modal-total-price');
        if (el) el.textContent = '$' + total.toLocaleString('es-CL');
    };

    window.confirmOptionsSelection = () => {
        const customizations = [];
        let totalPriceMod = 0;

        document.querySelectorAll('#protein-selector-modal input:checked').forEach(inp => {
            customizations.push({
                type: inp.dataset.type,
                name: inp.dataset.name,
                priceModifier: parseInt(inp.dataset.price || 0)
            });
            totalPriceMod += parseInt(inp.dataset.price || 0);
        });

        // Final calculation reuse base
        const finalPrice = window.currentOptionBasePrice + totalPriceMod;

        closeProteinSelector();
        if (window.currentOptionCallback) {
            window.currentOptionCallback(window.currentOptionProductName, finalPrice, customizations);
        }
    };

    // Initial Price Calc and Validation
    window.updateOptionPrice();
    window.validateRequiredSelections();
}

function closeProteinSelector() {
    const modal = document.getElementById('protein-selector-modal');
    if (modal) modal.remove();
}

// ===============================================
// 4. MODAL DE COBRO CON CALCULADORA DE VUELTO
// ===============================================

function showCheckoutModalWithChange() {
    const session = JSON.parse(sessionStorage.getItem('cashSession') || 'null');
    if (!session) {
        alert('⚠️ Debes abrir caja primero');
        showCashierLoginModal();
        return;
    }

    if (cart.length === 0) {
        alert('El carrito está vacío');
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    const modal = document.createElement('div');
    modal.id = 'checkout-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h2>💰 Cobrar Pedido</h2>
                </div>
                <div class="modal-body">
                    <div class="checkout-summary">
                        <div class="total-display">
                            <span>TOTAL A COBRAR:</span>
                            <span class="total-amount">$${total.toLocaleString('es-CL')}</span>
                        </div>
                    </div>
                    
                    <div class="payment-method-selector">
                        <label>Método de Pago:</label>
                        <div class="payment-methods">
                            <button class="payment-method-btn active" onclick="selectPaymentMethod('efectivo')">
                                💵 Efectivo
                            </button>
                            <button class="payment-method-btn" onclick="selectPaymentMethod('tarjeta')">
                                💳 Tarjeta
                            </button>
                            <button class="payment-method-btn" onclick="selectPaymentMethod('transferencia')">
                                🏦 Transferencia
                            </button>
                        </div>
                    </div>
                    
                    <div id="cash-calculator" style="margin-top: 20px;">
                        <label>Monto Recibido:</label>
                        <input type="number" id="amount-received" value="${total}" step="1000" 
                               oninput="calculateChange()"
                               style="width: 100%; padding: 15px; font-size: 1.5rem; border: 2px solid #4CAF50; border-radius: 8px; text-align: center;">
                        
                        <div class="quick-amounts" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 10px;">
                            <button onclick="setQuickAmount(${Math.ceil(total / 1000) * 1000})" class="btn btn-sm">
                                $${(Math.ceil(total / 1000) * 1000).toLocaleString('es-CL')}
                            </button>
                            <button onclick="setQuickAmount(${Math.ceil(total / 5000) * 5000})" class="btn btn-sm">
                                $${(Math.ceil(total / 5000) * 5000).toLocaleString('es-CL')}
                            </button>
                            <button onclick="setQuickAmount(${Math.ceil(total / 10000) * 10000})" class="btn btn-sm">
                                $${(Math.ceil(total / 10000) * 10000).toLocaleString('es-CL')}
                            </button>
                            <button onclick="setQuickAmount(${Math.ceil(total / 20000) * 20000})" class="btn btn-sm">
                                $${(Math.ceil(total / 20000) * 20000).toLocaleString('es-CL')}
                            </button>
                        </div>
                        
                        <div class="change-display" id="change-display" style="margin-top: 20px; padding: 20px; background: #f0f0f0; border-radius: 8px; text-align: center;">
                            <div style="font-size: 0.9rem; color: #666;">VUELTO:</div>
                            <div style="font-size: 2rem; font-weight: bold; color: #4CAF50;" id="change-amount">
                                $0
                            </div>
                        </div>
                    </div>
                    
                    <div id="card-info" style="display: none; margin-top: 20px; text-align: center; color: #666;">
                        <p>✓ Procesar pago con tarjeta</p>
                    </div>
                    
                    <div id="transfer-info" style="display: none; margin-top: 20px; text-align: center; color: #666;">
                        <p>✓ Confirmar transferencia recibida</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button onclick="closeCheckoutModal()" class="btn">Cancelar</button>
                    <button onclick="confirmCheckout()" class="btn btn-primary" id="confirm-checkout-btn">
                        Confirmar Venta
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    window.selectedPaymentMethod = 'efectivo';
    window.checkoutTotal = total;
    calculateChange();
}

function selectPaymentMethod(method) {
    window.selectedPaymentMethod = method;

    // Update buttons
    document.querySelectorAll('.payment-method-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Show/hide calculators
    const cashCalc = document.getElementById('cash-calculator');
    const cardInfo = document.getElementById('card-info');
    const transferInfo = document.getElementById('transfer-info');

    if (method === 'efectivo') {
        cashCalc.style.display = 'block';
        cardInfo.style.display = 'none';
        transferInfo.style.display = 'none';
        calculateChange();
    } else if (method === 'tarjeta') {
        cashCalc.style.display = 'none';
        cardInfo.style.display = 'block';
        transferInfo.style.display = 'none';
    } else {
        cashCalc.style.display = 'none';
        cardInfo.style.display = 'none';
        transferInfo.style.display = 'block';
    }
}

function setQuickAmount(amount) {
    document.getElementById('amount-received').value = amount;
    calculateChange();
}

function calculateChange() {
    const received = parseInt(document.getElementById('amount-received').value) || 0;
    const change = received - window.checkoutTotal;

    const changeDisplay = document.getElementById('change-amount');
    if (changeDisplay) {
        changeDisplay.textContent = '$' + Math.max(0, change).toLocaleString('es-CL');
        changeDisplay.style.color = change >= 0 ? '#4CAF50' : '#F44336';
    }

    const confirmBtn = document.getElementById('confirm-checkout-btn');
    if (confirmBtn) {
        confirmBtn.disabled = change < 0;
        confirmBtn.style.opacity = change < 0 ? '0.5' : '1';
    }
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    if (modal) modal.remove();
}

async function confirmCheckout() {
    const session = JSON.parse(sessionStorage.getItem('cashSession'));
    const amountReceived = parseInt(document.getElementById('amount-received')?.value) || window.checkoutTotal;

    try {
        // 1. Crear orden
        const orderData = {
            items: cart.map(item => ({
                name: item.name,
                price: item.price,
                quantity: item.qty,
                totalPrice: item.price * item.qty,
                customizations: item.customizations || []
            })),
            total: window.checkoutTotal,
            paymentMethod: window.selectedPaymentMethod,
            source: 'pos',
            clientName: 'Cliente Mesón',
            clientPhone: '-',
            clientAddress: 'Local'
        };

        const orderRes = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        const orderResult = await orderRes.json();

        // 2. Registrar venta en caja
        const saleRes = await fetch('/api/cash-session/sale', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: session.id,
                orderId: orderResult.id,
                amount: window.checkoutTotal,
                paymentMethod: window.selectedPaymentMethod,
                amountReceived: amountReceived,
                description: `Venta POS - ${cart.length} items`
            })
        });

        const saleResult = await saleRes.json();

        if (saleResult.success) {
            const change = amountReceived - window.checkoutTotal;

            alert(`✅ Venta registrada\n\nTotal: $${window.checkoutTotal.toLocaleString('es-CL')}\nRecibido: $${amountReceived.toLocaleString('es-CL')}\nVuelto: $${Math.max(0, change).toLocaleString('es-CL')}`);

            // Limpiar carrito
            cart = [];
            renderCart();
            closeCheckoutModal();
        }
    } catch (error) {
        console.error('Error en checkout:', error);
        alert('Error procesando la venta');
    }
}

// ===============================================
// ESTILOS CSS PARA LOS MODALES
// ===============================================

const cashSystemStyles = document.createElement('style');
cashSystemStyles.textContent = `
    /* Modal Overlay Base */
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
    }
    
    .modal-content {
        background: white;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        max-width: 90vw;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
    }
    
    .modal-header {
        padding: 24px;
        border-bottom: 1px solid #eee;
        position: relative;
    }
    
    .modal-header h2 {
        margin: 0;
        font-size: 1.5rem;
        color: #333;
    }
    
    .modal-body {
        padding: 24px;
    }
    
    .modal-footer {
        padding: 16px 24px;
        border-top: 1px solid #eee;
        display: flex;
        gap: 10px;
        justify-content: flex-end;
    }
    
    .close-btn {
        position: absolute;
        top: 20px;
        right: 20px;
        background: none;
        border: none;
        font-size: 2rem;
        cursor: pointer;
        color: #999;
        line-height: 1;
        padding: 0;
        width: 32px;
        height: 32px;
    }
    
    .close-btn:hover {
        color: #333;
    }
    
    .pin-display {
        display: flex;
        justify-content: center;
        gap: 15px;
        margin: 30px 0;
    }
    
    .pin-dot {
        width: 20px;
        height: 20px;
        border: 2px solid #ddd;
        border-radius: 50%;
        transition: all 0.2s;
    }
    
    .pin-dot.filled {
        background: #FF6B35;
        border-color: #FF6B35;
    }
    
    .pin-keyboard {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        max-width: 300px;
        margin: 0 auto;
    }
    
    .pin-keyboard button {
        padding: 20px;
        font-size: 1.5rem;
        border: 2px solid #eee;
        border-radius: 8px;
        background: white;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .pin-keyboard button:hover {
        background: #f5f5f5;
        border-color: #FF6B35;
    }
    
    .pin-keyboard .clear-btn {
        background: #f44336;
        color: white;
        border-color: #f44336;
    }
    
    .pin-keyboard .submit-btn {
        background: #4CAF50;
        color: white;
        border-color: #4CAF50;
    }
    
    .protein-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 15px;
    }
    
    .protein-option {
        padding: 20px;
        border: 2px solid #eee;
        border-radius: 12px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s;
    }
    
    .protein-option:hover {
        border-color: #FF6B35;
        background: #fff5f0;
        transform: translateY(-2px);
    }
    
    .protein-name {
        font-weight: bold;
        font-size: 1.1rem;
        margin-bottom: 8px;
    }
    
    .protein-price {
        color: #FF6B35;
        font-weight: 600;
    }
    
    .addon-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    
    .addon-option {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px;
        border: 1px solid #eee;
        border-radius: 8px;
        cursor: pointer;
    }
    
    .addon-option:hover {
        background: #f5f5f5;
    }
    
    .addon-option input[type="checkbox"] {
        width: 20px;
        height: 20px;
        cursor: pointer;
    }
    
    .payment-methods {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin-top: 10px;
    }
    
    .payment-method-btn {
        padding: 15px 10px;
        border: 2px solid #eee;
        border-radius: 8px;
        background: white;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 0.9rem;
    }
    
    .payment-method-btn:hover {
        border-color: #FF6B35;
    }
    
    .payment-method-btn.active {
        background: #FF6B35;
        color: white;
        border-color: #FF6B35;
    }
    
    .total-display {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        background: #f5f5f5;
        border-radius: 8px;
        margin-bottom: 20px;
    }
    
    .total-amount {
        font-size: 2rem;
        font-weight: bold;
        color: #FF6B35;
    }
`;

document.head.appendChild(cashSystemStyles);

// ===============================================
// EXPORTAR FUNCIONES GLOBALES
// ===============================================

window.showCashierLoginModal = showCashierLoginModal;
window.closeCashierLogin = closeCashierLogin;
window.addPinDigit = addPinDigit;
window.clearPin = clearPin;
window.submitPin = submitPin;
window.openCashSession = openCashSession;
window.confirmOpenCash = confirmOpenCash;
window.showProteinSelector = showProteinSelector;
window.selectProtein = selectProtein;
window.closeProteinSelector = closeProteinSelector;
window.showCheckoutModalWithChange = showCheckoutModalWithChange;
window.selectPaymentMethod = selectPaymentMethod;
window.setQuickAmount = setQuickAmount;
window.calculateChange = calculateChange;
window.closeCheckoutModal = closeCheckoutModal;
window.confirmCheckout = confirmCheckout;

console.log('✅ Sistema de Caja cargado');

window.showCloseCashModal = showCloseCashModal;
window.closeCloseCashModal = closeCloseCashModal;
window.confirmCloseCash = confirmCloseCash;

// Inicialización automática
window.addEventListener('DOMContentLoaded', () => {
    console.log('🔄 Verificando sesión de caja...');
    const session = JSON.parse(sessionStorage.getItem('cashSession') || 'null');
    if (session && session.status === 'open') {
        updateCashSessionUI(session);
    }
});
