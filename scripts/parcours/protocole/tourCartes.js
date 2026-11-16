/* Tour des tuiles des cartes de l'accueil (consigne 249, « même rigueur ensuite pour tous les autres parcours »).
   Pour chaque tuile : ouverture de la carte, clic sur la tuile, contrôle de l'écran d'arrivée (boutons, bouton du bas, Retour, Accueil), avance avec « Continuer » tant
   qu'il est actif (3 écrans au plus), chaîne de « Retour » jusqu'à la sortie du module, puis vérification que « Retour » ramène à la carte (fenêtre) ou à l'accueil.
   Variable CARTES = liste de cartes séparées par des virgules (par défaut : les cinq autres cartes). Variable TUILES = filtre sur l'identifiant du bouton de tuile. */
const CARTES = { preparer: 'Me préparer à candidater', boiteaoutils: 'Boîte à outils', analyse: 'Outils d’analyse', informe: 'Se tenir informé', orientation: 'Vous hésitez encore ?' };
module.exports = {
  nom: 'tourCartes',
  jouer: async (a, j) => {
    const cartes = (process.env.CARTES || Object.keys(CARTES).join(',')).split(',').filter(Boolean);
    const filtre = process.env.TUILES ? new RegExp(process.env.TUILES) : null;
    for (const carte of cartes) {
      const tuiles = await a.ev((c) => { naviguerVers('cv'); ouvrirCarteAccueil(c); return new Promise((r) => setTimeout(() => r([].slice.call(document.querySelectorAll('#fenetreERIP.visible button[id^=btnCarteAccueil], .fenetre-erip-overlay.visible button[id^=btnCarteAccueil]')).map((b) => b.id).filter((i) => i !== 'btnCarteAccueil' && i !== 'btnRetourCarteAccueil')), 900)); }, carte);
      j.info(carte + ' : tuiles ' + tuiles.join(', '));
      for (const id of tuiles) {
        if (filtre && !filtre.test(id)) { continue; }
        const nom = carte + ' > ' + id.replace('btnCarteAccueil', '');
        await a.ev((x) => { naviguerVers('cv'); ouvrirCarteAccueil(x); }, carte);
        await a.attendre(900);
        await a.ev(() => { window.open = function () { return {}; }; });
        const c = await a.clic('#' + id);
        await a.attendre(1500);
        if (c !== 'ok') { j.ko(nom + ' : clic sur la tuile ' + c); continue; }
        const e0 = await a.verifier(null);
        const fen = e0.fenetre;
        const boutons = await a.ev(() => [].slice.call(document.querySelectorAll('#app button, #app summary, #fenetreERIP.visible button')).filter((x) => window.__P.visible(x)).map((x) => (x.id ? '#' + x.id + ' ' : '') + window.__P.lib(x).slice(0, 34)).filter(Boolean).slice(0, 26));
        j.info(nom + ' : arrivée ' + e0.hash + ' « ' + e0.h1 + ' » ' + (fen ? '[FENÊTRE] ' : '') + '[bas : ' + e0.avant + (e0.raison ? ' | ' + e0.raison : '') + '] [barre : ' + (e0.barre || 'aucune') + '] [retour ' + e0.retour + ', accueil ' + e0.accueil + ']');
        j.info(nom + ' : boutons ' + boutons.join(' ; '));
        const texte = await a.ev(() => { const f = document.querySelector('#fenetreERIP.visible'); return ((f || document.getElementById('app')).innerText || '').replace(/\s+/g, ' ').slice(0, 420); });
        j.info(nom + ' : texte ' + texte);
        // Avance avec le bas tant qu'il est actif.
        const chaine = [e0.hash + ' « ' + e0.h1 + ' »'];
        for (let k = 0; k < 3; k++) {
          const s = await a.suiv();
          if (!s.startsWith('ok')) { j.info(nom + ' : avance arrêtée (' + s + ')'); break; }
          const e = await a.verifier(null);
          chaine.push(e.hash + ' « ' + e.h1 + ' » [bas : ' + e.avant + (e.raison ? ' | ' + e.raison : '') + ']');
          if (process.env.DETAIL) {
            const det = await a.ev(() => ({ b: [].slice.call(document.querySelectorAll('#app button, #app summary, #app a.btn')).filter((x) => window.__P.visible(x)).map((x) => (x.id ? '#' + x.id + ' ' : '') + window.__P.lib(x).slice(0, 40)).filter(Boolean).join(' ; '), t: document.getElementById('app').innerText.replace(/\s+/g, ' ').slice(0, 700) }));
            j.info(nom + ' : détail écran ' + (k + 2) + ' boutons : ' + det.b);
            j.info(nom + ' : détail écran ' + (k + 2) + ' texte : ' + det.t);
          }
        }
        j.info(nom + ' : écrans ' + chaine.join(' > '));
        // Chaîne de « Retour ».
        const retours = [];
        for (let k = 0; k < 8; k++) {
          const r = await a.retour();
          const e = await a.ecran();
          retours.push(r === 'ok' ? (e.hash + ' « ' + e.h1 + ' »' + (e.fenetre ? ' [FENÊTRE]' : '')) : r);
          if (r !== 'ok' || /^#(cv|)$/.test(e.hash)) { break; }
        }
        j.info(nom + ' : chaîne des Retour ' + retours.join(' < '));
        const fin = await a.ecran();
        if (!/^#(cv|)$/.test(fin.hash)) { j.ko(nom + ' : la chaîne des Retour ne ramène pas à l’accueil (fin sur ' + fin.hash + ' « ' + fin.h1 + ' »)'); }
      }
    }
  }
};
