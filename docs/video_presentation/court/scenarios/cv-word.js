/* Lot B, vidéo B5 : télécharger son CV en Word (Valider le CV, bloc Exporter). 30 s au plus.
   Départ : « Vos documents » avec un CV d'exemple (monté hors film). Word lui-même n'est pas filmé : la voix l'explique. */
const { dormir } = require('../lib');
const URL = 'http://localhost:8123/index.html';
module.exports = {
  blocs: [
    { id: 'c1', voix: 'Pour un fichier Word, cliquez d’abord sur Valider le CV.', sous_titre: 'Pour un fichier Word : Valider le CV.' },
    { id: 'c2', voix: 'Dans le bloc Exporter, cliquez sur Télécharger en Word. Le fichier arrive dans vos téléchargements.', sous_titre: 'Dans Exporter : Télécharger en Word. Le fichier arrive dans vos téléchargements.' },
    { id: 'c3', voix: 'Ouvrez-le avec Word : vous pouvez retoucher le texte après le téléchargement.', sous_titre: 'Ouvrez-le avec Word : vous pouvez retoucher le texte.' },
    { id: 'c4', voix: 'Les lignes pointillées vues dans Word ne s’impriment pas. La page l’explique.', sous_titre: 'Les lignes pointillées vues dans Word ne s’impriment pas.' }
  ],
  async jouer(o) {
    const p = o.p;
    await p.goto(URL); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} }); await p.reload(); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.evaluate(() => {
      mgRemplirDossierExemple(window.dossier); window.dossier.photo = { url: '', inclure: false, souhaitee: 'non' };
      etatApercuInline.cv.sansAccroche = false; _assurerReglagesMiseEnPageCV();
      _rectDocOuvert = 'mise-en-page'; _rectDocOuvertPourType = 'cv'; naviguerVers('resultats');
    });
    await dormir(3);
    await p.evaluate(() => window.scrollTo(0, 0)); await p.mouse.move(640, 300); o.mx = 640; o.my = 300; await dormir(0.4);
    // ---- début du film
    o.commencer();
    await o.bloc('c1');
    await o.survol(p.getByRole('button', { name: /Valider le CV/ }).last(), 800);
    await o.cliquer(p.getByRole('button', { name: /Valider le CV/ }).last(), 700); await dormir(1.8);
    await o.finDeVoix(0.3);
    await o.bloc('c2');
    await o.cliquer(p.locator('[data-format-export="docx"]'), 800); await dormir(1.5);
    await o.finDeVoix(0.3);
    await o.bloc('c3');
    await o.survol(p.locator('text=Pour Word').first(), 800); await dormir(0.8);
    await o.finDeVoix(0.3);
    await o.bloc('c4');
    await o.survol(p.locator('text=lignes pointillées').first(), 800); await dormir(1.0);
    await o.finDeVoix(1.0);
  }
};
