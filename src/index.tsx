import {
  ILayoutRestorer,
  JupyterFrontEndPlugin,
  JupyterFrontEnd
} from '@jupyterlab/application';

import {
  ICommandPalette,
  MainAreaWidget,
  WidgetTracker
} from '@jupyterlab/apputils';

import { IMainMenu } from '@jupyterlab/mainmenu';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { CommandRegistry } from '@lumino/commands';

import { Widget, Menu } from '@lumino/widgets';

import ShortcutWidget, { IShortcutUIexternal } from './ShortcutWidget';

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

  constructor(shortcut?: ShortcutObject) {
    if (shortcut) {
      this.takenBy = shortcut;
      this.takenByKey = '';
      this.takenByLabel = shortcut.category + ': ' + shortcut.label;
      this.id = shortcut.commandName + '_' + shortcut.selector;
    } else {
      this.takenBy = new ShortcutObject();
      this.takenByKey = '';
      this.takenByLabel = '';
      this.id = '';
    }
  }
}

/** Main plugin for extension */
const plugin: JupyterFrontEndPlugin<void> = {
  id: '@jupyterlab/jupyterlab-shortcutui:plugin',
  requires: [ISettingRegistry, ICommandPalette, IMainMenu],
  optional: [ILayoutRestorer],
  activate: activate,
  autoStart: true
};

function activate(
  app: JupyterFrontEnd,
  settingRegistry: ISettingRegistry,
  palette: ICommandPalette,
  menu: IMainMenu,
  restorer: ILayoutRestorer | null
): void {
  const command = 'shortcutui:open-ui';
  const label = 'Keyboard Shortcut Editor';
  let widget: MainAreaWidget<ShortcutWidget>;
  // Track and restore the widget state
  const tracker = new WidgetTracker<MainAreaWidget<ShortcutWidget>>({
    namespace: 'shortcutui'
  });

  /** Add command to open extension's widget */
  app.commands.addCommand(command, {
    label: label,
    execute: async () => {
      if (widget == undefined || !widget.isAttached) {
        widget = createWidget(settingRegistry, label, app);
      }

      if (!tracker.has(widget)) {
        // Track the state of the widget for later restoration
        tracker.add(widget);
      }
      if (!widget.isAttached) {
        /** Attach the widget to the main work area if it's not there */
        app.shell.add(widget as Widget);
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
}

function getExternalForJupyterLab(
  settingRegistry: ISettingRegistry,
  app: JupyterFrontEnd
): IShortcutUIexternal {
  const { commands } = app;
  const shortcutPluginLocation = '@jupyterlab/shortcuts-extension:shortcuts';
  return {
    getAllShortCutSettings: () =>
      settingRegistry.reload(shortcutPluginLocation),
    removeShortCut: (key: string) =>
      settingRegistry.remove(shortcutPluginLocation, key),
    openAdvanced: () => app.commands.execute('settingeditor:open'),
    createMenu: () => new Menu({ commands }),
    hasCommand: (id: string) => commands.hasCommand(id),
    addCommand: (id: string, options: CommandRegistry.ICommandOptions) =>
      commands.addCommand(id, options),
    getLabel: (id: string) => commands.label(id)
  };
}

function createWidget(
  settingRegistry: ISettingRegistry,
  label: string,
  app: JupyterFrontEnd
): MainAreaWidget<ShortcutWidget> {
  const widget: ShortcutWidget = new ShortcutWidget(
    getExternalForJupyterLab(settingRegistry, app)
  );
  widget.id = 'jupyterlab-shortcutui';
  widget.title.label = label;
  widget.title.closable = true;
  return new MainAreaWidget({ content: widget });
}

/** Export the plugin as default */
export default plugin;
