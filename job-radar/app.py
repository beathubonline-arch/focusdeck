import asyncio, re, time, io
from datetime import datetime, timezone
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse, StreamingResponse
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, ListFlowable, ListItem
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.lib import colors

app = FastAPI(title="Anthony Job Radar")
CACHE={"ts":0,"jobs":[]}

STRONG=["claude","chatgpt","llm","generative ai","ai automation","agent","prompt","python","fastapi","api","webhook","sql","postgresql","supabase","javascript","typescript","react","next.js","git","github","cloud","automation","workflow","systems integration","application support","it support","network","telecommunications","fiber","database","data","assessment","training","curriculum","quality assurance","banking","reconciliation","compliance","technical documentation"]
PENALTIES=[("phd",18),("doctorate",18),("master's degree required",14),("masters degree required",14),("10+ years",18),("8+ years",14),("7+ years",10),("director",10),("vice president",14),("chief ",14),("c-level",14)]

def clean(s):
    return re.sub(r"\s+"," ",re.sub(r"<[^>]+>"," ",s or "")).strip()

def score_job(j):
    text=(j.get("title","")+" "+j.get("description","")+" "+j.get("tags","")).lower()
    title=j.get("title","").lower()
    score=28; matched=[]
    for k in STRONG:
        if k in text:
            score += 5 if k in title else 3
            if len(matched)<8: matched.append(k)
    if any(x in text for x in ["remote","kenya","nairobi","africa","worldwide","anywhere"]): score+=8
    if any(x in title for x in ["ai","automation","agent","llm","full stack","backend","application","systems","telecom","data","sql","it support"]): score+=12
    for phrase,p in PENALTIES:
        if phrase in text: score-=p
    score=max(10,min(98,score))
    j["score"]=score
    j["band"]="Excellent fit" if score>=82 else "Strong fit" if score>=68 else "Possible fit" if score>=55 else "Stretch"
    j["matched"]=matched
    return j

async def fetch_remotive(client):
    out=[]
    try:
        r=await client.get("https://remotive.com/api/remote-jobs",timeout=15)
        for x in r.json().get("jobs",[])[:120]:
            out.append({"id":"rem-"+str(x.get("id")),"source":"Remotive","title":x.get("title",""),"company":x.get("company_name",""),"location":x.get("candidate_required_location","Remote"),"url":x.get("url",""),"description":clean(x.get("description",""))[:1800],"tags":" ".join(x.get("tags") or []),"posted":x.get("publication_date","")})
    except Exception: pass
    return out

async def fetch_arbeitnow(client):
    out=[]
    try:
        r=await client.get("https://www.arbeitnow.com/api/job-board-api",timeout=15)
        for x in r.json().get("data",[])[:120]:
            out.append({"id":"arb-"+str(x.get("slug","")),"source":"Arbeitnow","title":x.get("title",""),"company":x.get("company_name",""),"location":x.get("location",""),"url":x.get("url",""),"description":clean(x.get("description",""))[:1800],"tags":" ".join(x.get("tags") or []),"posted":str(x.get("created_at",""))})
    except Exception: pass
    return out

async def fetch_remoteok(client):
    out=[]
    try:
        r=await client.get("https://remoteok.com/api",headers={"User-Agent":"Mozilla/5.0"},timeout=15)
        data=r.json()
        for x in (data[1:121] if isinstance(data,list) else []):
            out.append({"id":"rok-"+str(x.get("id","")),"source":"Remote OK","title":x.get("position",""),"company":x.get("company",""),"location":x.get("location") or "Remote","url":x.get("url",""),"description":clean(x.get("description",""))[:1800],"tags":" ".join(x.get("tags") or []),"posted":str(x.get("date",""))})
    except Exception: pass
    return out

