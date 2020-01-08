import React, { Component } from 'react'


class InfoBox extends Component {

    render() {

        return (
            <div className="info-box">
                <div id="progressbar">
                    <div id="innerbar"></div>
                </div>
                <div id="mortar-icon"><img id="package-loaded" src="textures/mortar_unlit.png"/></div>
                <div className="stats">
                    <p><b>Score: </b> <span className='values'>{this.props.guiInfo.gameScore}</span></p>
                    <p><b>Level: </b><span className='values'>{this.props.guiInfo.gameLevel + 1}</span></p>
                    <p><b>High Score: </b><span className='values'>{this.props.guiInfo.hiGameScore}</span></p>
                </div>
          </div>
        )
    }
}


export default InfoBox;