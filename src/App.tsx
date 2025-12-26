import { useState, useEffect } from 'react';
import { CourseDashboard } from './components/CourseDashboard';
import { CourseView } from './components/CourseView';
import { LessonView } from './components/LessonView';
import { QuizView } from './components/QuizView';
import { AuthPage } from './components/AuthPage';
import { AdminDashboard } from './components/AdminDashboard';
import { CreateCoursePage } from './components/CreateCoursePage';
import { CourseManagementView } from './components/CourseManagementView';
import { EditCoursePage } from './components/EditCoursePage';
import { Toaster } from './components/ui/sonner';
import { AuthUser, getAuthFromLocalStorage, saveAuthToLocalStorage, clearAuthFromLocalStorage } from './utils/auth';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { LogOut, User, BarChart3, Shield } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId } from './utils/supabase/info';
import { courses } from './data/courses';
import { motion } from 'motion/react';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-a6119645`;

export type ContentType = 'video' | 'article' | 'quiz';

export interface Lesson {
  id: string;
  title: string;
  type: ContentType;
  duration?: string;
  content: string;
  description: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  quiz: {
    id: string;
    questions: QuizQuestion[];
    passingScore: number;
  };
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  modules: Module[];
  instructor: string;
  duration: string;
}

export interface UserProgress {
  [courseId: string]: {
    [moduleId: string]: {
      completedLessons: string[];
      quizScore?: number;
      quizPassed: boolean;
    };
  };
}

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'course' | 'lesson' | 'quiz' | 'admin' | 'createCourse' | 'courseManagement' | 'editCourse'>('dashboard');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [viewMode, setViewMode] = useState<'learner' | 'admin'>('learner');
  const [progress, setProgress] = useState<UserProgress>({});
  const [allCourses, setAllCourses] = useState<Course[]>(courses);

  // Load auth and progress from server
  useEffect(() => {
    const auth = getAuthFromLocalStorage();
    if (auth) {
      setAuthUser(auth);
      loadProgressFromServer(auth.accessToken);
      checkAdminStatus(auth.accessToken);
      // Load courses with auth
      loadCustomCourses(auth.accessToken);
    } else {
      // Without auth, just use default courses
      setAllCourses(courses);
    }
  }, []);

  // Reload courses when returning to dashboard
  useEffect(() => {
    if (currentView === 'dashboard') {
      loadCustomCourses(authUser?.accessToken);
    }
  }, [currentView, authUser]);

  const loadCustomCourses = async (accessToken?: string) => {
    // Only attempt to load custom courses if we have an access token
    if (!accessToken) {
      console.log('No access token available, using default courses only');
      setAllCourses(courses);
      return;
    }

    try {
      console.log('Loading custom courses from server...');
      
      const response = await fetch(`${API_BASE_URL}/courses/list`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      console.log('Server response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Server response data:', data);
        console.log('Custom courses received:', data.courses ? data.courses.length : 0);
        
        if (data.courses && data.courses.length > 0) {
          // Merge custom courses with existing hardcoded courses
          const mergedCourses = [...courses, ...data.courses];
          console.log('Merging courses - default:', courses.length, 'custom:', data.courses.length, 'total:', mergedCourses.length);
          setAllCourses(mergedCourses);
        } else {
          // If no custom courses, just use the default courses
          console.log('No custom courses found, using default courses only');
          setAllCourses(courses);
        }
      } else {
        const errorText = await response.text();
        console.log('Unable to load custom courses, response:', errorText);
        setAllCourses(courses);
      }
    } catch (error) {
      console.error('Error loading custom courses:', error);
      setAllCourses(courses);
    }
  };

  const checkAdminStatus = async (accessToken: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/session`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        // Check if user metadata contains isAdmin flag
        if (data.isAdmin) {
          setIsAdmin(true);
          console.log('User is an admin');
        } else {
          setIsAdmin(false);
          console.log('User is not an admin');
        }
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const loadProgressFromServer = async (accessToken: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/progress/get`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.progress && Object.keys(data.progress).length > 0) {
          setProgress(data.progress);
          localStorage.setItem('medicalCoursesProgress', JSON.stringify(data.progress));
        } else {
          // Load from localStorage if server has no data
          const saved = localStorage.getItem('medicalCoursesProgress');
          if (saved) {
            setProgress(JSON.parse(saved));
          }
        }
      }
    } catch (error) {
      console.error('Error loading progress:', error);
      // Fallback to localStorage
      const saved = localStorage.getItem('medicalCoursesProgress');
      if (saved) {
        setProgress(JSON.parse(saved));
      }
    }
  };

  const saveProgressToServer = async (newProgress: UserProgress, accessToken: string) => {
    try {
      await fetch(`${API_BASE_URL}/progress/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ progress: newProgress }),
      });
    } catch (error) {
      console.error('Error saving progress to server:', error);
    }
  };

  const updateProgress = (newProgress: UserProgress) => {
    setProgress(newProgress);
    localStorage.setItem('medicalCoursesProgress', JSON.stringify(newProgress));
    
    // Save to server if user is logged in
    if (authUser?.accessToken) {
      saveProgressToServer(newProgress, authUser.accessToken);
    }
  };

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
    // If in admin mode, show management view, otherwise show regular course view
    if (isAdmin && viewMode === 'admin') {
      setCurrentView('courseManagement');
    } else {
      setCurrentView('course');
    }
  };

  const handleSelectLesson = (lesson: Lesson, module: Module) => {
    setSelectedModule(module);
    setSelectedLesson(lesson);
    setCurrentView('lesson');
  };

  const handleSelectQuiz = (module: Module) => {
    setSelectedModule(module);
    setCurrentView('quiz');
  };

  const handleCompleteLesson = (courseId: string, moduleId: string, lessonId: string) => {
    const newProgress = { ...progress };
    if (!newProgress[courseId]) {
      newProgress[courseId] = {};
    }
    if (!newProgress[courseId][moduleId]) {
      newProgress[courseId][moduleId] = {
        completedLessons: [],
        quizPassed: false,
      };
    }
    if (!newProgress[courseId][moduleId].completedLessons.includes(lessonId)) {
      newProgress[courseId][moduleId].completedLessons.push(lessonId);
    }
    updateProgress(newProgress);
  };

  const handleQuizComplete = (courseId: string, moduleId: string, score: number, passed: boolean) => {
    const newProgress = { ...progress };
    if (!newProgress[courseId]) {
      newProgress[courseId] = {};
    }
    if (!newProgress[courseId][moduleId]) {
      newProgress[courseId][moduleId] = {
        completedLessons: [],
        quizPassed: false,
      };
    }
    newProgress[courseId][moduleId].quizScore = score;
    newProgress[courseId][moduleId].quizPassed = passed;
    updateProgress(newProgress);
  };

  const handleBackToCourse = () => {
    setCurrentView('course');
    setSelectedLesson(null);
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedCourse(null);
    setSelectedModule(null);
    setSelectedLesson(null);
  };

  const handleLogin = (user: AuthUser) => {
    setAuthUser(user);
    saveAuthToLocalStorage(user);
  };

  const handleLogout = () => {
    setAuthUser(null);
    clearAuthFromLocalStorage();
    setCurrentView('dashboard');
  };

  const handlePromoteToAdmin = async () => {
    if (!authUser?.accessToken) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/admin/promote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authUser.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: authUser.email }),
      });

      if (response.ok) {
        setIsAdmin(true);
        toast.success('You are now an admin! Please log out and log back in for the changes to take full effect.');
        
        // Verify admin status by checking session again
        await checkAdminStatus(authUser.accessToken);
      } else {
        const errorData = await response.json();
        console.error('Failed to promote to admin:', errorData);
        toast.error(`Failed to promote to admin: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error promoting to admin:', error);
      toast.error('Failed to promote to admin');
    }
  };

  const handleViewAnalytics = () => {
    setCurrentView('admin');
  };

  const handleBackFromAdmin = () => {
    setCurrentView('dashboard');
  };

  const handleToggleViewMode = () => {
    if (viewMode === 'learner') {
      setViewMode('admin');
      setCurrentView('admin');
    } else {
      setViewMode('learner');
      setCurrentView('dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {authUser ? (
        <>
          <motion.div 
            className="fixed top-0 right-0 p-4 z-50"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div 
              className="flex items-center gap-3 bg-white rounded-lg shadow-md px-4 py-2"
              whileHover={{ y: -2, boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              >
                <User className="w-5 h-5 text-blue-600" />
              </motion.div>
              <span className="text-gray-700">{authUser.name}</span>
              {isAdmin && (
                <>
                  {/* Toggle between Learner and Admin views */}
                  <motion.div 
                    className="flex items-center gap-2 ml-2 pl-3 border-l border-gray-200"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <span className={`text-sm ${viewMode === 'learner' ? 'font-semibold text-blue-600' : 'text-gray-500'}`}>
                      Learner
                    </span>
                    <motion.button
                      onClick={handleToggleViewMode}
                      whileTap={{ scale: 0.95 }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                        viewMode === 'admin' ? 'bg-purple-600' : 'bg-gray-300'
                      }`}
                    >
                      <motion.span
                        layout
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className={`inline-block h-4 w-4 transform rounded-full bg-white ${
                          viewMode === 'admin' ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </motion.button>
                    <span className={`text-sm ${viewMode === 'admin' ? 'font-semibold text-purple-600' : 'text-gray-500'}`}>
                      Admin
                    </span>
                  </motion.div>
                </>
              )}
              {!isAdmin && (
                <motion.div 
                  className="flex items-center gap-2 ml-2 pl-3 border-l border-gray-200"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="text-sm font-semibold text-blue-600">
                    Learner
                  </span>
                  <motion.button
                    onClick={handlePromoteToAdmin}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.05 }}
                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 bg-gray-300"
                    title="Click to become admin"
                  >
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                  </motion.button>
                  <span className="text-sm text-gray-500">
                    Admin
                  </span>
                </motion.div>
              )}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="ml-2"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
          {currentView === 'dashboard' && (
            <CourseDashboard 
              onSelectCourse={handleSelectCourse}
              progress={progress}
              courses={allCourses}
              isAdmin={isAdmin}
              viewMode={viewMode}
            />
          )}
          
          {currentView === 'course' && selectedCourse && (
            <CourseView
              course={selectedCourse}
              progress={progress}
              onSelectLesson={handleSelectLesson}
              onSelectQuiz={handleSelectQuiz}
              onBack={handleBackToDashboard}
            />
          )}
          
          {currentView === 'lesson' && selectedCourse && selectedModule && selectedLesson && (
            <LessonView
              course={selectedCourse}
              module={selectedModule}
              lesson={selectedLesson}
              onComplete={handleCompleteLesson}
              onBack={handleBackToCourse}
            />
          )}
          
          {currentView === 'quiz' && selectedCourse && selectedModule && (
            <QuizView
              course={selectedCourse}
              module={selectedModule}
              quiz={selectedModule.quiz}
              onComplete={handleQuizComplete}
              onBack={handleBackToCourse}
            />
          )}
          
          {currentView === 'admin' && (
            <AdminDashboard 
              accessToken={authUser.accessToken}
              onBack={handleBackFromAdmin}
              onCreateCourse={() => setCurrentView('createCourse')}
            />
          )}
          
          {currentView === 'createCourse' && (
            <CreateCoursePage 
              accessToken={authUser.accessToken}
              onBack={() => setCurrentView('admin')}
              onSaveCourse={async (course) => {
                console.log('Course saved, reloading course list...');
                // Small delay to ensure server has saved the course
                await new Promise(resolve => setTimeout(resolve, 500));
                // Reload courses to include the new one with auth token
                await loadCustomCourses(authUser?.accessToken);
                console.log('Course list reloaded, navigating to dashboard...');
                toast.success('Course created successfully! You can now see it in the courses list.');
                setCurrentView('dashboard');
              }}
            />
          )}
          
          {currentView === 'courseManagement' && selectedCourse && (
            <CourseManagementView 
              course={selectedCourse}
              accessToken={authUser.accessToken}
              onBack={handleBackToDashboard}
              onEdit={() => setCurrentView('editCourse')}
              onDelete={async () => {
                // Reload courses after deletion
                await loadCustomCourses(authUser?.accessToken);
                // Navigate back to dashboard
                handleBackToDashboard();
              }}
            />
          )}
          
          {currentView === 'editCourse' && selectedCourse && (
            <EditCoursePage 
              course={selectedCourse}
              accessToken={authUser.accessToken}
              onBack={handleBackToDashboard}
              onUpdateCourse={async (updatedCourse) => {
                console.log('Course updated, reloading course list...');
                // Small delay to ensure server has saved the course
                await new Promise(resolve => setTimeout(resolve, 500));
                // Reload courses to include the updated one with auth token
                await loadCustomCourses(authUser?.accessToken);
                console.log('Course list reloaded, navigating to dashboard...');
                toast.success('Course updated successfully!');
                handleBackToDashboard();
              }}
            />
          )}
        </>
      ) : (
        <AuthPage onLogin={handleLogin} />
      )}
      <Toaster />
    </div>
  );
}

export default App;