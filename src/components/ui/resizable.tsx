"use client"

import * as React from "react"
import {
  Group as ResizablePanelGroupPrimitive,
  Panel as ResizablePanelPrimitive,
  Separator as ResizableHandlePrimitive,
} from "react-resizable-panels"

type ResizablePanelGroupProps = React.ComponentProps<typeof ResizablePanelGroupPrimitive> & {
  direction?: "horizontal" | "vertical"
}

const ResizablePanelGroup = ({ direction = "horizontal", ...props }: ResizablePanelGroupProps) => {
  const orientation = direction === "vertical" ? "vertical" : "horizontal"
  return <ResizablePanelGroupPrimitive orientation={orientation} {...props} />
}

const ResizablePanel = (props: React.ComponentProps<typeof ResizablePanelPrimitive>) => {
  return <ResizablePanelPrimitive {...props} />
}

const ResizableHandle = (props: React.ComponentProps<typeof ResizableHandlePrimitive>) => {
  return <ResizableHandlePrimitive {...props} />
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
