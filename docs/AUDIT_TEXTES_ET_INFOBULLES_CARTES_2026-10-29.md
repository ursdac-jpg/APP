# Audit des textes et infobulles des cartes de l'accueil (29/10/2026)

Demande de Denis : le texte descriptif de chaque module dit-il ce que le module fait vraiment ? L'infobulle « i » de chaque carte est-elle à jour et annonce-t-elle bien le contenu ?

Méthode : lecture des textes (`data/metiers.js` : `MES_DOCUMENTS_PARCOURS`, `INFOS_CARTE_ACCUEIL`, tuiles de `ouvrirCarteAccueil`, cartes de `pageChoixCV` dans `js/app.js`), puis lecture à l'écran des pages de présentation de 22 modules (navigateur de test, 29/10/2026) et vérification d'un comportement réel (lettre sans CV).

## Ce qui est exact (rien à changer)

- Mes documents : les 3 parcours (Créer, Reprendre en 3 voies, Lettre et entretien rapides avec deux lettres et une fiche d'entretien) correspondent aux pages de présentation.
- Analyser ma candidature, Un regard sur mon CV, Les mots de votre CV (ATS), Cohérence de mon dossier, Comparer mes pistes, Comprendre les chiffres, Comprendre le cadre, Mes Repères, Mon Carnet, Lexique, Découvrir mes compétences, À partir de mon récit : texte de carte, infobulle et page de présentation disent la même chose.

## Défauts constatés

| N° | Constat | Gravité | Correction prévue |
|---|---|---|---|
| T1 | Infobulle « Me préparer à candidater » : « Aucun CV n'est demandé pour commencer. » Faux : la lettre demande de déposer le CV avant de continuer (bouton « Continuer » grisé tant que le CV n'est pas déposé, vérifié à l'écran) et l'entretien part du CV et du poste visé. | Haute (promesse trompeuse pour un public fragile) | Réécrire l'introduction : les deux outils partent de votre CV, sous la forme que vous avez. |
| T2 | Infobulle « Boîte à outils » : ne cite pas « Découvrir mes compétences ». | RIEN À FAIRE : vérifié, `htmlBulleInfoCarte` l'ajoute déjà quand `MESCOMP_OUVERT` est vrai (ma première lecture était tronquée). | Aucune. |
| T3 | Infobulle « Vous hésitez encore ? » : ne cite pas « Un CV, plusieurs métiers », module ouvert (`UCPM_OUVERT = true`). | Moyenne | Ajouter la ligne, conditionnée par le même drapeau. |
| T4 | Infobulles « Me préparer à candidater » et « Se tenir informé » : ne citeraient pas « Employeurs près de chez moi » ni « Qui fait quoi » quand `MT_OUVERT` passe à vrai. | RIEN À FAIRE : vérifié, déjà ajoutées par `htmlBulleInfoCarte` quand `mtOuvert()` est vrai (ligne « Employeurs » vue à l'écran en aperçu). | Aucune. |
| T5 | Panneau Outils d'analyse : l'introduction dit « Ces outils demandent un CV déjà prêt ». Cohérence demande en plus une lettre ou un entretien préparé. | Faible | À préciser si besoin, voir la page de Cohérence. |
| D15 | Lexique : 14 thèmes de parcours partagent la même icône (🧭). Règle de l'icône d'identité propre à chaque entrée (`LECONS` 9.9). | Moyenne, choix de Denis | Question à Denis : une icône objet distincte par thème, ou garder la boussole comme marque « parcours guidé » ? |

## Pas encore vérifié à l'écran (honnêteté)

- Contenu détaillé des 3 voies de « Reprendre mon CV » au-delà de l'introduction, et des étapes internes de chaque module : seules les pages de présentation ont été relues.
- Pages de « Qui fait quoi » et « Employeurs » : module fermé au public (`MT_OUVERT = false`).

## Suivi

- [x] T1 corrigé le 29/10/2026 (`data/metiers.js`, introduction de « Me préparer à candidater » : « Les deux outils partent de votre CV, tel que vous l'avez : un fichier, une photo ou un texte collé »), vérifié à l'écran.
- [x] T3 corrigé le 29/10/2026 (ligne « Un CV, plusieurs métiers » ajoutée à la bulle de « Vous hésitez encore ? », conditionnée par `UCPM_OUVERT`), vérifié à l'écran.
- [x] T5 : fait le 29/10/2026 (intro précisée : Cohérence demande aussi une lettre de motivation).
- [x] D15 : fait le 29/10/2026 (une icône d objet par thème, décision de Denis).
