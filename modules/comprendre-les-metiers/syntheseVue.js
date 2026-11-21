/* ============================================================
   Module « Explorer les métiers » : VUE « Ma synthèse » (tâche A4 de docs/CHANTIER_MA_SYNTHESE_EXPLORER_LES_METIERS_2026-11-18.md).
   Les trois passages sur une seule page. Maquette V10 validée. Charge après synthese.js (gestes et bouton « Retenir »).

   Rien n'est calculé ici qui ne le soit déjà : les métiers du passage 2 viennent de _cmaListeMetiers, ceux du passage 3 de cmlMetiersPourLettres,
   les choix du passage 2 de _cmaBlocChoix, les barres des lettres de _cmqvBarresHTML (avec le classement visuel de syntheseLogique.js).
   Les blocs suivants (recoupement A5, ce que les tests ne disent pas A6, territoire A7, demande à l'assistant A9...) s'ajoutent à la suite de cette vue.
   ============================================================ */

var SYN_NB_METIERS_AFFICHES = { 2: 5, 3: 6 };

function _synPastilleEtat(fait, texteFait) {
  return '<span class="cml-etat ' + (fait ? 'fait' : 'afaire') + '">' + (fait ? (texteFait || 'Fait') : 'Pas encore fait') + '</span>';
}
// Un passage non fait : une invitation, jamais une obligation. Le bouton mène au chemin correspondant.
function _synInvite(texte, bouton, chemin) {
  return '<div class="cml-invite"><i class="bi bi-lightbulb" aria-hidden="true"></i><div><p class="mb-1">' + texte + '</p>' +
    '<button type="button" class="btn btn-primary" data-cml="synChemin" data-chemin="' + chemin + '">' + bouton + '</button></div></div>';
}
cmvEnregistrerAction('synChemin', function (el, etat) { cmvEntrerDansChemin(el.getAttribute('data-chemin')); });

// Ligne « Mon métier retenu » avec « Revoir ce métier » (la fiche, puis le retour ramène ici) et « Retirer mon choix ».
function _synLigneRetenu(passage) {
  var r = synRetenu(passage);
  if (!r) { return ''; }
  return '<div class="cml-retenu-ligne"><i class="bi bi-bookmark-check" aria-hidden="true"></i><span>Mon métier retenu : <b>' + cmvE(r.nom) + '</b></span>' +
    '<button type="button" class="btn btn-outline-primary btn-sm" data-cml="fiche" data-nom="' + cmvE(r.nom) + '"><i class="bi bi-arrow-right-circle" aria-hidden="true"></i> Revoir ce métier</button>' +
    '<button type="button" class="btn btn-outline-secondary btn-sm" data-cml="synRetirer" data-passage="' + passage + '">Retirer mon choix</button></div>';
}
cmvEnregistrerAction('synRetirer', function (el) {
  var p = parseInt(el.getAttribute('data-passage'), 10);
  if (SYN_PASSAGES.indexOf(p) === -1) { return false; }
  synEtat()[_synCle(p)] = null;
  return true;
});

// Une ligne de métier proposé, avec son bouton « Retenir ».
function _synLigneMetier(passage, nom, rome, pastilles, details) {
  return '<div class="cml-ligne-m"><div class="nom">' + cmvE(nom) + '</div>' + (pastilles || '') + (details || '') + synBoutonRetenir(passage, nom, rome) + '</div>';
}

function _synBlocPassage1(etat) {
  var r = synRetenu(1), h = '<div class="cml-bloc"><h2><i class="bi bi-search" aria-hidden="true"></i> Passage 1 : le métier que j’ai retenu ' + _synPastilleEtat(!!r, 'Retenu') + '</h2>';
  if (!r) {
    return h + _synInvite('Ce passage n’est pas encore fait. Le faire rend votre synthèse plus précise : le métier retenu apporte les compétences qu’il demande. Dans « Chercher un métier », chaque métier proposé a un bouton « Retenir pour ma synthèse » : un seul peut être retenu.', 'Faire ce passage', 'metier') + '</div>';
  }
  var fiche = (typeof metierParNom === 'function') ? metierParNom(r.nom) : null;
  var niveau = fiche ? cmlNiveauDeMetier(fiche) : null;
  h += '<div class="cml-fiche-retenue"><div class="nom">' + cmvE(r.nom) + '</div><ul>' +
    (fiche && fiche.secteur ? '<li><i class="bi bi-diagram-3" aria-hidden="true"></i> Secteur : ' + cmvE(fiche.secteur) + '</li>' : '') +
    (fiche ? '<li><i class="bi bi-mortarboard" aria-hidden="true"></i> Niveau d’accès : ' + cmlLibelleNiveauAcces(niveau) + '</li>' : '') + '</ul></div>' +
    _synLigneRetenu(1) +
    '<p class="cml-note mb-0">Pour en retenir un autre, retournez dans « Chercher un métier » : vos choix y sont gardés.</p>';
  return h + '</div>';
}

