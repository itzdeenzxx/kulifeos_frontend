import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { TeacherLayout } from "@/components/teacher/TeacherLayout";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/MotionWrappers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Users, Brain, QrCode, ArrowLeft, CheckCircle, Clock, Trash2, UserPlus, FolderKanban, Circle, CheckCircle2 } from "lucide-react";
import { useTeacherActivities, useTeacherStudents, useProjectSpaces } from "@/lib/db";
import { ClassroomQRDialog } from "@/components/teacher/ClassroomQRDialog";
import { motion } from "framer-motion";

const bannerColors = [
  "from-[hsl(153,100%,20%)] to-[hsl(153,80%,30%)]",
  "from-[hsl(200,80%,40%)] to-[hsl(200,60%,50%)]",
  "from-[hsl(280,60%,45%)] to-[hsl(280,40%,55%)]",
  "from-[hsl(30,80%,50%)] to-[hsl(30,60%,55%)]",
];

const ClassroomDetail = () => {
  const { data: teacherActivities = [] } = useTeacherActivities();
  const { data: teacherStudents = [] } = useTeacherStudents();
  const { data: myProjectSpaces = [] } = useProjectSpaces();

  const { classroomId } = useParams();
  const [qrOpen, setQrOpen] = useState(false);

  const classroom = teacherActivities.find((a) => a.id === Number(classroomId));

  if (!classroom) {
    return (
      <TeacherLayout>
        <div className="py-20 text-center">
          <p className="text-lg font-semibold text-foreground">ไม่พบ Classroom นี้</p>
          <Link to="/teacher"><Button variant="outline" className="mt-4 rounded-xl">กลับ</Button></Link>
        </div>
      </TeacherLayout>
    );
  }

  const colorIdx = (classroom.id - 1) % bannerColors.length;
  const groupSpaces = myProjectSpaces.filter((s) => s.classroomId === classroom.id);

  return (
    <TeacherLayout>
      <PageTransition>
        {/* Banner - works for both mobile & desktop */}
        <div className={`-mx-4 -mt-4 mb-5 rounded-b-3xl bg-gradient-to-br ${bannerColors[colorIdx]} p-5 md:-mx-8 md:-mt-8 md:mb-6 md:p-8 md:rounded-b-2xl`}>
          <Link to="/teacher" className="mb-2 inline-flex items-center gap-1.5 text-[13px] text-white/70 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" /> กลับ
          </Link>
          <h1 className="text-xl font-bold text-white md:text-3xl">{classroom.name}</h1>
          <p className="mt-0.5 text-[12px] text-white/60 md:text-sm md:text-white/70">สร้างเมื่อ {classroom.createdAt}</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            <Badge className="rounded-full bg-white/20 text-white border-0 px-3 py-1 text-[11px] backdrop-blur-sm">
              <Users className="mr-1 h-3 w-3" /> {classroom.students} นิสิต
            </Badge>
            {classroom.status === "grouped" ? (
              <Badge className="rounded-full bg-white/20 text-white border-0 px-3 py-1 text-[11px] backdrop-blur-sm">
                <CheckCircle className="mr-1 h-3 w-3" /> จัดกลุ่มแล้ว ({classroom.groups} กลุ่ม)
              </Badge>
            ) : (
              <Badge className="rounded-full bg-white/20 text-white border-0 px-3 py-1 text-[11px] backdrop-blur-sm">
                <Clock className="mr-1 h-3 w-3" /> รอจัดกลุ่ม
              </Badge>
            )}
          </div>
        </div>

        {/* Actions - mobile: horizontal scroll, desktop: flex */}
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1 scrollbar-hide md:overflow-visible">
          <Button variant="outline" size="sm" className="gap-2 rounded-xl flex-shrink-0 text-[12px] md:text-xs" onClick={() => setQrOpen(true)}>
            <QrCode className="h-3.5 w-3.5" /> QR Code
          </Button>
          <Button variant="outline" size="sm" className="gap-2 rounded-xl flex-shrink-0 text-[12px] md:text-xs">
            <UserPlus className="h-3.5 w-3.5" /> เพิ่มนิสิต
          </Button>
          {classroom.status === "pending" && (
            <Button size="sm" className="gap-2 rounded-xl bg-primary text-primary-foreground flex-shrink-0 text-[12px] md:text-xs">
              <Brain className="h-3.5 w-3.5" /> AI จัดกลุ่ม
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="students" className="space-y-4">
          <TabsList className="rounded-xl bg-accent/50 w-full md:w-auto overflow-x-auto">
            <TabsTrigger value="students" className="rounded-lg text-[12px] md:text-sm">นิสิต</TabsTrigger>
            <TabsTrigger value="groups" className="rounded-lg text-[12px] md:text-sm">กลุ่ม</TabsTrigger>
            <TabsTrigger value="progress" className="rounded-lg gap-1 text-[12px] md:text-sm">
              <FolderKanban className="h-3 w-3 md:h-3.5 md:w-3.5" /> งาน
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg text-[12px] md:text-sm">ตั้งค่า</TabsTrigger>
          </TabsList>

          {/* Students Tab */}
          <TabsContent value="students">
            {/* Mobile: Card list */}
            <div className="md:hidden space-y-2">
              {teacherStudents.map((student, i) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <div className="flex items-center gap-3 rounded-2xl border border-border/50 bg-card p-3.5">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{student.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-foreground">{student.name}</p>
                      <p className="text-[11px] text-muted-foreground">{student.faculty}</p>
                      <div className="mt-1 flex gap-1">
                        {student.skills.map((s) => (
                          <Badge key={s} variant="secondary" className="rounded-full bg-accent text-accent-foreground border-0 px-1.5 py-0 text-[9px]">{s}</Badge>
                        ))}
                      </div>
                    </div>
                    <Badge className="rounded-full bg-primary/10 text-primary border-0 px-2.5 py-0.5 text-[10px] font-bold flex-shrink-0">{student.group}</Badge>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Desktop: Table */}
            <div className="hidden md:block">
              <StaggerItem>
                <Card className="rounded-2xl border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between text-base">
                      <span className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" /> รายชื่อนิสิต
                      </span>
                      <span className="text-sm font-normal text-muted-foreground">{teacherStudents.length} คน</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>นิสิต</TableHead>
                          <TableHead>คณะ</TableHead>
                          <TableHead>ทักษะ</TableHead>
                          <TableHead>กลุ่ม</TableHead>
                          <TableHead className="w-10"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teacherStudents.map((student, i) => (
                          <motion.tr
                            key={student.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04, duration: 0.3 }}
                            className="border-b transition-colors hover:bg-muted/50"
                          >
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{student.avatar}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-foreground">{student.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{student.faculty}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {student.skills.map((s) => (
                                  <Badge key={s} variant="secondary" className="rounded-full bg-accent text-accent-foreground border-0 px-2 py-0.5 text-[10px]">{s}</Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className="rounded-full bg-primary/10 text-primary border-0 px-3 py-0.5 text-xs font-semibold">{student.group}</Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </StaggerItem>
            </div>
          </TabsContent>

          {/* Groups Tab */}
          <TabsContent value="groups">
            <StaggerContainer className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {["A1", "A2", "A3"].map((group) => {
                const members = teacherStudents.filter((s) => s.group === group);
                return (
                  <StaggerItem key={group}>
                    <Card className="rounded-2xl border-border/50">
                      <CardContent className="p-4 md:p-5">
                        <div className="mb-3 flex items-center justify-between">
                          <h3 className="text-[15px] font-bold text-foreground md:text-base">กลุ่ม {group}</h3>
                          <Badge className="rounded-full bg-accent text-accent-foreground border-0 px-2.5 py-0.5 text-xs">
                            {members.length} คน
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          {members.map((m) => (
                            <div key={m.id} className="flex items-center gap-2">
                              <Avatar className="h-7 w-7">
                                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">{m.avatar}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-[13px] font-medium text-foreground md:text-sm">{m.name}</p>
                                <p className="text-[10px] text-muted-foreground">{m.skills.join(", ")}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress">
            <StaggerContainer className="space-y-4 md:space-y-6">
              {groupSpaces.length === 0 ? (
                <StaggerItem>
                  <Card className="rounded-2xl border-border/50">
                    <CardContent className="py-12 text-center">
                      <FolderKanban className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">ยังไม่มีกลุ่มที่มี Task ในระบบ</p>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ) : (
                groupSpaces.map((space) => {
                  const total = space.tasks.length;
                  const done = space.tasks.filter((t) => t.status === "done").length;
                  const inProg = space.tasks.filter((t) => t.status === "inProgress").length;
                  const todo = space.tasks.filter((t) => t.status === "todo").length;
                  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

                  return (
                    <StaggerItem key={space.id}>
                      <Card className="rounded-2xl border-border/50">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-[14px] md:text-base flex items-center gap-2">
                                <Badge className="rounded-full bg-primary/10 text-primary border-0 px-2.5 py-0.5 text-[11px] font-bold">
                                  {space.groupName}
                                </Badge>
                                {space.name}
                              </CardTitle>
                              <p className="mt-1 text-[11px] text-muted-foreground">{space.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-primary md:text-2xl">{pct}%</p>
                              <p className="text-[10px] text-muted-foreground">เสร็จแล้ว</p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3 md:space-y-4">
                          <Progress value={pct} className="h-2 bg-accent [&>div]:bg-primary md:h-2.5" />
                          <div className="flex gap-3 md:gap-4 text-[11px] md:text-xs">
                            <div className="flex items-center gap-1.5">
                              <Circle className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">To Do: {todo}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3 w-3 text-amber-500" />
                              <span className="text-muted-foreground">กำลังทำ: {inProg}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 className="h-3 w-3 text-primary" />
                              <span className="text-muted-foreground">เสร็จ: {done}</span>
                            </div>
                          </div>
                          <div className="space-y-1.5 md:space-y-2">
                            {space.tasks.map((task, i) => (
                              <motion.div
                                key={task.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04, duration: 0.25 }}
                                className="flex items-center gap-2.5 rounded-xl bg-accent/30 px-3 py-2"
                              >
                                {task.status === "done" ? (
                                  <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0 md:h-4 md:w-4" />
                                ) : task.status === "inProgress" ? (
                                  <Clock className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 md:h-4 md:w-4" />
                                ) : (
                                  <Circle className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 md:h-4 md:w-4" />
                                )}
                                <p className={`flex-1 min-w-0 text-[12px] md:text-sm ${task.status === "done" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                                  {task.title}
                                </p>
                                <Avatar className="h-5 w-5 flex-shrink-0">
                                  <AvatarFallback className="bg-primary/10 text-primary text-[8px] font-semibold">{task.assignee}</AvatarFallback>
                                </Avatar>
                              </motion.div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </StaggerItem>
                  );
                })
              )}
            </StaggerContainer>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <StaggerItem>
              <Card className="rounded-2xl border-border/50">
                <CardContent className="space-y-4 p-4 md:p-6">
                  <div>
                    <p className="text-[13px] font-medium text-foreground md:text-sm">ทักษะที่ต้องการในแต่ละกลุ่ม</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {classroom.requirements.map((r) => (
                        <Badge key={r} className="rounded-full bg-accent text-accent-foreground border-0 px-3 py-1 text-xs">{r}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-foreground md:text-sm">สถานะ</p>
                    <p className="text-[12px] text-muted-foreground md:text-sm">{classroom.status === "grouped" ? "จัดกลุ่มเรียบร้อยแล้ว" : "รอจัดกลุ่ม"}</p>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          </TabsContent>
        </Tabs>
      </PageTransition>

      <ClassroomQRDialog
        open={qrOpen}
        onOpenChange={setQrOpen}
        classroom={{ id: classroom.id, name: classroom.name }}
      />
    </TeacherLayout>
  );
};

export default ClassroomDetail;
