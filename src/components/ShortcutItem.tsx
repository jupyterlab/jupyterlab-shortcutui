import { ShortcutObject, ErrorObject, TakenByObject } from '../index';

import { ShortcutInput } from './ShortcutInput';

import { Platform } from '@phosphor/domutils';

import { classes } from 'typestyle';

import * as React from 'react';

import {
  CellStyle,
  ShortcutCellStyle,
  EmptyShortcutCellStyle,
  SingleShortcutCellStyle,
  RowStyle,
  ErrorButtonStyle,
  ErrorMessageStyle,
  ConflictContainerStyle,
  ShortcutContainerStyle,
  ShortcutKeysContainerStyle,
  ShortcutKeysStyle,
  OrStyle,
  OrTwoStyle,
  CommaStyle,
  PlusStyle,
  SourceCellStyle,
  ResetStyle
} from '../componentStyle/ShortcutItemStyle';
import { IShortcutUIexternal } from '../ShortcutWidget';

/** Props for ShortcutItem component */
export interface IShortcutItemProps {
  shortcut: ShortcutObject | ErrorObject;
  handleUpdate: Function;
  resetShortcut: Function;
  deleteShortcut: Function;
  showSelectors: boolean;
  keyBindingsUsed: { [index: string]: TakenByObject };
  sortConflict: Function;
  clearConflicts: Function;
  errorSize: string;
  contextMenu: Function;
  external: IShortcutUIexternal;
}

/** State for ShortcutItem component */
export interface IShortcutItemState {
  displayNewInput: boolean;
  displayReplaceInputLeft: boolean;
  displayReplaceInputRight: boolean;
  numShortcuts: number;
}

export namespace CommandIDs {
  export const shortcutEditLeft = 'shortcutui:EditLeft';
  export const shortcutEditRight = 'shortcutui:EditRight';
  export const shortcutEdit = 'shortcutui:Edit';
  export const shortcutAddNew = 'shortcutui:AddNew';
  export const shortcutAddAnother = 'shortcutui:AddAnother';
  export const shortcutReset = 'shortcutui:Reset';
}

/** React component for each command shortcut item */
export class ShortcutItem extends React.Component<
  IShortcutItemProps,
  IShortcutItemState
