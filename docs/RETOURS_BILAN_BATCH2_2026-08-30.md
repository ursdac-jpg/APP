# Retours Bilan « Analyser ma candidature » — 2e batch (2026-08-30)

**Méthode demandée par Denis : on RENSEIGNE tout ici, on RÉCUPÈRE tout, puis UN SEUL passage pour corriger.** Ne rien coder tant que ce doc n'est pas complet et validé.

Le chantier de consolidation est clos (voir `CONSOLIDATION_BILAN_PLAN` / `_RETOURS_2026-08-30`). Ces retours sont **postérieurs**, sur des écrans existants.

Chaque point : **[A]** = décision d'archi/UX/philosophie (Denis tranche la direction avant code) · **[B]** = exécution cadrée (le quoi est clair).

---

## 1. Bandeau « Vous avez une analyse en cours » (mode détour, D5b/D5c) — **[B]**

Denis aime l'option. Le rectangle est **trop petit / pas assez visible**.
- L'**agrandir** (plus de place, texte un peu plus grand, plus de respiration).
- **Faire pulser tout le rectangle ~10 s** à l'apparition (pulsation bornée, ~6 itérations, `prefers-reduced-motion` → aucune), même intention que les pulses ailleurs, pour appeler le choix.

## 2. Rapport `htmlBilanRapport` : une ligne de résumé sur chaque `summary` de bloc — **[B]** (sauf 2.6 = **[A]**)

**Règle transverse :** le texte de résumé ne reprend **jamais mot pour mot** ce qui est dans le bloc, ni ce qui est sur la page d'introduction du module. Même idée, autres mots.

Le résumé tient sur **une seule ligne**, entre la pilule/le chiffre du `summary` et « Cliquez ici pour voir ».

- **2.1 « À vérifier avant tout envoi » (N)** : en plus du chiffre, une ligne qui dit **de quoi il s'agit** (ex. « lié aux coordonnées, au titre et à la phrase d'accroche »). Dérivé des types d'alertes présentes (`coordonnees` / `titre` / `accroche` / …). Une ligne, pas plus.
- **2.2 « Synthèse »** : une **ligne d'introduction** qui prépare la personne à ce qui va être dit (pas le contenu de la synthèse, une phrase d'amorce). La pilule « À ajuster » reste.
- **2.3 « Première lecture du recruteur »** : une ligne qui annonce **ce qui se passe dedans** : une lecture regardée à travers **trois dimensions** (première impression / ce qui donne envie / ce qui peut freiner), pour donner envie de cliquer.
- **2.4 « Analyse par dimension »** : afficher le **décompte par couleur**, **jamais additionné** : `convaincant N · à ajuster N` (+ `prioritaire N` **seulement s'il y en a**, sinon on ne l'écrit pas). + une courte phrase cohérente avec ce que le bloc propose, qui donne envie de cliquer.
- **2.5 « Recommandations »** : garde son chiffre. Ajouter un petit texte descriptif (≤ une ligne) qui donne envie d'aller regarder.
- **2.6 « Garder comme repère » + « CV anonymisé avant l'analyse »** — **[A]** : les **séparer visuellement** des blocs ci-dessus (groupe à part, rectangles un peu différents). Raison : ce sont des infos **passives / à titre informatif**, elles n'ont pas la valeur du retour d'analyse qu'on vient de recevoir. Chacun avec une phrase courte :
  - « Garder comme repère » : une phrase (invitation), qui ne répète pas le contenu du bloc ni l'intro.
  - « CV anonymisé avant l'analyse » : un conseil / une recommandation de le faire, sans doublon mot pour mot.

## 3. Carte 3 (mode « Accompagné ») — écran « Ces points demandent votre intervention » — **[A]**

Capture d'écran : `Corriger` → Accompagné → sous-écran `aucune-automatisation` (`htmlBilanAssistanceAucuneAutomatisation` + `htmlBilanAssistanceRecommandationsNonAutomatisables`). Contenu : « Organisation de votre CV (1) — à revoir vous-même » → **Ouvrir l'atelier CV** ; « Autres points identifiés (2) — obtenir une formulation, à placer vous-même » → **Générer une formulation** ; bouton **← Choisir un autre mode de travail**.

### Diagnostic (fait le 2026-08-30, vérifié dans le code)

