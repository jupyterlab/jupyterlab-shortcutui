import { VDomRenderer, VDomModel } from '@jupyterlab/apputils';

import * as React from 'react';

import { ShortcutUI } from './components/ShortcutUI';

import { ISettingRegistry } from '@jupyterlab/coreutils';

import { CommandRegistry } from '@phosphor/commands';

import { Widget, Title, Menu } from '@phosphor/widgets';

import * as ReactDOM from 'react-dom';
import { IDisposable } from '@phosphor/disposable';

/** All external actions, setting commands, getting command list ... */
export interface IShortcutUIexternal {
  getAllShortCutSettings: () => Promise<ISettingRegistry.ISettings>;
  removeShortCut: (key: String) => Promise<void>;
  openAdvanced: () => void;
  createMenu: () => Menu;
  hasCommand: (id: string) => boolean;
  addCommand: (
    id: string,
    options: CommandRegistry.ICommandOptions
  ) => IDisposable;
  getLabel: (id: string) => string;
}

export default class ShortcutWidget extends VDomRenderer<VDomModel> {
  height: number;
  width: number;
  external: IShortcutUIexternal;
  id: string;
  isAttached: boolean;
  title: Title<Widget>;
  reactComponent: React.ReactElement<any>;

  constructor(external: IShortcutUIexternal) {
    super();
    this.height = -1;
    this.width = -1;
    this.external = external;
  }

  protected onUpdateRequest(): void {
    this.reactComponent = (
      <ShortcutUI
        external={this.external}
        height={this.height}
        width={this.width}
      />
    );
    ReactDOM.render(
      this.reactComponent,
      document.getElementById('jupyterlab-shortcutui')
    );
    this.render();
  }

  protected onResize(msg: Widget.ResizeMessage): void {
    this.height = msg.height;
    this.width = msg.width;
    super.update();
  }

  render() {
    return this.reactComponent;
  }
}