// Filtre « formation que je suis prêt ou prête à faire » (A4b, maquette V7) : UNE seule brique pour les passages 2 et 3.
function _synBlocFiltreFormation(passage, caches) {
  var s = synEtat(), choix = synFormationValide(s.formation), ouvert = !!s.voirMasques[passage];
  var h = '<div class="cml-filtre"><h3 class="h6"><i class="bi bi-mortarboard" aria-hidden="true"></i> Les métiers que je suis prêt ou prête à préparer</h3>' +
    '<p class="cml-note mb-1">Vous choisissez la formation que vous pourriez faire. Ce réglage ne fait que cacher des métiers, il ne change jamais l’ordre. Rien n’est caché tant que vous ne le décidez pas, et deux sortes de métiers restent toujours visibles : celui que vous avez retenu, et ceux dont le niveau n’est pas précisé.</p>' +
    '<div class="cml-aff-chips" role="group" aria-label="Formation que je suis prêt ou prête à faire">' + SYN_FORMATIONS.map(function (f) { return _synChip('synFormation', f[0], f[1], choix === f[0]); }).join('') + '</div>';
  if (caches.length) {
    h += '<p class="cml-note mb-1 mt-2"><b>' + caches.length + ' métier' + (caches.length > 1 ? 's sont cachés' : ' est caché') + '</b> : ' + (caches.length > 1 ? 'ils demandent' : 'il demande') + ' plus de formation que vous ne l’avez choisi. ' +
      '<button type="button" class="btn btn-outline-primary btn-sm" data-cml="synVoirMasques" data-passage="' + passage + '" aria-expanded="' + ouvert + '">' + (ouvert ? 'Cacher ces métiers' : 'Voir ces métiers') + '</button></p>';
    if (ouvert) {
      h += '<ul class="mb-1">' + caches.map(function (x) { return '<li>' + cmvE(x.nom) + ' <span class="cml-note">(' + cmlLibelleNiveauAcces(x.niveau) + ')</span></li>'; }).join('') + '</ul>' +
        '<p class="cml-note mb-0">Ces métiers restent possibles : le chemin passe par une formation, et la lecture en parle. Aucun n’est écarté définitivement.</p>';
    }
  }
  return h + '</div>';
}

function _synBlocPassage2(etat) {
  var N = (typeof _cmaNombreChoix === 'function') ? _cmaNombreChoix(etat) : 0;
  var h = '<div class="cml-bloc"><h2><i class="bi bi-list-check" aria-hidden="true"></i> Passage 2 : ce que j’aime faire ' + _synPastilleEtat(N > 0) + '</h2>';
  if (N === 0) {
    return h + _synInvite('Ce passage n’est pas encore fait. Le faire rend votre synthèse plus précise : vos envies donnent le lieu, ce qui serait facile ou difficile, et des métiers très proches de vos choix. Rien n’est obligatoire.', 'Choisir mes envies', 'actions') + '</div>';
  }
  // Filtre de formation (A4b) : les métiers cachés ne sont jamais retirés de l'ordre, seulement non montrés.
  var ap2 = synAppliquerFormation(_cmaListeMetiers(etat).slice(0, 300).map(function (m) { return { nom: m.nom, niveau: cmlNiveauDeMetier(m), m: m }; }), synEtat().formation, SYN_NB_METIERS_AFFICHES[2], (synRetenu(2) || {}).nom);
  var liste = ap2.visibles.map(function (x) { return x.m; });
  h += _cmaBlocChoix(etat) + _synLigneRetenu(2) + _synBlocFiltreFormation(2, ap2.caches) +
    '<p class="cml-note mb-1 mt-2">Les métiers qui retrouvent le plus de vos choix. Retenez celui qui vous attire le plus (un seul) :</p>' +
    liste.map(function (m) {
      var pct = Math.max(0, Math.min(100, Math.round(m.score || 0)));
      return _synLigneMetier(2, m.nom, m.rome, '<span class="cml-pill">Retrouve ' + pct + ' % de mes choix</span> ', '<span class="cml-pill">Niveau d’accès : ' + cmlLibelleNiveauAcces(cmlNiveauDeMetier(m)) + '</span>');
    }).join('') +
    '<div style="margin-top:.6rem"><button type="button" class="btn btn-outline-primary" data-cml="synChemin" data-chemin="actions"><i class="bi bi-list-ul" aria-hidden="true"></i> Voir tous les métiers proposés</button></div>';
  return h + '</div>';
}

// Le calcul du passage 3 (liste honnête, départage) : UNE seule fonction pour la page et pour la demande à l'assistant (jamais deux calculs).
function _synCalculP3(c) {
  var liste = cmlMetiersPourLettres(c.lettresPourMetiers);
  // Honnêteté sur les listes courtes (A1c) : peu de métiers ont les deux premières lettres → on le dit, et on ne complète pas par des métiers qui n'en ont qu'une.
  var hon = synListeHonnete(liste, c.lettresPourMetiers, SYN_NB_METIERS_AFFICHES[3]);
  // Départage (A1b, A1d) : les métiers en lice sont ceux qui ont vos lettres exactes ; les réponses de la personne les classent, l'égalité est montrée ensemble.
  var aff = synEtat().aff;
  var entrees = hon.proches.map(function (x) {
    return { nom: x.metier.nom, rome: x.metier.rome, lettres: x.lettres, secteur: x.metier.secteur, niveau: x.niveau, tags: (typeof CONDITIONS_ROME !== 'undefined' && CONDITIONS_ROME.parCode[x.metier.rome]) || [] };
  });
  var classee = synClasserDepartage(entrees, hon.lettres, aff.reponses, aff.secteurs);
  return { hon: hon, aff: aff, entrees: entrees, classee: classee };
}

