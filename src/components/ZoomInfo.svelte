<script lang="ts">
    import { getContext } from "svelte";
    import L from "leaflet";
    
    const { getMap } = getContext<{ getMap: () => L.Map }>(L);

    L.Control.ZoomInfo = L.Control.extend({
        options: {
            position: "topright",
            updateWhenIdle: false,
        },

        onAdd: function(map: L.Map) {
            const className = "leaflet-control-zoom-info";
            const container = L.DomUtil.create("div", className);

            this._output = L.DomUtil.create('div', `${className}__output`, container);

            map.on(this.options.updateWhenIdle ? "dragend" : "drag", this._update, this);
            map.on(this.options.updateWhenIdle ? "zoomend" : "zoom", this._update, this);
            map.whenReady(this._update, this);

            return container;
        },

        _update: function() {
            const zoom = this._map.getZoom();
            this._output.innerHTML = `Zoom: ${zoom}`;
        },

        onRemove: function(map: L.Map) {
            map.off(this.options.updateWhenIdle ? "dragend" : "drag", this._update, this);
            map.off(this.options.updateWhenIdle ? "zoomend" : "zoom", this._update, this);
        }
    });

    L.control.zoomInfo = function(options) {
        return new L.Control.ZoomInfo(options);
    };
    
    L.control.zoomInfo({ position: "bottomleft" }).addTo(getMap());
</script>

<svelte:head>
    <style>
        .leaflet-control-zoom-info {
            background: rgba(255, 255, 255, 1.0);
            border: 2px solid rgba(0, 0, 0, 0.35);
            padding: 2px 5px 1px;
            font-size: 14px;
            border-radius: 3px;
        }
    </style>
</svelte:head>