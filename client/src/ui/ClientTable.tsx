"use client"

import { useEffect, useRef, useState } from "react"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Props = {}

const ClientTable = (props: Props) => {

  const socketRef = useRef<WebSocket | null>(null)
  const [messages, setMessages] = useState([])

  useEffect(() =>{
    const socket = new WebSocket("ws://localhost:8000/ws")
    socketRef.current = socket

    socket.onopen = () => {
      console.log("Conectado")
      socket.send("Hola Servidor")
    }

    socket.onmessage = (event) => {
      console.log("Mensaje: ", event.data)
    }

    socket.onclose = () => {
      console.log("Desconectado")
    }

    return () => {
      socket.close()
    }
  }, [])


  return (
    <>
      <Table className="text-white mt-20 w-150 mx-10 md:w-300">
        <TableCaption>Clients Table</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="text-white">Invoice</TableHead>
            <TableHead className="text-white">Status</TableHead>
            <TableHead className="text-white">Method</TableHead>
            <TableHead className="text-white">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {messages.map((msg, index) => (
              <TableRow className="text-white">
                <TableCell className="font-medium">INV001</TableCell>
                <TableCell>something</TableCell>
                <TableCell>Credit Card</TableCell>
                <TableCell>$250.00</TableCell>
              </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}

export default ClientTable

