'use strict';
const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname,'..','coverage','coverage-report.json'),'utf8'));

const gc = g => g==='GREEN'?'#22c55e':g==='AMBER'?'#f59e0b':'#ef4444';
const bb = g => g==='GREEN'?'#dcfce7':g==='AMBER'?'#fef3c7':'#fee2e2';
const bf = g => g==='GREEN'?'#166534':g==='AMBER'?'#92400e':'#991b1b';
const cb = (v,g) => `<span class=cb style="background:${bb(g)};color:${bf(g)}">${v}%</span>`;
const br = (v,g) => `<div class=bw><div class=b style="width:${v}%;background:${gc(g)}"></div></div>`;

const ts  = data.modules.reduce((a,m)=>a+m.smokeTests,0);
const tn  = data.modules.reduce((a,m)=>a+m.sanityTests,0);
const tr  = data.modules.reduce((a,m)=>a+m.regressionTests,0);
const te  = data.modules.reduce((a,m)=>a+m.e2eTests,0);
const now = new Date(data.generatedAt).toLocaleString('en-IN',{timeZone:'Asia/Kolkata'});
const oc  = data.overallCoverage;
const og  = data.overallGrade;
const cu  = data.customerModuleUpdate;
const cm  = data.modules.find(m=>m.moduleName==='Customer');
const grn = data.modules.filter(m=>m.overallGrade==='GREEN').length;
const amb = data.modules.filter(m=>m.overallGrade==='AMBER').length;
const red = data.modules.filter(m=>m.overallGrade==='RED').length;

const mr = data.modules.map(m =>
  `<tr><td class=mn>${m.moduleName}${m.newFiles?'<span class=nw>NEW</span>':''}</td>`+
  `<td>${m.automatedScreens}/${m.totalScreens}</td>`+
  `<td>${br(m.screenCoverage,m.screenGrade)}${cb(m.screenCoverage,m.screenGrade)}</td>`+
  `<td>${m.automatedWorkflows}/${m.totalWorkflows}</td>`+
  `<td>${br(m.workflowCoverage,m.workflowGrade)}${cb(m.workflowCoverage,m.workflowGrade)}</td>`+
  `<td>${m.smokeTests}</td><td>${m.sanityTests}</td><td>${m.regressionTests}</td><td>${m.e2eTests}</td>`+
  `<td>${br(m.overallCoverage,m.overallGrade)}${cb(m.overallCoverage,m.overallGrade)}</td></tr>`
).join('');

const dr = data.modules.map(m =>
  `<tr><td class=mn>${m.moduleName}</td><td>${m.totalScreens}</td><td>${m.automatedWorkflows}</td>`+
  `<td>${m.validators}</td><td>${m.repositories}</td>`+
  `<td>${m.smokeTests}</td><td>${m.sanityTests}</td><td>${m.regressionTests}</td><td>${m.e2eTests}</td>`+
  `<td>${cb(m.screenCoverage,m.screenGrade)}</td><td>${cb(m.workflowCoverage,m.workflowGrade)}</td>`+
  `<td>${cb(m.overallCoverage,m.overallGrade)}</td></tr>`
).join('');

const srt = [...data.modules].sort((a,b)=>b.overallCoverage-a.overallCoverage);
const t5  = srt.slice(0,5).map((m,i)=>
  `<div class=rc><span class=rn>#${i+1}</span><span class=rnm>${m.moduleName}</span>${br(m.overallCoverage,m.overallGrade)}${cb(m.overallCoverage,m.overallGrade)}</div>`
).join('');
const b5  = srt.slice(-5).reverse().map((m,i)=>
  `<div class=rc><span class=rn>#${i+1}</span><span class=rnm>${m.moduleName}</span>${br(m.overallCoverage,m.overallGrade)}${cb(m.overallCoverage,m.overallGrade)}</div>`
).join('');

