import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { AccountInfo } from "@/components/settings/AccountInfo";
import { UsernameChange } from "@/components/settings/UsernameChange";
import { EmailChange } from "@/components/settings/EmailChange";
import { PasswordChange } from "@/components/settings/PasswordChange";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const Settings = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [lastUsernameChange, setLastUsernameChange] = useState<Date | null>(null);
  const [canChangeUsername, setCanChangeUsername] = useState(true);
  const [daysUntilNextChange, setDaysUntilNextChange] = useState(0);

  useEffect(() => {
    const checkUsernameChangeEligibility = async () => {
      if (!user) return;

      try {
        // Fetch the user's profile to get the last username change date
        const { data, error } = await supabase
          .from('profiles')
          .select('last_username_change')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data && data.last_username_change) {
          const lastChange = new Date(data.last_username_change);
          setLastUsernameChange(lastChange);
          
          // Calculate if 7 days have passed since last change
          const now = new Date();
          const timeDiff = now.getTime() - lastChange.getTime();
          const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
          
          if (daysDiff < 7) {
            setCanChangeUsername(false);
            setDaysUntilNextChange(7 - daysDiff);
          } else {
            setCanChangeUsername(true);
          }
        } else {
          // No previous username change
          setCanChangeUsername(true);
        }
      } catch (error) {
        console.error('Error checking username change eligibility:', error);
        toast.error('Could not check username change eligibility');
      }
    };

    checkUsernameChangeEligibility();
  }, [user]);

  const handleSignOut = async () => {
    if (signOut) {
      await signOut();
    }
  };

  const handleProfileUpdate = async () => {
    if (refreshProfile) {
      await refreshProfile();
      toast.success('Profile updated successfully');
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(-1)}
          className="bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold text-game-gold">Settings</h1>
      </div>
      
      <div className="grid gap-6 max-w-3xl mx-auto">
        <AccountInfo user={user} profile={profile} />
        
        {!canChangeUsername ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Username Change Limit
              </CardTitle>
              <CardDescription>
                You can change your username once every 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-yellow-500/20 text-yellow-200 rounded-md">
                <p>You changed your username recently. You can change it again in {daysUntilNextChange} days.</p>
                {lastUsernameChange && (
                  <p className="text-sm mt-2">Last changed on: {lastUsernameChange.toLocaleDateString()}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <UsernameChange />
        )}
        
        <EmailChange />
        <PasswordChange />

        <Separator className="my-4" />
        
        <div className="flex justify-between items-center">
          <Button 
            variant="destructive" 
            onClick={handleSignOut}
            className="w-auto"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
          
          <Button
            variant="outline"
            onClick={handleProfileUpdate}
            className="w-auto"
          >
            Refresh Profile
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;