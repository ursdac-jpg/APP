# Étape 0 : préparation de la phase de code (refonte du parcours guidé)

> Livrable de l'étape 0 du §8 de `PLAN_CONSOLIDE_REFONTE_PARCOURS_GUIDE_2026-09-02.md`.
> Pas de code fonctionnel ici. Deux choses :
> 1. l'inventaire GARDÉ / DÉPLACÉ / FUSIONNÉ / ENRICHI par écran ;
> 2. le grep de tous les libellés à renommer + la checklist des lecteurs `dossier.*` du §6.
>
> Règle de travail (rappel) : un commit par sous-étape, `npm test` (réf 603+ verts)
> + test navigateur `nouveau` / `maj` / `pret` + Découverte à chaque sous-étape,
> jamais un état à moitié refondu, commits directement sur `master`.

---

## PARTIE 1 : renommage (étape 1)

### 1.1 Les 3 constantes de barre d'étapes (`data/metiers.js`)

| Constante | Ligne | Libellé actuel | Cible | Note |
|---|---|---|---|---|
| `CREER_CV_NAV_ETAPES` (`nouveau`) | 3384 | `Objectif` | **Votre objectif** | |
| | 3385 | `Votre parcours` | *(inchangé)* | |
| | 3386 | `Mon projet` | **Vos informations** | |
| | 3387 | `Faire le point` | **Votre profil** | |
| | 3388 | `Assistant` | *(inchangé)* | |
| | 3389 | `Mes documents` | **Vos documents** | |
| `PREPARER_LETTRE_ENTRETIEN_NAV_ETAPES` (`pret`) | 3357-3359 | `Préparer` / `Assistant` / `Réponse` | *(inchangés)* | |
| | 3360 | `Mon projet` | **Vos informations** | |
| | 3361 | `Mes documents` | **Vos documents** | |
| `MAJ_CV_NAV_ETAPES` (`maj`) | 3364-3366 | `Préparer` / `Assistant` / `Réponse` | *(inchangés)* | |
| | 3367 | `Corriger mon CV` | **`Corriger mon CV` (inchangé)** | décision §9.3 |
| | 3368 | `Mes documents` | **Vos documents** | |

### 1.2 Copies inline des barres dans les configs d'intro (`data/metiers.js`)

Les pages d'intro `pagePreparerLettreEntretien` et `pageMettreAJourCv` embarquent un
`etapes:` **recopié à la main** (pas la constante) :

| Ligne | Contexte | Action |
|---|---|---|
| 3474-3480 | `etapes:` de l'intro `pret` (`pagePreparerLettreEntretien`) | mêmes renommages : `Mon projet` -> `Vos informations`, `Mes documents` -> `Vos documents` |
| *(équivalent dans `pageMettreAJourCv`, à repérer au même endroit)* | intro `maj` | `Mes documents` -> `Vos documents` ; `Corriger mon CV` inchangé |

> Reco : au passage, faire pointer ces `etapes:` vers la constante partagée
> (supprime la duplication). Sinon, renommer les copies.

### 1.3 Barre de repli `ETAPES` (`js/app.js` 3187-3197)

Ancienne barre à 9 repères, **fallback** de `afficherProgression()` quand
`dossier.modeCreation` n'est ni `nouveau` ni `maj` ni `pret`.

