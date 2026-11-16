/* ============================================================
   Niveau d'accès d'un métier du ROME (consigne 263, chantier « pertinence des suggestions », 13/11/2026).
   Échelle unique = niveaux de qualification, la même que celle des formations saisies dans l'application
   (NIVEAUX_DIPLOME_SIMPLES de js/app.js) : 3 CAP/BEP, 4 Bac, 5 Bac+2, 6 Bac+3, 7 Bac+5, 8 doctorat.
   Un titre professionnel de niveau N compte comme le niveau N (niveau 5 = Bac+2, niveau 4 = Bac).
   2 = accessible sans diplôme. null = le ROME ne dit rien : jamais de niveau inventé, le métier reste neutre.
   Plusieurs niveaux cités : on garde le plus bas (accessible dès ce niveau).
   Priorité : 1) le texte « accès au métier » du ROME ; 2) « sans diplôme » écrit dans ce texte ; 3) la table de titres ci-dessous.
   La table est à relire par Denis : elle ne sert que quand le texte du ROME ne donne aucun niveau (diplômes d'État, concours).
   ============================================================ */

// Titres de métiers (libellé du code ROME et appellations) dont le niveau est connu sans que le texte du ROME le dise.
// Ordre : le premier motif qui correspond l'emporte.
// Sources : fiches « niveau de qualification » de France Compétences (RNCP) et Certif Info, relevées le 13/11/2026.
// Médecins, chirurgiens, pharmaciens, dentistes, vétérinaires : le RNCP indique le niveau 7 (Master), mais les études durent
// de 9 à 11 ans après le Bac ; on garde 8 (études longues) pour qu'ils ne passent jamais devant quelqu'un sans diplôme.
// Non vérifiés en ligne (usage courant, à relire) : architecte, avocat, juriste (7). Les pilotes militaires ne figurent pas
// dans la table : on y entre par concours, pas par un diplôme, le métier reste neutre.
const NIVEAUX_PAR_TITRE = [
  [8, /médecin|chirurgien|pharmacien|dentiste|vétérinaire|psychiatre|anesthésiste|pédiatre|(onco|cardio|dermato|neuro|pneumo|gastro-entéro|endocrino|rhumato|néphro|uro|hémato|radio|ophtalmo|stomato|gynéco)logue|gériatre|oto-rhino|chercheur/i],
  [7, /ingénieur|juriste|avocat|architecte|psychologue|data scientist|infirmier en pratique avancée|infirmier coordonnateur|gérontologue|directeur d.établissement|masseur-kinésithérapeute|kinésithérapeute|sage-femme|orthophoniste/i],
  [6, /infirmier|éducateur spécialisé|éducateur de jeunes enfants|assistant de service social|ergothérapeute|pilote de ligne/i],
  [4, /aide-soignant|auxiliaire de puériculture/i],
  [3, /accompagnant éducatif et social|assistant de vie|auxiliaire de vie|ambulancier/i]
];

function niveauDepuisTexte(acces) {
  const l = String(acces || '').toLowerCase();
  if (!l) { return null; }
  const v = [];
  for (const x of l.matchAll(/bac\s*\+\s*(\d)/g)) { const k = +x[1]; v.push(k >= 8 ? 8 : k >= 5 ? 7 : k >= 3 ? 6 : k >= 2 ? 5 : 4); }
  for (const x of l.matchAll(/niveau\s*(\d)\b/g)) { const k = +x[1]; if (k >= 3 && k <= 8) { v.push(k); } }
  if (/doctorat|\bdocteur\b/.test(l)) { v.push(8); }
  if (/\bmaster\b|ingénieur|école de commerce/.test(l)) { v.push(7); }
  if (/licence|bachelor/.test(l)) { v.push(6); }
  if (/\bbts\b|\bdut\b|\bdeust\b/.test(l)) { v.push(5); }
  if (/bac pro|bac professionnel|baccalauréat|\bbac\b(?!\s*\+)/.test(l)) { v.push(4); }
  if (/\bcap\b|\bbep\b/.test(l)) { v.push(3); }
  // Le plus bas niveau cité : « du Bac pro à Bac+3 » veut dire accessible dès le Bac. Ce qui compte pour la personne, c'est d'où l'on peut partir.
  return v.length ? Math.min.apply(null, v) : null;
}

// code = { libelle, appellations: [{ libelle }], acces }
function niveauAcces(code) {
  const texte = niveauDepuisTexte(code.acces);
  if (texte !== null) { return texte; }
  if (/sans diplôme|aucun diplôme|sans qualification/i.test(code.acces || '')) { return 2; }
  const titres = [code.libelle].concat((code.appellations || []).slice(0, 6).map((a) => a.libelle)).join(' | ');
  for (let i = 0; i < NIVEAUX_PAR_TITRE.length; i++) { if (NIVEAUX_PAR_TITRE[i][1].test(titres)) { return NIVEAUX_PAR_TITRE[i][0]; } }
  return null;
}

module.exports = { NIVEAUX_PAR_TITRE, niveauDepuisTexte, niveauAcces };
