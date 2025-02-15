
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import LoadingScreen from '@/components/game/LoadingScreen';

const Callback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        console.log('Starting callback handler...'); // Debug log
        
        // Get the session directly from the URL if present
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError); // Debug log
          throw sessionError;
        }

        if (session?.user) {
          console.log('Session found:', session.user.email); // Debug log
          
          // Update the user's profile to mark email as verified
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              email_verified: true,
              verified: true,
              last_login: new Date().toISOString()
            })
            .eq('id', session.user.id);

          if (updateError) {
            console.error('Profile update error:', updateError); // Debug log
            throw updateError;
          }

          // Set the session explicitly
          await supabase.auth.setSession(session);

          toast.success('Email verified successfully!');
          // Use replace to prevent back navigation to callback
          navigate('/game', { replace: true });
        } else {
          console.log('No session found in callback'); // Debug log
          toast.error('Verification failed. Please try again.');
          navigate('/auth', { replace: true });
        }
      } catch (error: any) {
        console.error('Error in callback handler:', error);
        toast.error(error.message || 'Verification failed');
        navigate('/auth', { replace: true });
      }
    };

    // Add a small delay to ensure Supabase has time to process the URL
    const timeoutId = setTimeout(() => {
      handleEmailConfirmation();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [navigate]);

  return <LoadingScreen message="Verifying your email..." />;
};

export default Callback;
