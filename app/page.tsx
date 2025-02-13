"use client";

import dynamic from "next/dynamic";

const Chatbot = dynamic(() => import("./chatbot"), { ssr: false });
// const Login = dynamic(() => import("./login"), { ssr: false });

export default function Page() {
  return <Chatbot />;
  // return <Login />;
}