import React, { useState, useEffect } from 'react';
import { Plus, Minus, Save } from 'lucide-react';
import { createSurvey, getSurveys, getSurveyResults } from '../utils/serverComm';

function QuestionDesigner({ onAddQuestion }) {
  const [surveyTitle, setSurveyTitle] = useState('New Survey');
  const [currentSurveyTitle, setCurrentSurveyTitle] = useState('');
  const [questionType, setQuestionType] = useState('multiple-choice');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['']);
  const [surveys, setSurveys] = useState([]);
  const [selectedSurveyResults, setSelectedSurveyResults] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const surveys = await getSurveys();
        console.log('Fetched surveys:', surveys);
        setSurveys(surveys);
      } catch (error) {
        console.error("Failed to fetch surveys:", error);
      }
    };

    fetchSurveys();
  }, []);

  const questionTypes = [
    { value: 'multiple-choice', label: 'Multiple Choice' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'short-text', label: 'Short Text' },
    { value: 'long-text', label: 'Long Text' },
  ];

  const handleCreateSurvey = async () => {
    try {
      const response = await createSurvey(surveyTitle);
      console.log('Create survey response:', response);
      if (response && response.surveyId) {
        setCurrentSurveyTitle(surveyTitle);
        setSurveyTitle(''); // Clear the input
        // Fetch surveys again to update the list
        const updatedSurveys = await getSurveys();
        console.log('Updated surveys:', updatedSurveys);
        setSurveys(updatedSurveys);
      } else {
        console.error('Invalid response format:', response);
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error("Create survey error:", error);
      alert('Failed to create new survey: ' + error.message);
    }
  };

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newQuestion = {
      id: Date.now(),
      type: questionType,
      text: questionText,
      options: questionType === 'multiple-choice' || questionType === 'checkbox' ? options : [],
    };
    onAddQuestion(newQuestion);
    setQuestionText('');
    setOptions(['']);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No submission date';
    const date = new Date(dateString);
    return date.toString() !== 'Invalid Date' 
      ? date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : 'Invalid Date';
  };

  const handleSurveyClick = async (surveyId) => {
    try {
      console.log('Fetching results for survey:', surveyId);
      if (!surveyId) {
        throw new Error('No survey ID provided');
      }

      const results = await getSurveyResults(surveyId);
      console.log('Processed results:', results);
      
      // Always ensure we're working with an array
      const resultsArray = Array.isArray(results) ? results : [results];
      
      setSelectedSurveyResults(resultsArray);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch survey results:", error);
      setSelectedSurveyResults([{ 
        error: true,
        message: `Failed to load survey results: ${error.message}` 
      }]);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSurveyResults([]);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          {currentSurveyTitle && (
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {currentSurveyTitle}
            </h1>
          )}
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Survey Title
          </label>
          <input
            type="text"
            value={surveyTitle}
            onChange={(e) => setSurveyTitle(e.target.value)}
            placeholder="New Survey"
            className="w-full p-4 text-lg border rounded mb-4"
          />
          <button
            onClick={handleCreateSurvey}
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create Survey
          </button>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-6">Question Designer</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Type
            </label>
            <select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {questionTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Question Text
          </label>
          <input
            type="text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {(questionType === 'multiple-choice' || questionType === 'checkbox') && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Options</label>
            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveOption(index)}
                  disabled={options.length === 1}
                  className="inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-300"
                >
                  <Minus className="h-5 w-5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddOption}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Option
            </button>
          </div>
        )}

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Save className="h-5 w-5 mr-2" />
            Add Question
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Surveys</h2>
        <div className="max-h-60 overflow-y-auto">
          <ul className="space-y-2">
            {surveys.map((survey) => (
              <li 
                key={survey._id} 
                className="p-4 bg-gray-100 rounded-md shadow-sm hover:bg-gray-200 transition-colors duration-150 cursor-pointer"
                onClick={() => handleSurveyClick(survey._id.toString())}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{survey.title}</span>
                  <span className="text-sm text-gray-500">
                    {formatDate(survey.createdAt)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full m-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Survey Results</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {selectedSurveyResults.length === 0 ? (
                <p className="text-gray-500">No results available</p>
              ) : (
                <ul className="space-y-2">
                  {selectedSurveyResults.map((result, index) => (
                    <li key={index} className="p-4 bg-gray-100 rounded-md shadow-sm">
                      {result.error ? (
                        <p className="text-red-600">{result.message}</p>
                      ) : result.message ? (
                        <p className="text-gray-600">{result.message}</p>
                      ) : (
                        <div className="space-y-2">
                          <p className="font-medium">Response {index + 1}</p>
                          <div className="space-y-1">
                            {result.answers?.map((answer, answerIndex) => (
                              <div key={answerIndex} className="text-sm">
                                <p className="font-medium">Question: {answer.questionId}</p>
                                <p className="text-gray-600">Answer: {
                                  typeof answer.answer === 'object' 
                                    ? JSON.stringify(answer.answer) 
                                    : answer.answer
                                }</p>
                              </div>
                            )) || <p className="text-gray-500">No answers recorded</p>}
                          </div>
                          <p className="text-xs text-gray-500">
                            Submitted: {formatDate(result.submittedAt)}
                          </p>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              onClick={closeModal}
              className="mt-4 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuestionDesigner; 