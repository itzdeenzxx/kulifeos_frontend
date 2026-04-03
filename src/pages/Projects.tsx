import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Sparkles, Plus, Send, Bot, User, GripVertical,
  CheckCircle2, Circle, Clock, Trash2, ChevronRight, MessageCircle, Users, ChevronDown, Check
} from "lucide-react";
import { useProjectSpaces, createProjectSpace, addTasksToProjectSpace, aiChatMessagesDefault as aiChatMessages, aiMockResponsesDefault as aiMockResponses, type TaskItem, type ProjectSpace } from "@/lib/db";
import { generateProjectTasks } from "@/lib/aiAnalyze";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";

const statusConfig = {
  todo: { label: "To Do", icon: Circle, color: "text-muted-foreground", bg: "bg-muted/50" },
  inProgress: { label: "กำลังทำ", icon: Clock, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
  done: { label: "เสร็จแล้ว", icon: CheckCircle2, color: "text-primary", bg: "bg-primary/5" },
};

/* ─── Mobile Kanban Column (Collapsible) ─── */
const MobileKanbanColumn = ({
  status,
  tasks,
  onMove,
  onDelete,
}: {
  status: "todo" | "inProgress" | "done";
  tasks: TaskItem[];
  onMove: (id: string, s: TaskItem["status"]) => void;
  onDelete: (id: string) => void;
}) => {
  const [open, setOpen] = useState(status !== "done");
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <StatusIcon className={`h-4 w-4 ${config.color}`} />
          <span className="text-[14px] font-semibold text-foreground">{config.label}</span>
          <Badge variant="secondary" className="rounded-full bg-accent text-accent-foreground border-0 px-2 py-0 text-[10px]">
            {tasks.length}
          </Badge>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 px-3 pb-3">
              {tasks.map((task) => (
                <div key={task.id} className="rounded-xl border border-border/40 bg-background p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[13px] font-medium text-foreground leading-tight flex-1">{task.title}</p>
                    <button onClick={() => onDelete(task.id)} className="text-muted-foreground/40 hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {task.description && (
                    <p className="mt-1 text-[11px] text-muted-foreground line-clamp-1">{task.description}</p>
                  )}
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex gap-1">
                      {task.tags.map((tag) => (
                        <Badge key={tag} className="rounded-md bg-accent text-accent-foreground border-0 px-1.5 py-0 text-[9px]">{tag}</Badge>
                      ))}
                    </div>
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="bg-primary/10 text-primary text-[8px] font-semibold">{task.assignee}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="mt-2 flex gap-1">
                    {status !== "todo" && (
                      <button
                        className="rounded-lg bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground"
                        onClick={() => onMove(task.id, status === "done" ? "inProgress" : "todo")}
                      >
                        ← {status === "done" ? "กำลังทำ" : "To Do"}
                      </button>
                    )}
                    {status !== "done" && (
                      <button
                        className="rounded-lg bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary"
                        onClick={() => onMove(task.id, status === "todo" ? "inProgress" : "done")}
                      >
                        {status === "todo" ? "กำลังทำ" : "เสร็จแล้ว"} →
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {tasks.length === 0 && (
                <p className="py-3 text-center text-[11px] text-muted-foreground">ไม่มี task</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Projects = () => {
  const { authUser, userProfile } = useAuth();
  const { data: myProjectSpaces = [] } = useProjectSpaces(authUser?.uid);
  const [spaces, setSpaces] = useState<ProjectSpace[]>([]);
  const [activeSpaceId, setActiveSpaceId] = useState<string>("");
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", assignee: "", tags: "" });
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string }[]>(aiChatMessages);
  const [chatInput, setChatInput] = useState("");
  const [chatEndRef, setChatEndRef] = useState<HTMLDivElement | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);
  
  // AI Task Recommendation states
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);
  const [showAITaskReview, setShowAITaskReview] = useState(false);
  const [aiSuggestedTasks, setAiSuggestedTasks] = useState<TaskItem[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (myProjectSpaces.length > 0 && spaces.length === 0) {
      setSpaces(myProjectSpaces);
      setActiveSpaceId(myProjectSpaces[0].id);
    }
  }, [myProjectSpaces, spaces.length]);

  const activeSpace = spaces.find((s) => s.id === activeSpaceId) || spaces[0];

  useEffect(() => {
    chatEndRef?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatEndRef]);

  if (!activeSpace) {
    return (
      <AppLayout title="Projects">
        <div className="flex h-[50vh] flex-col items-center justify-center text-center p-8">
          <p className="text-xl font-bold text-foreground">ไม่พบโปรเจกต์</p>
          <p className="text-muted-foreground mt-2">คุณยังไม่มี Project Space ใด ๆ</p>
        </div>
      </AppLayout>
    );
  }

  const tasksByStatus = {
    todo: activeSpace?.tasks.filter((t) => t.status === "todo") || [],
    inProgress: activeSpace?.tasks.filter((t) => t.status === "inProgress") || [],
    done: activeSpace?.tasks.filter((t) => t.status === "done") || [],
  };

  const totalTasks = activeSpace?.tasks.length || 0;
  const doneTasks = tasksByStatus.done.length;
  const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const handleAddTask = () => {
    if (!newTask.title.trim()) return;
    const task: TaskItem = {
      id: `t-${Date.now()}`,
      title: newTask.title,
      description: newTask.description,
      status: "todo",
      assignee: newTask.assignee || activeSpace.members[0].avatar,
      tags: newTask.tags ? newTask.tags.split(",").map((t) => t.trim()) : [],
      createdAt: new Date().toISOString().split("T")[0],
    };
    setSpaces((prev) =>
      prev.map((s) => (s.id === activeSpaceId ? { ...s, tasks: [...s.tasks, task] } : s))
    );
    setNewTask({ title: "", description: "", assignee: "", tags: "" });
    setShowAddTask(false);
  };

  const handleCreateProject = async () => {
    if (!newProject.name.trim() || !authUser) return;
    setIsCreatingProject(true);
    try {
      const memberInfo = { 
        id: authUser.uid, 
        name: userProfile?.email?.split('@')[0] || "You", 
        avatar: userProfile?.email?.substring(0, 2).toUpperCase() || "ME", 
        role: "admin" 
      };

      const data = {
        name: newProject.name,
        description: newProject.description,
        ownerId: authUser.uid,
        groupId: "g-dynamic",
        members: [memberInfo],
        tasks: [],
      };
      const newProjectId = await createProjectSpace(data as any);
      
      const newSpace: ProjectSpace = {
        id: newProjectId,
        name: newProject.name,
        description: newProject.description,
        ownerId: authUser.uid,
        groupId: "g-dynamic",
        members: [memberInfo],
        tasks: [],
      };

      setSpaces((prev) => [...prev, newSpace]);
      setActiveSpaceId(newProjectId);
      setNewProject({ name: "", description: "" });
      setShowAddProject(false);
    } catch (error) {
      console.error("Failed to create project", error);
    } finally {
      setIsCreatingProject(false);
    }
  };

  const moveTask = (taskId: string, newStatus: TaskItem["status"]) => {
    setSpaces((prev) =>
      prev.map((s) =>
        s.id === activeSpaceId
          ? { ...s, tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)) }
          : s
      )
    );
  };

  const deleteTask = (taskId: string) => {
    setSpaces((prev) =>
      prev.map((s) =>
        s.id === activeSpaceId ? { ...s, tasks: s.tasks.filter((t) => t.id !== taskId) } : s
      )
    );
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: "user" as const, content: chatInput };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setTimeout(() => {
      const lower = chatInput.toLowerCase();
      let responseKey = "default";
      if (lower.includes("task") || lower.includes("งาน") || lower.includes("แบ่ง")) responseKey = "task";
      else if (lower.includes("หัวข้อ") || lower.includes("topic") || lower.includes("ไอเดีย")) responseKey = "topic";
      else if (lower.includes("tech") || lower.includes("เทค") || lower.includes("stack") || lower.includes("เครื่องมือ")) responseKey = "tech";
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant" as const, content: aiMockResponses[responseKey] },
      ]);
    }, 800);
  };

  const handleAISuggestTasks = async () => {
    setIsGeneratingTasks(true);
    try {
      const existingTasksList = activeSpace.tasks.map(t => `${t.title}: ${t.description || ""}`);
      const generatedTasksData = await generateProjectTasks(activeSpace.name, activeSpace.description, existingTasksList);
      const formattedTasks: TaskItem[] = generatedTasksData.map((t, idx) => ({
        id: `ai-${Date.now()}-${idx}`,
        title: t.title,
        description: t.description,
        status: "todo",
        assignee: activeSpace.members[0].avatar, // Default to first member
        tags: t.tags || [],
        createdAt: new Date().toISOString().split("T")[0],
      }));
      setAiSuggestedTasks(formattedTasks);
      setSelectedTaskIds(new Set(formattedTasks.map(t => t.id))); // select all by default
      setShowAITaskReview(true);
    } catch (error) {
      console.error("Error generating tasks:", error);
    } finally {
      setIsGeneratingTasks(false);
    }
  };

  const confirmAiTasks = async () => {
    const tasksToAdd = aiSuggestedTasks.filter(t => selectedTaskIds.has(t.id));
    if (tasksToAdd.length === 0) {
      setShowAITaskReview(false);
      return;
    }
    
    try {
      await addTasksToProjectSpace(activeSpaceId, tasksToAdd);
      setSpaces((prev) =>
        prev.map((s) => (s.id === activeSpaceId ? { ...s, tasks: [...s.tasks, ...tasksToAdd] } : s))
      );
      setShowAITaskReview(false);
      setAiSuggestedTasks([]);
      setSelectedTaskIds(new Set());
    } catch (error) {
      console.error("Error saving AI suggested tasks:", error);
    }
  };

  return (
    <AppLayout title="Projects">
      {/* ========== MOBILE LAYOUT ========== */}
      <div className="md:hidden space-y-4 overflow-x-hidden">
        {/* Space Selector - Horizontal scroll */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
          {spaces.map((space) => (
            <button
              key={space.id}
              onClick={() => setActiveSpaceId(space.id)}
              className={`flex-shrink-0 rounded-2xl px-4 py-2.5 text-left transition-all ${
                activeSpaceId === space.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "border border-border/50 bg-card text-foreground"
              }`}
            >
              <p className="text-[13px] font-semibold">{space.name}</p>
              <p className={`text-[10px] ${activeSpaceId === space.id ? "opacity-70" : "text-muted-foreground"}`}>
                {space.members.length} สมาชิก
              </p>
            </button>
          ))}
          <button
              onClick={() => setShowAddProject(true)}
              className="flex-shrink-0 rounded-2xl px-4 py-2.5 flex items-center justify-center gap-1 border border-dashed border-primary/50 text-primary hover:bg-primary/5 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span className="text-[13px] font-semibold">สร้างโปรเจกต์</span>
          </button>
        </div>

        {/* Project Info Card */}
        <div className="rounded-2xl border border-border/50 bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-[16px] font-bold text-foreground">{activeSpace.name}</h2>
              <p className="text-[11px] text-muted-foreground">{activeSpace.description}</p>
            </div>
            <div className="flex -space-x-1.5">
              {activeSpace.members.slice(0, 3).map((m) => (
                <Avatar key={m.avatar} className="h-6 w-6 border-2 border-card">
                  <AvatarFallback className="bg-primary/10 text-primary text-[8px] font-semibold">{m.avatar}</AvatarFallback>
                </Avatar>
              ))}
              {activeSpace.members.length > 3 && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-muted text-[8px] font-semibold text-muted-foreground">
                  +{activeSpace.members.length - 3}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground mb-2">
            <span>{doneTasks}/{totalTasks} tasks</span>
            <span className="font-bold text-primary">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2 bg-accent [&>div]:bg-primary [&>div]:transition-all" />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setShowAddTask(true)} className="flex-1 gap-1.5 rounded-xl bg-primary text-primary-foreground text-[12px] h-9">
            <Plus className="h-3.5 w-3.5" /> เพิ่ม Task
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowAIChat(true)} className="gap-1.5 rounded-xl text-[12px] h-9">
            <MessageCircle className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleAISuggestTasks} disabled={isGeneratingTasks} className="gap-1.5 rounded-xl text-[12px] h-9">
            <Sparkles className="h-3.5 w-3.5" /> {isGeneratingTasks ? "กำลังคิด..." : ""}
          </Button>
        </div>

        {/* Stacked Kanban */}
        <div className="space-y-3">
          {(["todo", "inProgress", "done"] as const).map((status) => (
            <MobileKanbanColumn
              key={status}
              status={status}
              tasks={tasksByStatus[status]}
              onMove={moveTask}
              onDelete={deleteTask}
            />
          ))}
        </div>
      </div>

      {/* ========== DESKTOP LAYOUT ========== */}
      <div className="hidden md:block">
        {/* Space Selector */}
        <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
          {spaces.map((space) => (
            <button
              key={space.id}
              onClick={() => setActiveSpaceId(space.id)}
              className={`flex-shrink-0 rounded-xl border px-4 py-3 text-left transition-all ${
                activeSpaceId === space.id
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border/50 bg-card hover:border-primary/30"
              }`}
            >
              <p className={`text-sm font-semibold ${activeSpaceId === space.id ? "text-primary" : "text-foreground"}`}>
                {space.name}
              </p>
              <p className="text-[11px] text-muted-foreground">{space.members.length} สมาชิก</p>
            </button>
          ))}
          <button
              onClick={() => setShowAddProject(true)}
              className="flex-shrink-0 rounded-xl border border-dashed border-primary/50 text-primary hover:bg-primary/5 transition-all flex flex-col justify-center items-center px-6"
            >
              <Plus className="h-5 w-5 mb-1" />
              <span className="text-xs font-semibold">สร้างโปรเจกต์</span>
          </button>
        </div>

        {/* Header */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">{activeSpace.name}</h2>
            <p className="text-sm text-muted-foreground">{activeSpace.description}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowAIChat(true)} className="gap-2 rounded-xl">
              <MessageCircle className="h-4 w-4" /> AI คู่คิด
            </Button>
            <Button variant="outline" size="sm" onClick={handleAISuggestTasks} disabled={isGeneratingTasks} className="gap-2 rounded-xl">
              <Sparkles className="h-4 w-4" /> {isGeneratingTasks ? "กำลังวิเคราะห์..." : "AI แนะนำ Task"}
            </Button>
            <Button size="sm" onClick={() => setShowAddTask(true)} className="gap-2 rounded-xl bg-primary text-primary-foreground">
              <Plus className="h-4 w-4" /> เพิ่ม Task
            </Button>
          </div>
        </div>

        {/* Members Strip */}
        <div className="mb-5 flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <div className="flex -space-x-2">
            {activeSpace.members.map((m) => (
              <Avatar key={m.avatar} className="h-7 w-7 border-2 border-background">
                <AvatarFallback className="bg-primary/10 text-primary text-[9px] font-semibold">{m.avatar}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">{activeSpace.members.length} สมาชิก</span>
        </div>

        {/* Progress */}
        <Card className="mb-6 rounded-2xl border-border/50">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress: {doneTasks}/{totalTasks} tasks</span>
              <span className="font-semibold text-primary">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-3 bg-accent [&>div]:bg-primary [&>div]:transition-all [&>div]:duration-500" />
          </CardContent>
        </Card>

        {/* Kanban Board */}
        <div className="grid gap-4 md:grid-cols-3">
          {(["todo", "inProgress", "done"] as const).map((status) => {
            const config = statusConfig[status];
            const StatusIcon = config.icon;
            return (
              <div
                key={status}
                onDragOver={(e) => { e.preventDefault(); setDragOverStatus(status); }}
                onDragLeave={() => setDragOverStatus(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverStatus(null);
                  if (draggedTaskId) {
                    moveTask(draggedTaskId, status);
                    setDraggedTaskId(null);
                  }
                }}
                className={`rounded-2xl p-3 transition-colors duration-200 ${dragOverStatus === status ? "bg-primary/5 ring-2 ring-primary/20" : ""}`}
              >
                <div className="mb-3 flex items-center gap-2">
                  <StatusIcon className={`h-4 w-4 ${config.color}`} />
                  <h3 className="text-sm font-semibold text-foreground">{config.label}</h3>
                  <Badge variant="secondary" className="rounded-full bg-accent text-accent-foreground border-0 px-2 py-0.5 text-[10px]">
                    {tasksByStatus[status].length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {tasksByStatus[status].map((task) => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.85, y: -10 }}
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        draggable
                        onDragStart={() => setDraggedTaskId(task.id)}
                        onDragEnd={() => setDraggedTaskId(null)}
                        className="cursor-grab active:cursor-grabbing"
                      >
                        <Card className={`card-hover rounded-xl border-border/50 group transition-shadow ${draggedTaskId === task.id ? "shadow-lg ring-2 ring-primary/30 opacity-70" : ""}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2 flex-1">
                                <GripVertical className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
                                <p className="text-sm font-medium text-foreground">{task.title}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                                onClick={() => deleteTask(task.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                            {task.description && (
                              <p className="mt-1 ml-6 text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                            )}
                            <div className="mt-3 flex items-center justify-between">
                              <div className="flex gap-1 flex-wrap">
                                {task.tags.map((tag) => (
                                  <Badge key={tag} className="rounded-md bg-accent text-accent-foreground border-0 px-2 py-0.5 text-[10px]">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                                  {task.assignee}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            <div className="mt-3 flex gap-1">
                              {status !== "todo" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-[10px] px-2 text-muted-foreground hover:text-foreground"
                                  onClick={() => moveTask(task.id, status === "done" ? "inProgress" : "todo")}
                                >
                                  ← {status === "done" ? "กำลังทำ" : "To Do"}
                                </Button>
                              )}
                              {status !== "done" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-[10px] px-2 text-muted-foreground hover:text-foreground"
                                  onClick={() => moveTask(task.id, status === "todo" ? "inProgress" : "done")}
                                >
                                  {status === "todo" ? "กำลังทำ" : "เสร็จแล้ว"} →
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {status === "todo" && (
                    <motion.button
                      layout
                      onClick={() => setShowAddTask(true)}
                      className="flex w-full items-center gap-2 rounded-xl border-2 border-dashed border-border/60 p-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent/30"
                    >
                      <Plus className="h-4 w-4" /> เพิ่ม Task
                    </motion.button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Project Dialog */}
      <Dialog open={showAddProject} onOpenChange={setShowAddProject}>
        <DialogContent className="rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> สร้าง Project Space ใหม่
            </DialogTitle>
            <DialogDescription>ตั้งชื่อและรายละเอียดสำหรับโปรเจกต์ใหม่</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>ชื่อ Project</Label>
              <Input
                placeholder="เช่น ระบบจองห้องสมุด"
                className="rounded-xl"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>รายละเอียด</Label>
              <Textarea
                placeholder="อธิบายสั้นๆ เกี่ยวกับโปรเจกต์..."
                className="rounded-xl resize-none"
                rows={3}
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              />
            </div>
            <Button
              className="w-full rounded-xl bg-primary text-primary-foreground"
              onClick={handleCreateProject}
              disabled={isCreatingProject || !newProject.name.trim()}
            >
              {isCreatingProject ? "กำลังสร้าง..." : "สร้าง Project Space"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Task Dialog */}
      <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
        <DialogContent className="rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> เพิ่ม Task ใหม่
            </DialogTitle>
            <DialogDescription>สร้าง task ใหม่สำหรับ {activeSpace.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>ชื่อ Task</Label>
              <Input placeholder="เช่น ออกแบบ wireframe หน้าหลัก" className="rounded-xl" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>รายละเอียด</Label>
              <Textarea placeholder="อธิบายรายละเอียดของ task..." className="rounded-xl resize-none" rows={3} value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>มอบหมายให้</Label>
              <Select value={newTask.assignee} onValueChange={(v) => setNewTask({ ...newTask, assignee: v })}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="เลือกสมาชิก" /></SelectTrigger>
                <SelectContent>
                  {activeSpace.members.map((m) => (
                    <SelectItem key={m.avatar} value={m.avatar}>{m.name} ({m.role})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tags (คั่นด้วย comma)</Label>
              <Input placeholder="เช่น Design, Frontend" className="rounded-xl" value={newTask.tags} onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })} />
            </div>
            <Button className="w-full rounded-xl bg-primary text-primary-foreground" onClick={handleAddTask}>สร้าง Task</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Task Review Dialog */}
      <Dialog open={showAITaskReview} onOpenChange={setShowAITaskReview}>
        <DialogContent className="rounded-2xl sm:max-w-xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> AI แนะนำ Task
            </DialogTitle>
            <DialogDescription>เลือก Task ที่ต้องการเพิ่มเข้าโปรเจกต์ของคุณ</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-3 py-4 pr-1">
            {aiSuggestedTasks.map((task) => (
              <button
                key={task.id}
                onClick={() => {
                  const newSet = new Set(selectedTaskIds);
                  if (newSet.has(task.id)) newSet.delete(task.id);
                  else newSet.add(task.id);
                  setSelectedTaskIds(newSet);
                }}
                className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                  selectedTaskIds.has(task.id) 
                    ? "border-primary bg-primary/5" 
                    : "border-border/60 hover:border-primary/40 bg-card"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground leading-tight">{task.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 mb-2">{task.description}</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {task.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="rounded-md px-1.5 py-0 text-[10px]">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className={`mt-0.5 min-w-[20px] h-5 rounded border-2 flex items-center justify-center transition-colors shadow-sm ${selectedTaskIds.has(task.id) ? "bg-primary border-primary" : "border-muted-foreground/30 bg-card"}`}>
                    {selectedTaskIds.has(task.id) && <Check className="w-3.5 h-3.5 text-primary-foreground stroke-[3]" />}
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => setShowAITaskReview(false)} className="rounded-xl">ยกเลิก</Button>
            <Button onClick={confirmAiTasks} className="rounded-xl bg-primary text-primary-foreground" disabled={selectedTaskIds.size === 0}>
              เพิ่ม {selectedTaskIds.size} Task ลง To Do
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Chat Dialog */}
      <Dialog open={showAIChat} onOpenChange={setShowAIChat}>
        <DialogContent className="flex h-[70vh] max-h-[600px] flex-col rounded-2xl sm:max-w-lg p-0">
          <DialogHeader className="border-b border-border p-4">
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              AI คู่คิด — {activeSpace.name}
            </DialogTitle>
            <DialogDescription>ถามอะไรก็ได้เกี่ยวกับโปรเจกต์ เช่น ช่วยคิดหัวข้อ แบ่งงาน หรือแนะนำเทคนิค</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <Avatar className="h-7 w-7 flex-shrink-0">
                  <AvatarFallback className={`text-[10px] font-semibold ${msg.role === "assistant" ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"}`}>
                    {msg.role === "assistant" ? "AI" : "คุณ"}
                  </AvatarFallback>
                </Avatar>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line ${
                  msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-md" : "bg-accent text-accent-foreground rounded-tl-md"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="border-t border-border p-4">
            <form onSubmit={(e) => { e.preventDefault(); handleSendChat(); }} className="flex gap-2">
              <Input placeholder="ถาม AI เกี่ยวกับโปรเจกต์..." className="flex-1 rounded-xl" value={chatInput} onChange={(e) => setChatInput(e.target.value)} />
              <Button type="submit" size="icon" className="rounded-xl bg-primary text-primary-foreground">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Projects;
