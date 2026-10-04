/* ============================================================
   data/microFormations.js -- mini-formations gratuites et rapides,
   valorisables sur un CV, par secteur (module Bilan de candidature)
   ------------------------------------------------------------
   Contenu VERIFIE et tenu a jour par Denis, comme data/freins.js --
   jamais invente par un assistant. Aucune logique ici : juste des
   donnees (meme regle que data/secteurs.js). Charge apres
   data/metiers.js (secteurs par `cle`, voir SECTEURS_APP).

   TACHE (chantier "chiffres et mini-formations", 2026-09-20,
   decision Denis) : cote CODE, jamais cote prompt -- eviter tout
   risque qu'un assistant invente un nom, une duree ou un prix faux
   pour une formation reelle. Chaque entree :
   - `secteurs` : liste de `cle` de SECTEURS_APP ou `null` si
     transverse (pertinent quel que soit le secteur).
   - `motsClesDejaPresent` : si l'un de ces mots (normalise, voir
     normaliserTexte()/data/metiers.js) apparait deja dans le CV,
     cette formation n'est jamais proposee -- la personne l'a
     probablement deja, ou une preuve equivalente.
   - `description` : formulee honnetement, jamais une promesse en
     l'air (ex. Pix/PSC : conditions d'acces precisees, pas de
     gratuite universelle surpromise).

   Reste a verifier avant un futur ajout (ecarte pour l'instant,
   2026-09-20) : CNIL RGPD, ARS "chutes des personnes agees",
   OpenClassrooms, Canva, Meta Blueprint, Fortinet -- details non
   confirmes avec assez de certitude. Cours FAO (agriculture) ecartes
   : mal cibles pour un CV francais.
   ============================================================ */

var MICRO_FORMATIONS = [
  {
    id: 'drone-a1a3',
    nom: "Attestation de télépilote (catégorie ouverte A1/A3)",
    organisme: "DGAC, plateforme AlphaTango",
    duree: "Quelques heures, en ligne",
    description: "Vidéos à regarder puis questionnaire en ligne. Gratuit. Obligatoire dès qu'un drone a une caméra ou pèse plus de 250 g.",
    secteurs: ['agriculture-nature', 'btp', 'proprete', 'banque-assurance-immobilier', 'communication-culture', 'sport-animation'],
    motsClesDejaPresent: ['drone', 'telepilote', 'a1/a3', 'alphatango', 'cats drone', 'catt']
  },
  {
    id: 'langue-efset',
    nom: "Test de niveau d'anglais avec certificat (EF SET)",
    organisme: "EF Education First",
    duree: "Environ 50 minutes, en ligne",
    description: "Test gratuit, résultat immédiat sur l'échelle européenne des langues (A1 à C2), certificat téléchargeable et partageable.",
    secteurs: null,
    motsClesDejaPresent: ['toeic', 'toefl', 'ef set', 'cecrl', 'bilingue', 'niveau b1', 'niveau b2', 'niveau c1', 'niveau c2', 'courant']
  },
  {
    id: 'frappe-clavier',
    nom: "Test de vitesse de frappe avec certificat",
    organisme: "Sites gratuits dédiés (ex. Ratatype, Dysclick)",
    duree: "Quelques minutes, en ligne",
    description: "Mesure la vitesse de frappe (mots par minute) et la précision, certificat téléchargeable.",
    secteurs: ['administration'],
    motsClesDejaPresent: ['mots par minute', 'wpm', 'vitesse de frappe', 'dactylographie']
  },
  {
    id: 'secourisme-psc',
    nom: "Formation aux premiers secours (PSC)",
    organisme: "Croix-Rouge française et autres organismes agréés",
    duree: "Environ 8 heures",
    description: "Gratuite via une aide individuelle à la formation de France Travail ou une Mission locale (à vérifier auprès de son conseiller).",
    secteurs: ['sante', 'social-personne', 'btp', 'hotellerie-restauration', 'sport-animation'],
    motsClesDejaPresent: ['psc1', 'psc', 'sst', 'secourisme', 'premiers secours', 'sauveteur secouriste']
  },
  {
    id: 'secnumacademie',
    nom: "Sensibilisation à la cybersécurité (SecNumacadémie)",
    organisme: "ANSSI (agence de l'État)",
    duree: "Environ 5 à 8 heures, en ligne",
    description: "Modules gratuits, attestation délivrée automatiquement après réussite des évaluations.",
    secteurs: ['numerique', 'administration'],
    motsClesDejaPresent: ['secnumacademie', 'anssi', 'cybersecurite']
  },
  {
    id: 'hubspot-academy',
    nom: "Certifications courtes en marketing digital (HubSpot Academy)",
    organisme: "HubSpot Academy",
    duree: "Entre 3 et 8 heures selon le module, en ligne",
    description: "Plusieurs certifications gratuites (marketing digital, réseaux sociaux, contenu, e-mailing), certificat délivré après un examen final.",
    secteurs: ['commerce-vente', 'communication-culture'],
    motsClesDejaPresent: ['hubspot']
  },
  {
    id: 'ibm-skillsbuild',
    nom: "Badges numériques (IBM SkillsBuild)",
    organisme: "IBM",
    duree: "Entre 1 et 8 heures par badge, en ligne",
    description: "Modules gratuits sans prérequis (numérique, données, compétences transversales), badge numérique délivré à la fin.",
    secteurs: ['numerique'],
    motsClesDejaPresent: ['ibm skillsbuild', 'ibm']
  },
  {
    id: 'cisco-networking',
    nom: "Cours d'introduction (Cisco Networking Academy)",
    organisme: "Cisco",
    duree: "Environ 3 à 6 heures, en ligne",
    description: "Cours gratuits d'introduction aux réseaux et à la cybersécurité, attestation délivrée à la fin.",
    secteurs: ['numerique'],
    motsClesDejaPresent: ['cisco']
  },
  {
    id: 'microsoft-learn',
    nom: "Modules courts (Microsoft Learn)",
    organisme: "Microsoft",
    duree: "De 30 minutes à quelques heures par module, en ligne",
    description: "Modules gratuits, badge ou attestation de suivi téléchargeable à la fin de chaque module.",
    secteurs: ['numerique'],
    motsClesDejaPresent: ['microsoft learn', 'microsoft certified']
  },
  {
    id: 'google-ateliers-numeriques',
    nom: "Modules courts (Google Ateliers Numériques)",
    organisme: "Google",
    duree: "Entre 1 et 6 heures selon le module, en ligne",
    description: "Modules gratuits sur les compétences numériques et le marketing, attestation de suivi délivrée à la fin de chaque module.",
    secteurs: ['commerce-vente', 'communication-culture'],
    motsClesDejaPresent: ['google ateliers numeriques', 'google digital garage']
  },
  {
    id: 'pix',
    nom: "Test de compétences numériques (Pix)",
    organisme: "Pix (service public)",
    duree: "Entre 30 et 90 minutes, en ligne",
    description: "Test gratuit qui donne un score de compétences numériques, utilisable sur un CV. La certification officielle est, elle, généralement organisée par un établissement ou un partenaire (France Travail, école...).",
    secteurs: null,
    motsClesDejaPresent: ['pix']
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MICRO_FORMATIONS: MICRO_FORMATIONS };
}
