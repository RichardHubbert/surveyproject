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
  const [currentSurveyId, setCurrentSurveyId] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
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

  const handleNewSurvey = (surveyId) => {
    setCurrentSurveyId(surveyId);
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p>Loading...</p>
    </div>;
  }

  if (user?.isAnonymous) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} onNewSurvey={handleNewSurvey} />
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onNewSurvey={handleNewSurvey} />
      <main className="h-screen">
        <SurveyDesigner surveyId={currentSurveyId} />
      </main>
    </div>
  );
}

export default App;