/* Lot C : présentation de « Les mots de votre CV (ATS) » (environ 1 minute) : objectif, ce que le module ne fait pas, étapes, puis la dernière partie = le résultat (consigne 174).
   Mise en place hors film : la session du module est semée directement à l'écran « Résultat », avec une réponse fictive lue par le vrai lecteur de réponse du module.
   Film : départ sur le résultat, « Revoir la présentation » (bouton réel), retour au module, lecture du résultat. */
const fs = require('fs');
const { dormir } = require('../lib');
const URL = 'http://localhost:8123/index.html';
const CV = fs.readFileSync('C:/Users/Denis/video_travail/ressources/cv_fictif_camille.txt', 'utf8');
const REPONSE = fs.readFileSync('C:/Users/Denis/video_travail/ressources/reponse_fictive_ats.json', 'utf8');
module.exports = {
  blocs: [
    { id: 'a1', voix: 'Les mots de votre CV compare le vocabulaire de votre CV avec celui d’une offre ou d’un métier, pour mieux faire ressortir votre parcours.', sous_titre: 'Les mots de votre CV : le vocabulaire de votre CV face à celui d’une offre ou d’un métier.' },
    { id: 'a2', voix: 'Beaucoup d’entreprises trient les CV avec un logiciel qui cherche des mots. Ce module compare des mots, jamais votre valeur : ni note, ni verdict.', sous_titre: 'Il compare des mots, jamais votre valeur. Ni une note, ni un verdict.' },
    { id: 'a3', voix: 'Vous déposez votre CV, vous masquez vos coordonnées, vous choisissez l’offre ou une fiche métier. Un assistant en ligne compare les mots, et vous collez sa réponse.', sous_titre: 'Votre CV masqué, une référence : l’offre ou une fiche métier. L’assistant compare les mots.' },
    { id: 'a4', voix: 'Le résultat se lit en quatre listes de même importance. D’abord, les mots de l’offre qui sont déjà dans votre CV : rien à faire.', sous_titre: 'Quatre listes. D’abord les mots déjà dans votre CV : rien à faire.' },
    { id: 'a5', voix: 'Ensuite, les mots que vous avez sûrement écrits autrement, avec une piste pour chacun, à n’utiliser que si c’est vrai. Vous pouvez en garder un comme Repère.', sous_titre: 'Les mots écrits autrement : une piste, à n’utiliser que si c’est vrai. À garder comme Repère.' },
    { id: 'a6', voix: 'Puis des changements précis, et une fiche à emporter. Ce module complète Analyser ma candidature, qui regarde le fond : ici, seulement les mots.', sous_titre: 'Des changements précis, une fiche à emporter. Un complément d’« Analyser ma candidature ».' }
  ],
  async jouer(o) {
    const p = o.p;
    await o.ctx.route(/chatgpt|openai|perplexity/, r => r.abort());
    o.ctx.on('page', pg => { pg.close().catch(() => {}); });
    await p.goto(URL); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} }); await p.reload(); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.evaluate(([cv, rep]) => {
      const r = parserResultatAts(rep, cv, {}, 'offre');
      _atsEtat = Object.assign(atsEtatNeuf(), { ecran: 'resultat', cvTexte: cv, cvNom: 'Mon CV', cvRelu: true, modeReference: 'offre', assistant: 'chatgpt', reponseCollee: rep, resultat: r });
      naviguerVers('ats');
    }, [CV, REPONSE]); await dormir(2.0);
    await p.evaluate(() => window.scrollTo(0, 0)); await dormir(0.4);
    await p.mouse.move(640, 560); o.mx = 640; o.my = 560; await dormir(0.4);
    // ---- début du film
    o.commencer();
    await o.bloc('a1');
    await o.cliquer(p.locator('button.btn-revoir-module, button:has-text("Revoir la présentation")').first(), 900); await dormir(1.5);
    await p.evaluate(() => window.scrollBy(0, 200)); await dormir(1.5);
    await o.finDeVoix(0.3);
    await o.bloc('a2');
    await p.evaluate(() => window.scrollBy(0, 300)); await dormir(1.5);
    await o.finDeVoix(0.3);
    await o.bloc('a3');
    await p.evaluate(() => window.scrollBy(0, 400)); await dormir(2.0);
    await o.finDeVoix(0.3);
    await o.cliquer(p.locator('#btnAtsRevenirModuleBas, #btnAtsRevenirModuleHaut').first(), 800); await dormir(1.2);
    await p.evaluate(() => window.scrollTo(0, 0)); await dormir(0.5);
    await o.bloc('a4');
    await o.defiler(250, 1200); await dormir(0.8);
    await o.finDeVoix(0.3);
    await o.bloc('a5');
    await o.cliquer(p.locator('summary', { hasText: 'Peut être formulé autrement' }).first(), 900); await dormir(0.8);
    await o.defiler(300, 1300); await dormir(0.6);
    await o.survol(p.locator('button', { hasText: 'Garder comme Repère' }).first(), 900); await dormir(0.6);
    await o.finDeVoix(0.3);
    await o.bloc('a6');
    await o.defiler(1100, 1800); await dormir(0.8);
    await o.survol(p.locator('button:visible', { hasText: 'Voir ma fiche' }).last(), 900); await dormir(1.0);
    await o.finDeVoix(1.0);
  }
};
