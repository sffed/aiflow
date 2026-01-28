import React, { useState } from 'react'
import { Button } from './ui/button'
import { Home, Settings, FolderOpen, Save, PlayCircle } from 'lucide-react'
import { useApp } from '@/store/AppContext'
import { AnimationPreview } from './AnimationPreview'
import { ProjectDialog } from './ProjectDialog'

interface SidebarProps {
  onOpenAPIConfig: () => void
}

export function Sidebar({ onOpenAPIConfig }: SidebarProps) {
  const { project, saveProject, segments } = useApp()
  const [showPreview, setShowPreview] = useState(false)
  const [showProjectDialog, setShowProjectDialog] = useState(false)

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-bold">AI Animation Tool</h1>
        <p className="text-sm text-muted-foreground">文本到动画生成工具</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <Button variant="ghost" className="w-full justify-start">
          <Home className="mr-2 h-4 w-4" />
          首页
        </Button>

        {project && (
          <>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setShowPreview(true)}
            >
              <PlayCircle className="mr-2 h-4 w-4" />
              预览动画
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={saveProject}
            >
              <Save className="mr-2 h-4 w-4" />
              保存项目
            </Button>
          </>
        )}

        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => setShowProjectDialog(true)}
        >
          <FolderOpen className="mr-2 h-4 w-4" />
          打开项目
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={onOpenAPIConfig}
        >
          <Settings className="mr-2 h-4 w-4" />
          API 配置
        </Button>
      </nav>

      <div className="p-4 border-t border-border">
        {project ? (
          <div className="text-sm">
            <p className="font-medium">{project.name}</p>
            <p className="text-muted-foreground">
              {project.segments.length} 个段落
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">未打开项目</p>
        )}
      </div>

      {showPreview && (
        <AnimationPreview
          segments={segments}
          onClose={() => setShowPreview(false)}
        />
      )}

      {showProjectDialog && (
        <ProjectDialog onClose={() => setShowProjectDialog(false)} />
      )}
    </aside>
  )
}
