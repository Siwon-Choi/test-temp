import { Route, Routes } from 'react-router'
import styles from './App.module.css'
import Footer from './components/Footer/Footer'
import Header from './components/Header/Header'
import Home from './components/Home/Home'
import Others from './components/Others/Others'
import Projects from './components/Projects/Projects'
import Skills from './components/Skills/Skills'
import ProjectDetail from './components/ProjectDetail/ProjectDetail'

function MainPage() {
  return (
    <div className={styles.app}>
      <Header />
      <main>
        <section id="home" className={styles.homeSection}><Home /></section>
        <section id="skills"><Skills /></section>
        <section id="projects"><Projects /></section>
        <section id="others"><Others /></section>
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/projects/:slug" element={<ProjectDetail />} />
    </Routes>
  )
}
export default App
