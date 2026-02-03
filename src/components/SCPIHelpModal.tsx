import React from 'react';
import { X, BookOpen, Code2, Copy } from 'lucide-react';
import { ParsedSCPI, EditableParameter, ManualCommandEntry, CommandParam } from '../types/scpi';

/**
 * Fix mixed syntax strings and construct proper SET syntax with arguments.
 * E.g., "CMD {<NR1>|OFF|ON} CMD?" should be split into set and query parts.
 * If params are provided and set syntax is missing arguments, construct them.
 */
const fixSyntaxDisplay = (
  syntax: { set?: string; query?: string } | undefined,
  params?: Array<{ name: string; type?: string; options?: string[] }>
): { set: string | null; query: string | null } => {
  if (!syntax) return { set: null, query: null };
  
  let setSyntax = syntax.set?.trim() || null;
  let querySyntax = syntax.query?.trim() || null;
  
  // Fix case where query contains both SET and QUERY syntax
  if (querySyntax && querySyntax.includes('{') && querySyntax.includes('?')) {
    // Pattern: "COMMAND {args} COMMAND?" - split them
    const queryMatch = querySyntax.match(/^(.+?\})\s+(\S+\?)$/);
    if (queryMatch) {
      if (!setSyntax) {
        setSyntax = queryMatch[1].trim();
      }
      querySyntax = queryMatch[2].trim();
    } else {
      // Try another pattern: find where the query command starts
      const parts = querySyntax.split(/\s+/);
      const queryPart = parts.find(p => p.endsWith('?'));
      if (queryPart) {
        const queryIdx = querySyntax.lastIndexOf(queryPart);
        if (queryIdx > 0) {
          const potentialSet = querySyntax.substring(0, queryIdx).trim();
          if (potentialSet && (potentialSet.includes('{') || potentialSet.includes('<NR'))) {
            if (!setSyntax) {
              setSyntax = potentialSet;
            }
            querySyntax = queryPart;
          }
        }
      }
    }
  }
  
  // Fix case where set syntax wrongly ends with ?
  if (setSyntax && setSyntax.endsWith('?')) {
    if (!querySyntax) {
      querySyntax = setSyntax;
    }
    setSyntax = null;
  }
  
  // Ensure query ends with ?
  if (querySyntax && !querySyntax.endsWith('?')) {
    querySyntax = null;
  }
  
  // If set syntax exists but has no arguments, construct them from params
  if (setSyntax && !setSyntax.includes('{') && !/\s*<NR\d*>/i.test(setSyntax) && !/<QString>/i.test(setSyntax) && params && params.length > 0) {
    // Find value parameter (not mnemonic params like 'channel', 'math', etc.)
    const mnemonicNames = ['channel', 'math', 'ref', 'bus', 'cursor', 'search', 'power', 'plot', 'meas', 'source', 'histogram', 'digital_bit', 'mask', 'callout', 'actonevent', 'license', 'rail', 'source_num', 'trigger_type'];
    const valueParam = params.find(p => 
      p.name.toLowerCase() === 'value' || 
      (p.options && p.options.length > 0 && !mnemonicNames.includes(p.name.toLowerCase()))
    );
    
    if (valueParam) {
      let argStr = '';
      if (valueParam.options && valueParam.options.length > 0) {
        // Check if options include numeric types (case-insensitive)
        const numericRegex = /<(number|NR\d*|NRx)>/i;
        const hasNumber = valueParam.options.some(o => numericRegex.test(o));
        const otherOptions = valueParam.options.filter(o => !numericRegex.test(o) && !/<QString>/i.test(o));
        
        if (hasNumber && otherOptions.length > 0) {
          argStr = ` {<NR1>|${otherOptions.join('|')}}`;
        } else if (otherOptions.length > 0) {
          argStr = ` {${otherOptions.join('|')}}`;
        } else if (hasNumber) {
          argStr = ' <NR1>';
        }
      } else if (valueParam.type === 'number' || valueParam.type === 'integer' || valueParam.type === 'enumeration') {
        argStr = valueParam.type === 'enumeration' ? '' : ' <NR1>';
      } else if (valueParam.type === 'string') {
        argStr = ' <QString>';
      }
      
      if (argStr) {
        setSyntax = setSyntax + argStr;
      }
    }
  }
  
  return { set: setSyntax, query: querySyntax };
};

