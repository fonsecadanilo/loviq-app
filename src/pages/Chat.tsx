import React, { useMemo, useState } from 'react';
import BrandLayout from '../components/dashboard/BrandLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Search as SearchIcon, Send, Paperclip } from 'lucide-react';

type Conversation = {
  id: string;
  name: string;
  lastMessage: string;
};

type Message = {
  id: string;
  author: 'brand' | 'creator';
  text: string;
  time: string;
};

const sampleConversations: Conversation[] = [
  { id: 'conv-1', name: 'Emily Rodriguez', lastMessage: 'Thanks! I will update the SKU list.' },
  { id: 'conv-2', name: 'Michael Chen', lastMessage: 'Can we change the commission to 15%?' },
  { id: 'conv-3', name: 'Alice Johnson', lastMessage: 'Approved. Let’s go live tomorrow.' },
  { id: 'conv-4', name: 'John Smith', lastMessage: 'Inventory updated on Shopify.' },
  { id: 'conv-5', name: 'Laura Martinez', lastMessage: 'New campaign assets attached.' },
];

const sampleMessages: Record<string, Message[]> = {
  'conv-1': [
    { id: 'm1', author: 'brand', text: 'Hi Emily, can you review the product list?', time: '10:02' },
    { id: 'm2', author: 'creator', text: 'Sure! I will check and send feedback.', time: '10:03' },
    { id: 'm3', author: 'brand', text: 'Great, thanks!', time: '10:05' },
  ],
  'conv-2': [
    { id: 'm1', author: 'creator', text: 'Can we change the commission to 15%?', time: '09:20' },
    { id: 'm2', author: 'brand', text: 'We can do 12% for this campaign.', time: '09:22' },
  ],
};

export default function Chat() {
  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState<string>('conv-1');
  const [draft, setDraft] = useState('');

  const conversations = useMemo(() => {
    const q = search.toLowerCase();
    return sampleConversations.filter(c => c.name.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q));
  }, [search]);

  const messages = useMemo(() => {
    return sampleMessages[activeId] || [];
  }, [activeId]);

  const send = () => {
    if (!draft.trim()) return;
    setDraft('');
  };

  return (
    <BrandLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chat</h1>
            <p className="text-gray-600 text-sm sm:text-base">Communicate with creators about campaigns and lives</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <aside className="lg:col-span-4">
            <div className="rounded-2xl border border-[#E2E8F0] bg-white">
              <div className="p-4 border-b border-[#E2E8F0]">
                <Input
                  label={undefined}
                  placeholder="Search conversations"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  startIcon={<SearchIcon className="w-5 h-5" aria-hidden="true" />}
                  className="h-12"
                />
              </div>
              <ul className="divide-y divide-[#E2E8F0]">
                {conversations.map(c => (
                  <li key={c.id}>
                    <button
                      className={`w-full text-left p-4 flex flex-col gap-1 transition-colors ${activeId === c.id ? 'bg-[#F8FAFC]' : 'hover:bg-[#F8FAFC]'}`}
                      onClick={() => setActiveId(c.id)}
                      aria-label={`Open conversation with ${c.name}`}
                    >
                      <span className="text-sm font-medium text-gray-900">{c.name}</span>
                      <span className="text-xs text-gray-600 truncate">{c.lastMessage}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <section className="lg:col-span-8">
            <div className="rounded-2xl border border-[#E2E8F0] bg-white h-[640px] flex flex-col">
              <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
                <div className="text-sm font-medium text-gray-900">Conversation</div>
                <div className="text-xs text-gray-600">{messages.length} messages</div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-700">No messages yet</div>
                ) : (
                  messages.map(m => (
                    <div key={m.id} className={`flex ${m.author === 'brand' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] px-3 py-2 text-sm rounded-2xl border ${m.author === 'brand' ? 'bg-[#F5F3FF] border-[#E2E8F0]' : 'bg-white border-[#E2E8F0]'}`}>
                        <div className="text-gray-900">{m.text}</div>
                        <div className="text-[11px] text-gray-500 mt-1">{m.time}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-3 border-t border-[#E2E8F0] flex items-center gap-2">
                <Button variant="outline" size="md" aria-label="Attach file"><Paperclip className="w-4 h-4" /></Button>
                <Input
                  label={undefined}
                  placeholder="Type a message"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="h-12"
                />
                <Button variant="primary" size="lg" onClick={send} aria-label="Send message"><Send className="w-4 h-4" /></Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </BrandLayout>
  );
}