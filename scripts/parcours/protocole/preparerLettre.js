/* Protocole : carte « Me préparer à candidater », tuile « Écrire ma lettre avec l'assistant » (route co-lettre). Réponses de l'assistant SIMULÉES (format de prompts/lettre-co.md). */
const R = require('./reprendreCv.js');
const REPONSE_LETTRE_CO = {
  accroche: 'Agent d’accueil attentive, à l’aise avec le public.', arguments: ['Cinq ans d’accueil du public', 'Gestion du standard'],
  versions: [{ objet: 'Candidature spontanée : agent d’accueil', texte: 'Madame, Monsieur,\n\nAgent d’accueil à la mairie de Bergerac pendant cinq ans, je souhaite mettre mon sens du contact au service de votre structure.\n\nJe reste à votre disposition pour un entretien.\n\nCordialement,\nCamille Martin' }]
};
module.exports = {
  nom: 'preparerLettre',
  REPONSE_LETTRE_CO,
  jouer: async (a, j) => {
    await R.deposerCv(a, j, 'co-lettre', '#btnCoLettreCommencer', 'Écrire ma lettre de motivation avec l’assistant');
    let e = await a.ecran();
    // Page « Préparer » : « Continuer » grisé avec la raison tant que tout n'est pas dit.
    if (!/grisé/.test(e.avant || '') || !e.raison) { j.ko('lettre : « Continuer » devrait être grisé avec une raison avant toute réponse (' + e.avant + ' / ' + e.raison + ')'); } else { j.ok('lettre : « Continuer » grisé avec la raison « ' + e.raison + ' »'); }
    j.info('type : ' + await a.clic('', '^Candidature spontanée')); await a.attendre(700);
    e = await a.ecran(); j.info('après le type : « ' + e.avant + ' » raison « ' + e.raison + ' »');
    j.info('métier précis : ' + await a.clic('', '^Un métier précis$')); await a.attendre(600);
    await a.saisir('#rechercheMetierCibleInput', 'agent d’accueil'); await a.attendre(700);
    j.info('métier saisi : ' + await a.clic('#btnValiderMetierSaisi')); await a.attendre(600);
    j.info('domaine : ' + await a.clic('.carte-domaine-metier', 'Administration') + ' / ' + await a.clic('[data-domaine-metier-confirmer]')); await a.attendre(700);
    e = await a.ecran(); j.info('après le métier : « ' + e.avant + ' » raison « ' + e.raison + ' »');
    j.info('entreprise : ' + await a.clic('', 'Je m’adresse à une entreprise précise')); await a.attendre(500);
    const champs = await a.ev(() => [].slice.call(document.querySelectorAll('#coLettreBlocCible input, #coLettreBlocCible textarea, #coLettreBlocCible select')).filter((x) => window.__P.visible(x)).map((x) => (x.id || x.name || x.type) + '[' + x.type + ']').join(' ; '));
    j.info('champs de la candidature : ' + champs);
    const verrou = await a.ev(() => !!document.querySelector('#coLettreBlocAdaptation.bloc-verrouille'));
    j.info('« Adaptation au métier » verrouillé avant le nom de l’entreprise : ' + verrou);
    if (!verrou) { j.ko('lettre : « Adaptation au métier » devrait rester verrouillé tant que le nom de l’entreprise manque'); }
    await a.saisir('#ciblageEntreprise', 'Mairie de Bergerac'); await a.attendre(700);
    e = await a.ecran(); j.info('après le nom de l’entreprise : « ' + e.avant + ' » raison « ' + e.raison + ' »');
    j.info('situation : ' + await a.clic('[data-situation-actuelle="recherche"]')); await a.attendre(700);
    e = await a.ecran(); j.info('après la situation : « ' + e.avant + ' » raison « ' + e.raison + ' »');
    if (/grisé/.test(e.avant || '')) { j.ko('lettre : « Continuer » reste grisé alors que tout est renseigné (' + e.raison + ')'); } else { j.ok('lettre : « Continuer » dégrisé quand tout est renseigné'); }
    // Retour depuis la page « Préparer » : on revient à la présentation, puis « Continuer » ramène à la page avec les réponses gardées.
    const m = await a.allerRetour('lettre (page Préparer)');
    const garde = await a.ev(() => ({ entreprise: (document.getElementById('ciblageEntreprise') || {}).value, situation: (document.querySelector('[data-situation-actuelle="recherche"]') || { getAttribute: () => 'absent' }).getAttribute('aria-pressed') }));
    j.info('réponses gardées après Retour puis Continuer : ' + JSON.stringify(garde));
    if (garde.entreprise !== 'Mairie de Bergerac' || garde.situation !== 'true') { j.ko('lettre : les réponses ne sont pas gardées après Retour puis Continuer ' + JSON.stringify(garde)); }
    // Vers l'assistant.
    j.info('vers l’assistant : ' + await a.suiv()); await a.attendre(900);
    e = await a.verifier({ hash: '#co-lettre', etape: 'Assistant' });
    await R.versAssistant(a, j);
    e = await a.ecran(); j.info('écran de l’assistant : ' + e.hash + ' « ' + e.h1 + ' » bas « ' + e.avant + ' » raison « ' + e.raison + ' » barre ' + e.barre);
    const btns = await a.ev(() => [].slice.call(document.querySelectorAll('#app button, #app summary')).filter((x) => window.__P.visible(x)).map((x) => (x.id ? '#' + x.id + ' ' : '') + window.__P.lib(x).slice(0, 46)).filter(Boolean).join(' ; '));
    j.info('boutons de l’assistant : ' + btns);
    // Réponse coupée puis complète.
    const complete = ['Voici la lettre.', '```json', JSON.stringify(REPONSE_LETTRE_CO), '```'].join('\n');
    const coupee = complete.slice(0, Math.floor(complete.length * 0.6));
    j.info('collage d’une réponse coupée : ' + await a.coller(coupee));
    e = await a.ecran(); j.info('après la réponse coupée : bas « ' + e.avant + ' » raison « ' + e.raison + ' »');
    const msg = await a.ev(() => document.getElementById('app').innerText.replace(/\s+/g, ' ').match(/(Il manque la fin|s’arrête en plein milieu|coupée)[^.]*\./) ? 'signalée' : 'non signalée');
    j.info('réponse coupée : ' + msg);
    if (msg !== 'signalée') { j.ko('lettre : une réponse coupée n’est pas signalée à la personne'); }
    j.info('collage de la réponse complète : ' + await a.coller(complete));
    e = await a.ecran(); j.info('après la réponse complète : bas « ' + e.avant + ' » raison « ' + e.raison + ' »');
    await a.tracer(4, 'lettre (suite)');
    e = await a.ecran(); j.info('fin : ' + e.hash + ' « ' + e.h1 + ' » bas « ' + e.avant + ' » barre ' + e.barre);
    // Chaîne des Retour.
    const chemin = [];
    for (let i = 0; i < 10; i++) {
      const rr = await a.retour(); await a.attendre(700);
      const x = await a.ecran();
      chemin.push(rr === 'ok' ? x.hash.replace('#', '') + ':' + String(x.h1).replace(/[^\wÀ-ÿ ’']/g, '').trim().slice(0, 30) + (x.fenetre ? '[fenêtre]' : '') : rr);
      if (rr !== 'ok' || x.hash === '#cv' || x.hash === '') { break; }
    }
    j.info('chaîne des « Retour » : ' + chemin.join(' < '));
    if (!/^cv:/.test(chemin[chemin.length - 1] || '')) { j.ko('lettre : la chaîne des « Retour » ne ramène pas à l’accueil : ' + chemin.join(' < ')); }
  }
};
