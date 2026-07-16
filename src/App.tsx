import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LearningProvider } from "@/contexts/LearningContext";
import ErrorBoundary from "./ErrorBoundary";
import Onboarding from "./pages/Onboarding";
import InitialAssessment from "./pages/InitialAssessment";
import NotFound from "./pages/NotFound";
import HomePage from "./components/HomePage";
import HomePageV2 from "./components/HomePageV2";
import HomePageV3 from "./components/HomePageV3";
import HomePageV4 from "./components/HomePageV4";
import AITeacherMode from "./components/AITeacherMode";
import PaintingPage from "./components/PaintingPage";
import PlayTogetherPage from "./components/PlayTogetherPage";
import CharacterSelect from "./pages/CharacterSelect";
import CardActivation from "./pages/CardActivation";
import ShopPage from "./pages/ShopPage";
import LessonFlow from "./pages/lessons/LessonFlow";
import AdventureLesson from "./pages/lessons/AdventureLesson";
import WhyPage from "./pages/WhyPage";
import ShippingAddress from "./pages/ShippingAddress";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LearningProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* 主路由 - 使用 HomePageV3 */}
            <Route path="/" element={<HomePageV3 />} />

            {/* 对比测试路由 - 保留 V1/V2/V4 用于开发对比 */}
            <Route path="/home" element={<HomePage />} />
            <Route path="/home-v2" element={<HomePageV2 />} />
            <Route path="/home-v3" element={<HomePageV3 />} />
            <Route path="/home-v4" element={<HomePageV4 />} />

            {/* 其他页面 */}
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/initial-assessment" element={<InitialAssessment />} />
            <Route path="/ai-parrot" element={<AITeacherMode />} />
            <Route path="/characters" element={<CharacterSelect />} />
            <Route path="/activate" element={<CardActivation />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/painting" element={<PaintingPage />} />
            <Route path="/play-together" element={<PlayTogetherPage />} />
            <Route path="/lessons" element={<LessonFlow />} />
            <Route path="/adventure" element={<AdventureLesson />} />
            <Route path="/why" element={<WhyPage />} />
            <Route path="/shipping-address" element={<ShippingAddress />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </LearningProvider>
    </TooltipProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
