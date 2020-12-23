import * as BABYLON from '@babylonjs/core';
import { getAngle, getGroundRange } from './utils.js'
import { FRAMETHRESH_GUI, FIELD_EXTENTS, phases, edge, 
        STATION_MAX_HEALTH, hotgrid, GUTTER_WIDTH, AGENT_SENSOR_RADIUS,
        AGENT_MAX_SPEED, AGENT_MAX_HEALTH, AGENT_MIN_SPEED, WATER_TRAIL_COLOR1,
        WATER_TRAIL_COLOR2, WATER_TRAIL_COLOR_DEAD,
        AGENT_TRAIL_COLOR1, AGENT_TRAIL_COLOR2, 
        AGENT_TRAIL_COLOR_DEAD, MORTAR_BOOST_LIFE} from './constants.js'
import { randomSteerMotivator, seekZoneMotivator, locateArtifactMotivator,
         moveToTargetMotivator, avoidEdgeMotivator } from './steering-motivators.js'
import { setModeInputs } from './mode-utils.js'
import { updateRounds, updateThePackage } from './mortars.js'
import { setArtifactDetected } from './agent.js';
import { updateMines } from './mines.js';
import { activator_aging, activatorChance, disableMortarBoost } from './activators.js'
import { TERRAIN_MESH_NAME, HAS_WATER, WATERBOX } from './per-table-constants.js'



// Animate agent in an event loop
export function startAgentAnim(scene, handleUpdateGUIinfo) {

    // Object meshes
    let terrainMesh = scene.getMeshByName(TERRAIN_MESH_NAME);

    let frameCounter = 0
    let modeCheckCounter = 0
    let modeCheckThresh = 10


    // **************   Game/Render loop **************************
    let botObs = scene.onBeforeRenderObservable.add(function () {

        // Frame counter
        scene.gameFrame += 1

        updateRounds(scene)
        updateThePackage(scene)
        updateMines(scene)

        // TODO only check if there are any agents in the artifact zone
        detectArtifacts(scene)

        // animate stations
        for (var station of scene.powerStations) {
            let spinSpeed = ((STATION_MAX_HEALTH - station.health) * .01) + .01
            station.shell.rotate(BABYLON.Axis.Y, spinSpeed, BABYLON.Space.LOCAL)
        }

        // animator activators
        for (var activator of scene.activators) {
            let spinSpeed = .02
            activator.rotator.rotate(BABYLON.Axis.Y, spinSpeed, BABYLON.Space.LOCAL)

            activator_aging(activator, scene)
        }


        // Check for mode change on interval (higher interval => better perf)
        var agent
        if (modeCheckCounter === modeCheckThresh) {

            setModeInputs(scene, handleUpdateGUIinfo)
            for (agent of scene.agents)
                steeringPoll(agent)

            // do activatorCheck
            activatorChance(scene)

            // check if mortar boost is expired
            if ((scene.gameFrame - scene.mortarBoostFrame) > MORTAR_BOOST_LIFE)
                disableMortarBoost(scene)

            modeCheckCounter = 0
        }

    
        for (agent of scene.agents)
            anim(agent, terrainMesh)


        // DOM update is performance hit
        if (frameCounter === FRAMETHRESH_GUI) {

            if (scene.gameScore > scene.hiGameScore)
                scene.hiGameScore = scene.gameScore
        
            handleUpdateGUIinfo()   // update score

            frameCounter = 0
        } // end of frame counter block
    
        frameCounter += 1
        modeCheckCounter += 1
       
    })
    // ************** Game/Render loop done ***********************************

    return botObs
}


export function drive(agentInfo) {

    let r = AGENT_MAX_SPEED * (agentInfo.health / AGENT_MAX_HEALTH)  // distance increment raw
    if (r < AGENT_MIN_SPEED)
        r = AGENT_MIN_SPEED
    let agentPos = agentInfo.meshes.body.position
    let particles = agentInfo.meshes.particles

    // *** Scale the distance increment according to the mesh slope in the heading direction
    // hvecx, hvecz: heading components
    let hvecx = Math.cos(agentInfo.heading * (Math.PI / 180.0))
    let hvecz = Math.sin(agentInfo.heading * (Math.PI / 180.0))
    let hvec = new BABYLON.Vector3(hvecx, 0, hvecz)
    hvec = BABYLON.Vector3.Normalize(hvec)

    // normal to the face at my position
    let nvec = BABYLON.Vector3.Normalize(agentInfo.norm)

    // angle between heading and face normal
    // zero vel if slope > 135 deg, max vel reached at < 45 deg
    let theta = getAngle(hvec, nvec) * 180.0 / Math.PI;

    // The inclineCoeff increaes the delta-s increment when going
    //  downhill, and in decreases it going up hill. A sort of
    // "Velocity" based on slope of terrian.
    let inclineCoeff    

    if (theta < 45)
        inclineCoeff = 1    // steep downhill gets max velocity
    else if (theta > 135)
        inclineCoeff = 0    // > steep uphill completely stopped
    else                    
        inclineCoeff = ((-1 / 90.0) * theta) + 1.5   // linear in between

    // check to make sure its not negative
    if (inclineCoeff < 0) 
        inclineCoeff = 0
    
    // create a distance increment
    let ds = inclineCoeff * r

    // colorize & size particle trail
    if (HAS_WATER)
        colorizeParticles(agentPos, particles, ds)

    // Keep the agent inside terrian extents
    let testx = agentPos.x + ds * hvecx

    if ((testx < FIELD_EXTENTS.xMax) && (testx > FIELD_EXTENTS.xMin))
        agentPos.x += (ds * hvecx)

    let testz = agentPos.z + ds * hvecz
    if ((testz < FIELD_EXTENTS.zMax) && (testz > FIELD_EXTENTS.zMin))
        agentPos.z += (ds * hvecz)    

    let pos = new BABYLON.Vector3(agentPos.x, agentPos.y, agentPos.z)

    return pos
}


