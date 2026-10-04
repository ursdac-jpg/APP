# Questions de Denis en attente de réponse (notées le 2026-10-03, avant compactage de la session)

Ces questions ont été posées par Denis à la fin de la séance du 2026-10-02 / 03. **Aucune n'a encore reçu de réponse ni de code.** Mode A : réponse en `[détaillé]`, avec recommandation, puis maquette AVANT tout code. Ne rien coder sans son feu vert.

## 1. « Quelles fonctions manquent, quels boutons ajouter, enlever, quelles fonctions en double ? »
Demande d'un avis d'ensemble sur l'écran « La mise en page » (cartes : Organisation du CV, En-tête, Compétences, Expériences, Formations, Expérience personnelle, Autres rubriques, Mise en page et texte, Réglages avancés, Format, Réglages supplémentaires). À faire : un audit de doublons et de manques, **sur le code réel** (grep), pas de mémoire. Pistes déjà vues pendant la séance :
- Doublons probables : « Style des compétences » global (Mise en page et texte) ET style par famille (carte Compétences) ; « Dates à la même place » ; deux endroits pour la forme des puces / le signe entre missions ; « Réglages supplémentaires » qui répète des réglages des cartes.
- Un réglage reste dans « Autres rubriques » : « Listes courtes sur 2 colonnes » (logiciels, langues, certifications, centres d'intérêt).
- Reste non traité : mise en forme (G/I/S) du poste des expériences (réglages `soulignerPoste` / `italiquePoste` présents dans le moteur mais sans bouton) ; plafond de 11 missions du Composeur (`capacites.competences`) ; Rectangles, Photo, Frise ne lisent pas la disposition des compétences.

## 2. Intitulés de rubriques modifiables (idée de Denis)
- **Question de pertinence** : « compétences comportementales » ou « qualités » (ou autre) ? Quels synonymes courants pour : compétences professionnelles, compétences comportementales, formations, expérience personnelle (et autres rubriques) ? À rechercher et à proposer sans inventer (fiches de conseil à l'emploi, usages des CV) ; ne pas poser de diagnostic sur la personne.
- **Fonction voulue** : dans chaque rubrique, un réglage « Changer l'intitulé » : 2 ou 3 suggestions + « autre » en saisie libre ; et l'intitulé éditable (exemple : « Formations et certifications » pour fusionner deux rubriques).
- **Autres rubriques qui en bénéficieraient** : à proposer (expérience professionnelle, langues, logiciels et outils, centres d'intérêt, informations complémentaires, certifications).
- **Point technique à signaler dès la réponse (audit du 2026-10-03)** : les intitulés viennent d'UNE source, `_PDF_INTITULES` (`modules/cv-pdf-html/cvPdfTemplateMaquette.js`, ~l.49), **mais le texte de l'intitulé sert aussi de CLÉ** (`data-rub`, réglages par rubrique `reglagesRubriques`, retraits de rubrique, déplacement, ordre, Word). Renommer à l'affichage exige donc de séparer la clé (stable) du libellé affiché, partout : chantier de niveau haut, à auditer (grep sur tout le dépôt) avant toute maquette chiffrée. « Modifier le texte » du plein écran permet déjà de retoucher un titre pour CE CV (correction par clé `data-ed`), à vérifier : c'est peut-être déjà une partie de la réponse.
- Contrainte à garder : français impeccable, ton simple et rassurant, jamais « IA » visible.

## 3. Simplifier le visuel malgré le besoin de personnalisation : fenêtre « rubrique en grand + CV en direct »
Idée de Denis : un petit carré en haut à droite de chaque rubrique ; un clic ouvre cette rubrique en grand à GAUCHE de l'écran (boutons grands et lisibles) et le CV en grand à DROITE, pour voir l'effet en temps réel ; alternative envisagée : agrandir tous les boutons et textes de la page. Il demande mon avis et une maquette si possible.
- Constat déjà fait : le « grand aperçu » (plein écran, `ouvrirPleinEcranMaquette`, outils à gauche + CV à droite) existe déjà et fait presque ça pour les gestes sur le CV ; les cartes de réglages, elles, sont dans la colonne de l'écran principal. Pistes : (a) « focus » d'une carte dans une fenêtre à deux volets (déplacer l'élément de la carte plutôt que le copier, pour garder ses gestionnaires), (b) mode « grands boutons » (échelle) global, (c) les deux. Recommandation à formuler après un audit de la mise en page de l'écran et des tailles de cible actuelles (les boutons G, I, S sont déjà passés à 40 px).
- Toujours : maquette sur le VRAI balisage et les VRAIES feuilles de style (méthode des maquettes du 2026-10-02), rien d'inventé, « Montrer ce qui change ».

## 4. Rappels : ce qui reste à faire par Denis ou à décider (hors ces questions)
- Tests à la vraie souris et au vrai CV : bouton « Éditer » des cartes Formations et Expérience personnelle, option « Même style d'écriture dans toutes les rubriques », disposition / style / signe des compétences, ordre des missions en Par compétences et Mixte, Word téléchargé (puces, signes, soulignement), nom du PDF (« NOM_poste »).
- À décider : plafond de 11 missions du Composeur ; libellé du bouton « Harmoniser » ; « Général » comme nom du style par défaut des familles de compétences.
- Voir `docs/ETAT_DES_CHANTIERS.md` (passation du 2026-10-03), `docs/CHANTIER_CARTES_FORMATIONS_PERSO_STYLE_COMMUN_2026-10-02.md` et `docs/CHANTIER_CARTE_EXPERIENCES_PAR_MODE_2026-10-02.md`.

## Niveau d'effort recommandé (demandé par Denis, 2026-10-03)
Mode A pour l'ensemble. Étiquettes par tâche :
- **Q1, audit des doublons et manques** : `[effort : haut]` (lecture du code réel de toutes les cartes ; `xhigh` seulement si Denis l'autorise et qu'un doute subsiste après).
- **Q2, avis + propositions de synonymes + maquette** : `[effort : haut]` (recherche et jugement de pertinence, public fragile). Implémentation (séparer clé et libellé de rubrique, partout, PDF et Word) : `[effort : haut]`, plan par phases et verdict mode Nuit avant de coder.
- **Q3, avis + maquette de la rubrique en grand + CV en direct** : `[effort : haut]` ; implémentation : `[effort : haut]` (déplacement d'éléments avec leurs gestionnaires, deux volets, mode sombre, mobile).
- **Le mode « grands boutons » seul** (alternative moins coûteuse) : `[effort : moyen]`.
- Séance recommandée : réglée à **haut** de bout en bout ; descendre à moyen seulement pour l'exécution d'un plan validé.

## Réponses données le 2026-10-03 (effort haut) : ce qui a été constaté dans le code
- **Écran « La mise en page » : 228 contrôles dans 11 cartes** (Organisation 18, En-tête 12, Compétences 23, Expériences 38, Formations 32, Expérience personnelle 10, Autres rubriques 10, Mise en page et texte 23, Réglages avancés 3, Format 5, Réglages supplémentaires 54). Hauteur médiane d'un contrôle : 23 à 28 px (cible conseillée : 44 px) ; texte de 10 à 13 px.
- **À grand écran (1400 px) l'écran est déjà en deux volets** : cartes à gauche (739 px), CV vivant à droite (492 px). Le problème n'est pas l'absence de CV en direct, c'est la petite taille des contrôles et leur nombre.
- **Doublons vérifiés** : espaces (5 façons : Organisation « Réduire / Agrandir les espaces », Texte « Espacement », Réglages supplémentaires « Espaces » et « Espacement des paragraphes », plein écran « Espacer les rubriques ») ; style des compétences (3 endroits : case « Compétences en pastilles », Texte « Pastilles / Rectangles / Texte », style par famille) ; polices (Texte et « Autres polices ») ; ordre des expériences (carte Expériences et « Autre ordre des expériences ») ; rubriques à afficher ou masquer (Autres rubriques, Réglages supplémentaires, cases « Afficher »).
- **Réglages cachés qui devraient être dans leur carte** : « Poste souligné / Poste italique », « Regrouper les expériences proches », « Mise en forme des expériences (Standard / Amélioré) » : seulement dans Réglages supplémentaires.
- **Intitulés (correction du constat précédent)** : `_pdfMqTitreH2(texte, cle, icone)` sépare DÉJÀ la clé (`data-rub`) du texte affiché ; le Word lit le rendu, donc suit un titre renommé. Le travail réel : 94 références à `_PDF_INTITULES` dans 5 fichiers, environ 66 titres écrits en dur, et les gabarits à rendu propre (frise, rectangles, photo, A5). Chantier haut mais borné ; à faire par phases (gabarit standard + Word, puis les autres).
- Le « grand aperçu » (plein écran) a déjà le principe volets outils + CV ; les cartes sont des chaînes HTML reconstruites à chaque changement : un « focus » d'une seule carte est réalisable sans déplacer d'éléments.

## DÉCISION DE DENIS (2026-10-03) : ordre validé
1. **Mode « Grands boutons »** d'abord [effort : moyen] : cibles d'au moins 44 px, texte plus grand, réglage d'interface (par appareil), CV inchangé. EN COURS.
2. **Maquette de la rubrique en grand + CV en direct** [effort : haut] (grand écran et mobile).
3. **Maquette puis réalisation des intitulés de rubriques** [effort : haut].
4. **Ménage des doublons** carte par carte : « Réglages supplémentaires » vidé progressivement dans les cartes (maquette + inventaire gardé / déplacé / fusionné, validation de Denis pour tout retrait). En parallèle, jamais à chaud.
Denis a validé cet ordre ET la méthode « vider Réglages supplémentaires dans les cartes ».

## FAIT le 2026-10-03 : mode « Grands boutons » (étape 1)
Case « Boutons plus grands » en haut de « La mise en page » et réglage « Grands boutons » dans le panneau des préférences d'affichage (un seul état, mémorisé sur l'appareil, attribut `data-grands-boutons` sur la racine, règles dans `css/mise-en-page-maquette.css`). Mesuré : 202 contrôles sur 220 faisaient moins de 43 px, il n'en reste que 3 (curseurs natifs, 38 px) ; texte de 10 à 12 px porté à 16 px ; page environ 30 % plus longue (5785 à 7507 px) ; aucun débordement. Essais : parcours `grandsBoutons` (8 contrôles).

## RECOMMANDATION donnée à Denis (2026-10-03) : visible, clair, sans perte d'information
1. Grands boutons (fait) : pour la lisibilité et le toucher.
2. **« Autres options » dans chaque carte** (idée de Denis, adoptée) : ne laisser visibles que les options importantes ; les autres derrière un bouton « Autres options » (zone dépliante). Garde-fous : aucun réglage retiré ; un badge « N modifiée(s) » sur le bouton quand une option cachée n'est plus à sa valeur d'origine ; les réglages cachés restent actifs et testés ; classement « important / autre » proposé par Claude puis validé par Denis (CIP) carte par carte ; même composant (zone dépliante `choix-exp`) pour toutes les cartes. À maquetter AVANT le code, en commençant par la carte Expériences (38 contrôles) ou Formations (32).
3. Puis réévaluer la « rubrique en grand + CV en direct » : avec des cartes plus courtes elle devient moins urgente.
4. Intitulés de rubriques, et ménage des doublons carte par carte (vider « Réglages supplémentaires »).

## Exigence de Denis (2026-10-03) pour les intitulés de rubriques modifiables
Quand la personne change l'intitulé d'une rubrique sur le CV, **l'intitulé de la carte correspondante dans le panneau de réglages change aussi** (même texte), pour qu'elle retrouve tout de suite où régler cette rubrique. À intégrer dans la maquette et le plan (la carte, l'info-bulle, le bouton « Régler sur le CV », les titres de sections), décision à prendre ensemble avant de coder. Point technique : le libellé affiché doit devenir une valeur lue par les deux côtés (CV et panneau), distincte de la clé stable de la rubrique.
