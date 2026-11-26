/* Départ commun des vidéos de chemin de « Bien utiliser l'IA » : l'écran d'entrée du module, rejoint hors film, mémoire vidée.
   Module ouvert au public depuis le 25/11/2026 (le film se tourne sur localhost, voir docs/video_presentation/LISEZMOI.md, « Vue publique »). */
const { dormir } = require('../lib');
const URL = 'http://localhost:8123/index.html';
async function partir(o) {
  const p = o.p;
  await p.goto(URL); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
  await p.evaluate(() => { try { localStorage.clear(); sessionStorage.clear(); } catch (e) {} }); await p.reload(); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
  await p.evaluate(() => naviguerVers('bien-utiliser-ia')); await dormir(1.5);
  await p.mouse.move(640, 620); o.mx = 640; o.my = 620; await dormir(0.4);
}
module.exports = { partir };
