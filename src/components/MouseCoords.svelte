<script lang="ts">
    import { getContext } from "svelte";
    import L, { type ControlOptions, type LeafletEvent } from "leaflet";
    
    const { getMap } = getContext<{ getMap: () => L.Map }>(L);

    L.Control.MouseCoords = L.Control.extend({
        options: {
            position: "topright",
            displayZoom: false,
        },

        onAdd: function(map: L.Map) {
            const className = "leaflet-control-mouse-coords";
            const container = L.DomUtil.create("div", className);

            this._output = L.DomUtil.create("div", `${className}__output`, container);

            map.on("mousemove", this._update, this);
            map.whenReady(this._update, this);

            return container;
        },

        _update: function(event?: LeafletEvent) {
            const zoom = this._map.getZoom();
            const coords = event?.latlng ?? this._map.getCenter();
            this._output.innerHTML = `Mouse: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}${ this.options.displayZoom ? ` - Zoom: ${zoom}` : ""}`;
        },

        onRemove: function(map: L.Map) {
            map.off("mousemove", this._update, this);
        }
    });

    L.control.mouseCoords = function(options: ControlOptions) {
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