import './App.css'
import { I18nProvider } from './i18n'
import { Dashboard } from './components/Dashboard'

function App(): React.JSX.Element {
  return (
    <I18nProvider>
      <Dashboard />
    </I18nProvider>
  )
}

export default App
