/* ============================================================
   data/comprendreMetiersTextes.js : textes du module « Explorer les métiers »
   ------------------------------------------------------------
   Créé le 17/11/2026 (phase 1 du plan de clôture), validé par Denis le 17/11/2026.
   Trois jeux de textes, sans aucune logique :

   1. TEXTES_LETTRES_RIASEC : les six lettres expliquées en mots simples
      (d'après le modèle de Holland, jamais un portrait de la personne).
      Source : docs/MAQUETTE_COMPRENDRE_LES_METIERS_V2_2026-11-16.html.
   2. SIGLES_METIERS : les sigles de métiers qui n'apparaissent dans aucun nom
      de fiche, avec leur signification et la ou les fiches correspondantes.
      Les sigles déjà écrits dans le nom d'une fiche (ASH, AES, ADVF, CIP...)
      n'ont rien à faire ici : la recherche les trouve seule.
      Source : docs/CATALOGUE_SIGLES_ET_EXPLICATIONS_2026-11-17.md.
   3. EXPLICATIONS_CHOIX_METIERS : une phrase pour chacune des 15 familles de
      choix de l'entrée « Par actions » (clé = libellé exact de la catégorie
      dans les catalogues de choix, vérifié par tests).

   Aucune dépendance. Charge avant js/app.js.
   ============================================================ */

var TEXTES_LETTRES_RIASEC = {
  R: { court: 'le concret, les outils, le plein air',
    bref: 'Vous aimez le concret : des outils, des machines, du terrain, un résultat que l’on voit.',
    attire: 'Réparer, construire, conduire, travailler dehors, bouger, utiliser son corps.',
    forts: 'Sens pratique, habileté des mains, patience, constance, fiabilité.',
    attention: 'Dire ce que vous faites et ce que vous attendez des autres, suivre les nouveautés techniques, accepter de ne pas tout faire seul.',
    univers: 'Ateliers, chantiers, extérieur, exploitations, entrepôts. Des consignes claires et des résultats mesurables.',
    metiers: 'Mécanicien, électricien, conducteur, jardinier, menuisier, cariste.' },
  I: { court: 'comprendre, chercher, analyser',
    bref: 'Vous aimez comprendre, chercher et analyser avant de décider.',
    attire: 'Résoudre des problèmes, lire, expérimenter, comprendre pourquoi les choses fonctionnent.',
    forts: 'Curiosité, esprit critique, méthode, indépendance d’esprit, précision.',
    attention: 'Passer de l’analyse à l’action, partager ses idées avec les autres, accepter qu’une réponse parfaite n’existe pas toujours.',
    univers: 'Laboratoires, santé, informatique, études. Du temps pour réfléchir et de l’autonomie.',
    metiers: 'Technicien de laboratoire, infirmier, développeur informatique, géomètre, analyste.' },
  A: { court: 'créer, imaginer, s’exprimer',
    bref: 'Vous aimez créer, imaginer et vous exprimer à votre façon.',
    attire: 'Dessiner, écrire, composer, décorer, inventer de nouvelles façons de faire.',
    forts: 'Imagination, sensibilité, originalité, ouverture d’esprit.',
    attention: 'Tenir les délais, s’organiser, supporter un cadre fixé par d’autres, faire connaître son travail.',
    univers: 'Ateliers, studios, scènes, agences. Des projets variés, avec de la liberté.',
    metiers: 'Décorateur, graphiste, photographe, coiffeur, musicien, fleuriste.' },
  S: { court: 'aider, écouter, enseigner',
    bref: 'Vous aimez aider, écouter, expliquer et travailler avec les autres.',
    attire: 'Accompagner, soigner, enseigner, animer un groupe, rendre service.',
    forts: 'Écoute, patience, bienveillance, sens de l’équipe.',
    attention: 'Garder du temps pour vous, savoir dire non, ne pas porter tous les soucis des autres.',
    univers: 'Santé, éducation, social, accueil, animation. Du contact humain et du travail d’équipe.',
    metiers: 'Aide-soignant, éducateur, animateur, enseignant, conseiller en insertion.' },
  E: { court: 'convaincre, mener, décider',
    bref: 'Vous aimez convaincre, mener et relever des défis.',
    attire: 'Vendre, négocier, diriger une équipe, lancer des projets, prendre des responsabilités.',
    forts: 'Énergie, confiance, aisance à parler, goût d’entreprendre.',
    attention: 'Prendre le temps d’écouter et de soigner les détails, accepter de ne pas tout décider seul, mesurer les risques.',
    univers: 'Commerce, vente, gestion d’équipe, création d’entreprise. Des objectifs et un rythme soutenu.',
    metiers: 'Vendeur, commercial, chef d’équipe, responsable de magasin, agent immobilier.' },
  C: { court: 'organiser, classer, suivre des règles',
    bref: 'Vous aimez l’ordre, la méthode et le travail soigné.',
    attire: 'Classer, organiser, vérifier, suivre des procédures, tenir des comptes.',
    forts: 'Fiabilité, précision, sens de l’organisation, ponctualité.',
    attention: 'S’adapter quand les règles changent, prendre des initiatives, demander de l’aide plutôt que d’attendre des consignes.',
    univers: 'Bureaux, administrations, banques, gestion. Des consignes claires.',
    metiers: 'Assistant administratif, comptable, gestionnaire de paie, secrétaire, agent d’accueil.' }
};

