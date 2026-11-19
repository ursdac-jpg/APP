/* ============================================================
   Module « Explorer les métiers » : entrée 2, « Par ce que vous aimez faire ».
   Charge après index.js. Calcul : cmlEntree2Metiers (logique.js, moteur rechercherMetiers de data/metiers.js avec le seul réglage pleinMax = 16).
   Quatre pages (avec qui ou avec quoi 16 / ce que vous aimeriez faire 16 / où 12 / ce qui serait facile ou difficile pour vous), puis les métiers proposés.

   Règles tenues ici :
   - les choix viennent des catalogues de l'application (CATALOGUE_PERSONNES_MATERIELS_LIEUX, CATALOGUE_ACTIONS_PRO, CATALOGUE_ENVIRONNEMENTS_TRAVAIL), jamais recopiés ;
   - « Ce qui serait facile ou difficile pour vous » (consigne 453, harmonisé avec « Par un métier ») : chaque condition peut être dite facile OU difficile ; l'effet sur le pourcentage passe par
     la SEULE fonction pmcEffetConditions (parMetierCalcul.js), même petit poids (une nuance, jamais un barrage) ; chaque carte prévient aussi, métier par métier (conditions du ROME) ;
   - le niveau d'accès est écrit sur chaque carte ; le bouton visible « Grouper par niveau d'accès » range la liste, il ne filtre jamais ;
   - le pourcentage est une évaluation, jamais une mesure : la phrase le dit.
   ============================================================ */

var CMA_PAGES = {
  actions1: { cle: 'activites', n: 1, titre: 'Avec qui ou avec quoi vous verriez-vous travailler ?',
    consigne: 'Choisissez ce qui vous attire, sans vous demander si vous en êtes capable. Trois familles : les personnes, les matériels, les animaux.',
    retour: 'accueil', suite: 'actions2', modifier: 'Modifier avec qui ou avec quoi' },
  actions2: { cle: 'actions', n: 2, titre: 'Qu’aimeriez-vous faire ?',
    consigne: 'Choisissez les actions qui vous donnent envie. Huit familles d’actions, chacune est expliquée.',
    retour: 'actions1', suite: 'actions3', modifier: 'Modifier ce que je fais' },
  actions3: { cle: 'environnement', n: 3, titre: 'Où vous verriez-vous travailler ?',
    consigne: 'Choisissez les lieux où vous vous verriez travailler. Quatre familles de lieux.',
    retour: 'actions2', suite: 'actions4', modifier: 'Modifier où' }
};
function _cmaCatalogue(cle) {
  if (cle === 'activites') { return typeof CATALOGUE_PERSONNES_MATERIELS_LIEUX !== 'undefined' ? CATALOGUE_PERSONNES_MATERIELS_LIEUX : []; }
  if (cle === 'actions') { return typeof CATALOGUE_ACTIONS_PRO !== 'undefined' ? CATALOGUE_ACTIONS_PRO : []; }
  return typeof CATALOGUE_ENVIRONNEMENTS_TRAVAIL !== 'undefined' ? CATALOGUE_ENVIRONNEMENTS_TRAVAIL : [];
}
function _cmaLibelle(cle, id) {
  var res = id;
  _cmaCatalogue(cle).some(function (g) { return (g.items || []).some(function (it) { if (it.id === id) { res = it.label; return true; } return false; }); });
  return res;
}

