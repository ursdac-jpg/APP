// Rapport de l'inventaire « bouton x modele » : node scripts/word/matrice_rapport.js <matrice.json> <sortie.md> [<donnees.js>]
// Entree : window.__mat produit par scripts/word/matrice_options.js (poste au recepteur). Sortie : tableau Markdown + (optionnel) fichier de donnees
// pour griser les reglages sans effet (modules/cv-pdf-html/cvPdfOptionsParModele.js).
const fs = require('fs');
const [, , entree, sortie, donnees] = process.argv;
const mat = JSON.parse(fs.readFileSync(entree, 'utf8').replace(/^﻿/, ''));
const modeles = Object.keys(mat);
const controles = [];
modeles.forEach((m) => Object.keys(mat[m]).forEach((c) => { if (controles.indexOf(c) === -1) { controles.push(c); } }));
const ordreCartes = ['cOrg', 'cEntete', 'cComp', 'cExp', 'cForm', 'cExpPerso', 'cSupp', 'cTexte', 'cAvance', 'cFormat', 'mepRegSupp'];
controles.sort((a, b) => (ordreCartes.indexOf(a.split('|')[0]) - ordreCartes.indexOf(b.split('|')[0])) || 0);
const simple = (v) => String(v || 'absent').replace(/\(reconstruction\)/, '').replace(/\+derive/, '');
const symbole = (v) => { v = simple(v); return v === 'effet' ? 'oui' : v === 'sans-effet' ? '**non**' : v === 'grise' ? 'grisé' : v === 'deja-actif' ? '(actif)' : v === 'absent' ? '·' : v; };

// classement par REGLAGE ENTIER (famille = carte + attribut, toutes valeurs confondues) : cliquer sur l'option deja active ne change jamais rien,
// donc juger une valeur isolee est faux. Un reglage est grise sur un modele seulement si AUCUNE de ses valeurs n'y a d'effet.
const famille = (c) => { const p = c.split('|'); return p[0] + '|' + p[1].split('=')[0]; };
const familles = {};
controles.forEach((c) => { (familles[famille(c)] = familles[famille(c)] || []).push(c); });
const classes = { mortPartout: [], parModele: [], toujours: [], inconnu: [] };
const sansEffetParModele = {};
// Reglages jamais grises par le fichier de donnees : doublons retires (copie du style des missions personnelles).
const JAMAIS_GRISES = ['mepRegSupp|missionsperso'];
Object.keys(familles).forEach((f) => {
  if (JAMAIS_GRISES.indexOf(f) !== -1) { return; }
  const membres = familles[f];
  const aEffet = (m) => membres.some((c) => simple(mat[m][c]) === 'effet');
  const aSans = (m) => membres.some((c) => simple(mat[m][c]) === 'sans-effet');
  const eff = modeles.filter(aEffet).length, non = modeles.filter((m) => !aEffet(m) && aSans(m)).length;
  if (eff === 0 && non > 0) { classes.mortPartout.push(f); }
  else if (eff > 0 && non > 0) {
    classes.parModele.push(f);
    modeles.forEach((m) => { if (!aEffet(m) && aSans(m)) { (sansEffetParModele[m] = sansEffetParModele[m] || []).push(...membres); } });
  } else if (eff > 0) { classes.toujours.push(f); } else { classes.inconnu.push(f); }
});

let md = '# Inventaire « bouton x modèle » du panneau « La mise en page » - 2026-09-29\n\n';
md += 'Généré par `scripts/word/matrice_options.js` puis `scripts/word/matrice_rapport.js`. Pour chaque modèle et chaque bouton ou case, le banc clique, attend que l\'aperçu soit stable, ' +
  'mesure si le CV a **réellement changé** (empreinte du HTML), puis remet l\'état. « oui » = le CV change ; **non** = cliquable mais RIEN ne change ; « (actif) » = déjà sélectionné (non testable ici, testé sur un autre modèle).\n\n';
md += '## Synthèse\n\n';
md += `- **${classes.toujours.length}** réglages (entiers) agissent partout où ils sont testables.\n`;
md += `- **${classes.parModele.length}** réglages n'agissent que sur certains modèles : ils doivent être **grisés** sur les autres (liste par modèle plus bas).\n`;
md += `- **${classes.mortPartout.length}** réglages n'ont AUCUN effet visible sur aucun des ${modeles.length} modèles : à corriger (le réglage n'est pas relié au rendu) ou à expliquer (jeu de données, effet invisible à l'écran).\n\n`;
md += '### Réglages sans aucun effet visible sur aucun modèle\n\n' + (classes.mortPartout.map((c) => '- `' + c + '`').join('\n') || '- (aucun)') + '\n\n';
md += '### Réglages qui n\'agissent que sur certains modèles\n\n' + (classes.parModele.map((c) => {
  const ok = modeles.filter((m) => familles[c].some((x) => simple(mat[m][x]) === 'effet')), non = modeles.filter((m) => !familles[c].some((x) => simple(mat[m][x]) === 'effet') && familles[c].some((x) => simple(mat[m][x]) === 'sans-effet'));
  return '- `' + c + '` : agit sur ' + ok.length + ' modèle(s), **sans effet** sur ' + non.length + ' (' + non.join(', ') + ')';
}).join('\n') || '- (aucun)') + '\n\n';
md += '## Détail : modèles en colonnes\n\n';
const court = (m) => m.replace('creatif:', 'C:').replace('sobre:mq-', 'S:').replace('standard:standard', 'Std');
md += '| Réglage | ' + modeles.map(court).join(' | ') + ' |\n|---|' + modeles.map(() => '---').join('|') + '|\n';
controles.forEach((c) => { md += '| `' + c + '` | ' + modeles.map((m) => symbole(mat[m][c])).join(' | ') + ' |\n'; });
fs.writeFileSync(sortie, md, 'utf8');

if (donnees) {
  let js = '// GENERE par scripts/word/matrice_rapport.js a partir de l\'inventaire du ' + new Date().toISOString().slice(0, 10) + ' (ne pas editer a la main : relancer le banc).\n' +
    '// Reglages cliquables mais SANS EFFET sur un modele, alors qu\'ils agissent sur d\'autres : ils sont grises sur ce modele (voir _mepGriserSansEffetModele, cvPdfCartesMaquette.js).\n' +
    '// Cle du modele : "standard", "sobre:<variante>", "creatif:<id>". Valeur : liste de "carte|reglage".\n' +
    'var _MEP_SANS_EFFET_PAR_MODELE = ' + JSON.stringify(Object.fromEntries(Object.entries(sansEffetParModele).map(([m, l]) => [m === 'standard:standard' ? 'standard' : m, l])), null, 1) + ';\n';
  fs.writeFileSync(donnees, js, 'utf8');
}
console.log(JSON.stringify({ modeles: modeles.length, controles: controles.length, toujours: classes.toujours.length, parModele: classes.parModele.length, mortPartout: classes.mortPartout.length }));
