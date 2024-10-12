import { Spritesheet ,Texture, AnimatedSprite} from "pixi.js"

const atlasData = {
    frames: {
        // row 1
        BAR_DOWN: {
            frame: {x:0, y:0, w:794, h:794},
            sourceSize: { w: 794, h: 794 },
            spriteSourceSize: { x: 0, y: 0, w: 794, h: 794 }
        },
        BAR_LEFT: {
            frame: {x:794, y:0, w:794, h:794},
            sourceSize: { w: 794, h: 794 },
            spriteSourceSize: { x: 0, y: 0, w: 794, h: 794 }
        },
        BAR_LEFT_DRAFT: {
            frame: {x:1588, y:0, w:794, h:794},
            sourceSize: { w: 794, h: 794 },
            spriteSourceSize: { x: 0, y: 0, w: 794, h: 794 }
        },
        BAR_RIGHT: {
            frame: {x:2382, y:0, w:794, h:794},
            sourceSize: { w: 794, h: 794 },
            spriteSourceSize: { x: 0, y: 0, w: 794, h: 794 }
        },
        BAR_RIGHT_DRAFT: {
            frame: {x:3176, y:0, w:794, h:794},
            sourceSize: { w: 794, h: 794 },
            spriteSourceSize: { x: 0, y: 0, w: 794, h: 794 }
        },

        //row 2
        BAR_UP: {
            frame: {x:0, y:794, w:794, h:794},
            sourceSize: { w: 794, h: 794 },
            spriteSourceSize: { x: 0, y: 0, w: 794, h: 794 }
        },
        COBBLESTONE: {
            frame: {x:794, y:794, w:794, h:794},
            sourceSize: { w: 794, h: 794 },
            spriteSourceSize: { x: 0, y: 0, w: 794, h: 794 }
        },
        ELEVATOR_LEFT: {
            frame: {x:1588, y:794, w:794, h:794},
            sourceSize: { w: 794, h: 794 },
            spriteSourceSize: { x: 0, y: 0, w: 794, h: 794 }
        },
        ELEVATOR_RIGHT: {
            frame: {x:2382, y:794, w:794, h:794},
            sourceSize: { w: 794, h: 794 },
            spriteSourceSize: { x: 0, y: 0, w: 794, h: 794 }
        },
        POOL_BOTTOM_LEFT: {
            frame: {x:3176, y:794, w:794, h:794},
            sourceSize: { w: 794, h: 794 },
            spriteSourceSize: { x: 0, y: 0, w: 794, h: 794 }
        },

        // row 3
        POOL_BOTTOM_RIGHT: {
            frame: {x:0, y:1588, w:794, h:794},
            sourceSize: { w: 794, h: 794 },
            spriteSourceSize: { x: 0, y: 0, w: 794, h: 794 }
        },
        POOL_LEFT: {
            frame: {x:794, y:1588, w:794, h:794},
            sourceSize: { w: 794, h: 794 },
            spriteSourceSize: { x: 0, y: 0, w: 794, h: 794 }
        },
        POOL_RIGHT: {
            frame: {x:1588, y:1588, w:794, h:794},
            sourceSize: { w: 794, h: 794 },
            spriteSourceSize: { x: 0, y: 0, w: 794, h: 794 }
        },
        BAR_DOWNBAR_LEFTBAR_LEFT_DRAFTBAR_RIGHTBAR_RIGHT_DRAFTBAR_UPCOBBLESTONEELEVATOR_LEFTELEVATOR_RIGHTPOOL_BOTTOM_LEFTPOOL_BOTTOM_RIGHTPOOL_LEFTPOOL_RIGHTPOOL_TOP_LEFT: {
            frame: {x:2382, y:1588, w:794, h:794},
            sourceSize: { w: 794, h: 794 },
            spriteSourceSize: { x: 0, y: 0, w: 794, h: 794 }
        },
        POOL_RIGHT_LEFT: {
            frame: {x:3176, y:1588, w:794, h:794},
            sourceSize: { w: 794, h: 794 },
            spriteSourceSize: { x: 0, y: 0, w: 794, h: 794 }
        },
        //row 4
        SINK: {
            frame: {x:0, y:0, w:2382, h:794},
            sourceSize: { w: 794, h: 794 },
            spriteSourceSize: { x: 0, y: 0, w: 794, h: 794 }
        },
        STONE_TILE: {
            frame: {x:794, y:2832, w:794, h:794},
            sourceSize: { w: 794, h: 794 },
            spriteSourceSize: { x: 0, y: 0, w: 794, h: 794 }
        },
        STONE_WALL_UP: {
            frame: {x:1588, y:2382, w:794, h:794},
            sourceSize: { w: 794, h: 794 },
            spriteSourceSize: { x: 0, y: 0, w: 794, h: 794 }
        },
        STONE_WALL_SIDE: {
            frame: {x:2382, y:2382, w:794, h:794},
            sourceSize: { w: 794, h: 794 },
            spriteSourceSize: { x: 0, y: 0, w: 794, h: 794 }
        },
        TABLE_UP: {
            frame: {x:3176, y:2382, w:794, h:794},
            sourceSize: { w: 794, h: 794 },
            spriteSourceSize: { x: 0, y: 0, w: 794, h: 794 }
        },

        //row 5
        TABLE_SIDE: {
            frame: {x:0, y:3176, w:794, h:794},
            sourceSize: { w: 794, h: 794 },
            spriteSourceSize: { x: 0, y: 0, w: 794, h: 794 }
        },
        TOILET: {
            frame: {x:794, y:3176, w:794, h:794},
            sourceSize: { w: 794, h: 794 },
            spriteSourceSize: { x: 0, y: 0, w: 794, h: 794 }
        },
        WOODEN_FLOOR: {
            frame: {x:1588, y:3176, w:794, h:794},
            sourceSize: { w: 794, h: 794 },
            spriteSourceSize: { x: 0, y: 0, w: 794, h: 794 }
        },
    },
    meta: {
        image: '../../images/TileSet.png',
        format: 'RGBA8888',
        size: { w: 3176, h: 3176 },
        scale: 1
    },
    animations: {
        enemy: ["BAR_DOWN",
                "BAR_LEFT",
                "BAR_LEFT_DRAFT",
                "BAR_RIGHT",
                "BAR_RIGHT_DRAFTBAR_UP",
                "COBBLESTONE",
                "ELEVATOR_LEFT",
                "ELEVATOR_RIGHT",
                "POOL_BOTTOM_LEFT",
                "POOL_BOTTOM_RIGHT",
                "POOL_LEFTPOOL_RIGHT",
                "POOL_TOP_LEFT",
                "POOL_RIGHT_LEFT",
                "SINK",
                "STONE_TILE",
                "STONE_WALL_UP",
                "STONE_WALL_SIDE",
                "TABLE_UP",
                "TABLE_SIDE",
                "TOILET",
                "WOODEN_FLOOR"
                ] //array of frames by name
    }
};

const spritesheet = new Spritesheet(
    Texture.from(atlasData.meta.image),
    atlasData
);