<script>
	import Map from './_components/Map.svelte';
	import TileLayer from './_components/TileLayer.svelte';
	import AttributionControl from './_components/AttributionControl.svelte';
	import JumpTo from './_components/JumpTo.svelte';
	import Coordinates from './_components/Coordinates.svelte';
</script>

<Map>
	<TileLayer />
	<AttributionControl />
	<JumpTo />
	<Coordinates />
</Map>