// Conditions de travail (data/conditionsRome.js) : quatre groupes, les mêmes quatorze conditions que « Par un métier » (les trois lieux, extérieur / au domicile / contact avec le public,
// sont demandés à la page « Où »). Chaque condition se dit facile OU difficile : etat.choix.faciles et etat.choix.conditions (= difficiles, nom gardé pour les sauvegardes déjà faites).
var CMA_CONDITIONS_GROUPES = [
  { titre: 'Horaires et rythme', aide: 'Les moments où vous travaillez et la cadence à tenir.', ids: ['nuit', 'weekend', 'horaires', 'saisonnier', 'repetitif'] },
  { titre: 'Le corps et la fatigue', aide: 'Ce que le travail demande physiquement.', ids: ['charges', 'debout', 'assis', 'bruit'] },
  { titre: 'Déplacements et solitude', aide: 'Rouler pour travailler, ou se retrouver seul.', ids: ['deplacements', 'isole'] },
  { titre: 'Précision et sécurité', aide: 'La minutie demandée, les consignes à respecter, la tenue à porter.', ids: ['precision', 'securite', 'tenue'] }
];
// Les trois lieux : « Par ce que vous aimez faire » les demande à la page « Où » ; « Par un métier » les range dans cette cinquième famille (consigne 480).
var CMA_CONDITIONS_LIEUX = { titre: 'Les lieux', aide: 'Travailler dehors, chez les gens ou face au public.', ids: ['exterieur', 'domicile', 'public'], icone: 'bi-house-door' };
function _cmaLibelleCondition(id) {
  return (typeof CONDITIONS_ROME !== 'undefined' && CONDITIONS_ROME.libelles[id]) || id;
}
// Conditions que ce métier peut demander parmi celles que la personne a signalées (libellés).
function cmaConditionsDemandees(fiche, conditionsChoisies) {
  if (!conditionsChoisies || !conditionsChoisies.length || typeof CONDITIONS_ROME === 'undefined' || !fiche || !fiche.rome) { return []; }
  var ids = CONDITIONS_ROME.parCode[fiche.rome] || [];
  return conditionsChoisies.filter(function (id) { return ids.indexOf(id) !== -1; }).map(_cmaLibelleCondition);
}
// Effet des conditions sur le pourcentage d'un métier : la fonction partagée avec « Par un métier » (pmcEffetConditions), jamais un second calcul.
function cmaEffetConditions(fiche, choix) {
  var ids = (typeof CONDITIONS_ROME !== 'undefined' && fiche && fiche.rome && CONDITIONS_ROME.parCode[fiche.rome]) || [];
  return pmcEffetConditions(ids, choix.faciles || [], choix.conditions || []);
}

function _cmaChoixPourMoteur(etat) {
  return { actions: etat.choix.actions, activites: etat.choix.activites, environnement: etat.choix.environnement };
}
function _cmaNombreChoix(etat) { return cmlEntree2NombreChoix(_cmaChoixPourMoteur(etat)); }

// Liste calculée une fois par jeu de choix (le moteur parcourt toutes les fiches).
// Le moteur donne la liste des choix « avec qui / quoi / où » ; les conditions facile / difficile s'ajoutent ensuite (même fonction que « Par un métier »).
var _cmaMemo = { cle: '', liste: [] };
function _cmaListeMetiers(etat) {
  var choix = _cmaChoixPourMoteur(etat), cle = JSON.stringify(choix);
  if (_cmaMemo.cle !== cle) { _cmaMemo = { cle: cle, liste: cmlEntree2Metiers(choix, 5000) }; }
  return pmcAjusterListeConditions(_cmaMemo.liste, etat.choix.faciles, etat.choix.conditions, function (m) { return (typeof CONDITIONS_ROME !== 'undefined' && CONDITIONS_ROME.parCode[m.rome]) || []; });
}

