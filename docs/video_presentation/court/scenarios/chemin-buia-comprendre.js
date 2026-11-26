/* Chemin « Je veux comprendre » de Bien utiliser l'IA (environ 1 minute 10) : huit écrans, le réglage du niveau, la comparaison de deux demandes, les six éléments avec un exercice, la vérification, la fiche finale.
   Clé : bien-utiliser-ia-comprendre. Aucune donnée de personne : cas inventés du module. */
const { dormir } = require('../lib');
const { partir } = require('./buia-commun');
const suivant = p => p.locator('button[onclick="buiaC1Suivant()"]');
module.exports = {
  blocs: [
    { id: 'c1', voix: 'Ce chemin explique pourquoi une demande claire change la réponse de l’assistant. Il se parcourt en huit étapes, que vous voyez en haut de la page.', sous_titre: 'Huit étapes, visibles en haut de la page.' },
    { id: 'c2', voix: 'Le premier écran dit ce qu’un assistant sait, et ce qu’il ne sait pas. Un bouton règle le niveau : les bases, ou pour aller plus loin.', sous_titre: 'Ce qu’un assistant sait, et ce qu’il ne sait pas. Deux niveaux : les bases, ou pour aller plus loin.' },
    { id: 'c3', voix: 'Ensuite, une même demande est écrite de deux façons, vague puis précise. Vous changez de sujet pour comparer.', sous_titre: 'Une même demande, vague puis précise. Vous changez de sujet.' },
    { id: 'c4', voix: 'Puis les six éléments d’une bonne demande, expliqués un par un. Un petit exercice, avec un cas inventé, vous laisse réparer une demande.', sous_titre: 'Les six éléments d’une bonne demande, et un exercice avec un cas inventé.' },
    { id: 'c5', voix: 'Plus loin, vous apprenez à vérifier une réponse : écrire, lire, vérifier, corriger. Avec les sujets où il faut redoubler de prudence.', sous_titre: 'Vérifier une réponse : écrire, lire, vérifier, corriger.' },
    { id: 'c6', voix: 'À la fin, une fiche résume ce qu’il faut retenir, et vous propose de passer à un papier ou à votre propre demande.', sous_titre: 'Une fiche à retenir, puis un papier ou votre propre demande.' }
  ],
  async jouer(o) {
    const p = o.p;
    await partir(o);
    o.commencer();
    await o.bloc('c1');
    await o.cliquer(p.locator('[data-buia-act="chemin"][data-v="comprendre"]'), 900); await dormir(1.6);
    await o.survol(p.locator('.barre-etapes-cadre'), 800); await dormir(0.8);
    await o.finDeVoix(0.3);
    await o.bloc('c2');
    await o.defiler(300, 1200); await dormir(0.8);
    await o.cliquer(p.locator('#buiaC1Niveaux [data-buia-act="niveau"][data-v="plus"]'), 800); await dormir(1.4);
    await o.cliquer(p.locator('#buiaC1Niveaux [data-buia-act="niveau"][data-v="bases"]'), 700); await dormir(1.0);
    await o.finDeVoix(0.3);
    await o.bloc('c3');
    await o.cliquer(suivant(p), 800); await dormir(1.5);
    await o.cliquer(p.locator('#buiaC1Corps [data-buia-act="sujet"]').nth(1), 800); await dormir(1.6);
    await o.defiler(300, 1200); await dormir(0.8);
    await o.finDeVoix(0.3);
    await o.bloc('c4');
    await o.cliquer(suivant(p), 800); await dormir(1.5);
    await o.cliquer(p.locator('[data-buia-act="rang"]').nth(1), 800); await dormir(1.2);
    await o.cliquer(p.locator('[data-buia-act="rang"]').nth(3), 800); await dormir(1.2);
    await o.cliquer(p.locator('[data-buia-act="ex1-coche"]').first(), 800); await dormir(0.8);
    await o.cliquer(p.locator('[data-buia-act="ex1-coche"]').nth(1), 700); await dormir(0.8);
    await o.cliquer(p.locator('[data-buia-act="ex1-corriger"]'), 800); await dormir(1.6);
    await o.finDeVoix(0.3);
    await o.bloc('c5');
    await o.cliquer(suivant(p), 700); await dormir(1.0);
    await o.cliquer(suivant(p), 700); await dormir(1.0);
    await o.cliquer(suivant(p), 700); await dormir(1.5);
    await o.cliquer(p.locator('[data-buia-act="risque"]').nth(1), 800); await dormir(1.4);
    await o.finDeVoix(0.3);
    await o.bloc('c6');
    await o.cliquer(suivant(p), 700); await dormir(1.0);
    await o.cliquer(suivant(p), 700); await dormir(1.6);
    await o.defiler(await p.evaluate(() => document.body.scrollHeight), 1500); await dormir(0.6);
    await o.survol(p.locator('.buia-actions [data-buia-act="vers"][data-v="modeles"]'), 900); await dormir(0.8);
    await o.finDeVoix(1.0);
  }
};