function colorizeParticles(agentPos, particles, ds) {

    var color1, color2, colorDead, particlePower

    if(isOverWater(agentPos)) {

        particlePower =  200

        color1 =  new BABYLON.Color4(WATER_TRAIL_COLOR1[0],
            WATER_TRAIL_COLOR1[1],
            WATER_TRAIL_COLOR1[2],
            WATER_TRAIL_COLOR1[3])

        color2 =  new BABYLON.Color4(WATER_TRAIL_COLOR2[0],
            WATER_TRAIL_COLOR2[1],
            WATER_TRAIL_COLOR2[2],
            WATER_TRAIL_COLOR2[3])

        colorDead =  new BABYLON.Color4(WATER_TRAIL_COLOR_DEAD[0],
            WATER_TRAIL_COLOR_DEAD[1],
            WATER_TRAIL_COLOR_DEAD[2],
            WATER_TRAIL_COLOR_DEAD[3])

    } else {

        particlePower = 100

        color1 =  new BABYLON.Color4(AGENT_TRAIL_COLOR1[0],
            AGENT_TRAIL_COLOR1[1],
            AGENT_TRAIL_COLOR1[2],
            AGENT_TRAIL_COLOR1[3])

        color2 =  new BABYLON.Color4(WATER_TRAIL_COLOR2[0],
            AGENT_TRAIL_COLOR2[1],
            AGENT_TRAIL_COLOR2[2],
            AGENT_TRAIL_COLOR2[3])

        colorDead =  new BABYLON.Color4(WATER_TRAIL_COLOR_DEAD[0],
            AGENT_TRAIL_COLOR_DEAD[1],
            AGENT_TRAIL_COLOR_DEAD[2],
            AGENT_TRAIL_COLOR_DEAD[3])

    }

    particles.color1 = color1
    particles.color2 = color2
    particles.colorDead = colorDead

    particles.maxEmitPower = particlePower * ds


}

function isOverWater(agentPos) {

    
    if ((agentPos.x < WATERBOX.xMax) &&
        (agentPos.x > WATERBOX.xMin) &&
        (agentPos.z < WATERBOX.zMax) &&
        (agentPos.z > WATERBOX.zMin)) {
            return true
        }

    return false
}

export function anim(agentInfo, terrainMesh) {

    // Change heading and current turning direction
    if (agentInfo.steeringMode.dir !== 'straight')
        agentInfo.heading = changeHeading(agentInfo.steeringMode.dir, agentInfo.heading)

    agentInfo.pos = drive(agentInfo)

    // update the Y component
    agentInfo.norm = castRayForHeight(agentInfo.meshes.body, terrainMesh, agentInfo.heading)

    if(agentInfo.phase === phases.LOCATE_ARTIFACT)
        updateHotGrid(agentInfo)

}



export function castRayForHeight(agentMesh, terrainMesh, heading) {

    let norm;

    // Casting a ray to get height
    var ray = new BABYLON.Ray(new BABYLON.Vector3(agentMesh.position.x,
      terrainMesh.getBoundingInfo().boundingBox.maximumWorld.y + 1,
      agentMesh.position.z), new BABYLON.Vector3(0, -1, 0)); // Direction

    var worldInverse = new BABYLON.Matrix();

    terrainMesh.getWorldMatrix().invertToRef(worldInverse);

    ray = BABYLON.Ray.Transform(ray, worldInverse);

    var pickInfo = terrainMesh.intersects(ray);

    if (pickInfo.hit) {

      // put the agent on the ground
      agentMesh.position.y = pickInfo.pickedPoint.y - 0.01

      // Tilt the model normal to the ground
      norm = pickInfo.getNormal(true)  // Get the normal in World space
      let cross = BABYLON.Vector3.Cross(BABYLON.Axis.Y, norm) // axis perp to Y and face normal
      let theta = getAngle(BABYLON.Axis.Y, norm)  // angle between axis and face normal

      // rotate model around the cross axis to align the model Y with the face normal
      agentMesh.rotationQuaternion = new BABYLON.Quaternion.RotationAxis(cross, theta);

      // rotate so that front of mesh faces heading direction
      agentMesh.rotate(BABYLON.Axis.Y, -heading * Math.PI / 180, BABYLON.Space.LOCAL)

    }

    return norm

  }


