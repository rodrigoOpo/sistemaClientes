"use client"

import { useEffect, useState } from "react"

type Client = {
  name: string
  email: string
  phone: string
}

export function useClientsWebSocket(channel: string) {
  const [clients, setClients] = useState<Client[]>([])

  useEffect(() => {
    const url = `${process.env.NEXT_PUBLIC_WS_URL}/ws/${channel}`
    const ws = new WebSocket(url)

    ws.onmessage = (event) => {
      try {
        const data: Client = JSON.parse(event.data)

        setClients((prev) => [data, ...prev]) // 👈 nueva fila arriba
      } catch (err) {
        console.error("WS parse error:", err)
      }
    }

    ws.onerror = (err) => {
      console.error("WS error:", err)
    }

    return () => {
      ws.close()
    }
  }, [channel])

  return { clients }
}