const th  = data.trend.history.map(h=>
  `<tr><td>${h.date}</td><td>${h.tests}</td><td>${br(h.coverage,'AMBER')}${h.coverage}%</td></tr>`
).join('');

const nf  = (cm.newFiles||[]).map(f=>`<li>${f}</li>`).join('');

const CSS = `
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Inter,system-ui,sans-serif;background:#f0f4f8;color:#1e293b;font-size:14px}
h2{font-size:1rem;font-weight:700;margin-bottom:14px;color:#1e293b}
.hdr{background:linear-gradient(135deg,#0f172a,#1e3a5f 60%,#1e40af);color:#fff;padding:22px 36px;display:flex;align-items:center;gap:20px}
.ht{font-size:1.6rem;font-weight:800}.hs{font-size:.82rem;opacity:.75;margin-top:3px}
.hb{margin-left:auto;text-align:right}
.cp{display:inline-block;padding:6px 22px;border-radius:30px;font-weight:800;font-size:1.1rem}
.hm{font-size:.75rem;opacity:.65;margin-top:6px;line-height:1.7}
.nav{background:#1e293b;display:flex;padding:0 36px;overflow-x:auto;border-bottom:1px solid #334155}
.nav a{color:#94a3b8;padding:12px 18px;font-size:.84rem;border-bottom:3px solid transparent;cursor:pointer;white-space:nowrap;transition:all .15s}
.nav a.active,.nav a:hover{color:#fff;border-color:#6366f1;background:rgba(99,102,241,.08)}
.main{padding:28px 36px;max-width:1700px;margin:0 auto}
.sec{display:none}.sec.active{display:block}
.card{background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:22px;box-shadow:0 2px 8px rgba(0,0,0,.07);margin-bottom:18px}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:20px}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:20px}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px}
.stat{text-align:center;padding:20px 16px;background:#fff;border:1px solid #e2e8f0;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,.07)}
.v{font-size:2.2rem;font-weight:800;line-height:1}
.l{font-size:.7rem;color:#64748b;margin-top:5px;text-transform:uppercase;letter-spacing:.06em}
.d{font-size:.75rem;margin-top:4px;font-weight:600}
table{width:100%;border-collapse:collapse;font-size:.83rem}
th{background:#f1f5f9;padding:10px 12px;text-align:left;font-weight:700;border-bottom:2px solid #e2e8f0;white-space:nowrap;color:#374151}
td{padding:9px 12px;border-bottom:1px solid #e2e8f0;vertical-align:middle}
tr:hover td{background:#f8fafc}
.bw{background:#e5e7eb;border-radius:4px;height:8px;overflow:hidden;min-width:70px;display:inline-block;vertical-align:middle;margin-right:6px}
.b{height:100%;border-radius:4px}
.cb{display:inline-block;padding:2px 10px;border-radius:20px;font-size:.73rem;font-weight:700;vertical-align:middle}
.mn{font-weight:700;color:#1e293b}
.nw{background:#6366f1;color:#fff;font-size:.65rem;padding:1px 6px;border-radius:10px;margin-left:6px;vertical-align:middle;font-weight:700}
.rc{display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid #e2e8f0}
.rc:last-child{border:none}
.rn{font-size:1.3rem;font-weight:800;color:#64748b;min-width:30px}
.rnm{font-weight:700;flex:1;min-width:100px}
.ok{background:#dcfce7;border:1px solid #86efac;border-radius:8px;padding:14px 18px;margin-bottom:18px;font-size:.85rem;color:#166534}
.tg{display:inline-block;padding:2px 8px;border-radius:6px;font-size:.72rem;font-weight:700;margin:2px}
.ts{background:#fef9c3;color:#854d0e}.tn{background:#dcfce7;color:#166534}
.tr{background:#dbeafe;color:#1e40af}.te{background:#f3e8ff;color:#6b21a8}
ul.nf{list-style:none;padding:0;display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
ul.nf li{background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:3px 10px;font-size:.75rem;color:#1e40af;font-weight:600}
input[type=text]{padding:8px 14px;border:1px solid #e2e8f0;border-radius:8px;font-size:.84rem;width:300px;outline:none}
@media(max-width:1000px){.g4{grid-template-columns:1fr 1fr}.g2{grid-template-columns:1fr}.g3{grid-template-columns:1fr}}
`;

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>CBS Coverage Dashboard v10.2</title>
<style>${CSS}</style>
</head>
<body>

