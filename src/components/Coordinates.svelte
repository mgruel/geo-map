<script lang="ts">
    import L from "leaflet";
    import { getContext } from "svelte";
    
    const { getMap } = getContext<{ getMap: () => L.Map }>(L);

    L.Control.Coords = L.Control.extend({
        options: {
            position: "topright",
            displayZoom: false,
            updateWhenIdle: false,
        },

        onAdd: function(map: L.Map) {
            const className = "leaflet-control-coords";
            const container = L.DomUtil.create("div", className);

            this._output = L.DomUtil.create("div", `${className}__output`, container);

            map.on(this.options.updateWhenIdle ? "dragend" : "drag", this._update, this);
            map.on(this.options.updateWhenIdle ? "zoomend" : "zoom", this._update, this);
            map.whenReady(this._update, this);

            return container;
        },

        _update: function() {
            const center = this._map.getCenter();
            const zoom = this._map.getZoom();
            this._output.innerHTML = `Center: ${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}${ this.options.displayZoom ? ` - Zoom: ${zoom}` : ""}`;
        },

        onRemove: function(map: L.Map) {
            map.off(this.options.updateWhenIdle ? "dragend" : "drag", this._update, this);
            map.off(this.options.updateWhenIdle ? "zoomend" : "zoom", this._update, this);
        }
    });

    L.control.coords = function(options) {
        return new L.Control.Coords(options);
    };
    
    L.control.coords({ position: "bottomleft" }).addTo(getMap());
</script>

<svelte:head>
    <style>
        .leaflet-control-coords {
            background: rgba(255, 255, 255, 1.0);
            border: 2px solid rgba(0, 0, 0, 0.35);
            padding: 2px 5px 1px;
            font-size: 14px;
            border-radius: 3px;
        }
    </style>
</svelte:head>