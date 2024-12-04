import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

function MySurveys() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
      setLoading(true);
      const data = await getSurveys();
      console.log('Received surveys:', data);
      setSurveys(data);
    } catch (err) {
      setError('Failed to load surveys');
      console.error('Error loading surveys:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (surveyId) => {
    // TODO: Implement edit functionality
    console.log('Edit survey:', surveyId);
  };

  const handleViewResults = (surveyId) => {
    // TODO: Implement view results functionality
    console.log('View results:', surveyId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date available';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="my-surveys">
      <h1>My Surveys</h1>
      {surveys.length === 0 ? (
        <p>You haven't created any surveys yet.</p>
      ) : (
        <div className="survey-grid">
          {surveys.map((survey) => (
            <div key={survey.id} className="survey-card">
              <h3>{survey.title}</h3>
              <p>{survey.description}</p>
              <div className="survey-meta">
                <span>Created: {formatDate(survey.createdAt)}</span>
                <span>Responses: {survey.responseCount}</span>
              </div>
              <div className="survey-actions">
                <button onClick={() => handleEdit(survey.id)}>Edit</button>
                <button onClick={() => handleViewResults(survey.id)}>View Results</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MySurveys;