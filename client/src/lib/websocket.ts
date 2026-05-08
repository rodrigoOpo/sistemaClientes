// lib/websocket.ts

type MessageHandler<T = any> = (data: T) => void

interface WSOptions {
  channel: string
  token?: string
}

interface WSMessage<T = any> {
  type: "connected" | "event" | "ping"
  data?: T
}

class RealtimeClient<T = any> {
  private socket: WebSocket | null = null
  private reconnectTimer: NodeJS.Timeout | null = null

  private handlers = new Set<MessageHandler<T>>()

  private reconnectAttempts = 0
  private manuallyClosed = false

  private currentOptions: WSOptions | null = null

  connect(options: WSOptions) {
    const { channel, token } = options

    this.currentOptions = options

    if (
      this.socket &&
      (
        this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING
      )
    ) {
      return
    }

    this.manuallyClosed = false

    const baseUrl = process.env.NEXT_PUBLIC_WS_URL

    if (!baseUrl) {
      console.error("❌ NEXT_PUBLIC_WS_URL missing")
      return
    }

    const wsUrl = new URL(`${baseUrl}/ws/${channel}`)

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
        const parsed: WSMessage<T> = JSON.parse(event.data)

        switch (parsed.type) {
          case "ping":
            this.socket?.send(
              JSON.stringify({ type: "pong" })
            )
            break

          case "connected":
            console.log("📡 WS Channel Connected")
            break

          case "event":
            if (parsed.data) {
              this.handlers.forEach((handler) => {
                handler(parsed.data as T)
              })
            }
            break
        }
      } catch (err) {
        console.error("❌ WS Parse Error:", err)
      }
    }

    this.socket.onerror = (err) => {
      console.error("❌ WS Error:", err)
    }

    this.socket.onclose = () => {
      console.log("🔴 WS Closed")

      this.socket = null

      if (!this.manuallyClosed) {
        this.scheduleReconnect()
      }
    }
  }

  private scheduleReconnect() {
    if (!this.currentOptions) return

    const timeout = Math.min(
      1000 * 2 ** this.reconnectAttempts,
      10000
    )

    this.reconnectAttempts++

    console.log(`🔄 Reconnecting in ${timeout}ms`)

    this.reconnectTimer = setTimeout(() => {
      this.connect(this.currentOptions!)
    }, timeout)
  }

  subscribe(handler: MessageHandler<T>) {
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