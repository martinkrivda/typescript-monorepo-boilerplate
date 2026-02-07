import * as React from "react"
import { GripVertical } from "lucide-react"
import { Group, Panel, Separator } from "react-resizable-panels"

import { cn } from "@/lib/utils"

type ResizablePanelGroupProps = Omit<
  React.ComponentProps<typeof Group>,
  "orientation"
> & {
  direction?: "horizontal" | "vertical"
}

const ResizablePanelGroup = ({
  className,
  direction = "horizontal",
  ...props
}: ResizablePanelGroupProps) => (
  <Group
    className={cn("flex h-full w-full", className)}
    orientation={direction}
    {...props}
  />
)

const ResizablePanel = Panel

const ResizableHandle = ({
  className,
  withHandle,
  ...props
}: React.ComponentProps<typeof Separator> & {
  withHandle?: boolean
}) => (
  <Separator
    className={cn(
      "relative flex w-px items-center justify-center bg-border",
      className
    )}
    {...props}
  >
    {withHandle ? (
      <div className="z-10 flex h-6 w-6 items-center justify-center rounded-sm border bg-background">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
    ) : null}
  </Separator>
)

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
