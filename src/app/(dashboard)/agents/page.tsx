import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Settings2, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const agents = [
  { name: "Curator Agent", purpose: "Отбирает лучшие новости из RSS", model: "gemini-1.5-flash", status: "Активен" },
  { name: "Writer Agent", purpose: "Переводит и пишет посты на каракалпакском", model: "gemini-1.5-pro", status: "Активен" },
  { name: "Fact Checker", purpose: "Проверяет достоверность фактов", model: "gemini-1.5-flash", status: "Активен" },
];

export default function AgentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ИИ-Агенты</h1>
          <p className="text-muted-foreground">
            Управляйте моделями ИИ, которые автоматизируют вашу работу.
          </p>
        </div>
        <Button>Создать Агента</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent, index) => (
          <Card key={index} className="flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-primary" />
                  {agent.name}
                </CardTitle>
                <p className="text-xs text-muted-foreground">{agent.purpose}</p>
              </div>
              <Badge variant="outline" className="bg-green-500/10 text-green-600">{agent.status}</Badge>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-end gap-4 mt-4">
              <div className="text-sm border rounded-md p-2 bg-muted/30">
                <span className="text-muted-foreground">Модель:</span> <span className="font-medium">{agent.model}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" size="sm"><Settings2 className="w-4 h-4 mr-2"/> Настройки</Button>
                <Button variant="outline" className="text-red-500 hover:text-red-600" size="icon"><Power className="w-4 h-4"/></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
