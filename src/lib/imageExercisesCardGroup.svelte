<script>
  import imageExercisesStore from '../stores/ImageExercisesStore';

  import { EXERCISE_TYPES } from '../utilities/Constant';

  import {
    Card,
    CardBody,
    CardHeader,
    CardTitle,
    FormGroup,
    FormText,
    Input,
    Label,
    Spinner,
  } from 'sveltestrap';

  import GameCanvas from './GameCanvas.svelte';
  import ImageExercisesAudioList from './imageExercisesAudioList.svelte';
  import RecordAudioButtons from './RecordAudioButtons.svelte';

  const constrains = { audio: true };
  const passingScore = EXERCISE_TYPES.IMAGE_EXERCISE.PASSING_SCORE;
  let mediaRecorder = null;
  let isLoading = false;
  let files;
  let currentTestId = $imageExercisesStore[0].id;
  let recordAudioButtonsRef;

  let gameCanvasRef = null;

  $: currentTest = $imageExercisesStore.find(({ id }) => id === currentTestId);

  if (navigator.mediaDevices) {
    navigator.mediaDevices
      .getUserMedia(constrains)
      .then((stream) => {
        let chunks = [];

        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (e) => {
          chunks.push(e.data);
        };

        mediaRecorder.onstop = async () => {
          isLoading = true;

          const clipName = new Date().valueOf();

          const blob = new Blob(chunks, { type: 'audio/ogg; codecs-opus' });

          const audioURL = URL.createObjectURL(blob);

          let pronunciationAssessmentResult = await sendAudioToSpeechAceAPI(
            blob,
            currentTest.answerWordsArray.join('\n')
          );

          isLoading = false;

          chunks = [];

          if (pronunciationAssessmentResult.status !== 'success') {
            return;
          }

          addPronunciationAssessmentResultIntoTests({
            title: clipName,
            audio: audioURL,
            pronunciationAssessmentResult,
          });
        };
      })
      .catch((err) => {
        alert(
          'Permission denied. To use the recorder you will have to allow access to the microphone.'
        );
        console.log('The fallowing error occurred: ' + err);
      });
  }

  function record() {
    mediaRecorder.start();
  }

  function stop() {
    mediaRecorder.stop();
  }

  function deleteRecording(testId, recording) {
    currentTest.recordings = currentTest.recordings.filter(
      (i) => i.audio !== recording.audio
    );

    $imageExercisesStore = $imageExercisesStore.map((test) => {
      if (test.id === testId) {
        return currentTest;
      }
      return test;
    });
  }

  /**
   * @param {Blob} blob
   * @param {string} text
   */
  async function sendAudioToSpeechAceAPI(blob, text) {
    const formdata = new FormData();
    formdata.append('text', text);
    formdata.append('user_audio_file', blob);
    formdata.append('question_info', "'u1/q1'");

    //     const corsUrl = 'https://escape-day13-cors.herokuapp.com/';
    // const corsUrl = 'https://cors-anywhere.herokuapp.com/';
    const corsUrl = 'https://web-production-f84d.up.railway.app/';

    const response = await fetch(
      `${corsUrl}https://api.speechace.co/api/scoring/text/v9/json?key=${
        import.meta.env.VITE_SPEECH_ACE_KEY
      }&user_id=XYZ-ABC-99001&dialect=en-us`,
      {
        method: 'POST',
        body: formdata,
        redirect: 'follow',
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async function onFileSelected(e) {
    if (!e.target.files[0]) {
      return;
    }

    isLoading = true;

    const file = e.target.files[0];
    const audioURL = URL.createObjectURL(file);
    let pronunciationAssessmentResult = await sendAudioToSpeechAceAPI(
      file,
      currentTest.answerWordsArray.join('\n')
    );

    addPronunciationAssessmentResultIntoTests({
      title: files[0].name,
      audio: audioURL,
      pronunciationAssessmentResult,
    });

    e.target.value = '';

    isLoading = false;
  }

  function addPronunciationAssessmentResultIntoTests(record) {
    if (
      record.pronunciationAssessmentResult['text_score']['word_score_list'][0][
        'quality_score'
      ] > passingScore
    ) {
      currentTest.recordings.push(record);
      currentTest.answerWordsArray = currentTest.answerWordsArray.filter(
        (item) =>
          item !== record.pronunciationAssessmentResult['text_score']['text']
      );
      $imageExercisesStore = [...$imageExercisesStore];

      gameCanvasRef.spawnKaboom();

      let audio = new Audio(record.audio);
      audio.play();
    }

    gameCanvasRef.resetPlayerImage();
  }

  function changeCurrentTestId(testId) {
    if (isLoading) {
      return;
    }

    currentTestId = testId;
  }

  function createCorrectAnswersArray({
    originAnswerWordsArray,
    answerWordsArray,
  }) {
    return originAnswerWordsArray.filter(
      (item) => !answerWordsArray.includes(item)
    );
  }
</script>

{#each $imageExercisesStore as test (test.id)}
  <Card class="mb-3" on:click={() => changeCurrentTestId(test.id)}>
    <CardHeader>
      <CardTitle>Test : {test.id}</CardTitle>
    </CardHeader>

    <GameCanvas
      bind:this={gameCanvasRef}
      {mediaRecorder}
      recordAudioButtons={recordAudioButtonsRef}
      {isLoading}
    />

    <CardBody class="h1"
      >{createCorrectAnswersArray(test).length} / {test.originAnswerWordsArray
        .length}</CardBody
    >
    <CardBody>
      <FormGroup>
        <Label for="exampleFile" class="h2">Upload File</Label>
        <Input
          type="file"
          name="file"
          id="exampleFile"
          bind:files
          on:change={onFileSelected}
          disabled={isLoading}
          class="w-25 mx-auto"
        />
        <FormText color="muted">.wav, .mp3</FormText>
      </FormGroup>

      <RecordAudioButtons
        on:record={record}
        on:stop={stop}
        {isLoading}
        bind:this={recordAudioButtonsRef}
      />

      {#if isLoading && currentTestId === test.id}
        <Spinner color="primary" />
      {/if}

      {#each test.recordings as recording, i (`${recording.audio}${i}`)}
        <ImageExercisesAudioList
          title={i + 1 + ': ' + recording.title}
          audio={recording.audio}
          pronunciationAssessmentResult={recording.pronunciationAssessmentResult}
          on:deleteRecording={() => deleteRecording(test.id, recording)}
        />
      {:else}
        <div>Doesn't have any audio stored.</div>
      {/each}
    </CardBody>
  </Card>
{/each}
