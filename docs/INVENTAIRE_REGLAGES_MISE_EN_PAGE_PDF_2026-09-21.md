# Inventaire zéro régression : réglages de mise en page du CV (PDF), refonte du 2026-09-21

> Généré depuis `modules/cv-mise-en-page/reglagesMiseEnPage.js` (`REGLAGES_MISE_EN_PAGE_CHAMPS`, **67 champs**). Règle de Denis (`TRAVAILLER_AVEC_DENIS.md`) : chaque réglage est **GARDÉ / DÉPLACÉ / FUSIONNÉ / ENRICHI**, **aucun « RETIRÉ » sans ligne validée par Denis**. Ce tableau est une **proposition** à statuer ligne par ligne AVANT le code (phase 1 du plan, `docs/CHANTIER_REFONTE_MISE_EN_PAGE_PDF_2026-09-21.md`).
>
> Colonnes : Word = le réglage existe aussi côté Word. Statut : ⚠ À AJOUTER = **fonction existante absente de la maquette** (risque de régression fonctionnelle). 37 lignes sur 67 demandaient une décision à l'origine. **Inventaire entièrement statué le 2026-09-22** (Denis a validé les recommandations de Claude, groupées par catégorie - voir `docs/CHANTIER_REFONTE_MISE_EN_PAGE_PDF_2026-09-21.md` § 5 sexies pour le détail) : 4 lignes obsolètes corrigées (8, 13, 46, 47 - le réglage existait déjà ou la ligne était périmée), 4 lignes construites (22, 44, 50, 51), 2 RETIRÉ confirmés par écrit (10, 11), 5 GARDÉ via les modèles créatifs déjà existants (12, 26, 32, 40, 49), 3 HORS PÉRIMÈTRE (63-65, panneau Projet XXL séparé, dette B.7 déjà connue), le reste FUSIONNÉ/REMPLACÉ/DIFFÉRÉ selon le cas. **Une seule ligne reste ouverte** (48, `bandeauCompetencesCles`), volontairement rattachée à la décision bloquante Q123 déjà listée au § 5 du cahier plutôt que tranchée seule.

## Fonctions hors modèle canonique, à ne pas perdre non plus

- **Annuler / Refaire** (`_htmlAnnulerRefaireMiseEnPage`, `_mepPileUndo` / `_mepPileRedo`) : absents de la maquette. À ajouter.
- **Annuler le dernier tirage** (dé) : à conserver (lié au dé).
- **Couleur d'entreprise détectée** (`_htmlBoutonAccentEntreprise`) : à ajouter.
- **Pipette** (prélever une couleur) : en plein écran dans la maquette.
- **Modifier le texte** (édition directe) : en plein écran dans la maquette.
- **Mini-barre par rubrique** (taille, police, couleur des pastilles, couleur / gras / italique du nom, métier, accroche) : la maquette n'a que taille + interligne.
- **Glisser-déposer des rubriques** (ordre) et de l'en-tête : en plein écran (existant, conservé).
- **Retour au modèle de départ** : conservé.
- **Sauvegarde des réglages** (`dossier.pdfReglages`) : à conserver (retrouver sa mise en page à la reprise).
- **Niveaux Simple / Je débute / Je veux tout régler** : décision en attente (voir cahier de chantier, § 5).

## Tableau

