/* Lot C : « Lettre et entretien en version rapide », parcours 1 « Ma lettre de motivation rapide » (environ 1 minute). Spécificité : à partir du CV seul, l'assistant propose deux lettres, on choisit : le papier tout de suite.
   Complémentarité : la fiche d'entretien rapide (parcours 2) ; pour une lettre plus poussée, « Écrire ma lettre avec l'assistant » dans « Me préparer à candidater ». Parcours joué dans l'application réelle. */
const C = require('./mesdocuments-commun');
const { dormir } = C;
module.exports = {
  blocs: [
    { id: 'l1', voix: 'Ma lettre de motivation rapide : à partir de votre CV seul, vous avez une lettre prête, vite.', sous_titre: 'Ma lettre rapide : une lettre prête, à partir de votre CV seul.' },
    { id: 'l2', voix: 'Vous déposez votre CV une seule fois, et vous masquez ce que vous ne voulez pas transmettre. Puis vous choisissez ce que vous préparez en premier : la lettre.', sous_titre: 'CV déposé une seule fois, le personnel masqué. Vous choisissez : la lettre.' },
    { id: 'l3', voix: 'Vous indiquez votre objectif, et si vous le savez, l’entreprise et l’offre visées. Un assistant en ligne lit votre CV et en ressort vos informations, que vous vérifiez.', sous_titre: 'Votre objectif, l’offre si vous la connaissez. L’assistant lit le CV, vous vérifiez.' },
    { id: 'l4', voix: 'Il vous propose deux lettres de motivation, et vous choisissez. Votre CV n’est pas modifié : il sert de base.', sous_titre: 'Deux lettres au choix. Votre CV n’est pas modifié.' },
    { id: 'l5', voix: 'Pour une lettre plus poussée, voyez Écrire ma lettre avec l’assistant, dans Me préparer à candidater. Et pour l’entretien, il y a la fiche rapide.', sous_titre: 'Plus poussée : « Écrire ma lettre avec l’assistant ». Entretien : la fiche rapide.' }
  ],
  async jouer(o) {
    const p = o.p;
    await C.preparer(o);
    o.commencer();
    await o.bloc('l1');
    await C.ouvrirTuile(o, 'btnCarteAccueilCvPret', 250);
    await o.defiler(450, 1800); await dormir(0.6);
    await o.finDeVoix(0.3);
    await o.bloc('l2');
    await o.cliquer(p.locator('#btnPrepLettreEntretienCommencer'), 700); await dormir(1.5);
    await C.deposerCv(o);
    await o.survol(p.locator('[data-pret-choix-premier="entretien"]'), 700); await dormir(0.4);
    await o.cliquer(p.locator('[data-pret-choix-premier="lettre"]'), 700); await dormir(1.8);
    await o.finDeVoix(0.3);
    await o.bloc('l3');
    await o.defiler(300, 1500); await dormir(0.6);
    await o.cliquer(p.locator('[data-prepel-situation="offre"]'), 700).catch(() => {}); await dormir(1.2);
    await o.finDeVoix(0.3);
    await o.bloc('l4');
    await o.defiler(300, 1500); await dormir(0.8);
    await o.finDeVoix(0.3);
    await o.bloc('l5');
    await o.cliquer(p.locator('#btnPrepLERevoirPres'), 700).catch(() => {}); await dormir(1.8);
    await o.finDeVoix(1.0);
  }
};
