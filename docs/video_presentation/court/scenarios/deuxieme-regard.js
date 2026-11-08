/* Lot A, vidéo A6 : le deuxième regard (dans Mes Repères). 30 s au plus.
   Départ : Mes Repères, trois réflexions fictives dont deux déjà lues par l'assistant (semées hors film dans la mémoire de la page). */
const { dormir } = require('../lib');
const URL = 'http://localhost:8123/index.html';
module.exports = {
  blocs: [
    { id: 'd1', voix: 'Dans Mes Repères, l’onglet « Déjà analysés » réunit les réflexions que l’assistant a déjà lues.', sous_titre: 'Mes Repères : l’onglet « Déjà analysés » réunit ce que l’assistant a déjà lu.' },
    { id: 'd2', voix: 'Le bouton « Demander un Deuxième Regard » les lui renvoie, pour aller plus loin.', sous_titre: '« Demander un Deuxième Regard » les renvoie à l’assistant, pour aller plus loin.' },
    { id: 'd3', voix: 'Vous choisissez ce qui part : tout est coché, décochez ce que vous préférez garder pour plus tard.', sous_titre: 'Vous choisissez ce qui part : décochez ce que vous gardez pour plus tard.' },
    { id: 'd4', voix: 'Puis Continuer. Rien n’est envoyé avant la fin : vous pouvez revenir en arrière.', sous_titre: 'Puis « Continuer ». Rien n’est envoyé avant la fin : vous pouvez revenir en arrière.' }
  ],
  async jouer(o) {
    const p = o.p;
    await p.goto(URL); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} }); await p.reload(); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.click('[data-carte-accueil="boiteaoutils"]'); await dormir(0.6);
    await p.locator('#fenetreERIP .sous-carte-accueil', { hasText: 'Mes Repères' }).first().click(); await dormir(1.2);
    await p.click('#btnReperesIntroCommencer'); await dormir(1.2);
    await p.evaluate(() => {
      dossier.reperes = [
        { id: 'r1', type: 'question', source: null, date: '2026-11-02', titre: 'Mon dernier poste', texte: 'Je me demande comment présenter mes missions de nettoyage.', analyse: true },
        { id: 'r2', type: 'idee', source: null, date: '2026-11-03', titre: 'Un métier en restauration', texte: 'Retravailler en salle me plairait.', analyse: true },
        { id: 'r3', type: 'approfondir', source: null, date: '2026-11-05', titre: 'Les horaires', texte: 'Je ne sais pas quels horaires me conviennent.', analyse: false }
      ];
      naviguerVers('reperes');
    }); await dormir(1.5);
    await p.mouse.move(640, 560); o.mx = 640; o.my = 560; await dormir(0.4);
    // ---- début du film
    o.commencer();
    await o.bloc('d1');
    await o.cliquer(p.locator('[data-repere-filtre="analyses"]'), 900); await dormir(1.2);
    await o.finDeVoix(0.3);
    await o.bloc('d2');
    await o.cliquer(p.locator('[data-repere-demander-deuxieme-regard]'), 900); await dormir(1.4);
    await o.finDeVoix(0.3);
    await o.bloc('d3');
    await o.cliquer(p.locator('#regardExterieurSelCaser2'), 800); await dormir(1.0);
    await o.finDeVoix(0.3);
    await o.bloc('d4');
    await o.survol(p.locator('#btnSuivantNavigation'), 900); await dormir(1.5);
    await o.finDeVoix(1.0);
  }
};
