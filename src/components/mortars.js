
import * as BABYLON from '@babylonjs/core';
import * as GUI from '@babylonjs/gui/2D'
import { getXZpos, getAngleOriented, getGroundRange} from './utils'
import { MORTAR_VELOCITY, MORTAR_YPEAK, ROUND_PHASES,
   GUN_POSITION, GUN_RANGE, ROUND_TYPES, GUN_VELOCITY, 
   BLAST_ALPHA, MORTAR_BLAST_RADIUS_START, MORTAR_BLAST_LIFE, 
   GUN_BLAST_LIFE, GUN_BLAST_RADIUS_START,
   POINTS_AGENT_HIT, ARTIFACT_MAX_HEALTH, POINTS_ARTIFACT_HIT,
   BLAST_DAMAGE_COEFF, GAME_PHASES, PACKAGE_VELOCITY, TERRAIN_MESH_NAME} from './constants.js'
import { destroyAgent, addArtifact } from './agent.js'
import { handleLevelComplete } from './lifecycle.js'
import { getAgentMat } from './materials.js'


export function addFireListener(scene) {
  
  window.addEventListener("keydown", function(e) {
    handleKeyPress(e) 
  })

}


function handleKeyPress(e) {

  if ( (e.which === 90) || (e.which === 77) ) {
    fireRound(e)
  } else if( e.which === 32) {
    fireThePackage(e)
  }
}



function hasHitGround(pos, scene) {

  // quick check 
  if (pos.y > 5)
    return false

  // failsafe check
  if (pos.y < 0)
    return true

   // Casting a ray to get height
   let terrainMesh = scene.getMeshByName(TERRAIN_MESH_NAME)
   var ray = new BABYLON.Ray(new BABYLON.Vector3(pos.x,
       terrainMesh.getBoundingInfo().boundingBox.maximumWorld.y + 1,
       pos.z), new BABYLON.Vector3(0, -1, 0)); // Direction

   var worldInverse = new BABYLON.Matrix();

   terrainMesh.getWorldMatrix().invertToRef(worldInverse);

   ray = BABYLON.Ray.Transform(ray, worldInverse);

   var pickInfo = terrainMesh.intersects(ray);

   if (pickInfo.hit) {
     let mortarHeight = pos.y - pickInfo.pickedPoint.y
     if (mortarHeight < 0.01)
        return true
   }
 
   return false
}


function updateThePackagePosition(tp) {

  let hvecx = Math.cos(tp.trajectory.heading)
  let hvecz = Math.sin(tp.trajectory.heading)

  let pos = tp.pos
  let inc =  PACKAGE_VELOCITY // horizontal velocity

  /*  vertical increment */
  tp.trajectory.t += 1   // time unit is 1 frame

  // trajectory equation
  pos.y = tp.trajectory.y0 + (tp.trajectory.vy * tp.trajectory.t) +
      (0.5 * tp.trajectory.g * tp.trajectory.t * tp.trajectory.t)
  
  // horizontal increment
  pos.x += hvecx * inc
  pos.z += hvecz * inc

  tp.meshes.body.position = pos

  // rotation
  tp.meshes.package.rotation.z -= .08

}


function updateRoundPosition(round, scene) {

  let hvecx = Math.cos(round.trajectory.heading)
  let hvecz = Math.sin(round.trajectory.heading)

  let pos = round.pos
  let inc   // horizontal velocity

  /*  vertical increment */
  round.trajectory.t += 1   // time unit is 1 frame

  if (round.type === ROUND_TYPES.mortar) {

    inc = MORTAR_VELOCITY

    // trajectory equation
    pos.y = round.trajectory.y0 + (round.trajectory.vy * round.trajectory.t) +
    (0.5 * round.trajectory.g * round.trajectory.t * round.trajectory.t)

  } else { // gun type

    inc = GUN_VELOCITY
    pos.y = pos.y - round.trajectory.gunYinc

  }

  // horizontal increment
  pos.x += hvecx * inc
  pos.z += hvecz * inc

  round.meshes.body.position = pos

}


