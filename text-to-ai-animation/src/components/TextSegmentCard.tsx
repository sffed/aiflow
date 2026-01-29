import React, { useState, useRef, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Sparkles, Image, Check, Play, Volume2, Upload, Trash2, Type } from 'lucide-react'
import { TextSegment as TextSegmentType } from '@/types'
import { APIService } from '@/services/api'
import { useApp } from '@/store/AppContext'

interface TextSegmentProps {
  segment: TextSegmentType
  index: number
  isProcessing: boolean
  onGeneratePrompt: () => void
  onGenerateImages: (imageCount?: number, imageWidth?: number, imageHeight?: number) => void
  onSelectImage: (imageIndex: number) => void
}

export function TextSegmentCard({
  segment,
  index,
  isProcessing,
  onGeneratePrompt,
  onGenerateImages,
  onSelectImage
}: TextSegmentProps) {
  const [prompt, setPrompt] = useState(segment.prompt || '')
  const [audioProcessing, setAudioProcessing] = useState(false)
  const [imageCount, setImageCount] = useState(4)
  const [imageSize, setImageSize] = useState('1024x768')
  const audioRef = useRef<HTMLAudioElement>(null)
  const { apiConfig, updateSegment } = useApp()

  useEffect(() => {
    setPrompt(segment.prompt || '')
  }, [segment.prompt])

  const handleGenerateAudio = async () => {
    if (!apiConfig) return

    setAudioProcessing(true)
    try {
      const apiService = new APIService(apiConfig)
      const audioBlob = await apiService.generateSpeech(segment.text)
      const audioUrl = URL.createObjectURL(audioBlob)
      
      updateSegment(segment.id, {
        audio: {
          id: `audio_${Date.now()}`,
          url: audioUrl,
          type: 'tts'
        }
      })
    } catch (error) {
      console.error('Error generating audio:', error)
    } finally {
      setAudioProcessing(false)
    }
  }

  const handleUploadAudio = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const audioUrl = URL.createObjectURL(file)
      updateSegment(segment.id, {
        audio: {
          id: `audio_${Date.now()}`,
          url: audioUrl,
          type: 'upload'
        }
      })
    }
  }

  const handleDeleteAudio = () => {
    if (segment.audio?.url && audioRef.current) {
      URL.revokeObjectURL(segment.audio.url)
    }
    updateSegment(segment.id, { audio: undefined })
  }

  const handlePlayAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play()
    }
  }

  const handleToggleSubtitle = () => {
    const current = segment.subtitle
    if (!current) {
      updateSegment(segment.id, {
        subtitle: {
          id: `subtitle_${Date.now()}`,
          text: segment.text,
          fontSize: 24,
          color: '#ffffff',
          position: 'bottom',
          background: true
        }
      })
    } else {
      updateSegment(segment.id, { subtitle: undefined })
    }
  }

  const handleSubtitleChange = (updates: Partial<typeof segment.subtitle>) => {
    if (segment.subtitle) {
      updateSegment(segment.id, {
        subtitle: {
          ...segment.subtitle,
          ...updates
        }
      })
    }
  }

  return (
    <div className="border border-border rounded-lg p-6 space-y-4">
      {segment.audio && (
        <audio
          ref={audioRef}
          src={segment.audio.url}
          onEnded={() => {
            if (audioRef.current) {
              audioRef.current.currentTime = 0
            }
          }}
        />
      )}

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              段落 {index + 1}
            </span>
            {segment.selectedImageIndex !== undefined && (
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                已完成
              </span>
            )}
            {segment.audio && (
              <span className="px-2 py-0.5 bg-green-500/10 text-green-600 text-xs rounded-full">
                有语音
              </span>
            )}
          </div>
          <p className="text-base">{segment.text}</p>
        </div>

        {segment.audio ? (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePlayAudio}
            >
              <Volume2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDeleteAudio}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`prompt-${segment.id}`}>绘图提示词</Label>
        <div className="flex gap-2">
          <Input
            id={`prompt-${segment.id}`}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="AI 将自动生成或手动输入..."
          />
          {!segment.prompt && (
            <Button
              onClick={onGeneratePrompt}
              disabled={isProcessing}
              size="icon"
            >
              <Sparkles className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {prompt && segment.generatedImages.length === 0 && (
        <div className="flex gap-2 items-center flex-wrap">
          <select
            value={imageCount}
            onChange={(e) => setImageCount(parseInt(e.target.value))}
            className="px-3 py-2 border rounded-md"
            disabled={isProcessing}
          >
            <option value={1}>1张</option>
            <option value={2}>2张</option>
            <option value={4}>4张</option>
            <option value={8}>8张</option>
          </select>
          <select
            value={imageSize}
            onChange={(e) => setImageSize(e.target.value)}
            className="px-3 py-2 border rounded-md"
            disabled={isProcessing}
          >
            <option value="512x512">512x512</option>
            <option value="768x768">768x768</option>
            <option value="1024x768">1024x768</option>
            <option value="1024x1024">1024x1024</option>
            <option value="1280x720">1280x720</option>
            <option value="1280x1280">1280x1280</option>
          </select>
          <Button onClick={() => onGenerateImages(imageCount, ...imageSize.split('x').map(Number))} disabled={isProcessing}>
            <Image className="mr-2 h-4 w-4" />
            {isProcessing ? '生成中...' : '生成图片'}
          </Button>
        </div>
      )}

      {segment.generatedImages.length > 0 && (
        <div className="space-y-2">
          <Label>生成的图片</Label>
          <div className="grid grid-cols-4 gap-4">
            {segment.generatedImages.map((image, imgIndex) => (
              <div
                key={image.id}
                className={`relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                  segment.selectedImageIndex === imgIndex
                    ? 'border-primary ring-2 ring-primary/50'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => onSelectImage(imgIndex)}
              >
                <img
                  src={image.url}
                  alt={`Generated image ${imgIndex + 1}`}
                  className="w-full h-40 object-cover"
                />
                {segment.selectedImageIndex === imgIndex && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {segment.generatedImages.length > 0 && segment.selectedImageIndex !== undefined && (
        <div className="space-y-3">
          <div className="flex gap-2">
            {!segment.audio && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateAudio}
                disabled={audioProcessing}
              >
                <Volume2 className="mr-2 h-4 w-4" />
                {audioProcessing ? '生成中...' : '生成语音'}
              </Button>
            )}
            {!segment.audio && (
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".mp3,.wav,.m4a,.flac,.ogg"
                    onChange={handleUploadAudio}
                    className="hidden"
                  />
                  <Upload className="mr-2 h-4 w-4" />
                  上传音频
                </label>
              </Button>
            )}
            <Button
              variant={segment.subtitle ? 'default' : 'outline'}
              size="sm"
              onClick={handleToggleSubtitle}
            >
              <Type className="mr-2 h-4 w-4" />
              {segment.subtitle ? '编辑字幕' : '添加字幕'}
            </Button>
          </div>

          {segment.subtitle && (
            <div className="space-y-3 p-4 bg-muted rounded-lg">
              <div className="space-y-2">
                <Label>字幕文本</Label>
                <textarea
                  className="w-full p-2 border rounded-md text-sm"
                  rows={2}
                  value={segment.subtitle.text}
                  onChange={(e) => handleSubtitleChange({ text: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>字体大小: {segment.subtitle.fontSize}px</Label>
                  <input
                    type="range"
                    min="16"
                    max="48"
                    value={segment.subtitle.fontSize}
                    onChange={(e) => handleSubtitleChange({ fontSize: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>文字颜色</Label>
                  <input
                    type="color"
                    value={segment.subtitle.color}
                    onChange={(e) => handleSubtitleChange({ color: e.target.value })}
                    className="w-full h-10 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>位置</Label>
                <div className="flex gap-2">
                  {(['top', 'center', 'bottom'] as const).map((position) => (
                    <Button
                      key={position}
                      variant={segment.subtitle?.position === position ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleSubtitleChange({ position })}
                    >
                      {position === 'top' ? '顶部' : position === 'center' ? '居中' : '底部'}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="subtitle-bg"
                  checked={segment.subtitle.background}
                  onChange={(e) => handleSubtitleChange({ background: e.target.checked })}
                />
                <Label htmlFor="subtitle-bg">显示背景</Label>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
