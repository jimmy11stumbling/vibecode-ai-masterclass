import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  HelpCircle, 
  Search, 
  Book, 
  Video, 
  MessageCircle, 
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Zap,
  Database,
  Users,
  Settings,
  Code,
  Rocket
} from 'lucide-react';

interface HelpArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  lastUpdated: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
}

export const HelpSystem: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);

  const helpArticles: HelpArticle[] = [
    {
      id: '1',
      title: 'Getting Started with Sovereign AI IDE',
      category: 'Getting Started',
      content: 'Learn the basics of using the Sovereign AI IDE platform...',
      tags: ['basics', 'setup', 'introduction'],
      difficulty: 'beginner',
      lastUpdated: '2024-01-15'
    },
    {
      id: '2',
      title: 'Setting up RAG Knowledge Base',
      category: 'RAG System',
      content: 'Configure and manage your RAG knowledge base...',
      tags: ['rag', 'knowledge base', 'documents'],
      difficulty: 'intermediate',
      lastUpdated: '2024-01-14'
    },
    {
      id: '3',
      title: 'Agent-to-Agent Communication',
      category: 'A2A Protocol',
      content: 'Understanding how agents communicate in the system...',
      tags: ['agents', 'communication', 'protocol'],
      difficulty: 'advanced',
      lastUpdated: '2024-01-13'
    },
    {
      id: '4',
      title: 'Real-time Collaboration Features',
      category: 'Collaboration',
      content: 'Work together with your team in real-time...',
      tags: ['collaboration', 'real-time', 'teamwork'],
      difficulty: 'intermediate',
      lastUpdated: '2024-01-12'
    }
  ];

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I upload documents to the knowledge base?',
      answer: 'You can upload documents using the file upload zone in the RAG interface. Supported formats include PDF, TXT, MD, DOC, DOCX, and JSON files up to 50MB.',
      category: 'RAG System',
      helpful: 15
    },
    {
      id: '2',
      question: 'What is the A2A protocol?',
      answer: 'Agent-to-Agent (A2A) protocol enables autonomous communication between AI agents in the system, allowing for complex multi-agent workflows and coordination.',
      category: 'A2A Protocol',
      helpful: 23
    },
    {
      id: '3',
      question: 'How do I set up real-time collaboration?',
      answer: 'Real-time collaboration is automatically enabled when multiple users join the same project. You can see other users cursors, comments, and live edits.',
      category: 'Collaboration',
      helpful: 8
    },
    {
      id: '4',
      question: 'Can I deploy my projects automatically?',
      answer: 'Yes! The CI/CD pipeline supports automatic deployments. You can configure auto-deploy in the deployment settings for different environments.',
      category: 'Deployment',
      helpful: 12
    }
  ];

  const categories = [
    { id: 'all', name: 'All Categories', icon: Book },
    { id: 'Getting Started', name: 'Getting Started', icon: Rocket },
    { id: 'RAG System', name: 'RAG System', icon: Database },
    { id: 'A2A Protocol', name: 'A2A Protocol', icon: Users },
    { id: 'Collaboration', name: 'Collaboration', icon: MessageCircle },
    { id: 'Deployment', name: 'Deployment', icon: Zap },
    { id: 'Settings', name: 'Settings', icon: Settings }
  ];

  const filteredArticles = helpArticles.filter(article => {
    const matchesSearch = searchQuery === '' || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Help & Documentation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search documentation, FAQs, and guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Book className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Documentation</h3>
                    <p className="text-sm text-muted-foreground">Complete guides and references</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Video className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Video Tutorials</h3>
                    <p className="text-sm text-muted-foreground">Step-by-step video guides</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Community</h3>
                    <p className="text-sm text-muted-foreground">Get help from the community</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {category.name}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="articles" className="w-full">
            <TabsList>
              <TabsTrigger value="articles">Articles</TabsTrigger>
              <TabsTrigger value="faqs">FAQs</TabsTrigger>
              <TabsTrigger value="videos">Videos</TabsTrigger>
              <TabsTrigger value="api">API Reference</TabsTrigger>
            </TabsList>

            <TabsContent value="articles" className="space-y-4">
              {filteredArticles.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Book className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">No articles found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search terms or browse different categories.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredArticles.map((article) => (
                  <Card key={article.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h3 className="text-lg font-medium">{article.title}</h3>
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        </div>
                        
                        <p className="text-muted-foreground line-clamp-2">
                          {article.content}
                        </p>
                        
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline">{article.category}</Badge>
                          <Badge className={getDifficultyColor(article.difficulty)}>
                            {article.difficulty}
                          </Badge>
                          {article.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          Last updated: {new Date(article.lastUpdated).toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="faqs" className="space-y-4">
              {filteredFAQs.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <HelpCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">No FAQs found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search terms or browse different categories.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredFAQs.map((faq) => (
                  <Card key={faq.id}>
                    <Collapsible>
                      <CollapsibleTrigger
                        className="w-full"
                        onClick={() => setOpenFAQ(openFAQ === faq.id ? null : faq.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between text-left">
                            <div className="flex-1">
                              <h3 className="font-medium">{faq.question}</h3>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {faq.category}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {faq.helpful} people found this helpful
                                </span>
                              </div>
                            </div>
                            {openFAQ === faq.id ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </div>
                        </CardContent>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="pt-0 px-4 pb-4">
                          <div className="border-t pt-4">
                            <p className="text-muted-foreground">{faq.answer}</p>
                            <div className="flex items-center gap-2 mt-4">
                              <Button size="sm" variant="ghost">
                                👍 Helpful
                              </Button>
                              <Button size="sm" variant="ghost">
                                👎 Not helpful
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="videos" className="space-y-4">
              <Card>
                <CardContent className="p-8 text-center">
                  <Video className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Video Tutorials Coming Soon</h3>
                  <p className="text-muted-foreground mb-4">
                    We're working on comprehensive video tutorials to help you get the most out of the platform.
                  </p>
                  <Button variant="outline">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit YouTube Channel
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="api" className="space-y-4">
              <Card>
                <CardContent className="p-8 text-center">
                  <Code className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">API Reference</h3>
                  <p className="text-muted-foreground mb-4">
                    Comprehensive API documentation for developers building integrations.
                  </p>
                  <Button variant="outline">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View API Docs
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};