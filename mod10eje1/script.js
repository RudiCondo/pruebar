const form = document.getElementById('registrationForm');
const inputs = form.querySelectorAll('input');
const passwordInput = document.getElementById('password');
const confirmInput = document.getElementById('confirmPassword');
const submitBtn = document.querySelector('.submit-btn');
const strengthBar = document.querySelector('.strength-bar');
const strengthText = document.querySelector('.strength-text');

// Mensajes de error personalizados
const errorMessages = {
    username: {
        valueMissing: 'El nombre de usuario es obligatorio',
        tooShort: 'El nombre debe tener al menos 3 caracteres'
    },
    email: {
        valueMissing: 'El correo electrónico es obligatorio',
        typeMismatch: 'Ingresa un correo electrónico válido',
        patternMismatch: 'El correo debe terminar en .com'
    },
    password: {
        valueMissing: 'La contraseña es obligatoria',
        tooShort: 'La contraseña debe tener al menos 8 caracteres',
        patternMismatch: 'La contraseña no cumple los requisitos',
        customError: 'La contraseña debe incluir mayúscula, minúscula, número y caracter especial'
    },
    confirmPassword: {
        valueMissing: 'Confirma tu contraseña',
        customError: 'Las contraseñas no coinciden'
    },
    phone: {
        patternMismatch: 'Ingresa un número de 8 dígitos'
    },
    terms: {
        valueMissing: 'Debes aceptar los términos y condiciones'
    }
};

// Validación en tiempo real
inputs.forEach(input => {
    input.addEventListener('blur', () => {
        // Validar al salir del campo
        if (input === passwordInput) setPasswordValidity();
        if (input === confirmInput) setConfirmPasswordValidity();
        validateField(input);
        updateSubmitState();
    });

    input.addEventListener('input', () => {
        if (input === passwordInput) {
            setPasswordValidity();
            checkPasswordStrength(input.value);
        }
        if (input === confirmInput) {
            setConfirmPasswordValidity();
        }

        // Revalidar si ya estaba inválido para mejorar UX
        if (input.classList.contains('invalid') || input.type === 'checkbox') {
            validateField(input);
        }

        updateSubmitState();
    });
});

function validateField(input) {
    const formGroup = input.closest('.form-group');
    const errorElement = formGroup.querySelector('.error-message');
    
    // Sincronizar customValidity de confirmPassword y password
    if (input === confirmInput || input === passwordInput) {
        // setCustomValidity para password (complejidad)
        setPasswordValidity();
        // setCustomValidity para confirmPassword (coincidencia)
        setConfirmPasswordValidity();
    }
    
    // Validación estándar HTML5
    if (!input.checkValidity()) {
        const errorType = getErrorType(input.validity);
        const message = errorMessages[input.name]?.[errorType] || 'Campo inválido';
        showError(formGroup, errorElement, message);
        return false;
    }
    
    showSuccess(formGroup, errorElement);
    return true;
}

function setConfirmPasswordValidity() {
    if (!confirmInput) return;
    if (confirmInput.value && confirmInput.value !== passwordInput.value) {
        confirmInput.setCustomValidity(errorMessages.confirmPassword.customError);
    } else {
        confirmInput.setCustomValidity('');
    }
}

function setPasswordValidity() {
    if (!passwordInput) return;
    const val = passwordInput.value;
        const complexity = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}/;
    if (val && !complexity.test(val)) {
        passwordInput.setCustomValidity(errorMessages.password.customError);
    } else {
        passwordInput.setCustomValidity('');
    }
}

function getErrorType(validity) {
    if (validity.valueMissing) return 'valueMissing';
    if (validity.typeMismatch) return 'typeMismatch';
    if (validity.tooShort) return 'tooShort';
    if (validity.patternMismatch) return 'patternMismatch';
    if (validity.customError) return 'customError';
    return 'invalid';
}

function showError(formGroup, errorElement, message) {
    formGroup.classList.add('error');
    formGroup.classList.remove('valid');
    formGroup.querySelector('input').classList.add('invalid');
    formGroup.querySelector('input').classList.remove('valid');
    errorElement.textContent = message;
}

function showSuccess(formGroup, errorElement) {
    const inputEl = formGroup.querySelector('input');
    const hasValue = inputEl.type === 'checkbox' ? inputEl.checked : inputEl.value.trim() !== '';

    if (hasValue) {
        formGroup.classList.remove('error');
        formGroup.classList.add('valid');
        inputEl.classList.remove('invalid');
        inputEl.classList.add('valid');
        inputEl.setAttribute('aria-invalid', 'false');
        errorElement.textContent = '';
        errorElement.removeAttribute('role');
    } else {
        // Si el campo está vacío, limpiar estados (evita marcar como válido campos opcionales vacíos)
        formGroup.classList.remove('error');
        formGroup.classList.remove('valid');
        inputEl.classList.remove('invalid');
        inputEl.classList.remove('valid');
        inputEl.setAttribute('aria-invalid', 'false');
        errorElement.textContent = '';
        errorElement.removeAttribute('role');
    }
}

function checkPasswordStrength(password) {
    if (!strengthBar || !strengthText) return;

    if (!password) {
        // Resetear visual si no hay contraseña
        strengthBar.className = 'strength-bar';
        strengthText.textContent = '';
        return;
    }

    let strength = 0;
    
    // Criterios de fortaleza
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    
    // Actualizar visualización
    strengthBar.className = 'strength-bar';
    
    if (strength <= 2) {
        strengthBar.classList.add('weak');
        strengthText.textContent = 'Débil';
    } else if (strength <= 4) {
        strengthBar.classList.add('medium');
        strengthText.textContent = 'Media';
    } else {
        strengthBar.classList.add('strong');
        strengthText.textContent = 'Fuerte';
    }
}

function updateSubmitState() {
    setConfirmPasswordValidity();
    setPasswordValidity();
    submitBtn.disabled = !form.checkValidity();
}

// Inicializar estado del botón al cargar
updateSubmitState();

// Manejo del submit
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    let isValid = true;
    
    // Validar todos los campos
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    if (isValid) {
        // Obtener datos del formulario
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        console.log('Formulario válido:', data);
        alert('¡Registro exitoso! Revisa la consola para ver los datos.');
        
        // Aquí normalmente enviarías los datos al servidor
        // fetch('/api/register', { method: 'POST', body: JSON.stringify(data) })
    } else {
        alert('Por favor, corrige los errores del formulario');
    }
});