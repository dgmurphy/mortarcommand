import * as BABYLON from '@babylonjs/core'
import { STATION_SIZE, STATION_INTERACT_COEFF, STATION_MAX_HEALTH,
         GUN_POSITION } from './constants.js'
import { getTruncatedIcosahedron, getBrokenIcosahedron } from './geometry.js'
import { getGroundElevation } from './utils.js'
import { handleGameOver } from './lifecycle.js'


// restore one wreck
export function repairOneStation(scene) {

    var wreck = null
    for (var w of scene.wreckedStations) {
        if (w.shell.isEnabled()) {
            wreck = w
            break
        }
    }

    if (wreck !== null) {

        // get the station info
        let id = wreck.id
        let posx = wreck.shell.position.x
        let posz = wreck.shell.position.z

        /* remove the wreckage */
        wreck.shell.dispose()
        wreck.innerCore.dispose()
        wreck.particles.dispose()

        const hasId = (obj) => obj.id === id
        const idx = scene.wreckedStations.findIndex(hasId)
        scene.wreckedStations.splice(idx, 1)

        /* replace the station */
        addPowerStation(scene, posx, posz, id)
    }
}

function makePowerStation(name, scene) {

    /* perimeter */
    var rmat = scene.getMaterialByName("stationPylons_Lit")

    let perimeterRadius = STATION_INTERACT_COEFF * STATION_SIZE
    let pylons = []
    let theta = 0
    var CoT = new BABYLON.TransformNode(name + "_powerStationRoot");
    
    for (var i = 0; i < 12; i++) {
        
        let pylonName = name + "_pylon_" + i
        pylons[i] = BABYLON.MeshBuilder.CreateCylinder(pylonName, 
            {diameterBottom:0.2, diameterTop: 0.07, 
             height: 0.5, tessellation: 8}, scene)
        pylons[i].convertToFlatShadedMesh()

        theta = i * (Math.PI / 6)
        let px = Math.cos(theta) * perimeterRadius
        let pz = Math.sin(theta) * perimeterRadius
        let py = 0

        pylons[i].position = new BABYLON.Vector3(px, py, pz)
        pylons[i].material = rmat
        pylons[i].parent = CoT
    
        
    }
    
    /* Pedestal */
    var pmat = scene.getMaterialByName("pedestalMat")

    var pedestal = BABYLON.MeshBuilder.CreateCylinder(name + "_pedestal", 
        {diameterTop: 0, tessellation: 16}, scene)
    
    pedestal.scaling = new BABYLON.Vector3(0.8, 0.15, 0.8)
    pedestal.position = new BABYLON.Vector3(0, -.8, 0)
    pedestal.material = pmat
    pedestal.parent = CoT

    /* core */
    var tico = getTruncatedIcosahedron()

    var core = BABYLON.MeshBuilder.CreatePolyhedron(name, { custom: tico }, scene);
    core.scaling = new BABYLON.Vector3(0.6, 0.6, 0.6);

    var mat = scene.getMaterialByName("powerCoreMat")
    core.material = mat
    core.parent = CoT

    let s = STATION_SIZE
    core.scaling = core.scaling.multiplyInPlace(new BABYLON.Vector3(s, s, s))

    /* inner core */
    let innerCore = BABYLON.MeshBuilder.CreateSphere(name + '_innerCore', scene)
    innerCore.scaling = new BABYLON.Vector3(1.2,1.2,1.2)
    innerCore.material = scene.getMaterialByName("innerPowerCoreMat")
    innerCore.parent = core

    /* animation */
    
    var animationCore = new BABYLON.Animation(name + "_stationAnim", 
        "material.emissiveColor", 30, BABYLON.Animation.ANIMATIONTYPE_COLOR3, 
        BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE)
    
    var keys = []
    keys.push({
        frame: 0,
        value: new BABYLON.Color3(0,0,0)
      })
    keys.push({
        frame: 30,
        value: new BABYLON.Color3(1,1,0)
    })
    keys.push({
        frame: 60,
        value: new BABYLON.Color3(0,0,0)
    })

    animationCore.setKeys(keys);
    innerCore.animations = []
    innerCore.animations.push(animationCore)
    scene.beginAnimation(innerCore, 0, 60, true)

    /* damage particles */
    // var damageParticles = new BABYLON.GPUParticleSystem(name + "_damageparticles", { capacity: 900 }, scene);
    // var sphereEmitter = damageParticles.createSphereEmitter(1.2);
    // let damageColors = {
    //     particles_color1: new BABYLON.Color4(.2,.45,.15, 1),
    //     particles_color2: new BABYLON.Color4(1, 1, 1, 1.0),
    //     particles_colorDead: new BABYLON.Color4(0, .1, 0, 0.0)
    // }   
    // damageParticles.particleTexture = new BABYLON.Texture("textures/flare.png", scene);
    // damageParticles.emitter = innerCore;
    // damageParticles.minSize = 0.01;
    // damageParticles.maxSize = 0.2;
    // damageParticles.maxLifeTime = 1
    // damageParticles.color1 = damageColors.particles_color1
    // damageParticles.color2 = damageColors.particles_color2
    // damageParticles.colorDead = damageColors.particles_colorDead
    // damageParticles.emitRate = 300;
    // damageParticles.minEmitPower = .1;
    // damageParticles.maxEmitPower = 9;
    // damageParticles.gravity = new BABYLON.Vector3(0, -20, 0); 


    return { CoT: CoT, 
             pylons: pylons, 
             anim: animationCore, 
             shell: core,
             innerCore: innerCore,
             //particles: damageParticles 
            }
    
}


