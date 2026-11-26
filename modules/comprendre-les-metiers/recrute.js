/* ============================================================
   Module « Explorer les métiers » : quatrième chemin « Les emplois en demande » (consigne 456, 18/11/2026). MAQUETTE VIVANTE à l'époque (module alors fermé, ouvert au public depuis le 19/11/2026), textes à valider par Denis
   (docs/TEXTES_EXPLORER_LES_METIERS_A_RELIRE_2026-11-17.md, section 10). Plan : docs/PLAN_CHEMIN_LA_OU_CA_RECRUTE_2026-11-18.md.

   Ce chemin n'explore pas : il ne pose aucune question et montre du concret pour le DÉPARTEMENT de la personne (24 ou 87 pour l'instant) :
   ce que les employeurs disent vouloir embaucher (enquête Besoins en main-d'œuvre, source unique de « Comprendre les chiffres »), les métiers surtout saisonniers,
   les endroits où l'on recrute en continu (le commerce : lien vers « Employeurs près de chez moi »), puis la demande d'offres (formulaire partagé de parMetierFiche.js).
   Le département est celui que l'application mémorise déjà (departementRessourcesMemorise) : jamais redemandé.
   ============================================================ */

// Nom du chemin : « Les emplois en demande » (Denis, 18/11/2026 : « Les emplois en demande » a été écarté, car il laisse croire que la personne choisit ; ici ce sont les besoins des employeurs qui guident). Nom à confirmer ; un seul endroit à changer.
var CMV_NOM_RECRUTE = 'Les emplois en demande';

// Les métiers de l'enquête sont des regroupements statistiques, pas des fiches. Ce tableau relie chacun aux fiches de l'application (identifiants de baseMetiers : fiches écrites
// à la main, ou « rome_XXXX » pour une fiche du ROME). Chaque fiche porte ses conditions de travail, ses compétences et le bouton « Préparer ma candidature » (parMetierFiche.js).
// À relire par Denis.
var CMR_FICHES_ENQUETE = {
  'Viticulteurs, arboriculteurs': ['vigneron'],
  'Agriculteurs': ['rome_A1416', 'ouvrier_agricole'],
  'Aides de cuisine et employés polyvalents de la restauration': ['employe_polyvalent_restauration', 'plongeur'],
  'Serveurs de cafés restaurants': ['serveur', 'barman'],
  'Employés de l\'hôtellerie': ['employe_etage', 'receptionniste'],
  'Professionnels de l\'animation socioculturelle': ['animateur'],
  'Cuisiniers': ['cuisinier', 'chef_cuisine'],
  'Aides à domicile et auxiliaires de vie': ['advf', 'aes'],
  'Aides-soignants': ['aide_soignant'],
  'Agents d\'entretien de locaux': ['agent_entretien'],
  'Employés de libre service': ['employe_libre_service'],
  'Infirmiers et sages-femmes': ['infirmier'],
  'Agents de service hospitaliers': ['ash']
};
// Les métiers saisonniers, par famille (tourisme, cuisine, agriculture...) : fiches de la liste commune METIERS_SAISONNIER_ALIMENTAIRE (data/metiers.js), plus le vigneron et l'ouvrier de chai.
var CMR_FAMILLES_SAISONNIERS = [
  { titre: 'Tourisme et hôtellerie', ids: ['receptionniste', 'employe_etage', 'accueil_touristique', 'guide_touristique', 'concierge_hotel', 'chef_reception'] },
  { titre: 'Cuisine et restauration', ids: ['employe_polyvalent_restauration', 'plongeur', 'serveur', 'barman', 'cuisinier', 'chef_cuisine', 'sommelier', 'boulanger', 'patissier', 'boucher'] },
  { titre: 'Agriculture, vigne et nature', ids: ['ouvrier_agricole', 'vigneron', 'ouvrier_chai', 'ouvrier_horticole', 'conducteur_engins_agricoles', 'apiculteur', 'agent_equestre'] },
  { titre: 'Transformation alimentaire et vente', ids: ['operateur_agroalimentaire', 'operateur_decoupe', 'vendeur_alimentation'] }
];
// Le commerce et la logistique, où des postes reviennent souvent (turnover).
var CMR_FAMILLE_COMMERCE = ['employe_libre_service', 'hote_caisse', 'merchandiseur', 'conseiller_vente', 'vendeur_alimentation', 'preparateur_commandes', 'manutentionnaire', 'cariste', 'logisticien', 'agent_tri'];
function _cmrNom(n) { n = String(n || '').replace(/’/g, '\''); return n.charAt(0).toUpperCase() + n.slice(1); }
function _cmrFiche(id) { var B = (typeof baseMetiers !== 'undefined') ? baseMetiers : []; for (var i = 0; i < B.length; i++) { if (B[i].id === id) { return B[i]; } } return null; }
// Des boutons « fiche » (ouvrent la fiche en page : conditions de travail, compétences, candidature).
function _cmrBoutonsFiches(ids, avecIcone) {
  return ids.map(_cmrFiche).filter(Boolean).map(function (f) {
    return '<button type="button" class="btn btn-outline-primary btn-sm" data-cml="fiche" data-nom="' + cmvE(f.nom) + '">' + (avecIcone ? '<i class="bi bi-file-earmark-person" aria-hidden="true"></i> ' : '') + cmvE(f.nom) + '</button>';
  }).join(' ');
}

