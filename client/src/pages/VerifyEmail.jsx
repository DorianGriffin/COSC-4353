import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"

const VerifyEmail = () => {
  const { token } = useParams()
  const [message, setMessage] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`http://localhost:8080/api/users/verify-email/${token}`)
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.message || "Verification failed")
        setTimeout(() => navigate("/login"), 3000)
      })
      .catch(() => setMessage("Server error"))
  }, [token])

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{message}</h2>
        <p>You’ll be redirected to login shortly...</p>
      </div>
    </div>
  )
}

export default VerifyEmail