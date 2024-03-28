<script>
    import { getContext } from "svelte";
    import L from "leaflet";
    
    const { getMap } = getContext(L);

    L.Control.MouseCoords = L.Control.extend({
        options: {
            position: "topright"
        },

        onAdd: function(map) {
            let className = "leaflet-control-mouse-coords";
            let container = L.DomUtil.create("div", className);

            this._addOutput(`${className}-output`, container);

            map.on("mousemove", this._update, this);
            map.whenReady(this._update, this);

            return container;
        },

        _addOutput: function(className, container) {
            this._output = L.DomUtil.create("div", className, container);
        },

        _update: function(event) {
            if (event) {
                let coords = event.latlng ?? this._map.getCenter();
                this._output.innerHTML = `Mouse: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
            } else {
                let coords = this._map.getCenter();	
                this._output.innerHTML = `Center: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
            }
        },

        onRemove: function(map) {
            map.off("mousemove", this._update, this);
        }
    });

    L.control.mouseCoords = function(options) {
        return new L.Control.MouseCoords(options);
    };
    
    L.control.mouseCoords({ position: "bottomleft" }).addTo(getMap());
</script>

<svelte:head>
    <style>
        .leaflet-control-mouse-coords-output {
            background: rgba(255, 255, 255, 1.0);
            border: 2px solid rgba(0, 0, 0, 0.35);
            padding: 2px 5px 1px;
            font-size: 14px;
            border-radius: 3px;
        }
    </style>
</svelte:head>