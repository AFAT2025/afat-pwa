import { useState } from "react";
import { supabase } from "../supabase";

const T = {
  terra:"#2C1810", argila:"#8B4513", ouro:"#C8922A",
  ouroVivo:"#E8A830", areia:"#D4A574",
  ceuNoite:"#0D1B2A", creme:"#FBF4E8", branco:"#FFFCF5",
  muted:"#8A7060", err:"#C0392B",
  fontDisplay:"'Playfair Display', Georgia, serif",
  fontBody:"'Lato', sans-serif",
};

export default function Login({ onLogin }) {
  const [email, setEmail]           = useState("");
  const [senha, setSenha]           = useState("");
  const [erro, setErro]             = useState("");
  const [carregando, setCarregando] = useState(false);

  const entrar = async () => {
    if (!email || !senha) {
      setErro("Preenche o email e a senha.");
      return;
    }
    setCarregando(true);
    setErro("");

    try {
      // Passo 1: Login com Supabase Auth (verifica email e senha)
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password: senha,
        });

      if (authError) {
        setErro("Email ou senha incorrectos.");
        setCarregando(false);
        return;
      }

      // Passo 2: Vai buscar o perfil do utilizador na tabela users
      const { data: perfil, error: perfilError } = await supabase
        .from("users")
        .select("*")
        .eq("email", email.trim().toLowerCase())
        .single();

      if (perfilError || !perfil) {
        // Se não tem perfil na tabela users, cria um automaticamente
        const { data: novoPerfil } = await supabase
          .from("users")
          .insert({
            id: authData.user.id,
            nome_completo: "Administrador AFAT",
            email: email.trim().toLowerCase(),
            password_hash: "supabase-auth",
            role: "admin",
            ativo: true,
          })
          .select()
          .single();

        localStorage.setItem("afat_user", JSON.stringify(novoPerfil));
        onLogin(novoPerfil);
        return;
      }

      // Passo 3: Guarda sessão e entra
      localStorage.setItem("afat_user", JSON.stringify(perfil));
      onLogin(perfil);

    } catch (e) {
      setErro("Erro de ligação. Tenta novamente.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{
      minHeight:"100vh",
      background:`linear-gradient(170deg,${T.ceuNoite},${T.terra})`,
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:20, fontFamily:T.fontBody
    }}>
      <div style={{
        width:"100%", maxWidth:400, background:T.creme,
        borderRadius:24, overflow:"hidden",
        boxShadow:"0 20px 60px rgba(0,0,0,.4)"
      }}>
        <div style={{
          background:`linear-gradient(135deg,${T.terra},${T.argila})`,
          padding:"32px 28px 24px", textAlign:"center"
        }}>
          <div style={{ fontSize:44, marginBottom:8 }}>🌳</div>
          <h1 style={{
            fontFamily:T.fontDisplay, color:T.ouro,
            fontSize:24, fontWeight:900, marginBottom:4
          }}>AFAT</h1>
          <p style={{ color:"rgba(255,255,255,.6)", fontSize:13 }}>
            Área Reservada — Agentes e Administradores
          </p>
        </div>

        <div style={{ padding:"28px 24px" }}>
          <div style={{ marginBottom:16 }}>
            <label style={{
              display:"block", fontSize:11, fontWeight:800,
              color:T.muted, letterSpacing:1,
              textTransform:"uppercase", marginBottom:7
            }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="o.teu@email.com"
              style={{
                width:"100%", padding:"13px 15px", borderRadius:10,
                border:`1.5px solid ${T.areia}`, background:T.branco,
                fontSize:15, color:T.terra, boxSizing:"border-box",
                fontFamily:T.fontBody, outline:"none"
              }}
            />
          </div>

          <div style={{ marginBottom:20 }}>
            <label style={{
              display:"block", fontSize:11, fontWeight:800,
              color:T.muted, letterSpacing:1,
              textTransform:"uppercase", marginBottom:7
            }}>Senha</label>
            <input
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              placeholder="••••••••"
              onKeyDown={e => e.key === "Enter" && entrar()}
              style={{
                width:"100%", padding:"13px 15px", borderRadius:10,
                border:`1.5px solid ${T.areia}`, background:T.branco,
                fontSize:15, color:T.terra, boxSizing:"border-box",
                fontFamily:T.fontBody, outline:"none"
              }}
            />
          </div>

          {erro && (
            <div style={{
              background:`${T.err}18`, color:T.err,
              border:`1px solid ${T.err}44`, borderRadius:10,
              padding:"10px 14px", marginBottom:16,
              fontSize:13, fontWeight:700
            }}>
              ⚠ {erro}
            </div>
          )}

          <button
            onClick={entrar}
            disabled={carregando}
            style={{
              width:"100%",
              background:`linear-gradient(135deg,${T.ouro},${T.ouroVivo})`,
              color:T.terra, border:"none", borderRadius:12,
              padding:"15px", fontWeight:900, fontSize:15,
              cursor: carregando ? "wait" : "pointer"
            }}>
            {carregando ? "A entrar..." : "Entrar →"}
          </button>

          <div style={{ textAlign:"center", marginTop:16 }}>
            <a href="/" style={{ fontSize:12.5, color:T.muted, textDecoration:"none" }}>
              ← Voltar ao site público
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
