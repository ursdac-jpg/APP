/* ============================================================
   Module « Un CV, plusieurs métiers » : PAGE 2 « Les métiers que je vise ».
   - synthèse du CV en lecture seule (produite par le premier passage) ;
   - bandeau « Choisir mon objectif » (portée : tous / colonne de gauche / colonne de droite / un métier) et panneau d'objectif complet
     (sept démarches, type de structure, secteur, contrat, durée, dates, disponibilités, formation visée, champs pour la lettre) ;
   - deux colonnes de cases (10 au plus) : à gauche mon métier appelé autrement (intitulés corrigeables, ajoutables, retirables), à droite
     d'autres métiers qui utilisent mes compétences ;
   - « Chercher des offres pour cette colonne » : une demande COPIÉE vers l'assistant choisi, rien n'est importé (décision de Denis, 2026-10-08).
   Logique pure : logiqueMetiers.js. Constantes de l'application réutilisées (jamais recopiées) : BILAN_TYPES_STRUCTURE, CONTRATS, TEMPS_TRAVAIL,
   ASSISTANTS_IA, departementRessourcesMemorise / memoriserDepartementRessources / oublierDepartementRessources.
   ============================================================ */

// État d'écran de la page (jamais sauvegardé) : panneau d'objectif ouvert, panneau d'offres ouvert, saisie d'un intitulé, intitulé en cours de correction.
var _ucpmUi2 = { objectif: null, offres: null, ecrire: false, edition: null, promptOffres: null, messageCoche: '', dispoLibre: false };

function _ucpmP2Assurer(etat) {
  if (!etat.intitules || !etat.autres) {
    var l = ucpmCreerListes(etat.reponseMetiers);
    etat.intitules = l.intitules;
    etat.autres = l.autres;
  }
}

