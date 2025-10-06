import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const round2Questions = [
  { question: 'What is the capital of Australia?', answers: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'], correct: 2 },
  { question: 'What is 12 x 12?', answers: ['124', '144', '134', '154'], correct: 1 },
  { question: 'Who painted the Sistine Chapel?', answers: ['Leonardo da Vinci', 'Michelangelo', 'Raphael', 'Donatello'], correct: 1 },
  { question: 'What is the largest desert in the world?', answers: ['Sahara', 'Gobi', 'Antarctic', 'Arabian'], correct: 2 },
  { question: 'How many bones are in the human body?', answers: ['196', '206', '216', '186'], correct: 1 },
]

function Round2({ user, onBack, isAdmin }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(null)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [questionResults, setQuestionResults] = useState([])
  const [myScore, setMyScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    // Subscribe to round 2 state changes
    const stateSubscription = supabase
      .channel('round2_state')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'round2_state' },
        async (payload) => {
          console.log('Round 2 state changed:', payload)
          await fetchCurrentState()
        }
      )
      .subscribe()

    // Subscribe to answer submissions
    const answerSubscription = supabase
      .channel('round2_answers')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'round2_answers' },
        async (payload) => {
          console.log('Answer submitted:', payload)
          if (showResults) {
            await fetchQuestionResults()
          }
        }
      )
      .subscribe()

    fetchCurrentState()

    return () => {
      stateSubscription.unsubscribe()
      answerSubscription.unsubscribe()
    }
  }, [showResults])

  useEffect(() => {
    if (timeLeft > 0 && currentQuestionIndex !== null && !showResults) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft, currentQuestionIndex, showResults])

  const fetchCurrentState = async () => {
    try {
      const { data, error } = await supabase
        .from('round2_state')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (data) {
        setCurrentQuestionIndex(data.current_question)
        setShowResults(data.show_results)
        setTimeLeft(data.time_left || 0)

        if (data.show_results) {
          await fetchQuestionResults()
        }

        // Check if user already answered this question
        if (data.current_question !== null) {
          const { data: answerData } = await supabase
            .from('round2_answers')
            .select('*')
            .eq('user_id', user.id)
            .eq('question_index', data.current_question)
            .maybeSingle()

          setHasAnswered(!!answerData)
          if (answerData) {
            setSelectedAnswer(answerData.answer_index)
          }
        }
      }

      // Fetch my total score from main scores table
      const { data: scoreData } = await supabase
        .from('scores')
        .select('score')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      setMyScore(scoreData?.score || 0)
    } catch (error) {
      console.error('Error fetching state:', error)
    }
  }

  const fetchQuestionResults = async () => {
    try {
      const { data } = await supabase
        .from('round2_answers')
        .select('user_id, answer_index, points, display_name')
        .eq('question_index', currentQuestionIndex)
        .order('created_at', { ascending: true })

      if (data) {
        setQuestionResults(data)
      }
    } catch (error) {
      console.error('Error fetching results:', error)
    }
  }

  const startQuestion = async (questionIndex) => {
    try {
      // Delete existing state
      await supabase.from('round2_state').delete().neq('id', 0)

      // Insert new state
      await supabase
        .from('round2_state')
        .insert([{
          current_question: questionIndex,
          show_results: false,
          time_left: 15
        }])

      setHasAnswered(false)
      setSelectedAnswer(null)
    } catch (error) {
      console.error('Error starting question:', error)
    }
  }

  const showQuestionResults = async () => {
    try {
      await supabase
        .from('round2_state')
        .delete()
        .neq('id', 0)

      await supabase
        .from('round2_state')
        .insert([{
          current_question: currentQuestionIndex,
          show_results: true,
          time_left: 0
        }])
    } catch (error) {
      console.error('Error showing results:', error)
    }
  }

  const submitAnswer = async (answerIndex) => {
    if (hasAnswered || showResults || currentQuestionIndex === null || timeLeft === 0) return

    const question = round2Questions[currentQuestionIndex]
    const isCorrect = answerIndex === question.correct
    const points = isCorrect ? Math.max(100 + (timeLeft * 10), 100) : 0

    try {
      // Get display name
      const { data: userData } = await supabase
        .from('users')
        .select('display_name')
        .eq('id', user.id)
        .single()

      const displayName = userData?.display_name || user.email

      // Save answer
      await supabase
        .from('round2_answers')
        .insert([{
          user_id: user.id,
          display_name: displayName,
          question_index: currentQuestionIndex,
          answer_index: answerIndex,
          is_correct: isCorrect,
          points: points,
          time_taken: 15 - timeLeft
        }])

      // Update total score in main scores table
      const { data: currentScore } = await supabase
        .from('scores')
        .select('score')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      const newTotal = (currentScore?.score || 0) + points

      await supabase
        .from('scores')
        .insert([{
          user_id: user.id,
          player_name: displayName,
          score: newTotal
        }])

      setHasAnswered(true)
      setSelectedAnswer(answerIndex)
      setMyScore(newTotal)
    } catch (error) {
      console.error('Error submitting answer:', error)
    }
  }

  const resetRound2 = async () => {
    try {
      await supabase.from('round2_state').delete().neq('id', 0)
      await supabase.from('round2_answers').delete().neq('id', 0)
      // Note: We don't reset the main scores table since Round 1 and 2 share the same score
      await fetchCurrentState()
    } catch (error) {
      console.error('Error resetting round 2:', error)
    }
  }

  if (isAdmin) {
    return (
      <div className="game">
        <div className="score-board">
          <span>Round 2 - Admin Control</span>
          <button onClick={onBack} className="back-to-menu-btn">Back to Menu</button>
        </div>

        <div style={{ padding: '2rem' }}>
          <h2 style={{ color: '#ff6b9d', marginBottom: '2rem' }}>Admin Controls</h2>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            {round2Questions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => startQuestion(idx)}
                style={{
                  padding: '1rem',
                  background: currentQuestionIndex === idx ? '#c44569' : '#ff6b9d',
                  opacity: currentQuestionIndex === idx && !showResults ? 1 : 0.7
                }}
              >
                Question {idx + 1}
              </button>
            ))}
            <button onClick={showQuestionResults} disabled={currentQuestionIndex === null}>
              Show Results
            </button>
            <button onClick={resetRound2} style={{ background: '#666' }}>
              Reset Round 2
            </button>
          </div>

          {currentQuestionIndex !== null && (
            <div className="question-card">
              <h2>{round2Questions[currentQuestionIndex].question}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem' }}>
                {round2Questions[currentQuestionIndex].answers.map((answer, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '1.5rem',
                      background: showResults && idx === round2Questions[currentQuestionIndex].correct
                        ? 'rgba(0, 255, 0, 0.3)'
                        : 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '10px',
                      border: showResults && idx === round2Questions[currentQuestionIndex].correct
                        ? '3px solid green'
                        : '2px solid rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    {answer}
                  </div>
                ))}
              </div>

              {showResults && (
                <div style={{ marginTop: '2rem' }}>
                  <h3>Results:</h3>
                  {questionResults.map((result, idx) => (
                    <div key={idx} style={{ padding: '0.5rem', color: 'white' }}>
                      {result.display_name}: {result.is_correct ? `✅ +${result.points}` : '❌ 0'} pts
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Players must wait if no question is active
  if (currentQuestionIndex === null) {
    return (
      <div className="game">
        <div className="score-board">
          <span>Round 2 - Waiting for admin to start...</span>
          <button onClick={onBack} className="back-to-menu-btn">Back to Menu</button>
        </div>
        <div style={{ textAlign: 'center', marginTop: '3rem', color: '#ff6b9d', fontSize: '1.5rem' }}>
          <p>🎮 Get ready for Round 2!</p>
          <p style={{ fontSize: '1.2rem', marginTop: '1rem' }}>The quiz will begin shortly...</p>
          <p style={{ fontSize: '1rem', marginTop: '2rem' }}>Your current score: {myScore}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="game">
      <div className="score-board">
        <span>Round 2 - Question {currentQuestionIndex + 1}/{round2Questions.length} | Score: {myScore}</span>
        <button onClick={onBack} className="back-to-menu-btn">Back to Menu</button>
      </div>

      <div style={{ textAlign: 'center', padding: '2rem' }}>
        {!showResults && timeLeft > 0 && (
          <div style={{ fontSize: '3rem', color: '#ff6b9d', marginBottom: '1rem' }}>
            {timeLeft}s
          </div>
        )}

        <div className="question-card">
          <h2>{round2Questions[currentQuestionIndex].question}</h2>

          {!showResults ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem' }}>
              {round2Questions[currentQuestionIndex].answers.map((answer, idx) => (
                <button
                  key={idx}
                  onClick={() => submitAnswer(idx)}
                  disabled={hasAnswered || timeLeft === 0}
                  style={{
                    padding: '2rem',
                    fontSize: '1.2rem',
                    background: selectedAnswer === idx ? 'rgba(255, 215, 0, 0.5)' : undefined,
                    border: selectedAnswer === idx ? '3px solid #ffd700' : undefined,
                    opacity: hasAnswered && selectedAnswer !== idx ? 0.5 : 1
                  }}
                >
                  {answer}
                </button>
              ))}
            </div>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem' }}>
                {round2Questions[currentQuestionIndex].answers.map((answer, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '2rem',
                      fontSize: '1.2rem',
                      background: idx === round2Questions[currentQuestionIndex].correct
                        ? 'rgba(0, 255, 0, 0.3)'
                        : selectedAnswer === idx
                        ? 'rgba(255, 0, 0, 0.3)'
                        : 'rgba(255, 255, 255, 0.1)',
                      border: idx === round2Questions[currentQuestionIndex].correct
                        ? '3px solid green'
                        : selectedAnswer === idx
                        ? '3px solid red'
                        : '2px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '10px'
                    }}
                  >
                    {answer}
                    {idx === round2Questions[currentQuestionIndex].correct && ' ✅'}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '2rem', color: 'white' }}>
                <h3>Leaderboard:</h3>
                {questionResults
                  .sort((a, b) => b.points - a.points)
                  .map((result, idx) => (
                    <div key={idx} style={{ padding: '0.5rem', fontSize: '1.1rem' }}>
                      {idx + 1}. {result.display_name}: {result.points} pts
                    </div>
                  ))}
              </div>
            </div>
          )}

          {hasAnswered && !showResults && (
            <p style={{ marginTop: '2rem', color: 'white', fontSize: '1.2rem' }}>
              ✅ Answer submitted! Waiting for results...
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Round2
