"use client"

import React, { useState, useRef, useEffect } from 'react'
import Markdown from 'react-markdown';
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, FileText, Loader2, Lightbulb } from 'lucide-react'
import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";
import firebaseApp from "@/lib/firebase/client";
import { Timestamp } from 'firebase/firestore';

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  isLoading?: boolean
}

type Project = { id: string; name: string; ownerId: string; createdAt: Timestamp; updatedAt: Timestamp };
type File = { id: string; name: string; ownerId: string; projectId: string; size: number; storagePath: string; addedAt: Timestamp };
type Chat = { id: string; content: string; role: string; timestamp: Timestamp };

export default function Chat({ project = null, files=[], chat = []}: { project: Project | null; files: File[]; chat: Chat[] }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter();

  const suggestedPrompts = [
    "Predict the acceptance score for my paper",
    "Find relevant citations",
    "Critique my paper and suggest improvements",
    "Summarize the methodology",
    "Identify research gaps",
    "Check for novelty and contributions",
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (!user) {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSuggestedPrompt = async (prompt: string) => {
    if (isLoading) return
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: prompt,
      role: 'user',
      timestamp: new Date()
    }

    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      isLoading: true
    }

    setMessages(prev => [...prev, userMessage, loadingMessage])
    setIsLoading(true)

    try {
      const response = await fetch('https://agent-206456287844.asia-east1.run.app/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          "message": prompt,
          "session_id": "default",
          "context": { messages, documents: JSON.stringify(files) }
        })
      })
      const data = await response.json()
      const assistantMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: data.response || 'Sorry, no response received.',
        role: 'assistant',
        timestamp: new Date()
      }

      setMessages(prev => prev.slice(0, -1).concat(assistantMessage))
      setIsLoading(false)
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => prev.slice(0, -1))
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date()
    }

    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      isLoading: true
    }

    setMessages(prev => [...prev, userMessage, loadingMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('https://agent-206456287844.asia-east1.run.app/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          "message": userMessage.content,
          "session_id": "default",
          "context": { messages, documents: JSON.stringify(files) }
        })
      });
      const data = await response.json();
      const assistantMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: data.response || 'Sorry, no response received.',
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => prev.slice(0, -1).concat(assistantMessage));
      setIsLoading(false);
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => prev.slice(0, -1))
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="bg-muted flex flex-col w-full" style={{height: 'calc(100vh - 3rem)'}}>
      <div className="flex flex-col flex-1 h-full">
        <ScrollArea className="flex-1 px-4 mt-3 overflow-y-auto" ref={scrollAreaRef}>
          <div className="space-y-4 py-4">
            {/* Show suggested prompts when there are no messages */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-6">
                <div className="text-center space-y-2">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
                  <h3 className="text-lg font-semibold">
                    {project ? project.name : "Select a Project"}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    {project 
                      ? `Ask questions about ${project.name}` 
                      : "Select a project to get started with research assistance"
                    }
                  </p>
                </div>
                {project ? 
                <div className="w-full max-w-2xl">
                  <div className="flex items-center space-x-2 mb-4 justify-center">
                    <Lightbulb className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Try these prompts:
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {suggestedPrompts.map((prompt, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="justify-start h-auto py-3 px-4 text-left whitespace-normal"
                        onClick={() => handleSuggestedPrompt(prompt)}
                        disabled={isLoading}
                      >
                        <span className="text-sm">{prompt}</span>
                      </Button>
                    ))}
                  </div>
                </div> : <></>
                }
              </div>
            )}

            {/* Regular messages */}
            {messages.length > 0 && messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div
                  className={`flex-1 max-w-[80%] ${
                    message.role === 'user' ? 'text-right' : ''
                  }`}
                >
                  <div
                    className={`rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-auto inline-block px-3 py-2'
                        : 'bg-none py-2'
                    }`}
                  >
                    {message.isLoading ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">
                          Assistant is thinking...
                        </span>
                      </div>
                    ) : (
                      message.role === 'assistant' ? (
                        <div className="text-sm whitespace-pre-wrap">
                          <Markdown>{message.content}</Markdown>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )
                    )}
                  </div>
                  <p
                    className={`text-xs text-muted-foreground mt-1 ${
                      message.role === 'user' ? 'text-right' : ''
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        {project ? 
        <div className="flex-shrink-0 p-4 bg-muted sticky bottom-0">
          <div className="flex w-full space-x-2">
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about your research, papers, citations..."
                disabled={isLoading}
                className="pr-12"
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="flex-shrink-0"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div> : <></>
        }
      </div>
    </div>
  )
}