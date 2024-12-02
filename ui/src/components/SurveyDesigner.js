import React, { useState, useRef, useEffect } from 'react';
import QuestionDesigner from './QuestionDesigner';
import QuestionPreview from './QuestionPreview';

function SurveyDesigner() {
  const [questions, setQuestions] = useState([]);
  const previewRef = useRef(null);

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

  return (
    <div className="grid grid-cols-12 gap-6 h-screen p-4">
      <div className="col-span-4 sticky top-4 h-fit max-h-[calc(100vh-32px)]">
        <QuestionDesigner onAddQuestion={handleAddQuestion} />
      </div>
      <div className="col-span-8 max-h-[calc(100vh-32px)] overflow-y-auto" ref={previewRef}>
        <QuestionPreview 
          questions={questions}
          onQuestionsReorder={handleQuestionsReorder}
          onDeleteQuestion={handleDeleteQuestion}
        />
      </div>
    </div>
  );
}

export default SurveyDesigner; 