// Le fil des quatre pages (consigne 479) : n = la page en cours (1 à 4), 5 = résultats (tout est fait). Une page déjà faite se rouvre d'un clic.
function _cmaEtapes(n) {
  return cmvFilParties(CMV_FIL_C2, n - 1, ['actions1', 'actions2', 'actions3', 'actions4']);
}
// Une icône OBJET par famille (la liste des choix contient des icônes individuelles dont certaines sont des visages : non reprises). Clé = nom de la famille dans les catalogues.
var CMA_ICONES_FAMILLES = {
  'Personnes': 'bi-people', 'Matériels': 'bi-tools', 'Animaux': 'bi-feather',
  'Organisation, gestion, administration': 'bi-clipboard-check', 'Relationnel': 'bi-chat-dots', 'Fabriquer et construire': 'bi-hammer', 'Cuisiner et servir': 'bi-cup-hot',
  'Réparer et entretenir': 'bi-wrench-adjustable', 'Transport et logistique': 'bi-truck', 'Surveiller, manipuler, programmer': 'bi-shield-check', 'Création et conception': 'bi-palette',
  'En intérieur': 'bi-building', 'À domicile': 'bi-house-door', 'En extérieur': 'bi-tree', 'En déplacement': 'bi-signpost-2'
};
function _cmaIconeFamille(categorie) { return CMA_ICONES_FAMILLES[categorie] || 'bi-grid'; }
// « 3 choisis sur 14 » : pastille de compte d'une famille, pleine dès qu'un choix y est fait.
function _cmaMesChoixPill(etat, cle, g) {
  var ids = (g.items || []).map(function (it) { return it.id; });
  var nb = etat.choix[cle].filter(function (id) { return ids.indexOf(id) !== -1; }).length;
  return '<span class="compte' + (nb ? ' a' : '') + '">' + nb + (nb > 1 ? ' choisis' : ' choisi') + ' sur ' + ids.length + '</span>';
}
// Pastilles « 2 faciles » (vert) et « 1 difficile » (ambre) : jetons de succès et d'alerte de l'application, toujours écrites et cochées (consigne 478).
function _cmaPillsFd(nf, nd) {
  return '<span class="cml-pill-fd fac"><i class="bi bi-check-lg" aria-hidden="true"></i>' + nf + ' facile' + (nf > 1 ? 's' : '') + '</span> ' +
    '<span class="cml-pill-fd dif"><i class="bi bi-check-lg" aria-hidden="true"></i>' + nd + ' difficile' + (nd > 1 ? 's' : '') + '</span>';
}
var CMA_ICONES_CONDITIONS = ['bi-clock', 'bi-lightning-charge', 'bi-geo-alt', 'bi-bullseye'];
// Le plateau « Vos choix » : chaque choix de la page avec sa croix (même geste « choix » que le jeton : un clic le retire).
function _cmaPlateau(etat, cle) {
  var liste = etat.choix[cle];
  return '<div class="cml-plateau" aria-label="Vos choix sur cette page">' + (liste.length ? liste.map(function (id) {
    var lib = cmvE(_cmaLibelle(cle, id));
    return '<span class="cml-chip-x">' + lib + '<button type="button" data-cml="choix" data-cle="' + cle + '" data-id="' + cmvE(id) + '" aria-label="Retirer : ' + lib + '"><i class="bi bi-x-lg" aria-hidden="true"></i></button></span>';
  }).join('') : '<span class="vide">Vos choix apparaîtront ici. Un clic sur la croix en retire un.</span>') + '</div>';
}

// ---------------- Trois pages de choix ----------------
function _cmaVueChoix(nomVue) {
  var P = CMA_PAGES[nomVue];
  cmvEnregistrerVue(nomVue, {
    titre: P.titre,
    barre: function () { return { retour: P.retour, suivant: { libelle: 'Continuer &#8594;', action: function () { cmvAller(P.suite); } } }; },
    rendre: function (etat) {
      var lim = CML_MAX_CHOIX[P.cle], n = etat.choix[P.cle].length, plein = n >= lim, pct = Math.round(n / lim * 100);
      return _cmaEtapes(P.n) + cmvBandeau(P.n, P.titre, P.consigne) +
        '<div class="cml-suivi" role="status"><div class="haut"><div><span class="n">' + n + '</span> choix sur <b>' + lim + '</b> au maximum</div>' +
        '<button type="button" class="btn btn-outline-secondary btn-sm" data-cml="vider" data-cle="' + P.cle + '"' + (n ? '' : ' disabled') + '><i class="bi bi-x-circle" aria-hidden="true"></i> Tout désélectionner</button></div>' +
        '<div class="cml-jauge" role="img" aria-label="' + n + ' choix sur ' + lim + '"><i style="width:' + pct + '%"></i></div>' + _cmaPlateau(etat, P.cle) + '</div>' +
        (plein ? cmvEncart('bi-info-circle', 'Vous avez atteint le maximum de ' + lim + ' choix. Retirez-en un pour en ajouter un autre.', true) : '') +
        _cmaCatalogue(P.cle).map(function (g) {
          return '<div class="cml-famille"><div class="tete"><span class="ico"><i class="bi ' + _cmaIconeFamille(g.categorie) + '" aria-hidden="true"></i></span><h3>' + cmvE(g.categorie) + '</h3>' + _cmaMesChoixPill(etat, P.cle, g) + '</div>' +
            '<p class="cml-note expl">' + cmvE(EXPLICATIONS_CHOIX_METIERS[g.categorie] || '') + '</p>' +
            '<div class="cml-jetons" role="group" aria-label="' + cmvE(g.categorie) + '">' +
            g.items.map(function (it) {
              var on = etat.choix[P.cle].indexOf(it.id) !== -1;
              return '<button type="button" class="cml-jt' + (on ? ' is-actif' : '') + '" data-cml="choix" data-cle="' + P.cle + '" data-id="' + cmvE(it.id) + '" aria-pressed="' + on + '"' + (plein && !on ? ' disabled' : '') + '><i class="bi bi-check-lg" aria-hidden="true"></i>' + cmvE(it.label) + '</button>';
            }).join('') + '</div></div>';
        }).join('');
    }
  });
}
['actions1', 'actions2', 'actions3'].forEach(_cmaVueChoix);