| Ligne | Libellé | Statut |
|---|---|---|
| 3194 | `📋 Mon projet` | À renommer `📋 Vos informations` **si** on veut la cohérence partout ; sinon = sweep séparé (elle ne s'affiche que hors des 3 parcours refondus). **À trancher avec Denis au début de l'étape 1.** |
| 3195 | `🧭 Faire le point` | idem -> `🧭 Votre profil` |

### 1.4 Titres `<h1>` + sous-titres des écrans

| Écran | Fichier:ligne | Actuel | Cible |
|---|---|---|---|
| `pageObjectif` | `js/app.js` ~4345 (titre à repérer) | *(à vérifier)* | **Votre objectif** |
| `pageProjet` | `js/app.js` 6306 | `<h1>📋 Mon projet</h1>` | **Vos informations** |
| `pageRevelation` | `js/app.js` 8438 | `<h1>🧭 Faisons le point</h1>` + sousTitre 8439 | **Votre profil** (titre + sousTitre à réécrire, cf. maquette v9) |
| `pageResultats` | `js/app.js` 12713 | `<h1>📄 Créer mon CV</h1>` (branche `depuisDecouverte || masquerFauxChoixCv`) / sinon `🚀 Passons à l'action` | **Vos documents** (titre unique, cf. maquette VOS_DOCUMENTS) |

### 1.5 Libellés de boutons de navigation (`barreNavigation(...)`)

| Fichier:ligne | Extrait | Cible |
|---|---|---|
| `js/app.js` 6344 | `barreNavigation(..., 'revelation', '🧭 Faire le point', ...)` (bouton « suivant » de `pageProjet`) | `🧭 Votre profil` |
| *(autres `barreNavigation` citant « Mon projet » / « Faire le point » / « Mes documents » : à re-greper après renommage des constantes, il en reste peu)* | | |

### 1.6 Renvois textuels entre écrans (in-scope maintenant)

| Fichier:ligne | Extrait | Cible |
|---|---|---|
| `js/app.js` 12246 | `« Ces éléments viennent de vos étapes précédentes (« Mon projet », « Faire le point »). »` | `(« Vos informations », « Votre profil »)` |
| `js/app.js` 14426 | `« (section « 🧭 Faire le point »), où vous pouvez noter... »` | `« Votre profil »` |
| `modules/coherence-transversale/ui.js` 2181 | même phrase | `« Votre profil »` |
| `js/app.js` 30422 | aide `« Oui » vous mène vers Mon projet` | `vers Vos informations` (aide contextuelle -> étape 8, mais phrase à ne pas oublier) |
| `js/app.js` 4362 | commentaire + libellé `désormais sur "Mon projet"` | vérifier si user-visible |

### 1.7 Hors périmètre MAINTENANT (sweep séparé « Mon/Mes -> Votre/Vos », §9.5)

À tracer dans `TACHES_VALIDEES.md`, **ne pas toucher dans ce chantier** :

| Fichier:ligne | Élément |
|---|---|
| `js/app.js` 4040 | carte d'accueil `htmlCarteAccueil('mesdocuments', ..., 'Mes documents', ...)` |
| `data/metiers.js` 4204 | `INFOS_CARTE_ACCUEIL.mesdocuments` titre `Mes documents` |
| `data/metiers.js` 3616 / 3999 / 4275 / 4284 / 4299 | libellés « Créer un nouveau CV » / « Mettre à jour » de `MES_DOCUMENTS_PARCOURS` (cartes + intros) |
| `data/baseConnaissancesERIP.js` 46 | entrée d'index de recherche « Créer un nouveau CV » |
| `js/app.js` 1954-1955 | titres de démo vidéo « Compléter la page Mon projet » |
| `js/app.js` 30135 / 30205 | `AIDES_CONTEXTUELLES` (titres « Mes documents » / « Faire le point ») -> **étape 8** du plan |
| `js/app.js` 1262 | bouton `'Créer un nouveau CV'` (réponse « Non » à « votre CV est-il exploitable ») -> contexte différent, garder tel quel |

### 1.8 Commentaires de code

Des dizaines de `// TACHE (refonte Mon projet...)`, `// ... "Faire le point" ...`
dans `js/app.js`, `data/metiers.js`, `modules/decouverte-competences/decouverteParcours.js`.
**Ne pas les réécrire** (bruit, risque nul, historique utile). Éventuellement une
passe cosmétique en toute fin de chantier, jamais prioritaire.

---

## PARTIE 2 : inventaire GARDÉ / DÉPLACÉ / FUSIONNÉ / ENRICHI par écran

Légende : **G** gardé tel quel · **D** déplacé (vers un autre écran) · **F** fusionné
(plusieurs éléments -> un) · **E** enrichi (nouveau comportement / nouveau champ).
Chaque **D** doit *arriver* à destination **avant** de partir de la source (zéro trou).

### 2.1 « Votre objectif » (`pageObjectif`, `js/app.js` ~4345)

| Élément | Type | Détail |
|---|---|---|
| Choix du type d'objectif (`OBJECTIF_CHOIX_CANDIDATURE`, 6 items) | G | `definirObjectifCandidature(valeur)` (~4329) conserve le nettoyage `modeRecherche`/`typeRecherche`/`rechercheCandidature` pour stage/alternance/pmsmp. |
| Bloc « Votre candidature » (`CONFIG_BLOC_CANDIDATURE`, `js/app.js` ~10657) | D depuis `pageProjet` | Arrive ici. Adaptation par `dossier.objectif` (§3.2 du plan). Contient : métier précis/domaine, saisie assistée `baseMetiers`, bouton fiche France Travail double comportement, entreprise, lien site, lien/texte offre, intitulé poste. |
| Bloc « Le poste que vous recherchez » + « Vos disponibilités » (`CONFIG_BLOC_PROJET`, `js/app.js` ~10526 : contrat/tempsTravail/accepte/disponibilite) | D depuis `pageProjet` | Arrive ici. Disponibilités (période, dates, durée, heures hebdo) seulement pour stage/alternance/pmsmp. |
| `etatAccesRevelation()` (`js/app.js` ~6370) | G + D | Le verrou léger part avec le bloc Candidature. **Décision §9.4 : gardé tel quel** (choix du mode de recherche seulement). |
| `naviguerVers` post-objectif | G | `nouveau` -> `votre-parcours` ; `pret`/`maj` -> `projet` (ou `objectif` si « pourquoi ce CV » pas renseigné, `data/metiers.js` ~3921). |
| Question « statut / situation » | E | **NON ici** : décision 2026-09-02 = champ facultatif dans « Réglez le style » de l'Assistant. Rien à ajouter sur cet écran. |
| Habillage jetons case/radio | E | Passe à la brique commune §7 (étape 6). |

### 2.2 « Vos informations » (`pageProjet`, `js/app.js` ~6306)

Suivre `docs/PLAN_MES_INFORMATIONS_2026-09-02.md` §5. Résumé :

| Élément | Type | Détail |
|---|---|---|
| Blocs « Votre candidature » + « Projet professionnel » | D vers `pageObjectif` | Partent (voir 2.1). `modeAllege` (`pret`) ne montrait déjà que Vous / Projet pro / Candidature -> après refonte, Candidature/Projet pro n'y sont plus. |
| Bloc « Vous » (identité) | G + E | prénom/nom, 1re majuscule + chiffres par champ, Entrée-au-suivant, « Enregistrer mon identité » + résumé replié, adresse facultative, **question photo**, **retrait du bandeau coordonnées** (devient la carte lecture seule de « Vos documents »). Structure `dossier.identite` **inchangée**. |
| Bloc « Mobilité » (`dossier.permis`) | G + E | repli sur résumé après réponse véhicule. Structure `{possede, categories:[], vehicule}` inchangée. |
| Bloc « Langues » (`dossier.langues` + `languesFrancaisUniquement`) | G + E | barre alignée, invitation visible, « Autre » + Entrée. « Autre » jamais stocké comme langue. Règle niveau = texte A1-C2. |
| Bloc « Formations » (`contenuFormations`, `dossier.formations`) | G | **Réutiliser `contenuFormations` tel quel** (partagé Découverte, §6.4). Intitulé + année obligatoires. Missions par secteur conservées (piège v1 : ne pas les faire disparaître). |
| Certifications / Loisirs / Engagements / Expériences perso | G + E | contexte par élément (`avecContexte`), astuce verte en gras, retrait « Voir des exemples ». `dossier.certifications` reste des **chaînes** (ne pas objectiser). |
| Bloc « Vos expériences professionnelles » (`dossier.experiences` + `ouvrirFenetreExperiences`) | E (rapatrié) | v10 de la maquette : bloc d'entrée dédié au parcours pro (n'existait pas dans le flux guidé). Éditeur `ouvrirFenetreExperiences` = brique commune (`BRIQUES_COMMUNES.md`), réutilisé. |
| Verrou vers « Votre profil » | D | part avec le bloc Candidature -> « Vos informations » ne bloque rien, « Continuer » toujours actif. |

