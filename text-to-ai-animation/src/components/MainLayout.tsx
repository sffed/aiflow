import React, { useState } from 'react'
import { Sidebar } from './Sidebar'
import { MainContent } from './MainContent'
import { APIConfigDialog } from './APIConfigDialog'

export function MainLayout() {
  const [showAPIConfig, setShowAPIConfig] = useState(false)

  return (
    <div className="flex h-screen bg-background">
      <Sidebar onOpenAPIConfig={() => setShowAPIConfig(true)} />
      <MainContent />
      {showAPIConfig && (
        <APIConfigDialog onClose={() => setShowAPIConfig(false)} isOpen={showAPIConfig} />
      )}
    </div>
  )
}
