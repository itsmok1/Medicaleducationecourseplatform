import { useState } from 'react';
import { Course, Module, QuizQuestion } from '../App';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Trophy } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Progress } from './ui/progress';
import { motion, AnimatePresence } from 'motion/react';

interface QuizViewProps {
  course: Course;
  module: Module;
  quiz: {
    id: string;
    questions: QuizQuestion[];
    passingScore: number;
  };
  onComplete: (courseId: string, moduleId: string, score: number, passed: boolean) => void;
  onBack: () => void;
}

export function QuizView({ course, module, quiz, onComplete, onBack }: QuizViewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setShowResults(true);
    
    const correctAnswers = quiz.questions.filter(
      q => answers[q.id] === q.correctAnswer
    ).length;
    
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= quiz.passingScore;
    
    onComplete(course.id, module.id, score, passed);
  };

  const getScore = () => {
    const correctAnswers = quiz.questions.filter(
      q => answers[q.id] === q.correctAnswer
    ).length;
    
    return {
      correct: correctAnswers,
      total: totalQuestions,
      percentage: Math.round((correctAnswers / totalQuestions) * 100),
    };
  };

  const isAnswerCorrect = (questionId: string) => {
    const question = quiz.questions.find(q => q.id === questionId);
    if (!question) return false;
    return answers[questionId] === question.correctAnswer;
  };

  if (showResults) {
    const score = getScore();
    const passed = score.percentage >= quiz.passingScore;

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-gray-50"
      >
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <motion.div whileHover={{ x: -3 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Course
              </Button>
            </motion.div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader className="text-center">
                <motion.div 
                  className="flex justify-center mb-4"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                >
                  {passed ? (
                    <Trophy className="w-16 h-16 text-yellow-500" />
                  ) : (
                    <AlertTriangle className="w-16 h-16 text-orange-500" />
                  )}
                </motion.div>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <CardTitle className={passed ? 'text-green-700' : 'text-orange-700'}>
                    {passed ? 'Congratulations! You Passed!' : 'Quiz Not Passed'}
                  </CardTitle>
                  <CardDescription>
                    You scored {score.correct} out of {score.total} ({score.percentage}%)
                  </CardDescription>
                </motion.div>
              </CardHeader>
              
              <CardContent>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Alert className={passed ? 'bg-green-50 border-green-200 mb-6' : 'bg-orange-50 border-orange-200 mb-6'}>
                    <AlertDescription className={passed ? 'text-green-900' : 'text-orange-900'}>
                      {passed 
                        ? `Excellent work! You've passed the quiz and unlocked the next module.`
                        : `You need ${quiz.passingScore}% to pass. Review the material and try again.`
                      }
                    </AlertDescription>
                  </Alert>
                </motion.div>

                <div className="space-y-6">
                  {quiz.questions.map((question, index) => {
                    const userAnswer = answers[question.id];
                    const correct = isAnswerCorrect(question.id);

                    return (
                      <motion.div
                        key={question.id}
                        initial={{ x: -30, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <Card className={correct ? 'border-green-200' : 'border-red-200'}>
                          <CardHeader>
                            <div className="flex items-start gap-3">
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.6 + index * 0.1, type: 'spring', stiffness: 200 }}
                              >
                                {correct ? (
                                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                                ) : (
                                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                                )}
                              </motion.div>
                              <div className="flex-1">
                                <CardTitle className="text-gray-900">Question {index + 1}</CardTitle>
                                <CardDescription className="mt-2">{question.question}</CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          
                          <CardContent>
                            <div className="space-y-2 mb-4">
                              {question.options.map((option, optionIndex) => {
                                const isCorrectAnswer = optionIndex === question.correctAnswer;
                                const isUserAnswer = optionIndex === userAnswer;

                                return (
                                  <motion.div
                                    key={optionIndex}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.7 + index * 0.1 + optionIndex * 0.05 }}
                                    className={`p-3 rounded-lg border ${
                                      isCorrectAnswer
                                        ? 'bg-green-50 border-green-300'
                                        : isUserAnswer
                                        ? 'bg-red-50 border-red-300'
                                        : 'bg-gray-50 border-gray-200'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      {isCorrectAnswer && <CheckCircle className="w-4 h-4 text-green-600" />}
                                      {isUserAnswer && !isCorrectAnswer && <XCircle className="w-4 h-4 text-red-600" />}
                                      <span className={isCorrectAnswer ? 'text-green-900' : isUserAnswer ? 'text-red-900' : 'text-gray-700'}>
                                        {option}
                                      </span>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                            
                            <Alert>
                              <AlertTitle>Explanation</AlertTitle>
                              <AlertDescription>{question.explanation}</AlertDescription>
                            </Alert>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>

                <motion.div 
                  className="mt-8 flex gap-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + quiz.questions.length * 0.1 }}
                >
                  <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button onClick={onBack} variant="outline" className="w-full">
                      Return to Course
                    </Button>
                  </motion.div>
                  {!passed && (
                    <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        onClick={() => {
                          setAnswers({});
                          setCurrentQuestionIndex(0);
                          setShowResults(false);
                          setSubmitted(false);
                        }}
                        className="w-full"
                      >
                        Retake Quiz
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  const allQuestionsAnswered = quiz.questions.every(q => answers[q.id] !== undefined);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50"
    >
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white border-b"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div whileHover={{ x: -3 }} whileTap={{ scale: 0.95 }}>
            <Button variant="ghost" onClick={onBack} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Course
            </Button>
          </motion.div>
          
          <h1 className="text-blue-900">Module {course.modules.findIndex(m => m.id === module.id) + 1} Quiz</h1>
          <p className="text-gray-600 mt-2">{module.title}</p>
          
          <motion.div 
            className="mt-4"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </span>
              <span className="text-gray-900">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </motion.div>
        </div>
      </motion.div>

      {/* Quiz Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Question {currentQuestionIndex + 1}</CardTitle>
                <CardDescription className="mt-3">{currentQuestion.question}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <RadioGroup
                  value={answers[currentQuestion.id]?.toString()}
                  onValueChange={(value) => handleAnswerSelect(currentQuestion.id, parseInt(value))}
                >
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <motion.div
                        key={index}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        whileHover={{ x: 4, transition: { duration: 0.2 } }}
                        className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-gray-50 cursor-pointer"
                      >
                        <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                          {option}
                        </Label>
                      </motion.div>
                    ))}
                  </div>
                </RadioGroup>

                <div className="mt-8 flex items-center justify-between gap-4">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={currentQuestionIndex === 0}
                    >
                      Previous
                    </Button>
                  </motion.div>
                  
                  <div className="flex gap-2">
                    {quiz.questions.map((_, index) => (
                      <motion.div
                        key={index}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 + index * 0.05 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${
                          index === currentQuestionIndex
                            ? 'bg-blue-600 text-white'
                            : answers[quiz.questions[index].id] !== undefined
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                        onClick={() => setCurrentQuestionIndex(index)}
                      >
                        {index + 1}
                      </motion.div>
                    ))}
                  </div>

                  {currentQuestionIndex === totalQuestions - 1 ? (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={handleSubmit}
                        disabled={!allQuestionsAnswered}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Submit Quiz
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={handleNext}
                        disabled={answers[currentQuestion.id] === undefined}
                      >
                        Next
                      </Button>
                    </motion.div>
                  )}
                </div>

                {!allQuestionsAnswered && currentQuestionIndex === totalQuestions - 1 && (
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                  >
                    <Alert className="mt-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Please answer all questions before submitting the quiz.
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}