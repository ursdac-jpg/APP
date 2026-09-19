# Revue critique des réglages CV (panneaux PDF + Word) - 2026-09-02

> Demande de Denis : maintenant que la photo d'ensemble existe (inventaire ~120
> réglages + revue de `MAQUETTE_MISE_EN_PAGE` section par section), lister les
> incohérences, bugs et manques entre les panneaux PDF et Word, avec des
> solutions concrètes à implémenter.
>
> Chaque point : **Constat** / **Impact** / **Solution concrète** / **Priorité**.
> Priorité HAUTE = à traiter dans la phase de code de ce chantier. MOYENNE = au
> même passage si possible. BASSE = backlog.
>
> Rien n'est corrigé ici : c'est une liste de décisions à prendre.

---

## 1. Incohérences entre le PDF et le Word

### 1.1 Word : le format « CV Intégral (2 pages) » est caché au départ - PRIORITÉ HAUTE
- **Constat** : `js/app.js:11530` et `:16358`, le bouton `boutonFormatIntegralXXL`
  est rendu avec `style="display:none;"`. Il n'apparaît qu'après un clic sur
  Essentiel ou Détaillé. Côté PDF, les 5 formats sont visibles d'emblée.
- **Impact** : un utilisateur qui reste en Word ne sait pas que le format 2 pages
  existe. Régression de parcours réelle (décision déjà prise : Word doit offrir
  les 5 formats comme le PDF).
- **Solution** : retirer le `display:none` des deux emplacements, afficher le
  bouton dès l'arrivée. Vérifier que `activerMiseEnFormeUltimeXXL()` et les
  gardes « CV Intégral autorise 2 pages » (app.js ~24992, ~25092, ~25561)
  fonctionnent quand Intégral est choisi sans passer par Essentiel/Détaillé.

### 1.2 « Bloc mis en avant » : réglage Word sans équivalent PDF - PRIORITÉ BASSE
- **Constat** : `reglagesProjetXXL.blocMisEnAvant` (Word) n'a pas de pendant dans
  le panneau PDF.
- **Impact** : asymétrie de fonctionnalités entre les deux formats.
- **Solution recommandée** : assumer l'asymétrie et l'afficher « Word uniquement »
  (déjà fait dans `MAQUETTE_MISE_EN_PAGE`). Le PDF a l'équivalent sous une autre
  forme : le réglage par rubrique (agrandir une rubrique) dans le grand aperçu.
  Ne pas dupliquer.

### 1.3 Le dé ne se comporte pas pareil des deux côtés - PRIORITÉ MOYENNE
- **Constat** : côté PDF, `_pdfGenererStyleAleatoire()` (cvPdfPanneauReglages.js
  ~3437) **repart d'une ardoise vierge** : il efface toutes les retouches
  manuelles (échelle / police / puce par rubrique, positions de blocs d'en-tête,
  ordre glissé). C'était un bug utilisateur confirmé (« tout ce que j'ai modifié
  à la main reste modifié »). Côté Word, `btnProposerModeleXXL`
  (« Propose-moi un modèle ») : rien ne garantit qu'il fasse la même remise à
  zéro des réglages `data-projetxxl-*` modifiés à la main.
- **Impact** : le même bug qui a été corrigé côté PDF peut exister côté Word.
- **Solution** : vérifier le corps de la fonction Word ; si elle ne remet pas à
  zéro, ajouter le même reset des personnalisations manuelles avant de proposer
  le nouveau modèle. Sinon, documenter explicitement la différence.

### 1.4 Réglages fins A5 : PDF seulement - PRIORITÉ BASSE
- **Constat** : `regFondColonnesA5`, `regEnteteInverseeA5`, `regRemplirPageA5`
  n'existent qu'en PDF. En Word, le Mini CV A5 suit les réglages généraux.
- **Impact** : faible (le Mini CV A5 est un usage de niche).
- **Solution** : garder tel quel, surfacer la note « en PDF uniquement » (fait
  dans la maquette).

### 1.5 Le « dé » n'a pas le même nom des deux côtés - PRIORITÉ BASSE (facile)
- **Constat** : PDF = « Style au hasard » (`btnStyleAleatoire`). Word =
  « Propose-moi un modèle » (`btnProposerModeleXXL`).
