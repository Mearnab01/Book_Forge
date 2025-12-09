import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function MainLayout({ children, title }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-[conic-gradient(from_90deg_at_50%_50%,#0ea5e9,#8b5cf6,#0ea5e9,#8b5cf6,#0ea5e9)] animate-pulse-slow">
      <div className="absolute inset-0 bg-black/80" />
      <Sidebar />
      <div className={cn("ml-64 transition-all duration-300 relative")}>
        <Navbar title={title} />
        <main className="p-6 lg:p-8 bg-gray-900/60 backdrop-blur-2xl border border-white/10 rounded-xl m-4">
          {children}
        </main>
      </div>
    </div>
  );
}