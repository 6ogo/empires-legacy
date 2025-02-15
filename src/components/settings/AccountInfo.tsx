import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@supabase/supabase-js";
import { UserProfile } from "@/types/auth";

interface AccountInfoProps {
  user: User | null;
  profile: UserProfile | null;
}

export const AccountInfo = ({ user, profile }: AccountInfoProps) => {
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not available';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
        <CardDescription>Your current account details</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="flex flex-col gap-1">
            <span className="font-semibold">Email:</span>
            <span>{user?.email || 'Not set'}</span>
          </p>
          <p className="flex flex-col gap-1">
            <span className="font-semibold">Username:</span>
            <span>{user?.user_metadata?.username || 'Not set'}</span>
          </p>
          <p className="flex flex-col gap-1">
            <span className="font-semibold">Account Created:</span>
            <span>{formatDate(user?.created_at)}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
