# Point accessibilité, RGPD et SEO

Audit de la refonte au 17 septembre 2026. Il s’agit d’un contrôle technique et éditorial, pas d’un audit RGAA exhaustif ni d’un conseil juridique.

## Synthèse

| Sujet | État de la refonte | Reste à faire avant production |
|---|---|---|
| Accessibilité | Socle robuste intégré | Audit manuel complet, lecteurs d’écran et zoom 400 % |
| RGPD | Collecte minimisée, information en deux niveaux, aucun traceur tiers | Vérifier les sous-traitants et les durées réellement appliquées |
| SEO | Métadonnées, canonicals, données structurées, sitemap et contenus locaux | Valider le téléphone puis déclarer le site aux outils moteurs |

## Accessibilité

### Corrigé ou intégré

- langue de page (`lang="fr"`), titres de pages uniques et structure sémantique ;
- un seul contenu principal et un lien d’évitement visible au focus ;
- navigation cohérente, indication de page courante et plan du site comme second moyen d’accès ;
- menu mobile utilisable au clavier, état `aria-expanded` et fermeture avec Échap ;
- styles de focus visibles, sans suppression de l’indicateur natif ;
- tailles fluides, mise en page responsive et contenus utilisables sans survol ;
- respect de `prefers-reduced-motion` ;
- libellés explicites et reliés aux champs, aide textuelle, attributs d’autocomplétion et erreurs natives ;
- statut d’envoi annoncé via `role="status"` et focus déplaçable ;
- alternatives textuelles contextualisées sur les images informatives ;
- couleurs principales choisies pour viser le contraste AA sur les textes courants.

### Audit d’accessibilité du 20 octobre 2026 : corrigé

Contrôles réalisés : axe-core (WCAG 2.2 AA) sur toutes les pages à 1280 et 390 px, parcours clavier avant et arrière, redistribution à 320 px, espacement du texte (critère 1.4.12), contraste mesuré du focus et scénarios du formulaire.

- indicateur de focus à 3:1 minimum partout : variable `--focus`, clay-dark sur fonds clairs et straw sur l’en-tête, le pied de page, les bandeaux et le lien d’évitement (critère 1.4.11, RGAA 10.7) ;
- champs du formulaire avec un contour de focus plein au lieu du halo à 1,32:1 ;
- `scroll-padding-top` pour que l’en-tête sticky ne masque plus l’élément focalisé ni les ancres (critère 2.4.11) ;
- validation du formulaire accessible : `novalidate` posé par le script, messages précis sous chaque champ reliés par `aria-describedby`, `aria-invalid`, récapitulatif cliquable qui reçoit le focus, revalidation à la saisie (critères 3.3.1 et 3.3.3, RGAA 11.10 et 11.11) ;
- explication de l’astérisque placée avant le premier champ et format de l’e-mail indiqué ;
- messages réseau et serveur compréhensibles en français, adresse de contact reprise de `site.email` ;
- `role="list"` sur les listes sans puces (restitution VoiceOver et Safari) ;
- `aside` imbriqués dans `main` remplacés par des `div` ;
- colonnes de grille autorisées à rétrécir (`min-width: 0`) et césure des titres, ce qui supprime les débordements à 320 px avec un espacement de texte augmenté ;
- page courante du menu soulignée (visible en mode contraste élevé) ;
- horaires écrits en toutes lettres, placeholder à 5,6:1, petits textes portés à 0,875 rem ;
- lien vers la politique de confidentialité sorti du libellé de la case à cocher.

### À tester manuellement

- navigation complète au clavier sur Chrome, Firefox et Safari ;
- restitution avec NVDA/Firefox, JAWS/Chrome et VoiceOver/Safari ;
- zoom navigateur à 200 % et 400 %, agrandissement du texte et orientation mobile ;
- contraste de chaque état interactif avec un outil dédié ;
- compréhension réelle des alternatives d’images par le propriétaire des photos ;
- messages du formulaire avec le serveur PHP de production.

Une déclaration d’accessibilité n’a volontairement pas été publiée : elle ne doit pas annoncer une conformité sans audit RGAA complet.

## RGPD

