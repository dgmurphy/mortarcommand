import * as BABYLON from '@babylonjs/core';

export var holomat
export var iconmat_mine
export var iconmat_cross

export const  roundParticlecolors = {
    particles_color1: new BABYLON.Color4(1,1,1,1),
    particles_color2: new BABYLON.Color4(.4, .3, 0.2, 1.0),
    particles_colorDead: new BABYLON.Color4(0.3, 0.1, 0, 0.0)
}   

export const  roundParticlecolorsBoost = {
    particles_color1: new BABYLON.Color4(.3,1,.3,1),
    particles_color2: new BABYLON.Color4(.4, .7, 0.2, 1.0),
    particles_colorDead: new BABYLON.Color4(0.1, 0.3, 0, 0.0)
}   

export const blastParticlesProps = {
    minSize: .05,
    maxSize: .3,
    maxLifeTime: .003,
    color1: new BABYLON.Color4(.6,.2,.2,1),
    color2: new BABYLON.Color4(.3, .1, .3, 1.0),
    colorDead: new BABYLON.Color4(0.3, 0, 0, 0.0),
    emitRate: 300,
    minEmitPower: 1,
    maxEmitPower: 6
}

export const blastParticlesPropsBoost = {
    minSize: .05,
    maxSize: .32,
    maxLifeTime: .005,
    color1: new BABYLON.Color4(.7,.1,.1,1),
    color2: new BABYLON.Color4(.3, .1, .3, 1.0),
    colorDead: new BABYLON.Color4(0, 0.1, 0, 0.0),
    emitRate: 800,
    minEmitPower: 1,
    maxEmitPower: 20

}



export function createMaterials(scene) {

    var activatorbasemat = new BABYLON.StandardMaterial("activatorbasemat", scene);
    activatorbasemat.diffuseColor = new BABYLON.Color4(.2,.2,.2,1)

    var activatorbaseconemat_1 = new BABYLON.StandardMaterial("activatorbaseconemat_1", scene);
    activatorbaseconemat_1.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);

    var activatorbaseconemat_2 = new BABYLON.StandardMaterial("activatorbaseconemat_2", scene);
    activatorbaseconemat_2.diffuseColor = new BABYLON.Color3(0.9, .9, 0.9);

    var activatorbaseconemat_3 = new BABYLON.StandardMaterial("activatorbaseconemat_3", scene);
    activatorbaseconemat_3.diffuseColor = new BABYLON.Color3(0.8, 0, 1);

    var activatorbaseconemat_4 = new BABYLON.StandardMaterial("activatorbaseconemat_4", scene);
    activatorbaseconemat_4.diffuseColor = new BABYLON.Color3(0.2, 1, 0.2);

    holomat = new BABYLON.StandardMaterial("holomat", scene);
    holomat.backFaceCulling = false
    holomat.alpha = 1
    holomat.opacityTexture = new BABYLON.Texture("textures/scanlines_op.png", scene);
    holomat.emissiveTexture = new BABYLON.Texture("textures/scanlines.png", scene);
    holomat.diffuseTexture = new BABYLON.Texture("textures/scanlines.png", scene);
 
    iconmat_mine = new BABYLON.StandardMaterial("iconmat_mines", scene);
    iconmat_mine.emissiveTexture = new BABYLON.Texture("/textures/mines.png", scene);
    iconmat_mine.backFaceCulling = false;
    iconmat_mine.opacityTexture = new BABYLON.Texture("/textures/mines.png", scene);

    iconmat_cross = new BABYLON.StandardMaterial("iconmat_cross", scene);
    iconmat_cross.emissiveTexture = new BABYLON.Texture("/textures/cross.png", scene);
    iconmat_cross.backFaceCulling = false;
    iconmat_cross.opacityTexture = new BABYLON.Texture("/textures/cross.png", scene);

    var iconmat_bolt = new BABYLON.StandardMaterial("iconmat_bolt", scene);
    iconmat_bolt.emissiveTexture = new BABYLON.Texture("/textures/bolt.png", scene);
    iconmat_bolt.backFaceCulling = false;
    iconmat_bolt.opacityTexture = new BABYLON.Texture("/textures/bolt.png", scene);


    let mineCoreMat = new BABYLON.StandardMaterial("mineCoreMat", scene);
    mineCoreMat.diffuseColor =  new BABYLON.Color3(1,1,.6)
    mineCoreMat.emissiveColor = new BABYLON.Color3(.1,.1,.1)

    let mineRingMat = new BABYLON.StandardMaterial("mineRingMat", scene);
    mineRingMat.diffuseColor =  new BABYLON.Color3(.25,.25,.25)
 
    let mineRingLitMat = new BABYLON.StandardMaterial("mineRingLitMat", scene);
    mineRingLitMat.diffuseColor =  new BABYLON.Color3(1,.2,1)
 
    let blastMat = new BABYLON.StandardMaterial("blastMat", scene);
    blastMat.diffuseColor =  new BABYLON.Color3(1,.97,.67)
    blastMat.alpha = 0.3

    let mineBlastMat = new BABYLON.StandardMaterial("mineBlastMat", scene);
    mineBlastMat.diffuseColor =  new BABYLON.Color3(1,.17,.97)
    mineBlastMat.alpha = 0.3

    let psPylonsMat = new BABYLON.StandardMaterial("stationPylons_Lit", scene);
    psPylonsMat.diffuseColor =  new BABYLON.Color3(1,1,1)
    psPylonsMat.emissiveColor =  new BABYLON.Color3(.1,.2,.1)

    let psPylonsDarkMat = new BABYLON.StandardMaterial("stationPylons_Dark", scene);
    psPylonsDarkMat.diffuseColor =  new BABYLON.Color3(0,0,0)

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
    
    let artifactCoreMat = new BABYLON.StandardMaterial("artifactCoreMat", scene)
    artifactCoreMat.diffuseColor =  new BABYLON.Color3(.7,.7,.7)

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

