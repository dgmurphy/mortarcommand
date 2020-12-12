
export const GAME_LEVELS = [
    { // level 1
      agents: [10, 20, 30, 40, 50, 80],   // initial health values   
      //agents: [100],   // initial health values   
      artifacts: { small: 1, med: 1, large: 2 },
      tip: "Tip: If things are moving a bit slowly, \nmake your browser window smaller."  
    },        
    {  // level 2
        agents: [10, 30, 70, 90, 100],
        artifacts: { small: 2, med: 1, large: 2},
        tip: "Tip: Some bots are stronger than others."
    },    
    {  // level 3
        agents: [10, 40, 60, 90, 95, 100],
        artifacts: { small: 2, med: 2, large: 3},
        tip: "Tip: Destroy ore deposits to delay the bots."
    },    
    {  // level 4
        agents: [10, 30, 50, 70, 80, 90, 100, 100, 100],
        artifacts: { small: 2, med: 2, large: 3},
        tip: "Tip: When the green progress bar is full\nyour heavy mortar is ready (space-bar)"
    },    
    {  // level 5
        agents: [1,1,1,10,10,10,10,10,10, 30, 80, 90, 100, 100, 100],
        artifacts: { small: 2, med: 2, large: 3},
        tip: "Tip: Use mouse buttons to pan/rotate/zoom if you want."
    },    
    {  // level 6
        agents: [9,9,9,9,9,9,9,9,9,9],
        artifacts: { small: 2, med: 2, large: 3},
        tip: "Tip: The closer your mortar detonates to\n a bot, the more damage it does."
    },    
    {  // level 7
        agents: [10,20,20,20,20,30,30,70,80,90,100, 100],
        artifacts: { small: 2, med: 2, large: 3},
        tip: "Send suggestions to mortarcommander@gmail.com"
    },
    {  // level 8
        agents: [10,10,10,10,100,100,100, 100, 100, 100],
        artifacts: { small: 2, med: 2, large: 3},
        tip: "Tip: The larger ore deposits do more damage\n to your stations."
    },
    {  // level 9
        agents: [1,1,1,1,1,10, 20, 30, 70],
        artifacts: { small: 2, med: 2, large: 3},
        tip: "Tip: Damaged bots move more slowly."
    },
    {  // level 10
        agents: [30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30],
        artifacts: { small: 2, med: 2, large: 3},
        tip: "Tip: You cannot damage your own stations."
    },
    {  // level 11
        agents: [1,1,1, 10, 20, 30, 40, 50, 60, 70, 80, 90],
        artifacts: { small: 2, med: 2, large: 3},
        tip: "That's pretty much it for the tips.\nThere are 20 levels in this version."
    },
    {  // level 12
        agents: [10, 10, 10, 20, 40, 40, 40, 40, 60, 60, 60, 90],
        artifacts: { small: 2, med: 2, large: 3},
        tip: "Slow is smooth. Smooth is fast."
    },
    {  // level 13
        agents: [10, 10, 10, 20, 20, 20, 20, 20, 40, 50, 60, 70],
        artifacts: { small: 2, med: 2, large: 3},
        tip: "These bots do not learn as we do, \n or at all actually."
    },
    {  // level 14
        agents: [10, 10, 20, 20, 20, 21, 34, 67, 67, 67, 76, 76],
        artifacts: { small: 2, med: 2, large: 3},
        tip: "Aim well commander."
    },
    {  // level 15
        agents: [10,10,10,10,10,1,1,1,1,11,1,1,11],
        artifacts: { small: 2, med: 2, large: 3},
        tip: "Mortars are like real estate,\n location is everything."
    },
    {  // level 16
        agents: [4,4,4,11,11,11,11, 25, 25, 75, 75, 75, 100],
        artifacts: { small: 2, med: 2, large: 3},
        tip: "You are doing well, commander."
    },
    {  // level 17
        agents: [1,1,1, 12,12,12,12,12,12,12,85, 85, 85],
        artifacts: { small: 2, med: 2, large: 3},
        tip: "Easy peasy."
    },
    {  // level 18
        agents: [1,1,1, 15, 18, 27, 80, 80, 80, 80, 80, 90],
        artifacts: { small: 2, med: 2, large: 3},
        tip: "Two more levels."
    },
    {  // level 19
        agents: [50],
        artifacts: { small: 2, med: 2, large: 3},
        tip: "The calm before the storm."
    },
    {  // level 20
        agents: [100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100 ],
        artifacts: { small: 2, med: 2, large: 3},
        tip: "The storm."
    }

    
 ]


