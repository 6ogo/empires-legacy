
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
        console.log('Starting email confirmation process...'); // Debug log
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error); // Debug log
          throw error;
        }

        if (session?.user) {
          console.log('Session found, updating profile...', session.user); // Debug log
          
          // Update the user's profile to mark email as verified
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              email_verified: true,
              verified: true
            })
            .eq('id', session.user.id);

          if (updateError) {
            console.error('Profile update error:', updateError); // Debug log
            throw updateError;
          }

          toast.success('Email verified successfully!');
          // Use replace to prevent back navigation to callback
          navigate('/game', { replace: true });
        } else {
          console.log('No session found, redirecting to auth...'); // Debug log
          toast.error('Verification failed. Please try again.');
          navigate('/auth', { replace: true });
        }
      } catch (error: any) {
        console.error('Error handling email confirmation:', error);
        toast.error(error.message || 'Verification failed');
        navigate('/auth', { replace: true });
      }
    };

    // Add a small delay to ensure Supabase has time to process the callback
    const timeoutId = setTimeout(() => {
      handleEmailConfirmation();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [navigate]);

  return <LoadingScreen message="Verifying your email..." />;
};

export default Callback;
