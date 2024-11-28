import { ViewPoint } from "../drawing/pane-view";
import { CanvasRenderingTarget2D } from "fancy-canvas";
import { TwoPointDrawingPaneRenderer } from "../drawing/pane-renderer";
import { MeasureOptions } from "./measure";
import { Measure } from "./measure";
import { PriceFormatBuiltIn } from "lightweight-charts";

export class MeasurePaneRenderer extends TwoPointDrawingPaneRenderer {
	private _source: Measure | null = null;
	private readonly _colors = {
		positive: {
			fill: 'rgba(33, 150, 243, 0.2)',
			text: 'rgba(33, 150, 243, 1)',
		},
		negative: {
			fill: 'rgba(239, 83, 80, 0.2)',
			text: 'rgba(239, 83, 80, 1)',
		}
	};

	constructor(
		p1: ViewPoint,
		p2: ViewPoint,
		options: MeasureOptions,
		_hovered: boolean,
		source?: Measure
	) {
		super(p1, p2, options, _hovered);
		if (source) this._source = source;
	}

	draw(target: CanvasRenderingTarget2D) {
		target.useBitmapCoordinateSpace(scope => {
			if (
				this._p1.x == null ||
				this._p1.y == null ||
				this._p2.x == null ||
				this._p2.y == null
			)
				return;

			const scaled = this._getScaledCoordinates(scope);
			if (!scaled) return;

			const mainX = scaled.x1;
			const mainY = scaled.y1;
			const width = scaled.x2 - scaled.x1;
			const height = scaled.y2 - scaled.y1;
			const topY = Math.min(scaled.y1, scaled.y2); // Get the topmost Y coordinate

			// Display price and percentage
			if (this._source && this._source.series && this._source.p1 && this._source.p2) {
				const startPrice = this._source.p1.price;
				const endPrice = this._source.p2.price;
				const priceDiff = endPrice - startPrice;
				const priceDiffPercentage = (priceDiff / Math.abs(startPrice)) * 100;

				const priceFormat = this._source.series.options().priceFormat as PriceFormatBuiltIn;
				const precision = priceFormat.precision;

				const colors = priceDiffPercentage < 0 ? this._colors.negative : this._colors.positive;
				const textSymbol = priceDiffPercentage < 0 ? '↓' : '↑';


				const ctx = scope.context;
				ctx.fillStyle = colors.fill;

				// Draw box
				ctx.fillRect(mainX, mainY, width, height);

				// Draw cross lines
				ctx.beginPath();
				ctx.strokeStyle = colors.text;
				ctx.lineWidth = 1;

				// Vertical line
				const midX = mainX + width / 2;
				ctx.moveTo(midX, mainY);
				ctx.lineTo(midX, mainY + height);

				// Horizontal line
				const midY = mainY + height / 2;
				ctx.moveTo(mainX, midY);
				ctx.lineTo(mainX + width, midY);

				ctx.stroke();

				// Calculate measurements
				const barCount = Math.abs(this._source.p2.logical - this._source.p1.logical + 1);

				// Draw Text
				ctx.font = '14px Arial Bold';
				ctx.textAlign = 'center';

				// Prepare text strings
				const priceText = `${textSymbol} ${Math.abs(priceDiff).toFixed(precision)} (${priceDiffPercentage.toFixed(2)}%)`;
				const barText = `${barCount} bars`;

				// Measure text for background box
				const textWidth = Math.max(
					ctx.measureText(priceText).width,
					ctx.measureText(barText).width
				);

				// Draw background box
				const padding = 8;
				const lineHeight = 22;
				const boxHeight = lineHeight * 2 + padding;
				const boxX = mainX + width / 2 - textWidth / 2 - padding;
				const boxY = topY - boxHeight - 10; // Position box above the top of measurement box

				// Add slight rounded corners to the background
				const cornerRadius = 4;
				ctx.fillStyle = colors.text;
				ctx.beginPath();
				ctx.roundRect(boxX, boxY, textWidth + padding * 2, boxHeight, cornerRadius);
				ctx.fill();

				// Draw text in white
				ctx.fillStyle = '#FFFFFF';
				ctx.fillText(
					priceText,
					mainX + width / 2,
					boxY + lineHeight // Position relative to box top
				);

				ctx.fillText(
					barText,
					mainX + width / 2,
					boxY + lineHeight * 2 - padding / 2 // Position relative to box top
				);
			}


			if (!this._hovered) return;

			this._drawEndCircle(scope, mainX, mainY, 3);
			this._drawEndCircle(scope, mainX + width, mainY, 3);
			this._drawEndCircle(scope, mainX + width, mainY + height, 3);
			this._drawEndCircle(scope, mainX, mainY + height, 3);

		});
	}
}
