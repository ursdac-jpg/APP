/* Lot C : présentation de « Un CV, plusieurs métiers » (environ 1 minute). Spécificité : un seul CV de départ, jusqu'à dix métiers visés, un CV, une accroche et une lettre par métier, sans rien inventer (seuls le titre, l'accroche et la lettre changent).
   Complémentarité : « Comparer mes pistes » pour décider d'abord entre des métiers ; « Créer un nouveau CV » si l'on n'a pas encore de CV. Parcours joué dans l'application réelle (CV fictif déposé). */
const C = require('./mesdocuments-commun');
const { dormir } = C;
module.exports = {
  blocs: [
    { id: 'u1', voix: 'Un CV, plusieurs métiers : vous pouvez viser plusieurs métiers, et vous partez d’un seul CV.', sous_titre: 'Un CV, plusieurs métiers : un seul CV de départ.' },
    { id: 'u2', voix: 'Ces propositions n’ajoutent aucune expérience à votre CV. Vos expériences, vos formations et vos compétences restent les mêmes : seuls le titre, l’accroche et la lettre changent d’un métier à l’autre.', sous_titre: 'Rien n’est inventé : seuls le titre, l’accroche et la lettre changent.' },
    { id: 'u3', voix: 'Vous déposez votre CV et vous masquez ce qui est personnel. Un assistant en ligne vous propose d’autres intitulés pour votre métier, et d’autres métiers qui utilisent les mêmes compétences.', sous_titre: 'Vous déposez votre CV, le personnel masqué. D’autres intitulés, d’autres métiers.' },
    { id: 'u4', voix: 'Vous cochez les métiers qui vous intéressent, dix au plus. Puis vous obtenez un CV, une phrase d’accroche et une lettre de motivation pour chacun, côte à côte.', sous_titre: 'Dix métiers au plus. Un CV, une accroche et une lettre par métier.' },
    { id: 'u5', voix: 'Si vous hésitez encore entre vos métiers, commencez par Comparer mes pistes. Sans CV, voyez Créer un nouveau CV.', sous_titre: 'Pour hésiter d’abord : « Comparer mes pistes ». Sans CV : « Créer un nouveau CV ».' }
  ],
  async jouer(o) {
    const p = o.p;
    await C.preparer(o);
    o.commencer();
    await o.bloc('u1');
    await o.cliquer(p.locator('[data-carte-accueil="orientation"]'), 800); await dormir(0.4);
    await o.cliquer(p.locator('#btnCarteAccueilUnCvPlusieursMetiers'), 650); await dormir(1.5);
    await p.evaluate(() => window.scrollBy(0, 200)); await dormir(1.2);
    await o.finDeVoix(0.3);
    await o.bloc('u2');
    await o.defiler(350, 1800); await dormir(0.6);
    await o.finDeVoix(0.3);
    await o.bloc('u3');
    await o.cliquer(p.locator('#btnUcpmCommencer'), 700); await dormir(1.5);
    await C.deposerCv(o);
    await o.defiler(350, 1500); await dormir(0.8);
    await o.finDeVoix(0.3);
    await o.bloc('u4');
    await o.defiler(300, 1500); await dormir(0.8);
    await o.survol(p.locator('#btnSuivantNavigation'), 800); await dormir(0.6);
    await o.finDeVoix(0.3);
    await o.bloc('u5');
    await o.cliquer(p.locator('#btnUcpmRevoirPresentation'), 700).catch(() => {}); await dormir(1.8);
    await o.finDeVoix(1.0);
  }
};
