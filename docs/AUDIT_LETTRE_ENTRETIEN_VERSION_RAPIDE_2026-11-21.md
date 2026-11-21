# Audit de « Lettre et entretien en version rapide » (2026-11-21)

Mode B, effort moyen. Profil inventé « Camille Martin ». Réponses de l'assistant SIMULÉES (JSON collé).

## Joué
- Les deux parcours (« Ma lettre de motivation rapide », « Ma fiche de préparation à l'entretien ») × les sept objectifs (offre, spontanée, reconversion, stage, immersion, alternance, formation) : 14 parcours, du dépôt du CV à l'export.
- Étapes : dépôt, choix du parcours, objectif, lecture du CV par l'assistant, « Vos informations », « Votre profil », « Adaptation au métier », choix de l'assistant, collage de la réponse, mise en page, export.
- Lettre : deux versions, choix, « Modifier le texte », formats A4 et mail, gabarits, couleurs, export PDF, Word, copie. Fiche : couleurs, aperçu, export.

## Résultat
Aucun blocage. Les 14 messages contiennent l'objectif et ses détails (entreprise, site, offre, civilité et nom du recruteur, structure, durée, dates, poste ou formation visé(e)), le profil et les compétences. Message de la lettre : environ 28 000 caractères ; de la fiche : environ 21 700.

## Défaut corrigé (important)
**Savoirs qui n'étaient pas ceux de la personne.** En stage, immersion, alternance ou formation sans métier précis (`dossier.metierCible` vide, le poste vivant dans `dossier.stage`, `alternance`, etc.), `obtenirSavoirs` (js/app.js) ajoutait les savoirs des deux métiers « devinés » : pour un agent d'accueil en mairie, « Réglementation du transport », « Yield management », « Prestations hôtelières ». Ils partaient chez l'assistant sous « Savoirs » et pouvaient finir sur le CV ou la lettre. Même défaut que le « Défaut B » du 29/09 (corrigé seulement pour un métier ou un secteur visé). Corrigé : pour ces quatre objectifs, on lit la fiche du poste visé quand elle existe, sinon aucun savoir deviné. Vérifié sur stage, alternance, formation. Ligne ajoutée à « Problèmes corrigés ». Touche aussi le CV créé à la main et les listes « compétences repérées » : `npm test` vert (3319).

## Notés, non corrigés
- Dans le message de la fiche d'entretien, la ligne « Personne en charge du recrutement » reprend la consigne « Pour une lettre de motivation, utilisez directement... » : sans objet pour une fiche, sans conséquence.
- Le test de reprise du protocole passe par l'adresse et non par la tuile (voir l'audit de « Reprendre mon CV »).

## Non vérifié
375 px et mode sombre, dépôt par fichier, vraies réponses de l'assistant.