### 2.3 « Votre profil » (`pageRevelation`, `js/app.js` ~8409)

Suivre `docs/ENQUETE_FAIRE_LE_POINT_2026-09-02.md` §8.4. Résumé :

| Élément | Type | Détail |
|---|---|---|
| Titre + sous-titre | E | « Votre profil » + 1 phrase (cf. maquette v9). |
| Encart « Métier visé » (`banniereMetierCible()` & co, §6.3) | G, replié | Devient un **récap replié** ; « Changer » le déplie tel quel. Message « Pour choisir un autre métier, revenez à l'étape Votre objectif ». **Pas de bouton « Modifier le métier visé »**. Bouton fiche France Travail double comportement gardé. |
| « Votre profil en bref » | E | rubrique ouverte non dépliable, lignes = infos clés des étapes précédentes en lecture seule + note « pour corriger, retournez à l'étape concernée ». v10 : + Recherche, Entreprise/offre visée, Photo sur le CV, À mettre en avant. |
| « Des métiers à regarder » = `CONFIG_BLOC_METIERS` + `CONFIG_BLOC_PISTES` | F (visuel, sans fusionner les configs) | une seule liste. **Pas de « Choisir ce métier »**. Par métier : « Garder comme Repère » (`bi-bookmark-star`, brique Repères §6.6), « Comparer cette piste » (`bi-signpost-split`, brique Comparer §6.6), « Fiche du métier (France Travail) ». Infobulle « compétences en commun » (une à la fois, survol/clic-épingle), compétences colorées par famille. |
| « Vos compétences » = `CONFIG_BLOC_PROFIL` + `CONFIG_BLOC_CORRESPONDANCE` + « Ce qui fait votre valeur » | F (visuel) + E | `CONFIG_BLOC_CORRESPONDANCE` + « Ce qui fait votre valeur » restent `nouveau`-seulement (`afficherBlocsQuestionnaire`). **Décision §9.2 : garder les deux, renommés** : « Ce qui fait votre valeur » -> **« Ce que vous aimez »** ; « Ce qui pourrait vous correspondre » (`CONFIG_BLOC_CORRESPONDANCE.titre`, `js/app.js` ~8362) -> **« Des pistes à explorer »**. Compétences classées **Savoir-faire / Savoir-être / Savoirs** (les Savoirs se reconstruisent depuis les champs `savoirs` des fiches, `categorieCompetence` n'en connaît que 2). Une couleur par famille + légende. Retirables mais **pas ajoutables** ; retrait **réversible sans déplacement** (pastille grise/barrée, croix -> « Remettre »). Clic sur une compétence -> court descriptif + « Garder comme Repère ». **L'état gardé/retiré vit dans `dossier`** (survit à la navigation). |
| Barre de compatibilité / score | Supprimé | déjà abandonnée dans la maquette (cohérent avec « aucun score » des modules Repères/Comparer, §6.6). Ne pas réintroduire. |
| Repère d'ancrage bas de page (`reperesBoutonAncre` / `reperesBrancherBoutonAncre`, ~8487) | G | tel quel. |
| Variantes | G | `maj`/`pret` : pas de blocs questionnaire. `domaine` (`modeRechercheEffectif() === 'domaine'`) : pas de « Des métiers à regarder », `CONFIG_BLOC_CORRESPONDANCE` masqué. Découverte : les blocs questionnaire restent pertinents, ne pas casser (§6.4). |

### 2.4 « Assistant » (page dédiée)

Cf. `MAQUETTE_ASSISTANT` v5. 4 rectangles dépliables sur **une page**.

| Rectangle | Type | Détail |
|---|---|---|
| 1. Réglez le style d'écriture | E | 5 réglages (`dossier.preferencesIA.cv` : `niveauPoste`, `niveauLangage`, `adaptationMetier`, `ton`, `longueur`) : **4 pré-remplis, niveau du poste à choisir** (option B). + `dossier.situationActuelle` (nouveau, facultatif, null par défaut, transmis seulement si renseigné, n'adapte aucun écran). Cadre « ces choix orientent seulement l'assistant ». |
| 2. Choisissez votre assistant | G | composant partagé (`lignePastillesAssistantsIA` / `ASSISTANTS_SANS_COMPTE_IA` = ChatGPT, Perplexity). Écran d'attente `_etatTransitionIA` / `htmlBanniereTransitionIA` conservé. Bouton discret « Voir ou modifier le texte transmis ». |
| 3. Importer la réponse | G | composant d'import existant. **`ouvrirAssistantDepotCV` jamais modifié.** |
| 4. Choisir ce qui ira sur le CV | D (rapatrié dans la page) | les 9 onglets réels de `GROUPES_ONGLETS_CHOIX_IA_CV` (`js/app.js` ~20981), rendus **dans la page, jamais une fenêtre à part**. `dossier.ia.cv` / `dossier.ia.cv.recommandations` inchangés. Réouvrable depuis « Vos documents ». **Onglet `complements` (« Rubriques à masquer ») : icône 🙈 -> 🚫** (non négociable, cf. revue critique). |

