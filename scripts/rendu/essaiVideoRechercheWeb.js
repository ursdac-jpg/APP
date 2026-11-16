/* Essai réel : la vidéo « activer la recherche web sur ChatGPT » est posée aux endroits où l'application demande une recherche en direct (consigne 267, 12/11/2026).
   Pour chaque écran : la ligne de vidéo est-elle présente, s'ouvre-t-elle, le fichier se charge-t-il ? Captures dans scripts/rendu/sorties_rectangles/.
   Utilisation : NODE_PATH=<node_modules de Playwright> node scripts/rendu/essaiVideoRechercheWeb.js */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { ouvrir } = require('../parcours/lancerEssais.js');
(async () => {
  const sortie = path.join(__dirname, 'sorties_rectangles'); fs.mkdirSync(sortie, { recursive: true });
  const b = await chromium.launch();
  const p = await ouvrir(b, 800);
  const erreurs = []; p.on('pageerror', (e) => erreurs.push(e.message.slice(0, 200)));
  await p.goto('http://app.local/index.html'); await p.waitForTimeout(3500); await p.mouse.click(3, 300);
  const ECRANS = {
    chiffres_porte_A: () => { naviguerVers('comprendre-les-chiffres'); },
    cadre_recherche: () => { naviguerVers('comprendre-le-cadre'); },
    pistes: () => { naviguerVers('comparer-pistes'); },
    ucpm: () => { naviguerVers('un-cv-plusieurs-metiers'); }
  };
  // Rendu direct des morceaux d'écran (les écrans complets demandent des données de départ).
  const rendus = await p.evaluate(() => {
    const sortie = {};
    const essai = (nom, f) => { try { const h = f(); sortie[nom] = { present: /data-video-presentation="chatgpt-recherche-web"/.test(h), longueur: h.length }; } catch (e) { sortie[nom] = { erreur: e.message.slice(0, 150) }; } };
    essai('chiffres : liste des assistants', () => _comprendreLesChiffresRenduAssistants());
    essai('chiffres : porte A', () => _comprendreLesChiffresRenduPorteA());
    essai('cadre : texte de recherche 1', () => _comprendreLeCadreRenduRecherchePrompt1());
    essai('ucpm : panneau des offres', () => ucpmHtmlPanneauOffres({ assistant: 'chatgpt', sexe: 'f' }, [], { offres: { assistant: 'chatgpt' } }, {}));
    return sortie;
  });
  console.log(JSON.stringify(rendus, null, 1));
  // Ouverture réelle de la vidéo sur la porte A des chiffres
  await p.evaluate(() => { naviguerVers('comprendre-les-chiffres'); }); await p.waitForTimeout(1500);
  await p.evaluate(() => { app.innerHTML = '<div id="essaiZone">' + _comprendreLesChiffresRenduPorteA() + '</div>'; const e2 = document.getElementById('comprendreLesChiffresPorteAEtape2'); if (e2) { e2.hidden = false; } });
  const ligne = await p.$('[data-video-presentation="chatgpt-recherche-web"] [data-vp-bouton]');
  console.log('ligne de vidéo trouvée :', !!ligne);
  if (ligne) {
    await ligne.scrollIntoViewIfNeeded(); await p.screenshot({ path: path.join(sortie, 'video_recherche_web_fermee.png') });
    await ligne.click(); await p.waitForTimeout(1500);
    const v = await p.evaluate(() => { const e = document.querySelector('[data-video-presentation="chatgpt-recherche-web"] video'); return e ? { src: e.currentSrc || e.src, pret: e.readyState, duree: e.duration, erreur: e.error ? e.error.code : null } : null; });
    console.log('lecteur ouvert :', JSON.stringify(v));
    await p.screenshot({ path: path.join(sortie, 'video_recherche_web_ouverte.png') });
  }
  console.log('erreurs de page :', erreurs.length, erreurs.slice(0, 3).join(' | '));
  await b.close();
})();
