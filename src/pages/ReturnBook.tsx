import { useState } from 'react';
import { BookCheck, Search, AlertTriangle } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface LoanInfo {
  id: string;
  bookTitle: string;
  bookAuthor: string;
  copyNumber: string;
  memberName: string;
  issueDate: string;
  dueDate: string;
  isOverdue: boolean;
  fineAmount?: number;
}

export default function ReturnBook() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loanInfo, setLoanInfo] = useState<LoanInfo | null>(null);

  const handleSearch = () => {
    // Simulate API call
    if (searchQuery) {
      const today = new Date();
      const dueDate = new Date('2024-12-01');
      const isOverdue = today > dueDate;

      setLoanInfo({
        id: 'LOAN-001',
        bookTitle: 'The Great Gatsby',
        bookAuthor: 'F. Scott Fitzgerald',
        copyNumber: 'COPY-001',
        memberName: 'John Doe',
        issueDate: '2024-11-15',
        dueDate: '2024-12-01',
        isOverdue,
        fineAmount: isOverdue ? 5.50 : undefined,
      });
    }
  };

  const handleReturn = () => {
    if (!loanInfo) return;

    // TODO: Call API
    toast("Book Returned Successfully",{
      description: `"${loanInfo.bookTitle}" has been returned`,
    });

    setSearchQuery('');
    setLoanInfo(null);
  };

  return (
    <MainLayout title="Return Book">
      <div className="animate-fade-in max-w-3xl mx-auto space-y-6">
        <div className="rounded-xl bg-gradient-hero p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
              <BookCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold">Return a Book</h2>
              <p className="text-white/80">Process book returns and calculate fines</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Search Loan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Enter Loan ID, Book Copy ID, or Member ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSearch}>
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loan Details */}
        {loanInfo && (
          <Card className={loanInfo.isOverdue ? 'border-destructive/50' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Loan Details</CardTitle>
                <Badge variant={loanInfo.isOverdue ? 'destructive' : 'default'}>
                  {loanInfo.isOverdue ? 'OVERDUE' : 'ACTIVE'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Book Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Book</p>
                  <p className="font-medium">{loanInfo.bookTitle}</p>
                  <p className="text-sm text-muted-foreground">by {loanInfo.bookAuthor}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Member</p>
                  <p className="font-medium">{loanInfo.memberName}</p>
                </div>
              </div>

              {/* Dates */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Issue Date</p>
                  <p className="font-medium">{new Date(loanInfo.issueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className={`font-medium ${loanInfo.isOverdue ? 'text-destructive' : ''}`}>
                    {new Date(loanInfo.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Copy Number</p>
                  <p className="font-medium">{loanInfo.copyNumber}</p>
                </div>
              </div>

              {/* Fine Warning */}
              {loanInfo.isOverdue && loanInfo.fineAmount && (
                <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <div>
                    <p className="font-medium text-destructive">Overdue Fine</p>
                    <p className="text-sm text-muted-foreground">
                      Fine amount: <span className="font-semibold">${loanInfo.fineAmount.toFixed(2)}</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Action */}
              <div className="flex justify-end">
                <Button size="lg" onClick={handleReturn}>
                  <BookCheck className="mr-2 h-5 w-5" />
                  Process Return
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
