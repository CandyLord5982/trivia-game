import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { FaStar } from 'react-icons/fa'
import NumberPicker from './NumberPicker'

// Divide questions into 7 paths - each path has 6 questions (5 regular + 1 bonus)
const allQuestions = [
  // Path 1 (0-5)
  { question: 'What is the title?', answer: 'emxinh', type: 'text', image: 'https://xpclass.vn/2010/display_on_site/pink1.png' },
  { question: 'What is the keyword?', answer: 'đảm đang', type: 'text', image: 'https://xpclass.vn/2010/display_on_site/pink2.png' },
  { question: 'What is the code?', answer: '102025', type: 'text', image: 'https://xpclass.vn/2010/display_on_site/pink3.png' },
  { question: 'What are the two keywords?', answer: 'đáng yêu duyên dáng', type: 'text', image: 'https://xpclass.vn/2010/display_on_site/pink4.png' },
  { question: 'Find the word?', answer: 'ngotngao', type: 'text', image: 'https://xpclass.vn/2010/display_on_site/pink5.png' },
  { question: 'BONUS: What is the message? ', answer: 'lovetoourladies', type: 'text', isBonus: true,image: 'https://xpclass.vn/2010/bonus.jpg' },

  // Path 2 (6-11)
  { question: 'What is the title?', answer: 'emxinh', type: 'text', image: 'https://xpclass.vn/2010/display_on_site/blue1.png' },
  { question: 'What is the keyword?', answer: 'đảm đang', type: 'text', image: 'https://xpclass.vn/2010/display_on_site/blue2.png' },
  { question: 'What is the code?', answer: '102025', type: 'text', image: 'https://xpclass.vn/2010/display_on_site/blue3.png' },
  { question: 'What are the two keywords?', answer: 'đáng yêu duyên dáng', type: 'text', image: 'https://xpclass.vn/2010/display_on_site/blue4.png' },
  { question: 'Find the word?', answer: 'ngotngao', type: 'text', image: 'https://xpclass.vn/2010/display_on_site/blue5.png' },
  { question: 'BONUS: What is the message?', answer: 'lovetoourladies', type: 'text', isBonus: true,image: 'https://xpclass.vn/2010/bonus.jpg' },

  // Path 3 (12-17)
  { question: 'What is the title?', answer: 'emxinh', type: 'text', image: 'https://xpclass.vn/2010/display_on_site/green1.png' },
  { question: 'What is the keyword?', answer: 'đảm đang', type: 'text', image: 'https://xpclass.vn/2010/display_on_site/green2.png' },
  { question: 'What is the code?', answer: '102025', type: 'text', image: 'https://xpclass.vn/2010/display_on_site/green3.png' },
  { question: 'What are the two keywords?', answer: 'đáng yêu duyên dáng', type: 'text', image: 'https://xpclass.vn/2010/display_on_site/green4.png' },
  { question: 'Find the word?', answer: 'ngotngao', type: 'text', image: 'https://xpclass.vn/2010/display_on_site/green5.png' },
  { question: 'BONUS: What is the message?', answer: 'lovetoourladies', type: 'text', isBonus: true,image: 'https://xpclass.vn/2010/bonus.jpg' },

  // Path 4 (18-23)
  { question: 'What is the title?', answer: 'emxinh', type: 'text', image: 'https://xpclass.vn/2010/display_on_site/purple1.png' },
  { question: 'What is the keyword?', answer: 'đảm đang', type: 'text', image: 'https://xpclass.vn/2010/display_on_site/purple2.png' },
  { question: 'What is the code?', answer: '102025', type: 'text', image: 'https://xpclass.vn/2010/display_on_site/purple3.png' },
  { question: 'What are the two keywords?', answer: 'đáng yêu duyên dáng', type: 'text', image: 'https://xpclass.vn/2010/display_on_site/purple4.png' },
  { question: 'Find the word?', answer: 'ngotngao', type: 'text', image: 'https://xpclass.vn/2010/display_on_site/purple5.png' },
  { question: 'BONUS: What is the message?', answer: 'lovetoourladies', type: 'text', isBonus: true,image: 'https://xpclass.vn/2010/bonus.jpg' },

  // Path 5 (24-29)
  { question: 'What is the title?', answer: 'emxinh', type: 'text', image: 'https://xpclass.vn/2010/display_on_site/brown1.png' },
  { question: 'What is the keyword?', answer: 'đảm đang', type: 'text', image: 'https://xpclass.vn/2010/display_on_site/brown2.png' },
  { question: 'What is the code?', answer: '102025', type: 'text', image: 'https://xpclass.vn/2010/display_on_site/brown3.png' },
  { question: 'What are the two keywords?', answer: 'đáng yêu duyên dáng', type: 'text', image: 'https://xpclass.vn/2010/display_on_site/brown4.png' },
  { question: 'Find the word?', answer: 'ngotngao', type: 'text', image: 'https://xpclass.vn/2010/display_on_site/brown5.png' },
  { question: 'BONUS: What is the message?', answer: 'lovetoourladies', type: 'text', isBonus: true,image: 'https://xpclass.vn/2010/bonus.jpg' },

  // Path 6 (30-35)
  { question: 'What is the title?', answer: 'emxinh', type: 'text',image: 'https://xpclass.vn/2010/display_on_site/teal1.png'  },
  { question: 'What is the keyword?', answer: 'đảm đang', type: 'text',image: 'https://xpclass.vn/2010/display_on_site/teal2.png' },
  { question: 'What is the code?', answer: '102025', type: 'text',image: 'https://xpclass.vn/2010/display_on_site/teal3.png' },
  { question: 'What are the two keywords?', answer: 'đáng yêu duyên dáng', type: 'text',image: 'https://xpclass.vn/2010/display_on_site/teal4.png' },
  { question: 'Find the word?', answer: 'ngotngao', type: 'text',image: 'https://xpclass.vn/2010/display_on_site/teal5.png' },
  { question: 'BONUS: What is the message?', answer: 'lovetoourladies', type: 'text', isBonus: true,image: 'https://xpclass.vn/2010/bonus.jpg' },

  // Path 7 (36-41)
  { question: 'What is the title?', answer: 'emxinh', type: 'text',image: 'https://xpclass.vn/2010/display_on_site/red1.png' },
  { question: 'What is the keyword?', answer: 'đảm đang', type: 'text',image: 'https://xpclass.vn/2010/display_on_site/red2.png' },
  { question: 'What is the code?', answer: '102025', type: 'text',image: 'https://xpclass.vn/2010/display_on_site/red3.png' },
  { question: 'What are the two keywords?', answer: 'đáng yêu duyên dáng', type: 'text',image: 'https://xpclass.vn/2010/display_on_site/red4.png' },
  { question: 'Find the word?', answer: 'ngotngao', type: 'text',image: 'https://xpclass.vn/2010/display_on_site/red5.png' },
  { question: 'BONUS: What is the message?', answer: 'lovetoourladies', type: 'text', isBonus: true,image: 'https://xpclass.vn/2010/bonus.jpg' },
]

