'use client'
import { useEffect, useState, useRef } from 'react'
import { sendMessage, getConversations, getMessages } from '@/lib/api'
import { useParams } from 'next/navigation'
import Link from 'next/link'

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Mono:wght@300;400&display=swap');
  :root{--ink:#0a0a0f;--ink2:#10101a;--border:rgba(255,255,255,0.07);--hi:rgba(180,160,255,0.32);--text:#ece8f4;--muted:rgba(236,232,244,0.42);--accent:#b49fff;--r:16px;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}
  .cp *{box-sizing:border-box;margin:0;padding:0;}
  .cp{font-family:'DM Mono',monospace;color:var(--text);height:85vh;display:flex;gap:10px;padding:0;}

  /* sidebar */
  .sidebar{width:220px;flex-shrink:0;background:var(--ink2);border:1px solid var(--border);border-radius:var(--r);padding:20px 16px;display:flex;flex-direction:column;gap:8px;overflow-y:auto;}
  .sb-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;}
  .sb-title{font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);}
  .sb-new{font-size:9px;letter-spacing:.12em;text-transform:uppercase;padding:5px 10px;border-radius:99px;background:rgba(180,160,255,.1);border:1px solid rgba(180,160,255,.2);color:var(--accent);cursor:pointer;font-family:'DM Mono',monospace;transition:background .2s;}
  .sb-new:hover{background:rgba(180,160,255,.18);}
  .conv-item{padding:10px 12px;border-radius:10px;cursor:pointer;border:1px solid transparent;transition:background .2s,border-color .2s;}
  .conv-item:hover{background:rgba(255,255,255,.04);}
  .conv-item.active{background:rgba(180,160,255,.08);border-color:rgba(180,160,255,.2);}
  .conv-title{font-size:11px;letter-spacing:.02em;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .conv-date{font-size:9px;letter-spacing:.08em;color:var(--muted);margin-top:3px;text-transform:uppercase;}
  .sb-empty{font-size:10px;color:var(--muted);letter-spacing:.06em;padding:4px 0;}
  .sb-back{margin-top:auto;padding-top:12px;border-top:1px solid var(--border);}
  .sb-back a{display:block;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);text-decoration:none;transition:color .2s;}
  .sb-back a:hover{color:var(--text);}

  /* main */
  .chat-main{flex:1;background:var(--ink2);border:1px solid var(--border);border-radius:var(--r);display:flex;flex-direction:column;overflow:hidden;}
  .chat-header{padding:18px 24px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px;}
  .chat-avatar{width:30px;height:30px;border-radius:50%;background:rgba(180,160,255,.15);border:1px solid rgba(180,160,255,.25);display:flex;align-items:center;justify-content:center;font-size:12px;}
  .chat-header-title{font-family:'Cormorant Garamond',serif;font-size:18px;font-weight:400;letter-spacing:-.01em;}
  .chat-header-sub{font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-top:2px;}

  /* messages */
  .messages{flex:1;overflow-y:auto;padding:24px;display:flex;flex-direction:column;gap:12px;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.08) transparent;}
  .msg-wrap{display:flex;animation:fadeUp .25s ease both;}
  .msg-wrap.user{justify-content:flex-end;}
  .msg-wrap.assistant{justify-content:flex-start;}
  .bubble{max-width:72%;padding:11px 16px;border-radius:14px;font-size:12px;line-height:1.7;letter-spacing:.02em;}
  .bubble.user{background:rgba(180,160,255,.18);border:1px solid rgba(180,160,255,.22);color:var(--text);border-bottom-right-radius:4px;}
  .bubble.assistant{background:rgba(255,255,255,.04);border:1px solid var(--border);color:rgba(236,232,244,.8);border-bottom-left-radius:4px;}

  /* typing */
  .typing{display:flex;align-items:center;gap:4px;padding:11px 16px;background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:14px;border-bottom-left-radius:4px;width:fit-content;}
  .dot-t{width:5px;height:5px;border-radius:50%;background:var(--muted);animation:bounce 1.2s ease infinite;}
  .dot-t:nth-child(2){animation-delay:.15s;}
  .dot-t:nth-child(3){animation-delay:.3s;}

  /* empty */
  .chat-empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;}
  .chat-empty-title{font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:300;letter-spacing:-.02em;}
  .chat-empty-sub{font-size:11px;color:var(--muted);letter-spacing:.04em;}
  .suggestions{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;max-width:440px;}
  .sugg-btn{font-size:10px;padding:6px 14px;border-radius:99px;background:rgba(255,255,255,.04);border:1px solid var(--border);color:var(--muted);cursor:pointer;font-family:'DM Mono',monospace;transition:border-color .2s,color .2s;}
  .sugg-btn:hover{border-color:var(--hi);color:var(--text);}

  /* input */
  .chat-input-row{padding:16px 20px;border-top:1px solid var(--border);display:flex;gap:10px;align-items:flex-end;}
  .chat-textarea{flex:1;background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:12px;padding:11px 14px;font-family:'DM Mono',monospace;font-size:12px;color:var(--text);outline:none;resize:none;line-height:1.6;transition:border-color .2s;}
  .chat-textarea::placeholder{color:rgba(236,232,244,.2);}
  .chat-textarea:focus{border-color:var(--accent);}
  .send-btn{padding:11px 22px;background:var(--accent);color:var(--ink);border:none;border-radius:99px;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;transition:opacity .2s,transform .2s;white-space:nowrap;}
  .send-btn:hover:not(:disabled){opacity:.88;transform:translateY(-1px);}
  .send-btn:disabled{opacity:.3;cursor:not-allowed;}
