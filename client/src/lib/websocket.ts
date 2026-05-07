type MessageHandler = (data: any) => void

interface WSOptions {
  channel: string
  token?: string
}

class RealtimeClient {
  private socket: WebSocket | null = null
  private reconnectTimer: NodeJS.Timeout | null = null
  private handlers = new Set<MessageHandler>()

  private reconnectAttempts = 0
  private manuallyClosed = false

  connect({ channel, token }: WSOptions) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return
    }

    this.manuallyClosed = false

    const wsUrl = new URL(
      `${process.env.NEXT_PUBLIC_WS_URL}/ws/${channel}`
    )

    if (token) {
      wsUrl.searchParams.set("token", token)
    }

    this.socket = new WebSocket(wsUrl.toString())

    this.socket.onopen = () => {
      console.log("🟢 WS Connected")
      this.reconnectAttempts = 0
    }

    this.socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data)

        switch (parsed.type) {
          case "ping":
            this.socket?.send(
              JSON.stringify({ type: "pong" })
            )
            return

          case "connected":
            console.log("📡 Connected to channel")
            return

          case "event":
            this.handlers.forEach((handler) => {
              handler(parsed.data)
            })
            return
        }
      } catch (err) {
        console.error("WS Parse Error", err)
      }
    }

    this.socket.onclose = () => {
      console.log("🔴 WS Closed")

      if (!this.manuallyClosed) {
        this.scheduleReconnect({ channel, token })
      }
    }

    this.socket.onerror = (err) => {
      console.error("WS Error", err)
    }
  }

  private scheduleReconnect(options: WSOptions) {
    const timeout = Math.min(
      1000 * 2 ** this.reconnectAttempts,
      10000
    )

    this.reconnectAttempts++

    this.reconnectTimer = setTimeout(() => {
      console.log("🔄 Reconnecting WS...")
      this.connect(options)
    }, timeout)
  }

  subscribe(handler: MessageHandler) {
    this.handlers.add(handler)

    return () => {
      this.handlers.delete(handler)
    }
  }

  disconnect() {
    this.manuallyClosed = true

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }

    this.socket?.close()
    this.socket = null
  }
}

export const realtimeClient = new RealtimeClient()