async def scan(force=False):
    now=time.time()
    if not force and CACHE["jobs"] and now-CACHE["ts"]<900:
        return CACHE["jobs"]
    async with httpx.AsyncClient(follow_redirects=True) as client:
        chunks=await asyncio.gather(fetch_remotive(client),fetch_arbeitnow(client),fetch_remoteok(client))
    seen=set(); jobs=[]
    for x in sum(chunks,[]):
        key=(x["title"].lower().strip(),x["company"].lower().strip())
        if key in seen: continue
        seen.add(key); jobs.append(score_job(x))
    jobs.sort(key=lambda x:(x["score"],x.get("posted","")),reverse=True)
    CACHE.update(ts=now,jobs=jobs)
    return jobs


PROFILE = {
    "name":"Anthony Kipkoech Bii",
    "headline":"AI Automation & Applications Specialist | Telecommunications Engineer",
    "location":"Nairobi, Kenya",
    "phone":"+254 720 050 886",
    "email":"anthonybii2021@gmail.com",
    "linkedin":"linkedin.com/in/anthony-bii-26a9a0348",
    "portfolio":"signalworks.ai",
    "github":"github.com/anthonybii2021-boop",
    "education":"Bachelor of Engineering - Electrical & Telecommunications Engineering, Moi University",
    "certs":[
        "Artificial Intelligence for Trainers - Microsoft Elevate (2026)",
        "Certified Trainer - Women in Digital Business (WIDB), ILO / ITC / Microsoft (2025)"
    ]
}

BASE_EXPERIENCE = [
    ("Founder & AI Automation / Agent Developer", "Independent / SignalWorks | 2026 - Present", [
        "Design and build AI-enabled workflows and agents for customer support, scheduling, lead qualification, follow-up and operational decision support.",
        "Integrate applications with email, calendars, messaging, APIs and relational databases to reduce manual hand-offs.",
        "Test critical workflows against edge cases, diagnose failures from logs and outputs, and refine systems before production use."
    ]),
    ("Full-Stack Product Engineer - BeatHub", "2026", [
        "Built and deployed a production marketplace with authentication, role-based dashboards, PostgreSQL-backed orders and transaction workflows.",
        "Implemented M-Pesa/Paystack callbacks, transaction-status handling, withdrawals, integrations and production troubleshooting."
    ]),
    ("Bank Teller / Branch IT Support", "Access Bank, JKIA | Jan 2024 - Feb 2025", [
        "Processed high-volume financial transactions while maintaining accurate, audit-ready records and strict confidentiality.",
        "Supported teller terminals, printers and network/connectivity issues and coordinated technical resolution during downtime."
    ]),
    ("Assessment & Certification Officer / Digital Material Development Officer", "TVET CDACC | Nov 2020 - Jun 2022", [
        "Developed and reviewed competency-based curricula, occupational standards and assessment tools and digitized learning materials.",
        "Worked with technical stakeholders on quality review, documentation and standards-driven certification processes."
    ]),
    ("Frequency Spectrum & IT Office Support Attaché", "Communications Authority of Kenya | Apr 2019 - Jul 2019", [
        "Supported spectrum monitoring/licensing and regional IT maintenance in a regulated telecommunications environment."
    ])
]

def get_job_by_id(job_id, jobs):
    return next((j for j in jobs if j.get("id")==job_id), None)

def role_track(job):
    t=(job.get("title","")+" "+job.get("description","")).lower()
    if any(k in t for k in ["ai","automation","llm","agent","prompt","machine learning"]):
        return "AI Automation & Agentic Workflows"
    if any(k in t for k in ["data","sql","analytics","database","business intelligence"]):
        return "Data, SQL & Applications"
    if any(k in t for k in ["network","telecom","ict","infrastructure","support","systems administrator"]):
        return "ICT Infrastructure & Applications"
    return "Full-Stack, Applications & Systems Integration"

