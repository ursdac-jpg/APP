/* Présentation du module « Lettre et entretien en version rapide » (environ 1 minute) : les deux chemins en une fois. Clé : pret. Parcours joué dans l'application réelle. */
const C = require('./mesdocuments-commun');
const { dormir } = C;
async function versChemin(o, i) {
  const y = await o.p.evaluate(n => { const e = document.querySelectorAll('.voie-presentation')[n]; return e ? Math.max(0, e.getBoundingClientRect().top + window.scrollY - 90) : 0; }, i);
  await o.defiler(y, 1400); await dormir(1.0);
}
module.exports = {
  blocs: [
    { id: 'p1', voix: 'Vous avez un CV, et une candidature à envoyer vite. Il y a deux chemins, indépendants l’un de l’autre.', sous_titre: 'Lettre et entretien en version rapide : deux chemins.' },
    { id: 'p2', voix: 'Ma lettre de motivation rapide : l’assistant en ligne vous propose deux lettres, vous choisissez.', sous_titre: 'Chemin 1 : deux lettres de motivation, vous choisissez.' },
    { id: 'p3', voix: 'Ma fiche de préparation à l’entretien : votre présentation, les questions probables, les questions à poser.', sous_titre: 'Chemin 2 : présentation, questions probables, questions à poser.' },
    { id: 'p4', voix: 'Vous déposez votre CV une seule fois. Pour aller plus loin, la version approfondie se trouve dans Me préparer à candidater.', sous_titre: 'CV déposé une seule fois. Plus approfondi : Me préparer à candidater.' }
  ],
  async jouer(o) {
    await C.preparer(o);
    o.commencer();
    await o.bloc('p1');
    await C.ouvrirTuile(o, 'btnCarteAccueilCvPret', 0); await dormir(1.2);
    await o.finDeVoix(0.3);
    await o.bloc('p2');
    await versChemin(o, 0);
    await o.finDeVoix(0.3);
    await o.bloc('p3');
    await versChemin(o, 1);
    await o.finDeVoix(0.3);
    await o.bloc('p4');
    await o.defiler(300, 1500); await dormir(0.8);
    await o.finDeVoix(1.0);
  }
};
