import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Settings } from "lucide-react";

export default function PlanBadge({ planLabel }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full brand-gradient"></div>
        <Badge 
          variant="secondary" 
          className="text-xs font-medium px-3 py-1 bg-white/80 backdrop-blur-sm border-gray-200"
        >
          {planLabel} Plan
        </Badge>
      </div>
      <Link to={createPageUrl("billing")}>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs text-gray-600 hover:text-gray-900 h-7 px-2"
        >
          <Settings className="w-3 h-3 mr-1" />
          Manage plan
        </Button>
      </Link>
    </div>
  );
}