cmvEnregistrerAction('choix', function (el, etat) {
  var cle = el.getAttribute('data-cle'), id = el.getAttribute('data-id'), liste = etat.choix[cle], i = liste.indexOf(id);
  if (i !== -1) { liste.splice(i, 1); }
  else if (cle === 'conditions' || cle === 'faciles') {
    // Une condition est facile OU difficile, jamais les deux.
    var autre = etat.choix[cle === 'conditions' ? 'faciles' : 'conditions'], j = autre.indexOf(id);
    if (j !== -1) { autre.splice(j, 1); }
    liste.push(id);
  }
  else if (liste.length < CML_MAX_CHOIX[cle]) { liste.push(id); }
  etat.plusRes = false;
});
cmvEnregistrerAction('vider', function (el, etat) {
  var cle = el.getAttribute('data-cle');
  etat.choix[cle] = [];
  if (cle === 'conditions') { etat.choix.faciles = []; }
  etat.plusRes = false;
});

// ---------------- Page 4 : ce qui serait facile ou difficile pour vous (une nuance dans le pourcentage, jamais un barrage) ----------------
cmvEnregistrerVue('actions4', {
  titre: 'Ce qui serait facile ou difficile pour vous ?',
  barre: function (etat) {
    var vide = _cmaNombreChoix(etat) === 0;
    return { retour: 'actions3', suivant: { libelle: 'Voir les métiers &#8594;', libelleExact: true, desactive: vide, message: 'Choisissez au moins un élément dans les pages précédentes pour voir des métiers.', action: function () { etat.plusRes = false; cmvAller('resultats2'); } } };
  },
  rendre: function (etat) {
    var nd = etat.choix.conditions.length, nf = etat.choix.faciles.length, n = nd + nf;
    return _cmaEtapes(4) +
      cmvBandeau(4, 'Ce qui serait facile ou difficile pour vous ?', 'Certains métiers demandent de travailler la nuit, le week-end, de porter des charges ou de beaucoup se déplacer. Pour chaque condition, indiquez si elle serait facile ou difficile pour vous en ce moment : cela dépend de votre situation, pas de vos capacités. <span class="cml-pill">à compléter</span>') +
      cmvEncart('bi-shield-check', '<b>Cela pèse peu dans les pourcentages : une nuance, jamais un barrage.</b> Chaque métier vous prévient aussi quand il peut demander ce que vous avez indiqué. Vous pouvez passer cette page sans rien choisir.') +
      '<div class="cml-suivi" role="status"><div class="haut"><div><span class="n">' + n + '</span> choix : ' + _cmaPillsFd(nf, nd) + '</div>' +
      '<button type="button" class="btn btn-outline-secondary btn-sm" data-cml="vider" data-cle="conditions"' + (n ? '' : ' disabled') + '><i class="bi bi-x-circle" aria-hidden="true"></i> Tout désélectionner</button></div></div>' +
      CMA_CONDITIONS_GROUPES.map(function (g, i) {
        var nbg = g.ids.filter(function (id) { return etat.choix.conditions.indexOf(id) !== -1 || etat.choix.faciles.indexOf(id) !== -1; }).length;
        return cmvFamilleConditions(CMA_ICONES_CONDITIONS[i], g.titre, g.aide, nbg, g.ids.length, g.ids.map(function (id) {
          return cmvLigneFacDif(_cmaLibelleCondition(id), etat.choix.faciles.indexOf(id) !== -1, etat.choix.conditions.indexOf(id) !== -1,
            'data-cml="choix" data-cle="faciles" data-id="' + id + '"', 'data-cml="choix" data-cle="conditions" data-id="' + id + '"');
        }).join(''));
      }).join('') +
      '<p class="cml-note">Les lieux (extérieur, au domicile, contact avec le public) sont déjà demandés à la page précédente : ils ne sont pas répétés ici.</p>';
  }
});

// ---------------- Les métiers proposés ----------------
var CMA_LIMITE = 6;
var CMA_LIMITE_GROUPE = 3;