| # | Champ | Type | Section actuelle | Word | Valeurs | Statut proposé | Où dans la maquette / remarque |
|---|---|---|---|---|---|---|---|
| 1 | `format` | enum | page | oui | a4-detaille / a4-essentiel / a4-integral / a5-portrait / a5-paysage | GARDÉ | Hors panneau : carte « Le format » (Vos documents). A5 = hors périmètre (phase Word / A5). |
| 2 | `colonnes` | enum | page | oui | 1 / 2 | GARDÉ | Option rapide « Deux colonnes » (1 ou 2). Les dispositions A / B et le CV à 1 colonne s'appuient dessus (C25, C26). |
| 3 | `taille` | nombre | page | partiel |  | GARDÉ | « Mise en page et texte » : Taille du texte. La carte « Mise en page » l'ajuste (plancher 10). |
| 4 | `densite` | enum | page | oui | aere / normal / compact | **[Tranché 2026-09-22]** FUSIONNÉ | Recoupe « Espacement » (`interligne`) et « Réduire les espaces » : une seule notion, pas de réglage séparé. |
| 5 | `interligne` | enum | page | oui | serre / normal / aere | GARDÉ + ENRICHI | « Espacement » (Serré / Normal / Aéré) + interligne PAR RUBRIQUE en plein écran (C49). |
| 6 | `espacementParas` | enum | page | oui | serre / normal / large | **[Tranché 2026-09-22]** FUSIONNÉ | Couvert par « Réduire les espaces » et l'interligne, pas de réglage séparé. |
| 7 | `marges` | enum | page | oui | etroites / normales / larges | GARDÉ (valeurs changées) | « Mise en page et texte » : Marges 8 / 10 / 14 mm (C30) au lieu d'étroites / normales / larges. |
| 8 | `alignement` | enum | page | oui | gauche / justifie | **[Ligne obsolète, 2026-09-22]** GARDÉ | Déjà présent (pas absent) : « Avancé : texte justifié » (`oJustif`), « Réglages avancés ». |
| 9 | `pages` | enum | page | partiel | 1page / 2pages | REMPLACÉ ? | Remplacé par « Niveau de détail : Automatique » + carte « Mise en page » (C45). À confirmer par écrit. |
| 10 | `colonnesInversees` | bool | page | oui |  | **[Confirmé par écrit 2026-09-22]** RETIRÉ (décision C14/C25) | Colonnes figées (droite = expériences). |
| 11 | `largeurColonneGauche` | nombre | page | non |  | **[Confirmé par écrit 2026-09-22]** RETIRÉ (décision C25/Q95) | Largeur figée. |
| 12 | `formeColonnes` | enum | page | non | rectangle / diagonale | **[Tranché 2026-09-22]** GARDÉ via modèles | Confirmé dans le code (`cvPdfPanneauReglages.js`) : valeur figée par modèle créatif (`CREATIF_MODELES_XXL`), jamais un réglage séparé. Choisir un modèle dans la galerie le fixe. |
| 13 | `separateurColonnes` | bool | page | oui |  | **[Ligne obsolète, 2026-09-22]** GARDÉ | Déjà présent (pas absent) : « Avancé : trait entre les colonnes » (`oSepcol`), « Réglages avancés », visible en 2 colonnes. |
| 14 | `separateurCouleur` | hex | page | oui |  | **[Tranché 2026-09-22]** DIFFÉRÉ (priorité basse) | Trait entre colonnes (`separateurColonnes`, ligne 13) déjà présent, utilise la couleur du CV ; couleur du trait personnalisable séparément jugée mineure, pas construite maintenant. |
| 15 | `fondColonnesA5` | enum | page | non | droite / gauche / lesDeux / milieu / aucun | A5 | Hors périmètre A4. |
| 16 | `enteteInverseeA5` | bool | page | non |  | A5 | Hors périmètre A4. |
| 17 | `remplirPageA5` | bool | page | non |  | A5 | Hors périmètre A4. |
| 18 | `echelleA5` | nombre | page | non |  | A5 | Hors périmètre A4. |
| 19 | `accent` | hex | couleurs | oui |  | GARDÉ | « Couleurs » (5 pastilles + roue « Personnalisée » + pipette en plein écran). La couleur choisie l'emporte sur un modèle (C46, Q143). |
| 20 | `accentClair` | hex | couleurs | non |  | DÉRIVÉ | Calculé à partir de la couleur choisie (tons pâles du Sobre). |
| 21 | `nuance` | nombre | couleurs | oui |  | **[Tranché 2026-09-22]** RETIRÉ | Remplacé par la roue « Personnalisée » (choix libre de la couleur), pas de réglage de nuance séparé. |
| 22 | `couleurEntrepriseActive` | bool | couleurs | oui |  | **[FAIT 2026-09-22]** GARDÉ + ENRICHI | Ajouté dans « Couleurs » : bouton actif et cliquable si l'assistant a capté la couleur (`couleurEntrepriseSuggeree`, déjà appliquée automatiquement côté code réel), désactivé avec message en clair sinon (« Couleurs de l'entreprise non captées »), jamais une simple infobulle. |
| 23 | `fondColonnes` | enum | couleurs | oui | aucun / gauche / droite / lesDeux | **[Tranché 2026-09-22]** GARDÉ (partiel) | « Fond de la colonne » couvre déjà Aucun / Gauche / Droite (testé). Option « les deux » différée (priorité basse). |
| 24 | `fondColonnesEffet` | enum | couleurs | oui | fondSeul / titres | **[Tranché 2026-09-22]** DIFFÉRÉ (priorité basse) | Jugé mineur, pas construit maintenant. |
| 25 | `fondColonnePleineHauteur` | bool | couleurs | oui |  | **[Tranché 2026-09-22]** GARDÉ (comportement par défaut) | Déjà tranché par C30 (colonne colorée jusqu'en bas de page) : comportement fixe, jamais un interrupteur à part. |
| 26 | `degradeColonnes` | enum | couleurs | partiel | fonce-clair / clair-fonce / uni | **[Tranché 2026-09-22]** GARDÉ via modèles | Confirmé dans le code : valeur figée par modèle créatif, jamais un réglage séparé. Le simple case à cocher « Dégradé » de la maquette (`oDegrade`) reste le seul réglage manuel (on/off), cohérent. |
| 27 | `texteFondColonnes` | enum | couleurs | oui | blanc / noir | DÉRIVÉ | Blanc / noir automatique selon la luminance. |
| 28 | `couleurFondCompetences` | hex | couleurs | partiel |  | **[Tranché 2026-09-22]** DIFFÉRÉ (priorité basse) | Couleur des pastilles distincte de la couleur principale du CV : jugé mineur, pas construit maintenant. |
| 29 | `couleurTextePuces` | hex | couleurs | non |  | **[Tranché 2026-09-22]** DIFFÉRÉ (priorité basse) | Idem, même remarque. |
| 30 | `bandeauEnTete` | bool | haut | oui |  | GARDÉ (via modèles) | Modèles « Bandeau entier » / « Bandeau pâle ». |
| 31 | `formeEnTete` | enum | haut | non | rectangle / diagonale | GARDÉ (via modèles) | rectangle / diagonale = « Bandeau entier » / « Bandeau diagonal » (C42). |
| 32 | `degradeBandeau` | enum | haut | partiel | fonce-clair / clair-fonce / uni | **[Tranché 2026-09-22]** GARDÉ via modèles | Confirmé dans le code : valeur figée par modèle créatif, même principe que `degradeColonnes` ci-dessus. |
| 33 | `bandeauDisponibilite` | bool | haut | oui |  | **[Tranché 2026-09-22]** DIFFÉRÉ (priorité basse) | Bandeau de disponibilité : jugé mineur, pas construit maintenant. |
| 34 | `dispositionEntete` | enum | haut | non | 3colonnes / 2colonnes | **[Tranché 2026-09-22]** GARDÉ (automatique) | Déjà couvert : le titre long bascule automatiquement en 2 colonnes, pas besoin d'un réglage manuel séparé. |
| 35 | `anneauPhoto` | bool | haut | oui |  | **[Tranché 2026-09-22]** RETIRÉ | Photo non encouragée sur le CV pour ce public (déjà orienté par Q92/Q140). |
| 36 | `positionLibreEntete` | bool | haut | non |  | GARDÉ | Plein écran : « Un bloc de l'en-tête » (déplacer, agrandir). |
| 37 | `largeurAccrocheLibre` | nombre | haut | non |  | GARDÉ | Plein écran (en-tête libre). |
| 38 | `largeurMetierLibre` | nombre | haut | non |  | GARDÉ | Plein écran (en-tête libre). |
| 39 | `police` | enum | texte | partiel | segoe / georgia / verdana / garamond / arial / calibri / tahoma / trebuchet / times / palatino | GARDÉ + FIXÉ | Police fixe par défaut (Arial recommandée, C4/Q6) ; choix possible dans « Mise en page et texte ». |
| 40 | `styleTitres` | enum | texte | partiel | sans-decor / souligne / bandeau / pastille | **[Tranché 2026-09-22]** GARDÉ via modèles | Confirmé dans le code : valeur figée par modèle créatif (ex. « Titres à pictogrammes » = pastille, Sobre = souligné). |
| 41 | `lectureGuidee` | bool | texte | oui |  | **[Tranché 2026-09-22]** DIFFÉRÉ (priorité basse) | Usage réel incertain, jugé mineur, pas construit maintenant. |
| 42 | `styleCompetences` | enum | texte | partiel | pastille / rectangle / texte-seul | GARDÉ + ENRICHI | Option rapide « Compétences en pastilles » + « Mise en page et texte » (pastille / rectangle / texte). |
| 43 | `icones` | bool | texte | oui |  | GARDÉ | Option rapide « Icônes sur les rubriques » (câblée). |
| 44 | `iconesCoordonnees` | bool | texte | oui |  | **[FAIT 2026-09-22]** GARDÉ | Ajouté dans « Options rapides », à côté de « Icônes sur les rubriques » (même famille visuelle que côté code réel). Mêmes tracés SVG que `_PDF_ICONES_SVG`, remplace les petits carrés (`icoCoord`) quand actif, jamais les deux cumulés. |
| 45 | `styleBordures` | enum | texte | non | fine / epaisse | **[Tranché 2026-09-22]** DIFFÉRÉ (priorité basse) | Jugé mineur, pas construit maintenant. |
| 46 | `styleProfessionnel` | enum | texte | oui | epure / condense | **[Ligne obsolète, 2026-09-22]** GARDÉ | Déjà présent et testé (pas absent, contrairement à ce que cette ligne disait) : « Style des missions » (Épurées/Condensées), `segStyleExp`, dans « Vos expériences et leurs missions ». |
| 47 | `stylePersonnel` | enum | texte | oui | epure / condense | RETIRÉ (conséquence de C7) | La rubrique « Expérience personnelle » à part n'existe plus (C7 : fusionnée dans « Expériences professionnelles », étiquette neutre) ; son style suit désormais `styleProfessionnel` comme toute autre expérience. |
| 48 | `bandeauCompetencesCles` | bool | texte | non |  | **ENCORE OUVERT, non tranché ici** | Lié à Q123 (§ 5 du cahier, « Modes de présentation », décision bloquante déjà listée), volontairement pas résolu au fil de l'eau, à trancher avec cette question plus large. |
| 49 | `coinsArrondis` | bool | texte | non |  | **[Tranché 2026-09-22]** GARDÉ via modèles | Confirmé dans le code : valeur figée par modèle créatif. |
| 50 | `souligner` | map | texte | partiel | liste | GARDÉ + ENRICHI | Dates et Entreprise l'avaient déjà (« Style des lignes d'expérience »). **[AJOUTÉ 2026-09-22]** Formations (titre) : bouton S ajouté à côté de G et I, même principe. Lieu : géré séparément (« Style du lieu » Normal/Italique/Gris, pas ce système de boutons). Le gras reste fixé au poste et au diplôme (C27). |
| 51 | `italique` | map | texte | partiel | liste | GARDÉ | Déjà présent : Dates, Entreprise et Formations (titre) ont chacun leur bouton I. Lieu : via « Style du lieu » (Normal/Italique/Gris), pas ce système de boutons. |
| 52 | `ordreExperiences` | enum | affiche | oui | pertinence / recentes / anciennes / poste-az | GARDÉ + ENRICHI | « Ordre » : du plus récent / mon ordre / du plus pertinent (C13, C19). |
| 53 | `ordreDatesPoste` | enum | affiche | oui | dates / poste | GARDÉ + ENRICHI | « Position des dates » : à droite / sous / avant le poste. |
| 54 | `accrocheItalique` | bool | affiche | oui |  | **[Tranché 2026-09-22]** DIFFÉRÉ (priorité basse) | Jugé mineur, pas construit maintenant. |
| 55 | `sansAccroche` | bool | affiche | oui |  | **[Tranché 2026-09-22]** GARDÉ | Déjà présent côté écran des réglages (« Sans accroche », § 4 du cahier) ; ce champ du panneau historique fait double emploi, sans risque de perte. |
| 56 | `lettreJointe` | bool | affiche | oui |  | **[Tranché 2026-09-22]** DIFFÉRÉ (priorité basse) | Joindre la lettre de motivation au CV : hors du périmètre mise en page, jugé mineur ici, pas construit maintenant. |
| 57 | `regroupement` | bool | affiche | oui |  | **[Tranché 2026-09-22]** REMPLACÉ | Remplacé par le nouveau mécanisme `regroupementExperiences` (experiencesRetenues + groupes par filière, cahier phase 3.8/3.7), plus riche que ce simple booléen. |
| 58 | `formatExperiences` | enum | affiche | non | standard / ameliore | **[Tranché 2026-09-22]** FUSIONNÉ | Recoupe « Position des dates », pas de réglage séparé. |
| 59 | `formationsMisesEnAvant` | bool | affiche | partiel |  | GARDÉ + ENRICHI | « Afficher les missions de la formation » (C20), jamais tiré au sort. |
| 60 | `veuves` | bool | affiche | oui |  | GARDÉ | Technique (orphelines / veuves), hors panneau. |
| 61 | `rubriques` | map | affiche | oui | liste | GARDÉ + ENRICHI | « Éléments supplémentaires > Rubriques à afficher » (Logiciels, Langues, Certifications ; à compléter : loisirs, engagements, permis). |
| 62 | `ordreRubriques` | liste | affiche | oui |  | GARDÉ | « Personnaliser » (▲▼) en 1 colonne ; figé en 2 colonnes (C25). |
| 63 | `blocMisEnAvant` | enum | affiche | oui | competences / formations / langues /  | **[Vérifié 2026-09-22] HORS PÉRIMÈTRE** | PAS du code mort : mécanisme réel et actif, mais du panneau **« Projet XXL »** (`modules/cv-composeur/composeurComposition.js`/`composeurTheme.js`, boutons `js/app.js` ~36068), un panneau Word **séparé**, déjà identifié comme dette à part (`BRIQUES_COMMUNES.md`, **B.7**, « séance dédiée à prévoir »). Ne pas trancher ici au fil de l'eau : la question (ce panneau fusionne-t-il avec la nouvelle maquette, reste-t-il séparé, ou est-il retiré) mérite sa propre séance Mode A, comme déjà décidé. |
| 64 | `blocMisEnAvantGauche` | enum | affiche | oui | competences / formations / langues /  | HORS PÉRIMÈTRE (voir ligne 63) | Idem, même panneau Projet XXL, même dette B.7. |
| 65 | `blocMisEnAvantDroite` | enum | affiche | oui | competences / formations / langues /  | HORS PÉRIMÈTRE (voir ligne 63) | Idem, même panneau Projet XXL, même dette B.7. |
| 66 | `allure` | enum | simple | oui | sobre / defaut / creatif | GARDÉ | « Allure générale » (Sobre / Standard / Créatif) + modèles. |
| 67 | `formations` | enum | simple | oui | complet / optimise | GARDÉ | « Formations > Complet / Optimisé » (Q108). |