def tailored_summary(job):
    track=role_track(job)
    matched=", ".join((job.get("matched") or [])[:7])
    if track=="AI Automation & Agentic Workflows":
        return ("AI automation and applications specialist with hands-on experience building AI-enabled workflows, "
                "integrating APIs and PostgreSQL/Supabase-backed systems, testing edge cases and deploying practical digital products. "
                "Brings regulated banking, telecommunications and assessment experience, with strong documentation and stakeholder communication.")
    if track=="Data, SQL & Applications":
        return ("Technology professional with practical SQL/PostgreSQL, data-backed application and workflow-integration experience across deployed products, "
                "banking operations and public-sector systems. Experienced in data accuracy, reconciliation, troubleshooting, APIs and technical documentation.")
    if track=="ICT Infrastructure & Applications":
        return ("Infrastructure and applications professional with an Electrical & Telecommunications Engineering background and hands-on experience in networks, "
                "IT support, application deployment, PostgreSQL-backed systems, troubleshooting, user support and regulated operations.")
    return ("Full-stack and applications professional with hands-on experience building, integrating, deploying and troubleshooting modern web applications, APIs, "
            "PostgreSQL-backed workflows, authentication and production systems, backed by engineering and regulated-operations experience.")

def application_pack(job):
    summary=tailored_summary(job)
    matched=(job.get("matched") or [])[:8]
    gap=[]
    text=(job.get("description","")+" "+job.get("title","")).lower()
    for phrase,label in [
        ("master's","Master's degree"),("phd","PhD"),("active directory","Active Directory"),
        ("azure","Azure"),("aws","AWS"),("kubernetes","Kubernetes"),("c-level","C-level leadership"),
        ("10+ years","10+ years experience"),("8+ years","8+ years experience"),("7+ years","7+ years experience")
    ]:
        if phrase in text and not any(phrase in x for x in matched): gap.append(label)
    cover=(f"Dear Hiring Team,\n\nI am applying for the {job.get('title','role')} position at {job.get('company','your organisation')}. "
           f"My background combines hands-on technology delivery with experience in AI-enabled workflows, applications, databases, telecommunications and regulated operations. "
           f"For this role, the strongest overlap includes {', '.join(matched[:6]) if matched else 'systems integration, technical problem-solving and reliable execution'}.\n\n"
           "I have built and supported production digital systems, worked with PostgreSQL/SQL and APIs, tested workflows against real edge cases, and operated in environments where accuracy, confidentiality and documentation matter. "
           "I would welcome the opportunity to discuss how this combination can support your team.\n\nKind regards,\nAnthony Kipkoech Bii")
    answers={
        "Why are you interested in this role?":f"The role aligns with my practical experience in {', '.join(matched[:5]) if matched else role_track(job)} and my preference for hands-on work that turns business needs into reliable systems.",
        "What makes you a strong fit?":f"I combine engineering and systems thinking with deployed product experience, structured testing, technical documentation and regulated-operations discipline. My closest matching areas are {', '.join(matched[:6]) if matched else 'applications, integration and troubleshooting'}.",
        "Availability":"Available for full-time or contract opportunities and flexible working hours where required.",
        "Location":"Nairobi, Kenya; open to Kenya-based, hybrid and remote roles."
    }
    return {"summary":summary,"track":role_track(job),"matched":matched,"gaps":gap,"cover_letter":cover,"answers":answers}

@app.get("/api/application/{job_id}")
async def api_application(job_id:str):
    jobs=await scan(False)
    job=get_job_by_id(job_id,jobs)
    if not job: raise HTTPException(404,"Job not found")
    pack=application_pack(job)
    email_match=re.search(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}",job.get("description",""),re.I)
    return {"job":{k:job.get(k) for k in ["id","title","company","location","url","score","band","source"]},
            "application_email":email_match.group(0) if email_match else None,
            **pack}

