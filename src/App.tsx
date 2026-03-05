import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { ToastProvider } from './contexts/ToastContext'
import { LanguageProvider } from './contexts/LanguageContext'
import Layout from './components/Layout'
import FormLayout from './components/FormLayout'
import MainPage from './pages/MainPage'
import ClientsPage from './pages/ClientsPage'
import CompliancePage from './pages/CompliancePage'
import SuitabilityFormFill from './pages/SuitabilityFormFill'
import RegistrationFormFill from './pages/RegistrationFormFill'

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
        <Routes>
          <Route path="/registration/fill/:formType" element={<FormLayout><RegistrationFormFill /></FormLayout>} />
          <Route path="/suitability/fill/:formId" element={<FormLayout><SuitabilityFormFill /></FormLayout>} />
          <Route path="/" element={<Layout />}>
            <Route index element={<MainPage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="compliance" element={<CompliancePage />} />
          </Route>
        </Routes>
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App