export function updatePowerStationGraphics( station, scene ) {

    let damagedPylonMat = scene.getMaterialByName("stationPylons_Dark")

    let damage = STATION_MAX_HEALTH - station.health
    for (var i = 0; i < damage; ++i) {
        station.pylons[i].material = damagedPylonMat
    }

    // initial is 1.2 (health = 12) final is 1.98 (health = 1)
    var s = ((0.78/11) * (damage)) + 1.2
    station.innerCore.scaling = new BABYLON.Vector3(s,s,s)

    // if (damage > 3) {
    //     station.particles.start()
    // }


}

export function addPowerStation(scene, x, z, id) {

    let name = "station_" + id
    let ps = makePowerStation(name, scene)
    let y = getGroundElevation(x, z, scene)
    let mesh = ps.CoT
    mesh.position = new BABYLON.Vector3(x, y + 0.85, z)

    // Put pylons on the ground
    for (var pylon of ps.pylons) {
        let pyGE = getGroundElevation(
            pylon.position.x + mesh.position.x, 
            pylon.position.z + mesh.position.z,
            scene)
        pylon.position.y = pyGE - ps.CoT.position.y
    }


    let powerStation = {
        name: name,
        pos: mesh.position,
        mesh: ps.CoT,
        anim: ps.anim,
        pylons: ps.pylons,
        shell: ps.shell,
        interactRadius: mesh.scaling.x * STATION_INTERACT_COEFF,
        innerCore: ps.innerCore,
        particles: ps.particles,
        health: STATION_MAX_HEALTH,
        id: id
    }
    scene.powerStations.push(powerStation)

    addPowerStationWreckage(scene, powerStation)  

    scene.liveStations += 1

}


export function addPowerStations(scene) {

    addPowerStation(scene, 12, 8, 1)
    addPowerStation(scene, 10, 0, 2)
    addPowerStation(scene, 12,-8, 3)
}


export function placePowerStations(scene)  {

    for ( var station of scene.powerStations ) {

        let x = station.mesh.position.x
        let z = station.mesh.position.z
        let y = getGroundElevation(x, z, scene)
        station.pos = new BABYLON.Vector3(x, y + 0.85, z)
        station.mesh.position = station.pos

        // Put pylons on the ground
        for (var pylon of station.pylons) {
            let pyGE = getGroundElevation(
                pylon.position.x + station.mesh.position.x, 
                pylon.position.z + station.mesh.position.z,
                scene)
            pylon.position.y = pyGE - station.mesh.position.y
        }

        // update the wreckage location
        let wreck = scene.getMeshByName(station.name + "_wreck_core")
        wreck.position = new BABYLON.Vector3(station.pos.x, station.pos.y - .4, station.pos.z)
    }

}

