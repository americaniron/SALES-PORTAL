import React, { useState } from 'react';
import { Search, Send, Phone, Video, MoreVertical, MessageSquare } from 'lucide-react';

const Messages = () => {
  const [selectedThread, setSelectedThread] = useState<string | null>('1');

  const threads = [
    { id: '1', name: 'Mike Smith', company: 'Texas Excavation', preview: 'When can I expect the quote for the CAT 320 parts?', time: '10:42 AM', unread: true },
    { id: '2', name: 'Sarah Jones', company: 'Bayou Heavy Haul', preview: 'Thanks for the quick turnaround on that invoice.', time: 'Yesterday', unread: false },
    { id: '3', name: 'David Wilson', company: 'Alamo Construction', preview: 'We need to discuss the credit terms.', time: 'Mon', unread: false },
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Sidebar List */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search messages..." 
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-industrial-500 text-sm"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {threads.map((thread) => (
            <div 
              key={thread.id}
              onClick={() => setSelectedThread(thread.id)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedThread === thread.id ? 'bg-blue-50 border-l-4 border-l-industrial-500' : 'border-l-4 border-l-transparent'}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`font-semibold text-sm ${thread.unread ? 'text-gray-900' : 'text-gray-700'}`}>{thread.name}</span>
                <span className="text-xs text-gray-400">{thread.time}</span>
              </div>
              <div className="text-xs text-industrial-600 mb-1 font-medium">{thread.company}</div>
              <p className={`text-sm truncate ${thread.unread ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                {thread.preview}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedThread ? (
          <>
            <div className="h-16 border-b border-gray-200 flex justify-between items-center px-6">
              <div>
                <h3 className="font-bold text-gray-900">Mike Smith</h3>
                <p className="text-xs text-gray-500">Texas Excavation Inc.</p>
              </div>
              <div className="flex space-x-4 text-gray-400">
                <Phone size={20} className="hover:text-gray-600 cursor-pointer" />
                <Video size={20} className="hover:text-gray-600 cursor-pointer" />
                <MoreVertical size={20} className="hover:text-gray-600 cursor-pointer" />
              </div>
            </div>
            
            <div className="flex-1 bg-gray-50 p-6 overflow-y-auto space-y-4">
              <div className="flex justify-center">
                <span className="text-xs text-gray-400 bg-gray-200 px-3 py-1 rounded-full">Today, 10:30 AM</span>
              </div>
              
              {/* Message Received */}
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 text-gray-800 rounded-tr-xl rounded-br-xl rounded-bl-xl p-4 max-w-md shadow-sm">
                  <p className="text-sm">Hi, I'm looking at the quote you sent yesterday. Does this include shipping to Houston?</p>
                </div>
              </div>

              {/* Message Sent */}
              <div className="flex justify-end">
                <div className="bg-industrial-600 text-white rounded-tl-xl rounded-bl-xl rounded-br-xl p-4 max-w-md shadow-sm">
                  <p className="text-sm">Yes Mike, line item 4 covers the freight to your Houston yard.</p>
                </div>
              </div>

              {/* Message Received */}
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 text-gray-800 rounded-tr-xl rounded-br-xl rounded-bl-xl p-4 max-w-md shadow-sm">
                  <p className="text-sm">Great. When can I expect the quote for the CAT 320 parts we discussed on the phone?</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-industrial-500"
                />
                <button className="bg-industrial-600 hover:bg-industrial-500 text-white p-2 rounded-lg transition-colors">
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MessageSquare size={48} className="mb-4 opacity-20" />
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;