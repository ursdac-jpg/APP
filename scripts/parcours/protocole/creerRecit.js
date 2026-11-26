/* Protocole : « Créer un nouveau CV », voie 2 « À partir de mon récit ». Réponse de l'assistant SIMULÉE (format de prompts/decouverte-competences.md). */
const RECIT = 'J’ai travaillé trois ans comme agent d’entretien dans une école. Je m’occupais aussi de mes deux neveux tous les mercredis, et je suis bénévole dans une association de quartier. J’aime la randonnée et la lecture.';
const REPONSE_1 = {
  fragments: [
    { texteBrut: 'agent d’entretien dans une école pendant trois ans', origine: 'proDeclaree', propositions: ['Entretien et nettoyage de locaux scolaires', 'Respect des protocoles d’hygiène'], elementsFactuels: [],
      competencesProposees: [{ texte: 'Nettoyage de locaux', categorie: 'technique', preuve: ['agent d’entretien'] }, { texte: 'Respect des consignes d’hygiène', categorie: 'technique', preuve: ['école'] }, { texte: 'Organisation du travail', categorie: 'transferable', preuve: ['trois ans'] }, { texte: 'Sérieux', categorie: 'savoirEtre', preuve: ['trois ans'] }] },
    { texteBrut: 'garde de mes deux neveux tous les mercredis', origine: 'personnelleFamiliale', propositions: ['Garde et accompagnement d’enfants'], elementsFactuels: [],
      competencesProposees: [{ texte: 'Accompagnement d’enfants', categorie: 'transferable', preuve: ['deux neveux'] }, { texte: 'Patience', categorie: 'savoirEtre', preuve: ['mercredis'] }] },
    { texteBrut: 'bénévole dans une association de quartier', origine: 'benevoleAssociative', propositions: ['Engagement associatif'], elementsFactuels: [],
      competencesProposees: [{ texte: 'Travail en équipe', categorie: 'transferable', preuve: ['association'] }, { texte: 'Sens du service', categorie: 'savoirEtre', preuve: ['bénévole'] }] },
    { texteBrut: 'randonnée et lecture', origine: 'autre', propositions: ['Loisirs'], elementsFactuels: ['randonnée', 'lecture'], competencesProposees: [{ texte: 'randonnée', categorie: 'centreInteret', preuve: [] }, { texte: 'lecture', categorie: 'centreInteret', preuve: [] }] }
  ],
  questionsCiblees: [
    { texte: 'En quelle année avez-vous commencé comme agent d’entretien ?', fragmentIndex: 0, type: 'date' },
    { texte: 'Quelles tâches faisiez-vous le plus souvent ?', fragmentIndex: 0, type: 'texte', choix: 'multiple', reponses: ['Nettoyage des salles', 'Entretien des sanitaires', 'Gestion des produits'] },
    { texte: 'Avez-vous eu une formation à l’hygiène ?', fragmentIndex: 0, type: 'texte', choix: 'unique', reponses: ['Oui', 'Non', 'Je ne sais pas'] },
    { texte: 'Depuis quand êtes-vous bénévole ?', fragmentIndex: 2, type: 'date' },
    { texte: 'Que faites-vous dans l’association ?', fragmentIndex: 2, type: 'texte' }
  ],
  reciteNettoye: RECIT
};

const REPONSE_REDAC = {
  titresProposes: ['Agent d’entretien', 'Agent de propreté', 'Agent d’entretien des locaux', 'Agent de service', 'Agent polyvalent d’entretien'],
  accrochesProposees: ['Trois ans d’entretien de locaux scolaires, avec sérieux et respect des consignes d’hygiène.', 'Agent d’entretien fiable, à l’aise avec les enfants et le travail en équipe.', 'Organisée et attentive, je cherche un poste dans l’entretien des locaux.', 'Sens du service, acquis en école et en association.', 'Un parcours simple et régulier au service des autres.'],
  accrochesCourtesProposees: ['Agent d’entretien fiable.', 'Sérieuse et organisée.', 'Au service des autres.'],
  pointsForts: ['Sérieux', 'Organisation'], motsCles: ['entretien', 'hygiène', 'école'],
  recommandations: {
    typeCV: { valeur: 'chronologique', justification: 'Parcours régulier.' }, postesRecommandes: ['Agent d’entretien'],
    experiencesAMettreEnAvant: [{ poste: 'Agent d’entretien', entreprise: 'École', justification: 'Cœur du métier visé.', dateDebut: '2021-09', dateFin: '2024-06' }],
    competencesAValoriser: [{ competence: 'Nettoyage de locaux', justification: 'Cœur du métier.' }, { competence: 'Respect des consignes d’hygiène', justification: 'Utile.' }],
    competencesPersonnelles: [{ competence: 'Patience', source: 'garde d’enfants', justification: 'Utile avec le public.' }], rubriquesMasquables: [],
    savoirFaireParExperience: [{ poste: 'Agent d’entretien', entreprise: 'École', missions: ['Nettoyer les salles de classe', 'Entretenir les sanitaires', 'Gérer les produits', 'Respecter les protocoles d’hygiène', 'Signaler les anomalies'] }],
    formationRetenue: { intitule: '', justification: '', missions: [] }, certificationsAMettreEnAvant: []
  }
};

