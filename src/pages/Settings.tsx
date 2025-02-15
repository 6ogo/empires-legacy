
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

const Settings = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    if (signOut) {
      await signOut();
      toast.success("Signed out successfully");
    }
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
        <AccountInfo user={user} profile={profile} />
        <UsernameChange />
        <EmailChange />
        <PasswordChange />

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
