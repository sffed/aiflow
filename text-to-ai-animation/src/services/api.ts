import { TextSegment, APIConfig, GeneratedImage } from '@/types'

export class APIService {
  private config: APIConfig

  constructor(config: APIConfig) {
    this.config = config
  }

  async generatePrompt(text: string): Promise<string> {
    const { textToPrompt } = this.config

    console.log('[API] 开始生成绘图提示词', {
      provider: textToPrompt.provider,
      model: textToPrompt.model,
      text: text.substring(0, 50) + '...'
    })

    try {
      let result: string
      if (textToPrompt.provider === 'openai') {
        result = await this.callOpenAI(textToPrompt, text)
      } else if (textToPrompt.provider === 'anthropic') {
        result = await this.callAnthropic(textToPrompt, text)
      } else if (textToPrompt.provider === 'zhipu') {
        result = await this.callZhipu(textToPrompt, text)
      } else {
        result = await this.callCustomAPI(textToPrompt.endpoint, textToPrompt.apiKey, text)
      }

      console.log('[API] 绘图提示词生成成功', {
        provider: textToPrompt.provider,
        result: result ? result.substring(0, 100) + '...' : '空结果',
        fullResult: result
      })

      return result
    } catch (error) {
      console.error('[API] 绘图提示词生成失败', {
        provider: textToPrompt.provider,
        error: error instanceof Error ? error.message : String(error)
      })
      throw error
    }
  }

  async generateImages(
    prompt: string,
    count: number,
    width: number,
    height: number,
    referenceImage?: string
  ): Promise<GeneratedImage[]> {
    const { imageGeneration } = this.config

    console.log('[API] 开始生成图片', {
      provider: imageGeneration.provider,
      model: imageGeneration.model,
      count,
      width,
      height,
      hasReferenceImage: !!referenceImage,
      prompt: prompt.substring(0, 50) + '...'
    })

    try {
      let result: GeneratedImage[]
      if (imageGeneration.provider === 'stable-diffusion') {
        result = await this.callStableDiffusion(
          imageGeneration,
          prompt,
          count,
          width,
          height,
          referenceImage
        )
      } else if (imageGeneration.provider === 'midjourney') {
        result = await this.callMidjourney(imageGeneration, prompt, count)
      } else {
        result = await this.callCustomImageAPI(imageGeneration, prompt, count)
      }

      console.log('[API] 图片生成成功', {
        provider: imageGeneration.provider,
        count: result.length,
        images: result.map(img => ({ id: img.id, url: img.url.substring(0, 50) + '...' }))
      })

      return result
    } catch (error) {
      console.error('[API] 图片生成失败', {
        provider: imageGeneration.provider,
        error: error instanceof Error ? error.message : String(error)
      })
      throw error
    }
  }

  async generateSpeech(text: string): Promise<Blob> {
    const { textToSpeech } = this.config

    console.log('[API] 开始生成语音', {
      provider: textToSpeech.provider,
      model: textToSpeech.model,
      voice: textToSpeech.voice,
      speed: textToSpeech.speed,
      text: text.substring(0, 50) + '...'
    })

    try {
      let result: Blob
      if (textToSpeech.provider === 'openai') {
        result = await this.callOpenAITTS(textToSpeech, text)
      } else if (textToSpeech.provider === 'azure') {
        result = await this.callAzureTTS(textToSpeech, text)
      } else if (textToSpeech.provider === 'google') {
        result = await this.callGoogleTTS(textToSpeech, text)
      } else {
        result = await this.callCustomTTS(textToSpeech.endpoint, textToSpeech.apiKey, text)
      }

      console.log('[API] 语音生成成功', {
        provider: textToSpeech.provider,
        size: result.size,
        type: result.type
      })

      return result
    } catch (error) {
      console.error('[API] 语音生成失败', {
        provider: textToSpeech.provider,
        error: error instanceof Error ? error.message : String(error)
      })
      throw error
    }
  }

