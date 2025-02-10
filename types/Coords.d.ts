import 'leaflet';

declare module 'leaflet' {
    interface CoordsOptions {
        position?: ControlPosition;
        displayZoom: boolean;
        updateWhenIdle: boolean;
    }

    namespace control {
        function coords(options?: CoordsOptions): Control.Coords;
    }

    namespace Control {
        function coords(options?: CoordsOptions): Coords;

        class Coords extends Control {
            _map: Map;
            _output: HTMLDivElement;

            constructor(options?: CoordsOptions);
        }
    }
}