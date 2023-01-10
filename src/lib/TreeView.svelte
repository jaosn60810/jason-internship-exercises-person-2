<script>
  import JSONTree from "svelte-json-tree";

  export let treeValue;

  $: value = treeValue;
</script>

<div
  style="--json-tree-li-indentation: 2rem;--json-tree-li-line-height: 2;"
  class="text-start"
>
  <JSONTree {value} />
</div>
