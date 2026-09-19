# Chantiers en attente — contexte complet pour reprise (par une autre IA ou une autre session)

Document rédigé le 2026-08-03, juste après un chantier de refonte de la page "Mon projet" (harmonisation Loisirs/Engagements/Certifications/Expérience-savoir-être, Formation et diplôme restructurée, commit `ee8a21f`). Objectif de ce fichier : donner à quiconque reprend ce travail (humain ou IA, dans une autre fenêtre/un autre outil) tout le contexte nécessaire pour coder correctement, sans avoir à retracer l'historique de la conversation d'origine.

**Application** : assistant de parcours professionnel / CV (candidat), fichier principal `js/app.js` (~20 000 lignes, tout en JS global chargé via balises `<script>` classiques dans `index.html`, aucun bundler/module ES). Serveur de dev : `serveur_dev.py` (voir `.claude/launch.json`), Cache-Control no-cache — toujours recharger la page après une modif de fichier JS déjà chargé.

**Règles transverses à respecter dans tous ces chantiers** (rappels, valables pour toute l'application) :
- Jamais de tiret long (`—` ou `–`) ni de double-tiret séparateur (`--`) dans un texte VISIBLE (app, CV, aide) — toujours le tiret court `-`. Règle très insistante de l'utilisateur ("le tiret long, c'est la marque d'IA"). Cette règle est **déjà appliquée** dans les prompts IA (`prompts/cv.md`, `lettre.md`, `entretien.md`, `decouverte-competences.md` contiennent la consigne) — pas la peine de refaire cette partie.
- Réponses/communication toujours en français.
- Priorité absolue : **aucune régression** — l'app a été peaufinée pendant des semaines de tests manuels difficiles à refaire à l'identique. Toujours tester avant/après dans un vrai navigateur (via le serveur de dev), jamais se contenter d'une relecture de code.
- Avant de coder un chantier ambigu, clarifier la règle/le périmètre avec l'utilisateur plutôt que de deviner (il le demande explicitement pour le chantier "missions formations/certifications" ci-dessous).

---

## Chantier 1 — Parcours Découverte : répercuter la restructuration "Formation et diplôme" [TERMINÉ le 2026-08-03]

**Fait** : Option complète retenue avec l'utilisateur (inversion réelle de l'ordre, type avant niveau, cohérence totale avec "Mon projet") plutôt que l'option prudente. Implémenté dans `contenuBlocFormation()`/ses handlers (`js/decouverte-competences/decouverteParcours.js` autour des lignes 2260-2380 pour le rendu, ~2880-2930 et ~3110-3130 pour les clics). Nouveau champ `infos.formation.niveauRNCP` (source de vérité du niveau, 1 à 7) en plus de `d.niveau` (libellé affiché/transmis, inchangé). Le catalogue de missions de terrain est désormais gating sur `d.niveauRNCP <= 4` (même règle que "Mon projet"), remplaçant l'ancien test sur le libellé (`NIVEAUX_AVEC_CATALOGUE_SECTEURS`, laissé en l'état dans js/app.js car potentiellement encore référencé ailleurs). Testé en direct dans le navigateur (via un JSON de fragment fabriqué à la main pour contourner l'étape de collage IA) : parcours Diplôme (Bac sans intitulé -> "Bac général" transmis), Titre professionnel (échelle RNCP 1-7 + message de repère, intitulé obligatoire, catalogue absent au-dessus de RNCP 4 et présent en dessous), Sans diplôme (fermeture immédiate, aucune entrée transmise), changement de type en cours de route (niveau réinitialisé, intitulé/année conservés), et le bouton "Modifier" (aucune perte de données). Les 26 tests `node:test` existants passent toujours. Au passage, tirets longs corrigés dans `resumeNiveau` (même fonction touchée) ; 2 autres tirets longs pré-existants repérés ailleurs dans ce fichier (`enveloppePalier()`, `construireTitreDepuisMetierOuSecteur()`) ont été signalés séparément (hors périmètre de ce chantier).

### Contexte (état AVANT ce chantier, conservé pour l'historique)
Dans la page **Mon projet** (`js/app.js`), la rubrique "Formation et diplôme" a été restructurée le 2026-08-03 : au lieu de demander d'abord le niveau (CAP/Bac/Bac+2...) puis le type (Diplôme/Titre pro/CQP), on demande maintenant le **type en premier** :

