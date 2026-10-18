/* Genere docs/PROMPT_VERIFICATION_AUTRE_ASSISTANT_SAS_MON_TERRITOIRE.md a partir du sas reel (outils/sas/lieux.sas.txt).
   Usage : node scripts/genererPromptVerificationSas.js
   A relancer apres chaque nouvel import dans le sas : le fichier est ENTIEREMENT regenere, jamais modifie a la main.
   Une fiche y figure si elle a un manque ou un doute (pas de telephone, pas de site, telephone ou site partage, source non donnee). */
'use strict';
const fs = require('fs');
const path = require('path');
const racine = path.resolve(__dirname, '..');
const { creerDepot } = require(path.join(racine, 'outils', 'veilleDepot.js'));
const { genererPartieEmployeurs } = require('./genererPartieEmployeursPrompt.js');

const TAILLE_LOT = 15;
const SORTIE = path.join(racine, 'docs', 'PROMPT_VERIFICATION_AUTRE_ASSISTANT_SAS_MON_TERRITOIRE.md');
const NOMS_RAYONS = {
  'logement-hebergement': 'Logement et hébergement', 'acces-au-droit': 'Accès au droit', 'france-services': 'France Services',
  'creation-activite': 'Création d\'activité', 'petite-enfance': 'Petite enfance et garde', 'collectivite-etat': 'Collectivités et État',
  'handicap': 'Handicap', 'formation-orientation': 'Formation et orientation', 'justice-insertion': 'Justice et insertion',
  'francais-langue': 'Français et langue', 'mission-locale': 'Missions locales', 'mobilite-solidaire': 'Mobilité solidaire',
  'appui-aux-employeurs': 'Appui aux employeurs', 'accueil-etrangers': 'Accueil des personnes étrangères', 'budget-endettement': 'Budget et endettement',
  'siae': 'Insertion par l\'activité économique', 'formation-jeunes': 'Jeunes et formation', 'caf': 'CAF', 'cap-emploi': 'Cap emploi',
  'soutien-aux-familles': 'Soutien aux familles', 'caisse-assurance-maladie-retraite': 'Retraite et assurance maladie', 'sante-soins-addictions': 'Santé, soins et addictions'
};

function regrouper(rows, cle) {
  const m = {};
  rows.forEach(function (r) { if (r[cle]) { (m[r[cle]] = m[r[cle]] || []).push(r); } });
  return m;
}

