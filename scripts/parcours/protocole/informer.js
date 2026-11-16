/* Protocole : carte « Se tenir informé », tuiles Comprendre le cadre, Comprendre les chiffres, Qui fait quoi (choix du département, sujets ouverts, Retour, mémoire du département). */
const E = require('./enchainer.js');
const FEN = '#fenetreERIP.visible button, .fenetre-erip-overlay.visible button, .modal.show button';
async function boutonsFenetre(a) { return a.ev((q) => [].slice.call(document.querySelectorAll(q)).filter((x) => window.__P.visible(x)).map((x) => (x.id ? '#' + x.id + ' ' : '') + window.__P.lib(x).slice(0, 40)).join(' ; '), FEN); }
async function texteFenetre(a) { return a.ev(() => { const f = document.querySelector('#fenetreERIP.visible, .fenetre-erip-overlay.visible, .modal.show'); return f ? f.innerText.split(/\s+/).join(' ').slice(0, 500) : 'aucune'; }); }
async function texte(a, n) { return a.ev((m) => document.getElementById('app').innerText.split(/\s+/).join(' ').slice(0, m), n || 500); }
const MODULES = [
  { nom: 'cadre', intro: 'se-tenir-informe-intro', commencer: '#btnSeTenirInformeCommencer', hash: 'comprendre-le-cadre', sujet: 'Emploi et contrats' },
  { nom: 'chiffres', intro: 'comprendre-les-chiffres-intro', commencer: '#btnComprendreLesChiffresCommencer', hash: 'comprendre-les-chiffres', sujet: null },
  { nom: 'qui fait quoi', intro: 'mon-territoire-intro', commencer: '#btnMonTerritoireCommencer', hash: 'mon-territoire', sujet: null }
];
async function jouerModule(a, j, m) {
  const nom = m.nom;
  await a.aller(m.intro);
  j.info(nom + ' : commencer : ' + await a.clic(m.commencer)); await a.attendre(900);
  let e = await a.verifier({ hash: '#' + m.hash });
  j.info(nom + ' : arrivée : bas « ' + e.avant + ' » raison « ' + e.raison + ' »');
  j.info(nom + ' : choisir le département : ' + await a.clic('', 'Choisir mon département')); await a.attendre(900);
  j.info(nom + ' : fenêtre : ' + await texteFenetre(a));
  j.info(nom + ' : Dordogne : ' + await a.clic(FEN, 'Dordogne')); await a.attendre(1500);
  e = await a.ecran();
  j.info(nom + ' : après le choix : ' + e.hash + ' « ' + e.h1 + ' » fenêtre ' + e.fenetre + ' bas « ' + e.avant + ' » texte : ' + await texte(a, 700));
  j.info(nom + ' : boutons : ' + (await E.boutons(a)).slice(0, 900));
  if (m.sujet) {
    j.info(nom + ' : ouvrir « ' + m.sujet + ' » : ' + await a.clic('', m.sujet)); await a.attendre(1200);
    e = await a.ecran();
    j.info(nom + ' : sujet : ' + e.hash + ' « ' + e.h1 + ' » bas « ' + e.avant + ' » texte : ' + await texte(a, 500));
    j.info(nom + ' : boutons du sujet : ' + (await E.boutons(a)).slice(0, 700));
  }
  // Retour : on revient d'un cran à chaque fois.
  const chemin = [];
  for (let k = 0; k < 6; k++) {
    const rr = await a.retour(); await a.attendre(700);
    const x = await a.ecran();
    chemin.push(rr === 'ok' ? x.hash + ' « ' + String(x.h1).slice(0, 28) + ' »' + (x.fenetre ? ' [FENÊTRE]' : '') : rr);
    if (rr !== 'ok' || /^#(cv|)$/.test(x.hash)) { break; }
  }
  j.info(nom + ' : chaîne des Retour : ' + chemin.join(' < '));
  const fin = await a.ecran();
  if (!/^#(cv|)$/.test(fin.hash)) { j.ko(nom + ' : la chaîne des Retour ne ramène pas à l’accueil (fin sur ' + fin.hash + ')'); } else { j.ok(nom + ' : la chaîne des Retour ramène à l’accueil'); }
  // Retour dans le module : le département est-il gardé ?
  await a.aller(m.intro);
  j.info(nom + ' : rouvrir : ' + await a.clic(m.commencer)); await a.attendre(1000);
  e = await a.ecran();
  const redemande = await a.ev(() => /Avant de commencer, indiquez votre département|Choisir mon département/.test(document.getElementById('app').innerText));
  j.info(nom + ' : réouverture : ' + e.hash + ' département redemandé : ' + redemande + ' texte : ' + await texte(a, 300));
  if (redemande) { j.ko(nom + ' : le département choisi est redemandé à la réouverture du module'); } else { j.ok(nom + ' : le département choisi est gardé'); }
}
module.exports = {
  nom: 'informer',
  jouer: async (a, j) => {
    const filtre = process.env.MODULES ? process.env.MODULES.split(',') : null;
    for (const m of MODULES) { if (!filtre || filtre.includes(m.nom)) { await jouerModule(a, j, m); } }
  }
};
