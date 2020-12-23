import * as BABYLON from '@babylonjs/core'
import { AGENT_SENSOR_RADIUS, ARTIFACT_AREA, ARTIFACT_SIZE, 
        ARTIFACT_INTERACT_COEFF, phases, edge, AGENT_SIZE, ARTIFACT_TYPES, 
        ROUND_PHASES, AGENT_MAX_HEALTH, ARTIFACT_MAX_HEALTH, AGENT_TRAIL_COLOR1,
        AGENT_TRAIL_COLOR2, AGENT_TRAIL_COLOR_DEAD, FIELD_EXTENTS } from './constants.js'
import { getGroundElevation, randomRotation } from './utils.js'
import { getAgentVerts, getTrucatedDodecahedron } from './geometry.js'
import { getAgentMat, roundParticlecolors, blastParticlesProps} from './materials.js'


function makeArtifact(name, size, scene) {

    const coreName = name + "_core"
    
    var coreSize = size * ARTIFACT_SIZE
    var coreMesh = BABYLON.MeshBuilder.CreatePolyhedron(coreName, { type: 2, size: coreSize }, scene);
    coreMesh.rotationQuaternion = randomRotation()
    coreMesh.material = scene.getMaterialByName("artifactCoreMat")

    var shellRadius = coreSize * ARTIFACT_INTERACT_COEFF
    var shellMesh =  BABYLON.MeshBuilder.CreateIcoSphere("icosphere", {radius:shellRadius, subdivisions: 4}, scene)

    var shellMat = scene.getMaterialByName("artifactShellMat")
    shellMesh.material = shellMat;
    shellMesh.addChild(coreMesh)

    
    return { core: coreMesh, 
             shell: shellMesh, 
             shellRadius: shellRadius
            }
}


export function setArtifactDetected( artifact, detected ) {

    artifact.detected = detected
    artifact.meshes.shell.isVisible = detected
    artifact.meshes.core.isVisible = detected
    
}

export function addArtifact(scene, type, position) {

    let name = "artifact_" + scene.nextArtifactId
    scene.nextArtifactId += 1

    if (!type) {

        let r = Math.random() * 100
        if (r < 20)
            type = ARTIFACT_TYPES.small
        else if (r > 80)
            type = ARTIFACT_TYPES.large
        else
            type = ARTIFACT_TYPES.medium

    }

    let meshes = makeArtifact(name, type.scale, scene)
    meshes.shell.position = position || generateArtifactPosition(scene)

    let artifact = {
        name: name,
        type: type,
        pos: meshes.shell.position,
        meshes: meshes,
        interactRadius: meshes.shellRadius,
        detected: false,
        health: ARTIFACT_MAX_HEALTH
    }

    setArtifactDetected(artifact, false)

    scene.artifacts.push(artifact)

}

function generateArtifactPosition(scene) {

    let artifactPos =  new BABYLON.Vector3(0,0,0)

    artifactPos.x = ARTIFACT_AREA.xMin + 
        ((ARTIFACT_AREA.xMax - ARTIFACT_AREA.xMin) * Math.random())

    artifactPos.z = ARTIFACT_AREA.zMin + 
        ((ARTIFACT_AREA.zMax - ARTIFACT_AREA.zMin) * Math.random())

    artifactPos.y = getGroundElevation(artifactPos.x, artifactPos.z, scene)

    return artifactPos

}


