# Plan du mode Nuit (écrit le 2026-10-03, juste avant compactage)

**Ce fichier fait foi, pas la conversation.** À lire avec `docs/ETAT_DES_CHANTIERS.md` (section « ÉTAPE 1 DE COMPÉTENCES EN ACTION » et décisions du 2026-10-03), `docs/TRAVAILLER_AVEC_DENIS.md` (section Mode Nuit) et `docs/LECONS_A_NE_PAS_REPRODUIRE.md` (règles 20 à 22).

**Point de départ pour un retour arrière propre** : `master`, commit `995172c4` (« Compétences en action : missions en réserve... »), arbre propre, `npm test` 1226 verts, suite complète des parcours 523 verts, banc des 24 modèles sans différence, **aucun `push`**.

---

## 0. Règles de travail de la nuit (à relire avant CHAQUE sous-tâche)

1. Relire ce fichier (cases cochées) ET `git log -5` : un compactage peut avoir eu lieu sans que je le sache.
2. Une case = un commit, avec chemins explicites (jamais `git add -A`), `npm test` vert avant. Jamais de `push`, aucune commande destructive.
3. **Essais de bout en bout dans le navigateur intégré** : `scripts/parcours/parcours_smoke.js` (page rechargée, **stockage vidé avant**, attendre ~8 s, `eval(await (await fetch('/scripts/parcours/parcours_smoke.js')).text()); window.__fin=null; window.__parcours([...]).then(r=>window.__fin=r)`), lire `window.__fin`). Un défaut corrigé = un essai ajouté. **Jamais un 2e onglet** pendant la suite. **Jamais un réglage factice laissé sur la page** (leçon 22). Suite complète (~35 min) avant le commit final de chaque lot ; banc `scripts/word/banc_b7.js` sur stockage vidé, comparer à `scripts/word/banc_b7_reference.json` (0 différence attendue si le rendu par défaut ne change pas).
4. Français impeccable, jamais de tiret cadratin, jamais « IA » visible, mode sombre pour toute couleur, une seule source de vérité (grep sur tout le dépôt avant de toucher une fonction partagée).
5. Effort de la séance : **moyen minimum, jamais bas** (mode Nuit).
6. **Garde-fou** : une ambiguïté réelle non prévue = s'arrêter sur CETTE tâche, la noter ici dans « Blocages », passer aux tâches claires suivantes. Ne jamais deviner.
7. Mémoire : après chaque lot, mettre à jour `docs/ETAT_DES_CHANTIERS.md` (une ligne) et ce fichier.

---

## 1. Ce qui est TERMINÉ (rien à refaire)

