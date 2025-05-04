import Game from './components/Game'
import './App.css'

function App() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#1a1a1a'
    }}>
      <Game />
    </div>
  )
}

export default App
