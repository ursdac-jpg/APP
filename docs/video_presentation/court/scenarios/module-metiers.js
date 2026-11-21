/* Présentation du module « Explorer les métiers » (environ 1 minute) : à quoi il sert, les quatre chemins, Ma synthèse. Clé : metiers. Parcours joué dans l'application réelle. */
const { preparer, versModule, versAccueilModule, dormir } = require('./metiers-commun');
module.exports = {
  blocs: [
    { id: 'm1', voix: 'Explorer les métiers vous aide à découvrir des métiers, ou à mieux comprendre ceux que vous connaissez mal. Rien n’est obligatoire, et aucune réponse n’est mauvaise.', sous_titre: 'Explorer les métiers : découvrir des métiers, ou mieux comprendre ceux que vous connaissez.' },
    { id: 'm2', voix: 'Il y a quatre chemins. Chercher un métier. Partir de vos envies. Répondre à un questionnaire. Ou voir ce que les employeurs de votre département veulent embaucher.', sous_titre: 'Quatre chemins : chercher un métier, vos envies, un questionnaire, les emplois en demande.' },
    { id: 'm3', voix: 'Vous pouvez en essayer un, puis un autre. Chaque chemin a sa propre présentation, avec une vidéo, sur sa carte.', sous_titre: 'Essayez-en un, puis un autre. Chaque chemin a sa présentation et sa vidéo.' },
    { id: 'm4', voix: 'Quand vous avez fait un passage, Ma synthèse rassemble vos résultats sur une seule page. Vous y ajoutez les métiers que vous avez exercés. Vous pouvez demander à l’assistant en ligne de proposer des pistes de réflexion, jamais une note.', sous_titre: 'Ma synthèse : vos résultats, votre parcours, des pistes de réflexion. Jamais une note.' },
    { id: 'm5', voix: 'Rien n’est conservé sans votre accord. Pour garder votre synthèse, vous utilisez la disquette de l’application.', sous_titre: 'Rien n’est conservé sans votre accord : la disquette garde votre synthèse.' }
  ],
  async jouer(o) {
    const p = o.p;
    await preparer(o);
    o.commencer();
    await o.bloc('m1');
    await versModule(o);
    await o.defiler(300, 1800); await dormir(0.8);
    await o.finDeVoix(0.3);
    await o.bloc('m2');
    await p.evaluate(() => window.scrollTo(0, 0)); await dormir(0.5);
    await versAccueilModule(o);
    await o.survol(p.locator('[data-cml="entrer"]').nth(0), 700); await o.survol(p.locator('[data-cml="entrer"]').nth(1), 900);
    await o.survol(p.locator('[data-cml="entrer"]').nth(2), 900); await o.survol(p.locator('[data-cml="entrer"]').nth(3), 900);
    await o.finDeVoix(0.3);
    await o.bloc('m3');
    await o.survol(p.locator('[data-cml="presenter"]').nth(0), 800); await o.survol(p.locator('[data-cml="presenter"]').nth(1), 800);
    await o.survol(p.locator('[data-cml="presenter"]').nth(3), 800);
    await o.finDeVoix(0.3);
    await o.bloc('m4');
    // Un passage fictif pour que le bloc « Ma synthèse » apparaisse (Animateur retenu), puis la page de la synthèse.
    await p.evaluate(async () => { await _synChargerFiches(); synBasculerRetenu(1, 'Animateur', 'G1203'); cmvRendre(); });
    await dormir(1.0);
    await o.cliquer(p.locator('[data-cml="aller"][data-vue="synthese"]'), 800); await dormir(1.5);
    await o.survol(p.locator('button', { hasText: 'Ajouter mon parcours' }).first(), 1400); await dormir(1.2);
    await o.finDeVoix(0.3);
    await o.bloc('m5');
    await o.survol(p.locator('text=Garder ma synthèse').first(), 1600); await dormir(1.5);
    await o.finDeVoix(1.0);
  }
};
