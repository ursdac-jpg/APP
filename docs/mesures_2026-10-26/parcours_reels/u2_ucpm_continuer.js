/* UCPM, page 1 : un seul « Continuer » (barre du bas). Vrais clics : avant dépôt (barre grisée, aucun bouton dans la page), après dépôt (barre active, aucun bouton dans la page),
   clic sur la barre = envoi à l'assistant, retour des métiers (« Refaire la demande » dans la page, barre active), clic sur la barre = page 2. Usage : CAPTURES=dossier node u2_ucpm_continuer.js */
process.env.CONTROLES = '0';
const L = require('./lib.js'); const S = require('./saisies4.js'); const fs = require('fs');
const REP = require('path').join(__dirname, '..', '..', 'essais_prompts_ucpm', 'reponses') + '/';
(async () => {
  const { b, p } = await L.ouvrir();
  const etat = (nom) => p.evaluate(() => ({ bouton: !!document.getElementById('btnUcpmVersAssistant'), barreActive: !!document.getElementById('btnSuivantNavigation') && !document.getElementById('btnSuivantNavigation').disabled, barreTexte: (document.getElementById('btnSuivantNavigation') || {}).textContent, refaire: !!document.getElementById('btnUcpmRefaireMetiers'), refaireRect: (function () { const e = document.getElementById('btnUcpmRefaireMetiers'); if (!e) return null; const q = e.getBoundingClientRect(); return [Math.round(q.left), Math.round(q.top)]; })(), h1: (document.querySelector('h1') || {}).textContent, vue: (document.querySelector('[data-ucpm-vue]') || {}).getAttribute ? document.querySelector('[data-ucpm-vue]').getAttribute('data-ucpm-vue') : null, texteCarte2: (document.querySelectorAll('.cv-section')[1] || {}).innerText && document.querySelectorAll('.cv-section')[1].innerText.replace(/\s+/g, ' ').slice(0, 260) })).then(e => { console.log(nom, JSON.stringify(e)); return e; });
  await L.carte(p, 'orientation', 'btnCarteAccueilUnCvPlusieursMetiers', 'tuile UCPM');
  await L.clic(p, '#btnUcpmCommencer', 'Commencer');
  await etat('1 avant dépôt');
  await S.deposerFichierDepuis(p, 'btnUcpmDeposer'); await p.waitForTimeout(800);
  await etat('2 après dépôt'); await L.photo(p, 'ucpm-continuer-2-apres-depot');
  await L.clic(p, '#btnSuivantNavigation', 'Continuer (barre) : envoi à l’assistant'); await p.waitForTimeout(1200);
  await etat('3 après clic sur la barre'); await L.photo(p, 'ucpm-continuer-3-passage');
  await S.assistantEtCollerBrut(p, fs.readFileSync(REP + '01_metiers_V5_chatgpt_1.txt', 'utf8'), 'ucpm-metiers'); await p.waitForTimeout(1000);
  await etat('4 après la réponse'); await L.photo(p, 'ucpm-continuer-4-recu');
  await L.clic(p, '#btnContinuerCollage', 'Continuer (collage) : la réponse est lue'); await p.waitForTimeout(3000); await etat('4 ter après la lecture de la réponse');
  await L.clic(p, '.barre-navigation-fixe .barre-navigation button:first-child', 'Retour (de la page 2 vers la page 1)'); await p.waitForTimeout(1500);
  const e5 = await etat('5 retour sur la page 1 avec les métiers reçus'); await L.photo(p, 'ucpm-continuer-5-depot-recu');
  await L.clic(p, '#btnSuivantNavigation', 'Continuer (barre) : page 2'); await p.waitForTimeout(1800); await etat('6 après « Continuer » de la barre');
  await L.clic(p, '.barre-navigation-fixe .barre-navigation button:first-child', 'Retour'); await p.waitForTimeout(1200);
  await L.clic(p, '#btnUcpmRefaireMetiers', 'Refaire la demande'); await p.waitForTimeout(800);
  console.log('fenêtre de confirmation :', await p.evaluate(() => { const x = document.querySelector('.fenetre-erip-overlay.visible'); return x ? x.innerText.replace(/\s+/g, ' ').slice(0, 160) : 'aucune'; }));
  console.log('erreurs :', JSON.stringify(p.errs));
  await b.close();
})();
