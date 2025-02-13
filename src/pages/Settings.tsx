
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { differenceInDays } from "date-fns";

const Settings = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const canChangeUsername = !profile?.last_username_change || 
    differenceInDays(new Date(), new Date(profile.last_username_change)) >= 7;

  const handleUsernameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canChangeUsername) {
      toast.error("You can only change your username once every 7 days.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          username: newUsername,
          last_username_change: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (error) throw error;
      toast.success("Username updated successfully!");
      setNewUsername("");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      toast.success("Email update confirmation sent to your new email address!");
      setNewEmail("");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Manage your account settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleUsernameChange} className="space-y-4">
              <div>
                <Label htmlFor="username">Change Username</Label>
                <p className="text-sm text-gray-500 mb-2">
                  {canChangeUsername 
                    ? "You can change your username"
                    : `You can change your username again in ${
                        7 - differenceInDays(new Date(), new Date(profile?.last_username_change || ""))
                      } days`
                  }
                </p>
                <Input
                  id="username"
                  type="text"
                  placeholder="New username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  disabled={!canChangeUsername || loading}
                />
              </div>
              <Button type="submit" disabled={!canChangeUsername || loading}>
                Update Username
              </Button>
            </form>

            <form onSubmit={handleEmailChange} className="space-y-4">
              <div>
                <Label htmlFor="email">Change Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="New email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button type="submit" disabled={loading}>
                Update Email
              </Button>
            </form>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <Label htmlFor="new-password">Change Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button type="submit" disabled={loading}>
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
