/* Lot C : « Reprendre mon CV », voie 1 « Le garder et le compléter » (environ 1 minute). Spécificité : avec l'assistant, on ajoute, corrige, complète champ par champ, en gardant la main sur chaque correction.
   Complémentarité : voie 2 (reformuler et présenter, sans rien ajouter) et voie 3 (refaire soi-même dans un modèle, sans assistant) ; le CV se dépose une seule fois. Parcours joué dans l'application réelle. */
const C = require('./mesdocuments-commun');
const { dormir } = C;
module.exports = {
  blocs: [
    { id: 'g1', voix: 'Le garder et le compléter : vous avez déjà un CV, il est à mettre à jour. Vous ajoutez, vous corrigez, vous complétez.', sous_titre: 'Le garder et le compléter : un CV à mettre à jour.' },
    { id: 'g2', voix: 'Vous déposez votre CV une seule fois, et vous masquez ce que vous ne voulez pas transmettre. Puis vous choisissez la première voie, avec l’assistant.', sous_titre: 'Votre CV, déposé une seule fois. Vous masquez le personnel. Voie 1, avec l’assistant.' },
    { id: 'g3', voix: 'Vous dites pourquoi vous faites ce CV. Un assistant en ligne en ressort vos informations : expériences, compétences, formations.', sous_titre: 'Pourquoi ce CV. L’assistant en ressort expériences, compétences, formations.' },
    { id: 'g4', voix: 'Vous corrigez et complétez ensuite champ par champ, puis vous choisissez la mise en forme. Vous gardez la main sur chaque correction.', sous_titre: 'Vous corrigez champ par champ, puis la mise en forme. Vous gardez la main.' },
    { id: 'g5', voix: 'Pour une meilleure présentation sans rien ajouter, voyez la voie 2. Pour refaire la mise en page vous-même, sans assistant, la voie 3. Sans redéposer votre CV.', sous_titre: 'Autre présentation : voie 2. Refaire soi-même, sans assistant : voie 3.' }
  ],
  async jouer(o) {
    const p = o.p;
    await C.preparer(o);
    o.commencer();
    await o.bloc('g1');
    await C.ouvrirTuile(o, 'btnCarteAccueilCvReprendre', 250);
    await o.defiler(300, 1500); await dormir(0.6);
    await o.finDeVoix(0.3);
    await o.bloc('g2');
    await o.cliquer(p.locator('#btnReprendreCvCommencer'), 700); await dormir(1.5);
    await C.deposerCv(o);
    await o.survol(p.locator('[data-reprendre-voie="maj"]'), 800); await dormir(0.4);
    await o.cliquer(p.locator('[data-reprendre-voie="maj"]'), 700); await dormir(1.8);
    await o.finDeVoix(0.3);
    await o.bloc('g3');
    await o.defiler(300, 1500); await dormir(0.6);
    await o.cliquer(p.locator('[data-prepel-situation="offre"]'), 700); await dormir(1.2);
    await o.finDeVoix(0.3);
    await o.bloc('g4');
    await o.defiler(300, 1500); await dormir(0.8);
    await o.finDeVoix(0.3);
    await o.bloc('g5');
    await o.cliquer(p.locator('#btnPrepLERevoirPres'), 700).catch(() => {}); await dormir(1.8);
    await o.finDeVoix(1.0);
  }
};
