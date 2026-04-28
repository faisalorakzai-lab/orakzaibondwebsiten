import { ReactNode } from "react";
import { Link } from "wouter";

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="text-xl font-serif font-bold text-primary tracking-widest flex items-center gap-2">
          $OKBOND
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <NavLink href="/about">ABOUT</NavLink>
          <NavLink href="/bond">THE BOND</NavLink>
          <NavLink href="/vision">2100 VISION</NavLink>
          <NavLink href="/whitepaper">WHITEPAPER</NavLink>
        </div>
        <div>
          <a 
            href="https://wa.me/923367970004?text=I%20am%20interested%20in%20Orakzai%20Bond" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-6 py-2 border border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground transition-colors uppercase text-sm tracking-widest font-mono"
            data-testid="btn-connect"
          >
            Connect
          </a>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link 
      href={href} 
      className="text-sm uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
    >
      {children}
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-primary/20 bg-background/90 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-2xl font-serif text-primary mb-2">ORAKZAI BOND</h2>
          <p className="text-muted-foreground text-sm tracking-widest uppercase mb-4">Capital-Protected · RWA-Backed · Sovereign-Grade</p>
          <p className="text-xs text-muted-foreground/50 font-mono">Contract: 0xOKBOND... (Placeholder)</p>
          <p className="text-xs text-muted-foreground/50 font-mono mt-1">© {new Date().getFullYear()} Orakzai Group. All rights reserved.</p>
        </div>
        <div className="md:text-right">
          <a 
            href="https://wa.me/923367970004" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block px-8 py-3 bg-primary/10 border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors font-mono text-sm tracking-widest"
            data-testid="link-footer-whatsapp"
          >
            CHAIRMAN'S DESK
          </a>
        </div>
      </div>
    </footer>
  );
}