function _synBlocPassage3(etat) {
  var r = etat.q && etat.q.resultat;
  var h = '<div class="cml-bloc"><h2><i class="bi bi-hexagon" aria-hidden="true"></i> Passage 3 : mes six lettres ' + _synPastilleEtat(!!r) + '</h2>';
  if (!r) {
    return h + _synInvite('Ce passage n’est pas encore fait. Le faire rend votre synthèse plus précise : vos six lettres montrent ce qui vous attire de fond. Il n’y a ni bonne ni mauvaise réponse, et aucune réponse n’est obligatoire.', 'Voir le questionnaire', 'q') + '</div>';
  }
  var c = r.calcul;
  // Trop de lignes laissées vides (consigne 508) : aucune lettre n'est montrée, ni ici ni dans le résultat.
  if (c.peuDeLignes) {
    var niv = cmlInfoNiveauQuestionnaire(c.nbReponses, c.nbLignes);
    return h + '<p class="cml-note mb-2">Questionnaire passé le ' + cmvE(r.date) + '.</p>' + cmvEncart('bi-info-circle', 'Trop de lignes sont restées vides pour montrer des lettres' + (niv ? ' (vous avez répondu à ' + cmvNombre(niv.nbReponses) + ' lignes sur ' + cmvNombre(niv.nbLignes) + ', il en faut au moins ' + cmvNombre(niv.minimum) + ')' : '') + '. Vous pouvez refaire le questionnaire quand vous le souhaitez.', true) +
      '<button type="button" class="btn btn-outline-primary" data-cml="aller" data-vue="resultat">Voir pourquoi</button></div>';
  }
  var classes = synClasserLettres(c);
  h += '<p class="cml-note mb-2">Questionnaire passé le ' + cmvE(r.date) + '. Les six types, en pourcentage de vos réponses.</p>' +
    '<div role="group" aria-label="Vos six lettres">' + _cmqvBarresHTML(c, classes) + '</div>';
  if (c.etat === 'peu_reponses') {
    return h + cmvEncart('bi-info-circle', CMQ_TEXTES.peuReponses, true) +
      '<button type="button" class="btn btn-outline-primary" data-cml="aller" data-vue="resultat">Revoir mon résultat en détail</button></div>';
  }
  var moyen = CML_LETTRES.some(function (l) { return classes[l] === 'moyen'; });
  h += '<p class="cml-note">Les deux premières lettres ressortent le plus' + (moyen ? ', la troisième se démarque un peu' : '') + '. Un pourcentage dit seulement la place d’un type dans vos réponses : ce n’est pas une note.</p>' + _synLigneRetenu(3);
  var P3 = _synCalculP3(c), hon = P3.hon, aff = P3.aff, entrees = P3.entrees, classee = P3.classee;
  var lettresDites = hon.lettres.map(function (l) { return CMV_NOMS_LETTRES[l] || l; }).join(' et ');
  var vosLettres = hon.lettres.length > 1 ? 'vos deux premières lettres dans cet ordre' : 'votre lettre en premier';
  var ap3 = synAppliquerFormation(classee, synEtat().formation, classee.length, (synRetenu(3) || {}).nom);   // A4b : on cache AVANT de grouper, pour ne jamais couper un groupe à égalité
  var groupes = synGroupesEgalite(ap3.visibles);
  if (hon.courte) {
    h += '<p class="cml-note mb-1 mt-2">' + (hon.aucun
      ? '<b>Aucun métier</b> n’a ' + vosLettres + ' (' + lettresDites + '). Cela ne dit rien sur vous : cette association est simplement absente de la base des métiers.'
      : '<b>Seulement ' + hon.nb + ' métier' + (hon.nb > 1 ? 's' : '') + '</b> ' + (hon.nb > 1 ? 'ont' : 'a') + ' ' + vosLettres + ' (' + lettresDites + ') : la liste est courte, et elle n’est pas complétée par des métiers plus éloignés.') +
      (hon.aucun ? '' : ' Retenez celui qui vous attire le plus (un seul) :') + '</p>';
  } else {
    h += '<p class="cml-note mb-1 mt-2"><b>' + hon.nb + ' métiers</b> ont ' + vosLettres + ' (' + lettresDites + '). Voici les premiers' + (synTexteReponsesDepartage(aff.reponses, aff.secteurs) ? ', dans l’ordre d’après vos réponses' : ', à égalité tant que vous n’avez rien précisé') + '. Retenez celui qui vous attire le plus (un seul) :</p>';
  }
  h += _synBlocFiltreFormation(3, ap3.caches);
  h += groupes.montres.map(function (g) {
    var lignes = g.items.map(_synLigneMetierDepartage).join('');
    if (g.tous.length < 2) { return lignes; }
    return '<div class="cml-egalite"><p class="cml-note mb-1"><i class="bi bi-distribute-vertical" aria-hidden="true"></i> <b>À égalité : ' + g.tous.length + ' métiers.</b> Aucun n’est placé avant l’autre ; ils sont écrits dans l’ordre alphabétique, sans aucune valeur de classement.' +
      (g.tous.length > g.items.length ? ' Les autres sont dans la liste complète plus bas.' : '') + '</p>' + lignes + '</div>';
  }).join('');
  h += _synBlocAffiner(entrees, aff);
  h += '<details class="cml-depli"><summary>Pourquoi ces métiers, et dans cet ordre ?</summary><div class="corps">' +
    '<p>France Travail donne à chaque métier une ou deux lettres. Un métier est retenu quand <b>ses lettres retombent sur les vôtres, dans le même ordre</b> : sa première lettre compte plus que la seconde, et vos premières lettres comptent plus que les suivantes.</p>' +
    '<p>Pour départager les métiers qui ont les mêmes lettres, l’application regarde, dans cet ordre :</p><ol><li>les lettres exactes ;</li><li>vos réponses aux questions « Affiner mes métiers » : chaque réponse que le métier retrouve compte pour un ;</li><li>si tout est égal, les métiers sont montrés ensemble, « à égalité », sans qu’aucun soit placé avant l’autre.</li></ol>' +
    '<p><b>Le niveau d’études ne joue jamais dans cet ordre.</b> Un métier qui demande plus d’études peut arriver en premier si vos lettres et vos réponses y mènent. L’écart de niveau est regardé ensuite, dans la lecture.</p>' +
    '<p class="mb-0">Les lettres et les conditions de travail des métiers sont approximatives : un métier peut s’exercer autrement selon l’employeur.</p></div></details>' +
    (classee.length > 1 ? '<details class="cml-depli"><summary>Voir les ' + classee.length + ' métiers qui ont mes lettres, dans l’ordre actuel</summary><div class="corps"><ol class="mb-0">' +
      classee.map(function (x) { return '<li>' + cmvE(x.nom) + ' <span class="cml-note">(' + cmvE(x.secteur) + (x.pts ? ', ' + x.pts + ' réponse' + (x.pts > 1 ? 's' : '') + ' retrouvée' + (x.pts > 1 ? 's' : '') : '') + ')</span></li>'; }).join('') + '</ol></div></details>' : '') +
    '<div style="margin-top:.6rem"><button type="button" class="btn btn-outline-primary" data-cml="aller" data-vue="resultat"><i class="bi bi-hexagon" aria-hidden="true"></i> Revoir mon résultat en détail</button></div>';
  return h + '</div>';
}

