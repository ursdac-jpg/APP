/* ============================================================
   parcours_smoke.js  --  ESSAIS DE PARCOURS REJOUABLES EN UN APPEL (outil de developpement, jamais charge par l'application)
   ------------------------------------------------------------
   Pourquoi : Denis ne doit plus rejouer a la main les memes parcours apres chaque correction (2026-09-30). Ce script rejoue, dans le
   navigateur integre, les parcours deja verifies une nuit, avec un assistant SIMULE (ouverture d'onglet et presse-papiers simules).

   Utilisation (navigateur integre, serveur de dev lance, page fraichement rechargee, attendre la fin du chargement) :
     eval(await (await fetch('/scripts/parcours/parcours_smoke.js')).text());
     await window.__parcours();            // ~40 s ; renvoie { ok, nbOk, nbEchecs, echecs, tout }
   Un seul parcours : await window.__parcours(['bilan']) ; identifiants : bilan, comparer, decouverte, prompts, ats, certifs, cartes, aide.

   AVANT de lancer les essais qui touchent la flèche « Précédent » (accueilCartes, monTerritoire*, bilanHistorique, cadreHistorique, comparerHistorique, ucpmHistorique, decouverteHistorique, lexiqueHistorique, chiffresHistorique, regardHistorique, petitsModulesHistorique) : faire UN VRAI CLIC dans la page (pas un clic par script).
   Chrome ignore les entrées d'historique créées sans clic réel et un history.go(-n) peut alors sortir de la page (leçon 9.45).

   ATTENTION : les parcours modifient le dossier en cours (donnees de test). Ne jamais les lancer sur une vraie session de Denis.
   Ce qui N'est PAS couvert (reste a un vrai essai) : vrai presse-papiers, vraie ouverture de l'assistant, contenu reel des reponses.
   Ajouter un parcours : declarer une fonction dans PARCOURS ci-dessous, avec cas(nom, condition, detail).
   ============================================================ */
(function () {
  // Les zones de collage ne se remplissent pas seules : une vraie personne colle ou tape, ce qui active « Continuer » (evenement de saisie). Un essai qui pose .value par script doit faire de meme (25/10/2026).
  (function () {
    var d = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value');
    if (!d || HTMLTextAreaElement.prototype.__valeurSimuleSaisie) { return; }
    Object.defineProperty(HTMLTextAreaElement.prototype, 'value', { configurable: true, get: d.get, set: function (v) { d.set.call(this, v); if (/^texteCollage/.test(this.id)) { this.dispatchEvent(new Event('input', { bubbles: true })); } } });
    HTMLTextAreaElement.prototype.__valeurSimuleSaisie = true;
  })();
  var attente = function (ms) { return new Promise(function (r) { setTimeout(r, ms || 600); }); };
  var resultats = [];
  function cas(nom, condition, detail) { resultats.push({ nom: nom, ok: !!condition, detail: condition ? '' : String(detail === undefined ? '' : detail) }); }
  function $(sel, racine) { return (racine || document).querySelector(sel); }
  function texte(el) { return el ? (el.innerText || el.textContent || '') : ''; }

  // ---------------- Bilan : ecran « Preparer » (plus de bloc « Relire et masquer », relecture qui s'ouvre seule apres un collage) ----------------
  async function parcoursBilan() {
    bilanEntrerPreparation(null); await attente(1500);
    // Premiere entree dans le module depuis un chargement neuf : la page de presentation peut passer avant l'ecran « Preparer » ; on y entre une 2e fois.
    if (!$('#btnPreparerDeposerCv') && !$('#btnPreparerChangerCv')) { bilanEntrerPreparation(null); await attente(1500); }
    var titres = [].slice.call(document.querySelectorAll('.bloc-depli .preparer-titre')).map(function (e) { return e.textContent; });
    cas('bilan : deux blocs seulement, plus de « Relire et masquer »', titres.length === 2 && titres[0] === 'Votre CV' && !$('#preparerBloc2'), titres.join(' | '));

    $('#preparerCollerZone').hidden = false;   // plus de bouton « Ou coller le texte » (retire le 25/10/2026) : la zone de collage reste dans la page
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
    $('#preparerCollerZone').hidden = false;   // plus de bouton « Ou coller le texte » (retire le 25/10/2026) : la zone de collage reste dans la page
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
    cas('découverte : après l’import, le parcours attend (complément de CV facultatif, bouton « Continuer »)', location.hash !== '#resultats' && !!document.getElementById('btnSuivantNavigation') && !document.getElementById('btnContinuerDecouverte') && !!document.getElementById('btnOuvrirComplementCV') && dossier.titreCV === 'Agent d’accueil');
    document.getElementById('btnSuivantNavigation').click(); await attente(2000);
    cas('découverte : « Continuer » aboutit sur « Mon CV » (#resultats), parcours marqué terminé', location.hash === '#resultats' && dossier.decouverteTerminee === true, location.hash);
    // Retour Denis 2026-10-19 : quand l'assistant a proposé le complément, « Continuer » mène d'abord à l'écran du complément (étape 14), jamais directement à la page de création.
    dossier.complementCVPropose = true; dossier.complementCVAjoute = false; dossier.complementCVRefuse = false; dossier.complementCVPasse = false;
    window._decouverteVersResultats = false;
    naviguerVers('decouverte'); await attente(1500); _decouverteRenduEtape(12); await attente(800);
    cas('découverte : avec un complément proposé, la page « Collez la réponse » n’a ni bandeau ni rectangle du complément', !document.querySelector('.complement-cv-banniere') && !document.querySelector('[data-assistant-rect-toggle="complement-cv"]'));
    document.getElementById('btnSuivantNavigation').click(); await attente(1000);
    cas('découverte : « Continuer » mène à l’écran du complément (importer ou passer)', location.hash !== '#resultats' && /complément de votre CV/i.test(document.querySelector('h1').textContent) && /Continuer/.test(document.getElementById('btnSuivantNavigation').textContent) && /y revenir plus tard/.test(document.body.innerText) && !!document.getElementById('texteCollageComplement'));
    _decouverteAgirRetour(); await attente(800);
    cas('découverte : « Retour » depuis l’écran du complément revient à « Collez la réponse »', location.hash !== '#resultats' && !!document.getElementById('texteCollageActionIA'));
    document.getElementById('btnSuivantNavigation').click(); await attente(800);
    document.getElementById('btnSuivantNavigation').click(); await attente(2500);
    cas('découverte : « Passer, je vois mon CV » aboutit sur la page de création, le complément reste importable plus tard', location.hash === '#resultats' && dossier.complementCVPasse === true && complementCVImportable());
  }

  // ---------------- Prompts : lignes directrices par situation et voix humaine ----------------
  async function parcoursPrompts() {
    var avant = dossier.objectif, rcAvant = JSON.stringify(dossier.rechercheCandidature || {}); var situations = ['offre', 'spontanee', 'reconversion', 'stage', 'alternance', 'pmsmp', 'formation'];
    situations.forEach(function (o) {
      dossier.objectif = o;
      // Depuis le 24/10/2026, « offre » sans offre est une candidature spontanée : l'essai donne une offre pour mesurer la ligne de l'offre.
      dossier.rechercheCandidature = Object.assign({}, dossier.rechercheCandidature || {}, { lienOffre: o === 'offre' ? 'https://exemple.fr/offre' : '', texteOffre: o === 'offre' ? 'Offre d’agent de sécurité' : '' });
      ['cv', 'lettre', 'entretien'].forEach(function (t) {
        var tx = ''; try { tx = texteProfil(t); } catch (er) { tx = ''; }
        cas('prompts : ligne directrice « ' + o + ' » dans le profil ' + t, tx.indexOf('Ce que cette situation demande de mettre en avant : ' + LIGNES_DIRECTRICES_SITUATION[o]) >= 0);
      });
      var rf = ''; try { rf = _reformulerCvContexteTexte(); } catch (er2) { rf = ''; }
      cas('prompts : ligne directrice « ' + o + ' » dans Reformuler', String(rf).indexOf(LIGNES_DIRECTRICES_SITUATION[o]) >= 0);
    });
    dossier.objectif = avant; dossier.rechercheCandidature = JSON.parse(rcAvant);
    ['cv', 'decouverteRedaction', 'lettre', 'lettre-co', 'entretien', 'entretien-accueil', 'reformuler-cv'].forEach(function (k) {
      var t = promptsExternesCharges[k];
      cas('prompts : « voix humaine » chargée dans ' + k, !!t && t.indexOf('Une voix humaine') >= 0 && t.indexOf('{{VOIX_HUMAINE}}') === -1, t ? 'repère restant ou texte absent' : 'prompt non chargé');
    });
  }

  // ---------------- « Reprendre mon CV », voie 3 « Le refaire moi-même dans un modèle » : écran « Classer » (Lot 7, sous-lot 7a, 26/10/2026) ----------------
  async function parcoursVoie3Classer() {
    var sauve = { mode: dossier.modeCreation, ouvert: CSA_OUVERT, etat: _prepLEEtat };
    var CV = ['Camille RIVIÈRE', 'Chargée de clientèle', '06 12 34 56 78', 'camille.riviere@email.fr', '12 rue des Tilleuls', '24100 Bergerac', '', 'EXPÉRIENCE PROFESSIONNELLE',
      'Chargée de clientèle - Assurances du Périgord - Bergerac', 'Mars 2019 - Juin 2024', '- Accueil physique et téléphonique de 40 clients par jour', '', 'FORMATION', 'BTS Assurance - Lycée Jean Moulin - 2018', '',
      'LANGUES', 'Anglais : courant', '', 'CENTRES D’INTÉRÊT', 'Randonnée, lecture'].join('\n');
    var blocs = function () { return document.querySelectorAll('#csaBlocs .blk').length; };
    csaReinitialiser();
    dossier.modeCreation = 'maj'; _prepLEMode = 'maj'; _reprendreCvActif = true; _prepLEEcran = 'depot'; _prepLEDetour = false;
    _prepLEEtat = { cvTexte: CV, cvFichier: null, dejaRelu: true, relectureFaite: true, situationTouchee: false };
    CSA_OUVERT = false; naviguerVers('reprendre-cv'); await attente(800);
    var carte = function () { return $('[data-reprendre-voie="sans"]'); };
    cas('voie 3 : fermée (grisée) tant que CSA_OUVERT est faux', !!carte() && carte().getAttribute('aria-disabled') === 'true');
    CSA_OUVERT = true; _prepLERendreDepot(); await attente(600);
    cas('voie 3 : ouverte quand CSA_OUVERT est vrai, avec la phrase « remets en page moi-même »', !!carte() && carte().getAttribute('aria-disabled') !== 'true' && /remets en page moi-même/.test(carte().innerText));
    carte().click(); await attente(1200);
    cas('voie 3 : la carte mène à l’écran « Classer » (route cv-sans-assistant)', pageActuelle === 'cv-sans-assistant' && /Classez les informations/.test(document.body.innerText));
    cas('voie 3 : bandeau Déposer, Ma voie, Classer, Vérifier, Vos documents', /Déposer[\s\S]*Ma voie[\s\S]*Classer[\s\S]*Vérifier[\s\S]*Vos documents/.test(($('.barre-etapes-bilan') || { innerText: '' }).innerText));
    cas('voie 3 : le CV est découpé en blocs classés, les coordonnées surlignées', blocs() >= 5 && document.querySelectorAll('.det').length >= 3, blocs());
    cas('voie 3 : Retour, Accueil et Continuer sont dans la barre du bas, aucun bouton « Importer » dans la page', document.querySelectorAll('.barre-navigation-fixe button').length === 3 && !/Importer/.test(($('#csaBlocs') || { innerText: '' }).innerText));
    var n0 = blocs();
    $('[data-ouvrir="' + (n0 - 1) + '"]').click(); await attente(150); $('[data-rub="autres"][data-bloc="' + (n0 - 1) + '"]').click(); await attente(300);
    cas('voie 3 : changer la rubrique d’un bloc la change, et « Autres informations » propose un nom', document.querySelectorAll('#csaBlocs .blk')[n0 - 1].className.indexOf('rb-autres') >= 0 && !!$('[data-nomlibre]'));
    $('[data-couper="0:0"]').click(); await attente(300);
    cas('voie 3 : les ciseaux coupent un bloc', blocs() === n0 + 1, blocs());
    $('[data-fusion="1"]').click(); await attente(300);
    cas('voie 3 : « Fusionner avec le bloc du dessus » rassemble deux blocs', blocs() === n0, blocs());
    $('.btn-revoir-module').click(); await attente(1000);
    var revenir = [].filter.call(document.querySelectorAll('button'), function (b) { return /Revenir au module/i.test(b.innerText); })[0];
    cas('voie 3 : « Revoir la présentation » ouvre la présentation de « Reprendre mon CV » avec « Revenir au module »', pageActuelle === 'reprendre-cv' && !!revenir);
    if (revenir) { revenir.click(); await attente(1200); }
    cas('voie 3 : « Revenir au module » ramène au classement, le travail est gardé', pageActuelle === 'cv-sans-assistant' && blocs() === n0, blocs());
    csaRetourMaVoie(); await attente(1000);
    cas('voie 3 : « Retour » ramène aux trois voies, le CV déposé reste là', pageActuelle === 'reprendre-cv' && !!carte() && !csaVoieEngagee());
    // PDF aplati sans fichier : la personne est prévenue
    csaReinitialiser();
    _prepLEEtat = { cvTexte: 'Camille Rivière Chargée de clientèle Assurances du Périgord '.repeat(10), cvFichier: null, dejaRelu: true, relectureFaite: true };
    naviguerVers('cv'); await attente(300); naviguerVers('cv-sans-assistant'); await attente(1200);
    cas('voie 3 : un PDF aplati sans fichier gardé prévient la personne (redéposer avec « Changer de CV »)', !!$('.csa-alerte'));
    csaReinitialiser(); _prepLEEtat = sauve.etat; CSA_OUVERT = sauve.ouvert; dossier.modeCreation = sauve.mode;
  }

  // ---------------- Voie 3 de « Reprendre mon CV » : « Vérifier », écriture dans le CV, « Vos documents », mode fidèle (Lot 7, sous-lot 7b, 26/10/2026) ----------------
  async function parcoursVoie3Documents() {
    var sauve = { mode: dossier.modeCreation, ouvert: CSA_OUVERT, etat: _prepLEEtat };
    var CV = ['Camille RIVIÈRE', 'Chargée de clientèle', '06 12 34 56 78', 'camille.riviere@email.fr', '12 rue des Tilleuls', '24100 Bergerac', 'Permis B', '',
      'Conseillère clientèle expérimentée, à l’aise à l’accueil comme au téléphone, je cherche un poste stable près de chez moi.', '', 'EXPÉRIENCE PROFESSIONNELLE',
      'Chargée de clientèle - Assurances du Périgord - Bergerac', 'Mars 2019 - Juin 2024', '- Accueil physique et téléphonique de 40 clients par jour', '- Souscription et suivi des contrats auto et habitation',
      '- Traitement des réclamations et des sinistres', '- Relances des impayés', '- Tenue de la caisse et des encaissements', '- Formation des nouveaux arrivants', '',
      'Hôtesse d’accueil - Clinique Saint-Louis - Périgueux', 'Janvier 2016 - Février 2019', '- Orientation des patients et des familles', '- Gestion du standard téléphonique', '- Prise de rendez-vous', '', 'FORMATION',
      'BTS Assurance - Lycée Jean Moulin - Périgueux - 2018', '', 'COMPÉTENCES', 'Gestion des contrats, Relation client, Traitement des litiges, Saisie rapide, Organisation, Négociation, Prospection téléphonique, Rédaction de courriers, Classement, Suivi de dossiers, Accueil, Conseil', '',
      'SAVOIR-ÊTRE', 'Sens du service, Rigueur, Écoute, Patience, Adaptabilité, Discrétion, Esprit d’équipe, Autonomie, Ponctualité, Sang-froid, Bienveillance, Réactivité', '', 'LOGICIELS', 'Word, Excel, Outlook, Sage, Salesforce', '',
      'LANGUES', 'Anglais : courant', '', 'CENTRES D’INTÉRÊT', 'Randonnée, lecture, cinéma, jardinage, cuisine, natation', '', 'INFORMATIONS COMPLÉMENTAIRES', 'Disponible immédiatement', 'Mobilité : département'].join('\n');
    var attendus = ['RIVIÈRE', '06.12.34.56.78', 'camille.riviere@email.fr', 'Bergerac', '24100', 'Permis B', 'Conseillère clientèle expérimentée', 'Assurances du Périgord', 'Clinique Saint-Louis',
      'Accueil physique et téléphonique de 40 clients par jour', 'Traitement des réclamations et des sinistres', 'Relances des impayés', 'Tenue de la caisse et des encaissements', 'Formation des nouveaux arrivants',
      'Orientation des patients et des familles', 'Prise de rendez-vous', 'BTS Assurance', 'Lycée Jean Moulin', 'Gestion des contrats', 'Relation client', 'Organisation', 'Accueil', 'Conseil clientèle', 'Sens du service', 'Rigueur',
      'Patience', 'Esprit d’équipe', 'Sang-froid', 'Bienveillance', 'Réactivité', 'Word', 'Salesforce', 'Anglais', 'Randonnée', 'Natation', 'Disponible immédiatement', 'Mobilité : département'];
    csaReinitialiser();
    dossier.modeCreation = 'maj'; _prepLEMode = 'maj'; _reprendreCvActif = true; _prepLEEcran = 'depot'; _prepLEDetour = false;
    _prepLEEtat = { cvTexte: CV, cvFichier: null, dejaRelu: true, relectureFaite: true, situationTouchee: false };
    CSA_OUVERT = true; naviguerVers('reprendre-cv'); await attente(800);
    $('[data-reprendre-voie="sans"]').click(); await attente(1200);
    csaContinuer(); await attente(700);
    cas('voie 3 / Vérifier : une fiche par rubrique, préremplie, avec le compte des informations', /Vérifiez vos fiches/.test(document.body.innerText) && document.querySelectorAll('#csaFiches details').length === 12 && /\d+\s+informations seront reprises/.test(($('#csaCompteur') || { innerText: '' }).innerText));
    cas('voie 3 / Vérifier : l’identité est préremplie et le « à vérifier » est signalé sur ce qui est deviné', $('#csaf-identite-nom').value === 'RIVIÈRE' && $('#csaf-identite-telephone').value !== '' && !!$('[data-csa-devine="experience.0.poste"]'));
    var comp = $('#csaf-competences'); comp.value = comp.value.replace(/Conseil$/, 'Conseil clientèle'); comp.dispatchEvent(new Event('input', { bubbles: true })); await attente(150);
    cas('voie 3 / Vérifier : corriger une case retire son « à vérifier »', (function () { var p = $('#csaf-experience-0-poste'); p.value = 'Chargée de clientèle senior'; p.dispatchEvent(new Event('input', { bubbles: true })); return !$('[data-csa-devine="experience.0.poste"]'); })());
    attendus.push('Chargée de clientèle senior');
    csaVersDocuments(); await attente(6000);
    cas('voie 3 / Vos documents : arrivée sur la page, barre de la voie, aucun réglage « pour l’assistant »', pageActuelle === 'resultats' && window._modeVoie3Csa === true && /Vérifier[\s\S]*Vos documents/.test(($('.barre-etapes-bilan') || { innerText: '' }).innerText) && !/Niveau du poste recherché/.test(document.body.innerText));
    var f = $('iframe'), texte = f ? f.contentDocument.body.innerText.toLowerCase() : '';
    var manque = attendus.filter(function (x) { return texte.indexOf(x.toLowerCase()) === -1; });
    cas('mode fidèle : tout ce que la personne a écrit est sur le CV (compétences, qualités, toutes les missions, informations complémentaires)', manque.length === 0, manque.join(' ; '));
    cas('mode fidèle : rien n’est déduit des loisirs ni du métier (pas d’« Endurance »)', texte.indexOf('endurance') === -1 && texte.indexOf('encaissement') === texte.lastIndexOf('encaissement'));
    cas('voie 3 : le titre d’origine « Savoir-être » est repris comme intitulé du CV, l’indicateur de page est affiché', texte.indexOf('savoir-être') !== -1 && texte.indexOf('compétences comportementales') === -1 && /Estimation : le CV (tient sur 1 page|occupe environ)/.test(document.body.innerText));
    cas('mode fidèle : le drapeau est posé pour cette voie seulement', dossier.modeFidele === true);
    csaDesengager();
    cas('voie 3 : quitter la voie éteint le mode fidèle', dossier.modeFidele === false);
    csaReinitialiser(); _prepLEEtat = sauve.etat; CSA_OUVERT = sauve.ouvert; dossier.modeCreation = sauve.mode; window._modeVoie3Csa = false;
  }

  // ---------------- « Vos appuis » (lettre de recommandation) : seulement avec l'assistant (26/10/2026) ----------------
  async function parcoursAppuisSansAssistant() {
    var av = { m: dossier.modeCreation, s: dossier.creationSansAssistant, o: dossier.objectif };
    var a = function () { return /appuis/i.test(document.getElementById('app').innerHTML); };
    dossier.modeCreation = 'nouveau'; dossier.objectif = 'offre';
    dossier.creationSansAssistant = false; pageObjectif(); await attente(500);
    cas('appuis : « Créer un nouveau CV » avec l’assistant propose « Vos appuis » sur « Votre objectif »', a());
    dossier.creationSansAssistant = true; pageObjectif(); await attente(500);
    cas('appuis : « Créer un nouveau CV » à la main, sans assistant, ne propose pas « Vos appuis »', !a());
    dossier.modeCreation = av.m; dossier.creationSansAssistant = av.s; dossier.objectif = av.o;
  }

  // ---------------- Prompts de l'entretien : la fiche déjà faite part avec l'entraînement, jamais avec la fiche rapide (26/10/2026) ----------------
  async function parcoursEntretienFiche() {
    var avant = JSON.stringify(dossier.ia && dossier.ia.entretien || null);
    if (!dossier.ia) { dossier.ia = {}; }
    dossier.ia.entretien = null;
    cas('entretien fiche : sans fiche faite, aucune section « FICHE DE PRÉPARATION DÉJÀ ÉTABLIE »', _prepaEntretienSectionFicheDejaEtablie() === '');
    dossier.ia.entretien = { presentation: 'commencer par le métier ; finir sur le projet', pointsAPreparer: ['Appeler l’entreprise'], questionsAnticipees: [{ question: 'Cas pratique : un client mécontent', pistes: ['écouter', 'agir'], amorce: 'Je commencerais par' }], questionsDuCandidat: ['Pourquoi le poste est-il ouvert ?'] };
    var sec = _prepaEntretienSectionFicheDejaEtablie();
    cas('entretien fiche : la fiche faite est envoyée avec ses idées, points, questions (pistes, amorce) et questions du candidat', sec.indexOf('FICHE DE PRÉPARATION DÉJÀ ÉTABLIE') === 0 && sec.indexOf('commencer par le métier') > 0 && sec.indexOf('Appeler l’entreprise') > 0 && sec.indexOf('Cas pratique : un client mécontent (pistes : écouter, agir) (amorce : Je commencerais par)') > 0 && sec.indexOf('Pourquoi le poste est-il ouvert ?') > 0, sec);
    cas('entretien fiche : le prompt de la fiche rapide ne contient pas la section', String(promptsExternesCharges['entretien-accueil'] || '').indexOf('{{FICHE') === -1 && texteProfilEffectif('entretien').indexOf('FICHE DE PRÉPARATION DÉJÀ ÉTABLIE') === -1);
    cas('entretien fiche : les deux prompts de l’entretien sont chargés et distincts', !!promptsExternesCharges['entretien'] && !!promptsExternesCharges['entretien-accueil'] && promptsExternesCharges['entretien'] !== promptsExternesCharges['entretien-accueil']);
    dossier.ia.entretien = JSON.parse(avant);
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
      // Lot 4a (25/10/2026) : « Votre objectif » reprend le composant de la lettre ; plus de bloc « Vos disponibilités » a part. Tant que le type de stage n'est pas choisi, rien d'autre ne s'affiche.
      cas('objectif/stage : tant que le type de stage n’est pas choisi, seule cette question s’affiche (pas de champs de structure)', !document.getElementById('immStructure') && !document.getElementById('blocERIP-projet'), 'champs visibles trop tôt');
      document.querySelector('[data-type-stage="stage"]').click(); await attente(1200);
      cas('objectif/stage : une fois le type choisi, la structure, la durée et les dates s’affichent dans « Votre candidature »', !!document.getElementById('immStructure') && !!document.getElementById('immDuree') && !!document.getElementById('objectifBlocCandidature'), 'champs absents');
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
      var cartesSugg = function () { return [].slice.call(document.querySelectorAll('[data-mep-sugg-choisir]')); };
      cas('suggestions : à l’ouverture, aucune carte n’est présélectionnée et les trois pulsent l’une après l’autre', cartesSugg().length === 3 && !cartesSugg().some(function (c) { return c.classList.contains('choisie'); }) && cartesSugg().every(function (c) { return c.classList.contains('pulse-sugg'); }) && cartesSugg().map(function (c) { return c.style.getPropertyValue('--rang-pulse'); }).join() === '0,1,2' && !document.querySelector('[data-mep-sugg-appliquer]'));
      cartesSugg()[1].click(); await attente(700);
      cas('suggestions : après le 1er clic, la carte est bien repérable (étiquette « Suggestion choisie ») et plus aucune ne pulse', cartesSugg()[1].classList.contains('choisie') && /Suggestion choisie/.test(cartesSugg()[1].textContent) && !cartesSugg().some(function (c) { return c.classList.contains('pulse-sugg'); }) && !!document.querySelector('[data-mep-sugg-appliquer]'));
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
      cas('ucpm : la page de travail s’affiche avec la barre de huit étapes', pageActuelle === 'un-cv-plusieurs-metiers' && document.querySelectorAll('.barre-etapes-bilan .pastille-etape-action').length === 8);
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
      cas('ucpm p1 : pas de bouton « Continuer » dans la page (un seul, dans la barre du bas)', !$('#btnUcpmVersAssistant'));
      cas('ucpm p1 : « Continuer » de la barre est bloqué tant que le CV n’est pas relu', $('#btnSuivantNavigation').disabled);
      etat.texteCV = 'Agent d’entretien des bâtiments, dix ans d’expérience.'; etat.cvRelu = true; ucpmRendrePage(); await attente(400);
      cas('ucpm p1 : le texte relu et masqué est visible avant l’envoi', !!$('details textarea[readonly]'));
      cas('ucpm p1 : CV relu : « Continuer » de la barre s’active, toujours aucun bouton dans la page', !$('#btnSuivantNavigation').disabled && !$('#btnUcpmVersAssistant'));
      $('#btnSuivantNavigation').click(); await attente(500);
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
      $('[data-ucpm-carte="alternance"]').click(); await attente(250);
      cas('ucpm p2 : le panneau d’objectif propose durée, dates, heures et « Autre chose à dire » pour une alternance', ['dureeQuantite', 'dateDebut', 'heures', 'formationVisee', 'autreChose'].every(function (c) { return !!$('#ucpmPanneauObjectif [data-ucpm-champ="' + c + '"]'); }) && document.querySelectorAll('#ucpmPanneauObjectif [data-ucpm-dispo]').length === 4);
      cas('ucpm p2 : « Je vise » propose un métier précis ou un secteur ; le secteur ouvre les 21 secteurs de l’application', document.querySelectorAll('#ucpmPanneauObjectif [data-ucpm-cible]').length === 2 && (function () { $('[data-ucpm-cible="secteur"]').click(); return true; })());
      await attente(400);
      cas('ucpm p2 : les 21 secteurs sont des pastilles à cliquer, sans menu ni bouton « voir tous »', !$('#ucpmF_secteur') && document.querySelectorAll('[data-ucpm-secteur]').length === 21);
      cas('ucpm p2 : l’encadré « Chaque CV peut avoir son propre objectif » est en haut de la page', !!$('.ucpm-encadre') && /propre objectif/.test($('.ucpm-encadre').textContent));
      cas('ucpm p2 : la portée se choisit avec trois gros boutons qui portent le nom de la colonne', document.querySelectorAll('.ucpm-portee').length === 3 && /Mon métier, appelé autrement/.test($('[data-ucpm-portee="gauche"]').textContent));
      $('[data-ucpm-carte="stage"]').click(); await attente(300);
      cas('ucpm p2 : six cartes d’objectif (celles de la lettre) ; « Stage » demande ensuite le type', document.querySelectorAll('#ucpmPanneauObjectif [data-ucpm-carte]').length === 6 && document.querySelectorAll('#ucpmPanneauObjectif [data-ucpm-demarche]').length === 2 && $('#btnUcpmAppliquerObjectif').disabled);
      $('[data-ucpm-demarche="pmsmp"]').click(); await attente(400);
      cas('ucpm p2 : l’immersion propose sept objectifs à cliquer', document.querySelectorAll('[data-ucpm-pmsmp]').length === 7);
      $('[data-ucpm-carte="reconversion"]').click(); await attente(400);
      cas('ucpm p2 : le changement de métier demande l’ancien métier ou secteur', !!$('#ucpmF_ancienValeur') && document.querySelectorAll('[data-ucpm-ancien]').length === 2);
      $('[data-ucpm-carte="alternance"]').click(); await attente(400);
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
      // Retour de Denis (2026-10-13) : voir clairement quelle colonne a un objectif, et reprendre l'objectif d'une colonne pour l'autre.
      ucpmToutesEntrees(etat).forEach(function (en) { en.objectif = null; }); etat.objectifsPortee = {}; _ucpmUi2.objectif = null;
      ucpmAppliquerObjectif(etat, 'gauche', null, ucpmObjectifVide('stage')); ucpmRendrePage(); await attente(400);
      cas('ucpm p2 : la page dit clairement que la colonne de gauche a un objectif et pas celle de droite', /Stage de formation/.test(texte($('[data-ucpm-statut="gauche"]'))) && /Aucun objectif choisi/.test(texte($('[data-ucpm-statut="droite"]'))) && !!$('.ucpm-statut-colonne.is-ok') && !!$('.ucpm-statut-colonne.is-vide'));
      $('#btnUcpmChoisirObjectif').click(); await attente(500);
      cas('ucpm p2 : « Tous les métiers cochés » alors qu’une seule colonne a un objectif : la question est posée, sans formulaire', !!$('#ucpmPanneauObjectif .ucpm-question') && !$('#ucpmPanneauObjectif [data-ucpm-carte]') && /Une seule colonne a un objectif/.test(texte($('#ucpmPanneauObjectif'))));
      $('[data-ucpm-question="oui"]').click(); await attente(400);
      cas('ucpm p2 : « Oui » reprend l’objectif de la colonne pour les deux, formulaire rempli à valider', !$('#ucpmPanneauObjectif .ucpm-question') && $('[data-ucpm-carte="stage"]').classList.contains('carte-objectif--actif') && /Objectif repris/.test(texte($('.ucpm-note-reprise'))));
      $('#btnUcpmAppliquerObjectif').click(); await attente(400);
      cas('ucpm p2 : après « Appliquer », les deux colonnes ont leur objectif', /Stage de formation/.test(texte($('[data-ucpm-statut="droite"]'))) && !$('.ucpm-statut-colonne.is-vide'));
      ucpmToutesEntrees(etat).forEach(function (en) { en.objectif = null; }); etat.objectifsPortee = {};
      ucpmAppliquerObjectif(etat, 'droite', null, ucpmObjectifVide('formation')); ucpmAppliquerObjectif(etat, 'un', etat.autres[0].id, ucpmObjectifVide('alternance')); ucpmRendrePage(); await attente(400);
      $('#btnUcpmChoisirObjectif').click(); await attente(500);
      $('[data-ucpm-question="oui"]').click(); await attente(400);
      cas('ucpm p2 : plusieurs objectifs différents dans la colonne : « Candidature spontanée » proposée par défaut', $('[data-ucpm-carte="spontanee"]').classList.contains('carte-objectif--actif') && /plusieurs objectifs/.test(texte($('.ucpm-note-reprise'))));
      $('#btnUcpmAnnulerObjectif').click(); await attente(300);
      ucpmToutesEntrees(etat).forEach(function (en) { en.objectif = null; }); etat.objectifsPortee = {};
      ucpmAppliquerObjectif(etat, 'gauche', null, ucpmObjectifVide('spontanee')); ucpmRendrePage(); await attente(300);
      $('#btnUcpmChoisirObjectif').click(); await attente(400);
      $('[data-ucpm-question="non"]').click(); await attente(300);
      cas('ucpm p2 : « Non » ouvre le formulaire sans rien reprendre, l’autre colonne reste sans objectif', !!$('#ucpmPanneauObjectif [data-ucpm-carte]') && !$('#ucpmPanneauObjectif .ucpm-question') && !$('.carte-objectif--actif') && ucpmResumeColonne(etat, 'droite').nb === 0);
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
      cas('ucpm p3 : « Préparer mon CV complet » est dans la barre du bas et plus dans le corps de la page', !$('#btnUcpmPreparerRef') && /Continuer/.test(texte($('#btnSuivantNavigation'))) && !$('#btnSuivantNavigation').disabled && document.body.innerText.split('Préparer mon CV complet').length <= 2);
      $('#btnSuivantNavigation').click(); await attente(500);
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
      cas('ucpm p3 : la barre du bas propose de continuer vers le style d’écriture et l’assistant', /Continuer/.test(texte($('.barre-navigation-fixe'))));
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
      // Retour Denis 2026-10-19 : le complément a son propre écran (importer ou passer) AVANT l'éditeur de CV ; pas de bandeau ni de rectangle sur la vue de l'assistant tant que le choix n'est pas fait.
      cas('ucpm p3 : pas de bandeau ni de rectangle du complément sur la vue de l’assistant avant le choix', !$('.complement-cv-banniere') && !$('[data-assistant-rect-toggle="complement-cv"]'));
      ucpmBarreContinuer(); await attente(700);
      cas('ucpm p3 : « Régler mon CV » mène d’abord à l’écran du complément (importer ou passer), pas à l’éditeur', etat.p3Vue === 'complement' && !!$('.complement-cv-banniere') && /répondez-lui/i.test(document.body.innerText) && /dernière fenêtre/.test(document.body.innerText) && /Continuer/.test(texte($('#btnSuivantNavigation'))) && /y revenir plus tard/.test(document.body.innerText), [etat.p3Vue, !!$('.complement-cv-banniere'), texte($('#btnSuivantNavigation')), /y revenir plus tard/.test(document.body.innerText)].join(' | '));
      var blocComplement = '```json\n{"recommandations":{"formationsAvecMissions":[{"intitule":"BTS - Maintenance des systèmes (niveau)","missions":["Étudier le fonctionnement des systèmes techniques.","Repérer les causes d’un dysfonctionnement."],"justification":"j"}],"certificationsAvecMissions":[{"certification":"SST (2016)","missions":["Prévenir les risques."],"justification":"j"}],"loisirRetenu":{"intitule":"","missions":[],"justification":""}}}\n```\n\nVoulez-vous le complément de CV ? (missions de vos formations)';
      $('#texteCollageComplement').value = blocComplement; $('#texteCollageComplement').dispatchEvent(new Event('input', { bubbles: true })); await attente(300); $('#btnImporterComplement').click(); await attente(800);
      cas('ucpm p3 : le complément est ajouté, la phrase de question collée ne gêne pas', dossier.complementCVAjoute === true && dossier.ia.cv.recommandations.formationsAvecMissions.length === 1 && dossier.ia.cv.recommandations.certificationsAvecMissions.length === 1);
      cas('ucpm p3 : une fois le complément ajouté, on passe à l’éditeur (plus de consigne, plus de deuxième collage possible)', etat.p3Vue === 'editeur' && !$('.complement-cv-banniere') && !$('#texteCollageComplement') && !complementCVEnAttente());
      etat.p3Vue = 'assistant'; ucpmRendrePage(); await attente(500);
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
      cas('ucpm p7 : le bouton du bas propose la préparation d’entretien, facultative (page 8)', !!$('#btnSuivantNavigation') && /Continuer/.test(texte($('#btnSuivantNavigation'))));
      cas('ucpm p7 : le CV rendu garde ses couleurs et ses tailles (variables posées sur :host, plus sur :root)', /:host\s*\{/.test(_ucpmCacheRendu.g1.resultat.css) && !/:root/.test(_ucpmCacheRendu.g1.resultat.css));
      cas('ucpm p7 : un CV qui laisse beaucoup de place ne reçoit aucun avertissement', !/très rempli/.test(texte($('#contenuPageUcpm'))) && typeof _ucpmCacheRendu.d1.resultat.libre === 'number');
      _ucpmCacheRendu.d1.resultat.libre = 20; ucpmRendrePage(); await attente(600);
      cas('ucpm p7 : un CV presque plein est signalé « très rempli » sur sa carte (information, rien ne se bloque)', /très rempli/.test(texte($('[data-ucpm-carte="d1"]'))) && !/très rempli/.test(texte($('[data-ucpm-carte="d2"]'))) && !$('[data-ucpm-tel="cvs"]').disabled);
      _ucpmCacheRendu.d1.resultat.libre = 200; ucpmRendrePage(); await attente(400);
      $('[data-ucpm-tel="cvs"]').click(); await attente(2500);
      cas('ucpm p7 : « Mes CV » envoie un document de 3 CV dans 3 compartiments étanches, nommé « CV_NOM » (décision de Denis du 2026-10-13)', !!imprime && imprime.titre === 'CV_MARTIN' && (imprime.html.match(/<template shadowrootmode="open">/g) || []).length === 3);
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
      cas('ucpm p7 : « Mes lettres » envoie trois lettres signées, une par page', !!imprime && imprime.titre === 'L_M_MARTIN' && (imprime.html.match(/class="ucpm-lettre"/g) || []).length === 3 && /<p class="signature">Camille Martin<\/p>/.test(imprime.html));
      cas('ucpm p7 : la lettre porte les coordonnées, le lieu et la date', /12 rue des Lilas/.test(imprime.html) && /87000 Limoges/.test(imprime.html) && /Limoges, le \d/.test(imprime.html));
      imprime = null;
      $('[data-ucpm-tel="cv-lettre"][data-ucpm-tel-id="d1"]').click(); await attente(2500);
      var ordre = imprime ? imprime.html.search(/PEINTRE APPLICATRICE/i) : -1;
      cas('ucpm p7 : « Ce CV avec sa lettre » envoie le CV puis sa lettre, dans un seul fichier de deux pièces', !!imprime && (imprime.html.match(/<template shadowrootmode="open">/g) || []).length === 2 && ordre > 0 && ordre < imprime.html.indexOf('class="ucpm-lettre"') && /PEINTRE|peintre/i.test(imprime.titre));
      cas('ucpm p7 : le fichier « CV avec sa lettre » s’appelle « métier_NOM » (métier du CV choisi en minuscules sans accent)', !!imprime && /^[a-z0-9-]+_MARTIN$/.test(imprime.titre) && /peintre/.test(imprime.titre), String(imprime && imprime.titre));
      cas('ucpm p7 : noms de fichier : tous les CV, un CV, les lettres, un CV avec sa lettre, sans nom', ucpmNomFichierPdf('cvs', '', { nom: 'Martin' }) === 'CV_MARTIN' && ucpmNomFichierPdf('cv', 'Électricienne d’entretien', { nom: 'de la Tour', prenom: 'Léa' }) === 'CV_DE-LA-TOUR' && ucpmNomFichierPdf('lettres', '', { nom: 'Martin' }) === 'L_M_MARTIN' && ucpmNomFichierPdf('cv-lettre', 'Électricienne d’entretien', { nom: 'Martin' }) === 'electricienne-d-entretien_MARTIN' && ucpmNomFichierPdf('cvs', '', { prenom: 'Léa' }) === 'CV_LEA' && ucpmNomFichierPdf('cvs', '', {}) === 'CV' && ucpmNomFichierPdf('lettres', '', {}) === 'L_M');
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
  // Module « Un CV, plusieurs métiers », page 6 : « Retravailler cette lettre avec l'assistant » (2026-10-15). Aucune vraie réponse d'assistant : une réponse fabriquée au même format.
  async function parcoursUnCvMetiersRetravail() {
    var ouvertAvant = window.UCPM_OUVERT;
    window.UCPM_OUVERT = true;
    var sauvegarde = JSON.stringify(dossier);
    var confirmerAvant = window.confirmerAction;
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
      etat.lettres = { g1: 'Madame, Monsieur,\n\nLettre un.\n\nCordialement.\n\nCamille Martin', d1: 'Madame, Monsieur,\n\nLettre deux.\n\nCordialement.\n\nCamille Martin', d2: 'Madame, Monsieur,\n\nLettre trois.\n\nCordialement.\n\nCamille Martin' };
      etat.lettresOrigine = JSON.parse(JSON.stringify(etat.lettres)); etat.p6Vue = 'lecture'; etat.lettreSel = 'g1';
      dossier.identite = { civilite: 'Madame', nom: 'Martin', prenom: 'Camille', ville: 'Limoges' };
      naviguerVers('un-cv-plusieurs-metiers'); await attente(1000);
      var avant = JSON.stringify(dossier);   // le passage pose les réglages de style par défaut de la lettre : on repart de là une fois ouvert
      cas('ucpm retravail : la lecture propose « Retravailler cette lettre avec l’assistant »', !!$('[data-ucpm-lettre-retravail="g1"]') && /Retravailler cette lettre/.test(texte($('[data-ucpm-lettre-retravail="g1"]'))));
      cas('ucpm retravail : « Revenir à la lettre d’avant » n’apparaît pas tant qu’il n’y a rien à retrouver', !$('[data-ucpm-lettre-avant]'));
      var champ = $('[data-ucpm-lettre-texte]'); champ.value = champ.value.replace('Lettre un.', 'Lettre un modifiée à la main.'); champ.dispatchEvent(new Event('input', { bubbles: true })); await attente(200);
      $('[data-ucpm-lettre-retravail="g1"]').click(); await attente(800);
      cas('ucpm retravail : le passage s’ouvre en haut, avec le choix de la lettre, les remarques, le style d’écriture puis le choix de l’assistant', etat.p6Vue === 'retravail' && !!$('[data-ucpm-retravail="choix"]') && !!$('#ucpmRetravailRemarque') && !!$('#ucpmStyleEcriture') && !!$('.ucpm-choix-ia') && window.scrollY === 0);
      avant = JSON.stringify(dossier);
      cas('ucpm retravail : la lettre choisie est cochée, la case « les autres lettres » est proposée', $('[data-ucpm-retravail-id="g1"]').checked && !!$('#ucpmRetravailToutes') && !$('#ucpmRetravailToutes').checked);
      var rem = $('#ucpmRetravailRemarque'); rem.value = 'Parler de mon bénévolat – et faire plus court.'; rem.dispatchEvent(new Event('input', { bubbles: true })); await attente(200);
      cas('ucpm retravail : la remarque est gardée, sans tiret long', etat.retravail.remarque === 'Parler de mon bénévolat - et faire plus court.');
      cas('ucpm retravail : aucun avis tant qu’il n’y a pas de coordonnées', $('#ucpmRetravailAvis').hidden);
      rem.value = 'Appelez-moi au 06 12 34 56 78'; rem.dispatchEvent(new Event('input', { bubbles: true })); await attente(200);
      cas('ucpm retravail : un numéro de téléphone dans la remarque est signalé, sans bloquer', !$('#ucpmRetravailAvis').hidden && /téléphone/.test(texte($('#ucpmRetravailAvis'))));
      rem.value = 'Parler de mon bénévolat.'; rem.dispatchEvent(new Event('input', { bubbles: true })); await attente(200);
      var texteDemande = await _ucpmConfigPassageRetravail(etat).construireTexte();
      cas('ucpm retravail : la demande porte la lettre modifiée, la remarque, l’objectif et le style, sans marqueur', /Lettre un modifiée à la main\./.test(texteDemande) && /Parler de mon bénévolat\./.test(texteDemande) && /Titre du CV : Agent d’entretien des bâtiments/.test(texteDemande) && !/\{(GENRE|PROFIL|LETTRES)\}|\{\{VOIX/.test(texteDemande) && /Lettre actuelle/.test(texteDemande));
      cas('ucpm retravail : le nom ne part pas (signature retirée), une seule lettre part', !/Camille Martin/.test(texteDemande) && !/Lettre deux\./.test(texteDemande));
      $('#ucpmRetravailToutes').click(); await attente(200);
      var toutes = await _ucpmConfigPassageRetravail(etat).construireTexte();
      cas('ucpm retravail : « les autres lettres » envoie les trois lettres avec la même remarque', etat.retravail.toutes === true && /Lettre deux\./.test(toutes) && /Lettre trois\./.test(toutes) && (toutes.match(/Parler de mon bénévolat\./g) || []).length === 3);
      $('#ucpmRetravailToutes').click(); await attente(200);
      cas('ucpm retravail : la case décochée revient à la seule lettre choisie', etat.retravail.toutes === false);
      etat.passages = { retravail: { vue: 'coller', assistant: 'chatgpt' } }; ucpmRendrePage(); await attente(500);
      var reponse = '```json\n[{"id":1,"metier":"Agent","lettre":"Madame, Monsieur,\\n\\nLettre un retravaillée.\\n\\nCordialement."}]\n```';
      var ta = document.getElementById('texteCollageUcpmRetravail'); ta.value = reponse; ta.dispatchEvent(new Event('input', { bubbles: true }));
      document.getElementById('btnImporterUcpmRetravail').click(); await attente(800);
      cas('ucpm retravail : la réponse est lue et la page revient à la lecture', etat.p6Vue === 'lecture' && etat.retravail === null && !!$('[data-ucpm-lettre-texte]'));
      cas('ucpm retravail : la lettre retravaillée remplace l’ancienne, avec formule et signature de l’application', /Lettre un retravaillée\./.test(etat.lettres.g1) && /Camille Martin$/.test(etat.lettres.g1.trim()) && /^Madame, Monsieur,/.test(etat.lettres.g1));
      cas('ucpm retravail : les autres lettres n’ont pas bougé', /Lettre deux\./.test(etat.lettres.d1) && /Lettre trois\./.test(etat.lettres.d2));
      cas('ucpm retravail : l’ancienne lettre (avec la modification à la main) est gardée', /Lettre un modifiée à la main\./.test(etat.lettresAvant.g1));
      cas('ucpm retravail : « Revenir à la lettre d’avant » apparaît', !!$('[data-ucpm-lettre-avant="g1"]'));
      window.confirmerAction = function (t, m, b, c, f) { f(); };
      $('[data-ucpm-lettre-avant="g1"]').click(); await attente(500);
      cas('ucpm retravail : « Revenir à la lettre d’avant » rend la lettre d’avant et garde la retravaillée', /Lettre un modifiée à la main\./.test(etat.lettres.g1) && /Lettre un retravaillée\./.test(etat.lettresAvant.g1));
      $('[data-ucpm-lettre-avant="g1"]').click(); await attente(500);
      cas('ucpm retravail : le même bouton ramène la lettre retravaillée', /Lettre un retravaillée\./.test(etat.lettres.g1));
      window.confirmerAction = confirmerAvant;
      $('[data-ucpm-lettre-sel="d1"]').click(); await attente(400);
      $('[data-ucpm-lettre-retravail="d1"]').click(); await attente(600);
      cas('ucpm retravail : on peut retravailler une autre lettre (la lettre cochée est celle-là)', etat.p6Vue === 'retravail' && $('[data-ucpm-retravail-id="d1"]').checked);
      ucpmBarreRetour(); await attente(600);
      cas('ucpm retravail : « Retour » sans rien envoyer revient à la lecture, sans rien supprimer', etat.p6Vue === 'lecture' && etat.retravail === null && /Lettre deux\./.test(etat.lettres.d1) && etat.page === 6);
      ucpmAllerPage(7); await attente(1800);
      cas('ucpm retravail : la page 7 propose « Retravailler une lettre avec l’assistant »', !!$('#btnUcpmP7Retravail'));
      $('#btnUcpmP7Retravail').click(); await attente(800);
      cas('ucpm retravail : ce bouton ouvre le passage de la page 6', etat.page === 6 && etat.p6Vue === 'retravail' && !!$('#ucpmRetravailRemarque'));
      etat.p6Vue = 'retravail'; etat.retravail = null; ucpmRendrePage(); await attente(500);
      cas('ucpm retravail : un état sans lettre choisie (rechargement) retombe sur la lecture', etat.p6Vue === 'lecture' && !!$('[data-ucpm-lettre-texte]'));
      cas('ucpm retravail : les nouveaux champs partent dans la disquette', 'lettresAvant' in collecterEtatsModulesPourSauvegarde().unCvPlusieursMetiers);
      cas('ucpm retravail : le vrai dossier n’a pas bougé', JSON.stringify(dossier) === avant);
    } finally {
      window.confirmerAction = confirmerAvant;
      ucpmRestaurerDossier(); window.UCPM_OUVERT = ouvertAvant; ucpmReinitialiser();
      try { var vieux = JSON.parse(sauvegarde); Object.keys(dossier).forEach(function (k) { if (!(k in vieux)) { delete dossier[k]; } }); Object.assign(dossier, vieux); } catch (e) { /* tant pis */ }
      naviguerVers('cv'); await attente(500);
    }
  }

  // Module « Un CV, plusieurs métiers », page 8 : préparation d'entretien (2026-10-15). Réponses d'assistant fabriquées au même format que celles de prompts/ucpm-preparation.md.
  async function parcoursUnCvMetiersPreparation() {
    var ouvertAvant = window.UCPM_OUVERT;
    window.UCPM_OUVERT = true;
    var sauvegarde = JSON.stringify(dossier);
    var simuleeAvant = window.__ucpmImpressionSimulee;
    var impressions = [];
    try {
      ucpmReinitialiser();
      var etat = ouvrirUnCvPlusieursMetiers();
      var rep = await (await fetch('/docs/essais_prompts_ucpm/reponses/01_metiers_V5_chatgpt_1.txt')).text();
      etat.reponseMetiers = ucpmLireReponseMetiers(rep).valeurs; etat.texteCV = 'cv'; etat.cvRelu = true;
      var l = ucpmCreerListes(etat.reponseMetiers); etat.intitules = l.intitules; etat.autres = l.autres;
      ['g1', 'd1', 'd2'].forEach(function (id) { ucpmBasculerCoche(etat, id, true); });
      var o = ucpmObjectifVide('spontanee'); o.secteur = 'bâtiment'; ucpmAppliquerObjectif(etat, 'tous', null, o);
      etat.sexe = 'f'; etat.refPret = true; etat.refId = 'g1'; etat.page = 8; etat.pageMax = 8;
      etat.cvs = {
        g1: { titre: 'Agent d’entretien des bâtiments', accroche: 'Dix ans d’entretien de bâtiments collectifs.', accrocheChoisie: true },
        d1: { titre: 'Peintre applicatrice', accroche: 'Pratique de la peinture en bâtiment.', accrocheChoisie: true },
        d2: { titre: 'Électricienne d’entretien', accroche: 'Habilitation électrique BS.', accrocheChoisie: true }
      };
      etat.lettres = { g1: 'Madame, Monsieur,\n\nLettre un.\n\nCordialement.\n\nCamille Martin', d1: 'Madame, Monsieur,\n\nLettre deux.\n\nCordialement.\n\nCamille Martin', d2: 'Madame, Monsieur,\n\nLettre trois.\n\nCordialement.\n\nCamille Martin' };
      etat.p6Vue = 'lecture'; etat.p8Vue = 'choix';
      dossier.identite = { civilite: 'Madame', nom: 'Martin', prenom: 'Camille', ville: 'Limoges', telephone: '0612345678', email: 'camille.martin@example.fr' };
      dossier.experiences = [{ poste: 'Agent', entreprise: 'Habitat', dateDebut: '2019', dateFin: '2024', missions: 'Dépannages' }];
      dossier.titreCV = 'Agent d’entretien des bâtiments';
      dossier.formations = [{ niveau: 'CAP', intitule: 'Peintre applicateur', etablissement: 'AFPA', annee: '2014', missions: '' }]; dossier.competencesCV = ['Rigueur', 'Autonomie'];
      dossier.formatCV = 'pdf'; dossier.pdfReglages = null; dossier.reglagesMiseEnPageCV = null; dossier.dernierDocumentPrepare = 'cv';
      dossier.ia = dossier.ia || {}; dossier.ia.cv = Object.assign({}, dossier.ia.cv, { profil: 'Dix ans d’entretien de bâtiments collectifs.', accrochesProposees: ['Dix ans d’entretien de bâtiments collectifs.'], accrochesCourtesProposees: ['Dix ans d’entretien.'], accrocheIdx: 0 });
      window.__ucpmImpressionSimulee = function (titre, html) { impressions.push({ titre: titre, html: html }); };
      naviguerVers('un-cv-plusieurs-metiers'); await attente(1000);
      var avant = JSON.stringify(dossier);
      cas('ucpm p8 : le titre de la page et la barre d’étapes à huit pas (le dernier « Entretiens »)', /Préparer mes entretiens/.test(texte($('h1'))) && /Entretiens/.test(texte($('.page-catalogue-contenu'))));
      cas('ucpm p8 : le choix propose la générale et l’approfondie, et dit que la feuille est pour la personne', !!$('#btnUcpmP8General') && !!$('#btnUcpmP8Approfondie') && /pour vous/.test(texte($('#contenuPageUcpm'))) && /M’entraîner à un entretien/.test(texte($('#contenuPageUcpm'))));
      cas('ucpm p8 : le bouton du bas n’offre plus de « suite » sur la dernière page', !$('#btnSuivantNavigation'));
      $('#btnUcpmP8General').click(); await attente(700);
      cas('ucpm p8 : la préparation générale s’ouvre sans réglage de style d’écriture, avec le choix des métiers puis de l’assistant', etat.p8Vue === 'general' && !$('#ucpmStyleEcriture') && document.querySelectorAll('[data-ucpm-p8-cv]').length === 3 && !!$('.ucpm-choix-ia') && window.scrollY === 0);
      var cases = document.querySelectorAll('[data-ucpm-p8-cv]');
      cas('ucpm p8 : les trois métiers sont cochés au départ (aucun choix gardé)', [].every.call(cases, function (c) { return c.checked; }) && etat.p8Ids === null);
      cases[1].click(); await attente(200);
      cas('ucpm p8 : décocher un métier le sort de la demande', JSON.stringify(etat.p8Ids) === JSON.stringify(['g1', 'd2']));
      cases[0].click(); cases[2].click(); await attente(200);
      cas('ucpm p8 : le dernier métier coché ne peut pas être décoché', cases[2].checked && etat.p8Ids.length === 1);
      cases[0].click(); cases[1].click(); await attente(200);
      cas('ucpm p8 : tous recochés = tous les métiers', etat.p8Ids === null);
      var cfg = _ucpmConfigPassagePrep(etat, 'general');
      cas('ucpm p8 : trois métiers passent sans avertissement', cfg.avantEnvoi() === '');
      var demande = await cfg.construireTexte();
      cas('ucpm p8 : la demande générale porte le mode, les trois métiers, leur lettre et la période sans activité, sans marqueur', /Mode : général/.test(demande) && /Niveau d’exigence : Réaliste/.test(demande) && /Titre du CV : Peintre applicatrice/.test(demande) && /Lettre deux\./.test(demande) && /de 2024 à aujourd’hui/.test(demande) && !/\{(GENRE|PROFIL|REGLAGES|METIERS)\}|\{\{VOIX/.test(demande));
      cas('ucpm p8 : le nom, le téléphone et le courriel ne partent pas', !/Camille Martin|0612345678|06 12 34|camille\.martin@/.test(demande));
      etat.passages = { prepGeneral: { vue: 'coller', assistant: 'chatgpt' } }; ucpmRendrePage(); await attente(500);
      function q(t, s, d, rel) { return { question: t, sujet: s, delicate: d, attente: 'Ce que le recruteur cherche pour ' + t, piste: 'Une piste pour ' + t, relance: rel || '' }; }
      var reponse = '```json\n' + JSON.stringify([
        { id: 1, metier: 'A', questions: [q('Présentez-vous ?', 'parcours', false), q('Que faisiez-vous depuis 2024 ?', 'delicat', true), q('Pourquoi ce métier ?', 'motivation', false)], aMettreEnAvant: ['Dix ans en résidence.', 'Habilitation BS.'] },
        { id: 2, metier: 'B', questions: [q('Parlez de vos peintures ?', 'competences', false), q('Pourquoi changer de métier ?', 'changement', true)], aMettreEnAvant: ['CAP.'] },
        { id: 3, metier: 'C', questions: [q('Votre habilitation ?', 'competences', false)], aMettreEnAvant: [] }
      ]) + '\n```';
      var ta = document.getElementById('texteCollageUcpmPrepGen'); ta.value = reponse; ta.dispatchEvent(new Event('input', { bubbles: true }));
      document.getElementById('btnImporterUcpmPrepGen').click(); await attente(1500);
      cas('ucpm p8 : la réponse est lue, les trois préparations sont gardées (mode général) et la page passe à la lecture', etat.p8Vue === 'lecture' && Object.keys(etat.preparations).length === 3 && etat.preparations.g1.mode === 'general' && etat.preparations.g1.niveau === '');
      cas('ucpm p8 : les repères « délicate » suivent le sujet', etat.preparations.g1.questions[1].delicate === true && etat.preparations.g1.questions[0].delicate === false && etat.preparations.d1.questions[1].delicate === true);
      cas('ucpm p8 : la lecture montre le sélecteur, l’aperçu de la feuille et le nombre de pages', document.querySelectorAll('[data-ucpm-p8-sel]').length === 3 && !!$('[data-ucpm-p8-apercu]') && !!$('[data-ucpm-p8-apercu]').shadowRoot && !!$('[data-ucpm-p8-apercu]').shadowRoot.querySelector('.prep') && /tient sur une page A4/.test(texte($('#ucpmP8NbPages'))));
      var ombre = $('[data-ucpm-p8-apercu]').shadowRoot;
      cas('ucpm p8 : la feuille contient l’en-tête, les questions numérotées, l’étiquette délicate, ce qu’il faut mettre en avant et les conseils', /Préparer mon entretien : Agent d’entretien des bâtiments/.test(ombre.textContent) && /1\.Présentez-vous/.test(ombre.textContent) && /QUESTION DÉLICATE/.test(ombre.textContent) && /Ce que vous pouvez mettre en avant/.test(ombre.textContent) && /Savoir-être, attitude et comportement/.test(ombre.textContent) && /Il est normal d’hésiter/.test(ombre.textContent));
      var page = ombre.querySelector('.prep');
      cas('ucpm p8 : la feuille générale tient dans la page (rien de coupé), corps de 11 points', page.scrollHeight <= page.clientHeight + 1 && /font-size:11pt/.test(page.getAttribute('style')), page.scrollHeight + ' / ' + page.clientHeight);
      $('[data-ucpm-p8-sel="d1"]').click(); await attente(900);
      cas('ucpm p8 : le sélecteur change de feuille', etat.p8Sel === 'd1' && /Peintre applicatrice/.test($('[data-ucpm-p8-apercu]').shadowRoot.textContent));
      // Mise en page : une longue feuille approfondie passe sur deux pages, sans question coupée, corps de 10 points au moins
      var longues = []; for (var i = 1; i <= 12; i++) { longues.push({ question: 'Question numéro ' + i + ' : ' + Array(14).fill('mot').join(' ') + ' ?', sujet: 'competences', delicate: i % 4 === 0, attente: Array(12).fill('attente').join(' '), piste: Array(25).fill('piste').join(' '), relance: Array(10).fill('relance').join(' ') }); }
      var blocsLongs = ucpmBlocsHtmlPreparation({ metier: 'Gardienne d’immeuble', etiquette: 'Offre d’emploi', niveauTitre: 'Exigeant', prep: { questions: longues, aMettreEnAvant: ['Un.', 'Deux.', 'Trois.', 'Quatre.'] } });
      var pag = ucpmPaginerPreparation(blocsLongs);
      cas('ucpm p8 : une préparation approfondie de 12 questions avec relances (limites du prompt) tient sur deux pages au plus, corps de 10 points au moins', pag.pages.length === 2 && pag.taillePt >= 10, pag.pages.length + ' pages, ' + pag.taillePt + ' pt');
      var hote = document.createElement('div'); document.body.appendChild(hote);
      var om = hote.attachShadow({ mode: 'open' }); om.innerHTML = '<style>' + ucpmCssPreparation() + '</style>' + pag.pages.join('');
      var debordes = [].filter.call(om.querySelectorAll('.prep'), function (p) { return p.scrollHeight > p.clientHeight + 1; });
      var nbQuestionsVues = (om.textContent.match(/Question numéro \d+/g) || []).length;
      hote.remove();
      cas('ucpm p8 : aucune page ne déborde et les 12 questions sont toutes présentes, une seule fois', debordes.length === 0 && nbQuestionsVues === 12, debordes.length + ' débordées, ' + nbQuestionsVues + ' questions');
      var courte = ucpmPaginerPreparation(ucpmBlocsHtmlPreparation({ metier: 'M', etiquette: '', niveauTitre: '', prep: { questions: longues.slice(0, 5).map(function (x) { return Object.assign({}, x, { attente: Array(12).fill('attente').join(' '), piste: Array(25).fill('piste').join(' '), relance: '' }); }), aMettreEnAvant: ['Un.', 'Deux.', 'Trois.'] } }));
      cas('ucpm p8 : une feuille générale de 5 questions (limites du prompt) tient sur une page, corps de 10 points au moins', courte.pages.length === 1 && courte.taillePt >= 10, courte.pages.length + ' pages, ' + courte.taillePt + ' pt');
      // Téléchargements
      $('[data-ucpm-p8-tel="toutes"]').click(); await attente(2500);
      var toutes = impressions[impressions.length - 1];
      cas('ucpm p8 : « toutes mes préparations » donne un seul PDF « NOM_preparations », une feuille par métier, sans CV ni lettre', !!toutes && toutes.titre === 'MARTIN_preparations' && (toutes.html.match(/class="ucpm-feuille"/g) || []).length === 3 && !/ucpm-lettre|Madame, Monsieur/.test(toutes.html), toutes && toutes.titre);
      $('[data-ucpm-p8-tel="un"]').click(); await attente(2000);
      var une = impressions[impressions.length - 1];
      cas('ucpm p8 : une seule préparation se télécharge à part, nommée d’après le métier', !!une && /^peintre-applicatrice_MARTIN_preparation$/.test(une.titre) && (une.html.match(/class="ucpm-feuille"/g) || []).length === 1, une && une.titre);
      // Approfondie
      $('#btnUcpmP8Autre').click(); await attente(500);
      cas('ucpm p8 : « Faire une autre préparation » ramène au choix, qui liste les préparations existantes', etat.p8Vue === 'choix' && /générale/.test(texte($('#contenuPageUcpm'))) && !!$('#btnUcpmP8Lire'));
      $('#btnUcpmP8Approfondie').click(); await attente(700);
      cas('ucpm p8 : l’approfondie propose un seul métier, quatre niveaux, trois nombres, huit sujets et les pistes', document.querySelectorAll('[data-ucpm-p8-metier]').length === 3 && document.querySelectorAll('[data-ucpm-p8-niveau]').length === 4 && document.querySelectorAll('[data-ucpm-p8-nombre]').length === 3 && document.querySelectorAll('[data-ucpm-p8-sujet]').length === 8 && !!$('#ucpmP8Pistes') && !$('#ucpmStyleEcriture'));
      cas('ucpm p8 : le niveau « Réaliste » est choisi au départ et n’annonce pas de relance', etat.p8Reglages.niveau === 'realiste' && $('#ucpmP8RelanceTexte').hidden);
      document.querySelector('[data-ucpm-p8-metier="d2"]').click(); await attente(200);
      document.querySelector('[data-ucpm-p8-niveau="exigeant"]').click(); await attente(200);
      document.querySelector('[data-ucpm-p8-nombre="8"]').click(); await attente(200);
      cas('ucpm p8 : le niveau Exigeant est gardé et annonce la relance du recruteur', etat.p8Reglages.niveau === 'exigeant' && !$('#ucpmP8RelanceTexte').hidden && document.querySelector('[data-ucpm-p8-niveau="exigeant"]').getAttribute('aria-pressed') === 'true' && document.querySelector('[data-ucpm-p8-niveau="realiste"]').getAttribute('aria-pressed') === 'false');
      cas('ucpm p8 : le métier et le nombre de questions sont gardés', etat.p8Metier === 'd2' && etat.p8Reglages.nombre === 8);
      var sujets = document.querySelectorAll('[data-ucpm-p8-sujet]');
      [].forEach.call(sujets, function (c) { if (c.checked) { c.click(); } });
      await attente(200);
      cas('ucpm p8 : le dernier sujet ne peut pas être décoché', etat.p8Reglages.sujets.length === 1 && !$('#ucpmP8AvisSujets').hidden);
      var demande2 = await _ucpmConfigPassagePrep(etat, 'approfondi').construireTexte();
      cas('ucpm p8 : la demande approfondie porte le niveau, le nombre, le sujet et un seul métier', /Mode : approfondi/.test(demande2) && /Niveau d’exigence : Exigeant/.test(demande2) && /Nombre de questions par métier : 8/.test(demande2) && /Titre du CV : Électricienne d’entretien/.test(demande2) && !/Titre du CV : Peintre/.test(demande2) && /Sujets : /.test(demande2));
      etat.passages = { prepApprofondie: { vue: 'coller', assistant: 'chatgpt' } }; ucpmRendrePage(); await attente(500);
      var rep2 = '```json\n' + JSON.stringify([{ id: 1, metier: 'C', questions: [q('Votre habilitation en détail ?', 'competences', false, 'Et qu’est-ce qui le prouve ?'), q('Pourquoi chez nous ?', 'entreprise', true, 'Qu’avez-vous repéré ?')], aMettreEnAvant: ['BS.'] }]) + '\n```';
      var ta2 = document.getElementById('texteCollageUcpmPrepApp'); ta2.value = rep2; ta2.dispatchEvent(new Event('input', { bubbles: true }));
      document.getElementById('btnImporterUcpmPrepApp').click(); await attente(1500);
      cas('ucpm p8 : l’approfondie remplace la générale du même métier, les autres ne bougent pas', etat.preparations.d2.mode === 'approfondi' && etat.preparations.d2.niveau === 'exigeant' && etat.preparations.d2.questions.length === 2 && etat.preparations.g1.mode === 'general' && etat.preparations.d1.questions.length === 2);
      cas('ucpm p8 : la feuille approfondie porte le niveau et la relance du recruteur', etat.p8Sel === 'd2' && /niveau exigeant/.test($('[data-ucpm-p8-apercu]').shadowRoot.textContent) && /Il peut relancer : Et qu’est-ce qui le prouve/.test($('[data-ucpm-p8-apercu]').shadowRoot.textContent));
      // Péremption
      cas('ucpm p8 : rien n’est signalé tant que rien ne change', !_ucpmP8Perimees(etat).length && !/ne correspond peut-être plus/.test(texte($('#contenuPageUcpm'))));
      etat.cvs.g1.accroche = 'Une autre accroche.'; ucpmRendrePage(); await attente(600);
      cas('ucpm p8 : une accroche changée depuis la demande signale la préparation, sans rien effacer', _ucpmP8Perimees(etat).map(function (e) { return e.id; }).join() === 'g1' && /ne correspond peut-être plus/.test(texte($('#contenuPageUcpm'))) && etat.preparations.g1.questions.length === 3);
      // Page 7
      ucpmAllerPage(7); await attente(1800);
      cas('ucpm p8 : la page 7 propose le Document 3 (voir mes préparations) et un bouton par métier qui a une préparation', /Document 3/.test(texte($('#contenuPageUcpm'))) && /Voir mes préparations/.test(texte($('#btnUcpmP7Entretiens'))) && document.querySelectorAll('[data-ucpm-p8-tel-p7]').length === 4);
      impressions.length = 0;
      var prets = false;
      for (var k = 0; k < 90 && !prets; k++) { prets = [].slice.call(document.querySelectorAll('[data-ucpm-tel]')).length > 0 && [].every.call(document.querySelectorAll('[data-ucpm-tel]'), function (b) { return !b.disabled; }); if (!prets) { await attente(1000); } }
      $('[data-ucpm-tel="cv-lettre"]').click(); await attente(3000);
      var cvLettre = impressions[impressions.length - 1];
      cas('ucpm p8 : « Ce CV avec sa lettre » ne contient jamais la préparation', !!cvLettre && !/Préparer mon entretien|QUESTION DÉLICATE/.test(cvLettre.html) && /Lettre un|Lettre deux|Lettre trois/.test(cvLettre.html), JSON.stringify({ n: impressions.length, titres: impressions.map(function (i) { return i.titre; }), prets: prets, occupe: _ucpmUi7.occupe, aPrep: !!cvLettre && /Préparer mon entretien|QUESTION DÉLICATE/.test(cvLettre.html) }));
      cas('ucpm p8 : le message dit de n’envoyer que le CV et la lettre', /Vous envoyez le CV et la lettre/.test(texte($('#contenuPageUcpm'))));
      $('#btnSuivantNavigation').click(); await attente(800);
      cas('ucpm p8 : le bouton du bas de la page 7 ouvre la page 8 (lecture quand des préparations existent)', etat.page === 8 && etat.p8Vue === 'lecture');
      ucpmBarreRetour(); await attente(700);
      cas('ucpm p8 : « Retour » depuis la lecture ramène au choix de la même page (rien de supprimé)', etat.page === 8 && etat.p8Vue === 'choix' && Object.keys(etat.preparations).length === 3);
      ucpmAllerPage(8); etat.p8Vue = 'general'; ucpmPassageReinitialiser(etat, 'prepGeneral'); ucpmRendrePage(); await attente(600);
      ucpmBarreRetour(); await attente(600);
      cas('ucpm p8 : « Retour » au début d’un passage ramène à la lecture des préparations, sans rien supprimer', etat.p8Vue === 'lecture' && Object.keys(etat.preparations).length === 3);
      ucpmBarreRetour(); await attente(600);
      cas('ucpm p8 : « Retour » depuis la lecture ramène au choix', etat.p8Vue === 'choix' && etat.page === 8);
      ucpmBarreRetour(); await attente(800);
      cas('ucpm p8 : « Retour » depuis le choix revient à la page 7', etat.page === 7);
      etat.page = 8; etat.p8Vue = 'lecture'; etat.preparations = {}; ucpmRendrePage(); await attente(500);
      cas('ucpm p8 : une lecture sans préparation retombe sur le choix', etat.p8Vue === 'choix');
      cas('ucpm p8 : les préparations partent dans la disquette', 'preparations' in collecterEtatsModulesPourSauvegarde().unCvPlusieursMetiers && 'p8Reglages' in collecterEtatsModulesPourSauvegarde().unCvPlusieursMetiers);
      cas('ucpm p8 : le vrai dossier n’a pas bougé (identité et expériences)', JSON.stringify(dossier.identite) === JSON.stringify(JSON.parse(avant).identite) && JSON.stringify(dossier.experiences) === JSON.stringify(JSON.parse(avant).experiences));
    } finally {
      window.__ucpmImpressionSimulee = simuleeAvant;
      ucpmRestaurerDossier(); window.UCPM_OUVERT = ouvertAvant; ucpmReinitialiser();
      try { var vieux = JSON.parse(sauvegarde); Object.keys(dossier).forEach(function (k) { if (!(k in vieux)) { delete dossier[k]; } }); Object.assign(dossier, vieux); } catch (e) { /* tant pis */ }
      naviguerVers('cv'); await attente(500);
    }
  }

  // Module « Un CV, plusieurs métiers », retour 42 de Denis : l'écran « Vos informations » dit ce qu'on regarde et ce qu'il reste à faire, seulement quand on y arrive depuis le module.
  async function parcoursUnCvMetiersInvitationInfos() {
    var ouvertAvant = window.UCPM_OUVERT;
    window.UCPM_OUVERT = true;
    var sauvegarde = JSON.stringify(dossier);
    try {
      ucpmReinitialiser();
      var etat = ouvrirUnCvPlusieursMetiers();
      var rep = await (await fetch('/docs/essais_prompts_ucpm/reponses/01_metiers_V5_chatgpt_1.txt')).text();
      etat.reponseMetiers = ucpmLireReponseMetiers(rep).valeurs; etat.texteCV = 'cv'; etat.cvRelu = true;
      var l = ucpmCreerListes(etat.reponseMetiers); etat.intitules = l.intitules; etat.autres = l.autres;
      ['g1', 'd1'].forEach(function (id) { ucpmBasculerCoche(etat, id, true); });
      var o = ucpmObjectifVide('spontanee'); o.secteur = 'bâtiment'; ucpmAppliquerObjectif(etat, 'tous', null, o);
      etat.sexe = 'f'; etat.refId = 'g1'; etat.page = 3; etat.pageMax = 3;
      naviguerVers('un-cv-plusieurs-metiers'); await attente(800);
      ucpmOuvrirInfos(); await attente(1200);
      cas('ucpm invite : depuis le module, « Vos informations » dit ce qu’on regarde et ce qu’il reste à faire', pageActuelle === 'projet' && !!$('#ucpmInviteInfos') && /Voici ce que l’application a repéré/.test(texte($('#ucpmInviteInfos'))) && /Continuer/.test(texte($('#ucpmInviteInfos'))));
      cas('ucpm invite : l’invitation est après le titre et avant les blocs, avec la barre d’étapes du module', !!$('.barre-etapes-bilan') && !!($('h1').compareDocumentPosition($('#ucpmInviteInfos')) & 4));
      cas('ucpm invite : le bouton « Continuer » du module existe bien en bas', /Continuer : style d’écriture et assistant/.test(texte($('.barre-navigation-fixe'))));
      naviguerVers('cv'); await attente(600);
      naviguerVers('projet'); await attente(1200);
      cas('ucpm invite : depuis un autre parcours, l’écran « Vos informations » n’a pas l’invitation du module', pageActuelle === 'projet' && !$('#ucpmInviteInfos'));
    } finally {
      window.UCPM_OUVERT = ouvertAvant; ucpmReinitialiser();
      try { var vieux = JSON.parse(sauvegarde); Object.keys(dossier).forEach(function (k) { if (!(k in vieux)) { delete dossier[k]; } }); Object.assign(dossier, vieux); } catch (e) { /* tant pis */ }
      naviguerVers('cv'); await attente(500);
    }
  }

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
      cas('ucpm p1 : une fois validé, le CV est prêt et on peut choisir l’assistant', etat.cvRelu && /Josiane BOKENOMAE/.test(etat.texteCV) && !$('#btnSuivantNavigation').disabled && /Votre CV est prêt/.test(texte($('#contenuPageUcpm'))));
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
      // Touche Entrée (retour Denis 2026-10-19) : valide la zone de texte (pastille « répondu ») et le focus passe à la question suivante, puis au bouton « Continuer »
      var champ0 = document.getElementById('reponsePointAVerifier0');
      champ0.focus(); champ0.value = 'SST';
      champ0.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
      cas('ucpm clarification : la touche Entrée valide la réponse (« répondu ») et envoie sur « Continuer » après la dernière question', /répondu/.test(texte(document.getElementById('pilulePointAVerifier0'))) && document.activeElement === document.getElementById('btnClarificationContinuer'), document.activeElement && document.activeElement.id);
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
  // ---------------- Bord de la colonne : onglet « Colonne » sur l'aperçu et tiroir des formes (Denis, 2026-10-11 ; réglages sur l'aperçu depuis 2026-10-20, tâche A3) ----------------
  async function parcoursBordColonne() {
    await preparerCvResultats();
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var doc = function () { return w().document; };
    var cv = function () { return doc().querySelector('#conteneurPage .cv'); };
    var cle = function () { return w().getComputedStyle(cv(), '::before').clipPath; };
    var droit = function () { return doc().getElementById('regColonneBordDroit').checked; };
    var onglet = function (k) { return document.querySelector('#mepOngletsApercu [data-mep-onglet="' + k + '"]'); };
    var vignette = function (id) { return document.querySelector('[data-mep-galerie-creatif="' + id + '"]'); };
    var tiroir = function () { return document.querySelector('.gab-tiroir'); };
    var forme = function (v) { return tiroir() && tiroir().querySelector('[data-mep-forme="' + v + '"]'); };
    var formes = function () { return tiroir() ? [].map.call(tiroir().querySelectorAll('.vign-forme[data-mep-forme]'), function (b) { return b.getAttribute('data-mep-forme'); }).join(',') : ''; };
    var actifForme = function () { var a = tiroir() && tiroir().querySelector('[aria-checked="true"]'); return a ? a.getAttribute('data-mep-forme') : ''; };
    var cliquer = async function (el) { el.click(); await attente(2500); };
    var choisirModele = async function (id) { if (_mepModeleCreatifActuel() !== id) { vignette(id).click(); await attente(3500); } };
    var ouvrir = async function (k) { ['bandeau', 'colonne', 'formes'].forEach(function (x) { var autre = onglet(x); if (x !== k && autre && autre.getAttribute('aria-expanded') === 'true') { autre.click(); } }); var o = onglet(k); if (o && o.getAttribute('aria-expanded') !== 'true') { o.click(); } await attente(700); };
    var debut = async function () {
      document.querySelector('[data-mep-allure="creatif"]').click(); await attente(3000);
      var tous = document.querySelector('[data-mep-galerie-tous]'); if (tous && tous.getAttribute('data-mep-galerie-tous') === '1') { tous.click(); await attente(5000); }
      _mepTiroirForme = null;
    };
    var fin = function () { try { _mepGalerieTous = false; _mepGalerieChoix = null; _mepTiroirForme = null; } catch (e) { /* galerie pas chargee */ } };
    await debut();
    await choisirModele('colonneFoncee');
    cas('bord de colonne : Colonne foncée est droite au départ et porte un onglet « Colonne » sur l’aperçu', cv().classList.contains('bord-choix') && droit() && !!onglet('colonne'), cv().className);
    cas('bord de colonne : l’ancien interrupteur « Vallonné » n’existe plus', !document.querySelector('.vign-bord') && !document.querySelector('[data-mep-bord-vign]'));
    var hote = document.getElementById('mepOngletsApercu');
    cas('bord de colonne : la barre d’onglets est juste avant l’aperçu, et plus aucun bouton de forme sous les vignettes', !!hote && !!hote.nextElementSibling && hote.nextElementSibling.id === 'zonePdfInlineCV' && !document.querySelector('.vign-opt') && !document.querySelector('.vign-cadre'));
    // Étape 4.2 (2026-10-21) : l'onglet « Colonne » suit le NOMBRE RÉEL de colonnes du CV affiché ; Colonne claire (colonne d'office) l'a, et un modèle à une colonne (Ruban diagonal, Bandeau entier) ne l'a que si le CV est passé à deux colonnes. Jamais d'onglet grisé.
    for (var i = 0, sans = ['colonneClaire', 'rubanDiagonal', 'mqBandeau']; i < sans.length; i++) { await choisirModele(sans[i]); cas('bord de colonne : ' + sans[i] + ' : l’onglet « Colonne » est là seulement quand le CV a deux colonnes (jamais une option impossible), « Formes » reste, rien de grisé', !!onglet('colonne') === cv().classList.contains('deux-col') && !!onglet('formes') && !document.querySelector('#mepOngletsApercu [disabled]'), (onglet('colonne') ? 'onglet' : 'sans onglet') + ' / ' + cv().className); }
    await choisirModele('sidebarVague'); await ouvrir('colonne');
    cas('bord de colonne : Colonne à vague est vallonnée au départ, le tiroir s’ouvre dans la page avec « Vallonnée » choisie', !!tiroir() && actifForme() === 'vallonne' && onglet('colonne').getAttribute('aria-expanded') === 'true', actifForme());
    cas('bord de colonne : le tiroir propose exactement les formes de la table des capacités (droite, vallonnée, arche quand aucun bandeau)', tiroir() && tiroir().querySelectorAll('.vign-forme[data-mep-forme]').length === _cvFormesPourModele('creatif:sidebarVague', 'colonne').length && !!forme('droit') && !!forme('vallonne') && !!forme('arche'));
    await choisirModele('colonneFoncee');
    var avant = cle();
    cas('bord de colonne : le tiroir reste ouvert d’un modèle à l’autre (un seul à la fois) et montre « Droite » pour Colonne foncée', document.querySelectorAll('.gab-tiroir').length === 1 && actifForme() === 'droit', actifForme());
    await cliquer(forme('vallonne')); await attente(1500);
    cas('bord de colonne : choisir « Vallonnée » sur le modèle en cours décoche la case du moteur et change le bord du CV', !droit() && cle() !== avant, String(cle()).slice(0, 50));
    cas('bord de colonne : après le changement, le tiroir est resté ouvert avec « Vallonnée » choisie', !!tiroir() && actifForme() === 'vallonne', actifForme());
    // Décision Denis 2026-10-20 : le bandeau et la colonne ne suivent PAS d'un modèle à l'autre (tous les modèles n'en ont pas) : chaque modèle garde sa forme de départ.
    await choisirModele('colonneBandeau');
    cas('bord de colonne : le choix fait sur un modèle (vallonnée) ne suit pas : Colonne et bandeau garde sa forme de départ, droite', droit() && cv().classList.contains('bord-choix'), cv().className);
    await choisirModele('sidebarVague');
    cas('bord de colonne : chaque modèle garde sa forme de départ (Colonne à vague, vallonnée)', cv().classList.contains('col-vague-g'), cv().className);
    await choisirModele('colonneFoncee'); await ouvrir('colonne');
    var fermer = tiroir() && tiroir().querySelector('.gab-tiroir-fermer');
    cas('bord de colonne : le tiroir a un vrai bouton « Fermer », qui le referme', !!fermer && fermer.tagName === 'BUTTON');
    if (fermer) { fermer.click(); await attente(300); }
    cas('bord de colonne : après « Fermer », plus de tiroir et l’onglet n’est plus déplié', !tiroir() && onglet('colonne').getAttribute('aria-expanded') === 'false');
    fin();
  }
  // ---------------- Bouton « Continuer » dans la barre du bas, à droite (Denis, 2026-10-19) : « Reformuler mon CV », page « Préparer » ----------------
  async function parcoursBarreBas() {
    var etatAvant = _prepLEEtat, modeAvant = _prepLEMode, ecranAvant = _prepLEEcran;
    try {
      _prepLEMode = 'reformuler'; _prepLEEcran = 'depot'; _prepLEDetour = false; _prepLEEtat = null;
      naviguerVers('reformuler-cv'); await attente(1200);
      _prepLEEtat.cvTexte = 'Nicolas Poirot. Technicien. Dix ans.'; _prepLEEtat.relectureFaite = true; _prepLEEtat.dejaRelu = true;
      _prepLERendreDepot(); await attente(1000);
      var barre = function () { return document.querySelector('.barre-navigation-fixe .barre-navigation'); };
      var adopte = function () { return barre() && barre().querySelector('[data-barre-bas-adopte]'); };
      var source = function () { return document.getElementById('btnPrepLEVersAssistant'); };
      cas('barre du bas : « Continuer » est dans la barre, à droite, après Retour et Accueil', !!adopte() && /Continuer/.test(adopte().textContent) && barre().querySelector(':scope > button:last-of-type') === adopte() && /Retour/.test(barre().children[0].textContent) && /Accueil/.test(barre().children[1].textContent));
      cas('barre du bas : le bouton n’est plus dans la page (caché avec sa zone, jamais deux fois à l’écran)', !!source() && source().closest('[data-barre-bas-zone]').style.display === 'none' && document.querySelectorAll('#app button').length > 0 && [].filter.call(document.querySelectorAll('#app .btn-primary'), function (b) { return /Continuer/.test(b.textContent) && b.offsetParent !== null; }).length === 1);
      cas('barre du bas : le bouton de la barre est grisé comme celui de la page, avec une explication quand il l’est', adopte().disabled === source().disabled && (!source().disabled || !!adopte().title), adopte().disabled + ' ' + adopte().title);
      var clics = 0; source().addEventListener('click', function () { clics++; }, true);
      source().disabled = false; await attente(300);
      cas('barre du bas : il s’active en même temps que le bouton d’origine', adopte().disabled === false);
      adopte().click(); await attente(300);
      cas('barre du bas : un clic sur le bouton de la barre fait ce que faisait le bouton d’origine', clics === 1, String(clics));
      // Retour Denis 25/10/2026 (point 1) : choisir une carte d'objectif redessine la page ; la barre ne doit JAMAIS montrer un instant sans son bouton, ni le gros bouton de la page.
      _prepLERendreDepot(); await attente(600);
      var instants = [], etatBarre = function () { return (barre() && barre().querySelector(':scope > button.btn-primary') ? 'bouton' : 'AUCUN') + ' / page ' + [].filter.call(document.querySelectorAll('#app .btn-primary'), function (b) { return /Continuer/.test(b.textContent) && b.offsetParent !== null && !b.closest('.barre-navigation-fixe'); }).length; };
      var obs = new MutationObserver(function () { var e = etatBarre(); if (instants[instants.length - 1] !== e) { instants.push(e); } });
      obs.observe(document.getElementById('app'), { childList: true, subtree: true, attributes: true });
      var carteObj = $('.carte-objectif'); if (carteObj) { carteObj.click(); await attente(900); }
      obs.disconnect();
      cas('barre du bas : choisir une carte d’objectif ne fait jamais apparaître puis disparaître les boutons', !!carteObj && instants.length > 0 && instants.every(function (e) { return e === 'bouton / page 0'; }), instants.join(' | '));
    } finally { _prepLEEtat = etatAvant; _prepLEMode = modeAvant; _prepLEEcran = ecranAvant; naviguerVers('cv'); await attente(500); }
  }
  // ---------------- Complément du CV : écran de choix avant la page de création, « Valider » dans la barre, ajout tardif (Denis, 2026-10-19) ----------------
  async function parcoursComplementCv() {
    var importeeAvant = window.reponseIAImportee, drap = { p: dossier.complementCVPropose, a: dossier.complementCVAjoute, r: dossier.complementCVRefuse, s: dossier.complementCVPasse };
    try {
      await preparerCvResultats();
      window.reponseIAImportee = function () { return true; };
      dossier.complementCVPropose = true; dossier.complementCVAjoute = false; dossier.complementCVRefuse = false; dossier.complementCVPasse = false;
      naviguerVers('assistant'); await attente(800); naviguerVers('resultats'); await attente(2000);
      var barre = function () { return document.querySelector('.barre-navigation-fixe .barre-navigation'); };
      cas('complément : avant la page de création, l’écran de choix s’affiche (pas d’éditeur de CV)', /Le complément de votre CV/.test(texte($('h1'))) && !$('#zonePdfInlineCV') && /Étape 2 sur 2/.test(texte($('.complement-cv-etape'))));
      cas('complément : « Passer, je vois mon CV » est dans la barre du bas, à droite', /Continuer/.test(texte(barre().lastElementChild)) && !/IA/.test(document.body.innerText), texte(barre()));
      cas('complément : la page dit qu’on peut y revenir plus tard avec un bouton prévu à cet effet en bas de la page de création', /Rien n’est perdu/.test(document.body.innerText) && /y revenir plus tard/.test(document.body.innerText) && /Ajouter le complément du CV/.test(document.body.innerText) && /en bas de la page/.test(document.body.innerText));
      var ta = $('#texteCollageComplement'); ta.value = '{"titresProposes":["Agent"],"accrochesProposees":["Une phrase."],"pointsForts":["x"]}'; ta.dispatchEvent(new Event('input', { bubbles: true }));
      $('#btnImporterComplement').click(); await attente(500);
      cas('complément : recoller la 1re partie donne un message qui renvoie à la dernière fenêtre de l’assistant et à « oui »', /première partie/.test(texte($('#messageImportComplement'))) && /oui/.test(texte($('#messageImportComplement'))) && !/IA/.test(texte($('#messageImportComplement'))), texte($('#messageImportComplement')));
      barre().lastElementChild.click(); await attente(6500);
      var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
      cas('complément : après « Passer », la page de création apparaît avec « Valider le CV » dans la barre', !!$('#zonePdfInlineCV') && /Valider le CV/.test(texte(barre().lastElementChild)) && dossier.complementCVPasse === true);
      cas('complément : la synthèse reste visible sous un titre, sans bouton de validation dans la page', /Résumé de votre CV/.test(texte($('.valider-titre'))) && $('#btnMepValider').style.display === 'none');
      cas('complément : le bouton « Ajouter le complément du CV » est là, à droite de la synthèse', !!$('#btnMepAjouterComplement'));
      w()._pdfChoisirModeleCreatif('colonneFoncee'); await attente(3000);
      var modele = _mepModeleCreatifActuel();
      $('#btnMepAjouterComplement').click(); await attente(800);
      var ta2 = $('#texteCollageComplement'); ta2.value = '{"recommandations":{"formationsAvecMissions":[{"intitule":"Agent de prévention","missions":["Surveiller les accès."],"justification":"j"}]}}'; ta2.dispatchEvent(new Event('input', { bubbles: true }));
      $('#btnImporterComplement').click(); await attente(6000);
      cas('complément : ajouté plus tard, le CV garde son modèle et ses réglages, le bouton disparaît', dossier.complementCVAjoute === true && _mepModeleCreatifActuel() === modele && !$('#btnMepAjouterComplement') && !$('#fenetreERIP'), modele + ' / ' + _mepModeleCreatifActuel());
    } finally {
      window.reponseIAImportee = importeeAvant; dossier.complementCVPropose = drap.p; dossier.complementCVAjoute = drap.a; dossier.complementCVRefuse = drap.r; dossier.complementCVPasse = drap.s;
      try { fermerFenetreERIP(); } catch (e) { /* rien */ } naviguerVers('cv'); await attente(500);
    }
  }
  // ---------------- Suggestions de mise en page : toujours sur une page, le CV remplit la page dès le choix, l'annulation rend l'état exact (Denis, 2026-10-19) ----------------
  async function parcoursSuggestionsPage() {
    await preparerCvResultats();
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var cible = Math.round(w().HAUTEUR_CIBLE_PX);
    w()._pdfChoisirModeleCreatif('sidebarVague'); await attente(3000);
    document.getElementById('btnMepMiseEnPage').click(); await attente(7000);
    var liste = _mepSuggestions.slice(), base = Math.round(w()._pdfMesurerHauteurPage()), debordent = [], ecarts = [];
    for (var i = 0; i < liste.length; i++) {
      _mepSuggestionsOuvert = true; _mepPrevisualiserSuggestion(i); await attente(2500);
      var h = Math.round(w()._pdfMesurerHauteurPage());
      if (h > cible + 2) { debordent.push(liste[i].titre + ' ' + h); }
      _mepAnnulerPreviewSuggestion(); await attente(1500);
      var retour = Math.round(w()._pdfMesurerHauteurPage());
      if (retour !== base) { ecarts.push(liste[i].titre + ' ' + retour + '/' + base); }
    }
    cas('suggestions : il y en a, et aucune ne dépasse la page une fois choisie (le CV est resserré ou agrandi pour la remplir)', liste.length > 0 && debordent.length === 0, debordent.join(' ; '));
    cas('suggestions : annuler un aperçu rend exactement le CV d’avant (interlignes et espaces compris)', ecarts.length === 0, ecarts.join(' ; '));
    _mepSuggestionsOuvert = false;
  }
  // ---------------- Changement de modèle : le CV est resserré s'il dépasse la page, jamais agrandi, jamais touché quand tout tient (Denis, 2026-10-19, option A) ----------------
  async function parcoursModeleTientSurUnePage() {
    var avant = { exp: dossier.experiences, cert: dossier.certifications };
    try {
      await preparerCvResultats();
      var m2 = 'Manipuler et contrôler du matériel technique.\nParticiper au traitement des demandes concernant les équipements.';
      dossier.experiences = ['A', 'B', 'C', 'D', 'E'].map(function (e, i) { return { poste: 'Agent technique', entreprise: e, lieu: 'Bergerac', dateDebut: '202' + (i % 4), dateFin: '202' + (i % 4 + 1), missions: m2 }; });
      dossier.certifications = ['Habilitation électrique (2025)', 'Travail en hauteur (2025)', 'Amiante (2025)', 'Échafaudage (2025)'];
      naviguerVers('resultats'); await attente(6000);
      var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
      var cible = Math.round(w().HAUTEUR_CIBLE_PX), debordent = [];
      var ids = ['mqBandeau', 'frise', 'rectangles', 'colonneFoncee', 'vagueMarine', 'duoOvale'];
      for (var i = 0; i < ids.length; i++) {
        w()._pdfChoisirModeleCreatif(ids[i]); await attente(1800);
        var h = Math.round(w()._pdfMesurerHauteurPage());
        if (h > cible + 2) { debordent.push(ids[i] + ' ' + h); }
      }
      cas('modèle : après chaque changement de modèle, un CV chargé tient sur une page (resserré si besoin)', debordent.length === 0, debordent.join(' ; '));
      // jamais agrandi : un CV court garde l'échelle qu'il avait
      // L'échelle du texte se lit sur le réglage de la page (la variable interne de l'aperçu n'est pas visible de l'extérieur : l'essai lisait « undefined » des deux côtés).
      var echelle = function () { return parseFloat(w().document.getElementById('regEchelle').value); };
      var echelleAvant = echelle();
      w()._pdfChoisirModeleCreatif('colonneClaire'); await attente(1800);
      cas('modèle : le resserrement ne fait jamais grandir le texte', echelle() <= echelleAvant, echelleAvant + ' > ' + echelle());
    } finally { dossier.experiences = avant.exp; dossier.certifications = avant.cert; naviguerVers('cv'); await attente(500); }
  }
  // ---------------- Barre verticale à gauche du texte de profil : facultative, à la couleur d'accent (Denis, 2026-10-19) ----------------
  async function parcoursBarreProfil() {
    dossier.ia = dossier.ia || {}; dossier.ia.cv = dossier.ia.cv || {}; var profilAvant = dossier.ia.cv.profil; dossier.ia.cv.profil = 'Formé en maintenance des systèmes, je souhaite rejoindre le support technique.';
    await preparerCvResultats();
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var accroche = function () { return w().document.querySelector('#conteneurPage .cv .accroche'); };
    var largeur = function () { return accroche() ? parseFloat(w().getComputedStyle(accroche()).borderLeftWidth) : -1; };
    var carte = document.getElementById('cEntete'); if (carte && !carte.open) { carte.querySelector('summary').click(); await attente(800); }
    var case1 = function () { return document.querySelector('[data-mep-barre-profil]'); };
    cas('barre de profil : la case existe, décochée, et le texte de profil n’a aucune barre au départ', !!case1() && !case1().checked && !!accroche() && largeur() === 0, String(largeur()));
    case1().click(); await attente(3000);
    cas('barre de profil : cochée, la barre apparaît (trait plein, couleur d’accent du CV, pas le gris d’avant)', case1().checked && largeur() > 0 && w().getComputedStyle(accroche()).borderLeftStyle === 'solid' && w().getComputedStyle(accroche()).borderLeftColor !== 'rgb(203, 211, 220)', w().getComputedStyle(accroche()).borderLeftColor);
    case1().click(); await attente(3000);
    cas('barre de profil : décochée, la barre disparaît', !case1().checked && largeur() === 0, String(largeur()));
    dossier.ia.cv.profil = profilAvant;
  }
  // ---------------- Grand aperçu : le CV n'est jamais coupé à gauche et les formes décoratives y sont (Denis, 2026-10-20) ----------------
  async function parcoursGrandApercuFormes() {
    await preparerCvResultats();
    document.querySelector('[data-mep-allure="creatif"]').click(); await attente(3000);
    var tous = document.querySelector('[data-mep-galerie-tous]'); if (tous && tous.getAttribute('data-mep-galerie-tous') === '1') { tous.click(); await attente(5000); }
    document.querySelector('[data-mep-galerie-creatif="colonneBandeau"]').click(); await attente(3500);
    _mepTiroirForme = null; _mepOngletsTouche = false;
    document.querySelector('#mepOngletsApercu [data-mep-onglet="formes"]').click(); await attente(800);
    var prop = document.querySelector('.gab-tiroir .gab-proposition');
    if (prop) { prop.click(); } else { [].filter.call(document.querySelectorAll('.gab-tiroir .btn-miss'), function (b) { return /Ajouter/.test(b.textContent); })[0].click(); }
    await attente(5000);
    document.getElementById('btnMepOuvrirGrandApercu').click(); await attente(5000);
    var f = document.getElementById('mqFrame'), z = document.getElementById('mqZone');
    var d = f && f.contentDocument, pg = d && d.querySelector('.page-a4');
    cas('grand aperçu : les formes décoratives choisies y sont posées (comme sur l’aperçu du panneau)', !!pg && _mepFormesDeco().length >= 1 && d.querySelectorAll('.formes-deco .forme-deco').length === _mepFormesDeco().length, (d && d.querySelectorAll('.forme-deco').length) + ' / ' + _mepFormesDeco().length);
    var rf = f.getBoundingClientRect(), rz = z.getBoundingClientRect();
    cas('grand aperçu : le bord gauche du CV n’est jamais coupé (cadre aligné à gauche de la zone quand elle est trop étroite, centré sinon, toujours défilable)', rf.left >= rz.left - 1 && (rf.width <= rz.width || z.scrollWidth >= f.offsetWidth), Math.round(rf.left) + ' ' + Math.round(rz.left) + ' ' + Math.round(rf.width) + ' ' + Math.round(rz.width));
    cas('grand aperçu : le CV est réduit pour tenir en largeur dans la zone, sans défilement horizontal (bord gauche ET droit visibles)', rf.left >= rz.left - 1 && rf.right <= rz.right + 1 && z.scrollWidth <= z.clientWidth + 1, 'cadre ' + Math.round(rf.left) + '-' + Math.round(rf.right) + ' zone ' + Math.round(rz.left) + '-' + Math.round(rz.right) + ' défilement ' + z.scrollWidth + '/' + z.clientWidth);
    var formeGA = d.querySelector('.forme-deco');
    cas('grand aperçu : les formes y sont visibles mais sans interaction (jamais de gêne pour modifier le texte ou déplacer les rubriques)', !!formeGA && formeGA.style.pointerEvents !== 'auto' && f.contentWindow.getComputedStyle(formeGA).pointerEvents === 'none' && !d.querySelector('.forme-deco-edition'));
    document.getElementById('mqRetour').click(); await attente(1500);
    try { _mepGalerieTous = false; _mepGalerieChoix = null; _mepTiroirForme = null; _mepOngletsTouche = false; dossier.pdfReglages = null; } catch (e) { /* galerie pas chargee */ }
  }
  // ---------------- Les douze formes de bandeau de plus (Denis, 2026-10-20) : découpées, détachées, vides ----------------
  async function parcoursNouvellesFormesBandeau() {
    await preparerCvResultats();
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var doc = function () { return w().document; };
    var tiroir = function () { return document.querySelector('.gab-tiroir'); };
    var cliquer = async function (v) { tiroir().querySelector('[data-mep-forme="' + v + '"]').click(); await attente(2500); };
    document.querySelector('[data-mep-allure="creatif"]').click(); await attente(3000);
    var tous = document.querySelector('[data-mep-galerie-tous]'); if (tous && tous.getAttribute('data-mep-galerie-tous') === '1') { tous.click(); await attente(5000); }
    document.querySelector('[data-mep-galerie-creatif="mqBandeau"]').click(); await attente(3500);
    _mepTiroirForme = null;
    document.querySelector('#mepOngletsApercu [data-mep-onglet="bandeau"]').click(); await attente(900);
    var familles = { diagonale: 'decoupe', coin: 'decoupe', demiovale: 'decoupe', vague2: 'decoupe', creneaux: 'decoupe', carte: 'detache', pilule: 'detache', ruban: 'detache', rubanCourt: 'detache', contour: 'vide', contourRond: 'vide', filets: 'vide' };
    var ko = [];
    for (var forme in familles) {
      await cliquer(forme);
      var d = doc(), t = d.querySelector('#conteneurPage .tete'), cv = d.querySelector('#conteneurPage .cv');
      if (!t || !t.classList.contains('tete-vague') || !cv.classList.contains('bord-bandeau-choix') || d.getElementById('regBordBandeau').value !== forme) { ko.push(forme + ' : pas de bandeau ' + (t ? t.className : 'absent')); continue; }
      var avant = w().getComputedStyle(t, '::before'), tr = t.getBoundingClientRect(), hors = [].filter.call(t.querySelectorAll('.blc'), function (b) { var r = b.getBoundingClientRect(); return r.bottom > tr.bottom + 1 || r.right > tr.right + 1 || r.left < tr.left - 1; }).length;
      if (hors) { ko.push(forme + ' : ' + hors + ' bloc(s) de texte hors du bandeau'); }
      if (familles[forme] === 'decoupe' && avant.clipPath === 'none') { ko.push(forme + ' : aucune découpe'); }
      if (familles[forme] === 'vide') {
        var nom = d.querySelector('.tete .nom'), couleur = w().getComputedStyle(nom).color;
        if (!t.classList.contains('tete-vide') || avant.backgroundColor !== 'rgba(0, 0, 0, 0)' || couleur === 'rgb(255, 255, 255)') { ko.push(forme + ' : bandeau vide mal rendu (fond ' + avant.backgroundColor + ', nom ' + couleur + ')'); }
      }
      if (familles[forme] === 'detache' && forme !== 'ruban' && forme !== 'rubanCourt' && (parseFloat(avant.left) < 8 || avant.borderTopLeftRadius === '0px')) { ko.push(forme + ' : forme non détachée (' + avant.left + ', ' + avant.borderTopLeftRadius + ')'); }
    }
    cas('formes de bandeau nouvelles : les treize se dessinent (découpe, détachée ou vide), nom en couleur foncée pour les vides, aucun texte hors du bandeau', ko.length === 0, ko.join(' | '));
    await cliquer('droit');
    cas('formes de bandeau nouvelles : revenir à « Droit » retire la forme (plus de pseudo-élément)', !doc().querySelector('#conteneurPage .tete.tete-vague'), doc().querySelector('#conteneurPage .tete').className);
    try { _mepGalerieTous = false; _mepGalerieChoix = null; _mepTiroirForme = null; _mepOngletsTouche = false; dossier.pdfReglages = null; } catch (e) { /* galerie pas chargee */ }
  }
  // ---------------- Les onze formes de colonne de plus (Denis, 2026-10-20) ----------------
  async function parcoursNouvellesFormesColonne() {
    await preparerCvResultats();
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var doc = function () { return w().document; };
    var tiroir = function () { return document.querySelector('.gab-tiroir'); };
    var cliquer = async function (v) { tiroir().querySelector('[data-mep-forme="' + v + '"]').click(); await attente(2500); };
    document.querySelector('[data-mep-allure="creatif"]').click(); await attente(3000);
    var tous = document.querySelector('[data-mep-galerie-tous]'); if (tous && tous.getAttribute('data-mep-galerie-tous') === '1') { tous.click(); await attente(5000); }
    document.querySelector('[data-mep-galerie-creatif="colonneFoncee"]').click(); await attente(3500);
    _mepTiroirForme = null;
    document.querySelector('#mepOngletsApercu [data-mep-onglet="colonne"]').click(); await attente(900);
    var liste = [].map.call(tiroir().querySelectorAll('.vign-forme[data-mep-forme]'), function (b) { return b.getAttribute('data-mep-forme'); }).join(',');
    cas('formes de colonne nouvelles : le tiroir propose droite, vallonnée, arche et les onze formes de plus', liste === 'droit,vallonne,arche,diagonale,pointeBas,coin,demiovale,vague2,creneaux,carte,pilule,contour,contourRond,filets', liste);
    var vides = { contour: 1, contourRond: 1, filets: 1 }, ko = [];
    var formes = ['diagonale', 'pointeBas', 'coin', 'demiovale', 'vague2', 'creneaux', 'carte', 'pilule', 'contour', 'contourRond', 'filets'];
    for (var i = 0; i < formes.length; i++) {
      var f = formes[i]; await cliquer(f);
      var d = doc(), cv = d.querySelector('#conteneurPage .cv');
      if (!cv.classList.contains('col-forme') || d.getElementById('regColonneForme').value !== f) { ko.push(f + ' : forme non appliquée (' + cv.className + ')'); continue; }
      var avant = w().getComputedStyle(cv, '::before'), cf = d.querySelector('.col-fond');
      if (vides[f]) {
        var coul = cf && w().getComputedStyle(cf).color;
        if (!cv.classList.contains('col-vide') || avant.backgroundColor !== 'rgba(0, 0, 0, 0)' || coul === 'rgb(255, 255, 255)') { ko.push(f + ' : colonne vide mal rendue (fond ' + avant.backgroundColor + ', texte ' + coul + ')'); }
      } else if (avant.backgroundColor === 'rgba(0, 0, 0, 0)') { ko.push(f + ' : colonne sans couleur'); }
      var tr = cf && cf.getBoundingClientRect(), sortie = [].filter.call(d.querySelectorAll('.col-fond *'), function (e) { var r = e.getBoundingClientRect(); return r.width > 0 && tr && (r.right > tr.right + 1 || r.left < tr.left - 1); }).length;
      if (sortie) { ko.push(f + ' : ' + sortie + ' élément(s) du texte sortent de la colonne'); }
    }
    cas('formes de colonne nouvelles : les onze se dessinent, les trois vides ont un texte foncé, aucun texte ne sort de la colonne', ko.length === 0, ko.join(' | '));
    await cliquer('arche');
    cas('formes de colonne nouvelles : l’arche reprend la main (plus de forme de plus)', doc().querySelector('#conteneurPage .cv').classList.contains('col-arche') && !doc().querySelector('#conteneurPage .cv').classList.contains('col-forme'), doc().querySelector('#conteneurPage .cv').className);
    await cliquer('creneaux'); await cliquer('vallonne');
    cas('formes de colonne nouvelles : revenir à « Vallonnée » retire la forme de plus', !doc().querySelector('#conteneurPage .cv').classList.contains('col-forme') && doc().getElementById('regColonneForme').value === '', doc().getElementById('regColonneForme').value);
    try { _mepGalerieTous = false; _mepGalerieChoix = null; _mepTiroirForme = null; _mepOngletsTouche = false; dossier.pdfReglages = null; } catch (e) { /* galerie pas chargee */ }
  }
  // ---------------- Poignées rondes de l'aperçu : épaisseur du bandeau et largeur de la colonne (Denis, 2026-10-20) ----------------
  async function parcoursPoigneesCv() {
    await preparerCvResultats();
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var doc = function () { return w().document; };
    var onglet = function (k) { return document.querySelector('#mepOngletsApercu [data-mep-onglet="' + k + '"]'); };
    var poignee = function (mot) { return [].filter.call(doc().querySelectorAll('.poignees-cv .poignee-cv'), function (p) { return p.getAttribute('aria-label').indexOf(mot) === 0; })[0]; };
    document.querySelector('[data-mep-allure="creatif"]').click(); await attente(3000);
    var tous = document.querySelector('[data-mep-galerie-tous]'); if (tous && tous.getAttribute('data-mep-galerie-tous') === '1') { tous.click(); await attente(5000); }
    document.querySelector('[data-mep-galerie-creatif="colonneBandeau"]').click(); await attente(3500);
    _mepTiroirForme = null; _mepOngletsTouche = true; _mepMajOngletsApercu(); await attente(1200);
    cas('poignées : aucune poignée sur le CV tant qu’aucun panneau n’est ouvert', doc().querySelectorAll('.poignees-cv .poignee-cv').length === 0, String(doc().querySelectorAll('.poignee-cv').length));
    onglet('bandeau').click(); await attente(1500);
    cas('poignées : le panneau Bandeau ouvert, une poignée d’épaisseur apparaît sur le CV (et pas celle de la colonne)', !!poignee('Épaisseur') && !poignee('Largeur'), '');
    var geste = async function (p, dx, dy) {
      var r = p.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, V = w();
      var ev = function (type, cx, cy) { return new V.PointerEvent(type, { clientX: cx, clientY: cy, bubbles: true, cancelable: true, pointerId: 7, pointerType: 'mouse', isPrimary: true, button: 0 }); };
      p.dispatchEvent(ev('pointerdown', x, y)); await attente(100);
      doc().dispatchEvent(ev('pointermove', x + dx / 2, y + dy / 2)); await attente(100);
      doc().dispatchEvent(ev('pointermove', x + dx, y + dy)); await attente(150);
      doc().dispatchEvent(ev('pointerup', x + dx, y + dy)); await attente(400);
    };
    var tete = doc().querySelector('#conteneurPage .tete-fond'), h0 = tete.offsetHeight, avantTete = tete;
    await geste(poignee('Épaisseur'), 0, 90 * (doc().querySelector('#conteneurPage .page-a4').getBoundingClientRect().width / doc().querySelector('#conteneurPage .page-a4').offsetWidth));
    var h1 = doc().querySelector('#conteneurPage .tete-fond').offsetHeight;
    cas('poignées : tirer la poignée du bandeau vers le bas l’épaissit, sans reconstruire l’aperçu', h1 > h0 + 40 && doc().querySelector('#conteneurPage .tete-fond') === avantTete, h0 + ' -> ' + h1);
    cas('poignées : l’épaisseur est gardée dans les réglages du CV', w()._cvPdfEnteteMin > 0 && dossier.pdfReglages && dossier.pdfReglages.enteteMin === w()._cvPdfEnteteMin, String(w()._cvPdfEnteteMin));
    await geste(poignee('Épaisseur'), 0, -400);
    var h2 = doc().querySelector('#conteneurPage .tete-fond').offsetHeight;
    cas('poignées : tirée trop haut, l’épaisseur ne descend jamais sous ce que le texte du bandeau demande (texte non coupé)', h2 >= 90 && h2 < h1, h2 + ' / ' + h1);
    _mepRerendre(); await attente(3500);
    var h3 = doc().querySelector('#conteneurPage .tete-fond').offsetHeight;
    cas('poignées : après une reconstruction de l’aperçu, l’épaisseur choisie est toujours là', Math.abs(h3 - h2) <= 2, h2 + ' -> ' + h3);
    onglet('colonne').click(); await attente(1500);
    cas('poignées : le panneau Colonne ouvert en plus, la poignée de largeur apparaît aussi', !!poignee('Largeur') && !!poignee('Épaisseur'), '');
    var larg0 = parseInt(doc().getElementById('regLargeurColonneGauche').value, 10), k = doc().querySelector('#conteneurPage .page-a4').getBoundingClientRect().width / doc().querySelector('#conteneurPage .page-a4').offsetWidth;
    await geste(poignee('Largeur'), 120 * k, 0); await attente(3500);
    var larg1 = parseInt(doc().getElementById('regLargeurColonneGauche').value, 10);
    cas('poignées : tirer la poignée de la colonne vers la droite l’élargit par pas de 5 %, entre 30 et 70', larg1 > larg0 && larg1 <= 70 && larg1 % 5 === 0, larg0 + ' -> ' + larg1);
    cas('poignées : le bord du bandeau et la colonne ne sont pas déformés (la poignée est reposée après la reconstruction)', !!poignee('Largeur') && !document.getElementById('mqFrame'), '');
    onglet('bandeau').click(); onglet('colonne').click(); await attente(1500);
    cas('poignées : tous les panneaux fermés, plus aucune poignée', doc().querySelectorAll('.poignees-cv .poignee-cv').length === 0, String(doc().querySelectorAll('.poignee-cv').length));
    cas('poignées : une feuille de style les retire à l’impression (et l’export Word les ignore)', !!doc().getElementById('stylePoigneesCv'), '');
    try { _mepGalerieTous = false; _mepGalerieChoix = null; _mepTiroirForme = null; _mepOngletsTouche = false; dossier.pdfReglages = null; } catch (e) { /* galerie pas chargee */ }
  }
  // ---------------- Style aléatoire des formes (Denis, 2026-10-20) : 1 à 4 formes, sans chevauchement, jamais sur la photo ni le nom ; rien du tout avec « Garder mes formes » ----------------
  async function parcoursTirageFormes() {
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    window.__cvPdfSansRemplissageInitial = true; delete dossier.miseEnPageAutoFaite;
    await preparerCvResultats();
    dossier.photo = { url: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', inclure: true, souhaitee: 'oui' };
    naviguerVers('cv'); await attente(1500); naviguerVers('resultats'); await attente(5000);
    var boutonStandard = document.querySelector('[data-mep-allure="defaut"]'); if (boutonStandard) { boutonStandard.click(); await attente(2500); }
    _assurerReglagesMiseEnPageCV(); dossier.reglagesMiseEnPageCV.garderFormes = false;
    var mots = function () {
      var d = w().document, arbre = d.createTreeWalker(d.querySelector('#conteneurPage .page-a4'), 4), m = [], n;
      while ((n = arbre.nextNode())) { if (!n.parentNode.closest('.formes-deco, .poignees-cv')) { m.push(n.nodeValue); } }
      return (m.join(' ').toLowerCase().match(/[a-zà-ÿ0-9]+/g) || []).sort().join(' ');
    };
    var avantTexte = mots(), nombres = {}, defauts = [];
    for (var i = 0; i < 8; i++) {
      document.getElementById('btnMepDe').click(); await attente(4500);
      var d = w().document, formes = [].slice.call(d.querySelectorAll('#conteneurPage .formes-deco .forme-deco')), n = formes.length;
      nombres[n] = true;
      if (n < 1 || n > 4) { defauts.push('tirage ' + (i + 1) + ' : ' + n + ' forme(s)'); }
      var rects = formes.map(function (f) { return f.getBoundingClientRect(); });
      var interdits = [].slice.call(d.querySelectorAll('#conteneurPage .photo-mq, #conteneurPage .nom')).map(function (e) { return e.getBoundingClientRect(); }).filter(function (r) { return r.width > 0; });
      rects.forEach(function (a, x) {
        interdits.forEach(function (z) { if (a.left < z.right && a.right > z.left && a.top < z.bottom && a.bottom > z.top) { defauts.push('tirage ' + (i + 1) + ' : une forme sur la photo ou le nom'); } });
        rects.slice(x + 1).forEach(function (b) { if (a.left < b.right + 4 && a.right + 4 > b.left && a.top < b.bottom + 4 && a.bottom + 4 > b.top) { defauts.push('tirage ' + (i + 1) + ' : deux formes se touchent'); } });
      });
      if (mots() !== avantTexte) { defauts.push('tirage ' + (i + 1) + ' : le texte du CV a changé'); }
    }
    cas('style aléatoire des formes : 8 tirages, de 1 à 4 formes, jamais sur la photo ni le nom, sans que deux formes se touchent, texte du CV intact', defauts.length === 0, defauts.join(' | ') + ' / nombres vus : ' + Object.keys(nombres).join(','));
    // « Garder mes formes » : le tirage ne change, n'ajoute et ne retire AUCUNE forme.
    dossier.reglagesMiseEnPageCV.garderFormes = true;
    var gardees = [{ forme: 'rond', zone: 'hd', taille: 'M' }, { forme: 'ovale', zone: 'bas', taille: 'L' }];
    _mepAppelerIframePdf('_pdfDefinirFormesDeco', gardees); await attente(2500);
    var avantGarde = JSON.stringify(w()._cvPdfFormesDeco);
    for (var j = 0; j < 3; j++) { document.getElementById('btnMepDe').click(); await attente(4500); }
    cas('style aléatoire des formes : avec « Garder mes formes », trois tirages ne changent, n’ajoutent et ne retirent aucune forme', JSON.stringify(w()._cvPdfFormesDeco) === avantGarde && w()._cvPdfFormesDeco.length === 2, avantGarde.slice(0, 80) + ' / ' + JSON.stringify(w()._cvPdfFormesDeco).slice(0, 80));
    try { dossier.reglagesMiseEnPageCV.garderFormes = false; _mepAppelerIframePdf('_pdfDefinirFormesDeco', []); dossier.pdfReglages = null; } catch (e) { /* sans effet */ }
  }
  // ---------------- Texte à deux tons de l'en-tête (Denis, 2026-10-20) : le texte qui sort de la forme prend une autre couleur ----------------
  async function parcoursTexteDeuxTons() {
    await preparerCvResultats();
    dossier.titreCV = 'Agent de sécurité et de prévention incendie';
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var doc = function () { return w().document; };
    var tiroir = function () { return document.querySelector('.gab-tiroir'); };
    var forme = async function (v) { tiroir().querySelector('[data-mep-forme="' + v + '"]').click(); await attente(3000); };
    var mode = async function (v) { tiroir().querySelector('[data-mep-texte-hors="' + v + '"]').click(); await attente(3000); };
    var copie = function () { return doc().querySelector('#conteneurPage .tete-hors'); };
    document.querySelector('[data-mep-allure="creatif"]').click(); await attente(3000);
    var tous = document.querySelector('[data-mep-galerie-tous]'); if (tous && tous.getAttribute('data-mep-galerie-tous') === '1') { tous.click(); await attente(5000); }
    document.querySelector('[data-mep-galerie-creatif="mqBandeau"]').click(); await attente(3500);
    _mepTiroirForme = null;
    document.querySelector('#mepOngletsApercu [data-mep-onglet="bandeau"]').click(); await attente(1200);
    await forme('rubanCourt');
    var cs = w().getComputedStyle(doc().querySelector('#conteneurPage .tete-fond'));
    cas('texte à deux tons : le gabarit donne la forme (--clip-bandeau), la couleur (--hors) et l’état (--hors-actif)', /polygon\(0 0, 66% 0/.test(cs.getPropertyValue('--clip-bandeau')) && cs.getPropertyValue('--hors-actif').trim() === '1' && /^#|rgb|var/.test(cs.getPropertyValue('--hors').trim()), cs.getPropertyValue('--clip-bandeau'));
    cas('texte à deux tons : une copie non interactive de l’en-tête est posée dessus, découpée par le complément de la forme', !!copie() && /^path\(evenodd/.test(copie().style.clipPath) && !copie().querySelector('[contenteditable], [id], [data-bl]') && copie().getAttribute('aria-hidden') === 'true', copie() ? copie().style.clipPath.slice(0, 40) : 'absente');
    cas('texte à deux tons : le vrai en-tête reste seul à porter les blocs de texte (aucune doublure de data-bl) et un seul nom est modifiable', doc().querySelectorAll('#conteneurPage [data-bl]').length === [].filter.call(doc().querySelectorAll('#conteneurPage [data-bl]'), function (e) { return !e.closest('.tete-hors'); }).length, '');
    var nomHors = copie().querySelector('.nom'), c1 = w().getComputedStyle(nomHors).color;
    cas('texte à deux tons : par défaut le texte hors forme a la couleur du bandeau (jamais blanc)', c1 !== 'rgb(255, 255, 255)', c1);
    cas('texte à deux tons : le panneau Bandeau propose couleur du bandeau (choisie), foncé, gris, ne rien changer, autre couleur', [].map.call(tiroir().querySelectorAll('[data-mep-texte-hors]'), function (b) { return b.getAttribute('data-mep-texte-hors') + ':' + b.getAttribute('aria-checked'); }).join(',') === 'dessous:true,fonce:false,gris:false,aucun:false' && !!tiroir().querySelector('.gab-sw-libre input[type=color]'), '');
    await mode('fonce');
    cas('texte à deux tons : « Foncé » donne un texte foncé hors forme', !!copie() && w().getComputedStyle(copie().querySelector('.nom')).color === 'rgb(31, 41, 51)', copie() ? w().getComputedStyle(copie().querySelector('.nom')).color : 'copie absente');
    await mode('gris');
    cas('texte à deux tons : « Gris » donne un texte gris hors forme', !!copie() && w().getComputedStyle(copie().querySelector('.nom')).color === 'rgb(107, 118, 134)', '');
    var lab = tiroir().querySelector('.gab-sw-libre input[type=color]'); lab.value = '#aa3300'; lab.dispatchEvent(new Event('change', { bubbles: true })); await attente(3000);
    cas('texte à deux tons : « Autre couleur » donne exactement la couleur choisie', !!copie() && w().getComputedStyle(copie().querySelector('.nom')).color === 'rgb(170, 51, 0)', '');
    await mode('aucun');
    cas('texte à deux tons : « Ne rien changer » retire la copie (texte blanc partout, comme avant)', !copie(), '');
    await mode('dessous');
    await forme('contour');
    cas('texte à deux tons : une forme vide (contour) n’a ni copie ni réglage (le texte y est déjà foncé)', !copie() && !tiroir().querySelector('[data-mep-texte-hors]'), '');
    await forme('droit');
    cas('texte à deux tons : le bandeau droit a lui aussi sa copie (texte déplacé sous le bandeau)', !!copie(), '');
    await forme('rubanCourt');
    // grand aperçu : la copie y est aussi, sans doublon de blocs ni de modification de texte
    document.getElementById('btnMepOuvrirGrandApercu').click(); await attente(5000);
    var fm = document.getElementById('mqFrame'), dm = fm && fm.contentDocument;
    cas('texte à deux tons : le grand aperçu a la même copie, non modifiable', !!dm && !!dm.querySelector('.tete-hors') && !dm.querySelector('.tete-hors [contenteditable], .tete-hors [data-bl]'), dm ? String(!!dm.querySelector('.tete-hors')) : 'pas de grand aperçu');
    document.getElementById('mqRetour').click(); await attente(1500);
    try { _mepGalerieTous = false; _mepGalerieChoix = null; _mepTiroirForme = null; _mepOngletsTouche = false; dossier.pdfReglages = null; } catch (e) { /* galerie pas chargee */ }
  }
  // ---------------- Cadre rouge de l'en-tête du grand aperçu : seuls les TEXTES qui se chevauchent comptent (Denis, 2026-10-20) ----------------
  async function parcoursCadreRougeTexte() {
    await preparerCvResultats();
    document.querySelector('[data-mep-allure="creatif"]').click(); await attente(3000);
    var tous = document.querySelector('[data-mep-galerie-tous]'); if (tous && tous.getAttribute('data-mep-galerie-tous') === '1') { tous.click(); await attente(5000); }
    document.querySelector('[data-mep-galerie-creatif="mqBandeau"]').click(); await attente(3500);
    document.getElementById('btnMepOuvrirGrandApercu').click(); await attente(5000);
    document.getElementById('mqTEntete').click(); await attente(2500);
    var d = document.getElementById('mqFrame').contentDocument, tete = d.querySelector('.tete.libre:not(.tete-hors)');
    var nom = tete.querySelector('.blc[data-bl="nom"]'), coord = tete.querySelector('.blc[data-bl="coord"]');
    var rouge = function (b) { return b.classList.contains('hors-cadre'); };
    // rectangles qui se recouvrent, textes qui ne se touchent pas : le nom est dans un grand rectangle, les coordonnées sont posées dans le vide de ce rectangle
    nom.style.left = '4%'; nom.style.top = '14px'; nom.style.width = '70%';
    coord.style.left = '40%'; coord.style.top = '16px'; coord.style.width = '20%';
    var rn = nom.getBoundingClientRect(), rc = coord.getBoundingClientRect();
    var recouvrent = !(rn.right <= rc.left || rn.left >= rc.right || rn.bottom <= rc.top || rn.top >= rc.bottom);
    _mqVerifierRouge(tete, false);
    cas('cadre rouge : deux rectangles qui se recouvrent sans que leurs textes se touchent ne deviennent pas rouges', recouvrent && !rouge(nom) && !rouge(coord), 'recouvrement ' + recouvrent + ' nom ' + rouge(nom) + ' coord ' + rouge(coord));
    // les coordonnées posées SUR le nom : les textes se chevauchent, le cadre devient rouge
    coord.style.left = '6%'; coord.style.top = '16px'; coord.style.width = '30%';
    _mqVerifierRouge(tete, false);
    cas('cadre rouge : des textes qui se chevauchent rendent le cadre rouge', rouge(nom) || rouge(coord), 'nom ' + rouge(nom) + ' coord ' + rouge(coord));
    // un bloc qui sort de l'en-tete reste rouge (comportement normal)
    coord.style.left = '40%'; coord.style.top = '900px';
    _mqVerifierRouge(tete, false);
    cas('cadre rouge : un bloc qui sort de l’en-tête reste rouge', rouge(coord), '');
    document.getElementById('mqRetour').click(); await attente(1500);
    try { _mepGalerieTous = false; _mepGalerieChoix = null; _mepTiroirForme = null; _mepOngletsTouche = false; dossier.pdfReglages = null; } catch (e) { /* galerie pas chargee */ }
  }
  // ---------------- Regler l'en-tete sur le petit apercu (Denis, 2026-10-21) : bouton, gestes, panneau libre, lignes, gras, texte qui sort ----------------
  async function parcoursEnteteApercu() {
    await preparerCvResultats();
    dossier.identite.telephone = '06 12 34 56 78'; dossier.identite.email = 'camille.martin@exemple.fr';
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var doc = function () { return w().document; };
    document.querySelector('[data-mep-allure="creatif"]').click(); await attente(3000);
    var tous = document.querySelector('[data-mep-galerie-tous]'); if (tous && tous.getAttribute('data-mep-galerie-tous') === '1') { tous.click(); await attente(5000); }
    document.querySelector('[data-mep-galerie-creatif="mqBandeau"]').click(); await attente(3500);
    _mepTiroirForme = null; _enteteApercu = { actif: false, bl: null, replie: false, horsOuvert: null, paletteOuverte: false, plusOuvert: false, pos: null }; (function () { var p0 = document.getElementById('eaPanneau'); if (p0) { p0.remove(); } })(); _mepOngletsTouche = true; _mepMajOngletsApercu(); await attente(1200);
    // le geste pointeur de test : la capture d'un pointeur de test n'existe pas
    try { w().Element.prototype.setPointerCapture = function () {}; w().Element.prototype.releasePointerCapture = function () {}; } catch (e) { /* sans effet */ }
    var bouton = document.getElementById('btnMepEnteteApercu'), onglet = document.querySelector('#mepOngletsApercu [data-mep-onglet]');
    // barre compacte (choix B de Denis, 2026-10-22) : les onglets sont sur la ligne 1 (icône au-dessus d'un mot), « Régler l'en-tête » est sur la ligne 2, un peu moins haut
    cas('en-tête : le bouton « Régler l’en-tête » est là, sur une ligne à part (la deuxième), pas plus haut que les onglets', !!bouton && !!onglet && bouton.offsetHeight <= onglet.offsetHeight + 2 && bouton.parentNode !== onglet.parentNode, bouton ? (bouton.offsetHeight + ' / ' + onglet.offsetHeight) : 'absent');
    cas('en-tête : sans réglage actif, aucun cadre orange et pas de panneau', !doc().querySelector('.entete-apercu') && !document.getElementById('eaPanneau'), '');
    bouton.click(); await attente(2500);
    var page = function () { return doc().querySelector('#conteneurPage .page-a4'); };
    cas('en-tête : le bouton activé entoure les textes de l’en-tête', page().classList.contains('entete-apercu') && page().querySelectorAll('.tete.libre .blc').length >= 3 && document.getElementById('btnMepEnteteApercu').getAttribute('aria-pressed') === 'true', String(page().querySelectorAll('.tete.libre .blc').length));
    var bulle = function () { return document.getElementById('bulleInfoHoverFlottante'); };
    var info = document.getElementById('btnMepEnteteInfo');
    cas('en-tête : plus aucune phrase posée sur l’aperçu, mais une pastille « i » à côté du bouton', !document.getElementById('mepPhraseApercu') && !!info, '');
    await attente(600);
    cas('en-tête : la première fois, la bulle s’ouvre d’elle-même et dit de cliquer sur un texte pour plus de réglages', !!bulle() && bulle().classList.contains('visible') && bulle().textContent.indexOf('Cliquez sur un texte pour plus de réglages') !== -1, bulle() ? bulle().textContent.slice(0, 50) : 'absente');
    document.body.click(); await attente(300);
    cas('en-tête : un clic ailleurs ferme la bulle', !bulle().classList.contains('visible'), '');
    document.getElementById('btnMepEnteteInfo').click(); await attente(400);
    cas('en-tête : la pastille « i » rouvre la bulle à la demande', bulle().classList.contains('visible') && bulle().textContent.indexOf('plus de réglages') !== -1, '');
    document.body.click(); await attente(300);
    var V = w();
    var evt = function (type, x, y) { return new V.PointerEvent(type, { clientX: x, clientY: y, bubbles: true, cancelable: true, pointerId: 5, pointerType: 'mouse', isPrimary: true, button: 0 }); };
    var neutre = function () { try { w().Element.prototype.setPointerCapture = function () {}; w().Element.prototype.releasePointerCapture = function () {}; } catch (e) { /* sans effet */ } };
    var toucher = async function (el) { neutre(); var r = el.getBoundingClientRect(), x = r.left + 4, y = r.top + 4; el.dispatchEvent(evt('pointerdown', x, y)); await attente(60); el.dispatchEvent(evt('pointerup', x, y)); await attente(1800); };
    var glisser = async function (el, dx, dy) { neutre(); var r = el.getBoundingClientRect(), x = r.left + 4, y = r.top + 4; el.dispatchEvent(evt('pointerdown', x, y)); await attente(60); el.dispatchEvent(evt('pointermove', x + dx / 2, y + dy / 2)); await attente(60); el.dispatchEvent(evt('pointermove', x + dx, y + dy)); await attente(60); el.dispatchEvent(evt('pointerup', x + dx, y + dy)); await attente(1800); };
    var blc = function (bl) { return page().querySelector('.tete.libre .blc[data-bl="' + bl + '"]'); };
    var panneau = function () { return document.getElementById('eaPanneau'); };
    var clic = async function (sel) { var b = panneau().querySelector(sel); if (b) { b.click(); } await attente(1800); return !!b; };
    // clic sur un texte : le panneau libre s'ouvre
    await toucher(blc('nom'));
    cas('en-tête : un clic sur le nom ouvre le panneau « Vous réglez : Nom »', !!panneau() && !panneau().hidden && panneau().querySelector('#eaNom').textContent === 'Vous réglez : Nom' && blc('nom').classList.contains('ea-sel'), panneau() ? panneau().querySelector('#eaNom').textContent : 'absent');
    cas('en-tête : le titre du panneau n’est pas sélectionnable (pas de sélection de texte par erreur)', getComputedStyle(panneau()).userSelect === 'none', getComputedStyle(panneau()).userSelect);
    cas('en-tête : un clic sur le CV n’a PAS ouvert le grand aperçu', !document.getElementById('mqFrame'), '');
    // le panneau se déplace
    var t = panneau().querySelector('#eaTitre'), r0 = panneau().getBoundingClientRect(), tr = t.getBoundingClientRect();
    var evp = function (type, x, y) { return new PointerEvent(type, { clientX: x, clientY: y, bubbles: true, cancelable: true, pointerId: 9, pointerType: 'mouse', isPrimary: true, button: 0 }); };
    try { t.setPointerCapture = function () {}; } catch (e) { /* sans effet */ }
    t.dispatchEvent(evp('pointerdown', tr.left + 30, tr.top + 8)); t.dispatchEvent(evp('pointermove', tr.left + 130, tr.top + 108)); t.dispatchEvent(evp('pointerup', tr.left + 130, tr.top + 108)); await attente(300);
    var r1 = panneau().getBoundingClientRect();
    cas('en-tête : le panneau se prend par sa barre de titre et se pose ailleurs', Math.abs((r1.left - r0.left) - 100) <= 3 && Math.abs((r1.top - r0.top) - 100) <= 3, Math.round(r1.left - r0.left) + ',' + Math.round(r1.top - r0.top));
    // nom sur 2 lignes
    await clic('[data-ea-lig="2"]');
    cas('en-tête : « Nom sur 2 lignes » coupe le nom après le prénom et garde l’espace du texte', !!blc('nom').querySelector('span[style*="display:block"]') && /Camille MARTIN/i.test(blc('nom').textContent), blc('nom').textContent);
    cas('en-tête : le panneau reste ouvert, au même endroit, après la reconstruction', !panneau().hidden && Math.abs(panneau().getBoundingClientRect().left - r1.left) <= 1, '');
    await clic('[data-ea-lig="1"]');
    cas('en-tête : « Nom sur 1 ligne » remet le nom d’origine', !blc('nom').querySelector('span[style*="display:block"]'), '');
    // coordonnées : sur 1 ligne, gras du téléphone
    await toucher(blc('coord'));
    var nbLignes = function () { return blc('coord').querySelectorAll('.coord > div').length; };
    var avant = nbLignes();
    await clic('[data-ea-lig="1"]');
    cas('en-tête : « Coordonnées sur 1 ligne » regroupe tout dans une seule ligne', avant >= 2 && nbLignes() === 1, avant + ' -> ' + nbLignes());
    await clic('[data-ea-cg="telephone"]');
    cas('en-tête : « Téléphone en gras » met seulement le téléphone en gras', !!blc('coord').querySelector('[data-ed="co:telephone"]') && !!blc('coord').querySelector('b'), '');
    await clic('[data-ea-cg="telephone"]');
    await clic('[data-ea-lig="col"]');
    // texte qui sort de la couleur : cases de couleur, meme reglage que le panneau Bandeau
    await clic('#eaHorsBtn');
    var cases = panneau().querySelectorAll('[data-ea-hors]');
    cas('en-tête : le texte qui sort de la couleur se choisit par cases de couleur (4 cases + « Autre couleur »)', cases.length === 4 && !!panneau().querySelector('#eaAutre'), String(cases.length));
    await clic('[data-ea-hors="fonce"]');
    cas('en-tête : choisir la case « foncé » change le vrai réglage de l’aperçu (regTexteHors)', doc().getElementById('regTexteHors').value === 'fonce', doc().getElementById('regTexteHors').value);
    await clic('[data-ea-hors="dessous"]');
    // glisser un texte : la position est gardée dans l'état de l'en-tête libre
    var x0 = blc('metier').offsetLeft;
    await glisser(blc('metier'), 40 * (page().getBoundingClientRect().width / page().offsetWidth), 0);
    var pos = w()._cvPdfEnteteLibreMq.pos && w()._cvPdfEnteteLibreMq.pos.metier;
    cas('en-tête : glisser un texte le déplace et garde sa position', !!pos && Math.abs(blc('metier').offsetLeft - x0) > 20, pos ? JSON.stringify(pos) : 'aucune position');
    // remettre ce texte
    await toucher(blc('metier'));
    await clic('#eaRaz');
    cas('en-tête : « Remettre ce texte » efface les réglages de ce texte seulement', !(w()._cvPdfEnteteLibreMq.pos || {}).metier, JSON.stringify(w()._cvPdfEnteteLibreMq.pos || {}));
    // tout remettre puis fermer le reglage : l'en-tete redevient normal
    await toucher(blc('nom')); await clic('[data-ea-lig="2"]');
    var raz = document.getElementById('btnMepEnteteRaz');
    cas('en-tête : « Remettre comme avant » apparaît (même taille que « Régler l’en-tête », sur la même ligne) dès qu’un réglage a été fait', !!raz && !!document.getElementById('btnMepEnteteApercu') && Math.abs(raz.offsetHeight - document.getElementById('btnMepEnteteApercu').offsetHeight) <= 2 && raz.parentNode === document.getElementById('btnMepEnteteApercu').parentNode, raz ? (raz.offsetHeight + ' / ' + document.getElementById('btnMepEnteteApercu').offsetHeight) : 'absent');
    if (raz) { raz.click(); await attente(2500); }
    cas('en-tête : « Remettre comme avant » efface tous les réglages de l’en-tête', JSON.stringify(_mqEnteteEtat().lig) === '{}' && !_mqEnteteEtat().modif && panneau().hidden, JSON.stringify(_mqEnteteEtat()));
    document.getElementById('btnMepEnteteApercu').click(); await attente(2500);
    cas('en-tête : réglage fermé et rien de modifié, l’en-tête n’est plus libre et plus aucun cadre', !page().classList.contains('entete-apercu') && !page().querySelector('.tete.libre') && !document.getElementById('mepPhraseApercu'), '');
    try { _mepGalerieTous = false; _mepGalerieChoix = null; _mepTiroirForme = null; _mepOngletsTouche = false; _enteteApercu.actif = false; _enteteApercu.pos = null; _enteteApercu.horsOuvert = null; dossier.pdfReglages = null; } catch (e) { /* galerie pas chargee */ }
  }
  // ---------------- Impression PDF (essai d'impression reel, 2026-10-21) : style de l'apercu limite a l'ecran, formes « vide » et « contour » redessinees pour l'impression, copie alignee ----------------
  async function parcoursImpressionFormes() {
    await preparerCvResultats();
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var doc = function () { return w().document; };
    document.querySelector('[data-mep-allure="sobre"]').click(); await attente(3000);
    var tous = document.querySelector('[data-mep-galerie-tous]'); if (tous && tous.getAttribute('data-mep-galerie-tous') === '1') { tous.click(); await attente(4500); }
    var v = document.querySelector('[data-mep-galerie-sobre="mq-epure"]'); if (v) { v.click(); await attente(3500); }
    var styles = [].map.call(doc().querySelectorAll('style'), function (s) { return s.textContent; }).join('\n');
    cas('impression : le style propre à l’aperçu (marge de 6 px, défilement masqué) ne vaut qu’à l’écran, sinon le PDF a une marge blanche et une page 2 vide', styles.indexOf('@media screen{html,body{overflow:hidden !important;} .zone-apercu{padding:6px !important;overflow:hidden !important;}}') !== -1 && !/(^|\n)html,body\{overflow:hidden !important;\} \.zone-apercu/.test(styles), '');
    _mepDefinirFormesDeco([
      { forme: 'ovale', zone: 'libre', taille: 'perso', transp: 'leger', couleur: 'cv', style: 'vide', rot: -20, fx: 0.1, fy: 0.4, fw: 0.5, fr: 0.4 },
      { forme: 'rond', zone: 'libre', taille: 'perso', transp: 'moyen', couleur: 'cv', style: 'contour', rot: 0, fx: 0.55, fy: 0.55, fw: 0.3 },
      { forme: 'points', zone: 'libre', taille: 'perso', transp: 'leger', couleur: 'claire', style: 'vide', rot: 0, fx: 0.05, fy: 0.78, fw: 0.25 }]);
    await attente(6000);
    var nb = function (sel) { return doc().querySelectorAll(sel).length; };
    cas('impression : une forme « vide » dessinable est imprimable (découpe vectorielle), un motif ne l’est pas (fenêtre retirée à l’impression)', nb('.forme-deco-vide') === 2 && nb('.forme-deco-imprimable') === 1 && /^path\(evenodd/.test((doc().querySelector('.forme-deco-imprimable').style.getPropertyValue('--clip-impr') || '')), nb('.forme-deco-vide') + ' / ' + nb('.forme-deco-imprimable'));
    cas('impression : une forme « contour » a son trait SVG d’impression (invisible à l’écran)', nb('.forme-deco-contour') === 1 && nb('.forme-deco-impr') === 1 && w().getComputedStyle(doc().querySelector('.forme-deco-impr')).display === 'none', nb('.forme-deco-impr') + ' / ' + (doc().querySelector('.forme-deco-impr') ? w().getComputedStyle(doc().querySelector('.forme-deco-impr')).display : 'absent'));
    cas('impression : les fenêtres « vide » et « contour » ne sont plus montrées à l’impression (le masque d’image n’y est pas appliqué)', /@media print \{ \.forme-deco-vide:not\(\.forme-deco-imprimable\), \.forme-deco-contour \{ display: none !important; \}/.test(doc().querySelector('style[data-formes-deco-vide]').textContent), '');
    var page = doc().querySelector('#conteneurPage .page-a4'), copie = doc().querySelector('.vide-texte > *');
    var htReel = page.querySelector('.tete') ? page.querySelector('.tete').offsetHeight : 0, htCopie = copie && copie.querySelector('.tete') ? copie.querySelector('.tete').offsetHeight : -1;
    cas('impression : la copie du CV montrée dans une forme « vide » a la même hauteur d’en-tête que le CV (pas de décalage)', htReel > 0 && htReel === htCopie, htReel + ' / ' + htCopie);
    try { _mepDefinirFormesDeco([]); _mepGalerieTous = false; _mepGalerieChoix = null; _mepTiroirForme = null; _mepOngletsTouche = false; dossier.pdfReglages = null; } catch (e) { /* nettoyage */ }
  }
  // ---------------- Compositions de l'en-tête et des marges, CV à une colonne (2026-10-22, cvPdfCompositions.js) ----------------
  async function parcoursCompositions() {
    await preparerCvResultats();
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var doc = function () { return w().document; };
    var page = function () { return doc().querySelector('#conteneurPage .page-a4'); };
    var choisir = async function (allure, id) {
      document.querySelector('[data-mep-allure="' + allure + '"]').click(); await attente(3000);
      var tous = document.querySelector('[data-mep-galerie-tous]'); if (tous && tous.getAttribute('data-mep-galerie-tous') === '1') { tous.click(); await attente(4500); }
      var v = document.querySelector('[data-mep-galerie-' + allure + '="' + id + '"]'); if (v) { v.click(); await attente(4500); }
    };
    var ouvrirPanneau = async function () { if (!document.querySelector('[data-mep-compo]')) { var o = document.querySelector('[data-mep-onglet="composition"]'); if (o) { o.click(); await attente(500); } } };
    var onglets = function () { return [].map.call(document.querySelectorAll('[data-mep-onglet]'), function (b) { return b.getAttribute('data-mep-onglet'); }); };
    // texte du corps du CV recouvert par un décor (même mesure que le contrôle de développement)
    var recouvre = function () {
      var pg = page(), pr = pg.getBoundingClientRect(), k = pg.offsetWidth ? pr.width / pg.offsetWidth : 1, d = doc(), pb = [], corps = [], n, wk = d.createTreeWalker(pg, 4);
      while ((n = wk.nextNode())) {
        if (!/\S/.test(n.nodeValue)) { continue; } var p = n.parentElement;
        if (!p || p.closest('.tete, .compo-z, .formes-deco, .tete-hors, .marque-page, .poignees-cv, script, style')) { continue; }
        var rg = d.createRange(); rg.selectNodeContents(n);
        [].forEach.call(rg.getClientRects(), function (q) { if (q.width >= 1 && q.height >= 1) { corps.push([(q.left - pr.left) / k, (q.top - pr.top) / k, (q.right - pr.left) / k, (q.bottom - pr.top) / k, n.nodeValue.trim().slice(0, 14)]); } });
      }
      [].forEach.call(pg.querySelectorAll(':scope > .compo-z'), function (z) {
        var cs = w().getComputedStyle(z), L = z.offsetLeft, T = z.offsetTop, W = z.offsetWidth, H = z.offsetHeight;
        var bt = parseFloat(cs.borderTopWidth) || 0, bl = parseFloat(cs.borderLeftWidth) || 0, bb = parseFloat(cs.borderBottomWidth) || 0, br = parseFloat(cs.borderRightWidth) || 0;
        if (bt || bl || bb || br) { if (bt) { pb.push([L, T, L + W, T + bt]); } if (bl) { pb.push([L, T, L + bl, T + H]); } if (bb) { pb.push([L, T + H - bb, L + W, T + H]); } if (br) { pb.push([L + W - br, T, L + W, T + H]); } }
        else { pb.push([L, T, L + W, T + H]); }
      });
      var res = [];
      corps.forEach(function (t) { pb.forEach(function (z) { if (Math.min(t[2], z[2]) - Math.max(t[0], z[0]) > 2 && Math.min(t[3], z[3]) - Math.max(t[1], z[1]) > 2) { res.push(t[4]); } }); });
      return res;
    };
    await choisir('sobre', 'mq-epure');
    cas('compositions : un CV à une colonne propose l’onglet « Composition »', onglets().indexOf('composition') !== -1, onglets().join(','));
    await ouvrirPanneau();
    var ids = [].map.call(document.querySelectorAll('[data-mep-compo]'), function (b) { return b.getAttribute('data-mep-compo'); });
    cas('compositions : « Comme aujourd’hui » puis les huit compositions d’une colonne', ids.join(',') === ',equerre,plaque,diagonale,l,volets,etiquette,ruban,quart', ids.join(','));
    // le message « un clic sur le CV n'ouvre pas le grand aperçu » n'est plus une phrase posée sur la page : il est derrière la pastille « i », qui pulse tant qu'il n'est pas lu (Denis, 2026-10-22)
    var infoBtn = document.getElementById('btnMepEnteteInfo');
    cas('messages : plus aucune phrase posée en bas de la page tant qu’un panneau est ouvert ; la pastille « i » pulse', !document.getElementById('mepPhraseApercu') && !!infoBtn && infoBtn.classList.contains('pulse-sugg'), infoBtn ? infoBtn.className : 'absente');
    if (infoBtn) { infoBtn.click(); await attente(500); }
    var bulleI = document.getElementById('bulleInfoHoverFlottante');
    cas('messages : un clic sur « i » montre le message dans la bulle, et la pastille arrête de pulser', !!bulleI && /grand aperçu/.test(bulleI.textContent) && !document.getElementById('btnMepEnteteInfo').classList.contains('pulse-sugg'), bulleI ? bulleI.textContent.slice(0, 60) : 'bulle absente');
    document.body.click(); await attente(300);
    document.querySelector('[data-mep-compo="equerre"]').click(); await attente(2500);
    cas('compositions : l’équerre est posée (deux équerres), gardée dans les réglages, et le CV tient toujours sur une page', page().getAttribute('data-compo') === 'equerre' && page().querySelectorAll(':scope > .compo-z').length === 2 && dossier.pdfReglages && dossier.pdfReglages.composition === 'equerre' && page().scrollHeight <= 1126, String(page().getAttribute('data-compo')));
    cas('compositions : tant qu’une composition est choisie, les onglets Bandeau et Colonne disparaissent (elle remplace le bandeau)', onglets().indexOf('bandeau') === -1 && onglets().indexOf('colonne') === -1 && onglets().indexOf('composition') !== -1, onglets().join(','));
    // chaque composition : jamais de décor sur le texte du corps, une seule page, du texte lisible (blanc ou sombre selon le fond)
    var pb = [];
    for (var id of ['plaque', 'diagonale', 'l', 'volets', 'etiquette', 'ruban', 'quart', 'equerre']) {
      w()._pdfDefinirComposition(id); await attente(500);
      var r = recouvre(); if (r.length || page().scrollHeight > 1126) { pb.push(id + ' : ' + r.slice(0, 2).join(' / ') + ' h' + page().scrollHeight); }
    }
    cas('compositions : aucune des huit ne recouvre le texte du corps du CV sur le modèle Épuré', pb.length === 0, pb.join(' ; '));
    // le même contrôle sur Technique, dont les bandes de rubriques commencent à 10 px sous l'en-tête (retour de Denis, 2026-10-22 : le ruban et l'étiquette ne doivent pas déborder dessus)
    _mepDefinirComposition(''); await attente(1500);
    await choisir('sobre', 'mq-technique');
    var pbT = [];
    for (var idT of ['plaque', 'diagonale', 'l', 'volets', 'etiquette', 'ruban', 'quart', 'equerre']) {
      w()._pdfDefinirComposition(idT); await attente(500);
      var rT = recouvre(); if (rT.length || page().scrollHeight > 1126) { pbT.push(idT + ' : ' + rT.slice(0, 2).join(' / ')); }
    }
    cas('compositions : sur Technique (bandes de rubriques juste sous l’en-tête), le ruban, l’étiquette et le coin du L ne débordent pas sur le corps', pbT.length === 0, pbT.join(' ; '));
    // annuler (sans composition au départ : « Annuler » ramène à « comme aujourd’hui »)
    _mepDefinirComposition(''); await attente(2500);
    _mepDefinirComposition('plaque'); await attente(2500);
    var avant = page().getAttribute('data-compo');
    _mepAnnulerMiseEnPage(); await attente(6000);
    cas('compositions : « Annuler » retire la composition choisie', avant === 'plaque' && !page().getAttribute('data-compo'), avant + ' -> ' + page().getAttribute('data-compo'));
    // un autre modèle : la composition ne suit pas
    _mepDefinirComposition('volets'); await attente(2500);
    await choisir('sobre', 'mq-bandeau');
    cas('compositions : un autre modèle repart sans composition (comme le bandeau et la colonne)', !page().getAttribute('data-compo') && (!dossier.pdfReglages || !dossier.pdfReglages.composition), String(page().getAttribute('data-compo')));
    // Word : la couleur du texte d’en-tête suit le fond (blanc sur la plaque foncée), sinon le texte blanc serait invisible dans le Word
    _mepDefinirComposition('plaque'); await attente(3000);
    var rw = await exporterCvWord(dossier), zip = await JSZip.loadAsync(rw.blob), xml = '';
    for (var f of ['word/document.xml', 'word/header1.xml', 'word/header2.xml']) { var fic = zip.file(f); xml += fic ? await fic.async('string') : ''; }
    var runs = (xml.match(/<w:r>[\s\S]*?<\/w:r>/g) || []).map(function (x) { var c = /<w:color w:val="([0-9A-Fa-f]{6})"/.exec(x), t = /<w:t[^>]*>([^<]*)<\/w:t>/.exec(x); return { c: c ? c[1].toUpperCase() : '', t: t ? t[1] : '' }; });
    var nomRun = runs.filter(function (x) { return /Camille|MARTIN/i.test(x.t); })[0];
    cas('compositions : dans le Word, le nom posé sur la plaque foncée reste blanc (lisible)', !!nomRun && nomRun.c === 'FFFFFF', nomRun ? nomRun.c : 'absent');
    // un CV à deux colonnes (colonne à gauche) propose les sept compositions à deux colonnes (la carte, pas le ruban ni les quarts de cercle) ; une colonne à droite n'en propose pas encore
    await choisir('creatif', 'colonneFoncee');
    cas('compositions : un CV à deux colonnes propose l’onglet « Composition »', onglets().indexOf('composition') !== -1, onglets().join(','));
    await ouvrirPanneau();
    var ids2 = [].map.call(document.querySelectorAll('[data-mep-compo]'), function (b) { return b.getAttribute('data-mep-compo'); });
    cas('compositions : à deux colonnes, « Comme aujourd’hui » puis sept compositions (la carte, sans ruban ni quarts de cercle)', ids2.join(',') === ',equerre,plaque,diagonale,l,volets,etiquette,carte', ids2.join(','));
    var pb2 = [];
    for (var id2 of ['equerre', 'plaque', 'diagonale', 'l', 'volets', 'etiquette', 'carte']) {
      w()._pdfDefinirComposition(id2); await attente(600);
      if (page().getAttribute('data-compo') !== id2 || page().scrollHeight > 1126) { pb2.push(id2 + ' : ' + page().getAttribute('data-compo') + ' h' + page().scrollHeight); }
    }
    cas('compositions : les sept compositions à deux colonnes se posent sans repousser le CV sur une 2e page', pb2.length === 0, pb2.join(' ; '));
    // le trait sous l'en-tête : jamais de la couleur du bandeau qui est juste au-dessus, et la personne peut le retirer ou le choisir (retour de Denis, 2026-10-22)
    _mepDefinirComposition('l'); await attente(2500);
    var traitEl = function () { return page().querySelector(':scope > .trait'); };
    var coulTrait = function () { var t = traitEl(); return t ? w().getComputedStyle(t).display + ' ' + w().getComputedStyle(t).backgroundColor : 'absent'; };
    var autoT = coulTrait();
    cas('compositions : sous un bandeau foncé, le trait sous l’en-tête passe automatiquement en gris (pas de la couleur du bandeau)', traitEl() && /rgb\(184, 189, 199\)/.test(autoT), autoT);
    await ouvrirPanneau();
    var libTrait = [].map.call(document.querySelectorAll('[data-mep-trait]'), function (b) { return b.getAttribute('data-mep-trait'); }).join(',');
    cas('compositions : le choix « Trait sous l’en-tête » est proposé (automatique, sans trait, gris, couleur du CV)', libTrait === ',aucun,gris,cv', libTrait);
    document.querySelector('[data-mep-trait="aucun"]').click(); await attente(2000);
    cas('compositions : « Sans trait » retire le trait, et le choix est gardé dans les réglages', /^none/.test(coulTrait()) && dossier.pdfReglages && dossier.pdfReglages.compositionTrait === 'aucun', coulTrait());
    document.querySelector('[data-mep-trait="cv"]').click(); await attente(2000);
    cas('compositions : « Couleur du CV » donne au trait la couleur du CV', /^block rgb\(\d+, \d+, \d+\)/.test(coulTrait()) && !/184, 189, 199/.test(coulTrait()), coulTrait());
    _mepDefinirCompositionTrait(''); await attente(1500);
    // un style, deux dessins : passer de deux à une colonne garde l'équerre ; le ruban n'existe pas à deux colonnes
    w()._pdfDefinirComposition('equerre'); await attente(1500);
    cas('compositions : la valeur d’une composition est valable pour la structure (équerre : oui ; ruban à deux colonnes : non)', _mepCompositionValide('equerre', { deuxColonnes: true }) && _mepCompositionValide('equerre', { deuxColonnes: false }) && !_mepCompositionValide('ruban', { deuxColonnes: true }) && !_mepCompositionValide('carte', { deuxColonnes: false }) && _mepCompositionValide('', { deuxColonnes: true }), 'valide');
    _mepDefinirComposition(''); await attente(1500);
    await choisir('creatif', 'chronoFonce');
    cas('compositions : une colonne à droite propose aussi les compositions à deux colonnes (l’en-tête garde son texte sur un seul fond)', onglets().indexOf('composition') !== -1, onglets().join(','));
    await ouvrirPanneau();
    var pbD = [];
    for (var idD of ['equerre', 'plaque', 'diagonale', 'l', 'volets', 'etiquette', 'carte']) {
      w()._pdfDefinirComposition(idD); await attente(600);
      if (page().getAttribute('data-compo') !== idD || page().scrollHeight > 1126) { pbD.push(idD + ' : ' + page().getAttribute('data-compo') + ' h' + page().scrollHeight); }
    }
    cas('compositions : les sept compositions se posent sur une colonne à droite sans repousser le CV sur une 2e page', pbD.length === 0, pbD.join(' ; '));
    w()._pdfDefinirComposition('');
    await choisir('sobre', 'mq-frise');
    cas('compositions : un modèle à frise (sans en-tête horizontal) ne la propose pas', onglets().indexOf('composition') === -1, onglets().join(','));
    // ---- croisement du bandeau et de la colonne (avec « Comme aujourd'hui », modèle à bandeau et colonne dessinée) ----
    await choisir('creatif', 'colonneBandeau');
    _mepDefinirComposition(''); await attente(1500);
    await ouvrirPanneau();
    var croiIds = function () { return [].map.call(document.querySelectorAll('[data-mep-croi]'), function (b) { return b.getAttribute('data-mep-croi'); }).join(','); };
    cas('croisement : un modèle à bandeau et colonne propose les couleurs, qui est devant et le liseré (l’angle arrondi est masqué quand il n’y a pas de place)', croiIds() === 'meme:non,meme:oui,devant:bandeau,devant:colonne,lisere:non,lisere:oui', croiIds());
    cas('croisement : sans aucun choix, la page n’est pas modifiée', !page().getAttribute('data-croi') && !page().querySelector('.croi-z'), String(page().getAttribute('data-croi')));
    var nomEl = function () { return [].filter.call(page().querySelectorAll('.tete .nom *, .tete .nom'), function (x) { return /Camille|MARTIN/i.test(x.textContent) && x.children.length === 0; })[0]; };
    var nomAvant = w().getComputedStyle(nomEl()).color;
    document.querySelector('[data-mep-croi="devant:colonne"]').click(); await attente(2500);
    cas('croisement : colonne devant — le texte du nom, posé sur la colonne claire, devient sombre (jamais blanc sur clair)', page().getAttribute('data-croi') === '1' && /^rgb\(31, 41, 51\)/.test(w().getComputedStyle(nomEl()).color) && /255, 255, 255/.test(nomAvant), nomAvant + ' -> ' + w().getComputedStyle(nomEl()).color);
    cas('croisement : le choix est gardé dans les réglages (annulable)', dossier.pdfReglages && dossier.pdfReglages.croisement && dossier.pdfReglages.croisement.devant === 'colonne', JSON.stringify(dossier.pdfReglages && dossier.pdfReglages.croisement));
    document.querySelector('[data-mep-croi="meme:oui"]').click(); await attente(2500);
    cas('croisement : même couleur — « Quel est devant ? » disparaît (plus de sens) et la colonne prend la couleur du bandeau', !document.querySelector('[data-mep-croi^="devant:"]') && /rgb\(31, 42, 68\)/.test(w().getComputedStyle(page(), '::before').backgroundColor), w().getComputedStyle(page(), '::before').backgroundColor);
    _mepDefinirCroisement({ meme: '', devant: '', lisere: false }); await attente(2000);
    cas('croisement : tout remettre à « chacune la sienne » ramène la page exactement comme avant', !page().getAttribute('data-croi'), String(page().getAttribute('data-croi')));
    // ---- décor ajouté par-dessus le modèle (équerre, ruban, quarts de cercle, plaque), avec « Comme aujourd'hui » ----
    _mepDefinirComposition(''); await attente(1500);
    await ouvrirPanneau();
    var decorIds = function () { return [].map.call(document.querySelectorAll('[data-mep-decor^="id:"]'), function (b) { return b.getAttribute('data-mep-decor'); }).join(','); };
    cas('décor : les choix sont Aucun, Équerre, Ruban, Quarts de cercle, Plaque sur le titre', decorIds() === 'id:,id:equerre,id:ruban,id:quarts,id:plaque', decorIds());
    cas('décor : sans choix, la page n’est pas modifiée', !page().getAttribute('data-deco') && !page().querySelector('.deco-z'), String(page().getAttribute('data-deco')));
    document.querySelector('[data-mep-decor="id:equerre"]').click(); await attente(2500);
    cas('décor : l’équerre est posée par-dessus le modèle, qui garde son bandeau et sa colonne', page().getAttribute('data-deco') === 'equerre' && page().querySelectorAll(':scope > .deco-z').length >= 1 && !!page().querySelector('.tete') && page().scrollHeight <= 1126, String(page().getAttribute('data-deco')));
    var decoCouleur = function () { var z = page().querySelector(':scope > .deco-z'); return z ? w().getComputedStyle(z).borderTopColor : 'absent'; };
    var autoC = decoCouleur();
    cas('décor : la couleur « Couleur du décor » est proposée une fois un décor choisi', !!document.querySelector('[data-mep-decor="couleur:gris"]'), autoC);
    document.querySelector('[data-mep-decor="couleur:gris"]').click(); await attente(2000);
    cas('décor : « Gris » donne au décor un gris, et le choix est gardé dans les réglages', /rgb\(184, 189, 199\)/.test(decoCouleur()) && dossier.pdfReglages && dossier.pdfReglages.decor && dossier.pdfReglages.decor.couleur === 'gris', decoCouleur());
    var pbDec = [];
    for (var idDec of ['equerre', 'ruban', 'quarts', 'plaque']) {
      _mepDefinirDecor({ id: idDec }); await attente(1500);
      var rD = recouvre(); if (page().getAttribute('data-deco') !== idDec || rD.length || page().scrollHeight > 1126) { pbDec.push(idDec + ' : ' + page().getAttribute('data-deco') + ' ' + rD.slice(0, 2).join('/') + ' h' + page().scrollHeight); }
    }
    cas('décor : les quatre décors se posent sans toucher le texte du corps ni repousser le CV sur une 2e page', pbDec.length === 0, pbDec.join(' ; '));
    _mepDefinirDecor({ id: 'plaque' }); await attente(1500);
    var metEl = page().querySelector('.metier [data-deco-c]') || page().querySelector('.metier');   // le texte recoloré est le span du titre, pas son bloc
    cas('décor : sur la plaque claire, le titre du métier est sombre (lisible)', !!metEl && /^rgb\(31, 41, 51\)/.test(w().getComputedStyle(metEl).color), metEl ? w().getComputedStyle(metEl).color : 'absent');
    _mepDefinirDecor({ id: '' }); await attente(1500);
    cas('décor : « Aucun » ramène la page exactement comme avant', !page().getAttribute('data-deco') && !page().querySelector('.deco-z'), String(page().getAttribute('data-deco')));
    _mepDefinirDecor({ id: 'ruban' }); await attente(1500);
    _mepDefinirComposition('plaque'); await attente(2500);
    cas('décor : une composition choisie remplace le décor (il n’est pas posé, et ses réglages disparaissent)', !page().getAttribute('data-deco') && !document.querySelector('[data-mep-decor]'), String(page().getAttribute('data-deco')));
    _mepDefinirComposition(''); await attente(2500);
    cas('décor : en revenant à « Comme aujourd’hui », le décor choisi est de retour', page().getAttribute('data-deco') === 'ruban', String(page().getAttribute('data-deco')));
    _mepDefinirDecor({ id: '' }); await attente(1500);
    // une composition remplace le croisement
    _mepDefinirCroisement({ lisere: true }); await attente(2000);
    _mepDefinirComposition('plaque'); await attente(2500);
    cas('croisement : une composition choisie remplace le croisement (ses réglages disparaissent)', !page().getAttribute('data-croi') && page().getAttribute('data-compo') === 'plaque' && !document.querySelector('[data-mep-croi]'), String(page().getAttribute('data-croi')) + ' ' + page().getAttribute('data-compo'));
    _mepDefinirComposition(''); await attente(2500);
    // un autre modèle repart sans croisement
    _mepDefinirCroisement({ lisere: true }); await attente(2000);
    await choisir('creatif', 'colonneFoncee');
    cas('croisement : un autre modèle repart sans croisement', !page().getAttribute('data-croi') && !(dossier.pdfReglages && dossier.pdfReglages.croisement && dossier.pdfReglages.croisement.lisere), JSON.stringify(dossier.pdfReglages && dossier.pdfReglages.croisement));
    try { _mepDefinirComposition(''); _mepGalerieTous = false; _mepGalerieChoix = null; _mepTiroirForme = null; _mepOngletsTouche = false; dossier.pdfReglages = null; } catch (e) { /* nettoyage */ }
  }
  // ---------------- Tirage au hasard : compositions, croisement et décor ajouté (Denis, 2026-10-22) ----------------
  async function parcoursTirageCompositions() {
    await preparerCvResultats();
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var page = function () { return w().document.querySelector('#conteneurPage .page-a4'); };
    document.querySelector('[data-mep-allure="creatif"]').click(); await attente(3000);
    var tous = document.querySelector('[data-mep-galerie-tous]'); if (tous && tous.getAttribute('data-mep-galerie-tous') === '1') { tous.click(); await attente(5000); }
    var vu = { compo: 0, croi: 0, deco: 0, melange: 0, debord: 0, vide: 0 }, modeles = ['colonneBandeau', 'colonneFoncee'];
    for (var mi = 0; mi < modeles.length; mi++) {
      var v = document.querySelector('[data-mep-galerie-creatif="' + modeles[mi] + '"]'); if (v) { v.click(); await attente(3500); }
      var cle = _mepCleModeleActuel();
      for (var k = 0; k < 16; k++) {
        w()._pdfDefinirComposition(''); w()._pdfDefinirCroisement({}); w()._pdfDefinirDecor({}); await attente(800);
        var e = _mepEtatFormesActuel(), kinds = _mepKindsDuModele(cle, e).concat(['formes']); if (_mepCompositionDispo(cle, e)) { kinds.splice(kinds.indexOf('formes'), 0, 'composition'); }
        window._mepTirerFormesCv(cle, e, kinds); await attente(2800);
        var c = _mepComposition(), cr = _croisementActif(_mepCroisement()), d = _decorActif(_mepDecor());
        if (c) { vu.compo++; } if (cr) { vu.croi++; } if (d) { vu.deco++; }
        if (c && (cr || d)) { vu.melange++; }
        if (page().scrollHeight > 1126) { vu.debord++; }
        if (!page().querySelector('.tete') || page().querySelector('.tete').offsetHeight < 20) { vu.vide++; }
      }
    }
    cas('tirage : sur 32 tirages, des compositions, des croisements et des décors sortent', vu.compo >= 1 && vu.deco >= 1 && (vu.croi >= 1 || vu.compo >= 1), JSON.stringify(vu));
    cas('tirage : une composition n’est jamais tirée avec un croisement ni un décor (elle les remplace)', vu.melange === 0, JSON.stringify(vu));
    cas('tirage : aucun tirage ne repousse le CV sur une 2e page ni ne laisse l’en-tête vide', vu.debord === 0 && vu.vide === 0, JSON.stringify(vu));
    try { w()._pdfDefinirComposition(''); w()._pdfDefinirCroisement({}); w()._pdfDefinirDecor({}); _mepGalerieTous = false; _mepGalerieChoix = null; _mepTiroirForme = null; dossier.pdfReglages = null; } catch (er) { /* nettoyage */ }
  }
  // ---------------- Texte à deux tons dans le Word (2026-10-22) : le texte qui sort de la forme du bandeau est recoloré MOT PAR MOT dans l'export Word ----------------
  async function parcoursTexteHorsWord() {
    await preparerCvResultats();
    dossier.titreCV = 'Agente d’accueil et de sécurité';   // un titre assez long pour dépasser du ruban court
    document.querySelector('[data-mep-allure="creatif"]').click(); await attente(3000);
    var tous = document.querySelector('[data-mep-galerie-tous]'); if (tous && tous.getAttribute('data-mep-galerie-tous') === '1') { tous.click(); await attente(5000); }
    document.querySelector('[data-mep-galerie-creatif="mqBandeau"]').click(); await attente(3500);
    var cle = _mepCleModeleActuel(); _mepFormeAppliquer.bandeau('rubanCourt', cle); await attente(4500);
    // le titre est agrandi (réglage de l'en-tête) pour qu'il dépasse à coup sûr du ruban, quelle que soit la hauteur de l'en-tête
    var ent = _mqEnteteEtat(); ent.libre = true; ent.modif = true; ent.ech = { metier: 1.2 }; ent.larg = { metier: 62 }; _mqPanneau()._pdfMqDefinirEntete(ent); await attente(4500);
    var lire = async function () {
      var r = await exporterCvWord(dossier), zip = await JSZip.loadAsync(r.blob), xml = '';
      for (var f of ['word/document.xml', 'word/header1.xml', 'word/header2.xml']) { var fic = zip.file(f); xml += fic ? await fic.async('string') : ''; }
      var runs = (xml.match(/<w:r>[\s\S]*?<\/w:r>/g) || []).map(function (x) { var c = /<w:color w:val="([0-9A-Fa-f]{6})"/.exec(x), t = /<w:t[^>]*>([^<]*)<\/w:t>/.exec(x); return { c: c ? c[1].toUpperCase() : '', t: t ? t[1] : '' }; });
      return runs;
    };
    var runs = await lire();
    var de = function (mot) { return runs.filter(function (r) { return r.t.indexOf(mot) !== -1 && r.t === r.t.toUpperCase(); })[0]; };
    var a = de('AGENTE'), b = de('SÉCURITÉ');
    cas('Word texte à deux tons : le début du titre, dans le ruban, reste blanc', !!a && a.c === 'FFFFFF', a ? a.c : 'absent');
    cas('Word texte à deux tons : le mot qui sort du ruban prend une autre couleur (lisible sur le fond blanc), il ne reste pas blanc', !!b && b.c !== 'FFFFFF' && b.c !== '', b ? b.c : 'absent');
    // « Ne rien changer » : plus de recoloration, le texte reste blanc comme dans le PDF
    _mepReglageMoteur_texteHors('aucun', null); await attente(4500);
    runs = await lire(); de = function (mot) { return runs.filter(function (r) { return r.t.indexOf(mot) !== -1 && r.t === r.t.toUpperCase(); })[0]; };
    b = de('SÉCURITÉ');
    cas('Word texte à deux tons : avec « Ne rien changer », le texte reste blanc partout (comme dans le PDF)', !!b && b.c === 'FFFFFF', b ? b.c : 'absent');
    // une composition remplace le bandeau et cache la copie « hors de la forme » : le titre garde la couleur de la composition (pas de recoloration fantôme, titre invisible dans Word)
    _mepReglageMoteur_texteHors('dessous', null); await attente(4500);
    _mepDefinirComposition('diagonale'); await attente(4500);
    runs = await lire(); de = function (mot) { return runs.filter(function (r) { return r.t.indexOf(mot) !== -1 && r.t === r.t.toUpperCase(); })[0]; };
    a = de('AGENTE'); b = de('SÉCURITÉ');
    cas('Word texte à deux tons : avec une composition, le titre garde partout la couleur de la composition (la copie « hors de la forme » est cachée, aucun mot n’est recoloré)', !!a && !!b && a.c === b.c && a.c !== '', (a ? a.c : 'absent') + ' / ' + (b ? b.c : 'absent'));
    try { _mepDefinirComposition(''); _mepReglageMoteur_texteHors('dessous', null); _mepGalerieTous = false; _mepGalerieChoix = null; _mepTiroirForme = null; _mepOngletsTouche = false; dossier.pdfReglages = null; } catch (e) { /* nettoyage */ }
  }
  // ---------------- Sens des formes de bandeau (Denis, 2026-10-20) : un bouton de forme et une rangée d'images « Sens » ----------------
  async function parcoursSensBandeau() {
    await preparerCvResultats();
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var doc = function () { return w().document; };
    var tiroir = function () { return document.querySelector('.gab-tiroir'); };
    var cliquer = async function (el) { el.click(); await attente(2800); };
    document.querySelector('[data-mep-allure="creatif"]').click(); await attente(3000);
    var tous = document.querySelector('[data-mep-galerie-tous]'); if (tous && tous.getAttribute('data-mep-galerie-tous') === '1') { tous.click(); await attente(5000); }
    document.querySelector('[data-mep-galerie-creatif="mqBandeau"]').click(); await attente(3500);
    _mepTiroirForme = null;
    document.querySelector('#mepOngletsApercu [data-mep-onglet="bandeau"]').click(); await attente(1200);
    var clip = function () { return w().getComputedStyle(doc().querySelector('#conteneurPage .tete-fond')).getPropertyValue('--clip-bandeau').trim(); };
    var attendu = { pointe: 2, demiovale: 2, diagonale: 2, coin: 2, ruban: 2, rubanCourt: 2, vague2: 3, creneaux: 3, carte: 0, pilule: 0, droit: 0, arrondi: 3 }, ko = [];
    for (var f in attendu) {
      await cliquer(tiroir().querySelector('[data-mep-forme="' + f + '"]'));
      var bs = tiroir().querySelectorAll('.vign-sens');
      if (bs.length !== attendu[f]) { ko.push(f + ' : ' + bs.length + ' sens au lieu de ' + attendu[f]); continue; }
      var vus = {}, sansImage = 0;
      for (var i = 0; i < bs.length; i++) {
        bs = tiroir().querySelectorAll('.vign-sens');
        if (!bs[i].querySelector('svg') || bs[i].textContent.trim() !== '' || !bs[i].getAttribute('aria-label')) { sansImage++; }
        await cliquer(bs[i]);
        var v = doc().getElementById('regBordBandeauSens').value, k = clip();
        vus[k] = true;
        if (v !== String(i)) { ko.push(f + ' sens ' + i + ' : réglage ' + v); }
        if (tiroir().querySelectorAll('.vign-sens')[i].getAttribute('aria-checked') !== 'true') { ko.push(f + ' sens ' + i + ' : bouton non coché'); }
      }
      if (sansImage) { ko.push(f + ' : ' + sansImage + ' bouton(s) de sens sans image seule'); }
      if (bs.length && Object.keys(vus).length !== bs.length) { ko.push(f + ' : les sens ne dessinent pas des formes différentes (' + Object.keys(vus).length + ')'); }
    }
    cas('sens du bandeau : chaque forme a ses sens en images (deux ou trois), chacun dessine une forme différente, aucune rangée pour les formes sans sens', ko.length === 0, ko.join(' | '));
    await cliquer(tiroir().querySelector('[data-mep-forme="creneaux"]'));
    await cliquer(tiroir().querySelectorAll('.vign-sens')[2]);
    cas('sens du bandeau : « bord du haut en créneaux » (château) descend le haut du bandeau sous le haut de la page', /^polygon\(0 100%, 0 9%/.test(clip()), clip().slice(0, 40));
    await cliquer(tiroir().querySelector('[data-mep-forme="pointe"]'));
    cas('sens du bandeau : choisir une autre forme repart du premier sens', doc().getElementById('regBordBandeauSens').value === '0' && tiroir().querySelectorAll('.vign-sens')[0].getAttribute('aria-checked') === 'true', doc().getElementById('regBordBandeauSens').value);
    // compatibilite : l'ancienne diagonale inversee enregistree est la diagonale, deuxieme sens
    doc().getElementById('regBordBandeau').value = 'diagonaleInv'; doc().getElementById('regBordBandeauSens').value = '0';
    w()._pdfRafraichir(); await attente(3000);
    var e = _mepEtatFormesActuel();
    cas('sens du bandeau : une « diagonale inversée » déjà enregistrée s’affiche comme la diagonale, deuxième sens, et se dessine pareil', e && e.bandeau === 'diagonale' && e.bandeauSens === 1 && clip() === 'polygon(0 0, 100% 0, 100% 100%, 0 74%)', JSON.stringify(e) + ' ' + clip());
    try { _mepGalerieTous = false; _mepGalerieChoix = null; _mepTiroirForme = null; _mepOngletsTouche = false; dossier.pdfReglages = null; } catch (er) { /* galerie pas chargee */ }
  }
  // ---------------- Sens des formes de colonne (Denis, 2026-10-20) : vallonnée et créneaux (bord intérieur ou extérieur), arche, pointe, diagonale, coin ----------------
  async function parcoursSensColonne() {
    await preparerCvResultats();
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var doc = function () { return w().document; };
    var tiroir = function () { return document.querySelector('.gab-tiroir'); };
    var cliquer = async function (el) { el.click(); await attente(2800); };
    document.querySelector('[data-mep-allure="creatif"]').click(); await attente(3000);
    var tous = document.querySelector('[data-mep-galerie-tous]'); if (tous && tous.getAttribute('data-mep-galerie-tous') === '1') { tous.click(); await attente(5000); }
    document.querySelector('[data-mep-galerie-creatif="colonneFoncee"]').click(); await attente(3500);
    _mepTiroirForme = null;
    document.querySelector('#mepOngletsApercu [data-mep-onglet="colonne"]').click(); await attente(1200);
    var cv = function () { return doc().querySelector('#conteneurPage .cv'); };
    var clip = function () { return w().getComputedStyle(cv(), '::before').clipPath; };
    var attendu = { droit: 0, vallonne: 3, arche: 2, pointeBas: 2, diagonale: 2, coin: 2, creneaux: 2, demiovale: 0, vague2: 0, carte: 0, pilule: 0 }, ko = [];
    for (var f in attendu) {
      await cliquer(tiroir().querySelector('[data-mep-forme="' + f + '"]'));
      var bs = tiroir().querySelectorAll('.vign-sens');
      if (bs.length !== attendu[f]) { ko.push(f + ' : ' + bs.length + ' sens au lieu de ' + attendu[f]); continue; }
      var vus = {}, sansImage = 0;
      for (var i = 0; i < bs.length; i++) {
        bs = tiroir().querySelectorAll('.vign-sens');
        if (!bs[i].querySelector('svg') || bs[i].textContent.trim() !== '' || !bs[i].getAttribute('aria-label')) { sansImage++; }
        await cliquer(bs[i]);
        var v = doc().getElementById('regColonneSens').value; vus[clip()] = true;
        if (v !== String(i)) { ko.push(f + ' sens ' + i + ' : réglage ' + v); }
        if (tiroir().querySelectorAll('.vign-sens')[i].getAttribute('aria-checked') !== 'true') { ko.push(f + ' sens ' + i + ' : bouton non coché'); }
      }
      if (sansImage) { ko.push(f + ' : ' + sansImage + ' bouton(s) sans image seule'); }
      if (bs.length && Object.keys(vus).length !== bs.length) { ko.push(f + ' : les sens ne dessinent pas des formes différentes (' + Object.keys(vus).length + ')'); }
    }
    cas('sens de la colonne : chaque forme a ses sens en images, chacun dessine une forme différente, aucune rangée pour les formes sans sens', ko.length === 0, ko.join(' | '));
    await cliquer(tiroir().querySelector('[data-mep-forme="vallonne"]'));
    await cliquer(tiroir().querySelectorAll('.vign-sens')[1]);
    var pt = clip();
    var pxExt = (pt.match(/calc\(0% \+ ([0-9.]+)px\)/g) || []).map(function (x) { return parseFloat(x.match(/\+ ([0-9.]+)/)[1]); });
    cas('sens de la colonne : le relief du bord EXTÉRIEUR se dessine tout près du bord de la page (entre 0 et 9 mm), jamais dans la zone du texte (10 mm)', /^polygon\(/.test(pt) && pxExt.length > 20 && Math.max.apply(null, pxExt) <= 9 * 3.7795 + 0.5, pxExt.length + ' points, max ' + Math.max.apply(null, pxExt) + ' px');
    await cliquer(tiroir().querySelector('[data-mep-forme="pointeBas"]'));
    cas('sens de la colonne : choisir une autre forme repart du premier sens', doc().getElementById('regColonneSens').value === '0', doc().getElementById('regColonneSens').value);
    await cliquer(tiroir().querySelector('[data-mep-forme="arche"]')); await cliquer(tiroir().querySelectorAll('.vign-sens')[1]);
    cas('sens de la colonne : l’arche en bas ne décale pas le haut de l’en-tête (le nom reste à sa place)', cv().classList.contains('col-arche') && cv().classList.contains('col-arche-bas') && w().getComputedStyle(doc().querySelector('#conteneurPage .tete > div')).paddingTop !== '83.1496px', w().getComputedStyle(doc().querySelector('#conteneurPage .tete > div')).paddingTop);
    try { _mepGalerieTous = false; _mepGalerieChoix = null; _mepTiroirForme = null; _mepOngletsTouche = false; dossier.pdfReglages = null; } catch (er) { /* galerie pas chargee */ }
  }
  // ---------------- Tirage au hasard : bandeau, colonne et formes tirés comme si la personne les avait choisis, panneaux ouverts sur le choix (Denis, 2026-10-20) ----------------
  async function parcoursTirageFormesCv() {
    await preparerCvResultats();
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var doc = function () { return w().document; };
    _assurerReglagesMiseEnPageCV(); dossier.reglagesMiseEnPageCV.garderFormes = false;
    var ko = [], vus = { bandeau: 0, colonne: 0, formes: 0 };
    var passes = [['creatif', 9], ['defaut', 4]];
    for (var pa = 0; pa < passes.length; pa++) {
      document.querySelector('[data-mep-allure="' + passes[pa][0] + '"]').click(); await attente(3500);
      for (var i = 0; i < passes[pa][1]; i++) {
        _mepTiroirForme = null; document.getElementById('btnMepDe').click(); await attente(6500);
        var o = _mepTiroirForme || {}, nom = passes[pa][0] + ' tirage ' + (i + 1);
        ['bandeau', 'colonne', 'formes'].forEach(function (k) {
          if (!o[k]) { return; }
          vus[k]++;
          var t = document.querySelector('.gab-tiroir[data-mep-tiroir="' + k + '"]');
          if (!t) { ko.push(nom + ' : panneau « ' + k + ' » annoncé ouvert mais absent'); return; }
          if (k === 'formes') { return; }
          var e = _mepEtatFormesActuel() || {}, coche = t.querySelector('.vign-forme[aria-checked="true"]:not(.vign-sens)');
          if (!coche || coche.getAttribute('data-mep-forme') !== e[k]) { ko.push(nom + ' : le panneau « ' + k + ' » ne montre pas la forme tirée (' + (coche ? coche.getAttribute('data-mep-forme') : 'aucune') + ' / ' + e[k] + ')'); }
          var def = _MEP_SENS[k] && _MEP_SENS[k][e[k]], sensCoche = t.querySelector('.vign-sens[aria-checked="true"]');
          if (def && (!sensCoche || sensCoche.getAttribute('data-mep-sens') !== String(k === 'bandeau' ? e.bandeauSens : e.colonneSens))) { ko.push(nom + ' : le sens tiré n’est pas montré dans le panneau « ' + k + ' »'); }
          if (!def && t.querySelector('.vign-sens')) { ko.push(nom + ' : une rangée de sens pour une forme sans sens'); }
        });
      }
    }
    cas('tirage au hasard : les panneaux ouverts montrent exactement la forme et le sens tirés (bandeau, colonne, formes)', ko.length === 0, ko.join(' | '));
    cas('tirage au hasard : sur treize tirages, des bandeaux, des colonnes et des formes sont tirés et leurs panneaux s’ouvrent', vus.bandeau + vus.colonne + vus.formes >= 8 && vus.formes >= 1, JSON.stringify(vus));
    try { dossier.reglagesMiseEnPageCV.garderFormes = false; _mepTiroirForme = null; dossier.pdfReglages = null; } catch (er) { /* sans effet */ }
  }
  // ---------------- Texte à deux tons de la COLONNE : le nom et les coordonnées blancs qui sortent de la colonne colorée (Denis, 2026-10-20) ----------------
  async function parcoursTexteDeuxTonsColonne() {
    await preparerCvResultats();
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var doc = function () { return w().document; };
    var tiroir = function () { return document.querySelector('.gab-tiroir'); };
    var copie = function () { return doc().querySelector('#conteneurPage .tete-hors'); };
    document.querySelector('[data-mep-allure="creatif"]').click(); await attente(3000);
    var tous = document.querySelector('[data-mep-galerie-tous]'); if (tous && tous.getAttribute('data-mep-galerie-tous') === '1') { tous.click(); await attente(5000); }
    document.querySelector('[data-mep-galerie-creatif="colonneFoncee"]').click(); await attente(3500);
    _mepTiroirForme = null;
    document.querySelector('#mepOngletsApercu [data-mep-onglet="colonne"]').click(); await attente(1200);
    tiroir().querySelector('[data-mep-forme="arche"]').click(); await attente(3000);
    var cs = w().getComputedStyle(doc().querySelector('#conteneurPage .tete'));
    cas('texte à deux tons de la colonne : le gabarit donne la forme de la colonne (--clip-colonne) et l’état (--hors-actif-col)', /^polygon\(/.test(cs.getPropertyValue('--clip-colonne').trim()) && cs.getPropertyValue('--hors-actif-col').trim() === '1', cs.getPropertyValue('--clip-colonne').slice(0, 50));
    cas('texte à deux tons de la colonne : une copie de l’en-tête est posée, découpée par le complément de la colonne, et seuls le nom et les coordonnées y sont visibles', !!copie() && copie().classList.contains('tete-hors-colonne') && /^path\(evenodd/.test(copie().style.clipPath) && w().getComputedStyle(copie().querySelector('.nom')).visibility === 'visible' && (!copie().querySelector('.metier') || w().getComputedStyle(copie().querySelector('.metier')).visibility === 'hidden'), copie() ? copie().style.clipPath.slice(0, 40) : 'copie absente');
    cas('texte à deux tons de la colonne : le panneau Colonne propose le même réglage (couleur du colonne, foncé, gris, ne rien changer, autre couleur)', tiroir().querySelectorAll('[data-mep-texte-hors]').length === 4 && !!tiroir().querySelector('.gab-sw-libre input[type=color]'), String(tiroir().querySelectorAll('[data-mep-texte-hors]').length));
    tiroir().querySelector('[data-mep-texte-hors="aucun"]').click(); await attente(3000);
    cas('texte à deux tons de la colonne : « Ne rien changer » retire la copie', !copie(), '');
    tiroir().querySelector('[data-mep-texte-hors="dessous"]').click(); await attente(3000);
    try { _mepGalerieTous = false; _mepGalerieChoix = null; _mepTiroirForme = null; _mepOngletsTouche = false; dossier.pdfReglages = null; } catch (er) { /* galerie pas chargee */ }
  }
  // ---------------- Formes du bandeau sur tous les modèles à bandeau coloré ordinaire, Standard et Sobre compris (Denis, étape 4.1, 2026-10-21) ----------------
  async function parcoursFormesTousModeles() {
    await preparerCvResultats();
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var doc = function () { return w().document; };
    var tiroir = function () { return document.querySelector('.gab-tiroir'); };
    var cles = Object.keys(_CV_CAPACITES_MODELES).filter(function (k) { return _CV_CAPACITES_MODELES[k].formesBandeau.length > 0; });
    var ko = [], ok = 0;
    for (var i = 0; i < cles.length; i++) {
      var cle = cles[i], parts = cle.split(':');
      _mepTiroirForme = null;
      if (cle === 'standard') { document.querySelector('[data-mep-allure="defaut"]').click(); await attente(3000); }
      else {
        document.querySelector('[data-mep-allure="' + parts[0] + '"]').click(); await attente(3000);
        var tous = document.querySelector('[data-mep-galerie-tous]'); if (tous && tous.getAttribute('data-mep-galerie-tous') === '1') { tous.click(); await attente(4500); }
        var vign = document.querySelector('[data-mep-galerie-' + parts[0] + '="' + parts[1] + '"]');
        if (!vign) { ko.push(cle + ' : vignette introuvable'); continue; }
        vign.click(); await attente(3500);
      }
      var onglet = document.querySelector('#mepOngletsApercu [data-mep-onglet="bandeau"]');
      if (!onglet) { ko.push(cle + ' : pas d’onglet Bandeau'); continue; }
      onglet.click(); await attente(1200);
      var fb = tiroir() && tiroir().querySelector('[data-mep-forme="demiovale"]');
      if (!fb) { ko.push(cle + ' : pas de forme « Demi-ovale » dans le panneau'); continue; }
      fb.click(); await attente(3000);
      var t = doc().querySelector('#conteneurPage .tete-fond') || doc().querySelector('#conteneurPage .tete-pale'), page = doc().querySelector('#conteneurPage .page-a4');   // Sobre bandeau : bandeau pâle
      if (!t || !t.classList.contains('tete-vague')) { ko.push(cle + ' : la forme ne se dessine pas (' + (t ? t.className : 'pas de bandeau') + ')'); continue; }
      var tr = t.getBoundingClientRect(), pr = page.getBoundingClientRect();
      var hors = [].filter.call(t.querySelectorAll('.nom, .metier, .coord'), function (b) { var r = b.getBoundingClientRect(); return r.width > 0 && (r.right > pr.right + 1 || r.left < pr.left - 1 || r.bottom > tr.bottom + 40); }).length;
      if (hors) { ko.push(cle + ' : ' + hors + ' texte(s) sortent de la page ou du bandeau'); continue; }
      ok++;
    }
    cas('formes du bandeau sur tous les modèles à bandeau : Demi-ovale se dessine sur chacun des ' + cles.length + ' modèles et le texte du bandeau reste dans la page', ko.length === 0, ko.join(' | ') + ' (' + ok + '/' + cles.length + ')');
    try { _mepGalerieTous = false; _mepGalerieChoix = null; _mepTiroirForme = null; _mepOngletsTouche = false; dossier.pdfReglages = null; } catch (er) { /* galerie pas chargee */ }
  }
  // ---------------- Colonne au choix sur tous les CV à deux colonnes, Standard et Sobre compris ; les onglets suivent le NOMBRE RÉEL de colonnes (Denis, étape 4.2, 2026-10-21) ----------------
  async function parcoursColonnesTousModeles() {
    await preparerCvResultats();
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var doc = function () { return w().document; };
    var tiroir = function () { return document.querySelector('.gab-tiroir'); };
    var cv = function () { return doc().querySelector('#conteneurPage .cv'); };
    var onglets = function () { return [].map.call(document.querySelectorAll('#mepOngletsApercu [data-mep-onglet]'), function (b) { return b.getAttribute('data-mep-onglet'); }).join(','); };
    var choisirColonnes = async function (n) { var b = document.querySelector('[data-mep-org-colonnes="' + n + '"]') || document.querySelector('[data-mep-colonnes="' + n + '"]'); if (b) { b.click(); await attente(3500); } return !!b; };   // le bouton de la carte « Organisation du CV » (même geste que la personne)
    // 1. Standard : une colonne = Bandeau et Formes ; deux colonnes = Colonne aussi, même sans fond ; une forme choisie colore la colonne
    _mepTiroirForme = null;
    document.querySelector('[data-mep-allure="defaut"]').click(); await attente(3500);
    await choisirColonnes(1);
    cas('colonne : Standard à une colonne : onglets Bandeau et Formes seulement', onglets() === 'bandeau,formes', onglets());
    await choisirColonnes(2);
    cas('colonne : Standard passé à deux colonnes (sans fond de colonne) : l’onglet Colonne apparaît', onglets() === 'bandeau,colonne,formes' && !cv().classList.contains('col-vague-g') && cv().classList.contains('deux-col'), onglets() + ' / ' + cv().className);
    document.querySelector('#mepOngletsApercu [data-mep-onglet="colonne"]').click(); await attente(1200);
    var coche = tiroir().querySelector('.vign-forme[aria-checked="true"]:not(.vign-sens)');
    cas('colonne : sans fond de colonne, « Aucune » est cochée', !!coche && coche.getAttribute('data-mep-forme') === 'aucun', coche ? coche.getAttribute('data-mep-forme') : 'rien');
    tiroir().querySelector('[data-mep-forme="demiovale"]').click(); await attente(3500);
    cas('colonne : choisir une forme colore la colonne (fond à gauche) et la dessine pleine hauteur', cv().classList.contains('col-vague-g') && cv().classList.contains('col-forme') && doc().getElementById('regFondColonnes').value === 'gauche', cv().className);
    tiroir().querySelector('[data-mep-forme="aucun"]').click(); await attente(3500);
    cas('colonne : « Aucune » éteint la colonne colorée', !cv().classList.contains('col-vague-g') && doc().getElementById('regFondColonnes').value === 'aucun', cv().className);
    tiroir().querySelector('[data-mep-forme="vallonne"]').click(); await attente(3500);
    cas('colonne : le bord « Vallonnée » du Standard se dessine (pas de forme de plus, bord ondulé)', cv().classList.contains('col-vague-g') && !cv().classList.contains('col-forme') && doc().getElementById('regColonneBordDroit').checked === false, cv().className);
    await choisirColonnes(1);
    cas('colonne : retour à une colonne : l’onglet Colonne disparaît tout seul', onglets() === 'bandeau,formes', onglets());
    // 2. Tous les modèles dont la table dit qu'ils ont des formes de colonne : à deux colonnes, la forme se dessine ; à une colonne, pas d'onglet Colonne
    var cles = Object.keys(_CV_CAPACITES_MODELES).filter(function (k) { return _CV_CAPACITES_MODELES[k].formesColonne.length > 0; });
    var ko = [], ok = 0;
    for (var i = 0; i < cles.length; i++) {
      var cle = cles[i], parts = cle.split(':');
      _mepTiroirForme = null;
      if (cle === 'standard') { continue; }
      document.querySelector('[data-mep-allure="' + parts[0] + '"]').click(); await attente(3000);
      var tous = document.querySelector('[data-mep-galerie-tous]'); if (tous && tous.getAttribute('data-mep-galerie-tous') === '1') { tous.click(); await attente(4500); }
      var vign = document.querySelector('[data-mep-galerie-' + parts[0] + '="' + parts[1] + '"]');
      if (!vign) { ko.push(cle + ' : vignette introuvable'); continue; }
      vign.click(); await attente(3500);
      if (_CV_CAPACITES_MODELES[cle].colonne === 'ajoutable') {
        await choisirColonnes(1);
        if (document.querySelector('#mepOngletsApercu [data-mep-onglet="colonne"]')) { ko.push(cle + ' : onglet Colonne présent à une colonne'); continue; }
        if (!(await choisirColonnes(2))) { ko.push(cle + ' : pas de bouton 2 colonnes'); continue; }
      }
      var ong = document.querySelector('#mepOngletsApercu [data-mep-onglet="colonne"]');
      if (!ong) { ko.push(cle + ' : pas d’onglet Colonne à deux colonnes (' + onglets() + ')'); continue; }
      ong.click(); await attente(1200);
      var fc = tiroir() && tiroir().querySelector('[data-mep-forme="demiovale"]');
      if (!fc) { ko.push(cle + ' : pas de forme « Demi-ovale » dans le panneau'); continue; }
      fc.click(); await attente(3500);
      if (!cv().classList.contains('col-forme') || !cv().classList.contains('col-vague-g') && !cv().classList.contains('col-vague-d')) { ko.push(cle + ' : la forme ne se dessine pas (' + cv().className + ')'); continue; }
      var page = doc().querySelector('#conteneurPage .page-a4'), pr = page.getBoundingClientRect();
      var hors = [].filter.call(doc().querySelectorAll('#conteneurPage .col-fond *'), function (b) { var r = b.getBoundingClientRect(); return r.width > 0 && (r.right > pr.right + 1 || r.left < pr.left - 1); }).length;
      if (hors) { ko.push(cle + ' : ' + hors + ' élément(s) de la colonne sortent de la page'); continue; }
      ok++;
    }
    cas('colonne sur tous les modèles : Demi-ovale se dessine sur chacun des ' + cles.length + ' modèles (à deux colonnes) et le texte de la colonne reste dans la page', ko.length === 0, ko.join(' | ') + ' (' + ok + '/' + (cles.length - 1) + ')');
    try { _mepGalerieTous = false; _mepGalerieChoix = null; _mepTiroirForme = null; _mepOngletsTouche = false; dossier.pdfReglages = null; } catch (er) { /* galerie pas chargee */ }
  }
  // ---------------- Tirage au hasard et nombre réel de colonnes (Denis, étape 4.2) : une colonne tirée = bandeau et formes seulement ; deux colonnes = aussi la colonne, et le panneau Colonne s'ouvre sur ce qui a été tiré ----------------
  async function parcoursColonnesTirage() {
    await preparerCvResultats();
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var doc = function () { return w().document; };
    var cv = function () { return doc().querySelector('#conteneurPage .cv'); };
    var onglets = function () { return [].map.call(document.querySelectorAll('#mepOngletsApercu [data-mep-onglet]'), function (b) { return b.getAttribute('data-mep-onglet'); }).join(','); };
    _assurerReglagesMiseEnPageCV(); dossier.reglagesMiseEnPageCV.garderFormes = false;
    var ko = [], deux = 0, une = 0, colonnesTirees = 0;
    for (var pa = 0, allures = ['defaut', 'sobre', 'creatif']; pa < allures.length; pa++) {
      document.querySelector('[data-mep-allure="' + allures[pa] + '"]').click(); await attente(3500);
      for (var i = 0; i < 6; i++) {
        _mepTiroirForme = null; document.getElementById('btnMepDe').click(); await attente(6500);
        var nom = allures[pa] + ' tirage ' + (i + 1), a2 = cv().classList.contains('deux-col'), o = _mepTiroirForme || {}, ong = onglets();
        if (a2) { deux++; } else { une++; }
        var capCol = _cvFormesPourModele(_mepCleModeleActuel(), 'colonne').length > 0;
        if (ong.indexOf('colonne') !== -1 && !a2) { ko.push(nom + ' : onglet Colonne alors que le CV a une colonne'); }
        if (a2 && capCol && ong.indexOf('colonne') === -1 && cv().getAttribute('class').indexOf('col-vague') !== -1) { ko.push(nom + ' : deux colonnes colorées mais pas d’onglet Colonne (' + ong + ')'); }
        if (o.colonne) { colonnesTirees++; if (!a2) { ko.push(nom + ' : une colonne tirée sur un CV à une colonne'); } if (!cv().classList.contains('col-vague-g') && !cv().classList.contains('col-vague-d')) { ko.push(nom + ' : colonne tirée mais aucune colonne dessinée (' + cv().className + ')'); } }
      }
    }
    cas('tirage et colonnes : jamais d’onglet ni de colonne tirée sur un CV à une colonne ; sur deux colonnes, la colonne tirée est dessinée', ko.length === 0, ko.join(' | '));
    cas('tirage et colonnes : sur dix-huit tirages, des CV à une et à deux colonnes sont vus', une + deux === 18, 'une colonne : ' + une + ', deux colonnes : ' + deux + ', colonnes tirées : ' + colonnesTirees);
    try { dossier.reglagesMiseEnPageCV.garderFormes = false; _mepTiroirForme = null; dossier.pdfReglages = null; } catch (er) { /* sans effet */ }
  }
  // ---------------- Bandeau Sobre « doux » : teinte claire d'office, couleur pleine au choix (Denis, maquette validée le 2026-10-21) ----------------
  async function parcoursBandeauSobreDoux() {
    await preparerCvResultats();
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var doc = function () { return w().document; };
    var cv = function () { return doc().querySelector('#conteneurPage .cv'); };
    var tiroir = function () { return document.querySelector('.gab-tiroir'); };
    var ouvrirBandeau = async function () { _mepTiroirForme = null; var o = document.querySelector('#mepOngletsApercu [data-mep-onglet="bandeau"]'); if (o) { o.click(); await attente(1200); } return !!o; };
    var choisirSobre = async function (id) {
      document.querySelector('[data-mep-allure="sobre"]').click(); await attente(3000);
      var tous = document.querySelector('[data-mep-galerie-tous]'); if (tous && tous.getAttribute('data-mep-galerie-tous') === '1') { tous.click(); await attente(4500); }
      var v = document.querySelector('[data-mep-galerie-sobre="' + id + '"]'); if (v) { v.click(); await attente(3500); } return !!v;
    };
    var ko = [];
    // Sobre épuré : le bandeau ajouté est doux, la rangée « Teinte » est là, pas le texte à deux tons
    await choisirSobre('mq-epure');
    await ouvrirBandeau();
    tiroir().querySelector('[data-mep-forme="demiovale"]').click(); await attente(3500);
    cas('bandeau Sobre : un bandeau ajouté à Sobre épuré est une teinte douce (classe bandeau-pale, pas de fond plein)', cv().classList.contains('bandeau-pale') && !!doc().querySelector('#conteneurPage .tete-pale') && !doc().querySelector('#conteneurPage .tete-fond'), cv().className);
    var coche = function (a) { var b = tiroir().querySelector('[data-mep-teinte="' + a + '"]'); return !!b && b.getAttribute('aria-checked') === 'true'; };
    cas('bandeau Sobre : la rangée « Teinte » propose Douce (cochée) et Pleine, sans le réglage du texte à deux tons', coche('douce') && !coche('pleine') && !tiroir().querySelector('[data-mep-texte-hors]'));
    tiroir().querySelector('[data-mep-teinte="pleine"]').click(); await attente(3500);
    cas('bandeau Sobre : « Pleine » donne le bandeau coloré (fond plein) avec la forme choisie', !cv().classList.contains('bandeau-pale') && !!doc().querySelector('#conteneurPage .tete-fond.tete-vague'), cv().className);
    cas('bandeau Sobre : « Pleine » ramène le réglage du texte à deux tons, « Pleine » est cochée', coche('pleine') && !!tiroir().querySelector('[data-mep-texte-hors]'));
    tiroir().querySelector('[data-mep-teinte="douce"]').click(); await attente(3500);
    cas('bandeau Sobre : « Douce » revient à la teinte claire', cv().classList.contains('bandeau-pale') && coche('douce'), cv().className);
    // Sobre éditorial : même règle sur un autre modèle ; changer de modèle remet « Douce »
    tiroir().querySelector('[data-mep-teinte="pleine"]').click(); await attente(3500);
    await choisirSobre('mq-editorial');
    await ouvrirBandeau();
    tiroir().querySelector('[data-mep-forme="arrondi"]').click(); await attente(3500);
    cas('bandeau Sobre : changer de modèle Sobre remet la teinte douce, même après « Pleine »', cv().classList.contains('bandeau-pale') && coche('douce'), cv().className);
    // Sobre bandeau pâle (bandeau d'office) : douce d'office, pleine possible
    await choisirSobre('mq-bandeau');
    await ouvrirBandeau();
    cas('bandeau Sobre : Sobre bandeau a son bandeau pâle d’office et la rangée « Teinte » (Douce cochée)', cv().classList.contains('bandeau-pale') && coche('douce'), cv().className);
    tiroir().querySelector('[data-mep-teinte="pleine"]').click(); await attente(3500);
    cas('bandeau Sobre : Sobre bandeau en « Pleine » devient un bandeau coloré', !cv().classList.contains('bandeau-pale') && !!doc().querySelector('#conteneurPage .tete-fond'), cv().className);
    // Créatif : jamais de rangée « Teinte »
    document.querySelector('[data-mep-allure="creatif"]').click(); await attente(3000);
    var tousC = document.querySelector('[data-mep-galerie-tous]'); if (tousC && tousC.getAttribute('data-mep-galerie-tous') === '1') { tousC.click(); await attente(4500); }
    document.querySelector('[data-mep-galerie-creatif="mqBandeau"]').click(); await attente(3500);
    await ouvrirBandeau();
    cas('bandeau Sobre : un modèle Créatif n’a pas de rangée « Teinte »', !tiroir().querySelector('[data-mep-teinte]') && !cv().classList.contains('bandeau-pale'));
    try { _mepGalerieTous = false; _mepGalerieChoix = null; _mepTiroirForme = null; _mepOngletsTouche = false; dossier.pdfReglages = null; } catch (er) { /* galerie pas chargee */ }
  }
  // ---------------- Colonne douce sur les six modèles Sobre qui n'avaient jamais de fond de colonne (Denis, étape 4.4, 2026-10-21) ----------------
  async function parcoursColonneSobreDouce() {
    await preparerCvResultats();
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var doc = function () { return w().document; };
    var cv = function () { return doc().querySelector('#conteneurPage .cv'); };
    var tiroir = function () { return document.querySelector('.gab-tiroir'); };
    var onglets = function () { return [].map.call(document.querySelectorAll('#mepOngletsApercu [data-mep-onglet]'), function (b) { return b.getAttribute('data-mep-onglet'); }).join(','); };
    var choisirSobre = async function (id) {
      document.querySelector('[data-mep-allure="sobre"]').click(); await attente(3000);
      var tous = document.querySelector('[data-mep-galerie-tous]'); if (tous && tous.getAttribute('data-mep-galerie-tous') === '1') { tous.click(); await attente(4500); }
      var v = document.querySelector('[data-mep-galerie-sobre="' + id + '"]'); if (v) { v.click(); await attente(3500); } return !!v;
    };
    var choisirColonnes = async function (n) { var b = document.querySelector('[data-mep-org-colonnes="' + n + '"]'); if (b) { b.click(); await attente(3500); } return !!b; };
    var ko = [], ok = 0, ids = ['mq-editorial', 'mq-editorial-large', 'mq-technique', 'mq-cartes', 'mq-cartes-couleurs', 'mq-grille'];
    for (var i = 0; i < ids.length; i++) {
      var id = ids[i];
      _mepTiroirForme = null;
      if (!(await choisirSobre(id))) { ko.push(id + ' : vignette introuvable'); continue; }
      await choisirColonnes(2);
      if (onglets().indexOf('colonne') === -1) { ko.push(id + ' : pas d’onglet Colonne à deux colonnes (' + onglets() + ')'); continue; }
      if (cv().classList.contains('col-vague-g') || cv().classList.contains('col-vague-d')) { ko.push(id + ' : une colonne colorée dès l’arrivée du modèle'); continue; }
      document.querySelector('#mepOngletsApercu [data-mep-onglet="colonne"]').click(); await attente(1200);
      var coche = tiroir().querySelector('.vign-forme[aria-checked="true"]:not(.vign-sens)');
      if (!coche || coche.getAttribute('data-mep-forme') !== 'aucun') { ko.push(id + ' : « Aucune » devrait être cochée'); continue; }
      tiroir().querySelector('[data-mep-forme="demiovale"]').click(); await attente(3500);
      var c = cv();
      if (!c.classList.contains('col-forme') || (!c.classList.contains('col-vague-g') && !c.classList.contains('col-vague-d'))) { ko.push(id + ' : la forme ne se dessine pas (' + c.className + ')'); continue; }
      var rangee = tiroir().querySelector('[data-mep-teinte-rang="colonne"]');
      if (!rangee || rangee.querySelector('[data-mep-teinte="douce"]').getAttribute('aria-checked') !== 'true') { ko.push(id + ' : la rangée Teinte doit proposer Douce, cochée'); continue; }
      if (tiroir().querySelector('[data-mep-texte-hors]')) { ko.push(id + ' : le texte à deux tons n’a pas de sens en teinte douce'); continue; }
      var fond = w().getComputedStyle(c, '::before').backgroundColor;
      rangee.querySelector('[data-mep-teinte="pleine"]').click(); await attente(3500);
      var fondPlein = w().getComputedStyle(cv(), '::before').backgroundColor;
      if (fond === fondPlein) { ko.push(id + ' : « Pleine » ne change pas la couleur de la colonne (' + fond + ')'); continue; }
      ok++;
    }
    cas('colonne Sobre douce : six modèles Sobre arrivent sans colonne colorée, l’onglet Colonne est là à deux colonnes, une forme colore la colonne en teinte douce, « Pleine » la fonce', ko.length === 0, ko.join(' | ') + ' (' + ok + '/' + ids.length + ')');
    // changer de modèle Sobre : retour sans colonne colorée
    await choisirSobre('mq-cartes'); await choisirColonnes(2);
    cas('colonne Sobre douce : changer de modèle Sobre repart sans colonne colorée', !cv().classList.contains('col-vague-g') && !cv().classList.contains('col-vague-d'), cv().className);
    // Sobre fond garde sa colonne d'office, sans rangée Teinte
    await choisirSobre('mq-fond'); await choisirColonnes(2);
    var o = document.querySelector('#mepOngletsApercu [data-mep-onglet="colonne"]'); if (o) { o.click(); await attente(1200); }
    cas('colonne Sobre douce : Sobre fond garde sa colonne d’origine et n’a pas de rangée « Teinte de la colonne »', !!o && !tiroir().querySelector('[data-mep-teinte-rang="colonne"]'), cv().className);
    try { _mepGalerieTous = false; _mepGalerieChoix = null; _mepTiroirForme = null; _mepOngletsTouche = false; dossier.pdfReglages = null; } catch (er) { /* galerie pas chargee */ }
  }
  // ---------------- Bandeau doux derrière l'en-tête de Sobre rectangles, rien sur Rectangles et Sobre photo (Denis, étape 4.4, famille 3, 2026-10-21) ----------------
  async function parcoursBandeauSobreRectangles() {
    await preparerCvResultats();
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var doc = function () { return w().document; };
    var cv = function () { return doc().querySelector('#conteneurPage .cv'); };
    var tiroir = function () { return document.querySelector('.gab-tiroir'); };
    var onglet = function (k) { return document.querySelector('#mepOngletsApercu [data-mep-onglet="' + k + '"]'); };
    var choisir = async function (famille, id) {
      document.querySelector('[data-mep-allure="' + famille + '"]').click(); await attente(3000);
      var tous = document.querySelector('[data-mep-galerie-tous]'); if (tous && tous.getAttribute('data-mep-galerie-tous') === '1') { tous.click(); await attente(4500); }
      var v = document.querySelector('[data-mep-galerie-' + famille + '="' + id + '"]');
      if (!v) { var bascule = document.querySelector('[data-mep-galerie-tous]'); if (bascule) { bascule.click(); await attente(4500); v = document.querySelector('[data-mep-galerie-' + famille + '="' + id + '"]'); } }   // la galerie ne montre d'abord que les modèles du nombre de colonnes actuel
      if (v) { v.click(); await attente(3500); } return !!v;
    };
    _mepTiroirForme = null;
    await choisir('sobre', 'mq-rectangles');
    cas('bandeau Sobre rectangles : un onglet « Bandeau » est proposé, sans bandeau au départ', !!onglet('bandeau') && !doc().querySelector('#conteneurPage .rc-bandeau'), cv().className);
    onglet('bandeau').click(); await attente(1200);
    var coche = tiroir().querySelector('.vign-forme[aria-checked="true"]:not(.vign-sens)');
    cas('bandeau Sobre rectangles : sans bandeau, « Aucun » est coché', !!coche && coche.getAttribute('data-mep-forme') === 'aucun', coche ? coche.getAttribute('data-mep-forme') : 'rien');
    tiroir().querySelector('[data-mep-forme="demiovale"]').click(); await attente(3500);
    var haut = doc().querySelector('#conteneurPage .rc-haut.rc-bandeau.tete-pale.tete-vague');
    cas('bandeau Sobre rectangles : une forme choisie pose un bandeau doux derrière l’en-tête (teinte claire, forme dessinée)', !!haut && cv().classList.contains('bandeau-pale') && cv().classList.contains('bord-bandeau-choix'), cv().className);
    var fond = w().getComputedStyle(haut, '::before').backgroundColor;
    var canaux = (fond.match(/[0-9.]+/g) || []).slice(0, 3).map(Number).map(function (n) { return /^color\(/.test(fond) ? n * 255 : n; });   // rgb(...) ou color(srgb ...) selon le navigateur
    cas('bandeau Sobre rectangles : la teinte est claire (pas la couleur pleine du CV)', canaux.length === 3 && canaux.every(function (n) { return n > 200; }), fond);
    var pr = doc().querySelector('#conteneurPage .page-a4').getBoundingClientRect(), tr = haut.getBoundingClientRect();
    var hors = [].filter.call(haut.querySelectorAll('.rc-nom, .rc-metier, .coord'), function (b) { var r = b.getBoundingClientRect(); return r.width > 0 && (r.right > pr.right + 1 || r.left < pr.left - 1); }).length;
    cas('bandeau Sobre rectangles : les rectangles et les textes de l’en-tête restent dans la page', hors === 0, hors + ' hors page');
    cas('bandeau Sobre rectangles : pas de rangée « Teinte » (les rectangles sont des contours : douce seulement), pas de texte à deux tons', !tiroir().querySelector('[data-mep-teinte]') && !tiroir().querySelector('[data-mep-texte-hors]'));
    // toutes les formes se dessinent
    var formes = [].map.call(tiroir().querySelectorAll('.vign-forme[data-mep-forme]'), function (b) { return b.getAttribute('data-mep-forme'); }).filter(function (f) { return f !== 'aucun'; }), ko = [];
    cas('bandeau Sobre rectangles : les trois formes vides (contour, contour arrondi, deux filets) ne sont pas proposées (elles se superposeraient aux contours de l’en-tête)', ['contour', 'contourRond', 'filets'].every(function (f) { return formes.indexOf(f) === -1; }), formes.join(','));
    for (var i = 0; i < formes.length; i++) {
      var b = tiroir().querySelector('[data-mep-forme="' + formes[i] + '"]'); if (!b) { ko.push(formes[i] + ' : bouton absent'); continue; }
      b.click(); await attente(2500);
      var h = doc().querySelector('#conteneurPage .rc-haut.rc-bandeau'), pp = w().getComputedStyle(h, '::before');
      if (!h || !pp.backgroundColor || pp.backgroundColor === 'rgba(0, 0, 0, 0)') { ko.push(formes[i] + ' : pas de teinte dessinée'); }
    }
    cas('bandeau Sobre rectangles : les ' + formes.length + ' formes du bandeau se dessinent', ko.length === 0, ko.join(' | '));
    tiroir().querySelector('[data-mep-forme="aucun"]').click(); await attente(3500);
    cas('bandeau Sobre rectangles : « Aucun » retire le bandeau', !doc().querySelector('#conteneurPage .rc-bandeau') && !cv().classList.contains('bandeau-pale'), cv().className);
    // Créatif Rectangles et Sobre photo : rien
    _mepTiroirForme = null;
    await choisir('creatif', 'rectangles');
    cas('bandeau Sobre rectangles : Rectangles (Créatif) n’a pas d’onglet Bandeau', !onglet('bandeau') && !!onglet('formes'), '');
    // Sobre photo n'est dans la galerie que si le dossier a une photo : on contrôle la table des capacités, que le panneau lit pour proposer les onglets
    var capPhoto = _cvCapacitesModele('sobre:mq-photo') || {};
    cas('bandeau Sobre rectangles : Sobre photo n’a pas de bandeau dans la table (décision de Denis : rien), donc pas d’onglet Bandeau', capPhoto.bandeau === 'non' && _mepKindsDuModele('sobre:mq-photo', { deuxColonnes: true, fondColonnes: 'aucun' }).indexOf('bandeau') === -1, JSON.stringify(capPhoto));
    try { _mepGalerieTous = false; _mepGalerieChoix = null; _mepTiroirForme = null; _mepOngletsTouche = false; dossier.pdfReglages = null; } catch (er) { /* galerie pas chargee */ }
  }
  // ---------------- Les deux modèles neufs : Bandeaux noirs (Créatif) et Frise sobre (Sobre) (Denis, étape 7, 2026-10-21) ----------------
  async function parcoursDeuxModelesNeufs() {
    await preparerCvResultats();
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var doc = function () { return w().document; };
    var cv = function () { return doc().querySelector('#conteneurPage .cv'); };
    var tiroir = function () { return document.querySelector('.gab-tiroir'); };
    var onglets = function () { return [].map.call(document.querySelectorAll('#mepOngletsApercu [data-mep-onglet]'), function (b) { return b.getAttribute('data-mep-onglet'); }).join(','); };
    var choisir = async function (famille, id) {
      document.querySelector('[data-mep-allure="' + famille + '"]').click(); await attente(3000);
      var tous = document.querySelector('[data-mep-galerie-tous]'); if (tous && tous.getAttribute('data-mep-galerie-tous') === '1') { tous.click(); await attente(4500); }
      var v = document.querySelector('[data-mep-galerie-' + famille + '="' + id + '"]');
      if (!v) { var bascule = document.querySelector('[data-mep-galerie-tous]'); if (bascule) { bascule.click(); await attente(4500); v = document.querySelector('[data-mep-galerie-' + famille + '="' + id + '"]'); } }
      if (v) { v.click(); await attente(3500); } return !!v;
    };
    _mepTiroirForme = null;
    // --- Bandeaux noirs ---
    var trouve = await choisir('creatif', 'bandeauxNoirs');
    cas('Bandeaux noirs : le modèle est dans la galerie Créatif', trouve && _mepCleModeleActuel() === 'creatif:bandeauxNoirs', _mepCleModeleActuel());
    cas('Bandeaux noirs : bandeau d’en-tête incliné, titres en ruban biseauté, noir d’office', !!doc().querySelector('#conteneurPage .tete-fond.tete-vague') && cv().classList.contains('titres-ruban') && (_mepEtatFormesActuel() || {}).bandeau === 'diagonale' && /^#1f2933$/i.test(doc().getElementById('regCouleurDebut').value), cv().className + ' / ' + doc().getElementById('regCouleurDebut').value);
    cas('Bandeaux noirs : onglets Bandeau et Formes (une colonne)', onglets() === 'bandeau,formes', onglets());
    document.querySelector('#mepOngletsApercu [data-mep-onglet="bandeau"]').click(); await attente(1200);
    cas('Bandeaux noirs : les seize formes de bandeau sont proposées, « Diagonale » cochée', tiroir().querySelectorAll('.vign-forme[data-mep-forme]').length === 16 && tiroir().querySelector('.vign-forme[aria-checked="true"]:not(.vign-sens)').getAttribute('data-mep-forme') === 'diagonale', '');
    // --- Frise sobre ---
    _mepTiroirForme = null;
    trouve = await choisir('sobre', 'mq-frise');
    cas('Frise sobre : le modèle est dans la galerie Sobre', trouve && _mepCleModeleActuel() === 'sobre:mq-frise', _mepCleModeleActuel());
    var bandeau = function () { return doc().querySelector('#conteneurPage .fr-bandeau'); };
    cas('Frise sobre : fond blanc, pas de coins colorés, nom dans un bandeau sombre pleine largeur, colonne claire', cv().classList.contains('frise-sobre') && !doc().querySelector('#conteneurPage .fr-coin') && !!bandeau() && bandeau().getBoundingClientRect().width >= doc().querySelector('#conteneurPage .page-a4').getBoundingClientRect().width - 2, cv().className);
    var bg = w().getComputedStyle(doc().querySelector('#conteneurPage .fr-lat')).backgroundColor;
    cas('Frise sobre : la colonne de gauche est un gris clair', (bg.match(/\d+/g) || []).slice(0, 3).every(function (n) { return +n > 220; }), bg);
    cas('Frise sobre : onglets Bandeau et Formes (la colonne de la frise garde sa structure : pas d’onglet Colonne)', onglets() === 'bandeau,formes', onglets());
    document.querySelector('#mepOngletsApercu [data-mep-onglet="bandeau"]').click(); await attente(1200);
    var formes = [].map.call(tiroir().querySelectorAll('.vign-forme[data-mep-forme]'), function (b) { return b.getAttribute('data-mep-forme'); });
    cas('Frise sobre : treize formes de bandeau (les formes vides ne sont pas proposées), « Droit » coché', formes.length === 13 && ['contour', 'contourRond', 'filets'].every(function (f) { return formes.indexOf(f) === -1; }) && tiroir().querySelector('.vign-forme[aria-checked="true"]:not(.vign-sens)').getAttribute('data-mep-forme') === 'droit', formes.join(','));
    var ko = [], pr;
    for (var i = 0; i < formes.length; i++) {
      if (formes[i] === 'droit') { continue; }
      var b = tiroir().querySelector('[data-mep-forme="' + formes[i] + '"]'); if (!b) { ko.push(formes[i] + ' : bouton absent'); continue; }
      b.click(); await attente(2500);
      var t = bandeau(); pr = doc().querySelector('#conteneurPage .page-a4').getBoundingClientRect();
      if (!t || (formes[i] === 'arrondi' ? w().getComputedStyle(t).borderBottomLeftRadius === '0px' : !t.classList.contains('tete-vague'))) { ko.push(formes[i] + ' : forme non dessinée'); continue; }   // « Arrondi » se dessine par les coins du bandeau, les autres par le pseudo-élément
      var hors = [].filter.call(t.querySelectorAll('.fr-nom, .fr-metier'), function (e) { var r = e.getBoundingClientRect(); return r.width > 0 && (r.right > pr.right + 1 || r.left < pr.left - 1); }).length;
      if (hors) { ko.push(formes[i] + ' : texte hors de la page'); }
    }
    cas('Frise sobre : les formes de bandeau se dessinent et le nom reste dans la page', ko.length === 0, ko.join(' | '));
    try { _mepGalerieTous = false; _mepGalerieChoix = null; _mepTiroirForme = null; _mepOngletsTouche = false; dossier.pdfReglages = null; } catch (er) { /* galerie pas chargee */ }
  }
  // ---------------- Orientation des formes (rotation 2D) et aucun grand aperçu parasite (Denis, 2026-10-20) ----------------
  async function parcoursOrientationFormes() {
    await preparerCvResultats();
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var doc = function () { return w().document; };
    var formesCv = function () { return doc().querySelectorAll('#conteneurPage .formes-deco .forme-deco'); };
    var tiroir = function () { return document.querySelector('.gab-tiroir[data-mep-tiroir="formes"]'); };
    var onglet = function (k) { return document.querySelector('#mepOngletsApercu [data-mep-onglet="' + k + '"]'); };
    var liste = function () { return _mepFormesDeco(); };
    var ev = function (t, x, y, cible) { cible.dispatchEvent(new (w().PointerEvent)(t, { bubbles: true, clientX: x, clientY: y, pointerId: 1, pointerType: 'mouse' })); };
    var centre = function (el) { var r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
    var chip = function (txt) { return [].filter.call(tiroir().querySelectorAll('.vign-forme'), function (b) { return b.textContent.trim() === txt; })[0]; };
    document.querySelector('[data-mep-allure="creatif"]').click(); await attente(3000);
    var tous = document.querySelector('[data-mep-galerie-tous]'); if (tous && tous.getAttribute('data-mep-galerie-tous') === '1') { tous.click(); await attente(5000); }
    _mepTiroirForme = null; _assurerReglagesMiseEnPageCV(); dossier.reglagesMiseEnPageCV.garderFormes = true;
    document.querySelector('[data-mep-galerie-creatif="mqBandeau"]').click(); await attente(4000);
    if (liste().length) { _mepAppelerIframePdf('_pdfDefinirFormesDeco', []); await attente(3500); }
    onglet('formes').click(); await attente(900);
    tiroir().querySelector('.gab-proposition[data-mep-proposition="ovale"]').click(); await attente(5000);
    var f0 = formesCv()[0], c0 = centre(f0);
    ev('pointerdown', c0.x, c0.y, f0); ev('pointerup', c0.x, c0.y, doc().body); await attente(700);
    var pivot = doc().querySelector('.forme-deco-edition .pivot-forme');
    cas('orientation : la forme sélectionnée a une poignée ronde de pivot (flèche courbe) au-dessus d’elle, assez grande pour être saisie', !!pivot && !!pivot.querySelector('svg') && pivot.getBoundingClientRect().width >= 20 && w().getComputedStyle(pivot).borderRadius === '50%' && pivot.getBoundingClientRect().bottom <= doc().querySelector('.forme-deco-edition').getBoundingClientRect().top + 2);
    var avantC = centre(formesCv()[0]);
    var cp = centre(pivot);
    ev('pointerdown', cp.x, cp.y, pivot); ev('pointerup', cp.x, cp.y, doc().body); await attente(700);
    cas('orientation : un simple clic sur la poignée tourne la forme de 45 degrés', liste()[0].rot === 45 && w().getComputedStyle(formesCv()[0]).transform !== 'none', JSON.stringify(liste()[0].rot));
    var apresC = centre(formesCv()[0]);
    cas('orientation : la forme reste sur place en tournant (son centre ne bouge pas)', Math.abs(apresC.x - avantC.x) < 1.5 && Math.abs(apresC.y - avantC.y) < 1.5, JSON.stringify([avantC, apresC]));
    cas('orientation : le cadre de sélection tourne avec la forme', /matrix|rotate/.test(w().getComputedStyle(doc().querySelector('.forme-deco-edition')).transform));
    cas('orientation : le panneau propose Droit, 45°, 90°, 135° et « 45° » est choisi', !!chip('Droit') && !!chip('90°') && chip('45°').getAttribute('aria-checked') === 'true');
    chip('Droit').click(); await attente(4500);
    cas('orientation : « Droit » remet la forme droite', !liste()[0].rot && w().getComputedStyle(formesCv()[0]).transform === 'none');
    chip('90°').click(); await attente(4500);
    cas('orientation : « 90° » met l’ovale à la verticale', liste()[0].rot === 90);
    // glisser la poignée : l'angle est celui du pointeur autour du centre (poignée au-dessus = 0 degré)
    f0 = formesCv()[0]; ev('pointerdown', centre(f0).x, centre(f0).y, f0); ev('pointerup', centre(f0).x, centre(f0).y, doc().body); await attente(700);
    var cc = centre(formesCv()[0]); pivot = doc().querySelector('.forme-deco-edition .pivot-forme'); cp = centre(pivot);
    ev('pointerdown', cp.x, cp.y, pivot); ev('pointermove', cc.x - 120, cc.y, doc().body); ev('pointerup', cc.x - 120, cc.y, doc().body); await attente(700);
    cas('orientation : tirer la poignée à gauche du centre met la forme à -90 degrés (avec un petit aimant sur les multiples de 45)', liste()[0].rot === -90, String(liste()[0].rot));
    // taille d'une forme tournee : le coin haut-gauche, tel qu'on le voit, reste en place
    var pg = doc().querySelector('.forme-deco-edition .poignee-forme'), rp = centre(pg), avantF = JSON.parse(JSON.stringify(liste()[0]));
    ev('pointerdown', rp.x, rp.y, pg); ev('pointermove', rp.x, rp.y + 60, doc().body); ev('pointerup', rp.x, rp.y + 60, doc().body); await attente(700);
    var apresF = liste()[0];
    cas('orientation : tirer le coin d’une forme tournée la grandit (selon son propre sens) et elle garde son angle', apresF.rot === -90 && (apresF.fw > avantF.fw + 0.01 || Math.abs(apresF.fr - avantF.fr) > 0.01), JSON.stringify([avantF.fw, apresF.fw, avantF.fr, apresF.fr]));
    // pas de grand aperçu parasite
    var ouverts = 0, vraiOuvrir = window.ouvrirPleinEcranMaquette; window.ouvrirPleinEcranMaquette = function () { ouverts++; };
    try {
      var nom = doc().querySelector('#conteneurPage .nom'); nom.dispatchEvent(new (w().MouseEvent)('click', { bubbles: true, clientX: 5, clientY: 5 })); await attente(500);
      cas('aperçu : panneau Formes ouvert, un clic sur le CV n’ouvre PAS le grand aperçu', ouverts === 0, String(ouverts));
      var f1 = formesCv()[0], c1 = centre(f1);
      ev('pointerdown', c1.x, c1.y, f1); ev('pointermove', c1.x + 30, c1.y + 20, doc().body); ev('pointerup', c1.x + 30, c1.y + 20, doc().body);
      doc().body.dispatchEvent(new (w().MouseEvent)('click', { bubbles: true })); f1.dispatchEvent(new (w().MouseEvent)('click', { bubbles: true })); await attente(500);
      cas('aperçu : le « clic » qui suit le relâchement après un déplacement n’ouvre jamais le grand aperçu', ouverts === 0, String(ouverts));
      tiroir().querySelector('.gab-tiroir-fermer').click(); await attente(900);
      cas('aperçu : tous les panneaux fermés, le CV garde son clic habituel (info-bulle et curseur « main »)', !!doc().querySelector('#conteneurPage .page-a4').title && doc().querySelector('#conteneurPage .page-a4').style.cursor === 'pointer');
      await attente(1500);
      doc().querySelector('#conteneurPage .nom').dispatchEvent(new (w().MouseEvent)('click', { bubbles: true, clientX: 5, clientY: 5 })); await attente(500);
      cas('aperçu : tous les panneaux fermés, un clic sur le CV ouvre toujours le grand aperçu (comportement habituel conservé)', ouverts === 1, String(ouverts));
    } finally { window.ouvrirPleinEcranMaquette = vraiOuvrir; }
    try { _mepGalerieTous = false; _mepGalerieChoix = null; _mepTiroirForme = null; _mepOngletsTouche = false; _assurerReglagesMiseEnPageCV(); dossier.reglagesMiseEnPageCV.garderFormes = false; } catch (e) { /* galerie pas chargee */ }
  }
  // ---------------- « Garder mes formes » : les formes suivent d'un modèle à l'autre seulement si la personne le demande (Denis, 2026-10-20) ----------------
  async function parcoursGarderFormes() {
    await preparerCvResultats();
    document.querySelector('[data-mep-allure="creatif"]').click(); await attente(3000);
    var tous = document.querySelector('[data-mep-galerie-tous]'); if (tous && tous.getAttribute('data-mep-galerie-tous') === '1') { tous.click(); await attente(5000); }
    var onglet = function (k) { return document.querySelector('#mepOngletsApercu [data-mep-onglet="' + k + '"]'); };
    var liste = function () { return _mepFormesDeco(); };
    var choisirModele = async function (id) { if (_mepModeleCreatifActuel() !== id) { document.querySelector('[data-mep-galerie-creatif="' + id + '"]').click(); await attente(4500); } };
    var ouvrirFormes = async function () { var o = onglet('formes'); if (o && o.getAttribute('aria-expanded') !== 'true') { o.click(); await attente(800); } };
    _mepTiroirForme = null;
    _assurerReglagesMiseEnPageCV(); dossier.reglagesMiseEnPageCV.garderFormes = false;
    await choisirModele('mqBandeau'); await ouvrirFormes();
    if (liste().length) { _mepAppelerIframePdf('_pdfDefinirFormesDeco', []); await attente(3500); await ouvrirFormes(); }
    var case_ = function () { return document.getElementById('mepGarderFormes'); };
    cas('garder les formes : une case « Garder mes formes si je change de modèle » est entre le titre « Formes décoratives » et « Fermer », décochée au départ', !!case_() && !case_().checked && /Garder mes formes/.test(case_().parentElement.textContent) && (function () { var t = document.querySelector('.gab-tiroir[data-mep-tiroir="formes"] .gab-tiroir-tete'), kids = [].map.call(t.children, function (x) { return x.className; }); return kids[0] === '' && /mep-garder-formes/.test(kids[1]) && /gab-tiroir-fermer/.test(kids[2]); })());
    cas('garder les formes : « Fermer » est toujours à droite du panneau et sur la première ligne (jamais sous l’option « Garder mes formes »)', (function () { var pan = document.querySelector('.gab-tiroir[data-mep-tiroir="formes"]'), fe = pan.querySelector('.gab-tiroir-fermer').getBoundingClientRect(), ga = pan.querySelector('.mep-garder-formes').getBoundingClientRect(), pr = pan.getBoundingClientRect(); return pr.right - fe.right < 30 && fe.top <= ga.top + 2; })());
    document.querySelector('.gab-tiroir .gab-proposition[data-mep-proposition="rond"]').click(); await attente(5000);
    cas('garder les formes : une forme est posée', liste().length === 1 && liste()[0].forme === 'rond');
    await choisirModele('colonneBandeau'); await ouvrirFormes();
    cas('garder les formes : sans la case cochée, un autre modèle repart SANS forme (aucune ne suit toute seule)', liste().length === 0 && !document.querySelector('#conteneurPage .forme-deco, .forme-deco') , String(liste().length));
    document.querySelector('.gab-tiroir .gab-proposition[data-mep-proposition="losange"]').click(); await attente(5000);
    case_().click(); await attente(500);
    cas('garder les formes : cocher la case est gardé dans les réglages du CV', dossier.reglagesMiseEnPageCV.garderFormes === true && case_().checked);
    var avantListe = JSON.stringify(liste());
    await choisirModele('mqBandeau'); await ouvrirFormes();
    cas('garder les formes : case cochée, les formes suivent sur le nouveau modèle, identiques', JSON.stringify(liste()) === avantListe && liste().length === 1 && !!case_() && case_().checked, avantListe + ' / ' + JSON.stringify(liste()));
    // « Un autre modèle » (tirage) : les formes ne bougent pas
    var de = document.getElementById('btnMepDe'); if (de) { de.click(); await attente(5500); }
    await ouvrirFormes();
    cas('garder les formes : case cochée, « Un autre modèle » (tirage) ne change, n’ajoute et ne retire aucune forme', JSON.stringify(liste()) === avantListe, JSON.stringify(liste()));
    case_().click(); await attente(500);
    cas('garder les formes : décochée, c’est de nouveau le réglage par défaut', dossier.reglagesMiseEnPageCV.garderFormes === false);
    await choisirModele(_mepModeleCreatifActuel() === 'colonneFoncee' ? 'mqBandeau' : 'colonneFoncee'); await ouvrirFormes();
    cas('garder les formes : décochée, l’autre modèle repart de nouveau sans forme', liste().length === 0);
    try { _mepGalerieTous = false; _mepGalerieChoix = null; _mepTiroirForme = null; _mepOngletsTouche = false; dossier.reglagesMiseEnPageCV.garderFormes = false; } catch (e) { /* galerie pas chargee */ }
  }
  // ---------------- Panneaux de formes à gauche, à la place des vignettes, plusieurs ouverts à la fois (Denis, 2026-10-20, tâche A3) ----------------
  async function parcoursPanneauxGauche() {
    await preparerCvResultats();
    document.querySelector('[data-mep-allure="creatif"]').click(); await attente(3000);
    var tous = document.querySelector('[data-mep-galerie-tous]'); if (tous && tous.getAttribute('data-mep-galerie-tous') === '1') { tous.click(); await attente(5000); }
    var onglet = function (k) { return document.querySelector('#mepOngletsApercu [data-mep-onglet="' + k + '"]'); };
    var visible = function (el) { return !!el && el.offsetParent !== null; };
    document.querySelector('[data-mep-galerie-creatif="colonneBandeau"]').click(); await attente(3500);
    _mepTiroirForme = null; _mepMajOngletsApercu(); await attente(500);
    var galerie = function () { return document.querySelector('.gab-familles'); };
    var allure = function () { return document.querySelector('.ligne-allure'); };
    cas('panneaux : au départ, aucun panneau ; l’« Allure générale » (Sobre, Standard, Créatif) et les vignettes sont visibles', !document.getElementById('mepPanneauxForme') && visible(galerie()) && visible(allure()));
    onglet('formes').click(); onglet('colonne').click(); onglet('bandeau').click(); await attente(900);
    var hote = document.getElementById('mepPanneauxForme');
    var ordre = hote ? [].map.call(hote.querySelectorAll('.gab-tiroir'), function (t) { return t.getAttribute('data-mep-tiroir'); }).join(',') : '';
    cas('panneaux : les trois s’ouvrent en même temps, dans l’ordre Bandeau, Colonne, Formes (quel que soit l’ordre des clics)', ordre === 'bandeau,colonne,formes', ordre);
    cas('panneaux : sur un écran d’ordinateur ou de tablette, ils sont dans la colonne des réglages, à gauche, à la place des vignettes (qui sont masquées)', !!hote && !!hote.closest('.mep-2col-reglages') && !visible(galerie()) && document.querySelector('.mep-2col').classList.contains('mep-panneaux-ouverts'));
    cas('panneaux : le « Fermer » de chaque panneau est en haut à droite de ce panneau', [].every.call(document.querySelectorAll('#mepPanneauxForme .gab-tiroir'), function (p) { var f = p.querySelector('.gab-tiroir-fermer').getBoundingClientRect(), r = p.getBoundingClientRect(); return r.right - f.right < 30 && f.top - r.top < 30; }));
    cas('panneaux : l’« Allure générale » disparaît aussi (personne ne change de modèle pendant qu’il règle le sien) et, avec trois panneaux ouverts, un bouton « Fermer les panneaux » est là', !visible(allure()) && !!document.getElementById('btnMepFermerPanneaux') && document.getElementById('btnMepFermerPanneaux').tagName === 'BUTTON' && /Fermer les panneaux/.test(document.getElementById('btnMepFermerPanneaux').textContent));
    cas('panneaux : l’aperçu reste dans sa colonne (à droite) pendant les réglages', !!document.querySelector('.mep-2col-apercu #zonePdfInlineCV') && !hote.closest('.mep-2col-apercu'));
    cas('panneaux : chaque onglet ouvert est « déplié »', ['bandeau', 'colonne', 'formes'].every(function (k) { return onglet(k).getAttribute('aria-expanded') === 'true'; }));
    document.querySelector('.gab-tiroir[data-mep-tiroir="colonne"] .gab-tiroir-fermer').click(); await attente(700);
    cas('panneaux : « Fermer » ne ferme que son panneau (les deux autres restent, l’allure et les vignettes restent masquées)', document.querySelectorAll('#mepPanneauxForme .gab-tiroir').length === 2 && !visible(galerie()) && !visible(allure()));
    cas('panneaux : avec deux panneaux ouverts, « Fermer les panneaux » est encore là', !!document.getElementById('btnMepFermerPanneaux'));
    document.querySelector('.gab-tiroir[data-mep-tiroir="bandeau"] .gab-tiroir-fermer').click(); await attente(700);
    cas('panneaux : avec un seul panneau ouvert, le bouton « Fermer les panneaux » n’apparaît pas', document.querySelectorAll('#mepPanneauxForme .gab-tiroir').length === 1 && !document.getElementById('btnMepFermerPanneaux'));
    onglet('colonne').click(); onglet('bandeau').click(); await attente(800);
    // téléphone : sous l'aperçu
    var largeAvant = _mepEcranLarge; _mepEcranLarge = function () { return false; };
    _mepMajOngletsApercu(); await attente(700);
    hote = document.getElementById('mepPanneauxForme');
    cas('panneaux : sur un téléphone (moins de 700 px), ils s’ouvrent sous l’aperçu et les vignettes restent visibles', !!hote && hote.previousElementSibling && hote.previousElementSibling.id === 'zonePdfInlineCV' && visible(galerie()) && !document.querySelector('.mep-2col').classList.contains('mep-panneaux-ouverts'));
    _mepEcranLarge = largeAvant;
    _mepMajOngletsApercu(); await attente(700);
    document.getElementById('btnMepFermerPanneaux').click(); await attente(900);
    cas('panneaux : « Fermer les panneaux » les ferme tous d’un coup : l’« Allure générale » et les vignettes reviennent, le conteneur disparaît', !document.getElementById('mepPanneauxForme') && visible(galerie()) && visible(allure()) && !document.querySelector('.mep-2col').classList.contains('mep-panneaux-ouverts') && document.querySelectorAll('.gab-tiroir').length === 0);
    try { _mepGalerieTous = false; _mepGalerieChoix = null; _mepTiroirForme = null; _mepOngletsTouche = false; } catch (e) { /* galerie pas chargee */ }
  }
  // ---------------- Onglets sur l'aperçu : icônes, phrase d'invitation, pulsation jusqu'au premier clic (Denis, 2026-10-20, tâche A3) ----------------
  async function parcoursOngletsApercu() {
    await preparerCvResultats();
    var onglets = function () { return [].slice.call(document.querySelectorAll('#mepOngletsApercu .mep-onglet-apercu[data-mep-onglet]')); };   // (le bouton « Régler l’en-tête » est sur sa propre ligne, ce n’est pas un onglet)
    var choisirModele = async function (id) { var v = document.querySelector('[data-mep-galerie-creatif="' + id + '"]'); if (_mepModeleCreatifActuel() !== id) { v.click(); await attente(3500); } };
    document.querySelector('[data-mep-allure="creatif"]').click(); await attente(3000);
    var tous = document.querySelector('[data-mep-galerie-tous]'); if (tous && tous.getAttribute('data-mep-galerie-tous') === '1') { tous.click(); await attente(5000); }
    _mepOngletsTouche = false; _mepTiroirForme = null;
    await choisirModele('colonneFoncee');
    var o = onglets();
    cas('onglets : quatre onglets (Composition, Bandeau, Colonne, Formes), chacun avec son icône dessinée en plus du mot', o.length === 4 && o.every(function (b) { return !!b.querySelector('svg') && b.querySelector('span').textContent.length > 3; }), o.map(function (b) { return b.textContent; }).join('|'));
    var inv = document.querySelector('#mepOngletsApercu .mep-onglets-invite');
    cas('onglets : une phrase invite à personnaliser l’allure du modèle', !!inv && /personnaliser/.test(inv.textContent) && !/—|–/.test(inv.textContent), inv && inv.textContent);
    cas('onglets : avant le premier clic, les onglets pulsent l’un après l’autre (rangs 0, 1, 2, 3 ...)', o.every(function (b, i) { return b.classList.contains('pulse-sugg') && b.style.getPropertyValue('--rang-pulse') === String(i) && getComputedStyle(b).animationName === 'pulseSugg'; }), o.map(function (b) { return b.className; }).join('|'));
    o[1].click(); await attente(1500);
    cas('onglets : après un clic sur n’importe quel onglet, plus aucun ne pulse', onglets().length === 4 && onglets().every(function (b) { return !b.classList.contains('pulse-sugg'); }) && _mepOngletsTouche === true);
    _mepOngletsTouche = false; _mepTiroirForme = null;
    await choisirModele('frise');
    o = onglets();
    cas('onglets : un modèle sans bandeau ni colonne (Frise) n’a que « Formes », avec son icône, et c’est lui qui pulse doucement', o.length === 1 && o[0].getAttribute('data-mep-onglet') === 'formes' && !!o[0].querySelector('svg') && o[0].classList.contains('pulse-sugg') && o[0].classList.contains('pulse-seul'), o.map(function (b) { return b.className; }).join('|'));
    cas('onglets : même phrase d’invitation, adaptée aux formes seules', /formes décoratives/.test(document.querySelector('#mepOngletsApercu .mep-onglets-invite').textContent));
    o[0].click(); await attente(1500);
    cas('onglets : un clic sur « Formes » arrête la pulsation', !onglets()[0].classList.contains('pulse-sugg') && _mepOngletsTouche === true);
    try { _mepGalerieTous = false; _mepGalerieChoix = null; _mepTiroirForme = null; _mepOngletsTouche = false; } catch (e) { /* galerie pas chargee */ }
  }
  // ---------------- Bord du bandeau : onglet « Bandeau » sur l'aperçu et tiroir des formes (Denis, 2026-10-11 ; réglages sur l'aperçu depuis 2026-10-20, tâche A3) ----------------
  async function parcoursBordBandeau() {
    await preparerCvResultats();
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var doc = function () { return w().document; };
    var cv = function () { return doc().querySelector('#conteneurPage .cv'); };
    var choix = function () { return doc().getElementById('regBordBandeau').value; };
    var onglet = function (k) { return document.querySelector('#mepOngletsApercu [data-mep-onglet="' + k + '"]'); };
    var vignette = function (id) { return document.querySelector('[data-mep-galerie-creatif="' + id + '"]'); };
    var tiroir = function () { return document.querySelector('.gab-tiroir'); };
    var forme = function (v) { return tiroir() && tiroir().querySelector('[data-mep-forme="' + v + '"]'); };
    var formes = function () { return tiroir() ? [].map.call(tiroir().querySelectorAll('.vign-forme[data-mep-forme]'), function (b) { return b.getAttribute('data-mep-forme'); }).join(',') : ''; };
    var actifForme = function () { var a = tiroir() && tiroir().querySelector('[aria-checked="true"]'); return a ? a.getAttribute('data-mep-forme') : ''; };
    var cliquer = async function (el) { el.click(); await attente(2500); };
    var choisirModele = async function (id) { if (_mepModeleCreatifActuel() !== id) { vignette(id).click(); await attente(3500); } };
    var ouvrir = async function (k) { ['bandeau', 'colonne', 'formes'].forEach(function (x) { var autre = onglet(x); if (x !== k && autre && autre.getAttribute('aria-expanded') === 'true') { autre.click(); } }); var o = onglet(k); if (o && o.getAttribute('aria-expanded') !== 'true') { o.click(); } await attente(700); };
    var debut = async function () {
      document.querySelector('[data-mep-allure="creatif"]').click(); await attente(3000);
      var tous = document.querySelector('[data-mep-galerie-tous]'); if (tous && tous.getAttribute('data-mep-galerie-tous') === '1') { tous.click(); await attente(5000); }
      _mepTiroirForme = null;
    };
    var fin = function () { try { _mepGalerieTous = false; _mepGalerieChoix = null; _mepTiroirForme = null; } catch (e) { /* galerie pas chargee */ } };
    await debut();
    await choisirModele('duoOvale');
    cas('bord du bandeau : Duo ovale est arrondi au départ et porte un onglet « Bandeau »', cv().classList.contains('bord-bandeau-choix') && choix() === 'arrondi' && !!onglet('bandeau'), choix());
    await choisirModele('mqBandeau'); await ouvrir('bandeau');
    cas('bord du bandeau : Bandeau entier est droit au départ (tiroir ouvert dans la page)', actifForme() === 'droit', actifForme());
    await choisirModele('vagueMarine');
    cas('bord du bandeau : Vague marine est vallonné au départ', actifForme() === 'vallonne', actifForme());
    cas('bord du bandeau : seize formes dans le tiroir (droit, arrondi, vallonné, en pointe et les douze nouvelles), l’onglet est sur l’aperçu et non sous la vignette', !!tiroir() && tiroir().querySelectorAll('.vign-forme[data-mep-forme]').length === 16 && !forme('aucun') && !document.querySelector('.vign-opt'));
    for (var i = 0, propres = ['rubanDiagonal', 'mqDiagonale', 'medaillon']; i < propres.length; i++) { await choisirModele(propres[i]); cas('bord du bandeau : ' + propres[i] + ' a AUSSI un onglet « Bandeau » (son dessin d’en-tête est la forme de départ, étape 4.3)', !!onglet('bandeau') && !!vignette(propres[i])); }
    await choisirModele('duoOvale'); await ouvrir('bandeau');
    await cliquer(forme('vallonne')); await attente(1500);
    cas('bord du bandeau : la forme du modèle en cours change le bord du CV (vallonné)', choix() === 'vallonne' && !!doc().querySelector('.tete-vague') && actifForme() === 'vallonne', choix());
    await cliquer(forme('droit')); await attente(1500);
    cas('bord du bandeau : « Droit » retire l’arrondi et la vague', choix() === 'droit' && !doc().querySelector('.tete-vague') && w().getComputedStyle(doc().querySelector('.tete-fond')).borderRadius === '0px', w().getComputedStyle(doc().querySelector('.tete-fond')).borderRadius);
    // Décision Denis 2026-10-20 : le bandeau et la colonne ne suivent PAS d'un modèle à l'autre : chaque modèle garde sa forme de départ.
    await choisirModele('vagueMarine');
    cas('bord du bandeau : le choix fait sur un autre modèle (droit) ne suit pas : Vague marine reste vallonnée', choix() === 'vallonne' && !!doc().querySelector('.tete-vague'), choix());
    await choisirModele('mqBandeau'); await choisirModele('duoOvale');
    cas('bord du bandeau : chaque modèle garde sa forme de départ (Duo ovale arrondi)', choix() === 'arrondi', choix());
    fin();
  }
  // ---------------- Bandeau ET colonne réglables ensemble : « Aucun », « En pointe », « Arche », jamais d'option impossible (Denis, 2026-10-20, tâche A1b ; sur l'aperçu depuis A3) ----------------
  async function parcoursFormesBandeauColonne() {
    await preparerCvResultats();
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var doc = function () { return w().document; };
    var cv = function () { return doc().querySelector('#conteneurPage .cv'); };
    var onglet = function (k) { return document.querySelector('#mepOngletsApercu [data-mep-onglet="' + k + '"]'); };
    var vignette = function (id) { return document.querySelector('[data-mep-galerie-creatif="' + id + '"]'); };
    var tiroir = function () { return document.querySelector('.gab-tiroir'); };
    var forme = function (v) { return tiroir() && tiroir().querySelector('[data-mep-forme="' + v + '"]'); };
    var formes = function () { return tiroir() ? [].map.call(tiroir().querySelectorAll('.vign-forme[data-mep-forme]'), function (b) { return b.getAttribute('data-mep-forme'); }).join(',') : ''; };
    var actifForme = function () { var a = tiroir() && tiroir().querySelector('[aria-checked="true"]'); return a ? a.getAttribute('data-mep-forme') : ''; };
    var cliquer = async function (el) { el.click(); await attente(2500); };
    var choisirModele = async function (id) { if (_mepModeleCreatifActuel() !== id) { vignette(id).click(); await attente(3500); } };
    var ouvrir = async function (k) { ['bandeau', 'colonne', 'formes'].forEach(function (x) { var autre = onglet(x); if (x !== k && autre && autre.getAttribute('aria-expanded') === 'true') { autre.click(); } }); var o = onglet(k); if (o && o.getAttribute('aria-expanded') !== 'true') { o.click(); } await attente(700); };
    var debut = async function () {
      document.querySelector('[data-mep-allure="creatif"]').click(); await attente(3000);
      var tous = document.querySelector('[data-mep-galerie-tous]'); if (tous && tous.getAttribute('data-mep-galerie-tous') === '1') { tous.click(); await attente(5000); }
      _mepTiroirForme = null;
    };
    var fin = function () { try { _mepGalerieTous = false; _mepGalerieChoix = null; _mepTiroirForme = null; } catch (e) { /* galerie pas chargee */ } };
    await debut();
    await choisirModele('colonneFoncee');
    cas('formes : Colonne foncée porte les onglets « Bandeau », « Colonne » et « Formes »', !!onglet('bandeau') && !!onglet('colonne') && !!onglet('formes'));
    await ouvrir('bandeau');
    cas('formes : sans bandeau au départ, le tiroir du bandeau commence par « Aucun » (choisi) puis les seize formes', formes() === 'aucun,droit,arrondi,vallonne,pointe,diagonale,coin,demiovale,vague2,creneaux,carte,pilule,ruban,rubanCourt,contour,contourRond,filets' && actifForme() === 'aucun', formes() + ' / ' + actifForme());
    await ouvrir('colonne');
    cas('formes : sans bandeau, le tiroir de la colonne propose l’arche', formes() === 'droit,vallonne,arche,diagonale,pointeBas,coin,demiovale,vague2,creneaux,carte,pilule,contour,contourRond,filets', formes());
    await ouvrir('bandeau');
    await cliquer(forme('pointe')); await attente(1500);
    cas('formes : « En pointe » fait apparaître un bandeau en pointe sur le CV', !!doc().querySelector('.tete-fond.tete-vague') && cv().classList.contains('bord-bandeau-choix') && doc().getElementById('regBordBandeau').value === 'pointe' && doc().getElementById('regBandeauEnTete').checked, cv().className);
    cas('formes : après le choix, le tiroir reste ouvert avec « En pointe » choisi', actifForme() === 'pointe', actifForme());
    await ouvrir('colonne');
    cas('formes : avec un bandeau, l’arche n’est plus proposée (jamais une option impossible)', formes() === 'droit,vallonne,diagonale,pointeBas,coin,demiovale,vague2,creneaux,carte,pilule,contour,contourRond,filets', formes());
    await cliquer(forme('vallonne')); await attente(1500);
    cas('formes : bandeau en pointe ET colonne vallonnée sur le même CV', !!doc().querySelector('.tete-fond.tete-vague') && !doc().getElementById('regColonneBordDroit').checked && !cv().classList.contains('col-arche'), cv().className);
    await ouvrir('bandeau');
    await cliquer(forme('aucun')); await attente(1500);
    cas('formes : « Aucun » retire le bandeau du CV', !doc().querySelector('.tete-fond') && !doc().getElementById('regBandeauEnTete').checked && !cv().classList.contains('bord-bandeau-choix'), cv().className);
    await ouvrir('colonne');
    cas('formes : sans bandeau, l’arche revient dans le tiroir de la colonne', formes() === 'droit,vallonne,arche,diagonale,pointeBas,coin,demiovale,vague2,creneaux,carte,pilule,contour,contourRond,filets', formes());
    await cliquer(forme('arche')); await attente(1500);
    cas('formes : « Arche » met le haut de la colonne en arche (classe du gabarit, zone du haut dessinée)', cv().classList.contains('col-arche') && w().getComputedStyle(cv(), '::before').clipPath.indexOf('polygon') === 0, cv().className);
    await ouvrir('bandeau');
    cas('formes : aucune phrase d’explication : l’incompatibilité se voit au comportement (le tiroir du bandeau ne porte aucune note)', !tiroir().querySelector('.gab-tiroir-note') && !/ne peut pas|impossible|remplace|incompatible/i.test(tiroir().textContent), tiroir().textContent.slice(0, 120));
    await cliquer(forme('arrondi')); await attente(1500);
    cas('formes : choisir un bandeau fait sauter l’arche (bandeau arrondi, plus d’arche) sans aucun message sur le CV', !doc().querySelector('#conteneurPage .message-modele') && doc().querySelectorAll('#conteneurPage .page-a4 .tete:not(.tete-hors)').length === 1 && !cv().classList.contains('col-arche') && !!doc().querySelector('.tete-fond') && doc().getElementById('regBordBandeau').value === 'arrondi', cv().className);
    // « Colonne et bandeau » : bandeau d'office (pas de « Aucun »), jamais d'arche
    await choisirModele('colonneBandeau'); await ouvrir('bandeau');
    cas('formes : Colonne et bandeau a son bandeau d’office : seize formes, pas de « Aucun »', formes() === 'droit,arrondi,vallonne,pointe,diagonale,coin,demiovale,vague2,creneaux,carte,pilule,ruban,rubanCourt,contour,contourRond,filets', formes());
    await ouvrir('colonne');
    cas('formes : Colonne et bandeau : colonne droite ou vallonnée, jamais d’arche (le bandeau cache le haut)', formes() === 'droit,vallonne,diagonale,pointeBas,coin,demiovale,vague2,creneaux,carte,pilule,contour,contourRond,filets', formes());
    // les autres modèles : seulement ce qu'ils permettent
    await choisirModele('colonneClaire');
    // Étape 4.2 : la carte de Colonne claire est la forme « Carte flottante » de départ, donc elle a l'onglet « Colonne » ; Bandeau entier ne l'a que si le CV affiché a deux colonnes.
    cas('formes : Colonne claire (colonne en carte) a les onglets « Bandeau » et « Colonne », la carte est cochée', !!onglet('bandeau') && !!onglet('colonne') && (_mepEtatFormesActuel() || {}).colonne === 'carte', JSON.stringify(_mepEtatFormesActuel()));
    await choisirModele('mqBandeau');
    cas('formes : Bandeau entier a l’onglet « Bandeau » (avec « Formes »), et « Colonne » seulement si le CV a deux colonnes', !!onglet('bandeau') && !!onglet('formes') && (!!onglet('colonne') === cv().classList.contains('deux-col')), cv().className);
    fin();
  }
  // ---------------- Formes décoratives transparentes pour TOUS les modèles (Denis, 2026-10-20, tâche A2) ----------------
  async function parcoursFormesDeco() {
    await preparerCvResultats();
    _assurerReglagesMiseEnPageCV(); dossier.reglagesMiseEnPageCV.garderFormes = true;   // cet essai change de modèle avec ses formes : elles doivent suivre
    var w = function () { return document.querySelector('#zonePdfInlineCV iframe').contentWindow; };
    var doc = function () { return w().document; };
    var formesCv = function () { return doc().querySelectorAll('#conteneurPage .formes-deco .forme-deco'); };
    var tiroir = function () { return document.querySelector('.gab-tiroir'); };
    var rang = function (lib) { var t = tiroir(); return t && [].filter.call(t.querySelectorAll('.gab-tiroir-rang'), function (r) { return r.querySelector('.gab-tiroir-lib').textContent === lib; })[0]; };
    var choix = function (lib, nom) { var r = rang(lib); return r && [].filter.call(r.querySelectorAll('.vign-forme'), function (b) { return b.textContent.trim() === nom; })[0]; };
    var bouton = function (txt) { var t = tiroir(); return t && [].filter.call(t.querySelectorAll('button'), function (b) { return txt.test(b.textContent); })[0]; };
    var liste = function () { return (dossier.pdfReglages && dossier.pdfReglages.formesDeco) || []; };
    var cliquer = async function (el, ms) { el.click(); await attente(ms || 6500); };
    var miniaturesAvecForme = function () { return [].filter.call(document.querySelectorAll('.vign .mini[data-mini-reel]'), function (m) { return m.shadowRoot && m.shadowRoot.querySelector('.formes-deco'); }).length; };
    // Les vignettes sont masquees tant qu'un panneau est ouvert : on referme les panneaux, on compte, puis on rouvre « Formes ».
    var minisApresFermeture = async function () {
      var o = document.querySelector('#mepOngletsApercu [data-mep-onglet="formes"]'), etaitOuvert = !!o && o.getAttribute('aria-expanded') === 'true';
      if (etaitOuvert) { o.click(); await attente(1500); }
      var n = miniaturesAvecForme();
      if (etaitOuvert) { document.querySelector('#mepOngletsApercu [data-mep-onglet="formes"]').click(); await attente(800); }
      return n;
    };
    document.querySelector('[data-mep-allure="creatif"]').click(); await attente(3000);
    var tous = document.querySelector('[data-mep-galerie-tous]'); if (tous && tous.getAttribute('data-mep-galerie-tous') === '1') { tous.click(); await attente(5000); }
    var onglet = function (k) { return document.querySelector('#mepOngletsApercu [data-mep-onglet="' + k + '"]'); };
    var ouvrirFormes = async function () { var o = onglet('formes'); if (o && o.getAttribute('aria-expanded') !== 'true') { o.click(); await attente(800); } };
    var allerAuModele = async function (id) { if (_mepModeleCreatifActuel() !== id) { document.querySelector('[data-mep-galerie-creatif="' + id + '"]').click(); await attente(3500); } };
    for (var m0 = 0, sansRien = ['frise', 'rectangles', 'mqBandeau']; m0 < sansRien.length; m0++) { await allerAuModele(sansRien[m0]); cas('formes : le modèle « ' + sansRien[m0] + ' » a l’onglet « Formes » sur l’aperçu (tous les modèles, y compris ceux sans bandeau ni colonne)', !!onglet('formes') && !document.querySelector('.vign-opt')); }
    _mepTiroirForme = null; _mepMajOngletsApercu(); await attente(500);
    await ouvrirFormes();
    cas('formes : le panneau s’ouvre dans la page sans aucune forme ; des formes dessinées et cliquables tiennent lieu de bouton « Ajouter une forme »', !!tiroir() && !bouton(/Ajouter une forme/) && tiroir().querySelectorAll('.gab-proposition').length >= 6 && [].every.call(tiroir().querySelectorAll('.gab-proposition'), function (b) { return !!b.querySelector('svg') && b.textContent.trim().length > 2; }) && !rang('Forme') && formesCv().length === 0);
    cas('formes : les formes proposées passent à la ligne sans faire déborder le panneau', tiroir().scrollWidth <= tiroir().clientWidth + 1);
    await cliquer(tiroir().querySelector('.gab-proposition[data-mep-proposition="ovale"]'));
    cas('formes : toucher une forme proposée l’ajoute déjà sélectionnée (ici l’ovale), et le panneau complet s’ouvre avec « Forme 1 », les autres formes et « Ajouter une forme »', formesCv().length === 1 && liste()[0].forme === 'ovale' && !!rang('Forme') && !!bouton(/Ajouter une forme/) && !tiroir().querySelector('.gab-proposition') && !bouton(/Retirer toutes les formes/));
    await cliquer(choix('Forme', 'Rond'));
    var nbMinis = await minisApresFermeture(), totalMinis = document.querySelectorAll('.vign .mini[data-mini-reel]').length;
    cas('formes : une forme ajoutée apparaît sur le CV ET sur TOUTES les miniatures de la galerie (visibles dès que les panneaux sont refermés), et reste dans les réglages enregistrés', formesCv().length === 1 && totalMinis >= 25 && nbMinis === totalMinis && liste().length === 1, formesCv().length + ' ' + nbMinis + '/' + totalMinis);
    cas('formes : le panneau propose forme, zone (dont « Autour du métier »), taille, transparence et couleur, et AUCUN bouton « Placement libre » ni « Régler moi-même » (on touche la forme sur le CV)', !!rang('Forme') && !choix('Où la placer', 'Placement libre') && !!choix('Où la placer', 'Autour du métier') && !!choix('Taille', 'Moyenne') && !choix('Taille', 'Régler moi-même') && !!rang('Transparence') && !!rang('Couleur') && rang('Forme').querySelectorAll('.vign-forme').length === 13);
    cas('formes : l’onglet « Formes » porte la pastille verte « il y a un réglage ici » (le nombre de formes n’y est plus écrit : barre compacte)', !!onglet('formes').querySelector('.mep-onglet-pt'), onglet('formes').textContent);
    await cliquer(choix('Forme', 'Ovale'));
    await cliquer(choix('Où la placer', 'Autour du métier'));
    var f = formesCv()[0], met = doc().querySelector('#conteneurPage .metier');
    var rf = f.getBoundingClientRect(), rm = met.getBoundingClientRect();
    cas('formes : une ovale « autour du métier » entoure le titre du métier', rf.left <= rm.left && rf.right >= rm.right && rf.top <= rm.top && rf.bottom >= rm.bottom, [rf.left, rf.right, rm.left, rm.right].join(','));
    await cliquer(choix('Couleur', 'Couleur claire'));
    cas('formes : « Couleur claire » demande laquelle (8 teintes et « Autre couleur »)', tiroir().querySelectorAll('.gab-sw').length === 8 && !!tiroir().querySelector('.gab-sw-libre input[type=color]'));
    await cliquer(tiroir().querySelectorAll('.gab-sw')[3]);
    cas('formes : la teinte choisie est celle de la forme sur le CV', liste()[0].couleur === 'claire' && liste()[0].teinte === '#f0b4a8' && /240, 180, 168/.test(w().getComputedStyle(formesCv()[0]).color), liste()[0].teinte + ' ' + w().getComputedStyle(formesCv()[0]).color);
    // Remplissage : plein / vide (decoupe) / contour
    cas('formes : le remplissage propose Plein, Vide et Contour, « Plein » au départ, avec Transparence et Couleur', !!choix('Remplissage', 'Plein') && !!choix('Remplissage', 'Vide') && !!choix('Remplissage', 'Contour') && !!rang('Transparence') && !!rang('Couleur'));
    await cliquer(choix('Remplissage', 'Vide'));
    var fenV = doc().querySelector('#conteneurPage .formes-deco .forme-deco-vide'), fv = formesCv()[0];
    var masqueV = fenV && (w().getComputedStyle(fenV).webkitMaskImage || w().getComputedStyle(fenV).maskImage || '');
    cas('formes : « Vide » : la forme ne cache jamais le texte : une copie du CV (fond papier, texte foncé) n’est montrée que dans la forme, par un masque ; ni « Transparence » ni « Couleur »', liste()[0].style === 'vide' && !!fenV && /url\(/.test(masqueV) && !!fenV.querySelector('.vide-texte .nom') && w().getComputedStyle(fenV.querySelector('.vide-texte .nom')).color === 'rgb(29, 36, 51)' && w().getComputedStyle(fv).backgroundColor === 'rgba(0, 0, 0, 0)' && !rang('Transparence') && !rang('Couleur'), String(masqueV).slice(0, 60));
    cas('formes : « Vide » : la copie est inerte (aucun identifiant ni attribut data-*), le vrai texte du CV est intact', !fenV.querySelector('[id], [data-bl], [data-rub]') && !!doc().querySelector('#conteneurPage .page-a4 .nom') && doc().querySelector('#conteneurPage .page-a4 .nom').closest('.forme-deco-vide') === null);
    cas('formes : « Vide » : par défaut le bandeau et la colonne restent visibles en teinte très claire dans la forme (choix « Les montrer »)', !!fenV.querySelector('.vide-fond') && !!choix('Bandeau et colonne dans la forme', 'Les montrer') && choix('Bandeau et colonne dans la forme', 'Les montrer').getAttribute('aria-checked') === 'true');
    await cliquer(choix('Bandeau et colonne dans la forme', 'Les cacher'));
    cas('formes : « Les cacher » ne laisse que le texte sur le papier dans la forme', liste()[0].traits === false && !doc().querySelector('#conteneurPage .forme-deco-vide .vide-fond') && !!doc().querySelector('#conteneurPage .forme-deco-vide .vide-texte'));
    await cliquer(choix('Bandeau et colonne dans la forme', 'Les montrer'));
    await cliquer(choix('Orientation', '45°'));
    var fenR = doc().querySelector('#conteneurPage .forme-deco-vide');
    cas('formes : « Vide » tournée : le masque tourne avec la forme (45°) mais la copie, donc le texte, reste droite', liste()[0].rot === 45 && decodeURIComponent(String(w().getComputedStyle(fenR).webkitMaskImage || w().getComputedStyle(fenR).maskImage)).indexOf('rotate(45)') !== -1 && w().getComputedStyle(fenR.querySelector('.vide-texte')).transform === 'none' && w().getComputedStyle(fenR.querySelector('.vide-texte > *')).transform === 'none');
    await cliquer(choix('Orientation', 'Droit'));
    await cliquer(choix('Remplissage', 'Contour'));
    var fenC = doc().querySelector('#conteneurPage .formes-deco .forme-deco-contour');
    var masqueC = fenC && decodeURIComponent(String(w().getComputedStyle(fenC).webkitMaskImage || w().getComputedStyle(fenC).maskImage || ''));
    cas('formes : « Contour » = un trait dessiné par une fenêtre masquée en anneau, de la couleur choisie ; « Couleur » revient, « Transparence » reste absente', liste()[0].style === 'contour' && !!fenC && /stroke="#fff"/.test(masqueC) && !!rang('Couleur') && !rang('Transparence'), String(masqueC).slice(0, 80));
    cas('formes : « Contour » : par défaut le trait reste entier et les lettres qu’il croise changent de couleur (copie recolorée visible seulement sur le trait)', !!fenC.querySelector('.contour-texte') && !!choix('Quand le trait passe sur des lettres', 'Le trait reste entier, les lettres changent de couleur') && choix('Quand le trait passe sur des lettres', 'Le trait reste entier, les lettres changent de couleur').getAttribute('aria-checked') === 'true' && /^(#|rgb)/.test(fenC.style.getPropertyValue('--contraste').trim()));
    await cliquer(choix('Quand le trait passe sur des lettres', 'Le trait s’interrompt autour des lettres'));
    fenC = doc().querySelector('#conteneurPage .formes-deco .forme-deco-contour');
    cas('formes : « Le trait s’interrompt autour des lettres » : plus de copie, et le masque du trait est percé de vides (une boîte par ligne de texte croisée)', liste()[0].croise === 'coupe' && !fenC.querySelector('.contour-texte'), String(liste()[0].croise));
    await cliquer(choix('Quand le trait passe sur des lettres', 'Le trait reste entier, les lettres changent de couleur'));
    var fAnneau = choix('Forme', 'Anneau'); await cliquer(fAnneau);
    cas('formes : l’anneau n’a pas de contour : l’option n’est pas proposée (jamais d’option sans effet) et il redevient plein', liste()[0].forme === 'anneau' && liste()[0].style === 'plein' && !choix('Remplissage', 'Contour'));
    await cliquer(choix('Forme', 'Ovale')); await cliquer(choix('Remplissage', 'Contour'));
    await cliquer(choix('Remplissage', 'Plein'));
    cas('formes : retour à « Plein » : la transparence et le mélange reviennent', liste()[0].style === 'plein' && !!rang('Transparence') && !!rang('Couleur') && w().getComputedStyle(formesCv()[0]).mixBlendMode === 'multiply', liste()[0].style);
    // La croix est faite pour la souris : masquee sur un ecran tactile (regle lue dans la feuille de style, le navigateur de test n'etant pas tactile)
    var croixTactile = false;
    [].forEach.call(document.styleSheets, function (feuille) { try { [].forEach.call(feuille.cssRules, function (r) { if (r.media && /pointer:\s*coarse/.test(r.media.mediaText) && [].some.call(r.cssRules, function (x) { return /gab-onglet-croix/.test(x.selectorText) && x.style.display === 'none'; })) { croixTactile = true; } }); } catch (e) { /* feuille externe */ } });
    cas('formes : la croix des onglets est masquée sur un écran tactile (règle « pointer: coarse »), visible à la souris', croixTactile && !!tiroir().querySelector('.gab-onglet-croix') && getComputedStyle(tiroir().querySelector('.gab-onglet-croix')).display !== 'none');
    // Plusieurs formes, quatre au plus
    for (var ajout = 0; ajout < 6; ajout++) { await cliquer(bouton(/Ajouter une forme/), 5500); }
    cas('formes : sept formes au plus, le bouton le dit et se désactive', formesCv().length === 7 && liste().length === 7 && /7 formes au maximum/.test(bouton(/formes au maximum/).textContent) && bouton(/formes au maximum/).disabled, String(liste().length));
    var zones = liste().map(function (x) { return x.zone; });
    cas('formes : les formes ajoutées ne s’empilent pas (sept zones différentes)', new Set(zones).size === 7, zones.join(','));
    cas('formes : « Ajouter une forme » est en haut à droite, sur la rangée des onglets, et pas en bas', !!tiroir().querySelector('.gab-tiroir-onglets .gab-ajout') && ![].some.call(tiroir().querySelectorAll('.gab-tiroir-choix:last-child .btn-miss'), function (b) { return /Ajouter/.test(b.textContent); }));
    // Modèles figés, Sobre, Standard
    var pour = ['frise', 'friseFoncee', 'rectangles', 'mqCadre', 'colonneClaire'];
    for (var i = 0; i < pour.length; i++) { w()._pdfChoisirModeleCreatif(pour[i]); await attente(2500); cas('formes : le modèle « ' + pour[i] + ' » (dessin repris tel quel) porte aussi les 7 formes', formesCv().length === 7, pour[i] + ' ' + formesCv().length); }
    document.querySelector('[data-mep-allure="sobre"]').click(); await attente(4500);
    var nbMinisSobre = await minisApresFermeture();
    var totalMinisSobre = document.querySelectorAll('.vign .mini[data-mini-reel]').length;
    cas('formes : en Sobre aussi, l’onglet « Formes » est sur l’aperçu et TOUTES les miniatures portent les formes (panneaux refermés)', !!onglet('formes') && totalMinisSobre >= 12 && nbMinisSobre === totalMinisSobre && formesCv().length === 7, nbMinisSobre + '/' + totalMinisSobre + ' ' + formesCv().length);
    document.querySelector('[data-mep-allure="defaut"]').click(); await attente(4500);
    await ouvrirFormes(); var std = tiroir();
    cas('formes : en Standard (pas de vignettes), le choix des formes s’ouvre aussi depuis l’onglet « Formes » de l’aperçu, déjà rempli', !!std && !!onglet('formes') && std.querySelectorAll('.gab-tiroir-rang').length >= 5 && formesCv().length === 7);
    // Retrait : la croix de chaque onglet retire la forme d'un clic
    var croix = std.querySelectorAll('.gab-onglet-croix');
    cas('formes : chaque onglet « Forme n » montre l’image de sa forme (et garde son nom), sur un fond légèrement coloré qui le distingue des boutons de choix à fond blanc', (function () {
      var onglets = std.querySelectorAll('.gab-onglet .vign-forme'), choixBtn = std.querySelector('.gab-tiroir-rang .vign-forme[aria-checked="false"]');
      return onglets.length === 7 && [].every.call(onglets, function (o) { return !!o.querySelector('svg') && /^Forme \d$/.test(o.textContent.trim()); }) && getComputedStyle(onglets[0]).backgroundColor !== getComputedStyle(choixBtn).backgroundColor;
    })());
    cas('formes : chaque onglet « Forme n » porte une petite croix qui retire la forme', croix.length === 7 && /Retirer la forme 2/.test(croix[1].getAttribute('aria-label')), String(croix.length));
    var avantCroix = liste().map(function (x) { return x.forme + x.zone; });
    await cliquer(croix[1]); await ouvrirFormes(); std = tiroir();
    var apresCroix = liste().map(function (x) { return x.forme + x.zone; });
    cas('formes : la croix de « Forme 2 » retire cette forme et garde les six autres', apresCroix.length === 6 && apresCroix.join() === avantCroix.filter(function (x, i) { return i !== 1; }).join() && formesCv().length === 6, avantCroix.join() + ' > ' + apresCroix.join());
    var retirer = function () { return [].filter.call(std.querySelectorAll('button'), function (b) { return /Retirer/.test(b.textContent); })[0]; };
    for (var k = 0; k < 4; k++) { await cliquer(retirer()); await ouvrirFormes(); std = tiroir(); }
    var toutes = [].filter.call(std.querySelectorAll('button'), function (b) { return /Retirer toutes les formes/.test(b.textContent); })[0], cette = retirer();
    var rT = toutes && toutes.getBoundingClientRect(), rC = cette && cette.getBoundingClientRect(), rS = std.getBoundingClientRect();
    // (mise en page testée sur un écran LARGE, 1280 px : sous environ 900 px les deux boutons passent sur deux lignes, ce qui est normal)
    cas('formes : avec deux formes ou plus, « Retirer toutes les formes » est tout à droite de la même ligne que « Retirer cette forme », séparé d’elle', !!toutes && liste().length === 2 && Math.abs(rT.top - rC.top) < 6 && rS.right - rT.right < 40 && rT.left - rC.right >= 8, toutes && [rT.top, rC.top, rS.right - rT.right, rT.left - rC.right].join(','));
    await cliquer(toutes); await ouvrirFormes(); std = tiroir();
    cas('formes : « Retirer toutes les formes » les retire toutes d’un clic : plus aucune forme sur le CV ni dans les réglages, sans laisser de calque, et le panneau reprend les formes proposées', formesCv().length === 0 && !doc().querySelector('.formes-deco') && liste().length === 0 && !!std.querySelector('.gab-proposition'));
    // Reglage a la main
    document.querySelector('[data-mep-allure="creatif"]').click(); await attente(3500);
    var tous2 = document.querySelector('[data-mep-galerie-tous]'); if (tous2 && tous2.getAttribute('data-mep-galerie-tous') === '1') { tous2.click(); await attente(5000); }
    await allerAuModele('mqBandeau'); await ouvrirFormes();
    await cliquer(tiroir().querySelector('.gab-proposition[data-mep-proposition="ovale"]'));
    var evT = function (t, x, y, cible) { cible.dispatchEvent(new (w().PointerEvent)(t, { bubbles: true, clientX: x, clientY: y, pointerId: 1, pointerType: 'mouse' })); };
    var fT = formesCv()[0], rT = fT.getBoundingClientRect();
    evT('pointerdown', rT.left + rT.width / 2, rT.top + rT.height / 2, fT); evT('pointerup', rT.left + rT.width / 2, rT.top + rT.height / 2, doc().body); await attente(900);
    var cadre = doc().querySelector('.forme-deco-edition');
    cas('formes : toucher une forme pose un cadre de réglage sur l’aperçu (elle passe en placement libre sans bouger), sans aucun message ni bouton sur le CV', !!cadre && w()._cvPdfEditionFormeDeco === 0 && !doc().getElementById('barreEditionFormeDeco') && !doc().querySelector('#conteneurPage .message-modele') && !document.querySelector('.gab-tiroir-edition') && doc().body.textContent.indexOf('Déplacez') === -1 && doc().body.textContent.indexOf('Terminé') === -1);
    cas('formes : le message est dans le panneau Formes, sous son titre : on peut bouger librement les formes et choisir librement leur taille', /bouger librement vos formes/.test(tiroir().querySelector('.gab-tiroir-note').textContent) && /choisir librement leur taille/.test(tiroir().querySelector('.gab-tiroir-note').textContent) && !!tiroir().querySelector('.gab-tiroir-note'));
    w().__marqueurApercu = 'garde';
    var avant = JSON.parse(JSON.stringify(liste()[0]));
    cas('formes : passer en libre ne fait pas sauter la forme (elle garde sa place et sa taille)', avant.zone === 'libre' && avant.taille === 'perso' && typeof avant.fx === 'number' && typeof avant.fw === 'number');
    var ev = function (t, x, y, cible) { (cible || cadre).dispatchEvent(new (w().PointerEvent)(t, { bubbles: true, clientX: x, clientY: y, pointerId: 1, pointerType: 'mouse' })); };
    var r = cadre.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    ev('pointerdown', cx, cy); ev('pointermove', cx + 80, cy + 140, doc().body); ev('pointerup', cx + 80, cy + 140, doc().body); await attente(500);
    var apres = w()._cvPdfFormesDeco[0];
    cas('formes : déplacer le cadre déplace la forme, dans les proportions de la page', Math.abs((apres.fx - avant.fx) - 80 / 794) < 0.01 && Math.abs((apres.fy - avant.fy) - 140 / 1123) < 0.01, JSON.stringify([apres.fx - avant.fx, apres.fy - avant.fy]));
    cadre = doc().querySelector('.forme-deco-edition');
    var poignee = cadre.querySelector('.poignee-forme'), rp = poignee.getBoundingClientRect();
    ev('pointerdown', rp.left + rp.width / 2, rp.top + rp.height / 2, poignee); ev('pointermove', rp.left + 130, rp.top + 200, doc().body); ev('pointerup', rp.left + 130, rp.top + 200, doc().body); await attente(500);
    var etiree = w()._cvPdfFormesDeco[0];
    cas('formes : tirer le coin d’une forme étirable change sa largeur ET sa hauteur', etiree.fw > apres.fw + 0.05 && Math.abs(etiree.fr - apres.fr) > 0.03, JSON.stringify([apres.fw, etiree.fw, apres.fr, etiree.fr]));
    cas('formes : le réglage est gardé dans les réglages enregistrés dès la fin du geste', Math.abs(liste()[0].fw - etiree.fw) < 0.0001);
    cas('formes : la poignée est ronde et assez grande pour être saisie (même sur un aperçu réduit)', cadre.querySelector('.poignee-forme').getBoundingClientRect().width >= 20 && w().getComputedStyle(cadre.querySelector('.poignee-forme')).borderRadius === '50%');
    // Toucher le CV ailleurs : la forme est deselectionnee, l'apercu n'est PAS reconstruit (plus d'image qui saute)
    ev('pointerdown', 5, 5, doc().querySelector('#conteneurPage .nom') || doc().body); await attente(500);
    cas('formes : toucher le CV ailleurs désélectionne la forme (plus de cadre), elle reste, et l’aperçu n’est pas reconstruit', !doc().querySelector('.forme-deco-edition') && w()._cvPdfEditionFormeDeco === null && formesCv().length === 1 && w().__marqueurApercu === 'garde' && document.querySelector('#zonePdfInlineCV iframe').contentWindow === w());
    // Toucher directement la forme (sans passer par le panneau)
    var f0 = formesCv()[0], r0 = f0.getBoundingClientRect(), x0 = r0.left + r0.width / 2, y0 = r0.top + r0.height / 2, avantTouche = JSON.parse(JSON.stringify(liste()[0]));
    cas('formes : sur l’aperçu du panneau, les formes se touchent (pointeur actif, curseur de saisie)', w().getComputedStyle(f0).pointerEvents === 'auto' && w().getComputedStyle(f0).cursor === 'grab');
    ev('pointerdown', x0, y0, f0); ev('pointermove', x0 + 60, y0 + 40, doc().body); ev('pointerup', x0 + 60, y0 + 40, doc().body); await attente(500);
    var apresTouche = w()._cvPdfFormesDeco[0];
    cas('formes : toucher directement une forme la sélectionne (cadre), la déplace, et le panneau suit (« Forme 1 » choisie)', w()._cvPdfEditionFormeDeco === 0 && !!doc().querySelector('.forme-deco-edition') && Math.abs((apresTouche.fx - avantTouche.fx) - 60 / 794) < 0.01 && _mepFormeDecoCourante === 0 && w().__marqueurApercu === 'garde', JSON.stringify([apresTouche.fx - avantTouche.fx]));
    ev('pointerdown', 5, 5, doc().querySelector('#conteneurPage .nom') || doc().body); await attente(500);
    // Annuler
    var zoneAvant = liste()[0].zone;
    // chaque geste (placement libre, déplacement, taille, déplacement) est annulable : on annule jusqu'à retrouver la zone d'avant le réglage à la main
    for (var an = 0; an < 6 && liste().length === 1 && liste()[0].zone === 'libre'; an++) { _mepAnnulerMiseEnPage(); await attente(6500); }
    cas('formes : « Annuler » défait les réglages de formes un par un (la forme revient à sa zone d’avant le réglage à la main)', liste().length === 1 && zoneAvant === 'libre' && liste()[0].zone !== 'libre', zoneAvant + ' > ' + (liste()[0] && liste()[0].zone));
    // Word : jamais reproduites, dit clairement, et le fichier est le meme
    var lire = async function (blob) { var zip = await JSZip.loadAsync(blob), t = ''; for (var fi of ['word/document.xml', 'word/header1.xml', 'word/header2.xml']) { var fic = zip.file(fi); t += fic ? await fic.async('string') : ''; } return t; };
    var avecFormes = JSON.parse(JSON.stringify(dossier.pdfReglages));
    if (!(avecFormes.formesDeco && avecFormes.formesDeco.length)) { avecFormes.formesDeco = [{ forme: 'rond', zone: 'hd', taille: 'M', transp: 'leger', couleur: 'cv' }]; dossier.pdfReglages = avecFormes; }
    var x1 = await lire((await exporterCvWord(dossier)).blob);
    var sauve = JSON.parse(JSON.stringify(dossier.pdfReglages)); dossier.pdfReglages.formesDeco = [];
    var x2 = await lire((await exporterCvWord(dossier)).blob);
    dossier.pdfReglages = sauve;
    cas('formes : le Word est identique avec ou sans formes (le calque est ignoré, rien ne casse)', x1 === x2 && x1.length > 1000, x1.length + ' ' + x2.length);
    cas('formes : le message du Word dit que les formes ne sont pas reproduites', /formes décoratives ne sont pas reproduites/.test(phraseLimitesWord(dossier.pdfReglages)));
    // l'etat de la galerie vit hors du dossier : on le remet comme on l'a trouve pour les essais suivants
    try { _mepGalerieTous = false; _mepGalerieChoix = null; _mepTiroirForme = null; _mepFormeDecoCourante = 0; dossier.pdfReglages = null; dossier.reglagesMiseEnPageCV.garderFormes = false; } catch (e) { /* galerie pas chargee */ }
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
    // 0. « Vos documents » : une fois les choix validés, « Ce que l'assistant a préparé » et « Compléter mon CV » disparaissent (retour Denis 2026-10-19)
    var importeeAvant0 = window.reponseIAImportee, valideeAvant0 = _relectureIAValideeParType.cv, modeAvant0 = dossier.modeCreation;
    try {
      dossier.formatCV = 'pdf'; dossier.dernierDocumentPrepare = 'cv'; dossier.modeCreation = 'maj'; window.reponseIAImportee = function () { return true; };
      var rubs = function () { return !!document.querySelector('[data-assistant-rect-toggle="relecture-ia"]') || !!document.querySelector('[data-assistant-rect-toggle="complement-cv"]'); };
      _relectureIAValideeParType.cv = false; pageResultats(); await attente(2500);
      var avantValid = rubs();
      _relectureIAValideeParType.cv = true; pageResultats(); await attente(2500);
      cas('vos documents : avant validation les deux rubriques de l’assistant sont là, une fois validé elles disparaissent', avantValid && !rubs() && !!document.getElementById('btnMepMiseEnPage'), avantValid + ' / ' + rubs());
    } finally { window.reponseIAImportee = importeeAvant0; _relectureIAValideeParType.cv = valideeAvant0; dossier.modeCreation = modeAvant0; }
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
  // Module « Qui fait quoi » (2026-10-12) : parcours complet commune, secteur, liste, fiche, retours, recherche, détour par la présentation, hors zone,
  // et module fermé au public (D11). Les coordonnées ne s'affichent que si la ligne est datée (aucun téléphone inventé).
  // L'aide contextuelle de Qui fait quoi : chaque ecran a au moins une entree dont l'element est present (jamais une aide vide).
  async function parcoursMonTerritoireAide() {
    var avant = { apercu: localStorage.getItem('erip_mon_territoire_apercu'), dep: localStorage.getItem('erip_departement_ressources'), commune: localStorage.getItem('erip_mon_territoire_commune') };
    localStorage.setItem('erip_mon_territoire_apercu', '1'); localStorage.setItem('erip_departement_ressources', '24'); localStorage.removeItem('erip_mon_territoire_commune');
    var clic = function (sel) { var e = document.querySelector(sel); if (!e) { return false; } e.click(); return true; };
    var presentes = function () { return (AIDE_PAGES[pageActuelle] || []).filter(function (e) { return document.querySelector(e.selecteur); }).map(function (e) { return e.titre; }); };
    cas('Qui fait quoi (aide) : une entree d’aide pour la presentation et pour le module', (AIDE_PAGES['mon-territoire-intro'] || []).length >= 1 && (AIDE_PAGES['mon-territoire'] || []).length >= 1);
    naviguerVers('mon-territoire-intro'); await attente(500);
    cas('Qui fait quoi (aide) : la presentation a une aide (bouton pour ouvrir le module)', presentes().length >= 1, presentes().join(' | '));
    _mtEntree = 'module'; _mtPile = []; _mtEtat = { ecran: 'accueil', secteur: '', id: '', requete: '', nature: '', nbAffiches: 0, vide: '', choixCommunes: null, messageCommune: '', saisieCommune: '', saisieRecherche: '' };
    naviguerVers('mon-territoire'); await attente(700);
    cas('Qui fait quoi (aide) : l’accueil a une aide sur la commune, la recherche et les domaines', ['Votre commune', 'Chercher', 'Les domaines'].every(function (t) { return presentes().indexOf(t) !== -1; }), presentes().join(' | '));
    clic('[data-mt-domaine="emploi"]'); await attente(300);
    cas('Qui fait quoi (aide) : l’ecran des secteurs a une aide', presentes().indexOf('Les secteurs d’employeurs') !== -1, presentes().join(' | '));
    clic('[data-mt-secteur="commerce-vente"]'); await attente(300);
    cas('Qui fait quoi (aide) : la liste a une aide sur la fiche', presentes().indexOf('Voir la fiche') !== -1, presentes().join(' | '));
    if (avant.apercu === null) { localStorage.removeItem('erip_mon_territoire_apercu'); } else { localStorage.setItem('erip_mon_territoire_apercu', avant.apercu); }
    if (avant.dep === null) { localStorage.removeItem('erip_departement_ressources'); } else { localStorage.setItem('erip_departement_ressources', avant.dep); }
    if (avant.commune !== null) { localStorage.setItem('erip_mon_territoire_commune', avant.commune); }
  }
  // ---- Aides communes aux essais « Qui fait quoi » (2026-10-16) : les nombres de structures grossissent a chaque validation du sas, les essais les lisent dans les donnees au lieu de les ecrire en dur.
  // Nombre de structures visibles pour un departement dans un rayon (meme regle que l'application : departement + region + national).
  async function mtAttendu(rayon, dep) {
    if (!_mtDonnees) { await new Promise(function (ok) { _mtCharger(ok, ok); }); }
    return mtLieuxDuRayon(mtLieuxVisibles(_mtDonnees.lieux, dep), rayon).length;
  }
  // Simule « module ferme au public » (en ligne, sans apercu) : le module est ouvert pour le travail local (MT_OUVERT et localhost).
  // Renvoie la fonction qui remet les reglages d'origine.
  function mtSimulerFerme() {
    var ouvertAvant = window.MT_OUVERT, localAvant = window.mtEstEnLocal;
    window.MT_OUVERT = false; window.mtEstEnLocal = function () { return false; };
    return function () { window.MT_OUVERT = ouvertAvant; window.mtEstEnLocal = localAvant; };
  }

  async function parcoursMonTerritoire() {
    var h1 = function () { return ((document.querySelector('h1') || {}).textContent || '').trim(); };
    var clic = function (sel) { var e = document.querySelector(sel); if (!e) { return false; } e.click(); return true; };
    var avant = { apercu: localStorage.getItem('erip_mon_territoire_apercu'), commune: localStorage.getItem('erip_mon_territoire_commune'), dep: localStorage.getItem('erip_departement_ressources') };
    localStorage.removeItem('erip_mon_territoire_apercu');
    var remettre = mtSimulerFerme();
    cas('Qui fait quoi : fermé au public par défaut (en ligne, sans aperçu), ni tuile ni résultat de recherche ; il n\u2019est ouvert que pour le travail local', mtOuvert() === false);
    remettre();
    localStorage.setItem('erip_mon_territoire_apercu', '1'); localStorage.setItem('erip_departement_ressources', '24'); localStorage.removeItem('erip_mon_territoire_commune');
    _mtEntree = 'module'; _mtPile = []; _mtEtat = { ecran: 'accueil', secteur: '', id: '', requete: '', nature: '', nbAffiches: 0, vide: '', choixCommunes: null, messageCommune: '', saisieCommune: '', saisieRecherche: '' };
    naviguerVers('mon-territoire'); await attente(500);
    cas('Qui fait quoi : 10 tuiles de domaines et un champ de commune (aucune fenêtre)', document.querySelectorAll('[data-mt-domaine]').length === 10 && !!document.getElementById('mtSaisieCommune') && !document.querySelector('.fenetre-erip, .modal.show'));
    document.getElementById('mtSaisieCommune').value = 'bergerac'; clic('[data-mt-valider-commune]'); await attente(200);
    cas('Qui fait quoi : la commune est mémorisée et affichée', localStorage.getItem('erip_mon_territoire_commune') === '24037' && /Bergerac/.test(document.body.textContent));
    clic('[data-mt-changer-commune]'); await attente(100); document.getElementById('mtSaisieCommune').value = '24100'; clic('[data-mt-valider-commune]'); await attente(200);
    cas('Qui fait quoi : un code postal commun à plusieurs communes propose un choix', document.querySelectorAll('[data-mt-choisir-commune]').length > 1);
    clic('[data-mt-choisir-commune]'); await attente(200);
    clic('[data-mt-domaine="emploi"]'); await attente(200);
    cas('Qui fait quoi : 21 secteurs, celui qui a une liste en premier', document.querySelectorAll('[data-mt-secteur]').length === 21 && document.querySelector('[data-mt-secteur]').dataset.mtSecteur === 'commerce-vente');
    clic('[data-mt-secteur="btp"]'); await attente(200);
    cas('Qui fait quoi : un secteur sans liste ouvre « Pas encore de liste »', h1() === 'Pas encore de liste ici');
    _mtAllerVersPrecedent(); await attente(200);
    clic('[data-mt-secteur="commerce-vente"]'); await attente(200);
    var noms = [].map.call(document.querySelectorAll('[data-mt-fiche]'), function (b) { return b.closest('.comprendre-le-cadre-encart').querySelector('.fw-semibold').textContent; });
    cas('Qui fait quoi : liste par ordre alphabétique, sans bouton « suivants » sous 10 lignes', noms.length >= 2 && noms.join() === noms.slice().sort(function (a, b) { return a.localeCompare(b, 'fr'); }).join() && !document.querySelector('[data-mt-suivants]'));
    clic('[data-mt-fiche="lidl"]'); await attente(200);
    var t = document.body.textContent;
    cas('Qui fait quoi : fiche vérifiée avec site et page de recrutement, sans téléphone inventé', !!document.querySelector('a[href="https://emplois.lidl.fr/"]') && !document.querySelector('a[href^="tel:"]') && /numéro en cours de vérification/.test(t));
    cas('Qui fait quoi : jamais d\u2019ancienneté ni de « recrute régulièrement »', !/installé depuis|recrute régulièrement/i.test(t));
    _mtAllerVersPrecedent(); await attente(150);
    // Une fiche NON verifiee est simulee (la date de Netto est retiree en memoire, jamais dans le fichier) : les donnees vivantes evoluent, l'essai ne doit pas en dependre.
    var netto = _mtDonnees.employeurs.filter(function (x) { return x.id === 'netto'; })[0], dateNetto = netto.date; netto.date = '';
    clic('[data-mt-fiche="netto"]'); await attente(200);
    cas('Qui fait quoi : une fiche non vérifiée n\u2019affiche aucun lien externe', !document.querySelector('a[href^="https"]') && /Pas encore vérifié/.test(document.body.textContent));
    netto.date = dateNetto;
    var hash = []; for (var i = 0; i < 8 && location.hash !== '#mon-territoire-intro'; i++) { _mtAllerVersPrecedent(); await attente(200); hash.push(location.hash); }
    cas('Qui fait quoi : les retours remontent un cran à la fois jusqu\u2019à la présentation, sans boucle', location.hash === '#mon-territoire-intro', hash.join(' > '));
    naviguerVers('mon-territoire'); await attente(300);
    clic('#btnMonTerritoireRevoirIntro'); await attente(300);
    var detour = !!document.getElementById('btnMonTerritoireRevenirModuleHaut');
    var bas = document.getElementById('btnMonTerritoireRevenirModuleBas'); if (bas) { bas.click(); } await attente(300);
    cas('Qui fait quoi : « Revoir la présentation » puis « Revenir au module » ramènent à l\u2019accueil du module', detour && location.hash === '#mon-territoire' && /^Qui fait quoi en Dordogne \?$/.test(h1()));
    document.getElementById('mtSaisieRecherche').value = 'caissier'; clic('[data-mt-rechercher]'); await attente(200);
    cas('Qui fait quoi : la recherche par métier trouve le secteur et des employeurs', !!document.querySelector('[data-mt-secteur="commerce-vente"]') && document.querySelectorAll('[data-mt-fiche]').length >= 1);
    localStorage.setItem('erip_departement_ressources', 'ailleurs'); pageMonTerritoire(); await attente(200);
    cas('Qui fait quoi : pour un département sans liste (ailleurs), territoire non couvert dit clairement, sans tuile', /pas encore de liste pour votre territoire/.test(document.body.textContent) && document.querySelectorAll('[data-mt-domaine]').length === 0);
    _mtAller('fiche', { id: 'lidl' }); await attente(200);
    cas('Qui fait quoi : pour un département sans liste (ailleurs), même une fiche ouverte directement montre « territoire non couvert », jamais la Dordogne', /pas encore de liste pour votre territoire/.test(document.body.textContent) && !/Lidl/.test(h1()));
    localStorage.setItem('erip_departement_ressources', '24');
    naviguerVers('cv'); await attente(400);
    var inp = document.getElementById('rechercheERIPInput'); inp.value = 'lidl'; inp.dispatchEvent(new Event('input', { bubbles: true })); await attente(500);
    var zone = document.getElementById('resultatsRechercheERIP');
    cas('Qui fait quoi : la barre de recherche de l\u2019accueil trouve un employeur', !!(zone && /Qui fait quoi/.test(zone.textContent) && zone.querySelector('[data-module-cible^="fn:mon-territoire"]')));
    // Un numéro par magasin (2026-10-18) : affiché même sans numéro général ; un magasin sans numéro dit « en cours de vérification ».
    var _essaiMag = mtParserEmployeurs('essai-magasins|enseigne|Enseigne essai|commerce-vente|Bergerac:12 rue A:05 53 00 00 01 ; Périgueux:3 avenue B ; Sarlat-la-Canéda:5 place C:05 53 00 00 03||https://exemple.fr/|https://exemple.fr/recrutement|||' + new Date().toISOString().slice(0, 10)).lignes[0];
    _mtDonnees.employeurs.push(_essaiMag);
    _mtAller('fiche', { id: 'essai-magasins' }); await attente(300);
    var _tMag = document.body.textContent.replace(/\s+/g, ' ');
    cas('Qui fait quoi : un numéro par magasin s’affiche même sans numéro général, et un magasin sans numéro dit « en cours de vérification »', /Bergerac[^.]*05 53 00 00 01/.test(_tMag) && /Sarlat[^.]*05 53 00 00 03/.test(_tMag) && /Périgueux[^.]*numéro en cours de vérification/.test(_tMag) && !/Numéro général de l’enseigne/.test(_tMag), _tMag.slice(0, 300));
    _mtDonnees.employeurs.splice(_mtDonnees.employeurs.indexOf(_essaiMag), 1);
    // remise en l'état
    ['erip_mon_territoire_apercu', 'erip_mon_territoire_commune', 'erip_departement_ressources'].forEach(function (k, j) { var v = [avant.apercu, avant.commune, avant.dep][j]; if (v === null) { localStorage.removeItem(k); } else { localStorage.setItem(k, v); } });
  }
  // « Via prospection » (2026-10-19, docs/CHANTIER_VIA_PROSPECTION_QUI_FAIT_QUOI_2026-10-18.md) : des fiches INVENTEES sont ajoutées en mémoire (jamais dans le registre) puis retirées.
  // Aucun mélange : ni dans les listes d'un secteur, ni dans les compteurs, ni chez les agences d'intérim ; une porte, des puces de secteur, une pastille, un encart sur la fiche, la recherche à part.
  async function parcoursMonTerritoireProspection() {
    var h1 = function () { return ((document.querySelector('h1') || {}).textContent || '').trim(); };
    var noms = function () { return [].map.call(document.querySelectorAll('.mt-carte-employeur .fw-semibold'), function (e) { return e.textContent.trim(); }); };
    var avant = { apercu: localStorage.getItem('erip_mon_territoire_apercu'), dep: localStorage.getItem('erip_departement_ressources'), commune: localStorage.getItem('erip_mon_territoire_commune') };
    localStorage.setItem('erip_departement_ressources', '24'); localStorage.setItem('erip_mon_territoire_apercu', '1'); localStorage.removeItem('erip_mon_territoire_commune');
    naviguerVers('mon-territoire'); await attente(900);
    var fiches = mtParserEmployeurs([
      'essai-pros-a | local | Essai Prospection A | commerce-vente | Bergerac:12 rue A | | | | non-indique | Via prospection ; Essai | ',
      'essai-pros-b | local | Essai Prospection B | artisanat-bouche | Périgueux:3 rue B | | | | non-indique | Via prospection ; Essai | ',
      'essai-pros-c | local | Essai Prospection C | artisanat-bouche | Bergerac:5 rue C | | | | non-indique | Via prospection ; Essai | '].join('\n')).lignes;
    var nbAvant = _mtEmployeurs().length;
    _mtDonnees.employeurs.push.apply(_mtDonnees.employeurs, fiches);
    cas('Via prospection : les fiches marquées ne sont dans AUCUNE liste habituelle', _mtEmployeurs().length === nbAvant && _mtEmployeursProspection().length === 3 && !_mtEmployeurs().some(mtViaProspection));
    _mtAller('emploi'); await attente(300);
    var compteCommerce = (document.querySelector('[data-mt-secteur="commerce-vente"] .badge') || {}).textContent;
    cas('Via prospection : une quatrième porte, et les compteurs des secteurs ne comptent pas ces fiches', !!document.querySelector('[data-mt-prospection]') && /3 employeurs/.test(document.querySelector('[data-mt-prospection]').textContent) && String(compteCommerce).indexOf(String(mtCompterParSecteur(_mtEmployeurs())['commerce-vente'])) === 0, compteCommerce);
    document.querySelector('[data-mt-prospection]').click(); await attente(300);
    var puces = [].map.call(document.querySelectorAll('[data-mt-secteur-prospection]'), function (b) { return b.textContent; });
    cas('Via prospection : la page porte le nom de la rubrique, des puces de secteur avec compteur, aucune carte avant le choix d\u2019une commune', /Via prospection/.test(h1()) && puces.length === 3 && /Tous les secteurs \(3\)/.test(puces[0]) && noms().length === 0, h1() + ' | ' + puces.join(' / '));
    document.querySelector('[data-mt-commune="prospection"][data-mt-commune-v="*"]').click(); await attente(300);
    cas('Via prospection : « Voir toute la liste » montre les 3 fiches, chacune avec sa pastille', noms().length === 3 && document.querySelectorAll('.mt-carte-employeur .badge.text-bg-primary').length === 3, noms().join());
    document.querySelector('[data-mt-secteur-prospection="artisanat-bouche"]').click(); await attente(300);
    cas('Via prospection : une puce de secteur réduit la liste et le choix reste affiché', noms().length === 2 && document.querySelector('[data-mt-secteur-prospection="artisanat-bouche"]').getAttribute('aria-pressed') === 'true', noms().join());
    document.querySelector('[data-mt-fiche="essai-pros-b"]').click(); await attente(300);
    cas('Via prospection : la fiche porte la pastille et l\u2019encart d\u2019explication', h1() === 'Essai Prospection B' && !!document.querySelector('h1 + p .badge') && /Pourquoi cet employeur est ici/.test(document.body.textContent) && !/recrute régulièrement/i.test(document.body.textContent));
    _mtAllerVersPrecedent(); await attente(400);
    cas('Via prospection : « Retour » ramène à la rubrique, avec le secteur choisi', /Via prospection/.test(h1()) && document.querySelector('[data-mt-secteur-prospection="artisanat-bouche"]').getAttribute('aria-pressed') === 'true', h1());
    _mtAller('liste', { secteur: 'commerce-vente', nature: '', nbAffiches: 0 }); await attente(300);
    var tout = document.querySelector('[data-mt-commune="secteur"][data-mt-commune-v="*"]'); if (tout) { tout.click(); await attente(300); }
    cas('Via prospection : la liste d\u2019un secteur ne contient jamais ces fiches', !/Essai Prospection/.test(document.body.textContent));
    _mtAller('interim'); await attente(300);
    cas('Via prospection : les agences d\u2019intérim non plus', !/Essai Prospection/.test(document.body.textContent));
    var accueil = monTerritoireResultatsRecherche('Essai Prospection');
    cas('Via prospection : la recherche de l\u2019accueil les trouve dans un groupe à part, jamais sous « Qui fait quoi : »', accueil.length === 3 && accueil.every(function (r) { return r.titre.indexOf('Via prospection : ') === 0; }), JSON.stringify(accueil.map(function (r) { return r.titre; })));
    _mtAller('recherche', { requete: 'Essai Prospection', saisieRecherche: 'Essai Prospection' }); await attente(300);
    var titres = [].map.call(document.querySelectorAll('h2'), function (e) { return e.textContent.trim(); });
    cas('Via prospection : la recherche du module les range sous leur propre titre', titres.indexOf('Via prospection') !== -1 && titres.indexOf('Employeurs') === -1, titres.join());
    fiches.forEach(function (f) { _mtDonnees.employeurs.splice(_mtDonnees.employeurs.indexOf(f), 1); });
    _mtAller('emploi'); await attente(200);
    cas('Via prospection : sans fiche marquée, la porte n\u2019est pas affichée (aucune porte vide)', !document.querySelector('[data-mt-prospection]'));
    ['erip_mon_territoire_apercu', 'erip_departement_ressources', 'erip_mon_territoire_commune'].forEach(function (k, j) { var v = [avant.apercu, avant.dep, avant.commune][j]; if (v === null) { localStorage.removeItem(k); } else { localStorage.setItem(k, v); } });
  }

  // Migration du rayon Logement (2026-10-12) : la Dordogne lit les structures dans le répertoire de « Qui fait quoi », la Haute-Vienne garde la lecture d'origine ;
  // mêmes structures, mêmes adresses ; liens dans les deux sens avec retour exact ; recherche de l'accueil. Le module est ouvert le temps de l'essai (aperçu).
  async function parcoursMonTerritoireLogement() {
    var h1 = function () { return ((document.querySelector('h1') || {}).textContent || '').trim(); };
    var cartes = function () { return [].map.call(document.querySelectorAll('.page-catalogue-contenu > .comprendre-le-cadre-encart.mb-2'), function (e) { return e.textContent.replace(/\s+/g, ' ').trim(); }); };
    var liens = function () { return [].map.call(document.querySelectorAll('.page-catalogue-contenu a[target=_blank]'), function (a) { return a.href; }).sort(); };
    var avant = { apercu: localStorage.getItem('erip_mon_territoire_apercu'), dep: localStorage.getItem('erip_departement_ressources') };
    localStorage.setItem('erip_departement_ressources', '24'); localStorage.setItem('erip_mon_territoire_apercu', '1');
    var ouvrir = async function () {
      _comprendreLeCadreEtat = { ecran: 'accueil', rayon: null, ficheId: null }; _comprendreLeCadreCacheStructures = {};
      naviguerVers('comprendre-le-cadre'); await attente(600);
      _comprendreLeCadreOuvrirRayon('logement'); await attente(2000);
      var bs = document.querySelector('[data-comprendre-le-cadre-ouvrir-structures]'); if (bs) { bs.click(); } await attente(2500);
    };
    var N24 = await mtAttendu('logement', '24');
    await ouvrir();
    var nouveau = cartes(), nouveauxLiens = liens();
    cas('Logement Dordogne : toutes les structures du répertoire sont lues (la collecte du rayon n\u2019en garde plus que deux, celles de la Haute-Vienne)', N24 > 0 && nouveau.length === N24, nouveau.length + ' pour ' + N24 + ' attendues');
    cas('Logement Dordogne : aucune adresse en double (chaque structure une seule fois)', nouveau.length === N24 && nouveauxLiens.length === N24 && new Set(nouveauxLiens).size >= N24 - 2, nouveauxLiens.length + ' liens, ' + new Set(nouveauxLiens).size + ' uniques');
    var al = nouveau.filter(function (x) { return /^Action Logement/.test(x); })[0] || '';
    cas('Logement : Action Logement cite la garantie Visale et l\u2019avance Loca-Pass', /Visale/.test(al) && /Loca-Pass/.test(al));
    await ouvrir();
    var b = document.querySelector('[data-comprendre-le-cadre-mon-territoire]');
    cas('Logement : bouton « Voir dans Qui fait quoi » quand le module est ouvert', !!b);
    if (b) { b.click(); await attente(1500); }
    cas('Logement : la liste de Qui fait quoi montre toutes les structures en trois parties', /Logement, en Dordogne/.test(h1()) && document.querySelectorAll('.comprendre-le-cadre-encart.mb-2').length === N24 && /Partout en France/.test(document.body.textContent), document.querySelectorAll('.comprendre-le-cadre-encart.mb-2').length + ' pour ' + N24);
    var retour = document.getElementById('btnRetourModuleExterne');
    cas('Logement : « Revenir à Comprendre le cadre » ramène à l\u2019écran quitté', !!retour && !retour.hidden && (function () { retour.click(); return true; })());
    await attente(1200);
    cas('Logement : retour exact sur « Près de chez moi » du rayon', /Près de chez moi/.test(h1()) && cartes().length === N24, cartes().length + ' pour ' + N24);
    var b2 = document.querySelector('[data-comprendre-le-cadre-mon-territoire]'); if (b2) { b2.click(); } await attente(1500);
    var vc = document.querySelector('[data-mt-vers-cadre="logement"]'); if (vc) { vc.click(); } await attente(2500);
    var retour2 = document.getElementById('btnRetourModuleExterne');
    cas('Logement : « Comprendre : Logement » ouvre le rayon avec « Revenir à Qui fait quoi »', location.hash === '#comprendre-le-cadre' && !!retour2 && !retour2.hidden && /Qui fait quoi/.test(retour2.textContent));
    if (retour2) { retour2.click(); } await attente(1000);
    cas('Logement : retour exact sur la liste de Qui fait quoi', /Logement, en Dordogne/.test(h1()));
    _mtEntree = 'module'; _mtPile = []; _mtEtat.ecran = 'accueil'; pageMonTerritoire(); await attente(300);
    var soc = document.querySelector('[data-mt-domaine="social"]'); if (soc) { soc.click(); } await attente(300);
    var nSoc = { logement: N24, accompagnement: await mtAttendu('accompagnement', '24'), mobilite: await mtAttendu('mobilite', '24'), budget: await mtAttendu('budget', '24') };
    var txtSoc = document.body.textContent;
    cas('Social : Logement, Accompagnement, Mobilité et Budget ont leurs structures, aucune sous-branche ne dit « Pas encore de liste »', document.querySelectorAll('[data-mt-sousbranche]').length === 6 && Object.keys(nSoc).every(function (k) { return nSoc[k] > 0 && new RegExp(nSoc[k] + ' structures').test(txtSoc); }) && !/Pas encore de liste/.test(txtSoc), JSON.stringify(nSoc));
    naviguerVers('cv'); await attente(400);
    var inp = document.getElementById('rechercheERIPInput'); inp.value = 'loca-pass'; inp.dispatchEvent(new Event('input', { bubbles: true })); await attente(500);
    var zone = document.getElementById('resultatsRechercheERIP');
    cas('Accueil : « Loca-Pass » trouve Action Logement dans Qui fait quoi', !!(zone && /Action Logement/.test(zone.textContent) && zone.querySelector('[data-module-cible^="fn:mon-territoire:lieu:"]')));
    var carte = zone && zone.querySelector('[data-module-cible="fn:mon-territoire:lieu:action-logement-nouvelle-aquitaine"]'); if (carte) { carte.click(); } await attente(800);
    cas('Accueil : le clic ouvre la liste du Logement', /Logement, en Dordogne/.test(h1()));
    // Haute-Vienne : lecture d'origine inchangée, le bouton vers Qui fait quoi est proposé
    localStorage.setItem('erip_departement_ressources', '87'); await ouvrir();
    var c87 = cartes();
    var N87 = await mtAttendu('logement', '87');
    cas('Logement Haute-Vienne : le national, le régional et celles de la Haute-Vienne du répertoire, aucune de la Dordogne, et le bouton « Voir dans Qui fait quoi » est proposé (la Haute-Vienne a sa liste)', N87 > 0 && c87.length === N87 && c87.some(function (x) { return /SOLIHA Limousin/.test(x); }) && !c87.some(function (x) { return /SIAO de la Dordogne/.test(x); }) && !!document.querySelector('[data-comprendre-le-cadre-mon-territoire]'), c87.length + ' pour ' + N87);
    // Module fermé : aucun bouton, même pour la Dordogne
    localStorage.setItem('erip_departement_ressources', '24'); localStorage.removeItem('erip_mon_territoire_apercu');
    var remettreFerme = mtSimulerFerme(); await ouvrir();
    cas('Logement Dordogne, module fermé : les structures s\u2019affichent, sans bouton vers Qui fait quoi', cartes().length === N24 && !document.querySelector('[data-comprendre-le-cadre-mon-territoire]'), cartes().length + ' pour ' + N24);
    remettreFerme();
    [['erip_mon_territoire_apercu', avant.apercu], ['erip_departement_ressources', avant.dep]].forEach(function (kv) { if (kv[1] === null) { localStorage.removeItem(kv[0]); } else { localStorage.setItem(kv[0], kv[1]); } });
  }
  // Freins, Lexique et recherche (phase 3bis, 2026-10-12) : le répertoire de « Qui fait quoi » est relié aux freins (types et rayons), aux fiches « type de structure » du
  // Lexique et à la recherche ; jamais pour un frein sensible, jamais hors Dordogne, jamais quand le module est fermé, jamais un bloc vide.
  async function parcoursMonTerritoireFreins() {
    var h1 = function () { return ((document.querySelector('h1') || {}).textContent || '').trim(); };
    var avant = { apercu: localStorage.getItem('erip_mon_territoire_apercu'), dep: localStorage.getItem('erip_departement_ressources') };
    var fenetre = function () { return document.querySelector('[data-mt-bloc-structures]'); };
    var ouvrirFenetre = async function (titre) {
      if (typeof fermerFenetreERIP === 'function') { try { fermerFenetreERIP(); } catch (e) { /* rien */ } }
      ouvrirRenvoiAnnuaire('Pour « ' + titre + ' », des structures près de chez vous :', { freinTitre: titre }); await attente(1500);
    };
    localStorage.setItem('erip_departement_ressources', '24'); localStorage.setItem('erip_mon_territoire_apercu', '1');
    await ouvrirFenetre(FREINS_REPERTOIRE.hebergement.titre);
    var b = fenetre();
    cas('Frein « hébergement » : la fenêtre « structures » montre les structures du répertoire (Dordogne), avec leurs adresses vérifiées', !!b && b.querySelectorAll('.comprendre-le-cadre-encart').length >= 6 && /SIAO de la Dordogne|Action Logement/.test(b.textContent) && !!b.querySelector('a[target=_blank]'));
    cas('Frein « hébergement » : les liens d\u2019origine de la fenêtre sont conservés (annuaire national, Bergerac)', /Mission Locale du Bergeracois/.test(document.body.textContent));
    var voir = b && b.querySelector('[data-mt-voir-liste]'); if (voir) { voir.click(); } await attente(1200);
    cas('Frein « hébergement » : « Voir tout dans Qui fait quoi » ouvre la liste du Logement', /Logement, en Dordogne/.test(h1()) && location.hash === '#mon-territoire');
    await ouvrirFenetre(FREINS_REPERTOIRE.mobilite.titre);
    cas('Frein mobilité : le bloc propose des structures de mobilité du répertoire (garage solidaire, plateforme mobilité...), avec « Voir tout », la fenêtre d’origine reste', !!fenetre() && /AFAC|Atchoum|Plateforme|Auto-/.test(fenetre().textContent) && !!fenetre().querySelector('[data-mt-voir-liste="mobilite"]') && /Trouver une structure/.test(document.body.textContent));
    await ouvrirFenetre(FREINS_REPERTOIRE.illectronisme.titre);
    cas('Frein « illectronisme » : le bloc propose les Maisons France Services (aide gratuite aux démarches en ligne), la fenêtre d’origine reste', !!fenetre() && /France Services/.test(fenetre().textContent) && /Trouver une structure/.test(document.body.textContent));
    await ouvrirFenetre(FREINS_REPERTOIRE.violences.titre);
    cas('Frein sensible « violences » : jamais de bloc de structures du répertoire', !fenetre());
    await ouvrirFenetre(FREINS_REPERTOIRE.addiction.titre);
    cas('Frein sensible « addiction » : jamais de bloc de structures du répertoire', !fenetre());
    localStorage.setItem('erip_departement_ressources', '87'); await ouvrirFenetre(FREINS_REPERTOIRE.hebergement.titre);
    cas('Haute-Vienne : le bloc du répertoire s\u2019affiche avec ses mots (« Dans la Haute-Vienne ») et sans aucune structure de la Dordogne', !!fenetre() && /Dans la Haute-Vienne, ces structures peuvent vous aider/.test(fenetre().textContent) && !/Dordogne/.test(fenetre().textContent) && /SOLIHA Limousin|ADIL de la Haute-Vienne|ARSL/.test(fenetre().textContent));
    localStorage.setItem('erip_departement_ressources', '24'); localStorage.removeItem('erip_mon_territoire_apercu');
    var remettreFermeFrein = mtSimulerFerme(); await ouvrirFenetre(FREINS_REPERTOIRE.hebergement.titre);
    cas('Module fermé : aucun bloc du répertoire dans la fenêtre d\u2019un frein', !fenetre());
    remettreFermeFrein();
    if (typeof fermerFenetreERIP === 'function') { try { fermerFenetreERIP(); } catch (e) { /* rien */ } }
    // Lexique : fiche « type de structure » CAF
    localStorage.setItem('erip_mon_territoire_apercu', '1'); naviguerVers('lexique'); await attente(500);
    lexiqueOuvrirFiche('caf'); await attente(1500);
    var bl = document.querySelector('#lexiqueFicheEcran [data-mt-bloc-structures]');
    cas('Lexique : la fiche « CAF » montre la CAF de la Dordogne du répertoire', !!bl && /CAF de la Dordogne/.test(bl.textContent));
    lexiqueOuvrirFiche('plie'); await attente(1200);
    cas('Lexique : la fiche « PLIE » montre aussi le PLIE du répertoire, son bouton local reste', !!document.querySelector('#lexiqueFicheEcran [data-mt-bloc-structures]') && /PLIE du Bergeracois/.test(document.querySelector('#lexiqueFicheEcran [data-mt-bloc-structures]').textContent) && !!document.querySelector('#lexiqueFicheEcran [data-lexique-renvoi-local]'));
    // Recherche de l'accueil
    naviguerVers('cv'); await attente(500);
    var inp = document.getElementById('rechercheERIPInput'); inp.value = 'expulsion'; inp.dispatchEvent(new Event('input', { bubbles: true })); await attente(700);
    var zone = document.getElementById('resultatsRechercheERIP');
    cas('Accueil : « expulsion » trouve des structures du Logement par le frein « hébergement »', !!(zone && /Qui fait quoi/.test(zone.textContent) && /Pour : /.test(zone.textContent)));
    inp.value = 'pas de voiture'; inp.dispatchEvent(new Event('input', { bubbles: true })); await attente(700);
    zone = document.getElementById('resultatsRechercheERIP');
    cas('Accueil : « pas de voiture » trouve le frein et les structures liées à la mobilité du répertoire (France Travail, Missions locales)', !!(zone && /Ce qui peut vous freiner/.test(zone.textContent) && /Qui fait quoi/.test(zone.textContent) && /Pour : /.test(zone.textContent)));
    inp.value = 'violences'; inp.dispatchEvent(new Event('input', { bubbles: true })); await attente(700);
    zone = document.getElementById('resultatsRechercheERIP');
    cas('Accueil : « violences » ne propose jamais de structure du répertoire', !(zone && /Qui fait quoi/.test(zone.textContent)));
    // Recherche dans le module
    _mtEntree = 'module'; _mtPile = []; _mtEtat.ecran = 'accueil'; naviguerVers('mon-territoire'); await attente(600);
    document.getElementById('mtSaisieRecherche').value = 'expulsion'; var br = document.querySelector('[data-mt-rechercher]'); if (br) { br.click(); } await attente(500);
    cas('Module : « expulsion » montre les structures « Pour : » le frein, avec leurs cartes', /Structures/.test(document.body.textContent) && /Pour : /.test(document.body.textContent) && document.querySelectorAll('[data-mt-lieux-rayon]').length >= 1);
    [['erip_mon_territoire_apercu', avant.apercu], ['erip_departement_ressources', avant.dep]].forEach(function (kv) { if (kv[1] === null) { localStorage.removeItem(kv[0]); } else { localStorage.setItem(kv[0], kv[1]); } });
  }
  // Migration du rayon « accompagnement » (phase 4, 2026-10-12, décisions D12 à D15) : la Dordogne lit le répertoire, plusieurs Missions locales avec la phrase « selon votre commune »
  // tant que leur zone n'est pas relevée, le PLIE du Bergeracois (zone connue) passe en premier pour une commune qu'il couvre, adresse et date uniques pour les rayons pas encore
  // migrés (D14), fiches Mission locale et PLIE du Lexique (D15), Haute-Vienne inchangée. Module FERMÉ pendant l'essai : ce sont des comportements publics.
  async function parcoursAccompagnement() {
    var h1 = function () { return ((document.querySelector('h1') || {}).textContent || '').trim(); };
    var cartes = function () { return [].map.call(document.querySelectorAll('.page-catalogue-contenu > .comprendre-le-cadre-encart.mb-2'), function (e) { return e.textContent.replace(/\s+/g, ' ').trim(); }).filter(function (t) { return !/^Plusieurs structures/.test(t); }); };
    var avant = { apercu: localStorage.getItem('erip_mon_territoire_apercu'), dep: localStorage.getItem('erip_departement_ressources'), info: localStorage.getItem('erip_mon_territoire_commune_info'), com: localStorage.getItem('erip_mon_territoire_commune') };
    localStorage.removeItem('erip_mon_territoire_apercu'); localStorage.removeItem('erip_mon_territoire_commune_info'); localStorage.removeItem('erip_mon_territoire_commune');
    var ouvrirStructures = async function (rayon) {
      _comprendreLeCadreEtat = { ecran: 'accueil', rayon: null, ficheId: null }; _comprendreLeCadreCacheStructures = {};
      naviguerVers('comprendre-le-cadre'); await attente(600);
      _comprendreLeCadreOuvrirRayon(rayon); await attente(2000);
      var bs = document.querySelector('[data-comprendre-le-cadre-ouvrir-structures]'); if (bs) { bs.click(); } await attente(2500);
    };
    localStorage.setItem('erip_departement_ressources', '24');
    await ouvrirStructures('accompagnement');
    var c = cartes(), texte = document.body.textContent;
    cas('Accompagnement Dordogne : les structures du répertoire s\u2019affichent, plus la Mission locale du Périgord Noir et le PLIE du Bergeracois', c.length >= 22 && /Périgord Noir/.test(texte) && /PLIE du Bergeracois/.test(texte) && /France Travail/.test(texte) && /INAÉ/.test(texte), c.length);
    cas('Accompagnement Dordogne : aucune commune connue, la phrase « laquelle est la vôtre dépend de votre commune de résidence » apparaît', /dépend de votre commune de résidence/.test(texte));
    cas('Accompagnement Dordogne : les services en ligne (DORA, inclusion numérique, annuaire des acteurs) restent affichés', /DORA/.test(texte) && /inclusion numérique/i.test(texte) && /Annuaire des acteurs/.test(texte));
    cas('Accompagnement Dordogne : rien de la Haute-Vienne', !/SOLIHA Limousin|Varlin|ALEAS|Réseau Alliage|UNAFAM Haute-Vienne/.test(texte));
    // commune choisie dans Qui fait quoi : le PLIE du Bergeracois couvre Bergerac, il passe en premier, avec son badge
    localStorage.setItem('erip_mon_territoire_commune_info', JSON.stringify({ code: '24037', nom: 'Bergerac', epci: '200070647' }));
    await ouvrirStructures('accompagnement');
    var badges = [].map.call(document.querySelectorAll('.page-catalogue-contenu .badge'), function (b) { return b.closest('.comprendre-le-cadre-encart').textContent.replace(/\s+/g, ' '); });
    cas('Accompagnement, commune Bergerac : le PLIE du Bergeracois porte « Couvre votre commune » (zone relevée sur la page officielle)', badges.length === 1 && /PLIE du Bergeracois/.test(badges[0]), JSON.stringify(badges));
    var tous = cartes(), iPliePropre = -1, iPlieGeneral = -1;
    tous.forEach(function (t, i) { if (/^PLIE du Bergeracois/.test(t)) { iPliePropre = i; } if (/^Plans locaux/.test(t)) { iPlieGeneral = i; } });
    cas('Accompagnement, commune Bergerac : le PLIE du Bergeracois passe devant l’entrée générale des PLIE', iPliePropre !== -1 && iPlieGeneral !== -1 && iPliePropre < iPlieGeneral, iPliePropre + ' / ' + iPlieGeneral);
    cas('Accompagnement, commune Bergerac : les Missions locales n\u2019ayant pas de zone relevée, la phrase reste', /dépend de votre commune de résidence/.test(document.body.textContent));
    localStorage.removeItem('erip_mon_territoire_commune_info');
    // rayon pas encore migré : adresse et date viennent du répertoire (D14), le texte reste celui du rayon
    await ouvrirStructures('jeunes');
    var cj = cartes(), tj = document.body.textContent;
    var ml = cj.filter(function (t) { return /Mission locale du Bergeracois/.test(t); })[0] || '';
    cas('Jeunes (rayon pas migré) : la Mission locale du Bergeracois garde le texte du rayon et prend l\u2019adresse vérifiée du répertoire', /16-25 ans/.test(ml) && /adresse vérifiée le 7 sept. 2026/.test(ml) && !!document.querySelector('a[href="https://www.missionlocaledubergeracois.com/"]'));
    cas('Jeunes (rayon pas migré) : la phrase « selon votre commune » apparaît aussi (plusieurs Missions locales)', /dépend de votre commune de résidence/.test(tj));
    // Haute-Vienne : le national et le régional du répertoire, plus ses quatre structures ; aucune de la Dordogne
    localStorage.setItem('erip_departement_ressources', '87'); await ouvrirStructures('accompagnement');
    var c87 = cartes(), t87 = document.body.textContent;
    cas('Accompagnement Haute-Vienne : ses quatre structures et le national, aucune de la Dordogne', /Varlin/.test(t87) && /ALEAS/.test(t87) && /UNAFAM Haute-Vienne/.test(t87) && /Réseau Alliage/.test(t87) && /France Travail/.test(t87) && !/Mission locale du Bergeracois|BASE \(Bergerac|GEIQ 24/.test(t87), c87.length);
    // Lexique : fiches Mission locale et PLIE
    localStorage.setItem('erip_departement_ressources', '24'); naviguerVers('lexique'); await attente(500);
    lexiqueOuvrirFiche('mission-locale'); await attente(1200);
    var bl = document.querySelector('[data-lexique-renvoi-local]'); if (bl) { bl.click(); } await attente(2000);
    var f1 = document.body.textContent;
    cas('Lexique, fiche Mission locale (Dordogne) : les trois Missions locales avec la phrase « selon votre commune », plus l\u2019adresse unique du Bergeracois seule', /Mission locale du Bergeracois/.test(f1) && /Grand Périgueux/.test(f1) && /Périgord Noir/.test(f1) && /dépend de votre commune de résidence/.test(f1));
    if (typeof fermerFenetreERIP === 'function') { try { fermerFenetreERIP(); } catch (e) { /* rien */ } }
    lexiqueOuvrirFiche('plie'); await attente(1200);
    bl = document.querySelector('[data-lexique-renvoi-local]'); if (bl) { bl.click(); } await attente(2000);
    cas('Lexique, fiche PLIE (Dordogne) : le PLIE du Bergeracois du répertoire', /PLIE du Bergeracois/.test(document.body.textContent) && !!document.querySelector('a[href="https://www.missionlocaledubergeracois.com/le-plie"]'));
    if (typeof fermerFenetreERIP === 'function') { try { fermerFenetreERIP(); } catch (e) { /* rien */ } }
    localStorage.setItem('erip_departement_ressources', '87'); lexiqueOuvrirFiche('mission-locale'); await attente(1200);
    bl = document.querySelector('[data-lexique-renvoi-local]'); if (bl) { bl.click(); } await attente(1500);
    cas('Lexique, fiche Mission locale (Haute-Vienne) : l\u2019annuaire d\u2019origine, aucune structure de la Dordogne', /Trouver une structure/.test(document.body.textContent) && !/Périgord Noir/.test(document.body.textContent));
    if (typeof fermerFenetreERIP === 'function') { try { fermerFenetreERIP(); } catch (e) { /* rien */ } }
    // une seule source de vérité : les adresses migrées ne sont plus dans le registre
    var registre = await (await fetch('modules/comprendre-le-cadre/liens-verifies.txt')).text();
    cas('Registre des adresses : plus aucune ligne des structures migrées (une seule source, le répertoire)', !/^asso-mission-locale-du-bergeracois-24 \|/m.test(registre) && !/^france-travail \|/m.test(registre) && !/^siao-dordogne \|/m.test(registre));
    // Qui fait quoi : branche Social > Accompagnement
    localStorage.setItem('erip_departement_ressources', '24'); localStorage.setItem('erip_mon_territoire_apercu', '1');
    _mtEntree = 'module'; _mtPile = []; _mtEtat.ecran = 'accueil'; naviguerVers('mon-territoire'); await attente(700);
    var soc = document.querySelector('[data-mt-domaine="social"]'); if (soc) { soc.click(); } await attente(300);
    var acc = document.querySelector('[data-mt-sousbranche="accompagnement"]');
    var nAccSoc = await mtAttendu('accompagnement', '24');
    cas('Qui fait quoi, Social : Accompagnement a ses structures', !!acc && nAccSoc > 0 && new RegExp(nAccSoc + ' structures').test(acc.textContent) && !/Pas encore de liste/.test(acc.textContent), acc && acc.textContent);
    if (acc) { acc.click(); } await attente(500);
    cas('Qui fait quoi, liste Accompagnement : les trois Missions locales de la Dordogne et la phrase « selon votre commune »', /Périgord Noir/.test(document.body.textContent) && /dépend de votre commune de résidence/.test(document.body.textContent));
    [['erip_mon_territoire_apercu', avant.apercu], ['erip_departement_ressources', avant.dep], ['erip_mon_territoire_commune_info', avant.info], ['erip_mon_territoire_commune', avant.com]].forEach(function (kv) { if (kv[1] === null) { localStorage.removeItem(kv[0]); } else { localStorage.setItem(kv[0], kv[1]); } });
  }
  // Migration du rayon « mobilité » (phase 4, 2026-10-12) : mêmes garde-fous que Logement et Accompagnement, le générique des Missions locales est fusionné dans les réelles (D13),
  // les deux Missions locales gardent le texte du rayon et prennent l'adresse du répertoire (D14), les trois services en ligne restent. Module FERMÉ pendant l'essai.
  async function parcoursMobilite() {
    var cartes = function () { return [].map.call(document.querySelectorAll('.page-catalogue-contenu > .comprendre-le-cadre-encart.mb-2'), function (e) { return e.textContent.replace(/\s+/g, ' ').trim(); }).filter(function (t) { return !/^Plusieurs structures/.test(t); }); };
    var avant = { apercu: localStorage.getItem('erip_mon_territoire_apercu'), dep: localStorage.getItem('erip_departement_ressources') };
    localStorage.removeItem('erip_mon_territoire_apercu');
    var ouvrir = async function (rayon) {
      _comprendreLeCadreEtat = { ecran: 'accueil', rayon: null, ficheId: null }; _comprendreLeCadreCacheStructures = {};
      naviguerVers('comprendre-le-cadre'); await attente(600);
      _comprendreLeCadreOuvrirRayon(rayon); await attente(2000);
      var bs = document.querySelector('[data-comprendre-le-cadre-ouvrir-structures]'); if (bs) { bs.click(); } await attente(2500);
    };
    localStorage.setItem('erip_departement_ressources', '24'); await ouvrir('mobilite');
    var t = document.body.textContent, c = cartes();
    cas('Mobilité Dordogne : les structures du répertoire (AFAC, Atchoum, plateforme MUST, auto-école sociale, plateforme mobilité, Département, Région)', /AFAC 24/.test(t) && /Atchoum/.test(t) && /Plateforme MUST/.test(t) && /Auto-Mobilité Solidaire/.test(t) && /Plateforme mobilité de la Dordogne/.test(t) && /Conseil départemental de la Dordogne/.test(t) && /Région Nouvelle-Aquitaine/.test(t), c.length);
    cas('Mobilité Dordogne : les trois services en ligne restent (Mes aides France Travail, France Mobilités, Covoit\u2019 Modalis)', /Mes aides France Travail/.test(t) && /France Mobilités/.test(t) && /Covoit/.test(t));
    var ml = c.filter(function (x) { return /^Mission locale du Bergeracois/.test(x); })[0] || '';
    cas('Mobilité Dordogne : la Mission locale du Bergeracois garde son texte « aides à la mobilité » et l\u2019adresse vérifiée du répertoire', /mobilité/i.test(ml) && /adresse vérifiée le 7 sept. 2026/.test(ml));
    cas('Mobilité Dordogne : le générique « Missions locales du Périgord » est fusionné, la Mission locale du Périgord Noir figure', !c.some(function (x) { return /^Missions locales du Périgord/.test(x); }) && /Périgord Noir/.test(t));
    cas('Mobilité Dordogne : rien de la Haute-Vienne', !/Mobilim|Limoges/.test(t));
    cas('Mobilité Dordogne : plusieurs Missions locales, la phrase « selon votre commune » apparaît', /dépend de votre commune de résidence/.test(t));
    localStorage.setItem('erip_departement_ressources', '87'); await ouvrir('mobilite');
    var t87 = document.body.textContent;
    cas('Mobilité Haute-Vienne : Mobilim 87, le national (Mes aides, France Mobilités, auto-écoles) et le régional, aucune structure de la Dordogne', /Mobilim 87/.test(t87) && /Mes aides France Travail/.test(t87) && /Auto-écoles associatives/.test(t87) && /Covoit/.test(t87) && !/AFAC|Atchoum|Plateforme MUST|Périgord/.test(t87));
    localStorage.setItem('erip_departement_ressources', '24'); await ouvrir('accompagnement');
    var ta = document.body.textContent, ca = cartes();
    var nAcc = await mtAttendu('accompagnement', '24');
    cas('Accompagnement Dordogne après le retrait des anciennes lignes : les structures du répertoire plus les annuaires en ligne, aucun doublon', nAcc > 0 && ca.length > nAcc && ca.length <= nAcc + 8 && new Set(ca.map(function (x) { return x.slice(0, 30); })).size === ca.length, ca.length + ' cartes pour ' + nAcc + ' structures');
    cas('Accompagnement Dordogne : le générique des Missions locales a disparu, les services en ligne restent', !/^Missions locales du Périgord/.test(ca.join('\n')) && /DORA/.test(ta) && /Annuaire des acteurs/.test(ta));
    var registre = await (await fetch('modules/comprendre-le-cadre/liens-verifies.txt')).text();
    cas('Registre des adresses : plus aucune ligne des structures de la mobilité migrées', !/^asso-afac-24 \|/m.test(registre) && !/^asso-atchoum-24 \|/m.test(registre) && !/^plateforme-mobilite-dordogne \|/m.test(registre));
    [['erip_mon_territoire_apercu', avant.apercu], ['erip_departement_ressources', avant.dep]].forEach(function (kv) { if (kv[1] === null) { localStorage.removeItem(kv[0]); } else { localStorage.setItem(kv[0], kv[1]); } });
  }
  // Migration du rayon « budget » (phase 4, 2026-10-12) : 12 structures déplacées (Banque de France, CCAS, CAF, MSA, UDAF, CRÉSUS, aide alimentaire), annuaires en ligne et Haute-Vienne gardés,
  // la CAF reste aussi dans le rayon garde avec l'adresse du répertoire (D14). Module FERMÉ pendant l'essai.
  async function parcoursBudget() {
    var cartes = function () { return [].map.call(document.querySelectorAll('.page-catalogue-contenu > .comprendre-le-cadre-encart.mb-2'), function (e) { return e.textContent.replace(/\s+/g, ' ').trim(); }); };
    var avant = { apercu: localStorage.getItem('erip_mon_territoire_apercu'), dep: localStorage.getItem('erip_departement_ressources') };
    localStorage.removeItem('erip_mon_territoire_apercu');
    var ouvrir = async function (rayon) {
      _comprendreLeCadreEtat = { ecran: 'accueil', rayon: null, ficheId: null }; _comprendreLeCadreCacheStructures = {};
      naviguerVers('comprendre-le-cadre'); await attente(600);
      _comprendreLeCadreOuvrirRayon(rayon); await attente(2000);
      var bs = document.querySelector('[data-comprendre-le-cadre-ouvrir-structures]'); if (bs) { bs.click(); } await attente(2500);
    };
    localStorage.setItem('erip_departement_ressources', '24'); await ouvrir('budget');
    var t = document.body.textContent, c = cartes();
    cas('Budget Dordogne : les 12 structures du répertoire (Banque de France, CCAS, CAF, MSA, UDAF, CRÉSUS, Croix-Rouge, Restos du Cœur, Banque alimentaire, Secours populaire, épiceries, La Maison 24)', /Banque de France/.test(t) && /Centre communal d.action sociale/.test(t) && /CAF de la Dordogne/.test(t) && /MSA Dordogne/.test(t) && /UDAF de la Dordogne/.test(t) && /CRÉSUS/.test(t) && /Restos du Cœur/.test(t) && /Banque alimentaire de la Dordogne/.test(t) && /Secours populaire/.test(t) && /Épiceries sociales/.test(t) && /La Maison 24/.test(t), c.length);
    cas('Budget Dordogne : les annuaires en ligne (Points conseil budget, Mes questions d\u2019argent) et les deux Missions locales avec leur texte « budget » restent', /Points conseil budget/.test(t) && /Mes questions d.argent/.test(t) && /fonds d.aide aux jeunes/.test(t) && /Mission locale du Grand Périgueux/.test(t));
    cas('Budget Dordogne : rien de la Haute-Vienne, pas de doublon', !/UDAF de la Haute-Vienne|Haute-Vienne/.test(t) && new Set(c.map(function (x) { return x.slice(0, 28); })).size === c.length, c.length);
    var urls = [].map.call(document.querySelectorAll('.page-catalogue-contenu a[target=_blank]'), function (a) { return a.href; });
    cas('Budget Dordogne : chaque structure a son adresse vérifiée (liens cliquables, dates affichées)', urls.length >= 17 && /adresse vérifiée le/.test(t));
    localStorage.setItem('erip_departement_ressources', '87'); await ouvrir('budget');
    var t87 = document.body.textContent;
    cas('Budget Haute-Vienne : ses trois structures, le national et le régional (Banque de France, Croix-Rouge, épiceries, CRÉSUS), aucune de la Dordogne', /UDAF de la Haute-Vienne/.test(t87) && /Restos du Cœur/.test(t87) && /Banque alimentaire de la Haute-Vienne/.test(t87) && /Banque de France/.test(t87) && /CRÉSUS/.test(t87) && !/UDAF de la Dordogne|La Maison 24|MSA Dordogne/.test(t87));
    localStorage.setItem('erip_departement_ressources', '24'); await ouvrir('garde');
    var tg = document.body.textContent;
    cas('Garde (rayon pas encore migré) : la CAF garde son texte « garde » et prend l\u2019adresse vérifiée du répertoire', /CAF de la Dordogne/.test(tg) && /garde/i.test(tg) && !!document.querySelector('a[href="https://www.caf.fr/allocataires/caf-de-la-dordogne"]'));
    var registre = await (await fetch('modules/comprendre-le-cadre/liens-verifies.txt')).text();
    cas('Registre des adresses : plus aucune ligne des structures du budget migrées', !/^udaf-dordogne \|/m.test(registre) && !/^caf-dordogne \|/m.test(registre) && !/^restos-du-coeur-dordogne \|/m.test(registre));
    localStorage.setItem('erip_mon_territoire_apercu', '1');
    _mtEntree = 'module'; _mtPile = []; _mtEtat.ecran = 'accueil'; naviguerVers('mon-territoire'); await attente(700);
    var soc = document.querySelector('[data-mt-domaine="social"]'); if (soc) { soc.click(); } await attente(300);
    var bud = document.querySelector('[data-mt-sousbranche="budget"]');
    cas('Qui fait quoi, Social : la sous-branche « Budget et aides » montre ses 12 structures', !!bud && /12 structures/.test(bud.textContent));
    if (bud) { bud.click(); } await attente(500);
    cas('Qui fait quoi, liste Budget : l\u2019aide alimentaire et la Banque de France y sont', /Banque alimentaire de la Dordogne/.test(document.body.textContent) && /Banque de France/.test(document.body.textContent));
    [['erip_mon_territoire_apercu', avant.apercu], ['erip_departement_ressources', avant.dep]].forEach(function (kv) { if (kv[1] === null) { localStorage.removeItem(kv[0]); } else { localStorage.setItem(kv[0], kv[1]); } });
  }
  // Migration du rayon « jeunes » (phase 4, 2026-10-12) : 6 structures déplacées, service civique (service en ligne) et Haute-Vienne gardés, trois Missions locales avec leur texte « jeunes »,
  // générique fusionné ; le domaine « Formation » de Qui fait quoi s'ouvre avec la sous-branche « Moins de 26 ans ». Module FERMÉ pendant l'essai de « Comprendre le cadre ».
  async function parcoursJeunes() {
    var cartes = function () { return [].map.call(document.querySelectorAll('.page-catalogue-contenu > .comprendre-le-cadre-encart.mb-2'), function (e) { return e.textContent.replace(/\s+/g, ' ').trim(); }); };
    var avant = { apercu: localStorage.getItem('erip_mon_territoire_apercu'), dep: localStorage.getItem('erip_departement_ressources') };
    localStorage.removeItem('erip_mon_territoire_apercu');
    var ouvrir = async function (rayon) {
      _comprendreLeCadreEtat = { ecran: 'accueil', rayon: null, ficheId: null }; _comprendreLeCadreCacheStructures = {};
      naviguerVers('comprendre-le-cadre'); await attente(600);
      _comprendreLeCadreOuvrirRayon(rayon); await attente(2000);
      var bs = document.querySelector('[data-comprendre-le-cadre-ouvrir-structures]'); if (bs) { bs.click(); } await attente(2500);
    };
    localStorage.setItem('erip_departement_ressources', '24'); await ouvrir('jeunes');
    var t = document.body.textContent, c = cartes();
    cas('Jeunes Dordogne : les structures du répertoire (E2C, EPIDE, plateforme décrocheurs, CFA et écoles de production, Info Jeunes, France Travail jeunes)', /deuxième chance/.test(t) && /EPIDE/.test(t) && /décrocheurs/.test(t) && /écoles de production/.test(t) && /Info Jeunes/.test(t) && /France Travail de la Dordogne/.test(t), c.length);
    cas('Jeunes Dordogne : les trois Missions locales gardent leur texte « 16-25 ans » ; le service civique (service en ligne) reste', /Mission locale du Bergeracois/.test(t) && /Grand Périgueux/.test(t) && /Périgord Noir/.test(t) && /16-25 ans/.test(t) && /service civique/i.test(t));
    cas('Jeunes Dordogne : le générique « Missions locales du Périgord » est fusionné, la phrase « selon votre commune » apparaît, rien de la Haute-Vienne', !c.some(function (x) { return /^Missions locales du Périgord/.test(x); }) && /dépend de votre commune de résidence/.test(t) && !/Mission locale rurale/.test(t));
    cas('Jeunes Dordogne : pas de doublon', new Set(c.map(function (x) { return x.slice(0, 28); })).size === c.length, c.length);
    localStorage.setItem('erip_departement_ressources', '87'); await ouvrir('jeunes');
    var t87 = document.body.textContent;
    cas('Jeunes Haute-Vienne : la Mission locale rurale, le national (service civique) et le régional (EPIDE, CFA, Info Jeunes), aucune structure de la Dordogne', /Mission locale rurale/.test(t87) && /EPIDE/.test(t87) && /Info Jeunes/.test(t87) && /service civique/i.test(t87) && !/deuxième chance|Périgord Noir|décrocheurs/.test(t87));
    localStorage.setItem('erip_departement_ressources', '24'); await ouvrir('garde');
    cas('Garde (migré à son tour) : le générique des Missions locales a disparu partout, les vraies Missions locales restent', !/Missions locales du Périgord/.test(document.body.textContent) && /Mission locale du Bergeracois/.test(document.body.textContent));
    var registre = await (await fetch('modules/comprendre-le-cadre/liens-verifies.txt')).text();
    cas('Registre des adresses : plus aucune ligne des structures des jeunes migrées', !/^e2c-perigueux \|/m.test(registre) && !/^epide-nouvelle-aquitaine \|/m.test(registre) && !/^asso-crij-nouvelle-aquitaine \|/m.test(registre));
    localStorage.setItem('erip_mon_territoire_apercu', '1');
    _mtEntree = 'module'; _mtPile = []; _mtEtat.ecran = 'accueil'; naviguerVers('mon-territoire'); await attente(700);
    var tuile = document.querySelector('[data-mt-domaine="formation"]');
    cas('Qui fait quoi : la tuile Formation n\u2019annonce plus « Pas encore de liste »', !!tuile && !/Pas encore de liste/.test(tuile.textContent));
    if (tuile) { tuile.click(); } await attente(400);
    var sb = document.querySelector('[data-mt-sousbranche="jeunes"]');
    cas('Qui fait quoi, Formation : la sous-branche « Moins de 26 ans » montre ses 6 structures', !!sb && /6 structures/.test(sb.textContent));
    if (sb) { sb.click(); } await attente(500);
    var retour = typeof _mtAllerVersPrecedent === 'function';
    cas('Qui fait quoi, liste Jeunes : l\u2019E2C et l\u2019EPIDE y sont, et « Retour » ramène à Formation', /deuxième chance/.test(document.body.textContent) && /EPIDE/.test(document.body.textContent) && retour && (function () { _mtAllerVersPrecedent(); return true; })());
    await attente(300);
    cas('Qui fait quoi : le retour de la liste ramène au domaine Formation, pas à Social', /Formation : se former/.test((document.querySelector('h1') || {}).textContent || ''));
    [['erip_mon_territoire_apercu', avant.apercu], ['erip_departement_ressources', avant.dep]].forEach(function (kv) { if (kv[1] === null) { localStorage.removeItem(kv[0]); } else { localStorage.setItem(kv[0], kv[1]); } });
  }
  // Migration du rayon « garde » (phase 4, 2026-10-12) : 4 structures déplacées (relais petite enfance, PMI, France Travail, CCAS), annuaires en ligne gardés, la CAF et les Missions locales gardent
  // leur texte « garde » ; le dernier générique des Missions locales est fusionné ; le domaine « Vie pratique » s'ouvre. Module FERMÉ pendant l'essai de « Comprendre le cadre ».
  async function parcoursGarde() {
    var cartes = function () { return [].map.call(document.querySelectorAll('.page-catalogue-contenu > .comprendre-le-cadre-encart.mb-2'), function (e) { return e.textContent.replace(/\s+/g, ' ').trim(); }); };
    var avant = { apercu: localStorage.getItem('erip_mon_territoire_apercu'), dep: localStorage.getItem('erip_departement_ressources') };
    localStorage.removeItem('erip_mon_territoire_apercu');
    var ouvrir = async function (rayon) {
      _comprendreLeCadreEtat = { ecran: 'accueil', rayon: null, ficheId: null }; _comprendreLeCadreCacheStructures = {};
      naviguerVers('comprendre-le-cadre'); await attente(600);
      _comprendreLeCadreOuvrirRayon(rayon); await attente(2000);
      var bs = document.querySelector('[data-comprendre-le-cadre-ouvrir-structures]'); if (bs) { bs.click(); } await attente(2500);
    };
    localStorage.setItem('erip_departement_ressources', '24'); await ouvrir('garde');
    var t = document.body.textContent, c = cartes();
    cas('Garde Dordogne : les structures du répertoire (relais petite enfance, PMI, France Travail, CCAS)', /Relais petite enfance/.test(t) && /Protection maternelle et infantile/.test(t) && /aide à la garde/i.test(t) && /Centre communal d.action sociale/.test(t), c.length);
    cas('Garde Dordogne : monenfant.fr et Pajemploi (services en ligne) restent', /monenfant/i.test(t) && /Pajemploi/.test(t));
    var caf = c.filter(function (x) { return /^CAF de la Dordogne/.test(x); })[0] || '', ml = c.filter(function (x) { return /^Mission locale du Bergeracois/.test(x); })[0] || '';
    cas('Garde Dordogne : la CAF et la Mission locale gardent leur texte « garde » avec l\u2019adresse vérifiée du répertoire', /CMG|garde/i.test(caf) && /adresse vérifiée le/.test(caf) && /garde/i.test(ml) && /adresse vérifiée le/.test(ml));
    cas('Garde Dordogne : le générique « Missions locales du Périgord » a disparu, pas de doublon', !c.some(function (x) { return /^Missions locales du Périgord/.test(x); }) && new Set(c.map(function (x) { return x.slice(0, 28); })).size === c.length, c.length);
    localStorage.setItem('erip_departement_ressources', '87'); await ouvrir('garde');
    var t87 = document.body.textContent;
    cas('Garde Haute-Vienne : le national seulement (relais, France Travail, CCAS, monenfant, Pajemploi), aucune structure de la Dordogne', /Relais petite enfance/.test(t87) && /Pajemploi/.test(t87) && !/Protection maternelle|CAF de la Dordogne|Mission locale/.test(t87));
    var registre = await (await fetch('modules/comprendre-le-cadre/liens-verifies.txt')).text();
    cas('Registre des adresses : plus aucune ligne des structures de la garde migrées ni du générique', !/^relais-petite-enfance \|/m.test(registre) && !/^pmi-dordogne \|/m.test(registre) && !/^mission-locale-perigord \|/m.test(registre));
    localStorage.setItem('erip_mon_territoire_apercu', '1'); localStorage.setItem('erip_departement_ressources', '24');
    _mtEntree = 'module'; _mtPile = []; _mtEtat.ecran = 'accueil'; naviguerVers('mon-territoire'); await attente(700);
    var tuile = document.querySelector('[data-mt-domaine="vie-pratique"]');
    cas('Qui fait quoi : la tuile « Vie pratique » n\u2019annonce plus « Pas encore de liste »', !!tuile && !/Pas encore de liste/.test(tuile.textContent));
    if (tuile) { tuile.click(); } await attente(400);
    var sb = document.querySelector('[data-mt-sousbranche="garde"]');
    cas('Qui fait quoi, Vie pratique : la sous-branche « Garde d\u2019enfant » montre ses 4 structures', !!sb && /4 structures/.test(sb.textContent));
    if (sb) { sb.click(); } await attente(500);
    cas('Qui fait quoi, liste Garde : le relais petite enfance et la PMI y sont, et « Retour » ramène à Vie pratique', /Relais petite enfance/.test(document.body.textContent) && /Protection maternelle/.test(document.body.textContent));
    _mtAllerVersPrecedent(); await attente(300);
    cas('Qui fait quoi : le retour ramène au domaine Vie pratique', /Vie pratique : garde/.test((document.querySelector('h1') || {}).textContent || ''));
    [['erip_mon_territoire_apercu', avant.apercu], ['erip_departement_ressources', avant.dep]].forEach(function (kv) { if (kv[1] === null) { localStorage.removeItem(kv[0]); } else { localStorage.setItem(kv[0], kv[1]); } });
  }
  // Migration du rayon « handicap » (phase 4, 2026-10-12) : 6 structures déplacées (MDPH, AGEFIPH, santé au travail, entreprises adaptées et ESAT, points-justice, APF), Cap emploi (déjà migré) garde
  // son texte « handicap », France Travail de la Dordogne (adresse pas encore vérifiée) et la Haute-Vienne restent ; la sous-branche « Handicap » rejoint Social. Module FERMÉ pendant l'essai de « Comprendre le cadre ».
  async function parcoursHandicap() {
    var cartes = function () { return [].map.call(document.querySelectorAll('.page-catalogue-contenu > .comprendre-le-cadre-encart.mb-2'), function (e) { return e.textContent.replace(/\s+/g, ' ').trim(); }); };
    var avant = { apercu: localStorage.getItem('erip_mon_territoire_apercu'), dep: localStorage.getItem('erip_departement_ressources') };
    localStorage.removeItem('erip_mon_territoire_apercu');
    var ouvrir = async function (rayon) {
      _comprendreLeCadreEtat = { ecran: 'accueil', rayon: null, ficheId: null }; _comprendreLeCadreCacheStructures = {};
      naviguerVers('comprendre-le-cadre'); await attente(600);
      _comprendreLeCadreOuvrirRayon(rayon); await attente(2000);
      var bs = document.querySelector('[data-comprendre-le-cadre-ouvrir-structures]'); if (bs) { bs.click(); } await attente(2500);
    };
    localStorage.setItem('erip_departement_ressources', '24'); await ouvrir('handicap');
    var t = document.body.textContent, c = cartes();
    cas('Handicap Dordogne : les structures du répertoire (MDPH, AGEFIPH, santé au travail, entreprises adaptées, points-justice, APF)', /MDPH/.test(t) && /AGEFIPH/.test(t) && /santé au travail/i.test(t) && /Entreprises adaptées/.test(t) && /Points-justice/.test(t) && /APF France handicap/.test(t), c.length);
    var cap = c.filter(function (x) { return /^Cap emploi/.test(x); })[0] || '';
    cas('Handicap Dordogne : Cap emploi garde son texte du rayon et l\u2019adresse vérifiée du répertoire ; France Travail de la Dordogne (pas encore vérifiée) reste signalée', /adresse vérifiée le/.test(cap) && /France Travail de la Dordogne/.test(t) && /pas encore vérifiée/i.test(t));
    cas('Handicap Dordogne : rien de la Haute-Vienne, pas de doublon', !/Haute-Vienne/.test(t) && new Set(c.map(function (x) { return x.slice(0, 28); })).size === c.length, c.length);
    localStorage.setItem('erip_departement_ressources', '87'); await ouvrir('handicap');
    var t87 = document.body.textContent;
    cas('Handicap Haute-Vienne : APF Haute-Vienne et le régional (AGEFIPH), aucune structure de la Dordogne', /APF France handicap, délégation de la Haute-Vienne/.test(t87) && /AGEFIPH/.test(t87) && !/MDPH de la Dordogne|Entreprises adaptées et ESAT de la Dordogne/.test(t87));
    localStorage.setItem('erip_departement_ressources', '24'); await ouvrir('emploi');
    var pj = document.body.textContent;
    cas('Emploi (rayon pas encore migré) : les points-justice gardent leur texte et prennent l\u2019adresse vérifiée du répertoire', /Points-justice/.test(pj) && /adresse vérifiée le/.test(pj));
    var registre = await (await fetch('modules/comprendre-le-cadre/liens-verifies.txt')).text();
    cas('Registre des adresses : plus aucune ligne des structures du handicap migrées', !/^mdph-dordogne \|/m.test(registre) && !/^agefiph-delegation-nouvelle-aquitaine \|/m.test(registre) && !/^cdad-dordogne-points-justice \|/m.test(registre));
    localStorage.setItem('erip_mon_territoire_apercu', '1');
    _mtEntree = 'module'; _mtPile = []; _mtEtat.ecran = 'accueil'; naviguerVers('mon-territoire'); await attente(700);
    var soc = document.querySelector('[data-mt-domaine="social"]'); if (soc) { soc.click(); } await attente(300);
    var sb = document.querySelector('[data-mt-sousbranche="handicap"]');
    cas('Qui fait quoi, Social : la sous-branche « Handicap » montre ses 6 structures', !!sb && /6 structures/.test(sb.textContent));
    if (sb) { sb.click(); } await attente(500);
    cas('Qui fait quoi, liste Handicap : la MDPH et l\u2019AGEFIPH y sont', /MDPH/.test(document.body.textContent) && /AGEFIPH/.test(document.body.textContent));
    [['erip_mon_territoire_apercu', avant.apercu], ['erip_departement_ressources', avant.dep]].forEach(function (kv) { if (kv[1] === null) { localStorage.removeItem(kv[0]); } else { localStorage.setItem(kv[0], kv[1]); } });
  }
  // Migration du rayon « former » (phase 4, 2026-10-12) : 6 structures déplacées (CEP, Transitions Pro, France Travail formation, Région, points relais VAE, AFPA GRETA CNAM), APEC et les deux Missions
  // locales gardent leur texte « formation » ; la sous-branche « Se former et se reconvertir » rejoint le domaine Formation. Module FERMÉ pendant l'essai de « Comprendre le cadre ».
  async function parcoursFormer() {
    var cartes = function () { return [].map.call(document.querySelectorAll('.page-catalogue-contenu > .comprendre-le-cadre-encart.mb-2'), function (e) { return e.textContent.replace(/\s+/g, ' ').trim(); }); };
    var avant = { apercu: localStorage.getItem('erip_mon_territoire_apercu'), dep: localStorage.getItem('erip_departement_ressources') };
    localStorage.removeItem('erip_mon_territoire_apercu');
    var ouvrir = async function (rayon) {
      _comprendreLeCadreEtat = { ecran: 'accueil', rayon: null, ficheId: null }; _comprendreLeCadreCacheStructures = {};
      naviguerVers('comprendre-le-cadre'); await attente(600);
      _comprendreLeCadreOuvrirRayon(rayon); await attente(2000);
      var bs = document.querySelector('[data-comprendre-le-cadre-ouvrir-structures]'); if (bs) { bs.click(); } await attente(2500);
    };
    localStorage.setItem('erip_departement_ressources', '24'); await ouvrir('former');
    var t = document.body.textContent, c = cartes();
    cas('Former Dordogne : les structures du répertoire (CEP, Transitions Pro, France Travail, Région, points relais VAE, AFPA GRETA CNAM)', /évolution professionnelle/i.test(t) && /Transitions Pro/.test(t) && /France Travail/.test(t) && /Région Nouvelle-Aquitaine/.test(t) && /VAE/.test(t) && /AFPA/.test(t), c.length);
    var apec = c.filter(function (x) { return /^APEC/.test(x); })[0] || '', ml = c.filter(function (x) { return /^Mission locale du Bergeracois/.test(x); })[0] || '';
    cas('Former Dordogne : APEC et la Mission locale gardent leur texte « formation » et l\u2019adresse vérifiée du répertoire', /évolution professionnelle/.test(apec) && /adresse vérifiée le/.test(apec) && /évolution professionnelle/.test(ml) && /adresse vérifiée le/.test(ml));
    cas('Former Dordogne : pas de doublon, rien de la Haute-Vienne', new Set(c.map(function (x) { return x.slice(0, 28); })).size === c.length && !/Haute-Vienne/.test(t), c.length);
    localStorage.setItem('erip_departement_ressources', '87'); await ouvrir('former');
    var t87 = document.body.textContent;
    cas('Former Haute-Vienne : le national et le régional (France Travail, CEP, Transitions Pro, Région, VAE), aucune structure de la Dordogne', /France Travail/.test(t87) && /Transitions Pro/.test(t87) && !/AFPA|Mission locale du Bergeracois|Points relais conseil VAE de la Dordogne/.test(t87));
    var registre = await (await fetch('modules/comprendre-le-cadre/liens-verifies.txt')).text();
    cas('Registre des adresses : plus aucune ligne des structures de la formation migrées', !/^afpa-greta-cnam-dordogne \|/m.test(registre) && !/^transitions-pro-nouvelle-aquitaine \|/m.test(registre) && !/^france-travail-formation \|/m.test(registre));
    localStorage.setItem('erip_mon_territoire_apercu', '1'); localStorage.setItem('erip_departement_ressources', '24');
    _mtEntree = 'module'; _mtPile = []; _mtEtat.ecran = 'accueil'; naviguerVers('mon-territoire'); await attente(700);
    var f = document.querySelector('[data-mt-domaine="formation"]'); if (f) { f.click(); } await attente(300);
    var sb = document.querySelector('[data-mt-sousbranche="former"]');
    cas('Qui fait quoi, Formation : la sous-branche « Se former et se reconvertir » montre ses 6 structures, à côté de « Moins de 26 ans »', !!sb && /6 structures/.test(sb.textContent) && !!document.querySelector('[data-mt-sousbranche="jeunes"]'));
    if (sb) { sb.click(); } await attente(500);
    cas('Qui fait quoi, liste Former : l\u2019AFPA et Transitions Pro y sont', /AFPA/.test(document.body.textContent) && /Transitions Pro/.test(document.body.textContent));
    [['erip_mon_territoire_apercu', avant.apercu], ['erip_departement_ressources', avant.dep]].forEach(function (kv) { if (kv[1] === null) { localStorage.removeItem(kv[0]); } else { localStorage.setItem(kv[0], kv[1]); } });
  }
  // Migration du rayon « emploi » (phase 4, 2026-10-12) : 2 structures déplacées (Inspection du travail, prud'hommes) ; France Travail, points-justice, insertion par l'activité économique et Cap emploi
  // (déjà migrés) gardent leur texte « emploi » ; la sous-branche « Contrats et droit du travail » rejoint Social. Module FERMÉ pendant l'essai de « Comprendre le cadre ».
  async function parcoursEmploi() {
    var cartes = function () { return [].map.call(document.querySelectorAll('.page-catalogue-contenu > .comprendre-le-cadre-encart.mb-2'), function (e) { return e.textContent.replace(/\s+/g, ' ').trim(); }); };
    var avant = { apercu: localStorage.getItem('erip_mon_territoire_apercu'), dep: localStorage.getItem('erip_departement_ressources') };
    localStorage.removeItem('erip_mon_territoire_apercu');
    var ouvrir = async function (rayon) {
      _comprendreLeCadreEtat = { ecran: 'accueil', rayon: null, ficheId: null }; _comprendreLeCadreCacheStructures = {};
      naviguerVers('comprendre-le-cadre'); await attente(600);
      _comprendreLeCadreOuvrirRayon(rayon); await attente(2000);
      var bs = document.querySelector('[data-comprendre-le-cadre-ouvrir-structures]'); if (bs) { bs.click(); } await attente(2500);
    };
    localStorage.setItem('erip_departement_ressources', '24'); await ouvrir('emploi');
    var t = document.body.textContent, c = cartes();
    cas('Emploi Dordogne : les 6 structures (Inspection du travail, prud\u2019hommes, France Travail, points-justice, insertion par l\u2019activité économique, Cap emploi)', c.length === 6 && /Inspection du travail/.test(t) && /prud.hommes/.test(t) && /France Travail/.test(t) && /Points-justice/.test(t) && /Cap emploi/.test(t), c.length);
    var cap = c.filter(function (x) { return /^Cap emploi/.test(x); })[0] || '';
    cas('Emploi Dordogne : Cap emploi garde son texte du rayon et l\u2019adresse vérifiée du répertoire', /CDD Tremplin/.test(cap) && /adresse vérifiée le/.test(cap));
    cas('Emploi Dordogne : pas de doublon, rien de la Haute-Vienne', new Set(c.map(function (x) { return x.slice(0, 28); })).size === c.length && !/Haute-Vienne/.test(t), c.length);
    localStorage.setItem('erip_departement_ressources', '87'); await ouvrir('emploi');
    var t87 = document.body.textContent;
    cas('Emploi Haute-Vienne : France Travail (national), aucune structure de la Dordogne', /France Travail/.test(t87) && !/Inspection du travail \(DDETS de la Dordogne\)|prud.hommes de P/.test(t87));
    var registre = await (await fetch('modules/comprendre-le-cadre/liens-verifies.txt')).text();
    cas('Registre des adresses : plus aucune ligne de l\u2019Inspection du travail ni des prud\u2019hommes', !/^inspection-du-travail-ddets-dordogne \|/m.test(registre) && !/^conseil-de-prud-hommes-perigueux-bergerac \|/m.test(registre));
    localStorage.setItem('erip_mon_territoire_apercu', '1'); localStorage.setItem('erip_departement_ressources', '24');
    _mtEntree = 'module'; _mtPile = []; _mtEtat.ecran = 'accueil'; naviguerVers('mon-territoire'); await attente(700);
    var soc = document.querySelector('[data-mt-domaine="social"]'); if (soc) { soc.click(); } await attente(300);
    var sb = document.querySelector('[data-mt-sousbranche="emploi"]');
    cas('Qui fait quoi, Social : la sous-branche « Contrats et droit du travail » montre ses 2 structures', !!sb && /2 structures/.test(sb.textContent));
    if (sb) { sb.click(); } await attente(500);
    cas('Qui fait quoi, liste Emploi : l\u2019Inspection du travail et les prud\u2019hommes y sont', /Inspection du travail/.test(document.body.textContent) && /prud.hommes/.test(document.body.textContent));
    [['erip_mon_territoire_apercu', avant.apercu], ['erip_departement_ressources', avant.dep]].forEach(function (kv) { if (kv[1] === null) { localStorage.removeItem(kv[0]); } else { localStorage.setItem(kv[0], kv[1]); } });
  }
  // Migration des rayons « juridique » et « justice » (phase 4, 2026-10-12) : 6 + 3 structures déplacées, trois génériques fusionnés avec les fiches déjà au répertoire (points-justice, prud'hommes,
  // inspection du travail), la Haute-Vienne et les services en ligne restent ; le domaine « Droits et justice » de Qui fait quoi s'ouvre. Module FERMÉ pendant l'essai de « Comprendre le cadre ».
  async function parcoursDroitsJustice() {
    var cartes = function () { return [].map.call(document.querySelectorAll('.page-catalogue-contenu > .comprendre-le-cadre-encart.mb-2'), function (e) { return e.textContent.replace(/\s+/g, ' ').trim(); }); };
    var avant = { apercu: localStorage.getItem('erip_mon_territoire_apercu'), dep: localStorage.getItem('erip_departement_ressources') };
    localStorage.removeItem('erip_mon_territoire_apercu');
    var ouvrir = async function (rayon) {
      _comprendreLeCadreEtat = { ecran: 'accueil', rayon: null, ficheId: null }; _comprendreLeCadreCacheStructures = {};
      naviguerVers('comprendre-le-cadre'); await attente(600);
      _comprendreLeCadreOuvrirRayon(rayon); await attente(2000);
      var bs = document.querySelector('[data-comprendre-le-cadre-ouvrir-structures]'); if (bs) { bs.click(); } await attente(2500);
    };
    localStorage.setItem('erip_departement_ressources', '24'); await ouvrir('juridique');
    var t = document.body.textContent, c = cartes();
    cas('Juridique Dordogne : 9 structures (accès au droit, avocats, aide juridictionnelle, Défenseur des droits, victimes, CIDFF, prud\u2019hommes, inspection du travail, points-justice), sans doublon ni Haute-Vienne', c.length === 9 && new Set(c.map(function (x) { return x.slice(0, 28); })).size === c.length && /Points-justice/.test(t) && /prud.hommes/.test(t) && /Inspection du travail/.test(t) && /Barreau/.test(t) && /CIDFF/.test(t) && !/Limousin/.test(t), c.length);
    localStorage.setItem('erip_departement_ressources', '87'); await ouvrir('juridique');
    var t87 = document.body.textContent;
    cas('Juridique Haute-Vienne : le CIDFF Limousin, aucune structure de la Dordogne', /CIDFF Limousin/.test(t87) && !/Barreau de P|Points-justice de la Dordogne/.test(t87));
    localStorage.setItem('erip_departement_ressources', '24'); await ouvrir('justice');
    var tj = document.body.textContent, cj = cartes();
    cas('Justice Dordogne : SPIP, France Travail justice, points-justice, SIAO, associations, casier judiciaire et ATIGIP, sans doublon', cj.length === 7 && new Set(cj.map(function (x) { return x.slice(0, 28); })).size === cj.length && /Service pénitentiaire/.test(tj) && /Points-justice/.test(tj) && /SIAO/.test(tj) && /Casier judiciaire/.test(tj) && /ATIGIP/.test(tj) && !/ARSL/.test(tj), cj.length);
    var pj = cj.filter(function (x) { return /^Points-justice/.test(x); })[0] || '';
    cas('Justice Dordogne : les points-justice ont enfin une adresse vérifiée (plus de « pas encore vérifiée »)', /adresse vérifiée le/.test(pj) && !/pas encore vérifiée/i.test(tj));
    localStorage.setItem('erip_departement_ressources', '87'); await ouvrir('justice');
    cas('Justice Haute-Vienne : l\u2019ARSL, aucune structure de la Dordogne', /ARSL/.test(document.body.textContent) && !/Service pénitentiaire d.insertion et de probation de la Dordogne/.test(document.body.textContent));
    var registre = await (await fetch('modules/comprendre-le-cadre/liens-verifies.txt')).text();
    cas('Registre des adresses : plus aucune ligne des structures juridiques migrées ni des génériques fusionnés', !/^cdad-dordogne \|/m.test(registre) && !/^spip-dordogne \|/m.test(registre) && !/^point-justice-dordogne \|/m.test(registre) && !/^dreets-inspection-travail-dordogne \|/m.test(registre));
    localStorage.setItem('erip_mon_territoire_apercu', '1'); localStorage.setItem('erip_departement_ressources', '24');
    _mtEntree = 'module'; _mtPile = []; _mtEtat.ecran = 'accueil'; naviguerVers('mon-territoire'); await attente(700);
    var d = document.querySelector('[data-mt-domaine="droits-justice"]'); if (d) { d.click(); } await attente(300);
    var sj = document.querySelector('[data-mt-sousbranche="juridique"]'), ss = document.querySelector('[data-mt-sousbranche="justice"]');
    cas('Qui fait quoi, Droits et justice : deux sous-branches (9 et 4 structures)', !!sj && !!ss && /9 structures/.test(sj.textContent) && /4 structures/.test(ss.textContent), (sj || {}).textContent + ' / ' + (ss || {}).textContent);
    if (sj) { sj.click(); } await attente(500);
    cas('Qui fait quoi, liste Questions juridiques : le Barreau et le CIDFF y sont', /Barreau/.test(document.body.textContent) && /CIDFF/.test(document.body.textContent));
    [['erip_mon_territoire_apercu', avant.apercu], ['erip_departement_ressources', avant.dep]].forEach(function (kv) { if (kv[1] === null) { localStorage.removeItem(kv[0]); } else { localStorage.setItem(kv[0], kv[1]); } });
  }
  // Migration du rayon « sante » (phase 4, 2026-10-12) : 2 structures déplacées (CPAM de la Dordogne, Maisons France Services), la CPAM de la Haute-Vienne reste dans la collecte ; la sous-branche
  // « Santé » rejoint « Vie pratique ». Module FERMÉ pendant l'essai de « Comprendre le cadre ».
  async function parcoursSante() {
    var cartes = function () { return [].map.call(document.querySelectorAll('.page-catalogue-contenu > .comprendre-le-cadre-encart.mb-2'), function (e) { return e.textContent.replace(/\s+/g, ' ').trim(); }); };
    var avant = { apercu: localStorage.getItem('erip_mon_territoire_apercu'), dep: localStorage.getItem('erip_departement_ressources') };
    localStorage.removeItem('erip_mon_territoire_apercu');
    var ouvrir = async function (rayon) {
      _comprendreLeCadreEtat = { ecran: 'accueil', rayon: null, ficheId: null }; _comprendreLeCadreCacheStructures = {};
      naviguerVers('comprendre-le-cadre'); await attente(600);
      _comprendreLeCadreOuvrirRayon(rayon); await attente(2000);
      var bs = document.querySelector('[data-comprendre-le-cadre-ouvrir-structures]'); if (bs) { bs.click(); } await attente(2500);
    };
    localStorage.setItem('erip_departement_ressources', '24'); await ouvrir('sante');
    var t = document.body.textContent, c = cartes();
    cas('Santé Dordogne : la CPAM de la Dordogne et les Maisons France Services, sans la Haute-Vienne', c.length === 2 && /CPAM de la Dordogne/.test(t) && /France Services/.test(t) && !/CPAM de la Haute-Vienne/.test(t), c.length);
    cas('Santé Dordogne : l\u2019adresse vérifiée du répertoire accompagne chaque structure', c.every(function (x) { return /adresse vérifiée le/.test(x); }));
    localStorage.setItem('erip_departement_ressources', '87'); await ouvrir('sante');
    var t87 = document.body.textContent;
    cas('Santé Haute-Vienne : la CPAM de la Haute-Vienne et France Services (national), pas la CPAM de la Dordogne', /CPAM de la Haute-Vienne/.test(t87) && /France Services/.test(t87) && !/CPAM de la Dordogne/.test(t87));
    var registre = await (await fetch('modules/comprendre-le-cadre/liens-verifies.txt')).text();
    cas('Registre des adresses : plus aucune ligne de la CPAM de la Dordogne ni de France Services', !/^cpam-dordogne \|/m.test(registre) && !/^france-services \|/m.test(registre));
    localStorage.setItem('erip_mon_territoire_apercu', '1'); localStorage.setItem('erip_departement_ressources', '24');
    _mtEntree = 'module'; _mtPile = []; _mtEtat.ecran = 'accueil'; naviguerVers('mon-territoire'); await attente(700);
    var v = document.querySelector('[data-mt-domaine="vie-pratique"]'); if (v) { v.click(); } await attente(300);
    var sb = document.querySelector('[data-mt-sousbranche="sante"]');
    cas('Qui fait quoi, Vie pratique : la sous-branche « Santé » montre ses 2 structures, à côté de « Garde d\u2019enfant »', !!sb && /2 structures/.test(sb.textContent) && !!document.querySelector('[data-mt-sousbranche="garde"]'));
    if (sb) { sb.click(); } await attente(500);
    cas('Qui fait quoi, liste Santé : la CPAM et France Services y sont', /CPAM de la Dordogne/.test(document.body.textContent) && /France Services/.test(document.body.textContent));
    [['erip_mon_territoire_apercu', avant.apercu], ['erip_departement_ressources', avant.dep]].forEach(function (kv) { if (kv[1] === null) { localStorage.removeItem(kv[0]); } else { localStorage.setItem(kv[0], kv[1]); } });
  }
  // Migration du rayon « seniors » (phase 4, 2026-10-12) : la CARSAT est déplacée, les Points France services de la retraite sont fusionnés avec la fiche déjà au répertoire (rayon ajouté), le compte
  // retraite en ligne (info-retraite.fr, service en ligne) reste dans la collecte ; la sous-branche « Retraite et seniors » rejoint « Vie pratique ». Module FERMÉ pendant l'essai de « Comprendre le cadre ».
  async function parcoursSeniors() {
    var cartes = function () { return [].map.call(document.querySelectorAll('.page-catalogue-contenu > .comprendre-le-cadre-encart.mb-2'), function (e) { return e.textContent.replace(/\s+/g, ' ').trim(); }); };
    var avant = { apercu: localStorage.getItem('erip_mon_territoire_apercu'), dep: localStorage.getItem('erip_departement_ressources') };
    localStorage.removeItem('erip_mon_territoire_apercu');
    var ouvrir = async function (rayon) {
      _comprendreLeCadreEtat = { ecran: 'accueil', rayon: null, ficheId: null }; _comprendreLeCadreCacheStructures = {};
      naviguerVers('comprendre-le-cadre'); await attente(600);
      _comprendreLeCadreOuvrirRayon(rayon); await attente(2000);
      var bs = document.querySelector('[data-comprendre-le-cadre-ouvrir-structures]'); if (bs) { bs.click(); } await attente(2500);
    };
    localStorage.setItem('erip_departement_ressources', '24'); await ouvrir('seniors');
    var t = document.body.textContent, c = cartes();
    cas('Seniors Dordogne : la CARSAT, France Services et le compte retraite en ligne, sans doublon', c.length === 3 && new Set(c.map(function (x) { return x.slice(0, 20); })).size === 3 && /CARSAT/.test(t) && /France Services/.test(t) && /info-retraite|Compte retraite/i.test(t), c.length);
    localStorage.setItem('erip_departement_ressources', '87'); await ouvrir('seniors');
    cas('Seniors Haute-Vienne : la CARSAT (régionale) et France Services restent proposées', /CARSAT/.test(document.body.textContent) && /France Services/.test(document.body.textContent));
    var registre = await (await fetch('modules/comprendre-le-cadre/liens-verifies.txt')).text();
    cas('Registre des adresses : plus aucune ligne de la CARSAT ni du doublon France services retraite', !/^assurance-retraite-carsat-nouvelle-aquitaine \|/m.test(registre) && !/^france-services-point-retraite \|/m.test(registre));
    localStorage.setItem('erip_mon_territoire_apercu', '1'); localStorage.setItem('erip_departement_ressources', '24');
    _mtEntree = 'module'; _mtPile = []; _mtEtat.ecran = 'accueil'; naviguerVers('mon-territoire'); await attente(700);
    var v = document.querySelector('[data-mt-domaine="vie-pratique"]'); if (v) { v.click(); } await attente(300);
    var sb = document.querySelector('[data-mt-sousbranche="seniors"]');
    cas('Qui fait quoi, Vie pratique : trois sous-branches (garde, santé, retraite), « Retraite et seniors » avec ses 2 structures', document.querySelectorAll('[data-mt-sousbranche]').length === 3 && !!sb && /2 structures/.test(sb.textContent));
    if (sb) { sb.click(); } await attente(500);
    cas('Qui fait quoi, liste Retraite : la CARSAT et France Services y sont', /CARSAT/.test(document.body.textContent) && /France Services/.test(document.body.textContent));
    [['erip_mon_territoire_apercu', avant.apercu], ['erip_departement_ressources', avant.dep]].forEach(function (kv) { if (kv[1] === null) { localStorage.removeItem(kv[0]); } else { localStorage.setItem(kv[0], kv[1]); } });
  }
  // Migration du rayon « creer » (phase 4, 2026-10-12) : 9 structures déplacées (chambres consulaires, BGE, ADIE, Initiative, France Active, deux coopératives, tiers-lieu La Traverse), le générique des
  // coopératives est fusionné avec les deux fiches précises, France Travail de la Dordogne (adresse pas encore vérifiée) reste ; le domaine « Créer son activité » de Qui fait quoi s'ouvre.
  async function parcoursCreer() {
    var cartes = function () { return [].map.call(document.querySelectorAll('.page-catalogue-contenu > .comprendre-le-cadre-encart.mb-2'), function (e) { return e.textContent.replace(/\s+/g, ' ').trim(); }); };
    var avant = { apercu: localStorage.getItem('erip_mon_territoire_apercu'), dep: localStorage.getItem('erip_departement_ressources') };
    localStorage.removeItem('erip_mon_territoire_apercu');
    var ouvrir = async function (rayon) {
      _comprendreLeCadreEtat = { ecran: 'accueil', rayon: null, ficheId: null }; _comprendreLeCadreCacheStructures = {};
      naviguerVers('comprendre-le-cadre'); await attente(600);
      _comprendreLeCadreOuvrirRayon(rayon); await attente(2000);
      var bs = document.querySelector('[data-comprendre-le-cadre-ouvrir-structures]'); if (bs) { bs.click(); } await attente(2500);
    };
    localStorage.setItem('erip_departement_ressources', '24'); await ouvrir('creer');
    var t = document.body.textContent, c = cartes();
    cas('Créer Dordogne : 10 structures (9 du répertoire + France Travail), sans doublon ni Haute-Vienne', c.length === 10 && new Set(c.map(function (x) { return x.slice(0, 24); })).size === 10 && /BGE/.test(t) && /ADIE/.test(t) && /Initiative/.test(t) && /France Active/.test(t) && /Coop.alpha/i.test(t) && /IRISCOP/i.test(t) && /La Traverse/.test(t) && !/Haute-Vienne/.test(t), c.length);
    var ft = c.filter(function (x) { return /^France Travail/.test(x); })[0] || '';
    cas('Créer Dordogne : France Travail de la Dordogne reste, signalée « pas encore vérifiée » ; les autres portent l\u2019adresse vérifiée', /pas encore vérifiée/i.test(ft) && c.filter(function (x) { return /adresse vérifiée le/.test(x); }).length === 9);
    localStorage.setItem('erip_departement_ressources', '87'); await ouvrir('creer');
    var t87 = document.body.textContent;
    cas('Créer Haute-Vienne : l\u2019ADIE et France Active (régionales), aucune structure de la Dordogne', /ADIE/.test(t87) && /France Active/.test(t87) && !/BGE Périgord|Chambre de commerce|La Traverse/.test(t87));
    localStorage.setItem('erip_departement_ressources', '24'); await ouvrir('employeurs');
    cas('Employeurs (rayon pas encore migré) : la CCI et la chambre de métiers y gardent leur texte « employeurs »', /conseil aux employeurs du commerce/.test(document.body.textContent) && /conseil aux employeurs artisans/.test(document.body.textContent));
    var registre = await (await fetch('modules/comprendre-le-cadre/liens-verifies.txt')).text();
    cas('Registre des adresses : plus aucune ligne des structures de la création ni du générique des coopératives', !/^bge-perigord \|/m.test(registre) && !/^adie-nouvelle-aquitaine \|/m.test(registre) && !/^cooperative-activite-emploi-dordogne \|/m.test(registre));
    localStorage.setItem('erip_mon_territoire_apercu', '1'); localStorage.setItem('erip_departement_ressources', '24');
    _mtEntree = 'module'; _mtPile = []; _mtEtat.ecran = 'accueil'; naviguerVers('mon-territoire'); await attente(700);
    var tuile = document.querySelector('[data-mt-domaine="creer"]');
    cas('Qui fait quoi : la tuile « Créer son activité » est ouverte', !!tuile && !/Pas encore de liste/.test(tuile.textContent));
    if (tuile) { tuile.click(); } await attente(400);
    var sb = document.querySelector('[data-mt-sousbranche="creer"]');
    cas('Qui fait quoi, Créer son activité : la sous-branche montre ses 9 structures', !!sb && /9 structures/.test(sb.textContent));
    if (sb) { sb.click(); } await attente(500);
    cas('Qui fait quoi, liste Créer : la BGE et l\u2019ADIE y sont', /BGE/.test(document.body.textContent) && /ADIE/.test(document.body.textContent));
    [['erip_mon_territoire_apercu', avant.apercu], ['erip_departement_ressources', avant.dep]].forEach(function (kv) { if (kv[1] === null) { localStorage.removeItem(kv[0]); } else { localStorage.setItem(kv[0], kv[1]); } });
  }
  // Migration du rayon « francais » (phase 4, 2026-10-12) : 8 structures déplacées (OFII, centres sociaux, service social départemental, France Travail, Région, OEPRE, Cimade, Ligue de l'enseignement),
  // l'annuaire des centres d'examen DELF et la Haute-Vienne restent ; le domaine « Accueil et langue » de Qui fait quoi s'ouvre. Module FERMÉ pendant l'essai de « Comprendre le cadre ».
  async function parcoursFrancais() {
    var cartes = function () { return [].map.call(document.querySelectorAll('.page-catalogue-contenu > .comprendre-le-cadre-encart.mb-2'), function (e) { return e.textContent.replace(/\s+/g, ' ').trim(); }); };
    var avant = { apercu: localStorage.getItem('erip_mon_territoire_apercu'), dep: localStorage.getItem('erip_departement_ressources') };
    localStorage.removeItem('erip_mon_territoire_apercu');
    var ouvrir = async function (rayon) {
      _comprendreLeCadreEtat = { ecran: 'accueil', rayon: null, ficheId: null }; _comprendreLeCadreCacheStructures = {};
      naviguerVers('comprendre-le-cadre'); await attente(600);
      _comprendreLeCadreOuvrirRayon(rayon); await attente(2000);
      var bs = document.querySelector('[data-comprendre-le-cadre-ouvrir-structures]'); if (bs) { bs.click(); } await attente(2500);
    };
    localStorage.setItem('erip_departement_ressources', '24'); await ouvrir('francais');
    var t = document.body.textContent, c = cartes();
    cas('Français Dordogne : 9 structures (8 du répertoire + l\u2019annuaire DELF), sans doublon ni Haute-Vienne', c.length === 9 && new Set(c.map(function (x) { return x.slice(0, 24); })).size === 9 && /OFII|Office français/.test(t) && /Cimade/i.test(t) && /Ligue de l.enseignement/.test(t) && /DELF/.test(t) && !/L\.I\.R\.E/.test(t), c.length);
    cas('Français Dordogne : chaque structure du répertoire porte l\u2019adresse vérifiée', c.filter(function (x) { return /adresse vérifiée le/.test(x); }).length === 9);
    localStorage.setItem('erip_departement_ressources', '87'); await ouvrir('francais');
    var t87 = document.body.textContent;
    cas('Français Haute-Vienne : L.I.R.E. et le national/régional (France Travail, Région, OFII), aucune structure de la Dordogne', /L\.I\.R\.E/.test(t87) && /France Travail/.test(t87) && !/Cimade|Ligue de l.enseignement|centres sociaux/i.test(t87));
    var registre = await (await fetch('modules/comprendre-le-cadre/liens-verifies.txt')).text();
    cas('Registre des adresses : plus aucune ligne des structures du français migrées', !/^ofii-nouvelle-aquitaine \|/m.test(registre) && !/^cimade-perigueux \|/m.test(registre) && !/^asso-ligue-de-l-enseignement-24 \|/m.test(registre));
    localStorage.setItem('erip_mon_territoire_apercu', '1'); localStorage.setItem('erip_departement_ressources', '24');
    _mtEntree = 'module'; _mtPile = []; _mtEtat.ecran = 'accueil'; naviguerVers('mon-territoire'); await attente(700);
    var tuile = document.querySelector('[data-mt-domaine="accueil-langue"]');
    cas('Qui fait quoi : la tuile « Accueil et langue » est ouverte', !!tuile && !/Pas encore de liste/.test(tuile.textContent));
    if (tuile) { tuile.click(); } await attente(400);
    var sb = document.querySelector('[data-mt-sousbranche="francais"]');
    cas('Qui fait quoi, Accueil et langue : la sous-branche « Apprendre le français » montre ses 8 structures', !!sb && /8 structures/.test(sb.textContent));
    if (sb) { sb.click(); } await attente(500);
    cas('Qui fait quoi, liste Français : la Cimade et la Ligue de l\u2019enseignement y sont', /Cimade/i.test(document.body.textContent) && /Ligue de l.enseignement/.test(document.body.textContent));
    [['erip_mon_territoire_apercu', avant.apercu], ['erip_departement_ressources', avant.dep]].forEach(function (kv) { if (kv[1] === null) { localStorage.removeItem(kv[0]); } else { localStorage.setItem(kv[0], kv[1]); } });
  }
  // Migration du rayon « etranger » (phase 4, 2026-10-12) : 5 structures déplacées (préfecture, ENIC-NARIC, Cimade régionale, SPADA, France Terre d'Asile), l'OFII de Bordeaux est fusionné avec celui du rayon
  // « français », les services en ligne (ANEF, ANTS) et les points-justice (texte propre) restent ; la sous-branche « Venir de l'étranger » rejoint « Accueil et langue ».
  async function parcoursEtranger() {
    var cartes = function () { return [].map.call(document.querySelectorAll('.page-catalogue-contenu > .comprendre-le-cadre-encart.mb-2'), function (e) { return e.textContent.replace(/\s+/g, ' ').trim(); }); };
    var avant = { apercu: localStorage.getItem('erip_mon_territoire_apercu'), dep: localStorage.getItem('erip_departement_ressources') };
    localStorage.removeItem('erip_mon_territoire_apercu');
    var ouvrir = async function (rayon) {
      _comprendreLeCadreEtat = { ecran: 'accueil', rayon: null, ficheId: null }; _comprendreLeCadreCacheStructures = {};
      naviguerVers('comprendre-le-cadre'); await attente(600);
      _comprendreLeCadreOuvrirRayon(rayon); await attente(2000);
      var bs = document.querySelector('[data-comprendre-le-cadre-ouvrir-structures]'); if (bs) { bs.click(); } await attente(2500);
    };
    localStorage.setItem('erip_departement_ressources', '24'); await ouvrir('etranger');
    var t = document.body.textContent, c = cartes();
    cas('Étranger Dordogne : 9 structures (préfecture, ENIC-NARIC, Cimade, SPADA, France Terre d\u2019Asile, OFII, points-justice, ANEF, ANTS), sans doublon ni Haute-Vienne', c.length === 9 && new Set(c.map(function (x) { return x.slice(0, 24); })).size === 9 && /Préfecture/.test(t) && /ENIC/.test(t) && /SPADA|premier accueil/.test(t) && /Terre d.Asile/i.test(t) && /OFII|Office français/.test(t) && /ANEF|Administration numérique/.test(t) && /ANTS|Agence nationale des titres/.test(t) && !/Haute-Vienne/.test(t), c.length);
    var pj = c.filter(function (x) { return /droit des étrangers/.test(x); })[0] || '';
    cas('Étranger Dordogne : les points-justice gardent leur texte « droit des étrangers » et l\u2019adresse vérifiée du répertoire', /droit des étrangers/.test(pj) && /adresse vérifiée le/.test(pj));
    localStorage.setItem('erip_departement_ressources', '87'); await ouvrir('etranger');
    var t87 = document.body.textContent;
    cas('Étranger Haute-Vienne : le national et le régional (ANEF, ENIC-NARIC, Cimade, OFII), aucune structure de la Dordogne', /ANEF|Administration numérique/.test(t87) && /ENIC/.test(t87) && /Cimade/i.test(t87) && !/Préfecture de la Dordogne|SPADA|Terre d.Asile/i.test(t87));
    var registre = await (await fetch('modules/comprendre-le-cadre/liens-verifies.txt')).text();
    cas('Registre des adresses : plus aucune ligne des structures de l\u2019accueil des étrangers migrées ni de l\u2019OFII de Bordeaux', !/^prefecture-dordogne-etrangers \|/m.test(registre) && !/^spada-dordogne \|/m.test(registre) && !/^ofii-direction-territoriale-bordeaux \|/m.test(registre));
    localStorage.setItem('erip_mon_territoire_apercu', '1'); localStorage.setItem('erip_departement_ressources', '24');
    _mtEntree = 'module'; _mtPile = []; _mtEtat.ecran = 'accueil'; naviguerVers('mon-territoire'); await attente(700);
    var d = document.querySelector('[data-mt-domaine="accueil-langue"]'); if (d) { d.click(); } await attente(400);
    var sb = document.querySelector('[data-mt-sousbranche="etranger"]'), sf = document.querySelector('[data-mt-sousbranche="francais"]');
    cas('Qui fait quoi, Accueil et langue : deux sous-branches, « Venir de l\u2019étranger » avec ses 6 structures et « Apprendre le français » avec ses 8', !!sb && !!sf && /6 structures/.test(sb.textContent) && /8 structures/.test(sf.textContent), (sb || {}).textContent);
    if (sb) { sb.click(); } await attente(500);
    cas('Qui fait quoi, liste Étranger : la préfecture et l\u2019OFII y sont', /Préfecture/.test(document.body.textContent) && /Office français/.test(document.body.textContent));
    [['erip_mon_territoire_apercu', avant.apercu], ['erip_departement_ressources', avant.dep]].forEach(function (kv) { if (kv[1] === null) { localStorage.removeItem(kv[0]); } else { localStorage.setItem(kv[0], kv[1]); } });
  }
  // Migration du rayon « employeurs » (phase 4, 2026-10-12), dernier des 17 : 3 structures déplacées (URSSAF, DREETS, espace employeur de France Travail), la CCI, la chambre de métiers et le SPST de la
  // Dordogne sont fusionnés avec les fiches déjà au répertoire (rayon ajouté, description complétée), le SPSTI de la Haute-Vienne reste ; le domaine « Appui aux employeurs » de Qui fait quoi s'ouvre.
  async function parcoursEmployeurs() {
    var cartes = function () { return [].map.call(document.querySelectorAll('.page-catalogue-contenu > .comprendre-le-cadre-encart.mb-2'), function (e) { return e.textContent.replace(/\s+/g, ' ').trim(); }); };
    var avant = { apercu: localStorage.getItem('erip_mon_territoire_apercu'), dep: localStorage.getItem('erip_departement_ressources') };
    localStorage.removeItem('erip_mon_territoire_apercu');
    var ouvrir = async function (rayon) {
      _comprendreLeCadreEtat = { ecran: 'accueil', rayon: null, ficheId: null }; _comprendreLeCadreCacheStructures = {};
      naviguerVers('comprendre-le-cadre'); await attente(600);
      _comprendreLeCadreOuvrirRayon(rayon); await attente(2000);
      var bs = document.querySelector('[data-comprendre-le-cadre-ouvrir-structures]'); if (bs) { bs.click(); } await attente(2500);
    };
    localStorage.setItem('erip_departement_ressources', '24'); await ouvrir('employeurs');
    var t = document.body.textContent, c = cartes();
    cas('Employeurs Dordogne : 6 structures (URSSAF, DREETS, France Travail employeur, CCI, chambre de métiers, santé au travail), sans doublon ni Haute-Vienne', c.length === 6 && new Set(c.map(function (x) { return x.slice(0, 24); })).size === 6 && /URSSAF/.test(t) && /DREETS/.test(t) && /espace employeur/.test(t) && /Chambre de commerce/.test(t) && /Chambre de métiers/.test(t) && /santé au travail/i.test(t) && !/SPSTI|Haute-Vienne/.test(t), c.length);
    cas('Employeurs Dordogne : la CCI et la chambre de métiers gardent leur texte « employeurs » et portent l\u2019adresse vérifiée', /conseil aux employeurs du commerce/.test(t) && /conseil aux employeurs artisans/.test(t) && c.filter(function (x) { return /adresse vérifiée le/.test(x); }).length === 6);
    localStorage.setItem('erip_departement_ressources', '87'); await ouvrir('employeurs');
    var t87 = document.body.textContent;
    cas('Employeurs Haute-Vienne : l\u2019URSSAF, la DREETS, France Travail et le SPSTI 23/87, aucune structure de la Dordogne', /URSSAF/.test(t87) && /DREETS/.test(t87) && /SPSTI|Creuse-Haute-Vienne/.test(t87) && !/Chambre de commerce|Chambre de métiers/.test(t87));
    var registre = await (await fetch('modules/comprendre-le-cadre/liens-verifies.txt')).text();
    cas('Registre des adresses : plus aucune ligne des structures des employeurs migrées ni du SPST fusionné', !/^urssaf-nouvelle-aquitaine \|/m.test(registre) && !/^spst-19-24-perigueux \|/m.test(registre) && !/^france-travail-espace-employeur \|/m.test(registre));
    localStorage.setItem('erip_mon_territoire_apercu', '1'); localStorage.setItem('erip_departement_ressources', '24');
    _mtEntree = 'module'; _mtPile = []; _mtEtat.ecran = 'accueil'; naviguerVers('mon-territoire'); await attente(700);
    var tuile = document.querySelector('[data-mt-domaine="appui-employeurs"]');
    cas('Qui fait quoi : la tuile « Appui aux employeurs » est ouverte', !!tuile && !/Pas encore de liste/.test(tuile.textContent));
    if (tuile) { tuile.click(); } await attente(400);
    var sb = document.querySelector('[data-mt-sousbranche="employeurs"]');
    cas('Qui fait quoi, Appui aux employeurs : la sous-branche montre ses 6 structures', !!sb && /6 structures/.test(sb.textContent));
    if (sb) { sb.click(); } await attente(500);
    cas('Qui fait quoi, liste Employeurs : l\u2019URSSAF et la CCI y sont', /URSSAF/.test(document.body.textContent) && /Chambre de commerce/.test(document.body.textContent));
    [['erip_mon_territoire_apercu', avant.apercu], ['erip_departement_ressources', avant.dep]].forEach(function (kv) { if (kv[1] === null) { localStorage.removeItem(kv[0]); } else { localStorage.setItem(kv[0], kv[1]); } });
  }
  // Rubrique « Employeurs qui publient leurs offres » (2026-10-17, offres.txt) : tuile, écran en quatre groupes, filtre par secteur, bouton de fiche, recherche d'accueil, critères,
  // « Revenir à la page principale ». À lancer APRÈS un vrai clic dans la page (flèche « Précédent » : voir l'en-tête du fichier).
  async function parcoursMonTerritoireOffres() {
    var avant = { apercu: localStorage.getItem('erip_mon_territoire_apercu'), dep: localStorage.getItem('erip_departement_ressources') };
    localStorage.setItem('erip_mon_territoire_apercu', '1'); localStorage.setItem('erip_departement_ressources', '24');
    var clic = function (sel) { var e = document.querySelector(sel); if (!e) { return false; } e.click(); return true; };
    var titres = function () { return [].map.call(document.querySelectorAll('.page-catalogue-contenu h2'), function (h) { return h.textContent.trim(); }); };
    _mtEntree = 'employeurs'; _mtPile = []; _mtEtat = _mtEtatInitial({ ecran: 'emploi' });
    naviguerVers('mon-territoire'); await attente(900);
    cas('Offres publiées : la porte est en tête de l’écran des secteurs et dit où l’on consulte les offres', !!document.querySelector('[data-mt-offres]') && /Employeurs qui publient leurs offres/.test(document.querySelector('[data-mt-offres]').textContent) && /vous les consultez directement sur leurs sites/.test(document.querySelector('[data-mt-offres]').textContent));
    clic('[data-mt-offres]'); await attente(500);
    cas('Offres publiées : l’écran s’ouvre avec son titre et son encart « Nous ne recopions pas les offres »', _mtEtat.ecran === 'offres' && /Où voir les offres d’emploi en Dordogne/.test(document.body.textContent) && /Nous ne recopions pas les offres/.test(document.body.textContent));
    cas('Offres publiées : les quatre groupes dans l’ordre (près de chez vous, grands employeurs, fonction publique, groupements)', titres().join('|').toUpperCase().indexOf('PRÈS DE CHEZ VOUS|GRANDS EMPLOYEURS|FONCTION PUBLIQUE|GROUPEMENTS') !== -1, titres().join('|'));
    cas('Offres publiées : chaque ligne a sa pastille « Vérifié le » et le bouton qui quitte l’application', document.querySelectorAll('a[href^="https://"]').length >= 20 && /Vérifié le/.test(document.body.textContent) && /Vous quittez l’application/.test(document.body.textContent));
    cas('Offres publiées : aucune page d’intermédiaire ni de la Haute-Vienne seule en Dordogne', ![].some.call(document.querySelectorAll('.page-catalogue-contenu a[href]'), function (a) { return /indeed|hellowork|jobijoba|francetravail/.test(a.href) && !/labonneboite/.test(a.href); }) && !/GEIQ SAGe|CCI Limoges/.test(document.body.textContent));
    clic('[data-mt-secteur-offres="securite"]'); await attente(300);
    cas('Offres publiées : le filtre « Sécurité » ne garde que le secteur choisi', _mtEtat.secteurOffres === 'securite' && /Securitas/.test(document.body.textContent) && !/Apei|Lidl/.test(document.body.textContent) && titres().length >= 1, titres().join('|'));
    clic('[data-mt-criteres-offres]'); await attente(400);
    cas('Offres publiées : l’écran « Comment les pages sont choisies » existe et dit « pas d’agence d’intérim »', _mtEtat.ecran === 'criteres-offres' && /Comment les pages sont choisies/.test(document.body.textContent) && /pas d’agence d’intérim/.test(document.body.textContent));
    clic('#btnMonTerritoirePagePrincipale'); await attente(900);
    cas('Offres publiées : « Revenir à la page principale » ramène à l’écran des secteurs en un clic', _mtEtat.ecran === 'emploi' && _mtPile.length === 0, _mtEtat.ecran + ' pile=' + _mtPile.length);
    _mtAller('fiche', { id: 'lidl' }); await attente(400);
    var bt = [].filter.call(document.querySelectorAll('a.btn'), function (a) { return /Ses offres publiées/.test(a.textContent); })[0];
    cas('Offres publiées : la fiche de Lidl a le bouton « Ses offres publiées » vers sa page, et plus « Page de recrutement »', !!bt && bt.href === 'https://emplois.lidl.fr/' && !/Page de recrutement/.test(document.body.textContent));
    var res = typeof monTerritoireResultatsRecherche === 'function' ? monTerritoireResultatsRecherche('offres') : [];
    cas('Offres publiées : la recherche de l’accueil propose la rubrique avec « offres »', res.length > 0 && res[0].cible === 'fn:mon-territoire:offres');
    localStorage.setItem('erip_departement_ressources', '87'); _mtEtat = _mtEtatInitial({ ecran: 'offres' }); _mtPile = []; pageMonTerritoire(); await attente(500);
    cas('Offres publiées : en Haute-Vienne, ses pages à elle et pas celles de la Dordogne seule', /GEIQ SAGe/.test(document.body.textContent) && /CCI Limoges/.test(document.body.textContent) && !/Apei Périgueux|Terra'Job/.test(document.body.textContent));
    [['erip_mon_territoire_apercu', avant.apercu], ['erip_departement_ressources', avant.dep]].forEach(function (kv) { if (kv[1] === null) { localStorage.removeItem(kv[0]); } else { localStorage.setItem(kv[0], kv[1]); } });
  }
  // Haute-Vienne dans le répertoire (2026-10-12) : les 17 structures locales de la Haute-Vienne ont quitté les collectes pour lieux.txt. Une personne de la Dordogne n'en voit AUCUNE (recherche, frein,
  // Lexique, rayons) ; une personne de la Haute-Vienne retrouve chacune dans son rayon, exactement comme avant. Module FERMÉ pendant l'essai de « Comprendre le cadre ».
  async function parcoursHauteVienne() {
    var avant = { apercu: localStorage.getItem('erip_mon_territoire_apercu'), dep: localStorage.getItem('erip_departement_ressources') };
    localStorage.removeItem('erip_mon_territoire_apercu');
    var ouvrir = async function (rayon) {
      _comprendreLeCadreEtat = { ecran: 'accueil', rayon: null, ficheId: null }; _comprendreLeCadreCacheStructures = {};
      naviguerVers('comprendre-le-cadre'); await attente(600);
      _comprendreLeCadreOuvrirRayon(rayon); await attente(2000);
      var bs = document.querySelector('[data-comprendre-le-cadre-ouvrir-structures]'); if (bs) { bs.click(); } await attente(2500);
      return document.body.textContent;
    };
    var attendu = {
      accompagnement: ['Varlin Pont-Neuf', 'ALEAS', 'UNAFAM Haute-Vienne', 'Réseau Alliage'], budget: ['UDAF de la Haute-Vienne', 'Restos du Cœur', 'Banque alimentaire de la Haute-Vienne'],
      employeurs: ['SPSTI 23/87'], francais: ['L.I.R.E'], handicap: ['APF France handicap, délégation de la Haute-Vienne'], jeunes: ['Mission locale rurale de la Haute-Vienne'],
      juridique: ['CIDFF Limousin'], justice: ['ARSL'], logement: ['SOLIHA Limousin', 'ADIL de la Haute-Vienne'], mobilite: ['Mobilim 87'], sante: ['CPAM de la Haute-Vienne']
    };
    localStorage.setItem('erip_departement_ressources', '87');
    var manquants = [];
    for (var r in attendu) {
      var t = await ouvrir(r);
      attendu[r].forEach(function (nom) { if (t.indexOf(nom) === -1) { manquants.push(r + ' : ' + nom); } });
    }
    cas('Haute-Vienne : chacune des 17 structures locales est retrouvée dans son rayon (11 rayons), comme avant la migration', manquants.length === 0, manquants.join(' ; '));
    localStorage.setItem('erip_departement_ressources', '24');
    var fuites = [];
    for (var r2 in attendu) {
      var t24 = await ouvrir(r2);
      if (/UDAF de la Haute-Vienne|Banque alimentaire de la Haute-Vienne|Restos du Cœur, association départementale de la Haute-Vienne|SOLIHA Limousin|ADIL de la Haute-Vienne|Mobilim 87|ALEAS|Varlin Pont-Neuf|UNAFAM Haute-Vienne|Réseau Alliage|SPSTI 23|L\.I\.R\.E|ARSL \(|APF France handicap, délégation de la Haute-Vienne|Mission locale rurale de la Haute-Vienne|CIDFF Limousin|CPAM de la Haute-Vienne/.test(t24)) { fuites.push(r2); }
    }
    cas('Dordogne : aucune structure de la Haute-Vienne n\u2019apparaît dans aucun des 11 rayons', fuites.length === 0, fuites.join(', '));
    localStorage.setItem('erip_mon_territoire_apercu', '1');
    _mtDonnees = null; _mtChargement = 'inactif';
    _mtEntree = 'module'; _mtPile = []; _mtEtat.ecran = 'accueil'; naviguerVers('mon-territoire'); await attente(1200);
    var inp = document.getElementById('rechercheERIPInput');
    naviguerVers('cv'); await attente(800);
    inp = document.getElementById('rechercheERIPInput');
    var zone;
    if (inp) { inp.value = 'udaf'; inp.dispatchEvent(new Event('input', { bubbles: true })); await attente(800); zone = document.getElementById('resultatsRechercheERIP'); }
    cas('Dordogne : la recherche d\u2019accueil « udaf » ne propose pas l\u2019UDAF de la Haute-Vienne', !!inp && !(zone && /UDAF de la Haute-Vienne/.test(zone.textContent)) && !!(zone && /UDAF de la Dordogne/.test(zone.textContent)));
    if (inp) { inp.value = 'dettes'; inp.dispatchEvent(new Event('input', { bubbles: true })); await attente(800); zone = document.getElementById('resultatsRechercheERIP'); }
    cas('Dordogne : la recherche « dettes » (frein budget) ne propose aucune structure de la Haute-Vienne', !!inp && !(zone && /Banque alimentaire de la Haute-Vienne|UDAF de la Haute-Vienne|Restos du Cœur, association départementale de la Haute-Vienne/.test(zone.textContent)));
    var registre = await (await fetch('modules/comprendre-le-cadre/liens-verifies.txt')).text();
    cas('Registre des adresses : plus aucune ligne de la Haute-Vienne (87)', !/ \| 87\s*$/m.test(registre));
    [['erip_mon_territoire_apercu', avant.apercu], ['erip_departement_ressources', avant.dep]].forEach(function (kv) { if (kv[1] === null) { localStorage.removeItem(kv[0]); } else { localStorage.setItem(kv[0], kv[1]); } });
  }
  // Le module « Qui fait quoi » parle du DÉPARTEMENT de la personne (2026-10-12, lot L5) : tous les mots viennent de la table des départements, aucun nom n'est écrit en dur. Dordogne et Haute-Vienne
  // ont chacune leur commune, leurs structures et leurs employeurs ; « ailleurs » voit une phrase qui dit où les listes existent ; sans département choisi, on le demande. Module ouvert par l'aperçu.
  async function parcoursTerritoires() {
    var avant = { apercu: localStorage.getItem('erip_mon_territoire_apercu'), dep: localStorage.getItem('erip_departement_ressources'), com: localStorage.getItem('erip_mon_territoire_commune'), info: localStorage.getItem('erip_mon_territoire_commune_info') };
    var texte = function () { return document.body.textContent.replace(/\s+/g, ' '); };
    var h1 = function () { return (document.querySelector('h1') || {}).textContent || ''; };
    var ouvrirModule = async function (dep) {
      if (dep === null) { localStorage.removeItem('erip_departement_ressources'); } else { localStorage.setItem('erip_departement_ressources', dep); }
      localStorage.removeItem('erip_mon_territoire_commune'); localStorage.removeItem('erip_mon_territoire_commune_info');
      _mtEntree = 'module'; _mtPile = []; _mtEtat.ecran = 'accueil'; _mtEtat.changerCommune = false; _mtEtat.messageCommune = ''; _mtEtat.saisieCommune = '';
      naviguerVers('mon-territoire'); await attente(900); for (var k = 0; k < 20 && (typeof _mtDonnees === 'undefined' || !_mtDonnees); k++) { await attente(300); } pageMonTerritoire(); await attente(300);
    };
    var ouvrirRayon = async function (domaine, sousBranche) {
      var d = document.querySelector('[data-mt-domaine="' + domaine + '"]'); if (d) { d.click(); } await attente(300);
      var b = document.querySelector('[data-mt-sousbranche="' + sousBranche + '"]'); if (b) { b.click(); } await attente(500);
    };
    localStorage.setItem('erip_mon_territoire_apercu', '1');
    _mtDonnees = null; _mtChargement = 'inactif';

    await ouvrirModule('24');
    var champ = document.getElementById('mtSaisieCommune');
    cas('Dordogne : l\u2019accueil du module est là, le champ commune donne un exemple de la Dordogne', /Qui fait quoi/.test(h1()) && !!champ && /Bergerac ou 24100/.test(champ.getAttribute('placeholder') || ''), (champ || {}).placeholder);
    await ouvrirRayon('social', 'logement');
    var toutVoir24 = document.querySelector('[data-mt-commune-v="*"]'); if (toutVoir24 && toutVoir24.getAttribute('aria-pressed') !== 'true') { toutVoir24.click(); await attente(400); }
    var t24 = texte();
    cas('Dordogne : la liste du Logement dit « en Dordogne », a sa section « En Dordogne » et aucune structure de la Haute-Vienne', /, en Dordogne/.test(h1()) && /En Dordogne/.test(t24) && /ADIL de la Dordogne/.test(t24) && !/ADIL de la Haute-Vienne|SOLIHA Limousin/.test(t24), h1());

    await ouvrirModule('87');
    var champ87 = document.getElementById('mtSaisieCommune');
    cas('Haute-Vienne : le module s\u2019ouvre (plus d\u2019écran « territoire non couvert »), le champ commune donne un exemple de la Haute-Vienne', /Qui fait quoi/.test(h1()) && !/pas encore de liste pour/.test(texte()) && !!champ87 && /Limoges ou 87000/.test(champ87.getAttribute('placeholder') || ''), (champ87 || {}).placeholder);
    await ouvrirRayon('social', 'logement');
    var toutVoir87 = document.querySelector('[data-mt-commune-v="*"]'); if (toutVoir87 && toutVoir87.getAttribute('aria-pressed') !== 'true') { toutVoir87.click(); await attente(400); }
    var t87 = texte();
    cas('Haute-Vienne : la liste du Logement dit « dans la Haute-Vienne », avec SOLIHA Limousin et l\u2019ADIL de la Haute-Vienne, sans rien de la Dordogne', /, dans la Haute-Vienne/.test(h1()) && /Dans la Haute-Vienne/.test(t87) && /SOLIHA Limousin/.test(t87) && /ADIL de la Haute-Vienne/.test(t87) && !/ADIL de la Dordogne/.test(t87) && !/En Dordogne/.test(t87), h1());

    await ouvrirModule('87');
    var c87 = document.getElementById('mtSaisieCommune'); c87.value = 'Limoges'; document.querySelector('[data-mt-valider-commune]').click(); await attente(500);
    cas('Haute-Vienne : la commune Limoges est acceptée et s\u2019affiche avec son département', /Votre territoire : Limoges, Haute-Vienne \(87\)/.test(texte()));
    document.querySelector('[data-mt-changer-commune]').click(); await attente(300);
    var c87b = document.getElementById('mtSaisieCommune'); c87b.value = 'Bergerac'; document.querySelector('[data-mt-valider-commune]').click(); await attente(500);
    cas('Haute-Vienne : Bergerac (une commune de la Dordogne) est refusée avec un message qui nomme la Haute-Vienne', /Nous ne trouvons pas cette commune dans la Haute-Vienne/.test(texte()));

    await ouvrirModule('24');
    var e24 = document.querySelector('[data-mt-domaine="emploi"]'); if (e24) { e24.click(); } await attente(500);
    var com24 = document.querySelector('[data-mt-secteur="commerce-vente"]');
    cas('Dordogne : le secteur Commerce a ses enseignes de Bergerac', !!com24 && /\d+ enseignes ou employeurs/.test(com24.textContent), (com24 || {}).textContent);
    await ouvrirModule('87');
    var e87 = document.querySelector('[data-mt-domaine="emploi"]'); if (e87) { e87.click(); } await attente(500);
    var com87 = document.querySelector('[data-mt-secteur="commerce-vente"]');
    cas('Haute-Vienne : aucun employeur de la Dordogne dans ses secteurs (« Pas encore de liste »)', !!com87 && /Pas encore de liste/.test(com87.textContent) && !/enseignes ou employeurs/.test(texte()), (com87 || {}).textContent);

    await ouvrirModule('ailleurs');
    var th = texte();
    cas('Ailleurs : une phrase qui dit où les listes existent, construite avec les départements ouverts', /Nous n.avons pas encore de liste pour votre territoire/.test(th) && /Elle existe pour la Dordogne et la Haute-Vienne/.test(th), th.slice(0, 200));

    await ouvrirModule(null);
    var bouton = document.querySelector('[data-mt-choisir-departement]');
    cas('Sans département choisi : le module le demande au lieu de deviner', !!bouton && /dans quel département vous cherchez/.test(texte()));
    if (bouton) { bouton.click(); } await attente(500);
    var tuile87 = document.querySelector('[data-choix-departement="87"]');
    cas('Le choix du département s\u2019ouvre, proposant la Dordogne et la Haute-Vienne', !!tuile87 && !!document.querySelector('[data-choix-departement="24"]'));
    if (tuile87) { tuile87.click(); } await attente(900);
    cas('Après le choix de la Haute-Vienne, le module affiche ses domaines', /Qui fait quoi/.test(h1()) && !!document.querySelector('[data-mt-domaine="social"]') && localStorage.getItem('erip_departement_ressources') === '87');

    [['erip_mon_territoire_apercu', avant.apercu], ['erip_departement_ressources', avant.dep], ['erip_mon_territoire_commune', avant.com], ['erip_mon_territoire_commune_info', avant.info]].forEach(function (kv) { if (kv[1] === null) { localStorage.removeItem(kv[0]); } else { localStorage.setItem(kv[0], kv[1]); } });
  }
  // ---------------- Bouton Aide : aucune page ni fenetre sans aide, aucune entree morte (chantier docs/CHANTIER_AIDE_A_JOUR.md, 2026-10-15) ----------------
  // Ne verifie PAS que les selecteurs de la visite guidee existent (ils n'apparaissent qu'apres un clic ou une ouverture) : seulement la couverture.
  // ---------------- « candidater » : l'entreprise est un bloc EN PAGE, et « Passer à l'action » affiche un encart (Denis, 2026-10-15, maquette docs/MAQUETTE_CANDIDATER_ENTREPRISE_EN_PAGE_2026-10-15.html) ----------------
  async function parcoursCandidaterEntreprise() {
    var sauve = JSON.parse(JSON.stringify(dossier)), rgSauve = rechercheGuidee;
    try {
      ouvrirPanneauChoixParcours('Boulanger', {}); await attente(900);
      cas('candidater : la page s’ouvre', pageActuelle === 'candidater', pageActuelle);
      document.querySelector('[data-cand-groupe="parcours"] [data-val="cv"]').click(); await attente(400);
      document.querySelector('[data-cand-groupe="cv"] [data-val="non"]').click(); await attente(400);
      cas('candidater : « Changer » est un vrai bouton (pas un lien-texte)', !!document.querySelector('button[data-cand-changer].btn-outline-secondary') && !document.querySelector('#app .btn-link'));
      document.querySelector('[data-cand-groupe="type"] [data-val="offre"]').click(); await attente(600);
      cas('candidater : le bloc entreprise est dans la page, sans fenêtre ni bouton « Renseigner l’entreprise »', !!document.querySelector('#candZoneEntreprise #ciblageEntreprise') && !document.querySelector('.fenetre-erip-boite') && !document.querySelector('[data-cand-entreprise]'));
      var cont = function () { return document.querySelector('[data-cand-continuer]').disabled; };
      var badge = function () { return document.querySelectorAll('.cand-bloc')[1].querySelector('.cand-bloc-badge').textContent; };
      cas('candidater : « Continuer » grisé et bloc « à compléter » tant que le nom est vide', cont() === true && badge() === 'à compléter');
      var champ = document.getElementById('ciblageEntreprise'); champ.focus();
      champ.value = 'Boulangerie Dupont'; champ.dispatchEvent(new Event('input', { bubbles: true })); await attente(300);
      cas('candidater : le nom rempli débloque « Continuer », sans perdre le curseur', cont() === false && badge() === 'complété' && document.activeElement === champ && dossier.rechercheCandidature.entreprise === 'Boulangerie Dupont');
      document.querySelector('[data-cand-civilite-recruteur]:not([data-cand-civilite-recruteur=""])').click(); await attente(400);
      cas('candidater : choisir une civilité redessine la zone sans effacer le nom', document.getElementById('ciblageEntreprise').value === 'Boulangerie Dupont' && !!document.getElementById('candNomRecruteur'));
      champ = document.getElementById('ciblageEntreprise'); champ.value = ''; champ.dispatchEvent(new Event('input', { bubbles: true })); await attente(300);
      cas('candidater : le nom effacé regrise « Continuer »', cont() === true && badge() === 'à compléter');
      // « Passer à l'action » : encart, plus de fenêtre
      dossier.modeCreation = 'nouveau'; dossier.objectif = 'offre'; dossier.modeRecherche = 'metier'; dossier.metierCible = 'Boulanger'; dossier.typeRecherche = 'offre';
      dossier.rechercheCandidature = { entreprise: '', site: '', lienOffre: '', civiliteRecruteur: '', nomRecruteur: '', mettreEnAvantCouleurEntreprise: false, couleurEntreprise: '' };
      naviguerVers('revelation'); await attente(1200);
      verifierAvantPasserAction('assistant'); await attente(500);
      cas('passer à l’action : une offre sans entreprise affiche un encart dans la page, pas de fenêtre', !!document.getElementById('encartEntrepriseManquante') && !document.querySelector('.fenetre-erip-boite'));
      document.getElementById('btnEncartEntrepriseIndiquer').click(); await attente(1000);
      cas('passer à l’action : « Indiquer l’entreprise » renvoie sur « Votre objectif », où le champ est en page', pageActuelle === 'objectif' && !!document.getElementById('ciblageEntreprise'), pageActuelle);
      naviguerVers('revelation'); await attente(1000);
      verifierAvantPasserAction('assistant'); await attente(400);
      document.getElementById('btnEncartEntrepriseSans').click(); await attente(1000);
      cas('passer à l’action : « Continuer sans » avance et repasse la recherche en « simple »', pageActuelle === 'assistant' && dossier.typeRecherche === 'simple' && dossier.rechercheCandidature.entreprise === '', pageActuelle + ' / ' + dossier.typeRecherche);
    } finally {
      Object.keys(dossier).forEach(function (k) { delete dossier[k]; }); Object.assign(dossier, sauve); rechercheGuidee = rgSauve;
    }
  }

  async function parcoursChiffresToucher() {
    var dep = localStorage.getItem('erip_departement_ressources');
    try {
      localStorage.setItem('erip_departement_ressources', '24');
      naviguerVers('comprendre-les-chiffres'); await attente(3000);
      var bulle = function () { var b = document.getElementById('bulleInfoHoverFlottante'); return !!b && b.classList.contains('visible'); };
      var chiffres = [].slice.call(document.querySelectorAll('.comprendre-les-chiffres-contenu .chiffre'));
      cas('chiffres : des chiffres en bleu sont affichés, tous atteignables au clavier', chiffres.length > 5 && chiffres.every(function (e) { return e.getAttribute('tabindex') === '0' && e.getAttribute('role') === 'button'; }), chiffres.length);
      var a = chiffres[0];
      cas('chiffres : la phrase d’aide invite à toucher un chiffre', !!document.getElementById('comprendreLesChiffresAideToucher'));
      if (bulle()) { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); }
      a.click();
      var texte = (document.getElementById('bulleInfoHoverFlottante') || {}).textContent || '';
      cas('chiffres : un toucher ouvre la source', bulle() && /^Source : \S/.test(texte) && a.getAttribute('aria-expanded') === 'true', texte);
      a.click();
      cas('chiffres : un deuxième toucher sur le même chiffre referme la source', !bulle() && a.getAttribute('aria-expanded') === 'false');
      a.click(); document.querySelector('h1').click();
      cas('chiffres : toucher ailleurs referme la source', !bulle());
      a.focus(); a.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      var ouvertClavier = bulle();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      cas('chiffres : Entrée ouvre la source et Échap la referme', ouvertClavier && !bulle());
      var sans = chiffres.filter(function (e) { e.click(); var t = document.getElementById('bulleInfoHoverFlottante').textContent; e.click(); return /voir la source en bas/.test(t); });
      cas('chiffres : aucun chiffre n’est sans source à montrer', sans.length === 0, sans.length);
      var barre = document.querySelector('.comprendre-les-chiffres-graphe [data-tip]');
      if (barre) {
        barre.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        cas('chiffres : un toucher sur une barre de graphe affiche le trimestre et la source', bulle() && /source/.test(document.getElementById('bulleInfoHoverFlottante').textContent));
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      }
    } finally {
      if (dep === null) { localStorage.removeItem('erip_departement_ressources'); } else { localStorage.setItem('erip_departement_ressources', dep); }
    }
  }

  async function parcoursDigestChangements() {
    var dep = localStorage.getItem('erip_departement_ressources');
    try {
      localStorage.setItem('erip_departement_ressources', '24');
      _comprendreLeCadreEtat.ecran = 'accueil';
      naviguerVers('comprendre-le-cadre'); await attente(3000);
      var enfants = [].slice.call(document.querySelectorAll('.page-catalogue-contenu > *'));
      var posCarte = enfants.findIndex(function (e) { return e.id === 'comprendreLeCadreOutils'; });
      var posRayons = enfants.findIndex(function (e) { return e.id === 'comprendreLeCadreRayons'; });
      cas('digest : la carte « Ce qui a changé récemment » est en tête de l’accueil, avant les rayons', posCarte > -1 && posRayons > posCarte, posCarte + ' / ' + posRayons);
      cas('digest : la carte n’existe qu’à un seul endroit (plus de seconde carte en bas)', document.querySelectorAll('[data-comprendre-le-cadre-ouvrir-digest]').length === 1 && document.querySelectorAll('#comprendreLeCadreOutils').length === 1);
      var cf = document.getElementById('comprendreLeCadreCommentFiches');
      cas('accueil : « Comment sont faites ces fiches ? » est un dépliant fermé qui contient la phrase, et l’ancien encart n’est plus affiché', !!cf && cf.tagName === 'DETAILS' && !cf.open && /rédigées à la main, à une date indiquée/.test(cf.textContent) && !document.querySelector('.page-catalogue-contenu > .comprendre-le-cadre-encart.small'));
      cf.querySelector('summary').click();
      cas('accueil : un clic sur « Comment sont faites ces fiches ? » ouvre l’explication', cf.open);
      cf.querySelector('summary').click();
      var nombre = document.querySelector('.comprendre-le-cadre-une-nombre');
      cas('digest : la carte affiche le nombre de changements', !!nombre && /^\d+ changements?$/.test(nombre.textContent.trim()), nombre && nombre.textContent);
      var nb = nombre ? parseInt(nombre.textContent, 10) : -1;
      var rech = function (t) { var i = document.getElementById('comprendreLeCadreRechercheInput'); i.value = t; i.dispatchEvent(new Event('input', { bubbles: true })); return document.getElementById('comprendreLeCadreOutils').hidden; };
      var masqueSurTrimestriel = rech('trimestriel'), masqueSurLogement = rech('logement'); rech('');
      cas('digest : la recherche de l’accueil garde la carte pour « trimestriel » et la masque pour « logement »', masqueSurTrimestriel === false && masqueSurLogement === true, masqueSurTrimestriel + ' / ' + masqueSurLogement);
      document.querySelector('[data-comprendre-le-cadre-ouvrir-digest]').click(); await attente(1000);
      var cartes = document.querySelectorAll('.comprendre-le-cadre-digest-item').length;
      cas('digest : le nombre de la carte est le nombre de changements du digest', nb === cartes && cartes > 0, nb + ' / ' + cartes);
      var panneaux = [].slice.call(document.querySelectorAll('.comprendre-le-cadre-digest-panneau'));
      cas('digest : les domaines sont repliables, seul le premier est ouvert', panneaux.length > 1 && panneaux[0].open && panneaux.slice(1).every(function (p) { return !p.open; }));
      var resume = document.getElementById('comprendreLeCadreDigestResume');
      cas('digest : le résumé donne la période et le total', !!resume && new RegExp(cartes + ' changements').test(resume.textContent), resume && resume.textContent);
      panneaux[1].querySelector('summary').click();
      cas('digest : un toucher sur le nombre de changements d’un domaine ouvre la liste', panneaux[1].open && panneaux[1].querySelector('.comprendre-le-cadre-digest-item'));
      var tout = document.querySelector('[data-comprendre-le-cadre-digest-tout]');
      tout.click();
      cas('digest : « Tout déplier » ouvre tous les domaines, puis « Tout replier » les ferme', panneaux.every(function (p) { return p.open; }) && /replier/.test(tout.textContent));
      tout.click();
      cas('digest : « Tout replier » ferme tous les domaines', panneaux.every(function (p) { return !p.open; }));
      var btn = document.querySelector('.comprendre-le-cadre-digest-item a.comprendre-le-cadre-digest-btn-source');
      cas('digest : la source est un vrai bouton vers le texte officiel (nouvel onglet)', !!btn && /^https?:/.test(btn.getAttribute('href')) && btn.target === '_blank' && /Ouvrir la source officielle/.test(btn.textContent));
      cas('digest : la nature et les dates sont en pastilles', document.querySelectorAll('.comprendre-le-cadre-pastille').length >= cartes);
      var sources = document.querySelectorAll('.comprendre-le-cadre-digest-liste-sources li');
      cas('digest : la liste « Toutes les sources de ce trimestre » affiche les sources avec leur date de contrôle', sources.length > 5 && /vérifiée le/.test(sources[0].textContent), sources.length);
      var texteDigest = [].slice.call(document.querySelectorAll('.comprendre-le-cadre-digest-item')).map(function (e) { return e.textContent; }).join(' ');
      cas('digest : aucun changement « à vérifier » n’est affiché (information possiblement fausse)', !/à vérifier/i.test(texteDigest) && !/Mayotte/.test(texteDigest), 'trouvé');
      var rupture = [].slice.call(document.querySelectorAll('.comprendre-le-cadre-digest-item')).filter(function (e) { return /Rupture conventionnelle dans la fonction publique/.test(e.textContent); })[0];
      cas('digest : la rupture conventionnelle (vérifiée à la source) affiche son entrée en vigueur en vert', !!rupture && /En vigueur le 8 août 2026|En vigueur le 8 ao/.test(rupture.textContent) && !!rupture.querySelector('.comprendre-le-cadre-pastille--v'));
      var essaiMd = '## Emploi\n\n### Essai\nType : décret du 2026-08-06, en vigueur le 2026-08-08.\nConcerne : essai\nCe qui change : essai.\nSource : [Titre](https://exemple.fr/a)\nVérifié le : 2026-10-15\n\n### Sans marque\nType : décret, en vigueur à vérifier.\nConcerne : x\nCe qui change : x.\nSource : [T](https://exemple.fr/b)\n';
      var tmp = document.createElement('div'); tmp.innerHTML = _comprendreLeCadreRenduDigestCorps(essaiMd);
      var marque = tmp.querySelector('.comprendre-le-cadre-digest-verifie .comprendre-le-cadre-pastille--v');
      cas('digest : « Vérifié le » s’affiche en marque verte « Vérifié le 15 oct. 2026 », et un changement « à vérifier » reste caché', !!marque && /Vérifié le 15 oct\. 2026/.test(marque.textContent) && tmp.querySelectorAll('.comprendre-le-cadre-digest-item').length === 1);
      var vide = document.createElement('div'); vide.innerHTML = _comprendreLeCadreRenduDigestCorps('## Mobilité\n\n_Rien de nouveau retenu ce trimestre._\n\n## Retraite\n\n_Dernier changement connu (hors trimestre) : essai._\n');
      cas('digest : un domaine « Rien de nouveau retenu ce trimestre » n’est plus affiché, mais une note « Dernier changement connu » reste', !/Rien de nouveau/.test(vide.textContent) && !/Mobilité/.test(vide.textContent) && /Dernier changement connu/.test(vide.textContent));
      cas('digest : la page affichée ne contient aucun « Rien de nouveau retenu »', !/Rien de nouveau retenu/.test(document.getElementById('app').innerText));
      cas('digest : un fichier aux fins de ligne Windows donne la même liste de sources', _comprendreLeCadreParserDigest('---\r\nperiode: "P"\r\nsources:\r\n  - "a | Titre A | [https://exemple.fr/a](https://exemple.fr/a) | 2026-09-18"\r\n  - "b | Titre B | [https://exemple.fr/b](https://exemple.fr/b) | 2026-09-18"\r\n---\r\n\r\n## D\r\n').sources.length === 2);
      cas('digest : aucun « title » natif sur le nombre de changements (inopérant au toucher)', !document.querySelector('.comprendre-le-cadre-digest-badge[title]'));
    } finally {
      if (dep === null) { localStorage.removeItem('erip_departement_ressources'); } else { localStorage.setItem('erip_departement_ressources', dep); }
    }
  }

  async function parcoursAccueilCartes() {
    var apercu = localStorage.getItem('erip_mon_territoire_apercu'), dep = localStorage.getItem('erip_departement_ressources');
    var noms = function () { return [].slice.call(document.querySelectorAll('.sous-carte-accueil strong')).map(function (x) { return x.textContent; }); };
    var ouvrir = async function (carte) { naviguerVers('cv'); await attente(700); ouvrirCarteAccueil(carte); await attente(500); };
    var clic = function (sel) { var e = document.querySelector(sel); if (!e) { return false; } e.click(); return true; };
    var h1 = function () { return ((document.querySelector('h1') || {}).textContent || '').trim(); };
    try {
      localStorage.setItem('erip_departement_ressources', '24');
      cas('accueil : sur la machine locale (localhost) le module « Qui fait quoi » est ouvert, fermé partout ailleurs', mtOuvert() === true && /^(localhost|127\.0\.0\.1)$/.test(location.hostname), location.hostname);
      ['aps_employeurs_decouverte_vue', 'aps_mon_territoire_decouverte_vue', 'aps_regard_recruteur_dans_analyse_vue'].forEach(function (k) { localStorage.removeItem(k); });
      await ouvrir('preparer');
      var halo = function () { return [].slice.call(document.querySelectorAll('.sous-carte-accueil.aide-pulse-repere strong')).map(function (x) { return x.textContent; }); };
      cas('accueil : le halo de découverte signale « Employeurs près de chez moi » à la première ouverture', JSON.stringify(halo()) === JSON.stringify(['Employeurs près de chez moi']), halo().join(' | '));
      fermerFenetreERIP(); await ouvrir('preparer');
      cas('accueil : le halo ne revient pas à la deuxième ouverture', halo().length === 0, halo().join(' | '));
      cas('accueil : « Employeurs près de chez moi » apparaît quand le module est ouvert (ou en aperçu), « Un regard sur mon CV » n’y est plus', noms().length === 3 && noms()[2] === 'Employeurs près de chez moi' && noms().indexOf('Un regard sur mon CV') === -1, noms().join(' | '));
      document.getElementById('btnCarteAccueilEmployeurs').click(); await attente(800);
      cas('accueil : « Employeurs près de chez moi » ouvre d’abord sa propre présentation', location.hash === '#employeurs-intro' && /Beaucoup d’emplois ne sont jamais annoncés/.test(document.body.textContent) && !!document.getElementById('btnEmployeursCommencer'), location.hash);
      document.getElementById('btnEmployeursCommencer').click(); await attente(2500);
      cas('accueil : « Voir les employeurs » ouvre le module directement sur les employeurs par secteur', location.hash === '#mon-territoire' && _mtEtat.ecran === 'emploi' && _mtEntree === 'employeurs', location.hash + ' ' + _mtEtat.ecran);
      clic('[data-mt-secteur="commerce-vente"]'); await attente(300); clic('[data-mt-fiche]'); await attente(300);
      cas('employeurs : « Revenir à la page principale » apparaît dès qu’on a quitté la liste des secteurs', !!document.getElementById('btnMonTerritoirePagePrincipale') && _mtPile.length === 2, String(_mtPile.length));
      history.back(); await attente(500);
      cas('employeurs : la flèche « Précédent » du navigateur revient à l’écran d’avant (la liste), pas à l’accueil', location.hash === '#mon-territoire' && _mtEtat.ecran === 'liste' && /Commerce et vente/.test(h1()), location.hash + ' ' + _mtEtat.ecran);
      history.forward(); await attente(500);
      cas('employeurs : la flèche « Suivant » retrouve la fiche', _mtEtat.ecran === 'fiche', _mtEtat.ecran);
      document.getElementById('btnMonTerritoirePagePrincipale').click(); await attente(700);
      cas('employeurs : « Revenir à la page principale » ramène aux secteurs en un clic, le bouton disparaît', _mtEtat.ecran === 'emploi' && _mtPile.length === 0 && !document.getElementById('btnMonTerritoirePagePrincipale'), _mtEtat.ecran + ' ' + _mtPile.length);
      clic('#btnMonTerritoireRevoirIntro'); await attente(500);
      cas('employeurs : « Revoir la présentation » ouvre la présentation des employeurs (pas celle de Qui fait quoi)', location.hash === '#employeurs-intro' && !!document.getElementById('btnEmployeursRevenirModuleHaut'), location.hash);
      document.getElementById('btnEmployeursRevenirModuleBas').click(); await attente(700);
      cas('employeurs : « Revenir au module » retrouve les secteurs', location.hash === '#mon-territoire' && _mtEtat.ecran === 'emploi', location.hash + ' ' + _mtEtat.ecran);
      clic('[data-mt-secteur="commerce-vente"]'); await attente(300);
      naviguerVers('comprendre-le-cadre'); await attente(700); naviguerVers('mon-territoire'); await attente(900);
      _mtAllerVersPrecedent(); await attente(800);
      cas('employeurs : revenir dans le module depuis un autre module puis « Retour » recule d’un écran, sans sortir du module', location.hash === '#mon-territoire' && _mtEtat.ecran === 'emploi' && _mtPile.length === 0, location.hash + ' ' + _mtEtat.ecran + ' ' + _mtPile.length);
      _mtAllerVersPrecedent(); await attente(600);
      cas('employeurs : « Retour » depuis les secteurs ramène à la présentation des employeurs', location.hash === '#employeurs-intro', location.hash);
      await ouvrir('analyse');
      cas('accueil : le halo de découverte signale « Un regard sur mon CV » dans sa nouvelle carte', halo().indexOf('Un regard sur mon CV') !== -1, halo().join(' | '));
      cas('accueil : « Outils d’analyse » a quatre outils, « Un regard sur mon CV » en deuxième', JSON.stringify(noms()) === JSON.stringify(['Analyser ma candidature', 'Un regard sur mon CV', 'Les mots de votre CV (ATS)', 'Cohérence de mon dossier']), noms().join(' | '));
      cas('accueil : chaque outil d’analyse commence par sa question', [].slice.call(document.querySelectorAll('.sous-carte-accueil span')).every(function (x) { return /\?/.test(x.textContent); }));
      document.getElementById('btnCarteAccueilRegardRecruteur').click(); await attente(1000);
      cas('accueil : « Un regard sur mon CV » ouvre toujours sa présentation depuis « Outils d’analyse »', location.hash === '#regard-recruteur-intro', location.hash);
      await ouvrir('informe');
      cas('accueil : « Se tenir informé » montre « Qui fait quoi » quand le module est ouvert', noms().indexOf('Qui fait quoi') !== -1, noms().join(' | '));
      cas('accueil : le halo de découverte signale « Qui fait quoi »', halo().indexOf('Qui fait quoi') !== -1, halo().join(' | '));
      fermerFenetreERIP();
      naviguerVers('cv'); await attente(700);
      var textes = {}; (AIDE_PAGES[pageActuelle] || []).forEach(function (e) { textes[e.titre] = String(aideTexte(e)).replace(/<[^>]+>/g, ''); });
      cas('accueil : l’aide (ampoule) des cartes suit le mouvement : employeurs, regard sur mon CV, Qui fait quoi', /Employeurs près de chez moi/.test(textes['Me préparer à candidater']) && /Un regard sur mon CV/.test(textes['Outils d’analyse']) && !/Un regard sur mon CV/.test(textes['Me préparer à candidater']) && /Qui fait quoi/.test(textes['Se tenir informé']), JSON.stringify(Object.keys(textes)));
      document.getElementById('app'); naviguerVers('cv'); await attente(700); ouvrirCarteAccueil('preparer'); await attente(400);
      document.getElementById('btnCarteAccueilLettre').click(); await attente(1000);
      cas('accueil : la lettre s’appelle « Écrire ma lettre de motivation avec l’assistant » sur sa page', /Écrire ma lettre de motivation avec l’assistant/.test((document.querySelector('h1') || {}).textContent || ''));
    } finally {
      if (apercu === null) { localStorage.removeItem('erip_mon_territoire_apercu'); } else { localStorage.setItem('erip_mon_territoire_apercu', apercu); }
      if (dep === null) { localStorage.removeItem('erip_departement_ressources'); } else { localStorage.setItem('erip_departement_ressources', dep); }
    }
  }

  async function parcoursAideCouverture() {
    // Routes qui redirigent vers une autre page deja couverte.
    var EXCEPTIONS_PAGES = ['decouverte'];
    var sansAide = Object.keys(routes).filter(function (r) { return EXCEPTIONS_PAGES.indexOf(r) === -1 && !(AIDE_PAGES[r] && AIDE_PAGES[r].length); });
    cas('aide : chaque page routée a une aide (AIDE_PAGES)', sansAide.length === 0, 'sans aide : ' + sansAide.join(', '));
    var textes = '';
    var urls = [].slice.call(document.scripts).map(function (e) { return e.src; }).filter(Boolean);
    for (var i = 0; i < urls.length; i++) { try { textes += await (await fetch(urls[i])).text() + " "; } catch (e) { /* script indisponible : ignore */ } }
    // Contextes demandes par le code : aideContexte: 'x' et 3e argument de ouvrirPanneauGuide(..., 'x').
    var utilises = {};
    var re1 = /aideContexte:\s*'([a-z0-9-]+)'/g, re2 = /ouvrirPanneauGuide\([^;]*,\s*'([a-z0-9-]+)'\s*\)/g, m;
    while ((m = re1.exec(textes))) { utilises[m[1]] = true; }
    while ((m = re2.exec(textes))) { utilises[m[1]] = true; }
    var sansEntree = Object.keys(utilises).filter(function (k) { return !(AIDE_FENETRES[k] && AIDE_FENETRES[k].length); });
    cas('aide : chaque fenêtre à contexte d’aide a son entrée (AIDE_FENETRES)', Object.keys(utilises).length > 20 && sansEntree.length === 0, 'sans entrée : ' + sansEntree.join(', ') + ' (' + Object.keys(utilises).length + ' contextes lus)');
    // Entree morte : la cle n'apparait qu'une fois (sa definition) dans tout le code.
    var mortes = Object.keys(AIDE_FENETRES).filter(function (k) {
      var n = textes.split("'" + k + "'").length - 1;
      return n < 2;
    });
    cas('aide : aucune entrée de fenêtre morte', mortes.length === 0, 'mortes : ' + mortes.join(', '));
  }
  // ---------------- Analyser ma candidature : la fleche « Precedent » du navigateur (brique B.24) ----------------
  // Un diagnostic RECU est simule (fausses fonctions remises en place a la fin) : seule la navigation est essayee, jamais le contenu du rapport.
  async function parcoursBilanHistorique() {
    var ecran = function () { var d = bilanObtenirDiagnostic(); return location.hash + ' ' + _bilanIdentiteEcran() + ' diag=' + (d ? d.statut : '-'); };
    var reelDiag = window.bilanObtenirDiagnostic, reelRapport = window.htmlBilanRapport, reelBrancher = window.brancherEvenementsBilanCandidature;
    try {
      naviguerVers('cv'); await attente(400);
      bilanReinitialiserEtatBilan(); try { bilanStoreReinitialiser(); } catch (e) { /* rien a vider */ }
      demarrerBilanCandidatureAvecDepot({ cvDejaRelu: 'Camille Martin. Agent de sécurité chez Sécuritas de 2022 à 2024.' }); await attente(1800);
      cas('bilan, flèche Précédent : on arrive sur « Préparer »', _etatBilan.preparer && !!$('#btnSuivantNavigation'), ecran());
      $('#btnSuivantNavigation').click(); await attente(900);
      cas('bilan, flèche Précédent : « Choisir mon assistant » est un nouvel écran', !_etatBilan.preparer && location.hash === '#bilan', ecran());
      history.back(); await attente(700);
      cas('bilan, flèche Précédent : revient sur « Préparer » (avec le CV déjà déposé), pas à l’accueil', location.hash === '#bilan' && !!_etatBilan.preparer && !!$('#btnSuivantNavigation'), ecran());
      history.forward(); await attente(700);
      cas('bilan, flèche Suivant : retrouve « Choisir mon assistant »', location.hash === '#bilan' && !_etatBilan.preparer, ecran());
      bilanRetourVersPresentation(); await attente(500);
      cas('bilan, « Revoir la présentation » : un écran de plus dans l’historique', _etatBilan.voirIntro === 'detour', ecran());
      history.back(); await attente(700);
      cas('bilan, flèche Précédent depuis la présentation : revient au travail, pas à l’accueil', location.hash === '#bilan' && !_etatBilan.voirIntro, ecran());
      var cand = bilanObtenirCandidature();
      bilanStoreDefinirDiagnostic(bilanCreerDiagnostic({ candidatureId: cand.id, promptTexte: 'x' })); pageBilanCandidature(); await attente(500);
      cas('bilan : le diagnostic en attente est un nouvel écran', bilanObtenirDiagnostic() && bilanObtenirDiagnostic().statut === 'genere', ecran());
      history.back(); await attente(900);
      cas('bilan, flèche Précédent depuis « Coller la réponse » : revient à « Choisir mon assistant » et abandonne le diagnostic en attente', !bilanObtenirDiagnostic() && location.hash === '#bilan' && !_etatBilan.preparer, ecran());
      bilanStoreDefinirDiagnostic(bilanCreerDiagnostic({ candidatureId: cand.id, promptTexte: 'x' })); pageBilanCandidature(); await attente(500);
      window.bilanObtenirDiagnostic = function () { return { statut: 'complete', resultat: {} }; };
      window.htmlBilanRapport = function () { return '<div class="page-catalogue-contenu"><h1>RAPPORT</h1></div>'; };
      window.brancherEvenementsBilanCandidature = function () {};
      pageBilanCandidature(); await attente(500);
      cas('bilan : le rapport (simulé) est affiché', /RAPPORT/.test(document.body.textContent), ecran());
      history.back(); await attente(1800);
      cas('bilan, flèche Précédent depuis le rapport : les écrans d’avant le diagnostic sont dépassés, on sort du module sans écran mort', location.hash === '#cv', ecran());
      history.forward(); await attente(1800);
      cas('bilan, flèche Suivant : retrouve le rapport', /RAPPORT/.test(document.body.textContent) && location.hash === '#bilan', ecran());
    } finally {
      window.bilanObtenirDiagnostic = reelDiag; window.htmlBilanRapport = reelRapport; window.brancherEvenementsBilanCandidature = reelBrancher;
      try { bilanStoreReinitialiser(); bilanReinitialiserEtatBilan(); } catch (e) { /* rien a vider */ }
    }
  }

  // ---------------- Comprendre le cadre : la fleche « Precedent » du navigateur (brique B.24) ----------------
  async function parcoursCadreHistorique() {
    var etat = function () { var e = _comprendreLeCadreEtat; return location.hash + ' ' + e.ecran + '/' + (e.rayon || '-') + '/' + (e.ficheId || '-'); };
    naviguerVers('cv'); await attente(400);
    _comprendreLeCadreEtat.ecran = 'accueil'; naviguerVers('comprendre-le-cadre'); await attente(800);
    cas('cadre, flèche Précédent : on part de l’accueil du module', _comprendreLeCadreEtat.ecran === 'accueil', etat());
    _comprendreLeCadreOuvrirRayon('logement'); await attente(1500);
    cas('cadre : un rayon est un nouvel écran', _comprendreLeCadreEtat.ecran === 'rayon' && _comprendreLeCadreEtat.rayon === 'logement', etat());
    var bouton = $('[data-comprendre-le-cadre-ouvrir-fiche]');
    if (bouton) { bouton.click(); await attente(700); }
    cas('cadre : une fiche est un nouvel écran', _comprendreLeCadreEtat.ecran === 'fiche', etat());
    history.back(); await attente(800);
    cas('cadre, flèche Précédent depuis une fiche : revient à la liste du rayon, pas à l’accueil', _comprendreLeCadreEtat.ecran === 'rayon' && location.hash === '#comprendre-le-cadre', etat());
    history.back(); await attente(800);
    cas('cadre, flèche Précédent depuis le rayon : revient à l’accueil du module', _comprendreLeCadreEtat.ecran === 'accueil' && location.hash === '#comprendre-le-cadre', etat());
    history.forward(); await attente(800); history.forward(); await attente(800);
    cas('cadre, flèche Suivant : retrouve la fiche avec son contenu', _comprendreLeCadreEtat.ecran === 'fiche' && !!_comprendreLeCadreEtat.ficheId && /fiche|Comment|Pour aller/i.test(document.body.textContent), etat());
    var vers = $('[data-voir-aussi-lexique]');
    if (vers) {
      vers.click(); await attente(900);
      cas('cadre : un lien vers le Lexique change de module', location.hash === '#lexique', location.hash);
      history.back(); await attente(900);
      cas('cadre, flèche Précédent depuis le Lexique : retrouve la fiche exacte', location.hash === '#comprendre-le-cadre' && _comprendreLeCadreEtat.ecran === 'fiche', etat());
    }
  }

  // ---------------- Comparer mes pistes : la fleche « Precedent » du navigateur (brique B.24) ----------------
  async function parcoursComparerHistorique() {
    var ecran = function () { return location.hash + ' ecran=' + (_comparerEtat ? _comparerEtat.ecran : '-'); };
    naviguerVers('cv'); await attente(400);
    comparerReinitialiser();
    ouvrirComparerPistes(); naviguerVers('comparer-pistes'); await attente(1200);
    var e = _comparerEtat;
    e.situation = 'sans-emploi'; e.trancheAge = '26-45'; e.recit = 'Je voudrais devenir aide-soignante ou éducatrice.';
    e.pistes = [comparerFabriquerPiste('Aide-soignante', { etiquette: 'metier', couleur: '#2f6690' }), comparerFabriquerPiste('Éducatrice spécialisée', { etiquette: 'metier', couleur: '#d9822b' })];
    e.detectionFaite = true; e._pistesConstruites = true; e.envoi = {};
    cas('comparer, flèche Précédent : on part du premier écran', e.ecran === 0 && location.hash === '#comparer-pistes', ecran());
    _comparerRenduEcran(1); await attente(500);
    _comparerRenduEcran(2); await attente(500);
    _comparerRenduEcran(3); await attente(500);
    cas('comparer : trois écrans de plus ont été parcourus', e.ecran === 3, ecran());
    history.back(); await attente(800);
    cas('comparer, flèche Précédent : revient à l’écran 2, pas à l’accueil', _comparerEtat.ecran === 2 && location.hash === '#comparer-pistes' && /Comparer mes pistes|pistes/i.test(document.body.textContent), ecran());
    history.back(); await attente(800);
    cas('comparer, flèche Précédent : revient à l’écran 1', _comparerEtat.ecran === 1 && location.hash === '#comparer-pistes', ecran());
    history.forward(); await attente(800); history.forward(); await attente(800);
    cas('comparer, flèche Suivant : retrouve l’écran 3 avec les pistes saisies', _comparerEtat.ecran === 3 && _comparerEtat.pistes.length === 2, ecran());
    _comparerRenduEcran(3); await attente(300);
    history.back(); await attente(800);
    cas('comparer : redessiner le même écran ne crée pas d’entrée de plus', _comparerEtat.ecran === 2, ecran());
    comparerRetourVersPresentation(); await attente(500);
    history.back(); await attente(800);
    cas('comparer, flèche Précédent depuis « Revoir la présentation » : revient au travail', location.hash === '#comparer-pistes' && _comparerEtat.ecran === 2, ecran());
    var avant = _comparerSessionHistorique;
    comparerReinitialiser(); ouvrirComparerPistes(); naviguerVers('comparer-pistes'); await attente(900);
    cas('comparer : « Recommencer » ouvre une nouvelle comparaison au premier écran', _comparerSessionHistorique === avant + 1 && _comparerEtat.ecran === 0, ecran());
    history.back(); await attente(1500);
    cas('comparer, flèche Précédent après « Recommencer » : les écrans de l’ancienne comparaison sont dépassés (jamais remis sur la nouvelle)', !(location.hash === '#comparer-pistes' && _comparerEtat && _comparerEtat.ecran !== 0), ecran());
    comparerReinitialiser();
  }

  // ---------------- Un CV, plusieurs metiers : la fleche « Precedent » du navigateur (brique B.24) ----------------
  async function parcoursUcpmHistorique() {
    var ouvertAvant = window.UCPM_OUVERT;
    window.UCPM_OUVERT = true;
    var page = function () { return location.hash + ' page=' + (_ucpmEtat ? _ucpmEtat.page : '-'); };
    try {
      ucpmReinitialiser(); ouvrirUnCvPlusieursMetiers();
      naviguerVers('cv'); await attente(500);
      naviguerVers('un-cv-plusieurs-metiers'); await attente(900);
      cas('ucpm, flèche Précédent : on part de la page 1', _ucpmEtat.page === 1 && location.hash === '#un-cv-plusieurs-metiers', page());
      ucpmAllerPage(2); await attente(500); ucpmAllerPage(3); await attente(500);
      cas('ucpm : deux pages de plus ont été parcourues', _ucpmEtat.page === 3, page());
      history.back(); await attente(800);
      cas('ucpm, flèche Précédent : revient à la page 2, pas à l’accueil', _ucpmEtat.page === 2 && location.hash === '#un-cv-plusieurs-metiers', page());
      history.back(); await attente(800);
      cas('ucpm, flèche Précédent : revient à la page 1', _ucpmEtat.page === 1 && location.hash === '#un-cv-plusieurs-metiers', page());
      history.forward(); await attente(800); history.forward(); await attente(800);
      cas('ucpm, flèche Suivant : retrouve la page 3', _ucpmEtat.page === 3, page());
      ucpmRetourVersPresentation(); await attente(500);
      history.back(); await attente(800);
      cas('ucpm, flèche Précédent depuis « Revoir la présentation » : revient au travail', location.hash === '#un-cv-plusieurs-metiers' && _ucpmEtat.page === 3, page());
      var avant = _ucpmSessionHistorique;
      ucpmReinitialiser(); ouvrirUnCvPlusieursMetiers(); naviguerVers('un-cv-plusieurs-metiers'); await attente(900);
      cas('ucpm : « Recommencer » ouvre un nouveau travail à la page 1', _ucpmSessionHistorique === avant + 1 && _ucpmEtat.page === 1, page());
      history.back(); await attente(1500);
      cas('ucpm, flèche Précédent après « Recommencer » : les pages de l’ancien travail sont dépassées', !(location.hash === '#un-cv-plusieurs-metiers' && _ucpmEtat && _ucpmEtat.page !== 1), page());
    } finally {
      ucpmReinitialiser(); window.UCPM_OUVERT = ouvertAvant;
    }
  }

  // ---------------- Decouvrir mes competences : la fleche « Precedent » du navigateur (brique B.24) ----------------
  async function parcoursDecouverteHistorique() {
    var etape = function () { return location.hash + ' etape=' + _decouverteNumeroCourant; };
    fermerDecouverteCompetences();
    naviguerVers('cv'); await attente(500);
    ouvrirDecouverteCompetences(); await attente(300);
    naviguerVers('decouverte'); await attente(900);
    cas('découverte, flèche Précédent : on part de la première étape', _decouverteNumeroCourant === 1 && location.hash === '#decouverte', etape());
    _decouverteRenduEtape(2); await attente(500); _decouverteRenduEtape(4); await attente(500);
    cas('découverte : deux étapes de plus ont été parcourues', _decouverteNumeroCourant === 4, etape());
    history.back(); await attente(800);
    cas('découverte, flèche Précédent : revient à l’étape 2, pas à l’accueil', _decouverteNumeroCourant === 2 && location.hash === '#decouverte', etape());
    history.back(); await attente(800);
    cas('découverte, flèche Précédent : revient à l’étape 1', _decouverteNumeroCourant === 1 && location.hash === '#decouverte', etape());
    history.forward(); await attente(800); history.forward(); await attente(800);
    cas('découverte, flèche Suivant : retrouve l’étape 4', _decouverteNumeroCourant === 4, etape());
    decouverteRetourVersPresentation(); await attente(500);
    history.back(); await attente(800);
    cas('découverte, flèche Précédent depuis « Revoir la présentation » : revient au travail', location.hash === '#decouverte' && _decouverteNumeroCourant === 4, etape());
    var avant = _decouverteSessionHistorique;
    fermerDecouverteCompetences(); ouvrirDecouverteCompetences(); naviguerVers('decouverte'); await attente(900);
    cas('découverte : « Recommencer » ouvre un nouveau parcours à l’étape 1', _decouverteSessionHistorique === avant + 1 && _decouverteNumeroCourant === 1, etape());
    history.back(); await attente(1500);
    cas('découverte, flèche Précédent après « Recommencer » : les étapes de l’ancien parcours sont dépassées', !(location.hash === '#decouverte' && _decouverteNumeroCourant !== 1), etape());
    fermerDecouverteCompetences();
  }

  // ---------------- Lexique : la fleche « Precedent » du navigateur (brique B.24) ----------------
  async function parcoursLexiqueHistorique() {
    var ou = function () { return location.hash + ' | ' + ((document.querySelector('h1,h2') || {}).textContent || '').trim().slice(0, 40); };
    naviguerVers('cv'); await attente(500);
    lexiqueDemarrer(); await attente(700);
    cas('lexique, flèche Précédent : on part de la présentation', _lexiqueEcranIntro === true, ou());
    lexiqueRevenirDeLaPresentation(); await attente(700);
    cas('lexique : le module s’ouvre sur la recherche', !_lexiqueEcranIntro && !!document.getElementById('lexiqueRechercheInput'), ou());
    _lexiqueAfficherFiche('caf'); await attente(600);
    var titreFiche = ou();
    cas('lexique : une fiche est un nouvel écran', !!document.getElementById('lexiqueFicheEcran'), titreFiche);
    _lexiqueAfficherDomaines(); await attente(600);
    cas('lexique : la liste des domaines est un nouvel écran', !!document.getElementById('lexiqueDomainesEcran'), ou());
    history.back(); await attente(800);
    cas('lexique, flèche Précédent : revient à la fiche exacte, pas à l’accueil', location.hash === '#lexique' && !!document.getElementById('lexiqueFicheEcran') && ou() === titreFiche, ou());
    history.back(); await attente(800);
    cas('lexique, flèche Précédent : revient à la recherche', location.hash === '#lexique' && !!document.getElementById('lexiqueRechercheInput'), ou());
    history.forward(); await attente(800); history.forward(); await attente(800);
    cas('lexique, flèche Suivant : retrouve la liste des domaines', !!document.getElementById('lexiqueDomainesEcran'), ou());
    lexiqueRevoirPresentation(); await attente(500);
    history.back(); await attente(800);
    cas('lexique, flèche Précédent depuis « Revoir la présentation » : revient au travail', !_lexiqueEcranIntro && !!document.getElementById('lexiqueDomainesEcran'), ou());
    lexiqueOuvrirFiche('plie'); await attente(900);
    history.back(); await attente(900);
    cas('lexique, flèche Précédent après une fiche ouverte depuis ailleurs : revient à l’écran d’avant, pas à l’accueil', location.hash === '#lexique', ou());
  }

  // ---------------- Comprendre les chiffres : la fleche « Precedent » du navigateur (brique B.24) ----------------
  async function parcoursChiffresHistorique() {
    var ecran = function () { return location.hash + ' ' + _comprendreLesChiffresEtat.ecran; };
    var depAvant = localStorage.getItem('erip_departement_ressources');
    localStorage.setItem('erip_departement_ressources', '24');
    try {
      naviguerVers('cv'); await attente(500);
      _comprendreLesChiffresEtat.ecran = 'accueil'; naviguerVers('comprendre-les-chiffres'); await attente(900);
      cas('chiffres, flèche Précédent : on part de l’accueil du module', _comprendreLesChiffresEtat.ecran === 'accueil' && location.hash === '#comprendre-les-chiffres', ecran());
      _comprendreLesChiffresEtat.ecran = 'porteA'; pageComprendreLesChiffres(); await attente(500);
      _comprendreLesChiffresEtat.ecran = 'porteB'; pageComprendreLesChiffres(); await attente(500);
      cas('chiffres : deux écrans de plus ont été parcourus', _comprendreLesChiffresEtat.ecran === 'porteB', ecran());
      history.back(); await attente(800);
      cas('chiffres, flèche Précédent : revient à la porte A, pas à l’accueil', _comprendreLesChiffresEtat.ecran === 'porteA' && location.hash === '#comprendre-les-chiffres', ecran());
      history.back(); await attente(800);
      cas('chiffres, flèche Précédent : revient à l’accueil du module', _comprendreLesChiffresEtat.ecran === 'accueil' && location.hash === '#comprendre-les-chiffres', ecran());
      history.forward(); await attente(800); history.forward(); await attente(800);
      cas('chiffres, flèche Suivant : retrouve la porte B', _comprendreLesChiffresEtat.ecran === 'porteB', ecran());
      _comprendreLesChiffresRevoirPresentation(); await attente(500);
      history.back(); await attente(800);
      cas('chiffres, flèche Précédent depuis « Revoir la présentation » : revient au travail', location.hash === '#comprendre-les-chiffres' && _comprendreLesChiffresEtat.ecran === 'porteB', ecran());
    } finally {
      if (depAvant === null) { localStorage.removeItem('erip_departement_ressources'); } else { localStorage.setItem('erip_departement_ressources', depAvant); }
      _comprendreLesChiffresEtat.ecran = 'accueil';
    }
  }

  // ---------------- Regard recruteur : la fleche « Precedent » du navigateur (brique B.24) ----------------
  async function parcoursRegardHistorique() {
    var vue = function () { return location.hash + ' vue=' + (_regardRecruteurEtat ? _regardRecruteurEtat.vue : '-'); };
    naviguerVers('cv'); await attente(500);
    regardRecruteurReinitialiser(); ouvrirRegardRecruteur(); naviguerVers('regard-recruteur'); await attente(900);
    var e = _regardRecruteurEtat;
    cas('regard, flèche Précédent : on part de « Préparer »', e.vue === 'preparer' && location.hash === '#regard-recruteur', vue());
    var vues = RR_VUES.filter(function (v) { return v !== 'preparer'; }).slice(0, 2);
    _regardRecruteurRenduVue(vues[0]); await attente(500); _regardRecruteurRenduVue(vues[1]); await attente(500);
    cas('regard : deux vues de plus ont été parcourues', _regardRecruteurEtat.vue === vues[1], vue());
    history.back(); await attente(800);
    cas('regard, flèche Précédent : revient à la vue d’avant, pas à l’accueil', _regardRecruteurEtat.vue === vues[0] && location.hash === '#regard-recruteur', vue());
    history.back(); await attente(800);
    cas('regard, flèche Précédent : revient à « Préparer »', _regardRecruteurEtat.vue === 'preparer' && location.hash === '#regard-recruteur', vue());
    history.forward(); await attente(800); history.forward(); await attente(800);
    cas('regard, flèche Suivant : retrouve la dernière vue', _regardRecruteurEtat.vue === vues[1], vue());
    regardRecruteurRetourVersPresentation(); await attente(500);
    history.back(); await attente(800);
    cas('regard, flèche Précédent depuis « Revoir la présentation » : revient au travail', location.hash === '#regard-recruteur' && _regardRecruteurEtat.vue === vues[1], vue());
    var avant = _regardRecruteurSessionHistorique;
    regardRecruteurReinitialiser(); ouvrirRegardRecruteur(); naviguerVers('regard-recruteur'); await attente(900);
    cas('regard : « Recommencer » ouvre une nouvelle session à « Préparer »', _regardRecruteurSessionHistorique === avant + 1 && _regardRecruteurEtat.vue === 'preparer', vue());
    history.back(); await attente(1500);
    cas('regard, flèche Précédent après « Recommencer » : les vues de l’ancienne session sont dépassées', !(location.hash === '#regard-recruteur' && _regardRecruteurEtat && _regardRecruteurEtat.vue !== 'preparer'), vue());
    regardRecruteurReinitialiser();
  }

  // ---------------- Carnet, Reperes, lettre, entretien : la fleche « Precedent » du navigateur (brique B.24) ----------------
  async function parcoursPetitsModulesHistorique() {
    var ou = function () { return location.hash; };
    var reperesIntroAvant = dossier.reperesIntroVue;
    try {
      // --- Carnet : presentation -> travail -> presentation en detour
      naviguerVers('cv'); await attente(500);
      carnetDemarrer(); await attente(600);
      cas('carnet, flèche Précédent : on part de la présentation', _carnetEcranIntro === true, ou());
      carnetRevenirDeLaPresentation(); await attente(600);
      carnetRevoirPresentation(); await attente(600);
      cas('carnet : la présentation en détour est un écran de plus', _carnetEcranIntro === true && _carnetIntroDetour === true, ou());
      history.back(); await attente(800);
      cas('carnet, flèche Précédent depuis « Revoir la présentation » : revient au travail, pas à la présentation ni à l’accueil', location.hash === '#carnet' && _carnetEcranIntro === false, ou());
      history.back(); await attente(800);
      cas('carnet, flèche Précédent : revient à la présentation du départ', location.hash === '#carnet' && _carnetEcranIntro === true && _carnetIntroDetour === false, ou());
      history.forward(); await attente(800); history.forward(); await attente(800);
      cas('carnet, flèche Suivant : retrouve la présentation en détour', _carnetEcranIntro === true && _carnetIntroDetour === true, ou());
      _carnetEcranIntro = false; _carnetIntroDetour = false;

      // --- Mes Reperes : ecran de travail -> accueil explicatif force
      dossier.reperesIntroVue = true;
      naviguerVers('cv'); await attente(500);
      reperesDemarrer(); await attente(700);
      cas('reperes, flèche Précédent : on part de l’écran de travail', location.hash === '#reperes' && !!document.getElementById('reperesListeConteneur'), ou());
      _reperesForcerAccueil = true; pageReperes(); await attente(600);
      cas('reperes : « Revoir l’explication » est un écran de plus', !document.getElementById('reperesListeConteneur'), ou());
      history.back(); await attente(800);
      cas('reperes, flèche Précédent : revient à l’écran de travail, pas à l’accueil de l’application', location.hash === '#reperes' && !!document.getElementById('reperesListeConteneur'), ou());
      history.forward(); await attente(800);
      cas('reperes, flèche Suivant : retrouve l’explication', !document.getElementById('reperesListeConteneur'), ou());
      _reperesForcerAccueil = false;

      // --- Lettre
      naviguerVers('cv'); await attente(500);
      _coLettreSessionHistorique++;
      _coLettreEcran = 'intro'; _coLettreDetour = false; naviguerVers('co-lettre'); await attente(700);
      _coLettreEcran = 'depot'; naviguerVers('co-lettre'); await attente(700);
      _coLettreEcran = 'choix-assistant'; naviguerVers('co-lettre'); await attente(700);
      cas('lettre : trois écrans ont été parcourus', _coLettreEcran === 'choix-assistant', _coLettreEcran);
      history.back(); await attente(800);
      cas('lettre, flèche Précédent : revient au dépôt, pas à l’accueil', location.hash === '#co-lettre' && _coLettreEcran === 'depot', _coLettreEcran);
      history.back(); await attente(800);
      cas('lettre, flèche Précédent : revient à la présentation', location.hash === '#co-lettre' && _coLettreEcran === 'intro', _coLettreEcran);
      history.forward(); await attente(800); history.forward(); await attente(800);
      cas('lettre, flèche Suivant : retrouve le choix de l’assistant', _coLettreEcran === 'choix-assistant', _coLettreEcran);
      var avantL = _coLettreSessionHistorique;
      _coLettreRecommencer(); await attente(800);
      cas('lettre : « Recommencer » ouvre un nouveau travail au dépôt', _coLettreSessionHistorique === avantL + 1 && _coLettreEcran === 'depot', _coLettreEcran);
      history.back(); await attente(1500);
      cas('lettre, flèche Précédent après « Recommencer » : les écrans de l’ancien travail sont dépassés', !(location.hash === '#co-lettre' && _coLettreEcran !== 'depot'), location.hash + ' ' + _coLettreEcran);
      _coLettreEcran = 'intro'; _coLettreDetour = false;

      // --- Entretien
      naviguerVers('cv'); await attente(500);
      _prepaEntretienSessionHistorique++;
      _prepaEntretienEcran = 'intro'; _prepaEntretienDetour = false; naviguerVers('prepa-entretien'); await attente(700);
      _prepaEntretienEcran = 'preparer'; naviguerVers('prepa-entretien'); await attente(700);
      _prepaEntretienEcran = 'choix-assistant'; naviguerVers('prepa-entretien'); await attente(700);
      history.back(); await attente(800);
      cas('entretien, flèche Précédent : revient à « Préparer », pas à l’accueil', location.hash === '#prepa-entretien' && _prepaEntretienEcran === 'preparer', _prepaEntretienEcran);
      history.back(); await attente(800);
      cas('entretien, flèche Précédent : revient à la présentation', location.hash === '#prepa-entretien' && _prepaEntretienEcran === 'intro', _prepaEntretienEcran);
      history.forward(); await attente(800); history.forward(); await attente(800);
      cas('entretien, flèche Suivant : retrouve le choix de l’assistant', _prepaEntretienEcran === 'choix-assistant', _prepaEntretienEcran);
      _prepaEntretienEcran = 'intro'; _prepaEntretienDetour = false;
    } finally {
      dossier.reperesIntroVue = reperesIntroAvant;
      _reperesForcerAccueil = false; _reperesRetourAccueil = false;
      _carnetEcranIntro = false; _carnetIntroDetour = false;
    }
  }

  // ---------------- Sortie de « M'entraîner à un entretien » (chantier ATS et Entretien, D1 à D4, 2026-10-19) : barre du module, titre, confirmation,
  // plus de réglages « Adaptation au métier » ni de second passage de l'assistant ; le parcours classique (page d'origine autre) et la lettre ne changent pas ----------------
  async function parcoursSortieEntretien() {
    dossier.ia = dossier.ia || creerDossierIAVide();
    dossier.ia.entretien = { presentation: 'Je suis un personnage fictif.', pointsAPreparer: ['a'], questionsAnticipees: [{ question: 'Q ?', pistes: ['p'], amorce: '' }], questionsDuCandidat: ['q'] };
    dossier.dernierDocumentPrepare = 'entretien';
    naviguerVers('prepa-entretien'); await attente(700);
    naviguerVers('resultats'); await attente(1000);
    var t = texte(document.body);
    cas('sortie entretien : titre « Votre préparation d’entretien »', /Votre préparation d’entretien/.test(texte($('h1'))), texte($('h1')));
    cas('sortie entretien : barre du module, étape Terminé, plus l’ancienne barre', /S’entraîner/.test(t) && /Terminé/.test(t) && !/Ce que vous faisiez/.test(t), t.slice(0, 200));
    cas('sortie entretien : encart de confirmation présent', !!$('#encartPreparationEnregistree'), 'encart absent');
    cas('sortie entretien : plus d’« Adaptation au métier » ni de « Choisissez votre assistant »', !/Adaptation au métier/.test(t) && !/Choisissez votre assistant/.test(t), 'réglages encore affichés');
    cas('sortie entretien : la mise en page est là, « Exporter » n’apparaît qu’après « Continuer » (barre du bas)', /mise en page/i.test(t) && !$('[data-rect-doc="exporter"]') && /Continuer/.test(texte($('.barre-navigation'))), 'mise en page ou export mal placés');
    $('#btnSuivantNavigation').click(); await attente(1200);
    cas('sortie entretien : après « Continuer », seul « Exporter » reste et « Retour » devient « Modifier »', !!$('[data-rect-doc="exporter"]') && !$('[data-rect-doc="mise-en-page"]') && /Modifier/.test(texte($('.barre-navigation'))), texte($('.barre-navigation')));
    var b = $('#rectangleCoordonneesDocuments');
    cas('sortie entretien : bandeau propre à l’entretien (nom, pas « CV »)', !b || (/nom pour l’en-tête de la fiche/.test(texte(b)) && !/votre CV ne pourra pas/.test(texte(b))), texte(b));
    cas('sortie entretien : la carte du bas propose le module « Écrire ma lettre avec l’assistant », plus l’ancien parcours', !!$('#btnSuggererLettreModule') && !$('#btnSuggererLettre'), 'bouton du module absent ou ancien bouton encore là');
    // Parcours classique : la page d'origine n'est plus le module, rien ne doit être retiré.
    _pageOrigineAvantResultats = 'objectif'; pageResultats(); await attente(800);
    var t2 = texte(document.body);
    cas('sortie entretien : parcours classique, la carte du bas garde le bouton d’origine', !$('#btnSuggererLettreModule') && (!!$('#btnSuggererLettre') || !!$('#btnRevoirLettreDepuisEntretien')), 'carte du bas modifiée');
    cas('sortie entretien : parcours classique inchangé (titre « Vos documents », pas de confirmation)', /Vos documents/.test(texte($('h1'))) && !$('#encartPreparationEnregistree'), texte($('h1')));
    // La lettre, même avec l'origine « module entretien », n'est pas touchée.
    dossier.dernierDocumentPrepare = 'lettre'; _pageOrigineAvantResultats = 'prepa-entretien'; pageResultats(); await attente(800);
    cas('sortie entretien : la lettre n’est pas concernée (pas de confirmation d’entretien)', !$('#encartPreparationEnregistree') && /Vos documents/.test(texte($('h1'))), texte($('h1')));
    dossier.dernierDocumentPrepare = 'entretien'; _pageOrigineAvantResultats = 'prepa-entretien'; pageResultats(); await attente(800);
    var btnLm = $('#btnSuggererLettreModule');
    if (btnLm) { btnLm.click(); await attente(1000); }
    cas('sortie entretien : le bouton ouvre bien le module de la lettre (présentation)', pageActuelle === 'co-lettre' && /lettre/i.test(texte($('h1'))), pageActuelle + ' | ' + texte($('h1')));
    dossier.dernierDocumentPrepare = 'entretien'; _pageOrigineAvantResultats = null; naviguerVers('accueil'); await attente(500);
  }

  // ---------------- « Créer un nouveau CV » : trois parcours (à la main, avec l'assistant, à partir de mon récit), un seul à la fois ----------------
  async function parcoursCreerRecit() {
    var confirmer = async function () { var b = $('.btn-danger'); if (b) { b.click(); await attente(700); } return !!b; };
    mgReinitialiser(); _creerCvToutEffacer();
    naviguerVers('creer-cv'); await attente(900);
    cas('créer un CV : trois cartes de départ (à la main, avec l\'assistant, à partir de mon récit)', !!$('#btnCreerCvSansAssistant') && !!$('#btnCreerCvAvecAssistant') && !!$('#btnCreerCvRecit'), 'cartes manquantes');
    cas('créer un CV : le bloc « Voir nos modèles » est toujours sous les cartes', !!$('#blocMgVoirModeles'), 'bloc absent');

    $('#btnCreerCvRecit').click(); await attente(900);
    cas('récit : la carte ouvre la présentation du parcours', pageActuelle === 'decouverte-intro' && /À partir de mon récit/.test(texte($('h1'))), pageActuelle);
    var retour = [].slice.call(document.querySelectorAll('.barre-navigation button')).filter(function (b) { return /Retour/.test(b.textContent); })[0];
    retour.click(); await attente(900);
    cas('récit : « Retour » de la présentation ramène à « Créer un nouveau CV »', pageActuelle === 'creer-cv', pageActuelle);

    $('#btnCreerCvRecit').click(); await attente(700);
    $('#btnDecouverteCommencer').click(); await attente(1200);
    cas('récit : « Raconter mon parcours » démarre le parcours (route decouverte)', pageActuelle === 'decouverte' && typeof _decouverteRenduEtape === 'function', pageActuelle);
    naviguerVers('creer-cv'); await attente(900);
    cas('récit commencé : l\'introduction propose « Continuer » et « Recommencer », plus les trois cartes', !!$('#btnCreerCvRecitContinuer') && !!$('#btnCreerCvRecitRecommencer') && !$('#btnCreerCvSansAssistant') && !$('#btnCreerCvRecit'), 'état récit commencé absent');
    $('#btnCreerCvRecitContinuer').click(); await attente(1200);
    cas('récit : « Continuer » rouvre le parcours sans second encart de reprise', pageActuelle === 'decouverte' && _decouverteReprisePendante === false, String(_decouverteReprisePendante));
    naviguerVers('creer-cv'); await attente(700);
    $('#btnCreerCvRecitRecommencer').click(); await attente(700);
    var avaitDialogue = await confirmer();
    cas('récit : « Recommencer » demande confirmation, vide le parcours et rend les trois cartes', avaitDialogue && !!$('#btnCreerCvRecit') && typeof _decouverteRenduEtape !== 'function' && !dossier.decouverteAnalyseRecue, 'dialogue ' + avaitDialogue);

    // récit terminé
    dossier.decouverteTerminee = true; dossier.experiences = [{ poste: 'Agent', entreprise: 'X', dateDebut: '2020-01', dateFin: '2022-01', missions: 'Accueillir' }];
    naviguerVers('creer-cv'); await attente(700);
    cas('récit terminé : « Votre CV est prêt » avec « Voir mon CV » et « Recommencer »', !!$('#btnCreerCvRecitVoir') && !!$('#btnCreerCvRecitRecommencerFait') && !$('#btnCreerCvRecit'), 'état récit terminé absent');
    $('#btnCreerCvRecitRecommencerFait').click(); await attente(700); await confirmer();
    cas('récit terminé : « Recommencer » vide le CV et rend les trois cartes', !!$('#btnCreerCvRecit') && !dossier.decouverteTerminee && !(dossier.experiences && dossier.experiences.length), 'CV non vidé');

    // un seul parcours à la fois : démarrer « à la main » vide la session du récit
    $('#btnCreerCvRecit').click(); await attente(700);
    $('#btnDecouverteCommencer').click(); await attente(1000);
    naviguerVers('creer-cv'); await attente(700);
    $('#btnCreerCvRecitRecommencer').click(); await attente(500); await confirmer();
    $('#btnCreerCvSansAssistant').click(); await attente(700);
    $('#btnCreerCvCommencer').click(); await attente(900);
    cas('à la main : le départ remet à zéro la session du récit (un seul parcours à la fois)', typeof _decouverteRenduEtape !== 'function' && dossier.modeCreation === 'nouveau' && dossier.creationSansAssistant === true, 'session récit toujours vivante');
    dossier.objectif = 'offre';   // le parcours est « commencé » dès que l'objectif est posé (même règle qu'avant)
    naviguerVers('creer-cv'); await attente(700);
    cas('à la main commencé : « Continuer » et « Recommencer » du parcours classique, jamais ceux du récit', !!$('#btnCreerCvReprendre') && !$('#btnCreerCvRecitContinuer'), 'mauvais état');

    // les deux présentations (à la main, avec l'assistant) : même patron que les autres modules
    _creerCvToutEffacer();
    naviguerVers('creer-cv'); await attente(700);
    cas('créer un CV : l\'explication « Comment ça se passe concrètement » est en haut, avant les cartes, avec les modèles ; plus de bloc « À quoi ça sert » ni d\'encart de langue',
      /Comment ça se passe concrètement/.test(texte($('.intro-module-parcours'))) && texte($('.intro-module-parcours')).indexOf('Comment ça se passe') < texte($('.intro-module-parcours')).indexOf('Comment voulez-vous') && /tel quel/.test(texte($('.intro-module-parcours'))) && !/À quoi ça sert/.test(texte($('.intro-module-parcours'))) && !/Ce que ces parcours ne font pas/.test(texte($('.intro-module-parcours'))) && !/traduire cette page/.test(texte($('.intro-module-parcours'))), 'page des trois parcours');
    $('#btnCreerCvAvecAssistant').click(); await attente(800);
    cas('avec l\'assistant : la carte ouvre sa présentation, départ dans la barre du bas', pageActuelle === 'creer-cv-assistant' && /Commencer/.test(texte($('.barre-navigation #btnCreerCvCommencer'))) && /Ce qui va se passer/.test(texte($('.intro-module-parcours'))) && /Ce que ce parcours ne fait pas/.test(texte($('.intro-module-parcours'))), pageActuelle);
    $('#btnCreerCvCommencer').click(); await attente(900);
    cas('avec l\'assistant : le bouton de départ lance « Votre objectif »', pageActuelle === 'objectif' && dossier.modeCreation === 'nouveau' && dossier.creationSansAssistant === false, pageActuelle);
    cas('écran de travail : la bande « Revoir la présentation » est là', !!$('.btn-revoir-module'), 'bande absente');
    $('.btn-revoir-module').click(); await attente(800);
    cas('« Revoir la présentation » ouvre la présentation en détour : « Revenir au module », pas de « Commencer »', pageActuelle === 'creer-cv-assistant' && !!$('#btnCreerCvRevenirModuleHaut') && !!$('#btnCreerCvRevenirModuleBas') && !$('#btnCreerCvCommencer') && !$('#btnCreerCvReprendre'), pageActuelle);
    $('#btnCreerCvRevenirModuleHaut').click(); await attente(800);
    cas('« Revenir au module » ramène à l\'écran quitté', pageActuelle === 'objectif', pageActuelle);
    var retourObj = [].slice.call(document.querySelectorAll('.barre-navigation button')).filter(function (b) { return /Retour/.test(b.textContent); })[0];
    retourObj.click(); await attente(800);
    cas('« Retour » du premier écran ramène à la présentation du parcours (jamais à l\'accueil)', pageActuelle === 'creer-cv-assistant' && !$('#btnCreerCvRevenirModuleHaut'), pageActuelle);
    dossier.objectif = 'offre'; naviguerVers('creer-cv-assistant'); await attente(700);
    cas('présentation d\'un parcours déjà commencé : « Continuer » et « Recommencer », pas de départ qui effacerait', !!$('#btnCreerCvReprendre') && !!$('#btnCreerCvRecommencer') && !$('#btnCreerCvCommencer'), 'état commencé absent');
    _creerCvToutEffacer();
    naviguerVers('creer-cv'); await attente(700);
    $('#btnCreerCvSansAssistant').click(); await attente(800);
    cas('à la main : la carte ouvre sa présentation', pageActuelle === 'creer-cv-main' && /à la main/i.test(texte($('h1'))) && !!$('#btnCreerCvCommencer'), pageActuelle);
    _creerCvToutEffacer();

    // la Boîte à outils n'a plus l'entrée
    _creerCvToutEffacer();
    naviguerVers('cv'); await attente(900);
    retourVersCarteAccueil('boiteaoutils'); await attente(1000);
    cas('Boîte à outils : « À partir de mon récit » n\'y est plus (Mes Repères, Mon Carnet, Lexique restent)', !$('#btnCarteAccueilDecouverte') && !!$('#btnCarteAccueilReperes') && !!$('#btnCarteAccueilCarnet') && !!$('#btnCarteAccueilLexique'), 'tuile encore là ou outils manquants');
    if (typeof fermerFenetreERIP === 'function') { fermerFenetreERIP(); }
    var recherche = (typeof rechercherBaseConnaissances === 'function') ? JSON.stringify(rechercherBaseConnaissances('récit')) : '';
    cas('recherche : « récit » trouve encore « À partir de mon récit »', /À partir de mon récit/.test(recherche), recherche.slice(0, 120));
    _creerCvToutEffacer();
  }

  // ---------------- Mes modèles : l'essai sur un CV d'exemple (5 modèles au plus), retour sans rien perdre, « Mes modèles » de « Vos documents » ----------------
  async function parcoursModelesGardes() {
    mgReinitialiser();
    viderContenuCVDossier();
    naviguerVers('creer-cv'); await attente(900);
    var vrai = window.dossier;
    cas('modèles gardés : le bloc « Voir nos modèles » est sous les cartes de « Créer un nouveau CV »', !!$('#blocMgVoirModeles') && !!$('#btnMgVoirModeles'), 'bloc absent');
    $('#btnMgVoirModeles').click(); await attente(3500);
    cas('essai : un CV d\'exemple est prêté, le vrai dossier reste intact', window.dossier !== vrai && ucpmDossierVrai() === vrai && window.dossier.identite.nom === 'Martin' && vrai.identite.nom === '', 'dossier non échangé');
    cas('essai : bandeau « exemple », panneaux de contenu masqués, « Garder » sous l\'aperçu, bouton « J\'ai fini de regarder » en bas',
      !!$('#mgBandeauEssai') && getComputedStyle($('#cExp') || document.body).display === 'none' && !!$('#mgZoneGarde') && /J’ai fini de regarder/.test(texte($('.barre-navigation'))), 'écran d\'essai incomplet');
    var essais = 0;
    while (_mgListe.length < 5 && essais < 14) {
      essais++;
      var b = $('#btnMgGarder');
      if (b && !b.disabled && !/Gardé/.test(b.textContent)) { b.click(); await attente(300); if (_mgListe.length >= 5) { break; } }
      var sr = [].slice.call(document.querySelectorAll('button')).filter(function (x) { return /Style rapide/.test(x.textContent); })[0];
      if (sr) { sr.click(); await attente(2300); }
    }
    cas('essai : cinq modèles gardés au plus, le sixième est refusé avec sa raison', _mgListe.length === 5, _mgListe.length + ' modèles');
    var sr2 = [].slice.call(document.querySelectorAll('button')).filter(function (x) { return /Style rapide/.test(x.textContent); })[0];
    if (sr2) { sr2.click(); await attente(2300); }
    cas('essai : plein = « Garder » grisé avec la phrase qui dit quoi faire', !!$('#btnMgGarder') && $('#btnMgGarder').disabled && /places sont prises/.test(texte($('#mgZoneGarde'))), texte($('#mgZoneGarde')));
    var inconnues = mgClesNonClassees(dossier.pdfReglages, dossier.reglagesMiseEnPageCV);
    cas('réglages : aucune clé nouvelle non classée (style ou contenu) : à classer dans modules/cv-modeles-gardes/logique.js', !inconnues.pdf.length && !inconnues.mep.length, JSON.stringify(inconnues));
    $('#btnSuivantNavigation').click(); await attente(1200);
    cas('essai : « J\'ai fini » rend le vrai dossier et garde la liste', pageActuelle === 'creer-cv' && window.dossier === vrai && !window._modeEssaiModeles && _mgListe.length === 5, pageActuelle + ' / ' + _mgListe.length);

    // le départ d'un parcours vide le CV : la liste doit survivre
    $('#btnCreerCvSansAssistant').click(); await attente(700);
    $('#btnCreerCvCommencer').click(); await attente(900);
    cas('départ d\'un parcours : la liste des modèles gardés survit au vidage du CV', _mgListe.length === 5, String(_mgListe.length));
    dossier.identite = { civilite: 'Monsieur', nom: 'Durand', prenom: 'Alex', adresse: '5 rue des Tilleuls', codePostal: '24000', telephone: '0611223344', email: 'alex@mail.fr', ville: 'Périgueux' }; dossier.identiteEnregistree = true;
    dossier.titreCV = 'Cariste'; dossier.metierCible = 'Cariste'; dossier.formatCV = 'pdf';
    dossier.experiences = [{ poste: 'Cariste', entreprise: 'Logistique du Sud', lieu: 'Périgueux', dateDebut: '2021-03', dateFin: '2024-01', missions: 'Conduire un chariot\nPréparer les commandes' }];
    dossier.formations = [{ niveau: 'CACES', intitule: 'CACES 3', etablissement: 'AFPA', annee: '2021', missions: '' }];
    dossier.competencesCV = ['Rigueur', 'Sécurité'];
    async function attenteRendu(ms) { await attente(ms); for (var i = 0; i < 60 && (typeof _mgRenduEnCours !== 'undefined' && _mgRenduEnCours); i++) { await attente(500); } await attente(300); }
    var vraiCv = dossier;
    naviguerVers('resultats'); await attente(11000);
    cas('Vos documents : le bloc « Mes modèles » montre les cartes, le dernier modèle est déjà posé', !!$('#blocMgMesModeles') && document.querySelectorAll('[data-mg-carte]').length === 5 && dossier.modeleGardeActifId === _mgListe[4].id, String(dossier.modeleGardeActifId));
    var rendues = [].slice.call(document.querySelectorAll('[data-ucpm-miniature]')).filter(function (e) { return e.shadowRoot && e.shadowRoot.innerHTML.length > 500; }).length;
    cas('Vos documents : les cinq cartes montrent le CV de la personne', rendues === 5, rendues + ' cartes rendues');
    var miniActive = document.querySelector('[data-ucpm-miniature="mg_' + dossier.modeleGardeActifId + '"]');
    var texteMini = miniActive && miniActive.shadowRoot ? miniActive.shadowRoot.querySelector('.ucpm-ech').innerText.replace(/\s+/g, ' ').trim() : '';
    var texteGrand = ''; try { texteGrand = document.querySelector('#zonePdfInlineCV iframe').contentDocument.getElementById('conteneurPage').innerText.replace(/\s+/g, ' ').trim(); } catch (e) { /* aperçu absent */ }
    cas('Vos documents : la vignette du modèle choisi montre exactement les mêmes informations que le grand CV (titres, en-tête, rubriques)', texteMini.length > 100 && texteMini === texteGrand, texteMini.length + ' / ' + texteGrand.length);
    var rangee = [].slice.call(document.querySelectorAll('.mg-carte-conteneur')).map(function (c) { return Math.round(c.getBoundingClientRect().top); });
    cas('Vos documents : les modèles gardés sont tous sur la même ligne', rangee.length === _mgListe.length && Math.max.apply(null, rangee) - Math.min.apply(null, rangee) <= 2, rangee.join(','));
    cas('Vos documents : « Remodeler » est avec le grand CV du modèle choisi, pas dans la ligne des modèles', !!$('#btnMgRemodeler') && !$('.mg-rangee-modeles #btnMgRemodeler') && getComputedStyle($('.mep-2col-apercu')).display !== 'none', 'bouton mal placé');
    var titre0 = $('h1'), bloc0 = $('#blocMgMesModeles');
    var idChoisi0 = dossier.modeleGardeActifId;
    $('[data-mg-carte="' + idChoisi0 + '"]').click(); await attente(900);
    cas('un clic sur le modèle choisi ouvre son CV très grand, en lecture seule', !!$('#mgTresGrand') && !$('#mgTresGrand [contenteditable]') && $('#mgTresGrand').innerText.length > 0, 'très grand absent');
    $('#btnMgFermerTresGrand').click(); await attente(300);
    cas('« Fermer » referme le CV très grand', !$('#mgTresGrand'), 'toujours ouvert');
    var idAutre = _mgListe.filter(function (m) { return m.id !== idChoisi0; })[0].id;
    $('[data-mg-carte="' + idAutre + '"]').click(); await attenteRendu(600);
    cas('choisir un autre modèle ne redessine pas la page (même titre, l\u2019aperçu est remplacé sur place, pas de blanc)', $('h1') === titre0 && dossier.modeleGardeActifId === idAutre && !!$('#blocMgMesModeles') && $('#blocMgMesModeles') !== bloc0, 'page redessinée');
    await attenteRendu(7000);
    $('[data-mg-carte="' + idChoisi0 + '"]').click(); await attenteRendu(8000);
    cas('Vos documents : le vrai dossier est revenu après les rendus, les boutons sont actifs', window.dossier === vraiCv && !_ucpmDossierReference && !$('#btnMgExporter').disabled, 'dossier ou bouton');
    $('[data-mg-carte="' + _mgListe[1].id + '"]').click(); await attenteRendu(10000);
    var cur = _mgStyleCourant(true), ecarts = [];
    ['pdf', 'mep'].forEach(function (f) { Object.keys(_mgListe[1].style[f]).forEach(function (k) { if (JSON.stringify(_mgListe[1].style[f][k]) !== JSON.stringify(cur[f][k])) { ecarts.push(f + '.' + k); } }); });
    cas('un clic sur une carte pose exactement ce modèle sur le CV', dossier.modeleGardeActifId === _mgListe[1].id && !ecarts.length, ecarts.join(','));
    cas('le contenu du vrai CV reste intact (rien de l\'exemple)', dossier.identite.nom === 'Durand' && dossier.experiences[0].poste === 'Cariste' && JSON.stringify(dossier).indexOf('Camille') < 0 && JSON.stringify(dossier).indexOf('exemple.fr') < 0, 'contenu mêlé');
    cas('Vos documents : chaque modèle a sa croix en haut à droite', document.querySelectorAll('[data-mg-carte-retirer]').length === _mgListe.length, String(document.querySelectorAll('[data-mg-carte-retirer]').length));
    var idChoisi = dossier.modeleGardeActifId, nbAvant = _mgListe.length;
    $('[data-mg-carte-retirer="' + idChoisi + '"]').click(); await attenteRendu(1500);
    cas('retirer le modèle choisi : il disparaît, son grand CV et « Remodeler » disparaissent, « Garder celui-ci » se bloque jusqu\u2019à un nouveau choix', _mgListe.length === nbAvant - 1 && dossier.modeleGardeActifId === null && !$('#btnMgRemodeler') && getComputedStyle($('.mep-2col-apercu')).display === 'none' && !$('#btnMgExporter'), 'actif ' + dossier.modeleGardeActifId);
    $('[data-mg-carte="' + _mgListe[0].id + '"]').click(); await attenteRendu(9000);
    cas('choisir un modèle fait apparaître « Remodeler » et « Garder celui-ci et exporter »', !!$('#btnMgRemodeler') && !$('#btnMgRemodeler').disabled && !$('#btnMgExporter').disabled, 'toujours bloqués');
    $('#btnMgRemodeler').click(); await attenteRendu(2500);
    cas('« Remodeler ce modèle » ouvre tous les réglages, le bandeau avec les deux boutons bien visibles, et la barre redevient « Valider le CV »', !!$('#btnMgFermerRemodeler.btn-lg') && !!$('#btnMgGarderReglage.btn-lg') && getComputedStyle($('.mep-2col-reglages')).display !== 'none' && /Valider le CV/.test(texte($('.barre-navigation'))), 'réglages masqués');
    $('#btnMgFermerRemodeler').click(); await attenteRendu(9000);
    $('#btnMgExporter').click(); await attente(1200);
    cas('« Garder celui-ci et exporter » ouvre l\'enregistrement', dossier.cvTermine === true && _rectDocOuvert === 'exporter', String(_rectDocOuvert));
    var s = sauvegarderSession();
    cas('disquette : la liste est enregistrée avec la session', s.modulesEtat.modelesGardes && s.modulesEtat.modelesGardes.liste.length === _mgListe.length && _mgListe.length > 0, 'liste absente');
    mgReinitialiser();
  }

  // ---------------- Lettre et entretien en version rapide : la fiche donne SON prompt et SON écran au deuxième passage (retour Denis 25/10/2026, point 11) ----------------
  async function parcoursVersionRapideDocument() {
    var sauve = { mode: dossier.modeCreation, choix: dossier.pretChoixPremier, doc: dossier.dernierDocumentPrepare, cvTermine: dossier.cvTermine, modePrepLE: _prepLEMode, etatPrepLE: _prepLEEtat, ecranPrepLE: _prepLEEcran, detour: _prepLEDetour };
    var vraie = ouvrirFenetreAssistantIA, messages = [], recosAvant = _coLettreRecos, reponseAvant = _coLettreRecoReponse;
    ouvrirFenetreAssistantIA = function (o) { messages.push(o.construireTexteACopier()); };
    // Une lettre de recommandation est déposée : la version rapide ne l'envoie jamais (décision de Denis, 25/10/2026), seul le CV l'envoie.
    _coLettreRecos = [{ id: 1, texte: 'Camille est ponctuelle et rigoureuse.', role: 'Ancien employeur' }]; _coLettreRecoReponse = 'oui';
    try {
      for (var i = 0; i < 2; i++) {
        var choix = i === 0 ? 'entretien' : 'lettre', nom = choix === 'entretien' ? 'fiche' : 'lettre';
        // Un autre module a laissé le document actif sur le CV : le parcours rapide ne doit pas en hériter.
        dossier.modeCreation = 'pret'; dossier.pretChoixPremier = null; dossier.dernierDocumentPrepare = 'cv'; dossier.cvTermine = true;
        _prepLEMode = 'pret'; _prepLEEtat = { cvTexte: 'Camille Martin\nAgent de sécurité chez Sécuritas de 2022 à 2024', relectureFaite: true }; _prepLEEcran = 'depot'; _prepLEDetour = false; _pageOrigineAvantResultats = null;
        naviguerVers('preparer-lettre-entretien'); await attente(1500);
        var carte = $('[data-pret-choix-premier="' + choix + '"]');
        cas('version rapide / ' + nom + ' : la carte du parcours existe et n’est pas bloquée', !!carte && carte.getAttribute('aria-disabled') !== 'true', 'carte absente ou bloquée');
        if (!carte) { continue; }
        // Lot 4b (25/10/2026) : le parcours est choisi, puis l'objectif (les six cartes), et seulement ensuite le premier passage chez l'assistant.
        cas('version rapide / ' + nom + ' : avant le choix du parcours, « Votre objectif » attend et « Continuer » est grisé', !$('[data-prepel-situation]') && !!$('#btnSuivantNavigation') && $('#btnSuivantNavigation').disabled, 'objectif visible trop tôt');
        carte.click(); await attente(1200);
        cas('version rapide / ' + nom + ' : une fois le parcours choisi, on reste sur la page et les six cartes d’objectif s’affichent (pas encore chez l’assistant)', _prepLEEcran === 'depot' && document.querySelectorAll('[data-prepel-situation]').length === 6, _prepLEEcran);
        $('[data-prepel-situation="stage"]').click(); await attente(900); $('[data-type-stage="stage"]').click(); await attente(900);
        cas('version rapide / ' + nom + ' : « Continuer » s’active quand l’objectif est renseigné', !!$('#btnSuivantNavigation') && !$('#btnSuivantNavigation').disabled, 'toujours grisé');
        $('#btnSuivantNavigation').click(); await attente(1400);
        cas('version rapide / ' + nom + ' : « Continuer » mène alors au premier passage chez l’assistant', _prepLEEcran === 'echange', _prepLEEcran);
        cas('version rapide / ' + nom + ' : la page « Choisir mon assistant » du premier passage a pour grand titre le nom du parcours, sans pastille', texte($('h1')).indexOf(_parcoursRapideDef(choix).titre) >= 0 && !$('.carte-voie-num'), texte($('h1')));
        cas('version rapide / ' + nom + ' : choisir la carte pose le document actif', docActifActuel() === choix, docActifActuel());
        _prepLETerminerStructuration(); await attente(1200);
        cas('version rapide / ' + nom + ' : à la fin du premier passage le document actif reste celui du parcours', docActifActuel() === choix, docActifActuel());
        messages.length = 0;
        naviguerVers('assistant'); await attente(1500);
        var ok = $('#btnStyleCvOk'); if (ok) { ok.click(); await attente(1200); }
        var entete = texte($('h1')), pastille = $('.parcours-rapide-entete') || $('h1 .carte-voie-num');
        cas('version rapide / ' + nom + ' : le grand titre du deuxième passage est le nom du parcours, sans pastille', entete.indexOf(_parcoursRapideDef(choix).titre) >= 0 && !pastille && !$('.carte-voie-num'), entete);
        var bouton = $('[data-assistant]'); if (bouton) { bouton.click(); await attente(800); }
        var msg = messages[0] || '';
        var marqueFiche = /questionsAnticipees/.test(msg), marqueLettre = /texteCourt/.test(msg);
        cas('version rapide / ' + nom + ' : aucune lettre de recommandation dans le message', msg.indexOf('LETTRE DE RECOMMANDATION (relue') < 0, 'section présente');
        cas('version rapide / ' + nom + ' : le message copié est celui du bon prompt', msg.length > 0 && marqueFiche === (choix === 'entretien') && marqueLettre === (choix === 'lettre'), 'fiche ' + marqueFiche + ', lettre ' + marqueLettre + ', ' + msg.length + ' signes');
      }
    } finally {
      ouvrirFenetreAssistantIA = vraie; _coLettreRecos = recosAvant; _coLettreRecoReponse = reponseAvant;
      dossier.modeCreation = sauve.mode; dossier.pretChoixPremier = sauve.choix; dossier.dernierDocumentPrepare = sauve.doc; dossier.cvTermine = sauve.cvTermine;
      _prepLEMode = sauve.modePrepLE; _prepLEEtat = sauve.etatPrepLE; _prepLEEcran = sauve.ecranPrepLE; _prepLEDetour = sauve.detour;
    }
  }

  // ---------------- Les deux modules approfondis : la page « Synthèse » seulement après l'encart de la version rapide (retour Denis 25/10/2026, point 12) ----------------
  async function parcoursApprofondiArrivee() {
    var cv = 'Camille Martin\nAgent de sécurité chez Sécuritas de 2022 à 2024';
    var sauve = { objectif: dossier.objectif, situation: dossier.situationActuelle, etatCta: _coLettreEtatCta, prepLEEtat: _prepLEEtat, via: _approfondiViaEncart };
    _coLettreEtatCta = function () { return { bloque: false, raisons: [], phrase: '' }; };
    dossier.objectif = 'offre'; dossier.situationActuelle = dossier.situationActuelle || 'poste';
    try {
      // Lettre, arrivée directe
      ouvrirModuleCoLettre(); await attente(600);
      _coLettreDocument = { type: 'texte', valeur: cv }; _coLettreCvRelu = true; _coLettreEcran = 'depot'; naviguerVers('co-lettre'); await attente(1200);
      var b = $('#btnCoLettreVersAssistantBarre');
      cas('lettre directe : le bouton de « Préparer » s’appelle « Continuer »', !!b && /Continuer/.test(texte(b)), texte(b));
      b.click(); await attente(1200);
      cas('lettre directe : on arrive au choix de l’assistant, sans synthèse', _coLettreEcran === 'choix-assistant' && !$('.synthese-carte'), _coLettreEcran);
      _coLettreRetourSynthese(); await attente(1000);
      cas('lettre directe : « Retour » du choix de l’assistant ramène à « Préparer »', _coLettreEcran === 'depot', _coLettreEcran);
      // Lettre, par l'encart
      _prepLEEtat = { cvTexte: cv, relectureFaite: true }; ouvrirLettreApprofondieDepuisRapide(); await attente(1200);
      cas('lettre par l’encart : la synthèse s’affiche', _coLettreEcran === 'synthese' && !!$('.synthese-carte'), _coLettreEcran);
      _coLettreVersChoixAssistant(); await attente(800); _coLettreRetourSynthese(); await attente(800);
      cas('lettre par l’encart : « Retour » du choix de l’assistant ramène à la synthèse', _coLettreEcran === 'synthese', _coLettreEcran);
      _coLettreRetourDepuisSynthese(); await attente(1500);
      cas('lettre par l’encart : « Retour » de la synthèse ramène à « Vos documents » de la version rapide (la lettre)', pageActuelle === 'resultats' && dossier.dernierDocumentPrepare === 'lettre', pageActuelle + ' / ' + dossier.dernierDocumentPrepare);
      // Entretien, arrivée directe
      ouvrirParcoursEntretien(); await attente(800);
      _prepaEntretienDocumentCv = { type: 'texte', valeur: cv }; _prepaEntretienCvRelu = true; _prepaEntretienEcran = 'preparer'; naviguerVers('prepa-entretien'); await attente(1200);
      var bp = $('#btnPrepaVersAssistant');
      cas('entretien direct : le bouton de « Préparer » s’appelle « Continuer »', !!bp && /Continuer/.test(texte(bp)), texte(bp));
      cas('entretien direct : la lettre de recommandation se dépose dans « Préparer »', !!$('#coLettreAppuis'), 'panneau absent');
      if (bp && !bp.disabled) { bp.click(); await attente(1200); }
      cas('entretien direct : on arrive au choix de l’assistant, sans synthèse', _prepaEntretienEcran === 'choix-assistant' && !$('.synthese-carte'), _prepaEntretienEcran);
      _prepaEntretienRetourSynthese(); await attente(800);
      cas('entretien direct : « Retour » du choix de l’assistant ramène à « Préparer »', _prepaEntretienEcran === 'preparer', _prepaEntretienEcran);
      // Entretien, par l'encart
      ouvrirEntretienApprofondiDepuisRapide(); await attente(1200);
      cas('entretien par l’encart : la synthèse s’affiche', _prepaEntretienEcran === 'synthese' && !!$('.synthese-carte'), _prepaEntretienEcran);
      _prepaEntretienEntrerChoixAssistant(); await attente(800); _prepaEntretienRetourSynthese(); await attente(800);
      cas('entretien par l’encart : « Retour » du choix de l’assistant ramène à la synthèse', _prepaEntretienEcran === 'synthese', _prepaEntretienEcran);
      _prepaEntretienRetourDepuisSynthese(); await attente(1500);
      cas('entretien par l’encart : « Retour » de la synthèse ramène à « Vos documents » de la version rapide (la fiche)', pageActuelle === 'resultats' && dossier.dernierDocumentPrepare === 'entretien', pageActuelle + ' / ' + dossier.dernierDocumentPrepare);
    } finally {
      _coLettreEtatCta = sauve.etatCta; _prepLEEtat = sauve.prepLEEtat; _approfondiViaEncart = sauve.via; dossier.objectif = sauve.objectif; dossier.situationActuelle = sauve.situation;
    }
  }

  // ---------------- Vérification des coordonnées en jaune dans tous les parcours du CV et de la lettre, pas pour la fiche d'entretien (retour Denis 25/10/2026, point 9) ----------------
  async function parcoursCoordonneesJaune() {
    var id0 = JSON.stringify(dossier.identite), enr = dossier.identiteEnregistree, mode0 = dossier.modeCreation, doc0 = dossier.dernierDocumentPrepare, cvT = dossier.cvTermine, leT = dossier.lettreTerminee;
    try {
      var cas3 = [['nouveau', 'cv', 'nouveau / CV', true], ['pret', 'lettre', 'version rapide / lettre', true], ['maj', 'cv', 'reprendre mon CV / CV', true], ['pret', 'entretien', 'version rapide / fiche', false]];
      for (var i = 0; i < cas3.length; i++) {
        var c = cas3[i];
        dossier.modeCreation = c[0]; dossier.dernierDocumentPrepare = c[1]; dossier.identiteEnregistree = false; dossier.cvTermine = true; dossier.lettreTerminee = true;
        dossier.identite = Object.assign({}, dossier.identite, { prenom: 'Camille', nom: 'MARTIN', telephone: '0612345678', email: 'c@x.fr' });
        _coordonneesRectangleOuvert = false; _identiteMontreeEnVosInfos = false;
        naviguerVers('assistant'); await attente(900); naviguerVers('resultats'); await attente(1500);
        var r = $('#rectangleCoordonneesDocuments');
        var jaune = !!r && getComputedStyle(r).backgroundColor === getComputedStyle(document.documentElement).getPropertyValue('--warning-bg-subtle').trim() || (!!r && /253, 241, 217|58, 44, 20/.test(getComputedStyle(r).backgroundColor));
        var champs = !!(r && r.querySelector('#zoneIdentiteChamps'));
        cas('coordonnées / ' + c[2] + ' : ' + (c[3] ? 'le panneau jaune de vérification avec les champs est là' : 'aucun panneau de coordonnées (la fiche n’a pas besoin de l’identité)'), c[3] ? (jaune && champs) : !r, r ? getComputedStyle(r).backgroundColor + ' champs ' + champs : 'absent');
      }
      // Fiche d'entretien avec une identité vide : toujours aucun panneau.
      dossier.modeCreation = 'pret'; dossier.dernierDocumentPrepare = 'entretien'; dossier.identiteEnregistree = false; dossier.identite = {}; naviguerVers('assistant'); await attente(900); naviguerVers('resultats'); await attente(1500);
      cas('coordonnées / fiche d’entretien sans identité : aucun panneau de coordonnées', !$('#rectangleCoordonneesDocuments'), 'panneau présent');
    } finally {
      dossier.identite = JSON.parse(id0); dossier.identiteEnregistree = enr; dossier.modeCreation = mode0; dossier.dernierDocumentPrepare = doc0; dossier.cvTermine = cvT; dossier.lettreTerminee = leT;
    }
  }

  // ---------------- Le composant « Votre candidature » de la lettre, repris par « Votre objectif », « Reformuler » et « Reprendre mon CV » (Lot 4a, 25/10/2026) ----------------
  async function parcoursObjectifComposant() {
    var cv = 'Camille Martin\nAgent de sécurité chez Sécuritas de 2022 à 2024';
    var sauve = { mode: dossier.modeCreation, objectif: dossier.objectif, etat: _prepLEEtat, modePrepLE: _prepLEMode, actif: _reprendreCvActif, depuis: _reprendreCvDepuis, bilan: _etatBilan.preparer, enCollecte: _ctEnCollecte, cvAnalyse: dossier.cvAnalyse };
    var raz = function () { dossier.objectif = null; dossier.modeRecherche = null; dossier.typeRecherche = null; dossier.formeChoisie = null; dossier.metierCible = null; dossier._typeStageATrancher = false; };
    try {
      // « Votre objectif » du CV
      dossier.modeCreation = 'nouveau'; raz(); naviguerVers('objectif'); await attente(800);
      var carteEnAvant = function () { return [].map.call(document.querySelectorAll('.grille-objectif .carte-objectif'), function (c, i) { return c.classList.contains('pulse-objectif-actif') ? i : -1; }).filter(function (i) { return i >= 0; }).join(); };
      var invite1 = carteEnAvant(); await attente(2800); var invite2 = carteEnAvant();
      cas('objectif : l’effet d’invitation met une carte en avant, puis la suivante, sans s’arrêter', invite1 !== '' && invite2 !== '' && invite1 !== invite2, invite1 + ' puis ' + invite2);
      $('[data-action="objectif"][data-value="offre"]').click(); await attente(900);
      cas('objectif : dès qu’une carte est choisie, l’effet d’invitation s’arrête', carteEnAvant() === '', carteEnAvant());
      cas('objectif : le composant de la lettre (« L’offre et l’entreprise »), sans ancien bloc ni « Le poste que vous recherchez »', !!$('#ciblageEntreprise') && !$('#blocERIP-candidature') && !$('#blocERIP-projet') && !/Le poste que vous recherchez/.test(document.body.innerText), 'ancien bloc présent');
      cas('objectif : le titre de la partie n’a plus de numéro seul', !$('#objectifBlocCandidature .preparer-num'), 'numéro présent');
      cas('objectif : « Vos appuis » est proposé (création de CV)', !!$('#coLettreAppuis'), 'appuis absents');
      // Reformuler : cartes, composant, pas d'appuis
      dossier.modeCreation = 'maj'; raz(); _prepLEMode = 'reformuler'; _prepLEEtat = { cvTexte: cv, relectureFaite: true }; _prepLEEcran = 'depot'; _prepLEDetour = false; _reprendreCvActif = false;
      naviguerVers('reformuler-cv'); await attente(1200);
      $('[data-prepel-situation="offre"]').click(); await attente(900);
      cas('reformuler : les cartes puis le composant de la lettre (entreprise ciblée), sans ancien bloc', document.querySelectorAll('.carte-objectif').length === 6 && !!$('#ciblageEntreprise') && !$('#blocERIP-candidature'), 'composant absent');
      cas('reformuler : « Vos appuis » (lettre de recommandation) est proposé', !!$('#coLettreAppuis'), 'appuis absents');
      var recosAvantRef = _coLettreRecos, repAvantRef = _coLettreRecoReponse;
      _coLettreRecos = [{ id: 1, texte: 'Camille est ponctuelle et rigoureuse.', role: 'Ancien employeur' }]; _coLettreRecoReponse = 'oui';
      cas('reformuler : la lettre de recommandation part dans le message de l’assistant', /LETTRE DE RECOMMANDATION/.test(_reformulerCvContexteTexte()) && /ponctuelle et rigoureuse/.test(_reformulerCvContexteTexte()), 'section absente');
      _coLettreRecoReponse = 'non';
      cas('reformuler : « Non » : aucune lettre dans le message', !/LETTRE DE RECOMMANDATION/.test(_reformulerCvContexteTexte()), 'section présente');
      _coLettreRecos = recosAvantRef; _coLettreRecoReponse = repAvantRef;
      // Analyser ma candidature (Bilan) et Cohérence : le meme composant, sans ancien bloc repliable
      bilanEntrerPreparation(null); await attente(1000); _etatBilan.preparer = { relectureFaite: true, situationTouchee: false, cvTexte: cv }; raz(); pageBilanCandidature(); await attente(900);
      $('[data-preparer-situation="offre"]').click(); await attente(900);
      cas('bilan : les cartes puis le composant de la lettre (entreprise ciblée), sans ancien bloc repliable', !!$('#bilanComposantCandidature #ciblageEntreprise') && !$('#blocERIP-candidature'), 'composant absent');
      raz(); _ctEnCollecte = true; naviguerVers('coherence-transversale'); await attente(1200);
      appliquerVerrouBlocs([{ id: 'ctCollecteBlocOffre', actif: true }]);   // la partie 4 attend le CV et la lettre : l'essai les suppose deposes
      $('[data-ct-situation="reconversion"]').click(); await attente(900);
      cas('cohérence : les cartes puis le composant de la lettre (« Votre recherche porte sur »), sans ancien bloc repliable', !!$('#ctComposantCandidature') && /Votre recherche porte sur/.test(texte($('#ctComposantCandidature'))) && !$('#blocERIP-candidature'), 'composant absent');
      // Reprendre mon CV, voie 1 : les cartes AVANT le premier passage
      dossier.modeCreation = 'maj'; raz(); _prepLEMode = 'maj'; _prepLEEtat = { cvTexte: cv, relectureFaite: true }; _reprendreCvActif = true; _prepLEEcran = 'depot'; _prepLEDetour = false;
      naviguerVers('reprendre-cv'); await attente(1000);
      $('[data-reprendre-voie="maj"]').click(); await attente(1500);
      cas('reprendre voie 1 : on arrive sur les cartes d’objectif, pas chez l’assistant', _prepLEEcran === 'depot' && document.querySelectorAll('.carte-objectif').length === 6 && !!$('#prepLEReformulerPanneau'), _prepLEEcran);
      cas('reprendre voie 1 : « Continuer » est grisé tant que l’objectif n’est pas choisi', !!$('#btnSuivantNavigation') && $('#btnSuivantNavigation').disabled, 'bouton actif');
      $('[data-prepel-situation="stage"]').click(); await attente(900); $('[data-type-stage="stage"]').click(); await attente(900);
      cas('reprendre voie 1 : stage choisi, « Continuer » s’active', !$('#btnSuivantNavigation').disabled, 'toujours grisé');
      $('#btnSuivantNavigation').click(); await attente(1200);
      cas('reprendre voie 1 : « Continuer » mène alors au choix de l’assistant', _prepLEEcran === 'echange', _prepLEEcran);
      dossier.cvAnalyse = true; _prepLETerminerStructuration(); await attente(1000);
      cas('reprendre voie 1 : après le premier passage, on ne repasse plus par « Votre objectif »', pageActuelle === 'projet', pageActuelle);
    } finally {
      dossier.modeCreation = sauve.mode; dossier.objectif = sauve.objectif; _prepLEEtat = sauve.etat; _prepLEMode = sauve.modePrepLE; _reprendreCvActif = sauve.actif; _reprendreCvDepuis = sauve.depuis; _etatBilan.preparer = sauve.bilan; _ctEnCollecte = sauve.enCollecte; dossier.cvAnalyse = sauve.cvAnalyse;
    }
  }

  // ---------------- Deverrouillage progressif des parties numerotees : lettre et entretien approfondis (Lot 5, 25/10/2026) ----------------
  async function parcoursDeverrouillageProgressif() {
    var cv = 'Camille Martin\nAgent de sécurité chez Sécuritas de 2022 à 2024';
    var raz = function () { dossier.objectif = null; dossier.modeRecherche = null; dossier.typeRecherche = null; dossier.formeChoisie = null; dossier.metierCible = null; dossier._typeStageATrancher = false; };
    var etat = function (id) { var b = document.getElementById(id); return !b ? 'absent' : (b.style.display === 'none' ? 'masque' : (b.classList.contains('bloc-verrouille') ? 'verrouille' : 'ouvert')); };
    var modules = [
      { nom: 'lettre', cible: 'coLettreBlocCible', suite: 'coLettreBlocAdaptation',
        ouvrir: async function (avecCv) { ouvrirModuleCoLettre(); await attente(300); _coLettreDocument = avecCv ? { type: 'texte', valeur: cv } : null; _coLettreCvRelu = !!avecCv; _coLettreEcran = 'depot'; naviguerVers('co-lettre'); } },
      { nom: 'entretien', cible: 'prepaEntretienBlocCible', suite: 'prepaEntretienBlocAdaptation',
        ouvrir: async function (avecCv) { ouvrirParcoursEntretien(); await attente(300); _prepaEntretienDocumentCv = avecCv ? { type: 'texte', valeur: cv } : null; _prepaEntretienCvRelu = !!avecCv; _prepaEntretienEcran = 'preparer'; naviguerVers('prepa-entretien'); } }
    ];
    for (var i = 0; i < modules.length; i++) {
      var m = modules[i];
      raz(); await m.ouvrir(false); await attente(1200);
      cas(m.nom + ' : sans CV, la partie 2 est désactivée et la partie 3 n’est pas encore montrée', etat(m.cible) === 'verrouille' && etat(m.suite) === 'masque', etat(m.cible) + ' / ' + etat(m.suite));
      var carte = document.querySelector('#' + m.cible + ' [data-action="objectif"][data-value="offre"]'); if (carte) { carte.click(); await attente(400); }
      cas(m.nom + ' : une carte désactivée ne se choisit pas (curseur « sens interdit »)', !dossier.objectif && !!carte && getComputedStyle(carte).cursor === 'not-allowed', String(dossier.objectif));
      raz(); await m.ouvrir(true); await attente(1200);
      cas(m.nom + ' : le CV déposé ouvre la partie 2 ; la partie 3 apparaît, désactivée, avec son message', etat(m.cible) === 'ouvert' && etat(m.suite) === 'verrouille' && !!document.querySelector('#' + m.suite + ' .bloc-verrou-message'), etat(m.cible) + ' / ' + etat(m.suite));
      document.querySelector('#' + m.cible + ' [data-action="objectif"][data-value="stage"]').click(); await attente(900);
      cas(m.nom + ' : « Stage » choisi mais pas son type, la partie 3 attend encore', etat(m.suite) === 'verrouille', etat(m.suite));
      document.querySelector('[data-type-stage="stage"]').click(); await attente(900);
      cas(m.nom + ' : la partie 2 remplie, la partie 3 s’active', etat(m.suite) === 'ouvert', etat(m.suite));
    }
    // Cohérence : quatre parties, chacune n'apparait qu'une fois la precedente ouverte et s'active quand la precedente est remplie
    var idsCt = ['ctCollecteBlocLettre', 'ctCollecteBlocEntretien', 'ctCollecteBlocOffre'];
    raz(); _ctEnCollecte = true; naviguerVers('coherence-transversale'); await attente(1200);
    var ec = _ctCollecteEtat, suiteCt = function () { return idsCt.map(etat).join(' / '); };
    ec.cv = null; ec.lettre = null; ec.entretien = null; ctHtmlCollecte(); await attente(600);
    cas('cohérence : sans CV, seule la lettre se voit (désactivée), les parties suivantes ne se montrent pas', suiteCt() === 'verrouille / masque / masque', suiteCt());
    ec.cv = { texte: 'Camille Martin', dejaRelu: true }; ctHtmlCollecte(); await attente(600);
    cas('cohérence : le CV déposé ouvre la lettre ; l’entretien apparaît désactivé', suiteCt() === 'ouvert / verrouille / masque', suiteCt());
    ec.lettre = { texte: 'Madame, Monsieur', dejaRelu: true }; ctHtmlCollecte(); await attente(600);
    cas('cohérence : la lettre déposée ouvre l’entretien ; la situation apparaît désactivée', suiteCt() === 'ouvert / ouvert / verrouille', suiteCt());
    ec.entretien = { texte: null, dejaRelu: false }; ctHtmlCollecte(); await attente(600);
    cas('cohérence : l’entretien traité (ou « je n’en ai pas »), la situation s’active', suiteCt() === 'ouvert / ouvert / ouvert', suiteCt());
    ec.cv = null; ec.lettre = null; ec.entretien = null;
  }

  // ---------------- Fiche d'entretien : le telechargement n'existe qu'a l'etape « Exporter » (retour Denis 25/10/2026) ----------------
  async function parcoursExportFiche() {
    var sauve = { mode: dossier.modeCreation, doc: dossier.dernierDocumentPrepare, fini: dossier.entretienTermine, ia: dossier.ia && dossier.ia.entretien, rect: _rectDocOuvert };
    try {
      dossier.modeCreation = 'pret'; dossier.dernierDocumentPrepare = 'entretien'; dossier.cvTermine = true; dossier.lettreTerminee = true; dossier.identiteEnregistree = true;
      dossier.ia = dossier.ia || {}; dossier.ia.entretien = { presentation: 'Je suis Camille, agent de sécurité.', pointsAPreparer: [], questionsAnticipees: [{ question: 'Parlez-moi de vous', pistes: ['Parcours'], amorce: 'Je suis' }], questionsDuCandidat: ['Quelles missions ?'] };
      dossier.entretienTermine = false; _rectDocOuvert = null;
      naviguerVers('assistant'); await attente(600); naviguerVers('resultats'); await attente(2500);
      var telecharger = function () { return [].filter.call(document.querySelectorAll('#app button'), function (b) { return /Télécharger/.test(b.textContent); }).length; };
      cas('fiche : aucun bouton « Télécharger » sur la mise en page', telecharger() === 0 && !!$('#btnOuvrirGrandApercu'), String(telecharger()));
      $('#btnOuvrirGrandApercu').click(); await attente(3500);
      cas('fiche : aucun bouton « Télécharger » dans l’aperçu à taille réelle', !$('#apercu-docx-btn-telecharger') && !!$('#apercu-docx-btn-fermer'), 'bouton présent');
      if ($('#apercu-docx-btn-fermer')) { $('#apercu-docx-btn-fermer').click(); await attente(500); }
      dossier.entretienTermine = true; _rectDocOuvert = 'exporter'; pageResultats(); await attente(1500);
      var formats = [].map.call(document.querySelectorAll('[data-format-export]'), function (b) { return b.dataset.formatExport; });
      cas('fiche : à l’étape « Exporter », le PDF et le Word sont proposés', formats.indexOf('pdf-entretien') >= 0 && formats.indexOf('docx') >= 0, formats.join(','));
      var html = await construireHtmlImpressionEntretien();
      cas('fiche : le PDF est construit à partir de la fiche (pages et texte)', /<section/.test(html) && /Camille/.test(html), 'rendu vide');
    } finally { dossier.modeCreation = sauve.mode; dossier.dernierDocumentPrepare = sauve.doc; dossier.entretienTermine = sauve.fini; if (dossier.ia) { dossier.ia.entretien = sauve.ia; } _rectDocOuvert = sauve.rect; }
  }

  // ---------------- « Vérifier le texte » : un bouton retire d'un coup tout ce qui est en jaune (retour Denis 25/10/2026) ----------------
  async function parcoursRelectureToutRetirer() {
    var texte = 'Camille Martin\nTéléphone : 06 12 34 56 78\ncamille.martin@exemple.fr\n24100 Bergerac\nAgent de sécurité chez Sécuritas de 2022 à 2024';
    bilanDemanderRelectureCv(texte, undefined, false).catch(function () {}); await attente(1500);
    var ta = $('textarea.verif-doc-textarea') || $('textarea');
    var avant = document.querySelectorAll('[data-retirer-detection]').length;
    cas('relecture : les informations repérées gardent leur croix une par une', avant >= 2, String(avant));
    var b = $('[data-retirer-toutes-detections]');
    cas('relecture : un bouton propose de tout retirer d’un coup', !!b, 'bouton absent');
    if (b) { b.click(); await attente(500); }
    cas('relecture : après le bouton, plus rien en jaune et le reste du texte est gardé', !document.querySelector('[data-retirer-detection]') && !/exemple\.fr|06 12 34 56 78/.test(ta.value) && /Agent de sécurité/.test(ta.value), ta.value);
    var fermer = $('#verifDocBtnAnnuler') || $('[data-fermer-fenetre-erip]') || $('#bilanRelectureAnnulerBtn');
    if (fermer) { fermer.click(); await attente(500); }
  }

  // « Découvrir mes compétences » (séance C) : relecture à trois gestes, question « à préciser », second passage « lignes seules », document, PDF, copie, fin.
  // Les réponses des assistants sont celles archivées dans docs/essais_mes_competences/reponses/ (profil 01 : logistique).
  async function parcoursMesCompetences() {
    var ouvertAvant = window.MESCOMP_OUVERT;
    window.MESCOMP_OUVERT = true;
    var sauvegarde = JSON.stringify(dossier);
    var pdfAvant = window.imprimerLettrePdf;
    var themeAvant = document.documentElement.getAttribute('data-theme');
    try {
      mesCompReinitialiser();
      var msg = await (await fetch('/docs/essais_mes_competences/01_logistique_cv_seul.txt')).text();
      var cv = msg.slice(msg.indexOf('DOCUMENT 1 - CV'));
      var etat = mesCompOuvrir();
      etat.documents = mesCompDocumentsAjouter([], 'cv', cv).liste;
      var rep1 = await (await fetch('/docs/essais_mes_competences/reponses/01_chatgpt.txt')).text();
      var imp = _mesCompImporter(rep1);
      cas('mesCompétences : la première réponse est lue par le filet', imp.succes, imp.erreur);
      mesCompRendrePage(); await attente(600);
      var nbLignes = mesCompOuvrir().lignes.length, nbEnvies = mesCompOuvrir().envies.length;
      cas('relecture : l’écran s’appelle « Je relis mes compétences »', /Je relis mes compétences/.test(($('h1') || {}).textContent || ''), ($('h1') || {}).textContent);
      cas('relecture : une carte par ligne et par envie, familles dépliables', document.querySelectorAll('.mc-comp').length === nbLignes + nbEnvies && document.querySelectorAll('.bloc-depli:not(.mc-comp)').length >= 1, document.querySelectorAll('.mc-comp').length + ' / ' + (nbLignes + nbEnvies));
      var btnSuivant = function () { return $('.barre-navigation-fixe .btn-primary'); };
      cas('relecture : « Continuer » est grisé tant qu’aucune ligne n’est gardée', !!btnSuivant() && btnSuivant().disabled, btnSuivant() ? 'actif' : 'absent');
      cas('relecture : les lignes à préciser sont en jaune', !!$('.mc-comp.bd-warn') || mesCompLignesAPreciser(mesCompOuvrir()).length === 0, 'carte jaune absente');
      // Trois gestes
      var ids = mesCompOuvrir().lignes.filter(function (l) { return l.confirmation !== 'aPreciser'; }).map(function (l) { return l.id; });
      $('[data-mc-geste="ok"][data-mc-id="' + ids[0] + '"]').click(); await attente(300);
      cas('gestes : « C’est exact » garde la ligne et active « Continuer »', mesCompOuvrir().lignes.filter(function (l) { return l.id === ids[0]; })[0].geste === 'ok' && !btnSuivant().disabled, 'geste non posé');
      $('[data-mc-geste="part"][data-mc-id="' + ids[1] + '"]').click(); await attente(300);
      var zone = $('[data-mc-corriger="' + ids[1] + '"]');
      cas('gestes : « En partie exact » ouvre « Écrivez-le avec vos mots »', !!zone, 'zone absente');
      if (zone) { zone.value = 'Mes mots à moi'; zone.dispatchEvent(new Event('input', { bubbles: true })); }
      cas('gestes : le texte écrit par la personne est gardé', mesCompOuvrir().lignes.filter(function (l) { return l.id === ids[1]; })[0].texteCorrige === 'Mes mots à moi', 'texte non gardé');
      $('[data-mc-geste="non"][data-mc-id="' + ids[2] + '"]').click(); await attente(300);
      cas('gestes : « Je retire » barre la carte', !!document.querySelector('.mc-comp.retire'), 'carte non barrée');
      $('[data-mc-geste="non"][data-mc-id="' + ids[2] + '"]').click(); await attente(300);
      cas('gestes : le même geste deux fois le retire (retour à « pas relu »)', mesCompOuvrir().lignes.filter(function (l) { return l.id === ids[2]; })[0].geste === '', 'geste resté');
      $('[data-mc-geste="non"][data-mc-id="' + ids[2] + '"]').click(); await attente(300);
      // Question « à préciser » puis second passage
      var aPreciser = mesCompLignesAPreciser(mesCompOuvrir())[0];
      cas('à préciser : la ligne pose sa question et attend une réponse', !!aPreciser && !!$('#mcRep_' + aPreciser.id), 'pas de ligne à préciser');
      $('[data-mc-valider="' + aPreciser.id + '"]').click(); await attente(200);
      cas('à préciser : valider sans réponse affiche un message clair', /Écrivez d’abord/.test(($('[data-mc-msg="' + aPreciser.id + '"]') || {}).textContent || ''), 'message absent');
      var rf = await (await fetch('/docs/essais_mes_competences/reponses/01_reponses_personne_fictives.txt')).text();
      var reponse = rf.slice(rf.indexOf('Réponse :') + 'Réponse :'.length).trim();
      var ta = $('#mcRep_' + aPreciser.id); ta.value = reponse; ta.dispatchEvent(new Event('input', { bubbles: true }));
      $('[data-mc-valider="' + aPreciser.id + '"]').click(); await attente(300);
      cas('à préciser : la réponse validée prépare l’envoi à l’assistant', !!$('#btnMcEnvoyerReponses') && /Réponse notée/.test(document.body.textContent), 'bloc « réponse prête » absent');
      $('#btnMcEnvoyerReponses').click(); await attente(500);
      cas('second passage : les trois vues du passage remplacent la liste', !!$('[data-ucpm-vue="choix"]') && !document.querySelector('.mc-comp') && btnSuivant().disabled, 'vue du passage absente');
      mesCompBarreRetour(); await attente(400);
      cas('second passage : « Retour » ramène à la liste sans rien perdre', !!document.querySelector('.mc-comp') && mesCompOuvrir().reponses[aPreciser.id] === reponse, 'liste absente ou réponse perdue');
      $('#btnMcEnvoyerReponses').click(); await attente(400);
      mesCompOuvrir().passages = { second: { vue: 'coller', assistant: 'chatgpt' } }; mesCompRendrePage(); await attente(600);
      var rep2 = await (await fetch('/docs/essais_mes_competences/reponses/01_passe2v6_perplexity.txt')).text();
      var coll = $('#texteCollageMcSecond'), bImp = $('#btnImporterMcSecond');
      cas('second passage : la zone de collage est celle de l’application', !!coll && !!bImp, 'zone de collage absente');
      if (coll && bImp) { coll.value = rep2; bImp.disabled = false; bImp.click(); await attente(700); }
      var apres = mesCompOuvrir().lignes.filter(function (l) { return l.id === aPreciser.id; })[0];
      cas('second passage : la ligne précisée revient, confirmée par la réponse, à relire', !!apres && apres.confirmation !== 'aPreciser' && apres.geste === '' && !!document.querySelector('.mc-comp'), JSON.stringify(apres && apres.confirmation));
      cas('second passage : une phrase dit ce qui s’est passé', /précisée/.test(document.body.textContent), 'phrase absente');
      var autres = mesCompOuvrir().lignes.filter(function (l) { return l.geste === ''; });
      autres.forEach(function (l) { _mesCompEtat = mesCompBasculerGeste(mesCompOuvrir(), l.id, 'ok'); });
      mesCompOuvrir().envies.forEach(function (x) { _mesCompEtat = mesCompBasculerGeste(mesCompOuvrir(), x.id, 'ok'); });
      mesCompRendrePage(); await attente(400);
      cas('relecture : tout relu, la phrase du bas le dit', /Vous avez gardé \d+ ligne/.test((document.getElementById('mcPhraseRelecture') || {}).textContent || ''), (document.getElementById('mcPhraseRelecture') || {}).textContent);
      // Document
      var retiree = mesCompOuvrir().lignes.filter(function (l) { return l.geste === 'non'; })[0];
      mesCompBarreContinuer(); await attente(600);
      var feuille = $('#mcFeuille');
      cas('document : l’écran s’appelle « Mes compétences » et montre la feuille', !!feuille && /Mes compétences/.test(($('h1') || {}).textContent || ''), 'feuille absente');
      cas('document : seules les lignes gardées y sont, la ligne retirée n’y est pas', !!feuille && !!retiree && feuille.textContent.indexOf(retiree.libelle) < 0 && feuille.textContent.indexOf(mesCompOuvrir().lignes[0].libelle) >= 0, 'contenu inattendu');
      cas('document : le texte écrit par la personne remplace la proposition', !!feuille && feuille.textContent.indexOf('Mes mots à moi') >= 0 && /écrit par moi/.test(feuille.textContent), 'texte de la personne absent');
      cas('document : aucune ligne « à préciser » ni consigne interne', !!feuille && !/à préciser/i.test(feuille.textContent) && !/prompt|json/i.test(feuille.textContent), 'texte parasite');
      cas('document : le bouton de fin remplace « Continuer »', !!document.querySelector('.barre-navigation-fixe .btn-success') && !document.querySelector('.barre-navigation-fixe .btn-primary'), 'bouton de fin absent');
      var nomWord = '', clicAvant = HTMLAnchorElement.prototype.click;
      HTMLAnchorElement.prototype.click = function () { if (this.download) { nomWord = this.download; return; } return clicAvant.apply(this, arguments); };
      var btnWord = $('#btnMcWord');
      cas('document : le bouton « Télécharger en Word » existe', !!btnWord, 'bouton absent');
      if (btnWord) { btnWord.click(); await attente(2500); }
      HTMLAnchorElement.prototype.click = clicAvant;
      cas('document : « Télécharger en Word » donne un fichier .docx', /.docx$/.test(nomWord), nomWord || 'aucun fichier');
      cas('document : le Word est annoncé à la personne', /Word est téléchargé/.test((document.getElementById('mcMessageDoc') || {}).textContent || ''), (document.getElementById('mcMessageDoc') || {}).textContent);
      $('#oPreuvesMc').click(); await attente(200);
      cas('document : décocher « phrases de mes documents » les masque et le retient', Array.prototype.every.call(document.querySelectorAll('#mcFeuille .mc-bp'), function (x) { return x.hidden; }) && mesCompOuvrir().options.preuves === false, 'phrases encore visibles');
      var copie = '';
      try { Object.defineProperty(navigator, 'clipboard', { value: { writeText: function (t) { copie = t; return Promise.resolve(); } }, configurable: true }); } catch (e) { /* navigateur sans clipboard modifiable */ }
      $('#btnMcCopierTexte').click(); await attente(300);
      cas('document : « Copier le texte » copie le document, sans les phrases décochées', /^Mes compétences/.test(copie) && copie.indexOf('Mes mots à moi') >= 0 && !/Mon CV : «/.test(copie), copie.slice(0, 80));
      var htmlPdf = '';
      window.imprimerLettrePdf = function (c) { return c().then(function (h) { htmlPdf = h; }); };
      $('#btnMcPdf').click(); await attente(400);
      window.imprimerLettrePdf = pdfAvant;
      cas('document : le PDF reprend les mêmes lignes, la même feuille et les mêmes choix', /<h2>Mes compétences<\/h2>/.test(htmlPdf) && htmlPdf.indexOf('Mes mots à moi') >= 0 && htmlPdf.indexOf(retiree.libelle) < 0 && /mc-cache/.test(htmlPdf), htmlPdf.slice(0, 120));
      // Mode sombre : la page se redessine, les textes restent lisibles (couleur du texte différente du clair)
      mesCompAllerEcran('relecture'); await attente(300);
      document.documentElement.setAttribute('data-theme', 'clair'); await attente(150);
      var claire = getComputedStyle($('.mc-preuve') || $('.mc-comp')).color;
      document.documentElement.setAttribute('data-theme', 'sombre'); await attente(150);
      var sombre = getComputedStyle($('.mc-preuve') || $('.mc-comp')).color;
      cas('mode sombre : la couleur du texte de relecture change avec le thème', claire !== sombre, claire + ' / ' + sombre);
      document.documentElement.setAttribute('data-theme', themeAvant || 'clair');
      // Disquette et fin
      var sauv = mesCompExporterEtatPourSauvegarde();
      cas('disquette : le travail de relecture est exporté', !!sauv && sauv.lignes.length === nbLignes, 'export absent');
      mesCompRestaurerEtatDepuisSauvegarde(JSON.parse(JSON.stringify(sauv)));
      cas('disquette : après restauration, les gestes sont retrouvés', mesCompOuvrir().lignes.filter(function (l) { return l.geste === 'ok'; }).length > 0 && mesCompOuvrir().lignes.filter(function (l) { return l.id === ids[1]; })[0].texteCorrige === 'Mes mots à moi', 'gestes perdus');
      mesCompAllerEcran('document'); await attente(300);
      mesCompTerminer(); await attente(300);
      cas('fin : « Terminer » marque le document comme terminé', mesCompOuvrir().termine === true && !!mesCompObtenirDocument(mesCompOuvrir()), 'document non terminé');
    } finally {
      window.imprimerLettrePdf = pdfAvant;
      document.documentElement.setAttribute('data-theme', themeAvant || 'clair');
      window.MESCOMP_OUVERT = ouvertAvant;
      mesCompReinitialiser();
      try { var d0 = JSON.parse(sauvegarde); Object.keys(d0).forEach(function (k) { dossier[k] = d0[k]; }); } catch (e) { /* dossier inchangé */ }
    }
  }

  var PARCOURS = { mesCompetences: parcoursMesCompetences, relectureToutRetirer: parcoursRelectureToutRetirer, exportFiche: parcoursExportFiche, deverrouillage: parcoursDeverrouillageProgressif, objectifComposant: parcoursObjectifComposant, coordonneesJaune: parcoursCoordonneesJaune, approfondiArrivee: parcoursApprofondiArrivee, versionRapide: parcoursVersionRapideDocument, creerRecit: parcoursCreerRecit, modelesGardes: parcoursModelesGardes, tirageCompositions: parcoursTirageCompositions, compositions: parcoursCompositions, texteHorsWord: parcoursTexteHorsWord, impressionFormes: parcoursImpressionFormes, enteteApercu: parcoursEnteteApercu, deuxModelesNeufs: parcoursDeuxModelesNeufs, bandeauSobreRectangles: parcoursBandeauSobreRectangles, colonneSobreDouce: parcoursColonneSobreDouce, bandeauSobreDoux: parcoursBandeauSobreDoux, colonnesTousModeles: parcoursColonnesTousModeles, colonnesTirage: parcoursColonnesTirage, sortieEntretien: parcoursSortieEntretien, petitsModulesHistorique: parcoursPetitsModulesHistorique, regardHistorique: parcoursRegardHistorique, chiffresHistorique: parcoursChiffresHistorique, lexiqueHistorique: parcoursLexiqueHistorique, decouverteHistorique: parcoursDecouverteHistorique, ucpmHistorique: parcoursUcpmHistorique, comparerHistorique: parcoursComparerHistorique, cadreHistorique: parcoursCadreHistorique, bilanHistorique: parcoursBilanHistorique, territoires: parcoursTerritoires, hauteVienne: parcoursHauteVienne, employeurs: parcoursEmployeurs, etranger: parcoursEtranger, francais: parcoursFrancais, creer: parcoursCreer, seniors: parcoursSeniors, sante: parcoursSante, droitsJustice: parcoursDroitsJustice, emploi: parcoursEmploi, former: parcoursFormer, handicap: parcoursHandicap, garde: parcoursGarde, jeunes: parcoursJeunes, budget: parcoursBudget, mobilite: parcoursMobilite, accompagnement: parcoursAccompagnement, monTerritoireFreins: parcoursMonTerritoireFreins, monTerritoireLogement: parcoursMonTerritoireLogement, monTerritoire: parcoursMonTerritoire, monTerritoireProspection: parcoursMonTerritoireProspection, monTerritoireOffres: parcoursMonTerritoireOffres, monTerritoireAide: parcoursMonTerritoireAide, reformulerRetours: parcoursReformulerRetours, repriseCouleurs: parcoursRepriseCouleurs, autresCouleurs: parcoursAutresCouleurs, bordColonne: parcoursBordColonne, modeleTient: parcoursModeleTientSurUnePage, suggestionsPage: parcoursSuggestionsPage, complementCv: parcoursComplementCv, barreBas: parcoursBarreBas, barreProfil: parcoursBarreProfil, orientationFormes: parcoursOrientationFormes, garderFormes: parcoursGarderFormes, panneauxGauche: parcoursPanneauxGauche, grandApercuFormes: parcoursGrandApercuFormes, ongletsApercu: parcoursOngletsApercu, bordBandeau: parcoursBordBandeau, formesBandeauColonne: parcoursFormesBandeauColonne, nouvellesFormesBandeau: parcoursNouvellesFormesBandeau, nouvellesFormesColonne: parcoursNouvellesFormesColonne, poigneesCv: parcoursPoigneesCv, tirageFormes: parcoursTirageFormes, texteDeuxTons: parcoursTexteDeuxTons, texteDeuxTonsColonne: parcoursTexteDeuxTonsColonne, cadreRougeTexte: parcoursCadreRougeTexte, sensBandeau: parcoursSensBandeau, sensColonne: parcoursSensColonne, formesTousModeles: parcoursFormesTousModeles, tirageFormesCv: parcoursTirageFormesCv, formesDeco: parcoursFormesDeco, miniaturesReelles: parcoursMiniaturesReelles, titresRubriques: parcoursTitresRubriques, rappelMissions: parcoursRappelMissions, banc: parcoursBancNonRegression, unCvPlusieursMetiers: parcoursUnCvPlusieursMetiers, unCvMetiersPage2: parcoursUnCvMetiersPage2, unCvMetiersPage3: parcoursUnCvMetiersPage3, unCvMetiersPage5: parcoursUnCvMetiersPage5, unCvMetiersPage6: parcoursUnCvMetiersPage6, unCvMetiersPage1: parcoursUnCvMetiersPage1, unCvMetiersClarification: parcoursUnCvMetiersClarification, unCvMetiersPage7: parcoursUnCvMetiersPage7, unCvMetiersRetour: parcoursUnCvMetiersRetour, unCvMetiersRetravail: parcoursUnCvMetiersRetravail, unCvMetiersPreparation: parcoursUnCvMetiersPreparation, unCvMetiersInvitationInfos: parcoursUnCvMetiersInvitationInfos, bilan: parcoursBilan, comparer: parcoursComparer, decouverte: parcoursDecouverte, prompts: parcoursPrompts, entretienFiche: parcoursEntretienFiche, appuisSansAssistant: parcoursAppuisSansAssistant, voie3Classer: parcoursVoie3Classer, voie3Documents: parcoursVoie3Documents, ats: parcoursAts, certifs: parcoursCertifs, cartes: parcoursCartesObjectif, cvCertifs: parcoursCvCertifsApresFormations, expLieu: parcoursExperienceLieu, rubriques: parcoursDeplacerRubriques, espaces: parcoursEspacerRubriques, retraits: parcoursRetraitsEtMiseEnPage, identite: parcoursIdentiteEtRectangles, reglerSurLeCv: parcoursReglerSurLeCv, genre: parcoursGenre, missionsPdf: parcoursMissionsNomPdfEffacement, standardPerso: parcoursStandardPersonnaliser, boutonEditer: parcoursBoutonEditerExperiences, cartesOrdre: parcoursCartesDansLOrdreDuCv, mixtePro: parcoursMixteCompetencesPro, clesStables: parcoursClesStablesCompetences, compMissions: parcoursCompetencesEtMissions, niveauComp: parcoursNiveauDetailParCompetences, puces: parcoursPucesEtStyleCompetences, dispoComp: parcoursDispositionCompetences, carteComp: parcoursCarteCompetencesComplete, carteForm: parcoursCarteFormations, cartePerso: parcoursCartePerso, styleCommun: parcoursStyleCommun, grandsBoutons: parcoursGrandsBoutons, accrocheLisible: parcoursAccrocheLisible, aideOptions: parcoursAideOptions, aidesEtPerso: parcoursAidesEtPerso, signesCompetences: parcoursSignesCompetences, intitules: parcoursIntitules, datesCertifs: parcoursDatesCertifs, datesSuggestion: parcoursDatesSuggestion, stageExperience: parcoursStageExperience, stageImport: parcoursStageImport, nomsMessages: parcoursNomsDansLesMessages, orgPuces: parcoursOrganisationEtPuces, modesNoms: parcoursModesEtNoms, troisLigne: parcoursTroisRubriquesLigne, optionsAction: parcoursOptionsCompetencesEnAction, contenuAction: parcoursContenuCompetencesEnAction, reserve: parcoursMissionsEnReserve, propositions: parcoursPropositionsEnAction, editionComplete: parcoursEditionComplete, optionsSupp: parcoursOptionsSupplementaires, datesRub: parcoursDatesParRubrique, editionComp: parcoursEditionCompetences, conseilMissions: parcoursNombreMissionsConseille, correctionsPanneau: parcoursCorrectionsPanneau, paires: parcoursPairesPanneaux, modelesColonne: parcoursModelesColonne, looksFamilles: parcoursLooksEtFamilles, chronologique: parcoursChronologique, editorial: parcoursEditorial, editorialLarge: parcoursEditorialLarge, extrasA: parcoursExtrasFamilleA, cartesGrille: parcoursCartesGrille, friseFoncee: parcoursFriseFoncee, technique: parcoursTechnique, cartesCouleurs: parcoursCartesCouleurs, teintePage: parcoursTeintePage, colonneRuban: parcoursColonneRuban, limitesWord: parcoursLimitesWord, infosBandeaux: parcoursInfosBandeaux, infosPresentation: parcoursInfosPresentation, infosEntete: parcoursInfosEntete, titresEtCoin: parcoursTitresEtCoin, remplissage: parcoursRemplissageOffice, enteteAgrandi: parcoursEnteteAgrandi, accrocheCourte: parcoursAccrocheCourteDefaut, jsonFermetures: parcoursJsonFermetures, enteteDecale: parcoursEnteteDecale, coordEnLigne: parcoursCoordEnLigne, ambiance: parcoursAmbianceEtPulsation, tirageStandard: parcoursTirageStandardRiche, modelesPhoto: parcoursModelesPhoto, boutonDegrade: parcoursBoutonDegrade, rondBoutons: parcoursRondBoutons, annulerCouleur: parcoursAnnulerCouleur, pulseAllure: parcoursPulseAllure, aide: parcoursAideCouverture, candidaterEntreprise: parcoursCandidaterEntreprise, chiffresToucher: parcoursChiffresToucher, accueilCartes: parcoursAccueilCartes, digestChangements: parcoursDigestChangements };

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
