import React, { useState } from 'react'
import { useApp } from '@/store/AppContext'
import { Play, Pause, SkipBack, SkipForward, Download } from 'lucide-react'
import { Button } from './ui/button'
import { VideoExportDialog } from './VideoExportDialog'

export function Timeline() {
  const { segments } = useApp()
  const totalDuration = segments.reduce((sum, seg) => sum + seg.duration, 0)
  const [showExportDialog, setShowExportDialog] = useState(false)

  return (
    <div className="bg-card border-t border-border p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button size="icon">
              <Play className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <SkipForward className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground ml-4">
              总时长: {Math.floor(totalDuration / 60)}:{(totalDuration % 60).toFixed(0).padStart(2, '0')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowExportDialog(true)}>
              <Download className="mr-2 h-4 w-4" />
              导出视频
            </Button>
          </div>
        </div>

        <div className="relative h-24 bg-muted rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center px-2">
            {segments.map((segment, index) => {
              const width = (segment.duration / totalDuration) * 100
              return (
                <div
                  key={segment.id}
                  className="h-20 border-r border-border/50 bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer"
                  style={{ width: `${width}%` }}
                  title={segment.text}
                >
                  <div className="p-2 h-full flex flex-col justify-center">
                    <span className="text-xs font-medium truncate">
                      段落 {index + 1}
                    </span>
                    {segment.selectedImageIndex !== undefined && (
                      <div className="mt-1 w-4 h-4 bg-primary rounded-full" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary/10 border border-primary rounded" />
            <span>已完成</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-muted rounded" />
            <span>未完成</span>
          </div>
        </div>
      </div>

      {showExportDialog && (
        <VideoExportDialog
          segments={segments}
          isOpen={showExportDialog}
          onClose={() => setShowExportDialog(false)}
        />
      )}
    </div>
  )
}
