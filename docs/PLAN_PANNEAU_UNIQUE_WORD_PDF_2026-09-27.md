# Plan : le même panneau visuel « La mise en page » pour le Word que pour le PDF (2026-09-27)

> Demande de Denis (2026-09-27, en direct) : « je veux aussi avoir le même panneau visuel dans le
> word que dans le pdf ». **Règle stricte posée par Denis, à respecter à la lettre : zéro
> régression sur le PDF.** Rien de ce qui se passe aujourd'hui en `dossier.formatCV === 'pdf'` ne
> doit changer de comportement.
> Suite de `docs/CHANTIER_WORD_DEPUIS_PDF_2026-09-26.md` (phase 8) et de
> `docs/PASSATION_WORD_NUIT_2026-09-27.md`. L'autre compte travaille en parallèle sur `js/app.js` :
> chaque étape ci-dessous est un commit isolé, par chemins explicites, `npm test` + navigateur
> avant la suivante.

## 1. Ce qui existe aujourd'hui (audit du code réel)

Le CV a en réalité **trois routes de réglages** :
- **PDF** (`dossier.formatCV === 'pdf'`) : l'écran unique refait à la mi-septembre (9 cartes,
  `construireMiseEnPageCV` → `estPdfMepEcranUnique`), apparu à côté d'un aperçu HTML identique au
  rendu final (`#zonePdfInlineCV`, `ouvrirApercuPdfHtml`).
- **Word** (tout le reste) : l'ancien commutateur à 3 niveaux (Simple / Je débute / Je veux tout
  régler), l'ancienne galerie Composeur, l'ancien aperçu `.docx` réel (`apercuDocxIntegre.js`).
- **Mini CV A5** (Word) : un troisième moteur entièrement à part (`modules/cv-editor/miniCvA5.js`),
  **hors périmètre**, décision D5 déjà validée.

Une seule ligne gouverne le choix d'écran pour le CV :
`js/app.js:17968 var estPdfMepEcranUnique = (dossier.formatCV === 'pdf');`

Ce test (ou son inverse) revient **~30 fois** dans le fichier, mais avec **deux sens différents**
qu'il ne faut jamais confondre :

1. **« Quel écran / quelle source d'état est en vigueur »** (le panneau unique + l'iframe
   `#zonePdfInlineCV` sont-ils affichés, ou l'ancien Composeur ?) — c'est ce test-là qui doit
   changer, pour que Word l'utilise désormais aussi. Recense : le garde-fou en tête de chacune des
   8 cartes (`_htmlSecOrganisationMiseEnPage` et consorts, 7 dans
   `modules/cv-pdf-html/cvPdfCartesMaquette.js` + `_htmlBarreHautMiseEnPage` dans `js/app.js`),
   `estPdfMepEcranUnique` lui-même, `mepPdfCadre` (évite un intitulé en double), les lecteurs
   d'état « où vit la valeur actuelle » (`_mepAllureActuelle`, `_mepModeleCreatifActuel`,
   `_mepVarianteSobreActuelle`, `_mepLibelleDe`, `_mepReglagesParDefaut`), le choix d'écran pour
   l'aperçu réel (`construireContenuApercuFinalisation`, branche CV), et ~14 endroits dans
   `_wireCarteSimpleMiseEnPage()` qui décident, à chaque clic d'un réglage, où pousser la valeur
   (dans l'iframe PDF ou dans l'ancien état `etatApercuInline.cv`/Composeur).
2. **« Quel est le format de sortie réellement choisi »** — reste vrai, inchangé, testé
   directement sur `dossier.formatCV` : le libellé et le comportement du bouton « Télécharger »
   (`contenuRectangleExporter`/`wireRectExporter`, déjà correctement câblés sur
   `etatApercuInline.cv.ongletApercu`, lui-même dérivé de `dossier.formatCV` par
   `_appliquerReglagesMiseEnPageCV` — **cette ligne ne bouge pas**), le verrouillage de l'étape
   « Exporter » tant que « Valider le CV » n'a pas été cliqué (`exportVerrouille`), les cartes
   « Et maintenant ? » (lettre/entretien), l'écran de choix initial Word/PDF (« Vos documents »).

