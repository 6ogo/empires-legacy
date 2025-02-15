
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Starting callback handler...');
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }

        if (session) {
          console.log('Session found:', session.user.email);
          
          // Update user profile
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ 
              last_login: new Date().toISOString(),
              email_verified: true,
              verified: true
            })
            .eq('id', session.user.id);

          if (profileError) {
            console.error('Error updating profile:', profileError);
            throw profileError;
          }

          toast.success('Successfully authenticated!');
          navigate('/game', { replace: true });
        } else {
          console.log('No session found in callback');
          throw new Error('Authentication failed. Please try again.');
        }
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err.message || 'Authentication failed');
        toast.error(err.message || 'Authentication failed');
        setTimeout(() => {
          navigate('/auth', { replace: true });
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <p className="text-lg text-destructive mb-4">{error}</p>
        <p className="text-sm text-muted-foreground">Redirecting to login page...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <Loader2 className="h-8 w-8 animate-spin mb-4" />
      <p className="text-lg text-foreground">Authenticating...</p>
    </div>
  );
};

export default AuthCallback;
