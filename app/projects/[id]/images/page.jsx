"use client";
import { useEffect, useState } from "react";
import { generateImage, analyzeImage, getImages } from "@/lib/api";
import { useParams } from "next/navigation";
import Link from "next/link";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Mono:wght@300;400&display=swap');
  :root{--ink:#0a0a0f;--ink2:#10101a;--border:rgba(255,255,255,0.07);--hi:rgba(180,160,255,0.32);--text:#ece8f4;--muted:rgba(236,232,244,0.42);--accent:#b49fff;--r:16px;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
  .ip *{box-sizing:border-box;margin:0;padding:0;}
  .ip{font-family:'DM Mono',monospace;color:var(--text);padding:52px 40px;max-width:1100px;margin:0 auto;display:flex;flex-direction:column;gap:10px;animation:fadeUp .45s ease both;}
  .back{display:inline-flex;align-items:center;gap:8px;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);text-decoration:none;margin-bottom:20px;transition:color .2s;}
  .back:hover{color:var(--text);}
  .htitle{font-family:'Cormorant Garamond',serif;font-size:clamp(32px,4vw,48px);font-weight:300;letter-spacing:-.02em;line-height:1;}
  .hcount{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin-top:8px;}
  .gen-panel{background:var(--ink2);border:1px solid var(--border);border-radius:var(--r);padding:28px 32px;display:flex;flex-direction:column;gap:16px;}
  .gen-label{font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);}
  .gen-row{display:flex;gap:10px;align-items:center;}
  .gen-input{flex:1;background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:10px;padding:13px 16px;font-family:'DM Mono',monospace;font-size:12px;color:var(--text);outline:none;transition:border-color .2s;}
  .gen-input::placeholder{color:rgba(236,232,244,.22);}
  .gen-input:focus{border-color:var(--accent);}
  .gen-btn{padding:13px 24px;background:var(--accent);color:var(--ink);border:none;border-radius:99px;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;white-space:nowrap;transition:opacity .2s,transform .2s;display:flex;align-items:center;gap:8px;}
  .gen-btn:hover:not(:disabled){opacity:.88;transform:translateY(-1px);}
  .gen-btn:disabled{opacity:.3;cursor:not-allowed;}
  .suggestions{display:flex;flex-wrap:wrap;gap:6px;}
  .sugg-label{font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);width:100%;}
  .sugg-btn{font-size:10px;padding:5px 12px;border-radius:99px;background:rgba(255,255,255,.04);border:1px solid var(--border);color:var(--muted);cursor:pointer;font-family:'DM Mono',monospace;transition:border-color .2s,color .2s;}
  .sugg-btn:hover{border-color:var(--hi);color:var(--text);}
  .img-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:10px;}
  .img-card{background:var(--ink2);border:1px solid var(--border);border-radius:var(--r);overflow:hidden;transition:border-color .22s;animation:fadeUp .4s ease both;}
  .img-card:hover{border-color:var(--hi);}
  .img-wrap{width:100%;height:200px;background:rgba(255,255,255,.03);position:relative;overflow:hidden;}
  .img-el{width:100%;height:100%;object-fit:cover;transition:opacity .4s;}
  .img-overlay-btn{position:absolute;top:10px;right:10px;font-size:10px;letter-spacing:.1em;text-transform:uppercase;padding:5px 10px;background:rgba(10,10,15,.7);border:1px solid var(--border);border-radius:99px;color:var(--muted);text-decoration:none;transition:color .2s;}
  .img-overlay-btn:hover{color:var(--text);}
  .img-placeholder{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;}
  .spinner{width:18px;height:18px;border:1.5px solid var(--accent);border-top-color:transparent;border-radius:50%;animation:spin .8s linear infinite;}
  .placeholder-txt{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);}
  .card-body{padding:20px 22px;display:flex;flex-direction:column;gap:12px;}
  .card-prompt{font-size:12px;color:rgba(236,232,244,.7);line-height:1.65;letter-spacing:.02em;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
  .card-date{font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:rgba(236,232,244,.28);}
  .analysis-block{background:rgba(180,160,255,.06);border:1px solid rgba(180,160,255,.18);border-radius:10px;padding:12px 14px;}
  .analysis-label{font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin-bottom:6px;}
  .analysis-text{font-size:11px;color:rgba(236,232,244,.65);line-height:1.7;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden;}
  .analyze-input{width:100%;background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:10px;padding:10px 14px;font-family:'DM Mono',monospace;font-size:11px;color:var(--text);outline:none;transition:border-color .2s;}
  .analyze-input::placeholder{color:rgba(236,232,244,.22);}
  .analyze-input:focus{border-color:var(--accent);}
  .analyze-row{display:flex;gap:8px;}
  .btn-analyze{flex:1;padding:9px 16px;background:var(--accent);color:var(--ink);border:none;border-radius:99px;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;transition:opacity .2s;display:flex;align-items:center;justify-content:center;gap:6px;}
  .btn-analyze:disabled{opacity:.3;cursor:not-allowed;}
  .btn-cancel{padding:9px 14px;background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:99px;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);cursor:pointer;transition:color .2s;}
  .btn-cancel:hover{color:var(--text);}
  .btn-trigger{width:100%;padding:9px;background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:10px;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);cursor:pointer;transition:border-color .2s,color .2s;}
  .btn-trigger:hover{border-color:var(--hi);color:var(--text);}
  .shimmer{height:320px;border-radius:var(--r);background:linear-gradient(90deg,rgba(255,255,255,.03) 25%,rgba(255,255,255,.06) 50%,rgba(255,255,255,.03) 75%);background-size:400px 100%;animation:shimmer 1.4s infinite linear;}
  .empty{text-align:center;padding:72px 40px;border:1px dashed rgba(255,255,255,.1);border-radius:var(--r);}
  .empty-title{font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:300;letter-spacing:-.02em;margin-bottom:6px;}
  .empty-sub{font-size:11px;color:var(--muted);letter-spacing:.04em;}