// Une ligne de métier du passage 3 : ses lettres, le niveau d'accès, et pour chaque réponse retrouvée une raison écrite au ton prudent.
function _synLigneMetierDepartage(x) {
  var raisons = x.raisons.length ? '<ul class="cml-raisons">' + x.raisons.map(function (r) { return '<li><i class="bi bi-check2" aria-hidden="true"></i>' + cmvE(r) + '</li>'; }).join('') + '</ul>' : '';
  return _synLigneMetier(3, x.nom, x.rome, '<span class="cml-let">' + cmvLettres(x.lettres) + '</span>', '<span class="cml-pill">Niveau d’accès : ' + cmlLibelleNiveauAcces(x.niveau) + '</span>' + raisons);
}

// « Affiner mes métiers » : seulement les questions qui séparent réellement les métiers en lice ; aucun nombre de métiers ; « Peu importe » laisse la question de côté.
function _synBlocAffiner(entrees, aff) {
  if (entrees.length < 2) { return ''; }
  var num = 0, h = '';
  SYN_QUESTIONS_DEPARTAGE.forEach(function (q) {
    var opts = synOptionsProposees(q, entrees, aff.reponses[q.cle]);
    if (!opts.length) { return; }
    num++;
    var sans = !aff.reponses[q.cle];
    h += '<p class="cml-aff-q">' + num + '. ' + q.titre + '</p><div class="cml-aff-chips" role="group" aria-label="' + cmvE(q.titre) + '">' +
      opts.map(function (o) { var on = aff.reponses[q.cle] === o.id; return '<button type="button" class="cml-jt' + (on ? ' is-actif' : '') + '" data-cml="synAff" data-cle="' + q.cle + '" data-val="' + o.id + '" aria-pressed="' + on + '"><i class="bi bi-check-lg" aria-hidden="true"></i> ' + cmvE(o.lib) + '</button>'; }).join('') +
      '<button type="button" class="cml-jt' + (sans ? ' is-actif' : '') + '" data-cml="synAff" data-cle="' + q.cle + '" data-val="peu" aria-pressed="' + sans + '"><i class="bi bi-check-lg" aria-hidden="true"></i> Peu importe</button></div>';
  });
  var secteurs = synSecteursEnLice(entrees);
  if (secteurs.length > 1) {
    num++;
    h += '<p class="cml-aff-q">' + num + '. Un ou plusieurs secteurs qui vous attirent (trois au plus)</p><div class="cml-aff-chips" role="group" aria-label="Secteurs">' +
      '<button type="button" class="cml-jt' + (aff.secteurs.length ? '' : ' is-actif') + '" data-cml="synAffSect" data-nom="" aria-pressed="' + (!aff.secteurs.length) + '"><i class="bi bi-check-lg" aria-hidden="true"></i> Peu importe</button>' +
      secteurs.map(function (s) { var on = aff.secteurs.indexOf(s) !== -1; return '<button type="button" class="cml-jt' + (on ? ' is-actif' : '') + '" data-cml="synAffSect" data-nom="' + cmvE(s) + '" aria-pressed="' + on + '"><i class="bi bi-check-lg" aria-hidden="true"></i> ' + cmvE(s) + '</button>'; }).join('') + '</div>';
  }
  if (!h) { return ''; }
  var rien = !synTexteReponsesDepartage(aff.reponses, aff.secteurs);
  return '<div class="cml-affiner"><h3><i class="bi bi-sliders" aria-hidden="true"></i> Affiner mes métiers</h3>' +
    '<p class="cml-note mb-1">Quelques questions pour départager les métiers dont les lettres sont très proches des vôtres. Elles dépendent de vos résultats. Il n’y a ni bonne ni mauvaise réponse, aucune réponse n’est obligatoire, et « Peu importe » laisse la question de côté.</p>' + h +
    '<div style="margin-top:.5rem"><button type="button" class="btn btn-outline-primary btn-sm" data-cml="synAffRaz"' + (rien ? ' disabled' : '') + '>Effacer mes réponses</button></div></div>';
}

