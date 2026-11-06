#!/usr/bin/env python3
"""
verif_employeur.py - Vérifie qu'un employeur existe sur un territoire et trouve SA page de recrutement.

Principe (identique à la vérification faite à la main) :
  1. ouvrir le site officiel ; exiger que la page cite le NOM de l'employeur ;
  2. exiger un CODE POSTAL du territoire (24xxx, 87xxx...) dans la page d'accueil ou la page contact/mentions ;
  3. recopier adresse et numéros tels qu'affichés (jamais deviner) ; si plusieurs numéros : les lister sans choisir ;
  4. chercher, sur le domaine de l'employeur (ou un sous-domaine / le domaine de son groupe), les liens
     « recrutement, carrières, nous rejoindre, emploi, candidature spontanée » ;
  5. refuser tout lien qui mène à un site d'offres / agrégateur (liste ANNUAIRES_ET_OFFRES) ;
  6. produire un verdict : PRE-ENREGISTRE / A COMPLETER / REJETE, avec la phrase de preuve.

Usage :
  python3 verif_employeur.py entreprises.tsv resultats.json
  (entreprises.tsv : une ligne par employeur, colonnes séparées par une tabulation :
     nom <TAB> url du site officiel <TAB> préfixes de codes postaux (ex. 24,87) <TAB> [pages de contact à tenter, séparées par des virgules])
Dépendances : Python 3.8+, curl (aucune bibliothèque externe).
Respect : ne contourne jamais un contrôle anti-robot (Cloudflare, Imperva...) : le code HTTP 403/429/503 ou la page
« Just a moment » donne le verdict « BLOQUE » et la ligne doit être lue à la main dans un navigateur.
"""
import sys, re, html, json, subprocess, unicodedata
from urllib.parse import urljoin, urlparse
from concurrent.futures import ThreadPoolExecutor

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"

# Domaines à ne JAMAIS retenir comme « page de recrutement de l'employeur » (sites d'offres, agrégateurs, annuaires).
ANNUAIRES_ET_OFFRES = {
    "indeed.com", "indeed.fr", "francetravail.fr", "pole-emploi.fr", "candidat.francetravail.fr", "linkedin.com",
    "hellowork.com", "regionsjob.com", "meteojob.com", "jobijoba.com", "jooble.org", "jobteaser.com", "monster.fr",
    "apec.fr", "welcometothejungle.com", "randstad.fr", "adecco.fr", "manpower.fr", "agefiph.fr", "wizbii.com",
    "glassdoor.fr", "cadremploi.fr", "talent.com", "neuvoo.fr", "pagesjaunes.fr", "societe.com", "pappers.fr",
    "verif.com", "infogreffe.fr", "facebook.com", "labonnealternance.apprentissage.beta.gouv.fr", "emploi-collectivites.fr",
}
# Plateformes de candidature « marque employeur » : acceptées SEULEMENT si le lien part du site de l'employeur
# (le résultat porte alors la mention PLATEFORME_TIERCE pour que l'humain décide).
PLATEFORMES_ATS = ("nous-recrutons.fr", "nos-recrutements.fr", "talent-soft.com", "taleo.net", "oraclecloud.com",
                   "smartrecruiters.com", "workday.com", "teamtailor.com", "welcomekit.co", "recruitee.com", "lever.co")

RE_PHONE = re.compile(r"(?<!\d)(?:\+33\s?\(?0?\)?\s?|0)[1-9](?:[\s.\-]?\d{2}){4}(?!\d)")
RE_RECRUT = re.compile(r"recrut|emploi|carri[eè]re|rejoign|nous-rejoindre|jobs|candidat|join|spontan|work-with-us|careers", re.I)  # « offres » seul est volontairement exclu (offres commerciales)
RE_CONTACT = re.compile(r"contact|mentions|legal|acc[eè]s|plan|qui-sommes|a-propos|about|implant|agence|nous-trouver", re.I)
RE_BLOCAGE = re.compile(r"just a moment|attention required|incapsula|access denied|captcha|verify you are human|request unsuccessful", re.I)