function makeThePackage(name, scene) {

    let CoT = new BABYLON.TransformNode(name);

    let mat = scene.getMaterialByName("packageMat")
    var trudo = getTrucatedDodecahedron()
    let packageMesh = BABYLON.MeshBuilder.CreatePolyhedron(name, { custom: trudo }, scene);
    packageMesh.scaling = new BABYLON.Vector3(0.35, 0.35, 0.35);
    packageMesh.material = mat
    packageMesh.parent = CoT

    let blmat = scene.getMaterialByName("blastMat")
    let blastMesh = BABYLON.MeshBuilder.CreateSphere(name + '_blast', scene)
    blastMesh.material = blmat
    blastMesh.setEnabled(false)
    blastMesh.parent = CoT

    let particleOrigin = new BABYLON.TransformNode(name + "_particleOrigin")
    particleOrigin.parent = CoT


    /* create particles for detonation */
    let flareTexture = new BABYLON.Texture("textures/flare.png", scene);
    var blastParticles = new BABYLON.GPUParticleSystem(name + "_blastparticles", { capacity: 10000 }, scene);
    var hemisphericEmitter = blastParticles.createHemisphericEmitter(3);
    let blastColors = {
        particles_color1: new BABYLON.Color4(1,.2,.2,1),
        particles_color2: new BABYLON.Color4(.8, .8, .3, 1.0),
        particles_colorDead: new BABYLON.Color4(0.1, 0, 0.1, 0)
    }   
    blastParticles.particleTexture = flareTexture
    blastParticles.emitter = particleOrigin;
    blastParticles.minSize = 0.1;
    blastParticles.maxSize = 0.5;
    blastParticles.maxLifeTime = .1
    blastParticles.color1 = blastColors.particles_color1
    blastParticles.color2 = blastColors.particles_color2
    blastParticles.colorDead = blastColors.particles_colorDead
    blastParticles.emitRate = 1300;
    blastParticles.minEmitPower = 5;
    blastParticles.maxEmitPower = 16;
    blastParticles.preWarmCycles = 100;
    blastParticles.preWarmStepOffset = 5;        

    return {    
        body: CoT, 
        package: packageMesh,
        particleOrigin: particleOrigin,
        target: null,
        blast: blastMesh,
        blastParticles: blastParticles,
        blastEmitter: hemisphericEmitter
    }
}

function makeRound(name, scene) {
    
    let mat = scene.getMaterialByName("mortarMat")
    let CoT = new BABYLON.TransformNode(name);

    let mortarMesh = BABYLON.MeshBuilder.CreateSphere(name + '_mortar', scene);
    mortarMesh.material = mat;
    mortarMesh.scaling = new BABYLON.Vector3(0.3, 0.3, 0.3);
    mortarMesh.setEnabled(false)
    mortarMesh.parent = CoT

    let bmat = scene.getMaterialByName("bulletMat")
    let bulletMesh = BABYLON.MeshBuilder.CreateCylinder(name + '_bullet', scene)
    bulletMesh.scaling = new BABYLON.Vector3(0.05, 0.6, 0.05);
    bulletMesh.material = bmat
    bulletMesh.setEnabled(false)
    bulletMesh.parent = CoT

    let blmat = scene.getMaterialByName("blastMat")
    let blastMesh = BABYLON.MeshBuilder.CreateSphere(name + '_blast', scene)
    blastMesh.material = blmat
    blastMesh.setEnabled(false)
    blastMesh.parent = CoT
    
    let particleOrigin = new BABYLON.TransformNode(name + "_particleOrigin")
    particleOrigin.parent = CoT
    particleOrigin.position.y = 0
    
    //particles
    // Create a particle system for round trail
    var particleSystem = new BABYLON.GPUParticleSystem(name + "_particles", { capacity: 800 }, scene);
    particleSystem.createPointEmitter(new BABYLON.Vector3(1, -.5, 0), new BABYLON.Vector3(1, .5, 0));
   
    let flareTexture = new BABYLON.Texture("textures/flare.png", scene);

    particleSystem.particleTexture = flareTexture
    particleSystem.emitter = particleOrigin;
    particleSystem.minSize = 0.01;
    particleSystem.maxSize = 0.06;
    particleSystem.maxLifeTime = .001
    particleSystem.color1 = roundParticlecolors.particles_color1
    particleSystem.color2 = roundParticlecolors.particles_color2
    particleSystem.colorDead = roundParticlecolors.particles_colorDead
    particleSystem.emitRate = 100;
    particleSystem.minEmitPower = 1;
    particleSystem.maxEmitPower = 4;
    particleSystem.preWarmCycles = 100;
    particleSystem.preWarmStepOffset = 5;


    /* create particles for detonation */
    var blastParticles = new BABYLON.GPUParticleSystem(name + "_blastparticles", { capacity: 800 }, scene);
    var hemisphericEmitter = blastParticles.createHemisphericEmitter(1);
      
    blastParticles.particleTexture = flareTexture
    blastParticles.emitter = particleOrigin;
    blastParticles.minSize = blastParticlesProps.minSize;
    blastParticles.maxSize = blastParticlesProps.maxSize;
    blastParticles.maxLifeTime = blastParticlesProps.maxLifeTime
    blastParticles.color1 = blastParticlesProps.color1
    blastParticles.color2 = blastParticlesProps.color2
    blastParticles.colorDead = blastParticlesProps.colorDead
    blastParticles.emitRate = blastParticlesProps.emitRate;
    blastParticles.minEmitPower = blastParticlesProps.minEmitPower;
    blastParticles.maxEmitPower = blastParticlesProps.maxEmitPower;
    blastParticles.preWarmCycles = 100;
    blastParticles.preWarmStepOffset = 5;    


    return {    body: CoT, 
                mortar: mortarMesh, 
                bullet: bulletMesh, 
                target: null, 
                particles: particleSystem, 
                particleOrigin: particleOrigin,
                blast: blastMesh,
                blastParticles: blastParticles,
                blastEmitter: hemisphericEmitter
            }
}


