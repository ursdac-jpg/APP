/* Lot C : « Reprendre mon CV », voie 2 « Le reformuler et le présenter » (environ 1 minute). Spécificité : avec l'assistant, on améliore les phrases et la présentation sans rien ajouter ; deux versions au choix.
   Complémentarité : voie 1 (compléter, corriger le contenu) et voie 3 (refaire soi-même, sans assistant) ; le CV se dépose une seule fois. Parcours joué dans l'application réelle. */
const C = require('./mesdocuments-commun');
const { dormir } = C;
module.exports = {
  blocs: [
    { id: 'f1', voix: 'Le reformuler et le présenter : votre contenu est bon, vous voulez une meilleure présentation.', sous_titre: 'Le reformuler et le présenter : une meilleure présentation.' },
    { id: 'f2', voix: 'Vous déposez votre CV une seule fois, vous masquez ce que vous ne voulez pas transmettre, puis vous choisissez la deuxième voie, avec l’assistant.', sous_titre: 'CV déposé une seule fois, le personnel masqué. Voie 2, avec l’assistant.' },
    { id: 'f3', voix: 'Vous indiquez le poste ou le domaine visé. Un assistant en ligne reformule votre CV : verbes d’action, phrases claires, rubriques bien rangées, vocabulaire rapproché du poste.', sous_titre: 'Le poste visé. L’assistant reformule : phrases claires, rubriques rangées.' },
    { id: 'f4', voix: 'Il vous renvoie deux versions, et vous choisissez celle qui vous convient. Il n’ajoute ni expérience, ni diplôme, ni compétence, ni date.', sous_titre: 'Deux versions au choix. Rien n’est ajouté : ni expérience, ni diplôme, ni date.' },
    { id: 'f5', voix: 'Pour ajouter ou corriger le contenu, voyez la voie 1. Pour tout refaire vous-même, sans assistant, la voie 3. Sans redéposer votre CV.', sous_titre: 'Ajouter ou corriger : voie 1. Tout refaire sans assistant : voie 3.' }
  ],
  async jouer(o) {
    const p = o.p;
    await C.preparer(o);
    o.commencer();
    await o.bloc('f1');
    await C.ouvrirTuile(o, 'btnCarteAccueilCvReprendre', 250);
    await o.defiler(450, 1800); await dormir(0.6);
    await o.finDeVoix(0.3);
    await o.bloc('f2');
    await o.cliquer(p.locator('#btnReprendreCvCommencer'), 700); await dormir(1.5);
    await C.deposerCv(o);
    await o.survol(p.locator('[data-reprendre-voie="reformuler"]'), 800); await dormir(0.4);
    await o.cliquer(p.locator('[data-reprendre-voie="reformuler"]'), 700); await dormir(1.8);
    await o.finDeVoix(0.3);
    await o.bloc('f3');
    await o.defiler(300, 1500); await dormir(0.6);
    await o.cliquer(p.locator('[data-prepel-situation="offre"]'), 700); await dormir(1.2);
    await o.finDeVoix(0.3);
    await o.bloc('f4');
    await o.defiler(300, 1500); await dormir(0.8);
    await o.finDeVoix(0.3);
    await o.bloc('f5');
    await o.cliquer(p.locator('#btnPrepLERevoirPres'), 700).catch(() => {}); await dormir(1.8);
    await o.finDeVoix(1.0);
  }
};
