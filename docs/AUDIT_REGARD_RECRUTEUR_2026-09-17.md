# Audit du module « Un regard sur mon CV » (ex « Regard recruteur »)

> Écrit le 2026-09-17, à la demande de Denis, suite à la liste de 8 points de révision
> qu'il a transmise après plusieurs tests du module. Audit en lecture seule : aucune
> ligne de code touchée. Sert de base à une maquette, une fois les points ouverts tranchés.
>
> Références lues pour cet audit : `docs/CHANTIER_REGARD_RECRUTEUR.md`,
> `modules/regard-recruteur/ARCHITECTURE_TECHNIQUE.md`,
> `docs/CHANTIER_REGARD_RECRUTEUR_SCHEMA_SORTIE_2026-09-03.md`, `prompts/regard-recruteur.md`,
> `modules/regard-recruteur/{index.js,rapportResponseParser.js,regard-recruteur.css}`,
> `docs/PROTOCOLE_TEST_PROMPT_REGARD_RECRUTEUR_2026-09-03.md`, `docs/LECONS_A_NE_PAS_REPRODUIRE.md`,
> `docs/BRIQUES_COMMUNES.md`, `docs/TACHES_VALIDEES.md`, `docs/IDEES_A_RECLASSER.md`.

---

## 1. Harmoniser la mise en page

**Constat mitigé.** Le squelette de la page (barre du haut, barre d'étapes, titre, barre de
navigation basse) réutilise bien les briques communes (`barreEtapesModule`, `barreNavigation`,
`htmlBandeRepriseModule`...) sur le même patron que « Comparer mes pistes » et « Découvrir mes
compétences » (`ARCHITECTURE_TECHNIQUE.md`). Ce n'est donc pas un module posé "à côté" au niveau
structurel.

Ce qui casse l'harmonie : `regard-recruteur.css` (239 lignes, 56 classes propres au module -
`.rr-bloc`, `.rr-carte`, `.rr-pilule`, `.rr-encart`, `.rr-bandeau`...) réinvente sa propre
mini-charte visuelle (teinte sarcelle, encarts, pastilles) plutôt que de reprendre les composants
d'écran/de carte déjà utilisés ailleurs (Bilan, ATS). Résultat probable : le squelette est le bon,
mais l'habillage à l'intérieur (encadrés, espacements, pastilles) suit des règles inventées pour ce
module seul.

