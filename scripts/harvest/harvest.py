"""
ONE-TIME MIGRATION TOOL. Harvests content and document links from the legacy
tribal.gov.in ASP.NET pages (read only) and writes clean JSON into src/data/generated/.
The website itself never reads the legacy code: the JSON is committed in this project.

Run from the project root:   LEGACY_DIR=/path/to/legacy/App python3 scripts/harvest/harvest.py
(LEGACY_DIR defaults to ../MoTA_Website_Old/App, the legacy copy kept beside this repository.) Nothing in the legacy folder is modified.
"""
import html, json, os, re
from html.parser import HTMLParser
from urllib.parse import quote

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LEGACY = os.environ.get("LEGACY_DIR") or os.path.join(os.path.dirname(ROOT), "MoTA_Website_Old", "App")
if not os.path.isdir(LEGACY):
    raise SystemExit(f"Legacy source not found at {LEGACY}. Set LEGACY_DIR (only needed to re-import content).")
OUT = os.path.join(ROOT, "src", "data", "generated")
LIVE = "https://tribal.gov.in/"

# Legacy page -> new route. Used to rewrite internal links found in harvested content.
ASPX_MAP = {
    "home.aspx": "/", "default.aspx": "/", "aboutministry.aspx": "/ministry/about-us/",
    "scholarship.aspx": "/ministry/our-divisions/scholarship/", "tri.aspx": "/ministry/our-divisions/tri-research-media/",
    "thc.aspx": "/ministry/our-divisions/tribal-health/", "emrs.aspx": "/ministry/our-divisions/emrs/",
    "livelihood.aspx": "/ministry/our-divisions/livelihood/", "pm-janman.aspx": "/offerings/schemes/pm-janman/",
    "dajagua.aspx": "/offerings/schemes/da-jgua/", "stwelfaregrant.aspx": "/ministry/our-divisions/grants/",
    "ngo.aspx": "/ministry/our-divisions/ngo/", "fra.aspx": "/ministry/our-divisions/forest-rights-act/",
    "stcmonitoring.aspx": "/ministry/our-divisions/stc-monitoring/", "clm.aspx": "/ministry/our-divisions/constitutional-legal-matters/",
    "pnc.aspx": "/ministry/our-divisions/parliament-coordination/", "estvigilance.aspx": "/ministry/our-divisions/establishment/",
    "vigilance.aspx": "/ministry/our-divisions/vigilance/", "statistics.aspx": "/ministry/our-divisions/statistics/",
    "finance.aspx": "/ministry/our-divisions/finance/", "officiallanguage.aspx": "/ministry/our-divisions/official-language/",
    "ncst.aspx": "/ministry/our-organisations/ncst/", "nstfdc.aspx": "/ministry/our-organisations/nstfdc/",
    "contactus.aspx": "/connect/contact-us/", "rti.aspx": "/connect/rti/", "publicgrievances.aspx": "/connect/grievance-redressal/",
    "websitepolicy.aspx": "/policies/", "copyrightpolicy.aspx": "/policies/copyright-policy/", "disclaimer.aspx": "/policies/disclaimer/",
    "help.aspx": "/help/", "screenreaderaccess.aspx": "/screen-reader-access/", "sitemap.aspx": "/sitemap/",
    "realtedwebsites.aspx": "/related-links/", "feedback.aspx": "/connect/feedback/", "whatsnew.aspx": "/whats-new/",
    "tendersadvertisment.aspx": "/offerings/tenders/", "knowledgehub.aspx": "/documents/knowledge-hub/",
    "performancedashboard.aspx": "/ministry/our-performance/", "sanctionorder.aspx": "/documents/sanction-orders/",
    "icestupa.aspx": "/offerings/initiatives/ice-stupa/", "1000-springs-initiative.aspx": "/offerings/initiatives/1000-springs/",
    "goal.aspx": "/offerings/initiatives/goal/", "geet.aspx": "/offerings/initiatives/geet/",
    "model-village.aspx": "/offerings/initiatives/model-village/", "swasthya-portal.aspx": "/offerings/initiatives/swasthya-portal/",
    "telemedicine.aspx": "/offerings/initiatives/telemedicine/", "gapanalysis.aspx": "/offerings/initiatives/gap-analysis/",
    "atmanirbhar-bharat.aspx": "/offerings/initiatives/atmanirbhar-bharat/", "pri-awareness-program.aspx": "/offerings/initiatives/pri-awareness/",
    "sickle-cell-disease-piramal-swasthya.aspx": "/offerings/initiatives/sickle-cell/", "tribex.aspx": "/offerings/initiatives/tribex/",
}

