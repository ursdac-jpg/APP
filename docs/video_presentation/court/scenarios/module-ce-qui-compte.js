/* Présentation de « Ce qui compte pour moi » (environ 1 minute) : la page de présentation, l'accueil en quatre parties, le texte de fin de partie
   avec « Plus d'informations » (consigne 601), une carte (« Si rien ne m'arrêtait »), le résultat, puis « Ce que j'ai gardé » et la disquette. Clé : ce-qui-compte.
   Parcours joué dans l'application réelle ; réponses fictives (aucune donnée de personne). */
const { dormir } = require('../lib');
const URL = 'http://localhost:8123/index.html';
module.exports = {
  blocs: [
    { id: 'c1', voix: 'Ce qui compte pour moi est un espace pour mettre des mots sur ce que vous aimeriez, sur ce qui compte pour vous dans un travail, et sur ce que vous avez vécu. Ni test, ni note.', sous_titre: 'Ce qui compte pour moi : mettre des mots sur vos envies, ce qui compte pour vous, votre vécu.' },
    { id: 'c2', voix: 'L’accueil range huit cartes en quatre parties : ce que vous aimeriez, ce qui compte, ce que vous avez vécu, et la suite. Chaque carte est indépendante : vous commencez par celle que vous voulez.', sous_titre: 'Huit cartes, quatre parties. Vous commencez par celle que vous voulez.' },
    { id: 'c3', voix: 'À la fin de chaque partie, un court texte dit ce qu’elle cherche. Le bouton Plus d’informations explique à quoi elle sert, et détaille chaque carte.', sous_titre: 'À la fin de chaque partie : ce qu’elle cherche, et « Plus d’informations ».' },
    { id: 'c4', voix: 'Dans une carte, une page d’invitation dit ce que vous allez faire. Ensuite, vous écrivez ou vous choisissez, à votre rythme. Vous pouvez aussi passer une question.', sous_titre: 'Une carte : l’invitation, puis vos réponses, à votre rythme. Vous pouvez passer une question.' },
    { id: 'c5', voix: 'À la fin, vous voyez votre résultat, avec vos mots. Vous choisissez de le garder, ou non. Rien n’est enregistré sans votre accord.', sous_titre: 'Votre résultat, avec vos mots. Vous le gardez, ou non.' },
    { id: 'c6', voix: 'Vos résultats gardés restent dans Ce que j’ai gardé, et partent avec la disquette, votre sauvegarde personnelle. Vous pouvez aussi les imprimer, pour les apporter à un conseiller.', sous_titre: 'Les résultats gardés partent avec la disquette. Vous pouvez les imprimer.' }
  ],
  async jouer(o) {
    const p = o.p;
    await p.goto(URL); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.evaluate(() => { try { localStorage.clear(); sessionStorage.clear(); } catch (e) {} }); await p.reload(); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.mouse.move(640, 620); o.mx = 640; o.my = 620; await dormir(0.4);
    // ---- début du film
    o.commencer();
    await o.bloc('c1');
    await o.cliquer(p.locator('[data-carte-accueil="boiteaoutils"]'), 800); await dormir(0.4);
    await o.cliquer(p.locator('#btnCarteAccueilCeQuiCompte'), 650); await dormir(1.5);
    await p.evaluate(() => window.scrollBy(0, 200)); await dormir(1.2);
    await o.finDeVoix(0.3);
    await o.bloc('c2');
    await o.cliquer(p.locator('#btnCqcpmCommencer'), 700); await dormir(1.4);
    await o.defiler(520, 2200); await dormir(0.6);
    await o.finDeVoix(0.3);
    await o.bloc('c3');
    await o.survol(p.locator('.cqcpm-fin .cherche').first(), 900); await dormir(0.6);
    await o.cliquer(p.locator('.cqcpm-fin summary').first(), 800); await dormir(1.2);
    await o.defiler(await p.evaluate(() => window.scrollY + 260), 1600); await dormir(1.2);
    await o.cliquer(p.locator('.cqcpm-fin summary').first(), 800); await dormir(0.6);
    await o.finDeVoix(0.3);
    await o.bloc('c4');
    await p.evaluate(() => window.scrollTo(0, 0)); await dormir(0.5);
    await o.cliquer(p.locator('[data-cqcpm-act="commencer-carte"][data-v="envies"]'), 800); await dormir(1.3);
    await o.cliquer(p.locator('button[onclick="cqcpmContinuerBarre()"]'), 800); await dormir(1.2);
    await o.cliquer(p.locator('[data-cqcpm-act="amorce"]').first(), 800); await dormir(0.6);
    await p.keyboard.type(' à cuisiner pour mes proches', { delay: 70 }); await dormir(0.5);
    await o.cliquer(p.locator('[data-cqcpm-act="liste-ajouter"]'), 700); await dormir(1.0);
    await o.survol(p.locator('[data-cqcpm-act="passer"]').first(), 800); await dormir(0.6);
    await o.finDeVoix(0.3);
    await o.bloc('c5');
    // Les deux autres envies et les trois retenues sont posées hors film, pour arriver au résultat.
    await p.evaluate(() => {
      const envies = ['J’aimerais apprendre à cuisiner pour mes proches', 'J’aimerais voir la mer en hiver', 'J’aimerais aider un voisin à faire ses courses'];
      const etat = cqcpmEtat();
      cqcpmPoserReponse(etat, 'envies', 'envies', envies);
      cqcpmPoserReponse(etat, 'envies', 'retenues', envies);
      cqcpmPoserReponse(etat, 'envies', 'fiches', [
        { cle: envies[0], attire: 'Faire plaisir aux autres avec quelque chose de simple.', petite: 'Préparer un plat pour un voisin ce week-end.' },
        { cle: envies[1], attire: 'Le calme, et prendre du recul.', petite: 'Regarder les tarifs d’un train pour la côte.' },
        { cle: envies[2], attire: 'Me sentir utile, près de chez moi.', petite: 'Proposer mon aide à mon voisin cette semaine.' }
      ]);
      const carte = cqcpmCarte('envies');
      _cqcpmUi.vue = 'carte'; _cqcpmUi.carte = 'envies'; _cqcpmUi.ecran = _cqcpmDernierEcran(carte);
      cqcpmRendre();
    });
    await dormir(1.6);
    await o.survol(p.locator('.cqcpm-bloc').first(), 900); await dormir(0.6);
    await o.cliquer(p.locator('[data-cqcpm-act="garder"]'), 900); await dormir(1.4);
    await o.finDeVoix(0.3);
    await o.bloc('c6');
    await o.cliquer(p.locator('[data-cqcpm-act="retour-espace"]').first(), 800); await dormir(1.0);
    await o.cliquer(p.locator('[data-cqcpm-act="voir-gardees"]'), 800); await dormir(1.5);
    await o.survol(p.locator('#btnSessionTransfert'), 900); await dormir(1.0);
    await o.finDeVoix(1.0);
  }
};
