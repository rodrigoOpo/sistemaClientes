import Form from "@/ui/Form";
import ClientTable from "@/ui/ClientTable";

export default function Home() {
  return (
    <div className=" text-3xl bg-black md:h-screen">
      <Form/>
      <ClientTable />
    </div>
  );
}
