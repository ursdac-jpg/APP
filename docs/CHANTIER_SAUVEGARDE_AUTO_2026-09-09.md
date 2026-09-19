# Chantier - Sauvegarde automatique locale (ABANDONNÉ le 2026-09-09)

> **DÉCISION DENIS, 2026-09-09 : on ne fait PAS la sauvegarde automatique locale.**
> Raison : un même PC (en structure) peut servir à deux personnes différentes. Une
> sauvegarde automatique ferait tomber la 2e personne sur la session de la 1re, avec
> accès à ses informations. Le comportement actuel **« page fermée = tout est effacé »
> est voulu** : c'est une protection de la vie privée sur un poste partagé, cohérent
> avec toute la doctrine de l'app (rien n'est stocké en ligne, rien ne persiste).
>
> Corollaire : **on ne renomme pas non plus** le bouton / panneau de la disquette
> (« Sauvegarder ma session » reste). « Si la personne ne pense pas à sauvegarder, elle
> refera - ça ne fait pas de mal ; si c'est important, elle sauvegardera. »
>
> Le document ci-dessous est **conservé comme trace** : si un jour l'app a un serveur +
> des comptes (scénario association, `IDEES_A_RECLASSER.md`), une partie de l'analyse
> (états de modules pontés, historique) pourra resservir - mais **jamais** en
> `localStorage` silencieux sur un poste partagé.

---

**Ouvert puis abandonné le 2026-09-09.** Demande initiale : de plus en plus de modules
accumulent de l'état ; fermer l'onglet sans avoir cliqué la disquette = tout est perdu.
Après réflexion, Denis a tranché contre (voir encadré ci-dessus).

Maquette (conservée comme trace) : `docs/MAQUETTE_PANNEAU_SAUVEGARDE_2026-09-09.html`.

---

## Ce qui existe déjà (à ne pas refaire)

- `sauvegarderSession()` : copie complète et indépendante = `dossier` + `historiquePages` +
  `pageActuelle` + `modulesEtat` (états des 6 modules « isolés » pontés par
  `collecterEtatsModulesPourSauvegarde()` / `restaurerEtatsModules()`). `js/app.js`.
- `exporterSessionFichier()` / `importerSessionFichierSelectionne()` : la **disquette**
  (fichier `.json` que la personne déplace elle-même). Panneau `#panneauSessionTransfert`
  (`index.html`), câblé par `initBoutonSessionTransfert()`.
- `CLE_SESSION` (`aps_session_sauvegarde`, `localStorage`) : **uniquement** l'instantané
  d'annulation pris **juste avant** un « Tout effacer » / un « Réinitialiser ». `ecrireSauvegarde()`
  / `lireSauvegarde()` / `effacerSauvegarde()` / `sauvegardeExiste()`.
- Le panneau disquette contient déjà : zone « Recommencer complètement » → « Tout effacer
  sur cet appareil » (confirmation ERIP avec « Annuler / Exporter d'abord / Tout effacer ») +
  « Restaurer » (un cran, tant que `CLE_SESSION` existe). Décision Denis 2026-09-01
  (`docs/CHANTIER_BOUTON_REVOIR_PRESENTATION.md`, sections D et E) : ces gestes ont quitté le
  haut de l'écran pour se ranger là. **Ils n'ont pas disparu, ils ont déménagé.**

## Ce qui manque (le chantier)

1. **Personne n'écrit `sauvegarderSession()` dans `localStorage` pendant l'usage normal** -
   seulement avant une action destructrice. Il n'y a **aucune sauvegarde automatique**.
2. Au chargement, `localStorage` n'est **jamais relu** pour retrouver le travail (sauf le
   bouton « Restaurer »).
