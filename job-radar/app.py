import asyncio, re, time
from datetime import datetime, timezone
import httpx
from fastapi import FastAPI
from fastapi.responses import HTMLResponse

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

async def background_scanner():
    while True:
        try:
            await scan(True)
        except Exception:
            pass
        await asyncio.sleep(1800)

@app.on_event("startup")
async def start_background_scanner():
    asyncio.create_task(background_scanner())

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
:root{--bg1:#f8fbff;--bg2:#eef4ff;--bg3:#f6f8fc;--panel:#ffffff;--text:#182230;--muted:#66758a;--line:#e3ebf5;--good:#16a34a;--warn:#d97706;--accent:#3b82f6;--accent2:#2563eb;--shadow:0 10px 30px rgba(16,24,40,.08);--shadow2:0 6px 18px rgba(16,24,40,.05)}
*{box-sizing:border-box}
body{margin:0;font-family:Inter,system-ui,Arial,sans-serif;color:var(--text);background:radial-gradient(circle at top left,rgba(59,130,246,.12),transparent 30%),radial-gradient(circle at top right,rgba(14,165,233,.10),transparent 25%),linear-gradient(180deg,var(--bg1),var(--bg2) 48%,var(--bg3));min-height:100vh}
.wrap{max-width:1320px;margin:auto;padding:30px 22px 44px}.top{display:flex;justify-content:space-between;gap:16px;align-items:center}.brand h1{margin:0;font-size:32px;letter-spacing:-.03em}.brand p{margin:6px 0;color:var(--muted);font-size:15px}
.btn{border:1px solid var(--line);background:#fff;color:var(--text);border-radius:12px;padding:10px 14px;cursor:pointer;text-decoration:none;display:inline-block;font-weight:650;box-shadow:var(--shadow2);transition:.2s ease}.btn:hover{transform:translateY(-1px);box-shadow:var(--shadow)}.btn.primary{background:linear-gradient(135deg,var(--accent),var(--accent2));color:#fff;border-color:transparent}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:22px 0 18px}.stat{background:rgba(255,255,255,.88);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.8);padding:18px;border-radius:18px;box-shadow:var(--shadow2)}.stat b{font-size:28px;display:block}.stat span{color:var(--muted);font-size:13px}
.controls{display:flex;gap:10px;flex-wrap:wrap;align-items:center;background:rgba(255,255,255,.88);backdrop-filter:blur(12px);padding:14px;border:1px solid rgba(255,255,255,.8);border-radius:18px;box-shadow:var(--shadow2)}.controls input,.controls select{background:#fff;color:var(--text);border:1px solid var(--line);padding:10px 12px;border-radius:12px;min-height:42px;outline:none}.controls input:focus,.controls select:focus{border-color:var(--accent);box-shadow:0 0 0 4px rgba(59,130,246,.12)}
.layout{display:grid;grid-template-columns:1fr 310px;gap:18px;margin-top:18px}.jobs{display:grid;gap:14px}.card{background:rgba(255,255,255,.92);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.85);border-radius:20px;padding:18px;box-shadow:var(--shadow2);transition:.2s ease}.card:hover{transform:translateY(-2px);box-shadow:var(--shadow)}
.row{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.title{font-weight:800;font-size:18px;line-height:1.3}.meta{color:var(--muted);font-size:13px;margin:6px 0 10px}.chips{display:flex;gap:7px;flex-wrap:wrap}.chip{font-size:12px;padding:5px 9px;border-radius:999px;background:#edf4ff;color:#2457a6;border:1px solid #d9e7ff;font-weight:600}
.score{font-weight:800;font-size:15px;min-width:78px;text-align:center;padding:8px 10px;border-radius:999px;background:#f8fafc;border:1px solid var(--line)}.excellent{color:#15803d;background:#ecfdf3;border-color:#bbf7d0}.strong{color:#0369a1;background:#eff6ff;border-color:#bfdbfe}.possible{color:#b45309;background:#fff7ed;border-color:#fed7aa}.stretch{color:#6d28d9;background:#f5f3ff;border-color:#ddd6fe}
.actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.side{background:rgba(255,255,255,.92);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.85);border-radius:20px;padding:18px;height:max-content;position:sticky;top:15px;box-shadow:var(--shadow2)}.side h3{margin-top:0}.source{display:block;color:#2457a6;text-decoration:none;padding:10px 0;border-bottom:1px solid var(--line);font-weight:600}.source:hover{color:var(--accent2)}.small{font-size:12px;color:var(--muted);line-height:1.5}.empty{padding:44px 20px;text-align:center;color:var(--muted);background:rgba(255,255,255,.7);border:1px dashed var(--line);border-radius:18px}#updated{margin-left:auto}
@media(max-width:850px){.stats{grid-template-columns:1fr 1fr}.layout{grid-template-columns:1fr}.side{position:static}}@media(max-width:560px){.stats{grid-template-columns:1fr}.top{flex-direction:column;align-items:flex-start}.brand h1{font-size:28px}}
</style></head><body><div class="wrap">
<div class="top"><div class="brand"><h1>Anthony Job Radar</h1><p>Best-fit jobs first. Review → tailor → apply.</p></div><button class="btn primary" onclick="loadJobs(true)">Scan now</button></div>
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
let all=[]; const state=JSON.parse(localStorage.getItem("jobRadarState")||"{}");
function setState(id,s){state[id]=s;localStorage.setItem("jobRadarState",JSON.stringify(state));render()}
function fitClass(b){return b.startsWith("Excellent")?"excellent":b.startsWith("Strong")?"strong":b.startsWith("Possible")?"possible":"stretch"}
function esc(s){return (s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;","'":"&#039;"}[m]))}
function pack(j){alert("APPLICATION PACK\\n\\nResume track: "+(j.title.toLowerCase().match(/ai|automation|agent|llm/)?"AI Automation / Agent":"Systems / Software / Data")+"\\n\\nLead with: "+(j.matched||[]).slice(0,6).join(", ")+"\\n\\nFit: "+j.band+" ("+j.score+"%).\\n\\nOpen Apply, then tailor your summary and top 4-6 bullets to this posting.");}
function render(){const q=document.getElementById("q").value.toLowerCase(),min=+document.getElementById("min").value,sf=document.getElementById("status").value;const jobs=all.filter(j=>j.score>=min&&(!q||(j.title+" "+j.company+" "+j.description).toLowerCase().includes(q))&&(!sf||(state[j.id]||"new")==sf));document.getElementById("jobs").innerHTML=jobs.length?jobs.map(j=>'<section class="card"><div class="row"><div><div class="title">'+esc(j.title)+'</div><div class="meta">'+esc(j.company)+' · '+esc(j.location||"Remote")+' · '+esc(j.source)+'</div></div><div class="score '+fitClass(j.band)+'">'+j.score+'%</div></div><div class="chips">'+(j.matched||[]).slice(0,7).map(x=>'<span class="chip">'+esc(x)+'</span>').join("")+'</div><div class="actions"><a class="btn primary" target="_blank" rel="noopener" href="'+j.url+'">Apply ↗</a><button class="btn pack" data-id="'+j.id+'">Application pack</button><button class="btn" onclick="setState(\\''+j.id+'\\',\\'saved\\')">Save</button><button class="btn" onclick="setState(\\''+j.id+'\\',\\'applied\\')">Applied ✓</button><button class="btn" onclick="setState(\\''+j.id+'\\',\\'ignored\\')">Ignore</button><span class="small">'+(state[j.id]||"new")+'</span></div></section>').join(""):'<div class="empty">No jobs match these filters.</div>';document.querySelectorAll(".pack").forEach(b=>b.onclick=()=>pack(all.find(x=>x.id===b.dataset.id)));document.getElementById("applied").textContent=Object.values(state).filter(x=>x==="applied").length;}
async function loadJobs(force=false){document.getElementById("updated").textContent="Scanning…";try{const r=await fetch("/api/jobs?min_score=35&refresh="+(force?1:0));const d=await r.json();all=d.jobs||[];document.getElementById("total").textContent=all.length;document.getElementById("excellent").textContent=all.filter(x=>x.score>=82).length;document.getElementById("strong").textContent=all.filter(x=>x.score>=68&&x.score<82).length;document.getElementById("updated").textContent="Updated "+new Date(d.updated_at).toLocaleString();render()}catch(e){document.getElementById("jobs").innerHTML='<div class="empty">Scan failed. Retry in a moment.</div>'}}
loadJobs();setInterval(()=>loadJobs(false),900000);
</script></body></html>""")
