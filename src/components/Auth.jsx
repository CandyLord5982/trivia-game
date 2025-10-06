import { useState } from 'react'
import { supabase } from '../supabaseClient'

function Auth() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showTutorial, setShowTutorial] = useState(false)

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (isSignUp) {
        if (!avatarFile) {
          setMessage('Please upload an avatar image')
          setLoading(false)
          return
        }

        // Upload avatar to Supabase Storage
        const fileExt = avatarFile.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile)

        if (uploadError) throw uploadError

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName)

        // Sign up user
        const { data: authData, error } = await supabase.auth.signUp({
          email,
          password
        })
        if (error) throw error

        // Create user profile in users table
        if (authData.user) {
          const { error: profileError } = await supabase
            .from('users')
            .insert([{
              id: authData.user.id,
              display_name: displayName,
              avatar: publicUrl
            }])

          if (profileError) {
            console.error('Error creating profile:', profileError)
          }
        }

        setMessage('Check your email for the confirmation link!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (error) {
      setMessage('Ahaha sai rồi chicken')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <h2>{isSignUp ? 'Sign Up' : 'Sign In'} to Play</h2>

      <form onSubmit={handleAuth}>
        {isSignUp && (
          <>
            <input
              type="text"
              placeholder="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
            <div className="avatar-upload">
              <label>Upload your avatar:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                required
              />
              {avatarPreview && (
                <div className="avatar-preview">
                  <img src={avatarPreview} alt="Avatar preview" />
                </div>
              )}
            </div>
          </>
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
        </button>
      </form>

      {message && <p className="auth-message">{message}</p>}

      <button
        onClick={() => setIsSignUp(!isSignUp)}
        className="toggle-auth"
      >
        {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
      </button>

      <button
        onClick={() => setShowTutorial(true)}
        className="toggle-auth"
        style={{ marginTop: '0.5rem' }}
      >
        📚 Tutorial
      </button>

      {showTutorial && (
        <div className="modal-overlay" onClick={() => setShowTutorial(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setShowTutorial(false)}>×</button>
            <div className="question-card">
              <h2>How to Play</h2>

              <div style={{ textAlign: 'left', color: 'white', lineHeight: '1.8' }}>
                <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>🎯 Game Overview</h3>
                <p>This is a competitive trivia game where teams race to answer questions and earn points!</p>

                <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>🛤️ Choosing Your Path</h3>
                <p>• At the start, select one of 7 paths (each path has 6 questions)</p>
                <p>• Once chosen, your path is locked for other players</p>
                <p>• Each path has 5 regular questions + 1 bonus question</p>

                <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>📊 Scoring System</h3>
                <p><strong>Regular Questions:</strong></p>
                <p>• Base points: 10 points</p>
                <p>• Racing bonus: Up to +10 extra points for being first!</p>
                <p>• The faster you answer compared to other teams, the more bonus you get</p>

                <p style={{ marginTop: '1rem' }}><strong>Bonus Questions (⭐):</strong></p>
                <p>• Unlocked after completing all 5 regular questions</p>
                <p>• Worth up to 20 points based on racing position!</p>
                <p>• First team gets 20pts, second gets 18pts, etc.</p>

                <p style={{ marginTop: '1rem' }}><strong>Skip Option:</strong></p>
                <p>• Can't answer? Skip for 5 points and move on!</p>

                <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>🎮 Game Features</h3>
                <p>• Questions unlock sequentially - answer in order!</p>
                <p>• See all teams' progress in real-time</p>
                <p>• Each path has a unique color (except bonus = yellow)</p>
                <p>• Track your score on the leaderboard</p>

                <div style={{
                  marginTop: '2rem',
                  padding: '1rem',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '10px',
                  textAlign: 'center'
                }}>
                  <strong>🏆 May the fastest team win! 🏆</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Auth