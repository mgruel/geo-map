<script>
    import { getContext } from "svelte";
    import L from "leaflet";
    
    const { getMap } = getContext(L);

    L.Control.Coords = L.Control.extend({
        options: {
            position: "topright",
            displayZoom: false,
            updateWhenIdle: false,
        },

        onAdd: function(map) {
            let className = "leaflet-control-coords";
            let container = L.DomUtil.create("div", className);

            this._addOutput(`${className}-output`, container);

            map.on(this.options.updateWhenIdle ? "dragend" : "drag", this._update, this);
            map.on(this.options.updateWhenIdle ? "zoomend" : "zoom", this._update, this);
            map.whenReady(this._update, this);

            return container;
        },

        _addOutput: function(className, container) {
            this._output = L.DomUtil.create("div", className, container);
        },

        _update: function() {
            let center = this._map.getCenter();
            let zoom = this._map.getZoom();
            this._output.innerHTML = `Center: ${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}${ this.options.displayZoom ? ` - Zoom: ${zoom}` : ""}`;
        },

        onRemove: function(map) {
            map.off(this.options.updateWhenIdle ? "dragend" : "drag", this._update, this);
            map.off(this.options.updateWhenIdle ? "zoomend" : "zoom", this._update, this);
        }
    });

    L.control.coords = function(options) {
        return new L.Control.Coords(options);
    };
    
    L.control.coords({ position: "bottomleft", displayZoom: true }).addTo(getMap());
</script>

<svelte:head>
    <style>
        .leaflet-control-coords {   
            background: rgba(255, 255, 255, 1.0);
            padding: 0 3px;
            margin-top: 0 !important;
            margin-bottom: 0 !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
        }
    </style>
</svelte:head>