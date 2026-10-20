<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/vendor/phpmailer/phpmailer/src/Exception.php';
require_once __DIR__ . '/vendor/phpmailer/phpmailer/src/PHPMailer.php';
require_once __DIR__ . '/vendor/phpmailer/phpmailer/src/SMTP.php';

// ============ CONFIGURATION ============
// Les variantes http restent admises tant que la redirection HTTPS n'est pas active
const ALLOWED_ORIGINS = ['https://milliatpaysage.fr', 'https://www.milliatpaysage.fr', 'http://milliatpaysage.fr', 'http://www.milliatpaysage.fr'];
const FROM_EMAIL      = 'contact@milliatpaysage.fr';
const OWNER_EMAIL     = 'milliat.paysage@gmail.com';
const OWNER_NAME      = 'Alexis Milliat';
// Limites anti-abus : par adresse IP et pour l'ensemble du site
const RATE_LIMIT_IP     = [3, 600];    // 3 envois par tranche de 10 minutes
const RATE_LIMIT_IP_DAY = [8, 86400];  // 8 envois par jour
const RATE_LIMIT_GLOBAL = [40, 86400]; // 40 envois par jour pour tout le site
const MIN_FILL_TIME_MS  = 3000;        // un humain met plus de 3 secondes à remplir le formulaire

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function respond(int $status, bool $success, string $message): void {
    http_response_code($status);
    echo json_encode(['success' => $success, 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

// Masque les adresses e-mail dans les journaux du serveur
function log_error(string $message): void {
    error_log('send-mail: ' . preg_replace('/[^\s@<>]+@[^\s@<>]+/', '[email]', $message));
}

// Retire les caractères de contrôle (sauf les retours à la ligne autorisés) et limite la longueur
function clean(string $key, int $maxLength, bool $multiline = false): ?string {
    $value = $_POST[$key] ?? '';
    if (!is_string($value)) return null;
    $value = preg_replace($multiline ? '/[^\P{C}\n\t]/u' : '/\p{C}/u', '', str_replace("\r\n", "\n", $value)) ?? '';
    $value = trim($value);
    return mb_strlen($value) > $maxLength ? null : $value;
}

// Fenêtre glissante stockée dans un fichier, verrouillé pendant la mise à jour
function rate_limited(string $key, array ...$limits): bool {
    $file = sys_get_temp_dir() . '/milliat-form-' . hash('sha256', $key) . '.json';
    $handle = fopen($file, 'c+');
    if (!$handle) return false;
    flock($handle, LOCK_EX);
    $now = time();
    $longest = max(array_column($limits, 1));
    $hits = array_filter(json_decode(stream_get_contents($handle) ?: '[]', true) ?: [], fn($t) => is_int($t) && $t > $now - $longest);
    foreach ($limits as [$max, $window]) {
        if (count(array_filter($hits, fn($t) => $t > $now - $window)) >= $max) {
            flock($handle, LOCK_UN);
            fclose($handle);
            return true;
        }
    }
    $hits[] = $now;
    ftruncate($handle, 0);
    rewind($handle);
    fwrite($handle, json_encode(array_values($hits)));
    flock($handle, LOCK_UN);
    fclose($handle);
    return false;
}

function html(string $value): string {
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(405, false, 'Méthode non autorisée.');
}

// ============ PROVENANCE ============
// Refuse les envois déclenchés depuis un autre site
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin === '' && !empty($_SERVER['HTTP_REFERER'])) {
    $parts = parse_url($_SERVER['HTTP_REFERER']);
    $origin = ($parts['scheme'] ?? '') . '://' . ($parts['host'] ?? '');
}
if (!in_array($origin, ALLOWED_ORIGINS, true)) {
    respond(403, false, 'Envoi refusé. Utilisez le formulaire du site milliatpaysage.fr.');
}

// ============ PIÈGES À ROBOTS ============
// Champ invisible rempli ou formulaire envoyé trop vite : on simule un succès sans rien envoyer
$elapsed = filter_var($_POST['elapsed'] ?? null, FILTER_VALIDATE_INT);
if (!empty($_POST['site_web']) || ($elapsed !== false && $elapsed !== null && $elapsed < MIN_FILL_TIME_MS)) {
    respond(200, true, 'Votre message a bien été envoyé.');
}

// ============ LECTURE ET VALIDATION ============
$sujets = [
    'devis'       => 'Demande de devis',
    'info'        => 'Demande d’information',
    'reclamation' => 'Suivi d’une prestation',
];

$prenom    = clean('prenom', 80);
$nom       = clean('nom', 80);
$email     = clean('email', 254);
$telephone = clean('telephone', 30);
$secteur   = clean('secteur', 100);
$sujet     = clean('sujet', 20);
$message   = clean('message', 5000, true);
$rgpd      = isset($_POST['rgpd']);

if (in_array(null, [$prenom, $nom, $email, $telephone, $secteur, $sujet, $message], true)) {
    respond(400, false, 'Un des champs dépasse la longueur autorisée. Raccourcissez votre saisie puis réessayez.');
}
if (mb_strlen($prenom) < 2 || mb_strlen($nom) < 2 || mb_strlen($message) < 10
    || !isset($sujets[$sujet]) || !PHPMailer::validateAddress($email) || !$rgpd) {
    respond(400, false, 'Certains champs obligatoires sont manquants ou invalides. Vérifiez le formulaire puis réessayez.');
}
$sujet_lisible = $sujets[$sujet];

// ============ LIMITATION DU DÉBIT ============
$ip = $_SERVER['REMOTE_ADDR'] ?? 'inconnue';
if (rate_limited('ip-' . $ip, RATE_LIMIT_IP, RATE_LIMIT_IP_DAY) || rate_limited('global', RATE_LIMIT_GLOBAL)) {
    respond(429, false, 'Trop de demandes ont été envoyées depuis votre connexion. Réessayez plus tard.');
}

// ============ PHPMAILER ============
function createMailer(): PHPMailer {
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    // Serveur de messagerie local d'o2switch (le port est surchargeable pour les tests)
    $mail->Host        = '127.0.0.1';
    $mail->Port        = (int) (getenv('MILLIAT_SMTP_PORT') ?: 25);
    $mail->SMTPAuth    = false;
    $mail->SMTPSecure  = '';
    $mail->SMTPAutoTLS = false;
    $mail->CharSet     = PHPMailer::CHARSET_UTF8;
    $mail->setFrom(FROM_EMAIL, 'Milliat Paysage');
    return $mail;
}

$rows = [
    'Nom'       => "$prenom $nom",
    'E-mail'    => $email,
    'Téléphone' => $telephone ?: 'Non renseigné',
    'Commune'   => $secteur ?: 'Non renseignée',
    'Objet'     => $sujet_lisible,
];

try {
    // ============ E-MAIL 1 : notification à Alexis ============
    // Les valeurs brutes vont dans les en-têtes (PHPMailer les sécurise), les valeurs échappées dans le HTML
    $mail = createMailer();
    $mail->addAddress(OWNER_EMAIL, OWNER_NAME);
    $mail->addReplyTo($email, "$prenom $nom");
    $mail->Subject = "Nouveau contact : $sujet_lisible - $prenom $nom";
    $mail->isHTML(true);
    $tableRows = '';
    foreach ($rows as $label => $value) {
        $cell = $label === 'E-mail' ? "<a href='mailto:" . html($value) . "'>" . html($value) . '</a>' : html($value);
        $tableRows .= "<tr><td style='padding:8px;font-weight:bold;'>" . html($label) . "</td><td style='padding:8px;'>$cell</td></tr>";
    }
    $mail->Body = "
        <div style='font-family:Arial,sans-serif;max-width:600px;margin:auto;'>
            <h2 style='color:#2d6a4f;'>Nouveau message depuis le formulaire de contact</h2>
            <table style='width:100%;border-collapse:collapse;'>$tableRows</table>
            <h3 style='color:#2d6a4f;margin-top:1.5rem;'>Message</h3>
            <p style='background:#f9f9f9;padding:1rem;border-left:4px solid #2d6a4f;'>" . nl2br(html($message)) . "</p>
            <p style='color:#999;font-size:0.85rem;'>Envoyé le " . date('d/m/Y à H:i') . "</p>
        </div>";
    $mail->AltBody = implode("\n", array_map(fn($label, $value) => "$label : $value", array_keys($rows), $rows))
        . "\n\nMessage\n$message\n\nEnvoyé le " . date('d/m/Y à H:i');
    $mail->send();

    // ============ E-MAIL 2 : accusé de réception ============
    // Aucun texte saisi n'y est recopié, pour que le formulaire ne puisse pas servir à envoyer des messages à des tiers
    $confirm = createMailer();
    $confirm->addAddress($email);
    $confirm->addReplyTo(OWNER_EMAIL, OWNER_NAME);
    $confirm->Subject = 'Votre demande a bien été reçue - Milliat Paysage';
    $confirm->isHTML(true);
    $confirm->Body = "
        <div style='font-family:Arial,sans-serif;max-width:600px;margin:auto;'>
            <h2 style='color:#2d6a4f;'>Bonjour,</h2>
            <p>Merci pour votre demande (" . html($sujet_lisible) . "). Je l’ai bien reçue et je vous répondrai <strong>sous 48h ouvrées</strong>, du lundi au vendredi.</p>
            <p>Pour compléter votre demande, répondez simplement à cet e-mail, par exemple avec quelques photos du terrain.</p>
            <p style='margin-top:2rem;'>Cordialement,<br><strong>Alexis Milliat</strong><br>Milliat Paysage<br>
            <a href='https://milliatpaysage.fr'>milliatpaysage.fr</a></p>
            <hr style='border:none;border-top:1px solid #eee;margin:2rem 0;'>
            <p style='color:#777;font-size:0.8rem;'>Vous recevez cet e-mail car une demande a été envoyée avec cette adresse depuis le formulaire de contact de milliatpaysage.fr. Si vous n’êtes pas à l’origine de cette demande, ignorez ce message.</p>
        </div>";
    $confirm->AltBody = "Bonjour,\n\nMerci pour votre demande ($sujet_lisible). Je l’ai bien reçue et je vous répondrai sous 48h ouvrées, du lundi au vendredi.\n\nCordialement,\nAlexis Milliat\nMilliat Paysage\nhttps://milliatpaysage.fr\n\nSi vous n’êtes pas à l’origine de cette demande, ignorez ce message.";
    try {
        $confirm->send();
    } catch (Exception $e) {
        // La demande est déjà transmise : un échec de l'accusé de réception ne doit pas faire renvoyer le formulaire
        log_error('accusé de réception non envoyé, ' . $e->getMessage());
    }

    respond(200, true, 'Votre message a bien été envoyé. Vous recevrez une confirmation par e-mail.');
} catch (Exception $e) {
    log_error('notification non envoyée, ' . $e->getMessage());
    respond(500, false, 'Une erreur est survenue lors de l’envoi. Veuillez réessayer.');
}
