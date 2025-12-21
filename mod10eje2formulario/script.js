// Estado del formulario
let currentStep = 1;
const totalSteps = 4;
const formData = {};

// Elementos del DOM
const form = document.getElementById('wizardForm');
const steps = document.querySelectorAll('.form-step');
const progressSteps = document.querySelectorAll('.progress-step');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const successModal = document.getElementById('successModal');

/**
 * Mostrar paso específico
 */
function showStep(step) {
    steps.forEach((s, index) => {
        s.classList.remove('active');
        if (index + 1 === step) {
            s.classList.add('active');
        }
    });

    // Actualizar barra de progreso
    progressSteps.forEach((s, index) => {
        s.classList.remove('active');
        if (index + 1 === step) {
            s.classList.add('active');
        }
        if (index + 1 < step) {
            s.classList.add('completed');
        } else {
            s.classList.remove('completed');
        }
    });

    // Mostrar/ocultar botones
    prevBtn.style.display = step === 1 ? 'none' : 'inline-block';
    nextBtn.style.display = step === totalSteps ? 'none' : 'inline-block';
    submitBtn.style.display = step === totalSteps ? 'inline-block' : 'none';

    // Si estamos en el último paso, mostrar resumen
    if (step === totalSteps) {
        showSummary();
    }
}

/**
 * Validar paso actual
 */
/**
 * Validar campo individual
 */
function validateField(input) {
    const formGroup = input.closest('.form-group');
    const errorMessage = formGroup?.querySelector('.error-message');
    let isValid = true;
    let message = '';

    // Limpiar estados previos
    input.classList.remove('valid', 'invalid');
    if (formGroup) {
        formGroup.classList.remove('error');
        if (errorMessage) errorMessage.textContent = '';
    }

    // Validaciones
    if (input.hasAttribute('required') && !input.value.trim()) {
        isValid = false;
        message = 'Este campo es obligatorio';
    } else if (input.type === 'email' && input.value && !isValidEmail(input.value)) {
        isValid = false;
        message = 'Por favor ingresa un email válido (ej: usuario@dominio.com)';
    } else if ((input.id === 'firstName' || input.id === 'lastName') && input.value && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(input.value)) {
        isValid = false;
        message = 'Solo se permiten letras y espacios';
    } else if (input.id === 'phone' && input.value && !/^\d{8}$/.test(input.value)) {
        isValid = false;
        message = 'El teléfono debe tener 8 dígitos numéricos';
    } else if (input.id === 'zipCode' && input.value && !/^\d{5}$/.test(input.value)) {
        isValid = false;
        message = 'El código postal debe tener 5 dígitos';
    }

    // Actualizar UI
    if (!isValid) {
        input.classList.add('invalid');
        if (formGroup) {
            formGroup.classList.add('error');
            // Añadir animación shake si es validación por submit/next (no en input realtime a menos que sea blur)
            // Lo manejaremos con la clase shake
        }
        if (errorMessage) errorMessage.textContent = message;
    } else if (input.value) {
        input.classList.add('valid');
    }

    return isValid;
}

/**
 * Validar paso actual
 */
function validateCurrentStep() {
    const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    const inputs = currentStepElement.querySelectorAll('input:not([type="checkbox"]), select, textarea');
    let isValid = true;
    let firstInvalidInput = null;

    // Validar inputs regulares
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
            // Animación error
            const formGroup = input.closest('.form-group');
            formGroup?.classList.add('shake');
            setTimeout(() => formGroup?.classList.remove('shake'), 500);

            if (!firstInvalidInput) firstInvalidInput = input;
        }
    });

    // Validar checkboxes de intereses en paso 3
    if (currentStep === 3) {
        const interests = currentStepElement.querySelectorAll('input[name="interests"]:checked');
        const interestsGroup = currentStepElement.querySelector('.checkbox-group').closest('.form-group');
        const errorMessage = interestsGroup.querySelector('.error-message');

        if (interests.length === 0) {
            errorMessage.textContent = 'Selecciona al menos un interés';
            interestsGroup.classList.add('error');
            interestsGroup.classList.add('shake');
            setTimeout(() => interestsGroup.classList.remove('shake'), 500);
            isValid = false;
        } else {
            errorMessage.textContent = '';
            interestsGroup.classList.remove('error');
        }
    }

    // Validar términos en paso 4  
    if (currentStep === 4) {
        const terms = document.getElementById('terms');
        const formGroup = terms.closest('.form-group');
        const errorMessage = formGroup.querySelector('.error-message');

        if (!terms.checked) {
            errorMessage.textContent = 'Debes aceptar los términos y condiciones para continuar';
            formGroup.classList.add('error');
            formGroup.classList.add('shake');
            setTimeout(() => formGroup.classList.remove('shake'), 500);
            isValid = false;
        } else {
            formGroup.classList.remove('error');
        }
    }

    if (firstInvalidInput) {
        firstInvalidInput.focus();
    }

    return isValid;
}

