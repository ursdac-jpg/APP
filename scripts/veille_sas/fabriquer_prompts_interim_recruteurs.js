// Fabrique les messages du cloud pour ce que le script par secteur ne couvre pas : les agences d'intérim (outils/sas/interim.sas.txt)
// et les pages de recrutement non encore vérifiées (outils/sas/recruteurs*.sas.txt). Réutilise les textes et le testeur de fabriquer_prompts_secteur.js.
// Usage : node scripts/veille_sas/fabriquer_prompts_interim_recruteurs.js <sortie.md> [taille-de-lot]
// Teste d'abord les adresses (réponse, nom présent). Ne modifie aucun fichier du sas.
const fs = require('fs'), path = require('path');
const { lire, tester, ENTETE, REGLES, FIN, PRESENCE, DEBLOCAGE } = require('./fabriquer_prompts_secteur.js');
const R = path.join(__dirname, '..', '..');
const sortie = process.argv[2] || 'docs/PROMPTS_CLOUD_INTERIM_ET_RECRUTEURS.md', MAX = +process.argv[3] || 18;

const MODELE_I = ENTETE + 'Voici des AGENCES D\'INTÉRIM proposées pour la Dordogne et la Haute-Vienne. Pour chaque agence, (1) dis si elle existe et est ouverte à la commune indiquée, d\'après la page officielle de l\'agence ou celle de son réseau (réponse : « ouverte », « fermée ou introuvable », « déplacée vers [commune] »), (2) donne l\'adresse de la page officielle de cette agence, (3) recopie EXACTEMENT l\'adresse postale et le numéro de téléphone affichés sur cette page, avec la phrase qui les entoure (« pas de numéro vu » ou « pas d\'adresse vue » sinon : ne les cherche jamais ailleurs, ne les devine jamais).\n\n' + REGLES + PRESENCE + '\n\nPour un réseau, la présence se lit sur la page « trouver une agence » du réseau : liste, pour chaque département, les communes où le réseau a une agence.\n\nFormat de réponse : un tableau Markdown : Agence (réseau, commune) | État (ouverte / fermée ou introuvable / déplacée) | Page officielle de l\'agence | Adresse affichée (copiée exactement) | Téléphone affiché (copié exactement) | Phrase lue autour | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».' + DEBLOCAGE + FIN;

const MODELE_P = ENTETE + 'Voici des PAGES DE RECRUTEMENT proposées pour des employeurs de Dordogne et de Haute-Vienne. Pour chaque ligne, (1) ouvre la page proposée et dis si c\'est bien la page de recrutement de l\'employeur lui-même ou d\'un portail officiel de son organisme (réponse : « oui », « non : [autre adresse officielle] », « page introuvable »), (2) dis si elle affiche des offres en ce moment (« offres visibles », « aucune offre visible », « inscription ou compte demandé avant d\'afficher »), (3) donne la date de l\'offre la plus récente si elle est visible, (4) établis la présence de l\'employeur en Dordogne 24 et en Haute-Vienne 87. Ne recopie jamais le contenu des offres.\n\n' + REGLES + PRESENCE + '\n\nFormat de réponse : un tableau Markdown : Employeur | Page de recrutement officielle (oui / non + autre adresse / introuvable) | Offres (visibles / aucune / compte demandé) | Date de l\'offre la plus récente | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».' + DEBLOCAGE + FIN;

const vide = c => !c[c.length - 1] || !/\d/.test(c[c.length - 1]);
// interim : id | reseau | nom | commune | cp | adresse | telephone | page | origine | remarque | date
const I = lire('outils/sas/interim.sas.txt').filter(vide).map(p => ({ cle: p[1], nom: p[2], commune: p[3] + ' (' + p[4] + ')', fiche: p[5] ? 'adresse de la fiche : ' + p[5] : '', tel: p[6], site: p[7] }));
// recruteurs : id | famille | nom | secteur | territoire | page | offres vues | date de la plus recente | compte demande | source | date
const P = [['Dordogne', 'outils/sas/recruteurs.sas.txt'], ['Haute-Vienne', 'outils/sas/recruteurs87.sas.txt'], ['Employeurs publics', 'outils/sas/recruteurs_publics.sas.txt']]
  .flatMap(([zone, f]) => lire(f).filter(vide).map(p => ({ cle: zone, secteur: p[3], nom: p[2], commune: p[4], famille: p[1], site: p[5] })));

