/* Lot C : « Lettre et entretien en version rapide », parcours 2 « Ma fiche de préparation à l'entretien » (environ 1 minute). Spécificité : une fiche de synthèse en une seule réponse de l'assistant (présentation, questions probables, cas pratique, questions à poser).
   Complémentarité : la lettre rapide (parcours 1) ; pour s'entraîner avec échange, « M'entraîner à un entretien » dans « Me préparer à candidater ». Parcours joué dans l'application réelle. */
const C = require('./mesdocuments-commun');
const { dormir } = C;
module.exports = {
  blocs: [
    { id: 'n1', voix: 'Ma fiche de préparation à l’entretien : vous vous faites une première idée de l’entretien, en quelques minutes.', sous_titre: 'Ma fiche d’entretien rapide : une première idée de l’entretien.' },
    { id: 'n2', voix: 'Vous déposez votre CV une seule fois, et vous masquez ce que vous ne voulez pas transmettre. Puis vous choisissez ce que vous préparez en premier : la fiche d’entretien.', sous_titre: 'CV déposé une seule fois, le personnel masqué. Vous choisissez : l’entretien.' },
    { id: 'n3', voix: 'Vous indiquez votre objectif. Un assistant en ligne lit votre CV et en ressort vos informations, que vous vérifiez.', sous_titre: 'Votre objectif. L’assistant lit le CV, vous vérifiez.' },
    { id: 'n4', voix: 'Il prépare une fiche de synthèse en une seule réponse : votre présentation, les questions probables, un cas pratique, et les questions à poser.', sous_titre: 'Une fiche : présentation, questions probables, cas pratique, questions à poser.' },
    { id: 'n5', voix: 'Il n’y a pas d’échange, ni de retour sur vos réponses. Pour vous entraîner, voyez M’entraîner à un entretien, dans Me préparer à candidater.', sous_titre: 'Pas d’échange. Pour s’entraîner : « M’entraîner à un entretien ».' }
  ],
  async jouer(o) {
    const p = o.p;
    await C.preparer(o);
    o.commencer();
    await o.bloc('n1');
    await C.ouvrirTuile(o, 'btnCarteAccueilCvPret', 250);
    await o.defiler(450, 1800); await dormir(0.6);
    await o.finDeVoix(0.3);
    await o.bloc('n2');
    await o.cliquer(p.locator('#btnPrepLettreEntretienCommencer'), 700); await dormir(1.5);
    await C.deposerCv(o);
    await o.survol(p.locator('[data-pret-choix-premier="lettre"]'), 700); await dormir(0.4);
    await o.cliquer(p.locator('[data-pret-choix-premier="entretien"]'), 700); await dormir(1.8);
    await o.finDeVoix(0.3);
    await o.bloc('n3');
    await o.defiler(300, 1500); await dormir(0.6);
    await o.cliquer(p.locator('[data-prepel-situation="offre"]'), 700).catch(() => {}); await dormir(1.2);
    await o.finDeVoix(0.3);
    await o.bloc('n4');
    await o.defiler(300, 1500); await dormir(0.8);
    await o.finDeVoix(0.3);
    await o.bloc('n5');
    await o.cliquer(p.locator('#btnPrepLERevoirPres'), 700).catch(() => {}); await dormir(1.8);
    await o.finDeVoix(1.0);
  }
};
