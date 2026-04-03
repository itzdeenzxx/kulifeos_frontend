import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AppLayout } from "@/components/AppLayout";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/MotionWrappers";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageSquare, FileText, Send, Loader2, Info, Users, HelpCircle, LayoutList } from "lucide-react";
import { useState, useEffect } from "react";
import { getCommunityPosts, addCommunityPost, likePost, seedCommunityPosts, CommunityPost } from "@/lib/communityDb";
import { useCurrentUserProfile } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const Community = () => {
  const { profile } = useCurrentUserProfile();
  const { toast } = useToast();
  
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostType, setNewPostType] = useState<"post" | "sheet" | "question">("post");
  const [isPosting, setIsPosting] = useState(false);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      await seedCommunityPosts();
      const data = await getCommunityPosts();
      setPosts(data);
    } catch (e: any) {
      toast({ title: "โหลดข้อมูลล้มเหลว", description: e.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLike = async (postId: string) => {
    try {
      setPosts(current => current.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
      await likePost(postId);
    } catch (e) {
      setPosts(current => current.map(p => p.id === postId ? { ...p, likes: p.likes - 1 } : p));
    }
  };

  const handlePost = async () => {
    if (!newPostContent.trim()) return;
    setIsPosting(true);
    try {
      const authorName = profile?.fullName || profile?.email?.split('@')[0] || "Anonymous KU";
      await addCommunityPost({
        author: authorName,
        authorId: profile?.id || "unknown",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${authorName}`,
        content: newPostContent.trim(),
        tags: [newPostType.charAt(0).toUpperCase() + newPostType.slice(1)],
        type: newPostType
      });
      setNewPostContent("");
      await fetchPosts();
      toast({ title: "โพสต์สำเร็จ", description: "ระบบบันทึกโพสต์ของคุณลง Firestore เรียบร้อยแล้ว", className: "bg-primary text-primary-foreground border-0" });
    } catch (e: any) {
      toast({ title: "โพสต์ล้มเหลว", description: e.message, variant: "destructive" });
    } finally {
      setIsPosting(false);
    }
  };

  const filteredPosts = posts.filter(p => filter === "all" || p.type === filter);

  return (
    <AppLayout title="Community Feed">
      <PageTransition>
          <div className="max-w-2xl mx-auto space-y-6 pb-20 px-2 sm:px-0">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              ฟีดข่าวสาร & แจกชีท
            </h2>
            <Badge variant="secondary" className="bg-primary/10 text-primary">พูดคุยแลกเปลี่ยน</Badge>
          </div>

          <Card className="border-border/50 shadow-md rounded-3xl overflow-hidden bg-gradient-to-br from-card to-muted/30">
            <CardContent className="p-4 sm:p-5 relative z-10">
              <div className="flex gap-3 sm:gap-4 items-start">
                <Avatar className="h-10 w-10 mt-1 ring-2 ring-primary/20">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.email || "User"}`} />
                  <AvatarFallback>{profile?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <Textarea 
                    placeholder="กำลังคิดอะไรอยู่? หรืออยากแบ่งปันชีทเรียน..." 
                    className="min-h-[100px] resize-none bg-background/80 backdrop-blur-sm border-border/50 focus-visible:ring-primary/30 rounded-xl"
                    value={newPostContent}
                    onChange={e => setNewPostContent(e.target.value)}
                  />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 p-1.5 bg-background/80 rounded-xl border border-border/50">
                      <Button size="sm" variant={newPostType === "post" ? "secondary" : "ghost"} className="h-8 text-xs font-semibold px-3 rounded-lg" onClick={() => setNewPostType("post")}>
                        <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> พูดคุย
                      </Button>
                      <Button size="sm" variant={newPostType === "sheet" ? "secondary" : "ghost"} className="h-8 text-xs font-semibold px-3 rounded-lg" onClick={() => setNewPostType("sheet")}>
                        <FileText className="h-3.5 w-3.5 mr-1.5 text-ku-green" /> แจกชีท
                      </Button>
                      <Button size="sm" variant={newPostType === "question" ? "secondary" : "ghost"} className="h-8 text-xs font-semibold px-3 rounded-lg" onClick={() => setNewPostType("question")}>
                        <HelpCircle className="h-3.5 w-3.5 mr-1.5 text-orange-500" /> คำถาม
                      </Button>
                    </div>
                    <Button onClick={handlePost} disabled={!newPostContent.trim() || isPosting} className="gap-2 shrink-0 rounded-xl">
                      {isPosting ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4" />}
                      โพสต์เลย
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs value={filter} onValueChange={setFilter} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-muted/60 p-1 mb-6 rounded-xl overflow-x-auto custom-scrollbar flex-nowrap">
              <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm"><LayoutList className="h-4 w-4 sm:mr-1.5" /> <span className="hidden sm:inline">ทั้งหมด</span></TabsTrigger>
              <TabsTrigger value="sheet" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm"><FileText className="h-4 w-4 sm:mr-1.5 text-ku-green" /> <span className="hidden sm:inline">ชีทสรุป</span></TabsTrigger>
              <TabsTrigger value="post" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm"><MessageSquare className="h-4 w-4 sm:mr-1.5" /> <span className="hidden sm:inline">พูดคุย</span></TabsTrigger>
              <TabsTrigger value="question" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm"><HelpCircle className="h-4 w-4 sm:mr-1.5 text-orange-500" /> <span className="hidden sm:inline">ถาม-ตอบ</span></TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="m-0 focus-visible:outline-none focus-visible:ring-0">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center p-12 text-muted-foreground gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p>กำลังโหลดหน้าฟีดและเตรียมข้อมูล...</p>
                </div>
              ) : filteredPosts.length === 0 ? (
                <Card className="border-dashed border-2 py-12 text-center bg-card/50">
                  <CardContent className="flex flex-col items-center justify-center text-muted-foreground gap-4">
                    <div className="p-4 bg-primary/10 rounded-full"><Info className="h-8 w-8 text-primary" /></div>
                    <p className="text-lg font-bold text-foreground">ยังไม่มีโพสต์ในหมวดหมู่นี้</p>
                    <p className="text-sm max-w-[250px] leading-relaxed">มาเป็นคนแรกที่แบ่งปันความรู้หรือพูดคุยกันเถอะ!</p>
                  </CardContent>
                </Card>
              ) : (
                  <StaggerContainer className="flex flex-col space-y-6">
                    {filteredPosts.map(post => (
                      <StaggerItem key={post.id}>
                      <Card className="rounded-3xl border-border/40 hover:border-border/80 transition-all shadow-sm hover:shadow-md overflow-hidden bg-card/90 backdrop-blur-sm group">
                        <CardHeader className="py-4 px-5 pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-11 w-11 ring-1 ring-border/50">
                                <AvatarImage src={post.avatar} />
                                <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-bold text-[15px] leading-none text-foreground">{post.author}</p>
                                <p className="text-xs text-muted-foreground mt-1.5">
                                  {post.createdAt?.toDate ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true, locale: th }) : "เพิ่งโพสต์"}
                                </p>
                              </div>
                            </div>
                            {post.type === "sheet" && (
                              <Badge variant="secondary" className="bg-ku-green/15 text-ku-green border-0 font-bold px-3 py-1 text-[11px] rounded-full">
                                <FileText className="mr-1 h-3 w-3" /> แจกชีท
                              </Badge>
                            )}
                            {post.type === "question" && (
                              <Badge variant="secondary" className="bg-orange-500/15 text-orange-600 border-0 font-bold px-3 py-1 text-[11px] rounded-full">
                                <HelpCircle className="mr-1 h-3 w-3" /> คำถาม
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="px-5 py-2">
                          <div className="prose prose-sm dark:prose-invert max-w-none text-[15px] leading-relaxed text-foreground/90">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
                          </div>
                          {post.tags && post.tags.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-1.5">
                              {post.tags.map(t => (
                                <Badge key={Math.random()} variant="outline" className="border-border/60 bg-muted/40 text-muted-foreground text-[11px] font-medium py-0.5 shadow-none hover:bg-muted/80 transition-colors">
                                  #{t}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                        <div className="px-5 py-3 mt-3 bg-muted/10 border-t border-border/30 flex items-center gap-4 text-muted-foreground">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 gap-1.5 text-xs hover:text-red-500 hover:bg-red-500/10 data-[liked=true]:text-red-500 transition-colors rounded-xl px-3 group/btn"
                            onClick={() => handleLike(post.id)}
                            data-liked={post.likes > 0}
                          >
                            <Heart className={`h-4 w-4 transition-transform group-active/btn:scale-125 ${post.likes > 0 ? 'fill-red-500' : ''}`} /> 
                            <span className="font-semibold">{post.likes}</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs hover:text-primary hover:bg-primary/10 transition-colors rounded-xl px-3 group/btn">
                            <MessageSquare className="h-4 w-4 transition-transform group-active/btn:scale-110" /> 
                            <span className="font-semibold">{post.comments}</span>
                          </Button>
                        </div>
                      </Card>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              )}
            </TabsContent>
          </Tabs>

        </div>
      </PageTransition>
    </AppLayout>
  );
};

export default Community;
