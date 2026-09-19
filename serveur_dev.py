"""
Serveur de developpement local -- identique a `python -m http.server`, sauf
qu'il desactive la mise en cache navigateur (Cache-Control: no-cache) sur
chaque reponse.

Pourquoi : sans cet en-tete, un navigateur garde parfois une ancienne
version d'un fichier .js en cache pendant plusieurs sessions (le module
http.server standard n'envoie aucun Cache-Control) -- une correction de
code peut alors sembler "ne jamais s'appliquer" alors qu'elle est bien
enregistree sur le disque, simplement jamais rechargee par le navigateur.
"no-cache" (et non "no-store") force une revalidation a chaque requete
(GET conditionnel via Last-Modified) plutot que de desactiver le cache en
entier -- le fichier est quand meme reutilise si inchange (reponse 304),
seule sa fraicheur est verifiee a chaque fois.
"""

import http.server
import os
import socketserver
import sys


class GestionnaireSansCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()


if __name__ == '__main__':
    # Ordre de priorite : argument de ligne de commande, sinon variable
    # d'environnement PORT (posee par l'outil d'apercu en mode autoPort,
    # pour eviter un conflit quand plusieurs sessions tournent en parallele),
    # sinon 8123 par defaut.
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    elif os.environ.get('PORT'):
        port = int(os.environ['PORT'])
    else:
        port = 8123
    # ThreadingTCPServer (pas TCPServer simple, mono-thread) : la page
    # charge de nombreux <script src> en parallele au demarrage -- un
    # serveur mono-thread ne peut en traiter qu'un a la fois, causant des
    # "connection refused" sur le reste (backlog sature). `-m http.server`
    # utilise deja ThreadingHTTPServer par defaut depuis Python 3.7 -- ce
    # script doit se comporter pareil, jamais regresser en mono-thread.
    socketserver.ThreadingTCPServer.allow_reuse_address = True
    with socketserver.ThreadingTCPServer(('', port), GestionnaireSansCache) as httpd:
        print('Serveur (sans cache navigateur) sur le port ' + str(port))
        httpd.serve_forever()
