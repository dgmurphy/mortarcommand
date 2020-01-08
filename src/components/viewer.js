import React, { Component } from 'react';
import * as BABYLON from '@babylonjs/core';
import BabylonScene from '../components/babylon-scene'; // import the component above linking to file we just created.
import { GAME_PHASES } from '../components/constants.js'
import { addFireListener } from './mortars.js'
import { addDebugListener } from './lifecycle.js'
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

        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0.2, 1, 0.2), scene);
        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 1;

        this.props.setScene(scene);
        //document.getElementById('renderCanvas').focus();  

    
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
        scene.addAgentCounter = 0
        scene.gameScores = []
        scene.gameScore = 0
        scene.hiGameScore = 0
        scene.agentsDestroyed = 0
        scene.gameNumber = 1
        scene.gameLevel = 0
        scene.gamePhase = GAME_PHASES.startLevel
        scene.gameStarted  = false
        scene.packagePoints = 0
        
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

