# Relevé des chiffres économiques de l'Union européenne sur Eurostat (API publique, sans clé).
# Écrit modules/comprendre-les-chiffres/contenu/europe-economie-eurostat.md : une fiche par pays, jamais une valeur écrite à la main.
# À relancer à chaque contrôle (tous les six mois) : python -I scripts/releveEuropeEconomieEurostat.py
# Les périodes de référence sont écrites en tête de fichier (constantes) : les changer ici quand Eurostat publie une année de plus.
import json, itertools, sys, urllib.request, datetime, os

BASE = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/"
PAYS = [("BE", "Belgique"), ("BG", "Bulgarie"), ("CZ", "Tchéquie"), ("DK", "Danemark"), ("DE", "Allemagne"), ("EE", "Estonie"), ("IE", "Irlande"),
        ("EL", "Grèce"), ("ES", "Espagne"), ("FR", "France"), ("HR", "Croatie"), ("IT", "Italie"), ("CY", "Chypre"), ("LV", "Lettonie"),
        ("LT", "Lituanie"), ("LU", "Luxembourg"), ("HU", "Hongrie"), ("MT", "Malte"), ("NL", "Pays-Bas"), ("AT", "Autriche"), ("PL", "Pologne"),
        ("PT", "Portugal"), ("RO", "Roumanie"), ("SI", "Slovénie"), ("SK", "Slovaquie"), ("FI", "Finlande"), ("SE", "Suède")]
GEO = "&geo=".join(c for c, _ in PAYS)

AN = "2025"            # PIB, revenu des ménages, emploi, salaire moyen, dépenses des ménages
AN_ENT = "2024"        # démographie des entreprises (dernière année publiée)
AN_ENERGIE = "2022"    # part de l'énergie : dernière année où Eurostat la sépare pour tous les pays
TRIM = "2026-Q2"       # faillites : dernier trimestre complet
SEM_N, SEM_P = "2026-S2", "2025-S2"   # salaire minimum : même semestre, un an d'écart


def get(code, **p):
    q = "&".join("%s=%s" % (k, v) for k, v in p.items())
    url = BASE + code + "?format=JSON&lang=FR&geo=" + GEO + "&" + q
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    return json.load(urllib.request.urlopen(req, timeout=180))


def lignes(d):
    ids, size, dims = d["id"], d["size"], d["dimension"]
    cats = []
    for i in ids:
        idx = dims[i]["category"]["index"]
        if isinstance(idx, list):
            idx = {k: n for n, k in enumerate(idx)}
        cats.append(sorted(idx, key=lambda k: idx[k]))
    for n, combo in enumerate(itertools.product(*[range(s) for s in size])):
        if str(n) in d["value"]:
            yield {ids[j]: cats[j][combo[j]] for j in range(len(ids))}, d["value"][str(n)]


def serie(code, cle_temps="time", **p):
    out = {}
    for r, v in lignes(get(code, **p)):
        out.setdefault(r[cle_temps], {})[r["geo"]] = v
    return out


def fr(x, dec=1):
    return ("%.*f" % (dec, x)).replace(".", ",")


def pct(x, dec=1):
    return fr(x, dec) + " %"


def evo(n, p):
    return (n - p) / p * 100


champs = {}   # champ -> {geo: texte}
sources = {}  # clé -> "titre | url | date"
aujourdhui = datetime.date.today().isoformat()


def ajoute(champ, valeurs, cle, titre, url):
    champs[champ] = valeurs
    sources[champ] = (cle, "%s | %s | %s" % (titre, url, aujourdhui))


def nav(code):
    return "https://ec.europa.eu/eurostat/databrowser/view/%s/default/table" % code


# 1. Croissance du PIB (variation du volume sur un an)
s = serie("tec00115", unit="CLV_PCH_PRE", time=AN)[AN]
ajoute("croissance_pib", {g: pct(v) for g, v in s.items()}, "eurostat-croissance",
       "Eurostat, Taux de croissance du PIB réel en volume (tec00115), %s, variation sur un an" % AN, nav("tec00115"))

# 2. Pouvoir d'achat : revenu disponible des ménages par habitant, en standards de pouvoir d'achat
s = serie("tec00113", time=AN)[AN]
ajoute("revenu_menages_spa", {g: "{:,}".format(int(round(v))).replace(",", " ") for g, v in s.items()}, "eurostat-revenu-menages",
       "Eurostat, Revenu disponible brut ajusté des ménages par habitant en standards de pouvoir d'achat (tec00113), %s" % AN, nav("tec00113"))