/* ---------- Bloc « Ma synthèse par recoupement » (tâche A5) : le code compte et rapproche, aucun assistant ---------- */
// Seuls les métiers les mieux placés de chaque passage sont comparés (la liste du passage 3 compte des centaines de métiers).
var SYN_TOP = { p2: 30, p3: 60 };
var SYN_NOMS_CLES = { activites: 'avec qui ou quoi', actions: 'ce que je fais', environnement: 'où' };

function _synListesPassages(etat) {
  var r1 = synRetenu(1), r2 = synRetenu(2), r3 = synRetenu(3);
  var N = (typeof _cmaNombreChoix === 'function') ? _cmaNombreChoix(etat) : 0;
  var l2 = N > 0 ? _cmaListeMetiers(etat).slice(0, SYN_TOP.p2).map(function (m) { return { nom: m.nom, score: Math.round(m.score || 0) }; }) : [];
  var q = etat.q && etat.q.resultat;
  var l3 = (q && q.calcul.etat !== 'peu_reponses') ? cmlMetiersPourLettres(q.calcul.lettresPourMetiers).slice(0, SYN_TOP.p3).map(function (x) { return { nom: x.metier.nom }; }) : [];
  var dans = function (liste, r) { return liste.some(function (x) { return synNormaliser(x.nom) === synNormaliser(r.nom); }); };
  if (N > 0 && r2 && !dans(l2, r2)) { l2.push({ nom: r2.nom, score: null }); }
  if (q && r3 && !dans(l3, r3)) { l3.push({ nom: r3.nom }); }
  return { p1: r1 ? [{ nom: r1.nom }] : [], p2: l2, p3: l3, fait: { p1: !!r1, p2: N > 0, p3: !!q } };
}

