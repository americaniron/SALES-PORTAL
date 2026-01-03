import React from 'react';
import { ExternalLink } from 'lucide-react';

const ExternalQuoter = () => {
  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            AI Quoter Tool
            <span className="text-xs font-normal px-2 py-1 bg-blue-100 text-blue-700 rounded-full">External</span>
          </h1>
          <p className="text-gray-500">Access the specialized AI Quoting application.</p>
        </div>
        <a 
          href="https://american-iron-ai-quoter-327138571630.us-west1.run.app/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center space-x-2 text-sm text-industrial-600 hover:text-industrial-800 font-medium"
        >
          <span>Open in new tab</span>
          <ExternalLink size={16} />
        </a>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
        <iframe 
          src="https://american-iron-ai-quoter-327138571630.us-west1.run.app/"
          className="w-full h-full border-0"
          title="American Iron AI Quoter"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default ExternalQuoter;