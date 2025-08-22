import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Lock, Library } from "lucide-react";

interface LockedCardProps {
  locked?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}

export default function LockedCard(props: LockedCardProps) {
  const { 
    locked = false, 
    icon: Icon = Library, 
    title, 
    description, 
    primaryHref, 
    primaryLabel, 
    secondaryHref, 
    secondaryLabel 
  } = props;
  
  const cardClassName = `relative overflow-hidden rounded-2xl border-2 transition-all duration-300 h-full ${
    locked ? 'opacity-75' : 'hover:shadow-lg'
  } bg-white/80 backdrop-blur-sm group-hover:border-transparent min-h-[360px]`;
  
  const iconClassName = `w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
    locked 
      ? 'bg-gray-100 text-gray-400' 
      : 'bg-gradient-to-br from-gray-50 to-gray-100 text-blue-600'
  }`;
  
  return (
    <div className="group relative h-full">
      <Card className={cardClassName}>
        {/* Gradient border on hover */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-500 via-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" 
             style={{ padding: '2px' }}>
          <div className="w-full h-full bg-white rounded-xl"></div>
        </div>
        
        {locked && (
          <Badge 
            variant="secondary" 
            className="absolute top-4 right-4 bg-gray-100/90 text-gray-600 text-xs px-2 py-1"
          >
            <Lock className="w-3 h-3 mr-1" />
            Locked
          </Badge>
        )}
        
        <CardContent className="p-6 md:p-7 h-full flex flex-col">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className={iconClassName}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 leading-relaxed">
              {description}
            </p>
          </div>
          
          <div className="mt-6 space-y-3">
            <Link 
              href={locked ? `/dashboard/profile` : primaryHref}
              className="block"
            >
              <Button 
                variant={locked ? "default" : "brand"}
                className="w-full font-medium"
              >
                {locked ? `Unlock ${title}` : primaryLabel}
              </Button>
            </Link>
            
            {secondaryHref && secondaryLabel && !locked && (
              <Link 
                href={secondaryHref}
                className="block"
              >
                <Button 
                  variant="ghost" 
                  className="w-full text-gray-600 hover:text-gray-900 text-sm"
                >
                  {secondaryLabel}
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
