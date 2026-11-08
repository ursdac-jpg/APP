/* Lot C : « Créer un nouveau CV », porte « À partir de mon récit » (environ 1 minute). Spécificité : on raconte ce qu'on a vécu et fait, avec ses mots, et l'assistant en tire expériences et compétences (aucun parcours classique requis).
   Complémentarité : « Découvrir mes compétences » part de documents existants (Boîte à outils), les deux autres portes partent d'un formulaire. Parcours joué dans l'application réelle (récit fictif de Camille). */
const C = require('./mesdocuments-commun');
const { dormir } = C;
const RECIT = 'J’ai travaillé trois ans comme agent d’entretien dans une école. Je m’occupais aussi de mes deux neveux tous les mercredis, et je suis bénévole dans une association de quartier.';
module.exports = {
  blocs: [
    { id: 'r1', voix: 'À partir de mon récit : vous racontez ce que vous avez vécu et fait, et on en tire un CV, même si vous n’en avez jamais eu.', sous_titre: 'À partir de mon récit : vous racontez, on en tire un CV.' },
    { id: 'r2', voix: 'Pas besoin d’un parcours classique. Un métier, l’aide à des proches, du bénévolat, une passion suivie longtemps : tout cela contient des compétences.', sous_titre: 'Pas de parcours classique requis : métier, aide aux proches, bénévolat, passion.' },
    { id: 'r3', voix: 'Vous écrivez avec vos mots, au clavier ou à la voix. Aucune forme imposée. Vous pouvez dire ce que vous visez, mais ce n’est pas obligatoire.', sous_titre: 'Vos mots, au clavier ou à la voix. Ce que vous visez : à compléter.' },
    { id: 'r4', voix: 'Un assistant en ligne en tire des expériences et des compétences. Pour chacune, vous choisissez la formulation qui vous ressemble. Il n’invente rien.', sous_titre: 'L’assistant en tire des expériences et compétences. Vous choisissez la formulation.' },
    { id: 'r5', voix: 'Pour repérer vos compétences dans des documents que vous avez déjà, voyez Découvrir mes compétences, dans la Boîte à outils.', sous_titre: 'À partir de documents existants : « Découvrir mes compétences » (Boîte à outils).' }
  ],
  async jouer(o) {
    const p = o.p;
    await C.preparer(o);
    o.commencer();
    await o.bloc('r1');
    await C.ouvrirTuile(o, 'btnCarteAccueilCvNouveau', 0); await dormir(1.2);
    await o.cliquer(p.locator('#btnCreerCvRecit'), 700); await dormir(1.5);
    await p.evaluate(() => window.scrollBy(0, 250)); await dormir(1.5);
    await o.finDeVoix(0.3);
    await o.bloc('r2');
    await o.defiler(300, 1500); await dormir(0.6);
    await o.cliquer(p.locator('#btnDecouverteCommencer'), 700).catch(async () => { await p.evaluate(() => window.scrollTo(0, 0)); }); await dormir(1.5);
    await o.finDeVoix(0.3);
    await o.bloc('r3');
    await o.cliquer(p.locator('#decouverteRecitTexte'), 600); await p.keyboard.type(RECIT, { delay: 22 }); await dormir(0.6);
    await o.survol(p.locator('[data-civilite="Madame"]'), 700); await dormir(0.4);
    await o.finDeVoix(0.3);
    await o.bloc('r4');
    await o.survol(p.locator('#btnContinuerDecouverte'), 800); await dormir(1.0);
    await o.finDeVoix(0.3);
    await o.bloc('r5');
    await dormir(2.0);
    await o.finDeVoix(1.0);
  }
};