### Corrigé ou intégré

- aucune police distante, carte embarquée, vidéo tierce, pixel publicitaire ou outil d’audience ;
- aucun bandeau cookies inutile dans la version livrée, puisqu’aucun traceur n’est déposé ;
- formulaire limité aux informations utiles ; téléphone et commune facultatifs ;
- mention courte sous le formulaire et politique détaillée accessible ;
- finalité, bases légales, destinataires, durées et droits décrits ;
- la demande de devis repose sur les mesures précontractuelles ; la case obligatoire confirme la lecture de l’information et n’est pas présentée comme un consentement marketing ;
- absence de prospection électronique prévue ;
- formulation prudente sur les transferts hors UE tant que les contrats de l’hébergeur et de la messagerie ne sont pas vérifiés.

### Bloquants à lever

1. Vérifier et documenter les sous-traitants : o2switch, fournisseur SMTP et messagerie destinataire.
2. Définir puis appliquer en pratique la purge des demandes sans suite.
3. Tenir un registre interne du traitement « demandes de contact et devis ».
4. Vérifier que les journaux du serveur n’excèdent pas la durée annoncée.
5. Réévaluer les cookies et mettre en place un recueil valable avant tout ajout futur de traceurs non exemptés.
6. Sécuriser le point d’envoi PHP : anti-spam, limitation de débit, contrôle CSRF/origine adapté et journalisation minimale.

## SEO

### Corrigé ou intégré

- une intention et un titre uniques par page ;
- descriptions éditoriales uniques ;
- balises canonical absolues ;
- Open Graph et Twitter Card ;
- une hiérarchie de titres lisible avec un seul `h1` par page ;
- contenus recentrés sur Altkirch et le Sundgau, suppression des références incohérentes à Lyon ;
- JSON-LD `LandscapingBusiness` limité aux informations vérifiables ;
- `robots.txt`, `sitemap.xml` et page 404 ;
- plan du site HTML et maillage interne ;
- noms de fichiers explicites, attributs `width`/`height`, chargement différé hors premier écran ;
- variantes WebP 640, 960 et 1440 px générées au build ;
- absence de mots-clés meta obsolètes et de chiffres commerciaux invérifiables.

### Audit SEO du 20 octobre 2026 : corrigé

- `h1` porteurs de mots-clés locaux sur Services, Réalisations, À propos et Contact ;
- descriptions de 50 à 160 caractères avec localisation et appel à l’action ;
- cohérence de l’adresse : siège à Mulhouse, interventions autour d’Altkirch ;
- zone d’intervention avec les communes desservies (`site.communes`) et FAQ sur la page Services ;
- mentions Sundgau et Haut-Rhin dans le contenu et le pied de page ;
- JSON-LD en `@graph` (`WebSite` et `LandscapingBusiness`) avec horaires, communes et prestations ; `telephone` et `sameAs` sont émis dès qu’ils sont renseignés ; suppression du `priceRange` arbitraire ;
- pas de canonical sur les pages `noindex` ;
- sitemap généré depuis les collections, sans les pages `noindex` ;
- images renommées de façon descriptive, `srcset` aux largeurs réelles, WebP qualité 68, `fetchpriority="high"` sur l’image principale ;
- animation d’apparition désactivée pour les éléments visibles au chargement (LCP) ;
- images Open Graph JPEG 1200 × 630 avec dimensions et texte alternatif, personnalisables par page (`ogImage`, `ogImageAlt`) ;
- favicons 48, 96, 192 et 512 px, `apple-touch-icon` et `site.webmanifest` ;
- `.htaccess` : HTTPS et domaine sans www en 301, `/index.html` vers `/`, page 404, blocage de `/vendor/` et des listings, redirection des anciennes images, compression, cache et en-têtes de sécurité ;
- CSS et JS versionnés à chaque build ;
- contrôles de build étendus (titres, descriptions, canonical, og:image, JSON-LD, `srcset`, cohérence du sitemap).

### À faire après validation métier

