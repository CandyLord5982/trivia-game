import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './components/Auth'
import Game from './components/Game'
import Leaderboard from './components/Leaderboard'
import Round2 from './components/Round2'
import './App.css'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('menu')
  const [displayName, setDisplayName] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [round2Open, setRound2Open] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        fetchDisplayName(session.user.id)
      }
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        fetchDisplayName(session.user.id)
      }
    })

    // Fetch Round 2 status
    fetchRound2Status()

    // Subscribe to Round 2 status changes
    const round2Subscription = supabase
      .channel('round2_status')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'game_settings' },
        (payload) => {
          if (payload.new?.setting_name === 'round2_open') {
            setRound2Open(payload.new.setting_value === 'true')
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
      round2Subscription.unsubscribe()
    }
  }, [])

  const fetchRound2Status = async () => {
    try {
      const { data, error } = await supabase
        .from('game_settings')
        .select('setting_value')
        .eq('setting_name', 'round2_open')
        .maybeSingle()

      if (data) {
        setRound2Open(data.setting_value === 'true')
      }
    } catch (error) {
      console.error('Error fetching round 2 status:', error)
    }
  }

  const toggleRound2 = async () => {
    try {
      const newStatus = !round2Open

      const { error } = await supabase
        .from('game_settings')
        .upsert({
          setting_name: 'round2_open',
          setting_value: newStatus ? 'true' : 'false'
        }, {
          onConflict: 'setting_name'
        })

      if (error) throw error

      setRound2Open(newStatus)
    } catch (error) {
      console.error('Error toggling round 2:', error)
      alert('Failed to toggle Round 2 status')
    }
  }

  const fetchDisplayName = async (userId) => {
    const { data } = await supabase
      .from('users')
      .select('display_name, is_admin')
      .eq('id', userId)
      .single()

    if (data?.display_name) {
      setDisplayName(data.display_name)
    }
    if (data?.is_admin) {
      setIsAdmin(true)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setView('menu')
  }

  const backToMenu = () => {
    setView('menu')
  }

  if (loading) {
    return <div className="app"><h1>Loading...</h1></div>
  }

  if (!session) {
    return (
      <div className="app">
        <h1>💖 Love Trivia</h1>
        <Auth />
      </div>
    )
  }

  return (
    <div className="app">
      <div className="header">
        <h1>💖 Love Trivia</h1>
        <div className="user-info">
          <button onClick={handleSignOut} className="sign-out-btn">Sign Out</button>
        </div>
      </div>

      {view === 'menu' && (
        <div className="menu">
          <button onClick={() => setView('game')}>
            Round 1 - Path Game
          </button>
          <button
            onClick={() => setView('round2')}
            disabled={!round2Open && !isAdmin}
            style={!round2Open && !isAdmin ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            Round 2 - Quiz Battle {!round2Open && '🔒'}
          </button>
          {isAdmin && (
            <button
              onClick={toggleRound2}
              style={{
                background: round2Open
                  ? 'linear-gradient(135deg, #ff3333 0%, #e60000 100%)'
                  : 'linear-gradient(135deg, #6bff9d 0%, #45c469 100%)'
              }}
            >
              {round2Open ? '🔓 Close Round 2' : '🔒 Open Round 2'}
            </button>
          )}
          <button onClick={() => setView('profile')}>
            Change Avatar
          </button>
        </div>
      )}

      {view === 'game' && (
        <div className="game-layout">
          <Game user={session.user} onGameEnd={backToMenu} isAdmin={isAdmin} />
          {isAdmin && <Leaderboard key={Math.random()} />}
        </div>
      )}

      {view === 'leaderboard' && (
        <div>
          <Leaderboard />
          <button onClick={backToMenu}>Back to Menu</button>
        </div>
      )}

      {view === 'round2' && (
        <Round2 user={session.user} onBack={backToMenu} isAdmin={isAdmin} />
      )}

      {view === 'profile' && (
        <div className="profile-container">
          <AvatarUpload userId={session.user.id} onBack={backToMenu} />
        </div>
      )}
    </div>
  )
}

function AvatarUpload({ userId, onBack }) {
  const [uploading, setUploading] = useState(false)
  const [currentAvatar, setCurrentAvatar] = useState(null)

  useEffect(() => {
    fetchCurrentAvatar()
  }, [])

  const fetchCurrentAvatar = async () => {
    const { data } = await supabase
      .from('users')
      .select('avatar')
      .eq('id', userId)
      .single()

    if (data?.avatar) {
      setCurrentAvatar(data.avatar)
    }
  }

  const uploadAvatar = async (e) => {
    try {
      setUploading(true)
      const file = e.target.files?.[0]
      if (!file) return

      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar: publicUrl })
        .eq('id', userId)

      if (updateError) throw updateError

      setCurrentAvatar(publicUrl)
      alert('Avatar updated successfully!')
    } catch (error) {
      alert('Error uploading avatar: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="auth-container">
      <h2>Change Avatar</h2>

      {currentAvatar && (
        <div className="avatar-preview">
          <img src={currentAvatar} alt="Current avatar" />
        </div>
      )}

      <div className="avatar-upload">
        <label htmlFor="avatar">Upload New Avatar</label>
        <input
          type="file"
          id="avatar"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
        />
      </div>

      <button onClick={onBack} disabled={uploading}>
        Back to Menu
      </button>
    </div>
  )
}

export default App
