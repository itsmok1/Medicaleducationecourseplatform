import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Initialize Supabase client with service role key for admin operations
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Initialize Supabase client with anon key for regular operations
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-a6119645/health", (c) => {
  return c.json({ status: "ok" });
});

// Auth Routes

// Signup endpoint
app.post("/make-server-a6119645/auth/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    // Create user with Supabase Auth
    // Automatically confirm the user's email since an email server hasn't been configured.
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true, // Auto-confirm email since email server not configured
    });

    if (error) {
      console.error('Signup error during user creation:', error);
      return c.json({ error: error.message || 'Failed to create user' }, 400);
    }

    if (!data.user) {
      return c.json({ error: 'User creation failed' }, 400);
    }

    // Sign in the user to get an access token
    const { data: sessionData, error: signInError } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !sessionData.session) {
      console.error('Signup error during sign in after creation:', signInError);
      return c.json({ error: 'User created but sign in failed' }, 400);
    }

    return c.json({
      userId: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata.name,
      accessToken: sessionData.session.access_token,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// Login endpoint
app.post("/make-server-a6119645/auth/login", async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      console.error('Login error during authentication:', error);
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    return c.json({
      userId: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name || '',
      accessToken: data.session.access_token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Internal server error during login' }, 500);
  }
});

// Session check endpoint
app.get("/make-server-a6119645/auth/session", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];

    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);

    if (error || !user) {
      console.error('Session check error:', error);
      return c.json({ error: 'Invalid or expired session' }, 401);
    }

    return c.json({
      userId: user.id,
      email: user.email,
      name: user.user_metadata?.name || '',
      isAdmin: user.user_metadata?.isAdmin || false,
      accessToken,
    });
  } catch (error) {
    console.error('Session check error:', error);
    return c.json({ error: 'Internal server error during session check' }, 500);
  }
});

// Logout endpoint (client-side will handle clearing local storage)
app.post("/make-server-a6119645/auth/logout", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];

    if (accessToken) {
      await supabaseClient.auth.signOut();
    }

    return c.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return c.json({ error: 'Internal server error during logout' }, 500);
  }
});

// Progress Tracking Endpoints

// Save user progress
app.post("/make-server-a6119645/progress/save", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];

    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);

    if (authError || !user) {
      console.error('Authorization error while saving progress:', authError);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { progress } = await c.req.json();

    // Save user progress to KV store
    await kv.set(`user_progress:${user.id}`, JSON.stringify(progress));

    // Track analytics event
    const event = {
      userId: user.id,
      userEmail: user.email,
      userName: user.user_metadata?.name || '',
      timestamp: new Date().toISOString(),
      progress,
    };

    // Save to analytics events
    const existingEvents = await kv.get(`analytics_events:${user.id}`);
    const events = existingEvents ? JSON.parse(existingEvents) : [];
    events.push(event);
    
    // Keep only last 1000 events per user
    if (events.length > 1000) {
      events.shift();
    }
    
    await kv.set(`analytics_events:${user.id}`, JSON.stringify(events));

    return c.json({ success: true });
  } catch (error) {
    console.error('Error saving progress:', error);
    return c.json({ error: 'Internal server error while saving progress' }, 500);
  }
});

// Get user progress
app.get("/make-server-a6119645/progress/get", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];

    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);

    if (authError || !user) {
      console.error('Authorization error while fetching progress:', authError);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const progress = await kv.get(`user_progress:${user.id}`);
    return c.json({ progress: progress ? JSON.parse(progress) : {} });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return c.json({ error: 'Internal server error while fetching progress' }, 500);
  }
});

// Analytics Endpoints (Admin only)

