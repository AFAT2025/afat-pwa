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

const estiloInput = {
  width:"100%", padding:"12px 14px", borderRadius:10,
  border:`1.5px solid ${T.areia}`, background:T.branco,
  fontSize:14, color:T.terra, boxSizing:"border-box", fontFamily:T.fontBody,
};

export default function PainelAgente({ user, onSair }) {
  const [aba, setAba]           = useState("morancas");
  const [morancas, setMorancas] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);

  useEffect(() => { carregarMorancas(); }, []);

  async function carregarMorancas() {
    setCarregando(true);
    const { data } = await supabase
      .from("morancas")
      .select("*")
      .eq("agente_id", user.id)
      .order("data_registo", { ascending: false });
    if (data) setMorancas(data);
    setCarregando(false);
  }

  const totalResidentes = morancas.reduce((a, m) => a + (m.numero_residentes || 0), 0);

  return (
    <div style={{ minHeight:"100vh", background:T.creme, fontFamily:T.fontBody }}>

      {/* Cabeçalho */}
      <div style={{ background:`linear-gradient(135deg,${T.ceuNoite},${T.terra})`, padding:"16px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:24 }}>🏡</span>
          <div>
            <div style={{ color:T.ouro, fontFamily:T.fontDisplay, fontWeight:900, fontSize:16 }}>Área do Agente</div>
            <div style={{ color:"rgba(255,255,255,.5)", fontSize:11 }}>Olá, {user.nome_completo.split(" ")[0]} · {user.zona_atribuida || "Sem zona"}</div>
          </div>
        </div>
        <button onClick={onSair} style={{ background:"rgba(255,255,255,.1)", color:T.branco, border:"1px solid rgba(255,255,255,.2)", borderRadius:10, padding:"8px 14px", fontSize:12, fontWeight:700, cursor:"pointer" }}>
          Sair →
        </button>
      </div>

      {/* Menu */}
      <div style={{ background:T.terra, display:"flex", gap:2, padding:"0 12px" }}>
        {[
          { id:"morancas", label:"🏡 Moranças" },
          { id:"resumo",   label:"📊 Resumo" },
        ].map(a => (
          <button key={a.id} onClick={() => setAba(a.id)} style={{ background: aba===a.id ? T.ouro : "transparent", color: aba===a.id ? T.terra : "rgba(255,255,255,.5)", border:"none", padding:"12px 16px", fontWeight:900, fontSize:12.5, cursor:"pointer", borderRadius:"8px 8px 0 0", transition:"all .2s" }}>
            {a.label}
          </button>
        ))}
      </div>

      <div style={{ padding:18 }}>

        {/* ── MORANÇAS ── */}
        {aba === "morancas" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
              <h2 style={{ fontFamily:T.fontDisplay, fontSize:22, color:T.terra }}>As Minhas Moranças</h2>
              <button onClick={() => setMostrarForm(!mostrarForm)} style={{ background:`linear-gradient(135deg,${T.ouro},${T.ouroVivo})`, color:T.terra, border:"none", borderRadius:10, padding:"9px 14px", fontWeight:900, fontSize:13, cursor:"pointer" }}>
                {mostrarForm ? "✕ Fechar" : "+ Nova"}
              </button>
            </div>

            {mostrarForm && <FormNovaMoreanca agenteId={user.id} onGuardar={() => { carregarMorancas(); setMostrarForm(false); }} />}

            {carregando && <div style={{ textAlign:"center", padding:40, color:T.muted }}>A carregar...</div>}

            {!carregando && morancas.length === 0 && (
              <div style={{ textAlign:"center", padding:40, color:T.muted }}>
                <div style={{ fontSize:40, marginBottom:12 }}>🏡</div>
                <div style={{ fontWeight:700 }}>Nenhuma morança registada ainda.</div>
                <div style={{ fontSize:13, marginTop:6 }}>Clica em "+ Nova" para começar.</div>
              </div>
            )}

            {morancas.map(m => (
              <div key={m.id} style={{ background:T.branco, borderRadius:14, padding:16, marginBottom:10, boxShadow:`0 2px 12px rgba(44,24,16,.07)`, borderLeft:`4px solid ${T.ouro}` }}>
                <div style={{ fontFamily:T.fontDisplay, fontWeight:700, color:T.terra, fontSize:16, marginBottom:4 }}>
                  {m.chefe_familia}
                </div>
                <div style={{ fontSize:12, color:T.muted, marginBottom:10 }}>
                  {[m.secao, m.setor, m.regiao].filter(Boolean).join(" · ")}
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6 }}>
                  {[
                    { label:"Homens",   valor:m.total_homens },
                    { label:"Mulheres", valor:m.total_mulheres },
                    { label:"Crianças", valor:m.total_criancas },
                    { label:"Total",    valor:m.numero_residentes },
                  ].map(i => (
                    <div key={i.label} style={{ background:T.creme, borderRadius:8, padding:"8px 6px", textAlign:"center" }}>
                      <div style={{ fontSize:18, fontWeight:900, color:T.terra }}>{i.valor || 0}</div>
                      <div style={{ fontSize:10, color:T.muted }}>{i.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop:8, fontSize:11, color:T.muted }}>
                  Registado em {new Date(m.data_registo).toLocaleDateString("pt-PT")}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── RESUMO ── */}
        {aba === "resumo" && (
          <div>
            <h2 style={{ fontFamily:T.fontDisplay, fontSize:22, color:T.terra, marginBottom:18 }}>O Meu Resumo</h2>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {[
                { label:"Moranças Registadas", valor:morancas.length,   icone:"🏡", cor:T.ouro },
                { label:"Total Residentes",    valor:totalResidentes,   icone:"👨‍👩‍👧‍👦", cor:T.aguaMar },
                { label:"Total Homens",        valor:morancas.reduce((a,m)=>a+(m.total_homens||0),0),   icone:"👨", cor:T.argila },
                { label:"Total Mulheres",      valor:morancas.reduce((a,m)=>a+(m.total_mulheres||0),0), icone:"👩", cor:T.verdeClaro },
                { label:"Total Crianças",      valor:morancas.reduce((a,m)=>a+(m.total_criancas||0),0), icone:"👶", cor:"#E67E22" },
                { label:"Zona",                valor:user.zona_atribuida || "—", icone:"📍", cor:T.terra },
              ].map(s => (
                <div key={s.label} style={{ background:T.branco, borderRadius:14, padding:16, boxShadow:`0 2px 12px rgba(44,24,16,.07)`, borderLeft:`4px solid ${s.cor}` }}>
                  <div style={{ fontSize:22, marginBottom:6 }}>{s.icone}</div>
                  <div style={{ fontSize:typeof s.valor==="number" ? 28 : 18, fontWeight:900, color:s.cor, fontFamily:T.fontDisplay }}>{s.valor}</div>
                  <div style={{ fontSize:11.5, color:T.muted, fontWeight:700, marginTop:2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* Formulário para registar nova morança */
function FormNovaMoreanca({ agenteId, onGuardar }) {
  const [dados, setDados] = useState({
    chefe_familia:"", secao:"", setor:"", regiao:"",
    total_homens:0, total_mulheres:0, total_criancas:0,
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro]         = useState("");

  const totalResidentes = Number(dados.total_homens) + Number(dados.total_mulheres) + Number(dados.total_criancas);

  const guardar = async () => {
    if (!dados.chefe_familia.trim()) { setErro("Nome do chefe de família é obrigatório."); return; }
    setSalvando(true);
    setErro("");
    const { error } = await supabase.from("morancas").insert([{
      agente_id:       agenteId,
      chefe_familia:   dados.chefe_familia,
      secao:           dados.secao,
      setor:           dados.setor,
      regiao:          dados.regiao,
      total_homens:    Number(dados.total_homens),
      total_mulheres:  Number(dados.total_mulheres),
      total_criancas:  Number(dados.total_criancas),
      numero_residentes: totalResidentes,
      sync_status:     "sincronizado",
    }]);
    if (error) { setErro("Erro ao guardar. Tenta novamente."); }
    else { onGuardar(); }
    setSalvando(false);
  };

  return (
    <div style={{ background:T.branco, borderRadius:14, padding:16, marginBottom:16, border:`1px solid ${T.areia}`, boxShadow:`0 2px 12px rgba(44,24,16,.07)` }}>
      <div style={{ fontFamily:T.fontDisplay, fontSize:16, fontWeight:700, color:T.terra, marginBottom:14 }}>
        🏡 Nova Morança
      </div>

      <div style={{ marginBottom:12 }}>
        <label style={{ display:"block", fontSize:11, fontWeight:800, color:T.muted, letterSpacing:1, textTransform:"uppercase", marginBottom:6 }}>Chefe de Família *</label>
        <input style={estiloInput} placeholder="Nome completo do chefe de família"
          value={dados.chefe_familia} onChange={e => setDados(p => ({ ...p, chefe_familia: e.target.value }))} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
        <div>
          <label style={{ display:"block", fontSize:11, fontWeight:800, color:T.muted, letterSpacing:1, textTransform:"uppercase", marginBottom:6 }}>Secção</label>
          <input style={estiloInput} placeholder="Ex: Candjadja"
            value={dados.secao} onChange={e => setDados(p => ({ ...p, secao: e.target.value }))} />
        </div>
        <div>
          <label style={{ display:"block", fontSize:11, fontWeight:800, color:T.muted, letterSpacing:1, textTransform:"uppercase", marginBottom:6 }}>Setor</label>
          <input style={estiloInput} placeholder="Ex: Mansabã"
            value={dados.setor} onChange={e => setDados(p => ({ ...p, setor: e.target.value }))} />
        </div>
      </div>

      <div style={{ marginBottom:14 }}>
        <label style={{ display:"block", fontSize:11, fontWeight:800, color:T.muted, letterSpacing:1, textTransform:"uppercase", marginBottom:6 }}>Região</label>
        <input style={estiloInput} placeholder="Ex: Oio"
          value={dados.regiao} onChange={e => setDados(p => ({ ...p, regiao: e.target.value }))} />
      </div>

      <div style={{ background:T.creme, borderRadius:10, padding:12, marginBottom:14 }}>
        <div style={{ fontSize:11, fontWeight:800, color:T.muted, letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>Número de Residentes</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
          {[
            { label:"Homens",   campo:"total_homens" },
            { label:"Mulheres", campo:"total_mulheres" },
            { label:"Crianças", campo:"total_criancas" },
          ].map(f => (
            <div key={f.campo}>
              <label style={{ display:"block", fontSize:10, fontWeight:800, color:T.muted, textTransform:"uppercase", marginBottom:5 }}>{f.label}</label>
              <input type="number" min="0" style={{ ...estiloInput, textAlign:"center", padding:"10px 8px" }}
                value={dados[f.campo]} onChange={e => setDados(p => ({ ...p, [f.campo]: e.target.value }))} />
            </div>
          ))}
        </div>
        <div style={{ marginTop:10, textAlign:"center", fontWeight:900, color:T.terra, fontSize:14 }}>
          Total: {totalResidentes} residentes
        </div>
      </div>

      {erro && <div style={{ background:`${T.err}18`, color:T.err, borderRadius:10, padding:"10px 14px", marginBottom:12, fontSize:13, fontWeight:700 }}>⚠ {erro}</div>}

      <button onClick={guardar} disabled={salvando} style={{ width:"100%", background:`linear-gradient(135deg,${T.verde},${T.verdeClaro})`, color:T.branco, border:"none", borderRadius:12, padding:"13px", fontWeight:900, fontSize:14, cursor:"pointer" }}>
        {salvando ? "A guardar..." : "✓ Guardar Morança"}
      </button>
    </div>
  );
}
