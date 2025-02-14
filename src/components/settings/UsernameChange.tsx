
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const UsernameChange = () => {
  const [newUsername, setNewUsername] = useState("");
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
          />
        </div>
        <Button onClick={handleUsernameChange} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          Update Username
        </Button>
      </CardContent>
    </Card>
  );
};