// Le département mémorisé : '24', '87', 'ailleurs' ou '' (jamais choisi).
function _cmrDep() { return (typeof departementRessourcesMemorise === 'function') ? (departementRessourcesMemorise() || '') : ''; }
function _cmrDepCouvert(dep) { return !!(dep && typeof PMC_TERRITOIRES !== 'undefined' && PMC_TERRITOIRES[dep]); }
function _cmrNomDep(dep) { return (typeof mtDepartement === 'function' && mtDepartement(dep)) ? mtDepartement(dep).nom + ' (' + dep + ')' : dep; }
function _cmrLeDep(dep) { return (typeof mtDepartement === 'function' && mtDepartement(dep)) ? mtDepartement(dep).le : 'votre département'; }

// Les chiffres de l'enquête, lus dans la source unique de « Comprendre les chiffres » (jamais recopiés).
// Retourne { etat: 'attente' | 'erreur' | 'ancien' | 'ok', annee, metiers }.
function _cmrChiffres(dep) {
  var D = (typeof _comprendreLesChiffresBmoDonnees !== 'undefined') ? _comprendreLesChiffresBmoDonnees : null;
  var charge = (typeof _comprendreLesChiffresBmoChargement !== 'undefined') ? _comprendreLesChiffresBmoChargement : 'inactif';
  if (!D) { return { etat: charge === 'erreur' ? 'erreur' : 'attente', metiers: [] }; }
  var e = (typeof _comprendreLesChiffresBmoEtat === 'function' && typeof _comprendreLesChiffresAujourdhuiIso === 'function') ? _comprendreLesChiffresBmoEtat(D, _comprendreLesChiffresAujourdhuiIso()) : { aJour: false };
  if (!e.aJour) { return { etat: 'ancien', annee: D.annee, metiers: [] }; }
  var d = D.departements && D.departements[dep];
  var publie = (typeof _comprendreLesChiffresDateEnClair === 'function') ? (_comprendreLesChiffresDateEnClair(String(D.publie_le).slice(0, 7)) || '') : '';
  var source = (D.source ? D.source.nom : 'France Travail, enquête Besoins en main-d’œuvre') + (d ? ', ' + d.nom : '') + (publie ? ', publiée en ' + publie : '');
  return { etat: 'ok', annee: D.annee, source: source, metiers: (d && d.metiers) ? d.metiers : [] };
}
function _cmrEstSaisonnier(o) { return o.met > 0 && (o.s / o.met) >= 0.5; }

function _cmrLigneMetier(o) {
  var nom = _cmrNom(o.nom), part = o.met > 0 ? Math.round(o.s / o.met * 100) : 0, ids = CMR_FICHES_ENQUETE[nom] || [];
  var fiches = _cmrBoutonsFiches(ids, false);
  var action = fiches
    ? '<div class="cml-note mb-1">Voir la fiche du métier :</div><div class="cml-fiches">' + fiches + '</div>'
    : '<a class="btn btn-outline-secondary btn-sm" href="' + cmvLienFranceTravail({ nom: nom }) + '" target="_blank" rel="noopener"><i class="bi bi-box-arrow-up-right" aria-hidden="true"></i> Voir sur France Travail</a>';
  return '<div class="cml-met"><div class="nom">' + cmvE(nom) + (_cmrEstSaisonnier(o) ? ' <span class="cml-pill pc">surtout saisonnier</span>' : '') + '</div>' +
    '<div class="cml-part" role="img" aria-label="' + part + ' pour cent de projets saisonniers"><i class="s" style="width:' + part + '%"></i><i class="a" style="width:' + (100 - part) + '%"></i></div>' +
    '<div class="cml-note mb-1">Au moins ' + _cmbNombre(o.met) + ' projets, dont au moins ' + _cmbNombre(o.s) + ' saisonniers (' + part + ' %).</div>' + action + '</div>';
}

