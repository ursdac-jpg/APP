# Cohérence transversale CV / lettre / entretien — synthèse après 3 avis (2026-08-24)

Ce document fusionne : l'idée initiale de Denis, l'avis de Claude, et deux retours d'IA externes (un retour structuré reprenant les deux propositions A/B, et un retour conceptuel plus ambitieux repositionnant tout le chantier). Un troisième retour collé par Denis répondait à un chantier "vidéos de transition" inexistant — hors sujet, écarté, mentionné ici uniquement pour ne pas le reperdre s'il réapparaît par erreur ailleurs.

## Décision de fond retenue : "la candidature" comme objet, pas "le CV enrichi"

L'apport le plus important du 2e avis externe : ne pas cadrer ce chantier comme "CV + des documents en plus", mais comme l'analyse d'une **candidature**, dont le CV, la lettre, l'entretien, l'offre et l'entreprise sont des facettes différentes du même objet. Ça ne demande pas de réécrire le moteur existant maintenant, seulement de concevoir le diagnostic pour qu'il traite le CV comme un document parmi d'autres, pas comme le centre. Ça prépare aussi, sans coût immédiat, l'ajout futur d'autres pièces (portfolio, profil LinkedIn, vidéo de présentation...) sans redevoir tout repenser.

## Saisie de l'offre d'emploi (précisé 2026-08-25)

- **Lien ou texte collé** : déjà géré nativement par le champ existant `rechercheCandidature.lienOffre`/`saisieLibre.offreEmploi` (accepte les deux, rien à construire).
- **Photo/capture d'écran de l'offre** : confirmée pour le module complet, malgré le coût d'un aller-retour supplémentaire - option rare mais à garder disponible. Aucune lecture d'image possible côté ERIP (pas de backend) : la personne envoie directement la photo à son assistant IA externe (qui sait lire une image), demande le texte en retour, le colle ensuite dans ERIP comme le reste. Nécessite une consigne/écran dédié expliquant cette marche à suivre, pas une nouvelle capacité technique d'ERIP.

## Entreprise et site internet (ajout 2026-08-25)

En plus de l'offre, transmettre le nom de l'entreprise et son site internet, pour que le prompt puisse consigner d'aller chercher les valeurs/le secteur/l'actualité de l'entreprise (même mécanisme déjà en place dans `prompts/entretien.md`). Bonne nouvelle : la donnée existe déjà, séparée, dans `dossier.rechercheCandidature` (`entreprise`, `site`, `lien` - déjà 3 champs distincts grâce à un chantier antérieur). Fonctions déjà existantes dans `js/app.js` : `entrepriseCibleActuelle()`, `siteCibleActuel()`, `lienOffreCibleActuel()`. **Mise à jour 2026-08-25** : `siteCibleActuel()` est désormais aussi exposé côté Bilan V1 (`hostDataAdapter.lireSiteEntreprise`, amélioration indépendante conservée après le revirement d'architecture ci-dessous) ; le nouveau module Cohérence transversale aura sa propre lecture de ces mêmes fonctions globales, sans dépendre du Bilan.

## Revirement d'architecture (2026-08-25) : prompt et module séparés, plus une extension du Bilan

Décision de Denis, avec un argument concret à l'appui : le prompt V3 (fusion diagnostic+extraction du Bilan) a déjà échoué en usage réel pour cette exact raison - trop long, l'IA a laissé tomber une partie des consignes malgré leur présence explicite. `prompts/bilan-v1.md` est déjà dense (9 axes + un schéma JSON strict) ; y ajouter toute l'analyse transversale aurait risqué le même écueil.

**Nouvelle architecture retenue** :
- Un **prompt dédié**, séparé de `bilan-v1.md` (ex. `prompts/coherence-transversale.md`), focalisé uniquement sur l'analyse croisée des documents - jamais alourdi par les instructions du Bilan CV qui ne s'appliquent pas ici.
- Un **module dédié**, dans son propre dossier (ex. `modules/coherence-transversale/`), avec sa propre petite architecture (collecte, analyse, diagnostic...), sur le modèle de rigueur déjà éprouvé par `modules/bilan-candidature/` mais sans en dépendre - objectif de portabilité (pouvoir un jour extraire ce module vers un autre site).
- Le nouveau module a **ses propres petites fonctions de lecture** des données de l'app (`dossier.ia.lettre`, `dossier.ia.entretien`, site entreprise...) plutôt que d'importer `hostDataAdapter.js` du Bilan - autonomie réelle, pas un import caché qui casserait la portabilité.

