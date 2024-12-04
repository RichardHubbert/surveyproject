import React, { useState, useRef, useEffect } from 'react';
import QuestionDesigner from './QuestionDesigner';
import SurveyPreview from './SurveyPreview';
import { saveSurvey, signInWithGoogle } from '../utils/serverComm';

function SurveyDesigner() {
  const [questions, setQuestions] = useState([]);
  const previewRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddQuestion = (newQuestion) => {
    setQuestions([...questions, newQuestion]);
    setTimeout(() => {
      if (previewRef.current) {
        previewRef.current.scrollTo({
          top: previewRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  const handleQuestionsReorder = (reorderedQuestions) => {
    setQuestions(reorderedQuestions);
  };

  const handleDeleteQuestion = (questionId) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const handleSaveSurvey = async () => {
    try {
      setIsSaving(true);
      
      // Check if user token exists
      const currentToken = localStorage.getItem('userToken');
      console.log('Current token status:', currentToken ? 'exists' : 'missing');

      if (!currentToken) {
        console.log('No token found, initiating Google sign in...');
        const user = await signInWithGoogle();
        console.log('Sign in successful, user:', user.email);
        
        // Double check token was stored
        const newToken = localStorage.getItem('userToken');
        if (!newToken) {
          throw new Error('Failed to obtain authentication token after sign in');
        }
      }

      console.log('Attempting to save survey with questions:', questions);
      await saveSurvey(questions);
      alert('Survey saved successfully!');
    } catch (error) {
      console.error('Detailed save error:', error);
      if (error.message.includes('authentication')) {
        alert('Authentication failed. Please try signing in again.');
      } else {
        alert(`Failed to save survey: ${error.message}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-screen p-4">
      <div className="col-span-4 sticky top-4 h-fit max-h-[calc(100vh-32px)]">
        <QuestionDesigner onAddQuestion={handleAddQuestion} />
        <button 
          onClick={handleSaveSurvey}
          disabled={isSaving}
          className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Survey'}
        </button>
      </div>
      <div className="col-span-8 max-h-[calc(100vh-32px)] overflow-y-auto" ref={previewRef}>
        <SurveyPreview 
          questions={questions}
          onQuestionsReorder={handleQuestionsReorder}
          onDeleteQuestion={handleDeleteQuestion}
        />
      </div>
    </div>
  );
}

export default SurveyDesigner; 