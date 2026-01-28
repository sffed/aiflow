import React, { createContext, useContext, useState, useEffect } from 'react'
import { AnimationProject, TextSegment, APIConfig, ProjectSettings } from '@/types'

interface AppContextType {
  project: AnimationProject | null
  segments: TextSegment[]
  apiConfig: APIConfig | null
  settings: ProjectSettings | null
  setProject: (project: AnimationProject | null) => void
  addSegments: (segments: TextSegment[]) => void
  updateSegment: (id: string, updates: Partial<TextSegment>) => void
  setApiConfig: (config: APIConfig) => void
  setSettings: (settings: ProjectSettings) => void
  saveProject: () => void
  loadProject: (projectId: string) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const defaultSettings: ProjectSettings = {
  imageWidth: 1024,
  imageHeight: 768,
  imageCount: 4,
  useImageToImage: true,
  imageToImageStrength: 0.5,
  enableSubtitles: true,
  defaultSubtitleStyle: {
    fontSize: 24,
    color: '#ffffff',
    position: 'bottom',
    background: true
  }
}

const defaultApiConfig: APIConfig = {
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

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [project, setProjectState] = useState<AnimationProject | null>(null)
  const [segments, setSegments] = useState<TextSegment[]>([])
  const [apiConfig, setApiConfig] = useState<APIConfig | null>(null)
  const [settings, setSettings] = useState<ProjectSettings | null>(null)

  useEffect(() => {
    const savedApiConfig = localStorage.getItem('apiConfig')
    const savedSettings = localStorage.getItem('settings')

    if (savedApiConfig) {
      setApiConfig(JSON.parse(savedApiConfig))
    } else {
      setApiConfig(defaultApiConfig)
    }

    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    } else {
      setSettings(defaultSettings)
    }
  }, [])

  const setProject = (project: AnimationProject | null) => {
    setProjectState(project)
    if (project) {
      setSegments(project.segments)
      setSettings(project.settings)
      setApiConfig(project.apiConfig)
    } else {
      setSegments([])
    }
  }

  const addSegments = (newSegments: TextSegment[]) => {
    setSegments(prev => [...prev, ...newSegments])
  }

  const updateSegment = (id: string, updates: Partial<TextSegment>) => {
    setSegments(prev =>
      prev.map(seg =>
        seg.id === id ? { ...seg, ...updates } : seg
      )
    )
  }

  const saveProject = () => {
    if (!project) return

    const updatedProject: AnimationProject = {
      ...project,
      segments,
      settings: settings || defaultSettings,
      apiConfig: apiConfig || defaultApiConfig,
      updatedAt: new Date().toISOString()
    }

    localStorage.setItem(`project_${project.id}`, JSON.stringify(updatedProject))
    setProjectState(updatedProject)
  }

  const loadProject = (projectId: string) => {
    const savedProject = localStorage.getItem(`project_${projectId}`)
    if (savedProject) {
      setProject(JSON.parse(savedProject))
    }
  }

  return (
    <AppContext.Provider
      value={{
        project,
        segments,
        apiConfig,
        settings,
        setProject,
        addSegments,
        updateSegment,
        setApiConfig,
        setSettings,
        saveProject,
        loadProject
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
