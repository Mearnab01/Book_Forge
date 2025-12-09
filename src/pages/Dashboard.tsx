import { 
  BookOpen, 
  Users, 
  BookCheck, 
  AlertTriangle, 
  CalendarClock,
  TrendingUp,
  ArrowRight,
  BookPlus,
  UserPlus
} from 'lucide-react';

import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
/* import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge'; */
import { useAuth } from '@/contexts/AuthContext';
import { mockDashboardStats, mockRecentActivity } from '@/data/MockData';

// FIXED — clean Tailwind colors
const activityColors: Record<string, string> = {
  ISSUE: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  RETURN: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  NEW_MEMBER: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  RESERVATION: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  OVERDUE: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

const localTime = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleString();
};

export default function Dashboard() {
  const { user, hasRole } = useAuth();
  const isStaff = hasRole(['ADMIN', 'LIBRARIAN']);

  return (
    <MainLayout title="Dashboard">
      <div className="animate-fade-in space-y-8">

        {/* Welcome Section */}
        <div className="rounded-xl bg-gradient-hero p-6 text-white">
          <h2 className="font-serif text-2xl font-bold">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}!
          </h2>
          <p className="mt-1 text-white/80">
            Here's what's happening in your library today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Books"
            value={mockDashboardStats.totalBooks.toLocaleString()}
            icon={BookOpen}
            description={`${mockDashboardStats.availableBooks.toLocaleString()} available`}
            variant="primary"
          />

          {isStaff && (
            <StatCard
              title="Total Members"
              value={mockDashboardStats.totalMembers.toLocaleString()}
              icon={Users}
              trend={{ value: 12, isPositive: true }}
              variant="accent"
            />
          )}

          <StatCard
            title="Active Loans"
            value={mockDashboardStats.activeLoans.toLocaleString()}
            icon={BookCheck}
            description={`${mockDashboardStats.todayIssues} issued today`}
            variant="success"
          />

          <StatCard
            title="Overdue"
            value={mockDashboardStats.overdueLoans}
            icon={AlertTriangle}
            description="Requires attention"
            variant="warning"
          />
        </div>

        {/* Quick Actions + Activity */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Quick Actions */}
          {isStaff && (
            <div className="lg:col-span-1 rounded-xl border-2 border-gray-800 bg-linear-to-br from-gray-900 to-gray-800 p-6">

              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-purple-500">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <h2 className="font-serif text-xl font-bold text-white">Quick Actions</h2>
              </div>

              <div className="space-y-3">

                {/* Issue Book */}
                <button className="group flex w-full items-center justify-between rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 hover:border-blue-500">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-900/30 group-hover:bg-blue-500">
                      <BookPlus className="h-4 w-4 text-blue-300 group-hover:text-white" />
                    </div>
                    <span className="font-medium text-gray-300 group-hover:text-white">
                      Issue Book
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Return Book */}
                <button className="group flex w-full items-center justify-between rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 hover:border-emerald-500">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-900/30 group-hover:bg-emerald-500">
                      <BookCheck className="h-4 w-4 text-emerald-300 group-hover:text-white" />
                    </div>
                    <span className="font-medium text-gray-300 group-hover:text-white">
                      Return Book
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Add New Book */}
                <button className="group flex w-full items-center justify-between rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 hover:border-purple-500">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-900/30 group-hover:bg-purple-500">
                      <BookOpen className="h-4 w-4 text-purple-300 group-hover:text-white" />
                    </div>
                    <span className="font-medium text-gray-300 group-hover:text-white">
                      Add New Book
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Register Member */}
                <button className="group flex w-full items-center justify-between rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 hover:border-amber-500">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-900/30 group-hover:bg-amber-500">
                      <UserPlus className="h-4 w-4 text-amber-300 group-hover:text-white" />
                    </div>
                    <span className="font-medium text-gray-300 group-hover:text-white">
                      Register Member
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-transform" />
                </button>

              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className={`rounded-xl border-2 border-gray-800 bg-linear-to-br from-gray-900 to-gray-800 p-6 ${isStaff ? "lg:col-span-2" : "lg:col-span-3"}`}>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-purple-500 to-pink-500">
                <CalendarClock className="h-5 w-5 text-white" />
              </div>
              <h2 className="font-serif text-xl font-bold text-white">Recent Activity</h2>
            </div>

            <div className="space-y-4">
              {mockRecentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="group flex items-center gap-4 rounded-lg border border-gray-800 bg-gray-900/30 p-4 hover:bg-gray-800/50 hover:border-gray-700 transition-all"
                >
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${activityColors[activity.type]}`}>
                    {activity.type.replace('_', ' ')}
                  </span>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300 truncate group-hover:text-white">
                      {activity.description}
                    </p>
                  </div>

                  <span className="text-xs text-gray-500 whitespace-nowrap group-hover:text-gray-400">
                    {localTime(activity.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pending Reservations */}
        {isStaff && mockDashboardStats.pendingReservations > 0 && (
          <div className="relative overflow-hidden rounded-xl border-2 border-amber-800 bg-linear-to-r from-amber-900/20 via-amber-900/10 to-amber-900/20 p-6">

            <div className="absolute -inset-0.5 bg-linear-to-r from-amber-500 to-orange-500 opacity-10 blur"></div>

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl"></div>
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-amber-500 to-orange-500">
                    <CalendarClock className="h-6 w-6 text-white" />
                  </div>
                </div>

                <div>
                  <p className="font-bold text-xl text-white">
                    {mockDashboardStats.pendingReservations} Pending Reservations
                  </p>
                  <p className="text-sm text-amber-200/80">
                    Review and fulfill waiting reservations
                  </p>
                </div>
              </div>

              <button className="rounded-lg bg-linear-to-r from-amber-600 to-orange-600 px-6 py-2.5 font-medium text-white shadow-lg hover:scale-105 transition-all">
                View All
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
