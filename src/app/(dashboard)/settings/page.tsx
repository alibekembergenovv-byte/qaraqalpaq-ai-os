"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Loader2, Key, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Настройки сохранены", {
        description: "Ваши изменения были успешно сохранены.",
      });
    }, 1000);
  };

  const toggleShowKey = (id: string) => {
    setShowKey((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Настройки</h1>
        <p className="text-muted-foreground">
          Управляйте тоном бренда, правилами автоматизации и конфигурацией платформы.
        </p>
      </div>

      <Tabs defaultValue="brand" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="brand">Голос Бренда</TabsTrigger>
          <TabsTrigger value="automation">Правила автоматизации</TabsTrigger>
          <TabsTrigger value="api">API Ключи</TabsTrigger>
        </TabsList>
        
        <TabsContent value="brand" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Персональный Голос Бренда</CardTitle>
              <CardDescription>
                Настройте, как ИИ будет писать и форматировать каракалпакский текст.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Имя бренда</Label>
                  <Input defaultValue="Embergenov AI Assistant" />
                </div>
                <div className="space-y-2">
                  <Label>Имя автора</Label>
                  <Input defaultValue="Alibek Embergenov" />
                </div>
                <div className="space-y-2">
                  <Label>Тон (Tone of voice)</Label>
                  <Input defaultValue="confident, practical, analytical" />
                </div>
                <div className="space-y-2">
                  <Label>Целевая аудитория</Label>
                  <Input defaultValue="entrepreneurs, students, IT specialists" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Стиль письма</Label>
                <Textarea defaultValue="technology-focused, simple explanations, direct opinions, real-world examples" rows={3} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Предпочтительные слова</Label>
                  <Textarea defaultValue="innovaciya, intellekt, algoritm, tásir" />
                </div>
                <div className="space-y-2">
                  <Label>Запрещенные слова</Label>
                  <Textarea defaultValue="ruscha/kalkovka sózler, o'ta quramalı ilimiy terminler" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Коронная фраза (Signature Phrase)</Label>
                  <Input defaultValue="Biz benen birge rawajlanıń!" />
                </div>
                <div className="space-y-2">
                  <Label>Стиль призыва к действию (CTA)</Label>
                  <Input defaultValue="Soraw yamasa pikirler ushın" />
                </div>
              </div>
              <Button className="mt-4" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2"/>}
                Сохранить настройки бренда
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Правила автоматизации</CardTitle>
              <CardDescription>Настройте логику публикации постов в Telegram.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Режим публикации</Label>
                <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <option value="MANUAL">ВРУЧНУЮ (Все посты требуют ручного одобрения)</option>
                  <option value="SEMI">ПОЛУАВТОМАТ. (Публиковать, если балл ИИ &gt; 90)</option>
                  <option value="FULL">АВТОМАТИЧЕСКИ (Публиковать всё немедленно)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Частота проверки RSS (в минутах)</Label>
                <Input type="number" defaultValue="60" />
              </div>

              <div className="space-y-2">
                <Label>Макс. постов в день</Label>
                <Input type="number" defaultValue="5" />
              </div>

              <Button className="mt-4" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2"/>}
                Сохранить автоматизацию
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Key className="h-5 w-5 text-primary" /> API Ключи интеграций</CardTitle>
              <CardDescription>Управляйте ключами доступа к ИИ-моделям и Telegram.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="space-y-2">
                <Label className="flex justify-between">
                  <span>OpenAI API Key (ChatGPT)</span>
                  <span className="text-green-600 text-xs flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Активен</span>
                </Label>
                <div className="relative">
                  <Input 
                    type={showKey["openai"] ? "text" : "password"} 
                    defaultValue="sk-proj-YOUR_OPENAI_KEY" 
                    className="pr-10 font-mono"
                  />
                  <Button variant="ghost" size="icon" className="absolute right-1 top-1 h-8 w-8 text-muted-foreground" onClick={() => toggleShowKey("openai")}>
                    {showKey["openai"] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex justify-between">
                  <span>Anthropic API Key (Claude)</span>
                  <span className="text-green-600 text-xs flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Активен</span>
                </Label>
                <div className="relative">
                  <Input 
                    type={showKey["claude"] ? "text" : "password"} 
                    defaultValue="sk-ant-YOUR_CLAUDE_KEY" 
                    className="pr-10 font-mono"
                  />
                  <Button variant="ghost" size="icon" className="absolute right-1 top-1 h-8 w-8 text-muted-foreground" onClick={() => toggleShowKey("claude")}>
                    {showKey["claude"] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex justify-between">
                  <span>Google Gemini API Key</span>
                  <span className="text-muted-foreground text-xs">Не используется</span>
                </Label>
                <div className="relative">
                  <Input 
                    type={showKey["gemini"] ? "text" : "password"} 
                    defaultValue="AQ.YOUR_GEMINI_KEY" 
                    className="pr-10 font-mono"
                  />
                  <Button variant="ghost" size="icon" className="absolute right-1 top-1 h-8 w-8 text-muted-foreground" onClick={() => toggleShowKey("gemini")}>
                    {showKey["gemini"] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button className="mt-4" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2"/>}
                Сохранить API Ключи
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
