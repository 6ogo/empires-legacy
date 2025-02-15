// src/pages/AuthCallback.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (session) {
          // Update user profile if needed
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ 
              last_login: new Date().toISOString(),
            })
            .eq('id', session.user.id);

          if (profileError) {
            console.error('Error updating profile:', profileError);
          }

          navigate('/game', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err.message || 'Authentication failed');
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <p className="text-lg text-destructive mb-4">{error}</p>
        <p className="text-sm text-muted-foreground">Redirecting to home page...</p>
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