**Nettoyage effectué dans `modules/bilan-candidature/` (2026-08-25, zéro régression, 428/428 tests verts)** : tout ce qui avait été ajouté aujourd'hui spécifiquement pour la Cohérence transversale a été retiré proprement - l'axe `coherence_transversale` sorti du catalogue des 9 axes restants (`axeAnalyseRegistry.js`), sa route retirée de `destinationRegistry.js`, les placeholders `LETTRE_MOTIVATION_OU_NON_FOURNIE`/`PREPARATION_ENTRETIEN_OU_NON_FOURNIE` retirés de `diagnosticPromptBuilder.js` et `bilan-v1.md`, le niveau 4 revenu à sa règle d'origine (offre+lettre+entretien requis, plus aucun axe du Bilan V1 n'ayant besoin d'une règle assouplie). **Conservé** (indépendant de ce chantier, utile au Bilan V1 lui-même) : la lecture automatique du site internet de l'entreprise (`lireSiteEntreprise`), qui corrige un vrai oubli de pré-remplissage du chantier "ciblage offre d'emploi" du 2026-08-24.

## Architecture technique retenue (partie encore valable : entrées, format des Constats, affichage, etc. — seul le "où ça vit dans le code" change ci-dessus)

- **Module et prompt séparés** (revirement du 2026-08-25, voir ci-dessus) — plus une extension du Bilan existant. Diagnostic, correction et écran de rapport propres à ce nouveau module, sur le même niveau de rigueur que `modules/bilan-candidature/` sans en dépendre.
- **Une entrée clairement visible dans l'interface** ("Cohérence de mon dossier" ou équivalent, dans la boîte à outils), qui n'apparaît/ne s'active que si la personne a fourni de quoi l'alimenter (CV + lettre minimum). Le Bilan CV seul reste exactement aussi simple qu'aujourd'hui, totalement indépendant de ce nouveau module.
- **Entrées** : CV obligatoire (déjà le cas aujourd'hui). Lettre fortement recommandée pour activer cet axe. Offre recommandée mais pas bloquante — prévoir un mode "candidature spontanée" (métier/secteur cible à la place d'une offre précise), sinon on exclut une partie du public accompagné qui n'a pas toujours une offre formelle. Entretien optionnel, "bonus".

## Deux couches d'analyse (au lieu d'une seule)

**Couche 1 - comparaison document à document** (ce qui était déjà envisagé, enrichi par le 1er avis externe) :
CV↔offre, lettre↔offre, lettre↔entreprise, CV↔lettre, CV↔entretien, lettre↔entretien, entretien↔offre, cohérence interne de la lettre. Toujours avec preuve textuelle citée, jamais un score chiffré.

**Couche 2 - cohérence des messages/traits portés, pas seulement des documents** (apport du 2e avis externe, le plus fort de tous les retours) : est-ce que "autonomie", "esprit d'équipe", "rigueur"... sont présents, cohérents ou contradictoires **à travers l'ensemble CV+lettre+entretien**, plutôt qu'analysés document par document. Inclut :
- **Les absences** : une compétence attendue par l'offre mais jamais illustrée nulle part est elle-même un signal, pas seulement les contradictions.
- **La qualité de la preuve**, pas seulement la présence : une affirmation répétée trois fois sans jamais être illustrée par un exemple concret est un vrai point faible.
- **La cohérence narrative/temporelle** : deux phrases peuvent être vraies séparément et pourtant raconter une histoire qui ne tient pas ensemble.
- **La redondance d'information, pas seulement de formulation** : reformuler la même expérience trois fois avec des mots différents n'ajoute rien - mieux vaut orienter vers "utilisez la lettre pour illustrer autre chose".

