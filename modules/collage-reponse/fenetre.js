// FENETRE UNIQUE « Collez la réponse de l'assistant » : dessin et câblage (navigateur). La logique et tous les textes sont dans logique.js (testés sous Node).
// Branché module par module (étape C de docs/MAQUETTE_FENETRE_UNIQUE_COLLAGE_2026-10-28.html) : voir BRIQUES_COMMUNES.md, dette B.17.
// Usage : var c = activerFenetreCollage({ racine: element, suffixe: 'Cv', nomAssistant: 'ChatGPT', module: { nom, libelleSuite, quoi, differe, verif, conseil },
//   passage: '' | '1/2' | '2/2', mode: 'reponse' | 'complement', etatInitial: 'ouvert' | 'pret', exigerFin: false,
//   continuerVisible: true,                                           // dans une fenêtre : « Continuer » est dans la fenêtre au lieu de la barre du bas
//   verifier: function (texteEntier) { return { ok: true }; },        // le module dit si le contenu est lisible (son analyseur, sans rien ajouter)
//   onContinuer: function (texteEntier | null) {},                    // clic sur « Continuer » de la barre du bas (null = continuer sans le complément)
//   apercuHtml: '<div>..</div>',                                     // aperçu sous le décompte : ce bandeau remplace « Je suis de retour », tout le reste est inactif
//   onRouvrir, onRetour, onChangerAssistant, onEchecAction, lirePressePapiers,
//   onEtat: function (etat) {} });                                    // appelé après chaque affichage (le module peut alléger sa page selon l'état)
// verifier peut renvoyer { ok: false, personnalise: { texte, bouton: { libelle } } } pour expliquer l'échec ; son bouton appelle onEchecAction ; echecParDefaut (même forme) sert pour toute réponse inutilisable quand verifier n'en dit pas plus (bouton.sansFleche : pas de flèche de retour devant le libellé, pour une action qui ne ramène nulle part).
// « Coller la réponse » lit et vérifie, sans rien ajouter ; c'est « Continuer » (barre du bas, brique data-barre-bas) qui applique.

