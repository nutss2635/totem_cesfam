import { Routes, Route } from 'react-router-dom';
import Totem from './pages/Totem.jsx';
import PantallaSala from './pages/PantallaSala.jsx';
import PanelFuncionario from './pages/PanelFuncionario.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Totem />} />
      <Route path="/sala" element={<PantallaSala />} />
      <Route path="/panel" element={<PanelFuncionario />} />
    </Routes>
  );
}

export default App;
