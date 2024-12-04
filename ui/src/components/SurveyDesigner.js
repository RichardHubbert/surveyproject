import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import QuestionDesigner from './QuestionDesigner';
import SurveyPreview from './SurveyPreview';
import { saveSurvey, signInWithGoogle, updateSurvey } from '../utils/serverComm';
import { Save, BarChart2 } from 'lucide-react';

function SurveyDesigner() {
  const [questions, setQuestions] = useState([]);
  const [surveyId, setSurveyId] = useState(null);
  const previewRef = useRef(null);
  const [saveStatus, setSaveStatus] = useState('idle');

  const handleAddQuestion = (newQuestion) => {
    setQuestions([...questions, { ...newQuestion, id: uuidv4() }]);
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

  const handleNewSurvey = (newSurveyId) => {
    setSurveyId(newSurveyId);
    setQuestions([]);
  };

  const handleSaveSurvey = async () => {
    try {
      setSaveStatus('saving');
      
      // Check if user token exists
      const currentToken = localStorage.getItem('userToken');
      
      if (!currentToken) {
        const user = await signInWithGoogle();
        const newToken = localStorage.getItem('userToken');
        if (!newToken) {
          throw new Error('Failed to obtain authentication token after sign in');
        }
      }

      // Ensure "Saving..." is shown for at least 300ms
      const savePromise = surveyId ? updateSurvey(surveyId, questions) : saveSurvey(questions);
      const delayPromise = new Promise(resolve => setTimeout(resolve, 300));

      await Promise.all([savePromise, delayPromise]);

      setSaveStatus('saved');
      
      // Reset back to idle after 2 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);

    } catch (error) {
      console.error('Detailed save error:', error);
      setSaveStatus('error');
      
      if (error.message.includes('authentication')) {
        alert('Authentication failed. Please try signing in again.');
      } else {
        alert(`Failed to save survey: ${error.message}`);
      }
      
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    }
  };

  const getSaveButtonContent = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <>
            <Save className="h-5 w-5 mr-2 animate-spin" />
            Saving...
          </>
        );
      case 'saved':
        return (
          <>
            <Save className="h-5 w-5 mr-2 text-white" />
            Saved!
          </>
        );
      case 'error':
        return (
          <>
            <Save className="h-5 w-5 mr-2" />
            Failed
          </>
        );
      default:
        return (
          <>
            <Save className="h-5 w-5 mr-2" />
            Save Survey
          </>
        );
    }
  };

  const handleAnalyzeResponses = () => {
    // TODO: Implement response analysis
    alert('Analysis feature coming soon!');
  };

  return (
    <div className="h-screen">
      <div className="flex h-[calc(100vh-64px)]">
        <div className="w-1/3 p-4 border-r">
          <div className="flex gap-4 mb-4">
            <button 
              onClick={handleSaveSurvey}
              disabled={saveStatus === 'saving'}
              className={`
                flex-1 inline-flex items-center justify-center px-4 py-2 
                border border-transparent text-sm font-medium rounded-md 
                shadow-sm text-white focus:outline-none focus:ring-2 
                focus:ring-offset-2 transition-colors duration-200
                ${saveStatus === 'saved' 
                  ? 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500' 
                  : saveStatus === 'error'
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                }
                disabled:opacity-50
              `}
            >
              {getSaveButtonContent()}
            </button>
            <button 
              onClick={handleAnalyzeResponses}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <BarChart2 className="h-5 w-5 mr-2" />
              Analyze Responses
            </button>
          </div>
          <QuestionDesigner onAddQuestion={handleAddQuestion} />
        </div>
        <div className="w-2/3 p-4 overflow-y-auto" ref={previewRef}>
          <SurveyPreview 
            questions={questions}
            onQuestionsReorder={handleQuestionsReorder}
            onDeleteQuestion={handleDeleteQuestion}
          />
        </div>
      </div>
    </div>
  );
}

export default SurveyDesigner; 