// Sigles absents des noms de fiches. `fiches` : noms exacts des fiches (vérifiés par tests).
// Deux lettres (AS, ES, ME, AP, PE) : la recherche ne les reconnaît que si c'est tout ce que la personne a tapé.
var SIGLES_METIERS = [
  { sigle: 'AS', signification: 'Aide-soignant ou aide-soignante', fiches: ['Aide-soignant'] },
  { sigle: 'AMP', signification: 'Aide médico-psychologique (métier regroupé avec d’autres dans « accompagnant éducatif et social » depuis 2016)', fiches: ['Accompagnant éducatif et social (AES)'] },
  { sigle: 'VRP', signification: 'Voyageur, représentant, placier : commercial qui se déplace chez les clients', fiches: ['Représentant en biens et en services auprès des entreprises', 'Commercial itinérant en entreprise de commerce de gros'] },
  { sigle: 'EJE', signification: 'Éducateur ou éducatrice de jeunes enfants', fiches: ['Éducateur de jeunes enfants'] },
  { sigle: 'ES', signification: 'Éducateur ou éducatrice spécialisé', fiches: ['Éducateur spécialisé'] },
  { sigle: 'ME', signification: 'Moniteur éducateur ou monitrice éducatrice', fiches: ['Moniteur éducateur'] },
  { sigle: 'ETS', signification: 'Éducateur ou éducatrice technique spécialisé', fiches: ['Éducateur technique spécialisé'] },
  { sigle: 'AP', signification: 'Auxiliaire de puériculture', fiches: ['Auxiliaire de puériculture'] },
  { sigle: 'IDE', signification: 'Infirmier ou infirmière diplômé d’État', fiches: ['Infirmier'] },
  { sigle: 'ASS', signification: 'Assistant ou assistante de service social', fiches: ['Assistant de service social'] },
  { sigle: 'AMA', signification: 'Assistant maternel ou assistante maternelle', fiches: ['Assistant maternel'] },
  { sigle: 'AED', signification: 'Assistant ou assistante d’éducation (surveillance et aide dans un établissement scolaire)', fiches: ['Assistant pédagogique en milieu scolaire'] },
  { sigle: 'CPE', signification: 'Conseiller ou conseillère principal d’éducation', fiches: ['Conseiller principal d’éducation'] },
  { sigle: 'CIP', signification: 'Conseiller ou conseillère en insertion professionnelle', fiches: ['Conseiller en insertion professionnelle'] },
  { sigle: 'PE', signification: 'Professeur ou professeure des écoles', fiches: ['Professeur des écoles'] }
];

// Une phrase par famille de choix de l'entrée « Par actions ». Clé = libellé de la catégorie dans les catalogues.
var EXPLICATIONS_CHOIX_METIERS = {
  'Personnes': 'Les personnes avec qui vous aimeriez être en contact dans votre travail : un public, des collègues, des personnes à accompagner.',
  'Matériels': 'Ce que vous aimeriez manipuler, utiliser ou préparer : des outils, des machines, des documents, des aliments, des matériaux.',
  'Animaux': 'Les animaux ou le vivant dont vous aimeriez vous occuper.',
  'Organisation, gestion, administration': 'Mettre de l’ordre, planifier, suivre des chiffres ou des dossiers, coordonner une équipe ou un projet.',
  'Relationnel': 'Être en contact avec les gens : conseiller, accueillir, soigner, former, vendre.',
  'Fabriquer et construire': 'Faire ou assembler quelque chose de ses mains : construire, monter, installer.',
  'Cuisiner et servir': 'Préparer des repas ou des boissons, puis les servir.',
  'Réparer et entretenir': 'Remettre en état, entretenir, nettoyer, s’occuper des plantes ou de l’environnement.',
  'Transport et logistique': 'Déplacer, conduire, livrer, préparer des commandes, manutentionner.',
  'Surveiller, manipuler, programmer': 'Veiller à la sécurité, réagir vite, tester, manipuler des produits, programmer.',
  'Création et conception': 'Imaginer, dessiner, rédiger, concevoir quelque chose de nouveau.',
  'En intérieur': 'Dans un lieu fermé : bureau, atelier, magasin, établissement de santé, cuisine, école…',
  'À domicile': 'Chez des particuliers ou chez vous.',
  'En extérieur': 'Dehors ou sur un lieu de plein air : chantier, champs, espaces verts, salles de spectacle ou de sport.',
  'En déplacement': 'Sur la route, dans les gares, les aéroports, les ports ou les entrepôts.'
};

if (typeof window !== 'undefined') {
  window.TEXTES_LETTRES_RIASEC = TEXTES_LETTRES_RIASEC;
  window.SIGLES_METIERS = SIGLES_METIERS;
  window.EXPLICATIONS_CHOIX_METIERS = EXPLICATIONS_CHOIX_METIERS;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TEXTES_LETTRES_RIASEC: TEXTES_LETTRES_RIASEC,
    SIGLES_METIERS: SIGLES_METIERS,
    EXPLICATIONS_CHOIX_METIERS: EXPLICATIONS_CHOIX_METIERS
  };
}
