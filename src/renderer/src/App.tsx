import './App.css'
import { I18nProvider } from './i18n'
import { Dashboard } from './components/Dashboard'
import { UpdaterModal } from './components/UpdaterModal'

function App(): React.JSX.Element {
  return (
    <I18nProvider>
      <UpdaterModal />
      <Dashboard />
    </I18nProvider>
  )
}

export default App
