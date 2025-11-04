import './App.css'
import { Route, Routes } from 'react-router-dom'
import RegisterScreen from './pages/RegisterScreen'
import ReportGenerator from './pages/ReportGenerator'
import MainLayout from './layout/MainLayout'
import { MainContextApp } from './contexts/MainContext'
import LoginScreen from './pages/LoginScreen'
import BitrixIntegration from './pages/BitrixIntegration'
import BitrixHistory from './pages/BitrixHistory'
import ReportHistory from './pages/ReportHistory'

function App() {

  return (
    <>
      <MainContextApp>
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
          <Route element={<MainLayout />}>
            <Route path="/" element={<ReportGenerator />} />
            <Route path="/bitrix/history" element={<BitrixHistory />} />
            <Route path="/bitrix/send" element={<BitrixIntegration />} />
            <Route path="/reports/generate" element={<ReportGenerator />} />
            <Route path="/reports/history" element={<ReportHistory />} />
          </Route>
        </Routes>

      </MainContextApp>
    </>
  )
}

export default App
