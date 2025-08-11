import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function LockedCard({
  locked = false,
  icon: Icon,
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      whileHover={{ 
        y: -2, 
        transition: { duration: 0.15 } 
      }}
      className="group relative"
    >
      <Card className={`
        relative overflow-hidden rounded-2xl border-2 transition-all duration-300 
        ${locked ? 'opacity-75' : 'hover:shadow-lg'}
        bg-white/80 backdrop-blur-sm
        group-hover:border-transparent
      `}>
        {/* Gradient border on hover */}
        <div className="absolute inset-0 rounded-2xl brand-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" 
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
        
        <CardContent className="p-6 md:p-7">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center transition-colors
                ${locked 
                  ? 'bg-gray-100 text-gray-400' 
                  : 'bg-gradient-to-br from-gray-50 to-gray-100 text-brand'
                }
              `}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 leading-relaxed">
              {description}
            </p>
            
            <div className="space-y-3 pt-2">
              <Link 
                to={locked ? createPageUrl(`upgrade?feature=${primaryHref.split('=')[1]}`) : createPageUrl(primaryHref.replace('/', ''))}
                className="block"
              >
                <Button 
                  className={`
                    w-full font-medium transition-all duration-200
                    ${locked 
                      ? 'bg-gray-900 hover:bg-gray-800 text-white' 
                      : 'brand-gradient text-white hover:opacity-90 hover:shadow-md'
                    }
                  `}
                >
                  {locked ? `Unlock ${title}` : primaryLabel}
                </Button>
              </Link>
              
              {secondaryHref && secondaryLabel && !locked && (
                <Link 
                  to={createPageUrl(secondaryHref.replace('/', ''))} 
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
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
