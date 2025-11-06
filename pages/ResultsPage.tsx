import React from 'react';
import { Election } from '../types';
import { DUMMY_ELECTION_TEMPLATE } from '../constants';

interface ResultsPageProps {
  elections: Election[];
}

const ResultsPage: React.FC<ResultsPageProps> = ({ elections }) => {
  const currentElection = elections.find(e => e.id === DUMMY_ELECTION_TEMPLATE.id);

  if (!currentElection) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50 p-8">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">No Election Results Available</h1>
          <p className="text-xl text-gray-700 mb-6">
            There are no elections to display results for at this moment.
          </p>
        </div>
      </div>
    );
  }

  // Calculate total votes for percentage calculation
  const totalVotes = currentElection.candidates.reduce((sum, candidate) => sum + candidate.votes, 0);

  // Sort candidates by votes in descending order
  const sortedCandidates = [...currentElection.candidates].sort((a, b) => b.votes - a.votes);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50 p-8">
      <div className="container mx-auto max-w-3xl bg-white p-8 rounded-lg shadow-xl">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 text-center">Election Results</h1>
        <p className="text-lg text-gray-700 mb-8 text-center">Current results for the <span className="font-semibold text-blue-700">{currentElection.title}</span>.</p>

        {currentElection.candidates.length === 0 ? (
           <div className="text-center p-8 bg-yellow-50 border-2 border-dashed border-yellow-300 rounded-lg">
             <p className="text-2xl text-yellow-800 font-bold mb-4">📋 No candidates have been approved yet!</p>
             <p className="text-lg text-yellow-700">Admins need to approve applications before results can be displayed.</p>
           </div>
        ) : totalVotes === 0 ? (
          <div className="text-center p-8 bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg">
            <p className="text-2xl text-blue-800 font-bold mb-4">🗳️ No votes have been cast yet!</p>
            <p className="text-lg text-blue-700">Be the first to participate in this election.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedCandidates.map((candidate) => (
              <div key={candidate.id} className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-semibold text-gray-800">{candidate.name}</h3>
                  <span className="text-2xl font-bold text-blue-600" aria-label={`${candidate.votes} votes`}>{candidate.votes} Votes</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-500 h-3 rounded-full"
                    style={{ width: `${(candidate.votes / totalVotes) * 100}%` }}
                    role="progressbar"
                    aria-valuenow={candidate.votes}
                    aria-valuemin={0}
                    aria-valuemax={totalVotes}
                    aria-label={`${candidate.name} has ${candidate.votes} votes out of ${totalVotes} total votes`}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2 text-right">
                  {((candidate.votes / totalVotes) * 100).toFixed(1)}% of total votes
                </p>
              </div>
            ))}
            <div className="text-center pt-4 border-t border-gray-200 mt-8">
              <p className="text-lg font-semibold text-gray-800">Total Votes Cast: {totalVotes}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;