@app.get("/api/cv/{job_id}.pdf")
async def tailored_cv_pdf(job_id:str):
    jobs=await scan(False)
    job=get_job_by_id(job_id,jobs)
    if not job: raise HTTPException(404,"Job not found")
    pack=application_pack(job)
    buf=io.BytesIO()
    styles=getSampleStyleSheet()
    styles.add(ParagraphStyle(name="NameX",parent=styles["Title"],fontName="Helvetica-Bold",fontSize=18,leading=20,alignment=TA_CENTER,textColor=colors.HexColor("#172033"),spaceAfter=3))
    styles.add(ParagraphStyle(name="HeadX",parent=styles["Normal"],fontName="Helvetica-Bold",fontSize=10.5,alignment=TA_CENTER,textColor=colors.HexColor("#315C9A"),spaceAfter=4))
    styles.add(ParagraphStyle(name="ContactX",parent=styles["Normal"],fontSize=8.5,alignment=TA_CENTER,textColor=colors.HexColor("#66758A"),spaceAfter=8))
    styles.add(ParagraphStyle(name="SecX",parent=styles["Heading2"],fontName="Helvetica-Bold",fontSize=10.5,textColor=colors.HexColor("#1F4E79"),spaceBefore=7,spaceAfter=4))
    styles.add(ParagraphStyle(name="BodyX",parent=styles["BodyText"],fontSize=8.8,leading=11.2,spaceAfter=3))
    styles.add(ParagraphStyle(name="RoleX",parent=styles["BodyText"],fontName="Helvetica-Bold",fontSize=9.2,leading=11,spaceBefore=3,spaceAfter=1))
    doc=SimpleDocTemplate(buf,pagesize=A4,rightMargin=38,leftMargin=38,topMargin=32,bottomMargin=32)
    story=[
        Paragraph(PROFILE["name"],styles["NameX"]),
        Paragraph(pack["track"].upper(),styles["HeadX"]),
        Paragraph(f'{PROFILE["location"]} | {PROFILE["phone"]} | {PROFILE["email"]} | {PROFILE["linkedin"]} | {PROFILE["portfolio"]}',styles["ContactX"]),
        Paragraph("PROFESSIONAL SUMMARY",styles["SecX"]),
        Paragraph(pack["summary"],styles["BodyX"]),
        Paragraph("CORE SKILLS",styles["SecX"])
    ]
    skills=(pack["matched"] or ["AI automation","Python","SQL","PostgreSQL","APIs","systems integration","technical documentation"])
    story.append(Paragraph(" • ".join([s.title() for s in skills[:10]]),styles["BodyX"]))
    story.append(Paragraph("SELECTED EXPERIENCE",styles["SecX"]))
    for title,where,bullets in BASE_EXPERIENCE:
        story.append(Paragraph(f"{title} | {where}",styles["RoleX"]))
        story.append(ListFlowable([ListItem(Paragraph(b,styles["BodyX"]),leftIndent=10) for b in bullets],bulletType="bullet",leftIndent=16,bulletFontSize=5))
    story.append(Paragraph("EDUCATION & CERTIFICATIONS",styles["SecX"]))
    story.append(Paragraph(PROFILE["education"],styles["BodyX"]))
    for cert in PROFILE["certs"]:
        story.append(Paragraph("• "+cert,styles["BodyX"]))
    story.append(Paragraph("TARGET ROLE",styles["SecX"]))
    story.append(Paragraph(f'{job.get("title","")} — {job.get("company","")}. Resume tailored automatically to the posting while preserving verified experience only.',styles["BodyX"]))
    doc.build(story)
    buf.seek(0)
    safe=re.sub(r"[^A-Za-z0-9_-]+","_",f'Anthony_Bii_{job.get("title","Role")}')[:90]+".pdf"
    return StreamingResponse(buf,media_type="application/pdf",headers={"Content-Disposition":f'attachment; filename="{safe}"'})

async def background_scanner():
    while True:
        try:
            await scan(True)
        except Exception:
            pass
        await asyncio.sleep(1800)

