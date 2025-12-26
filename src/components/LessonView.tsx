import { useState, useEffect } from 'react';
import { Course, Module, Lesson } from '../App';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { ArrowLeft, CheckCircle, PlayCircle, AlertCircle } from 'lucide-react';
import { Progress } from './ui/progress';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';

interface LessonViewProps {
  course: Course;
  module: Module;
  lesson: Lesson;
  onComplete: (courseId: string, moduleId: string, lessonId: string) => void;
  onBack: () => void;
}

interface ComprehensionQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

// Comprehension questions for different lessons
const comprehensionQuestions: { [lessonId: string]: ComprehensionQuestion[] } = {
  'lesson-1-2': [
    {
      id: 'comp-1-2-1',
      question: 'According to the article, which is the basic structural and functional unit of life?',
      options: ['Atom', 'Cell', 'Tissue', 'Organ'],
      correctAnswer: 1,
    },
    {
      id: 'comp-1-2-2',
      question: 'Which tissue type covers body surfaces and lines cavities?',
      options: ['Epithelial tissue', 'Connective tissue', 'Muscle tissue', 'Nervous tissue'],
      correctAnswer: 0,
    },
  ],
  'lesson-2-2': [
    {
      id: 'comp-2-2-1',
      question: 'How many bones make up the axial skeleton?',
      options: ['60', '70', '80', '90'],
      correctAnswer: 2,
    },
    {
      id: 'comp-2-2-2',
      question: 'Which component protects the spinal cord?',
      options: ['Skull', 'Vertebral Column', 'Thoracic Cage', 'Ribs'],
      correctAnswer: 1,
    },
  ],
  'lesson-c1-2': [
    {
      id: 'comp-c1-2-1',
      question: 'What is the heart\'s natural pacemaker?',
      options: ['AV Node', 'SA Node', 'Bundle of His', 'Purkinje Fibers'],
      correctAnswer: 1,
    },
    {
      id: 'comp-c1-2-2',
      question: 'Which component delays electrical impulses to allow atrial contraction?',
      options: ['SA Node', 'AV Node', 'Bundle Branches', 'Purkinje Fibers'],
      correctAnswer: 1,
    },
  ],
  'lesson-c2-2': [
    {
      id: 'comp-c2-2-1',
      question: 'What does HFrEF stand for according to the article?',
      options: ['Heart failure rapid ejection fraction', 'Heart failure reduced ejection fraction', 'Heart failure regular ejection fraction', 'Heart failure reverse ejection fraction'],
      correctAnswer: 1,
    },
    {
      id: 'comp-c2-2-2',
      question: 'Which type of heart failure leads to pulmonary congestion?',
      options: ['Left-sided failure', 'Right-sided failure', 'Systolic failure', 'Diastolic failure'],
      correctAnswer: 0,
    },
  ],
  'lesson-p1-2': [
    {
      id: 'comp-p1-2-1',
      question: 'Which phase of drug metabolism involves conjugation reactions?',
      options: ['Phase I', 'Phase II', 'Phase III', 'Phase IV'],
      correctAnswer: 1,
    },
    {
      id: 'comp-p1-2-2',
      question: 'What is the most common route of drug elimination?',
      options: ['Biliary excretion', 'Renal excretion', 'Lungs', 'Sweat'],
      correctAnswer: 1,
    },
  ],
};