**Recommandation :** avant toute retouche, comparer côte à côte un écran de travail de ce module et
l'écran équivalent d'ATS ou du Bilan (LECONS règle 10, "comparer aux écrans existants les plus
complets"), lister ce qui diverge composant par composant, puis décider lesquels remplacer par les
briques déjà en place plutôt que redessiner à l'œil.

**Corrigé le 2026-09-17** (`modules/regard-recruteur/regard-recruteur.css`) : en creusant, la vraie
cause n'était pas la structure (déjà correcte, patron partagé confirmé) mais la **couleur** - le
module avait sa propre teinte sarcelle figée en dur, jamais reliée aux jetons partagés de
`css/style.css`. Corrigé : `--rr-accent`/`--rr-warn`/`--rr-ok`/`--rr-bord`/`--rr-carte`... pointent
maintenant vers `var(--accent)`, `var(--warning)`, `var(--success)`, `var(--border)`,

**2 défauts réels supplémentaires trouvés en testant avec Denis le mode image, corrigés le 2026-09-17 :**
- **Bug de confidentialité réel** : `onEnregistre` (masquage image) ne récupérait jamais le
  `blob` masqué renvoyé par `cablerVerificationDocument()` (`{ mode: 'image', blob }`) - seul
  `entree.masquee = true` était posé. L'image gardée en mémoire (`etat.images[i].dataUrl`), revue
  à chaque réaffichage de l'écran de masquage **et incluse telle quelle dans la disquette**
  (`regardRecruteurExporterEtatPourSauvegarde`, `JSON.stringify` de tout `etat`), restait
  l'**originale non masquée** pour toujours - seul le fichier téléchargé sur le disque contenait
  le rectangle. Corrigé : le `blob` masqué est converti en `dataUrl` (`FileReader`) et remplace
  `entree.dataUrl` - l'image en mémoire, à l'écran et dans une sauvegarde de session est
  désormais réellement celle avec le rectangle, plus aucun doute possible. Vérifié navigateur :
  rectangle dessiné, enregistré, écran rechargé -> le rectangle est bien présent sur l'image de
  base (pas seulement dans le fichier téléchargé).
- **Encart « Vous n'avez pas d'image... »** resté affiché même après l'ajout d'une image (n'avait
  plus de sens à ce stade). Masqué dès qu'au moins une image est présente.
- **Largeur plafonnée à 780px** (`.regard-recruteur-parcours { max-width: 780px; }`) alors qu'ATS
  et les autres modules de la même famille laissent leur contenu occuper toute la largeur utile
  (aucun plafond). Mesuré : 780px ici contre 1288px pour ATS sur un même écran large. Retiré.
- **Ordre inversé de la barre d'étapes et du bouton « Revoir la présentation »** : ATS affiche la
  barre d'étapes en premier puis le bouton (`modules/ats/index.js:171-176`) ; ce module faisait
  l'inverse (`app.js` de ce module), ce qui poussait tout le contenu (titre, écran) plus bas d'une
  soixantaine de pixels par rapport aux autres modules - la vraie cause du sentiment de module
  « décalé vers le bas ». Ordre inversé pour correspondre exactement à ATS. Mesuré après correction :
  positions strictement identiques (76px/147px/189px) entre les deux modules.
`var(--bg-card)`... Conséquence concrète au-delà de l'harmonie visuelle : le module suit désormais
la **couleur d'accent choisie par la personne** dans ses préférences (bleu/orange/vert/violet/
turquoise/framboise) et le mode daltonien, comme le reste de l'app - vérifié au navigateur en
changeant l'accent en violet, clair et sombre. Les composants eux-mêmes (`.rr-bloc`, `.rr-carte`,
`.rr-pilule`...) restent inchangés : aucune brique commune de carte/accordéon générique n'existe
réellement ailleurs à réutiliser (vérifié : le Bilan utilise des styles en ligne avec sa propre
carte de couleurs dédiée, ATS et Comparer mes pistes n'ont pas de CSS propre du tout).

## 2. Corriger les incohérences visuelles

- Pas de faute d'orthographe trouvée à la lecture du code (`index.js`, prompt, schéma) : le texte
  semble déjà en français correct, avec accents. Si Denis a des captures précises de fautes, elles
  aideraient à cibler (une relecture "à l'œil" de tout le texte affiché reste à faire, elle n'a pas
  été refaite dans cet audit).
- « Poste ou métier visé » : **confirmé et corrigé le 2026-09-17** (retour Denis) - son `<label>`
  utilisait une classe propre au module (`.rr-lig`, non gras) alors que les champs juste en dessous
  (Entreprise ciblée, Site, Offre, Type de structure - issus de `bilanCorpsCiblageOffreHTML()`)
  utilisent tous `form-label small fw-bold`. Aligné sur cette même classe ; `.rr-lig`, devenue
  inutilisée, retirée du CSS du module.
- Le point plus solide : la mini-charte du point 1 (couleurs, tailles, pastilles `.rr-pilule`)
  explique une bonne part du sentiment d'incohérence, au-delà d'une simple faute de frappe.

## 3. Repenser le parcours d'import du CV

**Confirmé, c'est le point le plus concret de toute la liste.** Le module a son propre système de
dépôt (`FileReader` -> `dataURL`, 3 images maximum) + un collage de texte séparé (`coller`) - et
n'utilise PAS le composant partagé `ouvrirAssistantDepotCV()` (`data/metiers.js`) qui gère déjà
texte / PDF / Word / photo pour CV, Lettre, Entretien, Bilan, Cohérence et Les mots de votre CV
(`docs/BRIQUES_COMMUNES.md`). Le copier-coller manuel de texte est bien la voie principale du mode
texte aujourd'hui, l'import multi-format n'existe pas pour ce module.

**Recommandation :** brancher `ouvrirAssistantDepotCV()` comme les autres modules (résorption de la
dette B.1 déjà actée pour toute refonte qui touche un import de CV, décision Denis du 2026-08-30).
Nuance à trancher avec Denis : ce module a un besoin réel que les autres n'ont pas - l'**image**
elle-même doit être conservée et manipulable (outil de masquage par rectangles), pas seulement le
texte extrait. Le composant partagé, lui, est pensé pour ressortir du **texte anonymisé**, pas une
image. Il faudra donc soit étendre `ouvrirAssistantDepotCV()` pour qu'il puisse renvoyer aussi
l'image d'origine quand la personne dépose une photo/scan, soit garder un chemin image séparé pour
CE besoin précis et brancher seulement PDF/Word/texte sur le composant partagé. **À trancher avant
maquette : lequel des deux, car ça change l'architecture de l'écran "Préparer".**

**Fait le 2026-09-17** (`modules/regard-recruteur/index.js`, `_rrOuvrirDepotTexteCV`) : décision
retenue = la seconde option (chemin image séparé conservé, texte/PDF/Word branchés sur
`ouvrirAssistantDepotCV('pret', ...)`). Le bouton « Coller et relire le texte » du Mode texte
ouvre maintenant ce dépôt partagé (dépose un texte, un PDF **ou** un Word, avec relecture/masquage
intégrés) ; le copier-coller manuel reste possible mais n'est plus l'unique voie, conformément à la
demande initiale de Denis (« le copier-coller ne doit plus être la solution principale »). Une
image déposée par erreur dans ce contexte affiche une explication (le dépôt partagé ne garde pas
l'image en mémoire pour l'outil de masquage du module) plutôt que d'échouer silencieusement.
Documenté comme dette assumée B.15 (`docs/BRIQUES_COMMUNES.md`). Vérifié navigateur bout en bout
(dépôt → relecture → « Continuer » → CTA « Choisir mon assistant » actif → « Revoir le texte »
réutilise bien le texte importé), `npm test` 931 verts.

## 4. Revoir complètement le traitement du CV (extraction puis analyse)

Aujourd'hui, il n'y a pas de vraie étape d'"extraction" automatique : la personne dépose une image
(gardée telle quelle) ou colle elle-même son texte (mode texte). Il n'y a donc rien à "vérifier
avant analyse" au sens d'un OCR ou d'une extraction PDF, puisque ni l'un ni l'autre n'existe encore
dans ce module - contrairement à ce que suggère le point 3 (Word/PDF).

**Ce point dépend directement de la décision du point 3.** Si un import PDF/Word est ajouté via
`ouvrirAssistantDepotCV()`, celui-ci fournit déjà un texte finalisé en sortie
(`options.onDocumentPrepare(res)`, anonymisé), **sans écran de relecture routé propre** (conçu
pour un usage "sortie anticipée", d'après `ARCHITECTURE_TECHNIQUE.md` du composant). Or ce module a
justement déjà un écran de relecture/masquage dédié en mode texte
(`htmlVerificationDocument({mode:'texte'})`) qui remplit ce rôle : montrer le texte, le corriger,
masquer avant envoi. Il faudrait vérifier que le texte qui sort de `ouvrirAssistantDepotCV()`
retombe bien dans CET écran de relecture existant plutôt que de sauter l'étape - ce qui semble
faisable, à vérifier une fois le point 3 tranché.

**Levé le 2026-09-17** : `ouvrirAssistantDepotCV()` intègre **sa propre** étape de relecture/
masquage (`htmlVerificationDocument({mode:'texte'})` en interne, avant même de rappeler
`onDocumentPrepare`) - il ne fallait donc PAS rejouer l'écran de relecture du module après coup
(ça aurait été une 2ᵉ relecture redondante). Le texte reçu dans `onDocumentPrepare` est directement
stocké dans `etat.cvTexte` avec `etat.texteRelu = true` ; l'écran de relecture du module
(`vueMasquerHTML`, mode texte) reste disponible séparément via « Revoir le texte », pour rouvrir et
corriger le texte déjà importé - jamais une étape obligatoire en double.

Le second volet ("envoyer directement l'image pour que l'assistant analyse aussi la présentation")
est **déjà l'architecture actuelle du mode image** : ce n'est donc pas un manque, plutôt une
confirmation que le mode image existant va dans le bon sens.

## 5. Revoir le parcours en cas d'échec

**Deux écrans d'échec existent, à deux niveaux de qualité très différents :**

- `erreur-lecture` (réponse illisible, pas de JSON) : déjà soigné - explique que ce n'est pas la
  faute de la personne, propose 3 actions concrètes, fournit une phrase de relance prête à copier,
  rassure que rien n'est perdu (image et réponses conservées).
- `analyseImpossible` (l'assistant dit que ce CV n'est pas exploitable) : beaucoup plus pauvre -
  un simple encart d'avertissement avec le message généré par l'assistant, et 2 boutons
  ("Coller à nouveau" / "Reprendre mon image"). Pas d'exemples, pas d'encouragement écrit par
  l'application elle-même (contrairement à ce que prévoyait le schéma de sortie, §6 : "écran dédié,
  exemples, encouragement").

**Recommandation :** aligner l'écran `analyseImpossible` sur le niveau de `erreur-lecture` (même
structure : pourquoi, quoi faire concrètement avec des exemples, rassurance). C'est un écart
identifié par le schéma lui-même, jamais refermé - à corriger, pas à retrancher.

**Corrigé le 2026-09-17** (`modules/regard-recruteur/index.js`, `vueRegardHTML`) : même structure
que `erreur-lecture` (phrase "pas de votre faute", conseils concrets adaptés au mode image/texte,
rassurance sur la sauvegarde), et le bouton de reprise dit maintenant "Reprendre mon texte" en mode
texte au lieu d'afficher "Reprendre mon image" à tort.

## 6. Refaire la présentation des résultats

Le rapport (`vueRegardHTML`) utilise déjà des `<details>` repliés par axe (`rr-bloc`,
conforme à la règle LECONS §1 "jamais un bloc qui tombe d'un coup") - ce n'est donc pas un mur de
texte brut. Le sentiment de bloc difficile à lire vient plus probablement de la même cause qu'au
point 1 : composants visuels propres au module (`.rr-carte`, `.rr-pilule`, `.rr-num-emoji`) plutôt
que les cartes de statut déjà éprouvées ailleurs (palette LECONS 1 : vert/ambre/rouge du Bilan,
`BILAN_COULEURS_STATUT_PREPARATION`) - ce module n'a pas de logique de couleur de statut du tout
(pas de vert/ambre/rouge par point). À vérifier avec Denis si c'est voulu (ce module n'a pas de
verdict à colorer, contrairement au Bilan) ou si une hiérarchie visuelle par point (ex. "positif"
vs "à vérifier") aiderait quand même la lecture.