# 3. Emploi : évolution sur un an et taux d'emploi des 20 à 64 ans
s = serie("nama_10_pe", unit="PCH_PRE_PER", na_item="EMP_DC", time=AN)[AN]
ajoute("evolution_emploi", {g: pct(v) for g, v in s.items()}, "eurostat-evolution-emploi",
       "Eurostat, Emploi total, variation sur un an (nama_10_pe), %s" % AN, nav("nama_10_pe"))
s = serie("tesem010", sex="T", time=AN)[AN]
ajoute("taux_emploi", {g: pct(v) for g, v in s.items()}, "eurostat-taux-emploi",
       "Eurostat, Taux d'emploi des 20 à 64 ans (tesem010), %s" % AN, nav("tesem010"))

# 4. Évolution du salaire minimum (monnaie nationale, pour ne pas mêler les variations de change)
s = serie("earn_mw_cur", currency="NAC", time=SEM_N)
p = serie("earn_mw_cur", currency="NAC", time=SEM_P)
ajoute("evolution_salaire_minimum", {g: pct(evo(s[SEM_N][g], p[SEM_P][g])) for g in s[SEM_N] if g in p[SEM_P] and p[SEM_P][g]}, "eurostat-evolution-salaire-minimum",
       "Eurostat, Salaires minimaux mensuels en monnaie nationale (earn_mw_cur), évolution du 2e semestre %s au 2e semestre %s" % (SEM_P[:4], SEM_N[:4]), nav("earn_mw_cur"))

# 5. Évolution de la rémunération nette d'une personne seule qui gagne le salaire moyen (monnaie nationale)
an_p = str(int(AN) - 1)
s = serie("earn_nt_net", currency="NAC", estruct="NET", ecase="P1_NCH_AW100", time="%s&time=%s" % (an_p, AN))
ajoute("evolution_remuneration_nette", {g: pct(evo(s[AN][g], s[an_p][g])) for g in s[AN] if g in s[an_p] and s[an_p][g]}, "eurostat-evolution-remuneration",
       "Eurostat, Rémunération nette annuelle d'une personne seule sans enfant gagnant le salaire moyen, monnaie nationale (earn_nt_net), évolution de %s à %s" % (an_p, AN), nav("earn_nt_net"))

# 6. Entreprises : taux de création et de cessation (nombre ÷ entreprises actives), puis faillites
act = serie("bd_size", indic_sbs="ENT_NR", nace_r2="B-S_X_O_S94", sizeclas="TOTAL", age="TOTAL", time=AN_ENT)[AN_ENT]
nai = serie("bd_size", indic_sbs="ENT_BRTH_NR", nace_r2="B-S_X_O_S94", sizeclas="TOTAL", age="TOTAL", time=AN_ENT)[AN_ENT]
cess = serie("bd_size", indic_sbs="ENT_DTH_NR", nace_r2="B-S_X_O_S94", sizeclas="TOTAL", age="TOTAL", time=AN_ENT)[AN_ENT]
ajoute("taux_creation_entreprises", {g: pct(nai[g] / act[g] * 100) for g in nai if g in act}, "eurostat-creations",
       "Eurostat, Démographie des entreprises (bd_size), %s : créations d'entreprises divisées par le nombre d'entreprises actives" % AN_ENT, nav("bd_size"))
ajoute("taux_cessation_entreprises", {g: pct(cess[g] / act[g] * 100) for g in cess if g in act}, "eurostat-cessations",
       "Eurostat, Démographie des entreprises (bd_size), %s : cessations d'activité divisées par le nombre d'entreprises actives (chiffres provisoires)" % AN_ENT, nav("bd_size"))
s = serie("sts_rb_q", indic_bt="BKRT", nace_r2="B-S_X_O_S94", s_adj="NSA", unit="PCH_SM", time=TRIM)[TRIM]
ajoute("evolution_faillites", {g: pct(v) for g, v in s.items()}, "eurostat-faillites",
       "Eurostat, Déclarations de faillite d'entreprises (sts_rb_q), %s : variation par rapport au même trimestre un an plus tôt" % TRIM.replace("-Q", " trimestre ").replace("2026 trimestre 2", "2e trimestre 2026"), nav("sts_rb_q"))