> {
  constructor(props: any) {
    super(props);

    this.state = {
      displayNewInput: false,
      displayReplaceInputLeft: false,
      displayReplaceInputRight: false,
      numShortcuts: Object.keys(this.props.shortcut.keys).filter(
        key => this.props.shortcut.keys[key][0] !== ''
      ).length
    };
  }

  /** Toggle display state of input box */
  private toggleInputNew = (): void => {
    this.setState({
      displayNewInput: !this.state.displayNewInput
    });
  };

  private toggleInputReplaceLeft = (): void => {
    this.setState({
      displayReplaceInputLeft: !this.state.displayReplaceInputLeft
    });
  };

  private toggleInputReplaceRight = (): void => {
    this.setState({
      displayReplaceInputRight: !this.state.displayReplaceInputRight
    });
  };

  private handleRightClick = (e: any): void => {
    const key =
      this.props.shortcut.commandName + '_' + this.props.shortcut.selector;

    if (!this.props.external.hasCommand(CommandIDs.shortcutEdit + key)) {
      this.props.external.addCommand(CommandIDs.shortcutEdit + key, {
        label: 'Edit',
        caption: 'Edit existing sortcut',
        execute: () => {
          this.toggleInputReplaceLeft();
        }
      });
    }
    if (
      !this.props.external.hasCommand(CommandIDs.shortcutEditLeft + key)
    ) {
      this.props.external.addCommand(CommandIDs.shortcutEditLeft + key, {
        label: 'Edit First',
        caption: 'Edit existing shortcut',
        execute: () => {
          this.toggleInputReplaceLeft();
        }
      });
    }
    if (
      !this.props.external.hasCommand(CommandIDs.shortcutEditRight + key)
    ) {
      this.props.external.addCommand(CommandIDs.shortcutEditRight + key, {
        label: 'Edit Second',
        caption: 'Edit existing shortcut',
        execute: () => {
          this.toggleInputReplaceRight();
        }
      });
    }
    if (!this.props.external.hasCommand(CommandIDs.shortcutAddNew + key)) {
      this.props.external.addCommand(CommandIDs.shortcutAddNew + key, {
        label: 'Add',
        caption: 'Add new shortcut',
        execute: () => {
          this.toggleInputNew();
        }
      });
    }
    if (
      !this.props.external.hasCommand(CommandIDs.shortcutAddAnother + key)
    ) {
      this.props.external.addCommand(CommandIDs.shortcutAddAnother + key, {
        label: 'Add',
        caption: 'Add another shortcut',
        execute: () => {
          this.toggleInputNew();
        }
      });
    }
    if (!this.props.external.hasCommand(CommandIDs.shortcutReset + key)) {
      this.props.external.addCommand(CommandIDs.shortcutReset + key, {
        label: 'Reset',
        caption: 'Reset shortcut back to default',
        execute: () => {
          this.props.resetShortcut(this.props.shortcut);
        }
      });
    }

    this.setState(
      {
        numShortcuts: Object.keys(this.props.shortcut.keys).filter(
          key => this.props.shortcut.keys[key][0] !== ''
        ).length
      },
      () => {
        let commandList = [];
        if (this.state.numShortcuts == 2) {
          commandList = commandList.concat([
            CommandIDs.shortcutEditLeft + key,
            CommandIDs.shortcutEditRight + key
          ]);
        } else if (this.state.numShortcuts == 1) {
          commandList = commandList.concat([
            CommandIDs.shortcutEdit + key,
            CommandIDs.shortcutAddAnother + key
          ]);
        } else {
          commandList = commandList.concat([CommandIDs.shortcutAddNew + key]);
        }

        if (this.props.shortcut.source === 'Custom') {
          commandList = commandList.concat([CommandIDs.shortcutReset + key]);
        }

        this.props.contextMenu(e, commandList);
      }
    );
  };

  /** Transform special key names into unicode characters */
  toSymbols = (value: string): string => {
    return value.split(' ').reduce((result, key) => {
      if (key === 'Ctrl') {
        return (result + ' ⌃').trim();
      } else if (key === 'Alt') {
        return (result + ' ⌥').trim();
      } else if (key === 'Shift') {
        return (result + ' ⇧').trim();
      } else if (key === 'Accel' && Platform.IS_MAC) {
        return (result + ' ⌘').trim();
      } else if (key === 'Accel') {
        return (result + ' ⌃').trim();
      } else {
        return (result + ' ' + key).trim();
      }
    }, '');
  };

  getErrorRow(): JSX.Element {
    return (
      <div className={classes(RowStyle)}>
        <div
          className={ConflictContainerStyle(
            this.props.showSelectors,
            this.props.errorSize
          )}
        >
          <div className={ErrorMessageStyle}>
            {'Shortcut already in use by ' +
              (this.props.shortcut as ErrorObject).takenBy.takenByLabel +
              '. Overwrite it?'}
          </div>
          <div className={ErrorButtonStyle}>
            <button>Cancel</button>
            <button
              id="no-blur"
              onClick={() => {
                document.getElementById('overwrite').click();
              }}
            >
              Overwrite
            </button>
          </div>
        </div>
      </div>
    );
  }

  getCategoryCell(): JSX.Element {
    return <div className={CellStyle}>{this.props.shortcut.category}</div>;
  }

  getLabelCell(): JSX.Element {
    return (
      <div className={CellStyle}>
        <div className="jp-label">{this.props.shortcut.label}</div>
      </div>
    );
  }

  getResetShortCutLink(): JSX.Element {
    return (
      <a
        className={ResetStyle}
        onClick={() => this.props.resetShortcut(this.props.shortcut)}
      >
        Reset
      </a>
    );
  }

  getSourceCell(): JSX.Element {
    return (
      <div className={CellStyle}>
        <div className={SourceCellStyle}>{this.props.shortcut.source}</div>
        {this.props.shortcut.source === 'Custom' && this.getResetShortCutLink()}
      </div>
    );
  }

  getOptionalSelectorCell(): JSX.Element {
    return (
      this.props.showSelectors && (
        <div className={CellStyle}>
          <div className="jp-selector">{this.props.shortcut.selector}</div>
        </div>
      )
    );
  }

  getShortCutsCell(nonEmptyKeys: string[]): JSX.Element {
    return (
      <div className={CellStyle}>
        <div
          className={
            nonEmptyKeys.length === 0
              ? classes(ShortcutCellStyle, EmptyShortcutCellStyle)
              : nonEmptyKeys.length === 1
              ? classes(ShortcutCellStyle, SingleShortcutCellStyle)
              : ShortcutCellStyle
          }
        >
          {nonEmptyKeys.map((key, index) => (
            <div
              className={ShortcutContainerStyle}
              key={this.props.shortcut.id + '_' + index}
              onClick={() => {
                if (index == 0) {
                  this.toggleInputReplaceLeft();
                } else {
                  this.toggleInputReplaceRight();
                }
              }}
            >
              {!(
                (index === 0 && this.state.displayReplaceInputLeft) ||
                (index === 1 && this.state.displayReplaceInputRight)
              ) ? (
                this.props.shortcut.keys[key].map(
                  (keyBinding: string, index: number) => (
                    <div className={ShortcutKeysContainerStyle} key={index}>
                      <div className={ShortcutKeysStyle} id={'shortcut-keys'}>
                        {this.toSymbols(keyBinding)}
                      </div>
                      {index + 1 < this.props.shortcut.keys[key].length ? (
                        <div className={CommaStyle}>,</div>
                      ) : null}
                    </div>
                  )
                )
              ) : (
                <ShortcutInput
                  handleUpdate={this.props.handleUpdate}
                  deleteShortcut={this.props.deleteShortcut}
                  toggleInput={
                    index === 0
                      ? this.toggleInputReplaceLeft
                      : this.toggleInputReplaceRight
                  }
                  shortcut={this.props.shortcut}
                  shortcutId={key}
                  toSymbols={this.toSymbols}
                  keyBindingsUsed={this.props.keyBindingsUsed}
                  sortConflict={this.props.sortConflict}
                  clearConflicts={this.props.clearConflicts}
                  displayInput={
                    index === 0
                      ? this.state.displayReplaceInputLeft
                      : this.state.displayReplaceInputRight
                  }
                  newOrReplace={'replace'}
                  placeholder={this.toSymbols(
                    this.props.shortcut.keys[key].join(', ')
                  )}
                />
              )}
              {index === 0 && (
                <div
                  className={
                    nonEmptyKeys.length == 2 || this.state.displayNewInput
                      ? OrTwoStyle
                      : OrStyle
                  }
                  id={
                    nonEmptyKeys.length == 2
                      ? 'secondor'
                      : this.state.displayReplaceInputLeft
                      ? 'noor'
                      : 'or'
                  }
                >
                  or
                </div>
              )}
            </div>
          ))}

          {nonEmptyKeys.length === 1 &&
            !this.state.displayNewInput &&
            !this.state.displayReplaceInputLeft && (
              <a
                className={!this.state.displayNewInput ? PlusStyle : ''}
                onClick={() => {
                  this.toggleInputNew(), this.props.clearConflicts();
                }}
                id="add-link"
              >
                Add
              </a>
            )}
          {nonEmptyKeys.length === 0 && !this.state.displayNewInput && (
            <a
              className={!this.state.displayNewInput ? PlusStyle : ''}
              onClick={() => {
                this.toggleInputNew(), this.props.clearConflicts();
              }}
              id="add-link"
            >
              Add
            </a>
          )}

          {/** Display input box when toggled */}
          {this.state.displayNewInput && (
            <ShortcutInput
              handleUpdate={this.props.handleUpdate}
              deleteShortcut={this.props.deleteShortcut}
              toggleInput={this.toggleInputNew}
              shortcut={this.props.shortcut}
              shortcutId=""
              toSymbols={this.toSymbols}
              keyBindingsUsed={this.props.keyBindingsUsed}
              sortConflict={this.props.sortConflict}
              clearConflicts={this.props.clearConflicts}
              displayInput={this.state.displayNewInput}
              newOrReplace={'new'}
              placeholder={''}
            />
          )}
        </div>
      </div>
    );
  }

  render() {
    const nonEmptyKeys = Object.keys(this.props.shortcut.keys).filter(
      (key: string) => this.props.shortcut.keys[key][0] !== ''
    );
    if (this.props.shortcut.id === 'error_row') {
      return this.getErrorRow();
    } else {
      return (
        <div
          className={RowStyle}
          onContextMenu={e => {
            e.persist();
            this.handleRightClick(e);
          }}
        >
          {this.getCategoryCell()}
          {this.getLabelCell()}
          {this.getShortCutsCell(nonEmptyKeys)}
          {this.getSourceCell()}
          {this.getOptionalSelectorCell()}
        </div>
      );
    }
  }
}
