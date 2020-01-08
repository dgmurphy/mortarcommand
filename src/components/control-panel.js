import React, { Component } from 'react'
import InfoBox from './info-box'

class ControlPanel extends Component {

    constructor(props) {
  
      super(props);

      this.hidePanel = this.hidePanel.bind(this)
    }


    hidePanel() {
      this.props.handleHidePanel()
    }

    render() {

      let panelClass = 'cpanel-visible'
      if (this.props.panelHidden)
        panelClass = 'cpanel-hide'
        
          
        return (
            <div className="app-panel">
              <div id="control-panel" className={panelClass}>
                <div className="app-title">
                  <img src='textures/mc150.png' />
                </div>
 
                <InfoBox guiInfo={this.props.guiInfo}/>

              </div>
            </div>
        );
    }


}

export default ControlPanel;