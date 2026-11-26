/* Chemin « Je veux savoir comment il fonctionne » de Bien utiliser l'IA (environ 1 minute 10) : les huit écrans, les mots vraisemblables, la recherche web, les projets et la mémoire, quand s'en passer.
   Clé : bien-utiliser-ia-fonctionne. Aucun nom de produit prononcé, aucun chiffre qui vieillit dans la voix. */
const { dormir } = require('../lib');
const { partir } = require('./buia-commun');
const suivant = p => p.locator('.barre-navigation-fixe button').last();
module.exports = {
  blocs: [
    { id: 'c1', voix: 'Ce chemin explique comment fonctionne un assistant en ligne, sans jargon. Il compte huit étapes, et le même bouton pour régler le niveau.', sous_titre: 'Comment fonctionne un assistant : huit étapes, deux niveaux.' },
    { id: 'c2', voix: 'D’abord, ce qu’est un assistant, et comment il construit ses phrases : vous voyez, mot après mot, ce qui lui paraît le plus vraisemblable.', sous_titre: 'Ce qu’est un assistant, et comment il construit ses phrases.' },
    { id: 'c3', voix: 'Un bouton ajoute du contexte, et vous voyez les mots les plus vraisemblables changer.', sous_titre: 'Avec du contexte, les mots les plus vraisemblables changent.' },
    { id: 'c4', voix: 'Puis d’où vient ce qu’il sait, et ce qu’il ne peut pas savoir. Ensuite la recherche web : quand l’activer, et pourquoi il faut quand même ouvrir les sources.', sous_titre: 'D’où vient son savoir. La recherche web, et les sources à ouvrir.' },
    { id: 'c5', voix: 'Vous voyez aussi ce qui distingue les différents assistants, puis ce que sont les projets et la mémoire.', sous_titre: 'Ce qui distingue les assistants. Les projets et la mémoire.' },
    { id: 'c6', voix: 'Un écran dit enfin quand s’en passer, par exemple pour une urgence ou une grande décision. Une fiche termine le chemin.', sous_titre: 'Quand s’en passer. Une fiche termine le chemin.' }
  ],
  async jouer(o) {
    const p = o.p;
    await partir(o);
    o.commencer();
    await o.bloc('c1');
    await o.cliquer(p.locator('[data-buia-act="chemin"][data-v="fonctionne"]'), 900); await dormir(1.6);
    await o.survol(p.locator('.barre-etapes-cadre'), 800); await dormir(0.6);
    await o.cliquer(p.locator('#buiaC4Niveaux [data-buia-act="c4-niveau"][data-v="plus"]'), 800); await dormir(1.2);
    await o.cliquer(p.locator('#buiaC4Niveaux [data-buia-act="c4-niveau"][data-v="bases"]'), 700); await dormir(0.8);
    await o.finDeVoix(0.3);
    await o.bloc('c2');
    await o.cliquer(suivant(p), 800); await dormir(1.6);
    await o.defiler(250, 1100); await dormir(0.8);
    await o.finDeVoix(0.3);
    await o.bloc('c3');
    await o.cliquer(p.locator('[data-buia-act="c4-contexte"]'), 800); await dormir(1.8);
    await o.finDeVoix(0.3);
    await o.bloc('c4');
    await o.cliquer(suivant(p), 800); await dormir(1.6);
    await o.defiler(250, 1000); await dormir(1.2);
    await o.cliquer(suivant(p), 800); await dormir(1.6);
    await o.defiler(300, 1000); await dormir(1.2);
    await o.finDeVoix(0.3);
    await o.bloc('c5');
    await o.cliquer(suivant(p), 700); await dormir(1.2);
    await o.cliquer(suivant(p), 800); await dormir(1.6);
    await o.defiler(300, 1000); await dormir(1.0);
    await o.finDeVoix(0.3);
    await o.bloc('c6');
    await o.cliquer(suivant(p), 800); await dormir(1.8);
    await o.defiler(250, 1000); await dormir(0.8);
    await o.cliquer(suivant(p), 800); await dormir(1.6);
    await o.defiler(300, 1000); await dormir(0.8);
    await o.finDeVoix(1.0);
  }
};