### 2.5 « Vos documents » (`pageResultats`, `js/app.js` ~12691)

Cf. `MAQUETTE_VOS_DOCUMENTS` v3 + `MAQUETTE_COORDONNEES` v1 + `MAQUETTE_MISE_EN_PAGE` v6.

| Élément | Type | Détail |
|---|---|---|
| Double titre (`barre` « Mes documents » vs `<h1>` « Créer mon CV ») | F | -> **un seul titre « Vos documents »**. |
| `boiteCoordonnees` (formulaire identité dupliqué, `js/app.js` ~12202, visible si `identiteEntierementVide()`) | F -> carte lecture seule | Remplacé par la **carte « Vos coordonnées »** (maquette Coordonnées) : lecture seule, renvoi vers « Vos informations », 3 états. Lit `dossier.identite` + `dossier.permis`. **Plus de `contenuIdentite()` ici.** |
| Accordéon « Informations transmises à l'assistant » (`accordeonInfosIA`, `js/app.js` ~12228) | D vers Assistant / F | Le contenu (résumé candidature + choix assistant + import) part sur la page Assistant. Ici, éventuellement un « ce qui sera transmis » réduit à un bouton discret. |
| `sectionExperiences` + `ouvrirFenetreExperiences()` | D vers « Vos informations » | seul point d'entrée `dossier.experiences` du flux guidé -> rapatrié dans « Vos informations » (2.2). |
| Composeur (`construireContenuApercuFinalisation(docActif)`, `js/app.js` ~11413 : sélecteur de modèle, palette, aperçu A4/A5 inline) | G (machinerie interne) | réemployé **tel quel**, réintégré dans la nouvelle structure. Décision §9.1. |
| `construireContenuExportDocument(docActif)` | G + E | Export : format choisi (un bouton) + **« Copier le texte » mis en avant** + « Envoyer vers Canva » + « Télécharger en ODT » + « Faire aussi une version [autre] ». Canva / ODT = **à préciser techniquement** (revue critique). |
| Panneaux perso PDF (`modules/cv-pdf-html/cvPdfPanneauReglages.js`) + Word (« Projet XXL », `js/app.js` `etatApercuInline.cv.reglagesProjetXXL`) | G (machinerie interne) | **pas réécrits ici**. Écran dédié « La mise en page » (maquette MISE_EN_PAGE) = chantier de code séparé, après. Depuis « Vos documents » : un renvoi « Régler la mise en page -> ». |
| « Et maintenant ? » (`btnSuggererLettre` / `btnSuggererEntretien`) | G | gardé, **toujours visible en bas**. |
| `boutonRessourcesFin` -> `ouvrirFenetreRessourcesExplorer()` (lien ateliers/formations/immersions) | Supprimé | seul élément retiré de « Et maintenant ? ». |
| `depuisDecouverte` (`window._decouverteVersResultats || dossier.decouverteTerminee`) | G | `pageResultats` **paramétrée, jamais forkée** pour Découverte : la refonte doit préserver ce paramétrage. |
| `ligneEtapesAction` (sous-barre CV/Lettre/Entretien) | G | déjà masquée pour `nouveau`/Découverte. |
| `_pageOrigineAvantResultats` / `cibleRetourResultats` | G | repli « Retour » = `revelation`. |

