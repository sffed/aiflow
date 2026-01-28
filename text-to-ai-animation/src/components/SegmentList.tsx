import React, { useState } from 'react'
import { useApp } from '@/store/AppContext'
import { TextSegmentCard } from './TextSegmentCard'
import { APIService } from '@/services/api'

export function SegmentList() {
  const { segments, apiConfig, updateSegment } = useApp()
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGeneratePrompt = async (segmentId: string) => {
    if (!apiConfig) {
      setError('请先配置 API')
      return
    }

    const segment = segments.find(s => s.id === segmentId)
    if (!segment) return

    setProcessingId(segmentId)
    setError(null)

    try {
      const apiService = new APIService(apiConfig)
      const prompt = await apiService.generatePrompt(segment.text)
      updateSegment(segmentId, { prompt })
    } catch (err) {
      setError(`生成提示词失败: ${err instanceof Error ? err.message : '未知错误'}`)
    } finally {
      setProcessingId(null)
    }
  }

  const handleGenerateImages = async (segmentId: string) => {
    if (!apiConfig) {
      setError('请先配置 API')
      return
    }

    const segment = segments.find(s => s.id === segmentId)
    if (!segment || !segment.prompt) return

    setProcessingId(segmentId)
    setError(null)

    try {
      const apiService = new APIService(apiConfig)
      const prevSegment = segments[segments.indexOf(segment) - 1]
      const referenceImage = prevSegment?.selectedImageIndex !== undefined
        ? prevSegment.generatedImages[prevSegment.selectedImageIndex]?.data
        : undefined

      const images = await apiService.generateImages(
        segment.prompt,
        4,
        1024,
        768,
        referenceImage
      )
      updateSegment(segmentId, { generatedImages: images })
    } catch (err) {
      setError(`生成图片失败: ${err instanceof Error ? err.message : '未知错误'}`)
    } finally {
      setProcessingId(null)
    }
  }

  const handleSelectImage = (segmentId: string, imageIndex: number) => {
    updateSegment(segmentId, { selectedImageIndex: imageIndex })
  }

  if (segments.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        还没有文本段落，点击上方"添加文本段落"按钮开始
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          {error}
        </div>
      )}

      {segments.map((segment, index) => (
        <TextSegmentCard
          key={segment.id}
          segment={segment}
          index={index}
          isProcessing={processingId === segment.id}
          onGeneratePrompt={() => handleGeneratePrompt(segment.id)}
          onGenerateImages={() => handleGenerateImages(segment.id)}
          onSelectImage={(imageIndex) => handleSelectImage(segment.id, imageIndex)}
        />
      ))}
    </div>
  )
}
