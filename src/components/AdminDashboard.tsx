import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { ArrowLeft, Users, BookOpen, CheckCircle, XCircle, TrendingUp, Award, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { courses } from '../data/courses';
import { motion } from 'framer-motion';
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

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-a6119645`;

interface AnalyticsOverview {
  totalUsers: number;
  totalLessonsCompleted: number;
  totalQuizzesTaken: number;
  totalQuizzesPassed: number;
  averageQuizPassRate: number;
}

interface CourseStats {
  [courseId: string]: {
    enrolledUsers: number;
    completedLessons: number;
    quizzesTaken: number;
    quizzesPassed: number;
    averageScore: number;
  };
}

interface UserDetail {
  userId: string;
  email: string;
  name: string;
  lessonsCompleted: number;
  quizzesTaken: number;
  quizzesPassed: number;
  lastActive: string;
}

interface AdminDashboardProps {
  accessToken: string;
  onBack: () => void;
  onCreateCourse: () => void;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function AdminDashboard({ accessToken, onBack, onCreateCourse }: AdminDashboardProps) {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [courseStats, setCourseStats] = useState<CourseStats>({});
  const [userDetails, setUserDetails] = useState<UserDetail[]>([]);
  const [lessonStats, setLessonStats] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [customCourses, setCustomCourses] = useState<any[]>([]);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
    fetchCustomCourses();
  }, []);

  const fetchCustomCourses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/list`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCustomCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching custom courses:', error);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    setDeletingCourseId(courseId);
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete course');
      }

      toast.success('Course deleted successfully');
      // Refresh custom courses list
      await fetchCustomCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
    } finally {
      setDeletingCourseId(null);
    }
  };

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/overview`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setOverview(data.overview);
      setCourseStats(data.courseStats);
      setUserDetails(data.userDetails);
      setLessonStats(data.lessonStats);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const getCourseTitle = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course?.title || courseId;
  };

  const getLessonTitle = (lessonKey: string) => {
    const [courseId, moduleId, lessonId] = lessonKey.split(':');
    const course = courses.find(c => c.id === courseId);
    if (!course) return lessonId;
    
    for (const module of course.modules) {
      if (module.id === moduleId) {
        const lesson = module.lessons.find(l => l.id === lessonId);
        return lesson?.title || lessonId;
      }
    }
    return lessonId;
  };

  const courseChartData = Object.entries(courseStats).map(([courseId, stats]) => ({
    name: getCourseTitle(courseId),
    enrolled: stats.enrolledUsers,
    lessons: stats.completedLessons,
    quizzes: stats.quizzesTaken,
  }));

  const quizPerformanceData = Object.entries(courseStats).map(([courseId, stats]) => ({
    name: getCourseTitle(courseId),
    passed: stats.quizzesPassed,
    failed: stats.quizzesTaken - stats.quizzesPassed,
    avgScore: Math.round(stats.averageScore),
  }));

  // Identify struggling students (completed less than 3 lessons or failed multiple quizzes)
  const strugglingStudents = userDetails.filter(user => 
    user.lessonsCompleted < 3 || (user.quizzesTaken > 0 && user.quizzesPassed / user.quizzesTaken < 0.5)
  );

  // Top performers
  const topPerformers = [...userDetails]
    .filter(user => user.quizzesTaken > 0)
    .sort((a, b) => (b.quizzesPassed / b.quizzesTaken) - (a.quizzesPassed / a.quizzesTaken))
    .slice(0, 5);

  // Most and least completed lessons
  const lessonCompletionData = Object.entries(lessonStats)
    .map(([key, stats]) => ({
      key,
      title: getLessonTitle(key),
      completions: stats.completions,
    }))
    .sort((a, b) => b.completions - a.completions);

  const mostCompletedLessons = lessonCompletionData.slice(0, 5);
  const leastCompletedLessons = lessonCompletionData.slice(-5).reverse();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Button variant="ghost" onClick={onBack} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Comprehensive platform analytics and insights</p>
          </div>
          <div>
            <Button 
              variant="default" 
              onClick={onCreateCourse}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Course
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview?.totalUsers || 0}</div>
              <p className="text-xs text-gray-500">Active learners</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Lessons Completed</CardTitle>
              <BookOpen className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview?.totalLessonsCompleted || 0}</div>
              <p className="text-xs text-gray-500">Across all courses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Quiz Pass Rate</CardTitle>
              <Award className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overview?.averageQuizPassRate.toFixed(1) || 0}%
              </div>
              <p className="text-xs text-gray-500">
                {overview?.totalQuizzesPassed || 0} / {overview?.totalQuizzesTaken || 0} passed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Students Needing Support</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{strugglingStudents.length}</div>
              <p className="text-xs text-gray-500">Below expected progress</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList>
            <TabsTrigger value="courses">Course Analytics</TabsTrigger>
            <TabsTrigger value="lessons">Lesson Completion</TabsTrigger>
            <TabsTrigger value="students">Student Performance</TabsTrigger>
            <TabsTrigger value="support">Students Needing Support</TabsTrigger>
            <TabsTrigger value="manage">Course Management</TabsTrigger>
          </TabsList>

          {/* Course Analytics Tab */}
          <TabsContent value="courses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Enrollment & Activity</CardTitle>
                <CardDescription>
                  Overview of user engagement across all courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={courseChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="enrolled" fill="#3b82f6" name="Enrolled Users" />
                    <Bar dataKey="lessons" fill="#10b981" name="Completed Lessons" />
                    <Bar dataKey="quizzes" fill="#f59e0b" name="Quizzes Taken" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quiz Performance by Course</CardTitle>
                <CardDescription>
                  Pass/fail rates and average scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={quizPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="passed" stackId="a" fill="#10b981" name="Passed" />
                    <Bar dataKey="failed" stackId="a" fill="#ef4444" name="Failed" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(courseStats).map(([courseId, stats]) => (
                <Card key={courseId}>
                  <CardHeader>
                    <CardTitle>{getCourseTitle(courseId)}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Enrolled Users:</span>
                      <span className="font-semibold">{stats.enrolledUsers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lessons Completed:</span>
                      <span className="font-semibold">{stats.completedLessons}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quizzes Taken:</span>
                      <span className="font-semibold">{stats.quizzesTaken}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quizzes Passed:</span>
                      <span className="font-semibold">{stats.quizzesPassed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Score:</span>
                      <span className="font-semibold">{stats.averageScore.toFixed(1)}%</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Lesson Completion Tab */}
          <TabsContent value="lessons" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Most Completed Lessons
                  </CardTitle>
                  <CardDescription>
                    Lessons with highest completion rates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mostCompletedLessons.map((lesson, index) => (
                      <div key={lesson.key} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="bg-green-100">#{index + 1}</Badge>
                          <span className="text-sm">{lesson.title}</span>
                        </div>
                        <Badge className="bg-green-600">{lesson.completions} completions</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Least Completed Lessons
                  </CardTitle>
                  <CardDescription>
                    Lessons that may need review or support
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leastCompletedLessons.map((lesson, index) => (
                      <div key={lesson.key} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="bg-red-100">#{index + 1}</Badge>
                          <span className="text-sm">{lesson.title}</span>
                        </div>
                        <Badge variant="destructive">{lesson.completions} completions</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Student Performance Tab */}
          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>
                  Students with highest quiz pass rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Lessons</TableHead>
                      <TableHead>Quiz Pass Rate</TableHead>
                      <TableHead>Last Active</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topPerformers.map((user, index) => (
                      <TableRow key={user.userId}>
                        <TableCell>
                          <Badge variant="secondary">#{index + 1}</Badge>
                        </TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.lessonsCompleted}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-600">
                            {((user.quizzesPassed / user.quizzesTaken) * 100).toFixed(0)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-500 text-sm">
                          {new Date(user.lastActive).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>All Students</CardTitle>
                <CardDescription>
                  Complete overview of student progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Lessons</TableHead>
                      <TableHead>Quizzes</TableHead>
                      <TableHead>Pass Rate</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userDetails.map((user) => {
                      const passRate = user.quizzesTaken > 0 
                        ? (user.quizzesPassed / user.quizzesTaken) * 100 
                        : 0;
                      const isStruggling = user.lessonsCompleted < 3 || passRate < 50;
                      
                      return (
                        <TableRow key={user.userId}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.lessonsCompleted}</TableCell>
                          <TableCell>{user.quizzesTaken}</TableCell>
                          <TableCell>
                            {user.quizzesTaken > 0 ? (
                              <Badge 
                                className={passRate >= 70 ? 'bg-green-600' : passRate >= 50 ? 'bg-yellow-600' : 'bg-red-600'}
                              >
                                {passRate.toFixed(0)}%
                              </Badge>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {isStruggling ? (
                              <Badge variant="destructive">Needs Support</Badge>
                            ) : (
                              <Badge className="bg-green-600">On Track</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Needing Support Tab */}
          <TabsContent value="support" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Students Requiring Intervention
                </CardTitle>
                <CardDescription>
                  Students with low completion rates or poor quiz performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                {strugglingStudents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
                    <p>All students are performing well!</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Lessons Completed</TableHead>
                        <TableHead>Quiz Performance</TableHead>
                        <TableHead>Issues</TableHead>
                        <TableHead>Last Active</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {strugglingStudents.map((user) => {
                        const passRate = user.quizzesTaken > 0 
                          ? (user.quizzesPassed / user.quizzesTaken) * 100 
                          : 0;
                        const issues = [];
                        
                        if (user.lessonsCompleted < 3) {
                          issues.push('Low completion');
                        }
                        if (user.quizzesTaken > 0 && passRate < 50) {
                          issues.push('Failing quizzes');
                        }
                        
                        return (
                          <TableRow key={user.userId}>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge variant={user.lessonsCompleted < 3 ? 'destructive' : 'secondary'}>
                                {user.lessonsCompleted}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {user.quizzesTaken > 0 ? (
                                <Badge variant={passRate < 50 ? 'destructive' : 'secondary'}>
                                  {user.quizzesPassed}/{user.quizzesTaken} ({passRate.toFixed(0)}%)
                                </Badge>
                              ) : (
                                <span className="text-gray-400">No quizzes</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                {issues.map(issue => (
                                  <Badge key={issue} variant="destructive" className="text-xs">
                                    {issue}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-500 text-sm">
                              {new Date(user.lastActive).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {strugglingStudents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">For Low Completion Rates:</h4>
                    <ul className="list-disc list-inside text-blue-800 space-y-1 text-sm">
                      <li>Send personalized reminder emails</li>
                      <li>Offer one-on-one support sessions</li>
                      <li>Review course difficulty and pacing</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <h4 className="font-semibold text-amber-900 mb-2">For Poor Quiz Performance:</h4>
                    <ul className="list-disc list-inside text-amber-800 space-y-1 text-sm">
                      <li>Provide additional study materials</li>
                      <li>Schedule review sessions for difficult topics</li>
                      <li>Allow quiz retakes with feedback</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Course Management Tab */}
          <TabsContent value="manage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Manage Courses</CardTitle>
                <CardDescription>
                  View and delete custom courses from the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                {customCourses.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No custom courses created yet.</p>
                    <p className="text-sm mt-2">Click &quot;Create New Course&quot; to add your first course.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course Title</TableHead>
                        <TableHead>Instructor</TableHead>
                        <TableHead>Modules</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customCourses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{course.title}</p>
                              <p className="text-sm text-gray-500">{course.description}</p>
                            </div>
                          </TableCell>
                          <TableCell>{course.instructor}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{course.modules?.length || 0} modules</Badge>
                          </TableCell>
                          <TableCell>{course.duration}</TableCell>
                          <TableCell>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  disabled={deletingCourseId === course.id}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  {deletingCourseId === course.id ? 'Deleting...' : 'Delete'}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete &quot;{course.title}&quot;?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the course
                                    &quot;{course.title}&quot; and remove it from the platform. Any student progress
                                    for this course will remain in the system but the course content will no longer be accessible.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteCourse(course.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete Course
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}