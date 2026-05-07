"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useClientsWebSocket } from "@/hooks/useWebsockets"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div className="relative w-full overflow-x-auto">
      <table className={cn("w-full text-sm", className)} {...props} />
    </div>
  )
}

function TableHeader(props: React.ComponentProps<"thead">) {
  return <thead className="[&_tr]:border-b" {...props} />
}

function TableBody(props: React.ComponentProps<"tbody">) {
  return <tbody className="[&_tr:last-child]:border-0" {...props} />
}

function TableRow(props: React.ComponentProps<"tr">) {
  return <tr className="border-b" {...props} />
}

function TableHead(props: React.ComponentProps<"th">) {
  return <th className="p-2 text-left font-medium" {...props} />
}

function TableCell(props: React.ComponentProps<"td">) {
  return <td className="p-2" {...props} />
}

export function ClientsTable() {
  const { clients } = useClientsWebSocket("clientes")

  return (
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
            <TableCell colSpan={3}>
              Esperando clientes...
            </TableCell>
          </TableRow>
        ) : (
          clients.map((c:any, i:any) => (
            <TableRow key={i}>
              <TableCell>{c.name}</TableCell>
              <TableCell>{c.email}</TableCell>
              <TableCell>{c.phone}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}