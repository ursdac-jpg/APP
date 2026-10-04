# Audit d'écart, contrôle par contrôle : maquette de « La mise en page » (PDF) face à l'application (2026-09-25)

**Règle de cet audit (Denis, 2026-09-25)** : la maquette (`docs/MAQUETTE_MISE_EN_PAGE_PDF_2026-09-21.html`) est la **source de vérité**, ses boutons et fonctions sont déjà travaillés, testés et validés. Objectif : l'application lui est **identique à 100 %** (mêmes contrôles, même place, même rôle, même taille, mêmes dispositions). Aucun choix de la maquette n'est remis en cause ici.

**Deux exceptions déclarées par Denis** :
1. **Modèles** : l'application en a plus que la maquette. Résultat voulu : **tous les modèles** (ceux de la maquette **et** ceux de l'application), présentés dans la galerie avec **les mêmes dispositions que la maquette**.
2. **Options de l'application absentes de la maquette** : à **garder** et à ranger dans la rubrique « Réglages supplémentaires ».

**Méthode** : maquette et application ouvertes côte à côte, cas Doumbouya recréé dans l'application. Lecture du code de la maquette (HTML + script) pour extraire chaque contrôle, puis pour chacun : présence dans l'application, place, rôle. Effet testé au navigateur (clic, comparaison de la feuille avant / après). Aucun code de l'application modifié.

**Légende** : ✓ présent et effet constaté · ≈ présent mais différent (libellé, type de contrôle, place, taille) · ✗ absent · ? présent mais aucun effet observé sur mon cas de test (à confirmer avant de conclure).

**Limites** : dossier injecté à la main (pas de compétences ni d'accroche produites par l'assistant, pas de missions de formation, 2 formations seulement). Un « ? » peut venir de ces données et non d'un défaut. Non testé : mode sombre, rendu réel à l'impression, le plein écran en détail (voir bloc 9), Word.
L'ancienne barre de navigation à 9 repères vue en haut pendant l'audit venait de mon dossier de test (`modeCreation` vide) : tous les parcours réels ont la barre du module (`afficherProgression()`, `js/app.js` ~3591).

---

## 0. La feuille du CV (écart le plus visible)

La maquette montre les 3 allures avec **la même architecture de page** (1 colonne par défaut, `deux: false`) ; seule la décoration change. L'application a une architecture différente.

| | Maquette | Application |
|---|---|---|
| Structure | 1 colonne pleine largeur : bandeau « Compétences professionnelles / comportementales » sur 2 colonnes, expériences pleine largeur (dates à droite), formations, puis Logiciels et Centres d'intérêt sur 2 colonnes | 2 colonnes : Formations / Compétences / Logiciels / Centres d'intérêt à gauche (étroite), Expériences à droite |
| Standard | Page blanche neutre, filet bleu, aucun aplat | Bandeau bleu dégradé **et** colonne droite bleue foncée (expériences en blanc) |
| Sobre / Créatif | Même page, seule la décoration change (Sobre : fond pâle, texte simple ; Créatif : bandeau, pastilles) | Même page 2 colonnes pour les 3 allures |
| En-tête | Nom, titre centré, accroche encadrée à filet vertical, coordonnées avec petits carrés | Nom, coordonnées très petites, titre coupé en haut à droite, accroche non vue (voir limites) |
| Dates / lieu | Dates alignées à droite, lieu en italique | Dates collées derrière le lieu, lieu normal (Position des dates « à droite » sélectionnée) |

Cause : le cahier (règle 6, C50) avait décidé de **conserver les modèles réels** et de tenir les vignettes de la maquette pour des « illustrations ». Avec la règle du jour (maquette = vérité), la feuille de la maquette devient la référence des allures.

## 1. En-tête et rangée du haut

