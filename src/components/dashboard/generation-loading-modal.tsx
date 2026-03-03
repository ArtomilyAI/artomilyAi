'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Check, Clock, Play, Image, Video, FileText, Sparkles, Trophy, PartyPopper, Timer } from 'lucide-react'

interface GenerationLoadingModalProps {
  isOpen: boolean
  mode: 'TEXT' | 'IMAGE' | 'VIDEO'
  hasReference: boolean
  isComplete?: boolean
  onComplete?: () => void
}

interface Step {
  id: string
  label: string
  description: string
  status: 'pending' | 'active' | 'completed'
}

export function GenerationLoadingModal({ isOpen, mode, hasReference, isComplete = false, onComplete }: GenerationLoadingModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [showCompletion, setShowCompletion] = useState(false)

  // Define steps based on mode
  const getSteps = (): Step[] => {
    const baseSteps: Step[] = []

    if (mode === 'IMAGE') {
      if (hasReference) {
        baseSteps.push({ id: 'analyze', label: 'Analyzing Reference', description: 'Processing your image...', status: 'pending' })
      }
      baseSteps.push({ id: 'generate', label: 'Generating Image', description: 'Creating your image with AI...', status: 'pending' })
      baseSteps.push({ id: 'caption', label: 'Creating Caption', description: 'Writing engaging caption...', status: 'pending' })
      baseSteps.push({ id: 'hashtags', label: 'Generating Hashtags', description: 'Finding relevant hashtags...', status: 'pending' })
    } else if (mode === 'VIDEO') {
      if (hasReference) {
        baseSteps.push({ id: 'analyze', label: 'Analyzing Reference', description: 'Processing your image...', status: 'pending' })
      }
      baseSteps.push({ id: 'generate', label: 'Generating Video', description: 'This may take 3-5 minutes...', status: 'pending' })
      baseSteps.push({ id: 'caption', label: 'Creating Caption', description: 'Writing video caption...', status: 'pending' })
      baseSteps.push({ id: 'hashtags', label: 'Generating Hashtags', description: 'Finding relevant hashtags...', status: 'pending' })
    } else {
      baseSteps.push({ id: 'generate', label: 'Generating Text', description: 'Creating your content...', status: 'pending' })
      baseSteps.push({ id: 'hashtags', label: 'Extracting Hashtags', description: 'Finding relevant hashtags...', status: 'pending' })
    }

    return baseSteps
  }

  const steps = getSteps()

  // Simulate progress
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0)
      setProgress(0)
      setElapsedTime(0)
      setShowCompletion(false)
      return
    }

    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isOpen])

  // Update progress based on current step
  useEffect(() => {
    if (!isOpen) return

    const stepProgress = (currentStep / steps.length) * 100
    const targetProgress = stepProgress + (100 / steps.length) * 0.8 // Animate to 80% of current step

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev < targetProgress) {
          return prev + 1
        }
        return prev
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isOpen, currentStep, steps.length])

  // Handle completion state
  useEffect(() => {
    if (isComplete && isOpen) {
      // Set progress to 100%
      setProgress(100)

      // Show completion state after a short delay
      const timer = setTimeout(() => {
        setShowCompletion(true)
      }, 500)

      // Close modal after showing completion
      const closeTimer = setTimeout(() => {
        if (onComplete) {
          onComplete()
        }
      }, 2000)

      return () => {
        clearTimeout(timer)
        clearTimeout(closeTimer)
      }
    }
  }, [isComplete, isOpen, onComplete])

  // Move to next step periodically (for demo - in real app, this is controlled by API)
  const advanceStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
  }

  // Expose advance function for parent component
  useEffect(() => {
    if (isOpen) {
      ; (window as any).advanceGenerationStep = advanceStep
    }
    return () => {
      delete (window as any).advanceGenerationStep
    }
  }, [isOpen])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getEstimatedTime = () => {
    if (mode === 'VIDEO') return '3-5 min'
    if (mode === 'IMAGE') return '30-60 sec'
    return '10-20 sec'
  }

  const getModeIcon = () => {
    if (mode === 'IMAGE') return <Image className="size-6 text-primary" />
    if (mode === 'VIDEO') return <Video className="size-6 text-primary" />
    return <FileText className="size-6 text-primary" />
  }

  const getModeTitle = () => {
    if (mode === 'IMAGE') return hasReference ? 'Editing Your Image' : 'Generating Your Image'
    if (mode === 'VIDEO') return hasReference ? 'Animating Your Image' : 'Generating Your Video'
    return 'Creating Your Content'
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => { }}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 bg-transparent shadow-none [&>button]:hidden">
        <div className="bg-card dark:bg-card border border-border rounded-2xl p-6 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 dark:bg-primary/20 mb-4 animate-pulse">
              {showCompletion ? (
                <Trophy className="size-8 text-primary" />
              ) : (
                getModeIcon()
              )}
            </div>
            <h2 className="text-xl font-bold text-foreground mb-1">
              {showCompletion ? 'Generation Complete!' : getModeTitle()}
            </h2>
            <p className="text-muted-foreground text-sm">
              {showCompletion ? 'Ready to view your content' : `Estimated time: ${getEstimatedTime()}`}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Steps */}
          {!showCompletion && (
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${index < currentStep
                      ? 'bg-primary/5 dark:bg-primary/10'
                      : index === currentStep
                        ? 'bg-primary/10 dark:bg-primary/15 ring-2 ring-primary/30'
                        : 'bg-muted/50'
                    }`}
                >
                  <div className={`size-8 rounded-full flex items-center justify-center shrink-0 ${index < currentStep
                      ? 'bg-green-500 dark:bg-green-600 text-white'
                      : index === currentStep
                        ? 'bg-primary text-primary-foreground animate-pulse'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                    {index < currentStep ? (
                      <Check className="size-4" />
                    ) : index === currentStep ? (
                      <div className="size-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="text-xs">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${index <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                      {step.label}
                    </p>
                    <p className={`text-xs truncate ${index === currentStep ? 'text-muted-foreground' : 'text-muted-foreground/60'
                      }`}>
                      {step.description}
                    </p>
                  </div>
                  {index === currentStep && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Timer className="size-3" />
                      <span className="text-xs font-mono">{formatTime(elapsedTime)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Completion Message */}
          {showCompletion && (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="size-16 rounded-full bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center mb-4">
                <PartyPopper className="size-8 text-green-500 dark:text-green-400" />
              </div>
              <p className="text-foreground text-center mb-2">Your content has been generated successfully!</p>
              <p className="text-muted-foreground text-sm text-center">Preparing to show your results...</p>
            </div>
          )}

          {/* Tips - only show when not in completion state */}
          {!showCompletion && (
            <div className="mt-6 p-3 bg-muted/50 border border-border rounded-xl">
              <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                <Sparkles className="size-3 text-primary" />{getTip(mode)}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function getTip(mode: 'TEXT' | 'IMAGE' | 'VIDEO'): string {
  const tips = {
    IMAGE: [
      'Detailed prompts produce better results.',
      'Adding style keywords like "cinematic" or "anime" improves quality.',
      'Reference images help maintain consistency.'
    ],
    VIDEO: [
      'Video generation takes longer for higher quality.',
      'Describe motion clearly for best animations.',
      'Keep prompts focused on one main action.'
    ],
    TEXT: [
      'Specify your target audience for better captions.',
      'Include tone preferences for consistent branding.',
      'Mention the platform (Instagram, TikTok) for optimized content.'
    ]
  }

  const modeTips = tips[mode]
  return modeTips[Math.floor(Math.random() * modeTips.length)]
}

// Export function to control steps from outside
export function advanceGenerationStep() {
  if ((window as any).advanceGenerationStep) {
    ; (window as any).advanceGenerationStep()
  }
}
