# Module « Regard recruteur » — architecture technique

> Une lecture de CV comme un recruteur peut la voir. **Uniquement du conseil** :
> le module ne modifie jamais le CV (décision Denis 2026-09-03, clôture option A).
>
> Maquette figée : `docs/MAQUETTE_REGARD_RECRUTEUR_PARCOURS_2026-09-03.html`
> Schéma de sortie figé : `docs/CHANTIER_REGARD_RECRUTEUR_SCHEMA_SORTIE_2026-09-03.md`
> Prompt : `prompts/regard-recruteur.md`
> Protocole de test du prompt : `docs/PROTOCOLE_TEST_PROMPT_REGARD_RECRUTEUR_2026-09-03.md`

## Fichiers du module

| Fichier | Rôle | Testé |
|---|---|---|
| `rapportResponseParser.js` | Interprète la réponse collée en `RapportRegardRecruteur`. Autonome (aucune dépendance dure à `js/app.js`). | `tests/regardRecruteurResponseParser.test.js` (18) |
| `promptBuilder.js` | Résout les 8 placeholders de `prompts/regard-recruteur.md`. Repli intégral embarqué. | `tests/regardRecruteurPromptBuilder.test.js` (11) |
| `index.js` | Parcours : état, route `regard-recruteur`, les 8 vues, sauvegarde/restauration. | `tests/regardRecruteurIndex.test.js` (9, helpers purs) |
| `regard-recruteur.css` | Styles, teinte sarcelle, valeurs `[data-theme="sombre"]`. | — |

`index.js` et les `*.css` **ne sont pas chargés par les tests Node** : le test
navigateur reste obligatoire pour tout changement qui les touche.

## Patron

Page routée (jamais une fenêtre modale), même patron que `Comparer mes pistes`
et `Découvrir mes compétences` :

- L'état de la session vit dans la closure de `ouvrirRegardRecruteur()`
  (`_regardRecruteurEtat`, objet de données pures, sérialisable tel quel).
- `pageRegardRecruteur()` (cible de la route `regard-recruteur`) : redessine la
  vue courante si une session existe, sinon renvoie à `regard-recruteur-intro`.
- Famille 2 (dépôt + assistant) : bouton « Revoir la présentation » sur tous les
  écrans de travail, encart « Continuer / Recommencer » + gel à la reprise.

### Les 8 vues (`etat.vue`)

`preparer` → `masquer` (détour) → `choix-assistant` → `chez` (transition) →
`coller` → `regard` → `fiche`. `erreur-lecture` est atteinte depuis `coller`
quand le parser lève `reponse_illisible`.

Barre d'étapes (4 pastilles) : Préparer / Envoyer / Le regard / Ma fiche
(`_rrEtapeIndex`).

## Briques partagées réutilisées (jamais recopiées)

