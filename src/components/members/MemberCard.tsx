import { User, Mail, Phone, BookOpen, Edit } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Member } from '@/types';
import { cn } from '@/lib/utils';

interface MemberCardProps {
  member: Member;
  onView?: (member: Member) => void;
  onEdit?: (member: Member) => void;
  onViewLoans?: (member: Member) => void;
}

const statusColors = {
  ACTIVE: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  SUSPENDED: 'bg-red-500/20 text-red-300 border border-red-500/30',
  EXPIRED: 'bg-gray-500/20 text-gray-300 border border-gray-500/30',
};

const membershipColors = {
  STANDARD: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  PREMIUM: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
  STUDENT: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
};

export function MemberCard({ member, onView, onEdit, onViewLoans }: MemberCardProps) {
  const initials = member.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <Card className="overflow-hidden rounded-xl border border-gray-800 bg-linear-to-br from-gray-900 to-gray-800 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-900/20">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Avatar with gradient border */}
          <div className="relative">
            <div className="absolute -inset-0.5 bg-linear-to-r from-blue-500 to-purple-500 rounded-full opacity-70 blur"></div>
            <Avatar className="relative h-16 w-16 ring-2 ring-gray-900">
              <AvatarFallback className="bg-linear-to-br from-blue-600 to-purple-600 text-white text-lg font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-white text-lg truncate">
                  {member.name}
                </h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge className={cn("text-xs font-medium", statusColors[member.status])}>
                    {member.status}
                  </Badge>
                  <Badge className={cn("text-xs font-medium", membershipColors[member.membershipType])}>
                    {member.membershipType}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300 truncate">{member.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300">{member.phone}</span>
              </div>
            </div>

            {/* Borrowing Stats */}
            <div className="mt-4 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-3 py-2">
                <BookOpen className="h-4 w-4 text-blue-400" />
                <div>
                  <span className="font-bold text-white text-lg">{member.currentBorrowed}</span>
                  <span className="text-gray-400 mx-1">/</span>
                  <span className="text-gray-400">{member.maxBooksAllowed}</span>
                </div>
                <span className="text-xs text-gray-400 ml-2">Books</span>
              </div>
              <span className="text-xs text-gray-500">
                Since {new Date(member.membershipDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 border-t border-gray-800 bg-gray-900/50 p-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-600"
          onClick={() => onView?.(member)}
        >
          <User className="mr-2 h-3.5 w-3.5" />
          View
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-600"
          onClick={() => onViewLoans?.(member)}
        >
          <BookOpen className="mr-2 h-3.5 w-3.5" />
          Loans
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-9 w-9 bg-linear-to-br from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
          onClick={() => onEdit?.(member)}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}