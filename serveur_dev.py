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
import re
import socketserver
import sys
import urllib.parse


# Outil de DEVELOPPEMENT uniquement (jamais utilise par l'application) : le banc de rendu des CV
# (scripts/rendu/) envoie ici ses resultats (empreintes, miniatures) pour qu'ils soient ecrits sur le
# disque. Limites : seulement le dossier scripts/rendu/sortie/, seulement depuis cette machine, noms de
# fichiers controles, taille plafonnee.
DOSSIER_SORTIE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'scripts', 'rendu', 'sortie')
TAILLE_MAX = 3 * 1024 * 1024
MOTIF_NOM = re.compile(r'^[A-Za-z0-9][A-Za-z0-9._-]{0,80}$')


class GestionnaireSansCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

    def _repondre(self, code, texte):
        corps = texte.encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'text/plain; charset=utf-8')
        self.send_header('Content-Length', str(len(corps)))
        self.end_headers()
        self.wfile.write(corps)

    def do_POST(self):
        prefixe = '/__ecrire/'
        if self.client_address[0] not in ('127.0.0.1', '::1'):
            self._repondre(403, 'refuse : machine locale seulement')
            return
        if not self.path.startswith(prefixe):
            self._repondre(404, 'inconnu')
            return
        nom = urllib.parse.unquote(self.path[len(prefixe):])
        if not MOTIF_NOM.match(nom) or '..' in nom:
            self._repondre(400, 'nom de fichier refuse')
            return
        try:
            taille = int(self.headers.get('Content-Length', '0'))
        except ValueError:
            taille = 0
        if taille <= 0 or taille > TAILLE_MAX:
            self._repondre(413, 'taille refusee')
            return
        donnees = self.rfile.read(taille)
        os.makedirs(DOSSIER_SORTIE, exist_ok=True)
        with open(os.path.join(DOSSIER_SORTIE, nom), 'wb') as f:
            f.write(donnees)
        self._repondre(200, 'ok ' + str(len(donnees)))


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
