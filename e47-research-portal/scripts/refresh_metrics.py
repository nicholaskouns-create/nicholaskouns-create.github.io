#!/usr/bin/env python3
"""Read-only GitHub API collection; publishes only aggregate repository data."""
import os,json,datetime,urllib.request,urllib.error,time
owner="nicholaskouns-create"
names=["E47-Kartekeya","nicholaskouns-create.github.io","E47-Foundry-Lifetime-Intersection","E47-Electroweak-Identities","auth-kernel","bi-a7-semimetal-proofs","Time","Genesis","Radar","tower","Identity","Kiliani"]
token=os.getenv("GH_TOKEN","")
def get(url):
    headers={"Accept":"application/vnd.github+json","User-Agent":"E47-Observatory/1.0","X-GitHub-Api-Version":"2022-11-28"}
    if token:headers["Authorization"]="Bearer "+token
    req=urllib.request.Request(url,headers=headers)
    try:
        with urllib.request.urlopen(req,timeout=18) as r:return json.load(r),None
    except urllib.error.HTTPError as e:return None,f"HTTP {e.code}"
    except Exception as e:return None,type(e).__name__
records=[];totals={"stars":0,"forks":0,"openIssues":0};traffic={}
for name in names:
    base=f"https://api.github.com/repos/{owner}/{name}"
    data,err=get(base)
    if not data:
        records.append({"name":name,"error":err});continue
    entry={"name":name,"stars":data.get("stargazers_count"),"forks":data.get("forks_count"),"openIssues":data.get("open_issues_count"),"pushedAt":data.get("pushed_at"),"url":data.get("html_url")}
    records.append(entry)
    for k,field in [("stars","stars"),("forks","forks"),("openIssues","openIssues")]:totals[k]+=entry[field] or 0
    t={}
    for kind in ("views","clones"):
        d,e=get(base+"/traffic/"+kind)
        if d and isinstance(d,dict):t[kind]={"count":d.get("count"),"uniques":d.get("uniques"),"period":"GitHub recent 14 days"}
        else:t[kind]={"status":"unavailable","reason":e}
    traffic[name]=t
out={"collectedAt":datetime.datetime.now(datetime.timezone.utc).isoformat(),"source":"GitHub REST API via scheduled repository workflow","repositories":records,"totals":totals,"traffic":traffic,"limitations":"Views/clones require sufficient permissions; missing values are unavailable, never zero. This is GitHub-only; Supabase snapshot remains historical."}
with open("e47-research-portal/traffic-live.json","w",encoding="utf-8") as f:json.dump(out,f,indent=2)
print("Saved public aggregate snapshot",len(records),"repositories")
