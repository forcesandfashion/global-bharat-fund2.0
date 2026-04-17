'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { chatApi, connectionApi, userApi } from '@/lib/api';
import { uploadFile, generateFilePath } from '@/lib/firebase';
import { useAuth } from '@/store/auth';
import {
  Send, Paperclip, Image as ImageIcon, FileText, Search,
 Check, CheckCheck, Download,
  ArrowLeft, Users, MessageSquare, Clock,  Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface ChatMessage {
  id: string; senderId: string; recipientId: string; content?: string;
  timestamp: string; status?: string;
  messageType: 'TEXT'|'IMAGE'|'DOCUMENT'|'MIXED';
  attachmentUrl?: string; attachmentName?: string;
  attachmentMimeType?: string; attachmentSize?: number;
}
interface ChatUser { id: string; firstName: string; lastName: string; email: string; userType: string; profileImageUrl?: string; }
interface Quota { limitMinutes: number; usedMinutes: number; remainingMinutes: number; canChat: boolean; unlimited: boolean; planPrice: number; }

const fmtTime = (ts: string) => { const d=new Date(ts); return isNaN(d.getTime())?'':d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}); };
const fmtSize = (b?: number) => { if(!b) return ''; if(b<1024) return b+' B'; if(b<1048576) return (b/1024).toFixed(1)+' KB'; return (b/1048576).toFixed(1)+' MB'; };
const fmtDate = (ts: string) => { const d=new Date(ts); if(isNaN(d.getTime())) return ''; const t=new Date(); if(d.toDateString()===t.toDateString()) return 'Today'; const y=new Date(Date.now()-86400000); if(d.toDateString()===y.toDateString()) return 'Yesterday'; return d.toLocaleDateString('en-US',{month:'short',day:'numeric'}); };
const AVATAR_COLORS: Record<string,string> = { FOUNDER:'from-blue-400 to-blue-600', INVESTOR:'from-green-400 to-green-600', MENTOR:'from-orange-400 to-orange-500', INFLUENCER:'from-purple-400 to-purple-600' };

const PLAN_LIMITS: { price: number; label: string; minutes: number|null; color: string }[] = [
  { price:0,   label:'No Plan',    minutes:0,    color:'text-red-500' },
  { price:99,  label:'Starter',    minutes:30,   color:'text-blue-600' },
  { price:199, label:'Growth',     minutes:60,   color:'text-green-600' },
  { price:699, label:'Pro',        minutes:360,  color:'text-orange-600' },
  { price:999, label:'Enterprise', minutes:null, color:'text-purple-600' },
];

