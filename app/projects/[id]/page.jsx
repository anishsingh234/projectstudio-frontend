'use client'
import { useCallback, useEffect, useState } from 'react'
import { getProject, runAgent, getAgentStatus } from '@/lib/api'
import { useParams } from 'next/navigation'
import Link from 'next/link'

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Mono:wght@300;400&display=swap');

  :root {
    --ink:    #0a0a0f;
    --ink2:   #10101a;
    --border: rgba(255,255,255,0.07);
    --hi:     rgba(180,160,255,0.32);
    --text:   #ece8f4;
    --muted:  rgba(236,232,244,0.42);
    --accent: #b49fff;
    --mint:   #7efdd0;
    --amber:  #f4a261;
    --r: 16px;
  }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(14px); }
    to   { opacity:1; transform:translateY(0); }
  }

  .pp * { box-sizing:border-box; margin:0; padding:0; }
  .pp {
    font-family: 'DM Mono', monospace;
    color: var(--text);
    padding: 52px 40px;
    max-width: 1100px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
    animation: fadeUp .45s ease both;
  }

  .back {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 10px;
    letter-spacing: .14em;
    text-transform: uppercase;
    color: var(--muted);
    text-decoration: none;
    margin-bottom: 20px;
    transition: color .2s;
  }
  .back:hover { color: var(--text); }

  .hcard {
    background: var(--ink2);
    border: 1px solid var(--border);
    border-radius: var(--r);
    padding: 36px 40px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 32px;
    flex-wrap: wrap;
  }
  .hlabel {
    font-size: 9px;
    letter-spacing: .2em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 10px;
  }
  .htitle {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(32px, 4vw, 52px);
    font-weight: 300;
    letter-spacing: -.02em;
    line-height: 1.05;
    margin-bottom: 10px;
  }
  .hdesc {
    font-size: 12px;
    color: var(--muted);
    letter-spacing: .03em;
    line-height: 1.75;
    max-width: 520px;
  }
  .status-pill {
    font-size: 9px;
    letter-spacing: .14em;
    text-transform: uppercase;
    padding: 5px 12px;
    border-radius: 99px;
    border: 1px solid;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .s-active    { color: var(--mint);  border-color:rgba(126,253,208,.25); background:rgba(126,253,208,.06); }
  .s-completed { color:#93e8ff;        border-color:rgba(147,232,255,.25); background:rgba(147,232,255,.06); }
  .s-draft     { color: var(--amber); border-color:rgba(244,162,97,.25);  background:rgba(244,162,97,.06);  }

  .two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  @media(max-width:640px){ .two-col { grid-template-columns:1fr; } }

  .panel {
    background: var(--ink2);
    border: 1px solid var(--border);
    border-radius: var(--r);
    padding: 28px 32px;
  }
  .panel-label {
    font-size: 9px;
    letter-spacing: .18em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 18px;
  }
  .goal-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: 12px;
    color: rgba(236,232,244,.7);
    line-height: 1.6;
    letter-spacing: .02em;
    padding: 6px 0;
    border-bottom: 1px solid var(--border);
  }
  .goal-item:last-child { border-bottom: none; }
  .goal-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: var(--accent);
    margin-top: 6px;
    flex-shrink: 0;
  }
  .ref-link {
    display: block;
    font-size: 11px;
    color: var(--accent);
    text-decoration: none;
    letter-spacing: .02em;
    padding: 6px 0;
    border-bottom: 1px solid var(--border);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: opacity .2s;
  }
  .ref-link:last-child { border-bottom: none; }
  .ref-link:hover { opacity: .6; }
  .empty-txt { font-size: 11px; color: var(--muted); letter-spacing: .04em; }

  .action-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  @media(max-width:640px){ .action-grid { grid-template-columns:1fr; } }

  .action-card {
    background: var(--ink2);
    border: 1px solid var(--border);
    border-radius: var(--r);
    padding: 28px 28px 24px;
    cursor: pointer;
    text-decoration: none;
    color: inherit;
    display: flex;
    flex-direction: column;
    gap: 8px;
    transition: border-color .22s, transform .22s;
  }
  .action-card:hover {
    border-color: var(--hi);
    transform: translateY(-2px);
  }
  .ac-icon { font-size: 20px; line-height: 1; margin-bottom: 4px; }
  .ac-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 20px;
    font-weight: 400;
    letter-spacing: -.01em;
  }
  .ac-desc {
    font-size: 11px;
    color: var(--muted);
    line-height: 1.65;
    letter-spacing: .03em;
  }
  .agent-badge {
    display: inline-block;
    margin-top: 6px;
    font-size: 9px;
    letter-spacing: .12em;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 99px;
    border: 1px solid;
  }
  .ab-pending   { color:var(--amber); border-color:rgba(244,162,97,.3); background:rgba(244,162,97,.07); }
  .ab-completed { color:var(--mint);  border-color:rgba(126,253,208,.3); background:rgba(126,253,208,.07); }
  .ab-failed    { color:#f87171;       border-color:rgba(248,113,113,.3); background:rgba(248,113,113,.07); }

  .loading {
    font-family:'DM Mono',monospace;
    font-size:11px;
    letter-spacing:.12em;
    text-transform:uppercase;
    color:rgba(236,232,244,.3);
    text-align:center;
    padding:80px 0;
  }
`

function statusClass(s) {
  if (s === 'active') return 'status-pill s-active'
  if (s === 'completed') return 'status-pill s-completed'
  return 'status-pill s-draft'
}
function agentClass(s) {
  if (s === 'completed') return 'agent-badge ab-completed'
  if (s === 'failed') return 'agent-badge ab-failed'
  return 'agent-badge ab-pending'
}

export default function ProjectPage() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [agentStatus, setAgentStatus] = useState(null)
  const [polling, setPolling] = useState(false)

  const fetchProject = useCallback(async () => {
    if (!id) return
    try {
      const res = await getProject(id)
      setProject(res.data)
    } catch (err) { console.error(err) }
  }, [id])

  useEffect(() => { fetchProject() }, [fetchProject])

  const handleRunAgent = async () => {
    try {
      const res = await runAgent(id)
      const runId = res.data.run_id
      setAgentStatus('pending')
      setPolling(true)
      const interval = setInterval(async () => {
        const statusRes = await getAgentStatus(runId)
        setAgentStatus(statusRes.data.status)
        if (['completed', 'failed'].includes(statusRes.data.status)) {
          clearInterval(interval)
          setPolling(false)
        }
      }, 2000)
    } catch (err) { console.error(err) }
  }

  if (!project) return (
    <>
      <style>{CSS}</style>
      <div className="loading">Loading project…</div>
    </>
  )

  return (
    <>
      <style>{CSS}</style>
      <div className="pp">

        <Link href="/projects" className="back">← Projects</Link>

        <div className="hcard">
          <div>
            <p className="hlabel">Project</p>
            <h1 className="htitle">{project.title}</h1>
            <p className="hdesc">{project.description || 'No description yet.'}</p>
          </div>
          <span className={statusClass(project.status)}>
            {project.status ?? 'draft'}
          </span>
        </div>

        <div className="two-col">
          <div className="panel">
            <p className="panel-label">Goals</p>
            {project.goals?.length > 0
              ? project.goals.map((g, i) => (
                  <div key={i} className="goal-item">
                    <span className="goal-dot" />{g}
                  </div>
                ))
              : <p className="empty-txt">No goals set.</p>
            }
          </div>

          <div className="panel">
            <p className="panel-label">Reference Links</p>
            {project.reference_links?.length > 0
              ? project.reference_links.map((link, i) => (
                  <a key={i} href={link} target="_blank" className="ref-link">{link}</a>
                ))
              : <p className="empty-txt">No links added.</p>
            }
          </div>
        </div>

        <div className="action-grid">
          <Link href={`/projects/${id}/chat`} className="action-card">
            <span className="ac-icon">💬</span>
            <p className="ac-title">Chat with AI</p>
            <p className="ac-desc">Discuss requirements and unblock decisions.</p>
          </Link>

          <Link href={`/projects/${id}/images`} className="action-card">
            <span className="ac-icon">🎨</span>
            <p className="ac-title">Images</p>
            <p className="ac-desc">Generate and analyze visuals instantly.</p>
          </Link>

          <div className="action-card" onClick={handleRunAgent}>
            <span className="ac-icon">🤖</span>
            <p className="ac-title">Run AI Agent</p>
            <p className="ac-desc">Organize knowledge and sync context.</p>
            {agentStatus && (
              <span className={agentClass(agentStatus)}>
                {polling ? `${agentStatus}…` : agentStatus}
              </span>
            )}
          </div>
        </div>

      </div>
    </>
  )
}