/* Protocole : « Reprendre mon CV », dépôt commun puis les trois voies. Réponses de l'assistant SIMULÉES. */
const CV_TEXTE = 'Camille MARTIN\n06 12 34 56 78 - camille.martin@exemple.fr\n24100 Bergerac\n\nEXPERIENCES\nAgent d accueil, Mairie de Bergerac, 2019-2024\n- Accueil du public\n- Standard\n\nFORMATION\nBTS Support a l action manageriale, 2018\n\nLANGUES\nAnglais B1';

async function deposerCv(a, j, route, bouton, titre, hashAttendu) {
  await a.aller(route || 'reprendre-cv');
  await a.verifier({ h1: titre || 'Reprendre mon CV' });
  j.info('départ : ' + await a.clic(bouton || '#btnReprendreCvCommencer'));
  await a.attendre(800);
  let e = await a.verifier(route ? { hash: '#' + (hashAttendu || route) } : { hash: '#reprendre-cv', etape: 'Déposer' });
  // Les voies doivent être bloquées tant que le CV n'est pas déposé.
  const bloquees = await a.ev(() => /bloquées pour l’instant|bloqué/.test(document.getElementById('app').innerText));
  if (bloquees) { j.ok('dépôt : les choix suivants sont annoncés bloqués tant que le CV n’est pas déposé'); } else { j.info('dépôt : aucune mention de blocage avant le dépôt du CV'); }
  j.info('texte collé : ' + await a.clic('#depotPageColler'));
  await a.attendre(600);
  await a.saisir('#depotPageTexte', CV_TEXTE); await a.attendre(400);
  j.info('relire et masquer : ' + await a.clic('#depotPageLireTexte')); await a.attendre(1500);
  j.info('retirer les informations sensibles : ' + await a.clic('', 'Retirer toutes les informations'));
  await a.attendre(700);
  j.info('enregistrer : ' + await a.clic('#verifDocBtnEnregistrer')); await a.attendre(1500);
  const depose = await a.ev(() => /Déposé et relu/.test(document.getElementById('app').innerText));
  if (!depose) { j.ko('dépôt : après « Enregistrer », la page n’indique pas « Déposé et relu »'); } else { j.ok('dépôt : « Déposé et relu » affiché'); }
}

const REPONSE_EXTRACTION = {
  identite: { civilite: 'Madame', nom: 'Martin', prenom: 'Camille', telephone: '06 12 34 56 78', email: 'camille.martin@exemple.fr', adresse: '', codePostal: '24100', ville: 'Bergerac', lien: '' },
  presentation: { titre: 'Agent d’accueil', accroche: '' },
  experiences: [{ poste: 'Agent d’accueil', entreprise: 'Mairie de Bergerac', lieu: 'Bergerac', dateDebut: '2019', dateFin: '2024', stage: null, missions: ['Accueil du public', 'Tenue du standard'], confiance: 'elevee', alertes: [] }],
  experiencesPerso: [],
  formations: [{ niveau: 'Bac+2', intitule: 'BTS Support à l’action managériale', annee: '2018', etablissement: '', lieu: '', missions: [], confiance: 'elevee', alertes: [] }],
  competences: { savoirFaire: ['Accueil du public', 'Gestion du standard'], savoirEtre: ['Sens du contact'], savoirs: [] },
  langues: [{ langue: 'Anglais', niveau: 'B1', confiance: 'elevee', alertes: [] }],
  certifications: [], certificationsAvecMissions: [], logiciels: [], permis: { possede: null, categories: [], vehicule: null },
  loisirs: [], engagements: [], informationsNonClassees: [], pointsAVerifier: []
};

const REPONSE_REFORMULER = {
  pasUnCV: false, message: '',
  identite: { civilite: 'Madame', nom: 'Martin', prenom: 'Camille', telephone: '06 12 34 56 78', email: 'camille.martin@exemple.fr', adresse: '', codePostal: '24100', ville: 'Bergerac' },
  permis: { possede: null, categories: [], vehicule: null }, pointsAVerifier: [], rattachements: [],
  propositions: [1, 2].map((n) => ({
    piste: 'Version ' + n, titre: 'Agent d’accueil', accroche: 'Agent d’accueil attentive, à l’aise avec le public (version ' + n + ').', accrocheInventee: false,
    experiences: [{ poste: 'Agent d’accueil', entreprise: 'Mairie de Bergerac', lieu: 'Bergerac', dateDebut: '2019', dateFin: '2024', missions: ['Accueillir et orienter le public', 'Tenir le standard', 'Enregistrer les demandes'] }],
    formations: [{ niveau: 'Bac+2', intitule: 'BTS Support à l’action managériale', annee: '2018', etablissement: '', lieu: '' }],
    competences: [{ intitule: 'Accueil du public', origine: 'expérience' }, { intitule: 'Gestion du standard', origine: 'expérience' }],
    langues: [{ langue: 'Anglais', niveau: 'B1' }], loisirs: [], certifications: [], savoirEtre: ['Sens du contact'], savoirs: [], logiciels: [], informationsComplementaires: []
  }))
};