export function addThePackage(scene) {

    let name = "thePackage"
    let meshes = makeThePackage(name, scene)

    let thePackage = {
        name: name,
        pos: meshes.body.position,
        loaded: false,  
        phase: ROUND_PHASES.ready,
        blastRadiusCurrent: 0,
        blastRadiusStart: 1,  
        blastExpansionVelocity: 3,
        detonationFrame: 0,
        blastAge: 0,
        blastLife: 14,    
        meshes: meshes,
        trajectory: {heading: 0, y0: 0, vy:0, g: 0, t: 0, gunYinc: 0}

    }

    scene.thePackage = thePackage
}


export function addRound(scene) {

    let name = "round_" + scene.nextRoundId
    let meshes = makeRound(name, scene)

    let round = {
        name: name,
        id: scene.nextRoundId,
        type: null,
        pos: meshes.body.position,
        phase: ROUND_PHASES.ready,
        blastRadiusCurrent: 0,
        blastRadiusStart: 1,  
        blastExpansionVelocity: .2,
        detonationFrame: 0,
        blastAge: 0,
        blastLife: 10,     
        meshes: meshes,
        trajectory: {heading: 0, y0: 0, vy:0, g: 0, t: 0, gunYinc: 0}
    }

    scene.rounds.push(round)
    scene.roundsReady += 1
    scene.nextRoundId += 1
}


function makeCargo(name, scene) {

    var mesh = BABYLON.MeshBuilder.CreatePolyhedron(name + "_cargo", { type: 2, size: 1 }, scene);
    mesh.scaling = new BABYLON.Vector3(0.9, 0.9, 0.9)
    mesh.position = new BABYLON.Vector3(-AGENT_SIZE/4, AGENT_SIZE + 2.3, 0)

    return mesh
}