// Texte quand les chiffres ne sont pas là (chargement, erreur, enquête trop ancienne).
function _cmrSansChiffres(c) {
  if (c.etat === 'attente') { return '<p class="cml-note" role="status">Chargement des chiffres…</p>'; }
  if (c.etat === 'ancien') { return cmvEncart('bi-info-circle', 'Les résultats de l’enquête ' + cmvE(c.annee) + ' datent de plus d’un an. La nouvelle enquête paraît chaque printemps. En attendant, un conseiller peut vous dire quels métiers recrutent près de chez vous.', true); }
  return cmvEncart('bi-info-circle', 'Les chiffres n’ont pas pu être chargés pour le moment. Un conseiller peut vous dire quels métiers recrutent près de chez vous.', true);
}

// Les graphiques : le MÊME composant de lecture que « Comprendre les chiffres » (_comprendreLesChiffresVuesAssembler : Chiffres, Barres, Camembert, ordre au choix), jamais recopié.
// Chiffres et Barres : une ligne par métier. Camembert : la part des projets saisonniers parmi les projets des métiers listés (un vrai tout, jamais un tout inventé).
function _cmrGraphique(c) {
  if (typeof _comprendreLesChiffresVuesAssembler !== 'function' || !c.metiers.length) { return ''; }
  var nb = function (n) { return _comprendreLesChiffresFormatDecimal(n, 0); };
  var lignes = c.metiers.map(function (o) {
    return { nom: _cmrNom(o.nom), texte: 'Au moins ' + nb(o.met) + ' projets, dont ' + nb(o.s) + ' saisonniers', n: o.met, source: c.source };
  });
  var total = 0, sais = 0;
  c.metiers.forEach(function (o) { total += o.met; sais += o.s; });
  var camembert = (total > 0 && sais > 0 && sais < total) ? { titre: 'Parmi les projets de ces ' + c.metiers.length + ' métiers', parts: [
    { nom: 'Projets saisonniers', texte: 'au moins ' + nb(sais), n: sais },
    { nom: 'Autres projets', texte: 'au moins ' + nb(total - sais), n: total - sais }
  ], note: 'Seuls les ' + c.metiers.length + ' métiers les plus cités sont comptés. Les nombres sont des minimums.' } : null;
  var groupes = [{ titre: 'Projets de recrutement par métier', lignes: lignes, note: 'Les barres partent de zéro : plus elles sont longues, plus les employeurs prévoient d’embaucher dans ce métier.' }];
  return '<div id="cmrGraphique"><p class="mb-2"><b>Les graphiques.</b> Choisissez la façon de lire qui vous convient : en chiffres, en barres ou en camembert.</p>' +
    _comprendreLesChiffresVuesAssembler('recrute-bmo-' + _cmrDep(), '', groupes, camembert, { defaut: 'barres' }) + '</div>';
}

// Une rubrique de la page (maquette validée le 18/11/2026) : bandeau d'accent, icône objet, titre et une ligne qui dit de quoi il s'agit.
function _cmrRubrique(id, icone, titre, sous, corps) {
  return '<section class="cml-rub" id="' + id + '" aria-labelledby="' + id + '-t" tabindex="-1"><div class="tete"><span class="ico"><i class="bi ' + icone + '" aria-hidden="true"></i></span><div><h2 id="' + id + '-t">' + titre + '</h2>' +
    (sous ? '<div class="sous">' + sous + '</div>' : '') + '</div></div>' + corps + '</section>';
}