async function versAssistant(a, j) {
  await a.ev(() => { window.open = function () { return {}; }; });
  j.info('choix de l’assistant : ' + await a.clic('', 'Aller sur ChatGPT'));
  await a.attendre(1200);
  const fen = await a.ecran();
  if (!fen.fenetre) { j.ko('choix de l’assistant : la fenêtre d’avertissement (Ctrl+V) ne s’ouvre pas'); }
  j.info('fenêtre : ' + await a.clic('#validerAssistantIABtn'));
  await a.attendre(800);
  j.info('écran d’attente : ' + await a.clic('#btnContinuerMaintenantIA'));
  await a.attendre(1200);
}

async function jouer(a, j, voie) {
  await deposerCv(a, j);
  j.info('choix de la voie ' + voie + ' : ' + await a.clic('', 'VOIE ' + voie));
  await a.attendre(900);
  if (process.env.REPRISE) { await require('./reprise.js').tester(a, j, 'reprise voie ' + voie + ' (Reprendre)', 'reprendre-cv'); return; }
  const e = await a.ecran();
  j.info('après le choix de la voie ' + voie + ' : ' + e.hash + ' « ' + e.h1 + ' » bouton « ' + e.avant + ' » raison « ' + e.raison + ' » barre ' + e.barre);
  if (voie !== 3) {
    j.info('objectif : ' + await a.clic('.carte-objectif', 'Candidature spontanée')); await a.attendre(600);
    let x = await a.ecran();
    j.info('après l’objectif : bouton « ' + x.avant + ' » raison « ' + x.raison + ' »');
    if (/grisé/.test(x.avant || '') && !/métier précis|plusieurs métiers/.test(x.raison || '')) { j.ko('voie ' + voie + ' : « Continuer » grisé après le choix de l’objectif, mais la raison affichée (« ' + x.raison + ' ») ne dit pas ce qui manque vraiment : préciser un métier précis ou plusieurs métiers'); }
    j.info('métier précis : ' + await a.clic('', '^Un métier précis$')); await a.attendre(600);
    await a.saisir('#rechercheMetierCibleInput', 'agent d’accueil'); await a.attendre(700);
    j.info('métier saisi : ' + await a.clic('#btnValiderMetierSaisi')); await a.attendre(600);
    j.info('domaine : ' + await a.clic('.carte-domaine-metier', 'Administration') + ' / ' + await a.clic('[data-domaine-metier-confirmer]')); await a.attendre(700);
    { const y = await a.ecran();
      if (voie === 1 || true) {
        if (/grisé/.test(y.avant || '') && /entreprise précise/.test(y.raison || '')) { j.ok('voie ' + voie + ' : « Continuer » reste grisé tant que « entreprise précise ou non » n’a pas de réponse, raison « ' + y.raison + ' »'); }
        else if (voie === 1) { j.ko('voie 1 : « Continuer » devrait rester grisé tant que « entreprise précise ou non » n’a pas de réponse (' + y.avant + ' / ' + y.raison + ')'); }
        if (/grisé/.test(y.avant || '') && /entreprise précise/.test(y.raison || '')) { j.info('réponse sur la page de préparation : ' + await a.clic('', process.env.ENTREPRISE_OUI ? 'Je m’adresse à une entreprise précise' : 'Je me présente de façon générale')); await a.attendre(700); }
      } }
    x = await a.ecran();
    j.info('après le métier : bouton « ' + x.avant + ' » raison « ' + x.raison + ' »');
    if (/grisé/.test(x.avant || '')) { j.ko('voie ' + voie + ' : « Continuer » reste grisé après le choix de l’objectif et du métier (' + x.raison + ')'); }
  }
  if (voie === 1) {
    await a.suiv(); await a.attendre(900);
    await versAssistant(a, j);
    let e2 = await a.ecran();
    j.info('collage : écran ' + e2.hash + ' « ' + e2.h1 + ' » barre ' + e2.barre);
    const r = await a.coller('J’ai bien lu votre CV.\n```json\n' + JSON.stringify(REPONSE_EXTRACTION) + '\n```');
    j.info('collage de l’extraction : ' + r);
    if (r !== 'etat:recu') { j.ko('voie 1 : la réponse simulée d’extraction n’est pas reçue (' + r + ')'); }
    await a.suiv(); await a.attendre(900);
    e2 = await a.ecran();
    j.info('après « Vérifier mes informations » : ' + e2.hash + ' « ' + e2.h1 + ' » bouton « ' + e2.avant + ' » raison « ' + e2.raison + ' »');
    if (e2.hash === '#projet') {
      // Décision de Denis (11/11/2026) : en reprise voie 1, « Vos informations » bloque seulement sur les expériences (une lecture correcte du CV en donne), jamais sur « Vous ».
      if (/grisé/.test(e2.avant || '')) { j.ko('voie 1 : « Vos informations » grisé alors que la lecture du CV a donné une expérience : ' + e2.raison); } else { j.ok('voie 1 : « Vos informations » actif avec l’expérience lue dans le CV'); }
      await a.ev(() => { window.__exp = dossier.experiences; window.__expP = dossier.experiencesPerso; dossier.experiences = []; dossier.experiencesPerso = []; pageProjet(); });
      await a.attendre(500);
      const v = await a.ecran();
      if (!/grisé/.test(v.avant || '') || !/expériences professionnelles/.test(v.raison || '') || /partie « Vous »/.test(v.raison || '')) { j.ko('voie 1 : sans aucune expérience, « Continuer » devrait être grisé (raison sur les expériences seulement) : ' + v.avant + ' / ' + v.raison); } else { j.ok('voie 1 : sans expérience, « Continuer » grisé, raison « ' + v.raison + ' »'); }
      await a.ev(() => { dossier.experiences = window.__exp; dossier.experiencesPerso = window.__expP; pageProjet(); });
      await a.attendre(500);
    }
    if (e2.hash === '#objectif') {
      if (process.env.SONDEOBJ) { console.log('OBJ>>', await a.ev(() => document.getElementById('app').innerText.replace(/\s+/g, ' ').slice(0, 2500))); }
      const reste = await a.ev(() => ({ cartes: document.querySelectorAll('#app .carte-objectif').length, rappel: !!document.getElementById('objectifDejaChoisi'), jetons: /Votre recherche porte sur/.test(document.getElementById('app').innerText) }));
      if (reste.cartes > 0 || !reste.rappel || reste.jetons) { j.ko('voie 1 : « Votre objectif » redemande ce qui est déjà répondu (' + JSON.stringify(reste) + ')'); } else { j.ok('voie 1 : « Votre objectif » ne reprend pas les cartes ni le choix du métier déjà faits, seulement ce qui manque'); }
      j.info('entreprise : ' + await a.clic('', 'Je me présente de façon générale')); await a.attendre(600);
    }
    if (process.env.REPRISE2) {
      await a.suiv(); await a.attendre(900);
      await require('./reprise.js').tester(a, j, 'reprise profonde voie 1 (Reprendre)', 'reprendre-cv');
      return;
    }
    await a.tracer(4, 'reprendre voie 1');
    e2 = await a.ecran();
    if (e2.hash === '#resultats' && e2.avant == null) {
      const { REPONSE_CV } = require('./creerAssistant.js');
      await versAssistant(a, j);
      const r2 = await a.coller('```json\n' + JSON.stringify(REPONSE_CV) + '\n```');
      j.info('collage de la rédaction : ' + r2);
      await a.tracer(5, 'reprendre voie 1 (fin)');
    }
    // Retour en chaîne jusqu'à la page commune.
    const chemin = [];
    for (let i = 0; i < 14; i++) {
      const rr = await a.retour(); if (/PAS DE RETOUR/.test(rr)) { await a.suiv(); await a.retour(); } await a.attendre(700);
      const x = await a.ecran();
      chemin.push(x.hash.replace('#', '') + ':' + String(x.h1).replace(/[^\wÀ-ÿ ’']/g, '').trim());
      if (x.hash === '#reprendre-cv' || x.hash === '#cv' || x.hash === '') { break; }
    }
    j.info('chaîne des « Retour » : ' + chemin.join(' < '));
    if (!/^reprendre-cv/.test(chemin[chemin.length - 1] || '')) { j.ko('voie 1 : la chaîne des « Retour » ne rejoint pas la page commune « Reprendre mon CV » : ' + chemin.join(' < ')); } else { j.ok('voie 1 : les « Retour » successifs rejoignent la page commune en ' + chemin.length + ' pas'); }
    return;
  }
  if (voie === 2) {
    await a.suiv(); await a.attendre(900);
    await versAssistant(a, j);
    let e2 = await a.ecran();
    j.info('collage : écran ' + e2.hash + ' « ' + e2.h1 + ' » barre ' + e2.barre);
    const r = await a.coller('```json\n' + JSON.stringify(REPONSE_REFORMULER) + '\n```');
    j.info('collage de la reformulation : ' + r);
    if (r !== 'etat:recu') { j.ko('voie 2 : la réponse simulée de reformulation n’est pas reçue (' + r + ')'); }
    await a.suiv(); await a.attendre(1200);
    e2 = await a.ecran();
    j.info('Vérifier : bouton du bas « ' + e2.avant + ' » (choix de version dans la page)');
    const guard = await a.ev(() => /ne figure pas dans votre CV/.test(document.getElementById('app').innerText));
    j.info('garde-fou : l’application signale une compétence absente du CV d’origine : ' + guard);
    if (guard) { j.info('retirer la compétence : ' + await a.clic('', 'Retirer « Sens du contact »')); await a.attendre(700); }
    j.info('choisir la version 1 : ' + await a.clic('', 'Choisir celle-ci')); await a.attendre(1500);
    e2 = await a.ecran();
    j.info('après le choix de version : ' + e2.hash + ' « ' + e2.h1 + ' » bouton « ' + e2.avant + ' » barre ' + e2.barre);
    await a.tracer(8, 'reprendre voie 2');
    const chemin = [];
    for (let i = 0; i < 14; i++) {
      const rr = await a.retour(); if (/PAS DE RETOUR/.test(rr)) { await a.suiv(); await a.retour(); } await a.attendre(700);
      const x = await a.ecran();
      if (process.env.CHAINE) { console.log('CHAINE', i, x.hash, x.h1, '|', await a.ev(() => document.getElementById('app').innerText.replace(/\s+/g, ' ').slice(130, 330))); }
      chemin.push(x.hash.replace('#', '') + ':' + String(x.h1).replace(/[^\wÀ-ÿ ’']/g, '').trim() + ' [' + ((x.barre.match(/\[([^\]]+)\]/) || [])[1] || '-') + (await a.ev(() => (document.getElementById('app').innerText.match(/(Choisir une version|Collez la réponse|Votre assistant|Préparer votre CV|Choisissez votre assistant)/) || [''])[0])) + ']');
      if (x.hash === '#reprendre-cv' || x.hash === '#cv' || x.hash === '') { break; }
    }
    j.info('chaîne des « Retour » : ' + chemin.join(' < '));
    if (!/^reprendre-cv/.test(chemin[chemin.length - 1] || '')) { j.ko('voie 2 : la chaîne des « Retour » ne rejoint pas la page commune « Reprendre mon CV » : ' + chemin.join(' < ')); } else { j.ok('voie 2 : les « Retour » successifs rejoignent la page commune en ' + chemin.length + ' pas'); }
    return;
  }
  await a.tracer(4, 'reprendre voie ' + voie);
  // Modifications de la fiche avant validation : le texte saisi doit rester après un aller-retour.
  const chemin = [];
  for (let i = 0; i < 14; i++) {
    const rr = await a.retour(); if (/PAS DE RETOUR/.test(rr)) { await a.suiv(); await a.retour(); } await a.attendre(700);
    const x = await a.ecran();
    chemin.push(x.hash.replace('#', '') + ':' + String(x.h1).replace(/[^\wÀ-ÿ ’']/g, '').trim());
    if (x.hash === '#reprendre-cv' || x.hash === '#cv' || x.hash === '') { break; }
  }
  j.info('chaîne des « Retour » : ' + chemin.join(' < '));
  if (!/^reprendre-cv/.test(chemin[chemin.length - 1] || '')) { j.ko('voie 3 : la chaîne des « Retour » ne rejoint pas la page commune « Reprendre mon CV » : ' + chemin.join(' < ')); } else { j.ok('voie 3 : les « Retour » successifs rejoignent la page commune en ' + chemin.length + ' pas'); }
}

module.exports = { nom: 'reprendreCv', jouer, deposerCv, CV_TEXTE, REPONSE_EXTRACTION, REPONSE_REFORMULER, versAssistant };
