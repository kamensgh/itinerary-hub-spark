
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Mail, Plane, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Redirect if already authenticated
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Handle OAuth callback errors
    const handleAuthError = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const errorParam = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');
      
      if (errorParam) {
        setError(errorDescription || 'Authentication failed');
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    handleAuthError();
  }, []);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`
          }
        });
        
        if (error) throw error;
        
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link to complete your registration.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        toast({
          title: "Welcome back!",
          description: "You've been successfully signed in.",
        });
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setError(error.message || "An unexpected error occurred.");
      toast({
        variant: "destructive",
        title: "Authentication error",
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error('Google auth error:', error);
      setError(error.message || "Failed to authenticate with Google.");
      toast({
        variant: "destructive",
        title: "Authentication error",
        description: error.message || "Failed to authenticate with Google.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-sky flex items-center justify-center">
        <div className="text-center">
          <Plane className="h-8 w-8 animate-pulse mx-auto mb-4 text-travel-blue" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-sky flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Plane className="h-8 w-8 text-travel-blue" />
            <h1 className="text-2xl font-bold">TripShare</h1>
          </div>
          <CardTitle className="text-xl">
            {isSignUp ? "Create your account" : "Welcome back"}
          </CardTitle>
          <CardDescription>
            {isSignUp 
              ? "Start planning amazing trips with friends" 
              : "Sign in to continue your travel planning"
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Google Auth Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleAuth}
            disabled={isLoading}
          >
            <Mail className="h-4 w-4 mr-2" />
            {isLoading ? "Connecting..." : "Continue with Google"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Loading..." : (isSignUp ? "Sign up" : "Sign in")}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              disabled={isLoading}
            >
              {isSignUp 
                ? "Already have an account? Sign in" 
                : "Don't have an account? Sign up"
              }
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
