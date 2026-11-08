/* Lot C : présentation du Lexique (environ 1 minute). Objectif, spécificité (mots jamais expliqués), manières de chercher,
   fiche (définition, chiffres, « À ne pas confondre », « Voir aussi »), boutons propres de la fiche (favoris, Garder comme Repère),
   complémentarité (« Mots de cette page », barre de recherche de l'accueil). Consignes 172, 173, 175. */
const { dormir } = require('../lib');
const URL = 'http://localhost:8123/index.html';
module.exports = {
  blocs: [
    { id: 'x1', voix: 'Le Lexique explique les mots du monde du travail : contrats, sigles, dispositifs, questions d’entretien. Des mots qu’on est censé connaître, sans qu’on nous les ait jamais expliqués.', sous_titre: 'Le Lexique explique les mots du monde du travail : contrats, sigles, dispositifs.' },
    { id: 'x2', voix: 'Tapez un mot, un sigle ou une question. Les fiches qui correspondent s’affichent tout de suite.', sous_titre: 'Tapez un mot, un sigle ou une question : les fiches s’affichent.' },
    { id: 'x3', voix: 'Chaque fiche donne une définition courte et claire, et les chiffres à jour quand il y en a.', sous_titre: 'Une fiche : une définition claire, et les chiffres à jour.' },
    { id: 'x4', voix: 'Plus bas, À ne pas confondre avec, et Voir aussi, renvoient vers les fiches voisines.', sous_titre: '« À ne pas confondre avec » et « Voir aussi » renvoient vers les fiches voisines.' },
    { id: 'x5', voix: 'Ajouter aux favoris garde la fiche dans Mes favoris. Garder comme Repère la met de côté dans Mes Repères.', sous_titre: '« Ajouter aux favoris » et « Garder comme Repère » (dans Mes Repères).' },
    { id: 'x6', voix: 'Sans mot précis, parcourez les fiches par thème, par domaine, ou de A à Z avec le Mode Livre.', sous_titre: 'Par thème, par domaine, ou de A à Z avec le Mode Livre.' },
    { id: 'x7', voix: 'Le Lexique est aussi partout : le bouton Mots de cette page, et la barre de recherche de l’accueil, ouvrent directement la bonne fiche.', sous_titre: 'Partout : « Mots de cette page » et la barre de recherche de l’accueil.' }
  ],
  async jouer(o) {
    const p = o.p;
    await p.goto(URL); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} }); await p.reload(); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.mouse.move(640, 620); o.mx = 640; o.my = 620; await dormir(0.4);
    // ---- début du film
    o.commencer();
    await o.bloc('x1');
    await o.cliquer(p.locator('[data-carte-accueil="boiteaoutils"]'), 800); await dormir(0.4);
    await o.cliquer(p.locator('#fenetreERIP .sous-carte-accueil', { hasText: 'Lexique' }).first(), 650); await dormir(1.5);
    await p.evaluate(() => window.scrollBy(0, 300)); await dormir(1.5);
    await o.finDeVoix(0.3);
    await o.cliquer(p.locator('#btnLexiqueIntroOuvrir'), 700); await dormir(0.8);
    await o.bloc('x2');
    await o.cliquer(p.locator('#lexiqueRechercheInput'), 700);
    await p.locator('#lexiqueRechercheInput').pressSequentially('CDD', { delay: 200 }); await dormir(1.2);
    await o.finDeVoix(0.3);
    await o.bloc('x3');
    await o.cliquer(p.locator('[data-lexique-fiche="cdd"]').first(), 800); await dormir(0.8);
    await p.evaluate(() => window.scrollTo(0, 0)); await dormir(1.0);
    await o.survol(p.locator('text=Un CDD (contrat à durée déterminée)').first(), 800); await dormir(0.8);
    await o.defiler(260, 1400); await dormir(0.6);
    await o.finDeVoix(0.3);
    await o.bloc('x4');
    await p.evaluate(() => { const e = [...document.querySelectorAll('*')].find(x => x.children.length === 0 && x.textContent.trim() === 'À ne pas confondre avec'); if (e) e.scrollIntoView({ block: 'start', behavior: 'instant' }); window.scrollBy(0, -80); }); await dormir(0.8);
    await o.survol(p.locator('text=Voir aussi').first(), 900); await dormir(0.8);
    await o.finDeVoix(0.3);
    await o.bloc('x5');
    await p.evaluate(() => { const e = document.querySelector('.lexique-fiche-action-favori'); if (e) e.scrollIntoView({ block: 'center', behavior: 'instant' }); }); await dormir(0.6);
    await o.cliquer(p.locator('.lexique-fiche-action-favori').first(), 800); await dormir(0.6);
    await o.survol(p.locator('button', { hasText: 'Garder comme Repère' }).first(), 800); await dormir(0.6);
    await o.finDeVoix(0.3);
    await o.bloc('x6');
    await p.evaluate(() => window.scrollTo(0, 0)); await dormir(0.4);
    await o.cliquer(p.locator('#lexiqueRetourRecherche'), 800); await dormir(1.0);
    await p.evaluate(() => { const e = document.querySelector('#lexiqueVoirDomaines'); if (e) e.scrollIntoView({ block: 'center', behavior: 'instant' }); }); await dormir(0.5);
    await o.survol(p.locator('.lexique-accueil-carte').first(), 700);
    await o.survol(p.locator('#lexiqueVoirDomaines'), 700);
    await o.survol(p.locator('#lexiqueVoirModeLivre'), 700);
    await o.finDeVoix(0.3);
    await o.bloc('x7');
    await p.evaluate(() => window.scrollTo(0, 0)); await dormir(0.3);
    await o.cliquer(p.getByRole('button', { name: /Accueil/ }).last(), 800); await dormir(1.0);
    await o.survol(p.locator('#rechercheERIPInput'), 900); await dormir(0.8);
    await o.finDeVoix(1.0);
  }
};
