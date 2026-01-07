import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Save, Send, Printer, History, GitBranch, Lock, Eye, AlertCircle, Loader, FilePlus, Upload, RotateCcw } from 'lucide-react';
import { Quote, QuoteItem, QuoteStatus } from '../types';
import * as pdfjsLib from 'pdfjs-dist';

// Robust handling for PDF.js imports (ESM/CJS interop)
const pdfjs = (pdfjsLib as any).default || pdfjsLib;

interface QuoteHistoryEntry {
  version: number;
  date: string;
  status: QuoteStatus;
  items: QuoteItem[];
  customer: string;
  total: number;
}

const QuoteBuilder = () => {
  // Current State
  const [customer, setCustomer] = useState('');
  const [items, setItems] = useState<QuoteItem[]>([
    { id: '1', sku: '', description: '', quantity: 1, unit_price: 0, total: 0 }
  ]);
  const [status, setStatus] = useState<QuoteStatus>(QuoteStatus.DRAFT);
  const [version, setVersion] = useState(1);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isParsingAI, setIsParsingAI] = useState(false);
  const [workerReady, setWorkerReady] = useState(false);
  
  // History State
  const [history, setHistory] = useState<QuoteHistoryEntry[]>([]);
  const [viewingVersion, setViewingVersion] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Import Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derived State
  const isViewingHistory = viewingVersion !== null;
  const isEditable = !isViewingHistory && status === QuoteStatus.DRAFT;
  
  // If viewing history, find that entry, otherwise use current state
  const displayedItems = isViewingHistory 
    ? history.find(h => h.version === viewingVersion)?.items || []
    : items;
  
  const displayedCustomer = isViewingHistory
    ? history.find(h => h.version === viewingVersion)?.customer || ''
    : customer;

  const displayedStatus = isViewingHistory
    ? history.find(h => h.version === viewingVersion)?.status || QuoteStatus.DRAFT
    : status;

  const displayedVersion = isViewingHistory ? viewingVersion : version;

  // Initialize PDF Worker securely using a Blob URL to mitigate CORS issues
  useEffect(() => {
    let workerBlobUrl: string | null = null;
    const loadPdfWorker = async () => {
      try {
        const workerVersion = '3.11.174'; // Match the version in import map EXACTLY
        const workerCdnUrl = `https://esm.sh/pdfjs-dist@${workerVersion}/build/pdf.worker.min.js`;
        
        const response = await fetch(workerCdnUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch PDF.js worker: ${response.statusText}`);
        }
        const workerScript = await response.text();
        const blob = new Blob([workerScript], { type: 'application/javascript' });
        workerBlobUrl = URL.createObjectURL(blob);
        pdfjs.GlobalWorkerOptions.workerSrc = workerBlobUrl;
        setWorkerReady(true);
      } catch (e) {
        console.error("Error setting PDF worker source:", e);
        // Optionally, display an error message to the user
      }
    };

    loadPdfWorker();

    return () => {
      if (workerBlobUrl) {
        URL.revokeObjectURL(workerBlobUrl);
      }
    };
  }, []);

  // Actions
  const addItem = () => {
    if (!isEditable) return;
    setItems([...items, { id: Date.now().toString(), sku: '', description: '', quantity: 1, unit_price: 0, total: 0 }]);
  };

  const removeItem = (id: string) => {
    if (!isEditable) return;
    setItems(items.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: keyof QuoteItem, value: string | number) => {
    if (!isEditable) return;
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unit_price') {
          updated.total = Number(updated.quantity) * Number(updated.unit_price);
        }
        return updated;
      }
      return item;
    }));
  };

  const calculateSubtotal = (currentItems: QuoteItem[]) => currentItems.reduce((sum, item) => sum + item.total, 0);
  const calculateTax = (currentItems: QuoteItem[]) => calculateSubtotal(currentItems) * 0.0825;
  const calculateTotal = (currentItems: QuoteItem[]) => calculateSubtotal(currentItems) + calculateTax(currentItems);

  const handleCreateRevision = () => {
    const historyEntry: QuoteHistoryEntry = {
      version,
      date: new Date().toISOString(),
      status,
      items: JSON.parse(JSON.stringify(items)),
      customer,
      total: calculateTotal(items)
    };
    
    setHistory(prev => [historyEntry, ...prev]);
    setVersion(v => v + 1);
    setStatus(QuoteStatus.DRAFT);
    setViewingVersion(null);
  };

  const loadVersion = (v: number) => {
    if (v === version) {
      setViewingVersion(null);
    } else {
      setViewingVersion(v);
    }
    setShowHistory(false);
  };

  const handleRestore = () => {
    if (viewingVersion === null) return;
    
    const entry = history.find(h => h.version === viewingVersion);
    if (!entry) return;

    if (confirm(`Are you sure you want to restore Version ${viewingVersion}?\n\nThis will overwrite your current draft contents with the data from Version ${viewingVersion}. The version number will remain v${version} (your current working version).`)) {
      setCustomer(entry.customer);
      // Deep copy items to ensure they are new instances
      setItems(JSON.parse(JSON.stringify(entry.items)));
      setStatus(QuoteStatus.DRAFT); // Always restore to Draft so it can be edited
      setViewingVersion(null);
      setShowHistory(false);
      alert(`Successfully restored content from Version ${viewingVersion}.`);
    }
  };

  const handleNewQuote = () => {
    if (confirm("Create new quote? Any unsaved changes to the current quote will be lost.")) {
      setCustomer('');
      setItems([{ id: Date.now().toString(), sku: '', description: '', quantity: 1, unit_price: 0, total: 0 }]);
      setStatus(QuoteStatus.DRAFT);
      setVersion(1);
      setHistory([]);
      setViewingVersion(null);
    }
  };

  // --- Import Logic ---
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert("Please upload a PDF file.");
      return;
    }

    setIsParsingAI(true);
    try {
      // 1. Extract Text from PDF locally
      const text = await extractTextFromPDF(file);
      
      if (!text || text.trim().length === 0) {
          throw new Error("No text found in PDF. Scanned images are not supported yet.");
      }

      // 2. Send Text to AI Endpoint
      const response = await fetch('/api/ai/parse-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);

      // 3. Populate Form
      if (data.items && Array.isArray(data.items) && data.items.length > 0) {
          const newItems = data.items.map((i: any) => ({
            id: Date.now().toString() + Math.random(),
            sku: i.sku || '',
            description: i.description || 'Imported Item',
            quantity: Number(i.quantity) || 1,
            unit_price: Number(i.unit_price) || 0,
            total: (Number(i.quantity) || 1) * (Number(i.unit_price) || 0)
          }));
          
          if (items.length > 1 || items[0].description !== '') {
              if (!confirm(`AI identified ${newItems.length} items. Replace current quote content?`)) return;
          }

          setItems(newItems);
          if (data.customer_name) setCustomer(data.customer_name);
      } else {
          alert("AI analyzed the document but couldn't confidently identify quote line items. The PDF might be an image scan or have a complex layout.");
      }
    } catch (err: any) {
      console.error(err);
      alert(`Failed to parse PDF: ${err.message}`);
    } finally {
      setIsParsingAI(false);
      if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    if (!workerReady) throw new Error("PDF Worker not ready yet. Please try again in a moment.");
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const doc = await loadingTask.promise;
      let fullText = '';
      
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const textContent = await page.getTextContent();
        
        // Advanced Text Extraction to Preserve Layout
        // 1. Get items and sort by Y (descending) then X (ascending)
        const items = (textContent.items as any[]).map(item => ({
            str: item.str,
            x: item.transform[4],
            y: item.transform[5],
            width: item.width,
            height: item.height
        }));

        // Sort: Top to bottom, then Left to Right
        items.sort((a, b) => {
            // Tolerance for same line
            if (Math.abs(b.y - a.y) < 5) {
                return a.x - b.x;
            }
            return b.y - a.y;
        });

        let pageText = '';
        let lastY = -1;
        let lastX = -1;

        items.forEach(item => {
            // Skip empty strings
            if (!item.str.trim()) return;

            if (lastY === -1) {
                pageText += item.str;
            } else {
                // Check if new line
                const yDiff = Math.abs(item.y - lastY);
                if (yDiff > 8) { // Threshold for new line
                    pageText += '\n' + item.str;
                    lastX = item.x + item.width;
                } else {
                    // Same line - check spacing
                    const xDiff = item.x - lastX;
                    if (xDiff > 10) { // Large gap implies column separation (approx 2-3 chars width)
                        pageText += '\t' + item.str; // Use tab for column separation
                    } else if (xDiff > 2) { // Small gap implies space between words
                        pageText += ' ' + item.str;
                    } else {
                        // Very close items (kerning or fragmented word)
                        pageText += item.str;
                    }
                    lastX = item.x + item.width;
                }
            }
            lastY = item.y;
            // Update lastX if this is the end of the line (handled in else block for spacing)
            if (Math.abs(item.y - lastY) > 8) {
               lastX = item.x + item.width; 
            }
        });
        
        fullText += `--- Page ${i} ---\n${pageText}\n`;
      }
      return fullText;
    } catch (err: any) {
      console.error(err);
      if (err.name === 'MissingPDFException') throw new Error("Invalid PDF structure.");
      throw new Error(`Failed to extract text: ${err.message}`);
    }
  };

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const payload = {
        quote: {
          id: `Q-${new Date().getFullYear()}-1004`,
          version: displayedVersion,
          created_at: new Date().toISOString()
        },
        customer: displayedCustomer,
        items: displayedItems
      };

      const response = await fetch('/api/pdf/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('PDF Generation failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Quote-Q-1004-v${displayedVersion}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error(error);
      alert('Failed to generate PDF');
      return false;
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleSend = async () => {
    if (status !== QuoteStatus.DRAFT) return;
    const success = await generatePDF();
    if (success) {
        setStatus(QuoteStatus.SENT);
        alert(`Quote v${version} sent to customer with PDF attachment!`);
    }
  };

  return (
    <div className="space-y-6">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
        accept="application/pdf" 
      />

      <div className="flex justify-between items-center no-print">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            {isViewingHistory ? 'Viewing History' : 'New Quote'}
            {!isEditable && !isViewingHistory && (
               <span className="px-3 py-1 text-xs font-bold bg-blue-100 text-blue-700 rounded-full uppercase tracking-wide">
                 {status}
               </span>
            )}
            {isViewingHistory && (
               <span className="px-3 py-1 text-xs font-bold bg-gray-200 text-gray-700 rounded-full uppercase tracking-wide">
                 v{viewingVersion} (Read Only)
               </span>
            )}
          </h1>
          <p className="text-gray-500">
            {isViewingHistory 
              ? `Viewing snapshot of version ${viewingVersion}. Restore this version or return to current to edit.` 
              : 'Create a new equipment or parts quote.'}
          </p>
        </div>
        
        <div className="flex space-x-3">
          {/* New / Import Buttons */}
          {!isViewingHistory && (
            <>
              <button 
                onClick={handleNewQuote}
                className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                <FilePlus size={18} />
                <span className="hidden lg:inline">New</span>
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isParsingAI || !workerReady}
                className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group relative"
              >
                {isParsingAI ? (
                    <div className="flex items-center space-x-2">
                        <Loader className="animate-spin text-industrial-600" size={18} />
                        <span className="hidden lg:inline text-industrial-600">Analyzing...</span>
                    </div>
                ) : (
                    <>
                        <Upload size={18} />
                        <span className="hidden lg:inline">Import PDF</span>
                    </>
                )}
                {!workerReady && (
                   <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-32 bg-black text-white text-xs py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                     Initializing Reader...
                   </span>
                )}
              </button>
            </>
          )}

          {/* History Dropdown Trigger */}
          <div className="relative">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              <History size={18} />
              <span>History (v{version})</span>
            </button>
            
            {showHistory && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                <div className="p-3 border-b border-gray-100 bg-gray-50 font-medium text-gray-700">
                  Version History
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {/* Current Version */}
                  <div 
                    onClick={() => loadVersion(version)}
                    className={`p-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${viewingVersion === null ? 'bg-blue-50/50' : ''}`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-gray-900">v{version} (Current)</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${status === QuoteStatus.DRAFT ? 'bg-gray-200' : 'bg-blue-100 text-blue-700'}`}>{status}</span>
                    </div>
                    <p className="text-xs text-gray-500">Last edited: Just now</p>
                  </div>

                  {/* Past Versions */}
                  {history.map((h) => (
                    <div 
                      key={h.version}
                      onClick={() => loadVersion(h.version)}
                      className={`p-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${viewingVersion === h.version ? 'bg-blue-50/50' : ''}`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-gray-900">v{h.version}</span>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{h.status}</span>
                      </div>
                      <p className="text-xs text-gray-500">{new Date(h.date).toLocaleString()}</p>
                      <p className="text-xs text-gray-500 mt-1 font-mono">${h.total.toFixed(2)}</p>
                    </div>
                  ))}

                  {history.length === 0 && (
                    <div className="p-4 text-center text-sm text-gray-400 italic">No previous versions</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={generatePDF} 
            disabled={isGeneratingPDF}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800 font-medium transition-colors disabled:opacity-50"
          >
            {isGeneratingPDF ? <Loader className="animate-spin" size={18} /> : <Printer size={18} />}
            <span className="hidden sm:inline">Print / PDF</span>
          </button>

          {/* Action Buttons based on State */}
          {isViewingHistory ? (
            <>
              <button 
                onClick={() => setViewingVersion(null)}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-gray-700 font-medium transition-colors"
              >
                <Eye size={18} />
                <span>Return to Current</span>
              </button>
              <button 
                onClick={handleRestore}
                className="flex items-center space-x-2 px-4 py-2 bg-industrial-600 hover:bg-industrial-500 rounded-lg text-white font-medium shadow-sm transition-colors"
              >
                <RotateCcw size={18} />
                <span>Restore Version {viewingVersion}</span>
              </button>
            </>
          ) : (
            <>
              {status === QuoteStatus.SENT || status === QuoteStatus.ACCEPTED ? (
                 <button 
                   onClick={handleCreateRevision}
                   className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium shadow-sm transition-colors"
                 >
                   <GitBranch size={18} />
                   <span>Create Revision v{version + 1}</span>
                 </button>
              ) : (
                <>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                    <Save size={18} />
                    <span>Save</span>
                  </button>
                  <button 
                    onClick={handleSend}
                    disabled={isGeneratingPDF}
                    className="flex items-center space-x-2 px-4 py-2 bg-industrial-600 hover:bg-industrial-500 rounded-lg text-white font-medium shadow-sm transition-colors disabled:opacity-50"
                  >
                    <Send size={18} />
                    <span>Send Quote</span>
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Main Quote Card */}
      <div className={`bg-white rounded-xl shadow-sm border overflow-hidden print:shadow-none print:border-none transition-all duration-300
        ${isViewingHistory ? 'border-blue-200 ring-4 ring-blue-50' : 'border-gray-200'}
      `}>
        {/* Banner for Read Only / Sent modes */}
        {isViewingHistory && (
          <div className="bg-blue-50 border-b border-blue-100 p-3 flex items-center justify-center text-blue-800 text-sm font-medium">
            <Lock size={16} className="mr-2" />
            Reading Mode: Viewing Version {viewingVersion}
          </div>
        )}
        {!isViewingHistory && status === QuoteStatus.SENT && (
           <div className="bg-yellow-50 border-b border-yellow-100 p-3 flex items-center justify-center text-yellow-800 text-sm font-medium">
             <AlertCircle size={16} className="mr-2" />
             Quote is locked because it has been sent. Create a revision to make changes.
           </div>
        )}

        {/* Header Branding */}
        <div className="bg-industrial-900 text-white p-8 print:bg-white print:text-black print:border-b-2 print:border-black">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-white print:text-black">AMERICAN <span className="text-industrial-500">IRON</span></h2>
              <p className="text-gray-400 mt-2 print:text-gray-600">Heavy Equipment & Parts</p>
              <div className="mt-4 text-sm text-gray-400 print:text-gray-800">
                <p>123 Industrial Parkway</p>
                <p>Houston, TX 77001</p>
                <p>(555) 123-4567 | sales@americanironus.com</p>
              </div>
            </div>
            <div className="text-right">
              <h3 className="text-4xl font-bold text-gray-700 print:text-black">QUOTE</h3>
              <p className="text-xl mt-2 font-mono">#Q-2023-1004</p>
              <div className="flex items-center justify-end gap-2 mt-1">
                <span className="text-sm px-2 py-0.5 bg-gray-700 rounded text-gray-300 print:bg-gray-100 print:text-black border border-gray-600 print:border-gray-300">
                  v{displayedVersion}
                </span>
                <span className="text-sm text-gray-400 print:text-gray-600">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Customer Info */}
          <div className="grid grid-cols-2 gap-12 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Bill To</label>
              <input 
                type="text" 
                placeholder="Search Customer..." 
                className={`w-full border-b border-gray-300 focus:border-industrial-500 focus:outline-none py-2 bg-transparent print:border-none ${!isEditable ? 'cursor-not-allowed text-gray-600' : ''}`}
                value={displayedCustomer}
                onChange={(e) => isEditable && setCustomer(e.target.value)}
                disabled={!isEditable}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Ship To</label>
              <div className="py-2 text-gray-400 italic">Same as billing address</div>
            </div>
          </div>

          {/* Line Items */}
          <table className="w-full mb-8">
            <thead>
              <tr className="border-b-2 border-gray-100 text-left">
                <th className="py-3 font-semibold text-gray-600 w-32">SKU</th>
                <th className="py-3 font-semibold text-gray-600">Description</th>
                <th className="py-3 font-semibold text-gray-600 w-24 text-center">Qty</th>
                <th className="py-3 font-semibold text-gray-600 w-32 text-right">Unit Price</th>
                <th className="py-3 font-semibold text-gray-600 w-32 text-right">Total</th>
                <th className="py-3 w-10 no-print"></th>
              </tr>
            </thead>
            <tbody>
              {displayedItems.map((item) => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-2">
                    <input 
                      type="text" 
                      className={`w-full bg-transparent focus:outline-none font-mono text-sm ${!isEditable ? 'cursor-not-allowed' : ''}`}
                      value={item.sku}
                      onChange={(e) => updateItem(item.id, 'sku', e.target.value)}
                      placeholder="SKU"
                      disabled={!isEditable}
                    />
                  </td>
                  <td className="py-2">
                    <input 
                      type="text" 
                      className={`w-full bg-transparent focus:outline-none ${!isEditable ? 'cursor-not-allowed' : ''}`}
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      placeholder="Item description"
                      disabled={!isEditable}
                    />
                  </td>
                  <td className="py-2">
                    <input 
                      type="number" 
                      className={`w-full bg-transparent focus:outline-none text-center ${!isEditable ? 'cursor-not-allowed' : ''}`}
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                      disabled={!isEditable}
                    />
                  </td>
                  <td className="py-2 text-right">
                    <input 
                      type="number" 
                      className={`w-full bg-transparent focus:outline-none text-right ${!isEditable ? 'cursor-not-allowed' : ''}`}
                      value={item.unit_price}
                      onChange={(e) => updateItem(item.id, 'unit_price', Number(e.target.value))}
                      disabled={!isEditable}
                    />
                  </td>
                  <td className="py-2 text-right font-medium">
                    ${item.total.toFixed(2)}
                  </td>
                  <td className="py-2 text-center no-print">
                    {isEditable && (
                      <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {isEditable && (
            <button onClick={addItem} className="flex items-center space-x-2 text-industrial-600 font-medium hover:text-industrial-700 mb-8 no-print">
              <Plus size={18} />
              <span>Add Line Item</span>
            </button>
          )}

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${calculateSubtotal(displayedItems).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (8.25%)</span>
                <span>${calculateTax(displayedItems).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 border-t pt-3 border-gray-200">
                <span>Total</span>
                <span>${calculateTotal(displayedItems).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Terms Footer */}
          <div className="mt-12 pt-8 border-t border-gray-100 text-sm text-gray-500">
            <h4 className="font-bold text-gray-700 mb-2">Terms & Conditions</h4>
            <p className="mb-1">1. Quotes are valid for 30 days.</p>
            <p className="mb-1">2. Shipping costs are estimated and may vary.</p>
            <p>3. 20% restocking fee on returned parts. No returns on electrical components.</p>
            <p className="mt-4 text-xs text-gray-400">Audit ID: {isViewingHistory ? `REV-${viewingVersion}` : 'LIVE-DRAFT'} | Generated via American Iron Portal</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteBuilder;