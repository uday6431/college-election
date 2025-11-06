import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserRole, Application, ApplicationStatus, Election, Candidate } from '../types';
import { DUMMY_ELECTION_TEMPLATE } from '../constants';

interface DashboardPageProps {
  user: User;
  applications: Application[];
  setApplications: React.Dispatch<React.SetStateAction<Application[]>>;
  setElections: React.Dispatch<React.SetStateAction<Election[]>>;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ user, applications, setApplications, setElections }) => {
  const navigate = useNavigate();

  if (!user) {
    // This case should ideally be handled by ProtectedRoute, but as a fallback:
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-gray-50">
        <p className="text-xl text-gray-700">Please log in to view the dashboard.</p>
      </div>
    );
  }

  const isAdmin = user.role === UserRole.ADMIN;
  const pendingApplications = applications.filter(app => app.status === ApplicationStatus.PENDING);
  const studentApplications = applications.filter(app => app.studentId === user.id);


  const handleApplicationAction = (appId: string, status: ApplicationStatus) => {
    setApplications(prevApps =>
      prevApps.map(app =>
        app.id === appId ? { ...app, status } : app
      )
    );

    if (status === ApplicationStatus.APPROVED) {
      // Add the student as a candidate to the dummy election
      setElections(prevElections =>
        prevElections.map(election => {
          if (election.id === DUMMY_ELECTION_TEMPLATE.id) {
            const approvedApp = applications.find(app => app.id === appId);
            if (approvedApp && !election.candidates.some(c => c.id === approvedApp.studentId)) {
              const newCandidate: Candidate = {
                id: approvedApp.studentId, // Use student ID as candidate ID
                name: approvedApp.studentName,
                votes: 0,
              };
              return { ...election, candidates: [...election.candidates, newCandidate] };
            }
          }
          return election;
        })
      );
    } else { // If rejected, ensure they are not a candidate
      setElections(prevElections =>
        prevElections.map(election => {
          if (election.id === DUMMY_ELECTION_TEMPLATE.id) {
            const rejectedApp = applications.find(app => app.id === appId);
            if (rejectedApp) {
              return { ...election, candidates: election.candidates.filter(c => c.id !== rejectedApp.studentId) };
            }
          }
          return election;
        })
      );
    }
  };


  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50 p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6">
          Welcome, {user.username}!
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          You are logged in as an <span className="font-semibold text-blue-700">{user.role}</span>.
        </p>

        {isAdmin ? (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Admin Functions:</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Manage elections (create, edit, delete - <span className="text-sm text-gray-500 italic">simulated for dummy election</span>)</li>
                <li>View all candidates and their applications</li>
                <li>Generate QR codes for voting</li>
                <li>Monitor election results in real-time</li>
                <li>Manage user roles and permissions (<span className="text-sm text-gray-500 italic">limited in this frontend app</span>)</li>
                <li>View system logs and analytics (<span className="text-sm text-gray-500 italic">not implemented</span>)</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Manage Applications ({pendingApplications.length} Pending)</h2>
              {pendingApplications.length === 0 ? (
                <p className="text-gray-600">No pending applications.</p>
              ) : (
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {pendingApplications.map(app => (
                    <div key={app.id} className="border p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50">
                      <div>
                        <p className="font-semibold text-gray-800">Student: {app.studentName} (ID: {app.studentId})</p>
                        <p className="text-gray-600">Applying for: {DUMMY_ELECTION_TEMPLATE.title}</p>
                        <p className={`text-sm ${app.status === ApplicationStatus.PENDING ? 'text-yellow-600' : ''}`}>
                          Status: {app.status}
                        </p>
                      </div>
                      <div className="mt-3 md:mt-0 flex space-x-2">
                        <button
                          onClick={() => handleApplicationAction(app.id, ApplicationStatus.APPROVED)}
                          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                          aria-label={`Approve application from ${app.studentName}`}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleApplicationAction(app.id, ApplicationStatus.REJECTED)}
                          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                          aria-label={`Reject application from ${app.studentName}`}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
              <p className="font-semibold">Note:</p>
              <p>This is a placeholder dashboard. Navigation links in the header provide access to specific sections.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Student Functions:</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>View upcoming and ongoing elections</li>
                <li>Apply for open positions</li>
                <li>View candidate profiles and manifestos</li>
                <li>Cast your vote securely</li>
                <li>View election results (after elections conclude)</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">My Applications</h2>
              {studentApplications.length === 0 ? (
                <p className="text-gray-600">You have not submitted any applications yet.</p>
              ) : (
                <div className="space-y-4">
                  {studentApplications.map(app => (
                    <div key={app.id} className={`border p-4 rounded-lg ${
                      app.status === ApplicationStatus.APPROVED ? 'bg-green-50 border-green-300' :
                      app.status === ApplicationStatus.REJECTED ? 'bg-red-50 border-red-300' :
                      'bg-yellow-50 border-yellow-300'
                    }`}>
                      <p className="font-semibold text-gray-800">Applying for: {DUMMY_ELECTION_TEMPLATE.title}</p>
                      <p className={`text-md font-medium mt-1 ${
                        app.status === ApplicationStatus.APPROVED ? 'text-green-700' :
                        app.status === ApplicationStatus.REJECTED ? 'text-red-700' :
                        'text-yellow-700'
                      }`}>
                        Status: {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-800">
              <p className="font-semibold">Note:</p>
              <p>This is a placeholder dashboard. Navigation links in the header provide access to specific sections.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;