"use client";

import ChatPage from "@/components/chat/ChatPage";
import { useConnection } from "@/context/connect";

import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [showSpinner, setShowSpinner] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [userName, setUserName] = useState("");

  const { connection } =useConnection();

  function handleJoin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Logica entrar no chat - Socket.io

    if (userName !== "") {
      connection.emit("join_room", userName);

      setShowSpinner(true);
      setTimeout(() => {
        setShowChat(true);
        setShowSpinner(false);
      }, 500);
    }


    setShowChat(true);
  }

  return (
    <main className="flex w-full h-screen">
      <div
        className="flex flex-col w-full h-full justify-center items-center gap-2"
        style={{ display: showChat ? "none" : "" }}
      >
        <div className="w-1/5">
          <Image
            src="/images/logo-chat.png"
            alt="Logo chat"
            width={0}
            height={0}
            sizes="100vw"
            className="w-full h-full"
            priority
          />
        </div>
        <div>
          <form onSubmit={handleJoin} className="flex gap-2">
            <input
              type="text"
              className="rounded px-2 py-3 text-gray-700 border border-gray-400"
              value={userName}
              placeholder="Digite o seu usuário"
              onChange={(e) => setUserName(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded"
            >
              {!showSpinner ? (
                "Entrar"
              ) : (
                <div className="border-4 border-solid border-t-4 border-[#2196f3] rounded-lg w-5 h-5 animate-spin"></div>
              )}
            </button>
          </form>
        </div>
      </div>
      <div className="w-full" style={{ display: showChat ? "" : "none" }}>
        <ChatPage userName={userName} />
      </div>
    </main>
  );
}
