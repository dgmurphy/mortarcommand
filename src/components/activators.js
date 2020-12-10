import * as BABYLON from '@babylonjs/core'
import { getGroundElevation } from './utils.js'
import { holomat, iconmat } from './materials.js'


const HOLO_ALPHA_MAX = 0.25
const MAX_AGE = 1500
var HOLO_ALPHA = 0.3
const FUSE_TRIGGER = 64


export function updateActivatorColor(activator, scene) {

    let f = activator.fusecount
    let level2 = FUSE_TRIGGER * (2/3)
    let level1 = FUSE_TRIGGER * (1/3)

    if (f > level2) {
        activator.fusecone.material = scene.getMaterialByName("activatorbaseconemat_4")
    }
    else if (f > level1) {
        activator.fusecone.material = scene.getMaterialByName("activatorbaseconemat_3")
    }
    else if (f > 0) {
        activator.fusecone.material = scene.getMaterialByName("activatorbaseconemat_2")
    }
  
}

export function activator_activate(activator, scene) {
    console.log("Activating " + activator.name)
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
  
    const holocone = BABYLON.MeshBuilder.CreateCylinder("holocone", {height: 1.2, diameterBottom: 0.65});
    holocone.parent = rotator
    holocone.enableEdgesRendering(); 
    holocone.edgesWidth = 1.5;
    holocone.edgesColor = new BABYLON.Color4(1, 1, 1, 0.25);  
    holocone.position.y = 0

    //let holomat = scene.getMaterialByName("holomat")
    holocone.material = holomat
  
   
    var iconplane = BABYLON.MeshBuilder.CreatePlane("iconplane", {}, scene);
    iconplane.parent = rotator
    
    iconplane.scaling = new BABYLON.Vector3(0.9,.9,.9);
    
    let iconmat = scene.getMaterialByName("iconmat")
    iconplane.material = iconmat;

    /* animation */
    var animationCore = new BABYLON.Animation(name + "_anim", 
        "material.emissiveColor", 30, BABYLON.Animation.ANIMATIONTYPE_COLOR3, 
        BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE)



    return {
        name: name,
        core: CoT,
        fusecone: basecone,
        fusecount: 0,
        fusetrigger: FUSE_TRIGGER,
        rotator: rotator,
        flickering: false,
        born_frame: scene.gameFrame
    }

}


export function activator_aging(activator, scene) {

    let age = scene.gameFrame - activator.born_frame
    let alpha_coeff = 1

    if (age > MAX_AGE) {
        destroy_activator(activator, scene)
    } else {
        alpha_coeff = 1 - (age/MAX_AGE)
    }

    if (activator.flickering) {
        holomat.alpha = 0
        iconmat.alpha = 0
        if (Math.random() > 0.6) {
            activator.flickering = false  
        }     
    } else {
        holomat.alpha = HOLO_ALPHA * alpha_coeff
        iconmat.alpha = 1 * alpha_coeff
        if (Math.random() > 0.98)
            activator.flickering = true
    }


    

}

export function addActivator(scene) {

    // TODO make sure new activator does not collide
    //  with existing activators or mines
    
    let name = "activator_" + scene.activatorCounter
    let avator = makeActivator(name, "mines", scene)

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