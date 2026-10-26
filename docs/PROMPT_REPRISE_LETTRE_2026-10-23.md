# Reprise du chantier « Écrire ma lettre avec l'assistant » (mis à jour le 24 octobre 2026, fin de séance)

À coller en premier message d'une NOUVELLE session (contexte vide, donc beaucoup moins coûteux), puis lancer `/app`.

## Où on en est, en dix lignes

- Chantier en quatre temps décidés par Denis : **1) le prompt (FAIT)**, **2) le parcours (code, en cours)**, **3) la mise en page et l'impression**, **4) l'uniformisation des autres modules et prompts**.
- **Prompt V2 intégré** dans `prompts/lettre-co.md` (jeton `{{VOIX_HUMAINE}}` conservé) : plan des faits validé avant l'écriture, recettes en phrases, encadré « Votre lettre jusqu'ici », ligne « Idées déjà dites », réglages d'écriture précisés. Cinq essais, **note estimée 14 à 15 sur 20** (plafond réaliste avec ce CV : 15 à 16). Source : `docs/PROMPT_LETTRE_V2_2026-10-23.md` ; fichiers d'essai à coller : `docs/ESSAI_LETTRE_V2_AVEC_RECOMMANDATION_EMPLOYEUR_2026-10-23.txt`, `..._REGLAGES_SOUTENUS_2026-10-24.txt`, `..._REGLAGES_SIMPLES_2026-10-24.txt` (les deux derniers **pas encore testés** : ils vérifient que la qualité suit les autres réglages). Mesure d'une lettre : `node scripts/lettreInventaire/mesurer.js <lettre.txt> [noms]`.
- **Disponibilités et horaires (spontanée et changer de métier) FAIT le 24/10/2026** (décision 60) ; **volonté de Denis : le panneau de l'écran « Préparer » (cartes, questions, blocage, disponibilités) sera étendu à tout le reste, CV compris** (temps 4) : les briques sont déjà derrière le paramètre `modeUnifie`.
- **Temps 2, étape (c) TERMINÉE le 24/10/2026 (c1 à c5, décisions 55 à 59)** ; détail : c5 = « plusieurs métiers d'un domaine » avec intitulé de poste (listes validées, `data/secteurs.js`). Rappel du détail de c1 à c4 :
- (c1 à c4) (c4 : changer de métier à trois choix, décision 58 ; c3 : spontanée à deux choix et remise à zéro au changement de carte, décision 57 ; c2 : carte offre derrière `modeUnifie`, décision 56 ; c1 ci-dessous) ; **reste c5 (domaine avec intitulé, liste à valider par Denis)**.
- (c1) : c1 FAITE le 24/10/2026** (structure de la page « Préparer » : plus de « facultatif », adaptation désactivée sans objectif, bouton aussi dans la barre du bas, règles de blocage testées ; décisions 54 et 55 du cahier).
- **Temps 2, étapes (a) et (b) FAITES et commitées** (`56aec7c3`) : le CV relu et masqué entre dans le message copié (`construireMessageLettreCo`, `_coLettreConstruireMessage`), plus de « Copier mon CV », bouton facultatif « Copier de nouveau le message complet ». `npm test` 1919 verts, test navigateur fait.
- **Lire d'abord** : l'entrée du 23/10/2026 en tête de la partie 0 de `docs/ETAT_DES_CHANTIERS.md`, puis les décisions 45 à 53 de `docs/CHANTIER_LETTRE_CV_DANS_LE_PROMPT_2026-10-23.md` ; pour l'étape (c) : `docs/CHANTIER_OBJECTIF_OFFRE_SPONTANEE_CLARIFIE_2026-10-23.md` et la maquette validée `docs/MAQUETTE_OBJECTIF_OFFRE_SPONTANEE_2026-10-23.html`.
- Rien n'est poussé ; ne jamais `git push` sans demande de Denis ; jamais `git add -A`.

## Prochaines étapes, dans l'ordre

1. `[effort : haut]` **(c) TERMINÉE** (voir ci-dessus). Prochaine étape : **(d)**.
2. ~~`[effort : moyen]` **(d)**~~ FAIT le 24/10/2026 (décision 61). (e) et (f) FAITS aussi le 24/10/2026 (décision 62). Prochaine étape : **(g)** (effort haut), puis le temps 3 (le bloc « À l'attention de » est nécessaire pour que le nom du destinataire s'écrive quelque part). `analyserReponseIALettre` (`js/app.js`, vers la ligne 35128) : refuser une lettre sans texte (JSON dont `versions` est vide, constaté à l'essai du 24/10). Vérifier aussi qu'elle tolère le texte après le bloc JSON (question finale sur l'e-mail).
3. `[effort : bas]` **(e)** phrase d'aide sur le mode vocal. **(f)** profil : civilité seule en formule d'appel.
4. ~~`[effort : haut]` **(g)**~~ FAIT le 24/10/2026 (décision 64) : panneau « Vos appuis ». Prochaine étape : le temps 3. (Ancien énoncé : panneau « Vos appuis » : lettre de recommandation (dépôt masqué comme le CV, rôle de l'auteur sans le nom) ; le prompt attend des sections « LETTRE DE RECOMMANDATION (relue et masquée par la personne), de la part de : [rôle] » après le CV.)
5. **EN COURS : maquette de l'écran de la lettre à faire valider par Denis (`docs/MAQUETTE_LETTRE_APERCU_PARCOURS_2026-10-24.html`, décision 68), puis la mettre en place (aperçu collé et entier, « Valider la lettre » dans la barre du bas, Exporter verrouillé, entretien après récupération, en-tête avec code postal sans rue, choix de service).** `[effort : haut]` **Temps 3** (essai de faisabilité du PDF fait, décision 66 ; **étape 1, bloc du destinataire, FAITE le 24/10/2026, décision 67** ; reste dans l'ordre : compteur de mots et phrases proches `[effort : moyen]`, bouton « Mise en page » à mesure réelle `[effort : haut]`, fenêtre PDF et jointure des lettres de recommandation `[effort : haut]`) : panneau « La mise en page » de la lettre (bouton de mise en page, bloc destinataire et « À l'attention de », nombre de mots avec message de rallonge, repérage des phrases quasi identiques avec bouton « supprimer cette phrase », lettre de recommandation jointe au PDF, dossier en un seul PDF).
6. **Décisions de Denis à ne pas oublier** : option « ne pas nommer les anciens employeurs » dans l'écran « Préparer » (le prompt applique déjà « au plus une fois ») ; contrôle de lisibilité du CV relu et expérience de la « fiche de matière » écrite à la main avant tout second prompt (décision 52) ; protection des prompts écartée ; pas de second passage obligatoire par l'assistant.

## Règles de travail rappelées

- Mode A pour (c), (g) et le temps 3 ; un commit par sous-étape après `npm test` et test navigateur.
- Denis ne peut pas juger la faisabilité technique : dire franchement ce qui est simple, risqué, ou impossible.
- Réponses courtes ; une décision à la fois ; Denis est souvent fatigué après de longues séances : une seule recommandation.
- Les essais de prompt se font par Denis dans un assistant externe (aucun coût Claude) ; pour mesurer, utiliser le script de mesure.
- Attention aux apostrophes et aux accents dans les scripts de remplacement : écrire le script avec l'outil d'écriture de fichier, pas dans un bloc shell.
