import { Github } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="flex items-center justify-between px-4 py-3 text-xs text-muted-foreground border-t">
      <div className="flex items-center gap-1">
        <span>© {currentYear} CodeShare. All rights reserved.</span>
      </div>
      <a
        href="https://github.com/sene03/codeshare"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <Github className="w-4 h-4" />
        <span>GitHub</span>
      </a>
    </footer>
  );
}