// Bloc A : ce que les employeurs du département prévoient d'embaucher (chiffres de l'enquête, graphiques, puis les fiches des métiers avec leur part saisonnière, filtrables).
function _cmrBlocsChiffres(dep) {
  // Les graphiques sont affichés d'office ; ils ne se masquent que si la personne le demande (Denis, 18/11/2026).
  var c = _cmrChiffres(dep), ouvert = cmvEtat().cmrGraphique !== false;
  var titre = 'Ce que les employeurs prévoient d’embaucher';
  if (c.etat !== 'ok') { return _cmrRubrique('cmr-employeurs', 'bi-bar-chart-line', titre, '', _cmrSansChiffres(c)); }
  var filtre = cmvEtat().cmrFiltre || 'tous', nSais = c.metiers.filter(_cmrEstSaisonnier).length;
  var lis = c.metiers.filter(function (o) { return filtre === 'tous' || (filtre === 'sais' ? _cmrEstSaisonnier(o) : !_cmrEstSaisonnier(o)); });
  var boutonsFiltre = [['tous', 'Tous (' + c.metiers.length + ')'], ['sais', 'Surtout saisonniers (' + nSais + ')'], ['toute', 'Toute l’année (' + (c.metiers.length - nSais) + ')']].map(function (x) {
    return '<button type="button" data-cml="recruteFiltre" data-f="' + x[0] + '" aria-pressed="' + (filtre === x[0]) + '" class="' + (filtre === x[0] ? 'on' : '') + '">' + x[1] + '</button>';
  }).join('');
  return _cmrRubrique('cmr-employeurs', 'bi-bar-chart-line', titre, 'Les ' + c.metiers.length + ' métiers les plus cités dans ' + cmvE(_cmrLeDep(dep)),
    '<p>Voici les ' + c.metiers.length + ' métiers les plus cités par les employeurs de ' + cmvE(_cmrLeDep(dep)) + ', d’après l’enquête ' + cmvE(c.annee) + ' de France Travail. Les graphiques montrent d’un coup les métiers où les employeurs prévoient le plus d’embaucher. Dessous, chaque fiche dit ce que fait le métier, ses conditions de travail, et permet de préparer une candidature.</p>' +
    '<p><button type="button" class="btn btn-outline-primary" data-cml="recruteGraphique" aria-expanded="' + (ouvert ? 'true' : 'false') + '" aria-controls="cmrGraphique"><i class="bi bi-bar-chart-line" aria-hidden="true"></i> ' + (ouvert ? 'Masquer les graphiques' : 'Voir les graphiques') + '</button></p>' +
    (ouvert ? _cmrGraphique(c) : '') +
    '<h3>Les fiches de ces métiers</h3>' +
    '<div class="cml-filtre" role="group" aria-label="Afficher">' + boutonsFiltre + '</div>' +
    '<div class="cml-legende"><span><i class="s"></i>projets saisonniers</span><span><i class="a"></i>autres projets</span></div>' +
    (lis.length ? lis.map(_cmrLigneMetier).join('') : '<p class="cml-note">Aucun métier dans cette liste.</p>') +
    cmvEncart('bi-exclamation-triangle', 'Ce sont des <b>intentions d’employeurs</b>, pas des embauches garanties, et cela ne veut pas dire qu’un employeur précis recrute. Les nombres sont des <b>minimums</b> : France Travail masque les petits nombres.', true));
}

// Bloc B : les métiers saisonniers (tourisme, cuisine, agriculture...), une famille à la fois (onglets), avec la phrase propre au département quand les chiffres sont là.
function _cmrBlocSaisonniers(dep) {
  var c = _cmrChiffres(dep), sais = c.etat === 'ok' ? c.metiers.filter(_cmrEstSaisonnier) : [];
  var familles = CMR_FAMILLES_SAISONNIERS.map(function (g) { return { titre: g.titre, ids: g.ids.filter(function (id) { return !!_cmrFiche(id); }) }; }).filter(function (g) { return g.ids.length; });
  var i = Math.min(cmvEtat().cmrFamille || 0, Math.max(familles.length - 1, 0));
  var corps = '<p>Un emploi saisonnier dépend d’une période de l’année (vendanges, récoltes, saison touristique). Le besoin revient chaque année, mais le contrat dure quelques semaines ou quelques mois.</p>';
  if (sais.length) {
    corps += '<p>Dans ' + cmvE(_cmrLeDep(dep)) + ', la majorité des projets de recrutement de ces métiers sont saisonniers : ' + sais.map(function (o) { return '<b>' + cmvE(_cmrNom(o.nom)) + '</b>'; }).join(', ') + '.</p>';
  }
  if (familles.length) {
    corps += '<div class="cml-tabs" role="group" aria-label="Familles de métiers saisonniers">' + familles.map(function (g, k) {
      return '<button type="button" data-cml="recruteFamille" data-i="' + k + '" aria-pressed="' + (k === i) + '" class="' + (k === i ? 'on' : '') + '">' + cmvE(g.titre) + ' (' + g.ids.length + ')</button>';
    }).join('') + '</div><div class="cml-fiches">' + _cmrBoutonsFiches(familles[i].ids, true) + '</div>';
  }
  return _cmrRubrique('cmr-saisonniers', 'bi-calendar3', 'Les métiers saisonniers', 'Le besoin revient chaque année, le contrat dure quelques semaines ou mois',
    corps + '<p class="cml-note mt-3">Ces fiches donnent aussi leurs conditions de travail et permettent de préparer une candidature.</p>' + _cmbBoutonLexique('emploi-saisonnier'));
}

