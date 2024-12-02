import React from 'react';
import { List, Trash2, GripVertical } from 'lucide-react';
import { Draggable } from 'react-beautiful-dnd';
import DragDropWrapper from './DragDropWrapper';
import { StrictModeDroppable } from './StrictModeDroppable';

function SurveyPreview({ questions, onQuestionsReorder, onDeleteQuestion }) {
    const renderQuestion = (question) => {
        switch (question.type) {
          case 'multiple-choice':
            return (
              <div className="space-y-2">
                {question.options.map((option, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      id={`option-${index}`}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <label htmlFor={`option-${index}`} className="ml-3 block text-sm text-gray-700">
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            );
          case 'checkbox':
            return (
              <div className="space-y-2">
                {question.options.map((option, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`option-${index}`}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`option-${index}`} className="ml-3 block text-sm text-gray-700">
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            );
          case 'short-text':
            return (
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Short answer text"
              />
            );
          case 'long-text':
            return (
              <textarea
                rows="4"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Long answer text"
              />
            );
          default:
            return null;
        }
      };
    
      const handleDragEnd = (result) => {
        if (!result.destination) return;
        
        const reorderedQuestions = Array.from(questions);
        const [removed] = reorderedQuestions.splice(result.source.index, 1);
        reorderedQuestions.splice(result.destination.index, 0, removed);
        
        onQuestionsReorder(reorderedQuestions);
      };
    
      return (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <List className="h-5 w-5 mr-2" />
            Survey Preview
          </h2>
          {questions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No questions added yet</p>
          ) : (
            <DragDropWrapper onDragEnd={handleDragEnd}>
              <StrictModeDroppable droppableId="questions">
                {(provided) => (
                  <div 
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-6"
                  >
                    {questions.map((question, index) => (
                      <Draggable 
                        key={question.id} 
                        draggableId={question.id.toString()} 
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`bg-gray-50 rounded-lg p-6 relative flex gap-4 ${
                              snapshot.isDragging ? 'shadow-lg ring-2 ring-indigo-500' : ''
                            }`}
                          >
                            <div 
                              {...provided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 rounded-lg self-start"
                            >
                              <GripVertical className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-end mb-4">
                                <button
                                  onClick={() => onDeleteQuestion(question.id)}
                                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </div>
                              <p className="text-gray-700 mb-4">{question.text}</p>
                              {renderQuestion(question)}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </StrictModeDroppable>
            </DragDropWrapper>
          )}
        </div>
      );
    }


export default SurveyPreview; 