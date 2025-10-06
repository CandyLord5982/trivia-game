import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

function Leaderboard() {
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchScores()

    // Subscribe to real-time changes
    const channel = supabase
      .channel('scores-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scores' }, () => {
        fetchScores()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchScores = async () => {
    try {
      const { data, error } = await supabase
        .from('scores')
        .select('user_id, score, created_at')
        .order('score', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching scores:', error)
      } else {
        // Get highest score per user
        const userBestScores = new Map()
        data.forEach(score => {
          if (!userBestScores.has(score.user_id) ||
              userBestScores.get(score.user_id).score < score.score) {
            userBestScores.set(score.user_id, score)
          }
        })

        // Convert to array and sort by score
        const topScores = Array.from(userBestScores.values())
          .sort((a, b) => b.score - a.score)
          .slice(0, 10)

        // Fetch user details
        const userIds = topScores.map(s => s.user_id)
        const { data: usersData } = await supabase
          .from('users')
          .select('id, display_name, avatar')
          .in('id', userIds)

        const transformedData = topScores.map(score => {
          const user = usersData?.find(u => u.id === score.user_id)
          return {
            user_id: score.user_id,
            score: score.score,
            player_name: user?.display_name || 'Unknown',
            avatar: user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Default'
          }
        })
        setScores(transformedData)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="leaderboard">Loading...</div>
  }

  return (
    <div className="leaderboard">
      <h2>🏆 Top Leaderboard</h2>
      {scores.length === 0 ? (
        <p>No scores yet. Be the first!</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((score, index) => {
              const medals = ['🥇', '🥈', '🥉']
              return (
                <tr key={score.user_id}>
                  <td>{index < 3 ? medals[index] : index + 1}</td>
                  <td>
                    <div className="player-info">
                      <img src={score.avatar} alt={score.player_name} className="player-avatar" />
                      <span>{score.player_name}</span>
                    </div>
                  </td>
                  <td>{score.score}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default Leaderboard