async function versAssistant(a, j) {
  await a.ev(() => { window.open = function () { return {}; }; });
  j.info('choix de l’assistant : ' + await a.clic('', 'Aller sur ChatGPT'));
  await a.attendre(1200);
  const fen = await a.ecran();
  if (!fen.fenetre) { j.ko('choix de l’assistant : la fenêtre d’avertissement (Ctrl+V) ne s’ouvre pas'); }
  j.info('fenêtre : ' + await a.clic('#validerAssistantIABtn'));
  await a.attendre(800);
  // Écran d'attente (15 s, fenêtre de collage en aperçu inactif) : « Ouvrir maintenant » ouvre l'assistant sans attendre.
  const att = await a.ecran();
  j.info('écran d’attente : ' + await a.clic('#btnContinuerMaintenantIA'));
  await a.attendre(1200);
}

async function jouer(a, j) {
  await a.aller('creer-cv');
  await a.verifier({ h1: 'Créer un nouveau CV' });
  j.info('départ direct voie 2 : ' + await a.clic('#btnCreerCvRecit'));
  await a.attendre(900); await require('./reprendreCv.js').passerChoixMissions(a, j, 'assistant');
  await a.attendre(1000);
  let e = await a.verifier({ hash: '#decouverte', etape: 'Préparer' });
  if (!/grisé/.test(e.avant || '')) { j.ko('Préparer : « Continuer » devrait être grisé tant que le récit est vide (' + e.avant + ')'); } else { j.ok('Préparer : « Continuer » grisé sans récit, raison « ' + e.raison + ' »'); }
  // Un récit trop court est-il accepté ?
  await a.saisir('#decouverteRecitTexte', 'Agent.'); await a.attendre(400);
  e = await a.ecran(); j.info('récit d’un mot : bouton « ' + e.avant + ' »');
  await a.saisir('#decouverteRecitTexte', RECIT); await a.attendre(500);
  // Objectif facultatif ; civilité.
  j.info('civilité : ' + await a.clic('', '^Madame$'));
  j.info('objectif : ' + await a.clic('.carte-objectif', 'Candidature spontanée'));
  e = await a.verifier({ hash: '#decouverte' });
  if (/grisé/.test(e.avant || '')) { j.ko('Préparer : « Continuer » grisé alors que le récit est écrit (' + e.raison + ')'); }
  await a.suiv();
  e = await a.verifier({ hash: '#decouverte', etape: 'Assistant' });
  j.info('Assistant : bouton du bas « ' + e.avant + ' » (aucun « Continuer » : on passe par un assistant)');
  await a.allerRetour('Assistant');
  // Retour ramène au récit : le texte est-il conservé ?
  e = await a.ecran();
  const garde = await a.ev(() => (document.getElementById('decouverteRecitTexte') || {}).value);
  if (e.h1 && /Préparer/.test(e.h1)) { j.info('Retour vers Préparer : récit conservé : ' + (garde && garde.length > 50)); if (!(garde && garde.length > 50)) { j.ko('Préparer : le récit est perdu après « Retour »'); } }
  e = await a.ecran();
  if (e.hash === '#decouverte' && /Préparer/.test(e.h1)) { await a.suiv(); }
  await versAssistant(a, j);
  e = await a.verifier({ hash: '#decouverte', etape: 'Réponse' });
  let r;
  if (process.env.TRONQUE) {
    r = await a.coller(('```json\n' + JSON.stringify(REPONSE_1)).slice(0, 500));
    j.info('collage coupé : ' + r);
    if (!/coupe|echec/.test(r)) { j.ko('Réponse : une réponse coupée n’est pas signalée (' + r + ')'); }
  }
  r = await a.coller('Voici ce que j’ai compris.\n```json\n' + JSON.stringify(REPONSE_1) + '\n```');
  j.info('collage complet : ' + r);
  e = await a.verifier({ hash: '#decouverte' });
  j.info('après réponse reçue : étape « ' + (e.barre.match(/\[([^\]]+)\]/) || [])[1] + ' », bouton « ' + e.avant + ' »');
  await a.suiv(); await a.attendre(1200);
  e = await a.verifier({ hash: '#decouverte', etape: 'Compétences' });
  if (process.env.REPRISE) { await require('./reprise.js').tester(a, j, 'reprise voie 2 (Créer)', 'creer-cv'); return; }
  // Valider chaque expérience : cocher une ou deux compétences puis « Je valider cette expérience ».
  for (let i = 0; i < 4; i++) {
    const res = await a.ev((k) => {
      const bs = [].slice.call(document.querySelectorAll('#app .btn-valider-fragment'));
      const b = bs[k]; if (!b) { return 'pas de bouton ' + k; }
      let c = b.parentElement; let n = 0;
      while (c && c.id !== 'app' && !c.querySelector('input.btn-check')) { c = c.parentElement; }
      const cases = c ? [].slice.call(c.querySelectorAll('input.btn-check')).slice(0, 2) : [];
      cases.forEach((x) => { if (!x.checked) { x.click(); n++; } });
      b.click(); return 'cochées ' + n;
    }, i);
    j.info('expérience ' + (i + 1) + ' : ' + res);
    await a.attendre(700);
  }
  e = await a.ecran();
  j.info('après validation des 4 expériences : bouton « ' + e.avant + ' »' + (e.raison ? ' raison : ' + e.raison : ''));
  await a.suiv(); await a.attendre(1200);
  e = await a.verifier({ hash: '#decouverte', etape: 'Compléter' });
  // Continuer sans identité : l'application doit dire clairement ce qui manque.
  const t0 = await a.ev(() => document.getElementById('app').innerText.length);
  await a.suiv(); await a.attendre(1000);
  const e2 = await a.ecran();
  const rappel = await a.ev(() => !!document.getElementById('decouverteRappelIdentite'));
  if (e2.h1 === e.h1 && !rappel) { j.ko('Vos informations : « Continuer → » ne fait rien tant que prénom, nom et contact manquent, et aucun rappel n’apparaît'); } else { j.ok('Vos informations : sans identité, « Continuer » affiche le rappel « Une dernière chose avant de continuer » (volontaire)'); }
  await a.saisir('#identitePrenom', 'Camille'); await a.saisir('#identiteNom', 'Martin'); await a.saisir('#identiteTelephone', '06 12 34 56 78'); await a.attendre(500);
  await a.suiv(); await a.attendre(1200);
  e = await a.ecran();
  j.info('après saisie de l’identité : ' + e.hash + ' « ' + e.h1 + ' » bouton « ' + e.avant + ' »');
  await a.tracer(2, 'récit (réglages)');
  e = await a.verifier({ hash: '#decouverte', etape: 'Rédiger mon CV' });
  // Second échange avec l'assistant : la rédaction.
  await versAssistant(a, j);
  e = await a.verifier({ hash: '#decouverte', etape: 'Rédiger mon CV' });
  r = await a.coller('```json\n' + JSON.stringify(REPONSE_REDAC) + '\n```');
  j.info('collage de la rédaction : ' + r);
  e = await a.verifier({ hash: '#decouverte' });
  await a.tracer(5, 'récit (fin)');
  e = await a.ecran();
  j.info('arrivée : ' + e.hash + ' « ' + e.h1 + ' » barre : ' + e.barre);
  // Retour en chaîne depuis « Vos documents » jusqu'à la page commune.
  await a.suiv().catch(() => {});
  const chemin = [];
  for (let i = 0; i < 14; i++) {
    const rr = await a.retour(); await a.attendre(700);
    const x = await a.ecran();
    chemin.push(x.hash.replace('#', '') + ':' + String(x.h1).replace(/[^\wÀ-ÿ ’']/g, '').trim());
    if (process.env.CHAINE) { console.log('  objectif=', JSON.stringify(await a.ev(() => (typeof dossier !== 'undefined' && dossier.objectif) || null)), 'cartes visibles=', await a.ev(() => [].slice.call(document.querySelectorAll('#app .carte-objectif')).filter((x) => window.__P.visible(x)).length), 'titre fil=', await a.ev(() => [].slice.call(document.querySelectorAll('#app h2,#app h3')).map((x) => x.innerText).slice(0, 4).join('|'))); }
    if (process.env.CHAINE) { console.log('CHAINE', i, rr, x.hash, x.h1, 'fenetre=' + x.fenetre, JSON.stringify(await a.ev(() => { const f = document.querySelector('#fenetreERIP.visible, .fenetre-erip-overlay.visible, .modal.show'); return f ? f.innerText.replace(/\s+/g, ' ').slice(0, 200) : null; }))); }
    if (x.hash === '#creer-cv') { break; }
    if (x.hash === '#accueil' || x.hash === '' || /^#?(accueil)?$/.test(x.hash)) { break; }
  }
  j.info('chaîne des « Retour » depuis Vos documents : ' + chemin.join(' < '));
  if (!/^creer-cv/.test(chemin[chemin.length - 1] || '')) { j.ko('voie 2 : la chaîne des « Retour » ne rejoint pas la page commune « Créer un nouveau CV » : ' + chemin.join(' < ')); } else { j.ok('voie 2 : les « Retour » successifs rejoignent la page commune en ' + chemin.length + ' pas'); }
}

module.exports = { nom: 'creerRecit', jouer };