// TODO Use a function to calculate agent speed based on health
export const AGENT_MAX_SPEED = 0.3
export const AGENT_MIN_SPEED = 0.15
export const AGENT_SIZE  = 1.3  
export const AGENT_SENSOR_RADIUS = 4
export const AGENT_MAX_HEALTH = 100

export const phases = {
    SEEK_ARTIFACT_ZONE: 'Seek Artifact Zone',
    LOCATE_ARTIFACT: 'Locate Artifact',
    COLLECT_ARTIFACT: 'Collect Artifact',
    SEEK_STATION: 'Seek Station'
}

export const ARTIFACT_TYPES = {
    small: { mass: 1, scale: 0.6 },
    medium: { mass: 4, scale: 1 },
    large: { mass: 8, scale: 1.5}
}
export const ARTIFACT_SIZE = 1
export const ARTIFACT_MAX_HEALTH = 20
export const ARTIFACT_INTERACT_COEFF = 1.5
export const ARTIFACT_ZONE_LINE = -12.5
export const ARTIFACT_AREA = {
    
    xMin: -22.55,
    xMax: -14.55,
    zMin: -11.5,
    zMax: 11.5   

}

export const STATION_SIZE = 1
export const STATION_INTERACT_COEFF = 2.5
export const STATION_MAX_HEALTH = 12

export const FRAMETHRESH_GUI = 20

export const VEL_COEFF = 100

export const FIELD_EXTENTS = {
                xMax: 24.6,
                xMin: -24.6,
                zMax: 14.6,
                zMin: -14.6
           }

export const GUTTER_WIDTH = 2  // for edge steer

export const edge = {
    NONE: "none",
    PLUS_X: "+x",
    MINUS_X: "-x",
    PLUS_Z: "+z",
    MINUS_Z: "-z"
}

export const hotgrid = {

    CELL_SIZE: 3,
    ROWS: 9,
    COLUMNS: 4,
    extents: {
        XMIN: -24.55,
        XMAX: -12.55,
        ZMIN: -13.5,
        ZMAX: 13.5        
    }

}

export const MAX_ROUNDS = 4 
export const ROUND_PHASES = {
    ready: 'ready',
    launched: 'launched',
    detonated: 'detonated'
}
export const ROUND_TYPES = {
    gun: 'gun',
    mortar: 'mortar',
    thePackage: 'thePackage'
}

export const GUN_RANGE = 24.0
export const GUN_VELOCITY = 1
export const MORTAR_VELOCITY = 0.55
export const PACKAGE_VELOCITY = 0.3
export const MORTAR_YPEAK = 7
export const GUN_POSITION = {
    x: 24,
    y: 7,
    z:0
}
export const BLAST_ALPHA = 0.9
export const MORTAR_BLAST_RADIUS_START = 1
export const MORTAR_BLAST_LIFE = 10
export const BLAST_DAMAGE_COEFF = 3

export const GUN_BLAST_RADIUS_START = 0.3
export const GUN_BLAST_LIFE = 8

export const POINTS_AGENT_HIT = 50
export const POINTS_ARTIFACT_HIT = 10

export const GAME_PHASES = {
    startLevel: 'startLevel',
    playing: 'playing',
    endLevel: 'endLevel',
    gameOver: 'gameOver'
}

// points to load the heavy mortar
export const PACKAGE_POINTS_THRESH = 12000

//export const TERRAIN_MESH_NAME = "Ntc Import Obj"
export const TERRAIN_MESH_NAME = "TerrainMesh_primitive0"