(async () => {
  const taches = I.concat(P).filter(x => /^https:\/\//.test(x.site));
  let i = 0; await Promise.all(Array.from({ length: 14 }, async () => { while (i < taches.length) { const x = taches[i++]; x.etat = await tester(x.site, x.nom.replace(/Intérim|Interim/i, '').trim() || x.nom); } }));
  const ligneI = x => x.cle + ' : ' + x.nom + ' à ' + x.commune + (x.fiche ? ' | ' + x.fiche : '') + (x.tel ? ' | téléphone de la fiche : ' + x.tel : '') + (x.site ? ' | page proposée : ' + x.site + ' [' + (x.etat || 'non testé') + ']' : ' | pas de page proposée');
  const ligneP = x => x.nom + ' (' + x.commune + ', secteur ' + x.secteur + ', ' + x.famille + ')' + (x.site ? ' | page proposée : ' + x.site + ' [' + (x.etat || 'non testé') + ']' : ' | pas de page proposée');
  const lots = []; let n = 0;
  const decouper = (titre, liste, modele, ligne, tri) => {
    liste.sort((a, b) => String(a.secteur || '').localeCompare(String(b.secteur || ''))); const g = {}; liste.forEach(x => { (g[tri(x)] = g[tri(x)] || []).push(x); });
    let reste = [];
    Object.keys(g).sort().forEach(cle => {
      const l = g[cle];
      if (l.length < 6 && titre === 'Agences d\'intérim') { reste = reste.concat(l); return; }
      const nb = Math.ceil(l.length / MAX), t = Math.ceil(l.length / nb);
      for (let k = 0; k < nb; k++) { n++; lots.push({ n, titre, cle, k: k + 1, nb, modele, ligne, lignes: l.slice(k * t, (k + 1) * t) }); }
    });
    if (reste.length) { const nb = Math.ceil(reste.length / MAX), t = Math.ceil(reste.length / nb); for (let k = 0; k < nb; k++) { n++; lots.push({ n, titre, cle: 'autres réseaux', k: k + 1, nb, modele, ligne, lignes: reste.slice(k * t, (k + 1) * t) }); } }
  };
  decouper('Agences d\'intérim', I, MODELE_I, ligneI, x => x.cle);
  decouper('Pages de recrutement', P, MODELE_P, ligneP, x => x.cle);
  let md = '# Messages du cloud : agences d\'intérim et pages de recrutement (' + new Date().toISOString().slice(0, 10) + ')\n\nComplète `docs/PROMPTS_CLOUD_PAR_SECTEUR_2026-11-01.md` (employeurs et structures). Un message = un lot à coller dans une session cloud ; le résultat revient ensuite au Claude local, qui teste chaque adresse avant de l\'inscrire. Fabriqué par `scripts/veille_sas/fabriquer_prompts_interim_recruteurs.js` (lots de ' + MAX + ' au plus). Seules les lignes sans date de vérification sont reprises.\n\n## Sommaire\n\n| Lot | Type | Réseau ou secteur | Lignes |\n|---|---|---|---|\n' + lots.map(l => '| I' + l.n + ' | ' + l.titre + ' | ' + l.cle + (l.nb > 1 ? ' (' + l.k + '/' + l.nb + ')' : '') + ' | ' + l.lignes.length + ' |').join('\n') + '\n';
  lots.forEach(l => { md += '\n---\n\n# Lot I' + l.n + ' : ' + l.titre.toLowerCase() + ', ' + l.cle + (l.nb > 1 ? ' (' + l.k + '/' + l.nb + ')' : '') + '\n\n' + l.modele + '\n\nListe du lot :\n' + l.lignes.map((x, j) => (j + 1) + '. ' + l.ligne(x)).join('\n') + '\n'; });
  fs.writeFileSync(path.join(R, sortie), md);
  console.log(I.length + ' agences et ' + P.length + ' pages de recrutement, ' + lots.length + ' lots -> ' + sortie);
})();
