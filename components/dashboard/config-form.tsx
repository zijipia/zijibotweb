'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CustomCommands } from './custom-commands';

interface ServerConfig {
  serverId: string;
  prefix: string;
  language: string;
  modRole: string | null;
  logChannel: string | null;
  autorole: boolean;
  autoroleIds: string[];
  customCommands: any[];
}

interface ServerConfigFormProps {
  serverId: string;
  initialConfig: ServerConfig;
}

export function ServerConfigForm({
  serverId,
  initialConfig,
}: ServerConfigFormProps) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [customCommands, setCustomCommands] = useState(
    initialConfig.customCommands || []
  );
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServerConfig>({
    defaultValues: initialConfig,
  });

  const onSubmit = async (data: ServerConfig) => {
    setSaving(true);
    try {
      const response = await fetch('/api/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serverId,
          config: {
            ...data,
            customCommands,
          },
        }),
      });

      if (response.ok) {
        setMessage('Configuration saved successfully!');
        setTimeout(() => setMessage(null), 5000);
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('[v0] Save config error:', error);
      setMessage('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-slate-700 bg-slate-800 p-6">
      <h2 className="text-xl font-semibold text-white mb-6">
        Server Configuration
      </h2>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.includes('Error')
              ? 'bg-red-500/20 border border-red-500 text-red-200'
              : 'bg-green-500/20 border border-green-500 text-green-200'
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Prefix */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Command Prefix
          </label>
          <Input
            {...register('prefix', { required: 'Prefix is required' })}
            placeholder="!"
            className="bg-slate-700 border-slate-600 text-white"
          />
          {errors.prefix && (
            <p className="text-red-400 text-sm mt-1">{errors.prefix.message}</p>
          )}
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Language
          </label>
          <select
            {...register('language')}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="ja">Japanese</option>
          </select>
        </div>

        {/* Mod Role */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Moderator Role ID
          </label>
          <Input
            {...register('modRole')}
            placeholder="Enter role ID or leave empty"
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>

        {/* Log Channel */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Log Channel ID
          </label>
          <Input
            {...register('logChannel')}
            placeholder="Enter channel ID or leave empty"
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>

        {/* Autorole */}
        <div>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              {...register('autorole')}
              className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-blue-600"
            />
            <span className="text-white font-medium">Enable Auto Role</span>
          </label>
        </div>

        {/* Custom Commands */}
        <CustomCommands
          commands={customCommands}
          onUpdate={setCustomCommands}
          disabled={saving}
        />

        {/* Submit Button */}
        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
          <Button
            type="button"
            onClick={() => reset()}
            className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg font-medium transition"
          >
            Reset
          </Button>
        </div>
      </form>
    </Card>
  );
}
