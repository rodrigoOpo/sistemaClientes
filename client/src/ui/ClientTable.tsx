"use client"

import { useEffect, useRef } from "react"
import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// 🧠 Tipo de datos (alineado con tu backend)
type Client = {
  name: string
  email: string
  phone: string
}

// 🧠 Fetch inicial (HTTP)
async function fetchClients(): Promise<Client[]> {
  const res = await fetch("http://localhost:8000/clients")

  if (!res.ok) {
    throw new Error("Error fetching clients")
  }

  return res.json()
}

export default function ClientTable() {
  const socketRef = useRef<WebSocket | null>(null)
  const queryClient = useQueryClient()

  // 🧠 TanStack Query (estado base)
  const {
    data: clients = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["clients"],
    queryFn: fetchClients,
  })

  useEffect(() => {
    const socket = new WebSocket("ws://sistemaclientes-7ulo.onrender.com/ws")
    socketRef.current = socket

    socket.onopen = () => {
      console.log("🟢 WebSocket conectado")
    }

    socket.onmessage = () => {
      console.log("📩 Evento recibido → invalidando query")

      // 💥 AQUÍ está la magia tipo "refresh"
      queryClient.invalidateQueries({ queryKey: ["clients"] })
    }

    socket.onclose = () => {
      console.log("🔴 WebSocket desconectado")
    }

    return () => {
      socket.close()
      socketRef.current = null
    }
  }, [queryClient])

  if (isLoading) {
    return <p className="text-white">Cargando...</p>
  }

  if (isError) {
    return <p className="text-red-500">Error cargando datos</p>
  }

  return (
    <Table className="text-white mt-20 w-150 mx-10 md:w-300">
      <TableCaption>Clients Table</TableCaption>

      <TableHeader>
        <TableRow>
          <TableHead className="text-white">Name</TableHead>
          <TableHead className="text-white">Email</TableHead>
          <TableHead className="text-white">Phone</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {clients.map((client) => (
          <TableRow key={client.email} className="text-white">
            <TableCell>{client.name}</TableCell>
            <TableCell>{client.email}</TableCell>
            <TableCell>{client.phone}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}