"use client";

import dynamic from "next/dynamic";

const Login = dynamic(() => import("./login/page"), { ssr: false });

export default function Page() {
  return <Login />;
}