import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Link as LinkIcon, MessageSquare } from "lucide-react";

type Message = {
  role: "assistant" | "user";
  content: string;
};

const INITIAL_MESSAGE = "Greetings. I am Marcus AI. I govern the Orakzai Sovereign Grid. How can I assist your wealth strategy today?";

export function MarcusAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowBubble(true), 1500);
    const hideTimer = setTimeout(() => setShowBubble(false), 13500);
    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      handleInitialMessage();
    }
  }, [isOpen]);

  const handleInitialMessage = async () => {
    setIsTyping(true);
    setMessages([]);
    await typeMessage(INITIAL_MESSAGE);
  };

  const typeMessage = async (text: string) => {
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
    const words = text.split(" ");
    let currentText = "";
    
    for (let i = 0; i < words.length; i++) {
      currentText += (i === 0 ? "" : " ") + words[i];
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: currentText }
      ]);
      await new Promise(r => setTimeout(r, 40));
    }
    setIsTyping(false);
  };

  const handleSend = async (text: string = inputValue) => {
    if (!text.trim() || isTyping) return;
    
    setInputValue("");
    setMessages(prev => [...prev, { role: "user", content: text }]);
    setShowBubble(false);
    
    setIsTyping(true);
    await new Promise(r => setTimeout(r, 500));
    
    await typeMessage("This is a complex query best handled by the Chairman's desk directly. Please continue via WhatsApp for a personalized response.");
  };

  const handleSmartOption = async (option: number) => {
    if (isTyping) return;
    let userMsg = "";
    let response = "";

    switch (option) {
      case 1:
        userMsg = "Verify $OKBOND Security";
        response = "$OKBOND operates under a Capital-Protected mandate. The principal is fully reserved against tokenized real-world assets, including sovereign-grade real estate, gold reserves, and audited revenue-generating subsidiaries from the Orakzai 12-company portfolio. The RWA backing is independently audited and on-chain verifiable.";
        break;
      case 2:
        userMsg = "Guide me to Buy";
        response = "Step 1: Connect a Web3 wallet (MetaMask/Trust Wallet). Step 2: Acquire USDT/USDC. Step 3: Visit the official ICO portal. Step 4: Complete KYC if required. Step 5: Confirm allocation to receive $OKBOND directly to your wallet. For personalized onboarding, the Chairman's desk is reachable via WhatsApp.";
        break;
      case 3:
        userMsg = "Explain the 2100 Vision";
        response = "Orakzai Group is building a 12-company sovereign empire spanning real estate, energy, finance, agriculture, logistics, hospitality, technology, healthcare, education, media, defense-tech, and sovereign-grade RWA tokenization. This culminates in a self-sustaining economic grid by the year 2100, built from a zero-to-hero founding story into a multi-vertical institutional powerhouse.";
        break;
    }

    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setShowBubble(false);
    setIsTyping(true);
    await new Promise(r => setTimeout(r, 500));
    await typeMessage(response);
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && showBubble && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed bottom-32 right-8 z-50 max-w-[280px] bg-card/90 backdrop-blur-md border border-primary/30 p-4 shadow-2xl rounded-tr-none"
          >
            <button 
              onClick={() => setShowBubble(false)}
              className="absolute top-2 right-2 text-muted-foreground hover:text-primary"
            >
              <X size={14} />
            </button>
            <p className="text-sm font-mono text-primary/90 leading-relaxed pr-4">
              {INITIAL_MESSAGE}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className="fixed bottom-8 right-8 z-50 w-16 h-16 rounded-full bg-background border border-primary flex items-center justify-center cursor-pointer group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        data-testid="btn-marcus-orb"
      >
        <div className="absolute inset-0 rounded-full border border-secondary opacity-50 animate-ping" />
        <div className="absolute inset-2 rounded-full bg-primary/20 blur-md group-hover:bg-secondary/30 transition-colors" />
        <div className="w-8 h-8 rounded-full bg-primary relative z-10 shadow-[0_0_15px_rgba(212,175,55,0.5)] group-hover:bg-secondary group-hover:shadow-[0_0_20px_rgba(0,229,255,0.6)] transition-all duration-500" />
        <span className="absolute -bottom-6 text-[10px] font-mono text-primary/70 tracking-widest whitespace-nowrap">MARCUS v9.0</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-0 md:bottom-28 md:right-8 z-50 w-full md:w-[400px] h-[85vh] md:h-[600px] bg-card/95 backdrop-blur-xl border border-primary/30 shadow-2xl flex flex-col"
          >
            <div className="p-4 border-b border-primary/20 flex items-center justify-between bg-background/50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span className="text-xs font-mono text-primary tracking-widest">MARCUS v9.0 · SOVEREIGN GRID CONCIERGE</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="btn-marcus-close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div 
                    className={`max-w-[85%] p-3 text-sm font-mono leading-relaxed ${
                      msg.role === "user" 
                        ? "bg-secondary/10 border border-secondary text-secondary-foreground" 
                        : "bg-primary/5 border border-primary/30 text-card-foreground"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <span dangerouslySetInnerHtml={{ 
                        __html: msg.content.replace(/(\$OKBOND|Capital-Protected|12-company)/g, '<span class="text-secondary font-bold">$1</span>')
                      }} />
                    ) : (
                      msg.content
                    )}
                  </div>
                  {msg.role === "assistant" && i > 0 && !isTyping && i === messages.length - 1 && (
                    <a 
                      href="https://wa.me/923367970004?text=I%20have%20a%20question%20about%20%24OKBOND"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 border border-secondary/50 text-secondary hover:bg-secondary/10 text-xs font-mono transition-colors"
                    >
                      <LinkIcon size={12} />
                      Connect to Chairman via WhatsApp
                    </a>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-primary/20 bg-background/50 space-y-3">
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => handleSmartOption(1)}
                  className="w-full text-left px-3 py-2 border border-primary/20 hover:border-primary text-xs font-mono text-primary/80 hover:text-primary transition-colors"
                  data-testid="btn-smart-opt-1"
                >
                  Verify $OKBOND Security
                </button>
                <button 
                  onClick={() => handleSmartOption(2)}
                  className="w-full text-left px-3 py-2 border border-primary/20 hover:border-primary text-xs font-mono text-primary/80 hover:text-primary transition-colors"
                  data-testid="btn-smart-opt-2"
                >
                  Guide me to Buy
                </button>
                <button 
                  onClick={() => handleSmartOption(3)}
                  className="w-full text-left px-3 py-2 border border-primary/20 hover:border-primary text-xs font-mono text-primary/80 hover:text-primary transition-colors"
                  data-testid="btn-smart-opt-3"
                >
                  Explain the 2100 Vision
                </button>
              </div>

              <div className="flex gap-2 pt-2">
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSend()}
                  placeholder="Query Marcus AI..."
                  className="flex-1 bg-transparent border-b border-primary/30 focus:border-primary px-2 py-1 text-sm font-mono outline-none text-foreground placeholder:text-muted-foreground"
                  data-testid="input-marcus"
                />
                <button 
                  onClick={() => handleSend()}
                  disabled={isTyping || !inputValue.trim()}
                  className="text-primary hover:text-secondary disabled:opacity-50 transition-colors"
                  data-testid="btn-marcus-send"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