3. Aucun **historique** (revenir à une version d'il y a 1 h).
4. Le panneau dit « **Cette application ne garde rien automatiquement** » - deviendra faux.
5. Sur un poste partagé, rien ne **signale** à la personne suivante qu'un travail est resté.

---

## Décisions à prendre (Denis)

### D1. Restauration au chargement : silencieuse + bandeau, ou fenêtre de choix ?

- **Reco : restauration silencieuse + un bandeau discret en haut**
  « Un travail enregistré sur cet ordinateur a été retrouvé. [Continuer] [Effacer et
  repartir de zéro] ». *Bénéfice* : la personne ne perd jamais son travail, et sur un poste
  partagé le bandeau **révèle le résidu** de la personne précédente et permet de l'effacer en
  un clic. *Risque* : une personne pressée peut cliquer « Continuer » sur le travail de
  quelqu'un d'autre - mais elle le verrait tout de suite (ce n'est pas son CV) et le bandeau
  reste actionnable.
- *Alternative* : une fenêtre bloquante « Reprendre / Repartir de zéro » à chaque
  chargement. *Bénéfice* : choix explicite. *Risque* : une fenêtre modale dès l'ouverture,
  à chaque fois, pour le cas courant (mono-utilisateur qui veut juste reprendre) = friction
  et angoisse pour le public cible.

### D2. Fréquence d'écriture

- **Reco** : un `localStorage.setItem` **différé** (debounce ~2 s) après tout changement,
  déclenché depuis : `naviguerVers()` (chaque changement de page), les points « après
  modification » déjà existants des modules (Carnet, Repères...), et un `setInterval` de
  filet (~10 s) si un drapeau « modifié » est posé. Plus une écriture **synchrone** sur
  `pagehide` / `visibilitychange` (onglet fermé / mis en arrière-plan).
- *Risque* : écrire trop souvent un gros objet. Mitigation : debounce + drapeau « dirty » +
  ne réécrire que si le JSON a changé (comparaison de longueur, ou hash léger).

### D3. Historique : combien de versions, quel pas de temps ?

- **Reco** : garder les **5 dernières** versions, une nouvelle entrée **au plus toutes les
  10 minutes** (sinon on écrase la plus récente). Affichées comme « il y a 12 min », « il y
  a 1 h », « hier 14:32 ». *Bénéfice* : « je reviens en arrière » couvert sans exploser le
  quota. *Risque* : quota `localStorage` (~5 Mo). Mitigation : sur `QuotaExceededError`,
  supprimer la plus vieille entrée et réessayer ; plafond dur.

### D4. Nom du panneau

- Aujourd'hui « Sauvegarder ma session ». **Reco** : « **Mes données sur cet ordinateur** »
  (ou « Ma session sur cet ordinateur ») - décrit ce que c'est vraiment devenu.
  *À trancher par Denis.*

---

## Clés `localStorage` (séparation stricte - ne jamais confondre)

| Clé | Rôle | Écrite par | Lue par |
|---|---|---|---|
| `aps_session_sauvegarde` (`CLE_SESSION`, **existe**) | Instantané d'annulation d'un « Tout effacer » (un seul cran) | `ecrireSauvegarde()` avant `recommencer()` | bouton « Restaurer » |
| `aps_session_auto` (**nouveau**) | Sauvegarde automatique roulante | debounce + `pagehide` | restauration au chargement |
| `aps_session_historique` (**nouveau**) | Tableau `[{ horodatage, data }]`, plafond 5 | même déclencheur, throttlé 10 min | « Reprendre une version précédente » |

« Tout effacer sur cet ordinateur » supprime **les trois** (après avoir posé l'instantané
d'annulation dans `CLE_SESSION`).

---

## Garde-fous (doctrine + LECONS)

- **La donnée ne quitte jamais l'ordinateur.** `localStorage` uniquement. La promesse
  « rien n'est envoyé sur Internet » tient. (Aucun serveur - chantier séparé, plus tard,
  cf. `IDEES_A_RECLASSER.md` 2026-09-09.)
- **Aucun compteur, aucune injonction.** L'autosave est **silencieuse**. Le panneau peut
  afficher un horodatage discret (« dernière sauvegarde auto : il y a 2 min ») **à titre
  informatif** - jamais un « vous avez X notes non sauvegardées ».
- **Poste partagé** : le bandeau de chargement (D1) + le bouton « Effacer mes données de cet
  ordinateur » **mis en avant quand il y a des données** répondent au résidu. Rappel de fin
  de parcours : la ligne « pensez à sauvegarder » existante gagne « sur un ordinateur
  partagé, pensez aussi à effacer vos données en partant ».
- **La disquette n'est jamais supprimée ni dégradée.** Son rôle devient explicite :
  *changer d'ordinateur, garder une copie à part*. C'est le seul chemin multi-appareil.
- **LECONS « copie figée trop tôt » / états-machines copiés** : la restauration passe
  **toujours** par `restaurerEtatsModules()` (le pont existant), jamais une lecture directe
  d'un état de module. Tester chaque module après restauration (LECONS Règle 8 : re-test de
  chaque chemin réel).
- **`js/app.js` non couvert par les tests Node** : test navigateur obligatoire, clair +
  sombre, sur chaque étape.
- **Zéro régression fonctionnelle** : « Exporter / Importer / Tout effacer / Restaurer »
  gardent exactement leur comportement actuel ; on **ajoute** l'autosave et l'historique
  autour, on ne réécrit pas la machinerie existante.

---

## Étapes, petites et testées une à une

1. **Moteur d'écriture.** `planifierSauvegardeAuto()` (debounce 2 s + drapeau dirty) +
   `ecrireSauvegardeAuto()` (`aps_session_auto`, try/catch quota). Appels depuis
   `naviguerVers()` et un `setInterval` de filet. `pagehide` → écriture synchrone. **Pas
   encore de relecture au chargement.** Test : ouvrir la console, modifier, vérifier que la
   clé se remplit et se met à jour ; vérifier qu'un `pagehide` (changer d'onglet) écrit.
