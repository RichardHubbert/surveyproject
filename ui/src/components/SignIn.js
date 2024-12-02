import { useState } from 'react';
import { auth } from '../firebase/config';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword 
} from 'firebase/auth';

function SignIn({ onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      await signInWithPopup(auth, provider);
      onClose();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (error) {
      setError(error.message);
    }
  };

  const createTestUser = async () => {
    try {
      await createUserWithEmailAndPassword(
        auth,
        "testuser@example.com",
        "password123"
      );
      onClose();
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">
          {isRegistering ? 'Register' : 'Sign In'}
        </h2>
        
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
          >
            {isRegistering ? 'Register' : 'Sign In'}
          </button>
        </form>

        <button
          onClick={handleGoogleSignIn}
          className="w-full mt-4 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50"
        >
          Sign in with Google
        </button>

        <button
          onClick={() => setIsRegistering(!isRegistering)}
          className="w-full mt-4 text-blue-500 hover:text-blue-600"
        >
          {isRegistering 
            ? 'Already have an account? Sign in' 
            : 'Need an account? Register'}
        </button>

        <button
          onClick={createTestUser}
          className="w-full mt-4 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300"
        >
          Create Test User
        </button>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default SignIn; 