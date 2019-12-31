import { VDomRenderer, VDomModel } from '@jupyterlab/apputils';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { CommandRegistry } from '@lumino/commands';

import { IDisposable } from '@lumino/disposable';

import { Widget, Title, Menu } from '@lumino/widgets';

import * as React from 'react';

import * as ReactDOM from 'react-dom';

import { ShortcutUI } from './components/ShortcutUI';

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
    super(undefined);
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
    ReactDOM.render(this.reactComponent, this.node);
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
