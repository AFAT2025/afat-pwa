import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════
   AFAT — PORTAL PÚBLICO & INFORMATIVO
   Mobile-first · Partilhável WhatsApp/Facebook · Offline-Ready
   Design: Terra Africana — Orgânico, Quente, Enraizado
═══════════════════════════════════════════════════════════════ */

/* ── Tokens de Design ──────────────────────────────────────── */
const T = {
  /* Paleta */
  terra:    "#2C1810",
  argila:   "#8B4513",
  ouro:     "#C8922A",
  ouroVivo: "#E8A830",
  areia:    "#D4A574",
  palha:    "#F0D090",
  ceuNoite: "#0D1B2A",
  aguaMar:  "#1B6B7B",
  verde:    "#2D5016",
  verdeClaro: "#4A7C24",
  creme:    "#FBF4E8",
  branco:   "#FFFCF5",
  muted:    "#8A7060",
  err:      "#C0392B",
  /* Tipografia */
  fontDisplay: "'Playfair Display', 'Palatino Linotype', Georgia, serif",
  fontBody:    "'Lato', 'Trebuchet MS', sans-serif",
  fontMono:    "'Courier New', monospace",
};

const css = String.raw;

/* ── CSS Global injetado ───────────────────────────────────── */
const GLOBAL_CSS = css`
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Lato:wght@300;400;700;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
  body { background: ${T.creme}; font-family: ${T.fontBody}; color: ${T.terra}; }

  /* Animações */
  @keyframes fadeUp   { from { opacity:0; transform: translateY(28px); } to { opacity:1; transform: translateY(0); } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes shimmer  { 0%,100% { opacity:.6; } 50% { opacity:1; } }
  @keyframes floatUp  { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
  @keyframes drawLine { from { stroke-dashoffset: 1000; } to { stroke-dashoffset: 0; } }
  @keyframes ripple   { 0% { transform:scale(0); opacity:.6; } 100% { transform:scale(3); opacity:0; } }
  @keyframes pulse    { 0%,100%{ opacity:1; } 50%{ opacity:.55; } }
  @keyframes spin     { to { transform:rotate(360deg); } }

  .animate-up   { animation: fadeUp .6s ease both; }
  .animate-in   { animation: fadeIn .5s ease both; }
  .float        { animation: floatUp 4s ease-in-out infinite; }

  /* Scrollbar discreta */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: ${T.creme}; }
  ::-webkit-scrollbar-thumb { background: ${T.areia}; border-radius: 4px; }

  /* Inputs */
  input, textarea, select {
    font-family: ${T.fontBody};
    outline: none;
    transition: border-color .2s, box-shadow .2s;
  }
  input:focus, textarea:focus, select:focus {
    border-color: ${T.ouro} !important;
    box-shadow: 0 0 0 3px ${T.ouro}28;
  }
  button { font-family: ${T.fontBody}; cursor: pointer; }
`;

/* ════════════════════════════════════════════════════════════
   SECÇÃO 1 — DADOS & CONTEÚDO INSTITUCIONAL
════════════════════════════════════════════════════════════ */
const INFO_AFAT = {
  missao: `A AFAT — Associação dos Filhos e Amigos de Tambató — é um movimento de coesão social que une, em espírito e acção, todos os que têm raízes ou laços afectivos com a tabanca de Tambató, independentemente da distância geográfica. Somos a voz da nossa terra.`,
  objetivos: [
    { icone: "🤝", titulo: "Solidariedade",  texto: "Promover a ajuda mútua entre os membros, apoiando as famílias nos momentos de necessidade e nas celebrações." },
    { icone: "📚", titulo: "Educação",       texto: "Financiar bolsas de estudo e infra-estruturas educativas para os jovens de Tambató." },
    { icone: "🌱", titulo: "Desenvolvimento", texto: "Implementar projectos de desenvolvimento comunitário: saúde, água, agricultura e geração de rendimento." },
    { icone: "🏛️", titulo: "Cultura",        texto: "Preservar e celebrar a herança cultural, as tradições e a língua da comunidade de Tambató." },
    { icone: "🔗", titulo: "Diáspora",       texto: "Criar uma rede activa que mantenha a ligação entre os que vivem em Tambató e os emigrantes espalhados pelo mundo." },
  ],
  estatutos_resumo: [
    { art: "Art.º 1", titulo: "Denominação",      texto: "A associação denomina-se Associação dos Filhos e Amigos de Tambató (AFAT), com sede em Tambató, Secção de Candjadja, Setor de Mansabã, Região de Oio, República da Guiné-Bissau." },
    { art: "Art.º 2", titulo: "Natureza",          texto: "A AFAT é uma associação comunitária de direito privado, sem fins lucrativos, de duração ilimitada e com personalidade jurídica própria." },
    { art: "Art.º 3", titulo: "Membros",           texto: "Podem ser membros todos os naturais de Tambató, os seus descendentes directos, e pessoas que demonstrem laço afectivo comprovado com a comunidade." },
    { art: "Art.º 4", titulo: "Órgãos Sociais",   texto: "Os órgãos da AFAT são: a Assembleia Geral, a Direcção, o Conselho Fiscal e o Secretariado. Todos os cargos são voluntários." },
    { art: "Art.º 5", titulo: "Quota Social",      texto: "A quota anual é fixada pela Assembleia Geral. O cartão de sócio é emitido após regularização da quota e aprovação pela Direcção." },
  ],
};

/* ════════════════════════════════════════════════════════════
   SECÇÃO 2 — UTILITÁRIO: ARMAZENAMENTO LOCAL DO PEDIDO
   (Integração com a fila do Administrador via IndexedDB)
════════════════════════════════════════════════════════════ */

function gerarUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/** Guarda pedido de sócio localmente (simula POST à API). */
async function submeterPedidoSocio(dados) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const pedido = {
        id: gerarUUID(),
        ...dados,
        status:       "pendente",
        data_pedido:  new Date().toISOString(),
        sync_status:  "pendente",
        numero_socio: null,
      };
      /* Em produção:
         fetch('/api/socios', { method:'POST', body: JSON.stringify(pedido), ... }) */
      const existentes = JSON.parse(localStorage.getItem("afat_pedidos_socio") || "[]");
      localStorage.setItem("afat_pedidos_socio", JSON.stringify([...existentes, pedido]));
      resolve(pedido);
    }, 1200);
  });
}

/** Converte File em base64 para pré-visualização e armazenamento. */
function fileParaBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ════════════════════════════════════════════════════════════
   SECÇÃO 3 — COMPONENTES BASE
