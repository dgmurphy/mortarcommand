import * as BABYLON from '@babylonjs/core';

export function createMaterials(scene) {

    let blastMat = new BABYLON.StandardMaterial("blastMat", scene);
    blastMat.diffuseColor =  new BABYLON.Color3(1,.97,.67)
    //psPylonsMat.emissiveColor =  new BABYLON.Color3(.1,.2,.1)
    blastMat.alpha = 0.3


    let psPylonsMat = new BABYLON.StandardMaterial("stationPylons_Lit", scene);
    psPylonsMat.diffuseColor =  new BABYLON.Color3(1,1,1)
    psPylonsMat.emissiveColor =  new BABYLON.Color3(.1,.2,.1)
    //rmat.alpha = 0.5

    let psPylonsDarkMat = new BABYLON.StandardMaterial("stationPylons_Dark", scene);
    psPylonsDarkMat.diffuseColor =  new BABYLON.Color3(0,0,0)
    //psPylonsMat.emissiveColor =  new BABYLON.Color3(.1,.2,.1)

    let agentMat = new BABYLON.StandardMaterial("agentMat", scene)

    let pedestalMat = new BABYLON.StandardMaterial("pedestalMat", scene)
    pedestalMat.diffuseColor =  new BABYLON.Color3(0.2,0.3,.2)

    let powerCoreMat = new BABYLON.StandardMaterial("powerCoreMat", scene)
    powerCoreMat.diffuseColor =  new BABYLON.Color3(0.8, 1, 0.8)
    powerCoreMat.alpha = 0.7

    let powerCoreBrokenMat = new BABYLON.StandardMaterial("powerCoreBrokenMat", scene)
    powerCoreBrokenMat.diffuseColor =  new BABYLON.Color3(0.2, .4, 0.25)
    powerCoreBrokenMat.backFaceCulling = false


    let innerPowerCoreMat = new BABYLON.StandardMaterial("innerPowerCoreMat", scene)
    innerPowerCoreMat.diffuseColor =  new BABYLON.Color3(1,1,1)
    innerPowerCoreMat.emissiveColor =  new BABYLON.Color3(0,0,0)

    let innerPowerCoreBrokenMat = new BABYLON.StandardMaterial("innerPowerCoreBrokenMat", scene)
    innerPowerCoreBrokenMat.diffuseColor =  new BABYLON.Color3(.5,.5,.08)
    

    let artifactShellMat = new BABYLON.StandardMaterial("artifactShellMat", scene)
    artifactShellMat.emissiveColor = new BABYLON.Color3.Gray();
    artifactShellMat.alpha = 0.1
    artifactShellMat.wireframe = true;

    let mortarMat = new BABYLON.StandardMaterial("mortarMat", scene)

    let packageMat = new BABYLON.StandardMaterial("packageMat", scene)

    let bulletMat = new BABYLON.StandardMaterial("bulletMat", scene)
    bulletMat.emissiveColor = new BABYLON.Color3(1,1,1)

    let reticleMat = new BABYLON.StandardMaterial("reticleMat", scene)
    reticleMat.diffuseTexture = new BABYLON.Texture("/textures/reticle_small.png", scene);
    reticleMat.diffuseTexture.hasAlpha = true;
    reticleMat.zOffset = -2;   

    /* materials for artifact health */

    let damageMinorMat = new BABYLON.StandardMaterial("damageMinorMat", scene)
    damageMinorMat.diffuseColor =  new BABYLON.Color3(1, 1, 0)

    let damageMajorMat = new BABYLON.StandardMaterial("damageMajorMat", scene)
    damageMajorMat.diffuseColor =  new BABYLON.Color3(1, .55, 0)

    let damageCriticalMat = new BABYLON.StandardMaterial("damageCriticalMat", scene)
    damageCriticalMat.diffuseColor =  new BABYLON.Color3(1,0,0)


    /* 10 materials for agent health */
    let agentHealtMats = [
        new BABYLON.StandardMaterial("agentHealth0", scene),
        new BABYLON.StandardMaterial("agentHealth1", scene),
        new BABYLON.StandardMaterial("agentHealth2", scene),
        new BABYLON.StandardMaterial("agentHealth3", scene),
        new BABYLON.StandardMaterial("agentHealth4", scene),
        new BABYLON.StandardMaterial("agentHealth5", scene),
        new BABYLON.StandardMaterial("agentHealth6", scene),
        new BABYLON.StandardMaterial("agentHealth7", scene),
        new BABYLON.StandardMaterial("agentHealth8", scene),
        new BABYLON.StandardMaterial("agentHealth9", scene),        
        new BABYLON.StandardMaterial("agentHealth10", scene),        
    ]

    agentHealtMats[0].diffuseColor =  new BABYLON.Color3(.76,.76,1)
    agentHealtMats[1].diffuseColor =  new BABYLON.Color3(.57,.57,1)
    agentHealtMats[2].diffuseColor =  new BABYLON.Color3(.37,.37,1)
    agentHealtMats[3].diffuseColor =  new BABYLON.Color3(.18,.18,1)
    agentHealtMats[4].diffuseColor =  new BABYLON.Color3(0,0,1)
    agentHealtMats[5].diffuseColor =  new BABYLON.Color3(0,0,.86)
    agentHealtMats[6].diffuseColor =  new BABYLON.Color3(0,0,.75)
    agentHealtMats[7].diffuseColor =  new BABYLON.Color3(0,0,.63)
    agentHealtMats[8].diffuseColor =  new BABYLON.Color3(0,0,.51)
    agentHealtMats[9].diffuseColor =  new BABYLON.Color3(0,0,.39)
    agentHealtMats[10].diffuseColor =  new BABYLON.Color3(0,0,.27)
}

export function getAgentMat(scene, health) {
    
    let matIdx = Math.floor(health / 10)
    let matName = "agentHealth" + matIdx
    return scene.getMaterialByName(matName)

}

