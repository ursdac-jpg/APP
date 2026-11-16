/* ============================================================
   Étape « Vos missions et compétences » : RECHERCHE DE LA FICHE D'UN POSTE (logique pure, aucun DOM).
   Testée par tests/missionsCompetencesRecherche.test.js (Node, sur le répertoire réel du ROME).
   Règles validées par Denis le 14/11/2026 (consigne 301) ; mesure et justification : docs/PLAN_DE_CODAGE_MISSIONS_COMPETENCES_2026-11-14.md, section 6.

   Entrée : l'intitulé libre d'un poste (« Soins aux chevaux d'un voisin ») et le répertoire du ROME
   (REPERTOIRE_ROME : { domaines: [...21 secteurs], metiers: [[intitulé, code ROME, indice du domaine], ...] }).
   Sortie : un niveau parmi quatre.
     A : une fiche trouvée, présélectionnée (la personne peut la changer).
     B : plusieurs fiches possibles, aucune présélectionnée (liste de 5 au plus).
     C : fiches approchantes (liste de 5 au plus, priorité au secteur des autres expériences).
     D : rien d'affirmé (aucune fiche) : saisie libre ou choix d'un secteur ; les secteurs les plus probables sont donnés.
   Principe : mieux vaut ne rien proposer qu'une fausse fiche.
   ============================================================ */

var MC_SEUIL_TROUVEE = 0.85;        // niveau A : meilleur score au moins égal à ce seuil...
var MC_ECART_MINI = 0.10;           // ... ET avance d'au moins cet écart sur la fiche suivante
var MC_SEUIL_PROCHES = 0.75;        // niveau B : meilleur score au moins égal à ce seuil (sans les conditions du niveau A)
var MC_SEUIL_APPROCHANTES = 0.5;    // niveau C : de ce seuil jusqu'au seuil B ; en dessous, niveau D
var MC_NB_MAX_LISTE = 5;
var MC_BONUS_SECTEUR = 0.03;        // sert seulement à ranger une liste (jamais à changer de niveau)

// Mots de liaison et de contexte, sans valeur pour reconnaître un métier.
var MC_MOTS_VIDES = ['de', 'du', 'des', 'd', 'l', 'la', 'le', 'les', 'un', 'une', 'aux', 'au', 'en', 'et', 'ou', 'chez', 'pour', 'par', 'sur', 'dans', 'avec', 'sans',
  'mon', 'ma', 'mes', 'son', 'sa', 'ses', 'ce', 'cet', 'cette', 'qui', 'que', 'voisin', 'voisine', 'particulier', 'particuliers', 'ami', 'amis', 'amie', 'amies', 'famille', 'soir', 'matin', 'partiel'];

// Mots qui ne disent rien du métier : un intitulé fait seulement de ces mots n'a pas de fiche (niveau D).
var MC_MOTS_VAGUES = ['interim', 'interimaire', 'mission', 'divers', 'diverse', 'job', 'saisonnier', 'saisonniere', 'stage', 'stagiaire', 'benevole', 'benevolat',
  'emploi', 'travail', 'etudiant', 'etudiante', 'autre', 'ponctuel', 'ponctuelle', 'occasionnel', 'occasionnelle'];
var MC_EXPRESSIONS_VAGUES = [/\bpetits? boulots?\b/g, /\bsans emploi\b/g];

// Formes féminines ou familières absentes du ROME (qui écrit « Valet / Femme de chambre » en une seule ligne) : forme dite -> intitulé du ROME.
var MC_SYNONYMES = [['femme de chambre', 'Valet de chambre'], ['femme de menage', 'Employé de ménage'], ['homme de menage', 'Employé de ménage'],
  ['nounou', 'Garde d\'enfant'], ['ripeur', 'Éboueur'], ['vigile', 'Agent de sécurité']];

function mcNormaliser(texte) {
  return String(texte || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/œ/g, 'oe').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}