`;

const SUGGESTIONS = [
  "Modern dashboard UI, dark theme",
  "Futuristic AI interface, neon accents",
  "Minimalist app wireframe",
  "Abstract tech background, blue light",
];

function ImageCard({ image, onAnalyze }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [showAnalyze, setShowAnalyze] = useState(false);
  const [question, setQuestion] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    await onAnalyze(image.id, question || "Describe this image in detail");
    setAnalyzing(false);
    setShowAnalyze(false);
    setQuestion("");
  };

  return (
    <div className="img-card">
      <div className="img-wrap">
        {!loaded && !error && (
          <div className="img-placeholder">
            <div className="spinner" />
            <p className="placeholder-txt">Generating…</p>
          </div>
        )}
        {error && (
          <div className="img-placeholder">
            <p className="placeholder-txt">Could not load</p>
            <a href={image.url} target="_blank" className="img-overlay-btn">Open ↗</a>
          </div>
        )}
        <img
          src={image.url}
          alt={image.prompt}
          className="img-el"
          style={{ opacity: loaded ? 1 : 0 }}
          onLoad={() => setLoaded(true)}
          onError={() => { setError(true); setLoaded(false); }}
        />
        {loaded && <a href={image.url} target="_blank" className="img-overlay-btn">Open ↗</a>}
      </div>

      <div className="card-body">
        <p className="card-prompt">{image.prompt}</p>
        <p className="card-date">
          {new Date(image.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </p>
        {image.analysis_result && (
          <div className="analysis-block">
            <p className="analysis-label">Analysis</p>
            <p className="analysis-text">{image.analysis_result}</p>
          </div>
        )}
        {showAnalyze ? (
          <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
            <input
              className="analyze-input"
              placeholder="Ask about this image… (optional)"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAnalyze()}
            />
            <div className="analyze-row">
              <button className="btn-analyze" onClick={handleAnalyze} disabled={analyzing}>
                {analyzing && <div className="spinner" style={{ width:12, height:12 }} />}
                {analyzing ? "Analyzing…" : "Analyze"}
              </button>
              <button className="btn-cancel" onClick={() => { setShowAnalyze(false); setQuestion(""); }}>Cancel</button>
            </div>
          </div>
        ) : (
          <button className="btn-trigger" onClick={() => setShowAnalyze(true)}>Analyze Image</button>
        )}
      </div>
    </div>
  );
}

export default function ImagesPage() {
  const { id } = useParams();
  const [images, setImages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchImages(); }, []);

  const fetchImages = async () => {
    try {
      const res = await getImages(id);
      setImages(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || generating) return;
    setGenerating(true);
    try { await generateImage(id, prompt); setPrompt(""); fetchImages(); }
    catch (err) { console.error(err); }
    finally { setGenerating(false); }
  };

  const handleAnalyze = async (imageId, question) => {
    try {
      const res = await analyzeImage(imageId, question);
      setImages(prev => prev.map(img => img.id === imageId ? { ...img, analysis_result: res.data.analysis } : img));
    } catch (err) { console.error(err); }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="ip">
        <Link href={`/projects/${id}`} className="back">← Project</Link>
        <div>
          <h1 className="htitle">Images</h1>
          <p className="hcount">{images.length} image{images.length !== 1 ? "s" : ""} generated</p>
        </div>
        <div className="gen-panel">
          <p className="gen-label">Generate new image</p>
          <div className="gen-row">
            <input
              className="gen-input"
              placeholder="Describe the image you want…"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleGenerate()}
              disabled={generating}
            />
            <button className="gen-btn" onClick={handleGenerate} disabled={generating || !prompt.trim()}>
              {generating && <div className="spinner" style={{ borderColor:"var(--ink)", borderTopColor:"transparent" }} />}
              {generating ? "Generating…" : "Generate"}
            </button>
          </div>
          <div className="suggestions">
            <p className="sugg-label">Quick prompts</p>
            {SUGGESTIONS.map(s => <button key={s} className="sugg-btn" onClick={() => setPrompt(s)}>{s}</button>)}
          </div>
        </div>
        {loading ? (
          <div className="img-grid">{[...Array(3)].map((_, i) => <div key={i} className="shimmer" />)}</div>
        ) : images.length === 0 ? (
          <div className="empty">
            <h3 className="empty-title">No images yet</h3>
            <p className="empty-sub">Generate your first image above.</p>
          </div>
        ) : (
          <div className="img-grid">
            {images.map(img => <ImageCard key={img.id} image={img} onAnalyze={handleAnalyze} />)}
          </div>
        )}
      </div>
    </>
  );
}