class Parser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.sections = []
        self.cur = {"heading": "(intro)", "paras": [], "links": []}
        self.sections.append(self.cur)
        self.inhead = None; self.headbuf = ""; self.ina = None; self.abuf = ""
        self.inp = False; self.pbuf = ""; self.skip = 0; self.inli = False; self.libuf = ""
    def handle_starttag(self, t, a):
        a = dict(a)
        if t in ("script", "style", "noscript"): self.skip += 1
        if t in ("h1", "h2", "h3", "h4", "h5", "h6"): self.inhead = t; self.headbuf = ""
        if t == "a": self.ina = a.get("href", ""); self.abuf = ""
        if t == "p": self.inp = True; self.pbuf = ""
        if t == "li": self.inli = True; self.libuf = ""
    def handle_endtag(self, t):
        if t in ("script", "style", "noscript"): self.skip = max(0, self.skip - 1)
        if t == self.inhead:
            h = " ".join(self.headbuf.split())
            if h and len(h) < 160:
                self.cur = {"heading": h, "paras": [], "links": []}
                self.sections.append(self.cur)
            self.inhead = None
        if t == "a" and self.ina is not None:
            txt = " ".join(self.abuf.split()); href = self.ina.strip()
            if href and not href.startswith(("#", "javascript")) and txt:
                self.cur["links"].append({"text": txt, "href": href})
            self.ina = None
        if t == "p" and self.inp:
            txt = " ".join(self.pbuf.split())
            if len(txt) > 25: self.cur["paras"].append(txt)
            self.inp = False
        if t == "li" and self.inli:
            txt = " ".join(self.libuf.split())
            if len(txt) > 40 and not self.cur["links"]: self.cur["paras"].append(txt)
            self.inli = False
    def handle_data(self, d):
        if self.skip: return
        if self.inhead: self.headbuf += d
        if self.ina is not None: self.abuf += d
        if self.inp: self.pbuf += d
        if self.inli: self.libuf += d

def resolve(href):
    """Return (url, kind). kind: internal | document | external | legacy."""
    h = html.unescape(href.strip()).replace("\\", "/")
    if h.startswith(("mailto:", "tel:")): return h, "external"
    if h.startswith("http://") and not re.match(r"http://(www\.)?tribal\.(gov|nic)\.in", h):
        pass
    m = re.match(r"https?://(www\.)?tribal\.(gov|nic)\.in/(.*)", h, flags=re.I)
    path = None
    if m: path = m.group(3)
    elif not re.match(r"^[a-z]+://", h, flags=re.I): path = re.sub(r"^(\.\./|\./|~/|/)+", "", h)
    if path is None:
        return h, "external"
    base = path.split("?")[0].split("#")[0]
    key = base.lower()
    if key in ASPX_MAP: return ASPX_MAP[key], "internal"
    url = LIVE + quote(path, safe="/:?=&%._-()~,+")
    if re.search(r"\.(pdf|docx?|xlsx?|pptx?|zip|rar|jpg|jpeg|png|mp4)$", key): return url, "document"
    return url, "legacy"

def ftype(url):
    m = re.search(r"\.([a-z0-9]{2,4})(?:$|\?)", url.lower())
    return (m.group(1) if m else "").upper()