// Bloc C : les métiers difficiles à pourvoir (explication seulement : les chiffres de tension vivent dans « Comprendre les chiffres »).
function _cmrBlocTension() {
  return _cmrRubrique('cmr-tension', 'bi-hourglass-split', 'Les métiers difficiles à pourvoir', 'Quand un poste reste ouvert longtemps',
    '<p>Un métier est « en tension » quand les employeurs ont du mal à trouver quelqu’un. Un poste reste alors ouvert longtemps. Cela ne veut pas dire qu’il est facile d’y entrer : la difficulté peut venir des horaires, de la pénibilité, du lieu ou du diplôme demandé.</p>' +
    '<div class="d-flex flex-wrap gap-2">' + _cmbBoutonLexique('metier-en-tension') +
    '<button type="button" class="btn btn-outline-secondary btn-sm" data-cml="versChiffres"><i class="bi bi-graph-up" aria-hidden="true"></i> Voir les chiffres de mon territoire</button></div>');
}

// Bloc D : le commerce, où l'on recrute en continu (turnover), et les employeurs repérés pour cette application.
function _cmrBlocEmployeurs(dep) {
  var h = '<p>Dans le commerce (grandes surfaces, magasins, restauration rapide), des postes reviennent souvent : des salariés partent, d’autres arrivent. Beaucoup d’enseignes recrutent donc toute l’année. Ce mouvement s’appelle le <b>turnover</b>.</p>' +
    '<p class="mb-2">Le Lexique l’explique en quelques lignes.</p>' + _cmbBoutonLexique('turnover') +
    '<h3>Les métiers du commerce et de la logistique</h3><p class="cml-note mb-2">Mise en rayon, caisse, préparation de commandes, magasinage : chaque fiche donne ses conditions de travail et permet de préparer une candidature.</p><div class="cml-grille-fiches">' + _cmrBoutonsFiches(CMR_FAMILLE_COMMERCE, true) + '</div>';
  if (typeof mtOuvert === 'function' && mtOuvert() && typeof monTerritoireOuvrirSecteur === 'function') {
    h += '<hr><p>Nous avons repéré une partie des employeurs de ' + cmvE(_cmrLeDep(dep)) + ' : leurs adresses, et la page où chacun publie ses offres de recrutement. <b>Le repérage complet est encore en cours.</b></p>' +
      '<div class="d-flex flex-wrap gap-2"><button type="button" class="btn btn-primary" data-cml="recruteCommerce"><i class="bi bi-cart3" aria-hidden="true"></i> Voir les enseignes du commerce</button>' +
      '<button type="button" class="btn btn-outline-primary" data-cml="recruteEmployeurs"><i class="bi bi-briefcase" aria-hidden="true"></i> Tous les secteurs : employeurs près de chez moi</button></div>' +
      cmvEncart('bi-exclamation-triangle', 'Ce repérage ne couvre que <b>votre département</b>, ' + cmvE(_cmrNomDep(dep)) + '. Nous n’avons ni les adresses ni les employeurs des départements qui l’entourent.', true);
  }
  return _cmrRubrique('cmr-commerce', 'bi-shop', 'Là où l’on recrute en continu : le commerce', 'Des postes qui reviennent souvent', h);
}

// Bloc E : la demande d'offres (formulaire partagé avec la fiche d'un métier, voir parMetierFiche.js). Rempli quand les données des métiers sont chargées.
// Les métiers à cocher, rangés par les rubriques de la page : ceux de l'enquête (avec les noms de leurs fiches), les métiers saisonniers par famille, le commerce.
// Rien n'est coché au départ et cinq métiers au plus (parMetierFiche.js) : une rubrique à la fois, en onglets.
function _cmrGroupesOffres(c) {
  var noms = function (ids) { return ids.map(_cmrFiche).filter(Boolean).map(function (f) { return f.nom; }); };
  var simples = function (ids) { return noms(ids).map(function (n) { return { nom: n, autres: [] }; }); };
  var enquete = (c.metiers || []).map(function (o) {
    var nom = _cmrNom(o.nom);
    return { nom: nom, autres: noms(CMR_FICHES_ENQUETE[nom] || []).filter(function (n) { return n !== nom; }) };
  });
  return [
    { id: 'enquete', court: 'Employeurs', titre: 'Ce que les employeurs prévoient d’embaucher', parties: [{ titre: '', items: enquete }] },
    { id: 'saison', court: 'Saisonniers', titre: 'Les métiers saisonniers', parties: CMR_FAMILLES_SAISONNIERS.map(function (g) { return { titre: g.titre, items: simples(g.ids) }; }) },
    { id: 'commerce', court: 'Commerce', titre: 'Le commerce, où l’on recrute en continu', parties: [{ titre: '', items: simples(CMR_FAMILLE_COMMERCE) }] }
  ];
}

