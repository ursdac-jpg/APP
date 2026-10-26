/* ============================================================
   Voie 3 de « Reprendre mon CV » : « Le refaire moi-même dans un modèle » (Lot 7). INTERFACE (pas de test Node : test navigateur obligatoire).
   Sous-lot 7a : l'écran « Classer ». Sous-lot 7b : l'écran « Vérifier », l'écriture dans la fiche du CV et l'arrivée sur « Vos documents » (mode fidèle).
   Cahier : docs/CHANTIER_CV_SANS_ASSISTANT_2026-10-22.md (section 6quinquies) ; maquette : docs/MAQUETTE_REPRENDRE_VOIE3_2026-10-26.html.

   Principe : le CV est déjà déposé et relu par le dépôt du point 1 de « Reprendre mon CV » (commun aux trois voies) ; cet écran le découpe en blocs et la personne
   corrige le classement. Aucun assistant en ligne. La logique (découpage, classement, gestes) est dans logique.js, testée par `npm test`.
   Briques réutilisées : barreEtapesModule, barreNavigation (barre fixe du bas), _htmlBandeRevoirModule, detecterCoordonneesSensibles (surlignage).
   ============================================================ */

var CSA_NAV_ETAPES = [
  { label: 'Déposer', icone: '&#128221;' },
  { label: 'Ma voie', icone: '&#129517;' },
  { label: 'Classer', icone: '&#128450;' },
  { label: 'Vérifier', icone: '&#9989;' },
  { label: 'Vos documents', icone: '&#128196;' }
];

// État de la voie 3 (en mémoire, comme le dépôt de « Reprendre mon CV ») : { signature, texte, perdu, blocs, ecran, engage, ouvertId }.
var _csaEtat = null;
// Numéro de la session en cours : change quand elle est effacée (« Recommencer »), pour que « Précédent » saute les écrans disparus.
var _csaSession = 1;

function csaVoieEngagee() { return !!(_csaEtat && _csaEtat.engage); }
function csaDesengager() {
  if (_csaEtat) { _csaEtat.engage = false; }
  if (typeof dossier !== 'undefined' && dossier) { dossier.modeFidele = false; }   // le mode fidele n'appartient qu'a cette voie
}
function csaReinitialiser() {
  _csaEtat = null; _csaSession++;
  if (typeof dossier !== 'undefined' && dossier) { dossier.modeFidele = false; }
}

