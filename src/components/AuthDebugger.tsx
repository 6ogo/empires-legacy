import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const AuthDebugger = () => {
  const { user, profile, isLoading, refreshProfile, refreshSession } = useAuth();

  useEffect(() => {
    // Log state changes
    console.log('Auth Debugger State:', {
      hasUser: !!user,
      hasProfile: !!profile,
      isLoading,
      userId: user?.id,
      profileId: profile?.id
    });
  }, [user, profile, isLoading]);

  const handleRefresh = async () => {
    try {
      await refreshSession();
      await refreshProfile();
      toast.success('Auth state refreshed');
    } catch (error) {
      console.error('Refresh error:', error);
      toast.error('Failed to refresh auth state');
    }
  };

  const renderStatus = () => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading auth state...</span>
        </div>
      );
    }

    if (!user) {
      return (
        <div className="flex items-center gap-2 text-yellow-400">
          <AlertTriangle className="h-4 w-4" />
          <span>No user authenticated</span>
        </div>
      );
    }

    if (!profile) {
      return (
        <div className="flex items-center gap-2 text-red-400">
          <AlertTriangle className="h-4 w-4" />
          <span>User authenticated but no profile found</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 text-green-400">
        <CheckCircle className="h-4 w-4" />
        <span>Fully authenticated with profile</span>
      </div>
    );
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold text-white">Auth State</div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          Refresh State
        </Button>
      </div>
      
      <div className="space-y-2">
        {renderStatus()}
        
        {user && (
          <div className="text-sm text-gray-300">
            <div>User ID: {user.id}</div>
            <div>Email: {user.email}</div>
          </div>
        )}
        
        {profile && (
          <div className="text-sm text-gray-300">
            <div>Profile ID: {profile.id}</div>
            <div>Username: {profile.username}</div>
            <div>Verified: {profile.verified ? 'Yes' : 'No'}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthDebugger;