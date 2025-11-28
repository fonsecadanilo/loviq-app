import React from 'react';
import { Search, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';

interface Contact {
    id: string;
    name: string;
    avatar?: string;
    lastMessage: string;
    timestamp: Date;
    unreadCount: number;
    online: boolean;
}

interface ContactListProps {
    contacts: Contact[];
    selectedContactId: string | null;
    onSelectContact: (id: string) => void;
}

export const ContactList: React.FC<ContactListProps> = ({
    contacts,
    selectedContactId,
    onSelectContact,
}) => {
    return (
        <div className="flex flex-col h-full bg-white border-r border-slate-100 w-80 lg:w-96 flex-shrink-0">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <h2 className="font-bold text-slate-900 text-lg">Conversations</h2>
                <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-600">
                    <MoreVertical className="w-5 h-5" />
                </button>
            </div>

            <div className="p-4">
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search contacts..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder-slate-400 text-slate-900"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
                {contacts.map((contact) => (
                    <div
                        key={contact.id}
                        onClick={() => onSelectContact(contact.id)}
                        className={`p-4 flex items-center gap-3 cursor-pointer transition-all border-b border-slate-50 hover:bg-slate-50 ${
                            selectedContactId === contact.id ? 'bg-slate-50' : ''
                        }`}
                    >
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-semibold text-lg flex-shrink-0 overflow-hidden border border-slate-100">
                                {contact.avatar ? (
                                    <img
                                        src={contact.avatar}
                                        alt={contact.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    contact.name.charAt(0)
                                )}
                            </div>
                            {contact.online && (
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className={`font-semibold truncate text-sm ${selectedContactId === contact.id ? 'text-slate-900' : 'text-slate-700'}`}>
                                    {contact.name}
                                </h3>
                                <span className="text-xs text-slate-400 whitespace-nowrap ml-2 font-medium">
                                    {format(contact.timestamp, 'HH:mm')}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className={`text-sm truncate ${contact.unreadCount > 0 ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                                    {contact.lastMessage}
                                </p>
                                {contact.unreadCount > 0 && (
                                    <span className="ml-2 min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-slate-900 text-white text-[10px] font-bold rounded-full">
                                        {contact.unreadCount}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
