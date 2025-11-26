import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, FileText, Target, BookOpen } from 'lucide-react';


interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (query.length > 2) {
      const timeoutId = setTimeout(async () => {
        setIsLoading(true);
        try {
          // Mock search - replace with actual API call
          const mockResults = {
            missions: [
              { id: '1', title: 'Web Development', description: 'Learn React and TypeScript' },
            ],
            projects: [
              { id: '1', title: 'Portfolio Site', description: 'Personal portfolio website' },
            ],
            reflections: [
              { id: '1', title: 'Week 1 Reflection', content: 'Great progress this week...' },
            ],
            total: 3
          };
          setResults(mockResults);
        } catch (error) {
          console.error('Search failed:', error);
        } finally {
          setIsLoading(false);
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      setResults(null);
    }
  }, [query]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'missions': return <Target className="h-4 w-4" />;
      case 'projects': return <FileText className="h-4 w-4" />;
      case 'reflections': return <BookOpen className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Search Everything</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search missions, projects, reflections..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          {isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              Searching...
            </div>
          )}

          {results && (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {results.total === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No results found for "{query}"
                </div>
              ) : (
                <>
                  {Object.entries(results).map(([type, items]: [string, any]) => {
                    if (type === 'total' || !Array.isArray(items) || items.length === 0) return null;
                    
                    return (
                      <div key={type} className="space-y-2">
                        <div className="flex items-center gap-2">
                          {getIcon(type)}
                          <h3 className="font-medium capitalize">{type}</h3>
                          <Badge variant="secondary">{items.length}</Badge>
                        </div>
                        
                        {items.map((item: any) => (
                          <div
                            key={item.id}
                            className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                            onClick={() => {
                              // Navigate to item
                              onClose();
                            }}
                          >
                            <h4 className="font-medium">{item.title}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {item.description || item.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}