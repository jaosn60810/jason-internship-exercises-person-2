<script>
  import gapWordExercisesStore from './stores/gapWordExercisesStore';
  import imageExercisesStore from './stores/ImageExercisesStore';

  import { removePeriods, splitByWhitespace } from './utilities/StringUtils';
  import { EXERCISE_TYPES } from './utilities/Constant';

  import {
    Button,
    ButtonToolbar,
    FormGroup,
    Input,
    Image,
    Label,
    ListGroup,
    ListGroupItem,
  } from 'sveltestrap';

  import GapWordExercisesCardGroup from './lib/GapWordExercisesCardGroup.svelte';
  import ImageExercisesCardGroup from './lib/imageExercisesCardGroup.svelte';

  const exerciseTypes = [
    {
      exerciseTypesNames: EXERCISE_TYPES.GAP_WORD_EXERCISE.NAMES,
      textTranscript: EXERCISE_TYPES.GAP_WORD_EXERCISE.TEXT_TRANSCRIPT,
      generateQuestionFunction() {
        currentExerciseType.cardGroupComponent = GapWordExercisesCardGroup;

        if (optionIndex === undefined) {
          alert('Please choose a word.');
          return;
        }

        const questionArray = removePeriods(
          currentExerciseType.textTranscript
        ).split(' ');
        questionArray[optionIndex] = `___`;
        const questionString = questionArray.join(' ') + '.';

        $gapWordExercisesStore = [
          ...$gapWordExercisesStore,
          {
            id: `${new Date().valueOf()}`,
            originText: currentExerciseType.textTranscript,
            question: questionString,
            options,
            optionIndex,
            recordings: [],
          },
        ];
      },
    },
    {
      exerciseTypesNames: EXERCISE_TYPES.IMAGE_EXERCISE.NAMES,
      textTranscript: EXERCISE_TYPES.IMAGE_EXERCISE.TEXT_TRANSCRIPT,
      generateQuestionFunction() {
        currentExerciseType.cardGroupComponent = ImageExercisesCardGroup;

        const answerWordsArray = splitByWhitespace(
          currentExerciseType.textTranscript
        );

        $imageExercisesStore = [
          ...$imageExercisesStore,
          {
            id: `${new Date().valueOf()}`,
            answerWordsArray,
            originAnswerWordsArray: answerWordsArray,
            recordings: [],
          },
        ];
      },
    },
  ];

  let currentExerciseType = exerciseTypes[1];

  let isLoading = false;
  let optionIndex;
  let newOption;
  let options = [];

  // $: console.log($gapWordExercisesStore, $imageExercisesStore);

  function chooseAsOption(i) {
    optionIndex = i;
    const textTranscriptArray = currentExerciseType.textTranscript
      .split(' ')
      .map((word) => removePeriods(word));
    options = [textTranscriptArray[i]];
  }

  function addOption(e) {
    options = [...options, e.target.value];
    e.target.value = '';
  }

  function deleteOption(i) {
    if (i === 0) {
      return;
    }

    options.splice(i, 1);
    options = [...options];
  }

  function deleteAllOption() {
    options = [];
    optionIndex = undefined;
  }
</script>

<h1 class="mb-3">Pronunciation Assessment</h1>

<FormGroup>
  <Label for="exampleSelect" class="h2">Select Exercise Type</Label>
  <Input
    type="select"
    name="select"
    id="exampleSelect"
    class=" w-50 mx-auto"
    bind:value={currentExerciseType}
  >
    {#each exerciseTypes as exerciseType}
      <option value={exerciseType}>
        {exerciseType.exerciseTypesNames}
      </option>
    {/each}
  </Input>
</FormGroup>

{#if currentExerciseType.exerciseTypesNames === `gap-word-exercise`}
  <FormGroup>
    <Label for="exampleText" class="h2"
      >The transcript of the content you are attempting.</Label
    >
    <Input
      type="textarea"
      name="text"
      id="exampleText"
      bind:value={currentExerciseType.textTranscript}
      bind:disabled={isLoading}
      class="w-50 mx-auto"
      on:input={deleteAllOption}
    />
  </FormGroup>

  <ButtonToolbar class="justify-content-center mb-3">
    {#each currentExerciseType.textTranscript
      .split('.')
      .join('')
      .split(' ') as word, i (`${word}${i}`)}
      <Button
        color={i === optionIndex ? 'primary' : 'info'}
        class="me-1"
        on:click={() => chooseAsOption(i)}>{word}</Button
      >
    {/each}
  </ButtonToolbar>

  {#if optionIndex !== undefined}
    <FormGroup
      class="w-50 mx-auto d-flex justify-content-between align-items-center "
    >
      <Label>Add new option :</Label>
      <Input
        plaintext
        value={newOption}
        class="mb-1 bg-light w-75"
        bind:disabled={isLoading}
        on:change={addOption}
      />
    </FormGroup>

    <ListGroup class="w-50 mx-auto mb-3">
      {#each options as option, i (`${option}${i}`)}
        <ListGroupItem active={i === 0} class="d-flex justify-content-between">
          <span>{option}</span>
          <Button on:click={() => deleteOption(i)}>X</Button></ListGroupItem
        >
      {/each}
    </ListGroup>
  {/if}
{/if}

{#if currentExerciseType.exerciseTypesNames === `image-exercise`}
  <Image
    fluid
    src="https://thumbs.dreamstime.com/z/cute-male-cartoon-smiling-boy-labels-infographic-chart-kids-isolated-parts-face-english-learning-educational-232670120.jpg"
    alt=""
    class="w-50 d-block mx-auto mb-3"
  />

  <FormGroup>
    <Label for="exampleText" class="h2">Add labels to part of image.</Label>
    <Input
      type="textarea"
      name="text"
      id="exampleText"
      bind:value={currentExerciseType.textTranscript}
      bind:disabled={isLoading}
      class="w-50 mx-auto"
      on:input={deleteAllOption}
    />
  </FormGroup>

  <ButtonToolbar class="w-50 mx-auto justify-content-center mb-3 gap-3">
    {#each splitByWhitespace(currentExerciseType.textTranscript) as word, i (`${word}${i}`)}
      <Button>{word}</Button>
    {/each}
  </ButtonToolbar>
{/if}

<Button
  color="danger"
  class="mb-3"
  on:click={currentExerciseType.generateQuestionFunction}
  >Genterate Question</Button
>

<svelte:component this={currentExerciseType.cardGroupComponent} />