export function updateThePackage(scene) {

  let tp = scene.thePackage

  if (tp.phase === ROUND_PHASES.detonated) {

    tp.blastAge = scene.gameFrame - tp.detonationFrame

    if (tp.blastAge > tp.blastLife) {  // end of life

      scene.getLightByName("light1").diffuse = new BABYLON.Color3.White
      //scene.clearColor = new BABYLON.Color3(0.38, 0.36, 0.41);

      tp.blastAge = 0
      tp.phase = ROUND_PHASES.ready
      tp.pos = new BABYLON.Vector3(0, 0, 0)
      tp.meshes.body.position = tp.pos
      tp.blastRadiusCurrent = 0
      tp.meshes.target.dispose()
      tp.meshes.blast.setEnabled(false)
      tp.meshes.blastParticles.stop()

    } else {  // blast expanding

      tp.blastRadiusCurrent = tp.blastRadiusStart +
        (tp.blastExpansionVelocity * tp.blastAge)

      tp.meshes.blastEmitter.radius = tp.blastRadiusCurrent

      tp.meshes.blast.scaling = new BABYLON.Vector3(
        tp.blastRadiusCurrent,
        tp.blastRadiusCurrent,
        tp.blastRadiusCurrent)

      tp.meshes.blast.material.alpha =
        BLAST_ALPHA - ((tp.blastAge / tp.blastLife) * BLAST_ALPHA)

    }

  }  else if (tp.phase === ROUND_PHASES.launched) {

      if (hasHitGround(tp.pos, scene)) {

        scene.getLightByName("light1").diffuse = new BABYLON.Color3(1,.8, 0.8)
        //scene.clearColor = new BABYLON.Color3.Red

        scene.getSoundByName("heavyMortar").play() 
        tp.phase = ROUND_PHASES.detonated
        tp.detonationFrame = scene.gameFrame
        tp.blastAge = 0
        tp.blastRadiusCurrent = tp.blastRadiusStart
        tp.meshes.package.setEnabled(false)
        tp.meshes.blast.setEnabled(true)
        tp.meshes.blastEmitter.radius = tp.blastRadiusStart
        tp.meshes.blastParticles.start()


      } else {  // round still traveling
        updateThePackagePosition(tp, scene)
      }


  }

      /*
      TODO Update damage to agents and artifacts
    */
   let range

    for (var agent of scene.agents) { // update agent damage

      range = BABYLON.Vector3.Distance(agent.pos, tp.pos)

      if (range < tp.blastRadiusCurrent) {

        agent.health -= (tp.blastRadiusCurrent - range) * BLAST_DAMAGE_COEFF * .065
        updateAgentColor(agent, scene)
        scene.gameScore += POINTS_AGENT_HIT 

        if (agent.health < 0) 
          killAgent(agent, scene)
        
        if (scene.agents.length === 0) {  // LEVEL COMPLETE
            handleLevelComplete(scene)
        }
        
      }
    }

    for (var artifact of scene.artifacts) { // update artifact damage
      if (artifact.detected === true) {   // artifact is visible
        range = BABYLON.Vector3.Distance(artifact.pos, tp.pos)
        if (range < tp.blastRadiusCurrent) {
          artifact.health -= (tp.blastRadiusCurrent - range) * BLAST_DAMAGE_COEFF * .065
          updateArtifactColor(artifact, scene)
          scene.gameScore += POINTS_ARTIFACT_HIT

          if(artifact.health < 0)
            killArtifact(artifact, scene)
        }
      }
    }
}



