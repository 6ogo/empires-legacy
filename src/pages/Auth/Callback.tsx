
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

    handleEmailConfirmation();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
      <div className="text-white text-lg animate-pulse">Verifying your email...</div>
    </div>
  );
};

export default Callback;
