import Form from "@/ui/Form";
import { ClientsTable } from "@/components/ui/table";

export default function Home() {
  return (
    <div className=" text-3xl bg-black md:h-screen">
      <Form/>
      <ClientsTable />
    </div>
  );
}
