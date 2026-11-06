/* ============================================================
   Astuce « dictée à la voix », adaptée à l'appareil de la personne.
   UNE SEULE brique pour toute l'application (consigne 85 de Denis,
   01/11/2026, maquette docs/MAQUETTE_ASTUCE_DICTEE_SELON_APPAREIL_2026-11-01.html) :
   jamais une phrase « dictée vocale » recopiée à la main dans un module.
   - astuceDicteeDetecterAppareil(nav) : logique pure (testée), renvoie
     'windows' | 'mac' | 'iphone' | 'android' | 'autre'.
   - htmlAstuceDictee(forme, phrase) : 'encart' (carte teintée) ou 'ligne'
     (petite phrase sous une zone de texte). Les gestes de l'appareil
     reconnu sont dépliés sous un lien « Comment faire sur mon... ? ».
   L'application ne peut pas savoir si la dictée est déjà activée : chaque
   texte dit aussi quoi faire « si rien ne se passe ».
   ============================================================ */

var ASTUCE_DICTEE_APPAREILS = {
  windows: {
    nom: 'mon ordinateur Windows',
    pas: [
      'Cliquez dans la zone où vous voulez écrire.',
      'Appuyez en même temps sur la touche <span class="astuce-dictee-touche">Windows</span> et la touche <span class="astuce-dictee-touche">H</span>.',
      'Une petite fenêtre avec un micro apparaît : parlez, votre texte s’écrit. Appuyez sur le micro pour arrêter.'
    ],
    aide: 'Il faut être connecté à internet. Si rien ne se passe, vérifiez que le micro de l’ordinateur est branché.'
  },
  mac: {
    nom: 'mon Mac',
    pas: [
      'Cliquez dans la zone où vous voulez écrire.',
      'Appuyez <strong>deux fois de suite</strong> sur la touche <span class="astuce-dictee-touche">fn</span> (en bas à gauche du clavier).',
      'Un petit micro apparaît : parlez, votre texte s’écrit. Appuyez sur « Terminé » pour arrêter.'
    ],
    aide: 'Si rien ne se passe : ouvrez le menu « Édition » en haut de l’écran, puis « Démarrer la dictée ». La première fois, le Mac peut vous proposer de l’activer : acceptez.'
  },
  iphone: {
    nom: 'mon iPhone ou mon iPad',
    pas: [
      'Touchez la zone où vous voulez écrire : le clavier apparaît.',
      'Touchez le petit <strong>micro</strong> en bas à droite du clavier.',
      'Parlez : votre texte s’écrit. Touchez à nouveau le micro pour arrêter.'
    ],
    aide: 'Si vous ne voyez pas de micro : Réglages, Général, Clavier, puis activez « Activer la dictée ».'
  },
  android: {
    nom: 'mon téléphone Android',
    pas: [
      'Touchez la zone où vous voulez écrire : le clavier apparaît.',
      'Touchez le petit <strong>micro</strong> sur le clavier (en haut ou à droite, selon le téléphone).',
      'Parlez : votre texte s’écrit. Touchez à nouveau le micro pour arrêter.'
    ],
    aide: 'Si vous ne voyez pas de micro, il peut être à activer dans les réglages du clavier : demandez de l’aide à un proche ou à votre conseiller.'
  }
};

// Logique pure. `nav` ressemble à `navigator` (userAgent, platform, maxTouchPoints) ;
// jamais d'accès direct au navigateur ici, pour pouvoir la tester.
function astuceDicteeDetecterAppareil(nav) {
  var ua = String((nav && nav.userAgent) || '');
  var plateforme = String((nav && nav.platform) || '');
  var tactile = Number((nav && nav.maxTouchPoints) || 0);
  if (/iPhone|iPad|iPod/i.test(ua)) { return 'iphone'; }
  // Un iPad récent se présente comme un Mac : seul l'écran tactile le distingue d'un vrai Mac.
  if (/Mac/i.test(plateforme + ' ' + ua) && tactile > 1) { return 'iphone'; }
  if (/Android/i.test(ua)) { return 'android'; }
  if (/Windows|Win32|Win64/i.test(ua + ' ' + plateforme)) { return 'windows'; }
  if (/Macintosh|MacIntel|MacPPC|Mac OS X/i.test(ua + ' ' + plateforme)) { return 'mac'; }
  return 'autre';
}

function astuceDicteeCorps(appareil) {
  var a = ASTUCE_DICTEE_APPAREILS[appareil];
  if (a) {
    return '<ol>' + a.pas.map(function (p) { return '<li>' + p + '</li>'; }).join('') + '</ol>' +
      '<p class="astuce-dictee-aide">' + a.aide + '</p>';
  }
  return '<ul class="astuce-dictee-autres">' +
    '<li><strong>Ordinateur Windows</strong> : touche <span class="astuce-dictee-touche">Windows</span> + <span class="astuce-dictee-touche">H</span>, puis parlez.</li>' +
    '<li><strong>Mac</strong> : appuyez deux fois sur la touche <span class="astuce-dictee-touche">fn</span>, puis parlez.</li>' +
    '<li><strong>iPhone ou iPad</strong> : touchez le micro en bas à droite du clavier.</li>' +
    '<li><strong>Téléphone Android</strong> : touchez le micro sur le clavier.</li></ul>';
}

function astuceDicteeLibelle(appareil) {
  var a = ASTUCE_DICTEE_APPAREILS[appareil];
  return a ? 'Comment faire sur ' + a.nom + ' ?' : 'Comment faire ?';
}

// `appareilForce` : réservé aux essais (maquette, tests) ; en usage normal, détection automatique.
function htmlAstuceDictee(forme, phrase, appareilForce) {
  var appareil = appareilForce || (typeof navigator !== 'undefined' ? astuceDicteeDetecterAppareil(navigator) : 'autre');
  var detail = '<details class="astuce-dictee-detail"><summary>' + astuceDicteeLibelle(appareil) + '</summary>' +
    astuceDicteeCorps(appareil) + '</details>';
  if (forme === 'encart') {
    return '<div class="astuce-dictee"><p>' + (phrase || '💡 <strong>Astuce : dictez votre texte à la voix</strong> plutôt que de tout taper au clavier.') + '</p>' + detail + '</div>';
  }
  return '<div class="astuce-dictee-ligne"><span>' + (phrase || 'Vous pouvez aussi dicter à la voix.') + '</span>' + detail + '</div>';
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    astuceDicteeDetecterAppareil: astuceDicteeDetecterAppareil,
    htmlAstuceDictee: htmlAstuceDictee,
    ASTUCE_DICTEE_APPAREILS: ASTUCE_DICTEE_APPAREILS
  };
}
