# Messages à coller en local (apports de Denis, 26/10/2026), version du soir

Le travail est fait **dans le dépôt, sur la branche `claude/fervent-ritchie-hmq5cn`**. En local, il y a deux messages : le premier fusionne la branche dans `master`, le second reprend le travail.

---

## Message 1 : fusionner la branche dans master (sans rien pousser)

```
/app Fusion locale d'une branche de travail dans master, sans rien pousser.

Contexte : une session cloud a travaillé sur la branche claude/fervent-ritchie-hmq5cn du dépôt ursdac-jpg/APP (tri des documents et photos apportés par Denis). Elle ajoute : des fichiers de documentation dans docs/, 16 lignes à la fin de outils/sas/lieux.sas.txt (non lu par l'application), et 12 fiches dans data/lexique.js (une ligne ajoutée dans docs/JOURNAL_DES_CHANGEMENTS.md). Rien d'autre du code n'est modifié.

Étapes, dans cet ordre, en t'arrêtant et en me prévenant à la moindre difficulté (jamais de mode tunnel) :
1. git status et git log -5 : dis-moi si mon dossier local a des modifications non enregistrées. Si oui, arrête-toi et demande-moi quoi faire.
2. git fetch origin claude/fervent-ritchie-hmq5cn
3. Montre-moi git diff --stat master origin/claude/fervent-ritchie-hmq5cn : je dois voir des fichiers dans docs/, outils/sas/lieux.sas.txt et data/lexique.js. Si un autre fichier apparaît, arrête-toi.
4. Si mon master local a des commits que la branche n'a pas, dis-le-moi avant de fusionner. Conflits possibles : outils/sas/lieux.sas.txt et data/lexique.js. En cas de conflit, ne choisis jamais un côté à ma place : garde les deux, montre-moi le résultat.
5. git merge origin/claude/fervent-ritchie-hmq5cn (jamais de force, jamais de réécriture d'historique).
6. npm test, puis node scripts/checkLexique.js : tout doit être vert (0 erreur, 0 avertissement). Un échec est connu sur la machine cloud (tests/veillePont.test.js, chemin Windows) ; chez moi il doit passer.
7. Ne pousse RIEN. Dis-moi en une ligne le résultat et comment vérifier moi-même en dix secondes (taper « estime de soi » dans la barre de l'accueil).
Mode C, [effort : bas]. Attends mon réglage d'effort et mon « démarre ».
```

---

## Message 2 : reprendre le travail (après la fusion)

