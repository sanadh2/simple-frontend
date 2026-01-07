'use client';

import { useState } from 'react';
import { useLogout, useLogoutAll } from '@/hooks/useAuth';
import { User } from '@/lib/api';
import LogoutModal from '@/components/LogoutModal';
import { Button } from '@/components/ui/button';
import { 
  LogOut, 
  CheckCircle2, 
  UserCircle, 
  Settings, 
  Shield, 
  HelpCircle,
  BadgeCheck,
  Clock,
  FileText
} from 'lucide-react';
import Link from 'next/link';

interface UserProfileProps {
  user: User;
}

export default function UserProfile({ user }: UserProfileProps) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const { mutate: logoutAll, isPending: isLoggingOutAll } = useLogoutAll();

  const handleLogout = () => {
    logout();
  };

  const handleLogoutAll = () => {
    logoutAll();
  };

  const isLoading = isLoggingOut || isLoggingOutAll;

  return (
    <div className="w-full space-y-6">
      <div className="relative overflow-hidden bg-white dark:bg-zinc-900 rounded-2xl shadow-xl">
        <div className="absolute inset-0 bg-linear-to-br from-blue-500 via-purple-500 to-pink-500 opacity-10"></div>
        
        <div className="relative p-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-br from-blue-600 to-purple-600 text-white text-2xl font-bold shadow-lg">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </div>
              
              <div>
                <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  {user.email}
                </p>
                {user.isEmailVerified ? (
                  <span className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    <BadgeCheck className="w-3 h-3 mr-1" />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                    <Clock className="w-3 h-3 mr-1" />
                    Unverified
                  </span>
                )}
              </div>
            </div>

            <Button
              onClick={() => setShowLogoutModal(true)}
              variant="destructive"
              className="hover:scale-105 transition-transform"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center">
            <UserCircle className="w-5 h-5 mr-2 text-blue-600" />
            Account Details
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">User ID</span>
              <span className="text-xs font-mono text-zinc-900 dark:text-white bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded">
                {user.id.slice(0, 8)}...
              </span>
            </div>
            
            {user.createdAt && (
              <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Member since</span>
                <span className="text-sm text-zinc-900 dark:text-white">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
            )}
            
            {user.updatedAt && (
              <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Last updated</span>
                <span className="text-sm text-zinc-900 dark:text-white">
                  {new Date(user.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center">
            <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" />
            Connection Status
          </h3>
          
          <div className="space-y-3">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center">
                <div className="shrink-0">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800 dark:text-green-400">
                    Connected to server
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                    Authentication active
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-400">
                    Secure session
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                    Protected with JWT tokens
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="flex flex-col items-center justify-center h-auto p-4">
            <UserCircle className="w-6 h-6 text-zinc-600 dark:text-zinc-400 mb-2" />
            <span className="text-xs font-medium">Edit Profile</span>
          </Button>
          
          <Button variant="outline" className="flex flex-col items-center justify-center h-auto p-4">
            <Settings className="w-6 h-6 text-zinc-600 dark:text-zinc-400 mb-2" />
            <span className="text-xs font-medium">Settings</span>
          </Button>
          
          <Link href="/logs" className="w-full">
            <Button variant="outline" className="w-full flex flex-col items-center justify-center h-auto p-4">
              <FileText className="w-6 h-6 text-zinc-600 dark:text-zinc-400 mb-2" />
              <span className="text-xs font-medium">Logs</span>
            </Button>
          </Link>
          
          <Button variant="outline" className="flex flex-col items-center justify-center h-auto p-4">
            <HelpCircle className="w-6 h-6 text-zinc-600 dark:text-zinc-400 mb-2" />
            <span className="text-xs font-medium">Help</span>
          </Button>
        </div>
      </div>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onLogout={handleLogout}
        onLogoutAll={handleLogoutAll}
        isLoading={isLoading}
      />
    </div>
  );
}
