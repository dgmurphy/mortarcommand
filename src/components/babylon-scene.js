//import * as BABYLON from 'babylonjs';
import React, { Component } from 'react';
import * as BABYLON from '@babylonjs/core';
import { Engine, Scene } from '@babylonjs/core';
import "@babylonjs/loaders"
import { loadAssets, addGround } from './assets-loader.js';
import { createMaterials } from './materials.js'
import { startAgentAnim } from './controllers.js';
import { addRound, addThePackage } from './agent.js'
import { makeBase} from './station.js'
import { MAX_ROUNDS } from './constants.js'
import { addPowerStations } from './station.js'


export default class BabylonScene extends Component { 

  constructor(props) {
    super(props);

    
    this.updateAssetStatus = this.updateAssetStatus.bind(this)
    this.allAssetsLoaded = this.allAssetsLoaded.bind(this)
   
    
    this.assetsLoaded = {
      terrainLoadTask: false,
      gunSoundTask: false,
      gunHitSoundTask: false,
      mortarSoundTask: false,
      mortarHitSoundTask: false,
      stationDamageSoundTask: false,
      stationDestroyedSoundTask: false,
      oreSoundTask: false,
      agentDestroyedSoundTask: false,
      insertCoinSoundTask: false,
      humSoundTask: false,
      playSoundTask: false,
      heavyMortarSoundTask: false

    }

  }
  
  onResizeWindow = () => {
    if (this.engine) {
      this.engine.resize();
      this.forceUpdate()
    }
  }

  
  allAssetsLoaded(scene) {

    /* Create other graphical game objects */

    // firing tower
    makeBase(scene)

    // mortar & gun rounds
    for (var j = 0; j < MAX_ROUNDS; ++j) {
        addRound(scene)
    }

    // the Package
    addThePackage(scene)
    
    // stations
    addPowerStations(scene)

    // agents
    startAgentAnim(scene, this.props.handleUpdateGUIinfo)

    this.props.enableStart()

  }

  updateAssetStatus( assetName, scene ) {

    this.assetsLoaded[assetName] = true
    for (const key of Object.keys(this.assetsLoaded)) {
      if (!this.assetsLoaded[key])
        return
    }

    this.allAssetsLoaded(scene)

  }



  componentDidMount () {

    this.engine = new Engine(
        this.canvas,
        true,
        this.props.engineOptions,
        this.props.adaptToDeviceRatio
    );

    let scene = new Scene(this.engine);
    this.scene = scene;
    scene.clearColor = new BABYLON.Color3(0.38, 0.36, 0.41);
    createMaterials( scene )
    
    // Load environment & terrain
    //addAxes(scene)
    addGround(scene)
    loadAssets(scene, this.updateAssetStatus)
  
    // Call the scene mounter from the Viewer
    if (typeof this.props.onSceneMount === 'function') {
      this.props.onSceneMount({
        scene,
        engine: this.engine,
        canvas: this.canvas
      });
    } else {
      console.error('onSceneMount function not available');
    }

    // Resize the babylon engine when the window is resized
    window.addEventListener('resize', this.onResizeWindow);
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.onResizeWindow);
  }

  onCanvasLoaded = (c) => {
    if (c !== null) {
      this.canvas = c;
      //console.log("CANVAS LOADED")
    }

    document.getElementsByTagName('canvas')[0].focus()
  }



  render () {
    // 'rest' can contain additional properties that you can flow through to canvas:
    // (id, className, etc.)
    const { width, height } = this.props;

    const opts = {};

    if (width !== undefined && height !== undefined) {
      opts.width = width;
      opts.height = height;
    } else {
      opts.width = window.innerWidth;
      opts.height = window.innerHeight;
    }


    return (
      <canvas
        {...opts}
        ref={this.onCanvasLoaded}
      />
    )
  }
}