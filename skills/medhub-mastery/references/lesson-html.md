# Interactive HTML Lesson & Quiz Template

Each lesson is one self-contained HTML file (no external dependencies, works offline), saved to `docs/medhub-mastery/features/<slug>/lessons/NNNN-<name>.html` with an incrementing zero-padded number. After writing it, tell the user the exact shell command to open it.

## Design principles

- **One thing per lesson.** Quick to complete, gives a tangible win.
- **Beautiful and readable** — the user returns to these to review. Clean typography, generous spacing, a warm professional palette (avoid the default purple-AI-gradient look). Dark-text-on-light, max ~70ch content width, system font stack.
- **Scenario-first.** Lead with the troubleshooting/enhancement scenario, then the question.
- **Show real code** when relevant — paste the actual MedHub snippet (it's local/offline, safe here) with the file path as a caption. Keep snippets exact, never simplified.

## Required structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>MedHub Mastery — <Feature> — <Lesson Title></title>
<style>
  :root { --ink:#1f2328; --muted:#57606a; --bg:#fbfaf7; --card:#fff;
          --accent:#0b6b5e; --accent-soft:#e6f2ef; --warn:#b3541e; --line:#e6e1d8; }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--bg); color:var(--ink);
         font:16px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; }
  main { max-width:760px; margin:0 auto; padding:48px 24px 96px; }
  h1 { font-size:1.6rem; margin:0 0 4px; }
  .sub { color:var(--muted); margin-bottom:32px; }
  .card { background:var(--card); border:1px solid var(--line); border-radius:12px;
          padding:24px; margin:20px 0; }
  .scenario { background:var(--accent-soft); border-left:4px solid var(--accent); }
  pre { background:#0f1720; color:#e6edf3; padding:16px; border-radius:8px;
        overflow:auto; font-size:13px; }
  pre + .path { color:var(--muted); font-size:12px; margin-top:-12px; }
  .opt { display:block; width:100%; text-align:left; margin:8px 0; padding:14px 16px;
         border:1px solid var(--line); border-radius:8px; background:#fff; cursor:pointer;
         font-size:1rem; transition:.15s; }
  .opt:hover { border-color:var(--accent); }
  .opt.correct { background:#e7f6ee; border-color:#2e9d6e; }
  .opt.wrong { background:#fdecea; border-color:#d1493b; }
  .feedback { margin-top:14px; padding:14px 16px; border-radius:8px; display:none;
              font-size:.95rem; }
  .feedback.show { display:block; }
  .feedback.ok { background:#e7f6ee; }
  .feedback.no { background:#fdecea; }
  .tag { display:inline-block; font-size:11px; text-transform:uppercase;
         letter-spacing:.05em; padding:3px 8px; border-radius:999px;
         background:var(--accent-soft); color:var(--accent); margin-bottom:12px; }
  .next { margin-top:24px; padding:16px; border:1px dashed var(--line);
          border-radius:8px; color:var(--muted); }
</style>
</head>
<body>
<main>
  <h1><!-- Lesson title --></h1>
  <div class="sub"><!-- Feature · sub-area · lesson NNNN --></div>

  <!-- Optional teaching preamble: the minimal knowledge needed before the quiz -->
  <div class="card"><!-- concise explanation, real code snippet w/ .path caption --></div>

  <!-- One question per .card. Repeat as needed (3-5 total). -->
  <div class="card">
    <span class="tag"><!-- business | technical | integration --></span>
    <div class="scenario card"><!-- the prod scenario --></div>
    <p><strong><!-- the question --></strong></p>
    <button class="opt" data-correct="false">…</button>
    <button class="opt" data-correct="true">…</button>
    <button class="opt" data-correct="false">…</button>
    <div class="feedback"><!-- why correct/incorrect; cite the file path --></div>
  </div>

  <div class="next">
    When you've worked through these, come back to Claude Code and tell me how each
    one went — especially anything you got wrong or guessed. I'll diagnose the gap and
    re-teach it against the actual code.
  </div>
</main>
<script>
  document.querySelectorAll('.card').forEach(card => {
    const opts = card.querySelectorAll('.opt');
    const fb = card.querySelector('.feedback');
    opts.forEach(opt => opt.addEventListener('click', () => {
      opts.forEach(o => { o.classList.remove('correct','wrong'); o.disabled = true; });
      const right = opt.dataset.correct === 'true';
      opt.classList.add(right ? 'correct' : 'wrong');
      if (!right) card.querySelector('[data-correct="true"]').classList.add('correct');
      if (fb) { fb.classList.add('show', right ? 'ok' : 'no'); }
      opts.forEach(o => o.disabled = false); // allow re-reading; keep simple
    }));
  });
</script>
</body>
</html>
```

## Question authoring rules

- Pull every scenario and answer from `TRACE.md`. Never invent MedHub behavior.
- Each question carries a tag (`business` / `technical` / `integration`) shown in the `.tag` span — this is the same tag you use to route in-chat remediation.
- Feedback text cites the real file path so the user can open the source and verify.
- Prefer "where would you look / what breaks / what changes if you enhance X" over recall questions.

## Glossary

`glossary.html` uses the same visual style: a simple alphabetized list of MedHub + GME terms, each with a plain-English definition and (where relevant) the file or table it maps to. Append to it as new terms arise; never regenerate from scratch.
