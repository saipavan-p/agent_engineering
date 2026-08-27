import React, { useState } from 'react';
import { RefreshCw, Feather } from 'lucide-react';

const CALM_QUOTES = [
  { text: "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.", author: "Buddha" },
  { text: "Simplicity is about subtracting the obvious and adding the meaningful.", author: "John Maeda" },
  { text: "It is not that we have a short time to live, but that we waste a lot of it.", author: "Seneca" },
  { text: "Flow is being completely involved in an activity for its own sake. The ego falls away.", author: "Mihaly Csikszentmihalyi" },
  { text: "Almost everything will work again if you unplug it for a few minutes, including you.", author: "Anne Lamott" },
  { text: "You have power over your mind - not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius" },
  { text: "Deep work is the ability to focus without distraction on a cognitively demanding task.", author: "Cal Newport" },
  { text: "Nature does not hurry, yet everything is accomplished.", author: "Lao Tzu" },
  { text: "Peace comes from within. Do not seek it without.", author: "Buddha" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
];

export const QuoteBanner: React.FC = () => {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * CALM_QUOTES.length));
  const [fade, setFade] = useState(true);

  const nextQuote = () => {
    setFade(false);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % CALM_QUOTES.length);
      setFade(true);
    }, 200);
  };

  const current = CALM_QUOTES[index];

  return (
    <div className="w-full max-w-xl mx-auto my-6 px-4 text-center">
      <div className="inline-flex items-center gap-2 p-3 sm:px-5 sm:py-2.5 rounded-full bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md shadow-xs group">
        <Feather className="w-3.5 h-3.5 text-sage-600 dark:text-sage-400 shrink-0 opacity-70" />
        
        <p className={`text-xs text-slate-600 dark:text-slate-300 italic transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'}`}>
          "{current.text}" <span className="not-italic text-slate-400 font-medium">— {current.author}</span>
        </p>

        <button
          onClick={nextQuote}
          className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 opacity-60 group-hover:opacity-100 transition-opacity"
          title="New mindful thought"
        >
          <RefreshCw className="w-3 h-3 hover:rotate-180 transition-transform duration-300" />
        </button>
      </div>
    </div>
  );
};