function genererTexte(rows, aujourdhui, rowsEmp) {
  const tels = regrouper(rows, 'telephone'), sites = regrouper(rows, 'site');
  const aVerifier = [];
  rows.forEach(function (r) {
    const motifs = [];
    if (!r.telephone) { motifs.push('téléphone absent'); }
    else if (tels[r.telephone].length > 1) { motifs.push('même téléphone que ' + (tels[r.telephone].length - 1) + ' autre(s) fiche(s)'); }
    if (!r.site) { motifs.push('site absent'); }
    else if (sites[r.site].length > 1) { motifs.push('même adresse de site que ' + (sites[r.site].length - 1) + ' autre(s) fiche(s)'); }
    if (/source non donn/i.test(r.source || '')) { motifs.push('aucune source donnée'); }
    if (motifs.length) { aVerifier.push({ r: r, motifs: motifs }); }
  });
  const parRayon = {};
  aVerifier.forEach(function (x) { (parRayon[x.r.type] = parRayon[x.r.type] || []).push(x); });
  const rayons = Object.keys(parRayon).sort();

  let h = '# Prompt de vérification pour un autre assistant (Qui fait quoi, le sas)\n\n';
  h += '> **Fichier généré le ' + aujourdhui + ' par `node scripts/genererPromptVerificationSas.js`. Ne pas le modifier à la main : il est entièrement régénéré à partir du sas.**\n';
  h += '> Le sas contient **' + rows.length + ' fiches** ; **' + aVerifier.length + '** ont un manque ou un doute et figurent ci-dessous, en **' + rayons.reduce(function (n, k) { return n + Math.ceil(parRayon[k].length / TAILLE_LOT); }, 0) + ' lots** (un lot = un message à envoyer).\n';
  h += '> Après chaque nouvel import de rayon dans le sas, demander à Claude de régénérer ce fichier.\n\n';
  h += '## Comment s\'en servir\n\n';
  h += '1. Ouvrir une conversation neuve chez l\'autre assistant (avec recherche web, par exemple Perplexity) et lui envoyer d\'abord **le bloc « Consigne de départ »** ci-dessous, une seule fois.\n';
  h += '2. Envoyer ensuite les lots **un par un**, dans l\'ordre, en attendant la réponse avant le suivant.\n';
  h += '3. Coller chaque réponse à Claude, qui la range dans le sas (rien ne devient public : tu vérifies ensuite chaque fiche avec « C\'est bon »).\n';
  h += '4. Si l\'assistant n\'a pas trouvé, c\'est normal : il écrit « introuvable », ce qui vaut mieux qu\'une invention.\n\n';
  h += '## Consigne de départ (à envoyer une seule fois)\n\n';
  h += '```\n';
  h += 'Tu vas m\'aider à VÉRIFIER des coordonnées de structures de Dordogne (24) et de Haute-Vienne (87), pour un annuaire destiné à des personnes en difficulté. L\'exactitude compte plus que la quantité.\n\n';
  h += 'RÈGLES STRICTES\n';
  h += '1. N\'invente RIEN. Si tu ne trouves pas une information sur une page officielle ou sur le site de la structure elle-même, écris « introuvable ». Une case « introuvable » est une bonne réponse.\n';
  h += '2. Sources acceptées : site de la structure, sites officiels de l\'État et des collectivités (gouv.fr, service-public.fr et son annuaire, sites des départements, de la région, de l\'Éducation nationale, de France Travail, de la CAF, de l\'Assurance maladie, etc.). Pas de forums, pas d\'annuaires commerciaux, pas de réseaux sociaux.\n';
  h += '3. Pour chaque fiche, donne l\'adresse EXACTE de la page où tu as lu le téléphone et le site (colonne « page »). Sans page, pas de réponse.\n';
  h += '4. Un téléphone doit être au format « 05 53 00 00 00 » (dix chiffres, par groupes de deux). Les numéros courts (3949...) restent tels quels.\n';
  h += '5. Quand plusieurs structures partagent un même numéro ou une même adresse de site dans ma liste, vérifie si chacune a bien SON PROPRE numéro ou SA PROPRE page. Si le numéro est réellement commun (standard unique), réponds « commun » et la page qui le prouve.\n';
  h += '6. Si la structure n\'existe plus, a fermé, a changé de nom ou de commune, dis-le dans la colonne « remarque ».\n';
  h += '7. Écris en français correct, avec les accents. Pas de tiret long ni demi-cadratin (utilise un tiret simple), pas de mise en forme décorative, pas de lien en format Markdown, pas de balises de type « entity[...] » ni « utm_source ».\n';
  h += '8. Ne reformule pas les noms, ne change pas les identifiants.\n\n';
  h += 'FORMAT DE RÉPONSE (obligatoire, un seul bloc de code, une ligne par fiche, colonnes séparées par « | », aucune autre ligne dans le bloc) :\n';
  h += 'id | téléphone | site | page | état | remarque\n\n';
  h += 'Pour chaque fiche :\n';
  h += '- « téléphone » : le numéro vérifié, ou « introuvable », ou « commun » ;\n';
  h += '- « site » : l\'adresse de la page la plus précise de la structure (pas la page d\'accueil d\'un réseau national quand une page locale existe), ou « introuvable » ;\n';
  h += '- « page » : l\'adresse où tu as lu l\'information ;\n';
  h += '- « état » : « confirmé » (ce que j\'ai donné est juste), « corrigé » (j\'avais faux ou incomplet), « ajouté » (la case était vide et tu l\'as trouvée), « introuvable » ou « fermé » ;\n';
  h += '- « remarque » : une phrase courte, ou vide.\n\n';
  h += 'Après le bloc de code, ajoute une courte liste « Ce que je n\'ai pas pu vérifier » si besoin. Réponds seulement « Prêt » à ce message : je t\'enverrai ensuite les lots un par un.\n';
  h += '```\n\n';

  let n = 0;
  rayons.forEach(function (rayon) {
    const liste = parRayon[rayon];
    const lots = Math.ceil(liste.length / TAILLE_LOT);
    for (let i = 0; i < lots; i++) {
      n++;
      const part = liste.slice(i * TAILLE_LOT, (i + 1) * TAILLE_LOT);
      h += '## Lot ' + n + ' : ' + (NOMS_RAYONS[rayon] || rayon) + (lots > 1 ? ' (' + (i + 1) + ' sur ' + lots + ')' : '') + ', ' + part.length + ' fiche' + (part.length > 1 ? 's' : '') + '\n\n';
      h += '```\n';
      h += 'Lot ' + n + '. Vérifie ces ' + part.length + ' fiches (rayon : ' + (NOMS_RAYONS[rayon] || rayon) + '). Réponds au format demandé, dans un seul bloc de code.\n\n';
      part.forEach(function (x) {
        const r = x.r;
        h += r.id + ' | ' + r.nom + ' | ' + r.commune + ' (' + (r.portee === '24' ? 'Dordogne' : (r.portee === '87' ? 'Haute-Vienne' : (r.portee === 'region' ? 'régional' : 'national'))) + ')' +
          ' | téléphone donné : ' + (r.telephone || 'aucun') + ' | site donné : ' + (r.site || 'aucun') + ' | à vérifier : ' + x.motifs.join(', ') + '\n';
      });
      h += '```\n\n';
    }
  });
  if (rowsEmp && rowsEmp.length) { h += genererPartieEmployeurs(rowsEmp, n).texte; }
  return h;
}

function lireSas(fichier) {
  const d = creerDepot(racine).listerSas(fichier || 'lieux');
  if (!d.ok) { throw new Error(d.erreur || 'Sas illisible.'); }
  return d.lignes.map(function (l) { return Object.assign({ id: l.id, nom: l.nom }, l.valeurs); });
}

if (require.main === module) {
  const aujourdhui = new Date().toISOString().slice(0, 10);
  const texte = genererTexte(lireSas('lieux'), aujourdhui, lireSas('employeurs'));
  fs.writeFileSync(SORTIE, texte, 'utf8');
  console.log('Fichier écrit : ' + path.relative(racine, SORTIE) + ' (' + texte.split('\n').length + ' lignes)');
}
module.exports = { genererTexte: genererTexte };
