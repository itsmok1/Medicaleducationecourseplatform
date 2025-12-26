import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { ArrowLeft, Plus, Trash2, Save, BookOpen, FileText, Video, ClipboardCheck, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Course, Module, Lesson, QuizQuestion } from '../App';
import { projectId } from '../utils/supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-a6119645`;

interface EditCoursePageProps {
  course: Course;
  onBack: () => void;
  onUpdateCourse: (course: Course) => void;
  accessToken: string;
}

export function EditCoursePage({ course, onBack, onUpdateCourse, accessToken }: EditCoursePageProps) {
  const [step, setStep] = useState(1);
  const [courseData, setCourseData] = useState({
    title: course.title,
    description: course.description,
    instructor: course.instructor,
    duration: course.duration,
    image: course.image || '',
  });

  const [modules, setModules] = useState<Array<{
    id: string;
    title: string;
    description: string;
    lessons: Array<{
      id: string;
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
  }>>(course.modules.map(module => ({
    id: module.id,
    title: module.title,
    description: module.description,
    lessons: module.lessons.map(lesson => ({
      id: lesson.id,
      title: lesson.title,
      type: lesson.type,
      duration: lesson.duration || '',
      description: lesson.description,
      content: lesson.content,
    })),
    quiz: {
      passingScore: module.quiz.passingScore,
      questions: module.quiz.questions.map(q => ({
        question: q.question,
        options: [...q.options],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      })),
    },
  })));

  const [currentModule, setCurrentModule] = useState({
    id: '',
    title: '',
    description: '',
    lessons: [] as Array<{
      id: string;
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
    id: '',
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

  const [editingModuleIndex, setEditingModuleIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleCourseInfoNext = () => {
    if (!courseData.title || !courseData.description || !courseData.instructor || !courseData.duration) {
      toast.error('Please fill in all course information');
      return;
    }
    setStep(2);
  };

  const handleEditModule = (index: number) => {
    const module = modules[index];
    setCurrentModule({ ...module });
    setEditingModuleIndex(index);
    setStep(3);
  };

  const handleAddLesson = () => {
    if (!currentLesson.title || !currentLesson.duration || !currentLesson.description || !currentLesson.content) {
      toast.error('Please fill in all lesson information');
      return;
    }

    const lessonWithId = {
      ...currentLesson,
      id: currentLesson.id || `lesson-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    setCurrentModule({
      ...currentModule,
      lessons: [...currentModule.lessons, lessonWithId],
    });

    setCurrentLesson({
      id: '',
      title: '',
      type: 'video',
      duration: '',
      description: '',
      content: '',
    });

    toast.success('Lesson added successfully');
  };

  const handleRemoveLesson = (index: number) => {
    setCurrentModule({
      ...currentModule,
      lessons: currentModule.lessons.filter((_, i) => i !== index),
    });
    toast.success('Lesson removed');
  };

  const handleAddQuestion = () => {
    if (!currentQuestion.question || currentQuestion.options.some(opt => !opt)) {
      toast.error('Please fill in the question and all options');
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

    toast.success('Question added successfully');
  };

  const handleRemoveQuestion = (index: number) => {
    setCurrentModule({
      ...currentModule,
      quiz: {
        ...currentModule.quiz,
        questions: currentModule.quiz.questions.filter((_, i) => i !== index),
      },
    });
    toast.success('Question removed');
  };

  const handleSaveModule = () => {
    if (!currentModule.title || !currentModule.description) {
      toast.error('Please fill in module title and description');
      return;
    }

    if (currentModule.lessons.length === 0) {
      toast.error('Please add at least one lesson to the module');
      return;
    }

    if (currentModule.quiz.questions.length === 0) {
      toast.error('Please add at least one quiz question');
      return;
    }

    const moduleWithId = {
      ...currentModule,
      id: currentModule.id || `module-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    if (editingModuleIndex !== null) {
      // Update existing module
      const updatedModules = [...modules];
      updatedModules[editingModuleIndex] = moduleWithId;
      setModules(updatedModules);
      setEditingModuleIndex(null);
      toast.success('Module updated successfully');
    } else {
      // Add new module
      setModules([...modules, moduleWithId]);
      toast.success('Module added successfully');
    }

    setCurrentModule({
      id: '',
      title: '',
      description: '',
      lessons: [],
      quiz: {
        passingScore: 70,
        questions: [],
      },
    });

    setStep(2);
  };

  const handleRemoveModule = (index: number) => {
    setModules(modules.filter((_, i) => i !== index));
    toast.success('Module removed');
  };

  const handleSaveCourse = async () => {
    if (modules.length === 0) {
      toast.error('Please add at least one module');
      return;
    }

    setIsSaving(true);

    try {
      const updatedCourse: Course = {
        id: course.id,
        title: courseData.title,
        description: courseData.description,
        instructor: courseData.instructor,
        duration: courseData.duration,
        image: courseData.image,
        modules: modules.map((module, moduleIndex) => ({
          id: module.id,
          title: module.title,
          description: module.description,
          lessons: module.lessons.map((lesson, lessonIndex) => ({
            id: lesson.id,
            title: lesson.title,
            type: lesson.type,
            duration: lesson.duration,
            description: lesson.description,
            content: lesson.content,
            locked: lessonIndex > 0,
          })),
          quiz: {
            id: `quiz-${module.id}`,
            moduleId: module.id,
            passingScore: module.quiz.passingScore,
            questions: module.quiz.questions.map((q, qIndex) => ({
              id: `question-${module.id}-${qIndex}`,
              question: q.question,
              options: q.options,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
            })),
          },
          locked: moduleIndex > 0,
        })),
      };

      // Send to backend
      const response = await fetch(`${API_BASE_URL}/courses/${course.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updatedCourse),
      });

      if (!response.ok) {
        throw new Error('Failed to update course');
      }

      toast.success('Course updated successfully!');
      onUpdateCourse(updatedCourse);
    } catch (error) {
      console.error('Error updating course:', error);
      toast.error('Failed to update course. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Edit Course</h1>
          <p className="text-gray-600">Update your course content and structure</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-purple-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="text-sm font-medium">Course Info</span>
          </div>
          <div className={`h-px w-12 ${step >= 2 ? 'bg-purple-600' : 'bg-gray-300'}`} />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-purple-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="text-sm font-medium">Modules</span>
          </div>
          <div className={`h-px w-12 ${step >= 3 ? 'bg-purple-600' : 'bg-gray-300'}`} />
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-purple-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <span className="text-sm font-medium">Content</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Course Information */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Course Information</CardTitle>
                  <CardDescription>Update basic information about your course</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Course Title</Label>
                    <Input
                      id="title"
                      value={courseData.title}
                      onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                      placeholder="e.g., Advanced Cardiology"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={courseData.description}
                      onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                      placeholder="Describe what students will learn in this course..."
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="instructor">Instructor Name</Label>
                      <Input
                        id="instructor"
                        value={courseData.instructor}
                        onChange={(e) => setCourseData({ ...courseData, instructor: e.target.value })}
                        placeholder="e.g., Dr. Jane Smith"
                      />
                    </div>

                    <div>
                      <Label htmlFor="duration">Course Duration</Label>
                      <Input
                        id="duration"
                        value={courseData.duration}
                        onChange={(e) => setCourseData({ ...courseData, duration: e.target.value })}
                        placeholder="e.g., 8 weeks"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="image">Course Image URL (optional)</Label>
                    <Input
                      id="image"
                      value={courseData.image}
                      onChange={(e) => setCourseData({ ...courseData, image: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button onClick={handleCourseInfoNext}>
                      Next: Add Modules
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Modules Overview */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Course Modules</CardTitle>
                  <CardDescription>Manage your course modules and content</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {modules.map((module, index) => (
                    <div key={module.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge>Module {index + 1}</Badge>
                            <h3 className="font-semibold">{module.title}</h3>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{module.description}</p>
                          <div className="flex gap-4 text-sm text-gray-500">
                            <span>{module.lessons.length} lessons</span>
                            <span>{module.quiz.questions.length} quiz questions</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditModule(index)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveModule(index)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setCurrentModule({
                        id: '',
                        title: '',
                        description: '',
                        lessons: [],
                        quiz: { passingScore: 70, questions: [] },
                      });
                      setEditingModuleIndex(null);
                      setStep(3);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Module
                  </Button>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={handleSaveCourse} disabled={isSaving || modules.length === 0}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Updating Course...' : 'Update Course'}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Module Content */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Module Info */}
              <Card>
                <CardHeader>
                  <CardTitle>{editingModuleIndex !== null ? 'Edit Module' : 'New Module'}</CardTitle>
                  <CardDescription>Add lessons and quiz questions to your module</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="moduleTitle">Module Title</Label>
                    <Input
                      id="moduleTitle"
                      value={currentModule.title}
                      onChange={(e) => setCurrentModule({ ...currentModule, title: e.target.value })}
                      placeholder="e.g., Introduction to Cardiology"
                    />
                  </div>

                  <div>
                    <Label htmlFor="moduleDescription">Module Description</Label>
                    <Textarea
                      id="moduleDescription"
                      value={currentModule.description}
                      onChange={(e) => setCurrentModule({ ...currentModule, description: e.target.value })}
                      placeholder="Describe what students will learn in this module..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Lessons */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Lessons ({currentModule.lessons.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentModule.lessons.map((lesson, index) => (
                    <div key={lesson.id} className="border rounded-lg p-3 bg-gray-50 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary">{lesson.type}</Badge>
                          <span className="font-semibold text-sm">{lesson.title}</span>
                        </div>
                        <p className="text-xs text-gray-600">{lesson.description}</p>
                        <span className="text-xs text-gray-500">{lesson.duration}</span>
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

                  <div className="border-t pt-4 space-y-3">
                    <h4 className="font-semibold text-sm">Add New Lesson</h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="lessonTitle">Lesson Title</Label>
                        <Input
                          id="lessonTitle"
                          value={currentLesson.title}
                          onChange={(e) => setCurrentLesson({ ...currentLesson, title: e.target.value })}
                          placeholder="Lesson title"
                        />
                      </div>

                      <div>
                        <Label htmlFor="lessonType">Type</Label>
                        <Select
                          value={currentLesson.type}
                          onValueChange={(value) => setCurrentLesson({ ...currentLesson, type: value as 'video' | 'article' })}
                        >
                          <SelectTrigger id="lessonType">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="video">Video</SelectItem>
                            <SelectItem value="article">Article</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="lessonDuration">Duration</Label>
                      <Input
                        id="lessonDuration"
                        value={currentLesson.duration}
                        onChange={(e) => setCurrentLesson({ ...currentLesson, duration: e.target.value })}
                        placeholder="e.g., 15 min"
                      />
                    </div>

                    <div>
                      <Label htmlFor="lessonDescription">Description</Label>
                      <Textarea
                        id="lessonDescription"
                        value={currentLesson.description}
                        onChange={(e) => setCurrentLesson({ ...currentLesson, description: e.target.value })}
                        placeholder="Brief description of the lesson..."
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label htmlFor="lessonContent">Content</Label>
                      <Textarea
                        id="lessonContent"
                        value={currentLesson.content}
                        onChange={(e) => setCurrentLesson({ ...currentLesson, content: e.target.value })}
                        placeholder={currentLesson.type === 'video' ? 'Video URL or embed code...' : 'Article content...'}
                        rows={4}
                      />
                    </div>

                    <Button onClick={handleAddLesson} variant="outline" size="sm" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Lesson
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quiz */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5" />
                    Module Quiz ({currentModule.quiz.questions.length} questions)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="passingScore">Passing Score (%)</Label>
                    <Input
                      id="passingScore"
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

                  {currentModule.quiz.questions.map((question, index) => (
                    <div key={index} className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-sm mb-2">{index + 1}. {question.question}</p>
                          <div className="space-y-1 text-xs">
                            {question.options.map((opt, i) => (
                              <div key={i} className={i === question.correctAnswer ? 'text-green-600 font-semibold' : ''}>
                                {String.fromCharCode(65 + i)}. {opt} {i === question.correctAnswer && '✓'}
                              </div>
                            ))}
                          </div>
                          {question.explanation && (
                            <p className="text-xs text-gray-600 mt-2 italic">Explanation: {question.explanation}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveQuestion(index)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <div className="border-t pt-4 space-y-3">
                    <h4 className="font-semibold text-sm">Add New Question</h4>
                    
                    <div>
                      <Label htmlFor="question">Question</Label>
                      <Textarea
                        id="question"
                        value={currentQuestion.question}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                        placeholder="Enter your question..."
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {currentQuestion.options.map((option, index) => (
                        <div key={index}>
                          <Label htmlFor={`option${index}`}>Option {String.fromCharCode(65 + index)}</Label>
                          <Input
                            id={`option${index}`}
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...currentQuestion.options];
                              newOptions[index] = e.target.value;
                              setCurrentQuestion({ ...currentQuestion, options: newOptions });
                            }}
                            placeholder={`Option ${String.fromCharCode(65 + index)}`}
                          />
                        </div>
                      ))}
                    </div>

                    <div>
                      <Label htmlFor="correctAnswer">Correct Answer</Label>
                      <Select
                        value={currentQuestion.correctAnswer.toString()}
                        onValueChange={(value) => setCurrentQuestion({ ...currentQuestion, correctAnswer: parseInt(value) })}
                      >
                        <SelectTrigger id="correctAnswer">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">A</SelectItem>
                          <SelectItem value="1">B</SelectItem>
                          <SelectItem value="2">C</SelectItem>
                          <SelectItem value="3">D</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="explanation">Explanation (optional)</Label>
                      <Textarea
                        id="explanation"
                        value={currentQuestion.explanation}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })}
                        placeholder="Explain why this is the correct answer..."
                        rows={2}
                      />
                    </div>

                    <Button onClick={handleAddQuestion} variant="outline" size="sm" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Question
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveModule}>
                  <Save className="w-4 h-4 mr-2" />
                  {editingModuleIndex !== null ? 'Update Module' : 'Save Module'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
