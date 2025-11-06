import React, { useState, useEffect, useRef } from 'react';
import { Election, QRCodeEntry, Application, ApplicationStatus, User, UserRole } from '../types';
import { DUMMY_ELECTION_TEMPLATE } from '../constants';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

declare const qrcode: any; // Declare qrcode as a global variable

interface ElectionsPageProps {
  user: User | null;
  elections: Election[];
  setElections: React.Dispatch<React.SetStateAction<Election[]>>;
  applications: Application[];
  setApplications: React.Dispatch<React.SetStateAction<Application[]>>;
  // Added to update global users state and current user in App.tsx
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  updateLoggedInUser: (updatedUser: User) => void;
}

const ElectionsPage: React.FC<ElectionsPageProps> = ({
  user,
  elections,
  setElections,
  applications,
  setApplications,
  setUsers,
  updateLoggedInUser,
}) => {
  const [studentNameInput, setStudentNameInput] = useState<string>(user?.username || ''); // For "Generate QR to Vote"
  const [studentRollNumberInput, setStudentRollNumberInput] = useState<string>(user?.rollNumber || ''); // For "Generate QR to Vote"
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | '' }>({ text: '', type: '' });
  const [showVoteQrModal, setShowVoteQrModal] = useState<boolean>(false);
  const [voteQrCodeValue, setVoteQrCodeValue] = useState<string>('');
  const [voteConfirmedCandidateId, setVoteConfirmedCandidateId] = useState<string>('');

  const voteQrCanvasRef = useRef<HTMLDivElement>(null);

  const currentElection = elections.find(e => e.id === DUMMY_ELECTION_TEMPLATE.id);

  // Check if the current user has already voted in this election
  const hasVoted = user?.votedElections?.includes(currentElection?.id || '') || false;

  // Effect to clear messages after a delay
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 5000); // Clear message after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Effect to render vote QR code when modal opens
  useEffect(() => {
    if (showVoteQrModal && voteQrCodeValue && voteQrCanvasRef.current) {
      voteQrCanvasRef.current.innerHTML = ''; // Clear previous QR
      new qrcode(voteQrCanvasRef.current, {
        text: voteQrCodeValue,
        width: 256,
        height: 256,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: qrcode.CorrectLevel.H
      });
    }
  }, [showVoteQrModal, voteQrCodeValue]);

  if (!user || user.role === UserRole.ADMIN) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50 p-8">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-xl text-gray-700 mb-6">
            Only students can participate in elections. Admins manage them.
          </p>
          {!user && (
             <p className="text-lg text-gray-600">Please log in as a student to vote.</p>
          )}
        </div>
      </div>
    );
  }

  if (!currentElection) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50 p-8">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">No Active Elections</h1>
          <p className="text-xl text-gray-700 mb-6">
            There are no elections available for voting at this moment.
          </p>
        </div>
      </div>
    );
  }

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

  const handleGenerateVoteQr = (event: React.FormEvent) => {
    event.preventDefault();

    if (hasVoted) {
      setMessage({ text: 'You have already voted for this election.', type: 'error' });
      return;
    }

    if (!studentNameInput || !studentRollNumberInput) {
      setMessage({ text: 'Please enter your name and roll number.', type: 'error' });
      return;
    }
    if (!selectedCandidateId) {
      setMessage({ text: 'Please select a candidate before generating QR.', type: 'error' });
      return;
    }

    const candidate = currentElection.candidates.find(c => c.id === selectedCandidateId);
    if (!candidate) {
        setMessage({ text: 'Selected candidate not found.', type: 'error' });
        return;
    }

    // Generate a unique QR code value for this specific vote
    const voteQrString = `VOTE|${currentElection.id}|${selectedCandidateId}|${user?.id}|${Date.now()}`;
    setVoteQrCodeValue(voteQrString);
    setVoteConfirmedCandidateId(selectedCandidateId); // Store for modal confirmation
    setShowVoteQrModal(true);
  };

  const handleSimulateVote = () => {
    if (!voteConfirmedCandidateId || !user) {
        setMessage({ text: 'No candidate selected or user not logged in.', type: 'error' });
        return;
    }

    // Double-check if already voted (should be caught earlier, but a safeguard)
    if (hasVoted) {
        setMessage({ text: 'You have already voted for this election.', type: 'error' });
        handleResetVotingState();
        setShowVoteQrModal(false);
        return;
    }

    // Update election votes
    setElections(prevElections =>
      prevElections.map(election => {
        if (election.id === currentElection.id) {
          const updatedCandidates = election.candidates.map(candidate =>
            candidate.id === voteConfirmedCandidateId
              ? { ...candidate, votes: candidate.votes + 1 }
              : candidate
          );
          return { ...election, candidates: updatedCandidates };
        }
        return election;
      })
    );

    // Update the logged-in user's votedElections status
    const updatedUser: User = {
        ...user,
        votedElections: user.votedElections ? [...user.votedElections, currentElection.id] : [currentElection.id]
    };

    // Update the global users state
    setUsers(prevUsers =>
        prevUsers.map(u => (u.id === updatedUser.id ? updatedUser : u))
    );

    // Update the current logged-in user state in App.tsx
    updateLoggedInUser(updatedUser);

    setMessage({ text: 'Your vote has been cast successfully!', type: 'success' });
    handleResetVotingState(); // Reset all states for a new vote
    setShowVoteQrModal(false); // Close the modal
  };

  const handleCancelVote = () => {
    setShowVoteQrModal(false);
    setMessage({ text: 'Vote cancelled.', type: 'error' });
    setVoteQrCodeValue('');
    setVoteConfirmedCandidateId('');
  };


  const handleResetVotingState = () => {
    setSelectedCandidateId('');
    setStudentNameInput(user?.username || ''); // Reset to pre-filled
    setStudentRollNumberInput(user?.rollNumber || ''); // Reset to pre-filled
    setMessage({ text: '', type: '' });
  };

  const hasApplied = applications.some(app => app.studentId === user.id && app.electionId === currentElection.id);

  const handleApplyForPosition = (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) {
        setMessage({ text: 'You must be logged in to apply.', type: 'error' });
        return;
    }
    if (hasApplied) {
        setMessage({ text: 'You have already applied for this election.', type: 'error' });
        return;
    }

    const newApplication: Application = {
      id: uuidv4(),
      studentId: user.id,
      studentName: user.username,
      electionId: currentElection.id,
      status: ApplicationStatus.PENDING,
    };

    setApplications(prevApps => [...prevApps, newApplication]);
    setMessage({ text: 'Your application has been submitted successfully for review!', type: 'success' });
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50 p-8">
      <div className="container mx-auto max-w-2xl bg-white p-8 rounded-lg shadow-xl">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 text-center">{currentElection.title}</h1>
        <p className="text-lg text-gray-700 mb-6 text-center">{currentElection.description}</p>

        <FeedbackMessage text={message.text} type={message.type} />

        {/* Application Section for Students */}
        <div className="space-y-6 p-6 border-2 border-dashed border-purple-300 rounded-lg bg-purple-50 mb-8">
          <h2 className="text-2xl font-bold text-purple-800 text-center mb-4">Apply for Position</h2>
          {hasApplied ? (
            <div className="text-center">
              <p className="text-purple-700 font-semibold mb-2">
                You have already applied for this election.
              </p>
              <p className={`text-lg font-medium ${
                applications.find(app => app.studentId === user.id && app.electionId === currentElection.id)?.status === ApplicationStatus.APPROVED
                  ? 'text-green-700' :
                applications.find(app => app.studentId === user.id && app.electionId === currentElection.id)?.status === ApplicationStatus.REJECTED
                  ? 'text-red-700' :
                  'text-yellow-700'
              }`}>
                Current Status: {applications.find(app => app.studentId === user.id && app.electionId === currentElection.id)?.status.toUpperCase()}
              </p>
            </div>
          ) : (
            <form onSubmit={handleApplyForPosition} className="flex justify-center">
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 transform hover:scale-105 transition-all duration-300"
                aria-label={`Apply for position in ${currentElection.title}`}
              >
                Apply to be a Candidate
              </button>
            </form>
          )}
        </div>


        {/* Voting Section for Students */}
        <div className="space-y-6 p-6 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50">
          <h2 className="text-2xl font-bold text-blue-800 text-center mb-4">Cast Your Vote</h2>

          {hasVoted ? (
            <div className="text-center p-4 bg-green-100 rounded-lg text-green-800 border-green-300">
              <p className="font-bold text-xl mb-2">✅ You have already voted for this election!</p>
              <p className="text-lg">Thank you for participating. Your vote cannot be changed.</p>
            </div>
          ) : (
            <form onSubmit={handleGenerateVoteQr}>
              <div className="mb-4">
                <label htmlFor="voterName" className="block text-blue-700 text-sm font-bold mb-2">
                  Your Name:
                </label>
                <input
                  type="text"
                  id="voterName"
                  className="shadow appearance-none border rounded-lg w-full py-3 px-4 bg-white text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  value={studentNameInput}
                  onChange={(e) => setStudentNameInput(e.target.value)}
                  required
                  readOnly={!!user?.username} // If user is logged in, name is pre-filled
                />
              </div>
              <div className="mb-6">
                <label htmlFor="voterRollNumber" className="block text-blue-700 text-sm font-bold mb-2">
                  Your Roll Number:
                </label>
                <input
                  type="text"
                  id="voterRollNumber"
                  className="shadow appearance-none border rounded-lg w-full py-3 px-4 bg-white text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  value={studentRollNumberInput}
                  onChange={(e) => setStudentRollNumberInput(e.target.value)}
                  required
                  readOnly={!!user?.rollNumber} // If user is logged in, roll number is pre-filled
                />
              </div>

              {currentElection.candidates.length === 0 ? (
                  <div className="text-center p-4 bg-yellow-100 rounded-lg text-yellow-800">
                      <p className="font-semibold">No candidates available for this election yet.</p>
                      <p className="text-sm">Applications are pending or no students have applied.</p>
                  </div>
              ) : (
                <div className="space-y-3 mb-6" role="radiogroup" aria-labelledby="candidate-selection-heading">
                  <p id="candidate-selection-heading" className="block text-blue-700 text-sm font-bold mb-2">
                    Select your preferred candidate:
                  </p>
                  {currentElection.candidates.map(candidate => (
                    <label
                      key={candidate.id}
                      htmlFor={`candidate-${candidate.id}`}
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedCandidateId === candidate.id
                          ? 'bg-blue-100 border-blue-600 shadow-md'
                          : 'bg-white border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <input
                        type="radio"
                        id={`candidate-${candidate.id}`}
                        name="candidate"
                        value={candidate.id}
                        checked={selectedCandidateId === candidate.id}
                        onChange={() => setSelectedCandidateId(candidate.id)}
                        className="form-radio h-5 w-5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        aria-label={candidate.name}
                      />
                      <span className="ml-3 text-lg font-medium text-gray-800">{candidate.name}</span>
                    </label>
                  ))}
                </div>
              )}

              <button
                type="submit"
                disabled={!selectedCandidateId || currentElection.candidates.length === 0 || !studentNameInput || !studentRollNumberInput}
                className={`w-full font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-75 transform hover:scale-105 transition-all duration-300 mt-6 ${
                  selectedCandidateId && currentElection.candidates.length > 0 && studentNameInput && studentRollNumberInput
                    ? 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
                    : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                }`}
                aria-disabled={!selectedCandidateId || currentElection.candidates.length === 0 || !studentNameInput || !studentRollNumberInput}
                aria-label="Generate QR to Vote"
              >
                Generate QR to Vote
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Vote QR Code Modal */}
      {showVoteQrModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog" aria-labelledby="voteQrCodeModalTitle">
          <div className="bg-white p-8 rounded-lg shadow-xl relative max-w-sm w-full text-center">
            <h3 id="voteQrCodeModalTitle" className="text-2xl font-bold text-gray-800 mb-4">Scan to Vote</h3>
            <p className="text-gray-700 mb-4">Scan this QR code with your phone to cast your vote for: <span className="font-semibold">{currentElection.candidates.find(c => c.id === voteConfirmedCandidateId)?.name}</span></p>
            <div ref={voteQrCanvasRef} className="flex justify-center p-4 bg-gray-50 border border-gray-200 rounded-md mx-auto">
              {/* QR code will be rendered here by qrcode.js */}
            </div>
            <p className="text-center text-gray-700 text-sm break-all font-mono mt-4 p-2 bg-gray-100 rounded-md">
              <span className="font-semibold">Code:</span> {voteQrCodeValue}
            </p>
            <div className="mt-6 flex flex-col space-y-3">
                <p className="text-gray-800 font-semibold">Simulate "Phone Vote" Action:</p>
                <button
                    onClick={handleSimulateVote}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300"
                    aria-label="Confirm and Cast Vote"
                >
                    Confirm Vote
                </button>
                <button
                    onClick={handleCancelVote}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300"
                    aria-label="Cancel Voting Process"
                >
                    Cancel
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElectionsPage;