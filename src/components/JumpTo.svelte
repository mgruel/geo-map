<script lang="ts">
    import L from "leaflet";
    import { getContext } from "svelte";
    
    const { getMap } = getContext<{ getMap: () => L.Map }>(L);

    L.Control.JumpTo = L.Control.extend({
        options: {
            position: "topleft"
        },

        onAdd: function (this: L.Control.JumpTo) {
            const className = "leaflet-control-jump-to";
            const container = L.DomUtil.create("div", className);

            this._addLabel(`${className}__label`, container);
            this._addInput(`${className}__input`, container);

            return container;
        },

        _addLabel: function (this: L.Control.JumpTo, className: string, container: HTMLElement) {
            this._label = L.DomUtil.create("span", className, container);
            this._label.textContent = "Jump to:";
        },

        _addInput: function (this: L.Control.JumpTo, className: string, container: HTMLElement) {
            this._input = L.DomUtil.create("input", className, container);
            L.DomEvent.on(this._input, {
                "beforeinput": this._handleInput,
                "keydown": this._update,
            }, this);
        },

        _handleInput: function (event: Event) {
            const input = event as InputEvent;
            if(input.inputType === 'insertText' && !/^[\d,.]$/.test(input.data ?? '')) {
                event.preventDefault();
            }
            return;
        },

        _update: function (this: L.Control.JumpTo, event: Event) {
            const key = (event as KeyboardEvent).key;
            switch (key) {
                case "Enter": {
                    const parts = this._input?.value.split(",");
                    if (parts.length !== 2) {
                        return;
                    }
                    const lat = parseFloat(parts[0]);
                    const lng = parseFloat(parts[1]);
                    if (isNaN(lat) || isNaN(lng)) {
                        return;
                    }
                    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                        return;
                    }
                    this._map.flyTo([lat, lng], this._map.getZoom(), { animate: true });
                    this._input.value = "";
                }
            }
        },

        onRemove: function (this: L.Control.JumpTo) {
            L.DomEvent.off(this._input, {
                "beforeinput": this._handleInput,
                "keydown": this._update,
            }, this);
        }
    }) as unknown as typeof L.Control.JumpTo;

    L.control.jumpTo = function(options?: L.ControlOptions) {
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