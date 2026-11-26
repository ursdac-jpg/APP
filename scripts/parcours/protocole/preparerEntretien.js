/* Protocole : carte « Me préparer à candidater », tuile « M'entraîner à un entretien » (route prepa-entretien). Réponses de l'assistant SIMULÉES (format de prompts/entretien.md). */
const R = require('./reprendreCv.js');
const REPONSE_ENTRETIEN = {
  presentation: 'Je suis agent d’accueil depuis cinq ans à la mairie de Bergerac, à l’aise avec le public.',
  pointsAPreparer: ['Les horaires du poste', 'Les missions d’accueil'],
  questionsAnticipees: [{ question: 'Pourquoi ce poste ?', pistes: ['Sens du contact', 'Service au public'], amorce: 'J’aime l’accueil parce que' }, { question: 'Quelles sont vos qualités ?', pistes: ['Rigueur'], amorce: '' }],
  questionsDuCandidat: ['Comment est organisée l’équipe ?', 'Quelles sont les perspectives ?']
};
module.exports = {
  nom: 'preparerEntretien',
  REPONSE_ENTRETIEN,
  jouer: async (a, j) => {
    await R.deposerCv(a, j, 'prepa-entretien', '#btnPrepaEntretienCommencer', 'M’entraîner à un entretien d’embauche');
    let e = await a.ecran();
    if (!/grisé/.test(e.avant || '') || !e.raison) { j.ko('entretien : « Continuer » devrait être grisé avec une raison avant toute réponse (' + e.avant + ' / ' + e.raison + ')'); } else { j.ok('entretien : « Continuer » grisé avec la raison « ' + e.raison + ' »'); }
    const texteBloc2 = await a.ev(() => { const d = document.getElementById('prepaEntretienBlocCible'); return d ? d.innerText.replace(/\s+/g, ' ') : ''; });
    if (/rien n’est bloquant/.test(texteBloc2) && /grisé/.test(e.avant || '') && !/nécessaire/.test(texteBloc2)) { j.ko('entretien : le bloc « Votre candidature » dit que rien n’est bloquant alors que « Continuer » est grisé tant que le type n’est pas choisi'); }
    j.info('type : ' + await a.clic('.carte-objectif', 'Candidature spontanée')); await a.attendre(700);
    e = await a.ecran(); j.info('après le type : « ' + e.avant + ' » raison « ' + e.raison + ' »');
    const verrou1 = await a.ev(() => { const d = document.getElementById('prepaEntretienBlocAdaptation'); const m = d && d.querySelector(':scope > .bloc-verrou-message'); return { verrouille: !!(d && d.classList.contains('bloc-verrouille')), message: m ? m.innerText : '' }; });
    j.info('« Adaptation au métier » après le seul type de candidature : ' + JSON.stringify(verrou1));
    j.info('métier précis : ' + await a.clic('', '^Un métier précis$')); await a.attendre(600);
    await a.saisir('#rechercheMetierCibleInput', 'agent d’accueil'); await a.attendre(700);
    { let ch = await a.clic('[data-metier-cible-direct]'); if (ch !== 'ok') { ch = await a.clic('#btnValiderMetierSaisi'); } j.info('métier choisi dans les propositions : ' + ch); await a.attendre(700); }
    e = await a.ecran(); j.info('après le métier : « ' + e.avant + ' » raison « ' + e.raison + ' »');
    j.info('présentation générale : ' + await a.clic('', 'Je me présente de façon générale')); await a.attendre(600);
    e = await a.ecran(); j.info('après la présentation générale : « ' + e.avant + ' » raison « ' + e.raison + ' »');
    const verrou2 = await a.ev(() => { const d = document.getElementById('prepaEntretienBlocAdaptation'); const m = d && d.querySelector(':scope > .bloc-verrou-message'); return { verrouille: !!(d && d.classList.contains('bloc-verrouille')), message: m ? m.innerText : '' }; });
    j.info('« Adaptation au métier » après le métier : ' + JSON.stringify(verrou2));
    j.info('situation : ' + await a.clic('[data-situation-actuelle="recherche"]')); await a.attendre(700);
    e = await a.ecran(); j.info('après la situation : « ' + e.avant + ' » raison « ' + e.raison + ' »');
    if (/grisé/.test(e.avant || '')) { j.ko('entretien : « Continuer » reste grisé alors que type et situation sont renseignés (' + e.raison + ')'); } else { j.ok('entretien : « Continuer » dégrisé quand tout est renseigné'); }
    await a.allerRetour('entretien (page Préparer)');
    const garde = await a.ev(() => (document.querySelector('[data-situation-actuelle="recherche"]') || { getAttribute: () => 'absent' }).getAttribute('aria-pressed'));
    if (garde !== 'true') { j.ko('entretien : la situation n’est pas gardée après Retour puis Continuer (' + garde + ')'); }
    j.info('vers l’assistant : ' + await a.suiv()); await a.attendre(900);
    await a.verifier({ hash: '#prepa-entretien', etape: 'Assistant' });
    await R.versAssistant(a, j);
    e = await a.ecran(); j.info('écran de l’assistant : ' + e.hash + ' « ' + e.h1 + ' » bas « ' + e.avant + ' » raison « ' + e.raison + ' » barre ' + e.barre);
    const btns = await a.ev(() => [].slice.call(document.querySelectorAll('#app button, #app summary')).filter((x) => window.__P.visible(x)).map((x) => (x.id ? '#' + x.id + ' ' : '') + window.__P.lib(x).slice(0, 46)).filter(Boolean).join(' ; '));
    j.info('boutons de l’assistant : ' + btns);
    const complete = ['Voici votre fiche.', '```json', JSON.stringify(REPONSE_ENTRETIEN), '```'].join('\n');
    j.info('collage d’une réponse coupée : ' + await a.coller(complete.slice(0, Math.floor(complete.length * 0.6))));
    e = await a.ecran(); j.info('après la réponse coupée : bas « ' + e.avant + ' » raison « ' + e.raison + ' »');
    j.info('collage de la réponse complète : ' + await a.coller(complete));
    e = await a.ecran(); j.info('après la réponse complète : bas « ' + e.avant + ' » raison « ' + e.raison + ' »');
    await a.tracer(4, 'entretien (suite)');
    e = await a.ecran(); j.info('fin : ' + e.hash + ' « ' + e.h1 + ' » bas « ' + e.avant + ' » barre ' + e.barre);
    const chemin = [];
    for (let i = 0; i < 10; i++) {
      const rr = await a.retour(); await a.attendre(700);
      const x = await a.ecran();
      chemin.push(rr === 'ok' ? x.hash.replace('#', '') + ':' + String(x.h1).replace(/[^\wÀ-ÿ ’']/g, '').trim().slice(0, 30) + (x.fenetre ? '[fenêtre]' : '') : rr);
      if (rr !== 'ok' || x.hash === '#cv' || x.hash === '') { break; }
    }
    j.info('chaîne des « Retour » : ' + chemin.join(' < '));
    if (!/^cv:/.test(chemin[chemin.length - 1] || '')) { j.ko('entretien : la chaîne des « Retour » ne ramène pas à l’accueil : ' + chemin.join(' < ')); }
  }
};