```
/app Reprise des apports de Denis du 26/10/2026 (documents et photos pris en formation et en stage).

LIS D'ABORD, dans l'ordre :
1. docs/DOSSIER_MATIERE_APPORTS_2026-10-26.md, en commençant par la section 0bis (décisions du 26/10 soir : ce qui est gardé, écarté, corrigé après vérification en ligne). Elle l'emporte sur les cases plus bas.
2. docs/DOCTRINE_LEXIQUE.md.

RÈGLES DE DENIS À RESPECTER :
- Ne garder que du concret, cohérent, à valeur ajoutée. Jamais de conseil, jamais de « travail à faire », jamais de consigne. Si une information s'approche d'un conseil, on ne la garde pas.
- Jamais de nom de personne. Pour une structure : son nom, son téléphone, son mail.
- Les coordonnées passent par le sas (outils/sas/lieux.sas.txt), colonne date vide. Rien n'est publié avant que Denis ait appelé ou ouvert la page, puis cliqué « C'est bon ».
- Jamais de chiffre (montant, plafond, durée, pourcentage, âge) dans le texte d'une fiche : ils vont dans un bloc daté vérifié à la source officielle.
- Ne reprends ni les textes ni les schémas des auteurs. Ne reprends pas les questions de la grille d'Alèthéia.
- Respecte le protocole de CLAUDE.md : annonce mode et effort, attends mon réglage et mon « démarre », un commit par sous-étape, npm test avant, ligne dans docs/JOURNAL_DES_CHANGEMENTS.md, aucun push sans ma demande.

CE QUI EST DÉJÀ FAIT (sur la branche, à ne pas refaire) :
- 12 fiches dans data/lexique.js : estime de soi, confiance en soi, affirmation de soi, « estime, confiance ou affirmation ? », croyance limitante, message en « je », méthode DESC, critique ou reproche, styles de communication, coach, CESF, CACES. Contrôle du Lexique : 0 erreur, 0 avertissement.
- 16 lignes de structures de la Dordogne et nationales dans outils/sas/lieux.sas.txt, avec la copie docs/LIGNES_SAS_APPORTS_2026-10-26.txt.

MODE B, [effort : moyen]. TÂCHES, dans cet ordre :
A. [effort : bas] Vérifier dans le navigateur les 12 fiches : taper « estime de soi », « DESC », « coach », « CACES » dans la barre de l'accueil et dans celle du Lexique ; lire chaque fiche en clair et en mode sombre ; me dire en une ligne ce qui ne va pas. Je relis les textes et je corrige ce qui me déplaît.
B. [effort : bas] Sas : vérifier que les 16 lignes sont dans outils/sas/lieux.sas.txt (chercher par identifiant, sans doublon), lancer npm test, me dire ce qu'il reste à appeler.
C. [effort : bas] Fiches publiées à compléter, par le sas ou la procédure habituelle avec la date « j'ai appelé » : mail associationbase@gmail.com pour asso-base-24 et mention de Part'ÂGE ; mail association@croixmarine24.fr pour asso-croix-marine-24 ; Atelier budgétaire de Périgueux (mail contact24@latelierbudgetaire.org, 5 rue Sirey) ; Adie Saint-Astier (l'adresse « 8 rue Amiral Courbet » n'a pas été retrouvée en ligne : à confirmer par un appel). Ne pas publier le numéro 09 69 36 39 20 de L'Appui (non retrouvé) ni le mail apc@parcours-confiance.fr (non retrouvé).
D. [effort : moyen] Les quatre dispositifs de la Mission Locale du Bergeracois (« Mieux dans ma tête, mieux dans mon job », Pair'mission, « Raconte-moi ton projet », Terres Equi'Solidaires) : NE crée PAS quatre lignes. Lis la page officielle missionlocaledubergeracois.com pour confirmer qui porte chacun, puis propose UNE phrase pour la ligne publiée asso-mission-locale-du-bergeracois-24. La brochure de Terres Equi'Solidaires porte le logo de l'association APES 24 : vérifier le porteur.
E. [effort : moyen] Comprendre le cadre, rayon logement : proposer une fiche « Mobili-Jeune » (aide d'Action Logement au loyer des alternants de moins de trente ans) et une phrase dans la section « à qui s'adresser » sur le service d'accompagnement social d'Action Logement (réservé aux salariés). Lire d'abord la page officielle d'Action Logement ; les montants, plafonds et durées divergent selon les sites : ils vont dans un bloc daté, jamais dans le texte. Compléter aussi budget-microcredit-personnel avec les quatre acteurs du microcrédit.
F. [effort : moyen] Fiche santé et sécurité : ajouter le lien vers mortel-ton-taf.fr (INRS, web-série pour les jeunes salariés, confirmée en ligne). Liste des documents à fournir pour une inscription en intérim (CV, pièce d'identité en cours de validité, carte vitale ou attestation, RIB, attestation d'hébergement si besoin, permis) : proposer où la mettre (rayon « Emploi » ou « Mes documents »).
G. Plus tard, Mode A [effort : haut], seulement si je le demande : les autres mots du Lexique gardés pour la suite (empathie, intelligence émotionnelle, résistance et réactance, alliance de travail, pyramide de Maslow, communication non violente, analyse de pratiques professionnelles).

ÉCARTÉ, NE PAS REPROPOSER : exercices de Mes Repères et du Carnet, phrases types pour l'entretien, listes d'auto-vérification, questionnaires avec scores, « faible ou haute estime de soi », cercle de l'estime de soi, prêt accession, accession abordable, prêts travaux d'Action Logement, fiche CISP, pourcentages de communication, planches illustrées, feuille manuscrite de contacts.

À CHAQUE ÉTAPE : dis-moi en une ligne comment vérifier moi-même en dix secondes. Si tu constates une erreur ou un malentendu, inscris-le dans docs/LECONS_A_NE_PAS_REPRODUIRE.md.
```