**Corrigé le 2026-09-17** (retour terrain de Denis, vrai test) : l'axe `presentation` (jusqu'à 6
points : mise en page, densité, hiérarchie, longueur, police) était en style `'trois-temps'`, le
seul rendu qui **n'affiche jamais le titre du point** et **ne l'encadre pas** - contrairement au
style `'cartes'` déjà utilisé par `coherence`/`message`/`couleurs`. Sur un axe à un seul point
(`premiere-lecture`), l'absence de titre/encadré ne se voit pas ; sur 5-6 points à la suite, tout se
mélangeait visuellement, exactement le défaut décrit. Passé en style `'cartes'` (une ligne
changée dans `RR_AXES_META`, aucun nouveau composant) : chaque point a désormais son titre et son
propre encadré, comme les autres axes. Vérifié navigateur avec 5 points factices : bien séparés,
titres visibles.

## 6bis. Boutons « Garder comme Repère » trop grands - décision à confirmer avec Denis

**Signalé par Denis (2026-09-17)**, en particulier sur l'écran « Ma fiche » où plusieurs boutons se
suivent. Mesuré : chaque bouton fait **231 x 48 px**, bien au-delà d'un `.btn-sm` Bootstrap normal.
Cause trouvée : `modules/reperes/reperes.css` impose `[data-repere-trigger] { font-size: 1.05rem
!important; padding: .65rem 1.3rem !important; min-height: 48px; }` - une règle **globale par
attribut**, pas propre à ce module. Le commentaire du code date d'une **demande explicite de
Denis** : *« le bouton Garder une réflexion, très important, il faut qu'il soit bien visible »*,
et précise noir sur blanc qu'elle couvre volontairement les 3 rendus du bouton, **y compris le
geste ancré inséré dans un autre module** - exactement le cas ici. Elle s'applique donc à
l'identique dans Bilan, Cohérence, ATS, Regard recruteur : ce n'est pas un défaut propre à ce
module, c'est une décision d'accessibilité déjà prise et documentée, qui se voit ici parce que
plusieurs boutons se suivent d'affilée sur « Ma fiche ».

