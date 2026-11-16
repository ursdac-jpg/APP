# Rapport de test : carte « Mes documents » (FINAL, 11/11/2026)

Protocole : `docs/PROTOCOLE_TEST_PARCOURS_MES_DOCUMENTS_2026-11-11.md`. Outil : `scripts/parcours/protocole/`. Réponses de l'assistant simulées. Essais à 1280 px et 375 px (mêmes constats aux deux largeurs, aucun débordement horizontal). Les parcours ont été rejoués après les corrections : chaînes de « Retour » correctes, `npm test` entièrement vert (2700 essais). Mode sombre : aucune feuille de style modifiée, non rejoué.

## Parcours joués de bout en bout

| Parcours | Résultat |
|---|---|
| Créer, voie 1 (assistant) | Traversée complète, Retour en chaîne correct, reprise après Accueil correcte |
| Créer, voie 2 (récit) | Traversée complète jusqu'à « Vos documents » avec réponses simulées ; Retour en chaîne défectueux (D1, corrigé) ; reprise après Accueil correcte |
| Créer, voie 3 (à la main) | Traversée complète, Retour en chaîne correct (5 pas), barre d'étapes correcte, reprise correcte |
| Reprendre, voie 1 (garder et compléter) | Traversée complète jusqu'à « Vos documents », Retour en chaîne correct (5 pas) |
| Reprendre, voie 2 (reformuler) | Traversée jusqu'au choix de version ; le garde-fou « compétence absente du CV » se déclenche bien ; Retour défectueux (D3, corrigé) |
| Reprendre, voie 3 (refaire moi-même) | Traversée complète, Retour correct (3 pas) |
| Version rapide, parcours 1 (lettre) et 2 (fiche d'entretien) | Traversée complète avec réponses simulées, Retour en chaîne correct (5 pas) |

## Dysfonctionnements : état après la séance

| N° | Constat | État |
|---|---|---|
| D1 | Créer, voie 2 : « Retour » traversait des étapes fusionnées invisibles | **Corrigé** (`decouverteParcours.js`) : depuis « Choisissez votre assistant » on revient à « Préparer », depuis « Vos informations » aux compétences. Vérifié : 12 appuis jusqu'à la page commune, tous sur un écran visible différent |
| D2 | Reprendre voies 1 et 2 et version rapide : « Votre objectif » redemandé après l'assistant | **Constat à nuancer (précisé le 11/11 après remarque de Denis).** L'écran n'apparaît QUE si la question « Comment présentez-vous votre candidature ? » (entreprise précise ou non) est restée sans réponse sur la page de préparation : le bouton « Continuer » y est actif sans elle, mais le parcours en a besoin et renvoie alors vers « Votre objectif ». Si on y répond, on passe directement à « Vos informations » (vérifié, `REPONDRE_ENTREPRISE=1`). Mon scénario ne répondait pas à cette question, d'où un défaut surestimé. Ce qui a été fait : l'écran de secours ne reprend plus les six cartes ni le choix du métier. **Corrigé le 11/11 (décision de Denis) : « Continuer » reste grisé tant que cette question n'a pas de réponse** (mise à jour du CV et version rapide ; vérifié, plus de détour). |
| D3 | Reprendre, voie 2 : le Retour de l'ancienne introduction sautait la page commune | **Corrigé** (`routeRetour: 'reprendre-cv'` dans `data/metiers.js`). Vérifié : 2 appuis jusqu'à « Reprendre mon CV » |
| D4 | Raison du bouton grisé inexacte | **Corrigé** (`_prepLERaisonBlocage`, mêmes conditions que l'activation). Vérifié : « Il reste à choisir votre situation… », puis « …indiquer le métier visé (ou plusieurs métiers)… », puis bouton actif |
| D5 | « Vos documents » validé : 150 boutons sans nom accessible ; bouton de gauche renommé « Modifier le CV » | **Renommage corrigé** (décision de Denis : le bouton de gauche s'appelle toujours « Retour », lettre et fiche d'entretien comprises). Les 150 boutons sans nom (réglages de mise en page, pastilles de couleur) restent au chantier accessibilité |
| D6 | Réponse complète collée après une réponse coupée : échec | **Corrigé** (`modules/collage-reponse/fenetre.js`) : si l'assistant a recommencé au début et que le texte est complet à lui seul, il est utilisé tel quel. Vérifié (voie 2, `TRONQUE=1` : « coupé » puis « reçu ») |
| D7 | Créer voie 1 : « Le complément de votre CV » sans barre d'étapes | **Corrigé** (`pageComplementCV` appelle `barreHautVosDocuments`). Vérifié |

## Essais ajoutés en fin de séance

- Reprise profonde de Reprendre voie 1 : « Accueil » ramène à l'accueil ; la page commune propose « Continuer » (ramène à « Vos informations ») et « Recommencer ». Correct.
- Barre d'étapes de Créer voie 3 (`PASTILLES=1`) : les pastilles « Vos informations », « Votre parcours », « Votre profil » mènent chacune à leur écran. Correct.
- Réponse coupée sur la voie 2 : signalée « coupée », puis la réponse complète est acceptée. Correct.

## Faux constat écarté

« Vos informations » (voie 2 de Créer) : le « Continuer » sans identité n'est pas inerte, il affiche le rappel « Une dernière chose avant de continuer » (volontaire). Le doublon « Préparer < Préparer » dans la chaîne de Retour de la voie 2 est aussi voulu : le premier Retour défait le choix de l'objectif (sous-état de l'étape).

## Reste à décider avec Denis

- **D2 suite** : décidé par Denis le 11/11 : on garde le basculement (« Continuer sans entreprise » = candidature générale) et le texte de l'encart l'explique, selon le cas (offre ou entreprise précise). FAIT.
