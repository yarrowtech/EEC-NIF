import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AILearningCoursesReference from './AILearningCoursesReference';

const AILearningTopicView = () => {
  const navigate = useNavigate();
  const { subjectKey, topicSlug } = useParams();

  return (
    <div className="w-full h-full">
      <AILearningCoursesReference />
    </div>
  );
};

export default AILearningTopicView;
