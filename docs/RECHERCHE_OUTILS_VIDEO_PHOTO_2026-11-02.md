# Recherche : outils pour une petite vidéo ou un enchaînement de photos de l'application (02/11/2026)

> Demande de Denis (29/10/2026) : présenter à l'accueil, pour tout le monde, une courte vidéo ou une suite de photos de l'application, avec les avantages, limites et coûts des outils, après une recherche à jour. Faite le 02/11/2026 sur le web (recherches et pages officielles quand elles répondaient). Les prix bougent vite : à revérifier sur la page officielle le jour de l'achat.

## Ce qui est établi, et ce qui ne l'est pas

| Outil | Gratuit ? | Ce que la recherche a confirmé | Limites relevées |
|---|---|---|---|
| **Outil Capture de Windows 11** (déjà installé) | Oui | Enregistre l'écran en MP4, raccourci Windows + Maj + R. Micro et son du système : depuis la version 24H2 de Windows (le poste de Denis a une version plus récente). | Pas de pause pendant l'enregistrement ; aucun montage. |
| **Clipchamp** (Microsoft) | Oui | Page officielle : export jusqu'à 1080p, « no watermarks », enregistreur d'écran, de caméra et de voix inclus dans la version gratuite. | Les éléments « premium » (banques d'images, de sons) demandent Microsoft 365. Les sous-titres automatiques : **non vérifiés** dans cette recherche. Sauvegarde en ligne des projets non incluse (une seule source). |
| **OBS Studio** | Oui, libre | Site officiel : gratuit et libre, version 33.0.1, Windows 10 et 11. | Il enregistre mais ne monte pas ; plus d'options donc plus à apprendre. |
| **Shotcut, Kdenlive, DaVinci Resolve** | Oui | Montage gratuit sans filigrane ; Shotcut le plus simple, Kdenlive plus puissant, Resolve le plus complet et le plus difficile. | Sources surtout des blogs. À ne prendre que si Clipchamp ne suffit pas. |
| **Canva** | Éditeur gratuit | Montage en 1080p sans filigrane (sources tierces). | Sous-titres automatiques réservés à l'offre Pro selon plusieurs sources ; limites et prix contradictoires ; **page officielle inaccessible** (erreur 403), donc non vérifié. |
| **CapCut** | Version gratuite | 1080p. | Éléments « Pro » qui ajoutent un filigrane ; licence gratuite limitée aux réseaux personnels ; fonctions passées en payant en 2026 ; stockage en ligne de départ à 0 Go. Écarté. |
| **ScreenPal, Loom** | Version gratuite limitée | ScreenPal : 15 minutes, 10 vidéos hébergées, 720p, sans son du système. Loom : 5 minutes, 25 vidéos, 720p. | Vidéo hébergée chez eux, donc hors de l'application. Écartés. |

Non étudié : les générateurs de vidéo avec présentateur virtuel (écartés d'office : le mot « IA » ne doit pas apparaître dans l'application, et la personne doit reconnaître la vraie application).

## Où mettre la vidéo (le point qui compte le plus)

1. **Le fichier dans l'application** (balise vidéo native du navigateur, sous-titres en fichier à côté). Aucun tiers, aucun cookie, aucune donnée envoyée. Limite : le poids du fichier dans le dépôt et sur le serveur du partenaire (estimation de Claude : quelques dizaines de Mo pour 2 à 3 minutes en 1080p, à mesurer).
2. **YouTube** : le mode « sans cookie » ne suffit pas selon plusieurs sources (un cookie est posé dès la lecture, l'adresse IP part chez Google). Il faudrait un double clic de consentement. La recommandation officielle de la CNIL n'a pas été retrouvée. Écarté : contraire à la ligne de l'application sur la vie privée.
3. **PeerTube** (Framasoft, libre et gratuit) : cohérent avec les valeurs, mais il faut une instance (un serveur à tenir, ou dépendre d'une instance publique). Intégration et cookies **non vérifiés**. À garder en réserve.

## Accessibilité

- Une vidéo pour ce public doit avoir des **sous-titres** (salle bruyante, malentendants) : générés automatiquement puis **relus** (les noms propres et les termes techniques sont souvent faux).
- Les **notes de l'orateur du diaporama** servent de transcription de départ.
- L'obligation légale (RGAA, directive européenne sur l'accessibilité) n'a pas été étudiée.

## Une vidéo vieillit, le diaporama non

La vidéo montre l'application à un instant donné : dès qu'un écran change, elle ne correspond plus. Le diaporama de l'Introduction, lui, lit ses données à la source et reste à jour. Prévoir de refaire la vidéo à chaque changement visible d'un écran montré, ou de ne montrer que des écrans stables.

## Sources

- Clipchamp, page officielle : https://clipchamp.com/en/pricing/
- OBS Studio, page officielle : https://obsproject.com/
- PeerTube, page officielle : https://joinpeertube.org/
- Clipchamp (avis 2026) : https://costbench.com/software/video-editing/clipchamp/ et https://fluxnote.io/guides/clipchamp-free-plan-limitations
- Canva (avis 2026) : https://fluxnote.io/guides/canva-video-editor-review
- CapCut (avis 2026) : https://costbench.com/software/video-editing/capcut/free-plan/ et https://socialrails.com/blog/capcut-pricing-guide
- ScreenPal et Loom : https://vyds.io/blog/loom-vs-screenpal
- Outil Capture de Windows 11 : https://www.it-connect.fr/windows-11-enregistrer-ecran-pc-format-video-outil-capture/
- YouTube et cookies : https://consently.net/blog/is-youtube-embed-gdpr-compliant et https://cloudfour.com/thinks/youtube-no-cookies-adds-cookies/
- Sous-titres automatiques : https://www.happyscribe.com/fr/blog/verifiez-votre-video-accessibilite
- Montage libre : https://www.finchley.co.uk/finchley-learning/shotcut-video-editing-software-vs-davinci-resolve-which-free-editor-is-better