function _cmrBlocOffres(dep) {
  var c = _cmrChiffres(dep);
  var corps = (typeof pmfBlocOffresRecrute === 'function') ? pmfBlocOffresRecrute(_cmrGroupesOffres(c)) : '';
  return _cmrRubrique('cmr-offres', 'bi-search', 'Chercher les offres du moment', 'Une demande prête à copier dans l’assistant en ligne',
    '<p>Vous choisissez ici jusqu’à cinq métiers, puis votre territoire. La demande ci-dessous demande à l’assistant en ligne de chercher des offres publiées en ce moment, d’abord dans votre territoire, puis dans les départements proches.</p>' +
    (corps || '<p class="cml-note" role="status">Chargement…</p>'));
}

// Les trois chiffres clés de l'en-tête, calculés avec les vraies données de l'enquête (jamais écrits en dur), et la source avec le rappel des « minimums ».
function _cmrCles(dep) {
  var c = _cmrChiffres(dep);
  if (c.etat !== 'ok' || !c.metiers.length) { return ''; }
  var total = 0, sais = 0, n = c.metiers.length;
  c.metiers.forEach(function (o) { total += o.met; sais += o.s; });
  return '<div class="cml-cles"><div class="cml-cle"><b>' + _cmbNombre(total) + '</b><span>projets de recrutement prévus, au moins, pour les ' + n + ' métiers les plus cités</span></div>' +
    '<div class="cml-cle"><b>' + (total ? Math.round(sais / total * 100) : 0) + ' %</b><span>de ces projets sont saisonniers (au moins ' + _cmbNombre(sais) + ')</span></div>' +
    '<div class="cml-cle"><b>' + c.metiers.filter(_cmrEstSaisonnier).length + ' sur ' + n + '</b><span>de ces métiers sont surtout saisonniers</span></div></div>' +
    '<p class="cml-note mt-2 mb-0">' + cmvE(c.source) + '. Ce sont des minimums.</p>';
}
// Le sommaire : cinq boutons qui mènent à la rubrique (la page ne se redessine pas, elle défile).
var CMR_SOMMAIRE = [['cmr-employeurs', 'bi-bar-chart-line', 'Ce que les employeurs prévoient'], ['cmr-saisonniers', 'bi-calendar3', 'Les métiers saisonniers'], ['cmr-tension', 'bi-hourglass-split', 'Les métiers difficiles à pourvoir'],
  ['cmr-commerce', 'bi-shop', 'Le commerce'], ['cmr-offres', 'bi-search', 'Chercher des offres']];

// La page d'un département connu.
function _cmrPageDepartement(dep) {
  var boutonsDep = ['24', '87'].map(function (k) {
    return '<button type="button" data-cml="recruteDep" data-dep="' + k + '" aria-pressed="' + (k === dep) + '" class="' + (k === dep ? 'on' : '') + '"><i class="bi bi-geo-alt" aria-hidden="true"></i>' + cmvE(_cmrNomDep(k)) + '</button>';
  }).join('') + '<button type="button" data-cml="recruteChanger" aria-pressed="false"><i class="bi bi-question-circle" aria-hidden="true"></i>Un autre département</button>';
  return '<div class="cml-hero"><p class="mb-1">Ici, aucune question : voici ce que les employeurs de votre département disent vouloir embaucher, et où chercher.</p>' +
    '<div class="cml-dep" role="group" aria-label="Votre département"><span>Votre département :</span>' + boutonsDep + '</div>' +
    '<div id="cmrZoneCles">' + _cmrCles(dep) + '</div></div>' +
    '<div class="cml-sommaire" role="navigation" aria-label="Les rubriques de la page">' + CMR_SOMMAIRE.map(function (s) {
      return '<button type="button" data-cml="recruteAller" data-cible="' + s[0] + '"><span class="ico"><i class="bi ' + s[1] + '" aria-hidden="true"></i></span>' + s[2] + '</button>';
    }).join('') + '</div>' +
    '<div id="cmrZoneChiffres">' + _cmrBlocsChiffres(dep) + '</div>' +
    '<div id="cmrZoneSaisonniers">' + _cmrBlocSaisonniers(dep) + '</div>' +
    _cmrBlocTension() +
    _cmrBlocEmployeurs(dep) +
    '<div id="cmrZoneOffres">' + _cmrBlocOffres(dep) + '</div>' +
    _cmrRubrique('cmr-fiche', 'bi-file-earmark-person', 'Un métier vous attire ?', '',
      '<p>Lisez sa fiche : ce que fait le métier, ce qu’il demande. Vous y trouvez aussi le bouton pour préparer votre candidature.</p>' +
      '<button type="button" class="btn btn-outline-primary" data-cml="entrer" data-chemin="metier"><i class="bi bi-search" aria-hidden="true"></i> Chercher un métier</button>');
}

