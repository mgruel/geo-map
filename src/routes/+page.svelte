<script lang="ts">
	import Map from "../components/Map.svelte";
	import AttributionControl from "../components/AttributionControl.svelte";
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
	<ScaleControl />
	<AttributionControl />
	<MouseCoords />
	<ZoomControl />
	<JumpTo />
</Map>