import * as fs   from 'fs';
import * as path from 'path';
import { CoverageDashboardModel, ModuleCoverage, CoverageGrade, CoverageSnapshot } from '../CoverageSchema';

const OUT_DIR = path.join(process.cwd(), 'coverage');

// ── Colour helpers ─────────────────────────────────────────────────────────────

function gradeColor(g: CoverageGrade): string {
  return g === 'GREEN' ? '#22c55e' : g === 'AMBER' ? '#f59e0b' : '#ef4444';
}

function gradeBg(g: CoverageGrade): string {
  return g === 'GREEN' ? '#dcfce7' : g === 'AMBER' ? '#fef3c7' : '#fee2e2';
}

function gradeText(g: CoverageGrade): string {
  return g === 'GREEN' ? '#166534' : g === 'AMBER' ? '#92400e' : '#991b1b';
}

function bar(pct: number, grade: CoverageGrade): string {
  return `<div class="bar-wrap">
    <div class="bar" style="width:${pct}%;background:${gradeColor(grade)}"></div>
  </div>`;
}

function badge(pct: number, grade: CoverageGrade): string {
  return `<span class="cov-badge" style="background:${gradeBg(grade)};color:${gradeText(grade)}">${pct}%</span>`;
}

function trendArrow(dir: 'UP' | 'DOWN' | 'STABLE', growth: number): string {
  if (dir === 'UP')   return `<span style="color:#22c55e">▲ +${growth}%</span>`;
  if (dir === 'DOWN') return `<span style="color:#ef4444">▼ ${growth}%</span>`;
  return `<span style="color:#64748b">● Stable</span>`;
}

function sparkline(history: CoverageSnapshot[]): string {
  if (history.length < 2) return '<span style="color:#94a3b8;font-size:.8rem">No trend data yet</span>';
  const w = 240, h = 48, pad = 6;
  const vals = history.map(h => h.overallCoverage);
  const min  = Math.min(...vals);
  const max  = Math.max(...vals) || 100;
  const xs   = vals.map((_, i) => pad + (i / (vals.length - 1)) * (w - pad * 2));
  const ys   = vals.map(v => h - pad - ((v - min) / ((max - min) || 1)) * (h - pad * 2));
  const d    = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
  return `<svg width="${w}" height="${h}" style="display:block">
    <path d="${d}" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linejoin="round"/>
    <circle cx="${xs.at(-1)!.toFixed(1)}" cy="${ys.at(-1)!.toFixed(1)}" r="4" fill="#6366f1"/>
  </svg>`;
}

// ── CSS ────────────────────────────────────────────────────────────────────────

const CSS = `
:root{--bg:#f8fafc;--card:#fff;--border:#e2e8f0;--text:#1e293b;--muted:#64748b;
  --accent:#6366f1;--radius:10px;--shadow:0 1px 4px rgba(0,0,0,.08)}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',system-ui,sans-serif;background:var(--bg);color:var(--text);font-size:14px}
h1{font-size:1.5rem;font-weight:700}
h2{font-size:1rem;font-weight:600;margin-bottom:12px}
.header{background:linear-gradient(135deg,#0f172a,#1e3a5f);color:#fff;padding:20px 32px;
  display:flex;align-items:center;gap:16px}
.header-right{margin-left:auto;text-align:right;font-size:.8rem;opacity:.8;line-height:1.6}
.nav{background:#1e293b;display:flex;gap:2px;padding:0 32px;overflow-x:auto}
.nav a{color:#94a3b8;padding:10px 16px;font-size:.85rem;border-bottom:2px solid transparent;
  cursor:pointer;white-space:nowrap}
.nav a.active,.nav a:hover{color:#fff;border-color:#6366f1}
.main{padding:24px 32px;max-width:1600px;margin:0 auto}
.section{display:none}.section.active{display:block}
.card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);
  padding:20px;box-shadow:var(--shadow);margin-bottom:16px}
.grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:20px}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px}
.stat{text-align:center;padding:16px;background:var(--card);border:1px solid var(--border);
  border-radius:var(--radius);box-shadow:var(--shadow)}
.stat .val{font-size:2rem;font-weight:700;line-height:1}
.stat .lbl{font-size:.72rem;color:var(--muted);margin-top:4px;text-transform:uppercase;letter-spacing:.05em}
table{width:100%;border-collapse:collapse;font-size:.84rem}
th{background:#f1f5f9;padding:9px 12px;text-align:left;font-weight:600;
  border-bottom:2px solid var(--border);white-space:nowrap}
td{padding:8px 12px;border-bottom:1px solid var(--border);vertical-align:middle}
tr:hover td{background:#f8fafc}
.bar-wrap{background:#e5e7eb;border-radius:4px;height:7px;overflow:hidden;min-width:80px}
.bar{height:100%;border-radius:4px}
.cov-badge{display:inline-block;padding:2px 9px;border-radius:20px;font-size:.75rem;font-weight:700}
.rank-card{display:flex;align-items:center;gap:12px;padding:10px 0;
  border-bottom:1px solid var(--border)}
.rank-card:last-child{border:none}
.rank-num{font-size:1.4rem;font-weight:700;color:var(--muted);min-width:28px}
.rank-name{font-weight:600;flex:1}
.module-name{font-weight:600;color:#1e293b}
.trend-row{display:flex;align-items:center;gap:12px;padding:8px 0;
  border-bottom:1px solid var(--border)}
.trend-row:last-child{border:none}
.trend-date{font-size:.8rem;color:var(--muted);min-width:90px}
@media(max-width:900px){.grid-4{grid-template-columns:1fr 1fr}.grid-2{grid-template-columns:1fr}}
`;

