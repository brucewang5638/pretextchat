import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import type { MouseEvent } from "react";
import type { Application } from "../../../../shared/types";
import { SidebarAppItem } from "./SidebarAppItem";

interface SidebarAppListProps {
  apps: Application[];
  activeAppId: string | null;
  onDragEnd: (result: DropResult) => void;
  onSelectApp: (appId: string) => void | Promise<void>;
  onCloseApp: (event: MouseEvent<HTMLButtonElement>, appId: string) => void;
}

export function SidebarAppList({
  apps,
  activeAppId,
  onDragEnd,
  onSelectApp,
  onCloseApp,
}: SidebarAppListProps) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="sidebar-apps">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex w-full flex-col items-center"
          >
            {apps.map((app, index) => (
              <Draggable key={app.id} draggableId={app.id} index={index}>
                {(draggableProvided, draggableSnapshot) => (
                  <SidebarAppItem
                    app={app}
                    isActive={activeAppId === app.id}
                    isDragging={draggableSnapshot.isDragging}
                    innerRef={draggableProvided.innerRef}
                    draggableProps={draggableProvided.draggableProps}
                    dragHandleProps={draggableProvided.dragHandleProps}
                    onSelect={onSelectApp}
                    onClose={onCloseApp}
                  />
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