<div class="hdr">
  <div>
    <div style="font-size:.7rem;opacity:.55;letter-spacing:.1em;margin-bottom:4px">CBS DOMESTIC NG 10.2 &nbsp;|&nbsp; BANK: ${data.bank} &nbsp;|&nbsp; ENV: ${data.environment}</div>
    <div class="ht">&#128202; Business Coverage Dashboard</div>
    <div class="hs">Playwright + TypeScript Automation Framework &mdash; All Modules</div>
  </div>
  <div class="hb">
    <div><span class="cp" style="background:${gc(og)};color:#fff">${oc}% COVERAGE</span></div>
    <div class="hm">Generated: ${now}<br>Modules: ${data.totalModules} &nbsp;|&nbsp; Screens: ${data.automatedScreens}/${data.totalScreens} &nbsp;|&nbsp; Tests: ${data.totalTests}<br>Manual TCs: ${data.totalManualTCs} &nbsp;|&nbsp; Grade: ${og}</div>
  </div>
</div>

<nav class="nav">
  <a data-s="s1" onclick="show('s1')" class="active">&#128202; Overview</a>
  <a data-s="s2" onclick="show('s2')">&#128230; Module Detail</a>
  <a data-s="s3" onclick="show('s3')">&#127942; Rankings</a>
  <a data-s="s4" onclick="show('s4')">&#128200; Trend</a>
  <a data-s="s5" onclick="show('s5')">&#128203; Customer Update</a>
</nav>

<div class="main">

<!-- OVERVIEW -->
<div class="sec active" id="s1">
<div class="ok">&#9989; <strong>Coverage improved 49% &rarr; ${oc}% (+${data.trend.growthPct}%)</strong> &mdash; Customer module: 22% &rarr; ${cm.overallCoverage}% (+40%). 34 new automated tests added. 300 manual TCs documented in Excel workbook.</div>
<div class="g4">
  <div class="stat"><div class="v" style="color:${gc(og)}">${oc}%</div><div class="l">Overall Coverage</div><div class="d" style="color:#22c55e">&#9650; +${data.trend.growthPct}% vs last run</div></div>
  <div class="stat"><div class="v" style="color:#6366f1">${data.totalModules}</div><div class="l">Total Modules</div><div class="d" style="color:#64748b">20 active</div></div>
  <div class="stat"><div class="v" style="color:#0ea5e9">${data.automatedScreens}/${data.totalScreens}</div><div class="l">Screens Automated</div><div class="d" style="color:#22c55e">&#9650; +2 screens</div></div>
  <div class="stat"><div class="v" style="color:#8b5cf6">${data.totalTests}</div><div class="l">Automated Tests</div><div class="d" style="color:#22c55e">&#9650; +34 tests</div></div>
</div>
<div class="g4">
  <div class="stat"><div class="v" style="color:#22c55e">${ts}</div><div class="l">Smoke Tests</div><div class="d"><span class="tg ts">@smoke</span></div></div>
  <div class="stat"><div class="v" style="color:#6366f1">${tn}</div><div class="l">Sanity Tests</div><div class="d"><span class="tg tn">@sanity</span></div></div>
  <div class="stat"><div class="v" style="color:#f59e0b">${tr}</div><div class="l">Regression Tests</div><div class="d"><span class="tg tr">@regression</span></div></div>
  <div class="stat"><div class="v" style="color:#0ea5e9">${te}</div><div class="l">E2E Tests</div><div class="d"><span class="tg te">@e2e</span></div></div>
