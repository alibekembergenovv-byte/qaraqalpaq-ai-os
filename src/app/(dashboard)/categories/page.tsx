"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tags, Plus, Trash2, Edit } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function CategoriesPage() {
  const categories = [
    { name: "ИИ Модели", slug: "ai-models", color: "bg-blue-500/10 text-blue-600" },
    { name: "ИИ Инструменты", slug: "ai-tools", color: "bg-purple-500/10 text-purple-600" },
    { name: "Программирование", slug: "programming", color: "bg-orange-500/10 text-orange-600" },
    { name: "Дизайн и UI/UX", slug: "design", color: "bg-pink-500/10 text-pink-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Категории</h1>
          <p className="text-muted-foreground">
            Разделяйте контент на категории для удобной аналитики и публикации.
          </p>
        </div>
        <Button onClick={() => toast.info("Добавление", { description: "Открытие формы..." })}><Plus className="h-4 w-4 mr-2" /> Добавить Категорию</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Tags className="h-5 w-5 text-primary" /> Все категории</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Метка</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((item, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground">{item.slug}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={item.color}>{item.name}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => toast.info("Редактировать")}><Edit className="h-4 w-4 text-muted-foreground" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => toast.error("Удалено")}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
