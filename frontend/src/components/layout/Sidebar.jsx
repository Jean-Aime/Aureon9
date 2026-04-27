import React from 'react';
import { ChevronRight, LogOut, Globe } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';

export interface SidebarNavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface SidebarProps {
  logo: string;
  logoText: string;
  subtitle: string;
  navItems: SidebarNavItem[];
  activeNavId: string;
  onNavItemClick: (id: string) => void;
  onLogout?: () => void;
  onVisitWebsite?: () => void;
  userCard?: {
    initials: string;
    name: string;
    subtitle: string;
    progressLabel?: string;
    progressValue?: number;
    description?: string;
  };
  statusCard?: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
  };
}

export default function Sidebar({
  logo,
  logoText,
  subtitle,
  navItems,
  activeNavId,
  onNavItemClick,
  onLogout,
  userCard,
  statusCard,
}: SidebarProps) {
  return (
    <aside className="flex flex-col border-r border-slate-200 bg-white px-4 py-5 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0A2540] text-white">
          {typeof logo === 'string' && /\.(png|jpg|jpeg|svg|webp)$/.test(logo) ? (
            <img src={logo} alt="" className="h-7 w-7 object-contain" />
          ) : typeof logo === 'string' ? (
            <span>{logo}</span>
          ) : (
            React.createElement(logo, { className: 'h-5 w-5' })
          )}
        </div>
        <div>
          <h1 className="text-lg font-semibold">{logoText}</h1>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>

      {/* User/Status Card */}
      {userCard && (
        <div className="mb-5 px-2">
          <div className="rounded-2xl bg-gradient-to-br from-[#0A2540] to-[#0F4C81] p-4 text-white shadow-sm">
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11 border border-white/20">
                <AvatarFallback className="bg-white/10 text-white">{userCard.initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{userCard.name}</p>
                <p className="text-xs text-white/75">{userCard.subtitle}</p>
              </div>
            </div>
            {userCard.progressLabel && userCard.progressValue !== undefined && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-white/80">
                  <span>{userCard.progressLabel}</span>
                  <span>{userCard.progressValue}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/15 overflow-hidden">
                  <div
                    className="h-full bg-white/40 rounded-full"
                    style={{ width: `${userCard.progressValue}%` }}
                  />
                </div>
              </div>
            )}
            {userCard.description && (
              <div className="mt-4 rounded-2xl bg-white/10 px-3 py-2 text-xs text-white/85">
                {userCard.description}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation - Scrollable */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.id === activeNavId;
          return (
            <button
              key={item.id}
              onClick={() => onNavItemClick(item.id)}
              className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm transition ${
                active ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Status/Info Card */}
      {statusCard && (
        <>
          <div className="my-5 border-t border-slate-200" />
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
            <div className="flex items-start gap-3">
              {React.createElement(statusCard.icon, { className: 'mt-0.5 h-4 w-4 text-slate-700' })}
              <div>
                <p className="font-medium text-slate-900">{statusCard.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{statusCard.description}</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bottom Action Buttons */}
      <div className="mt-6 border-t border-slate-200 pt-4 space-y-2">
        {onLogout && (
          <Button
            onClick={onLogout}
            variant="outline"
            className="w-full rounded-2xl border-red-200 text-red-600 hover:bg-red-50 justify-start"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        )}
      </div>
    </aside>
  );
}
