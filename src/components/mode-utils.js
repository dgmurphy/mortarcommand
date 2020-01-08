import * as BABYLON from '@babylonjs/core'
import { getGroundRange } from './utils.js'
import { phases, ARTIFACT_ZONE_LINE } from './constants.js'
import { addArtifact } from './agent.js'
import { destroyStation, updatePowerStationGraphics } from './station.js'
import { enableStationWreckage } from './station.js'
import { handleGameOver } from './lifecycle.js'


export function setModeInputs(scene, handleUpdateGUIinfo) {

    for (var agentInfo of scene.agents) {

        // phase update
        if (agentInfo.artifactCollected)            // has artifact
            hasArtifactMode(agentInfo, scene, handleUpdateGUIinfo)
        else                                        // artifact not collected
            getArtifactMode(agentInfo, scene)

    }
}
        
            

function hasArtifactMode(agentInfo, scene, handleUpdateGUIinfo) {

    let station = hasReachedStation(agentInfo, scene)

    if ( station != null ) {  // at station

        handleReachedStation(agentInfo, station, scene, handleUpdateGUIinfo)

    } else if ( !targetStationExists(agentInfo, scene) ) {

        selectStation(agentInfo, scene)
    }

}


function getArtifactMode(agentInfo, scene) {

    if ( !inArtifactZone(agentInfo) ) {

        agentInfo.phase = phases.SEEK_ARTIFACT_ZONE

    } else {  // in artifact zone

        let reachedArtifact = hasReachedVisibleArtifact(agentInfo, scene)

        if (reachedArtifact != null) {

            handleReachedArtifact(agentInfo, reachedArtifact, scene)
            
        } else {   // in zone, not at artifact

            inZoneMode(agentInfo, scene)

        }

    }

}


function inZoneMode(agentInfo, scene) {

    let visibleArtifacts = getVisibleArtifacts(scene)

    if ( !agentInfo.targetSelected ) {  // no target
        
        if ( visibleArtifacts.length > 0 ) {
            
            selectArtifact(agentInfo, visibleArtifacts)

        } else {  // no visible artifacts

            agentInfo.phase = phases.LOCATE_ARTIFACT
        }

    } else {  // has target

        if ( targetArtifactExists(agentInfo, scene) ) {

            agentInfo.phase = phases.COLLECT_ARTIFACT

        } else {  // target has dissappeared

            agentInfo.targetSelected = false

            if ( visibleArtifacts.length > 0 ) {  // pick new target
            
                selectArtifact(agentInfo, visibleArtifacts)

            } else {  // no visible artifacts

                agentInfo.phase = phases.LOCATE_ARTIFACT
            }                            

        }

    }

}


function inArtifactZone(agentInfo) {

    if (agentInfo.pos.x < ARTIFACT_ZONE_LINE)
        return true
    else
        return false

}


function getVisibleArtifacts(scene) {

    let visibleArtifacts = []

    for (var artifact of scene.artifacts) {

        if ( artifact.detected )
            visibleArtifacts.push(artifact)
    }

    return visibleArtifacts
}


export function resetHotGrid( agentInfo ) {

    let idx
    for (idx = 0; idx < 36; idx++) 
        agentInfo.hotGrid[idx] = 0   

}


function handleReachedStation(agentInfo, reachedStation, scene, handleUpdateGUIinfo) {

    // update the properties for the reached station
    reachedStation.health -= agentInfo.payloadMass

    

    if (reachedStation.health <= 0) {

        // show the station wreckage
        enableStationWreckage(scene, reachedStation)

        destroyStation(reachedStation, scene, handleUpdateGUIinfo)    

        if (scene.powerStations.length === 0) {  // GAME OVER
            handleGameOver(scene, handleUpdateGUIinfo)
        } 

    } else {

        updatePowerStationGraphics(reachedStation, scene)
        scene.getSoundByName("station-damage").play()


    }

    agentInfo.phase = phases.SEEK_ARTIFACT_ZONE   // get more artifacts
    agentInfo.targetSelected = false
    agentInfo.targetName = 'none'
    agentInfo.artifactCollected = false
    agentInfo.payloadMass = 0 
    agentInfo.meshes.cargo.isVisible = false
    resetHotGrid( agentInfo )
}


function handleReachedArtifact(agentInfo, rart, scene) {

    agentInfo.artifactCollected = true
    agentInfo.payloadMass = rart.type.mass
    agentInfo.meshes.cargo.isVisible = true
    agentInfo.targetSelected = false
    agentInfo.targetName = 'none'
    agentInfo.phase = phases.SEEK_STATION

    scene.getSoundByName("ore").play()
    
    // destroy artifact
    const hasName = (obj) => obj.name === rart.name;
    const idx = scene.artifacts.findIndex( hasName )
    if(idx > -1) {
        scene.artifacts[idx].meshes.shell.dispose()
        scene.artifacts.splice(idx, 1)
    }

    // replace this artifact with a new one
    addArtifact(scene)    

    selectStation(agentInfo, scene)

}


function selectArtifact(agentInfo, visibleArtifacts) {

    /* pick the artifact nearest me */
    let range_min = 100 

    for (const artifact of visibleArtifacts) {

        let r = getGroundRange(artifact.pos, agentInfo.pos)
        if (r < range_min) {
            range_min = r
            agentInfo.targetName = artifact.name
            agentInfo.targetPos = artifact.pos
            agentInfo.targetInteractRadius = artifact.interactRadius
            agentInfo.targetSelected = true
        }
    }

}

export function selectStation(agentInfo, scene) {

    // how many stations are left?
    let numStations = scene.powerStations.length

    if (numStations === 0) {  


       // set agent target to midfield
       agentInfo.targetSelected = true
       agentInfo.targetName = "midfield"
       agentInfo.targetPos = new BABYLON.Vector3(0,0,0)
       agentInfo.targetInteractRadius = 0


    } else {

        // pick a random station
        let idx = Math.floor(Math.random() * numStations)
        let station = scene.powerStations[idx]

        agentInfo.targetSelected = true
        agentInfo.targetName = station.name
        agentInfo.targetPos = station.pos
        agentInfo.targetInteractRadius = station.interactRadius
    }


}


function targetStationExists( agentInfo, scene ) {

    if (scene.powerStations.length === 0)
        return false

    const hasName = (obj) => obj.name === agentInfo.targetName
    const idx = scene.powerStations.findIndex( hasName )
    
    if (idx > -1) {
        return true
    }
    else {
        //console.log("Station missing: " + agentInfo.targetName)
        return false
    }
        

}


function targetArtifactExists( agentInfo, scene ) {

    const hasName = (obj) => obj.name === agentInfo.targetName
    const idx = scene.artifacts.findIndex( hasName )
    
    if (idx > -1) {
        return true
    }
    else {
        //console.log("Artifact missing: " + agentInfo.targetName)
        //console.log("NUM VISIBLE: " + getVisibleArtifacts(scene).length) // DEBUG
        return false
    }

}


function  hasReachedStation(agentInfo, scene) {

    for ( var station of scene.powerStations ) {
        if ( getGroundRange(station.pos, agentInfo.pos) < station.interactRadius )
            return station
    }  

    return null

}


function hasReachedVisibleArtifact(agentInfo, scene) {

    let varts = getVisibleArtifacts(scene)  // Visible Artifacts

    for (var vart of varts) {
        if (getGroundRange(agentInfo.pos, vart.pos) < vart.interactRadius)
            return vart
    }

    return null
}