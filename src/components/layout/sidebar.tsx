"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Newspaper,
  FileText,
  Radio,
  Tags,
  CalendarDays,
  Send,
  BarChart,
  Bot,
  MessageSquare,
  Languages,
  Settings,
  TerminalSquare
} from "lucide-react";

const navItems = [
  { name: "Дашборд", href: "/", icon: LayoutDashboard },
  { name: "Новости", href: "/news", icon: Newspaper },
  { name: "Контент", href: "/content", icon: FileText },
  { name: "Источники", href: "/sources", icon: Radio },
  { name: "Категории", href: "/categories", icon: Tags },
  { name: "Расписание", href: "/schedule", icon: CalendarDays },
  { name: "Telegram", href: "/telegram", icon: Send },
  { name: "Аналитика", href: "/analytics", icon: BarChart },
  { name: "ИИ-Агенты", href: "/agents", icon: Bot },
  { name: "Промпты", href: "/prompts", icon: MessageSquare },
  { name: "Языки", href: "/language", icon: Languages },
  { name: "Настройки", href: "/settings", icon: Settings },
  { name: "Логи", href: "/logs", icon: TerminalSquare },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-muted/30">
      <div className="flex h-14 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <Bot className="h-6 w-6 text-primary" />
          <span className="text-lg">Embergenov AI</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid items-start px-4 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground hover:bg-muted",
                pathname === item.href ? "bg-primary text-primary-foreground font-semibold shadow-sm" : ""
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
