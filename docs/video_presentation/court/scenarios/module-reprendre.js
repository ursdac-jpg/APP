/* Présentation du module « Reprendre mon CV » (environ 1 minute) : les trois chemins en une fois. Clé : reprendre. Parcours joué dans l'application réelle (page de présentation du module). */
const C = require('./mesdocuments-commun');
const { dormir } = C;
async function versChemin(o, i) {
  const y = await o.p.evaluate(n => { const e = document.querySelectorAll('.voie-presentation')[n]; return e ? Math.max(0, e.getBoundingClientRect().top + window.scrollY - 90) : 0; }, i);
  await o.defiler(y, 1400); await dormir(1.0);
}
module.exports = {
  blocs: [
    { id: 'r1', voix: 'Vous avez déjà un CV. Vous le déposez une seule fois. Ensuite, trois chemins s’ouvrent.', sous_titre: 'Reprendre mon CV : un CV déposé une seule fois, trois chemins.' },
    { id: 'r2', voix: 'Premier chemin : le garder et le compléter. L’assistant en ligne lit votre CV, puis vous ajoutez, vous corrigez, vous complétez.', sous_titre: 'Chemin 1 : le garder et le compléter, avec l’assistant.' },
    { id: 'r3', voix: 'Deuxième chemin : le reformuler et le présenter. Vos phrases sont reformulées, sans rien ajouter.', sous_titre: 'Chemin 2 : le reformuler et le présenter, sans rien ajouter.' },
    { id: 'r4', voix: 'Troisième chemin : le refaire vous-même dans un modèle, sans assistant.', sous_titre: 'Chemin 3 : le refaire vous-même dans un modèle, sans assistant.' },
    { id: 'r5', voix: 'Vous pouvez changer de chemin sans déposer votre CV une seconde fois. Rien n’est envoyé sans votre accord. Chaque chemin a sa propre vidéo.', sous_titre: 'Vous pouvez changer de chemin. Rien n’est envoyé sans votre accord.' }
  ],
  async jouer(o) {
    await C.preparer(o);
    o.commencer();
    await o.bloc('r1');
    await C.ouvrirTuile(o, 'btnCarteAccueilCvReprendre', 0); await dormir(1.2);
    await o.finDeVoix(0.3);
    await o.bloc('r2');
    await versChemin(o, 0);
    await o.finDeVoix(0.3);
    await o.bloc('r3');
    await versChemin(o, 1);
    await o.finDeVoix(0.3);
    await o.bloc('r4');
    await versChemin(o, 2);
    await o.finDeVoix(0.3);
    await o.bloc('r5');
    await o.defiler(250, 1500); await dormir(0.8);
    await o.finDeVoix(1.0);
  }
};