// Get overall platform analytics
app.get("/make-server-a6119645/analytics/overview", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];

    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);

    if (authError || !user) {
      console.error('Authorization error while fetching analytics:', authError);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if user is admin (stored in user metadata)
    if (!user.user_metadata?.isAdmin) {
      return c.json({ error: 'Forbidden: Admin access required' }, 403);
    }

    // Get all user progress data using getByPrefix
    const progressEntries = await kv.getByPrefix('user_progress:');
    
    let totalUsers = 0;
    let totalLessonsCompleted = 0;
    let totalQuizzesTaken = 0;
    let totalQuizzesPassed = 0;
    const courseStats: Record<string, any> = {};
    const lessonStats: Record<string, { attempts: number; completions: number; title: string }> = {};
    const userDetails: any[] = [];

    // Check if there are any progress entries
    if (!progressEntries || progressEntries.length === 0) {
      console.log('No progress entries found, returning empty analytics');
      return c.json({
        overview: {
          totalUsers: 0,
          totalLessonsCompleted: 0,
          totalQuizzesTaken: 0,
          totalQuizzesPassed: 0,
          averageQuizPassRate: 0,
        },
        courseStats: {},
        lessonStats: {},
        userDetails: [],
      });
    }

    console.log(`Processing ${progressEntries.length} user progress entries`);

    for (const progressValue of progressEntries) {
      if (!progressValue) continue;
      
      // Parse the progress data
      let progress;
      let userId;
      
      try {
        // The value might be a string or already parsed
        if (typeof progressValue === 'string') {
          progress = JSON.parse(progressValue);
        } else {
          progress = progressValue;
        }
        
        // Try to extract userId from the progress data or skip this entry
        // Since getByPrefix returns values, not keys, we need to handle this differently
        // For now, let's skip user data retrieval if we can't get userId
        
      } catch (parseError) {
        console.error('Error parsing progress entry:', parseError);
        continue;
      }
      
      totalUsers++;
      
      let userLessonsCompleted = 0;
      let userQuizzesTaken = 0;
      let userQuizzesPassed = 0;
      
      for (const [courseId, courseProgress] of Object.entries(progress as any)) {
        if (!courseStats[courseId]) {
          courseStats[courseId] = {
            enrolledUsers: 0,
            completedLessons: 0,
            quizzesTaken: 0,
            quizzesPassed: 0,
            averageScore: 0,
            totalScore: 0,
          };
        }
        
        courseStats[courseId].enrolledUsers++;
        
        for (const [moduleId, moduleProgress] of Object.entries(courseProgress as any)) {
          const completedLessons = (moduleProgress as any).completedLessons || [];
          const quizScore = (moduleProgress as any).quizScore;
          const quizPassed = (moduleProgress as any).quizPassed;
          
          totalLessonsCompleted += completedLessons.length;
          userLessonsCompleted += completedLessons.length;
          courseStats[courseId].completedLessons += completedLessons.length;
          
          // Track lesson-specific stats
          for (const lessonId of completedLessons) {
            const key = `${courseId}:${moduleId}:${lessonId}`;
            if (!lessonStats[key]) {
              lessonStats[key] = { attempts: 0, completions: 0, title: lessonId };
            }
            lessonStats[key].completions++;
          }
          
          if (quizScore !== undefined) {
            totalQuizzesTaken++;
            userQuizzesTaken++;
            courseStats[courseId].quizzesTaken++;
            courseStats[courseId].totalScore += quizScore;
            
            if (quizPassed) {
              totalQuizzesPassed++;
              userQuizzesPassed++;
              courseStats[courseId].quizzesPassed++;
            }
          }
        }
      }
    }
    
    // Calculate averages
    for (const courseId in courseStats) {
      if (courseStats[courseId].quizzesTaken > 0) {
        courseStats[courseId].averageScore = 
          courseStats[courseId].totalScore / courseStats[courseId].quizzesTaken;
      }
    }

    console.log(`Analytics summary: ${totalUsers} users, ${totalLessonsCompleted} lessons completed`);

    return c.json({
      overview: {
        totalUsers,
        totalLessonsCompleted,
        totalQuizzesTaken,
        totalQuizzesPassed,
        averageQuizPassRate: totalQuizzesTaken > 0 ? (totalQuizzesPassed / totalQuizzesTaken) * 100 : 0,
      },
      courseStats,
      lessonStats,
      userDetails: [], // Simplified for now since we can't easily get user details
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return c.json({ error: `Internal server error while fetching analytics: ${error.message}` }, 500);
  }
});

