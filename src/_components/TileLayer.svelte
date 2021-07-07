<script>
	import { getContext } from 'svelte';
	import L from 'leaflet';
	
	const { getMap } = getContext(L);
	
	const createCartoUrl = (style) => `https://{s}.basemaps.cartocdn.com/${style}/{z}/{x}/{y}${L.Browser.retina ? '@2x.png' : '.png'}`;
	const cartoConfig = {
		attribution:'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
		subdomains: 'abcd',
		minZoom: 7,
		maxZoom: 20
	};

	const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution:'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
		subdomains: 'abc',
		minzoom: 7,
		maxZoom: 19
	});
	const voyager = L.tileLayer(createCartoUrl('rastertiles/voyager'), cartoConfig).addTo(getMap());
	// const image = L.imageOverlay('https://cdn.gruel.cloud/map.png', [[52.9141, 5.1152], [52.7456, 4.8951]]).addTo(getMap());

	// L.control.layers({ osm, voyager }, {}, { collapsed: true, hideSingleBase: true, position: 'topright' }).addTo(getMap());
</script>