// Rapproche les formes d'un même mot (pluriel, féminin) SANS couper le mot : « Serveuse » et « Serveur », « Caissière » et « Caissier ».
function mcRacine(mot) {
  var m = mot;
  if (m.length > 4 && /aux$/.test(m)) { return m.replace(/aux$/, 'al'); }      // chevaux -> cheval
  m = m.replace(/trice$/, 'teur').replace(/euse$/, 'eur').replace(/ienne$/, 'ien').replace(/iere$/, 'ier');
  if (m.length > 5) { m = m.replace(/ere$/, 'er'); }                               // boulangere -> boulanger
  m = m.replace(/([lnt])\1e$/, '$1');                                              // maternelle -> maternel, patronne -> patron
  m = m.replace(/ee$/, 'e');                                                       // employee -> employe
  if (m.length > 3) { m = m.replace(/[sx]$/, ''); }
  if (m.length > 4) { m = m.replace(/e$/, ''); }
  return m;
}

// Radical d'un mot : rapproche l'action et celui qui la fait (vendange et vendangeur, distribution et distributeur, déménagement et déménageur),
// SANS rapprocher de simples mots voisins (commercial et commerçant, enseignant et enseigniste). Un rapprochement par radical pèse 0,8, une forme identique 1.
var MC_SUFFIXES = ['ement', 'eur', 'age', 'ion', 'ure'];
var MC_POIDS_RADICAL = 0.8;
function mcRadical(mot) {
  for (var i = 0; i < MC_SUFFIXES.length; i++) {
    var s = MC_SUFFIXES[i];
    if (mot.length - s.length >= 4 && mot.slice(-s.length) === s) { return mot.slice(0, -s.length); }
  }
  return mot;
}

function mcMots(texteNormalise) {
  return texteNormalise.split(' ').filter(function (x) { return x.length > 2 && MC_MOTS_VIDES.indexOf(x) === -1; }).map(mcRacine);
}

// Retire du poste ce qui est vague. Renvoie les mots utiles restants (vide si le poste est vague).
function mcMotsUtilesDuPoste(poste) {
  var t = mcNormaliser(poste);
  MC_SYNONYMES.forEach(function (s) { if (t.indexOf(s[0]) !== -1) { t = t.replace(s[0], mcNormaliser(s[1])); } });
  MC_EXPRESSIONS_VAGUES.forEach(function (re) { t = t.replace(re, ' '); });
  var vagues = MC_MOTS_VAGUES.map(mcRacine);
  return mcMots(t.replace(/\s+/g, ' ').trim()).filter(function (mot, i, tab) { return vagues.indexOf(mot) === -1 && tab.indexOf(mot) === i; });
}

// Index des intitulés du répertoire, construit une fois par répertoire (mis en mémoire sur l'objet).
function mcIndex(rep) {
  if (rep._mcIndex) { return rep._mcIndex; }
  var lignes = rep.metiers.map(function (l) {
    var mots = []; mcMots(mcNormaliser(l[0])).forEach(function (w) { if (mots.indexOf(w) === -1) { mots.push(w); } });
    return { nom: l[0], code: l[1], domaine: rep.domaines[l[2]], mots: mots, radicaux: mots.map(mcRadical) };
  });
  var df = {};
  lignes.forEach(function (x) { x.mots.forEach(function (w) { df[w] = (df[w] || 0) + 1; }); });
  var n = lignes.length;
  var idx = { lignes: lignes, idf: function (w) { return Math.log(n / (1 + (df[w] || 0))); } };
  rep._mcIndex = idx;
  return idx;
}

// Poids de rencontre d'un mot dans une liste de mots : 1 si la forme est identique, 0,8 si seul le radical l'est, 0 sinon.
function mcPoidsMot(mot, motsListe, radicauxListe) {
  if (motsListe.indexOf(mot) !== -1) { return 1; }
  return radicauxListe.indexOf(mcRadical(mot)) !== -1 ? MC_POIDS_RADICAL : 0;
}

// Score d'un intitulé du répertoire pour les mots du poste : 70 % de la part des mots du poste retrouvée, 30 % de la part de l'intitulé couverte.
function mcScore(motsPoste, radicauxPoste, ligne, idf) {
  var totQ = 0, hit = 0, totX = 0, couvX = 0;
  motsPoste.forEach(function (w) { var p = idf(w); totQ += p; hit += p * mcPoidsMot(w, ligne.mots, ligne.radicaux); });
  if (!hit || !totQ) { return null; }
  ligne.mots.forEach(function (w) { var p = idf(w); totX += p; couvX += p * mcPoidsMot(w, motsPoste, radicauxPoste); });
  return { score: 0.7 * (hit / totQ) + 0.3 * (couvX / (totX || 1)), hit: hit / totQ };
}

