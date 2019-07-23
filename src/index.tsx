import { ILayoutRestorer, JupyterFrontEndPlugin, JupyterFrontEnd } from '@jupyterlab/application';

import { ISettingRegistry } from '@jupyterlab/coreutils';

import { ICommandPalette, WidgetTracker } from '@jupyterlab/apputils';

import { IMainMenu } from '@jupyterlab/mainmenu';

import { Widget } from '@phosphor/widgets';

import ShortcutWidget from './ShortcutWidget';

import '../style/variables.css';

/** Object for shortcut items */
export class ShortcutObject {
  commandName: string;
  label: string;
  keys: { [index: string]: Array<string> };
  source: string;
  selector: string;
  category: string;
  id: string;
  hasConflict: boolean;
  numberOfShortcuts: number;

  constructor() {
    this.commandName = '';
    this.label = '';
    this.keys = {};
    this.source = '';
    this.selector = '';
    this.category = '';
    this.id = '';
    this.numberOfShortcuts = 0;
    this.hasConflict = false;
  }

  get(sortCriteria: string): string {
    if (sortCriteria === 'label') {
      return this.label;
    } else if (sortCriteria === 'selector') {
      return this.selector;
    } else if (sortCriteria === 'category') {
      return this.category;
    } else if (sortCriteria === 'source') {
      return this.source;
    }
  }
}
/** Object for conflicting shortcut error messages */
export class ErrorObject extends ShortcutObject {
  takenBy: TakenByObject;

  constructor() {
    super();
    this.takenBy = new TakenByObject();
  }
}

/** Object for showing which shortcut conflicts with the new one */
export class TakenByObject {
  takenBy: ShortcutObject;
  takenByKey: string;
  takenByLabel: string;
  id: string;

  constructor() {
    this.takenBy = new ShortcutObject();
    this.takenByKey = '';
    this.takenByLabel = '';
    this.id = '';
  }
}

/** Main plugin for extension */
const plugin: JupyterFrontEndPlugin<void> = {
  id: '@jupyterlab/jupyterlab-shortcutui:plugin',
  requires: [ISettingRegistry, ICommandPalette, IMainMenu],
  optional: [ILayoutRestorer],
  activate: (
    app: JupyterFrontEnd,
    settingRegistry: ISettingRegistry,
    palette: ICommandPalette,
    menu: IMainMenu,
    restorer: ILayoutRestorer | null
  ): void => {
    let widget: ShortcutWidget;
    /** Load keyboard shortcut settings from registry and create list of command id's */
    settingRegistry
      .load('@jupyterlab/shortcuts-extension:plugin')
      .then(settings => Object.keys(settings.composite))

      /** Create top-level component and associated widget */
      .then(commandlist => {        
        // Track and restore the widget state
        let tracker = new WidgetTracker<ShortcutWidget>({
          namespace: 'shortcutui'
        });

        /** Add command to open extension's widget */
        const command: string = 'shortcutui:open-ui';
        app.commands.addCommand(command, {
          label: 'Keyboard Shortcut Editor',
          execute: () => {
            if (widget == undefined) {
              widget = createWidget(commandlist, settingRegistry, app);
            }

            if (!tracker.has(widget)) {
              // Track the state of the widget for later restoration
              tracker.add(widget);
            }
            if (!widget.isAttached) {
              /** Attach the widget to the main work area if it's not there */
              app.shell.add(widget as Widget, 'main');
            } else {
              widget.update();
            }
            /** Activate the widget */
            app.shell.activateById(widget.id);
          }
        });

        /** Add command to command palette */
        palette.addItem({ command, category: 'Settings' });

        /** Add command to settings menu */
        menu.settingsMenu.addGroup([{ command: command }], 999);

        /** Add command to help menu */
        menu.helpMenu.addGroup([{ command: command }], 7);
          
        if (restorer) {
          restorer.restore(tracker, {
            command,
            name: () => 'shortcutui'
          });
        }
      });
  },
  autoStart: true
};

/** Export the plugin as default */
export default plugin;
function createWidget(commandlist: string[], settingRegistry: ISettingRegistry, app: JupyterFrontEnd<JupyterFrontEnd.IShell>) {
  const widget: ShortcutWidget = new ShortcutWidget(-1, -1, commandlist, settingRegistry, app.commands, '@jupyterlab/shortcuts-extension:plugin', app);
  widget.id = 'jupyterlab-shortcutui';
  widget.title.label = 'Keyboard Shortcut Editor';
  widget.title.closable = true;
  return widget;
}

