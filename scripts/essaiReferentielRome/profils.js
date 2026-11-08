'use strict';
/* ============================================================
   scripts/essaiReferentielRome/profils.js
   Trois profils FICTIFS pour le banc d'essai « référentiel ROME dans la consigne du CV »
   (docs/INVENTAIRE_ALLEGER_PROMPTS_ET_DEPENDANCE_ASSISTANTS_2026-11-08.md, section 9).
   Aucune donnée réelle.

   Le texte du profil (`profilTexte`) a été produit le 08/11/2026 par la VRAIE fonction de
   l'application, texteProfil('cv') (js/app.js), dans le navigateur de test, avec un dossier
   rempli comme dans le parcours « Créer un CV » en mode CV spécifique. Il est figé ici pour
   que le banc tourne ensuite dans Node sans navigateur. Si texteProfil change, refaire ces textes.
   `@@GENRE@@` = bloc « CONSIGNES DE RÉDACTION » (identique dans les trois, repris ci-dessous).

   cas : ce que le profil teste.
     p1 : métier dans les 129 fiches complètes (l'application envoie déjà une ligne « Compétences
          typiquement attendues », 9 libellés) ; profil pauvre, peu d'écrit.
     p2 : métier présent seulement dans le ROME (chosi dans la liste du répertoire élargi : le domaine est
          connu) ; expérience très proche, texte moyen.
     p3 : même cas ROME seul, mais reconversion : ancien serveur qui vise plâtrier, un loisir de rénovation.
   ============================================================ */

const GENRE = 'CONSIGNES DE RÉDACTION\n- Genre du candidat : non précisé. Lis d’abord les accords déjà écrits dans le CV ou dans les informations de la personne (par exemple « expérimentée » ou « expérimenté », « cheffe d’équipe » ou « chef d’équipe », « assistante » ou « assistant », « habituée » ou « habitué ») et suis-les, sans en changer. S’il n’y en a aucun, écris à la forme neutre : intitulés épicènes, tournures sans adjectif ni participe passé accordé. N’écris jamais au masculin par défaut. Cet accord vaut pour TOUT le texte qui décrit la personne : le titre du CV, la phrase d’accroche, les intitulés de poste, les adjectifs et les participes passés. Il ne concerne pas la formule d’adresse au destinataire d’une lettre (« Madame, » ou « Monsieur, »), qui dépend du recruteur.\n';

