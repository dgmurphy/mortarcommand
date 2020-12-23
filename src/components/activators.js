import * as BABYLON from '@babylonjs/core'
import { getGroundElevation } from './utils.js'
import { holomat, roundParticlecolors, roundParticlecolorsBoost,
    blastParticlesProps, blastParticlesPropsBoost } from './materials.js'
import { deployMines } from './mines.js'
import { repairOneStation } from './station.js'


const HOLO_ALPHA_MAX = 0.25
const MAX_AGE = 1500
const START_FADE_AGE = 500
var HOLO_ALPHA = 0.3
const FUSE_TRIGGER = 64
const SCORE_INCREMENT = 300


function pickActivatorType(scene) {

    var atypes = []

    // if down to one station, pick station health
    if (scene.liveStations == 1) {
        return "health"
    }
    
    if (scene.mines.length < 3)
        atypes.push("mine")

    if (scene.mortarBoost == false)
        atypes.push("bolt")

    if (atypes.length === 0)
        return "none"

    // existing activators should not be duplicated
    for (var a of scene.activators) {
        var idx = atypes.indexOf(a.type)
        if (idx > -1)
            atypes.splice(idx, 1)
    }

    if (atypes.length === 0)
        return "none"

    // pick one from remaining
    let i = Math.floor(Math.random() * atypes.length);
    return atypes[i]


}

export function activatorChance(scene) {


    if (scene.activator_score_thresh_set) {
        let deltascore = scene.gameScore - scene.activator_last_score 
        if (deltascore > scene.activator_score_thresh) {
            var activator_type = pickActivatorType(scene)
            if (activator_type != "none") {
                addActivator(scene, activator_type)
            }
            scene.activator_score_thresh_set = false
        }
    }
    else {
        scene.activator_score_thresh = SCORE_INCREMENT + (Math.random() * 3000)
        scene.activator_score_thresh_set = true
        scene.activator_last_score = scene.gameScore

        var nextActivator = scene.gameScore + scene.activator_score_thresh
        //console.log("NEXT ACTIVATOR AT " + nextActivator)
    }

}

export function updateActivatorColor(activator, scene) {

    let oldfuselevel = activator.fuselevel
    let f = activator.fusecount
    let level2 = FUSE_TRIGGER * (2/3)
    let level1 = FUSE_TRIGGER * (1/3)

    if (f > level2) {
        activator.fusecone.material = scene.getMaterialByName("activatorbaseconemat_4")
        activator.fuselevel = 3
    }
    else if (f > level1) {
        activator.fusecone.material = scene.getMaterialByName("activatorbaseconemat_3")
        activator.fuselevel = 2
    }
    else if (f > 0) {
        activator.fusecone.material = scene.getMaterialByName("activatorbaseconemat_2")
        activator.fuselevel = 1
    }

    if (activator.fuselevel > oldfuselevel)
        scene.getSoundByName("activatorHit").play()
  
}

function enableMortarBoost(scene) {

    scene.mortarBoost = true

    scene.mortarBoostFrame = scene.gameFrame
    scene.getMaterialByName("mortarMat").diffuseColor =  new BABYLON.Color3(.2,.7,.2)
   
    let bmat = scene.getMaterialByName("bulletMat")
    bmat.diffuseColor =  new BABYLON.Color3(0,1,0)
    bmat.emissiveColor =  new BABYLON.Color3(0,1,0)
    
    scene.getMaterialByName("blastMat").diffuseColor =  new BABYLON.Color3(0.4,1,.45)
    scene.getMaterialByName("packageMat").diffuseColor =  new BABYLON.Color3(.2,.7,.2)

   
    for (var r of scene.rounds) {
        r.meshes.particles.color1 = roundParticlecolorsBoost.particles_color1
        r.meshes.particles.color2 = roundParticlecolorsBoost.particles_color2
        r.meshes.particles.colorDead = roundParticlecolorsBoost.particles_colorDead
        r.meshes.bullet.scaling = new BABYLON.Vector3(0.08, 0.9, 0.08);
        r.meshes.blastParticles.minSize = blastParticlesPropsBoost.minSize
        r.meshes.blastParticles.maxSize = blastParticlesPropsBoost.maxSize
        r.meshes.blastParticles.maxLifeTime = blastParticlesPropsBoost.maxLifeTime    
        r.meshes.blastParticles.color1 = blastParticlesPropsBoost.color1    
        r.meshes.blastParticles.color2 = blastParticlesPropsBoost.color2    
        r.meshes.blastParticles.colorDead = blastParticlesPropsBoost.colorDead    
        r.meshes.blastParticles.emitRate = blastParticlesPropsBoost.emitRate    
        r.meshes.blastParticles.minEmitPower = blastParticlesPropsBoost.minEmitPower    
        r.meshes.blastParticles.maxEmitPower = blastParticlesPropsBoost.maxEmitPower    
    }

    scene.BLAST_DAMAGE_COEFF = 9

}

