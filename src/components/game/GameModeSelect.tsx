
import React from "react";
import { Button } from "../ui/button";
import { Users, Globe } from "lucide-react";

export const GameModeSelect: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  return (
    <div className="flex gap-2">
      <Button
        variant={value === "local" ? "default" : "outline"}
        className={`flex-1 ${value === "local" ? "bg-amber-600 hover:bg-amber-700" : "border-gray-700"}`}
        onClick={() => onChange("local")}
      >
        <Users className="w-4 h-4 mr-2" />
        Local
      </Button>
      <Button
        variant={value === "online" ? "default" : "outline"}
        className={`flex-1 ${value === "online" ? "bg-amber-600 hover:bg-amber-700" : "border-gray-700"}`}
        onClick={() => onChange("online")}
        disabled={true} // Disabled for this branch
      >
        <Globe className="w-4 h-4 mr-2" />
        Online
        <span className="ml-2 text-xs bg-gray-700 px-2 py-1 rounded">Disabled</span>
      </Button>
    </div>
  );
};
