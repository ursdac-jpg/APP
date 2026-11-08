/* Pilote 2 : la disquette (exporter sa session, la rouvrir plus tard). 30 s au plus. Écrans : accueil, panneau de la disquette, fenêtre de confirmation. */
const { dormir } = require('../lib');
const FICHIER = 'C:/Users/Denis/video_travail/disquette/session_camille.json';
const URL = 'http://localhost:8123/index.html';
module.exports = {
  blocs: [
    { id: 'd1', voix: 'Cette application ne garde rien toute seule. Pour retrouver votre travail, utilisez la disquette.', sous_titre: 'L’application ne garde rien toute seule. Pour retrouver votre travail, utilisez la disquette.' },
    { id: 'd2', voix: 'Cliquez sur Exporter ma session : un fichier est enregistré sur votre appareil.', sous_titre: 'Exporter ma session : un fichier est enregistré sur votre appareil.' },
    { id: 'd3', voix: 'Plus tard, rouvrez la disquette et choisissez Importer une session.', sous_titre: 'Plus tard, rouvrez la disquette : Importer une session.' },
    { id: 'd4', voix: 'Choisissez votre fichier et confirmez : votre travail est de retour.', sous_titre: 'Choisissez votre fichier et confirmez : votre travail est de retour.' }
  ],
  async jouer(o) {
    const p = o.p;
    await p.goto(URL); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} }); await p.reload(); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    // Préparation hors caméra : un début de CV (Camille, personnage inventé), pour que « Exporter » soit disponible.
    await p.click('[data-carte-accueil="mesdocuments"]'); await dormir(0.6);
    await p.click('#btnCarteAccueilCvNouveau'); await dormir(0.8);
    await p.click('#btnCreerCvSansAssistant'); await dormir(0.6);
    await p.getByText('Commencer mon CV', { exact: false }).first().click(); await dormir(0.6);
    await p.getByText('Candidature spontanée', { exact: false }).first().click(); await dormir(0.4);
    await p.getByText('Un métier précis', { exact: false }).first().click(); await dormir(0.4);
    await p.click('#rechercheMetierCibleInput'); await p.locator('#rechercheMetierCibleInput').pressSequentially('agent d', { delay: 40 }); await dormir(1.0);
    await p.locator('.option-metier-ajout-nom').first().click(); await dormir(0.5);
    await p.getByText('Je me présente de façon générale', { exact: false }).first().click(); await dormir(0.4);
    await p.click('#btnSuivantNavigation'); await dormir(0.6);
    await p.fill('#identitePrenom', 'Camille'); await p.fill('#identiteNom', 'Martin'); await p.fill('#identiteTelephone', '0612345678');
    await p.fill('#identiteEmail', 'camille.martin@exemple.fr'); await p.fill('#identiteCodePostal', '87000'); await p.fill('#identiteVille', 'Limoges'); await dormir(0.4);
    await p.click('#btnEnregistrerIdentite'); await dormir(0.8);
    await p.evaluate(() => window.scrollTo(0, 0)); await p.mouse.move(640, 620); await dormir(0.5);
    // ---- début du film
    o.commencer();
    await o.bloc('d1');
    await o.survol(p.locator('#btnSessionTransfert'), 1000); await dormir(0.5);
    await o.cliquer(p.locator('#btnSessionTransfert'), 300); await o.finDeVoix(0.5);
    await o.bloc('d2');
    await o.survol(p.locator('#btnExporterSessionFixe'), 700); await dormir(0.2);
    const dl = p.waitForEvent('download', { timeout: 8000 });
    await o.cliquer(p.locator('#btnExporterSessionFixe'), 300);
    const d = await dl; await d.saveAs(FICHIER); await o.finDeVoix(0.6);
    // Plus tard : la page est rouverte, tout est vide.
    await p.evaluate(() => recommencer()); await dormir(1.0);   // page rouverte plus tard : la session est vide (sans rechargement, qui laisserait un écran blanc)
    await p.mouse.move(640, 620); o.mx = 640; o.my = 620;
    await o.bloc('d3');
    await o.cliquer(p.locator('#btnSessionTransfert'), 800); await dormir(0.5);
    const fc = p.waitForEvent('filechooser', { timeout: 8000 });
    await o.cliquer(p.locator('#btnImporterSessionFixe'), 700);
    const ch = await fc; await o.finDeVoix(0.4);
    await o.bloc('d4');
    await ch.setFiles(FICHIER); await dormir(0.9);
    const conf = p.locator('.modal.show .btn-primary, #fenetreERIP .btn-primary, [role=dialog] .btn-primary').filter({ hasText: 'Importer' }).first();
    await o.cliquer(conf, 700); await dormir(1.2);
    await o.finDeVoix(1.0);
  }
};
