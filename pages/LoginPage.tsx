import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserRole } from '../types';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
import Footer from '../components/Footer';

interface LoginPageProps {
  onLogin: (user: User) => void;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  isRegisterMode?: boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, users, setUsers, isRegisterMode: initialIsRegisterMode = false }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rollNumber, setRollNumber] = useState<string>(''); // For student registration
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | '' }>({ text: '', type: '' });
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(initialIsRegisterMode);
  const [isStudentForm, setIsStudentForm] = useState<boolean>(true); // true for student, false for admin

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage({ text: '', type: '' });

    if (isRegisterMode) {
      // --- Registration Logic ---
      const existingUser = users.find(u => u.username === username);
      if (existingUser) {
        setError('Username already taken. Please choose a different one.');
        return;
      }

      const newUser: User = {
        id: uuidv4(),
        username,
        password,
        role: isStudentForm ? UserRole.STUDENT : UserRole.ADMIN,
        votedElections: [], // Initialize votedElections for new users
      };

      if (isStudentForm) {
        if (!rollNumber) {
          setError('Roll Number is required for student registration.');
          return;
        }
        const existingRollNumber = users.find(u => u.role === UserRole.STUDENT && u.rollNumber === rollNumber);
        if (existingRollNumber) {
          setError('Roll Number already registered. Please use a unique roll number.');
          return;
        }
        newUser.rollNumber = rollNumber;
      }

      setUsers(prevUsers => [...prevUsers, newUser]);
      setMessage({ text: `Successfully registered as a ${isStudentForm ? 'Student' : 'Admin'}! You can now log in.`, type: 'success' });
      // Clear forms and switch to login mode
      setUsername('');
      setPassword('');
      setRollNumber('');
      setIsRegisterMode(false);

    } else {
      // --- Login Logic ---
      const userToLogin = users.find(u => u.username === username && u.password === password);

      if (userToLogin) {
        onLogin(userToLogin);
        navigate('/dashboard');
      } else {
        setError('Invalid username or password. Please check your credentials.');
      }
    }
  };

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
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="bg-white p-8 md:p-10 rounded-xl shadow-2xl w-full max-w-md border border-gray-100">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-8">
            {isRegisterMode ? 'Create Account' : 'Welcome Back!'}
          </h2>

          <div className="flex justify-center mb-7">
            <button
              onClick={() => setIsRegisterMode(false)}
              className={`px-7 py-3 text-lg font-semibold rounded-l-lg transition-all duration-300 ease-in-out border border-blue-600 ${
                !isRegisterMode
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-transparent text-blue-600 hover:bg-blue-50'
              }`}
              aria-label="Switch to Login"
            >
              Login
            </button>
            <button
              onClick={() => setIsRegisterMode(true)}
              className={`px-7 py-3 text-lg font-semibold rounded-r-lg transition-all duration-300 ease-in-out border border-blue-600 ${
                isRegisterMode
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-transparent text-blue-600 hover:bg-blue-50'
              }`}
              aria-label="Switch to Register"
            >
              Register
            </button>
          </div>

          {isRegisterMode && (
            <div className="flex justify-center mb-7 mt-4">
              <button
                onClick={() => setIsStudentForm(true)}
                className={`px-5 py-2 text-md font-semibold rounded-l-lg transition-all duration-300 ease-in-out border border-indigo-600 ${
                  isStudentForm
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-transparent text-indigo-600 hover:bg-indigo-50'
                }`}
                aria-label="Register as Student"
              >
                Student
              </button>
              <button
                onClick={() => setIsStudentForm(false)}
                className={`px-5 py-2 text-md font-semibold rounded-r-lg transition-all duration-300 ease-in-out border border-indigo-600 ${
                  !isStudentForm
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-transparent text-indigo-600 hover:bg-indigo-50'
                }`}
                aria-label="Register as Admin"
              >
                Admin
              </button>
            </div>
          )}

          <FeedbackMessage text={message.text} type={message.type} />
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
                Username:
              </label>
              <input
                type="text"
                id="username"
                className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 bg-white text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                aria-required="true"
              />
            </div>
            {isRegisterMode && isStudentForm && (
              <div>
                <label htmlFor="rollNumber" className="block text-gray-700 text-sm font-bold mb-2">
                  Roll Number:
                </label>
                <input
                  type="text"
                  id="rollNumber"
                  className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 bg-white text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  required={isRegisterMode && isStudentForm}
                  aria-required={isRegisterMode && isStudentForm}
                />
              </div>
            )}
            <div>
              <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                Password:
              </label>
              <input
                type="password"
                id="password"
                className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 bg-white text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-required="true"
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center mt-4" role="alert">{error}</p>}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transform hover:scale-105 transition-all duration-300 ease-in-out shadow-lg"
              aria-label={isRegisterMode ? `Register ${isStudentForm ? 'Student' : 'Admin'}` : 'Login'}
            >
              {isRegisterMode ? `Register ${isStudentForm ? 'Student' : 'Admin'}` : 'Login'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LoginPage;