function mcArrondir(x) { return Math.round(x * 100) / 100; }

function mcChercherFiche(poste, rep, options) {
  options = options || {};
  var vide = { niveau: 'D', fiches: [], preselection: null, secteurs: [], voteNet: false };
  var motsPoste = mcMotsUtilesDuPoste(poste);
  if (!motsPoste.length || !rep || !rep.metiers) { return vide; }
  var idx = mcIndex(rep), parCode = {}, votes = [], radicauxPoste = motsPoste.map(mcRadical);
  idx.lignes.forEach(function (x) {
    var r = mcScore(motsPoste, radicauxPoste, x, idx.idf);
    if (!r) { return; }
    if (r.hit >= 0.5) { votes.push({ domaine: x.domaine, s: r.hit }); }   // un secteur ne se déduit que d'un rapprochement qui retrouve au moins la moitié des mots du poste
    var s = mcArrondir(r.score), ancien = parCode[x.code];
    if (!ancien || s > ancien.score) { parCode[x.code] = { nom: x.nom, code: x.code, domaine: x.domaine, score: s }; }
  });
  var liste = Object.keys(parCode).map(function (c) { return parCode[c]; }).sort(function (a, b) { return b.score - a.score; });
  var prioritaires = options.secteursPrioritaires || [];
  function ranger(tab) {
    return tab.slice().sort(function (a, b) {
      return (b.score + (prioritaires.indexOf(b.domaine) !== -1 ? MC_BONUS_SECTEUR : 0)) - (a.score + (prioritaires.indexOf(a.domaine) !== -1 ? MC_BONUS_SECTEUR : 0));
    }).slice(0, MC_NB_MAX_LISTE);
  }
  var meilleur = liste[0], second = liste[1];
  var intituleIdentique = !!meilleur && meilleur.score >= 0.999 && (!second || second.score < 0.999);   // intitulé identique (après accord masculin/féminin) : une seule fiche
  if (meilleur && meilleur.score >= MC_SEUIL_TROUVEE && (intituleIdentique || !second || meilleur.score - second.score >= MC_ECART_MINI - 1e-9)) {
    return { niveau: 'A', fiches: [meilleur], preselection: meilleur, secteurs: [], voteNet: false };
  }
  if (meilleur && meilleur.score >= MC_SEUIL_PROCHES) {
    return { niveau: 'B', fiches: ranger(liste.filter(function (f) { return f.score >= meilleur.score - MC_ECART_MINI - 1e-9; })), preselection: null, secteurs: [], voteNet: false };
  }
  if (meilleur && meilleur.score >= MC_SEUIL_APPROCHANTES) {
    var s = mcSecteurs(votes);
    return { niveau: 'C', fiches: ranger(liste.filter(function (f) { return f.score >= MC_SEUIL_APPROCHANTES; })), preselection: null, secteurs: s.secteurs, voteNet: s.net };
  }
  var sv = mcSecteurs(votes);
  vide.secteurs = sv.secteurs; vide.voteNet = sv.net;
  return vide;
}

// Vote des secteurs : somme des parts retrouvées par les 25 meilleurs rapprochements. « Net » si le premier pèse au moins une fois et demie le deuxième.
function mcSecteurs(votes) {
  var somme = {};
  votes.sort(function (a, b) { return b.s - a.s; }).slice(0, 25).forEach(function (v) { somme[v.domaine] = (somme[v.domaine] || 0) + v.s; });
  var tab = Object.keys(somme).map(function (d) { return { nom: d, poids: mcArrondir(somme[d]) }; }).sort(function (a, b) { return b.poids - a.poids; }).slice(0, 3);
  return { secteurs: tab, net: tab.length > 0 && (tab.length === 1 || tab[0].poids >= 1.5 * tab[1].poids) && tab[0].poids >= 1 };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    MC_SEUIL_TROUVEE: MC_SEUIL_TROUVEE, MC_ECART_MINI: MC_ECART_MINI, MC_SEUIL_PROCHES: MC_SEUIL_PROCHES, MC_SEUIL_APPROCHANTES: MC_SEUIL_APPROCHANTES, MC_NB_MAX_LISTE: MC_NB_MAX_LISTE,
    mcNormaliser: mcNormaliser, mcRacine: mcRacine, mcMotsUtilesDuPoste: mcMotsUtilesDuPoste, mcChercherFiche: mcChercherFiche
  };
}
