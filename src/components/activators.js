import * as BABYLON from '@babylonjs/core'
import { getGroundElevation } from './utils.js'

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
  
    const holocone = BABYLON.MeshBuilder.CreateCylinder("holocone", {height: 1, diameterBottom: 0.65});
    holocone.parent = rotator
    holocone.enableEdgesRendering(); 
    holocone.edgesWidth = 1.5;
    holocone.edgesColor = new BABYLON.Color4(1, 1, 1, 0.25);  

    let holomat = scene.getMaterialByName("holomat")
    holocone.material = holomat
  
    var iconmat = new BABYLON.StandardMaterial("iconmat", scene);
    iconmat.emissiveTexture = new BABYLON.Texture("https://raw.githubusercontent.com/dgmurphy/image-repo/master/mines.png", scene);
    iconmat.backFaceCulling = false;
    iconmat.opacityTexture = new BABYLON.Texture("https://raw.githubusercontent.com/dgmurphy/image-repo/master/mines.png", scene);
   
    var iconplane = BABYLON.MeshBuilder.CreatePlane("iconplane", {}, scene);
    iconplane.parent = rotator
    
    iconplane.scaling = new BABYLON.Vector3(0.9,.9,.9);
    iconplane.material = iconmat;

    /* animation */
    var animationCore = new BABYLON.Animation(name + "_anim", 
        "material.emissiveColor", 30, BABYLON.Animation.ANIMATIONTYPE_COLOR3, 
        BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE)



    return {
        name: name,
        core: CoT,
        rotator: rotator
    }

}

export function addActivator(scene) {

    // TODO make sure new activator does not collide
    //  with existing activators or mines
    
    let name = "activator_" + scene.activatorCounter
    let avator = makeActivator(name, "mines", scene)

    const MAX_X = 7
    const MIN_X = -20
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