<script>
  import kaboom from 'kaboom';
  import { onMount } from 'svelte';
  import imageExercisesStore from '../stores/ImageExercisesStore';

  export let mediaRecorder;
  export let recordAudioButtons;
  export let isLoading;
  export let testId;

  let player;

  let currentTestId = $imageExercisesStore[0].id;
  $: currentTest = $imageExercisesStore.find(({ id }) => id === currentTestId);

  export function resetPlayerImage() {
    player.use(sprite('link-going-right'));
  }

  export function spawnKaboom() {
    const obj = add([
      sprite('kaboom'),
      pos(player.pos.add(player.dir.scale(48))),
      'kaboom',
      area(),
    ]);
    wait(1, () => {
      destroy(obj);
    });
  }

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
      root: document.querySelector(`#mygame${testId}`),
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

      onKeyPress('space', () => {
        spawnKaboom();
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

<div id={`mygame${testId}`} />
