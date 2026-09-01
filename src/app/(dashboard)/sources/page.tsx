"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Radio, Plus, Trash2, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export default function SourcesPage() {
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState("");
  const [newName, setNewName] = useState("");

  useEffect(() => {
    fetch("/api/sources")
      .then(res => res.json())
      .then(data => setSources(data))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    if (!newUrl || !newName) return toast.error("Заполните все поля");
    const res = await fetch("/api/sources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, url: newUrl, rssUrl: newUrl, credibilityScore: 90 })
    });
    const data = await res.json();
    setSources([data, ...sources]);
    setNewUrl("");
    setNewName("");
    toast.success("Источник добавлен");
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/sources/${id}`, { method: "DELETE" });
    setSources(sources.filter(s => s.id !== id));
    toast.error("Источник удален");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Источники RSS</h1>
          <p className="text-muted-foreground">
            Управляйте источниками, из которых ИИ берет новости.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5" /> Добавить новый источник</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Input placeholder="Название (напр. Medium AI)" value={newName} onChange={e => setNewName(e.target.value)} />
          <Input placeholder="RSS URL (напр. https://medium.com/feed/tag/ai)" value={newUrl} onChange={e => setNewUrl(e.target.value)} />
          <Button onClick={handleAdd}>Добавить</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Radio className="h-5 w-5 text-primary" /> Список источников</CardTitle>
          <CardDescription>Бот сканирует эти сайты.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>RSS Ссылка</TableHead>
                  <TableHead>Достоверность</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sources.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{item.url}</TableCell>
                    <TableCell>{item.credibilityScore}%</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={item.active ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}>
                        {item.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
