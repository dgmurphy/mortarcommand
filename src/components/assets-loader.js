import * as BABYLON from '@babylonjs/core';
import { GLTF_FILE, MC_TABLE_XFORM, TABLE_BACKGROUND_ALPHA } from './per-table-constants.js'


function soundReady(soundTask) {
  //console.log("Sound task: " + soundTask)
}


export function loadAssets(scene, updateAssetStatus) {

    var assetsManager = new BABYLON.AssetsManager(scene)
    assetsManager.useDefaultLoadingScreen = false
    

    /* ------ sound load ------------ */
    var activatorExpiredSoundTask = assetsManager.addBinaryFileTask("activatorExpiredSoundTask", "sounds/power-off.wav")
    activatorExpiredSoundTask.onSuccess = function (task) {
      let activatorExpiredSound = new BABYLON.Sound("power-off", task.data, scene, soundReady(task))
    }


    var newActivatorSoundTask = assetsManager.addBinaryFileTask("newActivatorSoundTask", "sounds/new_activator.wav")
    newActivatorSoundTask.onSuccess = function (task) {
      let newActivatorSound = new BABYLON.Sound("newActivator", task.data, scene, soundReady(task))
    }


    var activatorPowerUpSoundTask = assetsManager.addBinaryFileTask("activatorPowerUpSoundTask", "sounds/power-up.wav")
    activatorPowerUpSoundTask.onSuccess = function (task) {
      let activatorPowerUpSound = new BABYLON.Sound("activatorPowerUp", task.data, scene, soundReady(task))
    }

    var activatorHitSoundTask = assetsManager.addBinaryFileTask("activatorHitSoundTask", "sounds/dink.wav")
    activatorHitSoundTask.onSuccess = function (task) {
      let activatorHitSound = new BABYLON.Sound("activatorHit", task.data, scene, soundReady(task))
    }

    var heavyMortarSoundTask = assetsManager.addBinaryFileTask("heavyMortarSoundTask", "sounds/heavymortar.wav")
    heavyMortarSoundTask.onSuccess = function (task) {
      let heavyMortarSound = new BABYLON.Sound("heavyMortar", task.data, scene, soundReady(task))
    }


    var playSoundTask = assetsManager.addBinaryFileTask("playSoundTask", "sounds/bleachit.wav")
    playSoundTask.onSuccess = function (task) {
      let playSound = new BABYLON.Sound("play", task.data, scene, soundReady(task))
    }

    var humSoundTask = assetsManager.addBinaryFileTask("humSoundTask", "sounds/hum.wav")
    humSoundTask.onSuccess = function (task) {
      let humSound = new BABYLON.Sound("hum", task.data, scene, soundReady(task))
    }

    var insertCoinSoundTask = assetsManager.addBinaryFileTask("insertCoinSoundTask", "sounds/insertcoin.wav")
    insertCoinSoundTask.onSuccess = function (task) {
      let insertCoinSound = new BABYLON.Sound("insertCoin", task.data, scene, soundReady(task))
    }

    var gunHitSoundTask = assetsManager.addBinaryFileTask("gunHitSoundTask", "sounds/gunhit.wav")
    gunHitSoundTask.onSuccess = function (task) {
      let gunHitSound = new BABYLON.Sound("gunhit", task.data, scene, soundReady(task))
    }

    var gunFireSoundTask = assetsManager.addBinaryFileTask("gunSoundTask", "sounds/gun.wav")
    gunFireSoundTask.onSuccess = function (task) {
      let gunSound = new BABYLON.Sound("gun", task.data, scene, soundReady(task))
    }

    var mortarFireSoundTask = assetsManager.addBinaryFileTask("mortarSoundTask", "sounds/mortar.wav")
    mortarFireSoundTask.onSuccess = function (task) {
      let mortarSound = new BABYLON.Sound("mortar", task.data, scene, soundReady(task))
    }

    var mortarHitSoundTask = assetsManager.addBinaryFileTask("mortarHitSoundTask", "sounds/mortarHit.wav")
    mortarHitSoundTask.onSuccess = function (task) {
      let mortarHitSound = new BABYLON.Sound("mortarHit", task.data, scene, soundReady(task))
    }

    var stationDamageSoundTask = assetsManager.addBinaryFileTask("stationDamageSoundTask", "sounds/station-damage.wav")
    stationDamageSoundTask.onSuccess = function (task) {
      let stationDamageSound = new BABYLON.Sound("station-damage", task.data, scene, soundReady(task))
    }

    var stationDestroyedSoundTask = assetsManager.addBinaryFileTask("stationDestroyedSoundTask", "sounds/station.wav")
    stationDestroyedSoundTask.onSuccess = function (task) {
      let stationDestroyedSound = new BABYLON.Sound("station-destroyed", task.data, scene, soundReady(task))
    }

    var oreSoundTask = assetsManager.addBinaryFileTask("oreSoundTask", "sounds/ore.wav")
    oreSoundTask.onSuccess = function (task) {
      let oreSound = new BABYLON.Sound("ore", task.data, scene, soundReady(task))
    }

    var agentDestroyedSoundTask = assetsManager.addBinaryFileTask("agentDestroyedSoundTask", "sounds/agent-destroyed.wav")
    agentDestroyedSoundTask.onSuccess = function (task) {
      let agentDestroyedSound = new BABYLON.Sound("agent-destroyed", task.data, scene, soundReady(task))
    }

    var mineSoundTask = assetsManager.addBinaryFileTask("mineSoundTask", "sounds/mine.wav")
    mineSoundTask.onSuccess = function (task) {
      let mineSound = new BABYLON.Sound("mine", task.data, scene, soundReady(task))
    }


    /* ------ terrain load ------------ */
    var terrainTask = assetsManager.addMeshTask("terrainLoadTask", "", "./", GLTF_FILE)

    terrainTask.onSuccess = function(task) {

      let newMeshes = task.loadedMeshes

      // bjs is left handed coords, gltf is right handed
      newMeshes[0].scaling = new  BABYLON.Vector3(1, 1, -1); 

      //Looks like mesh 0 is the base box
      newMeshes[0].scaling = new  BABYLON.Vector3(
		    MC_TABLE_XFORM.scale[0],
		    MC_TABLE_XFORM.scale[1],
        MC_TABLE_XFORM.scale[2]);
        
      newMeshes[0].addRotation(0, Math.PI, 0);

      newMeshes[0].position = new  BABYLON.Vector3(
		    MC_TABLE_XFORM.pos[0],
		    MC_TABLE_XFORM.pos[1],
		    MC_TABLE_XFORM.pos[2])

      var terrain = newMeshes[1]
      terrain.updateFacetData();

      // The gltf import has the normals flipped
      var vertex_data = BABYLON.VertexData.ExtractFromMesh(terrain);
      for (var i = 0; i < vertex_data.normals.length; i++) {
        vertex_data.normals[i] *= -1;
      }

      terrain.computeWorldMatrix(true); 

      terrain.actionManager = new BABYLON.ActionManager(scene);
            
      //ON MOUSE ENTER
      terrain.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, function(ev){	
          scene.hoverCursor = " url('textures/cursor.png') 12 12, auto ";

      }));
      
      //ON MOUSE EXIT
      terrain.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, function(ev){
      
      }));

    }

    /* ----------------- */


    // CHECK NEW TERRAIN
    //addNewTerrain(scene)
      

    assetsManager.onTaskErrorObservable.add(function(task) {
      console.log('task failed', task.errorObject.message, task.errorObject.exception);
    });

    assetsManager.onTaskSuccessObservable.add(function(task) {
      //console.log('task succeeded: ', task.name);
      updateAssetStatus(task.name, scene)
    })

    
    assetsManager.onProgress = function(remainingCount, totalCount, lastFinishedTask) {

      let messages = [
        "Loading...96%",
        "Loading...93%",
        "Loading...90%",
        "Loading...88%",
        "Loading...85%",
        "Loading...79%",
        "Loading...76%",
        "Loading...70%",
        "Loading...65%",
        "Loading...68%",
        "Loading...66%",
        "Loading...60%",
        "Loading...58%"
      ]

      let loadingEl = document.getElementById("loading-span")
      let message = messages[remainingCount]
      loadingEl.textContent = message
    }



    assetsManager.load()

}


