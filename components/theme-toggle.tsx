"use client"

import { useSyncExternalStore } from "react"
import { useTheme } from "next-themes"
import { MonitorIcon, MoonIcon, SunIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const themes = [
  { value: "light", label: "Light", Icon: SunIcon },
  { value: "dark", label: "Dark", Icon: MoonIcon },
  { value: "system", label: "System", Icon: MonitorIcon },
]

// saved theme is only known in the browser, so the server render marks no theme as active.
function useCurrentTheme() {
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
  return { theme: mounted ? theme : undefined, setTheme }
}

export function ThemeMenu() {
  const { theme, setTheme } = useCurrentTheme()
  const Current = themes.find((t) => t.value === theme)?.Icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-lg" />}>
        {Current ? <Current className="size-5" /> : <span className="size-5" />}
        <span className="sr-only">Theme</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex w-auto min-w-0 gap-1">
        {themes.map(({ value, label, Icon }) => (
          <DropdownMenuItem
            key={value}
            aria-label={label}
            onClick={() => setTheme(value)}
            className={cn("size-8 justify-center p-0", theme === value && "bg-primary text-primary-foreground")}
          >
            <Icon className="size-4" />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function ThemeOptions() {
  const { theme, setTheme } = useCurrentTheme()

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-muted-foreground">Theme</p>
      <div className="flex gap-2">
        {themes.map(({ value, label, Icon }) => (
          <Button
            key={value}
            variant={theme === value ? "default" : "outline"}
            size="lg"
            aria-pressed={theme === value}
            onClick={() => setTheme(value)}
            className="flex-1"
          >
            <Icon />
            {label}
          </Button>
        ))}
      </div>
    </div>
  )
}
