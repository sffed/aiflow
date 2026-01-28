import React, { useState, useEffect, useRef } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Button } from './ui/button'
import { X, Play, Pause, Maximize2, RotateCcw } from 'lucide-react'
import { TextSegment } from '@/types'

interface AnimationPreviewProps {
  segments: TextSegment[]
  onClose: () => void
}

export function AnimationPreview({ segments, onClose }: AnimationPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [totalDuration, setTotalDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const completedSegments = segments.filter(
    seg => seg.selectedImageIndex !== undefined
  )

  useEffect(() => {
    const duration = completedSegments.reduce((sum, seg) => sum + seg.duration, 0)
    setTotalDuration(duration)
  }, [completedSegments])

  useEffect(() => {
    if (isPlaying && currentIndex < completedSegments.length) {
      const segment = completedSegments[currentIndex]

      if (segment.audio) {
        if (audioRef.current) {
          audioRef.current.src = segment.audio.url
          audioRef.current.play()
        }
      }

      intervalRef.current = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % completedSegments.length)
        setCurrentTime((prev) => {
          const newTime = prev + segment.duration
          return newTime >= totalDuration ? 0 : newTime
        })
      }, segment.duration * 1000)
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current)
      }
    }
  }, [isPlaying, currentIndex, completedSegments, totalDuration])

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current)
      }
    }
  }, [])

  const handlePlay = () => setIsPlaying(true)
  const handlePause = () => {
    setIsPlaying(false)
    if (intervalRef.current) {
      clearTimeout(intervalRef.current)
    }
    if (audioRef.current) {
      audioRef.current.pause()
    }
  }
  const handleReset = () => {
    handlePause()
    setCurrentIndex(0)
    setCurrentTime(0)
  }

  const handleSegmentClick = (index: number) => {
    handlePause()
    setCurrentIndex(index)
    const newTime = completedSegments.slice(0, index).reduce((sum, seg) => sum + seg.duration, 0)
    setCurrentTime(newTime)
  }

  const currentSegment = completedSegments[currentIndex]
  const currentImage = currentSegment?.selectedImageIndex !== undefined
    ? currentSegment.generatedImages[currentSegment.selectedImageIndex]
    : null

  if (completedSegments.length === 0) {
    return (
      <Dialog.Root open onOpenChange={onClose}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/90" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <p className="text-white text-lg">还没有完成图片选择的段落，无法预览</p>
            <Button onClick={onClose} className="mt-4">关闭</Button>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    )
  }

  return (
    <Dialog.Root open onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/95" />
        <Dialog.Content className="fixed inset-0 flex items-center justify-center p-4">
          <div className="w-full max-w-6xl space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-white text-xl font-bold">动画预览</h2>
              <Dialog.Close asChild>
                <Button variant="ghost" size="icon" className="text-white hover:text-white">
                  <X className="h-5 w-5" />
                </Button>
              </Dialog.Close>
            </div>

            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              {currentImage && (
                <img
                  src={currentImage.url}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              )}

              {currentSegment?.subtitle && (
                <div
                  className="absolute px-4 py-2 rounded"
                  style={{
                    top: currentSegment.subtitle.position === 'top' ? '10%' :
                        currentSegment.subtitle.position === 'center' ? '50%' : 'auto',
                    bottom: currentSegment.subtitle.position === 'bottom' ? '10%' : 'auto',
                    transform: currentSegment.subtitle.position === 'center' ? 'translateY(-50%)' : 'none',
                    fontSize: `${currentSegment.subtitle.fontSize}px`,
                    color: currentSegment.subtitle.color,
                    backgroundColor: currentSegment.subtitle.background ? 'rgba(0, 0, 0, 0.7)' : 'transparent',
                    left: '50%',
                    transform: currentSegment.subtitle.position === 'center' ? 'translate(-50%, -50%)' : 'translateX(-50%)',
                    textAlign: 'center',
                    maxWidth: '80%'
                  }}
                >
                  {currentSegment.subtitle.text}
                </div>
              )}

              <audio ref={audioRef} onEnded={() => {}} />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <Button onClick={isPlaying ? handlePause : handlePlay} size="icon">
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                <Button onClick={handleReset} variant="ghost" size="icon">
                  <RotateCcw className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-2 text-white">
                  <span className="font-mono">
                    {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, '0')}
                  </span>
                  <span>/</span>
                  <span className="font-mono">
                    {Math.floor(totalDuration / 60)}:{(totalDuration % 60).toFixed(0).padStart(2, '0')}
                  </span>
                </div>
                <div className="flex-1 mx-4 h-2 bg-white/20 rounded-full overflow-hidden cursor-pointer">
                  <div
                    className="h-full bg-white transition-all"
                    style={{ width: `${(currentTime / totalDuration) * 100}%` }}
                  />
                </div>
                <select
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                  className="bg-white/10 text-white px-3 py-1 rounded border border-white/20"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={1}>1x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2x</option>
                </select>
                <Button variant="ghost" size="icon">
                  <Maximize2 className="h-5 w-5 text-white" />
                </Button>
              </div>

              <div className="flex gap-1 overflow-x-auto pb-2">
                {completedSegments.map((segment, index) => {
                  const selectedImage = segment.selectedImageIndex !== undefined
                    ? segment.generatedImages[segment.selectedImageIndex]
                    : null
                  return (
                    <div
                      key={segment.id}
                      className={`relative flex-shrink-0 cursor-pointer border-2 rounded overflow-hidden ${
                        currentIndex === index ? 'border-white' : 'border-white/20'
                      }`}
                      style={{ width: '80px' }}
                      onClick={() => handleSegmentClick(index)}
                    >
                      {selectedImage && (
                        <img
                          src={selectedImage.url}
                          alt={`Segment ${index + 1}`}
                          className="w-full h-14 object-cover"
                        />
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs text-center py-1">
                        {index + 1}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="text-center text-white text-sm">
                当前: 段落 {currentIndex + 1} / {completedSegments.length}
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
