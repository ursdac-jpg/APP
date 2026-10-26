/* ============================================================
   Les nouveautés de l'application, affichées par la page « Nouveautés » (bouton en haut à gauche). UNE LIGNE PAR AJOUT visible par les personnes.
   Règles : date en AAAA-MM-JJ (elle s'affiche en français), titre court, une ou deux phrases simples, jamais de jargon ni de correctif.
   Jamais une fonction encore fermée au public (par exemple « Mon territoire »). `route` : où mène le bouton « Essayer » ; `module` : son libellé ; `icone` : l'icône du module (celle de sa carte, classe bootstrap-icons).
   Le plus récent d'abord n'est pas obligatoire : la page trie par date. L'étiquette « Nouveau » dure 30 jours (modules/nouveautes/logique.js).
   ============================================================ */
var NOUVEAUTES = [
  { date: '2026-10-26', titre: 'Reprendre mon CV : un seul dépôt, trois voies', texte: 'Déposez votre CV une fois, puis choisissez : le garder et le compléter, le reformuler, ou le refaire vous-même dans un modèle, sans assistant et sans rien reformuler.', route: 'reprendre-cv', icone: 'bi-pencil-square', module: 'Reprendre mon CV' },
  { date: '2026-10-26', titre: 'Fiche et entraînement à l’entretien', texte: 'Une fiche rapide (idées pour vous présenter, questions probables, cas pratique) et un entraînement où l’assistant joue le recruteur, relance et fait un bilan.', route: 'prepa-entretien', icone: 'bi-mic', module: 'M’entraîner à un entretien' },
  { date: '2026-10-25', titre: 'Voir nos modèles avant de remplir son CV', texte: 'Parcourez les modèles sur un CV d’exemple et gardez-en jusqu’à cinq. Ils s’affichent ensuite avec votre propre texte.', route: 'creer-cv', icone: 'bi-stars', module: 'Créer un nouveau CV' },
  { date: '2026-10-25', titre: 'Créer un nouveau CV de trois façons', texte: 'À la main sans assistant, avec l’assistant, ou à partir de votre récit.', route: 'creer-cv', icone: 'bi-stars', module: 'Créer un nouveau CV' },
  { date: '2026-10-24', titre: 'Écrire sa lettre avec l’assistant, en plus complet', texte: 'Mêmes choix pour une offre, une candidature spontanée ou un changement de métier. Lettres de recommandation, export PDF et Word.', route: 'co-lettre', icone: 'bi-pen', module: 'Écrire ma lettre avec l’assistant' },
  { date: '2026-10-20', titre: 'Beaucoup plus de modèles et d’options de CV', texte: 'Formes de bandeau et de colonne, décors, couleurs, titres de rubriques au choix, et un bouton « Style rapide ».', route: 'creer-cv', icone: 'bi-stars', module: 'Créer un nouveau CV' },
  { date: '2026-10-20', titre: 'Chiffres à jour dans le Lexique', texte: 'Montants, durées et dates sont affichés avec leur source et leur date de vérification, et revérifiés tous les six mois.', route: 'lexique', icone: 'bi-book', module: 'Lexique' }
];
