import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api.ts';
import { SupportTicket, Message } from '../../types/index.ts';
import {
  MessageSquare,
  Send,
  Headphones,
  Bell,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Users,
  ChevronRight,
  UserCheck
} from 'lucide-react';

export const AdminSupportCommunication: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'TICKETS' | 'MESSAGES' | 'ANNOUNCEMENTS'>('TICKETS');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // Active ticket selection
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  // Direct 1:1 message state
  const [directMsgContent, setDirectMsgContent] = useState('');
  const [isSendingDirect, setIsSendingDirect] = useState(false);

  // Announcement state
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementBody, setAnnouncementBody] = useState('');
  const [announcementTarget, setAnnouncementTarget] = useState<'ALL' | 'WORKERS' | 'CLIENTS'>('WORKERS');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  const fetchData = async () => {
    try {
      const [ticketsRes, msgsRes] = await Promise.all([
        apiRequest<{ tickets: SupportTicket[] }>('/api/support-tickets').catch(() => ({ tickets: [] })),
        apiRequest<{ messages: Message[] }>('/api/messages').catch(() => ({ messages: [] })),
      ]);
      setTickets(ticketsRes.tickets || []);
      setMessages(msgsRes.messages || []);
      if (ticketsRes.tickets?.length > 0 && !selectedTicket) {
        setSelectedTicket(ticketsRes.tickets[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSendTicketReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !ticketReplyText.trim()) return;
    setIsReplying(true);
    try {
      const res = await apiRequest<{ ticket: SupportTicket }>(
        `/api/support-tickets/${selectedTicket.id}/reply`,
        {
          method: 'POST',
          body: JSON.stringify({ message: ticketReplyText }),
        }
      );
      setSelectedTicket(res.ticket);
      setTicketReplyText('');
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to reply');
    } finally {
      setIsReplying(false);
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, status: string) => {
    try {
      await apiRequest(`/api/support-tickets/${ticketId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      fetchData();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: status as any });
      }
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle || !announcementBody) return;
    setIsBroadcasting(true);
    setBroadcastSuccess(false);
    try {
      await apiRequest('/api/notifications/broadcast', {
        method: 'POST',
        body: JSON.stringify({
          title: announcementTitle,
          message: announcementBody,
        }),
      });
      setBroadcastSuccess(true);
      setAnnouncementTitle('');
      setAnnouncementBody('');
      setTimeout(() => setBroadcastSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to broadcast announcement');
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Support Desk & Communications</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Resolve customer help tickets, direct message workers/clients, and broadcast system announcements.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium">
          <button
            onClick={() => setActiveTab('TICKETS')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'TICKETS'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Headphones className="w-3.5 h-3.5 text-emerald-400" />
            <span>Support Tickets ({tickets.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('MESSAGES')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'MESSAGES'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
            <span>Internal Chat Stream</span>
          </button>
          <button
            onClick={() => setActiveTab('ANNOUNCEMENTS')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'ANNOUNCEMENTS'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-purple-400" />
            <span>Announcements Broadcast</span>
          </button>
        </div>
      </div>

      {/* 1. SUPPORT TICKETING SYSTEM */}
      {activeTab === 'TICKETS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
          {/* Ticket Queue List */}
          <div className="lg:col-span-5 rounded-3xl bg-slate-900/80 border border-slate-800 p-4 space-y-2 overflow-y-auto max-h-[560px]">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
              Support Inquiries Queue
            </div>
            {tickets.map((t) => {
              const isSelected = selectedTicket?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-xs space-y-1.5 ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-bold text-white truncate">{t.subject}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold uppercase ${
                        t.priority === 'URGENT' || t.priority === 'HIGH'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>{t.userName} ({t.userRole})</span>
                    <span className="font-semibold text-emerald-400">{t.status}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Ticket Thread View */}
          <div className="lg:col-span-7 rounded-3xl bg-slate-900/80 border border-slate-800 p-6 flex flex-col justify-between">
            {selectedTicket ? (
              <div className="h-full flex flex-col justify-between space-y-4">
                {/* Ticket Top bar */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="font-bold text-base text-white">{selectedTicket.subject}</h3>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Opened by <strong className="text-slate-200">{selectedTicket.userName}</strong> · Category: {selectedTicket.category}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleUpdateTicketStatus(selectedTicket.id, e.target.value)}
                      className="text-xs px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 font-semibold"
                    >
                      <option value="NEW">NEW</option>
                      <option value="ASSIGNED">ASSIGNED</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="WAITING">WAITING</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </div>
                </div>

                {/* Messages Stream */}
                <div className="flex-1 overflow-y-auto space-y-3 p-1 max-h-[340px]">
                  {selectedTicket.messages.map((m, i) => {
                    const isAdmin = m.senderRole === 'ADMIN';
                    return (
                      <div
                        key={i}
                        className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                      >
                        <div className="text-[10px] text-slate-400 mb-0.5">
                          {m.senderName} ({m.senderRole}) · {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div
                          className={`p-3 rounded-2xl max-w-md text-xs leading-relaxed ${
                            isAdmin
                              ? 'bg-emerald-600 text-white rounded-tr-none'
                              : 'bg-slate-950 text-slate-200 rounded-tl-none border border-slate-800'
                          }`}
                        >
                          {m.message}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendTicketReply} className="pt-3 border-t border-slate-800 flex gap-2">
                  <input
                    type="text"
                    value={ticketReplyText}
                    onChange={(e) => setTicketReplyText(e.target.value)}
                    placeholder="Type official response to ticket..."
                    className="flex-1 text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-hidden"
                  />
                  <button
                    type="submit"
                    disabled={isReplying || !ticketReplyText.trim()}
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-xs shadow-md transition-all disabled:opacity-50"
                  >
                    {isReplying ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Reply</span>}
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs">Select a ticket from the left queue.</div>
            )}
          </div>
        </div>
      )}

      {/* 2. INTERNAL CHAT STREAM */}
      {activeTab === 'MESSAGES' && (
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <h3 className="font-bold text-sm text-white">Live Operations Chat Stream</h3>
            <span className="text-xs text-slate-400 font-mono">{messages.length} messages logged</span>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {messages.map((m) => (
              <div key={m.id} className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-white">
                    {m.senderName} <span className="text-slate-500 font-normal">({m.senderRole})</span>
                  </div>
                  <div className="text-slate-300 mt-1">{m.content}</div>
                </div>
                <div className="text-[10px] text-slate-500 font-mono shrink-0">
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. BROADCAST ANNOUNCEMENTS */}
      {activeTab === 'ANNOUNCEMENTS' && (
        <div className="max-w-2xl mx-auto rounded-3xl bg-slate-900/80 border border-slate-800 p-8 space-y-4">
          <div>
            <h3 className="font-bold text-lg text-white">Broadcast Announcement Center</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Send immediate push alerts to accredited agent notifications and client dashboards.
            </p>
          </div>

          {broadcastSuccess && (
            <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Broadcast successfully dispatched to all target accounts!</span>
            </div>
          )}

          <form onSubmit={handleBroadcast} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Audience</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAnnouncementTarget('WORKERS')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    announcementTarget === 'WORKERS'
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  Accredited Agents
                </button>
                <button
                  type="button"
                  onClick={() => setAnnouncementTarget('CLIENTS')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    announcementTarget === 'CLIENTS'
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  Clients
                </button>
                <button
                  type="button"
                  onClick={() => setAnnouncementTarget('ALL')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    announcementTarget === 'ALL'
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  Entire Platform
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Announcement Headline</label>
              <input
                type="text"
                required
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                placeholder="e.g. Major Influx of High-Volume Data Entry Projects Available"
                className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Message Content</label>
              <textarea
                rows={4}
                required
                value={announcementBody}
                onChange={(e) => setAnnouncementBody(e.target.value)}
                placeholder="Write detailed broadcast notice for the platform..."
                className="w-full text-xs p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={isBroadcasting}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-2xl shadow-lg transition-all"
            >
              {isBroadcasting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : <span>Dispatch Broadcast</span>}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