export function LessonView({ course, module, lesson, onComplete, onBack }: LessonViewProps) {
  const [completed, setCompleted] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [showComprehensionCheck, setShowComprehensionCheck] = useState(false);
  const [comprehensionAnswers, setComprehensionAnswers] = useState<{ [questionId: string]: number }>({});
  const [comprehensionPassed, setComprehensionPassed] = useState(false);
  const [showComprehensionResults, setShowComprehensionResults] = useState(false);

  const minimumVideoProgress = 90; // Must watch 90% of video

  const lessonQuestions = comprehensionQuestions[lesson.id] || [];

  const handleVideoProgress = () => {
    // Simulate video progress
    if (videoProgress < 100) {
      setVideoProgress(prev => Math.min(prev + 10, 100));
    }
  };

  const canCompleteVideo = videoProgress >= minimumVideoProgress;

  const handleAttemptComplete = () => {
    if (lesson.type === 'video') {
      if (canCompleteVideo) {
        setCompleted(true);
        onComplete(course.id, module.id, lesson.id);
      }
    } else if (lesson.type === 'article') {
      if (lessonQuestions.length > 0) {
        // Show comprehension check for articles with questions
        setShowComprehensionCheck(true);
      } else {
        // No comprehension questions, complete directly
        setCompleted(true);
        onComplete(course.id, module.id, lesson.id);
      }
    }
  };

  const handleSubmitComprehension = () => {
    const allAnswered = lessonQuestions.every(q => comprehensionAnswers[q.id] !== undefined);
    
    if (!allAnswered) {
      return;
    }

    const correctCount = lessonQuestions.filter(
      q => comprehensionAnswers[q.id] === q.correctAnswer
    ).length;

    const passed = correctCount === lessonQuestions.length; // Must get all correct
    setComprehensionPassed(passed);
    setShowComprehensionResults(true);

    if (passed) {
      setCompleted(true);
      onComplete(course.id, module.id, lesson.id);
    }
  };



  if (showComprehensionCheck) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Button variant="ghost" onClick={() => setShowComprehensionCheck(false)} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Lesson
            </Button>
            <h1 className="text-blue-900">Comprehension Check</h1>
            <p className="text-gray-600 mt-2">Answer these questions to verify you've understood the material</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {showComprehensionResults ? (
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  {comprehensionPassed ? (
                    <CheckCircle className="w-16 h-16 text-green-600" />
                  ) : (
                    <AlertCircle className="w-16 h-16 text-red-600" />
                  )}
                </div>
                <CardTitle className={comprehensionPassed ? 'text-green-700' : 'text-red-700'}>
                  {comprehensionPassed ? 'All Correct! Lesson Complete' : 'Not All Correct'}
                </CardTitle>
                <CardDescription>
                  {comprehensionPassed 
                    ? 'You have successfully completed this lesson and can now proceed.'
                    : 'Please review the material and try again. All questions must be answered correctly.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lessonQuestions.map((question, index) => {
                    const userAnswer = comprehensionAnswers[question.id];
                    const isCorrect = userAnswer === question.correctAnswer;

                    return (
                      <Card key={question.id} className={isCorrect ? 'border-green-200' : 'border-red-200'}>
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-3 mb-3">
                            {isCorrect ? (
                              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            )}
                            <div>
                              <p className="text-gray-900 mb-2">{question.question}</p>
                              <p className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                                Your answer: {question.options[userAnswer]}
                              </p>
                              {!isCorrect && (
                                <p className="text-green-700 mt-1">
                                  Correct answer: {question.options[question.correctAnswer]}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <div className="mt-6 flex gap-4">
                  {comprehensionPassed ? (
                    <Button onClick={onBack} className="flex-1">
                      Return to Course
                    </Button>
                  ) : (
                    <>
                      <Button onClick={() => setShowComprehensionCheck(false)} variant="outline" className="flex-1">
                        Review Material
                      </Button>
                      <Button 
                        onClick={() => {
                          setComprehensionAnswers({});
                          setShowComprehensionResults(false);
                        }}
                        className="flex-1"
                      >
                        Try Again
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Answer All Questions</CardTitle>
                <CardDescription>You must answer all questions correctly to complete this lesson</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {lessonQuestions.map((question, index) => (
                    <div key={question.id}>
                      <h3 className="text-gray-900 mb-3">Question {index + 1}</h3>
                      <p className="text-gray-700 mb-4">{question.question}</p>
                      
                      <div className="space-y-3">
                        {question.options.map((option, optionIndex) => {
                          const isSelected = comprehensionAnswers[question.id] === optionIndex;
                          return (
                            <div
                              key={optionIndex}
                              onClick={() => setComprehensionAnswers(prev => ({
                                ...prev,
                                [question.id]: optionIndex,
                              }))}
                              className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                                isSelected 
                                  ? 'bg-blue-50 border-blue-300' 
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                isSelected 
                                  ? 'border-blue-600 bg-blue-600' 
                                  : 'border-gray-300'
                              }`}>
                                {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                              </div>
                              <span className="flex-1">{option}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleSubmitComprehension}
                  disabled={!lessonQuestions.every(q => comprehensionAnswers[q.id] !== undefined)}
                  className="w-full mt-6"
                >
                  Submit Answers
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Button>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-gray-600">
                {course.title} • Module {course.modules.findIndex(m => m.id === module.id) + 1}
              </p>
              <h1 className="text-blue-900 mt-1">{lesson.title}</h1>
              <p className="text-gray-600 mt-2">{lesson.description}</p>
              <p className="text-gray-500 mt-2">{lesson.duration}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {lesson.type === 'video' && (
            <Card>
              <CardContent className="p-0">
                <div className="relative bg-gray-900 aspect-video flex items-center justify-center">
                  <div className="text-center text-white">
                    <PlayCircle className="w-20 h-20 mx-auto mb-4 opacity-80" />
                    <p>Video Player Placeholder</p>
                    <p className="text-gray-400 mt-2">{lesson.title}</p>
                    <Button 
                      onClick={handleVideoProgress}
                      className="mt-4"
                      variant="secondary"
                    >
                      Simulate Watching (+10%)
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 bg-white border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Watch Progress</span>
                    <span className="text-gray-900">{videoProgress}%</span>
                  </div>
                  <Progress value={videoProgress} className="h-2" />
                  {videoProgress < minimumVideoProgress && (
                    <p className="text-orange-600 mt-2">
                      You must watch at least {minimumVideoProgress}% to complete this lesson
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {lesson.type === 'article' && (
            <Card>
              <CardContent className="p-8">
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Completion Section */}
          <Card>
            <CardContent className="p-6">
              {completed ? (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <AlertDescription className="text-green-900">
                    Lesson completed! You can now proceed to the next lesson.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-gray-900 mb-2">Ready to continue?</h3>
                    {lesson.type === 'video' && (
                      <p className="text-gray-600">
                        Watch at least {minimumVideoProgress}% of the video to complete this lesson.
                      </p>
                    )}
                    {lesson.type === 'article' && (
                      <p className="text-gray-600">
                        {lessonQuestions.length > 0 
                          ? 'Read the material carefully and answer comprehension questions to complete this lesson.'
                          : 'Read the material and mark as complete when ready.'}
                      </p>
                    )}
                  </div>

                  {/* Requirements checklist */}
                  {lesson.type === 'video' && (
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <p className="text-gray-700 mb-2">Requirements:</p>
                      <div className="flex items-center gap-2">
                        {canCompleteVideo ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-orange-600" />
                        )}
                        <span className={canCompleteVideo ? 'text-green-700' : 'text-orange-700'}>
                          Watch {minimumVideoProgress}% of video ({videoProgress}% completed)
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {lesson.type === 'article' && lessonQuestions.length > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-blue-600" />
                        <span className="text-blue-700">
                          You must answer {lessonQuestions.length} comprehension question{lessonQuestions.length > 1 ? 's' : ''} correctly
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    onClick={handleAttemptComplete}
                    className="w-full sm:w-auto"
                    disabled={lesson.type === 'video' && !canCompleteVideo}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {lesson.type === 'article' && lessonQuestions.length > 0 
                      ? 'Take Comprehension Check' 
                      : 'Complete Lesson'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-gray-900 mb-3">Study Tips</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Take notes on important concepts while studying</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Review material multiple times for better retention</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Complete all lessons before attempting the module quiz</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
