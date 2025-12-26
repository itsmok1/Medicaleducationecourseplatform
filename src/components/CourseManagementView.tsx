import { useState, useEffect } from 'react';
import { Course } from '../App';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ArrowLeft, Trash2, Edit, Users, BookOpen, Award, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId } from '../utils/supabase/info';
import { motion } from 'motion/react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-a6119645`;

interface CourseManagementViewProps {
  course: Course;
  accessToken: string;
  onBack: () => void;
  onDelete: () => void;
  onEdit?: () => void;
}

interface CourseStats {
  enrolledUsers: number;
  completedLessons: number;
  quizzesTaken: number;
  quizzesPassed: number;
  averageScore: number;
}

export function CourseManagementView({
  course,
  accessToken,
  onBack,
  onDelete,
  onEdit,
}: CourseManagementViewProps) {
  const [stats, setStats] = useState<CourseStats | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    fetchCourseStats();
  }, [course.id]);

  const fetchCourseStats = async () => {
    setIsLoadingStats(true);
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/overview`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const courseStats = data.courseStats[course.id];
        
        if (courseStats) {
          setStats(courseStats);
        } else {
          // No stats yet for this course
          setStats({
            enrolledUsers: 0,
            completedLessons: 0,
            quizzesTaken: 0,
            quizzesPassed: 0,
            averageScore: 0,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching course stats:', error);
      toast.error('Failed to load course statistics');
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleDeleteCourse = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${course.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete course');
      }

      toast.success('Course deleted successfully');
      onDelete();
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
      setIsDeleting(false);
    }
  };

  const totalLessons = course.modules.reduce((acc, module) => acc + module.lessons.length, 0);
  const totalQuizzes = course.modules.length;

  const moduleData = course.modules.map((module) => ({
    name: module.title,
    lessons: module.lessons.length,
  }));

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50"
    >
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-gray-900">{course.title}</h1>
                <Badge variant="outline" className="bg-purple-50">Admin View</Badge>
              </div>
              <p className="text-gray-600 mb-4">{course.description}</p>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{course.instructor}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{course.modules.length} Modules</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={onEdit ? onEdit : () => toast.info('Course editing feature coming soon')}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Course
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isDeleting}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isDeleting ? 'Deleting...' : 'Delete Course'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Delete "{course.title}"?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the course
                      "{course.title}" and remove it from the platform. Any student progress
                      for this course will remain in the system but the course content will no longer be accessible.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteCourse}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete Course
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoadingStats ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading statistics...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Enrolled Students</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.enrolledUsers || 0}</div>
                  <p className="text-xs text-gray-500">Total enrollments</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Lessons Completed</CardTitle>
                  <BookOpen className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.completedLessons || 0}</div>
                  <p className="text-xs text-gray-500">Out of {totalLessons * (stats?.enrolledUsers || 0)} possible</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Quiz Pass Rate</CardTitle>
                  <Award className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.quizzesTaken ? Math.round((stats.quizzesPassed / stats.quizzesTaken) * 100) : 0}%
                  </div>
                  <p className="text-xs text-gray-500">
                    {stats?.quizzesPassed || 0} / {stats?.quizzesTaken || 0} passed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Average Score</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.averageScore.toFixed(1) || 0}%</div>
                  <p className="text-xs text-gray-500">Across all quizzes</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList>
                <TabsTrigger value="overview">Course Overview</TabsTrigger>
                <TabsTrigger value="modules">Modules & Content</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Structure</CardTitle>
                    <CardDescription>Distribution of lessons across modules</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={moduleData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="lessons" fill="#8b5cf6" name="Lessons per Module" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Course Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Course ID:</span>
                        <span className="font-mono text-sm">{course.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Modules:</span>
                        <span className="font-semibold">{course.modules.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Lessons:</span>
                        <span className="font-semibold">{totalLessons}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Quizzes:</span>
                        <span className="font-semibold">{totalQuizzes}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-semibold">{course.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Instructor:</span>
                        <span className="font-semibold">{course.instructor}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Engagement Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Completion Rate:</span>
                        <span className="font-semibold">
                          {stats?.enrolledUsers && totalLessons
                            ? Math.round((stats.completedLessons / (totalLessons * stats.enrolledUsers)) * 100)
                            : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quiz Attempts:</span>
                        <span className="font-semibold">{stats?.quizzesTaken || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Success Rate:</span>
                        <Badge className={stats && stats.quizzesTaken > 0 && (stats.quizzesPassed / stats.quizzesTaken) >= 0.7 ? 'bg-green-600' : 'bg-yellow-600'}>
                          {stats?.quizzesTaken ? Math.round((stats.quizzesPassed / stats.quizzesTaken) * 100) : 0}%
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg. Lessons per Student:</span>
                        <span className="font-semibold">
                          {stats?.enrolledUsers ? (stats.completedLessons / stats.enrolledUsers).toFixed(1) : 0}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Modules Tab */}
              <TabsContent value="modules" className="space-y-6">
                <div className="grid gap-4">
                  {course.modules.map((module, index) => (
                    <Card key={module.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <Badge variant="outline">Module {index + 1}</Badge>
                              {module.title}
                            </CardTitle>
                            <CardDescription className="mt-2">{module.description}</CardDescription>
                          </div>
                          <Badge variant="secondary">{module.lessons.length} lessons</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm text-gray-700 mb-2">Lessons:</h4>
                          <div className="grid gap-2">
                            {module.lessons.map((lesson, lessonIndex) => (
                              <div key={lesson.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <Badge variant="outline" className="text-xs">{lessonIndex + 1}</Badge>
                                  <span className="text-sm">{lesson.title}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="text-xs">{lesson.type}</Badge>
                                  {lesson.duration && (
                                    <span className="text-xs text-gray-500">{lesson.duration}</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-purple-900">Module Quiz</span>
                              <Badge className="bg-purple-600">
                                {module.quiz.questions.length} questions · {module.quiz.passingScore}% to pass
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Performance Tab */}
              <TabsContent value="performance" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Summary</CardTitle>
                    <CardDescription>How students are performing in this course</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stats && stats.enrolledUsers > 0 ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Users className="w-5 h-5 text-blue-600" />
                              <h4 className="font-semibold text-blue-900">Student Engagement</h4>
                            </div>
                            <p className="text-2xl font-bold text-blue-900">{stats.enrolledUsers}</p>
                            <p className="text-sm text-blue-700">students enrolled</p>
                          </div>

                          <div className="p-4 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <h4 className="font-semibold text-green-900">Quiz Success</h4>
                            </div>
                            <p className="text-2xl font-bold text-green-900">{stats.quizzesPassed}</p>
                            <p className="text-sm text-green-700">quizzes passed</p>
                          </div>

                          <div className="p-4 bg-amber-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Award className="w-5 h-5 text-amber-600" />
                              <h4 className="font-semibold text-amber-900">Average Performance</h4>
                            </div>
                            <p className="text-2xl font-bold text-amber-900">{stats.averageScore.toFixed(1)}%</p>
                            <p className="text-sm text-amber-700">average quiz score</p>
                          </div>
                        </div>

                        <div className="border-t pt-6">
                          <h4 className="font-semibold mb-4">Insights</h4>
                          <div className="space-y-3">
                            {stats.averageScore >= 80 && (
                              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                <div>
                                  <p className="font-semibold text-green-900">Excellent Performance</p>
                                  <p className="text-sm text-green-700">Students are performing very well in this course with an average score above 80%.</p>
                                </div>
                              </div>
                            )}
                            {stats.averageScore < 70 && stats.quizzesTaken > 0 && (
                              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                                <XCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                                <div>
                                  <p className="font-semibold text-amber-900">Needs Attention</p>
                                  <p className="text-sm text-amber-700">Average scores are below 70%. Consider reviewing course difficulty or providing additional support materials.</p>
                                </div>
                              </div>
                            )}
                            {stats.completedLessons < totalLessons * stats.enrolledUsers * 0.5 && (
                              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                  <p className="font-semibold text-blue-900">Low Completion Rate</p>
                                  <p className="text-sm text-blue-700">Many students haven&apos;t completed all lessons. Consider sending engagement reminders.</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p>No enrollment data yet</p>
                        <p className="text-sm mt-2">Statistics will appear once students start enrolling in this course.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </motion.div>
  );
}