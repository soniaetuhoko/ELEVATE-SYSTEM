import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, HelpCircle, BookOpen, Target, FolderKanban, Users } from 'lucide-react';
import apiService from '@/services/api';

interface HelpSection {
  id: string;
  title: string;
  content: string;
  steps: string[];
}

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const [helpContent, setHelpContent] = useState<HelpSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadHelpContent();
    }
  }, [isOpen]);

  const loadHelpContent = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getHelpContent();
      if (response.success) {
        setHelpContent(response.data.sections);
      }
    } catch (error) {
      console.error('Failed to load help content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadManual = async () => {
    try {
      const blob = await apiService.downloadManual();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'elevate-user-manual.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download manual:', error);
    }
  };

  const getIcon = (sectionId: string) => {
    switch (sectionId) {
      case 'getting-started': return <HelpCircle className="h-5 w-5" />;
      case 'missions': return <Target className="h-5 w-5" />;
      case 'projects': return <FolderKanban className="h-5 w-5" />;
      case 'reflections': return <BookOpen className="h-5 w-5" />;
      default: return <Users className="h-5 w-5" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            ELEVATE Help Center
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground">
              Get help with using ELEVATE platform features
            </p>
            <Button onClick={downloadManual} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download PDF Manual
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading help content...</div>
          ) : (
            <Tabs defaultValue="getting-started" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                {helpContent.map((section) => (
                  <TabsTrigger key={section.id} value={section.id} className="text-xs">
                    {section.title}
                  </TabsTrigger>
                ))}
              </TabsList>

              {helpContent.map((section) => (
                <TabsContent key={section.id} value={section.id}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {getIcon(section.id)}
                        {section.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">{section.content}</p>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Step-by-step guide:</h4>
                        <ol className="list-decimal list-inside space-y-2">
                          {section.steps.map((step, index) => (
                            <li key={index} className="text-sm">{step}</li>
                          ))}
                        </ol>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          )}

          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}