import { useState, useEffect } from "react";
import Login from "./pages/Login";
import PainelAdmin from "./pages/PainelAdmin";
import PainelAgente from "./pages/PainelAgente";
import PortalPublico from "./pages/PortalPublico";

export default function App() {
  const [user, setUser] = useState(null);
  const [pagina, setPagina] = useState("publico");

  useEffect(() => {
    // Verificar se há utilizador guardado
    const guardado = localStorage.getItem("afat_user");
    if (guardado) {
      const u = JSON.parse(guardado);
      setUser(u);
      setPagina(u.role === "admin" ? "admin" : "agente");
    }

    // Detectar rota
    const path = window.location.pathname;
    if (path === "/login") setPagina("login");
    if (path === "/admin") setPagina(user?.role === "admin" ? "admin" : "login");
    if (path === "/agente") setPagina(user?.role === "agente" ? "agente" : "login");
  }, []);

  const aoFazerLogin = (u) => {
    setUser(u);
    setPagina(u.role === "admin" ? "admin" : "agente");
  };

  const aoSair = () => {
    localStorage.removeItem("afat_user");
    setUser(null);
    setPagina("publico");
    window.location.href = "/";
  };

  if (pagina === "login") return <Login onLogin={aoFazerLogin} />;
  if (pagina === "admin" && user?.role === "admin") return <PainelAdmin user={user} onSair={aoSair} />;
  if (pagina === "agente" && user?.role === "agente") return <PainelAgente user={user} onSair={aoSair} />;

  return <PortalPublico onIrParaLogin={() => setPagina("login")} />;
}
