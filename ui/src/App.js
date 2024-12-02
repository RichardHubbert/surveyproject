import { useEffect, useState } from 'react';
import './App.css';
import SurveyDesigner from './components/SurveyDesigner';
import Navbar from './components/Navbar';
import SignIn from './components/SignIn';
import { auth } from './firebase/config';
import { signInAnonymously } from 'firebase/auth';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        // Sign in anonymously if no user
        try {
          await signInAnonymously(auth);
        } catch (error) {
          console.error("Anonymous sign-in error:", error);
        }
      } else {
        setUser(user);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p>Loading...</p>
    </div>;
  }

  // If user is anonymous, only show the sign-in modal
  if (user?.isAnonymous) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Welcome to Survey Designer</h2>
            <p className="mb-4 text-gray-600">Please sign in to continue</p>
            <SignIn onClose={() => {}} />
          </div>
        </div>
      </div>
    );
  }

  // Only show the main app if user is properly authenticated
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      <main className="h-screen">
        <SurveyDesigner />
      </main>
    </div>
  );
}

export default App;