interface SCPIHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  command: string;
  parsedSCPI?: ParsedSCPI;
  editableParameters?: EditableParameter[];
  manualEntry?: ManualCommandEntry;
  params?: CommandParam[];
}

export const SCPIHelpModal: React.FC<SCPIHelpModalProps> = ({
  isOpen,
  onClose,
  command,
  parsedSCPI,
  editableParameters = [],
  manualEntry,
  params = [],
}) => {
  if (!isOpen) return null;

  // Determine command name and type
  const commandName = manualEntry?.command?.split(':').pop()?.replace('?', '').replace('<x>', '') || 
                      command.split(':').pop()?.replace('?', '').replace('<x>', '') || 
                      'Command';
  const syntax = manualEntry?.syntax;
  let actualType = manualEntry?.commandType;
  
  if (syntax) {
    // Use the fixed syntax to determine command type
    const fixedSyntax = fixSyntaxDisplay(syntax as { set?: string; query?: string }, params);
    const hasSet = !!fixedSyntax.set;
    const hasQuery = !!fixedSyntax.query;
    if (hasQuery && !hasSet) actualType = 'query';
    else if (hasSet && !hasQuery) actualType = 'set';
    else if (hasSet && hasQuery) actualType = 'both';
  } else if (command.trim().endsWith('?') && !actualType) {
    actualType = 'query';
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b flex items-start justify-between bg-gradient-to-r from-blue-50 to-white">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h2 className="text-2xl font-bold text-gray-900">{commandName}</h2>
              {manualEntry?.commandGroup && (
                <span className="text-xs px-3 py-1 rounded-full border font-medium bg-blue-100 text-blue-700 border-blue-300">
                  {manualEntry.commandGroup}
                </span>
              )}
              {actualType && (
                <>
                  {(actualType === 'set' || actualType === 'both') && (
                    <span className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                      Set
                    </span>
                  )}
                  {(actualType === 'query' || actualType === 'both') && (
                    <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800 font-semibold border border-blue-200">
                      Query
                    </span>
                  )}
                </>
              )}
            </div>
            <div className="font-mono text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded border border-blue-200">
              {command || 'No command'}
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded transition"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Description */}
          {manualEntry && (
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <BookOpen size={18} />
                Description
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {manualEntry.description || 'No description available.'}
              </p>
              
              {/* Conditions/Requirements */}
              {(manualEntry as any).conditions && (
                <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded">
                  <span className="text-xs font-semibold text-amber-800">Requirements: </span>
                  <span className="text-xs text-amber-700">{(manualEntry as any).conditions}</span>
                </div>
              )}
            </div>
          )}
          
          {/* Syntax */}
          {manualEntry?.syntax && (typeof manualEntry.syntax === 'object') && (() => {
            const fixedSyntax = fixSyntaxDisplay(manualEntry.syntax as { set?: string; query?: string }, params);
            if (!fixedSyntax.set && !fixedSyntax.query) return null;
            return (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Code2 size={18} />
                  Syntax
                </h3>
                <div className="space-y-2">
                  {fixedSyntax.set && (
                    <div className="rounded-lg overflow-hidden border border-gray-200">
                      <div className="text-xs text-gray-500 px-3 py-1 bg-gray-100 border-b">Set Command</div>
                      <div className="bg-gray-900 px-3 py-2 font-mono text-sm flex items-center justify-between">
                        <code className="text-green-400">{fixedSyntax.set}</code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(fixedSyntax.set!);
                          }}
                          className="p-1 hover:bg-gray-700 rounded transition text-gray-400 hover:text-white"
                          title="Copy"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                  {fixedSyntax.query && (
                    <div className="rounded-lg overflow-hidden border border-gray-200">
                      <div className="text-xs text-gray-500 px-3 py-1 bg-gray-100 border-b">Query Command</div>
                      <div className="bg-gray-900 px-3 py-2 font-mono text-sm flex items-center justify-between">
                        <code className="text-blue-400">{fixedSyntax.query}</code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(fixedSyntax.query!);
                          }}
                          className="p-1 hover:bg-gray-700 rounded transition text-gray-400 hover:text-white"
                          title="Copy"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
          

          {/* Command Structure - Only show if no manualEntry or for debugging */}
          {parsedSCPI && !manualEntry && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Code2 size={18} />
                Command Structure
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-xs font-medium text-gray-500">Header:</span>
                  <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-sm font-mono text-gray-900">
                    {parsedSCPI.header || 'N/A'}
                  </code>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-500">Mnemonics:</span>
                  <div className="mt-1 flex flex-wrap gap-2 items-center">
                    {parsedSCPI.mnemonics.map((m, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-mono"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
                {parsedSCPI.isQuery && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500">Type:</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                      Query
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Parameters */}
          {params.length > 0 && (() => {
            // Filter out value parameters for query-only commands
            const isQueryOnly = actualType === 'query' || 
                               (command.trim().endsWith('?') && !manualEntry?.syntax?.set);
            const filteredParams = isQueryOnly 
              ? params.filter(p => p.name.toLowerCase() !== 'value')
              : params;
            
            if (filteredParams.length === 0) return null;
            
            return (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Code2 size={18} />
                  Parameters
                </h3>
                <div className="space-y-2">
                  {filteredParams.map((p, idx) => (
                    <div key={`${p.name}-${idx}`} className="bg-gray-50 border rounded p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">{p.name}</span>
                        {p.required && <span className="text-xs text-red-500 font-semibold">required</span>}
                        <span className="text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-700 font-mono">{p.type || 'text'}</span>
                      </div>
                      {p.description && <p className="text-xs text-gray-600 mt-1">{p.description}</p>}
                      {p.options && p.options.length > 0 && (() => {
                        // Filter out type placeholders - they're not selectable options
                        const placeholderRegex = /^<(NR\d*|number|NRx|QString)>$/i;
                        const filteredOpts = p.options.filter(opt => !placeholderRegex.test(opt));
                        const hasNumeric = p.options.some(opt => /^<(NR\d*|number|NRx)>$/i.test(opt));
                        
                        if (filteredOpts.length === 0 && !hasNumeric) return null;
                        
                        return (
                          <div className="mt-2">
                            <span className="text-xs font-medium text-gray-500">
                              {hasNumeric && filteredOpts.length > 0 ? 'Options (or numeric value):' : 'Options:'}
                            </span>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {hasNumeric && (
                                <span className="px-2 py-0.5 rounded text-xs font-mono bg-blue-50 border border-blue-300 text-blue-700">
                                  &lt;number&gt;
                                </span>
                              )}
                              {filteredOpts.map((opt) => (
                                <span key={opt} className="px-2 py-0.5 rounded text-xs font-mono bg-white border border-gray-300 text-gray-700">
                                  {opt}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                      {p.default !== undefined && p.default !== null && (
                        <p className="text-xs text-gray-500 mt-1">Default: {String(p.default)}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Editable Parameters */}
          {editableParameters.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Editable Parameters</h3>
              <div className="space-y-3">
                {editableParameters.map((param, i) => (
                  <div key={i} className="bg-gray-50 rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {param.currentValue}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          ({param.type})
                        </span>
                      </div>
                    </div>
                    {param.description && (
                      <p className="text-xs text-gray-600 mb-2">{param.description}</p>
                    )}
                    {param.validOptions.length > 0 && (
                      <div>
                        <span className="text-xs font-medium text-gray-500">Valid options:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {param.validOptions.map((opt, j) => (
                            <span
                              key={j}
                              className={`px-2 py-0.5 rounded text-xs font-mono ${
                                opt === param.currentValue
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-gray-300 text-gray-700'
                              }`}
                            >
                              {opt}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Examples */}
          {manualEntry && manualEntry.examples && manualEntry.examples.length > 0 && (() => {
            // Get the base command header (without ? or arguments)
            const cmdHeader = command.split(/[\s?]/)[0].replace(/<x>/gi, '').toUpperCase();
            
            // Filter out corrupted examples that belong to other commands
            const validExamples = manualEntry.examples.filter((example: any) => {
              const code = example.codeExamples?.scpi?.code || '';
              // Skip empty codes
              if (!code.trim()) return false;
              // Skip codes that look like descriptions (start with common description words)
              if (/^(This command|Sets or|Queries|Returns|Specifies)/i.test(code.trim())) return false;
              // Skip codes that are clearly from other commands (have different base header)
              const codeHeader = code.split(/[\s?]/)[0].replace(/<x>/gi, '').replace(/\d+/g, '').toUpperCase();
              const cmdBase = cmdHeader.replace(/\d+/g, '');
              if (codeHeader && cmdBase && !codeHeader.includes(cmdBase.split(':').slice(-1)[0])) {
                return false;
              }
              return true;
            });
            
            if (validExamples.length === 0) return null;
            
            return (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Code2 size={18} />
                  Examples
                </h3>
                <div className="space-y-4">
                  {validExamples.map((example: any, i: number) => (
                  <div key={i} className="rounded-lg overflow-hidden border border-gray-200">
                    {/* SCPI Code Block - shown first */}
                    {example.codeExamples && (
                      <div className="space-y-0">
                        {example.codeExamples.scpi && (
                          <div className="bg-gray-900 text-green-400 p-3 font-mono text-sm relative group">
                            <code>{example.codeExamples.scpi.code}</code>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(example.codeExamples!.scpi!.code);
                              }}
                              className="absolute top-2 right-2 p-1 bg-gray-700 hover:bg-gray-600 rounded opacity-0 group-hover:opacity-100 transition"
                              title="Copy code"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        )}
                        {example.codeExamples.python && (
                          <div className="border-t border-gray-700">
                            <div className="bg-gray-800 px-3 py-1">
                              <span className="text-xs font-medium text-gray-400">Python (PyVISA)</span>
                            </div>
                            <div className="bg-gray-900 text-gray-100 p-3 font-mono text-sm relative group">
                              <code>{example.codeExamples.python.code}</code>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(example.codeExamples!.python!.code);
                                }}
                                className="absolute top-2 right-2 p-1 bg-gray-700 hover:bg-gray-600 rounded opacity-0 group-hover:opacity-100 transition"
                                title="Copy code"
                              >
                                <Copy size={14} />
                              </button>
                            </div>
                          </div>
                        )}
                        {example.codeExamples.tm_devices && (
                          <div className="border-t border-gray-700">
                            <div className="bg-gray-800 px-3 py-1">
                              <span className="text-xs font-medium text-gray-400">tm_devices</span>
                            </div>
                            <div className="bg-gray-900 text-gray-100 p-3 font-mono text-sm relative group">
                              <code>{example.codeExamples.tm_devices.code}</code>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(example.codeExamples!.tm_devices!.code);
                                }}
                                className="absolute top-2 right-2 p-1 bg-gray-700 hover:bg-gray-600 rounded opacity-0 group-hover:opacity-100 transition"
                                title="Copy code"
                              >
                                <Copy size={14} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Description - formatted below the code */}
                    {example.description && (
                      <div className="px-3 py-2 bg-gray-50 border-t border-gray-200">
                        <p className="text-sm text-gray-600 leading-relaxed italic">
                          {example.description}
                        </p>
                      </div>
                    )}
                    {example.result !== null && example.result !== undefined && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <span className="text-xs font-medium text-gray-500">Result:</span>
                        <code className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-mono">
                          {String(example.result)}
                        </code>
                        {example.resultDescription && (
                          <p className="text-xs text-gray-600 mt-1">{example.resultDescription}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            );
          })()}

          {/* Related Commands */}
          {manualEntry && manualEntry.relatedCommands && manualEntry.relatedCommands.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Related Commands</h3>
              <div className="flex flex-wrap gap-2">
                {manualEntry.relatedCommands.map((cmd, i) => (
                  <code
                    key={i}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded border text-sm font-mono hover:bg-gray-200 transition cursor-pointer"
                  >
                    {cmd}
                  </code>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {manualEntry && manualEntry.notes && manualEntry.notes.length > 0 && (
            <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
              <ul className="space-y-1">
                {manualEntry.notes.map((note, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-yellow-600 mt-1">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Manual Reference */}
          {manualEntry && manualEntry.manualReference && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <BookOpen className="h-4 w-4" />
                <span>
                  Manual Reference: {manualEntry.manualReference.section}
                  {manualEntry.manualReference.page && ` (Page ${manualEntry.manualReference.page})`}
                </span>
              </div>
            </div>
          )}

          {/* No Data Message */}
          {!parsedSCPI && !manualEntry && (
            <div className="text-center py-8 text-gray-500">
              <p>No detailed information available for this command.</p>
              <p className="text-sm mt-2">Command structure parsing and manual data will appear here when available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