Tout est commité sur `master`. Voir `docs/ETAT_DES_CHANTIERS.md`. Résumé de la séance du 2026-10-03 : intitulés de rubriques modifiables ; dates uniformes ; option Stage (liste, édition, import) ; messages qui citent les intitulés choisis ; carte Organisation du CV uniforme (toutes options visibles, « ? » sur les grisées, plus de parenthèses, « Mêmes puces partout ») ; infobulles « ? » flottantes ; suggestion « trois rubriques sur une ligne » ; « Compétences en action » (étape 1 : contenu, dispositions, missions en réserve, « Changer l'intitulé » sous la case « Afficher ») ; essais de bout en bout fiabilisés.

---

## 2. Lots de la nuit

### LOT N1 : fenêtres d'édition COMPLÈTES (effort moyen) : **APTE AU MODE NUIT**

Décisions toutes tranchées par Denis (maquette `docs/MAQUETTE_EDITION_COMPLETE_2026-10-03.html` validée par « ok » le 2026-10-03) :
- **Formations** : champs Intitulé du diplôme, Niveau, Année, Centre de formation, Lieu, Missions (aujourd'hui seulement titre + missions).
- **Expérience personnelle** : Intitulé, Début, Fin (vide = en cours), Structure ou entreprise, Lieu, Missions.
- **Certifications** : déjà Intitulé, Organisme, Lieu, Date ; ajouter « Missions (facultatif) » (jamais exigées : pas de contenu inventé ; vide = rien d'écrit). Stockage : `dossier.certificationsAvecMissions` (entrées `{ certification: <texte exact>, missions: [...] }`, voir `normaliserDonneesCV.js` ~l.298).
- **Expériences** : déjà complète, ne pas toucher.
- **Portée** : Formations et Expérience personnelle = « pour ce CV seulement » (le dossier d'origine n'est pas modifié), comme aujourd'hui ; le pied de la fenêtre dit « Pour ce CV seulement : votre dossier d'origine n'est pas modifié. »

Mécanisme existant à étendre (grep d'abord, tout le dépôt) : corrections par élément `{ titre, missions }` : `_pdfDefinirTexteFormation` / `_pdfDefinirTexteExpPerso` (`cvPdfPanneauReglages.js` ~l.4671 et 4705, stockés dans `_cvPdfFormationsTexteParItem` / `_cvPdfExpPersoTexteParItem`, réglages `texteParFormation` / `texteParExpPerso`), appelés depuis `js/app.js` ~l.20249 et 20378-20385 ; fenêtres dans `cvPdfCartesMaquette.js` (formations ~l.940-990, expérience personnelle ~l.1109, certifications `_mepChampsCertif` ~l.2400) ; lus par `cvPdfTemplateA4.js` ~l.1094, 1195, 1307 (et le gabarit maquette `cvPdfTemplateMaquette.js` via ces fonctions). Étendre `{ titre, missions }` en `{ titre, missions, niveau, annee, etablissement, lieu }` (et `{ intitule, debut, fin, structure, lieu, missions }` pour l'expérience personnelle), rétro-compatible (un champ absent = valeur du dossier). Le Word lit le rendu : rien à faire côté Word.

- [ ] N1.1 Audit : lire les trois fenêtres et leurs lecteurs, noter les clés exactes (grep sur tout le dépôt).
- [ ] N1.2 Formations : champs ajoutés, enregistrement, rendu PDF (A4 maquette + A4 détaillé), pied « pour ce CV seulement ». Essai : modifier année / centre / lieu / niveau, le CV change, le dossier d'origine NON.
- [ ] N1.3 Expérience personnelle : idem.
- [ ] N1.4 Certifications : « Missions (facultatif) », stockage, rendu (missions seulement si présentes), message « Aucune mission proposée » inchangé quand vide.
- [ ] N1.5 Essais ajoutés au parcours `scripts/parcours/parcours_smoke.js` (un par champ), Word vérifié (`exporterCvWord(dossier).plan` contient les nouvelles valeurs), suite complète, banc, commit.
- [ ] N1.6 Mettre à jour `docs/ETAT_DES_CHANTIERS.md` et ce fichier.

### LOT N2 RÉVISÉ (décision Denis 2026-10-04, option 4) : « Options supplémentaires » : **MAQUETTE VALIDÉE par Denis le 2026-10-04 : APTE AU MODE NUIT**

**Cette section REMPLACE la section N2 d'origine ci-dessous** (déplacer 21 réglages dans les cartes est abandonné : Denis refuse de changer l'ordre, de surcharger ses cartes et de casser leur cohérence).

Décisions de Denis (2026-10-04) :
- Les cartes existantes ne changent pas (ordre et contenu). La carte « Réglages supplémentaires » RESTE, rangée **par carte d'origine** (Organisation du CV, En-tête de CV, Compétences, Expériences professionnelles, Mise en page et texte, Couleurs, Autres rubriques) au lieu des 5 groupes actuels. Les réglages gardent leur apparence, leurs clés et leurs gestionnaires (rien n'est déplacé dans le code des réglages).
- Chaque carte reçoit, tout en bas, un bouton « Options supplémentaires » qui ouvre « Réglages supplémentaires » sur la partie du même nom (ouvre la carte et la partie, défile, fait clignoter une fois) ; chaque partie a « Revenir à la carte ».
- Retirer les 2 boutons « Ouvrir l'Aperçu à taille réelle » (`js/app.js` ~l.18494 partie En-tête, ~l.18579 partie Texte, gestionnaire `data-mep-versgrand` l.19606 : NE PAS le supprimer, il sert aussi à `cvPdfCartesMaquette.js` l.707 « Régler l'en-tête »). Les deux phrases d'explication restent, sans bouton.
- RETIRER les 3 « autres ordres » d'expériences (plus ancien, poste A→Z, poste Z→A) : le sélecteur `data-mep-ordre-autre` (`js/app.js` ~l.18646, `cvPdfCartesMaquette.js` ~l.1931) et l'option « Autre ordre (voir Réglages supplémentaires) » (`cvPdfCartesMaquette.js` ~l.900). **Rétro-compatibilité obligatoire** : un dossier déjà enregistré avec `ordreExperiences` = date-asc, poste-asc ou poste-desc doit continuer à s'afficher sans erreur (grep d'abord tous les lecteurs ; sinon repli sur « pertinence »). Une phrase dit : « L'ordre des expériences se choisit dans la carte Expériences professionnelles. »
- « Regrouper les expériences proches » et « Mise en forme des expériences » restent, dans la partie Expériences, avec un « ? » qui explique ce qu'ils font (texte dans la maquette). **Renommer** « Standard / Amélioré » en « Simple / Mise en valeur » (libellés seulement : les valeurs enregistrées `standard` / `ameliore` ne changent PAS ; grep des libellés dans les tests, `cvPdfOptionsParModele.js`, parcours).
- « Espacement des paragraphes » : vérifier au code si c'est le même réglage que « Espacement » de « Mise en page et texte » ; si oui le retirer de la carte, sinon le garder dans la partie « Mise en page et texte ».
- **Cohérence visuelle (Denis, 2026-10-04) : les nouveaux boutons (« Options supplémentaires », « Revenir à la carte ») réutilisent la classe EXISTANTE `btn-miss` (`css/mise-en-page-maquette.css` l.651), aucun nouveau style : même forme, même taille, même écriture que les autres boutons des panneaux, en mode clair et sombre.**
- **Règle d'interface (Denis, 2026-10-04) : jamais une ligne de texte cliquable, TOUJOURS un vrai bouton** (même aspect que `btn-miss`), partout, y compris « Revenir à la carte ». Au passage du code, tout lien-texte cliquable rencontré dans ces cartes devient un bouton.
- Garde-fou : « Style rapide » ne touche toujours pas ces réglages.

