import * as BABYLON from '@babylonjs/core'
import { getGroundElevation, addAxes } from './utils.js'


function makeMine(name, size, scene) {

    // const coreName = name + "_core"
    
    // var coreSize = size * ARTIFACT_SIZE
    // var coreMesh = BABYLON.MeshBuilder.CreatePolyhedron(coreName, { type: 2, size: coreSize }, scene);
    // coreMesh.rotationQuaternion = randomRotation()

    // var shellRadius = coreSize * ARTIFACT_INTERACT_COEFF
    // var shellMesh =  BABYLON.MeshBuilder.CreateIcoSphere("icosphere", {radius:shellRadius, subdivisions: 4}, scene)

    // var shellMat = scene.getMaterialByName("artifactShellMat")
    // shellMesh.material = shellMat;
    // shellMesh.addChild(coreMesh)
    let CoT = new BABYLON.TransformNode(name);
    

    const cylinder = BABYLON.MeshBuilder.CreateCylinder("cylinder", {
        cap: BABYLON.Mesh.NO_CAP,
        sideOrientation: BABYLON.Mesh.DOUBLESIDE
        });

    cylinder.position.y = 1

    var cmat = scene.getMaterialByName("mineCoreMat")
    cylinder.material = cmat
    
    cylinder.parent = CoT

    const cone = BABYLON.MeshBuilder.CreateCylinder("cone", {
        diameterTop:0,
        height: 1
        });
    
    cone.position.y = 2.5
    cone.material = cmat
    cone.parent = CoT

    // ring 1
    const ring1 = BABYLON.MeshBuilder.CreateCylinder("ring1", {
        height: 0.1,
        diameter: 1.5
    });
    ring1.position.y = 0.4
    ring1.parent = CoT
      
    // ring 2
    const ring2 = BABYLON.MeshBuilder.CreateCylinder("ring2", {
        height: 0.1,
        diameter: 1.5
    });
    ring2.position.y = 0.9
    ring2.parent = CoT
      
    // ring 3
    const ring3 = BABYLON.MeshBuilder.CreateCylinder("ring3", {
        height: 0.1,
        diameter: 1.5
    });
    ring3.position.y = 1.4
    ring3.parent = CoT
      

    CoT.scaling = new BABYLON.Vector3(0.25,0.25,0.25)
    
    return {
        core: CoT,
        cyl: cylinder,
        ring1: ring1,
        ring2: ring2,
        ring3: ring3
    }

    
    // return { core: coreMesh, 
    //          shell: shellMesh, 
    //          shellRadius: shellRadius
    //         }
}


export function addMine(scene) {

    addAxes(scene)

    // let name = "artifact_" + scene.nextArtifactId
    // scene.nextArtifactId += 1

    // if (!type) {

    //     let r = Math.random() * 100
    //     if (r < 20)
    //         type = ARTIFACT_TYPES.small
    //     else if (r > 80)
    //         type = ARTIFACT_TYPES.large
    //     else
    //         type = ARTIFACT_TYPES.medium

    // }

    let mine = makeMine("mine", 1, scene)
    mine.core.position.x = 4
    mine.core.position.z = -7

    scene.mines.push(mine)
    placeMines(scene)

    // let meshes = makeArtifact(name, type.scale, scene)
    // meshes.shell.position = position || generateArtifactPosition(scene)

    // let artifact = {
    //     name: name,
    //     type: type,
    //     pos: meshes.shell.position,
    //     meshes: meshes,
    //     interactRadius: meshes.shellRadius,
    //     detected: false,
    //     health: ARTIFACT_MAX_HEALTH
    // }

    // setArtifactDetected(artifact, false)

    // scene.artifacts.push(artifact)

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


export function destroyMine(agentInfo, scene) {

    // agentInfo.meshes.body.dispose()
    // agentInfo.meshes.particles.dispose()
    // agentInfo.meshes.cargo.dispose()
    // agentInfo.meshes.damageParticles.dispose()

}


