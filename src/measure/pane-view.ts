import { Measure, MeasureOptions } from './measure';
import { MeasurePaneRenderer } from './pane-renderer';
import { TwoPointDrawingPaneView } from '../drawing/pane-view';

export class MeasurePaneView extends TwoPointDrawingPaneView {
	_source: Measure;

	constructor(source: Measure) {
		super(source)
		this._source = source
	}

	renderer() {
		return new MeasurePaneRenderer(
			this._p1,
			this._p2,
			this._source._options as MeasureOptions,
			this._source.hovered,
			this._source,
		);
	}
}