export default function ChatPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get('userId');
  const [contacts, setContacts] = useState<ChatUser[]>([]);
  const [activeUser, setActiveUser] = useState<ChatUser|null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [quota, setQuota] = useState<Quota|null>(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [search, setSearch] = useState('');
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [showMobileList, setShowMobileList] = useState(!preselectedId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<NodeJS.Timeout|null>(null);
  const myId = user?.userId || '';
  const isFounder = user?.userType === 'FOUNDER';

  useEffect(() => { loadContacts(); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);
  useEffect(() => () => { if(pollRef.current) clearInterval(pollRef.current); }, []);

  const loadContacts = async () => {
    try {
      const [connRes, usersRes] = await Promise.all([connectionApi.getConnections(), userApi.getAllUsers()]);
      const connections: string[] = connRes.data || [];
      const usersMap: Record<string,ChatUser> = {};
      (usersRes.data||[]).forEach((u:ChatUser) => { usersMap[u.id]=u; });
      const list = connections.filter((c:any) => c.status==='ACCEPTED')
        .map((c:any) => { const oid = c.requesterId===myId ? c.recipientId : c.requesterId; return usersMap[oid]; })
        .filter(Boolean) as ChatUser[];
      setContacts(list);
      if(preselectedId) { const t=usersMap[preselectedId]||list.find(x=>x.id===preselectedId); if(t) openChat(t); }
    } catch{}
  };

  const openChat = useCallback(async (chatUser: ChatUser) => {
    setActiveUser(chatUser);
    setShowMobileList(false);
    setLoadingMsgs(true);
    setMessages([]);
    if(pollRef.current) clearInterval(pollRef.current);
    try {
      const res = await chatApi.getHistory(chatUser.id, 0, 50);
      setMessages(res.data || []);
    } catch {} finally { setLoadingMsgs(false); }
    // Load quota for founder→mentor chats
    if(isFounder && chatUser.userType==='MENTOR') {
      chatApi.getQuota(chatUser.id).then(r=>setQuota(r.data)).catch(()=>setQuota(null));
    } else { setQuota(null); }
    // Poll every 3s
    pollRef.current = setInterval(async () => {
      try {
        const r = await chatApi.getHistory(chatUser.id, 0, 50);
        setMessages(r.data || []);
        if(isFounder && chatUser.userType==='MENTOR') {
          chatApi.getQuota(chatUser.id).then(res=>setQuota(res.data)).catch(()=>{});
        }
      } catch{}
    }, 3000);
  }, [myId, isFounder]);

  const sendText = async () => {
    if(!text.trim() || !activeUser || sending) return;
    setSending(true);
    const optimistic: ChatMessage = { id:`tmp_${Date.now()}`, senderId:myId, recipientId:activeUser.id, content:text, timestamp:new Date().toISOString(), messageType:'TEXT', status:'SENDING' };
    setMessages(p=>[...p, optimistic]);
    const sentText=text; setText('');
    try {
      await chatApi.sendMessage(activeUser.id, sentText);
      const r = await chatApi.getHistory(activeUser.id, 0, 50);
      setMessages(r.data||[]);
      if(quota) chatApi.getQuota(activeUser.id).then(res=>setQuota(res.data)).catch(()=>{});
    } catch(err:any) {
      setMessages(p=>p.filter(m=>m.id!==optimistic.id));
      setText(sentText);
      const errMsg = err.response?.data?.message || 'Failed to send';
      const isQuotaErr = err.response?.data?.error === 'CHAT_QUOTA_EXCEEDED';
      if(isQuotaErr) {
        toast.error(errMsg, { duration: 5000 });
        if(quota) chatApi.getQuota(activeUser.id).then(res=>setQuota(res.data)).catch(()=>{});
      } else { toast.error(errMsg); }
    } finally { setSending(false); }
  };

  const handleFileUpload = async (file: File, isImage: boolean) => {
    if(!activeUser || !user) return;
    setUploading(true); setUploadProgress(0);
    try {
      const path = generateFilePath(user.userId, isImage?'chat_images':'chat_files', file.name);
      const url = await uploadFile(file, path, setUploadProgress);
      await chatApi.sendMedia({ recipientId:activeUser.id, attachmentUrl:url, attachmentName:file.name, attachmentMimeType:file.type, attachmentSize:file.size, messageType:isImage?'IMAGE':'DOCUMENT' });
      const r = await chatApi.getHistory(activeUser.id, 0, 50);
      setMessages(r.data||[]);
      toast.success(isImage?'Image sent!':'File sent!');
    } catch(err:any) {
      const isQuotaErr = err.response?.data?.error === 'CHAT_QUOTA_EXCEEDED';
      toast.error(isQuotaErr ? err.response?.data?.message : 'Upload failed');
    } finally { setUploading(false); setUploadProgress(0); }
  };

  const filtered = contacts.filter(c=>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  // Group messages by date
  const grouped: {date:string; msgs:ChatMessage[]}[] = [];
  messages.forEach(m => {
    const lbl = fmtDate(m.timestamp);
    const last = grouped[grouped.length-1];
    if(last?.date===lbl) last.msgs.push(m);
    else grouped.push({date:lbl, msgs:[m]});
  });

  const canSendMessage = !quota || quota.canChat;
  const quotaPercent = quota && !quota.unlimited && quota.limitMinutes > 0
    ? Math.min(100, (quota.usedMinutes / quota.limitMinutes) * 100) : 0;

  return (
    <div className="flex h-[calc(100vh-80px)] bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      {/* Contact list */}
      <div className={`w-full md:w-80 flex-shrink-0 border-r border-gray-100 flex flex-col ${!showMobileList&&activeUser?'hidden md:flex':'flex'}`}>
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-display font-bold text-lg text-gray-900 mb-3">Messages</h2>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." className="input-field w-full pl-8 pr-3 py-2 rounded-xl text-sm"/>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.length===0 ? (
            <div className="p-8 text-center"><Users size={32} className="text-gray-200 mx-auto mb-2"/><p className="text-sm text-gray-400 font-medium">No connections yet</p><p className="text-xs text-gray-400 mt-1">Connect with people first</p></div>
          ) : filtered.map(c=>{
            const isActive=activeUser?.id===c.id;
            const initials=`${c.firstName?.[0]||''}${c.lastName?.[0]||''}`;
            const avColor=AVATAR_COLORS[c.userType]||'from-gray-400 to-gray-600';
            return (
              <button key={c.id} onClick={()=>openChat(c)} className={`w-full flex items-center gap-3 px-4 py-3.5 transition-all text-left hover:bg-gray-50 ${isActive?'bg-blue-50 border-r-2 border-blue-600':''}`}>
                <div className="relative flex-shrink-0">
                  {c.profileImageUrl
                    ? <img src={c.profileImageUrl} className="w-11 h-11 rounded-full object-cover" alt=""/>
                    : <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${avColor} flex items-center justify-center text-white font-bold text-sm`}>{initials}</div>}
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-gray-900 truncate">{c.firstName} {c.lastName}</div>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${c.userType==='FOUNDER'?'bg-blue-100 text-blue-700':c.userType==='INVESTOR'?'bg-green-100 text-green-700':c.userType==='MENTOR'?'bg-orange-100 text-orange-700':'bg-purple-100 text-purple-700'}`}>{c.userType}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat window */}
      <div className={`flex-1 flex flex-col ${showMobileList&&!activeUser?'hidden md:flex':'flex'}`}>
        {!activeUser ? (
          <div className="flex-1 flex items-center justify-center flex-col gap-4 text-center p-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <MessageSquare size={36} className="text-blue-500"/>
            </div>
            <div><p className="font-display font-bold text-xl text-gray-900">Select a conversation</p><p className="text-gray-400 text-sm mt-1">Choose a connection to start messaging</p></div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-white">
              <button onClick={()=>setShowMobileList(true)} className="md:hidden p-1.5 rounded-lg hover:bg-gray-100"><ArrowLeft size={18}/></button>
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${AVATAR_COLORS[activeUser.userType]||'from-gray-400 to-gray-600'} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                {activeUser.firstName?.[0]}{activeUser.lastName?.[0]}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 text-sm">{activeUser.firstName} {activeUser.lastName}</div>
                <div className="text-xs text-green-500 font-medium">{activeUser.userType}</div>
              </div>
              {/* Quota indicator for founder→mentor */}
              {isFounder && quota && (
                <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
                  <Clock size={13} className={quota.unlimited?'text-purple-600':quota.canChat?'text-green-600':'text-red-500'}/>
                  <div className="text-xs">
                    {quota.unlimited ? (
                      <span className="text-purple-600 font-semibold">Unlimited</span>
                    ) : quota.canChat ? (
                      <span className="text-green-700 font-semibold">{quota.remainingMinutes}m left today</span>
                    ) : (
                      <span className="text-red-500 font-semibold">Limit reached</span>
                    )}
                  </div>
                  {!quota.unlimited && quota.limitMinutes > 0 && (
                    <div className="w-16 h-1.5 bg-gray-200 rounded-full">
                      <div className={`h-full rounded-full transition-all ${quotaPercent>=100?'bg-red-500':quotaPercent>=70?'bg-orange-500':'bg-green-500'}`} style={{width:`${quotaPercent}%`}}/>
                    </div>
                  )}
                </div>
              )}
              <div className="flex items-center gap-1">
                {/* <button className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"><Phone size={16}/></button>
                <button className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"><Video size={16}/></button> */}
                {/* <button className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"><MoreVertical size={16}/></button> */}
              </div>
            </div>

            {/* Quota banner */}
            {isFounder && quota && !quota.canChat && (
              <div className="bg-red-50 border-b border-red-200 px-5 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Lock size={16} className="text-red-500 flex-shrink-0"/>
                  <p className="text-sm text-red-700 font-medium">
                    {quota.limitMinutes === 0
                      ? 'Subscribe to chat with mentors'
                      : `Daily limit of ${quota.limitMinutes} minutes reached`}
                  </p>
                </div>
                <Link href="/payment" className="flex-shrink-0 px-3 py-1.5 bg-orange-500 text-white text-xs font-bold rounded-xl hover:bg-orange-600">
                  Upgrade Plan
                </Link>
              </div>
            )}

            {/* Plan info for no-plan founders */}
            {isFounder && quota && quota.limitMinutes === 0 && (
              <div className="bg-blue-50 border-b border-blue-100 px-5 py-3">
                <p className="text-xs text-blue-700 font-medium mb-2">Chat limits by plan:</p>
                <div className="flex flex-wrap gap-2">
                  {PLAN_LIMITS.map(pl => (
                    <span key={pl.price} className={`text-xs px-2 py-1 rounded-lg bg-white border border-gray-200 ${pl.color} font-medium`}>
                      {pl.label}: {pl.minutes === null ? '∞ unlimited' : pl.minutes===0 ? 'No access' : `${pl.minutes}min/day`}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-gray-50/50">
              {loadingMsgs ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/>
                </div>
              ) : messages.length===0 ? (
                <div className="flex items-center justify-center h-full flex-col gap-3 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center"><MessageSquare size={28} className="text-blue-500"/></div>
                  <p className="text-gray-500 font-medium text-sm">Start the conversation!</p>
                  {isFounder && quota && !quota.canChat && <p className="text-xs text-red-400">Subscribe to message mentors</p>}
                </div>
              ) : grouped.map(({date,msgs})=>(
                <div key={date}>
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-gray-200"/>
                    <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full font-medium">{date}</span>
                    <div className="flex-1 h-px bg-gray-200"/>
                  </div>
                  <div className="space-y-2">
                    {msgs.map(msg=>{
                      const isMine=msg.senderId===myId;
                      const avColor=AVATAR_COLORS[activeUser.userType]||'from-gray-400 to-gray-600';
                      return (
                        <div key={msg.id} className={`flex ${isMine?'justify-end':'justify-start'}`}>
                          {!isMine&&<div className={`w-7 h-7 rounded-full bg-gradient-to-br ${avColor} flex items-center justify-center text-white text-xs font-bold mr-2 mt-1 flex-shrink-0`}>{activeUser.firstName?.[0]}</div>}
                          <div className={`max-w-[72%] flex flex-col ${isMine?'items-end':'items-start'}`}>
                            <div className={`rounded-2xl overflow-hidden ${isMine?'bg-blue-600 text-white rounded-br-sm':'bg-white text-gray-900 border border-gray-100 rounded-bl-sm shadow-sm'}`}>
                              {msg.messageType==='IMAGE'&&msg.attachmentUrl&&(
                                <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer">
                                  <img src={msg.attachmentUrl} alt="attachment" className="max-w-full max-h-60 object-cover w-full"/>
                                </a>
                              )}
                              {msg.messageType==='DOCUMENT'&&msg.attachmentUrl&&(
                                <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer"
                                  className={`flex items-center gap-3 px-4 py-3 ${isMine?'hover:bg-blue-700':'hover:bg-gray-50'} transition-colors`}>
                                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isMine?'bg-blue-500':'bg-blue-100'}`}>
                                    <FileText size={16} className={isMine?'text-white':'text-blue-600'}/>
                                  </div>
                                  <div className="min-w-0"><div className="text-xs font-semibold truncate max-w-36">{msg.attachmentName||'File'}</div><div className={`text-xs ${isMine?'text-blue-200':'text-gray-400'}`}>{fmtSize(msg.attachmentSize)}</div></div>
                                  <Download size={14} className={isMine?'text-blue-200':'text-gray-400'}/>
                                </a>
                              )}
                              {msg.content&&<p className="px-3.5 py-2.5 text-sm leading-relaxed">{msg.content}</p>}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1 px-1">
                              <span className="text-[10px] text-gray-400">{fmtTime(msg.timestamp)}</span>
                              {isMine&&(msg.status==='SENDING'?<Check size={10} className="text-gray-300"/>:msg.status==='READ'?<CheckCheck size={10} className="text-blue-500"/>:<CheckCheck size={10} className="text-gray-400"/>)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef}/>
            </div>

            {/* Upload progress */}
            {uploading&&(
              <div className="px-5 py-2 bg-blue-50 border-t border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-blue-200 rounded-full">
                    <div className="h-full bg-blue-600 rounded-full transition-all" style={{width:`${uploadProgress}%`}}/>
                  </div>
                  <span className="text-xs text-blue-600 font-medium">{Math.round(uploadProgress)}%</span>
                </div>
              </div>
            )}

            {/* Input */}
            <div className={`px-4 py-3 bg-white border-t border-gray-100 ${!canSendMessage?'opacity-80':''}`}>
              {!canSendMessage && isFounder ? (
                <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <Lock size={15}/>
                    <span>{quota?.limitMinutes===0?'Subscribe to chat with mentors':'Daily chat limit reached'}</span>
                  </div>
                  <Link href="/payment" className="btn-cta px-3 py-1.5 rounded-xl text-xs">Upgrade</Link>
                </div>
              ) : (
                <div className="flex items-end gap-2">
                  <div className="flex gap-1 pb-1">
                    <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={e=>e.target.files?.[0]&&handleFileUpload(e.target.files[0],true)}/>
                    <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip" className="hidden" onChange={e=>e.target.files?.[0]&&handleFileUpload(e.target.files[0],false)}/>
                    <button onClick={()=>imageInputRef.current?.click()} disabled={uploading} className="p-2 rounded-xl hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50" title="Send image"><ImageIcon size={19}/></button>
                    <button onClick={()=>fileInputRef.current?.click()} disabled={uploading} className="p-2 rounded-xl hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50" title="Send file"><Paperclip size={19}/></button>
                  </div>
                  <div className="flex-1 bg-gray-100 rounded-2xl flex items-end px-4 py-2.5">
                    <textarea value={text} onChange={e=>setText(e.target.value)}
                      onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendText();}}}
                      placeholder={`Message ${activeUser.firstName}...`} rows={1}
                      className="flex-1 bg-transparent resize-none outline-none text-sm text-gray-900 placeholder-gray-400 max-h-28" style={{lineHeight:'1.5'}}/>
                  </div>
                  <button onClick={sendText} disabled={!text.trim()||sending}
                    className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 transition-all disabled:opacity-40 flex-shrink-0">
                    {sending?<span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>:<Send size={16}/>}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