`;

const SUGGESTIONS = [
  'Tell me about my project',
  'What are my goals?',
  'Suggest next steps',
  'What do you remember about me?',
];

export default function ChatPage() {
  const { id } = useParams()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState(null)
  const [conversations, setConversations] = useState([])
  const bottomRef = useRef(null)

  useEffect(() => { fetchConversations(); }, [])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages])

  const fetchConversations = async () => {
    try { const res = await getConversations(id); setConversations(res.data); }
    catch (err) { console.error(err); }
  }

  const loadConversation = async (convId) => {
    try { const res = await getMessages(id, convId); setMessages(res.data); setConversationId(convId); }
    catch (err) { console.error(err); }
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const userMsg = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await sendMessage(id, { message: input, conversation_id: conversationId })
      const { conversation_id, reply } = res.data
      if (!conversationId) { setConversationId(conversation_id); fetchConversations(); }
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error getting response. Please try again.' }])
    } finally { setLoading(false); }
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  const startNewChat = () => { setConversationId(null); setMessages([]); }

  return (
    <>
      <style>{CSS}</style>
      <div className="cp">

        {/* Sidebar */}
        <div className="sidebar">
          <div className="sb-head">
            <span className="sb-title">Chats</span>
            <button className="sb-new" onClick={startNewChat}>+ New</button>
          </div>
          {conversations.length === 0
            ? <p className="sb-empty">No conversations yet</p>
            : conversations.map(conv => (
                <div
                  key={conv.id}
                  className={`conv-item ${conversationId === conv.id ? 'active' : ''}`}
                  onClick={() => loadConversation(conv.id)}
                >
                  <p className="conv-title">{conv.title}</p>
                  <p className="conv-date">{new Date(conv.created_at).toLocaleDateString()}</p>
                </div>
              ))
          }
          <div className="sb-back">
            <Link href={`/projects/${id}`}>← Project</Link>
          </div>
        </div>

        {/* Main */}
        <div className="chat-main">
          <div className="chat-header">
            <div className="chat-avatar">✦</div>
            <div>
              <p className="chat-header-title">AI Assistant</p>
              <p className="chat-header-sub">Ask anything about your project</p>
            </div>
          </div>

          {messages.length === 0 ? (
            <div className="chat-empty">
              <h2 className="chat-empty-title">Start a conversation</h2>
              <p className="chat-empty-sub">Ask anything about your project</p>
              <div className="suggestions">
                {SUGGESTIONS.map(s => (
                  <button key={s} className="sugg-btn" onClick={() => setInput(s)}>{s}</button>
                ))}
              </div>
            </div>
          ) : (
            <div className="messages">
              {messages.map((msg, i) => (
                <div key={i} className={`msg-wrap ${msg.role}`}>
                  <div className={`bubble ${msg.role}`}>{msg.content}</div>
                </div>
              ))}
              {loading && (
                <div className="msg-wrap assistant">
                  <div className="typing">
                    <div className="dot-t" /><div className="dot-t" /><div className="dot-t" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}

          <div className="chat-input-row">
            <textarea
              className="chat-textarea"
              placeholder="Ask anything… (Enter to send)"
              rows={2}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="send-btn" onClick={handleSend} disabled={loading || !input.trim()}>
              Send
            </button>
          </div>
        </div>

      </div>
    </>
  )
}