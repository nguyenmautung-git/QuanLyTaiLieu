import React, { useState, useRef, useEffect, useContext } from 'react';
import { Bot, X, Send, Minimize2, Maximize2, Trash2, Loader } from 'lucide-react';
import { DocumentContext } from '../context/DocumentContext';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'meta-llama/llama-3.1-8b-instruct:free';

const AIAssistant = () => {
  const { documents, projects, members, partners, biddingPackages } = useContext(DocumentContext);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Xin chào! Tôi là **AI Trợ lý** của hệ thống FDI Projects. Tôi có thể giúp bạn:\n\n• Tóm tắt và phân tích tài liệu dự án\n• Trả lời câu hỏi về tiến độ, gói thầu\n• Tổng hợp thông tin từ nhiều nguồn\n\nBạn muốn hỏi gì hôm nay?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const buildSystemContext = () => {
    const projectSummary = projects.map(p =>
      `- Dự án: ${p.name} (Mã: ${p.code || 'N/A'}), Địa điểm: ${p.location || 'N/A'}, Chủ đầu tư: ${p.investor || 'N/A'}`
    ).join('\n') || 'Chưa có dự án nào.';

    const docSummary = documents.slice(0, 20).map(d =>
      `- [${d.documentCode || 'N/A'}] ${d.documentNumber || ''} - ${d.summary || 'Không có trích yếu'} (Loại: ${d.documentType || 'N/A'})`
    ).join('\n') || 'Chưa có tài liệu nào.';

    const biddingSummary = (biddingPackages || []).map(b =>
      `- [${b.code}] ${b.name} | Loại: ${b.type} | Trạng thái: ${b.status} | Dự toán: ${b.budget} VNĐ`
    ).join('\n') || 'Chưa có gói thầu nào.';

    return `Bạn là AI Trợ lý thông minh tích hợp trong hệ thống quản lý tài liệu dự án FDI.
Hãy trả lời bằng tiếng Việt, ngắn gọn, chuyên nghiệp và có cấu trúc rõ ràng.
Sử dụng emoji phù hợp để làm nổi bật thông tin quan trọng.

=== DỮ LIỆU HỆ THỐNG HIỆN TẠI ===

📁 DANH SÁCH DỰ ÁN (${projects.length} dự án):
${projectSummary}

📄 TÀI LIỆU GẦN ĐÂY (${documents.length} tài liệu tổng, hiển thị 20 mới nhất):
${docSummary}

📦 GÓI THẦU (${(biddingPackages || []).length} gói thầu):
${biddingSummary}

👥 THÀNH VIÊN: ${members.length} thành viên | ĐỐI TÁC: ${partners.length} đối tác`;
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const systemContext = buildSystemContext();

      // Build OpenAI-compatible message history
      const chatMessages = [
        { role: 'system', content: systemContext },
        ...messages.map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content
        })),
        { role: 'user', content: text }
      ];

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://nguyenmautung-git.github.io/QuanLyTaiLieu/',
          'X-Title': 'FDI Projects AI Assistant'
        },
        body: JSON.stringify({
          model: MODEL,
          messages: chatMessages,
          temperature: 0.7,
          max_tokens: 1024,
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message || `Lỗi ${res.status}`);
      }

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || 'Xin lỗi, tôi không thể trả lời lúc này.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ **Lỗi:** ${err.message}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderMessage = (content) => {
    // Simple markdown-like rendering
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^• /gm, '&bull; ')
      .replace(/\n/g, '<br/>');
  };

  return (
    <>
      {/* Floating toggle button */}
      {!isOpen && (
        <button
          id="ai-assistant-toggle"
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-primary), #7c3aed)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(79, 70, 229, 0.5)',
            zIndex: 999,
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(79,70,229,0.6)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(79,70,229,0.5)'; }}
          title="Mở AI Trợ lý"
        >
          <Bot size={26} />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: isMinimized ? '280px' : '420px',
          height: isMinimized ? 'auto' : '560px',
          backgroundColor: '#fff',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 999,
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          border: '1px solid var(--color-border)',
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, var(--color-primary), #7c3aed)',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: 'white',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={18} />
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>AI Trợ lý FDI</div>
                {!isMinimized && <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>Powered by Llama 3.1 (OpenRouter)</div>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setMessages([{ role: 'assistant', content: '🔄 Cuộc trò chuyện đã được xóa. Tôi có thể giúp gì cho bạn?' }])} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8, padding: '4px' }} title="Xóa hội thoại"><Trash2 size={16} /></button>
              <button onClick={() => setIsMinimized(!isMinimized)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8, padding: '4px' }} title={isMinimized ? 'Mở rộng' : 'Thu nhỏ'}>{isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}</button>
              <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8, padding: '4px' }} title="Đóng"><X size={16} /></button>
            </div>
          </div>

          {/* Messages */}
          {!isMinimized && (
            <>
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {messages.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '85%',
                      padding: '0.625rem 0.875rem',
                      borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                      backgroundColor: msg.role === 'user' ? 'var(--color-primary)' : 'var(--color-bg-surface-hover)',
                      color: msg.role === 'user' ? 'white' : 'var(--color-text-main)',
                      fontSize: '0.875rem',
                      lineHeight: '1.5',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                    }}
                      dangerouslySetInnerHTML={{ __html: renderMessage(msg.content) }}
                    />
                  </div>
                ))}
                {isLoading && (
                  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <div style={{ padding: '0.625rem 0.875rem', borderRadius: '14px 14px 14px 4px', backgroundColor: 'var(--color-bg-surface-hover)', display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <Loader size={14} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-primary)' }} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Đang xử lý...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick prompts */}
              <div style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-surface)' }}>
                {['Tóm tắt dự án hiện có', 'Tình trạng gói thầu', 'Danh sách tài liệu mới'].map(q => (
                  <button key={q} onClick={() => { setInput(q); inputRef.current?.focus(); }}
                    style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: '20px', border: '1px solid var(--color-border)', background: 'white', cursor: 'pointer', color: 'var(--color-primary)', whiteSpace: 'nowrap' }}>
                    {q}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '0.5rem', alignItems: 'flex-end', flexShrink: 0 }}>
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhập câu hỏi... (Enter để gửi)"
                  style={{
                    flex: 1,
                    resize: 'none',
                    border: '1px solid var(--color-border)',
                    borderRadius: '10px',
                    padding: '0.6rem 0.875rem',
                    fontSize: '0.875rem',
                    outline: 'none',
                    fontFamily: 'inherit',
                    backgroundColor: 'var(--color-bg-surface)',
                    lineHeight: '1.4',
                    maxHeight: '100px',
                    overflowY: 'auto',
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  style={{
                    width: '38px', height: '38px', borderRadius: '50%',
                    background: input.trim() && !isLoading ? 'linear-gradient(135deg, var(--color-primary), #7c3aed)' : 'var(--color-border)',
                    border: 'none', cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', flexShrink: 0, transition: 'background 0.2s',
                  }}
                >
                  <Send size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
};

export default AIAssistant;
