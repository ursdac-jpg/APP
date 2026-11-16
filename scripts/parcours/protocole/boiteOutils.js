/* Protocole : carte « Boîte à outils », tuiles Repères, Carnet et Lexique (gestes réels : noter, supprimer, annuler, chercher, Retour, reprise). */
const E = require('./enchainer.js');
const VISIBLE = () => window.__P.visible;
async function nb(a, sel) { return a.ev((s) => [].slice.call(document.querySelectorAll(s)).filter((x) => window.__P.visible(x)).length, sel); }
const FEN = '#fenetreERIP.visible button, .fenetre-erip-overlay.visible button, .modal.show button';
async function boutonsFenetre(a) { return a.ev((q) => [].slice.call(document.querySelectorAll(q)).filter((x) => window.__P.visible(x)).map((x) => (x.id ? '#' + x.id + ' ' : '') + window.__P.lib(x).slice(0, 40)).join(' ; '), FEN); }
async function texteFenetre(a) { return a.ev(() => { const f = document.querySelector('#fenetreERIP.visible, .fenetre-erip-overlay.visible, .modal.show'); return f ? f.innerText.split(/\s+/).join(' ').slice(0, 400) : 'aucune'; }); }
async function texte(a, n) { return a.ev((m) => document.getElementById('app').innerText.replace(/\s+/g, ' ').slice(0, m), n || 500); }
async function carnet(a, j) {
  await a.aller('carnet');
  j.info('Carnet : ouvrir : ' + await a.clic('#btnCarnetIntroOuvrir')); await a.attendre(700);
  j.info('Carnet : noter sans texte : ' + await a.clic('#btnCarnetGarder')); await a.attendre(500);
  let n = await nb(a, '[data-carnet-id]');
  if (n !== 0) { j.ko('carnet : « Noter » sans texte a créé ' + n + ' note(s)'); } else { j.ok('carnet : « Noter » sans texte ne crée rien'); }
  await a.saisir('#carnetTexteNouveau', 'Penser à demander une attestation à mon ancien employeur.'); await a.attendre(300);
  j.info('Carnet : noter : ' + await a.clic('#btnCarnetGarder')); await a.attendre(700);
  n = await nb(a, '[data-carnet-id]');
  const champ = await a.ev(() => (document.getElementById('carnetTexteNouveau') || {}).value);
  if (n !== 1) { j.ko('carnet : après « Noter », ' + n + ' note(s) visible(s) au lieu de 1'); } else { j.ok('carnet : la note apparaît dans la liste'); }
  if (champ) { j.ko('carnet : le champ de saisie n’est pas vidé après « Noter » (« ' + champ + ' »)'); } else { j.ok('carnet : le champ est vidé après « Noter »'); }
  j.info('Carnet : boutons : ' + await E.boutons(a));
  // Retour puis revenir : la note est gardée.
  const r = await a.retour(); let e = await a.ecran();
  j.info('Carnet : Retour : ' + r + ' → ' + e.hash + ' « ' + e.h1 + ' » bas « ' + e.avant + ' »');
  if (e.hash === '#carnet' && /Ouvrir|Commencer/.test(e.avant || '')) { j.info('Carnet : rouvrir : ' + await a.suiv()); await a.attendre(700); }
  n = await nb(a, '[data-carnet-id]');
  if (n !== 1) { j.ko('carnet : après Retour puis réouverture, la note est perdue (' + n + ')'); } else { j.ok('carnet : la note est gardée après Retour et réouverture'); }
  // Supprimer puis annuler la suppression.
  j.info('Carnet : supprimer : ' + await a.clic('[data-carnet-supprimer]')); await a.attendre(600);
  j.info('Carnet : confirmation : ' + await texteFenetre(a) + ' | boutons : ' + await boutonsFenetre(a));
  j.info('Carnet : confirmer : ' + await a.clic(FEN, 'Supprimer')); await a.attendre(700);
  n = await nb(a, '[data-carnet-id]');
  const annuler = await nb(a, '[data-carnet-annuler-suppression]');
  j.info('Carnet : après suppression : ' + n + ' note(s), bouton annuler ' + annuler + ', texte ' + await texte(a, 300));
  if (!annuler) { j.ko('carnet : aucun moyen d’annuler une suppression par erreur'); } else {
    j.info('Carnet : annuler la suppression : ' + await a.clic('[data-carnet-annuler-suppression]')); await a.attendre(600);
    n = await nb(a, '[data-carnet-id]');
    if (n !== 1) { j.ko('carnet : « Annuler » ne remet pas la note (' + n + ')'); } else { j.ok('carnet : la suppression peut être annulée'); }
  }
  // Transformer en Repère.
  j.info('Carnet : transformer en Repère : ' + await a.clic('[data-carnet-transformer]')); await a.attendre(900);
  e = await a.ecran(); j.info('Carnet : après « Transformer en Repère » : ' + e.hash + ' « ' + e.h1 + ' » fenêtre ' + e.fenetre + ' texte ' + await texte(a, 300));
  const types = await a.ev(() => [].slice.call(document.querySelectorAll('#reperesPickerTransformation [data-repere-type]')).filter((x) => window.__P.visible(x)).length);
  j.info('Carnet : fenêtre : ' + await texteFenetre(a) + ' | boutons : ' + await boutonsFenetre(a));
  if (types < 4) { j.ko('carnet : la fenêtre « Transformer en Repère » ne montre pas les choix de type (' + types + ' visible(s))'); } else { j.ok('carnet : la fenêtre « Transformer en Repère » montre les ' + types + ' types'); }
  if (types) {
    j.info('Carnet : choix du type « Question » : ' + await a.clic('#reperesPickerTransformation [data-repere-type]')); await a.attendre(900);
    const fermee = await a.ev(() => !document.querySelector('#fenetreERIP.visible, .fenetre-erip-overlay.visible, .modal.show'));
    if (!fermee) { j.ko('carnet : la fenêtre reste ouverte après le choix du type'); } else { j.ok('carnet : la fenêtre se ferme après le choix du type'); }
    const marque = await a.ev(() => document.getElementById('app').innerText.replace(/\s+/g, ' ').slice(0, 900));
    j.info('Carnet : note après transformation : ' + marque);
  }
}
async function reperes(a, j) {
  await a.aller('reperes');
  let e = await a.ecran();
  if (/Je commence|Commencer/.test(e.avant || '')) { j.info('Repères : commencer : ' + await a.suiv()); await a.attendre(700); }
  let n = await nb(a, '.reperes-item');
  j.info('Repères : ' + n + ' Repère(s) en arrivant, texte : ' + await texte(a, 400));
  j.info('Repères : garder une réflexion : ' + await a.clic('', 'Garder une réflexion')); await a.attendre(600);
  const types = await nb(a, '[data-repere-type]');
  if (types < 4) { j.ko('repères : « Garder une réflexion » ne montre pas les types (' + types + ')'); } else { j.ok('repères : « Garder une réflexion » montre les ' + types + ' types'); }
  j.info('Repères : choix du type « Idée » : ' + await a.clic('[data-repere-type="idee"]')); await a.attendre(900);
  j.info('Repères : fenêtre de saisie : ' + await texteFenetre(a) + ' | boutons : ' + await boutonsFenetre(a));
  await a.saisir('#reperesSaisieTexte', 'Je voudrais essayer l’accueil en médiathèque.'); await a.attendre(500);
  j.info('Repères : titre proposé : « ' + await a.ev(() => (document.getElementById('reperesSaisieTitre') || {}).value) + ' »');
  j.info('Repères : « C’est noté » : ' + await a.clic('#reperesSaisieTerminer')); await a.attendre(900);
  n = await nb(a, '.reperes-item');
  if (n < 1) { j.ko('repères : après « C’est noté », aucun Repère dans la liste'); } else { j.ok('repères : le Repère noté apparaît dans la liste (' + n + ')'); }
  j.info('Repères : liste : ' + await texte(a, 600));
  // Retour et retour : le Repère est gardé.
  const r = await a.retour(); e = await a.ecran();
  j.info('Repères : Retour : ' + r + ' → ' + e.hash + ' « ' + e.h1 + ' » bas « ' + e.avant + ' »');
  if (/Je commence|Je reprends|Commencer|Reprendre/.test(e.avant || '')) { j.info('Repères : rouvrir : ' + await a.suiv()); await a.attendre(700); }
  const n2 = await nb(a, '.reperes-item');
  if (n2 !== n) { j.ko('repères : après Retour puis réouverture, ' + n2 + ' Repère(s) au lieu de ' + n); } else { j.ok('repères : les Repères sont gardés après Retour et réouverture'); }
  await E.chaineRetour(a, j, 'repères');
}
async function lexique(a, j) {
  await a.aller('lexique');
  j.info('Lexique : ouvrir : ' + await a.clic('#btnLexiqueIntroOuvrir')); await a.attendre(900);
  const champs = await a.ev(() => [].slice.call(document.querySelectorAll('#app input')).filter((x) => window.__P.visible(x)).map((x) => (x.id || x.name || x.type) + '|' + (x.getAttribute('placeholder') || '')));
  j.info('Lexique : champs : ' + JSON.stringify(champs));
  // Recherche sans résultat.
  await a.saisir('#lexiqueRechercheInput', 'zzzqqxx'); await a.attendre(900);
  j.info('Lexique : recherche sans résultat : ' + await a.ev(() => (document.getElementById('lexiqueResultats') || {}).innerText.replace(/\s+/g, ' ').slice(0, 300)));
  // Recherche normale.
  await a.saisir('#lexiqueRechercheInput', 'alternance'); await a.attendre(1100);
  let n = await nb(a, '#lexiqueResultats [data-lexique-fiche]');
  j.info('Lexique : « alternance » : ' + n + ' résultat(s) : ' + await a.ev(() => (document.getElementById('lexiqueResultats') || {}).innerText.replace(/\s+/g, ' ').slice(0, 300)));
  if (!n) { j.ko('lexique : la recherche « alternance » ne donne aucun résultat'); } else { j.ok('lexique : la recherche donne des résultats'); }
  j.info('Lexique : ouvrir la première fiche : ' + await a.clic('#lexiqueResultats [data-lexique-fiche]')); await a.attendre(900);
  let e = await a.ecran();
  j.info('Lexique : fiche : ' + e.hash + ' « ' + e.h1 + ' » bas « ' + e.avant + ' » boutons : ' + await E.boutons(a));
  const favori = await a.ev(() => { const b = [].slice.call(document.querySelectorAll('#app button')).filter((x) => window.__P.visible(x) && /favori/i.test((x.innerText || '') + (x.getAttribute('aria-label') || '') + (x.title || '')))[0]; return b ? (b.id || '') + '|' + (b.innerText || b.getAttribute('aria-label') || '').trim() : null; });
  j.info('Lexique : bouton favori : ' + favori);
  if (favori) {
    j.info('Lexique : mettre en favori : ' + await a.clic('', 'avori')); await a.attendre(600);
    j.info('Lexique : après favori : ' + await a.ev(() => [].slice.call(document.querySelectorAll('#app button')).filter((x) => window.__P.visible(x) && /favori/i.test((x.innerText || '') + (x.getAttribute('aria-label') || '') + (x.title || ''))).map((x) => (x.innerText || x.getAttribute('aria-label') || '').trim() + ' pressed=' + x.getAttribute('aria-pressed')).join(' ; ')));
  }
  const r = await a.retour(); e = await a.ecran();
  j.info('Lexique : Retour depuis la fiche : ' + r + ' → ' + e.hash + ' « ' + e.h1 + ' » champ « ' + await a.ev(() => (document.getElementById('lexiqueRechercheInput') || {}).value) + ' » résultats ' + await nb(a, '#lexiqueResultats [data-lexique-fiche]'));
  j.info('Lexique : mes favoris : ' + await a.clic('#lexiqueVoirFavoris')); await a.attendre(900);
  j.info('Lexique : favoris : ' + await texte(a, 400) + ' | fiches ' + await nb(a, '[data-lexique-fiche]'));
  for (let k = 0; k < 3; k++) { const rr = await a.retour(); await a.attendre(700); const x = await a.ecran(); j.info('Lexique : Retour ' + (k + 1) + ' : ' + rr + ' → ' + x.hash + ' « ' + x.h1 + ' » fenêtre ' + x.fenetre + (x.fenetre ? ' : ' + await texteFenetre(a) + ' | ' + await boutonsFenetre(a) : '')); if (/^#(cv|)$/.test(x.hash)) { break; } }
}
module.exports = {
  nom: 'boiteOutils',
  jouer: async (a, j) => {
    const quoi = (process.env.OUTILS || 'carnet,reperes,lexique').split(',');
    if (quoi.includes('carnet')) { await carnet(a, j); }
    if (quoi.includes('reperes')) { await reperes(a, j); }
    if (quoi.includes('lexique')) { await lexique(a, j); }
  }
};