2. **Relecture au chargement + bandeau (D1).** Au `DOMContentLoaded`, **avant**
   `naviguerVers('cv')` : si `aps_session_auto` existe et `sessionAutoVautLaPeine(data)`,
   restaurer `dossier` / `historiquePages` / `pageActuelle` / `modulesEtat`, puis afficher
   le bandeau « travail retrouvé ». « Effacer et repartir » = le « Tout effacer » existant.
   Test navigateur : remplir un CV, fermer l'onglet, rouvrir → tout est là + bandeau ;
   cliquer « Effacer et repartir » → écran vierge.
3. **Historique léger (D3).** `aps_session_historique`, throttle 10 min, plafond 5,
   gestion quota. Pas encore d'interface. Test console.
4. **Panneau refondu** (voir maquette) : nouveau titre, nouveau texte, horodatage discret,
   section « Reprendre une version précédente » (liste des 5), zone « Effacer mes données
   de cet ordinateur » mise en avant quand il y a des données. `initBoutonSessionTransfert()`
   étendu, jamais réécrit. Test navigateur clair + sombre : chaque bouton fait ce qu'il dit.
5. **Rappel de fin de parcours** : une ligne ajoutée au message « pensez à sauvegarder »
   (poste partagé → penser à effacer), avec raccourci vers le panneau. Test : terminer un
   parcours, vérifier le message.
6. **Revue croisée** : les 6 modules isolés + Carnet + Repères, restauration complète,
   clair + sombre, sur un vrai parcours long. Puis `npm test` (garde-fou, même si le gros
   est en navigateur) et commit par étape.

---

## Ce que ce chantier ne fait pas

- Pas de serveur, pas de comptes, pas de synchro multi-appareil (→ `IDEES_A_RECLASSER.md`,
  décision stratégique liée à l'existence d'une association).
- Pas de chiffrement du `localStorage` (la donnée est déjà en clair aujourd'hui dans le
  fichier de session exporté ; le vrai garde-fou du poste partagé est l'effacement, pas le
  chiffrement).
- Ne touche pas à `etatAccordeonParType` / `etatAccordeonValideParType` (progression dans
  les accordéons) - déjà non persistés aujourd'hui, connu (`forcerProgressionAccordeonJusquaApercu()`),
  hors périmètre.
