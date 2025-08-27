import Chat from "./components/chat";
import Header from "./components/header";
import Sidebar from "./components/sidebar/sidebar";
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/login");
  return null;
}
