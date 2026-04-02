import { useState, useRef } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Sparkles, ArrowRight, Save, Trash2, Plus } from "lucide-react";
import { extractTextFromPDF, getPdfFirstPageAsImage } from "@/lib/pdfExtractor";
import { analyzeResumeWithAI, cleanResumeText } from "@/lib/aiAnalyze";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

const UploadResume = () => {
  const { authUser } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [progress, setProgress] = useState(0);
  
  const [showForm, setShowForm] = useState(false);
  const [resumeData, setResumeData] = useState({
    name: "",
    email: "",
    phone: "",
    skills: [] as string[],
    education: [] as any[],
    experience: [] as any[]
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file) return;
    
    setLoading(true);
    setShowForm(false);
    setProgress(10);
    setStatusText("กำลังอ่านไฟล์...");

    try {
      const isPdf = file.type === "application/pdf";
      const isTxt = file.type === "text/plain";
      const isImg = file.type.startsWith("image/");
      
      let parsedData = null;

      if (isPdf) {
        setProgress(30);
        setStatusText("กำลังแยกเอกสาร (PDF OCR)...");
        const text = cleanResumeText(await extractTextFromPDF(file));
        
        if (text && text.trim().length > 120) {
          setProgress(60);
          setStatusText("กำลังส่งให้ AI (Gemma 3N) จัดรูปแบบข้อมูล...");
          parsedData = await analyzeResumeWithAI({ content: text, mode: "pdfText" });
        } else {
          setProgress(40);
          setStatusText("ไม่พบข้อความ กำลังแปลงเป็นรูปภาพ...");
          const imgBase64 = await getPdfFirstPageAsImage(file);
          setProgress(60);
          setStatusText("กำลังส่งให้ AI (Qwen3-VL) อ่านจากรูปภาพ...");
          parsedData = await analyzeResumeWithAI({ content: imgBase64, mode: "image" });
        }
      } else if (isTxt) {
        setProgress(50);
        const text = cleanResumeText(await file.text());
        setStatusText("กำลังส่งให้ AI (Qwen3-VL) จัดรูปแบบข้อมูล...");
        parsedData = await analyzeResumeWithAI({ content: text, mode: "plainText" });
      } else if (isImg) {
        setProgress(40);
        const imgBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
        setStatusText("กำลังส่งให้ AI (Qwen3-VL) อ่านจากรูปภาพ...");
        parsedData = await analyzeResumeWithAI({ content: imgBase64, mode: "image" });
      } else {
        alert("รองรับเฉพาะ PDF, TXT หรือ รูปภาพเท่านั้น");
        setLoading(false);
        return;
      }
      
      setProgress(90);
      setStatusText("จัดเตรียมข้อมูลเสร็จสิ้น...");
      
      setResumeData({
        name: parsedData?.name || "",
        email: parsedData?.email || "",
        phone: parsedData?.phone || "",
        skills: Array.isArray(parsedData?.skills) ? parsedData.skills : [],
        education: Array.isArray(parsedData?.education) ? parsedData.education : [],
        experience: Array.isArray(parsedData?.experience) ? parsedData.experience : []
      });
      
      setProgress(100);

      if (authUser) {
        await updateDoc(doc(db, "users", authUser.uid), {
          resumeExtraction: {
            fileName: file.name,
            fileType: file.type,
            parsedJson: parsedData,
            updatedAt: Date.now(),
          },
          updatedAt: Date.now(),
        });
      }

      setTimeout(() => {
        setShowForm(true);
        setLoading(false);
      }, 500);

    } catch (err: any) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการประมวลผล: " + err.message);
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <AppLayout title="Upload & Analyze">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="mb-2">
          <h2 className="text-2xl font-bold text-foreground">อัปโหลด Resume & Profile <FileText className="h-6 w-6 inline ml-2 text-primary" /></h2>
          <p className="text-muted-foreground">ให้ AI ดึงข้อมูลอัตโนมัติจากไฟล์ PDF, TXT หรือรูปภาพ เพื่อลดการกรอกด้วยตนเอง</p>
        </div>

        {/* Upload Area */}
        <Card className="rounded-2xl border-border/50">
          <CardContent className="p-6">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".pdf,.txt,image/*" 
              onChange={handleFileSelect} 
            />
            <div
              className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-colors duration-200 ${
                isDragging ? "border-primary bg-accent/50" : "border-border/50 bg-muted/30"
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-1 text-lg font-semibold text-foreground">ลากไฟล์มาวางที่นี่ หรือคลิกเพื่ออัปโหลด</h3>
              <p className="mb-4 text-sm text-muted-foreground">รองรับ PDF, TXT, Image — ทันทีด้วยพลัง AI</p>
              <div className="flex gap-3">
                <Button 
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={loading}
                  className="gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      กำลังวิเคราะห์...
                    </span>
                  ) : (
                    <>
                      <FileText className="h-4 w-4" /> เลือกไฟล์ Resume
                    </>
                  )}
                </Button>
              </div>
              
              {loading && (
                <div className="mt-8 w-full max-w-sm space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{statusText}</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2 w-full bg-accent [&>div]:bg-primary" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {showForm && (
          <Card className="rounded-2xl border-border/50">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-primary" /> 
                ข้อมูลที่ AI วิเคราะห์ได้ (โปรดตรวจสอบและแก้ไข)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              
              {/* Basic Info */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1.5">
                  <Label>ชื่อ - นามสกุล</Label>
                  <Input 
                    value={resumeData.name} 
                    onChange={(e) => setResumeData({...resumeData, name: e.target.value})} 
                    placeholder="เว้นว่างไว้..ถ้าไม่มี"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>อีเมล</Label>
                  <Input 
                    value={resumeData.email} 
                    onChange={(e) => setResumeData({...resumeData, email: e.target.value})} 
                    placeholder="เว้นว่างไว้..ถ้าไม่มี"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>เบอร์โทรศัพท์</Label>
                  <Input 
                    value={resumeData.phone} 
                    onChange={(e) => setResumeData({...resumeData, phone: e.target.value})} 
                    placeholder="เว้นว่างไว้..ถ้าไม่มี"
                  />
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">ทักษะความสามารถ (Skills)</Label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setResumeData({...resumeData, skills: [...resumeData.skills, ""]})}
                    className="h-8 gap-1.5 text-xs"
                  >
                    <Plus className="h-3.5 w-3.5" /> เพิ่ม
                  </Button>
                </div>
                {resumeData.skills.length === 0 && <p className="text-sm text-muted-foreground italic">ไม่พบข้อมูล (คุณสามารถเพิ่มได้เอง)</p>}
                <div className="flex flex-wrap gap-2">
                  {resumeData.skills.map((skill, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 rounded-full border border-border bg-background py-1 pl-3 pr-1.5">
                      <input 
                        className="w-24 bg-transparent text-sm focus:outline-none focus:ring-0"
                        value={skill}
                        onChange={(e) => {
                          const newSkills = [...resumeData.skills];
                          newSkills[idx] = e.target.value;
                          setResumeData({...resumeData, skills: newSkills});
                        }}
                      />
                      <button 
                        onClick={() => {
                          const newSkills = resumeData.skills.filter((_, i) => i !== idx);
                          setResumeData({...resumeData, skills: newSkills});
                        }}
                        className="rounded-full p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">ประวัติการศึกษา (Education)</Label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setResumeData({...resumeData, education: [...resumeData.education, { degree: "", field: "", institution: "" }]})}
                    className="h-8 gap-1.5 text-xs"
                  >
                    <Plus className="h-3.5 w-3.5" /> เพิ่ม
                  </Button>
                </div>
                {resumeData.education.length === 0 && <p className="text-sm text-muted-foreground italic">ไม่พบข้อมูล</p>}
                
                <div className="grid gap-4 md:grid-cols-2">
                  {resumeData.education.map((edu, idx) => (
                    <Card key={idx} className="bg-accent/20">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-end">
                           <button 
                              onClick={() => {
                                const newEdu = resumeData.education.filter((_, i) => i !== idx);
                                setResumeData({...resumeData, education: newEdu});
                              }}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">สถาบัน</Label>
                          <Input 
                            value={edu.institution || ""} 
                            onChange={(e) => {
                               const newEdu = [...resumeData.education];
                               newEdu[idx].institution = e.target.value;
                               setResumeData({...resumeData, education: newEdu});
                            }} 
                            placeholder="เช่น Kasetsart University"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">วุฒิ/คณะ/ภาควิชา</Label>
                          <Input 
                            value={(edu.degree || "") + " " + (edu.field || "")} 
                            onChange={(e) => {
                               const newEdu = [...resumeData.education];
                               newEdu[idx].degree = e.target.value;
                               newEdu[idx].field = "";
                               setResumeData({...resumeData, education: newEdu});
                            }} 
                            placeholder="เช่น B.S. Computer Engineering"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">ประสบการณ์ (Experience / Projects)</Label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setResumeData({...resumeData, experience: [...resumeData.experience, { title: "", company: "", description: "" }]})}
                    className="h-8 gap-1.5 text-xs"
                  >
                    <Plus className="h-3.5 w-3.5" /> เพิ่ม
                  </Button>
                </div>
                {resumeData.experience.length === 0 && <p className="text-sm text-muted-foreground italic">ไม่พบข้อมูล</p>}
                
                <div className="flex flex-col gap-4">
                  {resumeData.experience.map((exp, idx) => (
                    <Card key={idx} className="bg-accent/20">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-end">
                           <button 
                              onClick={() => {
                                const newExp = resumeData.experience.filter((_, i) => i !== idx);
                                setResumeData({...resumeData, experience: newExp});
                              }}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                           <div className="space-y-1">
                            <Label className="text-xs">ตำแหน่ง / บทบาท</Label>
                            <Input 
                              value={exp.title || ""} 
                              onChange={(e) => {
                                 const newExp = [...resumeData.experience];
                                 newExp[idx].title = e.target.value;
                                 setResumeData({...resumeData, experience: newExp});
                              }} 
                              placeholder="เช่น Frontend Developer"
                            />
                           </div>
                           <div className="space-y-1">
                            <Label className="text-xs">องค์กร / ค่าย / งาน</Label>
                            <Input 
                              value={exp.company || ""} 
                              onChange={(e) => {
                                 const newExp = [...resumeData.experience];
                                 newExp[idx].company = e.target.value;
                                 setResumeData({...resumeData, experience: newExp});
                              }} 
                              placeholder="เช่น Google, Startup, กีฬาสี"
                            />
                           </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">รายละเอียด</Label>
                          <Textarea 
                            rows={2}
                            value={exp.description || ""} 
                            onChange={(e) => {
                               const newExp = [...resumeData.experience];
                               newExp[idx].description = e.target.value;
                               setResumeData({...resumeData, experience: newExp});
                            }} 
                            placeholder="รายละเอียดงานที่ทำ..."
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

            </CardContent>
            <CardFooter className="border-t bg-muted/20 p-6 flex justify-end gap-3">
               <Button variant="ghost">ข้าม / ยกเลิก</Button>
               <Button
                 className="gap-2"
                 onClick={async () => {
                   if (!authUser) return;
                   await updateDoc(doc(db, "users", authUser.uid), {
                     onboardingData: {
                       firstName: resumeData.name.split(" ")[0] || "",
                       lastName: resumeData.name.split(" ").slice(1).join(" ") || "",
                       selectedSkills: resumeData.skills,
                       experiences: resumeData.experience.map((exp) => ({
                         title: exp.title || "",
                         org: exp.company || "",
                         year: "",
                         desc: exp.description || "",
                       })),
                     },
                     updatedAt: Date.now(),
                   });
                 }}
               >
                  <Save className="h-4 w-4" /> บันทึก Profile
               </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default UploadResume;
