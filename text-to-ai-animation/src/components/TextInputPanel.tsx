import React, { useState, useRef } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { X, Upload, FileText } from 'lucide-react'
import { useApp } from '@/store/AppContext'
import { TextSegment } from '@/types'

export function TextInputPanel({ onClose }: { onClose: () => void }) {
  const { addSegments, setProject } = useApp()
  const [text, setText] = useState('')
  const [fileName, setFileName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFileName(file.name)
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setText(content)
      }
      reader.readAsText(file)
    }
  }

  const handleCreateProject = () => {
    if (!text.trim()) return

    const lines = text.split('\n').filter(line => line.trim())

    const segments: TextSegment[] = lines.map((line, index) => ({
      id: `segment_${Date.now()}_${index}`,
      text: line.trim(),
      generatedImages: [],
      duration: 3
    }))

    const newProject = {
      id: `project_${Date.now()}`,
      name: fileName || `新项目 ${new Date().toLocaleDateString()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      segments: [],
      settings: {
        imageWidth: 1024,
        imageHeight: 768,
        imageCount: 4,
        useImageToImage: true,
        imageToImageStrength: 0.5,
        enableSubtitles: true,
        defaultSubtitleStyle: {
          fontSize: 24,
          color: '#ffffff',
          position: 'bottom'
        }
      },
      apiConfig: {}
    }

    setProject(newProject)
    addSegments(segments)
    onClose()
  }

  return (
    <Dialog.Root defaultOpen onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background rounded-lg shadow-lg w-full max-w-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-bold">添加文本段落</Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  导入文件
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.docx"
                  onChange={handleFileImport}
                  className="hidden"
                />
                <span className="text-sm text-muted-foreground self-center">
                  支持 .txt, .md, .docx 文件
                </span>
              </div>

              {fileName && (
                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">{fileName}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="text-input">或手动输入文本</Label>
                <textarea
                  id="text-input"
                  className="w-full h-64 p-3 border border-input rounded-md resize-none"
                  placeholder="在此输入或粘贴您的文本内容，每段文本将生成一个动画段落..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </div>

              {text && (
                <div className="text-sm text-muted-foreground">
                  将生成 {text.split('\n').filter(line => line.trim()).length} 个段落
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                取消
              </Button>
              <Button onClick={handleCreateProject} disabled={!text.trim()}>
                创建项目
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