════════════════════════════════════════════════════════════ */

/* ── Divisor ornamental ────────────────────────────────────── */
function Divisor({ cor = T.ouro }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12, margin:"28px 0" }}>
      <div style={{ flex:1, height:1, background:`linear-gradient(90deg,transparent,${cor}66)` }} />
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <polygon points="11,2 13.5,9 21,9 15,13.5 17,21 11,16.5 5,21 7,13.5 1,9 8.5,9" fill={cor} opacity=".8"/>
      </svg>
      <div style={{ flex:1, height:1, background:`linear-gradient(90deg,${cor}66,transparent)` }} />
    </div>
  );
}

/* ── Tag de secção ─────────────────────────────────────────── */
function TagSeccao({ children, cor = T.ouro }) {
  return (
    <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:`${cor}1A`, border:`1px solid ${cor}55`, borderRadius:30, padding:"5px 14px", marginBottom:12 }}>
      <div style={{ width:6, height:6, borderRadius:"50%", background:cor, animation:"pulse 2s infinite" }} />
      <span style={{ fontSize:11, fontWeight:900, color:cor, letterSpacing:2, textTransform:"uppercase" }}>{children}</span>
    </div>
  );
}

/* ── Título de secção ──────────────────────────────────────── */
function TituloSeccao({ tag, titulo, subtitulo, centro = false, claro = false }) {
  return (
    <div style={{ textAlign: centro ? "center" : "left", marginBottom:24 }}>
      {tag && <TagSeccao cor={claro ? T.palha : T.ouro}>{tag}</TagSeccao>}
      <h2 style={{ fontFamily:T.fontDisplay, fontSize:28, fontWeight:900, color: claro ? T.branco : T.terra, lineHeight:1.18, marginBottom:8 }}>
        {titulo}
      </h2>
      {subtitulo && <p style={{ fontSize:14.5, color: claro ? "rgba(255,255,255,.65)" : T.muted, lineHeight:1.65, maxWidth:540 }}>{subtitulo}</p>}
    </div>
  );
}

/* ── Campo de formulário ───────────────────────────────────── */
function Campo({ label, obrigatorio, erro, dica, children }) {
  return (
    <div style={{ marginBottom:18 }}>
      <label style={{ display:"block", fontSize:12, fontWeight:800, color:T.muted, letterSpacing:.9, textTransform:"uppercase", marginBottom:7 }}>
        {label}{obrigatorio && <span style={{ color:T.err, marginLeft:3 }}>*</span>}
      </label>
      {children}
      {dica  && !erro && <div style={{ fontSize:11.5, color:T.muted,  marginTop:5, lineHeight:1.4 }}>{dica}</div>}
      {erro         && <div style={{ fontSize:11.5, color:T.err, fontWeight:700, marginTop:5 }}>⚠ {erro}</div>}
    </div>
  );
}

const estiloInput = {
  width:"100%", padding:"13px 15px",
  borderRadius:10, border:`1.5px solid ${T.areia}`,
  background:T.branco, fontSize:15, color:T.terra,
  fontFamily:T.fontBody, boxSizing:"border-box",
};

/* ════════════════════════════════════════════════════════════
   SECÇÃO 4 — HERO & NAVEGAÇÃO
════════════════════════════════════════════════════════════ */

