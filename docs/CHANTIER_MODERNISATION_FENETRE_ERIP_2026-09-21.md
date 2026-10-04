# Chantier : moderniser visuellement la fenêtre ERIP partagée

> Statut : **préparation seulement, rien codé**. Ouvert le 2026-09-21 (Denis, en regardant la fiche métier « Carreleur »), à reprendre quand Denis aura plus de temps. Mode A (décision de philosophie visuelle) : maquette + questions avant tout code, comme prévu pour ce type de chantier.

## Origine

Denis a demandé si on pouvait « moderniser » la fenêtre qui affiche la fiche descriptive d'un métier (capture d'écran : « Carreleur », savoir-faire/savoir-être/savoirs, bouton Comparer, bouton Choisir ce métier). Vérification faite avant d'aller plus loin : **ce n'est pas une fenêtre spécifique à cet écran.**

## Périmètre réel : un composant unique, partagé par toute l'application

- Fonction : `ouvrirFenetreERIP(config)`, `js/app.js` (~ligne 4266).
- Wrapper le plus utilisé : `ouvrirPanneauGuide(titre, contenuHTML, aideContexte)` (~ligne 1195), qui n'est qu'un appel direct à `ouvrirFenetreERIP()`.
- Styles : `css/style.css`, classes `.fenetre-erip-overlay`, `.fenetre-erip-boite` (+ variantes `-large` / `-tres-large`), `.fenetre-erip-entete`, `.fenetre-erip-titre`, `.fenetre-erip-fermer`, `.fenetre-erip-corps` (~lignes 3768-3822).
- **Nombre de points d'appel recensés (`ouvrirFenetreERIP(` + `ouvrirPanneauGuide(`) : ~108**, répartis ainsi :
  - `js/app.js` : 80
  - `data/metiers.js` : 8
  - `modules/regard-exterieur/index.js` : 12
  - `modules/reperes/index.js` : 3
  - `modules/carnet/index.js` : 2
  - `modules/lexique/index.js` : 2
  - `modules/ats/index.js` : 1

