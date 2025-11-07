import React from 'react';
import { Election } from '../types';
import { DUMMY_ELECTION_TEMPLATE } from '../constants';
import Footer from '../components/Footer';

interface ResultsPageProps {
  elections: Election[];
}

const ResultsPage: React.FC<ResultsPageProps> = ({ elections }) => {
  const currentElection = elections.find(e => e.id === DUMMY_ELECTION_TEMPLATE.id);

  if (!currentElection) {
    return (
      <>
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
          <div className="text-center bg-white p-10 rounded-xl shadow-xl border border-gray-100">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-5">No Election Results Available</h1>
            <p className="text-xl text-gray-700 mb-8">
              There are no elections currently configured to display results for.
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Calculate total votes for percentage calculation
  const totalVotes = currentElection.candidates.reduce((sum, candidate) => sum + candidate.votes, 0);

  // Sort candidates by votes in descending order
  const sortedCandidates = [...currentElection.candidates].sort((a, b) => b.votes - a.votes);

  const winner = sortedCandidates.length > 0 && totalVotes > 0 ? sortedCandidates[0] : null;

  return (
    <>
      <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="container mx-auto max-w-4xl bg-white p-10 rounded-xl shadow-xl border border-gray-100">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-5 text-center">Election Results</h1>
          <p className="text-lg md:text-xl text-gray-700 mb-10 text-center leading-relaxed">
            Current results for the <span className="font-extrabold text-blue-700">{currentElection.title}</span> election.
          </p>

          {currentElection.candidates.length === 0 ? (
            <div className="text-center p-8 bg-yellow-50 border-2 border-dashed border-yellow-300 rounded-xl">
              <p className="text-2xl text-yellow-800 font-bold mb-4">📋 No candidates have been approved yet!</p>
              <p className="text-lg text-yellow-700">Administrators need to approve applications before results can be displayed here.</p>
            </div>
          ) : totalVotes === 0 ? (
            <div className="text-center p-8 bg-blue-50 border-2 border-dashed border-blue-300 rounded-xl">
              <p className="text-2xl text-blue-800 font-bold mb-4">🗳️ No votes have been cast yet!</p>
              <p className="text-lg text-blue-700">Be the first to participate and cast your vote in this election.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {winner && (
                <div className="bg-gradient-to-r from-yellow-300 to-yellow-500 p-6 rounded-xl shadow-lg border-2 border-yellow-600 text-center animate-pulse-slow">
                  <p className="text-3xl font-extrabold text-gray-900 mb-2">🏆 Current Leader:</p>
                  <p className="text-5xl font-extrabold text-white leading-tight drop-shadow-lg">{winner.name}</p>
                  <p className="text-2xl text-gray-800 mt-2">with {winner.votes} votes</p>
                </div>
              )}

              {sortedCandidates.map((candidate) => (
                <div key={candidate.id} className={`p-6 rounded-lg shadow-md border-2 transition-all duration-300 ${
                  candidate.id === winner?.id ? 'bg-yellow-100 border-yellow-400 transform scale-102' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-gray-800">{candidate.name}</h3>
                    <span className="text-3xl font-extrabold text-blue-700" aria-label={`${candidate.votes} votes`}>{candidate.votes} Votes</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 relative">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${candidate.id === winner?.id ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 'bg-gradient-to-r from-blue-400 to-blue-600'}`}
                      style={{ width: `${(candidate.votes / totalVotes) * 100}%` }}
                      role="progressbar"
                      aria-valuenow={candidate.votes}
                      aria-valuemin={0}
                      aria-valuemax={totalVotes}
                      aria-label={`${candidate.name} has ${candidate.votes} votes out of ${totalVotes} total votes`}
                    ></div>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-gray-900 mix-blend-difference">
                      {((candidate.votes / totalVotes) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-3 text-right">
                    {candidate.id === winner?.id ? 'Leading candidate!' : 'Candidate score'}
                  </p>
                </div>
              ))}
              <div className="text-center pt-6 border-t border-gray-300 mt-10">
                <p className="text-2xl font-bold text-gray-800">Total Votes Cast: <span className="text-blue-700">{totalVotes}</span></p>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ResultsPage;