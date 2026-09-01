import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, BarChart, Activity, Users, Eye, MessageSquare } from "lucide-react";

const metrics = [
  { title: "Всего просмотров", value: "14,242", icon: Eye, trend: "+21% за этот месяц" },
  { title: "Уникальные читатели", value: "3,892", icon: Users, trend: "+14% за этот месяц" },
  { title: "Вовлеченность (Лайки/Шеры)", value: "842", icon: Activity, trend: "+32% за этот месяц" },
  { title: "Опубликовано постов", value: "124", icon: MessageSquare, trend: "Стабильно" },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Аналитика и Эффективность</h1>
        <p className="text-muted-foreground">
          Отслеживайте, как ваш контент, сгенерированный ИИ, работает в Telegram.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-green-500 font-medium">
                {metric.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><LineChart className="w-5 h-5"/> Рост аудитории Telegram</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-md m-4 text-muted-foreground">
            График: Подписчики за последние 30 дней
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart className="w-5 h-5"/> Топ Форматы Контента</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Новости ИИ (BREAKING)</span>
                <span className="font-bold">45%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[45%]" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Инструменты и Туториалы (HOW-TO)</span>
                <span className="font-bold">30%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[30%]" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Аналитика и Мнения</span>
                <span className="font-bold">15%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[15%]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