async def startup_self_test():
    await asyncio.sleep(2)
    for run in (1, 2):
        try:
            jobs = await scan(True)
            if not jobs:
                print(f"SELFTEST {run}: FAIL - no live jobs returned", flush=True)
            else:
                top = jobs[0]
                pack = application_pack(top)
                ok = bool(top.get("url")) and bool(pack.get("summary")) and bool(pack.get("cover_letter"))
                print(f"SELFTEST {run}: {'PASS' if ok else 'FAIL'} - jobs={len(jobs)} top={top.get('title')} score={top.get('score')} cv_pack={bool(pack.get('summary'))}", flush=True)
        except Exception as e:
            print(f"SELFTEST {run}: FAIL - {type(e).__name__}: {e}", flush=True)
        await asyncio.sleep(2)

@app.on_event("startup")
async def start_background_scanner():
    asyncio.create_task(background_scanner())
    asyncio.create_task(startup_self_test())

@app.get("/health")
async def health():
    return {"ok":True,"cached_jobs":len(CACHE["jobs"])}

@app.get("/api/jobs")
async def api_jobs(refresh:int=0, min_score:int=35):
    jobs=await scan(bool(refresh))
    jobs=[j for j in jobs if j["score"]>=min_score]
    return {"updated_at":datetime.now(timezone.utc).isoformat(),"count":len(jobs),"jobs":jobs[:100]}

