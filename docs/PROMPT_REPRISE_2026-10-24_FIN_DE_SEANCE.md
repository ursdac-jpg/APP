# Reprise de fin de séance du 24/10/2026 (lettre, gabarits, cartes d'objectif, recommandations)

À lire en premier dans une nouvelle session (puis `/app`). Dernier commit de la séance : voir `git log` (série « Lettre, lot … », « E1… », « E5 », « G1 »). Rien n'est poussé ; jamais `git push` sans demande de Denis ; jamais `git add -A` sans relire `git status` (je l'ai utilisé avec des chemins limités à `js data modules tests docs css prompts index.html`).

## Ce qui est FAIT (vérifié au navigateur, `npm test` vert, 1972 essais)

- **Lettre, temps 2 et 3** : parcours « Préparer », bloc destinataire, aperçu entier et collé, « Valider la lettre » dans la barre, Exporter (PDF d'abord, Word, texte), avertissement « PDF recommandé », jointure des lettres de recommandation (PDF/photo), cinq gabarits (Sobre, en-tête et filet avec options, colonne colorée, bandeau, titre et informations), couleur du CV, police, bouton « Mise en page ». Cahier : `docs/CHANTIER_LETTRE_CV_DANS_LE_PROMPT_2026-10-23.md` (décisions 1 à 71).
- **Liste de travail de Denis** : `docs/LISTE_RETOURS_DENIS_LETTRE_2026-10-24.md` (lots A à E cochés ou non, tâches E5 bis, E6, F1, G1).
- **Généralisation** : `docs/AUDIT_GENERALISATION_CARTES_OBJECTIF_2026-10-24.md` (E1.0, E1.1 « Préparer l'entretien », E1.3 « Votre objectif » du CV en un écran : faits) ; `docs/AUDIT_PROMPTS_ET_RECOMMANDATIONS_CV_2026-10-24.md` (E2.0 formule d'appel faite).
- **E5** : panneau « Vos appuis » aussi sur la page « Choisir mon assistant » du CV, stock commun avec la lettre, **une seule lettre de référence envoyée pour les deux** (aligné le 24/10 sur demande de Denis), règle courte dans `prompts/cv.md`.
- **G1** : le message qui explique pourquoi « Continuer » est grisé apparaît **au survol** du bouton, au-dessus de lui, à droite (`definirRaisonSuivantBarre`, `.barre-raison-suivant`) ; la phrase redondante dans la page (lettre, « Votre objectif ») est retirée ; le bouton garde sa taille.

## Ce qui RESTE à faire, dans l'ordre conseillé

1. **Vérifier et commiter l'état courant** si `git status` montre des fichiers modifiés (dernier travail : alignement CV sur une lettre de référence, message au survol, retrait des phrases en page).
2. ~~**F1**~~ FAIT (voir la liste) : remplacer « facultatif » par « à compléter » partout (textes affichés seulement, jamais le caractère bloquant) ; mémoire `feedback_a_completer_jamais_facultatif.md`. Commencer par ce que j'ai codé le 24/10.
3. ~~**E6**~~ FAIT le 24/10 (`modules/cv-core/disponibiliteCv.js`, testé ; suggestions « D'après votre projet » + groupe « Horaires » dans « Informations complémentaires » du CV ; texte d'aide dans la rubrique vide). Demande d'origine : disponibilité et horaires sur le CV côté code.
4. ~~**E5 bis**~~ ABANDONNÉ le 24/10 après audit (le prompt d'extraction a le rôle opposé, gain minime) : la recommandation reste au 2e passage. Ancien texte : `[haut]` : envoyer la lettre de référence au **1er passage** (`prompts/extraction-cv.md`, quand un CV est déposé) plutôt qu'au 2e, pour ne pas alourdir `cv.md` ; sinon (« Créer un CV », pas de dépôt) 2e passage. Auditer `extraction-cv.md` et son format de sortie ; essais de Denis sur un vrai assistant.
5. **E1.2** `[moyen]` Bilan et Cohérence en mode unifié (derrière paramètre, un écran à la fois) ; **E1.4** Découverte ; **E1.5** brancher profil des prompts et type de CV sur `situationReelleLettreCo`.
6. ~~**C4**~~ FAIT le 24/10. Ancien texte : `[moyen]` lettre : message de rallonge si trop courte, repérage des phrases quasi identiques + « supprimer cette phrase ».
7. **Joindre la lettre de recommandation au CV (PDF)** et **dossier en un seul PDF** (CV + lettre + recommandations) : maquette d'abord, `[haut]`. Réutiliser `pagesJointesLettre`, `pagesEnImagesRecommandation`.
8. **E2.1 / E2.2** `[moyen]` bloc commun « lignes du profil » dans les prompts (jeton partagé) ; **E2.3 / E3.1** anti-doublons : essais de Denis d'abord.
9. **E4** `[haut]` CV sans assistant : un choix unique dans les parcours (« avec l'aide de l'assistant » / « j'ai déjà mon texte ») vers une seule page nouvelle ; maquette déjà commencée par Denis ; avis donné : pas de module de plus.
10. Petites dettes : renommer `_coLettreNormaliserCarteOffre` et `_coLettreEffacerCandidature` (utilisées hors lettre) ; « Voir ou modifier le texte transmis » ne montre pas encore la lettre de recommandation ; pour « Répondre à une offre » l'entreprise n'est pas exigée (règle de la lettre, écart avec la maquette du CV) ; le message au survol n'existe pas au toucher (téléphone) : l'info-bulle `title` reste ; maquettes du CV et des gabarits contiennent encore « facultatif ».

## Nouvelles demandes de Denis (24/10, fin de séance), à planifier
- **N1** FAIT le 24/10 : `prompts/lettre.md` (parcours « Préparer ma lettre et mon entretien » et « Mettre à jour mon CV », deux versions d'un bloc) reçoit la recette en cinq paragraphes (phrases de 15 à 25 mots, un fait par phrase), les fourchettes de mots (330 à 420 ; 270 à 340 pour stage, alternance, immersion, formation, premier emploi), le plan silencieux (un fait, un seul paragraphe), l'objet qui dit la vérité, le contrôle de répétition ; la lettre de recommandation de référence est jointe au message (`js/app.js`). Non testé sur un vrai assistant : à essayer par Denis, en regardant surtout le nombre de mots et la tenue sur une page.
- **N2 et N3 (UCPM) FAITS le 24/10** (voir `docs/CHANTIER_UCPM_LETTRES_N2_2026-10-24.md`) : cinq modèles, couleur et police du CV, groupes de 5 avec suite, prompt V8. À essayer par Denis. Ancien texte : (le prompt génère tout d'un coup, sans échange : s'inspirer de la rigueur de `lettre-co.md`) Module **Un CV, plusieurs métiers** : enrichir un peu le prompt de lettre ; si un seul message est trop lourd (jusqu'à 10 lettres), **couper en deux par 5** : consigne en bas « pour la suite, tapez oui », comme pour le CV.
- **N3** Pages **Préparer ma lettre** et **Préparer mon entretien** : réutiliser partout la page de choix de gabarit de lettre (composant unique, pas de copie).
- **N4** FAIT le 24/10 : « mise en situation » devenue **cas pratique** dans `entretien.md` et `entretien-accueil.md` (question commençant par « Cas pratique : », nourrie du CV, de la lettre et de la recommandation) ; le texte de la lettre envoyée et la lettre de recommandation de référence sont maintenant transmis à l'entretien (`sectionRecommandationPourMessage`). À essayer par Denis sur un vrai assistant.

## Règles de pilotage posées par Denis (24/10)
- Tout ce qui est listé sera fait, et le chantier de la lettre doit d'abord avoir sa forme définitive. C'est à Claude de fixer la priorité pour ne pas s'éparpiller.
- **Impératif : annoncer le niveau d'effort nécessaire pour CHAQUE tâche avant de la commencer.**

## Nouvel ordre décidé par Denis (24/10, fin de séance)
**La liste complète, classée par priorité et par module, est dans `docs/LISTE_PRIORITES_RETOURS_DENIS_2026-10-24.md` (lots 1 à 6, F2 à F23) : à lire en premier pour reprendre.**
1. Ses retours de test (à noter dès réception dans `docs/LISTE_RETOURS_DENIS_LETTRE_2026-10-24.md`), corrigés et améliorés un par un.
2. E4 (CV sans assistant) **en dernier** : « ce n'est pas le plus important ». Maquette d'abord, effort haut.

FAIT dans cette séance, à essayer par Denis : E6, N4, C4, N1, N2 et N3 (modèles de lettre pour « Un CV, plusieurs métiers » avec suite par 5), E1.2, E1.4, E1.5. E5 bis abandonné après audit.

## Essais que Denis doit faire (aucun coût Claude)

Word réel des cinq gabarits (surtout colonne colorée et bandeau) ; vraie boîte d'impression PDF (marges, nom du fichier, deux pages) ; jointure d'une vraie lettre de recommandation PDF ; `cv.md` avec une recommandation ; `lettre-co.md` versions « réglages soutenus / simples ».

## Message à coller si on ouvre une NOUVELLE fenêtre

« /app — Reprends la séance du 24/10/2026 : lis `docs/PROMPT_REPRISE_2026-10-24_FIN_DE_SEANCE.md`, puis `git status`. Mode A, une décision à la fois, effort annoncé avant chaque tâche, jamais de push, jamais `git add -A`. Commence par vérifier et commiter l'état courant, puis propose-moi F1 (remplacer facultatif par à compléter). »

Sinon, continuer ici après compactage : dire « vas-y avec F1 ».
