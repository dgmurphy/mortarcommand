import * as BABYLON from '@babylonjs/core'
import { getGroundElevation } from './utils.js'
import { POINTS_AGENT_HIT, POINTS_ARTIFACT_HIT } from './constants.js'
import { killAgent, updateAgentColor, killArtifact, updateArtifactColor } from './mortars.js'
import { handleLevelComplete } from './lifecycle.js'


const PROXIMITY_RANGES = [6.0, 5.0, 4.0, 3.0]
const MINE_BLAST_DAMAGE_COEFF = 3.5
const MINE_BLAST_ALPHA = 0.8

// put new mines on the field
export function deployMines(scene) {

    // mines can occupy one of 3 corridors across the width (z) of the field
    // a zone can only have 1 mine at a time

    var occupiedZones = new Array()
    for (var mine of scene.mines) {
        occupiedZones.push(mine.zone)
    }

    for (var zone = 0; zone < 3; ++zone) {
        if (!(zone in occupiedZones)) {
            addMine(scene, zone)
        }
    }

    placeMines(scene)
}

function damageAgents(mine, scene) {

    let range

    for (var agent of scene.agents) { // update agent damage

        range = BABYLON.Vector3.Distance(agent.pos, mine.core.position)

        var effectsRadius = 2.0 * mine.blastRadiusCurrent

        if (range < effectsRadius) {

            agent.health -= (effectsRadius - range) * MINE_BLAST_DAMAGE_COEFF 
            updateAgentColor(agent, scene)
            scene.gameScore += POINTS_AGENT_HIT 
            scene.packagePoints += POINTS_AGENT_HIT 
            

            if (agent.health < 0) 
                killAgent(agent, scene)
            
            if (scene.agents.length === 0) {  // LEVEL COMPLETE
                handleLevelComplete(scene)
            }
        }  
    }      
}


function damageArtifacts(mine, scene) {

    for (var artifact of scene.artifacts) { // update artifact damage
        if (artifact.detected === true) {   // artifact is visible
          var range = BABYLON.Vector3.Distance(artifact.pos, mine.core.position)
          if (range < mine.blastRadiusCurrent) {
            artifact.health -= (mine.blastRadiusCurrent - range) * MINE_BLAST_DAMAGE_COEFF 
            updateArtifactColor(artifact, scene)
            scene.gameScore += POINTS_ARTIFACT_HIT
            scene.packagePoints += POINTS_ARTIFACT_HIT
  
            if(artifact.health < 0)
              killArtifact(artifact, scene)
          }
        }
      }    
}

export function updateMines(scene) {

    for (var mine of scene.mines) {

        if (mine.detonating) {

            mine.blastAge = scene.gameFrame - mine.detonationFrame

            if (mine.blastAge > mine.blastLife) {  // end of life
                destroyMine(mine, scene)
            } else {  // blast expanding

                mine.blastRadiusCurrent = mine.blastRadiusStart + 
                (mine.blastExpansionVelocity * mine.blastAge)
                
                mine.blast.scaling = new BABYLON.Vector3(
                mine.blastRadiusCurrent, 
                mine.blastRadiusCurrent, 
                mine.blastRadiusCurrent)
    
                mine.blast.material.alpha =
                MINE_BLAST_ALPHA - ((mine.blastAge / mine.blastLife) * MINE_BLAST_ALPHA)

                damageAgents(mine, scene)
                damageArtifacts(mine, scene)
                    
 
            }  // blast expanding

        } else {   // update proximity indicators or detonate

            let prox = 0
            let agentProx = 0 

            for (var agent of scene.agents) { 

                var range = BABYLON.Vector3.Distance(agent.pos, mine.core.position)
                if (range < PROXIMITY_RANGES[3]) 
                    agentProx = 4
                else if (range < PROXIMITY_RANGES[2]) 
                    agentProx = 3
                else if  (range < PROXIMITY_RANGES[1]) 
                    agentProx = 2
                else if  (range < PROXIMITY_RANGES[0]) 
                    agentProx = 1

                if (agentProx > prox)
                    prox = agentProx
            }

            updateProximityIndicator(scene, mine, prox)
            
            if (agentProx == 4) {
                detonate(scene, mine)
            }
        } 
    }

    
}

function detonate(scene, mine) {

    //console.log("DETONATING " + mine.name)
    scene.getSoundByName("mine").play()
    mine.detonating = true
    mine.detonationFrame = scene.gameFrame
    mine.blastAge = 0
    mine.blastRadiusCurrent = mine.blastRadiusStart
    mine.shell.setEnabled(false)
    mine.blast.setEnabled(true)
    mine.blastEmitter.radius = mine.blastRadiusStart
    mine.blastParticles.start()

}

function updateProximityIndicator(scene, mine, prox) {

    var unlitMat = scene.getMaterialByName("mineRingMat")
    var litMat = scene.getMaterialByName("mineRingLitMat")

    mine.ring1.material = unlitMat
    mine.ring2.material = unlitMat
    mine.ring3.material = unlitMat


    if (prox > 0) {
        mine.ring1.material = litMat
    }
    if (prox > 1) {
        mine.ring2.material = litMat     
    }
    if (prox > 2) {
        mine.ring3.material = litMat     
    }
}

