import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, Save, Lock, Mail, User, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUsernameChange = async () => {
    if (!newUsername.trim()) {
      toast.error("Please enter a new username");
      return;
    }

    setLoading(true);
    try {
      const { error: userUpdateError } = await supabase.auth.updateUser({
        data: { username: newUsername }
      });

      if (userUpdateError) throw userUpdateError;

      toast.success("Username updated successfully");
      setNewUsername("");
    } catch (error: any) {
      toast.error(error.message || "Failed to update username");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = async () => {
    if (!newEmail.trim() || !currentPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail,
        password: currentPassword
      });

      if (error) throw error;
      toast.success("Email update initiated. Please check your inbox for confirmation.");
      setNewEmail("");
      setCurrentPassword("");
    } catch (error: any) {
      toast.error(error.message || "Failed to update email");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="h-10 w-10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>
      
      <div className="grid gap-6">
        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your current account details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Username:</strong> {user?.user_metadata?.username || 'Not set'}</p>
              <p><strong>Account Created:</strong> {new Date(profile?.created_at || '').toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Username Change */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Change Username
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newUsername">New Username</Label>
              <Input
                id="newUsername"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter new username"
              />
            </div>
            <Button onClick={handleUsernameChange} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              Update Username
            </Button>
          </CardContent>
        </Card>

        {/* Email Change */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Change Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newEmail">New Email</Label>
              <Input
                id="newEmail"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter new email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentPasswordEmail">Current Password</Label>
              <Input
                id="currentPasswordEmail"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Verify current password"
              />
            </div>
            <Button onClick={handleEmailChange} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              Update Email
            </Button>
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
            <Button onClick={handlePasswordChange} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              Update Password
            </Button>
          </CardContent>
        </Card>

        {/* Sign Out */}
        <Separator className="my-6" />
        <div>
          <Button 
            variant="destructive" 
            onClick={handleSignOut}
            className="w-full sm:w-auto"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