// Get user-specific analytics (for instructors to identify struggling students)
app.get("/make-server-a6119645/analytics/users/:userId", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];

    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);

    if (authError || !user) {
      console.error('Authorization error while fetching user analytics:', authError);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if user is admin
    if (!user.user_metadata?.isAdmin) {
      return c.json({ error: 'Forbidden: Admin access required' }, 403);
    }

    const targetUserId = c.req.param('userId');
    const progress = await kv.get(`user_progress:${targetUserId}`);
    const events = await kv.get(`analytics_events:${targetUserId}`);
    
    const userData = await supabaseAdmin.auth.admin.getUserById(targetUserId);

    return c.json({
      user: {
        id: targetUserId,
        email: userData.data.user?.email,
        name: userData.data.user?.user_metadata?.name || 'Unknown',
        createdAt: userData.data.user?.created_at,
        lastSignIn: userData.data.user?.last_sign_in_at,
      },
      progress: progress ? JSON.parse(progress) : {},
      events: events ? JSON.parse(events) : [],
    });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    return c.json({ error: 'Internal server error while fetching user analytics' }, 500);
  }
});

// Admin promotion endpoint
app.post("/make-server-a6119645/admin/promote", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      console.error('No access token provided for admin promotion');
      return c.json({ error: 'Unauthorized - No token provided' }, 401);
    }

    console.log('Attempting to promote user to admin with token...');

    // Try to get user with the access token
    let userId: string;
    let userMetadata: any;
    
    try {
      // First try with service role
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
      
      if (authError || !user) {
        console.log('Service role validation failed, trying with anon client...');
        
        // Try with anon client
        const { data: { user: anonUser }, error: anonError } = await supabaseClient.auth.getUser(accessToken);
        
        if (anonError || !anonUser) {
          console.error('Both validation methods failed:', authError, anonError);
          
          // As a fallback for demo purposes, allow promoting by email
          const { email } = await c.req.json();
          
          if (!email) {
            return c.json({ error: 'Unauthorized - Could not validate token and no email provided' }, 401);
          }
          
          console.log('Attempting to promote user by email:', email);
          
          // Look up user by email
          const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
          
          if (listError || !users) {
            console.error('Error listing users:', listError);
            return c.json({ error: 'Failed to find user' }, 500);
          }
          
          const targetUser = users.find(u => u.email === email);
          
          if (!targetUser) {
            return c.json({ error: 'User not found' }, 404);
          }
          
          userId = targetUser.id;
          userMetadata = targetUser.user_metadata || {};
        } else {
          userId = anonUser.id;
          userMetadata = anonUser.user_metadata || {};
        }
      } else {
        userId = user.id;
        userMetadata = user.user_metadata || {};
      }
    } catch (error) {
      console.error('Error during user validation:', error);
      return c.json({ error: 'Failed to validate user' }, 500);
    }

    console.log('User verified, promoting user:', userId, 'to admin');

    // Update user metadata to include admin flag using service role
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { user_metadata: { ...userMetadata, isAdmin: true } }
    );

    if (error) {
      console.error('Error promoting user to admin:', error);
      return c.json({ error: 'Failed to promote to admin' }, 500);
    }

    console.log('User successfully promoted to admin:', userId);
    return c.json({ success: true, message: 'User promoted to admin', userId });
  } catch (error) {
    console.error('Error in admin promotion:', error);
    return c.json({ error: `Internal server error during admin promotion: ${error.message}` }, 500);
  }
});

// Course creation endpoint
app.post("/make-server-a6119645/courses/create", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);

    if (authError || !user) {
      console.error('Authorization error while creating course:', authError);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if user is admin
    if (!user.user_metadata?.isAdmin) {
      return c.json({ error: 'Forbidden: Admin access required' }, 403);
    }

    const { course } = await c.req.json();

    if (!course) {
      return c.json({ error: 'Course data is required' }, 400);
    }

    console.log('Creating course with ID:', course.id);
    console.log('Course data:', JSON.stringify(course, null, 2));

    // Store course in KV store as JSON string
    const courseKey = `course:${course.id}`;
    await kv.set(courseKey, JSON.stringify(course));
    console.log('Course stored at key:', courseKey);

    // Verify the course was stored correctly
    const storedCourse = await kv.get(courseKey);
    console.log('Verification - course retrieved:', storedCourse ? 'YES' : 'NO');

    // Store in a list of all courses
    const allCoursesKey = 'courses:all';
    const existingCoursesData = await kv.get(allCoursesKey);
    let existingCourses = [];
    
    if (existingCoursesData) {
      try {
        existingCourses = typeof existingCoursesData === 'string' ? JSON.parse(existingCoursesData) : existingCoursesData;
      } catch (e) {
        console.error('Error parsing existing courses list:', e);
        existingCourses = [];
      }
    }
    
    if (!Array.isArray(existingCourses)) {
      existingCourses = [];
    }
    
    console.log('Existing course IDs:', existingCourses);
    
    // Add course ID if not already in the list
    if (!existingCourses.includes(course.id)) {
      existingCourses.push(course.id);
      await kv.set(allCoursesKey, JSON.stringify(existingCourses));
      console.log('Updated course IDs list:', existingCourses);
    }

    return c.json({ success: true, courseId: course.id });
  } catch (error) {
    console.error('Error creating course:', error);
    return c.json({ error: 'Internal server error during course creation' }, 500);
  }
});