---

## PARTIE 3 : checklist des lecteurs `dossier.*` (§6) à vérifier un par un

À cocher pendant le code (étapes 2 à 5). Chaque ligne = un point qui ne doit pas casser.

### 3.1 Génération CV / lettre / entretien (§6.1)

- [ ] `dossier.identite.*` : modèles CV PDF+Word, prompts lettre + entretien, `construireContenuApercuFinalisation`, résumés. Structure `{civilite, nom, prenom, adresse, codePostal, telephone, email, ville}` **inchangée**. Civilité « Ne pas préciser » -> logique « Monsieur » à la génération (à câbler). Ordre d'affichage prénom/nom peut changer, pas la structure.
- [ ] `dossier.permis` `{possede, categories:[], vehicule}` : modèles CV. Repli résumé = affichage seul.
- [ ] `dossier.langues` `[{langue, niveau}]` + `languesFrancaisUniquement` : modèles CV. « Autre » jamais stocké. Niveau = texte A1-C2, jamais de pastilles.
- [ ] `dossier.formations` `[{niveau, intitule, annee, typeCredential, niveauRNCP, ...}]` : modèles CV, `resumeParcours`, ~15 endroits. `contenuFormations` partagé Découverte. Intitulé + année obligatoires : vérifier qu'aucun lecteur ne suppose un intitulé vide.
- [ ] `dossier.certifications` = **chaînes** (~15 lecteurs). Ne pas objectiser. Dates/contexte -> `dossier.detailsCatalogue.certifications`.
- [ ] `dossier.experiencesPerso` / `dossier.loisirs` / `dossier.engagements` : chaîne **ou** `{texte, dateDebut, dateFin}` -> garder la tolérance des deux formes (`avecContexte`).
- [ ] `dossier.experiences` (parcours pro) : rapatrié dans « Vos informations », éditeur `ouvrirFenetreExperiences` inchangé. Vérifier tous les lecteurs (modèles CV, prompts).
- [ ] `dossier.rechercheCandidature.{entreprise, lienSite, offre, intitulePoste}` : prompts lettre/entretien, `verifierAvantPasserAction`, bannière « je postule ». **Déplacé « Mon projet » -> « Votre objectif »** : vérifier tous les lecteurs (clés inchangées).
- [ ] `dossier.contrat` / `dossier.tempsTravail` / `dossier.accepte` / `dossier.disponibilite` : modèles CV, prompts. Idem, déplacé d'écran.
- [ ] `dossier.preferencesIA.cv` `{niveauPoste, niveauLangage, adaptationMetier, ton, longueur}` : prompt builder (`js/app.js` ~20037). Aujourd'hui tout `null` par défaut. Décider : pré-remplir *et* transmettre les 4, ou afficher sans transmettre tant que non confirmé.
- [ ] `dossier.situationActuelle` (**nouveau**) : ajouter au prompt builder, transmis **seulement si non null**. N'adapte aucun écran.