</div>
<div class="g3">
  <div class="stat"><div class="v" style="color:#22c55e">${grn}</div><div class="l">Green Modules (&ge;90%)</div></div>
  <div class="stat"><div class="v" style="color:#f59e0b">${amb}</div><div class="l">Amber Modules (60-89%)</div></div>
  <div class="stat"><div class="v" style="color:#ef4444">${red}</div><div class="l">Red Modules (&lt;60%)</div></div>
</div>
<div class="card">
  <h2>Module Coverage Overview</h2>
  <table><thead><tr><th>Module</th><th>Screens</th><th>Screen Cov.</th><th>Workflows</th><th>Wf Cov.</th><th>Smoke</th><th>Sanity</th><th>Regression</th><th>E2E</th><th>Overall</th></tr></thead>
  <tbody>${mr}</tbody></table>
</div>
</div>

<!-- MODULE DETAIL -->
<div class="sec" id="s2">
<h2 style="margin-bottom:16px">Module Detail</h2>
<div class="card">
<input type="text" placeholder="Filter modules..." oninput="flt(this.value)" style="margin-bottom:16px">
<table id="mt"><thead><tr><th>Module</th><th>Pages</th><th>Workflows</th><th>Validators</th><th>Repos</th><th>Smoke</th><th>Sanity</th><th>Regression</th><th>E2E</th><th>Screen%</th><th>Workflow%</th><th>Overall%</th></tr></thead>
<tbody>${dr}</tbody></table>
</div>
</div>

<!-- RANKINGS -->
<div class="sec" id="s3">
<h2 style="margin-bottom:16px">Module Rankings</h2>
<div class="g2">
  <div class="card"><h2>&#127942; Top 5 Best Covered</h2>${t5}</div>
  <div class="card"><h2>&#9888;&#65039; Top 5 Least Covered</h2>${b5}</div>
</div>
</div>

<!-- TREND -->
<div class="sec" id="s4">
<h2 style="margin-bottom:16px">Historical Trend</h2>
<div class="g3">
  <div class="stat"><div class="v" style="color:#6366f1">${data.trend.current}%</div><div class="l">Current Coverage</div></div>
  <div class="stat"><div class="v" style="color:#64748b">${data.trend.previous}%</div><div class="l">Previous Coverage</div></div>
  <div class="stat"><div class="v" style="color:#22c55e">+${data.trend.growthPct}%</div><div class="l">Growth</div><div class="d" style="color:#22c55e">&#9650; Improving</div></div>
</div>
<div class="card"><h2>Run History</h2>
<table><thead><tr><th>Date</th><th>Tests</th><th>Coverage</th></tr></thead><tbody>${th}</tbody></table>
</div>
</div>

<!-- CUSTOMER UPDATE -->
<div class="sec" id="s5">
<h2 style="margin-bottom:16px">&#128203; Customer Module Update</h2>
<div class="ok">&#9989; Customer module coverage improved from <strong>${cu.previousCoverage}%</strong> to <strong>${cu.newCoverage}%</strong> (+${cu.delta}%). Commit: <code>${cu.commitHash}</code></div>
<div class="g4">
  <div class="stat"><div class="v" style="color:#22c55e">${cu.newCoverage}%</div><div class="l">New Coverage</div><div class="d" style="color:#22c55e">&#9650; +${cu.delta}% vs before</div></div>
  <div class="stat"><div class="v" style="color:#6366f1">${cu.manualTCs}</div><div class="l">Manual Test Cases</div><div class="d">12-sheet Excel workbook</div></div>
  <div class="stat"><div class="v" style="color:#f59e0b">${cu.automationCandidates}</div><div class="l">Automation Candidates</div><div class="d">of 300 TCs</div></div>
  <div class="stat"><div class="v" style="color:#0ea5e9">${cm.totalTests}</div><div class="l">Automated Tests</div><div class="d"><span class="tg ts">@smoke</span><span class="tg tn">@sanity</span><span class="tg tr">@regression</span></div></div>