function _synBlocRecoupement(etat) {
  var n = synNombreSources(etat);
  if (n < 1) { return ''; }
  var h = '<div class="cml-bloc cml-bloc-synthese"><h2><i class="bi bi-intersect" aria-hidden="true"></i> Ma synthèse par recoupement <span class="cml-etat fait">Calculée par l’application</span></h2>' +
    '<p class="cml-note">Aucun assistant ici : l’application compte et rapproche ce que vous avez fait. Ce n’est pas une note sur vous.</p>';
  if (n < 2) {
    return h + '<p class="mb-0">Un seul passage est fait : il n’y a pas encore de recoupement à montrer. Chaque passage ajouté rend cette synthèse plus riche.</p></div>';
  }
  var L = _synListesPassages(etat);
  var noms = function (liste) { return liste.map(function (x) { return x.nom; }); };
  var reviennent = synMetiersQuiReviennent({ p1: noms(L.p1), p2: noms(L.p2), p3: noms(L.p3) });
  var trouve = function (liste, nom) { var k = synNormaliser(nom); return liste.filter(function (x) { return synNormaliser(x.nom) === k; })[0]; };
  var est = function (r, nom) { return !!(r && synNormaliser(r.nom) === synNormaliser(nom)); };
  h += '<h3 class="h6">Les métiers qui reviennent</h3>';
  if (!reviennent.length) {
    h += '<p>Aucun métier ne revient dans plusieurs passages parmi ceux qui ressortent le plus. Ce n’est pas un manque : vos passages éclairent des directions différentes, et c’est ce que la lecture pourra regarder avec vous.</p>';
  } else {
    h += '<div class="table-responsive"><table class="cml-table-croisee"><thead><tr><th scope="col">Métier</th><th scope="col">Passage 1 : retenu</th><th scope="col">Passage 2 : mes choix</th><th scope="col">Passage 3 : mes lettres</th><th scope="col">Revient dans</th></tr></thead><tbody>' +
      reviennent.map(function (x) {
        var c1 = trouve(L.p1, x.nom) ? 'Retenu' : (L.fait.p1 ? 'Non' : 'Pas fait');
        var t2 = trouve(L.p2, x.nom), c2 = t2 ? (t2.score === null ? 'Retenu' : t2.score + ' %') + (t2.score !== null && est(synRetenu(2), x.nom) ? ' (retenu)' : '') : (L.fait.p2 ? 'Non' : 'Pas fait');
        var c3 = trouve(L.p3, x.nom) ? 'Oui' + (est(synRetenu(3), x.nom) ? ' (retenu)' : '') : (L.fait.p3 ? 'Non' : 'Pas fait');
        return '<tr><th scope="row">' + cmvE(x.nom) + '</th><td>' + c1 + '</td><td>' + c2 + '</td><td>' + c3 + '</td><td><b>' + x.passages.length + ' passage' + (x.passages.length > 1 ? 's' : '') + ' sur ' + n + '</b></td></tr>';
      }).join('') + '</tbody></table></div>' +
      '<p class="cml-note mt-1">Comment lire : « Oui » ou « Retenu » veut dire que le métier est sorti (ou retenu) dans ce passage, « Non » qu’il n’est pas sorti. Passage 2 : le pourcentage de vos choix qu’il retrouve. Passage 3 : le métier partage vos lettres. Seuls les métiers les mieux placés de chaque passage sont comparés.</p>';
  }
  // Quatre petites lectures.
  var q = etat.q && etat.q.resultat, code = q && q.calcul.code ? q.calcul.code : null;
  var phrases = { memes: 'elles se recouvrent.', partie: 'elles se recouvrent en partie.', differentes: 'elles diffèrent des vôtres.' };
  // Un même métier retenu à plusieurs passages n'est écrit qu'une fois.
  var retenus = [];
  SYN_PASSAGES.forEach(function (p) {
    var r = synRetenu(p); if (!r) { return; }
    var deja = retenus.filter(function (x) { return synNormaliser(x.nom) === synNormaliser(r.nom); })[0];
    if (deja) { deja.passages.push(p); } else { retenus.push({ nom: r.nom, rome: r.rome, passages: [p] }); }
  });
  var motPassages = function (r) { return r.passages.length > 1 ? 'passages ' + r.passages.join(' et ') : 'passage ' + r.passages[0]; };
  var lignesLettres = [];
  if (q && code) {
    retenus.forEach(function (r) {
      var f = typeof metierParNom === 'function' ? metierParNom(r.nom) : null;
      var lettres = (f && typeof LETTRES_RIASEC_ROME !== 'undefined' && LETTRES_RIASEC_ROME[r.rome || f.rome]) || '';
      var v = synRecouvrementLettres(code, lettres);
      if (v !== 'inconnu') { lignesLettres.push('« ' + cmvE(r.nom) + ' » a les lettres ' + lettres + ' (' + motPassages(r) + ') : ' + phrases[v]); }
    });
  }
  var texteLettres = lignesLettres.length
    ? 'Vos lettres de tête sont ' + code.join(', ') + '. ' + lignesLettres.map(function (t) { return t; }).join(' ')
    : (q ? 'Retenez un métier pour comparer ses lettres aux vôtres.' : 'Passez le questionnaire pour comparer vos lettres à celles d’un métier retenu.');
  var N = (typeof _cmaNombreChoix === 'function') ? _cmaNombreChoix(etat) : 0;
  var ajoute = [];
  if (L.fait.p2) {
    var apports = [];
    if (etat.choix.environnement.length) { apports.push('le <b>lieu</b>'); }
    if (etat.choix.faciles.length) { apports.push('ce qui serait <b>facile</b>'); }
    if (etat.choix.conditions.length) { apports.push('ce qui serait <b>difficile</b>'); }
    ajoute.push('Vos envies ajoutent ' + (apports.length ? apports.join(', ') : 'ce qui vous attire') + '.');
  }
  if (L.fait.p3) { ajoute.push('Les lettres donnent une idée de vos <b>préférences de fond</b>.'); }
  if (L.fait.p1) { ajoute.push('Le métier retenu ajoute les <b>compétences demandées</b>.'); }
  var diffs = [];
  if (N > 0) {
    var choixMoteur = _cmaChoixPourMoteur(etat);
    retenus.forEach(function (r) {
      var f = typeof metierParNom === 'function' ? metierParNom(r.nom) : null; if (!f) { return; }
      var absents = synChoixNonRetrouves(choixMoteur, f);
      diffs.push(absents.length
        ? 'Pour « ' + cmvE(r.nom) + ' », ces choix ne se retrouvent pas dans le métier : ' + absents.slice(0, 4).map(function (a) { return cmvE(_cmaLibelle(a.cle, a.id)); }).join(', ') + (absents.length > 4 ? ' et ' + (absents.length - 4) + ' autre' + (absents.length - 4 > 1 ? 's' : '') : '') + '.'
        : 'Tous vos choix se retrouvent dans « ' + cmvE(r.nom) + ' ».');
    });
  }
  h += '<div class="cml-quatre mt-2">' +
    '<div class="cml-lecture-mini"><b>Lettres et métier retenu</b><p>' + texteLettres + '</p></div>' +
    '<div class="cml-lecture-mini"><b>Ce que chaque passage ajoute</b><p>' + ajoute.join(' ') + '</p></div>' +
    '<div class="cml-lecture-mini"><b>Ce qui diffère</b><p>' + (diffs.length ? diffs.join(' ') : (N > 0 ? 'Retenez un métier pour voir ce qui ne se recoupe pas avec vos choix.' : 'Rien à comparer pour l’instant.')) + '</p></div></div></div>';
  return h;
}