const JS = `
function show(id){
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.nav a').forEach(a=>a.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelector('[data-sec="'+id+'"]').classList.add('active');
}
function filter(q){
  const v=q.toLowerCase();
  document.querySelectorAll('#mod-table tbody tr').forEach(tr=>{
    tr.style.display=tr.textContent.toLowerCase().includes(v)?'':'none';
  });
}
window.onload=()=>show('sec-overview');
`;

// ── Section builders ───────────────────────────────────────────────────────────

function buildOverview(m: CoverageDashboardModel): string {
  const g = m.overallGrade;
  return `
<div class="grid-4">
  <div class="stat"><div class="val" style="color:${gradeColor(g)}">${m.overallCoverage}%</div><div class="lbl">Overall Coverage</div></div>
  <div class="stat"><div class="val" style="color:#6366f1">${m.totalModules}</div><div class="lbl">Modules</div></div>
  <div class="stat"><div class="val" style="color:#0ea5e9">${m.automatedScreens}/${m.totalScreens}</div><div class="lbl">Screens Automated</div></div>
  <div class="stat"><div class="val" style="color:#8b5cf6">${m.totalTests}</div><div class="lbl">Total Tests</div></div>
</div>

<div class="grid-2">
  <div class="card">
    <h2>Coverage Trend</h2>
    ${sparkline(m.trend.history)}
    <div style="margin-top:10px;display:flex;gap:24px;font-size:.85rem">
      <span>Current: <strong>${m.trend.current}%</strong></span>
      <span>Previous: <strong>${m.trend.previous?.overallCoverage ?? 'N/A'}%</strong></span>
      <span>Growth: ${trendArrow(m.trend.direction, m.trend.growthPct)}</span>
    </div>
  </div>
  <div class="card">
    <h2>Test Distribution</h2>
    <table>
      <thead><tr><th>Suite</th><th>Count</th><th>Share</th></tr></thead>
      <tbody>
        ${buildTestDistribution(m.modules)}
      </tbody>
    </table>
  </div>
</div>

<div class="card">
  <h2>Module Coverage Overview</h2>
  <table>
    <thead>
      <tr>
        <th>Module</th><th>Screens</th><th>Screen Cov.</th>
        <th>Workflows</th><th>Wf Cov.</th>
        <th>Smoke</th><th>Sanity</th><th>Regression</th><th>E2E</th>
        <th>Overall</th>
      </tr>
    </thead>
    <tbody>
      ${m.modules.map(mod => buildModuleRow(mod)).join('')}
    </tbody>
  </table>
</div>`;
}

