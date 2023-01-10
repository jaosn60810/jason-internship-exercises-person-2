<script>
  import gapWordExercisesStore from '../stores/gapWordExercisesStore';

  import {
    Card,
    CardBody,
    CardHeader,
    CardTitle,
    FormGroup,
    Input,
    Label,
    Spinner,
    FormText,
  } from 'sveltestrap';

  import AudioList from './AudioList.svelte';
  import RecordAudioButtons from './RecordAudioButtons.svelte';

  const constrains = { audio: true };
  let mediaRecorder = null;
  let isLoading = false;
  let files;
  let currentTestId = $gapWordExercisesStore[0].id;
  $: currentTest = $gapWordExercisesStore.find(
    ({ id }) => id === currentTestId
  );

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
            currentTest.originText
          );

          isLoading = false;

          chunks = [];

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

    $gapWordExercisesStore = $gapWordExercisesStore.map((test) => {
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
    formdata.append('no_mc', '1');

    const corsUrl = 'https://escape-day13-cors.herokuapp.com/';

    const response = await fetch(
      `${corsUrl}https://api.speechace.co/api/scoring/text/v9/json?dialect=en-us&user_id=XYZ-ABC-99001&key=${
        import.meta.env.VITE_SPEECH_ACE_KEY
      }`,
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
      currentTest.originText
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
    currentTest.recordings.push(record);
    $gapWordExercisesStore = [...$gapWordExercisesStore];
  }

  function changeCurrentTestId(testId) {
    if (isLoading) {
      return;
    }

    currentTestId = testId;
  }
</script>

{#each $gapWordExercisesStore as test (test.id)}
  <Card class="mb-3" on:click={() => changeCurrentTestId(test.id)}>
    <CardHeader>
      <CardTitle>Test : {test.id}</CardTitle>
    </CardHeader>
    <CardBody>
      <h2>Question : {test.question}</h2>

      <ol class="list-group list-group-numbered">
        {#each test.options as option, i (`${option}${i}`)}
          <li class="list-group-item">{option}</li>
        {/each}
      </ol>
    </CardBody>
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

      <RecordAudioButtons on:record={record} on:stop={stop} {isLoading} />

      {#if isLoading && currentTestId === test.id}
        <Spinner color="primary" />
      {/if}

      {#each test.recordings as recording, i (`${recording.audio}${i}`)}
        <AudioList
          title={i + 1 + ': ' + recording.title}
          audio={recording.audio}
          optionIndex={test.optionIndex}
          pronunciationAssessmentResult={recording.pronunciationAssessmentResult}
          on:deleterecording={() => deleteRecording(test.id, recording)}
        />
      {:else}
        <div>Doesn't have any audio stored.</div>
      {/each}
    </CardBody>
  </Card>{/each}
