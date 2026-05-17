import { useState, useEffect } from "react";
import { supabase } from "../supabase";

const T = {
  terra:"#2C1810", argila:"#8B4513", ouro:"#C8922A",
  ouroVivo:"#E8A830", areia:"#D4A574", palha:"#F0D090",
  ceuNoite:"#0D1B2A", creme:"#FBF4E8", branco:"#FFFCF5",
  muted:"#8A7060", err:"#C0392B", verde:"#2D5016",
  verdeClaro:"#4A7C24", aguaMar:"#1B6B7B",
  fontDisplay:"'Playfair Display', Georgia, serif",
  fontBody:"'Lato', sans-serif",
};

export default function PainelAdmin({ user, onSair }) {
  const [aba, setAba]           = useState("dashboard");
  const [socios, setSocios]     = useState([]);
  const [agentes, setAgentes]   = useState([]);
  const [morancas, setMorancas] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const stats = {
    totalSocios:     socios.length,
    pendentes:       socios.filter(s => s.status === "pendente").length,
    aprovados:       socios.filter(s => s.status === "aprovado").length,
    totalAgentes:    agentes.length,
    totalMorancas:   morancas.length,
    totalResidentes: morancas.reduce((a, m) => a + (m.numero_residentes || 0), 0),
  };

  useEffect(() => { carregarTudo(); }, []);

  async function carregarTudo() {
    setCarregando(true);
    const [s, a, m] = await Promise.all([
      supabase.from("socios").select("*").order("data_pedido", { ascending: false }),
      supabase.from("users").select("*").eq("role", "agente").order("criado_em", { ascending: false }),
      supabase.from("morancas").select("*").order("data_registo", { ascending: false }),
    ]);
    if (s.data) setSocios(s.data);
    if (a.data) setAgentes(a.data);
    if (m.data) setMorancas(m.data);
    setCarregando(false);
  }

  async function aprovarSocio(id) {
    await supabase.from("socios").update({
      status: "aprovado",
      aprovado_por: user.id,
      data_aprovacao: new Date().toISOString(),
    }).eq("id", id);
    carregarTudo();
  }

  async function rejeitarSocio(id) {
    await supabase.from("socios").update({ status: "rejeitado" }).eq("id", id);
    carregarTudo();
  }

  async function criarAgente(dados, setMensagem, setSalvando) {
    try {
      // Passo 1 — Criar no Authentication
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: dados.email.trim(),
        password: dados.password_hash.trim(),
      });

      if (authError) {
        setMensagem("❌ Erro: " + authError.message);
        setSalvando(false);
        return;
      }

      const uid = authData?.user?.id;
      if (!uid) {
        setMensagem("❌ Erro ao obter ID do utilizador.");
        setSalvando(false);
        return;
      }

      // Passo 2 — Confirmar email automaticamente
      await supabase.rpc("confirmar_email", { user_id: uid });

      // Passo 3 — Verificar se já existe na tabela users
      const { data: existe } = await supabase
        .from("users")
        .select("id")
        .eq("email", dados.email.trim())
        .single();

      if (existe) {
        // Actualizar o ID para o do Authentication
        await supabase
          .from("users")
          .update({ id: uid, password_hash: dados.password_hash })
          .eq("email", dados.email.trim());
      } else {
        // Inserir novo
        await supabase.from("users").insert([{
          id:             uid,
          nome_completo:  dados.nome_completo,
          email:          dados.email.trim(),
          password_hash:  dados.password_hash,
          telefone:       dados.telefone,
          zona_atribuida: dados.zona_atribuida,
          role:           "agente",
          ativo:          true,
        }]);
      }

      setMensagem("✅ Agente criado com sucesso! Pode fazer login em qualquer dispositivo.");
      carregarTudo();

    } catch (e) {
      setMensagem("❌ Erro inesperado: " + e.message);
    }
    setSalvando(false);
  }

  async function toggleAgente(id, ativo) {
    await supabase.from("users").update({ ativo: !ativo }).eq("id", id);
    carregarTudo();
  }

  return (
    <div style={{ minHeight:"100vh", background:T.creme, fontFamily:T.fontBody }}>

      {/* Cabeçalho */}
      <div style={{ background:`linear-gradient(135deg,${T.terra},${T.argila})`, padding:"16px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:24 }}>🌳</span>
          <div>
            <div style={{ color:T.ouro, fontFamily:T.fontDisplay, fontWeight:900, fontSize:16 }}>AFAT Admin</div>
            <div style={{ color:"rgba(255,255,255,.5)", fontSize:11 }}>Olá, {user.nome_completo.split(" ")[0]}</div>
          </div>
        </div>
        <button onClick={onSair} style={{ background:"rgba(255,255,255,.1)", color:T.branco, border:"1px solid rgba(255,255,255,.2)", borderRadius:10, padding:"8px 14px", fontSize:12, fontWeight:700, cursor:"pointer" }}>
          Sair →
        </button>
      </div>

      {/* Menu de abas */}
      <div style={{ background:T.terra, display:"flex", overflowX:"auto", gap:2, padding:"0 12px" }}>
        {[
          { id:"dashboard", label:"📊 Dashboard" },
          { id:"socios",    label:"🪪 Sócios" },
          { id:"agentes",   label:"👥 Agentes" },
          { id:"morancas",  label:"🏡 Moranças" },
        ].map(a => (
          <button key={a.id} onClick={() => setAba(a.id)} style={{ background: aba===a.id ? T.ouro : "transparent", color: aba===a.id ? T.terra : "rgba(255,255,255,.5)", border:"none", padding:"12px 16px", fontWeight:900, fontSize:12.5, cursor:"pointer", borderRadius:"8px 8px 0 0", whiteSpace:"nowrap", transition:"all .2s" }}>
            {a.label}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      <div style={{ padding:18 }}>
        {carregando && <div style={{ textAlign:"center", padding:40, color:T.muted }}>A carregar dados...</div>}

        {/* ── DASHBOARD ── */}
        {aba === "dashboard" && !carregando && (
          <div>
            <h2 style={{ fontFamily:T.fontDisplay, fontSize:22, color:T.terra, marginBottom:18 }}>Visão Geral</h2>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
              {[
                { label:"Total Sócios",    valor:stats.totalSocios,    icone:"🪪", cor:T.ouro },
                { label:"Pendentes",       valor:stats.pendentes,       icone:"⏳", cor:"#E67E22" },
                { label:"Aprovados",       valor:stats.aprovados,       icone:"✅", cor:T.verdeClaro },
                { label:"Agentes",         valor:stats.totalAgentes,    icone:"👥", cor:T.aguaMar },
                { label:"Moranças",        valor:stats.totalMorancas,   icone:"🏡", cor:T.argila },
                { label:"Residentes",      valor:stats.totalResidentes, icone:"👨‍👩‍👧‍👦", cor:T.terra },
              ].map(s => (
                <div key={s.label} style={{ background:T.branco, borderRadius:14, padding:16, boxShadow:`0 2px 12px rgba(44,24,16,.07)`, borderLeft:`4px solid ${s.cor}` }}>
                  <div style={{ fontSize:24, marginBottom:6 }}>{s.icone}</div>
                  <div style={{ fontSize:28, fontWeight:900, color:s.cor, fontFamily:T.fontDisplay }}>{s.valor}</div>
                  <div style={{ fontSize:11.5, color:T.muted, fontWeight:700, marginTop:2 }}>{s.label}</div>
                </div>
              ))}
            </div>
            {stats.pendentes > 0 && (
              <div style={{ background:"#E67E2218", border:"1px solid #E67E2255", borderRadius:14, padding:16 }}>
                <div style={{ fontWeight:800, color:"#E67E22", marginBottom:6 }}>⏳ {stats.pendentes} pedido(s) pendente(s)</div>
                <div style={{ fontSize:13, color:T.muted, marginBottom:10 }}>Há sócios aguardando aprovação.</div>
                <button onClick={() => setAba("socios")} style={{ background:"#E67E22", color:T.branco, border:"none", borderRadius:10, padding:"9px 16px", fontWeight:900, fontSize:13, cursor:"pointer" }}>
                  Ver Pedidos →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── SÓCIOS ── */}
        {aba === "socios" && !carregando && (
          <div>
            <h2 style={{ fontFamily:T.fontDisplay, fontSize:22, color:T.terra, marginBottom:18 }}>Gestão de Sócios</h2>
            {socios.length === 0 && <div style={{ textAlign:"center", color:T.muted, padding:40 }}>Nenhum sócio registado ainda.</div>}
            {socios.map(s => (
              <div key={s.id} style={{ background:T.branco, borderRadius:14, padding:16, marginBottom:12, boxShadow:`0 2px 12px rgba(44,24,16,.07)`, borderLeft:`4px solid ${s.status==="aprovado" ? T.verdeClaro : s.status==="rejeitado" ? T.err : "#E67E22"}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                  <div>
                    <div style={{ fontFamily:T.fontDisplay, fontWeight:700, color:T.terra, fontSize:16 }}>{s.nome_completo}</div>
                    <div style={{ fontSize:12, color:T.muted }}>{s.telefone} · {s.pais_residencia}</div>
                  </div>
                  <span style={{ background: s.status==="aprovado" ? `${T.verdeClaro}22` : s.status==="rejeitado" ? `${T.err}22` : "#E67E2222", color: s.status==="aprovado" ? T.verdeClaro : s.status==="rejeitado" ? T.err : "#E67E22", borderRadius:20, padding:"4px 10px", fontSize:11, fontWeight:900 }}>
                    {s.status.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize:12, color:T.muted, marginBottom:10 }}>
                  Pedido: {new Date(s.data_pedido).toLocaleDateString("pt-PT")}
                  {s.genero && ` · ${s.genero === "M" ? "Masculino" : s.genero === "F" ? "Feminino" : s.genero}`}
                </div>
                {s.status === "pendente" && (
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    <button onClick={() => rejeitarSocio(s.id)} style={{ background:`${T.err}18`, color:T.err, border:`1px solid ${T.err}44`, borderRadius:10, padding:"9px", fontWeight:900, fontSize:13, cursor:"pointer" }}>✗ Rejeitar</button>
                    <button onClick={() => aprovarSocio(s.id)} style={{ background:`${T.verdeClaro}22`, color:T.verdeClaro, border:`1px solid ${T.verdeClaro}55`, borderRadius:10, padding:"9px", fontWeight:900, fontSize:13, cursor:"pointer" }}>✓ Aprovar</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── AGENTES ── */}
        {aba === "agentes" && !carregando && (
          <div>
            <h2 style={{ fontFamily:T.fontDisplay, fontSize:22, color:T.terra, marginBottom:18 }}>Gestão de Agentes</h2>
            <FormNovoAgente onCriar={criarAgente} />
            {agentes.length === 0 && <div style={{ textAlign:"center", color:T.muted, padding:20 }}>Nenhum agente criado ainda.</div>}
            {agentes.map(a => (
              <div key={a.id} style={{ background:T.branco, borderRadius:14, padding:16, marginBottom:10, boxShadow:`0 2px 12px rgba(44,24,16,.07)`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ fontWeight:700, color:T.terra, fontSize:15 }}>{a.nome_completo}</div>
                  <div style={{ fontSize:12, color:T.muted }}>{a.email}</div>
                  <div style={{ fontSize:12, color:T.muted }}>{a.zona_atribuida || "Sem zona definida"}</div>
                </div>
                <button onClick={() => toggleAgente(a.id, a.ativo)} style={{ background: a.ativo ? `${T.verdeClaro}22` : `${T.err}18`, color: a.ativo ? T.verdeClaro : T.err, border:`1px solid ${a.ativo ? T.verdeClaro : T.err}44`, borderRadius:10, padding:"8px 12px", fontWeight:900, fontSize:12, cursor:"pointer" }}>
                  {a.ativo ? "✓ Activo" : "✗ Inactivo"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── MORANÇAS ── */}
        {aba === "morancas" && !carregando && (
          <div>
            <h2 style={{ fontFamily:T.fontDisplay, fontSize:22, color:T.terra, marginBottom:18 }}>Moranças Registadas</h2>
            {morancas.length === 0 && <div style={{ textAlign:"center", color:T.muted, padding:40 }}>Nenhuma morança registada ainda.</div>}
            {morancas.map(m => (
              <div key={m.id} style={{ background:T.branco, borderRadius:14, padding:16, marginBottom:10, boxShadow:`0 2px 12px rgba(44,24,16,.07)` }}>
                <div style={{ fontFamily:T.fontDisplay, fontWeight:700, color:T.terra, fontSize:15, marginBottom:4 }}>{m.chefe_familia}</div>
                <div style={{ fontSize:12, color:T.muted, marginBottom:8 }}>{m.secao} · {m.setor} · {m.regiao}</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6 }}>
                  {[
                    { label:"Homens",   valor:m.total_homens },
                    { label:"Mulheres", valor:m.total_mulheres },
                    { label:"Crianças", valor:m.total_criancas },
                    { label:"Total",    valor:m.numero_residentes },
                  ].map(i => (
                    <div key={i.label} style={{ background:T.creme, borderRadius:8, padding:"8px 6px", textAlign:"center" }}>
                      <div style={{ fontSize:16, fontWeight:900, color:T.terra }}>{i.valor || 0}</div>
                      <div style={{ fontSize:10, color:T.muted }}>{i.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* Formulário para criar novo agente */
function FormNovoAgente({ onCriar }) {
  const [aberto, setAberto]     = useState(false);
  const [dados, setDados]       = useState({ nome_completo:"", email:"", password_hash:"", telefone:"", zona_atribuida:"" });
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const T = {
    terra:"#2C1810", ouro:"#C8922A", ouroVivo:"#E8A830",
    areia:"#D4A574", creme:"#FBF4E8", branco:"#FFFCF5",
    muted:"#8A7060", verdeClaro:"#4A7C24", err:"#C0392B",
  };

  const salvar = async () => {
    if (!dados.nome_completo || !dados.email || !dados.password_hash) {
      setMensagem("❌ Preenche o nome, email e senha!");
      return;
    }
    if (dados.password_hash.length < 6) {
      setMensagem("❌ A senha deve ter mínimo 6 caracteres!");
      return;
    }
    setSalvando(true);
    setMensagem("⏳ A criar agente...");
    await onCriar(dados, setMensagem, setSalvando);
    setDados({ nome_completo:"", email:"", password_hash:"", telefone:"", zona_atribuida:"" });
    setAberto(false);
  };

  return (
    <div style={{ marginBottom:16 }}>
      <button onClick={() => { setAberto(!aberto); setMensagem(""); }} style={{ width:"100%", background:`linear-gradient(135deg,${T.ouro},${T.ouroVivo})`, color:T.terra, border:"none", borderRadius:12, padding:"13px", fontWeight:900, fontSize:14, cursor:"pointer", marginBottom: aberto ? 12 : 0 }}>
        {aberto ? "✕ Cancelar" : "+ Criar Novo Agente"}
      </button>

      {mensagem && (
        <div style={{ background: mensagem.includes("✅") ? `${T.verdeClaro}18` : `${T.err}18`, color: mensagem.includes("✅") ? T.verdeClaro : T.err, border:`1px solid ${mensagem.includes("✅") ? T.verdeClaro : T.err}44`, borderRadius:10, padding:"10px 14px", marginBottom:10, fontSize:13, fontWeight:700 }}>
          {mensagem}
        </div>
      )}

      {aberto && (
        <div style={{ background:T.branco, borderRadius:14, padding:16, border:`1px solid ${T.areia}` }}>
          {[
            { label:"Nome Completo",  campo:"nome_completo",  tipo:"text",     placeholder:"Nome do agente" },
            { label:"Email",          campo:"email",          tipo:"email",    placeholder:"email@exemplo.com" },
            { label:"Senha",          campo:"password_hash",  tipo:"password", placeholder:"Mínimo 6 caracteres" },
            { label:"Telefone",       campo:"telefone",       tipo:"tel",      placeholder:"+245 9XX XXX XXX" },
            { label:"Zona Atribuída", campo:"zona_atribuida", tipo:"text",     placeholder:"Ex: Tambató Norte" },
          ].map(f => (
            <div key={f.campo} style={{ marginBottom:12 }}>
              <label style={{ display:"block", fontSize:11, fontWeight:800, color:T.muted, letterSpacing:1, textTransform:"uppercase", marginBottom:6 }}>{f.label}</label>
              <input type={f.tipo} placeholder={f.placeholder} value={dados[f.campo]}
                onChange={e => setDados(p => ({ ...p, [f.campo]: e.target.value }))}
                style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:`1.5px solid ${T.areia}`, background:T.creme, fontSize:14, color:T.terra, boxSizing:"border-box" }} />
            </div>
          ))}
          <button onClick={salvar} disabled={salvando} style={{ width:"100%", background:T.verdeClaro, color:T.branco, border:"none", borderRadius:10, padding:"12px", fontWeight:900, fontSize:14, cursor:"pointer" }}>
            {salvando ? "⏳ A criar agente..." : "✓ Criar Agente"}
          </button>
        </div>
      )}
    </div>
  );
}