// Département pas encore choisi, ou pas couvert.
function _cmrChoixDepartement(dep) {
  var tuile = function (code, icone, titre, sous) {
    return '<button type="button" class="sous-carte-accueil" data-cml="recruteDep" data-dep="' + code + '"><i class="bi ' + icone + '" aria-hidden="true"></i><strong>' + titre + '</strong><span>' + sous + '</span></button>';
  };
  var h = '<div class="cml-bloc"><p>Pour vous montrer les chiffres de votre département, indiquez où vous cherchez. Vous pourrez le changer à tout moment.</p>' +
    '<div class="grille-sous-cartes-accueil">' + tuile('24', 'bi-geo-alt', 'Dordogne (24)', 'Région Nouvelle-Aquitaine') + tuile('87', 'bi-geo-alt', 'Haute-Vienne (87)', 'Région Nouvelle-Aquitaine') +
    tuile('ailleurs', 'bi-question-circle', 'Un autre département', 'Ou je ne sais pas encore') + '</div></div>';
  if (dep === 'ailleurs') {
    h += cmvEncart('bi-info-circle', 'Les chiffres et les employeurs de ce chemin ne sont pas encore là pour votre département. Rien n’est inventé : en attendant, vous pouvez chercher un métier précis, ou en parler avec un conseiller.', true) +
      '<div style="text-align:center"><button type="button" class="btn btn-outline-primary" data-cml="entrer" data-chemin="metier"><i class="bi bi-search" aria-hidden="true"></i> Chercher un métier</button></div>';
  }
  return h;
}

// Suivi d'usage : le nom de l'événement seulement, jamais ce que la personne a choisi.
cmvEnregistrerAction('recruteGraphique', function (el, etat) {
  var etaitOuvert = etat.cmrGraphique !== false;
  etat.cmrGraphique = !etaitOuvert;
  if (etat.cmrGraphique && typeof trackEvenement === 'function') { trackEvenement('comprendre_metiers_graphiques_ouverts'); }
});
// Filtre de la liste des métiers et famille de saisonniers affichée : seulement l'écran, jamais gardés (ni dans la disquette).
cmvEnregistrerAction('recruteFiltre', function (el, etat) { etat.cmrFiltre = el.getAttribute('data-f') || 'tous'; });
cmvEnregistrerAction('recruteFamille', function (el, etat) { etat.cmrFamille = parseInt(el.getAttribute('data-i'), 10) || 0; });
cmvEnregistrerAction('recruteAller', function (el) {
  var cible = document.getElementById(el.getAttribute('data-cible'));
  if (!cible) { return false; }
  var reduit = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  cible.scrollIntoView({ behavior: reduit ? 'auto' : 'smooth', block: 'start' });
  if (typeof cible.focus === 'function') { cible.focus({ preventScroll: true }); }
  return false;
});
cmvEnregistrerAction('recruteDep', function (el) { if (typeof memoriserDepartementRessources === 'function') { memoriserDepartementRessources(el.getAttribute('data-dep')); } });
cmvEnregistrerAction('recruteChanger', function () { if (typeof oublierDepartementRessources === 'function') { oublierDepartementRessources(); } });
// Vers « Employeurs près de chez moi » (module Qui fait quoi) : le bouton « Revenir à Explorer les métiers » ramène à cette page.
function _cmrRevenirIci() { cmvEtat().vue = 'recrute'; if (typeof naviguerVers === 'function') { naviguerVers(CMV_ROUTE); } }
cmvEnregistrerAction('recruteEmployeurs', function () {
  if (typeof monTerritoireOuvrirEmployeurs !== 'function') { return false; }
  monTerritoireOuvrirEmployeurs();
  if (typeof definirRetourModuleExterne === 'function') { definirRetourModuleExterne(CMV_NOM, _cmrRevenirIci, CMV_ROUTE, 'mon-territoire'); }
  return false;
});
cmvEnregistrerAction('recruteCommerce', function () {
  if (typeof monTerritoireOuvrirSecteur !== 'function') { return false; }
  monTerritoireOuvrirSecteur('commerce-vente', CMV_NOM, _cmrRevenirIci, CMV_ROUTE);
  return false;
});