**Conséquence directe** : un changement visuel sur ce composant s'applique instantanément à toutes les fenêtres de toute l'application (confirmations, choix de parcours, fiches métier, panneaux « métier associé à une compétence », Repères, Carnet, Lexique, ATS, Regard extérieur...). Décision déjà actée avec Denis le 2026-09-21 : **on modernise le composant partagé, pas une fenêtre à part** (option écartée : dupliquer un style rien que pour la fiche métier, rejetée car elle aurait créé une deuxième apparence de fenêtre dans l'app).

## Ce qui NE bouge PAS dans ce chantier

1. **La forme des boutons Bootstrap** (`.btn-primary`, `.btn-outline-primary`, `.btn-outline-secondary`). Décision déjà actée par Denis (commentaire `css/style.css` ~ligne 1700) : *« on GARDE la forme actuelle des boutons (rayon, taille, plein vs contour). On change SEULEMENT la couleur, qui suit l'accent choisi. »* Ce chantier ne rouvre pas ce sujet : seul le cadre de la fenêtre (fond, ombre, en-tête, croix de fermeture, overlay) est en jeu, jamais le contenu Bootstrap standard à l'intérieur.
2. **Le comportement JavaScript** de `ouvrirFenetreERIP()` : c'est un composant mature avec des mécanismes fins déjà corrigés suite à de vrais bugs remontés par Denis, notamment :
   - une seule fenêtre ERIP ouverte à la fois (en ouvrir une ferme immédiatement toute fenêtre déjà présente) ;
   - rafraîchissement sans « tremblement » quand le même titre se réaffiche (pas de replay de l'animation, pas de perte du défilement) ;
   - focus clavier posé automatiquement sur le premier élément interactif à l'ouverture, restitué à la fermeture ;
   - contour de focus visible en bleu du thème (`:focus-visible`), jamais supprimé (accessibilité) ;
   - gestion de la touche Échap, empilement z-index avec les icônes persistantes et les overlays de démo vidéo.

   **Aucune de ces mécaniques ne doit être touchée.** Ce chantier est un chantier CSS, pas un chantier de comportement.
3. **Les 3 tailles existantes** (`standard` / `large` / `tresLarge`, ~520px / 700px / 900px) : gardées telles quelles, sauf si Denis demande explicitement d'y toucher.

## État actuel (baseline avant modification)

```css
.fenetre-erip-overlay {
  position: fixed; inset: 0; background: rgba(11,26,51,0);
  display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 1rem;
  transition: background 0.2s ease;
}
.fenetre-erip-overlay.visible { background: rgba(11,26,51,0.55); }
.fenetre-erip-boite {
  background: var(--bg-card); border-radius: 1.5rem; max-width: 520px; width: 100%;
  max-height: 85vh; overflow-y: auto; padding: 1.5rem;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  opacity: 0; transform: translateY(12px) scale(0.97);
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fenetre-erip-entete { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem; margin-bottom: 0.8rem; }
.fenetre-erip-titre { font-size: 1.2rem; font-weight: 800; color: var(--text-strong); margin: 0; }
.fenetre-erip-fermer {
  border: 1px solid var(--border-strong); background: var(--bg-card); border-radius: 50%;
  width: 32px; height: 32px; min-width: 32px; padding: 0; font-size: 0.9rem;
  color: var(--text-muted); cursor: pointer; flex-shrink: 0; line-height: 1;
}
```

Déjà présent, pas si daté que ça : coins arrondis généreux (1.5rem), ombre portée, overlay assombri, animation d'entrée fondu + léger zoom. Ce qui date le plus à l'œil : l'overlay uni sans profondeur, l'ombre un peu « plate » à une seule couche, la croix de fermeture en cercle isolé (différente du style « croix simple, fond au survol » déjà utilisé ailleurs dans l'app pour les panneaux Carnet / Journal / Pistes de côté, voir `.carnet-panneau-fermer`, `.cp-panneau-panier-fermer`), et l'absence de tout repère de couleur de module en tête de fenêtre.

## Pistes de modernisation à arbitrer avec Denis (aucune tranchée)

Pour chaque piste : ce que ça change, le bénéfice, le risque.

1. **Overlay avec flou d'arrière-plan (`backdrop-filter: blur()`)** au lieu d'un simple assombrissement uni.
   - Bénéfice : effet « verre dépoli », très identifié comme moderne (iOS, Windows 11).
   - Risque : coût de performance sur un appareil bas de gamme (public cible parfois peu équipé) ; support navigateur à vérifier mais large aujourd'hui. À tester avec un flou léger (4-6px) et repli simple (l'assombrissement actuel) si `backdrop-filter` n'est pas supporté : dégradation déjà propre, pas de risque réel de casse.

2. **Ombre en plusieurs couches, plus douce** plutôt qu'une seule ombre large à 30 % d'opacité.
   - Bénéfice : effet de profondeur plus réaliste, moins « plaqué ».
   - Risque : aucun, changement purement cosmétique et local.

3. **Liseret de couleur en tête de fenêtre**, reprenant l'accent du module d'où la fenêtre est ouverte (même principe que le filet déjà utilisé sur le panneau « Pistes de côté », `border-top: 3px solid var(--accent)`).
   - Bénéfice : cohérence avec les panneaux déjà modernisés cette semaine (Carnet, Journal, Pistes de côté), sentiment que chaque fenêtre « appartient » à son module.
   - Risque : `ouvrirFenetreERIP()` ne reçoit aujourd'hui aucune information sur le module appelant. Ajouter ce liseret demanderait soit une couleur neutre par défaut (accent global, pas de changement de signature), soit un vrai paramètre optionnel `config.accentModule` à ajouter aux ~108 appels un par un (gros travail pour un effet cosmétique, pas recommandé dans un premier temps). **Recommandation : accent global uniquement, pas de paramètre par module, au moins pour cette 1re passe.**

4. **Croix de fermeture harmonisée** avec le style déjà en place sur les panneaux Carnet / Journal / Pistes de côté (croix simple sans cercle, fond discret au survol) plutôt que le cercle isolé actuel.
   - Bénéfice : une seule apparence de croix de fermeture dans toute l'application, cohérence immédiate avec le travail déjà fait cette semaine.
   - Risque : aucun fonctionnel, juste visuel.

5. **Affiner la courbe d'animation** (passer de `ease` à une courbe plus « ressort léger », ex. `cubic-bezier(0.34, 1.3, 0.64, 1)`) pour une ouverture un peu plus vivante.
   - Bénéfice : détail de finition, peu coûteux.
   - Risque : à doser. Un effet ressort trop marqué peut distraire ou gêner une personne en fragilité numérique. Rester très discret si retenu.

**Recommandation d'ensemble** : pistes 2 et 4 d'abord (aucun risque, cohérence immédiate avec le travail déjà validé cette semaine), puis piste 1 (flou, fort effet visuel) à tester concrètement sur appareil modeste avant de trancher, piste 3 reportée (coût de développement disproportionné pour l'effet), piste 5 en dernier réglage fin si le temps le permet.

## Méthode de travail proposée (respecte la règle « maquette avant code »)

1. Construire une **maquette HTML statique** (pas de code réel touché) montrant : la fenêtre actuelle et 1 à 2 versions modernisées, côte à côte, sur **au moins 3 cas représentatifs** pris dans l'app réelle (pas un seul type) :
   - une fenêtre courte de confirmation (ex. « Recommencer ce module ? »),
   - la fiche métier (celle qui a déclenché la demande, avec ses badges de compétences et 2 boutons),
   - une fenêtre plus longue à défilement interne (ex. liste de métiers associés à une compétence).
   - Le tout en clair **et** en sombre (non négociable, comme partout dans l'app).
2. Montrer cette maquette à Denis, recueillir sa réaction précise sur chaque piste (1 à 5 ci-dessus).
3. Une fois la direction validée, appliquer le changement **au seul endroit réel** (`css/style.css`, les classes `.fenetre-erip-*` listées plus haut) : un diff volontairement petit, puisqu'un seul point de style dessert les ~108 appelants.
4. Revérifier au navigateur sur un **échantillon de 5-6 fenêtres réelles différentes** de l'application (pas seulement celle d'origine) avant de committer, clair et sombre, desktop et mobile : vu le nombre d'appelants, une régression visuelle serait sinon repérée tard.

## Prochaine étape concrète (à faire au lancement réel du chantier)

Construire le fichier `docs/MAQUETTE_FENETRE_ERIP_MODERNISEE_<date>.html` décrit à l'étape 1 ci-dessus, puis reprendre ce document pour la suite.
