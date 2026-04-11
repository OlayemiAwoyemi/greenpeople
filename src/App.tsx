import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Updates from "./pages/Updates.tsx";
import UpdatePost from "./pages/UpdatePost.tsx";
import NotFound from "./pages/NotFound.tsx";

const Write = lazy(() => import("./pages/Write.tsx"));
const Chats = lazy(() => import("./pages/Chats.tsx"));
const Members = lazy(() => import("./pages/Members.tsx"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/updates" element={<Updates />} />
            <Route path="/write" element={<Write />} />
            <Route path="/chats" element={<Chats />} />
            <Route path="/members" element={<Members />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
