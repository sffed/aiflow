import React, { useState } from 'react'
import { TextInputPanel } from './TextInputPanel'
import { SegmentList } from './SegmentList'
import { Timeline } from './Timeline'
import { ProjectDialog } from './ProjectDialog'
import { Button } from './ui/button'
import { Plus } from 'lucide-react'
import { useApp } from '@/store/AppContext'

export function MainContent() {
  const { project, segments } = useApp()
  const [showTextInput, setShowTextInput] = useState(false)
  const [showProjectDialog, setShowProjectDialog] = useState(false)

  return (
    <>
      {!project ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">欢迎使用 AI 动画生成工具</h2>
            <p className="text-muted-foreground">
              开始创建您的第一个动画项目
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => setShowTextInput(true)}>
                <Plus className="mr-2 h-4 w-4" />
                创建新项目
              </Button>
              <Button variant="outline" onClick={() => setShowProjectDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                打开已有项目
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold">{project.name}</h2>
                <Button onClick={() => setShowTextInput(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  添加文本段落
                </Button>
              </div>

              <SegmentList />
            </div>
          </div>

          <Timeline />
        </main>
      )}

      {showTextInput && (
        <TextInputPanel onClose={() => setShowTextInput(false)} isOpen={showTextInput} />
      )}

      {showProjectDialog && (
        <ProjectDialog onClose={() => setShowProjectDialog(false)} isOpen={showProjectDialog} />
      )}
    </>
  )
}
