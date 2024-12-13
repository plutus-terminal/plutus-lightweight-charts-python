import { DrawingTool } from "../drawing/drawing-tool";
import { TrendLine } from "../trend-line/trend-line";
import { Box } from "../box/box";
import { Measure } from "../measure/measure";
import { Drawing } from "../drawing/drawing";
import { ContextMenu } from "../context-menu/context-menu";
import { GlobalParams } from "./global-params";
import { IChartApi, ISeriesApi, SeriesType } from "lightweight-charts";
import { HorizontalLine } from "../horizontal-line/horizontal-line";
import { RayLine } from "../horizontal-line/ray-line";
import { VerticalLine } from "../vertical-line/vertical-line";


interface Icon {
    div: HTMLDivElement,
    group: SVGGElement,
    type: new (...args: any[]) => Drawing
}

declare const window: GlobalParams

type ModifierHotkey = {
    key: "shift" | "ctrl" | "alt";
    autoClick?: boolean;
}

export class ToolBox {
    private static readonly TREND_SVG: string = '<rect x="3.84" y="13.67" transform="matrix(0.7071 -0.7071 0.7071 0.7071 -5.9847 14.4482)" width="21.21" height="1.56"/><path d="M23,3.17L20.17,6L23,8.83L25.83,6L23,3.17z M23,7.41L21.59,6L23,4.59L24.41,6L23,7.41z"/><path d="M6,20.17L3.17,23L6,25.83L8.83,23L6,20.17z M6,24.41L4.59,23L6,21.59L7.41,23L6,24.41z"/>';
    private static readonly HORZ_SVG: string = '<rect x="4" y="14" width="9" height="1"/><rect x="16" y="14" width="9" height="1"/><path d="M11.67,14.5l2.83,2.83l2.83-2.83l-2.83-2.83L11.67,14.5z M15.91,14.5l-1.41,1.41l-1.41-1.41l1.41-1.41L15.91,14.5z"/>';
    private static readonly RAY_SVG: string = '<rect x="8" y="14" width="17" height="1"/><path d="M3.67,14.5l2.83,2.83l2.83-2.83L6.5,11.67L3.67,14.5z M7.91,14.5L6.5,15.91L5.09,14.5l1.41-1.41L7.91,14.5z"/>';
    private static readonly BOX_SVG: string = '<rect x="8" y="6" width="12" height="1"/><rect x="9" y="22" width="11" height="1"/><path d="M3.67,6.5L6.5,9.33L9.33,6.5L6.5,3.67L3.67,6.5z M7.91,6.5L6.5,7.91L5.09,6.5L6.5,5.09L7.91,6.5z"/><path d="M19.67,6.5l2.83,2.83l2.83-2.83L22.5,3.67L19.67,6.5z M23.91,6.5L22.5,7.91L21.09,6.5l1.41-1.41L23.91,6.5z"/><path d="M19.67,22.5l2.83,2.83l2.83-2.83l-2.83-2.83L19.67,22.5z M23.91,22.5l-1.41,1.41l-1.41-1.41l1.41-1.41L23.91,22.5z"/><path d="M3.67,22.5l2.83,2.83l2.83-2.83L6.5,19.67L3.67,22.5z M7.91,22.5L6.5,23.91L5.09,22.5l1.41-1.41L7.91,22.5z"/><rect x="22" y="9" width="1" height="11"/><rect x="6" y="9" width="1" height="11"/>';
    private static readonly VERT_SVG: string = ToolBox.RAY_SVG;
    private static readonly MEASURE_SVG: string = '<svg fill="#fff" height="24" width="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" xml:space="preserve" stroke="#fff"><g stroke-width="0"/><g stroke-linecap="round" stroke-linejoin="round" stroke="#CCC" stroke-width="10.24"/><path d="M190.88 37.149 154.851 1.12a3.824 3.824 0 0 0-5.409 0L1.12 149.442a3.824 3.824 0 0 0 0 5.409l36.028 36.029c.747.747 1.726 1.12 2.704 1.12s1.958-.373 2.704-1.12L190.878 42.558a3.825 3.825 0 0 0 0-5.409zM39.853 182.766l-30.62-30.62 15.742-15.742 5.71 5.711a3.8 3.8 0 0 0 2.704 1.12 3.824 3.824 0 0 0 2.704-6.529l-5.709-5.711 15.742-15.742 10.708 10.708a3.8 3.8 0 0 0 2.704 1.12 3.824 3.824 0 0 0 2.704-6.529l-10.708-10.708 15.742-15.742 5.711 5.711c.747.747 1.726 1.12 2.704 1.12s1.958-.373 2.704-1.12a3.824 3.824 0 0 0 0-5.409l-5.711-5.711 15.742-15.742 14.127 14.127a3.8 3.8 0 0 0 2.704 1.12 3.824 3.824 0 0 0 2.704-6.529L93.834 67.542 109.576 51.8l5.71 5.711c.747.747 1.726 1.12 2.704 1.12s1.958-.373 2.704-1.12a3.824 3.824 0 0 0 0-5.409l-5.711-5.711 15.742-15.742 14.126 14.127c.747.747 1.726 1.12 2.704 1.12s1.958-.373 2.704-1.12a3.824 3.824 0 0 0 0-5.409L136.14 25.238l16.007-16.005 30.62 30.62z"/><path d="m71.974 130.282-1.314-1.315a3.824 3.824 0 1 0-5.409 5.409l1.315 1.315c.747.747 1.726 1.12 2.704 1.12s1.958-.373 2.704-1.12a3.826 3.826 0 0 0 0-5.409z"/></svg>'


