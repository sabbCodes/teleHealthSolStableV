"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface SessionCompletionFlowProps {
  appointmentId: string
  userId?: string  // Made optional since it's not used
  onComplete: () => void
  onDispute: (reason: string) => void
}

export function SessionCompletionFlow({
  appointmentId,
  userId,
  onComplete,
  onDispute,
}: SessionCompletionFlowProps) {
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes in seconds
  const [isLoading, setIsLoading] = useState(false)
  const [showDisputeForm, setShowDisputeForm] = useState(false)
  const [disputeReason, setDisputeReason] = useState("")
  const supabase = createClientComponentClient<Database>()

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  // Handle marking session as complete
  const handleComplete = async () => {
    try {
      setIsLoading(true)
      // Update the session status to completed
      const { error } = await supabase
        .from('schedules')
        .update({ 
          status: 'completed',
          ended_at: new Date().toISOString()
        })
        .eq('id', appointmentId)

      if (error) throw error
      
      onComplete()
      toast.success("Session completed successfully!")
    } catch (error) {
      console.error('Error completing session:', error)
      toast.error("Failed to complete session")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle dispute submission
  const handleDispute = async () => {
    if (!disputeReason.trim()) {
      toast.error("Please provide a reason for the dispute")
      return
    }

    try {
      setIsLoading(true)
      // Update the session status to disputed
      const { error } = await supabase
        .from('schedules')
        .update({ 
          status: 'disputed',
          dispute_reason: disputeReason,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId)

      if (error) throw error
      
      onDispute(disputeReason)
      toast.success("Dispute submitted. Our team will review it shortly.")
    } catch (error) {
      console.error('Error submitting dispute:', error)
      toast.error("Failed to submit dispute")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
            Session Completion Requested
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
            The doctor has requested to end the session. You have {formatTime(timeLeft)} to confirm or dispute.
          </p>
          
          {showDisputeForm ? (
            <div className="mt-3 space-y-2">
              <textarea
                className="w-full p-2 text-sm border rounded-md dark:bg-gray-800 dark:border-gray-700"
                placeholder="Please provide a reason for disputing the session..."
                rows={3}
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
              />
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowDisputeForm(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDispute}
                  disabled={isLoading || !disputeReason.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Dispute'
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex space-x-2 mt-3">
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleComplete}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Completing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    End Session
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowDisputeForm(true)}
                disabled={isLoading}
              >
                Dispute Session
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