function makeAgent(name, health, position, scene) {

    var mat = getAgentMat(scene, health)

    var triPyramid = getAgentVerts()

    var mesh = BABYLON.MeshBuilder.CreatePolyhedron(name, { custom: triPyramid }, scene);
    mesh.material = mat;

    // add cargo as child
    let cargo = makeCargo(name, scene)
    cargo.isVisible = false
    mesh.addChild(cargo)

    mesh.scaling = new BABYLON.Vector3(0.15 * AGENT_SIZE, 0.1 * AGENT_SIZE, 0.15 * AGENT_SIZE);
    mesh.position = position

    // Create a particle system
    var particleSystem = new BABYLON.GPUParticleSystem(name + "_particles", { capacity: 600 }, scene);

    let colors = {
        particles_color1: new BABYLON.Color4(AGENT_TRAIL_COLOR1[0],
                                             AGENT_TRAIL_COLOR1[1],
                                             AGENT_TRAIL_COLOR1[2],
                                             AGENT_TRAIL_COLOR1[3]),
        particles_color2: new BABYLON.Color4(AGENT_TRAIL_COLOR2[0],
                                             AGENT_TRAIL_COLOR2[1],
                                             AGENT_TRAIL_COLOR2[2],
                                             AGENT_TRAIL_COLOR2[3]),
        particles_colorDead: new BABYLON.Color4(AGENT_TRAIL_COLOR_DEAD[0],
                                                AGENT_TRAIL_COLOR_DEAD[1],
                                                AGENT_TRAIL_COLOR_DEAD[2],
                                                AGENT_TRAIL_COLOR_DEAD[3])
    }   

    let flareTexture = new BABYLON.Texture("textures/flare.png", scene);
    
    particleSystem.particleTexture = flareTexture
    particleSystem.emitter = mesh;
    particleSystem.minSize = 0.05;
    particleSystem.maxSize = 0.10;
    particleSystem.addSizeGradient(0, 0.05);
    particleSystem.addSizeGradient(1.0, 0.7);
    particleSystem.color1 = colors.particles_color1
    particleSystem.color2 = colors.particles_color2
    particleSystem.colorDead = colors.particles_colorDead
    particleSystem.emitRate = 55;
    particleSystem.direction1 = new BABYLON.Vector3(-1, 1, 0);
    particleSystem.direction2 = new BABYLON.Vector3(0, 4, 0);
    particleSystem.minEmitPower = 1;
    particleSystem.maxEmitPower = 3.5;
    particleSystem.gravity = new BABYLON.Vector3(0, -10, 0);
    particleSystem.addVelocityGradient(0, 0.5);
    particleSystem.addVelocityGradient(1.0, 3);
    

    particleSystem.start();

    var damageParticles = new BABYLON.GPUParticleSystem(name + "_damageparticles", { capacity: 500 }, scene)
    damageParticles.emitter = mesh
    damageParticles.minEmitBox = new BABYLON.Vector3(0, 2.5, -1)
    damageParticles.maxEmitBox = new BABYLON.Vector3(-1, 3, 1)
    let damageColors = {
        particles_color1: new BABYLON.Color4(0.2, 0.2, 0.5, 1.0),
        particles_color2: new BABYLON.Color4(.2, 0, 0.3, 1.0),
        particles_colorDead: new BABYLON.Color4(0.08, 0.0, 0.1, 0.0)
    }   
    damageParticles.particleTexture = flareTexture
    damageParticles.minSize = 0.01;
    damageParticles.maxSize = 0.15;
    damageParticles.color1 = damageColors.particles_color1
    damageParticles.color2 = damageColors.particles_color2
    damageParticles.colorDead = damageColors.particles_colorDead
    damageParticles.emitRate = 45;
    damageParticles.minEmitPower = 15;
    damageParticles.maxEmitPower = 19;
    particleSystem.direction1 = new BABYLON.Vector3(0, 1, 0)
    damageParticles.preWarmCycles = 100;
    damageParticles.preWarmStepOffset = 5;
 
 
    return { body: mesh, 
             particles: particleSystem, 
             damageParticles: damageParticles,
             cargo: cargo 
            }

}


export function addAgent(scene, health, position, heading) {

    let agentHealth = health || (Math.floor(AGENT_MAX_HEALTH / 2))
    
    let id = scene.agents.length
    let name = "agent_" + id
    
    let agentPos = position || generateAgentPosition(scene)
    let meshes = makeAgent(name, agentHealth, agentPos, scene)

    let h = heading || 180
    meshes.body.rotate(BABYLON.Axis.Y, h * (Math.PI / 180.0), BABYLON.Space.LOCAL)

    /* Initialize the 'hot grid' used for artifact-finding */
    let hotGrid = new Array(36)
    let idx
    for (idx = 0; idx < 36; idx++) {
        hotGrid[idx] = 0
    }

    /* *************************************
    * 
    *              AGENT PROPS
    * 
    *************************************** */ 
    let agentInfo = {
        name: name,
        meshes: meshes, 
        phase: phases.SEEK_ARTIFACT_ZONE,
        artifactCollected: false,
        payloadMass: 0,
        heading: h,   //degrees
        pos: agentPos,
        vel: 0,
        norm: new BABYLON.Vector3(0, 1, 0),
        steeringMode: { dir: 'straight', weight: 1.0 },
        sensorRadius: AGENT_SENSOR_RADIUS,
        targetSelected: false,
        targetName: 'none', // debug purposes
        targetPos: new BABYLON.Vector3(0, 0, 0),
        targetInteractRadius: 0,
        hotGrid: hotGrid,
        gridTargetIdx: Math.floor(Math.random() * 36),
        nearEdge: edge.NONE,
        health: agentHealth   
    }

    scene.agents.push(agentInfo)

}

function generateAgentPosition(scene) {

    // north or south of origin
    let dir = 1
    if(Math.random() < 0.5)
        dir = -1

    let z = dir * Math.random() * FIELD_EXTENTS.zMax * .8

    let agentPos =  new BABYLON.Vector3(0,0,z)
     
    agentPos.y = getGroundElevation(agentPos.x, agentPos.z, scene) + 0.1

    return agentPos

}



export function destroyAgent(agentInfo, scene) {

    agentInfo.meshes.body.dispose()
    agentInfo.meshes.particles.dispose()
    agentInfo.meshes.cargo.dispose()
    agentInfo.meshes.damageParticles.dispose()

}


