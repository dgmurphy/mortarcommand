import { headingToVector2, getAngleOriented } from "./utils";
import { hotgrid, edge, FIELD_EXTENTS,  GUTTER_WIDTH } from "./constants.js"
import * as BABYLON from '@babylonjs/core';


// Return a random steering mode (left | right | straight)
export function randomSteerMotivator() {


    // e.g. .05 => Prefer turning 95% of the time
    let goStraightPercentage = 0.5  // TODO: GUI control for weighting

    let turnPercentage = 1 - goStraightPercentage
    let turnLeftLimit = turnPercentage / 2
    let turnRightLimit = 1 - turnLeftLimit
    
    let steer = {}
    let rand = Math.random()

    if (rand < turnLeftLimit) {
        steer.left = Math.random()
        steer.right = 0
        steer.straight = 0
    } else if (rand > turnRightLimit) {
        steer.left = 0
        steer.right = Math.random()
        steer.straight = 0
    } else {
        steer.left = 0
        steer.right = 0
        steer.straight = Math.random()
    }
    
    return steer
    
}

export function moveToTargetMotivator(agentInfo) {

    let steer = seekPointMotivator(agentInfo.pos, 
        agentInfo.heading, agentInfo.targetPos) 

    return steer
}


export function locateArtifactMotivator(agentInfo) {

    let hotGridMinVal = Math.min.apply(null, agentInfo.hotGrid)  // get smallest hotgrid value

    // if my target index is no longer the minimum hotgrid value, get the new min index
    if ( agentInfo.hotGrid[agentInfo.gridTargetIdx] > hotGridMinVal ) {

        console.log("agent " + agentInfo.name + " found grid " + agentInfo.gridTargetIdx)

       /*  To prevent always finding the first min value in the hotgrid
            array, start the search at a random index. If the value is
            not found, start the search from the beginning.
        */
       let rand = Math.random() * hotgrid.ROWS * hotgrid.COLUMNS
       let startIdx = Math.floor(rand)
       let foundIdx = agentInfo.hotGrid.indexOf(hotGridMinVal, startIdx)
       if (foundIdx < 0)
           foundIdx = agentInfo.hotGrid.indexOf(hotGridMinVal) 

       agentInfo.gridTargetIdx = foundIdx

    }


    // get the XZ location of the center of cold cell
    let cellPosXZ = getCellPos(agentInfo.gridTargetIdx)
    let cellPos = new BABYLON.Vector3(cellPosXZ.x, 0, cellPosXZ.z)

    // steer towards cold cell center
    let steer = seekPointMotivator( agentInfo.pos, 
        agentInfo.heading, cellPos)
    

    return steer

}


// Move along the x-axis towards a zone
export function seekZoneMotivator(agentInfo) {

    let heading = agentInfo.heading
    let seekAxis = "-x"

    let steer = { left: 0, right: 0, straight: 0 }

    if (seekAxis === '-x') {

        if (heading > 0) {
            steer.left = (180 - heading) / 180   // from 1 to zero
        }
        else {
            steer.right = (180 + heading) / 180
        }

    } else {

        if (heading > 0) {
            steer.right = heading / 180
        } else {
            steer.left = -heading / 180
        }
    }

    return steer

}



// Motivate steering towards a point (pos and seekPoint at Vector3)
export function seekPointMotivator(pos, heading, seekPoint) {

    let steer = {left: 0, right: 0, straight: 0}

    // heading vector
    let hvec = headingToVector2(heading)

    // position to seekPoint vector
    let svec = new BABYLON.Vector2(seekPoint.x - pos.x, seekPoint.z - pos.z)
    svec = BABYLON.Vector2.Normalize(svec)

    // get angle
    let deg = getAngleOriented(hvec, svec) * (180 / Math.PI)

    // pos angle means turn left
    if ( deg > 0 ) {
        steer.left = deg / 180
    }
    else {  
        steer.right = -1 * deg / 180
    } 

    return steer
}


// motivate steering away from the edge
export function avoidEdgeMotivator(agentInfo) {
    
    let steer = {left: 0, right: 0, straight: 0}
    let h = agentInfo.heading
    let hrad = h * (Math.PI / 180)
    let dx, dz, r 

    switch (agentInfo.nearEdge) {

        case edge.PLUS_X:
            if ( (h >= -90) && (h < 90) ) {   
                dx = FIELD_EXTENTS.xMax -  agentInfo.pos.x
                r = Math.abs(dx / Math.cos(hrad))
                if (r < GUTTER_WIDTH) {
                    if (h > 0)
                        steer.left = 1 - (r / GUTTER_WIDTH)
                    else
                        steer.right = 1 - (r / GUTTER_WIDTH)
                }
            }
        break

        case edge.MINUS_X:
            if ( (h > 90) || (h < -90) ) {
                dx = FIELD_EXTENTS.xMin - agentInfo.pos.x
                r = Math.abs(dx / Math.cos(hrad))
                if (r < GUTTER_WIDTH) {
                    if (h > 90)
                        steer.right = 1 - (r / GUTTER_WIDTH)
                    else
                        steer.left = 1 - (r / GUTTER_WIDTH)
                }
            }
        break

        case edge.PLUS_Z:
            if ( (h > 0) && (h < 180) ) {
                dz = FIELD_EXTENTS.zMax - agentInfo.pos.z
                r = Math.abs( dz / Math.sin(hrad) )
                if (r < GUTTER_WIDTH) {
                    if (h < 90)
                        steer.right = 1 - (r / GUTTER_WIDTH)
                    else
                        steer.left = 1 - (r / GUTTER_WIDTH)
                }
            }
        break
        
        case edge.MINUS_Z:
            if ( (h < 0) && (h > -180) ) {
                dz = FIELD_EXTENTS.zMin - agentInfo.pos.z
                r = Math.abs( dz / Math.sin(hrad) )
                if (r < GUTTER_WIDTH) {
                    if (h > -90)
                        steer.left = 1 - (r / GUTTER_WIDTH)
                    else
                        steer.right = 1 - (r / GUTTER_WIDTH)
                }
            }
                
        break
        
        default:
            console.log("error in avoidEdgeMotivator")
                

    }

    return steer

    
}

// return center of hotGrid cell at index idx
function getCellPos(idx) {

    let zoff = idx / hotgrid.COLUMNS
    let row = Math.floor(zoff)
    let col = Math.round((zoff - row) * 4)  // round to make int
    let cellPos = { x: 0, z: 0}
    let halfCell = hotgrid.CELL_SIZE / 2

    cellPos.x = (hotgrid.extents.XMAX - halfCell) - (col * 3)
    cellPos.z = (hotgrid.extents.ZMAX - halfCell) - (row * 3)

    return cellPos
    
}