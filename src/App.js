import React, { Component } from 'react';
import { render } from 'react-dom';
import './css/App.css';
//import '../node_modules/@blueprintjs/core/lib/css/blueprint.css'
import autobind from 'react-autobind';
import Viewer from './components/viewer'; 
import ControlPanel from './components/control-panel';
import { addLevelControl } from './components/lifecycle.js'
import { PACKAGE_POINTS_THRESH } from './components/constants.js'
import * as BABYLON from '@babylonjs/core';

const MC_VERSION = "12.14.2020"

class Root extends Component {

  constructor(props) {

    super(props);
    autobind(this);

    this.state = {
      
      panelHidden: false,
      debug: false,
      gameNumber: 1,
      gameScore:0,
      hiGameScore: 0,
      gameLevel: 0

    };

    this.handleHidePanel = this.handleHidePanel.bind(this)
    this.handleUpdateGUIinfo = this.handleUpdateGUIinfo.bind(this)
    this.setPackageLoaded = this.setPackageLoaded.bind(this)
    
    console.log("Mortarcommand Version: " + MC_VERSION)

  }


  setScene(scene) {
    this.scene = scene
  }



  handleHidePanel() {

    this.setState({ 
        panelHidden: true,
        debug: true})
  }

  
  handleUpdateGUIinfo() {

    if (!this.scene)
      return

    this.setState({
      gameNumber: this.scene.gameNumber,
      gameScore: this.scene.gameScore,
      hiGameScore: this.scene.hiGameScore,
      gameLevel: this.scene.gameLevel

    })

    /* enable The Package if the progress is 100% */
    if (!this.scene.thePackage.loaded) {

      let packageProgress = (this.scene.packagePoints / PACKAGE_POINTS_THRESH) * 100
      if (packageProgress > 100)
        packageProgress = 100
        
      let widthStr = "width:" + packageProgress.toFixed(0) + "%"
      document.getElementById('innerbar').setAttribute("style", widthStr);

      
      if (packageProgress >= 100) {
        this.setPackageLoaded(this.scene)
      }

    }
    
  }

  setPackageLoaded(scene) {

    scene.thePackage.loaded = true
    document.getElementById('package-loaded').src='textures/mortar_lit.png'

  }

  testAudio() {

    BABYLON.Engine.audioEngine.unlock()
    this.scene.getSoundByName("hum").play()
  }

  startGame() {

    BABYLON.Engine.audioEngine.unlock()
    this.scene.getSoundByName("insertCoin").play()
    
    //Drop loading graphics
    const lg = document.getElementById('loading-graphics');
    if(lg) {
      lg.outerHTML = '';
    }  

    

    addLevelControl(this.scene) 
  }


  enableStart() {

    //this.scene.getSoundByName("insertCoin").play()

    const loading = document.getElementById('loading-text')
    loading.style.visibility = "hidden"

    const start = document.getElementById('start')
    start.style.visibility =  "visible"
    start.onclick = this.startGame

    const testAudio = document.getElementById('sound-check')
    if (testAudio) {
    	testAudio.style.visibility =  "visible"
    	testAudio.onclick = this.testAudio
    }

    document.getElementsByTagName('canvas')[0].focus()
  }

  componentDidMount() {


  }


  render() {

    let guiInfo = {
      gameNumber: this.state.gameNumber,
      gameScore: this.state.gameScore,
      hiGameScore: this.state.hiGameScore,
      gameLevel: this.state.gameLevel
    }

    // DEBUG
    if (this.state.debug)
      if (this.scene)
        this.scene.debugLayer.show({ overlay: true });


    return (
      <div className="App">
        <ControlPanel
          panelHidden={this.state.panelHidden}
          handleHidePanel={this.handleHidePanel}
          guiInfo={guiInfo}   
        />
        <Viewer
          setScene={this.setScene}
          handleUpdateGUIinfo={this.handleUpdateGUIinfo}
          enableStart={this.enableStart}
        />
      </div>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
export default Root;
