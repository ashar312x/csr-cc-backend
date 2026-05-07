import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller('log-viewer')
export class LogViewerController {
  @Get()
  getViewer(@Res() res: Response) {
    res.setHeader('Content-Type', 'text/html');
    res.send(HTML);
  }

  @Get('data')
  getLogs(@Res() res: Response) {
    const date = new Date().toISOString().split('T')[0];
    const logPath = path.join(process.cwd(), 'logs', `application-${date}.log`);
    try {
      const content = fs.readFileSync(logPath, 'utf-8');
      res.setHeader('Content-Type', 'text/plain');
      res.send(content);
    } catch {
      res.status(200).send('');
    }
  }
}

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Application Logs</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #0d1117; color: #c9d1d9; font-family: 'Courier New', monospace; font-size: 13px; }
#header { position: sticky; top: 0; background: #161b22; border-bottom: 1px solid #30363d; padding: 10px 16px; display: flex; align-items: center; gap: 12px; z-index: 10; flex-wrap: wrap; }
#header h1 { font-size: 16px; color: #58a6ff; margin-right: auto; }
button { background: #21262d; border: 1px solid #30363d; color: #c9d1d9; padding: 4px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; }
button:hover { background: #30363d; }
select, input { background: #21262d; border: 1px solid #30363d; color: #c9d1d9; padding: 4px 8px; border-radius: 6px; font-size: 12px; }
.dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #3fb950; margin-right: 4px; vertical-align: middle; }
.dot.paused { background: #f85149; }
#logs { padding: 8px; }
.entry { border: 1px solid #21262d; border-radius: 6px; margin-bottom: 4px; }
.entry-header { padding: 6px 10px; display: flex; align-items: center; gap: 8px; cursor: pointer; }
.entry-header:hover { background: #161b22; border-radius: 6px; }
.badge { padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold; flex-shrink: 0; }
.badge.info { background: #1f6feb33; color: #58a6ff; }
.badge.error { background: #f8514933; color: #f85149; }
.method { color: #d2a8ff; font-weight: bold; min-width: 50px; flex-shrink: 0; }
.url { color: #79c0ff; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.duration { color: #3fb950; font-size: 11px; flex-shrink: 0; }
.time { color: #8b949e; font-size: 11px; min-width: 90px; flex-shrink: 0; }
.err-msg { color: #f85149; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 300px; }
.entry-body { display: none; padding: 10px; background: #010409; border-top: 1px solid #21262d; border-radius: 0 0 6px 6px; }
.entry-body.open { display: block; }
pre { white-space: pre-wrap; word-break: break-all; color: #c9d1d9; font-size: 12px; line-height: 1.6; }
#empty { text-align: center; color: #8b949e; padding: 60px; }
</style>
</head>
<body>
<div id="header">
  <h1>&#128221; Application Logs</h1>
  <span id="status"><span class="dot"></span>Live</span>
  <select id="levelFilter" onchange="render()">
    <option value="">All levels</option>
    <option value="info">Info</option>
    <option value="error">Error</option>
  </select>
  <input id="search" placeholder="Filter by URL or text..." oninput="render()" style="width:200px">
  <button onclick="togglePause()" id="pauseBtn">Pause</button>
  <button onclick="scrollToBottom()">&#8595; Bottom</button>
  <span id="count" style="color:#8b949e;font-size:11px"></span>
</div>
<div id="logs"><div id="empty">Loading logs...</div></div>
<script>
let entries = [];
let paused = false;
let autoScroll = true;

function togglePause() {
  paused = !paused;
  const btn = document.getElementById('pauseBtn');
  document.getElementById('status').innerHTML = paused
    ? '<span class="dot paused"></span>Paused'
    : '<span class="dot"></span>Live';
  btn.textContent = paused ? 'Resume' : 'Pause';
}

function scrollToBottom() {
  window.scrollTo(0, document.body.scrollHeight);
}

function toggleEntry(header) {
  header.nextElementSibling.classList.toggle('open');
}

function formatTime(ts) {
  if (!ts) return '';
  try {
    const d = new Date(ts);
    return d.toTimeString().slice(0, 8) + '.' + String(d.getMilliseconds()).padStart(3, '0');
  } catch { return ts; }
}

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function render() {
  const level = document.getElementById('levelFilter').value;
  const search = document.getElementById('search').value.toLowerCase();
  const filtered = entries.filter(e => {
    if (level && e.level !== level) return false;
    if (search && !JSON.stringify(e).toLowerCase().includes(search)) return false;
    return true;
  });
  document.getElementById('count').textContent = filtered.length + ' entries';
  const container = document.getElementById('logs');
  if (filtered.length === 0) {
    container.innerHTML = '<div id="empty">No log entries match your filter.</div>';
    return;
  }
  container.innerHTML = filtered.map((e, i) => {
    const isError = e.level === 'error';
    const errMsg = isError && e.error?.message ? '<span class="err-msg">' + esc(e.error.message) + '</span>' : '';
    return '<div class="entry">' +
      '<div class="entry-header" onclick="toggleEntry(this)">' +
        '<span class="time">' + esc(formatTime(e.timestamp)) + '</span>' +
        '<span class="badge ' + (isError ? 'error' : 'info') + '">' + esc((e.level||'').toUpperCase()) + '</span>' +
        '<span class="method">' + esc(e.method||'') + '</span>' +
        '<span class="url">' + esc(e.url||e.message||'') + '</span>' +
        '<span class="duration">' + esc(e.metadata?.duration||'') + '</span>' +
        errMsg +
      '</div>' +
      '<div class="entry-body"><pre>' + esc(JSON.stringify(e, null, 2)) + '</pre></div>' +
    '</div>';
  }).join('');
  if (autoScroll) scrollToBottom();
}

async function fetchLogs() {
  if (paused) return;
  try {
    const res = await fetch('/log-viewer/data');
    const text = await res.text();
    entries = text.trim().split('\\n').filter(Boolean).map(line => {
      try { return JSON.parse(line); } catch { return { message: line }; }
    });
    render();
  } catch (e) {
    console.error('Failed to fetch logs:', e);
  }
}

window.addEventListener('scroll', () => {
  autoScroll = window.innerHeight + window.scrollY >= document.body.scrollHeight - 150;
});

fetchLogs();
setInterval(fetchLogs, 3000);
</script>
</body>
</html>`;
