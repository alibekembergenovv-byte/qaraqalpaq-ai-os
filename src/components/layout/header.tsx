"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useState } from "react";

export function Header() {
  const pathname = usePathname();
  const [demoMode, setDemoMode] = useState(true);

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-6 lg:h-[60px]">
      <Link href="/" className="lg:hidden">
        <Bot className="h-6 w-6" />
        <span className="sr-only">Home</span>
      </Link>
      <div className="w-full flex-1">
        <form onSubmit={(e) => { e.preventDefault(); toast.info("Поиск", { description: "Ищем по всей платформе..." }) }}>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Поиск..."
              className="w-full bg-background pl-8 md:w-[200px] lg:w-[300px]"
            />
          </div>
        </form>
      </div>
      <div className="flex items-center gap-4">
        <Button 
          variant={demoMode ? "default" : "outline"} 
          size="sm" 
          className="hidden h-8 lg:flex transition-all"
          onClick={() => {
            setDemoMode(!demoMode);
            toast.success(demoMode ? "Рабочий режим активирован" : "Демо режим активирован", {
              description: demoMode ? "Система теперь делает реальные API вызовы." : "Все API вызовы мокируются."
            });
          }}
        >
          {demoMode ? "Демо Режим: Вкл" : "Рабочий Режим: Вкл"}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger className="relative h-8 w-8 rounded-full focus:outline-none overflow-hidden">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/avatar.jpg" alt="Admin" className="object-cover" />
              <AvatarFallback>AE</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Алибек Ембергенов</p>
                <p className="text-xs leading-none text-muted-foreground">
                  admin@embergenov.ai
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => toast.info("Перенаправление", { description: "Открытие профиля..." })}>Профиль</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("Настройки", { description: "Переход к настройкам..." })}>Настройки</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => toast.success("Успех", { description: "Вы успешно вышли из системы." })}>Выйти</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