function makePowerStationWreckage(name, scene) {

    /* core */
    var tico = getBrokenIcosahedron()

    var core = BABYLON.MeshBuilder.CreatePolyhedron(name + "_core", { custom: tico }, scene);
    core.scaling = new BABYLON.Vector3(0.6, 0.6, 0.6);
    core.rotate(BABYLON.Axis.X, 1.7, BABYLON.Space.LOCAL)
    
    // random y rotation
    let rot = Math.random()
    core.rotate(BABYLON.Axis.Y, rot, BABYLON.Space.WORLD)

    var mat = scene.getMaterialByName("powerCoreBrokenMat")
    core.material = mat

    let s = STATION_SIZE
    core.scaling = core.scaling.multiplyInPlace(new BABYLON.Vector3(s, s, s))

    /* inner core */
    let innerCore = BABYLON.MeshBuilder.CreateSphere(name + '_innerCore', scene)
    innerCore.scaling = new BABYLON.Vector3(1.2,1.2,1.2)
    innerCore.material = scene.getMaterialByName("innerPowerCoreBrokenMat")
    innerCore.position = new BABYLON.Vector3(0, .2, .5)
    innerCore.rotate(BABYLON.Axis.X, -1.7)
    innerCore.parent = core

    let flareTexture = new BABYLON.Texture("textures/flare.png", scene);

    /* damage particles */
    var damageParticles = new BABYLON.GPUParticleSystem(name + "_damageparticles", { capacity: 500 }, scene);
    var sphereEmitter = damageParticles.createHemisphericEmitter(1.2);
    let damageColors = {
        particles_color1: new BABYLON.Color4(.1,.5,.1, 1),
        particles_color2: new BABYLON.Color4(1, 1, 1, 1.0),
        particles_colorDead: new BABYLON.Color4(0.1, 0, 0.1, 0.0)
    }   
    damageParticles.particleTexture = flareTexture
    damageParticles.emitter = innerCore;
    damageParticles.minSize = 0.01;
    damageParticles.maxSize = 0.15;
    damageParticles.maxLifeTime = 5
    damageParticles.color1 = damageColors.particles_color1
    damageParticles.color2 = damageColors.particles_color2
    damageParticles.colorDead = damageColors.particles_colorDead
    damageParticles.emitRate = 100;
    damageParticles.minEmitPower = .1;
    damageParticles.maxEmitPower = 5;
    damageParticles.gravity = new BABYLON.Vector3(0, -5, 0); 
    damageParticles.preWarmCycles = 100;
    damageParticles.preWarmStepOffset = 5;


    /* explosion particles */
    var exploParticles = new BABYLON.GPUParticleSystem(name + "_exploParticles", { capacity: 1500 }, scene);
    var coneEmitter = exploParticles.createConeEmitter(2, 2)
    let exploColors = {
        particles_color1: new BABYLON.Color4(.1, 1, .2, 1),
        particles_color2: new BABYLON.Color4(1, .8, 1, 1.0),
        particles_colorDead: new BABYLON.Color4(0, .1, 0, 0.0)
    }   
    exploParticles.particleTexture = flareTexture
    exploParticles.emitter = innerCore;
    exploParticles.minSize = 0.05;
    exploParticles.maxSize = 0.6;
    exploParticles.maxLifeTime = .003
    exploParticles.targetStopDuration = 5
    exploParticles.color1 = exploColors.particles_color1
    exploParticles.color2 = exploColors.particles_color2
    exploParticles.colorDead = exploColors.particles_colorDead
    exploParticles.emitRate = 1500;
    exploParticles.minEmitPower = 1;
    exploParticles.maxEmitPower = 15;
    exploParticles.gravity = new BABYLON.Vector3(0, -5, 0); 
    exploParticles.preWarmCycles = 100;
    exploParticles.preWarmStepOffset = 5;
    exploParticles.disposeOnStop = true


    core.setEnabled(false)
    innerCore.setEnabled(false)


    return { shell: core,
             innerCore: innerCore,
             particles: damageParticles,
             exploParticles: exploParticles}
}

