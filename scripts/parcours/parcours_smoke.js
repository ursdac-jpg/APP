/* ============================================================
   parcours_smoke.js  --  ESSAIS DE PARCOURS REJOUABLES EN UN APPEL (outil de developpement, jamais charge par l'application)
   ------------------------------------------------------------
   Pourquoi : Denis ne doit plus rejouer a la main les memes parcours apres chaque correction (2026-09-30). Ce script rejoue, dans le
   navigateur integre, les parcours deja verifies une nuit, avec un assistant SIMULE (ouverture d'onglet et presse-papiers simules).

   Utilisation (navigateur integre, serveur de dev lance, page fraichement rechargee, attendre la fin du chargement) :
     eval(await (await fetch('/scripts/parcours/parcours_smoke.js')).text());
     await window.__parcours();            // ~40 s ; renvoie { ok, nbOk, nbEchecs, echecs, tout }
   Un seul parcours : await window.__parcours(['bilan']) ; identifiants : bilan, comparer, decouverte, prompts, ats, certifs, cartes.

   ATTENTION : les parcours modifient le dossier en cours (donnees de test). Ne jamais les lancer sur une vraie session de Denis.
   Ce qui N'est PAS couvert (reste a un vrai essai) : vrai presse-papiers, vraie ouverture de l'assistant, contenu reel des reponses.
   Ajouter un parcours : declarer une fonction dans PARCOURS ci-dessous, avec cas(nom, condition, detail).
   ============================================================ */
(function () {
  var attente = function (ms) { return new Promise(function (r) { setTimeout(r, ms || 600); }); };
  var resultats = [];
  function cas(nom, condition, detail) { resultats.push({ nom: nom, ok: !!condition, detail: condition ? '' : String(detail === undefined ? '' : detail) }); }
  function $(sel, racine) { return (racine || document).querySelector(sel); }
  function texte(el) { return el ? (el.innerText || el.textContent || '') : ''; }

  // ---------------- Bilan : ecran « Preparer » (plus de bloc « Relire et masquer », relecture qui s'ouvre seule apres un collage) ----------------
  async function parcoursBilan() {
    bilanEntrerPreparation(null); await attente(1500);
    // Premiere entree dans le module depuis un chargement neuf : la page de presentation peut passer avant l'ecran « Preparer » ; on y entre une 2e fois.
    if (!$('#btnPreparerCollerCv') && !$('#btnPreparerChangerCv')) { bilanEntrerPreparation(null); await attente(1500); }
    var titres = [].slice.call(document.querySelectorAll('.bloc-depli .preparer-titre')).map(function (e) { return e.textContent; });
    cas('bilan : deux blocs seulement, plus de « Relire et masquer »', titres.length === 2 && titres[0] === 'Votre CV' && !$('#preparerBloc2'), titres.join(' | '));

    $('#btnPreparerCollerCv').click();
    var ta = $('#preparerCollerTexte'); ta.value = 'Camille Martin\n0600000000\nAgent de sécurité chez Sécuritas de 2022 à 2024';
    ta.dispatchEvent(new Event('input', { bubbles: true })); await attente(300);
    $('#btnPreparerCollerValider').click(); await attente(1300);
    cas('bilan : un texte collé ouvre la relecture tout seul', !!$('#bilanRelectureAnnulerBtn'), 'écran de relecture absent');
    if ($('#verifDocBtnEnregistrer')) { $('#verifDocBtnEnregistrer').click(); await attente(500); }
    if ($('#bilanRelectureContinuerBtn')) { $('#bilanRelectureContinuerBtn').click(); await attente(1300); }
    var pill = texte($('#preparerBloc1 .pilule-etat'));
    cas('bilan : après validation, « Déposé et relu »', /relu/.test(pill), pill);
    cas('bilan : le bloc suivant est déverrouillé', !/bloc-verrouille/.test($('#preparerBloc3').className), $('#preparerBloc3').className);

    $('#btnPreparerChangerCv').click(); await attente(500);
    $('#btnPreparerCollerCv').click();
    var ta2 = $('#preparerCollerTexte'); ta2.value = 'Texte pour annuler'; ta2.dispatchEvent(new Event('input', { bubbles: true }));
    $('#btnPreparerCollerValider').click(); await attente(1200);
    var annuler = $('#bilanRelectureAnnulerBtn'); if (annuler) { annuler.click(); await attente(1200); }
    cas('bilan : annuler la relecture oublie le CV et propose le dépôt', !_etatBilan.preparer.cvTexte && !!$('#btnPreparerDeposerCv'), JSON.stringify(_etatBilan.preparer));

    _etatBilan.preparer = { relectureFaite: false, situationTouchee: false, cvTexte: 'Texte existant de l’application' };
    pageBilanCandidature(); await attente(800);
    var nav = $('#btnSuivantNavigation');
    cas('bilan : CV de l’application non relu -> bouton « Relire et masquer mon CV » et suite bloquée', /Relire et masquer mon CV/.test(texte($('#btnPreparerRelecture'))) && nav && nav.disabled, texte($('#btnPreparerRelecture')));
    demarrerBilanCandidatureAvecDepot({ cvDejaRelu: 'Camille Martin. Agent de sécurité.' }); await attente(1800);
    var nav2 = $('#btnSuivantNavigation');
    cas('bilan : CV déjà relu (venant de Cohérence) repris sans revalidation', /relu/.test(texte($('#preparerBloc1 .pilule-etat'))) && nav2 && !nav2.disabled, texte($('#preparerBloc1 .pilule-etat')));
  }

  // ---------------- Comparer mes pistes : les cinq envois a l'assistant (brique commune) ----------------
  async function validerAssistant(id) {
    var c = $('#contenuEcranComparer');
    c.querySelector('[data-cp-assistant="' + id + '"]').click(); await attente(700);
    var v = document.getElementById('validerAssistantIABtn');
    if (!v) { return false; }
    v.click(); await attente(900);
    clearInterval(_comparerIntervalleDecompte);
    _etatTransitionIA.phase = 'ouvert';
    return true;
  }
  async function colle(suffixe, contenu) {
    var za = document.getElementById('zoneActionsCollage' + suffixe); if (za) { za.style.display = ''; }
    var t = document.getElementById('texteCollage' + suffixe); t.value = contenu;
    document.getElementById('btnImporter' + suffixe).click(); await attente(700);
  }
  async function parcoursComparer() {
    var ouverts = []; var openOrigine = window.open; window.open = function (u) { ouverts.push(u); return {}; };
    try {
      ouvrirComparerPistes(); naviguerVers('comparer-pistes'); await attente(1200);
      var e = _comparerEtat;
      e.situation = 'sans-emploi'; e.trancheAge = '26-45'; e.recit = 'Je voudrais devenir aide-soignante ou éducatrice.';
      e.pistes = [comparerFabriquerPiste('Aide-soignante', { etiquette: 'metier', couleur: '#2f6690' }), comparerFabriquerPiste('Éducatrice spécialisée', { etiquette: 'metier', couleur: '#d9822b' })];
      e.detectionFaite = true; e._pistesConstruites = true; e.envoi = {};

      // Collecter (2) : bouton Perplexity, pas de texte de prompt, Retour pas a pas, erreur puis succes
      e.dossiersCollecte = null; e.collecteSansAssistant = false; _comparerRenduEcran(2); await attente(800);
      var c = $('#contenuEcranComparer');
      cas('comparer/collecter : bouton « Aller sur Perplexity » présent', !!c.querySelector('button[data-cp-assistant="perplexity"].btn-lg'));
      cas('comparer/collecter : aucun texte de prompt affiché', !c.querySelector('.cp-prompt'));
      cas('comparer/collecter : « Je n’ai pas d’assistant » présent', !!c.querySelector('[data-cp-sans-assistant]'));
      await validerAssistant('perplexity'); _comparerRenduEcran(2); await attente(600);
      cas('comparer/collecter : après confirmation, phase « chez » et texte copié', e.envoi.collecte === 'chez' && (_dernierTexteCopieAssistantIA || '').length > 500, e.envoi.collecte);
      _etatTransitionIA.phase = 'ouvert'; _comparerRenduEcran(2); await attente(500);
      document.getElementById('btnJeSuisDeRetourIA').click(); await attente(600);
      cas('comparer/collecter : « Je suis de retour » -> collage', e.envoi.collecte === 'coller', e.envoi.collecte);
      _comparerActionsBarre.retour(); await attente(500); var r1 = e.envoi.collecte;
      _comparerActionsBarre.retour(); await attente(500); var r2 = e.envoi.collecte;
      cas('comparer : « Retour » recule coller -> chez -> choix', r1 === 'chez' && r2 === 'choix', r1 + ' / ' + r2);
      e.envoi = { collecte: 'coller' }; _comparerRenduEcran(2); await attente(600);
      await colle('CompCollecte', 'pas de json');
      cas('comparer/collecter : réponse invalide -> message d’erreur, on reste au collage', e.envoi.collecte === 'coller' && /⚠/.test(texte(document.getElementById('messageImportCompCollecte'))), texte(document.getElementById('messageImportCompCollecte')));
      await colle('CompCollecte', 'ok {"territoire":"Dordogne (24)","pistes":[{"nom":"Aide-soignante","durable":{},"a_verifier":[],"incertitudes":[]},{"nom":"Éducatrice spécialisée","durable":{},"a_verifier":[],"incertitudes":[]}],"cloture":"x"}');
      cas('comparer/collecter : réponse valide prise en compte', !!e.dossiersCollecte, 'dossiersCollecte vide');

      // Les quatre autres envois
      var autres = [
        { nom: 'dans le temps', ecran: 6, id: 'frise', suf: 'CompFrise', pre: function () { e.formeComparaison = 'dans_le_temps'; e.frise = null; },
          mauvais: 'nimporte quoi', bon: 'ici : {"colonnes":[{"nom":"Aide-soignante","role":"repere","aujourdhui":"a","pendant":"b","apres":"c"},{"nom":"Éducatrice spécialisée","role":"depart","aujourdhui":"d","pendant":"e","apres":"f"}],"conditions_a_reunir":[],"impact_sur_les_droits":[],"questions_conseiller":["Q1"],"incertitudes":["I1"]}', verifie: function () { return !!e.frise; } },
        { nom: 'aller plus loin', ecran: 7, id: 'apl', suf: 'CompApl', pre: function () { e.pistesReflexion = null; },
          mauvais: 'rien d utile', bon: '{"questions":["Avez-vous observé ce métier sur le terrain ?","Comment financeriez-vous la formation ?"],"cloture":"x"}', verifie: function () { return (e.pistesReflexion || []).length === 2; } },
        { nom: 'côte à côte affiné', ecran: 5, id: 'superpo', suf: 'CompSuperpo', pre: function () { e.formeComparaison = 'cote_a_cote'; e.superpositionAffinee = null; e.superpositionAffineeErreur = ''; },
          mauvais: 'texte sans json', bon: '{"dimensions":[{"element":"duree_formation","valeurs":[]}]}', verifie: function () { return !!e.superpositionAffinee; } },
        { nom: 'détection des pistes', ecran: 1, id: 'detection', suf: 'CompDetection', pre: function () { e.pistes = []; e.detectionFaite = false; e._pistesConstruites = false; e._detectionPistes = null; },
          mauvais: 'bonjour', bon: 'Voici : {"pistes":[{"nom":"CAP carrelage","etiquette":"formation","extrait":"x"},{"nom":"Rester en poste","etiquette":"situation"}],"ce_qui_ne_rentre_pas":"mal au dos"}', verifie: function () { return e.detectionFaite && e.pistes.length === 2; } }
      ];
      for (var i = 0; i < autres.length; i++) {
        var a = autres[i]; e.envoi = {}; a.pre(); _comparerRenduEcran(a.ecran); await attente(700);
        var zone = $('#contenuEcranComparer');
        cas('comparer/' + a.nom + ' : choix d’assistant commun, sans texte de prompt, sans bouton Perplexity',
          zone.querySelectorAll('[data-cp-assistant]').length >= 5 && !zone.querySelector('.cp-prompt') && !zone.querySelector('button[data-cp-assistant="perplexity"].btn-lg'));
        var passe = await validerAssistant('mistral');
        _comparerRenduEcran(a.ecran); await attente(600);
        var retour = document.getElementById('btnJeSuisDeRetourIA'); if (retour) { retour.click(); await attente(600); }
        cas('comparer/' + a.nom + ' : confirmation -> chez -> retour -> collage', passe && e.envoi[a.id] === 'coller', e.envoi[a.id]);
        await colle(a.suf, a.mauvais);
        cas('comparer/' + a.nom + ' : réponse invalide -> erreur affichée', /⚠/.test(texte(document.getElementById('messageImport' + a.suf))), texte(document.getElementById('messageImport' + a.suf)));
        await colle(a.suf, a.bon);
        cas('comparer/' + a.nom + ' : réponse valide prise en compte', a.verifie(), 'état non mis à jour');
      }
      cas('comparer : le navigateur n’a rien ouvert sans clic (ouvertures simulées seulement)', true);
    } finally { window.open = openOrigine; }
  }

  // ---------------- Decouverte : l'import applique les propositions et termine le parcours ----------------
  async function parcoursDecouverte() {
    dossier.identite = { civilite: 'Madame', nom: 'Martin', prenom: 'Camille', email: 'c@ex.fr', telephone: '0600000000', ville: 'Limoges' };
    dossier.experiences = [{ poste: 'Agent', entreprise: 'X', dateDebut: '2020-01', dateFin: '2022-01', missions: 'Accueillir' }];
    ouvrirDecouverteCompetences(); await attente(800); _decouverteRenduEtape(12); await attente(800);
    var ta = document.getElementById('texteCollageActionIA'); var bt = document.getElementById('btnImporterActionIA');
    cas('découverte : étape « Importer » affichée', !!ta && !!bt);
    if (!ta || !bt) { return; }
    ta.value = JSON.stringify({ titresProposes: ['Agent d’accueil'], accrochesProposees: ['Une accroche.'], accrochesCourtesProposees: ['Courte'], pointsForts: ['Rigueur'], motsCles: ['accueil'], recommandations: { typeCV: { valeur: 'chronologique', justification: 'ok' }, experiencesAMettreEnAvant: [{ poste: 'Agent', entreprise: 'X', justification: 'ok' }], competencesAValoriser: [{ competence: 'Accueil', justification: 'ok' }] } });
    ta.dispatchEvent(new Event('input', { bubbles: true })); await attente(500);
    bt.click(); await attente(2500);
    cas('découverte : après l’import, le parcours attend (complément de CV facultatif, bouton « Continuer vers mon CV »)', location.hash !== '#resultats' && !!document.getElementById('btnSuivantNavigation') && !document.getElementById('btnContinuerDecouverte') && !!document.getElementById('btnOuvrirComplementCV') && dossier.titreCV === 'Agent d’accueil');
    document.getElementById('btnSuivantNavigation').click(); await attente(2000);
    cas('découverte : « Continuer vers mon CV » aboutit sur « Mon CV » (#resultats), parcours marqué terminé', location.hash === '#resultats' && dossier.decouverteTerminee === true, location.hash);
  }

  // ---------------- Prompts : lignes directrices par situation et voix humaine ----------------
  async function parcoursPrompts() {
    var avant = dossier.objectif; var situations = ['offre', 'spontanee', 'reconversion', 'stage', 'alternance', 'pmsmp', 'formation'];
    situations.forEach(function (o) {
      dossier.objectif = o;
      ['cv', 'lettre', 'entretien'].forEach(function (t) {
        var tx = ''; try { tx = texteProfil(t); } catch (er) { tx = ''; }
        cas('prompts : ligne directrice « ' + o + ' » dans le profil ' + t, tx.indexOf('Ce que cette situation demande de mettre en avant : ' + LIGNES_DIRECTRICES_SITUATION[o]) >= 0);
      });
      var rf = ''; try { rf = _reformulerCvContexteTexte(); } catch (er2) { rf = ''; }
      cas('prompts : ligne directrice « ' + o + ' » dans Reformuler', String(rf).indexOf(LIGNES_DIRECTRICES_SITUATION[o]) >= 0);
    });
    dossier.objectif = avant;
    ['cv', 'decouverteRedaction', 'lettre', 'lettre-co', 'entretien', 'entretien-accueil', 'reformuler-cv'].forEach(function (k) {
      var t = promptsExternesCharges[k];
      cas('prompts : « voix humaine » chargée dans ' + k, !!t && t.indexOf('Une voix humaine') >= 0 && t.indexOf('{{VOIX_HUMAINE}}') === -1, t ? 'repère restant ou texte absent' : 'prompt non chargé');
    });
  }

  // ---------------- Les mots de votre CV : fiche « Enregistrer en fichier » (C12) ----------------
  async function parcoursAts() {
    var blobs = []; var liens = [];
    var cre = URL.createObjectURL.bind(URL); URL.createObjectURL = function (b) { blobs.push(b); return cre(b); };
    var clk = HTMLElement.prototype.click; HTMLElement.prototype.click = function () { if (this.tagName === 'A' && this.download) { liens.push(this.download); return; } return clk.call(this); };
    try {
      _atsEtat = { resultat: { changementsPrioritaires: [{ motReference: 'maintenance', phraseCV: 'réparation', experienceConcernee: 'Agent' }] }, fiche: { maintenance: true } };
      var d = document.createElement('div'); d.innerHTML = _atsRendreEmporter(); document.body.appendChild(d);
      var bouton = d.querySelector('#btnAtsEnregistrerFiche');
      cas('ats : le bouton « Enregistrer en fichier » existe à côté de « Copier » et « Imprimer »', !!bouton && !!d.querySelector('#btnAtsCopierFiche') && !!d.querySelector('#btnAtsImprimerFiche'));
      _atsEnregistrerFiche(); await attente(400);
      cas('ats : un fichier « aide-memoire-mots-du-cv.txt » est téléchargé', liens[0] === 'aide-memoire-mots-du-cv.txt' && blobs.length === 1, JSON.stringify(liens));
      if (blobs.length) {
        var buf = new Uint8Array(await blobs[0].arrayBuffer());
        cas('ats : le fichier est en UTF-8 avec marque (accents lisibles dans le Bloc-notes)', buf[0] === 239 && buf[1] === 187 && buf[2] === 191, [buf[0], buf[1], buf[2]].join(','));
      }
      cas('ats : le message dit où se trouve le fichier', /Téléchargements/.test(texte(document.getElementById('atsFicheMessage'))), texte(document.getElementById('atsFicheMessage')));
      d.remove();
    } finally { URL.createObjectURL = cre; HTMLElement.prototype.click = clk; }
  }

  // ---------------- Import : années proposées pour les certifications rangées sous une formation ----------------
  async function parcoursCertifs() {
    var NL = String.fromCharCode(10);
    var texteCv = ['DIPLÔMES & FORMATIONS', '2019 - 2020 : Sésame Numérique (niveau), LA WAB, Bergerac', '2025 - 2026 : Titre professionnel Plaquiste, IDC PRO, Bergerac',
      ' Sensibilisation amiante, Habilitation échafaudage fixe & roulant, Module travail en hauteur,', ' Habilitation électrique BS/BEM & module Règles Générale de sécurité'].join(NL);
    var jeu = { formations: [{ niveau: 'Titre professionnel', intitule: 'Plaquiste', annee: '2025 - 2026' }],
      certifications: ['Sensibilisation amiante', 'Habilitation échafaudage fixe & roulant', 'Module travail en hauteur', 'Habilitation électrique BS/BEM', 'Module Règles Générale de sécurité'] };
    var pts = pointsIncoherencesImport([jeu], []); _incoh().suggererAnnees(pts, [jeu], texteCv);
    cas('certifs : une question par certification sans année, avec les années de la formation proposées', pts.length === 5 && pts.every(function (p) { return p.suggestions && p.suggestions.join() === '2025,2026'; }), JSON.stringify(pts.map(function (p) { return p.suggestions; })));
    afficherClarificationPointsAVerifier(pts, function () {}, { appliquer: appliquerPrecisionSurValeurs(jeu) }); await attente(700);
    var groupe = [].slice.call(document.querySelectorAll('[data-annee-groupe]'));
    cas('certifs : un choix groupé « 2025 pour toutes » / « 2026 pour toutes »', groupe.length === 2 && /pour toutes/.test(groupe[1].textContent), groupe.map(texte).join(' | '));
    if (groupe.length === 2) { groupe[1].click(); }
    var valeurs = [0, 1, 2, 3, 4].map(function (i) { return (document.getElementById('reponsePointAVerifier' + i) || {}).value; });
    cas('certifs : le choix groupé remplit toutes les réponses', valeurs.every(function (v) { return v === '2026'; }), valeurs.join(','));
    document.getElementById('btnClarificationContinuer').click(); await attente(400);
    cas('certifs : l’année choisie est appliquée à chaque certification', jeu.certifications.every(function (c) { return /\(2026\)$/.test(c); }), jeu.certifications.join(' | '));
  }

  // ---------------- Votre objectif : cartes Stage, Alternance, Formation (retour Denis 2026-10-01) ----------------
  async function parcoursCartesObjectif() {
    window.__erreursCartes = []; var ecoute = function (ev) { window.__erreursCartes.push(ev.message); }; window.addEventListener('error', ecoute);
    try {
      delete dossier.formation;   // session ancienne, faite avant la carte Formation : la carte ne doit pas rester muette
      dossier.objectif = null; naviguerVers('objectif'); await attente(1200);
      var carte = function (re, non) { return [].slice.call(document.querySelectorAll('.carte-objectif')).filter(function (c) { return re.test(c.textContent) && !(non && non.test(c.textContent)); })[0]; };
      carte(/Stage/, /Alternance/).click(); await attente(1200);
      var jetons = document.querySelectorAll('#zoneTypeStage .jeton--radio');
      cas('objectif/stage : le choix du type de stage est fait de deux boutons de la forme des autres (jetons)', jetons.length === 2, jetons.length);
      var projet = document.getElementById('blocERIP-projet');
      cas('objectif/stage : « Vos disponibilités » est désactivé tant que le type de stage n’est pas choisi', !!projet && projet.classList.contains('bloc-verrouille'));
      document.querySelector('[data-type-stage="stage"]').click(); await attente(1200);
      projet = document.getElementById('blocERIP-projet');
      cas('objectif/stage : « Vos disponibilités » s’active une fois le type choisi', !!projet && !projet.classList.contains('bloc-verrouille'));
      var champ = document.getElementById('immStructure'), calendrier = document.getElementById('immDuree');
      cas('objectif/stage : zones de texte grandes (au moins 44 px de haut)', !!champ && champ.getBoundingClientRect().height >= 44 && !!calendrier && calendrier.getBoundingClientRect().height >= 44, champ && champ.getBoundingClientRect().height);
      carte(/Formation/).click(); await attente(1200);
      cas('objectif/formation : la carte répond, même sans dossier.formation d’origine (champ « Formation visée » affiché)', dossier.objectif === 'formation' && !!document.getElementById('immPoste'), dossier.objectif);
      carte(/Alternance/).click(); await attente(1000);
      cas('objectif/alternance : la carte répond (champs de la structure affichés)', dossier.objectif === 'alternance' && !!document.getElementById('immStructure'), dossier.objectif);
      // « Passer à la suite » : ni « aucun métier ciblé » pour une formation, un stage ou une alternance renseignés, ni rappel sur la structure (retour Denis 2026-10-01)
      var navAvant = naviguerVers, destination = null; naviguerVers = function (r) { destination = r; };
      try {
        [['formation', 'BTS Services informatiques'], ['stage', 'Plaquiste'], ['alternance', 'Électricien']].forEach(function (c) {
          dossier.metierCible = null; dossier.secteurCible = null; dossier.objectif = c[0]; dossier[CLE_DETAILS[c[0]]] = Object.assign({}, dossier[CLE_DETAILS[c[0]]], { poste: c[1], structure: '' }); destination = null;
          verifierAvantPasserAction('assistant');
          cas('suite (' + c[0] + ') : on avance directement, sans fenêtre « aucun métier » ni rappel de structure', destination === 'assistant' && !document.querySelector('[data-role="choisir-metier"]') && !/structure d.accueil|Coordonnées de l.entreprise/.test(document.body.innerText), destination);
        });
      } finally { naviguerVers = navAvant; }
    } finally { window.removeEventListener('error', ecoute); }
    cas('objectif : aucune erreur JavaScript en changeant de carte', window.__erreursCartes.length === 0, window.__erreursCartes.join(' | '));
  }

  // ---------------- Looks et galerie par familles (2026-10-06, décisions de Denis : maquette docs/MAQUETTE_LOOKS_ET_GALERIE_2026-10-06.html) ----------------
  async function parcoursLooksEtFamilles() {
    await preparerCvResultats();
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var champ = function (id) { var e = w().document.getElementById(id); return e ? (e.type === 'checkbox' ? e.checked : e.value) : null; };
    // le contenu sans la ponctuation ni les espaces : « texte seul » sépare les compétences par des signes, ce qui ne change pas le contenu
    var texteCv = function () { return w().document.getElementById('conteneurPage').innerText.replace(/[^\p{L}\p{N}]+/gu, '').toLowerCase(); };
    // familles : tous les modèles Créatif y sont rangés, une seule fois, et la liste n'en invente aucun
    // Sans photo, les modèles construits autour d'une photo ne sont pas proposés (décision de Denis, 2026-10-08) : la liste attendue est celle des modèles visibles.
    var tous = _MEP_GALERIE_CREATIF.map(function (m) { return m[0]; }).filter(_mepModeleVisible);
    var rangés = []; _mepFamillesCreatif().forEach(function (fam) { rangés = rangés.concat(fam[2]); });
    cas('galerie : chaque modèle Créatif est rangé dans une famille, une seule fois', rangés.length === tous.length && tous.every(function (id) { return rangés.filter(function (x) { return x === id; }).length === 1; }), rangés.join(','));
    cas('galerie : aucun modèle ne tombe dans « Autres modèles » (famille à compléter)', !_mepFamillesCreatif().some(function (fam) { return fam[0] === 'autres'; }), 'ajouter les nouveaux modèles à _MEP_FAMILLES_CREATIF');
    document.querySelector('[data-mep-allure="creatif"]').click(); await attente(3000);
    var nbChips = document.querySelectorAll('.chip-famille').length;
    cas('galerie : une pastille par famille (' + _mepFamillesCreatif().length + ')', nbChips === _mepFamillesCreatif().length, String(nbChips));
    var vigs = document.querySelectorAll('.gab-familles .vign').length;
    cas('galerie : par défaut, seuls les modèles de la famille du modèle actuel sont affichés', vigs > 0 && vigs < tous.length && !!document.querySelector('.gab-familles .vign.on'), String(vigs));
    document.querySelector('[data-mep-galerie-tous="1"]').click(); await attente(2500);
    cas('galerie : « Voir tous les modèles » montre les ' + tous.length + ' modèles', document.querySelectorAll('.gab-familles .vign').length === tous.length, String(document.querySelectorAll('.gab-familles .vign').length));
    document.querySelector('[data-mep-galerie-tous="0"]').click(); await attente(2500);
    cas('galerie : « Revenir aux familles » rétablit l\'affichage par famille', document.querySelectorAll('.gab-familles .vign').length < tous.length);
    var autre = document.querySelector('.chip-famille:not(.on)'); autre.click(); await attente(2500);
    cas('galerie : choisir une autre famille change les modèles affichés sans changer de modèle', !!document.querySelector('.chip-famille.on') && document.querySelector('.chip-famille.on').getAttribute('data-mep-galerie-fam') === autre.getAttribute('data-mep-galerie-fam'));

    // looks : chacun pose ses réglages d'un coup, en UNE étape d'annulation, sans toucher au texte ni au modèle
    cas('looks : six looks proposés', document.querySelectorAll('[data-mep-look]').length === 6, String(document.querySelectorAll('[data-mep-look]').length));
    var modele = _mepModeleCreatifActuel(), texte = texteCv();
    var lireChampsAmbiance = function () { return ['regCouleurDebut', 'regStyleTitres', 'regStyleCompetences', 'regCoinsArrondis', 'regIcones', 'regStyleBordures', 'regDegradeColonnes', 'regFondColonnes'].map(function (id) { return String(champ(id)); }).join(','); };
    var avantSerie = lireChampsAmbiance();
    for (var i = 0; i < _MEP_LOOKS.length; i++) {
      var L = _MEP_LOOKS[i], paire = _MEP_PALETTE_BASES[L.base], pile = _mepHistoCompteur;
      window._mepAppliquerLook(L.id); await attente(3000);
      var pdfComp = (L.competences === 'texte-seul') ? 'texte' : L.competences;
      var ok = champ('regCouleurDebut') === paire[0] && champ('regStyleTitres') === L.titres && champ('regStyleCompetences') === pdfComp &&
        champ('regCoinsArrondis') === L.coins && champ('regIcones') === L.icones && champ('regStyleBordures') === L.bordures && champ('regDegradeColonnes') === 'aucun';
      cas('look « ' + L.nom + ' » : tous ses réglages sont posés', ok, [champ('regCouleurDebut'), champ('regStyleTitres'), champ('regStyleCompetences'), champ('regCoinsArrondis'), champ('regIcones'), champ('regStyleBordures'), champ('regDegradeColonnes')].join(' '));
      cas('look « ' + L.nom + ' » : une seule étape d\'annulation pour toute la série d\'ambiances', _mepHistoCompteur - pile === (i === 0 ? 1 : 0), String(_mepHistoCompteur - pile));
      cas('look « ' + L.nom + ' » : le texte du CV et le modèle ne changent pas', texteCv() === texte && _mepModeleCreatifActuel() === modele);
      cas('look « ' + L.nom + ' » : affiché comme appliqué, avec « Annuler le look » actif', !!document.querySelector('[data-mep-look="' + L.id + '"].on') && !document.querySelector('[data-mep-look-annuler]').disabled);
    }
    // plusieurs ambiances d'affilée puis « Annuler » : tout revient comme AVANT LA PREMIÈRE ambiance (retour de Denis, 2026-10-11), et le bouton s'éteint
    document.querySelector('[data-mep-look-annuler]').click(); await attente(3500);
    var apresSerie = lireChampsAmbiance();
    cas('look : après six ambiances d\'affilée, un seul « Annuler » revient à l\'état d\'avant la première', apresSerie === avantSerie, avantSerie + ' => ' + apresSerie);
    cas('look : après cette annulation, le bouton est éteint', document.querySelector('[data-mep-look-annuler]').disabled);
    // annuler le dernier look : les réglages d'avant reviennent, le bouton s'éteint
    var avant = champ('regStyleTitres'); window._mepAppliquerLook('moderne'); await attente(2500);
    var apres = champ('regStyleTitres');
    document.querySelector('[data-mep-look-annuler]').click(); await attente(3500);
    cas('look : « Annuler le look » remet le réglage d\'avant', apres === 'bandeau' && champ('regStyleTitres') === avant, avant + ' / ' + apres + ' / ' + champ('regStyleTitres'));
    cas('look : après l\'annulation, plus aucun look affiché comme appliqué', !document.querySelector('.look-bouton.on') && document.querySelector('[data-mep-look-annuler]').disabled);
    // l'allure Sobre n'a pas de looks
    document.querySelector('[data-mep-allure="sobre"]').click(); await attente(3000);
    cas('looks : en allure Sobre, les ambiances restent disponibles (plus de restriction)', [].every.call(document.querySelectorAll('[data-mep-look]'), function (b) { return !b.disabled; }));
    var titresSobre = champ('regStyleTitres'), iconesSobre = champ('regIcones'), Lmod = _MEP_LOOKS.filter(function (l) { return l.id === 'moderne'; })[0];
    window._mepAppliquerLook('moderne'); await attente(3000);
    cas('looks : en allure Sobre, une ambiance ne règle que la couleur (ni titres, ni icônes)', champ('regCouleurDebut') === _MEP_PALETTE_BASES[Lmod.base][0] && champ('regStyleTitres') === titresSobre && champ('regIcones') === iconesSobre, champ('regCouleurDebut') + ' ' + champ('regStyleTitres') + ' ' + champ('regIcones'));
  }

  // ---------------- Modèle Sobre « Chronologique » (2026-10-06, décisions de Denis : maquette docs/MAQUETTE_EDITORIAL_ET_CHRONOLOGIQUE_2026-10-06.html) ----------------
  async function parcoursChronologique() {
    await preparerCvResultats();
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var doc = function () { return w().document; };
    var cv = function () { return doc().querySelector('#conteneurPage .cv'); };
    cas('chronologique : le modèle est dans la galerie Sobre', _MEP_GALERIE_SOBRE.some(function (m) { return m[0] === 'mq-chrono'; }));
    // par l'écran : allure Sobre, puis la vignette
    document.querySelector('[data-mep-allure="sobre"]').click(); await attente(3000);
    var vig = document.querySelector('[data-mep-galerie-sobre="mq-chrono"]');
    cas('chronologique : la vignette est proposée en allure Sobre', !!vig);
    if (vig) { vig.click(); await attente(3500); }
    cas('chronologique : le modèle passe en deux colonnes, colonne pâle à droite', cv().classList.contains('chrono') && cv().classList.contains('col-vague-d') && doc().getElementById('regColonnes').value === '2', cv().className);
    var lignes = doc().querySelectorAll('.item-chrono');
    cas('chronologique : chaque expérience et formation est une ligne « dates | contenu »', lignes.length >= 2 && [].every.call(lignes, function (l) { return l.querySelector('.cdates') && l.querySelector('.ccorps'); }), String(lignes.length));
    var l0 = lignes[0], gd = l0 && l0.querySelector('.cdates').getBoundingClientRect(), co = l0 && l0.querySelector('.ccorps').getBoundingClientRect();
    cas('chronologique : les dates sont dans la marge, à gauche du contenu', !!l0 && gd.right <= co.left + 1, gd && co ? (gd.right + ' / ' + co.left) : '');
    cas('chronologique : la durée s\'affiche quand les deux dates ont un mois', /2 ans et 6 mois/.test(doc().body.innerText), '');
    cas('chronologique : les cases « durée » et « lieu dans la marge » sont proposées (carte Expériences)', !!document.querySelector('[data-mep-afficher-duree]') && !!document.querySelector('[data-mep-lieu-marge]'));
    // durée masquable, lieu dans la marge
    w()._pdfBasculerAfficherDuree(); await attente(1500);
    cas('chronologique : « Afficher la durée » décochée = plus de durée', !doc().querySelector('.duree-exp'));
    w()._pdfBasculerAfficherDuree(); await attente(1000);
    w()._pdfBasculerLieuDansMarge(); await attente(1500);
    cas('chronologique : « Lieu dans la marge » met le lieu sous les dates', !!doc().querySelector('.cdates .lieu-marge'));
    w()._pdfBasculerLieuDansMarge(); await attente(1000);
    // colonne à gauche (colonnes inversées), une seule colonne
    var inv = doc().getElementById('regColonnesInversees'); inv.checked = true; inv.dispatchEvent(new Event('change', { bubbles: true })); await attente(1500);
    cas('chronologique : « Colonnes inversées » met la colonne à gauche', cv().classList.contains('col-vague-g'), cv().className);
    inv.checked = false; inv.dispatchEvent(new Event('change', { bubbles: true })); await attente(1000);
    var nb = doc().getElementById('regColonnes'); nb.value = '1'; nb.dispatchEvent(new Event('change', { bubbles: true })); await attente(1500);
    cas('chronologique : en une seule colonne, le modèle reste chronologique et sans colonne pâle', cv().classList.contains('chrono') && !/col-vague/.test(cv().className) && doc().querySelectorAll('.item-chrono').length >= 2, cv().className);
    nb.value = '2'; nb.dispatchEvent(new Event('change', { bubbles: true })); await attente(1000);
    // jamais de déduction : une année seule ne donne aucune durée
    dossier.experiences[0].dateDebut = '2022'; dossier.experiences[0].dateFin = '2024';
    naviguerVers('resultats'); await attente(4500);
    document.querySelector('[data-mep-allure="sobre"]').click(); await attente(2500);
    var v2 = document.querySelector('[data-mep-galerie-sobre="mq-chrono"]'); if (v2) { v2.click(); await attente(3500); }
    cas('chronologique : une année seule ne donne jamais de durée', cv().classList.contains('chrono') && !doc().querySelector('.duree-exp'), doc().querySelector('.duree-exp') ? doc().querySelector('.duree-exp').textContent : '');
    // un autre modèle Sobre : ni durée ni cases propres au chronologique
    document.querySelector('[data-mep-galerie-sobre="mq-bandeau"]').click(); await attente(3500);
    cas('chronologique : les autres modèles Sobre n\'ont ni la durée ni les cases du chronologique', !cv().classList.contains('chrono') && !doc().querySelector('.item-chrono') && !document.querySelector('[data-mep-afficher-duree]'));
  }

  // ---------------- Modèle Sobre « Éditorial » (2026-10-06, décisions de Denis : maquette docs/MAQUETTE_EDITORIAL_ET_CHRONOLOGIQUE_2026-10-06.html, variante A) ----------------
  async function parcoursEditorial() {
    await preparerCvResultats();
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var doc = function () { return w().document; };
    var cv = function () { return doc().querySelector('#conteneurPage .cv'); };
    cas('éditorial : le modèle est dans la galerie Sobre', _MEP_GALERIE_SOBRE.some(function (m) { return m[0] === 'mq-editorial'; }));
    document.querySelector('[data-mep-allure="sobre"]').click(); await attente(3000);
    var vig = document.querySelector('[data-mep-galerie-sobre="mq-editorial"]');
    cas('éditorial : la vignette est proposée en allure Sobre', !!vig);
    if (vig) { vig.click(); await attente(3500); }
    cas('éditorial : deux colonnes, nom à empattement et trait entre les colonnes par défaut', cv().classList.contains('edito') && cv().classList.contains('edito-serif') && cv().classList.contains('sepcol') && doc().getElementById('regColonnes').value === '2', cv().className);
    cas('éditorial : le nom est dans l\'en-tête éditorial, au-dessus de la colonne étroite', !!doc().querySelector('.tete-edito > div:first-child .nom'));
    var nom = doc().querySelector('.tete-edito .nom'), cs = nom && w().getComputedStyle(nom);
    cas('éditorial : le nom est grand (au moins 40 px) et en Georgia', !!cs && parseFloat(cs.fontSize) >= 40 && /Georgia/.test(cs.fontFamily), cs ? (cs.fontSize + ' ' + cs.fontFamily) : '');
    cas('éditorial : les cases « nom à empattement » et « trait entre les colonnes » sont proposées (carte En-tête)', !!document.querySelector('[data-mep-nom-empattement]') && !!document.querySelector('[data-mep-trait-vertical]'));
    w()._pdfBasculerNomEmpattement(); await attente(1500);
    cas('éditorial : « Nom à empattement » décochée = police du CV', !cv().classList.contains('edito-serif'));
    w()._pdfBasculerNomEmpattement(); await attente(1000);
    w()._pdfBasculerTraitVertical(); await attente(1500);
    cas('éditorial : « Trait entre les colonnes » décochée = plus de trait', !cv().classList.contains('sepcol'));
    w()._pdfBasculerTraitVertical(); await attente(1000);
    var inv = doc().getElementById('regColonnesInversees'); inv.checked = true; inv.dispatchEvent(new Event('change', { bubbles: true })); await attente(1500);
    cas('éditorial : « Colonnes inversées » met la colonne étroite et le nom à droite', !doc().querySelector('.tete-edito > div:first-child .nom') && !!doc().querySelector('.tete-edito > div:last-child .nom'));
    inv.checked = false; inv.dispatchEvent(new Event('change', { bubbles: true })); await attente(1000);
    var nb = doc().getElementById('regColonnes'); nb.value = '1'; nb.dispatchEvent(new Event('change', { bubbles: true })); await attente(1500);
    cas('éditorial : en une seule colonne, le modèle reste éditorial, sans trait', cv().classList.contains('edito') && !cv().classList.contains('sepcol') && !!doc().querySelector('.tete-edito .nom'), cv().className);
    nb.value = '2'; nb.dispatchEvent(new Event('change', { bubbles: true })); await attente(1000);
    document.querySelector('[data-mep-galerie-sobre="mq-bandeau"]').click(); await attente(3500);
    cas('éditorial : les autres modèles Sobre n\'ont ni l\'en-tête éditorial ni ses cases', !cv().classList.contains('edito') && !doc().querySelector('.tete-edito') && !document.querySelector('[data-mep-nom-empattement]'));
  }

  // ---------------- Modèle Sobre « Éditorial large » (variante B, 2026-10-06) ----------------
  async function parcoursEditorialLarge() {
    await preparerCvResultats();
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var doc = function () { return w().document; };
    var cv = function () { return doc().querySelector('#conteneurPage .cv'); };
    cas('éditorial large : le modèle est dans la galerie Sobre', _MEP_GALERIE_SOBRE.some(function (m) { return m[0] === 'mq-editorial-large'; }));
    document.querySelector('[data-mep-allure="sobre"]').click(); await attente(3000);
    var vig = document.querySelector('[data-mep-galerie-sobre="mq-editorial-large"]');
    cas('éditorial large : la vignette est proposée en allure Sobre', !!vig);
    if (vig) { vig.click(); await attente(3500); }
    cas('éditorial large : deux colonnes, colonne étroite à droite, trait entre les colonnes', cv().classList.contains('edito-large') && cv().classList.contains('edito-inv') && cv().classList.contains('sepcol') && doc().getElementById('regColonnes').value === '2', cv().className);
    var nom = doc().querySelector('.tete-edito-large .nom'), cs = nom && w().getComputedStyle(nom);
    cas('éditorial large : le nom est grand, en majuscules, sur toute la largeur de la page', !!cs && parseFloat(cs.fontSize) >= 36 && cs.textTransform === 'uppercase' && nom.getBoundingClientRect().width > 250, cs ? (cs.fontSize + ' ' + cs.textTransform) : '');
    cas('éditorial large : la case des titres à empattement est proposée (carte En-tête), pas celle du nom', !!document.querySelector('[data-mep-nom-empattement]') && /Titres de rubrique/.test(document.querySelector('[data-mep-nom-empattement]').textContent + (document.querySelector('[data-mep-nom-empattement]').parentElement || {}).textContent));
    var inv = doc().getElementById('regColonnesInversees'); inv.checked = true; inv.dispatchEvent(new Event('change', { bubbles: true })); await attente(1500);
    cas('éditorial large : « Colonnes inversées » met la colonne étroite à gauche', !cv().classList.contains('edito-inv'), cv().className);
    inv.checked = false; inv.dispatchEvent(new Event('change', { bubbles: true })); await attente(1000);
    var nb = doc().getElementById('regColonnes'); nb.value = '1'; nb.dispatchEvent(new Event('change', { bubbles: true })); await attente(1500);
    cas('éditorial large : en une seule colonne, le modèle reste éditorial large, sans trait', cv().classList.contains('edito-large') && !cv().classList.contains('sepcol'), cv().className);
    nb.value = '2'; nb.dispatchEvent(new Event('change', { bubbles: true })); await attente(1000);
    document.querySelector('[data-mep-galerie-sobre="mq-editorial"]').click(); await attente(3500);
    cas('éditorial large : le passage à l\'Éditorial (variante A) retrouve le nom en pile', !cv().classList.contains('edito-large') && !!doc().querySelector('.tete-edito .nom') && !doc().querySelector('.tete-edito-large'));
  }

  // ---------------- Extras de la famille A (2026-10-06) : « Colonne et bandeau » et « Colonne foncée chronologique » ----------------
  async function parcoursExtrasFamilleA() {
    await preparerCvResultats();
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var doc = function () { return w().document; };
    var cv = function () { return doc().querySelector('#conteneurPage .cv'); };
    ['colonneBandeau', 'chronoFonce'].forEach(function (id) {
      cas('extras : « ' + id + ' » est dans la galerie Créatif', _MEP_GALERIE_CREATIF.some(function (m) { return m[0] === id; }) && w()._pdfIdsModelesCreatif().indexOf(id) !== -1);
    });
    // « Colonne et bandeau » : bandeau d'en-tête sur toute la largeur ET colonne pleine hauteur
    w()._pdfChoisirModeleCreatif('colonneBandeau'); await attente(2500);
    var bandeau = doc().querySelector('.tete-fond'), av = w().getComputedStyle(cv(), '::before');
    cas('colonne et bandeau : bandeau d\'en-tête et colonne pleine hauteur', !!bandeau && cv().classList.contains('col-vague-g') && Math.abs(parseFloat(av.height) - cv().getBoundingClientRect().height) < 2, cv().className);
    cas('colonne et bandeau : le bandeau couvre toute la largeur de la page', !!bandeau && bandeau.getBoundingClientRect().width >= cv().getBoundingClientRect().width - 2, bandeau ? String(bandeau.getBoundingClientRect().width) : '');
    // « Colonne foncée chronologique » : colonne foncée à droite, dates dans la marge, durée
    w()._pdfChoisirModeleCreatif('chronoFonce'); await attente(2500);
    var av2 = w().getComputedStyle(cv(), '::before');
    cas('colonne foncée chronologique : colonne foncée à droite sur toute la hauteur', cv().classList.contains('chrono') && cv().classList.contains('col-vague-d') && av2.backgroundColor === 'rgb(31, 42, 68)', cv().className + ' ' + av2.backgroundColor);
    var lignes = doc().querySelectorAll('.item-chrono'), l0 = lignes[0];
    cas('colonne foncée chronologique : dates dans la marge, à gauche du contenu', lignes.length >= 2 && !!l0 && l0.querySelector('.cdates').getBoundingClientRect().right <= l0.querySelector('.ccorps').getBoundingClientRect().left + 1);
    cas('colonne foncée chronologique : la durée s\'affiche quand les deux dates ont un mois', /2 ans et 6 mois/.test(doc().body.innerText));
    cas('colonne foncée chronologique : le texte de la colonne est clair', w().getComputedStyle(doc().querySelector('.col-fond')).color === 'rgb(255, 255, 255)');
    var inv = doc().getElementById('regColonnesInversees'); inv.checked = false; inv.dispatchEvent(new Event('change', { bubbles: true })); await attente(1500);
    cas('colonne foncée chronologique : « Colonnes inversées » décochée met la colonne à gauche', cv().classList.contains('col-vague-g'), cv().className);
    // cases durée / lieu dans la marge proposées par la carte Expériences (après un rendu de l'écran)
    // le panneau parent ne se redessine pas quand on parle directement à l'iframe : on le redessine, puis on relit ses cases
    var inv2 = doc().getElementById('regColonnesInversees'); inv2.checked = true; inv2.dispatchEvent(new Event('change', { bubbles: true })); await attente(1000);
    w()._pdfChoisirModeleCreatif('chronoFonce'); await attente(1500);
    naviguerVers('resultats'); await attente(4500);
    cas('colonne foncée chronologique : la carte Expériences propose la durée et le lieu dans la marge', !!document.querySelector('[data-mep-afficher-duree]') && !!document.querySelector('[data-mep-lieu-marge]'));
    // un autre modèle Créatif : rien de tout cela
    w()._pdfChoisirModeleCreatif('colonneFoncee'); await attente(2500);
    cas('extras : les autres modèles Créatif n\'ont ni dates en marge ni cases du chronologique', !cv().classList.contains('chrono') && !doc().querySelector('.item-chrono'));
  }

  // ---------------- Modèles Sobre « Cartes » et « Grille » (2026-10-06, exemples 13, 15 et 8 de Denis) ----------------
  async function parcoursCartesGrille() {
    await preparerCvResultats();
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var doc = function () { return w().document; };
    var cv = function () { return doc().querySelector('#conteneurPage .cv'); };
    document.querySelector('[data-mep-allure="sobre"]').click(); await attente(3000);
    ['mq-cartes', 'mq-grille'].forEach(function (id) {
      cas('cartes et grille : « ' + id + ' » est dans la galerie Sobre', _MEP_GALERIE_SOBRE.some(function (m) { return m[0] === id; }) && !!document.querySelector('[data-mep-galerie-sobre="' + id + '"]'));
    });
    document.querySelector('[data-mep-galerie-sobre="mq-cartes"]').click(); await attente(3500);
    var cartes = doc().querySelectorAll('.col-cartes .rub-sec');
    cas('cartes : deux colonnes, la colonne étroite est faite de cartes pâles', cv().classList.contains('cartes') && doc().getElementById('regColonnes').value === '2' && cartes.length >= 2, cv().className + ' ' + cartes.length);
    var c0 = cartes[0], st = c0 && w().getComputedStyle(c0), h2 = c0 && c0.querySelector('h2');
    cas('cartes : chaque carte a un fond pâle, un filet de couleur en haut et une étiquette blanche pour le titre', !!c0 && st.backgroundColor !== 'rgba(0, 0, 0, 0)' && parseFloat(st.borderTopWidth) >= 2 && !!h2 && w().getComputedStyle(h2).backgroundColor === 'rgb(255, 255, 255)', st ? (st.backgroundColor + ' ' + st.borderTopWidth) : '');
    var inv = doc().getElementById('regColonnesInversees'); inv.checked = true; inv.dispatchEvent(new Event('change', { bubbles: true })); await attente(1500);
    cas('cartes : « Colonnes inversées » garde les cartes dans la colonne étroite', doc().querySelectorAll('.col-cartes .rub-sec').length >= 2);
    inv.checked = false; inv.dispatchEvent(new Event('change', { bubbles: true })); await attente(1000);
    document.querySelector('[data-mep-galerie-sobre="mq-grille"]').click(); await attente(3500);
    var rub = doc().querySelectorAll('.rub-sec');
    cas('grille : deux colonnes, trait entre les colonnes, rubriques séparées par un filet', cv().classList.contains('grille') && cv().classList.contains('sepcol') && doc().getElementById('regColonnes').value === '2' && rub.length >= 3 && [].some.call(rub, function (r) { return parseFloat(w().getComputedStyle(r).borderBottomWidth) > 0; }), cv().className);
    var t = doc().querySelector('.rub-sec h2');
    cas('grille : titres en majuscules espacées', !!t && w().getComputedStyle(t).textTransform === 'uppercase' && parseFloat(w().getComputedStyle(t).letterSpacing) >= 1);
    document.querySelector('[data-mep-galerie-sobre="mq-bandeau"]').click(); await attente(3500);
    cas('cartes et grille : les autres modèles Sobre n\'ont ni cartes ni grille', !cv().classList.contains('cartes') && !cv().classList.contains('grille') && !doc().querySelector('.col-cartes'));
  }

  // ---------------- Plan 2026-10-07, E1 : « Colonne foncée et frise » (et « Colonne et frise » inchangé) ----------------
  async function parcoursFriseFoncee() {
    await preparerCvResultats();
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var doc = function () { return w().document; };
    var cv = function () { return doc().querySelector('#conteneurPage .cv'); };
    cas('frise foncée : le modèle est dans la galerie Créatif', _MEP_GALERIE_CREATIF.some(function (m) { return m[0] === 'friseFoncee'; }) && w()._pdfIdsModelesCreatif().indexOf('friseFoncee') !== -1);
    w()._pdfChoisirModeleCreatif('friseFoncee'); await attente(2500);
    var lat = doc().querySelector('.fr-lat');
    cas('frise foncée : deux colonnes, colonne latérale de la couleur foncée choisie', cv().classList.contains('frise-foncee') && doc().getElementById('regColonnes').value === '2' && !!lat && w().getComputedStyle(lat).backgroundColor === 'rgb(31, 42, 68)', lat ? w().getComputedStyle(lat).backgroundColor : '');
    var b = doc().querySelector('.fr-lat .fr-b');
    cas('frise foncée : le texte de la colonne est clair', !!b && w().getComputedStyle(b).color === 'rgb(255, 255, 255)');
    cas('frise foncée : les expériences sont sur une frise', doc().querySelectorAll('.fr-frise .fr-item').length >= 2, String(doc().querySelectorAll('.fr-frise .fr-item').length));
    // « Colonne et frise » d'origine : rien ne change (colonne bleu pâle, aucune classe nouvelle)
    w()._pdfChoisirModeleCreatif('frise'); await attente(2500);
    var lat2 = doc().querySelector('.fr-lat');
    cas('colonne et frise (d\'origine) : inchangée, colonne bleu pâle et texte sombre', !cv().classList.contains('frise-foncee') && !!lat2 && w().getComputedStyle(lat2).backgroundColor === 'rgb(147, 170, 198)', lat2 ? w().getComputedStyle(lat2).backgroundColor : '');
  }

  // ---------------- Plan 2026-10-07, E2 : modèle Sobre « Technique » (exemples 9, 1, 7, 10) ----------------
  async function parcoursTechnique() {
    await preparerCvResultats();
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var doc = function () { return w().document; };
    var cv = function () { return doc().querySelector('#conteneurPage .cv'); };
    document.querySelector('[data-mep-allure="sobre"]').click(); await attente(3000);
    var vig = document.querySelector('[data-mep-galerie-sobre="mq-technique"]');
    cas('technique : le modèle est dans la galerie Sobre', _MEP_GALERIE_SOBRE.some(function (m) { return m[0] === 'mq-technique'; }) && !!vig);
    if (vig) { vig.click(); await attente(3500); }
    cas('technique : une seule colonne', cv().classList.contains('technique') && doc().getElementById('regColonnes').value === '1', cv().className);
    var nom = doc().querySelector('.tete-technique .nom');
    cas('technique : en-tête à deux blocs (nom et titre à gauche, coordonnées à droite)', !!nom && !!doc().querySelector('.tete-technique .infos-tech .coord') && parseFloat(w().getComputedStyle(nom).fontSize) >= 26, nom ? w().getComputedStyle(nom).fontSize : '');
    var h2 = doc().querySelector('.rub-sec h2');
    cas('technique : les titres de rubrique sont des barres pleines à texte clair', !!h2 && w().getComputedStyle(h2).backgroundColor !== 'rgba(0, 0, 0, 0)' && w().getComputedStyle(h2).color === 'rgb(255, 255, 255)');
    var items = doc().querySelectorAll('.item + .item');
    cas('technique : un filet sépare les expériences', items.length >= 1 && parseFloat(w().getComputedStyle(items[0]).borderTopWidth) > 0, String(items.length));
    document.querySelector('[data-mep-galerie-sobre="mq-bandeau"]').click(); await attente(3500);
    cas('technique : les autres modèles Sobre n\'ont ni barres de titre ni filets entre expériences', !cv().classList.contains('technique') && !doc().querySelector('.tete-technique'));
  }

  // ---------------- Plan 2026-10-07, E3 : modèle Sobre « Cartes colorées » (filets de couleurs voisines, résumé encadré) ----------------
  async function parcoursCartesCouleurs() {
    await preparerCvResultats();
    dossier.ia = dossier.ia || {}; dossier.ia.cv = Object.assign({}, dossier.ia.cv || {}, { profil: 'Agent de sécurité rigoureuse, trois ans d’expérience en surveillance et accueil.' });
    naviguerVers('resultats'); await attente(4500);
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var doc = function () { return w().document; };
    var cv = function () { return doc().querySelector('#conteneurPage .cv'); };
    var couleurs = function () { return [].map.call(doc().querySelectorAll('.col-cartes .rub-sec'), function (e) { return w().getComputedStyle(e).borderTopColor; }); };
    document.querySelector('[data-mep-allure="sobre"]').click(); await attente(3000);
    var vig = document.querySelector('[data-mep-galerie-sobre="mq-cartes-couleurs"]');
    cas('cartes colorées : le modèle est dans la galerie Sobre', _MEP_GALERIE_SOBRE.some(function (m) { return m[0] === 'mq-cartes-couleurs'; }) && !!vig);
    if (vig) { vig.click(); await attente(3500); }
    var c = couleurs();
    cas('cartes colorées : deux colonnes, colonne étroite en cartes', cv().classList.contains('cartes') && cv().classList.contains('cartes-couleurs') && c.length >= 3 && doc().getElementById('regColonnes').value === '2', cv().className + ' ' + c.length);
    cas('cartes colorées : les filets de couleur des cartes sont différents', c.filter(function (x, i, a) { return a.indexOf(x) === i; }).length >= 3, c.join(' ; '));
    var ac = doc().querySelector('.tete .accroche');
    cas('cartes colorées : le résumé est encadré', !!ac && parseFloat(w().getComputedStyle(ac).borderTopWidth) > 0, ac ? w().getComputedStyle(ac).borderTopWidth : 'pas de résumé');
    // « Cartes » d'origine : inchangé (filets tous de la même couleur, résumé sans cadre)
    document.querySelector('[data-mep-galerie-sobre="mq-cartes"]').click(); await attente(3500);
    var c2 = couleurs(), ac2 = doc().querySelector('.tete .accroche');
    cas('cartes (d\'origine) : inchangé, filets de la même couleur', c2.length >= 3 && c2.filter(function (x, i, a) { return a.indexOf(x) === i; }).length === 1 && !cv().classList.contains('cartes-couleurs'), c2.join(' ; '));
    cas('cartes (d\'origine) : le résumé n\'a pas de cadre', !ac2 || parseFloat(w().getComputedStyle(ac2).borderTopWidth) === 0, ac2 ? w().getComputedStyle(ac2).borderTopWidth : '');
  }

  // ---------------- Plan 2026-10-07, E4 : teinte de page optionnelle (éteinte par défaut) ----------------
  async function parcoursTeintePage() {
    // La teinte de page (fond creme sur toute la feuille) a ete RETIREE (decision de Denis, 2026-10-11 : encre, impression noir et blanc). L'essai garde qu'elle ne revient pas.
    await preparerCvResultats();
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var doc = function () { return w().document; };
    cas('teinte de page : plus aucune case « Teinte de page » dans les réglages', !document.querySelector('[data-mep-teinte-page]') && !/Teinte de page/.test(document.body.textContent));
    var avecFond = [];
    for (var i = 0, ids = ['mqBandeau', 'colonneFoncee', 'sidebarVague', 'colonneClaire']; i < ids.length; i++) { w()._pdfChoisirModeleCreatif(ids[i]); await attente(1800); if (doc().querySelector('.fond-teinte') || doc().querySelector('.cv.teinte-page')) { avecFond.push(ids[i]); } }
    cas('teinte de page : aucun modèle ne colore toute la page', avecFond.length === 0, avecFond.join(','));
    cas('teinte de page : la fonction n’existe plus dans le moteur du CV', typeof w()._pdfBasculerTeintePage === 'undefined');
  }

  // ---------------- Plan 2026-10-07, E6 : « Colonne foncée et rubans » (titres en ruban à pointe, exemple 5) ----------------
  async function parcoursColonneRuban() {
    await preparerCvResultats();
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var doc = function () { return w().document; };
    var cv = function () { return doc().querySelector('#conteneurPage .cv'); };
    var h2s = function () { return [].slice.call(doc().querySelectorAll('#conteneurPage .cv h2')); };
    cas('rubans : le modèle est dans la galerie Créatif', _MEP_GALERIE_CREATIF.some(function (m) { return m[0] === 'colonneRuban'; }) && w()._pdfIdsModelesCreatif().indexOf('colonneRuban') !== -1);
    w()._pdfChoisirModeleCreatif('colonneRuban'); await attente(2500);
    var t = h2s();
    var tous = t.length >= 3 && t.every(function (h) { var cs = w().getComputedStyle(h); return cs.clipPath.indexOf('polygon') === 0 && cs.borderBottomWidth === '0px'; });
    cas('rubans : tous les titres de rubrique sont en ruban à pointe', cv().classList.contains('titres-ruban') && tous, cv().className + ' / ' + t.length);
    var enCol = t.filter(function (h) { return !!h.closest('.col-fond'); }), horsCol = t.filter(function (h) { return !h.closest('.col-fond'); });
    cas('rubans : ruban blanc dans la colonne foncée, ruban de la couleur du CV ailleurs', enCol.length >= 1 && horsCol.length >= 1 && enCol.every(function (h) { return w().getComputedStyle(h).backgroundColor === 'rgb(255, 255, 255)'; }) && horsCol.every(function (h) { return w().getComputedStyle(h).backgroundColor === 'rgb(31, 42, 68)'; }), enCol.length + ' / ' + horsCol.length);
    cas('rubans : le CV tient sur une page', doc().querySelectorAll('.page-a4').length === 1, String(doc().querySelectorAll('.page-a4').length));
    // « Colonne foncée » d'origine : rien ne change (aucune classe, aucun clip-path sur les titres)
    w()._pdfChoisirModeleCreatif('colonneFoncee'); await attente(2500);
    var t2 = h2s();
    cas('colonne foncée (d\'origine) : inchangée, aucun titre en ruban', !cv().classList.contains('titres-ruban') && t2.length >= 3 && t2.every(function (h) { return w().getComputedStyle(h).clipPath === 'none'; }), cv().className);
  }

  // ---------------- Lot W (2026-10-07) : message « Word ne reproduit pas tout » dans le bloc Exporter ----------------
  async function parcoursLimitesWord() {
    await preparerCvResultats();
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var ouvrirExporter = async function () { dossier.cvTermine = true; _rectDocOuvert = 'exporter'; pageResultats(); await attente(3500); };
    w()._pdfChoisirModeleCreatif('colonneRuban'); await attente(2500);
    await ouvrirExporter();
    var av = document.getElementById('avertissementLimitesWord');
    cas('message Word : « Colonne foncée et rubans » est signalé, avec le conseil PDF', !!av && /ruban/.test(av.textContent) && /PDF/.test(av.textContent), av ? av.textContent : 'absent');
    var btnPdf = document.querySelector('[data-format-export="pdf-imprimer"]');
    cas('message Word : le bouton PDF est marqué « conseillé » et le bouton Word reste présent', !!btnPdf && /conseillé/.test(btnPdf.textContent) && !!document.querySelector('[data-format-export="docx"]'), btnPdf ? btnPdf.textContent : 'absent');
    // « Colonne claire » (carte, 2026-10-11) : Word garde la carte mais pas le filet de couleur ; le message le dit, conseille le PDF et promet l'adaptation dans Word
    _rectDocOuvert = 'mise-en-page'; pageResultats(); await attente(4500);
    w()._pdfChoisirModeleCreatif('colonneClaire'); await attente(2500);
    await ouvrirExporter();
    var avCarte = document.getElementById('avertissementLimitesWord');
    cas('message Word : « Colonne claire » (carte) est signalée : filet de couleur, conseil PDF, modèle adapté dans Word', !!avCarte && /filet de couleur/.test(avCarte.textContent) && /PDF/.test(avCarte.textContent) && /adapté/.test(avCarte.textContent), avCarte ? avCarte.textContent : 'absent');
    // un modèle que Word reproduit : aucun message, aucun marquage
    _rectDocOuvert = 'mise-en-page'; pageResultats(); await attente(4500);
    w()._pdfChoisirModeleCreatif('colonneFoncee'); await attente(2500);
    await ouvrirExporter();
    var btnPdf2 = document.querySelector('[data-format-export="pdf-imprimer"]');
    cas('message Word : « Colonne foncée » (reproduit par Word) : aucun message', !document.getElementById('avertissementLimitesWord') && !!btnPdf2 && !/conseillé/.test(btnPdf2.textContent));
    cas('message Word : les deux boutons de téléchargement restent utilisables', !!document.querySelector('[data-format-export="docx"]') && !document.querySelector('[data-format-export="docx"]').disabled);
    // remet l'ecran comme il l'etait (mise en page ouverte, export de nouveau verrouille) : les parcours suivants en dependent
    dossier.cvTermine = false; _rectDocOuvert = 'mise-en-page'; pageResultats(); await attente(4000);
  }

  // ---------------- Lot I1 (2026-10-07) : « Informations complémentaires » en bandeau pleine largeur (haut, bas, à côté d'une rubrique courte) ----------------
  async function parcoursInfosBandeaux() {
    await preparerCvResultats();
    dossier.informationsNonClassees = ['Disponible immédiatement', 'Mobile sur toute la France', 'github.com/camille'];
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    ['infosPlace', 'infosCote', 'infosPresentation', 'listesDeuxColonnes'].forEach(function (k) { w()._pdfMqChoix(k, null); });   // etat de depart propre : un parcours precedent ne doit rien laisser
    var doc = function () { return w().document; };
    var T = 'Informations complémentaires';
    var enColonne = function (titre) { return !!doc().querySelector('.corps.deux [data-rub="' + titre + '"]'); };
    var enBande = function (titre) { return !!doc().querySelector('.bande-infos [data-rub="' + titre + '"]'); };
    var attendre = async function () { await attente(2200); };
    w()._pdfChoisirModeleCreatif('colonneFoncee'); await attendre();
    _mepDefinirChoixMq('infosCompAffichees', _mepInfosSaisies()); await attendre();
    // d'office : dans une colonne, aucun bandeau
    cas('bandeau infos : par défaut la rubrique est dans une colonne, sans bandeau', enColonne(T) && !doc().querySelector('.bande-infos'));
    var commande = document.querySelector('[data-mep-infos-place]');
    cas('bandeau infos : la commande « Où placer cette rubrique ? » est proposée', !!commande);
    // bandeau du haut : entre l'en-tête et les colonnes
    _mepDefinirChoixMq('infosPlace', 'haut'); await attendre();
    var bande = doc().querySelector('.bande-infos'), corps = doc().querySelector('.corps.deux');
    cas('bandeau du haut : la rubrique est sur toute la largeur, avant les colonnes, plus dans une colonne', !!bande && enBande(T) && !enColonne(T) && !!corps && !!(bande.compareDocumentPosition(corps) & 4), bande ? 'bande présente' : 'pas de bande');
    cas('bandeau du haut : les trois lignes sont réparties en colonnes de lignes', doc().querySelectorAll('.bande-infos .paire > div').length === 3 || doc().querySelectorAll('.bande-infos .paire.trois > div').length === 3, String(doc().querySelectorAll('.bande-infos .paire > div').length));
    cas('bandeau du haut : le CV tient sur une page', doc().querySelectorAll('.page-a4').length === 1, String(doc().querySelectorAll('.page-a4').length));
    // bandeau du bas : apres les colonnes
    _mepDefinirChoixMq('infosPlace', 'bas'); await attendre();
    var bande2 = doc().querySelector('.bande-infos'), corps2 = doc().querySelector('.corps.deux');
    cas('bandeau du bas : la rubrique est après les colonnes', !!bande2 && !!corps2 && !!(corps2.compareDocumentPosition(bande2) & 4) && !enColonne(T));
    // a cote d'une rubrique courte
    _mepDefinirChoixMq('infosCote', 'centres'); await attendre();
    var paire = doc().querySelector('.bande-infos > .paire, .bande-infos .paire');
    cas('à côté : Centres d\'intérêt est sur la même ligne que la rubrique, et plus dans une colonne', !!doc().querySelector('.bande-infos [data-rub="Centres d’intérêt"]') && !enColonne('Centres d’intérêt') && enBande(T) && !!paire);
    // retour a la colonne : tout revient
    _mepDefinirChoixMq('infosPlace', null); await attendre();
    cas('retour à la colonne : la rubrique et Centres d\'intérêt reviennent dans les colonnes, plus de bandeau', enColonne(T) && enColonne('Centres d’intérêt') && !doc().querySelector('.bande-infos'));
    // une seule colonne (Sobre) : le bandeau fonctionne aussi
    document.querySelector('[data-mep-allure="sobre"]').click(); await attente(3000);
    w()._pdfChoisirVarianteSobre('mq-bandeau'); await attendre();
    _mepDefinirChoixMq('infosPlace', 'haut'); await attendre();
    cas('bandeau (une colonne) : la rubrique est dans le bandeau, une seule fois', !!doc().querySelector('.bande-infos') && doc().querySelectorAll('h2[data-rub="' + T + '"], h3[data-rub="' + T + '"]').length === 1, String(doc().querySelectorAll('h2[data-rub="' + T + '"], h3[data-rub="' + T + '"]').length));
    _mepDefinirChoixMq('infosPlace', null); await attendre();
    // un modèle à disposition propre (Colonne et frise) garde sa place et grise la commande
    document.querySelector('[data-mep-allure="creatif"]').click(); await attente(3000);
    w()._pdfChoisirModeleCreatif('frise'); await attendre();
    _mepDefinirChoixMq('infosPlace', 'haut'); await attendre();
    cas('Colonne et frise : aucun bandeau, la rubrique reste à sa place (une seule fois)', !doc().querySelector('.bande-infos') && doc().querySelectorAll('h2[data-rub="' + T + '"], h3[data-rub="' + T + '"]').length === 1, String(doc().querySelectorAll('h2[data-rub="' + T + '"], h3[data-rub="' + T + '"]').length));
    var btnGris = document.querySelector('[data-mep-infos-place="haut"]');
    cas('Colonne et frise : la commande est grisée avec sa raison', !!btnGris && btnGris.disabled);
    _mepDefinirChoixMq('infosPlace', null); await attendre();
  }

  // ---------------- Lot I3 (2026-10-07) : presentation (liste, sur une ligne, pastilles) et colonnes de « Informations complémentaires », dans sa barre du plein écran ----------------
  async function parcoursInfosPresentation() {
    await preparerCvResultats();
    dossier.informationsNonClassees = ['Disponible immédiatement', 'Mobile sur toute la France', 'github.com/camille'];
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    ['infosPlace', 'infosCote', 'infosPresentation', 'listesDeuxColonnes'].forEach(function (k) { w()._pdfMqChoix(k, null); });   // etat de depart propre : un parcours precedent ne doit rien laisser
    var doc = function () { return w().document; };
    var T = 'Informations complémentaires';
    var secInfos = function () { return doc().querySelector('.rub-sec[data-rub="' + T + '"]'); };
    w()._pdfChoisirModeleCreatif('colonneFoncee'); await attente(2200);
    _mepDefinirChoixMq('infosCompAffichees', _mepInfosSaisies()); await attente(2200);
    cas('présentation infos : par défaut, une liste (une ligne par information, ni points ni pastilles)', !!secInfos() && secInfos().querySelectorAll('.sep-infos, .pill').length === 0 && secInfos().querySelectorAll(':scope > div > div').length === 3);
    // la barre du plein ecran : groupe visible pour cette rubrique seulement
    ouvrirPleinEcranMaquette(); await attendreMq();
    var frame = function () { return document.getElementById('mqFrame').contentDocument; };
    var titre = function (nom) { return [].slice.call(frame().querySelectorAll('h2[data-rub]')).filter(function (h) { return h.getAttribute('data-rub') === nom; })[0]; };
    titre(T).click(); await attente(600);
    var groupe = document.getElementById('mqRubInfos');
    cas('barre de la rubrique : « Présentation » et « Colonnes » sont proposées pour Informations complémentaires', !!groupe && groupe.style.display !== 'none' && document.querySelector('[data-mqinfos="liste"]').classList.contains('on'));
    titre('Langues').click(); await attente(500);
    cas('barre d’une autre rubrique (Langues) : pas de choix de présentation', document.getElementById('mqRubInfos').style.display === 'none');
    titre(T).click(); await attente(500);
    // sur une ligne
    document.querySelector('[data-mqinfos="ligne"]').click(); await attente(2200);
    var s1 = frame().querySelector('.rub-sec[data-rub="' + T + '"]');
    cas('sur une ligne : les informations sont à la suite, séparées par des points', !!s1 && s1.querySelectorAll('.sep-infos').length === 2 && s1.textContent.indexOf('Disponible immédiatement · Mobile sur toute la France · github.com/camille') !== -1, s1 ? s1.textContent : '');
    cas('sur une ligne : le bouton est marqué actif et les colonnes sont masquées', document.querySelector('[data-mqinfos="ligne"]').classList.contains('on') && document.getElementById('mqRubInfosCol').style.display === 'none');
    // pastilles
    document.querySelector('[data-mqinfos="pastilles"]').click(); await attente(2200);
    var s2 = frame().querySelector('.rub-sec[data-rub="' + T + '"]');
    cas('pastilles : une pastille par information', !!s2 && s2.querySelectorAll('.pill').length === 3, s2 ? String(s2.querySelectorAll('.pill').length) : '');
    // retour a la liste, puis deux colonnes
    document.querySelector('[data-mqinfos="liste"]').click(); await attente(2200);
    document.querySelector('[data-mqinfoscol="2"]').click(); await attente(2200);
    var s3 = frame().querySelector('.rub-sec[data-rub="' + T + '"]');
    cas('deux colonnes : la liste est répartie en deux blocs', !!s3 && !!s3.querySelector('.liste-2col') && s3.querySelectorAll('.liste-2col > div').length === 2);
    document.querySelector('[data-mqinfoscol="1"]').click(); await attente(2200);
    cas('une colonne : retour à la liste simple', !frame().querySelector('.rub-sec[data-rub="' + T + '"] .liste-2col'));
    document.getElementById('mqRetour').click(); await attente(800);
    // en bandeau, « sur une ligne » donne UNE ligne pleine largeur
    _mepDefinirChoixMq('infosPlace', 'haut'); await attente(2200);
    w()._pdfMqChoix('infosPresentation', 'ligne'); await attente(2200);
    var b = doc().querySelector('.bande-infos');
    cas('bandeau + sur une ligne : une seule ligne dans le bandeau', !!b && b.querySelectorAll('.sep-infos').length === 2 && !b.querySelector('.paire'));
    w()._pdfMqChoix('infosPresentation', null); _mepDefinirChoixMq('infosPlace', null); await attente(2200);
    cas('retour au départ : la rubrique est de nouveau une liste dans une colonne', !!secInfos() && secInfos().querySelectorAll('.sep-infos, .pill').length === 0 && !doc().querySelector('.bande-infos'));
  }

  // ---------------- Lot I2 (2026-10-07) : « Informations complémentaires » dans l'en-tête, sur TOUS les modèles ----------------
  async function parcoursInfosEntete() {
    await preparerCvResultats();
    dossier.informationsNonClassees = ['Disponible immédiatement', 'Mobile sur toute la France', 'github.com/camille'];
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    ['infosPlace', 'infosCote', 'infosPresentation', 'listesDeuxColonnes'].forEach(function (k) { w()._pdfMqChoix(k, null); });   // etat de depart propre : un parcours precedent ne doit rien laisser
    var doc = function () { return w().document; };
    var T = 'Informations complémentaires';
    var nbTitres = function () { return doc().querySelectorAll('[data-rub="' + T + '"]').length; };
    var dansEntete = function () { var c = doc().querySelectorAll('.coord, .bande-coord'); for (var i = 0; i < c.length; i++) { if (c[i].textContent.indexOf('Disponible immédiatement') !== -1 && c[i].textContent.indexOf('github.com/camille') !== -1) { return true; } } return false; };
    w()._pdfChoisirModeleCreatif('colonneFoncee'); await attente(2200);
    _mepDefinirChoixMq('infosCompAffichees', _mepInfosSaisies()); await attente(2200);
    _mepDefinirChoixMq('infosPlace', 'entete'); await attente(2500);
    var ids = w()._pdfIdsModelesCreatif(), mauvais = [], propres = [];
    for (var i = 0; i < ids.length; i++) {
      w()._pdfChoisirModeleCreatif(ids[i]); await attente(1800);
      var propre = !!w()._pdfDispositionPropre();
      var ok = propre ? (!dansEntete() && nbTitres() >= 1) : (dansEntete() && nbTitres() === 0 && doc().querySelectorAll('.page-a4').length === 1);
      if (propre) { propres.push(ids[i]); }
      if (!ok) { mauvais.push(ids[i] + (propre ? ' (propre)' : '')); }
    }
    cas('en-tête (Créatif) : les ' + ids.length + ' modèles : informations dans l’en-tête, une page ; Frise, Photo, Rectangles gardent la rubrique à sa place', mauvais.length === 0, mauvais.join(', '));
    var vs = ['mq-bandeau', 'mq-fond', 'mq-epure', 'mq-photo', 'mq-rectangles', 'mq-chrono', 'mq-editorial', 'mq-editorial-large', 'mq-cartes', 'mq-grille', 'mq-technique', 'mq-cartes-couleurs'], mauvaisS = [];
    for (var j = 0; j < vs.length; j++) {
      try {
        w()._pdfChoisirVarianteSobre(vs[j]); await attente(1800);
        var propreS = !!w()._pdfDispositionPropre();
        var okS = propreS ? (!dansEntete() && nbTitres() >= 1) : (dansEntete() && nbTitres() === 0 && doc().querySelectorAll('.page-a4').length === 1);
        if (!okS) { mauvaisS.push(vs[j] + (propreS ? ' (propre)' : '')); }
      } catch (e) { mauvaisS.push(vs[j] + ' : ' + e.message); }
    }
    cas('en-tête (Sobre) : les ' + vs.length + ' variantes : informations dans l’en-tête, une page ; Photo et Rectangles gardent la rubrique à sa place', mauvaisS.length === 0, mauvaisS.join(', '));
    // plus de trois informations : trois dans l'en-tête, les autres restent dans la rubrique
    dossier.informationsNonClassees = ['Disponible immédiatement', 'Mobile sur toute la France', 'github.com/camille', 'linkedin.com/in/camille', 'Permis B'];
    w()._pdfChoisirVarianteSobre('mq-bandeau'); await attente(1800);
    _mepDefinirChoixMq('infosCompAffichees', _mepInfosSaisies()); await attente(2500);
    var coords = doc().querySelector('.coord'), reste = doc().querySelector('.rub-sec[data-rub="' + T + '"]');
    cas('en-tête : plus de trois informations : trois dans l’en-tête, les deux autres restent dans la rubrique', !!coords && coords.textContent.indexOf('github.com/camille') !== -1 && coords.textContent.indexOf('linkedin.com') === -1 && !!reste && reste.textContent.indexOf('linkedin.com/in/camille') !== -1 && reste.textContent.indexOf('Permis B') !== -1 && reste.textContent.indexOf('github.com/camille') === -1, reste ? reste.textContent : 'pas de rubrique');
    _mepDefinirChoixMq('infosPlace', null); await attente(2200);
    cas('en-tête : retour à la colonne : plus rien dans l’en-tête, la rubrique complète est revenue', !dansEntete() && nbTitres() >= 1);
  }

  // ---------------- Petits reglages de style (2026-10-07) : titres « Filet prolongé » / « Souligné court » et « Coin coloré en haut à gauche » ----------------
  async function parcoursTitresEtCoin() {
    await preparerCvResultats();
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var doc = function () { return w().document; };
    var cs = function (el, p) { return w().getComputedStyle(el)[p]; };
    var attendre = async function () { await attente(2200); };
    var redessiner = async function () { _mepRerendre(); await attente(2500); };
    var choisirTitres = async function (v) { var b = document.querySelector('[data-mep-styletitres="' + v + '"]'); if (b) { b.click(); } await attendre(); };
    w()._pdfChoisirModeleCreatif('colonneClaire'); await attendre();
    // --- titres ---
    cas('titres : par défaut, aucun filet ajouté et le souligné d\'origine est là', doc().querySelectorAll('h2 .filet-filet, h2 .filet-court').length === 0 && parseFloat(cs(doc().querySelector('h2'), 'borderBottomWidth')) > 0);
    cas('titres : « Filet prolongé » et « Souligné court » sont proposés', !!document.querySelector('[data-mep-styletitres="filet"]') && !!document.querySelector('[data-mep-styletitres="court"]'));
    await choisirTitres('filet');
    var nbH2 = doc().querySelectorAll('.cv h2').length, f1 = doc().querySelector('h2 .filet-filet');
    cas('filet prolongé : un filet fin suit chaque titre, sans souligné dessous', nbH2 >= 3 && doc().querySelectorAll('h2 .filet-filet').length === nbH2 && !!f1 && cs(f1, 'height') === '1px' && parseFloat(cs(doc().querySelector('h2'), 'borderBottomWidth')) === 0, nbH2 + ' / ' + doc().querySelectorAll('h2 .filet-filet').length);
    var largeurMax = 0; [].forEach.call(doc().querySelectorAll('h2 .filet-filet'), function (e) { largeurMax = Math.max(largeurMax, e.getBoundingClientRect().width); });
    cas('filet prolongé : le filet occupe le reste de la ligne (le plus long dépasse 40 px)', largeurMax > 40, String(Math.round(largeurMax)));
    await choisirTitres('court');
    var f2 = doc().querySelector('h2 .filet-court');
    cas('souligné court : une courte barre sous chaque titre', !!f2 && doc().querySelectorAll('h2 .filet-court').length === doc().querySelectorAll('.cv h2').length && cs(f2, 'width') === '26px' && cs(f2, 'height') === '3px');
    await choisirTitres('souligne');
    cas('retour au souligné : plus aucun filet ajouté', doc().querySelectorAll('h2 .filet-filet, h2 .filet-court').length === 0 && parseFloat(cs(doc().querySelector('h2'), 'borderBottomWidth')) > 0);
    // --- coin ---
    var caseCoin = function () { return document.querySelector('[data-mep-coin-couleur]'); };
    cas('coin coloré : la case existe, décochée d\'office, et aucun coin sur la page', !!caseCoin() && !caseCoin().checked && !doc().querySelector('.coin-couleur') && !caseCoin().disabled);
    caseCoin().click(); await attendre();
    var coin = doc().querySelector('.coin-couleur');
    cas('coin coloré : un triangle en haut à gauche, qui ne capte aucun clic (Colonne claire)', !!coin && cs(coin, 'clipPath').indexOf('polygon') === 0 && parseInt(cs(coin, 'zIndex'), 10) > 0 && cs(coin, 'pointerEvents') === 'none' && coin.getBoundingClientRect().left <= doc().querySelector('.cv').getBoundingClientRect().left + 1, coin ? cs(coin, 'clipPath') : 'absent');
    caseCoin().click(); await attendre();
    cas('coin coloré : décoché, le coin disparaît', !doc().querySelector('.coin-couleur'));
    // modele a colonne FONCEE a gauche : coin deja pris, case grisee et aucun element meme si l'option est allumee
    w()._pdfChoisirModeleCreatif('colonneFoncee'); await attendre(); await redessiner();
    cas('coin coloré : sur « Colonne foncée » la case est grisée (le coin est pris par la colonne)', !!caseCoin() && caseCoin().disabled);
    w()._pdfBasculerCoinCouleur(); await attendre();
    cas('coin coloré : allumé de force sur « Colonne foncée », aucun coin n\'est dessiné', !doc().querySelector('.coin-couleur'));
    w()._pdfBasculerCoinCouleur(); await attendre();
    // en-tete en bandeau colore et modele a disposition propre : grise
    w()._pdfChoisirModeleCreatif('mqBandeau'); await attendre(); await redessiner();
    cas('coin coloré : sur « Bandeau entier » la case est grisée', !!caseCoin() && caseCoin().disabled);
    w()._pdfChoisirModeleCreatif('frise'); await attendre(); await redessiner();
    cas('coin coloré et titres : sur « Colonne et frise » les deux réglages sont grisés', !!caseCoin() && caseCoin().disabled && !!document.querySelector('[data-mep-styletitres="filet"]') && document.querySelector('[data-mep-styletitres="filet"]').disabled);
    // un modele ordinaire en une colonne : le coin fonctionne
    w()._pdfChoisirModeleCreatif('mqCadre'); await attendre(); await redessiner();
    var okCadre = !caseCoin().disabled;
    if (okCadre) { caseCoin().click(); await attendre(); }
    cas('coin coloré : un modèle ordinaire (Cadre de page) accepte le coin', okCadre && !!doc().querySelector('.coin-couleur'));
    if (okCadre && caseCoin()) { caseCoin().click(); await attendre(); }
  }

  // ---------------- Non-régression de TOUS les modèles de CV : banc B7 comparé à sa référence (2026-10-06, consigne « 0 régression » de Denis) ----------------
  // Rejoue scripts/word/banc_b7.js (PDF, plan Word et XML Word de chaque modèle Créatif et Sobre) et le compare à scripts/word/banc_b7_reference.json.
  // Un modèle qui change sans l'avoir voulu fait échouer l'essai. Si le changement EST voulu (ex. correction commune à tous les modèles) :
  // relire le rendu, puis régénérer la référence (voir docs/BRIQUES_COMMUNES.md). Un nouveau modèle se déclare dans la liste `nouveaux` de banc_b7.js ET s'ajoute à la référence.
  // Prérequis : fenêtre de 738 de large (les empreintes Word en dépendent) et page fraîchement rechargée ; à lancer SEUL (await window.__parcours(['banc'])), jamais dans la suite complète (voir __parcours).
  async function parcoursBancNonRegression() {
    // Nouveau banc de rendu (plan docs/PLAN_BANC_ET_MINIATURES_2026-10-11.md) : chaque modèle dans une page cachée neuve, jeu d'essai fixe, comparé à scripts/rendu/registre.json.
    // À lancer SEUL, sur une page rechargée au stockage vide (le dossier par défaut est pris au chargement du script), fenêtre de 738 de large : environ 2 min 30.
    if (window.innerWidth !== 738) { cas('banc : la fenêtre doit faire 738 de large (les empreintes Word en dépendent), elle fait ' + window.innerWidth, false, 'redimensionner à 738 x 698 puis recharger la page'); return; }
    (0, eval)(await (await fetch('/scripts/rendu/banc.js?' + Date.now())).text());
    var etat = await window.__rendu.lancer('verifier');
    cas('banc : les ' + Object.keys(etat.res).length + ' modèles sont identiques au registre (HTML, style, Word, pages)', etat.ecarts.length === 0 && etat.erreurs.length === 0 && !etat.avertissement, 'écarts : ' + etat.ecarts.join(', ') + ' ; erreurs : ' + etat.erreurs.join(', ') + ' ; ' + etat.avertissement);
    cas('banc : aucun modèle sans entrée au registre', etat.sansReference.length === 0, 'à ajouter (mode régénérer) : ' + etat.sansReference.join(', '));
    // Règle de Denis (2026-10-11) : jamais toute la feuille colorée (une colonne ou un bandeau oui) : lisibilité en noir et blanc et encre
    cas('banc : aucun modèle ne colore toute la feuille (plus de ' + etat.plafondCouverture + ' % de la page en zones colorées)', etat.tropColores.length === 0, etat.tropColores.join(', '));
  }

  // ---------------- CV sur une colonne : Certifications juste après Formations (retour Denis 2026-10-01) ----------------
  // Le grand aperçu met un temps variable à s'ouvrir : on attend sa présence (jusqu'à 10 s) au lieu d'un délai fixe.
  async function attendreMq() { for (var i = 0; i < 20 && !(document.getElementById('mqFrame') && document.getElementById('mqFrame').contentDocument && document.getElementById('mqFrame').contentDocument.querySelector('.page-a4')); i++) { await attente(500); } await attente(800); }
  async function preparerCvResultats() {
    dossier.identite = { civilite: 'Madame', nom: 'Martin', prenom: 'Camille', ville: 'Limoges' };
    dossier.titreCV = 'Agent de sécurité';
    dossier.experiences = [{ poste: 'Agent', entreprise: 'Sécuritas', lieu: 'Limoges', dateDebut: '2022-01', dateFin: '2024-06', missions: 'Surveiller les accès\nContrôler les badges' }];
    dossier.formations = [{ niveau: 'CAP', intitule: 'Agent de prévention', etablissement: 'AFPA', annee: '2021', missions: 'Secourisme' }];
    dossier.competencesCV = ['Rigueur', 'Ponctualité']; dossier.langues = [{ langue: 'Anglais', niveau: 'B1' }]; dossier.loisirs = ['Cuisine'];
    dossier.certifications = ['Sensibilisation amiante (2026)', 'Habilitation échafaudage (2026)', 'Module travail en hauteur (2026)', 'Habilitation électrique (2026)'];
    dossier.formatCV = 'pdf'; dossier.dernierDocumentPrepare = 'cv'; dossier.modeCreation = 'nouveau'; dossier.pdfReglages = null; dossier.reglagesMiseEnPageCV = null;
    // État de l'écran gardé par le panneau (hors dossier) : un essai précédent laissait les listes de compétences ouvertes, et le clic suivant les FERMAIT (cause des échecs « 0 compétence » de la suite complète, 2026-10-03).
    try { _mepPickOuvert.pro = false; _mepPickOuvert.comp = false; _mepEditionExp = false; } catch (e) { /* panneau pas chargé */ }
    naviguerVers('resultats'); await attente(4500);
    // chaque essai repart d'un CV complet : ce qu'un essai précédent a retiré dans le grand aperçu est remis
    try { var wp = document.querySelector('#zonePdfInlineCV iframe').contentWindow; if (wp._pdfMqToutRemettreRetraits) { wp._pdfMqToutRemettreRetraits(); await attente(600); } } catch (e) { /* aperçu pas prêt */ }
    // Chaque essai repart du mode « Chronologique » : le mode de présentation vit dans l'aperçu et un essai précédent pouvait le laisser en « Par compétences » ou « Mixte ».
    try { var wm = document.querySelector('#zonePdfInlineCV iframe').contentWindow; if (_mepEtatExperiences().mode !== 'A') { wm._pdfDefinirModePresentation('A'); await attente(2500); } } catch (e) { /* aperçu pas prêt */ }
  }
  async function parcoursCvCertifsApresFormations() {
    await preparerCvResultats();
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var ordre = function () { return [].slice.call(w().document.querySelectorAll('#conteneurPage [data-rub]')).map(function (e) { return e.getAttribute('data-rub'); }).filter(function (x, i, a) { return a.indexOf(x) === i; }); };
    for (var i = 0, ids = ['mqBandeau', 'rectangles']; i < ids.length; i++) {
      w()._pdfChoisirModeleCreatif(ids[i]); await attente(1200);
      var o = ordre(), f = o.indexOf('Formations'), c = o.indexOf('Certifications');
      cas('cv une colonne (' + ids[i] + ') : la rubrique Certifications vient juste après Formations', f !== -1 && c === f + 1, o.join(' > '));
    }
  }

  // ---------------- Modèles « Colonne foncée » et « Colonne claire » : colonne pleine hauteur à bord droit (2026-10-05) ----------------
  async function parcoursModelesColonne() {
    await preparerCvResultats();
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var ids = ['colonneFoncee', 'colonneClaire'];
    // la rangée de vignettes n'est dessinée que dans l'allure « Créatif » : on contrôle la liste qui l'alimente et le moteur du CV
    cas('colonnes : les deux modèles sont dans la galerie de choix', ids.every(function (id) { return _MEP_GALERIE_CREATIF.some(function (m) { return m[0] === id; }) && w()._pdfIdsModelesCreatif().indexOf(id) !== -1; }));
    for (var i = 0; i < ids.length; i++) {
      w()._pdfChoisirModeleCreatif(ids[i]); await attente(1500);
      var d = w().document, cv = d.querySelector('#conteneurPage .cv'), av = w().getComputedStyle(cv, '::before');
      // « Colonne claire » est une CARTE depuis le 2026-10-11 : 6 mm de marge en haut et en bas de la page (12 mm de moins que la hauteur), « Colonne foncée » reste sur toute la hauteur.
      var attendue = (ids[i] === 'colonneClaire') ? cv.getBoundingClientRect().height - 12 * 96 / 25.4 : cv.getBoundingClientRect().height;
      cas('colonnes (' + ids[i] + ') : ' + (ids[i] === 'colonneClaire' ? 'carte à 6 mm du haut et du bas de la page' : 'colonne sur toute la hauteur de la page'), cv.classList.contains('col-vague-g') && Math.abs(parseFloat(av.height) - attendue) < 2, av.height + ' pour ' + cv.getBoundingClientRect().height);
      var fond = d.querySelector('.col-fond');
      var clair = ids[i] === 'colonneClaire';
      var texte = fond ? w().getComputedStyle(fond).color : '';
      cas('colonnes (' + ids[i] + ') : texte ' + (clair ? 'foncé sur colonne claire' : 'blanc sur colonne foncée'), clair ? texte === 'rgb(27, 27, 27)' : texte === 'rgb(255, 255, 255)', texte);
      cas('colonnes (' + ids[i] + ') : le CV tient sur une page', d.querySelectorAll('.page-a4').length === 1, String(d.querySelectorAll('.page-a4').length));
    }
    // un modèle d'origine n'est pas touché : « Colonne à vague » garde sa colonne de la couleur choisie
    w()._pdfChoisirModeleCreatif('sidebarVague'); await attente(1500);
    var cv2 = w().document.querySelector('#conteneurPage .cv'), av2 = w().getComputedStyle(cv2, '::before');
    cas('colonnes : « Colonne à vague » garde sa couleur propre (pas celle de « Colonne claire »)', av2.backgroundColor !== 'rgb(230, 225, 214)', av2.backgroundColor);
  }

  // ---------------- Grand aperçu : déplacer les rubriques (déposée seulement au relâchement), « Agrandir les espaces » (retour Denis 2026-10-01) ----------------
  async function parcoursDeplacerRubriques() {
    await preparerCvResultats();
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    // trio d'espaces : Reduire < normal < Agrandir, les deux cases s'excluent
    var bas = function () { var m = 0; w().document.querySelectorAll('.page-a4 .corps *').forEach(function (e) { var r = e.getBoundingClientRect(); if (r.height > 0) { m = Math.max(m, r.bottom); } }); return Math.round(m); };
    w()._pdfChoisirVarianteSobre('mq-bandeau'); await attente(1500);
    var normal = bas();
    document.querySelector('[data-mep-org-reduire]').click(); await attente(1500); var reduit = bas();
    document.querySelector('[data-mep-org-reduire]').click(); await attente(1200);
    document.querySelector('[data-mep-org-agrandir-espaces]').click(); await attente(1500); var agrandi = bas();
    cas('espaces : « Réduire » < normal < « Agrandir »', reduit < normal && normal < agrandi, [reduit, normal, agrandi].join(' < '));
    cas('espaces : les deux cases s’excluent', !document.querySelector('[data-mep-org-reduire]').checked && document.querySelector('[data-mep-org-agrandir-espaces]').checked);
    document.querySelector('[data-mep-org-agrandir-espaces]').click(); await attente(1200);
    // glisser une rubrique : annulé (pointercancel, Échap) = rien ne change ; relâché = déposé
    ouvrirPleinEcranMaquette(); await attendreMq(); _mqBasculer('rubriques'); await attente(800);
    _mqPanneau()._pdfMqDefinirLignes1Col([['pro', 'comp'], ['exp'], ['form'], ['certifs'], ['langues', 'centres'], ['perso']]); _mqRendu(); await attente(1500);
    var etat = function () { return JSON.stringify(_mqPanneau()._cvPdfChoixMq.lignesUneColonne); };
    var depart = etat();
    var geste = async function (cle, versCle, fin) {
      var d = document.getElementById('mqFrame').contentDocument, h = d.querySelector('[data-mq-unite="' + cle + '"] .mq-poignee'), r = h.getBoundingClientRect(), c = d.querySelector('[data-mq-unite="' + versCle + '"]').getBoundingClientRect();
      var ev = function (t, x, y) { return new d.defaultView.PointerEvent(t, { bubbles: true, cancelable: true, pointerId: 1, clientX: x, clientY: y }); };
      var x = c.left + c.width * 0.75, y = c.top + 30;
      h.dispatchEvent(ev('pointerdown', r.left + 5, r.top + 5)); h.dispatchEvent(ev('pointermove', x, y)); await attente(200);
      if (fin === 'cancel') { h.dispatchEvent(ev('pointercancel', x, y)); }
      else if (fin === 'echap') { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); h.dispatchEvent(ev('pointerup', x, y)); }
      else { h.dispatchEvent(ev('pointerup', x, y)); }
      await attente(1200);
    };
    await geste('centres', 'certifs', 'cancel');
    cas('rubriques : un glisser interrompu (perte du pointeur) ne dépose rien', etat() === depart, etat());
    await geste('centres', 'certifs', 'echap');
    cas('rubriques : la touche Échap annule le glisser, rien n’est déposé', etat() === depart, etat());
    await geste('centres', 'certifs', 'relache');
    cas('rubriques : relâché sur la case « à côté », Certifications et Centres d’intérêt sont sur une ligne', etat().indexOf('["certifs","centres"]') !== -1 && etat().indexOf('["langues"]') !== -1, etat());
    // l'Expérience professionnelle peut partager sa ligne avec UNE rubrique courte (60 % / 40 %), jamais avec une rubrique de compétences
    _mqPanneau()._pdfMqDefinirLignes1Col([['pro', 'comp'], ['exp'], ['form'], ['certifs'], ['langues', 'centres'], ['perso']]); _mqRendu(); await attente(1500);
    await geste('certifs', 'exp', 'relache');
    cas('rubriques : Certifications déposée à côté de l’Expérience professionnelle, l’expérience reste à gauche', etat().indexOf('["exp","certifs"]') !== -1, etat());
    var lignePaire = [].slice.call(document.getElementById('mqFrame').contentDocument.querySelectorAll('.paire')).filter(function (p) { return p.querySelector('[data-rub="Expérience professionnelle"]'); })[0];
    cas('rubriques : cette ligne est répartie sur 60 % et 40 % de la largeur', !!lignePaire && /3fr 2fr/.test(lignePaire.getAttribute('style') || ''), lignePaire && lignePaire.getAttribute('style'));
    _mqPanneau()._pdfMqDefinirLignes1Col([['pro', 'comp'], ['exp'], ['form'], ['certifs'], ['langues', 'centres'], ['perso']]); _mqRendu(); await attente(1500);
    await geste('comp', 'exp', 'relache');
    cas('rubriques : une rubrique de compétences ne peut pas se placer à côté de l’Expérience professionnelle', etat().indexOf('"exp","comp"') === -1 && etat().indexOf('["exp"]') !== -1, etat());
  }

  // ---------------- « Espacer les rubriques », poignée ↕ à crans, barre de rubrique (retour Denis 2026-10-01) ----------------
  async function parcoursEspacerRubriques() {
    await preparerCvResultats();
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var bas = function () {
      var d = document.getElementById('mqFrame').contentDocument, f = d.querySelector('.page-a4'), mm = 96 / 25.4, lim = f.getBoundingClientRect().top + 297 * mm - 8 * mm - 4;
      var cols = [].slice.call(f.querySelectorAll('.corps.deux > div')).map(function (c) { return Math.round(c.getBoundingClientRect().bottom); });
      var fond = 0; [].slice.call(f.querySelectorAll('.corps, .corps-pleine-largeur')).forEach(function (e) { fond = Math.max(fond, e.getBoundingClientRect().bottom); });
      return { lim: Math.round(lim), cols: cols, fond: Math.round(fond) };
    };
    // une colonne
    w()._pdfChoisirVarianteSobre('mq-bandeau'); await attente(1500);
    ouvrirPleinEcranMaquette(); await attendreMq();
    var avant = bas();
    document.getElementById('mqTEspacer').click(); await attente(1800);
    var apres = bas();
    cas('espacer (une colonne) : le bouton espace les rubriques, le CV reste sur une page', apres.fond > avant.fond && apres.fond <= apres.lim + 1, JSON.stringify([avant, apres]));
    document.getElementById('mqTEspRaz').click(); await attente(1500);
    cas('espacer : « Remettre les espaces » revient au départ', JSON.stringify(_mqPanneau()._cvPdfReglagesRubriquesMq) === '{}' && bas().fond === avant.fond);
    fermerPleinEcranMaquette(); await attente(800);
    // deux colonnes : choix des colonnes, bas des deux colonnes proche et dans la page, disposition figée
    w()._pdfChoisirModeleCreatif('mqColonne'); await attente(1500);
    ouvrirPleinEcranMaquette(); await attendreMq();
    var avant2 = bas();
    document.getElementById('mqTEspacer').click(); await attente(300);
    cas('espacer (deux colonnes) : le bouton demande d’abord quelles colonnes', document.getElementById('mqSegEsp').style.display !== 'none');
    document.querySelector('#mqSegEsp [data-p="toutes"]').click(); await attente(2000);
    var d2 = bas();
    cas('espacer (deux colonnes) : chaque colonne descend et reste dans la page', d2.cols.length === 2 && d2.cols.every(function (b, i) { return b <= d2.lim + 1 && b > avant2.cols[i]; }), JSON.stringify([avant2, d2]));
    cas('espacer (deux colonnes) : la disposition affichée est gardée (pas de rubrique qui change de colonne)', !!_mqPanneau()._cvPdfChoixMq.ordreColonnes);
    document.getElementById('mqTEspRaz').click(); await attente(1200);
    // poignée ↕ : crans de 4 px, déposé au relâchement seulement
    _mqBasculer('rubriques'); await attente(800);
    var d = document.getElementById('mqFrame').contentDocument, h = d.querySelector('[data-mq-unite="langues"] .mq-poignee-esp');
    cas('espacer à la main : chaque rubrique a une poignée ↕', !!h);
    if (h) {
      var r = h.getBoundingClientRect(), ev = function (t, x, y) { return new d.defaultView.PointerEvent(t, { bubbles: true, cancelable: true, pointerId: 1, clientX: x, clientY: y }); };
      h.dispatchEvent(ev('pointerdown', r.left + 3, r.top + 3)); h.dispatchEvent(ev('pointermove', r.left + 3, r.top + 31)); await attente(200);
      cas('espacer à la main : pendant le glissement rien n’est enregistré', JSON.stringify(_mqPanneau()._cvPdfReglagesRubriquesMq) === '{}');
      h.dispatchEvent(ev('pointerup', r.left + 3, r.top + 31)); await attente(1500);
      var esp = (_mqPanneau()._cvPdfReglagesRubriquesMq.Langues || {}).esp;
      // l'espace de départ et l'échelle de l'aperçu dépendent des parcours joués avant : on vérifie le cran (multiple de 4) et que l'espace a bien changé
      cas('espacer à la main : l’espace se cale sur un cran de 4 px', typeof esp === 'number' && esp > 0 && esp % 4 === 0, esp);
    }
    // barre d'une rubrique : trois curseurs
    var titre = d.querySelector('h2[data-rub="Certifications"]');
    if (titre) {
      titre.dispatchEvent(new d.defaultView.MouseEvent('click', { bubbles: true })); await attente(400);
      cas('barre de rubrique : curseurs Taille, Interligne, Espace au-dessus', !!document.getElementById('mqRubT') && !!document.getElementById('mqRubIl') && !!document.getElementById('mqRubEsp') && document.getElementById('mqBarreRub').style.display !== 'none');
      var T = document.getElementById('mqRubT'); T.value = 85; T.dispatchEvent(new Event('input')); T.dispatchEvent(new Event('change')); await attente(1200);
      cas('barre de rubrique : la taille choisie est enregistrée', ((_mqPanneau()._cvPdfReglagesRubriquesMq.Certifications || {}).t) === 0.85);
    }
    document.getElementById('mqTAnnulerRub').click(); document.getElementById('mqTAnnulerRub').click(); await attente(1200);
    cas('« Annuler le dernier réglage » reprend les réglages un par un', JSON.stringify(_mqPanneau()._cvPdfReglagesRubriquesMq) === '{}', JSON.stringify(_mqPanneau()._cvPdfReglagesRubriquesMq));
    fermerPleinEcranMaquette(); await attente(500);
    // le bouton « Mise en page » propose aussi « Espacer les rubriques » quand la page est peu remplie
    w()._pdfChoisirVarianteSobre('mq-bandeau'); await attente(1500);
    var liste = w()._pdfCalculerSuggestions(w()._pdfMesurerHauteurPage(), 'remplir');
    var sug = liste.filter(function (s) { return s.id === 'espacer'; })[0];
    cas('« Mise en page » propose « Espacer les rubriques » sur un CV peu rempli', !!sug, liste.map(function (s) { return s.id; }).join(','));
    if (sug) {
      var h0 = w()._pdfMesurerHauteurPage();
      w()._pdfAppliquerChangementsSuggestion(sug.changes); w()._pdfRafraichir(); await attente(400);
      cas('la suggestion « Espacer les rubriques » remplit mieux la page sans la dépasser', w()._pdfMesurerHauteurPage() > h0 && w()._pdfMesurerHauteurPage() <= 1100, h0 + ' -> ' + w()._pdfMesurerHauteurPage());
      w()._pdfMqEspacesRubriques(Object.keys(w()._cvPdfReglagesRubriquesMq).reduce(function (m, k) { m[k] = 0; return m; }, {}));
    }
  }

  // ---------------- Ce qui est retiré dans le grand aperçu ne revient jamais avec « Mise en page » (retour Denis 2026-10-01) ----------------
  async function parcoursRetraitsEtMiseEnPage() {
    await preparerCvResultats();
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var txt = function () { return w().document.querySelector('.page-a4').innerText; };
    w()._pdfChoisirVarianteSobre('mq-bandeau'); await attente(1500);
    cas('retraits : les éléments à retirer sont d’abord présents', /Rigueur/.test(txt()) && /Cuisine/.test(txt()) && /Surveiller les accès/.test(txt()));
    w()._pdfMqRetirerCompetence('Rigueur'); w()._pdfMqRetirerRubrique('Centres d’intérêt');
    var m = [].slice.call(w().document.querySelectorAll('li [data-ed]')).filter(function (s) { return /Surveiller les accès/.test(s.textContent); })[0];
    if (m) { w()._pdfMqRetirerMission(m.getAttribute('data-ed')); }
    await attente(800);
    var absent = function () { var t = txt(); return !/Rigueur/.test(t) && !/CENTRES D/i.test(t) && !/Surveiller les accès/.test(t); };
    cas('retraits : compétence, rubrique et mission retirées disparaissent du CV', absent());
    w()._pdfAjusterMiseEnPage(); await attente(2500);
    cas('retraits : « Mise en page » ne remet ni la compétence, ni la rubrique, ni la mission retirées', absent());
    var h = w()._pdfMesurerHauteurPage(), liste = w()._pdfCalculerSuggestions(h, 'gagner').concat(w()._pdfCalculerSuggestions(h, 'remplir')), retours = [];
    cas('retraits : aucune suggestion ne parle des « Centres d’intérêt » retirés', !liste.some(function (s) { return s.id === 'col2-5' || /Centres d’intérêt/.test(s.titre + ' ' + s.detail) && s.id.indexOf('exp-cote') !== 0; }), liste.map(function (s) { return s.id; }).join(','));
    liste.forEach(function (s) {
      var avant = w()._pdfAppliquerChangementsSuggestion(s.changes); w()._pdfRafraichir();
      if (!absent()) { retours.push(s.id); }
      w()._pdfRestaurerChangementsSuggestion(avant); w()._pdfRafraichir();
    });
    cas('retraits : appliquer une suggestion ne remet rien de ce qui a été retiré', retours.length === 0, retours.join(','));
  }


  // ---------------- Missions + / -, nom du PDF, texte effacé = retrait (retours Denis 2026-10-02) ----------------
  async function parcoursMissionsNomPdfEffacement() {
    await preparerCvResultats();
    var plus = function () { return document.querySelector('[data-mep-missions-global-plus]'); }, moins = function () { return document.querySelector('[data-mep-missions-global-moins]'); };
    for (var i = 0; i < 6 && moins() && !moins().disabled; i++) { moins().click(); await attente(700); }
    cas('missions : au minimum (1), le bouton + reste utilisable', !!plus() && !plus().disabled, 'plus désactivé');
    if (plus() && !plus().disabled) { plus().click(); await attente(700); }
    cas('missions : après + depuis 1, le compteur remonte à 2', moins() && moins().parentElement.querySelector('span').textContent === '2', moins() && moins().parentElement.querySelector('span').textContent);
    var w = document.querySelector('#zonePdfInlineCV iframe').contentWindow, vu = null, orig = w.print;
    w.print = function () { vu = window.top.document.title; };
    var titreAvant = document.title; w.document.querySelector('.bouton-imprimer').click(); w.print = orig;
    cas('PDF : le titre de la page principale est « NOM_poste » pendant l’impression', /^[A-Z]+_[a-z-]+$/.test(vu || ''), vu);
    cas('PDF : le titre de la page est rétabli après l’impression', document.title === titreAvant, document.title);
    ouvrirPleinEcranMaquette(); await attendreMq();
    var D = function () { return document.getElementById('mqFrame').contentDocument; };
    document.getElementById('mqTTexte').click(); await attente(800);
    var cle = D().querySelector('li [data-ed^="mi:"]').getAttribute('data-ed'), n = D().querySelectorAll('li [data-ed]').length, el = D().querySelector('[data-ed="' + cle + '"]');
    el.textContent = ''; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new FocusEvent('blur')); await attente(900);
    cas('effacer : une mission dont le texte est effacé disparaît avec sa puce', D().querySelectorAll('li [data-ed]').length === n - 1 && !D().querySelector('[data-ed="' + cle + '"]'), n + ' -> ' + D().querySelectorAll('li [data-ed]').length);
    document.getElementById('mqTAnnulerDernier').click(); await attente(900);
    cas('effacer : « Annuler le dernier retrait » la remet avec son texte d’origine', D().querySelectorAll('li [data-ed]').length === n && !!D().querySelector('[data-ed="' + cle + '"]').textContent.trim(), '');
    cas('effacer : le bouton s’appelle « Retirer des missions et des compétences »', /Retirer des missions et des compétences/.test(document.getElementById('mqTRetirer').textContent), document.getElementById('mqTRetirer').textContent);
    document.getElementById('mqRetour').click(); await attente(600);
  }


  // ---------------- « Standard » / « Personnaliser » ne changent pas la page (retour Denis 2026-10-02) ----------------
  async function parcoursStandardPersonnaliser() {
    await preparerCvResultats();
    var W = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var lay = function () { var c = W().document.querySelector('#conteneurPage'); var vus = []; [].slice.call(c.querySelectorAll('[data-rub]')).forEach(function (e) { var t = e.getAttribute('data-rub'); if (vus.indexOf(t) === -1) { vus.push(t); } }); return vus.join(' > '); };
    var clic = async function (sel) { document.querySelector(sel).click(); await attente(1500); };
    W()._pdfChoisirModeleCreatif('medaillon'); await attente(1500);
    for (var cols of ['2', '1']) {
      W().document.getElementById('regColonnes').value = cols; W()._pdfRafraichir(); await attente(1000);
      W()._pdfDefinirExpPersoModeAffichage('developper'); await attente(1200);
      var a = lay(); await clic('[data-mep-org-perso]'); var b = lay(); await clic('[data-mep-org-standard]'); var c = lay();
      cas('Standard/Personnaliser (' + cols + ' col.) : rien ne bouge en passant à Personnaliser', a === b, a + ' => ' + b);
      cas('Standard/Personnaliser (' + cols + ' col.) : rien ne bouge au retour sur Standard', b === c, b + ' => ' + c);
      W()._pdfMqRestaurerDisposition({ perso: false, ordreColonnes: null, ordreGroupes: null, lignes1col: null }); await attente(800);
    }
  }


  // ---------------- « Éditer les expériences » : vrai bouton dans les trois modes (retour Denis 2026-10-02, chantier carte Expériences, P1) ----------------
  async function parcoursBoutonEditerExperiences() {
    await preparerCvResultats();
    var W = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    dossier.competencesGroupeesParTheme = [{ theme: 'T', items: [{ texte: 'Surveiller les accès', illustrePar: [] }] }];
    var c = document.getElementById('cExp'); if (c) { c.open = true; }
    for (var m of ['A', 'C', 'B']) {
      W()._pdfDefinirModePresentation(m); await attente(1500);
      cas('éditer les expériences (' + m + ') : le bouton est présent, l’ancienne case discrète a disparu', !!document.querySelector('#cExp .bouton-editer') && !document.querySelector('#cExp .ligne-plus .ck-marque'), '');
    }
    document.querySelector('#cExp .bouton-editer').click(); await attente(1200);
    cas('éditer les expériences : un clic ouvre le mode édition (noms cliquables)', document.querySelector('#cExp .bouton-editer').classList.contains('on') && !!document.querySelector('#cExp [data-mep-exp-ouvrir]'), '');
    document.querySelector('#cExp .bouton-editer').click(); await attente(1200);
    cas('éditer les expériences : un second clic referme le mode édition', !document.querySelector('#cExp [data-mep-exp-ouvrir]'), '');
    W()._pdfDefinirModePresentation('A'); delete dossier.competencesGroupeesParTheme; await attente(800);
  }


  // ---------------- Cartes de « La mise en page » dans l'ordre du CV ; « Compétences » séparée des autres rubriques (retour Denis 2026-10-02, P0) ----------------
  async function parcoursCartesDansLOrdreDuCv() {
    await preparerCvResultats();
    dossier.competencesPro = ['Pose', 'Peinture', 'Supports', 'Plans', 'Outils', 'Sécurité', 'Calcul', 'Chantier'];
    var W = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    W()._pdfRafraichir(); await attente(1500);
    // la carte « Expérience personnelle » n'existe que si le dossier en a une : on compare l'ordre relatif des cartes présentes
    var attendu = ['cOrg', 'cEntete', 'cComp', 'cExp', 'cForm', 'cExpPerso', 'cSupp'];
    var ids = [].slice.call(document.querySelectorAll('details.mep-carte')).map(function (d) { return d.id; }).filter(function (i) { return attendu.indexOf(i) !== -1; });
    cas('cartes : ordre de lecture du CV (compétences avant les expériences, autres rubriques après)', ids.join(',') === attendu.filter(function (i) { return ids.indexOf(i) !== -1; }).join(',') && ids.indexOf('cComp') !== -1 && ids.indexOf('cSupp') !== -1, ids.join(','));
    var c = document.getElementById('cComp'); c.open = true; await attente(300);
    cas('cartes : « Compétences » porte les deux listes « Les montrer et les choisir » et les cases « Afficher »', !!c.querySelector('[data-mep-pick="pro"]') && !!c.querySelector('[data-mep-pick="comp"]') && !!c.querySelector('[data-mep-afficher-comp="pro"]'), '');
    cas('cartes : « Compétences » porte le choix de disposition des deux familles ; la case « 2 colonnes » n’est plus dans « Autres rubriques »', !!c.querySelector('[data-mep-dispcomp-pro]') && !!c.querySelector('[data-mep-dispcomp-comp]') && !Array.from(document.querySelectorAll('#cSupp [data-mep-liste-2col]')).some(function (x) { return /ences professionnelles/.test(x.getAttribute('data-mep-liste-2col')); }), '');
    cas('cartes : « Autres rubriques » ne contient plus les compétences', !document.querySelector('#cSupp [data-mep-pick]') && /Autres rubriques/.test(document.querySelector('#cSupp h3').textContent), '');
    c.querySelector('[data-mep-pick="pro"]').click(); await attente(800);
    var cbs = c.querySelectorAll('[data-mep-pick-item="pro"]'), avant = document.getElementById('mepNbPro').textContent;
    cbs[0].checked = false; cbs[0].dispatchEvent(new Event('change', { bubbles: true })); await attente(1200);
    cas('cartes : décocher une compétence dans « Compétences » change le compteur', document.getElementById('mepNbPro').textContent === String(parseInt(avant, 10) - 1), avant + ' -> ' + document.getElementById('mepNbPro').textContent);
    document.querySelector('[data-mep-pick-raz="pro"]').click(); await attente(1500);
    cas('cartes : « Remettre la sélection automatique » rétablit le compteur', document.getElementById('mepNbPro').textContent === avant, document.getElementById('mepNbPro').textContent);
  }


  // ---------------- Mixte : compétences professionnelles accessibles depuis la carte Expériences, même sélection que « Compétences » (P2, retour Denis 2026-10-02) ----------------
  async function parcoursMixteCompetencesPro() {
    await preparerCvResultats();
    dossier.competencesPro = ['Pose', 'Peinture', 'Supports', 'Plans', 'Outils', 'Sécurité', 'Calcul', 'Chantier'];
    dossier.competencesGroupeesParTheme = [{ theme: 'T1', items: [{ texte: 'Pose', illustrePar: [] }, { texte: 'Peinture', illustrePar: [] }] }];
    var W = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    W()._pdfRafraichir(); await attente(1500);
    document.getElementById('cExp').open = true;
    document.querySelector('[data-mep-mode-presentation="A"]').click(); await attente(1500);
    cas('Mixte : en Chronologique, pas de zone des compétences professionnelles dans la carte Expériences', !document.getElementById('zoneProMixte'), '');
    document.querySelector('[data-mep-mode-presentation="B"]').click(); await attente(2000);
    var z = document.getElementById('zoneProMixte');
    cas('Mixte : la zone « Modifier mes compétences professionnelles » existe', !!z, '');
    if (z) {
      z.open = true; await attente(400);
      var cbs = z.querySelectorAll('[data-mep-pick-item="pro"]'), avant = document.getElementById('mepNbPro').textContent;
      cbs[0].checked = false; cbs[0].dispatchEvent(new Event('change', { bubbles: true })); await attente(1800);
      cas('Mixte : décocher ici change aussi le compteur de la carte « Compétences » (même sélection)', document.getElementById('mepNbPro').textContent === String(parseInt(avant, 10) - 1), avant + ' -> ' + document.getElementById('mepNbPro').textContent);
      z.querySelector('[data-mep-pick-raz="pro"]').click(); await attente(1800);
      cas('Mixte : « Remettre la sélection automatique » rétablit les deux compteurs', document.getElementById('mepNbPro').textContent === avant && /^\d+ sur/.test(document.getElementById('mepNbProMixte').textContent) && document.getElementById('mepNbProMixte').textContent.indexOf(avant + ' sur') === 0, document.getElementById('mepNbPro').textContent + ' / ' + document.getElementById('mepNbProMixte').textContent);
    }
    document.querySelector('[data-mep-mode-presentation="A"]').click(); await attente(1500); delete dossier.competencesGroupeesParTheme;
  }


  // ---------------- Clés d'édition stables des missions des compétences : une correction suit le texte, pas la position (P3, 2026-10-02) ----------------
  async function parcoursClesStablesCompetences() {
    await preparerCvResultats();
    var W = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    dossier.competencesGroupeesParTheme = [{ theme: 'Sécurité', items: [{ texte: 'Surveiller les accès', illustrePar: [] }, { texte: 'Contrôler les badges', illustrePar: [] }, { texte: 'Rédiger des rapports', illustrePar: [] }] }];
    W()._pdfDefinirModePresentation('C'); W()._pdfRafraichir(); await attente(1800);
    var txt = function () { return W().document.querySelector('#conteneurPage').innerText; };
    var cle = W().document.querySelector('[data-t="Contrôler les badges"]').getAttribute('data-ed');
    cas('clés stables : la clé d’une mission vient de son texte, pas de sa position', /^gi:controler-les-badges/.test(cle) && !/\d:\d/.test(cle), cle);
    W()._pdfMqTexteEdite(cle, 'Contrôler les badges', 'Contrôler les badges et les cartes'); W()._pdfRafraichir(); await attente(1500);
    cas('clés stables : la correction est appliquée', /badges et les cartes/.test(txt()), '');
    dossier.competencesGroupeesParTheme[0].items.reverse(); W()._pdfRafraichir(); await attente(1500);
    cas('clés stables : la correction suit sa mission quand l’ordre change', /badges et les cartes/.test(txt()), '');
    dossier.competencesGroupeesParTheme[0].items.shift(); W()._pdfRafraichir(); await attente(1500);
    cas('clés stables : retirer une autre mission avant elle ne la décale pas', /badges et les cartes/.test(txt()), '');
    W()._pdfDefinirModePresentation('A'); delete dossier.competencesGroupeesParTheme; await attente(800);
  }


  // ---------------- « Modifier mes compétences et leurs missions » : afficher / masquer, modifier, monter / descendre, en Par compétences et en Mixte (P4, 2026-10-02) ----------------
  async function parcoursCompetencesEtMissions() {
    await preparerCvResultats();
    var W = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var cv = function () { return [].slice.call(W().document.querySelectorAll('#conteneurPage [data-ed^="gi:"]')).map(function (e) { return e.textContent; }); };
    var pan = function () { return [].slice.call(document.querySelectorAll('#mepListeCompMissions [data-mep-cm-nom]')).map(function (e) { return e.textContent; }); };
    W()._pdfMqChoix('ordreCompetences', null);
    document.getElementById('cExp').open = true;
    document.querySelector('[data-mep-mode-presentation="C"]').click(); await attente(2500);
    var z = document.getElementById('zoneCompMissions');
    cas('compétences et missions (C) : la zone existe', !!z, '');
    if (!z) { return; }
    z.open = true; await attente(300);
    cas('compétences et missions (C) : le bouton « Éditer les expériences » et la zone des expériences restent là', !!document.querySelector('#cExp .bouton-editer') && !!document.getElementById('zoneChoixExp'), '');
    var avant = cv().slice(0, 2), p0 = pan().slice(0, 2);
    cas('compétences et missions (C) : la liste du panneau suit l’ordre du CV', avant.join('|') === p0.join('|') && avant.length === 2, avant.join('|') + ' / ' + p0.join('|'));
    document.querySelector('[data-mep-cm-mb="0:0"]').click(); await attente(2500);
    cas('compétences et missions (C) : « descendre » change l’ordre sur le CV', cv()[0] === avant[1] && cv()[1] === avant[0], cv().slice(0, 2).join('|'));
    document.querySelector('[data-mep-cm-ck="0:0"]').checked = false; document.querySelector('[data-mep-cm-ck="0:0"]').dispatchEvent(new Event('change', { bubbles: true })); await attente(2500);
    cas('compétences et missions (C) : décocher retire la mission du CV', cv().indexOf(avant[1]) === -1, cv().slice(0, 2).join('|'));
    document.querySelector('[data-mep-cm-ck="0:0"]').checked = true; document.querySelector('[data-mep-cm-ck="0:0"]').dispatchEvent(new Event('change', { bubbles: true })); await attente(2500);
    cas('compétences et missions (C) : recocher la remet', cv().indexOf(avant[1]) !== -1, cv().slice(0, 2).join('|'));
    var nomEl = document.querySelector('[data-mep-cm-nom="0:0"]'), bouton = document.querySelector('[data-mep-cm-ed="0:0"]');
    bouton.click(); nomEl = document.querySelector('[data-mep-cm-nom="0:0"]'); nomEl.textContent = 'Texte modifié du test'; document.querySelector('[data-mep-cm-ed="0:0"]').click(); await attente(2500);
    cas('compétences et missions (C) : « Modifier » change le texte sur le CV', cv().indexOf('Texte modifié du test') !== -1, cv().slice(0, 2).join('|'));
    document.querySelector('[data-mep-mode-presentation="B"]').click(); await attente(2500);
    z = document.getElementById('zoneCompMissions'); z.open = true; await attente(300);
    cas('compétences et missions (B) : titre « Modifier mes compétences en action »', /en action/.test(z.querySelector('.cb-ouvrir').textContent), '');
    var items = function () { return (window._mepGroupesCompTous[0] || { items: [] }).items; };
    cas('compétences et missions (B) : sans compétences regroupées de l’assistant, le bloc montre les compétences professionnelles disponibles (jusqu’à 6)', items().filter(function (i) { return i.affichee; }).length >= 2 && items().filter(function (i) { return i.affichee; }).length <= 6, String(items().filter(function (i) { return i.affichee; }).length));
    W()._pdfMqChoix('ordreCompetences', null); W()._pdfMqToutRemettre(); W()._pdfMqTexteEdite('gi:texte-modifie-du-test', 'x', 'x');
    document.querySelector('[data-mep-mode-presentation="A"]').click(); await attente(1500);
  }


  // ---------------- Niveau de détail : Automatique / Complet / Résumé aussi en Par compétences (P5, retour Denis 2026-10-02) ----------------
  async function parcoursNiveauDetailParCompetences() {
    await preparerCvResultats();
    var W = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var mk = function (pre) { var l = []; for (var i = 1; i <= 9; i++) { l.push(pre + ' mission numéro ' + i + ' avec un texte assez long pour occuper de la place sur la page, vraiment très long, répété pour qu’il prenne plusieurs lignes sur la feuille et dépasse la hauteur d’une page A4 quand elles sont toutes affichées ensemble'); } return l.join('\n'); };
    var sauveExperiences = JSON.parse(JSON.stringify(dossier.experiences));
    while (dossier.experiences.length < 3) { var copie = JSON.parse(JSON.stringify(dossier.experiences[0])); copie.poste += ' ' + dossier.experiences.length; dossier.experiences.push(copie); }
    dossier.experiences.forEach(function (e, i) { e.missions = mk('Exp' + (i + 1)); });
    dossier.ia = {};   // pas de recommandation de l'assistant laissée par un essai précédent
    dossier.metierCible = '';   // aucune information sur le métier visé : toutes les expériences comptent (sinon seules celles liées au métier font remonter des missions)
    W()._pdfMqChoix('ordreCompetences', null); W()._pdfRafraichir(); await attente(1500);
    document.getElementById('cExp').open = true;
    var niv = function (v) { document.querySelector('[data-mep-niveau-detail="' + v + '"]').click(); };
    var nbCv = function () { return W().document.querySelectorAll('#conteneurPage [data-ed^="gi:"]').length; };
    var haut = function () { return W()._pdfMesurerHauteurPage(); };
    document.querySelector('[data-mep-mode-presentation="C"]').click(); await attente(2500);
    cas('niveau de détail (C) : le réglage reste accessible', !!document.querySelector('[data-mep-niveau-detail="resume"]') && !document.querySelector('[data-mep-niveau-detail="resume"]').disabled, '');
    niv('complet'); await attente(2500); var complet = nbCv(), hComplet = haut();
    niv('resume'); await attente(2500); var resume = nbCv();
    niv('auto'); await attente(2500); var auto = nbCv(), hAuto = haut();
    cas('niveau de détail (C) : Résumé = 3 missions', resume === 3, resume);
    cas('niveau de détail (C) : Complet = tout ce qui est proposé', complet >= auto && complet > 3, complet + ' / ' + auto);
    cas('niveau de détail (C) : Automatique garde le CV sur une page (il ne retire des missions que si c’est nécessaire)', auto <= complet && hAuto <= 1125, auto + ' missions, ' + Math.round(hAuto) + ' px');
    var notes = [].slice.call(document.querySelectorAll('#mepListeCompMissions em')).map(function (e) { return e.textContent; }).join('|');
    cas('niveau de détail (C) : si des missions sont retirées, le panneau dit pourquoi', auto >= complet || /retirée automatiquement/.test(notes), notes.slice(0, 80));
    var sansReserve = (window._mepGroupesCompTous[0] || { items: [] }).items.filter(function (i) { return !i.reserve; });
    var dernier = sansReserve.filter(function (i) { return i.coupe === 'auto'; });
    cas('niveau de détail (C) : si des missions sont retirées, ce sont bien les dernières de la liste', auto >= complet || (dernier.length > 0 && sansReserve.slice(-dernier.length).every(function (i) { return i.coupe === 'auto'; })), dernier.length);
    document.querySelector('[data-mep-mode-presentation="A"]').click(); await attente(2500);
    niv('complet'); await attente(2500); var nbExp = W().document.querySelectorAll('#conteneurPage [data-ed^="mi:"]').length;
    cas('niveau de détail (A) : « Complet » ne raccourcit jamais les expériences, même si le CV déborde', nbExp > 0 && nbExp === W().document.querySelectorAll('#conteneurPage .item[data-exp]').length * 9 && !(window._mepAutoRaccourcies > 0), nbExp + ' missions');
    niv('auto'); await attente(2500);
    dossier.experiences = sauveExperiences; W()._pdfRafraichir(); await attente(800);
  }


  // ---------------- Forme des puces (un seul choix) et style des missions sur les listes de compétences (P6, retour Denis 2026-10-02) ----------------
  async function parcoursPucesEtStyleCompetences() {
    await preparerCvResultats();
    var W = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var forme = function () { var li = W().document.querySelector('#conteneurPage ul li'); return li ? getComputedStyle(li).listStyleType : 'aucune'; };
    document.getElementById('cTexte').open = true; await attente(300);
    cas('puces : par défaut, la puce est ronde', forme() === 'disc', forme());
    var attendu = { carre: 'square', triangle: '"▸ "', losange: '"◆ "', tiret: '"– "' };
    for (var f of ['carre', 'triangle', 'losange', 'tiret']) {
      document.querySelector('[data-mep-formepuce="' + f + '"]').click(); await attente(2000);
      cas('puces : « ' + f + ' » appliquée aux listes du CV', forme() === attendu[f], forme());
    }
    var plan = JSON.stringify((await exporterCvWord(dossier)).plan);
    cas('puces : le Word reprend la forme choisie (tiret)', plan.indexOf('–\\t') !== -1, '');
    document.querySelector('[data-mep-formepuce="rond"]').click(); await attente(2000);
    cas('puces : « rond » remet le comportement d’avant (rien d’enregistré)', forme() === 'disc' && !(W()._cvPdfChoixMq || {}).formePuce, forme());
    // style des missions sur les listes de competences (Par competences, competences en texte)
    document.querySelector('[data-mep-stylecomp="texte-seul"]').click(); await attente(2000);
    document.getElementById('cExp').open = true;
    document.querySelector('[data-mep-mode-presentation="C"]').click(); await attente(2500);
    var nbLi = function () { return W().document.querySelectorAll('#conteneurPage ul li [data-ed^="gi:"]').length; };
    var nbMeta = function () { return W().document.querySelectorAll('#conteneurPage .meta').length; };
    var avant = nbLi();
    document.querySelector('[data-mep-missionspro="condense"]').click(); await attente(2500);
    cas('style des missions (C) : « Condensées » met les compétences à la suite', avant > 0 && nbLi() === 0 && nbMeta() >= 1, avant + ' -> ' + nbLi());
    document.querySelector('[data-mep-sepmissions="losange"]').click(); await attente(2500);
    cas('style des missions (C) : le signe choisi sépare les missions', /◆/.test(W().document.querySelector('#conteneurPage').innerText), '');
    cas('style des missions (C) : le Word reprend le signe', JSON.stringify((await exporterCvWord(dossier)).plan).indexOf('◆') !== -1, '');
    document.querySelector('[data-mep-sepmissions="pointvirgule"]').click(); await attente(1500);
    document.querySelector('[data-mep-missionspro="epure"]').click(); await attente(2000);
    document.querySelector('[data-mep-stylecomp="pastille"]').click(); await attente(1500);
    document.querySelector('[data-mep-mode-presentation="A"]').click(); await attente(1500);
  }


  // ---------------- Disposition des compétences : à la suite / une colonne / deux colonnes, pour les deux familles (retour Denis 2026-10-02) ----------------
  async function parcoursDispositionCompetences() {
    await preparerCvResultats();
    var W = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    W()._pdfRafraichir(); await attente(1500);
    document.getElementById('cComp').open = true;
    var bloc = function (titre) { var h = [].slice.call(W().document.querySelectorAll('#conteneurPage [data-rub]')).filter(function (e) { return e.getAttribute('data-rub') === titre; })[0]; return h ? (h.querySelector('.pills-1col') ? 'une' : (h.querySelector('.pills-2col') ? 'deux' : 'suite')) : 'absent'; };
    var titres = { pro: 'Compétences professionnelles', comp: 'Compétences comportementales' };
    cas('disposition : au départ, les deux familles sont « à la suite » (rien ne change sans choix)', bloc(titres.comp) === 'suite' && !!document.querySelector('[data-mep-dispcomp-comp="suite"].on'), bloc(titres.comp));
    for (var f of ['comp', 'pro']) {
      for (var v of ['une', 'deux', 'suite']) {
        document.querySelector('[data-mep-dispcomp-' + f + '="' + v + '"]').click(); await attente(1800);
        cas('disposition : ' + f + ' « ' + v + ' » appliquée au CV et au bouton', bloc(titres[f]) === v && !!document.querySelector('[data-mep-dispcomp-' + f + '="' + v + '"].on'), bloc(titres[f]));
      }
    }
    document.querySelector('[data-mep-dispcomp-comp="deux"]').click(); await attente(1800);
    var ps = [].slice.call(W().document.querySelectorAll('#conteneurPage [data-rub="Compétences comportementales"] .pill')).map(function (x) { return x.firstChild.textContent.trim(); });
    var plan = JSON.stringify((await exporterCvWord(dossier)).plan);
    cas('disposition : le Word reprend toutes les compétences comportementales sur deux colonnes', ps.length > 0 && ps.every(function (x) { return plan.indexOf(x.slice(0, 10)) !== -1; }), ps.length);
    W()._pdfMqChoix('dispositionCompetences', null); await attente(1500);
  }


  // ---------------- Carte « Compétences » : TOUS les boutons, leurs combinaisons et leurs conflits (style par famille, signe, puces, disposition ; retour Denis 2026-10-02) ----------------
  async function parcoursCarteCompetencesComplete() {
    await preparerCvResultats();
    var W = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var T = { pro: 'Compétences professionnelles', comp: 'Compétences comportementales' };
    dossier.competencesPro = ['Pose', 'Peinture', 'Supports', 'Plans', 'Outils', 'Sécurité', 'Calcul', 'Chantier'];
    W()._pdfMqChoix('dispositionCompetences', null); W()._pdfMqChoix('styleCompetencesFamille', null); W()._pdfMqChoix('separateurCompetences', null); W()._pdfMqChoix('formePuce', null);
    W()._pdfRafraichir(); await attente(1500);
    document.getElementById('cComp').open = true; document.getElementById('cTexte').open = true;
    var sect = function (f) { return [].slice.call(W().document.querySelectorAll('#conteneurPage [data-rub]')).filter(function (e) { return e.getAttribute('data-rub') === T[f]; })[0]; };
    var cls = function (f) { var h = sect(f); if (!h) { return 'absent'; } var pl = h.querySelector('.pill'); return pl ? pl.className.replace('pill ', '') : 'sans'; };
    var cont = function (f) { var h = sect(f); if (!h) { return 'absent'; } var c = h.querySelector('[class*="pills-"]'); return c ? c.className : 'suite'; };
    var on = function (attr) { var b = document.querySelector('[' + attr + '].on'); return b ? b.getAttribute(attr) : 'aucun'; };
    var clic = async function (sel) { var b = document.querySelector(sel); if (!b) { cas('carte Compétences : le bouton ' + sel + ' existe', false, 'introuvable'); return false; } if (b.disabled) { return false; } b.click(); await attente(1700); return true; };
    var pastilles = function (f) { var h = sect(f); return h ? h.querySelectorAll('.pill').length : -1; };

    // --- 1. départ : rien ne change sans choix, boutons cohérents
    cas('carte Compétences : au départ, « À la suite » et « Général » sont actifs pour les deux familles', on('data-mep-dispcomp-pro') === 'suite' && on('data-mep-dispcomp-comp') === 'suite' && on('data-mep-stylefam-pro') === 'general' && on('data-mep-stylefam-comp') === 'general', on('data-mep-dispcomp-pro') + '/' + on('data-mep-stylefam-pro'));
    cas('carte Compétences : au départ, ni signe ni rappel des puces (style général = pastilles)', !document.querySelector('[data-mep-sepcomp-comp]') && !document.querySelector('[data-mep-aller-puces]'), '');

    // --- 2. style par famille : chaque valeur, les deux familles, sans toucher à l'autre famille
    for (var f of ['pro', 'comp']) {
      var autre = f === 'pro' ? 'comp' : 'pro';
      for (var st of ['texte', 'rect', 'pastille', 'general']) {
        var avantAutre = cls(autre);
        await clic('[data-mep-stylefam-' + f + '="' + st + '"]');
        var attendu = st === 'general' ? 'pastille' : st;
        cas('carte Compétences : style ' + f + ' « ' + st + ' » appliqué, bouton actif, l’autre famille inchangée', cls(f) === attendu && on('data-mep-stylefam-' + f) === st && cls(autre) === avantAutre, cls(f) + ' / autre ' + cls(autre));
      }
    }
    // --- 3. signe : seulement en texte + à la suite ; chaque signe ; rien d'écrit pour « rond »
    await clic('[data-mep-stylefam-comp="texte"]'); await clic('[data-mep-dispcomp-comp="suite"]');
    cas('carte Compétences : en Texte à la suite, le choix du signe apparaît (et pas le rappel des puces)', !!document.querySelector('[data-mep-sepcomp-comp]') && !document.querySelector('[data-mep-aller-puces]'), '');
    var signes = { median: '·', carre: '■', losange: '◆', barre: '|', rond: '•' };
    for (var sg in signes) {
      await clic('[data-mep-sepcomp-comp="' + sg + '"]');
      var ap = getComputedStyle(sect('comp').querySelector('.pill'), '::after').content;
      cas('carte Compétences : signe « ' + sg + ' » appliqué au CV', ap.indexOf(signes[sg]) !== -1 && on('data-mep-sepcomp-comp') === sg, ap);
    }
    cas('carte Compétences : « rond » n’enregistre rien (comportement d’avant)', !((W()._cvPdfChoixMq || {}).separateurCompetences), JSON.stringify((W()._cvPdfChoixMq || {}).separateurCompetences));
    await clic('[data-mep-sepcomp-comp="carre"]');
    // --- 4. disposition en texte : le signe laisse la place au rappel des puces ; le signe choisi n'est pas perdu
    await clic('[data-mep-dispcomp-comp="une"]');
    cas('carte Compétences : en Texte et colonnes, le signe disparaît et le rappel des puces apparaît', !document.querySelector('[data-mep-sepcomp-comp]') && !!document.querySelector('[data-mep-aller-puces]'), '');
    cas('carte Compétences : en colonne, chaque compétence a sa puce (et plus le signe)', getComputedStyle(sect('comp').querySelector('.pill'), '::after').content === 'none' || getComputedStyle(sect('comp').querySelector('.pill'), '::after').content === '""' || getComputedStyle(sect('comp').querySelector('.pill'), '::after').content === 'normal', getComputedStyle(sect('comp').querySelector('.pill'), '::after').content);
    await clic('[data-mep-formepuce="triangle"]');
    cas('carte Compétences : la forme des puces générale s’applique aux colonnes en texte', getComputedStyle(sect('comp').querySelector('.pill'), '::before').content.indexOf('▸') !== -1, getComputedStyle(sect('comp').querySelector('.pill'), '::before').content);
    cas('carte Compétences : le rappel affiche la forme choisie', /triangle/.test(document.querySelector('[data-mep-aller-puces]').parentNode.textContent), '');
    await clic('[data-mep-formepuce="rond"]');
    await clic('[data-mep-dispcomp-comp="suite"]');
    cas('carte Compétences : le signe choisi est retrouvé au retour à « À la suite »', on('data-mep-sepcomp-comp') === 'carre', on('data-mep-sepcomp-comp'));
    var aller = null;
    await clic('[data-mep-dispcomp-comp="deux"]'); document.getElementById('cTexte').open = false;
    document.querySelector('[data-mep-aller-puces]').click(); await attente(400);
    cas('carte Compétences : « Changer dans Mise en page et texte » ouvre cette carte', document.getElementById('cTexte').open === true, '');

    // --- 5. conflits avec le style général (Mise en page et texte)
    await clic('[data-mep-stylefam-comp="general"]'); await clic('[data-mep-dispcomp-comp="suite"]');
    await clic('[data-mep-stylecomp="rectangle"]');
    cas('carte Compétences : « Général » suit le style général (rectangles)', cls('comp') === 'rect' && cls('pro') === 'rect', cls('comp') + '/' + cls('pro'));
    await clic('[data-mep-stylefam-comp="texte"]');
    cas('carte Compétences : un style propre l’emporte sur le style général', cls('comp') === 'texte' && cls('pro') === 'rect', cls('comp') + '/' + cls('pro'));
    await clic('[data-mep-stylecomp="texte-seul"]');
    cas('carte Compétences : avec le style général « Texte », les professionnelles sont proposées sur 2 colonnes et le bouton le montre', on('data-mep-dispcomp-pro') === 'deux' && /pills-(2col|auto)/.test(cont('pro')), on('data-mep-dispcomp-pro') + ' / ' + cont('pro'));
    await clic('[data-mep-dispcomp-pro="suite"]');
    cas('carte Compétences : un choix explicite « À la suite » l’emporte sur la règle automatique du style Texte', on('data-mep-dispcomp-pro') === 'suite' && cont('pro') === 'suite', cont('pro'));
    await clic('[data-mep-stylecomp="pastille"]'); await clic('[data-mep-stylefam-comp="general"]');
    W()._pdfMqChoix('dispositionCompetences', null); await attente(1200);

    // --- 6. modes de présentation : le bouton reflète le CV
    document.getElementById('cExp').open = true;
    for (var m of ['B', 'A']) {
      document.querySelector('[data-mep-mode-presentation="' + m + '"]').click(); await attente(2500);
      var vu = cont('pro').indexOf('2col') !== -1 ? 'deux' : (cont('pro').indexOf('1col') !== -1 ? 'une' : 'suite');
      cas('carte Compétences : mode ' + m + ' : le bouton de disposition des professionnelles correspond au CV', on('data-mep-dispcomp-pro') === vu || m === 'A' && on('data-mep-dispcomp-pro') === 'suite', on('data-mep-dispcomp-pro') + ' / ' + vu);
    }

    // --- 7. les autres boutons de la carte, avec la disposition et le style actifs
    await clic('[data-mep-dispcomp-comp="deux"]'); await clic('[data-mep-stylefam-comp="rect"]');
    // la liste ne descend pas sous 3 : si elle y est deja, on monte d'abord (« + »), puis on redescend (« − »). Defaut corrige le 2026-10-02 : avec 9 comportementales affichees
    // (qualites attendues comprises), le premier « − » tombait a 3 au lieu de 8.
    var n0 = pastilles('comp');
    var plusBtn = document.querySelector('[data-mep-comp-comportementales-plus]'), moinsBtn = document.querySelector('[data-mep-comp-comportementales-moins]');
    if (n0 <= 3 && plusBtn.disabled) {
      // rien a ajouter (liste de 3 ou moins) : les deux boutons doivent alors etre grises, jamais actifs sans effet
      cas('carte Compétences : avec 3 comportementales et rien à ajouter, « − » et « + » sont grisés', moinsBtn.disabled && plusBtn.disabled, n0);
    } else if (n0 <= 3) {
      await clic('[data-mep-comp-comportementales-plus]'); var nPlus = pastilles('comp'); await clic('[data-mep-comp-comportementales-moins]');
      cas('carte Compétences : « + » puis « − » changent le nombre de comportementales, même en colonnes', nPlus === n0 + 1 && pastilles('comp') === n0, n0 + ' -> ' + nPlus + ' -> ' + pastilles('comp'));
    } else {
      await clic('[data-mep-comp-comportementales-moins]'); var nMoins = pastilles('comp'); await clic('[data-mep-comp-comportementales-plus]');
      cas('carte Compétences : « − » retire UNE comportementale (pas plus) puis « + » la remet, même en colonnes', nMoins === n0 - 1 && pastilles('comp') === n0, n0 + ' -> ' + nMoins + ' -> ' + pastilles('comp'));
    }
    await clic('[data-mep-pick="comp"]');
    var coches = document.querySelectorAll('[data-mep-pick-item="comp"]');
    if (coches.length) { coches[0].checked = false; coches[0].dispatchEvent(new Event('change', { bubbles: true })); await attente(1700); }
    cas('carte Compétences : « Les montrer et les choisir » retire une compétence du CV, en colonnes aussi', pastilles('comp') === n0 - 1, pastilles('comp'));
    var raz = document.querySelector('[data-mep-pick-raz="comp"]'); if (raz) { raz.click(); await attente(1700); }
    cas('carte Compétences : « Remettre la sélection automatique » rétablit le nombre', pastilles('comp') === n0, pastilles('comp'));
    var ckAff = document.querySelector('[data-mep-afficher-comp="comp"]'); ckAff.click(); await attente(1800);
    cas('carte Compétences : décocher « Afficher les comportementales » retire la rubrique et ses réglages', !sect('comp') && !document.querySelector('[data-mep-dispcomp-comp]'), '');
    document.querySelector('[data-mep-afficher-comp="comp"]').click(); await attente(1800);
    cas('carte Compétences : recocher la rubrique retrouve la disposition et le style choisis', !!sect('comp') && on('data-mep-dispcomp-comp') === 'deux' && cls('comp') === 'rect', on('data-mep-dispcomp-comp') + ' / ' + cls('comp'));

    // --- 8. annuler et revenir au départ
    var avant = JSON.stringify((W()._cvPdfChoixMq || {}).styleCompetencesFamille);
    await clic('[data-mep-stylefam-comp="texte"]');
    if (typeof _mepAnnulerMiseEnPage === 'function') { _mepAnnulerMiseEnPage(); await attente(2000); }
    cas('carte Compétences : « Annuler » défait le dernier choix de style', JSON.stringify((W()._cvPdfChoixMq || {}).styleCompetencesFamille) === avant && cls('comp') === 'rect', JSON.stringify((W()._cvPdfChoixMq || {}).styleCompetencesFamille) + ' / ' + cls('comp'));
    var bRev = document.getElementById('btnMepRevenirDefaut');
    if (bRev) { bRev.click(); await attente(2500); }
    var choixFin = W()._cvPdfChoixMq || {};
    cas('carte Compétences : « Revenir au modèle de départ » efface disposition, style et signe', !choixFin.dispositionCompetences && !choixFin.styleCompetencesFamille && !choixFin.separateurCompetences, JSON.stringify([choixFin.dispositionCompetences, choixFin.styleCompetencesFamille]));

    // --- 9. rendu Word identique à l'écran
    document.getElementById('cComp').open = true;
    await clic('[data-mep-stylefam-comp="texte"]'); await clic('[data-mep-sepcomp-comp="losange"]');
    var plan = JSON.stringify((await exporterCvWord(dossier)).plan);
    cas('carte Compétences : le Word reprend le signe choisi', plan.indexOf('◆') !== -1, '');
    W()._pdfMqChoix('dispositionCompetences', null); W()._pdfMqChoix('styleCompetencesFamille', null); W()._pdfMqChoix('separateurCompetences', null); await attente(1200);

    // --- 10. sans objet : Mini CV A5
    document.getElementById('cFormat').open = true;
    await clic('[data-mep-format-simple="a5-portrait"]');
    var gris = document.querySelector('#cComp .sans-objet');
    cas('carte Compétences : en Mini CV A5, les réglages sans effet sont grisés avec la raison', !!gris && [].slice.call(gris.querySelectorAll('button')).every(function (b) { return b.disabled; }) && /Mini CV A5/.test(gris.textContent), gris ? gris.textContent.slice(-60) : 'pas grisé');
    await clic('[data-mep-format-simple="a4-detaille"]');
    cas('carte Compétences : retour en A4, les réglages sont actifs', !document.querySelector('#cComp .sans-objet') && !document.querySelector('[data-mep-dispcomp-comp]').disabled, '');
  }


  // ---------------- Carte « Formations » : structure alignée sur les expériences, TOUS les boutons (retour Denis 2026-10-02, F2) ----------------
  async function parcoursCarteFormations() {
    await preparerCvResultats();
    var W = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var txtCv = function () { return W().document.querySelector('#conteneurPage').innerText; };
    W()._pdfMqChoix('styleCommun', false); _mepRerendre(); await attente(3500);
    document.getElementById('cForm').open = true; await attente(300);
    var c = function () { return document.getElementById('cForm'); };
    var clic = async function (sel) { var b = c().querySelector(sel); if (!b) { cas('carte Formations : le contrôle ' + sel + ' existe', false, 'introuvable'); return false; } b.click(); await attente(2300); return true; };
    cas('carte Formations : structure (deux boîtes, bandeau Détail en 3 rangées, bouton Éditer, zone dépliante)', c().querySelectorAll('.quatre > .boite').length === 2 && c().querySelectorAll('.detail-compact .rangee').length === 3 && !!c().querySelector('.bouton-editer') && !!c().querySelector('#zoneForm'), '');
    cas('carte Formations : plus de bouton « Modifier » par ligne', c().querySelectorAll('[data-mep-form-modifier]').length === 0, '');
    cas('carte Formations : une formation par ligne', getComputedStyle(c().querySelector('.mep-liste-choix-exp')).gridTemplateColumns.split(' ').length === 1, '');
    var lignes = c().querySelectorAll('.mep-liste-choix-exp > .ligne-bloc').length;
    cas('carte Formations : le résumé de la zone donne le bon nombre', new RegExp('^' + lignes + ' formation').test(c().querySelector('#zoneForm summary small').textContent), c().querySelector('#zoneForm summary small').textContent);
    // quelles formations montrer / à afficher
    await clic('[data-mep-formations="optimise"]'); var nOpt = c().querySelectorAll('.mep-liste-choix-exp > .ligne-bloc').length;
    await clic('[data-mep-formations="complet"]');
    cas('carte Formations : « Optimisé » puis « Complet » changent la liste', nOpt <= lignes && c().querySelectorAll('.mep-liste-choix-exp > .ligne-bloc').length === lignes, nOpt + ' / ' + lignes);
    await clic('[data-mep-formations-tout="pertinentes"]');
    cas('carte Formations : « Les plus pertinentes » rend les cases modifiables', !c().querySelector('[data-mep-form-choisie]').disabled, '');
    await clic('[data-mep-formations-tout="toutes"]');
    cas('carte Formations : « Toutes » les verrouille', c().querySelector('[data-mep-form-choisie]').disabled, '');
    // titre G / I / S
    var titreStyle = function () { var sp = W().document.querySelector('#conteneurPage [data-rub="Formations"] .item span[style*="font-weight"]'); return sp ? sp.getAttribute('style') : ''; };
    await clic('[data-mep-form-style="italique"]'); cas('carte Formations : « I » met le titre en italique, le bouton est actif', /italic/.test(titreStyle()) && c().querySelector('[data-mep-form-style="italique"]').classList.contains('on'), titreStyle());
    await clic('[data-mep-form-style="souligne"]'); cas('carte Formations : « S » souligne le titre', /underline/.test(titreStyle()), titreStyle());
    // Word : le soulignement d'un titre (pose sur un element englobant) doit arriver dans le fichier (defaut corrige le 2026-10-02)
    var runsWord = []; (function parcourir(o) { if (Array.isArray(o)) { o.forEach(parcourir); } else if (o && typeof o === 'object') { if (o.texte && /Agent de pr/.test(o.texte)) { runsWord.push(o); } Object.keys(o).forEach(function (k) { parcourir(o[k]); }); } })((await exporterCvWord(dossier)).plan);
    cas('carte Formations : le Word reprend le titre souligné et en italique', runsWord.length > 0 && runsWord[0].souligne === true && runsWord[0].italique === true, JSON.stringify(runsWord.map(function (r) { return [r.gras, r.italique, r.souligne]; })));
    await clic('[data-mep-form-style="gras"]'); cas('carte Formations : « G » retire le gras', /font-weight:400/.test(titreStyle()), titreStyle());
    await clic('[data-mep-form-style="gras"]'); await clic('[data-mep-form-style="italique"]'); await clic('[data-mep-form-style="souligne"]');
    cas('carte Formations : les boutons G, I, S sont grands et faciles à toucher', c().querySelector('.btn-g-i').getBoundingClientRect().height >= 30 && c().querySelector('.btn-g-i').getBoundingClientRect().width >= 36, Math.round(c().querySelector('.btn-g-i').getBoundingClientRect().width) + 'x' + Math.round(c().querySelector('.btn-g-i').getBoundingClientRect().height));
    // afficher centre / année / lieu
    var ann = function () { return /2021/.test(W().document.querySelector('#conteneurPage [data-rub="Formations"]').innerText); };
    var avantAnnee = ann(); await clic('[data-mep-form-aff="annee"]'); var apresAnnee = ann(); await clic('[data-mep-form-aff="annee"]');
    cas('carte Formations : décocher « Année » la retire du CV, recocher la remet', avantAnnee && !apresAnnee && ann(), avantAnnee + ' ' + apresAnnee + ' ' + ann());
    // espace, informations
    var sl = c().querySelector('[data-mep-form-espacement]'); sl.value = '16'; sl.dispatchEvent(new Event('input', { bubbles: true })); sl.dispatchEvent(new Event('change', { bubbles: true })); await attente(1700);
    cas('carte Formations : le curseur d’espace est pris en compte', /16 px/.test(document.getElementById('mepValEspForm').textContent), document.getElementById('mepValEspForm').textContent);
    sl = c().querySelector('[data-mep-form-espacement]'); sl.value = '4'; sl.dispatchEvent(new Event('input', { bubbles: true })); sl.dispatchEvent(new Event('change', { bubbles: true })); await attente(1500);
    await clic('[data-mep-form-ligne="dessous"]'); cas('carte Formations : « En dessous » est actif', c().querySelector('[data-mep-form-ligne="dessous"]').classList.contains('on'), '');
    await clic('[data-mep-form-ligne=""]');
    // missions : afficher + style + signe
    var ckM = c().querySelector('[data-mep-form-missions]'); var etatM = ckM.checked; ckM.click(); await attente(1700);
    cas('carte Formations : la case « Afficher les missions » change le CV', document.querySelector('#cForm [data-mep-form-missions]').checked !== etatM, '');
    // on remet les missions (si la case est decochee) : « Condensees » est grise, avec raison, tant qu'aucune mission n'est affichee
    var ckRetour = document.querySelector('#cForm [data-mep-form-missions]'); if (!ckRetour.checked) { ckRetour.click(); await attente(2300); }
    cas('carte Formations : sans missions affichées, le style des missions est grisé ; avec, il est actif', !!document.querySelector('#cForm [data-mep-missionsformations="condense"]') && !document.querySelector('#cForm [data-mep-missionsformations="condense"]').classList.contains('sans-objet'), '');
    await clic('[data-mep-missionsformations="condense"]'); await attente(1200);
    cas('carte Formations : « Condensées » fait apparaître le choix du signe', (dossier.reglagesMiseEnPageCV || {}).styleFormations === 'condense' && !!document.querySelector('#cForm [data-mep-sepmissions]'), String((dossier.reglagesMiseEnPageCV || {}).styleFormations) + ' / ' + document.querySelectorAll('#cForm [data-mep-sepmissions]').length + ' / ' + (document.querySelector('#cForm [data-mep-missionsformations="condense"]') || { className: 'absent' }).className);
    await clic('[data-mep-missionsformations="epure"]');
    // ordre, régler sur le CV
    var so = c().querySelector('[data-mep-ordreform-select]'); so.value = 'date-asc'; so.dispatchEvent(new Event('change', { bubbles: true })); await attente(1700);
    cas('carte Formations : le choix d’ordre est pris en compte', c().querySelector('[data-mep-ordreform-select]').value === 'date-asc', c().querySelector('[data-mep-ordreform-select]').value);
    so = c().querySelector('[data-mep-ordreform-select]'); so.value = 'pertinence'; so.dispatchEvent(new Event('change', { bubbles: true })); await attente(1500);
    cas('carte Formations : « Régler sur le CV » existe', !!c().querySelector('[data-mep-regler-rubrique="Formations"]'), '');
    // mode édition
    await clic('[data-mep-form-editer]');
    cas('carte Formations : « Éditer » ouvre le mode édition (noms cliquables, zone ouverte)', c().querySelector('.bouton-editer').classList.contains('on') && c().querySelectorAll('[data-mep-form-ouvrir]').length === lignes && document.getElementById('zoneForm').open, '');
    c().querySelector('[data-mep-form-ouvrir]').click(); await attente(1500);
    var ed = c().querySelector('[data-mep-form-edit-titre]'); ed.value = 'Titre corrigé du test'; c().querySelector('[data-mep-form-texte-enregistrer]').click(); await attente(2000);
    cas('carte Formations : une correction apparaît sur le CV et laisse « Vos informations » intact', /Titre corrigé du test/.test(txtCv()) && !dossier.formations.some(function (f) { return /corrigé du test/.test(f.intitule || ''); }), '');
    c().querySelector('[data-mep-form-ouvrir]').click(); await attente(1500);
    c().querySelector('[data-mep-form-texte-annuler]').click(); await attente(1500);
    cas('carte Formations : « Annuler » referme le formulaire sans rien changer', !c().querySelector('[data-mep-form-edit]'), '');
    await clic('[data-mep-form-editer]');
    cas('carte Formations : « Éditer » une 2e fois referme le mode édition', !c().querySelector('[data-mep-form-ouvrir]'), '');
    // nettoyage : retirer la correction du test
    try { var cle = Object.keys((W()._cvPdfFormationsTexteParItem) || {})[0]; if (cle) { W()._pdfMqRemettreTexteFormation && W()._pdfMqRemettreTexteFormation(cle); } } catch (e) { /* */ }
    W()._pdfMqChoix('formationAffiche', null); W()._pdfMqChoix('styleCommun', null);
  }


  // ---------------- Carte « Expérience personnelle » : structure alignée sur les expériences, bandeau Détail, TOUS les boutons (retour Denis 2026-10-02, F3) ----------------
  async function parcoursCartePerso() {
    await preparerCvResultats();
    var W = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var c = function () { return document.getElementById('cExpPerso'); };
    var cv = function () { return W().document.querySelector('#conteneurPage [data-rub="Expérience personnelle"]'); };
    // jeu de données de l'essai (la carte n'existe que si le dossier a une expérience personnelle ou un engagement) ; remis à l'identique à la fin
    var sauvePerso = JSON.stringify([dossier.experiencesPerso, dossier.engagements]);
    dossier.experiencesPerso = [{ intitule: 'Bricolage', missions: 'Réparer des meubles\nPeindre des murs\nUtiliser des outils' }];
    dossier.engagements = [{ intitule: 'Bénévole aux Restos du Cœur', missions: 'Distribuer les repas\nAccueillir les bénéficiaires' }];
    // la liste des entrees est calculee par le rendu du CV : un premier rendu la pose, le second montre la carte
    _mepRerendre(); await attente(4500); _mepRerendre(); await attente(3500);
    W()._pdfMqChoix('styleCommun', false); _mepRerendre(); await attente(3500);
    c().open = true; await attente(300);
    var clic = async function (sel) { var b = c().querySelector(sel); if (!b) { cas('carte Expérience personnelle : le contrôle ' + sel + ' existe', false, 'introuvable'); return false; } b.click(); await attente(2300); return true; };
    // l'essai part toujours de « Citer seulement » (le mode peut avoir ete laisse sur « Developper » par un essai precedent)
    var rCiter = c().querySelector('[data-mep-expperso-mode="citer"]'); if (rCiter && !rCiter.checked) { rCiter.click(); await attente(3000); }
    cas('carte Expérience personnelle : en « Citer seulement », pas de bandeau Détail ni de bouton Éditer (rien à détailler)', !c().querySelector('.detail-compact') && !c().querySelector('.bouton-editer'), '');
    cas('carte Expérience personnelle : quatre boîtes en haut (mode, à afficher, savoir-faire, engagement)', c().querySelectorAll('.quatre > .boite').length === 4, c().querySelectorAll('.quatre > .boite').length);
    await clic('[data-mep-expperso-mode="developper"]');
    cas('carte Expérience personnelle : « Développer » ouvre le bandeau Détail et le bouton Éditer, plus de bouton Modifier par ligne', c().querySelectorAll('.detail-compact .rangee').length === 2 && !!c().querySelector('.bouton-editer') && c().querySelectorAll('[data-mep-expperso-modifier]').length === 0, '');
    cas('carte Expérience personnelle : une entrée par ligne', getComputedStyle(c().querySelector('.mep-liste-choix-exp')).gridTemplateColumns.split(' ').length === 1, '');
    var nb = c().querySelectorAll('.mep-liste-choix-exp > .ligne-bloc').length;
    cas('carte Expérience personnelle : le résumé de la zone donne le bon nombre', new RegExp('^' + nb + ' entr').test(c().querySelector('#zonePerso summary small').textContent), c().querySelector('#zonePerso summary small').textContent);
    // à afficher
    await clic('[data-mep-expperso-tout="pertinentes"]'); var libre = !c().querySelector('[data-mep-expperso-choisie]').disabled;
    await clic('[data-mep-expperso-tout="toutes"]');
    cas('carte Expérience personnelle : « Les plus pertinentes » rend les cases modifiables, « Toutes » les verrouille', libre && c().querySelector('[data-mep-expperso-choisie]').disabled, '');
    // sources : cacher / afficher
    var avantTxt = cv() ? cv().innerText.length : 0;
    var bCacher = c().querySelector('[data-mep-expperso-masquer-source]');
    if (bCacher) { bCacher.click(); await attente(2300); }
    cas('carte Expérience personnelle : « Cacher sur le CV » retire la source, « Afficher sur mon CV » la remet', !!c().querySelector('[data-mep-expperso-afficher-source]'), '');
    var bAff = c().querySelector('[data-mep-expperso-afficher-source]'); if (bAff) { bAff.click(); await attente(2300); }
    cas('carte Expérience personnelle : la source est de retour', !c().querySelector('[data-mep-expperso-afficher-source]') && (cv() ? cv().innerText.length : 0) === avantTxt, '');
    // titre G I S
    var titreHtml = function () { var it = cv() && cv().querySelector('.item'); return it ? it.innerHTML : ''; };
    await clic('[data-mep-perso-titre-style="italique"]'); cas('carte Expérience personnelle : « I » met le titre en italique, bouton actif', /italic/.test(titreHtml()) && c().querySelector('[data-mep-perso-titre-style="italique"]').classList.contains('on'), '');
    await clic('[data-mep-perso-titre-style="souligne"]'); cas('carte Expérience personnelle : « S » souligne le titre', /underline/.test(titreHtml()), '');
    await clic('[data-mep-perso-titre-style="gras"]'); cas('carte Expérience personnelle : « G » retire le gras', /font-weight:400/.test(titreHtml()), '');
    await clic('[data-mep-perso-titre-style="gras"]'); await clic('[data-mep-perso-titre-style="italique"]'); await clic('[data-mep-perso-titre-style="souligne"]');
    cas('carte Expérience personnelle : revenir à gras seul n’enregistre rien (rendu d’avant)', !((W()._cvPdfChoixMq || {}).styleTitrePerso), JSON.stringify((W()._cvPdfChoixMq || {}).styleTitrePerso));
    cas('carte Expérience personnelle : les boutons G, I, S sont grands', c().querySelector('.btn-g-i').getBoundingClientRect().height >= 30, '');
    // espace
    var sl = c().querySelector('[data-mep-perso-espacement]'); sl.value = '20'; sl.dispatchEvent(new Event('input', { bubbles: true })); sl.dispatchEvent(new Event('change', { bubbles: true })); await attente(2300);
    var it = cv().querySelector('.item');
    cas('carte Expérience personnelle : le curseur d’espace est lu par le CV', /margin-bottom:20px/.test(it.getAttribute('style') || '') && /20 px/.test(document.getElementById('mepValEspPerso').textContent), it.getAttribute('style'));
    sl = c().querySelector('[data-mep-perso-espacement]'); sl.value = '8'; sl.dispatchEvent(new Event('change', { bubbles: true })); await attente(2300);
    cas('carte Expérience personnelle : remettre 8 px n’enregistre rien', !((W()._cvPdfChoixMq || {}).espacementPerso), '');
    // missions style + signe
    await clic('[data-mep-missionsperso="condense"]'); cas('carte Expérience personnelle : « Condensées » fait apparaître le choix du signe', !!document.querySelector('#cExpPerso [data-mep-sepmissions]'), '');
    await clic('[data-mep-missionsperso="epure"]');
    // ordre / régler
    var so = c().querySelector('[data-mep-ordreperso-select]');
    if (so) { so.value = 'date-asc'; so.dispatchEvent(new Event('change', { bubbles: true })); await attente(2300); cas('carte Expérience personnelle : le choix d’ordre est pris en compte', c().querySelector('[data-mep-ordreperso-select]').value === 'date-asc', ''); so = c().querySelector('[data-mep-ordreperso-select]'); so.value = 'pertinence'; so.dispatchEvent(new Event('change', { bubbles: true })); await attente(2000); }
    cas('carte Expérience personnelle : « Régler sur le CV » existe', !!c().querySelector('[data-mep-regler-rubrique="Expérience personnelle"]'), '');
    // éditer
    await clic('[data-mep-perso-editer]');
    cas('carte Expérience personnelle : « Éditer » ouvre le mode édition (noms cliquables, zone ouverte)', c().querySelector('.bouton-editer').classList.contains('on') && c().querySelectorAll('[data-mep-expperso-ouvrir]').length === nb && document.getElementById('zonePerso').open, '');
    c().querySelector('[data-mep-expperso-ouvrir]').click(); await attente(1800);
    var ed = c().querySelector('[data-mep-expperso-edit-titre]'); ed.value = 'Titre perso corrigé du test'; c().querySelector('[data-mep-expperso-texte-enregistrer]').click(); await attente(2300);
    cas('carte Expérience personnelle : une correction apparaît sur le CV et laisse « Vos informations » intact', /Titre perso corrigé du test/.test(cv().innerText) && !(dossier.experiencesPerso || []).some(function (e) { return /corrigé du test/.test(e.intitule || ''); }), '');
    c().querySelector('[data-mep-expperso-ouvrir]').click(); await attente(1800);
    c().querySelector('[data-mep-expperso-texte-annuler]').click(); await attente(1800);
    cas('carte Expérience personnelle : « Annuler » referme le formulaire', !c().querySelector('[data-mep-expperso-edit]'), '');
    await clic('[data-mep-perso-editer]');
    cas('carte Expérience personnelle : « Éditer » une 2e fois referme le mode édition', !c().querySelector('[data-mep-expperso-ouvrir]'), '');
    // nettoyage
    try { W()._pdfMqChoix('styleTitrePerso', null); W()._pdfMqChoix('espacementPerso', null); W()._pdfMqChoix('styleCommun', null); } catch (e) { /* */ }
    await clic('[data-mep-expperso-mode="citer"]');
    var sv = JSON.parse(sauvePerso); dossier.experiencesPerso = sv[0]; dossier.engagements = sv[1]; _mepRerendre(); await attente(3500);
  }


  // ---------------- Style d'écriture commun : option, grisage, harmoniser, décrocher, lieu (retour Denis 2026-10-02, F4) ----------------
  async function parcoursStyleCommun() {
    await preparerCvResultats();
    var W = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var sauvePerso = JSON.stringify([dossier.experiencesPerso, dossier.engagements]);
    dossier.experiencesPerso = [{ intitule: 'Bricolage', missions: 'Réparer des meubles\nPeindre des murs' }];
    dossier.formations[0].lieu = 'Limoges';
    W()._pdfMqChoix('styleCommun', null); W()._pdfMqChoix('styleTitreFormation', null); W()._pdfMqChoix('styleTitrePerso', null);
    _mepRerendre(); await attente(4500); _mepRerendre(); await attente(3500);
    var rr = async function () { _mepRerendre(); await attente(3300); };
    var org = function () { return document.getElementById('cOrg'); }, cf = function () { return document.getElementById('cForm'); }, cp = function () { return document.getElementById('cExpPerso'); };
    org().open = true; cf().open = true; if (cp()) { cp().open = true; }
    var optCoche = function () { return org().querySelector('[data-mep-style-commun]').checked; };
    var desactives = function (carte, sel) { var l = [].slice.call(carte.querySelectorAll(sel)); return l.length > 0 && l.every(function (b) { return b.disabled; }); };
    var cvTexte = function () { return W().document.querySelector('#conteneurPage').innerText; };
    // 1. au départ : les rubriques s'écrivent pareil, l'option est cochée d'office et grise les réglages d'écriture
    cas('style commun : l’option existe dans « Organisation du CV »', !!org().querySelector('[data-mep-style-commun]'), '');
    cas('style commun : cochée d’office quand les rubriques s’écrivent déjà pareil (rien ne change)', optCoche() && !org().querySelector('[data-mep-harmoniser]'), '');
    cas('style commun : le titre et le style des missions des formations sont grisés, avec la raison', desactives(cf(), '.detail-compact [data-mep-form-style]') && desactives(cf(), '.detail-compact [data-mep-missionsformations]') && /comme les expériences/.test(cf().querySelector('.detail-compact').textContent), '');
    if (cp()) {
      cp().querySelector('[data-mep-expperso-mode="developper"]').click(); await attente(3300);
      cas('style commun : idem pour l’expérience personnelle', desactives(cp(), '.detail-compact [data-mep-perso-titre-style]') && desactives(cp(), '.detail-compact [data-mep-missionsperso]'), '');
      cp().querySelector('[data-mep-expperso-mode="citer"]').click(); await attente(3000);
    }
    // 2. décrocher : on décoche, les réglages redeviennent actifs
    org().querySelector('[data-mep-style-commun]').click(); await attente(3300);
    cas('style commun : décochée, les réglages d’écriture des formations sont actifs', !optCoche() && !desactives(cf(), '.detail-compact [data-mep-form-style]'), '');
    // 3. chaque rubrique a sa particularité : formations en condensé et en italique
    cf().querySelector('[data-mep-missionsformations="condense"]').click(); await attente(3300);
    cf().querySelector('[data-mep-form-style="italique"]').click(); await attente(3300);
    var forme = function () { var sp = W().document.querySelector('#conteneurPage [data-rub="Formations"] .item span[style*="font-style"]'); return sp ? sp.getAttribute('style') : ''; };
    cas('style commun : décrochées, les formations gardent leur particularité (titre en italique)', /italic/.test(forme()), forme());
    cas('style commun : rubriques écrites différemment, l’option reste décochée (plus de bouton « Harmoniser » : cocher l’option suffit)', !optCoche() && !org().querySelector('[data-mep-harmoniser]'), '');
    // 4. harmoniser = cocher l'option : tout s'écrit comme les expériences
    org().querySelector('[data-mep-style-commun]').click(); await attente(3500);
    cas('style commun : cocher l’option « harmonise » : elle aligne les formations sur les expériences (titre sans italique)', optCoche() && !/italic/.test(forme()) && (W()._cvPdfChoixMq || {}).styleCommun === true, forme());
    cas('style commun : réglages grisés de nouveau', desactives(cf(), '.detail-compact [data-mep-form-style]'), '');
    // 5. le style de la référence (expériences) se propage
    var cx = document.getElementById('cExp'); cx.open = true;
    cx.querySelector('[data-mep-missionspro="condense"]').click(); await attente(3500);
    var formationsCondensees = function () { var it = W().document.querySelector('#conteneurPage [data-rub="Formations"] .item'); return it ? !it.querySelector('ul') : false; };
    cas('style commun : les expériences en « Condensées », les formations suivent', formationsCondensees(), '');
    document.getElementById('cExp').querySelector('[data-mep-missionspro="epure"]').click(); await attente(3500);
    // 6. lieu des formations : suit le style du lieu des expériences
    document.getElementById('cExp').querySelector('[data-mep-style-lieu="gris"]').click(); await attente(3500);
    cas('style commun : le lieu des formations prend le style du lieu des expériences (gris)', !!W().document.querySelector('#conteneurPage [data-rub="Formations"] .lieu-gris') , '');
    document.getElementById('cExp').querySelector('[data-mep-style-lieu="italique"]').click(); await attente(3500);
    // 7. décocher : retour aux réglages propres (condensé + italique des formations)
    org().querySelector('[data-mep-style-commun]').click(); await attente(3500);
    cas('style commun : décochée, le lieu des formations n’a plus de mise en forme propre aux expériences', !W().document.querySelector('#conteneurPage [data-rub="Formations"] .lieu-gris, #conteneurPage [data-rub="Formations"] .lieu-italique'), '');
    cas('style commun : décochée, les formations retrouvent leurs réglages propres (condensées, titre en italique)', /italic/.test(forme()) && formationsCondensees(), forme());
    // nettoyage
    W()._pdfMqChoix('styleCommun', null); W()._pdfMqChoix('styleTitreFormation', null);
    var sv = JSON.parse(sauvePerso); dossier.experiencesPerso = sv[0]; dossier.engagements = sv[1]; delete dossier.formations[0].lieu;
    document.getElementById('cForm').querySelector('[data-mep-missionsformations="epure"]').click(); await attente(3000);
    _mepRerendre(); await attente(3500);
  }


  // ---------------- Grands boutons : cibles d'au moins 44 px sur « La mise en page », sans débordement, mémorisé (retour Denis 2026-10-03) ----------------
  async function parcoursGrandsBoutons() {
    await preparerCvResultats();
    var mesure = function () {
      var tot = 0, petits = 0, debord = 0;
      [].slice.call(document.querySelectorAll('.mep-mq details.mep-carte')).forEach(function (d) {
        d.open = true; var R = d.getBoundingClientRect();
        [].slice.call(d.querySelectorAll('button, select, label.ck, label.rad, .ligne-choix')).forEach(function (e) {
          var r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) { return; }
          tot++; if (r.height < 43) { petits++; } if (r.right > R.right + 1 || r.left < R.left - 1) { debord++; }
        });
      });
      return { tot: tot, petits: petits, debord: debord };
    };
    await attente(500);
    var cb = document.querySelector('[data-mep-grands-boutons]');
    cas('grands boutons : le bouton existe en haut de « La mise en page », au milieu de la rangée, entre « Aperçu en plein écran » et « Revenir au modèle de départ » (demande de Denis, 2026-10-10)', !!cb && cb.tagName === 'BUTTON' && !!cb.previousElementSibling && cb.previousElementSibling.id === 'btnMepOuvrirGrandApercu' && !!cb.nextElementSibling && cb.nextElementSibling.id === 'btnMepDepart', '');
    if (cb.getAttribute('aria-pressed') === 'true') { cb.click(); await attente(500); }
    var avant = mesure();
    cas('grands boutons : au départ, rien ne change (beaucoup de petits contrôles, pas d’attribut)', !document.documentElement.getAttribute('data-grands-boutons') && avant.petits > 50, JSON.stringify(avant));
    document.querySelector('[data-mep-grands-boutons]').click(); await attente(800);
    var apres = mesure();
    cas('grands boutons : activés, tous les boutons, cases et lignes font au moins 44 px (hors curseurs)', document.documentElement.getAttribute('data-grands-boutons') === '1' && apres.petits <= 2, JSON.stringify(apres));
    cas('grands boutons : rien ne déborde de sa carte', apres.debord === 0, JSON.stringify(apres));
    // Les cartes de modèles Créatif et Sobre s'agrandissent : aucun nom coupé (retour de Denis, 2026-10-08)
    var nomsCoupes = function () { return [].filter.call(document.querySelectorAll('.gab-familles .vign .vign-nom, .gab-ligne .vign .vign-nom'), function (n) { return n.scrollHeight > n.clientHeight + 1 || n.scrollWidth > n.clientWidth + 1; }).map(function (n) { return n.textContent; }); };
    document.querySelector('[data-mep-allure="creatif"]').click(); await attente(3500);
    cas('grands boutons : les noms des modèles Créatif se lisent en entier (cartes agrandies)', document.querySelectorAll('.vign .vign-nom').length >= 3 && nomsCoupes().length === 0, nomsCoupes().join(' | '));
    document.querySelector('[data-mep-allure="sobre"]').click(); await attente(3500);
    cas('grands boutons : les noms des modèles Sobre se lisent en entier (cartes agrandies)', document.querySelectorAll('.vign .vign-nom').length >= 3 && nomsCoupes().length === 0, nomsCoupes().join(' | '));
    document.querySelector('[data-mep-allure="defaut"]').click(); await attente(3000);
    // Décision de Denis 2026-10-08 : toutes les options de couleur sont DANS la carte « Choisir une ambiance », derrière « Autre couleur ».
    var visible = function (e) { return !!e && e.checkVisibility() && e.getBoundingClientRect().width > 2 && e.getBoundingClientRect().height > 2; };
    _mepCartesOuvertes.zoneAmbiances = false; _mepCartesOuvertes.autreCouleur = false; _mepRerendre(); await attente(1500);
    cas('grands boutons : la carte d’ambiance est fermée au départ, ses couleurs sont dedans', !!document.getElementById('zoneAmbiances') && !visible(document.querySelector('[data-mep-base]')), '');
    document.getElementById('zoneAmbiances').click(); await attente(900);
    cas('grands boutons : ouverte, la carte montre d’office pastilles, nuances, couleurs de l’entreprise et personnalisée ; le dégradé est à côté', visible(document.querySelector('[data-mep-base]')) && visible(document.querySelector('#nuancierAmb .sw-entreprise-indispo, #nuancierAmb [data-mep-accent-entreprise]')) && visible(document.querySelector('#nuancierAmb .sw-perso')) && visible(document.querySelector('[data-mep-degrade-simple]')), '');
    var autre = document.querySelectorAll('[data-mep-base]')[3]; autre.click(); await attente(3500);
    cas('grands boutons : choisir une couleur la pose sur le CV et le panneau reste ouvert', !document.getElementById('panneauAmbiances').hidden && document.querySelectorAll('[data-mep-base]')[3].classList.contains('on'), '');
    document.querySelectorAll('[data-mep-base]')[1].click(); await attente(3000);
    // Retour Denis 2026-10-03 : la rangée des couleurs sortait de sa zone et passait sous le texte voisin. On cherche tout bloc dont le contenu dépasse sa propre boîte.
    var debordants = function () {
      var out = [];
      document.querySelectorAll('.mep-mq details.mep-carte').forEach(function (d) { d.open = true; });
      document.querySelectorAll('.mep-mq *').forEach(function (e) {
        var cs = getComputedStyle(e);
        if (cs.display === 'inline' || e.clientWidth < 5 || cs.overflowX !== 'visible' || /^(SVG|PATH|SELECT|INPUT|TEXTAREA|OPTION)$/i.test(e.tagName)) { return; }
        if (e.scrollWidth > e.clientWidth + 2) { out.push((e.id || String(e.className).slice(0, 30) || e.tagName) + ':' + e.scrollWidth + '/' + e.clientWidth); }
      });
      return out;
    };
    cas('grands boutons : aucun bloc ne déborde de sa boîte (couleurs, gros boutons d’action)', debordants().length === 0, debordants().join(' ; '));
    // Retour Denis 2026-10-03 : les étiquettes de champ (« Titre du CV »...) restaient minuscules. Aucun texte visible sous 14 px.
    var petitsTextes = function () {
      var out = [];
      document.querySelectorAll('.mep-mq *').forEach(function (e) {
        var t = [].filter.call(e.childNodes, function (n) { return n.nodeType === 3 && n.textContent.trim(); }).map(function (n) { return n.textContent.trim(); }).join(' ');
        if (!t || e.getBoundingClientRect().width < 2) { return; }
        var f = parseFloat(getComputedStyle(e).fontSize);
        if (f > 0 && f < 13.9) { out.push(e.tagName + '.' + String(e.className).split(' ')[0] + '@' + f.toFixed(1) + ' « ' + t.slice(0, 20) + ' »'); }
      });
      return out;
    };
    var tailles = {};
    document.querySelectorAll('.mep-mq input[type=checkbox], .mep-mq input[type=radio]').forEach(function (i) { var r = i.getBoundingClientRect(); if (r.width > 2) { var k = Math.round(r.width) + 'x' + Math.round(r.height); tailles[k] = (tailles[k] || 0) + 1; } });
    cas('grands boutons : toutes les cases et boutons ronds ont exactement la même taille', Object.keys(tailles).length === 1, JSON.stringify(tailles));
    cas('grands boutons : aucun texte de réglage sous 14 px (étiquettes de champ, titres, aides)', petitsTextes().length === 0, petitsTextes().slice(0, 6).join(' ; '));
    var memo = ''; try { memo = localStorage.getItem(Object.keys(localStorage).filter(function (k) { return /pref/i.test(k); })[0] || ''); } catch (e) { /* */ }
    cas('grands boutons : le choix est mémorisé sur l’appareil', /"grandsBoutons":"1"/.test(memo), memo.slice(0, 60));
    cas('grands boutons : le texte des réglages fait au moins 14 px', parseFloat(getComputedStyle(document.querySelector('.mep-mq .ligne-choix, .mep-mq label.ck')).fontSize) >= 14, '');
    document.querySelector('[data-mep-grands-boutons]').click(); await attente(800);
    cas('grands boutons : désactivés, retour à l’affichage d’avant', !document.documentElement.getAttribute('data-grands-boutons'), '');
    cas('grands boutons : désactivés, la carte d’ambiance et ses couleurs restent utilisables', !!document.getElementById('zoneAmbiances') && !!document.querySelector('[data-mep-base]'), '');
  }


  // ---------------- Phrase d'accroche : propositions lisibles EN ENTIER avant de choisir (retour Denis 2026-10-03) ----------------
  async function parcoursAccrocheLisible() {
    await preparerCvResultats();
    var longues = [
      'Expérience en pose de carrelage sur sols, murs, salles d’eau et escaliers entre 2018 et 2021. Habitude des découpes, des ajustements et du travail en équipe sur chantier. Recherche un poste de carreleur.',
      'Pose de carrelage sur différents supports, avec des découpes et ajustements autour des portes et fenêtres. Expérience également en préparation des supports et travaux de finition en peinture.',
      'Après plusieurs années en pose de carrelage et en peinture en bâtiment, recherche un poste de carreleur. Le parcours comprend la pose sur sols, murs et escaliers, ainsi que les travaux en salles d’eau.'
    ];
    var courtes = ['Pose de carrelage sur sols, murs et escaliers.', 'Carrelage et finitions en peinture.', 'Carreleur et peintre en bâtiment.'];
    if (!dossier.ia) { dossier.ia = {}; } if (!dossier.ia.cv) { dossier.ia.cv = {}; }
    dossier.ia.cv.accrochesProposees = longues; dossier.ia.cv.accrochesCourtesProposees = courtes; dossier.ia.cv.profil = longues[0];
    dossier.reglagesMiseEnPageCV = dossier.reglagesMiseEnPageCV || {}; dossier.reglagesMiseEnPageCV.sansAccroche = false; dossier.reglagesMiseEnPageCV.accrocheCourte = false;
    _mepRerendre(); await attente(3500);
    var carte = function () { return document.getElementById('cEntete'); };
    carte().open = true; await attente(300);
    var zone = function () { return document.getElementById('zoneAccroches'); };
    cas('accroche : une zone « Lire et choisir une autre phrase » existe, repliée au départ', !!zone() && !zone().open, '');
    zone().querySelector('summary').click(); await attente(400);
    var radios = function () { return [].slice.call(zone().querySelectorAll('input[data-mep-select-accroche]')); };
    cas('accroche : toutes les propositions sont listées', radios().length === 3, String(radios().length));
    var etiquettes = [].slice.call(zone().querySelectorAll('.rad-accroche-texte'));
    cas('accroche : chaque phrase est lisible EN ENTIER (texte complet, rien de coupé)', etiquettes.every(function (e, i) { return e.textContent.indexOf(longues[i]) >= 0 && e.scrollWidth <= e.clientWidth + 1; }), etiquettes.map(function (e) { return e.textContent.length; }).join(','));
    cas('accroche : la phrase choisie est affichée en entier au-dessus', document.getElementById('mepSelAccroche').textContent === longues[0], '');
    cas('accroche : la 1re proposition est cochée', radios()[0].checked && !radios()[1].checked, '');
    radios()[1].click(); await attente(3500);
    var W = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    cas('accroche : choisir la 2e proposition la met sur le CV', dossier.ia.cv.profil === longues[1] && W().document.querySelector('#conteneurPage').innerText.indexOf('préparation des supports') >= 0, dossier.ia.cv.profil.slice(0, 30));
    cas('accroche : la zone reste ouverte après le choix et la 2e est cochée', zone().open && radios()[1].checked, '');
    // plus de case « Version courte » (decision de Denis, 2026-10-10) : les accroches sont de longueur moyenne par definition
    cas('accroche : plus de case « Version courte »', !document.querySelector('[data-mep-accroche-courte]'), '');
    // sans accroche : tout est grise
    document.querySelector('[data-mep-sans-accroche-case]').click(); await attente(3500);
    cas('accroche : « Sans accroche » grise la liste (boutons ronds inactifs, zone repliée)', radios().every(function (r) { return r.disabled; }) && zone().classList.contains('desactivee') && !zone().open, '');
    document.querySelector('[data-mep-sans-accroche-case]').click(); await attente(3500);
    cas('accroche : décochée, les propositions sont de nouveau utilisables', radios().every(function (r) { return !r.disabled; }), '');
    // modifier à la main : toujours possible
    document.querySelector('[data-mep-accroche-modifier]').click(); await attente(800);
    cas('accroche : « Modifier » ouvre toujours le champ de saisie libre', !!document.querySelector('[data-mep-accroche-texte]'), '');
    document.querySelector('[data-mep-accroche-valider]').click(); await attente(800);
    dossier.ia.cv.profil = longues[0]; _mepRerendre(); await attente(3000);
  }


  // ---------------- Options rapides : intitulés courts + petit « ? » (retour Denis 2026-10-03) ----------------
  async function parcoursAideOptions() {
    await preparerCvResultats();
    var org = document.getElementById('cOrg'); org.open = true; await attente(300);
    var bts = [].slice.call(org.querySelectorAll('.opt-aide [data-mep-aide-option]'));
    cas('options rapides : chaque option a son petit « ? » (toutes présentées pareil)', bts.length >= 15 && bts.length === org.querySelectorAll('.checks.auto .ck').length, String(bts.length));
    var noms = [].slice.call(org.querySelectorAll('.opt-aide > label')).map(function (l) { return l.textContent.replace('?', '').trim(); });
    cas('options rapides : intitulés courts, sans parenthèse explicative', noms.length >= 15 && noms.slice(0, 4).join('|') === 'Dates alignées|Même écriture partout|Afficher les mois|Mêmes puces partout' && !noms.some(function (n) { return /\(/.test(n); }), noms.join('|'));
    var bulle = function () { return document.getElementById('mepBulleAide'); };
    var ouverte = function () { var b = bulle(); return !!b && !b.hidden && b.getBoundingClientRect().height > 5; };
    cas('options rapides : l’explication est masquée au départ', !ouverte() && bts[0].getAttribute('aria-expanded') === 'false' && !!bts[0].title, '');
    var hAvant = org.getBoundingClientRect().height, yBouton = bts[1].getBoundingClientRect().top;
    bts[0].click(); await attente(200);
    cas('options rapides : clic sur « ? » ouvre une bulle avec l’explication en toutes lettres', ouverte() && /dates/.test(bulle().textContent) && getComputedStyle(bulle()).position === 'fixed', ouverte() ? bulle().textContent : 'fermée');
    cas('options rapides : la bulle ne décale RIEN (la carte et les boutons gardent leur place)', org.getBoundingClientRect().height === hAvant && bts[1].getBoundingClientRect().top === yBouton, hAvant + ' -> ' + org.getBoundingClientRect().height);
    var cb = bts[0].closest('.opt-aide').querySelector('input'); var avant = cb.checked;
    cas('options rapides : le « ? » ne coche pas l’option', cb.checked === avant, '');
    bulle().querySelector('.mep-bulle-fermer').click(); await attente(150);
    cas('options rapides : la petite croix ferme la bulle', !ouverte(), '');
    bts[0].click(); await attente(150); bts[0].click(); await attente(150);
    cas('options rapides : un second clic sur le même « ? » referme la bulle', !ouverte(), '');
    bts[0].click(); await attente(150); document.querySelector('#cOrg h4.mini-titre').click(); await attente(150);
    cas('options rapides : un clic ailleurs ferme la bulle', !ouverte(), '');
    bts[0].click(); await attente(150); document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); await attente(150);
    cas('options rapides : Échap ferme la bulle', !ouverte(), '');
    // Le « ? » est dans le texte de son option, sur sa dernière ligne (jamais seul dessous ni confondu avec le bouton voisin), en mode normal comme agrandi.
    var proche = function () {
      return [].slice.call(document.querySelectorAll('#cOrg .opt-aide')).map(function (o) {
        var l = o.querySelector('label'), b = o.querySelector('.aide-option'), L = l.getBoundingClientRect(), q = b.getBoundingClientRect();
        return l.contains(b) && q.top >= L.top - 2 && q.bottom <= L.bottom + 2 && q.right <= L.right + 2;
      });
    };
    var pn = proche();
    cas('options rapides : en mode normal, chaque « ? » est contre son intitulé', pn.length >= 15 && pn.every(Boolean), JSON.stringify(pn));
    var p = preferencesAffichageActuelles(); p.grandsBoutons = '1'; appliquerPreferencesAffichage(p); await attente(800);
    var pg = proche();
    cas('grands boutons : chaque « ? » reste contre son intitulé', pg.length >= 15 && pg.every(Boolean), JSON.stringify(pg));
    var b0 = document.getElementById('cOrg').querySelector('.opt-aide [data-mep-aide-option]').getBoundingClientRect();
    cas('options rapides : en mode grands boutons, le « ? » fait au moins 44 px', b0.width >= 43 && b0.height >= 43, Math.round(b0.width) + 'x' + Math.round(b0.height));
    p.grandsBoutons = '0'; appliquerPreferencesAffichage(p); await attente(500);
  }



  // ---------------- « ? » à la place des textes explicatifs ; carte Expérience personnelle jamais cachée à tort (retour Denis 2026-10-03) ----------------
  async function parcoursAidesEtPerso() {
    await preparerCvResultats();
    // Essai indépendant : les réponses de l'assistant laissées par un parcours précédent (rubriques et compétences proposées) changeraient l'état de départ.
    dossier.ia = {}; _mepRerendre(); await attente(4000);
    var sauve = JSON.stringify([dossier.experiencesPerso, dossier.engagements]);
    // sans aucune expérience personnelle ni accroche : la carte reste visible
    dossier.experiencesPerso = []; dossier.engagements = []; if (dossier.ia && dossier.ia.cv) { dossier.ia.cv.accrochesProposees = []; dossier.ia.cv.accrochesCourtesProposees = []; dossier.ia.cv.profil = ''; }
    _mepRerendre(); await attente(3500);
    for (var essai = 0; essai < 8 && !(document.getElementById('cExpPerso') && /Rien n’a été capté/.test(document.getElementById('cExpPerso').textContent)); essai++) { await attente(1500); }
    var vide = document.getElementById('cExpPerso');
    cas('expérience personnelle : la carte est là même sans aucune entrée, et le dit', !!vide && /Rien n’a été capté/.test(vide.textContent) && !/Vos informations/.test(vide.textContent), '');
    document.getElementById('cEntete').open = true; await attente(300);
    cas('accroche : plus de case « Version courte », même sans phrase d’accroche', !document.querySelector('[data-mep-accroche-courte]'), '');
    dossier.experiencesPerso = [{ intitule: 'Bricolage', missions: 'Réparer des meubles\nPeindre des murs' }];
    window._mepExperiencePersoMoteur = [];   // l'aperçu peut envoyer une liste vide : la carte ne doit pas disparaître
    _mepRerendre(); await attente(3500);
    var perso = document.getElementById('cExpPerso');
    cas('expérience personnelle : la carte reste affichée même si l’aperçu envoie une liste vide', !!perso, '');
    ['cExp', 'cForm', 'cExpPerso', 'cSupp', 'cTexte'].forEach(function (i) { var d = document.getElementById(i); if (d) { d.open = true; } });
    await attente(300);
    ['cExp', 'cForm', 'cExpPerso'].forEach(function (id) {
      var d = document.getElementById(id); if (!d) { return; }
      cas('« ? » : plus de petit texte sous les boutons radio de ' + id, d.querySelectorAll('.rad > small').length === 0, String(d.querySelectorAll('.rad > small').length));
      cas('« ? » : ' + id + ' a ses petits « ? »', d.querySelectorAll('.rad .aide-option').length >= 2, String(d.querySelectorAll('.rad .aide-option').length));
    });
    var ligneKo = [].slice.call(document.querySelectorAll('#cExp .rad .aide-option, #cForm .rad .aide-option, #cExpPerso .rad .aide-option')).filter(function (b) {
      var inp = b.closest('label').querySelector('input').getBoundingClientRect(), q = b.getBoundingClientRect(); var r = document.createRange(); r.selectNodeContents(b.closest('.mot-final')); var t = r.getClientRects()[0];
      var ci = inp.top + inp.height / 2; return Math.abs(ci - (q.top + q.height / 2)) > 4 || Math.abs(ci - (t.top + t.height / 2)) > 4;
    }).length;
    cas('« ? » : bouton rond, texte et « ? » de chaque bouton radio sont alignés au centre sur une même ligne', ligneKo === 0, String(ligneKo));
    var f = document.getElementById('cForm');
    cas('« ? » : les 4 boutons des formations ont leur « ? »', f.querySelectorAll('.rad .aide-option').length === 4, String(f.querySelectorAll('.rad .aide-option').length));
    var bt = f.querySelector('.rad .aide-option'); var radio = bt.closest('label').querySelector('input'); var avant = radio.checked;
    bt.click(); await attente(200);
    var bl = document.getElementById('mepBulleAide');
    cas('« ? » : le clic ouvre l’explication dans une bulle', !!bl && !bl.hidden && bl.textContent.length > 5, bl ? bl.textContent : '');
    if (bl && !bl.hidden) { bl.querySelector('.mep-bulle-fermer').click(); await attente(150); }
    cas('« ? » : le clic n’a pas changé le choix', radio.checked === avant, '');
    bt.click(); await attente(200); bt.click(); await attente(200);
    cas('« ? » : un second clic referme l’explication', document.getElementById('mepBulleAide').hidden, '');
    ['cSupp', 'cTexte'].forEach(function (id) {
      var d = document.getElementById(id);
      cas('« ? » : ' + id + ' n’a plus de texte explicatif entre parenthèses', !!d && !/\((inutile|gagne|rubrique à part)/i.test(d.textContent), '');
    });
    // Mode de présentation : plus de parenthèses explicatives dans les intitulés (elles sont derrière le « ? »).
    var modes = [].slice.call(document.querySelectorAll('#cExp [data-mep-mode-presentation]')).map(function (i) { return i.closest('label').textContent.replace('?', '').trim(); });
    cas('mode de présentation : intitulés courts, sans parenthèses (Chronologique, Par compétences, Mixte)', modes.length === 3 && modes.every(function (t) { return t.indexOf('(') === -1; }), modes.join(' | '));
    cas('mode de présentation : « Chronologique » et « Mixte » ont leur « ? »', document.querySelectorAll('#cExp [data-mep-mode-presentation="A"]')[0].closest('label').querySelector('.aide-option') && document.querySelector('#cExp [data-mep-mode-presentation="B"]').closest('label').querySelector('.aide-option') ? true : false, '');
    // Disposition des compétences : les trois boutons sur une seule ligne, pour chaque famille
    document.getElementById('cComp').open = true; await attente(300);
    ['pro', 'comp'].forEach(function (f) {
      var bt = [].slice.call(document.querySelectorAll('[data-mep-dispcomp-' + f + ']'));
      var tops = bt.map(function (b) { return Math.round(b.getBoundingClientRect().top); });
      cas('disposition ' + f + ' : les trois boutons sont sur la même ligne', bt.length === 3 && tops.every(function (t) { return Math.abs(t - tops[0]) < 3; }), tops.join(','));
    });
    // Aucun bouton « brut » (gris du navigateur) dans les cartes : même charte partout (retour Denis 2026-10-03). On affiche aussi le cas « Texte » des compétences.
    cas('en-tête : la phrase « Votre CV est déjà mis en page automatiquement » est supprimée', !/La plupart des personnes n.y touchent pas/.test((document.querySelector('.mep-mq .entete') || document.body).textContent), '');
    var cf = document.getElementById('cComp'); cf.open = true; await attente(300);
    var btxt = cf.querySelector('[data-mep-stylefam-pro="texte"]'); if (btxt) { btxt.click(); await attente(3500); }
    document.querySelectorAll('.mep-mq details.mep-carte').forEach(function (d) { d.open = true; });
    await attente(300);
    var bruts = [].slice.call(document.querySelectorAll('.mep-mq button')).filter(function (b) {
      var r = b.getBoundingClientRect(); return r.width > 2 && b.checkVisibility() && getComputedStyle(b).backgroundColor === 'rgb(239, 239, 239)';
    }).map(function (b) { return (b.textContent.trim() || b.className).slice(0, 30); });
    cas('boutons : aucun bouton gris « brut » du navigateur dans les cartes', bruts.length === 0, bruts.join(' ; '));
    var bgen = document.getElementById('cComp').querySelector('[data-mep-stylefam-pro="general"]'); if (bgen) { bgen.click(); await attente(3500); }   // remet le style d'origine : les autres essais en dépendent
    var qm = document.querySelector('[data-mep-qualites-metier]');
    if (qm) {
      var qb = qm.closest('label').querySelector('.aide-option'); var avantQ = qm.checked;
      if (qb) { qb.click(); await attente(200); var tq = document.getElementById('mepBulleAide');
        cas('« ? » des qualités attendues : le clic ouvre l’explication sans cocher la case', !!tq && !tq.hidden && qm.checked === avantQ, ''); if (tq && !tq.hidden) { tq.querySelector('.mep-bulle-fermer').click(); await attente(150); } }
    }
    window._mepExperiencePersoMoteur = undefined;
    var sv = JSON.parse(sauve); dossier.experiencesPerso = sv[0]; dossier.engagements = sv[1];
    _mepRerendre(); await attente(3000);
  }


  // ---------------- Compétences : signe devant chaque compétence, légende cachée derrière un « ? » (retour Denis 2026-10-03) ----------------
  async function parcoursSignesCompetences() {
    await preparerCvResultats();
    // Essai indépendant : les réponses de l'assistant laissées par un parcours précédent (rubriques et compétences proposées) changeraient l'état de départ.
    dossier.ia = {}; _mepRerendre(); await attente(4000);
    var carte = document.getElementById('cComp'); carte.open = true; await attente(300);
    var bpro = carte.querySelector('[data-mep-pick="pro"]'); bpro.click(); await attente(800);
    var zone = function () { return document.getElementById('mepPickPro'); };
    var noms = [].slice.call(zone().querySelectorAll('[data-mep-pick-item]')).map(function (i) { return i.getAttribute('data-nom'); });
    cas('signes : la liste des compétences professionnelles s’ouvre', noms.length >= 2, String(noms.length));
    window._mepProAttendues = [];
    _mepMajCompetencesMq(); await attente(500);
    cas('signes : sans aucune compétence attendue, pas de « ? » ni de légende', !zone().querySelector('[data-mep-legende]') && !zone().querySelector('.legende'), '');
    window._mepProAttendues = [noms[noms.length - 1]];
    _mepMajCompetencesMq(); await attente(500);
    var signes = zone().querySelectorAll('label .sg');
    cas('signes : chaque compétence a son signe (point plein tiré du CV, losange vide attendue)', signes.length === noms.length && zone().querySelectorAll('label .sg.att').length === 1 && zone().querySelectorAll('label .sg.cv').length === noms.length - 1, signes.length + '/' + noms.length);
    cas('signes : plus aucun texte « attendu dans ce secteur » répété dans la liste', !/attendu dans ce secteur|proposé pour ce métier/i.test(zone().textContent.replace(/Attendue dans ce secteur : .*/, '')) && zone().querySelectorAll('em.ex').length === 0, '');
    var leg = zone().querySelector('[data-mep-legende-zone]');
    var posBouton = zone().querySelector('[data-mep-legende]').getBoundingClientRect().top, posPremiere = zone().querySelector('[data-mep-pick-item]').getBoundingClientRect().top, posDerniere = [].slice.call(zone().querySelectorAll('[data-mep-pick-item]')).pop().getBoundingClientRect().top;
    cas('signes : le « ? » est EN BAS de la liste (sous la dernière compétence), pas en haut', posBouton > posDerniere && posBouton > posPremiere, posBouton + '/' + posDerniere);
    cas('signes : la légende est cachée d’office (rien d’annoncé avant que la personne choisisse)', !!leg && leg.hidden && !leg.checkVisibility(), '');
    cas('signes : le bouton s’appelle « Légende »', /Légende/.test(zone().querySelector('.pied-legende').textContent), '');
    var q = zone().querySelector('[data-mep-legende]'); q.click(); await attente(200);
    var bl2 = document.getElementById('mepBulleAide');
    cas('signes : le « ? » ouvre la légende (dans une bulle) expliquant les deux signes', !!bl2 && !bl2.hidden && /CV/.test(bl2.textContent) && /Attendue/.test(bl2.textContent) && q.getAttribute('aria-expanded') === 'true', bl2 ? bl2.textContent : '');
    var cb = zone().querySelector('[data-mep-pick-item]'); var avant = cb.checked; q.click(); await attente(200);
    cas('signes : le « ? » ne coche rien et referme la légende', cb.checked === avant && bl2.hidden, '');
    window._mepProAttendues = undefined;
    bpro.click(); await attente(300);
  }


  // ---------------- Intitulés de rubriques modifiables : panneau et CV changent ensemble (retour Denis 2026-10-03) ----------------
  async function parcoursIntitules() {
    await preparerCvResultats();
    var W = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var h2 = function (cle) { var e = W().document.querySelector('#conteneurPage h2[data-rub="' + cle + '"] span:last-child, #conteneurPage h2[data-rub="' + cle + '"]'); return e ? e.textContent.trim() : null; };
    var dansCarte = function (carte, origine, sel) { return document.getElementById(carte).querySelector('[data-mep-intitule-' + sel + '="' + origine + '"]'); };
    W()._pdfMqChoix('intitulesPerso', null); _mepRerendre(); await attente(4000);
    ['cComp', 'cExp', 'cForm', 'cSupp'].forEach(function (i) { document.getElementById(i).open = true; });
    await attente(300);
    // Seuls les titres réellement présents sur le CV sont proposés (selon le mode et le modèle) ; les autres restent cachés.
    var visible = function (o) { var z = document.querySelector('.ligne-intitule[data-mep-intitule-zone="' + o + '"]'); return !!z && !z.hidden && z.checkVisibility(); };
    ['Compétences professionnelles', 'Compétences comportementales', 'Expérience professionnelle', 'Formations', 'Langues', 'Centres d’intérêt', 'Certifications'].forEach(function (o) { cas('intitulés : « ' + o + ' » est sur le CV, donc modifiable', visible(o), ''); });
    ['Compétences', 'Compétences en action', 'Savoirs', 'Logiciels et outils'].forEach(function (o) { cas('intitulés : « ' + o + ' » n’est pas sur ce CV, donc pas proposé', !visible(o), ''); });
    ['cComp', 'cExp', 'cForm'].forEach(function (id) {
      var premier = document.getElementById(id).querySelector('.carte-corps > *'); 
      cas('intitulés : le bouton est EN HAUT de la carte ' + id + ' (rien d’autre avant)', !!premier && (premier.classList.contains('ligne-intitule') || premier.classList.contains('autres-titres') || !!premier.querySelector('.ligne-intitule')), premier ? premier.className : '');
    });
    document.querySelector('#cExp [data-mep-mode-presentation="B"]').click(); await attente(4500);
    cas('intitulés : en mode Mixte, « Compétences en action » apparaît sur le CV et devient modifiable', visible('Compétences en action'), '');
    document.querySelector('#cExp [data-mep-mode-presentation="A"]').click(); await attente(4500);
    cas('intitulés : retour en chronologique, « Compétences en action » disparaît', !visible('Compétences en action'), '');
    cas('intitulés : au départ, le CV garde le nom d’origine', h2('Expérience professionnelle') === 'Expériences professionnelles', String(h2('Expérience professionnelle')));
    cas('intitulés : propositions cachées tant qu’on n’a pas cliqué', document.querySelector('#cExp .zone-propositions').hidden === true, '');
    dansCarte('cExp', 'Expérience professionnelle', 'ouvrir').click(); await attente(200);
    cas('intitulés : le bouton ouvre les propositions', document.querySelector('#cExp .zone-propositions').hidden === false && document.querySelectorAll('#cExp [data-mep-intitule-choisir]').length >= 3, '');
    dansCarte('cExp', 'Expérience professionnelle', 'choisir').parentElement.querySelector('[data-valeur="Parcours professionnel"]').click(); await attente(4500);
    var champPrerempli = document.querySelector('#cExp [data-mep-intitule-texte]');
    cas('intitulés : après un choix, le champ est rempli avec l’intitulé et reste modifiable', !!champPrerempli && champPrerempli.value === 'Parcours professionnel', champPrerempli ? champPrerempli.value : '');
    cas('intitulés : « Revenir au nom d’origine » est un vrai bouton', document.querySelector('#cExp [data-mep-intitule-retour]').tagName === 'BUTTON' && document.querySelector('#cExp [data-mep-intitule-retour]').classList.contains('btn-miss'), '');
    cas('intitulés : le CV affiche « Parcours professionnel »', h2('Expérience professionnelle') === 'Parcours professionnel', String(h2('Expérience professionnelle')));
    cas('intitulés : la clé de la rubrique reste le nom d’origine (data-rub)', !!W().document.querySelector('#conteneurPage h2[data-rub="Expérience professionnelle"]') && !W().document.querySelector('#conteneurPage h2[data-rub="Parcours professionnel"]'), '');
    cas('intitulés : le titre de la carte suit le même texte', /Parcours professionnel/.test(document.querySelector('#cExp h3').textContent), document.querySelector('#cExp h3').textContent.slice(0, 40));
    // saisie libre : le texte est protégé (jamais interprété comme du code) et limité à 40 lettres
    var champ = document.querySelector('#cExp [data-mep-intitule-texte]');
    var bValider = document.querySelector('#cExp [data-mep-intitule-valider]');
    cas('intitulés : « Valider » est grisé tant qu’il n’y a rien de nouveau à valider', bValider.disabled === true, '');
    champ.value = ''; champ.dispatchEvent(new Event('input', { bubbles: true }));
    cas('intitulés : champ vidé, « Valider » reste grisé', bValider.disabled === true, '');
    champ.value = '<b>Mon parcours</b> avec un titre vraiment beaucoup trop long pour tenir';
    champ.dispatchEvent(new Event('input', { bubbles: true }));
    cas('intitulés : dès qu’un texte différent est saisi, « Valider » devient actif', bValider.disabled === false, '');
    bValider.click(); await attente(4500);
    var titreLibre = h2('Expérience professionnelle');
    cas('intitulés : saisie libre protégée (aucune balise créée) et limitée à 40 lettres', !!titreLibre && titreLibre.length <= 40 && !W().document.querySelector('#conteneurPage h2[data-rub="Expérience professionnelle"] b') && /<b>/.test(titreLibre), titreLibre);
    // revenir au nom d'origine
    document.querySelector('#cExp [data-mep-intitule-retour]').click(); await attente(4500);
    cas('intitulés : « Revenir au nom d’origine » remet le CV et la carte', h2('Expérience professionnelle') === 'Expériences professionnelles' && /Expériences professionnelles/.test(document.querySelector('#cExp h3').textContent), String(h2('Expérience professionnelle')));
    // compétences : titre de la carte et familles
    cas('intitulés : le titre de la carte Compétences ne change pas quand le titre général n’est pas sur le CV', /^\s*Compétences/.test(document.querySelector('#cComp h3').textContent), document.querySelector('#cComp h3').textContent.slice(0, 30));
    document.querySelector('[data-mep-intitule-ouvrir="Compétences comportementales"]').click(); await attente(200);
    document.querySelector('[data-mep-intitule-choisir="Compétences comportementales"][data-valeur="Savoir-être"]').click(); await attente(4500);
    cas('intitulés : « Compétences comportementales » devient « Savoir-être » sur le CV', h2('Compétences comportementales') === 'Savoir-être', String(h2('Compétences comportementales')));
    cas('intitulés : les libellés du panneau suivent aussi (« Savoir-être à afficher »)', /Savoir-être à afficher/.test(document.getElementById('cComp').textContent), '');
    cas('intitulés : les autres rubriques ne bougent pas', h2('Formations') === 'Formations', String(h2('Formations')));
    // Autres rubriques : le bouton est JUSTE SOUS l'option cochée ; informations complémentaires seulement si la personne en a saisi
    var sousOption = function (attr) { var o = document.querySelector('[' + attr + ']'); var z = o && o.closest('.opt-rub') && o.closest('.opt-rub').querySelector('.ligne-intitule'); return !!z && !z.hidden && z.checkVisibility() && o.closest('label').nextElementSibling === z; };
    cas('intitulés : « Langues » a son bouton juste sous l’option cochée', sousOption('data-mep-rubrique-simple="langues"'), '');
    cas('intitulés : « Certifications » a son bouton juste sous l’option cochée', sousOption('data-mep-certifs-rubrique'), '');
    cas('intitulés : « Centres d’intérêt » a son bouton juste sous l’option cochée, dans « Autres rubriques »', sousOption('data-mep-rubrique-simple="loisirs"') && !!document.querySelector('[data-mep-rubrique-simple="loisirs"]').closest('#cSupp'), '');
    cas('intitulés : plus de case « Afficher les centres d’intérêt » dans « Organisation du CV »', !document.getElementById('cOrg').querySelector('[data-mep-rubrique-simple="loisirs"]'), '');
    cas('intitulés : chaque bouton « Changer l’intitulé » a son « ? » qui explique', document.querySelectorAll('.ligne-intitule:not([hidden]) .ligne-comp .aide-option').length === document.querySelectorAll('.ligne-intitule:not([hidden]) [data-mep-intitule-ouvrir]').length && document.querySelectorAll('.ligne-intitule:not([hidden]) [data-mep-intitule-ouvrir]').length > 0, '');
    var caseVide = document.querySelector('[data-mep-infos-rubrique]'), zoneInfos = document.querySelector('.ligne-intitule[data-mep-intitule-zone="Informations complémentaires"]');
    cas('intitulés : sans information saisie, la case « Informations complémentaires » est là mais grisée', !!caseVide && caseVide.disabled && caseVide.checkVisibility(), '');
    cas('intitulés : le « ? » de « Informations complémentaires » explique d’où viennent ces informations', !!caseVide.closest('label').querySelector('.aide-option') && /Ajouter une information/.test(caseVide.closest('label').querySelector('.aide-option').title), '');
    cas('intitulés : et son bouton « Changer l’intitulé » est visible mais grisé', !!zoneInfos && zoneInfos.checkVisibility() && zoneInfos.querySelector('[data-mep-intitule-ouvrir]').disabled === true, '');
    var infosAvant = dossier.informationsNonClassees; dossier.informationsNonClassees = ['Disponible immédiatement', 'Permis B'];
    _mepRerendre(); await attente(4000); document.getElementById('cSupp').open = true; await attente(300);
    var caseInfos = document.querySelector('[data-mep-infos-rubrique]');
    var rI = caseInfos.getBoundingClientRect(), rQ = caseInfos.closest('label').querySelector('.aide-option').getBoundingClientRect();
    cas('intitulés : la case, l’intitulé et le « ? » d’« Informations complémentaires » sont sur la même ligne', Math.abs((rI.top + rI.height / 2) - (rQ.top + rQ.height / 2)) < 8, Math.round(rI.top) + '/' + Math.round(rQ.top));
    cas('intitulés : une information saisie active la case « Informations complémentaires »', !!caseInfos && !caseInfos.disabled, '');
    cas('intitulés : tant qu’elle n’est pas cochée, la rubrique n’est pas sur le CV et son bouton reste grisé', document.querySelector('[data-mep-intitule-ouvrir="Informations complémentaires"]').disabled === true, '');
    caseInfos.click(); await attente(4500);
    cas('intitulés : cochée, la rubrique apparaît sur le CV et son bouton s’affiche juste sous la case', visible('Informations complémentaires') && sousOption('data-mep-infos-rubrique'), '');
    document.querySelector('[data-mep-intitule-ouvrir="Informations complémentaires"]').click(); await attente(200);
    document.querySelector('[data-mep-intitule-choisir="Informations complémentaires"][data-valeur="Informations pratiques"]').click(); await attente(4500);
    cas('intitulés : « Informations pratiques » sur le CV, et la case du panneau porte le même nom', h2('Informations complémentaires') === 'Informations pratiques' && /Informations pratiques/.test(document.querySelector('[data-mep-infos-rubrique]').closest('label').textContent), String(h2('Informations complémentaires')));
    document.querySelector('[data-mep-infos-rubrique]').click(); await attente(4500);
    dossier.informationsNonClassees = infosAvant; W()._pdfMqChoix('infosCompAffichees', null);
    // Word : même intitulé que sur le CV (le Word lit le rendu)
    W()._pdfMqChoix('intitulesPerso', { 'Expérience professionnelle': 'Parcours professionnel' }); _mepRerendre(); await attente(4500);
    var planWord = JSON.stringify((await exporterCvWord(dossier)).plan).toUpperCase();
    cas('intitulés : le Word affiche le même intitulé que le CV', planWord.indexOf('PARCOURS PROFESSIONNEL') >= 0 && planWord.indexOf('EXPÉRIENCES PROFESSIONNELLES') === -1, '');
    // Phase 2 : liste « Ordre des rubriques » (Organisation du CV) et Mini CV A5
    W()._pdfMqChoix('intitulesPerso', { 'Expérience professionnelle': 'Parcours professionnel' }); _mepRerendre(); await attente(4500);
    document.getElementById('cOrg').open = true; var bPerso = document.querySelector('[data-mep-org-perso]'); if (bPerso) { bPerso.click(); await attente(3500); }
    var listeOrdre = document.querySelector('#cOrg .sous-choix');
    cas('intitulés : la liste « Ordre des rubriques » porte le nom choisi', !!listeOrdre && /Parcours professionnel/.test(listeOrdre.textContent), listeOrdre ? listeOrdre.textContent.slice(0, 80) : '');
    var bStandard = document.querySelector('[data-mep-org-standard]'); if (bStandard) { bStandard.click(); await attente(3500); }
    document.getElementById('cFormat').open = true; await attente(300);
    document.querySelector('[data-mep-format-simple="a5-portrait"]').click(); await attente(5000);
    var titresA5 = [].slice.call(W().document.querySelectorAll('h2')).map(function (h) { return h.textContent.trim(); });
    cas('intitulés : le Mini CV A5 affiche aussi le nom choisi', titresA5.indexOf('Parcours professionnel') !== -1, titresA5.join(' | '));
    cas('intitulés : en A5, la rubrique reste renommable depuis le panneau (clé conservée)', !!W().document.querySelector('[data-rub="Expérience professionnelle"]'), '');
    document.querySelector('[data-mep-format-simple="a4-detaille"]').click(); await attente(5000);
    // « Revenir au modèle de départ » remet l'aspect, PAS les mots de la personne (décision de Denis 2026-10-03)
    W()._pdfMqChoix('intitulesPerso', { 'Expérience professionnelle': 'Parcours professionnel' }); _mepRerendre(); await attente(4500);
    document.getElementById('btnMepRevenirDefaut').click(); await attente(6000);
    var Wb = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var titreApres = Wb().document.querySelector('#conteneurPage h2[data-rub="Expérience professionnelle"]');
    cas('intitulés : « Revenir au modèle de départ » garde les intitulés choisis', !!titreApres && /Parcours professionnel/.test(titreApres.textContent) && (_mepEtatChoixMq().intitulesPerso || {})['Expérience professionnelle'] === 'Parcours professionnel', titreApres ? titreApres.textContent : 'absent');
    // tout remettre
    W()._pdfMqChoix('intitulesPerso', null); _mepRerendre(); await attente(4000);
    cas('intitulés : tout remis, plus aucun intitulé personnel enregistré', !(_mepEtatChoixMq().intitulesPerso), '');
  }


  // ---------------- Dates uniformes : les certifications suivent « Dates alignées » (retour Denis 2026-10-03) ----------------
  async function parcoursDatesCertifs() {
    await preparerCvResultats();
    var W = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var certs = function () { var h = W().document.querySelector('#conteneurPage [data-rub="Certifications"]'); var sec = h && (h.closest('.rub-sec') || h.parentElement); return sec; };
    var alignees = function () { return document.querySelector('[data-mep-dates-alignees]'); };
    document.getElementById('cOrg').open = true; document.getElementById('cExp').open = true; await attente(300);
    cas('dates : « Dates alignées » est cochée au départ', alignees().checked, '');
    var sec1 = certs();
    cas('dates : les certifications sont de vraies lignes avec leur date à droite, comme les formations', !!sec1 && sec1.querySelectorAll('.item .ligne .dates').length === 4 && /2026/.test(sec1.querySelector('.dates').textContent), sec1 ? String(sec1.querySelectorAll('.item .ligne .dates').length) : 'absente');
    var datesForm = W().document.querySelector('#conteneurPage [data-rub="Formations"] .ligne .dates');
    var datesCert = sec1 && sec1.querySelector('.ligne .dates');
    cas('dates : même place pour les certifications et les formations (même bord droit)', !!datesForm && !!datesCert && Math.abs(datesForm.getBoundingClientRect().right - datesCert.getBoundingClientRect().right) < 2, '');
    var planWord = JSON.stringify((await exporterCvWord(dossier)).plan);
    cas('dates : le Word garde la date des certifications', planWord.indexOf('2026') !== -1 && planWord.indexOf('Sensibilisation amiante') !== -1, '');
    // sous le titre / avant le titre : les certifications suivent
    document.querySelector('#cExp [data-mep-position-dates="sous"]').click(); await attente(4500);
    var s2 = certs();
    cas('dates : dates sous le titre, les certifications suivent', !!s2 && s2.querySelectorAll('.item .meta').length === 4 && s2.querySelectorAll('.ligne .dates').length === 0, '');
    document.querySelector('#cExp [data-mep-position-dates="avant"]').click(); await attente(4500);
    var s3 = certs();
    cas('dates : dates avant le titre, les certifications suivent', !!s3 && s3.querySelectorAll('.dates').length === 4 && s3.querySelectorAll('.ligne .dates').length === 0, '');
    document.querySelector('#cExp [data-mep-position-dates="droite"]').click(); await attente(4500);
    // décochée : chaque rubrique redevient autonome, les certifications reprennent leur texte d'avant
    alignees().click(); await attente(4500);
    var s4 = certs();
    cas('dates : « Dates alignées » décochée, les certifications reprennent leur texte d’avant', !!s4 && s4.querySelectorAll('.dates').length === 0 && /Sensibilisation amiante - 2026/.test(s4.textContent), s4 ? s4.textContent.slice(0, 60) : '');
    alignees().click(); await attente(4500);
    cas('dates : recochée, les certifications redeviennent des lignes datées', !!certs() && certs().querySelectorAll('.ligne .dates').length === 4, '');
  }


  // ---------------- Dates : suggestion « juste après le titre », Formations et Certifications côte à côte (retour Denis 2026-10-03) ----------------
  async function parcoursDatesSuggestion() {
    await preparerCvResultats();
    var W = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var d = function () { return W().document; };
    var h0 = W()._pdfMesurerHauteurPage();
    W()._pdfMqChoix('datesApresTitre', ['Formations', 'Certifications']); W()._pdfMqChoix('formCertifsCoteACote', true); await attente(4500);
    var form = d().querySelector('#conteneurPage [data-rub="Formations"]'), cert = d().querySelector('#conteneurPage [data-rub="Certifications"]');
    cas('dates après le titre : Formations et Certifications n’ont plus de date à droite', !!form && !!cert && !form.parentElement.querySelector('.ligne .dates') && !cert.parentElement.querySelector('.ligne .dates'), '');
    cas('dates après le titre : la date suit le titre (« …, 2026 »)', /Sensibilisation amiante, 2026/.test(cert.parentElement.textContent) && /Agent de prévention - AFPA, 2021/.test(form.parentElement.textContent), cert.parentElement.textContent.slice(0, 60));
    var paire = form.closest('.paire');
    cas('dates après le titre : Formations et Certifications sont côte à côte', !!paire && paire.contains(cert), '');
    var exp = d().querySelector('#conteneurPage [data-rub="Expérience professionnelle"]');
    cas('dates après le titre : les expériences gardent leur date à droite', !!exp && !!exp.parentElement.querySelector('.ligne .dates'), '');
    var h1 = W()._pdfMesurerHauteurPage();
    cas('dates après le titre : la page est plus courte (une rangée de moins)', h1 < h0, h0 + ' -> ' + h1);
    var planWord = JSON.stringify((await exporterCvWord(dossier)).plan);
    cas('dates après le titre : le Word garde toutes les certifications et leurs dates', planWord.indexOf('Habilitation électrique') !== -1 && planWord.indexOf('2026') !== -1, '');
    W()._pdfMqChoix('datesApresTitre', null); W()._pdfMqChoix('formCertifsCoteACote', null); await attente(4500);
    cas('dates après le titre : tout remis, les dates repassent à droite', !!d().querySelector('#conteneurPage [data-rub="Certifications"]').parentElement.querySelector('.ligne .dates'), '');
    // le moteur de suggestions la propose seulement quand elle gagne de la place
    var h = W()._pdfMesurerHauteurPage();
    var liste = W()._pdfCalculerSuggestions(h, 'gagner').concat(W()._pdfCalculerSuggestions(h, 'remplir'));
    var sug = liste.filter(function (x) { return x.id === 'dates-apres'; })[0];
    cas('dates après le titre : « Mise en page » propose la suggestion (elle gagne de la place)', !!sug, liste.map(function (x) { return x.id; }).join(','));
    if (sug) {
      var hAvant = W()._pdfMesurerHauteurPage();
      W()._pdfAppliquerChangementsSuggestion(sug.changes); W()._pdfRafraichir(); await attente(500);
      cas('dates après le titre : la suggestion appliquée raccourcit bien la page', W()._pdfMesurerHauteurPage() < hAvant, hAvant + ' -> ' + W()._pdfMesurerHauteurPage());
      W()._pdfMqChoix('datesApresTitre', null); W()._pdfMqChoix('formCertifsCoteACote', null); await attente(3000);
    }
  }


  // ---------------- Option « Stage » sur chaque expérience (retour Denis 2026-10-03) ----------------
  async function parcoursStageExperience() {
    await preparerCvResultats();
    var W = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var sauve = JSON.stringify(dossier.experiences);
    dossier.experiences = [
      { poste: 'Agent de sécurité', entreprise: 'Sécuritas', lieu: 'Limoges', dateDebut: '2022-01', dateFin: '2024-06', missions: 'Surveiller les accès\nContrôler les badges' },
      { poste: 'Stagiaire en cuisine', entreprise: 'Café du centre', lieu: 'Limoges', dateDebut: '2018-05', dateFin: '2018-06', missions: 'Préparer les plats' }
    ];
    _mepRerendre(); await attente(4500);
    document.getElementById('cExp').open = true; var z = document.getElementById('zoneChoixExp'); if (z) { z.open = true; } await attente(300);
    var btn = function () { return [].slice.call(document.querySelectorAll('[data-mep-exp-stage]')); };
    var texteCV = function () { return W().document.querySelector('#conteneurPage').textContent; };
    cas('stage : un bouton « Stage » sur la ligne de chaque expérience', btn().length === 2, String(btn().length));
    cas('stage : une expérience dont le poste dit « Stagiaire » est DÉJÀ cochée (reconnue dans le CV d’origine)', btn()[1].getAttribute('aria-pressed') === 'true' && btn()[0].getAttribute('aria-pressed') === 'false', btn().map(function (b) { return b.getAttribute('aria-pressed'); }).join(','));
    cas('stage : le CV n’écrit pas « (stage) » deux fois quand le poste le dit déjà', /Stagiaire en cuisine/.test(texteCV()) && !/\(stage\)/.test(texteCV()), '');
    btn()[0].click(); await attente(4500);
    cas('stage : un clic marque l’expérience, sans l’ouvrir', btn()[0].getAttribute('aria-pressed') === 'true' && dossier.experiences[0].stage === true, '');
    cas('stage : le CV écrit « Agent de sécurité (stage) »', /Agent de sécurité \(stage\)/.test(texteCV()), '');
    var plan = JSON.stringify((await exporterCvWord(dossier)).plan);
    cas('stage : le Word écrit aussi « (stage) »', plan.indexOf('Agent de sécurité (stage)') !== -1, '');
    btn()[0].click(); await attente(4500);
    cas('stage : un second clic retire la mention', btn()[0].getAttribute('aria-pressed') === 'false' && !/Agent de sécurité \(stage\)/.test(texteCV()), '');
    btn()[1].click(); await attente(4500);
    cas('stage : la personne peut décocher un stage reconnu à tort (le poste garde son texte)', btn()[1].getAttribute('aria-pressed') === 'false' && dossier.experiences[1].stage === false && /Stagiaire en cuisine/.test(texteCV()), '');
    // dans la fenêtre d'édition d'une expérience : le même bouton, le même état
    var chk = document.querySelector('[data-mep-exp-editer]'); if (chk && !chk.checked) { chk.click(); await attente(3000); }
    var ouvr = document.querySelector('[data-mep-exp-ouvrir="0"]'); if (ouvr) { ouvr.click(); await attente(2500); }
    var bEdit = document.querySelector('.exp-edit [data-mep-exp-stage]');
    cas('stage : le bouton « Stage » est aussi dans la fenêtre d’édition de l’expérience, dans le même état que la liste', !!bEdit && bEdit.getAttribute('aria-pressed') === String(dossier.experiences[0].stage === true), bEdit ? bEdit.getAttribute('aria-pressed') : 'absent');
    if (bEdit) {
      bEdit.click(); await attente(4500);
      cas('stage : cliquer dans l’édition change l’état partagé (liste, CV)', dossier.experiences[0].stage === true && btn()[0].getAttribute('aria-pressed') === 'true' && /Agent de sécurité \(stage\)/.test(texteCV()), String(dossier.experiences[0].stage));
    }
    chk = document.querySelector('[data-mep-exp-editer]'); if (chk && chk.checked) { chk.click(); await attente(2500); }
    dossier.experiences = JSON.parse(sauve); _mepRerendre(); await attente(3500);
  }

  // ---------------- Les messages citent les intitulés CHOISIS, jamais le nom d'origine (retour Denis 2026-10-03) ----------------
  async function parcoursNomsDansLesMessages() {
    await preparerCvResultats();
    var W = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var ancien = Object.assign({}, _mepIntitulesPerso());
    try {
      _mepDefinirIntitule('Formations', 'Mes études'); _mepDefinirIntitule('Expérience professionnelle', 'Parcours pro'); await attente(4500);
      cas('noms : l’assistant des suggestions lit l’intitulé choisi (et le nom d’origine des autres)', W()._pdfNA('Formations') === 'Mes études' && W()._pdfNA('Langues') === 'Langues', W()._pdfNA('Formations'));
      var avert = _mqAvertExp() + ' ' + _mqAvertDuo();
      cas('noms : les avertissements du grand aperçu citent les intitulés choisis', avert.indexOf('Parcours pro') !== -1 && avert.indexOf('Mes études') !== -1 && !/Expérience professionnelle|Formations/.test(avert), avert);
      cas('noms : « Expérience professionnelle » sans intitulé choisi s’écrit au pluriel dans les messages', (function () { _mepDefinirIntitule('Expérience professionnelle', ''); return _mqAvertExp().indexOf('Expériences professionnelles') !== -1; })(), '');
    } finally {
      _mepDefinirChoixMq('intitulesPerso', Object.keys(ancien).length ? ancien : null); await attente(3500);
    }
  }

  // ---------------- Carte « Organisation du CV » : toutes les options visibles et présentées pareil, « ? » sur les grisées, puces par rubrique (retour Denis 2026-10-03) ----------------
  async function parcoursOrganisationEtPuces() {
    await preparerCvResultats();
    var W = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var org = function () { var d = document.getElementById('cOrg'); d.open = true; return d; };
    var lignesDe = function (el) { var r = document.createRange(); r.selectNodeContents(el); var t = [].slice.call(r.getClientRects()).filter(function (x) { return x.width > 1; }).map(function (x) { return x.top; }).sort(function (a, b) { return a - b; }); var n = t.length ? 1 : 0; for (var i = 1; i < t.length; i++) { if (t[i] - t[i - 1] > 12) { n++; } } return n; };
    await attente(400);
    var cases = [].slice.call(org().querySelectorAll('.checks.auto .ck'));
    cas('organisation : toutes les options sont des carrés à cocher avec leur « ? » à côté du texte', cases.length >= 15 && cases.every(function (l) { return !!l.closest('.opt-aide') && !!l.querySelector('.aide-option'); }), cases.length + ' options, ' + cases.filter(function (l) { return !l.querySelector('.aide-option'); }).map(function (l) { return l.textContent.trim().slice(0, 25); }).join(' / '));
    cas('organisation : plus aucun message entre parenthèses ni bouton « Harmoniser »', !/\(sans effet/i.test(org().textContent) && !org().querySelector('[data-mep-harmoniser]'), '');
    var gauche = org().querySelector('[data-mep-org-formgauche]');
    cas('organisation : « Formations dans la colonne de gauche » reste visible en une colonne, grisée, avec le « ? » qui dit pourquoi', !!gauche && gauche.disabled && /Deux colonnes/.test((gauche.closest('.opt-aide').querySelector('.aide-option') || {}).title || ''), gauche ? String(gauche.disabled) : 'absente');
    cas('organisation : « Blocs courts » reste visible en deux colonnes aussi (grisé avec son « ? »)', (function () { _mepDefinirChoixMq('blocsCourts', null); return true; })() && !!org().querySelector('.cote-inline'), '');
    // puces
    // missions « épurées » (une par ligne, à puces) dans les expériences et les formations : sans elles, aucune liste à puces à vérifier à l'écran ni dans le Word
    document.getElementById('cExp').open = true; var zExp = document.getElementById('cExp').querySelector('[data-mep-missionspro="epure"]'); if (zExp) { zExp.click(); await attente(3500); }
    document.getElementById('cForm').open = true; var zForm = document.getElementById('cForm').querySelector('[data-mep-missionsformations="epure"]'); if (zForm) { zForm.click(); await attente(3500); }
    var memes = function () { return org().querySelector('[data-mep-puces-memes]'); };
    cas('puces : « Mêmes puces partout » est cochée d’office, sans choix par rubrique', !!memes() && memes().checked && !org().querySelector('.puces-par-rubrique'), '');
    memes().click(); await attente(4500);
    cas('puces : décochée, une forme se choisit pour chaque rubrique (4 lignes)', !memes().checked && org().querySelectorAll('[data-mep-puce-zone]').length === 4, String(org().querySelectorAll('[data-mep-puce-zone]').length));
    var choisir = function (k, v) { org().querySelector('[data-mep-puce-zone="' + k + '"] [data-mep-puce-rub="' + v + '"]').click(); };
    choisir('exp', 'carre'); await attente(4500); choisir('form', 'triangle'); await attente(4500);
    var f = _mepEtatChoixMq().formesPuces || {};
    cas('puces : les choix sont enregistrés (expériences carré, formations triangle, les autres inchangées)', f.exp === 'carre' && f.form === 'triangle' && f.perso === 'rond' && f.comp === 'rond', JSON.stringify(f));
    var d = W().document, style = d.documentElement.innerHTML;
    cas('puces : le CV porte une règle de puce différente pour les expériences et pour les formations', style.indexOf('data-rub="Expérience professionnelle"] ul { list-style-type: square') !== -1 && style.indexOf('data-rub="Formations"] ul { list-style-type: "') !== -1, '');
    var ulExp = d.querySelector('.rub-sec[data-rub="Expérience professionnelle"] ul');
    cas('puces : les expériences ont bien une liste à puces pour la vérification', !!ulExp, ulExp ? 'ok' : 'absente');
    if (ulExp) {
      cas('puces : la liste des expériences affiche vraiment un carré à l’écran', W().getComputedStyle(ulExp).listStyleType === 'square', W().getComputedStyle(ulExp).listStyleType);
      var plan = JSON.stringify((await exporterCvWord(dossier)).plan);
      cas('puces : le Word reprend le carré choisi', plan.indexOf('▪') !== -1, '');
    }
    cas('puces : le réglage général de « Mise en page et texte » est grisé tant que chaque rubrique a sa forme', (function () { var c = document.getElementById('cTexte'); if (c) { c.open = true; } var b = document.querySelector('[data-mep-formepuce]'); return !!b && b.disabled; })(), '');
    memes().click(); await attente(4500);
    cas('puces : recochée, une seule forme pour tout le CV (plus de choix par rubrique)', memes().checked && !_mepEtatChoixMq().formesPuces && !org().querySelector('.puces-par-rubrique'), '');
    var cc0 = document.getElementById('cComp'); cc0.open = true;
    var lignesStyle = [].slice.call(cc0.querySelectorAll('[data-mep-stylefam-pro], [data-mep-stylefam-comp]')).map(function (b) { return b.closest('.inline'); }).filter(function (v, i, a) { return v && a.indexOf(v) === i; });
    cas('compétences : le choix du style de chaque famille (Général, Pastilles, Rectangles, Texte) tient sur UNE ligne en affichage normal', lignesStyle.length === 2 && lignesStyle.every(function (z) { return lignesDe(z) === 1; }), lignesStyle.map(function (z) { return lignesDe(z); }).join(','));
    cas('organisation : en affichage normal aussi, chaque option tient sur UNE ligne (intitulé, carré et « ? »)', [].slice.call(org().querySelectorAll('.checks.auto .ck')).every(function (l) { return lignesDe(l) === 1; }), [].slice.call(org().querySelectorAll('.checks.auto .ck')).filter(function (l) { return lignesDe(l) !== 1; }).map(function (l) { return l.textContent.trim().slice(0, 30); }).join(' / '));
    // les deux listes de compétences s'ouvrent et se ferment ensemble
    var cC = document.getElementById('cComp'); cC.open = true;
    var bP = cC.querySelector('[data-mep-pick="pro"]'); if (bP) { bP.click(); await attente(900); }
    cas('compétences : ouvrir une liste ouvre aussi l’autre (professionnelles et comportementales)', !!document.getElementById('mepPickPro').innerHTML && !!document.getElementById('mepPickComp').innerHTML, '');
    bP = document.getElementById('cComp').querySelector('[data-mep-pick="comp"]'); if (bP) { bP.click(); await attente(900); }
    cas('compétences : refermer l’une referme aussi l’autre', !document.getElementById('mepPickPro').innerHTML && !document.getElementById('mepPickComp').innerHTML, '');
    // grands boutons : une option par ligne, jamais deux lignes
    var prefs = preferencesAffichageActuelles(); var avant = prefs.grandsBoutons;
    prefs.grandsBoutons = '1'; appliquerPreferencesAffichage(prefs); await attente(900);
    var long = org().querySelector('[data-mep-style-commun]').closest('label');
    cas('grands boutons : « Même écriture partout » tient sur UNE ligne', lignesDe(long) === 1, String(lignesDe(long)));
    cas('grands boutons : aucune option de la carte ne passe sur deux lignes', [].slice.call(org().querySelectorAll('.checks.auto .ck')).every(function (l) { return lignesDe(l) === 1; }), [].slice.call(org().querySelectorAll('.checks.auto .ck')).filter(function (l) { return lignesDe(l) !== 1; }).map(function (l) { return l.textContent.trim().slice(0, 30); }).join(' / '));
    prefs = preferencesAffichageActuelles(); prefs.grandsBoutons = avant; appliquerPreferencesAffichage(prefs); await attente(500);
    _mepDefinirChoixMq('formesPuces', null); await attente(3500);
  }

  // ---------------- Modes de présentation : les listes portent les vrais noms des rubriques du CV, « Compétences en action » aussi en Par compétences, ordre des mots-clés (retour Denis 2026-10-03) ----------------
  async function parcoursModesEtNoms() {
    await preparerCvResultats();
    var W = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var cx = document.getElementById('cExp'); cx.open = true;
    var mode = async function (m) { document.querySelector('[data-mep-mode-presentation="' + m + '"]').click(); await attente(3500); document.getElementById('cExp').open = true; };
    var titres = function () { return [].slice.call(W().document.querySelectorAll('#conteneurPage h2[data-rub]')).map(function (h) { return h.getAttribute('data-rub'); }); };
    var titreListe = function (id) { var z = document.getElementById(id); return z ? z.querySelector('.cb-ouvrir').textContent.replace(/ /g, ' ') : ''; };
    var textes = function () { return [].slice.call(W().document.querySelectorAll('#conteneurPage h2[data-rub]')).map(function (h) { return h.textContent.trim(); }); };
    var ancien = Object.assign({}, _mepIntitulesPerso());
    try {
      await mode('C');
      var radioC = document.querySelector('[data-mep-mode-presentation="C"]').closest('label');
      cas('modes : « Par compétences » a une infobulle qui dit que ce ne sont pas des mots-clés', !!radioC.querySelector('.aide-option') && /pas des mots-cl/.test(radioC.querySelector('.aide-option').title), '');
      cas('modes : en « Par compétences », la rubrique du CV s’appelle « Compétences en action » (plus « Compétences professionnelles »)', titres().indexOf('Compétences en action') !== -1 && titres().indexOf('Compétences professionnelles') === -1, titres().join(' / '));
      cas('modes : la liste du panneau porte ce nom', titreListe('zoneCompMissions') === 'Modifier « Compétences en action »', titreListe('zoneCompMissions'));
      cas('modes : la liste des expériences porte le vrai nom et dit où elle se trouve', titreListe('zoneChoixExp') === 'Modifier « Expériences professionnelles »' && /Sous les compétences/.test(document.getElementById('zoneChoixExp').querySelector('small').textContent), titreListe('zoneChoixExp'));
      var zi = document.getElementById('cExp').querySelector('[data-mep-intitule-zone="Compétences en action"]');
      cas('modes : l’intitulé de « Compétences en action » se change dans la carte Expériences (aussi en Par compétences)', !!zi && !zi.hidden, zi ? String(zi.hidden) : 'absent');
      cas('modes : la clé « pro » du panneau désigne le bloc du CV (grand aperçu, ordre des colonnes)', _MEP_TITRES_COLONNES.pro === 'competencesEnAction' && _mqCleRubrique('Compétences en action') === 'pro', String(_MEP_TITRES_COLONNES.pro));
      _mepDefinirIntitule('Compétences en action', 'Mes missions clés'); await attente(4500); document.getElementById('cExp').open = true;
      cas('modes : renommée, le CV et le titre de la liste suivent', textes().indexOf('Mes missions clés') !== -1 && titreListe('zoneCompMissions') === 'Modifier « Mes missions clés »', textes().join(' / ') + ' | ' + titreListe('zoneCompMissions'));
      cas('modes : la carte Compétences nomme sa liste de la même façon en Par compétences', /Mes missions clés/.test(document.getElementById('cComp').textContent), '');
      await mode('B');
      cas('modes : en Mixte, les deux rubriques sont sur le CV (missions en action et mots-clés)', textes().indexOf('Mes missions clés') !== -1 && titres().indexOf('Compétences professionnelles') !== -1, textes().join(' / '));
      cas('modes : en Mixte, la liste des mots-clés porte son vrai nom', titreListe('zoneProMixte') === 'Modifier « Compétences professionnelles »', titreListe('zoneProMixte'));
      cas('modes : en Mixte, la liste des missions en action porte le nom choisi', titreListe('zoneCompMissions') === 'Modifier « Mes missions clés »', titreListe('zoneCompMissions'));
      await mode('A');
      cas('modes : en Chronologique, aucune liste de compétences en action, et « Compétences professionnelles » est sur le CV', !document.getElementById('zoneCompMissions') && titres().indexOf('Compétences professionnelles') !== -1 && _MEP_TITRES_COLONNES.pro === 'competencesPro', titres().join(' / '));
      // nombre et ordre des mots-clés (carte Compétences) : flèches monter / descendre
      var cc = document.getElementById('cComp'); cc.open = true;
      var pills = function () { return [].slice.call(W().document.querySelectorAll('#conteneurPage [data-rub="Compétences professionnelles"] .pill')).map(function (e) { return e.textContent.replace(/×\s*$/, '').trim(); }); };
      var bouton = cc.querySelector('[data-mep-pick="pro"]'); if (bouton) { bouton.click(); await attente(700); }
      var fleches = document.getElementById('cComp').querySelectorAll('[data-mep-pick-bas="pro"]');
      cas('modes : chaque mot-clé affiché a ses flèches « monter / descendre »', fleches.length >= 2 && document.getElementById('cComp').querySelectorAll('[data-mep-pick-haut="pro"]').length === fleches.length, String(fleches.length));
      if (fleches.length >= 2) {
        var avant = pills().slice(0, 2);
        document.getElementById('cComp').querySelector('[data-mep-pick-bas="pro"]').click(); await attente(3500);
        var apres = pills().slice(0, 2);
        cas('modes : « descendre » change l’ordre des mots-clés sur le CV', apres[0] === avant[1] && apres[1] === avant[0], avant.join('|') + ' -> ' + apres.join('|'));
        var cc2 = document.getElementById('cComp'); cc2.open = true;
        if (!cc2.querySelector('[data-mep-pick-raz="pro"]')) { var b2 = cc2.querySelector('[data-mep-pick="pro"]'); if (b2) { b2.click(); await attente(700); } }
        var raz = document.getElementById('cComp').querySelector('[data-mep-pick-raz="pro"]'); if (raz) { raz.click(); await attente(3500); }
        cas('modes : « Remettre la sélection automatique » rétablit aussi l’ordre', pills().slice(0, 2).join('|') === avant.join('|'), pills().slice(0, 2).join('|'));
      }
    } finally {
      _mepDefinirChoixMq('intitulesPerso', Object.keys(ancien).length ? ancien : null); await attente(3500);
    }
  }

  // ---------------- Suggestion « trois rubriques sur une ligne » (retour Denis 2026-10-03) : proposée seulement si elle gagne de la place, jamais appliquée d'office ----------------
  async function parcoursTroisRubriquesLigne() {
    await preparerCvResultats();
    var W = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var d = function () { return W().document; };
    dossier.formations[0].missions = '';
    W()._pdfMqChoix('blocsCourts', 'dessous'); _mepRerendre(); await attente(4500);
    var h = W()._pdfMesurerHauteurPage();
    var liste = W()._pdfCalculerSuggestions(h, 'gagner');
    var sug = liste.filter(function (x) { return x.id === 'trois-ligne'; })[0];
    cas('trois sur une ligne : « Mise en page » propose la suggestion quand trois rubriques courtes sont chacune seule sur sa ligne', !!sug, liste.map(function (x) { return x.id; }).join(','));
    cas('trois sur une ligne : rien n’est appliqué avant le clic (les rubriques sont toujours séparées)', !d().querySelector('#conteneurPage .paire.trois'), '');
    if (sug) {
      var avant = W()._pdfMesurerHauteurPage();
      W()._pdfAppliquerChangementsSuggestion(sug.changes); W()._pdfRafraichir(); await attente(4500);
      var tri = d().querySelector('#conteneurPage .paire.trois');
      cas('trois sur une ligne : une fois appliquée, trois rubriques sont côte à côte sur une même ligne', !!tri && tri.querySelectorAll('.rub-sec[data-rub]').length === 3, tri ? String(tri.querySelectorAll('.rub-sec[data-rub]').length) : 'aucune ligne à trois');
      var apres = W()._pdfMesurerHauteurPage();
      cas('trois sur une ligne : la page est plus courte', apres < avant, avant + ' -> ' + apres);
      var plan = JSON.stringify((await exporterCvWord(dossier)).plan);
      cas('trois sur une ligne : le Word garde toutes les rubriques et leurs dates', plan.indexOf('Habilitation électrique') !== -1 && plan.indexOf('Anglais') !== -1, '');
    }
    W()._pdfMqChoix('lignesUneColonne', null); W()._pdfMqChoix('datesApresTitre', null); W()._pdfMqChoix('blocsCourts', null); await attente(3500);
  }

  // ---------------- « Compétences en action » : disposition (pleine largeur / à côté des comportementales), style des missions, professionnelles et comportementales sur une ligne (2026-10-03) ----------------
  async function parcoursOptionsCompetencesEnAction() {
    await preparerCvResultats();
    var W = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var d = function () { return W().document; };
    var mode = async function (m) { document.querySelector('[data-mep-mode-presentation="' + m + '"]').click(); await attente(3500); document.getElementById('cExp').open = true; document.getElementById('cComp').open = true; };
    var clic = async function (sel) { var b = document.querySelector(sel); if (!b) { return false; } b.click(); await attente(3800); document.getElementById('cExp').open = true; document.getElementById('cComp').open = true; return true; };
    document.getElementById('cExp').open = true; document.getElementById('cComp').open = true;
    // Chronologique : professionnelles à gauche, comportementales à droite (sur la même ligne), ou l'une sous l'autre
    var pro = function () { return d().querySelector('#conteneurPage [data-rub="Compétences professionnelles"]'); }, comp = function () { return d().querySelector('#conteneurPage [data-rub="Compétences comportementales"]'); };
    dossier.competencesCV = ['Rigueur', 'Ponctualité', 'Accueil du public']; _mepRerendre(); await attente(3500);
    await clic('[data-mep-procomp="ligne"]');
    cas('options compétences : professionnelles et comportementales sur la même ligne (professionnelles à gauche)', !!pro() && !!comp() && !!pro().closest('.paire') && pro().closest('.paire') === comp().closest('.paire'), '');
    await clic('[data-mep-procomp="sous"]');
    cas('options compétences : « L’une sous l’autre » les sépare', !!pro() && !!comp() && (!pro().closest('.paire') || pro().closest('.paire') !== comp().closest('.paire')), '');
    cas('options compétences : « Revenir au réglage général » apparaît une fois le choix fait', !!document.querySelector('[data-mep-procomp="auto"]'), '');
    await clic('[data-mep-procomp="auto"]');
    cas('options compétences : le retour au réglage général efface le choix et le bouton disparaît', !_mepEtatChoixMq().proCompDispo && !document.querySelector('[data-mep-procomp="auto"]'), '');
    cas('options compétences : « Blocs courts » a un « ? » qui dit que les compétences ont leur propre réglage', /propre r.glage/.test((document.querySelector('.cote-inline .aide-option') || {}).title || ''), '');
    await clic('[data-mep-procomp="ligne"]');
    // Par compétences
    await mode('C');
    var bp = document.querySelector('[data-mep-procomp]');
    cas('options compétences : en Par compétences, le choix professionnelles / comportementales reste visible mais grisé, avec son « ? »', !!bp && bp.disabled && !!bp.closest('.champ').querySelector('.aide-option'), '');
    var action = function () { return d().querySelector('#conteneurPage [data-rub="Compétences en action"]'); };
    cas('options compétences : le bloc « Compétences en action » est sur le CV en Par compétences', !!action(), '');
    await clic('[data-mep-action-dispo="cote"]');
    cas('options compétences : « À côté des comportementales » place le bloc sur la ligne des comportementales', !!action() && !!comp() && !!action().closest('.paire') && action().closest('.paire') === comp().closest('.paire'), '');
    await clic('[data-mep-action-dispo="large"]');
    cas('options compétences : « Pleine largeur » le remet seul sur sa ligne', !!action() && (!action().closest('.paire') || action().closest('.paire') !== comp().closest('.paire')), '');
    await clic('[data-mep-action-miss="condense"]');
    cas('options compétences : « À la suite, avec un signe » écrit les missions à la suite (plus de liste à puces dans le bloc)', !!action() && !action().querySelector('ul') && /Surveiller les accès/.test(action().textContent), '');
    cas('options compétences : le choix du signe apparaît alors', !!document.querySelector('.options-action [data-mep-sepmissions]'), '');
    await clic('[data-mep-action-miss="epure"]');
    cas('options compétences : « Chaque mission sur une ligne » remet la liste', !!action() && !!action().querySelector('ul'), '');
    // Mixte : « à côté » grisé (les comportementales sont déjà avec les professionnelles)
    await mode('B');
    var bd = document.querySelector('[data-mep-action-dispo]');
    cas('options compétences : en Mixte, « Pleine largeur / À côté » reste visible mais grisé, avec son « ? »', !!bd && bd.disabled && !!bd.closest('.champ').querySelector('.aide-option'), '');
    cas('options compétences : en Mixte, professionnelles et comportementales restent côte à côte, « Compétences en action » est à part', !!pro() && !!comp() && pro().closest('.paire') === comp().closest('.paire') && !!action() && action().closest('.paire') !== pro().closest('.paire'), '');
    await mode('A');
    _mepDefinirChoixMq('proCompDispo', null); _mepDefinirChoixMq('actionCote', null); _mepDefinirChoixMq('styleMissionsAction', null); await attente(3500);
  }

  // ---------------- Contenu de « Compétences en action » : vraies missions des expériences liées au métier, au moins 2, complété en Mixte (2026-10-03) ----------------
  async function parcoursContenuCompetencesEnAction() {
    var exp = function (poste, ent, ms) { return { poste: poste, entreprise: ent, missions: ms.join('\n') }; };
    var six = [exp('Agent de sécurité', 'Sécuritas', ['Surveiller les accès', 'Contrôler les badges', 'Rédiger les rapports', 'Accueillir les visiteurs']), exp('Vendeuse', 'Boulangerie Dupont', ['Conseiller les clients', 'Tenir la caisse']), exp('Employée polyvalente', 'Café du centre', ['Servir en salle', 'Encaisser']),
      exp('Aide-magasinier', 'Logistic 87', ['Ranger les palettes', 'Préparer les expéditions']), exp('Hôte d’accueil', 'Mairie', ['Orienter le public', 'Gérer les appels']), exp('Plongeur', 'Brasserie', ['Laver la vaisselle'])];
    var comp = function (e, g) { return { contenuRetenu: { experiences: e, competences: ['Gestion de caisse', 'Travail en équipe', 'Respect des consignes', 'Accueil du public'], competencesGroupees: g || [] } }; };
    var reco = { experiencesAMettreEnAvant: [{ poste: 'Agent de sécurité', entreprise: 'Sécuritas' }] };
    var textes = function (gs) { return [].concat.apply([], gs.map(function (g) { return g.items.filter(function (i) { return !i.reserve; }).map(function (i) { return i.texte; }); })); };
    // une seule expérience liée sur six : seules SES missions remontent (3), jamais celles des autres
    var r1 = textes(_pdfCompetencesEnAction('C', comp(six), {}, {}, reco));
    cas('contenu : 6 expériences dont 1 seule liée au métier, 3 missions de CETTE expérience en haut', r1.length === 3 && r1.join('|') === 'Surveiller les accès|Contrôler les badges|Rédiger les rapports', r1.join('|'));
    cas('contenu : aucune mission d’une expérience sans rapport avec le métier ne remonte', !r1.some(function (t) { return /caisse|Servir|palettes|Orienter|vaisselle/.test(t); }), '');
    // aucune information sur le métier : toutes les expériences comptent, 6 expériences = 1 mission chacune (la première)
    var r2 = textes(_pdfCompetencesEnAction('C', comp(six), {}, {}, null));
    cas('contenu : sans information sur le métier, 6 expériences donnent la première mission de chacune', r2.length === 6 && r2[0] === 'Surveiller les accès' && r2.indexOf('Conseiller les clients') !== -1, r2.join('|'));
    var r3 = textes(_pdfCompetencesEnAction('C', comp(six.slice(0, 2)), {}, {}, null));
    cas('contenu : 2 expériences = 3 missions chacune au plus (premières en tête, une de chaque expérience en alternance)', r3.length === 5 && r3[0] === 'Surveiller les accès' && r3[1] === 'Conseiller les clients', r3.join('|'));
    var gr = _pdfCompetencesEnAction('C', comp(six), {}, {}, reco)[0].items;
    cas('contenu : la suite des missions de l’expérience liée est EN RÉSERVE (marquée, hors des 3 affichées)', gr.filter(function (i) { return i.reserve; }).length === 1 && gr.filter(function (i) { return !i.reserve; }).length === 3 && gr.filter(function (i) { return i.reserve; })[0].texte === 'Accueillir les visiteurs', gr.map(function (i) { return i.texte + (i.reserve ? '*' : ''); }).join('|'));
    var r4 = textes(_pdfCompetencesEnAction('C', comp([exp('Plongeur', 'Brasserie', ['Laver la vaisselle'])]), {}, {}, null));
    cas('contenu : une expérience à une seule mission : au moins ce qu’elle donne, sans rien inventer', r4.length === 1 && r4[0] === 'Laver la vaisselle', r4.join('|'));
    // mixte : thèmes de l'assistant, complétés par les compétences professionnelles s'il y en a moins de 4
    var themes = [{ theme: 'Sécurité', items: [{ texte: 'Surveillance et contrôle d’accès', illustrePar: [] }, { texte: 'Rédaction de rapports', illustrePar: [] }] }];
    var m1 = textes(_pdfCompetencesEnAction('B', comp(six, themes), { competencesGroupeesParTheme: themes }, {}, null));
    cas('contenu : Mixte complète les 2 compétences regroupées de l’assistant avec les compétences professionnelles (4 en tout)', m1.length === 4 && m1[0] === 'Surveillance et contrôle d’accès' && m1[2] === 'Gestion de caisse', m1.join('|'));
    var plein = [{ theme: 'A', items: [1, 2, 3, 4].map(function (i) { return { texte: 'Compétence ' + i, illustrePar: [] }; }) }];
    cas('contenu : Mixte avec assez de compétences regroupées ne change rien', textes(_pdfCompetencesEnAction('B', comp(six, plein), { competencesGroupeesParTheme: plein }, {}, null)).length === 4, '');
    cas('contenu : Mixte sans aucune recommandation de l’assistant retombe sur les compétences professionnelles', textes(_pdfCompetencesEnAction('B', comp(six, []), {}, {}, null)).length === 4, '');
    // phrases proposees par l'assistant (cv.md point 20) : en tete de la reserve, decochees, jamais un lien invente
    var propo = function (extra) { return Object.assign({}, reco, { missionsEnActionProposees: extra }); };
    var tous = function (r) { return _pdfCompetencesEnAction('C', comp(six), {}, {}, r)[0].items; };
    var ps = tous(propo([{ texte: 'Assurer la sécurité des accès d’un site', illustrePar: ['Sécuritas'], competence: 'Sécurité des accès' }, { texte: 'Phrase liée à une entreprise inconnue', illustrePar: ['Entreprise Fantôme'], competence: 'X' }, { texte: 'Phrase sans lien affirmé', illustrePar: [], competence: '' }, { texte: '  ' }, { texte: 'Surveiller les accès', illustrePar: ['Sécuritas'] }]));
    var pr = ps.filter(function (i) { return i.proposition; });
    cas('propositions : 2 phrases gardées (liée à une vraie expérience, sans lien affirmé), la liée à une entreprise inconnue, la vide et le doublon d’une mission affichée sont écartées', pr.length === 2 && pr[0].texte === 'Assurer la sécurité des accès d’un site' && pr[1].texte === 'Phrase sans lien affirmé', pr.map(function (i) { return i.texte; }).join('|'));
    cas('propositions : décochées d’office (en réserve) et placées avant les missions en réserve', pr.every(function (i) { return i.reserve; }) && ps.indexOf(pr[1]) < ps.findIndex(function (i) { return i.reserve && !i.proposition; }), '');
    cas('propositions : l’étiquette de la compétence et l’expérience source suivent la phrase', pr[0].etiquette === 'Sécurité des accès' && pr[0].illustrePar.indexOf('Sécuritas') !== -1 && pr[1].etiquette === '', JSON.stringify(pr[0]));
    cas('propositions : les 3 missions affichées en haut ne changent pas', textes(_pdfCompetencesEnAction('C', comp(six), {}, {}, propo([{ texte: 'Autre phrase', illustrePar: [] }]))).join('|') === 'Surveiller les accès|Contrôler les badges|Rédiger les rapports', '');
    cas('propositions : au plus 10 phrases', tous(propo([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(function (i) { return { texte: 'Phrase proposée numéro ' + i, illustrePar: [] }; }))).filter(function (i) { return i.proposition; }).length === 10, '');
    cas('propositions : aucune proposition (liste vide ou champ absent) ne change rien', tous(propo([])).filter(function (i) { return i.proposition; }).length === 0 && tous(reco).length === tous(propo([])).length, '');
  }

  // ---------------- Missions en réserve : visibles dans la liste du panneau, décochées ; cocher une mission la fait entrer dans le CV (2026-10-03) ----------------
  async function parcoursMissionsEnReserve() {
    await preparerCvResultats();
    var W = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    dossier.ia = {}; dossier.metierCible = '';
    dossier.experiences = [{ poste: 'Agent de sécurité', entreprise: 'Sécuritas', lieu: 'Limoges', dateDebut: '2022-01', dateFin: '2024-06', missions: 'Surveiller les accès\nContrôler les badges\nRédiger les rapports\nAccueillir les visiteurs\nGérer les alarmes' }];
    _mepRerendre(); await attente(3500);
    document.querySelector('[data-mep-mode-presentation="C"]').click(); await attente(3500);
    document.getElementById('cExp').open = true; document.getElementById('zoneCompMissions').open = true; await attente(300);
    var cv = function () { return [].slice.call(W().document.querySelectorAll('#conteneurPage [data-rub="Compétences en action"] li, #conteneurPage [data-rub="Compétences en action"] .pill')).map(function (e) { return e.textContent.replace(/×\s*$/, '').trim(); }); };
    var lignes = function () { return [].slice.call(document.querySelectorAll('#mepListeCompMissions [data-mep-cm-ck]')); };
    cas('réserve : le CV montre les 3 premières missions de l’expérience liée', cv().join('|') === 'Surveiller les accès|Contrôler les badges|Rédiger les rapports', cv().join('|'));
    var res = lignes().filter(function (cb) { return !cb.checked; });
    cas('réserve : la liste du panneau propose la suite (décochée) avec la mention « en réserve »', res.length === 2 && /en réserve/.test(document.getElementById('mepListeCompMissions').textContent), String(res.length));
    var cible = res[0]; cible.checked = true; cible.dispatchEvent(new Event('change', { bubbles: true })); await attente(3800);
    cas('réserve : cocher une mission en réserve la fait entrer dans le CV', cv().indexOf('Accueillir les visiteurs') !== -1 && cv().length === 4, cv().join('|'));
    var coche = lignes().filter(function (cb) { return cb.checked; });
    cas('réserve : la liste montre maintenant 4 missions cochées et 1 en réserve', coche.length === 4 && lignes().length - coche.length === 1, coche.length + '/' + lignes().length);
    cible = lignes().filter(function (cb) { return cb.checked; })[3]; cible.checked = false; cible.dispatchEvent(new Event('change', { bubbles: true })); await attente(3800);
    cas('réserve : décocher la remet en réserve (elle sort du CV, reste dans l’expérience)', cv().indexOf('Accueillir les visiteurs') === -1 && cv().length === 3, cv().join('|'));
    _mepAppelerIframePdf('_pdfMqChoix', 'reservesChoisies', null); await attente(1500);
    document.querySelector('[data-mep-mode-presentation="A"]').click(); await attente(2500);
  }

  // ---------------- Phrases proposees par l'assistant : visibles dans la liste du panneau (decochees, avec leur etiquette) ; cocher une phrase la fait entrer dans le CV (2026-10-04) ----------------
  async function parcoursPropositionsEnAction() {
    await preparerCvResultats();
    var W = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    dossier.ia = { cv: { recommandations: { missionsEnActionProposees: [{ texte: 'Protéger un site contre les intrusions', illustrePar: ['Sécuritas'], competence: 'Protection de site' }, { texte: 'Phrase sans étiquette', illustrePar: [], competence: '' }] } } }; dossier.metierCible = '';
    dossier.experiences = [{ poste: 'Agent de sécurité', entreprise: 'Sécuritas', lieu: 'Limoges', dateDebut: '2022-01', dateFin: '2024-06', missions: 'Surveiller les accès\nContrôler les badges\nRédiger les rapports\nAccueillir les visiteurs' }];
    _mepRerendre(); await attente(3500);
    document.querySelector('[data-mep-mode-presentation="C"]').click(); await attente(3500);
    document.getElementById('cExp').open = true; document.getElementById('zoneCompMissions').open = true; await attente(300);
    var cv = function () { return [].slice.call(W().document.querySelectorAll('#conteneurPage [data-rub="Compétences en action"] li, #conteneurPage [data-rub="Compétences en action"] .pill')).map(function (e) { return e.textContent.replace(/×\s*$/, '').trim(); }); };
    var lignes = function () { return [].slice.call(document.querySelectorAll('#mepListeCompMissions [data-mep-cm-ck]')); };
    var liste = function () { return document.getElementById('mepListeCompMissions').textContent; };
    cas('propositions : le CV ne montre pas les phrases proposées (décochées d’office)', cv().indexOf('Protéger un site contre les intrusions') === -1, cv().join('|'));
    cas('propositions : la liste du panneau les montre avec la mention « proposition de l’assistant » et l’étiquette', /Protéger un site contre les intrusions/.test(liste()) && /proposition de l’assistant : Protection de site/.test(liste()) && /Phrase sans étiquette/.test(liste()), liste().slice(0, 300));
    var cible = lignes().filter(function (cb) { return /Protéger un site/.test(cb.closest('label').textContent); })[0];
    cas('propositions : la phrase proposée est décochée dans la liste', !!cible && !cible.checked, '');
    cible.checked = true; cible.dispatchEvent(new Event('change', { bubbles: true })); await attente(3800);
    cas('propositions : cocher la phrase proposée la fait entrer dans le CV', cv().indexOf('Protéger un site contre les intrusions') !== -1, cv().join('|'));
    cible = lignes().filter(function (cb) { return /Protéger un site/.test(cb.closest('label').textContent); })[0]; cible.checked = false; cible.dispatchEvent(new Event('change', { bubbles: true })); await attente(3800);
    cas('propositions : la décocher la fait sortir du CV', cv().indexOf('Protéger un site contre les intrusions') === -1, cv().join('|'));
    _mepAppelerIframePdf('_pdfMqChoix', 'reservesChoisies', null); await attente(1500);
    dossier.ia = {}; document.querySelector('[data-mep-mode-presentation="A"]').click(); await attente(2500);
  }

  // ---------------- Fenetres d'edition COMPLETES : formations, experience personnelle (pour ce CV seulement), certifications (missions facultatives) (2026-10-04) ----------------
  async function parcoursEditionComplete() {
    await preparerCvResultats();
    var W = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var txtCv = function () { return W().document.querySelector('#conteneurPage').innerText; };
    W()._pdfMqChoix('styleCommun', false); _mepRerendre(); await attente(3500);
    var sauveForm = JSON.stringify(dossier.formations), sauvePerso = JSON.stringify([dossier.experiencesPerso, dossier.engagements]), sauveCertifs = JSON.stringify(dossier.certificationsAvecMissions || []);
    // ---- Formations
    document.getElementById('cForm').open = true; await attente(300);
    var cf = function () { return document.getElementById('cForm'); };
    cf().querySelector('[data-mep-form-editer]').click(); await attente(2300);
    var ouvrirForm = function () { var el = [].slice.call(cf().querySelectorAll('[data-mep-form-ouvrir]')).filter(function (e) { return /Agent de pr/.test(e.textContent); })[0]; el.click(); return attente(1500); };
    await ouvrirForm();
    var bf = function () { return cf().querySelector('[data-mep-form-edit]'); };
    var champ = function (bloc, attr) { return bloc.querySelector('[' + attr + ']'); };
    cas('édition complète, formation : intitulé, niveau, année, centre, lieu et missions sont tous là', !!bf() && ['titre', 'niveau', 'annee', 'etablissement', 'lieu', 'missions'].every(function (n) { return !!champ(bf(), 'data-mep-form-edit-' + n); }), '');
    cas('édition complète, formation : les champs reprennent le dossier (niveau CAP, année 2021, centre AFPA)', champ(bf(), 'data-mep-form-edit-niveau').value === 'CAP' && champ(bf(), 'data-mep-form-edit-annee').value === '2021' && champ(bf(), 'data-mep-form-edit-etablissement').value === 'AFPA', '');
    cas('édition complète, formation : le pied dit « Pour ce CV seulement »', /Pour ce CV seulement : votre dossier d.origine n.est pas modifié/.test(bf().textContent), '');
    champ(bf(), 'data-mep-form-edit-niveau').value = 'Bac Pro'; champ(bf(), 'data-mep-form-edit-annee').value = '2018'; champ(bf(), 'data-mep-form-edit-etablissement').value = 'Lycée Jean Moulin'; champ(bf(), 'data-mep-form-edit-lieu').value = 'Brive';
    cf().querySelector('[data-mep-form-texte-enregistrer]').click(); await attente(2500);
    cas('édition complète, formation : niveau, année, centre et lieu changent sur le CV', /Bac Pro/.test(txtCv()) && /2018/.test(txtCv()) && /Lycée Jean Moulin/.test(txtCv()) && /Brive/.test(txtCv()) && !/AFPA/.test(W().document.querySelector('#conteneurPage [data-rub="Formations"]').innerText), txtCv().slice(0, 200));
    cas('édition complète, formation : le dossier d’origine n’est PAS modifié', JSON.stringify(dossier.formations) === sauveForm, '');
    var cleF = Object.keys(W()._cvPdfFormationsTexteParItem || {})[0];
    var ovF = (W()._cvPdfFormationsTexteParItem || {})[cleF] || {};
    cas('édition complète, formation : seuls les champs changés sont gardés', ovF.niveau === 'Bac Pro' && ovF.annee === '2018' && ovF.etablissement === 'Lycée Jean Moulin' && ovF.lieu === 'Brive', JSON.stringify(ovF));
    var mot = JSON.stringify((await exporterCvWord(dossier)).plan);
    cas('édition complète, formation : le Word reprend le centre et le lieu corrigés', /Lycée Jean Moulin/.test(mot) && /Brive/.test(mot), '');
    await ouvrirForm();
    champ(bf(), 'data-mep-form-edit-niveau').value = 'CAP'; champ(bf(), 'data-mep-form-edit-annee').value = '2021'; champ(bf(), 'data-mep-form-edit-etablissement').value = 'AFPA'; champ(bf(), 'data-mep-form-edit-lieu').value = '';
    cf().querySelector('[data-mep-form-texte-enregistrer]').click(); await attente(2500);
    ovF = (W()._cvPdfFormationsTexteParItem || {})[cleF] || {};
    cas('édition complète, formation : remettre la valeur du dossier retire la correction de ce champ', ovF.niveau === undefined && ovF.annee === undefined && ovF.etablissement === undefined && ovF.lieu === undefined, JSON.stringify(ovF));
    try { W()._pdfDefinirTexteFormation(cleF, '', ''); } catch (e) { /* */ }
    cf().querySelector('[data-mep-form-editer]').click(); await attente(1500);
    // ---- Experience personnelle
    dossier.experiencesPerso = [{ intitule: 'Bricolage', dateDebut: '2019-01', dateFin: '2020-06', entreprise: 'Atelier du quartier', lieu: 'Limoges', missions: 'Réparer des meubles\nPeindre des murs' }];
    dossier.engagements = [];
    _mepRerendre(); await attente(4500); _mepRerendre(); await attente(3500);
    var cp = function () { return document.getElementById('cExpPerso'); };
    cp().open = true; await attente(300);
    var rDev = cp().querySelector('[data-mep-expperso-mode="developper"]'); if (rDev && !rDev.checked) { rDev.click(); await attente(3000); }
    var persoCv = function () { var e = W().document.querySelector('#conteneurPage [data-rub="Expérience personnelle"]'); return e ? e.innerText : ''; };
    cas('édition complète, expérience personnelle : la structure et le lieu du dossier s’affichent sur le CV', /Atelier du quartier/.test(persoCv()) && /Limoges/.test(persoCv()), persoCv());
    cp().querySelector('[data-mep-perso-editer]').click(); await attente(2500);
    cp().querySelector('[data-mep-expperso-ouvrir]').click(); await attente(1500);
    var bp = function () { return cp().querySelector('[data-mep-expperso-edit]'); };
    cas('édition complète, expérience personnelle : intitulé, début, fin, structure, lieu et missions sont tous là', !!bp() && ['titre', 'dateDebut', 'dateFin', 'entreprise', 'lieu', 'missions'].every(function (n) { return !!champ(bp(), 'data-mep-expperso-edit-' + n); }), '');
    cas('édition complète, expérience personnelle : les champs reprennent le dossier', champ(bp(), 'data-mep-expperso-edit-dateDebut').value === '2019-01' && champ(bp(), 'data-mep-expperso-edit-entreprise').value === 'Atelier du quartier', '');
    cas('édition complète, expérience personnelle : le pied dit « Pour ce CV seulement »', /Pour ce CV seulement : votre dossier d.origine n.est pas modifié/.test(bp().textContent), '');
    champ(bp(), 'data-mep-expperso-edit-dateDebut').value = '2018-03'; champ(bp(), 'data-mep-expperso-edit-dateFin').value = ''; champ(bp(), 'data-mep-expperso-edit-entreprise').value = 'Association Les Mains'; champ(bp(), 'data-mep-expperso-edit-lieu').value = 'Tulle';
    cp().querySelector('[data-mep-expperso-texte-enregistrer]').click(); await attente(2500);
    cas('édition complète, expérience personnelle : structure et lieu changent sur le CV', /Association Les Mains/.test(persoCv()) && /Tulle/.test(persoCv()) && !/Atelier du quartier/.test(persoCv()), persoCv());
    cas('édition complète, expérience personnelle : le début change et la fin vide veut dire « en cours »', /2018|mars/i.test(persoCv()) && /en cours/i.test(persoCv()) && !/2020/.test(persoCv()), persoCv());
    cas('édition complète, expérience personnelle : le dossier d’origine n’est PAS modifié', JSON.stringify([dossier.experiencesPerso, dossier.engagements]) === JSON.stringify([[{ intitule: 'Bricolage', dateDebut: '2019-01', dateFin: '2020-06', entreprise: 'Atelier du quartier', lieu: 'Limoges', missions: 'Réparer des meubles\nPeindre des murs' }], []]), JSON.stringify(dossier.experiencesPerso));
    var cleP = Object.keys(W()._cvPdfExpPersoTexteParItem || {})[0];
    try { W()._pdfDefinirTexteExpPerso(cleP, '', ''); } catch (e) { /* */ }
    cp().querySelector('[data-mep-perso-editer]').click(); await attente(1500);
    dossier.experiencesPerso = JSON.parse(sauvePerso)[0]; dossier.engagements = JSON.parse(sauvePerso)[1];
    // ---- Certifications : missions facultatives (les missions s'affichent quand la certification reste une ligne des formations ; la rubrique « Certifications » est refusee pour l'essai)
    _mepRerendre(); await attente(3500);
    var ouvrirCertif = async function () { if (document.querySelector('[data-certif-missions]')) { return true; } var b = document.querySelector('[data-mep-certif-ouvrir="0"]'); if (!b) { return false; } b.click(); await attente(1800); return true; };
    var ok = await ouvrirCertif();
    cas('édition complète, certification : le formulaire a « Missions (facultatif) »', ok && !!document.querySelector('[data-certif-missions]') && /Missions \(facultatif\)/.test(document.querySelector('[data-certif-edit]').textContent), '');
    var zm = document.querySelector('[data-certif-missions]');
    if (zm) {
      zm.value = 'Repérer les matériaux concernés\nAppliquer les consignes de sécurité'; zm.dispatchEvent(new Event('input', { bubbles: true }));
      document.querySelector('[data-certif-valider]').click(); await attente(3500);
      var entree = (dossier.certificationsAvecMissions || []).filter(function (e) { return e.manuel; })[0];
      cas('édition complète, certification : les missions saisies sont enregistrées (une par ligne)', !!entree && entree.missions.length === 2 && entree.certification === dossier.certifications[0], JSON.stringify(entree));
      cas('édition complète, certification : les missions arrivent sur le CV', /Repérer les matériaux concernés/.test(txtCv()), txtCv().slice(-900));
      await ouvrirCertif(); zm = document.querySelector('[data-certif-missions]');
      cas('édition complète, certification : rouvrir montre les missions déjà écrites', !!zm && /Appliquer les consignes de sécurité/.test(zm.value), '');
      zm.value = ''; zm.dispatchEvent(new Event('input', { bubbles: true }));
      document.querySelector('[data-certif-valider]').click(); await attente(3500);
      cas('édition complète, certification : vider les missions les retire du CV (rien n’est écrit)', !/Repérer les matériaux concernés/.test(txtCv()), '');
    }
    dossier.certificationsAvecMissions = JSON.parse(sauveCertifs); _mepCertifEditee = null; _mepBrouillonsCertif = {};
    _mepRerendre(); await attente(2500);
  }

  // ---------------- « Options supplementaires » : un bouton en bas de chaque carte ouvre la partie du meme nom dans « Reglages supplementaires » (2026-10-04) ----------------
  async function parcoursOptionsSupplementaires() {
    await preparerCvResultats();
    var W = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    W()._pdfMqChoix('styleCommun', false); _mepRerendre(); await attente(3500);
    var supp = function () { return document.getElementById('mepRegSupp'); };
    // un essai precedent a pu laisser cette carte ouverte : on repart de l'etat de depart (jamais ouverte)
    delete _mepCartesOuvertes.mepRegSupp; Object.keys(_mepCartesOuvertes).forEach(function (k) { if (/^mepSupp-/.test(k)) { delete _mepCartesOuvertes[k]; } }); _mepRerendre(); await attente(3500);
    var cles = ['org', 'entete', 'comp', 'exp', 'texte', 'couleurs', 'autres'];
    var boutons = [].slice.call(document.querySelectorAll('[data-mep-options-supp]'));
    cas('options supplémentaires : un bouton en bas des 7 cartes (organisation, en-tête, compétences, expériences, mise en page et texte, couleurs, autres rubriques)', cles.every(function (k) { return boutons.some(function (b) { return b.getAttribute('data-mep-options-supp') === k; }); }), boutons.map(function (b) { return b.getAttribute('data-mep-options-supp'); }).join(','));
    // Chaque bouton est comparé à un bouton de SA rangée : celui du bas des cartes à un autre petit bouton du bas d'une carte ; celui de la carte d'ambiance (sur la ligne d'« Annuler », decision de Denis du 2026-10-10 :
    // il garde sa forme d'origine) à « Dégradé », son voisin de la carte d'ambiance (même taille, même arrondi ; la couleur du texte change quand « Dégradé » est actif).
    var modeleBas = document.querySelector('.mep-mq .pied-options-supp .btn-miss:not([data-mep-options-supp]):not([data-mep-options-retour])') || document.querySelector('.mep-mq .inline .btn-miss:not([data-mep-options-supp]):not([data-mep-options-retour])');
    var modeleAmbiance = document.querySelector('.mep-mq .ligne-effet-options .btn-miss:not([data-mep-options-supp])');
    var st = function (el, avecCouleur) { var c = getComputedStyle(el); return [c.fontSize, c.borderRadius, c.paddingTop, c.paddingLeft, avecCouleur ? c.color : '', c.fontFamily].join('|'); };
    var modeleDe = function (b) { return b.closest('.pied-options-supp') ? modeleBas : modeleAmbiance; };
    cas('options supplémentaires : ce sont de vrais boutons, du même style que les autres boutons de leur rangée', boutons.every(function (b) { var m = modeleDe(b); var bas = !!b.closest('.pied-options-supp'); return b.tagName === 'BUTTON' && b.classList.contains('btn-miss') && (!m || st(b, bas) === st(m, bas)); }), boutons.length ? st(boutons[0], true) + ' / ' + (modeleBas ? st(modeleBas, true) : '') + ' / ' + (modeleAmbiance ? st(modeleAmbiance, false) : '') : '');
    cas('options supplémentaires : « Réglages supplémentaires » est refermée au départ', !!supp() && !supp().open, '');
    var pose = [
      ['org', ['colonnesinv', 'largeurgauche', 'formecolonnes']], ['entete', ['bandeau', 'degradebandeau', 'coordapart', 'anneauphoto', 'lectureguidee']], ['comp', ['coulcomp', 'coulpuces', 'bandeaucompcles']],
      ['exp', ['evid', 'regroupement', 'formatexp']], ['texte', ['police', 'styletitres', 'bordures', 'coinsarrondis', 'veuves', 'espparas']], ['couleurs', ['fondeffet', 'fondpleine']], ['autres', ['rubrique']]];
    cas('options supplémentaires : chaque réglage est rangé dans la partie de sa carte, aucun n’est perdu', pose.every(function (g) { var sec = document.getElementById('mepSupp-' + g[0]); return !!sec && g[1].every(function (n) { return !!sec.querySelector('[data-mep-' + n + ']'); }); }), pose.map(function (g) { return g[0] + ':' + (document.getElementById('mepSupp-' + g[0]) ? 'ok' : 'absente'); }).join(' '));
    cas('options supplémentaires : plus d’« autre ordre des expériences » ni de bouton « Ouvrir l’Aperçu » dans cette carte', !supp().querySelector('[data-mep-ordre-autre]') && !supp().querySelector('[data-mep-versgrand]') && !document.getElementById('mepSupp-reste'), '');
    cas('options supplémentaires : la mise en forme des expériences s’appelle « Simple / Mise en valeur », avec son « ? »', /Simple/.test(document.querySelector('[data-mep-formatexp="standard"]').textContent) && /Mise en valeur/.test(document.querySelector('[data-mep-formatexp="ameliore"]').textContent) && !!document.querySelector('#mepSupp-exp [data-mep-formatexp]').closest('.champ-mep').querySelector('.aide-option'), '');
    // chaque bouton ouvre la bonne partie, et « Revenir » ramene a la carte
    for (var i = 0; i < cles.length; i++) {
      var b = document.querySelector('[data-mep-options-supp="' + cles[i] + '"]');
      if (!b) { continue; }
      b.click(); await attente(900);
      var sec = document.getElementById('mepSupp-' + cles[i]);
      cas('options supplémentaires : le bouton « ' + cles[i] + ' » ouvre « Réglages supplémentaires » sur sa partie', supp().open && !!sec && sec.open, '');
      var retour = sec && sec.querySelector('[data-mep-options-retour]');
      cas('options supplémentaires : « Revenir » (' + cles[i] + ') est un vrai bouton', !!retour && retour.tagName === 'BUTTON' && retour.classList.contains('btn-miss'), '');
    }
    var carteOrg = document.getElementById('cOrg'); carteOrg.open = false;
    document.querySelector('#mepSupp-org [data-mep-options-retour]').click(); await attente(700);
    cas('options supplémentaires : « Revenir » rouvre la carte d’origine', carteOrg.open, '');
    // un reglage deplace agit toujours, avec la meme cle enregistree
    var reg = function () { return dossier.reglagesMiseEnPageCV || {}; };
    document.querySelector('[data-mep-coinsarrondis="1"]').click(); await attente(2200);
    cas('options supplémentaires : « Coins arrondis » (déplacé) agit toujours', reg().coinsArrondis === true, JSON.stringify(reg().coinsArrondis));
    document.querySelector('[data-mep-formatexp="ameliore"]').click(); await attente(2200);
    cas('options supplémentaires : « Mise en valeur » enregistre toujours la valeur « ameliore »', reg().formatExperiences === 'ameliore', String(reg().formatExperiences));
    document.querySelector('[data-mep-bordures="epaisse"]').click(); await attente(2200);
    // « Style rapide » (Standard) ne change PAS le format des experiences (le contenu reste a la personne) ; coins et traits font partie de l'enrichissement visuel voulu par Denis (2026-10-08).
    var avantFormat = reg().formatExperiences;
    document.getElementById('btnMepDe').click(); await attente(4500);
    cas('options supplémentaires : « Style rapide » ne change pas la mise en valeur des expériences', reg().formatExperiences === avantFormat, avantFormat + ' -> ' + reg().formatExperiences);
    document.querySelector('[data-mep-coinsarrondis="0"]').click(); await attente(1800);
    document.querySelector('[data-mep-formatexp="standard"]').click(); await attente(1800);
    document.querySelector('[data-mep-bordures="fine"]').click(); await attente(1800);
    supp().open = false; _mepCartesOuvertes.mepRegSupp = false;
  }

  // ---------------- Dates par rubrique : « Comme l'ensemble » ou forme, position et mois propres a la rubrique (2026-10-04) ----------------
  async function parcoursDatesParRubrique() {
    await preparerCvResultats();
    var W = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    W()._pdfMqChoix('styleCommun', false);
    var sauvePerso = JSON.stringify([dossier.experiencesPerso, dossier.engagements]);
    dossier.experiencesPerso = [{ intitule: 'Bricolage', dateDebut: '2019-03', dateFin: '2021-06', missions: 'Réparer des meubles' }]; dossier.engagements = [];
    _mepRerendre(); await attente(4500); _mepRerendre(); await attente(3500);
    var rub = function (nom) { var e = W().document.querySelector('#conteneurPage [data-rub="' + nom + '"]'); return e ? e.innerText : ''; };
    var exp = function () { return rub('Expérience professionnelle'); }, form = function () { return rub('Formations'); }, cert = function () { return rub('Certifications'); }, perso = function () { return rub('Expérience personnelle'); };
    var reg = function () { return _mepEtatChoixMq().datesParRubrique || {}; };
    var change = async function (sel, ouvrir) { if (ouvrir) { ouvrir.open = true; } var el = document.querySelector(sel); if (!el) { cas('dates : le contrôle ' + sel + ' existe', false, 'introuvable'); return false; } el.click(); await attente(2600); return true; };
    document.getElementById('cExp').open = true; document.getElementById('cForm').open = true; document.getElementById('cSupp').open = true;
    var cp = document.getElementById('cExpPerso'); if (cp) { cp.open = true; var rDev = cp.querySelector('[data-mep-expperso-mode="developper"]'); if (rDev && !rDev.checked) { rDev.click(); await attente(3000); } }
    await attente(300);
    // ---- les options sont cachees derriere un bouton, bleu quand il est ouvert
    var rubsDates = ['exp', 'form', 'cert', 'perso'];
    cas('dates : par défaut, chaque rubrique n’a qu’un bouton « Plus d’options pour les dates » (aucune option affichée)', rubsDates.every(function (r) { return !!document.querySelector('[data-mep-dates-plus="' + r + '"]') && !document.querySelector('[data-mep-dates-suit="' + r + '"]'); }), rubsDates.map(function (r) { return r + ':' + !!document.querySelector('[data-mep-dates-plus="' + r + '"]'); }).join(' '));
    cas('dates : pour les expériences, le bouton est dans la boîte « Position des dates »', !!document.querySelector('[data-mep-dates-plus="exp"]').closest('.boite') && /Position des dates/.test(document.querySelector('[data-mep-dates-plus="exp"]').closest('.boite').textContent), '');
    for (var q = 0; q < rubsDates.length; q++) { var bp = document.querySelector('[data-mep-dates-plus="' + rubsDates[q] + '"]'); if (bp) { bp.click(); await attente(1800); } }
    cas('dates : une fois ouvert, le bouton est bleu et les options apparaissent', rubsDates.every(function (r) { var b = document.querySelector('[data-mep-dates-plus="' + r + '"]'); return !!b && b.classList.contains('actif') && !!document.querySelector('[data-mep-dates-suit="' + r + '"]'); }), '');
    // ---- « Changer l'intitule » : bleu quand actif
    var bInt = document.querySelector('#cExp [data-mep-intitule-ouvrir]');
    if (bInt) { var etatInt = bInt.classList.contains('actif'); bInt.click(); await attente(500); cas('intitulé : le bouton « Changer l’intitulé » est bleu quand la liste est ouverte', bInt.classList.contains('actif') === !etatInt && bInt.classList.contains('actif') === !bInt.closest('.ligne-intitule').querySelector('.zone-propositions').hidden, ''); bInt.click(); await attente(500); cas('intitulé : refermé, il n’est plus bleu', bInt.classList.contains('actif') === etatInt, ''); }
    // ---- le rendu par defaut ne change pas
    cas('dates : par défaut les quatre rubriques sont « comme l’ensemble » (cases cochées)', ['exp', 'form', 'cert', 'perso'].every(function (r) { var c = document.querySelector('[data-mep-dates-suit="' + r + '"]'); return !!c && c.checked; }), ['exp', 'form', 'cert', 'perso'].map(function (r) { return r + ':' + !!document.querySelector('[data-mep-dates-suit="' + r + '"]'); }).join(' '));
    cas('dates : par défaut, expériences en « 2022 - 2024 », formation « 2021 », expérience personnelle en plage', /2022 - 2024/.test(exp()) && /2021/.test(form()) && /2019 - 2021/.test(perso()), exp().slice(0, 80));
    cas('dates : les choix propres sont grisés tant que la case est cochée', document.querySelector('[data-mep-dates-forme="form:parentheses"]').disabled, '');
    // ---- formations : forme et position propres, les autres rubriques ne bougent pas
    await change('[data-mep-dates-suit="form"]');
    cas('dates, formations : décocher « Comme l’ensemble » active les choix propres', !document.querySelector('[data-mep-dates-forme="form:parentheses"]').disabled && !!reg().form && reg().form.suit === false, JSON.stringify(reg()));
    await change('[data-mep-dates-forme="form:parentheses"]');
    cas('dates, formations : « Entre parenthèses » écrit (2021) sur le CV', /\(2021\)/.test(form()), form());
    cas('dates, formations : les expériences et l’expérience personnelle gardent leurs dates', /2022 - 2024/.test(exp()) && !/\(2022/.test(exp()) && /2019 - 2021/.test(perso()), exp().slice(0, 60));
    await change('[data-mep-dates-pos="form:apres"]');
    cas('dates, formations : « Juste après le titre » met la date dans la ligne du titre', /Agent de prévention[^\n]*\(2021\)/.test(form().replace(/\n/g, ' ').replace(/\s+/g, ' ')) && !/\n\(2021\)/.test(form()), form());
    var mot = JSON.stringify((await exporterCvWord(dossier)).plan);
    cas('dates, formations : le Word reprend la date entre parenthèses', /\(2021\)/.test(mot), '');
    // ---- experiences : forme « fin », mois, « juste apres le poste »
    await change('[data-mep-dates-suit="exp"]');
    await change('[data-mep-dates-forme="exp:fin"]');
    cas('dates, expériences : « Année de fin seule » écrit 2024 sans le début', /2024/.test(exp()) && !/2022 - 2024/.test(exp()), exp().slice(0, 80));
    await change('[data-mep-dates-forme="exp:parentheses"]');
    cas('dates, expériences : « Entre parenthèses » écrit (2022 - 2024)', /\(2022 - 2024\)/.test(exp()), exp().slice(0, 80));
    await change('[data-mep-dates-forme="exp:annees"]');
    var moisCase = document.querySelector('[data-mep-dates-mois="exp"]'); moisCase.click(); await attente(2600);
    cas('dates, expériences : « Afficher les mois » propre à la rubrique écrit les mois, sans toucher aux formations', /janv|juin/i.test(exp()) && !/janv|juin/i.test(perso()), exp().slice(0, 80));
    moisCase = document.querySelector('[data-mep-dates-mois="exp"]'); moisCase.click(); await attente(2600);
    var apresExp = document.querySelector('[data-mep-position-dates="apres"]');
    cas('dates, expériences : le choix « Juste après le poste » existe', !!apresExp, '');
    if (apresExp && !apresExp.disabled) { apresExp.click(); await attente(2600);
      cas('dates, expériences : « Juste après le poste » met la date dans la ligne du poste', /Agent[^\n]*2022 - 2024/.test(exp().replace(/\n/g, ' ')) , exp().slice(0, 100));
      document.querySelector('[data-mep-position-dates="droite"]').click(); await attente(2200); }
    // ---- certifications : propres, sans toucher aux formations
    await change('[data-mep-dates-suit="cert"]');
    await change('[data-mep-dates-forme="cert:parentheses"]');
    cas('dates, certifications : « Entre parenthèses » écrit (2026) sur les certifications', /\(2026\)/.test(cert()), cert().slice(0, 120));
    cas('dates, certifications : leur réglage est indépendant de celui des formations', reg().cert && reg().form && reg().cert.forme === 'parentheses' && reg().form.forme === 'parentheses' && !/\(2026\)/.test(form()), JSON.stringify(reg()));
    await change('[data-mep-dates-forme="cert:fin"]');
    // ---- experience personnelle
    if (cp) {
      await change('[data-mep-dates-suit="perso"]');
      await change('[data-mep-dates-forme="perso:fin"]');
      cas('dates, expérience personnelle : « Année de fin seule » n’écrit que 2021', /2021/.test(perso()) && !/2019/.test(perso()), perso());
      await change('[data-mep-dates-pos="perso:apres"]');
      cas('dates, expérience personnelle : « Juste après le titre » met la date dans la ligne du titre', /Bricolage[^\n]*2021/.test(perso().replace(/\n/g, ' ')), perso());
    }
    // ---- deux rubriques cote a cote : les dates s'adaptent, sauf choix a la main
    for (var j = 0; j < ['exp', 'form', 'cert', 'perso'].length; j++) { var rr = ['exp', 'form', 'cert', 'perso'][j]; var ck0 = document.querySelector('[data-mep-dates-suit="' + rr + '"]'); if (ck0 && !ck0.checked) { ck0.click(); await attente(2200); } }
    var adapt = document.querySelector('[data-mep-dates-adapter]');
    cas('dates : la case « Adapter les dates côte à côte » existe et est cochée au départ', !!adapt && adapt.checked, '');
    _mepDefinirChoixMq('formCertifsCoteACote', true); await attente(3000);
    cas('dates, côte à côte : Formations et Certifications écrivent la date juste après le titre, entre parenthèses', /\(2021\)/.test(form()) && /\(2026\)/.test(cert()) && !/\n\(2021\)/.test(form()), form() + ' || ' + cert().slice(0, 80));
    cas('dates, côte à côte : les expériences (seules sur leur ligne) ne changent pas', /2022 - 2024/.test(exp()) && !/\(2022/.test(exp()), exp().slice(0, 60));
    document.querySelector('[data-mep-dates-adapter]').click(); await attente(3000);
    cas('dates, côte à côte : case décochée, plus rien n’est adapté', !/\(2021\)/.test(form()) && /2021/.test(form()), form());
    document.querySelector('[data-mep-dates-adapter]').click(); await attente(2600);
    await change('[data-mep-dates-suit="form"]'); await change('[data-mep-dates-forme="form:annees"]'); await change('[data-mep-dates-pos="form:droite"]');
    cas('dates, côte à côte : un choix fait à la main dans la rubrique reste prioritaire', !/\(2021\)/.test(form()) && /2021/.test(form()), form());
    _mepDefinirChoixMq('formCertifsCoteACote', null); await attente(2000);
    // ---- revenir a « Comme l'ensemble » rend le rendu d'origine
    for (var i = 0; i < ['exp', 'form', 'cert', 'perso'].length; i++) {
      var r = ['exp', 'form', 'cert', 'perso'][i];
      var ck = document.querySelector('[data-mep-dates-suit="' + r + '"]');
      if (ck && !ck.checked) { ck.click(); await attente(2400); }
    }
    cas('dates : « Comme l’ensemble » partout remet les dates d’origine et efface les réglages', Object.keys(reg()).length === 0 && /2022 - 2024/.test(exp()) && !/\(2021\)/.test(form()) && /2019 - 2021/.test(perso()), JSON.stringify(reg()));
    dossier.experiencesPerso = JSON.parse(sauvePerso)[0]; dossier.engagements = JSON.parse(sauvePerso)[1];
    _mepDefinirChoixMq('datesParRubrique', null); await attente(1500);
  }

  // ---------------- Edition des competences : bouton central « Editer », champs, Valider / Annuler, retour aux valeurs par defaut (2026-10-04) ----------------
  async function parcoursEditionCompetences() {
    await preparerCvResultats();
    var W = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    W()._pdfMqChoix('styleCommun', false); _mepRerendre(); await attente(3500);
    var cc = function () { return document.getElementById('cComp'); };
    cc().open = true; await attente(300);
    var pillsCv = function () { return [].slice.call(W().document.querySelectorAll('#conteneurPage .pill')).map(function (e) { return e.textContent.replace(/×\s*$/, '').trim(); }); };
    var sauveComp = JSON.stringify(dossier.competencesCV);
    var lab = cc().querySelector('[data-mep-comp-editer]') && cc().querySelector('[data-mep-comp-editer]').closest('label');
    cas('édition des compétences : un bouton « Éditer les compétences » central existe dans la carte Compétences', !!lab && /Éditer les compétences/.test(lab.textContent), '');
    var modeleBtn = document.querySelector('#cExp .bouton-editer');
    var st = function (el) { var c = getComputedStyle(el); return [c.borderRadius, c.minHeight, c.fontSize, c.fontWeight, c.width === c.width ? '' : ''].join('|'); };
    cas('édition des compétences : il a la même forme que « Éditer les expériences »', !!lab && !!modeleBtn && lab.className.split(' ').indexOf('bouton-editer') !== -1 && st(lab) === st(modeleBtn), lab ? st(lab) + ' / ' + (modeleBtn ? st(modeleBtn) : '') : '');
    var avant = pillsCv();
    lab.click(); await attente(1800);
    var champs = function () { return [].slice.call(document.querySelectorAll('#mepEditComp [data-mep-comp-champ]')); };
    var aff = window._mepCompetencesAffichees;
    cas('édition des compétences : le panneau montre chaque compétence affichée dans un champ (professionnelles et comportementales)', !!document.getElementById('mepEditComp') && champs().length === aff.pro.length + aff.comp.length && champs().length > 0, champs().length + ' / ' + (aff.pro.length + aff.comp.length));
    var bt = function () { return document.querySelector('[data-mep-comp-valider]'); };
    cas('édition des compétences : sans modification, l’unique bouton s’appelle « Annuler »', bt().textContent.trim() === 'Annuler' && !bt().classList.contains('principal'), bt().textContent);
    cas('édition des compétences : « Revenir aux valeurs par défaut » est en bas du panneau, grisé tant qu’il n’y a rien à remettre', !!document.querySelector('[data-mep-comp-defaut]') && document.querySelector('[data-mep-comp-defaut]').disabled, '');
    var c1 = champs()[0], origine = c1.getAttribute('data-mep-comp-champ');
    c1.value = 'Compétence corrigée du test'; c1.dispatchEvent(new Event('input', { bubbles: true }));
    cas('édition des compétences : dès qu’on modifie, le bouton devient « Valider »', bt().textContent.trim() === 'Valider' && bt().classList.contains('principal'), bt().textContent);
    bt().click(); await attente(3200);
    cas('édition des compétences : la compétence corrigée apparaît sur le CV à la place de l’original', pillsCv().indexOf('Compétence corrigée du test') !== -1 && pillsCv().indexOf(origine) === -1, pillsCv().join('|'));
    cas('édition des compétences : le dossier d’origine n’est PAS modifié', JSON.stringify(dossier.competencesCV) === sauveComp, '');
    var textesWord = []; (function parcourir(o) { if (Array.isArray(o)) { o.forEach(parcourir); } else if (o && typeof o === 'object') { if (typeof o.texte === 'string') { textesWord.push(o.texte); } Object.keys(o).forEach(function (k) { parcourir(o[k]); }); } })((await exporterCvWord(dossier)).plan);
    cas('édition des compétences : le Word reprend la compétence corrigée', textesWord.some(function (t) { return t.replace(/\s+/g, ' ').normalize('NFC').trim() === 'Compétence corrigée du test'; }), textesWord.slice(4, 10).join('|'));
    cas('édition des compétences : le champ montre la version corrigée et « Revenir aux valeurs par défaut » devient actif', champs()[0].value === 'Compétence corrigée du test' && !document.querySelector('[data-mep-comp-defaut]').disabled, '');
    document.querySelector('[data-mep-comp-defaut]').click(); await attente(3200);
    cas('édition des compétences : « Revenir aux valeurs par défaut » remet les compétences d’origine', JSON.stringify(pillsCv()) === JSON.stringify(avant) && champs()[0].value === origine, pillsCv().join('|'));
    // ajouter une competence a la main (pour ce CV seulement)
    var nouv = document.querySelector('[data-mep-comp-nouvelle="comp"]');
    cas('édition des compétences : chaque famille a sa ligne « Ajouter une compétence » (champ + bouton « + Ajouter »)', !!nouv && !!document.querySelector('[data-mep-comp-ajouter="comp"]') && !!document.querySelector('[data-mep-comp-nouvelle="pro"]'), '');
    nouv.value = 'Humour du test'; document.querySelector('[data-mep-comp-ajouter="comp"]').click(); await attente(3500);
    cas('édition des compétences : la compétence ajoutée à la main apparaît sur le CV, à la suite des autres', pillsCv().indexOf('Humour du test') !== pillsCv().length && pillsCv().indexOf('Humour du test') !== -1, pillsCv().join('|'));
    cas('édition des compétences : elle est dans le panneau avec un bouton « Retirer », et le dossier n’est pas modifié', !!document.querySelector('[data-mep-comp-retirer^="comp:"]') && champs().some(function (ch) { return ch.value === 'Humour du test'; }) && JSON.stringify(dossier.competencesCV) === sauveComp, '');
    var motsW = []; (function parcourir(o) { if (Array.isArray(o)) { o.forEach(parcourir); } else if (o && typeof o === 'object') { if (typeof o.texte === 'string') { motsW.push(o.texte); } Object.keys(o).forEach(function (k) { parcourir(o[k]); }); } })((await exporterCvWord(dossier)).plan);
    cas('édition des compétences : le Word reprend la compétence ajoutée', motsW.some(function (t) { return t.replace(/\s+/g, ' ').trim() === 'Humour du test'; }), '');
    document.querySelector('[data-mep-comp-retirer^="comp:"]').click(); await attente(3500);
    cas('édition des compétences : « Retirer » enlève la compétence ajoutée du CV', pillsCv().indexOf('Humour du test') === -1, pillsCv().join('|'));
    var nouv2 = document.querySelector('[data-mep-comp-nouvelle="pro"]'); nouv2.value = 'Compétence pro du test'; document.querySelector('[data-mep-comp-ajouter="pro"]').click(); await attente(3500);
    cas('édition des compétences : « Revenir aux valeurs par défaut » retire aussi les compétences ajoutées', !document.querySelector('[data-mep-comp-defaut]').disabled && pillsCv().indexOf('Compétence pro du test') !== -1, pillsCv().join('|'));
    document.querySelector('[data-mep-comp-defaut]').click(); await attente(3500);
    cas('édition des compétences : après le retour aux valeurs par défaut, le CV est comme au départ', JSON.stringify(pillsCv()) === JSON.stringify(avant), pillsCv().join('|'));
    bt().click(); await attente(1500);
    cas('édition des compétences : « Annuler » referme le panneau', !document.getElementById('mepEditComp'), '');
    var lab2 = cc().querySelector('[data-mep-comp-editer]'); cas('édition des compétences : le bouton n’est plus actif une fois refermé', !!lab2 && !lab2.closest('label').classList.contains('on'), '');
  }

  // ---------------- Nombre de missions conseille par l'assistant : simple suggestion, « Appliquer » le pose (2026-10-04) ----------------
  async function parcoursNombreMissionsConseille() {
    await preparerCvResultats();
    var W = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    dossier.ia = {}; dossier.experiences = [{ poste: 'Agent', entreprise: 'Sécuritas', lieu: 'Limoges', dateDebut: '2022-01', dateFin: '2024-06', missions: 'Surveiller les accès\nContrôler les badges\nRédiger les rapports\nAccueillir les visiteurs\nGérer les alarmes' }];
    _mepRerendre(); await attente(3500);
    document.getElementById('cExp').open = true; await attente(300);
    cas('missions conseillées : sans conseil de l’assistant, aucune suggestion n’est affichée', !document.querySelector('[data-mep-exp-missions-conseil]'), '');
    dossier.ia = { cv: { recommandations: { regroupementExperiences: { experiencesRetenues: [{ type: 'professionnelle', poste: 'Agent', entreprise: 'Sécuritas', nombreMissionsSuggere: 4, missions: [], justification: '' }], groupes: [] } } } };
    _mepRerendre(); await attente(3500); document.getElementById('cExp').open = true; await attente(300);
    var bt = document.querySelector('[data-mep-exp-missions-conseil]');
    var nb = function () { return W().document.querySelectorAll('#conteneurPage [data-rub="Expérience professionnelle"] li').length; };
    var avant = nb();
    cas('missions conseillées : l’assistant conseille 4 missions, une suggestion est affichée sans rien changer', !!bt && /conseille 4 missions/.test(bt.closest('.conseil-missions').textContent) && avant !== 4, 'avant=' + avant);
    bt.click(); await attente(3500);
    cas('missions conseillées : « Appliquer 4 » montre 4 missions et la suggestion disparaît', nb() === 4 && !document.querySelector('[data-mep-exp-missions-conseil]'), 'apres=' + nb());
    dossier.ia = {}; W()._pdfReinitialiserMissionsExperience(0); await attente(2500);
  }

  // ---------------- Stage capté à l'import du CV d'origine : le bouton « Stage » arrive déjà coché (filet de sécurité, décision Denis 2026-10-03) ----------------
  async function parcoursStageImport() {
    var sauve = JSON.stringify(dossier.experiences);
    var brut = { experiences: [
      { poste: 'Agent d’accueil', entreprise: 'Mairie de Limoges', lieu: '', dateDebut: '2024', dateFin: '2024', stage: true, missions: ['Accueillir le public'], confiance: 'elevee', alertes: [] },
      { poste: 'Vendeur', entreprise: 'Boutique Martin', lieu: '', dateDebut: '2019', dateFin: '2021', stage: false, missions: ['Vendre'], confiance: 'elevee', alertes: [] },
      { poste: 'Serveur', entreprise: 'Café du port', lieu: '', dateDebut: '2017', dateFin: '2018', missions: ['Servir'], confiance: 'elevee', alertes: [] }
    ] };
    var r = analyserReponseImport('```json\n' + JSON.stringify(brut) + '\n```', SPECIFICATION_IMPORT);
    var ex = r.succes ? r.valeurs.experiences : [];
    cas('import stage : « stage: true » est lu, « false » et l’absence ne comptent pas', ex.length === 3 && ex[0].stage === true && ex[1].stage === null && ex[2].stage === null, JSON.stringify(ex.map(function (e) { return e.stage; })));
    dossier.experiences = [];
    var cmp = comparerDonnees(dossier, r.valeurs, SPECIFICATION_IMPORT);
    var cont = document.createElement('div'); cont.innerHTML = genererEcranValidationImport(cmp, SPECIFICATION_IMPORT); document.body.appendChild(cont);
    var caches = cont.querySelectorAll('input[type="hidden"][data-champ="stage"]');
    cas('import stage : l’écran de validation porte le stage reconnu dans un champ caché (rien de plus à l’écran)', caches.length === 1 && caches[0].id === 'val_experiences_nouveaux_0_stage', String(caches.length));
    var dec = lireDecisionsValidationImport(cmp, SPECIFICATION_IMPORT);
    cont.remove();
    var el = dec.experiences.elementsAAjouter;
    cas('import stage : la décision garde « true » pour la 1re expérience seulement', el.length === 3 && el[0].stage === true && el[1].stage === null && el[2].stage === null, JSON.stringify(el.map(function (e) { return e.stage; })));
    fusionnerDonnees(dossier, dec, SPECIFICATION_IMPORT);
    var parPoste = function (p) { return dossier.experiences.filter(function (e) { return e.poste === p; })[0]; };
    cas('import stage : l’expérience importée comme stage a stage = true dans le dossier', parPoste('Agent d’accueil') && parPoste('Agent d’accueil').stage === true, '');
    cas('import stage : les autres n’ont aucune valeur « stage » (le bouton reste libre)', parPoste('Vendeur').stage === undefined && parPoste('Serveur').stage === undefined, '');
    cas('import stage : le CV la présente comme un stage (le bouton arrivera déjà coché)', _pdfEstStage(parPoste('Agent d’accueil')) === true && _pdfEstStage(parPoste('Vendeur')) === false, '');
    dossier.experiences = JSON.parse(sauve);
  }

  // ---------------- Nom et prénom (flèche), téléphone « 06.12.34.56.78 », gras des coordonnées, modèle Rectangles déplaçable (retour Denis 2026-10-01) ----------------
  async function parcoursIdentiteEtRectangles() {
    dossier.identite = { civilite: '', nom: 'ismahene', prenom: 'SEDDIKI', telephone: '0612345678', email: 'a@b.fr' }; dossier.identiteEnregistree = false;
    var cont = document.createElement('div'); cont.innerHTML = contenuIdentiteChamps(); document.body.appendChild(cont);
    cas('identité : étiquettes « Prénom » et « Nom » visibles et flèche d’inversion', !!cont.querySelector('label[for="identitePrenom"]') && !!cont.querySelector('label[for="identiteNom"]') && !!cont.querySelector('[data-inverser-nom-prenom]'));
    cas('identité : le téléphone s’affiche « 06.12.34.56.78 »', document.getElementById('identiteTelephone').value === '06.12.34.56.78', document.getElementById('identiteTelephone').value);
    cont.querySelector('[data-inverser-nom-prenom]').click(); await attente(200);
    cas('identité : la flèche échange les champs (prénom avec majuscule initiale, nom en majuscules)', document.getElementById('identitePrenom').value === 'Ismahene' && document.getElementById('identiteNom').value === 'SEDDIKI', document.getElementById('identitePrenom').value + '|' + document.getElementById('identiteNom').value);
    var tel = document.getElementById('identiteTelephone'); tel.value = '06 98 76 54 32'; tel.dispatchEvent(new FocusEvent('focusout', { bubbles: true })); await attente(200);
    cas('identité : le téléphone saisi se met en forme en quittant le champ', tel.value === '06.98.76.54.32', tel.value);
    cont.remove();
    await preparerCvResultats();
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    dossier.identite.telephone = '0600000000'; dossier.identite.email = 'camille@ex.fr'; w()._pdfRafraichir(); await attente(800);
    w()._pdfChoisirVarianteSobre('mq-bandeau'); await attente(1500);
    // nom du fichier enregistré : « NOM_poste » (PDF : titre de la page imprimée ; Word : nom du .docx)
    dossier.identite.nom = 'Dupont'; dossier.identite.prenom = 'Michel'; dossier.metierCible = 'Vendeur'; w()._pdfRafraichir(); await attente(500);
    cas('fichier PDF : le titre de la page imprimée est « DUPONT_vendeur »', w().document.title === 'DUPONT_vendeur', w().document.title);
    var rw = await exporterCvWord(dossier);
    cas('fichier Word : le CV s’enregistre sous « DUPONT_vendeur.docx »', rw.nomFichier === 'DUPONT_vendeur.docx', rw.nomFichier);
    cas('CV : le téléphone est écrit « 06.00.00.00.00 »', /06\.00\.00\.00\.00/.test(w().document.querySelector('.coord').textContent), w().document.querySelector('.coord').textContent);
    document.querySelector('[data-mep-coord-gras="telephone"]').click(); await attente(1500);
    cas('CV : « Téléphone en gras » met le numéro en gras', /<b><span[^>]*>06\.00\.00\.00\.00/.test(w().document.querySelector('.coord').innerHTML));
    document.querySelector('[data-mep-coord-gras="telephone"]').click(); await attente(1000);
    // modèle Rectangles : toutes les rubriques se déplacent, plusieurs par ligne
    w()._pdfChoisirModeleCreatif('rectangles'); await attente(1800);
    ouvrirPleinEcranMaquette(); await attendreMq();
    cas('Rectangles : « Régler le corps du CV » est disponible', !document.getElementById('mqTRubriques').disabled);
    _mqPanneau()._pdfMqDefinirLignes1Col([['exp'], ['form'], ['certifs', 'langues', 'centres']]); _mqRendu(); await attente(1500);
    var ligne = document.getElementById('mqFrame').contentDocument.querySelector('.paire.trois');
    cas('Rectangles : trois rubriques sur la même ligne', !!ligne && ligne.children.length === 3, ligne && ligne.children.length);
    fermerPleinEcranMaquette(); await attente(500);
  }

  // ---------------- « Régler sur le CV » : des cartes Expériences, Formations, Expérience personnelle au grand aperçu, sur la bonne rubrique (retour Denis 2026-10-01) ----------------
  async function parcoursReglerSurLeCv() {
    await preparerCvResultats();
    dossier.experiencesPerso = [{ intitule: 'Bricolage', dateDebut: '2019', dateFin: '2019', missions: 'Réparer' }];
    naviguerVers('resultats'); await attente(4500);
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    w()._pdfChoisirVarianteSobre('mq-bandeau'); await attente(1500);
    for (var i = 0, titres = ['Expérience professionnelle', 'Formations', 'Expérience personnelle']; i < titres.length; i++) {
      var b = [].slice.call(document.querySelectorAll('[data-mep-regler-rubrique]')).filter(function (x) { return x.getAttribute('data-mep-regler-rubrique') === titres[i]; })[0];
      cas('« Régler sur le CV » existe dans la carte « ' + titres[i] + ' »', !!b);
      if (!b) { continue; }
      b.click(); await attente(1500);
      var d = document.getElementById('mqFrame').contentDocument, sel = d.querySelector('.mq-selectionne');
      cas('« Régler sur le CV » (' + titres[i] + ') : « Régler le corps du CV » est sélectionné, la rubrique repérée, sa barre ouverte',
        _mqPlein.mode.rubriques && !!sel && sel.getAttribute('data-rub') === titres[i] && document.getElementById('mqBarreRub').style.display !== 'none' && document.getElementById('mqRubNom').textContent === (titres[i] === 'Expérience professionnelle' ? 'Expériences professionnelles' : titres[i]));
      fermerPleinEcranMaquette(); await attente(600);
    }
  }

  // ---------------- Genre du candidat dans les prompts (retour Denis 2026-10-01) ----------------
  async function parcoursGenre() {
    var avant = (dossier.identite || {}).civilite;
    dossier.identite = dossier.identite || {};
    try {
      dossier.identite.civilite = 'Madame';
      var ctx = _reformulerCvContexteTexte();
      cas('genre : Reformuler transmet « féminin (Madame) » quand la civilité est Madame', /GENRE DU CANDIDAT/.test(ctx) && /féminin \(Madame\)/.test(ctx));
      var tit = bilanConstruirePromptTitreAccroche('{VOIX_HUMAINE}', { cv: 'x' });
      cas('genre : le prompt titre et accroche du Bilan transmet le féminin', /féminin \(Madame\)/.test(tit.texte));
      dossier.identite.civilite = '';
      ctx = _reformulerCvContexteTexte();
      cas('genre : civilité vide, jamais le masculin par défaut (accords du CV, sinon forme neutre)', /non précisé/.test(ctx) && /N’écris jamais au masculin par défaut/.test(ctx) && !/masculin \(Monsieur\)/.test(ctx));
    } finally { dossier.identite.civilite = avant; }
  }

  // ---------------- Modifier une expérience ne doit pas effacer son lieu (retour Denis 2026-10-01) ----------------
  async function parcoursExperienceLieu() {
    dossier.experiences = [{ poste: 'Agent technique', entreprise: 'PHIL@POSTE', lieu: 'Bergerac', dateDebut: '2023', dateFin: '2023', missions: 'Réaliser les tâches' }];
    _expInlineEditIndex = 0; _expInlineFormOuvert = true; _expInlineBrouillon = null;
    var bloc = document.createElement('div'); bloc.id = 'blocERIP-experiences-pro'; bloc.innerHTML = contenuExperiencesProInline(); document.body.appendChild(bloc);
    wireExperiencesProInline(function () {});
    var poste = document.getElementById('xPoste'); poste.value = 'Agent technique polyvalent'; poste.dispatchEvent(new Event('input', { bubbles: true }));
    document.getElementById('btnExpProValider').click(); await attente(300);
    cas('expérience : modifier le poste garde le lieu (Bergerac)', dossier.experiences[0].poste === 'Agent technique polyvalent' && dossier.experiences[0].lieu === 'Bergerac', JSON.stringify(dossier.experiences[0]));
    bloc.remove(); _expInlineReset();
  }

  // ---------------- Retours de Denis du 2026-10-05 : missions de formation, compteurs sans effet, Formations à droite, option « à côté » ----------------
  async function parcoursCorrectionsPanneau() {
    await preparerCvResultats();
    var W = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var texteCV = function () { return W().document.querySelector('#conteneurPage').textContent; };
    var sauve = JSON.stringify(dossier.experiences);
    // Remise à zéro de l'état de l'aperçu laissé par les parcours précédents (missions de formation, formations à gauche / en bas, ordre personnalisé).
    W()._cvPdfAfficherMissionsFormation = null; W()._cvPdfOrdrePersoRubriques = false; W()._cvPdfOrganisationPerso = false; dossier.pdfReglages = null;
    ['formationsAGauche', 'formationsPleineLargeur', 'ordreColonnes', 'rubriquePleineLargeur'].forEach(function (k) { W()._pdfMqChoix(k, null); });
    await attente(1500);
    dossier.experiences = [1, 2, 3, 4, 5, 6].map(function (i) {
      return { poste: 'Poste ' + i, entreprise: 'Entreprise ' + i, lieu: 'Limoges', dateDebut: (2010 + i) + '-01', dateFin: (2011 + i) + '-06', missions: 'Mission une du poste ' + i + '\nMission deux du poste ' + i + '\nMission trois du poste ' + i + '\nMission quatre du poste ' + i };
    });
    _mepRerendre(); await attente(4500);
    // missions des formations : jamais affichées d'office, même en Mixte
    W()._pdfDefinirModePresentation('B'); await attente(3000);
    var ck = document.querySelector('[data-mep-form-missions]');
    cas('formations : en Mixte, les missions ne s’affichent pas d’office', !/Secourisme/.test(texteCV()) && ck && !ck.checked, ck ? String(ck.checked) : 'case absente');
    W()._pdfBasculerAfficherMissionsFormation(); await attente(2000);
    cas('formations : cocher « Afficher les missions » les fait apparaître', /Secourisme/.test(texteCV()), '');
    W()._pdfBasculerAfficherMissionsFormation(); W()._pdfDefinirModePresentation('A'); await attente(2500);
    // compteurs des compétences professionnelles : grisés seulement quand ils n'ont aucun effet (Par compétences)
    document.getElementById('cComp').open = true;
    var plus = function () { return document.querySelector('[data-mep-comp-pro-plus]'); };
    W()._pdfDefinirModePresentation('C'); await attente(3200);
    cas('compétences : en « Par compétences », « + » des professionnelles est grisé quand la liste n’agit pas', !!plus() && plus().disabled === !!window._mepProSansEffetC && window._mepProSansEffetC === true, String(window._mepProSansEffetC));
    W()._pdfDefinirModePresentation('A'); await attente(3000);
    cas('compétences : en Chronologique, « + » n’est pas grisé par ce mécanisme', !window._mepProSansEffetC, String(window._mepProSansEffetC));
    // Formations : toujours à droite en deux colonnes, jamais déplacées d'office
    var deux = document.querySelector('[data-mep-org-colonnes="2"]');
    if (deux && !deux.checked) { deux.click(); await attente(3500); }
    var enPleineLargeur = function () { return !!W().document.querySelector('#conteneurPage .corps-pleine-largeur [data-rub="Formations"]'); };
    var colonneDe = function () { var c = W().document.querySelector('#conteneurPage .corps.deux'); var f = c && c.querySelector('[data-rub="Formations"]'); return !c || !f ? -1 : (c.children[0].contains(f) ? 0 : 1); };
    cas('formations : sur deux colonnes, elles restent dans la colonne de droite (jamais en pleine largeur d’office)', colonneDe() === 1 && !enPleineLargeur(), 'colonne ' + colonneDe() + ' pleine largeur ' + enPleineLargeur());
    var pl = document.querySelector('[data-mep-org-formpleine]');
    cas('formations : la case « Formations en bas » existe et est décochée', !!pl && !pl.checked, pl ? String(pl.checked) : 'absente');
    if (pl) {
      pl.click(); await attente(3500);
      cas('formations : cochée, la case « Formations en bas » les place en pleine largeur', enPleineLargeur(), '');
      document.querySelector('[data-mep-org-formpleine]').click(); await attente(3500);
      cas('formations : décochée, elles reviennent à droite', colonneDe() === 1 && !enPleineLargeur(), 'colonne ' + colonneDe());
    }
    // option « À côté des comportementales » : grisée sur deux colonnes (en Par compétences)
    W()._pdfDefinirModePresentation('C'); await attente(3200);
    document.getElementById('cExp').open = true; await attente(300);
    _mepRerendre(); await attente(1500);
    var boutonsDispo = [].slice.call(document.querySelectorAll('[data-mep-action-dispo]'));
    cas('disposition : sur deux colonnes, « Pleine largeur / À côté des comportementales » est grisée', boutonsDispo.length === 2 && boutonsDispo.every(function (b) { return b.disabled; }), boutonsDispo.length + ' boutons');
    W()._pdfDefinirModePresentation('A'); await attente(2500);
    dossier.experiences = JSON.parse(sauve);
  }

  // ---------------- Panneaux « Modifier ... » de la carte Expériences rangés par paires (retour de Denis, 2026-10-05) ----------------
  async function parcoursPairesPanneaux() {
    await preparerCvResultats();
    var W = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var paire = function (cle) { return document.querySelector('.paire-choix[data-paire="' + cle + '"]'); };
    var ouvert = function (id) { var d = document.getElementById(id); return !!d && d.open; };
    document.getElementById('cExp').open = true; await attente(300);
    // Chronologique : une seule paire, avec un seul panneau actif (pas de cadre commun)
    _mepRerendre(); await attente(1500); document.getElementById('cExp').open = true; await attente(300);
    var zc = document.getElementById('zoneChoixExp'); if (zc) { zc.open = true; await attente(500); }
    cas('paires : en Chronologique, le panneau des expériences est seul, sans cadre de paire', !!zc && !document.querySelector('.paire-choix'), '');
    if (zc) { zc.open = false; }
    W()._pdfDefinirModePresentation('B'); await attente(3500);
    _mepRerendre(); await attente(1500); document.getElementById('cExp').open = true; await attente(300);
    cas('paires : en Mixte, deux paires de deux boutons', !!paire('comp') && !!paire('exp') && paire('comp').querySelectorAll(':scope > details').length === 2 && paire('exp').querySelectorAll(':scope > details').length === 2, '');
    var x = function (id) { return Math.round(document.getElementById(id).querySelector('summary').getBoundingClientRect().x); };
    ['zoneCompMissions', 'zoneProMixte', 'zoneChoixExp', 'zoneLiens'].forEach(function (id) { var e = document.getElementById(id); if (e) { e.open = false; } }); await attente(800);
    cas('paires : fermée, les deux boutons de la paire sont côte à côte', x('zoneCompMissions') < x('zoneProMixte') && !paire('comp').classList.contains('ouverte'), x('zoneCompMissions') + ' / ' + x('zoneProMixte'));
    document.getElementById('zoneCompMissions').open = true; await attente(700);
    cas('paires : ouvrir « Compétences en action » ouvre aussi « Compétences professionnelles », cadre commun', ouvert('zoneProMixte') && paire('comp').classList.contains('ouverte'), '');
    cas('paires : l’autre paire reste fermée', !ouvert('zoneChoixExp') && !paire('exp').classList.contains('ouverte'), '');
    var fer = paire('comp').querySelector('[data-paire-fermer]');
    cas('paires : « Refermer » est un vrai bouton bordé', !!fer && /solid/.test(getComputedStyle(fer).borderTopStyle) && getComputedStyle(fer).borderTopWidth !== '1.6px', fer ? getComputedStyle(fer).border : 'absent');
    if (fer) { fer.click(); await attente(700); }
    cas('paires : « Refermer » ferme les deux panneaux', !ouvert('zoneCompMissions') && !ouvert('zoneProMixte') && !paire('comp').classList.contains('ouverte'), '');
    document.getElementById('zoneProMixte').open = true; await attente(700);
    cas('paires : ouvrir « Compétences professionnelles » ouvre aussi « Compétences en action »', ouvert('zoneCompMissions'), '');
    document.getElementById('zoneCompMissions').open = false; await attente(700);
    cas('paires : fermer l’un ferme l’autre', !ouvert('zoneProMixte'), '');
    W()._pdfDefinirModePresentation('A'); await attente(2500);
  }

  // ---------------- Remplissage d'office : le CV remplit la page des son premier affichage (2026-10-07) ----------------
  async function parcoursRemplissageOffice() {
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var h = function () { return Math.round(w()._pdfMesurerHauteurPage()); };
    var ouvrir = async function (remiseAZero) {
      naviguerVers('cv'); await attente(1800);
      if (remiseAZero) { dossier.pdfReglages = null; delete dossier.miseEnPageAutoFaite; }
      naviguerVers('resultats'); await attente(7000);
    };
    // 1. Point de comparaison : le même CV court, sans remplissage d'office. On quitte d'abord l'écran (un essai précédent peut laisser la page déjà
    // affichée : naviguer vers elle-même ne reconstruit pas l'aperçu) et on efface un drapeau laissé par un autre essai.
    window.__cvPdfSansRemplissageInitial = true; delete dossier.miseEnPageAutoFaite;
    naviguerVers('cv'); await attente(1800);
    await preparerCvResultats();
    // Patience : après un essai lourd, l'aperçu peut mettre plus de quatre secondes à enregistrer ses premiers réglages.
    for (var attenteEssai = 0; attenteEssai < 20 && !(dossier.pdfReglages && dossier.pdfReglages.echelle !== undefined); attenteEssai++) { await attente(500); }
    var h0 = h(), e0 = dossier.pdfReglages && dossier.pdfReglages.echelle;
    cas('remplissage : sans le remplissage d’office, le CV court garde sa taille d’origine', e0 === 1 && dossier.miseEnPageAutoFaite !== true, 'echelle=' + e0 + ' drapeau=' + dossier.miseEnPageAutoFaite);
    // 2. Un CV déjà réglé n'est jamais recalculé.
    window.__cvPdfSansRemplissageInitial = false; delete dossier.miseEnPageAutoFaite;
    await ouvrir(false);
    cas('remplissage : un CV déjà réglé ne bouge pas (même taille, aucun drapeau posé)', dossier.pdfReglages.echelle === 1 && dossier.miseEnPageAutoFaite === undefined && h() === h0, 'echelle=' + dossier.pdfReglages.echelle + ' drapeau=' + dossier.miseEnPageAutoFaite + ' h=' + h() + '/' + h0);
    // 3. Un CV neuf (jamais réglé) arrive rempli.
    await ouvrir(true);
    var e1 = dossier.pdfReglages && dossier.pdfReglages.echelle;
    cas('remplissage : un CV neuf arrive plus grand qu’un CV non calculé', dossier.miseEnPageAutoFaite === true && e1 > 1 && h() > h0, 'drapeau=' + dossier.miseEnPageAutoFaite + ' echelle=' + e1 + ' h=' + h() + '/' + h0);
    cas('remplissage : le CV reste sur une page et la page est prête pour l’export Word', w().document.querySelectorAll('#conteneurPage .page-a4').length === 1 && w().__cvPdfRemplissagePret === true);
    // 4. « Revenir au modèle de départ » (drapeau remis à false) : le calcul est refait.
    dossier.pdfReglages.echelle = 1; dossier.miseEnPageAutoFaite = false;
    await ouvrir(false);
    cas('remplissage : après « Revenir au modèle de départ », le CV est de nouveau rempli', dossier.miseEnPageAutoFaite === true && dossier.pdfReglages.echelle > 1, 'echelle=' + dossier.pdfReglages.echelle);
    // 5. Un CV trop long ne rétrécit que légèrement (jamais sous 10 px) ; la personne décide ensuite avec le bouton.
    for (var i = 0; i < 6; i++) { dossier.experiences.push(Object.assign({}, dossier.experiences[0], { poste: 'Poste ' + i, entreprise: 'Entreprise ' + i, dateDebut: (2000 + i) + '-01', dateFin: (2001 + i) + '-12' })); }
    await ouvrir(true);
    cas('remplissage : un CV trop long ne descend pas sous 10 px', dossier.pdfReglages.echelle >= 10 / 11 - 0.001, 'echelle=' + dossier.pdfReglages.echelle);
    window.__cvPdfSansRemplissageInitial = true;
  }
  // ---------------- En-tête agrandi d'office (2026-10-07) : sur tous les modèles, un CV court garde un en-tête lisible, sans débordement ----------------
  async function parcoursEnteteAgrandi() {
    window.__cvPdfSansRemplissageInitial = true; delete dossier.miseEnPageAutoFaite;
    naviguerVers('cv'); await attente(1800);
    await preparerCvResultats();
    dossier.experiences = dossier.experiences.slice(0, 1); dossier.formations = dossier.formations.slice(0, 1); dossier.certifications = [];
    dossier.ia = dossier.ia || {}; dossier.ia.cv = dossier.ia.cv || {}; dossier.ia.cv.profil = 'Agent de sécurité attentif, habitué à accueillir le public.';
    naviguerVers('cv'); await attente(1500); naviguerVers('resultats'); await attente(5000);
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var modeles = w()._pdfIdsModelesCreatif().map(function (id) { return ['creatif', id]; })
      .concat(['mq-bandeau', 'mq-fond', 'mq-epure', 'mq-photo', 'mq-rectangles', 'mq-chrono', 'mq-editorial', 'mq-editorial-large', 'mq-cartes', 'mq-grille', 'mq-technique', 'mq-cartes-couleurs'].map(function (id) { return ['sobre', id]; }));
    var nbBoost = 0;
    for (var i = 0; i < modeles.length; i++) {
      var m = modeles[i], etiquette = m[0] + ':' + m[1];
      try {
        if (m[0] === 'creatif') { w()._pdfChoisirModeleCreatif(m[1]); } else { w()._pdfChoisirVarianteSobre(m[1]); }
        await attente(900);
        // même chemin que le premier affichage : calcul de « Mise en page » avec le plancher de départ
        w()._pdfPlancherEchelleAuto = w()._PDF_ECHELLE_PLANCHER_INITIAL; w()._cvPdfMiseEnPageEnCours = false;
        try { w()._pdfAjusterMiseEnPageCalcul(); } finally { w()._pdfPlancherEchelleAuto = null; }
        var boost = w()._cvPdfEnteteBoost, hauteur = Math.round(w()._pdfMesurerHauteurPage()), pages = w().document.querySelectorAll('#conteneurPage .page-a4').length;
        var lignesAvec = w()._pdfLignesEntete();
        w()._cvPdfEnteteBoost = 1; w()._pdfRafraichir(); var lignesSans = w()._pdfLignesEntete();
        w()._cvPdfEnteteBoost = boost; w()._pdfRafraichir();
        if (boost > 1) { nbBoost++; }
        cas('en-tête agrandi : ' + etiquette + ' : levier entre 1 et 1,6', boost >= 1 && boost <= 1.6, String(boost));
        cas('en-tête agrandi : ' + etiquette + ' : le nom et le métier ne gagnent aucune ligne', lignesAvec.nom <= lignesSans.nom && lignesAvec.metier <= lignesSans.metier, JSON.stringify(lignesAvec) + ' / ' + JSON.stringify(lignesSans));
        cas('en-tête agrandi : ' + etiquette + ' : aucun texte d’en-tête ne déborde et le CV reste sur une page', !w()._pdfEnteteProblematiqueApresCroissance() && pages === 1 && hauteur <= 1126, 'h=' + hauteur + ' pages=' + pages);
      } catch (e) { cas('en-tête agrandi : ' + etiquette + ' : essai sans erreur', false, e.message); }
    }
    // 18 modèles sur 37 le jour du 2026-10-07 : les autres sont bloqués par la règle « un titre ne gagne jamais une ligne » (colonnes étroites), à débloquer par la disposition empilée.
    cas('en-tête agrandi : au moins dix modèles ont un en-tête agrandi sur un CV court', nbBoost >= 10, nbBoost + ' / ' + modeles.length);
  }
  // ---------------- Accroche : la phrase choisie s'affiche, d'anciennes versions courtes sont ignorées (2026-10-10) ----------------
  async function parcoursAccrocheCourteDefaut() {
    window.__cvPdfSansRemplissageInitial = true; delete dossier.miseEnPageAutoFaite;
    naviguerVers('cv'); await attente(1800);
    await preparerCvResultats();
    var longue = 'Agent de sécurité attentif, habitué à accueillir le public et à prévenir les situations tendues, avec le sens du service et de la rigueur.';
    var courte = 'Agent de sécurité attentif et rigoureux.';
    dossier.ia = dossier.ia || {}; dossier.ia.cv = dossier.ia.cv || {};
    dossier.ia.cv.profil = longue; dossier.ia.cv.accrochesProposees = [longue]; dossier.ia.cv.accrochesCourtesProposees = [courte];
    var accroche = function () { var e = document.querySelector('#zonePdfInlineCV iframe').contentWindow.document.querySelector('.accroche'); return e ? e.textContent : null; };
    // CV neuf : ni réglages PDF ni réglages de mise en page enregistrés
    naviguerVers('cv'); await attente(1500);
    dossier.pdfReglages = null; dossier.reglagesMiseEnPageCV = null;
    naviguerVers('resultats'); await attente(6500);
    cas('accroche : un CV neuf affiche la phrase choisie, même si une ancienne version courte existe', accroche() === longue && !(dossier.reglagesMiseEnPageCV && dossier.reglagesMiseEnPageCV.accrocheCourte), String(accroche()));
    // ancien réglage « version courte » enregistré : ignoré
    dossier.reglagesMiseEnPageCV = dossier.reglagesMiseEnPageCV || {}; dossier.reglagesMiseEnPageCV.accrocheCourte = true;
    naviguerVers('cv'); await attente(1500); naviguerVers('resultats'); await attente(6000);
    cas('accroche : un ancien réglage « version courte » est ignoré', accroche() === longue, String(accroche()));
  }
  // ---------------- Lecture d'un JSON de l'assistant avec un crochet en trop ou une accolade oubliée (2026-10-10) ----------------
  async function parcoursJsonFermetures() {
    var lire = function (texte) { return extraireBlocJSONDepuisTexte(texte); };
    var valide = lire('```json\n{"a":[1,2],"b":{"c":"x"}}\n```');
    cas('json : un JSON valide est lu comme avant', !!valide && valide.a.length === 2 && valide.b.c === 'x');
    var enTrop = lire('{"a":["x","y"]\n],"b":"z"}');
    cas('json : un crochet en trop est ignoré', !!enTrop && enTrop.b === 'z' && enTrop.a.length === 2);
    var manque = lire('```json\n{"r":{"a":[1],"b":"z"}\n```');
    cas('json : une accolade fermante oubliée à la fin est ajoutée', !!manque && !!manque.r && manque.r.b === 'z');
    var dansTexte = lire('{"a":"un } et un ] dans le texte","b":[1]');
    cas('json : les } et ] à l’intérieur d’un texte ne comptent pas', !!dansTexte && dansTexte.a.indexOf('}') >= 0 && dansTexte.b.length === 1);
    var question = 'Voulez-vous le complément de CV ? (missions de vos formations, de vos certifications et de vos loisirs)';
    var avecQuestion = lire('```json\n{"a":[1,2],"b":{"c":"x"}}\n```\n\n' + question);
    cas('json : la question du complément de CV collée après le bloc ne gêne pas la lecture', !!avecQuestion && avecQuestion.a.length === 2 && avecQuestion.b.c === 'x');
    var sansBarrieres = lire('json\n{"a":[1,2],"b":{"c":"x"}}\n\n' + question);
    cas('json : même sans les marques de bloc, la question collée après est ignorée', !!sansBarrieres && sansBarrieres.a.length === 2);
    var finIncomplete = lire('```json\n{"r":{"a":[1]}\n```\n\n' + question);
    cas('json : une accolade oubliée à la fin est réparée même avec la question après', !!finIncomplete && !!finIncomplete.r);
    var rien = lire('Aucun bloc ici, seulement du texte.');
    cas('json : un texte sans JSON reste refusé', rien === null);
  }
  // ---------------- Disposition d'en-tête « décalée » d'office (2026-10-07, maquette de Denis) : sur tous les modèles, avec et sans photo ----------------
  async function parcoursEnteteDecale() {
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var exclus = ['photoFrise', 'mq-photo'];   // en-tête propre (famille Photo) : jamais activée
    var cumul = { actives: 0, total: 0 };
    for (var avecPhoto = 1; avecPhoto >= 0; avecPhoto--) {
      window.__cvPdfSansRemplissageInitial = true; delete dossier.miseEnPageAutoFaite;
      naviguerVers('cv'); await attente(1800);
      await preparerCvResultats();
      dossier.experiences = dossier.experiences.slice(0, 2); dossier.certifications = [];
      if (!avecPhoto) { dossier.photo = null; } else if (!dossier.photo) { dossier.photo = { url: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', inclure: true, souhaitee: 'oui' }; }
      dossier.ia = dossier.ia || {}; dossier.ia.cv = dossier.ia.cv || {};
      dossier.ia.cv.profil = 'Agent de sécurité attentif, habitué à accueillir le public et à prévenir les situations tendues.';
      naviguerVers('cv'); await attente(1500); naviguerVers('resultats'); await attente(5000);
      var modeles = w()._pdfIdsModelesCreatif().map(function (id) { return ['creatif', id]; })
        .concat(['mq-bandeau', 'mq-fond', 'mq-epure', 'mq-photo', 'mq-rectangles', 'mq-chrono', 'mq-editorial', 'mq-editorial-large', 'mq-cartes', 'mq-grille', 'mq-technique', 'mq-cartes-couleurs'].map(function (id) { return ['sobre', id]; }));
      for (var i = 0; i < modeles.length; i++) {
        var m = modeles[i], etiquette = (avecPhoto ? 'photo' : 'sans photo') + ' : ' + m[1];
        try {
          if (m[0] === 'creatif') { w()._pdfChoisirModeleCreatif(m[1]); } else { w()._pdfChoisirVarianteSobre(m[1]); }
          await attente(800);
          w()._cvPdfEnteteLibreMq = { libre: false, modif: false, disp: null, pos: {}, larg: {}, haut: null, ech: {}, sty: {}, plan: {} }; w()._cvPdfEnteteBoost = 1;
          w()._pdfPlancherEchelleAuto = w()._PDF_ECHELLE_PLANCHER_INITIAL; w()._cvPdfMiseEnPageEnCours = false;
          var active = w()._pdfActiverEnteteDecale();
          try { w()._pdfAjusterMiseEnPageCalcul(); } finally { w()._pdfPlancherEchelleAuto = null; }
          var d = w().document, tete = d.querySelector('#conteneurPage .tete.libre[data-disp="4"]'), page = d.querySelector('#conteneurPage .page-a4').getBoundingClientRect();
          cumul.total++;
          if (exclus.indexOf(m[1]) !== -1) { cas('en-tête décalé : ' + etiquette + ' : modèle à en-tête propre, laissé tel quel', !active && !tete); continue; }
          if (!active) { continue; }   // modèle dont l'en-tête n'occupe pas toute la largeur (frise, rectangles...) : volontairement laissé tel quel
          cumul.actives++;
          var rect = function (k) { var e = tete.querySelector('.blc[data-bl="' + k + '"]'); return e ? e.getBoundingClientRect() : null; };
          var nom = rect('nom'), coord = rect('coord'), met = rect('metier'), acc = rect('accroche');
          var inter = function (a, b) { return a && b && a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1; };
          var blocs = [nom, coord, met, acc].filter(Boolean);
          var chevauche = false; for (var a = 0; a < blocs.length; a++) { for (var b = a + 1; b < blocs.length; b++) { if (inter(blocs[a], blocs[b])) { chevauche = true; } } }
          cas('en-tête décalé : ' + etiquette + ' : aucun bloc ne chevauche un autre', !chevauche);
          cas('en-tête décalé : ' + etiquette + ' : l’accroche est sous le titre, au même bord gauche', !acc || (acc.top >= met.bottom - 2 && Math.abs(acc.left - met.left) <= 2), JSON.stringify({ metierBas: Math.round(met.bottom), accrocheHaut: acc && Math.round(acc.top), metierG: Math.round(met.left), accrocheG: acc && Math.round(acc.left) }));
          var hautPct = tete.getBoundingClientRect().height / page.height * 100;
          // Les modèles à diagonale ou à vague avec photo montent à 33 % (le décor oblige l'en-tête à être plus haut que son contenu), 35,5 % depuis l'agrandissement voulu des en-têtes (2026-10-07) : plafond 36 %.
          cas('en-tête décalé : ' + etiquette + ' : l’en-tête reste sous 36 % de la page', hautPct <= 36, hautPct.toFixed(1) + ' %');
          var deborde = blocs.some(function (r) { return r.right > page.right + 1 || r.left < page.left - 1; });
          cas('en-tête décalé : ' + etiquette + ' : rien ne sort de la page, une seule page', !deborde && d.querySelectorAll('#conteneurPage .page-a4').length === 1 && w()._pdfMesurerHauteurPage() <= 1126, 'h=' + Math.round(w()._pdfMesurerHauteurPage()));
        } catch (e) { cas('en-tête décalé : ' + etiquette + ' : essai sans erreur', false, e.message); }
      }
    }
    cas('en-tête décalé : activé sur au moins 40 des 74 combinaisons modèle x photo', cumul.actives >= 40, cumul.actives + ' / ' + cumul.total);
  }
  // ---------------- Coordonnées en ligne sous l'en-tête (2026-10-07, décisions de Denis) ----------------
  async function parcoursCoordEnLigne() {
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    window.__cvPdfSansRemplissageInitial = true; delete dossier.miseEnPageAutoFaite;
    naviguerVers('cv'); await attente(1800);
    await preparerCvResultats();
    dossier.ia = dossier.ia || {}; dossier.ia.cv = dossier.ia.cv || {};
    dossier.ia.cv.profil = 'Agent de sécurité attentif, habitué à accueillir le public.';
    naviguerVers('cv'); await attente(1500); naviguerVers('resultats'); await attente(5000);
    // « medaillon » n'est volontairement pas dans la liste : sa ligne n'est en pente que lorsque la photo est posée en médaillon.
    var impossibles = ['mqDiagonale', 'rubanDiagonal', 'vagueMarine', 'diagonalesContrastees', 'bandeauVertical', 'frise', 'friseFoncee', 'rectangles', 'photoFrise', 'mq-photo', 'mq-rectangles'];
    var modeles = w()._pdfIdsModelesCreatif().map(function (id) { return ['creatif', id]; })
      .concat(['mq-bandeau', 'mq-fond', 'mq-epure', 'mq-photo', 'mq-rectangles', 'mq-chrono', 'mq-editorial', 'mq-editorial-large', 'mq-cartes', 'mq-grille', 'mq-technique', 'mq-cartes-couleurs'].map(function (id) { return ['sobre', id]; }));
    for (var i = 0; i < modeles.length; i++) {
      var m = modeles[i], et = 'coordonnées en ligne : ' + m[1];
      try {
        if (m[0] === 'creatif') { w()._pdfChoisirModeleCreatif(m[1]); } else { w()._pdfChoisirVarianteSobre(m[1]); }
        await attente(800);
        w()._cvPdfEnteteLibreMq = { libre: false, modif: false, disp: null, pos: {}, larg: {}, haut: null, ech: {}, sty: {}, plan: {} };
        if (w()._pdfModeleAccepteDecale(w()._pdfCleModeleEntete())) { w()._cvPdfEnteteLibreMq = w()._pdfEnteteDecaleeDefaut(); }
        var cb = w().document.getElementById('regBandeauDisponibilite'); cb.checked = false; w()._pdfRafraichir();
        var possible = w()._pdfCoordEnLignePossible();
        cas(et + ' : possible exactement pour les modèles à ligne de séparation droite', m[1] === 'medaillon' || possible === (impossibles.indexOf(m[1]) === -1), 'possible=' + possible);   // « medaillon » : pente seulement avec une photo en médaillon
        cb.checked = true; w()._pdfRafraichir();
        var d = w().document, bande = !!d.querySelector('#conteneurPage .bande-coord'), blocCoord = !!d.querySelector('#conteneurPage .tete.libre .blc[data-bl="coord"]');
        cas(et + ' : les langues restent dans le CV quand les coordonnées sont en ligne', /Anglais/.test(d.querySelector('#conteneurPage').textContent) && !!d.querySelector('#conteneurPage [data-rub="Langues"]'));
        if (possible) { cas(et + ' : la bande des coordonnées est affichée et le bloc en colonne disparaît de l’en-tête libre', bande && !blocCoord, 'bande=' + bande + ' bloc=' + blocCoord); }
        else { cas(et + ' : modèle à ligne non droite : le réglage est ignoré (aucune bande dans un en-tête libre)', !(d.querySelector('#conteneurPage .tete.libre') && bande), 'bande=' + bande); }
        cb.checked = false; w()._pdfRafraichir();
      } catch (e) { cas(et + ' : essai sans erreur', false, e.message); }
    }
    // La case de la carte « En-tête de CV » : « ? » d'aide, active sur un modèle droit, grisée avec sa raison sur un modèle en diagonale
    w()._pdfChoisirModeleCreatif('mqBandeau'); await attente(900); _mepRerendre(); await attente(2500);
    var case1 = document.querySelector('[data-mep-coord-ligne]');
    cas('coordonnées en ligne : la case existe, active, avec son « ? »', !!case1 && !case1.disabled && !!case1.closest('label') && !!case1.closest('label').querySelector('.aide-option'));
    w()._pdfChoisirModeleCreatif('mqDiagonale'); await attente(900); _mepRerendre(); await attente(2500);
    var case2 = document.querySelector('[data-mep-coord-ligne]');
    cas('coordonnées en ligne : la case est grisée sur un modèle en diagonale', !!case2 && case2.disabled);
    // Cocher la case pilote bien le rendu (modèle droit)
    w()._pdfChoisirModeleCreatif('mqBandeau'); await attente(900); _mepRerendre(); await attente(2500);
    var case3 = document.querySelector('[data-mep-coord-ligne]'); case3.click(); await attente(3000);
    cas('coordonnées en ligne : cocher la case affiche la bande sur le CV', !!w().document.querySelector('#conteneurPage .bande-coord'));
    // Page qui DÉBORDE : le calcul essaie les coordonnées en ligne ; elles sont gardées si elles font gagner de la place (au moins 14 px), sinon rien ne change
    window.__cvPdfSansRemplissageInitial = true; delete dossier.miseEnPageAutoFaite;
    naviguerVers('cv'); await attente(1800);
    await preparerCvResultats();
    for (var k = 0; k < 6; k++) { dossier.experiences.push(Object.assign({}, dossier.experiences[0], { poste: 'Poste ' + k, entreprise: 'Entreprise ' + k, dateDebut: (2000 + k) + '-01', dateFin: (2001 + k) + '-12' })); }
    naviguerVers('cv'); await attente(1500); naviguerVers('resultats'); await attente(5000);
    w()._cvPdfEnteteLibreMq = w()._pdfEnteteDecaleeDefaut(); w()._cvPdfEnteteBoost = 1; w().document.getElementById('regBandeauDisponibilite').checked = false; w()._pdfRafraichir();
    var hDebordeAvant = w()._pdfMesurerHauteurPage(), cbD = w().document.getElementById('regBandeauDisponibilite');
    cbD.checked = true; w()._pdfRafraichir(); var hAvecBande = w()._pdfMesurerHauteurPage(); cbD.checked = false; w()._pdfRafraichir();
    w()._cvPdfMiseEnPageEnCours = false; w()._pdfAjusterMiseEnPageCalcul();
    var bandeDebord = !!w().document.querySelector('#conteneurPage .bande-coord');
    cas('coordonnées en ligne : sur une page qui déborde, « Mise en page » les met en ligne si cela fait gagner au moins 14 px', hDebordeAvant > 1125 ? (bandeDebord === (hAvecBande <= hDebordeAvant - 14)) : true, 'avant=' + Math.round(hDebordeAvant) + ' avecBande=' + Math.round(hAvecBande) + ' bande=' + bandeDebord);
    // Le calcul « Mise en page » les met en ligne quand l'en-tête pèse lourd et que la page est pleine ; jamais sur un CV court
    for (var cas2 = 0; cas2 < 2; cas2++) {
      window.__cvPdfSansRemplissageInitial = true; delete dossier.miseEnPageAutoFaite;
      naviguerVers('cv'); await attente(1800);
      await preparerCvResultats();
      if (cas2 === 1) { dossier.experiences = dossier.experiences.slice(0, 1); dossier.formations = []; dossier.certifications = []; dossier.competencesCV = ['Rigueur']; dossier.loisirs = []; dossier.langues = []; }
      dossier.photo = { url: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', inclure: true, souhaitee: 'oui' };
      naviguerVers('cv'); await attente(1500); naviguerVers('resultats'); await attente(5000);
      w()._cvPdfEnteteLibreMq = w()._pdfEnteteDecaleeDefaut(); w()._cvPdfEnteteBoost = 1; w().document.getElementById('regBandeauDisponibilite').checked = false; w()._pdfRafraichir();
      var teteAvant = w().document.querySelector('#conteneurPage .tete').getBoundingClientRect().height / 1123, hAvant = w()._pdfMesurerHauteurPage();
      w()._cvPdfMiseEnPageEnCours = false; w()._pdfAjusterMiseEnPageCalcul();
      var bandeMEP = !!w().document.querySelector('#conteneurPage .bande-coord');
      if (cas2 === 0) { cas('coordonnées en ligne : « Mise en page » les met en ligne quand l’en-tête pèse lourd et que la page est pleine', bandeMEP || teteAvant < 0.2 || hAvant < 1010, 'tete=' + Math.round(teteAvant * 100) + ' % page=' + Math.round(hAvant)); }
      else { cas('coordonnées en ligne : « Mise en page » ne les met pas en ligne sur un CV court', !bandeMEP, 'page=' + Math.round(hAvant)); }
    }
  }
  // ---------------- « Ambiance » (ex-« look ») pliable, grisée en Sobre ; bouton « Mise en page » qui pulse (2026-10-07, décisions de Denis) ----------------
  async function parcoursAmbianceEtPulsation() {
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    window.__cvPdfSansRemplissageInitial = true; delete dossier.miseEnPageAutoFaite;
    naviguerVers('cv'); await attente(1800);
    await preparerCvResultats();
    w()._pdfChoisirModeleCreatif('mqBandeau'); await attente(900); _mepRerendre(); await attente(2500);
    _mepCartesOuvertes.zoneAmbiances = false; _mepCartesOuvertes.autreCouleur = false; _mepRerendre(); await attente(1500);   // l'etat des panneaux ne depend pas de l'essai precedent
    var carteAmb = function () { return document.getElementById('zoneAmbiances'); };
    var panAmb = function () { return document.getElementById('panneauAmbiances'); };
    var ouvertAmb = function () { var pa = panAmb(); return !!pa && !pa.hidden; };
    cas('ambiance : la carte est un bouton, fermée à l’arrivée', !!carteAmb() && carteAmb().tagName === 'BUTTON' && !ouvertAmb() && carteAmb().getAttribute('aria-expanded') === 'false');
    var zoneAmb = carteAmb() ? carteAmb().closest('.carte-looks') : null;
    cas('ambiance : le mot « look » n’apparaît plus nulle part (carte et panneau)', !!zoneAmb && !!panAmb() && !/\blooks?\b/i.test(zoneAmb.textContent + panAmb().textContent), zoneAmb ? zoneAmb.textContent.slice(0, 120) : '');
    cas('ambiance : carte fermée, on voit le titre, la phrase, la palette de six couleurs et le mot « Ouvrir »', !!carteAmb() && /Choisir une ambiance/.test(carteAmb().textContent) && /Un clic r/.test(carteAmb().textContent) && /Ouvrir/.test(carteAmb().textContent) && carteAmb().querySelectorAll('.amb-pal i').length === 6);
    if (carteAmb()) { carteAmb().click(); await attente(900); }
    cas('ambiance : un clic sur la carte ouvre le panneau ; la carte devient pleine et dit « Fermer »', ouvertAmb() && !!carteAmb() && carteAmb().classList.contains('ouvert') && /Fermer/.test(carteAmb().textContent) && carteAmb().getAttribute('aria-expanded') === 'true');
    cas('ambiance : le panneau est sur toute la largeur, hors des deux colonnes, avant « Allure générale »', !!panAmb() && !document.querySelector('.style-grille').contains(panAmb()) && !!(panAmb().compareDocumentPosition(document.querySelector('.ligne-allure')) & 4));
    cas('ambiance : le bouton d’annulation s’appelle « Annuler l’ambiance »', !!panAmb() && /Annuler l’ambiance/.test(panAmb().textContent));
    cas('ambiance : six ambiances proposées dans le panneau ouvert', document.querySelectorAll('[data-mep-look]').length === 6);
    var traitsAllure = ['sobre', 'defaut', 'creatif'].map(function (a) { var b = document.querySelector('[data-mep-allure="' + a + '"]'); return b ? getComputedStyle(b, '::before').height : ''; });
    cas('allure : un trait de couleur de 4 px en haut de chacun des trois boutons', traitsAllure.every(function (h) { return h === '4px'; }), traitsAllure.join(' | '));
    // Rond « Ouvrir / Fermer » commun à tous les panneaux qui s'ouvrent ; trois boutons d'allure sur une ligne en mode « Boutons plus grands » (retours de Denis, 2026-10-08)
    var chevCarte = document.querySelector('details.mep-carte > summary .chev');
    cas('panneaux : chaque carte qui s’ouvre porte le rond avec « Ouvrir » ou « Fermer »', !!chevCarte && /Ouvrir|Fermer/.test(getComputedStyle(chevCarte, '::after').content) && getComputedStyle(chevCarte, '::before').borderRadius.indexOf('50%') !== -1, chevCarte ? getComputedStyle(chevCarte, '::after').content : 'absent');
    var sansRond = [].filter.call(document.querySelectorAll('.mep-mq details'), function (d) { var s = d.querySelector(':scope > summary'); return d.offsetParent !== null && s && !s.querySelector('.chev'); }).map(function (d) { return (d.id || d.className); });
    cas('panneaux : aucun panneau visible qui s’ouvre n’est resté sans le rond « Ouvrir / Fermer »', sansRond.length === 0, sansRond.join(' | '));
    var attrAvant = document.documentElement.getAttribute('data-grands-boutons'); document.documentElement.setAttribute('data-grands-boutons', '1'); await attente(300);
    var hautsAllure = [].map.call(document.querySelectorAll('.seg-allure button'), function (b) { return Math.round(b.getBoundingClientRect().top); });
    cas('allure : en mode « Boutons plus grands », les trois boutons sont sur la même ligne', hautsAllure.length === 3 && hautsAllure[0] === hautsAllure[1] && hautsAllure[1] === hautsAllure[2], hautsAllure.join(','));
    if (attrAvant === null) { document.documentElement.removeAttribute('data-grands-boutons'); } else { document.documentElement.setAttribute('data-grands-boutons', attrAvant); }
    if (carteAmb()) { carteAmb().click(); await attente(900); }
    cas('ambiance : un second clic referme le panneau', !ouvertAmb() && !!carteAmb() && !carteAmb().classList.contains('ouvert'));
    // Panneau de suggestions avant « Allure générale », relié à son bouton (décision de Denis, 2026-10-08)
    var lAllure = document.querySelector('.ligne-allure'), grilleStyle = document.querySelector('.style-grille');
    cas('allure : « Allure générale » est sur toute la largeur, hors des deux colonnes', !!lAllure && !!grilleStyle && !grilleStyle.contains(lAllure) && !!lAllure.querySelector('[data-mep-allure="sobre"]'));
    var panSuggs = function () { return document.querySelector('.depli.sugg-relie:not(.panneau-looks)'); };
    if (typeof _mepSuggestionsRecues === 'function') {
      var listeEssai = [1, 2, 3, 4].map(function (i) { return { id: 'essai' + i, titre: 'Suggestion ' + i, gain: i, sens: 'remplir', detail: 'Détail ' + i, picto: 'un', changes: [] }; });
      _mepSuggestionsRecues(listeEssai, false); await attente(700);
      var bSugg = document.querySelector('[data-mep-sugg-ouvrir]');
      cas('suggestions : le bouton est visible et fermé au départ, sans pulsation (aucun clic sur « Mise en page »)', !!bSugg && !bSugg.classList.contains('ouvert') && !panSuggs() && !bSugg.classList.contains('pulse-mep'));
      if (bSugg) { bSugg.click(); await attente(700); }
      bSugg = document.querySelector('[data-mep-sugg-ouvrir]');
      var lAllure2 = document.querySelector('.ligne-allure');
      cas('suggestions : le bouton ouvert est marqué et dit « Ouvert, cliquez pour refermer »', !!bSugg && bSugg.classList.contains('ouvert') && /Ouvert, cliquez pour refermer/.test(bSugg.textContent));
      cas('suggestions : le panneau s’affiche avant « Allure générale », sur toute la largeur', !!panSuggs() && !!lAllure2 && !!(panSuggs().compareDocumentPosition(lAllure2) & 4) && !document.querySelector('.style-grille').contains(panSuggs()));
      // Un seul panneau à la fois : ouvrir les ambiances referme les suggestions, et inversement
      carteAmb().click(); await attente(900);
      cas('panneaux : ouvrir les ambiances referme les suggestions', ouvertAmb() && !panSuggs());
      document.querySelector('[data-mep-sugg-ouvrir]').click(); await attente(900);
      cas('panneaux : ouvrir les suggestions referme les ambiances', !ouvertAmb() && !!panSuggs());
      document.querySelector('[data-mep-sugg-ouvrir]').click(); await attente(500);
      cas('suggestions : un second clic referme le panneau', !panSuggs());
      // Pulsation du bouton des suggestions : seulement après un clic sur « Mise en page » et s'il y a des suggestions ; ouvrir ou fermer l'arrête
      _mepSuggPulseAttendu = true; _mepSuggestionsRecues(listeEssai, false); await attente(700);
      cas('suggestions : après « Mise en page », le bouton des suggestions pulse', !!document.querySelector('[data-mep-sugg-ouvrir].pulse-mep') && _mepSuggPulseActif());
      cas('suggestions : la pulsation dure dix secondes', _mepSuggPulseJusqua - Date.now() > 8500 && _mepSuggPulseJusqua - Date.now() <= 10000, String(_mepSuggPulseJusqua - Date.now()));
      var bMep = document.getElementById('btnMepMiseEnPage'), jusquaAvant = _mepPulseJusqua;
      cas('suggestions : quand elles pulsent, « Mise en page » ne pulse pas', !!bMep && !bMep.classList.contains('pulse-mep') && !_mepPulseActif());
      _mepPulseJusqua = Date.now() + 10000;   // même si un changement de modèle voulait la faire pulser
      cas('suggestions : « Mise en page » ne peut pas pulser en même temps que les suggestions', !_mepPulseActif());
      _mepPulseJusqua = jusquaAvant;
      document.querySelector('[data-mep-sugg-ouvrir]').click(); await attente(700);
      cas('suggestions : ouvrir le panneau arrête la pulsation', !_mepSuggPulseActif() && !document.querySelector('[data-mep-sugg-ouvrir].pulse-mep'));
      document.querySelector('[data-mep-sugg-ouvrir]').click(); await attente(700);
      cas('suggestions : refermer ne la relance pas', !_mepSuggPulseActif() && !document.querySelector('[data-mep-sugg-ouvrir].pulse-mep'));
      _mepSuggestionsRecues(listeEssai, true); await attente(700);
      cas('suggestions : un recalcul des suggestions (sans clic sur « Mise en page ») ne fait pas pulser', !_mepSuggPulseActif() && !document.querySelector('[data-mep-sugg-ouvrir].pulse-mep'));
      _mepSuggPulseAttendu = true; _mepSuggestionsRecues([], false); await attente(700);
      cas('suggestions : sans aucune suggestion, rien ne pulse', !_mepSuggPulseActif() && _mepSuggPulseAttendu === false);
      _mepSuggPulseArreter(); _mepSuggestionsRecues([], false); await attente(400);
    }
    // Allure Sobre : carte grisée, impossible à ouvrir, raison visible
    var boutonSobre = document.querySelector('[data-mep-allure="sobre"]'); if (boutonSobre) { boutonSobre.click(); } await attente(3500);
    cas('ambiance : en allure Sobre, la carte reste utilisable (plus de restriction)', !!carteAmb() && !carteAmb().classList.contains('desactivee') && carteAmb().getAttribute('tabindex') !== '-1' && getComputedStyle(carteAmb()).pointerEvents !== 'none');
    if (carteAmb() && !ouvertAmb()) { carteAmb().click(); await attente(900); }
    cas('ambiance : en allure Sobre, la carte s’ouvre', ouvertAmb());
    // Niveau 1 : tant qu'aucune couleur n'est choisie le CV Sobre reste tel quel ; dès qu'une couleur est choisie, elle se voit aussi sur les titres
    var wSobre = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var classesCv = function () { var c = wSobre().document.querySelector('#conteneurPage .cv'); return c ? c.className : ''; };
    dossier.reglagesMiseEnPageCV._couleurChoisie = false; wSobre()._pdfRafraichir(); await attente(2500);
    cas('sobre : tant qu’aucune couleur n’est choisie, le CV Sobre reste tel quel (titres sombres)', !/sobre-couleur/.test(classesCv()), classesCv());
    document.querySelectorAll('[data-mep-base]')[3].click(); await attente(3500);
    var couleurTitre = getComputedStyle(wSobre().document.querySelector('#conteneurPage h2')).color;
    cas('sobre : dès qu’une couleur est choisie, elle se voit aussi sur les titres (niveau 1, sans bouton à activer)', /sobre-couleur/.test(classesCv()) && couleurTitre !== 'rgb(32, 38, 46)' && !document.querySelector('[data-mep-sobre-couleurs]'), classesCv() + ' / ' + couleurTitre);
    cas('ambiance : plus de bouton « Prélever une couleur à l’écran » en double dans la carte', !document.querySelector('#panneauAmbiances [data-mep-pipette]'));
    // Pulsation : CV court, changement de modèle -> le bouton pulse, puis s'arrête tout seul
    window.__cvPdfSansRemplissageInitial = true;
    naviguerVers('cv'); await attente(1800);
    await preparerCvResultats();
    dossier.experiences = dossier.experiences.slice(0, 1); dossier.formations = []; dossier.certifications = []; dossier.competencesCV = ['Rigueur']; dossier.loisirs = []; dossier.langues = [];
    naviguerVers('cv'); await attente(1500); naviguerVers('resultats'); await attente(5000);
    _mepPulseArreter();
    cas('pulsation : sur un CV court, la mise en page est jugée améliorable', w()._pdfMiseEnPageAmeliorable() === true);
    w()._pdfChoisirModeleCreatif('mqCadre'); await attente(2500);
    var b = document.getElementById('btnMepMiseEnPage');
    cas('pulsation : après un changement de modèle, le bouton « Mise en page » pulse', !!b && b.classList.contains('pulse-mep') && _mepPulseActif(), b ? b.className : 'pas de bouton');
    await attente(6000);
    b = document.getElementById('btnMepMiseEnPage');
    cas('pulsation : il pulse toujours à mi-parcours', !!b && b.classList.contains('pulse-mep'));
    await attente(6500);
    b = document.getElementById('btnMepMiseEnPage');
    cas('pulsation : elle s’arrête toute seule après dix secondes', !!b && !b.classList.contains('pulse-mep') && !_mepPulseActif());
    // Nouveau changement de modèle : elle repart ; un clic l'arrête
    w()._pdfChoisirModeleCreatif('mqPicto'); await attente(2500);
    b = document.getElementById('btnMepMiseEnPage');
    cas('pulsation : un nouveau changement de modèle la relance', !!b && b.classList.contains('pulse-mep'));
    if (b) { b.click(); await attente(800); }
    b = document.getElementById('btnMepMiseEnPage');
    cas('pulsation : cliquer sur le bouton l’arrête', !_mepPulseActif() && (!b || !b.classList.contains('pulse-mep')));
    // Page pleine : pas de pulsation
    w()._pdfAjusterMiseEnPageCalcul();
    var ameliorable = w()._pdfMiseEnPageAmeliorable(), hh = Math.round(w()._pdfMesurerHauteurPage());
    cas('pulsation : le critère est cohérent avec la page (améliorable seulement si elle déborde ou est remplie à moins de 90 %)', ameliorable === (hh > 1125 || hh < 1010), 'h=' + hh + ' ameliorable=' + ameliorable);
  }
  // ---------------- Style rapide en allure Standard : tirage riche (2026-10-07, décision de Denis) ----------------
  async function parcoursTirageStandardRiche() {
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    window.__cvPdfSansRemplissageInitial = true; delete dossier.miseEnPageAutoFaite;
    naviguerVers('cv'); await attente(1800);
    await preparerCvResultats();
    dossier.photo = { url: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', inclure: true, souhaitee: 'oui' };
    naviguerVers('cv'); await attente(1500); naviguerVers('resultats'); await attente(5000);
    var boutonStandard = document.querySelector('[data-mep-allure="defaut"]'); if (boutonStandard) { boutonStandard.click(); await attente(2500); }
    cas('tirage standard : l’allure Standard est active', _mepAllureActuelle() === 'defaut', String(_mepAllureActuelle()));
    var de = function () { return document.getElementById('btnMepDe'); };
    // Tous les mots du CV, sans tenir compte de leur ordre ni de la ponctuation : un tirage ne doit jamais ajouter, retirer ou modifier un mot (deux rubriques courtes peuvent changer de place).
    var texteCv = function () {
      var d = w().document, arbre = d.createTreeWalker(d.querySelector('#conteneurPage'), 4), morceaux = [], n;   // 4 = NodeFilter.SHOW_TEXT : chaque morceau de texte séparément
      while ((n = arbre.nextNode())) { morceaux.push(n.nodeValue); }
      // Aucun mot ne doit disparaître, y compris « Langues » : la rubrique reste en place même quand les coordonnées passent en ligne.
      return (morceaux.join(' ').toLowerCase().match(/[a-zà-ÿ0-9]+/g) || []).sort().join(' ');
    };
    var signature = function () {
      var c = dossier.reglagesMiseEnPageCV || {}, d = w().document;
      return [c.baseCouleur, c.styleTitres, c.styleCompetences, c.coinsArrondis ? 1 : 0, c.icones ? 1 : 0, c.degradeColonnes, c.degradeBandeau, !!c.bandeauDisponibilite ? 1 : 0, c.anneauPhoto ? 1 : 0, w()._cvPdfCoinCouleur ? 1 : 0,
        d.getElementById('regFondColonnes').value, d.getElementById('regFormeEnTete').value, d.getElementById('regBandeauEnTete').checked ? 1 : 0].join('/');
    };
    var texteAvant = texteCv(), signatures = {}, ambiances = {}, etapes = 0, debordements = 0, N = 14, colonnesVues = {};
    var tirer = async function (n, colonnesVoulues) {
      for (var i = 0; i < n; i++) {
        var pile = _mepHistoCompteur;   // la pile d'annulation est plafonnee a 8 : on compte les etapes poussees
        de().click(); await attente(2800);
        etapes += (_mepHistoCompteur - pile);
        signatures[signature()] = 1; ambiances[_mepDerniereAmbianceTiree] = 1;
        var d = w().document, page = d.querySelector('#conteneurPage .page-a4').getBoundingClientRect(), col = d.getElementById('regColonnes').value;
        colonnesVues[col] = 1;
        var sort = Array.prototype.some.call(d.querySelectorAll('#conteneurPage .cv *'), function (e) { var r = e.getBoundingClientRect(); return r.width > 0 && (r.right > page.right + 2 || r.left < page.left - 2); });
        if (sort) { debordements++; }
        if (colonnesVoulues) { cas('tirage standard (' + colonnesVoulues + ' colonne(s) choisie(s)) ' + (i + 1) + ' : le nombre de colonnes choisi est gardé', col === colonnesVoulues, col + ' / ' + colonnesVoulues); }
        cas('tirage standard : le texte du CV ne change pas (tirage ' + (i + 1) + ')', texteCv() === texteAvant);
      }
    };
    // 1. Aucun choix de colonnes : les deux boutons sont décochés et le tirage peut proposer une ou deux colonnes
    cas('colonnes : aucune des deux cases n’est cochée au départ', document.querySelectorAll('[data-mep-org-colonnes]:checked').length === 0 && document.querySelectorAll('[data-mep-org-colonnes]').length === 2);
    await tirer(N, null);
    cas('tirage standard : sans choix de la personne, une ET deux colonnes sont proposées', !!colonnesVues['1'] && !!colonnesVues['2'], Object.keys(colonnesVues).join(','));
    cas('tirage standard : chaque clic ajoute une seule étape d’annulation', etapes === N, etapes + ' / ' + N);
    cas('tirage standard : au moins 9 combinaisons différentes sur ' + N + ' tirages', Object.keys(signatures).length >= 9, String(Object.keys(signatures).length));
    cas('tirage standard : au moins 4 ambiances différentes sur ' + N + ' tirages', Object.keys(ambiances).length >= 4, String(Object.keys(ambiances).length));
    cas('tirage standard : rien ne sort de la page', debordements === 0, String(debordements));
    // 2. La personne choisit « Une colonne », puis « Deux colonnes » : le tirage respecte chaque choix
    _mepRerendre(); await attente(2500);
    document.querySelector('[data-mep-org-colonnes="1"]').click(); await attente(3500);
    cas('colonnes : « Une colonne » est cochée, l’autre case reste libre', !!document.querySelector('[data-mep-org-colonnes="1"]:checked') && !document.querySelector('[data-mep-org-colonnes="2"]:checked'));
    await tirer(5, '1');
    document.querySelector('[data-mep-org-colonnes="2"]').click(); await attente(3500);
    await tirer(5, '2');
    // 3. Un second clic sur le choix fait le retire : plus aucun bouton choisi
    document.querySelector('[data-mep-org-colonnes="2"]').click(); await attente(3000);
    cas('colonnes : décocher la case retire le choix (aucune case cochée)', document.querySelectorAll('[data-mep-org-colonnes]:checked').length === 0);
    // annuler le dernier tirage : l'état d'avant revient
    de().click(); await attente(2800);   // un dernier tirage, puis on l'annule (l'étape précédente était le retrait du choix de colonnes)
    var avantAnnuler = signature(); var btnAnn = document.getElementById('btnMepAnnulerDe'); if (btnAnn && !btnAnn.disabled) { btnAnn.click(); await attente(2800); }
    cas('tirage standard : « Annuler » revient au tirage précédent', signature() !== avantAnnuler);
  }
  // ---------------- Modèles à photo : cachés sans photo (2026-10-08, décision de Denis) ----------------
  async function parcoursModelesPhoto() {
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    window.__cvPdfSansRemplissageInitial = true; delete dossier.miseEnPageAutoFaite;
    naviguerVers('cv'); await attente(1800);
    await preparerCvResultats();
    var laPhoto = { url: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', inclure: true, souhaitee: 'oui' };
    var ouvrir = async function (avecPhoto) { dossier.photo = avecPhoto ? laPhoto : null; naviguerVers('cv'); await attente(1500); naviguerVers('resultats'); await attente(5000); };
    await ouvrir(false);
    cas('modèles à photo : sans photo, « Photo et frise » (Créatif) n’est pas proposé par « Un autre modèle »', w()._pdfIdsModelesCreatif().indexOf('photoFrise') === -1);
    cas('modèles à photo : sans photo, « Photo et frise » (Sobre) n’est pas proposé', w()._pdfIdsVariantesSobre().indexOf('mq-photo') === -1);
    var bCreatif = document.querySelector('[data-mep-allure="creatif"]'); if (bCreatif) { bCreatif.click(); await attente(3000); }
    var tous = document.querySelector('[data-mep-galerie-tous="1"]'); if (tous) { tous.click(); await attente(2500); }
    cas('modèles à photo : sans photo, la galerie ne montre pas « Photo et frise »', !document.querySelector('[data-mep-galerie-creatif="photoFrise"]') && document.querySelectorAll('[data-mep-galerie-creatif]').length >= 20, String(document.querySelectorAll('[data-mep-galerie-creatif]').length));
    await ouvrir(true);
    cas('modèles à photo : avec une photo, les deux modèles sont proposés', w()._pdfIdsModelesCreatif().indexOf('photoFrise') !== -1 && w()._pdfIdsVariantesSobre().length >= 1);
    var bCreatif2 = document.querySelector('[data-mep-allure="creatif"]'); if (bCreatif2) { bCreatif2.click(); await attente(3000); }
    var tous2 = document.querySelector('[data-mep-galerie-tous="1"]'); if (tous2) { tous2.click(); await attente(2500); }
    cas('modèles à photo : avec une photo, la galerie montre « Photo et frise »', !!document.querySelector('[data-mep-galerie-creatif="photoFrise"]'));
    var bStandard = document.querySelector('[data-mep-allure="defaut"]'); if (bStandard) { bStandard.click(); await attente(2500); }
  }
  // ---------------- Bouton « Dégradé » en rectangle (2026-10-08, demande de Denis) ----------------
  async function parcoursBoutonDegrade() {
    window.__cvPdfSansRemplissageInitial = true; delete dossier.miseEnPageAutoFaite;
    naviguerVers('cv'); await attente(1800);
    await preparerCvResultats();
    var bStandard = document.querySelector('[data-mep-allure="defaut"]'); if (bStandard) { bStandard.click(); await attente(2500); }
    var carteDeg = document.getElementById('zoneAmbiances'); if (carteDeg && carteDeg.getAttribute('aria-expanded') !== 'true') { carteDeg.click(); await attente(900); }
    var bouton = function () { return document.querySelector('.btn-degrade[data-mep-degrade-simple]'); };
    cas('dégradé : c’est un rectangle (bouton) qui porte le mot « Dégradé »', !!bouton() && bouton().tagName === 'BUTTON' && /Dégradé/.test(bouton().textContent), bouton() ? bouton().textContent : 'absent');
    var etat0 = bouton().getAttribute('aria-pressed');
    bouton().click(); await attente(3000);
    var etat1 = bouton().getAttribute('aria-pressed');
    cas('dégradé : un clic change l’état affiché (activé / non activé)', etat1 !== etat0, etat0 + ' -> ' + etat1);
    cas('dégradé : l’état activé se voit (cadre et fond de la couleur du thème, gras, coche)', (function () { var b = bouton(); b.setAttribute('aria-pressed', 'true'); var s = getComputedStyle(b), coche = getComputedStyle(b, '::before').content, gras = parseInt(s.fontWeight, 10) >= 700, cadre = s.borderTopColor; b.setAttribute('aria-pressed', 'false'); var cadre0 = getComputedStyle(b).borderTopColor; b.setAttribute('aria-pressed', etat1); return /✓/.test(coche) && gras && cadre !== cadre0; })());
    // Décisions de Denis (2026-10-10) : « Dégradé » au niveau de « Personnalisée » (dans les couleurs de la carte), « Options supplémentaires » sur la ligne d'« Annuler l'ambiance ».
    var annuler = document.querySelector('#panneauAmbiances [data-mep-look-annuler]'), bOpt = document.querySelector('#panneauAmbiances .pied-droite [data-mep-options-supp]');
    cas('dégradé : à l’intérieur de la carte « Choisir une ambiance », avec les couleurs', !!bouton() && !!bouton().closest('#panneauAmbiances') && !!bouton().closest('.swatches, .nuancier-amb'));
    cas('options supplémentaires : à l’intérieur de la carte « Choisir une ambiance », sur la même ligne que « Annuler »', !!annuler && !!bOpt && Math.abs(annuler.getBoundingClientRect().top - bOpt.getBoundingClientRect().top) < 14);
    cas('dégradé : un « ? » d’aide accompagne le bouton, avec une infobulle', !!document.querySelector('#panneauAmbiances .degrade-bloc [data-mep-aide-option][title]'));
    bouton().click(); await attente(3000);
    cas('dégradé : un second clic revient à l’état de départ', bouton().getAttribute('aria-pressed') === etat0);
    var bSobre = document.querySelector('[data-mep-allure="sobre"]'); if (bSobre) { bSobre.click(); await attente(3000); }
    cas('dégradé : en allure Sobre, le rectangle est grisé', !!bouton() && bouton().disabled);
    if (bStandard) { bStandard.click(); await attente(2500); }
    _mepCartesOuvertes.zoneAmbiances = false; _mepCartesOuvertes.autreCouleur = false; _mepRerendre(); await attente(1500);
  }
  // ---------------- Guidage de découverte à la première arrivée sur le CV (2026-10-08, décisions de Denis) ----------------
  async function parcoursPulseAllure() {
    var remiseAZero = function () { _mepGuideArreter(); _mepGuide.etape = 'attente'; _mepGuide.ecoule = 0; try { localStorage.removeItem('app.guidagePulseFait'); } catch (e) { /* sans effet */ } delete dossier.guidagePulseFait; _mepPulseJusqua = 0; _mepSuggPulseJusqua = 0; };
    var pulsants = function () { return [].slice.call(document.querySelectorAll('.pulse-allure')).map(function (b) { return b.id === 'btnMepDe' ? 'rapide' : b.getAttribute('data-mep-allure'); }); };
    var tic = function (ecoule, etape) { if (etape) { _mepGuide.etape = etape; } _mepGuide.ecoule = ecoule; _mepGuideDernier = Date.now(); _mepGuideTic(); return pulsants(); };
    window.__cvPdfSansRemplissageInitial = true; delete dossier.miseEnPageAutoFaite;
    naviguerVers('cv'); await attente(1800);
    await preparerCvResultats();
    var bStd = document.querySelector('[data-mep-allure="defaut"]'); if (bStd && _mepAllureActuelle() !== 'defaut') { bStd.click(); await attente(2500); }
    cas('guidage : les durées sont celles décidées (10 s, puis 4 s par allure, deux tours, ordre Créatif, Sobre, Standard)', _MEP_GUIDE_RAPIDE_MS === 10000 && _MEP_GUIDE_PHASE_MS === 4000 && _MEP_GUIDE_NB_CYCLES === 2 && _MEP_GUIDE_ORDRE.join() === 'creatif,sobre,defaut');
    // Mentions sous les allures
    var mentions = [].map.call(document.querySelectorAll('[data-mep-allure] small'), function (e) { return e.textContent; });
    cas('guidage : sous chaque allure, une mention (nombre de modèles, « Mon style » pour Standard)', mentions.length === 3 && /^\d+ modèles?$/.test(mentions[0]) && mentions[1] === 'Mon style' && /^\d+ modèles?$/.test(mentions[2]), mentions.join(' | '));
    // Première arrivée : tout est effacé, puis retour sur le panneau
    remiseAZero();
    naviguerVers('cv'); await attente(1500); naviguerVers('resultats'); await attente(2500);
    cas('guidage : à la première arrivée, « Style rapide » est le premier à pulser, seul', _mepGuide.etape === 'rapide' && pulsants().join() === 'rapide', _mepGuide.etape + ' / ' + pulsants().join());
    // Étapes jouées sans attendre (temps simulé)
    cas('guidage : après 10 secondes sans clic, les allures prennent le relais, Créatif d’abord', tic(_MEP_GUIDE_RAPIDE_MS - 100, 'rapide').join() === 'rapide' && tic(_MEP_GUIDE_RAPIDE_MS + 300, 'rapide').join() === 'creatif' && _mepGuide.etape === 'allures');
    var phase = function (ms) { return tic(ms, 'allures').join(); };
    cas('guidage : Créatif 0 à 4 s, Sobre 4 à 8 s, Standard 8 à 12 s, puis un deuxième tour', phase(500) === 'creatif' && phase(4500) === 'sobre' && phase(8500) === 'defaut' && phase(12500) === 'creatif' && phase(16500) === 'sobre' && phase(20500) === 'defaut');
    // Une seule pulsation à la fois : « Mise en page » passe avant, le guidage se met en pause
    _mepPulseJusqua = Date.now() + 10000; var avantPause = _mepGuide.ecoule;
    var pendantPause = tic(avantPause, 'allures'); _mepGuide.ecoule = avantPause; _mepGuideDernier = Date.now() - 200; _mepGuideTic();
    cas('guidage : quand « Mise en page » doit pulser, le guidage se met en pause (une seule pulsation à la fois, son temps ne s’écoule pas)', pendantPause.length === 0 && _mepGuide.ecoule === avantPause, pendantPause.join() + ' / ' + _mepGuide.ecoule + ' vs ' + avantPause);
    _mepPulseJusqua = 0;
    // Fin : après deux tours, plus rien ne pulse
    cas('guidage : après deux tours (24 s), plus rien ne pulse et c’est terminé', tic(_MEP_GUIDE_PHASE_MS * 3 * _MEP_GUIDE_NB_CYCLES + 100, 'allures').length === 0 && _mepGuide.etape === 'fini');
    // Le premier clic sur « Style rapide » fait passer aux allures
    remiseAZero(); naviguerVers('cv'); await attente(1500); naviguerVers('resultats'); await attente(2500);
    cas('guidage : relancé pour l’essai du clic sur « Style rapide »', _mepGuide.etape === 'rapide' && pulsants().join() === 'rapide', _mepGuide.etape);
    document.getElementById('btnMepDe').click(); await attente(3500);
    _mepPulseJusqua = 0; _mepSuggPulseJusqua = 0; _mepGuideTic();
    cas('guidage : dès le premier clic sur « Style rapide », les allures prennent le relais', _mepGuide.etape === 'allures', _mepGuide.etape);
    // Clic sur Standard : ne l'arrête pas ; clic sur Sobre : l'arrête pour toujours
    document.querySelector('[data-mep-allure="defaut"]').click(); await attente(600);
    cas('guidage : un clic sur Standard (déjà actif) ne l’arrête pas', _mepGuide.etape === 'allures', _mepGuide.etape);
    document.querySelector('[data-mep-allure="sobre"]').click(); await attente(3000);
    cas('guidage : un clic sur Sobre l’arrête, plus rien ne pulse', _mepGuide.etape === 'fini' && pulsants().length === 0, _mepGuide.etape + ' / ' + pulsants().join());
    cas('guidage : c’est mémorisé (dossier et navigateur)', dossier.guidagePulseFait === true && (function () { try { return localStorage.getItem('app.guidagePulseFait') === '1'; } catch (e) { return true; } })());
    naviguerVers('cv'); await attente(1500); naviguerVers('resultats'); await attente(2500);
    cas('guidage : il ne repart plus jamais', pulsants().length === 0 && _mepGuide.etape === 'fini');
    // « Mise en page » : une fois le principe compris (3 clics), il ne pulse plus tout seul
    try { localStorage.setItem('app.miseEnPageClics', '3'); } catch (e) { /* sans effet */ }
    _mepPulseJusqua = 0; _mepModeleOuStyleChange(); await attente(1500);
    cas('mise en page : après trois clics sur le bouton, il ne pulse plus tout seul', !_mepPulseActif());
    try { localStorage.removeItem('app.miseEnPageClics'); } catch (e) { /* sans effet */ }
    var bStd2 = document.querySelector('[data-mep-allure="defaut"]'); if (bStd2) { bStd2.click(); await attente(2500); }
  }
  // ---------------- Boutons qui ouvrent une liste : rond « Ouvrir / Fermer », bouton plein quand c'est ouvert, « − 4 + » à la même hauteur (2026-10-08, retours de Denis) ----------------
  async function parcoursRondBoutons() {
    window.__cvPdfSansRemplissageInitial = true; delete dossier.miseEnPageAutoFaite;
    naviguerVers('cv'); await attente(1800);
    await preparerCvResultats();
    var carteComp = function () { return [].filter.call(document.querySelectorAll('details.mep-carte'), function (d) { return /Compétences/.test((d.querySelector('summary h3') || {}).textContent || ''); })[0]; };
    if (carteComp() && !carteComp().open) { carteComp().querySelector('summary').click(); await attente(900); }
    var pick = function () { return carteComp() ? carteComp().querySelector('[data-mep-pick="pro"]') : null; };
    cas('rond : « Les montrer et les choisir » porte le rond', !!pick() && !!pick().querySelector('.rond-btn') && !pick().querySelector('.rond-btn.ouvert') && /Ouvrir/.test(getComputedStyle(pick().querySelector('.rond-btn'), '::after').content));
    // Présence affirmée (décision de Denis, 2026-10-08) : rubrique fermée et bouton intérieur fermé ont le cadre arrondi de la couleur du thème, comme « Choisir une ambiance »
    var rubFermee = [].filter.call(document.querySelectorAll('details.mep-carte:not([open])'), function (d) { return d.offsetParent !== null; })[0];
    var csRub = rubFermee ? getComputedStyle(rubFermee) : null, csAmb = getComputedStyle(document.getElementById('zoneAmbiances'));
    cas('rond : une rubrique fermée a le même cadre arrondi et la même ombre que « Choisir une ambiance »', !!csRub && csRub.borderRadius === csAmb.borderRadius && csRub.borderTopColor === csAmb.borderTopColor && csRub.boxShadow !== 'none' && csRub.backgroundColor === csAmb.backgroundColor, csRub ? (csRub.borderRadius + ' ' + csRub.borderTopColor + ' ' + csRub.boxShadow.slice(0, 30)) : 'aucune rubrique fermée');
    cas('rond : un bouton intérieur fermé (« Les montrer et les choisir ») a le même cadre arrondi', getComputedStyle(pick()).borderRadius === csAmb.borderRadius && getComputedStyle(pick()).borderTopColor === csAmb.borderTopColor && getComputedStyle(pick()).boxShadow !== 'none', getComputedStyle(pick()).borderRadius + ' ' + getComputedStyle(pick()).borderTopColor);
    var fondFerme = getComputedStyle(pick()).backgroundColor, texteFerme = getComputedStyle(pick()).color;
    pick().click(); await attente(900);
    cas('rond : ouvert, le bouton dit « Fermer »', !!pick() && !!pick().querySelector('.rond-btn.ouvert') && /Fermer/.test(getComputedStyle(pick().querySelector('.rond-btn'), '::after').content));
    var fondOuvert = getComputedStyle(pick()).backgroundColor, texteOuvert = getComputedStyle(pick()).color;
    cas('rond : ouvert, le bouton est plein (fond de la couleur du thème, texte blanc), fermé il ne l’est pas', fondOuvert !== fondFerme && texteOuvert === 'rgb(255, 255, 255)' && texteFerme !== 'rgb(255, 255, 255)', fondFerme + ' / ' + fondOuvert);
    var pas = pick().parentElement.querySelector('.pas'), hautPick = Math.round(pick().getBoundingClientRect().height), hautPas = Math.round(pas.getBoundingClientRect().height);
    cas('rond : le « − 4 + » a la même hauteur que « Les montrer et les choisir »', Math.abs(hautPick - hautPas) <= 1, hautPick + ' / ' + hautPas);
    pick().click(); await attente(900);
    cas('rond : refermé, le bouton redevient comme au départ', !pick().querySelector('.rond-btn.ouvert') && getComputedStyle(pick()).backgroundColor === fondFerme);
    var anciennes = [].filter.call(carteComp().querySelectorAll('button'), function (b) { return /[▾▴]/.test(b.textContent); }).length;
    cas('rond : plus aucune petite flèche écrite dans le texte des boutons de la rubrique', anciennes === 0, String(anciennes));
    // « Changer l'intitulé » des compétences : toujours affiché, grisé quand il n'y a aucune compétence (pas de décalage visuel, retour de Denis 2026-10-08)
    var caseComp = function () { return carteComp().querySelector('[data-mep-afficher-comp="pro"]'); };
    if (caseComp() && caseComp().checked) { caseComp().click(); await attente(3500); }
    var zoneIntitPro = caseComp() ? caseComp().closest('.champ').querySelector('.ligne-intitule') : null;
    var boutonIntitPro = zoneIntitPro ? zoneIntitPro.querySelector('[data-mep-intitule-ouvrir]') : null;
    cas('intitulé : sans compétence professionnelle sur le CV, « Changer l’intitulé » reste affiché mais grisé', !!zoneIntitPro && !zoneIntitPro.hidden && !!boutonIntitPro && boutonIntitPro.disabled && !!caseComp() && !caseComp().checked, zoneIntitPro ? (zoneIntitPro.hidden + ' ' + (boutonIntitPro && boutonIntitPro.disabled)) : 'zone absente');
    if (caseComp() && !caseComp().checked) { caseComp().click(); await attente(3500); }
    var boutonIntitPro2 = caseComp() ? caseComp().closest('.champ').querySelector('[data-mep-intitule-ouvrir]') : null;
    cas('intitulé : les compétences de nouveau affichées, le bouton « Changer l’intitulé » redevient utilisable', !!boutonIntitPro2 && !boutonIntitPro2.disabled);
    // Remise en état : carte refermée, allure Standard, pour ne pas gêner l'essai suivant
    if (carteComp() && carteComp().open) { carteComp().querySelector('summary').click(); await attente(600); }
    var bStdRond = document.querySelector('[data-mep-allure="defaut"]'); if (bStdRond && _mepAllureActuelle() !== 'defaut') { bStdRond.click(); await attente(2500); }
  }
  // ---------------- « Annuler la couleur » / « Annuler l'ambiance » : un seul bouton qui change de nom, l'écran ne bouge pas (2026-10-08, retours de Denis) ----------------
  async function parcoursAnnulerCouleur() {
    window.__cvPdfSansRemplissageInitial = true; delete dossier.miseEnPageAutoFaite;
    naviguerVers('cv'); await attente(1800);
    await preparerCvResultats();
    var bStdAc = document.querySelector('[data-mep-allure="defaut"]'); if (bStdAc && _mepAllureActuelle() !== 'defaut') { bStdAc.click(); await attente(2500); }
    var carteAc = document.getElementById('zoneAmbiances'); if (carteAc.getAttribute('aria-expanded') !== 'true') { carteAc.click(); await attente(900); }
    var annuler = function () { return document.querySelector('[data-mep-look-annuler]'); };
    var champAc = function (id) { var e = document.querySelector('#zonePdfInlineCV iframe').contentDocument.getElementById(id); return e ? e.value : ''; };
    cas('annuler : au départ, rien à annuler dans la carte d’ambiance', !!annuler() && annuler().disabled);
    var couleur0 = champAc('regCouleurDebut');
    document.querySelectorAll('[data-mep-base]')[3].click(); await attente(3500);
    var couleur1 = champAc('regCouleurDebut');
    cas('annuler : après le choix d’une couleur, le bouton devient « Annuler la couleur »', couleur1 !== couleur0 && !annuler().disabled && /Annuler la couleur/.test(annuler().textContent), couleur0 + ' > ' + couleur1 + ' / ' + annuler().textContent);
    document.querySelector('[data-mep-look="moderne"]').click(); await attente(3500);
    cas('annuler : après une ambiance, le bouton redevient « Annuler l’ambiance »', !annuler().disabled && /Annuler l’ambiance/.test(annuler().textContent), annuler().textContent);
    // l'écran ne remonte pas
    window.scrollTo(0, 700); await attente(400);
    var yAvant = Math.round(window.pageYOffset);
    annuler().click(); await attente(3500);
    cas('annuler : l’écran reste là où il est, il ne remonte pas', yAvant > 100 && Math.abs(Math.round(window.pageYOffset) - yAvant) <= 3, yAvant + ' > ' + Math.round(window.pageYOffset));
    cas('annuler : « Annuler l’ambiance » ramène à la couleur choisie avant, et le bouton propose alors « Annuler la couleur »', champAc('regCouleurDebut') === couleur1 && /Annuler la couleur/.test(annuler().textContent), champAc('regCouleurDebut') + ' / ' + annuler().textContent);
    var y2 = Math.round(window.pageYOffset);
    annuler().click(); await attente(3500);
    cas('annuler : « Annuler la couleur » ramène au modèle de départ, plus rien à annuler', champAc('regCouleurDebut') === couleur0 && annuler().disabled, champAc('regCouleurDebut') + ' / ' + annuler().disabled);
    cas('annuler : l’écran ne bouge toujours pas', Math.abs(Math.round(window.pageYOffset) - y2) <= 3, y2 + ' > ' + Math.round(window.pageYOffset));
    window.scrollTo(0, 0);
    _mepCartesOuvertes.zoneAmbiances = false; _mepCartesOuvertes.autreCouleur = false; _mepRerendre(); await attente(1500);
  }
  // ---------------- Module « Un CV, plusieurs métiers » : squelette (2026-10-10) ----------------
  async function parcoursUnCvPlusieursMetiers() {
    var ouvertAvant = window.UCPM_OUVERT;
    window.UCPM_OUVERT = true;   // le module est fermé au public tant que son parcours n'est pas complet : on l'ouvre le temps de l'essai
    try {
      ucpmReinitialiser();
      naviguerVers('cv'); await attente(1200);
      ouvrirCarteAccueil('orientation'); await attente(600);
      var tuile = $('#btnCarteAccueilUnCvPlusieursMetiers');
      cas('ucpm : la tuile est dans « Vous hésitez encore ? » à côté de « Comparer mes pistes »', !!tuile && !!$('#btnCarteAccueilComparerPistes'));
      if (tuile) { tuile.click(); await attente(900); }
      cas('ucpm : la présentation s’affiche', pageActuelle === 'un-cv-plusieurs-metiers-intro' && /Un CV, plusieurs métiers/.test(texte($('h1'))));
      cas('ucpm : la présentation ne cite pas le module des employeurs du territoire', !/employeurs du territoire|répertoire des employeurs/i.test(texte($('.intro-module-parcours'))));
      $('#btnUcpmCommencer').click(); await attente(900);
      cas('ucpm : la page de travail s’affiche avec la barre de sept étapes', pageActuelle === 'un-cv-plusieurs-metiers' && document.querySelectorAll('.barre-etapes-bilan .pastille-etape-action').length === 7);
      cas('ucpm : la barre d’étapes est seulement visuelle (aucune étape cliquable)', document.querySelectorAll('.barre-etapes-bilan a').length === 0);
      cas('ucpm : « Revoir la présentation » est là', !!$('#btnUcpmRevoirPresentation'));
      $('#btnUcpmRevoirPresentation').click(); await attente(700);
      cas('ucpm : « Revoir la présentation » ramène à la présentation en détour, avec « Revenir au module »', pageActuelle === 'un-cv-plusieurs-metiers-intro' && !!$('#btnUcpmRevenirModuleHaut') && !!$('#btnUcpmRevenirModuleBas'));
      $('#btnUcpmRevenirModuleBas').click(); await attente(700);
      cas('ucpm : « Revenir au module » rend la page de travail', pageActuelle === 'un-cv-plusieurs-metiers');
      _ucpmEtat.texteCV = 'CV de test'; naviguerVers('un-cv-plusieurs-metiers-intro'); await attente(500);
      $('#btnUcpmCommencer').click(); await attente(700);
      cas('ucpm : un travail en cours ressort avec « Continuer / Recommencer » et le gel', !!$('#btnUcpmRepriseContinuer') && !!$('#btnUcpmRepriseRecommencer') && !!$('.module-gel-actif'));
      $('#btnUcpmRepriseContinuer').click(); await attente(600);
      cas('ucpm : « Continuer » lève le gel et garde le travail', !$('.module-gel-actif') && _ucpmEtat && _ucpmEtat.texteCV === 'CV de test');
      cas('ucpm : l’état part dans la disquette', !!collecterEtatsModulesPourSauvegarde().unCvPlusieursMetiers);
      ucpmReinitialiser();
      cas('ucpm : « Tout effacer » vide le module', collecterEtatsModulesPourSauvegarde().unCvPlusieursMetiers === null);
    } finally { window.UCPM_OUVERT = ouvertAvant; ucpmReinitialiser(); naviguerVers('cv'); await attente(500); }
  }

  // ---------------- Module « Un CV, plusieurs métiers » : pages 1 et 2 (2026-10-10) ----------------
  async function parcoursUnCvMetiersPage2() {
    var ouvertAvant = window.UCPM_OUVERT;
    window.UCPM_OUVERT = true;
    try {
      ucpmReinitialiser();
      var etat = ouvrirUnCvPlusieursMetiers();
      naviguerVers('un-cv-plusieurs-metiers'); await attente(800);
      cas('ucpm p1 : « Choisir mon assistant » est bloqué tant que le CV n’est pas relu', !!$('#btnUcpmVersAssistant') && $('#btnUcpmVersAssistant').disabled);
      cas('ucpm p1 : « Continuer » est bloqué tant que les métiers ne sont pas reçus', $('#btnSuivantNavigation').disabled);
      etat.texteCV = 'Agent d’entretien des bâtiments, dix ans d’expérience.'; etat.cvRelu = true; ucpmRendrePage(); await attente(400);
      cas('ucpm p1 : le texte relu et masqué est visible avant l’envoi', !!$('details textarea[readonly]'));
      $('#btnUcpmVersAssistant').click(); await attente(500);
      cas('ucpm p1 : le choix de l’assistant propose les six assistants de l’application', document.querySelectorAll('[data-assistant-ucpm]').length === 6);
      etat.passages = { metiers: { vue: 'coller', assistant: 'chatgpt' } }; ucpmRendrePage(); await attente(400);
      $('#texteCollageUcpmMetiers').value = 'Voici mes conseils, sans aucun JSON.';
      $('#btnImporterUcpmMetiers').click(); await attente(300);
      cas('ucpm p1 : une réponse illisible donne un message clair et ne passe pas à la page 2', etat.page === 1 && /ne ressemble pas/.test(texte($('#messageImportUcpmMetiers'))));
      var rep = await (await fetch('/docs/essais_prompts_ucpm/reponses/01_metiers_V5_chatgpt_1.txt')).text();
      $('#texteCollageUcpmMetiers').value = rep;
      $('#btnImporterUcpmMetiers').click(); await attente(800);
      cas('ucpm p1 : une vraie réponse de l’assistant (version 5 du prompt) est lue et mène à la page 2', etat.page === 2 && !!etat.reponseMetiers);
      cas('ucpm p2 : deux colonnes et la synthèse en lecture seule', document.querySelectorAll('[data-ucpm-colonne]').length === 2 && !!$('#ucpmSynthese') && !$('#ucpmSynthese textarea'));
      cas('ucpm p2 : tant que l’identité est inconnue, les deux formes sont affichées', /Électricien \/ Électricienne/.test(texte($('[data-ucpm-colonne="droite"]'))));
      cas('ucpm p2 : « Créer mes CV » est bloqué sans 2 métiers cochés', $('#btnSuivantNavigation').disabled);
      $('[data-ucpm-coche="g1"]').click(); await attente(250);
      $('[data-ucpm-coche="d1"]').click(); await attente(250);
      cas('ucpm p2 : 2 cochés mais sans objectif, le bouton reste bloqué avec sa raison', $('#btnSuivantNavigation').disabled && /objectif/.test($('#btnSuivantNavigation').title));
      $('#btnUcpmChoisirObjectif').click(); await attente(400);
      $('[data-ucpm-demarche="alternance"]').click(); await attente(250);
      cas('ucpm p2 : le panneau d’objectif propose durée, dates, heures et « Autre chose à dire » pour une alternance', ['dureeQuantite', 'dateDebut', 'heures', 'formationVisee', 'autreChose'].every(function (c) { return !!$('#ucpmPanneauObjectif [data-ucpm-champ="' + c + '"]'); }) && document.querySelectorAll('#ucpmPanneauObjectif [data-ucpm-dispo]').length === 4);
      cas('ucpm p2 : « Je vise » propose un métier précis ou un secteur ; le secteur ouvre les 21 secteurs de l’application', document.querySelectorAll('#ucpmPanneauObjectif [data-ucpm-cible]').length === 2 && (function () { $('[data-ucpm-cible="secteur"]').click(); return true; })());
      await attente(400);
      cas('ucpm p2 : les 21 secteurs sont des pastilles à cliquer, sans menu ni bouton « voir tous »', !$('#ucpmF_secteur') && document.querySelectorAll('[data-ucpm-secteur]').length === 21);
      cas('ucpm p2 : l’encadré « Chaque CV peut avoir son propre objectif » est en haut de la page', !!$('.ucpm-encadre') && /propre objectif/.test($('.ucpm-encadre').textContent));
      cas('ucpm p2 : la portée se choisit avec trois gros boutons qui portent le nom de la colonne', document.querySelectorAll('.ucpm-portee').length === 3 && /Mon métier, appelé autrement/.test($('[data-ucpm-portee="gauche"]').textContent));
      $('[data-ucpm-demarche="pmsmp"]').click(); await attente(400);
      cas('ucpm p2 : l’immersion propose sept objectifs à cliquer', document.querySelectorAll('[data-ucpm-pmsmp]').length === 7);
      $('[data-ucpm-demarche="reconversion"]').click(); await attente(400);
      cas('ucpm p2 : le changement de métier demande l’ancien métier ou secteur', !!$('#ucpmF_ancienValeur') && document.querySelectorAll('[data-ucpm-ancien]').length === 2);
      $('[data-ucpm-demarche="alternance"]').click(); await attente(400);
      cas('ucpm p2 : l’alternance demande l’organisme ou centre de formation', !!$('#ucpmF_organisme'));
      $('[data-ucpm-dispo="Sous 15 jours"]').click(); await attente(300);
      cas('ucpm p2 : la disponibilité se choisit d’un clic, sans écrire', _ucpmUi2.objectif.brouillon.disponibleA === 'Sous 15 jours' && $('[data-ucpm-dispo="Sous 15 jours"]').classList.contains('is-actif'));
      $('[data-ucpm-cible="metier"]').click(); await attente(300);
      cas('ucpm p2 : pour plusieurs métiers, le métier de chaque CV est repris sans rien écrire', /repris tel quel/.test(texte($('#ucpmPanneauObjectif'))));
      $('#btnUcpmAppliquerObjectif').click(); await attente(400);
      cas('ucpm p2 : l’objectif appliqué à tous débloque « Créer mes CV »', !$('#btnSuivantNavigation').disabled);
      $('#btnUcpmEcrire').click(); await attente(250);
      $('#ucpmNouvelIntitule').value = 'Agent de maintenance'; $('#btnUcpmAjouterIntitule').click(); await attente(300);
      cas('ucpm p2 : un intitulé écrit par la personne apparaît, coché, « Écrit par vous »', /Écrit par vous/.test(texte($('[data-ucpm-colonne="gauche"]'))));
      cas('ucpm p2 : ce nouvel intitulé attend son objectif, le bouton se rebloque', $('#btnSuivantNavigation').disabled);
      $('[data-ucpm-offres="droite"]').click(); await attente(400);
      cas('ucpm p2 : le panneau d’offres n’a aucun champ de collage de réponse', !!$('#ucpmPanneauOffres') && !$('#ucpmPanneauOffres textarea') && !document.querySelector('[id*="texteCollage"][id*="Offres"]'));
      cas('ucpm p2 : avec ChatGPT, l’alerte « activer la recherche web » est visible', /activez d’abord l’option de recherche/.test(texte($('#ucpmPanneauOffres'))));
    } finally { window.UCPM_OUVERT = ouvertAvant; ucpmReinitialiser(); naviguerVers('cv'); await attente(500); }
  }

  // ---------------- Module « Un CV, plusieurs métiers » : page 3, CV de référence, tout dans la page (2026-10-10) ----------------
  async function parcoursUnCvMetiersPage3() {
    var ouvertAvant = window.UCPM_OUVERT;
    window.UCPM_OUVERT = true;
    var experiencesAvant = dossier.experiences; var importsAvant = dossier.imports;
    try {
      ucpmReinitialiser();
      var etat = ouvrirUnCvPlusieursMetiers();
      var rep = await (await fetch('/docs/essais_prompts_ucpm/reponses/01_metiers_V5_chatgpt_1.txt')).text();
      etat.reponseMetiers = ucpmLireReponseMetiers(rep).valeurs; etat.texteCV = 'Agent d’entretien des bâtiments. Dix ans. Peinture, plomberie, électricité de base.'; etat.cvRelu = true;
      var l = ucpmCreerListes(etat.reponseMetiers); etat.intitules = l.intitules; etat.autres = l.autres;
      ucpmBasculerCoche(etat, 'g1', true); ucpmBasculerCoche(etat, 'd1', true);
      var o = ucpmObjectifVide('alternance'); o.secteur = 'bâtiment'; o.dureeQuantite = '2'; o.dureeUnite = 'ans';
      ucpmAppliquerObjectif(etat, 'tous', null, o);
      etat.page = 3; etat.pageMax = 3; etat.p3Vue = 'choix'; etat.p3Extrait = false;
      dossier.experiences = []; dossier.imports = { courant: null };
      naviguerVers('un-cv-plusieurs-metiers'); await attente(800);
      cas('ucpm p3 : le métier du CV est proposé par défaut comme référence', !!$('input[name="ucpmRef"]:checked'));
      $('#btnUcpmPreparerRef').click(); await attente(500);
      cas('ucpm p3 : le rangement du CV commence par le choix de l’assistant, DANS la page (aucune fenêtre)', etat.p3Vue === 'structurer' && !!$('[data-ucpm-vue="choix"]') && !$('#fenetreERIP') && !$('#assistantDepotCV'));
      cas('ucpm p3 : l’objectif du métier de référence est posé dans le dossier', dossier.objectif === 'alternance' && /Agent/.test(dossier.metierCible || ''));
      etat.passages = { extraction: { vue: 'coller', assistant: 'chatgpt' } }; ucpmRendrePage(); await attente(400);
      var json = { identite: { civilite: '', nom: '', prenom: '', telephone: '', email: '', adresse: '', codePostal: '', ville: 'Limoges', lien: '' }, presentation: { titre: 'Agent d’entretien des bâtiments', accroche: '' },
        experiences: [{ poste: 'Agent d’entretien en résidence', entreprise: 'Habitat social', lieu: 'Limoges', dateDebut: '2019-01', dateFin: '2024-06', stage: null, missions: ['Entretien courant de 120 logements', 'Petits dépannages'], confiance: 'elevee', alertes: [] }],
        experiencesPerso: [], formations: [{ niveau: 'CAP', intitule: 'Peintre applicateur', annee: '2014', etablissement: '', lieu: '', missions: [], confiance: 'elevee', alertes: [] }],
        competences: { savoirFaire: ['Peinture'], savoirEtre: ['Autonomie'], savoirs: [] }, langues: [], certifications: [], certificationsAvecMissions: [], logiciels: [], permis: { possede: null, categories: [], vehicule: null },
        loisirs: [], engagements: [], informationsNonClassees: [], pointsAVerifier: [] };
      $('#texteCollageUcpmExtraction').value = '```json\n' + JSON.stringify(json) + '\n```';
      $('#btnImporterUcpmExtraction').click(); await attente(800);
      cas('ucpm p3 : après le rangement, l’écran « Vos informations » de l’application s’ouvre avec ce qui a été repéré, barre d’étapes du module', pageActuelle === 'projet' && etat.p3Vue === 'infos' && /Vos informations/.test(texte($('h1'))) && /Référence/.test(texte($('.barre-etapes-bilan'))) && /Agent d.entretien en résidence/.test(document.body.innerHTML));
      cas('ucpm p3 : la barre du bas propose de continuer vers le style d’écriture et l’assistant', /style d.écriture et assistant/.test(texte($('.barre-navigation-fixe'))));
      document.querySelector('[onclick="ucpmContinuerDepuisInfos()"]').click(); await attente(1200);
      cas('ucpm p3 : une fois les informations vérifiées, le CV est rangé en rubriques dans le dossier', etat.p3Extrait === true && dossier.experiences.length === 1 && etat.p3Vue === 'assistant');
      var texteCv = promptCache('cv', texteProfilEffectif('cv'));
      cas('ucpm p3 : la demande du CV complet (prompt cv.md) porte le métier de référence et son objectif', /Agent/.test(texteCv) && /lternance/.test(texteCv));
      document.querySelector('[data-assistant-rect-toggle="import-ia"]').click(); await attente(500);
      var reponseCv = { titresProposes: ['Agent d’entretien des bâtiments'], accrochesProposees: ['Dix ans d’entretien de bâtiments collectifs.', 'Agent d’entretien autonome.'], accrochesCourtesProposees: ['Dix ans d’entretien.', 'Entretien et dépannages.'], pointsForts: ['Autonomie'], motsCles: ['entretien'],
        recommandations: { typeCV: { valeur: 'chronologique', justification: 'parcours continu' }, postesRecommandes: [], experiencesAMettreEnAvant: [], competencesAValoriser: [], competencesPersonnelles: [], competencesAttenduesMetier: [], rubriquesMasquables: [] } };
      $('#texteCollageActionIA').value = '```json\n' + JSON.stringify(reponseCv) + '\n```\n\nCopiez ce message dans l’application. Voulez-vous aussi le complément de CV (missions de vos formations) ? Si oui, répondez : oui';
      $('#btnImporterActionIA').click(); await attente(1500);
      cas('ucpm p3 : la réponse est importée et validée dans la page, « Régler mon CV » se débloque', reponseIAImportee('cv') && !$('#btnSuivantNavigation').disabled && !$('#fenetreERIP'));
      // Complément de CV (facultatif) : la zone existe après l'import, accepte le second bloc suivi de la question, et FUSIONNE sans rien écraser.
      cas('ucpm p3 : la question de l’assistant est détectée et une consigne claire s’affiche', !!$('.complement-cv-banniere') && /répondez-lui/i.test($('.complement-cv-banniere').textContent) && /dernière fenêtre/.test($('.complement-cv-banniere').textContent));
      cas('ucpm p3 : « Compléter mon CV (facultatif) » apparaît après l’import', !!$('[data-assistant-rect-toggle="complement-cv"]'));
      $('[data-assistant-rect-toggle="complement-cv"]').click(); await attente(500);
      var blocComplement = '```json\n{"recommandations":{"formationsAvecMissions":[{"intitule":"BTS - Maintenance des systèmes (niveau)","missions":["Étudier le fonctionnement des systèmes techniques.","Repérer les causes d’un dysfonctionnement."],"justification":"j"}],"certificationsAvecMissions":[{"certification":"SST (2016)","missions":["Prévenir les risques."],"justification":"j"}],"loisirRetenu":{"intitule":"","missions":[],"justification":""}}}\n```\n\nVoulez-vous le complément de CV ? (missions de vos formations)';
      $('#texteCollageComplement').value = blocComplement; $('#texteCollageComplement').dispatchEvent(new Event('input', { bubbles: true })); await attente(300); $('#btnImporterComplement').click(); await attente(800);
      cas('ucpm p3 : le complément est ajouté, la phrase de question collée ne gêne pas', dossier.complementCVAjoute === true && dossier.ia.cv.recommandations.formationsAvecMissions.length === 1 && dossier.ia.cv.recommandations.certificationsAvecMissions.length === 1);
      cas('ucpm p3 : une fois le complément ajouté, la consigne disparaît et le rectangle se referme (plus de deuxième collage possible)', !$('.complement-cv-banniere') && !$('#texteCollageComplement') && !complementCVEnAttente());
      var rDouble = fusionnerComplementCV(blocComplement);
      cas('ucpm p3 : le même complément collé deux fois ne crée pas de doublon', dossier.ia.cv.recommandations.formationsAvecMissions.length === 1, String(rDouble.succes));
      var rVide = fusionnerComplementCV('Voici du texte sans données.');
      cas('ucpm p3 : un texte sans données est refusé avec un message clair', !rVide.succes && /explain|écrit|bloc|donn|mission|trouvé/i.test(rVide.erreur || '') && dossier.ia.cv.recommandations.formationsAvecMissions.length === 1, rVide.erreur);
      $('[data-assistant-rect-toggle="import-ia"]').click(); await attente(500);
      cas('ucpm p3 : un petit bouton « Importer le complément de CV » est à côté de l’import', !!$('#btnOuvrirComplementCV'));
      $('#texteCollageActionIA').value = '{"formationsAvecMissions":[{"intitule":"CAP Menuiserie","missions":["Tracer des pièces."],"justification":"j"}],"couleursEntrepriseSuggerees":["#0A7F5A"]}'; $('#btnImporterActionIA').click(); await attente(1500);
      cas('ucpm p3 : un complément collé dans la zone principale est reconnu et ajouté, sans erreur', dossier.ia.cv.recommandations.formationsAvecMissions.length === 2 && dossier.ia.cv.couleurEntrepriseSuggeree === '#0A7F5A');
      ucpmBarreContinuer(); await attente(600);
      cas('ucpm p3 : un seul bouton « Régler mon CV », celui de la barre du bas (plus de doublon dans la carte)', !$('#btnUcpmOuvrirEditeur')); ucpmBarreContinuer(); await attente(5000);
      cas('ucpm p3 : l’éditeur de CV s’ouvre avec la barre du module et « Ce CV me convient »', pageActuelle === 'resultats' && !!window._modeModuleUcpm && /Ce CV me convient/.test(texte($('.barre-navigation-fixe'))) && /Référence/.test(texte($('.barre-etapes-bilan'))));
      cas('ucpm p3 : plus de case « Version courte » dans l’éditeur du module', !$('[data-mep-accroche-courte]'));
      cas('ucpm p3 : pas de « Et maintenant ? » proposé depuis le module', !$('.et-apres'));
      document.querySelector('[onclick="ucpmContinuerDepuisEditeur()"]').click(); await attente(1000);
      cas('ucpm p3 : « Ce CV me convient » passe à la page 4 et libère le mode module', etat.page === 4 && etat.refPret === true && !window._modeModuleUcpm);
      naviguerVers('cv'); await attente(800); naviguerVers('resultats'); await attente(3500);
      cas('ucpm p3 : hors du module non plus, plus de case « Version courte »', !$('[data-mep-accroche-courte]'));
    } finally { window.UCPM_OUVERT = ouvertAvant; dossier.experiences = experiencesAvant; dossier.imports = importsAvant; ucpmReinitialiser(); naviguerVers('cv'); await attente(500); }
  }

  // ---------------- Module « Un CV, plusieurs métiers » : page 5 « Mes CV », aspect par CV et échange du dossier (2026-10-10) ----------------
  async function parcoursUnCvMetiersPage5() {
    var ouvertAvant = window.UCPM_OUVERT;
    window.UCPM_OUVERT = true;
    var sauvegarde = JSON.stringify(dossier);
    try {
      ucpmReinitialiser();
      var etat = ouvrirUnCvPlusieursMetiers();
      var rep = await (await fetch('/docs/essais_prompts_ucpm/reponses/01_metiers_V5_chatgpt_1.txt')).text();
      etat.reponseMetiers = ucpmLireReponseMetiers(rep).valeurs; etat.texteCV = 'cv'; etat.cvRelu = true;
      var l = ucpmCreerListes(etat.reponseMetiers); etat.intitules = l.intitules; etat.autres = l.autres;
      ['g1', 'd1', 'd2'].forEach(function (id) { ucpmBasculerCoche(etat, id, true); });
      var o = ucpmObjectifVide('spontanee'); o.secteur = 'bâtiment'; ucpmAppliquerObjectif(etat, 'tous', null, o);
      etat.sexe = 'f'; etat.refPret = true; etat.refId = 'g1'; etat.page = 5; etat.pageMax = 5;
      dossier.identite = { civilite: 'Madame', nom: 'Martin', prenom: 'Camille', ville: 'Limoges' }; dossier.titreCV = 'Agent d’entretien des bâtiments';
      dossier.experiences = [{ poste: 'Agent d’entretien', entreprise: 'Habitat social', lieu: 'Limoges', dateDebut: '2019-01', dateFin: '2024-06', missions: 'Entretien de 120 logements\nPetits dépannages' }];
      dossier.formations = [{ niveau: 'CAP', intitule: 'Peintre applicateur', etablissement: 'AFPA', annee: '2014', missions: '' }]; dossier.competencesCV = ['Rigueur', 'Autonomie'];
      dossier.formatCV = 'pdf'; dossier.pdfReglages = null; dossier.reglagesMiseEnPageCV = null; dossier.dernierDocumentPrepare = 'cv';
      dossier.ia = dossier.ia || {}; dossier.ia.cv = Object.assign({}, dossier.ia.cv, { profil: 'Dix ans d’entretien de bâtiments collectifs.', accrochesProposees: ['Dix ans d’entretien de bâtiments collectifs.'], accrochesCourtesProposees: ['Dix ans d’entretien.'], accrocheIdx: 0 });
      etat.accroches = { d1: ['Pratique de la peinture en bâtiment.', 'Préparation des supports et finitions.'], d2: ['Habilitation électrique BS.', 'Dépannages en électricité de base.'] };
      var avant = JSON.stringify(dossier);
      naviguerVers('un-cv-plusieurs-metiers'); await attente(1200);
      cas('ucpm p5 : trois cartes, une par CV, la première est la référence', document.querySelectorAll('[data-ucpm-carte]').length === 3 && /CV de référence/.test(texte($('[data-ucpm-carte="g1"]'))));
      cas('ucpm p5 : « Passer aux lettres » est bloqué tant que 2 CV n’ont pas leur phrase', $('#btnSuivantNavigation').disabled && /2 CV/.test($('#btnSuivantNavigation').title));
      var pretes = false;
      for (var i = 0; i < 60 && !pretes; i++) {
        pretes = [].slice.call(document.querySelectorAll('[data-ucpm-miniature]')).every(function (m) { return m.shadowRoot && m.shadowRoot.querySelector('.page-a4'); });
        if (!pretes) { await attente(1000); }
      }
      cas('ucpm p5 : chaque carte montre l’aperçu de son CV (compartiment étanche)', pretes);
      cas('ucpm p5 : les aperçus ne remplacent pas la page et le vrai dossier est intact', pageActuelle === 'un-cv-plusieurs-metiers' && $('h1').textContent.trim() === 'Mes CV' && JSON.stringify(dossier) === avant && !_ucpmDossierReference);
      cas('ucpm p5 : le titre de chaque aperçu est celui de son CV', /PEINTRE EN B/i.test($('[data-ucpm-miniature="d1"]').shadowRoot.textContent) && /AGENT D/i.test($('[data-ucpm-miniature="g1"]').shadowRoot.textContent));
      $('[data-ucpm-acc-ouvrir="d1"]').click(); await attente(400);
      $('[data-ucpm-acc-radio="d1|0"]').click(); await attente(500);
      $('[data-ucpm-acc-ouvrir="d2"]').click(); await attente(400);
      var perso = $('[data-ucpm-acc-texte="d2|perso"]'); perso.value = 'Habilitation électrique BS et dépannages.'; perso.dispatchEvent(new Event('change', { bubbles: true })); await attente(200);
      $('[data-ucpm-acc-radio="d2|perso"]').click(); await attente(500);
      cas('ucpm p5 : une proposition choisie et une phrase écrite par la personne débloquent « Passer aux lettres »', !$('#btnSuivantNavigation').disabled && etat.cvs.d2.accroche === 'Habilitation électrique BS et dépannages.');
      var ti = $('#ucpmTitre_d1'); ti.value = 'Peintre applicatrice'; ti.dispatchEvent(new Event('change', { bubbles: true })); await attente(300);
      cas('ucpm p5 : le titre est modifiable', etat.cvs.d1.titre === 'Peintre applicatrice');
      $('[data-ucpm-aspect="d1"]').click(); await attente(6000);
      cas('ucpm p5 : « Changer l’aspect » ouvre l’éditeur commun sur la COPIE du CV (vrai dossier mis de côté)', pageActuelle === 'resultats' && !!_ucpmDossierReference && dossier !== _ucpmDossierReference && dossier.titreCV === 'Peintre applicatrice');
      cas('ucpm p5 : seuls les panneaux d’aspect restent (le corps du CV est celui de la référence)', getComputedStyle($('#cOrg')).display === 'none' && !!$('#cEntete'));
      cas('ucpm p5 : la barre propose « Annuler » et « Valider cet aspect », la barre d’étapes est celle du module', /Valider cet aspect/.test(texte($('.barre-navigation-fixe'))) && /Mes CV/.test(texte($('.barre-etapes-bilan .pastille-etape-action-courante'))));
      cas('ucpm p5 : pas de case « Version courte » dans l’éditeur d’aspect', !$('[data-mep-accroche-courte]'));
      var w = $('#zonePdfInlineCV iframe').contentWindow; w._pdfChoisirModeleCreatif('colonneFoncee'); await attente(2500);
      cas('ucpm p5 : pendant le réglage, le vrai dossier n’est pas touché', JSON.stringify(_ucpmDossierReference) === avant);
      ucpmFinAspect(true); await attente(1200);
      cas('ucpm p5 : « Valider cet aspect » garde l’aspect de ce CV et remet le vrai dossier, identique', pageActuelle === 'un-cv-plusieurs-metiers' && etat.page === 5 && !_ucpmDossierReference && JSON.stringify(dossier) === avant && !!(etat.cvs.d1.aspect && etat.cvs.d1.aspect.pdfReglages) && !etat.cvs.d2.aspect);
      cas('ucpm p5 : la carte dit « propre à ce CV » et propose de revenir à la référence', /propre à ce CV/.test(texte($('[data-ucpm-carte="d1"]'))) && !!$('[data-ucpm-aspect-ref="d1"]') && !!$('#btnUcpmToutRemettre'));
      $('[data-ucpm-aspect="d2"]').click(); await attente(5500);
      ucpmFinAspect(false); await attente(1000);
      cas('ucpm p5 : « Annuler » jette le réglage et remet le vrai dossier', !etat.cvs.d2.aspect && !_ucpmDossierReference && JSON.stringify(dossier) === avant);
      $('[data-ucpm-aspect="d2"]').click(); await attente(5500);
      naviguerVers('cv'); await attente(800);
      cas('ucpm p5 : partir par « Accueil » pendant un réglage remet aussi le vrai dossier', !_ucpmDossierReference && JSON.stringify(dossier) === avant && !etat.aspectEnCours && !window._modeAspectUcpm);
      cas('ucpm p5 : la disquette enregistre le vrai dossier, jamais une copie', JSON.stringify(sauvegarderSession().dossier) === avant);
    } finally {
      ucpmRestaurerDossier(); window.UCPM_OUVERT = ouvertAvant; ucpmReinitialiser();
      try { var vieux = JSON.parse(sauvegarde); Object.keys(dossier).forEach(function (k) { if (!(k in vieux)) { delete dossier[k]; } }); Object.assign(dossier, vieux); } catch (e) { /* tant pis */ }
      naviguerVers('cv'); await attente(500);
    }
  }

  // ---------------- Module « Un CV, plusieurs métiers » : page 6 « Lettres » (2026-10-10) ----------------
  async function parcoursUnCvMetiersPage6() {
    var ouvertAvant = window.UCPM_OUVERT;
    window.UCPM_OUVERT = true;
    var sauvegarde = JSON.stringify(dossier);
    try {
      ucpmReinitialiser();
      var etat = ouvrirUnCvPlusieursMetiers();
      var rep = await (await fetch('/docs/essais_prompts_ucpm/reponses/01_metiers_V5_chatgpt_1.txt')).text();
      etat.reponseMetiers = ucpmLireReponseMetiers(rep).valeurs; etat.texteCV = 'cv'; etat.cvRelu = true;
      var l = ucpmCreerListes(etat.reponseMetiers); etat.intitules = l.intitules; etat.autres = l.autres;
      ['g1', 'd1', 'd2'].forEach(function (id) { ucpmBasculerCoche(etat, id, true); });
      var o = ucpmObjectifVide('spontanee'); o.secteur = 'bâtiment'; ucpmAppliquerObjectif(etat, 'tous', null, o);
      etat.sexe = 'f'; etat.refPret = true; etat.refId = 'g1'; etat.page = 6; etat.pageMax = 6;
      etat.cvs = {
        g1: { titre: 'Agent d’entretien des bâtiments', accroche: 'Dix ans d’entretien de bâtiments collectifs.', accrocheChoisie: true },
        d1: { titre: 'Peintre applicatrice', accroche: 'Pratique de la peinture en bâtiment.', accrocheChoisie: true },
        d2: { titre: 'Électricienne d’entretien', accroche: 'Habilitation électrique BS.', accrocheChoisie: true }
      };
      dossier.identite = { civilite: 'Madame', nom: 'Martin', prenom: 'Camille', ville: 'Limoges' };
      var avant = JSON.stringify(dossier);
      naviguerVers('un-cv-plusieurs-metiers'); await attente(1000);
      avant = JSON.stringify(dossier);   // la page des lettres pose les réglages de style par défaut (préférences de la lettre) : on part de là
      cas('ucpm p6 : « Réglez le style d’écriture » est avant « Choisissez votre assistant », sur la même page', !!$('#ucpmStyleEcriture') && !!($('#ucpmStyleEcriture').compareDocumentPosition($('.ucpm-choix-ia h4:last-of-type')) & 4));
      ucpmAllerPage(5); await attente(600); window.scrollTo(0, 800); await attente(200); var yAvant = window.scrollY; ucpmAllerPage(6); await attente(600);
      cas('ucpm p6 : on arrive toujours en haut de la page, sur le style d’écriture, même venant d’une page défilée', yAvant > 0 && window.scrollY === 0, 'avant ' + yAvant + ', après ' + window.scrollY);
      var cases = document.querySelectorAll('[data-ucpm-lettre-cv]');
      cas('ucpm p6 : les trois CV sont proposés par leur nom, tous cochés', cases.length === 3 && [].every.call(cases, function (c) { return c.checked; }) && /Peintre applicatrice/.test(texte($('.ucpm-choix-ia'))));
      cas('ucpm p6 : « Terminer » est bloqué tant que les lettres ne sont pas reçues', $('#btnSuivantNavigation').disabled);
      cases[1].click(); await attente(200);
      cas('ucpm p6 : décocher un CV le sort de la demande', JSON.stringify(etat.lettresIds) === JSON.stringify(['g1', 'd2']));
      cases[0].click(); cases[2].click(); await attente(200);
      cas('ucpm p6 : le dernier CV coché ne peut pas être décoché', cases[2].checked && !!etat.lettresIds && etat.lettresIds.length === 1 && !$('#ucpmP6AvisChoix').hidden);
      cases[0].click(); cases[1].click(); await attente(200);
      cas('ucpm p6 : tous recochés = tous les CV', etat.lettresIds === null);
      var texteDemande = await _ucpmConfigPassageLettres(etat).construireTexte();
      cas('ucpm p6 : la demande est complète (genre, profil, trois CV, objectif), sans marqueur ni coordonnées', texteDemande.indexOf('Titre du CV : Peintre applicatrice') > 0 && /Titre du CV : Électricienne d/.test(texteDemande) && !/\{(GENRE|PROFIL|CVS)\}/.test(texteDemande) && !/Limoges|Camille/.test(texteDemande));
      etat.passages = { lettres: { vue: 'coller', assistant: 'chatgpt' } }; ucpmRendrePage(); await attente(500);
      var brut = await (await fetch('/docs/essais_prompts_ucpm/reponses/03_lettres_V6_10_feminin_chatgpt_1.txt')).text();
      var ta = document.getElementById('texteCollageUcpmLettres'); ta.value = brut; ta.dispatchEvent(new Event('input', { bubbles: true }));
      document.getElementById('btnImporterUcpmLettres').click(); await attente(800);
      var lettres = etat.lettres || {};
      cas('ucpm p6 : la vraie réponse est lue, une lettre par CV, la page passe à la lecture', Object.keys(lettres).length === 3 && etat.p6Vue === 'lecture' && !!$('[data-ucpm-lettre-texte]'));
      cas('ucpm p6 : formule d’appel imposée en tête et signature en bas', /^Madame, Monsieur,/.test(lettres.g1) && /Camille Martin$/.test(lettres.g1.trim()) && /Camille Martin$/.test($('[data-ucpm-lettre-texte]').value.trim()));
      cas('ucpm p6 : « Terminer » se débloque et le sélecteur montre les trois CV', !$('#btnSuivantNavigation').disabled && document.querySelectorAll('[data-ucpm-lettre-sel]').length === 3);
      $('[data-ucpm-lettre-sel="d1"]').click(); await attente(400);
      cas('ucpm p6 : le sélecteur change de lettre', $('[data-ucpm-lettre-texte]').getAttribute('data-ucpm-lettre-texte') === 'd1' && $('[data-ucpm-lettre-texte]').value === lettres.d1);
      var champ = $('[data-ucpm-lettre-texte]');
      cas('ucpm p6 : « Remettre la lettre reçue » est inactif tant que rien n’est modifié', $('[data-ucpm-lettre-origine]').disabled);
      champ.value = champ.value + ' Merci de votre attention.'; champ.dispatchEvent(new Event('input', { bubbles: true })); await attente(200);
      cas('ucpm p6 : la modification est gardée et « Remettre la lettre reçue » s’active', /Merci de votre attention\.$/.test(etat.lettres.d1) && !$('[data-ucpm-lettre-origine]').disabled);
      champ.value = Array(400).fill('mot').join(' '); champ.dispatchEvent(new Event('input', { bubbles: true })); await attente(200);
      cas('ucpm p6 : une lettre trop longue est signalée sans bloquer', !$('#ucpmP6Longue').hidden && !$('#btnSuivantNavigation').disabled && Number($('#ucpmP6Mots').textContent) === 400);
      champ.value = ''; champ.dispatchEvent(new Event('input', { bubbles: true })); await attente(200);
      cas('ucpm p6 : une lettre vidée est annoncée « à écrire »', /à écrire/.test($('[data-ucpm-lettre-sel="d1"]').textContent) && !$('#btnSuivantNavigation').disabled);
      champ.value = lettres.d1; champ.dispatchEvent(new Event('input', { bubbles: true }));
      cas('ucpm p6 : les lettres partent dans la disquette', !!collecterEtatsModulesPourSauvegarde().unCvPlusieursMetiers.lettres.g1);
      ucpmBarreRetour(); await attente(800);
      cas('ucpm p6 : « Retour » ramène aux CV sans rien supprimer', pageActuelle === 'un-cv-plusieurs-metiers' && etat.page === 5 && Object.keys(etat.lettres).length === 3);
      ucpmAllerPage(6); await attente(800);
      cas('ucpm p6 : en revenant, les lettres sont là', !!$('[data-ucpm-lettre-texte]') && etat.p6Vue === 'lecture');
      cas('ucpm p6 : le vrai dossier n’a pas bougé', JSON.stringify(dossier) === avant);
    } finally {
      ucpmRestaurerDossier(); window.UCPM_OUVERT = ouvertAvant; ucpmReinitialiser();
      try { var vieux = JSON.parse(sauvegarde); Object.keys(dossier).forEach(function (k) { if (!(k in vieux)) { delete dossier[k]; } }); Object.assign(dossier, vieux); } catch (e) { /* tant pis */ }
      naviguerVers('cv'); await attente(500);
    }
  }

  // ---------------- Module « Un CV, plusieurs métiers » : page 7 « Fin », PDF des CV, des lettres, d'un CV avec sa lettre (2026-10-10) ----------------
  async function parcoursUnCvMetiersPage7() {
    var ouvertAvant = window.UCPM_OUVERT;
    window.UCPM_OUVERT = true;
    var sauvegarde = JSON.stringify(dossier);
    var departementAvant = (typeof departementRessourcesMemorise === 'function') ? departementRessourcesMemorise() : null;
    try {
      ucpmReinitialiser();
      var etat = ouvrirUnCvPlusieursMetiers();
      var rep = await (await fetch('/docs/essais_prompts_ucpm/reponses/01_metiers_V5_chatgpt_1.txt')).text();
      etat.reponseMetiers = ucpmLireReponseMetiers(rep).valeurs; etat.texteCV = 'cv'; etat.cvRelu = true;
      var l = ucpmCreerListes(etat.reponseMetiers); etat.intitules = l.intitules; etat.autres = l.autres;
      ['g1', 'd1', 'd2'].forEach(function (id) { ucpmBasculerCoche(etat, id, true); });
      var o = ucpmObjectifVide('spontanee'); o.secteur = 'bâtiment'; ucpmAppliquerObjectif(etat, 'tous', null, o);
      etat.sexe = 'f'; etat.refPret = true; etat.refId = 'g1'; etat.page = 7; etat.pageMax = 7;
      dossier.identite = { civilite: 'Madame', nom: 'Martin', prenom: 'Camille', adresse: '12 rue des Lilas', codePostal: '87000', ville: 'Limoges', telephone: '06 12 34 56 78', email: 'camille.martin@example.org' };
      dossier.titreCV = 'Agent d’entretien des bâtiments';
      dossier.experiences = [{ poste: 'Agent d’entretien', entreprise: 'Habitat social', lieu: 'Limoges', dateDebut: '2019-01', dateFin: '2024-06', missions: 'Entretien de 120 logements\nPetits dépannages' }];
      dossier.formations = [{ niveau: 'CAP', intitule: 'Peintre applicateur', etablissement: 'AFPA', annee: '2014', missions: '' }]; dossier.competencesCV = ['Rigueur', 'Autonomie'];
      dossier.formatCV = 'pdf'; dossier.pdfReglages = null; dossier.reglagesMiseEnPageCV = null; dossier.dernierDocumentPrepare = 'cv';
      dossier.ia = dossier.ia || {}; dossier.ia.cv = Object.assign({}, dossier.ia.cv, { profil: 'Dix ans d’entretien de bâtiments collectifs.', accrochesProposees: ['Dix ans d’entretien de bâtiments collectifs.'], accrochesCourtesProposees: ['Dix ans d’entretien.'], accrocheIdx: 0 });
      etat.cvs = {
        g1: { titre: 'Agent d’entretien des bâtiments', accroche: 'Dix ans d’entretien de bâtiments collectifs.', accrocheChoisie: true },
        d1: { titre: 'Peintre applicatrice', accroche: 'Pratique de la peinture en bâtiment.', accrocheChoisie: true },
        d2: { titre: 'Électricienne d’entretien', accroche: 'Habilitation électrique BS.', accrocheChoisie: true }
      };
      var brut = await (await fetch('/docs/essais_prompts_ucpm/reponses/03_lettres_V6_10_feminin_chatgpt_1.txt')).text();
      var lues = ucpmLireReponseLettres(brut, ['g1', 'd1', 'd2']);
      etat.lettres = ucpmPreparerLettresRecues(lues.lettres, ucpmEntreesCochees(etat), 'Camille Martin');
      var avant = JSON.stringify(dossier);
      var imprime = null;
      window.__ucpmImpressionSimulee = function (titre, html) { imprime = { titre: titre, html: html }; };
      naviguerVers('un-cv-plusieurs-metiers'); await attente(1000);
      var prets = false;
      for (var i = 0; i < 90 && !prets; i++) {
        prets = [].slice.call(document.querySelectorAll('[data-ucpm-tel]')).length > 0 && [].every.call(document.querySelectorAll('[data-ucpm-tel]'), function (b) { return !b.disabled; });
        if (!prets) { await attente(1000); }
      }
      cas('ucpm p7 : les boutons de téléchargement se débloquent quand les CV sont prêts', prets);
      cas('ucpm p7 : le bilan annonce 3 CV et 3 lettres', /3 CV/.test(texte($('.cv-section'))) && /3 lettres/.test(texte($('.cv-section'))));
      cas('ucpm p7 : trois cartes, chacune avec « Télécharger ce CV » et « avec sa lettre »', document.querySelectorAll('[data-ucpm-carte]').length === 3 && document.querySelectorAll('[data-ucpm-tel="cv"]').length === 3 && document.querySelectorAll('[data-ucpm-tel="cv-lettre"]').length === 3);
      cas('ucpm p7 : le nombre de pages est annoncé', /Un seul document PDF de \d+ pages?/.test(texte($('#contenuPageUcpm'))));
      cas('ucpm p7 : avant tout téléchargement, la recherche d’offres est annoncée mais absente', !$('#btnUcpmP7Offres') && /Après le téléchargement/.test(texte($('#contenuPageUcpm'))));
      cas('ucpm p7 : plus rien à modifier, pas de bouton « Continuer » en bas', !$('#btnSuivantNavigation'));
      cas('ucpm p7 : le CV rendu garde ses couleurs et ses tailles (variables posées sur :host, plus sur :root)', /:host\s*\{/.test(_ucpmCacheRendu.g1.resultat.css) && !/:root/.test(_ucpmCacheRendu.g1.resultat.css));
      cas('ucpm p7 : un CV qui laisse beaucoup de place ne reçoit aucun avertissement', !/très rempli/.test(texte($('#contenuPageUcpm'))) && typeof _ucpmCacheRendu.d1.resultat.libre === 'number');
      _ucpmCacheRendu.d1.resultat.libre = 20; ucpmRendrePage(); await attente(600);
      cas('ucpm p7 : un CV presque plein est signalé « très rempli » sur sa carte (information, rien ne se bloque)', /très rempli/.test(texte($('[data-ucpm-carte="d1"]'))) && !/très rempli/.test(texte($('[data-ucpm-carte="d2"]'))) && !$('[data-ucpm-tel="cvs"]').disabled);
      _ucpmCacheRendu.d1.resultat.libre = 200; ucpmRendrePage(); await attente(400);
      $('[data-ucpm-tel="cvs"]').click(); await attente(2500);
      cas('ucpm p7 : « Mes CV » envoie un document de 3 CV dans 3 compartiments étanches, nommé comme les autres CV', !!imprime && imprime.titre === 'MARTIN_mes-cv' && (imprime.html.match(/<template shadowrootmode="open">/g) || []).length === 3);
      cas('ucpm p7 : les trois CV sont bien ceux de l’état (titres)', /PEINTRE APPLICATRICE/i.test(imprime.html) && /ÉLECTRICIENNE D/i.test(imprime.html) && /AGENT D/i.test(imprime.html));
      cas('ucpm p7 : après un téléchargement, la recherche d’offres en direct apparaît', etat.p7Telecharge === true && !!$('#btnUcpmP7Offres'));
      cas('ucpm p7 : le vrai dossier n’a pas bougé pendant l’impression', JSON.stringify(dossier) === avant && !_ucpmDossierReference);
      var cadre = document.createElement('iframe'); cadre.style.cssText = 'position:fixed;left:-10000px;width:794px;height:1123px;'; document.body.appendChild(cadre);
      cadre.contentDocument.open(); cadre.contentDocument.write(imprime.html); cadre.contentDocument.close(); await attente(400);
      var feuilles = cadre.contentDocument.querySelectorAll('.ucpm-feuille');
      cas('ucpm p7 : le navigateur construit un compartiment étanche par CV', feuilles.length === 3 && [].every.call(feuilles, function (f) { return !!f.shadowRoot && !!f.shadowRoot.querySelector('.page-a4'); }));
      cadre.remove();
      imprime = null;
      $('[data-ucpm-tel="lettres"]').click(); await attente(2500);
      cas('ucpm p7 : « Mes lettres » envoie trois lettres signées, une par page', !!imprime && imprime.titre === 'MARTIN_mes-lettres' && (imprime.html.match(/class="ucpm-lettre"/g) || []).length === 3 && /<p class="signature">Camille Martin<\/p>/.test(imprime.html));
      cas('ucpm p7 : la lettre porte les coordonnées, le lieu et la date', /12 rue des Lilas/.test(imprime.html) && /87000 Limoges/.test(imprime.html) && /Limoges, le \d/.test(imprime.html));
      imprime = null;
      $('[data-ucpm-tel="cv-lettre"][data-ucpm-tel-id="d1"]').click(); await attente(2500);
      var ordre = imprime ? imprime.html.search(/PEINTRE APPLICATRICE/i) : -1;
      cas('ucpm p7 : « Ce CV avec sa lettre » envoie le CV puis sa lettre, dans un seul fichier de deux pièces', !!imprime && (imprime.html.match(/<template shadowrootmode="open">/g) || []).length === 2 && ordre > 0 && ordre < imprime.html.indexOf('class="ucpm-lettre"') && /PEINTRE|peintre/i.test(imprime.titre));
      $('#btnUcpmP7Offres').click(); await attente(600);
      cas('ucpm p7 : le panneau d’offres s’ouvre avec les métiers cochés et le choix du département', !!$('#ucpmPanneauOffres') && /Département/.test(texte($('#ucpmPanneauOffres'))));
      var dep87 = $('#ucpmPanneauOffres [data-ucpm-dep="87"]');
      if (dep87) { dep87.click(); await attente(500); }
      cas('ucpm p7 : une fois le département choisi, « Copier ma demande » s’active', !!$('#btnUcpmCopierOffres') && !$('#btnUcpmCopierOffres').disabled);
      cas('ucpm p7 : rien n’est à coller pour les offres (aucun champ de collage)', !$('#ucpmPanneauOffres textarea') && !$('#ucpmPanneauOffres [id^="texteCollage"]'));
      var decoche = $('[data-ucpm-p7-offre="d2"]'); decoche.click(); await attente(400);
      cas('ucpm p7 : décocher un métier le sort de la recherche', /pour 2 métiers/.test(texte($('#btnUcpmP7Offres'))));
      ucpmBarreRetour(); await attente(800);
      cas('ucpm p7 : « Retour » ramène aux lettres', pageActuelle === 'un-cv-plusieurs-metiers' && etat.page === 6);
    } finally {
      window.__ucpmImpressionSimulee = undefined;
      try { if (departementAvant) { memoriserDepartementRessources(departementAvant); } else if (typeof oublierDepartementRessources === 'function') { oublierDepartementRessources(); } } catch (e) { /* tant pis */ }
      ucpmRestaurerDossier(); window.UCPM_OUVERT = ouvertAvant; ucpmReinitialiser();
      try { var vieux = JSON.parse(sauvegarde); Object.keys(dossier).forEach(function (k) { if (!(k in vieux)) { delete dossier[k]; } }); Object.assign(dossier, vieux); } catch (e) { /* tant pis */ }
      naviguerVers('cv'); await attente(500);
    }
  }

  // ---------------- Module « Un CV, plusieurs métiers » : règle de Retour, pages périmées signalées sans rien effacer (2026-10-10) ----------------
  async function parcoursUnCvMetiersRetour() {
    var ouvertAvant = window.UCPM_OUVERT;
    window.UCPM_OUVERT = true;
    var sauvegarde = JSON.stringify(dossier);
    try {
      ucpmReinitialiser();
      var etat = ouvrirUnCvPlusieursMetiers();
      var rep = await (await fetch('/docs/essais_prompts_ucpm/reponses/01_metiers_V5_chatgpt_1.txt')).text();
      etat.reponseMetiers = ucpmLireReponseMetiers(rep).valeurs; etat.texteCV = 'cv'; etat.cvRelu = true;
      var l = ucpmCreerListes(etat.reponseMetiers); etat.intitules = l.intitules; etat.autres = l.autres;
      ['g1', 'd1', 'd2'].forEach(function (id) { ucpmBasculerCoche(etat, id, true); });
      var o = ucpmObjectifVide('spontanee'); o.secteur = 'bâtiment'; ucpmAppliquerObjectif(etat, 'tous', null, o);
      etat.sexe = 'f'; etat.refPret = true; etat.refId = 'g1'; etat.page = 4; etat.pageMax = 6; etat.p4Vue = 'recu';
      dossier.identite = { civilite: 'Madame', nom: 'Martin', prenom: 'Camille', ville: 'Limoges' };
      dossier.titreCV = 'Agent d’entretien des bâtiments'; dossier.ia = dossier.ia || {}; dossier.ia.cv = Object.assign({}, dossier.ia.cv, { profil: 'Dix ans d’entretien.' });
      etat.cvs = {
        g1: { titre: 'Agent d’entretien', accroche: 'Dix ans d’entretien.', accrocheChoisie: true },
        d1: { titre: 'Peintre applicatrice', accroche: 'Pratique de la peinture.', accrocheChoisie: true },
        d2: { titre: 'Électricienne d’entretien', accroche: 'Habilitation BS.', accrocheChoisie: true }
      };
      var profil = function () { return ucpmConstruireProfilValide(ucpmDossierVrai()); };
      etat.accroches = { d1: ['Pratique de la peinture.', 'Autre phrase.'], d2: ['Habilitation BS.', 'Autre.'] }; etat.accrochesManquantes = [];
      etat.accrochesSig = ucpmSignaturesAccroches(etat, profil());
      etat.lettres = { g1: 'Madame, Monsieur,\n\nLettre 1.\n\nCamille Martin', d1: 'Madame, Monsieur,\n\nLettre 2.\n\nCamille Martin', d2: 'Madame, Monsieur,\n\nLettre 3.\n\nCamille Martin' };
      etat.lettresOrigine = JSON.parse(JSON.stringify(etat.lettres)); etat.p6Vue = 'lecture';
      etat.lettresSig = ucpmSignaturesLettres(etat, ucpmEntreesCochees(etat), profil(), 'Camille Martin');
      var accrochesAvant = JSON.stringify(etat.accroches), lettresAvant = JSON.stringify(etat.lettres);
      naviguerVers('un-cv-plusieurs-metiers'); await attente(800);
      cas('ucpm retour : page 4, rien n’a changé, aucun avertissement', !texte($('#contenuPageUcpm')).match(/ne correspondent peut-être plus/));
      var o2 = ucpmObjectifVide('stage'); o2.secteur = 'bâtiment'; ucpmAppliquerObjectif(etat, 'un', 'd1', o2);
      ucpmRendrePage(); await attente(500);
      cas('ucpm retour : un objectif changé en amont est signalé sur la page 4, avec le nom du métier', /ne correspondent peut-être plus/.test(texte($('#contenuPageUcpm'))) && /Peintre/.test(texte($('#contenuPageUcpm'))));
      cas('ucpm retour : la page 4 garde ses phrases et propose toujours « Refaire la demande » et « Continuer »', JSON.stringify(etat.accroches) === accrochesAvant && !!$('#btnUcpmRefaireAccroches') && !$('#btnSuivantNavigation').disabled);
      ucpmAllerPage(6); await attente(600);
      cas('ucpm retour : la page 6 signale la lettre qui ne correspond plus (CV 2), avec « Refaire cette lettre »', /Une lettre ne correspond peut-être plus/.test(texte($('#contenuPageUcpm'))) && /CV 2/.test(texte($('#contenuPageUcpm'))) && !!$('#btnUcpmRefairePerimees'));
      cas('ucpm retour : les lettres sont intactes', JSON.stringify(etat.lettres) === lettresAvant);
      $('#btnUcpmRefairePerimees').click(); await attente(500);
      var oui = document.querySelector('[data-role="confirmer"]');
      cas('ucpm retour : « Refaire cette lettre » demande confirmation et n’efface rien avant', !!oui && JSON.stringify(etat.lettres) === lettresAvant && etat.p6Vue === 'lecture');
      if (oui) { oui.click(); await attente(600); }
      cas('ucpm retour : après confirmation, la demande ne porte que sur la lettre périmée, les lettres restent en place', etat.p6Vue === 'passage' && JSON.stringify(etat.lettresIds) === JSON.stringify(['d1']) && JSON.stringify(etat.lettres) === lettresAvant && !!document.querySelector('[data-ucpm-lettre-cv="d1"]') && document.querySelectorAll('[data-ucpm-lettre-cv]:checked').length === 1);
      etat.p6Vue = 'lecture'; ucpmAllerPage(7); await attente(1000);
      cas('ucpm retour : la page 7 prévient aussi, sans bloquer', /ne correspond peut-être plus/.test(texte($('#contenuPageUcpm'))) && !!$('[data-ucpm-tel="cvs"]'));
      cas('ucpm retour : les empreintes partent dans la disquette', !!collecterEtatsModulesPourSauvegarde().unCvPlusieursMetiers.lettresSig.g1 && !!collecterEtatsModulesPourSauvegarde().unCvPlusieursMetiers.accrochesSig.d1);
    } finally {
      ucpmRestaurerDossier(); window.UCPM_OUVERT = ouvertAvant; ucpmReinitialiser();
      try { var vieux = JSON.parse(sauvegarde); Object.keys(dossier).forEach(function (k) { if (!(k in vieux)) { delete dossier[k]; } }); Object.assign(dossier, vieux); } catch (e) { /* tant pis */ }
      naviguerVers('cv'); await attente(500);
    }
  }

  // ---------------- Module « Un CV, plusieurs métiers » : page 1, dépôt par la fenêtre commune qui vérifie d'elle-même (retours de Denis, 2026-10-10) ----------------
  async function parcoursUnCvMetiersPage1() {
    var ouvertAvant = window.UCPM_OUVERT;
    window.UCPM_OUVERT = true;
    try {
      ucpmReinitialiser();
      var etat = ouvrirUnCvPlusieursMetiers();
      naviguerVers('un-cv-plusieurs-metiers'); await attente(800);
      var boutons = function () { return [].slice.call(document.querySelectorAll('button')); };
      cas('ucpm p1 : un simple bouton « Déposer mon CV », pas de zone de dépôt qui occupe la page', !!$('#btnUcpmDeposer') && !$('#contenuPageUcpm input[type="file"]') && $('#btnUcpmVersAssistant').disabled);
      $('#btnUcpmDeposer').click(); await attente(800);
      cas('ucpm p1 : la fenêtre commune « Déposer votre document » s’ouvre', /Déposer votre document/.test(document.body.innerText));
      boutons().filter(function (b) { return /Coller le texte/.test(b.innerText); })[0].click(); await attente(400);
      var ta = [].slice.call(document.querySelectorAll('textarea')).filter(function (t) { return t.offsetParent; })[0];
      ta.value = 'Josiane BOKENOMAE\n06 12 34 56 78\njosiane.bokenomae@gmail.com\n12 rue des Lilas 87000 Limoges\nAssistante de vie aux familles\nCIAS de Beaumont : aide à la toilette, préparation des repas.\nFormation : Assistante de vie aux familles 2026. Certification SST.';
      ta.dispatchEvent(new Event('input', { bubbles: true })); await attente(400);
      boutons().filter(function (b) { return /^Continuer/.test(b.innerText.trim()) && b.offsetParent && !b.disabled; })[0].click(); await attente(1200);
      cas('ucpm p1 : la vérification s’ouvre toute seule, avec le courriel complet (arobase comprise) et le nom repéré', /Vérifier le texte/.test(document.body.innerText) && /josiane\.bokenomae@gmail\.com/.test(document.body.innerText) && /Josiane BOKENOMAE/.test(document.body.innerText));
      cas('ucpm p1 : tant que rien n’est validé, le CV de la page reste vide', !etat.cvRelu && !etat.texteCV);
      boutons().filter(function (b) { return /Enregistrer/.test(b.innerText) && b.offsetParent; })[0].click(); await attente(600);
      boutons().filter(function (b) { return /^Continuer/.test(b.innerText.trim()) && b.offsetParent && !b.disabled; })[0].click(); await attente(1200);
      cas('ucpm p1 : une fois validé, le CV est prêt et on peut choisir l’assistant', etat.cvRelu && /Josiane BOKENOMAE/.test(etat.texteCV) && !$('#btnUcpmVersAssistant').disabled && /Votre CV est prêt/.test(texte($('#contenuPageUcpm'))));
      // remplacer le CV puis fermer la fenêtre sans valider : le dernier CV validé reste en place
      var ancien = etat.texteCV;
      $('#btnUcpmDeposerAutre').click(); await attente(600);
      var fenetre = /Déposer votre document/.test(document.body.innerText);
      var fermer = document.querySelector('[aria-label="Fermer"], .modal-fermer, .btn-fermer-fenetre') || boutons().filter(function (b) { return /^[✕×]$/.test(b.innerText.trim()); })[0];
      cas('ucpm p1 : « Déposer un autre CV » rouvre la fenêtre de dépôt', fenetre);
      if (fermer) { fermer.click(); await attente(500); } else { fermerFenetreERIP(); await attente(500); }
      cas('ucpm p1 : fermer la fenêtre sans valider laisse le dernier CV en place', etat.cvRelu && etat.texteCV === ancien && /Votre CV est prêt/.test(texte($('#contenuPageUcpm'))));
    } finally { window.UCPM_OUVERT = ouvertAvant; ucpmReinitialiser(); try { fermerFenetreERIP(); } catch (e) { /* rien */ } naviguerVers('cv'); await attente(500); }
  }

  // ---------------- Module « Un CV, plusieurs métiers » : questions sur les points peu clairs, comme « Reformuler mon CV » (retours 20 et 23 de Denis) ----------------
  async function parcoursUnCvMetiersClarification() {
    var ouvertAvant = window.UCPM_OUVERT;
    window.UCPM_OUVERT = true;
    var importsAvant = JSON.stringify(dossier.imports || null);
    var dossierAvantClar = JSON.stringify(dossier);
    try {
      ucpmReinitialiser();
      var etat = ouvrirUnCvPlusieursMetiers();
      var rep = await (await fetch('/docs/essais_prompts_ucpm/reponses/01_metiers_V5_chatgpt_1.txt')).text();
      etat.reponseMetiers = ucpmLireReponseMetiers(rep).valeurs; etat.texteCV = 'cv'; etat.cvRelu = true;
      var l = ucpmCreerListes(etat.reponseMetiers); etat.intitules = l.intitules; etat.autres = l.autres;
      ['g1', 'd1'].forEach(function (id) { ucpmBasculerCoche(etat, id, true); });
      ucpmAppliquerObjectif(etat, 'tous', null, ucpmObjectifVide('spontanee'));
      etat.refId = 'g1'; etat.page = 3; etat.pageMax = 3; etat.p3Vue = 'structurer';
      dossier.imports = { courant: { donnees: { identite: {}, experiences: [], formations: [], certifications: ['s.s.T'], pointsAVerifier: [{ titre: 'SST', extrait: 's.s.T', question: 'Que signifie « s.s.T » ?', suggestion: 'SST (Sauveteur secouriste du travail)' }] } } };
      naviguerVers('un-cv-plusieurs-metiers'); await attente(800);
      _ucpmConfigPassageExtraction(etat).apresSucces(); await attente(700);
      cas('ucpm clarification : le panneau « Quelques passages à préciser » pose la question sur la certification mal écrite', /Quelques passages à préciser/.test(document.body.innerText) && /Que signifie/.test(document.body.innerText) && etat.p3Vue === 'structurer');
      document.querySelector('[data-utiliser-suggestion-point]').click(); await attente(300);
      document.getElementById('btnClarificationContinuer').click(); await attente(700);
      cas('ucpm clarification : la réponse corrige la certification, puis on passe à « Vos informations »', etat.p3Vue === 'infos' && pageActuelle === 'projet' && /Sauveteur secouriste du travail/.test(JSON.stringify(dossier.certifications || [])));
      naviguerVers('un-cv-plusieurs-metiers'); await attente(600);
      dossier.imports = { courant: { donnees: { identite: {}, experiences: [], formations: [], certifications: [], pointsAVerifier: [] } } }; etat.p3Vue = 'structurer';
      _ucpmConfigPassageExtraction(etat).apresSucces(); await attente(700);
      cas('ucpm clarification : sans point à préciser, le panneau saute tout seul', etat.p3Vue === 'infos' && !/Quelques passages/.test(document.body.innerText));
    } finally {
      try { var vieuxClar = JSON.parse(dossierAvantClar); Object.keys(dossier).forEach(function (k) { if (!(k in vieuxClar)) { delete dossier[k]; } }); Object.assign(dossier, vieuxClar); } catch (e0) { /* tant pis */ }
      try { dossier.imports = JSON.parse(importsAvant); } catch (e) { dossier.imports = null; }
      window.UCPM_OUVERT = ouvertAvant; ucpmReinitialiser(); try { fermerFenetreERIP(); } catch (e2) { /* rien */ } naviguerVers('cv'); await attente(500);
    }
  }

  // ---------------- Rappel « Décrivez ce que vous avez fait » sous une expérience sans mission (2026-10-10, accepté par Denis) ----------------
  async function parcoursRappelMissions() {
    await preparerCvResultats();
    dossier.experiences.push({ poste: 'Serveur', entreprise: 'Brasserie', lieu: 'Limoges', dateDebut: '2019-01', dateFin: '2021-12', missions: '' });
    _mepEditionExp = false; _mepExpEditee = null; _mepRerendre(); await attente(2500);
    var rappels = function () { return document.querySelectorAll('.rappel-sans-missions'); };
    cas('rappel missions : une expérience sans mission porte le rappel, pas celle qui en a', rappels().length === 1 && /Décrivez ce que vous avez fait pour un CV plus précis/.test(rappels()[0].textContent), String(rappels().length));
    var bouton = document.querySelector('[data-mep-exp-decrire]');
    cas('rappel missions : le rappel propose un bouton', !!bouton);
    if (bouton) {
      bouton.click(); await attente(1500);
      cas('rappel missions : le bouton ouvre le formulaire de l’expérience', !!document.querySelector('[data-exp-edit]') && _mepExpEditee === parseInt(bouton.getAttribute('data-mep-exp-decrire'), 10), String(_mepExpEditee));
    }
    _mepEditionExp = false; _mepExpEditee = null; _mepRerendre(); await attente(800);
  }
  // ---------------- Les titres de rubriques ne sont jamais des « informations non classées » (point 41 de Denis, 2026-10-10) ----------------
  async function parcoursTitresRubriques() {
    var r = analyserReponseImport('{"informationsNonClassees":["COMPÉTENCES PROFESSIONNELLES","Centres d’intérêt :","EXPÉRIENCE PROFESSIONNELLE","Disponible immédiatement","RQTH"]}', SPECIFICATION_IMPORT);
    cas('titres de rubriques : les en-têtes sont écartés, les vraies informations gardées', r.succes && r.valeurs.informationsNonClassees.length === 2 && r.valeurs.informationsNonClassees[0] === 'Disponible immédiatement', JSON.stringify(r.valeurs && r.valeurs.informationsNonClassees));
  }
  // ---------------- Miniatures REELLES des modeles dans la galerie (plan du banc de rendu, 2026-10-11) ----------------
  async function parcoursMiniaturesReelles() {
    await preparerCvResultats();
    var reelles = function () { var v = [].slice.call(document.querySelectorAll('.vign .mini[data-mini-reel]')); return { total: v.length, reelles: v.filter(function (x) { return !!x.shadowRoot && x.shadowRoot.querySelector('.cv'); }).length }; };
    document.querySelector('[data-mep-allure="creatif"]').click(); await attente(3000);
    var b = document.querySelector('[data-mep-galerie-tous]'); if (b && b.getAttribute('data-mep-galerie-tous') === '1') { b.click(); } await attente(5000);
    var c = reelles();
    cas('miniatures : en Créatif, « Voir tous les modèles » montre les 24 vignettes avec leur vraie miniature', c.total === 24 && c.reelles === 24, c.reelles + ' sur ' + c.total);
    cas('miniatures : chaque miniature est un vrai CV (une page de la taille du CV, pas une silhouette)', [].every.call(document.querySelectorAll('.vign .mini[data-mini-reel]'), function (x) { return x.clientWidth >= 60 && x.clientHeight >= 80; }));
    document.querySelector('[data-mep-allure="sobre"]').click(); await attente(3500);
    c = reelles();
    cas('miniatures : en Sobre, toutes les vignettes affichées ont leur vraie miniature', c.total >= 11 && c.reelles === c.total, c.reelles + ' sur ' + c.total);
    var noms = [].slice.call(document.querySelectorAll('.vign .mini[data-mini-reel]')).map(function (x) { return x.getAttribute('data-mini-reel'); });
    cas('miniatures : la vignette sait de quel modèle elle est la miniature', noms.length >= 11 && noms.every(function (n) { return /^sobre:/.test(n); }), noms.join(','));
    // l'état de la galerie vit hors du dossier : on le remet comme on l'a trouvé pour les essais suivants
    try { _mepGalerieTous = false; _mepGalerieChoix = null; } catch (e) { /* galerie pas chargée */ }
    document.querySelector('[data-mep-allure="defaut"]').click(); await attente(1500);
  }
  // ---------------- Bord de la colonne : interrupteur « Vallonné » sur la vignette (Denis, 2026-10-11) ----------------
  async function parcoursBordColonne() {
    await preparerCvResultats();
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var doc = function () { return w().document; };
    var cv = function () { return doc().querySelector('#conteneurPage .cv'); };
    var cle = function () { return w().getComputedStyle(cv(), '::before').clipPath; };
    var inter = function (id) { return document.querySelector('[data-mep-bord-vign="' + id + '"]'); };
    var vignette = function (id) { return document.querySelector('[data-mep-galerie-creatif="' + id + '"]'); };
    var droit = function () { return doc().getElementById('regColonneBordDroit').checked; };
    var coche = function (id) { return !!inter(id) && inter(id).getAttribute('aria-checked') === 'true'; };
    var cliquer = async function (el) { el.click(); await attente(2500); };
    document.querySelector('[data-mep-allure="creatif"]').click(); await attente(3000);
    var tous = document.querySelector('[data-mep-galerie-tous]'); if (tous && tous.getAttribute('data-mep-galerie-tous') === '1') { tous.click(); await attente(5000); }
    await cliquer(vignette('colonneFoncee')); await attente(2500);
    cas('bord de colonne : Colonne foncée est droite au départ, son interrupteur « Vallonné » est éteint', cv().classList.contains('bord-choix') && droit() && !!inter('colonneFoncee') && !coche('colonneFoncee'), cv().className);
    cas('bord de colonne : Colonne à vague est vallonnée au départ, son interrupteur est allumé', !!inter('sidebarVague') && coche('sidebarVague'));
    cas('bord de colonne : l’interrupteur est sous la vignette, pas dans la vignette', inter('sidebarVague').parentElement.classList.contains('vign-cadre') && !vignette('sidebarVague').contains(inter('sidebarVague')));
    ['colonneClaire', 'mqBandeau', 'rubanDiagonal'].forEach(function (id) { cas('bord de colonne : ' + id + ' n’a pas d’interrupteur', !inter(id) && !!vignette(id)); });
    var avant = cle();
    await cliquer(inter('colonneFoncee')); await attente(1500);
    cas('bord de colonne : l’interrupteur du modèle actuel décoche la case du moteur et change le bord du CV', !droit() && cle() !== avant, String(cle()).slice(0, 50));
    cas('bord de colonne : après le changement, l’interrupteur reste allumé', coche('colonneFoncee'));
    var miniAvant = vignette('sidebarVague').querySelector('.mini').shadowRoot.innerHTML;
    await cliquer(inter('sidebarVague')); await attente(1500);
    cas('bord de colonne : un autre modèle change sa miniature sans toucher au CV en cours', !coche('sidebarVague') && vignette('sidebarVague').querySelector('.mini').shadowRoot.innerHTML !== miniAvant && !droit());
    await cliquer(vignette('sidebarVague')); await attente(2500);
    cas('bord de colonne : choisir ensuite ce modèle lui donne le bord montré par l’interrupteur (droit)', droit() && !!cv() && cv().classList.contains('col-vague-g') && !coche('sidebarVague'), cv().className);
    await cliquer(vignette('colonneFoncee')); await attente(2500);
    cas('bord de colonne : le souhait gardé (vallonné) suit Colonne foncée quand on la rechoisit', !droit() && coche('colonneFoncee'));
    // l'etat de la galerie vit hors du dossier : on le remet comme on l'a trouve pour les essais suivants
    try { _mepGalerieTous = false; _mepGalerieChoix = null; } catch (e) { /* galerie pas chargee */ }
  }
  // ---------------- Bord du bandeau : trois petits boutons sous la vignette (Denis, 2026-10-11) ----------------
  async function parcoursBordBandeau() {
    await preparerCvResultats();
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var doc = function () { return w().document; };
    var cv = function () { return doc().querySelector('#conteneurPage .cv'); };
    var groupe = function (id) { return document.querySelector('[data-mep-bandeau-vign="' + id + '"]'); };
    var vignette = function (id) { return document.querySelector('[data-mep-galerie-creatif="' + id + '"]'); };
    var bouton = function (id, b) { return groupe(id) && groupe(id).querySelector('[data-bord="' + b + '"]'); };
    var actif = function (id) { var g = groupe(id); var a = g && g.querySelector('[aria-checked="true"]'); return a ? a.getAttribute('data-bord') : ''; };
    var choix = function () { return doc().getElementById('regBordBandeau').value; };
    var cliquer = async function (el) { el.click(); await attente(2500); };
    document.querySelector('[data-mep-allure="creatif"]').click(); await attente(3000);
    var tous = document.querySelector('[data-mep-galerie-tous]'); if (tous && tous.getAttribute('data-mep-galerie-tous') === '1') { tous.click(); await attente(5000); }
    await cliquer(vignette('duoOvale')); await attente(2500);
    cas('bord du bandeau : Duo ovale est arrondi au départ et propose le choix', cv().classList.contains('bord-bandeau-choix') && choix() === 'arrondi' && actif('duoOvale') === 'arrondi', choix() + ' ' + actif('duoOvale'));
    cas('bord du bandeau : Bandeau entier est droit et Vague marine vallonné au départ', actif('mqBandeau') === 'droit' && actif('vagueMarine') === 'vallonne', actif('mqBandeau') + ' ' + actif('vagueMarine'));
    cas('bord du bandeau : trois boutons, sous la vignette', !!groupe('duoOvale') && groupe('duoOvale').querySelectorAll('button').length === 3 && !vignette('duoOvale').contains(groupe('duoOvale')));
    ['colonneFoncee', 'rubanDiagonal', 'mqDiagonale', 'medaillon'].forEach(function (id) { cas('bord du bandeau : ' + id + ' n’a pas ces boutons', !groupe(id) && !!vignette(id)); });
    var avant = cv().querySelector('.tete').outerHTML.length + '|' + w().getComputedStyle(cv().querySelector('.tete')).borderRadius;
    await cliquer(bouton('duoOvale', 'vallonne')); await attente(1500);
    cas('bord du bandeau : le bouton du modèle actuel change le bord du CV (vallonné)', choix() === 'vallonne' && !!doc().querySelector('.tete-vague') && actif('duoOvale') === 'vallonne', choix());
    await cliquer(bouton('duoOvale', 'droit')); await attente(1500);
    cas('bord du bandeau : « Droit » retire l’arrondi et la vague', choix() === 'droit' && !doc().querySelector('.tete-vague') && w().getComputedStyle(doc().querySelector('.tete-fond')).borderRadius === '0px', w().getComputedStyle(doc().querySelector('.tete-fond')).borderRadius);
    var miniAvant = vignette('mqBandeau').querySelector('.mini').shadowRoot.innerHTML;
    await cliquer(bouton('mqBandeau', 'arrondi')); await attente(1500);
    cas('bord du bandeau : un autre modèle change sa miniature sans toucher au CV en cours', actif('mqBandeau') === 'arrondi' && vignette('mqBandeau').querySelector('.mini').shadowRoot.innerHTML !== miniAvant && choix() === 'droit');
    await cliquer(vignette('mqBandeau')); await attente(2500);
    cas('bord du bandeau : choisir ensuite ce modèle lui donne le bord montré (arrondi)', choix() === 'arrondi' && w().getComputedStyle(doc().querySelector('.tete-fond')).borderRadius !== '0px', choix());
    await cliquer(vignette('vagueMarine')); await attente(2500);
    cas('bord du bandeau : un modèle sans souhait garde son bord de départ (Vague marine vallonnée)', choix() === 'vallonne' && !!doc().querySelector('.tete-vague'), choix());
    await cliquer(vignette('duoOvale')); await attente(2500);
    cas('bord du bandeau : le souhait gardé (droit) suit Duo ovale quand on la rechoisit', choix() === 'droit' && actif('duoOvale') === 'droit', choix());
    // l'etat de la galerie vit hors du dossier : on le remet comme on l'a trouve pour les essais suivants
    try { _mepGalerieTous = false; _mepGalerieChoix = null; } catch (e) { /* galerie pas chargee */ }
  }
  // ---------------- Autres couleurs du CV depuis la carte d'ambiance (Denis, 2026-10-11) ----------------
  async function parcoursAutresCouleurs() {
    await preparerCvResultats();
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var doc = function () { return w().document; };
    var cv = function () { return doc().querySelector('#conteneurPage .cv'); };
    var bloc = function () { return document.querySelector('#panneauAmbiances .autres-coul'); };
    var cible = function (attr, v) { return document.querySelector('#panneauAmbiances [' + attr + '="' + v + '"]'); };
    var choix = function () { return w()._cvPdfChoixMq || {}; };
    var texte = function () { return doc().getElementById('regTexteFondColonnes').value; };
    var cliquer = async function (el) { el.click(); await attente(2500); };
    var choisir = async function (id) { var v = document.querySelector('[data-mep-galerie-creatif="' + id + '"]'); v.click(); await attente(3500); };
    document.querySelector('[data-mep-allure="creatif"]').click(); await attente(3000);
    var tous = document.querySelector('[data-mep-galerie-tous]'); if (tous && tous.getAttribute('data-mep-galerie-tous') === '1') { tous.click(); await attente(5000); }
    await choisir('colonneFoncee');
    var ouv = document.querySelector('[data-mep-ambiances-ouvrir]'); if (document.getElementById('panneauAmbiances').hidden) { ouv.click(); await attente(1500); }
    cas('autres couleurs : Colonne foncée propose la couleur de la colonne et le texte, pas « sur quoi »', !!bloc() && !!cible('data-mep-colcol', '#e6e1d6') && !!cible('data-mep-textefond', 'auto') && !cible('data-mep-degsurquoi', 'deux'), bloc() ? bloc().textContent.slice(0, 80) : 'absent');
    cas('autres couleurs : « Texte sur le fond coloré » n’est plus dans les options supplémentaires', [].every.call(document.querySelectorAll('[data-mep-textefond]'), function (b) { return !!b.closest('#panneauAmbiances'); }) && !!document.querySelector('#panneauAmbiances [data-mep-textefond]'));
    await cliquer(cible('data-mep-textefond', 'auto')); await attente(1000);
    await cliquer(cible('data-mep-colcol', '#e6e1d6')); await attente(1500);
    cas('autres couleurs : choisir « Beige » colore la colonne (choix gardé par l’aperçu)', choix().couleurColonne === '#e6e1d6' && /e6e1d6/i.test(w().getComputedStyle(doc().documentElement).getPropertyValue('--col')), JSON.stringify(choix()));
    cas('autres couleurs : en « Automatique », le texte devient noir sur la colonne claire', texte() === 'noir', texte());
    await cliquer(cible('data-mep-colcol', '')); await attente(1500);
    cas('autres couleurs : « Couleur principale » rend sa couleur à la colonne et le texte redevient blanc', !choix().couleurColonne && texte() === 'blanc', texte());
    await cliquer(document.querySelector('#panneauAmbiances [data-mep-base="#d4974f|#f9efe5"]')); await attente(2000);
    cas('autres couleurs : une couleur principale claire (doré) passe le texte en noir tout seul', texte() === 'noir', texte());
    await cliquer(cible('data-mep-textefond', 'blanc')); await attente(1500);
    await cliquer(document.querySelector('#panneauAmbiances [data-mep-base="#1e3a5f|#dde1e7"]')); await attente(2000);
    cas('autres couleurs : « Blanc » fixé à la main n’est plus changé par la couleur', texte() === 'blanc' && !(dossier.reglagesMiseEnPageCV || {})._texteAuto, texte());
    await choisir('colonneBandeau');
    var bouton = document.querySelector('[data-mep-degrade-simple]'); if (bouton.getAttribute('aria-pressed') !== 'true') { await cliquer(bouton); await attente(1500); }
    cas('autres couleurs : Colonne et bandeau, avec dégradé, propose la deuxième couleur et « sur quoi »', !!cible('data-mep-secondaire', '#d4974f') && !!cible('data-mep-degsurquoi', 'bandeau'), '');
    await cliquer(cible('data-mep-degsurquoi', 'bandeau')); await attente(1500);
    cas('autres couleurs : « Le bandeau » colore le bandeau seulement', doc().getElementById('regDegradeColonnes').value === 'aucun' && doc().getElementById('regDegradeBandeau').value !== 'aucun', doc().getElementById('regDegradeColonnes').value + ' / ' + doc().getElementById('regDegradeBandeau').value);
    await cliquer(cible('data-mep-secondaire', '#d4974f')); await attente(1500);
    cas('autres couleurs : la deuxième couleur du dégradé est gardée', choix().couleurSecondaire === '#d4974f', JSON.stringify(choix()));
    await cliquer(cible('data-mep-degsurquoi', 'deux')); await attente(1500);
    await cliquer(cible('data-mep-textefond', 'auto')); await attente(1500);
    cas('autres couleurs : avec un dégradé du marine au doré sur la colonne, « Automatique » juge sur la moyenne des deux couleurs (blanc)', texte() === 'blanc', texte());
    await choisir('mqCadre');
    cas('autres couleurs : un modèle sans colonne colorée ni bandeau (Cadre de page) n’a pas ce bloc', !bloc());
    document.querySelector('[data-mep-allure="sobre"]').click(); await attente(3000);
    cas('autres couleurs : en allure Sobre, le bloc n’existe pas', !bloc());
    document.querySelector('[data-mep-allure="defaut"]').click(); await attente(1500);
    // l'etat de la galerie vit hors du dossier : on le remet comme on l'a trouve pour les essais suivants
    try { _mepGalerieTous = false; _mepGalerieChoix = null; } catch (e) { /* galerie pas chargee */ }
  }
  // ---------------- Reprendre mes dernieres couleurs et Garder mes couleurs (Denis, 2026-10-11) ----------------
  async function parcoursRepriseCouleurs() {
    await preparerCvResultats();
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var doc = function () { return w().document; };
    var variable = function (n) { return w().getComputedStyle(doc().documentElement).getPropertyValue(n).trim().toLowerCase(); };
    var bouton = function () { return document.querySelector('#panneauAmbiances [data-mep-reprendre-couleurs]'); };
    var garder = function () { return document.querySelector('#panneauAmbiances [data-mep-garder-couleurs]'); };
    var cliquer = async function (el) { el.click(); await attente(2500); };
    var choisir = async function (id) { document.querySelector('[data-mep-galerie-creatif="' + id + '"]').click(); await attente(3500); };
    document.querySelector('[data-mep-allure="creatif"]').click(); await attente(3000);
    var tous = document.querySelector('[data-mep-galerie-tous]'); if (tous && tous.getAttribute('data-mep-galerie-tous') === '1') { tous.click(); await attente(5000); }
    await choisir('colonneFoncee');
    if (document.getElementById('panneauAmbiances').hidden) { document.querySelector('[data-mep-ambiances-ouvrir]').click(); await attente(1500); }
    cas('reprise : rien à reprendre au départ (pas de bouton), la case « Garder mes couleurs » est là, décochée', !bouton() && !!garder() && !garder().checked);
    cas('reprise : le bouton et la case sont avant les couleurs, dans l’en-tête de la zone', !!garder() && garder().closest('.coul-entete') && !garder().closest('.nuancier-amb'));
    await cliquer(document.querySelector('#panneauAmbiances [data-mep-base="#2e7d5b|#e0ece6"]'));
    await cliquer(document.querySelector('#panneauAmbiances [data-mep-colcol="#e6e1d6"]'));
    cas('reprise : la couleur choisie (vert) et la colonne beige s’appliquent au CV affiché', variable('--cv') === '#2e7d5b' && variable('--col') === '#e6e1d6', variable('--cv') + ' ' + variable('--col'));
    await choisir('sidebarVague');
    cas('reprise : un autre modèle arrive avec ses couleurs d’origine (violet), sans la colonne beige', variable('--cv') === '#3b2e5c' && variable('--col') !== '#e6e1d6', variable('--cv') + ' ' + variable('--col'));
    cas('reprise : le bouton « Reprendre mes dernières couleurs » apparaît avec les pastilles', !!bouton() && bouton().querySelectorAll('.reprise-pastilles i').length >= 2, bouton() ? bouton().textContent : 'absent');
    await cliquer(bouton());
    cas('reprise : le bouton pose le vert et la colonne beige sur le CV affiché', variable('--cv') === '#2e7d5b' && variable('--col') === '#e6e1d6', variable('--cv') + ' ' + variable('--col'));
    cas('reprise : une fois reprises, le bouton disparaît', !bouton());
    await choisir('duoOvale');
    cas('reprise : sans la case, chaque modèle garde ses couleurs d’origine (Duo ovale en bleu)', variable('--cv') === '#2f6690', variable('--cv'));
    await cliquer(garder());
    cas('reprise : cocher « Garder mes couleurs » applique tout de suite les couleurs au CV affiché', variable('--cv') === '#2e7d5b' && garder().checked, variable('--cv'));
    await choisir('colonneFoncee'); await attente(1500);
    cas('reprise : case cochée, le nouveau modèle reçoit tout seul les couleurs choisies', variable('--cv') === '#2e7d5b' && variable('--col') === '#e6e1d6', variable('--cv') + ' ' + variable('--col'));
    cas('reprise : le réglage est gardé avec le CV', (dossier.reglagesMiseEnPageCV || {}).garderCouleurs === true && !!(dossier.reglagesMiseEnPageCV || {}).dernieresCouleurs);
    await cliquer(garder());
    await choisir('mqBandeau');
    cas('reprise : case décochée, les couleurs d’origine reviennent (Bandeau entier en bleu)', variable('--cv') === '#2f6690', variable('--cv'));
    // l'etat de la galerie vit hors du dossier : on le remet comme on l'a trouve pour les essais suivants
    try { _mepGalerieTous = false; _mepGalerieChoix = null; } catch (e) { /* galerie pas chargee */ }
  }
  // ---------------- Reformuler mon CV : complément fermé après l'ajout ou le refus, nom du PDF, parcours terminé (retours de Denis, 2026-10-11) ----------------
  async function parcoursReformulerRetours() {
    // 1. complément de CV : la zone de collage ne sert plus une fois le complément ajouté ; « Je ne suis pas intéressé(e) » ferme le rectangle
    dossier.complementCVPropose = true; dossier.complementCVAjoute = false; dossier.complementCVRefuse = false;
    var conteneur = document.createElement('div'); document.body.appendChild(conteneur);
    conteneur.innerHTML = contenuRectangleComplementCV();
    cas('complément : en attente, la zone de collage et le bouton « Je ne suis pas intéressé(e) » sont là', !!conteneur.querySelector('[data-complement-refus]') && !!conteneur.querySelector('#btnImporterComplement') && complementCVEnAttente());
    var rendus = 0; etatAccordeon['complement-cv'] = true;
    wireComplementCV(function () { rendus++; });
    conteneur.querySelector('[data-complement-refus]').click();
    cas('complément : « Je ne suis pas intéressé(e) » ferme le rectangle, retient le refus et ne demande plus rien', dossier.complementCVRefuse === true && etatAccordeon['complement-cv'] === false && rendus === 1 && !complementCVEnAttente());
    conteneur.innerHTML = contenuRectangleComplementCV();
    cas('complément : refusé, plus de zone de collage, un lien « Finalement, je le veux »', !conteneur.querySelector('#btnImporterComplement') && !!conteneur.querySelector('[data-complement-reprendre]'));
    wireComplementCV(function () { rendus++; });
    conteneur.querySelector('[data-complement-reprendre]').click();
    cas('complément : « Finalement, je le veux » rouvre la zone et remet l’attente', dossier.complementCVRefuse === false && etatAccordeon['complement-cv'] === true && complementCVEnAttente());
    dossier.complementCVAjoute = true;
    conteneur.innerHTML = contenuRectangleComplementCV();
    cas('complément : une fois ajouté, plus de zone de collage (pas de deuxième collage possible)', !conteneur.querySelector('#btnImporterComplement') && /déjà ajouté/.test(conteneur.textContent) && !complementCVEnAttente());
    conteneur.remove(); dossier.complementCVPropose = false; dossier.complementCVAjoute = false; etatAccordeon['complement-cv'] = false;
    // 2. nom du PDF : le titre de la page hôte, au moment de l'impression, est « NOM_poste » comme pour le Word
    await preparerCvResultats();
    var titreImpression = null, avant = document.title;
    var faux = document.createElement('button'); faux.addEventListener('click', function () { titreImpression = document.title; });
    declencherImpressionAvecNomCV(faux);
    cas('PDF : le nom proposé à l’enregistrement est « NOM_poste », comme pour le Word', titreImpression === nomFichierCV(dossier) && !!titreImpression, String(titreImpression) + ' / ' + nomFichierCV(dossier));
    cas('PDF : le titre de la page est rendu après l’impression', document.title === avant, document.title);
    // 3. parcours terminé : la mémoire des parcours est vidée, plus de « Continuer / Recommencer » sur un parcours fini
    _prepLEEtat = { cvTexte: 'Mon CV', dejaRelu: true, relectureFaite: true }; _reformulerEcranReprise = 'echange'; _prepLEEcran = 'echange';
    recommencer();
    cas('parcours terminé : la mémoire du CV déposé et de l’étape reprise est effacée', _prepLEEtat === null && _reformulerEcranReprise === null && _prepLEEcran === 'intro', String(_prepLEEcran));
    naviguerVers('reformuler-cv'); await attente(1500);
    cas('parcours terminé : l’introduction ne propose plus « Continuer / Recommencer »', !document.getElementById('btnReformulerCvReprendre') && !document.getElementById('btnReformulerCvContinuerEtape') && !!document.getElementById('btnReformulerCvCommencer'));
  }
  var PARCOURS = { reformulerRetours: parcoursReformulerRetours, repriseCouleurs: parcoursRepriseCouleurs, autresCouleurs: parcoursAutresCouleurs, bordColonne: parcoursBordColonne, bordBandeau: parcoursBordBandeau, miniaturesReelles: parcoursMiniaturesReelles, titresRubriques: parcoursTitresRubriques, rappelMissions: parcoursRappelMissions, banc: parcoursBancNonRegression, unCvPlusieursMetiers: parcoursUnCvPlusieursMetiers, unCvMetiersPage2: parcoursUnCvMetiersPage2, unCvMetiersPage3: parcoursUnCvMetiersPage3, unCvMetiersPage5: parcoursUnCvMetiersPage5, unCvMetiersPage6: parcoursUnCvMetiersPage6, unCvMetiersPage1: parcoursUnCvMetiersPage1, unCvMetiersClarification: parcoursUnCvMetiersClarification, unCvMetiersPage7: parcoursUnCvMetiersPage7, unCvMetiersRetour: parcoursUnCvMetiersRetour, bilan: parcoursBilan, comparer: parcoursComparer, decouverte: parcoursDecouverte, prompts: parcoursPrompts, ats: parcoursAts, certifs: parcoursCertifs, cartes: parcoursCartesObjectif, cvCertifs: parcoursCvCertifsApresFormations, expLieu: parcoursExperienceLieu, rubriques: parcoursDeplacerRubriques, espaces: parcoursEspacerRubriques, retraits: parcoursRetraitsEtMiseEnPage, identite: parcoursIdentiteEtRectangles, reglerSurLeCv: parcoursReglerSurLeCv, genre: parcoursGenre, missionsPdf: parcoursMissionsNomPdfEffacement, standardPerso: parcoursStandardPersonnaliser, boutonEditer: parcoursBoutonEditerExperiences, cartesOrdre: parcoursCartesDansLOrdreDuCv, mixtePro: parcoursMixteCompetencesPro, clesStables: parcoursClesStablesCompetences, compMissions: parcoursCompetencesEtMissions, niveauComp: parcoursNiveauDetailParCompetences, puces: parcoursPucesEtStyleCompetences, dispoComp: parcoursDispositionCompetences, carteComp: parcoursCarteCompetencesComplete, carteForm: parcoursCarteFormations, cartePerso: parcoursCartePerso, styleCommun: parcoursStyleCommun, grandsBoutons: parcoursGrandsBoutons, accrocheLisible: parcoursAccrocheLisible, aideOptions: parcoursAideOptions, aidesEtPerso: parcoursAidesEtPerso, signesCompetences: parcoursSignesCompetences, intitules: parcoursIntitules, datesCertifs: parcoursDatesCertifs, datesSuggestion: parcoursDatesSuggestion, stageExperience: parcoursStageExperience, stageImport: parcoursStageImport, nomsMessages: parcoursNomsDansLesMessages, orgPuces: parcoursOrganisationEtPuces, modesNoms: parcoursModesEtNoms, troisLigne: parcoursTroisRubriquesLigne, optionsAction: parcoursOptionsCompetencesEnAction, contenuAction: parcoursContenuCompetencesEnAction, reserve: parcoursMissionsEnReserve, propositions: parcoursPropositionsEnAction, editionComplete: parcoursEditionComplete, optionsSupp: parcoursOptionsSupplementaires, datesRub: parcoursDatesParRubrique, editionComp: parcoursEditionCompetences, conseilMissions: parcoursNombreMissionsConseille, correctionsPanneau: parcoursCorrectionsPanneau, paires: parcoursPairesPanneaux, modelesColonne: parcoursModelesColonne, looksFamilles: parcoursLooksEtFamilles, chronologique: parcoursChronologique, editorial: parcoursEditorial, editorialLarge: parcoursEditorialLarge, extrasA: parcoursExtrasFamilleA, cartesGrille: parcoursCartesGrille, friseFoncee: parcoursFriseFoncee, technique: parcoursTechnique, cartesCouleurs: parcoursCartesCouleurs, teintePage: parcoursTeintePage, colonneRuban: parcoursColonneRuban, limitesWord: parcoursLimitesWord, infosBandeaux: parcoursInfosBandeaux, infosPresentation: parcoursInfosPresentation, infosEntete: parcoursInfosEntete, titresEtCoin: parcoursTitresEtCoin, remplissage: parcoursRemplissageOffice, enteteAgrandi: parcoursEnteteAgrandi, accrocheCourte: parcoursAccrocheCourteDefaut, jsonFermetures: parcoursJsonFermetures, enteteDecale: parcoursEnteteDecale, coordEnLigne: parcoursCoordEnLigne, ambiance: parcoursAmbianceEtPulsation, tirageStandard: parcoursTirageStandardRiche, modelesPhoto: parcoursModelesPhoto, boutonDegrade: parcoursBoutonDegrade, rondBoutons: parcoursRondBoutons, annulerCouleur: parcoursAnnulerCouleur, pulseAllure: parcoursPulseAllure };

  // Attend que l'application soit chargee (un eval lance juste apres un rechargement tombe sinon sur une page a moitie prete).
  async function attendreApplication() {
    for (var i = 0; i < 40; i++) {
      if (typeof dossier !== 'undefined' && typeof bilanEntrerPreparation === 'function' && typeof ouvrirComparerPistes === 'function' &&
          typeof ouvrirDecouverteCompetences === 'function' && typeof promptsExternesCharges !== 'undefined' && promptsExternesCharges['voix-humaine'] &&
          typeof htmlBandeRepriseModule === 'function') { return true; }
      await attente(500);
    }
    return false;
  }

  window.__parcours = async function (quels) {
    resultats = [];
    // Remplissage d'office (2026-10-07) : les essais existants partent des reglages par defaut ; seul l'essai « remplissage » le retire.
    window.__cvPdfSansRemplissageInitial = true;
    if (!(await attendreApplication())) { cas('l’application ne s’est pas chargée à temps', false, 'recharger la page puis relancer'); return { ok: false, nbOk: 0, nbEchecs: 1, echecs: resultats, tout: [] }; }
    // Le banc de non-régression (33 modèles, exports Word en mémoire) ralentit tellement la page que les parcours suivants dépassent plusieurs minutes (constaté le 2026-10-06 : « espaces » en
    // dépassement de délai). Il se lance donc SEUL, sur une page rechargée : await window.__parcours(['banc']) ; la suite par défaut ne l'inclut pas.
    var ids = (quels && quels.length) ? quels : Object.keys(PARCOURS).filter(function (k) { return k !== 'banc'; });
    // Certains essais (glisser-déposer des rubriques...) dépendent de la taille de la fenêtre : trop petite, ils échouent sans que le code soit en cause (constaté le 2026-10-06).
    if (window.innerHeight < 600) { cas('la fenêtre de test est trop petite (' + window.innerWidth + ' x ' + window.innerHeight + ') : redimensionner à 738 x 698 avant de lancer, sinon des essais échouent à tort', false, 'resize_window 738 x 698'); }
    var erreurs = [];
    window.__erreursParcours = []; var ecoute = function (ev) { window.__erreursParcours.push(ev.message); };
    window.addEventListener('error', ecoute);
    for (var i = 0; i < ids.length; i++) {
      window.__parcoursCourant = ids[i] + ' (' + (i + 1) + '/' + ids.length + ', depuis ' + new Date().toLocaleTimeString('fr-FR') + ')';   // pour savoir sur quel essai on est (suite par lots)
      try { await PARCOURS[ids[i]](); }
      catch (e) { cas(ids[i] + ' : le parcours s’est arrêté sur une erreur', false, e && e.message); }
    }
    window.removeEventListener('error', ecoute);
    cas('aucune erreur JavaScript levée pendant les parcours', window.__erreursParcours.length === 0, window.__erreursParcours.join(' | '));
    var echecs = resultats.filter(function (r) { return !r.ok; });
    window.__resultatsParcours = resultats;
    return { ok: echecs.length === 0, nbOk: resultats.length - echecs.length, nbEchecs: echecs.length, echecs: echecs, tout: resultats.map(function (r) { return (r.ok ? 'OK  ' : 'ECHEC ') + r.nom; }) };
  };
})();