Les fonctions de câblage des 8 cartes elles-mêmes (`_mepCablerCartesMaquette`,
`cvPdfCartesMaquette.js`) sont **déjà 100 % neutres** : elles ne testent jamais le format, elles
poussent la valeur dans l'iframe `#zonePdfInlineCV` quel qu'il soit et rappellent
`_mepRerendre()` (= `pageResultats()`). C'est uniquement l'ancienne coquille
`_wireCarteSimpleMiseEnPage()` (héritée d'avant la refonte, jamais nettoyée depuis) qui garde encore
des branches à deux moteurs.

## 2. Principe du correctif

Une seule fonction neuve, **jamais appelée nulle part où le sens 2 (sortie réelle) est en jeu** :

```js
function _cvEcranUniqueMiseEnPage() {
  if (dossier.formatCV === 'pdf') { return true; }             // PDF : aucun changement, jamais
  if (!dossier.formatCV) { return false; }                     // écran de choix pas encore atteint
  var fmt = dossier.reglagesMiseEnPageCV && dossier.reglagesMiseEnPageCV.format;
  return !(typeof fmt === 'string' && fmt.indexOf('a5') === 0); // Mini CV A5 (Word) : ancien moteur, D5
}
```

Remplacer, **uniquement dans les ~30 sites du sens 1** listés au §1, `dossier.formatCV === 'pdf'`
par `_cvEcranUniqueMiseEnPage()` (et l'inverse en conséquence). Quand `dossier.formatCV === 'pdf'`,
la fonction renvoie `true` exactement comme avant : **zéro changement de comportement pour le
PDF, par construction** (le test réel exécuté reste identique). Les sites du sens 2 ne sont jamais
touchés.

Corollaire côté export (déjà branché la nuit dernière) : le garde-fou A5 de
`genererBlobDocumentActif` (`js/app.js`, `cv.generer`) ne doit plus regarder seulement l'ancien
`etat.formatPage` (un champ qui n'est plus mis à jour une fois le panneau unique affiché) mais
aussi `dossier.reglagesMiseEnPageCV.format` (le champ que la carte « Format » du panneau unique
écrit désormais, pour Word comme pour PDF).

## 3. Ce qui reste imparfait après ce commit (assumé, pas une régression)

- Les libellés « disponible en PDF » / « géré via la coloration en Word » de la carte
  « Réglages supplémentaires » (fonctions `_htmlSecPageMiseEnPage`/`_htmlSecCouleursMiseEnPage`/
  `_htmlSecHautMiseEnPage`/`_htmlSecTexteMiseEnPage`/`_htmlSecAfficheMiseEnPage`, appelées avec
  `masquerChoixPrincipal=true` par `_htmlSecRegSupplementairesMiseEnPage`) **restent testés sur
  `dossier.formatCV === 'pdf'` littéralement, volontairement non touchés** : elles continuent de
  proposer à Word exactement les réglages qu'elles lui proposaient déjà (aucune perte), avec des
  libellés parfois datés (certains réglages annoncés « disponibles en PDF seulement » fonctionnent
  en réalité désormais aussi en Word, vérifié cette nuit). Correction de ces libellés : chantier
  séparé, pas ce soir.
- L'ancien commutateur à 3 niveaux et l'ancienne galerie Composeur deviennent du code mort pour le
  CV (jamais atteints une fois `_cvEcranUniqueMiseEnPage()` vrai) : laissés en place, retrait à
  part (non-négociable « jamais à chaud »).
- La fenêtre séparée « Atelier CV » (`htmlAtelierCV()`, `ouvrirAtelierCV()`) a sa propre bascule
  Word/PDF, indépendante de `construireMiseEnPageCV` : **non touchée dans ce commit**, garde son
  comportement actuel (ancien panneau Word). Suite possible, pas ce soir.

## 4. Étapes (un commit par étape, test navigateur PDF + Word après chacune)

1. `_cvEcranUniqueMiseEnPage()` + remplacement dans `construireMiseEnPageCV` (le garde-fou
   principal) et `mepPdfCadre`.
2. Remplacement dans les 8 gardes de cartes (`cvPdfCartesMaquette.js` ×7 + `js/app.js` ×1).
3. Remplacement dans les lecteurs d'état (`_mepAllureActuelle`, `_mepModeleCreatifActuel`,
   `_mepVarianteSobreActuelle`, `_mepLibelleDe`, `_mepReglagesParDefaut`).
4. Remplacement dans `construireContenuApercuFinalisation` (branche CV : bascule vers
   `#zonePdfInlineCV` aussi pour Word).
5. Remplacement des ~14 sites de `_wireCarteSimpleMiseEnPage()`.
6. Garde-fou A5 de l'export Word élargi à `dossier.reglagesMiseEnPageCV.format`.
7. Test navigateur complet : PDF (aucun changement visible/fonctionnel sur plusieurs réglages),
   Word (panneau identique au PDF, réglages qui s'appliquent réellement, export un vrai .docx,
   Mini CV A5 intact).

## 5. Fait le 2026-09-27 (matin)

Toutes les étapes du §4 appliquées en une passe (remplacements exacts vérifiés un par un, même
méthode que la nuit). `npm test` 1018 verts. Vérifié en navigateur :
- **PDF** : panneau et aperçu identiques à avant (13 cartes en Standard, 9 en « Réglages
  supplémentaires » ouverts), clic sur un réglage (Sobre) sans erreur console, retour à Standard.
- **Word (A4)** : montre désormais le même panneau (9 cartes) et le même aperçu
  `#zonePdfInlineCV`, sans l'ancien panneau Composeur. Un réglage cliqué (Sobre) s'applique
  réellement à l'aperçu ; export réel testé (`genererBlobDocumentActif('cv')`) : un vrai `.docx`
  produit avec le réglage appliqué.
- **Mini CV A5 (Word)** : en choisissant le format A5 dans le panneau unique, l'écran repasse bien
  sur l'ancien moteur Composeur (`.mep-carte` = 0, `#zonePdfInlineCV` absent) — décision D5
  respectée.
- **Limite connue, non corrigée (pas demandée, pas une régression)** : si on est sur Mini CV A5 en
  Word et qu'on utilise le bouton "A4" de l'**ancien** panneau (qui ne réapparaît que dans ce cas
  précis), il ne remet pas à jour `dossier.reglagesMiseEnPageCV.format` (le champ partagé) : la
  personne resterait sur l'ancien panneau. Repli : re-choisir un format A4 depuis la carte
  « Format » n'est possible qu'après être revenu au panneau unique autrement. Cas rare (il faut
  d'abord être en Word, puis choisir explicitement A5), à corriger dans un prochain passage si
  Denis le signale.

Commit : `js/app.js` + `modules/cv-pdf-html/cvPdfCartesMaquette.js` uniquement.
