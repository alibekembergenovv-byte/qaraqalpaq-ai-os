"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus, Save } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function PromptsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Промпты</h1>
          <p className="text-muted-foreground">
            Настройте системные промпты для агентов, чтобы изменить стиль и качество генерации.
          </p>
        </div>
        <Button onClick={() => toast.info("Создание", { description: "Открытие формы нового промпта..." })}><Plus className="h-4 w-4 mr-2" /> Добавить Промпт</Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary" /> Writer Agent (Главный Промпт)</CardTitle>
            <CardDescription>Используется для перевода и написания постов.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Системный Промпт (System Prompt)</label>
              <Textarea 
                rows={5} 
                defaultValue="You are an expert tech blogger for a Qaraqalpaq AI channel. Translate and summarize the following English news into a highly engaging, professional Qaraqalpaq Telegram post. Tone: Confident, practical, analytical. Use modern internet terminology but avoid excessive Russian loanwords (use Qaraqalpaq where natural). Use markdown (bold, bullet points, emojis). Add a clear Call-to-Action at the end."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Формат пользовательского ввода (User Prompt)</label>
              <Input defaultValue="Title: {title}, Summary: {summary}, URL: {url}" />
            </div>
            <Button onClick={() => toast.success("Сохранено", { description: "Промпт успешно обновлен." })}><Save className="h-4 w-4 mr-2" /> Сохранить изменения</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
