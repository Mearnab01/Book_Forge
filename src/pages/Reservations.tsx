import { useState } from 'react';
import { CalendarClock, Check, X, Clock } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchBar } from '@/components/ui/searchbar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { mockReservations } from '@/data/MockData';

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
  FULFILLED: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
  CANCELLED: 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700',
  EXPIRED: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800',
};

const statusIcons: Record<string, React.ReactNode> = {
  PENDING: <Clock className="h-4 w-4" />,
  FULFILLED: <Check className="h-4 w-4" />,
  CANCELLED: <X className="h-4 w-4" />,
  EXPIRED: <X className="h-4 w-4" />,
};

export default function Reservations() {
  const { hasRole } = useAuth();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');

  const isStaff = hasRole(['ADMIN', 'LIBRARIAN']);

  const filteredReservations = mockReservations.filter(res => {
    const matchesSearch = 
      res.bookTitle?.title.toLowerCase().includes(search.toLowerCase()) ||
      res.memberName?.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === 'All' || res.status === status;
    return matchesSearch && matchesStatus;
  });

  return (
    <MainLayout title="Reservations">
      <div className="animate-fade-in space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-muted-foreground">
              {isStaff 
                ? 'Manage book reservations and fulfill requests'
                : 'View your book reservations'}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by book or member..."
            className="flex-1 max-w-md"
          />
          
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="FULFILLED">Fulfilled</SelectItem>
              <SelectItem value="EXPIRED">Expired</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reservations List */}
        <div className="space-y-4">
          {filteredReservations.map((reservation) => (
            <Card key={reservation.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <CalendarClock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{reservation.bookTitle?.title}</h3>
                      {isStaff && (
                        <p className="text-sm text-muted-foreground">
                          Reserved by: {reservation.memberName?.name}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>Reserved: {new Date(reservation.reservationDate).toLocaleDateString()}</span>
                        <span>Expires: {new Date(reservation.expiryDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge className={`${statusColors[reservation.status]} flex items-center gap-1`}>
                      {statusIcons[reservation.status]}
                      {reservation.status}
                    </Badge>

                    {isStaff && reservation.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-success border-success hover:bg-success hover:text-success-foreground">
                          <Check className="mr-1 h-4 w-4" />
                          Fulfill
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
                          <X className="mr-1 h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredReservations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CalendarClock className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-foreground">No reservations found</p>
            <p className="text-sm text-muted-foreground">
              {status !== 'All' ? 'Try changing the filter' : 'No reservations to display'}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
