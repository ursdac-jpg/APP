/* Chemin « Je veux écrire ma propre demande » de Bien utiliser l'IA (environ 1 minute) : le but, la situation, les réglages, la copie, la lecture de la réponse, la disquette.
   Clé : bien-utiliser-ia-ecrire. Aucune donnée de personne. */
const { dormir } = require('../lib');
const { partir } = require('./buia-commun');
const suivant = p => p.locator('.barre-navigation-fixe button').last();
module.exports = {
  blocs: [
    { id: 'c1', voix: 'Ce chemin sert quand aucun modèle ne correspond : une lettre à une ambassade, un rendez-vous à l’hôpital, un voyage. Vous construisez votre propre demande.', sous_titre: 'Aucun modèle ne correspond ? Vous construisez votre demande.' },
    { id: 'c2', voix: 'Vous écrivez votre but en une phrase, puis votre situation. Le texte à traiter, vous l’ajoutez seulement si vous en avez un.', sous_titre: 'Votre but, votre situation, et un texte si vous en avez un.' },
    { id: 'c3', voix: 'La demande se compose en direct. Des boutons règlent la longueur, le langage, et des consignes de prudence.', sous_titre: 'La demande se compose en direct. Vous réglez la longueur, le langage, la prudence.' },
    { id: 'c4', voix: 'Puis vous copiez la demande et vous la collez dans l’assistant de votre choix. À l’étape suivante, vous lisez la réponse et vous améliorez votre demande.', sous_titre: 'Vous copiez la demande. Puis vous lisez la réponse et vous l’améliorez.' },
    { id: 'c5', voix: 'Enfin, vous pouvez garder vos demandes sur la disquette, pour les retrouver plus tard.', sous_titre: 'Vous gardez vos demandes sur la disquette.' }
  ],
  async jouer(o) {
    const p = o.p;
    await partir(o);
    o.commencer();
    await o.bloc('c1');
    await o.cliquer(p.locator('[data-buia-act="chemin"][data-v="ecrire"]'), 900); await dormir(1.8);
    await o.finDeVoix(0.3);
    await o.bloc('c2');
    await o.cliquer(p.locator('[data-buia-champ="l-but"]'), 800);
    await p.keyboard.type('Écrire à une ambassade pour demander un rendez-vous.', { delay: 55 }); await dormir(0.6);
    await o.cliquer(p.locator('[data-buia-champ="l-situation"]'), 800);
    await p.keyboard.type('Je prépare un voyage et je ne parle pas bien la langue.', { delay: 55 }); await dormir(0.8);
    await o.finDeVoix(0.3);
    await o.bloc('c3');
    await o.cliquer(p.locator('[data-buia-act="l-choix"][data-v="court"]'), 800); await dormir(1.0);
    await o.cliquer(p.locator('[data-buia-act="l-choix"][data-v="simple"]'), 800); await dormir(1.0);
    await o.cliquer(p.locator('[data-buia-act="l-interrupteur"][data-v="inventer"]'), 800); await dormir(1.4);
    await o.finDeVoix(0.3);
    await o.bloc('c4');
    await o.survol(p.locator('[data-buia-act="l-copier"]'), 900); await dormir(0.8);
    await o.cliquer(suivant(p), 800); await dormir(1.8);
    await o.finDeVoix(0.3);
    await o.bloc('c5');
    await o.cliquer(suivant(p), 800); await dormir(1.8);
    await o.defiler(250, 900); await dormir(1.0);
    await o.finDeVoix(1.0);
  }
};
