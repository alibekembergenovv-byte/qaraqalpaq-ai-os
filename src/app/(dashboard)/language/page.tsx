"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Languages, Plus, Save, Trash2, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

export default function LanguagePage() {
  const dictionary = [
    { en: "Artificial Intelligence", qq: "Jasalma intellekt", desc: "Tiykarǵı termin" },
    { en: "Machine Learning", qq: "Mashinalıq úyreniw", desc: "" },
    { en: "Prompt", qq: "Prompt (yaki Buyrıq)", desc: "Qıstırma túrinde túsindirme beriw" },
    { en: "Automation", qq: "Avtomatlastırıw", desc: "" },
    { en: "API", qq: "API", desc: "Awdarılmaydı" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Словарь и Термины</h1>
          <p className="text-muted-foreground">
            Управляйте базой терминов, чтобы ИИ переводил IT-слова правильно на каракалпакский язык.
          </p>
        </div>
        <Button onClick={() => toast.info("Добавление", { description: "Открытие модального окна..." })}><Plus className="h-4 w-4 mr-2" /> Добавить Термин</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Languages className="h-5 w-5 text-primary" /> База данных перевода</CardTitle>
          <CardDescription>ИИ будет строго следовать этим правилам при генерации.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Английский</TableHead>
                <TableHead>Каракалпакский</TableHead>
                <TableHead>Примечание</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dictionary.map((item, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{item.en}</TableCell>
                  <TableCell className="text-primary font-medium">{item.qq}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{item.desc}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => toast.info("Редактировать", { description: "Открытие редактора..." })}><Edit className="h-4 w-4 text-muted-foreground" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => toast.error("Удалено", { description: "Термин удален из базы." })}><Trash2 className="h-4 w-4 text-red-500" /></Button>
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
