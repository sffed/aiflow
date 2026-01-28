import React, { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { X, Folder, Trash2, Download, Calendar } from 'lucide-react'
import { useApp } from '@/store/AppContext'
import { AnimationProject } from '@/types'

interface ProjectDialogProps {
  onClose: () => void
}

export function ProjectDialog({ onClose }: ProjectDialogProps) {
  const { setProject, loadProject } = useApp()
  const [projects, setProjects] = useState<AnimationProject[]>([])
  const [exportingId, setExportingId] = useState<string | null>(null)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = () => {
    const projectKeys = Object.keys(localStorage).filter(key => key.startsWith('project_'))
    const loadedProjects: AnimationProject[] = []

    projectKeys.forEach(key => {
      try {
        const projectData = localStorage.getItem(key)
        if (projectData) {
          loadedProjects.push(JSON.parse(projectData))
        }
      } catch (error) {
        console.error('Error loading project:', error)
      }
    })

    setProjects(loadedProjects)
  }

  const handleOpenProject = (projectId: string) => {
    loadProject(projectId)
    onClose()
  }

  const handleDeleteProject = (projectId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    if (confirm('确定要删除这个项目吗？')) {
      localStorage.removeItem(`project_${projectId}`)
      loadProjects()
    }
  }

  const handleExportProject = async (project: AnimationProject, event: React.MouseEvent) => {
    event.stopPropagation()
    setExportingId(project.id)

    try {
      const projectData = {
        ...project,
        exportedAt: new Date().toISOString()
      }

      const jsonString = JSON.stringify(projectData, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = `${project.name.replace(/[^a-z0-9]/gi, '_')}_project.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting project:', error)
      alert('导出失败')
    } finally {
      setExportingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Dialog.Root open onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-bold">项目管理</Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Folder className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>还没有保存的项目</p>
              <p className="text-sm mt-2">创建并保存一个项目后，它会显示在这里</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 cursor-pointer transition-colors"
                  onClick={() => handleOpenProject(project.id)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                      <Folder className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{project.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          更新: {formatDate(project.updatedAt)}
                        </span>
                        <span>{project.segments.length} 个段落</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleExportProject(project, e)}
                      disabled={exportingId === project.id}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDeleteProject(project.id, e)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end mt-6">
            <Button onClick={onClose}>关闭</Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
