import React, { useState } from 'react';

const Observation = () => {
  const [formData, setFormData] = useState({
    q1: null,
    q2: null,
    q3: null,
    q4: null,
    q5: null,
    q6: null,
    q7: null,
    q8: null,
    q9: null,
    q10: null
  });

  const [submitted, setSubmitted] = useState(false);

  const questions = [
    {
      id: 'q1',
      text: 'How often have you observed your child seeming more irritable, sad, or emotionally flat than is usual for them?'
    },
    {
      id: 'q2',
      text: 'How often has your child withdrawn from family activities or preferred to be alone, more so than their typical behavior?'
    },
    {
      id: 'q3',
      text: 'How much have you noticed a change in your child\'s sleep, such as sleeping much more, much less, or having trouble falling/staying asleep?'
    },
    {
      id: 'q4',
      text: 'How often has your child shown interest or enthusiasm for hobbies, friendships, or activities they normally enjoy?'
    },
    {
      id: 'q5',
      text: 'How would you describe your child\'s overall energy level at home?'
    },
    {
      id: 'q6',
      text: 'How often has your child expressed significant worry about school, their future, or their friendships?'
    },
    {
      id: 'q7',
      text: 'How often has your child become easily frustrated or upset by small problems or setbacks?'
    },
    {
      id: 'q8',
      text: 'How often has your child complained of physical issues like headaches, stomach aches, or general fatigue?'
    },
    {
      id: 'q9',
      text: 'How much has your child been communicating with you about their schoolwork or their experiences at school?'
    },
    {
      id: 'q10',
      text: 'How often have you heard your child make negative or highly critical comments about themselves?'
    }
  ];

  const emojiOptions = [
    { emoji: '😊', label: 'Very Good', value: 0 },
    { emoji: '🙂', label: 'Okay', value: 1 },
    { emoji: '😐', label: 'Neutral', value: 2 },
    { emoji: '😕', label: 'Worried', value: 3 },
    { emoji: '😟', label: 'Very Worried', value: 4 }
  ];

  const handleEmojiClick = (questionId, value) => {
    setFormData(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Observation Form Submitted:', formData);
    setSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        q1: null, q2: null, q3: null, q4: null, q5: null,
        q6: null, q7: null, q8: null, q9: null, q10: null
      });
    }, 3000);
  };

  const isFormComplete = () => {
    return Object.values(formData).every(value => value !== null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Child Behavior Observation Form
            </h1>
            <p className="text-gray-600 mb-4">
              Please answer the following questions about your child's recent behavior and emotional state.
            </p>
          </div>

          {submitted && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Thank you! Your observation has been submitted successfully.</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {questions.map((question, index) => (
              <div key={question.id} className="border-b border-gray-200 pb-6">
                <div className="mb-6">
                  <label className="block text-lg font-medium text-gray-900 mb-4">
                    {index + 1}. {question.text}
                  </label>
                </div>
                
                <div className="flex justify-center space-x-4">
                  {emojiOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleEmojiClick(question.id, option.value)}
                      className={`flex flex-col items-center p-4 rounded-lg transition-all duration-200 border-2 ${
                        formData[question.id] === option.value
                          ? 'bg-blue-100 border-blue-400 shadow-md'
                          : 'bg-gray-50 hover:bg-gray-100 border-transparent hover:border-gray-300'
                      }`}
                    >
                      <span className="text-3xl mb-2">{option.emoji}</span>
                      <span className="text-sm font-medium text-gray-700">{option.label}</span>
                    </button>
                  ))}
                </div>
                
                {formData[question.id] !== null && (
                  <div className="mt-4 text-center">
                    <span className="text-sm text-green-600 font-medium">✓ Answered</span>
                  </div>
                )}
              </div>
            ))}

            <div className="flex justify-center pt-6">
              <button
                type="submit"
                disabled={!isFormComplete()}
                className={`px-8 py-3 rounded-lg font-medium text-white transition-colors ${
                  isFormComplete()
                    ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Submit Observation
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Observation; 