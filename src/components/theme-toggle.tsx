import { Monitor, Moon, Sun } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from '@/hooks/use-theme'
import { isTheme, type Theme } from '@/lib/theme'

const OPTIONS: ReadonlyArray<{ value: Theme; label: string }> = [
  { value: 'system', label: 'Systemowy' },
  { value: 'light', label: 'Jasny' },
  { value: 'dark', label: 'Ciemny' },
]

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme()

  const current = OPTIONS.find((option) => option.value === theme)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" aria-label={`Motyw: ${current?.label ?? 'systemowy'}`}>
          {resolvedTheme === 'dark' ? <Moon aria-hidden="true" /> : <Sun aria-hidden="true" />}
          <span className="hidden sm:inline">Motyw</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(next) => {
            if (isTheme(next)) setTheme(next)
          }}
        >
          {OPTIONS.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.value === 'system' && <Monitor aria-hidden="true" className="size-3.5" />}
              {option.value === 'light' && <Sun aria-hidden="true" className="size-3.5" />}
              {option.value === 'dark' && <Moon aria-hidden="true" className="size-3.5" />}
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