/**
 * Guardar datos del paso actual
 */
function saveStepData() {
    const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    const inputs = currentStepElement.querySelectorAll('input, select, textarea');

    inputs.forEach(input => {
        if (input.type === 'checkbox' && input.name === 'interests') {
            if (!formData.interests) formData.interests = [];
            if (input.checked && !formData.interests.includes(input.value)) {
                formData.interests.push(input.value);
            }
        } else if (input.type === 'checkbox') {
            formData[input.name] = input.checked;
        } else if (input.value) {
            formData[input.name] = input.value;
        }
    });

    // Guardar en localStorage
    localStorage.setItem('wizardFormData', JSON.stringify(formData));
}

/**
 * Mostrar resumen
 */
function showSummary() {
    const personalHTML = `
        <p><strong>Nombre:</strong> ${formData.firstName} ${formData.lastName}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Teléfono:</strong> ${formData.phone}</p>
    `;

    const addressHTML = `
        <p><strong>Dirección:</strong> ${formData.street}</p>
        <p><strong>Ciudad:</strong> ${formData.city}</p>
        <p><strong>Código Postal:</strong> ${formData.zipCode}</p>
        <p><strong>País:</strong> ${formData.country}</p>
    `;

    const preferencesHTML = `
        <p><strong>Intereses:</strong> ${formData.interests?.join(', ') || 'Ninguno'}</p>
        <p><strong>Newsletter:</strong> ${formData.newsletter ? 'Sí' : 'No'}</p>
        ${formData.comments ? `<p><strong>Comentarios:</strong> ${formData.comments}</p>` : ''}
    `;

    document.getElementById('summaryPersonal').innerHTML = personalHTML;
    document.getElementById('summaryAddress').innerHTML = addressHTML;
    document.getElementById('summaryPreferences').innerHTML = preferencesHTML;
}

/**
 * Validar email
 */
function isValidEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

/**
 * Configurar validación en tiempo real
 */
function setupRealTimeValidation() {
    const inputs = document.querySelectorAll('input, select, textarea');

    inputs.forEach(input => {
        // Al salir del campo (blur), validamos
        input.addEventListener('blur', () => {
            if (input.type !== 'checkbox') {
                validateField(input);
            }
        });

        // Al escribir (input), limpiamos errores y validamos si ya estaba inválido
        input.addEventListener('input', () => {
            // Restricción estricta de caracteres para nombres
            if (input.id === 'firstName' || input.id === 'lastName') {
                const clean = input.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                if (clean !== input.value) {
                    input.value = clean;
                }
            }

            // Si el campo tiene clase invalid, revalidamos para quitar el error inmediatamente
            if (input.classList.contains('invalid')) {
                validateField(input);
            }
        });
    });

    // Checkboxes de intereses
    const interestCheckboxes = document.querySelectorAll('input[name="interests"]');
    interestCheckboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            const interests = document.querySelectorAll('input[name="interests"]:checked');
            const interestsGroup = cb.closest('.checkbox-group').closest('.form-group');
            if (interests.length > 0) {
                interestsGroup.classList.remove('error');
                interestsGroup.querySelector('.error-message').textContent = '';
            }
        });
    });

    // Terms checkbox
    const terms = document.getElementById('terms');
    if (terms) {
        terms.addEventListener('change', () => {
            if (terms.checked) {
                const formGroup = terms.closest('.form-group');
                formGroup.classList.remove('error');
            }
        });
    }
}

/**
 * Cargar datos guardados
 */
function loadSavedData() {
    const saved = localStorage.getItem('wizardFormData');
    if (saved) {
        const data = JSON.parse(saved);
        Object.assign(formData, data);

        // Rellenar campos
        Object.keys(data).forEach(key => {
            const input = document.querySelector(`[name="${key}"]`);
            if (input) {
                if (input.type === 'checkbox' && key !== 'interests') {
                    input.checked = data[key];
                } else if (key === 'interests') {
                    data[key].forEach(value => {
                        const checkbox = document.querySelector(`input[name="interests"][value="${value}"]`);
                        if (checkbox) checkbox.checked = true;
                    });
                } else {
                    input.value = data[key];
                }
            }
        });
    }
}

// Event listeners
nextBtn.addEventListener('click', () => {
    if (validateCurrentStep()) {
        saveStepData();
        currentStep++;
        showStep(currentStep);
    }
});

prevBtn.addEventListener('click', () => {
    currentStep--;
    showStep(currentStep);
});

form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (validateCurrentStep()) {
        saveStepData();
        console.log('Datos finales:', formData);
        successModal.classList.add('active');
        localStorage.removeItem('wizardFormData');
    }
});

// Inicializar
// Inicializar
loadSavedData();
setupRealTimeValidation();
showStep(currentStep);