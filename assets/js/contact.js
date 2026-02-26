/* ========================================
   MILLIAT PAYSAGISTE - Formulaire de contact
   ========================================
   Validation côté client et gestion de l'envoi
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {
  const contactForm = document.getElementById('contact-form');
  
  if (contactForm) {
    initContactForm(contactForm);
  }
});

// ============ INITIALISATION DU FORMULAIRE ============
function initContactForm(form) {
  const inputs = form.querySelectorAll('input, textarea, select');
  
  // Validation en temps réel
  inputs.forEach(input => {
    // Validation au blur (perte de focus)
    input.addEventListener('blur', function() {
      validateField(this);
    });
    
    // Retirer l'erreur lors de la saisie
    input.addEventListener('input', function() {
      if (this.parentElement.classList.contains('error')) {
        this.parentElement.classList.remove('error');
      }
    });
  });
  
  // Gestion de la soumission du formulaire
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    handleFormSubmit(form);
  });
}

// ============ VALIDATION D'UN CHAMP ============
function validateField(field) {
  const fieldGroup = field.parentElement;
  const fieldName = field.getAttribute('name');
  const fieldValue = field.value.trim();
  let isValid = true;
  let errorMessage = '';
  
  // Réinitialiser l'erreur
  fieldGroup.classList.remove('error');
  const existingError = fieldGroup.querySelector('.error-message');
  if (existingError) {
    existingError.textContent = '';
  }
  
  // Validation selon le type de champ
  switch(fieldName) {
    case 'nom':
    case 'prenom':
      if (fieldValue === '') {
        isValid = false;
        errorMessage = 'Ce champ est obligatoire';
      } else if (fieldValue.length < 2) {
        isValid = false;
        errorMessage = 'Minimum 2 caractères requis';
      } else if (!/^[a-zA-ZÀ-ÿ\s\-']+$/.test(fieldValue)) {
        isValid = false;
        errorMessage = 'Caractères invalides';
      }
      break;
      
    case 'email':
      if (fieldValue === '') {
        isValid = false;
        errorMessage = 'L\'email est obligatoire';
      } else if (!isValidEmail(fieldValue)) {
        isValid = false;
        errorMessage = 'Email invalide';
      }
      break;
      
    case 'telephone':
      if (fieldValue !== '' && !isValidPhone(fieldValue)) {
        isValid = false;
        errorMessage = 'Numéro de téléphone invalide';
      }
      break;
      
    case 'sujet':
      if (fieldValue === '') {
        isValid = false;
        errorMessage = 'Veuillez sélectionner un sujet';
      }
      break;
      
    case 'message':
      if (fieldValue === '') {
        isValid = false;
        errorMessage = 'Le message est obligatoire';
      } else if (fieldValue.length < 10) {
        isValid = false;
        errorMessage = 'Votre message doit contenir au moins 10 caractères';
      }
      break;
  }
  
  // Afficher l'erreur si le champ n'est pas valide
  if (!isValid) {
    fieldGroup.classList.add('error');
    if (existingError) {
      existingError.textContent = errorMessage;
    }
  }
  
  return isValid;
}

// ============ VALIDATION EMAIL ============
function isValidEmail(email) {
  // Regex standard pour valider un email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ============ VALIDATION TÉLÉPHONE ============
function isValidPhone(phone) {
  // Accepte différents formats de téléphone français
  // 0612345678, 06 12 34 56 78, 06.12.34.56.78, +33612345678, etc.
  const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
  return phoneRegex.test(phone);
}

// ============ VALIDATION COMPLÈTE DU FORMULAIRE ============
function validateForm(form) {
  const fields = form.querySelectorAll('input, textarea, select');
  let isValid = true;
  
  fields.forEach(field => {
    // Ne valider que les champs requis ou remplis
    if (field.hasAttribute('required') || field.value.trim() !== '') {
      if (!validateField(field)) {
        isValid = false;
      }
    }
  });
  
  return isValid;
}

// ============ GESTION DE LA SOUMISSION ============
function handleFormSubmit(form) {
  // Valider tous les champs
  if (!validateForm(form)) {
    // Scroller jusqu'à la première erreur
    const firstError = form.querySelector('.form-group.error');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }
  
  // Récupérer les données du formulaire
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  
  // Désactiver le bouton de soumission pendant l'envoi
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Envoi en cours...';
  
  // Simuler l'envoi du formulaire (à remplacer par un vrai envoi)
  // Dans un cas réel, vous utiliseriez fetch() pour envoyer à un backend
  
  setTimeout(() => {
    console.log('Données du formulaire:', data);
    
    // Afficher le message de succès
    showSuccessMessage(form);
    
    // Réinitialiser le formulaire
    form.reset();
    
    // Réactiver le bouton
    submitBtn.disabled = false;
    submitBtn.textContent = originalBtnText;
    
    // Scroller vers le message de succès
    const successMessage = form.querySelector('.success-message');
    if (successMessage) {
      successMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 1500);
  
  /* EXEMPLE D'ENVOI RÉEL AVEC FETCH:
  
  fetch('votre-url-backend.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(result => {
    if (result.success) {
      showSuccessMessage(form);
      form.reset();
    } else {
      showErrorMessage(form, result.message);
    }
  })
  .catch(error => {
    console.error('Erreur:', error);
    showErrorMessage(form, 'Une erreur est survenue. Veuillez réessayer.');
  })
  .finally(() => {
    submitBtn.disabled = false;
    submitBtn.textContent = originalBtnText;
  });
  */
}

// ============ AFFICHER MESSAGE DE SUCCÈS ============
function showSuccessMessage(form) {
  let successMessage = form.querySelector('.success-message');
  
  if (!successMessage) {
    successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    form.insertBefore(successMessage, form.firstChild);
  }
  
  successMessage.innerHTML = `
    <strong>✓ Message envoyé avec succès !</strong><br>
    Nous vous répondrons dans les plus brefs délais.
  `;
  successMessage.classList.add('show');
  
  // Masquer le message après 5 secondes
  setTimeout(() => {
    successMessage.classList.remove('show');
  }, 5000);
}

// ============ AFFICHER MESSAGE D'ERREUR ============
function showErrorMessage(form, message) {
  let errorMessage = form.querySelector('.error-message-global');
  
  if (!errorMessage) {
    errorMessage = document.createElement('div');
    errorMessage.className = 'error-message-global';
    errorMessage.style.cssText = `
      background-color: #f8d7da;
      color: #721c24;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
    `;
    form.insertBefore(errorMessage, form.firstChild);
  }
  
  errorMessage.innerHTML = `<strong>✗ Erreur :</strong> ${message}`;
  errorMessage.style.display = 'block';
  
  // Masquer le message après 5 secondes
  setTimeout(() => {
    errorMessage.style.display = 'none';
  }, 5000);
}

// ============ FORMATAGE AUTOMATIQUE DU TÉLÉPHONE ============
function formatPhoneInput() {
  const phoneInput = document.getElementById('telephone');
  
  if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\s/g, '');
      
      // Formater en groupes de 2 chiffres
      if (value.length > 0) {
        value = value.match(/.{1,2}/g).join(' ');
      }
      
      e.target.value = value;
    });
  }
}

// Initialiser le formatage du téléphone
formatPhoneInput();

// ============ EXPORTS (si modules ES6) ============
// export { validateForm, isValidEmail, isValidPhone };
