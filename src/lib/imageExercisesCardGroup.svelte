<script>
  import imageExercisesStore from '../stores/ImageExercisesStore';

  import { EXERCISE_TYPES } from '../utilities/Constant';

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

  import ImageExercisesAudioList from './imageExercisesAudioList.svelte';
  import RecordAudioButtons from './RecordAudioButtons.svelte';
  import { onMount } from 'svelte';

  const constrains = { audio: true };
  const passingScore = EXERCISE_TYPES.IMAGE_EXERCISE.PASSING_SCORE;
  let mediaRecorder = null;
  let isLoading = false;
  let files;
  let currentTestId = $imageExercisesStore[0].id;
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

      spawnKaboom(player.pos.add(player.dir.scale(48)));

      let audio = new Audio(record.audio);
      audio.play();

      function spawnKaboom(p) {
        const obj = add([sprite('kaboom'), pos(p), 'kaboom', area()]);
        wait(1, () => {
          destroy(obj);
        });
      }
    }

    player.use(sprite('link-going-right'));
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

  let k = null;
  let player;
  let recordAudioButtons;

  // $: console.log(k, player);

  import kaboom from 'kaboom';

  onMount(() => {
    // content here
    //IMPORTANT: Make sure to use Kaboom version 0.5.0 for this game by adding the correct script tag in the HTML file.

    kaboom({
      // width: document.body.clientWidth > 640 ? 640 : document.body.clientWidth,
      // height:
      //   document.body.clientWidth * 0.75 > 480
      //     ? 480
      //     : document.body.clientWidth * 0.75,
      width: 500,
      height: 650,
      global: true,
      stretch: false,

      scale: 1,
      debug: true,
      background: [0, 0, 1, 1],
      root: document.querySelector('#mygame'),
    });

    // Speeds
    const MOVE_SPEED = 120;
    const SLICER_SPEED = 100;
    const SKELETOR_SPEED = 0;

    const gridWidth = 48;
    const gridHeight = 48;

    // Game Logic
    loadRoot('https://i.imgur.com/');
    loadSprite('link-going-left', '1Xq9biB.png');
    loadSprite('link-going-right', 'yZIb8O2.png');
    loadSprite('link-going-down', 'tVtlP6y.png');
    loadSprite('link-going-up', 'UkV0we0.png');
    loadSprite('left-wall', 'rfDoaa1.png');
    loadSprite('top-wall', 'QA257Bj.png');
    loadSprite('bottom-wall', 'vWJWmvb.png');
    loadSprite('right-wall', 'SmHhgUn.png');
    loadSprite('bottom-left-wall', 'awnTfNC.png');
    loadSprite('bottom-right-wall', '84oyTFy.png');
    loadSprite('top-left-wall', 'xlpUxIm.png');
    loadSprite('top-right-wall', 'z0OmBd1.jpg');
    loadSprite('top-door', 'U9nre4n.png');
    loadSprite('fire-pot', 'I7xSp7w.png');
    loadSprite('left-door', 'okdJNls.png');
    loadSprite('lanterns', 'wiSiY09.png');
    loadSprite('slicer', 'c6JFi5Z.png');
    loadSprite('skeletor', 'Ei1VnX8.png');
    loadSprite('kaboom', 'o9WizfI.png');
    loadSprite('stairs', 'VghkL08.png');
    loadSprite('bg', 'u4DVsx6.png');

    scene('game', ({ level, score }) => {
      layers(['bg', 'obj', 'ui'], 'obj');

      const maps = [
        [
          'ycc)cc^ccw',
          'a        b',
          'a      * b',
          'a    (   b',
          '%        b',
          'a    (   b',
          'a   *    b',
          'a        b',
          'a        b',
          'xdd)dd)ddz',
        ],
        [
          'yccccccccw',
          'a        b',
          ')     }  )',
          'a        b',
          '%   }    b',
          'a    $   b',
          ')   }    )',
          'a      } b',
          'a      } b',
          'xddddddddz',
        ],
        [
          'yccccccccw',
          'a        b',
          ')        )',
          'a        b',
          '%        b',
          'a    $   b',
          ')        )',
          'a        b',
          'a        b',
          'xddddddddz',
        ],
      ];

      const levelCfg = {
        width: gridWidth,
        height: gridHeight,
        a: () => [sprite('left-wall'), solid(), area(), 'wall'],
        b: () => [sprite('right-wall'), solid(), area(), 'wall'],
        c: () => [sprite('top-wall'), solid(), area(), 'wall'],
        d: () => [sprite('bottom-wall'), solid(), area(), 'wall'],
        w: () => [sprite('top-right-wall'), solid(), area(), 'wall'],
        x: () => [sprite('bottom-left-wall'), solid(), area(), 'wall'],
        y: () => [sprite('top-left-wall'), solid(), area(), 'wall'],
        z: () => [sprite('bottom-right-wall'), solid(), area(), 'wall'],
        '%': () => [sprite('left-door'), solid(), area(), 'door'],
        '^': () => [sprite('top-door'), 'next-level', solid(), area()],
        $: () => [sprite('stairs'), 'next-level', area()],
        '*': () => [
          sprite('slicer'),
          'slicer',
          { dir: -1 },
          'dangerous',
          area(),
        ],
        '}': () => [
          sprite('skeletor'),
          'dangerous',
          'skeletor',
          { dir: -1, timer: 0 },
          area(),
        ],
        ')': () => [sprite('lanterns'), solid(), area()],
        '(': () => [sprite('fire-pot'), solid(), area()],
      };
      addLevel(maps[level], levelCfg);

      if (level === maps.length - 1) {
        const skeletorNUmbers = currentTest.originAnswerWordsArray.length;

        for (let i = 0; i < skeletorNUmbers; i++) {
          // @ts-ignore
          const x = randi(2, 8) * 48;
          // @ts-ignore
          const y = randi(2, 8) * 48;

          add([
            sprite('skeletor'),
            'dangerous',
            'skeletor',
            { dir: -1, timer: 0 },
            area(),
            pos(x, y),
          ]);
        }
      }

      add([sprite('bg'), layer('bg')]);

      const scoreLabel = add([
        text(`score: ${score}`),
        pos(0, 540),
        layer('ui'),
        scale(0.4),
      ]);

      add([text('level ' + parseInt(level + 1)), pos(0, 500), scale(0.4)]);

      add([text('Press arrow keys to move'), pos(0, 580), scale(0.4)]);

      add([text('Press QW to record and stop '), pos(0, 620), scale(0.4)]);

      player = add([
        sprite('link-going-right'),
        pos(5, 190),
        {
          // right by default
          dir: vec2(1, 0),
        },
        area(),
        solid(),
      ]);

      player.onCollide('next-level', () => {
        go('game', {
          level: (level + 1) % maps.length,
          // level: level + 1,
          score: score,
        });
      });

      onKeyDown('left', () => {
        if (isLoading || mediaRecorder.state === 'recording') {
          return;
        }

        player.use(sprite('link-going-left'));
        player.move(-MOVE_SPEED, 0);
        player.dir = vec2(-1, 0);
      });

      onKeyDown('right', () => {
        if (isLoading || mediaRecorder.state === 'recording') {
          return;
        }

        player.use(sprite('link-going-right'));
        player.move(MOVE_SPEED, 0);
        player.dir = vec2(1, 0);
      });

      onKeyDown('up', () => {
        if (isLoading || mediaRecorder.state === 'recording') {
          return;
        }

        player.use(sprite('link-going-up'));
        player.move(0, -MOVE_SPEED);
        player.dir = vec2(0, -1);
      });

      onKeyDown('down', () => {
        if (isLoading || mediaRecorder.state === 'recording') {
          return;
        }

        player.use(sprite('link-going-down'));
        player.move(0, MOVE_SPEED);
        player.dir = vec2(0, 1);
      });

      function spawnKaboom(p) {
        const obj = add([sprite('kaboom'), pos(p), 'kaboom', area()]);
        wait(1, () => {
          destroy(obj);
        });
      }

      onKeyPress('space', () => {
        spawnKaboom(player.pos.add(player.dir.scale(48)));
      });

      onKeyPress('q', () => {
        if (mediaRecorder.state === 'recording') {
          return;
        }

        recordAudioButtons.record();

        player.use(sprite('slicer'));
      });

      onKeyPress('w', () => {
        if (mediaRecorder.state === 'inactive') {
          return;
        }

        recordAudioButtons.stop();
      });

      player.onCollide('door', (d) => {
        destroy(d);
      });

      onCollide('kaboom', 'skeletor', (k, s) => {
        shake(4);
        wait(1, () => {
          destroy(k);
        });
        destroy(s);
        score++;
        scoreLabel.text = score;
      });

      onUpdate('slicer', (s) => {
        s.move(s.dir * SLICER_SPEED, 0);
      });

      onCollide('slicer', 'wall', (s) => {
        s.dir = -s.dir;
      });

      onUpdate('skeletor', (s) => {
        s.move(0, s.dir * SKELETOR_SPEED);
        s.timer -= dt();
        if (s.timer <= 0) {
          s.dir = -s.dir;
          s.timer = rand(5);
        }
      });

      onCollide('skeletor', 'wall', (s) => {
        s.dir = -s.dir;
      });

      player.onCollide('dangerous', () => {
        go('lose', { score: score });
      });
    });

    scene('lose', ({ score }) => {
      add([text(score), pos(center())]);
      add([
        text('Press Space to restart'),
        pos(48, center().y + 100),
        scale(0.4),
      ]);

      // go back to game with space is pressed
      onKeyPress('space', () => {
        go('game', { level: 0, score: 0 });
      });
    });

    go('game', { level: 0, score: 0 });
  });
</script>

{#each $imageExercisesStore as test (test.id)}
  <Card class="mb-3" on:click={() => changeCurrentTestId(test.id)}>
    <CardHeader>
      <CardTitle>Test : {test.id}</CardTitle>
    </CardHeader>

    <div id="mygame" />

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
        bind:this={recordAudioButtons}
      />

      {#if isLoading && currentTestId === test.id}
        <Spinner color="primary" />
      {/if}

      {#each test.recordings as recording, i (`${recording.audio}${i}`)}
        <ImageExercisesAudioList
          title={i + 1 + ': ' + recording.title}
          audio={recording.audio}
          pronunciationAssessmentResult={recording.pronunciationAssessmentResult}
          on:deleterecording={() => deleteRecording(test.id, recording)}
        />
      {:else}
        <div>Doesn't have any audio stored.</div>
      {/each}
    </CardBody>
  </Card>
{/each}
