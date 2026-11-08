/* Lot C : présentation de « Découvrir mes compétences » (environ 1 minute). Module à part entière (consigne 171) : il part de documents déjà écrits
   (CV, lettre, recommandation), repère les compétences avec la phrase qui les prouve, produit le document « Mes compétences ».
   Les écrans de relecture et du document sont montés avec des lignes fictives semées hors réponse d'assistant (mêmes écrans que l'application). */
const { dormir } = require('../lib');
const URL = 'http://localhost:8123/index.html';
const ETAT = {
  ecran: 'relecture', niveau: 'auto', niveauPropose: 'execution', niveauIndices: 'Vos documents parlent de postes d’exécution.',
  documents: [{ id: 1, type: 'cv', texte: 'Agent d’entretien. Entretien de 12 locaux par jour, gestion des produits.' }, { id: 2, type: 'recommandation', texte: 'Toujours à l’heure, même les jours de forte affluence.' }],
  lignes: [
    { id: 'c1', famille: 'savoirFaire', libelle: 'Entretenir des locaux', enMotsSimples: 'Nettoyer et ranger des pièces ou des bureaux, chaque jour.',
      preuves: [{ typeDocument: 'cv', numeroDocument: 1, extrait: 'Entretien de 12 locaux par jour' }], confirmation: 'relevee',
      pourLeCV: 'Entretien quotidien de 12 locaux professionnels', pourLOral: 'Je m’occupais de douze locaux par jour, dans un ordre précis pour ne rien oublier.', synonymes: ['Nettoyage de bureaux', 'Entretien de surfaces'], pourPreparer: '', geste: '' },
    { id: 'c2', famille: 'savoirEtre', libelle: 'Ponctualité', enMotsSimples: 'Arriver à l’heure et tenir ses horaires.',
      preuves: [{ typeDocument: 'recommandation', numeroDocument: 1, extrait: 'Toujours à l’heure, même les jours de forte affluence' }], confirmation: 'confirmee',
      pourLeCV: 'Ponctualité reconnue par un ancien responsable', pourLOral: 'On peut compter sur moi pour les horaires, même les jours chargés.', synonymes: [], pourPreparer: '', geste: 'ok' },
    { id: 'c3', famille: 'savoirs', libelle: 'Produits d’entretien', enMotsSimples: 'Choisir et utiliser les bons produits.',
      preuves: [{ typeDocument: 'cv', numeroDocument: 1, extrait: 'gestion des produits' }], confirmation: 'aPreciser', question: 'Quels produits utilisiez-vous, et avec quelles précautions ?', pourLeCV: '', pourLOral: '', synonymes: [], pourPreparer: '' }
  ],
  prochainId: 4
};
module.exports = {
  blocs: [
    { id: 'm1', voix: 'Découvrir mes compétences part de vos documents : un CV, une lettre, une recommandation. Il y repère ce que vous savez déjà faire, une compétence après l’autre, avec la phrase qui le prouve.', sous_titre: 'Découvrir mes compétences : repérées dans vos documents, avec la phrase qui le prouve.' },
    { id: 'm2', voix: 'Vous déposez un ou plusieurs documents. Vous masquez ce qui est personnel. Puis un assistant en ligne les lit : vous copiez un message, et vous collez sa réponse dans la page.', sous_titre: 'Vous déposez vos documents, vous masquez le personnel, l’assistant les lit.' },
    { id: 'm3', voix: 'Vous relisez ensuite chaque ligne. Rien n’est inventé : sans phrase de vos documents, pas de ligne. C’est exact, en partie exact, ou je retire : c’est vous qui décidez.', sous_titre: 'Rien n’est inventé. « C’est exact », « En partie exact » ou « Je retire » : vous décidez.' },
    { id: 'm4', voix: 'Chaque ligne se dit pour votre CV, et à l’oral, avec d’autres façons de la dire.', sous_titre: 'Chaque ligne se dit pour le CV, et à l’oral.' },
    { id: 'm5', voix: 'Vous repartez avec votre document Mes compétences : à télécharger en PDF ou en Word, ou à copier. Il nourrit votre CV, et prépare vos entretiens.', sous_titre: 'Le document « Mes compétences » : PDF, Word ou copie. Il nourrit le CV et prépare l’entretien.' },
    { id: 'm6', voix: 'Ici, on part de documents que vous avez déjà. Si vous préférez raconter, À partir de mon récit, dans Créer un nouveau CV, part de ce que vous dites.', sous_titre: 'Ici, on part de documents. « À partir de mon récit » part de ce que vous racontez.' }
  ],
  async jouer(o) {
    const p = o.p;
    await p.goto(URL); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} }); await p.reload(); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.mouse.move(640, 620); o.mx = 640; o.my = 620; await dormir(0.4);
    // ---- début du film
    o.commencer();
    await o.bloc('m1');
    await o.cliquer(p.locator('[data-carte-accueil="boiteaoutils"]'), 800); await dormir(0.4);
    await o.cliquer(p.locator('#fenetreERIP .sous-carte-accueil', { hasText: 'Découvrir mes compétences' }).first(), 650); await dormir(1.5);
    await p.evaluate(() => window.scrollBy(0, 250)); await dormir(1.5);
    await o.finDeVoix(0.3);
    await o.bloc('m2');
    await o.cliquer(p.locator('#btnMesCompCommencer'), 700); await dormir(1.2);
    await o.cliquer(p.locator('#btnMcDeposer_cv'), 800); await dormir(1.8);
    await o.finDeVoix(0.3);
    await o.bloc('m3');
    await p.evaluate((e) => { _mesCompDepotOuvert = null; _mesCompEtat = mesCompNormaliserEtat(e); mesCompRendrePage(); window.scrollTo(0, 0); }, ETAT); await dormir(1.5);
    await o.defiler(240, 1200); await dormir(0.5);
    await o.survol(p.locator('[data-mc-geste="ok"]').first(), 800);
    await o.cliquer(p.locator('[data-mc-geste="ok"]').first(), 500); await dormir(0.5);
    await o.survol(p.locator('[data-mc-geste="non"]').first(), 700);
    await o.finDeVoix(0.3);
    await o.bloc('m4');
    await o.cliquer(p.locator('details.mc-sous summary', { hasText: 'Pour mon CV' }).first(), 800); await dormir(0.6);
    await o.cliquer(p.locator('details.mc-sous summary', { hasText: 'oral' }).first(), 800); await dormir(0.8);
    await o.finDeVoix(0.3);
    await o.bloc('m5');
    await p.evaluate(() => { _mesCompEtat.ecran = 'document'; mesCompRendrePage(); window.scrollTo(0, 0); }); await dormir(1.5);
    await o.defiler(300, 1200); await dormir(0.5);
    await o.survol(p.locator('#btnMcPdf'), 800);
    await o.survol(p.locator('#btnMcWord'), 700);
    await o.survol(p.locator('#btnMcCopierTexte'), 700);
    await o.finDeVoix(0.3);
    await o.bloc('m6');
    await dormir(2.5);
    await o.finDeVoix(1.0);
  }
};