// Turn by delta-h and reset angles if needed
export function changeHeading(dir, heading) {

    let dh = 4.0   // TODO GUI control 'turn sensitivity'

    if (dir === 'left') {
        heading += dh;
        if (heading > 180) {
            heading = -179
        }
    } else {
        heading -= dh;
        if (heading < -180) {
            heading = 179
        }
    }
    return heading

}


// Poll the steering motivators to see if we want
// to change steering mode (left | right | straight).
// High changeDirThresh resists frequent direction
// changes. Low thresh allows frequent changes.
function steeringPoll( agentInfo ) {

    // TODO Is this needed? Maybe just use the mode 
    //   check interval to control this
    let changeDirThresh = 0.2  // TODO GUI control

    let polls = []
    let totals = {left: 0, right: 0, straight: 0}

    // add relevant polls 
    let rsPoll = randomSteerMotivator()
    polls.push(rsPoll)   // always use

    // If I'm near the edge
    nearEdge( agentInfo)  // check if agent is close to edge
    if (agentInfo.nearEdge !== edge.NONE) {
        let nePoll = avoidEdgeMotivator(agentInfo)
        polls.push(nePoll)
    }

    // add phase-based poll
    let phasePoll
    switch (agentInfo.phase) {

        case phases.SEEK_STATION:
        case phases.COLLECT_ARTIFACT:    
            phasePoll = moveToTargetMotivator(agentInfo) 
            break

        case phases.LOCATE_ARTIFACT:
            phasePoll = locateArtifactMotivator(agentInfo) 
            break

        case phases.SEEK_ARTIFACT_ZONE:
            phasePoll = seekZoneMotivator( agentInfo )
            break
        
        default:

    }

    polls.push(phasePoll)

    // execute polls and tally results
    for (var poll of polls) {
        totals.left += poll.left
        totals.right += poll.right
        totals.straight += poll.straight
    }

    let winner = getPollWinner(totals)

    if ( winner.weight > changeDirThresh )  // do nothing if the threshold is not met
        agentInfo.steeringMode = winner    // return (possibly new) steering mode
    
}

// Return the highest weighted direction (and the weight)
function getPollWinner( poll ) {

    if ((poll.left > poll.right) && (poll.left > poll.straight))
        return { dir: 'left', weight: poll.left }

    if ((poll.right > poll.left) && (poll.right > poll.straight))
        return { dir: 'right', weight: poll.right }

    return { dir: 'straight', weight: poll.straight }
    
}


// Keep track of visited grid squares in the artifact
//  zone to help agents locate the flag 
function updateHotGrid( agentInfo ) {

    let pos = agentInfo.pos

    // check if I'm off the hotgrid
    if ( (pos.x > hotgrid.extents.XMAX) || 
        (pos.x < hotgrid.extents.XMIN) ||
        (pos.z > hotgrid.extents.ZMAX) ||
        (pos.z < hotgrid.extents.ZMIN) ) {
        return    // not on grid, don't update it
    }

    let idx = getHotGridIndex(agentInfo.pos)
    agentInfo.hotGrid[idx] += 1

}

function nearEdge( agentInfo ) {

    if (agentInfo.pos.x > (FIELD_EXTENTS.xMax - GUTTER_WIDTH))
        agentInfo.nearEdge = edge.PLUS_X
    else if (agentInfo.pos.x < (FIELD_EXTENTS.xMin + GUTTER_WIDTH))
        agentInfo.nearEdge = edge.MINUS_X
    else if (agentInfo.pos.z > (FIELD_EXTENTS.zMax - GUTTER_WIDTH))
        agentInfo.nearEdge = edge.PLUS_Z
    else if (agentInfo.pos.z < (FIELD_EXTENTS.zMin + GUTTER_WIDTH))
        agentInfo.nearEdge = edge.MINUS_Z
    else 
        agentInfo.nearEdge = edge.NONE

}

function detectArtifacts(scene) {


    /* for each undetected artifact check range to all agents */
    for (var artifact of scene.artifacts) {

        if (!artifact.detected) {

            for (var agent of scene.agents) {

                if (agent.pos.x < 0)  { // quick filter (agent must be past midfield)

                    let r = getGroundRange(agent.pos, artifact.pos)

                    if (r < AGENT_SENSOR_RADIUS) {
                        setArtifactDetected(artifact, true)
                    }
                }

            } // each agent
        }  // not detected
    }  // each artifact
}

// return the cell index of the visited cell
function getHotGridIndex(pos) {

    let xoff
    let col
    let zoff
    let row
    let idx

    xoff = pos.x - hotgrid.extents.XMIN
    col = Math.floor(xoff / 3)

    zoff = hotgrid.extents.ZMAX - pos.z
    row = Math.floor(zoff / 3)

    idx = (row * 4) + col
    //console.log("HG idx: " + idx)

    return idx
}

