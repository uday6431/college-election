import React, { useState, useRef, useEffect } from 'react';
import { Election, QRCodeEntry } from '../types';
import { DUMMY_ELECTION_TEMPLATE } from '../constants'; // Import dummy election template
import Footer from '../components/Footer';

// Declare qrcode as a global variable, as it's loaded via CDN
declare const qrcode: any;

interface QrCodesPageProps {
  qrCodes: QRCodeEntry[];
  setQrCodes: React.Dispatch<React.SetStateAction<QRCodeEntry[]>>;
  elections: Election[];
}

// Simple UUID generator (for client-side uniqueness without a library)
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const QrCodesPage: React.FC<QrCodesPageProps> = ({ qrCodes, setQrCodes, elections }) => {
  const [numToGenerate, setNumToGenerate] = useState<number>(1);
  const [selectedElectionId, setSelectedElectionId] = useState<string>(elections[0]?.id || 'all'); // Default to 'all' or first election
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [currentQrCodeValue, setCurrentQrCodeValue] = useState<string>('');
  const [generationMessage, setGenerationMessage] = useState<{ text: string; type: 'success' | 'error' | '' }>({ text: '', type: '' });
  const [copiedQrCode, setCopiedQrCode] = useState<string | null>(null); // To show 'Copied!' feedback

  const qrCanvasRef = useRef<HTMLDivElement>(null);

  // Set default selected election if available
  useEffect(() => {
    if (elections.length > 0 && (selectedElectionId === 'all' || !elections.some(e => e.id === selectedElectionId))) { // Only set if 'all' is selected or current selection is invalid
      setSelectedElectionId(elections[0].id);
    } else if (elections.length === 0 && selectedElectionId !== 'all') { // If no elections, ensure 'all' or an empty state
        setSelectedElectionId('all');
    }
  }, [elections, selectedElectionId]);

  // Effect to render QR code when modal opens and value is set
  useEffect(() => {
    if (showQrModal && currentQrCodeValue && qrCanvasRef.current) {
      qrCanvasRef.current.innerHTML = ''; // Clear previous QR
      new qrcode(qrCanvasRef.current, {
        text: currentQrCodeValue,
        width: 256,
        height: 256,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : qrcode.CorrectLevel.H
      });
    }
  }, [showQrModal, currentQrCodeValue]);

  // Effect to clear generation message after a delay
  useEffect(() => {
    if (generationMessage.text) {
      const timer = setTimeout(() => {
        setGenerationMessage({ text: '', type: '' });
      }, 5000); // Clear message after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [generationMessage]);

  // Effect to clear copied message after a delay
  useEffect(() => {
    if (copiedQrCode) {
      const timer = setTimeout(() => {
        setCopiedQrCode(null);
      }, 2000); // Clear 'Copied!' message after 2 seconds
      return () => clearTimeout(timer);
    }
  }, [copiedQrCode]);


  const handleGenerateQrCodes = (event: React.FormEvent) => {
    event.preventDefault();
    if (numToGenerate <= 0 || !selectedElectionId || selectedElectionId === 'all') {
      setGenerationMessage({ text: 'Please enter a valid number (greater than 0) and select a specific election.', type: 'error' });
      return;
    }

    const newQrCodes: QRCodeEntry[] = [];
    for (let i = 0; i < numToGenerate; i++) {
      newQrCodes.push({
        qrCode: generateUUID(),
        used: false,
        electionId: selectedElectionId,
      });
    }

    setQrCodes((prev) => [...prev, ...newQrCodes]);
    const selectedElectionTitle = elections.find(e => e.id === selectedElectionId)?.title || 'selected election';
    setGenerationMessage({ text: `${numToGenerate} unique QR codes generated successfully for "${selectedElectionTitle}".`, type: 'success' });
    setNumToGenerate(1); // Reset input
  };

  const handleShowQr = (qrCodeValue: string) => {
    setCurrentQrCodeValue(qrCodeValue);
    setShowQrModal(true);
  };

  const handleCloseQrModal = () => {
    setShowQrModal(false);
    setCurrentQrCodeValue('');
  };

  const handleCopyToClipboard = (qrCodeValue: string) => {
    navigator.clipboard.writeText(qrCodeValue).then(() => {
      setCopiedQrCode(qrCodeValue);
    }).catch(err => {
      console.error('Failed to copy QR code:', err);
      // Optionally, show an error message
    });
  };

  const displayedQrCodes = selectedElectionId === 'all'
    ? qrCodes
    : qrCodes.filter(qr => qr.electionId === selectedElectionId);

  const FeedbackMessage: React.FC<{ text: string; type: 'success' | 'error' | '' }> = ({ text, type }) => {
    if (!text) return null;
    const bgColor = type === 'success' ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300';
    const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
    const icon = type === 'success' ? '✅' : '❌';
    return (
      <div
        className={`p-4 mb-6 rounded-lg border flex items-center ${bgColor} ${textColor}`}
        role="status"
        aria-live="polite"
      >
        <span className="mr-3 text-xl">{icon}</span>
        <p className="font-medium">{text}</p>
      </div>
    );
  };

  return (
    <>
      <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 text-center">QR Codes Management</h1>
          <p className="text-xl text-gray-700 mb-10 text-center leading-relaxed">
            Admins can generate secure, unique QR codes here to facilitate student voting. Each code is designed for single-use.
          </p>

          <div className="bg-white p-8 rounded-xl shadow-xl border border-gray-100 mb-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3 border-gray-200">Generate New QR Codes</h2>
            <FeedbackMessage text={generationMessage.text} type={generationMessage.type} />
            <form onSubmit={handleGenerateQrCodes} className="space-y-6">
              <div>
                <label htmlFor="electionSelect" className="block text-gray-700 text-base font-bold mb-2">
                  Select Election:
                </label>
                <select
                  id="electionSelect"
                  className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 bg-white text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  value={selectedElectionId}
                  onChange={(e) => setSelectedElectionId(e.target.value)}
                  required
                  aria-label="Select election for QR code generation"
                >
                  <option value="">-- Select an Election --</option>
                  {elections.map((election) => (
                    <option key={election.id} value={election.id}>
                      {election.title}
                    </option>
                  ))}
                </select>
                {elections.length === 0 && (
                  <p className="text-sm text-red-500 mt-2" role="alert">No elections available. Please ensure an election is configured.</p>
                )}
              </div>
              <div>
                <label htmlFor="numCodes" className="block text-gray-700 text-base font-bold mb-2">
                  Number of QR Codes to Generate:
                </label>
                <input
                  type="number"
                  id="numCodes"
                  min="1"
                  className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 bg-white text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  value={numToGenerate}
                  onChange={(e) => setNumToGenerate(Math.max(1, parseInt(e.target.value) || 1))} // Ensure at least 1
                  required
                  aria-label="Number of QR codes to generate"
                />
              </div>
              <button
                type="submit"
                disabled={elections.length === 0 || !selectedElectionId || selectedElectionId === ''}
                className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-300 transform hover:scale-105 transition-all duration-300 shadow-lg ${
                  (elections.length === 0 || !selectedElectionId || selectedElectionId === '') ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                aria-disabled={elections.length === 0 || !selectedElectionId || selectedElectionId === ''}
                aria-label="Generate QR Codes"
              >
                Generate QR Codes
              </button>
            </form>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-xl border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3 border-gray-200">Existing QR Codes</h2>
            {qrCodes.length > 0 && (
              <div className="mb-6">
                <label htmlFor="filterElectionSelect" className="block text-gray-700 text-base font-bold mb-2">
                  Filter by Election:
                </label>
                <select
                  id="filterElectionSelect"
                  className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 bg-white text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  value={selectedElectionId} // Use same state for filter to simplify
                  onChange={(e) => setSelectedElectionId(e.target.value)}
                  aria-label="Filter QR codes by election"
                >
                  <option value="all">All Elections</option>
                  {elections.map((election) => (
                    <option key={election.id} value={election.id}>
                      {election.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {displayedQrCodes.length === 0 ? (
              <p className="text-gray-600 text-lg p-5 bg-blue-50 rounded-lg border border-blue-200">
                No QR codes generated yet, or none match the selected filter. Generate some above!
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[600px] overflow-y-auto pr-3">
                {displayedQrCodes.map((qrEntry) => (
                  <div
                    key={qrEntry.qrCode}
                    className={`flex flex-col p-5 rounded-lg border shadow-sm transition-all duration-200 ${
                      qrEntry.used ? 'bg-gray-100 border-gray-300' : 'bg-green-50 border-green-300'
                    }`}
                  >
                    <span className="font-mono text-sm text-gray-800 break-all mb-3 font-semibold">{qrEntry.qrCode}</span>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full inline-block w-fit ${
                        qrEntry.used ? 'bg-gray-400 text-white' : 'bg-green-600 text-white'
                      }`}
                    >
                      Status: {qrEntry.used ? 'Used' : 'Unused'}
                    </span>
                    <span className="text-sm text-gray-600 mt-2">
                      Election: {elections.find(e => e.id === qrEntry.electionId)?.title || 'N/A'}
                    </span>
                    <div className="flex justify-end space-x-3 mt-4">
                      <button
                        onClick={() => handleCopyToClipboard(qrEntry.qrCode)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-sm relative group"
                        aria-label={`Copy QR code ${qrEntry.qrCode}`}
                      >
                        {copiedQrCode === qrEntry.qrCode ? 'Copied!' : 'Copy'}
                      </button>
                      <button
                        onClick={() => handleShowQr(qrEntry.qrCode)}
                        className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-sm"
                        aria-label={`Show visual QR code for ${qrEntry.qrCode}`}
                      >
                        Show QR
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* QR Code Modal */}
        {showQrModal && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 p-4 animate-fade-in" aria-modal="true" role="dialog" aria-labelledby="qrCodeModalTitle">
            <div className="bg-white p-8 rounded-xl shadow-2xl relative max-w-sm w-full text-center transform scale-95 animate-scale-in border border-gray-100">
              <h3 id="qrCodeModalTitle" className="text-3xl font-bold text-gray-800 mb-5">QR Code for Voting</h3>
              <p className="text-gray-700 text-lg mb-6">Present this QR code for scanning to cast a vote.</p>
              <div ref={qrCanvasRef} className="flex justify-center p-5 bg-gray-50 border border-gray-200 rounded-lg mx-auto max-w-[280px]">
                {/* QR code will be rendered here by qrcode.js */}
              </div>
              <p className="text-center text-gray-700 text-sm break-all font-mono mt-5 p-3 bg-gray-100 rounded-md border border-gray-200">
                <span className="font-semibold text-gray-800">Value:</span> {currentQrCodeValue}
              </p>
              <button
                onClick={handleCloseQrModal}
                className="mt-8 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-label="Close QR Code modal"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default QrCodesPage;