function _csaEchap(t) {
  return String(t === undefined || t === null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ---------- Texte à classer ----------
   Le texte relu est la base. S'il est aplati (un PDF dont les lignes ont été recollées par le dépôt), on relit le FICHIER d'origine avec le lecteur de lignes
   (le dépôt partagé le garde en mémoire : _prepLEEtat.cvFichier). Sans fichier (page rechargée), on le dit et la personne le redépose. */
function _csaPreparerTexte() {
  var releve = (_prepLEEtat && _prepLEEtat.cvTexte) || '';
  var fichier = _prepLEEtat && _prepLEEtat.cvFichier;
  if (!csaTexteAplati(releve)) { return Promise.resolve({ texte: releve, perdu: false }); }
  if (fichier && /\.pdf$/i.test(fichier.name || '')) {
    return fichier.arrayBuffer().then(csaLirePdfEnLignes).then(function (t) {
      return { texte: (t && t.trim()) ? t : releve, perdu: !(t && t.trim()) };
    }).catch(function () { return { texte: releve, perdu: true }; });
  }
  return Promise.resolve({ texte: releve, perdu: true });
}

function _csaSignature() {
  var f = _prepLEEtat && _prepLEEtat.cvFichier;
  return ((_prepLEEtat && _prepLEEtat.cvTexte) || '') + '|' + (f ? (f.name + ':' + f.size) : '');
}

/* ---------- Navigation ---------- */
function csaRetourMaVoie() {
  csaDesengager();
  _prepLEMode = 'maj'; _reprendreCvActif = true; _prepLEEcran = 'depot'; _prepLEDetour = false;
  naviguerVers('reprendre-cv');
}
// « Revoir la présentation » : détour de consultation vers la présentation de « Reprendre mon CV » ; « Revenir au module » ramène ici (_prepLERevenirModule).
function csaVoirPresentation() {
  _prepLEMode = 'maj'; _reprendreCvActif = true; _prepLEEcran = 'intro'; _prepLEDetour = true;
  _prepLEDetourRetourRoute = 'cv-sans-assistant';
  naviguerVers('reprendre-cv');
}
function csaContinuer() {
  if (!_csaEtat) { return; }
  _csaEtat.ecran = 'verifier';
  if (typeof trackEvenement === 'function') { trackEvenement('csa_classer_termine'); }
  _csaRendre();
}
function csaRetourClasser() {
  if (!_csaEtat) { return; }
  _csaEtat.ecran = 'classer';
  _csaRendre();
}

/* ---------- Historique (flèche « Précédent » du navigateur) ---------- */
function _csaSynchroniserHistorique() {
  if (typeof historiqueInterneSynchroniser !== 'function' || !_csaEtat) { return; }
  historiqueInterneSynchroniser('cv-sans-assistant', { cle: _csaSession + ':' + _csaEtat.ecran, ecran: _csaEtat.ecran, session: _csaSession });
}
function _csaRestaurerHistorique(instantane) {
  if (!_csaEtat || instantane.session !== _csaSession) { return 'sauter'; }
  _csaEtat.ecran = instantane.ecran;
}
function _csaInscrireHistorique() {
  if (typeof historiqueInterneBrancher === 'function') { historiqueInterneBrancher('cv-sans-assistant', _csaRestaurerHistorique); }
}

/* ---------- Page ---------- */
function pageCvSansAssistant() {
  if (!_prepLEEtat || !_prepLEEtat.cvTexte) {
    // Pas de CV déposé : retour au dépôt du point 1 (la voie ne peut rien classer).
    _prepLEMode = 'maj'; _reprendreCvActif = true; _prepLEEcran = 'depot'; _prepLEDetour = false;
    naviguerVers('reprendre-cv');
    return;
  }
  _reprendreCvActif = false; _reprendreCvDepuis = true; _prepLEMode = 'maj'; _prepLEDetour = false;
  _csaInscrireHistorique();
  var sig = _csaSignature();
  if (_csaEtat && _csaEtat.signature === sig && _csaEtat.blocs) {
    _csaEtat.engage = true;
    _csaRendre();
    return;
  }
  app.innerHTML = '<div class="page-catalogue-contenu csa-parcours">' + barreEtapesModule(CSA_NAV_ETAPES, 2) +
    '<div class="text-center"><h1><i class="bi bi-grid-3x3-gap"></i> Lecture de votre CV</h1><p class="sousTitre">Un instant, nous lisons les lignes de votre CV sur votre appareil.</p></div></div>';
  _csaPreparerTexte().then(function (r) {
    if (pageActuelle !== 'cv-sans-assistant') { return; }
    _csaEtat = { signature: sig, texte: r.texte, perdu: r.perdu, blocs: csaDecouper(r.texte), ecran: 'classer', engage: true, ouvertId: null };
    _csaRendre();
  });
}

function _csaRendre() {
  if (!_csaEtat) { return; }
  if (_csaEtat.ecran === 'verifier') { _csaRendreVerifier(); return; }
  var legende = CSA_ORDRE.concat(['aclasser']).map(function (r) {
    return '<span class="rpast rb-' + r + '"><i class="bi ' + CSA_RUBRIQUES[r].ic + '" aria-hidden="true"></i> ' + CSA_RUBRIQUES[r].nom + '</span>';
  }).join('');
  var alerte = _csaEtat.perdu
    ? '<div class="csa-alerte"><strong>Les lignes de votre CV n’ont pas pu être relues.</strong> Le texte arrive sur peu de lignes, ce qui rend le classement moins sûr. Pour de meilleurs résultats, retournez à « Ma voie » puis utilisez « Changer de CV » pour redéposer le fichier.</div>'
    : '';
  app.innerHTML = '<div class="page-catalogue-contenu csa-parcours">' + barreEtapesModule(CSA_NAV_ETAPES, 2) +
    _htmlBandeRevoirModule('bi-pencil-square', 'csaVoirPresentation()') +
    '<div class="text-center"><h1><i class="bi bi-grid-3x3-gap"></i> Classez les informations de votre CV</h1>' +
    '<p class="sousTitre">Nous avons découpé votre CV en blocs. Ce qui est sûr est déjà classé. Pour le reste, <strong>c’est vous qui choisissez</strong> : touchez la pastille d’un bloc pour changer sa rubrique. ' +
    'Les ciseaux, à droite d’une ligne, coupent le bloc après cette ligne. Quand nous avons une idée pour un bloc encore incertain, elle est proposée sous la forme « Peut-être : ... ? » : un toucher pour l’accepter.</p></div>' +
    alerte + '<div class="csa-legende">' + legende + '</div><div class="csa-resume" id="csaResume"></div><div id="csaBlocs"></div>' +
    '<p class="small text-muted text-center mt-3" id="csaAvantBarre"></p></div>' +
    '<div class="barre-navigation-fixe">' + barreNavigation('cv', 'cv-sans-assistant', 'Continuer', { onclickPrecedent: 'csaRetourMaVoie()', onclickSuivant: 'csaContinuer()' }) + '</div>';
  _csaRendreBlocs();
  var zone = document.getElementById('csaBlocs');
  if (zone) { zone.addEventListener('click', _csaClicBlocs); zone.addEventListener('input', _csaSaisieBlocs); }
  _csaSynchroniserHistorique();
  if (typeof trackEvenement === 'function') { trackEvenement('csa_classer_affiche'); }
}

var _CSA_LIBELLE_AUTO = {
  titre: 'reconnu grâce au titre du CV',
  contenu: 'reconnu d’après ce qui est écrit',
  choix: 'choisi par vous',
  aucun: 'pas sûr : à vous de choisir'
};
var _CSA_ICONE_REPERAGE = { tel: 'bi-telephone', mail: 'bi-envelope', cpv: 'bi-geo-alt', reseau: 'bi-link-45deg' };

// Une ligne, avec les coordonnées repérées (même repérage que la fenêtre de masquage) surlignées.
function _csaSurligner(ligne) {
  var trouves = [];
  try { trouves = detecterCoordonneesSensibles(ligne) || []; } catch (e) { trouves = []; }
  var plages = [];
  trouves.forEach(function (t) {
    var cle = Object.keys(_CSA_ICONES).filter(function (k) { return _CSA_ICONES[k] === t.icone; })[0];
    var v = String(t.valeur || '');
    var i = v ? ligne.indexOf(v) : -1;
    if (cle && i >= 0) { plages.push({ i: i, j: i + v.length, ic: _CSA_ICONE_REPERAGE[cle] }); }
  });
  plages.sort(function (a, b) { return a.i - b.i; });
  var pos = 0, h = '';
  plages.forEach(function (p) {
    if (p.i < pos) { return; }
    h += _csaEchap(ligne.slice(pos, p.i)) + '<span class="det"><i class="bi ' + p.ic + '" aria-hidden="true"></i>' + _csaEchap(ligne.slice(p.i, p.j)) + '</span>';
    pos = p.j;
  });
  return h + _csaEchap(ligne.slice(pos));
}

function _csaJetonsChoix(i, b, titreCourant) {
  var h = CSA_ORDRE.map(function (r) {
    return '<button type="button" class="rpast rb-' + r + (r === b.rub ? ' plein' : '') + '" data-rub="' + r + '" data-bloc="' + i + '"><i class="bi ' + CSA_RUBRIQUES[r].ic + '" aria-hidden="true"></i> ' + CSA_RUBRIQUES[r].nom + '</button>';
  }).join('');
  if (b.rub === 'autres') {
    h += '<label class="blk-nom">Si votre CV a une rubrique que nous n’avons pas, donnez-lui ici le nom qu’elle portera sur le CV : <input class="form-control form-control-sm" data-nomlibre="' + i + '" value="' + _csaEchap(titreCourant) + '" placeholder="Autres informations"></label>';
  }
  return h;
}

function _csaRendreBlocs() {
  var e = _csaEtat, blocs = e.blocs;
  var cible = document.getElementById('csaBlocs');
  if (!cible) { return; }
  cible.innerHTML = blocs.map(function (b, i) {
    var a = csaAnalyserBloc(b);
    var lignesH = b.lignes.map(function (l, k) {
      var cise = k < b.lignes.length - 1
        ? '<button type="button" class="blk-coupe" data-couper="' + i + ':' + k + '" title="Couper le bloc après cette ligne : la suite devient un nouveau bloc" aria-label="Couper le bloc après cette ligne"><i class="bi bi-scissors" aria-hidden="true"></i></button>'
        : '';
      return '<div class="blk-ligne' + (k === a.idx ? ' titre' : '') + '"><span>' + _csaSurligner(l) + '</span>' + cise + '</div>';
    }).join('');
    var titreAff = a.titre ? csaPhrase(a.titre) : '';
    return '<div class="blk rb-' + b.rub + '"><div class="blk-bar"></div><div class="blk-corps">' +
      '<div class="blk-tete"><button type="button" class="rpast rb-' + b.rub + '" data-ouvrir="' + i + '" aria-expanded="' + (b.id === e.ouvertId ? 'true' : 'false') + '"><i class="bi ' + CSA_RUBRIQUES[b.rub].ic + '" aria-hidden="true"></i> ' + CSA_RUBRIQUES[b.rub].nom + ' <i class="bi bi-chevron-down" aria-hidden="true"></i></button>' +
      '<span class="blk-origine">' + _CSA_LIBELLE_AUTO[b.auto] + (titreAff ? (a.libre ? ' · nom choisi : « ' : ' · titre d’origine : « ') + _csaEchap(titreAff) + ' »' : '') + '</span>' +
      (b.rub === 'aclasser' && b.prop ? '<button type="button" class="rpast prop rb-' + b.prop + '" data-prop="' + i + '" title="Accepter cette proposition"><i class="bi bi-lightbulb" aria-hidden="true"></i> Peut-être : ' + CSA_RUBRIQUES[b.prop].nom + ' ? Oui</button>' : '') +
      '<span class="blk-actions">' + (i > 0 ? '<button type="button" class="btn btn-sm btn-outline-secondary" data-fusion="' + i + '" style="border-radius:8px;"><i class="bi bi-arrow-up" aria-hidden="true"></i> Fusionner avec le bloc du dessus</button>' : '') + '</span></div>' +
      '<div class="blk-texte">' + lignesH + '</div>' +
      '<div class="blk-choix" id="csaChoix-' + i + '"' + (b.id === e.ouvertId ? '' : ' hidden') + '>' + _csaJetonsChoix(i, b, titreAff) + '</div></div></div>';
  }).join('');
  var nbA = blocs.filter(function (b) { return b.rub === 'aclasser'; }).length;
  var resume = document.getElementById('csaResume');
  if (resume) {
    resume.innerHTML = '<span><strong>' + blocs.length + '</strong> bloc' + (blocs.length > 1 ? 's' : '') + '</span>' +
      '<span><i class="bi bi-check2-circle" style="color:var(--rb-experience)" aria-hidden="true"></i> <strong>' + (blocs.length - nbA) + '</strong> classé' + (blocs.length - nbA > 1 ? 's' : '') + '</span>' +
      '<span><i class="bi bi-question-circle" style="color:var(--rb-aclasser)" aria-hidden="true"></i> <strong>' + nbA + '</strong> à classer</span>';
  }
  var avant = document.getElementById('csaAvantBarre');
  if (avant) {
    avant.innerHTML = nbA
      ? '<i class="bi bi-info-circle" aria-hidden="true"></i> ' + nbA + ' bloc' + (nbA > 1 ? 's iront' : ' ira') + ' dans « Autres informations » : vous pourrez ' + (nbA > 1 ? 'les déplacer' : 'le déplacer') + ' à l’écran suivant.'
      : '';
  }
}

function _csaConserverDefilement(f) {
  var y = window.scrollY;
  f();
  window.scrollTo(0, y);
}

function _csaClicBlocs(ev) {
  var t = ev.target.closest('button');
  if (!t || !_csaEtat) { return; }
  var e = _csaEtat;
  if (t.dataset.ouvrir !== undefined) {
    var zone = document.getElementById('csaChoix-' + t.dataset.ouvrir);
    var ouvert = !zone.hidden;
    zone.hidden = ouvert;
    t.setAttribute('aria-expanded', String(!ouvert));
    e.ouvertId = ouvert ? null : e.blocs[Number(t.dataset.ouvrir)].id;
  } else if (t.dataset.rub) {
    var i = Number(t.dataset.bloc);
    e.blocs = csaChoisirRubrique(e.blocs, i, t.dataset.rub);
    e.ouvertId = t.dataset.rub === 'autres' ? e.blocs[i].id : null;
    _csaConserverDefilement(_csaRendreBlocs);
  } else if (t.dataset.prop !== undefined) {
    var ip = Number(t.dataset.prop);
    e.blocs = csaChoisirRubrique(e.blocs, ip, e.blocs[ip].prop);
    e.ouvertId = null;
    _csaConserverDefilement(_csaRendreBlocs);
  } else if (t.dataset.fusion !== undefined) {
    e.blocs = csaFusionnerAvecLeDessus(e.blocs, Number(t.dataset.fusion));
    e.ouvertId = null;
    _csaConserverDefilement(_csaRendreBlocs);
  } else if (t.dataset.couper) {
    var p = t.dataset.couper.split(':');
    e.blocs = csaCouperApres(e.blocs, Number(p[0]), Number(p[1]));
    _csaConserverDefilement(_csaRendreBlocs);
  }
}
function _csaSaisieBlocs(ev) {
  var t = ev.target;
  if (t.dataset && t.dataset.nomlibre !== undefined && _csaEtat) { _csaEtat.blocs[Number(t.dataset.nomlibre)].nomLibre = t.value.trim(); }
}

/* ---------- Écran « Vérifier » : une fiche par rubrique, préremplie et modifiable ---------- */
// Les fiches sont refaites seulement quand le classement a changé : un aller-retour entre « Classer » et « Vérifier » ne perd pas les corrections de la personne.
function _csaConstruireFiches() {
  var e = _csaEtat;
  var sig = JSON.stringify(e.blocs.map(function (b) { return [b.rub, b.lignes, b.nomLibre || '']; }));
  if (e.fiches && e.fichesSig === sig) { return; }
  var F = csaConstruireFiches(e.blocs);
  _csaPreremplirIdentite(F);
  e.fiches = F; e.fichesSig = sig;
}
// Le texte relu n'a plus les coordonnées (la personne les a masquées pour l'assistant) : l'identité vient de ce que le dépôt a capté AVANT le masquage (_identiteCaptee).
function _csaPreremplirIdentite(F) {
  if (typeof _identiteCaptee === 'undefined' || !_identiteCaptee) { return; }
  var v = _identiteCaptee.valeurs || {}, id = F.identite;
  ['telephone', 'email', 'codePostal', 'ville', 'adresse', 'prenom', 'nom'].forEach(function (c) {
    if (!id[c] && v[c]) { id[c] = v[c]; if (c === 'prenom' || c === 'nom') { F.devine['identite.' + c] = true; } }
  });
  var s = _identiteCaptee.suggestionNom;
  if (s && !id.nom && !id.prenom) { id.nom = s.nom || ''; id.prenom = s.prenom || ''; F.devine['identite.nom'] = true; F.devine['identite.prenom'] = true; }
}

function _csaChemin(o, p) { return p.split('.').reduce(function (x, k) { return (x === undefined || x === null) ? x : x[k]; }, o); }
function _csaPoser(o, p, v) { var ks = p.split('.'), d = ks.pop(), c = ks.reduce(function (x, k) { return x[k]; }, o); c[d] = v; }
// « à vérifier » : lu d'après la place des mots, donc une supposition (fiche d'expérience ou de formation, ou champ de l'identité).
function _csaDevine(F, chemin) {
  var m = /^(experience|formation)\.(\d+)\.(\w+)$/.exec(chemin);
  if (m) { var item = F[m[1]][Number(m[2])]; return !!(item && item.devine && item.devine[m[3]]); }
  return !!F.devine[chemin];
}
function _csaChamp(F, chemin, libelle, type) {
  var v = _csaChemin(F, chemin), devine = _csaDevine(F, chemin);
  var id = 'csaf-' + chemin.replace(/\./g, '-');
  var etiquette = '<label for="' + id + '">' + _csaEchap(libelle) + (devine ? ' <span class="csa-devine" data-csa-devine="' + chemin + '">à vérifier</span>' : '') + '</label>';
  if (type === 'multi') {
    var txt = Array.isArray(v) ? v.join('\n') : v;
    return '<div class="csa-champ" style="grid-column:1/-1">' + etiquette + '<textarea id="' + id + '" class="form-control form-control-sm" rows="' + Math.max(2, (Array.isArray(v) ? v.length : 2)) + '" data-csa-f="' + chemin + '" data-csa-liste="1">' + _csaEchap(txt) + '</textarea></div>';
  }
  if (type === 'case') {
    return '<div class="csa-champ d-flex align-items-end"><label class="form-check mb-1" style="display:flex;gap:.4rem;align-items:center;font-size:.85rem;color:var(--text-strong)"><input type="checkbox" class="form-check-input mt-0" id="' + id + '" data-csa-f="' + chemin + '"' + (v ? ' checked' : '') + '> ' + _csaEchap(libelle) + '</label></div>';
  }
  return '<div class="csa-champ">' + etiquette + '<input id="' + id + '" class="form-control form-control-sm" value="' + _csaEchap(v) + '" data-csa-f="' + chemin + '"></div>';
}
function _csaBlocFiche(F, rub, corps, n) {
  return '<details class="bloc-depli" open><summary><span class="rpast rb-' + rub + '"><i class="bi ' + CSA_RUBRIQUES[rub].ic + '" aria-hidden="true"></i> ' + CSA_RUBRIQUES[rub].nom + '</span>' +
    (F.titres[rub] ? '<span class="small text-muted">titre d’origine : « ' + _csaEchap(F.titres[rub]) + ' »</span>' : '') +
    '<span class="csa-n">' + n + '</span></summary><div class="bloc-depli-corps">' + corps + '</div></details>';
}
function _csaBoutonRetirer(type, n) {
  return '<div class="text-end mt-1"><button type="button" class="btn btn-sm btn-outline-secondary" data-csa-retirer="' + type + ':' + n + '" style="border-radius:8px;"><i class="bi bi-trash" aria-hidden="true"></i> Retirer cette fiche</button></div>';
}
var _CSA_CIBLES_AUTRES = ['competences', 'qualites', 'logiciels', 'certifications', 'langues', 'loisirs', 'engagements'];
function _csaHtmlAutres(F) {
  var al = F.alertes.filter(function (a) { return a.cle === 'autres'; }).map(function (a) { return '<div class="csa-alerte"><i class="bi bi-exclamation-triangle" aria-hidden="true"></i> ' + _csaEchap(a.texte) + '</div>'; }).join('');
  var lignes = F.autres.map(function (x, k) {
    return '<div class="csa-ligne-autre"><input class="form-control form-control-sm" value="' + _csaEchap(x) + '" data-csa-autre="' + k + '" aria-label="Information"><select class="form-select form-select-sm" data-csa-deplacer="' + k + '" aria-label="Déplacer vers une autre rubrique"><option value="">Déplacer vers…</option>' +
      _CSA_CIBLES_AUTRES.map(function (r) { return '<option value="' + r + '">' + CSA_RUBRIQUES[r].nom + '</option>'; }).join('') + '<option value="accroche">Titre et accroche : phrase d’accroche</option><option value="permis">Identité : permis de conduire</option></select></div>';
  }).join('');
  return al + '<p class="small text-muted mb-2">Ce qui n’a pas trouvé sa rubrique. Rien n’est perdu : gardez-le ici, ou <strong>déplacez chaque ligne</strong> vers la bonne rubrique avec la liste à droite.</p>' +
    (lignes || '<p class="small text-muted">Rien ici : tout a trouvé sa rubrique.</p>') +
    '<button type="button" class="btn btn-sm btn-outline-secondary mt-1" data-csa-ajouter="autres" style="border-radius:8px;"><i class="bi bi-plus-lg" aria-hidden="true"></i> Ajouter une information</button>';
}
function _csaHtmlFiches() {
  var F = _csaEtat.fiches, h = '';
  var c = function (ch, lib, t) { return _csaChamp(F, ch, lib, t); };
  h += _csaBlocFiche(F, 'identite', '<div class="csa-fiche-champs">' + c('identite.nom', 'Nom') + c('identite.prenom', 'Prénom') + c('titre', 'Intitulé sous le nom') + c('identite.telephone', 'Téléphone') + c('identite.email', 'Courriel') +
    c('identite.adresse', 'Adresse (rue)') + c('identite.codePostal', 'Code postal') + c('identite.ville', 'Ville') + c('identite.permis', 'Permis de conduire') + '</div>', '');
  h += _csaBlocFiche(F, 'accroche', '<div class="csa-fiche-champs">' + c('accroche', 'Phrase d’accroche', 'multi') + '</div>', F.accroche ? '1' : '0');
  h += _csaBlocFiche(F, 'experience', F.experience.map(function (e, n) {
    return '<div class="csa-carte"><div class="csa-fiche-champs">' + c('experience.' + n + '.poste', 'Poste') + c('experience.' + n + '.entreprise', 'Entreprise') + c('experience.' + n + '.lieu', 'Lieu') +
      c('experience.' + n + '.debut', 'Début') + c('experience.' + n + '.fin', 'Fin') + c('experience.' + n + '.enCours', 'Poste toujours en cours', 'case') +
      c('experience.' + n + '.missions', 'Missions (une par ligne, toutes gardées)', 'multi') + '</div>' + _csaBoutonRetirer('experience', n) + '</div>';
  }).join('') + (F.experience.length ? '' : '<p class="small text-muted">Aucune expérience classée.</p>') +
    '<button type="button" class="btn btn-sm btn-outline-secondary" data-csa-ajouter="experience" style="border-radius:8px;"><i class="bi bi-plus-lg" aria-hidden="true"></i> Ajouter une expérience</button>', F.experience.length);
  h += _csaBlocFiche(F, 'formation', F.alertes.filter(function (a) { return a.cle === 'formation'; }).map(function (a) { return '<div class="csa-alerte"><i class="bi bi-exclamation-triangle" aria-hidden="true"></i> ' + _csaEchap(a.texte) + '</div>'; }).join('') +
    F.formation.map(function (f, n) {
      return '<div class="csa-carte"><div class="csa-fiche-champs">' + c('formation.' + n + '.intitule', 'Diplôme ou formation') + c('formation.' + n + '.annee', 'Année') + c('formation.' + n + '.etablissement', 'Établissement') + c('formation.' + n + '.lieu', 'Lieu') + '</div>' + _csaBoutonRetirer('formation', n) + '</div>';
    }).join('') + (F.formation.length ? '' : '<p class="small text-muted">Aucune formation classée.</p>') +
    '<button type="button" class="btn btn-sm btn-outline-secondary" data-csa-ajouter="formation" style="border-radius:8px;"><i class="bi bi-plus-lg" aria-hidden="true"></i> Ajouter une formation</button>', F.formation.length);
  [['competences', 'Une compétence par ligne'], ['qualites', 'Une qualité par ligne'], ['logiciels', 'Un logiciel ou un outil par ligne'], ['certifications', 'Une certification par ligne'],
    ['langues', 'Une langue par ligne'], ['loisirs', 'Un loisir par ligne'], ['engagements', 'Un engagement ou un vécu personnel par ligne']].forEach(function (r) {
    h += _csaBlocFiche(F, r[0], '<div class="csa-fiche-champs">' + c(r[0], r[1], 'multi') + '</div>', F[r[0]].length);
  });
  h += _csaBlocFiche(F, 'autres', _csaHtmlAutres(F), F.autres.length);
  return h;
}
function _csaRendreFichesZone() {
  var zone = document.getElementById('csaFiches');
  if (zone) { zone.innerHTML = _csaHtmlFiches(); }
  _csaMajCompteur();
}
function _csaRendreVerifier() {
  _csaConstruireFiches();
  app.innerHTML = '<div class="page-catalogue-contenu csa-parcours">' + barreEtapesModule(CSA_NAV_ETAPES, 3) +
    _htmlBandeRevoirModule('bi-pencil-square', 'csaVoirPresentation()') +
    '<div class="text-center"><h1><i class="bi bi-grid-3x3-gap"></i> Vérifiez vos fiches</h1>' +
    '<p class="sousTitre">Les mots sont les vôtres, rien n’est reformulé. Les cases marquées <span class="csa-devine">à vérifier</span> ont été lues d’après leur place dans votre CV : corrigez-les si besoin.</p></div>' +
    '<div class="csa-resume" id="csaCompteur"></div><div id="csaFiches"></div>' +
    '<div class="csa-alerte" id="csaErreur" hidden></div></div>' +
    '<div class="barre-navigation-fixe">' + barreNavigation('cv', 'cv-sans-assistant', 'Continuer', { onclickPrecedent: 'csaRetourClasser()', onclickSuivant: 'csaVersDocuments()' }) + '</div>';
  _csaRendreFichesZone();
  var zone = document.getElementById('csaFiches');
  zone.addEventListener('input', _csaSaisieFiches);
  zone.addEventListener('change', _csaChangementFiches);
  zone.addEventListener('click', _csaClicFiches);
  _csaSynchroniserHistorique();
  if (typeof trackEvenement === 'function') { trackEvenement('csa_verifier_affiche'); }
}

function _csaSaisieFiches(ev) {
  var t = ev.target, F = _csaEtat && _csaEtat.fiches;
  if (!F) { return; }
  if (t.dataset.csaAutre !== undefined) { F.autres[Number(t.dataset.csaAutre)] = t.value; _csaMajCompteur(); return; }
  var p = t.dataset.csaF;
  if (!p) { return; }
  if (t.type === 'checkbox') { _csaPoser(F, p, t.checked); return; }
  var enListe = t.dataset.csaListe && (/^(competences|qualites|logiciels|certifications|langues|loisirs|engagements)$/.test(p) || /missions$/.test(p));
  _csaPoser(F, p, enListe ? t.value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean) : t.value);
  // Une case corrigée n'est plus une supposition.
  var m = /^(experience|formation)\.(\d+)\.(\w+)$/.exec(p);
  if (m) { var item = F[m[1]][Number(m[2])]; if (item && item.devine) { delete item.devine[m[3]]; } } else { delete F.devine[p]; }
  var tag = document.querySelector('[data-csa-devine="' + p + '"]'); if (tag) { tag.remove(); }
  _csaMajCompteur();
}
function _csaMajCompteur() {
  var n = document.getElementById('csaCompteur');
  if (n && _csaEtat && _csaEtat.fiches) {
    var nb = csaCompter(_csaEtat.fiches);
    n.innerHTML = '<i class="bi bi-check2-circle" aria-hidden="true"></i> <strong>' + nb + '</strong> information' + (nb > 1 ? 's seront reprises' : ' sera reprise') + ' sur votre CV. Rien n’est reformulé ni retiré.';
  }
}
function _csaChangementFiches(ev) {
  var t = ev.target, F = _csaEtat && _csaEtat.fiches;
  if (!F || t.dataset.csaDeplacer === undefined || !t.value) { return; }
  var item = F.autres.splice(Number(t.dataset.csaDeplacer), 1)[0];
  if (t.value === 'permis') { F.identite.permis = (F.identite.permis ? F.identite.permis + ', ' : '') + item; }
  else if (t.value === 'accroche') { F.accroche = (F.accroche ? F.accroche + ' ' : '') + item; }
  else { F[t.value].push(item); }
  _csaConserverDefilement(_csaRendreFichesZone);
}
function _csaClicFiches(ev) {
  var F = _csaEtat && _csaEtat.fiches;
  if (!F) { return; }
  var r = ev.target.closest('[data-csa-retirer]');
  if (r) {
    var rp = r.dataset.csaRetirer.split(':');
    F[rp[0]].splice(Number(rp[1]), 1);
    _csaConserverDefilement(_csaRendreFichesZone);
    return;
  }
  var a = ev.target.closest('[data-csa-ajouter]');
  if (!a) { return; }
  if (a.dataset.csaAjouter === 'autres') { F.autres.push(''); } else if (a.dataset.csaAjouter === 'experience') { F.experience.push(csaExperienceVide()); } else { F.formation.push(csaFormationVide()); }
  _csaConserverDefilement(_csaRendreFichesZone);
}

/* ---------- Vers « Vos documents » : écriture dans la fiche du CV (même moteur que l'import), puis la page habituelle, sans assistant ---------- */
function csaVersDocuments() {
  var e = _csaEtat;
  if (!e || !e.fiches) { return; }
  var erreur = document.getElementById('csaErreur');
  try {
    // Le CV de cette voie repart d'une fiche propre (un CV déposé plus tôt ne se mélange pas) ; le style choisi dans « Vos documents » et la photo sont gardés.
    var reglagesAvant = dossier.pdfReglages, photoAvant = dossier.photo;
    viderContenuCVDossier();
    dossier.modeCreation = 'maj'; dossier.dernierDocumentPrepare = 'cv';
    csaAppliquerAuDossier(dossier, e.fiches);
    // L'identité vient d'être vérifiée à l'écran précédent : « Vos documents » ne la redemande pas.
    dossier.identiteEnregistree = true;
    dossier.modeFidele = true;
    // « Tout apparaît » : toutes les missions de chaque expérience et toutes les informations complémentaires sont affichées d'emblée (la personne peut ensuite en masquer).
    var plusLongue = (dossier.experiences || []).reduce(function (m, x) { return Math.max(m, String(x.missions || '').split('\n').filter(Boolean).length); }, 0);
    var reglages = Object.assign({}, reglagesAvant || {});
    reglages.missionsGlobal = Math.max(10, plusLongue);
    reglages.choixMq = Object.assign({}, reglages.choixMq || {}, { infosCompAffichees: (dossier.informationsNonClassees || []).slice() });
    // Les titres de rubriques du CV d'origine (« Savoir-etre », « Ma passion »...) deviennent les intitules du CV, modifiables ensuite dans « Vos documents ».
    var defauts = {}; Object.keys(CSA_NOM_ORIGINE_RUBRIQUE).forEach(function (r) { var nom = CSA_NOM_ORIGINE_RUBRIQUE[r]; defauts[nom] = (typeof _mepLibelleDefaut === 'function') ? _mepLibelleDefaut(nom) : nom; });
    var intitules = csaIntitulesDOrigine(e.fiches.titres, defauts);
    if (Object.keys(intitules).length) { reglages.choixMq.intitulesPerso = Object.assign({}, reglages.choixMq.intitulesPerso || {}, intitules); }
    dossier.pdfReglages = reglages;
    if (photoAvant) { dossier.photo = photoAvant; }
  } catch (err) {
    if (erreur) { erreur.hidden = false; erreur.textContent = 'Votre CV n’a pas pu être préparé. Vérifiez vos fiches et réessayez ; si cela continue, signalez-le.'; }
    if (typeof trackEvenement === 'function') { trackEvenement('csa_ecriture_erreur'); }
    return;
  }
  if (typeof trackEvenement === 'function') { trackEvenement('csa_vers_documents'); }
  naviguerVers('resultats');
}