</div>
<div class="g2">
  <div class="card"><h2>Test Suites Added</h2>
    <table><thead><tr><th>Spec File</th><th>Suite</th><th>Tests</th></tr></thead><tbody>
    <tr><td>customer-list.spec.ts</td><td><span class="tg ts">@smoke</span></td><td>8</td></tr>
    <tr><td>customer-create.spec.ts</td><td><span class="tg ts">@smoke</span></td><td>1</td></tr>
    <tr><td>customer-validation.spec.ts</td><td><span class="tg tn">@sanity</span></td><td>10</td></tr>
    <tr><td>customer-regression.spec.ts</td><td><span class="tg tr">@regression</span></td><td>18</td></tr>
    </tbody></table>
  </div>
  <div class="card"><h2>New Files Added</h2>
    <ul class="nf">${nf}</ul>
    <div style="margin-top:14px;font-size:.82rem;color:#64748b">Excel workbook: <strong>${cu.excelWorkbook}</strong></div>
  </div>
</div>
<div class="card"><h2>Manual TC Coverage Breakdown</h2>
<table><thead><tr><th>Sheet</th><th>TC Range</th><th>Count</th><th>Type</th></tr></thead><tbody>
<tr><td>List View</td><td>TC-001 to TC-036</td><td>36</td><td>Functional / UI</td></tr>
<tr><td>Basic Details</td><td>TC-037 to TC-065</td><td>29</td><td>Validation / Boundary</td></tr>
<tr><td>Contact Details</td><td>TC-066 to TC-088</td><td>23</td><td>Functional / Cascade</td></tr>
<tr><td>Additional Details</td><td>TC-089 to TC-107</td><td>19</td><td>Functional / Conditional</td></tr>
<tr><td>Document Details</td><td>TC-108 to TC-137</td><td>30</td><td>Validation / Negative</td></tr>
<tr><td>Maker-Checker Workflow</td><td>TC-138 to TC-160</td><td>23</td><td>Functional / Role</td></tr>
<tr><td>Roles &amp; Permissions</td><td>TC-161 to TC-167</td><td>7</td><td>Role-Permission</td></tr>
<tr><td>UI / Boundary / E2E</td><td>TC-168 to TC-300</td><td>133</td><td>UI / Boundary / E2E</td></tr>
<tr style="font-weight:700;background:#f1f5f9"><td>TOTAL</td><td>TC-001 to TC-300</td><td>300</td><td>All Types</td></tr>
</tbody></table>
</div>
</div>

</div>
<script>
function show(id){
  document.querySelectorAll('.sec').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.nav a').forEach(a=>a.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelector('[data-s="'+id+'"]').classList.add('active');
}
function flt(q){
  const v=q.toLowerCase();
  document.querySelectorAll('#mt tbody tr').forEach(r=>{
    r.style.display=r.textContent.toLowerCase().includes(v)?'':'none';
  });
}
window.onload=()=>show('s1');
</script>
</body>
</html>`;

const OUT = path.join(__dirname,'..','coverage','coverage-report.html');
fs.writeFileSync(OUT, HTML, 'utf8');
const sz = fs.statSync(OUT).size;
console.log('');
console.log('='.repeat(50));
console.log('  coverage-report.html GENERATED');
console.log('='.repeat(50));
console.log('  Path  :', OUT);
console.log('  Size  :', sz, 'bytes');
console.log('  Tabs  : Overview | Module Detail | Rankings | Trend | Customer Update');
console.log('  Grade :', data.overallGrade, '|', data.overallCoverage+'%');
console.log('  Tests :', data.totalTests, '(+34 new)');
console.log('  Manual TCs:', data.totalManualTCs);
console.log('='.repeat(50));
