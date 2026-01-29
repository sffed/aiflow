import React, { useState, useRef } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { X, Video, CheckCircle2, Download } from 'lucide-react'
import { TextSegment, VideoOptions } from '@/types'

interface VideoExportDialogProps {
  segments: TextSegment[]
  isOpen: boolean
  onClose: () => void
}

export function VideoExportDialog({ segments, isOpen, onClose }: VideoExportDialogProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [videoOptions, setVideoOptions] = useState<VideoOptions>({
    format: 'mp4',
    resolution: { width: 1920, height: 1080 },
    frameRate: 30,
    bitrate: 5000,
    audioQuality: 'medium'
  })
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const completedSegments = segments.filter(
    seg => seg.selectedImageIndex !== undefined
  )

  if (completedSegments.length === 0) {
    return (
      <Dialog.Root open={isOpen} onOpenChange={onClose}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="text-center space-y-4">
              <Video className="mx-auto h-12 w-12 text-muted-foreground" />
              <h2 className="text-xl font-bold">无法生成视频</h2>
              <p className="text-muted-foreground">
                还没有完成图片选择的段落，请先完成至少一个段落的图片选择
              </p>
              <Button onClick={onClose} className="w-full">关闭</Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    )
  }

  const handleExport = async () => {
    setIsExporting(true)
    setProgress(0)

    try {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = videoOptions.resolution.width
      canvas.height = videoOptions.resolution.height

      const frames: ImageData[] = []

      for (let i = 0; i < completedSegments.length; i++) {
        const segment = completedSegments[i]
        const selectedImage = segment.generatedImages[segment.selectedImageIndex!]

        if (selectedImage) {
          const img = new Image()
          await new Promise((resolve) => {
            img.onload = resolve
            img.src = selectedImage.url
          })

          const frameCount = Math.floor(segment.duration * videoOptions.frameRate)

          for (let j = 0; j < frameCount; j++) {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

            if (segment.subtitle) {
              const fontSize = Math.floor((segment.subtitle.fontSize / 1080) * canvas.height)
              ctx.font = `${fontSize}px Arial, sans-serif`
              ctx.fillStyle = segment.subtitle.color
              ctx.textAlign = 'center'

              let x = canvas.width / 2
              let y = fontSize * 1.5

              if (segment.subtitle.position === 'bottom') {
                y = canvas.height - fontSize * 2
              } else if (segment.subtitle.position === 'top') {
                y = fontSize * 2
              }

              if (segment.subtitle.background) {
                const textMetrics = ctx.measureText(segment.subtitle.text)
                const padding = fontSize / 2
                const bgWidth = textMetrics.width + padding * 2
                const bgHeight = fontSize + padding

                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
                ctx.fillRect(
                  x - bgWidth / 2,
                  y - fontSize,
                  bgWidth,
                  bgHeight
                )
                ctx.fillStyle = segment.subtitle.color
              }

              ctx.fillText(segment.subtitle.text, x, y)
            }

            frames.push(ctx.getImageData(0, 0, canvas.width, canvas.height))
          }
        }

        setProgress(Math.round(((i + 1) / completedSegments.length) * 100))
      }

      const stream = canvas.captureStream(videoOptions.frameRate)
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: `video/${videoOptions.format}`,
        videoBitsPerSecond: videoOptions.bitrate * 1000
      })

      const chunks: Blob[] = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: `video/${videoOptions.format}` })
        const url = URL.createObjectURL(blob)

        const a = document.createElement('a')
        a.href = url
        a.download = `animation_${Date.now()}.${videoOptions.format}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        setIsExporting(false)
        setProgress(100)
      }

      mediaRecorder.start()

      let frameIndex = 0
      const drawFrame = () => {
        if (frameIndex < frames.length) {
          ctx.putImageData(frames[frameIndex], 0, 0)
          frameIndex++
          requestAnimationFrame(drawFrame)
        } else {
          mediaRecorder.stop()
        }
      }

      drawFrame()
    } catch (error) {
      console.error('Error exporting video:', error)
      alert('视频导出失败')
      setIsExporting(false)
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background rounded-lg shadow-lg w-full max-w-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-bold">导出视频</Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>

          <canvas ref={canvasRef} className="hidden" />

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="format">视频格式</Label>
                <select
                  id="format"
                  className="w-full p-2 border rounded-md"
                  value={videoOptions.format}
                  onChange={(e) =>
                    setVideoOptions({ ...videoOptions, format: e.target.value as any })
                  }
                  disabled={isExporting}
                >
                  <option value="mp4">MP4</option>
                  <option value="mov">MOV</option>
                  <option value="webm">WebM</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resolution">分辨率</Label>
                <select
                  id="resolution"
                  className="w-full p-2 border rounded-md"
                  value={`${videoOptions.resolution.width}x${videoOptions.resolution.height}`}
                  onChange={(e) => {
                    const [width, height] = e.target.value.split('x').map(Number)
                    setVideoOptions({
                      ...videoOptions,
                      resolution: { width, height }
                    })
                  }}
                  disabled={isExporting}
                >
                  <option value="1920x1080">1920 x 1080 (Full HD)</option>
                  <option value="1280x720">1280 x 720 (HD)</option>
                  <option value="854x480">854 x 480 (SD)</option>
                  <option value="3840x2160">3840 x 2160 (4K)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="framerate">帧率: {videoOptions.frameRate} fps</Label>
                <input
                  id="framerate"
                  type="range"
                  min="15"
                  max="60"
                  step="5"
                  value={videoOptions.frameRate}
                  onChange={(e) =>
                    setVideoOptions({
                      ...videoOptions,
                      frameRate: parseInt(e.target.value)
                    })
                  }
                  disabled={isExporting}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quality">视频质量</Label>
                <select
                  id="quality"
                  className="w-full p-2 border rounded-md"
                  value={videoOptions.audioQuality}
                  onChange={(e) =>
                    setVideoOptions({
                      ...videoOptions,
                      audioQuality: e.target.value as any
                    })
                  }
                  disabled={isExporting}
                >
                  <option value="low">低 (小文件)</option>
                  <option value="medium">中 (推荐)</option>
                  <option value="high">高 (大文件)</option>
                </select>
              </div>
            </div>

            {isExporting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>导出进度</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {progress === 100 && !isExporting && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span>视频导出成功！</span>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose} disabled={isExporting}>
                关闭
              </Button>
              <Button
                onClick={handleExport}
                disabled={isExporting || progress === 100}
              >
                {isExporting ? '导出中...' : '导出视频'}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
