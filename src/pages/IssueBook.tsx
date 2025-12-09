import { useState } from 'react';
import { BookPlus, Search, User, Book, Calendar } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from "sonner"

export default function IssueBook() {
  const [memberId, setMemberId] = useState('');
  const [bookCopyId, setBookCopyId] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Mock selected data
  const [selectedMember, setSelectedMember] = useState<{ id: string; name: string; email: string } | null>(null);
  const [selectedBook, setSelectedBook] = useState<{ id: string; title: string; author: string; copyNumber: string } | null>(null);

  const handleSearchMember = () => {
    // Simulate API call
    if (memberId) {
      setSelectedMember({
        id: memberId,
        name: 'John Doe',
        email: 'john.doe@email.com'
      });
    }
  };

  const handleSearchBook = () => {
    // Simulate API call
    if (bookCopyId) {
      setSelectedBook({
        id: bookCopyId,
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        copyNumber: 'COPY-001'
      });
    }
  };

  const handleIssue = () => {
    if (!selectedMember || !selectedBook || !dueDate) {
      toast("Missing information",{
        description: "Please fill in all required fields",
      });
      return;
    }

    // TODO: Call API
    toast("Book Issued Successfully",{
      description: `"${selectedBook.title}" issued to ${selectedMember.name}`,
    });

    // Reset form
    setMemberId('');
    setBookCopyId('');
    setDueDate('');
    setSelectedMember(null);
    setSelectedBook(null);
  };

  return (
    <MainLayout title="Issue Book">
      <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
        <div className="rounded-xl bg-gradient-hero p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
              <BookPlus className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold">Issue a Book</h2>
              <p className="text-white/80">Loan a book copy to a library member</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Member Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-accent" />
                Select Member
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter Member ID or search..."
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                />
                <Button variant="secondary" onClick={handleSearchMember}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {selectedMember && (
                <div className="rounded-lg border border-success/30 bg-success/5 p-4">
                  <Badge className="bg-success mb-2">Selected</Badge>
                  <p className="font-medium">{selectedMember.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedMember.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">ID: {selectedMember.id}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Book Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Book className="h-5 w-5 text-accent" />
                Select Book Copy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter Book Copy ID or ISBN..."
                  value={bookCopyId}
                  onChange={(e) => setBookCopyId(e.target.value)}
                />
                <Button variant="secondary" onClick={handleSearchBook}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {selectedBook && (
                <div className="rounded-lg border border-success/30 bg-success/5 p-4">
                  <Badge className="bg-success mb-2">Available</Badge>
                  <p className="font-medium">{selectedBook.title}</p>
                  <p className="text-sm text-muted-foreground">by {selectedBook.author}</p>
                  <p className="text-xs text-muted-foreground mt-1">Copy: {selectedBook.copyNumber}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Due Date & Submit */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Due Date
                </Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-48"
                />
              </div>
              
              <Button 
                size="lg" 
                onClick={handleIssue}
                disabled={!selectedMember || !selectedBook || !dueDate}
              >
                <BookPlus className="mr-2 h-5 w-5" />
                Issue Book
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