def norm(s):
    s = unicodedata.normalize("NFKD", s.lower())
    return re.sub(r"[^a-z0-9 ]", " ", "".join(c for c in s if not unicodedata.combining(c)))

def fetch(url, timeout=20):
    """Retourne (code_http, url_finale, html). code '000' = site injoignable (DNS, TLS, délai) : NE PROUVE PAS qu'il n'existe pas."""
    r = subprocess.run(["curl", "-sSL", "--max-time", str(timeout), "-A", UA, "-w", "\n@@%{http_code}@@%{url_effective}", url],
                       capture_output=True, text=True, errors="replace")
    m = re.search(r"\n@@(\d+)@@(.*)$", r.stdout, re.S)
    if not m:
        return "000", url, ""
    return m.group(1), m.group(2).strip(), r.stdout[:m.start()]

def texte(h):
    h = re.sub(r"(?is)<(script|style|noscript)[^>]*>.*?</\1>", " ", h)
    return html.unescape(re.sub(r"\s+", " ", re.sub(r"(?s)<[^>]+>", " ", h)))

def domaine(u):
    return urlparse(u).netloc.lower().replace("www.", "")

def meme_famille(d_lien, d_site):
    """Même domaine, sous-domaine, ou même nom de domaine racine."""
    return d_lien == d_site or d_lien.endswith("." + d_site) or d_site.endswith("." + d_lien) \
        or d_lien.split(".")[-2:] == d_site.split(".")[-2:]

def est_annuaire(d):
    return any(d == a or d.endswith("." + a) for a in ANNUAIRES_ET_OFFRES)