export function disableMortarBoost(scene) {

    scene.mortarBoost = false
    
    scene.getMaterialByName("mortarMat").diffuseColor =  new BABYLON.Color3(1,1,1)

    let bmat = scene.getMaterialByName("bulletMat")
    bmat.diffuseColor =  new BABYLON.Color3(1,1,1)
    bmat.emissiveColor =  new BABYLON.Color3(1,1,1)

    scene.getMaterialByName("blastMat").diffuseColor =  new BABYLON.Color3(1,.97,.67)
    scene.getMaterialByName("packageMat").diffuseColor =  new BABYLON.Color3(1,1,1)

    
    for (var r of scene.rounds) {
        r.meshes.particles.color1 = roundParticlecolors.particles_color1
        r.meshes.particles.color2 = roundParticlecolors.particles_color2
        r.meshes.particles.colorDead = roundParticlecolors.particles_colorDead
        r.meshes.bullet.scaling = new BABYLON.Vector3(0.05, 0.6, 0.05);
        r.meshes.blastParticles.minSize = blastParticlesProps.minSize
        r.meshes.blastParticles.maxSize = blastParticlesProps.maxSize
        r.meshes.blastParticles.maxLifeTime = blastParticlesProps.maxLifeTime    
        r.meshes.blastParticles.color1 = blastParticlesProps.color1    
        r.meshes.blastParticles.color2 = blastParticlesProps.color2    
        r.meshes.blastParticles.colorDead = blastParticlesProps.colorDead    
        r.meshes.blastParticles.emitRate = blastParticlesProps.emitRate    
        r.meshes.blastParticles.minEmitPower = blastParticlesProps.minEmitPower    
        r.meshes.blastParticles.maxEmitPower = blastParticlesProps.maxEmitPower    
    }

    scene.BLAST_DAMAGE_COEFF = 3
}



export function activator_activate(activator, scene) {

    switch(activator.type) {
        case 'mine':
            deployMines(scene)
          break;
        case 'health':
            repairOneStation(scene)
        break;
        case 'bolt':
            enableMortarBoost(scene)
            break;
        default:
            console.log("error in activator type")
    }

    scene.getSoundByName("activatorPowerUp").play()
    destroy_activator(activator, scene)
}


