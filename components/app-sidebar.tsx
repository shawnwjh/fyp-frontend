"use client"

import * as React from "react"
import { Command, FolderOpen, Files, Plus, CircleAlert } from "lucide-react"
import { Timestamp } from "firebase/firestore";
import { useState } from "react";
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "./ui/button"
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"

const data = {
  navMain: [
    {
      title: "Projects",
      url: "#",
      icon: FolderOpen,
      isActive: true,
    },
    {
      title: "Files",
      url: "#",
      icon: Files,
      isActive: false,
    },
  ],
}

type Project = { id: string; name: string; ownerId: string; createdAt: Timestamp; updatedAt: Timestamp };
type File = { id: string; name: string; ownerId: string; projectId: string; size: number; storagePath: string; addedAt: Timestamp };

export function AppSidebar({ projects = [], files = [], onProjectEmit, onRetrieveFiles, ...props }: React.ComponentProps<typeof Sidebar> & { projects?: Project[]; files?: File[]; onProjectEmit?: (project: Project) => void; onRetrieveFiles?: () => void }) {
  const [activeItem, setActiveItem] = React.useState(data.navMain[0]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const { setOpen } = useSidebar();

  const setProject = (project: Project) => {
    setActiveProject(project);
    if (onProjectEmit) onProjectEmit(project);
    if (onRetrieveFiles) onRetrieveFiles();
  }

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
      {...props}
    >
      {/* This is the first sidebar */}
      {/* We disable collapsible and adjust width to icon. */}
      {/* This will make the sidebar appear as icons. */}
      <Sidebar
        collapsible="none"
        className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                <a href="#">
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <Command className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">Acme Inc</span>
                    <span className="truncate text-xs">Enterprise</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {data.navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={{
                        children: item.title,
                        hidden: false,
                      }}
                      onClick={() => {
                        setActiveItem(item)
                        setOpen(true)
                      }}
                      isActive={activeItem?.title === item.title}
                      className="px-2.5 md:px-2 cursor-pointer"
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavUser />
        </SidebarFooter>
      </Sidebar>

      {/* This is the second sidebar */}
      {/* We disable collapsible and let it fill remaining space */}
      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
        <SidebarHeader className="gap-3.5 border-b p-4">
          <div className="flex w-full items-center justify-between">
            <div className="text-foreground text-base font-medium">
              {activeItem?.title}
            </div>
            <Dialog>
              <DialogTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-8 cursor-pointer bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80">
                  <Plus />
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Project</DialogTitle>
                  <DialogDescription>
                      Enter a name for your new project.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Input
                        placeholder="Project name"
                        // value={newProjectName}
                        // onChange={(e) => setNewProjectName(e.target.value)}
                        // onKeyDown={(e) => {
                        //     if (e.key === 'Enter') {
                        //         addProject();
                        //     }
                        // }}
                    />
                </div>
                <DialogFooter>
                    <Button
                        className="cursor-pointer"
                        variant="outline"
                        // onClick={() => {
                        //     setIsDialogOpen(false);
                        //     setNewProjectName("");
                        // }}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="cursor-pointer"
                        // onClick={addProject}
                        // disabled={!newProjectName.trim()}
                    >
                        Add Project
                    </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <SidebarInput placeholder="Type to search..." />
        </SidebarHeader>
        <SidebarContent>
          {activeItem == data.navMain[0] ? 
            <SidebarGroup className="p-0">
              <SidebarGroupContent>
                {projects.map((project) => (
                  <a
                    href="#"
                    key={project.id}
                    className={`hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex flex-col items-start border-b p-4 text-sm leading-tight whitespace-nowrap last:border-b-0 ${activeProject?.name === project.name ? 'bg-muted' : ''}`}
                  >
                    <div className="flex w-full justify-between items-center gap-2" onClick={() => setProject(project)}>
                      <span className="text-lg">{project.name}</span>{" "}
                      <div className="flex flex-col">
                        <span className="ml-auto text-xs">{project.updatedAt.toDate().toLocaleDateString()}</span>
                        <span className="ml-auto text-xs">{project.updatedAt.toDate().toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </a>
                ))}
              </SidebarGroupContent>
            </SidebarGroup> : 
            activeProject == null ? <div className="flex flex-col justify-center items-center gap-2 text-muted-foreground text-sm h-100"><CircleAlert />Select a project to see files</div> :
            <SidebarGroup className="p-0">
              <SidebarGroupContent>
                {files.map((file) => (
                  <a
                    href="#"
                    key={file.id}
                    className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex flex-col items-start border-b p-4 text-sm leading-tight whitespace-nowrap last:border-b-0"
                  >
                    <div className="flex w-full justify-between items-center gap-2">
                      <span className="text-lg">{file.name}</span>{" "}
                      <div className="flex flex-col">
                        <span className="ml-auto text-xs">{file.addedAt.toDate().toLocaleDateString()}</span>
                        <span className="ml-auto text-xs">{file.addedAt.toDate().toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </a>
                ))}
              </SidebarGroupContent>
            </SidebarGroup>
          }
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  )
}
