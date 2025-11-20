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
      <div className="flex h-[calc(100vh-3rem)] bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm">
        {/* Sidebar - Contact List */}
        <aside className="w-80 border-r border-[#E2E8F0] flex flex-col bg-white">
          <div className="p-4 border-b border-[#E2E8F0]">
            <Input
              label={undefined}
              placeholder="Search conversations"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              startIcon={<SearchIcon className="w-5 h-5" aria-hidden="true" />}
              className="h-10 bg-gray-50 border-gray-200"
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            <ul className="divide-y divide-[#E2E8F0]">
              {conversations.map(c => (
                <li key={c.id}>
                  <button
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-center gap-3 ${activeId === c.id ? 'bg-purple-50 hover:bg-purple-50' : ''
                      }`}
                    onClick={() => setActiveId(c.id)}
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-gray-600 font-semibold">
                      {c.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className={`text-sm font-semibold truncate ${activeId === c.id ? 'text-[#7D2AE8]' : 'text-gray-900'}`}>
                          {c.name}
                        </span>
                        <span className="text-[10px] text-gray-400">10:00</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {c.lastMessage}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Chat Area */}
        <section className="flex-1 flex flex-col min-w-0 bg-[#FAFAFA]">
          {/* Chat Header */}
          <div className="h-16 border-b border-[#E2E8F0] bg-white flex items-center justify-between px-6 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">
                {sampleConversations.find(c => c.id === activeId)?.name.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">
                  {sampleConversations.find(c => c.id === activeId)?.name}
                </div>
                <div className="text-xs text-green-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  Online
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-gray-500">
                <SearchIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <p>No messages yet</p>
              </div>
            ) : (
              messages.map(m => (
                <div key={m.id} className={`flex ${m.author === 'brand' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] px-4 py-2 text-sm rounded-xl shadow-sm ${m.author === 'brand'
                      ? 'bg-[#7D2AE8] text-white rounded-tr-none'
                      : 'bg-white border border-[#E2E8F0] text-gray-800 rounded-tl-none'
                    }`}>
                    <div className="leading-relaxed">{m.text}</div>
                    <div className={`text-[10px] mt-1 text-right ${m.author === 'brand' ? 'text-purple-200' : 'text-gray-400'
                      }`}>
                      {m.time}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-[#E2E8F0]">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="text-gray-500 hover:bg-gray-100 rounded-full w-10 h-10 p-0" aria-label="Attach file">
                <Paperclip className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <Input
                  label={undefined}
                  placeholder="Type a message..."
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all rounded-full px-6"
                />
              </div>
              <Button variant="primary" size="sm" onClick={send} className="rounded-full w-11 h-11 bg-[#7D2AE8] hover:bg-[#6D24CA] flex-shrink-0 p-0" aria-label="Send message">
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </section>
      </div>
    </BrandLayout>
  );
}