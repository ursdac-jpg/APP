#!/usr/bin/env python3
"""
veille_rss.py - Veille institutionnelle : lit des flux RSS officiels, ne garde que les nouveautés depuis le dernier passage,
et les classe par thème (emploi, formation, chômage, santé-travail, famille, création d'entreprise, justice, handicap...).

Usage :  python3 veille_rss.py flux.tsv etat.json sortie.md
  flux.tsv : « nom <TAB> url du flux RSS » (une ligne par flux)
  etat.json : mémoire des liens déjà vus (créé au premier passage)
  sortie.md : nouveautés, à relire avant publication (rien n'est publié automatiquement)
Flux testés le 02/11/2026 (réponse 200, lisibles sans contourner de protection) :
  https://www.service-public.gouv.fr/abonnements/rss/actu-actu-pro.rss          (entreprendre.service-public.gouv.fr, ~230 actualités)
  https://www.service-public.gouv.fr/abonnements/rss/actu-actualites-particuliers.rss (10 dernières actualités particuliers)
  https://travail-emploi.gouv.fr/rss.xml                                        (ministère du Travail, 50 derniers contenus)
  https://www.justice.gouv.fr/rss.xml                                           (ministère de la Justice, 10 derniers contenus)
  https://www.agefiph.fr/rss.xml                                                (Agefiph, 10 derniers contenus)
Flux non lisibles (ne pas insister) : unedic.org/rss (404), caf.fr/rss (404), info.gouv.fr (Cloudflare), legifrance (403), ameli (403), vie-publique (redirection JavaScript).
"""
import sys, re, json, html, subprocess, os
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
THEMES = {
  "Emploi et contrats": r"embauche|contrat|cdd|cdi|licenci|rupture|période d.essai|salari|apprenti|stage|intérim|saisonn|télétravail|prud.hom",
  "Chômage et indemnisation": r"chômage|assurance chômage|are\b|france travail|csp|allocation|activité partielle|bonus-malus",
  "Formation et reconversion": r"cpf|formation|reconversion|apprentissage|opco|qualiopi|compétences|vae|alternance|passeport",
  "Santé au travail": r"arrêt de travail|inaptitude|médecin du travail|duerp|visite|accident du travail|santé au travail|handicap",
  "Famille et parentalité": r"congé|naissance|maternité|paternité|parentalité|assistant maternel|garde",
  "Création et indépendants": r"micro-entre|auto-entre|acre|indépendant|création d.entreprise|urssaf|cotisation",
  "Mobilité et carburant": r"carburant|grands rouleurs|transport|mobilité|indemnités kilométriques|permis",
  "Territoires": r"qpv|zfrr|zrr|quartier|territoire|revitalisation|rural",
  "Justice et accès aux droits": r"justice|victime|détention|spip|tribunal|aide juridictionnelle|condamnation",
  "Retraite": r"retraite|pension|plafond de la sécurité sociale|carrière longue|cumul emploi",
  "Aides et budget": r"surendettement|crédit|rsa|prime d.activité|aah|apl|chèque énergie|smic|plafond",
}
def lire(url):
    return subprocess.run(["curl", "-sSL", "--max-time", "40", "-A", UA, url], capture_output=True).stdout.decode("utf-8", "replace")
def items(xml):
    for it in re.findall(r"(?s)<item>(.*?)</item>", xml):
        g = lambda t: html.unescape(re.sub(r"<!\[CDATA\[|\]\]>", "", (re.search(r"(?s)<%s[^>]*>(.*?)</%s>" % (t, t), it) or [0, ""])[1])).strip()
        yield {"date": g("pubDate")[:16], "titre": g("title"), "lien": g("link").split("?")[0],
               "resume": re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", g("description")))[:300]}
def theme(x):
    s = (x["titre"] + " " + x["resume"]).lower()
    return [t for t, r in THEMES.items() if re.search(r, s)] or ["À classer"]
def main():
    flux = [l.rstrip("\n").split("\t") for l in open(sys.argv[1], encoding="utf-8") if l.strip() and not l.startswith("#")]
    etat = json.load(open(sys.argv[2])) if os.path.exists(sys.argv[2]) else {"vus": []}
    vus = set(etat["vus"]); nouveaux = []
    for nom, url in flux:
        for x in items(lire(url)):
            if x["lien"] and x["lien"] not in vus:
                x["source"] = nom; nouveaux.append(x); vus.add(x["lien"])
    json.dump({"vus": sorted(vus)}, open(sys.argv[2], "w"), ensure_ascii=False)
    par = {}
    for x in nouveaux:
        for t in theme(x): par.setdefault(t, []).append(x)
    with open(sys.argv[3], "w", encoding="utf-8") as f:
        f.write("# Veille - %d nouveautés\n\n" % len(nouveaux))
        for t, L in sorted(par.items()):
            f.write("## %s\n" % t)
            for x in L: f.write("- %s | %s | %s | %s\n" % (x["date"], x["titre"], x["source"], x["lien"]))
            f.write("\n")
    print(len(nouveaux), "nouveautés ->", sys.argv[3])
if __name__ == "__main__": main()
