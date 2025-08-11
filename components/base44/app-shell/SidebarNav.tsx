import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LayoutDashboard, 
  User, 
  Settings, 
  Mail, 
  FileText, 
  History, 
  Beaker,
  Users, 
  Stethoscope,
  Lock,
  X
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  '/dashboard': LayoutDashboard,
  '/dashboard/profile': User,
  '/dashboard/template': Settings,
  '/dashboard/email-settings': Mail,
  '/dashboard/articles': FileText,
  '/dashboard/history': History,
  '/dashboard/content-lab': Beaker,
  '/dashboard/users': Users,
  '/dashboard/triage': Stethoscope,
};

interface SidebarNavProps {
  nav: Array<{ label: string; href: string; locked?: boolean; badge?: string }>;
  currentRoute: string;
  isCollapsed: boolean;
  onToggleSidebar: () => void;
  className?: string;
}

export default function SidebarNav({ 
  nav, 
  currentRoute, 
  isCollapsed, 
  onToggleSidebar,
  className 
}: SidebarNavProps) {
  const pathname = usePathname();
  
  const isActive = (href: string) => {
    return pathname === href || currentRoute === href;
  };

  const getIcon = (href: string) => {
    const IconComponent = ICON_MAP[href];
    return IconComponent ? <IconComponent className="h-5 w-5" /> : <FileText className="h-5 w-5" />;
  };

  return (
    <>
      <style jsx>{`
        :root {
          --brand-start: #FF2A8A;
          --brand-end: #3663FF;
          --brand: #7A54F6;
        }
        .brand-gradient {
          background-image: linear-gradient(135deg, var(--brand-start), var(--brand-end));
        }
      `}</style>

      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={onToggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-50 h-full w-72 bg-white/95 backdrop-blur-xl border-r border-gray-100
          md:relative md:translate-x-0 md:z-auto
          transition-transform duration-200 ease-in-out
          ${isCollapsed ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}
          ${className}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl brand-gradient flex items-center justify-center shadow-sm">
              <div className="w-5 h-5 bg-white rounded-lg opacity-90"></div>
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-lg">VitalsUp</h2>
              <p className="text-xs text-gray-500">Medical Content Hub</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden hover:bg-gray-100/60"
            onClick={onToggleSidebar}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-4 py-6">
          <nav className="space-y-2">
            {nav.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block"
                  onClick={() => window.innerWidth < 768 && onToggleSidebar()}
                >
                  <div className="group">
                    <Button
                      variant={active ? "secondary" : "ghost"}
                      className={`
                        w-full justify-start gap-3 h-11 px-4 transition-all duration-200
                        ${active 
                          ? 'bg-gradient-to-r from-purple-50 to-blue-50 text-brand border border-purple-100 shadow-sm' 
                          : 'hover:bg-gray-50/80 text-gray-700 hover:text-gray-900'
                        }
                      `}
                      aria-current={active ? 'page' : undefined}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {getIcon(item.href)}
                        <span className="font-medium text-sm">{item.label}</span>
                      </div>
                      
                      {item.locked && (
                        <Lock className="h-3 w-3 text-gray-400" />
                      )}
                      
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs px-2 py-0.5">
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  </div>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-100/60">
          <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-900">Current Newsletter</h4>
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                Active
              </Badge>
            </div>
            <p className="text-xs text-gray-600">
              Sending weekly on Mondays
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