Une synthèse narrative globale ("quelle histoire raconte cette candidature", chaque document jugé sur sa contribution à cette histoire) est une extension intéressante mais plus ambitieuse - à garder en réserve pour une V2, pas nécessaire pour livrer une première version utile.

## Corrections applicables : un seul mécanisme, pas trois

Les deux avis externes convergent avec Claude sur ce point : ne pas construire un système de correction séparé par document. Une suggestion est un objet structuré unique (objectif, document(s) concerné(s) - peut en toucher plusieurs à la fois, zone/ancre textuelle, action à proposer, justification), qui réutilise le mécanisme d'accompagnement déjà construit pour l'appliquer (coller un prompt, coller la réponse, valider). Reste une vraie question technique à vérifier dans le code avant de concevoir plus loin : `destinationRegistry.js` sait-il aujourd'hui router une correction vers autre chose que le CV ?

## Vérifications déterministes avant tout appel IA (aucun coût, fiable)

Duplication exacte de texte (ex. l'accroche du CV recopiée mot pour mot dans la lettre), dates incohérentes ou chevauchements, coordonnées manquantes, champs obligatoires absents, longueur excessive. Fait par le code, jamais par l'IA - reprend la discipline déjà appliquée ailleurs dans ERIP ("l'application tranche seule quand elle le peut").

## Contraintes pratiques à ne pas oublier

- Taille du prompt envoyé à l'IA externe : prévoir des délimiteurs clairs, éventuellement une analyse en deux temps (CV+lettre+offre d'abord, entretien en complément) si le volume de texte devient trop grand pour un copier-coller confortable.
- Avertissement de confidentialité simple avant de coller des données dans un assistant externe, en particulier pour les réponses d'entretien qui peuvent contenir des éléments plus personnels.
- Parcours pas à pas pour ne pas surcharger la personne : CV (déjà là) → cible (offre ou métier) → lettre → entretien en option, jamais tout demandé d'un coup.

## Format de données retenu après le 4e avis (2026-08-24)

Convergence forte de 4 avis : emprunter uniquement le principe de l'"Observation" de la V4, pas son architecture complète. Objet retenu, nommé **Constat** (plus neutre) :

