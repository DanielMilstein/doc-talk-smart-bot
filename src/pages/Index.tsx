
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index: React.FC = () => {
  const navigate = useNavigate();
  
  const goToChat = () => {
    navigate("/chat");
  };
  
  const goToAdmin = () => {
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col">
      <header className="bg-background border-b py-4 px-6">
        <div className="container flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">
          <span className="text-primary">ChatAdmisión</span>
          </h1>
        </div>
      </header>
      
      <main className="container flex-grow py-6">
        <div className="flex flex-col items-center justify-center space-y-8 h-[70vh]">
          <h2 className="text-3xl font-bold">Bienvenido a ChatAdmisión</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Pregunta tus dudas sobre el proceso de admisión y obtén respuestas rápidas y precisas.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" onClick={goToChat}>
              Empezar chat
            </Button>
            <Button size="lg" variant="outline" onClick={goToAdmin}>
              Panel de administración
            </Button>
          </div>
        </div>
      </main>
      
      <footer className="bg-background border-t py-4 px-6 text-center text-sm text-muted-foreground">
        <div className="container">
          Inicio
        </div>
      </footer>
    </div>
  );
};

export default Index;
