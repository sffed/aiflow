import { AppProvider } from './store/AppContext'
import { MainLayout } from './components/MainLayout'
import './index.css'

function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  )
}

export default App
