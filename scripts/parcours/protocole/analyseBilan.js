/* Protocole : carte « Outils d'analyse », tuile « Analyser ma candidature » (route bilan). Réponse de l'assistant SIMULÉE (format de prompts/bilan-v1.md). */
const R = require('./reprendreCv.js');
const E = require('./enchainer.js');
const REPONSE_BILAN = {
  metaDiagnostic: { niveauAnalyse: 1, dimensionsNonEvaluables: [] }, alertesPrioritaires: [], syntheseGenerale: { statutPreparation: 'a_ajuster', resumeNarratif: 'Synthèse du bilan.' },
  premiereImpression: { texte: 'Bonne première impression.' }, ceQuiDonneEnvie: { texte: 'Un parcours cohérent.' }, ceQuiPeutFreiner: { texte: 'Peu de résultats chiffrés.' },
  axes: [{ id: 'credibilite', restitutionQualitative: 'convaincant', observationsArgumentees: [{ texte: 'Affirmations étayées.', observationsFactuellesLiees: [] }], pointsForts: ['Ton mesuré'], pointsFaibles: [], incoherences: [], risques: [] }],
  recommandations: [{ id: 'reco-1', contenu: 'Ajouter un résultat chiffré.', dimensionsLiees: ['credibilite'], priorite: 'moyenne', extraitConcerne: null, observationsLiees: ['Affirmations étayées.'] }],
  planAction: ['reco-1'], syntheseProjectionRecruteur: { texte: 'Impression globale positive.' }
};
module.exports = {
  nom: 'analyseBilan',
  REPONSE_BILAN,
  jouer: async (a, j) => {
    await R.deposerCv(a, j, 'bilan', '#btnBilanIntroCommencer', 'Analyser ma candidature');
    let e = await a.ecran();
    j.info('après le dépôt : bas « ' + e.avant + ' » raison « ' + e.raison + ' » barre ' + e.barre);
    if (/grisé/.test(e.avant || '')) { j.ko('bilan : « Continuer » grisé alors que le CV est déposé et relu (' + e.raison + ')'); } else { j.ok('bilan : « Continuer » actif dès que le CV est déposé et relu'); }
    j.info('Retour : ' + await a.retour());
    e = await a.ecran(); j.info('présentation après Retour : ' + e.hash + ' « ' + e.h1 + ' » bas « ' + e.avant + ' »');
    const pres = await a.ev(() => ({ b: [].slice.call(document.querySelectorAll('#app button, #app summary')).filter((x) => window.__P.visible(x)).map((x) => (x.id ? '#' + x.id + ' ' : '') + window.__P.lib(x).slice(0, 40)).filter(Boolean).join(' ; '), enc: !!document.querySelector('#app .encart-reprise-module'), t: document.getElementById('app').innerText.replace(/\s+/g, ' ').slice(0, 300) }));
    j.info('présentation : encart de reprise ' + pres.enc + ' | boutons ' + pres.b + ' | ' + pres.t);
    const m1 = await E.mesureReprise(a, j, 'bilan (présentation)');
    if (m1.forme === 'A') { j.ok('bilan : la reprise a la forme de « Reprendre mon CV » (bloc sur la présentation, « Recommencer » seul, « Reprendre » en bas à droite)'); } else { j.ko('bilan : la reprise n’a pas la forme de « Reprendre mon CV » (consigne 258)'); }
    if (!/^Reprendre/.test(e.avant || '')) { j.ko('bilan : le bouton de la présentation devrait dire « Reprendre » quand le CV est déjà déposé (« ' + e.avant + ' »)'); } else { j.ok('bilan : le bouton de la présentation dit « Reprendre »'); }
    j.info('Reprendre (présentation) : ' + await a.suiv()); await a.attendre(900);
    const apres = await a.ev(() => ({ pill: (document.querySelector('#preparerBloc1 .pilule-etat') || { innerText: '?' }).innerText, texte: document.getElementById('app').innerText.replace(/\s+/g, ' ').slice(0, 260) }));
    j.info('page Préparer retrouvée : pastille du CV « ' + apres.pill + ' »');
    if (!/relu/i.test(apres.pill) || /À relire/i.test(apres.pill)) { j.ko('bilan : après Retour puis Continuer, le CV déjà relu repasse à « ' + apres.pill + ' » et « Continuer » est de nouveau grisé'); }
    e = await a.ecran();
    const m2 = await E.mesureReprise(a, j, 'bilan (page de travail)');
    j.info('page Préparer retrouvée : bas « ' + e.avant + ' »');
    if (m2.encart || m2.gel) { j.ko('bilan : la page de travail reste grisée ou porte encore un encart après « Reprendre »'); } else { j.ok('bilan : la page de travail est libre après « Reprendre »'); }
    j.info('vers l’assistant : ' + await a.suiv()); await a.attendre(900);
    await a.verifier({ hash: '#bilan', etape: 'Assistant' });
    await R.versAssistant(a, j);
    e = await a.ecran(); j.info('écran de collage : bas « ' + e.avant + ' » raison « ' + e.raison + ' » barre ' + e.barre);
    const complete = ['Voici l’analyse.', '```json', JSON.stringify(REPONSE_BILAN, null, 2), '```'].join('\n');
    j.info('collage d’une réponse coupée : ' + await a.coller(complete.slice(0, Math.floor(complete.length * 0.5))));
    e = await a.ecran(); j.info('après la réponse coupée : bas « ' + e.avant + ' » raison « ' + e.raison + ' »');
    j.info('collage de la réponse complète : ' + await a.coller(complete));
    e = await a.ecran(); j.info('après la réponse complète : bas « ' + e.avant + ' » raison « ' + e.raison + ' »');
    const trace = await a.tracer(5, 'bilan (suite)');
    e = await a.ecran(); j.info('fin : ' + e.hash + ' « ' + e.h1 + ' » bas « ' + e.avant + ' » barre ' + e.barre);
    const btns = await a.ev(() => [].slice.call(document.querySelectorAll('#app button, #app summary')).filter((x) => window.__P.visible(x)).map((x) => (x.id ? '#' + x.id + ' ' : '') + window.__P.lib(x).slice(0, 40)).filter(Boolean).join(' ; '));
    j.info('boutons de fin : ' + btns);
    const vides = await a.ev(() => [].slice.call(document.querySelectorAll('#app button')).filter((x) => window.__P.visible(x) && !window.__P.lib(x) && !x.querySelector('i, svg, img') && !x.getAttribute('aria-label')).map((x) => x.outerHTML.slice(0, 200)).slice(0, 4));
    j.info('boutons sans nom sur le résultat : ' + JSON.stringify(vides));
    const txt = await a.ev(() => document.getElementById('app').innerText.replace(/\s+/g, ' ').slice(0, 900));
    j.info('texte de fin : ' + txt);
    const chemin = [];
    for (let i = 0; i < 12; i++) {
      const rr = await a.retour(); await a.attendre(700);
      const x = await a.ecran();
      chemin.push(rr === 'ok' ? x.hash.replace('#', '') + ':' + String(x.h1).replace(/[^\wÀ-ÿ ’']/g, '').trim().slice(0, 28) + '(' + (x.barre.match(/\[([^\]]*)\]/) || ['', ''])[1] + ')' + (x.fenetre ? '[fenêtre]' : '') : rr);
      if (rr !== 'ok' || x.hash === '#cv' || x.hash === '') { break; }
    }
    j.info('chaîne des « Retour » : ' + chemin.join(' < '));
    if (!/^cv:/.test(chemin[chemin.length - 1] || '')) { j.ko('bilan : la chaîne des « Retour » ne ramène pas à l’accueil : ' + chemin.join(' < ')); }
    // Retour dans le module par sa tuile avec l’analyse engagée : présentation avec le bloc, puis « Recommencer ».
    await a.ev(() => { demarrerBilanCandidature(); }); await a.attendre(1000);
    const m3 = await E.mesureReprise(a, j, 'bilan (retour par la tuile)');
    if (m3.forme === 'A') { j.ok('bilan : retour par la tuile = présentation avec le bloc « Reprendre / Recommencer »'); } else { j.ko('bilan : retour par la tuile sans le bloc « Reprendre / Recommencer »'); }
    await E.testerRecommencer(a, j, 'bilan', 'btnBilanRepriseRecommencer');
  }
};
