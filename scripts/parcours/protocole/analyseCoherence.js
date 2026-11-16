/* Protocole : carte « Outils d'analyse », tuile « Cohérence de mon dossier » (route coherence-transversale). Réponse de l'assistant SIMULÉE (format de prompts/coherence-transversale.md). */
const R = require('./reprendreCv.js');
const E = require('./enchainer.js');
const LETTRE_TEXTE = 'Madame, Monsieur,\n\nAgent d’accueil à la mairie de Bergerac pendant cinq ans, je souhaite mettre mon sens du contact au service de votre structure.\n\nJe reste à votre disposition pour un entretien.\n\nCordialement,\nCamille Martin';
async function deposer(a, j, suffixe, texte) {
  j.info('dépôt ' + suffixe + ' : coller ' + await a.clic('#depotPageColler-' + suffixe)); await a.attendre(600);
  const champ = await a.ev((s) => { const t = document.querySelector('#depotPageTexte-' + s) || document.querySelector('#depotPageTexte'); return t ? t.id : null; }, suffixe);
  j.info('dépôt ' + suffixe + ' : champ texte ' + champ);
  if (champ) { await a.saisir('#' + champ, texte); await a.attendre(400); }
  const lire = await a.ev((s) => { const b = document.querySelector('#depotPageLireTexte-' + s) || document.querySelector('#depotPageLireTexte'); if (b) { b.click(); return b.id; } return null; }, suffixe);
  j.info('dépôt ' + suffixe + ' : lire ' + lire); await a.attendre(1500);
  j.info('dépôt ' + suffixe + ' : retirer ' + await a.clic('', 'Retirer toutes les informations')); await a.attendre(700);
  const enr = await a.ev(() => { const b = [].slice.call(document.querySelectorAll('#verifDocBtnEnregistrer, [id^=verifDocBtnEnregistrer]')).filter((x) => window.__P.visible(x))[0]; if (b) { b.click(); return b.id; } return null; });
  j.info('dépôt ' + suffixe + ' : enregistrer ' + enr); await a.attendre(1500);
}
const REPONSE_COHERENCE = {
  syntheseGenerale: 'Vos documents se tiennent bien.', niveau: 'incoherences_mineures', syntheseNarrative: 'Le CV et la lettre parlent tous deux d’accueil. Un petit écart de durée est à corriger.',
  questionsEntretien: ['Pourquoi ce poste ?', 'Comment gérez-vous une personne mécontente ?'], lettreVersionCourte: 'Madame, Monsieur, agent d’accueil depuis cinq ans, je vous propose ma candidature.',
  parDocument: { cv: { titre: 'Agent d’accueil', pointsForts: ['Parcours régulier'], pointsFaibles: ['Peu de résultats chiffrés'] }, lettre: { titre: 'Agent d’accueil', pointsForts: ['Ton chaleureux'], pointsFaibles: ['Durée à vérifier'] } },
  constats: [{ ancrage: ['cv.experience[0]', 'lettre.paragraphe[0]'], nature: 'incoherence', dimension: 'durée', preuve: ['Agent d’accueil, mairie de Bergerac', 'pendant cinq ans'], message: 'La durée au poste n’est pas la même dans les deux documents.' }],
  recommandations: [{ constatsLies: [0], contenu: 'Aligner la durée au poste entre le CV et la lettre.', documentCible: 'lettre', modeApplication: 'conseil' }]
};
module.exports = {
  nom: 'analyseCoherence',
  REPONSE_COHERENCE,
  jouer: async (a, j) => {
    await a.aller('coherence-transversale');
    j.info('départ : ' + await a.clic('#ctBoutonJeCommence')); await a.attendre(900);
    let e = await a.verifier({ h1: 'Cohérence de mon dossier' });
    if (!/grisé/.test(e.avant || '') || !e.raison) { j.ko('cohérence : « Continuer » devrait être grisé avec une raison au départ (' + e.avant + ' / ' + e.raison + ')'); } else { j.ok('cohérence : « Continuer » grisé avec la raison « ' + e.raison + ' »'); }
    await deposer(a, j, 'cv', R.CV_TEXTE);
    e = await a.ecran(); j.info('après le CV : bas « ' + e.avant + ' » raison « ' + e.raison + ' »');
    await deposer(a, j, 'lettre', LETTRE_TEXTE);
    e = await a.ecran(); j.info('après la lettre : bas « ' + e.avant + ' » raison « ' + e.raison + ' »');
    j.info('pas d’entretien : ' + await a.clic('#btnCtCollecteSansEntretien')); await a.attendre(700);
    e = await a.ecran(); j.info('après « Je n’en ai pas » : bas « ' + e.avant + ' » raison « ' + e.raison + ' »');
    const bloc3 = await a.ev(() => { const h = [].slice.call(document.querySelectorAll('#app details, #app section')).filter((x) => /préparation d’entretien/i.test(x.innerText)).slice(-1)[0]; return h ? h.innerText.replace(/\s+/g, ' ').slice(0, 260) : 'bloc 3 introuvable'; });
    j.info('bloc 3 après « Je n’en ai pas » : ' + bloc3);
    await E.retourPuisReprendre(a, j, 'cohérence', async () => {
      const bas = await a.ecran();
      const garde = await a.ev(() => (document.getElementById('app').innerText.match(/Déposé/g) || []).length);
      return (garde >= 2 || !/grisé/.test(bas.avant || '')) ? true : 'bas ' + bas.avant + ' ' + bas.raison + ' déposés ' + garde;
    });
    e = await a.ecran();
    if (/Reprendre/.test(e.avant || '')) { j.info('Reprendre : ' + await a.suiv()); await a.attendre(900); }
    e = await a.ecran(); j.info('avant l’assistant : bas « ' + e.avant + ' » raison « ' + e.raison + ' »');
    j.info('vers l’assistant : ' + await a.suiv()); await a.attendre(900);
    await E.collerEtParcourir(a, j, 'cohérence', REPONSE_COHERENCE, 1);
    // « Recommencer » : on revient dans le module (comme depuis l'accueil), la présentation propose « Reprendre / Recommencer ».
    await a.ev(() => { ctDemarrer(); }); await a.attendre(900);
    await E.testerRecommencer(a, j, 'cohérence', 'ctRepriseRecommencer');
  }
};
