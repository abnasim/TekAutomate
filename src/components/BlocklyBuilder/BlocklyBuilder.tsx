import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as Blockly from 'blockly';
import Theme from '@blockly/theme-modern';
import { WorkspaceSearch } from '@blockly/plugin-workspace-search';
import { ScrollOptions } from '@blockly/plugin-scroll-options';
import { CrossTabCopyPaste } from '@blockly/plugin-cross-tab-copy-paste';
import { Multiselect } from '@mit-app-inventor/blockly-plugin-workspace-multiselect';
import '@blockly/toolbox-search'; // Toolbox search plugin
import { pythonGenerator, resetGeneratorState, validateVariableUsage, validateDeviceUsage, validateBackendCompatibility, connectedDevices, setDeviceConfig, setDeviceInfo, getDeviceBackends } from './generators/pythonGenerators';
import { DeviceType } from './utils/deviceCapabilities';
import { createToolboxConfig } from './toolbox';
import { convertStepsToBlocks } from './converters/stepToBlock';
import { convertBlocksToSteps } from './converters/blockToStep';
import { BlocklyBuilderProps } from './types';
import { Download, Upload, FolderOpen, Trash2, ZoomIn, ZoomOut, ArrowLeft, Check, Sparkles, ClipboardPaste, Undo2, Redo2, Database } from 'lucide-react';
import { BrowseCommandsModal } from '../BrowseCommandsModal';
import { PythonCodeEditor } from '../PythonCodeEditor';
import { TmDevicesCommandBrowser } from '../TmDevicesCommandBrowser';
import { setCommandRegistry } from './utils/commandRegistry';
import './BlocklyBuilder.css';

// Import block definitions
import './blocks';

/**
 * Custom Connection Checker that allows flexible type connections
 * This mimics Python's behavior where any truthy value can be used in conditions
 * For example: math_number can connect to if conditions (non-zero = true)
 */
class FlexibleConnectionChecker extends Blockly.ConnectionChecker {
  /**
   * Override type checks to allow any value-to-value connections
   * This is more permissive than the default checker
   */
  doTypeChecks(a: Blockly.Connection, b: Blockly.Connection): boolean {
    // Get the check arrays for both connections
    const checkArrayA = a.getCheck();
    const checkArrayB = b.getCheck();
    
    // If either connection has no type restrictions (null), allow connection
    if (!checkArrayA || !checkArrayB) {
      return true;
    }
    
    // Check for any matching types
    for (const typeA of checkArrayA) {
      if (checkArrayB.includes(typeA)) {
        return true;
      }
    }
    
    // FLEXIBLE BEHAVIOR: Allow Number to connect to Boolean inputs
    // This mimics Python where any non-zero value is truthy
    const hasNumber = checkArrayA.includes('Number') || checkArrayB.includes('Number');
    const hasBoolean = checkArrayA.includes('Boolean') || checkArrayB.includes('Boolean');
    if (hasNumber && hasBoolean) {
      return true;
    }
    
    // FLEXIBLE BEHAVIOR: Allow String to connect to Boolean inputs
    // This mimics Python where non-empty strings are truthy
    const hasString = checkArrayA.includes('String') || checkArrayB.includes('String');
    if (hasString && hasBoolean) {
      return true;
    }
    
    // FLEXIBLE BEHAVIOR: Allow Array to connect to Boolean inputs
    const hasArray = checkArrayA.includes('Array') || checkArrayB.includes('Array');
    if (hasArray && hasBoolean) {
      return true;
    }
    
    // Default: no match found
    return false;
  }
}

// Register the custom connection checker
Blockly.registry.register(
  Blockly.registry.Type.CONNECTION_CHECKER,
  'flexible',
  FlexibleConnectionChecker
);

