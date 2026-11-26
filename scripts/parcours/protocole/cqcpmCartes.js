/* Protocole : espace « Ce qui compte pour moi » (route ce-qui-compte), avec SAISIES (essai téléphone du 25/11/2026).
   Pour chacune des cartes : ouverture, puis à chaque écran remplissage de tous les champs (texte court, texte long avec adresse et mot très long, listes, cases), contrôle de l'écran,
   contrôle « clavier ouvert » (téléphone seulement), puis « Continuer » jusqu'à la fin ; sur le dernier écran « Garder cette carte ». Ensuite les vues « Ce que j'ai gardé », « Préparer mon papier »
   et le papier. Aucune réponse de l'assistant à simuler : l'espace n'en reçoit pas. Variable CARTES = identifiants de cartes séparés par des virgules (par défaut : toutes). */
const R = require('./reprendreCv.js');
module.exports = {
  nom: 'cqcpmCartes',
  jouer: async (a, j) => {
    await a.aller('ce-qui-compte'); await a.attendre(700);
    const toutes = await a.ev(() => cqcpmCartes().map((c) => c.id).filter((x, i, l) => l.indexOf(x) === i));
    const voulues = process.env.CARTES ? process.env.CARTES.split(',') : toutes;
    j.info('cartes : ' + voulues.join(', '));
    const ecranCourant = async (nom) => {
      const n = await a.remplir();
      const e = await a.verifier(null);
      await a.clavier();
      return { n, e };
    };
    for (const id of voulues) {
      await a.aller('ce-qui-compte'); await a.attendre(500);
      await a.ev((c) => { cqcpmAllerCarte(c, 0); }, id); await a.attendre(700);
      let fini = false;
      for (let k = 0; k < 14 && !fini; k++) {
        const { n, e } = await ecranCourant(id);
        j.info('carte ' + id + ' écran ' + (k + 1) + ' : ' + e.h1 + ' (' + n + ' champ(s) rempli(s)), bas « ' + e.avant + ' »');
        const s = await a.suiv();
        if (!s.startsWith('ok')) { fini = true; }
      }
      const garde = await a.clic('[data-cqcpm-act="garder"]'); j.info('carte ' + id + ' : garder → ' + garde); await a.attendre(500);
      if (garde === 'ok') { await a.verifier(null); }
    }
    // Ce que j'ai gardé, puis le papier : cases à cocher, demande copiée, collage d'une réponse longue (avec adresse et mot très long), lecture du papier.
    await a.aller('ce-qui-compte'); await a.attendre(400);
    await a.ev(() => { cqcpmAllerVue('gardees'); }); await a.attendre(600);
    await a.verifier(null); await a.clavier();
    await a.ev(() => { cqcpmAllerVue('papier-preparer'); }); await a.attendre(600);
    await a.verifier(null); await a.clavier();
    j.info('préparer la demande : ' + await a.clic('[data-cqcpm-act="papier-demande"]')); await a.attendre(900);
    let e = await a.verifier(null); await a.clavier();
    j.info('passage chez l’assistant : ' + e.hash + ' « ' + e.h1 + ' » boutons : ' + await a.ev(() => [].slice.call(document.querySelectorAll('#app button')).filter((b) => window.__P.visible(b)).map((b) => (b.id ? '#' + b.id + ' ' : '') + window.__P.lib(b).slice(0, 30)).join(' ; ')));
    const LONG = 'Une phrase assez longue pour occuper plusieurs lignes sur un petit écran, avec une adresse https://exemple.fr/une/adresse/tres/longue/qui/ne/se/coupe/pas/du/tout et anticonstitutionnellementanticonstitutionnellementanticonstitutionnellement.';
    const REPONSE = '```json\n' + JSON.stringify({ papier: 1, fin: 'complet', revient: [LONG, 'Du calme, sans course.'], compte: [LONG], deuxDirections: LONG, preciser: 'Un point à préciser.', questions: ['Une question ?'] }) + '\n```';
    await R.versAssistant(a, j);   // choix de l'assistant, fenêtre d'avertissement, écran d'attente (outils communs du protocole)
    e = await a.verifier(null); await a.clavier();
    j.info('coller la réponse : ' + await a.coller(REPONSE)); await a.attendre(900);
    e = await a.verifier(null); await a.clavier();
    j.info('après le collage : ' + e.hash + ' « ' + e.h1 + ' » bas « ' + e.avant + ' »');
    j.info('voir le papier : ' + await a.suiv()); await a.attendre(700);
    e = await a.verifier(null); await a.clavier();
    j.info('papier : ' + await a.ev(() => document.getElementById('app').innerText.replace(/\s+/g, ' ').slice(0, 160)));
    // Imprimer, refaire, effacer : les boutons du papier.
    j.info('boutons du papier : ' + await a.ev(() => [].slice.call(document.querySelectorAll('#app button')).filter((b) => window.__P.visible(b)).map((b) => window.__P.lib(b).slice(0, 34)).join(' ; ')));
  }
};