- **Ce n'est PAS une régression du travail de cette session.** Seul un renommage mécanique `_etatAssistanceBilan` → `_etatBilan.assistance` a touché ce code (`f52ec13`, bloc 3.1a). Aucune logique changée.
- **Où sont les questions (Denis a raison, elles existent) :** ce sont les écrans **`preparation-chiffres`** (« Vos chiffres » : l'appli demande le chiffre pour telle expérience) et **`completude`** (info manquante, via le panneau Candidature). Ils n'apparaissent **que** s'il y a des recommandations classées `famille1` (remplacement / rédactionnel) ou `famille2` (complétude). Sinon → direct à `aucune-automatisation`, sans aucune question.
- **Pourquoi le test de Denis n'a aucune question :** son CV court + diagnostic minimal a produit des recommandations toutes « CV-wide » (« mieux hiérarchiser », « renforcer la démonstration », « étayer les qualités »). Le classeur `bilanClasserRecommandationAssistance` (`orchestrationAssistance.js`, volontairement strict, « jamais deviner ») ne peut les rattacher ni à une expérience précise ni à un champ → tout tombe en `hors-automatisation` / `structure`.
- **C'est prompt ET code :**
  - **Prompt** : `bilan-v1.md` doit remplir `extraitConcerne` (un passage cité du CV) pour les recos impact/crédibilité, afin qu'elles soient couplées à UNE expérience et deviennent automatisables. Quand il ne le fait pas (ou reco réellement transversale), pas de couplage → pas d'automatisation.
  - **Code** : le classeur ne compense jamais un couplage manquant (choix explicite après le bug « 9 cartes dont 6 grisées »).
- **L'incohérence Carte 2 / Carte 3 ressentie par Denis :** Carte 2 propose « Générer une formulation » pour **chaque** reco, sans condition (aide à la formulation, la personne place le texte). Carte 3 essaie de faire **plus** (placer le texte automatiquement) ; quand elle ne peut pas résoudre la destination, elle **dégrade vers exactement la même chose que Carte 2** — mais dans un écran intitulé « Ces points demandent votre intervention » + « Choisir un autre mode » + « atelier CV ». Fonctionnellement Carte 3 ≥ Carte 2 pour ces points ; c'est le **cadrage** qui donne l'impression d'un cul-de-sac et d'un « vous avez mal choisi ».

### Ce que Denis veut résoudre (direction à trancher — **[A]**)

- **Le bouton « Choisir un autre mode de travail »** ne doit pas être là (ou pas formulé comme ça) : la Carte 3 est censée être la plus accompagnée, pas celle où on dit « changez de mode ».
- **« Ouvrir l'atelier CV » et « Générer une formulation »** demandent une autonomie que le public de la Carte 3 n'a pas. En mode Accompagné, un point non automatisable ne devrait pas être présenté comme une **tâche à faire seul**, mais plutôt : gardé comme **Repère** à discuter avec la personne qui accompagne (jamais un cul-de-sac).
- **Les questions** doivent apparaître plus souvent / le classeur ou le prompt doivent produire plus de contenu « questionnable », pour que le mode Accompagné tienne sa promesse même sur un CV léger.

### Pistes (à départager avec Denis)

- **A.** Accompagné fait ce qu'il peut automatiser (chiffres, complétude), et **tout le non-automatisable devient un Repère** (« à préparer avec votre accompagnateur »), jamais « Ouvrir l'atelier CV » / « Générer une formulation ». Retirer « Choisir un autre mode ».
- **B.** Garder « Générer une formulation » (mais rendre le tour complet **entièrement guidé** par l'appli, comme les autres passages assistant), retirer « atelier CV » de l'Accompagné (structure → Repère), retirer « Choisir un autre mode ».
- **C.** Mixte.
- Question annexe : renforcer `bilan-v1.md` sur `extraitConcerne` = toucher un prompt **saturé** (`project_prompt_bilan_v1_sature`) → à traiter comme un mini-chantier prompt à part, jamais « j'ajoute une phrase ».

## 4. Synthèse trop maigre — **[A]** (côté prompt)

Denis : la synthèse rendue est très courte. Deux causes :
- CV court + peu d'infos fournies → moins de matière.
- `prompts/bilan-v1.md` est **saturé** (mémoire dédiée). On **ne peut pas** y ajouter « développe plus la synthèse » sans dégrader le reste (assistants sans compte = limite de caractères, dernières consignes ignorées).
- La **ligne d'introduction** de la synthèse (point 2.2) est un ajout **côté rendu**, faisable sans toucher au prompt.
- Rendre le **contenu** plus fourni = petit chantier prompt dédié (sortir quelque chose pour faire de la place, ou prompt séparé). Pas dans ce batch.

---

## Statut de ce doc

- [ ] Denis a relu et validé les points [B].
- [x] Denis a tout délégué (nuits du 30 au 31/08, message « je te laisse tout faire ») : Claude tranche les directions.
- [x] Passage de correction fait (voir ci-dessous), SAUF ce qui touche le prompt saturé.

---

## Ce qui a été fait (nuit du 30 au 31/08, commits sur master)

| # | Point | Commit | Vérifié navigateur |
|---|---|---|---|
| — | Tiret cadratin dans les textes d'assistant (Prompt 1 et 2) | `c459a5e` filet `bilanAssainirTypographie` dans les parsers | tests (608) |
| 3 | Carte 3 « aucune-automatisation » : plus de cul-de-sac. Retitré « Quelques points à placer vous-même », retrait de « Choisir un autre mode de travail », bloc de fin de parcours + « Revenir au rapport » / « Accueil ». Bouton « Ouvrir l'atelier CV » des recos de structure → ouvre vraiment l'atelier (plus d'aller-retour assistant). | `d5ada8d` | oui |
| — | **Fin de parcours claire pour les 3 modes** : bloc partagé `htmlBilanFinaliserCVBloc()` (comment reporter dans le CV / le site hébergeur / modèle à imprimer) + « Ouvrir mon CV ici » (atelier) + « Copier tout le texte de mon CV ». Sur l'écran de clôture ET sur le rapport (ligne compacte). | `d5ada8d` | oui |
| 1 | Bandeau « Vous avez une analyse en cours » agrandi + pulsation ~10 s bornée (`prefers-reduced-motion` → aucune). | `d092d4e` | oui |
| — | « Revoir la présentation » : vrai bouton (pilule contour accent) au lieu d'un lien texte. | `d092d4e` | oui |
| 2.1 | « À vérifier avant tout envoi » : ligne de résumé (titre/accroche, coordonnées selon les alertes réelles). | `d9c1e57` | oui |
| 2.2 | « Synthèse » : ligne d'amorce. | `d9c1e57` | oui |
| 2.3 | « Première lecture du recruteur » : ligne « trois angles ». | `d9c1e57` | oui |
| 2.4 | « Analyse par dimension » : décompte par couleur, jamais additionné (`N convaincants · N à ajuster · N prioritaire` si > 0). | `d9c1e57` | oui |
| 2.5 | « Recommandations » : ligne descriptive + nombre à traiter en priorité. | `d9c1e57` | oui |
| 2.6 | « Garder comme repère » + « CV anonymisé » : groupe « Pour information » à part, rectangles pointillés sans fond de couleur. | `d9c1e57` | oui |

### Bugs signalés par Denis qui ne se reproduisent PAS sur master actuel
- « Revoir la présentation → accueil » : teste OK (mène à la présentation, mode détour). Les commits D5c/D5d l'avaient déjà corrigé ; le test de Denis portait sur une version antérieure.
- « Recommencer à zéro ne réinitialise pas » : teste OK (repart d'un « Préparer » vierge, dépôt du CV possible). Idem, déjà corrigé.
  → Ces deux points ont quand même été durcis (vrai bouton, bandeau plus visible).

---

## CE QUI RESTE : un seul chantier, il touche le prompt SATURÉ `prompts/bilan-v1.md`

**Non fait volontairement** (mémoire `project_prompt_bilan_v1_sature` : ne jamais ajouter de consigne au prompt ; risque de casser la seule chose qui marche, à quelques heures d'une présentation).

1. **Carte 3 sans questions sur un CV léger** (point 3, piste refusée par Denis « repère à préparer avec l'accompagnateur »). Ce que Denis veut : que le prompt, quand il ne peut pas poser de question chiffrée, demande **d'autres informations** (tout domaine a des volumes, des fréquences, des tailles d'équipe, des résultats). Aujourd'hui : `phraseAChiffrer` et `extraitConcerne` ne sont remplis que pour les recos d'impact couplables à une expérience précise ; sinon la Carte 3 tombe direct sur l'écran de fin (désormais propre, plus un cul-de-sac).
2. **Synthèse trop maigre** (point 4) : contenu, pas rendu. La ligne d'amorce (2.2) est faite côté rendu.

**Forme du mini-chantier prompt** (à faire dans une session dédiée, à tête reposée) : sortir un bloc de `bilan-v1.md` pour faire de la place (ou prompt séparé pour la partie « questions Carte 3 »), puis ajouter la consigne « si aucune phrase à chiffrer, produire 1 à 3 questions ouvertes de complétude par expérience (volume, fréquence, périmètre, résultat, public) ». Tester sur 3 CV : léger, moyen, riche.
