'use client';
import { useCallback, useEffect, useState } from 'react';
import { getProjects, createProject } from '@/lib/api';
import Link from 'next/link';

/* ─── Inline styles & keyframes injected once ─────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Mono:wght@300;400&display=swap');

  :root {
    --ink: #0a0a0f;
    --ink2: #10101a;
    --surface: rgba(255,255,255,0.035);
    --border: rgba(255,255,255,0.08);
    --border-hi: rgba(180,160,255,0.35);
    --text: #ece8f4;
    --muted: rgba(236,232,244,0.45);
    --accent: #b49fff;
    --accent2: #7efdd0;
    --accent3: #f4a261;
    --r: 20px;
  }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(18px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes scaleIn {
    from { opacity:0; transform:scale(0.97); }
    to   { opacity:1; transform:scale(1); }
  }
  @keyframes pulse-dot {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:.4; transform:scale(1.5); }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position:  400px 0; }
  }

  .proj-root * { box-sizing: border-box; margin:0; padding:0; }
  .proj-root {
    font-family: 'DM Mono', monospace;
    color: var(--text);
    background: var(--ink);
    min-height: 100vh;
    padding: 56px 40px;
    max-width: 1240px;
    margin: 0 auto;
    animation: fadeUp .5s ease both;
  }

  /* ── Header ── */
  .hd-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    letter-spacing: .18em;
    text-transform: uppercase;
    color: var(--muted);
    background: var(--surface);
    border: 1px solid var(--border);
    padding: 6px 14px;
    border-radius: 99px;
    margin-bottom: 14px;
  }
  .hd-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--accent2);
    animation: pulse-dot 2s ease infinite;
  }
  .hd-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(40px, 5vw, 64px);
    font-weight: 300;
    letter-spacing: -.02em;
    line-height: 1;
    color: var(--text);
  }
  .hd-title em { font-style: italic; color: var(--accent); }
  .hd-sub {
    font-size: 13px;
    color: var(--muted);
    margin-top: 10px;
    letter-spacing: .04em;
  }
  .header-row {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 24px;
    margin-bottom: 52px;
  }

  /* ── New Project Button ── */
  .btn-new {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 14px 28px;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: var(--ink);
    background: var(--text);
    border: none;
    border-radius: 99px;
    cursor: pointer;
    transition: transform .2s, box-shadow .2s, background .2s;
    box-shadow: 0 0 0 0 rgba(180,160,255,0);
    flex-shrink: 0;
  }
  .btn-new:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(180,160,255,.25);
    background: #fff;
  }
  .btn-new.active {
    background: var(--ink2);
    color: var(--text);
    border: 1px solid var(--border-hi);
    box-shadow: 0 0 20px rgba(180,160,255,.1);
  }
  .btn-new .icon {
    width: 18px; height: 18px;
    border-radius: 50%;
    background: var(--accent);
    color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 700;
    transition: transform .3s;
  }
  .btn-new.active .icon { transform: rotate(45deg); }

  /* ── Form Panel ── */
  .form-panel {
    background: var(--ink2);
    border: 1px solid var(--border-hi);
    border-radius: var(--r);
    padding: 44px 44px 36px;
    margin-bottom: 48px;
    animation: scaleIn .3s cubic-bezier(.16,1,.3,1) both;
    position: relative;
    overflow: hidden;
  }
  .form-panel::before {
    content: '';
    position: absolute;
    top: -80px; right: -80px;
    width: 280px; height: 280px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(180,160,255,.12) 0%, transparent 70%);
    pointer-events: none;
  }
  .form-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 30px;
    font-weight: 300;
    letter-spacing: -.02em;
    margin-bottom: 4px;
  }
  .form-sub {
    font-size: 11px;
    letter-spacing: .08em;
    color: var(--muted);
    margin-bottom: 32px;
    text-transform: uppercase;
  }
  .form-grid { display: grid; gap: 14px; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  @media(max-width:600px){ .form-row { grid-template-columns: 1fr; } }

  .form-input, .form-textarea {
    width: 100%;
    background: rgba(255,255,255,0.03);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 14px 18px;
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    color: var(--text);
    outline: none;
    transition: border-color .2s, background .2s;
  }
  .form-input::placeholder, .form-textarea::placeholder { color: rgba(236,232,244,.25); }
  .form-input:focus, .form-textarea:focus {
    border-color: var(--accent);
    background: rgba(180,160,255,.05);
  }
  .form-textarea { resize: none; }
  .form-footer {
    display: flex;
    justify-content: flex-end;
    gap: 14px;
    margin-top: 28px;
    padding-top: 24px;
    border-top: 1px solid var(--border);
  }
  .btn-create {
    padding: 13px 32px;
    background: var(--accent);
    color: var(--ink);
    border: none;
    border-radius: 99px;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    letter-spacing: .1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: opacity .2s, transform .2s, box-shadow .2s;
  }
  .btn-create:hover:not(:disabled) {
    opacity: .9;
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(180,160,255,.3);
  }
  .btn-create:disabled { opacity: .3; cursor: not-allowed; }

  /* ── Skeleton ── */
  .skeleton {
    height: 230px;
    border-radius: var(--r);
    background: linear-gradient(90deg, var(--surface) 25%, rgba(255,255,255,.07) 50%, var(--surface) 75%);
    background-size: 400px 100%;
    animation: shimmer 1.4s infinite linear;
  }

  /* ── Empty State ── */
  .empty-state {
    text-align: center;
    padding: 80px 40px;
    border: 1px dashed rgba(255,255,255,.12);
    border-radius: var(--r);
    animation: fadeUp .5s ease both;
  }
  .empty-icon {
    font-size: 52px;
    display: block;
    margin-bottom: 20px;
    filter: grayscale(.4);
  }
  .empty-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 32px;
    font-weight: 300;
    letter-spacing: -.02em;
    margin-bottom: 8px;
  }
  .empty-sub {
    font-size: 12px;
    color: var(--muted);
    letter-spacing: .06em;
    max-width: 320px;
    margin: 0 auto 28px;
    line-height: 1.7;
  }

  /* ── Grid ── */
  .proj-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 18px;
  }

  /* ── Card ── */
  .proj-card {
    display: block;
    text-decoration: none;
    color: inherit;
  }
  .card-inner {
    height: 100%;
    background: var(--ink2);
    border: 1px solid var(--border);
    border-radius: var(--r);
    padding: 28px 30px 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    transition: border-color .25s, transform .25s, box-shadow .25s;
    position: relative;
    overflow: hidden;
  }
  .card-inner::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(180,160,255,.04) 0%, transparent 60%);
    opacity: 0;
    transition: opacity .3s;
  }
  .proj-card:hover .card-inner {
    border-color: var(--border-hi);
    transform: translateY(-3px);
    box-shadow: 0 20px 50px rgba(0,0,0,.45), 0 0 0 1px rgba(180,160,255,.12);
  }
  .proj-card:hover .card-inner::after { opacity: 1; }

  .card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }
  .card-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px;
    font-weight: 400;
    letter-spacing: -.01em;
    line-height: 1.25;
    flex: 1;
    transition: color .2s;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .proj-card:hover .card-title { color: var(--accent); }

  .status-pill {
    font-size: 9px;
    letter-spacing: .14em;
    text-transform: uppercase;
    padding: 5px 10px;
    border-radius: 99px;
    border: 1px solid;
    white-space: nowrap;
    flex-shrink: 0;
    margin-top: 3px;
  }
  .status-active  { color: var(--accent2); border-color: rgba(126,253,208,.25); background: rgba(126,253,208,.07); }
  .status-completed { color: #93e8ff; border-color: rgba(147,232,255,.25); background: rgba(147,232,255,.07); }
  .status-draft   { color: var(--accent3); border-color: rgba(244,162,97,.25); background: rgba(244,162,97,.07); }

  .card-desc {
    font-size: 12px;
    color: var(--muted);
    line-height: 1.75;
    letter-spacing: .03em;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    min-height: 3.5em;
    flex: 1;
  }

  .card-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .tag {
    font-size: 9px;
    letter-spacing: .12em;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 99px;
    background: rgba(255,255,255,.04);
    border: 1px solid var(--border);
    color: var(--muted);
  }

  .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 14px;
    border-top: 1px solid var(--border);
    margin-top: auto;
  }
  .card-date {
    font-size: 10px;
    letter-spacing: .1em;
    color: rgba(236,232,244,.3);
    text-transform: uppercase;
  }
  .card-arrow {
    width: 28px; height: 28px;
    border-radius: 50%;
    border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    font-size: 12px;
    color: var(--muted);
    transition: border-color .2s, color .2s, transform .2s;
  }
  .proj-card:hover .card-arrow {
    border-color: var(--accent);
    color: var(--accent);
    transform: rotate(45deg);
  }

  /* staggered card entrance */
  .proj-grid .proj-card { animation: fadeUp .45s ease both; }
  .proj-grid .proj-card:nth-child(1) { animation-delay:.05s; }
  .proj-grid .proj-card:nth-child(2) { animation-delay:.1s; }
  .proj-grid .proj-card:nth-child(3) { animation-delay:.15s; }
  .proj-grid .proj-card:nth-child(4) { animation-delay:.2s; }
  .proj-grid .proj-card:nth-child(5) { animation-delay:.25s; }
  .proj-grid .proj-card:nth-child(6) { animation-delay:.3s; }
