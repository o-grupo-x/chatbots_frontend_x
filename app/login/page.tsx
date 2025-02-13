"use client";

import React, { useState } from "react";
import style from "./login.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Importa o roteador

export default function Login() {
  const router = useRouter(); // Inicializa o roteador

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    const db = await openDB("grupo-x", 1);
    const tx = db.transaction("usuarios", "readonly");
    const store = tx.objectStore("usuarios");

    // Recupera todos os usuários corretamente
    const request = store.getAll();
    const users = await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    // Verifica se o usuário existe
    const user = users.find(
      (user) => user.email === email && user.senha === senha
    );

    if (user) {
      router.push("/chatbot"); // Redireciona para a página chatbot
    } else {
      alert("Email ou senha incorretos!");
    }
  };

  return (
    <div className={style.frame}>
      <div className={style.card}>
        <div className={style.cardHeader}>
          <h1 className="text-2xl">Login</h1>
        </div>
        <div className={style.cardBody}>
          <form onSubmit={handleLogin} className={style.loginForm}>
            <fieldset className={style.loginFieldset}>
              <label htmlFor="email">Email</label>
              <input
                className={style.loginInput}
                type="text"
                name="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </fieldset>
            <fieldset className={style.loginFieldset}>
              <label htmlFor="senha">Senha</label>
              <input
                className={style.loginInput}
                type="password"
                name="senha"
                id="senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </fieldset>
            <div className={style.btnRow}>
              <button type="submit" className={style.btnEntrar}>
                Entrar
              </button>
              <Link href="/cadastrar">Cadastre-se</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

async function openDB(name, version) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, version);
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}