function _cmaCommunes(m) {
  var c = m.communes || {};
  return (c.activites || []).concat(c.actions || [], c.environnement || []);
}
function _cmaCarte(m, etat, N, premier) {
  var pct = Math.max(0, Math.min(100, Math.round(m.score || 0)));
  var nbTrouves = _cmaCommunes(m).length;
  var niveau = cmlNiveauDeMetier(m);
  var cond = '';
  if (etat.choix.conditions.length) {
    var d = cmaConditionsDemandees(m, etat.choix.conditions);
    cond = d.length
      ? '<p class="mb-0" style="font-size:.875rem"><i class="bi bi-exclamation-triangle" style="color:var(--warning-strong)" aria-hidden="true"></i> <b>À vérifier :</b> ce métier peut demander ' + d.map(function (x) { return cmvE(cmvMinuscule1(x)); }).join(' ; ') + '.</p>'
      : '<p class="cml-note mb-0"><i class="bi bi-check2 cml-coche" aria-hidden="true"></i> Rien de ce que vous avez indiqué comme difficile.</p>';
  }
  if (etat.choix.faciles.length) {
    var f = cmaConditionsDemandees(m, etat.choix.faciles);
    if (f.length) { cond += '<p class="cml-note mb-0"><i class="bi bi-check2 cml-coche" aria-hidden="true"></i> Ce métier peut demander ' + f.map(function (x) { return cmvE(cmvMinuscule1(x)); }).join(' ; ') + ', ce qui serait facile pour vous.</p>'; }
  }
  var extra = '<div class="cml-let">' + cmvLettres((typeof LETTRES_RIASEC_ROME !== 'undefined' && LETTRES_RIASEC_ROME[m.rome]) || '') + '</div>' +
    '<div class="cml-pct" role="img" aria-label="Compatibilité : ' + pct + ' pour cent"><span class="cml-note">Compatibilité</span><div class="piste"><span style="width:' + pct + '%"></span></div><b>' + pct + ' %</b></div>' +
    '<p class="cml-note mb-0">' + nbTrouves + ' de vos ' + N + ' choix retrouvés dans ce métier.</p>' +
    '<p class="cml-note mb-0"><i class="bi bi-mortarboard" aria-hidden="true"></i> Accès : ' + cmlLibelleNiveauAcces(niveau) + '.</p>' + cond;
  extra += _cmaPourquoi(m, N, nbTrouves, premier);
  if (premier) { extra += _cmaProchesDeLaPremiere(m, etat); }
  return cmvCarteMetier(m, extra, { premier: premier, etiquette: premier ? 'Première proposition' : '', retenir: 2 });
}
// « Pourquoi ce métier » : trois lignes à icône (avec qui ou quoi, ce que vous aimeriez faire, où), les choix retrouvés en pastilles d'accent. La phrase d'introduction n'est écrite que sur la première proposition.
function _cmaPourquoi(m, N, nbTrouves, premier) {
  var c = m.communes || {};
  var ligne = function (ic, titre, cle, ids) {
    return (ids && ids.length) ? '<p><i class="bi ' + ic + '" aria-hidden="true"></i><b>' + titre + ' :</b> ' + ids.map(function (id) { return '<span class="cml-pill pc">' + cmvE(_cmaLibelle(cle, id)) + '</span>'; }).join(' ') + '</p>' : '';
  };
  return '<div class="cml-pourquoi">' + (premier ? '<p><b>Pourquoi ce métier vous est proposé.</b> Il réunit ' + nbTrouves + ' de vos ' + N + ' choix.</p>' : '') +
    ligne('bi-people', 'Avec qui ou quoi', 'activites', c.activites) + ligne('bi-hammer', 'Ce que vous aimeriez faire', 'actions', c.actions) + ligne('bi-geo-alt', 'Où', 'environnement', c.environnement) + '</div>';
}
function _cmaProchesDeLaPremiere(m, etat) {
  var h = '';
  var ouvert = !!etat.proches[m.nom];
  if (ouvert) {
    var noms = etat.proches[m.nom];
    h += '<div class="cml-bloc" style="margin:.3rem 0"><b>Métiers proches de « ' + cmvE(m.nom) + ' »</b>' +
      (noms === 'chargement' ? '<p class="cml-note mt-2 mb-0">Chargement…</p>'
        : (noms.length ? noms.map(function (nom) { return '<div class="cml-ligne"><b>' + cmvE(nom) + '</b><button type="button" class="btn btn-outline-primary" data-cml="fiche" data-nom="' + cmvE(nom) + '"><i class="bi bi-file-earmark-person" aria-hidden="true"></i> Voir la fiche</button></div>'; }).join('')
          : '<p class="cml-note mt-2 mb-0">La fiche ne donne pas de métiers proches pour celui-ci.</p>')) + '</div>';
  }
  return h + '<button type="button" class="btn btn-outline-primary" data-cml="proches" data-nom="' + cmvE(m.nom) + '"><i class="bi bi-diagram-3" aria-hidden="true"></i> ' + (ouvert ? 'Masquer les métiers proches' : 'Voir les métiers proches de celui-ci') + '</button>';
}
cmvEnregistrerAction('proches', function (el, etat) {
  var nom = el.getAttribute('data-nom');
  if (etat.proches[nom]) { delete etat.proches[nom]; return; }
  var fiche = typeof metierParNom === 'function' ? metierParNom(nom) : null;
  etat.proches[nom] = 'chargement';
  if (!fiche || typeof chargerFicheRome !== 'function') { etat.proches[nom] = []; return; }
  chargerFicheRome(fiche.rome, function (f) {
    var noms = [];
    if (f && typeof ficheRomeDonnees === 'function') { noms = ficheRomeDonnees(f, fiche).proches; }
    if (_cmvEtat && _cmvEtat.proches[nom] === 'chargement') { _cmvEtat.proches[nom] = noms; if (pageActuelle === CMV_ROUTE && _cmvEtat.vue === 'resultats2') { cmvRendre(); } }
  });
});

