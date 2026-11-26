/* Protocole : « Lettre et entretien en version rapide ». Réponses de l'assistant SIMULÉES. */
const R = require('./reprendreCv.js');
const REPONSE_LETTRE = {
  accroche: 'Agent d’accueil attentive, à l’aise avec le public.', arguments: ['Cinq ans d’accueil du public', 'Gestion du standard'],
  versions: [
    { angle: 'Expérience concrète', objet: 'Candidature spontanée : agent d’accueil', texte: 'Madame, Monsieur,\n\nAgent d’accueil à la mairie de Bergerac pendant cinq ans, je souhaite mettre mon sens du contact au service de votre structure.\n\nJe reste à votre disposition pour un entretien.\n\nCordialement,\nCamille Martin', texteCourt: 'Madame, Monsieur, agent d’accueil depuis cinq ans, je souhaite rejoindre votre structure. Cordialement, Camille Martin' },
    { angle: 'Motivation et projet', objet: 'Candidature spontanée : agent d’accueil', texte: 'Madame, Monsieur,\n\nMotivée par l’accueil et le service aux autres, je vous propose ma candidature.\n\nCordialement,\nCamille Martin', texteCourt: 'Madame, Monsieur, motivée par l’accueil, je vous propose ma candidature. Cordialement, Camille Martin' }
  ]
};

const REPONSE_ENTRETIEN = {
  presentation: 'Je suis agent d’accueil depuis cinq ans à la mairie de Bergerac, à l’aise avec le public.',
  pointsAPreparer: ['Les horaires du poste', 'Les missions d’accueil'],
  questionsAnticipees: [{ question: 'Pourquoi ce poste ?', pistes: ['Sens du contact', 'Service au public'], amorce: 'J’aime l’accueil parce que' }, { question: 'Cas pratique : une personne mécontente se présente.', pistes: ['Écoute', 'Calme'], amorce: '' }, { question: 'Quelles sont vos qualités ?', pistes: ['Rigueur'], amorce: '' }],
  questionsDuCandidat: ['Comment est organisée l’équipe ?', 'Quelles sont les perspectives ?']
};