- **Impact** : la personne ne fait pas le lien que c'est le même geste.
- **Solution** : un seul libellé sur les deux boutons. Reco : « Style au
  hasard » (déjà le terme de la maquette).
- **Note** : « Mise en page » est **déjà aligné** des deux côtés
  (`btnMiseEnFormeUltimeXXL` a été renommé « Mise en page », app.js ~27451).

---

## 2. Réglages morts ou à risque (bugs)

### 2.1 « Permuter l'en-tête » - traité
- Supprimé du code (bug réel confirmé, commentaire cvPdfPanneauReglages.js
  ~1789 : « n'avait de sens que dans l'ancienne disposition empilée »). Retiré de
  `MAQUETTE_MISE_EN_PAGE`. À **ne pas réintroduire** à l'implémentation.

### 2.2 Onglet « Rubriques à masquer » : émoji visage - PRIORITÉ HAUTE
- **Constat** : `GROUPES_ONGLETS_CHOIX_IA_CV` (`js/app.js` ~20988) :
  `titre: '🙈 Rubriques à masquer'`. 🙈 = singe qui se cache les yeux = **un
  visage avec une expression**. Viole le non-négociable « jamais d'icône avec un
  visage / des traits de visage ».
- **Impact** : non-négociable, visible utilisateur.
- **Solution** : remplacer par une icône-objet. La maquette Assistant utilise
  déjà 🚫 (`&#128683;`) pour ce même onglet. Reprendre 🚫, ou un cadenas / une
  étiquette barrée.

### 2.3 Titres de rubrique « Pastille » sans icône - PRIORITÉ MOYENNE (à vérifier)
- **Constat** : `regStyleTitres` propose « Pastille (icône dans un rond) ». Le
  défaut `regIcones` est `false`. Que rend une « pastille » quand il n'y a pas
  d'icône ?
- **Impact** : risque d'un rond vide devant chaque titre de rubrique.
- **Solution** : vérifier le rendu réel. Si la pastille est vide : soit forcer
  une icône par défaut quand « Pastille » est choisi, soit désactiver / masquer
  l'option « Pastille » quand les icônes sont coupées.

### 2.4 Rubrique « Logiciels » : trois libellés différents - PRIORITÉ BASSE
- **Constat** : champ de saisie « Logiciels » ; rendu PDF « Logiciels et
  outils » (`cvPdfTemplateA4.js:504`) ; maquette « Logiciels ». Le composeur
  Word connaît bien `logiciels` (`composeurComposants.js:82`), donc le rendu est
  branché des deux côtés (le point soulevé par Denis est résolu).
- **Solution** : un seul libellé partout. Reco : « Logiciels ».

---

## 3. Cohérence des valeurs par défaut

### 3.1 Fidélité maquette : curseurs discrétisés - note, pas un bug
- `regEchelle` (taille du texte) : curseur réel **min 9 / max 14 / pas 0,5**,
  défaut 11 (`cvPdfPanneauReglages.js:692`). La maquette la montre en jetons
  entiers 9-14. À l'implémentation, **garder le curseur continu au pas de 0,5**.
- `regLargeurAccrocheLibre` / `regLargeurMetierLibre` : curseurs continus dans
  le code, 4 paliers dans la maquette. Garder le continu.
- `regEchelleA5` : min 9 / max 14 / pas 0,5 / défaut 11 - conforme.

### 3.2 Défauts vérifiés conformes
- Tous les autres défauts ont été vérifiés contre `_PDF_ETAT_DEFAUT` pendant la
  revue de `MAQUETTE_MISE_EN_PAGE` (police Segoe, largeur métier 32 %, « mettre
  en évidence » tout décoché, fond colonnes « droite », dégradé « foncé vers
  clair », etc.). RAS.

---

## 4. Charge cognitive et parcours (améliorations)

### 4.1 « Style au hasard » efface le travail manuel sans prévenir - PRIORITÉ HAUTE
- **Constat** : un clic sur le dé remet à zéro toutes les retouches par rubrique
  / d'en-tête, sans confirmation. Public cible : confiance fragile, a pu passer
  du temps à régler une rubrique.