SIZE_RE = re.compile(r"\(?\s*(?:PDF\s*[-,:]?\s*)?(\d[\d.,]*\s*(?:KB|MB|kb|mb|Kb|Mb))\s*\)?")

def split_size(t):
    m = SIZE_RE.search(t)
    if not m: return t, ""
    size = m.group(1).replace(" ", "").upper().replace("KB", " KB").replace("MB", " MB")
    return (t[:m.start()] + t[m.end():]), size

def clean_title(t):
    t = re.sub(r"\s*\((PDF|pdf)[^)]*\)\s*", " ", t)
    t = re.sub(r"\s*\(External website that opens in a new window\)", "", t)
    t = re.sub(r"\s+", " ", t).strip(" -–:|")
    return t

def parse(fname, start=None, stop=None):
    raw = open(os.path.join(LEGACY, fname), encoding="utf-8", errors="ignore").read()
    raw = re.sub(r"<%--.*?--%>", "", raw, flags=re.S)
    raw = re.sub(r"<!--.*?-->", "", raw, flags=re.S)
    raw = re.sub(r"<%.*?%>", "", raw, flags=re.S)
    m = re.search(r'ContentPlaceHolderID="ContentPlaceHolder1"[^>]*>(.*)', raw, flags=re.S)
    p = Parser(); p.feed(m.group(1) if m else raw)
    secs = p.sections
    if start:
        idx = next((i for i, s in enumerate(secs) if re.search(start, s["heading"], re.I)), 0); secs = secs[idx:]
    if stop:
        idx = next((i for i, s in enumerate(secs) if i > 0 and re.search(stop, s["heading"], re.I)), len(secs)); secs = secs[:idx]
    return secs

SKIP_HEAD = re.compile(r"^(home|know more|resources|\(intro\)|[\d,.\s]+(cr|crore|\(acres\))?|rs\.?\s*[\d,.]+\s*cr|female.*|male.*|austraila.*|\d+/\d+)$", re.I)
SKIP_LINK = re.compile(r"^(home|know more|click here|explore|divisions)$", re.I)

def build_sections(secs, page_title):
    out, seen_urls, intro = [], set(), []
    for s in secs:
        h = s["heading"].strip()
        paras = [p for p in s["paras"] if not p.startswith("•")]
        if not out and paras and (h == "(intro)" or h.lower() == page_title.lower()):
            intro.extend(paras)
        links = []
        for l in s["links"]:
            raw_title, size = split_size(l["text"])
            title = clean_title(raw_title)
            if not title or SKIP_LINK.match(title) or title.startswith("http"): 
                if not title.startswith("http"): continue
            url, kind = resolve(l["href"])
            if url in seen_urls: continue
            seen_urls.add(url)
            item = {"title": title, "url": url, "kind": kind}
            ft = ftype(url) if kind == "document" else ""
            if ft: item["format"] = ft
            if size: item["size"] = size
            links.append(item)
        if SKIP_HEAD.match(h) and not paras:
            if links and out: out[-1]["links"].extend(links)
            continue
        if links or (paras and h not in ("(intro)",)):
            out.append({"heading": h if h != "(intro)" else page_title, "text": paras[:6], "links": links})
    return intro[:6], out

