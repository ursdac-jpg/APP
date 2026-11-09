/* Message « Envie de lire plus confortablement ? » (consigne 187, 09/11/2026).
   Sur un petit écran (moins de 1000 px de large : téléphone, tablette), l'application garde la taille de texte standard (16 px). Ce message, affiché une seule fois par visite
   sur l'accueil, dit simplement à la personne qu'elle peut agrandir le texte ou changer la police, et lui ouvre le panneau des préférences d'affichage (source unique : le bouton
   #btnPreferencesAffichage, voir initPreferencesAffichage dans js/app.js ; ce module ne recopie aucun réglage).
   Il reste affiché jusqu'à ce que la personne le ferme (jamais de minuteur : une personne qui lit lentement le raterait). Rien n'est enregistré sur le poste : « déjà vu » ne vit que dans
   la visite en cours (sessionStorage, avec une variable de secours si le navigateur le refuse). */
var MESSAGE_AFFICHAGE_LARGEUR_MAX = 1000;
var _messageAffichageVuMemoire = false;

/* Logique pure (testée) : faut-il montrer le message ? */
function messageAffichageDoitSAfficher(largeurFenetre, dejaVu) {
  var l = Number(largeurFenetre);
  if (!isFinite(l) || l <= 0) { return false; }
  return l < MESSAGE_AFFICHAGE_LARGEUR_MAX && !dejaVu;
}

function messageAffichageEstDejaVu() {
  if (_messageAffichageVuMemoire) { return true; }
  try { return window.sessionStorage.getItem('messageAffichageVu') === '1'; } catch (e) { return false; }
}

function messageAffichageMarquerVu() {
  _messageAffichageVuMemoire = true;
  try { window.sessionStorage.setItem('messageAffichageVu', '1'); } catch (e) { /* le navigateur refuse : la variable suffit pour cette visite */ }
}

function htmlMessageAffichage() {
  return '<div class="message-affichage" id="messageAffichage" role="region" aria-label="Options d’affichage">' +
    '<p class="message-affichage-titre"><strong>Envie de lire plus confortablement ?</strong></p>' +
    '<p class="message-affichage-texte">Vous pouvez agrandir le texte ou changer la police d’écriture. Ces choix sont dans le bouton en forme de roue dentée, en haut de la page (« Préférences d’affichage »), et vous pouvez les changer quand vous voulez.</p>' +
    '<div class="message-affichage-actions">' +
    '<button type="button" class="btn btn-outline-primary message-affichage-bouton" id="messageAffichageOuvrir"><i class="bi bi-gear" aria-hidden="true"></i> Voir les options d’affichage</button>' +
    '<button type="button" class="btn btn-outline-secondary message-affichage-bouton" id="messageAffichageFermer">Fermer ce message</button>' +
    '</div>' +
    '</div>';
}

/* Appelée à chaque arrivée sur l'accueil (js/app.js, navigation vers la route « cv »). */
function afficherMessageAffichage() {
  if (typeof document === 'undefined' || typeof window === 'undefined') { return; }
  var app = document.getElementById('app');
  if (!app || document.getElementById('messageAffichage')) { return; }
  if (!messageAffichageDoitSAfficher(window.innerWidth, messageAffichageEstDejaVu())) { return; }
  app.insertAdjacentHTML('afterbegin', htmlMessageAffichage());
  var message = document.getElementById('messageAffichage');
  var retirer = function () {
    if (message && message.parentNode) { message.parentNode.removeChild(message); }
    // le titre remonte : les icones du Carnet, du Journal et du panier se recalent sur sa nouvelle place (meme ordre que js/app.js)
    if (typeof carnetApresNavigation === 'function') { carnetApresNavigation(); }
    if (typeof reperesApresNavigation === 'function') { reperesApresNavigation(); }
    if (typeof comparerApresNavigation === 'function') { comparerApresNavigation('cv'); }
  };
  var fermer = function () { messageAffichageMarquerVu(); retirer(); };
  document.getElementById('messageAffichageFermer').addEventListener('click', fermer);
  document.getElementById('messageAffichageOuvrir').addEventListener('click', function (e) {
    e.stopPropagation(); // sinon le clic est vu comme un clic « ailleurs » et referme aussitôt le panneau des préférences
    var bouton = document.getElementById('btnPreferencesAffichage');
    messageAffichageMarquerVu();
    retirer();
    if (bouton) { bouton.click(); }
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { messageAffichageDoitSAfficher: messageAffichageDoitSAfficher, htmlMessageAffichage: htmlMessageAffichage, MESSAGE_AFFICHAGE_LARGEUR_MAX: MESSAGE_AFFICHAGE_LARGEUR_MAX };
}
