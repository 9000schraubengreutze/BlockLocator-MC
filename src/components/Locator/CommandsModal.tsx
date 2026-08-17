import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Shield, Sparkles } from 'lucide-react';
import { MinecraftCommands, MinecraftEdition } from '../../types/locator';

interface CommandsModalProps {
  isOpen: boolean;
  onClose: () => void;
  commands: MinecraftCommands;
  x: number;
  y: number;
  z: number;
  edition: MinecraftEdition;
  onCopy: (text: string, label: string) => void;
}

export const CommandsModal: React.FC<CommandsModalProps> = ({
  isOpen,
  onClose,
  commands,
  x,
  y,
  z,
  edition,
  onCopy,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const commandList = [
    {
      key: 'tpSelf',
      label: 'Teleport Yourself',
      description: 'Teleports your current player to exact location',
      cmd: `/tp @s ${x} ${y} ${z}`,
    },
    {
      key: 'tpPlayer',
      label: 'Teleport Nearest Player',
      description: 'Teleports the nearest player in multiplayer',
      cmd: `/tp @p ${x} ${y} ${z}`,
    },
    {
      key: 'setWorldSpawn',
      label: 'Set World Spawn',
      description: 'Sets the global spawn point of the world to this position',
      cmd: `/setworldspawn ${x} ${y} ${z}`,
    },
    {
      key: 'spawnpoint',
      label: 'Set Personal Spawnpoint',
      description: 'Sets your individual respawn coordinates',
      cmd: `/spawnpoint @s ${x} ${y} ${z}`,
    },
    {
      key: 'camera',
      label: 'Bedrock Camera View',
      description: 'Positions spectator camera overview (Bedrock 1.20+)',
      cmd: `/camera @s set minecraft:free pos ${x} ${y + 15} ${z} rot 45 135`,
    },
  ];

  const handleCopyCmd = (cmd: string, key: string, label: string) => {
    onCopy(cmd, `${label} command copied!`);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Minecraft Console Commands</h3>
              <p className="text-xs text-slate-400">Ready-to-use commands for {edition.toUpperCase()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command list */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {commandList.map((item) => {
            const isCopied = copiedKey === item.key;
            return (
              <div
                key={item.key}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">{item.label}</span>
                  <span className="text-[10px] text-slate-400">{item.description}</span>
                </div>
                <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-emerald-300">
                  <code className="truncate select-all">{item.cmd}</code>
                  <button
                    type="button"
                    onClick={() => handleCopyCmd(item.cmd, item.key, item.label)}
                    className="p-1.5 rounded-md bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white transition-colors shrink-0 flex items-center gap-1 text-[11px] font-sans font-medium"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>In-game: Press <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded font-mono">T</kbd> or <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded font-mono">/</kbd> to paste</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