`;

function statusClass(s) {
  if (s === 'active') return 'status-pill status-active';
  if (s === 'completed') return 'status-pill status-completed';
  return 'status-pill status-draft';
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', goals: '', tags: '', reference_links: ''
  });

  const fetchProjects = useCallback(async () => {
    try {
      const res = await getProjects();
      const data = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
          ? res.data.data
          : [];
      setProjects(data);
    } catch (err) {
      console.error(err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    try {
      await createProject({
        title:           form.title.trim(),
        description:     form.description.trim(),
        goals:           form.goals.split(',').map(g => g.trim()).filter(Boolean),
        tags:            form.tags.split(',').map(t => t.trim()).filter(Boolean),
        reference_links: form.reference_links.split(',').map(l => l.trim()).filter(Boolean),
      });
      setForm({ title: '', description: '', goals: '', tags: '', reference_links: '' });
      setShowForm(false);
      fetchProjects();
    } catch (err) { console.error(err); }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="proj-root">

        {/* ── Header ── */}
        <div className="header-row">
          <div>
            <div className="hd-eyebrow">
              <span className="hd-dot" />
              Live workspace
            </div>
            <h1 className="hd-title">Your <em>Projects</em></h1>
            <p className="hd-sub">Plan, brief &amp; track every initiative with AI.</p>
          </div>

          <button
            className={`btn-new ${showForm ? 'active' : ''}`}
            onClick={() => setShowForm(v => !v)}
          >
            <span className="icon">{showForm ? '×' : '+'}</span>
            {showForm ? 'Cancel' : 'New Project'}
          </button>
        </div>

        {/* ── Create Form ── */}
        {showForm && (
          <div className="form-panel">
            <h2 className="form-title">New Project</h2>
            <p className="form-sub">Give it a clear start — AI will help you expand it</p>

            <div className="form-grid">
              <input
                className="form-input"
                placeholder="Project title *"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
              />
              <textarea
                className="form-textarea"
                placeholder="Short description (optional)"
                rows={3}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
              <div className="form-row">
                <input
                  className="form-input"
                  placeholder="Tags — comma separated"
                  value={form.tags}
                  onChange={e => setForm({ ...form, tags: e.target.value })}
                />
                <input
                  className="form-input"
                  placeholder="Goals — comma separated"
                  value={form.goals}
                  onChange={e => setForm({ ...form, goals: e.target.value })}
                />
              </div>
              <input
                className="form-input"
                placeholder="Reference links — comma separated"
                value={form.reference_links}
                onChange={e => setForm({ ...form, reference_links: e.target.value })}
              />
            </div>

            <div className="form-footer">
              <button
                className="btn-create"
                onClick={handleCreate}
                disabled={!form.title.trim()}
              >
                Create Project →
              </button>
            </div>
          </div>
        )}

        {/* ── Projects Grid ── */}
        {loading ? (
          <div className="proj-grid">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton" />)}
          </div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📁</span>
            <h3 className="empty-title">No projects yet</h3>
            <p className="empty-sub">
              Create your first project to start collaborating with AI on your initiatives.
            </p>
            <button className="btn-new" onClick={() => setShowForm(true)}>
              <span className="icon">+</span>
              Create First Project
            </button>
          </div>
        ) : (
          <div className="proj-grid">
            {projects.map(project => (
              <Link href={`/projects/${project.id}`} key={project.id} className="proj-card">
                <div className="card-inner">
                  <div className="card-top">
                    <h2 className="card-title">{project.title}</h2>
                    <span className={statusClass(project.status)}>
                      {project.status || 'draft'}
                    </span>
                  </div>

                  <p className="card-desc">
                    {project.description || 'No description yet.'}
                  </p>

                  {project.tags?.length > 0 && (
                    <div className="card-tags">
                      {project.tags.slice(0, 4).map((tag, i) => (
                        <span key={i} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}

                  <div className="card-footer">
                    <span className="card-date">
                      {project.created_at
                        ? new Date(project.created_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })
                        : 'Recently created'}
                    </span>
                    <span className="card-arrow">↗</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </>
  );
}