/* Présentation du chemin « Répondre à un questionnaire » (environ 1 minute). Clé : chemin-questionnaire. Parcours joué dans l'application réelle.
   Refaite le 21/11/2026 (consigne 520) : nouveau nom du chemin et niveau du résultat (part des lignes répondues). */
const { preparer, versModule, versAccueilModule, entrerChemin, dormir } = require('./metiers-commun');
module.exports = {
  blocs: [
    { id: 'q1', voix: 'Répondre à un questionnaire, c’est pour vous si vous préférez répondre à des questions plutôt que choisir vous-même, et voir quels univers de métiers vous attirent.', sous_titre: 'Répondre à un questionnaire : voir quels univers de métiers vous attirent.' },
    { id: 'q2', voix: 'Il y a quatre parties, sans minuteur et sans bonne réponse. Aucune réponse n’est obligatoire. Le résultat n’apparaît qu’à la fin : prévoyez le temps qu’il faut.', sous_titre: 'Quatre parties, sans minuteur, sans bonne réponse. Le résultat apparaît à la fin.' },
    { id: 'q3', voix: 'Pour chaque ligne, vous choisissez : ça me plairait, ça ne me plairait pas, ou je ne sais pas. Vous pouvez continuer à tout moment.', sous_titre: 'Ça me plairait, ça ne me plairait pas, ou je ne sais pas. Continuer est toujours possible.' },
    { id: 'q4', voix: 'À la fin, votre résultat montre vos préférences d’aujourd’hui, avec des métiers qui leur correspondent. Il porte un niveau : plus vous avez répondu, plus il est stable. Ce n’est pas un diagnostic. Vous pouvez le garder dans la disquette.', sous_titre: 'Un résultat avec un niveau : plus vous répondez, plus il est stable. Ce n’est pas un diagnostic.' }
  ],
  async jouer(o) {
    const p = o.p;
    await preparer(o); await versModule(o); await versAccueilModule(o);
    await p.mouse.move(640, 620); o.mx = 640; o.my = 620; await dormir(0.4);
    o.commencer();
    await o.bloc('q1');
    await o.survol(p.locator('[data-cml="entrer"]').nth(2), 900); await dormir(1.0);
    await o.finDeVoix(0.3);
    await o.bloc('q2');
    await entrerChemin(o, 'q');
    await o.defiler(250, 1800); await dormir(0.8);
    await o.cliquer(p.locator('#btnSuivantNavigation'), 800); await dormir(1.8);
    await o.finDeVoix(0.3);
    await o.bloc('q3');
    await o.cliquer(p.locator('#btnSuivantNavigation'), 800); await dormir(1.8);
    for (let k = 0; k < 3; k++) { await o.cliquer(p.locator('[data-cml="rep"]', { hasText: 'Ça me plairait' }).nth(k), 750).catch(() => {}); await dormir(0.5); }
    await o.cliquer(p.locator('[data-cml="rep"]', { hasText: 'Je ne sais pas' }).nth(3), 750).catch(() => {}); await dormir(0.8);
    await o.finDeVoix(0.3);
    await o.bloc('q4');
    await o.defiler(900, 2600); await dormir(0.8);
    await o.survol(p.locator('#btnSuivantNavigation'), 800); await dormir(1.0);
    await o.finDeVoix(1.0);
  }
};
