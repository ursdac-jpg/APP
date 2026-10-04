# Analyse : perte d'informations entre la saisie et le CV (2026-09-26)

Point signalé par Denis : des expériences ajoutées à la main (après le premier aller-retour avec l'assistant, parcours « Reformuler et présenter mon CV ») ne remontent jamais jusqu'au CV (PDF et Word). Questions : (1) seulement les expériences, ou plus grave ? (2) le code sait-il capter et rattacher dates et lieux (expériences, formations, diplômes, certifications) ? (3) dates dans le titre ?

## 1. Reproduction et cause (vérifiées dans le navigateur)
Dossier de test : 6 expériences saisies ; l'assistant a produit ses recommandations sur 3 d'entre elles (`dossier.ia.cv.recommandations.experiencesAMettreEnAvant`) ; puis ajout à la main d'une 7e expérience (+ une formation, une langue, une certification, un loisir, un logiciel, un engagement, avec centre et lieu).
- **L'expérience ajoutée à la main disparaît** (aussi son lieu). Même chose pour les 3 expériences du dossier qui n'étaient pas dans la liste (6 saisies, 3 affichées).
- **Cause** : `appliquerMoteurDecisionCV` (js/app.js ~33648) : dès que `experiencesAMettreEnAvant` n'est pas vide, `objetDecide.experiences` = UNIQUEMENT les expériences de cette liste (choix voulu à l'origine : « Écran 3 : la personne a passé en revue TOUTES ses expériences, décocher = exclure »). Une expérience créée APRÈS cet écran n'y figure pas : elle est traitée comme « décochée » et exclue en silence, sans message. La carte du panneau annonce même « Toutes vos expériences sont affichées ».
- Le défaut est en amont de tous les rendus : PDF, Word, A5 lisent le même objet (`construireDonneesPdfCV`, `composeurComposer`).

## 2. Étendue : seulement les expériences ?
Dans ce scénario : OUI, seules les expériences sont exclues. Formation, langue, certification, loisir, logiciel, engagement ajoutés à la main arrivent dans le CV PDF. Mais d'autres pertes silencieuses existent :
- **Plafonds du composeur** (`COMPOSEUR_CAPACITES_A4_DETAILLE_CV`, composeurComposition.js) : formations 3, langues 5, loisirs 5, engagements 3, expériences 15... La 6e formation ajoutée à la main n'est pas retenue par le composeur (donc absente du Word) ; le PDF montre maintenant toutes les formations (correctif du 2026-09-26) mais pas encore les autres rubriques.
- **Masquage d'une rubrique entière par l'assistant** (`rubriquesMasquables`) : possible pour les expériences, formations, certifications, engagements (langues et loisirs sont protégés) : aucune trace visible pour la personne.
- **Mois perdus à l'import** : `normaliserDateVersAnnee` réduit toute date d'expérience à l'année (« Sept. 2024 » devient « 2024 »).
- **Dates et lieux des certifications** : une certification est un simple texte (pas de champ date, organisme ou lieu).
- **Dates dans le titre** : aucun nettoyage : si l'assistant laisse « Vendeur (2013-2018) » dans `poste`, la date reste dans le titre et les champs dates restent vides (le prompt demande de recopier les dates mais rien ne le vérifie).
- Formations : `annee` seulement (pas de début / fin) ; centre et lieu ajoutés le 2026-09-25.

## 3. À confirmer avec Denis
Le parcours exact suivi (« Reformuler » : écran « Choisissez ce que l'assistant propose » passé ? ajout par « Ajouter une expérience » ou par l'import ?). Le mécanisme trouvé explique le symptôme mais le parcours réel doit être rejoué.

## 4. Corrections proposées (décision de Denis attendue)
- **C1 (critique)** : toute expérience du dossier qui n'était pas dans la liste examinée à l'écran de choix (nouvelle) est AJOUTÉE au CV ; seules les expériences explicitement décochées restent exclues. Pour cela l'écran de choix enregistre la liste des expériences examinées ; pour les dossiers déjà enregistrés sans cette liste : message visible « N expériences de votre dossier ne sont pas sur le CV : [les voir] [les ajouter] ». Corriger aussi la phrase « Toutes vos expériences sont affichées ».
- **C2** : « autant que je veux » pour TOUTES les rubriques du PDF (comme les formations), plafonds conservés seulement pour les formats courts (Essentiel, A5) ; message quand une rubrique est tronquée.
- **C3** : message visible quand l'assistant masque une rubrique + case « Afficher » dans « Rubriques à afficher ».
- **C4 (import)** : nettoyage des dates placées dans le titre (formes « (2013-2018) », « 2013 - 2018 », « de 2013 à 2018 ») vers les champs dates ; conservation du mois d'origine à côté de l'année ; certifications avec année / organisme / lieu (champs facultatifs).
- **C5 (vérification)** : suite de test « conservation des informations » (marqueurs dans chaque champ de chaque rubrique, contrôlés dans le PDF, le Word, l'A5) ; le moteur de décision est dans js/app.js, non chargé par les tests Node : le sortir dans un module testable.