export const BlocklyBuilder: React.FC<BlocklyBuilderProps> = ({
  devices,
  steps = [],
  workspaceXml = '',
  onWorkspaceChange,
  onExportPython,
  onExportToSteps,
  commands = [],
  categoryColors = {},
  deviceFamilies = []
}) => {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const [workspace, setWorkspace] = useState<Blockly.WorkspaceSvg | null>(null);
  const [hasUnsavedWork, setHasUnsavedWork] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCommandExplorer, setShowCommandExplorer] = useState(false);
  const [showTmDevicesBrowser, setShowTmDevicesBrowser] = useState(false);
  const [showPythonEditorModal, setShowPythonEditorModal] = useState(false);
  const [pythonEditorBlockId, setPythonEditorBlockId] = useState<string | null>(null);
  const [forceRenderKey, setForceRenderKey] = useState(0); // Force re-render trigger
  const [blockCount, setBlockCount] = useState(0);
  const [aiPromptCopied, setAiPromptCopied] = useState(false);
  const [showAIPromptInput, setShowAIPromptInput] = useState(false);
  const [aiWorkflowDescription, setAiWorkflowDescription] = useState('');
  const [showAIPromptFallback, setShowAIPromptFallback] = useState(false);
  const [aiGeneratedPrompt, setAiGeneratedPrompt] = useState('');
  const [currentBlockForCommand, setCurrentBlockForCommand] = useState<{ blockId: string; fieldName: string; currentCommand?: string } | null>(null);
  const [currentTmDevicesBlock, setCurrentTmDevicesBlock] = useState<{ blockId: string; fieldName: string; currentPath?: string } | null>(null);
  const [commandBrowserDeviceFamily, setCommandBrowserDeviceFamily] = useState<string>('all');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const workspaceSearchRef = useRef<WorkspaceSearch | null>(null);

  // Device families with 'all' option for command browser
  const deviceFamiliesWithAll = useMemo(() => {
    return [
      { id: 'all', label: 'All Commands', icon: '', description: 'All available SCPI commands' },
      ...deviceFamilies
    ];
  }, [deviceFamilies]);

  // Filter commands based on selected device family
  const filteredCommands = useMemo(() => {
    if (commandBrowserDeviceFamily === 'all') {
      return commands;
    }
    // Filter commands by device family - check source file or category
    return commands.filter((cmd: any) => {
      // For TekExpress, check multiple indicators
      if (commandBrowserDeviceFamily === 'TekExpress') {
        return cmd.manualEntry?.commandGroup === 'USB4Tx' || 
               cmd.category === 'USB4Tx' ||
               cmd.category === 'tekexpress' ||
               cmd.scpi?.startsWith('TEKEXP:') ||
               cmd.sourceFile === 'tekexpress.json';
      }
      
      // For other device families, check sourceFile mapping
      const familyToFile: Record<string, string> = {
        '4/5/6 Series': 'mso_2_4_5_6_7.json',
        'DPO/MSO 5k_7k_70K': 'MSO_DPO_5k_7k_70K.json',
        'DPOJET': 'dpojet.json',
        'AFG': 'afg.json',
        'SMU': 'smu.json',
      };
      
      const expectedFile = familyToFile[commandBrowserDeviceFamily];
      if (expectedFile && cmd.sourceFile === expectedFile) {
        return true;
      }
      
      // Fallback: check if command belongs to the selected family by commandGroup or category
      if (cmd.manualEntry?.commandGroup === commandBrowserDeviceFamily) {
        return true;
      }
      if (cmd.category === commandBrowserDeviceFamily) {
        return true;
      }
      
      return false;
    });
  }, [commands, commandBrowserDeviceFamily]);
  const scrollOptionsRef = useRef<ScrollOptions | null>(null);
  const crossTabCopyPasteRef = useRef<CrossTabCopyPaste | null>(null);
  const pluginsInitializedRef = useRef<boolean>(false);

  // Populate command registry when commands change
  // This allows SCPI blocks to access parameter options from the command database
  useEffect(() => {
    if (commands && commands.length > 0) {
      setCommandRegistry(commands);
    }
  }, [commands]);

  // Initialize Blockly workspace
  useEffect(() => {
    if (!blocklyDiv.current || workspace) return;

    const toolbox = createToolboxConfig();
    
    const ws = Blockly.inject(blocklyDiv.current, {
      toolbox: toolbox,
      theme: Theme,
      grid: {
        spacing: 20,
        length: 3,
        colour: '#ccc',
        snap: true
      },
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1.0,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2
      },
      trashcan: true,
      sounds: false,
      move: {
        scrollbars: {
          horizontal: true,
          vertical: true
        },
        drag: true,
        wheel: true
      },
      // Use our custom flexible connection checker
      // This allows Number/String to connect to Boolean inputs (Python-like truthy behavior)
      plugins: {
        connectionChecker: 'flexible'
      }
    });

    // Create a default variable IMMEDIATELY after workspace creation
    // This MUST happen before toolbox search plugin indexes variable blocks
    // Without this, the search plugin throws "FieldVariable with no variable selected" errors
    try {
      if (!ws.getVariableMap().getAllVariables().length) {
        ws.createVariable('my_variable', '', 'default_var_id');
      }
    } catch (e) {
      console.warn('Could not create default variable:', e);
    }

    setWorkspace(ws);

    // Initialize plugins (only once)
    if (!pluginsInitializedRef.current) {
      try {
        const scrollOptions = new ScrollOptions(ws);
        scrollOptions.init();
        scrollOptionsRef.current = scrollOptions;

        // Wrap toolbox search init in try-catch to prevent it from breaking the app
        try {
          const workspaceSearch = new WorkspaceSearch(ws);
          workspaceSearch.init();
          workspaceSearchRef.current = workspaceSearch;
        } catch (searchError) {
          console.warn('Toolbox search init warning (non-fatal):', searchError);
        }

        const crossTabCopyPaste = new CrossTabCopyPaste();
        crossTabCopyPaste.init({ contextMenu: true, shortcut: true });
        crossTabCopyPasteRef.current = crossTabCopyPaste;

        // Initialize multi-select plugin
        const multiselect = new Multiselect(ws);
        multiselect.init();

        pluginsInitializedRef.current = true;
      } catch (error) {
        console.warn('Plugin initialization warning:', error);
      }
      
      // Register custom workspace context menu options
      try {
        // "Set All Blocks to Inline Inputs" option
        Blockly.ContextMenuRegistry.registry.register({
          displayText: () => '⬅️ Set All Blocks to Inline Inputs',
          preconditionFn: (scope) => {
            // Only show for workspace context menu (not block context menu)
            if (scope.workspace && !scope.block) {
              return 'enabled';
            }
            return 'hidden';
          },
          callback: (scope) => {
            const workspace = scope.workspace;
            if (!workspace) return;
            
            const allBlocks = workspace.getAllBlocks(false);
            allBlocks.forEach((block: Blockly.Block) => {
              if (block.setInputsInline) {
                block.setInputsInline(true);
              }
            });
          },
          scopeType: Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
          id: 'set_all_inline',
          weight: 100
        });
        
        // "Set All Blocks to External Inputs" option
        Blockly.ContextMenuRegistry.registry.register({
          displayText: () => '⬇️ Set All Blocks to External Inputs',
          preconditionFn: (scope) => {
            if (scope.workspace && !scope.block) {
              return 'enabled';
            }
            return 'hidden';
          },
          callback: (scope) => {
            const workspace = scope.workspace;
            if (!workspace) return;
            
            const allBlocks = workspace.getAllBlocks(false);
            allBlocks.forEach((block: Blockly.Block) => {
              if (block.setInputsInline) {
                block.setInputsInline(false);
              }
            });
          },
          scopeType: Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
          id: 'set_all_external',
          weight: 101
        });
      } catch (contextMenuError) {
        console.warn('Context menu registration warning:', contextMenuError);
      }
    }

    // Load workspace from parent state
    if (workspaceXml) {
      try {
        const xml = Blockly.utils.xml.textToDom(workspaceXml);
        Blockly.Xml.domToWorkspace(xml, ws);
      } catch (error) {
        console.error('Error loading workspace from state:', error);
      }
    }

    // Add keyboard shortcuts for undo/redo
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z or Cmd+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (ws.undo) {
          ws.undo(false);
        }
      }
      // Ctrl+Shift+Z or Cmd+Shift+Z for redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        if (ws.undo) {
          ws.undo(true);
        }
      }
      // Ctrl+Y or Cmd+Y for redo (alternative)
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        if (ws.undo) {
          ws.undo(true);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);

    // Close flyout when clicking on workspace
    ws.addChangeListener((event) => {
      if (event.type === Blockly.Events.CLICK) {
        // Auto-close the flyout when user clicks on workspace
        if (ws.getFlyout && ws.getFlyout()) {
          const flyout = ws.getFlyout();
          if (flyout && flyout.isVisible && flyout.isVisible()) {
            flyout.hide();
          }
        }
      }
      
      if (event.type !== Blockly.Events.UI) {
        // Only mark as unsaved after initial load is complete
        setIsInitialLoad((prev) => {
          if (!prev) {
            setHasUnsavedWork(true);
          }
          return prev;
        });
        setBlockCount(ws.getAllBlocks(false).length);
        
        // Run validation on workspace changes (debounced)
        setTimeout(() => {
          const allBlocks = ws.getAllBlocks(false);
          const deviceIPs = new Map<string, Array<{ device: string; source: string }>>();
          
          for (const block of allBlocks) {
            if (block.type === 'connect_scope') {
              const deviceName = block.getFieldValue('DEVICE_NAME') || 'scope';
              const host = block.getFieldValue('HOST');
              
              let ip = host;
              let source = 'block';
              if (!ip) {
                const deviceNameLower = deviceName.toLowerCase();
                const device = devices.find(d => 
                  d.alias?.toLowerCase() === deviceNameLower || 
                  d.id?.toLowerCase() === deviceNameLower ||
                  (d.deviceType?.toLowerCase() === 'scope' && deviceNameLower === 'scope') ||
                  (d.deviceType?.toLowerCase() === 'smu' && deviceNameLower === 'smu') ||
                  (d.deviceType?.toLowerCase() === 'psu' && deviceNameLower === 'psu')
                );
                ip = device?.host;
                source = 'device config';
              }
              
              if (ip) {
                if (!deviceIPs.has(ip)) {
                  deviceIPs.set(ip, []);
                }
                deviceIPs.get(ip)!.push({ device: deviceName, source });
              }
            }
          }
          
          const errors: string[] = [];
          const deviceIPEntries = Array.from(deviceIPs.entries());
          for (let i = 0; i < deviceIPEntries.length; i++) {
            const [ip, deviceList] = deviceIPEntries[i];
            if (deviceList.length > 1) {
              const deviceNames = deviceList.map((d: { device: string; source: string }) => `"${d.device}"`).join(' and ');
              errors.push(
                `IP Conflict: Multiple devices (${deviceNames}) use the same IP: ${ip}. Configure different IPs.`
              );
            }
          }
          
          setValidationErrors(errors);
        }, 300); // Debounce validation
        
        // Save workspace to parent state
        if (onWorkspaceChange) {
          try {
            const xml = Blockly.Xml.workspaceToDom(ws);
            const xmlText = Blockly.Xml.domToText(xml);
            onWorkspaceChange(xmlText);
          } catch (error) {
            console.error('Error saving workspace to state:', error);
          }
        }
      }
    });

    // Update block count initially
    setBlockCount(ws.getAllBlocks(false).length);

    // Mark initial load as complete after a short delay to let initial events settle
    const initialLoadTimer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 500);

    // Listen for custom event to open SCPI Explorer
    const handleOpenSCPIExplorer = (event: any) => {
      const { blockId, fieldName, currentCommand } = event.detail;
      setCurrentBlockForCommand({ blockId, fieldName, currentCommand });
      setCommandBrowserDeviceFamily('all'); // Show all commands
      setShowCommandExplorer(true);
    };

    // Listen for custom event to open TekExpress Explorer (uses SCPI explorer filtered to TekExpress)
    const handleOpenTekExpressExplorer = (event: any) => {
      const { blockId, fieldName } = event.detail;
      setCurrentBlockForCommand({ blockId, fieldName });
      setCommandBrowserDeviceFamily('TekExpress'); // Pre-filter to TekExpress commands
      setShowCommandExplorer(true);
    };

    // Listen for custom event to open tm_devices Explorer
    const handleOpenTmDevicesExplorer = (event: any) => {
      const { blockId, fieldName, currentPath } = event.detail;
      setCurrentTmDevicesBlock({ blockId, fieldName, currentPath });
      setShowTmDevicesBrowser(true);
    };
    
    // Listen for SCPI to tm_devices conversion
    const handleConvertToTmDevices = (event: any) => {
      const { blockId } = event.detail;
      if (!ws) return;
      
      const block = ws.getBlockById(blockId);
      if (!block) return;
      
      // Get SCPI command from block
      const scpiCommand = block.getFieldValue('COMMAND');
      if (!scpiCommand) return;
      
      // Get the block's position and connections before deletion
      const previousConnection = block.previousConnection;
      const nextConnection = block.nextConnection;
      const previousBlock = previousConnection?.targetBlock();
      const nextBlock = nextConnection?.targetBlock();
      const x = block.getRelativeToSurfaceXY().x;
      const y = block.getRelativeToSurfaceXY().y;
      
      // Import converter
      import('../../utils/scpiToTmDevicesConverter').then(({ convertSCPIToTmDevices }) => {
        const result = convertSCPIToTmDevices(scpiCommand);
        
        if (result.success) {
          // Create actual tm_devices block based on command type
          const isQuery = result.method === 'query' || result.method === 'verify';
          const blockType = isQuery ? 'tm_devices_query' : 'tm_devices_write';
          
          // Create new tm_devices block
          const newBlock = ws.newBlock(blockType);
          
          // Set the path field
          newBlock.setFieldValue(result.path, 'PATH');
          
          // For query blocks, set variable name from original block or use default
          if (isQuery) {
            const varName = block.type.includes('query') ? block.getFieldValue('VARIABLE') || 'result' : 'result';
            newBlock.setFieldValue(varName, 'VARIABLE');
          } else if (result.value) {
            // For write blocks, set the value
            newBlock.setFieldValue(result.value, 'VALUE');
          }
          
          // Position at same location
          newBlock.moveBy(x, y);
          newBlock.initSvg();
          newBlock.render();
          
          // Reconnect to neighbors
          if (previousBlock) {
            const prevNext = previousBlock.nextConnection;
            const newPrev = newBlock.previousConnection;
            if (prevNext && newPrev) {
              prevNext.connect(newPrev);
            }
          }
          if (nextBlock) {
            const newNext = newBlock.nextConnection;
            const nextPrev = nextBlock.previousConnection;
            if (newNext && nextPrev) {
              newNext.connect(nextPrev);
            }
          }
          
          // Delete old block
          block.dispose(false);
          
          // No dialog - conversion happens instantly
          console.log(`✅ Converted SCPI to tm_devices: ${scpiCommand} → ${result.path}`);
        } else {
          // Only show alert on failure
          window.alert(`❌ Conversion failed: ${result.message}`);
        }
      });
    };

    // Listen for custom event to open Python Code Editor
    const handleOpenPythonEditor = (event: any) => {
      const { blockId } = event.detail;
      setPythonEditorBlockId(blockId);
      setShowPythonEditorModal(true);
    };
    
    // Listen for tm_devices to SCPI conversion
    const handleConvertToSCPI = (event: any) => {
      const { blockId } = event.detail;
      if (!ws) return;
      
      const block = ws.getBlockById(blockId);
      if (!block) return;
      
      // Get tm_devices path from block
      const tmPath = block.getFieldValue('PATH');
      if (!tmPath) return;
      
      // Get the block's position and connections before deletion
      const previousConnection = block.previousConnection;
      const nextConnection = block.nextConnection;
      const previousBlock = previousConnection?.targetBlock();
      const nextBlock = nextConnection?.targetBlock();
      const x = block.getRelativeToSurfaceXY().x;
      const y = block.getRelativeToSurfaceXY().y;
      
      // Import converter
      import('../../utils/scpiToTmDevicesConverter').then(({ convertTmDevicesToSCPI }) => {
        const isQuery = block.type === 'tm_devices_query';
        const method = isQuery ? 'query' : 'write';
        const value = isQuery ? undefined : block.getFieldValue('VALUE');
        
        const result = convertTmDevicesToSCPI(tmPath, method, value);
        
        if (result.success) {
          // Create actual SCPI block based on command type
          const blockType = isQuery ? 'scpi_query' : 'scpi_write';
          
          // Create new SCPI block
          const newBlock = ws.newBlock(blockType);
          
          // Set the command field
          newBlock.setFieldValue(result.scpiCommand, 'COMMAND');
          
          // For query blocks, set variable name from original block or use default
          if (isQuery) {
            const varName = block.getFieldValue('VARIABLE') || 'result';
            newBlock.setFieldValue(varName, 'VARIABLE');
          }
          
          // Position at same location
          newBlock.moveBy(x, y);
          newBlock.initSvg();
          newBlock.render();
          
          // Mark workspace as loaded for this block to allow parameter updates
          (newBlock as any).workspaceLoadComplete_ = true;
          
          // Trigger parameter update after block is fully initialized
          if ((newBlock as any).updateParameters) {
            setTimeout(() => {
              if (!newBlock.isDisposed() && (newBlock as any).updateParameters) {
                (newBlock as any).updateParameters();
              }
            }, 150);
          }
          
          // Reconnect to neighbors
          if (previousBlock) {
            const prevNext = previousBlock.nextConnection;
            const newPrev = newBlock.previousConnection;
            if (prevNext && newPrev) {
              prevNext.connect(newPrev);
            }
          }
          if (nextBlock) {
            const newNext = newBlock.nextConnection;
            const nextPrev = nextBlock.previousConnection;
            if (newNext && nextPrev) {
              newNext.connect(nextPrev);
            }
          }
          
          // Delete old block
          block.dispose(false);
          
          // No dialog - conversion happens instantly
          console.log(`✅ Converted tm_devices to SCPI: ${tmPath} → ${result.scpiCommand}`);
        } else {
          // Only show alert on failure
          window.alert(`❌ Conversion failed: ${result.message}`);
        }
      });
    };

    window.addEventListener('openSCPIExplorer', handleOpenSCPIExplorer);
    window.addEventListener('openTekExpressExplorer', handleOpenTekExpressExplorer);
    window.addEventListener('openTmDevicesExplorer', handleOpenTmDevicesExplorer);
    window.addEventListener('openPythonEditor', handleOpenPythonEditor);
    window.addEventListener('convertToTmDevices', handleConvertToTmDevices);
    window.addEventListener('convertToSCPI', handleConvertToSCPI);

    return () => {
      clearTimeout(initialLoadTimer);
      window.removeEventListener('openSCPIExplorer', handleOpenSCPIExplorer);
      window.removeEventListener('openTekExpressExplorer', handleOpenTekExpressExplorer);
      window.removeEventListener('openTmDevicesExplorer', handleOpenTmDevicesExplorer);
      window.removeEventListener('openPythonEditor', handleOpenPythonEditor);
      window.removeEventListener('convertToTmDevices', handleConvertToTmDevices);
      window.removeEventListener('convertToSCPI', handleConvertToSCPI);
      window.removeEventListener('keydown', handleKeyDown);
      
      // Cleanup plugins
      if (workspaceSearchRef.current) {
        try {
          workspaceSearchRef.current.dispose();
        } catch (e) {
          console.warn('Error disposing workspace search:', e);
        }
        workspaceSearchRef.current = null;
      }
      
      // Note: ScrollOptions and CrossTabCopyPaste don't have dispose methods
      scrollOptionsRef.current = null;
      crossTabCopyPasteRef.current = null;
      
      pluginsInitializedRef.current = false;
      ws.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run once on mount

  // Handle import from steps
  const handleImportFromSteps = () => {
    if (!workspace) {
      console.error('Workspace not initialized');
      return;
    }

    console.log('Starting import from steps:', steps);
    console.log('Number of steps:', steps.length);
    console.log('Devices:', devices);

    if (hasUnsavedWork) {
      const confirmed = window.confirm(
        'This will replace your current Blockly workspace. Continue?'
      );
      if (!confirmed) return;
    }

    try {
      convertStepsToBlocks(steps, workspace, devices);
      setHasUnsavedWork(false);
      setShowImportModal(false);
      console.log('Import completed successfully');
      
      // Update block count
      setBlockCount(workspace.getAllBlocks(false).length);
    } catch (error) {
      console.error('Error importing steps:', error);
      alert('Error importing steps: ' + error);
    }
  };

  // Handle export to Steps
  const handleExportToSteps = () => {
    if (!workspace) return;

    try {
      const exportedSteps = convertBlocksToSteps(workspace, devices);
      console.log('Exported steps:', exportedSteps);
      
      if (onExportToSteps) {
        onExportToSteps(exportedSteps);
        alert(`Successfully exported ${exportedSteps.length} steps to Builder!`);
      }
    } catch (error) {
      console.error('Error exporting to steps:', error);
      alert('Error exporting to steps: ' + error);
    }
  };

  // Generate Python code from workspace (must be declared before handleExportPython)
  const generatePythonCode = (): string => {
    if (!workspace) return '';

    // Check which backends are used and collect tm_devices drivers
    const allBlocks = workspace.getAllBlocks(false);
    const usedBackends = new Set<string>();
    const tmDevicesDrivers = new Set<string>();
    
    for (const block of allBlocks) {
      if (block.type === 'connect_scope') {
        const backend = block.getFieldValue('BACKEND');
        if (backend) {
          usedBackends.add(backend);
          
          // Collect tm_devices drivers
          if (backend === 'tm_devices') {
            const driver = block.getFieldValue('DRIVER_NAME');
            if (driver) {
              tmDevicesDrivers.add(driver);
            }
          }
        }
      }
    }
    
    const usesPyVISA = usedBackends.has('pyvisa') || usedBackends.has('vxi11') || usedBackends.has('hybrid');
    const usesTmDevices = usedBackends.has('tm_devices') || usedBackends.has('hybrid');

    // Header
    let code = `#!/usr/bin/env python3\n`;
    code += `"""\n`;
    code += `Generated by TekAutomate - Blockly Builder\n`;
    code += `Generated: ${new Date().toISOString()}\n`;
    code += `"""\n\n`;

    // Imports (conditional based on backends used)
    code += `import time\n`;
    if (usesPyVISA) {
      code += `import pyvisa\n`;
    }
    if (usesTmDevices) {
      code += `from tm_devices import DeviceManager\n`;
      if (tmDevicesDrivers.size > 0) {
        code += `from tm_devices.drivers import ${Array.from(tmDevicesDrivers).join(', ')}\n`;
      }
    }
    code += `\n`;
    
    // Initialize VISA resource manager only if PyVISA is used
    if (usesPyVISA) {
      code += `# Initialize VISA\n`;
      code += `rm = pyvisa.ResourceManager()\n\n`;
    }
    
    // Initialize tm_devices DeviceManager only if tm_devices is used
    if (usesTmDevices) {
      code += `# Initialize tm_devices DeviceManager\n`;
      code += `device_manager = DeviceManager(verbose=True)\n`;
      code += `device_manager.setup_cleanup_enabled = False\n`;
      code += `device_manager.teardown_cleanup_enabled = False\n\n`;
    }

    // Note: Variables are declared in <variables> section but NOT initialized
    // They are assigned values when used, not pre-initialized to None

    // Build device config map from devices prop
    // Store by alias, id, and common device type names for flexible lookup
    const deviceConfigMap = new Map<string, { host?: string; ip?: string; resource?: string }>();
    const deviceInfoMap = new Map<string, { deviceType?: DeviceType; backend?: string }>();
    
    devices.forEach(device => {
      if (device.host || device.connectionType) {
        const config: { host?: string; ip?: string; resource?: string } = {};
        if (device.host) {
          config.host = device.host;
          config.ip = device.host;
        }
        if (device.connectionType === 'tcpip' && device.host) {
          config.resource = `TCPIP::${device.host}::INSTR`;
        }
        
        // Store device info (type and backend) for capability checking
        const deviceInfo: { deviceType?: DeviceType; backend?: string } = {
          deviceType: device.deviceType as DeviceType,
          backend: device.backend
        };
        
        // Store by alias (primary key)
        if (device.alias) {
          deviceConfigMap.set(device.alias.toLowerCase(), config);
          deviceInfoMap.set(device.alias.toLowerCase(), deviceInfo);
        }
        // Also store by id if different from alias
        if (device.id && device.id !== device.alias) {
          deviceConfigMap.set(device.id.toLowerCase(), config);
          deviceInfoMap.set(device.id.toLowerCase(), deviceInfo);
        }
        // Also store by common device type name (scope, psu, smu, dmm, etc.)
        // This allows XML to use simple names like "psu" even if device alias is different
        const deviceTypeLower = device.deviceType?.toLowerCase();
        if (deviceTypeLower) {
          // Map device types to common names
          const typeNameMap: Record<string, string> = {
            'scope': 'scope',
            'psu': 'psu',
            'smu': 'smu',
            'dmm': 'dmm',
            'afg': 'afg',
            'awg': 'awg'
          };
          const commonName = typeNameMap[deviceTypeLower];
          if (commonName && !deviceConfigMap.has(commonName)) {
            // Only store if not already stored (first device of this type wins)
            deviceConfigMap.set(commonName, config);
            deviceInfoMap.set(commonName, deviceInfo);
          }
        }
      }
    });

    // Set device config and info in generator
    setDeviceConfig(deviceConfigMap);
    setDeviceInfo(deviceInfoMap);

    // Reset generator state before generation
    resetGeneratorState();

    // Validate backend compatibility BEFORE generation (fail-fast)
    try {
      validateBackendCompatibility(workspace);
    } catch (error) {
      console.error('Backend compatibility validation error:', error);
      throw error; // Re-throw to abort generation
    }

    // Generate code from blocks
    pythonGenerator.INDENT = '    ';
    let generatedCode = pythonGenerator.workspaceToCode(workspace);
    
    // Post-process: Remove variable initializations to None
    // Blockly's Python generator automatically initializes all variables to None,
    // but we want variables to be assigned only when explicitly set
    // Match standalone lines like "variable = None" (with optional whitespace)
    // This preserves assignments like "x = None if condition else value"
    generatedCode = generatedCode.replace(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*None\s*$/gm, '');
    // Also remove any resulting double newlines
    generatedCode = generatedCode.replace(/\n\n\n+/g, '\n\n');
    
    // Add read_waveform_binary helper if binary waveform saving is used
    if (generatedCode.includes('read_waveform_binary(')) {
      const waveformHelper = `def read_waveform_binary(inst, source='CH1', start=1, stop=None, width=1, encoding='RIBinary'):
    """Reads waveform data with proper setup - FAST binary transfer."""
    if stop is None:
        try:
            rec_len = int(inst.query('HORizontal:RECOrdlength?').strip())
            stop = rec_len
            print(f"  Queried record length: {rec_len:,} points")
        except:
            stop = 10000
    
    inst.write(f'DATa:SOUrce {source}')
    inst.write(f'DATa:ENCdg {encoding}')
    inst.write(f'WFMOutpre:BYT_Nr {width}')
    inst.write('HEAD OFF')
    inst.write(f'DATa:STARt {start}')
    inst.write(f'DATa:STOP {stop}')
    
    num_points = stop - start + 1
    expected_bytes = num_points * width
    print(f"Configured: {source}, {num_points:,} points, {expected_bytes:,} bytes")
    
    old_timeout = inst.timeout
    inst.timeout = 60000  # 60 seconds
    
    try:
        import time
        t0 = time.time()
        data = inst.query_binary_values('CURVe?', datatype='B', container=bytes)
        elapsed = time.time() - t0
        rate_mbps = (len(data) / elapsed) / 1_000_000
        print(f"  ✓ {len(data):,} bytes in {elapsed:.2f}s ({rate_mbps:.1f} MB/s)")
        return {'num_points': num_points, 'width': width}, data
    finally:
        inst.timeout = old_timeout

`;
      code += waveformHelper;
    }
    
    code += generatedCode;

    // Validate variable usage
    try {
      validateVariableUsage();
    } catch (error) {
      console.error('Variable validation error:', error);
      throw error; // Re-throw to abort generation
    }

    // Validate device usage (all connected devices must be used)
    try {
      validateDeviceUsage();
    } catch (error) {
      console.error('Device usage validation error:', error);
      throw error; // Re-throw to abort generation
    }

    // Cleanup - close all connected devices explicitly
    // IMPORTANT: This must close ALL devices in connectedDevices, not a subset
    // REQUIRED INVARIANT: Every connected device must be closed exactly once, regardless of backend
    // Always generate cleanup if there are any connected devices OR if tm_devices was used
    const backends = getDeviceBackends();
    const usesTmDevicesForCleanup = Array.from(backends.values()).some(b => b === 'tm_devices');
    
    // ALWAYS extract device names from generated code as primary source
    // connectedDevices may be modified by disconnect blocks, but cleanup must be symmetric
    const deviceNamesFromCode = new Set<string>();
    if (usesTmDevicesForCleanup) {
      // Look for device_manager.add_* patterns in generated code
      // Handle both with and without type hints: "scope = ..." or "scope: MSO2 = ..."
      const addDevicePattern = /^(\w+)(?:\s*:\s*\w+)?\s*=\s*device_manager\.add_(scope|smu|psu|dmm|afg|awg|device)\(/gm;
      let match;
      while ((match = addDevicePattern.exec(generatedCode)) !== null) {
        deviceNamesFromCode.add(match[1]);
      }
    } else {
      // For PyVISA, look for rm.open_resource patterns
      const openResourcePattern = /(\w+)\s*=\s*rm\.open_resource\(/g;
      let match;
      while ((match = openResourcePattern.exec(generatedCode)) !== null) {
        deviceNamesFromCode.add(match[1]);
      }
    }
    
    // Use extracted names from code (most reliable), fall back to connectedDevices if extraction failed
    const devicesToClose = deviceNamesFromCode.size > 0 ? Array.from(deviceNamesFromCode) : connectedDevices;
    
    if (devicesToClose.length > 0 || usesTmDevicesForCleanup) {
      code += `\n# Cleanup - close all devices\n`;
      
      // For tm_devices: DeviceManager.close() handles ALL device cleanup
      // Do NOT call individual device.close() as it causes double-close errors
      if (usesTmDevicesForCleanup) {
        code += `if 'device_manager' in locals():\n`;
        code += `    device_manager.close()\n`;
        code += `    print("All devices closed via DeviceManager")\n`;
      } else {
        // For PyVISA and other backends, close each device individually
        if (devicesToClose.length > 0) {
          const sortedDevices = [...devicesToClose].sort();
          
          sortedDevices.forEach(device => {
            code += `if '${device}' in locals():\n`;
            code += `    ${device}.close()\n`;
            code += `    print("Disconnected ${device}")\n`;
          });
        }
      }
      
      // Close TekExpress ResourceManager if it was created
      if (generatedCode.includes('_tekexp_rm')) {
        code += `\n# Close TekExpress ResourceManager\n`;
        code += `if '_tekexp_rm' in locals():\n`;
        code += `    _tekexp_rm.close()\n`;
      }
    }

    return code;
  };

  // UI-level validation before generation
  const validateBeforeGeneration = (): { errors: string[]; warnings: string[] } => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!workspace) {
      errors.push('Workspace not initialized');
      return { errors, warnings };
    }
    
    // Check for IP conflicts
    const allBlocks = workspace.getAllBlocks(false);
    const deviceIPs = new Map<string, Array<{ device: string; blockId: string; source: string }>>();
    
    for (const block of allBlocks) {
      if (block.type === 'connect_scope') {
        const deviceName = block.getFieldValue('DEVICE_NAME') || 'scope';
        const host = block.getFieldValue('HOST');
        
        // Try to get IP from device config if not in block
        let ip = host;
        let source = 'block';
        if (!ip) {
          const deviceNameLower = deviceName.toLowerCase();
          const device = devices.find(d => 
            d.alias?.toLowerCase() === deviceNameLower || 
            d.id?.toLowerCase() === deviceNameLower ||
            (d.deviceType?.toLowerCase() === 'scope' && deviceNameLower === 'scope') ||
            (d.deviceType?.toLowerCase() === 'smu' && deviceNameLower === 'smu') ||
            (d.deviceType?.toLowerCase() === 'psu' && deviceNameLower === 'psu')
          );
          ip = device?.host;
          source = 'device config';
        }
        
        if (ip) {
          if (!deviceIPs.has(ip)) {
            deviceIPs.set(ip, []);
          }
          deviceIPs.get(ip)!.push({ device: deviceName, blockId: block.id, source });
        }
      }
    }
    
    // Check for conflicts
    const deviceIPEntries = Array.from(deviceIPs.entries());
    for (let i = 0; i < deviceIPEntries.length; i++) {
      const [ip, deviceList] = deviceIPEntries[i];
      if (deviceList.length > 1) {
        const deviceNames = deviceList.map((d: { device: string; source: string }) => `"${d.device}"`).join(' and ');
        errors.push(
          `IP Conflict: Multiple devices (${deviceNames}) are configured to use the same IP address: ${ip}. ` +
          `Please configure different IP addresses for each device in your device settings.`
        );
      }
    }
    
    return { errors, warnings };
  };

  // Handle export Python
  const handleExportPython = () => {
    if (!workspace) return;

    // Run UI-level validation first
    const validation = validateBeforeGeneration();
    setValidationErrors(validation.errors);
    setValidationWarnings(validation.warnings);
    
    // If there are critical errors, show them and prevent generation
    if (validation.errors.length > 0) {
      const errorMessage = validation.errors.join('\n\n');
      alert(`Cannot generate Python code:\n\n${errorMessage}\n\nPlease fix these issues and try again.`);
      return;
    }
    
    // Show warnings but allow generation to proceed
    if (validation.warnings.length > 0) {
      const warningMessage = validation.warnings.join('\n\n');
      const proceed = window.confirm(
        `Warnings detected:\n\n${warningMessage}\n\nDo you want to proceed with generation anyway?`
      );
      if (!proceed) return;
    }

    try {
      // Generate Python code
      const code = generatePythonCode();

      if (onExportPython) {
        onExportPython(code);
      } else {
        // Prompt for filename
        const filename = window.prompt('Enter script name:', 'tek_automation');
        if (!filename) return; // User cancelled
        
        // Download as file
        const blob = new Blob([code], { type: 'text/python' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = generateCleanFilename(filename, 'py');
        a.click();
        URL.revokeObjectURL(url);
      }
      
      // Clear validation messages on success
      setValidationErrors([]);
      setValidationWarnings([]);
    } catch (error) {
      // Catch generator-level errors and show user-friendly message
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Extract user-friendly message from generator errors
      let userMessage = errorMessage;
      if (errorMessage.includes('RESOURCE COLLISION')) {
        userMessage = errorMessage.split('\n\n')[0] + '\n\n' + 
          'Please configure different IP addresses for each device in your device settings.';
      } else if (errorMessage.includes('BACKEND CAPABILITY VIOLATION')) {
        userMessage = errorMessage.split('\n\n')[0] + '\n\n' +
          'Some blocks are not compatible with the selected backend. Please use compatible blocks.';
      } else if (errorMessage.includes('UNUSED')) {
        userMessage = errorMessage.split('\n\n')[0] + '\n\n' +
          'All connected devices must be used. Please add operations for these devices or remove the connection blocks.';
      }
      
      alert(`Error generating Python code:\n\n${userMessage}`);
      setValidationErrors([userMessage]);
    }
  };

  // Helper function to generate clean filenames
  const generateCleanFilename = (userInput: string, extension: string): string => {
    // Remove all special characters and convert to snake_case
    let clean = userInput
      .toLowerCase()
      .replace(/[^a-z0-9_\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '_')           // Spaces to underscores
      .replace(/-+/g, '_')            // Hyphens to underscores
      .replace(/_+/g, '_')            // Collapse multiple underscores
      .replace(/^_|_$/g, '');         // Trim underscores from ends
    
    // If empty after sanitization, use default
    if (!clean) {
      clean = 'tek_automation';
    }
    
    // Add simple date stamp (YYYYMMDD format) - cleaner than full timestamp
    const now = new Date();
    const dateStamp = now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0');
    
    return `${clean}_${dateStamp}.${extension}`;
  };

  // Handle export JSON - prompt for filename and save
  const handleExportJson = () => {
    if (!workspace) return;

    // Prompt user for filename
    const filename = window.prompt('Enter workflow name:', 'workflow');
    if (!filename) return; // User cancelled

    const xml = Blockly.Xml.workspaceToDom(workspace);
    const xmlText = Blockly.Xml.domToPrettyText(xml); // Use pretty text for better readability
    const blob = new Blob([xmlText], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = generateCleanFilename(filename, 'xml');
    a.click();
    URL.revokeObjectURL(url);
    
    // Mark as saved
    setHasUnsavedWork(false);
  };

  // AI Builder - Build context-rich prompt and open Custom GPT
  const handleAIBuilder = async (workflowText: string) => {
    if (!workflowText.trim()) {
      alert('Please describe what you want to do');
      return;
    }

    // Get current workspace XML (if any blocks exist)
    let currentXml = '';
    let variablesInUse: string[] = [];
    let instrumentsFromBlocks: string[] = [];
    
    if (workspace) {
      const xml = Blockly.Xml.workspaceToDom(workspace);
      currentXml = Blockly.Xml.domToPrettyText(xml);
      
      // Extract variables from workspace
      const allBlocks = workspace.getAllBlocks(false);
      const varBlocks = allBlocks.filter(b => b.type === 'variables_set' || b.type === 'variables_get');
      varBlocks.forEach(b => {
        const varId = b.getFieldValue('VAR');
        const varModel = workspace.getVariableById(varId);
        if (varModel) {
          const name = varModel.getName();
          if (!variablesInUse.includes(name)) variablesInUse.push(name);
        }
      });
      
      // Extract instrument info from connect_scope blocks in workspace
      const connectBlocks = allBlocks.filter(b => b.type === 'connect_scope');
      connectBlocks.forEach(b => {
        const deviceName = b.getFieldValue('DEVICE_NAME') || 'scope';
        const host = b.getFieldValue('HOST') || (b as any).hostValue_ || '';
        const backend = b.getFieldValue('BACKEND') || 'PyVISA';
        if (host) {
          instrumentsFromBlocks.push(`  - ${deviceName}: ${backend} @ ${host}`);
        } else {
          instrumentsFromBlocks.push(`  - ${deviceName}: ${backend}`);
        }
      });
    }

    // Build instruments list - prefer workspace blocks, fallback to devices prop
    let instrumentsStr = '';
    if (instrumentsFromBlocks.length > 0) {
      instrumentsStr = instrumentsFromBlocks.join('\n');
    } else if (devices.length > 0 && devices.some(d => d.address)) {
      instrumentsStr = devices
        .filter(d => d.address) // Only include devices with addresses
        .map(d => `  - ${d.alias}: ${d.model || 'instrument'} @ ${d.address}`)
        .join('\n');
    }

    // Build context-rich prompt (let GPT reason, not constrain)
    // Note: Don't include system prompt here - the Custom GPT already has it
    const prompt = `Here is the current workspace state:

--- CURRENT BLOCKLY XML ---
${currentXml || '<xml xmlns="https://developers.google.com/blockly/xml"></xml>'}
--- END XML ---

Workspace context:
${instrumentsStr ? `- Instruments in workspace:\n${instrumentsStr}` : '- No instruments configured yet'}
${variablesInUse.length > 0 ? `- Variables in use: ${variablesInUse.join(', ')}` : ''}

User request:
${workflowText}

Instructions:
- Generate valid TekAutomate Blockly XML
- Preserve existing blocks when possible
- Fix errors if present
- Add missing blocks if needed`;

    try {
      await navigator.clipboard.writeText(prompt);
      
      // Store prompt for fallback display
      setAiGeneratedPrompt(prompt);
      
      // Open the Custom GPT in new tab
      window.open(
        'https://chatgpt.com/g/g-69742de938188191985209bfbb5d2a94-tekautomate-blockly-xml-builder',
        '_blank'
      );
      
      // Show success feedback with fallback option
      setAiPromptCopied(true);
      setShowAIPromptInput(false);
      setAiWorkflowDescription('');
      
      // Show fallback modal after a short delay (in case GPT link doesn't work)
      setTimeout(() => {
        setShowAIPromptFallback(true);
      }, 500);
      
      setTimeout(() => setAiPromptCopied(false), 4000);
    } catch (error) {
      console.error('Failed to copy prompt:', error);
      alert('Failed to copy prompt to clipboard');
    }
  };

  // Handle paste XML from clipboard (for AI-generated XML)
  const handlePasteXml = async () => {
    if (!workspace) return;

    try {
      const clipboardText = await navigator.clipboard.readText();
      const trimmedContent = clipboardText.trim();
      
      // Validate it looks like XML
      if (!trimmedContent.startsWith('<')) {
        alert('Clipboard does not contain valid XML. Make sure to copy the XML output from the AI.');
        return;
      }

      // Clear workspace and load the XML
      workspace.clear();
      
      // Parse and load the XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(trimmedContent, 'text/xml');
      
      // Check for parsing errors
      const parseError = xmlDoc.querySelector('parsererror');
      if (parseError) {
        alert('Invalid XML format. Please check the AI output and try again.');
        return;
      }
      
      // Load into workspace
      Blockly.Xml.domToWorkspace(xmlDoc.documentElement, workspace);
      
      // Show success
      alert('XML loaded successfully! Review and adjust the blocks as needed.');
    } catch (error) {
      console.error('Failed to paste XML:', error);
      alert('Failed to read from clipboard. Make sure you have copied the XML.');
    }
  };

  // Handle import JSON or XML
  const handleImportJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !workspace) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const fileContent = e.target?.result as string;
        
        // Detect file format: JSON starts with { or [, XML starts with <
        const trimmedContent = fileContent.trim();
        const isJson = trimmedContent.startsWith('{') || trimmedContent.startsWith('[');
        const isXml = trimmedContent.startsWith('<');
        
        workspace.clear();
        
        // Disable events during import to prevent onchange from overwriting values
        Blockly.Events.disable();
        
        if (isJson) {
          // Parse JSON (Steps UI format) and convert to Blockly blocks
          const stepsData = JSON.parse(fileContent);
          const steps = stepsData.steps || stepsData; // Handle both {steps: [...]} and [...]
          
          if (Array.isArray(steps)) {
            convertStepsToBlocks(steps, workspace, devices);
          } else {
            throw new Error('Invalid JSON format: expected array of steps or object with "steps" property');
          }
        } else if (isXml) {
          // Parse XML (Blockly format) directly
          const xml = Blockly.utils.xml.textToDom(fileContent);
          Blockly.Xml.domToWorkspace(xml, workspace);
        } else {
          throw new Error('Unsupported file format: file must be JSON (Steps UI) or XML (Blockly) format. File starts with: ' + trimmedContent.substring(0, 50));
        }
        
        // Helper function to find device context by walking back through blocks
        const getDeviceContextForBlock = (block: any): string => {
          let currentBlock: any = block.getPreviousBlock();
          while (currentBlock) {
            if (currentBlock.type === 'set_device_context') {
              return currentBlock.getFieldValue('DEVICE') || 'scope';
            }
            if (currentBlock.type === 'connect_scope') {
              return currentBlock.getFieldValue('DEVICE_NAME') || 'scope';
            }
            currentBlock = currentBlock.getPreviousBlock();
          }
          return '?';
        };
        
        // Mark ALL SCPI blocks as loaded from XML and color-code them
        const allBlocks = workspace.getAllBlocks(false);
        allBlocks.forEach((block: any) => {
          if (block.type === 'scpi_write' || block.type === 'scpi_query' || block.type === 'custom_command' || 
              block.type === 'wait_for_opc' || block.type === 'save_waveform') {
            block.workspaceLoadComplete_ = true;
            
            // Get device context from XML or auto-detect if it's unknown
            let deviceContext = block.getFieldValue('DEVICE_CONTEXT');
            let deviceName = deviceContext ? deviceContext.replace(/[()]/g, '') : 'scope';
            
            // If device context is unknown (?), try to auto-detect it
            if (deviceName === '?' || deviceContext === '(?)') {
              deviceName = getDeviceContextForBlock(block);
              deviceContext = `(${deviceName})`;
              block.setFieldValue(deviceContext, 'DEVICE_CONTEXT');
            }
            
            // Color-code based on device context
            if (deviceContext) {
              deviceName = deviceContext.replace(/[()]/g, ''); // Remove parentheses
              
              if (block.type === 'scpi_write') {
                if (deviceName === 'scope') {
                  block.setColour(210); // Blue for scope
                } else if (deviceName === 'smu' || deviceName === 'psu') {
                  block.setColour(0); // Red for SMU/PSU
                } else if (deviceName === 'dmm') {
                  block.setColour(120); // Green for DMM
                } else {
                  block.setColour(230); // Gray for unknown
                }
              } else if (block.type === 'scpi_query') {
                if (deviceName === 'scope') {
                  block.setColour(230); // Indigo for scope queries
                } else if (deviceName === 'smu' || deviceName === 'psu') {
                  block.setColour(330); // Pink/Red for SMU/PSU queries
                } else if (deviceName === 'dmm') {
                  block.setColour(120); // Green for DMM
                } else {
                  block.setColour(230); // Gray for unknown
                }
              } else if (block.type === 'custom_command') {
                if (deviceName === 'scope') {
                  block.setColour(260); // Purple for scope
                } else if (deviceName === 'smu' || deviceName === 'psu') {
                  block.setColour(0); // Red for SMU/PSU
                } else if (deviceName === 'dmm') {
                  block.setColour(120); // Green for DMM
                } else {
                  block.setColour(230); // Gray for unknown
                }
              } else if (block.type === 'wait_for_opc') {
                if (deviceName === 'scope') {
                  block.setColour(230); // Gray for scope
                } else if (deviceName === 'smu' || deviceName === 'psu') {
                  block.setColour(0); // Red for SMU/PSU
                } else if (deviceName === 'dmm') {
                  block.setColour(120); // Green for DMM
                } else {
                  block.setColour(230); // Gray for unknown
                }
              } else if (block.type === 'save_waveform') {
                if (deviceName === 'scope') {
                  block.setColour(260); // Violet for scope
                } else if (deviceName === 'smu' || deviceName === 'psu') {
                  block.setColour(0); // Red for SMU/PSU
                } else if (deviceName === 'dmm') {
                  block.setColour(120); // Green for DMM
                } else {
                  block.setColour(260); // Violet for unknown
                }
              }
            }
          }
        });
        
        // Re-enable events
        Blockly.Events.enable();
        
        setHasUnsavedWork(false);
        
        // Force complete workspace refresh after import
        setTimeout(() => {
          if ((workspace as any).render) {
            (workspace as any).render();
          }
          if ((workspace as any).zoomToFit) {
            (workspace as any).zoomToFit();
          }
          if ((workspace as any).resize) {
            (workspace as any).resize();
          }
          
          // Trigger React re-render
          setForceRenderKey(prev => prev + 1);
        }, 150);
      } catch (error) {
        alert('Error importing workspace: ' + error);
      }
    };
    reader.readAsText(file);
  };

  // Handle clear workspace
  const handleClearWorkspace = () => {
    if (!workspace) return;

    const confirmed = window.confirm(
      'Are you sure you want to clear the workspace? This cannot be undone.'
    );
    if (confirmed) {
      workspace.clear();
      setHasUnsavedWork(false);
    }
  };

  // Handle zoom
  const handleZoomIn = () => {
    if (!workspace) return;
    workspace.zoomCenter(1.2);
  };

  const handleZoomOut = () => {
    if (!workspace) return;
    workspace.zoomCenter(0.8);
  };

  // Handle undo/redo
  const handleUndo = () => {
    if (!workspace) return;
    workspace.undo(false);
  };

  const handleRedo = () => {
    if (!workspace) return;
    workspace.undo(true);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Toolbar */}
      <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Blockly Builder</h2>
          <span className="text-xs text-gray-500">
            {blockCount} blocks
            {hasUnsavedWork && <span className="ml-2 text-orange-500">● Unsaved</span>}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Import from Steps */}
          <button
            onClick={handleImportFromSteps}
            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium flex items-center gap-1"
            title="Import steps from Builder"
          >
            <Upload size={14} />
            Import from Steps
          </button>

          {/* Export to Steps */}
          <button
            onClick={handleExportToSteps}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-medium flex items-center gap-1"
            title="Export to Steps Builder"
          >
            <ArrowLeft size={14} />
            Export to Steps
          </button>

          <div className="h-6 w-px bg-gray-300 mx-1"></div>

          {/* Browse SCPI Commands */}
          <button
            onClick={() => setShowCommandExplorer(true)}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium flex items-center gap-1"
            title="Browse SCPI commands"
          >
            <FolderOpen size={14} />
            Browse Commands
          </button>

          {/* Browse tm_devices Commands */}
          <button
            onClick={() => setShowTmDevicesBrowser(true)}
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-medium flex items-center gap-1"
            title="Browse tm_devices command tree"
          >
            <Database size={14} />
            tm_devices Commands
          </button>

          <div className="h-6 w-px bg-gray-300 mx-1"></div>

          {/* AI Builder */}
          <button
            onClick={() => setShowAIPromptInput(true)}
            className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1 transition-colors ${
              aiPromptCopied 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white'
            }`}
            title="Generate Blockly XML using AI"
          >
            {aiPromptCopied ? <Check size={14} /> : <Sparkles size={14} />}
            {aiPromptCopied ? 'Prompt Copied! Paste in GPT' : 'AI Builder'}
          </button>
          <button
            onClick={handlePasteXml}
            className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs font-medium flex items-center gap-1"
            title="Paste XML from clipboard (from AI output)"
          >
            <ClipboardPaste size={14} />
            Paste XML
          </button>

          <div className="h-6 w-px bg-gray-300 mx-1"></div>

          {/* Save/Load Workspace Files */}
          <button
            onClick={handleExportJson}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium flex items-center gap-1"
            title="Download workspace file"
          >
            <Download size={14} />
            Save File
          </button>
          <label className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium cursor-pointer flex items-center gap-1"
                 title="Load workspace from file">
            <FolderOpen size={14} />
            Load File
            <input
              type="file"
              accept=".xml,.json"
              className="hidden"
              onChange={handleImportJson}
            />
          </label>

          <div className="h-6 w-px bg-gray-300 mx-1"></div>

          {/* Clear */}
          <button
            onClick={handleClearWorkspace}
            className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs font-medium flex items-center gap-1"
            title="Clear workspace"
          >
            <Trash2 size={14} />
            Clear
          </button>

          {/* Undo/Redo */}
          <button
            onClick={handleUndo}
            className="px-2 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs"
            title="Undo"
          >
            <Undo2 size={14} />
          </button>
          <button
            onClick={handleRedo}
            className="px-2 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs"
            title="Redo"
          >
            <Redo2 size={14} />
          </button>

          <div className="h-6 w-px bg-gray-300 mx-1"></div>

          {/* Export Python - Far Right */}
          <button
            onClick={handleExportPython}
            className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1 ${
              validationErrors.length > 0
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
            title={validationErrors.length > 0 ? 'Fix errors before exporting' : 'Export as Python script'}
          >
            <Download size={14} />
            Export Python
            {validationErrors.length > 0 && (
              <span className="ml-1 bg-red-800 text-white text-[10px] px-1.5 py-0.5 rounded">
                {validationErrors.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Validation Messages */}
      {(validationErrors.length > 0 || validationWarnings.length > 0) && (
        <div className="px-4 py-2 bg-white border-b">
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 mb-2 rounded shadow-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium">Errors Found - Cannot Export</h3>
                  <ul className="mt-2 text-sm list-disc list-inside space-y-1">
                    {validationErrors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => setValidationErrors([])}
                  className="ml-3 text-red-500 hover:text-red-700"
                  title="Dismiss"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          {validationWarnings.length > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-3 mb-2 rounded shadow-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium">Warnings</h3>
                  <ul className="mt-2 text-sm list-disc list-inside space-y-1">
                    {validationWarnings.map((warning, idx) => (
                      <li key={idx}>{warning}</li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => setValidationWarnings([])}
                  className="ml-3 text-yellow-500 hover:text-yellow-700"
                  title="Dismiss"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Blockly Workspace Container */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Workspace */}
        <div 
          ref={blocklyDiv} 
          className="flex-1" 
          style={{ 
            height: 'calc(100vh - 120px)'
          }} 
        />
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md">
            <h3 className="text-lg font-semibold mb-4">Import Steps from Builder?</h3>
            <p className="text-sm text-gray-600 mb-6">
              You have {steps.length} step(s) in the Builder. Would you like to import them into Blockly?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleImportFromSteps}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium"
              >
                Import
              </button>
              <button
                onClick={() => setShowImportModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded font-medium"
              >
                Keep Current
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Browse Commands Modal */}
      <BrowseCommandsModal
        isOpen={showCommandExplorer}
        initialCommand={currentBlockForCommand?.currentCommand}
        onClose={() => {
          setShowCommandExplorer(false);
          setCurrentBlockForCommand(null);
          setCommandBrowserDeviceFamily('all'); // Reset to all on close
        }}
        onSelect={(command) => {
          if (!workspace) return;
          
          // If we're updating an existing block
          if (currentBlockForCommand) {
            const block = workspace.getBlockById(currentBlockForCommand.blockId);
            if (block) {
              const isQuery = command.scpi.trim().endsWith('?');
              const commandText = isQuery ? command.scpi.trim().slice(0, -1) : command.scpi;
              block.setFieldValue(commandText, currentBlockForCommand.fieldName);
              
              // Trigger parameter update after field change
              if ((block as any).updateParameters) {
                setTimeout(() => {
                  if (!block.isDisposed() && (block as any).updateParameters) {
                    (block as any).updateParameters();
                  }
                }, 150);
              }
              setCurrentBlockForCommand(null);
            }
          } else {
            // Determine if command is a query or write based on the command string
            const isQuery = command.scpi.trim().endsWith('?');
            
            // Determine block type based on command type from manualEntry or command string
            const commandType = command.manualEntry?.commandType;
            let blockType = 'scpi_write';
            
            if (isQuery || commandType === 'query') {
              blockType = 'scpi_query';
            } else if (commandType === 'set' || commandType === 'both') {
              blockType = 'scpi_write';
            }
            
            const block = workspace.newBlock(blockType);
            
            // Set command (remove ? for query blocks as it's implied)
            const commandText = isQuery ? command.scpi.trim().slice(0, -1) : command.scpi;
            block.setFieldValue(commandText, 'COMMAND');
            
            // For query blocks, set a default variable name
            if (blockType === 'scpi_query') {
              const varName = 'result'; // Default variable name
              block.setFieldValue(varName, 'VARIABLE');
            }
            
            // Position block in workspace center
            const metrics = workspace.getMetrics();
            block.moveBy(metrics.viewWidth / 2, metrics.viewHeight / 2);
            block.initSvg();
            block.render();
            
            // Mark workspace as loaded for this block to allow parameter updates
            (block as any).workspaceLoadComplete_ = true;
            
            // Trigger parameter update after block is fully initialized
            if ((block as any).updateParameters) {
              setTimeout(() => {
                if (!block.isDisposed() && (block as any).updateParameters) {
                  (block as any).updateParameters();
                }
              }, 150);
            }
          }
          
          setShowCommandExplorer(false);
          setCommandBrowserDeviceFamily('all'); // Reset to all after selection
        }}
        commands={filteredCommands}
        categoryColors={categoryColors}
        buttonText="Add to Workspace"
        title="Browse SCPI Commands"
        selectedDeviceFamily={commandBrowserDeviceFamily}
        setSelectedDeviceFamily={setCommandBrowserDeviceFamily}
        deviceFamilies={deviceFamiliesWithAll}
      />

      {/* tm_devices Command Browser */}
      <TmDevicesCommandBrowser
        isOpen={showTmDevicesBrowser}
        initialPath={currentTmDevicesBlock?.currentPath}
        onClose={() => {
          setShowTmDevicesBrowser(false);
          setCurrentTmDevicesBlock(null);
        }}
        onSelect={(cmd) => {
          // Convert path array to string, EXCLUDING the method part
          const pathStr = cmd.path
            .filter(node => node.type !== 'method') // Exclude method nodes
            .map(node => {
              if (node.type === 'index') return `[${node.value}]`;
              return `.${node.value}`;
            }).join('').replace(/^\./, ''); // Remove leading dot
          
          // If updating an existing block from context menu
          if (currentTmDevicesBlock && workspace) {
            const block = workspace.getBlockById(currentTmDevicesBlock.blockId);
            if (block) {
              // Set the PATH field
              block.setFieldValue(pathStr, currentTmDevicesBlock.fieldName);
              
              // Always update the VALUE field when a command is added
              const valueField = block.getField('VALUE');
              if (valueField) {
                // If a value was provided, use it; otherwise clear it to prompt user
                const newValue = (cmd.value !== undefined && cmd.value !== '') ? cmd.value : '';
                block.setFieldValue(newValue, 'VALUE');
              }
            }
            setCurrentTmDevicesBlock(null);
          } else if (workspace) {
            // Create new tm_devices command block directly
            const method = cmd.method?.toLowerCase() || 'write';
            const blockType = method === 'query' ? 'tm_devices_query' : 'tm_devices_write';
            
            try {
              const newBlock = workspace.newBlock(blockType);
              
              // Set the PATH field
              newBlock.setFieldValue(pathStr, 'PATH');
              
              // Set the VALUE field if provided and it's a write block
              if (blockType === 'tm_devices_write' && cmd.value !== undefined && cmd.value !== '') {
                newBlock.setFieldValue(cmd.value, 'VALUE');
              }
              
              // Initialize and render the block
              if ((newBlock as any).initSvg) {
                (newBlock as any).initSvg();
              }
              if ((newBlock as any).render) {
                (newBlock as any).render();
              }
              
              // Position the block - find a good spot
              const existingBlocks = workspace.getAllBlocks(false);
              let yPos = 50;
              if (existingBlocks.length > 0) {
                // Find the lowest block and place below it
                const lastBlock = existingBlocks[existingBlocks.length - 1];
                const xy = lastBlock.getRelativeToSurfaceXY();
                yPos = xy.y + 100;
              }
              newBlock.moveBy(50, yPos);
              
              // Try to connect to the last block if possible
              if (existingBlocks.length > 0) {
                const lastBlock = existingBlocks[existingBlocks.length - 1];
                if (lastBlock.nextConnection && newBlock.previousConnection) {
                  lastBlock.nextConnection.connect(newBlock.previousConnection);
                }
              }
              
              // Select the new block
              if ((newBlock as any).select) {
                (newBlock as any).select();
              }
            } catch (error) {
              console.error('Failed to create tm_devices block:', error);
            }
          }
          setShowTmDevicesBrowser(false);
        }}
      />

      {/* Python Code Editor Modal */}
      {showPythonEditorModal && pythonEditorBlockId && workspace && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Python Code Editor</h3>
              <button
                onClick={() => {
                  setShowPythonEditorModal(false);
                  setPythonEditorBlockId(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <PythonCodeEditor
                value={(() => {
                  const block = workspace.getBlockById(pythonEditorBlockId);
                  return block ? (block.getFieldValue('CODE') || '# Custom Python code') : '# Custom Python code';
                })()}
                onChange={(newCode) => {
                  const block = workspace.getBlockById(pythonEditorBlockId);
                  if (block) {
                    block.setFieldValue(newCode, 'CODE');
                  }
                }}
              />
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowPythonEditorModal(false);
                  setPythonEditorBlockId(null);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Builder Prompt Input Modal */}
      {showAIPromptInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-500 to-indigo-500 rounded-t-lg">
              <div className="flex items-center gap-2 text-white">
                <Sparkles size={20} />
                <h3 className="text-lg font-semibold">AI Builder</h3>
              </div>
              <button
                onClick={() => setShowAIPromptInput(false)}
                className="text-white hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe your test workflow:
              </label>
              <textarea
                value={aiWorkflowDescription}
                onChange={(e) => setAiWorkflowDescription(e.target.value)}
                placeholder="Example: Connect to scope at 192.168.1.100, enable CH1, set 1V scale, capture a single acquisition, save waveform as capture.wfm, then disconnect"
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none text-sm"
                autoFocus
              />
              <div className="mt-3 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                <strong>How it works:</strong>
                <ol className="mt-1 ml-4 list-decimal space-y-1">
                  <li>Describe your workflow above</li>
                  <li>Click "Generate" - prompt is copied to clipboard</li>
                  <li>TekAutomate GPT XML Builder opens - paste the prompt</li>
                  <li>Copy the XML output</li>
                  <li>Click "Paste XML" in Blockly to load it</li>
                </ol>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <button
                onClick={() => setShowAIPromptInput(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAIBuilder(aiWorkflowDescription)}
                disabled={!aiWorkflowDescription.trim()}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded font-medium text-sm flex items-center gap-2"
              >
                <Sparkles size={16} />
                Generate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Builder Fallback Modal - shows instructions after prompt is copied */}
      {showAIPromptFallback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-green-500 to-teal-500 rounded-t-lg">
              <div className="flex items-center gap-2 text-white">
                <Check size={20} />
                <h3 className="text-lg font-semibold">Prompt Copied!</h3>
              </div>
              <button
                onClick={() => setShowAIPromptFallback(false)}
                className="text-white hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-green-800">
                  <strong>TekAutomate GPT is now open in a new tab.</strong>
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Paste the prompt (Ctrl+V) and wait for the XML response.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800 font-medium">Next Steps:</p>
                <ol className="text-sm text-blue-700 mt-2 ml-4 list-decimal space-y-1">
                  <li>Paste the prompt in the GPT chat (Ctrl+V)</li>
                  <li>Wait for the XML to be generated</li>
                  <li>Copy the XML output (starts with {`<xml`})</li>
                  <li>Click <strong>"Paste XML"</strong> in the toolbar</li>
                </ol>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                <p><strong>GPT not opening?</strong> Your browser may have blocked the popup.</p>
                <button
                  onClick={() => window.open('https://chatgpt.com/g/g-69742de938188191985209bfbb5d2a94-tekautomate-blockly-xml-builder', '_blank')}
                  className="mt-2 text-blue-600 hover:underline"
                >
                  Click here to open the GPT manually
                </button>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end">
              <button
                onClick={() => setShowAIPromptFallback(false)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium text-sm"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
