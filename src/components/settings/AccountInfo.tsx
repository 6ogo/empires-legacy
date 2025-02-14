
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@supabase/supabase-js";
import { UserProfile } from "@/hooks/useAuth";

interface AccountInfoProps {
  user: User | null;
  profile: UserProfile | null;
}

export const AccountInfo = ({ user, profile }: AccountInfoProps) => {
  return (
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
  );
};
