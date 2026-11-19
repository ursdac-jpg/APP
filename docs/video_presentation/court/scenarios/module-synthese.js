/* Présentation de « Ma synthèse » (environ 1 minute 20) : la page, « Mon parcours », la lecture par l'assistant en ligne, la disquette. Clé : synthese. Parcours joué dans l'application réelle. */
const { preparer, versModule, versAccueilModule, dormir } = require('./metiers-commun');
module.exports = {
  blocs: [
    { id: 's1', voix: 'Ma synthèse rassemble, sur une seule page, ce que vous avez trouvé dans Explorer les métiers : le métier retenu, vos envies, vos résultats.', sous_titre: 'Ma synthèse : vos résultats rassemblés sur une seule page.' },
    { id: 's2', voix: 'Vous pouvez y ajouter ce que les tests ne disent pas : votre niveau d’études, ce qui compte pour vous en ce moment, vos propres mots.', sous_titre: 'Ce que les tests ne disent pas : niveau d’études, ce qui compte pour vous, vos mots.' },
    { id: 's3', voix: 'Dans Mon parcours, vous ajoutez les métiers que vous avez déjà exercés, jusqu’à cinq. Pour chacun, vous cochez ce que vous avez vraiment pratiqué.', sous_titre: 'Mon parcours : jusqu’à cinq métiers exercés, et ce que vous y avez pratiqué.' },
    { id: 's4', voix: 'L’application montre alors ce qui vous servirait déjà pour une piste, et ce qui resterait à construire. Ce n’est pas un CV : seuls des noms de métiers et de compétences peuvent être lus.', sous_titre: 'Ce qui vous servirait déjà, ce qui resterait à construire. Ce n’est pas un CV.' },
    { id: 's5', voix: 'Si vous le souhaitez, vous demandez à l’assistant en ligne de lire l’ensemble. Vous relisez la demande avant qu’elle parte, puis vous revenez coller sa réponse. Il propose des pistes de réflexion, jamais une note.', sous_titre: 'L’assistant en ligne lit l’ensemble : vous relisez la demande, puis vous collez sa réponse.' },
    { id: 's6', voix: 'Enfin, vous pouvez garder votre synthèse dans la disquette, ou l’imprimer. Rien n’est conservé sans votre accord.', sous_titre: 'Garder la synthèse dans la disquette, ou l’imprimer.' }
  ],
  async jouer(o) {
    const p = o.p;
    await preparer(o); await versModule(o); await versAccueilModule(o);
    // Un passage fictif (Animateur retenu) pour que la synthèse existe.
    await p.evaluate(async () => { _synChargerFiches(); for (let k = 0; k < 80 && !_synFichesPretes(); k++) { await new Promise(r => setTimeout(r, 250)); } const D = pmdDonnees(), i = D.m.findIndex(r => r[0] === 'Cuisinier de collectivité'); synBasculerRetenu(1, D.m[i][0], D.m[i].code); cmvRendre(); });
    await dormir(1.0);
    await p.mouse.move(640, 620); o.mx = 640; o.my = 620; await dormir(0.4);
    o.commencer();
    await o.bloc('s1');
    await o.cliquer(p.locator('[data-cml="aller"][data-vue="synthese"]'), 800); await dormir(1.5);
    await o.defiler(250, 1800); await dormir(0.8);
    await o.finDeVoix(0.3);
    await o.bloc('s2');
    await o.survol(p.locator('text=Ce que les tests ne disent pas').first(), 1100); await dormir(0.6);
    await o.cliquer(p.locator('button', { hasText: 'Bac' }).first(), 700).catch(() => {}); await dormir(0.8);
    await o.finDeVoix(0.3);
    await o.bloc('s3');
    await o.cliquer(p.locator('button', { hasText: 'Ajouter mon parcours' }).first(), 900); await dormir(1.8);
    await o.cliquer(p.locator('#synpRechM'), 700); await p.keyboard.type('cuisin', { delay: 90 }); await dormir(1.2);
    await o.cliquer(p.locator('#synpSuggM button').first(), 800); await dormir(2.0);
    for (let k = 0; k < 3; k++) { await o.cliquer(p.locator('.cml-jt').nth(k * 2), 700).catch(() => {}); await dormir(0.4); }
    await o.finDeVoix(0.3);
    await o.bloc('s4');
    await o.cliquer(p.locator('button', { hasText: 'Terminer ce métier' }).first(), 800); await dormir(1.8);
    await o.defiler(400, 2200); await dormir(1.0);
    await o.finDeVoix(0.3);
    await o.bloc('s5');
    await p.evaluate(() => cmvAller('synthese')); await dormir(1.2);
    await o.survol(p.locator('[data-cml="synDemander"]').first(), 1300); await dormir(0.6);
    await o.cliquer(p.locator('[data-cml="synDemander"]').first(), 500); await dormir(2.0);
    await o.defiler(350, 2000); await dormir(0.8);
    await o.cliquer(p.locator('button', { hasText: 'Aller sur ChatGPT' }).first(), 900).catch(() => {}); await dormir(2.5);
    await dormir(3.0); await p.keyboard.press('Escape'); await dormir(0.8);
    await o.finDeVoix(0.3);
    await o.bloc('s6');
    await p.evaluate(() => cmvAller('synthese')); await dormir(1.2);
    await o.survol(p.locator('text=Garder ma synthèse').first(), 1500); await dormir(1.5);
    await o.finDeVoix(1.0);
  }
};
