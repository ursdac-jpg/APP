/* Présentation de « Bien utiliser l'IA » (environ 1 minute) : la page de présentation (à quoi ça sert, les quatre chemins, ce qu'on y trouve et ce qu'on garde,
   la partie pour les professionnels), puis l'écran d'entrée avec la phrase « Choisissez ce chemin si » de chaque tuile. Clé : bien-utiliser-ia. Aucune donnée de personne : rien n'est saisi.
   Module ouvert au public depuis le 25/11/2026 : le film se tourne sur localhost, comme les autres. */
const { dormir } = require('../lib');
const URL = 'http://localhost:8123/index.html';
// Ordonnée d'un panneau de la présentation, repéré par son titre (aucun numéro de rang recopié).
const haut = (p, titre) => p.evaluate(t => { const h = [...document.querySelectorAll('.buia-panneau h2')].find(x => x.textContent.indexOf(t) >= 0); return h ? Math.max(0, h.getBoundingClientRect().top + window.scrollY - 90) : 0; }, titre);
module.exports = {
  blocs: [
    { id: 'c1', voix: 'Bien utiliser l’IA vous apprend à écrire une demande claire à un assistant en ligne, et à vérifier sa réponse. Ni test, ni note : vous avancez à votre rythme.', sous_titre: 'Bien utiliser l’IA : écrire une demande claire, vérifier la réponse. Ni test, ni note.' },
    { id: 'c2', voix: 'Il y a quatre chemins : comprendre, savoir comment l’assistant fonctionne, partir d’un papier ou d’une situation, ou écrire votre propre demande.', sous_titre: 'Quatre chemins, selon ce que vous voulez faire.' },
    { id: 'c3', voix: 'Vous y trouvez des exercices courts avec des cas inventés, des modèles déjà écrits, et un coup de pouce pour protéger votre papier avant de le copier.', sous_titre: 'Des exercices, des modèles écrits, un coup de pouce pour protéger votre papier.' },
    { id: 'c4', voix: 'Quand une demande marche bien, vous pouvez la garder sur votre disquette. Rien d’autre n’est enregistré, et rien ne quitte votre appareil, sauf ce que vous copiez vous-même.', sous_titre: 'Vous gardez ce qui marche sur votre disquette. Rien ne quitte votre appareil.' },
    { id: 'c5', voix: 'Une partie est écrite pour les professionnels qui accompagnent des personnes. Et ce que le module dit des assistants est relu régulièrement.', sous_titre: 'Une partie pour les professionnels. Les informations sont relues régulièrement.' },
    { id: 'c6', voix: 'Sur l’écran de départ, chaque chemin commence par une phrase : choisissez ce chemin si, et la situation. Vous vous reconnaissez, et vous choisissez le vôtre. Aucun chemin n’est imposé.', sous_titre: 'Chaque chemin dit dans quel cas le choisir. Aucun n’est imposé.' }
  ],
  async jouer(o) {
    const p = o.p;
    await p.goto(URL); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.evaluate(() => { try { localStorage.clear(); sessionStorage.clear(); } catch (e) {} }); await p.reload(); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.mouse.move(640, 620); o.mx = 640; o.my = 620; await dormir(0.4);
    // ---- début du film
    o.commencer();
    await o.bloc('c1');
    await o.cliquer(p.locator('[data-carte-accueil="boiteaoutils"]'), 800); await dormir(0.4);
    await o.cliquer(p.locator('#btnCarteAccueilBienUtiliserIa'), 650); await dormir(1.6);
    await o.finDeVoix(0.3);
    await o.bloc('c2');
    await o.defiler(await haut(p, 'Quatre chemins'), 1600); await dormir(1.0);
    await o.survol(p.locator('.buia-intro-liste li').nth(1), 900); await dormir(0.6);
    await o.finDeVoix(0.3);
    await o.bloc('c3');
    await o.defiler(await haut(p, 'Ce que vous y trouvez'), 1400); await dormir(1.0);
    await o.survol(p.locator('.buia-liste-icones li').nth(2), 900); await dormir(0.6);
    await o.finDeVoix(0.3);
    await o.bloc('c4');
    await o.defiler(await haut(p, 'Ce que vous gardez'), 1400); await dormir(1.0);
    await o.survol(p.locator('.buia-panneau', { hasText: 'Ce que vous gardez' }).locator('p').first(), 900); await dormir(0.6);
    await o.finDeVoix(0.3);
    await o.bloc('c5');
    await o.defiler(await haut(p, 'Pour les professionnels'), 1400); await dormir(1.2);
    await o.defiler(await haut(p, 'D’où viennent'), 1500); await dormir(0.8);
    await o.finDeVoix(0.3);
    await o.bloc('c6');
    await o.cliquer(p.locator('#btnBuiaCommencer'), 900); await dormir(1.6);
    await o.defiler(await p.evaluate(() => { const a = document.querySelector('.buia-intentions'); return a ? a.getBoundingClientRect().top + window.scrollY - 110 : 0; }), 1300); await dormir(1.0);
    await o.survol(p.locator('.buia-quand').nth(0), 900); await dormir(1.2);
    await o.survol(p.locator('.buia-quand').nth(2), 900); await dormir(1.4);
    await o.finDeVoix(1.0);
  }
};
