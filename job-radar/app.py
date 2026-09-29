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
:root{--bg:#07111f;--panel:#0d1b2a;--text:#eef6ff;--muted:#91a7bd;--line:#20364d;--good:#39d98a;--warn:#ffcc66;--accent:#6ea8fe}
*{box-sizing:border-box}body{margin:0;font-family:Inter,system-ui,Arial;background:linear-gradient(180deg,#06101c,#0a1625);color:var(--text)}.wrap{max-width:1320px;margin:auto;padding:24px}.top{display:flex;justify-content:space-between;gap:16px;align-items:center}.brand h1{margin:0;font-size:28px}.brand p{margin:5px 0;color:var(--muted)}.btn{border:1px solid var(--line);background:#162a40;color:white;border-radius:10px;padding:10px 14px;cursor:pointer;text-decoration:none;display:inline-block}.btn.primary{background:var(--accent);color:#07111f;border-color:var(--accent);font-weight:700}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:20px 0}.stat{background:var(--panel);border:1px solid var(--line);padding:16px;border-radius:14px}.stat b{font-size:24px;display:block}.stat span{color:var(--muted);font-size:13px}.controls{display:flex;gap:10px;flex-wrap:wrap;background:var(--panel);padding:12px;border:1px solid var(--line);border-radius:14px}.controls input,.controls select{background:#091522;color:white;border:1px solid var(--line);padding:10px;border-radius:9px}.layout{display:grid;grid-template-columns:1fr 300px;gap:16px;margin-top:16px}.jobs{display:grid;gap:10px}.card{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:16px}.row{display:flex;justify-content:space-between;gap:12px}.title{font-weight:800;font-size:17px}.meta{color:var(--muted);font-size:13px;margin:4px 0 9px}.chips{display:flex;gap:6px;flex-wrap:wrap}.chip{font-size:12px;padding:4px 7px;border-radius:999px;background:#13283e;color:#bcd4eb}.score{font-weight:900;font-size:22px}.excellent{color:var(--good)}.strong{color:#74d7ff}.possible{color:var(--warn)}.stretch{color:#ff8f8f}.actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.side{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:15px;height:max-content;position:sticky;top:15px}.side h3{margin-top:0}.source{display:block;color:#bcd4eb;text-decoration:none;padding:8px;border-bottom:1px solid var(--line)}.small{font-size:12px;color:var(--muted)}.empty{padding:40px;text-align:center;color:var(--muted)}@media(max-width:850px){.stats{grid-template-columns:1fr 1fr}.layout{grid-template-columns:1fr}.side{position:static}}
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
