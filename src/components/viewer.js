import React, { Component } from 'react';
import * as BABYLON from '@babylonjs/core';
import BabylonScene from '../components/babylon-scene';  
import { GAME_PHASES } from '../components/constants.js'
import { addFireListener } from './mortars.js'
import { addDebugListener } from './lifecycle.js'
import { MC_NUM_LIGHTS, MC_LIGHT1_POS, MC_LIGHT2_POS, MC_LIGHT1_INTENSITY, MC_LIGHT2_INTENSITY } from './per-table-constants.js'
import '@babylonjs/gui'
//import '@babylonjs/inspector'

export default class Viewer extends Component {


    onSceneMount = (e) => {
        const { canvas, scene, engine } = e;


        // This creates and positions a free camera (non-mesh)
        let camAlpha = 6.37
        let camBeta = 1.16
        let camRadius = 40
        const camera = new BABYLON.ArcRotateCamera("camera1", camAlpha, camBeta, camRadius, new BABYLON.Vector3(0, 2.5, 0), scene);
        camera.attachControl(canvas, true);
        
        // Constraints
        camera.lowerRadiusLimit = 0.1;
        camera.upperRadiusLimit = 100;
        //camera.lowerBetaLimit = 0.1;
        //camera.upperBetaLimit = (Math.PI / 2) * 0.9;
        camera.angularSensibilityY = 5000;
        camera.angularSensibilityX = 5000;
        camera.inertia = .8;
        camera.keysUp = []
        camera.keysDown = []
        camera.keysLeft = []
        camera.keysRight = []

	//LIGHTS
	const light1 = new BABYLON.HemisphericLight("light1", 
		new BABYLON.Vector3(MC_LIGHT1_POS[0], MC_LIGHT1_POS[1], MC_LIGHT1_POS[2]), 
		scene);
        light1.intensity = MC_LIGHT1_INTENSITY

	if (MC_NUM_LIGHTS > 1) {
		const light2 = new BABYLON.PointLight("pointLight", 
		new BABYLON.Vector3(MC_LIGHT2_POS[0], MC_LIGHT2_POS[1], MC_LIGHT2_POS[2]), 
		scene);
		light2.intensity = MC_LIGHT2_INTENSITY
	}

        this.props.setScene(scene);
   
        // init the objects lists
        scene.artifacts = []
        scene.nextArtifactId = 0
        scene.powerStations = []
        scene.wreckedStations = []
        scene.agents = []
        scene.rounds = []
        scene.roundsReady = 0
        scene.fireTargets = []
        scene.nextRoundId = 0
        scene.gameFrame = 0
        scene.gameStartFrame = 0
        scene.gameScores = []
        scene.gameScore = 0
        scene.hiGameScore = 0
        scene.agentsDestroyed = 0
        scene.gameNumber = 1
        scene.gameLevel = 0
        scene.gamePhase = GAME_PHASES.startLevel
        scene.gameStarted  = false
        scene.packagePoints = 0
        scene.mines = []
        scene.activators = []
        scene.liveStations = 0
        scene.mortarBoost = false
        
        engine.runRenderLoop(() => {
            if (scene) {
                scene.render();
            }
        });

        // make a scene ref in the canvas
        let c = document.getElementsByTagName('canvas')[0]
        c.bjsScene = scene

        addFireListener(scene)

        addDebugListener(scene)
        
    }

    render() {               
        return ( 
            <BabylonScene 
            onSceneMount={this.onSceneMount} 
            handleUpdateGUIinfo = {this.props.handleUpdateGUIinfo}
            handleAssetsLoaded = {this.props.handleAssetsLoaded}   
            enableStart = {this.props.enableStart}
            />
        )
    }
}