`barreEtapesModule`, `barreNavigation`, `htmlBandeRepriseModule`,
`htmlEncartRepriseModule`, `appliquerGelModule`, `armerFinPulseEncartReprise`,
`noteRevoirModuleDejaVue`, `ouvrirAssistantDepotCV` (Mode texte uniquement, depuis
le 2026-09-17 : dépôt texte/PDF/Word/photo avec relecture intégrée - le mode image
du module reste son propre chemin `FileReader`/`dataUrl`, l'image doit rester en
mémoire pour l'outil de masquage, ce que le dépôt partagé ne permet pas),
`htmlChoixAssistantBilanCorps`, `ASSISTANTS_IA`,
`ETAPES_DETAIL_CHOIX_IA`, `htmlBanniereTransitionIA` + `_etatTransitionIA` +
`_intervalleDecompteIA`, `htmlCollageInstantane` / `activerCollageInstantane`,
`bilanCorpsCiblageOffreHTML` / `bilanCablerCiblageOffre` / `bilanLireCiblageOffre`,
`htmlVerificationDocument` / `cablerVerificationDocument` (mode texte **et**
mode image : outil de rectangles dans le navigateur, une image à la fois,
`onEnregistre` télécharge la copie masquée + marque `img.masquee = true`),
`reperesBoutonAncre` / `reperesBrancherBoutonAncre`, `confirmerAction`,
`echapperAttribut`, `copierTexteVersPressePapier`, `trackEvenement`.

Le module appelle ces globales directement (garde `typeof … === 'function'`),
comme `comparer-pistes`. L'extraction d'un socle commun détachable (objectif
« Niveau 2 », maquette en-tête) reste un refactor **séparé et ultérieur**, à
faire quand `js/app.js` est libre — pas dans ce chantier.

## Câblage dans les fichiers partagés — À APPLIQUER EN DERNIER

> Ces 4 fichiers sont aussi touchés par le chantier ATS (fenêtre parallèle).
> N'appliquer ces éditions **que** quand `git status` montre ces fichiers
> propres, et **committer aussitôt**. `git add` fichier par fichier, jamais
> `git add -A`.

### 1. `js/app.js` — table `routes` (~ ligne 3485)

Après `'regard-recruteur-intro': pageIntroRegardRecruteur,` ajouter :

```js
  // Module « Regard recruteur » (modules/regard-recruteur/index.js). Même
  // patron que 'comparer-pistes' : 'regard-recruteur-intro' = présentation
  // (data/metiers.js), 'regard-recruteur' = le parcours lui-même, page routée.
  'regard-recruteur': pageRegardRecruteur,
```

### 2. `js/app.js` — registres de prompts (~ ligne 23515)

Dans `FICHIERS_PROMPTS_EXTERNES` ajouter :
`'regard-recruteur': 'prompts/regard-recruteur.md',`
Dans `promptsExternesCharges` ajouter : `'regard-recruteur': null,`

### 3. `js/app.js` — pont disquette (~ ligne 32744 / 32756)

Dans `collecterEtatsModulesPourSauvegarde()` :
`regardRecruteur: typeof regardRecruteurExporterEtatPourSauvegarde === 'function' ? regardRecruteurExporterEtatPourSauvegarde() : null`

Dans `restaurerEtatsModules()` :
`if (typeof regardRecruteurRestaurerEtatDepuisSauvegarde === 'function') { regardRecruteurRestaurerEtatDepuisSauvegarde(modulesEtat.regardRecruteur || null); }`

### 4. `index.html`

Feuille de style, après la ligne `comprendre-les-chiffres.css` (~ ligne 36) :

```html
  <!-- Module « Regard recruteur » — voir modules/regard-recruteur/ARCHITECTURE_TECHNIQUE.md. -->
  <link rel="stylesheet" href="modules/regard-recruteur/regard-recruteur.css">
```

Scripts, après `modules/comprendre-les-chiffres/index.js` (~ ligne 439) — l'ordre
importe : `rapportResponseParser.js` et `promptBuilder.js` **avant** `index.js` :

```html
  <script src="modules/regard-recruteur/rapportResponseParser.js" charset="UTF-8"></script>
  <script src="modules/regard-recruteur/promptBuilder.js" charset="UTF-8"></script>
  <script src="modules/regard-recruteur/index.js" charset="UTF-8"></script>
```

### 5. `tests/_domStub.js` (~ ligne 56)

Ajouter `'pageRegardRecruteur'` à la liste des noms de fonctions de page
stubées (sinon **tous** les tests Node cassent — LECONS 1quater).

### 6. `data/metiers.js` — `pageIntroRegardRecruteur()` (~ ligne 7247)

Aligner sur `pageIntroAideDecision()` :
- retirer `ctaDesactive: true` et `ctaNote: _NOTE_MODULE_EN_PREPARATION` ;
- ajouter le détour de consultation (`_regardRecruteurDetourPresentation`,
  `detourBoutonId`, `detourCtaId`, `onRevenir: regardRecruteurRevenirDeLaPresentation`,
  `onRevenirExpr`) et `etapes: RR_ETAPES` ;
- `onCta` :

```js
    onCta: function () {
      var enCours = typeof _regardRecruteurRenduVue === 'function';
      if (!enCours && typeof ouvrirRegardRecruteur === 'function') { ouvrirRegardRecruteur(); }
      else if (enCours) { _regardRecruteurReprisePendante = true; }
      if (typeof naviguerVers === 'function') { naviguerVers('regard-recruteur'); }
    },
```

- ajouter `carteRetour: 'preparer'` reste tel quel.

### Après câblage : test navigateur obligatoire

Serveur `site-v2-python-server` (port 8123). Parcourir les 8 vues en clair
**et** en sombre. Points sensibles :

- `preparer` : ajout / retrait d'images (max 3, `FileReader` → `dataURL`) ;
  statut « à masquer / masquée » par image ; « Choisir mon assistant » actif
  seulement quand **toutes** les images sont masquées (ou case « déjà masquées
  moi-même ») ; bascule Mode texte ↔ image ; bloc ciblage détecte l'URL de l'offre.
- `masquer` mode **image** : `htmlVerificationDocument({mode:'image'})` — canvas,
  cliquer-glisser pour dessiner un rectangle, cliquer un rectangle pour l'enlever,
  rotation, Agrandir ; « Enregistrer » télécharge la copie masquée + passe à
  l'image suivante ; onglets si plusieurs images ; « continuer » actif quand tout
  est masqué. Vérif : image d'origine jamais modifiée ; canvas non tainté
  (`toBlob` OK avec un `dataURL`).
- `masquer` mode **texte** : `htmlVerificationDocument` surligne les coordonnées ;
  « C'est relu » ne s'active qu'après « Enregistrer ».
- `choix-assistant` → `chez` : le presse-papiers contient bien le prompt
  (`promptBuilder`) ; décompte 5 s → ouverture ; phase bloquée / ouverte / revenu.
- `coller` : rond de collage inactif tant que la phase n'est pas « revenu » ;
  « Lire la réponse » → `regard`, ou → `erreur-lecture` si JSON absent.
- `regard` : 6 axes en mode image, 4 en mode texte ; « Décoder les questions »
  replié ; « Écrire ma réponse » facultatif ; boutons « Garder comme Repère ».
- `fiche` : Imprimer (`window.print`, `@media print`), Télécharger `.doc`,
  Copier ; ancres Repère par point.

## Écarts assumés vs maquette (v1)

| Point maquette | v1 | Raison |
|---|---|---|
| Aperçu / vignette des images ajoutées | Nom du fichier + statut « à masquer / masquée ✅ » | Depuis 2026-09-08 les images sont gardées en `dataURL` (pour l'outil de masquage) ; une vraie vignette reste possible plus tard. |
| ~~Outil de rectangles dans le navigateur (masquage image)~~ | **FAIT (2026-09-08, option A)** : écran « Masquer » image = `htmlVerificationDocument({mode:'image'})` + `cablerVerificationDocument`, une image à la fois, `onEnregistre` télécharge la copie masquée et marque `img.masquee`. Escape hatch : case « Je les ai déjà masquées moi-même », ou passer en Mode texte. | Décision 4 du chantier tranchée par Denis (« branche l'outil »). |
| Sélection groupée « quels points je garde » + choix du type ensuite | Un bouton « Garder comme Repère » par point (mécanisme `reperesBoutonAncre` déjà éprouvé) | Maquette : zone groupée « à fusionner », Denis re-parcourt pour trancher (maquette, section « BOUTON REPÈRE »). |
| Export Word « même format que le CV et la lettre » | `.doc` = HTML enveloppé (Word l'ouvre) | Le pipeline `exportDocxNatif*` est lourd ; un `.doc` HTML rend le service (imprimer + copier e-mail sont les deux essentiels demandés par Denis). |
| Renvois vers d'autres modules en clôture | Absents | Emplacement réservé, à câbler avec le chantier « Cohérence entre les modules » (maquette). |
