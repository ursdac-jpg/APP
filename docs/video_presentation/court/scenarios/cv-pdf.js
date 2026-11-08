/* Lot B, vidéo B4 : enregistrer son CV en PDF (Valider le CV, bloc Exporter). 30 s au plus.
   Départ : « Vos documents » avec un CV d'exemple (monté hors film, comme le fait « Regarder nos modèles »).
   La fenêtre d'impression du navigateur n'est pas filmée : la voix et le texte de la page l'expliquent. */
const { dormir } = require('../lib');
const URL = 'http://localhost:8123/index.html';
module.exports = {
  blocs: [
    { id: 'c1', voix: 'Quand votre CV vous convient, cliquez sur Valider le CV.', sous_titre: 'Quand votre CV vous convient : Valider le CV.' },
    { id: 'c2', voix: 'Le bloc Exporter s’ouvre. Pour un fichier PDF, cliquez sur Enregistrer en PDF.', sous_titre: 'Le bloc Exporter s’ouvre : Enregistrer en PDF.' },
    { id: 'c3', voix: 'Dans la fenêtre qui s’ouvre, choisissez Enregistrer au format PDF, puis Enregistrer.', sous_titre: 'Dans la fenêtre : « Enregistrer au format PDF », puis « Enregistrer ».' },
    { id: 'c4', voix: 'Le fichier garde le format choisi dans La mise en page : A4, ou Mini CV A5.', sous_titre: 'Le fichier garde le format choisi : A4, ou Mini CV A5.' }
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
    await o.cliquer(p.locator('[data-format-export="pdf-imprimer"]'), 800); await dormir(1.0);
    await o.finDeVoix(0.3);
    await o.bloc('c3');
    await o.survol(p.locator('text=Pour le PDF').first(), 800); await dormir(0.8);
    await o.finDeVoix(0.3);
    await o.bloc('c4');
    await o.survol(p.locator('text=Votre CV est prêt').first(), 800); await dormir(1.0);
    await o.finDeVoix(1.0);
  }
};