const PROFILS = [
  {
    id: 'p1_libre_service',
    titre: 'Employé libre-service (fiche complète, profil pauvre)',
    metier: 'Employé libre-service',
    codeRome: 'D1507',
    dansLesFiches: true,
    // Éléments que le CV peut légitimement montrer d'après le texte de la personne (contrôle de preuve).
    preuves: ['mise en rayon', 'caisse', 'ranger', 'rayon', 'produits', 'cap employé de commerce', 'football'],
    profilTexte: 'Document demandé : CV\n\nCONTEXTE DE LA CANDIDATURE\n- Métier visé (à cibler en priorité pour le CV) : Employé libre-service\n- Mode CV SPÉCIFIQUE activé : adaptez précisément ce CV aux exigences du métier visé ci-dessus, plutôt qu’un CV générique. Compétences typiquement attendues pour ce métier : Merchandising, Gestion des stocks, Entretien, Rigueur, Organisation, Autonomie, Endurance, Rotation des produits, Règles d\'hygiène.\n- Objectif : non défini\n\nPROFIL DU CANDIDAT\n- Expériences professionnelles :\n   . Employé de rayon (Supermarché de quartier, 2021 à 2023) - Missions : mise en rayon, caisse parfois, je rangeais les produits\n- Formations :\n   . CAP - CAP Employé de commerce multi-spécialités, obtenu en 2020\n\nCOMPÉTENCES ET ATOUTS\n- Savoir-être : Motivation, Apprentissage\n- Savoir-faire : non renseigné\n- Savoirs : Rotation des produits, Règles d\'hygiène\n- Valeurs : non renseigné\n\nINFORMATIONS COMPLÉMENTAIRES\n- Mobilité : Permis B, sans véhicule\n- Loisirs : football en club\n\n@@GENRE@@'
  },
  {
    id: 'p2_conducteur_ligne',
    titre: 'Conducteur de ligne de conditionnement (ROME seul, expérience proche)',
    metier: 'Conducteur de ligne de conditionnement',
    codeRome: 'H3301',
    dansLesFiches: false,
    preuves: ['ligne de conditionnement', 'formats', 'réglages', 'feuille de production', 'nettoyais', 'chargement', 'palettes', 'maintenance', 'bricolage'],
    profilTexte: 'Document demandé : CV\n\nCONTEXTE DE LA CANDIDATURE\n- Métier visé (à cibler en priorité pour le CV) : Conducteur de ligne de conditionnement\n- Domaine de ce métier, choisi par la personne parmi nos 21 domaines (recopiez-le tel quel dans la clé secteurProche) : Industrie, production et énergie.\n- Mode CV SPÉCIFIQUE activé : adaptez précisément ce CV aux exigences du métier visé ci-dessus, plutôt qu’un CV générique.\n- Objectif : non défini\n\nPROFIL DU CANDIDAT\n- Expériences professionnelles :\n   . Opérateur de production (Usine agroalimentaire, 2016 à 2024) - Missions : Je surveillais la ligne de conditionnement de yaourts. Je changeais les formats, je faisais les réglages avec le chef d\'équipe, je remplissais la feuille de production et je nettoyais la machine en fin de poste.\n   . Manutentionnaire (Entrepôt de logistique, 2013 à 2016) - Missions : chargement et déchargement de camions, préparation de palettes\n- Formations :\n   . BEP - BEP Maintenance des systèmes mécaniques, obtenu en 2012\n\nCOMPÉTENCES ET ATOUTS\n- Savoir-être : Motivation, Apprentissage\n- Savoir-faire : non renseigné\n- Savoirs : non renseigné\n- Valeurs : non renseigné\n\nINFORMATIONS COMPLÉMENTAIRES\n- Mobilité : Permis B, véhicule personnel\n- Loisirs : bricolage, pêche\n\n@@GENRE@@'
  },
  {
    id: 'p3_serveur_vers_platrier',
    titre: 'Plâtrier (ROME seul, reconversion depuis le service en salle)',
    metier: 'Plâtrier',
    codeRome: 'F1601',
    dansLesFiches: false,
    preuves: ['service en salle', 'commande', '12 tables', 'encaissement', 'mise en place', 'rangement', 'rénovation', 'peinture', 'enduits', 'commercialisation'],
    profilTexte: 'Document demandé : CV\n\nCONTEXTE DE LA CANDIDATURE\n- Métier visé (à cibler en priorité pour le CV) : Plâtrier\n- Domaine de ce métier, choisi par la personne parmi nos 21 domaines (recopiez-le tel quel dans la clé secteurProche) : Bâtiment et travaux publics.\n- Mode CV SPÉCIFIQUE activé : adaptez précisément ce CV aux exigences du métier visé ci-dessus, plutôt qu’un CV générique.\n- Objectif : non défini\n\nPROFIL DU CANDIDAT\n- Expériences professionnelles :\n   . Serveur (Brasserie du centre-ville, 2017 à 2025) - Missions : Service en salle, prise de commande, gestion de 12 tables en même temps pendant les coups de feu, encaissement, mise en place et rangement en fin de service.\n- Formations :\n   . Baccalauréat professionnel - Bac pro Commercialisation et services en restauration, obtenu en 2016\n\nCOMPÉTENCES ET ATOUTS\n- Savoir-être : Motivation, Apprentissage\n- Savoir-faire : non renseigné\n- Savoirs : non renseigné\n- Valeurs : non renseigné\n\nINFORMATIONS COMPLÉMENTAIRES\n- Mobilité : Permis B, véhicule personnel\n- Loisirs : rénovation de ma maison (peinture, enduits)\n\n@@GENRE@@'
  }
];

module.exports = { PROFILS, GENRE };