# slug -> (file, title, start_regex, stop_regex)
DIVISIONS = {
    "scholarship": ("ScholarshiP.aspx", "Scholarship", None, None),
    "tri-research-media": ("TRI.aspx", "TRI, Research & Media", None, None),
    "tribal-health": ("THC.aspx", "Tribal Health Initiatives", None, None),
    "emrs": ("EMRS.aspx", "Eklavya Model Residential Schools", None, None),
    "livelihood": ("Livelihood.aspx", "Livelihood", None, None),
    "pm-janman": ("PM-JANMAN.aspx", "PM-JANMAN", None, None),
    "da-jgua": ("dajagua.aspx", "Dharti Aaba Janjatiya Gram Utkarsh Abhiyan", None, None),
    "grants": ("STWelfareGrant.aspx", "ST Welfare Grants", None, r"^Special Central Assistance.*$(?<!x)"),
    "ngo": ("NGO.aspx", "NGO Grants", None, None),
    "forest-rights-act": ("FRA.aspx", "Forest Rights Act", None, None),
    "stc-monitoring": ("STCMonitoring.aspx", "STC Monitoring", None, None),
    "constitutional-legal-matters": ("Clm.aspx", "Constitutional & Legal Matters", None, None),
    "parliament-coordination": ("PnC.aspx", "Parliament & Coordination", None, None),
    "establishment": ("estVigilance.aspx", "Establishment", None, r"^Monthly Summary"),
    "vigilance": ("Vigilance.aspx", "Vigilance", None, r"^Monthly Summary"),
    "statistics": ("Statistics.aspx", "Statistics", None, None),
    "finance": ("Finance.aspx", "Finance", None, r"^Committee$"),
    "official-language": ("OfficialLanguage.aspx", "Official Language", None, None),
    "ncst": ("NCST.aspx", "NCST", None, None),
    "nstfdc": ("NSTFDC.aspx", "NSTFDC", None, None),
    "knowledge-hub": ("KnowledgeHub.aspx", "Knowledge Hub", None, None),
    "review-meeting": ("ReviewMeeting.aspx", "State Review Meeting", None, r"^List of EMRS"),
    "rti": ("RTI.aspx", "Right To Information Act", None, None),
    "grievance": ("PublicGrievances.aspx", "Public Grievance", None, None),
    "related": ("RealtedWebsites.aspx", "Related Websites", None, None),
    "screen-reader": ("ScreenReaderAccess.aspx", "Screen Reader Access", None, None),
    "mous": ("MOUS.aspx", "MoUs", None, None),
}
INITIATIVES = {
    "ice-stupa": "IceStupa.aspx", "1000-springs": "1000-springs-initiative.aspx", "goal": "Goal.aspx", "geet": "Geet.aspx",
    "model-village": "Model-Village.aspx", "swasthya-portal": "Swasthya-Portal.aspx", "telemedicine": "Telemedicine.aspx",
    "gap-analysis": "GapAnalysis.aspx", "atmanirbhar-bharat": "atmanirbhar-bharat.aspx", "pri-awareness": "pri-awareness-program.aspx",
    "performance-dashboard": "PerformanceDashboard.aspx", "sickle-cell": "sickle-cell-disease-piramal-swasthya.aspx", "tribex": "TribeX.aspx",
}

def run():
    os.makedirs(OUT, exist_ok=True)
    pages, totals = {}, 0
    for slug, (f, title, start, stop) in DIVISIONS.items():
        if slug == "grants":
            secs = parse(f)
            # The legacy Grants page repeats its three scheme blocks twice; keep the first copy.
            heads = [s["heading"] for s in secs]
            first = next((i for i, h in enumerate(heads) if h.startswith("Special Central Assistance")), 0)
            second = next((i for i, h in enumerate(heads) if i > first and h.startswith("Special Central Assistance")), len(secs))
            secs = secs[:second]
        else:
            secs = parse(f, start, stop)
        intro, sections = build_sections(secs, title)
        pages[slug] = {"source": f, "title": title, "intro": intro, "sections": sections}
        totals += sum(len(s["links"]) for s in sections)
    for slug, f in INITIATIVES.items():
        intro, sections = build_sections(parse(f), slug)
        pages["initiative:" + slug] = {"source": f, "title": slug, "intro": intro, "sections": sections}
        totals += sum(len(s["links"]) for s in sections)
    json.dump(pages, open(os.path.join(OUT, "legacy-pages.json"), "w"), indent=1, ensure_ascii=False)
    print(f"legacy-pages.json: {len(pages)} pages, {totals} links")
    # Redirects are no longer generated here: the complete, hand-maintained map of old
    # addresses is src/data/legacy-urls.json (read by src/pages/web.config.ts).
    directory()

