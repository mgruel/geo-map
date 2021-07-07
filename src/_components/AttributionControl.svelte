<script>
	import { getContext } from 'svelte';
	import L from 'leaflet';
	
	const { getMap } = getContext(L);
	
  L.control.attribution({ position: 'bottomright' }).addTo(getMap());
</script>