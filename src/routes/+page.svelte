<script lang="ts">
	import Map from "../components/Map.svelte";
	import AttributionControl from "../components/AttributionControl.svelte";
	import GeoSearch from "../components/GeoSearch.svelte";
	import JumpTo from "../components/JumpTo.svelte";
	import MouseCoords from "../components/MouseCoords.svelte";
	import ScaleControl from "../components/ScaleControl.svelte";
	import TileLayer from "../components/TileLayer.svelte";
	import ZoomControl from "../components/ZoomControl.svelte";
</script>

<svelte:head>
	<title>Gruel Maps</title>
</svelte:head>

<Map>
	<TileLayer />
	<AttributionControl />
	<GeoSearch />
	<JumpTo />
	<ScaleControl />
	<MouseCoords />
	<ZoomControl />
</Map>