// Update course endpoint
app.put("/make-server-a6119645/courses/:courseId", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);

    if (authError || !user) {
      console.error('Authorization error while updating course:', authError);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if user is admin
    if (!user.user_metadata?.isAdmin) {
      return c.json({ error: 'Forbidden: Admin access required' }, 403);
    }

    const courseId = c.req.param('courseId');
    const updatedCourse = await c.req.json();

    console.log('Updating course with ID:', courseId);

    // Ensure the course ID in the body matches the URL parameter
    if (updatedCourse.id !== courseId) {
      return c.json({ error: 'Course ID mismatch' }, 400);
    }

    // Update course in KV store as JSON string
    const courseKey = `course:${courseId}`;
    await kv.set(courseKey, JSON.stringify(updatedCourse));
    console.log('Course updated at key:', courseKey);

    return c.json({ success: true, course: updatedCourse });
  } catch (error) {
    console.error('Error updating course:', error);
    return c.json({ error: 'Internal server error during course update' }, 500);
  }
});

// Delete course endpoint
app.delete("/make-server-a6119645/courses/:courseId", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);

    if (authError || !user) {
      console.error('Authorization error while deleting course:', authError);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if user is admin
    if (!user.user_metadata?.isAdmin) {
      return c.json({ error: 'Forbidden: Admin access required' }, 403);
    }

    const courseId = c.req.param('courseId');
    console.log('Deleting course with ID:', courseId);

    // Delete course from KV store
    const courseKey = `course:${courseId}`;
    await kv.del(courseKey);
    console.log('Course deleted from key:', courseKey);

    // Remove course ID from the list
    const allCoursesKey = 'courses:all';
    const existingCoursesData = await kv.get(allCoursesKey);
    const existingCourses = Array.isArray(existingCoursesData) ? existingCoursesData : [];
    
    const updatedCourses = existingCourses.filter(id => id !== courseId);
    await kv.set(allCoursesKey, updatedCourses);
    console.log('Updated course IDs list after deletion:', updatedCourses);

    return c.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    return c.json({ error: 'Internal server error during course deletion' }, 500);
  }
});

// List all courses endpoint
app.get("/make-server-a6119645/courses/list", async (c) => {
  try {
    console.log('Fetching courses list...');
    
    // Get all course IDs from the courses list
    const allCoursesKey = 'courses:all';
    const courseIdsData = await kv.get(allCoursesKey);
    const courseIds = Array.isArray(courseIdsData) ? courseIdsData : [];
    
    console.log('Course IDs from KV store:', courseIds);
    
    if (courseIds.length === 0) {
      console.log('No custom courses found');
      return c.json({ courses: [] });
    }
    
    // Fetch each course from the KV store
    const courses = [];
    for (const courseId of courseIds) {
      const courseKey = `course:${courseId}`;
      const courseData = await kv.get(courseKey);
      
      if (courseData) {
        // Parse if it's a string, otherwise use as is
        const course = typeof courseData === 'string' ? JSON.parse(courseData) : courseData;
        courses.push(course);
        console.log('Loaded course:', course.id, course.title);
      } else {
        console.log('Course not found for ID:', courseId);
      }
    }
    
    console.log(`Returning ${courses.length} courses`);
    return c.json({ courses });
  } catch (error) {
    console.error('Error listing courses:', error);
    return c.json({ error: 'Internal server error while listing courses' }, 500);
  }
});

Deno.serve(app.fetch);