// Remplit les zones qui dépendent des données chargées après coup (chiffres, métiers de l'application).
function _cmrRemplir() {
  var dep = _cmrDep(); if (!_cmrDepCouvert(dep)) { return; }
  var z = document.getElementById('cmrZoneChiffres'), o = document.getElementById('cmrZoneOffres');
  var zs = document.getElementById('cmrZoneSaisonniers'), zc = document.getElementById('cmrZoneCles');
  if (zc) { zc.innerHTML = _cmrCles(dep); }
  if (z) { z.innerHTML = _cmrBlocsChiffres(dep); if (typeof _comprendreLesChiffresBrancherVues === 'function') { _comprendreLesChiffresBrancherVues(); } }
  if (zs) { zs.innerHTML = _cmrBlocSaisonniers(dep); }
  if (o && !document.querySelector('#cmrZoneOffres #pmfCandidater')) { o.innerHTML = _cmrBlocOffres(dep); }
}

cmvEnregistrerVue('recrute', {
  titre: function () { return CMV_NOM_RECRUTE; },
  barre: function () { return { retour: 'accueil' }; },
  rendre: function () {
    var dep = _cmrDep();
    return _cmrDepCouvert(dep) ? _cmrPageDepartement(dep) : _cmrChoixDepartement(dep);
  },
  cabler: function () {
    if (!_cmrDepCouvert(_cmrDep())) { return; }
    if (typeof _comprendreLesChiffresChargerBmo === 'function') { _comprendreLesChiffresChargerBmo(); }
    if (typeof pmCharger === 'function') { pmCharger(function () { _cmrRemplir(); }); }
    var essais = 0;
    (function attendre() {
      if (!document.getElementById('cmrZoneChiffres')) { return; }
      var etat = (typeof _comprendreLesChiffresBmoChargement !== 'undefined') ? _comprendreLesChiffresBmoChargement : 'erreur';
      if (etat === 'ok' || etat === 'erreur' || essais > 20) { _cmrRemplir(); return; }
      essais++;
      setTimeout(attendre, 250);
    })();
  }
});

// ---------------- Présentation du chemin « Les emplois en demande » : le corps de la page (index.js, route comprendre-les-metiers-intro-recrute) ----------------
function cmvCorpsPresentationRecrute() {
  return _introBlocAccroche('<strong>Ici, aucune question, et ce ne sont pas vos envies qui guident.</strong> Vous voyez du concret : ce que les employeurs de votre département disent vouloir embaucher, et où chercher.') +
    _introBlocSection('&#127919; À quoi sert ce chemin',
      '<p class="mb-0">Vous cherchez surtout un emploi. Les trois autres chemins partent de vous : de vos goûts et de vos choix. Celui-ci part de la demande des employeurs : il vous montre les métiers qu’ils veulent pourvoir près de chez vous, puis vous aide à les chercher et à candidater.</p>') +
    _introBlocSection('&#128203; Ce que vous y trouvez', '<ul class="mb-0">' +
      '<li><b>Les métiers les plus cités par les employeurs</b> de votre département, avec la part d’emplois saisonniers.</li>' +
      '<li><b>Les métiers surtout saisonniers</b> : vendanges, récoltes, saison touristique.</li>' +
      '<li><b>Les métiers difficiles à pourvoir</b>, et ce que cela veut dire pour vous.</li>' +
      '<li><b>Le commerce</b>, où des postes reviennent souvent : les enseignes repérées, avec leur adresse et la page de leurs offres.</li>' +
      '<li><b>Une demande d’offres prête à copier</b> dans l’assistant en ligne de votre choix, pour votre territoire puis les départements proches.</li>' +
      '<li><b>Les fiches des métiers</b> (saisonniers, cuisine, agriculture, commerce, logistique), avec leurs conditions de travail et le bouton pour préparer votre candidature.</li></ul>') +
    _introBlocSection('&#128202; D’où viennent les informations',
      '<p>Les nombres viennent de l’<b>enquête Besoins en main-d’œuvre de France Travail</b>, que les employeurs remplissent chaque année. Ce sont des <b>intentions d’employeurs</b> et des <b>minimums</b>, pas des embauches garanties.</p>' +
      '<p class="mb-0">Les employeurs et leurs adresses viennent d’un <b>repérage fait pour cette application</b>. Il est encore en cours : vous n’y trouvez pas tous les employeurs.</p>') +
    _introBlocSection('&#128205; Ce que ce chemin ne fait pas encore',
      '<p class="mb-0">Il ne couvre que <b>la Dordogne et la Haute-Vienne</b>. Pour chacun de ces départements, nous n’avons ni les adresses ni les employeurs des départements voisins : seule la demande d’offres les cherche. D’autres départements viendront un par un.</p>') +
    _introBlocEncart('&#8505;&#65039;', 'Un métier qui recrute beaucoup n’est pas forcément un métier fait pour vous. Si vous hésitez, les trois autres chemins sont là pour y voir clair.');
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CMR_FICHES_ENQUETE: CMR_FICHES_ENQUETE };
}
