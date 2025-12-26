import { Course, UserProgress } from '../App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { BookOpen, Clock, User, Award } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion } from 'motion/react';

interface CourseDashboardProps {
  onSelectCourse: (course: Course) => void;
  progress: UserProgress;
  courses: Course[];
  isAdmin?: boolean;
  viewMode?: 'learner' | 'admin';
}

export function CourseDashboard({ onSelectCourse, progress, courses, isAdmin, viewMode }: CourseDashboardProps) {
  const calculateCourseProgress = (courseId: string, course: Course): number => {
    if (!progress[courseId]) return 0;
    
    let totalItems = 0;
    let completedItems = 0;
    
    course.modules.forEach(module => {
      totalItems += module.lessons.length + 1; // lessons + quiz
      
      const moduleProgress = progress[courseId][module.id];
      if (moduleProgress) {
        completedItems += moduleProgress.completedLessons.length;
        if (moduleProgress.quizPassed) {
          completedItems += 1;
        }
      }
    });
    
    return totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
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
        transition={{ duration: 0.5 }}
        className="bg-white border-b"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-blue-900">MedLearn Platform</h1>
              <p className="text-gray-600 mt-1">Advanced Medical Education Courses</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="gap-2">
                <Award className="w-4 h-4" />
                Medical Student
              </Badge>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Courses', value: courses.length, icon: BookOpen, color: 'text-blue-600' },
            { label: 'In Progress', value: Object.keys(progress).length, icon: Clock, color: 'text-purple-600' },
            { label: 'Completed', value: courses.filter(c => calculateCourseProgress(c.id, c) === 100).length, icon: Award, color: 'text-green-600' },
            { label: 'Total Modules', value: courses.reduce((acc, c) => acc + c.modules.length, 0), icon: BookOpen, color: 'text-orange-600' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600">{stat.label}</p>
                      <p className="text-blue-900 mt-1">{stat.value}</p>
                    </div>
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Courses Grid */}
        <div>
          <motion.h2 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-900 mb-4"
          >
            Available Courses
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, index) => {
              const progressPercentage = calculateCourseProgress(course.id, course);
              
              return (
                <motion.div
                  key={course.id}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                    <div className="relative h-48 bg-gray-200 overflow-hidden">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.4 }}
                      >
                        <ImageWithFallback 
                          src={course.image}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                      {progressPercentage > 0 && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.6 + index * 0.1 }}
                        >
                          <Badge className="absolute top-3 right-3 bg-white text-blue-900">
                            {Math.round(progressPercentage)}% Complete
                          </Badge>
                        </motion.div>
                      )}
                    </div>
                    
                    <CardHeader>
                      <CardTitle>{course.title}</CardTitle>
                      <CardDescription>{course.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 text-gray-600">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{course.instructor}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{course.duration}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-600">{course.modules.length} Modules</span>
                        </div>
                        
                        {!(isAdmin && viewMode === 'admin') && (
                          <div className="space-y-2">
                            <Progress value={progressPercentage} className="h-2" />
                          </div>
                        )}
                        
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button 
                            onClick={() => onSelectCourse(course)}
                            className="w-full"
                            variant={isAdmin && viewMode === 'admin' ? 'secondary' : 'default'}
                          >
                            {isAdmin && viewMode === 'admin' ? 'Manage Course' : progressPercentage > 0 ? 'Continue Learning' : 'Start Course'}
                          </Button>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}