function Hero({ onChamarRegisto }) {
  return (
    <div style={{ position:"relative", overflow:"hidden", minHeight:560, display:"flex", flexDirection:"column" }}>
      {/* Fundo multicamada */}
      <div style={{ position:"absolute", inset:0, background:`linear-gradient(170deg, ${T.ceuNoite} 0%, ${T.terra} 45%, ${T.argila} 100%)` }} />

      {/* Padrão geométrico africano */}
      <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:.07 }} viewBox="0 0 400 560" preserveAspectRatio="xMidYMid slice">
        {[...Array(6)].map((_,r) =>
          [...Array(8)].map((_,c) => (
            <polygon key={`${r}-${c}`}
              points={`${c*55+27},${r*90+5} ${c*55+52},${r*90+48} ${c*55+2},${r*90+48}`}
              fill={r%2===c%2 ? T.ouro : T.areia} />
          ))
        )}
      </svg>

      {/* Círculos decorativos */}
      <div style={{ position:"absolute", top:-60, right:-60, width:220, height:220, borderRadius:"50%", border:`2px solid ${T.ouro}33` }} />
      <div style={{ position:"absolute", top:-30, right:-30, width:140, height:140, borderRadius:"50%", border:`1px solid ${T.ouro}22` }} />
      <div style={{ position:"absolute", bottom:60, left:-40, width:160, height:160, borderRadius:"50%", background:`${T.aguaMar}22` }} />

      {/* Nav */}
      <nav style={{ position:"relative", zIndex:10, display:"flex", justifyContent:"space-between", alignItems:"center", padding:"20px 22px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          {/* Logo SVG */}
          <svg width="42" height="42" viewBox="0 0 42 42">
            <circle cx="21" cy="21" r="20" fill={T.ouro} opacity=".15" stroke={T.ouro} strokeWidth=".8"/>
            {/* Embondeiro estilizado */}
            <ellipse cx="21" cy="32" rx="9" ry="4" fill={T.ouro} opacity=".85"/>
            <rect x="19.5" y="18" width="3" height="15" fill={T.ouro} opacity=".85" rx="1.5"/>
            <line x1="21" y1="22" x2="13" y2="14" stroke={T.ouro} strokeWidth="2.5" strokeLinecap="round" opacity=".8"/>
            <line x1="21" y1="20" x2="29" y2="12" stroke={T.ouro} strokeWidth="2.5" strokeLinecap="round" opacity=".8"/>
            <line x1="21" y1="18" x2="16" y2="10" stroke={T.ouro} strokeWidth="1.8" strokeLinecap="round" opacity=".6"/>
            <line x1="21" y1="18" x2="26" y2="10" stroke={T.ouro} strokeWidth="1.8" strokeLinecap="round" opacity=".6"/>
            {/* Mãos */}
            <path d="M8 33 C5 26,10 19,15 24" fill="none" stroke={T.palha} strokeWidth="2.2" strokeLinecap="round" opacity=".75"/>
            <path d="M34 33 C37 26,32 19,27 24" fill="none" stroke={T.palha} strokeWidth="2.2" strokeLinecap="round" opacity=".75"/>
          </svg>
          <div>
            <div style={{ color:T.ouro, fontFamily:T.fontDisplay, fontWeight:900, fontSize:17, letterSpacing:.5, lineHeight:1 }}>AFAT</div>
            <div style={{ color:"rgba(255,255,255,.45)", fontSize:9, letterSpacing:2 }}>TAMBATÓ · OIO</div>
          </div>
        </div>
        <button onClick={onChamarRegisto} style={{ background:`linear-gradient(135deg,${T.ouro},${T.ouroVivo})`, color:T.terra, border:"none", borderRadius:30, padding:"9px 18px", fontWeight:900, fontSize:12.5, letterSpacing:.3, boxShadow:`0 4px 16px ${T.ouro}50` }}>
          Tornar Sócio
        </button>
      </nav>

      {/* Conteúdo hero */}
      <div style={{ position:"relative", zIndex:10, flex:1, display:"flex", flexDirection:"column", justifyContent:"center", padding:"20px 24px 40px" }}>
        <div className="animate-up" style={{ animationDelay:".1s" }}>
          <div style={{ display:"inline-block", background:`${T.ouro}22`, border:`1px solid ${T.ouro}55`, borderRadius:30, padding:"5px 14px", marginBottom:16 }}>
            <span style={{ fontSize:11, fontWeight:900, color:T.palha, letterSpacing:2 }}>REGIÃO DE OIO · GUINÉ-BISSAU</span>
          </div>
        </div>

        <div className="animate-up" style={{ animationDelay:".2s" }}>
          <h1 style={{ fontFamily:T.fontDisplay, fontSize:40, fontWeight:900, color:T.branco, lineHeight:1.1, marginBottom:10 }}>
            Associação dos<br/>
            <em style={{ color:T.ouro, fontStyle:"italic" }}>Filhos e Amigos</em><br/>
            de Tambató
          </h1>
        </div>

        <div className="animate-up" style={{ animationDelay:".3s" }}>
          <p style={{ fontSize:14.5, color:"rgba(255,255,255,.68)", lineHeight:1.7, marginBottom:28, maxWidth:340 }}>
            Unindo gerações, preservando raízes e construindo o futuro da nossa terra — de Tambató para o mundo.
          </p>
        </div>

        <div className="animate-up" style={{ animationDelay:".4s", display:"flex", gap:10, flexWrap:"wrap" }}>
          <button onClick={onChamarRegisto} style={{ background:`linear-gradient(135deg,${T.ouro},${T.ouroVivo})`, color:T.terra, border:"none", borderRadius:12, padding:"14px 24px", fontWeight:900, fontSize:14.5, display:"flex", alignItems:"center", gap:8, boxShadow:`0 6px 24px ${T.ouro}55`, flex:1, justifyContent:"center" }}>
            🪪 Tornar-me Sócio
          </button>
          <button onClick={() => document.getElementById("sobre")?.scrollIntoView({behavior:"smooth"})} style={{ background:"rgba(255,255,255,.1)", color:T.branco, border:"1px solid rgba(255,255,255,.2)", borderRadius:12, padding:"14px 20px", fontWeight:700, fontSize:13.5, backdropFilter:"blur(8px)", flex:1, justifyContent:"center", display:"flex" }}>
            Conhecer a AFAT
          </button>
        </div>
      </div>

      {/* Onda decorativa na base */}
      <div style={{ position:"absolute", bottom:0, left:0, right:0 }}>
        <svg viewBox="0 0 400 50" preserveAspectRatio="none" style={{ display:"block", height:50 }}>
          <path d="M0,30 C80,0 160,50 240,20 C320,-10 380,30 400,20 L400,50 L0,50 Z" fill={T.creme}/>
        </svg>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   SECÇÃO 5 — SOBRE TAMBATÓ (GEOGRÁFICO)
════════════════════════════════════════════════════════════ */

function SobreTambato() {
  const fronteiras = [
    { dir:"Norte",  local:"Djabacunda",          icone:"🧭", tipo:"terrestre" },
    { dir:"Sul",    local:"Buro",                icone:"🧭", tipo:"terrestre" },
    { dir:"Leste",  local:"Madina Saladala",      icone:"🧭", tipo:"terrestre" },
    { dir:"Oeste",  local:"Canicô Lenquecurotô", icone:"🌊", tipo:"marítima" },
  ];

  return (
    <section id="sobre" style={{ background:T.creme, padding:"50px 22px" }}>
      <TituloSeccao
        tag="Sobre Tambató"
        titulo="A Nossa Terra"
        subtitulo="Conhece a localização, as fronteiras e a história da tabanca de Tambató, no coração da Região de Oio."
      />

      {/* Mapa conceptual — card estilizado */}
      <div style={{ background:`linear-gradient(145deg,${T.terra},${T.ceuNoite})`, borderRadius:20, padding:24, marginBottom:24, position:"relative", overflow:"hidden", boxShadow:`0 8px 40px rgba(0,0,0,.25)` }}>
        <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:.08 }} viewBox="0 0 300 220">
          {[...Array(5)].map((_,i) => <line key={i} x1="0" y1={i*44} x2="300" y2={i*44} stroke={T.ouro} strokeWidth=".5"/>)}
          {[...Array(7)].map((_,i) => <line key={i} x1={i*50} y1="0" x2={i*50} y2="220" stroke={T.ouro} strokeWidth=".5"/>)}
          {/* Ponto de Tambató */}
          <circle cx="150" cy="110" r="20" fill={T.ouro} opacity=".2"/>
          <circle cx="150" cy="110" r="8"  fill={T.ouro} opacity=".6"/>
          <circle cx="150" cy="110" r="3"  fill={T.ouro}/>
        </svg>

        <div style={{ position:"relative", zIndex:1 }}>
          {/* Hierarquia administrativa */}
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:18, flexWrap:"wrap" }}>
            {[
              { nivel:"República",  valor:"Guiné-Bissau" },
              { nivel:"Região",     valor:"Oio" },
              { nivel:"Setor",      valor:"Mansabã" },
              { nivel:"Secção",     valor:"Candjadja" },
              { nivel:"Tabanca",    valor:"Tambató", destaque:true },
            ].map((n, i) => (
              <div key={n.nivel} style={{ display:"flex", alignItems:"center", gap:8 }}>
                {i > 0 && <span style={{ color:T.ouro, fontSize:14, opacity:.6 }}>›</span>}
                <div style={{ background: n.destaque ? T.ouro : "rgba(255,255,255,.1)", borderRadius:8, padding:"6px 12px" }}>
                  <div style={{ fontSize:9, color: n.destaque ? T.terra : "rgba(255,255,255,.5)", fontWeight:800, letterSpacing:1, textTransform:"uppercase" }}>{n.nivel}</div>
                  <div style={{ fontSize:13, fontWeight: n.destaque ? 900 : 700, color: n.destaque ? T.terra : T.branco, fontFamily:T.fontDisplay }}>{n.valor}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {fronteiras.map((f) => (
              <div key={f.dir} style={{ background:`rgba(255,255,255,.08)`, borderRadius:12, padding:"12px 14px", border:`1px solid ${f.tipo==="marítima" ? T.aguaMar : T.ouro}44` }}>
                <div style={{ fontSize:18, marginBottom:4 }}>{f.icone}</div>
                <div style={{ fontSize:10, color:f.tipo==="marítima" ? "#7DD3FC" : T.palha, fontWeight:800, letterSpacing:1, textTransform:"uppercase" }}>
                  {f.dir} · {f.tipo}
                </div>
                <div style={{ fontSize:13.5, fontWeight:700, color:T.branco, marginTop:2, fontFamily:T.fontDisplay }}>
                  {f.local}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop:16, padding:"12px 14px", background:`${T.aguaMar}33`, borderRadius:10, border:`1px solid ${T.aguaMar}55` }}>
            <div style={{ fontSize:12, color:"#7DD3FC", fontWeight:800 }}>🌊 Fronteira Marítima</div>
            <div style={{ fontSize:13, color:"rgba(255,255,255,.75)", marginTop:4, lineHeight:1.55 }}>
              Tambató faz fronteira a Oeste com o estuário de <strong style={{ color:"#7DD3FC" }}>Canicô Lenquecurotô</strong>, oferecendo acesso às riquezas piscatórias e ao corredor fluvial da região.
            </div>
          </div>
        </div>
      </div>

      {/* Curiosidades culturais */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {[
          { icone:"🌳", titulo:"Embondeiro",    texto:"A árvore da vida é símbolo da permanência de Tambató e da resistência da sua gente." },
          { icone:"🎣", titulo:"Rio e Mar",     texto:"A proximidade às águas define a subsistência e a identidade da comunidade." },
          { icone:"🌾", titulo:"Agricultura",   texto:"O cultivo do arroz e do cajú são a espinha dorsal da economia local." },
          { icone:"🥁", titulo:"Cultura Oral",  texto:"As histórias, músicas e rituais transmitem o conhecimento de geração em geração." },
        ].map((c) => (
          <div key={c.titulo} style={{ background:T.branco, borderRadius:14, padding:16, boxShadow:`0 2px 12px rgba(44,24,16,.07)` }}>
            <div style={{ fontSize:26, marginBottom:8 }}>{c.icone}</div>
            <div style={{ fontFamily:T.fontDisplay, fontSize:15, fontWeight:700, color:T.terra, marginBottom:5 }}>{c.titulo}</div>
            <div style={{ fontSize:12, color:T.muted, lineHeight:1.55 }}>{c.texto}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   SECÇÃO 6 — MISSÃO, OBJETIVOS & ESTATUTOS
════════════════════════════════════════════════════════════ */

function SeccaoInstitucional() {
  const [abaStat, setAbaStat] = useState(0);

  return (
    <section id="missao" style={{ padding:"50px 22px", background:`linear-gradient(180deg,${T.creme},#EDE4D0)` }}>

      {/* Missão */}
      <div style={{ background:`linear-gradient(135deg,${T.terra},${T.argila})`, borderRadius:20, padding:26, marginBottom:30, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-20, right:-20, width:120, height:120, borderRadius:"50%", background:`${T.ouro}18` }} />
        <div style={{ position:"absolute", bottom:-30, left:-20, width:100, height:100, borderRadius:"50%", background:`${T.ouroVivo}12` }} />
        <TituloSeccao tag="Nossa Missão" titulo="Porquê Existimos" claro />
        <p style={{ fontSize:15, color:"rgba(255,255,255,.8)", lineHeight:1.75, position:"relative", zIndex:1, borderLeft:`3px solid ${T.ouro}`, paddingLeft:16, fontStyle:"italic", fontFamily:T.fontDisplay }}>
          "{INFO_AFAT.missao}"
        </p>
      </div>

      {/* Objetivos */}
      <TituloSeccao tag="Objetivos" titulo="O Que Fazemos" subtitulo="Cinco pilares que guiam a acção da AFAT no presente e no futuro." />

      <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:30 }}>
        {INFO_AFAT.objetivos.map((obj, i) => (
          <div key={obj.titulo} className="animate-up" style={{ animationDelay:`${i*.08}s`, background:T.branco, borderRadius:14, padding:16, display:"flex", gap:14, alignItems:"flex-start", boxShadow:`0 2px 14px rgba(44,24,16,.06)`, borderLeft:`4px solid ${T.ouro}` }}>
            <div style={{ width:44, height:44, background:`${T.ouro}18`, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>
              {obj.icone}
            </div>
            <div>
              <div style={{ fontFamily:T.fontDisplay, fontSize:15.5, fontWeight:700, color:T.terra, marginBottom:4 }}>{obj.titulo}</div>
              <div style={{ fontSize:13, color:T.muted, lineHeight:1.6 }}>{obj.texto}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Estatutos — acordeão */}
      <TituloSeccao tag="Estatutos" titulo="Quadro Legal" subtitulo="Principais artigos dos estatutos da AFAT." />

      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {INFO_AFAT.estatutos_resumo.map((est, i) => (
          <div key={est.art} style={{ background:T.branco, borderRadius:12, overflow:"hidden", boxShadow:`0 2px 10px rgba(44,24,16,.05)` }}>
            <button
              onClick={() => setAbaStat(abaStat === i ? -1 : i)}
              style={{ width:"100%", background:"none", border:"none", padding:"14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer", textAlign:"left" }}>
              <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                <span style={{ background:`${T.ouro}22`, color:T.ouro, borderRadius:8, padding:"3px 9px", fontSize:10.5, fontWeight:900, fontFamily:T.fontMono }}>{est.art}</span>
                <span style={{ fontWeight:800, color:T.terra, fontSize:14 }}>{est.titulo}</span>
              </div>
              <span style={{ color:T.muted, fontSize:18, transform:abaStat===i ? "rotate(180deg)":"none", transition:"transform .25s" }}>⌄</span>
            </button>
            {abaStat === i && (
              <div style={{ padding:"4px 16px 16px", borderTop:`1px solid ${T.areia}55` }}>
                <p style={{ fontSize:13.5, color:T.muted, lineHeight:1.7 }}>{est.texto}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   SECÇÃO 7 — FORMULÁRIO DE REGISTO DE SÓCIO
════════════════════════════════════════════════════════════ */

const PAISES_DIASPORA = [
  "Guiné-Bissau", "Portugal", "França", "Espanha", "Senegal",
  "Gâmbia", "Brasil", "Estados Unidos", "Angola", "Cabo Verde", "Outro",
];

function FormularioSocio({ onSucesso }) {
  const [passo, setPasso]     = useState(1);
  const [dados, setDados]     = useState({
    nome_completo:"", data_nascimento:"", genero:"",
    telefone:"", whatsapp:"", email:"",
    pais_residencia:"Guiné-Bissau", cidade_residencia:"",
    naturalidade:"Tambató", filiacao:"",
    foto:null, fotoPreview:null,
  });
  const [erros, setErros]     = useState({});
  const [enviando, setEnviando] = useState(false);
  const inputFotoRef = useRef();

  const atualizar = (campo, valor) => {
    setDados(p => ({ ...p, [campo]: valor }));
    setErros(p => ({ ...p, [campo]: null }));
  };

  const aoSelecionarFoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErros(p => ({ ...p, foto: "A foto não pode exceder 5 MB." }));
      return;
    }
    const b64 = await fileParaBase64(file);
    setDados(p => ({ ...p, foto: b64, fotoPreview: b64 }));
    setErros(p => ({ ...p, foto: null }));
  };

  const validar = () => {
    const e = {};
    if (passo === 1) {
      if (!dados.nome_completo.trim())   e.nome_completo  = "Nome é obrigatório";
      if (!dados.data_nascimento)        e.data_nascimento = "Data de nascimento é obrigatória";
      if (!dados.genero)                 e.genero         = "Indique o género";
    }
    if (passo === 2) {
      if (!dados.telefone.trim())        e.telefone       = "Contacto telefónico é obrigatório";
      if (!dados.pais_residencia)        e.pais_residencia = "Indique o país de residência";
    }
    setErros(e);
    return Object.keys(e).length === 0;
  };

  const avancar  = () => { if (validar()) setPasso(p => p + 1); };
  const recuar   = () => setPasso(p => p - 1);

  const submeter = async () => {
    if (!validar()) return;
    setEnviando(true);
    try {
      const pedido = await submeterPedidoSocio({
        nome_completo:    dados.nome_completo,
        data_nascimento:  dados.data_nascimento,
        genero:           dados.genero,
        telefone:         dados.telefone,
        whatsapp:         dados.whatsapp || dados.telefone,
        email:            dados.email,
        pais_residencia:  dados.pais_residencia,
        cidade_residencia: dados.cidade_residencia,
        naturalidade:     dados.naturalidade,
        filiacao:         dados.filiacao,
        foto:             dados.foto,
      });
      onSucesso(pedido);
    } catch { setErros({ global:"Erro ao enviar. Tente novamente." }); }
    finally   { setEnviando(false); }
  };

  /* ── Indicador de passos ─────────────────────────────── */
  const PassoIndicador = () => (
    <div style={{ display:"flex", justifyContent:"center", gap:6, marginBottom:24 }}>
      {[1,2,3].map(n => (
        <div key={n} style={{ display:"flex", alignItems:"center", gap:6 }}>
          <div style={{ width:32, height:32, borderRadius:"50%", background: passo>=n ? T.ouro : T.areia, color: passo>=n ? T.terra : T.muted, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:13, transition:"all .3s" }}>
            {passo > n ? "✓" : n}
          </div>
          {n < 3 && <div style={{ width:28, height:3, borderRadius:20, background: passo > n ? T.ouro : T.areia, transition:"background .3s" }} />}
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ background:`${T.terra}0D`, borderRadius:18, padding:"0 0 8px", border:`1px solid ${T.areia}` }}>
      {/* Header do formulário */}
      <div style={{ background:`linear-gradient(135deg,${T.terra},${T.argila})`, borderRadius:"18px 18px 0 0", padding:"22px 22px 18px" }}>
        <div style={{ color:T.ouro, fontSize:11, fontWeight:900, letterSpacing:2, marginBottom:6 }}>FORMULÁRIO DE ADESÃO</div>
        <h3 style={{ fontFamily:T.fontDisplay, color:T.branco, fontSize:20, fontWeight:900, marginBottom:4 }}>
          Pedido de Cartão de Sócio
        </h3>
        <p style={{ color:"rgba(255,255,255,.6)", fontSize:12.5, lineHeight:1.55 }}>
          Preenche os teus dados. O pedido será analisado pela Direcção da AFAT.
        </p>
      </div>

      <div style={{ padding:"20px 18px 8px" }}>
        <PassoIndicador />

        {/* ── PASSO 1: Identificação ─────────────────────── */}
        {passo === 1 && (
          <div className="animate-in">
            <div style={{ fontFamily:T.fontDisplay, fontSize:16, fontWeight:700, color:T.terra, marginBottom:18 }}>
              👤 Dados Pessoais
            </div>

            <Campo label="Nome Completo" obrigatorio erro={erros.nome_completo}>
              <input style={estiloInput} placeholder="O teu nome completo..."
                value={dados.nome_completo} onChange={e => atualizar("nome_completo", e.target.value)} />
            </Campo>

            <Campo label="Filiação (Nome do Pai / Mãe)" dica="Ajuda a distinguir homónimos">
              <input style={estiloInput} placeholder="Ex: Filho de Mamadu Baldé..."
                value={dados.filiacao} onChange={e => atualizar("filiacao", e.target.value)} />
            </Campo>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <Campo label="Data de Nascimento" obrigatorio erro={erros.data_nascimento}>
                <input type="date" style={estiloInput}
                  value={dados.data_nascimento} onChange={e => atualizar("data_nascimento", e.target.value)} />
              </Campo>
              <Campo label="Género" obrigatorio erro={erros.genero}>
                <select style={estiloInput} value={dados.genero} onChange={e => atualizar("genero", e.target.value)}>
                  <option value="">Selecionar...</option>
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                  <option value="N/D">Prefiro não dizer</option>
                </select>
              </Campo>
            </div>

            <Campo label="Naturalidade" dica="Localidade onde nasceste">
              <input style={estiloInput} placeholder="Ex: Tambató, Mansabã..."
                value={dados.naturalidade} onChange={e => atualizar("naturalidade", e.target.value)} />
            </Campo>

            <button onClick={avancar} style={{ width:"100%", background:`linear-gradient(135deg,${T.ouro},${T.ouroVivo})`, color:T.terra, border:"none", borderRadius:12, padding:"14px", fontWeight:900, fontSize:15, marginTop:4 }}>
              Próximo: Contacto →
            </button>
          </div>
        )}

        {/* ── PASSO 2: Contacto & Residência ─────────────── */}
        {passo === 2 && (
          <div className="animate-in">
            <div style={{ fontFamily:T.fontDisplay, fontSize:16, fontWeight:700, color:T.terra, marginBottom:18 }}>
              📞 Contacto & Residência
            </div>

            <Campo label="Número de Telefone" obrigatorio erro={erros.telefone} dica="Número local ou internacional">
              <input type="tel" style={estiloInput} placeholder="+245 9XX XXX XXX"
                value={dados.telefone} onChange={e => atualizar("telefone", e.target.value)} />
            </Campo>

            <Campo label="WhatsApp" dica="Se for diferente do telefone acima">
              <input type="tel" style={estiloInput} placeholder="+245 9XX XXX XXX"
                value={dados.whatsapp} onChange={e => atualizar("whatsapp", e.target.value)} />
            </Campo>

            <Campo label="Email (opcional)">
              <input type="email" style={estiloInput} placeholder="o.teu@email.com"
                value={dados.email} onChange={e => atualizar("email", e.target.value)} />
            </Campo>

            <Campo label="País de Residência" obrigatorio erro={erros.pais_residencia}>
              <select style={estiloInput} value={dados.pais_residencia} onChange={e => atualizar("pais_residencia", e.target.value)}>
                {PAISES_DIASPORA.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </Campo>

            <Campo label="Cidade / Região de Residência">
              <input style={estiloInput} placeholder="Ex: Bissau, Lisboa, Paris..."
                value={dados.cidade_residencia} onChange={e => atualizar("cidade_residencia", e.target.value)} />
            </Campo>

            {/* Indicador de diáspora */}
            {dados.pais_residencia !== "Guiné-Bissau" && (
              <div style={{ background:`${T.aguaMar}18`, border:`1px solid ${T.aguaMar}44`, borderRadius:10, padding:"10px 14px", marginBottom:14, fontSize:12.5, color:T.aguaMar, fontWeight:700 }}>
                🌍 Membro da Diáspora — Bem-vindo! A AFAT une Tambató ao mundo.
              </div>
            )}

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <button onClick={recuar} style={{ background:T.areia, color:T.terra, border:"none", borderRadius:12, padding:"13px", fontWeight:800, fontSize:14 }}>← Anterior</button>
              <button onClick={avancar} style={{ background:`linear-gradient(135deg,${T.ouro},${T.ouroVivo})`, color:T.terra, border:"none", borderRadius:12, padding:"13px", fontWeight:900, fontSize:14 }}>Próximo: Foto →</button>
            </div>
          </div>
        )}

        {/* ── PASSO 3: Foto + Revisão ─────────────────────── */}
        {passo === 3 && (
          <div className="animate-in">
            <div style={{ fontFamily:T.fontDisplay, fontSize:16, fontWeight:700, color:T.terra, marginBottom:18 }}>
              📷 Foto para o Cartão
            </div>

            {/* Upload de foto */}
            <Campo label="Foto Tipo Passe" erro={erros.foto} dica="JPEG/PNG · Até 5 MB · Fundo neutro recomendado">
              <div
                onClick={() => inputFotoRef.current?.click()}
                style={{ border:`2px dashed ${dados.fotoPreview ? T.ouro : T.areia}`, borderRadius:14, padding:dados.fotoPreview ? 0 : "28px 20px", textAlign:"center", cursor:"pointer", transition:"border-color .2s", overflow:"hidden", background: dados.fotoPreview ? "none" : T.branco }}>
                {dados.fotoPreview ? (
                  <div style={{ position:"relative" }}>
                    <img src={dados.fotoPreview} alt="Pré-visualização" style={{ width:"100%", maxHeight:240, objectFit:"cover", display:"block" }} />
                    <div style={{ position:"absolute", bottom:8, right:8, background:"rgba(0,0,0,.6)", color:T.branco, borderRadius:8, padding:"4px 10px", fontSize:11, fontWeight:700 }}>
                      Toca para alterar
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize:36, marginBottom:8 }}>📷</div>
                    <div style={{ fontWeight:700, color:T.terra, fontSize:14, marginBottom:4 }}>Adicionar Foto</div>
                    <div style={{ fontSize:12, color:T.muted }}>Toca aqui para escolher do telemóvel</div>
                  </>
                )}
              </div>
              <input ref={inputFotoRef} type="file" accept="image/*" capture="user" onChange={aoSelecionarFoto} style={{ display:"none" }} />
            </Campo>

            {/* Resumo dos dados */}
            <div style={{ background:T.branco, borderRadius:14, padding:16, marginBottom:18, border:`1px solid ${T.areia}` }}>
              <div style={{ fontWeight:800, color:T.terra, fontSize:12, letterSpacing:.8, textTransform:"uppercase", marginBottom:12 }}>Resumo do Pedido</div>
              {[
                ["Nome", dados.nome_completo],
                ["Nascimento", dados.data_nascimento ? new Date(dados.data_nascimento + "T00:00:00").toLocaleDateString("pt-PT") : "—"],
                ["Género",     dados.genero === "M" ? "Masculino" : dados.genero === "F" ? "Feminino" : dados.genero],
                ["Telefone",   dados.telefone],
                ["Residência", `${dados.cidade_residencia || "—"} · ${dados.pais_residencia}`],
              ].map(([l,v]) => (
                <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:`1px solid ${T.areia}55`, fontSize:13 }}>
                  <span style={{ color:T.muted }}>{l}</span>
                  <span style={{ fontWeight:700, color:T.terra, textAlign:"right", maxWidth:"55%" }}>{v || "—"}</span>
                </div>
              ))}
            </div>

            {erros.global && (
              <div style={{ background:`${T.err}18`, color:T.err, border:`1px solid ${T.err}44`, borderRadius:10, padding:"10px 14px", marginBottom:12, fontSize:13, fontWeight:700 }}>
                ⚠ {erros.global}
              </div>
            )}

            <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:10 }}>
              <button onClick={recuar} style={{ background:T.areia, color:T.terra, border:"none", borderRadius:12, padding:"13px", fontWeight:800, fontSize:13 }}>← Voltar</button>
              <button onClick={submeter} disabled={enviando} style={{ background: enviando ? T.areia : `linear-gradient(135deg,${T.verde},${T.verdeClaro})`, color: enviando ? T.muted : T.branco, border:"none", borderRadius:12, padding:"13px", fontWeight:900, fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                {enviando ? <><span style={{ width:16,height:16, border:`2px solid ${T.muted}`, borderTopColor:"transparent", borderRadius:"50%", display:"inline-block", animation:"spin .8s linear infinite" }} /> A enviar...</> : "✓ Enviar Pedido"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   SECÇÃO 8 — ECRAN DE SUCESSO
════════════════════════════════════════════════════════════ */

function EcranSucesso({ pedido, onPartilhar, onNovoPedido }) {
  return (
    <div className="animate-up" style={{ textAlign:"center", padding:"10px 0 16px" }}>
      {/* Anel animado de sucesso */}
      <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:90, height:90, borderRadius:"50%", background:`${T.verdeClaro}22`, border:`3px solid ${T.verdeClaro}`, marginBottom:20, position:"relative" }}>
        <div style={{ position:"absolute", inset:-8, borderRadius:"50%", border:`1.5px solid ${T.verdeClaro}44`, animation:"pulse 2s infinite" }} />
        <span style={{ fontSize:38 }}>✅</span>
      </div>

      <h3 style={{ fontFamily:T.fontDisplay, fontSize:22, fontWeight:900, color:T.terra, marginBottom:10 }}>
        Pedido Enviado com Sucesso!
      </h3>

      <div style={{ background:`${T.verdeClaro}15`, border:`1px solid ${T.verdeClaro}44`, borderRadius:14, padding:18, marginBottom:20, textAlign:"left" }}>
        <div style={{ fontSize:13, color:T.terra, lineHeight:1.7 }}>
          <strong style={{ color:T.verdeClaro }}>Olá, {pedido.nome_completo.split(" ")[0]}!</strong><br/><br/>
          O teu pedido de adesão foi recebido e encontra-se agora em <strong>análise pela Direcção da AFAT</strong>.<br/><br/>
          O teu <strong>Cartão de Sócio</strong> será emitido após aprovação e quando o lote de impressão estiver completo. Serás contactado no número <strong>{pedido.telefone}</strong>.<br/><br/>
          <span style={{ color:T.muted, fontSize:12 }}>Referência: <span style={{ fontFamily:T.fontMono }}>{pedido.id?.slice(0,8).toUpperCase()}</span></span>
        </div>
      </div>

      {/* Botões de partilha */}
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:13, color:T.muted, fontWeight:700, marginBottom:10 }}>Convida os teus amigos e familiares:</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          <button onClick={() => onPartilhar("whatsapp")} style={{ background:"#25D366", color:T.branco, border:"none", borderRadius:12, padding:"13px 10px", fontWeight:900, fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
            <WhatsAppIcon /> WhatsApp
          </button>
          <button onClick={() => onPartilhar("facebook")} style={{ background:"#1877F2", color:T.branco, border:"none", borderRadius:12, padding:"13px 10px", fontWeight:900, fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
            <FacebookIcon /> Facebook
          </button>
        </div>
      </div>

      <button onClick={onNovoPedido} style={{ background:"none", color:T.muted, border:`1px solid ${T.areia}`, borderRadius:12, padding:"10px 20px", fontSize:13, fontWeight:700, width:"100%" }}>
        Registar outro membro
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   SECÇÃO 9 — SECÇÃO DE PARTILHA SOCIAL
════════════════════════════════════════════════════════════ */

const TEXTO_PARTILHA = `🌳 *AFAT — Associação dos Filhos e Amigos de Tambató*

Se tens ligação à nossa terra, junta-te a nós! 🤝

👉 Regista-te como Sócio da AFAT e recebe o teu Cartão de Membro.

A plataforma está aberta a todos os filhos e amigos de Tambató, dentro e fora da Guiné-Bissau.

🔗 Acede aqui: ${window.location.href}

_União · Solidariedade · Desenvolvimento_`;

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function SeccaoPartilha() {
  const partilhar = useCallback((rede) => {
    const url    = encodeURIComponent(window.location.href);
    const texto  = encodeURIComponent(TEXTO_PARTILHA);
    const links  = {
      whatsapp: `https://wa.me/?text=${texto}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${texto}`,
    };
    window.open(links[rede], "_blank", "noopener,noreferrer");
  }, []);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copiado! Partilha com os teus amigos.");
    } catch { alert(window.location.href); }
  };

  return (
    <section style={{ background:`linear-gradient(135deg,${T.terra},${T.ceuNoite})`, padding:"44px 22px", textAlign:"center", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:-40, left:"50%", transform:"translateX(-50%)", width:300, height:300, borderRadius:"50%", background:`${T.ouro}08` }} />

      <div style={{ position:"relative", zIndex:1 }}>
        <div style={{ fontSize:40, marginBottom:12, className:"float" }}>🌍</div>
        <TituloSeccao
          tag="Crescer Juntos"
          titulo="Convida a tua Família"
          subtitulo="Partilha este link com todos os Filhos e Amigos de Tambató — na Guiné e na Diáspora."
          centro claro
        />

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
          <button onClick={() => partilhar("whatsapp")} style={{ background:"#25D366", color:T.branco, border:"none", borderRadius:14, padding:"16px 12px", fontWeight:900, fontSize:15, display:"flex", alignItems:"center", justifyContent:"center", gap:10, boxShadow:"0 4px 20px rgba(37,211,102,.35)" }}>
            <WhatsAppIcon /> Partilhar no WhatsApp
          </button>
          <button onClick={() => partilhar("facebook")} style={{ background:"#1877F2", color:T.branco, border:"none", borderRadius:14, padding:"16px 12px", fontWeight:900, fontSize:15, display:"flex", alignItems:"center", justifyContent:"center", gap:10, boxShadow:"0 4px 20px rgba(24,119,242,.35)" }}>
            <FacebookIcon /> Partilhar no Facebook
          </button>
        </div>

        <button onClick={copiar} style={{ width:"100%", background:"rgba(255,255,255,.1)", color:T.branco, border:"1px solid rgba(255,255,255,.2)", borderRadius:14, padding:"13px", fontWeight:700, fontSize:14, backdropFilter:"blur(8px)" }}>
          🔗 Copiar Link
        </button>

        <div style={{ marginTop:20, padding:"14px", background:"rgba(255,255,255,.06)", borderRadius:12, border:`1px solid rgba(255,255,255,.1)` }}>
          <p style={{ fontSize:12.5, color:"rgba(255,255,255,.55)", lineHeight:1.6, fontStyle:"italic", fontFamily:T.fontDisplay }}>
            "Somos mais fortes juntos. Cada membro que se junta é uma raiz que fortalece a nossa árvore."
          </p>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
   SECÇÃO 10 — RODAPÉ
════════════════════════════════════════════════════════════ */

function Rodape() {
  return (
    <footer style={{ background:T.terra, padding:"28px 22px 20px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16, paddingBottom:16, borderBottom:`1px solid rgba(255,255,255,.1)` }}>
        <div style={{ width:40, height:40, background:`${T.ouro}22`, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <span style={{ fontSize:20 }}>🌳</span>
        </div>
        <div>
          <div style={{ color:T.ouro, fontFamily:T.fontDisplay, fontWeight:900, fontSize:15 }}>AFAT</div>
          <div style={{ color:"rgba(255,255,255,.4)", fontSize:10.5, letterSpacing:1 }}>Associação dos Filhos e Amigos de Tambató</div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
        <div>
          <div style={{ color:T.ouro, fontSize:11, fontWeight:800, letterSpacing:.8, marginBottom:8 }}>LOCALIZAÇÃO</div>
          {["🇬🇼 Guiné-Bissau", "📍 Região de Oio", "📍 Setor de Mansabã", "📍 Secção de Candjadja", "🏡 Tambató"].map(l => (
            <div key={l} style={{ color:"rgba(255,255,255,.5)", fontSize:12, marginBottom:4 }}>{l}</div>
          ))}
        </div>
        <div>
          <div style={{ color:T.ouro, fontSize:11, fontWeight:800, letterSpacing:.8, marginBottom:8 }}>PLATAFORMA</div>
          {["🔒 Área do Agente", "⚙️ Painel Admin", "🪪 Registo de Sócio", "📊 Estatísticas", "📥 Exportação"].map(l => (
            <div key={l} style={{ color:"rgba(255,255,255,.5)", fontSize:12, marginBottom:4 }}>{l}</div>
          ))}
        </div>
      </div>

      <div style={{ textAlign:"center", fontSize:11, color:"rgba(255,255,255,.25)", letterSpacing:.5 }}>
        © {new Date().getFullYear()} AFAT · Tambató · República da Guiné-Bissau · v1.0
      </div>
    </footer>
  );
}

/* ════════════════════════════════════════════════════════════
   SECÇÃO 11 — COMPONENTE PRINCIPAL (APP)
════════════════════════════════════════════════════════════ */

export default function PortalPublicoAFAT() {
  const [vista, setVista]           = useState("landing");  // 'landing' | 'registo' | 'sucesso'
  const [pedidoSucesso, setPedido]  = useState(null);
  const registoRef                  = useRef();

  const irParaRegisto = () => {
    setVista("registo");
    setTimeout(() => registoRef.current?.scrollIntoView({ behavior:"smooth", block:"start" }), 80);
  };

  const aoSucesso = (pedido) => {
    setPedido(pedido);
    setVista("sucesso");
    window.scrollTo({ top: 0, behavior:"smooth" });
  };

  const partilharRede = useCallback((rede) => {
    const url   = encodeURIComponent(window.location.href);
    const texto = encodeURIComponent(TEXTO_PARTILHA);
    const links = {
      whatsapp: `https://wa.me/?text=${texto}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${texto}`,
    };
    window.open(links[rede], "_blank", "noopener,noreferrer");
  }, []);

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ maxWidth:480, margin:"0 auto", boxShadow:"0 0 60px rgba(0,0,0,.12)", minHeight:"100vh", background:T.creme, position:"relative" }}>

        {/* ── ECRAN DE SUCESSO ──────────────────────────── */}
        {vista === "sucesso" && pedidoSucesso && (
          <div style={{ padding:"28px 20px" }}>
            <EcranSucesso
              pedido={pedidoSucesso}
              onPartilhar={partilharRede}
              onNovoPedido={() => { setPedido(null); setVista("registo"); }}
            />
          </div>
        )}

        {/* ── PORTAL PRINCIPAL ──────────────────────────── */}
        {vista !== "sucesso" && (
          <>
            <Hero onChamarRegisto={irParaRegisto} />
            <SobreTambato />

            <Divisor />

            <SeccaoInstitucional />

            <Divisor />

            {/* Secção de Formulário */}
            <section id="registo" ref={registoRef} style={{ padding:"46px 22px 36px", background:T.creme }}>
              <TituloSeccao
                tag="Tornar Sócio"
                titulo="Junta-te à AFAT"
                subtitulo="Preenche o formulário abaixo. É gratuito e rápido. O teu Cartão de Sócio será emitido após aprovação da Direcção."
              />

              {vista === "registo" ? (
                <FormularioSocio onSucesso={aoSucesso} />
              ) : (
                /* CTA de apelo quando está na landing */
                <div style={{ background:`linear-gradient(135deg,${T.ouro}18,${T.areia}44)`, border:`2px solid ${T.ouro}55`, borderRadius:20, padding:26, textAlign:"center" }}>
                  <div style={{ fontSize:44, marginBottom:12, animation:"floatUp 3s ease-in-out infinite" }}>🪪</div>
                  <h3 style={{ fontFamily:T.fontDisplay, fontSize:21, fontWeight:900, color:T.terra, marginBottom:8 }}>
                    O teu Cartão de Sócio<br/>está a um passo
                  </h3>
                  <p style={{ fontSize:13.5, color:T.muted, lineHeight:1.65, marginBottom:20 }}>
                    Regista-te agora. O pedido entra automaticamente na fila de aprovação da Direcção da AFAT.
                  </p>
                  <button onClick={irParaRegisto} style={{ background:`linear-gradient(135deg,${T.ouro},${T.ouroVivo})`, color:T.terra, border:"none", borderRadius:14, padding:"16px 32px", fontWeight:900, fontSize:15.5, boxShadow:`0 6px 24px ${T.ouro}50`, display:"inline-flex", alignItems:"center", gap:10 }}>
                    🪪 Iniciar Registo
                  </button>
                </div>
              )}
            </section>

            <SeccaoPartilha />
            <Rodape />
          </>
        )}
      </div>
    </>
  );
}