/* ---------- Ce que les tests ne disent pas (tâche A6) : niveau d'études, accompagnement, compléments, texte libre. Rien n'est obligatoire. ---------- */
function _synPastilleChips(titre, boutons) {
  return '<p class="cml-aff-q">' + titre + '</p><div class="cml-aff-chips" role="group" aria-label="' + cmvE(titre) + '">' + boutons + '</div>';
}
function _synChip(action, val, libelle, actif) {
  return '<button type="button" class="cml-jt' + (actif ? ' is-actif' : '') + '" data-cml="' + action + '" data-val="' + cmvE(String(val)) + '" aria-pressed="' + !!actif + '"><i class="bi bi-check-lg" aria-hidden="true"></i> ' + cmvE(libelle) + '</button>';
}
function _synBlocTests(etat) {
  var s = synEtat();
  var rempli = !!(s.niveau || (s.suivi && s.suivi.length) || (s.complements && s.complements.length) || (s.libre && s.libre.trim()));
  return '<div class="cml-bloc"><h2><i class="bi bi-pencil-square" aria-hidden="true"></i> Ce que les tests ne disent pas ' + _synPastilleEtat(rempli, 'Rempli') + '</h2>' +
    '<p class="cml-note">Tout est à compléter si vous le souhaitez, rien n’est obligatoire. Cliquez ce qui vous correspond, écrivez librement ce qui vous semble important.</p>' +
    _synPastilleChips('Mon niveau d’études', SYN_NIVEAUX.map(function (n) { return _synChip('synNiveau', n[0], n[1], s.niveau === n[0]); }).join('')) +
    _synPastilleChips('Je suis accompagné ou accompagnée par un professionnel (conseiller France Travail ou autre)', SYN_ACCOMPAGNEMENTS.map(function (o) { return _synChip('synSuivi', o[0], o[1], (s.suivi || []).indexOf(o[0]) !== -1); }).join('')) +
    _synPastilleChips('Ce qui compte pour moi en ce moment', SYN_COMPLEMENTS.map(function (o) { return _synChip('synComp', o[0], o[1], (s.complements || []).indexOf(o[0]) !== -1); }).join('')) +
    '<label class="cml-aff-q" for="synLibre" style="display:block">Dans mes mots</label>' +
    '<textarea id="synLibre" class="form-control" rows="3" maxlength="' + SYN_PLAFONDS.libre + '" placeholder="Écrivez ici ce qui vous semble important et que les tests n’ont pas pu dire">' + cmvE(s.libre || '') + '</textarea>' +
    cmvEncart('bi-shield-exclamation', 'Ce texte fera partie de la demande que vous copierez pour l’assistant en ligne. N’écrivez ni nom, ni adresse, ni information de santé : vous pourrez relire la demande avant de la copier. Ce texte n’est pas gardé dans la disquette.', true) +
    '</div>';
}

/* ---------- Chez moi : mes pistes et ce qui recrute (tâche A7). Seulement ce que l'enquête du département permet de dire. ---------- */
function _synNomsPistes() {
  return [synRetenu(1), synRetenu(2), synRetenu(3)].filter(function (r) { return !!r; }).map(function (r) { return r.nom; });
}
function _synFicheId(nom) { var f = (typeof metierParNom === 'function') ? metierParNom(nom) : null; return f ? f.id : null; }
function _synBoutonsEmplois() {
  return '<div class="boutons-ligne" style="margin-top:.6rem"><button type="button" class="btn btn-outline-primary" data-cml="synChemin" data-chemin="recrute"><i class="bi bi-briefcase" aria-hidden="true"></i> Voir les emplois en demande chez moi</button></div>';
}
// Le contenu change quand les chiffres de l'enquête arrivent : il est dessiné à part (zone #synZoneChezMoi) et redessiné seul.
function _synChezMoiContenu() {
  if (typeof _cmrDep !== 'function') { return ''; }
  var dep = _cmrDep(), noms = _synNomsPistes();
  if (!_cmrDepCouvert(dep)) {
    return '<p class="cml-note">Où cherchez-vous ? Les chiffres des employeurs existent pour deux départements.</p><div class="cml-aff-chips">' +
      '<button type="button" class="btn btn-outline-primary" data-cml="recruteDep" data-dep="24">Dordogne (24)</button><button type="button" class="btn btn-outline-primary" data-cml="recruteDep" data-dep="87">Haute-Vienne (87)</button></div>' + _synBoutonsEmplois();
  }
  var c = _cmrChiffres(dep), lieu = _cmrNomDep(dep);
  var change = '<div class="boutons-ligne" style="margin-top:.4rem"><button type="button" class="btn btn-outline-secondary btn-sm" data-cml="recruteChanger"><i class="bi bi-geo-alt" aria-hidden="true"></i> Changer de département</button></div>';
  if (!noms.length) { return '<p class="mb-1">Retenez un métier à l’un des passages pour voir si les employeurs de ' + cmvE(lieu) + ' en citent.</p>' + _synBoutonsEmplois() + change; }
  if (c.etat === 'attente') { return '<p class="cml-note" role="status">Chargement des chiffres des employeurs…</p>'; }
  if (c.etat !== 'ok') { return '<p class="mb-1">Les chiffres des employeurs ne sont pas disponibles pour l’instant. Rien n’est supposé à leur place.</p>' + _synBoutonsEmplois() + change; }
  var trouves = synPistesDansEnquete(noms, _synFicheId, (typeof CMR_FICHES_ENQUETE !== 'undefined' ? CMR_FICHES_ENQUETE : {}),
    c.metiers.map(function (o) { return { nom: o.nom, met: o.met, s: o.s }; }));
  var h = '<p class="cml-note">Département : <b>' + cmvE(lieu) + '</b>.</p>';
  if (trouves.length) {
    h += '<div class="cml-encart"><i class="bi bi-hand-thumbs-up" aria-hidden="true"></i><div><p><b>Certaines de vos pistes figurent parmi les métiers les plus cités par les employeurs de ' + cmvE(lieu) + '.</b></p><ul class="mb-1">' +
      trouves.map(function (x) { return '<li>' + cmvE(x.piste) + ' : au moins ' + _cmbNombre(x.enquete.met) + ' projets de recrutement annoncés' + (x.enquete.saisonnier ? ', surtout saisonniers' : '') + '.</li>'; }).join('') +
      '</ul><p class="cml-note mb-0">Ce sont des intentions d’employeurs, pas des embauches garanties. Source : ' + cmvE(c.source || 'France Travail, enquête Besoins en main-d’œuvre') + '.</p></div></div>';
  } else {
    h += '<p class="mb-1">Aucune de vos pistes ne figure parmi les métiers les plus cités par les employeurs de ' + cmvE(lieu) + '. Cela ne veut pas dire qu’on n’y recrute pas : cette liste ne montre que les métiers les plus cités.</p>';
  }
  return h + _synBoutonsEmplois() + change;
}
function _synBlocChezMoi(etat) {
  return '<div class="cml-bloc"><h2><i class="bi bi-geo-alt" aria-hidden="true"></i> Chez moi : mes pistes et ce qui recrute</h2><div id="synZoneChezMoi">' + _synChezMoiContenu() + '</div></div>';
}
// Après le dessin de la page : le texte libre se garde au fil de la frappe (sans redessiner), et les chiffres de l'enquête sont chargés puis la zone « Chez moi » est redessinée seule.
function _synCabler(etat) {
  var t = document.getElementById('synLibre');
  if (t) { t.addEventListener('input', function () { synEtat().libre = String(t.value || '').slice(0, SYN_PLAFONDS.libre); }); }
  if (typeof _cmrDep !== 'function' || !_cmrDepCouvert(_cmrDep())) { return; }
  if (typeof _comprendreLesChiffresChargerBmo === 'function') { _comprendreLesChiffresChargerBmo(); }
  var essais = 0;
  (function attendre() {
    var z = document.getElementById('synZoneChezMoi');
    if (!z) { return; }
    var charge = (typeof _comprendreLesChiffresBmoChargement !== 'undefined') ? _comprendreLesChiffresBmoChargement : 'erreur';
    if (charge === 'ok' || charge === 'erreur' || essais > 20) { z.innerHTML = _synChezMoiContenu(); return; }
    essais++;
    setTimeout(attendre, 250);
  })();
}

