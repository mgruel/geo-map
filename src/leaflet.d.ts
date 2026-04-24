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

    interface PhotonFeature {
        geometry: { type: 'Point'; coordinates: [number, number] };
        properties: {
            name?: string;
            city?: string;
            state?: string;
            country?: string;
            postcode?: string;
            osm_id?: number;
            osm_type?: string;
        };
    }

    interface GeoSearchOptions extends ControlOptions {
        minChars: number;
        debounceMs: number;
        limit: number;
        zoom: number;
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

        class GeoSearch extends Control<GeoSearchOptions> {
            _map: Map;
            _container: HTMLDivElement;
            _input: HTMLInputElement;
            _listbox: HTMLUListElement;
            _listboxId: string;
            _features: PhotonFeature[];
            _activeIndex: number;
            _debounceTimer: ReturnType<typeof setTimeout> | null;
            _abort: AbortController | null;
            _onInput(): void;
            _onFocus(): void;
            _onKeydown(event: Event): void;
            _onListboxMouseDown(event: Event): void;
            _onListboxClick(event: Event): void;
            _search(query: string): Promise<void>;
            _renderResults(features: PhotonFeature[]): void;
            _showListbox(): void;
            _hideListbox(): void;
            _moveActive(delta: number): void;
            _setActive(index: number): void;
            _select(index: number): void;
            _clear(): void;
            constructor(options?: Partial<GeoSearchOptions>);
        }
    }

    namespace control {
        function coords(options?: CoordsOptions): Control.Coords;
        function geoSearch(options?: Partial<GeoSearchOptions>): Control.GeoSearch;
        function jumpTo(options?: ControlOptions): Control.JumpTo;
        function mouseCoords(options?: MouseCoordsOptions): Control.MouseCoords;
        function zoomInfo(options?: ZoomInfoOptions): Control.ZoomInfo;
    }
}
