import React, { useState, useRef, useEffect } from 'react'
import '../NumberPicker.css'

function NumberPicker({ fields = 6, onSubmit, disabled }) {
  const [values, setValues] = useState(Array(fields).fill(''))
  const inputRefs = useRef([])

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  const handleChange = (index, value) => {
    // Only allow numbers
    const numValue = value.replace(/[^0-9]/g, '')

    const newValues = [...values]
    newValues[index] = numValue
    setValues(newValues)

    // Auto-focus next field if value entered
    if (numValue && index < fields - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    // Move to previous field on backspace if current is empty
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    // Submit on Enter if all fields filled
    if (e.key === 'Enter' && values.every(v => v)) {
      handleSubmit()
    }
  }

  const handleSubmit = () => {
    if (values.every(v => v) && !disabled) {
      onSubmit(values)
    }
  }

  return (
    <div className="number-picker-container">
      <div className="number-picker-fields">
        {Array(fields).fill(0).map((_, index) => (
          <React.Fragment key={index}>
            <input
              ref={el => inputRefs.current[index] = el}
              type="text"
              inputMode="numeric"
              className="number-picker-input"
              value={values[index]}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={disabled}
              maxLength={1}
            />
            {(index === 1 || index === 3) && <span className="number-picker-separator">-</span>}
          </React.Fragment>
        ))}
      </div>
      <button
        onClick={handleSubmit}
        disabled={!values.every(v => v) || disabled}
        className="number-picker-submit"
      >
        Submit Answer
      </button>
    </div>
  )
}

export default NumberPicker