**Décision de Denis (2026-09-18) : réduire partout.** Il revient explicitement sur la décision
d'accessibilité antérieure, en connaissance de cause (options et risque présentés dans le chat).
Corrigé dans `modules/reperes/reperes.css` (`[data-repere-trigger]`) : les surcharges `!important`
de taille/police retirées, le bouton retrouve le style `.btn-sm` normal de Bootstrap sur ses 3
rendus (écran Repères, panneau Journal, geste ancré dans un autre module). Mesuré sur « Ma fiche » :
231x48px -> 174x30,6px. Vérifié navigateur : les boutons tiennent maintenant sur la même ligne que
le texte court qui les précède, la liste de « Ma fiche » est bien moins lourde. `npm test` 931
verts (CSS seul).

## 6ter. Titre de l'écran de résultat, trop ambitieux - corrigé le 2026-09-18

Retour de Denis, même raisonnement que le renommage du module (2026-09-17) : « Le regard d'un
recruteur sur votre CV » (titre de l'écran `regard`, `RR_TITRES`) prête au module la voix d'un vrai
recruteur, alors qu'il ne fait que décrire ce qui est observable. Changé en **« Ce qu'on voit sur
votre CV »**. Les autres mentions de « recruteur » restantes dans ce module (« Comment un recruteur
peut le lire », « Décoder les questions d'un recruteur »...) décrivent l'angle de lecture simulé,
jamais un titre qui prétend être le recruteur lui-même - laissées telles quelles, cohérent avec la
distinction déjà actée lors du renommage du module. Vérifié navigateur, clair et sombre.

## 7. Revoir le positionnement du module

Le chantier d'origine a déjà posé une frontière écrite et cohérente
(`CHANTIER_REGARD_RECRUTEUR.md` §7) :
- **Analyser ma candidature** = adéquation parcours / offre (le fond).
- **Atelier CV** = fabrication, retouche.
- **Un regard sur mon CV** = perception à la première lecture + préparation aux questions
  probables (la forme + les questions).

**Chevauchement réel, déjà repéré dans les propres docs du chantier, jamais refermé** : l'axe
`message` (registre de langage, logiciels/outils nommés) fait presque la même chose qu'ATS
(comparaison de vocabulaire CV / offre), alors même que le prompt affirme explicitement
"Ce n'est PAS une comparaison de vocabulaire avec une fiche métier (encore un autre outil)". Le
schéma de sortie liste lui-même ce recouvrement `message` ↔ ATS comme une "zone d'ombre à juger sur
de vrais CV" (§9), jamais tranchée depuis.

Point non traité par le chantier d'origine : le chevauchement possible avec **Préparer un
entretien** (les questions générales de "Décoder les questions d'un recruteur" sont-elles
redondantes avec les questions d'entraînement de l'autre module ?). Ni le chantier ni l'audit du
2026-09-12 ne l'ont examiné.

**À trancher avec Denis, pas à deviner :** retirer/réduire l'axe `message` du prompt (le laisser à
ATS), ou l'assumer comme un doublon volontaire léger (angle différent : « comment ça se lit » plutôt
que « est-ce que le mot y est »)  ? Et vérifier concrètement le contenu des 5 questions générales de
« Décoder » contre le prompt de Préparer un entretien.