export function addGround(scene) {
  
    // GROUND
    var ground = BABYLON.Mesh.CreateGround("ground1", 130, 130, 2, scene);
    ground.receiveShadows = false;
            
    // Create and tweak the background material.
    var backgroundMaterial = new BABYLON.BackgroundMaterial("backgroundMaterial", scene);
    backgroundMaterial.diffuseTexture = new BABYLON.Texture("./textures/backgroundGround.png", scene);
    backgroundMaterial.diffuseTexture.hasAlpha = true;
    backgroundMaterial.opacityFresnel = true;
    backgroundMaterial.alpha = TABLE_BACKGROUND_ALPHA;
    backgroundMaterial.shadowLevel = 0.4;
    ground.material = backgroundMaterial; 

  }

  function addNewTerrain(scene) {

     // TEST POSITION NEW MESH
     BABYLON.SceneLoader.ImportMesh("", "./", "test_mesh_name_here.gltf", scene, function (newMeshes) {;
    
      // bjs is left handed coords, gltf is right handed
      newMeshes[0].scaling = new  BABYLON.Vector3(1, 1, -1);  
      //Looks like mesh 0 is the base box
      newMeshes[0].scaling = new  BABYLON.Vector3(0,0,0);
      newMeshes[0].addRotation(0, Math.PI, 0);
      newMeshes[0].position = new  BABYLON.Vector3(0,0,0)

      var terrain = newMeshes[1]
      terrain.updateFacetData();

      // The gltf import has the normals flipped
      var vertex_data = BABYLON.VertexData.ExtractFromMesh(terrain);
      for (var i = 0; i < vertex_data.normals.length; i++) {
        vertex_data.normals[i] *= -1;
      }

      vertex_data.applyToMesh(terrain);

      terrain.computeWorldMatrix(true); 

       
    });    

}


