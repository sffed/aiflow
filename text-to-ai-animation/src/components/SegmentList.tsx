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
      console.error('[Segment] 生成提示词失败: 未配置 API')
      setError('请先配置 API')
      return
    }

    const segment = segments.find(s => s.id === segmentId)
    if (!segment) {
      console.error('[Segment] 未找到段落', { segmentId })
      return
    }

    console.log('[Segment] 开始生成提示词', { segmentId, text: segment.text })
    setProcessingId(segmentId)
    setError(null)

    try {
      const apiService = new APIService(apiConfig)
      const prompt = await apiService.generatePrompt(segment.text)
      updateSegment(segmentId, { prompt })
      console.log('[Segment] 提示词生成完成', { segmentId, prompt })
    } catch (err) {
      const errorMsg = `生成提示词失败: ${err instanceof Error ? err.message : '未知错误'}`
      console.error('[Segment] 提示词生成错误', { segmentId, error: err })
      setError(errorMsg)
    } finally {
      setProcessingId(null)
    }
  }

  const handleGenerateImages = async (segmentId: string) => {
    if (!apiConfig) {
      console.error('[Segment] 生成图片失败: 未配置 API')
      setError('请先配置 API')
      return
    }

    const segment = segments.find(s => s.id === segmentId)
    if (!segment || !segment.prompt) {
      console.error('[Segment] 生成图片失败: 段落或提示词不存在', { segmentId, hasPrompt: !!segment?.prompt })
      return
    }

    console.log('[Segment] 开始生成图片', { segmentId, prompt: segment.prompt })
    setProcessingId(segmentId)
    setError(null)

    try {
      const apiService = new APIService(apiConfig)
      const prevSegment = segments[segments.indexOf(segment) - 1]
      const referenceImage = prevSegment?.selectedImageIndex !== undefined
        ? prevSegment.generatedImages[prevSegment.selectedImageIndex]?.data
        : undefined

      if (referenceImage) {
        console.log('[Segment] 使用图生图模式', { segmentId })
      }

      const images = await apiService.generateImages(
        segment.prompt,
        4,
        1024,
        768,
        referenceImage
      )
      updateSegment(segmentId, { generatedImages: images })
      console.log('[Segment] 图片生成完成', { segmentId, count: images.length })
    } catch (err) {
      const errorMsg = `生成图片失败: ${err instanceof Error ? err.message : '未知错误'}`
      console.error('[Segment] 图片生成错误', { segmentId, error: err })
      setError(errorMsg)
    } finally {
      setProcessingId(null)
    }
  }

  const handleSelectImage = (segmentId: string, imageIndex: number) => {
    console.log('[Segment] 选择图片', { segmentId, imageIndex })
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
