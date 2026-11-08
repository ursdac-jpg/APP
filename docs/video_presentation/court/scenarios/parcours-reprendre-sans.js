/* Lot C : « Reprendre mon CV », voie 3 « Le refaire moi-même dans un modèle » (environ 1 minute). Spécificité : sans assistant, on classe et on vérifie soi-même les informations du CV déposé, puis on choisit un modèle ; rien n'est reformulé.
   Complémentarité : voie 1 (compléter avec l'assistant) et voie 2 (reformuler avec l'assistant) ; le CV se dépose une seule fois. Parcours joué dans l'application réelle. */
const C = require('./mesdocuments-commun');
const { dormir } = C;
module.exports = {
  blocs: [
    { id: 's1', voix: 'Le refaire moi-même dans un modèle : sans assistant, vous reprenez vos informations et vous les remettez en page vous-même.', sous_titre: 'Le refaire moi-même : sans assistant, dans le modèle de votre choix.' },
    { id: 's2', voix: 'Vous déposez votre CV une seule fois, vous masquez ce que vous ne voulez pas garder, puis vous choisissez la troisième voie.', sous_titre: 'CV déposé une seule fois, le personnel masqué. Voie 3, sans assistant.' },
    { id: 's3', voix: 'Votre CV est découpé en blocs. Ce qui est sûr est déjà classé. Pour le reste, c’est vous qui choisissez la rubrique, en touchant la pastille du bloc.', sous_titre: 'Votre CV en blocs. Ce qui est sûr est classé. Le reste : vous choisissez la rubrique.' },
    { id: 's4', voix: 'Vous vérifiez, puis vous choisissez l’un de nos modèles et vous exportez. Rien n’est reformulé : vos mots restent les vôtres.', sous_titre: 'Vous vérifiez, vous choisissez un modèle, vous exportez. Vos mots restent les vôtres.' },
    { id: 's5', voix: 'Pour compléter le contenu, voyez la voie 1. Pour reformuler les phrases, la voie 2. Sans redéposer votre CV.', sous_titre: 'Compléter : voie 1. Reformuler : voie 2.' }
  ],
  async jouer(o) {
    const p = o.p;
    await C.preparer(o);
    o.commencer();
    await o.bloc('s1');
    await C.ouvrirTuile(o, 'btnCarteAccueilCvReprendre', 250);
    await o.defiler(500, 1800); await dormir(0.6);
    await o.finDeVoix(0.3);
    await o.bloc('s2');
    await o.cliquer(p.locator('#btnReprendreCvCommencer'), 700); await dormir(1.5);
    await C.deposerCv(o);
    await o.survol(p.locator('[data-reprendre-voie="sans"]'), 800); await dormir(0.4);
    await o.cliquer(p.locator('[data-reprendre-voie="sans"]'), 700); await dormir(2.0);
    await o.finDeVoix(0.3);
    await o.bloc('s3');
    await o.survol(p.locator('[data-ouvrir="0"]'), 900); await dormir(0.6);
    await o.defiler(300, 1500); await dormir(0.6);
    await o.finDeVoix(0.3);
    await o.bloc('s4');
    await o.defiler(300, 1500); await dormir(0.8);
    await o.survol(p.locator('#btnSuivantNavigation'), 800); await dormir(0.6);
    await o.finDeVoix(0.3);
    await o.bloc('s5');
    await o.cliquer(p.locator('button', { hasText: 'Revoir la présentation' }).first(), 700).catch(() => {}); await dormir(1.8);
    await o.finDeVoix(1.0);
  }
};
