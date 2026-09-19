# Carnet des fiches à écrire — module Lexique

Carnet vivant, alimenté au fil de l'eau — même patron que `docs/EVOLUTIONS_REPERES.md` et `docs/CARNET_TECHNIQUE_ARCHITECTURE_ERIP.md`, jamais un outil de gestion de projet séparé. Décline `docs/CHANTIER_LEXIQUE.md`, section 9 (méthode de fabrication) et section 10 (MVP).

**Critère de sélection du corpus de lancement** (historique, 42 fiches déjà écrites, ne change pas rétroactivement) : est-ce qu'un utilisateur a de fortes chances de rencontrer cette notion dès ses premières utilisations d'ERIP — jamais « est-ce que c'est important » en général.

**Critère pour la suite, élargi le 2026-08-17** (voir `docs/CHANTIER_LEXIQUE.md`, section 10) : comprendre cette notion aide-t-elle réellement à comprendre le monde de l'insertion, de l'accompagnement ou de l'emploi — pour un bénéficiaire, mais aussi pour un CIP débutant, un stagiaire CIP ou un partenaire du secteur ? Toujours pas « est-ce que c'est important » en général : le test de nécessité (une vraie valeur de compréhension) reste entier, seul le public visé s'élargit.

**Score de priorité** (1 à 5 sur chaque axe, à l'appréciation, pas un calcul automatique) :
- Fréquence d'apparition dans les écrans/sorties d'ERIP.
- Fréquence en accompagnement CIP réel.
- Potentiel de confusion pour un bénéficiaire.

Le score n'appartient qu'à ce carnet — une fois la fiche écrite, il disparaît, il n'entre jamais dans le modèle de données. Quelques exemples pour calibrer l'échelle, plutôt qu'un score sur chacune des ~60 entrées ci-dessous :

| Candidat | Écrans ERIP | Accompagnement CIP | Confusion bénéficiaire | Lecture |
|---|---|---|---|---|
| PMSMP | 5 (bouton visible dès l'accueil CV) | 5 | 5 | priorité maximale |
| Diagnostic partagé | 1 (jamais affiché dans ERIP) | 5 | 3 | priorité haute malgré un score écran nul — l'accompagnement réel suffit à le justifier |
| Culture d'entreprise | 1 | 2 | 2 | reste en niveau 2, aucun axe ne le pousse |
| Maintien dans l'emploi | 1 | 3 | 2 | niveau 2 — réel mais pas rencontré tôt |

---

## Niveau 1 — corpus de lancement (42 candidats)

**Contrats et statuts** — CDI, CDD, intérim, alternance, stage, PMSMP, période d'essai, temps partiel.

**Paie** — salaire brut, salaire net, bulletin de paie (grille de lecture).

**Langage CIP à traduire** — diagnostic partagé, plan d'action, positionnement, prescription, employabilité, frein à l'emploi, reconversion.

**Attentes employeurs et entretien** — autonomie, savoir-être, savoir-faire, esprit d'équipe, force de proposition, rigueur, « parlez-moi de vous » (décryptage), ce que regarde un recruteur sur un CV (décryptage), lettre de motivation (grille de lecture).

**Structures** — France Travail, Mission Locale, Cap Emploi, CAF.

**Formation et dispositifs** — CPF, VAE, RQTH.

**Insertion par l'activité économique** — SIAE (fiche de synthèse), chantier d'insertion (ACI), entreprise d'insertion (EI), association intermédiaire (AI), ETTI.

**Comparatifs** — CDD ou intérim ?, CDI ou CDD ?, Stage ou PMSMP ?

**Historique des arbitrages (2026-08-17)** — "Frein à l'emploi" (langage entendu directement par la personne accompagnée) rejoint le niveau 1 ; "frein périphérique" (vocabulaire de professionnel) reste en niveau 2, avec une relation "voir aussi" forte vers "Frein à l'emploi" à poser dès l'écriture de cette dernière. Les 3 attentes employeurs retenues (autonomie, esprit d'équipe, force de proposition) sont confirmées comme les plus fréquentes ; polyvalence et sens de l'organisation restent en niveau 2. "CDI ou CDD ?" et "Stage ou PMSMP ?" promus en niveau 1 : liés directement à l'écran de choix d'objectif du CV, le tout premier écran rencontré dans ERIP.

---

## Extension post-lancement — mini-guide Bulletin de salaire (2026-08-17)

La famille Paie du corpus de lancement (3 fiches : bulletin de salaire, salaire brut, salaire net) jugée trop légère au regard de sa vraie utilité pour les bénéficiaires. Étoffée en un mini-guide de 13 fiches reliées entre elles, regroupées dans un nouveau parcours `parcours-bulletin-salaire` (« Comprendre sa fiche de paie »), dans l'ordre : bulletin de salaire → salaire brut → cotisations sociales → prélèvement à la source → salaire net → heures supplémentaires → prime → indemnité → congés payés → absence → cumuls → remboursement de frais → coût employeur.

10 nouvelles fiches : cotisations sociales, prélèvement à la source, heures supplémentaires, prime, indemnité, congés payés, absence, remboursement de frais, cumuls, coût employeur. Second niveau de lecture ajouté uniquement là où il apporte une vraie valeur (5 des 10 : cotisations sociales, heures supplémentaires, prime, indemnité, cumuls, coût employeur) — pas systématiquement sur chaque fiche, conformément au test de nécessité.

« Mentions obligatoires » et « les différentes lignes d'un bulletin » (cités dans la demande initiale) volontairement non transformés en fiches séparées : le premier est un détail de conformité légale susceptible d'évoluer (contraire au principe 1 de la doctrine), le second est déjà couvert par la constellation de fiches elle-même plutôt que par une fiche méta qui les résumerait.

---

## Étape 12 — extension progressive du corpus (ouverte 2026-08-18)

Plan estimé à 7-8 lots sur la base de l'audit de couverture, sans compter les manques que chaque lot révèle en cours de route (même dynamique que le second niveau) : santé au travail + comparatifs rapides (lot 1) → démarches administratives → formation → méthodes d'accompagnement CIP (2 lots) → droit du travail / fin de contrat → vocabulaire RH et orientation restant (1-2 lots). Le niveau 3 reste hors de ce plan par principe.

**Lot 1 — Santé au travail et comparatifs rapides (2026-08-18).** Univers santé au travail étoffé de 1 à 5 fiches : médecine du travail, maintien dans l'emploi, aménagement de poste, aptitude ou inaptitude ? (nouvelles), en plus de RQTH déjà écrite. 5 comparatifs écrits en même temps, dont 4 sans aucune fiche de base à créer (prime ou indemnité ?, savoir-être ou savoir-faire ?, CPF ou VAE ?, France Travail/Mission Locale/Cap Emploi ? — voir la section Comparatifs ci-dessus).

4 nouvelles collections/parcours construites en même temps, à partir de fiches déjà écrites, aucune nouvelle rédaction nécessaire : « Les acteurs de l'insertion professionnelle » (France Travail, Mission Locale, Cap Emploi, CAF), « Comprendre un contrat de travail » (les 7 fiches contrats + 3 comparatifs), « Comprendre les mots de mon accompagnement » (diagnostic partagé, positionnement, frein à l'emploi, plan d'action, prescription, reconversion, employabilité — jamais regroupées jusqu'ici), « Comprendre sa santé au travail » (les 5 fiches du lot). Les 2 comparatifs « Prime ou indemnité ? » et « Savoir-être ou savoir-faire ? » intégrés aux parcours existants (bulletin de salaire, entretien) plutôt que dans une nouvelle collection.

