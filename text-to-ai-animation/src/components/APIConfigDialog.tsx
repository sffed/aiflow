import React, { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { X } from 'lucide-react'
import { useApp } from '@/store/AppContext'
import { APIConfig } from '@/types'

export function APIConfigDialog({ onClose }: { onClose: () => void }) {
  const { apiConfig, setApiConfig, settings, setSettings } = useApp()
  const [localConfig, setLocalConfig] = useState<APIConfig>(
    apiConfig || {
      textToPrompt: {
        provider: 'openai',
        apiKey: '',
        endpoint: 'https://api.openai.com/v1',
        model: 'gpt-4'
      },
      imageGeneration: {
        provider: 'stable-diffusion',
        apiKey: '',
        endpoint: 'http://localhost:7860',
        model: 'sd_xl_base_1.0'
      },
      textToSpeech: {
        provider: 'openai',
        apiKey: '',
        endpoint: 'https://api.openai.com/v1',
        model: 'tts-1',
        voice: 'alloy',
        speed: 1,
        pitch: 1,
        volume: 1
      }
    }
  )

  const handleSave = () => {
    setApiConfig(localConfig)
    localStorage.setItem('apiConfig', JSON.stringify(localConfig))
    onClose()
  }

  return (
    <Dialog.Root defaultOpen onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-bold">API 配置</Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">文本到提示词 API</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="text-provider">提供商</Label>
                  <select
                    id="text-provider"
                    className="w-full p-2 border rounded-md"
                    value={localConfig.textToPrompt.provider}
                    onChange={(e) =>
                      setLocalConfig({
                        ...localConfig,
                        textToPrompt: {
                          ...localConfig.textToPrompt,
                          provider: e.target.value as any
                        }
                      })
                    }
                  >
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="custom">自定义</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="text-api-key">API 密钥</Label>
                  <Input
                    id="text-api-key"
                    type="password"
                    value={localConfig.textToPrompt.apiKey}
                    onChange={(e) =>
                      setLocalConfig({
                        ...localConfig,
                        textToPrompt: {
                          ...localConfig.textToPrompt,
                          apiKey: e.target.value
                        }
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="text-endpoint">API 端点</Label>
                  <Input
                    id="text-endpoint"
                    value={localConfig.textToPrompt.endpoint}
                    onChange={(e) =>
                      setLocalConfig({
                        ...localConfig,
                        textToPrompt: {
                          ...localConfig.textToPrompt,
                          endpoint: e.target.value
                        }
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="text-model">模型</Label>
                  <Input
                    id="text-model"
                    value={localConfig.textToPrompt.model}
                    onChange={(e) =>
                      setLocalConfig({
                        ...localConfig,
                        textToPrompt: {
                          ...localConfig.textToPrompt,
                          model: e.target.value
                        }
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">图片生成 API</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="img-provider">提供商</Label>
                  <select
                    id="img-provider"
                    className="w-full p-2 border rounded-md"
                    value={localConfig.imageGeneration.provider}
                    onChange={(e) =>
                      setLocalConfig({
                        ...localConfig,
                        imageGeneration: {
                          ...localConfig.imageGeneration,
                          provider: e.target.value as any
                        }
                      })
                    }
                  >
                    <option value="stable-diffusion">Stable Diffusion</option>
                    <option value="midjourney">Midjourney</option>
                    <option value="custom">自定义</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="img-api-key">API 密钥</Label>
                  <Input
                    id="img-api-key"
                    type="password"
                    value={localConfig.imageGeneration.apiKey}
                    onChange={(e) =>
                      setLocalConfig({
                        ...localConfig,
                        imageGeneration: {
                          ...localConfig.imageGeneration,
                          apiKey: e.target.value
                        }
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="img-endpoint">API 端点</Label>
                  <Input
                    id="img-endpoint"
                    value={localConfig.imageGeneration.endpoint}
                    onChange={(e) =>
                      setLocalConfig({
                        ...localConfig,
                        imageGeneration: {
                          ...localConfig.imageGeneration,
                          endpoint: e.target.value
                        }
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="img-model">模型</Label>
                  <Input
                    id="img-model"
                    value={localConfig.imageGeneration.model}
                    onChange={(e) =>
                      setLocalConfig({
                        ...localConfig,
                        imageGeneration: {
                          ...localConfig.imageGeneration,
                          model: e.target.value
                        }
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">文本转语音 API</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tts-provider">提供商</Label>
                  <select
                    id="tts-provider"
                    className="w-full p-2 border rounded-md"
                    value={localConfig.textToSpeech.provider}
                    onChange={(e) =>
                      setLocalConfig({
                        ...localConfig,
                        textToSpeech: {
                          ...localConfig.textToSpeech,
                          provider: e.target.value as any
                        }
                      })
                    }
                  >
                    <option value="openai">OpenAI</option>
                    <option value="azure">Azure</option>
                    <option value="google">Google</option>
                    <option value="elevenlabs">ElevenLabs</option>
                    <option value="custom">自定义</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tts-api-key">API 密钥</Label>
                  <Input
                    id="tts-api-key"
                    type="password"
                    value={localConfig.textToSpeech.apiKey}
                    onChange={(e) =>
                      setLocalConfig({
                        ...localConfig,
                        textToSpeech: {
                          ...localConfig.textToSpeech,
                          apiKey: e.target.value
                        }
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tts-endpoint">API 端点</Label>
                  <Input
                    id="tts-endpoint"
                    value={localConfig.textToSpeech.endpoint}
                    onChange={(e) =>
                      setLocalConfig({
                        ...localConfig,
                        textToSpeech: {
                          ...localConfig.textToSpeech,
                          endpoint: e.target.value
                        }
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tts-voice">语音</Label>
                  <Input
                    id="tts-voice"
                    value={localConfig.textToSpeech.voice}
                    onChange={(e) =>
                      setLocalConfig({
                        ...localConfig,
                        textToSpeech: {
                          ...localConfig.textToSpeech,
                          voice: e.target.value
                        }
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tts-speed">语速</Label>
                  <Input
                    id="tts-speed"
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="2"
                    value={localConfig.textToSpeech.speed}
                    onChange={(e) =>
                      setLocalConfig({
                        ...localConfig,
                        textToSpeech: {
                          ...localConfig.textToSpeech,
                          speed: parseFloat(e.target.value)
                        }
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button onClick={handleSave}>保存配置</Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
