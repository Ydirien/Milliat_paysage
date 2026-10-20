# Milliat Paysage — Eleventy + EJS

Refonte du site vitrine de Milliat Paysage. Le site est pré-rendu avec Eleventy 3 et EJS, sans framework côté navigateur ni ressource tierce.

## Démarrer

Prérequis : Node.js 20 ou plus récent.

```bash
npm install
npm start
```

Le serveur de développement est ensuite disponible sur `http://localhost:8080`.

## Construire et contrôler

```bash
npm test
```

Cette commande :

1. génère les variantes WebP responsives depuis `assets/img` ;
2. construit le site dans `_site/` ;
3. contrôle la présence des pages, des éléments SEO essentiels et de contenus indésirables connus.

Pour une compilation seule :

```bash
npm run build
```

## Structure

- `src/*.ejs` : pages du site ;
- `src/_includes/layouts` : gabarit HTML commun ;
- `src/_includes/partials` : en-tête et pied de page ;
- `src/_data/site.json` : informations globales, communes desservies, téléphone et navigation ;
- `src/_data/images.js` : helper `images.img()` qui produit les balises `<img>` avec `srcset` ;
- `src/htaccess.ejs` : template du `.htaccess` (redirections, cache, compression, en-têtes et CSP avec l’empreinte du CSS) ;
- `src/_data/assets.js` : CSS intégré aux pages, son empreinte et les URL versionnées des fichiers statiques ;
- `src/assets` : CSS, JavaScript et images générées ;
- `scripts/optimize-images.mjs` : pipeline Sharp vers WebP ;
- `scripts/check-build.mjs` : contrôles de compilation ;
- `AUDIT.md` : état accessibilité, RGPD et SEO.
- `CHARTE-GRAPHIQUE.md` : règles d’identité visuelle et éditoriale.

## Déploiement

Déployer **uniquement le contenu de `_site/`** à la racine du domaine, jamais la racine du dépôt. Le site en ligne au 20 octobre 2026 expose par exemple `/README.md` et la liste des fichiers de `/assets/img/`.

Lors du premier déploiement de la refonte, supprimer du serveur les fichiers de l’ancien site absents de `_site/` : `README.md`, `assets/img/`, `assets/css/style.css`, `assets/css/responsive.css`, `assets/js/main.js` et `assets/js/contact.js`.

Le fichier `.htaccess` généré :

- redirige vers `https://milliatpaysage.fr` et renvoie la page 404 ;
- bloque `/vendor/`, les fichiers cachés, les fichiers de projet et tout script PHP autre que `send-mail.php` ;
- définit la Content-Security-Policy, les en-têtes de sécurité, le cache et la compression.

Avant de le déployer, le domaine doit disposer d’un certificat SSL valide (cPanel, puis AutoSSL). Sans certificat, la redirection HTTPS rend le site inaccessible. Une fois le HTTPS vérifié, décommenter l’en-tête `Strict-Transport-Security`.

## Formulaire de contact

`send-mail.php` envoie la demande à Alexis puis un accusé de réception qui ne recopie aucun texte saisi. Il refuse les envois provenant d’un autre site, écarte les robots (champ piège et durée de remplissage), limite les envois (3 par IP toutes les 10 minutes, 8 par IP et par jour, 40 par jour pour tout le site) et borne la longueur des champs. Les réglages sont en tête du fichier.

Il utilise le serveur de messagerie local d’o2switch (`127.0.0.1:25`). La variable d’environnement `MILLIAT_SMTP_PORT` permet de pointer vers un serveur SMTP de test.

## DNS à configurer (zone o2switch)

| Enregistrement | Valeur | Rôle |
|---|---|---|
| `_dmarc` TXT | `v=DMARC1; p=none; rua=mailto:contact@milliatpaysage.fr` | recevoir les rapports d’usurpation pendant 3 à 4 semaines |
| `_dmarc` TXT, ensuite | `v=DMARC1; p=quarantine; rua=mailto:contact@milliatpaysage.fr` | mettre en spam les e-mails usurpant le domaine |
| `@` CAA | `0 issue "letsencrypt.org"` et `0 issue "sectigo.com"` | limiter les autorités autorisées à émettre un certificat |
| DNSSEC | à activer dans l’interface du registre | protéger les réponses DNS |

Vérifier que la boîte `contact@milliatpaysage.fr` existe ou redirige vers la messagerie d’Alexis.

## Vérifications avant mise en ligne

- éventuel numéro de téléphone professionnel ;
- envoi réel du formulaire depuis le site en production ;
- droits d’utilisation des photographies ;
- localisation et durées de conservation appliquées par l’hébergeur et la messagerie.
