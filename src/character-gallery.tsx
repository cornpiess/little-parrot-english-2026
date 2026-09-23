import { createRoot } from 'react-dom/client';
import CharacterSvgGallery from './pages/CharacterSvgGallery';
import './index.css';
import './character-gallery.css';

createRoot(document.getElementById('root')!).render(<CharacterSvgGallery />);