# 7. Dépenses des ménages : part de l'alimentation et du logement (2025), part de l'énergie (2022)
tot = serie("prc_ppp_ind_1", indic_ppp="EXP_EUR", ppp_cat18="E011", time=AN)[AN]
ali = serie("prc_ppp_ind_1", indic_ppp="EXP_EUR", ppp_cat18="A0101", time=AN)[AN]
log = serie("prc_ppp_ind_1", indic_ppp="EXP_EUR", ppp_cat18="A0104", time=AN)[AN]
ajoute("part_depenses_alimentation", {g: pct(ali[g] / tot[g] * 100) for g in ali if g in tot}, "eurostat-depenses-alimentation",
       "Eurostat, Dépenses des ménages (prc_ppp_ind_1), %s : produits alimentaires et boissons sans alcool, part de la dépense de consommation des ménages" % AN, nav("prc_ppp_ind_1"))
ajoute("part_depenses_logement", {g: pct(log[g] / tot[g] * 100) for g in log if g in tot}, "eurostat-depenses-logement",
       "Eurostat, Dépenses des ménages (prc_ppp_ind_1), %s : logement, eau, électricité, gaz et autres combustibles, part de la dépense de consommation des ménages" % AN, nav("prc_ppp_ind_1"))
t2 = serie("nama_10_co3_p3", unit="CP_MEUR", coicop="TOTAL", time=AN_ENERGIE)[AN_ENERGIE]
en = serie("nama_10_co3_p3", unit="CP_MEUR", coicop="CP045", time=AN_ENERGIE)[AN_ENERGIE]
ajoute("part_depenses_energie", {g: pct(en[g] / t2[g] * 100) for g in en if g in t2}, "eurostat-depenses-energie",
       "Eurostat, Dépenses des ménages (nama_10_co3_p3), %s : électricité, gaz et autres combustibles, part de la dépense de consommation des ménages" % AN_ENERGIE, nav("nama_10_co3_p3"))

# Écriture du fichier
sortie = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "modules", "comprendre-les-chiffres", "contenu", "europe-economie-eurostat.md")
out = ["---", "verifie_le: " + aujourdhui, "sources:"]
for champ in champs:
    cle, texte = sources[champ]
    out.append('  - "%s | %s"' % (cle, texte))
# Périodes structurées (consigne 145) : l'application écrit « en 2025 », « entre 2024 et 2025 »... d'après ce bloc, jamais d'après une année écrite dans son code.
# Mêmes variables que les titres des sources ci-dessus : une seule source de vérité. Format : 2025 | T2 2026 | S2 2025 | 2024 > 2025.
def trim_court(t):  # "2026-Q2" -> "T2 2026"
    return "T%s %s" % (t[-1], t[:4])
def sem_court(t):   # "2026-S2" -> "S2 2026"
    return "S%s %s" % (t[-1], t[:4])
PERIODES = {
    "eurostat-croissance": AN, "eurostat-revenu-menages": AN, "eurostat-evolution-emploi": AN, "eurostat-taux-emploi": AN,
    "eurostat-evolution-salaire-minimum": "%s > %s" % (sem_court(SEM_P), sem_court(SEM_N)),
    "eurostat-evolution-remuneration": "%s > %s" % (an_p, AN),
    "eurostat-creations": AN_ENT, "eurostat-cessations": AN_ENT,
    "eurostat-faillites": "%s > %s" % (trim_court(str(int(TRIM[:4]) - 1) + TRIM[4:]), trim_court(TRIM)),
    "eurostat-depenses-alimentation": AN, "eurostat-depenses-logement": AN, "eurostat-depenses-energie": AN_ENERGIE,
}
out.append("periodes:")
for champ in champs:
    cle = sources[champ][0]
    out.append('  - "%s | %s"' % (cle, PERIODES[cle]))
out += ["---", "", "# pays", ""]
for g, nom in PAYS:
    out.append("## " + nom)
    cles = []
    for champ in champs:
        if g in champs[champ]:
            out.append("%s: %s" % (champ, champs[champ][g]))
            cles.append(sources[champ][0])
    out.append("sources: " + ", ".join(cles))
    out.append("")
with open(sortie, "w", encoding="utf-8", newline="\n") as f:
    f.write("\n".join(out))
for champ in champs:
    print("%-32s %2d pays" % (champ, len(champs[champ])), "| France :", champs[champ].get("FR"))
