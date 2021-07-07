<script>
	import { getContext } from 'svelte';
	import L from 'leaflet';
	
	const { getMap } = getContext(L);

	L.Control.JumpTo = L.Control.extend({
		options: {
			position: 'topleft'
		},

		onAdd: function () {
			const className = 'leaflet-control-jump-to';
			const container = L.DomUtil.create('div', className);

      this._addLabel(`${className}-label`, container);
			this._addInput(`${className}-input`, container);

			return container;
		},

    _addLabel: function (className, container) {
      this._label = L.DomUtil.create('span', className, container);
      this._label.innerHTML = 'Jump to:';
    },

		_addInput: function (className, container) {
			this._input = L.DomUtil.create('input', className, container);
      this._input.addEventListener('keydown', this._update.bind(this));
		},

		_update: function (event) {
			if (event.key === "Enter") {
        const coords = this?._input.value.split(',');
        console.debug(coords);
        if (coords.length >= 2) {
          this._map.flyTo(coords, this._map.getZoom(), { animate: true });
          this._input.value = null;
        }
      }
		},

		onRemove: function () {
			this._input.removeEventListener('keydown', this._update);
		}
	});

	L.control.jumpTo = function(options) {
		return new L.Control.JumpTo(options);
	};
	
	L.control.jumpTo({ position: 'topleft' }).addTo(getMap());
</script>

<svelte:head>
	<style>
    .leaflet-control-jump-to {
      background: rgba(255, 255, 255, 1.0);
			padding: 0 3px;
      
			margin-top: 0 !important;
			margin-bottom: 0 !important;
			margin-left: 0 !important;
			margin-right: 0 !important;
    }
		.leaflet-control-jump-to-input,
    .leaflet-control-jump-to-input:active,
    .leaflet-control-jump-to-input:focus {
      outline: none !important;
			border: 0;
			margin-left: 2px;
		}
	</style>
</svelte:head>