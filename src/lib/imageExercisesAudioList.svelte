<script>
  import { EXERCISE_TYPES } from '../utilities/Constant';

  import { createEventDispatcher } from 'svelte';

  import { Button, ButtonToolbar, Icon } from 'sveltestrap';

  import TreeView from './TreeView.svelte';

  const dispatch = createEventDispatcher();

  export let title;
  export let audio;

  export let pronunciationAssessmentResult;

  let passingScore = EXERCISE_TYPES.IMAGE_EXERCISE.PASSING_SCORE;
  let wordPronunciationAssessmentResultIndex = -1;

  function showWordPronunciationAssessmentResult(i) {
    wordPronunciationAssessmentResultIndex = i;
  }
</script>

<div class="mb-5">
  <div class="library mb-3">
    <span class="title">{title}</span>
    <audio controls src={audio} />
    <button class="trash" on:click={() => dispatch('deleterecording')}>
      <Icon name="trash-fill" />
    </button>
  </div>

  <ButtonToolbar class="justify-content-center">
    {#each pronunciationAssessmentResult['text_score']['word_score_list'] as word, i (`${word}${i}`)}
      <Button
        color={word['quality_score'] > passingScore ? 'success' : 'danger'}
        class="me-1"
        on:click={() => showWordPronunciationAssessmentResult(i)}
      >
        <span>
          <span>&nbsp;</span>{word.word}
        </span>
        <span>
          <span>&#40;</span>
          {word['quality_score']}
          <span>&#41;</span>
        </span>
      </Button>
    {/each}
  </ButtonToolbar>
</div>

{#if wordPronunciationAssessmentResultIndex !== -1}
  <TreeView
    treeValue={pronunciationAssessmentResult['text_score']['word_score_list'][
      wordPronunciationAssessmentResultIndex
    ]}
  />
{/if}

<style>
  .title {
    text-align: start;
    width: 200px;
  }
  .library {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-bottom: 0.5rem;
  }
  .trash {
    padding: 0.2rem;
    border: none;
  }
</style>
