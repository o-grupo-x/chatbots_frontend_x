"use client";


import React, { useState } from "react";
import style from "./cadastrar.module.css";
import Link from "next/link";

export default function Cadastrar() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");

  const handleCadastro = async (e) => {
    e.preventDefault();
    
    if (senha !== confirmaSenha) {
      alert("As senhas não coincidem!");
      return;
    }

    const db = await openDB("grupo-x", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("usuarios")) {
          db.createObjectStore("usuarios", { keyPath: "id", autoIncrement: true });
        }
      },
    });

    const tx = db.transaction("usuarios", "readwrite");
    const store = tx.objectStore("usuarios");
    await store.add({ email, senha });
    await tx.done;
    alert("Cadastro realizado com sucesso!");
  };

  return (
    <div className={style.frame}>
      <div className={style.card}>
        <div className={style.cardHeader}>
          <h1 className="text-2xl">Cadastre-se</h1>
        </div>
        <div className={style.cardBody}>
          <form onSubmit={handleCadastro} className={style.loginForm}>
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
            <fieldset className={style.loginFieldset}>
              <label htmlFor="confirmaSenha">Confirmar senha</label>
              <input
                className={style.loginInput}
                type="password"
                name="confirmaSenha"
                id="confirmaSenha"
                value={confirmaSenha}
                onChange={(e) => setConfirmaSenha(e.target.value)}
              />
            </fieldset>
            <div className={style.btnRow}>
              <button type="submit" className={style.btnCadastrar}>Cadastre-se</button>
              <button className={style.btnEntrar}>
                <Link href='/login'>Voltar para login</Link>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

async function openDB(name, version, { upgrade }) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, version);
    request.onupgradeneeded = (event) => upgrade(event.target.result);
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}
