import React, { useState, useRef, useEffect } from 'react';
import { Election, QRCodeEntry } from '../types';
import { DUMMY_ELECTION_TEMPLATE } from '../constants'; // Import dummy election template

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
  const [selectedElectionId, setSelectedElectionId] = useState<string>(elections[0]?.id || '');
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [currentQrCodeValue, setCurrentQrCodeValue] = useState<string>('');
  const [generationMessage, setGenerationMessage] = useState<{ text: string; type: 'success' | 'error' | '' }>({ text: '', type: '' });
  const [copiedQrCode, setCopiedQrCode] = useState<string | null>(null); // To show 'Copied!' feedback

  const qrCanvasRef = useRef<HTMLDivElement>(null);

  // Set default selected election if available
  useEffect(() => {
    if (elections.length > 0 && !selectedElectionId) {
      setSelectedElectionId(elections[0].id);
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
    if (numToGenerate <= 0 || !selectedElectionId) {
      setGenerationMessage({ text: 'Please enter a valid number and select an election.', type: 'error' });
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

  const filteredQrCodes = selectedElectionId === 'all'
    ? qrCodes
    : qrCodes.filter(qr => qr.electionId === selectedElectionId);

  const FeedbackMessage: React.FC<{ text: string; type: 'success' | 'error' | '' }> = ({ text, type }) => {
    if (!text) return null;
    const bgColor = type === 'success' ? 'bg-green-100' : 'bg-red-100';
    const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
    const icon = type === 'success' ? '✅' : '❌';
    return (
      <div
        className={`p-4 mb-6 rounded-lg flex items-center ${bgColor} ${textColor}`}
        role="status"
        aria-live="polite"
      >
        <span className="mr-3 text-xl">{icon}</span>
        <p className="font-medium">{text}</p>
      </div>
    );
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50 p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6">QR Codes Management</h1>
        <p className="text-xl text-gray-700 mb-8">
          Admins can generate secure QR codes here for student voting. Each code is unique and can only be used once.
        </p>

        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Generate New QR Codes</h2>
          <FeedbackMessage text={generationMessage.text} type={generationMessage.type} />
          <form onSubmit={handleGenerateQrCodes} className="space-y-4">
            <div>
              <label htmlFor="electionSelect" className="block text-gray-700 text-sm font-bold mb-2">
                Select Election:
              </label>
              <select
                id="electionSelect"
                className="shadow appearance-none border rounded-lg w-full py-3 px-4 bg-white text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                value={selectedElectionId}
                onChange={(e) => setSelectedElectionId(e.target.value)}
                required
                aria-label="Select election for QR code generation"
              >
                {elections.map((election) => (
                  <option key={election.id} value={election.id}>
                    {election.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="numCodes" className="block text-gray-700 text-sm font-bold mb-2">
                Number of QR Codes to Generate:
              </label>
              <input
                type="number"
                id="numCodes"
                min="1"
                className="shadow appearance-none border rounded-lg w-full py-3 px-4 bg-white text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                value={numToGenerate}
                onChange={(e) => setNumToGenerate(parseInt(e.target.value) || 1)}
                required
                aria-label="Number of QR codes to generate"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transform hover:scale-105 transition-all duration-300"
              aria-label="Generate QR Codes"
            >
              Generate QR Codes
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Generated QR Codes</h2>
          {qrCodes.length > 0 && (
            <div className="mb-4">
              <label htmlFor="filterElectionSelect" className="block text-gray-700 text-sm font-bold mb-2">
                Filter by Election:
              </label>
              <select
                id="filterElectionSelect"
                className="shadow appearance-none border rounded-lg w-full py-3 px-4 bg-white text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
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

          {filteredQrCodes.length === 0 ? (
            <p className="text-gray-600">No QR codes generated yet, or none match the selected filter.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-2">
              {filteredQrCodes.map((qrEntry) => (
                <div
                  key={qrEntry.qrCode}
                  className={`flex flex-col p-4 rounded-lg border ${
                    qrEntry.used ? 'bg-gray-100 border-gray-300' : 'bg-green-50 border-green-200'
                  } transition-all duration-200`}
                >
                  <span className="font-mono text-sm text-gray-800 break-all mb-2">{qrEntry.qrCode}</span>
                  <span
                    className={`text-xs font-semibold ${
                      qrEntry.used ? 'text-gray-500' : 'text-green-600'
                    }`}
                  >
                    Status: {qrEntry.used ? 'Used' : 'Unused'} (Election: {elections.find(e => e.id === qrEntry.electionId)?.title || 'N/A'})
                  </span>
                  <div className="flex justify-end space-x-2 mt-3">
                    <button
                      onClick={() => handleCopyToClipboard(qrEntry.qrCode)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-semibold py-2 px-3 rounded-lg transition-all duration-200"
                      aria-label={`Copy QR code ${qrEntry.qrCode}`}
                    >
                      {copiedQrCode === qrEntry.qrCode ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      onClick={() => handleShowQr(qrEntry.qrCode)}
                      className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-all duration-200"
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
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog" aria-labelledby="qrCodeModalTitle">
          <div className="bg-white p-8 rounded-lg shadow-xl relative max-w-sm w-full">
            <h3 id="qrCodeModalTitle" className="text-2xl font-bold text-gray-800 mb-4 text-center">QR Code for Voting</h3>
            <div ref={qrCanvasRef} className="flex justify-center p-4 bg-gray-50 border border-gray-200 rounded-md">
              {/* QR code will be rendered here by qrcode.js */}
            </div>
            <p className="text-center text-gray-700 text-sm break-all font-mono mt-4 p-2 bg-gray-100 rounded-md">
              <span className="font-semibold">Value:</span> {currentQrCodeValue}
            </p>
            <button
              onClick={handleCloseQrModal}
              className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300"
              aria-label="Close QR Code modal"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QrCodesPage;