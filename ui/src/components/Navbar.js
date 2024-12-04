import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';
import { createSurvey } from '../utils/serverComm';

function Navbar({ user, onNewSurvey }) {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleNewSurvey = async () => {
    try {
      const response = await createSurvey();
      console.log('Create survey response:', response);
      if (response && response.surveyId) {
        onNewSurvey(response.surveyId);
      } else {
        console.error('Invalid response format:', response);
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error("Create survey error:", error);
      alert('Failed to create new survey: ' + error.message);
    }
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold">Survey Designer</h1>
          </div>
          
          <div>
            {!user?.isAnonymous && user && (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">
                  {user.email || 'Signed In User'}
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Sign Out
                </button>
                <button
                  onClick={handleNewSurvey}
                  className="text-gray-600 hover:text-gray-800"
                >
                  New Survey
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 