export function updateRounds(scene) {

  for (var round of scene.rounds) {

    if (round.phase === ROUND_PHASES.detonated) {

      round.blastAge = scene.gameFrame - round.detonationFrame

      if (round.blastAge > round.blastLife) {  // end of life
        round.blastAge = 0
        round.phase = ROUND_PHASES.ready
        round.pos = new BABYLON.Vector3(0, 0, 0)
        round.meshes.body.position = round.pos
        round.blastRadiusCurrent = 0
        scene.roundsReady += 1
        ///round.meshes.target.isVisible = false
        round.meshes.target.dispose()
        round.meshes.blast.setEnabled(false)
        round.meshes.particles.stop()
        round.meshes.blastParticles.stop()
        

      } else {  // blast expanding
        round.blastRadiusCurrent = round.blastRadiusStart + 
         (round.blastExpansionVelocity * round.blastAge)
         
        round.meshes.blast.scaling = new BABYLON.Vector3(
          round.blastRadiusCurrent, 
          round.blastRadiusCurrent, 
          round.blastRadiusCurrent)

        round.meshes.blast.material.alpha =
          BLAST_ALPHA - ((round.blastAge / round.blastLife) * BLAST_ALPHA)
        
      }


    } else if (round.phase === ROUND_PHASES.launched) {

        if (hasHitGround(round.pos, scene)) {

          if (round.type === ROUND_TYPES.gun)
            scene.getSoundByName("gunhit").play()
          else
            scene.getSoundByName("mortarHit").play()

          
          round.phase = ROUND_PHASES.detonated
          round.detonationFrame = scene.gameFrame
          round.blastAge = 0
          round.blastRadiusCurrent = round.blastRadiusStart
          round.meshes.mortar.setEnabled(false)
          round.meshes.bullet.setEnabled(false)
          round.meshes.blast.setEnabled(true)
          round.meshes.blastEmitter.radius = round.blastRadiusStart
          round.meshes.blastParticles.start()

   

        } else {  // round still traveling
          updateRoundPosition(round, scene)
        }
    }


    /*
      Update damage to agents and artifacts
    */
    let range

    for (var agent of scene.agents) { // update agent damage

      range = BABYLON.Vector3.Distance(agent.pos, round.pos)

      if (range < round.blastRadiusCurrent) {

        agent.health -= (round.blastRadiusCurrent - range) * BLAST_DAMAGE_COEFF 
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

    for (var artifact of scene.artifacts) { // update artifact damage
      if (artifact.detected === true) {   // artifact is visible
        range = BABYLON.Vector3.Distance(artifact.pos, round.pos)
        if (range < round.blastRadiusCurrent) {
          artifact.health -= (round.blastRadiusCurrent - range) * BLAST_DAMAGE_COEFF 
          updateArtifactColor(artifact, scene)
          scene.gameScore += POINTS_ARTIFACT_HIT
          scene.packagePoints += POINTS_ARTIFACT_HIT

          if(artifact.health < 0)
            killArtifact(artifact, scene)
        }
      }
    }

  } // for each round


}



/* The rounds objects have already been added to the scene
   at startup. To maintain frame rate consistency, firing
   the round just changes its properties e.g. location
*/
function fireRound(e) {

  var c = e.currentTarget.document.getElementsByTagName('canvas')[0]
  var scene = c.bjsScene
  if (scene.gamePhase !== GAME_PHASES.playing)
    return

 

  // Find the index of a round that is ready, else no fire
  const isReady = (obj) => obj.phase === ROUND_PHASES.ready
  const idx = scene.rounds.findIndex(isReady)
  if (idx < 0) {
    //console.log("No rounds ready")
    return
  }

  let fireTarget = renderFireTarget(scene, 0.5)
  if (fireTarget == null)
    return

  let targetPos = fireTarget.point
  let rangeToTarget = fireTarget.range

  let round = scene.rounds[idx]

  round.pos = new BABYLON.Vector3(
    GUN_POSITION.x, GUN_POSITION.y, GUN_POSITION.z
  )
  round.meshes.target = fireTarget.mesh
  round.phase = ROUND_PHASES.launched

  let txz = getXZpos(targetPos)
  let mxz = new BABYLON.Vector2(GUN_POSITION.x, GUN_POSITION.z)
  let tvec = txz.subtract(mxz)
  let heading = getAngleOriented(getXZpos(BABYLON.Axis.X), tvec)

  round.trajectory.heading = heading
  
  round.meshes.particles.start()

  if (rangeToTarget < GUN_RANGE) {  // use bullet

    round.type = ROUND_TYPES.gun
    round.blastRadiusStart = GUN_BLAST_RADIUS_START
    round.blastLife = GUN_BLAST_LIFE

    scene.getSoundByName("gun").play()

    let deltaY = GUN_POSITION.y - targetPos.y
    let declination = Math.atan2(deltaY,rangeToTarget) + (Math.PI / 2)

    round.meshes.mortar.setEnabled(false)
    round.meshes.bullet.setEnabled(true)

    round.meshes.particles.emitRate = 100

    let mesh = round.meshes.bullet
    let rotationVec = new BABYLON.Vector3(0, -heading, -declination)
    //mesh.rotate(BABYLON.Axis.Z, declination, BABYLON.Space.LOCAL);
    mesh.rotation = rotationVec

    // rotate the particles origin
    round.meshes.particleOrigin.rotation = new BABYLON.Vector3(0, -heading, 0)

    let framesToTarget = rangeToTarget / GUN_VELOCITY
    round.trajectory.gunYinc = deltaY / framesToTarget

  } else {  // Use mortar

    round.type = ROUND_TYPES.mortar
    round.blastRadiusStart = MORTAR_BLAST_RADIUS_START
    round.blastLife = MORTAR_BLAST_LIFE
    round.meshes.mortar.setEnabled(true)
    round.meshes.bullet.setEnabled(false)
    round.meshes.particles.emitRate = 200

    scene.getSoundByName("mortar").play()
  
    /* solve for vertical velocity and gravity given Ypeak and lateral speed */
    let b = MORTAR_YPEAK  // max height of parabola
    let a = GUN_POSITION.y  // launch elevation
    let c = targetPos.y  // target elevation
    let t = BABYLON.Vector2.Distance(txz, mxz) / MORTAR_VELOCITY
  
    let vy = ((4 * b) - c - (3 * a)) / t
    let g = (4 * (c + a - (2 * b))) / (t * t)

    round.trajectory.y0 = a
    round.trajectory.vy = vy
    round.trajectory.g = g
    round.trajectory.t = 0
  }
  
  scene.roundsReady -= 1
}


function displayRangeWarning(scene) {

  if (scene.rangeWarningOn)
    return

  scene.rangeWarningTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("myUI")

  var text1 = new GUI.TextBlock()
  text1.text = "Too close!"
  text1.color = "white"
  text1.fontSize = 16
  text1.top = "250px"
  scene.rangeWarningTexture.addControl(text1)
  scene.rangeWarningOn = true

}

function hideRangeWarning(scene) {

  if (scene.rangeWarningOn) {
    scene.rangeWarningTexture.dispose()
    scene.rangeWarningOn = false
  }

}

function renderFireTarget(scene, minRange) {

  // pick terrain only
  let terrainMesh = scene.getMeshByName(TERRAIN_MESH_NAME)

  var pickResult = scene.pick(scene.pointerX, scene.pointerY,
    function (mesh) { return mesh === terrainMesh; })

  if (!pickResult.hit)
    return null

  //console.log("clicked point: " + pickResult.pickedPoint)

  // no targets at close range
  let rangeToTarget = getGroundRange(pickResult.pickedPoint, 
    new BABYLON.Vector3(GUN_POSITION.x, GUN_POSITION.y, GUN_POSITION.z))
  if (rangeToTarget < minRange) {
    displayRangeWarning(scene)
    return null
  } else {
    hideRangeWarning(scene)
  }

  // DECAL
  let decalMaterial = scene.getMaterialByName("reticleMat")
  var decalSize = new BABYLON.Vector3(1.5, 1.5, 1.5)
  var decal = BABYLON.MeshBuilder.CreateDecal("mortar_target", terrainMesh,
    {
      position: pickResult.pickedPoint,
      normal: pickResult.getNormal(true),
      size: decalSize
    })
  decal.material = decalMaterial;

  scene.fireTargets.push(decal)

  return { 
    mesh: decal, 
    point: pickResult.pickedPoint,
    range:  rangeToTarget}

}


function killArtifact(artifact, scene) {

  const hasName = (obj) => obj.name === artifact.name
  const idx = scene.artifacts.findIndex( hasName )

  if(idx > -1) {
    
    artifact.meshes.shell.dispose()
    scene.artifacts.splice(idx, 1)
    
    // replace visible artifact with hidden one
    addArtifact(scene)

  } else {
    //console.log("artifact " + artifact.name + " not found")
  }

}


function killAgent(agent, scene) {

  destroyAgent(agent, scene)
  const hasName = (obj) => obj.name === agent.name
  const idx = scene.agents.findIndex( hasName )

  if(idx > -1) {
    scene.agents[idx].meshes.body.dispose()
    scene.agents[idx].meshes.particles.dispose()
    scene.agents[idx].meshes.cargo.dispose()
    scene.agents.splice(idx, 1)    
  }

  scene.getSoundByName("agent-destroyed").play() 

  scene.agentsDestroyed += 1

}

function updateAgentColor(agent, scene) {

  agent.meshes.body.material = getAgentMat(scene, agent.health)

  // update damage particles  
  // TODO update emit rate and power based on agent health
  let p = agent.meshes.damageParticles
  p.start()

}

function updateArtifactColor(artifact, scene) {

  let h = artifact.health
  let minorDamage = ARTIFACT_MAX_HEALTH * (2/3)
  let majorDamage = ARTIFACT_MAX_HEALTH * (1/3)

  if ((h < ARTIFACT_MAX_HEALTH) && ( h >= minorDamage)) {

    artifact.meshes.core.material = scene.getMaterialByName("damageMinorMat")

  } else if ((h < minorDamage) && (h >= majorDamage)) {

    artifact.meshes.core.material = scene.getMaterialByName("damageMajorMat")

  } else {   // critically damaged

    artifact.meshes.core.material = scene.getMaterialByName("damageCriticalMat")

  }

}


function fireThePackage(e) {

  var canv = e.currentTarget.document.getElementsByTagName('canvas')[0]
  var scene = canv.bjsScene
  if (scene.gamePhase !== GAME_PHASES.playing)
    return

  if (!scene.thePackage.loaded)
    return

  let fireTarget = renderFireTarget(scene, 20)
  if (fireTarget == null)
    return

  let targetPos = fireTarget.point

  let tp = scene.thePackage

  tp.pos = new BABYLON.Vector3(
    GUN_POSITION.x, GUN_POSITION.y, GUN_POSITION.z
  )
  tp.meshes.target = fireTarget.mesh
  tp.phase = ROUND_PHASES.launched

  let txz = getXZpos(targetPos)
  let mxz = new BABYLON.Vector2(GUN_POSITION.x, GUN_POSITION.z)
  let tvec = txz.subtract(mxz)
  let heading = getAngleOriented(getXZpos(BABYLON.Axis.X), tvec)

  tp.trajectory.heading = heading
  tp.meshes.package.setEnabled(true)

  scene.getSoundByName("mortar").play()   // TODO find new sound

  /* solve for vertical velocity and gravity given Ypeak and lateral speed */
  let b = 10  // max height of parabola
  let a = GUN_POSITION.y  // launch elevation
  let c = targetPos.y  // target elevation
  let t = BABYLON.Vector2.Distance(txz, mxz) / PACKAGE_VELOCITY

  let vy = ((4 * b) - c - (3 * a)) / t
  let g = (4 * (c + a - (2 * b))) / (t * t)

  tp.trajectory.y0 = a
  tp.trajectory.vy = vy
  tp.trajectory.g = g
  tp.trajectory.t = 0

  /* reset the package */
  scene.thePackage.loaded = false
  scene.packagePoints = 0
  document.getElementById('innerbar').setAttribute("style", "width:0%");
  document.getElementById('package-loaded').src='textures/mortar_unlit.png'

}
