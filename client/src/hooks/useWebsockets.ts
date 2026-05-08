// hooks/useWebSockets.ts

"use client"

import { useEffect, useState } from "react"
import { realtimeClient } from "@/lib/websocket"

export type Client = {
  name: string
  email: string
  phone: string
}

export function useClientsWebSocket(channel: string) {
  const [clients, setClients] = useState<Client[]>([])

  useEffect(() => {
    realtimeClient.connect({ channel })

    const unsubscribe = realtimeClient.subscribe((data: Client) => {
      setClients((prev) => {
        // evitar duplicados por email
        const exists = prev.some(
          (client) => client.email === data.email
        )

        if (exists) {
          return prev
        }

        return [data, ...prev]
      })
    })

    return () => {
      unsubscribe()
    }
  }, [channel])

  return { clients }
}