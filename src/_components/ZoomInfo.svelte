<script>
	import { getContext } from 'svelte';
	import L from 'leaflet';
	
	const { getMap } = getContext(L);

	L.Control.ZoomInfo = L.Control.extend({
		options: {
			position: 'topright',
			updateWhenIdle: false,
		},

		onAdd: function(map) {
			let className = 'leaflet-control-zoom-info';
			let container = L.DomUtil.create('div', className);

			this._addOutput(`${className}-output`, container);

			map.on(this.options.updateWhenIdle ? 'dragend' : 'drag', this._update, this);
			map.on(this.options.updateWhenIdle ? 'zoomend' : 'zoom', this._update, this);
			map.whenReady(this._update, this);

			return container;
		},

		_addOutput: function(className, container) {
			this._output = L.DomUtil.create('div', className, container);
		},

		_update: function() {
			let zoom = this._map.getZoom();
			this._output.innerHTML = `Zoom: ${zoom}`;
		},

		onRemove: function(map) {
			map.off(this.options.updateWhenIdle ? 'dragend' : 'drag', this._update, this);
			map.off(this.options.updateWhenIdle ? 'zoomend' : 'zoom', this._update, this);
		}
	});

	L.control.zoomInfo = function(options) {
		return new L.Control.ZoomInfo(options);
	};
	
	L.control.zoomInfo({ position: 'bottomleft' }).addTo(getMap());
</script>

<svelte:head>
	<style>
		.leaflet-control-zoom-info {
			margin-top: 0 !important;
			margin-bottom: 0 !important;
			margin-left: 0 !important;
			margin-right: 0 !important;
		}

		.leaflet-control-zoom-info-output {
			background: rgba(255, 255, 255, 1.0);
			padding: 0 3px;
		}
	</style>
</svelte:head>