export function enableStationWreckage(scene, station) {

    scene.getSoundByName("station-destroyed").play()

    let wreckName = station.name + "_wreck"

    const hasName = (obj) => obj.name === wreckName
    const idx = scene.wreckedStations.findIndex( hasName )

    if(idx > -1) {

        let ws = scene.wreckedStations[idx]
        ws.shell.setEnabled(true)
        ws.innerCore.setEnabled(true)
        ws.particles.start()
        ws.exploParticles.start()
    }

    scene.liveStations -= 1
}

export function addPowerStationWreckage(scene, station) {

    let name = station.name + "_wreck"
    let ps = makePowerStationWreckage(name, scene)
    ps.shell.position = new BABYLON.Vector3(station.pos.x, station.pos.y - .4, station.pos.z)
    // TODO add a small random rotation for the shell

    let powerStationWreck = {
        name: name,
        shell: ps.shell,
        innerCore: ps.innerCore,
        particles: ps.particles,
        exploParticles: ps.exploParticles,
        id: station.id
    }

    scene.wreckedStations.push(powerStationWreck)
}


export function destroyStation(station, scene, handleUpdateGUIinfo) {

    let destroyedStationName = station.name

    const hasName = (obj) => obj.name === destroyedStationName
    const idx = scene.powerStations.findIndex( hasName )

    if(idx > -1) {
        scene.powerStations[idx].mesh.dispose()
        //scene.powerStations[idx].particles.dispose()
        scene.powerStations.splice(idx, 1)
    }    

    // if (scene.powerStations.length === 0) {  // GAME OVER
    //     handleGameOver(scene, handleUpdateGUIinfo)
    // } 
}


export function removeStationWreckage(scene) {

    for (var wreck of scene.wreckedStations) {

        wreck.shell.dispose()
        wreck.innerCore.dispose()
        wreck.particles.dispose()
        
    }

    scene.wreckedStations = []
}

export function makeBase(scene) {
    
    var baseMesh = BABYLON.MeshBuilder.CreateCylinder("base", {diameter:0.5, sizeY:6.5, tessellation: 8}, scene)
    baseMesh.convertToFlatShadedMesh()
    baseMesh.position = new BABYLON.Vector3(GUN_POSITION.x - 0.4, 3.5, GUN_POSITION.z)

    var spireMesh = BABYLON.MeshBuilder.CreateCylinder("spire", {diameterBottom:0.4, diameterTop: 0.05,
        height:3.0, tessellation: 8}, scene)

    spireMesh.position = new BABYLON.Vector3(0, 2.0, 0)
    spireMesh.rotate(BABYLON.Axis.Y, 30 * (Math.PI / 180.0), BABYLON.Space.LOCAL)
    spireMesh.convertToFlatShadedMesh()
    spireMesh.parent = baseMesh

    var capCone = BABYLON.MeshBuilder.CreateCylinder("capCone", {diameterTop:0.25, 
        diameterBottom: 0, height:0.5, tessellation: 12}, scene)
    capCone.convertToFlatShadedMesh()
    capCone.position = new BABYLON.Vector3(0, 1.23, 0)
    capCone.parent = spireMesh
    
    var capMesh = BABYLON.MeshBuilder.CreateCylinder("cap", {diameter:0.4, height:0.06, 
        tessellation: 12}, scene)
    //capMesh.convertToFlatShadedMesh()
    capMesh.position = new BABYLON.Vector3(0, 1.4, 0)
    capMesh.parent = spireMesh

    var capMesh2 = BABYLON.MeshBuilder.CreateCylinder("cap2", {diameter:0.4, height:0.06, 
        tessellation: 12}, scene)
    //capMesh.convertToFlatShadedMesh()
    capMesh2.position = new BABYLON.Vector3(0, 1.5, 0)
    capMesh2.parent = spireMesh
}


