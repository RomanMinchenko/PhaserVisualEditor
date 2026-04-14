import VisualEditor from "../components/VisualEditor";

const initialConfig = [
  {
    key: 'question',
    data: {
      frame: {
        value: "white_task_frame",
        nineSlice: {
          width: 1400,
          height: 172,
          left: 22,
          right: 22,
          top: 22,
          bottom: 30
        }
      }
    },
    position: { x: 960, y: 102 },
    children: [
      {
        key: 'question_text',
        data: {
          text: {
            value: "What is the capital of France?",
            style: { fontSize: 40, fontFamily: 'monospace', color: '#4C496A' },
            wordWrap: { width: 400, useAdvancedWrap: true }
          }
        },
        position: { x: 0, y: 0 }
      },
    ]
  },
  {
    key: 'question_image',
    data: {
      frame: {
        value: "image1",
        size: { width: 250, height: 375 }
      }
    },
    position: { x: 385, y: 416 },
  },
  {
    key: 'option1',
    data: {
      frame: {
        value: "white_task_frame",
        nineSlice: {
          width: 334,
          height: 212,
          left: 22,
          right: 22,
          top: 22,
          bottom: 30
        }
      },
      text: {
        value: "Paris",
        style: { fontSize: 32, fontFamily: 'monospace', color: '#4C496A' },
        wordWrap: { width: 120, useAdvancedWrap: true }
      }
    },
    position: { x: 1493, y: 416 },
  },
  {
    key: 'option2',
    data: {
      frame: {
        value: "white_task_frame",
        nineSlice: {
          width: 334,
          height: 212,
          left: 22,
          right: 22,
          top: 22,
          bottom: 30
        }
      },
      text: {
        value: "London",
        style: { fontSize: 32, fontFamily: 'monospace', color: '#4C496A' },
        wordWrap: { width: 120, useAdvancedWrap: true }
      }
    },
    position: { x: 1119, y: 416 },
  },
  {
    key: 'option3',
    data: {
      frame: {
        value: "white_task_frame",
        nineSlice: {
          width: 334,
          height: 212,
          left: 22,
          right: 22,
          top: 22,
          bottom: 30
        }
      },
      text: {
        value: "Berlin",
        style: { fontSize: 32, fontFamily: 'monospace', color: '#4C496A' },
        wordWrap: { width: 120, useAdvancedWrap: true }
      }
    },
    position: { x: 745, y: 416 },
  },
];

export default class EditorScene extends Phaser.Scene {
  public editor: VisualEditor | null;

  constructor() {
    super({ key: 'EditorScene' });
  }

  preload() {
    this.load.atlas('assets', 'atlas/assets.png', 'atlas/assets.json');
  }

  create() {
    this.editor = new VisualEditor(this, initialConfig);
  }
}