import { Clock } from 'lucide-react'

import { Badge } from '@/components/ui/badge'

export function StaleBadge() {
  return (
    <Badge variant="outline" className="gap-1 font-normal text-muted-foreground">
      <Clock aria-hidden="true" className="size-3" />
      nieaktualne
    </Badge>
  )
}
