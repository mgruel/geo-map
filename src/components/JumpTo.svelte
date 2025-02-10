<script lang="ts">
    import L from "leaflet";
    import { getContext } from "svelte";
    
    const { getMap } = getContext<{ getMap: () => L.Map }>(L);

    L.Control.JumpTo = L.Control.extend({
        options: {
            position: "topleft"
        },

        onAdd: function () {
            const className = "leaflet-control-jump-to";
            const container = L.DomUtil.create("div", className);

            this._addLabel(`${className}__label`, container);
            this._addInput(`${className}__input`, container);

            return container;
        },

        _addLabel: function (className: string, container: HTMLElement) {
            this._label = L.DomUtil.create("span", className, container);
            this._label.innerHTML = "Jump to:";
        },

        _addInput: function (className: string, container: HTMLElement) {
            this._input = L.DomUtil.create("input", className, container);
            L.DomEvent.on(this._input, {
                "beforeinput": this._handleInput,
                "keydown": this._update,
            }, this);
        },

        _handleInput: function (event: KeyboardEvent) {
            if(event.inputType === 'insertText' && !/^[\d,.]$/.test(event.data ?? '')) {
                event.preventDefault();
            }
            return;
        },

        _update: function (event: KeyboardEvent) {
            switch (event.key) {
                case "Enter": {
                    const coords = this._input?.value.split(",");
                    if (coords.length >= 2) {
                        this._map.flyTo(coords, this._map.getZoom(), { animate: true });
                        this._input.value = null;
                    }
                }
            }
        },

        onRemove: function () {
            L.DomEvent.off(this._input, {
                "beforeinput": this._handleInput,
                "keydown": this._update,
            }, this);
        }
    });

    L.control.jumpTo = function(options) {
        return new L.Control.JumpTo(options);
    };
    
    L.control.jumpTo({ position: "topleft" }).addTo(getMap());
</script>

<svelte:head>
    <style>
        .leaflet-control-jump-to {
            background: rgba(255, 255, 255, 1.0);
            border: 2px solid rgba(0, 0, 0, 0.35);
            padding: 2px 5px 1px;
            font-size: 14px;
            border-radius: 3px;
        }

        .leaflet-control-jump-to__input,
        .leaflet-control-jump-to__input:active,
        .leaflet-control-jump-to__input:focus {
            outline: none !important;
            border: 0;
            margin-left: 2px;
        }
    </style>
</svelte:head>