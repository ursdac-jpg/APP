#!/usr/bin/env python3
"""
sirene_candidats.py - Dresse la liste des employeurs RÉELS d'un territoire à partir de la base publique Sirene
(API « Recherche d'entreprises », https://recherche-entreprises.api.gouv.fr/ ; documentation : /docs sur le même domaine).

ÉTAT : paramètres et champs confirmés le 03/11/2026 par Claude Code (une requête réelle ; la liste complète d'un département n'a pas encore été lancée).

Usage : python3 sirene_candidats.py 24 sortie_24.tsv     (puis 87)
Sortie : TSV « nom <TAB> commune <TAB> code postal <TAB> adresse <TAB> NAF <TAB> tranche d'effectif de l'entreprise <TAB> siret de l'établissement »
         que l'on compare ensuite au registre, puis qu'on passe à verif_employeur.py après avoir trouvé le site officiel.
Tranches d'effectif (codes Sirene) : 12 = 20-49, 21 = 50-99, 22 = 100-199, 31 = 200-249, 32 = 250-499, 41 = 500-999, 42 = 1000-1999...
Sections NAF utiles : A agriculture, B-E industrie/énergie/déchets, F construction, G commerce/auto, H transport, I hébergement-restauration,
  J information-communication, K finance-assurance, L immobilier, N services administratifs (sécurité, propreté), O administration,
  P enseignement, Q santé-action sociale, R arts-sport-loisirs, S autres services.
Politesse : une requête par seconde au plus, pas de rafale (l'API a des limites).
"""
import sys, json, time, subprocess
BASE = "https://recherche-entreprises.api.gouv.fr/search"
def get(params):
    q = "&".join("%s=%s" % (k, v) for k, v in params.items())
    r = subprocess.run(["curl", "-sS", "--max-time", "30", "-A", "Mozilla/5.0", BASE + "?" + q], capture_output=True, text=True, encoding="utf-8")
    return json.loads(r.stdout)
def main(dep, sortie):
    lignes = []
    for section in "ABCDEFGHIJKLNOPQRS":
        for tranche in ("12", "21", "22", "31", "32", "41", "42"):
            page = 1
            while True:
                d = get({"departement": dep, "section_activite_principale": section, "tranche_effectif_salarie": tranche,
                         "etat_administratif": "A", "per_page": 25, "page": page})
                for e in d.get("results", []):
                    # Vérifié le 03/11/2026 : « departement » et « tranche_effectif_salarie » portent sur l'entreprise ; les établissements du département
                    # sont dans « matching_etablissements » (le siège peut être ailleurs). On garde les établissements actifs dont le code postal commence par dep.
                    for s in e.get("matching_etablissements") or []:
                        if s.get("etat_administratif") != "A" or not str(s.get("code_postal", "")).startswith(dep):
                            continue
                        nom = s.get("nom_commercial") or e.get("nom_complet")
                        lignes.append("\t".join(str(x) for x in (nom, s.get("libelle_commune"), s.get("code_postal"),
                                      s.get("adresse"), s.get("activite_principale"), e.get("tranche_effectif_salarie"), s.get("siret"))))
                if page >= (d.get("total_pages") or 1): break
                page += 1; time.sleep(1)
            time.sleep(1)
    open(sortie, "w", encoding="utf-8").write("\n".join(sorted(set(lignes))))
    print(len(set(lignes)), "établissements ->", sortie)
if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
