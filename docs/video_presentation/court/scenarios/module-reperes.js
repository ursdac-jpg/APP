/* Lot C : présentation de Mes Repères (environ 1 minute), avec le Regard Extérieur et le Deuxième Regard.
   Objectif, spécificité, bouton propre « Garder comme Repère » (consigne 175), complémentarité (Lexique, assistant), disquette.
   Départ : tuile Boîte à outils, trois réflexions fictives semées hors film, dont deux déjà lues par l'assistant. */
const { dormir } = require('../lib');
const URL = 'http://localhost:8123/index.html';
module.exports = {
  blocs: [
    { id: 'r1', voix: 'Mes Repères est l’endroit où poser une réflexion, en quelques mots, pour la retrouver quand vous en aurez besoin.', sous_titre: 'Mes Repères : poser une réflexion en quelques mots, pour la retrouver plus tard.' },
    { id: 'r2', voix: 'Cliquez sur Garder une réflexion. Vous pouvez choisir un type : une question, une idée, un sujet à approfondir, un sujet à discuter.', sous_titre: '« Garder une réflexion » : question, idée, sujet à approfondir ou à discuter.' },
    { id: 'r3', voix: 'Vos Repères restent rangés sur cette page, du plus récent au plus ancien. Vous les relisez, les modifiez ou les supprimez quand vous voulez.', sous_titre: 'Vos Repères restent rangés ici : relire, modifier, supprimer, quand vous voulez.' },
    { id: 'r4', voix: 'Ailleurs dans l’application, le bouton Garder comme Repère met de côté une information, ici une fiche du Lexique, pour y revenir.', sous_titre: 'Ailleurs, « Garder comme Repère » met une information de côté, ici une fiche du Lexique.' },
    { id: 'r5', voix: 'Quand vous avez quelques Repères, Demander un Regard Extérieur vous donne l’avis d’un assistant sur ceux que vous choisissez.', sous_titre: '« Demander un Regard Extérieur » : l’avis d’un assistant sur les Repères choisis.' },
    { id: 'r6', voix: 'L’onglet Déjà analysés réunit ce que l’assistant a lu. Le Deuxième Regard va plus loin, seulement sur les points qui vous intéressent.', sous_titre: '« Déjà analysés », puis « Deuxième Regard » : aller plus loin sur ce qui vous intéresse.' },
    { id: 'r7', voix: 'Rien n’est lu automatiquement. Et pensez à l’icône disquette : l’application ne garde pas de compte, c’est elle qui sauvegarde vos Repères.', sous_titre: 'Rien n’est lu automatiquement. L’icône disquette sauvegarde vos Repères.' }
  ],
  async jouer(o) {
    const p = o.p;
    await p.goto(URL); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} }); await p.reload(); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.mouse.move(640, 620); o.mx = 640; o.my = 620; await dormir(0.4);
    // ---- début du film
    o.commencer();
    await o.bloc('r1');
    await o.cliquer(p.locator('[data-carte-accueil="boiteaoutils"]'), 800); await dormir(0.4);
    await o.cliquer(p.locator('#fenetreERIP .sous-carte-accueil', { hasText: 'Mes Repères' }).first(), 650); await dormir(1.5);
    await p.evaluate(() => window.scrollBy(0, 250)); await dormir(1.3);
    await o.finDeVoix(0.3);
    await o.cliquer(p.locator('#btnReperesIntroCommencer'), 700); await dormir(1.0);
    await p.evaluate(() => {
      dossier.reperes = [
        { id: 'r1', type: 'question', source: null, date: '2026-11-02', titre: 'Mon dernier poste', texte: 'Je me demande comment présenter mes missions de nettoyage.', analyse: true },
        { id: 'r2', type: 'idee', source: null, date: '2026-11-03', titre: 'Un métier en restauration', texte: 'Retravailler en salle me plairait.', analyse: true },
        { id: 'r3', type: 'approfondir', source: null, date: '2026-11-05', titre: 'Les horaires', texte: 'Je ne sais pas quels horaires me conviennent.', analyse: false },
        { id: 'r4', type: 'discuter', source: null, date: '2026-11-06', titre: 'Mon arrêt de travail', texte: 'À aborder avec la personne qui m’accompagne.', analyse: false },
        { id: 'r5', type: 'idee', source: null, date: '2026-11-07', titre: 'Une formation courte', texte: 'Regarder une formation de quelques semaines.', analyse: false }
      ];
      naviguerVers('reperes');
    });
    await dormir(1.2);
    await o.bloc('r2');
    await o.cliquer(p.locator('[data-repere-trigger="reperesPickerLibre"]'), 800); await dormir(0.8);
    await o.survol(p.locator('[data-repere-type="question"]').first(), 600);
    await o.survol(p.locator('[data-repere-type="discuter"]').first(), 700);
    await o.finDeVoix(0.3);
    await o.bloc('r3');
    await o.cliquer(p.locator('[data-repere-annuler="reperesPickerLibre"]'), 700); await dormir(0.4);
    await o.cliquer(p.locator('[data-repere-toggle="r3"]'), 800); await dormir(1.6);
    await o.finDeVoix(0.3);
    await o.bloc('r4');
    await p.evaluate(() => lexiqueOuvrirFiche('cdd')); await dormir(1.5);
    await p.evaluate(() => { const e = [...document.querySelectorAll('button')].find(x => /Garder comme Repère/.test(x.textContent)); if (e) e.scrollIntoView({ block: 'center', behavior: 'instant' }); }); await dormir(0.6);
    await o.survol(p.locator('button', { hasText: 'Garder comme Repère' }).first(), 900); await dormir(0.8);
    await o.finDeVoix(0.3);
    await o.bloc('r5');
    await p.evaluate(() => naviguerVers('reperes')); await dormir(1.5);
    if (await p.locator('#btnReperesIntroCommencer').count()) { await p.locator('#btnReperesIntroCommencer').click(); await dormir(1.2); }
    await o.survol(p.locator('#btnRegardExterieur'), 900); await dormir(0.6);
    await o.finDeVoix(0.3);
    await o.bloc('r6');
    await o.cliquer(p.locator('[data-repere-filtre="analyses"]'), 800); await dormir(1.0);
    await o.survol(p.locator('[data-repere-demander-deuxieme-regard]'), 800); await dormir(0.6);
    await o.finDeVoix(0.3);
    await o.bloc('r7');
    await p.evaluate(() => window.scrollTo(0, 0)); await dormir(0.3);
    await o.survol(p.locator('#btnSessionTransfert'), 900); await dormir(1.0);
    await o.finDeVoix(1.0);
  }
};
