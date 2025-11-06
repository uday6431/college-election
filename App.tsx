import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ElectionsPage from './pages/ElectionsPage';
import QrCodesPage from './pages/QrCodesPage';
import ResultsPage from './pages/ResultsPage';
import { User, UserRole, Election, QRCodeEntry, Application, ApplicationStatus } from './types';
import { DUMMY_ELECTION_TEMPLATE, DEFAULT_USERS, DEFAULT_APPLICATIONS } from './constants';

// Helper component to navigate away if user is not logged in or role is not allowed
const ProtectedRoute: React.FC<{ user: User | null; children: React.ReactNode; allowedRoles?: UserRole[] }> = ({ user, children, allowedRoles }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (allowedRoles && !allowedRoles.includes(user.role)) {
      navigate('/dashboard'); // Or a more specific unauthorized page
    }
  }, [user, navigate, allowedRoles]);

  if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return null; // Render nothing while redirecting
  }

  return <>{children}</>;
};


const AppContent: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    // Attempt to load user from localStorage on initial load
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const savedUsers = localStorage.getItem('users');
    return savedUsers ? JSON.parse(savedUsers) : DEFAULT_USERS;
  });

  const [applications, setApplications] = useState<Application[]>(() => {
    const savedApplications = localStorage.getItem('applications');
    return savedApplications ? JSON.parse(savedApplications) : DEFAULT_APPLICATIONS;
  });

  // Elections state now includes DUMMY_ELECTION_TEMPLATE with dynamic candidates
  const [elections, setElections] = useState<Election[]>(() => {
    const savedElections = localStorage.getItem('elections');
    if (savedElections) {
      const parsedElections: Election[] = JSON.parse(savedElections);
      // Ensure DUMMY_ELECTION_TEMPLATE is always present,
      // its candidates will be dynamically populated from applications.
      if (!parsedElections.some(e => e.id === DUMMY_ELECTION_TEMPLATE.id)) {
        parsedElections.push({ ...DUMMY_ELECTION_TEMPLATE, candidates: [] });
      }
      return parsedElections;
    } else {
      return [{ ...DUMMY_ELECTION_TEMPLATE, candidates: [] }];
    }
  });

  const navigate = useNavigate();

  // Persist user, users, elections, and QR codes to localStorage whenever they change
  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('applications', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem('elections', JSON.stringify(elections));
  }, [elections]);

  useEffect(() => {
    const savedQrCodes = localStorage.getItem('qrCodes');
    if (savedQrCodes) {
      setQrCodes(JSON.parse(savedQrCodes));
    }
  }, []); // Only load once

  // Effect to synchronize DUMMY_ELECTION_TEMPLATE candidates with approved applications
  useEffect(() => {
    setElections(prevElections => {
      const updatedElections = prevElections.map(election => {
        if (election.id === DUMMY_ELECTION_TEMPLATE.id) {
          const approvedCandidates = applications
            .filter(app => app.electionId === DUMMY_ELECTION_TEMPLATE.id && app.status === ApplicationStatus.APPROVED)
            .map(app => ({
              id: app.studentId, // Use studentId as candidate ID
              name: app.studentName,
              votes: election.candidates.find(c => c.id === app.studentId)?.votes || 0, // Preserve existing votes
            }));

          // Merge approved candidates with existing candidates, preserving vote counts
          const newCandidatesMap = new Map<string, { id: string; name: string; votes: number }>();
          election.candidates.forEach(existingC => {
            newCandidatesMap.set(existingC.id, existingC);
          });
          approvedCandidates.forEach(ac => {
            const existingVotes = newCandidatesMap.get(ac.id)?.votes || 0;
            newCandidatesMap.set(ac.id, { ...ac, votes: existingVotes });
          });
          return { ...election, candidates: Array.from(newCandidatesMap.values()) };
        }
        return election;
      });
      return updatedElections;
    });
  }, [applications]); // Re-run when applications change

  // Separate state for QR codes as it's modified independently
  const [qrCodes, setQrCodes] = useState<QRCodeEntry[]>(() => {
    const savedQrCodes = localStorage.getItem('qrCodes');
    return savedQrCodes ? JSON.parse(savedQrCodes) : [];
  });

  useEffect(() => {
    localStorage.setItem('qrCodes', JSON.stringify(qrCodes));
  }, [qrCodes]);


  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  const updateLoggedInUser = (updatedUser: User) => {
    setUser(updatedUser); // Update the current logged-in user state
  };


  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={user ? <DashboardPage user={user} applications={applications} setApplications={setApplications} setElections={setElections} /> : <HomePage />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} users={users} setUsers={setUsers} />} />
          {/* Fix: Pass `isRegisterMode` prop to LoginPage component */}
          <Route path="/register" element={<LoginPage onLogin={handleLogin} users={users} setUsers={setUsers} isRegisterMode={true} />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={user}>
                <DashboardPage user={user!} applications={applications} setApplications={setApplications} setElections={setElections} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute user={user} allowedRoles={[UserRole.ADMIN]}>
                <DashboardPage user={user!} applications={applications} setApplications={setApplications} setElections={setElections} /> {/* Reusing Dashboard for admin specific view with application management */}
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications"
            element={
              <ProtectedRoute user={user} allowedRoles={[UserRole.ADMIN]}>
                <DashboardPage user={user!} applications={applications} setApplications={setApplications} setElections={setElections} /> {/* Direct access to application management for admin */}
              </ProtectedRoute>
            }
          />
          <Route
            path="/student-dashboard"
            element={
              <ProtectedRoute user={user} allowedRoles={[UserRole.STUDENT]}>
                <DashboardPage user={user!} applications={applications} setApplications={setApplications} setElections={setElections} /> {/* Reusing Dashboard for student specific view with my applications */}
              </ProtectedRoute>
            }
          />
          <Route
            path="/elections"
            element={
              <ProtectedRoute user={user}>
                <ElectionsPage
                  user={user}
                  elections={elections}
                  setElections={setElections}
                  applications={applications}
                  setApplications={setApplications}
                  setUsers={setUsers} // Pass setUsers to allow updating global user list
                  updateLoggedInUser={updateLoggedInUser} // Pass callback to update current user
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/qr-codes"
            element={
              <ProtectedRoute user={user} allowedRoles={[UserRole.ADMIN]}> {/* Only admin can access QR codes */}
                <QrCodesPage
                  qrCodes={qrCodes}
                  setQrCodes={setQrCodes}
                  elections={elections} // Pass elections to link QRs
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/results"
            element={
              <ProtectedRoute user={user}>
                <ResultsPage elections={elections} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </>
  );
};

const App: React.FC = () => {
  console.log('NOTE: This is a frontend-only React application using TypeScript and Tailwind CSS.');
  console.log('The requested backend technologies (Servlets, JSP, Oracle database) are not implemented here.');
  console.log('Login and registration are simulated with dummy credentials and local storage (see LoginPage.tsx and constants.ts).');
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <AppContent />
      </div>
    </Router>
  );
};

export default App;