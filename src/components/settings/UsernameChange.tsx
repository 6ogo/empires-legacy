import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export const UsernameChange = () => {
  const [newUsername, setNewUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, refreshProfile } = useAuth();

  const handleUsernameChange = async () => {
    if (!newUsername.trim()) {
      toast.error("Please enter a new username");
      return;
    }

    // Validate username format
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(newUsername)) {
      toast.error("Username must be 3-20 characters and contain only letters, numbers, and underscores");
      return;
    }

    setLoading(true);
    try {
      // First check if username is already taken
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('username', newUsername);

      if (countError) throw countError;

      if (count && count > 0) {
        toast.error('Username is already taken');
        setLoading(false);
        return;
      }

      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { username: newUsername }
      });

      if (authError) throw authError;

      // Update profile with new username and timestamp
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          username: newUsername,
          last_username_change: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      // Refresh the profile to update UI
      if (refreshProfile) {
        await refreshProfile();
      }

      toast.success("Username updated successfully");
      setNewUsername("");
    } catch (error: any) {
      console.error('Error updating username:', error);
      toast.error(error.message || "Failed to update username");
    } finally {
      setLoading(false);
    }
  };

  return (
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
            className="bg-white/10"
          />
          <p className="text-xs text-muted-foreground">
            Username must be 3-20 characters and contain only letters, numbers, and underscores.
            You can change your username once every 7 days.
          </p>
        </div>
        <Button onClick={handleUsernameChange} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Updating..." : "Update Username"}
        </Button>
      </CardContent>
    </Card>
  );
};