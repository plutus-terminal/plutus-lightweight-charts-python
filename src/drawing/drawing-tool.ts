import {
    Coordinate,
    IChartApi,
    ISeriesApi,
    Logical,
    MouseEventParams,
    SeriesType,
    Time,
} from 'lightweight-charts';
import { Drawing, InteractionType } from './drawing';
import { HorizontalLine } from '../horizontal-line/horizontal-line';


export class DrawingTool {
    private _chart: IChartApi;
    private _series: ISeriesApi<SeriesType>;
    private _finishDrawingCallback: Function | null = null;

    private _drawings: Drawing[] = [];
    private _activeDrawing: Drawing | null = null;
    private _isDrawing: boolean = false;
    private _drawingType: (new (...args: any[]) => Drawing) | null = null;

    constructor(chart: IChartApi, series: ISeriesApi<SeriesType>, finishDrawingCallback: Function | null = null) {
        this._chart = chart;
        this._series = series;
        this._finishDrawingCallback = finishDrawingCallback;

        this._chart.subscribeClick(this._clickHandler);
        this._chart.subscribeCrosshairMove(this._moveHandler);

        // Add keyboard event listener for delete key
        document.addEventListener('keydown', (event: KeyboardEvent) => {
            if (event.key === 'Delete' && Drawing.hoveredObject) {
                this.delete(Drawing.hoveredObject);
            }
        });
    }

    private _clickHandler = (param: MouseEventParams) => this._onClick(param);
    private _moveHandler = (param: MouseEventParams) => this._onMouseMove(param);

    beginDrawing(DrawingType: new (...args: any[]) => Drawing) {
        this._drawingType = DrawingType;
        this._isDrawing = true;
    }

    stopDrawing() {
        this._isDrawing = false;
        this._activeDrawing = null;
    }

    get drawings() {
        return this._drawings;
    }

    addNewDrawing(drawing: Drawing) {
        this._series.attachPrimitive(drawing);
        this._drawings.push(drawing);
    }

    delete(d: Drawing | null) {
        if (d == null) return;
        const idx = this._drawings.indexOf(d);
        if (idx == -1) return;

        // First detach the drawing to prevent any further interactions
        d.detach();

        // Then remove it from our array
        this._drawings.splice(idx, 1);

        // Delete drawing from chart
        this._series.detachPrimitive(d);
        if (!this._finishDrawingCallback) return;
        this._finishDrawingCallback();
    }

    clearDrawings() {
        for (const d of this._drawings) d.detach();
        this._drawings = [];
    }

    simulateClick(event: MouseEvent) {
        if (!this._isDrawing) return;
        const rect = this._chart.timeScale().getVisibleLogicalRange();
        if (!rect) return;

        // Get chart container's bounding rect
        const chartContainer = (this._chart as any).chartElement();
        const containerRect = chartContainer.getBoundingClientRect();

        // Convert screen coordinates to chart-relative coordinates
        const x = event.clientX - containerRect.left;
        const y = event.clientY - containerRect.top;

        const param: MouseEventParams = {
            time: this._chart.timeScale().coordinateToTime(x) as Time | undefined,
            logical: this._chart.timeScale().coordinateToLogical(x) as Logical,
            point: {
                x: x as Coordinate,
                y: y as Coordinate,
            },
            hoveredObjectId: undefined,
        } as MouseEventParams;
        this._clickHandler(param);
    }

    repositionOnTime() {
        for (const drawing of this.drawings) {
            const newPoints = []
            for (const point of drawing.points) {
                if (!point) {
                    newPoints.push(point);
                    continue;
                }

                let logical: Logical | undefined;
                let timeCoordinate: Coordinate | undefined;

                if (point.time) {
                    timeCoordinate = this._chart.timeScale().timeToCoordinate(point.time) ?? undefined;
                    logical = this._chart.timeScale().coordinateToLogical(timeCoordinate ?? NaN) ?? undefined;
                } else if (point.logical !== undefined) {
                    timeCoordinate = this._chart.timeScale().logicalToCoordinate(point.logical) ?? undefined;
                    logical = point.logical;
                }

                newPoints.push({
                    time: point.time,
                    logical: logical ?? point.logical,
                    price: point.price,
                    x: timeCoordinate,
                })
            }

            drawing.updatePoints(...newPoints);
        }
    }

    private _onClick(param: MouseEventParams) {
        if (!this._isDrawing) return;

        const point = Drawing._eventToPoint(param, this._series);
        if (!point) return;

        if (this._activeDrawing == null) {
            if (this._drawingType == null) return;

            this._activeDrawing = new this._drawingType(point, point);
            this._series.attachPrimitive(this._activeDrawing);
            if (this._drawingType == HorizontalLine) this._onClick(param);
        }
        else {
            this._drawings.push(this._activeDrawing);
            this.stopDrawing();

            if (!this._finishDrawingCallback) return;
            this._finishDrawingCallback();
        }
    }

    private _onMouseMove(param: MouseEventParams) {
        if (!param) return;

        let drawingDragged = false;

        // Only process hover interactions for drawings that are still attached
        for (const drawing of this._drawings) {
            if (drawing.series) { // Check if drawing is still attached
                const interactionType = drawing._handleHoverInteraction(param);

                if (interactionType === InteractionType.DRAG) {
                    drawingDragged = true;
                }
            }
        }

        // Trigger save if a drawing is being dragged
        if (!this._isDrawing && drawingDragged && this._finishDrawingCallback) {
            this._finishDrawingCallback();
        }

        if (!this._isDrawing || !this._activeDrawing) {
            return;
        }

        const point = Drawing._eventToPoint(param, this._series);
        if (!point) return;
        this._activeDrawing.updatePoints(null, point);
    }

}