function _fcEchapper(t) {
  return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function _fcBouton(id, libelle, classes) {
  return '<button type="button" class="' + classes + '" data-fc="' + id + '">' + libelle + '</button>';
}

// Question en gras suivie d'une petite pastille « i » : l'explication n'apparaît qu'au clic (sur téléphone, trop de texte à lire concurrence le geste principal ; retour de Denis, 28/10/2026).
function _fcQuestionInfo(id, question, explication) {
  return '<p class="fc-question"><strong>' + question + '</strong> <button type="button" class="fc-info" data-fc-info="' + id + '" aria-expanded="false" aria-label="Lire l’explication : ' + _fcEchapper(question) + '">&#9432;</button></p>' +
    '<p class="fc-info-texte fc-cache" data-fc-info-texte="' + id + '" role="note">' + String(explication).replace(/^\s+/, '') + '</p>';
}

function _fcListeEtapes(liste) {
  return '<ol class="fc-etapes">' + liste.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ol>';
}

// Dessin (refonte visuelle validée par Denis le 28/10/2026, version A « calme » : docs/MAQUETTE_FENETRE_REFONTE_VISUELLE_2026-10-28.html).
// Pas de cadres imbriqués : le texte se lit dans la page ; une bande pour la consigne du moment ; un geste à la fois ; seul le gros bouton « Coller » pulse.
function htmlFenetreCollage(m, suffixe, options) {
  options = options || {};
  var h = '<div class="fc" data-fc-racine="' + _fcEchapper(suffixe) + '">';
  if (m.nomModule) { h += '<div class="fc-module">' + _fcEchapper(m.nomModule) + '</div>'; }
  if (m.pastille) { h += '<span class="fc-passage">' + m.pastille + '</span>'; }
  h += '<h2 class="fc-titre"><span aria-hidden="true">' + m.titre.icone + '</span> ' + _fcEchapper(m.titre.texte) + '</h2>';
  // 31/10/2026 (consigne 83 a, maquette validee) : avant la reponse, la consigne et le gros bouton passent AVANT l'explication (elle se lit juste dessous) ; l'apercu du decompte garde l'ordre d'origine.
  var quoiHtml = m.quoi ? '<p class="fc-quoi"><strong>Ce qui se passe.</strong> ' + m.quoi + (m.pourquoi ? ' <strong>Pourquoi c’est utile.</strong> ' + m.pourquoi : '') + '</p>' : '';
  var quoiSousAction = !!(quoiHtml && !options.apercuHtml && m.zoneAction.visible && (m.etat === 'ouvert' || m.etat === 'pret'));
  if (quoiHtml && !quoiSousAction) { h += quoiHtml; }
  if (m.differe) { h += '<p class="fc-diff"><strong>En quoi ce passage est différent du premier.</strong> ' + m.differe + '</p>'; }
  if (options.apercuHtml) { h += options.apercuHtml; }
  else if (m.bandeau && m.etat !== 'recu') {
    h += '<div class="fc-bande"><p>' + m.bandeau.texte + '</p>';
    if (m.bandeau.boutons.length) {
      // Les boutons restent à droite, au même endroit que sur le décompte : le secondaire à gauche, le principal tout à droite.
      h += '<div class="fc-boutons">' + m.bandeau.boutons.slice().reverse().map(function (b) {
        return _fcBouton(b.id, (b.fort ? '&#8617; ' : '') + b.libelle, 'btn btn-sm ' + (b.fort ? 'btn-primary' : 'btn-outline-primary'));
      }).join('') + '</div>';
    }
    h += '</div>';
  }
  if (m.videoAssistant && !options.apercuHtml && typeof htmlVideoGeste === 'function') { h += htmlVideoGeste(m.videoAssistant); }
  if (m.conseil) { h += '<p class="fc-conseil"><strong>Bon à savoir.</strong> ' + m.conseil + '</p>'; }

  if (m.complement.visible) {
    h += '<div class="fc-bande"><p>&#10133; ' + m.complement.intro + '</p><div class="fc-boutons">' + _fcBouton('voir', '&#128269; ' + m.complement.voir, 'btn btn-sm btn-outline-primary') + '</div></div>' +
      '<div class="fc-exemples fc-cache" data-fc="exemples"><ul>' + m.complement.exemples.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul></div>' +
      _fcListeEtapes(m.complement.etapes);
  }
  if (m.coupe.visible) {
    h += '<div class="fc-etat fc-coupe" role="status"><div class="fc-grand">' + m.coupe.titre + '</div><p>' + m.coupe.texte + '</p>' + _fcListeEtapes(m.coupe.etapes) + '</div>';
  }
  if (m.echec.visible) {
    h += '<div class="fc-etat fc-echec" role="alert"><div class="fc-grand">' + m.echec.titre + '</div><p>' + m.echec.texte + '</p>' +
      (m.echec.apresSuite ? '<p>' + m.echec.texteApresSuite + '</p>' : '') + (m.echec.etapes.length ? _fcListeEtapes(m.echec.etapes) : '') +
      '<div class="fc-ligne">' +
      (m.echec.personnalise && m.echec.personnalise.bouton ? _fcBouton('echecAction', (m.echec.personnalise.bouton.sansFleche ? '' : '&#8592; ') + m.echec.personnalise.bouton.libelle, 'btn btn-primary') : '') +
      _fcBouton('recommencer', '&#8635; ' + m.echec.recommencer, 'btn ' + (m.echec.personnalise && m.echec.personnalise.bouton ? 'btn-outline-primary' : 'btn-primary')) + '</div></div>';
  }

  // « Changer d'assistant » : hors échec, il n'apparaît que si le module sait quoi en faire (options.peutChanger). Pendant l'attente de la réponse il est sur la même ligne
  // que « Coller à la main », à droite ; à l'échec il est seul, à droite aussi.
  var changerIci = !!(m.pied.visible && (m.pied.avecVideo || options.peutChanger));
  var changerDansAction = !!(changerIci && !m.pied.avecVideo && m.zoneAction.visible);
  if (m.zoneAction.visible) {
    if (options.apercuHtml) { h += '<div class="fc-apercu-legende"><span aria-hidden="true">&#128247;</span> Voici la fenêtre que vous retrouverez à votre retour</div>'; }
    h += '<div class="fc-action"><button type="button" class="fc-gros' + (m.zoneAction.desactive ? '' : ' bouton-incitation-action') + '" data-fc="coller"' + (m.zoneAction.desactive ? ' disabled' : '') + '>' +
      '&#128203; ' + m.zoneAction.libelle + ' <span class="fc-auto">' + m.zoneAction.automatique + '</span></button>' +
      '<div class="fc-sous">' + m.zoneAction.sousTexte + '</div><div class="fc-message" data-fc="message" role="status"></div>' +
      '<p class="fc-autorisation"><span aria-hidden="true">&#8505;&#65039;</span> ' + m.zoneAction.autorisation + '</p>';
    if (quoiSousAction) { h += quoiHtml; }
    if (m.blocMain) {
      h += '<div class="fc-bas"><div class="fc-bas-col">' + _fcQuestionInfo('main', m.blocMain.question, m.blocMain.explication) + _fcBouton('main', '&#9997; ' + m.blocMain.bouton, 'btn btn-sm btn-outline-primary') + '</div>';
      if (changerDansAction) {
        h += '<div class="fc-bas-col fc-bas-droite">' + _fcQuestionInfo('changer', m.pied.question, m.pied.explication) + _fcBouton('changer', '&#8634; ' + m.pied.changer, 'btn btn-sm btn-outline-primary') + '</div>';
      }
      h += '</div>';
    }
    h += '</div>';
  }
  if (m.complement.visible) { h += '<p class="fc-plustard">' + m.complement.plusTard + '</p>'; }

  if (m.zoneMain.visible) {
    h += '<div class="fc-saisie"><p class="fc-sous fc-gauche">' + m.zoneMain.consigne + '</p>' +
      '<textarea class="form-control" rows="6" data-fc="texte" placeholder="' + _fcEchapper(m.zoneMain.placeholder) + '"></textarea>' +
      '<div class="fc-message" data-fc="message" role="status"></div>' +
      '<div class="fc-ligne fc-centre">' + _fcBouton('verifier', '&#10003; ' + m.zoneMain.verifier, 'btn btn-primary') + _fcBouton('retourAuto', '&#8617; ' + m.zoneMain.retourAuto, 'btn btn-outline-primary') + '</div></div>';
  }
  if (m.recu.visible) {
    h += '<div class="fc-etat fc-recu" role="status"><div class="fc-grand">' + m.recu.titre + '</div>' + (m.recu.morceaux ? '<p>' + m.recu.morceaux + '</p>' : '') +
      '<ul class="fc-verifs">' + m.recu.lignes.filter(function (l) { return l.type === 'ok'; }).map(function (l) { return '<li>&#10003; ' + l.texte + '</li>'; }).join('') + '</ul></div>';
    // « À vérifier » est un conseil, pas une confirmation : une ligne à part, sous le message de réussite.
    m.recu.lignes.filter(function (l) { return l.type !== 'ok'; }).forEach(function (l) { h += '<div class="fc-averifier" role="note"><span aria-hidden="true">&#128269;</span> <span>' + l.texte + '</span></div>'; });
  }
  if (changerIci && !changerDansAction) {
    // Après un échec : la petite vidéo « comment coller la réponse » (ligne à filet qui se déplie, modules/video-presentation), avant les boutons.
    h += (m.pied.avecVideo && typeof htmlVideoGeste === 'function' ? htmlVideoGeste('coller-reponse') : '') + '<div class="fc-pied">' + _fcBouton('changer', '&#8634; ' + m.pied.changer, 'btn btn-sm btn-outline-primary') + '</div>';
  }
  // Aperçu sous le décompte : rien d'actif, et pas de « Continuer » (il apparaîtra au retour).
  if (options.apercuHtml) { return h + '</div>'; }
  // Dans une fenêtre (pas de barre du bas à l'écran) : « Continuer » est visible, en bas à droite de la fenêtre.
  if (options.continuerVisible) {
    return h + '<div class="fc-continuer"><button type="button" class="btn ' + (m.continuer.discret ? 'btn-outline-secondary' : 'btn-primary') + '" id="btnContinuer' + _fcEchapper(suffixe) + '" data-fc="continuer"' + (m.continuer.actif ? '' : ' disabled') + '>' +
      _fcEchapper(m.continuer.libelle) + ' &#8594;</button></div></div>';
  }
  // « Continuer » : le bouton d'origine reste caché dans la page, la brique de la barre du bas le recopie et c'est lui qui reçoit le clic (voir _barreBasAppliquer).
  // data-barre-bas-discret : la barre le dessine sur fond blanc (comme Retour et Accueil) quand on ne veut pas encourager à continuer ainsi.
  h += '<div data-barre-bas-zone style="display:none;"><button type="button" class="btn btn-primary" id="btnContinuer' + _fcEchapper(suffixe) + '" data-fc="continuer" data-barre-bas="1" data-barre-bas-masque="1" data-barre-bas-remplace="1"' + (m.continuer.discret ? ' data-barre-bas-discret="1"' : '') + ' ' +
    'data-barre-bas-libelle="' + _fcEchapper(m.continuer.libelle) + ' &#8594;"' + (m.continuer.actif ? '' : ' disabled') + '>' + _fcEchapper(m.continuer.libelle) + ' &#8594;</button></div>';
  return h + '</div>';
}

function activerFenetreCollage(config) {
  var racine = config.racine;
  var suffixe = config.suffixe || 'Fc';
  var mode = config.mode === 'complement' ? 'complement' : 'reponse';
  var etat = config.etatInitial || (mode === 'complement' ? 'pret' : 'ouvert');
  var morceaux = [], silencieux = false, echecApresSuite = false, venaitDeCoupe = false, texteFinal = '', echecPerso = null;
  var lirePressePapiers = config.lirePressePapiers || function () {
    return (navigator.clipboard && navigator.clipboard.readText) ? navigator.clipboard.readText() : Promise.reject(new Error('presse-papiers indisponible'));
  };

  function entree() {
    return { etat: etat, mode: mode, passage: config.passage || '', silencieux: silencieux, echecApresSuite: echecApresSuite, pieces: morceaux.length,
      echecPersonnalise: echecPerso, nomAssistant: _fcEchapper(config.nomAssistant || ''), conseilAssistant: config.conseilAssistant || '', module: config.module || {} };
  }
  function el(nom) { return racine.querySelector('[data-fc="' + nom + '"]'); }
  function message(texte) { var z = el('message'); if (z) { z.textContent = texte || ''; } }
  function lier(nom, f) { var e = el(nom); if (e) { e.addEventListener('click', f); } }

  function dessiner() {
    racine.innerHTML = htmlFenetreCollage(modeleFenetreCollage(entree()), suffixe, { continuerVisible: !!config.continuerVisible, apercuHtml: config.apercuHtml || '', peutChanger: typeof config.onChangerAssistant === 'function' });
    if (config.apercuHtml) {
      // Aperçu : tout ce qui porte data-fc est inactif (le bandeau du décompte, lui, garde ses boutons).
      Array.prototype.forEach.call(racine.querySelectorAll('[data-fc]'), function (b) { b.disabled = true; });
      return;
    }
    lier('retour', function () { etat = 'pret'; dessiner(); if (config.onRetour) { config.onRetour(); } });
    lier('rouvrir', function () { if (config.onRouvrir) { config.onRouvrir(); } });
    lier('coller', collerAuto);
    lier('main', function () { venaitDeCoupe = (etat === 'coupe'); etat = 'main'; dessiner(); });
    lier('verifier', function () {
      var zone = el('texte'); var valeur = zone ? zone.value : '';
      if (!valeur.trim()) { message('Le cadre est vide : collez d’abord la réponse de l’assistant.'); return; }
      traiter(valeur, venaitDeCoupe);
    });
    lier('retourAuto', function () { etat = venaitDeCoupe ? 'coupe' : (mode === 'complement' ? 'pret' : 'pret'); dessiner(); });
    lier('recommencer', function () { echecPerso = null; morceaux = []; silencieux = false; echecApresSuite = false; venaitDeCoupe = false; texteFinal = ''; etat = 'pret'; dessiner(); });
    lier('echecAction', function () { if (config.onEchecAction) { config.onEchecAction(); } });
    lier('changer', function () { if (config.onChangerAssistant) { config.onChangerAssistant(); } });
    Array.prototype.forEach.call(racine.querySelectorAll('[data-fc-info]'), function (b) {
      b.addEventListener('click', function () {
        var texte = racine.querySelector('[data-fc-info-texte="' + b.getAttribute('data-fc-info') + '"]');
        if (!texte) { return; }
        var ouvert = texte.classList.toggle('fc-cache') === false;
        b.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
      });
    });
    lier('voir', function () { var ex = el('exemples'); if (ex) { ex.classList.toggle('fc-cache'); } });
    lier('continuer', function () { if (config.onContinuer) { config.onContinuer(etat === 'recu' ? texteFinal : null); } });
    if (config.onEtat) { config.onEtat(etat); }
  }

  function collerAuto() {
    var estSuite = (etat === 'coupe');
    var promesse; try { promesse = Promise.resolve(lirePressePapiers()); } catch (e) { promesse = Promise.reject(e); }
    promesse.then(function (texte) {
      if (!String(texte || '').trim()) { message('Le presse-papiers est vide : copiez d’abord la réponse de l’assistant, puis recommencez.'); return; }
      traiter(texte, estSuite);
    }).catch(function () {
      // Le navigateur n'autorise pas le collage automatique : on passe au collage à la main, sans rien perdre.
      venaitDeCoupe = estSuite; etat = 'main'; dessiner();
      message('Votre navigateur n’a pas autorisé le collage automatique : collez la réponse à la main dans le cadre.');
    });
  }

  function traiter(texte, estSuite) {
    var liste = estSuite ? morceaux.concat([String(texte)]) : [String(texte)];
    var assemble = assemblerMorceaux(liste);
    var analyse = analyserCompletude(assemble.texte, { exigerFin: !!config.exigerFin });
    if (!estSuite) { morceaux = []; }
    if (estSuite && assemble.repete) { echecApresSuite = true; etat = 'echec'; dessiner(); return; }
    if (analyse.statut === 'coupee') {
      morceaux = liste; silencieux = analyse.silencieuse; echecApresSuite = false; etat = 'coupe';
    } else if (analyse.statut === 'complete') {
      var verdict = (typeof config.verifier === 'function') ? config.verifier(assemble.texte) : { ok: true };
      if (verdict && verdict.ok === false) { echecApresSuite = estSuite; echecPerso = verdict.personnalise || config.echecParDefaut || null; etat = 'echec'; }
      else { morceaux = liste; texteFinal = assemble.texte; echecApresSuite = false; etat = 'recu'; }
    } else {
      echecApresSuite = estSuite; echecPerso = config.echecParDefaut || null; etat = 'echec';
    }
    dessiner();
  }

  dessiner();
  var controleur = {
    etat: function () { return etat; },
    texte: function () { return texteFinal; },
    morceaux: function () { return morceaux.slice(); },
    aller: function (e) { etat = e; dessiner(); },
    coller: function (texte) { traiter(texte, etat === 'coupe'); }
  };
  racine.__collage = controleur;
  return controleur;
}
