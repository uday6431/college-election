import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserRole, Application, ApplicationStatus, Election, Candidate } from '../types';
import { DUMMY_ELECTION_TEMPLATE } from '../constants';
import Footer from '../components/Footer';

interface DashboardPageProps {
  user: User;
  applications: Application[];
  setApplications: React.Dispatch<React.SetStateAction<Application[]>>;
  setElections: React.Dispatch<React.SetStateAction<Election[]>>;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ user, applications, setApplications, setElections }) => {
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
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

  const handleClearAllLocalData = () => {
    if (window.confirm('Are you sure you want to clear ALL local application data? This action cannot be undone and will reset the app for this browser.')) {
      localStorage.removeItem('users');
      localStorage.removeItem('applications');
      localStorage.removeItem('elections');
      localStorage.removeItem('qrCodes');
      localStorage.removeItem('currentUser'); // Clear current user as well

      // Reload the page to reset all React states to their initial defaults
      window.location.reload();
    }
  };


  return (
    <>
      <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-8 text-center">
            Welcome, <span className="text-blue-700">{user.username}</span>!
          </h1>
          <p className="text-xl text-gray-700 mb-10 text-center">
            You are currently logged in as an <span className="font-semibold text-blue-800">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>.
          </p>

          {isAdmin ? (
            <div className="space-y-10">
              <div className="bg-white p-8 rounded-xl shadow-xl border border-gray-100">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3 border-gray-200">Admin Overview:</h2>
                <ul className="list-disc list-inside text-gray-700 space-y-3 text-lg">
                  <li>Manage elections (create, edit, delete - <span className="text-sm text-gray-500 italic">simulated for dummy election</span>)</li>
                  <li>Review and approve candidate applications</li>
                  <li>Generate and track unique QR codes for secure voting</li>
                  <li>Monitor real-time election results and participation</li>
                  <li>Oversee user accounts and roles (<span className="text-sm text-gray-500 italic">limited in this frontend app</span>)</li>
                </ul>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-xl border border-gray-100">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3 border-gray-200">
                  Manage Applications ({pendingApplications.length} Pending)
                </h2>
                {pendingApplications.length === 0 ? (
                  <p className="text-gray-600 text-lg p-4 bg-blue-50 rounded-lg border border-blue-200">
                    🎉 No pending applications at the moment. All caught up!
                  </p>
                ) : (
                  <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                    {pendingApplications.map(app => (
                      <div key={app.id} className="border border-blue-200 p-5 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center bg-blue-50 shadow-sm transition-shadow hover:shadow-md duration-200">
                        <div>
                          <p className="font-bold text-gray-800 text-xl mb-1">Student: {app.studentName}</p>
                          <p className="text-gray-600">Roll Number: {user.rollNumber || 'N/A'}</p> {/* Assuming roll number is associated with student */}
                          <p className="text-gray-600 text-md">Applying for: <span className="font-semibold text-blue-700">{DUMMY_ELECTION_TEMPLATE.title}</span></p>
                          <p className={`text-sm mt-2 font-medium px-2 py-1 rounded-full inline-block ${app.status === ApplicationStatus.PENDING ? 'bg-yellow-200 text-yellow-800' : ''}`}>
                            Status: {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </p>
                        </div>
                        <div className="mt-4 md:mt-0 flex space-x-3">
                          <button
                            onClick={() => handleApplicationAction(app.id, ApplicationStatus.APPROVED)}
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-5 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                            aria-label={`Approve application from ${app.studentName}`}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleApplicationAction(app.id, ApplicationStatus.REJECTED)}
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-5 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
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

              <div className="mt-10 p-8 bg-red-100 border-l-4 border-red-500 text-red-900 rounded-xl shadow-xl" role="alert" aria-labelledby="danger-zone-heading">
                <h3 id="danger-zone-heading" className="text-2xl font-bold mb-4">🚨 Danger Zone: Manage Local Data</h3>
                <p className="mb-6 text-lg text-red-800">
                  This action will <span className="font-extrabold underline">permanently clear all user accounts, election data, applications, and QR codes</span> stored exclusively in
                  <span className="font-extrabold text-red-700 ml-1"> this browser's local storage</span>.
                  This is intended for development, testing, or resetting your local demo environment.
                  <span className="font-extrabold block mt-2">This will NOT affect data in other users' browsers.</span>
                </p>
                <button
                  onClick={handleClearAllLocalData}
                  className="bg-red-700 hover:bg-red-800 text-white font-bold py-3 px-8 rounded-lg focus:outline-none focus:ring-4 focus:ring-red-300 focus:ring-opacity-75 transform hover:scale-105 transition-all duration-300 shadow-lg"
                  aria-label="Clear All Local Application Data"
                >
                  Clear All Local Data
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-10">
              <div className="bg-white p-8 rounded-xl shadow-xl border border-gray-100">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3 border-gray-200">Student Overview:</h2>
                <ul className="list-disc list-inside text-gray-700 space-y-3 text-lg">
                  <li>Explore available elections and candidate profiles.</li>
                  <li>Submit applications for desired election positions.</li>
                  <li>Securely cast your vote using generated QR codes.</li>
                  <li>Track the status of your applications.</li>
                  <li>View election results once they are concluded.</li>
                </ul>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-xl border border-gray-100">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3 border-gray-200">My Applications</h2>
                {studentApplications.length === 0 ? (
                  <p className="text-gray-600 text-lg p-4 bg-purple-50 rounded-lg border border-purple-200">
                    You have not submitted any applications yet. Visit the Elections page to apply!
                  </p>
                ) : (
                  <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
                    {studentApplications.map(app => (
                      <div key={app.id} className={`border p-5 rounded-lg shadow-sm ${
                        app.status === ApplicationStatus.APPROVED ? 'bg-green-50 border-green-300' :
                        app.status === ApplicationStatus.REJECTED ? 'bg-red-50 border-red-300' :
                        'bg-yellow-50 border-yellow-300'
                      }`}>
                        <p className="font-bold text-gray-800 text-xl mb-2">Applying for: <span className="text-blue-700">{DUMMY_ELECTION_TEMPLATE.title}</span></p>
                        <p className={`text-lg font-semibold mt-1 ${
                          app.status === ApplicationStatus.APPROVED ? 'text-green-700' :
                          app.status === ApplicationStatus.REJECTED ? 'text-red-700' :
                          'text-yellow-700'
                        }`}>
                          Status: {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </p>
                        {app.status === ApplicationStatus.REJECTED && (
                          <p className="text-sm text-gray-600 mt-2">Your application was not approved. You may re-apply for future elections or consider other positions.</p>
                        )}
                        {app.status === ApplicationStatus.PENDING && (
                          <p className="text-sm text-gray-600 mt-2">Your application is currently under review by administrators.</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="mt-12 p-6 bg-blue-100 border-l-4 border-blue-500 text-blue-900 rounded-xl shadow-md" role="complementary">
            <p className="font-bold text-xl mb-2">💡 Quick Tip:</p>
            <p className="text-lg">Use the navigation links in the header to access specific sections like Elections, QR Codes (Admin), and Results.</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DashboardPage;