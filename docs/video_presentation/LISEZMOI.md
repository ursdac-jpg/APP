# Fabrication de la vidéo de présentation (02/11/2026)

Ces scripts refont la vidéo de présentation de l'application, sans rien enregistrer à la main : l'écran est joué par un navigateur de test, la voix est une voix d'homme de synthèse (Piper, modèle `fr_FR-tom-medium`), les sous-titres viennent du scénario. À relancer quand un écran montré change.

Scénario et texte de la voix : `docs/SCENARIO_VIDEO_PRESENTATION_2026-11-02.md` (section « Texte à lire et sous-titres »).

## Ce qu'il faut sur le poste (installé le 02/11/2026)

- **ffmpeg** : `winget install --id Gyan.FFmpeg.Essentials -e`. Le chemin complet de `ffmpeg.exe` et de `ffprobe.exe` se met dans `ffmpeg_path.txt` (dossier de travail).
- **Piper** : `python -m venv C:\Users\<nom>\piper_venv` puis `pip install piper-tts` (chemin court obligatoire sous Windows). Voix : `fr_FR-tom-medium.onnx` et son `.json`, depuis `https://huggingface.co/rhasspy/piper-voices/tree/main/fr/fr_FR/tom/medium` (environ 64 Mo), à placer dans `<dossier de travail>/voix/`.
- **Playwright** : déjà installé pour les captures de l'Introduction.
- **Captures des outils privés du diaporama** (veille, sas, prospection) : `node docs/video_presentation/captures_outils.js`. Elle démarre les deux outils sans ouvrir le navigateur de Denis, avec sept entreprises inventées et des dossiers temporaires (jamais le carnet réel), puis efface tout.
- Le serveur de développement tourne sur `http://localhost:8123` (outil de preview).

## Les étapes

Définir `VIDEO_TRAVAIL` (un dossier de travail hors du dépôt, avec `voix/`, `voix/blocs/`, `video/`).

1. `node parse_blocs.js <scenario.md> <VIDEO_TRAVAIL>/blocs.json` : lit les 36 blocs de sous-titres du scénario.
2. `piper_venv\Scripts\python.exe voix_blocs.py <VIDEO_TRAVAIL>` : une voix par bloc (`voix/blocs/pX_NN.wav`).
3. `node mesure.js <VIDEO_TRAVAIL> <chemin ffprobe>` : mesure la durée de chaque bloc.
4. `node enregistrer.js` : joue le parcours (Camille, 1280 sur 720), cale chaque bloc de voix sur l'écran, marque les parties accélérées (saisie des informations), écrit `video/timeline.json`.
5. `node assembler.js` : image (parties accélérées comprises) + voix + sous-titres. Sorties : `presentation.mp4` et `presentation.vtt` (propres, pour l'application) et `presentation_brouillon.mp4` (sous-titres incrustés, pour relire).

## Points à connaître

- La voix est prononcée avec quelques corrections (APP lu « A P P », CV lu « cé vé », PDF, Word) dans `voix_blocs.py`.
- Le pointeur et le rond au clic sont dessinés dans la page (l'enregistrement de Playwright ne montre pas la souris).
- Les clics se font à la vraie souris : un élément caché par la barre du bas est amené au milieu de l'écran avant le clic.
- Version 2 du 02/11/2026 : trois documents d'abord (CV, lettre, entretien), navigation accélérée avec la mention « Accéléré », captures réelles de `images/introduction/` pour la lettre et l'entretien (écrans longs à atteindre). Durée : environ 3 min 17.
- Les écrans fragiles sont ceux de la fiche de tournage du scénario (plans 3, 4, 5, 6).
- Filmer pour de bon seulement après l'ouverture de « Qui fait quoi » et « Employeurs près de chez moi » (voir le scénario).
