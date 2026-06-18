"use client";

import * as Toast from "@radix-ui/react-toast";
import { createContext, useContext, useMemo, useState } from "react";

type ToastMessage = { id: number; title: string; description?: string; variant?: "default" | "destructive" };
const ToastContext = createContext<(message: Omit<ToastMessage, "id">) => void>(() => undefined);

export function useToast() {
  return useContext(ToastContext);
}

export function ToasterProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);
  const notify = useMemo(
    () => (message: Omit<ToastMessage, "id">) => {
      const id = Date.now();
      setMessages((current) => [...current, { ...message, id }]);
    },
    []
  );

  return (
    <ToastContext.Provider value={notify}>
      <Toast.Provider swipeDirection="right">
        {children}
        {messages.map((message) => (
          <Toast.Root 
            key={message.id} 
            className={`rounded-lg border p-4 shadow-soft transition-all ${
              message.variant === "destructive" 
                ? "border-destructive/50 bg-destructive/5 text-destructive" 
                : "bg-card text-card-foreground"
            }`} 
            onOpenChange={(open) => !open && setMessages((items) => items.filter((item) => item.id !== message.id))}
          >
            <Toast.Title className="text-sm font-semibold">{message.title}</Toast.Title>
            {message.description ? (
              <Toast.Description className={`mt-1 text-sm ${message.variant === "destructive" ? "text-destructive/90" : "text-muted-foreground"}`}>
                {message.description}
              </Toast.Description>
            ) : null}
          </Toast.Root>
        ))}
        <Toast.Viewport className="fixed bottom-4 right-4 z-50 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2" />
      </Toast.Provider>
    </ToastContext.Provider>
  );
}

export function Toaster() {
  return null;
}
