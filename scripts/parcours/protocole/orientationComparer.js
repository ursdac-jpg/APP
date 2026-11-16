/* Protocole : carte « Vous hésitez encore ? », tuile « Comparer mes pistes » (route aide-decision-intro puis comparer-pistes). Exploration par étapes. */
const E = require('./enchainer.js');
module.exports = {
  nom: 'orientationComparer',
  jouer: async (a, j) => {
    await a.aller('aide-decision-intro');
    j.info('départ : ' + await a.clic('#btnAideDecisionCommencer')); await a.attendre(900);
    let e = await a.verifier({ hash: '#comparer-pistes' });
    if (!/grisé/.test(e.avant || '') || !e.raison) { j.ko('comparer : « Continuer » devrait être grisé avec une raison au départ (' + e.avant + ' / ' + e.raison + ')'); } else { j.ok('comparer : « Continuer » grisé avec la raison « ' + e.raison + ' »'); }
    j.info('Je nomme mes pistes : ' + await a.clic('', 'Je nomme mes pistes')); await a.attendre(600);
    const champs = await a.ev(() => [].slice.call(document.querySelectorAll('#app textarea, #app input[type=text]')).filter((x) => window.__P.visible(x)).map((x) => (x.id || x.name || '?') + '|' + (x.getAttribute('placeholder') || '').slice(0, 40)));
    j.info('champs visibles : ' + JSON.stringify(champs));
    const noms = await a.ev(() => {
      const t = [].slice.call(document.querySelectorAll('#app textarea, #app input[type=text]')).filter((x) => window.__P.visible(x));
      const vals = ['Aide-soignante', 'Je suis attirée par le soin et le contact.', 'Éducatrice spécialisée', 'Je voudrais accompagner des enfants.'];
      t.slice(0, 4).forEach((x, i) => { const p = x.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(p, 'value').set.call(x, vals[i]); x.dispatchEvent(new Event('input', { bubbles: true })); x.dispatchEvent(new Event('change', { bubbles: true })); });
      return t.length;
    });
    j.info('champs remplis : ' + noms); await a.attendre(600);
    e = await a.ecran(); j.info('après les pistes : bas « ' + e.avant + ' » raison « ' + e.raison + ' »');
    j.info('situation : ' + await a.clic('', '^Sans emploi$')); await a.attendre(500);
    j.info('âge : ' + await a.clic('', '^26 à 45 ans$')); await a.attendre(700);
    e = await a.ecran(); j.info('après situation et âge : bas « ' + e.avant + ' » raison « ' + e.raison + ' »');
    if (/grisé/.test(e.avant || '')) { j.ko('comparer : « Continuer » reste grisé alors que pistes, situation et âge sont donnés (' + e.raison + ')'); } else { j.ok('comparer : « Continuer » dégrisé'); }
    // Retour depuis la première page : où mène-t-il ?
    const r1 = await a.retour(); e = await a.ecran();
    j.info('Retour depuis la première page du module : ' + r1 + ' → ' + e.hash + ' « ' + e.h1 + ' » bas « ' + e.avant + ' » fenêtre ' + e.fenetre);
    if (e.hash !== '#aide-decision-intro') { j.ko('comparer : « Retour » depuis le premier écran devrait ramener à la présentation du module, comme les autres modules (arrivé sur ' + e.hash + ')'); } else { j.ok('comparer : « Retour » du premier écran ramène à la présentation, comme les autres modules'); }
    // La personne est revenue à l'accueil : elle rouvre la carte et la tuile.
    await a.ev(() => { ouvrirCarteAccueil('orientation'); }); await a.attendre(900);
    j.info('tuile : ' + await a.clic('#btnCarteAccueilComparerPistes')); await a.attendre(1500);
    e = await a.ecran(); j.info('après la tuile : ' + e.hash + ' « ' + e.h1 + ' » bas « ' + e.avant + ' » encart de reprise ' + (await a.ev(() => !!document.querySelector('#app .encart-reprise-module'))));
    if (e.hash === '#aide-decision-intro') {
      const m1 = await E.mesureReprise(a, j, 'comparer (présentation)');
      if (m1.forme === 'A') { j.ok('comparer : la reprise a la forme de « Reprendre mon CV » (bloc sur la présentation, « Recommencer » seul, « Reprendre » en bas à droite)'); } else { j.ko('comparer : la reprise n’a pas la forme de « Reprendre mon CV » (consigne 258)'); }
      j.info('bouton de la présentation : ' + await a.suiv()); await a.attendre(900);
    }
    e = await a.ecran(); j.info('retour dans le module : ' + e.hash + ' bas « ' + e.avant + ' » raison « ' + e.raison + ' »');
    await E.mesureReprise(a, j, 'comparer');
    const garde = await a.ev(() => [].slice.call(document.querySelectorAll('#app textarea, #app input[type=text]')).map((x) => x.value).filter(Boolean));
    j.info('contenu gardé : ' + JSON.stringify(garde));
    if (!garde.length) { j.ko('comparer : après Retour puis le bouton de la présentation, les pistes saisies sont perdues'); } else { j.ok('comparer : les pistes saisies sont gardées'); }
    const reprendre = await a.ev(() => !!document.querySelector('#app .encart-reprise-module'));
    j.info('encart de reprise : ' + reprendre);
    if (/Reprendre/.test(e.avant || '')) { j.info('Reprendre : ' + await a.suiv()); await a.attendre(900); }
    const trace = await a.tracer(2, 'comparer (suite)');
    e = await a.ecran(); j.info('suite : ' + e.hash + ' « ' + e.h1 + ' » bas « ' + e.avant + ' » barre ' + e.barre);
    j.info('boutons : ' + await E.boutons(a));
    j.info('texte : ' + await a.ev(() => document.getElementById('app').innerText.replace(/\s+/g, ' ').slice(0, 800)));
    // « Recommencer » : retour à la présentation, confirmation, annulation, puis remise à froid.
    await a.aller('aide-decision-intro'); await a.attendre(900);
    await E.testerRecommencer(a, j, 'comparer', 'btnComparerRepriseRecommencer');
  }
};
