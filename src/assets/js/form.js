const form = document.querySelector("[data-contact-form]");

if (form) {
  const status = form.querySelector("[data-form-status]");
  const submit = form.querySelector("button[type='submit']");
  const contactEmail = form.dataset.contactEmail;
  const fields = [...form.querySelectorAll("[data-error-missing]")];
  const startedAt = performance.now();
  let submitted = false;

  // La validation native reste active si ce script ne se charge pas
  form.noValidate = true;

  const errorFor = (field) => {
    if (field.validity.valueMissing) return field.dataset.errorMissing;
    if (!field.validity.valid) return field.dataset.errorInvalid || field.dataset.errorMissing;
    return "";
  };

  const setFieldError = (field, message) => {
    const id = `${field.id}-error`;
    let error = document.getElementById(id);
    const describedBy = (field.getAttribute("aria-describedby") || "").split(" ").filter((token) => token && token !== id);

    if (message) {
      if (!error) {
        error = document.createElement("p");
        error.id = id;
        error.className = "field-error";
        field.closest(".field").append(error);
      }
      error.textContent = message;
      field.setAttribute("aria-invalid", "true");
      describedBy.unshift(id);
    } else {
      error?.remove();
      field.removeAttribute("aria-invalid");
    }

    if (describedBy.length) field.setAttribute("aria-describedby", describedBy.join(" "));
    else field.removeAttribute("aria-describedby");
  };

  const showStatus = (content, type) => {
    status.replaceChildren(...[].concat(content));
    status.dataset.state = type;
    status.hidden = false;
    status.focus();
  };

  const showSummary = (invalid) => {
    const title = document.createElement("p");
    title.innerHTML = `<strong>${invalid.length === 1 ? "Le formulaire contient une erreur." : `Le formulaire contient ${invalid.length} erreurs.`}</strong>`;
    const list = document.createElement("ul");
    invalid.forEach(({ field, message }) => {
      const link = document.createElement("a");
      link.href = `#${field.id}`;
      link.textContent = message;
      link.addEventListener("click", (event) => {
        event.preventDefault();
        field.focus();
      });
      const item = document.createElement("li");
      item.append(link);
      list.append(item);
    });
    showStatus([title, list], "error");
  };

  // Après une première tentative d'envoi, chaque champ est revalidé dès qu'il change
  fields.forEach((field) => {
    const revalidate = () => { if (submitted) setFieldError(field, errorFor(field)); };
    field.addEventListener("input", revalidate);
    field.addEventListener("change", revalidate);
    field.addEventListener("blur", revalidate);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    submitted = true;
    status.hidden = true;

    const invalid = fields
      .map((field) => ({ field, message: errorFor(field) }))
      .filter(({ message }) => message);
    fields.forEach((field) => setFieldError(field, errorFor(field)));
    if (invalid.length) {
      showSummary(invalid);
      return;
    }

    submit.disabled = true;
    submit.dataset.label = submit.textContent;
    submit.textContent = "Envoi en cours…";

    const fallback = `Vous pouvez aussi écrire directement à ${contactEmail}.`;
    try {
      const data = new FormData(form);
      // Durée de remplissage, contrôlée par le serveur pour écarter les robots
      data.append("elapsed", String(Math.round(performance.now() - startedAt)));
      const response = await fetch(form.action, { method: "POST", body: data });
      let result = null;
      try {
        result = await response.json();
      } catch {}
      if (!response.ok || !result?.success) throw new Error(result?.message || "L’envoi n’a pas pu aboutir.");
      form.reset();
      submitted = false;
      showStatus(document.createTextNode("Merci, votre demande a bien été envoyée. Une confirmation vient de vous être adressée par e-mail."), "success");
    } catch (error) {
      // Une coupure réseau produit une erreur technique en anglais, remplacée par un message compréhensible
      const message = error instanceof TypeError ? "La connexion a échoué. Vérifiez votre accès à Internet puis réessayez." : error.message;
      showStatus(document.createTextNode(`${message} ${fallback}`), "error");
    } finally {
      submit.disabled = false;
      submit.textContent = submit.dataset.label;
    }
  });
}
