import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Soundboard from "@/pages/soundboard";
import Upload from "@/pages/upload";
import Database from "@/pages/database";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Soundboard} />
      <Route path="/upload" component={Upload} />
      <Route path="/database" component={Database} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
