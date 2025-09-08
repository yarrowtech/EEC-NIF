const express = require('express');
const router = express.Router();
const StudentProgress = require('../models/StudentProgress');
const StudentUser = require('../models/StudentUser');

// Analyze student weakness and identify weak students
router.post('/analyze-weakness/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { subject } = req.body;

    const progress = await StudentProgress.findOne({ studentId });
    if (!progress) {
      return res.status(404).json({ error: 'Student progress not found' });
    }

    const analysis = await analyzeStudentWeakness(progress, subject);
    
    // Update the progress record with weakness analysis
    const existingAnalysisIndex = progress.weaknessAnalysis.findIndex(w => w.subject === subject);
    if (existingAnalysisIndex >= 0) {
      progress.weaknessAnalysis[existingAnalysisIndex] = analysis;
    } else {
      progress.weaknessAnalysis.push(analysis);
    }

    // Determine if student is weak based on consistency scores
    const averageConsistency = progress.weaknessAnalysis.reduce((sum, w) => sum + w.consistencyScore, 0) / progress.weaknessAnalysis.length;
    progress.isWeakStudent = averageConsistency < 60; // Threshold for weak student identification
    progress.needsIntervention = averageConsistency < 40;
    
    // Set intervention level
    if (averageConsistency < 25) progress.interventionLevel = 'critical';
    else if (averageConsistency < 40) progress.interventionLevel = 'high';
    else if (averageConsistency < 60) progress.interventionLevel = 'medium';
    else progress.interventionLevel = 'low';

    progress.lastUpdated = new Date();
    await progress.save();

    res.status(200).json({ 
      message: 'Weakness analysis completed', 
      analysis,
      isWeakStudent: progress.isWeakStudent,
      interventionLevel: progress.interventionLevel
    });
  } catch (error) {
    console.error('Error analyzing weakness:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all weak students
router.get('/weak-students', async (req, res) => {
  try {
    const { grade, section, subject, interventionLevel } = req.query;
    
    let studentFilter = {};
    if (grade) studentFilter.grade = grade;
    if (section) studentFilter.section = section;

    const students = await StudentUser.find(studentFilter).select('name grade section roll');
    const studentIds = students.map(student => student._id);

    let progressFilter = { 
      studentId: { $in: studentIds },
      isWeakStudent: true
    };

    if (interventionLevel) {
      progressFilter.interventionLevel = interventionLevel;
    }

    const weakStudents = await StudentProgress.find(progressFilter)
      .populate('studentId', 'name grade section roll email')
      .lean();

    // Filter by subject if specified
    let filteredStudents = weakStudents;
    if (subject) {
      filteredStudents = weakStudents.filter(student => 
        student.weaknessAnalysis.some(analysis => analysis.subject === subject)
      );
    }

    // Add detailed analysis for each student
    const detailedAnalysis = filteredStudents.map(student => {
      const subjectAnalysis = subject 
        ? student.weaknessAnalysis.find(w => w.subject === subject)
        : student.weaknessAnalysis[0]; // Get first analysis if no subject specified

      return {
        ...student,
        focusSubject: subjectAnalysis?.subject,
        consistencyScore: subjectAnalysis?.consistencyScore || 0,
        weakAreas: subjectAnalysis?.weakAreas || [],
        recommendedTopics: subjectAnalysis?.recommendedTopics || []
      };
    });

    res.status(200).json(detailedAnalysis);
  } catch (error) {
    console.error('Error fetching weak students:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate AI learning path for a student
router.post('/generate-learning-path/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { subject, weakAreas, currentLevel } = req.body;

    const progress = await StudentProgress.findOne({ studentId });
    if (!progress) {
      return res.status(404).json({ error: 'Student progress not found' });
    }

    // Generate personalized learning path
    const learningPath = await generateAILearningPath(subject, weakAreas, currentLevel);
    
    // Update or add learning path
    const existingPathIndex = progress.aiLearningPaths.findIndex(p => p.subject === subject);
    if (existingPathIndex >= 0) {
      progress.aiLearningPaths[existingPathIndex] = learningPath;
    } else {
      progress.aiLearningPaths.push(learningPath);
    }

    progress.lastUpdated = new Date();
    await progress.save();

    res.status(200).json({ 
      message: 'AI learning path generated successfully', 
      learningPath 
    });
  } catch (error) {
    console.error('Error generating learning path:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get learning path for a student
router.get('/learning-path/:studentId/:subject', async (req, res) => {
  try {
    const { studentId, subject } = req.params;

    const progress = await StudentProgress.findOne({ studentId })
      .populate('studentId', 'name grade section roll');
      
    if (!progress) {
      return res.status(404).json({ error: 'Student progress not found' });
    }

    const learningPath = progress.aiLearningPaths.find(p => p.subject === subject);
    if (!learningPath) {
      return res.status(404).json({ error: 'Learning path not found for this subject' });
    }

    res.status(200).json({ 
      student: progress.studentId,
      learningPath,
      weaknessAnalysis: progress.weaknessAnalysis.find(w => w.subject === subject)
    });
  } catch (error) {
    console.error('Error fetching learning path:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update learning progress
router.put('/update-progress/:studentId/:subject', async (req, res) => {
  try {
    const { studentId, subject } = req.params;
    const { topicCompleted, resourceCompleted, progressPercentage } = req.body;

    const progress = await StudentProgress.findOne({ studentId });
    if (!progress) {
      return res.status(404).json({ error: 'Student progress not found' });
    }

    const learningPathIndex = progress.aiLearningPaths.findIndex(p => p.subject === subject);
    if (learningPathIndex === -1) {
      return res.status(404).json({ error: 'Learning path not found' });
    }

    const learningPath = progress.aiLearningPaths[learningPathIndex];

    if (topicCompleted && !learningPath.completedTopics.includes(topicCompleted)) {
      learningPath.completedTopics.push(topicCompleted);
    }

    if (progressPercentage !== undefined) {
      learningPath.progress = Math.min(100, Math.max(0, progressPercentage));
    }

    learningPath.lastAccessed = new Date();
    progress.lastUpdated = new Date();

    await progress.save();

    res.status(200).json({ 
      message: 'Learning progress updated successfully',
      updatedPath: learningPath
    });
  } catch (error) {
    console.error('Error updating learning progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to analyze student weakness
async function analyzeStudentWeakness(progress, subject) {
  const subjectSubmissions = progress.submissions.filter(sub => {
    // You would need to join with Assignment model to get subject info
    // For now, we'll use mock logic
    return true; // This should be filtered by assignment subject
  });

  if (subjectSubmissions.length < 3) {
    return {
      subject,
      consistencyScore: 50, // Default for insufficient data
      weakAreas: ['Insufficient data for analysis'],
      recommendedTopics: ['Continue submitting assignments for better analysis'],
      difficultyLevel: 'intermediate',
      lastAnalyzed: new Date()
    };
  }

  // Calculate consistency score based on score variance
  const scores = subjectSubmissions.map(sub => sub.score).filter(score => score !== undefined);
  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - average, 2), 0) / scores.length;
  const standardDeviation = Math.sqrt(variance);
  
  // Consistency score: lower deviation = higher consistency
  const consistencyScore = Math.max(0, 100 - (standardDeviation * 2));

  // Identify weak areas based on subject and performance patterns
  const weakAreas = identifyWeakAreas(subject, average, standardDeviation);
  const recommendedTopics = getRecommendedTopics(subject, average, weakAreas);
  const difficultyLevel = getDifficultyLevel(average);

  return {
    subject,
    consistencyScore: Math.round(consistencyScore),
    weakAreas,
    recommendedTopics,
    difficultyLevel,
    lastAnalyzed: new Date()
  };
}

// Helper function to identify weak areas
function identifyWeakAreas(subject, average, standardDeviation) {
  const weakAreas = [];
  
  if (average < 60) weakAreas.push('Basic Concepts');
  if (standardDeviation > 20) weakAreas.push('Consistency in Performance');
  if (average < 40) weakAreas.push('Fundamental Understanding');

  // Subject-specific weak areas
  switch (subject.toLowerCase()) {
    case 'mathematics':
      if (average < 70) weakAreas.push('Problem Solving', 'Mathematical Reasoning');
      if (standardDeviation > 15) weakAreas.push('Calculation Accuracy');
      break;
    case 'physics':
      if (average < 70) weakAreas.push('Conceptual Understanding', 'Formula Application');
      break;
    case 'chemistry':
      if (average < 70) weakAreas.push('Chemical Equations', 'Molecular Concepts');
      break;
    case 'biology':
      if (average < 70) weakAreas.push('Biological Processes', 'Scientific Terminology');
      break;
  }

  return weakAreas.length > 0 ? weakAreas : ['General Improvement Needed'];
}

// Helper function to get recommended topics
function getRecommendedTopics(subject, average, weakAreas) {
  const topics = [];

  // Basic recommendations based on performance
  if (average < 40) {
    topics.push('Foundation Review', 'Basic Practice Exercises');
  } else if (average < 70) {
    topics.push('Intermediate Concepts', 'Practice Problems');
  }

  // Subject-specific recommendations
  switch (subject.toLowerCase()) {
    case 'mathematics':
      if (weakAreas.includes('Basic Concepts')) {
        topics.push('Number Systems', 'Basic Operations', 'Algebraic Expressions');
      }
      if (weakAreas.includes('Problem Solving')) {
        topics.push('Word Problems', 'Mathematical Logic', 'Step-by-step Solutions');
      }
      break;
    case 'physics':
      if (weakAreas.includes('Conceptual Understanding')) {
        topics.push('Physics Fundamentals', 'Laws of Motion', 'Energy Concepts');
      }
      break;
    case 'chemistry':
      if (weakAreas.includes('Chemical Equations')) {
        topics.push('Balancing Equations', 'Reaction Types', 'Stoichiometry');
      }
      break;
  }

  return topics;
}

// Helper function to determine difficulty level
function getDifficultyLevel(average) {
  if (average < 40) return 'basic';
  if (average < 70) return 'intermediate';
  return 'advanced';
}

// Helper function to generate AI learning path
async function generateAILearningPath(subject, weakAreas, currentLevel) {
  const resources = generateLearningResources(subject, weakAreas, currentLevel);
  
  return {
    subject,
    currentTopic: resources[0]?.title || 'Getting Started',
    completedTopics: [],
    recommendedResources: resources,
    progress: 0,
    createdAt: new Date(),
    lastAccessed: null
  };
}

// Helper function to generate learning resources
function generateLearningResources(subject, weakAreas, level = 'intermediate') {
  const resources = [];
  
  // Subject-specific resources based on weak areas
  weakAreas.forEach(area => {
    switch (subject.toLowerCase()) {
      case 'mathematics':
        if (area.includes('Basic Concepts') || area.includes('Fundamental')) {
          resources.push({
            title: 'Mathematics Fundamentals',
            type: 'video',
            url: '/learning/math/fundamentals',
            difficulty: 'basic',
            estimatedTime: 30
          });
          resources.push({
            title: 'Basic Math Practice',
            type: 'practice',
            url: '/learning/math/basic-practice',
            difficulty: 'basic',
            estimatedTime: 45
          });
        }
        if (area.includes('Problem Solving')) {
          resources.push({
            title: 'Problem Solving Strategies',
            type: 'interactive',
            url: '/learning/math/problem-solving',
            difficulty: level,
            estimatedTime: 60
          });
        }
        break;
        
      case 'physics':
        if (area.includes('Conceptual Understanding')) {
          resources.push({
            title: 'Physics Concepts Explained',
            type: 'video',
            url: '/learning/physics/concepts',
            difficulty: level,
            estimatedTime: 40
          });
        }
        break;
        
      case 'chemistry':
        if (area.includes('Chemical Equations')) {
          resources.push({
            title: 'Balancing Chemical Equations',
            type: 'interactive',
            url: '/learning/chemistry/equations',
            difficulty: level,
            estimatedTime: 50
          });
        }
        break;
    }
  });

  // Add general resources if no specific ones were added
  if (resources.length === 0) {
    resources.push({
      title: `${subject} Review`,
      type: 'video',
      url: `/learning/${subject.toLowerCase()}/review`,
      difficulty: level,
      estimatedTime: 30
    });
    resources.push({
      title: `${subject} Practice Quiz`,
      type: 'quiz',
      url: `/learning/${subject.toLowerCase()}/quiz`,
      difficulty: level,
      estimatedTime: 20
    });
  }

  return resources;
}

module.exports = router;