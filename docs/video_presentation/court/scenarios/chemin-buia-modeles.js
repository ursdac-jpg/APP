/* Chemin « J'ai un papier ou une situation » de Bien utiliser l'IA (environ 1 minute 10) : un courrier inventé collé, le repérage du modèle, le masquage des numéros, la demande qui se compose, la disquette.
   Clé : bien-utiliser-ia-modeles. Courrier et coordonnées fictifs. */
const { dormir } = require('../lib');
const { partir } = require('./buia-commun');
const suivant = p => p.locator('.barre-navigation-fixe button').last();
module.exports = {
  blocs: [
    { id: 'c1', voix: 'Ce chemin part d’un papier ou d’une situation. Vous choisissez un modèle déjà écrit, vous le complétez, puis vous copiez la demande.', sous_titre: 'Un papier ou une situation : un modèle déjà écrit, que vous complétez.' },
    { id: 'c2', voix: 'Vous pouvez coller un papier, ici un courrier inventé. L’application repère les modèles qui peuvent convenir.', sous_titre: 'Vous collez un papier. L’application repère les modèles proches.' },
    { id: 'c3', voix: 'Un bouton masque les numéros et les courriels. Les noms et les adresses, vous les masquez vous-même.', sous_titre: 'Un bouton masque les numéros et les courriels. Les noms et adresses : à vous.' },
    { id: 'c4', voix: 'Vous choisissez toujours vous-même : l’application compare des mots, elle ne comprend pas votre texte.', sous_titre: 'C’est vous qui choisissez le modèle.' },
    { id: 'c5', voix: 'Vous complétez ensuite la demande, qui se compose en direct. Quand elle vous convient, vous la copiez et vous la collez dans l’assistant.', sous_titre: 'Vous complétez, la demande se compose en direct, puis vous copiez.' },
    { id: 'c6', voix: 'Après la réponse, vous pouvez garder cette demande sur votre disquette, pour la retrouver dans Mes demandes.', sous_titre: 'Vous pouvez garder la demande sur votre disquette.' }
  ],
  async jouer(o) {
    const p = o.p;
    await partir(o);
    o.commencer();
    await o.bloc('c1');
    await o.cliquer(p.locator('[data-buia-act="chemin"][data-v="modeles"]'), 900); await dormir(1.8);
    await o.finDeVoix(0.3);
    await o.bloc('c2');
    await o.cliquer(p.locator('[data-buia-act="fictif"][data-v="B"]'), 800); await dormir(1.2);
    // Un numéro et un courriel inventés sont ajoutés hors film pour que le masquage ait quelque chose à montrer.
    await p.evaluate(() => { const e = document.querySelector('[data-buia-champ="papier"]'); e.value += '\nPour toute question : 05 55 00 00 00 ou conseiller@exemple.invalid'; e.dispatchEvent(new Event('input', { bubbles: true })); });
    await o.cliquer(p.locator('[data-buia-act="reperer"]'), 800); await dormir(1.6);
    await o.finDeVoix(0.3);
    await o.bloc('c3');
    await o.cliquer(p.locator('[data-buia-act="masquer"]'), 800); await dormir(1.8);
    await o.finDeVoix(0.3);
    await o.bloc('c4');
    await o.survol(p.locator('#buiaZoneResultats [data-buia-act="modele"]').first(), 900); await dormir(1.2);
    await o.finDeVoix(0.3);
    await o.bloc('c5');
    await o.cliquer(p.locator('#buiaZoneResultats [data-buia-act="modele"]').first(), 800); await dormir(1.8);
    await o.cliquer(p.locator('[data-buia-champ="organisme"]'), 800);
    await p.keyboard.type('Agence de l’emploi', { delay: 60 }); await dormir(0.5);
    await o.cliquer(p.locator('[data-buia-champ="objectif"]'), 700);
    await p.keyboard.type('Savoir quoi apporter', { delay: 60 }); await dormir(0.8);
    await o.survol(p.locator('[data-buia-act="copier"]'), 900); await dormir(0.8);
    await o.finDeVoix(0.3);
    await o.bloc('c6');
    await o.cliquer(suivant(p), 800); await dormir(1.6);
    await o.survol(p.locator('[data-buia-act="apres"]').last(), 900); await dormir(1.0);
    await o.finDeVoix(1.0);
  }
};
