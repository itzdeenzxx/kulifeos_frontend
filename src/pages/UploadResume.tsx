import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { Upload, FileText, CheckCircle, Brain, Sparkles, ArrowRight } from "lucide-react";
import { uploadedDocuments, aiAnalyzedSkills, skillData } from "@/lib/mockData";

const UploadResume = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [showResults, setShowResults] = useState(true);

  return (
    <AppLayout title="Upload & Analyze">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="mb-2">
          <h2 className="text-2xl font-bold text-foreground">รู้จักตัวเองด้วย AI 🧠</h2>
          <p className="text-muted-foreground">อัพโหลด Resume หรือ Transcript แล้วให้ AI วิเคราะห์ Skill ของคุณ</p>
        </div>

        {/* Upload Area */}
        <Card className="rounded-2xl border-border/50">
          <CardContent className="p-6">
            <div
              className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-colors duration-200 ${
                isDragging ? "border-primary bg-accent/50" : "border-border/50 bg-muted/30"
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-1 text-lg font-semibold text-foreground">ลากไฟล์มาวางที่นี่</h3>
              <p className="mb-4 text-sm text-muted-foreground">รองรับ PDF, DOC, DOCX — สูงสุด 10MB</p>
              <div className="flex gap-3">
                <Button className="gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                  <FileText className="h-4 w-4" /> Upload Resume
                </Button>
                <Button variant="outline" className="gap-2 rounded-xl border-primary/20 text-primary hover:bg-accent">
                  <FileText className="h-4 w-4" /> Upload Transcript
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Uploaded Documents */}
        <Card className="rounded-2xl border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-primary" /> Uploaded Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {uploadedDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between rounded-xl border border-border/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.type === "resume" ? "Resume" : "Transcript"} • {doc.uploadedAt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-primary">Analyzed</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AI Analysis Pipeline */}
        <Card className="rounded-2xl border-border/50 bg-accent/30">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">AI Analysis Pipeline</h3>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {["Upload Document", "OCR Scan", "Extract Data", "AI Analysis", "Generate Skills"].map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <div className="flex min-w-max items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground/20 text-[10px]">{i + 1}</span>
                    {step}
                  </div>
                  {i < 4 && <ArrowRight className="h-4 w-4 shrink-0 text-primary/50" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {showResults && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Radar Chart */}
            <Card className="rounded-2xl border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Brain className="h-5 w-5 text-primary" /> Skill Radar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mx-auto h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={skillData}>
                      <PolarGrid stroke="hsl(140 10% 90%)" />
                      <PolarAngleAxis dataKey="skill" tick={{ fill: "hsl(150 5% 45%)", fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Skills" dataKey="value" stroke="hsl(153 100% 20%)" fill="hsl(153 100% 20%)" fillOpacity={0.15} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Analyzed Skills */}
            <Card className="rounded-2xl border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5 text-primary" /> AI-Detected Skills
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {aiAnalyzedSkills.map((item) => (
                  <div key={item.skill}>
                    <div className="mb-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{item.skill}</span>
                        <Badge variant="secondary" className="rounded-full bg-accent text-accent-foreground border-0 px-2 py-0 text-[10px]">
                          {item.source}
                        </Badge>
                      </div>
                      <span className="text-xs font-semibold text-primary">{item.confidence}%</span>
                    </div>
                    <Progress value={item.confidence} className="h-1.5 bg-accent [&>div]:bg-primary" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Generated Tags */}
        {showResults && (
          <Card className="rounded-2xl border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Generated Skill Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {["AI & ML", "Data Analysis", "Python", "Leadership", "Database", "React", "Communication", "Research"].map((tag) => (
                  <Badge key={tag} variant="secondary" className="rounded-full bg-accent text-accent-foreground border-0 px-4 py-1.5 text-sm font-medium transition-colors duration-200 hover:bg-primary hover:text-primary-foreground">
                    {tag}
                  </Badge>
                ))}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                🔄 Tags ถูกสร้างอัตโนมัติจาก AI — คุณสามารถแก้ไขหรือเพิ่มเติมได้ในหน้า Profile
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default UploadResume;
