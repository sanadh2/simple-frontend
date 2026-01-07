'use client';

import { Log } from '@/lib/logs-api';
import { formatDistanceToNow } from 'date-fns';
import { Info, AlertTriangle, XCircle, Bug, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { LogDetailModal } from './LogDetailModal';

interface LogsTableProps {
  logs: Log[];
  onCorrelationClick?: (correlationId: string) => void;
}

const levelConfig = {
  info: { color: 'text-blue-600 bg-blue-50', icon: Info, label: 'INFO' },
  warn: { color: 'text-yellow-600 bg-yellow-50', icon: AlertTriangle, label: 'WARN' },
  error: { color: 'text-red-600 bg-red-50', icon: XCircle, label: 'ERROR' },
  debug: { color: 'text-gray-600 bg-gray-50', icon: Bug, label: 'DEBUG' },
};

export function LogsTable({ logs, onCorrelationClick }: LogsTableProps) {
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);

  if (logs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No logs found</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Correlation ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log, index) => {
                const config = levelConfig[log.level];
                const Icon = config.icon;

                return (
                  <tr
                    key={`${log.correlationId}-${index}`}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {formatDistanceToNow(new Date(log.timestamp), {
                            addSuffix: true,
                          })}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
                      >
                        <Icon className="w-3 h-3" />
                        {config.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate">
                      {log.message}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => onCorrelationClick?.(log.correlationId)}
                        className="font-mono text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                      >
                        {log.correlationId.slice(0, 8)}...
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.userId ? (
                        <span className="font-mono text-xs">
                          {log.userId.slice(0, 8)}...
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedLog(log)}
                      >
                        Details
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedLog && (
        <LogDetailModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
          onTraceRequest={() => {
            onCorrelationClick?.(selectedLog.correlationId);
            setSelectedLog(null);
          }}
        />
      )}
    </>
  );
}

