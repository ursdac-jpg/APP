// FENETRE UNIQUE « Collez la réponse de l'assistant » : logique pure, sans DOM (testée sous Node, tests/collageReponse.test.js).
// Maquette validée par Denis le 28/10/2026 : docs/MAQUETTE_FENETRE_UNIQUE_COLLAGE_2026-10-28.html. Décisions : docs/CONSIGNES_DE_DENIS_A_SUIVRE.md (C9).
// Trois choses ici, une seule fois pour tous les modules :
//   1. analyserCompletude : la réponse collée est-elle entière, coupée (l'assistant l'a dit, ou en silence) ou inutilisable ?
//   2. assemblerMorceaux : la suite d'une réponse coupée se colle bout à bout (jamais avec une ligne vide au milieu d'un bloc de données).
//   3. modeleFenetreCollage : pour un état donné, ce que la fenêtre montre (textes, boutons, visibilités). C'est la vérité de la maquette.
// Règles de couleur (maquette) : vert = c'est bon, jaune = incomplet, saumon = ça n'a pas fonctionné, bleu = ce que vous avez à faire.
// Aucun mot de métier (mission, expérience), jamais le mot « IA », jamais de tiret long dans ce que la personne lit.

var COLLAGE_MARQUEUR_SUITE = '[SUITE]';
var COLLAGE_CHAMP_FIN = '"fin":"complet"';
var COLLAGE_NB = ' ';

function _collageNormaliserGuillemets(t) {
  return String(t || '').replace(/[“”‟″]/g, '"');
}

