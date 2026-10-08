import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { apiRequest } from '../../lib/api.ts';
import { Message } from '../../types/index.ts';
import { Send, Shield, Headphones, Loader2, Sparkles } from 'lucide-react';

export const AgentSupport: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const fetchMessages = async () => {
    try {
      const res = await apiRequest<{ messages: Message[] }>('/api/messages');
      setMessages(res.messages || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      const res = await apiRequest<{ message: Message }>('/api/messages', {
        method: 'POST',
        body: JSON.stringify({
          content: newMessage,
        }),
      });
      setMessages((prev) => [...prev, res.message]);
      setNewMessage('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Admin Operations Desk</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Direct messaging with Swashub platform coordinators for project clarifications, M-Pesa inquiries, and milestone reviews.
        </p>
      </div>

      <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-800/90 shadow-2xl flex flex-col h-[580px] overflow-hidden">
        {/* Support Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-white">Swashub Operations Desk</div>
              <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Active Coordinator Online</span>
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
            Escrow Protected Line
          </span>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">Loading operational chat history...</div>
          ) : messages.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No support inquiries yet. Type your message below to reach the administration desk.
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.senderId === user?.id;
              return (
                <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="text-[10px] text-slate-400 mb-1">
                    <span className="font-semibold text-slate-300">{m.senderName}</span> ·{' '}
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div
                    className={`p-4 rounded-2xl max-w-md text-xs leading-relaxed ${
                      isMe
                        ? 'bg-emerald-400 text-slate-950 font-medium rounded-tr-none shadow-md shadow-emerald-500/10'
                        : 'bg-slate-800/90 text-white rounded-tl-none border border-slate-700'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-800 bg-slate-950/60 flex gap-2.5">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message to Swashub operations..."
            className="flex-1 text-xs px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden"
          />
          <button
            type="submit"
            disabled={isSending || !newMessage.trim()}
            className="px-6 py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
