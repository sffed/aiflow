export interface TextSegment {
  id: string
  text: string
  prompt?: string
  generatedImages: GeneratedImage[]
  selectedImageIndex?: number
  audio?: AudioFile
  subtitle?: Subtitle
  duration: number
}

export interface GeneratedImage {
  id: string
  url: string
  data?: string
}

export interface AudioFile {
  id: string
  url: string
  type: 'tts' | 'upload'
  duration?: number
}

export interface Subtitle {
  id: string
  text: string
  fontSize: number
  color: string
  position: 'top' | 'bottom' | 'center'
  background?: boolean
}

export interface APIConfig {
  textToPrompt: {
    provider: 'openai' | 'anthropic' | 'zhipu' | 'custom'
    apiKey: string
    endpoint: string
    model: string
  }
  imageGeneration: {
    provider: 'stable-diffusion' | 'midjourney' | 'custom'
    apiKey: string
    endpoint: string
    model: string
  }
  textToSpeech: {
    provider: 'openai' | 'azure' | 'google' | 'elevenlabs' | 'custom'
    apiKey: string
    endpoint: string
    model: string
    voice: string
    speed: number
    pitch: number
    volume: number
  }
}

export interface ProjectSettings {
  imageWidth: number
  imageHeight: number
  imageCount: number
  useImageToImage: boolean
  imageToImageStrength: number
  enableSubtitles: boolean
  defaultSubtitleStyle: Partial<Subtitle>
}

export interface AnimationProject {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  segments: TextSegment[]
  settings: ProjectSettings
  apiConfig: APIConfig
}

export interface ExportOptions {
  format: 'gif' | 'mp4' | 'webm'
  frameRate: number
  resolution: {
    width: number
    height: number
  }
  quality: 'low' | 'medium' | 'high'
}

export interface VideoOptions {
  format: 'mp4' | 'mov' | 'avi'
  resolution: {
    width: number
    height: number
  }
  frameRate: number
  bitrate: number
  audioQuality: 'low' | 'medium' | 'high'
}