function _ucpmEsc(s) { return (typeof echapperAttribut === 'function') ? echapperAttribut(s) : String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

// ---------------- Synthèse (lecture seule) ----------------

function _ucpmP2HtmlSynthese(etat) {
  var s = (etat.reponseMetiers && etat.reponseMetiers.synthese) || {};
  var chips = (s.competencesCles || []).map(function (c) {
    return '<span style="display:inline-block;margin:.15rem .25rem .15rem 0;padding:.15rem .6rem;border-radius:999px;border:1px solid var(--border);background:var(--accent-bg-subtle);font-size:.9rem;">' + _ucpmEsc(c) + '</span>';
  }).join('');
  var exps = (s.experiences || []).map(function (e) {
    return '<div class="mb-2"><p class="mb-1"><strong>' + _ucpmEsc(e.intitule) + '</strong></p>' +
      (e.missionsPrincipales.length ? '<ul class="mb-1" style="padding-left:1.25rem;">' + e.missionsPrincipales.map(function (m) { return '<li>' + _ucpmEsc(m) + '</li>'; }).join('') + '</ul>' : '') +
      (e.competencesRetirees.length ? '<p class="small mb-0" style="color:var(--text-muted);">Compétences qu’on en retire : ' + e.competencesRetirees.map(_ucpmEsc).join(', ') + '.</p>' : '') +
      '</div>';
  }).join('');
  return '<div class="cv-section" id="ucpmSynthese">' +
    '<h4>&#128196; Ce que l’assistant a retenu de votre CV</h4>' +
    (s.metier ? '<p class="mb-2"><strong>Votre métier :</strong> ' + _ucpmEsc(s.metier) + '</p>' : '') +
    (chips ? '<p class="mb-1"><strong>Vos compétences clés</strong></p><div class="mb-2">' + chips + '</div>' : '') +
    (exps ? '<details open><summary style="cursor:pointer;font-weight:600;">Vos expériences</summary><div class="mt-2">' + exps + '</div></details>' : '') +
    '<p class="small mb-0 mt-2" style="color:var(--text-muted);">Ces propositions servent uniquement à adapter votre candidature. Elles ne rajoutent aucune expérience à votre CV.</p>' +
    '</div>';
}

// ---------------- Bandeau et panneau d'objectif ----------------

// Encadré coloré : chaque CV peut avoir son objectif (retour de Denis, 2026-10-10).
function _ucpmP2HtmlEncadre() {
  return '<div class="ucpm-encadre" role="note"><i class="bi bi-sliders" aria-hidden="true"></i><p class="mb-0"><strong>Chaque CV peut avoir son propre objectif.</strong> Vous pouvez adapter l’objectif de chaque métier à vos besoins : candidature, stage, formation… Le CV et les lettres en tiennent compte.</p></div>';
}

function _ucpmP2HtmlBandeau(etat) {
  var c = ucpmCompterCoches(etat);
  var sans = ucpmCochesSansObjectif(etat).length;
  var etatTexte = c.total
    ? c.total + ' métier' + (c.total > 1 ? 's' : '') + ' coché' + (c.total > 1 ? 's' : '') + ' sur ' + UCPM_MAX_METIERS + (sans ? ', dont ' + sans + ' sans objectif' : ', tous avec leur objectif')
    : 'Aucun métier coché pour le moment (dix au plus).';
  return '<div class="cv-section" style="background:var(--accent-bg-subtle);border-left:4px solid var(--accent);">' +
    '<p class="mb-1"><strong>&#127919; Votre objectif</strong></p>' +
    '<p class="mb-2">Dites ce que vous cherchez : un emploi, un stage, une alternance, une formation… Il est demandé pour chaque métier coché, car la lettre et la phrase d’accroche ne s’écrivent pas de la même façon pour une candidature spontanée, une offre ou une formation.</p>' +
    '<p class="mb-2"><strong>Vous visez le même objectif pour tous vos CV ?</strong> C’est plus simple de le choisir ici, une seule fois. Sinon, choisissez l’objectif de chaque métier coché, un par un, dans les listes ci-dessous.</p>' +
    '<div class="d-flex flex-wrap gap-2 align-items-center">' +
    '<button type="button" class="btn btn-primary btn-lg" id="btnUcpmChoisirObjectif">Choisir mon objectif</button>' +
    '<span class="small" style="color:var(--text-muted);" id="ucpmCompteurCoches">' + _ucpmEsc(etatTexte) + '</span></div>' +
    (_ucpmUi2.messageCoche ? '<p class="small mb-0 mt-2" style="color:var(--danger);" role="alert">' + _ucpmEsc(_ucpmUi2.messageCoche) + '</p>' : '') +
    '</div>';
}

function _ucpmP2OptionsSelect(liste, valeur) {
  return liste.map(function (x) { return '<option value="' + _ucpmEsc(x) + '"' + (x === valeur ? ' selected' : '') + '>' + _ucpmEsc(x) + '</option>'; }).join('');
}
function _ucpmP2Champ(nom, libelle, valeur, aide, type) {
  return '<div class="mb-2"><label class="form-label mb-1" for="ucpmF_' + nom + '"><strong>' + libelle + '</strong></label>' +
    '<input type="' + (type || 'text') + '" class="form-control" id="ucpmF_' + nom + '" data-ucpm-champ="' + nom + '" value="' + _ucpmEsc(valeur) + '" maxlength="120">' +
    (aide ? '<div class="small" style="color:var(--text-muted);">' + aide + '</div>' : '') + '</div>';
}
function _ucpmP2Cases(nom, libelle, liste, valeurs) {
  // « Tout » : coche ou decoche toutes les valeurs d'un coup (retour de Denis, 2026-10-10) ; il est coche quand elles le sont toutes.
  var toutes = liste.length > 0 && liste.every(function (x) { return valeurs.indexOf(x) !== -1; });
  var caseTout = '<label class="ck" style="display:inline-flex;gap:.4rem;align-items:center;margin:0;"><input type="checkbox" data-ucpm-tout="' + nom + '"' + (toutes ? ' checked' : '') + '> <strong>Tout</strong></label>';
  return '<div class="mb-2"><p class="mb-1"><strong>' + libelle + '</strong></p><div class="d-flex flex-wrap gap-3">' + caseTout +
    liste.map(function (x) {
      return '<label class="ck" style="display:inline-flex;gap:.4rem;align-items:center;margin:0;"><input type="checkbox" data-ucpm-multi="' + nom + '" value="' + _ucpmEsc(x) + '"' + (valeurs.indexOf(x) !== -1 ? ' checked' : '') + '> ' + _ucpmEsc(x) + '</label>';
    }).join('') + '</div></div>';
}

function _ucpmP2HtmlPanneauObjectif(etat) {
  var u = _ucpmUi2.objectif;
  if (!u) { return ''; }
  var b = u.brouillon;
  var un = u.portee === 'un';
  var entree = un ? ucpmTrouverEntree(etat, u.id) : null;
  var html = '<div class="cv-section" id="ucpmPanneauObjectif" style="border:2px solid var(--accent);">' +
    '<div class="d-flex justify-content-between align-items-center mb-2"><h4 class="mb-0">&#127919; Mon objectif</h4>' +
    '<button type="button" class="btn btn-sm btn-outline-secondary" id="btnUcpmFermerObjectif" aria-label="Fermer le panneau">&#10005; Fermer</button></div>';
  // A. Pour quels métiers ?
  if (un && entree) {
    html += '<p class="mb-3"><strong>Pour :</strong> ' + _ucpmEsc(ucpmNomMetier(entree, etat.sexe)) + '</p>';
  } else {
    // Trois gros boutons (le nom de la colonne dedans) : un clic montre le formulaire rempli avec le dernier choix de cette portee ; le dernier choix applique fait foi.
    var portees = [['tous', 'Tous les métiers cochés'], ['gauche', 'Mon métier, appelé autrement'], ['droite', 'D’autres métiers qui utilisent mes compétences']];
    html += '<p class="mb-1"><strong>1. Pour quels métiers ?</strong></p><div class="ucpm-portees mb-3">' + portees.map(function (p) {
      var memo = etat.objectifsPortee && etat.objectifsPortee[p[0]];
      var resume = memo && ucpmObjectifValide(memo) ? ucpmEtiquetteObjectif(memo) : 'Pas encore de choix';
      var actif = u.portee === p[0];
      return '<button type="button" class="ucpm-portee' + (actif ? ' is-actif' : '') + '" data-ucpm-portee="' + p[0] + '" aria-pressed="' + (actif ? 'true' : 'false') + '"><span class="ucpm-portee-titre">' + p[1] + '</span><span class="ucpm-portee-resume">' + _ucpmEsc(resume) + '</span></button>';
    }).join('') + '</div>';
  }
  // B. Pour quel objectif ?
  html += '<p class="mb-1"><strong>' + (un ? '1' : '2') + '. Pour quel objectif ?</strong></p><div class="d-flex flex-wrap gap-2 mb-3">' + UCPM_DEMARCHES.map(function (d) {
    var actif = b.demarche === d.id;
    return '<button type="button" class="btn ' + (actif ? 'btn-primary' : 'btn-outline-secondary') + '" data-ucpm-demarche="' + d.id + '" aria-pressed="' + (actif ? 'true' : 'false') + '" title="' + _ucpmEsc(d.desc) + '">' + _ucpmEsc(d.titre) + '</button>';
  }).join('') + '</div>';
  if (b.demarche) {
    var dem = ucpmDemarche(b.demarche);
    html += '<p class="small" style="color:var(--text-muted);">' + _ucpmEsc(dem.desc) + ' Tout ce qui suit est facultatif : renseignez ce que vous savez.</p>';
    html += '<p class="mb-1"><strong>' + (un ? '2' : '3') + '. Les détails</strong></p>';
    var types = (typeof BILAN_TYPES_STRUCTURE !== 'undefined') ? BILAN_TYPES_STRUCTURE : [];
    html += '<div class="mb-2"><label class="form-label mb-1" for="ucpmF_typeStructure"><strong>Type de structure</strong></label>' +
      '<select class="form-select" id="ucpmF_typeStructure" data-ucpm-champ="typeStructure"><option value="">Je ne sais pas encore</option>' + _ucpmP2OptionsSelect(types, b.typeStructure) + '</select></div>';
    if (b.typeStructure === 'Autre') { html += _ucpmP2Champ('typeStructureAutre', 'Précisez le type de structure', b.typeStructureAutre); }
    // Un métier précis OU un secteur (retours de Denis, 2026-10-10) : si la personne sait déjà quel métier elle vise, elle n'a pas de secteur à donner.
    html += '<div class="mb-2"><p class="mb-1"><strong>Je vise</strong></p><div class="d-flex flex-wrap gap-2 mb-2">' +
      [['metier', 'Un métier précis'], ['secteur', 'Un secteur d’activité']].map(function (c) {
        var actif = b.cible === c[0];
        return '<button type="button" class="jeton' + (actif ? ' is-actif' : '') + '" data-ucpm-cible="' + c[0] + '" aria-pressed="' + (actif ? 'true' : 'false') + '">' + c[1] + '</button>';
      }).join('') + '</div>';
    if (b.cible === 'metier') {
      html += un
        ? '<input type="text" class="form-control" id="ucpmF_metierVise" data-ucpm-champ="metierVise" value="' + _ucpmEsc(b.metierVise) + '" maxlength="80" aria-label="Le métier visé">' +
          '<div class="small" style="color:var(--text-muted);">Le métier de ce CV est déjà écrit : modifiez-le si besoin.</div>'
        : '<p class="small mb-0" style="color:var(--text-muted);">Le métier de chaque CV est repris tel quel : pas besoin de l’écrire ici.</p>';
    } else if (b.cible === 'secteur') {
      var secteurs = (typeof SECTEURS_APP !== 'undefined') ? SECTEURS_APP.map(function (s) { return s.libelle; }) : [];
      if (b.secteur && secteurs.indexOf(b.secteur) === -1) { secteurs.push(b.secteur); }
      html += '<div class="d-flex flex-wrap gap-2" role="group" aria-label="Le secteur d’activité">' + secteurs.map(function (x) {
        var actif = b.secteur === x;
        return '<button type="button" class="jeton' + (actif ? ' is-actif' : '') + '" data-ucpm-secteur="' + _ucpmEsc(x) + '" aria-pressed="' + (actif ? 'true' : 'false') + '">' + _ucpmEsc(x) + '</button>';
      }).join('') + '</div>';
    }
    html += '</div>';
    if (dem.famille === 'emploi') {
      html += _ucpmP2Cases('contrat', 'Contrat', (typeof CONTRATS !== 'undefined') ? CONTRATS : ['CDI', 'CDD'], b.contrat);
      html += _ucpmP2Cases('tempsTravail', 'Temps de travail', (typeof TEMPS_TRAVAIL !== 'undefined') ? TEMPS_TRAVAIL : ['Temps plein', 'Temps partiel'], b.tempsTravail);
    } else {
      html += '<div class="mb-2"><p class="mb-1"><strong>Durée</strong></p><div class="d-flex gap-2"><input type="number" min="1" max="99" class="form-control" style="max-width:7rem;" id="ucpmF_dureeQuantite" data-ucpm-champ="dureeQuantite" value="' + _ucpmEsc(b.dureeQuantite) + '" aria-label="Durée, nombre">' +
        '<select class="form-select" style="max-width:9rem;" id="ucpmF_dureeUnite" data-ucpm-champ="dureeUnite" aria-label="Durée, unité"><option value="">Unité</option>' + _ucpmP2OptionsSelect(UCPM_UNITES_DUREE, b.dureeUnite) + '</select></div></div>';
      html += _ucpmP2Champ('dateDebut', 'Début souhaité', b.dateDebut, 'Par exemple : septembre 2026.');
      html += _ucpmP2Champ('dateFin', 'Fin souhaitée', b.dateFin);
      html += _ucpmP2Champ('heures', 'Heures par semaine', b.heures);
      if (b.demarche === 'alternance' || b.demarche === 'formation') { html += _ucpmP2Champ('formationVisee', 'Formation visée', b.formationVisee); }
    }
    // Champs propres a chaque demarche (decisions de Denis, 2026-10-10) : ils ne partent que dans la demande du CV concerne.
    if (b.demarche === 'reconversion') {
      html += '<div class="mb-2"><p class="mb-1"><strong>Votre ancien métier ou secteur</strong> <span class="ucpm-facultatif">(facultatif)</span></p><div class="d-flex flex-wrap gap-2 mb-2">' +
        [['metier', 'Un métier'], ['secteur', 'Un secteur d’activité']].map(function (c) {
          var actif = (b.ancienType || 'metier') === c[0];
          return '<button type="button" class="jeton' + (actif ? ' is-actif' : '') + '" data-ucpm-ancien="' + c[0] + '" aria-pressed="' + (actif ? 'true' : 'false') + '">' + c[1] + '</button>';
        }).join('') + '</div>' +
        '<input type="text" class="form-control" id="ucpmF_ancienValeur" data-ucpm-champ="ancienValeur" value="' + _ucpmEsc(b.ancienValeur) + '" maxlength="80" aria-label="Votre ancien métier ou secteur" placeholder="' + ((b.ancienType === 'secteur') ? 'Par exemple : bâtiment' : 'Par exemple : plaquiste') + '">' +
        '<div class="small" style="color:var(--text-muted);">Le nouveau métier est celui du CV. Cela aide l’assistant à valoriser ce que vous avez déjà fait.</div></div>';
    }
    if (b.demarche === 'stage' || b.demarche === 'alternance' || b.demarche === 'formation') {
      html += _ucpmP2Champ('organisme', b.demarche === 'formation' ? 'Centre formateur' : (b.demarche === 'alternance' ? 'Organisme ou centre de formation' : 'Organisme de formation'), b.organisme);
    }
    if (b.demarche === 'pmsmp') {
      html += '<div class="mb-2"><p class="mb-1"><strong>Objectif de cette immersion</strong> <span class="ucpm-facultatif">(plusieurs choix possibles)</span></p><div class="d-flex flex-wrap gap-2" role="group" aria-label="Objectif de l’immersion">' +
        UCPM_OBJECTIFS_PMSMP.map(function (o) {
          var actif = b.objectifsPmsmp.indexOf(o) !== -1;
          return '<button type="button" class="jeton' + (actif ? ' is-actif' : '') + '" data-ucpm-pmsmp="' + _ucpmEsc(o) + '" aria-pressed="' + (actif ? 'true' : 'false') + '">' + _ucpmEsc(o) + '</button>';
        }).join('') + '</div></div>' +
        _ucpmP2Champ('objectifPmsmpAutre', 'Autre objectif (facultatif)', b.objectifPmsmpAutre);
    }
    // Disponibilité : des choix à cliquer plutôt que du texte à écrire (mêmes pastilles que « Mon projet »), une date précise seulement si la personne le veut.
    var dispos = (typeof DISPONIBILITES !== 'undefined') ? DISPONIBILITES : ['Immédiatement', 'Sous 15 jours', 'Dans un mois', 'Sans préférence'];
    var datePrecise = _ucpmUi2.dispoLibre || (!!b.disponibleA && dispos.indexOf(b.disponibleA) === -1);
    html += '<div class="mb-2"><p class="mb-1"><strong>Disponible à partir de</strong></p><div class="d-flex flex-wrap gap-2">' +
      dispos.map(function (d) {
        var actif = b.disponibleA === d;
        return '<button type="button" class="jeton' + (actif ? ' is-actif' : '') + '" data-ucpm-dispo="' + _ucpmEsc(d) + '" aria-pressed="' + (actif ? 'true' : 'false') + '">' + _ucpmEsc(d) + '</button>';
      }).join('') +
      '<button type="button" class="jeton' + (datePrecise ? ' is-actif' : '') + '" data-ucpm-dispo-libre aria-pressed="' + (datePrecise ? 'true' : 'false') + '">Une date précise</button></div>' +
      (datePrecise ? '<input type="text" class="form-control mt-2" id="ucpmF_disponibleA" data-ucpm-champ="disponibleA" value="' + _ucpmEsc(dispos.indexOf(b.disponibleA) === -1 ? b.disponibleA : '') + '" maxlength="60" placeholder="Par exemple : septembre 2026" aria-label="Date de disponibilité">' : '') + '</div>';
    html += '<div class="mb-2"><label class="form-label mb-1" for="ucpmF_autreChose"><strong>Autre chose à dire dans la lettre</strong> (facultatif)</label>' +
      '<textarea class="form-control" rows="2" maxlength="400" id="ucpmF_autreChose" data-ucpm-champ="autreChose">' + _ucpmEsc(b.autreChose) + '</textarea>' +
      '<div class="small" style="color:var(--text-muted);">Une ou deux phrases avec vos mots. Elles seront reprises dans la lettre, sans rien inventer autour.</div></div>';
    if (un && UCPM_DEMARCHES_AVEC_EMPLOYEUR.indexOf(b.demarche) !== -1) {
      html += '<p class="mb-1 mt-3"><strong>Si vous les connaissez</strong> (facultatif)</p>';
      html += _ucpmP2Champ('employeur', 'Nom de l’employeur', b.employeur);
      html += '<div class="mb-2"><p class="mb-1"><strong>Recruteur ou recruteuse</strong></p><div class="d-flex gap-2">' +
        '<select class="form-select" style="max-width:9rem;" id="ucpmF_civiliteRecruteur" data-ucpm-champ="civiliteRecruteur" aria-label="Civilité">' +
        UCPM_CIVILITES_RECRUTEUR.map(function (c) { return '<option value="' + c + '"' + (c === b.civiliteRecruteur ? ' selected' : '') + '>' + (c || 'Civilité') + '</option>'; }).join('') + '</select>' +
        '<input type="text" class="form-control" id="ucpmF_nomRecruteur" data-ucpm-champ="nomRecruteur" value="' + _ucpmEsc(b.nomRecruteur) + '" maxlength="80" aria-label="Nom du recruteur"></div></div>';
      if (b.demarche === 'offre') {
        html += _ucpmP2Champ('posteOffre', 'Intitulé du poste', b.posteOffre);
        html += '<div class="mb-2"><label class="form-label mb-1" for="ucpmF_texteOffre"><strong>Lien ou texte de l’offre</strong></label>' +
          '<textarea class="form-control" rows="3" maxlength="1500" id="ucpmF_texteOffre" data-ucpm-champ="texteOffre">' + _ucpmEsc(b.texteOffre) + '</textarea>' +
          '<div class="small" style="color:var(--text-muted);">Quelques lignes suffisent : les points qui demandent le plus.</div></div>';
      }
    }
  }
  html += '<div class="d-flex gap-2 mt-3"><button type="button" class="btn btn-primary" id="btnUcpmAppliquerObjectif"' + (b.demarche ? '' : ' disabled title="Choisissez d’abord un objectif."') + '>Appliquer</button>' +
    '<button type="button" class="btn btn-outline-secondary" id="btnUcpmAnnulerObjectif">Annuler</button></div>';
  html += '<p class="small mb-0 mt-2" style="color:var(--text-muted);">Aucun nom d’entreprise n’est demandé sauf pour un seul métier à la fois. Rien n’est envoyé avant que vous le décidiez.</p>';
  return html + '</div>';
}

// Lit les champs du panneau dans le brouillon (appelé à chaque saisie, pour ne rien perdre quand la page se redessine).
function _ucpmP2LireChamps() {
  var u = _ucpmUi2.objectif;
  if (!u) { return; }
  var b = u.brouillon;
  Array.prototype.forEach.call(document.querySelectorAll('#ucpmPanneauObjectif [data-ucpm-champ]'), function (el) { b[el.getAttribute('data-ucpm-champ')] = el.value; });
  ['contrat', 'tempsTravail'].forEach(function (nom) {
    var els = document.querySelectorAll('#ucpmPanneauObjectif [data-ucpm-multi="' + nom + '"]');
    if (els.length) { b[nom] = Array.prototype.filter.call(els, function (e) { return e.checked; }).map(function (e) { return e.value; }); }
  });
  var radio = document.querySelector('#ucpmPanneauObjectif input[name="ucpmPortee"]:checked');
  if (radio) { u.portee = radio.value; }
}

function _ucpmP2OuvrirObjectif(etat, portee, id) {
  var brouillon = ucpmObjectifVide('');
  if (portee === 'un') {
    var e = ucpmTrouverEntree(etat, id);
    if (e && e.objectif) { brouillon = ucpmNormaliserObjectif(e.objectif); }
  } else if (etat.objectifsPortee && etat.objectifsPortee[portee || 'tous'] && ucpmObjectifValide(etat.objectifsPortee[portee || 'tous'])) {
    brouillon = ucpmNormaliserObjectif(etat.objectifsPortee[portee || 'tous']);   // le panneau s'ouvre avec le dernier choix de cette portee
  }
  _ucpmUi2.dispoLibre = false;
  _ucpmUi2.objectif = { portee: portee || 'tous', id: id || null, brouillon: brouillon };
  _ucpmUi2.messageCoche = '';
  ucpmRendrePage();
  var p = document.getElementById('ucpmPanneauObjectif');
  if (p && p.scrollIntoView) { p.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
}

// ---------------- Colonnes ----------------

function _ucpmP2HtmlEntree(etat, e, cote) {
  var nom = _ucpmEsc(ucpmNomMetier(e, etat.sexe));
  var enEdition = _ucpmUi2.edition === e.id;
  var h = '<div data-ucpm-entree="' + e.id + '" style="border:1px solid ' + (e.coche ? 'var(--accent)' : 'var(--border)') + ';border-radius:10px;padding:.55rem .7rem;margin-bottom:.5rem;' + (e.coche ? 'background:var(--accent-bg-subtle);' : '') + '">';
  if (enEdition) {
    h += '<div class="d-flex gap-2 align-items-center"><input type="text" class="form-control" id="ucpmEditionIntitule" maxlength="80" value="' + _ucpmEsc(e.masculin) + '" aria-label="Intitulé">' +
      '<button type="button" class="btn btn-primary btn-sm" data-ucpm-valider-edition="' + e.id + '">Valider</button>' +
      '<button type="button" class="btn btn-outline-secondary btn-sm" data-ucpm-annuler-edition>Annuler</button></div>';
  } else {
    h += '<label style="display:flex;gap:.55rem;align-items:flex-start;margin:0;cursor:pointer;"><input type="checkbox" style="margin-top:.3rem;" data-ucpm-coche="' + e.id + '"' + (e.coche ? ' checked' : '') + '> <span><strong>' + nom + '</strong>' +
      (e.source === 'perso' ? ' <span class="badge bg-secondary">Écrit par vous</span>' : '') +
      (e.source === 'corrige' ? ' <span class="badge bg-secondary">Corrigé par vous</span>' : '') + '</span></label>';
    var retrouve = Array.isArray(e.retrouveDansLeCV) ? e.retrouveDansLeCV : (e.retrouveDansLeCV ? [e.retrouveDansLeCV] : []);
    if (retrouve.length && e.source === 'assistant') {
      h += '<p class="small mb-0 mt-1" style="color:var(--text-muted);margin-left:1.6rem;">Dans votre CV : ' + retrouve.map(_ucpmEsc).join(' ; ') + '</p>';
    }
    if (e.aVerifier) { h += '<p class="small mb-0 mt-1" style="margin-left:1.6rem;"><span class="badge" style="background:var(--warning-bg-subtle);color:var(--warning-strong);border:1px solid var(--warning-border);">À vérifier</span> ' + _ucpmEsc(e.aVerifier) + '</p>'; }
    if (e.coche) {
      var etiquette = ucpmEtiquetteObjectif(e.objectif);
      h += '<div class="mt-2" style="margin-left:1.6rem;">' + (etiquette
        ? '<span class="small"><strong>Objectif :</strong> ' + _ucpmEsc(etiquette) + '</span> <button type="button" class="btn btn-outline-secondary btn-sm ms-1" data-ucpm-objectif-un="' + e.id + '">Modifier</button>'
        : '<button type="button" class="btn btn-outline-primary btn-sm" data-ucpm-objectif-un="' + e.id + '">Choisir l’objectif de ce métier</button>') + '</div>';
    }
    if (cote === 'gauche') {
      h += '<div class="mt-2" style="margin-left:1.6rem;"><button type="button" class="btn btn-outline-secondary btn-sm" data-ucpm-modifier-intitule="' + e.id + '" aria-label="Modifier cet intitulé" title="Modifier cet intitulé"><i class="bi bi-pencil"></i> Modifier cet intitulé</button> ' +
        '<button type="button" class="btn btn-outline-secondary btn-sm" data-ucpm-retirer-intitule="' + e.id + '" aria-label="Retirer cet intitulé" title="Retirer cet intitulé"><i class="bi bi-x-lg"></i> Retirer cet intitulé</button></div>';
    }
  }
  return h + '</div>';
}

function _ucpmP2HtmlColonne(etat, cote) {
  var liste = cote === 'gauche' ? etat.intitules : etat.autres;
  var ecrits = cote === 'gauche' ? liste.filter(function (e) { return e.source === 'perso'; }).length : 0;
  var identifies = liste.length - ecrits;
  var titre = cote === 'gauche'
    ? 'Mon métier, appelé autrement (' + identifies + ' identifié' + (identifies > 1 ? 's' : '') + (ecrits ? ', ' + ecrits + ' écrit' + (ecrits > 1 ? 's' : '') + ' par vous' : '') + ')'
    : 'D’autres métiers qui utilisent mes compétences (' + liste.length + ')';
  var sous = cote === 'gauche'
    ? 'Le même travail, avec un autre nom dans les annonces. Vous pouvez corriger un nom ou écrire le vôtre : vous connaissez votre métier.'
    : 'Des métiers différents du vôtre, qui reprennent ce que vous savez déjà faire. Ils vous sont seulement proposés : vous décidez.';
  var coches = liste.filter(function (e) { return e.coche; }).length;
  var h = '<div class="cv-section" style="margin:0;" data-ucpm-colonne="' + cote + '"><h4>' + (cote === 'gauche' ? '&#128221; ' : '&#129517; ') + _ucpmEsc(titre) + '</h4><p class="small" style="color:var(--text-muted);">' + sous + '</p>';
  h += liste.map(function (e) { return _ucpmP2HtmlEntree(etat, e, cote); }).join('') || '<p class="small" style="color:var(--text-muted);">Aucune proposition dans cette colonne.</p>';
  if (cote === 'gauche') {
    if (_ucpmUi2.ecrire) {
      h += '<div class="d-flex gap-2 align-items-center mt-2"><input type="text" class="form-control" id="ucpmNouvelIntitule" maxlength="80" placeholder="Votre intitulé" aria-label="Votre intitulé">' +
        '<button type="button" class="btn btn-primary btn-sm" id="btnUcpmAjouterIntitule">Ajouter</button>' +
        '<button type="button" class="btn btn-outline-secondary btn-sm" id="btnUcpmFermerEcrire">Fermer</button></div><div class="small mt-1" id="ucpmMessageIntitule" style="color:var(--danger);" role="alert"></div>';
    } else {
      h += '<button type="button" class="btn btn-outline-secondary mt-2" id="btnUcpmEcrire">&#9998; Écrire mon propre intitulé</button>';
    }
  }
  return h + '</div>';
}

// Rubrique d'offres de CHAQUE colonne, juste sous sa liste (retour de Denis, 2026-10-10 : une seule rubrique en bas obligeait a descendre quand une colonne est plus longue).
function _ucpmP2HtmlRubriqueOffres(etat, cote) {
  var n = _ucpmP2CocheesColonne(etat, cote).length;
  var actif = _ucpmUi2.offres && _ucpmUi2.offres.cote === cote;
  var libelle = cote === 'gauche' ? 'Offres pour mon métier, appelé autrement' : 'Offres pour d’autres métiers';
  var bouton = '<button type="button" class="btn ' + (actif ? 'btn-primary' : 'btn-outline-primary') + '" data-ucpm-offres="' + cote + '"' + (n ? '' : ' disabled title="Cochez au moins un métier dans cette colonne."') + '>' +
    '<i class="bi bi-search"></i> ' + libelle + (n ? ' (' + n + ' coché' + (n > 1 ? 's' : '') + ')' : '') + '</button>';
  return '<div class="cv-section mt-3" id="ucpmRubriqueOffres_' + cote + '" style="border:2px dashed var(--accent);">' +
    '<h4>&#128269; Chercher des offres d’emploi (facultatif)</h4>' +
    '<p class="mb-2">Si vous le souhaitez, vous pouvez aller voir s’il existe des offres d’emploi pour les métiers que vous avez cochés dans cette colonne. L’application vous prépare la demande et ouvre l’assistant en ligne de votre choix. Elle ne reprend rien de ce qu’il vous répond : c’est un repère, vous restez libre d’en faire ce que vous voulez.</p>' +
    '<div class="d-flex flex-wrap gap-2">' + bouton + '</div>' +
    (_ucpmUi2.offres ? _ucpmP2PanneauOffresColonne(etat, cote) : '') +
    '</div>';
}

// ---------------- Chercher des offres (une demande copiée, rien n'est importé) ----------------
// Panneau et fonctions PARTAGÉS par la page 2 (une colonne) et la page 7 (métiers cochés de la fin) : une seule implémentation (règle « une source de vérité »).
// `cochees` = les entrées à chercher ; `ui` = l'objet qui garde l'état d'écran du panneau : { offres : { assistant } ou null, promptOffres : texte du prompt ou null }.

// Peut-on copier la demande ? { ok, raison } : des métiers cochés, chacun avec son objectif, et un département.
function ucpmOffresPret(etat, cochees) {
  var code = (typeof departementRessourcesMemorise === 'function') ? departementRessourcesMemorise() : null;
  if (!cochees.length) { return { ok: false, raison: 'Cochez un métier.' }; }
  if (cochees.some(function (e) { return !ucpmObjectifValide(e.objectif); })) { return { ok: false, raison: 'Choisissez d’abord les objectifs.' }; }
  if (!ucpmNomDepartement(code, etat.departementLibre)) { return { ok: false, raison: 'Indiquez votre département.' }; }
  return { ok: true, raison: '' };
}

// opt = { libelle : texte au-dessus de la liste, attributObjectif : attribut du bouton « Choisir mon objectif » (vide : pas de bouton, comme à la page 7) }
function ucpmHtmlPanneauOffres(etat, cochees, ui, opt) {
  var u = ui.offres;
  if (!u) { return ''; }
  opt = opt || {};
  var sans = cochees.filter(function (e) { return !ucpmObjectifValide(e.objectif); });
  var code = (typeof departementRessourcesMemorise === 'function') ? departementRessourcesMemorise() : null;
  var nomDep = ucpmNomDepartement(code, etat.departementLibre);
  var h = '<div class="mt-2 p-3" id="ucpmPanneauOffres" style="border:1px solid var(--accent);border-radius:10px;background:var(--bg-card);">' +
    '<div class="d-flex justify-content-between align-items-center mb-2"><strong>&#128269; Chercher des offres</strong>' +
    '<button type="button" class="btn btn-sm btn-outline-secondary" id="btnUcpmFermerOffres" aria-label="Fermer">&#10005;</button></div>';
  h += '<p class="small mb-1"><strong>' + (opt.libelle || 'Les métiers cochés et leur objectif') + '</strong> (seuls ceux-là sont cherchés) :</p><ul class="small" style="padding-left:1.25rem;">' +
    cochees.map(function (e) {
      return '<li>' + _ucpmEsc(ucpmNomMetier(e, etat.sexe)) + ' : ' + (ucpmObjectifValide(e.objectif) ? _ucpmEsc(ucpmEtiquetteObjectif(e.objectif)) : '<span style="color:var(--danger);">objectif à choisir</span>') + '</li>';
    }).join('') + '</ul>';
  if (sans.length) {
    h += '<p class="small" style="color:var(--danger);">Choisissez d’abord l’objectif de chaque métier coché : sans lui, l’assistant ne sait pas s’il faut chercher des emplois, des stages, des alternances ou des formations.</p>' +
      (opt.attributObjectif ? '<button type="button" class="btn btn-outline-primary btn-sm mb-2" ' + opt.attributObjectif + '>Choisir mon objectif</button>' : '');
  }
  // Département : mécanisme existant (24, 87, ailleurs) + champ libre pour « ailleurs ».
  h += '<div class="mb-2"><p class="mb-1 small"><strong>Département</strong></p>';
  if (!code) {
    h += '<div class="d-flex flex-wrap gap-2"><button type="button" class="btn btn-outline-secondary btn-sm" data-ucpm-dep="24">Dordogne (24)</button>' +
      '<button type="button" class="btn btn-outline-secondary btn-sm" data-ucpm-dep="87">Haute-Vienne (87)</button>' +
      '<button type="button" class="btn btn-outline-secondary btn-sm" data-ucpm-dep="ailleurs">Un autre département</button></div>';
  } else if (code === 'ailleurs') {
    h += '<div class="d-flex gap-2 align-items-center"><input type="text" class="form-control form-control-sm" id="ucpmDepLibre" maxlength="60" placeholder="Votre département ou votre ville" value="' + _ucpmEsc(etat.departementLibre) + '" aria-label="Votre département ou votre ville">' +
      '<button type="button" class="btn btn-outline-secondary btn-sm" data-ucpm-changer-dep>Changer</button></div>';
  } else {
    h += '<span class="small">' + _ucpmEsc(nomDep) + '</span> <button type="button" class="btn btn-outline-secondary btn-sm ms-1" data-ucpm-changer-dep>Changer</button>';
  }
  h += '</div>';
  // Choix de l'assistant : ChatGPT d'abord (sans compte) ; les autres demandent un compte ; Perplexity s'utilise gratuitement en créant un compte.
  var assistants = (typeof ASSISTANTS_IA !== 'undefined') ? ASSISTANTS_IA.slice() : [];
  assistants.sort(function (a, b) { return (a.id === 'chatgpt' ? 0 : 1) - (b.id === 'chatgpt' ? 0 : 1); });
  var choisi = u.assistant || 'chatgpt';
  h += '<div class="mb-2"><label class="form-label mb-1 small" for="ucpmChoixAssistantOffres"><strong>Assistant en ligne</strong></label>' +
    '<select class="form-select form-select-sm" id="ucpmChoixAssistantOffres">' + assistants.map(function (a) {
      var note = a.id === 'chatgpt' ? ' (sans compte)' : (a.id === 'perplexity' ? ' (s’utilise gratuitement en créant un compte)' : ' (avec une connexion)');
      return '<option value="' + a.id + '"' + (a.id === choisi ? ' selected' : '') + '>' + _ucpmEsc(a.nom + note) + '</option>';
    }).join('') + '</select>';
  if (choisi === 'chatgpt') {
    h += '<p class="small mb-0 mt-1" style="color:var(--text-strong);"><strong>Avec ChatGPT :</strong> activez d’abord l’option de recherche sur le web, sinon il répondra sans consulter les offres du moment.</p>';
  }
  h += '</div>';
  var pret = ucpmOffresPret(etat, cochees);
  h += '<button type="button" class="btn btn-primary" id="btnUcpmCopierOffres"' + (pret.ok ? '' : ' disabled title="' + _ucpmEsc(pret.raison) + '"') + '>Copier ma demande et ouvrir l’assistant</button>';
  h += '<p class="small mb-0 mt-2" style="color:var(--text-muted);">Un message vous expliquera, juste avant, ce que vous allez trouver et ce que l’application fait (et ne fait pas) de la réponse.</p></div>';
  return h;
}

function ucpmLancerOffres(etat, cochees, ui) {
  if (!ui.offres) { return; }
  var code = departementRessourcesMemorise();
  var dep = ucpmNomDepartement(code, etat.departementLibre);
  var sel = document.getElementById('ucpmChoixAssistantOffres');
  var assistant = (typeof ASSISTANTS_IA !== 'undefined') ? ASSISTANTS_IA.filter(function (a) { return a.id === (sel ? sel.value : 'chatgpt'); })[0] : null;
  if (!assistant || !cochees.length || !dep) { return; }
  var texte = ui.promptOffres ? ucpmConstruireDemandeOffres(ui.promptOffres, cochees, dep, ucpmDateEnTexte(new Date()), etat.sexe) : '';
  var message = UCPM_AVERTISSEMENT_OFFRES.map(function (p) { return _ucpmEsc(p); }).join('</p><p>');
  confirmerAction('Avant d’ouvrir l’assistant', message, 'J’ai compris, copier ma demande', 'btn-primary', function () {
    var aviser = function () {
      if (typeof afficherToast === 'function') {
        afficherToast('Votre demande est copiée. Dans ' + _ucpmEsc(assistant.nom) + ', collez-la (Ctrl + V) puis appuyez sur Entrée.' + (assistant.id === 'chatgpt' ? ' Pensez à activer la recherche sur le web.' : ''), 9000);
      }
    };
    var finir = function (t) {
      if (typeof copierTexteVersPressePapier === 'function') { copierTexteVersPressePapier(t); }
      var fen = window.open(assistant.url, '_blank');
      if (!fen && typeof afficherToast === 'function') {
        afficherToast('Votre demande est copiée, mais le navigateur a bloqué l’ouverture : ouvrez ' + _ucpmEsc(assistant.nom) + ' vous-même, puis collez-la.', 9000);
      } else { aviser(); }
      if (typeof trackEvenement === 'function') { trackEvenement('ucpm_offres_copiees', { assistant: assistant.id, metiers: cochees.length }); }
    };
    if (texte) { finir(texte); return; }
    ucpmChargerPrompt('ucpm-offres', 'ucpm-offres.md').then(function (modele) {
      ui.promptOffres = modele;
      finir(ucpmConstruireDemandeOffres(modele, cochees, dep, ucpmDateEnTexte(new Date()), etat.sexe));
    }).catch(function () {
      if (typeof afficherToast === 'function') { afficherToast('La demande n’a pas pu être préparée. Merci de réessayer dans un instant.', 6000); }
    });
  }, 'Annuler', null, 'btn-outline-secondary');
}

// Câble les contrôles du panneau (fermer, département, assistant, copie). lireCochees : function () -> entrées à chercher ; rerendre : redessine la page.
function ucpmCablerPanneauOffres(etat, ui, lireCochees, rerendre) {
  var $ = function (sel) { return document.querySelector(sel); };
  var $$ = function (sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); };
  var fo = $('#btnUcpmFermerOffres'); if (fo) { fo.addEventListener('click', function () { ui.offres = null; rerendre(); }); }
  $$('[data-ucpm-dep]', function (el) {
    el.addEventListener('click', function () {
      if (typeof memoriserDepartementRessources === 'function') { memoriserDepartementRessources(el.getAttribute('data-ucpm-dep')); }
      rerendre();
    });
  });
  $$('[data-ucpm-changer-dep]', function (el) { el.addEventListener('click', function () { if (typeof oublierDepartementRessources === 'function') { oublierDepartementRessources(); } rerendre(); }); });
  var libre = $('#ucpmDepLibre');
  if (libre) {
    libre.addEventListener('input', function () {
      etat.departementLibre = libre.value;
      // Le bouton « Copier » s'active des que le champ est rempli, sans redessiner la page (sinon le clic suivant serait perdu).
      var b = document.getElementById('btnUcpmCopierOffres');
      if (b && ui.offres) {
        var pret = ucpmOffresPret(etat, lireCochees());
        b.disabled = !pret.ok;
        if (pret.ok) { b.removeAttribute('title'); } else { b.setAttribute('title', pret.raison); }
        if (pret.ok && !b.getAttribute('data-cable')) { b.setAttribute('data-cable', '1'); b.addEventListener('click', function () { ucpmLancerOffres(etat, lireCochees(), ui); }); }
      }
    });
  }
  var choixA = $('#ucpmChoixAssistantOffres');
  if (choixA) { choixA.addEventListener('change', function () { if (ui.offres) { ui.offres.assistant = choixA.value; } rerendre(); }); }
  var copier = $('#btnUcpmCopierOffres');
  if (copier && !copier.disabled) { copier.setAttribute('data-cable', '1'); copier.addEventListener('click', function () { ucpmLancerOffres(etat, lireCochees(), ui); }); }
}

// Les métiers cochés d'une colonne de la page 2 (le panneau de la page 2 ne cherche que ceux-là).
function _ucpmP2CocheesColonne(etat, cote) {
  var liste = cote === 'gauche' ? etat.intitules : etat.autres;
  return liste.filter(function (e) { return e.coche; });
}

function _ucpmP2PanneauOffresColonne(etat, cote) {
  var u = _ucpmUi2.offres;
  if (!u || u.cote !== cote) { return ''; }
  return ucpmHtmlPanneauOffres(etat, _ucpmP2CocheesColonne(etat, cote), _ucpmUi2, {
    libelle: 'Les métiers cochés de cette colonne et leur objectif',
    attributObjectif: 'data-ucpm-objectif-colonne="' + cote + '"'
  });
}

// ---------------- Rendu et câblage de la page ----------------

function _ucpmP2Rendre(etat) {
  _ucpmP2Assurer(etat);
  return _ucpmP2HtmlSynthese(etat) + _ucpmP2HtmlEncadre() + _ucpmP2HtmlBandeau(etat) + _ucpmP2HtmlPanneauObjectif(etat) +
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:1rem;align-items:start;">' +
    '<div>' + _ucpmP2HtmlColonne(etat, 'gauche') + _ucpmP2HtmlRubriqueOffres(etat, 'gauche') + '</div>' +
    '<div>' + _ucpmP2HtmlColonne(etat, 'droite') + _ucpmP2HtmlRubriqueOffres(etat, 'droite') + '</div></div>';
}

function _ucpmP2Cabler(etat) {
  var $ = function (sel) { return document.querySelector(sel); };
  var $$ = function (sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); };

  // Cases à cocher.
  $$('[data-ucpm-coche]', function (el) {
    el.addEventListener('change', function () {
      var r = ucpmBasculerCoche(etat, el.getAttribute('data-ucpm-coche'), el.checked);
      _ucpmUi2.messageCoche = r.ok ? '' : (r.raison === 'plein' ? 'Dix métiers au plus : décochez-en un pour en choisir un autre.' : '');
      ucpmRendrePage();
    });
  });

  // Panneau d'objectif.
  var ouvrir = $('#btnUcpmChoisirObjectif');
  if (ouvrir) { ouvrir.addEventListener('click', function () { _ucpmP2OuvrirObjectif(etat, 'tous', null); }); }
  $$('[data-ucpm-objectif-un]', function (el) { el.addEventListener('click', function () { _ucpmP2OuvrirObjectif(etat, 'un', el.getAttribute('data-ucpm-objectif-un')); }); });
  $$('[data-ucpm-objectif-colonne]', function (el) { el.addEventListener('click', function () { _ucpmP2OuvrirObjectif(etat, el.getAttribute('data-ucpm-objectif-colonne'), null); }); });
  var fermer = function () { _ucpmUi2.objectif = null; ucpmRendrePage(); };
  var bf = $('#btnUcpmFermerObjectif'); if (bf) { bf.addEventListener('click', fermer); }
  var ba = $('#btnUcpmAnnulerObjectif'); if (ba) { ba.addEventListener('click', fermer); }
  if (_ucpmUi2.objectif) {
    $$('#ucpmPanneauObjectif [data-ucpm-tout]', function (el) {
      el.addEventListener('change', function () {
        var nom = el.getAttribute('data-ucpm-tout');
        $$('#ucpmPanneauObjectif [data-ucpm-multi="' + nom + '"]', function (c) { c.checked = el.checked; });
        _ucpmP2LireChamps(); ucpmRendrePage();
      });
    });
    $$('#ucpmPanneauObjectif [data-ucpm-champ], #ucpmPanneauObjectif [data-ucpm-multi], #ucpmPanneauObjectif input[name="ucpmPortee"]', function (el) {
      el.addEventListener('input', _ucpmP2LireChamps);
      el.addEventListener('change', function () { _ucpmP2LireChamps(); if (el.hasAttribute('data-ucpm-multi')) { ucpmRendrePage(); } });
    });
    // Choisir un type « Autre » ou changer de démarche modifie les champs affichés : on relit avant de redessiner.
    var typeStr = $('#ucpmF_typeStructure');
    if (typeStr) { typeStr.addEventListener('change', function () { _ucpmP2LireChamps(); ucpmRendrePage(); }); }
    $$('[data-ucpm-demarche]', function (el) {
      el.addEventListener('click', function () {
        _ucpmP2LireChamps();
        _ucpmUi2.objectif.brouillon.demarche = el.getAttribute('data-ucpm-demarche');
        ucpmRendrePage();
      });
    });
    $$('[data-ucpm-cible]', function (el) {
      el.addEventListener('click', function () {
        _ucpmP2LireChamps();
        var u2 = _ucpmUi2.objectif; var b2 = u2.brouillon; var choix = el.getAttribute('data-ucpm-cible');
        b2.cible = choix;
        if (choix === 'metier') {
          b2.secteur = '';
          // Pour un seul métier, son nom est déjà écrit (la personne candidate pour ce métier) ; elle peut le modifier.
          var ent = u2.portee === 'un' ? ucpmTrouverEntree(etat, u2.id) : null;
          if (ent && !b2.metierVise) { b2.metierVise = ucpmNomMetier(ent, etat.sexe); }
        } else { b2.metierVise = ''; }
        ucpmRendrePage();
      });
    });
    $$('[data-ucpm-portee]', function (el) {
      el.addEventListener('click', function () {
        _ucpmP2LireChamps();
        var u3 = _ucpmUi2.objectif; var choix = el.getAttribute('data-ucpm-portee');
        var memo = etat.objectifsPortee && etat.objectifsPortee[choix];
        u3.portee = choix;
        if (memo && ucpmObjectifValide(memo)) { u3.brouillon = ucpmNormaliserObjectif(memo); }   // le formulaire se remplit avec le dernier choix de cette portee
        ucpmRendrePage();
      });
    });
    $$('[data-ucpm-secteur]', function (el) {
      el.addEventListener('click', function () { _ucpmP2LireChamps(); _ucpmUi2.objectif.brouillon.secteur = el.getAttribute('data-ucpm-secteur'); ucpmRendrePage(); });
    });
    $$('[data-ucpm-ancien]', function (el) {
      el.addEventListener('click', function () { _ucpmP2LireChamps(); _ucpmUi2.objectif.brouillon.ancienType = el.getAttribute('data-ucpm-ancien'); ucpmRendrePage(); });
    });
    $$('[data-ucpm-pmsmp]', function (el) {
      el.addEventListener('click', function () {
        _ucpmP2LireChamps();
        var l = _ucpmUi2.objectif.brouillon.objectifsPmsmp; var v = el.getAttribute('data-ucpm-pmsmp'); var i = l.indexOf(v);
        if (i === -1) { l.push(v); } else { l.splice(i, 1); }
        ucpmRendrePage();
      });
    });
    $$('[data-ucpm-dispo]', function (el) {
      el.addEventListener('click', function () { _ucpmP2LireChamps(); _ucpmUi2.objectif.brouillon.disponibleA = el.getAttribute('data-ucpm-dispo'); _ucpmUi2.dispoLibre = false; ucpmRendrePage(); });
    });
    $$('[data-ucpm-dispo-libre]', function (el) {
      el.addEventListener('click', function () {
        _ucpmP2LireChamps();
        var dispos2 = (typeof DISPONIBILITES !== 'undefined') ? DISPONIBILITES : [];
        if (dispos2.indexOf(_ucpmUi2.objectif.brouillon.disponibleA) !== -1) { _ucpmUi2.objectif.brouillon.disponibleA = ''; }
        _ucpmUi2.dispoLibre = true;
        ucpmRendrePage();
      });
    });
    var appliquer = $('#btnUcpmAppliquerObjectif');
    if (appliquer) {
      appliquer.addEventListener('click', function () {
        _ucpmP2LireChamps();
        var u = _ucpmUi2.objectif;
        var r = ucpmAppliquerObjectif(etat, u.portee, u.id, u.brouillon);
        if (!r.ok) { return; }
        _ucpmUi2.objectif = null;
        if (typeof trackEvenement === 'function') { trackEvenement('ucpm_objectif_applique', { portee: u.portee, demarche: u.brouillon.demarche, metiers: r.nb }); }
        // Le message dit ce que la personne voit : les metiers COCHES concernes (retour de Denis, 2026-10-10 : « 14 » alors que 4 etaient coches).
        var nbDit = u.portee === 'un' ? r.nb : r.nbCoches;
        if (typeof afficherToast === 'function') { afficherToast(nbDit ? 'Objectif enregistré pour ' + nbDit + ' métier' + (nbDit > 1 ? 's' : '') + ' coché' + (nbDit > 1 ? 's' : '') + '.' : 'Objectif enregistré. Cochez les métiers qui vous intéressent.', 3500); }
        ucpmRendrePage();
      });
    }
  }

  // Intitulés : écrire le sien, corriger, retirer.
  var ecrire = $('#btnUcpmEcrire'); if (ecrire) { ecrire.addEventListener('click', function () { _ucpmUi2.ecrire = true; ucpmRendrePage(); var c = document.getElementById('ucpmNouvelIntitule'); if (c) { c.focus(); } }); }
  var fe = $('#btnUcpmFermerEcrire'); if (fe) { fe.addEventListener('click', function () { _ucpmUi2.ecrire = false; ucpmRendrePage(); }); }
  var ajouter = $('#btnUcpmAjouterIntitule');
  if (ajouter) {
    var faireAjout = function () {
      var champ = document.getElementById('ucpmNouvelIntitule');
      var r = ucpmAjouterIntitule(etat, champ ? champ.value : '');
      if (r.ok) { _ucpmUi2.ecrire = false; _ucpmUi2.messageCoche = ''; ucpmRendrePage(); return; }
      var msg = document.getElementById('ucpmMessageIntitule');
      if (msg) { msg.textContent = r.raison === 'doublon' ? 'Cet intitulé est déjà dans la liste.' : (r.raison === 'trop-long' ? 'Cet intitulé est trop long (80 signes au plus).' : 'Écrivez un intitulé.'); }
    };
    ajouter.addEventListener('click', faireAjout);
    var champ = document.getElementById('ucpmNouvelIntitule');
    if (champ) { champ.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') { ev.preventDefault(); faireAjout(); } }); }
  }
  $$('[data-ucpm-modifier-intitule]', function (el) { el.addEventListener('click', function () { _ucpmUi2.edition = el.getAttribute('data-ucpm-modifier-intitule'); ucpmRendrePage(); var c = document.getElementById('ucpmEditionIntitule'); if (c) { c.focus(); c.select(); } }); });
  $$('[data-ucpm-annuler-edition]', function (el) { el.addEventListener('click', function () { _ucpmUi2.edition = null; ucpmRendrePage(); }); });
  $$('[data-ucpm-valider-edition]', function (el) {
    el.addEventListener('click', function () {
      var c = document.getElementById('ucpmEditionIntitule');
      var r = ucpmCorrigerIntitule(etat, el.getAttribute('data-ucpm-valider-edition'), c ? c.value : '');
      if (r.ok) { _ucpmUi2.edition = null; ucpmRendrePage(); }
    });
  });
  $$('[data-ucpm-retirer-intitule]', function (el) {
    el.addEventListener('click', function () {
      var id = el.getAttribute('data-ucpm-retirer-intitule');
      var e = ucpmTrouverEntree(etat, id);
      var faire = function () { ucpmRetirerIntitule(etat, id); ucpmRendrePage(); };
      if (e && e.coche && typeof confirmerAction === 'function') {
        confirmerAction('Retirer cet intitulé ?', 'Il sera retiré de la liste, avec l’objectif que vous lui aviez donné.', 'Retirer', 'btn-danger', faire);
      } else { faire(); }
    });
  });

  // Recherche d'offres.
  $$('[data-ucpm-offres]', function (el) {
    el.addEventListener('click', function () {
      var cote = el.getAttribute('data-ucpm-offres');
      _ucpmUi2.offres = (_ucpmUi2.offres && _ucpmUi2.offres.cote === cote) ? null : { cote: cote, assistant: 'chatgpt' };
      if (_ucpmUi2.offres && !_ucpmUi2.promptOffres) {
        ucpmChargerPrompt('ucpm-offres', 'ucpm-offres.md').then(function (m) { _ucpmUi2.promptOffres = m; }).catch(function () { /* rechargé au clic si besoin */ });
      }
      ucpmRendrePage();
    });
  });
  ucpmCablerPanneauOffres(etat, _ucpmUi2, function () { return _ucpmUi2.offres ? _ucpmP2CocheesColonne(etat, _ucpmUi2.offres.cote) : []; }, ucpmRendrePage);
}

ucpmEnregistrerPage(2, {
  rendre: _ucpmP2Rendre,
  cabler: _ucpmP2Cabler,
  libelleContinuer: 'Créer mes CV &#8594;',
  peutContinuer: function (etat) { _ucpmP2Assurer(etat); return ucpmPeutCreerCV(etat).ok; },
  raisonBlocage: function (etat) { _ucpmP2Assurer(etat); return ucpmPeutCreerCV(etat).raison; },
  continuer: function () { _ucpmUi2.objectif = null; _ucpmUi2.offres = null; ucpmAllerPage(3); }
});