// « Vos choix » : une ligne numérotée par page (les pastilles d'accent), avec « Modifier » ; la ligne 4 porte les conditions en pastilles vertes (facile) et ambre (difficile).
function _cmaBlocChoix(etat) {
  var ligne = function (v) {
    var P = CMA_PAGES[v];
    return '<div class="cml-ligne-choix"><span class="lib"><span class="cml-num">' + P.n + '</span>' + CMA_RESUME_LIBELLES[P.n - 1] + '</span><span class="pills">' +
      (etat.choix[P.cle].length ? etat.choix[P.cle].map(function (id) { return '<span class="cml-pill pc">' + cmvE(_cmaLibelle(P.cle, id)) + '</span>'; }).join(' ') : '<span class="cml-note">Rien choisi.</span>') +
      '</span><button type="button" class="btn btn-outline-secondary btn-sm" data-cml="aller" data-vue="' + v + '" aria-label="' + P.modifier + '">Modifier</button></div>';
  };
  var cs = etat.choix.conditions, fs = etat.choix.faciles;
  var pastilles = function (liste, cls, mot) { return liste.map(function (id) { return '<span class="cml-pill-fd ' + cls + '"><i class="bi bi-check-lg" aria-hidden="true"></i>' + mot + ' : ' + cmvE(_cmaLibelleCondition(id)) + '</span>'; }).join(' '); };
  var ligneConditions = '<div class="cml-ligne-choix"><span class="lib"><span class="cml-num">4</span>Mes conditions</span><span class="pills">' +
    (cs.length || fs.length ? pastilles(fs, 'fac', 'Facile') + ' ' + pastilles(cs, 'dif', 'Difficile')
      : '<span class="cml-note">Vous n’avez rien indiqué. Le classement en tient compte un peu quand vous le faites, et chaque métier vous prévient.</span>') +
    '</span><button type="button" class="btn btn-outline-secondary btn-sm" data-cml="aller" data-vue="actions4" aria-label="Modifier mes conditions">Modifier</button></div>';
  var masquer = (cs.length || fs.length)
    ? '<p class="cml-note mb-2 mt-2">Elles pèsent peu dans le pourcentage : une nuance, jamais un barrage. Chaque métier vous dit aussi s’il peut les demander.</p>' +
      '<button type="button" class="btn ' + (etat.masquerConditions ? 'btn-primary' : 'btn-outline-primary') + ' btn-sm" data-cml="masquer" aria-pressed="' + !!etat.masquerConditions + '"><i class="bi bi-eye-slash" aria-hidden="true"></i> ' + (etat.masquerConditions ? 'Métiers masqués : cliquez pour les montrer' : 'Masquer les métiers qui peuvent demander ce qui est difficile pour vous') + '</button>'
    : '';
  return '<div class="cml-bloc"><h3>Vos choix</h3>' + ['actions1', 'actions2', 'actions3'].map(ligne).join('') + ligneConditions + masquer + '</div>';
}
var CMA_RESUME_LIBELLES = ['Avec qui ou quoi', 'Ce que je fais', 'Où'];
cmvEnregistrerAction('masquer', function (el, etat) { etat.masquerConditions = !etat.masquerConditions; etat.plusRes = false; });
cmvEnregistrerAction('grouper', function (el, etat) { etat.grouper = !etat.grouper; etat.plusRes = false; });
function _cmaBlocGrouper(etat) {
  var oui = etat.grouper;
  return '<div class="cml-bloc"><h3>Comment lire la liste</h3><p class="mb-2">' +
    (oui ? 'Les métiers sont rangés par niveau d’accès : vous voyez d’abord ceux qui se préparent le plus vite. Le pourcentage ne change pas.'
      : 'Les métiers sont rangés du plus proche de vos choix au moins proche. Le niveau d’accès est écrit sur chaque carte.') + '</p>' +
    '<button type="button" class="btn btn-outline-primary" data-cml="grouper"><i class="bi bi-mortarboard" aria-hidden="true"></i> ' + (oui ? 'Revenir à un seul classement' : 'Grouper par niveau d’accès') + '</button></div>';
}
function _cmaVoirLesAutres(restant) {
  return '<div class="metier-voir-reste"><button type="button" class="btn btn-outline-secondary" data-cml="plusRes"><i class="bi bi-chevron-down" aria-hidden="true"></i> Voir les ' + restant + ' autres</button></div>';
}
function _cmaListeAutres(reste, etat, N) {
  if (!etat.grouper) {
    var vus = etat.plusRes ? reste : reste.slice(0, CMA_LIMITE);
    return '<div class="cml-bloc"><h3>Les autres métiers qui retrouvent le plus de vos choix</h3><div class="metier-cartes-grille">' +
      vus.map(function (m) { return _cmaCarte(m, etat, N, false); }).join('') + '</div>' +
      (!etat.plusRes && reste.length > CMA_LIMITE ? _cmaVoirLesAutres(reste.length - CMA_LIMITE) : '') + '</div>';
  }
  return cmlGrouperParNiveau(reste).map(function (g) {
    var vus = etat.plusRes ? g.metiers : g.metiers.slice(0, CMA_LIMITE_GROUPE);
    return '<div class="cml-bloc"><h3>' + g.titre + ' <span class="cml-pill">' + g.metiers.length + '</span></h3><div class="metier-cartes-grille">' +
      vus.map(function (m) { return _cmaCarte(m, etat, N, false); }).join('') + '</div>' +
      (!etat.plusRes && g.metiers.length > CMA_LIMITE_GROUPE ? _cmaVoirLesAutres(g.metiers.length - CMA_LIMITE_GROUPE) : '') + '</div>';
  }).join('');
}

