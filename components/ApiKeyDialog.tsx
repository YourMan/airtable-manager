/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { KeyRound } from 'lucide-react';

interface ApiKeyDialogProps {
  onContinue: () => void;
}

const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({ onContinue }) => {
  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/80 flex items-center justify-center z-[200] p-4 animate-fade-in backdrop-blur-sm">
      <div className="glass-panel bg-white/95 dark:bg-zinc-900/95 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center flex flex-col items-center">
        <div className="bg-brand-500/20 p-4 rounded-full mb-6">
          <KeyRound className="w-12 h-12 text-brand-600 dark:text-brand-400" />
        </div>
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">Paid API Key Required</h2>
        <p className="text-zinc-600 dark:text-zinc-300 mb-6">
          This application uses premium AI models.
          <br/>
          You must select a <strong>Paid Google Cloud Project</strong> API key to proceed.
        </p>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8 text-sm">
          Free tier keys will not work. For more information, see{' '}
          <a
            href="https://ai.google.dev/gemini-api/docs/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-600 dark:text-brand-400 hover:underline font-medium"
          >
            Billing Documentation
          </a>.
        </p>
        <button
          onClick={onContinue}
          className="w-full px-6 py-3 bg-brand-500 hover:bg-brand-400 text-black font-semibold rounded-lg transition-colors text-lg shadow-lg shadow-brand-500/20"
        >
          Select Paid API Key
        </button>
      </div>
    </div>
  );
};

export default ApiKeyDialog;