1. Pastilles "Sans diplôme / Diplôme / Titre professionnel / CQP" (nouvelle constante `TYPES_FORMATION_MON_PROJET`, `js/app.js` ~ligne 410).
2. "Sans diplôme" déclenche un ajout direct dans `dossier.formations` (comme avant, comportement inchangé, juste le déclencheur qui change de pastille).
3. "Diplôme" affiche les niveaux usuels (`NIVEAUX_DIPLOME_SIMPLES`, sans "Sans diplôme" ni "Doctorat" — Doctorat a été retiré de cette constante **partagée**, donc Découverte l'a perdu aussi automatiquement, sans risque).
4. "Titre professionnel"/"CQP" affichent une échelle RNCP complète et contiguë 1 à 7 (nouvelle constante `NIVEAUX_RNCP_TITRE_CQP = [1,2,3,4,5,6,7]`), avec un message de repère **indicatif, jamais transmis au CV** (`EQUIVALENCE_RNCP_REPERE`, ex. "niveau 4 ≈ Bac"). Important : `niveauFormationAffiche()` (fonction PARTAGÉE avec Découverte) continue de renvoyer uniquement le texte "Titre professionnel"/"CQP" pour ces 2 types, jamais une équivalence de niveau — ce comportement est volontaire et ancien (voir son commentaire dans le code : "afficher une équivalence de niveau sur le CV serait trompeur"), **ne jamais le changer**.
5. Le catalogue de missions "de terrain" (secteur/missions) est maintenant gating sur le NIVEAU RNCP directement (`nf.niveauRNCP <= 4`) plutôt que sur le libellé du niveau — généralisation propre, mais faite UNIQUEMENT dans Mon Projet (`contenuFormations()`), pas dans Découverte.
6. Bouton de validation renommé dynamiquement : "Valider le diplôme" / "Valider le titre" / "Valider le CQP" (fonction `libelleValiderFormation()`).

Fonctions/constantes touchées côté Mon Projet : `contenuFormations()`, `wireFormation()`, `wireFormationTypeEtape1()` (nouvelle), `formationBrouillonPeutAjouter()`, `libelleValiderFormation()` (nouvelle) — toutes dans `js/app.js`.

### Ce qui n'a PAS été touché
Le fichier `modules/decouverte-competences/decouverteParcours.js` n'a **pas été modifié**. C'est un choix délibéré, validé avec l'utilisateur après avoir constaté que cette zone y est nettement plus fragile qu'imaginé au départ.

### Pourquoi c'est plus risqué là-bas qu'on ne le pensait
Dans Découverte, "Formation" n'est pas une simple fonction de rendu plate comme dans Mon Projet : c'est un **palier** d'un assistant multi-étapes avec verrouillage entre paliers (fonction `contenuBlocFormation()`, ~ligne 2266 de `decouverteParcours.js`) :

- Le palier "Niveau d'études" pose d'abord une question fermée "Avez-vous un diplôme à mentionner ?" (Oui/Non) — le "Non" joue déjà un rôle proche de "Sans diplôme", mais ce n'est pas un vrai mapping 1:1 avec le nouveau `TYPES_FORMATION_MON_PROJET` à 4 choix.
- Si "Oui" : pastilles de niveau (`NIVEAUX_DIPLOME_SIMPLES`) **en premier**, PUIS pastilles de type (`TYPES_CREDENTIAL_FORMATION`, qui n'a que 3 valeurs : diplome/titrepro/cqp, pas de "sans diplôme" dedans) — c'est l'ordre INVERSE de ce qu'on veut reproduire.
- Le palier suivant ("Certifications") reste **verrouillé** (`palierVerrouille()`) tant que le palier "Niveau" n'a pas été explicitement fermé (`d.niveauReplie`) — logique de verrouillage à re-vérifier ligne par ligne si l'ordre change.
- Fonctions `formationNiveauRenseigne()` / `formationNiveauManquant()` (~ligne 1981-2015) codent la condition de complétude du palier ET le message d'incitation — elles testent `infos.formation.niveau` (doit être déjà rempli) puis `typeCredential`, dans CET ordre précis.
- Le bouton "Modifier" d'un palier déjà répondu a un historique documenté de bugs réels ("je clique Modifier, ça supprime tout au lieu de rouvrir", "je choisis un autre niveau et je peux déjà passer à Certifications sans avoir validé") — chaque bug a été corrigé un par un, avec des garde-fous précis (`etat.formationPalierOuvert`) qui dépendent de l'ordre actuel des champs.
- La fonction `niveauFormationAffiche()` et les constantes `NIVEAUX_AVEC_CATALOGUE_SECTEURS` / `TYPES_CREDENTIAL_FORMATION` / `contenuMissionsFormationBrouillon()` sont **partagées** entre les deux fichiers (commentaires explicites "jamais 2 définitions séparées") — toute évolution doit rester compatible avec Mon Projet aussi.

Autres points d'ancrage dans le code (`decouverteParcours.js`, numéros de ligne au 2026-08-03, à re-vérifier avant de coder si le fichier a bougé) : ~1568/1575 (réutilisation de `NIVEAUX_DIPLOME_SIMPLES`), ~1761-1763 (valeur par défaut `typeCredential: 'diplome'`), ~2144-2149, ~2285-2311 (rendu niveau+type), ~2341 (résumé du palier replié), ~2900, ~3082, ~3094, ~3274-3312 (câblage des clics, y compris un chemin "Continuer quand même" côté Découverte aussi).

### Recommandation
Deux options à trancher avec l'utilisateur avant de coder :
1. **Option prudente** : ajouter SEULEMENT l'échelle RNCP 1-7 + le message de repère pour Titre pro/CQP dans Découverte (en gardant l'ordre actuel niveau→type), sans toucher à la mécanique de paliers/verrouillage. Risque faible, apporte une partie de la cohérence demandée.
2. **Option complète** : inverser réellement l'ordre (type avant niveau) comme dans Mon Projet. Risque de régression réel sur un parcours très testé — nécessite de tester en conditions réelles TOUS les cas (Oui, Non, Sans diplôme, Diplôme, Titre pro, CQP, clic "Modifier" sur un palier déjà répondu, enchaînement vers "Certifications") avant de considérer que c'est fait.

---

## Chantier 2 — Pastilles vertes génériques : clic = suppression partout (à transformer en "texte = édition, croix = suppression") [TERMINÉ le 2026-08-03]

**Fait** : `blocERIP()`/`wireBlocERIP()` (`js/app.js`) généralisés avec un nouveau `config.resumeOnEditer`, opt-in, jamais appliqué aux blocs `resumeHTML` (Métiers recommandés/Pistes/Analyse de profil, page Faisons le point — vérifié en direct, aucun changement visible là-bas). Nouvelles classes CSS scopées `.resume-bloc-erip .pastille-mini-*` (vertes, cohérentes avec l'existant) réutilisant la structure déjà éprouvée de `blocPastillesEditables`.
- **Vous** : coordonnées/permis → ouvre juste la sous-section (formulaire déjà éditable) ; langues → nouveau panneau d'édition inline (aucune donnée perdue, `{langue, niveau}` déjà conservé) — la sous-section Langues n'avait plus AUCUNE liste des langues existantes depuis un chantier précédent (`blocLangues()` déprécié), même bug que Formations, corrigé au passage.
- **Parcours** : certifications → réutilise tel quel le panneau `avecEditionPastille` déjà existant. Formations → décision produit prise avec l'utilisateur (option "champs additifs" retenue plutôt que la reconstruction approximative) : `typeCredential`/`niveauRNCP` désormais stockés en plus du libellé final sur `dossier.formations[i]`, aux 2 points d'ajout (`ajouterFormationBrouillon` dans Mon Projet, transmission finale dans Découverte) — purement additif, aucun des ~15 lecteurs existants impacté. Nouvelle liste des formations déjà ajoutées (absente jusqu'ici, même bug que Langues) avec réouverture EXACTE du même brouillon type+niveau qu'à l'ajout ; repli propre pour les formations plus anciennes/ajoutées via catalogue (sans ces 2 champs) : brouillon vide avec intitulé/année/missions repris.
- **Experiences perso / Loisirs / Engagements** : même réutilisation directe du panneau `avecEditionPastille` existant.
- **Projet / Candidature** : simples listes de pastilles à choix ou formulaires déjà entièrement éditables une fois la sous-section ouverte — aucun panneau dédié nécessaire.

Testé en direct dans le navigateur (édition/suppression sur les 6 blocs, décalage d'index correct après suppression pendant une édition en cours, repli formations sans champs stockés, "Sans diplôme" qui remplace une formation en cours d'édition, bouton Annuler, non-régression de l'ajout normal d'une formation, couleur verte confirmée vs bleu des catalogues). Les 26 tests `node:test` existants passent toujours.

**Repéré au passage, non corrigé (hors périmètre)** : le tooltip de `resumeVous()` (`js/app.js`, construction de `tooltip` pour le chip "Coordonnées") utilise encore des tirets longs (` — `) entre civilité/adresse/téléphone/email — à corriger dans un futur passage tirets longs.

### Contexte (état AVANT ce chantier, conservé pour l'historique)
Plusieurs fois au fil de la conversation d'origine, l'utilisateur a décrit un bug/gêne : "je clique sur la pastille verte, elle se supprime direct, au lieu de rouvrir le panneau pour corriger". Un premier chantier (le 2026-08-03, déjà commité) a résolu ce problème **à l'intérieur de chaque accordéon ouvert**, pour 4 rubriques (Loisirs, Engagements, Certifications, Expérience/savoir-être) : voir `blocPastillesEditables()` / `wireCataloguePastillesEditables()` / le flag `config.avecEditionPastille` dans `js/app.js`. Là, le clic sur le texte ouvre un panneau d'édition, le clic sur la croix (`✕`, élément DOM séparé) supprime.

**Ce chantier-là ne suffit pas** : il existe un DEUXIÈME mécanisme, plus générique, qui a exactement le même défaut et qui n'a pas été touché.

### Le mécanisme non corrigé
Fonction `blocERIP(config)` (`js/app.js`, ~ligne 7860-7885 au 2026-08-03) — construit le **résumé** de chaque bloc/carte de la page "Mon projet" (Vous, Parcours, Expériences et savoir-faire personnels, Projet professionnel, Compléments, Candidature), visible que la carte soit ouverte OU repliée. Chaque élément du résumé est rendu ainsi :

```js
return '<span class="pastille actif' + (supprimable ? '' : ' pastille-lecture') + '"' +
  (supprimable ? ' data-bloc-resume="' + config.id + '" data-resume-index="' + i + '"' : '') +
  ... + echapperAttribut(item.label) + (supprimable ? ' &#10005;' : '') + '</span>';
```

Le texte ET le `✕` sont dans le **même** `<span>`, avec un **seul** gestionnaire de clic (`wireBlocERIP()`, ~ligne 8047-8053) :

```js
document.querySelectorAll('[data-bloc-resume="' + config.id + '"]').forEach(function (el) {
  el.addEventListener('click', function () {
    var idx = parseInt(this.dataset.resumeIndex, 10);
    if (config.resumeOnSuppression) { config.resumeOnSuppression(idx); }
    rerender();
  });
});
```

Cliquer n'importe où sur cette pastille (texte OU croix) supprime l'élément — exactement le bug décrit par l'utilisateur pour ce niveau-là.

### Où ce mécanisme est utilisé
Toutes les cartes de "Mon projet" définissent un `resume:` (fonction retournant une liste `{label, source, index}`) — trouvés dans `js/app.js` :
- `resumeVous` (bloc "Vous" — identité, mobilité/permis, langues : **à vérifier en détail ce qui y apparaît vraiment**, permis et langues n'ont peut-être pas d'entrée ici, à confirmer avant de coder)
- `resumeParcours` (Formations + Certifications, `js/app.js` ~ligne 8330)
- `resumeExperiencesPerso`
- `resumeProjet`
- `resumeCandidature`
- `resumeComplements` (Loisirs + Engagements)

**Attention** : `blocERIP()` est aussi utilisé **hors de la page "Mon projet"**, sur la page "Faisons le point"/Révélation, avec un mode `resumeHTML:` différent (pas `resume:`/`resumeOnSuppression:`) pour "Métiers recommandés", "Pistes à explorer", "Analyse de votre profil" — ces cartes-là affichent des métiers/analyses, PAS des choix éditables par la personne. Il ne faut **surtout pas** leur appliquer le même comportement "clic texte = édition" (il n'y a rien de sensé à rouvrir). Toute modification du clic générique doit être un comportement **opt-in** (un nouveau flag de config, ex. `config.resumeOnEditer` ou similaire), jamais un changement de comportement par défaut sur `blocERIP()`/`wireBlocERIP()`.

### Le vrai défi technique (au-delà du simple split texte/croix)
Séparer visuellement texte et croix (comme déjà fait pour `blocPastillesEditables`) est la partie facile. La partie difficile : **que fait-on au clic sur le texte ?**

- Pour Loisirs/Engagements/Certifications/Expérience-savoir-être : la cible existe déjà (le panneau d'édition construit lors du chantier du 2026-08-03, `_catalogueEditionOuverte[config.cle]`) — il suffit d'ouvrir le bon bloc + la bonne sous-section + positionner cet état sur le bon index, puis `rerender()`.
- Pour **Formations** : **aucune cible d'édition n'existe**. `dossier.formations[i]` ne stocke que `{niveau, intitule, annee, missions}` — le `niveau` est déjà une CHAÎNE FINALE calculée par `niveauFormationAffiche()` (ex. "Titre professionnel", "Bac général") : le type d'origine (`typeCredential`) et le niveau RNCP choisi (`niveauRNCP`) sont **perdus** après l'ajout. Rouvrir pour "vraiment" éditer nécessiterait soit (a) une reconstruction avec perte d'information (fragile — on ne peut pas redistinguer un Bac choisi explicitement d'un "Bac général" par défaut, ni retrouver le niveau RNCP d'un Titre pro/CQP), soit (b) un changement de FORME des objets `dossier.formations` (garder `typeCredential`/`niveauRNCP` en plus du texte final) — ce qui touche potentiellement de nombreux points de lecture ailleurs dans l'app (le code a déjà des commentaires avertissant que `dossier.certifications`/`dossier.formations` sont lus "tels quels" à une quinzaine d'endroits). **Décision produit à prendre avec l'utilisateur avant de coder** : accepter une reconstruction approximative, ou changer la forme des données (avec l'audit d'impact que ça implique) ?
- Pour **Permis/mobilité** et **Langues** : vérifier d'abord s'ils apparaissent bien dans un `resume:` de ce type avant de supposer qu'ils sont concernés.

---

## Chantier 3 — Aide contextuelle sur TOUTES les fenêtres de l'application [TERMINÉ le 2026-08-03]

**Fait** : recensement complet de 34 fenêtres réelles (19 `ouvrirFenetreERIP()` directes + 15 via le wrapper `ouvrirPanneauGuide()`, désormais étendu avec un 3e paramètre optionnel `aideContexte`) + les 7 étapes du parcours Découverte (en plus de `choix-assistant-ia` déjà existant), soit ~25 nouvelles clés `AIDE_FENETRES` (certaines mutualisées entre plusieurs fenêtres proches, ex. `metiers-associes` couvre 7 fenêtres de listes de métiers associés). `detecterFenetreAideActive()` étendu avec une empreinte de contenu par étape Découverte (`[data-recherche]`, `#decouverteNom`, `#decouverteRecitTexte`, `#zoneCollageAutoDecouverte`, `[data-fragment-id]`, `[id^="reponseCiblee"]`, `[data-panel-infocompl]`), vérifiées absentes ailleurs dans l'app avant utilisation. Ton des textes : simple et rassurant, en cohérence avec le public cible (voir mémoire dédiée). Au passage, la note d'aide existante sur la page "Mon projet" (`AIDE_PAGES.projet`, l'entrée "Corriger un choix") a été mise à jour pour refléter le chantier 2 (couvre désormais les 6 bandeaux, pas seulement les 4 catalogues d'origine).

Testé en direct dans le navigateur (bout en bout : détection + halo + contenu de la bulle) sur un échantillon représentatif de chaque famille, y compris régression sur `choix-assistant-ia` (toujours fonctionnel) et les 7 étapes Découverte (dont une inatteignable en pratique sans réponse IA réelle avec questions ciblées — `decouverte-questions-ciblees` — vérifiée uniquement par lecture de code, sélecteur `[id^="reponseCiblee"]` confirmé présent dans le code source). Les 26 tests `node:test` existants passent toujours.

### Contexte (état AVANT ce chantier, conservé pour l'historique)
Un bouton d'aide contextuelle 💡 existe déjà (créé le 2026-08-02/03) avec deux niveaux :
- `AIDE_PAGES` (`js/app.js` ~ligne 20114) : aide par PAGE entière (cv, objectif, activites, projet, revelation, resultats...), déjà couvre pas mal de pages.
- `AIDE_FENETRES` (`js/app.js` ~ligne 20184) : aide par FENÊTRE/modale (pop-up ouverte par-dessus une page) — **une seule entrée existe aujourd'hui : `'choix-assistant-ia'`**, pour la fenêtre "Choisir votre assistant IA".

Détection de la fenêtre active : `detecterFenetreAideActive()` (~ligne 20199) — lit soit `document.getElementById('fenetreERIP').dataset.aideContexte` (une fenêtre générique `ouvrirFenetreERIP()` peut porter cette étiquette), soit une empreinte de contenu spécifique pour les fenêtres de Découverte qui n'utilisent pas `ouvrirFenetreERIP()`.

### Ce que l'utilisateur veut
Étendre ce même principe d'aide contextuelle à **toutes** les fenêtres de l'application (confidentialité, "ressources à explorer", les catalogues Oui/Non type Loisirs/Certifications, les fenêtres d'import, les avertissements, etc.) — peu importe le parcours. Cet engagement a été noté explicitement en mémoire comme "à faire à part" après la fin des chantiers D/E (tous les deux maintenant terminés) — c'est donc mûr pour être attaqué.

### Comment procéder
La plomberie existe déjà et fonctionne (prouvée sur `choix-assistant-ia`) — le travail restant est surtout un travail de **recensement et de rédaction**, pas une difficulté technique nouvelle :
1. Recenser tous les appels à `ouvrirFenetreERIP(` dans `js/app.js` (**39 occurrences au 2026-08-03** — à re-grep pour une liste à jour) : chaque fenêtre qui mérite une aide doit recevoir un `config.aideContexte` (une clé courte, ex. `'import-cv'`, `'confidentialite'`...).
2. Ajouter l'entrée correspondante dans `AIDE_FENETRES`, avec le même format que l'entrée existante (`selecteur`, `icone`, `titre`, `texte`).
3. Pour les fenêtres du parcours Découverte qui n'utilisent pas `ouvrirFenetreERIP()` (détection par empreinte de contenu, cf. 2e branche de `detecterFenetreAideActive()`) : étendre cette fonction avec une empreinte par fenêtre, sur le même modèle que celle déjà écrite pour `choix-assistant-ia`.

### Point de vigilance
Le risque principal ici n'est pas technique mais **d'exhaustivité** : avec ~39 fenêtres génériques rien que côté `ouvrirFenetreERIP`, plus les fenêtres spécifiques à Découverte, il est facile d'en oublier. Prévoir une checklist explicite plutôt que d'avancer fenêtre par fenêtre sans liste de référence. Garder aussi le même ton/format que les entrées déjà écrites (`AIDE_PAGES`/`AIDE_FENETRES` existantes) pour la cohérence.

---

## Autres chantiers en attente (retrouvés dans la mémoire persistante, non traités aujourd'hui)

Ces éléments viennent de sessions précédentes (avant celle-ci) et restent ouverts. Détails complets dans les fichiers de mémoire cités entre parenthèses si besoin de creuser.

1. **[TERMINÉ le 2026-08-04] Missions des formations/certifications dans le CV exporté** — un mécanisme complet existait déjà (`dossier.ia.cv.recommandations.formationRetenue`/`certificationsAMettreEnAvant`, piloté par l'IA via le prompt `cv.md`), construit dans une session antérieure non répercutée dans cette doc. L'utilisateur confirme que ce mécanisme couvre le besoin (pas de sélection automatique sans IA à coder). Vérifié en conditions réelles avec une formation ayant la forme exacte du parcours Découverte (`typeCredential`/`niveauRNCP`) : sélection correcte parmi plusieurs candidates, missions IA injectées, affichage bien gaté par le choix "mettre en avant" de la personne. Aucun code écrit, seulement vérifié. Détails dans [[project_chantier_missions_formations_certifications_cv]].

2. **Découpage de `js/app.js`** (17 000+ lignes, 365 fonctions) en plusieurs fichiers — volet 2 d'un chantier dont le volet 1 (26 tests `node:test` sur des fonctions pures, dossier `tests/`) est fait. Condition posée pour démarrer : attendre que le chantier "Projet XXL/Composeur/A5/Intégral" se stabilise. **Ce chantier est maintenant marqué terminé** (Groupe E de l'audit UX, 2026-08-03) — à reconfirmer avec l'utilisateur si le moment est venu de relancer ce volet 2. Si oui, refaire une analyse de dépendances À JOUR avant de choisir les points de coupe (le code a bougé depuis la dernière estimation) ; le risque principal est l'ordre de chargement des balises `<script>` dans `index.html`, pas la découpe elle-même.

3. **[TERMINÉ le 2026-08-03] Icônes modernes CV Word** — testé en conditions réelles dans l'app. Raccourci direct trouvé (voir point 4) : `genererBlobDocumentActif('cv')` appelable sans passer par l'IA en renseignant `etatApercuInline.cv.modele='composeur'` + `.couleur='projetxxl-...'` + `.reglagesProjetXXL.iconesRubriques/iconesCoordonnees`. Blob `.docx` inspecté via un mini-parseur ZIP écrit à la volée (`DecompressionStream('deflate-raw')`, aucune lib externe) : glyphes emoji confirmés présents/absents selon les 2 réglages, testés indépendamment et ensemble. Détails dans [[project_chantier_icones_modernes]].

4. **[TERMINÉ le 2026-08-03] 2 nouveaux modèles Créatif Word ("pastille" et "bandeauSerif")** — testé en conditions réelles dans l'app (même raccourci que le point 3, technique bien plus fiable que l'ancien script Node autonome car emprunte le vrai chemin de code de l'app). Piège rencontré : poser `creatifActif`/`creatifModele` seuls ne suffit pas (le rendu ne force que 3 champs cachés à la génération) — il faut aussi répliquer `Object.assign(reglagesProjetXXL, CREATIF_MODELES_XXL[nom].reglages)` + la couleur hex, comme le fait réellement `_appliquerModeleCreatifXXL()`. Une fois cela fait : accent bordeaux/police Century Gothic confirmés pour "pastille", accent bleu ardoise/police Georgia confirmés pour "bandeauSerif", icônes présentes dans les deux. Détails dans [[project_chantier_2_nouveaux_modeles_creatif]].

---

## Comment reprendre
Dire "on reprend le chantier [nom]" ou pointer directement vers ce fichier suffit — il contient tout le contexte nécessaire, pas besoin de retracer la conversation d'origine. Pour le chantier 1 et 2 notamment, commencer par relire le code cité (les numéros de ligne sont approximatifs et peuvent avoir bougé) avant de modifier quoi que ce soit.

**Mise à jour du 2026-08-03, fin de journée** : les 3 chantiers principaux ci-dessus (Découverte "type avant niveau", pastilles génériques éditables, aide contextuelle toutes fenêtres) sont désormais **tous terminés et testés en direct**. Il ne reste que les 4 tâches mineures listées dans "Autres chantiers en attente" ci-dessus, plus un sweep tirets longs plus large repéré en cours de route (~40+ occurrences dans `js/app.js`, dont certaines touchent le texte des CV/documents exportés — chantier à part, voir [[project_regle_jamais_grand_trait_cv]]).

**Mise à jour du 2026-08-04** : les points 1, 3 et 4 ci-dessus sont désormais **terminés** (point 1 : aucun code nécessaire, mécanisme déjà existant confirmé suffisant par l'utilisateur ; points 3 et 4 : testés en conditions réelles dans l'app grâce à un nouveau raccourci direct `genererBlobDocumentActif()` + extraction ZIP maison, réutilisable pour tout futur test Word sans passer par l'IA). Le sweep tirets longs est également **terminé** : tout le dépôt passé en revue (pas seulement `js/app.js`), y compris les fichiers de génération de documents (`exportDocxNatifCV*.js`, templates HTML) où plusieurs tirets longs apparaissaient littéralement dans les CV exportés — corrigés et vérifiés en conditions réelles. Seul reste le point 2 (découpage `js/app.js`, volontairement laissé de côté).