- **bloquant** : le certificat HTTPS servi en production est auto-signé ; lancer AutoSSL dans cPanel avant de déployer le `.htaccess` ;
- valider la liste des communes dans `src/_data/site.json` ;
- renseigner `telephone` dans `src/_data/site.json` (affichage et balisage automatiques) ;
- créer la fiche Google Business Profile, harmoniser nom, adresse et téléphone, puis ajouter son URL dans `sameAs` ;
- soumettre le sitemap dans Google Search Console et Bing Webmaster Tools ;
- mesurer les Core Web Vitals sur l’URL publique ;
- fournir de vraies légendes de chantiers (commune, type d’intervention, contexte, avant et après) avec accord client ;
- rédiger avec Alexis des pages dédiées par prestation lorsque du contenu réel sera disponible ;
- vérifier l’éligibilité aux services à la personne (crédit d’impôt de 50 % sur l’entretien de jardin) ;
- envisager une adresse e-mail sur le domaine ;
- activer l’en-tête HSTS dans `.htaccess` une fois le HTTPS validé.

## Sécurité et technique

### Audit du 20 octobre 2026 : corrigé

Contrôles réalisés : relecture du code, `npm audit`, requêtes sur le serveur en ligne, DNS, validation HTML, mesures de poids et de Core Web Vitals dans Chrome, tests de `send-mail.php` avec PHP 8.3 et un serveur SMTP factice (provenance, pièges, validation, injection d’en-têtes, limitation du débit, panne SMTP).

- formulaire protégé contre l’usage comme relais de spam : accusé de réception sans texte saisi, contrôle de l’`Origin`, champ piège, durée minimale de remplissage, limitation du débit par IP et globale, longueurs maximales côté client et serveur ;
- objet de la demande limité à une liste fermée, caractères de contrôle retirés (injection d’en-têtes impossible) ;
- plus de double échappement dans l’objet et le Reply-To, retours à la ligne conservés, version texte des e-mails ;
- réponse aux accusés de réception redirigée vers la messagerie d’Alexis ;
- chemins PHPMailer relatifs (`__DIR__`) : plus d’identifiant cPanel dans le code ;
- journaux d’erreur sans adresse e-mail ;
- dépendances npm mises à jour, 0 vulnérabilité, versions minimales relevées dans `package.json` ;
- Content-Security-Policy stricte testée sur toutes les pages, styles inline supprimés, contrôle ajouté au build ;
- `.htaccess` : blocage des fichiers cachés, des fichiers de projet et des scripts PHP autres que `send-mail.php` ;
- images plafonnées à 1024 px, portraits recadrés en 4:5, variantes 3:2 pour les emplacements paysage, qualité adaptée à la largeur, URL versionnées par empreinte ; accueil sur mobile 3x de 2,3 Mo à 1,1 Mo ;
- version de Node fixée (`.nvmrc`, `engines`) et CI GitHub Actions (build, contrôles, syntaxe PHP, audit npm) ;
- licence LGPL de PHPMailer ajoutée, `debug.log` supprimé et `*.log` ignoré.

### À faire de votre côté

- **bloquant** : activer AutoSSL, puis HSTS dans `.htaccess` ;
- déployer uniquement `_site/` et supprimer les fichiers de l’ancien site (voir README) ;
- DNS : DMARC avec rapports puis `p=quarantine`, CAA, DNSSEC (voir README) ;
- vérifier l’existence de `contact@milliatpaysage.fr` ;
- fournir une photo d’accueil d’au moins 1920 px de large (la source actuelle fait 1024 px).

## Références utilisées

- Eleventy : https://www.11ty.dev/docs/languages/ejs/
- RGAA 4.1.2 : https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/
- Information des personnes : https://www.cnil.fr/fr/conformite-rgpd-information-des-personnes-et-transparence
- Exemples de mentions de collecte : https://www.cnil.fr/fr/exemples-de-formulaire-de-collecte-de-donnees-caractere-personnel
- Durées de conservation : https://www.cnil.fr/fr/passer-laction/les-durees-de-conservation-des-donnees
- Règles cookies : https://www.cnil.fr/fr/cookies-et-autres-traceurs/que-dit-la-loi
- Mentions et adresse d’une entreprise individuelle : https://entreprendre.service-public.fr/vosdroits/F2160
