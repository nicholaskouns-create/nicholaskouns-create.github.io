#!/usr/bin/env python3
"""Audit live outbound links in research-engine.html. Standard library only."""
import concurrent.futures, datetime, html.parser, json, pathlib, sys, urllib.request, urllib.error, time

PAGE=pathlib.Path("research-engine.html")
OUT=pathlib.Path("link-audit-report.json")
class Links(html.parser.HTMLParser):
    def __init__(self):
        super().__init__(); self.urls=set()
    def handle_starttag(self, tag, attrs):
        d=dict(attrs)
        for key in ("href","data-preview"):
            u=d.get(key,"")
            if u.startswith("https://"): self.urls.add(u)
def check(url):
    headers={"User-Agent":"MathematicalCity-LinkAudit/1.0 (+GitHub Actions)","Accept":"text/html,application/json,*/*"}
    for attempt in range(3):
        try:
            req=urllib.request.Request(url,headers=headers,method="GET")
            with urllib.request.urlopen(req,timeout=22) as resp:
                body=resp.read(32768)
                status=resp.status
                return {"url":url,"status":status,"final_url":resp.url,"ok":200<=status<400,"bytes_sampled":len(body)}
        except urllib.error.HTTPError as e:
            if e.code in (429,500,502,503,504) and attempt<2:
                time.sleep(attempt+1);continue
            return {"url":url,"status":e.code,"ok":False,"error":str(e)}
        except Exception as e:
            if attempt<2:time.sleep(attempt+1);continue
            return {"url":url,"status":None,"ok":False,"error":str(e)}
def main():
    p=Links();p.feed(PAGE.read_text(encoding="utf-8"))
    urls=sorted(p.urls)
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        rows=sorted(pool.map(check,urls),key=lambda x:x["url"])
    report={"checked_at":datetime.datetime.now(datetime.timezone.utc).isoformat(),"source":str(PAGE),"total":len(rows),"passed":sum(r["ok"] for r in rows),"failed":sum(not r["ok"] for r in rows),"results":rows}
    OUT.write_text(json.dumps(report,indent=2)+"\n",encoding="utf-8")
    print(f'LIVE AUDIT: {report["passed"]}/{report["total"]} passed')
    for r in rows: print(("PASS" if r["ok"] else "FAIL"),r["status"],r["url"],r.get("error",""))
    return 1 if report["failed"] else 0
if __name__=="__main__":sys.exit(main())
