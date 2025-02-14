
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Callback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (session?.user) {
          // Update the user's profile to mark email as verified
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              email_verified: true,
              verified: true
            })
            .eq('id', session.user.id);

          if (updateError) throw updateError;

          toast.success('Email verified successfully!');
          navigate('/game');
        } else {
          toast.error('Verification failed. Please try again.');
          navigate('/auth');
        }
      } catch (error: any) {
        console.error('Error handling email confirmation:', error);
        toast.error(error.message);
        navigate('/auth');
      }
    };

    handleEmailConfirmation();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
      <div className="text-white text-lg">Verifying your email...</div>
    </div>
  );
};

export default Callback;
