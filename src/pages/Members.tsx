import { useState } from 'react';
import { Plus, Filter } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { MemberCard } from '@/components/members/MemberCard';
import { SearchBar } from '@/components/ui/searchbar';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockMembers } from '@/data/MockData';


const statusOptions = ['All', 'ACTIVE', 'SUSPENDED', 'EXPIRED'];
const membershipOptions = ['All', 'STANDARD', 'PREMIUM', 'STUDENT'];

export default function Members() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [membership, setMembership] = useState('All');

  const filteredMembers = mockMembers.filter(member => {
    const matchesSearch = 
      member.name.toLowerCase().includes(search.toLowerCase()) ||
      member.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === 'All' || member.status === status;
    const matchesMembership = membership === 'All' || member.membershipType === membership;
    return matchesSearch && matchesStatus && matchesMembership;
  });

  return (
    <MainLayout title="Members">
      <div className="animate-fade-in space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-muted-foreground">
              Manage library members and their subscriptions
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by name or email..."
            className="flex-1 max-w-md"
          />
          
          <div className="flex items-center gap-3">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-36">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={membership} onValueChange={setMembership}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {membershipOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        <p className="text-sm text-muted-foreground">
          Showing {filteredMembers.length} of {mockMembers.length} members
        </p>

        {/* Members Grid */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredMembers.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
            />
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg font-medium text-foreground">No members found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