def directory():
    raw = open(os.path.join(LEGACY, "ContactUs.aspx"), encoding="utf-8", errors="ignore").read()
    raw = re.sub(r"<%--.*?--%>|<!--.*?-->", "", raw, flags=re.S)
    rows = re.findall(r"<tr[^>]*>(.*?)</tr>", raw, flags=re.S)
    groups, cur = [], None
    for r in rows:
        cells_raw = re.findall(r"<t[dh][^>]*>(.*?)</t[dh]>", r, flags=re.S)
        def txt(c, sep=" "): return " ".join(html.unescape(re.sub(r"<br\s*/?>", "\n", re.sub(r"<(?!br)[^>]+>", " ", c))).replace("\n", " \n ").split(" ")).strip()
        cells = [" ".join(html.unescape(re.sub(r"<[^>]+>", " ", c)).split()) for c in cells_raw]
        if not any(cells): continue
        if len(cells) == 1 or (len(cells) >= 1 and not re.match(r"^\d+$", cells[0]) and "Sl. No" not in cells[0]):
            name = cells[0]
            m = re.match(r"^(.*?)\s*\((.*?)\)\s*$", name)
            cur = {"hi": m.group(1).strip() if m else name, "en": m.group(2).strip() if m else name, "people": []}
            groups.append(cur); continue
        if "Sl. No" in cells[0] or cur is None: continue
        namecell = cells[1] if len(cells) > 1 else ""
        # Name cell = "<Hindi name> <English name> <Hindi designation> <English designation>"
        en_name = re.search(r"((?:Sh|Smt|Ms|Mr|Mrs|Dr|Shri)\.?\s+[A-Z][A-Za-z.\s]+?)(?=\s+[ऀ-ॿ]|$)", namecell)
        hi_name = re.match(r"^([ऀ-ॿ.\s०-९]+?)(?=\s+(?:Sh|Smt|Ms|Mr|Mrs|Dr|Shri|Mr)\b)", namecell)
        tail = namecell[en_name.end():].strip() if en_name else ""
        hi_desig = " ".join(re.findall(r"[ऀ-ॿ]+(?:\s+[ऀ-ॿ]+)*", tail)[:1])
        en_desig = re.sub(r"[ऀ-ॿ]+", " ", tail)
        en_desig = " ".join(en_desig.split()).strip(" ,/")
        contact = cells[3] if len(cells) > 3 else ""
        phone = re.search(r"Ph:\s*(.*?)\s*(?:Intercom:|Email:|$)", contact)
        inter = re.search(r"Intercom:\s*(.*?)\s*(?:Email:|$)", contact)
        email = re.search(r"Email:\s*(.*?)(?:\s+(?:Room|Jeevan|Kartavya)|$)", contact)
        address = cells[4] if len(cells) > 4 else ""
        if not address:
            a = re.search(r"((?:Room No|Jeevan Tara|Kartavya).*)$", contact); address = a.group(1) if a else ""
        if not en_name:
            # Rows such as "Private Secretary to Minister" have no personal name.
            en_name_s = re.sub(r"[ऀ-ॿ]+", " ", namecell); en_name_s = " ".join(en_name_s.split())
            person = {"name": "", "designation": en_name_s}
        else:
            person = {"name": " ".join(en_name.group(1).split()), "designation": en_desig}
        person.update({
            "nameHi": " ".join(hi_name.group(1).split()) if hi_name else "",
            "designationHi": hi_desig,
            "work": cells[2] if len(cells) > 2 else "",
            "phone": (phone.group(1).strip(" ,") if phone else ""),
            "intercom": (inter.group(1).strip(" ,") if inter else ""),
            "email": (email.group(1).strip() if email else ""),
            "address": address.strip(),
        })
        cur["people"].append(person)
    groups = [g for g in groups if g["people"]]
    json.dump(groups, open(os.path.join(OUT, "directory.json"), "w"), indent=1, ensure_ascii=False)
    print(f"directory.json: {len(groups)} groups, {sum(len(g['people']) for g in groups)} people")

if __name__ == "__main__":
    run()
