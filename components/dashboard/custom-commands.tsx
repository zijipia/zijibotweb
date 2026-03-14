'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface CustomCommand {
  id: string;
  name: string;
  response: string;
  enabled: boolean;
}

interface CustomCommandsProps {
  commands: CustomCommand[];
  onUpdate: (commands: CustomCommand[]) => void;
  disabled?: boolean;
}

export function CustomCommands({
  commands,
  onUpdate,
  disabled = false,
}: CustomCommandsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCommand, setNewCommand] = useState({ name: '', response: '' });

  const handleAdd = () => {
    if (!newCommand.name || !newCommand.response) return;

    const command: CustomCommand = {
      id: Math.random().toString(36).substr(2, 9),
      name: newCommand.name,
      response: newCommand.response,
      enabled: true,
    };

    onUpdate([...commands, command]);
    setNewCommand({ name: '', response: '' });
  };

  const handleDelete = (id: string) => {
    onUpdate(commands.filter((cmd) => cmd.id !== id));
  };

  const handleToggle = (id: string) => {
    onUpdate(
      commands.map((cmd) =>
        cmd.id === id ? { ...cmd, enabled: !cmd.enabled } : cmd
      )
    );
  };

  return (
    <Card className="border-slate-700 bg-slate-800 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Custom Commands
      </h3>

      {/* Add Command Form */}
      <div className="mb-6 p-4 rounded-lg bg-slate-700/50 border border-slate-600">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <Input
            placeholder="Command name"
            value={newCommand.name}
            onChange={(e) =>
              setNewCommand({ ...newCommand, name: e.target.value })
            }
            disabled={disabled}
            className="bg-slate-700 border-slate-600 text-white"
          />
          <Input
            placeholder="Response"
            value={newCommand.response}
            onChange={(e) =>
              setNewCommand({ ...newCommand, response: e.target.value })
            }
            disabled={disabled}
            className="bg-slate-700 border-slate-600 text-white md:col-span-2"
          />
        </div>
        <Button
          onClick={handleAdd}
          disabled={disabled || !newCommand.name || !newCommand.response}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          Add Command
        </Button>
      </div>

      {/* Commands List */}
      {commands.length === 0 ? (
        <p className="text-slate-400 text-center py-8">
          No custom commands yet. Add one above!
        </p>
      ) : (
        <div className="space-y-2">
          {commands.map((cmd) => (
            <div
              key={cmd.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition"
            >
              <input
                type="checkbox"
                checked={cmd.enabled}
                onChange={() => handleToggle(cmd.id)}
                disabled={disabled}
                className="w-4 h-4 rounded bg-slate-600 border-slate-500 text-green-600 cursor-pointer"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">
                  !{cmd.name}
                </p>
                <p className="text-sm text-slate-400 truncate">
                  {cmd.response}
                </p>
              </div>
              <button
                onClick={() => handleDelete(cmd.id)}
                disabled={disabled}
                className="px-3 py-1 text-sm bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded transition disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
