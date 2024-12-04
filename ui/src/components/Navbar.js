import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';
import { createSurvey } from '../utils/serverComm';
import { useState } from 'react';

function Navbar({ user }) {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-4">
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
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 
