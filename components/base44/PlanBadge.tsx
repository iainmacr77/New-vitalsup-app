import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Settings } from "lucide-react";

export default function PlanBadge({ planLabel }: { planLabel: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-500 via-blue-500 to-purple-600"></div>
        <Badge 
          variant="secondary" 
          className="text-xs font-medium px-3 py-1 bg-white/80 backdrop-blur-sm border-gray-200"
        >
          {planLabel} Plan
        </Badge>
      </div>
      <Link href="/dashboard/billing">
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
