<script>
  import { createEventDispatcher } from 'svelte';
  import { Button } from 'sveltestrap';

  export let isLoading;

  let dispatch = createEventDispatcher();
  let isRecording = false;

  export function record() {
    dispatch('record');
    isRecording = true;
  }

  export function stop() {
    dispatch('stop');
    isRecording = false;
  }
</script>

<div class="buttons mb-3">
  <h2>Record Audio</h2>

  <Button disabled={isRecording || isLoading} color="danger" on:click={record}>
    Play</Button
  >
  <Button
    disabled={isRecording === false || isLoading}
    color="danger"
    on:click={stop}>Stop</Button
  >

  {#if isRecording === false}
    <span>Waiting</span>
  {:else}
    <span class="recording">Recording</span>
  {/if}
</div>

<style>
  .buttons {
    margin: 0.5rem 0;
  }
  .recording {
    font-weight: bold;
    animation: recorder 2s infinite;
  }
  @keyframes recorder {
    0% {
      color: darkred;
    }
    50% {
      color: red;
    }
    100% {
      color: darkred;
    }
  }
</style>
