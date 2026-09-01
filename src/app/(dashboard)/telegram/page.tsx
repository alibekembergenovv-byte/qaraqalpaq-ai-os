"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function TelegramPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [formData, setFormData] = useState({
    token: "8445867380:AAGqTcmlV5hDRvWXa4nv_GLOnx_rWB55Eag",
    channelId: "@alibek_embergenov",
    adminId: "770608643"
  });
  const [savedData, setSavedData] = useState({
    token: "8445867380:AAGqTcmlV5hDRvWXa4nv_GLOnx_rWB55Eag",
    channelId: "@alibek_embergenov",
    adminId: "770608643"
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSavedData(formData);
      toast.success("Настройки сохранены", {
        description: "Конфигурация Telegram бота успешно обновлена.",
      });
    }, 1000);
  };

  const handleTest = async () => {
    if (!savedData.token) {
      toast.error("Ошибка", { description: "Сначала сохраните токен бота." });
      return;
    }
    
    setIsTesting(true);
    
    try {
      const response = await fetch(`https://api.telegram.org/bot${savedData.token}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: savedData.channelId || savedData.adminId,
          text: "👋 Привет! Это тестовое сообщение от **Embergenov AI Assistant**.\n\nИнтеграция работает успешно! 🚀",
          parse_mode: "Markdown"
        })
      });

      const data = await response.json();

      if (data.ok) {
        toast.success("Сообщение отправлено", {
          description: "Тестовое сообщение успешно доставлено в Telegram.",
        });
      } else {
        toast.error("Ошибка отправки", {
          description: data.description || "Не удалось отправить сообщение.",
        });
      }
    } catch (error) {
      toast.error("Ошибка сети", {
        description: "Проверьте подключение к интернету или правильность токена.",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Интеграция Telegram</h1>
        <p className="text-muted-foreground">
          Настройте бота и канал Telegram для автоматической публикации.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Конфигурация бота</CardTitle>
            <CardDescription>
              Введите учетные данные, полученные от BotFather.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Токен бота (Bot Token)</Label>
              <Input 
                type="password" 
                placeholder="1234567890:AAH_xxxxxxxxxxxxx" 
                value={formData.token}
                onChange={(e) => setFormData({...formData, token: e.target.value})}
              />
              <p className="text-xs text-muted-foreground">Храните это в секрете. Никому не передавайте.</p>
            </div>
            <div className="space-y-2">
              <Label>ID Канала или Username</Label>
              <Input 
                placeholder="@qaraqalpaq_ai" 
                value={formData.channelId}
                onChange={(e) => setFormData({...formData, channelId: e.target.value})}
              />
              <p className="text-xs text-muted-foreground">Бот должен быть администратором в этом канале.</p>
            </div>
            <div className="space-y-2">
              <Label>ID Чата Админа (Для одобрения)</Label>
              <Input 
                placeholder="Ваш личный Chat ID" 
                value={formData.adminId}
                onChange={(e) => setFormData({...formData, adminId: e.target.value})}
              />
              <p className="text-xs text-muted-foreground">Сюда бот будет присылать посты на проверку.</p>
            </div>
            <Button className="w-full" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2"/>}
              Сохранить настройки Telegram
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Тест соединения</CardTitle>
            <CardDescription>
              Отправьте тестовое сообщение в ваш канал для проверки.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-md border text-sm text-center">
              Статус соединения: <span className={savedData.token ? "text-green-500 font-bold" : "text-yellow-500 font-bold"}>
                {savedData.token ? "Подключено" : "Ожидание токена"}
              </span>
              <p className="text-muted-foreground text-xs mt-1">
                Канал: {savedData.channelId || "Не указан"}
              </p>
            </div>
            <Button variant="secondary" className="w-full" onClick={handleTest} disabled={isTesting}>
              {isTesting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Отправить тестовое сообщение
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
