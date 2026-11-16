/* Fin commune des parcours « assistant » (consigne 249) : choix de l'assistant simulé, réponse coupée puis complète, avance jusqu'au résultat, chaîne des « Retour » jusqu'à l'accueil. */
const R = require('./reprendreCv.js');
async function boutons(a) { return a.ev(() => [].slice.call(document.querySelectorAll('#app button, #app summary')).filter((x) => window.__P.visible(x)).map((x) => (x.id ? '#' + x.id + ' ' : '') + window.__P.lib(x).slice(0, 40)).filter(Boolean).join(' ; ')); }
async function chaineRetour(a, j, nom) {
  const chemin = [];
  for (let i = 0; i < 12; i++) {
    const rr = await a.retour(); await a.attendre(700);
    const x = await a.ecran();
    chemin.push(rr === 'ok' ? x.hash.replace('#', '') + ':' + String(x.h1).replace(/[^\wÀ-ÿ ’']/g, '').trim().slice(0, 28) + (x.fenetre ? '[fenêtre]' : '') : rr);
    if (rr !== 'ok' || x.hash === '#cv' || x.hash === '') { break; }
  }
  j.info(nom + ' : chaîne des « Retour » : ' + chemin.join(' < '));
  if (!/^cv:/.test(chemin[chemin.length - 1] || '')) { j.ko(nom + ' : la chaîne des « Retour » ne ramène pas à l’accueil : ' + chemin.join(' < ')); }
  return chemin;
}
// reponse : objet JSON simulé ; suite : nombre maximum d'avances après la réponse complète ; sansChaine : ne pas remonter par « Retour » (le scénario continue lui-même).
async function collerEtParcourir(a, j, nom, reponse, suite, sansChaine) {
  await R.versAssistant(a, j);
  let e = await a.ecran(); j.info(nom + ' : écran de collage : bas « ' + e.avant + ' » raison « ' + e.raison + ' » barre ' + e.barre);
  j.info(nom + ' : boutons du collage : ' + await boutons(a));
  const complete = ['Voici le résultat.', '```json', JSON.stringify(reponse, null, 2), '```'].join('\n');
  const rc = await a.coller(complete.slice(0, Math.floor(complete.length * 0.5)));
  j.info(nom + ' : réponse coupée : ' + rc);
  if (rc !== 'etat:coupe') { j.ko(nom + ' : une réponse coupée n’est pas reconnue comme coupée (' + rc + ')'); }
  e = await a.ecran(); j.info(nom + ' : après la réponse coupée : bas « ' + e.avant + ' » raison « ' + e.raison + ' »');
  const rf = await a.coller(complete);
  j.info(nom + ' : réponse complète : ' + rf);
  if (rf !== 'etat:recu') { j.ko(nom + ' : la réponse simulée complète n’est pas reçue (' + rf + ')'); }
  e = await a.ecran(); j.info(nom + ' : après la réponse complète : bas « ' + e.avant + ' » raison « ' + e.raison + ' »');
  await a.tracer(suite || 4, nom + ' (suite)');
  e = await a.ecran(); j.info(nom + ' : fin : ' + e.hash + ' « ' + e.h1 + ' » bas « ' + e.avant + ' » barre ' + e.barre);
  j.info(nom + ' : boutons de fin : ' + await boutons(a));
  j.info(nom + ' : texte de fin : ' + await a.ev(() => document.getElementById('app').innerText.replace(/\s+/g, ' ').slice(0, 800)));
  if (sansChaine) { return null; }
  if (e.hash === '#cv' || e.hash === '') { j.ok(nom + ' : le dernier bouton ramène à l’accueil'); return []; }
  return chaineRetour(a, j, nom);
}
// « Retour » depuis la page « Préparer » vers la présentation, puis le bouton de la présentation : le travail déjà fait doit être gardé.
async function retourPuisReprendre(a, j, nom, verifGarde) {
  j.info(nom + ' : Retour : ' + await a.retour());
  const e = await a.ecran();
  j.info(nom + ' : présentation après Retour : ' + e.hash + ' « ' + e.h1 + ' » bas « ' + e.avant + ' »');
  const m1 = await mesureReprise(a, j, nom + ' (présentation)');
  j.info(nom + ' : Continuer (présentation) : ' + await a.suiv()); await a.attendre(900);
  const m2 = await mesureReprise(a, j, nom + ' (page de travail)');
  const forme = (m1.forme || m2.forme);
  if (forme === 'A') { j.ok(nom + ' : la reprise a la forme de « Reprendre mon CV » (encart sur la présentation, « Recommencer » seul, « Reprendre » en bas à droite)'); if (m2.encart || m2.gel) { j.ko(nom + ' : la page de travail reste grisée ou porte encore un encart après « Reprendre »'); } }
  else if (forme === 'B') { j.ko(nom + ' : la reprise n’a pas encore la forme de « Reprendre mon CV » : encart sur la page de travail grisée, en haut à droite (consigne 258)'); }
  else { j.ko(nom + ' : aucun encart de reprise trouvé ni sur la présentation ni sur la page de travail'); }
  const garde = await verifGarde();
  if (garde !== true) { j.ko(nom + ' : après Retour puis le bouton de la présentation, le travail déjà fait est perdu (' + garde + ')'); } else { j.ok(nom + ' : le travail déjà fait est gardé après Retour puis le bouton de la présentation'); }
}
// Mesure de la reprise d'un module (retour de Denis, 12/11/2026) : où est l'encart « Reprendre / Recommencer », où est « Reprendre » dans la barre du bas, tout est-il aligné comme dans
// « Reprendre mon CV » (« Reprendre » à droite, Retour à gauche, Accueil au milieu, tous sur UNE seule ligne). Appelée juste après être entré dans un module déjà commencé.
async function mesureReprise(a, j, nom) {
  const m = await a.ev(() => {
    const r = (x) => { const b = x.getBoundingClientRect(); return { l: Math.round(b.left), t: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height), r: Math.round(b.right) }; };
    const bar = document.querySelector('.barre-navigation-fixe .barre-navigation');
    const enfants = bar ? [].slice.call(bar.children).map((x) => x.tagName.toLowerCase() + (x.textContent.trim() ? ':' + x.textContent.trim().slice(0, 14) : ':vide')) : [];
    const boutons = bar ? [].slice.call(bar.querySelectorAll(':scope > button')).filter((x) => window.__P.visible(x)).map((x) => ({ n: window.__P.lib(x).slice(0, 18), ...r(x) })) : [];
    const encB = document.querySelector('#app .encart-reprise-module');
    const rec = [].slice.call(document.querySelectorAll('#app button.btn-recommencer-module')).filter((x) => !x.closest('.encart-reprise-module'))[0];
    const enc = encB || (rec ? rec.closest('.cv-section') : null);
    const bandeEnc = encB ? encB.closest('.bande-reprise-module-droite') : null;
    return {
      largeur: window.innerWidth, enfants, boutons, forme: encB ? 'B' : (rec ? 'A' : ''),
      encart: enc ? { ...r(enc), boutons: [].slice.call(enc.querySelectorAll('button')).map((x) => window.__P.lib(x)), texte: enc.querySelector('p') ? enc.querySelector('p').textContent.trim() : '' } : null,
      bandeEncart: bandeEnc ? r(bandeEnc) : null,
      gel: !!document.querySelector('#app .module-gel-actif')
    };
  });
  const bas = m.boutons.map((x) => x.n + '@' + x.l + ',' + x.t).join(' | ');
  const forme = m.encart ? ('encart ' + (m.forme === 'A' ? '(forme « Reprendre mon CV », sur la présentation) ' : '(forme page grisée) ') + (m.encart.l > m.largeur / 2 ? 'à droite' : 'à gauche') + ' (' + m.encart.l + ',' + m.encart.t + ' ' + m.encart.w + ' px) [' + m.encart.boutons.join(' + ') + '], page ' + (m.gel ? 'grisée' : 'non grisée')) : 'aucun encart';
  j.info(nom + ' : reprise : ' + forme + ' | barre du bas : ' + bas + ' | éléments : ' + m.enfants.join(' '));
  const lignes = m.boutons.map((x) => x.t + x.h / 2);
  if (lignes.length && Math.max(...lignes) - Math.min(...lignes) > 6) { j.ko(nom + ' : reprise : les boutons de la barre du bas ne sont pas sur la même ligne (' + bas + ')'); } else { j.ok(nom + ' : reprise : les boutons de la barre du bas sont sur une seule ligne'); }
  if (m.enfants.length > 3 + (m.enfants.some((x) => /^span:[^v]/.test(x)) ? 1 : 0)) { j.ko(nom + ' : reprise : la barre du bas a trop d’éléments (' + m.enfants.join(' ') + ')'); }
  const retour = m.boutons.find((x) => /Retour/.test(x.n)), accueil = m.boutons.find((x) => /Accueil/.test(x.n)), droite = m.boutons[m.boutons.length - 1];
  if (m.encart) {
    if (!droite || !/^Reprendre/.test(droite.n)) { j.ko(nom + ' : reprise : le bouton de droite de la barre du bas devrait s’appeler « Reprendre » (« ' + (droite ? droite.n : 'aucun') + ' »)'); }
    else if (retour && Math.abs((m.largeur - droite.r) - retour.l) > 14) { j.ko(nom + ' : reprise : « Reprendre » n’est pas calé à droite comme « Retour » l’est à gauche (marge ' + (m.largeur - droite.r) + ' px contre ' + retour.l + ' px)'); }
    else { j.ok(nom + ' : reprise : « Reprendre » est calé à droite de la barre du bas'); }
  }
  if (m.largeur >= 700 && accueil && retour && droite && Math.abs((accueil.l + accueil.w / 2) - m.largeur / 2) > 20) { j.ko(nom + ' : reprise : « Accueil » n’est plus au centre de la barre du bas'); }
  return m;
}
// « Recommencer » depuis la présentation : demande de confirmation, « Annuler » ne détruit rien, « Recommencer » remet la présentation à froid.
const FEN_RECOMMENCER = '#fenetreERIP.visible button, .fenetre-erip-overlay.visible button, .modal.show button';
async function testerRecommencer(a, j, nom, idRecommencer) {
  j.info(nom + ' : Recommencer : ' + await a.clic('#' + idRecommencer)); await a.attendre(700);
  let e = await a.ecran();
  if (!e.fenetre) { j.ko(nom + ' : « Recommencer » ne demande aucune confirmation avant d’effacer le travail'); return; }
  j.ok(nom + ' : « Recommencer » demande une confirmation');
  j.info(nom + ' : Annuler : ' + await a.clic(FEN_RECOMMENCER, '^Annuler')); await a.attendre(700);
  const encoreLa = await a.ev((id) => !!document.getElementById(id), idRecommencer);
  if (!encoreLa) { j.ko(nom + ' : après « Annuler », la reprise a disparu (le travail aurait été perdu)'); } else { j.ok(nom + ' : « Annuler » garde le travail et la reprise'); }
  await a.clic('#' + idRecommencer); await a.attendre(700);
  j.info(nom + ' : confirmer : ' + await a.clic(FEN_RECOMMENCER, '^Recommencer')); await a.attendre(1200);
  e = await a.ecran();
  const apres = await a.ev((id) => ({ encart: !!document.getElementById(id), texte: document.getElementById('app').innerText.split(/\s+/).join(' ').slice(0, 160) }), idRecommencer);
  j.info(nom + ' : après « Recommencer » : ' + e.hash + ' bas « ' + e.avant + ' » ' + apres.texte);
  if (apres.encart || /Reprendre/.test(e.avant || '')) { j.ko(nom + ' : après « Recommencer », la présentation propose encore de reprendre'); } else { j.ok(nom + ' : après « Recommencer », la présentation repart à froid'); }
}
module.exports = { boutons, chaineRetour, collerEtParcourir, retourPuisReprendre, mesureReprise, testerRecommencer };
