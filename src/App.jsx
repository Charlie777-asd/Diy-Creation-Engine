import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import HeroPage from './components/HeroPage';
import ThingMakerPage from './components/ThingMakerPage';
import RecipeMakerPage from './components/RecipeMakerPage';
import AIAssistantPage from './components/AIAssistantPage';
import CollectionsPage from './components/CollectionsPage';
import AboutPage from './components/AboutPage';
import MagnificentGlass from './components/MagnificentGlass';
import StatusBanner from './components/StatusBanner';
import ToastContainer from './components/Toast';
import { aiService } from './services/aiService';

export default function App() {
  const location = useLocation();
  const [ollamaStatus, setOllamaStatus] = useState('checking');
  const [modelsList, setModelsList] = useState([]);
  const [selectedModel, setSelectedModel] = useState(aiService.selectedModel);
  const [showStatusBanner, setShowStatusBanner] = useState(false);

  useEffect(() => {
    const checkOllama = async () => {
      setOllamaStatus('checking');
      const res = await aiService.checkOllamaStatus();
      if (res.isConnected) {
        setOllamaStatus('connected');
        setModelsList(res.models);
        setSelectedModel(res.selectedModel);
      } else {
        setOllamaStatus('offline');
        setModelsList([]);
      }
    };
    checkOllama();
    const timer = setTimeout(() => setShowStatusBanner(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleModelChange = (newModel) => {
    aiService.setSelectedModel(newModel);
    setSelectedModel(newModel);
  };

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-[#0e0a06] flex flex-col">
        {location.pathname !== '/' && (
          <Navbar
            ollamaStatus={ollamaStatus}
            modelsList={modelsList}
            selectedModel={selectedModel}
            onModelChange={handleModelChange}
          />
        )}
        <main className="flex-1 flex flex-col min-h-0">
          <Routes>
            <Route path="/" element={<HeroPage />} />
            <Route path="/thing-maker" element={<ThingMakerPage />} />
            <Route path="/recipe-maker" element={<RecipeMakerPage />} />
            <Route path="/ai-assistant" element={<AIAssistantPage />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      <MagnificentGlass />
      <StatusBanner
        ollamaStatus={ollamaStatus}
        show={showStatusBanner}
        onDismiss={() => setShowStatusBanner(false)}
      />
    </>
  );
}
