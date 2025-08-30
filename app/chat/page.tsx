"use client"

import Sidebar from "../components/sidebar/sidebar";
import Chat from "../components/chat";
import { db } from "@/lib/firebase/client";
import { collection, query, where, onSnapshot, Timestamp, getDocs, orderBy, limit } from "firebase/firestore";
import { useState, useEffect } from "react";
import { useFirebaseUser } from "@/hooks/useFirebaseUser";

type Project = { id: string; name: string; ownerId: string; createdAt: Timestamp; updatedAt: Timestamp };
type File = { id: string; name: string; ownerId: string; projectId: string; size: number; storagePath: string; addedAt: Timestamp };
type Chat = { id: string; content: string; role: string; timestamp: Timestamp };

export default function ChatPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [chat, setChat] = useState<Chat[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const user = useFirebaseUser();

  const handleActiveProjectEmit = (project: Project) => {
      setActiveProject(project);
      console.log(activeProject);
  }

  useEffect(() => {
    if (user !== undefined && user !== null) {
      console.log(user);
      const q = query(collection(db, "projects"), where("ownerId", "==", user.uid));
      const unsub = onSnapshot(q, (snap) => {
        setProjects(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
      });
      return unsub;
    }
  }, [user]);

  useEffect(() => {
    if (!activeProject?.id) return;

    const q = query(
      collection(db, "projects", activeProject.id, "chat"),
      orderBy("timestamp", "desc"),
      limit(100)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setChat(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
      },
      (err) => {
        console.error("chat onSnapshot:", err.code, err.message);
      }
    );

    return () => unsub();
  }, [activeProject?.id]);

  const retrieveFiles = async () => {
    console.log("FINDING FILES")
    if (!activeProject) return;
    if (user !== undefined && user !== null) {
      const q = query(collection(db, "files"), where("ownerId", "==", user.uid), where("projectId", "==", activeProject.id));
      const snap = await getDocs(q);
      setFiles(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
    }
  }

  return (
    <Sidebar projects={projects} files={files} onProjectEmit={handleActiveProjectEmit} onRetrieveFiles={retrieveFiles}>
      <div className="flex flex-col max-h-full">
        <div className="flex flex-1">
        <main className="flex-1 min-h-0 overflow-auto">
            <Chat project={activeProject} files={files} chat={chat} />
        </main>
        </div>
      </div>
    </Sidebar>
  )
}