@app.get("/",response_class=HTMLResponse)
async def home():
    return HTMLResponse("""<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Anthony Job Radar</title>
<style>
:root{
  --forest:#123524;--forest-2:#1f5a3c;--emerald:#2f8f57;--lime:#b7d94b;--sun:#f6d84a;
  --cream:#fffdf3;--paper:#ffffff;--ink:#173126;--muted:#6e7d73;--line:#e6eadc;
  --soft-green:#eef8ee;--soft-yellow:#fff8cf;--shadow:0 14px 36px rgba(32,73,48,.10);
  --shadow-soft:0 8px 22px rgba(32,73,48,.07)
}
*{box-sizing:border-box}
body{
  margin:0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:var(--ink);
  background:
    radial-gradient(circle at 8% 0%,rgba(183,217,75,.32),transparent 31%),
    radial-gradient(circle at 92% 4%,rgba(47,143,87,.18),transparent 28%),
    linear-gradient(180deg,#fffef8 0%,#f5f8e9 48%,#edf6ee 100%);
  min-height:100vh
}
.wrap{max-width:1340px;margin:auto;padding:28px 22px 46px}
.top{
  position:relative;overflow:hidden;display:flex;justify-content:space-between;gap:24px;align-items:center;
  padding:26px 28px;border-radius:26px;
  background:linear-gradient(125deg,var(--forest) 0%,var(--forest-2) 62%,#5e7f2d 100%);
  box-shadow:0 18px 42px rgba(25,70,43,.18);color:#fff
}
.top:after{content:"";position:absolute;right:-70px;top:-95px;width:260px;height:260px;border-radius:50%;background:rgba(246,216,74,.17)}
.brand{position:relative;z-index:1}
.eyebrow{display:inline-flex;align-items:center;gap:7px;padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.12);font-size:12px;font-weight:750;color:#f7ef9b;margin-bottom:10px}
.brand h1{margin:0;font-size:34px;letter-spacing:-.035em;color:#fff}
.brand p{margin:7px 0 0;color:#dcebdc;font-size:15px}
.btn{
  border:1px solid var(--line);background:#fff;color:var(--ink);border-radius:12px;padding:10px 14px;cursor:pointer;
  text-decoration:none;display:inline-flex;align-items:center;justify-content:center;font-weight:720;box-shadow:var(--shadow-soft);transition:.2s ease
}
.btn:hover{transform:translateY(-1px);box-shadow:var(--shadow)}
.btn.primary{background:linear-gradient(135deg,var(--sun),#f4c93d);color:#294116;border-color:#eed03f}
.top .btn.primary{position:relative;z-index:1;min-width:128px;font-size:14px}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:18px 0}
.stat{
  position:relative;overflow:hidden;background:rgba(255,255,255,.93);border:1px solid rgba(230,234,220,.95);
  padding:18px 18px 17px;border-radius:19px;box-shadow:var(--shadow-soft)
}
.stat:before{content:"";position:absolute;inset:0 auto 0 0;width:5px;background:linear-gradient(180deg,var(--emerald),var(--sun))}
.stat b{font-size:29px;display:block;letter-spacing:-.03em}.stat span{color:var(--muted);font-size:13px;font-weight:650}
.controls{
  display:flex;gap:10px;flex-wrap:wrap;align-items:center;background:rgba(255,255,255,.92);padding:13px;
  border:1px solid var(--line);border-radius:18px;box-shadow:var(--shadow-soft)
}
.controls input,.controls select{background:#fffef8;color:var(--ink);border:1px solid #dfe7d6;padding:10px 12px;border-radius:11px;min-height:42px;outline:none}
.controls input{min-width:250px;flex:1}
.controls input:focus,.controls select:focus{border-color:var(--emerald);box-shadow:0 0 0 4px rgba(47,143,87,.10)}
.layout{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:18px;margin-top:18px}
.jobs{display:grid;gap:13px}
.card{
  position:relative;background:rgba(255,255,255,.95);border:1px solid #e4eadc;border-radius:20px;padding:19px;
  box-shadow:var(--shadow-soft);transition:.2s ease;overflow:hidden
}
.card:after{content:"";position:absolute;left:0;right:0;top:0;height:3px;background:linear-gradient(90deg,var(--emerald),var(--lime),var(--sun))}
.card:hover{transform:translateY(-2px);box-shadow:var(--shadow)}
.row{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.title{font-weight:850;font-size:18px;line-height:1.28;letter-spacing:-.01em}
.meta{color:var(--muted);font-size:13px;margin:6px 0 11px}.chips{display:flex;gap:7px;flex-wrap:wrap}
.chip{font-size:12px;padding:5px 9px;border-radius:999px;background:var(--soft-green);color:#28633f;border:1px solid #d4ead4;font-weight:650}
.score{font-weight:850;font-size:14px;min-width:80px;text-align:center;padding:8px 10px;border-radius:999px;border:1px solid var(--line);white-space:nowrap}
.excellent{color:#185d31;background:#e9f7e8;border-color:#bde1bd}.strong{color:#536614;background:#f5f9db;border-color:#dde9a8}
.possible{color:#7a5d08;background:var(--soft-yellow);border-color:#f0df8a}.stretch{color:#7e6131;background:#fff3df;border-color:#eed5ae}
.actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:15px}
.side{
  background:linear-gradient(180deg,#173a29,#234d35);color:#fff;border-radius:22px;padding:18px;height:max-content;
  position:sticky;top:15px;box-shadow:0 15px 34px rgba(29,68,44,.17)
}
.side h3{margin:0 0 9px;font-size:16px;color:#fff}.side .small{color:#cadccb}
.source{display:flex;justify-content:space-between;color:#eef7df;text-decoration:none;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.11);font-weight:650}
.source:hover{color:#ffe96c}.small{font-size:12px;color:var(--muted);line-height:1.5}
.empty{padding:48px 20px;text-align:center;color:var(--muted);background:rgba(255,255,255,.78);border:1px dashed #d9e3cf;border-radius:20px}
#updated{margin-left:auto;background:#f8f8ea;padding:7px 10px;border-radius:999px}
@media(max-width:900px){.layout{grid-template-columns:1fr}.side{position:static}.stats{grid-template-columns:1fr 1fr}}
@media(max-width:590px){.wrap{padding:16px 12px 28px}.top{padding:22px 18px;align-items:flex-start;flex-direction:column}.brand h1{font-size:29px}.stats{grid-template-columns:1fr 1fr}.controls input{min-width:100%}.btn{padding:9px 11px}.stat{padding:15px}}
</style></head><body><div class="wrap">
<div class="top"><div class="brand"><div class="eyebrow">● LIVE CAREER RADAR</div><h1>Anthony Job Radar</h1><p>High-fit roles first. Tailored CV ready. You review and apply.</p></div><button class="btn primary">Scan now</button></div>
<div class="stats"><div class="stat"><b id="excellent">0</b><span>Excellent fit</span></div><div class="stat"><b id="strong">0</b><span>Strong fit</span></div><div class="stat"><b id="applied">0</b><span>Marked applied</span></div><div class="stat"><b id="total">0</b><span>Live matches</span></div></div>
<div class="controls"><input id="q" placeholder="Search title, company, skill…" oninput="render()"><select id="min" onchange="render()"><option value="55">55%+ fit</option><option value="68" selected>68%+ strong</option><option value="82">82%+ excellent</option></select><select id="status" onchange="render()"><option value="">All statuses</option><option value="new">New</option><option value="saved">Saved</option><option value="applied">Applied</option><option value="ignored">Ignored</option></select><span class="small" id="updated"></span></div>
<div class="layout"><main class="jobs" id="jobs"><div class="empty">Scanning live job feeds…</div></main>
<aside class="side"><h3>Source launcher</h3><p class="small">Live API feeds are scanned automatically. These additional channels open directly for listings that block automated ingestion.</p>
<a class="source" target="_blank" href="https://www.linkedin.com/jobs/search/?keywords=AI%20Automation&location=Kenya">LinkedIn ↗</a>
<a class="source" target="_blank" href="https://www.brightermonday.co.ke/jobs">BrighterMonday ↗</a>
<a class="source" target="_blank" href="https://www.fuzu.com/kenya/job">Fuzu ↗</a>
<a class="source" target="_blank" href="https://www.myjobmag.co.ke/">MyJobMag Kenya ↗</a>
<a class="source" target="_blank" href="https://www.careerpointkenya.co.ke/jobs/">Career Point Kenya ↗</a>
<a class="source" target="_blank" href="https://wellfound.com/jobs">Wellfound ↗</a>
<a class="source" target="_blank" href="https://remoteok.com/">Remote OK ↗</a>
<a class="source" target="_blank" href="https://remotive.com/remote-jobs">Remotive ↗</a>
<h3 style="margin-top:18px">Best-fit tracks</h3><div class="small">AI automation · AI/LLM evaluation · Full-stack/backend · Applications & systems integration · IT support · Telecom · SQL/data · Technical training</div></aside></div></div>
<script>
let all=[];
const state=JSON.parse(localStorage.getItem("jobRadarState")||"{}");

function setState(id,s){
  state[id]=s;
  localStorage.setItem("jobRadarState",JSON.stringify(state));
  render();
}
function fitClass(b){
  return b.startsWith("Excellent")?"excellent":b.startsWith("Strong")?"strong":b.startsWith("Possible")?"possible":"stretch";
}
function esc(s){
  const d=document.createElement("div");
  d.textContent=s||"";
  return d.innerHTML;
}
async function showPack(id){
  try{
    const r=await fetch("/api/application/"+encodeURIComponent(id));
    if(!r.ok) throw new Error("Could not build application pack");
    const p=await r.json();
    const gaps=(p.gaps||[]).length?("\n\nCHECK BEFORE SUBMITTING: "+p.gaps.join(", ")):"";
    const answers=Object.entries(p.answers||{}).map(([q,a])=>"\n• "+q+"\n  "+a).join("");
    alert("APPLICATION PACK\n\nResume track: "+p.track+"\n\nTAILORED SUMMARY\n"+p.summary+"\n\nCOVER NOTE\n"+p.cover_letter+"\n\nLIKELY FORM ANSWERS"+answers+gaps);
  }catch(e){ alert(e.message); }
}
function render(){
  const q=(document.getElementById("q").value||"").toLowerCase();
  const min=Number(document.getElementById("min").value||68);
  const sf=document.getElementById("status").value;
  const jobs=all.filter(j =>
    j.score>=min &&
    (!q || ((j.title||"")+" "+(j.company||"")+" "+(j.description||"")).toLowerCase().includes(q)) &&
    (!sf || (state[j.id]||"new")===sf)
  );
  const root=document.getElementById("jobs");
  if(!jobs.length){
    root.innerHTML='<div class="empty">No jobs match these filters. Try 55%+ fit or press Scan now.</div>';
  } else {
    root.innerHTML=jobs.map(j => {
      const chips=(j.matched||[]).slice(0,7).map(x=>'<span class="chip">'+esc(x)+'</span>').join("");
      const id=encodeURIComponent(j.id);
      return '<section class="card">'+
        '<div class="row"><div><div class="title">'+esc(j.title)+'</div>'+
        '<div class="meta">'+esc(j.company)+' · '+esc(j.location||"Remote")+' · '+esc(j.source)+'</div></div>'+
        '<div class="score '+fitClass(j.band)+'">'+j.score+'%</div></div>'+
        '<div class="chips">'+chips+'</div>'+
        '<div class="actions">'+
          '<a class="btn primary" target="_blank" rel="noopener" href="'+esc(j.url)+'" data-state-id="'+esc(j.id)+'">Apply ↗</a>'+
          '<a class="btn" href="/api/cv/'+id+'.pdf">Tailored CV ↓</a>'+
          '<button class="btn pack" data-job-id="'+esc(j.id)+'">Application pack</button>'+
          '<button class="btn statebtn" data-job-id="'+esc(j.id)+'" data-state="saved">Save</button>'+
          '<button class="btn statebtn" data-job-id="'+esc(j.id)+'" data-state="applied">Applied ✓</button>'+
          '<button class="btn statebtn" data-job-id="'+esc(j.id)+'" data-state="ignored">Ignore</button>'+
          '<span class="small">'+esc(state[j.id]||"new")+'</span>'+
        '</div></section>';
    }).join("");
  }
  root.querySelectorAll(".pack").forEach(b=>b.addEventListener("click",()=>showPack(b.dataset.jobId)));
  root.querySelectorAll(".statebtn").forEach(b=>b.addEventListener("click",()=>setState(b.dataset.jobId,b.dataset.state)));
  root.querySelectorAll("[data-state-id]").forEach(a=>a.addEventListener("click",()=>setState(a.dataset.stateId,"saved")));
  document.getElementById("applied").textContent=Object.values(state).filter(x=>x==="applied").length;
}
async function loadJobs(force=false){
  const u=document.getElementById("updated");
  u.textContent="Scanning live sources…";
  try{
    const r=await fetch("/api/jobs?min_score=35&refresh="+(force?1:0),{cache:"no-store"});
    if(!r.ok) throw new Error("Job scan returned "+r.status);
    const d=await r.json();
    all=d.jobs||[];
    document.getElementById("total").textContent=all.length;
    document.getElementById("excellent").textContent=all.filter(x=>x.score>=82).length;
    document.getElementById("strong").textContent=all.filter(x=>x.score>=68&&x.score<82).length;
    u.textContent="Updated "+new Date(d.updated_at).toLocaleString();
    render();
  }catch(e){
    u.textContent="Scan error";
    document.getElementById("jobs").innerHTML='<div class="empty"><b>Job feed error.</b><br>'+esc(e.message)+'<br><br>Press Scan now to retry.</div>';
  }
}
document.getElementById("q").addEventListener("input",render);
document.getElementById("min").addEventListener("change",render);
document.getElementById("status").addEventListener("change",render);
document.querySelector(".top .primary").addEventListener("click",()=>loadJobs(true));
loadJobs(false);
setInterval(()=>loadJobs(false),900000);
</script></body></html>""")