function buildTestDistribution(modules: ModuleCoverage[]): string {
  const smoke      = modules.reduce((s, m) => s + m.smokeTests, 0);
  const sanity     = modules.reduce((s, m) => s + m.sanityTests, 0);
  const regression = modules.reduce((s, m) => s + m.regressionTests, 0);
  const e2e        = modules.reduce((s, m) => s + m.e2eTests, 0);
  const total      = smoke + sanity + regression + e2e || 1;
  const row = (label: string, count: number, color: string) =>
    `<tr><td>${label}</td><td><strong>${count}</strong></td>
     <td><div class="bar-wrap"><div class="bar" style="width:${Math.round(count/total*100)}%;background:${color}"></div></div></td></tr>`;
  return row('Smoke',      smoke,      '#22c55e')
       + row('Sanity',     sanity,     '#6366f1')
       + row('Regression', regression, '#f59e0b')
       + row('E2E',        e2e,        '#0ea5e9');
}

function buildModuleRow(m: ModuleCoverage): string {
  return `<tr>
    <td class="module-name">${m.moduleName}</td>
    <td>${m.automatedScreens}/${m.totalScreens}</td>
    <td>${bar(m.screenCoverage, m.screenGrade)} ${badge(m.screenCoverage, m.screenGrade)}</td>
    <td>${m.automatedWorkflows}/${m.totalWorkflows}</td>
    <td>${bar(m.workflowCoverage, m.workflowGrade)} ${badge(m.workflowCoverage, m.workflowGrade)}</td>
    <td>${m.smokeTests}</td>
    <td>${m.sanityTests}</td>
    <td>${m.regressionTests}</td>
    <td>${m.e2eTests}</td>
    <td>${bar(m.overallCoverage, m.overallGrade)} ${badge(m.overallCoverage, m.overallGrade)}</td>
  </tr>`;
}

function buildModuleDetail(modules: ModuleCoverage[]): string {
  return `
<input type="text" placeholder="Filter modules…" oninput="filter(this.value)"
  style="padding:7px 14px;border:1px solid var(--border);border-radius:6px;
  margin-bottom:16px;width:280px;font-size:.85rem">
<table id="mod-table">
  <thead>
    <tr>
      <th>Module</th><th>Pages</th><th>Workflows</th><th>Validators</th>
      <th>Repos</th><th>Smoke</th><th>Sanity</th><th>Regression</th><th>E2E</th>
      <th>Screen%</th><th>Workflow%</th><th>Overall%</th>
    </tr>
  </thead>
  <tbody>
    ${modules.map(m => `<tr>
      <td class="module-name">${m.moduleName}</td>
      <td>${m.totalScreens}</td>
      <td>${m.automatedWorkflows}</td>
      <td>${m.validators}</td>
      <td>${m.repositories}</td>
      <td>${m.smokeTests}</td>
      <td>${m.sanityTests}</td>
      <td>${m.regressionTests}</td>
      <td>${m.e2eTests}</td>
      <td>${badge(m.screenCoverage, m.screenGrade)}</td>
      <td>${badge(m.workflowCoverage, m.workflowGrade)}</td>
      <td>${badge(m.overallCoverage, m.overallGrade)}</td>
    </tr>`).join('')}
  </tbody>
</table>`;
}

function buildRankings(m: CoverageDashboardModel): string {
  const rankCard = (mod: ModuleCoverage, rank: number) => `
  <div class="rank-card">
    <span class="rank-num">#${rank}</span>
    <span class="rank-name">${mod.moduleName}</span>
    ${bar(mod.overallCoverage, mod.overallGrade)}
    ${badge(mod.overallCoverage, mod.overallGrade)}
  </div>`;

  return `
<div class="grid-2">
  <div class="card">
    <h2>🏆 Top 5 Best Covered</h2>
    ${m.topCovered.map((mod, i) => rankCard(mod, i + 1)).join('')}
  </div>
  <div class="card">
    <h2>⚠️ Top 5 Least Covered</h2>
    ${m.leastCovered.map((mod, i) => rankCard(mod, i + 1)).join('')}
  </div>
</div>`;
}

