import { Course, Module, Lesson, UserProgress } from '../App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ArrowLeft, Lock, CheckCircle, PlayCircle, FileText, ClipboardCheck, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { motion } from 'framer-motion';

interface CourseViewProps {
  course: Course;
  progress: UserProgress;
  onSelectLesson: (lesson: Lesson, module: Module) => void;
  onSelectQuiz: (module: Module) => void;
  onBack: () => void;
}

export function CourseView({ course, progress, onSelectLesson, onSelectQuiz, onBack }: CourseViewProps) {
  const isModuleUnlocked = (moduleIndex: number): boolean => {
    if (moduleIndex === 0) return true;
    
    const previousModule = course.modules[moduleIndex - 1];
    const moduleProgress = progress[course.id]?.[previousModule.id];
    
    return moduleProgress?.quizPassed === true;
  };

  const isLessonCompleted = (moduleId: string, lessonId: string): boolean => {
    return progress[course.id]?.[moduleId]?.completedLessons.includes(lessonId) || false;
  };

  const isQuizPassed = (moduleId: string): boolean => {
    return progress[course.id]?.[moduleId]?.quizPassed || false;
  };

  const isLessonUnlocked = (module: Module, lessonIndex: number, moduleIndex: number): boolean => {
    if (!isModuleUnlocked(moduleIndex)) return false;
    if (lessonIndex === 0) return true;
    
    const previousLesson = module.lessons[lessonIndex - 1];
    return isLessonCompleted(module.id, previousLesson.id);
  };

  const isQuizUnlocked = (module: Module, moduleIndex: number): boolean => {
    if (!isModuleUnlocked(moduleIndex)) return false;
    
    const allLessonsCompleted = module.lessons.every(lesson => 
      isLessonCompleted(module.id, lesson.id)
    );
    
    return allLessonsCompleted;
  };

  const getModuleProgress = (module: Module): number => {
    const moduleProgress = progress[course.id]?.[module.id];
    if (!moduleProgress) return 0;
    
    const totalItems = module.lessons.length + 1; // lessons + quiz
    const completedItems = moduleProgress.completedLessons.length + (moduleProgress.quizPassed ? 1 : 0);
    
    return (completedItems / totalItems) * 100;
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <PlayCircle className="w-5 h-5" />;
      case 'article':
        return <FileText className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div whileHover={{ x: -3 }} whileTap={{ scale: 0.95 }}>
            <Button variant="ghost" onClick={onBack} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Courses
            </Button>
          </motion.div>
          
          <h1 className="text-blue-900">{course.title}</h1>
          <p className="text-gray-600 mt-2">{course.description}</p>
          
          <div className="flex items-center gap-4 mt-4 text-gray-600">
            <span>Instructor: {course.instructor}</span>
            <span>•</span>
            <span>{course.duration}</span>
            <span>•</span>
            <span>{course.modules.length} Modules</span>
          </div>
        </div>
      </motion.div>

      {/* Course Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900">
              Complete all lessons in a module and pass the quiz to unlock the next module.
            </AlertDescription>
          </Alert>
        </motion.div>

        <div className="space-y-6">
          {course.modules.map((module, moduleIndex) => {
            const unlocked = isModuleUnlocked(moduleIndex);
            const moduleProgressPercent = getModuleProgress(module);
            const quizScore = progress[course.id]?.[module.id]?.quizScore;

            return (
              <motion.div
                key={module.id}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 + moduleIndex * 0.1, duration: 0.4 }}
              >
                <Card className={!unlocked ? 'opacity-60' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle>
                            Module {moduleIndex + 1}: {module.title}
                          </CardTitle>
                          {!unlocked && <Lock className="w-5 h-5 text-gray-400" />}
                          {isQuizPassed(module.id) && (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="mt-2">{module.description}</CardDescription>
                      </div>
                    </div>
                    
                    {unlocked && moduleProgressPercent > 0 && (
                      <motion.div 
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.5 + moduleIndex * 0.1 }}
                        className="mt-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-600">Progress</span>
                          <span className="text-gray-900">{Math.round(moduleProgressPercent)}%</span>
                        </div>
                        <Progress value={moduleProgressPercent} className="h-2" />
                      </motion.div>
                    )}
                  </CardHeader>

                  <CardContent>
                    {!unlocked ? (
                      <Alert>
                        <Lock className="h-4 w-4" />
                        <AlertDescription>
                          Complete the previous module to unlock this content.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="space-y-3">
                        {/* Lessons */}
                        {module.lessons.map((lesson, lessonIndex) => {
                          const lessonUnlocked = isLessonUnlocked(module, lessonIndex, moduleIndex);
                          const completed = isLessonCompleted(module.id, lesson.id);

                          return (
                            <motion.div
                              key={lesson.id}
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 0.6 + moduleIndex * 0.1 + lessonIndex * 0.05 }}
                              whileHover={lessonUnlocked ? { x: 4, transition: { duration: 0.2 } } : {}}
                              className={`flex items-center justify-between p-4 rounded-lg border ${
                                lessonUnlocked ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <div className={lessonUnlocked ? 'text-blue-600' : 'text-gray-400'}>
                                  {getLessonIcon(lesson.type)}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className={lessonUnlocked ? 'text-gray-900' : 'text-gray-500'}>
                                      {lesson.title}
                                    </p>
                                    {completed && (
                                      <motion.div
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: 'spring', stiffness: 200 }}
                                      >
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                      </motion.div>
                                    )}
                                    {!lessonUnlocked && (
                                      <Lock className="w-4 h-4 text-gray-400" />
                                    )}
                                  </div>
                                  <p className="text-gray-600">{lesson.duration}</p>
                                </div>
                              </div>
                              
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                  onClick={() => onSelectLesson(lesson, module)}
                                  disabled={!lessonUnlocked}
                                  variant={completed ? 'outline' : 'default'}
                                  size="sm"
                                >
                                  {completed ? 'Review' : 'Start'}
                                </Button>
                              </motion.div>
                            </motion.div>
                          );
                        })}

                        {/* Quiz */}
                        <motion.div
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.6 + moduleIndex * 0.1 + module.lessons.length * 0.05 }}
                          whileHover={isQuizUnlocked(module, moduleIndex) ? { x: 4, transition: { duration: 0.2 } } : {}}
                          className={`flex items-center justify-between p-4 rounded-lg border ${
                            isQuizUnlocked(module, moduleIndex) ? 'bg-purple-50 border-purple-200' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className={isQuizUnlocked(module, moduleIndex) ? 'text-purple-600' : 'text-gray-400'}>
                              <ClipboardCheck className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className={isQuizUnlocked(module, moduleIndex) ? 'text-gray-900' : 'text-gray-500'}>
                                  Module Quiz
                                </p>
                                {isQuizPassed(module.id) && (
                                  <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 200 }}
                                  >
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  </motion.div>
                                )}
                                {!isQuizUnlocked(module, moduleIndex) && (
                                  <Lock className="w-4 h-4 text-gray-400" />
                                )}
                              </div>
                              <p className="text-gray-600">
                                {module.quiz.questions.length} questions • Passing score: {module.quiz.passingScore}%
                              </p>
                              {quizScore !== undefined && (
                                <p className={`mt-1 ${isQuizPassed(module.id) ? 'text-green-600' : 'text-orange-600'}`}>
                                  Last score: {quizScore}%
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              onClick={() => onSelectQuiz(module)}
                              disabled={!isQuizUnlocked(module, moduleIndex)}
                              className="bg-purple-600 hover:bg-purple-700"
                              size="sm"
                            >
                              {isQuizPassed(module.id) ? 'Retake' : 'Start Quiz'}
                            </Button>
                          </motion.div>
                        </motion.div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}