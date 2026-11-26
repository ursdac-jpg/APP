# Audit des cas restés à jouer (2026-11-22)

Mode B, effort moyen. Complète les audits par carte du 21 et du 22/11/2026.

## 375 px (téléphone)
- Les 22 pages de présentation et d'accueil des modules : aucun défilement horizontal, aucun bouton trop petit. Seule la barre d'étapes des écrans « Votre objectif » et « Vos informations » dépasse de la largeur : c'est une barre qui défile, la page elle-même ne défile pas.
- Les protocoles à jour (Compétences, Bilan, Regard, ATS, Cohérence, Se tenir informé, Comparer mes pistes, Un CV plusieurs métiers) : 0 écart à 375 px.
- Les scripts anciens (création de CV à l'assistant, lettre, entretien, version rapide, reprise voie 1) donnent les mêmes écarts qu'à 1280 px : ils sont périmés (ils ne choisissent pas le métier visé ni l'objectif actuel), ce ne sont pas des défauts de l'application. À remettre à jour avant de s'en servir.

## Mode sombre
Contrôle automatique des contrastes sur 21 pages : aucun texte illisible. Seuls les champs de saisie restent blancs avec texte sombre (voulu : aucune règle globale sur ces champs, voir la leçon 9.10), lisibles.

## Dépôt de fichier
- Fichier texte : lu, relecture proposée, avertissement de masquage affiché.
- PDF : impossible à jouer ici (le lecteur est chargé depuis internet, bloqué dans cet environnement), mais cela a révélé un message vague (« erreur »). **Corrigé** : le message dit maintenant qu'une connexion internet est nécessaire ou qu'il faut coller le texte.
- Photo et Word : non joués (même dépendance à internet).

## Plusieurs métiers d'un même domaine (lettre)
Joué : recherche du domaine, intitulés proposés, raison du bouton qui se met à jour à chaque étape, intitulé et domaine présents dans le message à l'assistant.

## Profil minimal
Un « CV » de six mots passait sans avertissement jusqu'à l'assistant. **Corrigé** : un avertissement « Texte très court » s'affiche à la relecture (sous 30 mots), sans rien bloquer.

## Non vérifié
Lecture réelle d'un PDF, d'un Word et d'une photo, vraies réponses de l'assistant.

## Scripts du protocole remis à jour (2026-11-22)

Les scripts de `scripts/parcours/protocole/` suivaient d'anciens écrans. Remis à jour, tous à 0 écart à 1280 px : creerAssistant, creerAlaMain, creerRecit, reprendreVoie1, reprendreVoie2, reprendreVoie3, reprendreRecit, preparerLettre, preparerEntretien, lettreRapide, analyseAts, tourCartes.

- Nouvelle étape « Avant de commencer » (qui choisit les missions) : aide `passerChoixMissions` dans `reprendreCv.js`, appelée par les parcours de création et de reprise.
- Métier choisi dans les propositions (ou « Valider ») ; étape « domaine du métier » supprimée ; étape « Vos missions et compétences » passée dans la voie à la main.
- `reprise.js` est une aide, pas un parcours : `lancer.js` le dit clairement.
- Aucun défaut réel de l'application derrière ces écarts : tous venaient des scripts.

## Quatre modules « sans audit récent » : contrôle du 22/11/2026 (soir)

- **Mes documents (carte de l'accueil)** : les trois tuiles (Créer un nouveau CV, Reprendre mon CV, Lettre et entretien en version rapide) rejouées par `tourCartes` : 0 écart, chaînes de Retour jusqu'à la carte correctes. Les parcours qu'elles ouvrent sont ceux des audits du 21/11.
- **Mon Carnet, Mes Repères, Lexique** : déjà audités le 22/11 (`AUDIT_BOITE_A_OUTILS_2026-11-22.md`). Rejoués par `boiteOutils` à 1280 et 375 px : 0 écart. Chaîne de Retour du Lexique par le vrai chemin (carte, Lexique, fiche, favoris) : trois Retour jusqu'à la carte, cohérent. Aucun débordement horizontal à 375 et 768 px, en clair et en mode sombre, sur Carnet avec note, Repères avec Repère, Lexique (résultats et fiche), Créer un CV, Reprendre mon CV.
- **Mieux se comprendre** : n'existe pas encore dans le code (cadrage seulement, `docs/CHANTIER_MIEUX_SE_COMPRENDRE_2026-11-22.md`), rien à contrôler.
- Aucun défaut trouvé, aucun code modifié. Non vérifié : lecture réelle d'un PDF, Word ou photo, vraies réponses d'assistants.