function buildTrend(m: CoverageDashboardModel): string {
  if (m.trend.history.length === 0) {
    return '<div class="card"><p style="color:var(--muted)">No historical data yet. Run again tomorrow to see trends.</p></div>';
  }
  return `
<div class="card">
  <h2>Coverage History</h2>
  <table>
    <thead>
      <tr><th>Date</th><th>Overall%</th><th>Modules</th><th>Tests</th><th>Screens</th><th>Trend</th></tr>
    </thead>
    <tbody>
      ${m.trend.history.slice().reverse().map((snap, i, arr) => {
        const prev = arr[i + 1];
        const delta = prev ? snap.overallCoverage - prev.overallCoverage : 0;
        const arrow = delta > 0 ? `<span style="color:#22c55e">▲ +${delta.toFixed(1)}%</span>`
                    : delta < 0 ? `<span style="color:#ef4444">▼ ${delta.toFixed(1)}%</span>`
                    : `<span style="color:#94a3b8">●</span>`;
        return `<tr>
          <td>${snap.date}</td>
          <td>${badge(snap.overallCoverage, snap.overallCoverage >= 90 ? 'GREEN' : snap.overallCoverage >= 70 ? 'AMBER' : 'RED')}</td>
          <td>${snap.totalModules}</td>
          <td>${snap.totalTests}</td>
          <td>${snap.automatedScreens}/${snap.totalScreens}</td>
          <td>${arrow}</td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>
</div>`;
}

// ── Main generator ─────────────────────────────────────────────────────────────

export class CoverageReportGenerator {

  static generate(model: CoverageDashboardModel): { htmlPath: string; jsonPath: string } {
    fs.mkdirSync(OUT_DIR, { recursive: true });

    const jsonPath = path.join(OUT_DIR, 'coverage-report.json');
    fs.writeFileSync(jsonPath, JSON.stringify(model, null, 2));

    const htmlPath = path.join(OUT_DIR, 'coverage-report.html');
    fs.writeFileSync(htmlPath, this.buildHtml(model));

    return { htmlPath, jsonPath };
  }

  private static buildHtml(m: CoverageDashboardModel): string {
    const gradeColor_ = gradeColor(m.overallGrade);
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>CBS Business Coverage Dashboard</title>
<style>${CSS}</style>
</head>
<body>

<div class="header">
  <div>
    <div style="font-size:.72rem;opacity:.65;margin-bottom:2px;letter-spacing:.08em">CBS DOMESTIC NG 10.2</div>
    <h1>Business Coverage Dashboard</h1>
    <div style="font-size:.82rem;margin-top:4px;opacity:.8">Automation Coverage Tracking — All Modules</div>
  </div>
  <div class="header-right">
    <div>Generated: ${m.generatedAt.replace('T', ' ').slice(0, 19)}</div>
    <div>Modules: ${m.totalModules} &nbsp;|&nbsp; Tests: ${m.totalTests}</div>
    <div style="margin-top:6px">
      <span style="background:${gradeColor_};color:#fff;padding:3px 14px;
        border-radius:20px;font-weight:700;font-size:.9rem">
        ${m.overallCoverage}% COVERAGE
      </span>
    </div>
  </div>
</div>

<nav class="nav">
  <a data-sec="sec-overview"  onclick="show('sec-overview')"  class="active">📊 Overview</a>
  <a data-sec="sec-modules"   onclick="show('sec-modules')">📦 Module Detail</a>
  <a data-sec="sec-rankings"  onclick="show('sec-rankings')">🏆 Rankings</a>
  <a data-sec="sec-trend"     onclick="show('sec-trend')">📈 Trend</a>
</nav>

<div class="main">
  <div class="section active" id="sec-overview">
    <h2 style="margin-bottom:16px">Executive Overview</h2>
    ${buildOverview(m)}
  </div>
  <div class="section" id="sec-modules">
    <h2 style="margin-bottom:16px">Module Detail</h2>
    <div class="card">${buildModuleDetail(m.modules)}</div>
  </div>
  <div class="section" id="sec-rankings">
    <h2 style="margin-bottom:16px">Module Rankings</h2>
    ${buildRankings(m)}
  </div>
  <div class="section" id="sec-trend">
    <h2 style="margin-bottom:16px">Historical Trend</h2>
    ${buildTrend(m)}
  </div>
</div>

<script>${JS}</script>
</body>
</html>`;
  }
}