- `id`
- `ancrage` : à quoi il se rattache (ex. `cv.experience[0]`, `lettre.paragraphe[2]`, `offre.prerequis[1]`) - adressage normalisé pour qu'un futur écran puisse filtrer par document.
- `nature` : incohérence / absence / duplication / contradiction / alignement / **force** (les points forts doivent aussi être stockés, pas seulement les problèmes - réutilisables ailleurs, ex. en préparation d'entretien : "appuyez-vous sur cette expérience").
- `dimension` : la qualité/compétence concernée (autonomie, rigueur, motivation...).
- `preuve` : l'extrait de texte exact.
- `message` : formulation lisible.
- `confiance` (optionnel, ajouté seulement quand un écran en a réellement besoin).

**Règle de garde-fou** : ne jamais ajouter un champ à un Constat sans un besoin fonctionnel réel déjà présent - pour ne pas reconstruire la V4 sans s'en rendre compte.

**Séparation des responsabilités** (même principe que le Bilan actuel, mais un mécanisme propre au nouveau module, plus `destinationRegistry.js` du Bilan) : Constat (ce qui a été observé) -> Recommandation (le conseil) -> Correction (l'action concrète, capable de cibler le CV, la lettre ou l'entretien).

**Un Constat reflète l'état courant** : une fois le point corrigé, il disparaît ou se met à jour - il ne reste pas comme un historique figé. Ça le distingue clairement d'un Repère (que la personne choisit volontairement de garder comme souvenir permanent).

**Détail technique confirmé dans le code existant** : le prompt du Bilan (`prompts/bilan-v1.md`) produit déjà une phrase lisible + un bloc JSON structuré dans la même réponse, parsé par l'application - on continue sur ce principe déjà en place pour les Constats, rien de nouveau à inventer sur ce point.

**Résilience prévue** : si un Constat ne retrouve plus sa preuve exacte après une modification de texte par la personne, pas d'algorithme de réalignement complexe - il bascule simplement dans un encart générique "Remarques transversales" plutôt que de casser l'écran.

## Règles de conception transversales à appliquer (2026-08-24)

Voir `docs/LECONS_A_NE_PAS_REPRODUIRE.md` (checklist vivante, à tenir à jour pour tous les futurs chantiers). Pour ce chantier en particulier : des boutons pour chaque Constat/Recommandation (jamais des lignes cliquables), une couleur cohérente selon le type (Recommandation vs Correction) reprise de la charte déjà en place ailleurs dans l'app, bouton Retour qui ramène à l'écran précédent (jamais l'accueil), entrée `AIDE_PAGES`/`AIDE_FENETRES` dès la conception de l'écran, événements Umami sur les actions clés (lancement de l'analyse, acceptation/rejet d'un Constat...), vérification explicite des points de connexion avec le Bilan existant (zéro régression), écriture 100% français sans anglicisme ni tiret long, réflexes d'accessibilité de base, et code organisé dans son propre module autonome plutôt que d'alourdir `js/app.js`.

## Affichage du rapport et charte graphique (2026-08-24, soir)

- **Écran de rapport en chapitres/sous-chapitres repliés (accordéons)**, jamais un bloc de texte qui tombe d'un coup - courte description visible, détail au clic, personne libre de choisir l'ordre de lecture (points forts d'abord ou points faibles d'abord). Réutilise le même principe déjà en place dans le rapport du Bilan.
- **Couleur des Constats reprise telle quelle de la palette déjà en place dans le Bilan** (`BILAN_COULEURS_STATUT_PREPARATION`, `js/app.js`) : vert = force/aligné, ambre = absence/à enrichir, rouge = incohérence/contradiction. Variables CSS déjà theme-aware (mode sombre + daltonisme déjà pris en compte dans le code existant) - aucune nouvelle palette à inventer.

## Séquencement de construction retenu (2026-08-24, soir)

Construction en 2 morceaux, pour limiter le risque de fragiliser à la fois le nouveau module et le module Entretien déjà stable :

1. **Cœur du module** : CV + lettre (minimum pour démarrer), offre recommandée mais non bloquante (mode candidature spontanée), entretien optionnel en entrée si déjà présent. Vérifications déterministes, comparaison document à document, Constats (voir plus bas), corrections applicables vers CV/lettre.
2. **Connexion vers l'Entretien** : transmettre les Constats pertinents (pas tous - à trier) au prompt de préparation d'entretien (`entretien.md`/`entretien-accueil.md`), pour que les questions générées ciblent précisément les fragilités/forces déjà identifiées, plutôt que de les redécouvrir seules. Inclut le renforcement explicite de la consigne "fragilité assumée + stratégie de compensation concrète" (ex. timidité compensée par le fait de beaucoup se renseigner) - déjà en germe dans `entretien.md` ("de façon constructive, jamais comme un aveu de faiblesse") mais à rendre plus systématique.

**Important, précisé par Denis** : ce découpage en 2 morceaux est un ordre de construction technique pour limiter le risque, **pas des jalons soumis à un retour d'utilisateurs externes**. Denis est à la fois le concepteur et l'utilisateur de validation d'ERIP aujourd'hui - dès que le morceau 1 est testé et validé par lui en navigateur, on enchaîne directement sur le morceau 2, sans palier d'attente, jusqu'au module complet. Objectif explicite : un module complet est nécessaire pour produire des statistiques Umami exploitables en vue d'une future migration V2 → V3 de l'architecture du site (ne garder que les modules les plus pertinents) - un module livré à moitié ne donne pas un signal d'usage valide. Voir [[feedback_pas_de_palier_attente_retours_utilisateurs]].

## Ce qui est mis de côté pour ce module, ordre validé par Denis (2026-08-25)

À construire seulement une fois cette première partie (lettre modifiable, dépôt CV/lettre/entretien via `ouvrirAssistantDepotCV`, offre mémorisée dans `dossier`) terminée et stabilisée - **dans cet ordre** :

1. **Couche "qualités/traits" de l'analyse** - vérifier si des qualités ("autonomie", "rigueur"...) sont cohérentes à travers CV+lettre+entretien (pas juste document contre document) : silences (qualité attendue par l'offre mais jamais illustrée), qualité des preuves (affirmation vs exemple concret), répétitions d'information. La V1 fonctionne déjà sans.
2. **Synthèse narrative globale** ("quelle histoire raconte cette candidature", contribution de chaque document à cette histoire) - la plus ambitieuse, gardée en réserve.
3. **Bouton "imprimer" la synthèse d'entretien** dans le module Entretien existant - prépare le terrain pour le point 5.
4. **Mise à jour de la sauvegarde de session (disquette)** pour inclure les diagnostics (Bilan et Cohérence transversale), pas seulement les documents bruts - aujourd'hui `sauvegarderSession()` (`js/app.js`) ne sauvegarde que `dossier`, jamais les résultats d'analyse (vérifié dans le code le 2026-08-25).
5. **2e prompt "entretien avancé"** (séparé du prompt d'analyse principal, même discipline "un prompt par module/mission") - le 1er prompt propose déjà 5 à 10 questions ciblées (gardées en réserve), la personne y répond (texte, dictée Windows possible), tout part vers ce 2e prompt pour un échange plus poussé. Mentionner le mode vocal de l'assistant choisi comme option, jamais une exigence. Le résultat final doit pouvoir rejoindre le module Entretien existant (point 3) pour être imprimé.

## Idée explorée et volontairement écartée pour l'instant (2026-08-25) : lecture de texte dans une image (OCR) côté application

Question posée par Denis : peut-on lire automatiquement le texte d'une photo (CV/lettre/offre en image), comme le fait déjà Windows 11 nativement, pour épargner à la personne un aller-retour vers une IA externe ?

**Vérifié** : techniquement possible via une bibliothèque JS (Tesseract.js), qui tournerait entièrement dans le navigateur, rien envoyé nulle part - même esprit que la lecture PDF/Word déjà en place (`pdfjsLib`/`mammoth`, `data/metiers.js`). Impossible en revanche de réutiliser la fonction native de Windows 11 elle-même (capacité du système d'exploitation, pas accessible à un site web).

**Écarté pour l'instant, raison assumée** : la qualité de cette bibliothèque reste nettement en dessous de l'OCR de Windows 11 ou d'une IA moderne, en particulier sur une vraie photo prise au téléphone (légèrement penchée, mauvais éclairage) - exactement le type de photo que le public d'ERIP envoie souvent. Risque réel : un texte mal reconnu, plus frustrant à corriger que le chemin actuel. Toute l'architecture d'ERIP est aujourd'hui pensée autour de l'aller-retour vers une IA externe ; le nombre de personnes arrivant avec uniquement une photo de CV est estimé faible.

**Décision de Denis** : garder le chemin actuel (photo → IA) pour l'instant. **Réévaluer une fois que l'application entière sera stabilisée et que tous les chantiers prévus seront terminés** - si le résultat global est satisfaisant à ce moment-là, ce sujet sera reconsidéré comme un futur chantier à part entière (pas lié spécifiquement à la Cohérence transversale, concerne tout endroit de l'app qui accepte une photo de document).

## Ce qui reste à trancher avant de coder

1. Portée de la V1 : couche 1 (document à document) + vérifications déterministes + mécanisme de correction unifié = déjà ambitieux et suffisant pour une première version utile. Couche 2 (messages/traits) et synthèse narrative globale = V1.1/V2, à ne pas bloquer la sortie de la V1 pour les avoir dès le départ.
2. Nom exact et emplacement de l'entrée dans l'interface.
3. Mode "candidature spontanée" dans la V1 ou reporté.
4. Vérification technique : `destinationRegistry.js` peut-il router une correction vers la lettre/l'entretien, ou faut-il l'étendre - à regarder dans le code avant de concevoir le mécanisme de correction plus en détail.