### 3.2 Verrous et navigation (§6.2)

- [ ] `etatAccesRevelation()` (`js/app.js` ~6370, `blocCibleId: 'blocERIP-candidature'`) : suit le bloc Candidature vers « Votre objectif ». « Vos informations » ne bloque rien. **Gardé tel quel** (§9.4).
- [ ] `_pageOrigineAvantProjet` : capturé par `naviguerVers()`, repli « Retour » de `pageProjet`. Conserver.
- [ ] `_pageOrigineAvantResultats` / `cibleRetourResultats` : repli « Retour » de `pageResultats` = `revelation`. Conserver.
- [ ] `_creerCvNavIndex` / `_prepLENavIndex` : mapping écran -> index de barre. Les **routes ne changent pas** (`objectif`, `votre-parcours`, `projet`, `revelation`, `resultats`) : seuls les libellés changent. Vérifier que `barreEtapesModule(..., routeParIndex)` reste cohérent.
- [ ] `verifierAvantPasserAction()` : gate métier + demande entreprise. Conserver comme filet.

### 3.3 Métier cible (sous-système partagé, §6.3)

- [ ] `banniereMetierCible()` / `banniereDomaineCible()` / `wireBanniereMetierCible` / `wireRechercheMetierCible` / `wireMetierCibleGlobal` / `wireEvidenceMetierCible` / `modeRechercheEffectif()` (`js/app.js` ~6459) : utilisés par `pageRevelation` **et** le guide « recherche d'accueil » (`ouvrirPanneauEntreprise`) **et** `banniereJePostuleContenu`. Sur « Votre profil » : récap replié, « Changer » déplie tel quel. Aucune fonction retirée.
- [ ] `dossier.modeRecherche` vient désormais de « Votre objectif » : vérifier `modeRechercheEffectif()` partout où il est lu.
- [ ] Caches `invaliderCacheMetiersRecommandes()` / `invaliderCachePistes()` : ne pas casser. `construireProfil()` / `rechercherMetiers()` alimentent aussi « candidater depuis la recherche de l'accueil » (chantier séparé) : ne rien y toucher.

