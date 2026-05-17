import { useState } from 'react'
import { supabase } from './supabase'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const entrar = async () => {
    setErro('')
    setCarregando(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: senha,
    })

    if (error) {
      setErro('Email ou senha incorrectos. Tente novamente.')
      setCarregando(false)
      return
    }

    const { data: perfil } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (perfil) {
      onLogin(perfil)
    } else {
      setErro('Utilizador não configurado. Contacte o administrador.')
    }

    setCarregando(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2C1810, #8B4513)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      fontFamily: 'Lato, sans-serif'
    }}>
      <div style={{
        background: '#FFFCF5',
        borderRadius: 20,
        padding: 32,
        width: '100%',
        maxWidth: 380,
        boxShadow: '0 8px 40px rgba(0,0,0,0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🌳</div>
          <div style={{
            color: '#C8922A',
            fontWeight: 900,
            fontSize: 22,
            letterSpacing: 2
          }}>AFAT</div>
          <div style={{ color: '#8A7060', fontSize: 13, marginTop: 4 }}>
            Área Reservada — Agentes e Administradores
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{
            fontSize: 11,
            fontWeight: 800,
            color: '#8A7060',
            letterSpacing: 1,
            textTransform: 'uppercase',
            marginBottom: 6
          }}>EMAIL</div>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="o.teu@email.com"
            style={{
              width: '100%',
              padding: '13px 15px',
              borderRadius: 10,
              border: '1.5px solid #E8D5A3',
              fontSize: 15,
              fontFamily: 'Lato, sans-serif',
              boxSizing: 'border-box',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontSize: 11,
            fontWeight: 800,
            color: '#8A7060',
            letterSpacing: 1,
            textTransform: 'uppercase',
            marginBottom: 6
          }}>SENHA</div>
          <input
            type="password"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            placeholder="••••••••••"
            onKeyDown={e => e.key === 'Enter' && entrar()}
            style={{
              width: '100%',
              padding: '13px 15px',
              borderRadius: 10,
              border: '1.5px solid #E8D5A3',
              fontSize: 15,
              fontFamily: 'Lato, sans-serif',
              boxSizing: 'border-box',
              outline: 'none'
            }}
          />
        </div>

        {erro && (
          <div style={{
            background: '#C0392B18',
            color: '#C0392B',
            border: '1px solid #C0392B44',
            borderRadius: 10,
            padding: '10px 14px',
            fontSize: 13,
            fontWeight: 700,
            marginBottom: 16,
            textAlign: 'center'
          }}>
            ⚠ {erro}
          </div>
        )}

        <button
          onClick={entrar}
          disabled={carregando}
          style={{
            width: '100%',
            background: carregando ? '#E8D5A3' : 'linear-gradient(135deg, #C8922A, #E8A830)',
            color: '#2C1810',
            border: 'none',
            borderRadius: 12,
            padding: '14px',
            fontWeight: 900,
            fontSize: 15,
            cursor: carregando ? 'wait' : 'pointer',
            marginBottom: 16
          }}>
          {carregando ? 'A entrar...' : 'Entrar →'}
        </button>

        <div style={{ textAlign: 'center' }}>
          <a href="/" style={{
            color: '#8A7060',
            fontSize: 13,
            textDecoration: 'none'
          }}>
            ← Voltar ao site público
          </a>
        </div>
      </div>
    </div>
  )
}
