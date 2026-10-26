/* ============================================================
   Detecteur des chiffres, dates, montants et durees d'un texte du Lexique
   (chantier « des chiffres a jour dans le Lexique », case M1, 20 octobre 2026).

   UNE SEULE source de verite : ce fichier est lu par
   - l'outil de veille (outils/veilleMots.js : avertissement en direct, filtres de la liste),
   - scripts/checkLexique.js (une fiche ecrite a la main est reconnue pareil),
   - les essais automatiques (tests/).
   Aucune copie ailleurs. Il ne s'execute jamais dans le navigateur de l'application.

   reperes(texte) rend [{ cat, texte, debut, fin }] trie par position.
   Categories : date (date ou annee), montant, duree, pourcent, ref (loi, decret, article...), seuil (age ou seuil).
   Les chiffres qui font partie d'un nom (SIAO 115, bulletin 2, niveaux A1 a C2, permis B1...) ne sont jamais des reperes.
   ============================================================ */
'use strict';

const CATEGORIES = {
  date: 'Date ou année',
  montant: 'Montant',
  duree: 'Durée',
  pourcent: 'Pourcentage',
  ref: 'Référence de texte',
  seuil: 'Âge ou seuil'
};

const NB = '(?:\\d[\\d\\u00a0\\u202f ]*\\d|\\d)(?:[,.]\\d+)?';
const MOTS_NB = '(?:un|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|onze|douze|quinze|vingt|trente|quarante|soixante|cent)';
const MOIS = '(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)';

// L'ordre compte : une regle plus precise passe avant une regle plus large, et un texte deja reconnu n'est jamais reconnu deux fois.
const REGLES = [
  ['ref', '\\b(?:loi|décret|ordonnance|arrêté|article|circulaire)s?\\s+(?:n°\\s*)?\\d[\\d\\-./]*(?:\\s+du\\s+\\d{1,2}(?:er)?\\s+[a-zéû]+\\s+\\d{4})?', 'gi'],
  ['ref', '\\b[LRD]\\.?\\s?\\d{3,4}(?:-\\d+)+\\b', 'g'],
  ['date', '\\b\\d{1,2}(?:er)?\\s+' + MOIS + '\\s+\\d{4}\\b', 'gi'],
  ['date', '\\b' + MOIS + '\\s+\\d{4}\\b', 'gi'],
  ['montant', '\\b' + NB + '\\s*(?:€|euros?)(?![a-zé])', 'gi'],
  ['pourcent', '\\b' + NB + '\\s*(?:%|pour cent)', 'gi'],
  ['seuil', '\\b(?:de\\s+)?' + NB + '\\s+à\\s+' + NB + '\\s+ans\\b', 'gi'],
  ['seuil', '\\b' + NB + '\\s*[-\u2013]\\s*' + NB + '\\s+ans\\b', 'gi'],
  ['seuil', '\\b(?:plus|moins)\\s+de\\s+' + NB + '\\s*(?:km|ans|heures?|%)', 'gi'],
  ['seuil', '\\b' + NB + '\\s*km\\b', 'gi'],
  ['seuil', '\\b' + NB + '\\s+(?:salariés?|points|habitants)\\b', 'gi'],
  ['seuil', '\\b\\d{1,2}\\s?h(?:\\d{2})?\\b(?!\\s?/)', 'gi'],
  ['duree', '\\b(?:' + NB + '|' + MOTS_NB + ')\\s+(?:(?:premiers?|derniers?|dernières?|prochains?|prochaines?)\\s+)?(?:ans?|années?|mois|jours?|semaines?|heures?|trimestres?)\\b', 'gi'],
  ['date', '\\b(?:19|20)\\d{2}\\b', 'g']
];

// Les noms qui portent un chiffre : jamais un repere (sauf s'ils contiennent une annee a quatre chiffres).
const EXCEPTIONS = [
  /\b(?:A1|A2|B1|B2|C1|C2|BE|115|116|114|3949|3977|3919|1er)\b/,
  /\bbulletin\s+\d\b/i,
  /\bCV\s?\d\b/,
  /^un\s+(?:jour|trimestre)$/i   // des tournures (« un jour relancé », « d'un trimestre à l'autre ») : jamais une durée a tenir a jour ; « 1 jour » ou « 3 trimestres » restent reperes
];

function reperes(texte) {
  const t = String(texte || ''), sortie = [], pris = [];
  REGLES.forEach(function (r) {
    const re = new RegExp(r[1], r[2]);
    let m;
    while ((m = re.exec(t))) {
      const d = m.index, f = d + m[0].length;
      if (m[0].length === 0) { re.lastIndex++; continue; }
      if (pris.some(function (p) { return d < p[1] && f > p[0]; })) { continue; }
      if (EXCEPTIONS.some(function (x) { return x.test(m[0]); }) && !/\d{4}/.test(m[0])) { continue; }
      pris.push([d, f]);
      sortie.push({ cat: r[0], texte: m[0], debut: d, fin: f });
    }
  });
  return sortie.sort(function (a, b) { return a.debut - b.debut; });
}

// Pour les messages : un petit extrait autour du premier repere (comme l'ancien repérage), ou '' s'il n'y en a pas.
function extrait(texte) {
  const t = String(texte || ''), r = reperes(t)[0];
  return r ? t.slice(Math.max(0, r.debut - 25), Math.min(t.length, r.fin + 15)).trim() : '';
}

function categoriesDe(texte) {
  const vus = {};
  reperes(texte).forEach(function (r) { vus[r.cat] = true; });
  return Object.keys(CATEGORIES).filter(function (k) { return vus[k]; });
}

module.exports = { CATEGORIES: CATEGORIES, reperes: reperes, extrait: extrait, categoriesDe: categoriesDe };