// Organize questions into 7 paths (6 questions each: 5 regular + 1 bonus)
const questionPaths = {
  1: [0, 1, 2, 3, 4, 5],      // Path 1
  2: [6, 7, 8, 9, 10, 11],    // Path 2
  3: [12, 13, 14, 15, 16, 17], // Path 3
  4: [18, 19, 20, 21, 22, 23], // Path 4
  5: [24, 25, 26, 27, 28, 29], // Path 5
  6: [30, 31, 32, 33, 34, 35], // Path 6
  7: [36, 37, 38, 39, 40, 41], // Path 7
}

const pathNames = {
  1: 'Prestige',
  2: 'Elegance',
  3: 'Charm',
  4: 'Glamour',
  5: 'Grace',
  6: 'Grandeur',
  7: 'Vogue'
}

function Game({ user, onGameEnd, isAdmin }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answer, setAnswer] = useState('')
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [isFinished, setIsFinished] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [totalScore, setTotalScore] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set())
  const [wrongImage, setWrongImage] = useState('')
  const [selectedPath, setSelectedPath] = useState(null)
  const [lockedPaths, setLockedPaths] = useState([])
  const [showPathSelection, setShowPathSelection] = useState(true)
  const [questions, setQuestions] = useState([])
  const [allAnsweredQuestions, setAllAnsweredQuestions] = useState(new Set())
  const [questionScores, setQuestionScores] = useState({})
  const [pathUsers, setPathUsers] = useState({})
  const [pathScores, setPathScores] = useState({})
  const [allUserQuestionScores, setAllUserQuestionScores] = useState({})
  const [enlargedImage, setEnlargedImage] = useState(null)
  const [charBoxes, setCharBoxes] = useState([])
  const [twoFieldAnswers, setTwoFieldAnswers] = useState({ field1: '', field2: '' })

  const wrongImages = [
    'https://xpclass.vn/leaderboard/wrong_image/vince%20mc.gif',
    'https://xpclass.vn/leaderboard/wrong_image/nick-confused.gif',
    'https://xpclass.vn/leaderboard/wrong_image/minus6.png',
    'https://xpclass.vn/leaderboard/wrong_image/minus2.gif',
    'https://xpclass.vn/leaderboard/wrong_image/drake.jpg'
  ]

  useEffect(() => {
    // Create canvas for particle effect
    const canvas = document.createElement('canvas')
    canvas.style.position = 'fixed'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.pointerEvents = 'none'
    canvas.style.zIndex = '1'
    document.body.appendChild(canvas)

    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Particle class
    class Particle {
      constructor() {
        this.reset()
        this.y = Math.random() * canvas.height
      }

      reset() {
        this.x = Math.random() * canvas.width
        this.y = -10
        this.size = Math.random() * 3 + 2
        this.speedY = Math.random() * 2 + 1
        this.speedX = Math.random() * 1 - 0.5
        this.color = Math.random() > 0.5 ? '#FFFFFF' : '#FFd700'
        this.rotation = Math.random() * 360
        this.rotationSpeed = Math.random() * 4 - 2
        this.isSquare = Math.random() > 0.5
        this.wobble = Math.random() * 30
        this.wobbleSpeed = Math.random() * 0.1 - 0.05
      }

      update() {
        this.y += this.speedY
        this.x += this.speedX + Math.sin(this.wobble) * 0.5
        this.rotation += this.rotationSpeed
        this.wobble += this.wobbleSpeed

        if (this.y > canvas.height) {
          this.reset()
        }
      }

      draw() {
        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.rotate((this.rotation * Math.PI) / 180)
        ctx.fillStyle = this.color

        if (this.isSquare) {
          ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size)
        } else {
          ctx.beginPath()
          ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.restore()
      }
    }

    // Create particles
    const particles = []
    for (let i = 0; i < 500; i++) {
      particles.push(new Particle())
    }

    // Animation loop
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(particle => {
        particle.update()
        particle.draw()
      })
      requestAnimationFrame(animate)
    }

    animate()

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      document.body.removeChild(canvas)
    }
  }, [])

  useEffect(() => {
    fetchTotalScore()
    fetchAnsweredQuestions()
    fetchLockedPaths()
    checkUserPath()
    if (isAdmin) {
      fetchAllPathScores()
    }

    // Subscribe to real-time changes in path selections
    const pathSubscription = supabase
      .channel('path_changes')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'user_paths' },
        (payload) => {
          console.log('Path selection detected:', payload.new)
          // Update locked paths when someone selects a path
          setLockedPaths(prev => {
            const newLocked = [...prev]
            if (!newLocked.includes(payload.new.path_number)) {
              newLocked.push(payload.new.path_number)
            }
            console.log('Updated locked paths:', newLocked)
            return newLocked
          })
        }
      )
      .subscribe((status) => {
        console.log('Path subscription status:', status)
      })

    // Subscribe to real-time answer updates
    const answerSubscription = supabase
      .channel('answer_changes')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'user_answers' },
        (payload) => {
          console.log('Answer detected:', payload.new)
          // Update all answered questions when anyone answers
          setAllAnsweredQuestions(prev => new Set([...prev, payload.new.question_index]))

          // Update my answered questions if it's my answer
          if (payload.new.user_id === user.id) {
            setAnsweredQuestions(prev => new Set([...prev, payload.new.question_index]))
          }
        }
      )
      .subscribe((status) => {
        console.log('Answer subscription status:', status)
      })

    // Subscribe to score updates for admin
    let scoreSubscription = null
    if (isAdmin) {
      scoreSubscription = supabase
        .channel('score_changes')
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'scores' },
          () => {
            fetchAllPathScores()
          }
        )
        .subscribe()
    }

    return () => {
      pathSubscription.unsubscribe()
      answerSubscription.unsubscribe()
      if (scoreSubscription) {
        scoreSubscription.unsubscribe()
      }
    }
  }, [])

  const checkUserPath = async () => {
    try {
      // Admin doesn't need to select a path
      if (isAdmin) {
        setShowPathSelection(false)
        setSelectedPath(0) // Set to 0 to indicate admin mode
        loadQuestionsForPath(0)
        return
      }

      const { data, error } = await supabase
        .from('user_paths')
        .select('path_number')
        .eq('user_id', user.id)
        .maybeSingle()

      if (data?.path_number) {
        setSelectedPath(data.path_number)
        setShowPathSelection(false)
        loadQuestionsForPath(data.path_number)
      }
    } catch (error) {
      console.error('Error checking user path:', error)
    }
  }

  const fetchLockedPaths = async () => {
    try {
      const { data, error } = await supabase
        .from('user_paths')
        .select('path_number, user_id, display_name')

      if (error) {
        console.error('Error fetching locked paths:', error)
      } else if (data) {
        const locked = data
          .filter(item => item.user_id !== user.id)
          .map(item => item.path_number)
        setLockedPaths(locked)

        // Fetch user details including avatars
        const userIds = data.map(item => item.user_id)
        if (userIds.length > 0) {
          const { data: usersData } = await supabase
            .from('users')
            .select('id, display_name, avatar')
            .in('id', userIds)

          if (usersData) {
            // Map path number to user info
            const pathToUser = {}
            data.forEach(pathData => {
              const userData = usersData.find(u => u.id === pathData.user_id)
              if (userData) {
                pathToUser[pathData.path_number] = {
                  display_name: userData.display_name || pathData.display_name,
                  avatar: userData.avatar,
                  user_id: pathData.user_id
                }
              }
            })
            setPathUsers(pathToUser)
          }
        }
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const loadQuestionsForPath = (pathNumber) => {
    // Don't filter questions - show all questions from all paths
    setQuestions(allQuestions)
  }

  const fetchAllPathScores = async () => {
    try {
      const { data: userPaths } = await supabase
        .from('user_paths')
        .select('user_id, path_number')

      if (userPaths) {
        const scores = {}
        for (const pathData of userPaths) {
          const { data: scoreData } = await supabase
            .from('scores')
            .select('score')
            .eq('user_id', pathData.user_id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

          if (scoreData) {
            scores[pathData.path_number] = scoreData.score
          }
        }
        setPathScores(scores)
      }

      // Fetch all user question scores for admin
      const { data: allAnswers } = await supabase
        .from('user_answers')
        .select('user_id, question_index, points')

      if (allAnswers) {
        const userScores = {}
        allAnswers.forEach(ans => {
          if (!userScores[ans.user_id]) {
            userScores[ans.user_id] = {}
          }
          userScores[ans.user_id][ans.question_index] = ans.points || 10
        })
        setAllUserQuestionScores(userScores)
      }
    } catch (error) {
      console.error('Error fetching path scores:', error)
    }
  }

  const selectPath = async (pathNumber) => {
    try {
      // Get display name
      const { data: userData } = await supabase
        .from('users')
        .select('display_name')
        .eq('id', user.id)
        .single()

      const displayName = userData?.display_name || user.email

      // Save path selection
      const { error } = await supabase
        .from('user_paths')
        .insert([{
          user_id: user.id,
          display_name: displayName,
          path_number: pathNumber
        }])

      if (error) {
        console.error('Error selecting path:', error)
        alert('Failed to select path. It might be already taken.')
        fetchLockedPaths() // Refresh locked paths
        return
      }

      setSelectedPath(pathNumber)
      setShowPathSelection(false)
      loadQuestionsForPath(pathNumber)
      fetchLockedPaths() // Refresh to show this path is now locked
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to select path')
    }
  }

  const fetchAnsweredQuestions = async () => {
    try {
      // Fetch ALL answered questions from ALL users to show progress
      const { data, error } = await supabase
        .from('user_answers')
        .select('question_index, user_id, points')

      console.log('Fetched all answers:', data)

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching answered questions:', error)
      } else if (data && data.length > 0) {
        // My answered questions
        const myAnswered = new Set(
          data.filter(item => item.user_id === user.id).map(item => item.question_index)
        )
        setAnsweredQuestions(myAnswered)

        // Store points for my answers
        const scores = {}
        data.filter(item => item.user_id === user.id).forEach(item => {
          scores[item.question_index] = item.points || 10 // Default to 10 if no points stored
        })
        setQuestionScores(scores)
        console.log('My answered questions with scores:', scores)

        // All answered questions (from everyone)
        const allAnswered = new Set(data.map(item => item.question_index))
        setAllAnsweredQuestions(allAnswered)
      } else {
        // No data yet, initialize empty sets
        setAnsweredQuestions(new Set())
        setAllAnsweredQuestions(new Set())
        setQuestionScores({})
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const fetchTotalScore = async () => {
    try {
      const { data, error } = await supabase
        .from('scores')
        .select('score')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) {
        console.error('Error fetching total score:', error)
      } else {
        setTotalScore(data?.score || 0)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleSkip = async () => {
    const points = 5
    const isBonus = questions[currentQuestion].isBonus

    // Get display name
    const { data: userData } = await supabase
      .from('users')
      .select('display_name')
      .eq('id', user.id)
      .single()

    const displayName = userData?.display_name || user.email

    // Save skipped answer - mark as skipped, not correct
    try {
      await supabase
        .from('user_answers')
        .insert([{
          user_id: user.id,
          display_name: displayName,
          question_index: currentQuestion,
          is_correct: false,
          is_skipped: true,
          points: points
        }])

      setAnsweredQuestions(prev => new Set([...prev, currentQuestion]))
      setQuestionScores(prev => ({
        ...prev,
        [currentQuestion]: points
      }))

      const newScore = score + points
      setScore(newScore)
      setFeedback('⏭️ Skipped! +5 points')

      await saveScore(points, displayName)
      setTotalScore(totalScore + points)

      setTimeout(() => {
        setShowModal(false)
        setAnswer('')
        setFeedback('')
      }, 1500)
    } catch (error) {
      console.error('Error saving skip:', error)
    }
  }

  const handleSubmitWithAnswer = async (submittedAnswer) => {
    const correctAnswer = questions[currentQuestion].answer.toLowerCase().replace(/\s+/g, '')
    const userAnswer = submittedAnswer.trim().toLowerCase().replace(/\s+/g, '')
    console.log('Correct answer:', correctAnswer, 'User answer:', userAnswer, 'Match:', userAnswer === correctAnswer)
    const isCorrect = userAnswer === correctAnswer
    const isBonus = questions[currentQuestion].isBonus

    // Get display name
    const { data: userData } = await supabase
      .from('users')
      .select('display_name')
      .eq('id', user.id)
      .single()

    const displayName = userData?.display_name || user.email

    // Save answer to database only if correct
    if (isCorrect) {
      // Calculate points based on racing bonus
      let points = 10 // Base points for regular questions
      let racingBonus = 0
      let feedbackMessage = '✅ Correct!'

      if (isBonus) {
        // Bonus question also has racing bonus
        // Find which question number this is within the path (should be index 5, the bonus)
        const pathQuestionIndices = questionPaths[selectedPath]
        const localQuestionIndex = pathQuestionIndices.indexOf(currentQuestion)

        // Count how many teams have already answered the bonus question (including skips for position)
        const { data: allAnswers } = await supabase
          .from('user_answers')
          .select('user_id, question_index, is_correct, is_skipped')

        const usersWhoAnsweredBonus = new Set()

        if (allAnswers) {
          // Get all user paths to determine question positions
          const { data: userPaths } = await supabase
            .from('user_paths')
            .select('user_id, path_number')

          if (userPaths) {
            allAnswers.forEach(ans => {
              const userPath = userPaths.find(up => up.user_id === ans.user_id)
              if (userPath) {
                const userPathIndices = questionPaths[userPath.path_number]
                const userLocalIndex = userPathIndices.indexOf(ans.question_index)
                // Check if this answer is for the bonus question (index 5) - count ALL answers (correct and skipped)
                if (userLocalIndex === 5 && ans.user_id !== user.id) {
                  usersWhoAnsweredBonus.add(ans.user_id)
                }
              }
            })
          }
        }

        // Calculate racing bonus: 40 points for 1st, 38 for 2nd, 36 for 3rd, etc.
        // Position includes all who answered (correct or skipped)
        const position = usersWhoAnsweredBonus.size + 1
        racingBonus = Math.max(40 - (position - 1) * 2, 0) // 40, 38, 36, 34, 32, 30, 28, 26, 24, 22, 20, 18, 16, 14, 12, 10, 8, 6, 4, 2, 0

        points = racingBonus
        const positionSuffix = position === 1 ? 'st' : position === 2 ? 'nd' : position === 3 ? 'rd' : 'th'
        feedbackMessage = `🌟 Correct! BONUS +${racingBonus} points (${position}${positionSuffix} to answer)!`
      } else {
        // For regular questions, calculate racing bonus
        // Find which question number this is within the path (1-5)
        const pathQuestionIndices = questionPaths[selectedPath]
        const localQuestionIndex = pathQuestionIndices.indexOf(currentQuestion)

        if (localQuestionIndex >= 0 && localQuestionIndex < 5) {
          const questionNumber = localQuestionIndex + 1 // 1-5

          // Count how many teams have already answered this question number (including skips for position)
          const { data: allAnswers } = await supabase
            .from('user_answers')
            .select('user_id, question_index, is_correct, is_skipped')

          // Group answers by user and find which users answered this question position
          const usersWhoAnsweredThisPosition = new Set()

          if (allAnswers) {
            // Get all user paths to determine question positions
            const { data: userPaths } = await supabase
              .from('user_paths')
              .select('user_id, path_number')

            if (userPaths) {
              allAnswers.forEach(ans => {
                const userPath = userPaths.find(up => up.user_id === ans.user_id)
                if (userPath) {
                  const userPathIndices = questionPaths[userPath.path_number]
                  const userLocalIndex = userPathIndices.indexOf(ans.question_index)
                  // Check if this answer is for the same question position - count ALL answers (correct and skipped)
                  if (userLocalIndex === localQuestionIndex && ans.user_id !== user.id) {
                    usersWhoAnsweredThisPosition.add(ans.user_id)
                  }
                }
              })
            }
          }

          // Calculate racing bonus: 10 points for 1st, 9 for 2nd, 8 for 3rd, etc.
          // Position includes all who answered (correct or skipped)
          const position = usersWhoAnsweredThisPosition.size + 1 // +1 because this user is answering now
          racingBonus = Math.max(10 - position + 1, 0) // 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0

          if (racingBonus > 0) {
            points += racingBonus
            const positionSuffix = position === 1 ? 'st' : position === 2 ? 'nd' : position === 3 ? 'rd' : 'th'
            feedbackMessage = `✅ Correct! +10 base + ${racingBonus} racing bonus (${position}${positionSuffix} to answer Q${questionNumber})!`
          }
        }
      }

      try {
        console.log('Saving answer for question index:', currentQuestion, 'with points:', points)
        const { data, error } = await supabase
          .from('user_answers')
          .insert([{
            user_id: user.id,
            display_name: displayName,
            question_index: currentQuestion,
            is_correct: true,
            points: points
          }])
          .select()

        if (error) {
          console.error('Error saving answer:', error)
        } else {
          console.log('Answer saved successfully:', data)
        }
      } catch (error) {
        console.error('Error saving answer:', error)
      }

      // Mark question as answered only if correct
      setAnsweredQuestions(prev => new Set([...prev, currentQuestion]))

      // Store the points earned for this question
      setQuestionScores(prev => ({
        ...prev,
        [currentQuestion]: points
      }))

      const newScore = score + points
      setScore(newScore)
      setFeedback(feedbackMessage)

      // Save score immediately
      await saveScore(points, displayName)

      // Update total score display
      setTotalScore(totalScore + points)
    } else {
      const wrongMessages = [
        "Sai rồi mom",
        "haha, gà",
        "Bruhhhhhh",
        "Sai bét",
        "Gì vậy tròi"
      ]
      const randomMessage = wrongMessages[Math.floor(Math.random() * wrongMessages.length)]
      const randomImage = wrongImages[Math.floor(Math.random() * wrongImages.length)]

      setFeedback(`❌ ${randomMessage}`)
      setWrongImage(randomImage)
      setAnswer('')

      // Clear feedback after 2 seconds but keep modal open
      setTimeout(() => {
        setFeedback('')
        setWrongImage('')
      }, 2000)
      return
    }

    // Only close modal and clear if correct
    setTimeout(() => {
      setShowModal(false)
      setAnswer('')
      setFeedback('')
    }, 1500)
  }

  const handleSubmit = async () => {
    handleSubmitWithAnswer(answer)
  }

  const saveScore = async (points, displayName) => {
    try {
      const newTotal = totalScore + points

      const { error } = await supabase
        .from('scores')
        .insert([{
          user_id: user.id,
          player_name: displayName,
          score: newTotal
        }])

      if (error) console.error('Error inserting score:', error)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const finishGame = async () => {
    setIsFinished(true)
    setIsSubmitting(false)
  }

  if (showPathSelection) {
    return (
      <div className="game">
        <div className="path-selection">
          <h2>Choose Your Path</h2>
          <p>Select one of the 7 paths. Once chosen, it will be locked for other players!</p>
          <div className="path-grid">
            {[1, 2, 3, 4, 5, 6, 7].map(pathNum => (
              <button
                key={pathNum}
                onClick={() => selectPath(pathNum)}
                disabled={lockedPaths.includes(pathNum)}
                className={`path-btn ${lockedPaths.includes(pathNum) ? 'locked' : ''}`}
              >
                <div className="path-number">{pathNames[pathNum]}</div>
                {lockedPaths.includes(pathNum) && <div className="lock-icon">🔒 Locked</div>}
                {!lockedPaths.includes(pathNum) && <div className="available">✓ Available</div>}
              </button>
            ))}
          </div>
          <button onClick={onGameEnd} className="back-to-menu-btn">Back to Menu</button>
        </div>
      </div>
    )
  }

  if (isFinished) {
    return (
      <div className="game-over">
        <h2>Game Over!</h2>
        <p className="final-score">Final Score: {score + (answer.trim().toLowerCase() === questions[currentQuestion - 1]?.answer.toLowerCase() ? 10 : 0)}/{questions.length * 10}</p>
        <p>{feedback}</p>
        <button onClick={onGameEnd} disabled={isSubmitting}>
          Back to Menu
        </button>
      </div>
    )
  }

  return (
    <div className="game">
      <div className="score-board">
        <span>
          {isAdmin ? (
            <strong style={{ fontSize: '1.3rem', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>Admin View</strong>
          ) : (
            <><strong style={{ fontSize: '1.3rem', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>{pathNames[selectedPath]}</strong> | Total Score: {totalScore}</>
          )}
        </span>
        <button onClick={onGameEnd} className="back-to-menu-btn">Back to Menu</button>
      </div>

      <div className="all-paths-container">
        {[1, 2, 3, 4, 5, 6, 7].map(pathNum => {
          const pathQuestionIndices = questionPaths[pathNum]
          const isMyPath = pathNum === selectedPath

          const pathUser = pathUsers[pathNum]

          return (
            <div key={pathNum} className="path-row">
              <div className={`path-label ${isMyPath ? 'my-path-label' : ''}`} style={isMyPath ? { border: '3px solid #c44569', borderRadius: '10px', padding: '0.5rem 0.5rem 0.5rem 0', backgroundColor: 'rgba(255, 107, 157, 0.15)', boxSizing: 'border-box', width: '150px' } : {}}>
                {pathUser && pathUser.avatar && (
                  <img src={pathUser.avatar} alt={pathUser.display_name} className="path-avatar" />
                )}
                <div className="path-label-text">
                  {pathNames[pathNum]}
                  {isMyPath && <div className="your-path-badge">Your Path</div>}
                  {isAdmin && pathScores[pathNum] !== undefined && (
                    <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.25rem' }}>
                      Score: {pathScores[pathNum]}
                    </div>
                  )}
                </div>
              </div>
              <div className={`path-section ${isMyPath ? 'my-path' : ''}`}>
                <div className="question-grid-small">
                {pathQuestionIndices.map((globalIndex, localIndex) => {
                  const q = allQuestions[globalIndex]
                  const isBonus = q.isBonus

                  // Calculate if bonus is unlocked for this path
                  const pathRegularIndices = pathQuestionIndices.filter(i => !allQuestions[i].isBonus)
                  const pathRegularAnswered = pathRegularIndices.filter(i => answeredQuestions.has(i)).length
                  const bonusUnlocked = pathRegularAnswered >= pathRegularIndices.length

                  const isAnsweredByMe = answeredQuestions.has(globalIndex)
                  const isAnsweredByAnyone = allAnsweredQuestions.has(globalIndex)

                  // Check if this question is locked based on sequential order
                  let isLocked = false
                  if (isBonus) {
                    // Bonus is locked until all 5 regular questions are answered BY ME
                    // OR if any other team has answered it (then I can see it but not answer)
                    isLocked = !bonusUnlocked && !isAnsweredByAnyone
                  } else {
                    // Regular questions must be answered in order
                    // Question is locked if the previous question hasn't been answered by ME
                    // AND hasn't been answered by anyone else
                    if (localIndex > 0) {
                      const previousQuestionIndex = pathQuestionIndices[localIndex - 1]
                      const previousAnsweredByMe = answeredQuestions.has(previousQuestionIndex)

                      // Check if previous question answered by anyone
                      const previousAnsweredByAnyone = allAnsweredQuestions.has(previousQuestionIndex)

                      // Lock only if I haven't answered the previous AND nobody else has either
                      isLocked = !previousAnsweredByMe && !previousAnsweredByAnyone
                    }
                  }

                  // Can click if it's my path and not locked (even if answered, to view the question)
                  // OR if user is admin (can view all questions, even locked ones)
                  const canClick = (isMyPath && !isLocked) || isAdmin

                  // Determine what to display on the button
                  let buttonContent = null

                  if (isLocked) {
                    // Locked question - show star for bonus, lock for regular
                    buttonContent = isBonus ? <FaStar className="star-icon" /> : '🔒'
                  } else if (isAnsweredByMe) {
                    // Answered by me - show the points I earned
                    const earnedPoints = questionScores[globalIndex]
                    if (isBonus && earnedPoints) {
                      buttonContent = <span>+{earnedPoints}</span>
                    } else {
                      buttonContent = earnedPoints ? `+${earnedPoints}` : '✓'
                    }
                  } else if (isAnsweredByAnyone) {
                    // For admin, show points earned by the team for this path
                    if (isAdmin && pathUser?.user_id && allUserQuestionScores[pathUser.user_id]?.[globalIndex]) {
                      const pathUserPoints = allUserQuestionScores[pathUser.user_id][globalIndex]
                      buttonContent = `+${pathUserPoints}`
                    } else {
                      // Answered by someone else - show checkmark or star
                      buttonContent = isBonus ? <FaStar className="star-icon" /> : '✓'
                    }
                  } else {
                    // Not answered yet - show star for bonus, lock for regular
                    buttonContent = isBonus ? <FaStar className="star-icon" /> : '🔒'
                  }

                  return (
                    <button
                      key={globalIndex}
                      onClick={() => {
                        if (canClick) {
                          setCurrentQuestion(globalIndex)
                          setShowModal(true)
                          // Initialize char boxes based on answer length
                          const answerLength = allQuestions[globalIndex].answer.length
                          setCharBoxes(new Array(answerLength).fill(''))
                          setAnswer('')
                          setTwoFieldAnswers({ field1: '', field2: '' })
                        }
                      }}
                      className={`question-btn-small
                        ${isAnsweredByMe ? 'answered-by-me' : ''}
                        ${isAnsweredByAnyone && !isAnsweredByMe ? 'answered-by-other' : ''}
                        ${isBonus ? 'bonus-question' : ''}
                        ${isLocked ? 'locked-question' : ''}
                        ${!isMyPath ? 'other-path' : ''}`}
                      disabled={!canClick}
                      title={`Q${localIndex + 1}${isAnsweredByMe ? ` - Earned ${questionScores[globalIndex] || 0} pts` : ''}`}
                    >
                      {buttonContent}
                    </button>
                  )
                })}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setShowModal(false)}>×</button>
            <div className={`question-card ${questions[currentQuestion].isBonus ? 'bonus-card' : ''}`} data-path={(() => {
              // Find which path this question belongs to
              for (const [pathNum, indices] of Object.entries(questionPaths)) {
                if (indices.includes(currentQuestion)) {
                  return pathNum;
                }
              }
              return '1';
            })()}>
              {questions[currentQuestion].isBonus && (
                <div className="bonus-badge">🌟 BONUS QUESTION - Up to 40 Points! 🌟</div>
              )}
              <h2>{questions[currentQuestion].question}</h2>

              {questions[currentQuestion].image && (
                <img
                  src={questions[currentQuestion].image}
                  alt="Question"
                  style={{ maxWidth: '100%', maxHeight: '300px', marginBottom: '20px', cursor: 'pointer' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setEnlargedImage(questions[currentQuestion].image)
                  }}
                />
              )}

              {questions[currentQuestion].audio && (
                <audio controls style={{ width: '100%', marginBottom: '20px' }}>
                  <source src={questions[currentQuestion].audio} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              )}

              {isAdmin ? (
                <div className="already-answered">
                  <p className="answered-message">👁️ Admin View - Read Only</p>
                  <p style={{ color: 'white', marginTop: '1rem' }}>You are viewing this question as an admin. You cannot answer or skip questions for other teams.</p>
                </div>
              ) : answeredQuestions.has(currentQuestion) ? (
                <div className="already-answered">
                  <p className="answered-message">✅ You already answered this question!</p>
                  <p className="earned-points">You earned: +{questionScores[currentQuestion] || 10} points</p>
                </div>
              ) : (
                <>
                  {questions[currentQuestion].type === 'numberpicker' ? (
                    <NumberPicker
                      fields={questions[currentQuestion].fields}
                      onSubmit={(values) => {
                        const submittedAnswer = values.join('')
                        setAnswer(submittedAnswer)
                        handleSubmitWithAnswer(submittedAnswer)
                      }}
                      disabled={feedback !== ''}
                    />
                  ) : (
                    <>
                      {/* Check if this is question 2 (index 1 in each path) */}
                      {(() => {
                        // Find which path and local index this question belongs to
                        let questionType = 'charboxes' // default
                        for (const indices of Object.values(questionPaths)) {
                          const localIndex = indices.indexOf(currentQuestion)
                          if (localIndex === 1) { // Question 2 is at index 1
                            questionType = 'single'
                            break
                          } else if (localIndex === 3) { // Question 4 is at index 3
                            questionType = 'twofields'
                            break
                          }
                        }
                        return questionType
                      })() === 'single' ? (
                        // Single input field for question 2
                        <div style={{ marginBottom: '1rem' }}>
                          <input
                            type="text"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && answer.trim()) {
                                handleSubmit()
                              }
                            }}
                            disabled={feedback !== ''}
                            autoFocus
                            placeholder="Type your answer here..."
                            style={{
                              width: '100%',
                              padding: '1rem',
                              fontSize: '1.2rem',
                              border: '2px solid #ddd',
                              borderRadius: '8px',
                              textAlign: 'center'
                            }}
                          />
                        </div>
                      ) : (() => {
                        // Find which path and local index this question belongs to
                        let isQuestion4 = false
                        for (const indices of Object.values(questionPaths)) {
                          const localIndex = indices.indexOf(currentQuestion)
                          if (localIndex === 3) { // Question 4 is at index 3
                            isQuestion4 = true
                            break
                          }
                        }
                        return isQuestion4
                      })() ? (
                        // Two separate input fields for question 4
                        <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <input
                            type="text"
                            value={twoFieldAnswers.field1}
                            onChange={(e) => {
                              const newAnswers = { ...twoFieldAnswers, field1: e.target.value }
                              setTwoFieldAnswers(newAnswers)
                              setAnswer(newAnswers.field1 + ' ' + newAnswers.field2)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                // Move to second field or submit if both filled
                                if (twoFieldAnswers.field2.trim()) {
                                  handleSubmit()
                                } else {
                                  e.preventDefault()
                                  const form = e.target.form || e.target.parentElement
                                  const inputs = form.querySelectorAll('input[type="text"]')
                                  if (inputs[1]) inputs[1].focus()
                                }
                              }
                            }}
                            disabled={feedback !== ''}
                            autoFocus
                            placeholder="First keyword (shorter)"
                            style={{
                              width: '100%',
                              padding: '1rem',
                              fontSize: '1.2rem',
                              border: '2px solid #ddd',
                              borderRadius: '8px',
                              textAlign: 'center'
                            }}
                          />
                          <input
                            type="text"
                            value={twoFieldAnswers.field2}
                            onChange={(e) => {
                              const newAnswers = { ...twoFieldAnswers, field2: e.target.value }
                              setTwoFieldAnswers(newAnswers)
                              setAnswer(newAnswers.field1 + ' ' + newAnswers.field2)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && twoFieldAnswers.field1.trim() && twoFieldAnswers.field2.trim()) {
                                handleSubmit()
                              }
                            }}
                            disabled={feedback !== ''}
                            placeholder="Second keyword (longer)"
                            style={{
                              width: '100%',
                              padding: '1rem',
                              fontSize: '1.2rem',
                              border: '2px solid #ddd',
                              borderRadius: '8px',
                              textAlign: 'center'
                            }}
                          />
                        </div>
                      ) : (
                        // Multiple character boxes for other questions
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
                          {charBoxes.map((char, index) => (
                            <input
                              key={index}
                              type="text"
                              maxLength="1"
                              value={char}
                              onChange={(e) => {
                                const newValue = e.target.value.slice(-1)
                                const newBoxes = [...charBoxes]
                                newBoxes[index] = newValue
                                setCharBoxes(newBoxes)
                                setAnswer(newBoxes.join(''))

                                // Auto-focus next box
                                if (newValue && index < charBoxes.length - 1) {
                                  const nextInput = e.target.parentElement.children[index + 1]
                                  if (nextInput) nextInput.focus()
                                }
                              }}
                              onKeyDown={(e) => {
                                // Handle backspace to go to previous box
                                if (e.key === 'Backspace' && !char && index > 0) {
                                  const prevInput = e.target.parentElement.children[index - 1]
                                  if (prevInput) prevInput.focus()
                                }
                                // Handle Enter to submit
                                if (e.key === 'Enter' && charBoxes.join('').trim()) {
                                  handleSubmit()
                                }
                              }}
                              disabled={feedback !== ''}
                              autoFocus={index === 0}
                              style={{
                                width: '3.5rem',
                                height: '3.5rem',
                                textAlign: 'center',
                                fontSize: '1.5rem',
                                border: '2px solid #ddd',
                                borderRadius: '8px',
                                textTransform: 'uppercase',
                                padding: '0.5rem'
                              }}
                            />
                          ))}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'space-between' }}>
                        <button onClick={handleSubmit} disabled={!answer.trim() || feedback !== ''}>
                          Submit Answer
                        </button>
                        <button onClick={handleSkip} disabled={feedback !== ''} style={{ opacity: 0.8 }}>
                          Skip (+5 pts)
                        </button>
                      </div>
                    </>
                  )}
                  {feedback && <p className="feedback">{feedback}</p>}
                </>
              )}
            </div>
          </div>

          {wrongImage && (
            <div className="wrong-image-overlay">
              <img
                src={wrongImage}
                alt="Wrong answer"
              />
            </div>
          )}
        </div>
      )}

      {enlargedImage && (
        <div
          className="enlarged-image-overlay"
          onClick={() => setEnlargedImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            cursor: 'pointer',
            padding: '2rem'
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '1rem',
              borderRadius: '8px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={enlargedImage}
              alt="Enlarged view"
              style={{
                maxWidth: '100%',
                maxHeight: 'calc(90vh - 2rem)',
                objectFit: 'contain'
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default Game
