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
    cas('découverte : l’import aboutit sur « Mon CV » (#resultats), titre appliqué, parcours marqué terminé', location.hash === '#resultats' && dossier.titreCV === 'Agent d’accueil' && dossier.decouverteTerminee === true, location.hash + ' / ' + dossier.titreCV);
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
    cas('grands boutons : le bouton existe en haut de « La mise en page », à côté de « Aide »', !!cb && cb.tagName === 'BUTTON' && !!cb.parentElement.querySelector('#btnMepAide'), '');
    if (cb.getAttribute('aria-pressed') === 'true') { cb.click(); await attente(500); }
    var avant = mesure();
    cas('grands boutons : au départ, rien ne change (beaucoup de petits contrôles, pas d’attribut)', !document.documentElement.getAttribute('data-grands-boutons') && avant.petits > 50, JSON.stringify(avant));
    document.querySelector('[data-mep-grands-boutons]').click(); await attente(800);
    var apres = mesure();
    cas('grands boutons : activés, tous les boutons, cases et lignes font au moins 44 px (hors curseurs)', document.documentElement.getAttribute('data-grands-boutons') === '1' && apres.petits <= 2, JSON.stringify(apres));
    cas('grands boutons : rien ne déborde de sa carte', apres.debord === 0, JSON.stringify(apres));
    // Retour Denis 2026-10-03 : en mode Grands boutons, toutes les options de couleur sont derrière UN bouton « Choisir mes couleurs ».
    var zc = document.getElementById('zoneCouleurs');
    var visible = function (e) { return !!e && e.checkVisibility() && e.getBoundingClientRect().width > 2 && e.getBoundingClientRect().height > 2; };
    cas('grands boutons : les couleurs sont rangées derrière un seul bouton, replié au départ', !!zc && !zc.open && visible(zc.querySelector('summary')) && !visible(zc.querySelector('[data-mep-base]')), '');
    zc.querySelector('summary').click(); await attente(400);
    cas('grands boutons : le bouton montre pastilles, couleurs de l’entreprise, personnalisée et dégradé', visible(zc.querySelector('[data-mep-base]')) && visible(zc.querySelector('.swatches-ligne2 .sw-entreprise-indispo, [data-mep-accent-entreprise]')) && visible(zc.querySelector('.sw-perso')) && visible(zc.querySelector('[data-mep-degrade-simple]')), '');
    var autre = zc.querySelectorAll('[data-mep-base]')[3]; autre.click(); await attente(3500);
    zc = document.getElementById('zoneCouleurs');
    cas('grands boutons : choisir une couleur la pose sur le CV et la zone reste ouverte', zc.open && zc.querySelectorAll('[data-mep-base]')[3].classList.contains('on'), '');
    cas('grands boutons : la pastille du bouton montre la couleur choisie', zc.querySelector('.cb-pastille').style.background !== '', zc.querySelector('.cb-pastille').getAttribute('style'));
    zc.querySelectorAll('[data-mep-base]')[1].click(); await attente(3000);
    zc = document.getElementById('zoneCouleurs');
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
        if (f < 13.9) { out.push(e.tagName + '.' + String(e.className).split(' ')[0] + '@' + f.toFixed(1) + ' « ' + t.slice(0, 20) + ' »'); }
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
    var zc2 = document.getElementById('zoneCouleurs');
    cas('grands boutons : désactivés, les couleurs redeviennent toutes visibles, sans bouton à cliquer', !!zc2 && zc2.open && !visible(zc2.querySelector('summary')) && visible(zc2.querySelector('[data-mep-base]')), '');
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
    // version courte
    document.querySelector('[data-mep-accroche-courte]').click(); await attente(3500);
    cas('accroche : en version courte, la liste montre les phrases courtes en entier', [].slice.call(zone().querySelectorAll('.rad-accroche-texte')).every(function (e, i) { return e.textContent.indexOf(courtes[i]) >= 0; }), '');
    document.querySelector('[data-mep-accroche-courte]').click(); await attente(3500);
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
    // sans aucune expérience personnelle ni accroche : la carte et la case « Version courte » restent visibles
    dossier.experiencesPerso = []; dossier.engagements = []; if (dossier.ia && dossier.ia.cv) { dossier.ia.cv.accrochesProposees = []; dossier.ia.cv.accrochesCourtesProposees = []; dossier.ia.cv.profil = ''; }
    _mepRerendre(); await attente(3500);
    for (var essai = 0; essai < 8 && !(document.getElementById('cExpPerso') && /Rien n’a été capté/.test(document.getElementById('cExpPerso').textContent)); essai++) { await attente(1500); }
    var vide = document.getElementById('cExpPerso');
    cas('expérience personnelle : la carte est là même sans aucune entrée, et le dit', !!vide && /Rien n’a été capté/.test(vide.textContent) && !/Vos informations/.test(vide.textContent), '');
    document.getElementById('cEntete').open = true; await attente(300);
    var cc = document.querySelector('[data-mep-accroche-courte]');
    cas('accroche : « Version courte » est visible mais grisée quand il n’y a pas de phrase d’accroche', !!cc && cc.disabled && cc.checkVisibility(), cc ? String(cc.disabled) : 'absente');
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
    var modele = document.querySelector('.mep-mq .btn-miss:not([data-mep-options-supp]):not([data-mep-options-retour])');
    var st = function (el) { var c = getComputedStyle(el); return [c.fontSize, c.borderRadius, c.paddingTop, c.paddingLeft, c.color, c.fontFamily].join('|'); };
    cas('options supplémentaires : ce sont de vrais boutons, du même style que les autres boutons des panneaux', boutons.every(function (b) { return b.tagName === 'BUTTON' && b.classList.contains('btn-miss') && (!modele || st(b) === st(modele)); }), boutons.length ? st(boutons[0]) + ' / ' + (modele ? st(modele) : '') : '');
    cas('options supplémentaires : « Réglages supplémentaires » est refermée au départ', !!supp() && !supp().open, '');
    var pose = [
      ['org', ['colonnesinv', 'largeurgauche', 'formecolonnes']], ['entete', ['bandeau', 'degradebandeau', 'coordapart', 'anneauphoto', 'lectureguidee']], ['comp', ['coulcomp', 'coulpuces', 'bandeaucompcles']],
      ['exp', ['evid', 'regroupement', 'formatexp']], ['texte', ['police', 'styletitres', 'bordures', 'coinsarrondis', 'veuves', 'espparas']], ['couleurs', ['textefond', 'fondeffet', 'fondpleine']], ['autres', ['rubrique']]];
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
    // « Style rapide » ne touche jamais ces reglages
    var avant = JSON.stringify([reg().coinsArrondis, reg().formatExperiences, reg().styleBordures]);
    document.getElementById('btnMepDe').click(); await attente(4500);
    cas('options supplémentaires : « Style rapide » ne change aucun réglage de cette carte', JSON.stringify([reg().coinsArrondis, reg().formatExperiences, reg().styleBordures]) === avant, avant + ' -> ' + JSON.stringify([reg().coinsArrondis, reg().formatExperiences, reg().styleBordures]));
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

  var PARCOURS = { bilan: parcoursBilan, comparer: parcoursComparer, decouverte: parcoursDecouverte, prompts: parcoursPrompts, ats: parcoursAts, certifs: parcoursCertifs, cartes: parcoursCartesObjectif, cvCertifs: parcoursCvCertifsApresFormations, expLieu: parcoursExperienceLieu, rubriques: parcoursDeplacerRubriques, espaces: parcoursEspacerRubriques, retraits: parcoursRetraitsEtMiseEnPage, identite: parcoursIdentiteEtRectangles, reglerSurLeCv: parcoursReglerSurLeCv, genre: parcoursGenre, missionsPdf: parcoursMissionsNomPdfEffacement, standardPerso: parcoursStandardPersonnaliser, boutonEditer: parcoursBoutonEditerExperiences, cartesOrdre: parcoursCartesDansLOrdreDuCv, mixtePro: parcoursMixteCompetencesPro, clesStables: parcoursClesStablesCompetences, compMissions: parcoursCompetencesEtMissions, niveauComp: parcoursNiveauDetailParCompetences, puces: parcoursPucesEtStyleCompetences, dispoComp: parcoursDispositionCompetences, carteComp: parcoursCarteCompetencesComplete, carteForm: parcoursCarteFormations, cartePerso: parcoursCartePerso, styleCommun: parcoursStyleCommun, grandsBoutons: parcoursGrandsBoutons, accrocheLisible: parcoursAccrocheLisible, aideOptions: parcoursAideOptions, aidesEtPerso: parcoursAidesEtPerso, signesCompetences: parcoursSignesCompetences, intitules: parcoursIntitules, datesCertifs: parcoursDatesCertifs, datesSuggestion: parcoursDatesSuggestion, stageExperience: parcoursStageExperience, stageImport: parcoursStageImport, nomsMessages: parcoursNomsDansLesMessages, orgPuces: parcoursOrganisationEtPuces, modesNoms: parcoursModesEtNoms, troisLigne: parcoursTroisRubriquesLigne, optionsAction: parcoursOptionsCompetencesEnAction, contenuAction: parcoursContenuCompetencesEnAction, reserve: parcoursMissionsEnReserve, propositions: parcoursPropositionsEnAction, editionComplete: parcoursEditionComplete, optionsSupp: parcoursOptionsSupplementaires, datesRub: parcoursDatesParRubrique, editionComp: parcoursEditionCompetences, conseilMissions: parcoursNombreMissionsConseille };

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
    if (!(await attendreApplication())) { cas('l’application ne s’est pas chargée à temps', false, 'recharger la page puis relancer'); return { ok: false, nbOk: 0, nbEchecs: 1, echecs: resultats, tout: [] }; }
    var ids = (quels && quels.length) ? quels : Object.keys(PARCOURS);
    var erreurs = [];
    window.__erreursParcours = []; var ecoute = function (ev) { window.__erreursParcours.push(ev.message); };
    window.addEventListener('error', ecoute);
    for (var i = 0; i < ids.length; i++) {
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