  private async callOpenAI(config: any, text: string): Promise<string> {
    const endpoint = `${config.endpoint}/chat/completions`
    console.log('[API] 调用 OpenAI', { endpoint, model: config.model })

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert at converting text into detailed image generation prompts. Create vivid, descriptive prompts suitable for AI image generation.'
          },
          {
            role: 'user',
            content: `Convert this text into an image generation prompt: ${text}`
          }
        ]
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('[API] OpenAI 请求失败', { status: response.status, error })
      throw new Error(`OpenAI API error: ${response.status} - ${error}`)
    }

    const data = await response.json()
    console.log('[API] OpenAI 响应', { data })
    return data.choices[0].message.content
  }

  private async callZhipu(config: any, text: string): Promise<string> {
    console.log('[API] 调用智谱AI', { endpoint: config.endpoint, model: config.model })

    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'system',
            content: '你是一位专业的AI绘画提示词专家，擅长将文本转换为详细、生动、具有画面感的绘画提示词。'
          },
          {
            role: 'user',
            content: '请帮我为以下文本生成绘画提示词'
          },
          {
            role: 'assistant',
            content: '当然可以！请告诉我您想要生成绘画提示词的文本内容。'
          },
          {
            role: 'user',
            content: text
          }
        ],
        thinking: {
          type: 'enabled'
        },
        max_tokens: 4096,
        temperature: 0.6
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('[API] 智谱AI 请求失败', { status: response.status, error })
      throw new Error(`智谱AI API error: ${response.status} - ${error}`)
    }

    const data = await response.json()
    console.log('[API] 智谱AI 响应', { data })
    return data.choices[0].message.content
  }

  private async callAnthropic(config: any, text: string): Promise<string> {
    const response = await fetch(`${config.endpoint}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `Convert this text into an image generation prompt: ${text}`
          }
        ]
      })
    })

    const data = await response.json()
    return data.content[0].text
  }

  private async callCustomAPI(endpoint: string, apiKey: string, text: string): Promise<string> {
    console.log('[API] 调用自定义 API', { endpoint })

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ text })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('[API] 自定义 API 请求失败', { status: response.status, error })
      throw new Error(`Custom API error: ${response.status} - ${error}`)
    }

    const data = await response.json()
    console.log('[API] 自定义 API 响应', { data })

    if (data.error) {
      console.error('[API] 自定义 API 返回错误', { error: data.error })
      throw new Error(`API Error: ${JSON.stringify(data.error)}`)
    }

    return data.prompt || data.content || data.choices?.[0]?.message?.content || text
  }

  private async callStableDiffusion(
    config: any,
    prompt: string,
    count: number,
    width: number,
    height: number,
    referenceImage?: string
  ): Promise<GeneratedImage[]> {
    const endpoint = `${config.endpoint}/sdapi/v1/txt2img`
    console.log('[API] 调用 Stable Diffusion', { endpoint, count, width, height })

    const images: GeneratedImage[] = []

    for (let i = 0; i < count; i++) {
      console.log(`[API] 生成图片进度: ${i + 1}/${count}`)

      const payload: any = {
        prompt,
        width,
        height,
        num_images: 1
      }

      if (referenceImage) {
        payload.init_images = [referenceImage]
        payload.denoising_strength = this.config.imageGeneration.apiKey ? 0.5 : 0.7
        console.log('[API] 使用图生图模式', { hasReference: true })
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` })
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('[API] Stable Diffusion 请求失败', { status: response.status, error })
        throw new Error(`Stable Diffusion error: ${response.status} - ${error}`)
      }

      const data = await response.json()
      const base64Image = data.images[0]

      console.log(`[API] 图片 ${i + 1} 生成成功`, { size: base64Image.length })

      images.push({
        id: `img_${Date.now()}_${i}`,
        url: `data:image/png;base64,${base64Image}`,
        data: base64Image
      })
    }

    return images
  }

  private async callMidjourney(config: any, prompt: string, count: number): Promise<GeneratedImage[]> {
    console.log('[API] 调用 Midjourney', { endpoint: config.endpoint, count })

    const images: GeneratedImage[] = []

    for (let i = 0; i < count; i++) {
      console.log(`[API] 生成图片进度: ${i + 1}/${count}`)

      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          prompt: `${prompt} --v 6 --ar 16:9`,
          num_images: 1
        })
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('[API] Midjourney 请求失败', { status: response.status, error })
        throw new Error(`Midjourney error: ${response.status} - ${error}`)
      }

      const data = await response.json()

      console.log(`[API] 图片 ${i + 1} 生成成功`, { url: data.url })

      images.push({
        id: `img_${Date.now()}_${i}`,
        url: data.url
      })
    }

    return images
  }

  private async callCustomImageAPI(config: any, prompt: string, count: number): Promise<GeneratedImage[]> {
    const response = await fetch(`${config.endpoint}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        prompt,
        num_images: count
      })
    })

    const data = await response.json()
    return data.images.map((img: any, index: number) => ({
      id: `img_${Date.now()}_${index}`,
      url: img.url
    }))
  }

  private async callOpenAITTS(config: any, text: string): Promise<Blob> {
    const response = await fetch(`${config.endpoint}/audio/speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        input: text,
        voice: config.voice,
        speed: config.speed
      })
    })

    return await response.blob()
  }

  private async callAzureTTS(config: any, text: string): Promise<Blob> {
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/ssml+xml',
        'Ocp-Apim-Subscription-Key': config.apiKey,
        'X-Microsoft-OutputFormat': 'audio-mp3'
      },
      body: `
        <speak version='1.0' xml:lang='en-US'>
          <voice xml:lang='en-US' name='${config.model}'>
            <prosody rate='${config.speed}' pitch='${config.pitch}' volume='${config.volume}'>
              ${text}
            </prosody>
          </voice>
        </speak>
      `
    })

    return await response.blob()
  }

  private async callGoogleTTS(config: any, text: string): Promise<Blob> {
    const response = await fetch(`${config.endpoint}/text:synthesize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: 'en-US', name: config.model },
        audioConfig: { audioEncoding: 'MP3', speakingRate: config.speed }
      })
    })

    const data = await response.json()
    const binaryString = atob(data.audioContent)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return new Blob([bytes], { type: 'audio/mpeg' })
  }

  private async callCustomTTS(endpoint: string, apiKey: string, text: string): Promise<Blob> {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ text })
    })

    return await response.blob()
  }
}
