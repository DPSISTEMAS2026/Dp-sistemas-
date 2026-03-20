// ===============================================
// CHECKOUT VALIDATION UTILITIES
// LoMas Rico - Sistema de Validaciones
// ===============================================

/**
 * Validar teléfono chileno
 * Formatos aceptados: +56912345678, 56912345678, 912345678
 */
function validateChileanPhone(phone) {
    // Limpiar espacios y guiones
    const cleaned = phone.replace(/[\s\-]/g, '');

    // Regex para teléfono chileno móvil
    const regex = /^(\+?56)?9\d{8}$/;

    return regex.test(cleaned);
}

/**
 * Formatear teléfono chileno a formato estándar
 * Resultado: +56 9 1234 5678
 */
function formatChileanPhone(phone) {
    // Limpiar todo excepto números
    let cleaned = phone.replace(/\D/g, '');

    // Remover prefijo 56 si existe
    if (cleaned.startsWith('56')) {
        cleaned = cleaned.substring(2);
    }

    // Verificar que empiece con 9
    if (!cleaned.startsWith('9') || cleaned.length !== 9) {
        return phone; // Retornar original si es inválido
    }

    // Formatear: +56 9 XXXX XXXX
    return `+56 9 ${cleaned.substring(1, 5)} ${cleaned.substring(5, 9)}`;
}

/**
 * Validar RUT chileno (opcional para factura)
 */
function validateRUT(rut) {
    // Limpiar puntos y guión
    rut = rut.replace(/\./g, '').replace(/-/g, '');

    if (rut.length < 8) return false;

    const body = rut.slice(0, -1);
    const dv = rut.slice(-1).toUpperCase();

    // Calcular dígito verificador
    let sum = 0;
    let multiplier = 2;

    for (let i = body.length - 1; i >= 0; i--) {
        sum += parseInt(body[i]) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const expectedDV = 11 - (sum % 11);
    const calculatedDV = expectedDV === 11 ? '0' : expectedDV === 10 ? 'K' : expectedDV.toString();

    return dv === calculatedDV;
}

/**
 * Formatear RUT
 * Resultado: 12.345.678-9
 */
function formatRUT(rut) {
    // Limpiar
    rut = rut.replace(/\./g, '').replace(/-/g, '');

    if (rut.length < 2) return rut;

    const body = rut.slice(0, -1);
    const dv = rut.slice(-1);

    // Agregar puntos
    const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return `${formatted}-${dv}`;
}

/**
 * Validar dirección
 */
function validateAddress(address) {
    if (!address || address.length < 10) {
        return {
            valid: false,
            message: 'La dirección debe tener al menos 10 caracteres'
        };
    }

    // Verificar que contenga al menos un número (número de calle)
    const hasNumber = /\d+/.test(address);
    if (!hasNumber) {
        return {
            valid: false,
            message: 'La dirección debe incluir el número de calle'
        };
    }

    // Verificar que contenga al menos una letra (nombre de calle)
    const hasLetter = /[a-zA-Z]/.test(address);
    if (!hasLetter) {
        return {
            valid: false,
            message: 'La dirección debe incluir el nombre de la calle'
        };
    }

    return { valid: true };
}

/**
 * Validar email
 */
function validateEmail(email) {
    if (!email) return true; // Email es opcional

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Mostrar error en campo
 */
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    // Remover error anterior si existe
    const existingError = field.parentElement.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }

    // Agregar clase de error
    field.classList.add('error');

    // Crear mensaje de error
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.style.color = '#e53e3e';
    errorDiv.style.fontSize = '13px';
    errorDiv.style.marginTop = '4px';
    errorDiv.textContent = message;

    field.parentElement.appendChild(errorDiv);
}

/**
 * Limpiar error de campo
 */
function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    field.classList.remove('error');

    const errorDiv = field.parentElement.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
}

/**
 * Validar formulario completo
 */
function validateCheckoutForm() {
    let isValid = true;

    // Validar nombre
    const name = document.getElementById('client-name')?.value;
    if (!name || name.length < 3) {
        showFieldError('client-name', 'El nombre debe tener al menos 3 caracteres');
        isValid = false;
    } else {
        clearFieldError('client-name');
    }

    // Validar teléfono
    const phone = document.getElementById('client-phone')?.value;
    if (!validateChileanPhone(phone)) {
        showFieldError('client-phone', 'Teléfono inválido. Formato: +56 9 1234 5678');
        isValid = false;
    } else {
        clearFieldError('client-phone');
    }

    // Validar email (opcional)
    const email = document.getElementById('client-email')?.value;
    if (email && !validateEmail(email)) {
        showFieldError('client-email', 'Email inválido');
        isValid = false;
    } else {
        clearFieldError('client-email');
    }

    // Validar dirección
    const address = document.getElementById('client-address')?.value;
    const addressValidation = validateAddress(address);
    if (!addressValidation.valid) {
        showFieldError('client-address', addressValidation.message);
        isValid = false;
    } else {
        clearFieldError('client-address');
    }

    // Validar términos y condiciones
    const terms = document.getElementById('accept-terms');
    if (terms && !terms.checked) {
        alert('Debes aceptar los Términos y Condiciones para continuar');
        isValid = false;
    }

    return isValid;
}

// ===============================================
// AUTO-FORMATEO EN TIEMPO REAL
// ===============================================

// Auto-formatear teléfono
const phoneInput = document.getElementById('client-phone');
if (phoneInput) {
    phoneInput.addEventListener('blur', function () {
        if (this.value && validateChileanPhone(this.value)) {
            this.value = formatChileanPhone(this.value);
            clearFieldError('client-phone');
        }
    });

    phoneInput.addEventListener('input', function () {
        // Limpiar error mientras escribe
        if (this.value.length >= 9) {
            clearFieldError('client-phone');
        }
    });
}

// Validar email en tiempo real
const emailInput = document.getElementById('client-email');
if (emailInput) {
    emailInput.addEventListener('blur', function () {
        if (this.value && !validateEmail(this.value)) {
            showFieldError('client-email', 'Email inválido');
        } else {
            clearFieldError('client-email');
        }
    });
}

// Validar dirección en tiempo real
const addressInput = document.getElementById('client-address');
if (addressInput) {
    addressInput.addEventListener('blur', function () {
        const validation = validateAddress(this.value);
        if (!validation.valid) {
            showFieldError('client-address', validation.message);
        } else {
            clearFieldError('client-address');
        }
    });
}

// ===============================================
// EXPORTAR FUNCIONES
// ===============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateChileanPhone,
        formatChileanPhone,
        validateRUT,
        formatRUT,
        validateAddress,
        validateEmail,
        validateCheckoutForm,
        showFieldError,
        clearFieldError
    };
}