### 3.4 Parcours Découverte (§6.4)

- [ ] `contenuFormations` et son mécanisme de missions par secteur (`contenuMissionsFormationBrouillon`, `CATALOGUE_MISSIONS_FORMATIONS_PAR_SECTEUR`, `NIVEAUX_AVEC_CATALOGUE_SECTEURS`, `NIVEAUX_DIPLOME_SIMPLES`, `NIVEAUX_RNCP_TITRE_CQP`, `formationBrouillonPeutAjouter`, `libelleValiderFormation`, `niveauFormationAffiche`, `brouillonFormationEnCours`, `construireBrouillonDepuisFormation`, `_editionFormationExistanteIndex`) : **réutiliser, jamais réécrire**. Découverte = `TYPES_CREDENTIAL_FORMATION` ; « Mon projet » = `TYPES_FORMATION_MON_PROJET`.
- [ ] `pageRevelation` atteinte depuis Découverte : vérifier le chemin Découverte. Les blocs questionnaire (« Ce que vous aimez », « Des pistes à explorer ») pertinents pour Découverte : les masquages `nouveau`-seulement ne doivent pas casser le rendu Découverte.
- [ ] `pageResultats` paramétrée `depuisDecouverte` (jamais forkée) : préserver.

### 3.5 Bilan + Cohérence transversale (§6.5)

- [ ] Transfert Cohérence transversale -> Bilan (entreprise / offre / type de structure + recommandations CV) : vérifier qu'il lit toujours les bons `dossier.*` (clés inchangées, écran de saisie change).
- [ ] Composant partagé d'import CV / contexte de candidature (dette B.1 `BRIQUES_COMMUNES.md`, construit 2026-08-30) : vérifier si « Votre objectif » / « Vos informations » ont une fenêtre d'import à aligner dessus.

### 3.6 Repères et Comparer mes pistes (§6.6)

- [ ] `reperesBoutonAncre({libelle})` / `_reperesRenduBoutonAncre` (`modules/reperes/index.js` ~2451) + `reperesBrancherBoutonAncre()` (fin de `pageRevelation` ~8487) : réutiliser tel quel. Icône `bi-bookmark-star`, libellé « Garder comme Repère » exacts.
- [ ] `comparerBoutonPanier(nom)` (`modules/comparer-pistes/index.js` ~223) : `bi-signpost-split`, « Comparer cette piste ». Pas de score réintroduit.

### 3.7 Suivi Umami (§6.7)

- [ ] Événements liés à `pageProjet` / `pageObjectif` / `pageRevelation` / `pageResultats` (`bilan_preparer_affichee` et autres) : noms d'événements **inchangés**, vérifier qu'ils se déclenchent toujours au bon endroit après refonte.

### 3.8 Recherche (barre d'accueil + Lexique, §6.8)

- [ ] Chaque écran refondu **re-branche sa propre recherche**. Vérifier que les nouveaux blocs (« Votre candidature », « Vos disponibilités », « Votre profil en bref », carte « Vos coordonnées ») sont trouvables après refonte.

---

## PARTIE 4 : brique commune jetons / champs (§7, étape 6)

Passe visuelle des jetons (case à cocher / radio) + champs (halo focus, badges,
chevrons) présente sur les maquettes -> **composant partagé** (`BRIQUES_COMMUNES.md`
mis à jour dans le même commit), appliqué partout (contrat / disponibilité / langue
/ objectif / situation...). Jamais un CSS jetable écran par écran.

---

## Prochaine sous-étape

**Étape 1 : renommage** (isolé, bas risque). Ordre proposé :
1. Trancher avec Denis le sort de `ETAPES` (§1.3) : renommer maintenant ou sweep séparé.
2. Renommer les 3 constantes de barre (§1.1) + les copies inline des intros (§1.2).
3. Titres `<h1>` + sous-titres (§1.4) + boutons de nav (§1.5) + renvois textuels (§1.6).
4. `npm test` + test navigateur : les 3 barres s'affichent au nouveau vocabulaire, la navigation marche sur `nouveau` / `maj` / `pret` + Découverte.
5. Un commit.
