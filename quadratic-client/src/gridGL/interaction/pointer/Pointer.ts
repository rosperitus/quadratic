import { Viewport } from 'pixi-viewport';
import { InteractionEvent } from 'pixi.js';
import { pixiApp } from '../../pixiApp/PixiApp';
import { PointerAutoComplete } from './PointerAutoComplete/PointerAutoComplete';
import { PointerDown } from './PointerDown';
import { PointerHeading } from './PointerHeading';
import { PointerHtmlCells } from './PointerHtmlCells';

export class Pointer {
  pointerHeading: PointerHeading;
  pointerAutoComplete: PointerAutoComplete;
  pointerHtmlCells: PointerHtmlCells;

  pointerDown: PointerDown;

  constructor(viewport: Viewport) {
    this.pointerHeading = new PointerHeading();
    this.pointerAutoComplete = new PointerAutoComplete();
    this.pointerDown = new PointerDown();
    this.pointerHtmlCells = new PointerHtmlCells();

    viewport.on('pointerdown', this.handlePointerDown);
    viewport.on('pointermove', this.pointerMove);
    viewport.on('pointerup', this.pointerUp);
    viewport.on('pointerupoutside', this.pointerUp);
  }

  destroy() {
    const viewport = pixiApp.viewport;
    viewport.off('pointerdown', this.handlePointerDown);
    viewport.off('pointermove', this.pointerMove);
    viewport.off('pointerup', this.pointerUp);
    viewport.off('pointerupoutside', this.pointerUp);
    this.pointerDown.destroy();
  }

  // check if more than one touch point (let the viewport handle the event)
  private isMoreThanOneTouch(e: InteractionEvent): boolean {
    return e.data.pointerType === 'touch' && (e.data.originalEvent as TouchEvent).touches.length > 1;
  }

  private handlePointerDown = (e: InteractionEvent): void => {
    if (this.isMoreThanOneTouch(e)) return;
    const world = pixiApp.viewport.toWorld(e.data.global);
    const event = e.data.originalEvent as PointerEvent;
    this.pointerHtmlCells.pointerDown(e) ||
      this.pointerHeading.pointerDown(world, event) ||
      this.pointerAutoComplete.pointerDown(world) ||
      this.pointerDown.pointerDown(world, event);
  };

  private pointerMove = (e: InteractionEvent): void => {
    if (this.isMoreThanOneTouch(e)) return;
    const world = pixiApp.viewport.toWorld(e.data.global);
    this.pointerHtmlCells.pointerMove(e) ||
      this.pointerHeading.pointerMove(world) ||
      this.pointerAutoComplete.pointerMove(world) ||
      this.pointerDown.pointerMove(world);

    // change the cursor based on pointer priority
    const cursor =
      pixiApp.pointer.pointerHtmlCells.cursor ??
      pixiApp.pointer.pointerHeading.cursor ??
      pixiApp.pointer.pointerAutoComplete.cursor;
    pixiApp.canvas.style.cursor = cursor ?? 'unset';
  };

  private pointerUp = (e: InteractionEvent): void => {
    if (this.isMoreThanOneTouch(e)) return;
    this.pointerHtmlCells.pointerUp() ||
      this.pointerHeading.pointerUp() ||
      this.pointerAutoComplete.pointerUp() ||
      this.pointerDown.pointerUp();
  };

  handleEscape(): boolean {
    return (
      this.pointerHtmlCells.handleEscape() ||
      this.pointerHeading.handleEscape() ||
      this.pointerAutoComplete.handleEscape()
    );
  }

  getCursor(): string {
    return this.pointerHeading.cursor || this.pointerAutoComplete.cursor || 'default';
  }
}
