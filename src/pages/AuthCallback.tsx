
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { refreshSession } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Processing auth callback...');
        
        // Get the session and check if it's valid
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }

        if (!session?.user) {
          console.error('No session in callback');
          throw new Error('Authentication failed');
        }

        // Refresh the auth context
        await refreshSession();
        
        console.log('Auth callback successful');
        toast.success('Successfully authenticated!');
        navigate('/game', { replace: true });
      } catch (error: any) {
        console.error('Callback error:', error);
        toast.error(error.message || 'Authentication failed');
        navigate('/auth', { replace: true });
      }
    };

    handleCallback();
  }, [navigate, refreshSession]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <Loader2 className="w-8 h-8 animate-spin mb-4" />
      <p className="text-lg">Completing authentication...</p>
    </div>
  );
};

export default AuthCallback;
