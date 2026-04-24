<script lang="ts">
    import { getContext } from "svelte";
    import L, { type LeafletEvent, type LeafletMouseEvent, type MouseCoordsOptions } from "leaflet";
    
    const { getMap } = getContext<{ getMap: () => L.Map }>(L);

    L.Control.MouseCoords = L.Control.extend({
        options: {
            position: "topright",
            displayZoom: false,
        },

        onAdd: function(this: L.Control.MouseCoords, map: L.Map) {
            const className = "leaflet-control-mouse-coords";
            const container = L.DomUtil.create("div", className);
            container.setAttribute("role", "status");
            container.setAttribute("aria-label", "Mouse coordinates");

            this._output = L.DomUtil.create("div", `${className}__output`, container);

            map.on("mousemove", this._update, this);
            map.whenReady(this._update as () => void, this);

            return container;
        },

        _update: function(this: L.Control.MouseCoords, event?: LeafletEvent) {
            const zoom = this._map.getZoom();
            const coords = (event as LeafletMouseEvent | undefined)?.latlng ?? this._map.getCenter();
            this._output.textContent = `Mouse: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}${ this.options.displayZoom ? ` - Zoom: ${zoom}` : ""}`;
        },

        onRemove: function(this: L.Control.MouseCoords, map: L.Map) {
            map.off("mousemove", this._update, this);
        }
    }) as unknown as typeof L.Control.MouseCoords;

    L.control.mouseCoords = function(options?: MouseCoordsOptions) {
        return new L.Control.MouseCoords(options);
    };
    
    L.control.mouseCoords({ position: "bottomleft", displayZoom: true }).addTo(getMap());
</script>

<svelte:head>
    <style>
        .leaflet-control-mouse-coords {
            background: rgba(255, 255, 255, 1.0);
            border: 2px solid rgba(0, 0, 0, 0.35);
            padding: 2px 5px 1px;
            font-size: 14px;
            border-radius: 3px;
        }
    </style>
</svelte:head>