- **Impact** : un clic accidentel = perte de travail = découragement.
- **Solution** :
  1. Si (et seulement si) des retouches manuelles existent, mini-confirmation
     inline avant le tirage : « Cela remet les réglages par rubrique à zéro.
     Continuer ? »
  2. Rendre « Annuler le dernier tirage » (`btnAnnulerAleatoire`) très visible
     juste après un tirage (le bouton existe déjà, il faut le mettre en avant).

### 4.2 Invariant « mini aperçu = grand aperçu » à garantir par le code - PRIORITÉ HAUTE
- **Constat** : bug historique déjà vécu par Denis (deux chemins de rendu
  séparés : `etatApercuInline.cv` vs iframe PDF vs thème Composeur).
- **Solution** : au moment du code, un **seul** point de rendu
  `construireApercuCV(etat, echelle)` appelé par la vignette de la page ET par
  le grand aperçu, à partir du **même** objet d'état. Aucune deuxième copie de
  l'état à synchroniser.

### 4.3 Mémoriser où on en était - PRIORITÉ MOYENNE (effort faible)
- **Constat** : à chaque retour sur « La mise en page », le panneau repart du
  niveau Simple, sections repliées.
- **Solution** : `localStorage` pour le niveau choisi (Simple / Je débute / Tout
  régler) et les sections ouvertes de « Tout régler ». Un retour reprend au même
  endroit.

### 4.4 « Projet XXL » : nom opaque - PRIORITÉ MOYENNE
- **Constat** : « XXL » ne veut rien dire pour le public cible.
- **Solution** : libellé utilisateur neutre (« Personnaliser le CV Word » /
  « Réglages avancés du Word »). À coordonner avec le futur chantier
  « vocabulaire neutre sur toute l'app ».

### 4.5 Recherche dans « Tout régler » - PRIORITÉ BASSE
- **Constat** : ~40 réglages dans « Tout régler », pas de moyen de filtrer.
- **Solution** : un champ « trouver un réglage » qui masque les `champ` dont le
  libellé ne correspond pas. Utile surtout aux utilisateurs avancés.

### 4.6 Découverte des outils du grand aperçu - PRIORITÉ BASSE
- **Constat** : un utilisateur qui reste dans le menu ne voit jamais la
  manipulation directe (placement libre, réglage par rubrique).
- **Solution** : le renvoi `.renvoi-grand` est déjà en place. Ajout possible :
  au 1er passage, une pastille « nouveau » sur « Ouvrir l'Aperçu à taille
  réelle ».

### 4.7 Cadrage des 4 transformations rapides - PRIORITÉ BASSE
- **Constat** : 🎲 Style au hasard, 🪄 Mise en page, Sobre/Créatif,
  Complet/Optimisé : 4 raccourcis dont la différence n'est pas évidente.
- **Solution** : une phrase de cadrage en tête du niveau Simple :
  « Le dé change le style ; Mise en page réorganise pour tenir sur une page ;
  Sobre/Créatif change l'esprit ; Complet/Optimisé change ce qui est montré. »

---

## 5. Récapitulatif par priorité

| Priorité | Point | Action |
|---|---|---|
| HAUTE | 1.1 | Word : rendre « CV Intégral » visible d'emblée |
| HAUTE | 2.2 | Onglet « Rubriques à masquer » : 🙈 -> icône-objet |
| HAUTE | 4.1 | Confirmation + « Annuler » visible avant que le dé efface le travail manuel |
| HAUTE | 4.2 | Un seul point de rendu pour vignette + grand aperçu |
| MOYENNE | 1.3 | Aligner le reset du dé Word sur le dé PDF |
| MOYENNE | 2.3 | Vérifier « Pastille » de titre sans icône |
| MOYENNE | 4.3 | Mémoriser niveau + sections ouvertes |
| MOYENNE | 4.4 | Renommer « Projet XXL » |
| BASSE | 1.2, 1.4, 1.5, 2.4, 4.5, 4.6, 4.7 | backlog |

---

## 6. Rappel : suggestions visuelles déjà tranchées (inventaire J)

- interligne / espacement des paragraphes / marges : **intégrés** (dé + Mise en
  page + menu « La page »).
- alignement justifié : priorité basse, rangé dans « Détails » de « La page ».
- « mon style » (enregistrer / réappliquer un jeu de réglages) : **n'existe pas**
  dans le code, placeholder désactivé « à implémenter » dans la maquette.
