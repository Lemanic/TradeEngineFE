import { Eye, EyeOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { usePrivacy } from '@/hooks/use-privacy'

export function PrivacyToggle() {
  const { isPrivate, toggle } = usePrivacy()

  const label = isPrivate ? 'Pokaż kwoty' : 'Ukryj kwoty'

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label={label}
          aria-pressed={isPrivate}
          onClick={toggle}
        >
          {isPrivate ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
