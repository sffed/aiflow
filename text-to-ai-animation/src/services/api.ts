import { TextSegment, APIConfig, GeneratedImage } from '@/types'

export class APIService {
  private config: APIConfig

  constructor(config: APIConfig) {
    this.config = config
  }

  async generatePrompt(text: string): Promise<string> {
    const { textToPrompt } = this.config

    try {
      if (textToPrompt.provider === 'openai') {
        return await this.callOpenAI(textToPrompt, text)
      } else if (textToPrompt.provider === 'anthropic') {
        return await this.callAnthropic(textToPrompt, text)
      } else {
        return await this.callCustomAPI(textToPrompt.endpoint, textToPrompt.apiKey, text)
      }
    } catch (error) {
      console.error('Error generating prompt:', error)
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

    try {
      if (imageGeneration.provider === 'stable-diffusion') {
        return await this.callStableDiffusion(
          imageGeneration,
          prompt,
          count,
          width,
          height,
          referenceImage
        )
      } else if (imageGeneration.provider === 'midjourney') {
        return await this.callMidjourney(imageGeneration, prompt, count)
      } else {
        return await this.callCustomImageAPI(imageGeneration, prompt, count)
      }
    } catch (error) {
      console.error('Error generating images:', error)
      throw error
    }
  }

  async generateSpeech(text: string): Promise<Blob> {
    const { textToSpeech } = this.config

    try {
      if (textToSpeech.provider === 'openai') {
        return await this.callOpenAITTS(textToSpeech, text)
      } else if (textToSpeech.provider === 'azure') {
        return await this.callAzureTTS(textToSpeech, text)
      } else if (textToSpeech.provider === 'google') {
        return await this.callGoogleTTS(textToSpeech, text)
      } else {
        return await this.callCustomTTS(textToSpeech.endpoint, textToSpeech.apiKey, text)
      }
    } catch (error) {
      console.error('Error generating speech:', error)
      throw error
    }
  }

  private async callOpenAI(config: any, text: string): Promise<string> {
    const response = await fetch(`${config.endpoint}/chat/completions`, {
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

    const data = await response.json()
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
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ text })
    })

    const data = await response.json()
    return data.prompt
  }

  private async callStableDiffusion(
    config: any,
    prompt: string,
    count: number,
    width: number,
    height: number,
    referenceImage?: string
  ): Promise<GeneratedImage[]> {
    const images: GeneratedImage[] = []

    for (let i = 0; i < count; i++) {
      const payload: any = {
        prompt,
        width,
        height,
        num_images: 1
      }

      if (referenceImage) {
        payload.init_images = [referenceImage]
        payload.denoising_strength = this.config.imageGeneration.apiKey ? 0.5 : 0.7
      }

      const response = await fetch(`${config.endpoint}/sdapi/v1/txt2img`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` })
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      const base64Image = data.images[0]

      images.push({
        id: `img_${Date.now()}_${i}`,
        url: `data:image/png;base64,${base64Image}`,
        data: base64Image
      })
    }

    return images
  }

  private async callMidjourney(config: any, prompt: string, count: number): Promise<GeneratedImage[]> {
    const images: GeneratedImage[] = []

    for (let i = 0; i < count; i++) {
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

      const data = await response.json()

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
