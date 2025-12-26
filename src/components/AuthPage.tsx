import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner@2.0.3';
import { GraduationCap, Loader2 } from 'lucide-react';
import { loginUser, signupUser, AuthUser } from '../utils/auth';
import { motion } from 'framer-motion';

interface AuthPageProps {
  onLogin: (user: AuthUser) => void;
}

export function AuthPage({ onLogin }: AuthPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await loginUser(loginData.email, loginData.password);
      toast.success('Login successful!');
      onLogin(user);
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (signupData.password !== signupData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (signupData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const user = await signupUser(signupData.name, signupData.email, signupData.password);
      toast.success('Account created successfully!');
      onLogin(user);
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error instanceof Error ? error.message : 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div 
        className="w-full max-w-md"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <motion.div 
            className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          >
            <GraduationCap className="w-8 h-8 text-white" />
          </motion.div>
          <motion.h1 
            className="text-gray-900 mb-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Medical E-Learning Platform
          </motion.h1>
          <motion.p 
            className="text-gray-600"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Professional medical education and training
          </motion.p>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Welcome Back</CardTitle>
                    <CardDescription>
                      Enter your credentials to access your courses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                        <p className="text-sm text-blue-900">
                          <strong>New user?</strong> Please create an account using the Sign Up tab first.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="doctor@hospital.com"
                          value={loginData.email}
                          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                          required
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Password</Label>
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="••••••••"
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          required
                          disabled={isLoading}
                        />
                      </div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Logging in...
                            </>
                          ) : (
                            'Login'
                          )}
                        </Button>
                      </motion.div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="signup">
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Create Account</CardTitle>
                    <CardDescription>
                      Sign up to start your medical education journey
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name">Full Name</Label>
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Dr. Jane Smith"
                          value={signupData.name}
                          onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                          required
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="doctor@hospital.com"
                          value={signupData.email}
                          onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                          required
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="••••••••"
                          value={signupData.password}
                          onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                          required
                          disabled={isLoading}
                          minLength={6}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                        <Input
                          id="signup-confirm-password"
                          type="password"
                          placeholder="••••••••"
                          value={signupData.confirmPassword}
                          onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                          required
                          disabled={isLoading}
                          minLength={6}
                        />
                      </div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating account...
                            </>
                          ) : (
                            'Sign Up'
                          )}
                        </Button>
                      </motion.div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>

        <motion.p 
          className="text-center text-gray-500 mt-6 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          By continuing, you agree to our Terms of Service and Privacy Policy
        </motion.p>
      </motion.div>
    </div>
  );
}