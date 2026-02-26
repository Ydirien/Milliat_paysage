# 🌿 Milliat Paysagiste - Site Vitrine

Site vitrine professionnel pour une entreprise de paysagisme, développé en **HTML/CSS/JavaScript pur** (sans framework).

## 📁 Structure du projet

```
milliat_paysagiste/
│
├── index.html                    # Page d'accueil
├── a-propos.html                 # Présentation de l'entreprise
├── services.html                 # Services proposés
├── realisations.html             # Portfolio / Galerie
├── contact.html                  # Formulaire de contact
├── README.md                     # Documentation
│
└── assets/
    ├── css/
    │   ├── style.css            # Styles principaux
    │   └── responsive.css       # Media queries responsive
    │
    ├── js/
    │   ├── main.js              # Scripts principaux (menu, animations)
    │   └── contact.js           # Validation du formulaire
    │
    └── img/
        └── .gitkeep             # Liste des images à ajouter
```

## 🎨 Caractéristiques du design

### Palette de couleurs
- **Vert foncé** (#2d5f3f) : Couleur principale
- **Vert clair** (#6b9071) : Couleur secondaire
- **Vert doux** (#8fae8d) : Accents
- **Beige clair** (#f4f1eb) : Arrière-plans
- **Blanc** (#ffffff) : Fond principal

### Typographie
- **Police principale** : Segoe UI (system font)
- **Titres** : Georgia (serif élégant)

### Responsive Design
Le site est entièrement responsive avec 4 breakpoints :
- **Desktop** : > 992px
- **Tablette** : 768px - 992px
- **Mobile** : 480px - 768px
- **Petit mobile** : < 480px

## ✨ Fonctionnalités JavaScript

### Menu burger responsive
- Menu latéral pour mobile/tablette
- Animation smooth
- Fermeture au clic extérieur et touche Escape
- Overlay sombre

### Animations au scroll
- Effet fade-in progressif sur les sections
- Utilisation de l'API Intersection Observer
- Performance optimisée

### Formulaire de contact
- **Validation côté client** en temps réel :
  - Email valide
  - Téléphone français
  - Champs obligatoires
  - Longueur minimale/maximale
- Messages d'erreur clairs
- Feedback visuel
- Message de succès après envoi

### Smooth scroll
- Navigation fluide entre les sections
- Ajustement automatique avec la hauteur du header

### Compteurs animés
- Animation des chiffres clés au scroll
- Déclenchement unique lors de l'apparition

## 🚀 Installation et utilisation

### Prérequis
Aucun ! Le site fonctionne avec uniquement HTML/CSS/JS.

### Lancement en local

**Option 1 : Ouvrir directement**
```bash
# Ouvrir index.html dans votre navigateur
open index.html  # macOS
xdg-open index.html  # Linux
start index.html  # Windows
```

**Option 2 : Serveur local Python**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Puis ouvrir : http://localhost:8000
```

**Option 3 : Serveur local PHP**
```bash
php -S localhost:8000
# Puis ouvrir : http://localhost:8000
```

**Option 4 : Live Server (VS Code)**
- Installer l'extension "Live Server"
- Clic droit sur index.html → Open with Live Server

## 📸 Images à ajouter

Le site utilise actuellement des **placeholders** via.placeholder.com.

### Liste des images nécessaires

Voir le fichier `assets/img/.gitkeep` pour la liste complète.

**Images prioritaires :**
1. Hero principal (1920x1080)
2. Logo/Favicon
3. Photos d'équipe (3 portraits)
4. Portfolio réalisations (10-15 photos)
5. Photos services (5 illustrations)

**Format recommandé :**
- JPEG 80-85% de qualité
- Dimensions adaptées (voir .gitkeep)
- Noms de fichiers explicites (sans espaces)
- Optimisation avec TinyPNG ou ImageOptim

### Remplacement des placeholders

Rechercher et remplacer dans tous les fichiers HTML :
```html
<!-- Ancien -->
<img src="https://via.placeholder.com/..." alt="...">

<!-- Nouveau -->
<img src="assets/img/nom-image.jpg" alt="Description précise">
```

## 📝 Personnalisation

### Modifier les couleurs

Éditer les **variables CSS** dans `assets/css/style.css` :
```css
:root {
  --color-primary: #2d5f3f;      /* Votre couleur principale */
  --color-secondary: #6b9071;    /* Votre couleur secondaire */
  --color-accent: #8fae8d;       /* Votre couleur d'accent */
  /* ... */
}
```

### Modifier les textes

Tous les contenus sont directement dans les fichiers HTML. 
Remplacer les sections concernées.

### Ajouter/Modifier des services

Dans `services.html`, ajouter un bloc :
```html
<div class="service-item fade-in">
  <div class="service-icon">🌳</div>
  <h3>Titre du service</h3>
  <p>Description</p>
</div>
```

### Ajouter des réalisations

Dans `realisations.html`, ajouter :
```html
<div class="gallery-item fade-in">
  <img src="assets/img/votre-image.jpg" alt="Description">
  <div class="gallery-overlay">
    <h3>Titre du projet</h3>
  </div>
</div>
```

## 📧 Configuration du formulaire

Le formulaire de contact utilise actuellement une **simulation** (timeout).

### Pour un envoi réel

**Option 1 : Backend PHP**
Créer un fichier `send-email.php` :
```php
<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $to = "votre@email.fr";
    $subject = "Nouveau contact : " . $data['sujet'];
    $message = "Nom : " . $data['nom'] . "\n";
    $message .= "Email : " . $data['email'] . "\n";
    $message .= "Message : " . $data['message'];
    
    $headers = "From: noreply@milliat-paysagiste.fr";
    
    if (mail($to, $subject, $message, $headers)) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false]);
    }
}
?>
```

Puis dans `assets/js/contact.js`, décommenter la section `fetch()`.

**Option 2 : Service externe**
- **Formspree** : https://formspree.io
- **EmailJS** : https://www.emailjs.com
- **Netlify Forms** : Si hébergé sur Netlify

**Option 3 : API Cloud**
- Google Sheets API
- SendGrid API
- Mailgun API

## 🌐 Hébergement

### Hébergement gratuit
- **GitHub Pages** : gratuit, facile, HTTPS
- **Netlify** : gratuit, CI/CD, formulaires
- **Vercel** : gratuit, rapide
- **Cloudflare Pages** : gratuit, performant

### Hébergement classique
- OVH, O2Switch, Hostinger, Ionos...
- Transférer les fichiers via FTP

### Déploiement sur GitHub Pages

```bash
# 1. Créer un repo GitHub
# 2. Pousser le code
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/milliat-paysagiste.git
git push -u origin main

# 3. Activer GitHub Pages dans Settings
# 4. Site disponible sur : https://username.github.io/milliat-paysagiste
```

## ⚡ Optimisations possibles

### Performance
- [x] CSS minifié (optionnel)
- [x] JS vanilla (pas de dépendances)
- [ ] Lazy loading images (code fourni, à activer)
- [ ] Compression Gzip/Brotli (serveur)
- [ ] Cache navigateur (headers serveur)

### SEO
- [x] Balises meta renseignées
- [x] HTML sémantique
- [x] Alt sur toutes les images
- [ ] Sitemap.xml à générer
- [ ] Robots.txt à créer
- [ ] Schema.org (LocalBusiness)

### Accessibilité
- [x] Aria-label sur boutons
- [x] Contraste couleurs suffisant
- [x] Navigation clavier
- [ ] Tests avec screen reader
- [ ] Focus visible amélioré

## 🐛 Dépannage

### Le menu burger ne fonctionne pas
Vérifier que `assets/js/main.js` est bien chargé avant la balise `</body>`.

### Le formulaire ne valide pas
Ouvrir la console (F12) pour voir les erreurs JavaScript.

### Les animations ne fonctionnent pas
Vérifier la compatibilité du navigateur avec `IntersectionObserver` (IE11 non supporté).

### Les styles ne s'appliquent pas
Vérifier les chemins relatifs dans les balises `<link>`.

## 📄 Mentions légales & RGPD

**À compléter** selon votre situation :
- Créer une page `mentions-legales.html`
- Créer une page `politique-confidentialite.html`
- Informations légales obligatoires (SIRET, TVA, hébergeur...)
- Politique de gestion des données personnelles

## 📞 Support

Pour toute question sur ce projet :
- Email : votre@email.fr
- GitHub Issues : [Lien vers le repo]

## 📜 Licence

Ce projet est fourni à titre d'exemple. 
Libre d'utilisation pour un usage personnel ou commercial.

## 🙏 Crédits

- **Design & Développement** : [Votre nom]
- **Images placeholders** : via.placeholder.com
- **Icônes** : Emojis Unicode

---

**Version** : 1.0.0  
**Date** : Février 2026  
**Statut** : Production Ready ✅