// Cherche le bloc de données (accolade ouvrante suivie d'un guillemet, ou un tableau d'objets « [ { » placé avant) et dit s'il est refermé.
// Les accolades et crochets dans les textes entre guillemets ne comptent pas.
function collageLireBloc(texte) {
  var t = _collageNormaliserGuillemets(texte);
  var m = /\{[\s\\]*(?:"|\})/.exec(t);
  var tableau = /\[\s*\{[\s\\]*(?:"|\})/.exec(t);
  if (tableau && (!m || tableau.index < m.index)) { m = tableau; }
  if (!m) { return { present: false, ferme: false, profondeur: 0, debut: -1, fin: -1 }; }
  var debut = m.index, profondeur = 0, dansChaine = false, echappe = false, fin = -1;
  for (var i = debut; i < t.length; i++) {
    var c = t.charAt(i);
    if (dansChaine) {
      if (echappe) { echappe = false; } else if (c === '\\') { echappe = true; } else if (c === '"') { dansChaine = false; }
      continue;
    }
    if (c === '"') { dansChaine = true; continue; }
    if (c === '{' || c === '[') { profondeur++; }
    else if (c === '}' || c === ']') { profondeur--; if (profondeur === 0) { fin = i; break; } }
  }
  return { present: true, ferme: fin !== -1, profondeur: profondeur, debut: debut, fin: fin };
}

// statut : 'vide' | 'inutilisable' | 'coupee' | 'complete'. Pour 'coupee', silencieuse dit si l'assistant l'a signalé (false) ou non (true).
// options.exigerFin : le texte envoyé demande le champ de fin (voir COLLAGE_CHAMP_FIN) ; sans lui, un bloc refermé est jugé entier.
function analyserCompletude(texte, options) {
  options = options || {};
  var t = String(texte || '').trim();
  if (!t) { return { statut: 'vide', raison: 'vide', silencieuse: false }; }
  if (/\[\s*SUITE\s*\]/i.test(t)) { return { statut: 'coupee', raison: 'marqueur_suite', silencieuse: false }; }
  var bloc = collageLireBloc(t);
  if (!bloc.present) { return { statut: 'inutilisable', raison: 'pas_de_bloc', silencieuse: false }; }
  if (!bloc.ferme) { return { statut: 'coupee', raison: 'bloc_non_termine', silencieuse: true }; }
  if (options.exigerFin && !/"fin"\s*:\s*"complet"/i.test(_collageNormaliserGuillemets(t))) {
    return { statut: 'coupee', raison: 'fin_absente', silencieuse: true };
  }
  return { statut: 'complete', raison: 'ok', silencieuse: false };
}

function _collageRetirerMarqueurs(t) {
  return String(t || '').replace(/^[ \t]*\[\s*SUITE\s*\][ \t]*\r?\n?/gim, '').replace(/\[\s*SUITE\s*\]/gi, '');
}
function _collageRetirerOuvertureCode(t) { return String(t || '').replace(/^\s*```[a-zA-Z]*[ \t]*\r?\n?/, ''); }
function _collageRetirerClotureCode(t) { return String(t || '').replace(/\r?\n?[ \t]*```[ \t]*$/, ''); }
function _collageEmpreinteDebut(t) {
  var b = collageLireBloc(t); var source = b.present ? String(t).slice(b.debut) : String(t);
  return source.toLowerCase().replace(/[^a-z0-9àâçéèêëîïôûùü]/g, '').slice(0, 60);
}

// Assemble les morceaux collés. Si le morceau d'avant s'arrête au milieu d'un bloc de données, on colle bout à bout ; sinon, une ligne vide.
// repete : le nouveau morceau recommence par le même début que le premier (l'assistant a recommencé au lieu de continuer).
function assemblerMorceaux(morceaux) {
  var liste = Array.isArray(morceaux) ? morceaux : [];
  var resultat = ''; var repete = false;
  for (var i = 0; i < liste.length; i++) {
    var piece = _collageRetirerMarqueurs(liste[i]);
    if (i === 0) { resultat = piece.replace(/\s+$/, ''); continue; }
    piece = _collageRetirerOuvertureCode(piece);
    var e1 = _collageEmpreinteDebut(liste[0]), e2 = _collageEmpreinteDebut(piece);
    if (e1.length >= 20 && e1 === e2) { repete = true; }
    var avant = collageLireBloc(resultat);
    if (avant.present && !avant.ferme) {
      resultat = _collageRetirerClotureCode(resultat).replace(/[\r\n]+$/, '') + piece.replace(/^[\r\n]+/, '');
    } else {
      resultat = resultat.replace(/\s+$/, '') + '\n\n' + piece.replace(/^\s+/, '');
    }
  }
  return { texte: resultat, repete: repete };
}

// ---------------- Textes communs (une seule source) ----------------
function _collageGuillemets(t) { return '«' + COLLAGE_NB + t + COLLAGE_NB + '»'; }
var COLLAGE_TEXTES = {
  titreReponse: 'Collez la réponse de l’assistant',
  titreSuite: 'La suite de la réponse',
  titreComplement: 'Le complément de votre CV',
  iconeReponse: '&#128229;',
  iconeSuite: '&#10133;',
  gros: { reponse: 'Coller la réponse', suite: 'Coller la suite', complement: 'Coller le complément' },
  automatique: '(opération automatique)',
  // Selon le navigateur, la première lecture du presse-papiers déclenche une question d'autorisation (retour de Denis, 28/10/2026) : la personne est prévenue avant.
  autorisation: 'Votre navigateur <strong>peut demander l’autorisation</strong> de lire ce que vous avez copié : cliquez sur ' + _collageGuillemets('Autoriser') + ' (ou ' + _collageGuillemets('Accepter') + '). Si vous refusez, il faudra coller à la main.',
  sousGros: {
    ouvert: 'Ce bouton s’active à votre retour.',
    pret: 'Un seul clic : la réponse est collée et lue.',
    suite: 'Un seul clic : la suite est collée et ajoutée à ce que vous avez déjà collé.',
    complement: 'Un seul clic : le complément est collé et lu.'
  },
  main: {
    question: 'Le bouton ci-dessus ne marche pas ?',
    explication: ' Sur certains navigateurs, la copie automatique n’est pas autorisée. Si vous avez du mal à coller, vous pouvez le faire vous-même :',
    bouton: 'Coller à la main (vous collez vous-même)',
    consigne: 'Collez la réponse de l’assistant dans le cadre, puis cliquez sur ' + _collageGuillemets('Vérifier ce texte') + '.',
    verifier: 'Vérifier ce texte',
    retourAuto: 'Revenir au collage automatique',
    placeholder: 'La réponse de l’assistant'
  },
  bandeau: {
    ouvert: function (a) { return '✓ <strong>' + a + '</strong> est ouvert dans un autre onglet. Copiez <strong>toute</strong> sa réponse, puis revenez ici et cliquez sur ' + _collageGuillemets('Je suis de retour') + '.'; },
    pret: function (a) { return 'Vous revenez de <strong>' + a + '</strong>. Sa réponse est copiée : cliquez sur ' + _collageGuillemets('Coller la réponse') + '.'; },
    main: function (a) { return 'Vous revenez de <strong>' + a + '</strong>. Collez sa réponse à la main dans le cadre ci-dessous.'; },
    recu: function (a) { return 'Réponse de <strong>' + a + '</strong>.'; },
    retour: 'Je suis de retour',
    rouvrir: function (a) { return 'Rouvrir ' + a + ' (texte à envoyer recopié)'; }
  },
  recu: {
    titre: '✓ Réponse bien reçue',
    complete: 'La réponse est complète : elle se termine comme prévu, et toutes les rubriques attendues sont là.',
    verifierDefaut: 'en lisant le résultat, regardez qu’il correspond bien à ce que vous avez donné.',
    morceaux: function (n) { return 'Les <strong>' + n + ' morceaux</strong> collés ont été assemblés.'; }
  },
  coupe: {
    titre: '⚠️ Il manque la fin de la réponse',
    prevenu: 'L’assistant vous a prévenu : <strong>sa réponse n’est pas finie</strong>.',
    silencieux: 'La réponse s’arrête en plein milieu : l’assistant l’a coupée <strong>sans vous prévenir</strong>.',
    garde: function (n) { return ' Ce que vous avez collé est gardé (<strong>' + n + ' morceau' + (n > 1 ? 'x' : '') + '</strong>) : il reste à aller chercher la fin.'; },
    etapes: [
      'Retournez dans <strong>la même conversation</strong>, chez l’assistant (le dernier onglet utilisé).',
      'Écrivez-lui simplement le mot <strong>suite</strong>, puis envoyez.',
      'Copiez sa nouvelle réponse en entier, revenez ici et cliquez sur <strong>' + _collageGuillemets('Coller la suite') + '</strong>, juste en dessous.'
    ]
  },
  echec: {
    titre: 'Cette réponse n’a pas pu être utilisée',
    texte: '<strong>Rien n’a été ajouté à votre travail, vous n’avez rien perdu.</strong> Le texte collé ne contient pas les informations attendues : l’assistant a peut-être répondu à autre chose, ou la copie est incomplète.',
    apresSuite: '<strong>La suite n’a pas pu être jointe à la première partie.</strong> Si vous recommencez, le premier morceau est effacé aussi : tout repart de zéro.',
    etapes: [
      'Cliquez sur <strong>' + _collageGuillemets('Recommencer le collage') + '</strong> (il efface tout ce qui a été collé) et collez de nouveau, en copiant bien <strong>toute</strong> la réponse.',
      'Si cela recommence, <strong>essayez un autre assistant</strong> ou regardez la démonstration : c’est peut-être l’assistant qui bloque, pas vous.'
    ],
    recommencer: 'Recommencer le collage'
  },
  pied: {
    changer: 'Changer d’assistant',
    video: 'Voir la démonstration (20 s)',
    changerQuestion: 'Un autre assistant ?',
    changerExplication: ' À utiliser si l’assistant ne répond pas, est saturé ou refuse votre demande (par exemple parce que vous avez atteint sa limite d’utilisation). Vous revenez au choix de l’assistant pour en prendre un autre : votre travail est gardé.'
  },
  complement: {
    intro: '<strong>Votre CV est prêt. Le complément le rend plus complet.</strong> Ce n’est pas obligatoire : vous pouvez continuer sans.',
    voir: 'Voir ce que le complément ajoute',
    exemples: [
      '<strong>Vos emplois regroupés</strong> quand il y en a beaucoup, pour un CV plus lisible.',
      '<strong>Vos compétences illustrées</strong> par ce que vous savez faire, thème par thème.',
      '<strong>Les qualités attendues</strong> pour le métier que vous visez.',
      '<strong>Ce que vous avez appris</strong> pendant vos formations et vos certifications.'
    ],
    etapes: [
      'Retournez dans <strong>la même conversation</strong>, chez l’assistant.',
      'Répondez-lui : <strong>oui</strong>.',
      'Copiez sa nouvelle réponse, revenez ici et cliquez sur <strong>' + _collageGuillemets('Coller le complément') + '</strong>.'
    ],
    plusTard: '<strong>Vous pourrez l’ajouter plus tard</strong> : le bouton ' + _collageGuillemets('Ajouter le complément du CV') + ' reste disponible sur ' + _collageGuillemets('Vos documents') + ' et au moment de valider la mise en page.',
    continuerSans: 'Continuer sans le complément',
    ajouter: 'Ajouter le complément'
  }
};

function collagePastille(passage) {
  if (passage === '1/2') { return '1<small> sur </small>2 &#183; Premier passage chez l’assistant'; }
  if (passage === '2/2') { return '2<small> sur </small>2 &#183; Deuxième passage chez l’assistant'; }
  return '';
}

// Ce que la fenêtre montre. entree : { etat, mode, passage, silencieux, echecApresSuite, pieces, nomAssistant, conseilAssistant,
//   echecPersonnalise: { texte, bouton: { libelle } } (facultatif), module: { nom, libelleSuite, quoi, differe, verif, conseil } }.
// etat : 'ouvert' | 'pret' | 'main' | 'recu' | 'coupe' | 'echec'. mode : 'reponse' (défaut) | 'complement' (sans 'ouvert').
function modeleFenetreCollage(entree) {
  var e = entree || {};
  var T = COLLAGE_TEXTES;
  var mode = e.mode === 'complement' ? 'complement' : 'reponse';
  var etat = e.etat || 'ouvert';
  if (mode === 'complement' && etat === 'ouvert') { etat = 'pret'; }
  var passage = (mode === 'reponse' && (e.passage === '1/2' || e.passage === '2/2')) ? e.passage : '';
  var a = String(e.nomAssistant || 'l’assistant');
  var m = e.module || {};
  var pieces = Math.max(Number(e.pieces) || 0, 0);
  var apresSuite = !!e.echecApresSuite;
  var enSuite = (etat === 'coupe') || (pieces >= 1 && apresSuite);
  var libelleSuite = mode === 'complement' ? T.complement.ajouter : (m.libelleSuite || 'Continuer');

  var modele = { etat: etat, mode: mode, nomModule: m.nom || '', pastille: collagePastille(passage) };
  modele.titre = mode === 'complement' ? { icone: T.iconeSuite, texte: T.titreComplement }
    : (etat === 'coupe' ? { icone: T.iconeSuite, texte: T.titreSuite } : { icone: T.iconeReponse, texte: T.titreReponse });

  var avantReponse = (etat === 'ouvert' || etat === 'pret' || etat === 'main');
  modele.quoi = (mode === 'reponse' && etat !== 'coupe' && etat !== 'echec') ? String(m.quoi || '') : '';
  // « Pourquoi c'est utile » (decision F, 01/11/2026) : une phrase facultative, rangee dans le meme paragraphe que « Ce qui se passe » (pas de nouveau bloc).
  modele.pourquoi = modele.quoi ? String(m.pourquoi || '') : '';
  modele.differe = (mode === 'reponse' && passage === '2/2' && avantReponse) ? String(m.differe || '') : '';

  // bandeau du haut (le mode complément n'en a pas : ses étapes sont dans le panneau)
  modele.bandeau = null;
  if (mode === 'reponse') {
    if (etat === 'ouvert') { modele.bandeau = { texte: T.bandeau.ouvert(a), boutons: [{ id: 'retour', libelle: T.bandeau.retour, fort: true }, { id: 'rouvrir', libelle: T.bandeau.rouvrir(a), fort: false }] }; }
    else if (etat === 'pret') { modele.bandeau = { texte: T.bandeau.pret(a), boutons: [] }; }
    else if (etat === 'main') { modele.bandeau = { texte: T.bandeau.main(a), boutons: [] }; }
    else if (etat === 'recu') { modele.bandeau = { texte: T.bandeau.recu(a), boutons: [] }; }
  }
  // Petite vidéo « comment faire sur ChatGPT » (lot D1) : seulement quand l'assistant est ouvert et que c'est ChatGPT ou Perplexity (les images sont celles de leur site).
  modele.videoAssistant = (mode === 'reponse' && etat === 'ouvert') ? (/chatgpt/i.test(a) ? 'chatgpt-demande' : (/perplexity/i.test(a) ? 'perplexity-demande' : '')) : '';
  modele.conseil = mode === 'reponse' ? [m.conseil, e.conseilAssistant].filter(Boolean).join(' ') : '';

  // zone du gros bouton : avant la réponse, et quand il manque la fin (le gros bouton devient « Coller la suite »)
  var zoneAction = (etat === 'ouvert' || etat === 'pret' || etat === 'coupe');
  var cleGros = mode === 'complement' ? 'complement' : (etat === 'coupe' ? 'suite' : 'reponse');
  var cleSous = mode === 'complement' ? 'complement' : (etat === 'ouvert' ? 'ouvert' : (etat === 'coupe' ? 'suite' : 'pret'));
  modele.zoneAction = { visible: zoneAction, libelle: T.gros[cleGros], automatique: T.automatique, sousTexte: T.sousGros[cleSous], autorisation: T.autorisation, desactive: (etat === 'ouvert' && mode === 'reponse') };
  modele.blocMain = zoneAction ? { question: T.main.question, explication: T.main.explication, bouton: T.main.bouton } : null;
  modele.zoneMain = { visible: etat === 'main', consigne: T.main.consigne, verifier: T.main.verifier, retourAuto: T.main.retourAuto, placeholder: T.main.placeholder };

  var lignes = [{ type: 'ok', texte: T.recu.complete },
    { type: 'info', texte: '<strong>À vérifier :</strong> ' + (m.verif || T.recu.verifierDefaut) }];
  modele.recu = { visible: etat === 'recu', titre: T.recu.titre, morceaux: pieces > 1 ? T.recu.morceaux(pieces) : '', lignes: lignes };

  modele.coupe = { visible: etat === 'coupe', titre: T.coupe.titre, texte: (e.silencieux ? T.coupe.silencieux : T.coupe.prevenu) + T.coupe.garde(Math.max(pieces, 1)), etapes: T.coupe.etapes };
  // echecPersonnalise : { texte, bouton: { libelle } } quand le module sait dire POURQUOI la réponse est inutilisable (ex. le document déposé n'était pas un CV) ;
  // son texte remplace la phrase commune et son bouton (data-fc="echecAction") passe devant « Recommencer le collage ».
  var perso = (e.echecPersonnalise && e.echecPersonnalise.texte) ? e.echecPersonnalise : null;
  modele.echec = { visible: etat === 'echec', titre: T.echec.titre, texte: perso ? perso.texte : T.echec.texte, apresSuite: apresSuite && enSuite, texteApresSuite: T.echec.apresSuite, etapes: perso ? [] : T.echec.etapes, recommencer: T.echec.recommencer,
    personnalise: perso ? { bouton: perso.bouton || null } : null };

  modele.complement = { visible: mode === 'complement' && (etat === 'pret' || etat === 'main'), intro: T.complement.intro, voir: T.complement.voir, exemples: T.complement.exemples, etapes: T.complement.etapes, plusTard: T.complement.plusTard };

  // « Changer d'assistant » : dès l'écran du retour (assistant ouvert, prêt à coller), pour qui trouve l'assistant indisponible (plus de temps d'utilisation...) ;
  // la démonstration vidéo reste réservée à l'échec de la vérification (consignes de Denis, 28/10/2026).
  var attendReponse = (mode === 'reponse' && (etat === 'ouvert' || etat === 'pret'));
  modele.pied = { visible: etat === 'echec' || attendReponse, changer: T.pied.changer, video: T.pied.video, avecVideo: etat === 'echec', question: T.pied.changerQuestion, explication: T.pied.changerExplication };

  // le bouton « Continuer » de la barre du bas : un seul geste, dit l'action
  // « Continuer sans le complément » est discret (fond blanc, comme Retour et Accueil) : on n'encourage pas à s'en passer (retour de Denis, 28/10/2026).
  if (etat === 'recu') { modele.continuer = { libelle: libelleSuite, actif: true }; }
  else if (mode === 'complement' && (etat === 'pret' || etat === 'main')) { modele.continuer = { libelle: T.complement.continuerSans, actif: true, discret: true }; }
  else { modele.continuer = { libelle: libelleSuite, actif: false }; }
  return modele;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { COLLAGE_MARQUEUR_SUITE: COLLAGE_MARQUEUR_SUITE, COLLAGE_CHAMP_FIN: COLLAGE_CHAMP_FIN, COLLAGE_TEXTES: COLLAGE_TEXTES,
    collageLireBloc: collageLireBloc, analyserCompletude: analyserCompletude, assemblerMorceaux: assemblerMorceaux,
    modeleFenetreCollage: modeleFenetreCollage, collagePastille: collagePastille };
}
