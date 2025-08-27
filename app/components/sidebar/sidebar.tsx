"use client"

import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Timestamp } from "firebase/firestore";

type Project = { id: string; name: string; ownerId: string; createdAt: Timestamp; updatedAt: Timestamp };
type File = { id: string; name: string; ownerId: string; projectId: string; size: number; storagePath: string; addedAt: Timestamp };

export default function Sidebar({ projects = [], files = [], onProjectEmit, onRetrieveFiles, children } : { projects?: Project[]; files?: File[]; children?:React.ReactNode; onProjectEmit?: (project: Project) => void; onRetrieveFiles?: () => void; }) {
    const [activeProject, setActiveProject] = useState<Project | null>(null);

    const handleProjectIntermediateEmit = (project: Project) => {
        setActiveProject(project);
        if (onProjectEmit) onProjectEmit(project);
    }

    return (
        <div className="max-w-screen max-h-screen bg-muted overflow-hidden">
            <SidebarProvider style={{"--sidebar-width": "350px",} as React.CSSProperties}>
                <AppSidebar projects={projects} files={files} onProjectEmit={handleProjectIntermediateEmit} onRetrieveFiles={onRetrieveFiles} />
                <SidebarInset>
                    <header className="bg-muted sticky top-0 flex shrink-0 items-center gap-2 border-b p-4">
                    <SidebarTrigger className="-ml-1 cursor-pointer" />
                    <Separator
                        orientation="vertical"
                        className="mr-2 data-[orientation=vertical]:h-4"
                    />
                        <div className="flex px-3">
                            <p className="font-bold text-xl mr-3">IntelliExo</p>

                            {activeProject && (
                                <Badge>{activeProject.name}</Badge>
                            )}
                        </div>
                    </header>
                    <div className="flex flex-1 flex-col gap-4 max-h-full">
                        {children}
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </div>
    )
}