## 8. Analyser la qualité des résultats

**Constat le plus important de tout l'audit : le protocole de test du prompt n'a jamais été
exécuté.** `docs/PROTOCOLE_TEST_PROMPT_REGARD_RECRUTEUR_2026-09-03.md` (6 cas + grille à 7 critères)
n'a qu'un seul commit git, celui de sa création le 2026-09-03 - jamais rempli depuis. Contrairement
à ATS, qui a un dossier `docs/tests-manuels-ats/` avec de vrais cas conservés, il n'existe aucun
équivalent `docs/tests-manuels-regard-recruteur/`. Le chantier a été marqué `[CLOS]` le 2026-09-08
sans qu'un seul passage réel sur un vrai CV n'ait été consigné.

Ce que montre la relecture du prompt et du parser (sans exécution réelle) :
- **Le prompt lui-même est rigoureux** : schéma à 6 axes bornés, garde-fous anti-invention
  (`origine` obligatoire sur les questions), vocabulaire interdit explicite, aiguillage "un
  élément, un seul endroit" pour éviter les doublons entre axes. Pas de défaut de conception
  flagrant trouvé à la lecture.
- **Le parser est solide** et fidèle au contrat (18 tests, dégradation propre si un champ manque).
- **Risque connu et documenté, jamais mesuré** : "la stabilité de l'analyse visuelle dépend de
  l'assistant multimodal choisi" (`CHANTIER_REGARD_RECRUTEUR.md` §11, autocritique notée
  16-19,5/20 par les assistants consultés en conception) - deux assistants peuvent lire la même
  image de CV différemment, et rien ne l'a vérifié en situation réelle.
