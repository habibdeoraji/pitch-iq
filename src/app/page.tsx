import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";

export default function Home() {
  redirect(`/chat/${randomUUID()}`);
}