def verifier(nom, url, prefixes=("24", "87"), contacts_extra=()):
    res = {"nom": nom, "site": url, "verdict": "REJETE", "raison": "", "adresse": [], "codes_postaux": [], "telephones": [],
           "recrutement": [], "preuve_nom": "", "bloque": False}
    code, final, h = fetch(url)
    res["code_http"], res["url_finale"] = code, final
    if code == "000":
        res["raison"] = "site injoignable depuis ce poste (ne prouve pas qu'il n'existe pas) : à ouvrir dans un navigateur"
        res["verdict"] = "A COMPLETER"; return res
    if code in ("403", "429", "503") or RE_BLOCAGE.search(h[:3000] or ""):
        res["bloque"] = True; res["verdict"] = "BLOQUE"
        res["raison"] = "contrôle anti-robot ou refus (HTTP %s) : à lire à la main, ne pas contourner" % code; return res
    if code != "200":
        res["raison"] = "HTTP " + code; return res
    d_site = domaine(final)
    pages = [(final, h)]
    liens = re.findall(r'(?is)<a[^>]+href=["\']([^"\'#]+)["\'][^>]*>(.*?)</a>', h)
    cand = list(contacts_extra)
    for href, lab in liens:
        full = urljoin(final, href)
        if full.startswith(("mailto", "tel", "javascript")): continue
        if RE_CONTACT.search(href + " " + texte(lab)[:60]) and meme_famille(domaine(full), d_site):
            cand.append(full)
    for f in list(dict.fromkeys(cand))[:4]:
        c, e, hh = fetch(f)
        if c == "200": pages.append((e, hh))
    T = " || ".join(texte(p[1]) for p in pages)
    # 1) le nom doit apparaître (premier mot significatif)
    mots = [w for w in norm(nom).split() if len(w) > 2 and w not in ("les", "des", "ets", "sas", "sarl", "groupe", "societe")]
    cle = mots[0] if mots else norm(nom).strip()
    m = re.search(re.escape(cle), norm(T))
    if not m:
        res["raison"] = "le nom de l'employeur n'apparaît pas sur le site (homonyme probable)"; return res
    res["preuve_nom"] = (res.get("title") or "")  # complété ci-dessous
    t = re.search(r"(?is)<title[^>]*>(.*?)</title>", h)
    res["preuve_nom"] = html.unescape(t.group(1)).strip()[:120] if t else ""
    # 2) code postal du territoire
    cp_re = re.compile(r"\b((?:%s)\d{3})\b\s+([A-ZÉÈÀ][A-Za-zÀ-ÿ'’\-]{2,25}(?:[ \-][A-Za-zÀ-ÿ'’\-]{2,20})?)" % "|".join(prefixes))
    res["codes_postaux"] = list(dict.fromkeys(m.group(0).strip() for m in cp_re.finditer(T)))[:5]
    addr_re = re.compile(r"((?:\d{1,4}\s?(?:bis|ter)?[,\s]+)?[A-Za-zÀ-ÿ'’\-\. ]{0,40}?\b(?:rue|avenue|av\.|route|chemin|zone|za|zi|place|boulevard|impasse|all[ée]e|quai|lieu-dit|domaine|parc)\b[^|\n]{0,70}?\b(?:%s)\d{3}\s+[A-ZÉÈÀ][A-Za-zÀ-ÿ'’\- ]{2,30})" % "|".join(prefixes), re.I)
    res["adresse"] = list(dict.fromkeys(m.group(1).strip()[:120] for m in addr_re.finditer(T)))[:4]
    if not res["codes_postaux"]:
        res["raison"] = "aucun code postal du territoire sur l'accueil ni sur les pages contact/mentions lues"; res["verdict"] = "REJETE"; return res
    # 3) téléphones : copiés tels quels, jamais attribués par déduction
    res["telephones"] = list(dict.fromkeys(re.sub(r"\s+", " ", m.group(0).strip()) for m in RE_PHONE.finditer(T)))[:6]
    res["telephone_note"] = ("un seul numéro lu" if len(res["telephones"]) == 1 else
                             "plusieurs numéros lus : à attribuer à la main" if res["telephones"] else "pas de numéro vu")
    # 4) page de recrutement
    vus = set()
    for href, lab in liens:
        full = urljoin(final, href); l = texte(lab)[:70]
        if full.startswith(("mailto", "tel", "javascript")) or full in vus: continue
        if not RE_RECRUT.search(href + " " + l): continue
        vus.add(full); d = domaine(full)
        if est_annuaire(d):
            continue                                  # jamais une page d'offres ou un agrégateur
        statut = "PROPRE" if meme_famille(d, d_site) else ("PLATEFORME_TIERCE" if any(d.endswith(p) for p in PLATEFORMES_ATS) else "EXTERNE_A_VOIR")
        res["recrutement"].append({"libelle": l, "url": full, "statut": statut})
    # on ouvre la meilleure page pour relever la mention de candidature spontanée
    for r in res["recrutement"][:3]:
        if r["statut"] in ("PROPRE", "PLATEFORME_TIERCE"):
            c, e, hh = fetch(r["url"])
            if c == "200":
                tt = texte(hh)
                sp = re.search(r"candidature spontan[ée]e", tt, re.I)
                r["candidature_spontanee"] = bool(sp)
                if sp: r["extrait"] = tt[max(0, sp.start() - 120): sp.end() + 160]
                r["ouverte"] = True
    propres = [r for r in res["recrutement"] if r["statut"] == "PROPRE"]
    res["verdict"] = "PRE-ENREGISTRE" if propres else "A COMPLETER"
    res["raison"] = "site + code postal du territoire + page de recrutement propre" if propres else \
                    "employeur réel (nom + code postal lus) mais aucune page de recrutement propre trouvée"
    return res

def main():
    if len(sys.argv) < 3:
        print(__doc__); sys.exit(1)
    items = []
    for ligne in open(sys.argv[1], encoding="utf-8"):
        if not ligne.strip() or ligne.startswith("#"): continue
        p = ligne.rstrip("\n").split("\t")
        items.append((p[0], p[1], tuple(p[2].split(",")) if len(p) > 2 and p[2] else ("24", "87"), tuple(p[3].split(",")) if len(p) > 3 and p[3] else ()))
    with ThreadPoolExecutor(6) as ex:
        out = list(ex.map(lambda a: verifier(*a), items))
    json.dump(out, open(sys.argv[2], "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    for r in out:
        print("%-16s %s | %s" % (r["verdict"], r["nom"], r["raison"]))

if __name__ == "__main__":
    main()