**Lots 2 à 8 — reste de l'extension progressive (2026-08-18).** Enchaînés sans interruption entre lots, à la demande explicite de Denis (« je veux tous les lots et les Collections et parcours sans t'arrêter, commit tout pour la fin »). 47 nouvelles fiches, 7 nouvelles collections/parcours, 4 entrées de second niveau ciblées.

- *Lot 2 — Démarches administratives et dispositifs.* FranceConnect, actualisation, attestation employeur (univers Démarches administratives et numériques, jusque-là à 0 fiche) ; ARE, POEI, CEJ, PACEA, bilan de compétences (univers Dispositifs).
- *Lot 3 — Formation.* RNCP, CQP, titre professionnel, certification, qualification, plus 3 comparatifs : Formation qualifiante ou certifiante ?, RNCP ou CQP ?, Diplôme, titre professionnel ou certification ? (3 termes, réutilise le gabarit établi au lot 1).
- *Lots 4-5 — Méthodes et pratiques d'accompagnement CIP.* Écoute active, reformulation, questionnement, conduite d'entretien, ADVP, Trèfle Chanceux, objectifs SMART, co-construction, pouvoir d'agir — univers Accompagnement et insertion, registre langage CIP. Confirme l'élargissement de périmètre du 2026-08-17 (culture commune de l'accompagnement, pas seulement vocabulaire bénéficiaire).
- *Lot 6 — Droit du travail et fin de contrat.* Convention collective, préavis, licenciement, démission, rupture conventionnelle, solde de tout compte, abandon de poste (univers Droit du travail, jusque-là à 0 fiche) ; comparatif Démission ou rupture conventionnelle ?
- *Lot 7 — Vocabulaire RH et emploi.* Entretien annuel, culture d'entreprise, marque employeur (univers Ressources humaines, jusque-là à 0 fiche) ; cooptation, bassin d'emploi, polyvalence, sens de l'organisation.
- *Lot 8 — Orientation et parcours professionnel.* Auto-entrepreneur (univers Entrepreneuriat et indépendance, jusque-là à 0 fiche, laissé volontairement en point d'arrivée isolé) ; projet professionnel, orientation, réorientation professionnelle, évolution professionnelle ; comparatifs Réorientation ou reconversion ? et Reconversion ou évolution professionnelle ?

7 nouvelles collections/parcours, construites après les lots pour résorber les fiches isolées et regrouper ce qui a une vraie cohérence thématique : « Mes démarches avec France Travail » (parcours), « Comprendre les dispositifs d'accompagnement » (collection), « Comprendre la formation professionnelle » (parcours, 11 fiches, absorbe CPF/VAE déjà écrits), « Comprendre les méthodes d'accompagnement » (collection, les 9 fiches CIP du lot 4-5), « Comprendre la fin d'un contrat de travail » (parcours, 7 fiches), « Comprendre le monde de l'entreprise » (collection), « Construire mon projet professionnel » (parcours, absorbe positionnement et reconversion déjà écrits). 2 fiches laissées volontairement sans collection ni citation entrante (points d'arrivée légitimes, tolérés par la doctrine) : convention collective, auto-entrepreneur.

4 entrées de second niveau ajoutées sur les fiches où ça apporte une vraie valeur : rupture conventionnelle (nuance : ne peut jamais être imposée unilatéralement), objectifs SMART (exemple concret vague vs SMART), Trèfle Chanceux (exemple concret d'un recoupement), qualification (nuance : peut évoluer sans changement de poste, effet sur le classement conventionnel).

Corpus après ces 8 lots : 107 fiches (+47), 14 collections/parcours (+11 avec le lot 1), 55 entrées de second niveau (+8 avec le lot 1). Validé par `node scripts/checkLexique.js` (aucune erreur) et vérification navigateur complète (fiches, comparatif à 3 termes, relations symétriques, collections, univers nouvellement peuplés, console propre).

---

## Niveau 2 — important, peut attendre

Frein périphérique (voir aussi → Frein à l'emploi, niveau 1).

**Écrits depuis (2026-08-18, lots 2 à 8 étape 12)**, retirés de cette liste : convention collective, entretien annuel, culture d'entreprise, marque employeur, cooptation, bassin d'emploi, entrepreneuriat/auto-entrepreneur, démission, rupture conventionnelle, licenciement, préavis, démission ou rupture conventionnelle, qualification, orientation, maintien dans l'emploi (lot 1), certification, titre professionnel, diplôme/titre professionnel/certification, projet professionnel, réorientation professionnelle, réorientation ou reconversion, reconversion ou évolution professionnelle, polyvalence, sens de l'organisation, savoir-être ou savoir-faire (lot 1), POEI, RNCP, CQP, FranceConnect, ARE, écoute active, reformulation, questionnement, conduite d'entretien (techniques d'entretien), ADVP, Trèfle Chanceux, SMART (objectifs), co-construction, pouvoir d'agir, solde de tout compte, abandon de poste.

**Écrits depuis (2026-08-18, lot de clôture du backlog niveau 2)**, retirés de cette liste :
- Soft skills ou hard skills ? (comparatif) — écrit comme fiche courte de traduction de vocabulaire plutôt qu'un comparatif complet dupliquant « Savoir-être ou savoir-faire ? » : même distinction, vocabulaire anglicisé différent, avec un renvoi explicite vers le comparatif d'origine. Décision : pas de fusion (les deux vocabulaires existent réellement dans l'usage, chacun mérite d'être trouvable), pas de duplication du contenu.
- ATS — écrit, univers Emploi et recrutement, renvoie vers « Ce que regarde un recruteur sur un CV ».
- CEP (conseil en évolution professionnelle) — écrit, univers Dispositifs.
- IAE (secteur, distinct de SIAE qui désigne les structures concrètes) — écrit, univers Structures et organismes, renvoie vers SIAE.
- RQTH ou invalidité ? (comparatif) — écrit, univers Santé au travail.
- Réseau Pour l'Emploi — écrit, univers Structures et organismes.
- CIP, le rôle lui-même — écrit sur le même gabarit « rôle » que France Travail/Mission Locale/Cap Emploi, univers Structures et organismes.

**CDI, CDD ou intérim ? (comparatif à 3 termes) — tranché (2026-08-18) : pas écrit.** Aurait entièrement recoupé le contenu des 2 comparatifs déjà écrits (CDD ou intérim ?, CDI ou CDD ?), qui couvrent déjà les 3 distinctions par transitivité via leur relation croisée. Écrire une 3e fiche aurait dupliqué un contenu déjà disponible, contrairement au principe de non-duplication du corpus. Les 2 comparatifs existants suffisent.

Backlog niveau 2 clos à ce stade — plus aucun candidat en attente identifié au-delà du niveau 3 (rare/spécialisé).

**Explicitement laissé hors du carnet, même après l'élargissement** : i-Milo — logiciel commercial nommé d'un éditeur précis, jamais montré au bénéficiaire, explicitement mis en contraste avec Repères dans `docs/DOCTRINE_REGARD_EXTERIEUR.md` (« i-Milo trace pour l'institution... ce mécanisme appartient au bénéficiaire »). Comprendre le principe d'un logiciel de suivi institutionnel resterait légitime sous la nouvelle doctrine, mais nommer ce produit précis ne l'est pas.

---

## Niveau 3 — rare ou spécialisé, créé seulement si un besoin réel apparaît

CCP1, jargon sectoriel.

**Écrits depuis (2026-08-18)**, à la demande explicite de Denis (« cela je les veux bien, il me semble important ») — CCP1 et jargon sectoriel volontairement laissés de côté, non demandés :
- PLIE — univers Structures et organismes, dispositif territorial de coordination.
- Dialogue social et CSE — 2 fiches distinctes (le concept général et l'instance concrète), univers Droit du travail. Le lien vers Convention collective (déjà écrite, jusque-là jamais citée) résout son dernier avertissement d'orpheline.
- Discrimination à l'embauche — univers Emploi et recrutement, définition factuelle et neutre du motif interdit par la loi, sans conseil juridique.
- Portage salarial et Profession libérale — univers Entrepreneuriat et indépendance, jusque-là limité à la seule fiche Auto-entrepreneur (elle-même orpheline).
- **Auto-entrepreneur, portage salarial ou profession libérale ?** (comparatif à 3 termes, non demandé explicitement mais construit en écho au format déjà validé) — relie les 3 statuts d'exercice indépendant, résout l'orphelinage d'Auto-entrepreneur, réunis dans une nouvelle collection « Comprendre le travail indépendant ».

Corpus après ce lot : 121 fiches, 15 collections/parcours, 55 entrées de second niveau. `node scripts/checkLexique.js` : **zéro avertissement** (les 2 derniers, Auto-entrepreneur et Convention collective, sont résolus).

---

## Comparatifs — famille à développer prioritairement (2026-08-18)

Confirmé par Denis après l'audit de couverture : les comparatifs sont un format à forte valeur pédagogique, à développer bien au-delà des seuls contrats (3 aujourd'hui). Liste consolidée (candidats déjà dispersés dans ce carnet + nouveaux) :

- ~~Prime ou indemnité ?~~ **écrit (2026-08-18, lot 1 étape 12)**.
- ~~France Travail, Mission Locale ou Cap Emploi ?~~ **écrit (2026-08-18, lot 1 étape 12)** — premier comparatif à 3 termes du corpus, voir note ci-dessous.
- ~~Savoir-être ou savoir-faire ?~~ **écrit (2026-08-18, lot 1 étape 12)**, ajouté au parcours « Je prépare un entretien ».
- ~~Aptitude ou inaptitude ?~~ **écrit (2026-08-18, lot 1 étape 12)** — pas dans la liste d'origine, ajouté à l'écriture du lot Santé au travail.
- ~~CPF ou VAE ?~~ **écrit (2026-08-18, lot 1 étape 12)**.
- ~~Formation qualifiante ou certifiante ?~~ **écrit (2026-08-18, lot 3 étape 12)**.
- ~~RNCP ou CQP ?~~ **écrit (2026-08-18, lot 3 étape 12)**.
- ~~Diplôme, titre professionnel ou certification ?~~ **écrit (2026-08-18, lot 3 étape 12)**, comparatif à 3 termes.
- ~~Démission ou rupture conventionnelle ?~~ **écrit (2026-08-18, lot 6 étape 12)**.
- ~~Réorientation ou reconversion ?~~ **écrit (2026-08-18, lot 8 étape 12)**.
- ~~Reconversion ou évolution professionnelle ?~~ **écrit (2026-08-18, lot 8 étape 12)**, distinct de « réorientation ou reconversion ? ».
- ~~RQTH ou invalidité ?~~ **écrit (2026-08-18, lot de clôture)**.
- ~~Soft skills ou hard skills ?~~ **écrit (2026-08-18, lot de clôture)**, comme fiche courte de traduction plutôt qu'un comparatif dupliquant « Savoir-être ou savoir-faire ? ».
- ~~CDI, CDD ou intérim ?~~ **tranché, non écrit (2026-08-18)** : aurait dupliqué CDD ou intérim ?/CDI ou CDD ? déjà écrits, qui couvrent la distinction par transitivité.

**Note technique sur les comparatifs à 3 termes — résolue (2026-08-18).** Le gabarit `comparatif` n'avait été conçu et vérifié que pour des paires jusqu'aux 3 premiers comparatifs du corpus. « France Travail, Mission Locale ou Cap Emploi ? » établit et vérifie le format à 3 termes : une structure parallèle (« Les trois [point commun]. [A] se distingue par... [B] se distingue par... [C] se distingue par... ») plutôt que « ce qui les rapproche / ce qui les distingue » (pensé pour une paire). Réutilisable tel quel pour CDI/CDD/Intérim et Diplôme/Titre professionnel/Certification.
