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
                <h3 style={{ marginTop: '0.5rem', marginBottom: '0.5rem', textAlign: 'center', fontSize: '1.3rem' }}>🌸 Welcome to the Women's Day Race! 🌸</h3>
                <p style={{ textAlign: 'center', marginBottom: '1rem' }}>Today we celebrate your beauty, intelligence, and problem-solving skills. Get ready to put your wits to the test in this puzzle adventure. Work with your supporter, think smart, and may the best player win!</p>

                <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>📋 Overview</h3>
                <p>7 players compete in a puzzle-solving challenge. Each player has 1 supporter to help them find and solve questions hidden around the company.</p>

                <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>🔍 Finding Questions</h3>
                <p>• 5 main questions + 1 bonus question are hidden throughout the company</p>
                <p>• Hints appear on your screen showing where each question is located</p>
                <p>• Work with your supporter to find the questions</p>

                <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>✏️ Solving Questions</h3>
                <p>• Once you find a question, solve it and type your answer in the input field on the screen</p>
                <p>• Speed matters! The first person to answer correctly gets the most points</p>

                <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>📊 Scoring System</h3>
                <p><strong>Correct answers (in order):</strong></p>
                <p>• 1st place: 20 points</p>
                <p>• 2nd place: 19 points</p>
                <p>• 3rd place: 18 points</p>
                <p>• And so on...</p>

                <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>💡 Need Help?</h3>
                <p>Ask NPC Thanos for assistance:</p>
                <p>• 1st hint: Costs 1 point</p>
                <p>• 2nd hint: Costs 2 points</p>
                <p>• (Hint costs reset for each new question)</p>

                <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>⏭️ Can't Solve It?</h3>
                <p>Skip the question to earn 5 points and move to the next one</p>

                <div style={{
                  marginTop: '2rem',
                  padding: '1rem',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '10px',
                  textAlign: 'center'
                }}>
                  <strong>🏆 Good luck and have fun! 🏆</strong>
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