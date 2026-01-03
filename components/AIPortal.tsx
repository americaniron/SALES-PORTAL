import React, { useState } from 'react';
import { Sparkles, Check, X, RefreshCw, Send, Brain } from 'lucide-react';
import { AIAction } from '../types';

// Mock data simulating API response
const mockSuggestions: AIAction[] = [
  {
    id: '1',
    customer_id: 'cust_123',
    type: 'upsell',
    suggestion: 'Suggest heavy-duty filter kit for CAT 320 Excavator',
    confidence: 0.92,
    status: 'suggested',
    generated_message: "Hi Bob, I saw you ordered the CAT 320 preventive maintenance parts. We have the heavy-duty air filter kits in stock that usually go with that service. Want me to add one to the quote? It's 15% off this week."
  },
  {
    id: '2',
    customer_id: 'cust_456',
    type: 'winback',
    suggestion: 'Customer inactive for 90 days. Send re-engagement offer.',
    confidence: 0.85,
    status: 'suggested',
    generated_message: "Hello from American Iron! It's been a while. We just got a fresh dismantle of a Komatsu loader that matches your fleet. Check out the parts list here: [Link]"
  }
];

const AIPortal = () => {
  const [suggestions, setSuggestions] = useState<AIAction[]>(mockSuggestions);
  const [loading, setLoading] = useState(false);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    // In production: Call /api/ai/action
    setSuggestions(prev => prev.map(s => 
      s.id === id ? { ...s, status: action === 'approve' ? 'approved' : 'rejected' } : s
    ));
  };

  const generateNewCampaign = async () => {
    setLoading(true);
    // Simulate API call to Gemini
    setTimeout(() => {
      setLoading(false);
      alert("Weekly campaign generated! Check the Drafts folder.");
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="text-industrial-500" />
            AI Sales Assistant
          </h1>
          <p className="text-gray-500">Powered by Gemini. Review and approve suggestions based on customer data.</p>
        </div>
        <button 
          onClick={generateNewCampaign}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
        >
          {loading ? <RefreshCw className="animate-spin" size={18} /> : <Brain size={18} />}
          <span>Generate Weekly Campaign</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {suggestions.filter(s => s.status === 'suggested').map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-industrial-500"></div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide
                  ${item.type === 'upsell' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}
                `}>
                  {item.type}
                </span>
                <span className="text-sm text-gray-400 font-mono">Confidence: {(item.confidence * 100).toFixed(0)}%</span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.suggestion}</h3>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6">
                <p className="text-sm text-gray-600 italic">"{item.generated_message}"</p>
              </div>

              <div className="flex space-x-3">
                <button 
                  onClick={() => handleAction(item.id, 'approve')}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-industrial-600 hover:bg-industrial-500 text-white rounded-lg font-medium transition-colors"
                >
                  <Check size={18} />
                  <span>Approve & Send</span>
                </button>
                <button 
                  onClick={() => handleAction(item.id, 'reject')}
                  className="px-4 py-2 bg-white border border-gray-300 hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-lg font-medium transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {suggestions.filter(s => s.status === 'suggested').length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
          <Check className="mx-auto text-green-500 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
          <p className="text-gray-500">No pending AI suggestions.</p>
        </div>
      )}
    </div>
  );
};

export default AIPortal;