| Contrôle (maquette) | Application | Verdict |
|---|---|---|
| Icône engrenage dans un rond + titre « La mise en page » + phrase | Titre et phrase, sans l'icône | ≈ |
| Bouton **Aide** (haut droite) + fenêtre « Aide : La mise en page » (4 encarts) | Absent | ✗ |
| « Aperçu en plein écran » (icône flèches) | Présent, icône emoji 📄 | ≈ |
| Dé « Style rapide (aléatoire) / Un style complet en un clic. » ; devient « Un autre modèle (n sur N) » en Sobre/Créatif | « Style au hasard / Une mise en page complète, palette sûre. » ; « (n sur N) » présent mais N = 2 (Sobre) et 12 (Créatif) au lieu de 3 et 6 | ≈ |
| ↺ Annuler le tirage (historique propre) | ↩, un historique partagé avec « Mise en page » (les deux s'activent ensemble) | ≈ |
| ⏮ Revenir au modèle de départ | Présent | ✓ |
| « Mise en page » (fait tenir sur une page ou remplit) + ↺ Annuler | Présent | ✓ (rôle non retesté) |
| Rangée du haut : 2 cartes côte à côte | Présentes ; boutons ↩ écrasés quand la colonne est étroite | ≈ |
| Grille : panneau 1,5 / aperçu 1, bascule en 1 colonne à 1050 px | Panneau 1,5 / aperçu 1 ; bascule à **900 px** | ≈ |

## 2. Allure générale + Couleurs

| Contrôle | Application | Verdict |
|---|---|---|
| Sobre / Standard / Créatif | Présents | ✓ |
| 5 teintes | Présentes | ✓ |
| **Couleur de l'entreprise** (pastille verte à bord pointillé) ou pastille grise « non captée » + message | Absente | ✗ |
| « Personnalisée » (roue de couleur) | Sélecteur de couleur présent, sans la roue | ≈ |
| « Dégradé » (Un effet que Word ne sait pas faire.) | Présent, aucun effet observé (`?`) | ? |
| **Vignettes de modèles** sous l'allure + légende + « 2 modèles de plus en 2 colonnes » | Vignettes présentes en Sobre (2 sur 3 : « Épuré » absent) et en Créatif (6, ordre différent : maquette Bandeau entier, Bandeau diagonal, Colonne colorée, Cadre de page, Titres à pictogrammes, Colonne et frise ; application Colonne colorée, Bandeau diagonal, Bandeau entier, …). Modèles réels en plus (12 recettes) hors galerie. | ≈ (exception 1) |
| Standard : légende « la base neutre… » | Présente | ✓ |
| Sous-titre « Choisissez le style visuel de votre CV. » | Autre phrase (3 définitions) | ≈ |

## 3. Organisation du CV

| Contrôle | Application | Verdict |
|---|---|---|
| Standard (recommandé) / Personnaliser | Présents | ✓ |
| **Blocs courts : Côte à côte / L'un sous l'autre** (visible seulement en 1 colonne) | Absent | ✗ |
| **Ordre des rubriques** (Personnaliser, 1 colonne) : 4 lignes avec ▲ ▼ | Absent (une phrase seulement) | ✗ |
| Compétences en haut | Présent, aucun effet observé en 2 colonnes | ? |
| Formations avant expériences | Présent, aucun effet observé en 2 colonnes | ? |
| Afficher les centres d'intérêt | Présent, aucun effet observé | ? |
| Deux colonnes | Présent, effet constaté | ✓ |
| Réduire les espaces / Agrandir les titres | Présents, effet constaté | ✓ |
| Icônes sur les rubriques / Icônes sur les coordonnées / Compétences en pastilles | Présents, aucun effet observé en Standard | ? |
| Disposition en 2 colonnes de cases, ordre des 9 options | Même ordre | à vérifier visuellement |

## 4. Expériences professionnelles

| Contrôle | Application | Verdict |
|---|---|---|
| Mode de présentation Chronologique / Par compétences / Mixte | 3 boutons radio présents ; **Par compétences et Mixte ne changent pas la feuille** (mode non rendu, déjà prévu au cahier 5.4) | ✗ (rôle) |
| « Indiquer l'expérience entre parenthèses » (modes Par compétences / Mixte) | Absent | ✗ |
| Expériences à afficher Toutes / Les plus pertinentes | Présents, effet constaté ; 9 cases présentes, toutes cochées (la maquette précoche les 5 plus pertinentes) | ≈ |
| Position des dates (droite / sous / avant) | Présents, effet constaté | ✓ |
| Niveau de détail (Automatique / Complet / Résumé) | Présents, Résumé a un effet, Complet identique à Automatique quand tout tient | ✓ |
| « Vos expériences et leurs missions » : lignes avec case, − N +, « /N », « Missions ▾ », liste de missions à cocher, « Remettre les premières » | Lignes, cases, − + et « Missions ▾ » présents (`/N` vu) ; « Remettre les premières » absent du code | ≈ |
| Résumé « 9 expériences affichées · cliquez pour modifier » | « 9 expériences affichées » | ≈ |
| **Ordre** : liste déroulante (Du plus récent au plus ancien / Mon ordre / Du plus pertinent) | 4 boutons (Pertinence, Plus récentes, Plus anciennes, Poste A→Z) ; « Mon ordre » absent | ≈ |
| Missions par expérience − N + | Présent, effet constaté | ✓ |
| Style des missions Épurées (Une par ligne) / Condensées (À la suite) | Présents sans les sous-libellés, effet constaté | ≈ |
| Dates S / I ; Entreprise S / I | Présents, effet constaté | ✓ |
| Afficher le lieu ; Style du lieu (Normal / Italique / Gris) | Présents, effet constaté ; **défaut = Normal** (maquette : Italique) | ≈ |
| Bloc d'information « pour tout faire tenir… » | Présent (texte légèrement différent) | ≈ |

## 5. Formations

| Contrôle | Application | Verdict |
|---|---|---|
| Quelles formations montrer : Complet / Optimisé | Présents ; Optimisé sans effet sur mon cas (2 formations) | ? |
| Afficher les missions de la formation | Présent ; pas de missions dans mon cas | ? |
| **Titre de la formation : G / I / S** | Absent | ✗ |
| Espace entre les formations (curseur 0 à 16, valeur en px) | Présent, effet constaté | ✓ |

## 6. Éléments supplémentaires

| Contrôle | Application | Verdict |
|---|---|---|
| Compétences professionnelles / comportementales à afficher : − N + | Présents ; effet non concluant (mon cas a 4 compétences) | ? |
| **« Choisir ▾ »** + liste de cases + « Remettre l'ordre automatique » (pro et comportementales) | Absents | ✗ |
| Message « 2 compétences n'ont pas été proposées… » + « Voir la liste » | Absent | ✗ |
| Rubriques à afficher : cases Logiciels et outils / Langues / Certifications (« (exemple) ») | **Boutons Afficher / Masquer**, ordre Langues, Certifications, Logiciels ; Logiciels : effet constaté ; Langues et Certifications : aucun effet vu | ≈ |

## 7. Mise en page et texte

| Contrôle | Application | Verdict |
|---|---|---|
| **Titre du CV** (liste « Propositions de l'assistant ») | Absent | ✗ |
| **Phrase d'accroche** (liste) + **Sans accroche** | Absents | ✗ |
| Police : 4 choix (Arial recommandée, Calibri, Georgia, Verdana) | Liste de **10** polices, sans « recommandée » ; effet constaté | ≈ |
| **Taille de : Texte / Titres** + curseur (10 à 14 / 10 à 30) | Absent (un curseur de taille existe dans l'ancienne carte « La page ») | ✗ |
| Espacement Serré / Normal / Aéré | Présent, effet constaté | ✓ |
| **Marges de la page 8 / 10 / 14 mm** | Absent (l'ancien réglage « Marges » ne pilote rien en PDF) | ✗ |
| Compétences Pastilles / Rectangles / Texte | Présent, aucun effet observé en Standard | ? |
| Fond de la colonne Aucun / Gauche / Droite | Présent, aucun effet observé en Standard | ? |

## 8. Réglages avancés et Format

| Contrôle | Application | Verdict |
|---|---|---|
| Texte justifié | Présent, effet constaté | ✓ |
| Trait entre les deux colonnes | Présent, effet constaté | ✓ |
| **Petits carrés devant les coordonnées** | Absent | ✗ |
| Format : A4 (une page) / A4 complet (plusieurs pages) | Présents (mêmes noms légèrement différents) ; effet non visible quand tout tient sur une page | ✓ |
| Phrase « Format A5 : bientôt » | « A5 : disponible dans la carte La page plus bas » | ≈ |

## 9. Barre du bas, aperçu, fenêtres

| Contrôle | Application | Verdict |
|---|---|---|
| Barre fixe du bas : **« Revenir au modèle de départ »** (libellé) + **« Valider le CV → »** | Absente : seulement ⏮ sans libellé et la barre Retour / Accueil de l'application | ✗ |
| Message rouge « le CV dépasse une page » (`avertPage`) | Non retrouvé | ✗ |
| Sous l'aperçu : « 9 expériences affichées sur 9 » / « Estimation : le CV tient sur 1 page » | « 9 expériences affichées » seul | ≈ |
| **Fenêtre « Exporter votre CV »** (Enregistrer en PDF + phrase d'aide, Copier le texte, Envoyer vers Canva) | Existe dans l'application mais dans le rectangle « Exporter » **séparé** de la page « Vos documents » | ≈ |
| **Plein écran** (maquette) : bouton « ← Revenir aux réglages », phrase d'aide, compteur de pages ; outils **Modifier le texte, Régler l'en-tête** (disposition 3 / 2 colonnes, « Remettre l'en-tête à sa place »), **Déplacer une expérience** (▲▼), **Retirer une compétence** (×) ; 3 aides repliables ; barre flottante d'une rubrique (taille A− A+, interligne Serré / Normal / Aéré, Remettre, ×) ; barre flottante d'un bloc d'en-tête (taille, G, I, couleur, largeur, position ◀▲▼▶, Remettre, ×) | L'aperçu s'agrandit dans la page avec l'**ancienne barre d'outils** (Style aléatoire, Personnaliser, Pipette couleur, CV Complet / Sobre / Créatif, Mise en page, A4 Détaillé / Essentiel / Mini A5 portrait et paysage / Intégral, Réinitialiser, Annuler, Imprimer, ✍️, G, I, ✕, Taille normale). « Déplacer une expérience » existe dans le code du modèle mais pas comme outil de la maquette. **Les outils de la maquette sont, pour l'essentiel, absents.** | ✗ |

## 10. Cartes de l'application absentes de la maquette (exception 2)

Aujourd'hui, sous un titre « Réglages supplémentaires » (non repliable) : **La page** (formats A4 Essentiel, Mini CV A5 portrait/paysage, colonnes, taille du texte, densité, colonnes inversées, largeur, forme, espacement, marges), **Les couleurs** (texte sur le fond, effet du fond, dégradé…), **Le haut de la page** (bandeau, forme, dégradé du bandeau, coordonnées à part, disposition, anneau photo, photo), **Le texte** (titres de rubrique, lecture guidée, icônes, bordures…), **Ce qui s'affiche** (éviter un titre seul en bas de page, rubriques à masquer). À conserver, dans la rubrique « Réglages supplémentaires ». En plus, d'autres options de l'application sans équivalent maquette : 6 polices supplémentaires, options d'ordre « Plus anciennes » et « Poste A→Z », ancienne barre d'outils du grand aperçu (Pipette, CV Complet, Mini CV A5, Imprimer…).

---

## Autres écarts trouvés qui pourraient être des exceptions (à trancher par Denis)

- **E3. Valider / Exporter** : la maquette a « Valider le CV → » qui ouvre la fenêtre Exporter. Dans l'application, « Exporter » est un rectangle à part de la page « Vos documents », avec « Le format » (Word / PDF) au-dessus et la barre Retour / Accueil. Comment relier « Valider le CV » à cette structure ?
- **E4. Plein écran (décision de Denis, 2026-09-25 : « je la veux que dans la maquette »)** : la page « Aperçu en plein écran » devient **exactement celle de la maquette** (en-tête « ← Revenir aux réglages », phrase d'aide, compteur de pages, outils Modifier le texte / Régler l'en-tête / Déplacer une expérience / Retirer une compétence, 3 aides repliables, barres flottantes de rubrique et de bloc). L'ancienne barre d'outils disparaît de cette page. Reste à trancher pour la règle zéro régression : ses fonctions absentes de la maquette (Pipette couleur, CV Complet, Mini CV A5 portrait / paysage, Imprimer / Enregistrer en PDF, Taille normale, G / I) sont-elles **gardées ailleurs** (Réglages supplémentaires, recommandé) ou **retirées** ?
- **E5. Options en trop dans un contrôle de la maquette** : 6 polices, choix d'ordre « Plus anciennes » et « Poste A→Z », défaut du style du lieu. La règle zéro régression impose une décision explicite avant tout retrait : garder dans « Réglages supplémentaires » (recommandé) ou retirer.
- **E6. Défaut de la page** : la maquette démarre en **1 colonne** (Standard blanc). L'application démarre en 2 colonnes avec bandeau et colonne bleus. Changer le défaut change l'aspect de tous les CV produits ensuite.
- **E7. Format A5 et A4 Essentiel** : la maquette dit « A5 bientôt » ; l'application les propose déjà. Garder dans « Réglages supplémentaires ».
- **E8. Word** : non touché ici (chantier ultérieur, `PLAN_PARITE_WORD_MISE_EN_PAGE_2026-09-23.md`).
- **Point à corriger dans la documentation** : le cahier du chantier annonce « 7 cartes sur 8 identiques à la maquette ». Ce contrôle contrôle par contrôle montre que c'est faux dans le détail (voir les ✗ ci-dessus). Le cahier est à corriger.

## Rapport d'écart et de marche arrière

1. **Écart** : ossature des cartes fidèle, mais environ 25 contrôles absents (✗), une trentaine « différents » (≈), une dizaine à confirmer (?), le plein écran de la maquette (outils d'édition directe) presque entièrement absent, et une feuille de CV d'architecture différente.
2. **Coût de correction** : **élevé** au total. Panneau : moyen (beaucoup de petits ajouts, dont 3 vrais moteurs neufs : ordre des rubriques ▲▼, mode Par compétences / Mixte, taille des titres). Plein écran : élevé (en-tête libre avec poignées, déplacer / retirer, barres flottantes). Feuille : élevé.
3. **Coût de marche arrière** : **non pertinent** (les écarts viennent surtout de fonctions jamais construites, pas d'une régression). Dernier commit avant la phase 5 : `ad5483c`.
4. **Recommandation** : réparer, **en tranches vérifiables**, chacune terminée par un contrôle contrôle-par-contrôle contre la maquette (rejeu du script `docs/VERIFICATION_MAQUETTE_MISE_EN_PAGE_PDF_2026-09-21.js` adapté à l'application), jamais « fini » sans cette preuve.

## Ordre de travail proposé

1. Cadre commun : icône et en-tête, bouton Aide + fenêtre, barre du bas, sous-aperçu, tailles et dispositions (visuel identique). Rubrique « Réglages supplémentaires » repliable (exception 2).
2. Feuille : la page de la maquette pour les 3 allures + galerie de **tous** les modèles (maquette + application, exception 1), pastille de couleur entreprise, roue.
3. Cartes, une à une : Organisation, Expériences, Formations, Éléments supplémentaires, Mise en page et texte, Réglages avancés, Format.
4. Plein écran de la maquette.
5. Fenêtre Exporter / Valider.
6. Contrôle final contrôle par contrôle, clair et sombre, cas Doumbouya.