function makeMine(name, scene) {


    let CoT = new BABYLON.TransformNode(name + "_CoT");

    let shellXform = new BABYLON.TransformNode(name + "mesh_CoT");
    shellXform.parent = CoT

    const cylinder = BABYLON.MeshBuilder.CreateCylinder("mine_cylinder", {
        cap: BABYLON.Mesh.NO_CAP,
        sideOrientation: BABYLON.Mesh.DOUBLESIDE,
        diameter: 1,
        height: 3
        });

    cylinder.position.y = 1

    var cmat = scene.getMaterialByName("mineCoreMat")
    cylinder.material = cmat
    
    cylinder.parent = shellXform

    const cone = BABYLON.MeshBuilder.CreateCylinder("mine_cone", {
        diameterTop:0,
        diameterBottom: 1,
        height: 1
        });
    
    cone.position.y = 3.0
    cone.material = cmat
    cone.parent = shellXform

    // ring 1
    const ring1 = BABYLON.MeshBuilder.CreateCylinder("ring1", {
        height: 0.1,
        diameter: 2.5
    });
    ring1.position.y = 0.4
    ring1.parent = shellXform
      
    // ring 2
    const ring2 = BABYLON.MeshBuilder.CreateCylinder("ring2", {
        height: 0.1,
        diameter: 2.5
    });
    ring2.position.y = 1.1
    ring2.parent = shellXform
      
    // ring 3
    const ring3 = BABYLON.MeshBuilder.CreateCylinder("ring3", {
        height: 0.1,
        diameter: 2.5
    });
    ring3.position.y = 1.8
    ring3.parent = shellXform

    // blast sphere
    let blmat = scene.getMaterialByName("mineBlastMat")
    let blastMesh = BABYLON.MeshBuilder.CreateSphere(name + '_blast', {
            diameter: 1
        }, scene)
    blastMesh.material = blmat
    blastMesh.setEnabled(false)
    blastMesh.parent = CoT

    /* create particles for detonation */
    let flareTexture = new BABYLON.Texture("textures/flare.png", scene);
    let particleOrigin = new BABYLON.TransformNode(name + "_particleOrigin")
    particleOrigin.parent = CoT
    particleOrigin.position.y = 0

    var blastParticles = new BABYLON.GPUParticleSystem(name + "_blastparticles", { capacity: 800 }, scene);
    var hemisphericEmitter = blastParticles.createHemisphericEmitter(1);
    let blastColors = {
        particles_color1: new BABYLON.Color4(.8,.2,.8,1),
        particles_color2: new BABYLON.Color4(.3, .1, .3, 1.0),
        particles_colorDead: new BABYLON.Color4(0.2, 0, 0, 0.2)
    }   
    blastParticles.particleTexture = flareTexture
    blastParticles.emitter = particleOrigin;
    blastParticles.minSize = 0.05;
    blastParticles.maxSize = 0.7;
    blastParticles.maxLifeTime = 3
    blastParticles.targetStopDuration = 5
    blastParticles.color1 = blastColors.particles_color1
    blastParticles.color2 = blastColors.particles_color2
    blastParticles.colorDead = blastColors.particles_colorDead
    blastParticles.emitRate = 1400;
    blastParticles.minEmitPower = 1;
    blastParticles.maxEmitPower = 13;
    blastParticles.preWarmCycles = 100;
    blastParticles.preWarmStepOffset = 5;   
    blastParticles.disposeOnStop = true 

    shellXform.scaling = new BABYLON.Vector3(0.35,0.35,0.35)
    
    return {
        name: name,
        core: CoT,
        shell: shellXform,
        cyl: cylinder,
        ring1: ring1,
        ring2: ring2,
        ring3: ring3,
        detonating: false,
        particleOrigin: particleOrigin,
        blast: blastMesh,
        blastParticles: blastParticles,
        blastEmitter: hemisphericEmitter,
        blastRadiusCurrent: 0,
        blastRadiusStart: 1.5, 
        blastExpansionVelocity: .2,
        detonationFrame: 0,
        blastAge: 0,
        blastLife: 10,    
    }

}


export function addMine(scene, zone) {

    let name = "mine_" + scene.mineCounter
    let mine = makeMine(name, scene)

    const MAX_X = 8
    const MIN_X = -20
    const MIN_Z = -12
    const Z1 = -4
    const Z2 = 4
    const MAX_Z = 12

    var xspan = MAX_X - MIN_X
    var mine_x = MIN_X + (Math.random() * xspan)

    var zone1span = Z1 - MIN_Z
    var zone2span = Z2 - Z1
    var zone3span = MAX_Z - Z2
    var mine_z

    switch(zone) {
        case 0:
          mine_z = MIN_Z + (Math.random() * zone1span)
          break;
        case 1:
          mine_z = Z1 + (Math.random() * zone2span)
          break;
        case 2:
          mine_z = Z2 + (Math.random() * zone3span)
          break;
      
        default:
          console.log("error in addMines - bad zone")
      }   

    mine.core.position.x = mine_x
    mine.core.position.z = mine_z
    mine.zone = zone

    updateProximityIndicator(scene, mine, 0)

    scene.mines.push(mine)
    
    scene.mineCounter += 1


}


// May not need this if mines are added only AFTER game starts
export function placeMines(scene)  {

    for ( var mine of scene.mines ) {

        let x = mine.core.position.x
        let z = mine.core.position.z
        let y = getGroundElevation(x, z, scene)
        let p = new BABYLON.Vector3(x, y, z)
        mine.core.position = p
    }

}


export function destroyMine(mine, scene) {


    const hasName = (obj) => obj.name === mine.name
    const idx = scene.mines.findIndex( hasName )

    if(idx > -1) {
        scene.mines[idx].core.dispose()
        scene.mines.splice(idx, 1)
    }    

    //if (scene.mines.length == 0)
    //    deployMines(scene)

}

export function clearMines(scene) {

    for (var m of scene.mines) {
        m.core.dispose()
    }

    scene.mines = []
}