/* ---------- Garder la synthèse dans la disquette (tâche A8) ---------- */
function _synBlocGarder(etat) {
  var gardee = !!synEtat().gardee;
  return '<div class="cml-bloc"><h2><i class="bi bi-floppy" aria-hidden="true"></i> Garder ma synthèse</h2>' +
    '<p>Pour la retrouver plus tard, ou en parler avec un conseiller, gardez-la dans la disquette de l’application. Sans cela, rien n’est conservé. Seuls sont gardés vos métiers retenus, vos résultats et votre parcours (métiers exercés et compétences cochées) : jamais vos réponses au questionnaire.</p>' +
    (gardee
      ? '<div class="cml-etat fait mb-2" role="status">Synthèse gardée : elle sera dans la disquette quand vous l’enregistrerez.</div><div>' +
        '<button type="button" class="btn btn-outline-primary" style="min-height:46px" data-cml="synGarder"><i class="bi bi-x-circle" aria-hidden="true"></i> Ne plus garder ma synthèse</button></div>'
      : '<div><button type="button" class="btn btn-primary" style="min-height:46px" data-cml="synGarder"><i class="bi bi-save" aria-hidden="true"></i> Garder ma synthèse</button></div>') +
    (typeof htmlVideoGeste === 'function' ? htmlVideoGeste('disquette') : '') +
    (typeof synBoutonImprimer === 'function' ? '<p class="mt-3 mb-1">Ou sur papier : une feuille plus complète que cette page, à relire avec un conseiller.</p><div>' + synBoutonImprimer() + '</div>' : '') +
    '</div>';
}

// Nombre de passages dont la personne a un résultat (le passage 1 compte quand un métier y est retenu).
function synNombreSources(etat) {
  return (synRetenu(1) ? 1 : 0) + (((typeof _cmaNombreChoix === 'function') && _cmaNombreChoix(etat) > 0) ? 1 : 0) + ((etat.q && etat.q.resultat) ? 1 : 0);
}

cmvEnregistrerVue('synthese', {
  titre: 'Ma synthèse',
  barre: function () { return { retour: 'accueil' }; },
  rendre: function (etat) {
    var n = synNombreSources(etat);
    return '<p class="cml-note">Ce que vous avez trouvé dans « Explorer les métiers », sur une seule page.</p>' +
      cmvEncart('bi-shield-check', 'Cette page rassemble vos résultats pour vous aider à y voir clair. Vous n’êtes pas noté et personne ne vous donne de solution : ce sont des pistes de réflexion. Tout reste sur cet appareil.') +
      (n > 0 && typeof htmlRappelSauvegarde === 'function' ? htmlRappelSauvegarde() : '') +
      _synBlocPassage1(etat) + _synBlocPassage2(etat) + _synBlocPassage3(etat) + _synBlocRecoupement(etat) +
      (typeof _synBlocParcours === 'function' ? _synBlocParcours(etat) : '') + _synBlocTests(etat) + _synBlocChezMoi(etat) +
      (typeof _synBlocLecture === 'function' ? _synBlocLecture(etat) : '') +
      ((n > 0 || synpNbTotal(synEtat().parcours) > 0) ? _synBlocGarder(etat) : '');
  },
  cabler: _synCabler
});