Maquette : `docs/MAQUETTE_OPTIONS_SUPPLEMENTAIRES_2026-10-04.html` (vérifiée dans le navigateur : 7 boutons, 7 parties, saut OK). Effort : bas à moyen.

- [x] N2.R0 Maquette (FAITE et VALIDÉE par Denis le 2026-10-04).
- [ ] N2.R1 Ranger le contenu de `_htmlSecRegSupplementairesMiseEnPage` par carte d'origine (mêmes fonctions de réglage, seulement un autre regroupement ; chaque partie reçoit un id `mepSupp-<carte>`). Un essai : tous les réglages sont encore présents (comptage des 25 moins les retraits) et agissent.
- [ ] N2.R2 Bouton « Options supplémentaires » en bas des 7 cartes + « Revenir à la carte » + saut/ouverture/clignotement ; mode sombre. Essai par bouton (la carte et la bonne partie s'ouvrent).
- [ ] N2.R3 Retirer les 2 boutons « Ouvrir l'Aperçu » (garder les phrases) ; retirer les 3 « autres ordres » avec rétro-compatibilité ; renommer « Simple / Mise en valeur ». Essais correspondants.
- [ ] N2.R4 Vérifier « Espacement des paragraphes » (doublon ou non) et agir en conséquence.
- [ ] N2.R5 Essai « Style rapide ne change aucun des réglages supplémentaires », suite complète, banc 24 modèles (0 différence), ETAT, commit.

### (SECTION D'ORIGINE, REMPLACÉE PAR LA RÉVISION CI-DESSUS) LOT N2 : ménage des doublons de « Réglages supplémentaires » : **NON APTE AU MODE NUIT** (code), **préparation possible** (documents seulement)

Décisions déjà prises (2026-10-03) : un seul lot (pas carte par carte), tableau des 54 réglages (garder / déplacer / fusionner / retirer) + une maquette, Denis valide UNE fois, puis tout est codé. Règles proposées : espaces gardés dans Organisation et dans le plein écran seulement ; polices et ordre des expériences fusionnés en un seul endroit chacun ; « Afficher » des rubriques gardé dans « Autres rubriques » et dans la carte Compétences ; les 3 réglages cachés (poste souligné / italique, regrouper les expériences proches, mise en forme Standard / Amélioré) remontent dans la carte Expériences. **Décision qui manque (bloque le code)** : la validation par Denis du tableau et de la maquette, réglage par réglage (aucun retrait sans elle).

- [x] N2.1 (préparation, sans code, FAIT) Inventaire réel des 54 réglages de la carte (lire `js/app.js` ~l.18709 « Réglages supplémentaires » et le formulaire de l'aperçu `cvPdfPanneauReglages.js`, ids `reg*`) : écrire `docs/INVENTAIRE_REGLAGES_SUPPLEMENTAIRES_2026-10-03.md` (un tableau : réglage, où il vit aussi, recommandation garder / déplacer / fusionner / retirer, risque).
- [x] N2.2 (préparation, sans code, FAIT) Maquette sur le vrai balisage `docs/MAQUETTE_MENAGE_REGLAGES_2026-10-03.html` (cartes avant / après, « Montrer ce qui change »).
- STOP : ne rien coder tant que Denis n'a pas validé le tableau et la maquette.

### LOT N3 : étape 2 de « Compétences en action » (phrases de missions regroupées par l'assistant) : **NON APTE AU MODE NUIT**

Décisions déjà prises : nouveau champ demandé à l'assistant dans `prompts/cv.md` (phrases de missions regroupant plusieurs expériences liées au métier visé, sans doublon, plusieurs au choix, chacune avec ses expériences sources `illustrePar`, jamais de phrase sans mission source dans le profil) ; repli = ce qui est déjà codé (étape 1) ; la liste du panneau propose ces phrases en réserve. **Décisions qui manquent (bloquent)** : (1) le TEXTE exact du prompt, à relire et valider par Denis (CIP) avant activation ; (2) le nom du champ JSON et le nombre de propositions souhaité (suggestion : 8 à 10) ; (3) effort **haut** requis (Denis doit repasser l'effort à haut).

- [x] N3.1 (préparation, sans activer, FAIT) Écrire le brouillon du texte du prompt dans `docs/BROUILLON_PROMPT_MISSIONS_REGROUPEES_2026-10-03.md` (règles de prudence reprises de `prompts/cv.md` point 19, exemple de sortie JSON). Ne PAS modifier `prompts/cv.md`.
- **LOT N3 FAIT le 2026-10-04 (Denis a validé le texte, effort haut).** Prompt : point 20 + champ dans `prompts/cv.md`. Code : lecture/audit/valeur neutre (`js/app.js`), transmission au « Je valide » (**oubli corrigé : `competencesGroupeesParTheme` se perdait aussi, donc « Par compétences » et « Mixte » n'ont jamais reçu les thèmes de l'assistant ; les sessions DÉJÀ validées ne les ont toujours pas : relancer l'assistant**), phrases en tête de la réserve décochées avec étiquette (`cvPdfDonnees.js`, `cvPdfTemplateMaquette.js`, `cvPdfCartesMaquette.js`). Essais : `tests/missionsEnActionProposees.test.js` (3), `contenuAction` (+7) et parcours `propositions` (5) dans `parcours_smoke.js`. `npm test` 1229 verts, parcours ciblés 35/35. **Reste à faire en début de nuit : la suite complète des parcours (~35 min) + banc, parce que `creerBrouillonChoixIACV` / `appliquerBrouillonChoixIACV` ont été touchés.**
- **Audit des champs demandés à l'assistant (2026-10-04, à traiter plus tard, décision de Denis : pas maintenant)** : (1) `nombreMissionsSuggere` est lu mais aucun code ne l'utilise ; (2) les missions de `experiencesRetenues` (point 14) ne servent que si « Regrouper les expériences proches » est activé, alors que le point 6 demande déjà des missions par expérience ; le reste des champs est bien utilisé.

- **LOT N1 FAIT le 2026-10-04 (nuit).** Formations : intitulé, niveau, année, centre, lieu, missions ; expérience personnelle : intitulé, début, fin, structure, lieu, missions (structure et lieu s'affichent désormais sur le CV quand ils existent, dans tous les rendus de la maquette et en mode « Citer seulement ») ; certifications : « Missions (facultatif) » (enregistrées dans le dossier, la correction de la personne prime sur l'assistant, vide = rien d'écrit ; **les missions d'une certification ne s'affichent que si elle reste une ligne des formations : la rubrique « Certifications » à partir de 3 les liste sans missions, comme avant**). Essais : parcours `editionComplete` (21/21), suite complète 534/534 (avant N1), banc 24 modèles 0 différence, `npm test` 1229.
- **NOUVELLE DEMANDE de Denis (2026-10-04, pas codée, maquette d'abord) : un mode d'affichage des ANNÉES pour chaque rubrique qui capte une date** (formations, expériences, expériences personnelles, certifications...), avec le choix « aligné sur l'ensemble » (via le panneau d'optimisation du CV, déjà fait pour partie) ou « mode propre à la rubrique » ; les années doivent aussi s'adapter pour permettre plusieurs rubriques sur la même ligne (regroupement via le bouton de mise en page ou à la main). Constat : l'expérience personnelle montre ses années entre parenthèses en « Citer seulement », les autres rubriques non. À traiter en séance de jour, en commençant par un inventaire des rendus de dates actuels.

- **LOT N2 FAIT le 2026-10-04 (nuit)** : bouton « Options supplémentaires » (classe `btn-miss`, aucun style nouveau) en bas des 7 cartes (Organisation, En-tête, Compétences, Expériences, Mise en page et texte, Couleurs, Autres rubriques) vers la partie du même nom de « Réglages supplémentaires », rangée par carte d'origine avec « Revenir à la carte » (vrai bouton) ; les 3 autres ordres d'expériences retirés (anciens choix gardés lisibles : « Autre ordre (choix précédent) ») ; « Standard / Amélioré » devenu « Simple / Mise en valeur » (valeurs enregistrées `standard` / `ameliore` inchangées) ; les 2 boutons « Ouvrir l'Aperçu » retirés (phrases gardées). « Espacement des paragraphes » (`espparas`, vide entre deux blocs) est un réglage DIFFÉRENT de « Espacement » (interligne) : gardé dans la partie « Mise en page et texte ». Essais : parcours `optionsSupp` (25/25), banc 24 modèles 0 différence, `npm test` 1229. Suite complète finale : voir ci-dessous.

- **SÉANCE DU 2026-10-04 (jour), après la nuit : dates par rubrique et retours de Denis, FAITS.** Dates : boîte « Dates » de chaque rubrique (expériences, formations, certifications, expérience personnelle), « Comme l'ensemble » ou position, forme (années, entre parenthèses, année de fin seule) et mois propres ; « juste après le titre » partout ; adaptation automatique quand deux rubriques sont côte à côte (case « Adapter les dates côte à côte », choix à la main prioritaire) ; options cachées derrière un bouton « Plus d'options » sur la ligne du titre (décision Denis). « Changer l'intitulé » bleu quand actif. Missions des certifications aussi dans la rubrique « Certifications ». Informations complémentaires en bouton dépliant à côté des certifications. « Éditer les compétences » : bouton central de même forme que « Éditer les expériences », champs, « Valider / Annuler », ajout de compétences à la main, « Revenir aux valeurs par défaut » (corrections pour CE CV seulement, clé `k:` des textes corrigés ; compétences ajoutées : `choixMq.competencesAjoutees`). Nombre de missions conseillé par l'assistant (`nombreMissionsSuggere`) : simple suggestion « Appliquer N » dans la carte Expériences, prompt et défauts inchangés (décision Denis). Essais ajoutés : `datesRub`, `editionComp`, `conseilMissions`. Vérifications : `npm test` 1229 verts, suite complète 624 sur 626 (les 2 écarts étaient un essai dépendant de l'état de départ, corrigé et vérifié), banc 24 modèles 0 différence.

### Hors nuit (Denis, plus tard)

Test dans le vrai Word, test sur téléphone, test sur un vrai CV ; décisions : mot affiché du stage (« (stage) » seul par défaut) ; plafond de 11 du Composeur : on le laisse ; « rubrique en grand + CV en direct » : écartée ; nouveaux modèles de CV (plan prêt, rien codé) ; « un CV plusieurs métiers » (audit fait) ; CQP APS ; module « Où et sous quel nom chercher » en pause.

---

## 2bis. Documents de validation écrits (2026-10-03, à la demande de Denis pour valider N2 et N3 avant la nuit)

- **N2** : `docs/INVENTAIRE_REGLAGES_SUPPLEMENTAIRES_2026-10-03.md` (25 réglages relevés dans l'application, verdict et destination de chacun) + `docs/MAQUETTE_MENAGE_REGLAGES_2026-10-03.html` (avant / après). Cases N2.1 et N2.2 : FAITES. Il ne manque que la validation de Denis (4 points listés en fin d'inventaire).
- **N3** : `docs/BROUILLON_PROMPT_MISSIONS_REGROUPEES_2026-10-03.md` (texte proposé du point 20, champ JSON, exemple, 5 décisions). Case N3.1 : FAITE. Il ne manque que la validation de Denis.
- **Dès que Denis répond « OK à tout » sur l'un des deux** : le lot passe à APTE AU MODE NUIT ; découper alors sa liste de tâches en cases (un commit par case) dans ce fichier AVANT de coder.

## 3. Verdict global

- **LOT N1 : APTE AU MODE NUIT** (seul lot à coder la nuit).
- **LOT N2 (révisé, boutons « Options supplémentaires ») : APTE AU MODE NUIT** (maquette `docs/MAQUETTE_OPTIONS_SUPPLEMENTAIRES_2026-10-04.html` validée le 2026-10-04). Cases N2.R1 à N2.R5. Après N1.
- **LOT N3 : NON APTE** pour le code ; **N3.1 (brouillon de texte) peut être préparé**.

Si Denis préfère un mode nuit sans aucune préparation partielle, ne faire que N1 (sa demande de ne pas faire de nuit partielle vise le CODE, pas les documents de préparation).

## 4. Blocages rencontrés (à remplir pendant la nuit)

(aucun pour l'instant)

## 5. Compte-rendu au réveil (à remplir)

**Compte-rendu (2026-10-04).** Hash de départ : `995172c4`. Lots faits dans l'ordre N3, N1, N2 (commits `3b3adc35`, `20998d1f`, `7f529599`). Aucun blocage.

Vérifications finales :
- `npm test` : 1229 verts.
- Suite complète des parcours : 578 essais, 577 verts. Le seul échec venait d'un essai dépendant de l'ordre (« Réglages supplémentaires » laissée ouverte par un essai précédent) : corrigé, puis vérifié (62 sur 62 sur les parcours concernés).
- Banc des 24 modèles : 0 différence après chaque lot.
- Rien n'a été poussé.

À regarder par Denis : les nouvelles fenêtres d'édition (formations, expérience personnelle, certifications), les boutons « Options supplémentaires », les libellés « Simple / Mise en valeur ».

Reste hors nuit : affichage des années par rubrique (maquette d'abord), modèles de CV, audit `nombreMissionsSuggere` et missions de `experiencesRetenues`, missions de certification visibles seulement hors rubrique « Certifications ».
