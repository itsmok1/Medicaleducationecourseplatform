import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { ArrowLeft, Plus, Trash2, Save, BookOpen, FileText, Video, ClipboardCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Course, Module, Lesson, QuizQuestion } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CreateCoursePageProps {
  onBack: () => void;
  onSaveCourse: (course: Course) => void;
  accessToken: string;
}

export function CreateCoursePage({ onBack, onSaveCourse, accessToken }: CreateCoursePageProps) {
  const [step, setStep] = useState(1);
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    instructor: '',
    duration: '',
    image: '',
  });

  const [modules, setModules] = useState<Array<{
    title: string;
    description: string;
    lessons: Array<{
      title: string;
      type: 'video' | 'article';
      duration: string;
      description: string;
      content: string;
    }>;
    quiz: {
      passingScore: number;
      questions: Array<{
        question: string;
        options: string[];
        correctAnswer: number;
        explanation: string;
      }>;
    };
  }>>([]);

  const [currentModule, setCurrentModule] = useState({
    title: '',
    description: '',
    lessons: [] as Array<{
      title: string;
      type: 'video' | 'article';
      duration: string;
      description: string;
      content: string;
    }>,
    quiz: {
      passingScore: 70,
      questions: [] as Array<{
        question: string;
        options: string[];
        correctAnswer: number;
        explanation: string;
      }>,
    },
  });

  const [currentLesson, setCurrentLesson] = useState({
    title: '',
    type: 'video' as 'video' | 'article',
    duration: '',
    description: '',
    content: '',
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleCourseInfoNext = () => {
    if (!courseData.title || !courseData.description || !courseData.instructor || !courseData.duration) {
      toast.error('Please fill in all course information');
      return;
    }
    setStep(2);
  };

  const handleAddLesson = () => {
    if (!currentLesson.title || !currentLesson.duration || !currentLesson.description || !currentLesson.content) {
      toast.error('Please fill in all lesson information');
      return;
    }
    setCurrentModule({
      ...currentModule,
      lessons: [...currentModule.lessons, { ...currentLesson }],
    });
    setCurrentLesson({
      title: '',
      type: 'video',
      duration: '',
      description: '',
      content: '',
    });
    toast.success('Lesson added');
  };

  const handleRemoveLesson = (index: number) => {
    setCurrentModule({
      ...currentModule,
      lessons: currentModule.lessons.filter((_, i) => i !== index),
    });
  };

  const handleAddQuestion = () => {
    if (!currentQuestion.question || currentQuestion.options.some(opt => !opt) || !currentQuestion.explanation) {
      toast.error('Please fill in all question information');
      return;
    }
    setCurrentModule({
      ...currentModule,
      quiz: {
        ...currentModule.quiz,
        questions: [...currentModule.quiz.questions, { ...currentQuestion }],
      },
    });
    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
    });
    toast.success('Question added');
  };

  const handleRemoveQuestion = (index: number) => {
    setCurrentModule({
      ...currentModule,
      quiz: {
        ...currentModule.quiz,
        questions: currentModule.quiz.questions.filter((_, i) => i !== index),
      },
    });
  };

  const handleAddModule = () => {
    if (!currentModule.title || !currentModule.description) {
      toast.error('Please fill in module information');
      return;
    }
    if (currentModule.lessons.length === 0) {
      toast.error('Please add at least one lesson');
      return;
    }
    if (currentModule.quiz.questions.length === 0) {
      toast.error('Please add at least one quiz question');
      return;
    }
    setModules([...modules, { ...currentModule }]);
    setCurrentModule({
      title: '',
      description: '',
      lessons: [],
      quiz: {
        passingScore: 70,
        questions: [],
      },
    });
    toast.success('Module added successfully');
  };

  const handleRemoveModule = (index: number) => {
    setModules(modules.filter((_, i) => i !== index));
  };

  const handleSaveCourse = async () => {
    if (modules.length === 0) {
      toast.error('Please add at least one module');
      return;
    }

    setIsSaving(true);

    try {
      // Transform the data to match Course interface
      const newCourse: Course = {
        id: `course-${Date.now()}`,
        title: courseData.title,
        description: courseData.description,
        instructor: courseData.instructor,
        duration: courseData.duration,
        image: courseData.image || `https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop`,
        modules: modules.map((module, moduleIndex) => ({
          id: `module-${Date.now()}-${moduleIndex}`,
          title: module.title,
          description: module.description,
          lessons: module.lessons.map((lesson, lessonIndex) => ({
            id: `lesson-${Date.now()}-${moduleIndex}-${lessonIndex}`,
            title: lesson.title,
            type: lesson.type,
            duration: lesson.duration,
            description: lesson.description,
            content: lesson.content,
          })),
          quiz: {
            id: `quiz-${Date.now()}-${moduleIndex}`,
            passingScore: module.quiz.passingScore,
            questions: module.quiz.questions.map((question, questionIndex) => ({
              id: `question-${Date.now()}-${moduleIndex}-${questionIndex}`,
              question: question.question,
              options: question.options,
              correctAnswer: question.correctAnswer,
              explanation: question.explanation,
            })),
          },
        })),
      };

      // Save to backend
      const response = await fetch(`https://${await import('../utils/supabase/info').then(m => m.projectId)}.supabase.co/functions/v1/make-server-a6119645/courses/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ course: newCourse }),
      });

      if (response.ok) {
        toast.success('Course created successfully!');
        onSaveCourse(newCourse);
        // Don't call onBack() here - let onSaveCourse handle navigation
      } else {
        toast.error('Failed to save course to server');
      }
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error('Failed to create course');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white border-b"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div whileHover={{ x: -3 }} whileTap={{ scale: 0.95 }}>
            <Button variant="ghost" onClick={onBack} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin Dashboard
            </Button>
          </motion.div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-blue-900">Create New Course</h1>
              <p className="text-gray-600 mt-1">Build comprehensive medical education content</p>
            </div>
            <Badge variant="outline" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Step {step} of 2
            </Badge>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Course Information</CardTitle>
                  <CardDescription>Enter the basic details about your course</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Course Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Advanced Cardiology"
                      value={courseData.title}
                      onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Course Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what students will learn in this course..."
                      value={courseData.description}
                      onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="instructor">Instructor Name *</Label>
                      <Input
                        id="instructor"
                        placeholder="e.g., Dr. Sarah Johnson"
                        value={courseData.instructor}
                        onChange={(e) => setCourseData({ ...courseData, instructor: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Course Duration *</Label>
                      <Input
                        id="duration"
                        placeholder="e.g., 8 weeks"
                        value={courseData.duration}
                        onChange={(e) => setCourseData({ ...courseData, duration: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image">Course Image URL (Optional)</Label>
                    <Input
                      id="image"
                      placeholder="https://example.com/image.jpg"
                      value={courseData.image}
                      onChange={(e) => setCourseData({ ...courseData, image: e.target.value })}
                    />
                    {courseData.image && (
                      <div className="mt-4">
                        <ImageWithFallback
                          src={courseData.image}
                          alt="Course preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button onClick={handleCourseInfoNext} className="w-full">
                      Continue to Modules
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Saved Modules */}
              {modules.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Added Modules ({modules.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {modules.map((module, index) => (
                        <motion.div
                          key={index}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="text-gray-900">{module.title}</p>
                            <p className="text-gray-600 text-sm">
                              {module.lessons.length} lessons • {module.quiz.questions.length} quiz questions
                            </p>
                          </div>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveModule(index)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </motion.div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Current Module Builder */}
              <Card>
                <CardHeader>
                  <CardTitle>Add Module</CardTitle>
                  <CardDescription>Create a module with lessons and a quiz</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="module-title">Module Title *</Label>
                    <Input
                      id="module-title"
                      placeholder="e.g., Introduction to Cardiac Anatomy"
                      value={currentModule.title}
                      onChange={(e) => setCurrentModule({ ...currentModule, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="module-description">Module Description *</Label>
                    <Textarea
                      id="module-description"
                      placeholder="Describe what this module covers..."
                      value={currentModule.description}
                      onChange={(e) => setCurrentModule({ ...currentModule, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  {/* Lessons Section */}
                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-gray-900">Lessons ({currentModule.lessons.length})</h3>
                    </div>

                    {currentModule.lessons.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {currentModule.lessons.map((lesson, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-2 flex-1">
                              {lesson.type === 'video' ? (
                                <Video className="w-4 h-4 text-blue-600" />
                              ) : (
                                <FileText className="w-4 h-4 text-blue-600" />
                              )}
                              <span className="text-gray-900">{lesson.title}</span>
                              <span className="text-gray-600 text-sm">({lesson.duration})</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveLesson(index)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    <Card className="bg-gray-50">
                      <CardContent className="pt-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="lesson-title">Lesson Title</Label>
                            <Input
                              id="lesson-title"
                              placeholder="e.g., Heart Structure Overview"
                              value={currentLesson.title}
                              onChange={(e) => setCurrentLesson({ ...currentLesson, title: e.target.value })}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="lesson-type">Lesson Type</Label>
                            <Select
                              value={currentLesson.type}
                              onValueChange={(value: 'video' | 'article') => setCurrentLesson({ ...currentLesson, type: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="video">Video</SelectItem>
                                <SelectItem value="article">Article</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="lesson-duration">Duration</Label>
                          <Input
                            id="lesson-duration"
                            placeholder="e.g., 15 min"
                            value={currentLesson.duration}
                            onChange={(e) => setCurrentLesson({ ...currentLesson, duration: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="lesson-description">Description</Label>
                          <Textarea
                            id="lesson-description"
                            placeholder="Brief description of the lesson..."
                            value={currentLesson.description}
                            onChange={(e) => setCurrentLesson({ ...currentLesson, description: e.target.value })}
                            rows={2}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="lesson-content">Content {currentLesson.type === 'video' ? '(Video URL or Embed Code)' : '(Article Text)'}</Label>
                          <Textarea
                            id="lesson-content"
                            placeholder={currentLesson.type === 'video' ? 'https://youtube.com/watch?v=...' : 'Write your article content here...'}
                            value={currentLesson.content}
                            onChange={(e) => setCurrentLesson({ ...currentLesson, content: e.target.value })}
                            rows={4}
                          />
                        </div>

                        <Button onClick={handleAddLesson} variant="outline" className="w-full">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Lesson
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quiz Section */}
                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-gray-900">Quiz Questions ({currentModule.quiz.questions.length})</h3>
                    </div>

                    <div className="space-y-2 mb-4">
                      <Label htmlFor="passing-score">Passing Score (%)</Label>
                      <Input
                        id="passing-score"
                        type="number"
                        min="0"
                        max="100"
                        value={currentModule.quiz.passingScore}
                        onChange={(e) => setCurrentModule({
                          ...currentModule,
                          quiz: { ...currentModule.quiz, passingScore: parseInt(e.target.value) || 70 }
                        })}
                      />
                    </div>

                    {currentModule.quiz.questions.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {currentModule.quiz.questions.map((question, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                            <div className="flex items-center gap-2 flex-1">
                              <ClipboardCheck className="w-4 h-4 text-purple-600" />
                              <span className="text-gray-900">{question.question}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveQuestion(index)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    <Card className="bg-gray-50">
                      <CardContent className="pt-6 space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="question">Question</Label>
                          <Textarea
                            id="question"
                            placeholder="Enter your quiz question..."
                            value={currentQuestion.question}
                            onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                            rows={2}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Answer Options</Label>
                          {currentQuestion.options.map((option, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Input
                                placeholder={`Option ${index + 1}`}
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...currentQuestion.options];
                                  newOptions[index] = e.target.value;
                                  setCurrentQuestion({ ...currentQuestion, options: newOptions });
                                }}
                              />
                              <input
                                type="radio"
                                name="correct-answer"
                                checked={currentQuestion.correctAnswer === index}
                                onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: index })}
                                className="w-4 h-4"
                              />
                            </div>
                          ))}
                          <p className="text-sm text-gray-600">Select the correct answer with the radio button</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="explanation">Explanation</Label>
                          <Textarea
                            id="explanation"
                            placeholder="Explain why this is the correct answer..."
                            value={currentQuestion.explanation}
                            onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })}
                            rows={3}
                          />
                        </div>

                        <Button onClick={handleAddQuestion} variant="outline" className="w-full">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Question
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex gap-4 pt-6 border-t">
                    <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button onClick={handleAddModule} variant="outline" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Module to Course
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button variant="outline" onClick={() => setStep(1)}>
                        Back to Course Info
                      </Button>
                    </motion.div>
                    <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={handleSaveCourse}
                        disabled={isSaving || modules.length === 0}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {isSaving ? (
                          <>
                            <Save className="w-4 h-4 mr-2 animate-spin" />
                            Saving Course...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Course
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </div>
                  {modules.length === 0 && (
                    <p className="text-sm text-orange-600 mt-2">Please add at least one module before saving</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}