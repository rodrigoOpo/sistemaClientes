// components/ClientsTable.tsx

"use client"

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"

import { useClientsWebSocket } from "@/hooks/useWebsockets"

export function ClientsTable() {
  const { clients } = useClientsWebSocket("activity_channel")

  return (
    <div className="rounded-md border p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Teléfono</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {clients.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={3}
                className="text-center"
              >
                Esperando clientes...
              </TableCell>
            </TableRow>
          ) : (
            clients.map((client:any) => (
              <TableRow key={client.email}>
                <TableCell>{client.name}</TableCell>

                <TableCell>
                  {client.email}
                </TableCell>

                <TableCell>
                  {client.phone}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}