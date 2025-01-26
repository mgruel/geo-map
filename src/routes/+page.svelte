<script lang="ts">
	import Map from "../components/Map.svelte";
	import AttributionControl from "../components/AttributionControl.svelte";
	import Coordinates from "../components/Coordinates.svelte";
	import JumpTo from "../components/JumpTo.svelte";
	import MouseCoords from "../components/MouseCoords.svelte";
	import ScaleControl from "../components/ScaleControl.svelte";
	import TileLayer from "../components/TileLayer.svelte";
	import ZoomControl from "../components/ZoomControl.svelte";
	import ZoomInfo from "../components/ZoomInfo.svelte";
</script>

<svelte:head>
	<title>Gruel Maps</title>
</svelte:head>

<Map>
	<AttributionControl />
	<Coordinates />
	<JumpTo />
	<MouseCoords />
	<ScaleControl />
	<TileLayer />
	<ZoomControl />
	<ZoomInfo />
</Map>