async function jouer(a, j, parcours) {
  parcours = parcours || 1;
  await R.deposerCv(a, j, 'preparer-lettre-entretien', '#btnPrepLettreEntretienCommencer', 'Lettre et entretien en version rapide');
  let e = await a.ecran();
  j.info('après le dépôt : ' + e.hash + ' « ' + e.h1 + ' » bouton « ' + e.avant + ' » raison « ' + e.raison + ' » barre ' + e.barre);
  const btns = await a.ev(() => [].slice.call(document.querySelectorAll('#app button, #app summary')).filter((x) => window.__P.visible(x)).map((x) => (x.id ? '#' + x.id + ' ' : '') + window.__P.lib(x).slice(0, 50)).join(' ; '));
  j.info('boutons : ' + btns);
  j.info('parcours ' + parcours + ' : ' + await a.clic('', 'PARCOURS ' + parcours)); await a.attendre(800);
  e = await a.ecran();
  j.info('après le choix du parcours : bouton « ' + e.avant + ' » raison « ' + e.raison + ' »');
  j.info('objectif : ' + await a.clic('.carte-objectif', 'Candidature spontanée')); await a.attendre(600);
  e = await a.ecran();
  j.info('après l’objectif : bouton « ' + e.avant + ' » raison « ' + e.raison + ' »');
  j.info('métier précis : ' + await a.clic('', '^Un métier précis$')); await a.attendre(600);
  await a.saisir('#rechercheMetierCibleInput', 'agent d’accueil'); await a.attendre(700);
  { let ch = await a.clic('[data-metier-cible-direct]'); if (ch !== 'ok') { ch = await a.clic('#btnValiderMetierSaisi'); } j.info('métier choisi dans les propositions : ' + ch); await a.attendre(700); }
  e = await a.ecran();
  j.info('après le métier : bouton « ' + e.avant + ' » raison « ' + e.raison + ' »');
  if (/grisé/.test(e.avant || '') && /entreprise précise/.test(e.raison || '')) { j.ok('version rapide : « Continuer » reste grisé tant que « entreprise précise ou non » n’a pas de réponse'); j.info('réponse sur la page de préparation : ' + await a.clic('', process.env.ENTREPRISE_OUI ? 'Je m’adresse à une entreprise précise' : 'Je me présente de façon générale')); await a.attendre(700); }
  else { j.ko('version rapide : « Continuer » devrait rester grisé tant que « entreprise précise ou non » n’a pas de réponse (' + e.avant + ' / ' + e.raison + ')'); }
  const btns2 = await a.ev(() => [].slice.call(document.querySelectorAll('#app button, #app summary')).filter((x) => window.__P.visible(x)).map((x) => (x.id ? '#' + x.id + ' ' : '') + window.__P.lib(x).slice(0, 50)).join(' ; '));
  j.info('boutons : ' + btns2);
  await a.suiv(); await a.attendre(900);
  await R.versAssistant(a, j);
  e = await a.ecran();
  j.info('collage : écran ' + e.hash + ' « ' + e.h1 + ' » barre ' + e.barre);
  const r = await a.coller('J’ai bien lu votre CV.\n```json\n' + JSON.stringify(R.REPONSE_EXTRACTION) + '\n```');
  j.info('collage de l’extraction : ' + r);
  if (r !== 'etat:recu') { j.ko('version rapide : la réponse simulée d’extraction n’est pas reçue (' + r + ')'); }
  await a.suiv(); await a.attendre(900);
  e = await a.ecran();
  if (e.hash === '#objectif') { j.ko('version rapide : l’écran « Votre objectif » réapparaît après la réponse de l’assistant alors que la page de préparation était complète'); }
  await a.tracer(4, 'rapide');
  e = await a.ecran();
  if (e.hash === '#resultats' && e.avant == null) {
    await R.versAssistant(a, j);
    const r2 = await a.coller('Voici deux lettres.\n```json\n' + JSON.stringify(parcours === 2 ? REPONSE_ENTRETIEN : REPONSE_LETTRE) + '\n```');
    j.info('collage de la réponse (parcours ' + parcours + ') : ' + r2);
    if (r2 !== 'etat:recu') { j.ko('version rapide : la réponse simulée des lettres n’est pas reçue (' + r2 + ')'); }
    await a.tracer(3, 'rapide (résultat)');
  }
  const chemin = [];
  for (let i = 0; i < 14; i++) {
    const rr = await a.retour(); if (/PAS DE RETOUR/.test(rr)) { await a.suiv(); await a.retour(); } await a.attendre(700);
    const x = await a.ecran();
    chemin.push(x.hash.replace('#', '') + ':' + String(x.h1).replace(/[^\wÀ-ÿ ’']/g, '').trim());
    if (x.hash === '#preparer-lettre-entretien' && /^Lettre et entretien/.test(x.h1) || x.hash === '#cv' || x.hash === '') { break; }
  }
  j.info('chaîne des « Retour » : ' + chemin.join(' < '));
  if (!/^preparer-lettre-entretien:Lettre et entretien/.test(chemin[chemin.length - 1] || '')) { j.ko('version rapide parcours ' + parcours + ' : la chaîne des « Retour » ne rejoint pas la page « Lettre et entretien en version rapide » : ' + chemin.join(' < ')); } else { j.ok('version rapide parcours ' + parcours + ' : les « Retour » successifs rejoignent la page commune en ' + chemin.length + ' pas'); }
}
module.exports = { nom: 'lettreRapide', jouer: (a, j) => jouer(a, j, 1), jouerParcours: jouer, REPONSE_LETTRE, REPONSE_ENTRETIEN };
