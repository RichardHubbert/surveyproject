import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Edit2, BarChart2 } from 'lucide-react';
import { getSurveys, createSurvey } from '../utils/serverComm';

function SurveyList() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
      setLoading(true);
      const data = await getSurveys();
      setSurveys(data);
    } catch (err) {
      setError('Failed to load surveys');
      console.error('Error loading surveys:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSurvey = async () => {
    try {
      const { surveyId } = await createSurvey();
      navigate(`/survey/${surveyId}`);
    } catch (err) {
      console.error('Error creating survey:', err);
      setError('Failed to create new survey');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Surveys</h1>
      
      <div className="grid grid-cols-2 gap-6">
        {/* New Survey Box */}
        <div 
          onClick={handleCreateSurvey}
          className="cursor-pointer bg-white rounded-lg border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-all min-h-[200px]"
        >
          <PlusCircle className="w-12 h-12 text-gray-400 mb-4" />
          <span className="text-xl font-semibold text-gray-600">Create New Survey</span>
        </div>

        {/* Existing Surveys */}
        {surveys.map((survey) => (
          <div
            key={survey._id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow min-h-[200px] flex flex-col justify-between"
          >
            <div>
              <h3 className="text-xl font-semibold mb-2">{survey.title}</h3>
              <p className="text-gray-600">
                {survey.questions.length} questions • Created{' '}
                {new Date(survey.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-3 mt-4">
              <Link
                to={`/survey/${survey._id}`}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Link>
              <Link
                to={`/survey/${survey._id}/results`}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                <BarChart2 className="w-4 h-4 mr-2" />
                Results
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SurveyList; 