- **Le chevauchement `message` ↔ ATS** (point 7) peut aussi diluer la qualité perçue : si les deux
  modules disent des choses proches avec des mots différents, le rapport peut sembler moins net.

**Conclusion :** l'écart entre ce qui était attendu et ce que Denis observe vient très probablement
moins d'un bug de code que d'un prompt jamais validé sur de vrais CV avant la mise en ligne - or
c'est justement l'étape que le chantier `docs/CHANTIER_REGARD_RECRUTEUR_SCHEMA_SORTIE_2026-09-03.md`
prévoyait ("Denis fait tourner"), jamais faite. **Recommandation : avant de retoucher le prompt à
l'aveugle, faire tourner le protocole de test sur 3-4 vrais CV (dont un plutôt bon et un plutôt
faible), et noter précisément où le résultat déçoit** - un prompt déjà bien construit se corrige
mieux à partir d'exemples réels ratés qu'en le réécrivant de mémoire.

**Retour terrain de Denis, 2026-09-17 (vrai test avec Claude, mode image)** : premier essai en
`analyseImpossible`, message « nous n'avons pas réussi à lire ce CV ». Diagnostic de Denis, confirmé
en lisant le code : le prompt et `promptBuilder.js` sont corrects (le texte dit déjà clairement que
l'image est jointe), mais l'écran « L'assistant va s'ouvrir » ne présentait la consigne que comme
**une seule phrase dense** (« collez le texte, joignez votre image masquée, puis envoyez ») - trop
facile de coller le texte et d'appuyer sur Entrée par réflexe avant d'avoir réellement joint
l'image. **Corrigé** (`modules/regard-recruteur/index.js`, `vueChezHTML`, mode image uniquement) :
consigne réécrite en 2 étapes numérotées, image **en premier** (« Joignez d'abord votre image
masquée »), texte **ensuite, dans ce même message** ; encart d'avertissement ajouté expliquant
explicitement que ce message d'erreur précis vient d'un envoi sans image jointe. Deuxième essai de
Denis avec l'image bien jointe : le prompt et le rapport ont fonctionné correctement (confirmé par
lui, « le prompt il fonctionne bien »).

**Fait le 2026-09-17** (`docs/tests-manuels-regard-recruteur/tour-1-mode-texte-2026-09-17.md`) :
3 des 6 cas du tour 1 passés (mode texte uniquement, en appliquant moi-même le prompt à la lettre
sur des CV construits - limite honnête : ça ne remplace pas un vrai assistant externe). Aucune
erreur réelle trouvée, et le retrait du "registre de langage" (§7bis) fonctionne comme prévu de
bout en bout. **Restent à faire, uniquement par Denis avec un vrai assistant multimodal** : les cas
1, 2 et 4 du protocole (mode image) - seuls capables de révéler la variabilité du jugement visuel,
risque déjà identifié mais jamais mesuré.

---

## Synthèse : ce qui est tranché vs ce qui reste à décider par Denis

**Déjà clair, peut être fait sans nouvelle question :**
- Point 5 : étoffer l'écran `analyseImpossible` sur le modèle de `erreur-lecture`.
- Point 8 : faire tourner le protocole de test sur de vrais CV avant toute retouche du prompt.
- Point 2 : relecture orthographique ciblée une fois des captures précises fournies par Denis.

**Demande une maquette (doute d'interface, plusieurs écrans à retracer) :**
- Point 1 et 6 : remplacement des composants visuels propres au module par les briques communes
  déjà en place (cartes, pastilles, couleurs de statut).

**Demande une décision de Denis avant toute maquette :**
- Point 3 : image conservée + PDF/Word branchés sur `ouvrirAssistantDepotCV()` - lequel des deux
  scénarios d'architecture (étendre le composant partagé pour qu'il renvoie aussi l'image, ou
  garder un chemin image séparé) ?
- Point 7 : que fait-on de l'axe `message` face au chevauchement avec ATS ? Et vérifier le
  chevauchement avec Préparer un entretien sur les questions générales.