function makeActivator(name, activator_type, scene) {

    let CoT = new BABYLON.TransformNode(name + "_CoT");

    let xform = new BABYLON.TransformNode(name + "_xform");
    xform.parent = CoT
    xform.position.y = .8
    xform.rotation.y  =  1.571
    xform.scaling = new BABYLON.Vector3(.8, .8, .8)

    let rotator = new BABYLON.TransformNode(name + "_rotator");
    rotator.parent = xform

    const base = BABYLON.MeshBuilder.CreateCylinder("base", {height: 1.15, depth: 0.15, diameter: 1.2});
    base.parent = xform
    base.position.y = -1.45

    let basemat = scene.getMaterialByName("activatorbasemat")
    base.material = basemat
    
    var basecone = BABYLON.MeshBuilder.CreateCylinder("basecone", {height: 0.35, diameterTop: 0.65, depth: 0.55});
    basecone.parent = xform   
    basecone.position.y = -.75

    let baseconemat = scene.getMaterialByName("activatorbaseconemat_1")
    basecone.material = baseconemat
  
    const holocone = BABYLON.MeshBuilder.CreateCylinder("holocone", {height: 1.4, diameterBottom: 0.65, cap:BABYLON.Mesh.NO_CAP});
    holocone.parent = rotator 
    holocone.position.y = 0.15

    //let holomat = scene.getMaterialByName("holomat")
    holocone.material = holomat
   
    var iconplane = BABYLON.MeshBuilder.CreatePlane("iconplane", {}, scene);
    iconplane.parent = rotator
    
    iconplane.scaling = new BABYLON.Vector3(0.9,.9,.9);
    
    /* animation */
    var animationCore = new BABYLON.Animation(name + "_anim", 
        "material.emissiveColor", 30, BABYLON.Animation.ANIMATIONTYPE_COLOR3, 
        BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE)

    switch(activator_type) {
            case 'mine':
                iconplane.material = scene.getMaterialByName("iconmat_mines")
              break;
            case 'health':
                iconplane.material = scene.getMaterialByName("iconmat_cross")
              break;
            case 'bolt':
                iconplane.material = scene.getMaterialByName("iconmat_bolt")
                break;
            default:
                console.log("error in activator type")
    }

    return {
        name: name,
        core: CoT,
        fusecone: basecone,
        fusecount: 0,
        fusetrigger: FUSE_TRIGGER,
        fuselevel: 0,
        rotator: rotator,
        flickering: false,
        born_frame: scene.gameFrame,
        type: activator_type,
        iconmat: iconplane.material
    }

}


export function activator_aging(activator, scene) {

    let age = scene.gameFrame - activator.born_frame
    let alpha_coeff

    if (age > MAX_AGE) {
        // play error sound
        scene.getSoundByName("power-off").play()
        destroy_activator(activator, scene)
    } else if (age > START_FADE_AGE) {
        alpha_coeff = 1 - ((age - START_FADE_AGE)/MAX_AGE)
    } else {
        alpha_coeff = 1
    }

    if (activator.flickering) {
        holomat.alpha = 0
        activator.iconmat.alpha = 0
        if (Math.random() > 0.6) {
            activator.flickering = false  
        }     
    } else {
        holomat.alpha = HOLO_ALPHA * alpha_coeff
        activator.iconmat.alpha = 1 * alpha_coeff
        if (Math.random() > 0.98)
            activator.flickering = true
    }
}

export function addActivator(scene, activator_type) {

    // TODO make sure new activator does not collide
    //  with existing activators or mines
    
    let name = "activator_" + scene.activatorCounter
    let avator = makeActivator(name, activator_type, scene)

    const MAX_X = 7
    const MIN_X = -10
    const MIN_Z = -12
    const MAX_Z = 12

    var xspan = MAX_X - MIN_X
    var avator_x = MIN_X + (Math.random() * xspan)

    var zspan = MAX_Z - MIN_Z
    var avator_z = MIN_Z + (Math.random() * zspan)
    var avator_y = getGroundElevation(avator_x, avator_z, scene)
    if (avator_y == 0)
        console.log("ERROR placing Activator - Ground Elevation Not Found")
    avator.core.position = new BABYLON.Vector3(avator_x, avator_y, avator_z)

    scene.activators.push(avator)
    scene.activatorCounter += 1

    scene.getSoundByName("newActivator").play()
}

export function clearActivators(scene) {

    for (var a of scene.activators) {
        a.core.dispose()
    }

    scene.activators = []
}

function destroy_activator(activator, scene) {

    const hasName = (obj) => obj.name === activator.name
    const idx = scene.activators.findIndex( hasName )

    if(idx > -1) {
        scene.activators[idx].core.dispose()
        scene.activators.splice(idx, 1)
    }    

}