cmvEnregistrerVue('resultats2', {
  titre: 'Des métiers qui ressemblent à vos choix',
  barre: function () { return { retour: 'actions4' }; },
  rendre: function (etat) {
    var N = _cmaNombreChoix(etat);
    if (N === 0) {
      return cmvEncart('bi-info-circle', 'Vous n’avez encore rien choisi. Revenez aux pages de choix pour indiquer ce qui vous attire.', true) +
        '<button type="button" class="btn btn-primary" data-cml="aller" data-vue="actions1">Choisir mes envies</button>';
    }
    var liste = _cmaListeMetiers(etat).filter(function (m) { return !(etat.masquerConditions && cmaConditionsDemandees(m, etat.choix.conditions).length); });
    var h = _cmaEtapes(5) +
      cmvEncart('bi-compass', 'Ces métiers viennent <b>uniquement de ce que vous avez choisi</b> (' + N + ' choix). Ce sont des pistes à explorer, pas une réponse unique. Le pourcentage est une évaluation, pas une mesure : il montre à quel point un métier retrouve vos choix.') +
      (typeof _synLigneRetenu === 'function' ? _synLigneRetenu(2) : '') +
      _cmaBlocChoix(etat) +
      (cmlEntree2ChoixVaries(_cmaChoixPourMoteur(etat)) ? cmvEncart('bi-info-circle', '<b>Vos choix sont très variés.</b> Beaucoup de métiers ressortent. Gardez ceux qui comptent le plus pour vous afin d’affiner la liste.', true) : '');
    if (!liste.length) {
      return h + cmvEncart('bi-info-circle', 'Aucun métier ne ressort avec ces choix' + (etat.masquerConditions ? ' et ces réglages. Montrez de nouveau les métiers masqués ou modifiez vos choix.' : '. Essayez d’ajouter d’autres choix.'), true);
    }
    var premier = liste[0], reste = liste.slice(1);
    h += _cmaBlocGrouper(etat) +
      '<div class="metier-cartes-grille">' + _cmaCarte(premier, etat, N, true) + '</div>' +
      _cmaListeAutres(reste, etat, N) +
      '<div class="cml-bloc"><h3>Garder mes pistes</h3><p>Pour retrouver vos choix et ces métiers plus tard, ou pour en parler avec un conseiller, gardez-les dans la disquette de l’application. Sans cela, rien n’est conservé.</p>' +
      (etat.gardeChoix
        ? cmvEncart('bi-check2-circle', '<b>Choix gardés.</b> Ils seront dans la disquette quand vous l’enregistrerez : vos choix seulement, les métiers proposés se recalculent à chaque fois.') +
          '<button type="button" class="btn btn-outline-primary" style="min-height:46px" data-cml="garder-choix"><i class="bi bi-x-circle" aria-hidden="true"></i> Ne plus garder mes choix</button></div>'
        : '<button type="button" class="btn btn-outline-primary" style="min-height:46px" data-cml="garder-choix"><i class="bi bi-save" aria-hidden="true"></i> Garder mon résultat</button></div>');
    return h;
  }
});
cmvEnregistrerAction('garder-choix', function () {
  if (typeof cmvGarderChoix === 'function') { return cmvGarderChoix(); }
  if (typeof afficherToast === 'function') { afficherToast('La sauvegarde dans la disquette arrive bientôt.'); }
  return false;
});