    div: HTMLDivElement;
    private activeIcon: Icon | null = null;

    private buttons: Record<string, HTMLDivElement> = {};

    private _commandFunctions: Function[];
    private _handlerID: string;

    private _drawingTool: DrawingTool;

    constructor(handlerID: string, chart: IChartApi, series: ISeriesApi<SeriesType>, commandFunctions: Function[]) {
        this._handlerID = handlerID;
        this._commandFunctions = commandFunctions;
        this._drawingTool = new DrawingTool(chart, series, () => this.removeActiveAndSave());
        this.div = this._makeToolBox();
        new ContextMenu(this.saveDrawings, this._drawingTool);

        // Add global click handler for modifier keys
        document.addEventListener('click', (event: MouseEvent) => {
            if (this._handlerID !== window.handlerInFocus) return;

            // Find any matching tool with the current modifier key
            const activeModifierTool = Object.values(this.buttons).find(button => {
                const modifierData = (button as any)._modifierHotkey as ModifierHotkey;
                return modifierData && event[`${modifierData.key}Key`];
            });

            if (activeModifierTool && !this.activeIcon) {
                const icon = (activeModifierTool as any)._icon;
                this._onIconClick(icon);
                if ((activeModifierTool as any)._modifierHotkey.autoClick && this._drawingTool) {
                    this._drawingTool.simulateClick(event);
                }
            }
        });

        commandFunctions.push((event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.code === 'KeyZ') {
                const drawingToDelete = this._drawingTool.drawings.pop();
                if (drawingToDelete) this._drawingTool.delete(drawingToDelete)
                return true;
            }
            return false;
        });
    }

    toJSON() {
        // Exclude the chart attribute from serialization
        const { ...serialized } = this;
        return serialized;
    }

    private _makeToolBox() {
        let div = document.createElement('div')
        div.classList.add('toolbox');
        this.buttons["measure"] = this._makeToolBoxElement(Measure, 'KeyM', ToolBox.MEASURE_SVG, false, { key: 'shift', autoClick: true });
        this.buttons["trendLine"] = this._makeToolBoxElement(TrendLine, 'KeyT', ToolBox.TREND_SVG);
        this.buttons["horizontalLine"] = this._makeToolBoxElement(HorizontalLine, 'KeyH', ToolBox.HORZ_SVG);
        this.buttons["rayLine"] = this._makeToolBoxElement(RayLine, 'KeyR', ToolBox.RAY_SVG);
        this.buttons["box"] = this._makeToolBoxElement(Box, 'KeyB', ToolBox.BOX_SVG);
        this.buttons["verticalLine"] = this._makeToolBoxElement(VerticalLine, 'KeyV', ToolBox.VERT_SVG, true);

        Object.values(this.buttons).forEach(button => {
            div.appendChild(button);
        });
        return div
    }

    hideButton(button_name: string) {
        const button = this.buttons[button_name];
        if (button) {
            button.classList.add('hidden');
        }
    }

    private _makeToolBoxElement(
        DrawingType: new (...args: any[]) => Drawing,
        keyCmd: string,
        paths: string,
        rotate = false,
        modifierHotkey: ModifierHotkey | null = null,
    ) {
        const elem = document.createElement('div')
        elem.classList.add("toolbox-button");
        this.buttons[DrawingType.name] = elem

        // Add tooltip
        const tooltipText = `(Alt+${keyCmd.replace('Key', '')})${modifierHotkey ? ` or (${modifierHotkey.key}+Click)` : ''
            }`;
        elem.title = tooltipText;

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "29");
        svg.setAttribute("height", "29");

        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.innerHTML = paths
        group.setAttribute("fill", window.pane.color)

        svg.appendChild(group)
        elem.appendChild(svg);

        const icon: Icon = { div: elem, group: group, type: DrawingType }

        // Store modifier hotkey and icon reference on the element for global handler
        if (modifierHotkey) {
            (elem as any)._modifierHotkey = modifierHotkey;
            (elem as any)._icon = icon;
        }

        elem.addEventListener('click', (event: MouseEvent) => {
            // Only handle regular clicks here, modifier clicks are handled globally
            if (!modifierHotkey || !event[`${modifierHotkey.key}Key`]) {
                this._onIconClick(icon);
            }
        });

        this._commandFunctions.push((event: KeyboardEvent) => {
            if (this._handlerID !== window.handlerInFocus) return false;

            if (event.altKey && event.code === keyCmd) {
                event.preventDefault()
                this._onIconClick(icon);
                return true
            }
            return false;
        })

        if (rotate == true) {
            svg.style.transform = 'rotate(90deg)';
            svg.style.transformBox = 'fill-box';
            svg.style.transformOrigin = 'center';
        }

        return elem
    }

    private _onIconClick(icon: Icon) {
        console.log(icon.type)
        if (this.activeIcon) {

            this.activeIcon.div.classList.remove('active-toolbox-button');
            window.setCursor('crosshair');
            this._drawingTool?.stopDrawing()
            if (this.activeIcon === icon) {
                this.activeIcon = null
                return
            }
        }
        this.activeIcon = icon
        this.activeIcon.div.classList.add('active-toolbox-button')
        window.setCursor('crosshair');
        this._drawingTool?.beginDrawing(this.activeIcon.type);
    }

    removeActiveAndSave = () => {
        window.setCursor('default');
        if (this.activeIcon) this.activeIcon.div.classList.remove('active-toolbox-button')
        this.activeIcon = null
        this.saveDrawings()
    }

    addNewDrawing(d: Drawing) {
        this._drawingTool.addNewDrawing(d);
    }

    clearDrawings() {
        this._drawingTool.clearDrawings();
    }

    repositionOnTime() {
        this._drawingTool.repositionOnTime();
    }

    saveDrawings = () => {
        const drawingMeta = []
        for (const d of this._drawingTool.drawings) {
            drawingMeta.push({
                type: d._type,
                points: d.points,
                options: d._options
            });
        }
        const string = JSON.stringify(drawingMeta);
        window.callbackFunction(`save_drawings${this._handlerID}_~_${string}`)
    }

    loadDrawings(drawings: any[]) { // TODO any
        drawings.forEach((d) => {
            switch (d.type) {
                case "Measure":
                    this._drawingTool.addNewDrawing(new Measure(d.points[0], d.points[1], d.options));
                case "Box":
                    this._drawingTool.addNewDrawing(new Box(d.points[0], d.points[1], d.options));
                    break;
                case "TrendLine":
                    this._drawingTool.addNewDrawing(new TrendLine(d.points[0], d.points[1], d.options));
                    break;
                case "HorizontalLine":
                    this._drawingTool.addNewDrawing(new HorizontalLine(d.points[0], d.options));
                    break;
                case "RayLine":
                    this._drawingTool.addNewDrawing(new RayLine(d.points[0], d.options));
                    break;
                case "VerticalLine":
                    this._drawingTool.addNewDrawing(new VerticalLine(d.points[0], d.options));
                    break;
            }
        })
    }
}
