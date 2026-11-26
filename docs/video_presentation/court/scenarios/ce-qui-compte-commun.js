/* Départ et parcours communs des trois films de partie de « Ce qui compte pour moi » (décision de Denis du 25/11/2026 : le film est sur la carte de chaque chemin, une partie = un film).
   Le film joue l'accueil réel du module : la partie se place en haut de l'écran, le pointeur passe sur ses cartes, puis la première carte s'ouvre sur sa page d'invitation.
   Aucune donnée de personne : rien n'est écrit dans le film. Mémoire vidée avant de tourner. */
const { dormir } = require('../lib');
const URL = 'http://localhost:8123/index.html';

async function partir(o) {
  const p = o.p;
  await p.goto(URL); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
  await p.evaluate(() => { try { localStorage.clear(); sessionStorage.clear(); } catch (e) {} }); await p.reload(); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
  await p.evaluate(() => naviguerVers('ce-qui-compte')); await dormir(1.5);
  await p.waitForSelector('.cqcpm-theme-bloc'); await dormir(0.5);
  await p.mouse.move(640, 620); o.mx = 640; o.my = 620; await dormir(0.4);
}

// rang : place de la partie dans l'accueil (0 = Ce que j'aimerais, 1 = Ce qui compte, 2 = Ce que j'ai vécu) ; premiere : la carte ouverte à la fin.
async function jouerPartie(o, rang, premiere) {
  const p = o.p, bloc = p.locator('.cqcpm-theme-bloc').nth(rang);
  await partir(o);
  o.commencer();
  await o.bloc('c1');
  const haut = await bloc.evaluate(e => e.getBoundingClientRect().top + window.scrollY - 90);
  await o.defiler(Math.max(0, haut), 1400); await dormir(0.6);
  await o.survol(bloc.locator('.tete h2'), 800); await dormir(0.6);
  await o.finDeVoix(0.3);
  await o.bloc('c2');
  const cartes = bloc.locator('.cqcpm-carte'), n = await cartes.count();
  for (let i = 0; i < n; i++) { await o.survol(cartes.nth(i).locator('h3'), 900); await dormir(1.4); }
  await o.finDeVoix(0.3);
  await o.bloc('c3');
  await o.cliquer(p.locator('[data-cqcpm-act="commencer-carte"][data-v="' + premiere + '"]'), 900); await dormir(1.6);
  await o.survol(p.locator('#app h1, #app h2').first(), 800); await dormir(1.0);
  await o.finDeVoix(1.0);
}
module.exports = { partir, jouerPartie };
