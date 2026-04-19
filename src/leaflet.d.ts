import 'leaflet';

declare module 'leaflet' {
    interface CoordsOptions extends ControlOptions {
        displayZoom?: boolean;
        updateWhenIdle?: boolean;
    }

    interface MouseCoordsOptions extends ControlOptions {
        displayZoom?: boolean;
    }

    interface ZoomInfoOptions extends ControlOptions {
        updateWhenIdle?: boolean;
    }

    namespace Control {
        class Coords extends Control<CoordsOptions> {
            _map: Map;
            _output: HTMLDivElement;
            _update(): void;
            constructor(options?: CoordsOptions);
        }

        class JumpTo extends Control {
            _map: Map;
            _label: HTMLSpanElement;
            _input: HTMLInputElement;
            _addLabel(className: string, container: HTMLElement): void;
            _addInput(className: string, container: HTMLElement): void;
            _handleInput(event: Event): void;
            _update(event: Event): void;
            constructor(options?: ControlOptions);
        }

        class MouseCoords extends Control<MouseCoordsOptions> {
            _map: Map;
            _output: HTMLDivElement;
            _update(event?: LeafletEvent): void;
            constructor(options?: MouseCoordsOptions);
        }

        class ZoomInfo extends Control<ZoomInfoOptions> {
            _map: Map;
            _output: HTMLDivElement;
            _update(): void;
            constructor(options?: ZoomInfoOptions);
        }
    }

    namespace control {
        function coords(options?: CoordsOptions): Control.Coords;
        function jumpTo(options?: ControlOptions): Control.JumpTo;
        function mouseCoords(options?: MouseCoordsOptions): Control.MouseCoords;
        function zoomInfo(options?: ZoomInfoOptions): Control.ZoomInfo;
    }
}
