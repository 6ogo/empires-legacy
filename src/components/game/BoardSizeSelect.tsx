
import React from "react";
import { Button } from "../ui/button";

export const BoardSizeSelect: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  return (
    <div className="flex gap-2">
      <Button
        variant={value === "small" ? "default" : "outline"}
        className={value === "small" ? "bg-amber-600 hover:bg-amber-700" : "border-gray-700"}
        onClick={() => onChange("small")}
      >
        Small
      </Button>
      <Button
        variant={value === "medium" ? "default" : "outline"}
        className={value === "medium" ? "bg-amber-600 hover:bg-amber-700" : "border-gray-700"}
        onClick={() => onChange("medium")}
      >
        Medium
      </Button>
      <Button
        variant={value === "large" ? "default" : "outline"}
        className={value === "large" ? "bg-amber-600 hover:bg-amber-700" : "border-gray-700"}
        onClick={() => onChange("large")}
      >
        Large
      </Button>
    </div>
  );
};