// ---------------- Présentation du chemin « Par ce que vous aimez faire » (19/11/2026) : le corps de la page de présentation (index.js, route comprendre-les-metiers-intro-actions) ----------------
function cmvCorpsPresentationActions() {
  return _introBlocSection('&#127919; À quoi sert ce chemin',
      '<p class="mb-0">Vous ne savez pas encore quel métier choisir, mais vous savez ce qui vous plaît, ou ce que vous ne voulez surtout pas. Ce chemin transforme vos envies en métiers à explorer.</p>') +
    _introBlocSection('&#128203; Comment ça se passe', '<ol class="mb-0">' +
      '<li><b>Avec qui ou avec quoi</b> vous verriez-vous travailler : des personnes, des matériels, des animaux.</li>' +
      '<li><b>Ce que vous aimeriez faire</b> : des actions, rangées en familles, chacune expliquée.</li>' +
      '<li><b>Où</b> : les lieux où vous vous verriez travailler.</li>' +
      '<li><b>Ce qui serait facile ou difficile pour vous</b> : des conditions de travail, nuit, week-end, charges, déplacements…</li></ol>' +
      '<p class="cml-note mt-2 mb-0">Le nombre de choix est limité sur chaque page : mieux vaut choisir ce qui vous attire le plus.</p>') +
    _introBlocSection('&#9878;&#65039; Facile ou difficile pour vous',
      '<p class="mb-0">À la dernière page, vous marquez les conditions de travail qui seraient faciles ou difficiles pour vous (nuit, week-end, charges, déplacements…). Cela ne retire aucun métier : vous pouvez, si vous le souhaitez, masquer ceux qui peuvent demander ce qui est difficile pour vous.</p>') +
    _introBlocSection('&#128202; Ce que vous obtenez',
      '<p class="mb-0">Une liste de métiers, avec un pourcentage qui dit à quel point chacun retrouve vos choix. Sur la fiche d’un métier, vous voyez lesquels de vos choix il retrouve. Vous pouvez modifier vos choix à tout moment et voir la liste changer. Vos choix restent tant que vous êtes dans l’application, et vous pouvez les garder dans la disquette.</p>') +
    _introBlocEncart('&#8505;&#65039;', 'Un pourcentage élevé n’est pas une note sur vous : il dit seulement combien de vos choix le métier retrouve.');
}
