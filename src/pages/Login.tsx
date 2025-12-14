import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Library,
  Mail,
  Lock,
  Eye,
  EyeOff,
  BookOpen,
  Users,
  Clock,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ||
    "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      toast("Welcome back!", {
        description: "You have successfully logged in.",
      });
      navigate(from, { replace: true });
    } else {
      toast("Login failed", {
        description: result.error || "Invalid credentials",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-linear-to-r from-gray-900 via-purple-950 to-gray-900">
      {/* Left: Form */}
      <div className="flex flex-1 flex-col justify-center px-8 py-12 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-r from-blue-500 to-purple-600 shadow-lg shadow-blue-500/30">
              <Library className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="font-serif text-3xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Book Forge
              </h1>
              <p className="text-sm text-gray-400">Management System</p>
            </div>
          </div>

          {/* Welcome text */}
          <div className="mb-10">
            <h2 className="font-serif text-4xl font-bold text-white mb-3">
              Welcome back
            </h2>
            <p className="text-gray-400">
              Sign in to access your library dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-gray-300">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@library.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-12 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="text-gray-300">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 pr-12 h-12 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-10 rounded-xl bg-gray-800/30 backdrop-blur-sm border border-gray-700 p-6">
            <p className="text-sm font-medium text-gray-300 mb-3">
              Demo Credentials:
            </p>
            <div className="space-y-2 text-sm">
              <p className="text-gray-400">
                <span className="text-blue-400 font-medium">Admin:</span>{" "}
                admin@library.com / admin123
              </p>
              <p className="text-gray-400">
                <span className="text-purple-400 font-medium">Librarian:</span>{" "}
                librarian@library.com / lib123
              </p>
              <p className="text-gray-400">
                <span className="text-emerald-400 font-medium">Member:</span>{" "}
                member@library.com / member123
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Decorative with image */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
        {/* Background image with overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
          }}
        >
          <div className="absolute inset-0 bg-linear-to-r from-gray-900 via-purple-900/80 to-gray-900" />
        </div>

        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-screen filter blur-3xl animate-pulse" />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-screen filter blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />

        {/* Content overlay */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
          <div className="max-w-lg text-center">
            {/* Icon cards */}
            <div className="flex justify-center gap-8 mb-10">
              <div className="flex flex-col items-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                <BookOpen className="h-10 w-10 text-blue-400 mb-3" />
                <span className="text-white font-medium">10K+ Books</span>
              </div>
              <div className="flex flex-col items-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                <Users className="h-10 w-10 text-purple-400 mb-3" />
                <span className="text-white font-medium">5K+ Members</span>
              </div>
              <div className="flex flex-col items-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                <Clock className="h-10 w-10 text-emerald-400 mb-3" />
                <span className="text-white font-medium">24/7 Access</span>
              </div>
            </div>

            {/* Main text */}
            <h2 className="font-serif text-5xl font-bold text-white mb-6 leading-tight">
              Modern Library <br /> Management System
            </h2>
            <p className="text-lg text-gray-300 mb-10 leading-relaxed">
              Streamline your library operations with our comprehensive
              management system. Track books, manage members, and handle
              transactions effortlessly.
            </p>

            {/* Features list */}
            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="flex items-center gap-3 text-gray-300">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <span>Digital Catalog</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                <span>Member Management</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                <span>Automated Reports</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                <span>Real-time Tracking</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
