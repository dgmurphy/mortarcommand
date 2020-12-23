import * as BABYLON from '@babylonjs/core';
import { TERRAIN_MESH_NAME } from './per-table-constants.js'


export function randomRotation() {

  let axis 
  let r = Math.random()
  
  if (r < 0.33)
    axis = BABYLON.Axis.X
  else if ( r < 0.66)
    axis = BABYLON.Axis.Y
  else  
    axis = BABYLON.Axis.Z

  return new BABYLON.Quaternion.RotationAxis(axis, Math.random() * Math.PI)

}


export function getGroundElevation(x, z, scene) {

  // Find y location  on terrain
  // Casting a ray to get height
  let terrainMesh = scene.getMeshByName(TERRAIN_MESH_NAME)

  var ray = new BABYLON.Ray(new BABYLON.Vector3(x,
    terrainMesh.getBoundingInfo().boundingBox.maximumWorld.y + 1,
    z), new BABYLON.Vector3(0, -1, 0)); // Direction

  var worldInverse = new BABYLON.Matrix();

  terrainMesh.getWorldMatrix().invertToRef(worldInverse);

  ray = BABYLON.Ray.Transform(ray, worldInverse);

  var pickInfo = terrainMesh.intersects(ray);

  if (pickInfo.hit) // the xz point is over the terrain
    return pickInfo.pickedPoint.y
  else  // the xz point is not over the terrain
    return 0

}

export function getXZpos( posxyz ) {

 return new BABYLON.Vector2(posxyz.x, posxyz.z)

}

// TODO get rid of this
export function getXZRange(posxyz, posxz) {

  return BABYLON.Vector2.Distance(
    new BABYLON.Vector2(posxyz.x, posxyz.z), posxz
  )
}

export function getGroundRange(pos0xyz, pos1xyz) {

  return BABYLON.Vector2.Distance(
    getXZpos(pos0xyz), getXZpos(pos1xyz)
  )

}


export function headingToVector2(heading) {

  let hvecx = Math.cos(heading * (Math.PI / 180.0))
  let hvecz = Math.sin(heading * (Math.PI / 180.0))
  let hvec = new BABYLON.Vector2(hvecx, hvecz)
  hvec = BABYLON.Vector2.Normalize(hvec)

  return hvec

}

// 3-Vector
export function getAngle(v1, v2) {

  let dotp = BABYLON.Vector3.Dot(v1, v2)
  let lengthv1 = v1.length()
  let lengthv2 = v2.length()

  var theta = Math.acos(dotp / (lengthv1 * lengthv2))

  return theta

}

// 2-Vector
export function getAngle2(v1, v2) {

  let dotp = BABYLON.Vector2.Dot(v1, v2)
  let lengthv1 = v1.length()
  let lengthv2 = v2.length()

  var theta = Math.acos(dotp / (lengthv1 * lengthv2))

  return theta

}

// Return signed angle (-PI -> PI ) for 2-vectors
export function getAngleOriented(v1, v2) {

  // angle = atan2(x1y2−y1x2,x1x2+y1y2)
  return Math.atan2((v1.x * v2.y) - (v1.y * v2.x), (v1.x * v2.x) + (v1.y * v2.y))
}


export function addAxes(scene) {

  let hide_y = true

  var size = 60;
  var ysize = 6;

  var axisX = BABYLON.Mesh.CreateLines("axisX", [
    BABYLON.Vector3.Zero(), new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, 0.05 * size, 0),
    new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, -0.05 * size, 0)
  ], scene);
  axisX.color = new BABYLON.Color3(1, 0, 0);


  var axisZ = BABYLON.Mesh.CreateLines("axisZ", [
    BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, -0.05 * size, size * 0.95),
    new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, 0.05 * size, size * 0.95)
  ], scene);
  axisZ.color = new BABYLON.Color3(0, 0, 1);

  if (hide_y)
    return

  var axisY = BABYLON.Mesh.CreateLines("axisY", [
    BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, ysize, 0), new BABYLON.Vector3(-0.05 * ysize, ysize * 0.95, 0),
    new BABYLON.Vector3(0, ysize, 0), new BABYLON.Vector3(0.05 * ysize, ysize * 0.95, 0)
  ], scene);
  axisY.color = new BABYLON.Color3(0, 1, 0);

}


//  https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
export function randn_bm(min, max, skew) {
  var u = 0, v = 0;
  while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while(v === 0) v = Math.random();
  let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );

  num = num / 10.0 + 0.5; // Translate to 0 -> 1
  if (num > 1 || num < 0) num = randn_bm(min, max, skew); // resample between 0 and 1 if out of range
  num = Math.pow(num, skew); // Skew
  num *= max - min; // Stretch to fill range
  num += min; // offset to min
  return num;
}
